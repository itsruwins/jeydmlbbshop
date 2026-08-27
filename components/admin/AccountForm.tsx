"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Field, describedBy } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { createAccount } from "@/functions/accounts/createAccount";
import { generateAccountReference } from "@/functions/accounts/generateAccountReference";
import { updateAccount } from "@/functions/accounts/updateAccount";
import { formatPrice } from "@/lib/utils/format";
import {
  installmentPlan,
  normaliseInstallmentPercents,
} from "@/lib/utils/installment";
import type { AccountFieldErrors } from "@/schemas/accountSchema";
import {
  ACCOUNT_STATUSES,
  INSTALLMENT_PERCENTS,
  STATUS_LABELS,
  type AccountStatus,
  type AccountWithRelations,
  type InstallmentPercent,
} from "@/types/account";
import type { CollectionLevel } from "@/types/collectionLevel";
import type { Rank } from "@/types/rank";

import { CollectionLevelSelect } from "./CollectionLevelSelect";
import { RankSelect } from "./RankSelect";

/** Form state is all strings — that is what inputs produce. Zod converts. */
type FormState = {
  account_reference: string;
  price: string;
  rank_id: string;
  collection_level_id: string;
  server: string;
  hero_count: string;
  skin_count: string;
  status: AccountStatus;
  is_featured: boolean;
  installment_available: boolean;
  /** Percentages, not pesos — the peso figures are derived from the price. */
  installment_percents: InstallmentPercent[];
};

function initialState(
  account: AccountWithRelations | null,
  suggestedReference: string,
): FormState {
  if (!account) {
    return {
      account_reference: suggestedReference,
      price: "",
      rank_id: "",
      collection_level_id: "",
      server: "",
      hero_count: "",
      skin_count: "",
      // New listings start hidden so a half-finished draft cannot reach the
      // public marketplace by accident. Publishing is a deliberate act.
      status: "hidden",
      is_featured: false,
      installment_available: false,
      installment_percents: [],
    };
  }

  const text = (value: string | number | null) =>
    value === null || value === undefined ? "" : String(value);

  return {
    account_reference: account.account_reference,
    price: text(account.price),
    rank_id: account.rank_id ?? "",
    collection_level_id: account.collection_level_id ?? "",
    server: account.server ?? "",
    hero_count: text(account.hero_count),
    skin_count: text(account.skin_count),
    status: account.status,
    is_featured: account.is_featured,
    installment_available: account.installment_available,
    // Cleaned on the way in as well as on the way out: a row edited by hand in
    // Supabase can hold anything the CHECK constraint allows, in any order.
    installment_percents: normaliseInstallmentPercents(
      account.installment_percents,
    ),
  };
}

export function AccountForm({
  account,
  ranks,
  collectionLevels,
  suggestedReference = "",
}: {
  account: AccountWithRelations | null;
  ranks: Rank[];
  collectionLevels: CollectionLevel[];
  suggestedReference?: string;
}) {
  const isEdit = account !== null;

  const [values, setValues] = useState<FormState>(() =>
    initialState(account, suggestedReference),
  );
  const [errors, setErrors] = useState<AccountFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();
  const [regenerating, startRegenerate] = useTransition();

  const router = useRouter();
  const toast = useToast();

  // Featuring promises the homepage's best space to something a buyer can
  // actually act on, so it is only offered while the listing is available.
  const canFeature = values.status === "available";

  /* The price as a number, for the downpayment preview only — never for
     validation, which is the schema's job. Anything that is not a usable
     figure yields null and the options say "Enter a price" rather than
     computing a percentage of NaN. */
  const parsedPrice = Number(values.price);
  const previewPrice =
    values.price.trim() !== "" && Number.isFinite(parsedPrice) && parsedPrice > 0
      ? parsedPrice
      : null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    // Clearing the error as soon as the field is touched means the message
    // disappears when the person acts on it, not when they submit again.
    if (errors[key as keyof AccountFieldErrors]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  const togglePercent = (percent: InstallmentPercent) => {
    const next = values.installment_percents.includes(percent)
      ? values.installment_percents.filter((value) => value !== percent)
      : [...values.installment_percents, percent];
    // Kept in ladder order so the form, the listing page and the database row
    // all read 50 → 70 → 80 regardless of the order the boxes were ticked in.
    set("installment_percents", normaliseInstallmentPercents(next));
  };

  const regenerate = () => {
    startRegenerate(async () => {
      const next = await generateAccountReference();
      set("account_reference", next);
    });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    startTransition(async () => {
      if (isEdit) {
        const result = await updateAccount(account.id, values);

        if (!result.ok) {
          setErrors(result.fieldErrors ?? {});
          setFormError(result.message);
          return;
        }

        toast.success("Changes saved.");
        router.refresh();
        return;
      }

      const result = await createAccount(values);

      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.message);
        return;
      }

      // Straight to the edit screen, which is where screenshots are added.
      // Images need the listing's id for their Storage path, so the row has to
      // exist before any file can be uploaded.
      toast.success("Listing created. Add its screenshots below.");
      router.push(`/admin/accounts/${result.id}/edit`);
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      {formError && (
        <p
          role="alert"
          className="rounded-[var(--radius)] border border-[var(--danger-border)] bg-danger-bg px-3.5 py-3 text-[length:var(--text-sm)] text-danger-ink"
        >
          {formError}
        </p>
      )}

      <Section title="Listing">
        <Field
          id="account_reference"
          label="Account reference"
          required={!isEdit}
          error={errors.account_reference}
          hint={
            isEdit
              ? "This is the listing's public web address, so it cannot be changed."
              : "Auto-generated, and permanent once saved. Edit it now if you want your own code."
          }
        >
          <div className="flex gap-2">
            <Input
              id="account_reference"
              value={values.account_reference}
              onChange={(event) => set("account_reference", event.target.value)}
              // The reference is the public URL (/accounts/J7). Editing
              // it later would break every link already shared on social media
              // and every code a buyer has quoted back, so it is fixed at
              // creation. Read-only rather than hidden: it still has to be
              // visible and copyable here.
              readOnly={isEdit}
              invalid={Boolean(errors.account_reference)}
              aria-describedby={describedBy("account_reference", {
                error: errors.account_reference,
                hasHint: true,
              })}
              className="font-mono"
              autoComplete="off"
              spellCheck={false}
            />
            {!isEdit && (
              <Button
                variant="secondary"
                onClick={regenerate}
                loading={regenerating}
                loadingLabel="…"
                className="shrink-0"
              >
                Regenerate
              </Button>
            )}
          </div>
        </Field>

        <Field
          id="price"
          label="Price"
          required
          error={errors.price}
          hint="Whole pesos, no decimals."
        >
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
            >
              ₱
            </span>
            <Input
              id="price"
              inputMode="numeric"
              value={values.price}
              onChange={(event) => set("price", event.target.value)}
              invalid={Boolean(errors.price)}
              aria-describedby={describedBy("price", {
                error: errors.price,
                hasHint: true,
              })}
              className="tabular pl-7"
            />
          </div>
        </Field>
      </Section>

      <Section title="Payment">
        {/* Not a `<Field>`: that renders a `<label htmlFor>`, and this group has
            no single control for a label to point at — it is a checkbox that
            governs three buttons. The checkbox carries its own label, the
            buttons are a labelled group, and the hint and error are rendered
            here in the same places `<Field>` would put them. */}
        <div className="flex flex-col gap-1.5">
          {/* The flag and the terms are one control, not two fields that happen
              to be near each other: the percentages have no meaning without the
              flag, and the flag has none without them. So the options live
              inside the checkbox's own panel and only exist while it is on.

              Unticking does not clear the choice from the form state. Someone
              who unticks by accident and ticks again finds their percentages
              where they left them; what is *saved* is emptied by the schema, so
              the row never carries terms it is not offering. */}
          <div className="flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-surface-2 p-3.5">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={values.installment_available}
                onChange={(event) => {
                  set("installment_available", event.target.checked);
                  // The message asked for a downpayment on an open listing.
                  // Closing it is one of the two ways to answer, so it should
                  // take the message with it.
                  if (!event.target.checked) {
                    setErrors((current) => ({
                      ...current,
                      installment_percents: undefined,
                    }));
                  }
                }}
                className="mt-0.5 size-4 accent-[var(--accent)]"
              />
              <span className="font-medium text-ink">Open for installment</span>
            </label>

            {values.installment_available && (
              <div className="flex flex-col gap-2">
                <p
                  id="installment-options-label"
                  className="text-[length:var(--text-sm)] text-ink-3"
                >
                  Downpayment required — choose every option you will accept.
                </p>

                <div
                  role="group"
                  aria-labelledby="installment-options-label"
                  aria-describedby={
                    errors.installment_percents
                      ? "installment_percents-error"
                      : undefined
                  }
                  className="grid gap-2 sm:grid-cols-3"
                >
                  {INSTALLMENT_PERCENTS.map((percent) => {
                    const active = values.installment_percents.includes(percent);
                    const plan =
                      previewPrice === null
                        ? null
                        : installmentPlan(previewPrice, percent);

                    return (
                      <button
                        key={percent}
                        type="button"
                        aria-pressed={active}
                        onClick={() => togglePercent(percent)}
                        className={[
                          "flex min-h-11 flex-col items-start justify-center gap-0.5 rounded-[var(--radius)] border px-3 py-2 text-left",
                          "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]",
                          active
                            ? "border-accent bg-accent-soft"
                            : "border-[var(--border-strong)] hover:border-ink-3",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "tabular font-semibold leading-none",
                            active ? "text-accent-ink" : "text-ink",
                          ].join(" ")}
                        >
                          {percent}%
                        </span>
                        {/* The figures are why these are ticked rather than
                            typed: the admin sets a price and immediately sees
                            what each option asks for. */}
                        <span className="tabular text-[length:var(--text-xs)] leading-none text-ink-3">
                          {plan
                            ? `${formatPrice(plan.down)} down · ${formatPrice(plan.balance)} left`
                            : "Enter a price"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {errors.installment_percents ? (
            <p
              id="installment_percents-error"
              role="alert"
              className="text-[length:var(--text-sm)] text-danger-ink"
            >
              {errors.installment_percents}
            </p>
          ) : (
            <p className="text-[length:var(--text-sm)] text-ink-3">
              Buyers pay the downpayment to reserve the account, and the balance
              on handover.
            </p>
          )}
        </div>
      </Section>

      <Section title="Account details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="rank_id" label="Rank" required error={errors.rank_id}>
            <RankSelect
              id="rank_id"
              name="rank_id"
              value={values.rank_id}
              ranks={ranks}
              invalid={Boolean(errors.rank_id)}
              describedBy={describedBy("rank_id", { error: errors.rank_id })}
              onChange={(value) => set("rank_id", value)}
            />
          </Field>

          <Field
            id="collection_level_id"
            label="Collection level"
            required
            error={errors.collection_level_id}
          >
            <CollectionLevelSelect
              id="collection_level_id"
              name="collection_level_id"
              value={values.collection_level_id}
              levels={collectionLevels}
              invalid={Boolean(errors.collection_level_id)}
              describedBy={describedBy("collection_level_id", {
                error: errors.collection_level_id,
              })}
              onChange={(value) => set("collection_level_id", value)}
            />
          </Field>

          <Field
            id="server"
            label="ID & Server"
            error={errors.server}
            hint="Optional. In-game ID with the server in brackets."
          >
            <Input
              id="server"
              value={values.server}
              onChange={(event) => set("server", event.target.value)}
              invalid={Boolean(errors.server)}
              aria-describedby={describedBy("server", {
                error: errors.server,
                hasHint: true,
              })}
              placeholder="e.g. 123456789 (2001)"
            />
          </Field>

          <Field id="hero_count" label="Heroes" error={errors.hero_count}>
            <Input
              id="hero_count"
              inputMode="numeric"
              value={values.hero_count}
              onChange={(event) => set("hero_count", event.target.value)}
              invalid={Boolean(errors.hero_count)}
              aria-describedby={describedBy("hero_count", {
                error: errors.hero_count,
              })}
              className="tabular"
            />
          </Field>

          <Field id="skin_count" label="Skins" error={errors.skin_count}>
            <Input
              id="skin_count"
              inputMode="numeric"
              value={values.skin_count}
              onChange={(event) => set("skin_count", event.target.value)}
              invalid={Boolean(errors.skin_count)}
              aria-describedby={describedBy("skin_count", {
                error: errors.skin_count,
              })}
              className="tabular"
            />
          </Field>
        </div>

      </Section>

      <Section title="Visibility">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="status"
            label="Status"
            required
            error={errors.status}
            hint={
              values.status === "hidden"
                ? "Hidden listings are not shown to buyers."
                : "Visible on the public marketplace."
            }
          >
            <Select
              id="status"
              value={values.status}
              invalid={Boolean(errors.status)}
              aria-describedby={describedBy("status", {
                error: errors.status,
                hasHint: true,
              })}
              onChange={(event) =>
                set("status", event.target.value as AccountStatus)
              }
            >
              {ACCOUNT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          </Field>

          <div className="flex items-end">
            {/* Only an available listing can be featured, so the control is
                disabled rather than left enabled and silently overridden on
                save. The reason is stated where the control is. */}
            <label
              className={
                canFeature
                  ? "flex cursor-pointer items-start gap-2.5 rounded-[var(--radius)] py-2"
                  : "flex items-start gap-2.5 rounded-[var(--radius)] py-2 opacity-60"
              }
            >
              <input
                type="checkbox"
                checked={canFeature && values.is_featured}
                disabled={!canFeature}
                onChange={(event) => set("is_featured", event.target.checked)}
                className="mt-0.5 size-4 accent-[var(--accent)] disabled:cursor-not-allowed"
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-medium text-ink">Feature this listing</span>
                <span className="text-[length:var(--text-sm)] text-ink-3">
                  {canFeature
                    ? "Featured listings are highlighted on the homepage."
                    : `A ${STATUS_LABELS[values.status].toLowerCase()} listing cannot be featured.`}
                </span>
              </span>
            </label>
          </div>
        </div>
      </Section>

      <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
        <Link href="/admin/accounts">
          <Button variant="secondary" className="w-full sm:w-auto">
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          variant="primary"
          loading={saving}
          loadingLabel={isEdit ? "Saving…" : "Creating…"}
          className="w-full sm:w-auto"
        >
          {isEdit ? "Save changes" : "Create listing"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[length:var(--text-sm)] font-medium tracking-[0.005em] text-ink-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

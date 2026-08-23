"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Field, describedBy } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { createSocialLink } from "@/functions/socialLinks/createSocialLink";
import { updateSocialLink } from "@/functions/socialLinks/updateSocialLink";
import {
  contactUrl,
  suggestMessengerUrl,
  supportsPrefill,
} from "@/lib/utils/contactUrl";
import {
  SOCIAL_PLATFORMS,
  type SocialLinkFieldErrors,
} from "@/schemas/socialLinkSchema";
import type { SocialLink } from "@/types/socialLink";

type FormState = {
  platform: string;
  label: string;
  url: string;
  is_active: boolean;
};

/**
 * Add or edit one social destination.
 *
 * The form previews what the CTA button will actually open. A Facebook page URL
 * is rewritten to a Messenger deep link at render time, and only some platforms
 * accept a pre-filled message — both are invisible decisions the admin would
 * otherwise have to discover by clicking the live button on the public site.
 */
export function SocialLinkForm({
  link,
  onDone,
  onCancel,
}: {
  link?: SocialLink;
  onDone: () => void;
  onCancel: () => void;
}) {
  const isEdit = link !== undefined;

  const [values, setValues] = useState<FormState>({
    platform: link?.platform ?? "",
    label: link?.label?.trim() ?? "",
    url: link?.url ?? "",
    is_active: link?.is_active ?? true,
  });
  const [errors, setErrors] = useState<SocialLinkFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();

  const router = useRouter();
  const toast = useToast();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      // Choosing a platform fills the button label, since they are the same
      // word almost every time. Still editable — "Chat on WhatsApp" is a
      // perfectly good label.
      if (key === "platform" && !current.label.trim()) {
        next.label = String(value);
      }
      return next;
    });
    if (errors[key as keyof SocialLinkFieldErrors]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    startTransition(async () => {
      const result = isEdit
        ? await updateSocialLink(link.id, values)
        : await createSocialLink(values);

      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.message);
        return;
      }

      toast.success(isEdit ? "Link saved." : "Link added.");
      router.refresh();
      onDone();
    });
  };

  const trimmedUrl = values.url.trim();
  const preview = trimmedUrl
    ? contactUrl(trimmedUrl, "Hi! I'm interested in account J1.")
    : "";

  // Offered, never applied. Whether m.me works depends on the destination
  // being a Facebook Page, which the URL alone cannot tell us — so the admin
  // tests it and decides.
  const messengerSuggestion = trimmedUrl ? suggestMessengerUrl(trimmedUrl) : null;

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface p-4 sm:p-5"
      noValidate
    >
      <h2 className="font-semibold text-ink">
        {isEdit ? "Edit link" : "Add a social link"}
      </h2>

      {formError && (
        <p
          role="alert"
          className="rounded-[var(--radius)] border border-[var(--danger-border)] bg-danger-bg px-3.5 py-3 text-[length:var(--text-sm)] text-danger-ink"
        >
          {formError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="platform" label="Platform" required error={errors.platform}>
          <Select
            id="platform"
            value={values.platform}
            invalid={Boolean(errors.platform)}
            aria-describedby={describedBy("platform", { error: errors.platform })}
            onChange={(event) => set("platform", event.target.value)}
          >
            <option value="">Choose a platform…</option>
            {SOCIAL_PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="label"
          label="Button label"
          required
          error={errors.label}
          hint="Shown as “Message us on …”."
        >
          <Input
            id="label"
            value={values.label}
            onChange={(event) => set("label", event.target.value)}
            invalid={Boolean(errors.label)}
            aria-describedby={describedBy("label", {
              error: errors.label,
              hasHint: true,
            })}
            placeholder="Facebook"
          />
        </Field>
      </div>

      <Field
        id="url"
        label="Link"
        required
        error={errors.url}
        hint="The full address, starting with https://"
      >
        <Input
          id="url"
          type="url"
          inputMode="url"
          value={values.url}
          onChange={(event) => set("url", event.target.value)}
          invalid={Boolean(errors.url)}
          aria-describedby={describedBy("url", {
            error: errors.url,
            hasHint: true,
          })}
          placeholder="https://www.facebook.com/yourpage"
          autoComplete="off"
          spellCheck={false}
        />
      </Field>

      {preview && (
        <div className="flex flex-col gap-1.5 rounded-[var(--radius)] bg-surface-2 px-3.5 py-3">
          <span className="text-[length:var(--text-xs)] text-ink-3">
            The button will open
          </span>
          <a
            href={preview}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-mono text-[length:var(--text-sm)] text-accent-ink underline underline-offset-2"
          >
            {preview}
          </a>
          <span className="text-[length:var(--text-sm)] text-ink-3">
            {supportsPrefill(trimmedUrl)
              ? "The buyer's message will be typed in for them."
              : "This platform cannot pre-fill a message, so buyers use the copy-reference button instead."}
          </span>
        </div>
      )}

      {messengerSuggestion && (
        <div className="flex flex-col gap-2 rounded-[var(--radius)] border border-[var(--accent-border)] bg-accent-soft px-3.5 py-3">
          <p className="text-[length:var(--text-sm)] text-ink">
            This link opens your Facebook page, where a buyer still has to find
            the Message button. If this is a Facebook{" "}
            <strong className="font-medium">Page</strong>, this opens a chat
            straight away instead:
          </p>

          <a
            href={messengerSuggestion}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-mono text-[length:var(--text-sm)] text-accent-ink underline underline-offset-2"
          >
            {messengerSuggestion}
          </a>

          <p className="text-[length:var(--text-sm)] text-ink-2">
            Open it in a private window first. It only works for Pages — on a
            personal profile it shows “This content isn’t available right now”,
            and buyers would hit a dead end.
          </p>

          <div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => set("url", messengerSuggestion)}
            >
              Use this link instead
            </Button>
          </div>
        </div>
      )}

      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={values.is_active}
          onChange={(event) => set("is_active", event.target.checked)}
          className="size-4 accent-[var(--accent)]"
        />
        <span className="text-ink-2">Show this link on the website</span>
      </label>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={saving}
          loadingLabel={isEdit ? "Saving…" : "Adding…"}
        >
          {isEdit ? "Save link" : "Add link"}
        </Button>
      </div>
    </form>
  );
}

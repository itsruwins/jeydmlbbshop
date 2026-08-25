"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ICONS, IconButton } from "@/components/ui/IconButton";
import { useToast } from "@/components/ui/Toast";
import { deleteSocialLink } from "@/functions/socialLinks/deleteSocialLink";
import { setSocialLinkActive } from "@/functions/socialLinks/setSocialLinkActive";
import { updateSocialLinkOrder } from "@/functions/socialLinks/updateSocialLinkOrder";
import { cn } from "@/lib/utils/cn";
import { contactUrl } from "@/lib/utils/contactUrl";
import type { SocialLink } from "@/types/socialLink";

import { SocialLinkForm } from "./SocialLinkForm";

/**
 * Manage where the site sends people.
 *
 * Two kinds of row share this list. Contact links are the "Message us on …"
 * buttons; follow links are the icons that go to a profile. They are kept in
 * one list rather than two because they share an order and an on/off switch,
 * and because seeing them together is what makes it obvious when the shop has
 * three feeds and no inbox.
 *
 * Order is the feature that needs explaining, so the list explains it: the
 * first active *contact* link is labelled as the primary button, because that
 * is what decides which platform carries every conversation on the site. A
 * follow link never takes that role no matter how high it sits.
 *
 * Reordering uses move buttons rather than drag-and-drop, for the same reason
 * as the image gallery — drag is unusable by keyboard and awkward on a phone.
 */
export function SocialLinksManager({ links }: { links: SocialLink[] }) {
  const [items, setItems] = useState(links);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SocialLink | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();

  const router = useRouter();
  const toast = useToast();

  // Keep in step when the server sends a fresh list after a mutation.
  const [syncedLinks, setSyncedLinks] = useState(links);
  if (syncedLinks !== links) {
    setSyncedLinks(links);
    setItems(links);
  }

  const primaryId = items.find(
    (item) => item.is_active && item.kind === "contact",
  )?.id;

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];

    const previous = items;
    setItems(next);
    setBusyId(next[target].id);

    void (async () => {
      const result = await updateSocialLinkOrder(next.map((item) => item.id));
      if (!result.ok) {
        setItems(previous);
        toast.error(result.message);
      } else {
        router.refresh();
      }
      setBusyId(null);
    })();
  };

  const toggleActive = (link: SocialLink) => {
    const next = !link.is_active;
    const previous = items;

    setItems((current) =>
      current.map((item) =>
        item.id === link.id ? { ...item, is_active: next } : item,
      ),
    );
    setBusyId(link.id);

    void (async () => {
      const result = await setSocialLinkActive(link.id, next);
      if (!result.ok) {
        setItems(previous);
        toast.error(result.message);
      } else {
        router.refresh();
      }
      setBusyId(null);
    })();
  };

  const confirmDelete = () => {
    const link = pendingDelete;
    if (!link) return;
    setDeleteError(null);

    startDelete(async () => {
      const result = await deleteSocialLink(link.id);
      if (!result.ok) {
        setDeleteError(result.message);
        return;
      }
      setItems((current) => current.filter((item) => item.id !== link.id));
      setPendingDelete(null);
      toast.success("Link deleted.");
      router.refresh();
    });
  };

  // Only contact links are counted: a page full of follow icons and no way to
  // message anyone is the failure this warning exists to catch.
  const activeContactCount = items.filter(
    (item) => item.is_active && item.kind === "contact",
  ).length;

  return (
    <div className="flex flex-col gap-5">
      {activeContactCount === 0 && (
        <p
          role="status"
          className="rounded-[var(--radius)] border border-[var(--danger-border)] bg-danger-bg px-3.5 py-3 text-[length:var(--text-sm)] text-danger-ink"
        >
          No active contact links, so every “Message us” button on the site is
          currently hidden. Buyers and sellers have no way to reach you — follow
          icons send people to a feed, not to an inbox.
        </p>
      )}

      {items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface">
          <EmptyState
            title="No social links yet"
            description="Add the account you want buyers and sellers to message. The first one becomes the main button on every listing — the feeds you post to can go in afterwards."
            action={<Button variant="primary" onClick={() => setAdding(true)}>Add a link</Button>}
          />
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((link, index) => {
            const isPrimary = link.id === primaryId;

            return (
              <li
                key={link.id}
                className={cn(
                  "flex flex-col gap-3 rounded-[var(--radius-lg)] border bg-surface p-3.5 sm:flex-row sm:items-center",
                  isPrimary ? "border-accent-border" : "border-[var(--border)]",
                  busyId === link.id && "opacity-60",
                  !link.is_active && "opacity-70",
                )}
              >
                <div className="flex shrink-0 gap-0.5">
                  <IconButton
                    label={`Move ${link.label || link.platform} up`}
                    disabled={index === 0 || busyId !== null}
                    onClick={() => move(index, -1)}
                  >
                    {ICONS.chevronUp}
                  </IconButton>
                  <IconButton
                    label={`Move ${link.label || link.platform} down`}
                    disabled={index === items.length - 1 || busyId !== null}
                    onClick={() => move(index, 1)}
                  >
                    {ICONS.chevronDown}
                  </IconButton>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">
                      {link.label?.trim() || link.platform}
                    </span>
                    {link.label?.trim() &&
                      link.label.trim() !== link.platform && (
                        <span className="text-[length:var(--text-sm)] text-ink-3">
                          {link.platform}
                        </span>
                      )}
                    {isPrimary && (
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[length:var(--text-xs)] font-medium text-accent-ink">
                        Main button
                      </span>
                    )}
                    {link.kind === "follow" && (
                      <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[length:var(--text-xs)] text-ink-2">
                        Follow icon
                      </span>
                    )}
                    {!link.is_active && (
                      <span className="rounded-full border border-dashed border-[var(--border-strong)] px-2 py-0.5 text-[length:var(--text-xs)] text-ink-3">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[length:var(--text-sm)] text-ink-3">
                    {link.kind === "follow" ? link.url : contactUrl(link.url, "")}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId !== null}
                    onClick={() => toggleActive(link)}
                  >
                    {link.is_active ? "Hide" : "Show"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId !== null}
                    onClick={() => {
                      setAdding(false);
                      setEditing(link);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busyId !== null}
                    className="text-ink-3 hover:text-danger-ink"
                    onClick={() => {
                      setDeleteError(null);
                      setPendingDelete(link);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <SocialLinkForm
          link={editing}
          onDone={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      )}

      {adding && (
        <SocialLinkForm
          onDone={() => setAdding(false)}
          onCancel={() => setAdding(false)}
        />
      )}

      {!adding && !editing && items.length > 0 && (
        <div>
          <Button variant="secondary" onClick={() => setAdding(true)}>
            Add another link
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this link?"
        confirmLabel="Delete link"
        confirmingLabel="Deleting…"
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      >
        <p>
          <span className="font-medium text-ink">
            {pendingDelete?.label?.trim() || pendingDelete?.platform}
          </span>{" "}
          will be removed from the site. If you only want to take it down for
          now, use Hide instead — that keeps the link so you can bring it back.
        </p>
      </ConfirmDialog>
    </div>
  );
}


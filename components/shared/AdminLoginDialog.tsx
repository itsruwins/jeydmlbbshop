"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { LoginForm } from "@/components/admin/LoginForm";

/**
 * The unmarked door to the admin.
 *
 * `Ctrl+M` anywhere on the storefront opens the sign-in dialog. There is no
 * button, no footer link and nothing in the navigation, because the shop has
 * exactly one administrator and a visible "Admin" link is furniture for
 * everyone else.
 *
 * ## Ctrl, not Cmd, on a Mac too
 *
 * `Cmd+M` minimises the window on macOS. That is handled by the operating
 * system before the keystroke reaches the document, so a page cannot see it,
 * let alone cancel it — the dialog would never open and the window would
 * vanish instead. `Ctrl` is very nearly unused by macOS browsers, so the same
 * chord works on both platforms and there is nothing to remember per machine.
 *
 * Also ruled out: `Cmd+Shift+M` switches Chrome profiles.
 *
 * ## What this is not
 *
 * It is not a security measure, and nothing here should be relied on as one.
 * `/admin/login` stays publicly reachable — the proxy sends every signed-out
 * request there — so anyone who guesses the path finds the same form. The
 * protection is the password, the `profiles.role` check in `loginAdmin`, and
 * Row Level Security in the database. This only saves typing a URL.
 *
 * ## Why the same form as the page
 *
 * `LoginForm` is imported rather than reimplemented. Two sign-in forms is two
 * places to fix an autocomplete attribute, and the one that gets missed is
 * always the one nobody looks at. The server action redirects on success, so
 * a submission from here lands on the dashboard exactly as it does from the
 * page.
 */

/** True while the keystroke belongs to something the visitor is typing into. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

export function AdminLoginDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // `ctrlKey` alone: Ctrl+Alt+M and Ctrl+Shift+M are other people's
      // shortcuts, and metaKey would make this Cmd+Ctrl+M.
      if (
        event.key.toLowerCase() !== "m" ||
        !event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.repeat ||
        isTyping(event.target)
      ) {
        return;
      }

      event.preventDefault();
      setOpen((current) => !current);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();

      // `showModal()` focuses the first focusable descendant, which is the
      // close button — the dialog opens with the way out selected rather than
      // the field you came here to type in. React applies `autoFocus` by
      // calling focus() on mount, without leaving the attribute behind for the
      // dialog's own focusing steps to find, so the fix has to be explicit.
      dialog.querySelector("input")?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="admin-login-title"
      // Escape fires `cancel`, the close button and the backdrop fire `close`.
      // Both end in the same place, so React's state cannot fall out of step
      // with whether the dialog is actually showing.
      onCancel={close}
      onClose={close}
      // A click that lands on the dialog element itself rather than on any of
      // its children is a click on the backdrop.
      onClick={(event) => {
        if (event.target === ref.current) close();
      }}
      // The dialog element is only a positioning box here: no background, no
      // border, and `overflow-visible` so the close button can hang outside
      // the card without being clipped. The card below carries the surface.
      className={[
        "m-auto overflow-visible bg-transparent p-0",
        "backdrop:bg-[var(--scrim)] motion-safe:animate-[pop-in_var(--dur)_var(--ease-out)]",
      ].join(" ")}
    >
      {/* Mounted only while open, so the password field is not sitting in the
          DOM of every storefront page waiting to be autofilled, and so each
          opening starts from a clean form rather than the last attempt's
          error. */}
      {open && (
        <div className="relative w-[min(23rem,calc(100vw-2.5rem))]">
          {/* Floating outside the card, on the scrim, rather than tucked into
              a corner of it. Inside, it would compete with the form for the
              same few square inches and read as part of it; out here it is
              plainly the way out of the whole thing.

              It stays inside <dialog>, so the platform's focus trap still
              covers it — a close button that focus cannot reach is worse than
              no close button. Escape and a backdrop click do the same job for
              anyone who never looks up here. */}
          <button
            type="button"
            onClick={close}
            className={[
              "absolute -top-13 right-0 grid size-11 place-items-center rounded-full",
              "border border-[var(--border)] bg-[var(--surface-translucent)] text-ink-2 backdrop-blur-md",
              "transition-[color,background-color,border-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
              "hover:border-[var(--border-strong)] hover:bg-surface-2 hover:text-ink",
              "motion-safe:active:scale-90",
            ].join(" ")}
          >
            <svg
              viewBox="0 0 20 20"
              className="size-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" />
            </svg>
            <span className="sr-only">Close</span>
          </button>

          <div className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface p-6 text-ink shadow-[var(--shadow-dialog)]">
            <div className="flex flex-col gap-1.5">
              <h2
                id="admin-login-title"
                className="text-[length:var(--text-lg)] font-semibold tracking-[-0.005em] text-ink"
              >
                Sign in
              </h2>
              <p className="text-[length:var(--text-sm)] leading-relaxed text-ink-3">
                Administrator access to the account catalogue.
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      )}
    </dialog>
  );
}

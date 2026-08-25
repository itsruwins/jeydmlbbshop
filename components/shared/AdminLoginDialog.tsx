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
      className={[
        "m-auto w-[min(22rem,calc(100vw-2rem))] rounded-[var(--radius-lg)] p-0",
        "border border-[var(--border)] bg-surface text-ink shadow-[var(--shadow-dialog)]",
        "backdrop:bg-[var(--scrim)] motion-safe:animate-[pop-in_var(--dur)_var(--ease-out)]",
      ].join(" ")}
    >
      {/* Mounted only while open, so the password field is not sitting in the
          DOM of every storefront page waiting to be autofilled, and so each
          opening starts from a clean form rather than the last attempt's
          error. */}
      {open && (
        <div className="flex flex-col gap-5 p-5">
          <div className="flex flex-col gap-1">
            <h2
              id="admin-login-title"
              className="text-[length:var(--text-md)] font-semibold text-ink"
            >
              Sign in
            </h2>
            <p className="text-[length:var(--text-sm)] text-ink-3">
              Administrator access to the account catalogue.
            </p>
          </div>

          <LoginForm />
        </div>
      )}
    </dialog>
  );
}

"use client";

import { useState, type InputHTMLAttributes } from "react";

import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

/**
 * A password field with a reveal toggle and a Caps Lock warning.
 *
 * ## The toggle
 *
 * It is a `<button type="button">`, which matters more than it looks: inside a
 * form, a button with no type submits it, so the first thing a reveal control
 * of the naive kind does is try to sign you in with half a password.
 *
 * The toggle flips the input's `type`, which browsers treat as a new control —
 * password managers cope with this fine, but the *name* has to stay put, so
 * nothing else about the input changes with it.
 *
 * Its accessible name changes with its state ("Show password" → "Hide
 * password") rather than staying fixed and relying on `aria-pressed` alone.
 * Both are set: the name says what pressing it does, the pressed state says
 * where it is now.
 *
 * ## Caps Lock
 *
 * A wrong password is indistinguishable from a right one typed in capitals,
 * and the field hides the evidence by design. The note only exists while the
 * key is on, so it costs nothing the rest of the time.
 *
 * It cannot be detected until a key is pressed — the browser exposes the state
 * through keyboard events and nowhere else — so it appears on the first
 * keystroke rather than on focus. Reading it from the event means it clears
 * correctly when the key is turned off, including on the release.
 */
const EYE = (
  <>
    <path d="M2 10c2-3.3 4.7-5 8-5s6 1.7 8 5c-2 3.3-4.7 5-8 5s-6-1.7-8-5Z" />
    <circle cx="10" cy="10" r="2.4" />
  </>
);

export function PasswordInput({
  id,
  invalid,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { id: string; invalid?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const readCapsLock = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(event.getModifierState("CapsLock"));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          invalid={invalid}
          onKeyDown={readCapsLock}
          onKeyUp={readCapsLock}
          onBlur={() => setCapsLock(false)}
          // Room for the toggle, so a long password never runs underneath it.
          className={cn("pr-11", className)}
          {...props}
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-pressed={visible}
          aria-controls={id}
          className={cn(
            "absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center",
            "rounded-[var(--radius-sm)] text-ink-3",
            "transition-[color,background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out)]",
            "hover:bg-surface-3 hover:text-ink motion-safe:active:scale-90",
            // The 44px tap area, written out rather than using `.hit-target`.
            // That utility hardcodes `position: relative`, which beats the
            // `absolute` above and drops the button out of the field entirely.
            // A pseudo-element needs *a* positioned ancestor, and `absolute`
            // is one, so the trick works here — only the utility's own
            // position declaration is in the way.
            "after:absolute after:left-1/2 after:top-1/2 after:size-11",
            "after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
          )}
        >
          <svg
            viewBox="0 0 20 20"
            className="size-[17px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {EYE}
            {/* The slash is the state, so it is the only thing that moves. */}
            {!visible && <path d="M3.2 3.2 16.8 16.8" />}
          </svg>
          <span className="sr-only">
            {visible ? "Hide password" : "Show password"}
          </span>
        </button>
      </div>

      {capsLock && (
        <p
          role="status"
          className="flex items-center gap-1.5 text-[length:var(--text-sm)] text-ink-2"
        >
          <svg
            viewBox="0 0 20 20"
            className="size-4 shrink-0 text-ink-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 3.4 4.2 9.2h3v3.4h5.6V9.2h3z" />
            <path d="M7.2 15.4h5.6" />
          </svg>
          Caps Lock is on.
        </p>
      )}
    </div>
  );
}

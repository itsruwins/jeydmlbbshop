"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils/cn";

type ToastTone = "success" | "error";

type Toast = {
  id: number;
  tone: ToastTone;
  message: string;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DISMISS_AFTER: Record<ToastTone, number> = {
  // Errors stay longer: a confirmation can be missed harmlessly, a failure
  // cannot.
  success: 3500,
  error: 6000,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, tone, message }]);
      window.setTimeout(() => remove(id), DISMISS_AFTER[tone]);
    },
    [remove],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* `polite` rather than `assertive`: these confirm work that already
          happened and should not interrupt what a screen reader is saying. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[var(--z-toast)] flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-[var(--radius)] border px-3.5 py-3",
              "shadow-[var(--shadow-pop)] motion-safe:animate-[slide-up_var(--dur)_var(--ease-out)]",
              toast.tone === "success"
                ? "border-[var(--status-available-border)] bg-[var(--status-available-bg)] text-[var(--status-available-ink)]"
                : "border-[var(--danger-border)] bg-danger-bg text-danger-ink",
            )}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => remove(toast.id)}
              aria-label="Dismiss"
              className="-m-1 shrink-0 rounded p-1 opacity-60 transition-opacity hover:opacity-100"
            >
              <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>.");
  }
  return context;
}

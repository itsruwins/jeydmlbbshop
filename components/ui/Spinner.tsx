import { cn } from "@/lib/utils/cn";

/**
 * Only ever used inside a button, where the thing being waited on is the
 * button itself. Content that is loading gets a skeleton instead — a spinner
 * in the middle of a page tells you nothing about what is arriving.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-3.5 shrink-0 rounded-full border-2 border-current border-r-transparent",
        "motion-safe:animate-[spin_0.6s_linear_infinite]",
        className,
      )}
    />
  );
}

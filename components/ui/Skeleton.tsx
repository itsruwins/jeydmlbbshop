import { cn } from "@/lib/utils/cn";

/** Shaped like the content it stands in for, never a centred spinner. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton h-4 w-full", className)} />;
}

export function SkeletonRows({
  rows = 6,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-11" />
      ))}
    </div>
  );
}

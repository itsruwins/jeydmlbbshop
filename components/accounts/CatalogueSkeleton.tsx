import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Shaped like the catalogue it stands in for: a filter rail, a toolbar, and a
 * grid of cards at the same column width the real grid uses.
 *
 * The point of a skeleton is that nothing moves when the content lands. A
 * generic block would technically fill the wait and then be replaced by a
 * two-column layout, which is a worse experience than an honest blank.
 */
export function CatalogueSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-5 lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:items-start lg:gap-10"
    >
      {/* The rail: four groups, each a legend over its controls. */}
      <div className="hidden flex-col gap-7 lg:flex">
        {[7, 4, 9, 1].map((rows, group) => (
          <div key={group} className="flex flex-col gap-2.5">
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: rows }).map((_, row) => (
              <Skeleton key={row} className="h-8 w-full" />
            ))}
          </div>
        ))}
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Skeleton className="h-11 flex-1" />
          <Skeleton className="h-11 sm:w-52" />
        </div>

        <Skeleton className="h-5 w-28" />

        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2.5">
              <Skeleton className="aspect-[16/10] h-auto w-full rounded-[var(--radius-lg)]" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/Skeleton";

/** Shaped like the catalogue it stands in for: controls, then a grid of cards. */
export function CatalogueSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <Skeleton className="h-11 w-full" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="aspect-[16/10] h-auto w-full rounded-[var(--radius-lg)]" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

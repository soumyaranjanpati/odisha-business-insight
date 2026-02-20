import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4">
        <Skeleton className="mb-2 h-4 w-1/4 rounded" />
        <Skeleton className="mb-2 h-6 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="mt-3 h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}

export function ArticleListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-gray-200 pb-6">
          <Skeleton className="h-24 w-32 shrink-0 rounded-lg sm:h-28 sm:w-40" />
          <div className="min-w-0 flex-1">
            <Skeleton className="mb-2 h-4 w-20 rounded" />
            <Skeleton className="mb-2 h-5 w-full rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <Skeleton className="mt-2 h-3 w-24 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

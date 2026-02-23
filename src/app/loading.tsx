import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-4 h-8 w-48 rounded" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

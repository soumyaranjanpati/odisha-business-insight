import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EditorLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-40 rounded" />
        <Skeleton className="h-10 w-28 rounded" />
      </div>
      <Skeleton className="mb-4 h-4 w-80 rounded" />
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200">
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-center justify-between px-6 py-4">
                <div className="min-w-0 flex-1">
                  <Skeleton className="mb-2 h-5 w-3/4 rounded" />
                  <Skeleton className="h-4 w-48 rounded" />
                </div>
                <Skeleton className="h-8 w-20 rounded" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

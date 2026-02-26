import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminUsersLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-8 w-32 rounded" />
      <Skeleton className="mb-4 h-4 w-96 rounded" />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <th key={i} className="px-4 py-3">
                      <Skeleton className="h-4 w-16 rounded" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-20 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-14 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

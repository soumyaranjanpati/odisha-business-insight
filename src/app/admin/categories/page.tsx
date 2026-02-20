import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/Card";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Failed to load categories.
      </div>
    );
  }

  const list = categories ?? [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Categories</h1>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-ink">Name</th>
                <th className="px-4 py-3 font-medium text-ink">Slug</th>
                <th className="px-4 py-3 font-medium text-ink">Sort order</th>
                <th className="px-4 py-3 font-medium text-ink">Description</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c: { id: string; name: string; slug: string; sort_order: number; description: string | null }) => (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.slug}</td>
                  <td className="px-4 py-3">{c.sort_order}</td>
                  <td className="px-4 py-3 text-gray-600">{c.description ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <p className="mt-4 text-sm text-gray-500">
        Categories are managed via database or Supabase dashboard. Add CRUD UI here if needed.
      </p>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default async function AdminContactPage() {
  const profile = await getProfile();
  if (!profile) redirect("/auth/login?redirect=/admin/contact");
  if (profile.roleName !== "admin") redirect("/");

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, message, is_read, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Failed to load contact messages.
      </div>
    );
  }

  const messages = (data ?? []) as ContactMessage[];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Contact Form</h1>
      <p className="mb-4 text-sm text-gray-600">
        Submissions from the website contact form. Newest first.
      </p>
      <Card>
        <CardContent className="p-0">
          {messages.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              No contact submissions yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {messages.map((m) => (
                    <tr key={m.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {new Date(m.created_at).toLocaleString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-ink">
                        {m.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        <a
                          href={`mailto:${m.email}`}
                          className="text-primary-600 hover:underline"
                        >
                          {m.email}
                        </a>
                      </td>
                      <td className="max-w-[160px] truncate px-4 py-3 text-sm text-gray-600">
                        {m.subject || "—"}
                      </td>
                      <td className="max-w-md px-4 py-3 text-sm text-gray-600">
                        <span className="line-clamp-3 block" title={m.message}>
                          {m.message}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/Card";
import { ExportWhatsAppButton } from "./ExportWhatsAppButton";

export const dynamic = "force-dynamic";

type Subscriber = {
  id: string;
  email: string | null;
  whatsapp_number: string | null;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
};

export default async function AdminSubscribersPage() {
  const profile = await getProfile();
  if (!profile) redirect("/auth/login?redirect=/admin/subscribers");
  if (profile.roleName !== "admin") redirect("/");

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, whatsapp_number, is_active, subscribed_at, unsubscribed_at")
    .order("subscribed_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Failed to load subscribers.
      </div>
    );
  }

  const subscribers = (data ?? []) as Subscriber[];
  const activeCount = subscribers.filter((s) => s.is_active).length;
  const whatsappCount = subscribers.filter((s) => s.whatsapp_number && s.is_active).length;
  const emailCount = subscribers.filter((s) => s.email && s.is_active).length;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Newsletter Subscribers</h1>
          <p className="mt-1 text-sm text-gray-500">
            {activeCount} active subscriber{activeCount !== 1 ? "s" : ""} &mdash;{" "}
            {whatsappCount} on WhatsApp, {emailCount} by email.
          </p>
        </div>
        <ExportWhatsAppButton count={whatsappCount} />
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total subscribers</p>
          <p className="mt-1 text-2xl font-bold text-ink">{subscribers.length}</p>
        </div>
        <div className="rounded-lg border border-green-100 bg-green-50 p-4">
          <p className="text-sm text-green-700">WhatsApp (active)</p>
          <p className="mt-1 text-2xl font-bold text-green-800">{whatsappCount}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">Email (active)</p>
          <p className="mt-1 text-2xl font-bold text-blue-800">{emailCount}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {subscribers.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              No subscribers yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Subscribed
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      WhatsApp Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Channels
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {subscribers.map((s) => (
                    <tr key={s.id} className={s.is_active ? "" : "opacity-50"}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {new Date(s.subscribed_at).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">
                        {s.email ? (
                          <a
                            href={`mailto:${s.email}`}
                            className="text-primary-600 hover:underline"
                          >
                            {s.email}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                        {s.whatsapp_number ? (
                          <a
                            href={`https://wa.me/${s.whatsapp_number.replace(/^\+/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline"
                          >
                            {s.whatsapp_number}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {s.whatsapp_number && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              WhatsApp
                            </span>
                          )}
                          {s.email && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              Email
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {s.is_active ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                            Unsubscribed
                          </span>
                        )}
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

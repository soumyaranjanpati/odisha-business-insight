import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { allowed } = await requireAdmin();
  if (!allowed) redirect("/auth/login?redirect=/admin");

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

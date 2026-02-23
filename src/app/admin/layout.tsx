import { redirect } from "next/navigation";
import Link from "next/link";
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
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/admin" className="font-semibold text-ink">
            Admin Dashboard
          </Link>
          <nav className="flex gap-4">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-ink">
              Overview
            </Link>
            <Link href="/admin/articles" className="text-sm text-gray-600 hover:text-ink">
              All Articles
            </Link>
            <Link href="/admin/categories" className="text-sm text-gray-600 hover:text-ink">
              Categories
            </Link>
            <Link href="/admin/users" className="text-sm text-gray-600 hover:text-ink">
              Users
            </Link>
            <Link href="/editor" className="text-sm text-primary-600 hover:underline">
              Editor
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-ink">
              View site
            </Link>
            <form action="/api/auth/signout" method="post">
              <button type="submit" className="text-sm text-gray-600 hover:text-ink">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { requireEditor } from "@/lib/auth";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { allowed, role } = await requireEditor();
  if (!allowed) {
    redirect(role ? "/" : "/auth/login?redirect=/editor");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/editor" className="font-semibold text-ink">
            Editor Dashboard
          </Link>
          <nav className="flex flex-wrap items-center gap-3">
            <Link href="/editor" className="text-sm text-gray-600 hover:text-ink">
              My Posts
            </Link>
            <Link
              href="/editor/new"
              className="rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
            >
              Add Post
            </Link>
            {role === "admin" && (
              <Link href="/admin/users" className="text-sm text-primary-600 hover:underline">
                Users
              </Link>
            )}
            {role === "admin" && (
              <Link href="/admin" className="text-sm text-gray-600 hover:text-ink">
                Admin Panel
              </Link>
            )}
            <Link href="/profile" className="text-sm text-gray-600 hover:text-ink">
              Profile
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-ink">
              View site
            </Link>
            <form action="/api/auth/signout" method="post" className="inline">
              <button type="submit" className="text-sm text-gray-600 hover:text-ink">
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

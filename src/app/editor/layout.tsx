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
    redirect(role ? "/" : "/login?redirect=/editor");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/editor" className="font-semibold text-ink">
            Editor Dashboard
          </Link>
          <nav className="flex gap-4">
            <Link href="/editor" className="text-sm text-gray-600 hover:text-ink">
              My Articles
            </Link>
            <Link href="/editor/new" className="text-sm text-gray-600 hover:text-ink">
              New Article
            </Link>
            {role === "admin" && (
              <Link href="/admin" className="text-sm text-primary-600 hover:underline">
                Admin
              </Link>
            )}
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

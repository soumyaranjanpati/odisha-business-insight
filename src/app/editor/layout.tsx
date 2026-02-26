import { redirect } from "next/navigation";
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
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

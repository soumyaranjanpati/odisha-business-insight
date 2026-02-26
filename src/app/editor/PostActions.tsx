"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteArticle } from "@/app/actions/articles";

export function PostActions({
  slug,
  articleId,
  status,
  canEdit,
}: {
  slug: string;
  articleId: string;
  status: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleDelete() {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    const res = await deleteArticle(articleId);
    if (res.success) startTransition(() => router.refresh());
    else alert(res.message ?? "Failed to delete");
  }

  return (
    <div className="ml-4 flex shrink-0 gap-2">
      {status === "published" && (
        <a
          href={`/article/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-600 hover:underline"
        >
          View
        </a>
      )}
      {canEdit && (
        <>
          <Link
            href={`/editor/edit/${slug}`}
            className="text-sm text-primary-600 hover:underline"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="text-sm text-red-600 hover:underline disabled:opacity-50"
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

/** Editor/admin-only "Added by" line; loaded client-side so article pages can be cached. */
export function ArticleStaffMeta({ authorId }: { authorId: string | null | undefined }) {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!authorId) return;
    let cancelled = false;
    fetch(`/api/me/editorial-meta?authorId=${encodeURIComponent(authorId)}`)
      .then((res) => (res.ok ? res.json() : { name: null }))
      .then((data: { name?: string | null }) => {
        if (!cancelled && data.name) setName(data.name);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [authorId]);

  if (!name) return null;

  return (
    <span className="text-xs text-gray-600 sm:text-sm" title="Visible to editors and admins only">
      Added by <span className="font-medium text-gray-700">{name}</span>
    </span>
  );
}

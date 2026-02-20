"use client";

import { useEffect } from "react";

/**
 * Records one article view by calling the view API. Runs once on mount (client-side).
 */
export function RecordArticleView({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/article/${encodeURIComponent(slug)}/view`, { method: "POST" }).catch(() => {
      // ignore errors (e.g. adblock, offline)
    });
  }, [slug]);
  return null;
}

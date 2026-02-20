"use client";

import { useEffect } from "react";

/**
 * Injects preconnect hints for LCP image origin (Supabase storage).
 * Runs once on mount to avoid layout shift; improves Core Web Vitals.
 */
export function Preconnect() {
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return;
    try {
      const parsed = new URL(url);
      const origin = parsed.origin;
      const existing = document.querySelector(`link[rel="preconnect"][href="${origin}"]`);
      if (existing) return;
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = origin;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    } catch {
      // ignore
    }
  }, []);

  return null;
}

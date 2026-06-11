"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PremiumCta } from "@/components/article/PremiumCta";
import { SITE_NAME } from "@/lib/seo";

type ArticlePremiumBodyProps = {
  isPremium: boolean;
  excerpt: string | null;
  body: string;
  whyThisMatters: string | null;
  source: string | null;
  bylineName: string | null;
  bylineSlug: string | null;
};

/**
 * Renders article body with client-side premium check so the page shell can be cached.
 * Defaults to gated view while loading to avoid leaking premium content.
 */
export function ArticlePremiumBody({
  isPremium,
  excerpt,
  body,
  whyThisMatters,
  source,
  bylineName,
  bylineSlug,
}: ArticlePremiumBodyProps) {
  const [hasPremium, setHasPremium] = useState(false);
  const [checked, setChecked] = useState(!isPremium);

  useEffect(() => {
    if (!isPremium) return;
    let cancelled = false;
    fetch("/api/me/premium")
      .then((res) => (res.ok ? res.json() : { hasPremium: false }))
      .then((data: { hasPremium?: boolean }) => {
        if (!cancelled) {
          setHasPremium(Boolean(data.hasPremium));
          setChecked(true);
        }
      })
      .catch(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isPremium]);

  const showGated = isPremium && (!checked || !hasPremium);

  if (showGated) {
    return (
      <>
        {excerpt && (
          <div className="mt-8 rounded-r-lg border-l-4 border-primary-500 bg-primary-50/60 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-800">Summary</p>
            <p className="mt-2 whitespace-pre-line text-lg leading-relaxed text-gray-800">{excerpt}</p>
          </div>
        )}
        <PremiumCta className="mt-8" />
      </>
    );
  }

  return (
    <>
      {excerpt && (
        <div className="mt-8 rounded-r-lg border-l-4 border-primary-500 bg-primary-50/60 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-800">Summary</p>
          <p className="mt-2 whitespace-pre-line text-lg leading-relaxed text-gray-800">{excerpt}</p>
        </div>
      )}
      <div className="prose-obi mt-8" dangerouslySetInnerHTML={{ __html: body }} />
      {whyThisMatters?.trim() && (
        <div className="mt-10 rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">
            Why This Matters for Odisha
          </p>
          <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-gray-900">
            {whyThisMatters.trim()}
          </p>
        </div>
      )}
      {source?.trim() && (
        <p className="mt-8 text-sm text-gray-600">
          <span className="font-medium text-gray-700">Source: </span>
          {source.trim()}
        </p>
      )}
      <p className="mt-6 text-sm text-gray-600">
        <span className="font-medium text-gray-800">By </span>
        {bylineName && bylineSlug ? (
          <Link href={`/author/${bylineSlug}`} className="font-medium text-primary-700 hover:underline">
            {bylineName}
          </Link>
        ) : (
          <span className="font-medium text-gray-800">{SITE_NAME}</span>
        )}
      </p>
    </>
  );
}

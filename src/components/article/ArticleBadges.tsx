import type { ArticleWithRelations } from "@/types";

interface ArticleBadgesProps {
  article: ArticleWithRelations;
  /** Inline text style for compact layouts */
  inline?: boolean;
}

/** Premium and Sponsored labels for cards and article header. */
export function ArticleBadges({ article, inline }: ArticleBadgesProps) {
  const isPremium = article.is_premium ?? false;
  const isSponsored = article.is_sponsored ?? false;
  const sponsorName = article.sponsored_by?.trim();

  if (!isPremium && !isSponsored) return null;

  if (inline) {
    const parts: string[] = [];
    if (isPremium) parts.push("Premium");
    if (isSponsored) parts.push(sponsorName ? `Sponsored by ${sponsorName}` : "Sponsored");
    return (
      <span className="text-xs text-gray-500">
        {parts.join(" · ")}
      </span>
    );
  }

  return (
    <span className="flex flex-wrap gap-1.5">
      {isPremium && (
        <span className="rounded bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
          Premium
        </span>
      )}
      {isSponsored && (
        <span className="rounded bg-gray-600 px-2 py-0.5 text-xs font-medium text-white" title={sponsorName ?? undefined}>
          {sponsorName ? `Sponsored · ${sponsorName}` : "Sponsored"}
        </span>
      )}
    </span>
  );
}

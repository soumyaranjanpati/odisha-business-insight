/**
 * Publication bylines for Google News–style author pages and JSON-LD.
 * Editorial staff accounts (author_id) remain separate from byline attribution.
 */

export type NewsroomAuthor = {
  name: string;
  slug: string;
  bio: string;
};

export const AUTHOR_ROLE = "Co-Founder, Odisha Economy";

export const NEWSROOM_AUTHORS: readonly NewsroomAuthor[] = [
  {
    name: "Ranjan",
    slug: "ranjan",
    bio: "Co-founder of Odisha Economy, focused on policy, industry, and long-term economic trends across Odisha.",
  },
  {
    name: "Priyanshu",
    slug: "priyanshu",
    bio: "Co-founder of Odisha Economy, covering startups, investments, and business developments shaping the state.",
  },
] as const;

export function getAuthorBySlug(slug: string): NewsroomAuthor | undefined {
  return NEWSROOM_AUTHORS.find((a) => a.slug === slug);
}

export function resolveNewsroomAuthor(slug: string | null | undefined): {
  name: string;
  slug: string;
} | null {
  if (!slug?.trim()) return null;
  const found = getAuthorBySlug(slug.trim().toLowerCase());
  return found ? { name: found.name, slug: found.slug } : null;
}

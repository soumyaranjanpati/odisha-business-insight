import type { Metadata } from "next";
import { searchArticles } from "@/lib/db";
import { SearchClient } from "./SearchClient";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Odisha Business Insight for articles and news.",
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? null;
  const { data: results } = query ? await searchArticles(query, 20) : { data: [] };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="headline text-2xl font-bold text-ink">Search</h1>
      <p className="mt-1 text-gray-600">Find articles by keyword.</p>
      <SearchClient results={results} query={query} />
    </div>
  );
}

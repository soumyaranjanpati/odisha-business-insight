"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ArticleWithRelations } from "@/types";

interface SearchClientProps {
  results: ArticleWithRelations[];
  query: string | null;
}

export function SearchClient({ results, query }: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? query ?? "";

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>('input[name="q"]');
    const term = input?.value?.trim();
    if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  const searched = !!query;

  return (
    <div className="mt-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="search"
          name="q"
          placeholder="Search articles..."
          defaultValue={q}
          key={q}
          className="flex-1"
          aria-label="Search"
        />
        <Button type="submit">Search</Button>
      </form>

      {searched && (
        <div className="mt-8">
          {results.length === 0 ? (
            <p className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
              No articles found. Try different keywords.
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-600">
                {results.length} result{results.length !== 1 ? "s" : ""} found.
              </p>
              <div className="space-y-6">
                {results.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="compact" />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

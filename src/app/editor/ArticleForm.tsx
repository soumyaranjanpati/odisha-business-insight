"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { createOrUpdateArticle } from "@/app/actions/articles";
import type { Article, Category, Tag } from "@/types";

type ArticleStatus = Article["status"];

interface ArticleFormProps {
  categories: Category[];
  tags: Tag[];
  article?: Article & { tag_ids?: string[] };
}

export function ArticleForm({ categories, tags, article }: ArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const isEdit = !!article;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const tagIds = form.getAll("tag_ids") as string[];

    startTransition(async () => {
      const result = await createOrUpdateArticle({
        id: article?.id,
        title: formData.get("title") as string,
        slug: formData.get("slug") as string,
        excerpt: (formData.get("excerpt") as string) || null,
        body: formData.get("body") as string,
        category_id: formData.get("category_id") as string,
        tag_ids: tagIds,
        status: formData.get("status") as ArticleStatus,
        featured_image_url: (formData.get("featured_image_url") as string) || null,
        featured_image_alt: (formData.get("featured_image_alt") as string) || null,
        meta_title: (formData.get("meta_title") as string) || null,
        meta_description: (formData.get("meta_description") as string) || null,
        is_premium: formData.get("is_premium") === "on",
        is_sponsored: formData.get("is_sponsored") === "on",
        sponsored_by: (formData.get("sponsored_by") as string) || null,
      });

      if (result.success && result.slug) {
        router.push(`/editor/edit/${result.slug}`);
        router.refresh();
      } else {
        setError(result.message ?? "Failed to save article.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardContent className="space-y-4 pt-6">
          <Input
            label="Title"
            name="title"
            required
            defaultValue={article?.title}
            placeholder="Article title"
          />
          <Input
            label="Slug (URL)"
            name="slug"
            required
            defaultValue={article?.slug}
            placeholder="article-url-slug"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Excerpt</label>
            <textarea
              name="excerpt"
              rows={2}
              defaultValue={article?.excerpt ?? ""}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-ink focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="Short summary for listings"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Body (HTML)</label>
            <textarea
              name="body"
              rows={14}
              required
              defaultValue={article?.body ?? ""}
              className="block w-full rounded-lg border border-gray-300 font-mono text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="<p>Your content in HTML...</p>"
            />
            <p className="mt-1 text-xs text-gray-500">
              You can use HTML tags (e.g. &lt;p&gt;, &lt;h2&gt;, &lt;a&gt;, &lt;strong&gt;).
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Featured image URL"
              name="featured_image_url"
              defaultValue={article?.featured_image_url ?? ""}
              placeholder="https://..."
            />
            <Input
              label="Featured image alt text"
              name="featured_image_alt"
              defaultValue={article?.featured_image_alt ?? ""}
              placeholder="Description for accessibility"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category_id"
              required
              defaultValue={article?.category_id ?? ""}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <label key={t.id} className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="tag_ids"
                    value={t.id}
                    defaultChecked={article?.tag_ids?.includes(t.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">{t.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Meta title (SEO)"
              name="meta_title"
              defaultValue={article?.meta_title ?? ""}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Meta description (SEO)
              </label>
              <textarea
                name="meta_description"
                rows={2}
                defaultValue={article?.meta_description ?? ""}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              defaultValue={article?.status ?? "draft"}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 sm:w-48 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending review</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="mb-3 text-sm font-medium text-gray-700">Content flags</p>
            <div className="flex flex-wrap gap-6">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="is_premium"
                  defaultChecked={article?.is_premium ?? false}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Premium (gated content)</span>
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="is_sponsored"
                  defaultChecked={article?.is_sponsored ?? false}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Sponsored</span>
              </label>
            </div>
            <Input
              label="Sponsor name (if sponsored)"
              name="sponsored_by"
              defaultValue={article?.sponsored_by ?? ""}
              placeholder="e.g. Company Name"
              className="mt-3 max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" isLoading={isPending}>
          {isEdit ? "Update article" : "Create article"}
        </Button>
        <Link href="/editor">
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}

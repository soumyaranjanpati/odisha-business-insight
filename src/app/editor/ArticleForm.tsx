"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { createOrUpdateArticle } from "@/app/actions/articles";
import { uploadFeaturedArticleImage } from "@/app/actions/article-images";
import type { Article, Category, Tag } from "@/types";

type ArticleStatus = Article["status"];

interface ArticleFormProps {
  categories: Category[];
  tags: Tag[];
  article?: Article & { tag_ids?: string[]; category_ids?: string[] };
}

export function ArticleForm({ categories, tags, article }: ArticleFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!!article?.slug);
  const [featuredImageUrl, setFeaturedImageUrl] = useState(article?.featured_image_url ?? "");
  const [featuredImageAlt, setFeaturedImageAlt] = useState(article?.featured_image_alt ?? "");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [metaTitle, setMetaTitle] = useState(article?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(article?.meta_description ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [sourceUrls, setSourceUrls] = useState("");
  const [includeOpinionTone, setIncludeOpinionTone] = useState(false);
  const [articleType, setArticleType] = useState<"news" | "insight" | "viral">("news");
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateStep, setGenerateStep] = useState<"idle" | "fetching" | "generating">("idle");
  const [generateNotice, setGenerateNotice] = useState<{
    type: "ok" | "err";
    text: string;
    retryable?: boolean;
  } | null>(null);
  const featuredFileRef = useRef<HTMLInputElement>(null);

  const isEdit = !!article;

  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function handleGenerateFromUrls() {
    setGenerateLoading(true);
    setGenerateNotice(null);
    setGenerateStep("fetching");
    try {
      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceUrls,
          includeOpinionTone,
          articleType,
        }),
      });

      setGenerateStep("generating");
      const data = (await res.json()) as {
        title?: string;
        slug?: string;
        summary?: string;
        meta_title?: string;
        meta_description?: string;
        content_html?: string;
        fetchedCount?: number;
        failedCount?: number;
        error?: string;
        retryable?: boolean;
        stage?: "fetch" | "generate";
      };

      if (!res.ok) {
        setGenerateNotice({
          type: "err",
          text: data.error ?? "Failed to generate article",
          retryable: data.retryable ?? data.stage === "generate",
        });
        return;
      }

      setTitle(data.title ?? "");
      setSlug(data.slug ?? "");
      setSlugEdited(true);
      setExcerpt(data.summary ?? "");
      setMetaTitle(data.meta_title ?? "");
      setMetaDescription(data.meta_description ?? "");
      setBody(data.content_html ?? "");

      const fetchedCount = typeof data.fetchedCount === "number" ? data.fetchedCount : 0;
      const failedCount = typeof data.failedCount === "number" ? data.failedCount : 0;
      const partialMessage =
        failedCount > 0 ? ` Generated using ${fetchedCount} source(s); skipped ${failedCount}.` : "";
      setGenerateNotice({ type: "ok", text: `Article generated and fields auto-filled.${partialMessage}` });
    } catch (err) {
      console.error(err);
      setGenerateNotice({
        type: "err",
        text: "Failed to generate article. Please retry.",
        retryable: true,
      });
    } finally {
      setGenerateLoading(false);
      setGenerateStep("idle");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const form = e.currentTarget;
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | undefined;
    const formData = new FormData(form, submitter ?? undefined);
    const categoryIds = formData.getAll("category_ids") as string[];
    const tagIds = formData.getAll("tag_ids") as string[];
    const action = formData.get("submit_action") as string | null;
    const status: ArticleStatus =
      action === "publish" ? "published" : action === "pending" ? "pending" : "draft";

    startTransition(async () => {
      const result = await createOrUpdateArticle({
        id: article?.id,
        title: formData.get("title") as string,
        slug: formData.get("slug") as string,
        excerpt: (formData.get("excerpt") as string) || null,
        body: formData.get("body") as string,
        category_ids: categoryIds,
        tag_ids: tagIds,
        status,
        featured_image_url: featuredImageUrl.trim() || null,
        featured_image_alt: featuredImageAlt.trim() || null,
        meta_title: (formData.get("meta_title") as string) || null,
        meta_description: (formData.get("meta_description") as string) || null,
        is_premium: formData.get("is_premium") === "on",
        is_sponsored: formData.get("is_sponsored") === "on",
        sponsored_by: (formData.get("sponsored_by") as string) || null,
      });

      if (result.success && result.slug) {
        if (isEdit) {
          setSuccess("Post saved successfully. Reloading...");
          setTimeout(() => {
            window.location.href = `/editor/edit/${result.slug}`;
          }, 1200);
        } else {
          setSuccess("Post saved successfully. Reloading...");
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        }
      } else {
        setError(result.message ?? "Failed to save article.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardContent className="space-y-4 pt-6">
          <div>
            <label htmlFor="sourceUrls" className="mb-1 block text-sm font-medium text-gray-700">
              Source URLs
            </label>
            <textarea
              id="sourceUrls"
              rows={4}
              value={sourceUrls}
              onChange={(e) => setSourceUrls(e.target.value)}
              placeholder="Enter one or more article URLs (one per line)"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-ink focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={includeOpinionTone}
                onChange={(e) => setIncludeOpinionTone(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Include Opinion Tone
            </label>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Article Type</label>
              <select
                value={articleType}
                onChange={(e) => setArticleType(e.target.value as "news" | "insight" | "viral")}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-ink focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option value="news">News</option>
                <option value="insight">Insight</option>
                <option value="viral">Viral</option>
              </select>
            </div>
          </div>
          <div>
            <Button type="button" onClick={handleGenerateFromUrls} disabled={generateLoading}>
              {generateLoading ? "Generating..." : "Generate Article"}
            </Button>
            <p className="mt-2 text-xs text-gray-500" role="status">
              {generateStep === "fetching"
                ? "Fetching content..."
                : generateStep === "generating"
                  ? "Generating article..."
                  : "Paste URLs, choose options above, then generate."}
            </p>
            {generateNotice && (
              <p
                className={`mt-2 text-sm ${generateNotice.type === "ok" ? "text-green-700" : "text-red-600"}`}
              >
                {generateNotice.text}
              </p>
            )}
            {generateNotice?.type === "err" && generateNotice.retryable && (
              <button
                type="button"
                onClick={handleGenerateFromUrls}
                disabled={generateLoading}
                className="mt-2 text-sm font-medium text-primary-700 hover:text-primary-800 disabled:opacity-50"
              >
                Retry generation
              </button>
            )}
          </div>
          <Input
            label="Title"
            name="title"
            required
            value={title}
            onChange={(e) => {
              const nextTitle = e.target.value;
              setTitle(nextTitle);
              if (!isEdit && !slugEdited) {
                setSlug(makeSlug(nextTitle));
              }
            }}
            placeholder="Article title"
          />
          <Input
            label="Slug (URL)"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(makeSlug(e.target.value));
            }}
            placeholder="article-url-slug"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Summary</label>
            <textarea
              name="excerpt"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-ink focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="Short summary for listings and cards"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Content</label>
            <textarea
              name="body"
              rows={14}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-ink focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="<p>Your content. You can use HTML: &lt;p&gt;, &lt;h2&gt;, &lt;a&gt;, &lt;strong&gt;, &lt;ul&gt;, etc.</p>"
            />
            <p className="mt-1 text-xs text-gray-500">
              Use HTML for formatting (e.g. &lt;p&gt;, &lt;h2&gt;, &lt;a&gt;, &lt;strong&gt;).
            </p>
          </div>
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-700">Meta title &amp; description (SEO)</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Meta title (SEO)"
                name="meta_title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Meta description (SEO)
                </label>
                <textarea
                  name="meta_description"
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
            <p className="text-sm font-medium text-gray-800">Featured image</p>
            <p className="mt-1 text-xs text-gray-500">
              Upload to Supabase storage, or paste any image URL below. URL stays editable after upload.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                ref={featuredFileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="max-w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-primary-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-primary-700"
              />
              <Button
                type="button"
                variant="secondary"
                isLoading={uploadBusy}
                onClick={async () => {
                  const file = featuredFileRef.current?.files?.[0];
                  if (!file) {
                    setUploadMsg({ type: "err", text: "Choose an image file first." });
                    return;
                  }
                  setUploadBusy(true);
                  setUploadMsg(null);
                  const fd = new FormData();
                  fd.set("file", file);
                  const result = await uploadFeaturedArticleImage(fd);
                  setUploadBusy(false);
                  if ("error" in result) {
                    setUploadMsg({ type: "err", text: result.error });
                    return;
                  }
                  setFeaturedImageUrl(result.url);
                  setUploadMsg({
                    type: "ok",
                    text: "Uploaded. URL filled below—you can edit it or change alt text.",
                  });
                  if (featuredFileRef.current) featuredFileRef.current.value = "";
                }}
              >
                Upload to storage
              </Button>
            </div>
            {uploadMsg && (
              <p
                className={`mt-2 text-sm ${uploadMsg.type === "ok" ? "text-green-700" : "text-red-600"}`}
              >
                {uploadMsg.text}
              </p>
            )}
            {featuredImageUrl.trim() && (
              <div className="mt-4 max-w-md overflow-hidden rounded-lg border border-gray-200 bg-gray-100 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- preview may be any external URL */}
                <img
                  src={featuredImageUrl.trim()}
                  alt={featuredImageAlt.trim() || "Featured image preview"}
                  className="mx-auto max-h-48 w-auto max-w-full object-contain"
                />
              </div>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                label="Featured image (URL)"
                name="featured_image_url"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                placeholder="https://... (filled after upload or paste manually)"
              />
              <Input
                label="Featured image alt text"
                name="featured_image_alt"
                value={featuredImageAlt}
                onChange={(e) => setFeaturedImageAlt(e.target.value)}
                placeholder="Description for accessibility"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <label key={c.id} className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="category_ids"
                    value={c.id}
                    defaultChecked={
                      article?.category_ids?.includes(c.id) || article?.category_id === c.id
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">{c.name}</span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Select one or more categories. The first selected category is used as primary.
            </p>
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
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Draft / Publish</label>
            <p className="text-xs text-gray-500">Use the buttons below to save as draft or publish.</p>
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
      {success && <p className="mb-4 text-sm text-green-700">{success}</p>}

      <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4">
        <Button
          type="submit"
          name="submit_action"
          value="draft"
          isLoading={isPending}
          variant="secondary"
        >
          Save draft
        </Button>
        <Button
          type="submit"
          name="submit_action"
          value="publish"
          isLoading={isPending}
        >
          Publish
        </Button>
        {isEdit && (
          <Button
            type="submit"
            name="submit_action"
            value="pending"
            isLoading={isPending}
            variant="secondary"
          >
            Submit for review
          </Button>
        )}
        <Link href="/editor">
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}

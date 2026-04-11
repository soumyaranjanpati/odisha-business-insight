"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { createOrUpdateArticle } from "@/app/actions/articles";
import { uploadFeaturedArticleImage } from "@/app/actions/article-images";
import { formatDate } from "@/lib/utils";
import type { Article, Category, Tag } from "@/types";

type ArticleStatus = Article["status"];

interface ArticleFormProps {
  categories: Category[];
  tags: Tag[];
  article?: Article & { tag_ids?: string[]; category_ids?: string[] };
}

function countNonEmptyLines(text: string): number {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).length;
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
  const [whyThisMatters, setWhyThisMatters] = useState(article?.why_this_matters ?? "");
  const [sourceLine, setSourceLine] = useState(article?.source ?? "");
  const [authorSlug, setAuthorSlug] = useState(article?.author_slug ?? "");
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
        why_this_matters?: string;
        source?: string;
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
      setWhyThisMatters(data.why_this_matters ?? "");
      setSourceLine(data.source ?? "");

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

    if (status === "published") {
      if (!title.trim()) {
        setError("Title is required to publish.");
        return;
      }
      if (!body.trim()) {
        setError("Content is required to publish.");
        return;
      }
      if (countNonEmptyLines(excerpt) < 2) {
        setError("Summary must be at least two lines (what happened, where, who).");
        return;
      }
      if (!whyThisMatters.trim()) {
        setError("Why This Matters for Odisha is required to publish.");
        return;
      }
      if (!authorSlug.trim()) {
        setError("Please select an author before publishing.");
        return;
      }
    }

    startTransition(async () => {
      const result = await createOrUpdateArticle({
        id: article?.id,
        title,
        slug,
        excerpt: excerpt || null,
        body,
        category_ids: categoryIds,
        tag_ids: tagIds,
        status,
        featured_image_url: featuredImageUrl.trim() || null,
        featured_image_alt: featuredImageAlt.trim() || null,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        why_this_matters: whyThisMatters || null,
        source: sourceLine || null,
        author_slug: authorSlug || null,
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
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="space-y-4 pt-6">
          <h2 className="headline text-lg font-semibold text-ink">Section 1 — Title &amp; URL</h2>
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
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="space-y-4 pt-6">
          <h2 className="headline text-lg font-semibold text-ink">Section 2 — Summary</h2>
          <p className="text-xs text-gray-500">
            Two or more lines: what happened, where, and who. Required to publish.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Summary</label>
            <textarea
              name="excerpt"
              rows={4}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-ink focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder={"Line 1: what happened...\nLine 2: where / who..."}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="space-y-4 pt-6">
          <h2 className="headline text-lg font-semibold text-ink">Section 3 — Main content</h2>
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
        </CardContent>
      </Card>

      <Card className="mb-6 border-primary-200 bg-primary-50/40">
        <CardContent className="space-y-4 pt-6">
          <h2 className="headline text-lg font-semibold text-ink">Section 4 — Why This Matters for Odisha</h2>
          <p className="text-xs text-gray-600">
            Economic, business, or policy impact on Odisha. Required to publish.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Why this matters</label>
            <textarea
              name="why_this_matters"
              rows={5}
              value={whyThisMatters}
              onChange={(e) => setWhyThisMatters(e.target.value)}
              className="block w-full rounded-lg border border-primary-200 bg-white px-3 py-2 text-ink focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="Odisha-specific insight: jobs, investment, MSMEs, policy, infrastructure..."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="space-y-4 pt-6">
          <h2 className="headline text-lg font-semibold text-ink">Section 5 — Source</h2>
          <p className="text-xs text-gray-500">
            Auto-filled when you use Generate Article; edit freely (e.g. outlet names or domains).
          </p>
          <Input
            label="Source"
            name="source"
            value={sourceLine}
            onChange={(e) => setSourceLine(e.target.value)}
            placeholder="e.g. Sources: example.com, news.outlet.in"
          />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="space-y-6 pt-6">
          <h2 className="headline text-lg font-semibold text-ink">Section 6 — Metadata</h2>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Author (byline) <span className="text-red-600">*</span>
            </label>
            <select
              name="author_slug"
              value={authorSlug}
              onChange={(e) => setAuthorSlug(e.target.value)}
              className="block max-w-md rounded-lg border border-gray-300 px-3 py-2 text-ink focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Select author (required to publish)</option>
              <option value="ranjan">Ranjan</option>
              <option value="priyanshu">Priyanshu</option>
            </select>
          </div>

          {isEdit && article && (
            <div className="rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-700">
              <p className="font-medium text-gray-800">Dates</p>
              <p className="mt-1">
                <span className="text-gray-500">Publish date: </span>
                {article.published_at ? formatDate(article.published_at) : "— (not published yet)"}
              </p>
              <p className="mt-1">
                <span className="text-gray-500">Last updated: </span>
                {formatDate(article.updated_at)}
              </p>
            </div>
          )}

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
              Select at least one category. The first selected category is primary.
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

          <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
            <p className="text-sm font-medium text-gray-800">Featured image</p>
            <p className="mt-1 text-xs text-gray-500">
              Upload to Supabase storage, or paste any image URL below.
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
                placeholder="https://..."
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
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-700">Meta title &amp; description (SEO)</p>
            </div>
            <p className="mb-2 text-xs text-gray-500">
              If meta title is empty, the article title is used on the public site.
            </p>
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

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Draft / Publish</label>
            <p className="text-xs text-gray-500">Use the buttons below to save as draft or publish.</p>
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
        <Button type="submit" name="submit_action" value="publish" isLoading={isPending}>
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

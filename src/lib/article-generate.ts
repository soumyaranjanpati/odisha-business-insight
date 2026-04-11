import { load } from "cheerio";
import { geminiGenerateContentUrl } from "@/lib/gemini-config";

const MAX_COMBINED_CHARS = 10_000;
const FETCH_TIMEOUT_MS = 12_000;

export type GeneratedArticle = {
  title: string;
  slug: string;
  summary: string;
  meta_title: string;
  meta_description: string;
  content_html: string;
  /** Odisha economic / business / policy impact — distinct from main body */
  why_this_matters: string;
  /** Plain text; API may also set `source` from URLs */
  source: string;
};

/** Human-readable attribution line from fetched URLs (domains). */
export function formatSourceLineFromUrls(urls: string[]): string {
  if (!urls.length) return "";
  const parts = urls.map((u) => {
    try {
      return new URL(u).hostname.replace(/^www\./i, "");
    } catch {
      return u;
    }
  });
  return `Sources: ${parts.join(", ")}`;
}

type GenerateArticleResult = {
  article: GeneratedArticle | null;
  error?: string;
};

function tryParseUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function sanitizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncateByWord(value: string, maxChars: number): string {
  const trimmed = sanitizeText(value);
  if (trimmed.length <= maxChars) return trimmed;
  const sliced = trimmed.slice(0, maxChars);
  return sanitizeText(sliced.replace(/\s+\S*$/, ""));
}

function parseJsonSafe(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  const raw = (fence ? fence[1] : trimmed).trim();
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function makeSlug(value: string): string {
  return sanitizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function trimWords(value: string, words: number): string {
  return sanitizeText(value).split(" ").slice(0, words).join(" ");
}

function fallbackArticleFromText(combinedText: string): GeneratedArticle {
  const baseTitle = trimWords(combinedText, 8) || "Odisha business update";
  const title = baseTitle.slice(0, 60);
  const summarySource = trimWords(combinedText, 30);
  const summary = summarySource || "Odisha-focused business update covering industry trends, MSME impact, and medium-term economic outlook with a fact-based, publication-ready editorial structure.";
  const meta_title = title.slice(0, 60);
  const meta_description = (summary.length > 160 ? `${summary.slice(0, 157)}...` : summary).slice(0, 160);
  const p1 = trimWords(combinedText, 100);
  const p2 = trimWords(combinedText.split(" ").slice(100).join(" "), 100);
  const content_html = `<p>${p1 || "No readable source content was available."}</p><h2>Economic Context</h2><p>${p2 || "This development may influence Odisha's MSME ecosystem and downstream value chains over time."}</p><p><strong>Now onwards, actual value creation has started.</strong></p>`;
  const why_this_matters =
    "For Odisha, developments like this can affect investment sentiment, local industry linkages, and policy priorities—worth watching for MSMEs and project pipelines in the state.";
  const source = "";

  return {
    title,
    slug: makeSlug(title) || "odisha-business-update",
    summary,
    meta_title,
    meta_description,
    content_html,
    why_this_matters,
    source,
  };
}

function asGeneratedArticle(value: unknown, combinedText?: string): GeneratedArticle | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const partialTitle = typeof record.title === "string" ? sanitizeText(record.title) : "";
  const partialSummary = typeof record.summary === "string" ? sanitizeText(record.summary) : "";
  const fallback = fallbackArticleFromText(combinedText ?? "");
  const partialWhy =
    typeof record.why_this_matters === "string" ? sanitizeText(record.why_this_matters) : "";
  const partialSource = typeof record.source === "string" ? sanitizeText(record.source) : "";

  const output: GeneratedArticle = {
    title: partialTitle || fallback.title,
    slug: typeof record.slug === "string" ? sanitizeText(record.slug).toLowerCase() : "",
    summary: partialSummary || fallback.summary,
    meta_title: typeof record.meta_title === "string" ? sanitizeText(record.meta_title) : "",
    meta_description:
      typeof record.meta_description === "string" ? sanitizeText(record.meta_description) : fallback.meta_description,
    content_html: typeof record.content_html === "string" ? record.content_html.trim() : fallback.content_html,
    why_this_matters: partialWhy || fallback.why_this_matters,
    source: partialSource || fallback.source,
  };

  output.slug = makeSlug(output.slug || output.title || fallback.title);
  if (!output.meta_title) output.meta_title = output.title.slice(0, 60);
  if (!output.meta_description) output.meta_description = fallback.meta_description;
  if (!output.content_html) output.content_html = fallback.content_html;
  if (!output.summary) output.summary = fallback.summary;
  if (!output.title) output.title = fallback.title;
  if (!output.slug) output.slug = fallback.slug;
  if (!output.why_this_matters) output.why_this_matters = fallback.why_this_matters;
  if (!output.source) output.source = fallback.source;
  return output;
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OdishaEconomyBot/1.0; +https://odishaeconomy.com)",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function extractReadableText(html: string): string {
  const $ = load(html);
  $("script, style, noscript, iframe, svg").remove();

  const articleText = sanitizeText($("article").first().text());
  if (articleText) return articleText;

  const pText = sanitizeText(
    $("p")
      .toArray()
      .map((el) => $(el).text())
      .join(" ")
  );
  if (pText) return pText;

  const metaDescription = sanitizeText(
    $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      ""
  );
  return metaDescription;
}

export function parseSourceUrls(raw: string): string[] {
  const seen = new Set<string>();
  const urls = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(tryParseUrl)
    .filter((url): url is string => Boolean(url))
    .filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });

  return urls;
}

export async function combineContentFromUrls(urls: string[]): Promise<{
  combinedText: string;
  fetchedCount: number;
  failedCount: number;
}> {
  let combined = "";
  let fetchedCount = 0;
  let failedCount = 0;

  for (const url of urls) {
    try {
      const html = await fetchHtml(url);
      const text = extractReadableText(html);
      if (!text) {
        failedCount += 1;
        continue;
      }
      fetchedCount += 1;
      const next = combined ? `${combined}\n\n${text}` : text;
      combined = truncateByWord(next, MAX_COMBINED_CHARS);
      if (combined.length >= MAX_COMBINED_CHARS) break;
    } catch {
      failedCount += 1;
    }
  }

  return { combinedText: combined, fetchedCount, failedCount };
}

export async function generateArticleFromCombinedText({
  combinedText,
  includeOpinionTone,
  articleType,
}: {
  combinedText: string;
  includeOpinionTone?: boolean;
  articleType?: "news" | "insight" | "viral";
}): Promise<GenerateArticleResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return { article: null, error: "GEMINI_API_KEY is missing." };

  const opinionLine = includeOpinionTone ? "- Add a measured opinionated angle where relevant" : "";
  const typeInstruction =
    articleType === "insight"
      ? "Prefer explanatory and analytical structure."
      : articleType === "viral"
        ? "Use a high-engagement structure while keeping business credibility."
        : "Use a classic business-news structure.";

  const prompt = `You are a senior business journalist writing for OdishaEconomy.com.

Rewrite the provided content into a completely original, high-quality, SEO-optimized article.

STRICT RULES:
- 100% unique (no sentence copying)
- Do NOT reuse structure from source
- Add Odisha-focused economic insights
- Add MSME and downstream industry impact
- Add future outlook and industrial significance
- Use clear, professional, Business Standard-style tone
${opinionLine}
- End the main article body (content_html) with a strong line:
  'Now onwards, actual value creation has started.'

Return ONLY valid JSON:

{
  "title": "...",
  "slug": "...",
  "summary": "...",
  "meta_title": "...",
  "meta_description": "...",
  "content_html": "...",
  "why_this_matters": "...",
  "source": "..."
}

Field Rules:
- title: high CTR, under 60 chars
- slug: lowercase, hyphen-separated, SEO-friendly
- summary: 2-3 short lines of plain text (use \\n between lines). Must answer what happened, where, and who — factual intro only.
- meta_title: SEO optimized (can differ slightly from title)
- meta_description: 140-160 characters
- content_html:
   - Main story only (NOT the why_this_matters section)
   - Use clean HTML in paragraphs
   - Include <p>, <h2>, <ul>, <strong> where useful
   - No markdown
   - No external links
- why_this_matters: separate plain text (no HTML). 2-4 sentences on economic, business, or policy impact specifically for Odisha (investments, jobs, MSMEs, infrastructure, fiscal/policy angle). Must not duplicate the summary verbatim.
- source: short plain-text attribution such as "Based on reporting from [outlet names]" — only if inferable from input; otherwise "".

IMPORTANT:
- Do not hallucinate numbers
- Only use facts from input
- If unsure, omit
- ${typeInstruction}

Content:
${combinedText}`;

  const url = geminiGenerateContentUrl(apiKey);
  try {
    const doCall = async (strictJson: boolean) => {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: strictJson
                    ? `${prompt}\n\nCRITICAL: Return a single valid JSON object only, with double-quoted keys and values.`
                    : prompt,
                },
              ],
            },
          ],
          generationConfig: {
            ...(strictJson ? { responseMimeType: "application/json" } : {}),
            temperature: 0.35,
          },
        }),
      });
      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
        error?: { message?: string };
      };
      return {
        ok: response.ok,
        text: data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
        error: data?.error?.message || `Gemini HTTP ${response.status}`,
      };
    };

    const first = await doCall(true);
    if (first.ok) {
      const parsed = parseJsonSafe(first.text);
      const article = asGeneratedArticle(parsed, combinedText);
      if (article) return { article };
    }

    const second = await doCall(false);
    if (second.ok) {
      const parsed = parseJsonSafe(second.text);
      const article = asGeneratedArticle(parsed, combinedText);
      if (article) return { article };
    }

    return { article: null, error: first.error || second.error || "Gemini response parsing failed." };
  } catch (error) {
    return {
      article: null,
      error: error instanceof Error ? error.message : "Gemini request failed.",
    };
  }
}

/**
 * Server-only: generates meta title/description via Gemini (GEMINI_API_KEY).
 * Falls back to simple slicing if the API is unavailable or returns invalid JSON.
 */

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function fallbackSEO(
  title: string,
  summary: string,
  content: string
): { meta_title: string; meta_description: string } {
  const t = (title || "Untitled").trim();
  const plainContent = stripHtml(content);
  const descSource = (summary || "").trim() || plainContent || t;
  return {
    meta_title: t.slice(0, 60),
    meta_description: descSource.slice(0, 155),
  };
}

function tryParseSEOJson(text: string): { meta_title?: string; meta_description?: string } | null {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  const raw = (fence ? fence[1] : trimmed).trim();
  try {
    const parsed = JSON.parse(raw) as { meta_title?: unknown; meta_description?: unknown };
    return {
      meta_title: typeof parsed.meta_title === "string" ? parsed.meta_title : undefined,
      meta_description: typeof parsed.meta_description === "string" ? parsed.meta_description : undefined,
    };
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      const parsed = JSON.parse(match[0]) as { meta_title?: unknown; meta_description?: unknown };
      return {
        meta_title: typeof parsed.meta_title === "string" ? parsed.meta_title : undefined,
        meta_description: typeof parsed.meta_description === "string" ? parsed.meta_description : undefined,
      };
    } catch {
      return null;
    }
  }
}

function cleanSnippet(s: string, max: number): string {
  return s.replace(/["'`]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function generateSEOMetadata({
  title,
  summary,
  content,
}: {
  title: string;
  summary?: string | null;
  content?: string | null;
}): Promise<{ meta_title: string; meta_description: string }> {
  const safeTitle = (title ?? "").trim();
  const safeSummary = (summary ?? "").trim();
  const rawContent = content ?? "";
  const contentSnippet = stripHtml(rawContent).slice(0, 2000);

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return fallbackSEO(safeTitle, safeSummary, rawContent);
  }

  const prompt = `You are an SEO expert for a business news platform focused on Odisha and India.

Generate:
1. meta_title (max 60 characters)
2. meta_description (max 155 characters)

Rules:
- Make it engaging and click-worthy
- Include business/economy keywords where natural
- Avoid quotes and special characters
- No line breaks in values
- Return ONLY a JSON object with keys meta_title and meta_description (no markdown, no explanation)

Article Title: ${safeTitle || "(no title)"}
Summary: ${safeSummary || "(empty — infer from content if needed)"}
Content excerpt: ${contentSnippet || "(empty)"}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      }),
    });

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      error?: { message?: string };
    };

    if (!response.ok) {
      console.error("Gemini SEO error:", data?.error?.message ?? response.status);
      return fallbackSEO(safeTitle, safeSummary, rawContent);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = tryParseSEOJson(text);

    let meta_title = (parsed?.meta_title ?? "").trim();
    let meta_description = (parsed?.meta_description ?? "").trim();

    if (!meta_title && !meta_description) {
      return fallbackSEO(safeTitle, safeSummary, rawContent);
    }

    meta_title = cleanSnippet(meta_title, 60);
    meta_description = cleanSnippet(meta_description, 155);

    if (!meta_title) meta_title = fallbackSEO(safeTitle, safeSummary, rawContent).meta_title;
    if (!meta_description)
      meta_description = fallbackSEO(safeTitle, safeSummary, rawContent).meta_description;

    return { meta_title, meta_description };
  } catch (e) {
    console.error("generateSEOMetadata:", e);
    return fallbackSEO(safeTitle, safeSummary, rawContent);
  }
}

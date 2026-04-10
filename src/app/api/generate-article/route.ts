import { NextResponse } from "next/server";
import { requireEditor } from "@/lib/auth";
import {
  combineContentFromUrls,
  generateArticleFromCombinedText,
  parseSourceUrls,
} from "@/lib/article-generate";

export async function POST(request: Request) {
  const { allowed } = await requireEditor();
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      sourceUrls?: unknown;
      includeOpinionTone?: unknown;
      articleType?: unknown;
    };

    const sourceUrlsRaw = typeof body.sourceUrls === "string" ? body.sourceUrls : "";
    const includeOpinionTone = body.includeOpinionTone === true;
    const articleType =
      body.articleType === "news" || body.articleType === "insight" || body.articleType === "viral"
        ? body.articleType
        : "news";

    const urls = parseSourceUrls(sourceUrlsRaw);
    if (!urls.length) {
      return NextResponse.json(
        { error: "Please provide at least one valid URL.", stage: "fetch" },
        { status: 400 }
      );
    }

    const { combinedText, fetchedCount, failedCount } = await combineContentFromUrls(urls);
    if (!combinedText) {
      return NextResponse.json(
        { error: "Could not fetch readable content from the provided URLs.", stage: "fetch" },
        { status: 422 }
      );
    }

    const generated = await generateArticleFromCombinedText({
      combinedText,
      includeOpinionTone,
      articleType,
    });

    if (!generated.article) {
      console.error("/api/generate-article failed:", generated.error);
      return NextResponse.json(
        {
          error: generated.error || "Article generation failed. Please retry.",
          stage: "generate",
          retryable: true,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ...generated.article,
      fetchedCount,
      failedCount,
      totalValidUrls: urls.length,
    });
  } catch (error) {
    console.error("/api/generate-article:", error);
    return NextResponse.json(
      { error: "Unexpected error during article generation.", retryable: true },
      { status: 500 }
    );
  }
}

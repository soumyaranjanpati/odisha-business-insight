import { NextResponse } from "next/server";
import { requireEditor } from "@/lib/auth";
import { generateSEOMetadata } from "@/lib/seo-generate";

export async function POST(request: Request) {
  const { allowed } = await requireEditor();
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      title?: unknown;
      summary?: unknown;
      content?: unknown;
    };

    const title = typeof body.title === "string" ? body.title : "";
    const summary = typeof body.summary === "string" ? body.summary : "";
    const content = typeof body.content === "string" ? body.content : "";

    const seo = await generateSEOMetadata({ title, summary, content });
    return NextResponse.json(seo);
  } catch (error) {
    console.error("/api/generate-seo:", error);
    return NextResponse.json(
      { meta_title: "", meta_description: "", error: "Generation failed" },
      { status: 500 }
    );
  }
}

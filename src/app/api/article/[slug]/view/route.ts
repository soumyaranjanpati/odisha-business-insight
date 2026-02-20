import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/article/[slug]/view — record one article view.
 * Called from client when an article is viewed. Uses anon client; RLS allows insert for all.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug?.trim()) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const supabase = await createClient();
  const { data: article, error: fetchError } = await supabase
    .from("articles")
    .select("id")
    .eq("slug", slug.trim())
    .eq("status", "published")
    .maybeSingle();

  if (fetchError || !article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error: insertError } = await supabase
    .from("article_views")
    .insert({ article_id: article.id });

  if (insertError) {
    console.error("article_views insert error:", insertError);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

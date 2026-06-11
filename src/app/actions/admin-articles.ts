"use server";

import { revalidatePath } from "next/cache";
import { revalidatePublicContent } from "@/lib/revalidate-public";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { pingGoogleNewsSitemap } from "@/lib/google-ping";

export async function approveArticle(articleId: string) {
  const { allowed } = await requireAdmin();
  if (!allowed) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from("articles")
    .update({
      status: "published",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
    })
    .eq("id", articleId)
    .select("slug")
    .single();

  if (data?.slug) {
    pingGoogleNewsSitemap();
    revalidatePath("/sitemap.xml");
    revalidatePath("/news-sitemap.xml");
    revalidatePublicContent(data.slug);
  }
}

export async function rejectArticle(articleId: string) {
  const { allowed } = await requireAdmin();
  if (!allowed) return;

  const supabase = await createClient();
  await supabase
    .from("articles")
    .update({ status: "rejected" })
    .eq("id", articleId);
}

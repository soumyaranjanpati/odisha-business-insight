"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function approveArticle(articleId: string) {
  const { allowed } = await requireAdmin();
  if (!allowed) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("articles")
    .update({
      status: "published",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
    })
    .eq("id", articleId);
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

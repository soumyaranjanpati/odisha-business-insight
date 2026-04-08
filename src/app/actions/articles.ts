"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { readingTimeMinutes } from "@/lib/utils";
import slugify from "slugify";
import type { ArticleStatus } from "@/types";

interface CreateOrUpdateInput {
  id?: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  category_ids: string[];
  tag_ids: string[];
  status: ArticleStatus;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_premium?: boolean;
  is_sponsored?: boolean;
  sponsored_by?: string | null;
}

function stripHtml(input: string): string {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateSmart(text: string, max = 160): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

export async function createOrUpdateArticle(
  input: CreateOrUpdateInput
): Promise<{ success: boolean; message?: string; slug?: string }> {
  const profile = await getProfile();
  if (!profile) return { success: false, message: "Unauthorized" };

  const role = profile.roleName as string;
  if (role !== "editor" && role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }

  const slug = (input.slug || slugify(input.title, { lower: true, strict: true })).trim();
  if (!slug) return { success: false, message: "Slug is required" };

  const categoryIds = Array.from(new Set(input.category_ids.filter(Boolean)));
  if (!categoryIds.length) {
    return { success: false, message: "Please select at least one category" };
  }
  const primaryCategoryId = categoryIds[0];
  const cleanBodyText = stripHtml(input.body);
  const autoExcerpt = input.excerpt?.trim() || truncateSmart(cleanBodyText, 220);
  const autoMetaTitle = input.meta_title?.trim() || input.title.trim();
  const autoMetaDescription =
    input.meta_description?.trim() ||
    input.excerpt?.trim() ||
    truncateSmart(cleanBodyText, 160);

  const reading_time_minutes = readingTimeMinutes(input.body);
  const published_at =
    input.status === "published" ? new Date().toISOString() : null;

  const supabase = await createClient();

  if (input.id) {
    // Update: only own article for editor; admin can update any
    const { data: existing } = await supabase
      .from("articles")
      .select("id, author_id")
      .eq("id", input.id)
      .single();

    if (!existing) return { success: false, message: "Article not found" };
    if (role === "editor" && existing.author_id !== profile.id) {
      return { success: false, message: "You can only edit your own articles" };
    }

    const { error: updateError } = await supabase
      .from("articles")
      .update({
        title: input.title,
        slug,
        excerpt: autoExcerpt || null,
        body: input.body,
        category_id: primaryCategoryId,
        status: input.status,
        published_at,
        reading_time_minutes,
        featured_image_url: input.featured_image_url || null,
        featured_image_alt: input.featured_image_alt || null,
        meta_title: autoMetaTitle || null,
        meta_description: autoMetaDescription || null,
        is_premium: input.is_premium ?? false,
        is_sponsored: input.is_sponsored ?? false,
        sponsored_by: input.sponsored_by?.trim() || null,
      })
      .eq("id", input.id);

    if (updateError) {
      console.error("Article update error:", updateError);
      return { success: false, message: updateError.message };
    }

    // Sync tags
    await supabase.from("article_tags").delete().eq("article_id", input.id);
    if (input.tag_ids.length) {
      await supabase.from("article_tags").insert(
        input.tag_ids.map((tag_id) => ({ article_id: input.id!, tag_id }))
      );
    }

    // Sync multi-categories
    await supabase.from("article_categories").delete().eq("article_id", input.id);
    await supabase
      .from("article_categories")
      .insert(categoryIds.map((category_id) => ({ article_id: input.id!, category_id })));

    return { success: true, slug };
  }

  // Create
  const { data: newArticle, error: insertError } = await supabase
    .from("articles")
    .insert({
      author_id: profile.id,
      title: input.title,
      slug,
      excerpt: autoExcerpt || null,
      body: input.body,
      category_id: primaryCategoryId,
      status: input.status,
      published_at,
      reading_time_minutes,
      featured_image_url: input.featured_image_url || null,
      featured_image_alt: input.featured_image_alt || null,
      meta_title: autoMetaTitle || null,
      meta_description: autoMetaDescription || null,
      is_premium: input.is_premium ?? false,
      is_sponsored: input.is_sponsored ?? false,
      sponsored_by: input.sponsored_by?.trim() || null,
    })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") return { success: false, message: "Slug already in use" };
    console.error("Article create error:", insertError);
    return { success: false, message: insertError.message };
  }

  if (input.tag_ids.length && newArticle) {
    await supabase.from("article_tags").insert(
      input.tag_ids.map((tag_id) => ({ article_id: newArticle.id, tag_id }))
    );
  }

  if (newArticle) {
    await supabase
      .from("article_categories")
      .insert(categoryIds.map((category_id) => ({ article_id: newArticle.id, category_id })));
  }

  return { success: true, slug };
}

export async function deleteArticle(articleId: string): Promise<{ success: boolean; message?: string }> {
  const profile = await getProfile();
  if (!profile) return { success: false, message: "Unauthorized" };

  const role = profile.roleName as string;
  if (role !== "editor" && role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("articles")
    .select("id, author_id")
    .eq("id", articleId)
    .single();

  if (!existing) return { success: false, message: "Article not found" };
  if (role === "editor" && existing.author_id !== profile.id) {
    return { success: false, message: "You can only delete your own articles" };
  }

  const { error } = await supabase.from("articles").delete().eq("id", articleId);
  if (error) return { success: false, message: error.message };
  return { success: true };
}

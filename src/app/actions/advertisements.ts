"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getProfile, getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const BUCKET = "advertisement-images";

export type AdFormData = {
  image_url: string;
  description?: string | null;
  advertiser?: string | null;
  amount_per_month?: number | null;
  total_amount?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
};

function parseDecimal(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Upload image file to advertisement-images bucket; returns public URL or throws. */
export async function uploadAdImage(formData: FormData): Promise<{ url: string } | { error: string }> {
  const user = await getUser();
  if (!user) return { error: "Not signed in" };
  const profile = await getProfile();
  const role = profile?.roleName;
  if (role !== "editor" && role !== "admin") return { error: "Only editors and admins can upload ad images." };

  const file = formData.get("file") as File | null;
  if (!file?.size) return { error: "No file provided" };
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowed.includes(file.type)) return { error: "Invalid file type. Use JPEG, PNG, GIF, or WebP." };
  if (file.size > 5 * 1024 * 1024) return { error: "File must be under 5MB" };

  const supabase = createServiceRoleClient();
  const ext = file.name.split(".").pop() || "jpg";
  const name = `${user.id}/${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage.from(BUCKET).upload(name, bytes, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    console.error("Ad image upload error:", error);
    return { error: error.message || "Upload failed" };
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(name);
  return { url: urlData.publicUrl };
}

/** Create or update advertisement. Editors can create/update; admins can delete (separate action). */
export async function saveAdvertisement(
  data: AdFormData & { id?: string }
): Promise<{ success: true; id: string } | { success: false; message: string }> {
  const user = await getUser();
  if (!user) return { success: false, message: "Not signed in" };
  const profile = await getProfile();
  const role = profile?.roleName;
  if (role !== "editor" && role !== "admin") return { success: false, message: "Only editors and admins can manage ads." };

  const supabase = await createClient();
  const payload = {
    image_url: data.image_url.trim(),
    description: data.description?.trim() || null,
    advertiser: data.advertiser?.trim() || null,
    amount_per_month: parseDecimal(data.amount_per_month),
    total_amount: parseDecimal(data.total_amount),
    start_date: data.start_date?.trim() || null,
    end_date: data.end_date?.trim() || null,
    is_active: data.is_active ?? true,
    created_by: data.id ? undefined : user.id,
  };

  if (data.id) {
    const { error } = await supabase.from("advertisements").update(payload).eq("id", data.id);
    if (error) return { success: false, message: error.message };
    revalidatePath("/editor/advertisements");
    revalidatePath("/editor/advertisements/new");
    revalidatePath("/");
    revalidatePath("/article/[slug]", "page");
    return { success: true, id: data.id };
  }

  const { data: row, error } = await supabase.from("advertisements").insert(payload).select("id").single();
  if (error) return { success: false, message: error.message };
  revalidatePath("/editor/advertisements");
  revalidatePath("/editor/advertisements/new");
  revalidatePath("/");
  revalidatePath("/article/[slug]", "page");
  return { success: true, id: row.id };
}

/** Delete advertisement. Admin only. */
export async function deleteAdvertisement(id: string): Promise<{ success: boolean; message: string }> {
  const profile = await getProfile();
  if (profile?.roleName !== "admin") return { success: false, message: "Only admins can delete ads." };

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("advertisements").delete().eq("id", id);
  if (error) return { success: false, message: error.message };
  revalidatePath("/editor/advertisements");
  revalidatePath("/");
  revalidatePath("/article/[slug]", "page");
  return { success: true, message: "Ad deleted" };
}

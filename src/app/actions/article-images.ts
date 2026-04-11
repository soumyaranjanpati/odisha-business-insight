"use server";

import sharp from "sharp";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getProfile, getUser } from "@/lib/auth";

const BUCKET = "article-images";
const MAX_WIDTH = 1920;
const JPEG_QUALITY = 82;

async function compressImageBuffer(bytes: ArrayBuffer, mime: string): Promise<Buffer> {
  const input = Buffer.from(bytes);
  if (mime === "image/gif") return input;

  try {
    let pipeline = sharp(input).rotate();
    const meta = await pipeline.metadata();
    if (meta.width && meta.width > MAX_WIDTH) {
      pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
    }
    if (mime === "image/webp") {
      return pipeline.webp({ quality: JPEG_QUALITY }).toBuffer();
    }
    if (mime === "image/png") {
      return pipeline.png({ compressionLevel: 9 }).toBuffer();
    }
    return pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
  } catch (e) {
    console.warn("Featured image compression skipped:", e);
    return input;
  }
}

/** Upload featured image to article-images bucket; returns public URL. Editor/admin only. */
export async function uploadFeaturedArticleImage(
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  const user = await getUser();
  if (!user) return { error: "Not signed in" };
  const profile = await getProfile();
  const role = profile?.roleName;
  if (role !== "editor" && role !== "admin") {
    return { error: "Only editors and admins can upload images." };
  }

  const file = formData.get("file") as File | null;
  if (!file?.size) return { error: "No file provided" };
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowed.includes(file.type)) {
    return { error: "Invalid file type. Use JPEG, PNG, GIF, or WebP." };
  }
  if (file.size > 5 * 1024 * 1024) return { error: "File must be under 5MB" };

  const supabase = createServiceRoleClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? ext : "jpg";
  const name = `featured/${user.id}/${Date.now()}.${safeExt}`;
  const raw = await file.arrayBuffer();
  const bytes = await compressImageBuffer(raw, file.type);

  const { error } = await supabase.storage.from(BUCKET).upload(name, bytes, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    console.error("Featured image upload error:", error);
    return { error: error.message || "Upload failed. Ensure the article-images bucket exists in Supabase." };
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(name);
  return { url: urlData.publicUrl };
}

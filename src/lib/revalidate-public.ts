import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";

/** Bust public page/data caches after content changes. */
export function revalidatePublicContent(slug?: string) {
  revalidateTag(CACHE_TAGS.articles);
  revalidateTag(CACHE_TAGS.categories);
  revalidateTag(CACHE_TAGS.ads);
  revalidatePath("/");
  if (slug) {
    revalidatePath(`/${slug}`);
    revalidatePath(`/article/${slug}`);
  }
}

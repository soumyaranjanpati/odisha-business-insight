import { getCategories, getTags } from "@/lib/editor-db";
import { ArticleForm } from "../ArticleForm";

export default async function NewArticlePage() {
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Add Post</h1>
      <ArticleForm categories={categories} tags={tags} />
    </div>
  );
}

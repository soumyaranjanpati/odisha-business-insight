import { notFound } from "next/navigation";
import { getCategories, getTags, getArticleBySlugForEditor } from "@/lib/editor-db";
import { getProfile } from "@/lib/auth";
import { ArticleForm } from "../../ArticleForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getProfile();
  const [article, categories, tags] = await Promise.all([
    getArticleBySlugForEditor(slug, profile!.id),
    getCategories(),
    getTags(),
  ]);

  if (!article) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Edit Article</h1>
      <ArticleForm
        categories={categories}
        tags={tags}
        article={article}
      />
    </div>
  );
}

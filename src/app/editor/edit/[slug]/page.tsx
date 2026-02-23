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
  if (!profile) notFound();
  const isAdmin = profile.roleName === "admin";
  const [article, categories, tags] = await Promise.all([
    getArticleBySlugForEditor(slug, profile.id, isAdmin),
    getCategories(),
    getTags(),
  ]);

  if (!article) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Edit Post</h1>
      <ArticleForm
        categories={categories}
        tags={tags}
        article={article}
      />
    </div>
  );
}

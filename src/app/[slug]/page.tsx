import type { Metadata } from "next";
import { ArticlePageView } from "@/components/article/ArticlePageView";
import { generateArticlePageMetadata } from "@/lib/article-metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return generateArticlePageMetadata(slug);
}

/** Clean article URLs: /{slug} (canonical). /article/{slug} remains supported. */
export default async function ArticleBySlugPage({ params }: PageProps) {
  const { slug } = await params;
  return <ArticlePageView slug={slug} />;
}

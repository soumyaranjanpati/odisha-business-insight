import type { Metadata } from "next";
import { ArticlePageView } from "@/components/article/ArticlePageView";
import { generateArticlePageMetadata } from "@/lib/article-metadata";
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return generateArticlePageMetadata(slug);
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  return <ArticlePageView slug={slug} />;
}

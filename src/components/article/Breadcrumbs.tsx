import Link from "next/link";
import { canonicalUrl } from "@/lib/seo";

type Props = {
  categorySlug?: string;
  categoryName?: string | null;
  articleTitle: string;
  articleSlug: string;
};

export function ArticleBreadcrumbs({
  categorySlug,
  categoryName,
  articleTitle,
  articleSlug,
}: Props) {
  const items = [
    {
      name: "Home",
      href: "/",
      item: canonicalUrl("/"),
    },
    ...(categorySlug && categoryName
      ? [
          {
            name: categoryName,
            href: `/category/${categorySlug}`,
            item: canonicalUrl(`/category/${categorySlug}`),
          },
        ]
      : []),
    {
      name: articleTitle,
      href: `/article/${articleSlug}`,
      item: canonicalUrl(`/article/${articleSlug}`),
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="mb-2 text-xs text-gray-500 sm:mb-3 sm:text-sm"
      >
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          {categorySlug && categoryName && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/category/${categorySlug}`}
                  className="hover:underline"
                >
                  {categoryName}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">/</li>
          <li className="truncate max-w-[60vw] sm:max-w-xs">
            <span className="text-gray-600">{articleTitle}</span>
          </li>
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}


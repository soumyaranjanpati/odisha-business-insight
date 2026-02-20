"use client";

export function ShareBar({ title, slug }: { title: string; slug: string }) {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "https://odisha-business-insight.vercel.app";
  const url = `${baseUrl}/article/${slug}`;

  const links = [
    {
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      label: "Twitter",
    },
    {
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      label: "LinkedIn",
    },
    {
      href: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
      label: "WhatsApp",
    },
  ];

  return (
    <div className="mt-10 border-t border-gray-200 pt-6">
      <p className="text-sm font-medium text-gray-700">Share this article</p>
      <div className="mt-2 flex gap-3">
        {links.map(({ href, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:underline"
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

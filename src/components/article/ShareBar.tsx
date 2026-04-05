"use client";

import { getBaseUrl } from "@/lib/seo";

export function ShareBar({ title, slug }: { title: string; slug: string }) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : getBaseUrl();
  const url = `${baseUrl}/article/${slug}`;

  const links = [
    {
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      label: "Facebook",
    },
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
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
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

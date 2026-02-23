import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { HeaderWithAuth } from "@/components/layout/HeaderWithAuth";
import { HeaderSkeleton } from "@/components/layout/HeaderSkeleton";
import { Footer } from "@/components/layout/Footer";
import { Preconnect } from "@/components/seo/Preconnect";
import { getBaseUrl, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

// Ensure auth (header role) is never cached so role-based nav is correct
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1877F2",
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: `${SITE_NAME} | Business News & Economy`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["Odisha", "business", "economy", "MSME", "startups", "policy", "infrastructure"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE_NAME,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: getBaseUrl(),
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${getBaseUrl()}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-ink antialiased">
        <Preconnect />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Suspense fallback={<HeaderSkeleton />}>
          <HeaderWithAuth />
        </Suspense>
        <main className="flex-1" id="main-content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

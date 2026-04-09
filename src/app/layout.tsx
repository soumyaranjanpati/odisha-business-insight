import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import { HeaderWithAuth } from "@/components/layout/HeaderWithAuth";
import { HeaderSkeleton } from "@/components/layout/HeaderSkeleton";
import { Footer } from "@/components/layout/Footer";
import { Preconnect } from "@/components/seo/Preconnect";
import { getBaseUrl, getWebSiteSchemaUrl, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

// Ensure auth (header role) is never cached so role-based nav is correct
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1877F2",
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} | Business, Policy & Growth News`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["Odisha", "business", "economy", "MSME", "startups", "policy", "infrastructure"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "Odisha Economy News",
  description: SITE_DESCRIPTION,
  url: getWebSiteSchemaUrl(),
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${getBaseUrl()}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: getWebSiteSchemaUrl(),
  logo: `${getBaseUrl()}/logo.png`,
  sameAs: [
    process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL,
    process.env.NEXT_PUBLIC_SOCIAL_TWITTER_URL,
    process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL,
  ].filter(Boolean),
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-ink antialiased">
        <Preconnect />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
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

import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";
import { APP_VERSION } from "@/lib/version";

const CATEGORIES = [
  { slug: "economy", name: "Economy" },
  { slug: "msme", name: "MSME" },
  { slug: "startups", name: "Startups" },
  { slug: "policy", name: "Policy" },
  { slug: "infrastructure", name: "Infrastructure" },
  { slug: "markets", name: "Markets" },
];

export async function Footer() {
  const year = new Date().getFullYear();
  const profile = await getProfile();
  const isAdmin = profile?.roleName === "admin";

  return (
    <footer className="mt-auto border-t border-fb-footer-border bg-fb-footer">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="headline text-lg font-semibold text-white">{SITE_NAME}</h3>
            <p className="mt-2 text-sm text-gray-400">{SITE_DESCRIPTION}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Categories
            </h4>
            <ul className="mt-3 space-y-2">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Company
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/editorial-policy" className="text-sm text-gray-400 hover:text-white">
                  Editorial Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-gray-400 hover:text-white">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/subscribe" className="text-sm text-gray-400 hover:text-white">
                  Subscribe
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Legal
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-use" className="text-sm text-gray-400 hover:text-white">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/corrections-policy" className="text-sm text-gray-400 hover:text-white">
                  Corrections Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-fb-footer-border pt-8 text-center text-sm text-gray-500">
          &copy; {year} {SITE_NAME}. All rights reserved.
          {isAdmin && (
            <span className="ml-2 text-xs text-gray-600" title="Visible to admins only">
              v{APP_VERSION}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}

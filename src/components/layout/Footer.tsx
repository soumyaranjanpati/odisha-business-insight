import Link from "next/link";

const CATEGORIES = [
  { slug: "economy", name: "Economy" },
  { slug: "msme", name: "MSME" },
  { slug: "startups", name: "Startups" },
  { slug: "policy", name: "Policy" },
  { slug: "infrastructure", name: "Infrastructure" },
  { slug: "markets", name: "Markets" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="headline text-lg font-semibold text-ink">Odisha Business Insight</h3>
            <p className="mt-2 text-sm text-gray-600">
              Your trusted source for business news, economy and policy updates from Odisha.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Categories
            </h4>
            <ul className="mt-3 space-y-2">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="text-sm text-gray-600 hover:text-primary-600"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Company
            </h4>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-primary-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-primary-600">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-gray-600 hover:text-primary-600">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/subscribe" className="text-sm text-gray-600 hover:text-primary-600">
                  Subscribe
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Newsletter
            </h4>
            <p className="mt-3 text-sm text-gray-600">
              Stay updated. Sign up for our newsletter on the homepage.
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          &copy; {year} Odisha Business Insight. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

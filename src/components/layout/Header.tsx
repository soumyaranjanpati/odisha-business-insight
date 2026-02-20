"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/category/economy", label: "Economy" },
  { href: "/category/msme", label: "MSME" },
  { href: "/category/startups", label: "Startups" },
  { href: "/category/policy", label: "Policy" },
  { href: "/category/infrastructure", label: "Infrastructure" },
  { href: "/category/markets", label: "Markets" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="headline text-xl font-bold text-ink hover:text-primary-700 sm:text-2xl"
        >
          Odisha Business Insight
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.slice(0, 7).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-gray-100 text-ink"
                  : "text-gray-600 hover:bg-gray-50 hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/search"
            className="rounded px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-ink"
            aria-label="Search"
          >
            Search
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="rounded p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            aria-label="Search"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="hidden rounded bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 md:block"
          >
            Editor Login
          </Link>
          <button
            type="button"
            className="rounded p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <span className="text-xl font-bold">&times;</span>
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block rounded px-3 py-2 text-sm font-medium",
                    pathname === link.href ? "bg-gray-100 text-ink" : "text-gray-600"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                className="block rounded bg-primary-600 px-3 py-2 text-sm font-medium text-white"
                onClick={() => setMobileOpen(false)}
              >
                Editor Login
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

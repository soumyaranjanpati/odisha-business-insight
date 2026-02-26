"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CATEGORY_NAV } from "@/lib/categories";
import type { UserRole } from "@/types";

export type NavAuth = {
  user: { id: string; email?: string } | null;
  profile: { id: string; roleName: UserRole; display_name: string | null } | null;
};

const CATEGORY_LINKS = CATEGORY_NAV.map((c) => ({ href: `/category/${c.slug}`, label: c.name }));

export function Header({ auth }: { auth: NavAuth }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const { user, profile } = auth;
  const role: UserRole | null = profile?.roleName ?? null;
  const isEditor = role === "editor" || role === "admin";
  const isAdmin = role === "admin";
  const displayName = profile?.display_name?.trim() || user?.email?.split("@")[0] || "User";

  const link = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={cn(
        "rounded px-3 py-2 text-sm font-medium text-white transition-colors",
        pathname === href ? "bg-white/20" : "hover:bg-white/10"
      )}
    >
      {label}
    </Link>
  );

  // Desktop: hover; Mobile: click
  const handleCategoriesEnter = () => {
    if (window.innerWidth >= 768) setCategoriesOpen(true);
  };
  const handleCategoriesLeave = () => {
    if (window.innerWidth >= 768) setCategoriesOpen(false);
  };
  const handleCategoriesClick = () => {
    if (window.innerWidth < 768) setCategoriesOpen((o) => !o);
  };

  // Keyboard: Escape to close, Enter/Space to toggle
  const handleCategoriesKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setCategoriesOpen(false);
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (window.innerWidth < 768) setCategoriesOpen((o) => !o);
      else setCategoriesOpen(true);
    }
  };

  // Close mobile menu on click outside
  useEffect(() => {
    if (!mobileOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [mobileOpen]);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-fb-hover bg-fb shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center transition-opacity hover:opacity-90"
          aria-label="Odisha Business Insight - Home"
        >
          <Image
            src="/logo.png"
            alt="Odisha Business Insight"
            width={220}
            height={56}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {link("/", "Home")}
          <div
            ref={categoriesRef}
            className="relative"
            onMouseEnter={handleCategoriesEnter}
            onMouseLeave={handleCategoriesLeave}
          >
            <button
              type="button"
              onClick={handleCategoriesClick}
              onKeyDown={handleCategoriesKeyDown}
              aria-expanded={categoriesOpen}
              aria-haspopup="true"
              aria-controls="categories-menu"
              id="categories-trigger"
              className={cn(
                "rounded px-3 py-2 text-sm font-medium text-white transition-colors duration-200",
                categoriesOpen ? "bg-white/20" : "hover:bg-white/10"
              )}
            >
              Categories
            </button>
            <div
              id="categories-menu"
              role="menu"
              aria-labelledby="categories-trigger"
              className={cn(
                "absolute left-0 top-full z-20 mt-1 w-52 max-h-[70vh] overflow-y-auto overflow-x-hidden rounded-md border border-fb-footer-border bg-fb-dark shadow-lg transition-all duration-200 ease-out",
                categoriesOpen ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1 opacity-0"
              )}
            >
              {CATEGORY_LINKS.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  role="menuitem"
                  className="block px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
                  onClick={() => setCategoriesOpen(false)}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
          {isEditor && link("/editor", "My Posts")}
          {isEditor && (
            <Link
              href="/editor/new"
              className={cn(
                "rounded px-4 py-2 text-sm font-medium transition-colors",
                pathname === "/editor/new"
                  ? "bg-white text-fb shadow-sm hover:bg-gray-100"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              Add Post
            </Link>
          )}
          {isAdmin && link("/admin/users", "Users")}
          {isAdmin && link("/admin", "Admin Panel")}
          <Link
            href="/search"
            className="rounded px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
            aria-label="Search"
          >
            Search
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="rounded p-2 text-white hover:bg-white/10 md:hidden"
            aria-label="Search"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>
          {!user ? (
            <>
              <Link
                href="/auth/login"
                className="hidden rounded bg-white px-4 py-2 text-sm font-medium text-fb hover:bg-gray-100 md:block"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="hidden rounded border border-white/80 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-white/10 md:block"
              >
                Signup
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/profile"
                className="hidden rounded px-3 py-2 text-sm font-medium text-white hover:bg-white/10 md:block"
              >
                Profile
              </Link>
              <span className="hidden text-sm font-medium text-white md:inline">
                Hi, {displayName}
                {role && (
                  <span className="ml-1.5 rounded bg-white/20 px-1.5 py-0.5 text-xs" title="Your role">
                    ({role})
                  </span>
                )}
              </span>
              <form action="/api/auth/signout" method="post" className="hidden md:block">
                <button
                  type="submit"
                  className="rounded px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
                >
                  Logout
                </button>
              </form>
            </>
          )}
          <button
            type="button"
            className="rounded p-2 text-white hover:bg-white/10 md:hidden"
            onClick={(e) => {
              e.stopPropagation();
              setMobileOpen((o) => !o);
            }}
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
        <nav
          className="border-t border-fb-hover bg-fb-dark px-4 py-3 md:hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="flex flex-col gap-1">
            <li>{link("/", "Home")}</li>
            <li>
              <span className="block px-3 py-2 text-sm font-medium text-white/80">Categories</span>
              <ul className="pl-4">
                {CATEGORY_LINKS.map((c) => (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      className="block rounded px-3 py-2 text-sm text-white hover:bg-white/10"
                      onClick={() => setMobileOpen(false)}
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            {isEditor && <li>{link("/editor", "My Posts")}</li>}
            {isEditor && (
              <li>
                <Link
                  href="/editor/new"
                  className={cn(
                    "block rounded px-3 py-2 text-sm font-medium",
                    pathname === "/editor/new"
                      ? "bg-white text-fb"
                      : "text-white hover:bg-white/10"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  Add Post
                </Link>
              </li>
            )}
            {isAdmin && <li>{link("/admin/users", "Users")}</li>}
            {isAdmin && <li>{link("/admin", "Admin Panel")}</li>}
            <li>
              <Link
                href="/search"
                className="block rounded px-3 py-2 text-sm text-white hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
              >
                Search
              </Link>
            </li>
            {!user ? (
              <>
                <li>
                  <Link
                    href="/auth/login"
                    className="block rounded bg-white px-3 py-2 text-sm font-medium text-fb"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/signup"
                    className="block rounded border border-white/80 px-3 py-2 text-sm font-medium text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Signup
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/profile"
                    className="block rounded px-3 py-2 text-sm text-white hover:bg-white/10"
                    onClick={() => setMobileOpen(false)}
                  >
                    Profile
                  </Link>
                </li>
                <li className="rounded px-3 py-2 text-sm text-white">
                  Hi, {displayName}
                  {role && <span className="ml-1.5 text-white/80">({role})</span>}
                </li>
                <li>
                  <form action="/api/auth/signout" method="post">
                    <button
                      type="submit"
                      className="block w-full rounded px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                    >
                      Logout
                    </button>
                  </form>
                </li>
              </>
            )}
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

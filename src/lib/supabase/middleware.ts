import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/editor" ||
    pathname.startsWith("/editor/") ||
    pathname.startsWith("/admin") ||
    pathname === "/auth/login" ||
    pathname === "/profile"
  );
}

/**
 * Middleware: refresh auth session and protect /editor and /admin routes.
 * Public pages use a lighter session refresh (no remote getUser validation).
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  if (!isProtectedPath(pathname)) {
    await supabase.auth.getSession();
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isEditorAppRoute = pathname === "/editor" || pathname.startsWith("/editor/");
  if (isEditorAppRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (pathname === "/auth/login" && user) {
    const redirect = request.nextUrl.searchParams.get("redirect") || "/";
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  if (pathname === "/profile" && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

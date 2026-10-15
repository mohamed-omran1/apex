import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next 16 Proxy (formerly Middleware). Optimistic checks only: refresh the
 * Supabase session, bounce obvious unauthenticated hits off /admin, and
 * flag non admin sessions. The load bearing gates are the admin layout and
 * every Server Action, both of which re read the session; RLS enforces the
 * same JWT claim in the database.
 */

const ADMIN_PREFIX = "/admin";

function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
}

function safeNextPath(pathname: string): string {
  // Accept only nested /admin paths. Rejects //, backslashes, absolute URLs.
  return /^\/admin(\/[a-z0-9/_-]+)?$/i.test(pathname) ? pathname : "/admin/inbox";
}

async function refreshSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return null;
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refreshes the session (rotation) as a side effect.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isAdminPath(pathname)) {
    return NextResponse.next();
  }

  const refreshed = await refreshSession(request);
  if (!refreshed) {
    // Env not ready; fail closed for admin paths.
    const signIn = new URL("/admin/sign-in", request.url);
    return NextResponse.redirect(signIn);
  }

  const { response, user } = refreshed;
  const signInUrl = new URL("/admin/sign-in", request.url);

  // Already on sign-in: let the page handle it.
  if (pathname === "/admin/sign-in") {
    if (user?.app_metadata?.role === "admin") {
      return NextResponse.redirect(new URL("/admin/inbox", request.url));
    }
    response.headers.set("x-admin-pathname", pathname);
    return response;
  }

  // Optimistic: no session at all.
  if (!user) {
    signInUrl.searchParams.set("next", safeNextPath(pathname) + search);
    return NextResponse.redirect(signInUrl);
  }

  // Optimistic: session exists but the role claim is missing. The layout
  // re checks authoritatively before render; this just saves a flash.
  if (user.app_metadata?.role !== "admin") {
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

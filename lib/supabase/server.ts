import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Add it to .env.local.`);
  }
  return value;
}

/**
 * Anon (publishable key) client for Server Components and Server Actions.
 * Deliberately cookie free: the public routes are static under
 * `ensureStatic = "navigation"`, so cached code may not touch next/headers.
 * RLS is the protection; no user session is involved on the lead path.
 */
export function createPublicClient() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey = requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // No session on the public read and lead insert path.
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS, so it must only be used inside the
 * lead action for the duplicate guard and lead_events writes. Never call
 * this from a component or anything that reaches the browser. The key
 * lives in .env.local only and is never listed in .env.example.
 */
export function createServiceClient() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createServerClient<Database>(url, serviceRoleKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // No session handling for the service role client.
      },
    },
  });
}

/**
 * Session aware client for admin Server Components, Server Actions and
 * route handlers. Reads and writes the @supabase/ssr auth cookies. RLS
 * enforces the JWT app_metadata role claim; this client only carries the
 * session. Only call from a request context (cookies() is available).
 */
export async function createSessionClient() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey = requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component; middleware/proxy refreshes
          // the session instead. Writes happen in actions and handlers.
        }
      },
    },
  });
}

/**
 * True when the session user carries app_metadata.role = "admin".
 * Always re check this in every admin action; never trust the client.
 */
export function isAdminUser(user: {
  app_metadata: Record<string, unknown>;
} | null): boolean {
  return user?.app_metadata?.role === "admin";
}

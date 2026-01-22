import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database-types";

/**
 * Creates a Supabase client for use in the browser.
 * This client handles authentication with cookie-based sessions.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

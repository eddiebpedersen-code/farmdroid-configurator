import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { AdminUserRow } from "@/lib/admin/types";
import type { User } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for use in Server Components and API Routes.
 * This client handles authentication with cookie-based sessions.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

interface AdminUserResult {
  auth: User;
  admin: AdminUserRow;
}

/**
 * Gets the current authenticated user and their admin profile.
 * Returns null if not authenticated or not an admin.
 */
export async function getAdminUser(): Promise<AdminUserResult | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", user.email!)
    .single();

  if (adminError || !adminUser) {
    return null;
  }

  return {
    auth: user,
    admin: adminUser as AdminUserRow,
  };
}

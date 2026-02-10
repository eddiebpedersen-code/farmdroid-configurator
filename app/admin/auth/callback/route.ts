import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const cookieStore = await cookies();

  // Get redirect destination from cookie (set during login) or fallback to query param or /admin
  const redirectCookie = cookieStore.get("admin_redirect")?.value;
  const redirect = redirectCookie
    ? decodeURIComponent(redirectCookie)
    : searchParams.get("redirect") || "/admin";

  const supabase = createServerClient(
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
          }
        },
      },
    }
  );

  // Handle magic link (OTP) verification
  if (token_hash && type === "magiclink") {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: "magiclink",
    });

    if (error || !data.user) {
      console.error("Magic link verification error:", error);
      return NextResponse.redirect(
        `${origin}/admin/login?error=auth_failed`
      );
    }

    // Check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id, role")
      .eq("email", data.user.email!)
      .single();

    if (adminError || !adminUser) {
      // User authenticated but not an admin - sign them out
      await supabase.auth.signOut();
      return NextResponse.redirect(
        `${origin}/admin/login?error=unauthorized`
      );
    }

    // Update last login timestamp
    await supabase
      .from("admin_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", adminUser.id);

    // Clear the redirect cookie and redirect to the requested page
    const response = NextResponse.redirect(`${origin}${redirect}`);
    response.cookies.set("admin_redirect", "", { path: "/", maxAge: 0 });
    return response;
  }

  // Handle OAuth code exchange (fallback if OAuth is added later)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        `${origin}/admin/login?error=auth_failed`
      );
    }

    // Check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id, role")
      .eq("email", data.user.email!)
      .single();

    if (adminError || !adminUser) {
      // User authenticated but not an admin - sign them out
      await supabase.auth.signOut();
      return NextResponse.redirect(
        `${origin}/admin/login?error=unauthorized`
      );
    }

    // Update last login timestamp
    await supabase
      .from("admin_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", adminUser.id);

    // Clear the redirect cookie and redirect to the requested page
    const response = NextResponse.redirect(`${origin}${redirect}`);
    response.cookies.set("admin_redirect", "", { path: "/", maxAge: 0 });
    return response;
  }

  // No code or token provided - redirect to login
  return NextResponse.redirect(`${origin}/admin/login?error=no_code`);
}

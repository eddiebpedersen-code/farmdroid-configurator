import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/auth-server";
import type { AdminUserInsert } from "@/lib/admin/types";

// GET /api/admin/users - List all admin users
export async function GET() {
  try {
    const supabase = await createClient();

    // Verify current user is authenticated and is a super_admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: currentAdmin, error: adminError } = await supabase
      .from("admin_users")
      .select("role")
      .eq("email", user.email!)
      .single();

    if (adminError || !currentAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super_admins can list users
    if (currentAdmin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all admin users
    const { data: users, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error("Users API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new admin user
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify current user is authenticated and is a super_admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: currentAdmin, error: adminError } = await supabase
      .from("admin_users")
      .select("role")
      .eq("email", user.email!)
      .single();

    if (adminError || !currentAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super_admins can create users
    if (currentAdmin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { email, name, role } = body as AdminUserInsert;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    if (!["super_admin", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user already exists
    const { data: existing } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create the user
    const { data: newUser, error } = await supabase
      .from("admin_users")
      .insert({ email, name, role })
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Users API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

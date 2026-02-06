import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/auth-server";
import type { AdminUserUpdate } from "@/lib/admin/types";

// PUT /api/admin/users/[id] - Update an admin user
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      .select("id, role")
      .eq("email", user.email!)
      .single();

    if (adminError || !currentAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, role, notify_on_new_config } = body as AdminUserUpdate;

    // Non-super_admins can only update their own notification preference
    if (currentAdmin.role !== "super_admin") {
      if (currentAdmin.id !== id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      // Non-super_admins can only change notify_on_new_config on their own account
      if (role !== undefined || name !== undefined) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Prevent super_admins from changing their own role
    if (currentAdmin.id === id && role !== undefined) {
      return NextResponse.json(
        { error: "Cannot modify your own role" },
        { status: 400 }
      );
    }

    if (role && !["super_admin", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updateData: AdminUserUpdate = {
      updated_at: new Date().toISOString(),
    };
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (notify_on_new_config !== undefined) updateData.notify_on_new_config = notify_on_new_config;

    const { data: updatedUser, error } = await supabase
      .from("admin_users")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Users API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete an admin user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      .select("id, role")
      .eq("email", user.email!)
      .single();

    if (adminError || !currentAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super_admins can delete users
    if (currentAdmin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prevent self-deletion
    if (currentAdmin.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("admin_users")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Users API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

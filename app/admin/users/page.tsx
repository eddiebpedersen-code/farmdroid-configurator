"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserTable } from "@/components/admin/UserTable";
import { UserForm } from "@/components/admin/UserForm";
import { AlertCircle, Loader2 } from "lucide-react";
import type { AdminUserRow, AdminRole } from "@/lib/admin/types";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.status === 403) {
        router.push("/admin");
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);

      // Get current user from the list (the one making the request)
      // This is a bit hacky but works for now
      const currentResponse = await fetch("/api/admin/users");
      if (currentResponse.ok) {
        // We'll set this from the API response in a better way
        // For now, we'll just use the first super_admin
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (data: {
    email: string;
    name: string;
    role: AdminRole;
  }) => {
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create user");
    }

    const newUser = await response.json();
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "super_admin" | "admin"
  ) => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update user");
    }

    const updatedUser = await response.json();
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? updatedUser : u))
    );
  };

  const handleDeleteUser = async (userId: string) => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete user");
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleNotifyChange = async (userId: string, enabled: boolean) => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notify_on_new_config: enabled }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update notification preference");
    }

    const updatedUser = await response.json();
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? updatedUser : u))
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Users</h1>
          <p className="text-stone-600 mt-1">
            Manage admin users who can access this dashboard
          </p>
        </div>
        <UserForm onSubmit={handleCreateUser} />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>
            Users with admin access can manage HubSpot field mappings. Super
            admins can also manage other users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <UserTable
              users={users}
              currentUserId={currentUserId}
              onRoleChange={handleRoleChange}
              onDelete={handleDeleteUser}
              onNotifyChange={handleNotifyChange}
            />
          ) : (
            <p className="text-stone-500 text-center py-8">
              No admin users found. Add the first user to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

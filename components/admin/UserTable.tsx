"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Trash2, Shield, ShieldCheck } from "lucide-react";
import type { AdminUserRow } from "@/lib/admin/types";

interface UserTableProps {
  users: AdminUserRow[];
  currentUserId: string;
  onRoleChange: (userId: string, newRole: "super_admin" | "admin") => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}

export function UserTable({
  users,
  currentUserId,
  onRoleChange,
  onDelete,
}: UserTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUserRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteClick = (user: AdminUserRow) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsLoading(true);
    try {
      await onDelete(userToDelete.id);
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleRoleChange = async (
    user: AdminUserRow,
    newRole: "super_admin" | "admin"
  ) => {
    setIsLoading(true);
    try {
      await onRoleChange(user.id, newRole);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>{user.name || "-"}</TableCell>
              <TableCell>
                <Badge
                  variant={user.role === "super_admin" ? "default" : "secondary"}
                >
                  {user.role === "super_admin" ? (
                    <ShieldCheck className="w-3 h-3 mr-1" />
                  ) : (
                    <Shield className="w-3 h-3 mr-1" />
                  )}
                  {user.role.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                {user.last_login_at
                  ? new Date(user.last_login_at).toLocaleDateString()
                  : "Never"}
              </TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {user.id !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isLoading}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.role === "admin" ? (
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user, "super_admin")}
                        >
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Make Super Admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user, "admin")}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {userToDelete?.email}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

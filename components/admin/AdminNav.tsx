"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  LogOut,
  Settings,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/auth-client";
import { useRouter } from "next/navigation";
import type { AdminRole } from "@/lib/admin/types";

interface AdminNavProps {
  userEmail: string;
  userRole: AdminRole;
}

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "admin"] as AdminRole[],
  },
  {
    href: "/admin/mappings",
    label: "Field Mappings",
    icon: GitBranch,
    roles: ["super_admin", "admin"] as AdminRole[],
  },
  {
    href: "/admin/verified-configs",
    label: "Verified Configs",
    icon: CheckCircle2,
    roles: ["super_admin", "admin"] as AdminRole[],
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    roles: ["super_admin"] as AdminRole[],
  },
];

export function AdminNav({ userEmail, userRole }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-stone-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-stone-700">
        <h1 className="text-xl font-bold">FarmDroid Admin</h1>
        <p className="text-sm text-stone-400 mt-1">Configuration Manager</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-green-600 text-white"
                      : "text-stone-300 hover:bg-stone-800 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-stone-700">
        <div className="px-4 py-2 mb-2">
          <p className="text-sm text-stone-400 truncate">{userEmail}</p>
          <p className="text-xs text-stone-500 capitalize">
            {userRole.replace("_", " ")}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

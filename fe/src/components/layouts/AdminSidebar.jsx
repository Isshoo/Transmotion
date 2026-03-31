"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  Database,
  BrainCircuit,
  Cpu,
} from "lucide-react";
import { cn } from "@/libs/utils";
import useAuthStore from "@/features/auth/store";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Dataset", href: "/admin/datasets", icon: Database },
  { label: "Training", href: "/admin/training", icon: BrainCircuit },
  { label: "Model", href: "/admin/models", icon: Cpu },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  return (
    <aside className="flex h-full w-64 flex-col border-r">
      <div className="flex h-16 items-center border-b px-6 font-semibold">
        Transmotion Admin
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              pathname.startsWith(href)
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4">
        <button
          onClick={() => logout()}
          className="w-full rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

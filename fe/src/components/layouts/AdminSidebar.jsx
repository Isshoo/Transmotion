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
  FlaskConical,
  BarChart2,
} from "lucide-react";
import { cn } from "@/libs/utils";
import useAuthStore from "@/features/auth/store";
import { ColabStatusBadge } from "@/features/admin/training/components/ui/Badge";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Dataset", href: "/admin/datasets", icon: Database },
  { label: "Training", href: "/admin/training", icon: BrainCircuit },
  { label: "Model", href: "/admin/models", icon: Cpu },
  { label: "Testing", href: "/admin/testing", icon: FlaskConical },
  { label: "Evaluasi", href: "/admin/evaluation", icon: BarChart2 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6 font-semibold text-gray-800">
        Transmotion Admin
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === href ||
                (href !== "/admin" && pathname.startsWith(href))
                ? "bg-blue-50 font-medium text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-4 py-2">
        <ColabStatusBadge />
      </div>
      <div className="border-t p-4">
        <button
          onClick={() => logout()}
          className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

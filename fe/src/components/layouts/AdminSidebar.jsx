"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Database,
  BrainCircuit,
  Cpu,
  FlaskConical,
  BarChart2,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/libs/utils";
import useAuthStore from "@/features/auth/store";
import ColabStatusBadge from "../ui/ColabStatusBadge";
import ThemeToggle from "../ui/ThemeToggle";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Datasets", href: "/admin/datasets", icon: Database },
  { label: "Training", href: "/admin/training", icon: BrainCircuit },
  { label: "Models", href: "/admin/models", icon: Cpu },
  { label: "Evaluation", href: "/admin/evaluation", icon: BarChart2 },
  { label: "Testing", href: "/admin/testing", icon: FlaskConical },
  { label: "Users", href: "/admin/users", icon: Users },
];

export default function AdminSidebar({ onClose }) {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-(--border-default) bg-(--bg-surface) shadow-(--shadow-sm) md:shadow-none">
      {/* Brand */}
      <div className="mt-2 flex h-16 shrink-0 items-center justify-between border-b border-(--border-subtle) px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-(--accent) shadow-(--shadow-glow-accent)">
            <BrainCircuit size={14} className="text-(--bg-base)" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-(--text-primary)">
              Transmotion
            </span>
            <span className="text-[10px] font-medium text-(--text-secondary)">
              Admin Dashboard
            </span>
          </div>
        </div>
        {/* Tombol Close khusus mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-(--text-tertiary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary) md:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="scrollbar-thin scrollbar-thumb-(--border-strong) flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/admin" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                    isActive
                      ? "bg-(--accent-muted)/10 font-bold text-(--accent)"
                      : "font-medium text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive
                        ? "text-(--accent)"
                        : "text-(--text-tertiary) group-hover:text-(--text-secondary)"
                    )}
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Colab Status */}
      <div className="px-4 pb-1">
        <ColabStatusBadge />
      </div>

      {/* Logout & Theme Toggle */}
      <div className="flex items-center gap-2 border-t border-(--border-subtle) p-4">
        <ThemeToggle />
        <button
          onClick={() => logout()}
          className="group flex flex-1 items-center justify-center gap-2 rounded-lg border border-(--border-default) bg-(--bg-elevated) px-3 py-2.5 text-sm font-bold tracking-wide text-(--text-secondary) transition-all duration-150 hover:border-(--error-muted) hover:bg-(--error-muted) hover:text-(--error) focus:ring-2 focus:ring-(--error-muted) focus:outline-none"
        >
          <LogOut
            size={16}
            className="shrink-0 transition-transform group-hover:scale-110"
          />
          Logout
        </button>
      </div>
    </aside>
  );
}

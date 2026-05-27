"use client";

import Link from "next/link";
import useAuthStore from "@/features/auth/store";
import { BrainCircuit, LogOut } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-(--border-subtle) bg-(--bg-surface)/80 px-6 backdrop-blur-md">
      {/* Brand */}
      <Link
        href="/"
        className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-(--accent) shadow-(--shadow-glow-accent)">
          <BrainCircuit size={13} className="text-white" />
        </div>
        <span className="text-md font-semibold tracking-tight text-(--text-primary)">
          Transmotion
        </span>
      </Link>

      {/* Nav actions */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-2">
            {user.role === "admin" ? (
              <Link
                href="/admin"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-(--text-secondary) transition-all duration-150 hover:bg-(--bg-overlay) hover:text-(--text-primary)"
              >
                Admin Panel
              </Link>
            ) : (
              <span className="text-sm text-(--text-secondary)">
                {user.name}
              </span>
            )}
            <ThemeToggle />
            <button
              onClick={() => logout()}
              className="group flex h-9 w-9 items-center justify-center rounded-md border border-(--border-default) bg-(--bg-surface) text-(--text-secondary) transition-all duration-150 hover:bg-(--bg-overlay) hover:text-(--error) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-muted)"
              title={`Keluar`}
            >
              <LogOut
                size={16}
                className="transition-transform hover:scale-110"
              />
            </button>
          </div>
        ) : (
          <>
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center rounded-md bg-(--accent) px-4 py-1.5 text-sm font-medium text-white transition-all duration-150 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98]"
            >
              Login
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

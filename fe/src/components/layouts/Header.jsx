"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuthStore from "@/features/auth/store";
import { BrainCircuit, LogOut, Menu, X } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-40 w-full border-b border-(--border-subtle) bg-(--bg-surface)/80 shadow-(--shadow-sm) backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-(--accent) shadow-(--shadow-glow-accent)">
            <BrainCircuit size={13} className="text-(--bg-base)" />
          </div>
          <span className="text-md font-semibold tracking-tight text-(--text-primary)">
            Transmotion
          </span>
        </Link>

        {/* Desktop Nav actions */}
        <div className="hidden items-center gap-4 md:flex">
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
                <nav className="mr-2 flex items-center gap-1">
                  <Link
                    href="/"
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                      pathname === "/"
                        ? "bg-(--bg-overlay) text-(--text-primary)"
                        : "text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href="/classifier"
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                      pathname === "/classifier"
                        ? "bg-(--bg-overlay) text-(--text-primary)"
                        : "text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                    }`}
                  >
                    Classifier
                  </Link>
                  <div className="mr-4 ml-2 h-5 w-px bg-(--text-primary)" />
                  <span className="text-sm font-medium text-(--text-primary)">
                    {user.name}
                  </span>
                </nav>
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
                className="inline-flex items-center rounded-md bg-(--accent) px-4 py-1.5 text-sm font-medium text-(--bg-base) transition-all duration-150 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98]"
              >
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile Nav toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-(--border-default) bg-(--bg-surface) text-(--text-secondary) transition-all hover:bg-(--bg-overlay)"
          >
            {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-14 left-0 flex w-full flex-col gap-3 border-t border-(--border-subtle) bg-(--bg-surface) px-4 py-4 shadow-lg md:hidden">
          {user ? (
            <>
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-(--text-secondary) transition-all hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                >
                  Admin Panel
                </Link>
              ) : (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${
                      pathname === "/"
                        ? "bg-(--bg-overlay) text-(--text-primary)"
                        : "text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href="/classifier"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${
                      pathname === "/classifier"
                        ? "bg-(--bg-overlay) text-(--text-primary)"
                        : "text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                    }`}
                  >
                    Classifier
                  </Link>
                </div>
              )}

              <div className="mt-2 flex items-center gap-2 border-b border-(--border-subtle) pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--accent)/10 font-semibold text-(--accent)">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-(--text-primary)">
                    {user.name}
                  </span>
                  <span className="text-xs text-(--text-secondary) capitalize">
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-(--error) transition-all hover:bg-red-500/10"
              >
                <LogOut size={16} />
                Keluar
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--bg-base) transition-all hover:bg-(--accent-hover)"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

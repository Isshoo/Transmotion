"use client";

import { useEffect, useSyncExternalStore } from "react";
import { redirect } from "next/navigation";
import useAuthStore from "@/features/auth/store";
import Link from "next/link";
import { Loader2, ShieldOff } from "lucide-react";

const subscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

export default function ProtectedRoute({ children, requiredRole }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;

    if (!isAuthenticated) {
      redirect("/login");
    }
  }, [isClient, isAuthenticated]);

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg-base)">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-(--accent)" />
          <p className="text-xs text-(--text-disabled)">Memuat...</p>
        </div>
      </div>
    );
  }

  // Sudah di browser, belum login
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg-base)">
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={20} className="animate-spin text-(--text-tertiary)" />
          <p className="animate-pulse text-xs text-(--text-tertiary)">
            Mengalihkan ke halaman login...
          </p>
        </div>
      </div>
    );
  }

  // Sudah login, tapi role tidak cocok
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-(--bg-base)">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-(--border-default) bg-(--bg-surface) p-8 text-center shadow-(--shadow-lg)">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--error-muted)">
            <ShieldOff size={20} className="text-(--error)" />
          </div>
          <div>
            <p className="text-sm font-medium text-(--text-primary)">
              Akses Ditolak
            </p>
            <p className="mt-1 text-xs text-(--text-tertiary)">
              Anda tidak memiliki akses ke halaman ini.
            </p>
          </div>
          <Link
            href={user?.role === "admin" ? "/admin" : "/"}
            className="inline-flex items-center gap-1.5 rounded-md border border-(--border-default) px-4 py-2 text-xs font-medium text-(--text-secondary) transition-all hover:border-(--accent) hover:bg-(--accent-muted) hover:text-(--accent)"
          >
            Kembali ke halaman utama
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

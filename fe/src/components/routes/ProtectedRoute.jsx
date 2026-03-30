"use client";

import { useEffect, useSyncExternalStore } from "react";
import { redirect } from "next/navigation";
import useAuthStore from "@/features/auth/store";
import Link from "next/link";

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  // Sudah di browser, belum login
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-400">Mengalihkan ke halaman login...</p>
      </div>
    );
  }

  // Sudah login, tapi role tidak cocok
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <p className="text-sm text-gray-400">
          Anda tidak memiliki akses ke halaman ini.
        </p>
        <Link
          href={user?.role === "admin" ? "/admin" : "/"}
          className="text-sm text-blue-600 hover:underline"
        >
          Kembali ke halaman utama
        </Link>
      </div>
    );
  }

  return children;
}

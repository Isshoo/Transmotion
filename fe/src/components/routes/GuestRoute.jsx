"use client";

import { useEffect, useSyncExternalStore } from "react";
import { redirect } from "next/navigation";
import useAuthStore from "@/features/auth/store";

const subscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

export default function GuestRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;

    if (isAuthenticated) {
      if (user?.role === "admin") {
        redirect("/admin");
      } else {
        redirect("/");
      }
    }
  }, [isClient, isAuthenticated, user?.role]);

  if (!isClient) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  // Sudah di browser, belum login
  if (isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-400">Mengalihkan ke halaman utama...</p>
      </div>
    );
  }

  return children;
}

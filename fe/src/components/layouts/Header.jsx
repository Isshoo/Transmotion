"use client";

import Link from "next/link";
import useAuthStore from "@/features/auth/store";

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <Link href="/" className="text-lg font-semibold">
        Transmotion
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-2">
            {user.role === "admin" ? (
              <Link href="/admin" className="text-sm hover:underline">
                Admin Panel
              </Link>
            ) : (
              <span className="text-sm">{user.name}</span>
            )}
            <button
              onClick={() => logout()}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </div>
    </header>
  );
}

"use client";

import useAuthStore from "@/features/auth/store";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h2 className="mb-2 text-xl font-semibold text-gray-800">
          Terjadi Kesalahan
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          {error?.message ||
            "Sesuatu tidak berjalan dengan benar. Silakan coba lagi."}
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Coba Lagi
          </button>
          <Link
            href={user?.role === "admin" ? "/admin" : "/"}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

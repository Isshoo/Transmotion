"use client";

import useAuthStore from "@/features/auth/store";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function GlobalError({ error, reset }) {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--bg-base)">
      <div className="w-full max-w-lg px-4 text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-(--error-muted)/20 shadow-(--shadow-sm)">
          <AlertCircle size={32} className="text-(--error)" />
        </div>

        <h2 className="mb-2 text-2xl font-black tracking-tight text-(--text-primary)">
          An Error Occurred
        </h2>
        <p className="mb-8 text-sm leading-relaxed font-medium text-(--text-secondary)">
          {error?.message ||
            "Something went wrong. Please try again."}
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-(--accent) px-6 py-2.5 text-sm font-bold tracking-wide text-(--bg-base) shadow-(--shadow-md) transition-all hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98]"
          >
            Try Again
          </button>
          <Link
            href={user?.role === "admin" ? "/admin" : "/"}
            className="rounded-xl border border-(--border-strong) bg-(--bg-surface) px-6 py-2.5 text-sm font-bold tracking-wide text-(--text-secondary) transition-all hover:bg-(--bg-overlay) hover:text-(--text-primary) active:scale-[0.98]"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

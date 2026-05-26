"use client";

import useAuthStore from "@/features/auth/store";
import Link from "next/link";

export default function NotFound() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--bg-base)">
      <div className="w-full max-w-lg px-4 text-center">
        {/* 404 besar */}
        <div className="relative mx-auto mb-6 w-fit">
          <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-20 blur-2xl">
            <div className="h-32 w-32 rounded-full bg-(--accent)"></div>
          </div>
          <p className="text-9xl font-black tracking-tighter text-(--text-primary) drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] select-none">
            404
          </p>
        </div>

        <h1 className="mb-2 text-2xl font-black tracking-tight text-(--text-primary)">
          Halaman Tidak Ditemukan
        </h1>
        <p className="mb-8 text-sm leading-relaxed font-medium text-(--text-secondary)">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>

        <Link
          href={user?.role === "admin" ? "/admin" : "/"}
          className="inline-flex items-center gap-2 rounded-xl bg-(--accent) px-6 py-2.5 text-sm font-bold tracking-wide text-white shadow-(--shadow-md) transition-all hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98]"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

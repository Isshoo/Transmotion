"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import useAuthStore from "../store";

function VerifyEmailContent() {
  const { verifyEmail } = useAuthStore();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState(token ? "loading" : "error");
  const [message, setMessage] = useState(
    token ? "" : "Token verifikasi tidak ditemukan."
  );

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      const res = await verifyEmail(token);
      if (res.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setMessage(res.message);
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (status === "loading") {
    return (
      <div className="animate-scale-in mx-auto mt-10 w-full max-w-md rounded-2xl border border-(--border-default) bg-(--bg-elevated) p-8 text-center shadow-(--shadow-md)">
        <div className="mb-6 animate-spin text-5xl">⏳</div>
        <p className="text-sm font-bold text-(--text-secondary)">
          Memverifikasi email kamu...
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="animate-scale-in mx-auto mt-10 w-full max-w-md rounded-2xl border border-(--success-muted)/30 bg-(--bg-elevated) p-8 text-center shadow-(--shadow-md)">
        <div className="mb-4 text-5xl">✅</div>
        <h2 className="mb-2 text-2xl font-black tracking-tight text-(--text-primary)">
          Email Terverifikasi!
        </h2>
        <p className="mb-8 text-sm leading-relaxed font-medium text-(--text-secondary)">
          Akun kamu sudah aktif. Silakan login untuk melanjutkan.
        </p>
        <Link
          href="/login"
          className="inline-block w-full rounded-xl bg-(--accent) px-8 py-3 text-sm font-bold tracking-wide text-white shadow-(--shadow-md) transition-all hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98]"
        >
          Masuk Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-scale-in mx-auto mt-10 w-full max-w-md rounded-2xl border border-(--error-muted)/30 bg-(--bg-elevated) p-8 text-center shadow-(--shadow-md)">
      <div className="mb-4 text-5xl">❌</div>
      <h2 className="mb-2 text-2xl font-black tracking-tight text-(--text-primary)">
        Verifikasi Gagal
      </h2>
      <p className="mb-8 text-sm leading-relaxed font-medium text-(--text-secondary)">
        {message}
      </p>
      <Link
        href="/login"
        className="text-sm font-bold tracking-wide text-(--accent) hover:underline"
      >
        ← Kembali ke halaman masuk
      </Link>
    </div>
  );
}

export default function VerifyEmailForm() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto mt-10 w-full max-w-md animate-pulse rounded-2xl border border-(--border-default) bg-(--bg-elevated) p-8 text-center shadow-(--shadow-md)">
          <div className="mb-6 text-5xl text-(--text-disabled)">⏳</div>
          <p className="text-sm font-bold text-(--text-tertiary)">Memuat...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

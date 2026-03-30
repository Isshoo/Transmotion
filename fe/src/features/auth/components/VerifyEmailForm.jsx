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
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 animate-spin text-4xl">⏳</div>
        <p className="text-sm text-gray-500">Memverifikasi email kamu...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 text-4xl">✅</div>
        <h2 className="mb-2 text-xl font-semibold text-gray-800">
          Email Terverifikasi!
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Akun kamu sudah aktif. Silakan login untuk melanjutkan.
        </p>
        <Link
          href="/login"
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Masuk Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <div className="mb-4 text-4xl">❌</div>
      <h2 className="mb-2 text-xl font-semibold text-gray-800">
        Verifikasi Gagal
      </h2>
      <p className="mb-6 text-sm text-gray-500">{message}</p>
      <Link href="/login" className="text-sm text-blue-600 hover:underline">
        ← Kembali ke halaman masuk
      </Link>
    </div>
  );
}

export default function VerifyEmailForm() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 animate-spin text-4xl">⏳</div>
          <p className="text-sm text-gray-500">Memuat...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

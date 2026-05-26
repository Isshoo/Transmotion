"use client";

import { useState } from "react";
import Link from "next/link";
import useAuthStore from "../store";

export default function ForgotPasswordForm() {
  const { forgotPassword, resendVerification } = useAuthStore();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Tab: forgot-password atau resend-verification
  const [activeTab, setActiveTab] = useState("forgot");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (activeTab === "forgot") {
      const result = await forgotPassword(email);
      if (!result.success) {
        setError(result.message);
      } else {
        setSuccess(true);
      }
    } else {
      const result = await resendVerification(email);
      if (!result.success) {
        setError(result.message);
      } else {
        setSuccess(true);
      }
    }
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="animate-scale-in mx-auto mt-10 w-full max-w-md rounded-2xl border border-(--border-default) bg-(--bg-elevated) p-8 text-center shadow-(--shadow-md)">
        <div className="mb-4 text-5xl">📧</div>
        <h2 className="mb-2 text-2xl font-black tracking-tight text-(--text-primary)">
          Cek email kamu!
        </h2>
        <p className="mb-8 text-sm leading-relaxed font-medium text-(--text-secondary)">
          {activeTab === "forgot"
            ? "Link reset password sudah dikirim ke "
            : "Link verifikasi sudah dikirim ulang ke "}
          <strong className="text-(--text-primary)">{email}</strong>. Cek inbox
          atau folder spam kamu.
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

  return (
    <div className="animate-scale-in mx-auto mt-10 w-full max-w-md rounded-2xl border border-(--border-default) bg-(--bg-elevated) p-8 shadow-(--shadow-md)">
      <h1 className="mb-2 text-3xl font-black tracking-tight text-(--text-primary)">
        Bantuan Akun
      </h1>
      <p className="mb-6 text-sm font-medium text-(--text-secondary)">
        Pilih jenis bantuan yang kamu butuhkan.
      </p>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-(--border-subtle) bg-(--bg-overlay) p-1">
        <button
          onClick={() => {
            setActiveTab("forgot");
            setError(null);
          }}
          className={`flex-1 rounded-lg py-2.5 text-xs font-bold tracking-wide transition-all duration-200 ${
            activeTab === "forgot"
              ? "border border-(--border-strong) bg-(--bg-surface) text-(--text-primary) shadow-(--shadow-sm)"
              : "text-(--text-tertiary) hover:text-(--text-secondary)"
          }`}
        >
          Lupa Password
        </button>
        <button
          onClick={() => {
            setActiveTab("resend");
            setError(null);
          }}
          className={`flex-1 rounded-lg py-2.5 text-xs font-bold tracking-wide transition-all duration-200 ${
            activeTab === "resend"
              ? "border border-(--border-strong) bg-(--bg-surface) text-(--text-primary) shadow-(--shadow-sm)"
              : "text-(--text-tertiary) hover:text-(--text-secondary)"
          }`}
        >
          Kirim Ulang Verifikasi
        </button>
      </div>

      {/* Deskripsi tab */}
      <p className="mb-6 rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-4 text-[13px] leading-relaxed font-medium text-(--text-secondary)">
        {activeTab === "forgot"
          ? "Masukkan email kamu dan kami akan kirimkan link untuk membuat password baru."
          : "Belum menerima email verifikasi? Masukkan email kamu untuk mengirim ulang."}
      </p>

      {error && (
        <div className="mb-5 rounded-xl border border-(--error-muted)/50 bg-(--error-muted)/10 p-3.5 text-xs font-bold text-(--error) shadow-(--shadow-sm)">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="kamu@email.com"
            className="w-full rounded-xl border border-(--border-strong) bg-(--bg-surface) px-4 py-3 text-sm font-medium text-(--text-primary) transition-all duration-200 outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-(--accent) py-3 text-sm font-bold tracking-wide text-white shadow-(--shadow-md) transition-all hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading
            ? "Mengirim..."
            : activeTab === "forgot"
              ? "Kirim Link Reset"
              : "Kirim Ulang Verifikasi"}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm font-bold tracking-wide text-(--text-secondary) transition-colors hover:text-(--accent) hover:underline"
        >
          ← Kembali ke halaman masuk
        </Link>
      </p>
    </div>
  );
}

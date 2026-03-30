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
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 text-4xl">📧</div>
        <h2 className="mb-2 text-xl font-semibold text-gray-800">
          Cek email kamu!
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          {activeTab === "forgot"
            ? "Link reset password sudah dikirim ke "
            : "Link verifikasi sudah dikirim ulang ke "}
          <strong>{email}</strong>. Cek inbox atau folder spam kamu.
        </p>
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          ← Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="mb-1 text-2xl font-semibold text-gray-800">
        Bantuan Akun
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Pilih jenis bantuan yang kamu butuhkan.
      </p>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => {
            setActiveTab("forgot");
            setError(null);
          }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            activeTab === "forgot"
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Lupa Password
        </button>
        <button
          onClick={() => {
            setActiveTab("resend");
            setError(null);
          }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            activeTab === "resend"
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Kirim Ulang Verifikasi
        </button>
      </div>

      {/* Deskripsi tab */}
      <p className="mb-4 text-sm text-gray-500">
        {activeTab === "forgot"
          ? "Masukkan email kamu dan kami akan kirimkan link untuk membuat password baru."
          : "Belum menerima email verifikasi? Masukkan email kamu untuk mengirim ulang."}
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="kamu@email.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading
            ? "Mengirim..."
            : activeTab === "forgot"
              ? "Kirim Link Reset"
              : "Kirim Ulang Verifikasi"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-blue-600 hover:underline">
          ← Kembali ke halaman masuk
        </Link>
      </p>
    </div>
  );
}

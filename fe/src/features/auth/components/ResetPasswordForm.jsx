"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import useAuthStore from "../store";

function ResetPasswordContent() {
  const { resetPassword } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Password baru dan konfirmasi tidak cocok.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(token, form.password);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Kalau tidak ada token di URL, tampilkan pesan error
  if (!token) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 text-4xl">❌</div>
        <h2 className="mb-2 text-xl font-semibold text-gray-800">
          Link Tidak Valid
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Link reset password tidak valid atau sudah kadaluarsa. Silakan minta
          link baru.
        </p>
        <Link
          href="/forgot-password"
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Minta Link Baru
        </Link>
      </div>
    );
  }

  // Tampilan sukses
  if (success) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 text-4xl">✅</div>
        <h2 className="mb-2 text-xl font-semibold text-gray-800">
          Password Berhasil Direset!
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Password kamu sudah berhasil diubah. Silakan login dengan password
          baru kamu.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Masuk Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="mb-1 text-2xl font-semibold text-gray-800">
        Reset Password
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Masukkan password baru kamu di bawah ini.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Password Baru
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-400">Minimal 8 karakter</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Password strength indicator */}
        {form.password && <PasswordStrength password={form.password} />}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Menyimpan..." : "Reset Password"}
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

// Komponen indikator kekuatan password
function PasswordStrength({ password }) {
  const checks = [
    { label: "Minimal 8 karakter", pass: password.length >= 8 },
    { label: "Mengandung huruf besar", pass: /[A-Z]/.test(password) },
    { label: "Mengandung angka", pass: /[0-9]/.test(password) },
    {
      label: "Mengandung karakter khusus",
      pass: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const passed = checks.filter((c) => c.pass).length;

  const strengthLabel = ["", "Lemah", "Cukup", "Baik", "Kuat"][passed];
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ][passed];

  return (
    <div className="space-y-2">
      {/* Bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i <= passed ? strengthColor : "bg-gray-200"}`}
          />
        ))}
      </div>

      {/* Label */}
      <p className="text-xs text-gray-500">
        Kekuatan password:{" "}
        <span
          className={`font-medium ${
            passed <= 1
              ? "text-red-500"
              : passed === 2
                ? "text-yellow-500"
                : passed === 3
                  ? "text-blue-500"
                  : "text-green-500"
          }`}
        >
          {strengthLabel}
        </span>
      </p>

      {/* Checklist */}
      <ul className="space-y-1">
        {checks.map((check) => (
          <li
            key={check.label}
            className={`flex items-center gap-1.5 text-xs ${check.pass ? "text-green-600" : "text-gray-400"}`}
          >
            <span>{check.pass ? "✓" : "○"}</span>
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">Memuat...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

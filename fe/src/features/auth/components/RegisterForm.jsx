"use client";

import { useState } from "react";
import Link from "next/link";
import useAuthStore from "../store";
import GoogleButton from "./GoogleButton";

export default function RegisterForm() {
  const { register } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (form.password !== form.confirmPassword) {
      setLoading(false);
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
    });

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  // Tampilan sukses — minta user cek email
  if (success) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 text-4xl">📧</div>
        <h2 className="mb-2 text-xl font-semibold text-gray-800">
          Cek email kamu!
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Kami sudah kirim link verifikasi ke <strong>{form.email}</strong>.
          Silakan verifikasi akun kamu sebelum login.
        </p>
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          ← Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="mb-1 text-2xl font-semibold text-gray-800">Daftar</h1>
      <p className="mb-6 text-sm text-gray-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Masuk di sini
        </Link>
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Google Register */}
      <GoogleButton intent="register" />

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">atau daftar dengan email</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nama
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Nama kamu"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="kamu@email.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Password
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
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Konfirmasi Password
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>
    </div>
  );
}

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
      <div className="animate-scale-in mx-auto mt-10 w-full max-w-md rounded-2xl border border-(--border-default) bg-(--bg-elevated) p-8 text-center shadow-(--shadow-md)">
        <div className="mb-4 text-5xl">📧</div>
        <h2 className="mb-2 text-2xl font-black tracking-tight text-(--text-primary)">
          Cek email kamu!
        </h2>
        <p className="mb-8 text-sm leading-relaxed font-medium text-(--text-secondary)">
          Kami sudah kirim link verifikasi ke{" "}
          <strong className="text-(--text-primary)">{form.email}</strong>.
          Silakan verifikasi akun kamu sebelum login.
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
        Daftar
      </h1>
      <p className="mb-6 text-sm font-medium text-(--text-secondary)">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-bold text-(--accent) hover:underline"
        >
          Masuk di sini
        </Link>
      </p>

      {error && (
        <div className="mb-5 rounded-xl border border-(--error-muted)/50 bg-(--error-muted)/10 p-3.5 text-xs font-bold text-(--error) shadow-(--shadow-sm)">
          {error}
        </div>
      )}

      {/* Google Register */}
      <GoogleButton intent="register" />

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-(--border-subtle)" />
        <span className="text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
          atau daftar dengan email
        </span>
        <div className="h-px flex-1 bg-(--border-subtle)" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
            Nama
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Nama kamu"
            className="w-full rounded-xl border border-(--border-strong) bg-(--bg-surface) px-4 py-3 text-sm font-medium text-(--text-primary) transition-all duration-200 outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="kamu@email.com"
            className="w-full rounded-xl border border-(--border-strong) bg-(--bg-surface) px-4 py-3 text-sm font-medium text-(--text-primary) transition-all duration-200 outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
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
            className="w-full rounded-xl border border-(--border-strong) bg-(--bg-surface) px-4 py-3 text-sm font-medium text-(--text-primary) transition-all duration-200 outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
            Konfirmasi Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="w-full rounded-xl border border-(--border-strong) bg-(--bg-surface) px-4 py-3 text-sm font-medium text-(--text-primary) transition-all duration-200 outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-(--accent) py-3 text-sm font-bold tracking-wide text-white shadow-(--shadow-md) transition-all hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>
    </div>
  );
}

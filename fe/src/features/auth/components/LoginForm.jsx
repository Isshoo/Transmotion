"use client";

import { useState } from "react";
import Link from "next/link";
import useAuthStore from "../store";
import GoogleButton from "./GoogleButton";

export default function LoginForm() {
  const { login } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(form.email, form.password);
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="animate-scale-in mx-auto mt-10 w-full max-w-md rounded-2xl border border-(--border-default) bg-(--bg-elevated) p-8 shadow-(--shadow-md)">
      <h1 className="mb-2 text-3xl font-black tracking-tight text-(--text-primary)">
        Masuk
      </h1>
      <p className="mb-6 text-sm font-medium text-(--text-secondary)">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-bold text-(--accent) hover:underline"
        >
          Daftar di sini
        </Link>
      </p>

      {/* Google Login */}
      <GoogleButton intent="login" />

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-(--border-subtle)" />
        <span className="text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
          atau masuk dengan email
        </span>
        <div className="h-px flex-1 bg-(--border-subtle)" />
      </div>

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
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="kamu@email.com"
            className="w-full rounded-xl border border-(--border-strong) bg-(--bg-surface) px-4 py-3 text-sm font-medium text-(--text-primary) transition-all duration-200 outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-bold text-(--accent) hover:underline"
            >
              Lupa password?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="w-full rounded-xl border border-(--border-strong) bg-(--bg-surface) px-4 py-3 text-sm font-medium text-(--text-primary) transition-all duration-200 outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-(--accent) py-3 text-sm font-bold tracking-wide text-(--bg-base) shadow-(--shadow-md) transition-all hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}

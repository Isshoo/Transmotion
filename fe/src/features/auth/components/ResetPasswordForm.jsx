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
      setError("New password and confirmation do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
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

  // If there is no token in the URL, show an error message
  if (!token) {
    return (
      <div className="animate-scale-in mx-auto mt-10 w-full max-w-md rounded-2xl border border-(--error-muted)/30 bg-(--bg-elevated) p-8 text-center shadow-(--shadow-md)">
        <div className="mb-4 text-5xl">❌</div>
        <h2 className="mb-2 text-2xl font-black tracking-tight text-(--text-primary)">
          Invalid Link
        </h2>
        <p className="mb-8 text-sm leading-relaxed font-medium text-(--text-secondary)">
          The password reset link is invalid or has expired. Please request a new link.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block rounded-xl bg-(--accent) px-8 py-3 text-sm font-bold tracking-wide text-(--bg-base) shadow-(--shadow-md) transition-all hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98]"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  // Success view
  if (success) {
    return (
      <div className="animate-scale-in mx-auto mt-10 w-full max-w-md rounded-2xl border border-(--success-muted)/30 bg-(--bg-elevated) p-8 text-center shadow-(--shadow-md)">
        <div className="mb-4 text-5xl">✅</div>
        <h2 className="mb-2 text-2xl font-black tracking-tight text-(--text-primary)">
          Password Successfully Reset!
        </h2>
        <p className="mb-8 text-sm leading-relaxed font-medium text-(--text-secondary)">
          Your password has been successfully changed. Please login with your new password.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="w-full rounded-xl bg-(--accent) px-8 py-3 text-sm font-bold tracking-wide text-(--bg-base) shadow-(--shadow-md) transition-all hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98]"
        >
          Login Now
        </button>
      </div>
    );
  }

  return (
    <div className="animate-scale-in mx-auto mt-10 w-full max-w-md rounded-2xl border border-(--border-default) bg-(--bg-elevated) p-8 shadow-(--shadow-md)">
      <h1 className="mb-2 text-3xl font-black tracking-tight text-(--text-primary)">
        Reset Password
      </h1>
      <p className="mb-6 text-sm font-medium text-(--text-secondary)">
        Enter your new password below.
      </p>

      {error && (
        <div className="mb-5 rounded-xl border border-(--error-muted)/50 bg-(--error-muted)/10 p-3.5 text-xs font-bold text-(--error) shadow-(--shadow-sm)">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
            New Password
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
          <p className="mt-2 text-[10px] font-bold tracking-wide text-(--text-tertiary)">
            Minimum 8 characters
          </p>
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
            Confirm New Password
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

        {/* Password strength indicator */}
        {form.password && <PasswordStrength password={form.password} />}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-(--accent) py-3 text-sm font-bold tracking-wide text-(--bg-base) shadow-(--shadow-md) transition-all hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Reset Password"}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm font-bold tracking-wide text-(--text-secondary) transition-colors hover:text-(--accent) hover:underline"
        >
          ← Back to login
        </Link>
      </p>
    </div>
  );
}

// Password strength indicator component
function PasswordStrength({ password }) {
  const checks = [
    { label: "Minimum 8 characters", pass: password.length >= 8 },
    { label: "Contains uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Contains number", pass: /[0-9]/.test(password) },
    {
      label: "Contains special character",
      pass: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const passed = checks.filter((c) => c.pass).length;

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passed];
  const strengthColor = [
    "",
    "bg-(--error) shadow-(--shadow-sm)",
    "bg-(--warning) shadow-(--shadow-sm)",
    "bg-(--data-1) shadow-(--shadow-sm)",
    "bg-(--success) shadow-(--shadow-sm)",
  ][passed];

  return (
    <div className="space-y-3 rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-4 shadow-inner">
      {/* Bar */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= passed ? strengthColor : "bg-(--border-strong)"}`}
          />
        ))}
      </div>

      {/* Label */}
      <p className="text-[11px] font-bold tracking-wide text-(--text-tertiary) uppercase">
        Password strength:{" "}
        <span
          className={`ml-1 font-black ${
            passed <= 1
              ? "text-(--error)"
              : passed === 2
                ? "text-(--warning)"
                : passed === 3
                  ? "text-(--data-1)"
                  : "text-(--success)"
          }`}
        >
          {strengthLabel}
        </span>
      </p>

      {/* Checklist */}
      <ul className="space-y-1.5 border-t border-(--border-subtle) pt-1">
        {checks.map((check) => (
          <li
            key={check.label}
            className={`flex items-center gap-2 text-[11px] font-bold ${check.pass ? "text-(--success)" : "text-(--text-tertiary)"}`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${check.pass ? "bg-(--success-muted)/20 text-(--success)" : "bg-(--bg-overlay) text-(--text-disabled)"}`}
            >
              {check.pass ? "✓" : ""}
            </span>
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
        <div className="mx-auto mt-10 w-full max-w-md animate-pulse rounded-2xl border border-(--border-default) bg-(--bg-elevated) p-8 text-center shadow-(--shadow-md)">
          <p className="text-sm font-bold text-(--text-tertiary)">Loading...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

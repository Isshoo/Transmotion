export default function AuthLayout({ children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-(--bg-base) bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-(--bg-surface) via-(--bg-base) to-(--bg-base)">
      <div className="relative z-10 w-full max-w-lg px-4">{children}</div>
    </main>
  );
}

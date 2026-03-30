export default function AuthLayout({ children }) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg">{children}</div>
    </main>
  );
}

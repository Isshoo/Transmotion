import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg">
        {/* 404 besar */}
        <p className="mb-2 text-8xl font-bold text-gray-200 select-none">404</p>

        <h1 className="mb-2 text-xl font-semibold text-gray-800">
          Halaman Tidak Ditemukan
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>

        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

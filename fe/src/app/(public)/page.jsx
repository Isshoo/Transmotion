import Link from "next/link";
import { BrainCircuit, Database, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      {/* Hero */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-600">
        <BrainCircuit size={15} /> Klasifikasi Teks berbasis Transformer
      </div>
      <h1 className="mb-4 text-4xl font-bold text-gray-900">Transmotion</h1>
      <p className="mx-auto mb-8 max-w-xl text-lg text-gray-500">
        Platform manajemen dan deployment model mBERT & XLM-R untuk klasifikasi
        teks multibahasa.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Zap size={16} /> Coba Klasifikasi
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Masuk
        </Link>
      </div>

      {/* Feature cards */}
      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          {
            icon: Database,
            title: "Manajemen Dataset",
            desc: "Upload, preprocessing, dan kelola dataset untuk berbagai studi kasus.",
          },
          {
            icon: BrainCircuit,
            title: "Fine-tuning Model",
            desc: "Latih mBERT dan XLM-R dengan dataset kamu langsung dari browser.",
          },
          {
            icon: Zap,
            title: "Klasifikasi Real-time",
            desc: "Gunakan model terlatih untuk mengklasifikasikan teks secara instan.",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-gray-200 bg-white p-6 text-left"
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Icon size={20} className="text-blue-600" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-gray-800">
              {title}
            </h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { BrainCircuit, Database, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-24 text-center">
      {/* Hero */}
      <div className="animate-slide-up mb-6 inline-flex items-center gap-2 rounded-full border border-(--accent-muted)/50 bg-(--accent-muted)/20 px-4 py-1.5 text-xs font-bold tracking-wider text-(--accent) shadow-(--shadow-sm)">
        <BrainCircuit size={14} /> Klasifikasi Teks berbasis Transformer
      </div>
      <h1 className="animate-scale-in mb-6 text-5xl font-black tracking-tighter text-(--text-primary) md:text-6xl">
        Transmotion
      </h1>
      <p className="animate-fade-in mx-auto mb-10 max-w-2xl text-lg leading-relaxed font-medium text-(--text-secondary)">
        Platform manajemen dan deployment model mBERT & XLM-R untuk klasifikasi
        teks multibahasa secara real-time.
      </p>
      <div className="animate-slide-up flex flex-wrap justify-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-(--accent) px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-(--shadow-md) transition-all hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98]"
        >
          <Zap size={18} className="fill-current" /> Coba Klasifikasi
        </Link>
      </div>

      {/* Feature cards */}
      <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3">
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
            className="group rounded-2xl border border-(--border-default) bg-(--bg-surface) p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-(--border-strong) hover:shadow-(--shadow-md)"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-(--accent-muted)/20 shadow-(--shadow-sm) transition-transform group-hover:scale-110">
              <Icon size={22} className="text-(--accent)" />
            </div>
            <h3 className="mb-2 text-base font-bold tracking-tight text-(--text-primary)">
              {title}
            </h3>
            <p className="text-sm leading-relaxed font-medium text-(--text-secondary)">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

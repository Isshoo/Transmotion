"use client";

import Link from "next/link";
import {
  BrainCircuit,
  Database,
  Zap,
  ArrowRight,
  Sparkles,
  Activity,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    num: "01",
    icon: Database,
    title: "Dataset Management",
    desc: "Manage datasets for various model training use cases.",
  },
  {
    num: "02",
    icon: BrainCircuit,
    title: "Fine-tuning Model",
    desc: "Fine-tune models with your dataset directly from the browser.",
  },
  {
    num: "03",
    icon: Zap,
    title: "Classification",
    desc: "Use trained models to perform classification.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-(--bg-base) px-4 py-34 text-(--text-primary) selection:bg-(--accent-muted) selection:text-(--text-primary) lg:py-12">
      {/* ── Background Ambient Glow ── */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--accent) opacity-[0.08] blur-[120px]" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-2 lg:gap-20">
        {/* ── Left: Headline & CTA ── */}
        <div className="animate-slide-up flex flex-col items-start">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--accent-border) bg-(--accent-muted) px-4 py-1.5 text-[11px] font-bold tracking-widest text-(--accent)">
            <Sparkles size={14} />
            TRANSFORMER · TEXT CLASSIFICATION
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-[clamp(3.5rem,8vw,5.5rem)] leading-[1.05] font-black tracking-tighter text-(--text-primary)">
            Trans<span className="text-(--accent)">motion</span>
          </h1>

          {/* Version chip */}
          <div className="mb-8 inline-flex items-center gap-3 rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-1.5 font-mono text-xs font-medium text-(--text-secondary) shadow-(--shadow-sm)">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--text-primary) opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-(--text-primary) shadow-[0_0_8px_var(--text-primary)]"></span>
            </span>
            Built with mBERT &amp; XLM-R
          </div>

          {/* Description */}
          <p className="mb-10 max-w-xl text-lg leading-relaxed text-(--text-secondary)">
            Platform for NLP model management and deployment for real-time
            multilingual text classification. Improve your analysis accuracy in
            minutes.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/classifier"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-(--accent) px-7 py-3.5 text-sm font-bold tracking-wide text-(--bg-base) shadow-(--shadow-accent) transition-all duration-(--transition-base) hover:-translate-y-0.5 hover:bg-(--accent-hover) active:scale-95"
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              <Zap size={16} className="fill-white" />
              Try Classification
              <ArrowRight
                size={16}
                className="ml-1 transition-transform group-hover:translate-x-1"
              />
            </Link>

            {/* <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-(--radius-lg) border border-(--border-strong) bg-(--bg-surface) px-7 py-3.5 text-sm font-bold tracking-wide text-(--text-primary) transition-all duration-(--transition-base) hover:border-(--text-tertiary) hover:bg-(--bg-elevated) active:scale-95"
            >
              <Terminal size={16} className="text-(--text-tertiary)" />
              Dokumentasi
            </Link> */}
          </div>
        </div>

        {/* ── Right: UI Showcase Panel ── */}
        <div className="animate-fade-in relative w-full lg:-mr-10 lg:w-[110%] xl:w-full">
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-(--data-1) opacity-20 blur-[60px]" />
          <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-(--data-5) opacity-10 blur-[70px]" />

          {/* Main Card */}
          <div className="relative overflow-hidden rounded-xl border border-(--border-strong) bg-(--bg-surface) shadow-(--shadow-lg) backdrop-blur-xl">
            {/* Panel Header (macOS window style) */}
            <div className="flex items-center justify-between border-b border-(--border-subtle) bg-(--bg-elevated)/50 px-5 py-3">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-(--error) opacity-80" />
                <div className="h-3 w-3 rounded-full bg-(--warning) opacity-80" />
                <div className="h-3 w-3 rounded-full bg-(--success) opacity-80" />
              </div>
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-(--success)" />
                <span className="font-mono text-[10px] tracking-wider text-(--text-secondary) uppercase">
                  NLP System
                </span>
              </div>
            </div>

            {/* Panel Body: Feature Bento */}
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-(--text-primary)">
                  Platform Capabilities
                </h3>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-(--success-muted) px-2 py-1 text-[10px] font-bold text-(--success)">
                  Colab Support
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {FEATURES.map(({ num, icon: Icon, title, desc }) => (
                  <div
                    key={num}
                    className="group flex cursor-default items-start gap-4 rounded-lg border border-(--border-subtle) bg-(--bg-base) p-4 transition-all duration-(--transition-base) hover:border-(--accent-border) hover:bg-(--bg-elevated) hover:shadow-(--shadow-accent)"
                  >
                    {/* Icon Container */}
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-(--border-default) bg-(--bg-surface) transition-colors group-hover:border-(--accent-border) group-hover:bg-(--accent-muted)">
                      <Icon
                        size={18}
                        className="text-(--text-tertiary) transition-colors group-hover:text-(--accent)"
                      />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-sm font-bold text-(--text-primary)">
                          {title}
                        </p>
                        <span className="font-mono text-[10px] font-bold text-(--text-disabled) transition-colors group-hover:text-(--accent)">
                          {num}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-(--text-secondary)">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

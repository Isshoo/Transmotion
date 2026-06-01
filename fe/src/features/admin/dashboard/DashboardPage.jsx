"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Database,
  BrainCircuit,
  Activity,
  ChevronRight,
  Plus,
  Play,
  Loader2,
  Server,
  MessageSquareText,
  Trophy,
  Star,
  BarChart3,
  LayoutDashboard,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import dashboardApi from "./api";
import ColabStatusBadge from "@/components/ui/ColabStatusBadge";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getStats();
        setData(res.data.data);
      } catch (error) {
        toast.error("Gagal memuat statistik dashboard");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-(--border-default) bg-(--bg-surface)">
        <div className="flex flex-col items-center gap-3 text-(--text-tertiary)">
          <Loader2 className="h-8 w-8 animate-spin text-(--accent)" />
          <p className="text-sm font-medium">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="animate-fade-in space-y-6 pb-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-(--text-primary)">
              <LayoutDashboard size={20} className="text-(--accent)" />
              Overview
            </h1>
            <p className="mt-1 text-sm text-(--text-secondary)">
              Ringkasan aktivitas dan metrik sistem Transmotion.
            </p>
          </div>
          <div className="flex w-48 items-center gap-3">
            <ColabStatusBadge />
          </div>
        </div>

        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <div className="mb-4 rounded-full bg-red-500/10 p-4 text-red-500">
            <AlertCircle size={40} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-(--text-primary)">
            Gagal Memuat Dashboard
          </h3>
          <p className="max-w-md text-sm text-(--text-secondary)">
            Tidak dapat memuat data statistik. Hal ini mungkin terjadi karena backend tidak merespons atau adanya kendala jaringan.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 flex items-center gap-2 rounded-lg bg-(--accent) px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-opacity-90 active:scale-95"
          >
            Coba Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  const {
    model_comparison,
    best_model,
    most_used_model,
    // prediction_label_distribution,
  } = data;
  const mbertCount = model_comparison?.counts?.mbert ?? 0;
  const xlmrCount = model_comparison?.counts?.xlmr ?? 0;
  const mbertF1 = model_comparison?.avg_f1?.mbert;
  const xlmrF1 = model_comparison?.avg_f1?.xlmr;

  return (
    <div className="animate-fade-in space-y-6 pb-5">
      {/* Header section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-(--text-primary)">
            <LayoutDashboard size={20} className="text-(--accent)" />
            Overview
          </h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Ringkasan aktivitas dan metrik sistem Transmotion.
          </p>
        </div>
        <div className="flex w-48 items-center gap-3">
          <ColabStatusBadge />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          title="Total Pengguna"
          value={data.totals.users}
          icon={Users}
          color="text-(--data-2)"
          bg="bg-(--data-2)/10"
        />
        <StatCard
          title="Total Dataset"
          value={data.totals.datasets}
          icon={Database}
          color="text-(--data-1)"
          bg="bg-(--data-1)/10"
        />
        <StatCard
          title="Model Dilatih"
          value={data.totals.models}
          icon={BrainCircuit}
          color="text-(--data-7)"
          bg="bg-(--data-7)/10"
        />
        <StatCard
          title="Total Prediksi"
          value={data.totals.predictions}
          icon={MessageSquareText}
          color="text-(--data-5)"
          bg="bg-(--data-5)/10"
        />
        <StatCard
          title="Total Jobs"
          value={data.totals.training_jobs}
          icon={Activity}
          color="text-(--data-6)"
          bg="bg-(--data-6)/10"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* mBERT vs XLM-R Comparison */}
          {(mbertCount > 0 || xlmrCount > 0) && (
            <div className="overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-sm">
              <div className="flex items-center justify-between border-b border-(--border-default) px-5 py-4">
                <h2 className="font-medium text-(--text-primary)">
                  <BarChart3
                    size={16}
                    className="mr-2 inline text-(--accent)"
                  />
                  Perbandingan mBERT vs XLM-R
                </h2>
              </div>
              <div className="grid grid-cols-2 divide-x divide-(--border-default)">
                <ModelTypeColumn
                  label="mBERT"
                  count={mbertCount}
                  avgF1={mbertF1}
                  color="text-(--data-2)"
                  bgBar="bg-(--data-2)"
                  total={mbertCount + xlmrCount}
                />
                <ModelTypeColumn
                  label="XLM-R"
                  count={xlmrCount}
                  avgF1={xlmrF1}
                  color="text-(--data-7)"
                  bgBar="bg-(--data-7)"
                  total={mbertCount + xlmrCount}
                />
              </div>
            </div>
          )}

          {/* Best Model & Most Used */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {best_model && (
              <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-(--text-secondary)">
                  <Trophy size={16} className="text-(--warning)" />
                  <p className="text-xs font-semibold tracking-wider uppercase">
                    Model Terbaik (F1)
                  </p>
                </div>
                <p className="text-sm font-semibold text-(--text-primary)">
                  {best_model.name}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-(--accent)">
                    {(best_model.f1_score * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-(--text-tertiary)">
                    F1-Score
                  </span>
                </div>
                <p className="mt-1 text-xs text-(--text-tertiary)">
                  {best_model.model_type.toUpperCase()} · Akurasi{" "}
                  {(best_model.accuracy * 100).toFixed(1)}%
                </p>
              </div>
            )}
            {most_used_model && (
              <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-(--text-secondary)">
                  <Star size={16} className="text-(--data-5)" />
                  <p className="text-xs font-semibold tracking-wider uppercase">
                    Paling Banyak Digunakan
                  </p>
                </div>
                <p className="text-sm font-semibold text-(--text-primary)">
                  {most_used_model.name}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-(--accent)">
                    {most_used_model.prediction_count.toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-(--text-tertiary)">
                    prediksi
                  </span>
                </div>
                <p className="mt-1 text-xs text-(--text-tertiary)">
                  {most_used_model.model_type.toUpperCase()}
                </p>
              </div>
            )}
          </div>

          {/* Prediction Label Distribution */}
          {/* {Object.keys(prediction_label_distribution || {}).length > 0 && (
            <div className="overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-sm">
              <div className="flex items-center justify-between border-b border-(--border-default) px-5 py-4">
                <h2 className="font-medium text-(--text-primary)">
                  Distribusi Label Prediksi
                </h2>
                <span className="text-xs text-(--text-tertiary)">
                  {data.totals.predictions.toLocaleString("id-ID")} total
                </span>
              </div>
              <div className="space-y-3 p-5">
                {Object.entries(prediction_label_distribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([label, count]) => {
                    const pct = data.totals.predictions > 0
                      ? ((count / data.totals.predictions) * 100).toFixed(1)
                      : 0;
                    return (
                      <div key={label}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium capitalize text-(--text-primary)">
                            {label}
                          </span>
                          <span className="text-xs text-(--text-tertiary)">
                            {count.toLocaleString("id-ID")} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-(--bg-elevated)">
                          <div
                            className="h-full rounded-full bg-(--accent) transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )} */}

          {/* Recent Models */}
          {/* <div className="overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-sm">
            <div className="flex items-center justify-between border-b border-(--border-default) px-5 py-4">
              <h2 className="font-medium text-(--text-primary)">
                Model Terbaru
              </h2>
              <Link
                href="/admin/models"
                className="flex items-center gap-1 text-xs text-(--text-secondary) hover:text-(--accent)"
              >
                Lihat Semua <ChevronRight size={14} />
              </Link>
            </div>
            <div className="p-0">
              {data.recent_models.length === 0 ? (
                <div className="p-8 text-center text-sm text-(--text-tertiary)">
                  Belum ada model yang dilatih.
                </div>
              ) : (
                <div className="divide-y divide-(--border-default)">
                  {data.recent_models.map((model) => (
                    <div
                      key={model.id}
                      className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-(--bg-elevated)"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-(--bg-elevated) p-2 text-(--text-secondary)">
                          <BrainCircuit size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-(--text-primary)">
                            {model.name}
                          </p>
                          <p className="text-xs text-(--text-tertiary)">
                            {model.model_type.toUpperCase()} · F1:{" "}
                            {model.f1_score != null
                              ? (model.f1_score * 100).toFixed(1) + "%"
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-(--text-secondary)">
                          {new Date(model.created_at).toLocaleDateString("id-ID")}
                        </span>
                        <p className="text-[10px] text-(--text-tertiary)">
                          {model.prediction_count} prediksi
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div> */}

          {/* Recent Datasets */}
          {/* <div className="overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-sm">
            <div className="flex items-center justify-between border-b border-(--border-default) px-5 py-4">
              <h2 className="font-medium text-(--text-primary)">
                Dataset Terbaru
              </h2>
              <Link
                href="/admin/datasets"
                className="flex items-center gap-1 text-xs text-(--text-secondary) hover:text-(--accent)"
              >
                Lihat Semua <ChevronRight size={14} />
              </Link>
            </div>
            <div className="p-0">
              {data.recent_datasets.length === 0 ? (
                <div className="p-8 text-center text-sm text-(--text-tertiary)">
                  Belum ada dataset.
                </div>
              ) : (
                <div className="divide-y divide-(--border-default)">
                  {data.recent_datasets.map((ds) => (
                    <div
                      key={ds.id}
                      className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-(--bg-elevated)"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-(--bg-elevated) p-2 text-(--text-secondary)">
                          <Database size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-(--text-primary)">
                            {ds.name}
                          </p>
                          <p className="text-xs text-(--text-tertiary)">
                            {ds.num_rows_raw} baris
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-(--bg-elevated) px-2 py-0.5 text-[10px] font-medium text-(--text-secondary)">
                        {ds.preprocessing_status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div> */}
        </div>

        {/* Right Column (Quick Actions) */}
        <div className="space-y-6">
          {/* Active Jobs */}
          {data.active_jobs.length > 0 && (
            <div className="rounded-xl border border-(--accent)/30 bg-(--accent-muted) p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--accent) opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-(--accent)"></span>
                </div>
                <h2 className="font-semibold text-(--accent)">
                  Training Sedang Berjalan
                </h2>
              </div>
              <div className="space-y-3">
                {data.active_jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex w-full flex-col justify-between rounded-lg border border-(--border-default) bg-(--bg-surface) p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-(--text-primary)">
                        {job.job_name || "Untitled Job"}
                      </p>
                      <p className="mt-0.5 text-xs text-(--text-secondary)">
                        Model: {job.model_type.toUpperCase()}
                      </p>
                    </div>
                    <Link
                      href="/admin/training"
                      className="flex items-center justify-end gap-1 text-xs font-medium text-(--accent) hover:underline"
                    >
                      Lihat Progress <ChevronRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-sm">
            <h2 className="mb-4 font-medium text-(--text-primary)">
              Aksi Cepat
            </h2>
            <div className="space-y-3">
              <Link href="/admin/datasets">
                <div className="group flex cursor-pointer items-center gap-3 rounded-lg border border-(--border-default) p-3 transition-all hover:border-(--accent)/50 hover:bg-(--accent-muted)">
                  <div className="rounded-md bg-(--bg-elevated) p-2 text-(--text-secondary) transition-colors group-hover:bg-(--accent)/10 group-hover:text-(--accent)">
                    <Plus size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-(--text-primary) group-hover:text-(--accent)">
                      Upload Dataset
                    </p>
                    <p className="text-xs text-(--text-tertiary)">
                      Tambahkan data baru
                    </p>
                  </div>
                </div>
              </Link>
              {data.active_jobs.length === 0 && (
                <Link href="/admin/training">
                  <div className="group flex cursor-pointer items-center gap-3 rounded-lg border border-(--border-default) p-3 transition-all hover:border-(--accent)/50 hover:bg-(--accent-muted)">
                    <div className="rounded-md bg-(--bg-elevated) p-2 text-(--text-secondary) transition-colors group-hover:bg-(--accent)/10 group-hover:text-(--accent)">
                      <Play size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-(--text-primary) group-hover:text-(--accent)">
                        Mulai Training
                      </p>
                      <p className="text-xs text-(--text-tertiary)">
                        Latih model mBERT/XLM-R
                      </p>
                    </div>
                  </div>
                </Link>
              )}
              <Link href="/admin/testing">
                <div className="group flex cursor-pointer items-center gap-3 rounded-lg border border-(--border-default) p-3 transition-all hover:border-(--accent)/50 hover:bg-(--accent-muted)">
                  <div className="rounded-md bg-(--bg-elevated) p-2 text-(--text-secondary) transition-colors group-hover:bg-(--accent)/10 group-hover:text-(--accent)">
                    <Server size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-(--text-primary) group-hover:text-(--accent)">
                      Uji Model
                    </p>
                    <p className="text-xs text-(--text-tertiary)">
                      Testing & Evaluasi
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-(--text-secondary)">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-(--text-primary)">
            {value.toLocaleString("id-ID")}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${bg} ${color}`}>
          <Icon size={24} />
        </div>
      </div>
      <div
        className={`absolute -right-6 -bottom-6 opacity-0 transition-opacity duration-300 group-hover:opacity-10 ${color}`}
      >
        <Icon size={100} />
      </div>
    </div>
  );
}

function ModelTypeColumn({ label, count, avgF1, color, bgBar, total }) {
  const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
  return (
    <div className="p-5">
      <p className={`text-sm font-semibold ${color}`}>{label}</p>
      <p className="mt-2 text-2xl font-bold text-(--text-primary)">
        {count}
        <span className="ml-1 text-sm font-normal text-(--text-tertiary)">
          model ({pct}%)
        </span>
      </p>
      {avgF1 != null && (
        <p className="mt-1 text-xs text-(--text-secondary)">
          Rata-rata F1: {(avgF1 * 100).toFixed(1)}%
        </p>
      )}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-(--bg-elevated)">
        <div
          className={`h-full rounded-full ${bgBar} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

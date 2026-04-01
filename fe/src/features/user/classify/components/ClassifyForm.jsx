"use client";

import { useEffect, useRef } from "react";
import {
  Send,
  Loader2,
  RotateCcw,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useClassifyStore from "../store";

// ── Confidence ring ────────────────────────────────────────────

function ConfidenceRing({ value }) {
  const pct = Math.round(value * 100);
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x="40"
          y="45"
          textAnchor="middle"
          fontSize="16"
          fontWeight="600"
          fill={color}
        >
          {pct}%
        </text>
      </svg>
      <p className="text-xs text-gray-400">Confidence</p>
    </div>
  );
}

// ── Score bars ─────────────────────────────────────────────────

function ScoreBars({ scores, predictedLabel }) {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-2">
      {entries.map(([label, score]) => {
        const pct = (score * 100).toFixed(1);
        const isTop = label === predictedLabel;
        return (
          <div key={label}>
            <div className="mb-0.5 flex justify-between text-xs">
              <span
                className={`font-medium ${isTop ? "text-blue-700" : "text-gray-600"}`}
              >
                {label}
              </span>
              <span
                className={
                  isTop ? "font-semibold text-blue-700" : "text-gray-500"
                }
              >
                {pct}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${isTop ? "bg-blue-500" : "bg-gray-300"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── History table ──────────────────────────────────────────────

function HistoryTable() {
  const {
    history,
    historyTotal,
    historyPage,
    historyPerPage,
    isLoadingHistory,
    setHistoryPage,
  } = useClassifyStore();

  const totalPages = Math.ceil(historyTotal / historyPerPage);
  const from = historyTotal === 0 ? 0 : (historyPage - 1) * historyPerPage + 1;
  const to = Math.min(historyPage * historyPerPage, historyTotal);

  if (historyTotal === 0 && !isLoadingHistory) return null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Riwayat Klasifikasi
      </h3>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              {["Teks", "Prediksi", "Confidence", "Waktu"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoadingHistory
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(4)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 w-24 rounded bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))
              : history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="max-w-[280px] px-4 py-3">
                      <span className="line-clamp-2 text-xs text-gray-700">
                        {item.input_text}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {item.predicted_label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {item.confidence !== null ? (
                        <span
                          className={`font-semibold ${item.confidence >= 0.8 ? "text-green-600" : item.confidence >= 0.6 ? "text-amber-600" : "text-red-500"}`}
                        >
                          {(item.confidence * 100).toFixed(1)}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {historyTotal > historyPerPage && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-gray-500">
              {from}–{to} dari {historyTotal}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setHistoryPage(historyPage - 1)}
                disabled={historyPage <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="px-2 text-xs text-gray-600">
                {historyPage}/{totalPages}
              </span>
              <button
                onClick={() => setHistoryPage(historyPage + 1)}
                disabled={historyPage >= totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Komponen utama ─────────────────────────────────────────────

export default function ClassifyForm() {
  const {
    activeModels,
    isLoadingModels,
    selectedModelId,
    inputText,
    result,
    isClassifying,
    error,
    fetchActiveModels,
    fetchHistory,
    setSelectedModelId,
    setInputText,
    classify,
    clearResult,
  } = useClassifyStore();

  useEffect(() => {
    fetchActiveModels();
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const textareaRef = useRef(null);
  const selectedModel = activeModels.find((m) => m.id === selectedModelId);
  const canClassify =
    selectedModelId && inputText.trim().length > 0 && !isClassifying;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && canClassify) {
      classify();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <BrainCircuit size={22} className="text-blue-600" />
          Klasifikasi Teks
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Masukkan teks untuk diklasifikasikan menggunakan model yang tersedia.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Input panel (3/5) */}
        <div className="space-y-4 lg:col-span-3">
          {/* Pilih model */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Model
            </label>
            {isLoadingModels ? (
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-400">
                <Loader2 size={15} className="animate-spin" /> Memuat model...
              </div>
            ) : activeModels.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
                Belum ada model aktif. Hubungi admin.
              </div>
            ) : (
              <div className="space-y-2">
                {activeModels.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setSelectedModelId(model.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      selectedModelId === model.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-medium ${selectedModelId === model.id ? "text-blue-700" : "text-gray-800"}`}
                      >
                        {model.name}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${model.model_type === "xlmr" ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-700"}`}
                      >
                        {model.model_type?.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-0.5 flex gap-3 text-xs text-gray-500">
                      {model.accuracy !== null && (
                        <span>Acc: {(model.accuracy * 100).toFixed(1)}%</span>
                      )}
                      <span>
                        {model.num_labels} kelas: {model.labels?.join(", ")}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input teks */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Teks yang Akan Diklasifikasikan
            </label>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={6}
              placeholder="Masukkan teks di sini... (Ctrl+Enter untuk klasifikasi)"
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              maxLength={5000}
            />
            <div className="mt-1 flex justify-between">
              <p className="text-xs text-gray-400">
                {inputText.length}/5000 karakter
              </p>
              {inputText && (
                <button
                  onClick={() => {
                    setInputText("");
                    clearResult();
                    textareaRef.current?.focus();
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Hapus teks
                </button>
              )}
            </div>
          </div>

          {/* Tombol klasifikasi */}
          <button
            onClick={classify}
            disabled={!canClassify}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isClassifying ? (
              <>
                <Loader2 size={16} className="animate-spin" />{" "}
                Mengklasifikasikan...
              </>
            ) : (
              <>
                <Send size={16} /> Klasifikasikan
              </>
            )}
          </button>
        </div>

        {/* Result panel (2/5) */}
        <div className="lg:col-span-2">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4">
              <p className="text-sm font-medium text-red-700">
                Gagal mengklasifikasikan
              </p>
              <p className="mt-1 text-xs text-red-600">{error}</p>
            </div>
          )}

          {!result && !error && !isClassifying && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
              <BrainCircuit size={36} className="mb-3 text-gray-300" />
              <p className="text-sm text-gray-400">
                Hasil klasifikasi akan muncul di sini
              </p>
              <p className="mt-1 text-xs text-gray-300">
                Masukkan teks dan pilih model
              </p>
            </div>
          )}

          {isClassifying && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50 py-16 text-center">
              <Loader2 size={32} className="mb-3 animate-spin text-blue-500" />
              <p className="text-sm font-medium text-blue-700">
                Menganalisis teks...
              </p>
            </div>
          )}

          {result && !isClassifying && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              {/* Hasil utama */}
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 px-5 py-5">
                <p className="mb-1 text-xs font-semibold tracking-wide text-blue-500 uppercase">
                  Hasil Klasifikasi
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-800">
                      {result.predicted_label}
                    </p>
                    {selectedModel && (
                      <p className="mt-0.5 text-xs text-blue-400">
                        {selectedModel.name}
                      </p>
                    )}
                  </div>
                  <ConfidenceRing value={result.confidence} />
                </div>
              </div>

              {/* Skor semua kelas */}
              {result.all_scores &&
                Object.keys(result.all_scores).length > 1 && (
                  <div className="border-t px-5 py-4">
                    <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                      Skor Per Kelas
                    </p>
                    <ScoreBars
                      scores={result.all_scores}
                      predictedLabel={result.predicted_label}
                    />
                  </div>
                )}

              {/* Teks input */}
              <div className="border-t bg-gray-50 px-5 py-3">
                <p className="mb-1 text-xs text-gray-400">Teks input</p>
                <p className="line-clamp-3 text-xs text-gray-600">
                  {result.input_text}
                </p>
              </div>

              {/* Reset */}
              <div className="border-t px-5 py-3">
                <button
                  onClick={() => {
                    clearResult();
                    setInputText("");
                    textareaRef.current?.focus();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                >
                  <RotateCcw size={12} /> Klasifikasikan teks baru
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <HistoryTable />
    </div>
  );
}

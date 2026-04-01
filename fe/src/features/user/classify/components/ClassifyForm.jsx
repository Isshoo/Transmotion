"use client";

import { useEffect, useRef } from "react";
import { Send, Loader2, RotateCcw, BrainCircuit } from "lucide-react";
import useClassifyStore from "../store";
import ConfidenceRing from "./ui/ConfidenceRing";
import ScoreBars from "./ui/ScoreBars";
import HistoryTable from "./HistoryTable";

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

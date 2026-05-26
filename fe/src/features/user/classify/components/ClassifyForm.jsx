"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  Loader2,
  BrainCircuit,
  UploadCloud,
  FileText,
  X,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import useClassifyStore from "../store";
import { BatchResults, SingleResult } from "./ui/Result";
import HistoryTable from "./HistoryTable";

export default function ClassifyForm() {
  const {
    activeModels,
    isLoadingModels,
    selectedModelId,
    inputMode,
    inputText,
    csvTexts,
    csvFileName,
    csvHeaders,
    selectedTextColumn,
    result,
    batchResults,
    batchErrors,
    isClassifying,
    error,
    fetchActiveModels,
    fetchHistory,
    setSelectedModelId,
    setInputMode,
    setInputText,
    setCsvFile,
    setSelectedTextColumn,
    classify,
    clearResult,
  } = useClassifyStore();

  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const selectedModel = activeModels.find((m) => m.id === selectedModelId);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetchActiveModels();
    fetchHistory();
    return () => {
      useClassifyStore.setState({
        isLoadingModels: true,
        isLoadingHistory: true,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "tsv", "txt", "xlsx", "xls"].includes(ext)) {
      toast.error("Format harus CSV, TSV, TXT, XLSX, atau XLS");
      return;
    }
    await setCsvFile(file);
    toast.success(`${file.name} dimuat`);
  };

  const canClassify =
    selectedModelId &&
    !isClassifying &&
    (inputMode === "single"
      ? inputText.trim().length > 0
      : csvTexts.length > 0);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && canClassify) {
      classify();
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-(--text-primary)">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--accent) shadow-[0_0_12px_rgba(99,102,241,0.35)]">
              <BrainCircuit size={16} className="text-white" />
            </div>
            Klasifikasi Teks
          </h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Uji model dengan teks tunggal atau batch dari file CSV / Excel
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Input panel (3/5) */}
        <div className="space-y-5 lg:col-span-3">
          {/* Pilih model */}
          <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm)">
            <label className="mb-2 block text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
              Pilih Model Aktif
            </label>
            {isLoadingModels ? (
              <div className="flex items-center gap-2 rounded-xl border border-(--border-default) bg-(--bg-elevated) px-4 py-3 text-sm font-medium text-(--text-tertiary)">
                <Loader2 size={16} className="animate-spin text-(--accent)" />{" "}
                Memuat model...
              </div>
            ) : activeModels.length === 0 ? (
              <div className="rounded-xl border border-(--warning-muted)/50 bg-(--warning-muted)/10 px-4 py-3 text-sm font-bold text-(--warning)">
                Tidak ada model yang aktif saat ini.
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-200 outline-none focus:ring-2 focus:ring-(--accent-muted) ${
                    selectedModelId
                      ? "border-(--accent) bg-(--accent-muted)/10 shadow-(--shadow-sm)"
                      : "border-(--border-strong) bg-(--bg-elevated) hover:border-(--accent) hover:bg-(--bg-overlay)"
                  }`}
                >
                  {selectedModel ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-(--accent)">
                        {selectedModel.name}
                      </p>
                      <span
                        className={`rounded-md border px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase shadow-(--shadow-sm) ${
                          selectedModel.model_type === "xlmr"
                            ? "border-(--data-4)/20 bg-(--data-4)/10 text-(--data-4)"
                            : "border-(--data-1)/20 bg-(--data-1)/10 text-(--data-1)"
                        }`}
                      >
                        {selectedModel.model_type?.toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-(--text-tertiary)">
                      Pilih model...
                    </span>
                  )}
                  <ChevronDown
                    size={16}
                    className={`text-(--text-tertiary) transition-transform duration-200 ${
                      isModelDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isModelDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsModelDropdownOpen(false)}
                    />
                    <div className="animate-scale-in scrollbar-thin scrollbar-thumb-(--border-strong) absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-(--border-default) bg-(--bg-elevated) shadow-(--shadow-lg)">
                      {activeModels.map((model) => (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            setSelectedModelId(model.id);
                            clearResult();
                            setIsModelDropdownOpen(false);
                          }}
                          className={`flex w-full flex-col px-4 py-3 text-left transition-colors hover:bg-(--bg-overlay) ${
                            selectedModelId === model.id
                              ? "bg-(--accent-muted)/10"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`truncate text-sm font-bold ${
                                selectedModelId === model.id
                                  ? "text-(--accent)"
                                  : "text-(--text-primary)"
                              }`}
                            >
                              {model.name}
                            </p>
                            <span
                              className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase shadow-(--shadow-sm) ${
                                model.model_type === "xlmr"
                                  ? "border-(--data-4)/20 bg-(--data-4)/10 text-(--data-4)"
                                  : "border-(--data-1)/20 bg-(--data-1)/10 text-(--data-1)"
                              }`}
                            >
                              {model.model_type?.toUpperCase()}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] font-medium text-(--text-tertiary)">
                            {model.accuracy !== null &&
                              `Acc: ${(model.accuracy * 100).toFixed(1)}% · `}
                            {model.num_labels} kelas
                          </p>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Input Area Group */}
          <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm)">
            {/* Mode toggle */}
            <div className="mb-4 flex overflow-hidden rounded-lg border border-(--border-strong) bg-(--bg-elevated) p-1">
              {[
                { key: "single", label: "Teks Tunggal" },
                { key: "csv", label: "Upload File" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setInputMode(key);
                    clearResult();
                  }}
                  className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all duration-200 ${
                    inputMode === key
                      ? "bg-(--accent) text-white shadow-(--shadow-sm)"
                      : "text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Input area */}
            {inputMode === "single" ? (
              <div className="animate-fade-in">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={6}
                  placeholder="Masukkan teks di sini... (Ctrl+Enter untuk klasifikasi)"
                  className="w-full resize-none rounded-xl border border-(--border-strong) bg-(--bg-surface) px-4 py-3 text-sm font-medium text-(--text-primary) transition-all duration-200 outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
                  maxLength={5000}
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[11px] font-medium text-(--text-tertiary)">
                    {inputText.length}/5000 karakter
                  </p>
                  {inputText && (
                    <button
                      onClick={() => {
                        setInputText("");
                        clearResult();
                        textareaRef.current?.focus();
                      }}
                      className="text-[11px] font-bold text-(--text-tertiary) transition-colors hover:text-(--error)"
                    >
                      Bersihkan Teks
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="animate-fade-in space-y-4">
                {!csvFileName ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group cursor-pointer rounded-xl border-2 border-dashed border-(--border-strong) bg-(--bg-elevated) px-6 py-12 text-center transition-all duration-200 hover:border-(--accent) hover:bg-(--bg-overlay)"
                  >
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-(--bg-surface) shadow-(--shadow-sm) transition-colors group-hover:bg-(--accent-muted)/10">
                      <UploadCloud
                        size={24}
                        className="text-(--text-tertiary) transition-colors group-hover:text-(--accent)"
                      />
                    </div>
                    <p className="text-sm font-bold text-(--text-secondary)">
                      Klik untuk upload{" "}
                      <span className="text-(--accent)">CSV / Excel</span>
                    </p>
                    <p className="mt-1 text-xs font-medium text-(--text-tertiary)">
                      Maks 500 baris · .csv .xlsx .xls
                    </p>
                  </div>
                ) : (
                  <div className="animate-scale-in space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-(--success-muted)/50 bg-(--success-muted)/10 px-4 py-3 shadow-(--shadow-sm)">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--success) shadow-(--shadow-sm)">
                          <FileText size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-(--success)">
                            {csvFileName}
                          </p>
                          <p className="text-[11px] font-bold tracking-wide text-(--success)/70 uppercase">
                            {csvTexts.length} teks ditemukan
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setCsvFile(null);
                          clearResult();
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="rounded-lg p-1.5 text-(--success)/60 transition hover:bg-(--success-muted) hover:text-(--success) focus:outline-none"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Column Selection */}
                    {csvHeaders.length > 0 && (
                      <div className="rounded-xl border border-(--border-subtle) bg-(--bg-elevated) p-4 shadow-inner">
                        <label className="mb-2.5 block text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                          Pilih Kolom Teks Utama
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {csvHeaders.map((header, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedTextColumn(idx)}
                              className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all duration-150 ${
                                selectedTextColumn === idx
                                  ? "border-(--accent) bg-(--accent) text-white shadow-(--shadow-sm)"
                                  : "border-(--border-strong) bg-(--bg-surface) text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                              }`}
                            >
                              {header || `Kolom ${idx + 1}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

          {/* Tombol klasifikasi */}
          <button
            onClick={classify}
            disabled={!canClassify}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-(--accent) py-3.5 text-sm font-bold tracking-wide text-white shadow-(--shadow-md) transition-all hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isClassifying ? (
              <>
                <Loader2 size={18} className="animate-spin" />{" "}
                Mengklasifikasikan...
              </>
            ) : (
              <>
                <Send
                  size={18}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />{" "}
                Klasifikasikan Sekarang
              </>
            )}
          </button>
        </div>

        {/* Result panel (2/5) */}
        <div className="space-y-5 lg:col-span-2">
          {error && (
            <div className="animate-scale-in rounded-xl border border-(--error-muted)/50 bg-(--error-muted)/10 px-4 py-3 text-xs font-bold text-(--error) shadow-(--shadow-sm)">
              {error}
            </div>
          )}

          {!isClassifying && !result && batchResults.length === 0 && (
            <div className="flex h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-(--border-default) bg-(--bg-surface) px-6 text-center transition-colors hover:border-(--border-strong)">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-(--bg-elevated)">
                <BrainCircuit size={32} className="text-(--text-tertiary)" />
              </div>
              <p className="text-sm font-bold text-(--text-secondary)">
                Hasil akan muncul di sini
              </p>
            </div>
          )}

          {isClassifying && (
            <div className="flex h-[320px] animate-pulse flex-col items-center justify-center rounded-2xl border border-(--accent-muted)/50 bg-(--accent-muted)/10 px-6 text-center shadow-(--shadow-sm)">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-(--bg-surface) shadow-(--shadow-sm)">
                <Loader2 size={32} className="animate-spin text-(--accent)" />
              </div>
              <p className="text-sm font-bold tracking-wide text-(--accent)">
                {inputMode === "csv"
                  ? `Memproses ${csvTexts.length} data...`
                  : "Menganalisis teks..."}
              </p>
            </div>
          )}

          {!isClassifying && (
            <div className="animate-slide-up">
              {inputMode === "single" && result && (
                <SingleResult result={result} selectedModel={selectedModel} />
              )}
              {inputMode === "csv" &&
                (batchResults.length > 0 || batchErrors.length > 0) && (
                  <BatchResults
                    results={batchResults}
                    errors={batchErrors}
                    csvTexts={csvTexts}
                  />
                )}
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <HistoryTable />
    </div>
  );
}

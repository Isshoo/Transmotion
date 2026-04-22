"use client";

import { useEffect, useRef } from "react";
import { Send, Loader2, UploadCloud, FileText, X, Filter } from "lucide-react";
import { toast } from "sonner";
import useTestingStore from "../store";
import { BatchResults, SingleResult } from "./ui/Result";
import { HistoryTable } from "./ui/Table";

export default function TestingPage() {
  const {
    activeModels,
    isLoadingModels,
    modelTypeFilter,
    selectedModelId,
    inputMode,
    inputText,
    csvTexts,
    csvFileName,
    results,
    batchErrors,
    isClassifying,
    error,
    fetchActiveModels,
    fetchHistory,
    setModelTypeFilter,
    setSelectedModelId,
    setInputMode,
    setInputText,
    setCsvFile,
    classify,
    clearResults,
  } = useTestingStore();

  const fileInputRef = useRef();

  useEffect(() => {
    fetchActiveModels();
    if (selectedModelId !== "") {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "tsv", "txt"].includes(ext)) {
      toast.error("Format harus CSV, TSV, atau TXT");
      return;
    }
    await setCsvFile(file);
    toast.success(`${file.name} dimuat — ${csvTexts.length} teks ditemukan`);
  };

  const canClassify =
    selectedModelId &&
    !isClassifying &&
    (inputMode === "single"
      ? inputText.trim().length > 0
      : csvTexts.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-800">Testing</h1>
        <p className="text-sm text-gray-500">
          Uji model dengan teks tunggal atau batch dari file CSV
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Input panel (3/5) */}
        <div className="space-y-4 lg:col-span-3">
          {/* Filter + pilih model */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Model</label>
              {/* Filter arsitektur */}
              <div className="ml-auto flex items-center gap-1">
                <Filter size={13} className="text-gray-400" />
                {["", "mbert", "xlmr"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setModelTypeFilter(v)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                      modelTypeFilter === v
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {v === "" ? "Semua" : v.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingModels ? (
              <div className="rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-400">
                Memuat model...
              </div>
            ) : activeModels.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Tidak ada model aktif dengan filter ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {activeModels.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      setSelectedModelId(model.id);
                      clearResults();
                      fetchHistory();
                    }}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      selectedModelId === model.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`truncate text-sm font-medium ${
                          selectedModelId === model.id
                            ? "text-blue-700"
                            : "text-gray-800"
                        }`}
                      >
                        {model.name}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          model.model_type === "xlmr"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-teal-100 text-teal-700"
                        }`}
                      >
                        {model.model_type?.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {model.accuracy !== null &&
                        `Acc: ${(model.accuracy * 100).toFixed(1)}% · `}
                      {model.num_labels} kelas
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mode toggle */}
          <div className="flex overflow-hidden rounded-lg border border-gray-200">
            {[
              { key: "single", label: "Teks Tunggal" },
              { key: "csv", label: "Upload CSV" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setInputMode(key);
                  clearResults();
                }}
                className={`flex-1 py-2 text-sm font-medium transition ${
                  inputMode === key
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Input area */}
          {inputMode === "single" ? (
            <div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                placeholder="Masukkan teks di sini... (Ctrl+Enter untuk klasifikasi)"
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                maxLength={5000}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    (e.ctrlKey || e.metaKey) &&
                    canClassify
                  ) {
                    classify();
                  }
                }}
              />
              <div className="mt-1 flex justify-between">
                <p className="text-xs text-gray-400">{inputText.length}/5000</p>
                {inputText && (
                  <button
                    onClick={() => {
                      setInputText("");
                      clearResults();
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              {!csvFileName ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-gray-50"
                >
                  <UploadCloud
                    size={28}
                    className="mx-auto mb-2 text-gray-400"
                  />
                  <p className="text-sm text-gray-600">
                    Klik untuk upload{" "}
                    <span className="font-medium text-blue-600">
                      CSV / TSV / TXT
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Kolom pertama akan digunakan sebagai teks · Maks 500 baris
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {csvFileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {csvTexts.length} baris ditemukan
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCsvFile(null);
                      clearResults();
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="rounded-lg p-1 text-gray-400 transition hover:bg-white hover:text-gray-600"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

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
          {!isClassifying && results.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
              <Send size={32} className="mb-3 text-gray-300" />
              <p className="text-sm text-gray-400">Hasil akan muncul di sini</p>
            </div>
          )}
          {isClassifying && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50 py-16 text-center">
              <Loader2 size={28} className="mb-3 animate-spin text-blue-500" />
              <p className="text-sm font-medium text-blue-700">
                {inputMode === "csv"
                  ? `Mengklasifikasikan ${csvTexts.length} teks...`
                  : "Menganalisis teks..."}
              </p>
            </div>
          )}
          {!isClassifying &&
            results.length > 0 &&
            (inputMode === "single" ? (
              <SingleResult result={results[0]} />
            ) : (
              <BatchResults
                results={results}
                errors={batchErrors}
                csvTexts={csvTexts}
              />
            ))}
        </div>
      </div>

      {/* History */}
      {selectedModelId && <HistoryTable />}
    </div>
  );
}

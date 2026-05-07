"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Send, 
  Loader2, 
  BrainCircuit, 
  UploadCloud, 
  FileText, 
  X, 
  ChevronDown 
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <BrainCircuit size={22} className="text-blue-600" />
          Klasifikasi Teks
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Uji model dengan teks tunggal atau batch dari file CSV / Excel
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Input panel (3/5) */}
        <div className="space-y-4 lg:col-span-3">
          {/* Pilih model */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Pilih Model
            </label>
            {isLoadingModels ? (
              <div className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-400">
                Memuat model...
              </div>
            ) : activeModels.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Tidak ada model aktif.
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    selectedModelId
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  {selectedModel ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-blue-700">
                        {selectedModel.name}
                      </p>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          selectedModel.model_type === "xlmr"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-teal-100 text-teal-700"
                        }`}
                      >
                        {selectedModel.model_type?.toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Pilih model...</span>
                  )}
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform ${
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
                    <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                      {activeModels.map((model) => (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            setSelectedModelId(model.id);
                            clearResult();
                            setIsModelDropdownOpen(false);
                          }}
                          className={`flex w-full flex-col px-4 py-3 text-left transition hover:bg-gray-50 ${
                            selectedModelId === model.id ? "bg-blue-50" : ""
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
                          <p className="mt-0.5 text-[11px] text-gray-400">
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

          {/* Mode toggle */}
          <div className="flex overflow-hidden rounded-lg border border-gray-200">
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
                <p className="text-xs text-gray-400">{inputText.length}/5000 karakter</p>
                {inputText && (
                  <button
                    onClick={() => {
                      setInputText("");
                      clearResult();
                      textareaRef.current?.focus();
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {!csvFileName ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-gray-50"
                >
                  <UploadCloud size={28} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Klik untuk upload{" "}
                    <span className="font-medium text-blue-600">
                      CSV / Excel
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Maks 500 baris · .csv .xlsx .xls</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{csvFileName}</p>
                        <p className="text-xs text-gray-500">
                          {csvTexts.length} teks ditemukan
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setCsvFile(null);
                        clearResult();
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="rounded-lg p-1 text-gray-400 transition hover:bg-white hover:text-gray-600"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Column Selection */}
                  {csvHeaders.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Pilih Kolom Teks
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {csvHeaders.map((header, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTextColumn(idx)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                              selectedTextColumn === idx
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
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
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {!isClassifying && !result && batchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
              <BrainCircuit size={32} className="mb-3 text-gray-300" />
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

          {!isClassifying && (
            <>
              {inputMode === "single" && result && (
                <SingleResult result={result} selectedModel={selectedModel} />
              )}
              {inputMode === "csv" && (batchResults.length > 0 || batchErrors.length > 0) && (
                <BatchResults 
                  results={batchResults} 
                  errors={batchErrors} 
                  csvTexts={csvTexts} 
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* History */}
      <HistoryTable />
    </div>
  );
}

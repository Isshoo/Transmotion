"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  Loader2,
  UploadCloud,
  FileText,
  X,
  Filter,
  ChevronDown,
  FlaskConical,
} from "lucide-react";
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
    csvHeaders,
    selectedTextColumn,
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
    setSelectedTextColumn,
    classify,
    clearResults,
  } = useTestingStore();

  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const selectedModel = activeModels.find((m) => m.id === selectedModelId);

  const fileInputRef = useRef();

  useEffect(() => {
    fetchActiveModels();
    if (selectedModelId) {
      fetchHistory();
    }
    return () => {
      useTestingStore.setState({
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
      toast.error("Format must be CSV, TSV, TXT, XLSX, or XLS");
      return;
    }
    await setCsvFile(file);
    toast.success(`${file.name} loaded`);
  };

  const canClassify =
    selectedModelId &&
    !isClassifying &&
    (inputMode === "single"
      ? inputText.trim().length > 0
      : csvTexts.length > 0);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-(--text-primary)">
          <FlaskConical size={20} className="text-(--accent)" />
          Testing
        </h1>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Test the model with a single text or a batch from a CSV / Excel file
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Input panel (3/5) */}
        <div className="space-y-5 lg:col-span-3">
          {/* Filter + pilih model */}
          <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm)">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-bold text-(--text-secondary) uppercase">
                Select Model
              </label>
              {/* Filter arsitektur */}
              <div className="flex items-center gap-1.5 rounded-lg border border-(--border-subtle) bg-(--bg-elevated) p-1">
                <Filter size={12} className="ml-1 text-(--text-tertiary)" />
                {["", "mbert", "xlmr"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setModelTypeFilter(v)}
                    className={`rounded-md px-2 py-1 text-[10px] font-bold tracking-wider uppercase transition-all duration-150 ${
                      modelTypeFilter === v
                        ? "bg-(--accent) text-(--bg-base) shadow-(--shadow-sm)"
                        : "text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                    }`}
                  >
                    {v === "" ? "All" : v}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingModels ? (
              <div className="flex items-center gap-2 rounded-xl border border-(--border-default) bg-(--bg-elevated) px-4 py-3.5 text-sm font-medium text-(--text-tertiary)">
                <Loader2
                  size={16}
                  className="animate-spin text-(--text-secondary)"
                />{" "}
                Loading models...
              </div>
            ) : activeModels.length === 0 ? (
              <div className="rounded-xl border border-(--warning-muted)/50 bg-(--warning-muted)/10 px-4 py-3.5 text-sm font-medium text-(--warning)">
              No active models for this filter.
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left shadow-(--shadow-sm) transition-all duration-200 outline-none focus:ring-2 focus:ring-(--accent-muted) ${
                    selectedModelId
                      ? "border-(--accent) bg-(--accent-muted)/5"
                      : "border-(--border-strong) bg-(--bg-elevated) hover:border-(--accent-muted)"
                  }`}
                >
                  {selectedModel ? (
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-(--accent)">
                        {selectedModel.name}
                      </p>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                          selectedModel.model_type === "xlmr"
                            ? "border-(--data-4)/20 bg-(--data-4)/10 text-(--data-4)"
                            : "border-(--data-1)/20 bg-(--data-1)/10 text-(--data-1)"
                        }`}
                      >
                        {selectedModel.model_type}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-(--text-tertiary)">
                      Select a model to start testing...
                    </span>
                  )}
                  <ChevronDown
                    size={18}
                    className={`text-(--text-tertiary) transition-transform duration-200 ${
                      isModelDropdownOpen ? "rotate-180 text-(--accent)" : ""
                    }`}
                  />
                </button>

                {isModelDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsModelDropdownOpen(false)}
                    />
                    <div className="scrollbar-thin scrollbar-thumb-(--border-strong) animate-scale-in absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-lg)">
                      <div className="p-1">
                        {activeModels.map((model) => (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              setSelectedModelId(model.id);
                              clearResults();
                              fetchHistory();
                              setIsModelDropdownOpen(false);
                            }}
                            className={`flex w-full flex-col rounded-lg px-4 py-3 text-left transition-colors ${
                              selectedModelId === model.id
                                ? "bg-(--accent-muted)/10"
                                : "hover:bg-(--bg-overlay)"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p
                                title={model.name}
                                className={`truncate text-sm font-bold ${
                                  selectedModelId === model.id
                                    ? "text-(--accent)"
                                    : "text-(--text-primary)"
                                }`}
                              >
                                {model.name}
                              </p>
                              <span
                                className={`shrink-0 rounded-md border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                                  model.model_type === "xlmr"
                                    ? "border-(--data-4)/20 bg-(--data-4)/10 text-(--data-4)"
                                    : "border-(--data-1)/20 bg-(--data-1)/10 text-(--data-1)"
                                }`}
                              >
                                {model.model_type}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] font-medium text-(--text-tertiary)">
                              {model.accuracy !== null &&
                                `Acc: ${(model.accuracy * 100).toFixed(1)}% · `}
                              {model.num_labels} classes
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mode toggle */}
          <div className="mb-4 flex overflow-hidden rounded-lg border border-(--border-strong) bg-(--bg-elevated) p-1">
            {[
              { key: "single", label: "Single Text" },
              { key: "csv", label: "Upload File" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setInputMode(key);
                  clearResults();
                }}
                className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all duration-200 ${
                  inputMode === key
                    ? "bg-(--accent) text-(--bg-base) shadow-(--shadow-sm)"
                    : "text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Input area */}
          <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm)">
            {inputMode === "single" ? (
              <div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={6}
                  placeholder="Enter text here... (Ctrl+Enter to classify)"
                  className="w-full resize-none rounded-xl border border-(--border-strong) bg-(--bg-elevated) px-4 py-3 text-sm leading-relaxed text-(--text-primary) transition-all duration-200 outline-none placeholder:font-sans placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
                  maxLength={1000}
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
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[10px] font-bold tracking-wider text-(--text-tertiary)">
                    {inputText.length}/1000
                  </p>
                  {inputText && (
                    <button
                      onClick={() => {
                        setInputText("");
                        clearResults();
                      }}
                      className="text-[11px] font-bold tracking-wide text-(--error) opacity-80 transition-opacity hover:opacity-100"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {!csvFileName ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group cursor-pointer rounded-xl border-2 border-dashed border-(--border-strong) bg-(--bg-elevated) px-6 py-9.5 text-center transition-all duration-200 hover:border-(--accent) hover:bg-(--accent-muted)/5"
                  >
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-(--bg-overlay) transition-colors group-hover:bg-(--accent-muted)/20">
                      <UploadCloud
                        size={28}
                        className="text-(--text-tertiary) transition-colors group-hover:text-(--accent)"
                      />
                    </div>
                    <p className="text-sm font-medium text-(--text-secondary)">
                      Click to upload{" "}
                      <span className="font-bold text-(--accent)">
                        CSV / Excel
                      </span>
                    </p>
                    <p className="mt-1.5 text-[11px] font-medium tracking-wide text-(--text-tertiary)">
                      Max 500 rows · .csv .xlsx .xls
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-(--success-muted)/50 bg-(--success-muted)/10 px-5 py-4 shadow-(--shadow-sm)">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-(--success-muted)/30 bg-(--success-muted)/20">
                          <FileText size={20} className="text-(--success)" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-(--text-primary)">
                            {csvFileName}
                          </p>
                          <p className="mt-0.5 text-[11px] font-medium text-(--text-tertiary)">
                            <strong className="text-(--success)">
                              {csvTexts.length}
                            </strong>{" "}
                            valid text rows found
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setCsvFile(null);
                          clearResults();
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="rounded-lg p-2 text-(--text-tertiary) transition-colors hover:bg-(--bg-overlay) hover:text-(--error)"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Column Selection */}
                    {csvHeaders.length > 0 && (
                      <div className="rounded-xl border border-(--border-default) bg-(--bg-elevated) p-5">
                        <label className="mb-3 block text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                          Select Text Column
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {csvHeaders.map((header, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedTextColumn(idx)}
                              className={`rounded-lg border px-3.5 py-2 text-xs font-bold tracking-wide transition-all duration-150 ${
                                selectedTextColumn === idx
                                  ? "border-(--accent) bg-(--accent) text-(--bg-base) shadow-(--shadow-sm)"
                                  : "border-(--border-strong) bg-(--bg-surface) text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
                              }`}
                            >
                              {header || `Column ${idx + 1}`}
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
            <div className="mt-5 border-t border-(--border-subtle) pt-5">
              {/* Error */}
              {error && (
                <div className="animate-scale-in relative mb-4 rounded-xl border border-(--error-muted)/50 bg-(--error-muted)/10 px-4 py-3 text-xs font-bold text-(--error) shadow-(--shadow-sm)">
                  {error}
                  <span className="absolute -top-2 -right-2">
                    <button
                      onClick={() => {
                        clearResults();
                      }}
                      className="rounded-lg bg-(--error-muted) p-1 text-(--error) transition hover:bg-(--error) hover:text-(--bg-base) focus:outline-none"
                    >
                      <X size={16} />
                    </button>
                  </span>
                </div>
              )}
              <button
                onClick={classify}
                disabled={!canClassify}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--accent) py-3.5 text-sm font-bold tracking-wide text-(--bg-base) transition-all duration-200 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none disabled:active:scale-100"
              >
                {isClassifying ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />{" "}
                    Classifying...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Classify
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Result panel (2/5) */}
        <div className="lg:col-span-2">
          {!isClassifying && results.length === 0 && (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-(--border-strong) bg-(--bg-surface) px-6 py-16 text-center transition-colors hover:border-(--border-default)">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-(--border-subtle) bg-(--bg-elevated)">
                <FlaskConical
                  size={28}
                  className="ml-1 text-(--text-tertiary)"
                />
              </div>
              <p className="text-sm font-bold text-(--text-secondary)">
                No results yet
              </p>
              <p className="mx-auto mt-1.5 max-w-[200px] text-xs font-medium text-(--text-tertiary)">
                Your classification results will appear here
              </p>
            </div>
          )}
          {isClassifying && (
            <div className="flex h-full min-h-[300px] animate-pulse flex-col items-center justify-center rounded-xl border border-(--accent-muted)/50 bg-(--accent-muted)/10 px-6 py-16 text-center">
              <Loader2
                size={36}
                className="mb-4 animate-spin text-(--accent)"
              />
              <p className="text-sm font-bold text-(--accent)">
                {inputMode === "csv"
                  ? `Classifying ${csvTexts.length} texts...`
                  : "Analysing text..."}
              </p>
              <p className="mt-2 text-xs font-medium text-(--text-secondary)">
                Please wait a moment
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

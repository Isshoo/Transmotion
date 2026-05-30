"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import useDatasetStore from "../store";

export default function DatasetPreprocessModal() {
  const {
    isPreprocessModalOpen,
    preprocessTarget,
    isSubmitting,
    closePreprocessModal,
    preprocessDataset,
  } = useDatasetStore();

  const [textColumn, setTextColumn] = useState("");
  const [labelColumn, setLabelColumn] = useState("");
  const [testSize, setTestSize] = useState(0.1);
  const [valSize, setValSize] = useState(0.1);
  const [errors, setErrors] = useState({});

  const columns = preprocessTarget?.columns ?? [];

  useEffect(() => {
    if (preprocessTarget) {
      // Auto-detect kolom jika sudah ada
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTextColumn(preprocessTarget.text_column ?? "");
      setLabelColumn(preprocessTarget.label_column ?? "");
    }
    setErrors({});
  }, [preprocessTarget]);

  if (!isPreprocessModalOpen || !preprocessTarget) return null;

  const trainPct = Math.round((1 - testSize - valSize) * 100);
  const valPct = Math.round(valSize * 100);
  const testPct = Math.round(testSize * 100);

  const validate = () => {
    const e = {};
    if (!textColumn) e.textColumn = "Kolom teks harus dipilih";
    if (!labelColumn) e.labelColumn = "Kolom label harus dipilih";
    if (textColumn === labelColumn)
      e.labelColumn = "Kolom teks dan label harus berbeda";
    if (testSize + valSize >= 0.8)
      e.split = "Total test + val tidak boleh melebihi 80%";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const result = await preprocessDataset(preprocessTarget.id, {
      text_column: textColumn,
      label_column: labelColumn,
      test_size: testSize,
      val_size: valSize,
    });

    if (result.success) {
      toast.success("Preprocessing berhasil!");
      if (result.data?.labels) {
        toast.info(
          `Ditemukan ${result.data.num_labels} label: ${result.data.labels.join(", ")}`
        );
      }
      closePreprocessModal();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-md rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-xl)">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-xl border-b border-(--border-default) bg-(--bg-elevated) px-6 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-(--text-primary)">
              Preprocessing Dataset
            </h2>
            <p className="mt-1 text-xs text-(--text-secondary)">
              {preprocessTarget.name}
            </p>
          </div>
          <button
            onClick={closePreprocessModal}
            className="rounded-md p-1.5 text-(--text-tertiary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary)"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {/* Info kolom yang tersedia */}
          {columns.length > 0 && (
            <div className="rounded-md border border-(--accent-muted) bg-(--accent-muted) px-3 py-2.5 opacity-80">
              <p className="text-xs font-medium text-(--accent)">
                Kolom tersedia:
              </p>
              <p className="mt-1 text-xs text-(--accent)">
                {columns.join(", ")}
              </p>
            </div>
          )}

          {/* Kolom Teks */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
              Kolom Teks
            </label>
            {columns.length > 0 ? (
              <select
                value={textColumn}
                onChange={(e) => {
                  setTextColumn(e.target.value);
                  setErrors((p) => ({ ...p, textColumn: undefined }));
                }}
                className={`w-full rounded-md border bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:ring-2 ${
                  errors.textColumn
                    ? "border-(--error) focus:ring-(--error-muted)"
                    : "border-(--border-default) focus:border-(--accent) focus:ring-(--accent-muted)"
                }`}
              >
                <option value="">-- Pilih kolom --</option>
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={textColumn}
                onChange={(e) => {
                  setTextColumn(e.target.value);
                  setErrors((p) => ({ ...p, textColumn: undefined }));
                }}
                placeholder="cth. text"
                className={`w-full rounded-md border bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:ring-2 ${
                  errors.textColumn
                    ? "border-(--error) focus:ring-(--error-muted)"
                    : "border-(--border-default) focus:border-(--accent) focus:ring-(--accent-muted)"
                }`}
              />
            )}
            {errors.textColumn && (
              <p className="mt-1.5 text-xs text-(--error)">
                {errors.textColumn}
              </p>
            )}
          </div>

          {/* Kolom Label */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
              Kolom Label
            </label>
            {columns.length > 0 ? (
              <select
                value={labelColumn}
                onChange={(e) => {
                  setLabelColumn(e.target.value);
                  setErrors((p) => ({ ...p, labelColumn: undefined }));
                }}
                className={`w-full rounded-md border bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:ring-2 ${
                  errors.labelColumn
                    ? "border-(--error) focus:ring-(--error-muted)"
                    : "border-(--border-default) focus:border-(--accent) focus:ring-(--accent-muted)"
                }`}
              >
                <option value="">-- Pilih kolom --</option>
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={labelColumn}
                onChange={(e) => {
                  setLabelColumn(e.target.value);
                  setErrors((p) => ({ ...p, labelColumn: undefined }));
                }}
                placeholder="cth. label"
                className={`w-full rounded-md border bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:ring-2 ${
                  errors.labelColumn
                    ? "border-(--error) focus:ring-(--error-muted)"
                    : "border-(--border-default) focus:border-(--accent) focus:ring-(--accent-muted)"
                }`}
              />
            )}
            {errors.labelColumn && (
              <p className="mt-1.5 text-xs text-(--error)">
                {errors.labelColumn}
              </p>
            )}
          </div>

          {/* Split Ratio */}
          <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-4 shadow-sm">
            <label className="mb-3 block text-sm font-medium text-(--text-secondary)">
              Pembagian Data
            </label>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-10 text-xs font-medium text-(--text-tertiary)">
                  Test
                </span>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={testSize * 100}
                  onChange={(e) => {
                    setTestSize(e.target.value / 100);
                    setErrors((p) => ({ ...p, split: undefined }));
                  }}
                  className="flex-1 cursor-pointer accent-(--warning)"
                />
                <span className="w-10 text-right text-xs font-semibold text-(--text-primary)">
                  {testPct}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-10 text-xs font-medium text-(--text-tertiary)">
                  Val
                </span>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={valSize * 100}
                  onChange={(e) => {
                    setValSize(e.target.value / 100);
                    setErrors((p) => ({ ...p, split: undefined }));
                  }}
                  className="flex-1 cursor-pointer accent-(--data-2)"
                />
                <span className="w-10 text-right text-xs font-semibold text-(--text-primary)">
                  {valPct}%
                </span>
              </div>
            </div>

            {/* Visual bar */}
            <div className="mt-4 flex h-3.5 overflow-hidden rounded-full bg-(--bg-elevated)">
              <div
                className="flex items-center justify-center bg-(--accent) text-[9px] font-bold text-(--bg-base) transition-all duration-300"
                style={{ width: `${trainPct}%` }}
              >
                {trainPct >= 15 && `Train ${trainPct}%`}
              </div>
              <div
                className="flex items-center justify-center bg-(--data-2) text-[9px] font-bold text-(--bg-base) transition-all duration-300"
                style={{ width: `${valPct}%` }}
              >
                {valPct >= 10 && `${valPct}%`}
              </div>
              <div
                className="flex items-center justify-center bg-(--warning) text-[9px] font-bold text-(--bg-base) transition-all duration-300"
                style={{ width: `${testPct}%` }}
              >
                {testPct >= 10 && `${testPct}%`}
              </div>
            </div>
            <div className="mt-3 flex gap-4">
              {[
                ["bg-(--accent)", "Train"],
                ["bg-(--data-2)", "Val"],
                ["bg-(--warning)", "Test"],
              ].map(([color, label]) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-(--text-tertiary) uppercase"
                >
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${color}`}
                  />
                  {label}
                </span>
              ))}
            </div>
            {errors.split && (
              <p className="mt-2 text-xs text-(--error)">{errors.split}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2.5 border-t border-(--border-default) pt-5">
            <button
              type="button"
              onClick={closePreprocessModal}
              disabled={isSubmitting}
              className="rounded-md border border-(--border-default) px-4 py-2 text-sm font-medium text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--bg-base) transition-all duration-150 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Memproses..." : "Jalankan Preprocessing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

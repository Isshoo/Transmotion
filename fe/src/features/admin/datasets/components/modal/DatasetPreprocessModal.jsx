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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Preprocessing Dataset
            </h2>
            <p className="mt-0.5 text-xs text-gray-400">
              {preprocessTarget.name}
            </p>
          </div>
          <button
            onClick={closePreprocessModal}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* Info kolom yang tersedia */}
          {columns.length > 0 && (
            <div className="rounded-lg bg-blue-50 px-3 py-2">
              <p className="text-xs font-medium text-blue-700">
                Kolom tersedia:
              </p>
              <p className="mt-0.5 text-xs text-blue-600">
                {columns.join(", ")}
              </p>
            </div>
          )}

          {/* Kolom Teks */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Kolom Teks
            </label>
            {columns.length > 0 ? (
              <select
                value={textColumn}
                onChange={(e) => {
                  setTextColumn(e.target.value);
                  setErrors((p) => ({ ...p, textColumn: undefined }));
                }}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${errors.textColumn ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"}`}
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
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${errors.textColumn ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"}`}
              />
            )}
            {errors.textColumn && (
              <p className="mt-1 text-xs text-red-500">{errors.textColumn}</p>
            )}
          </div>

          {/* Kolom Label */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Kolom Label
            </label>
            {columns.length > 0 ? (
              <select
                value={labelColumn}
                onChange={(e) => {
                  setLabelColumn(e.target.value);
                  setErrors((p) => ({ ...p, labelColumn: undefined }));
                }}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${errors.labelColumn ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"}`}
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
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${errors.labelColumn ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"}`}
              />
            )}
            {errors.labelColumn && (
              <p className="mt-1 text-xs text-red-500">{errors.labelColumn}</p>
            )}
          </div>

          {/* Split Ratio */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Pembagian Data
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-12 text-xs text-gray-500">Test</span>
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
                  className="flex-1 accent-blue-600"
                />
                <span className="w-8 text-right text-xs font-medium text-gray-700">
                  {testPct}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 text-xs text-gray-500">Val</span>
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
                  className="flex-1 accent-purple-600"
                />
                <span className="w-8 text-right text-xs font-medium text-gray-700">
                  {valPct}%
                </span>
              </div>
            </div>

            {/* Visual bar */}
            <div className="mt-3 flex h-4 overflow-hidden rounded-full">
              <div
                className="flex items-center justify-center bg-blue-500 text-[10px] font-medium text-white transition-all"
                style={{ width: `${trainPct}%` }}
              >
                {trainPct >= 15 && `Train ${trainPct}%`}
              </div>
              <div
                className="flex items-center justify-center bg-purple-400 text-[10px] font-medium text-white transition-all"
                style={{ width: `${valPct}%` }}
              >
                {valPct >= 10 && `${valPct}%`}
              </div>
              <div
                className="flex items-center justify-center bg-amber-400 text-[10px] font-medium text-white transition-all"
                style={{ width: `${testPct}%` }}
              >
                {testPct >= 10 && `${testPct}%`}
              </div>
            </div>
            <div className="mt-1 flex gap-3">
              {[
                ["bg-blue-500", "Train"],
                ["bg-purple-400", "Val"],
                ["bg-amber-400", "Test"],
              ].map(([color, label]) => (
                <span
                  key={label}
                  className="flex items-center gap-1 text-xs text-gray-500"
                >
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${color}`}
                  />
                  {label}
                </span>
              ))}
            </div>
            {errors.split && (
              <p className="mt-1 text-xs text-red-500">{errors.split}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={closePreprocessModal}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Memproses..." : "Jalankan Preprocessing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

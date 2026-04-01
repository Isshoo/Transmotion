// ── Modal Tambah/Edit Row ──────────────────────────────────────

import { X } from "lucide-react";
import useDatasetStore from "../../store";
import { toast } from "sonner";
import { useState } from "react";

export default function RowFormModal({ datasetId, dataset, editRow, onClose }) {
  const { isSubmitting, addPreprocessedRow, updatePreprocessedRow } =
    useDatasetStore();
  const isEdit = !!editRow;
  const labels = Object.keys(dataset.class_distribution_preprocessed ?? {});

  const [form, setForm] = useState({
    raw_text: editRow?.raw_text ?? "",
    preprocessed_text: editRow?.preprocessed_text ?? "",
    label: editRow?.label ?? labels[0] ?? "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.raw_text.trim()) e.raw_text = "Teks asli harus diisi";
    if (!form.preprocessed_text.trim())
      e.preprocessed_text = "Teks preprocessed harus diisi";
    if (!form.label) e.label = "Label harus dipilih";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const result = isEdit
      ? await updatePreprocessedRow(datasetId, editRow.id, {
          preprocessed_text: form.preprocessed_text.trim(),
          label: form.label,
        })
      : await addPreprocessedRow(datasetId, {
          raw_text: form.raw_text.trim(),
          preprocessed_text: form.preprocessed_text.trim(),
          label: form.label,
        });

    if (result.success) {
      toast.success(result.message);
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? "Edit Data" : "Tambah Data"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* Raw text (hanya saat tambah) */}
          {!isEdit && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Teks Asli
              </label>
              <textarea
                value={form.raw_text}
                onChange={(e) => {
                  setForm((p) => ({ ...p, raw_text: e.target.value }));
                  setErrors((p) => ({ ...p, raw_text: undefined }));
                }}
                rows={2}
                placeholder="Teks sebelum preprocessing..."
                className={`w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${errors.raw_text ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"}`}
              />
              {errors.raw_text && (
                <p className="mt-1 text-xs text-red-500">{errors.raw_text}</p>
              )}
            </div>
          )}

          {/* Preprocessed text */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Teks Preprocessed
            </label>
            <textarea
              value={form.preprocessed_text}
              onChange={(e) => {
                setForm((p) => ({ ...p, preprocessed_text: e.target.value }));
                setErrors((p) => ({ ...p, preprocessed_text: undefined }));
              }}
              rows={2}
              placeholder="Teks setelah preprocessing..."
              className={`w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${errors.preprocessed_text ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"}`}
            />
            {errors.preprocessed_text && (
              <p className="mt-1 text-xs text-red-500">
                {errors.preprocessed_text}
              </p>
            )}
          </div>

          {/* Label */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Label
            </label>
            {labels.length > 0 ? (
              <select
                value={form.label}
                onChange={(e) => {
                  setForm((p) => ({ ...p, label: e.target.value }));
                  setErrors((p) => ({ ...p, label: undefined }));
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {labels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.label}
                onChange={(e) => {
                  setForm((p) => ({ ...p, label: e.target.value }));
                  setErrors((p) => ({ ...p, label: undefined }));
                }}
                placeholder="Nama label..."
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${errors.label ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"}`}
              />
            )}
            {errors.label && (
              <p className="mt-1 text-xs text-red-500">{errors.label}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Tambah Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

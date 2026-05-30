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
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-lg rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-xl)">
        <div className="flex items-center justify-between rounded-t-xl border-b border-(--border-default) bg-(--bg-elevated) px-6 py-4">
          <h2 className="text-base font-semibold tracking-tight text-(--text-primary)">
            {isEdit ? "Edit Data" : "Tambah Data"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-(--text-tertiary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary)"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {/* Raw text (hanya saat tambah) */}
          {!isEdit && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
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
                className={`min-h-[100px] w-full resize-none rounded-md border bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none placeholder:text-(--text-disabled) focus:ring-2 ${
                  errors.raw_text
                    ? "border-(--error) focus:ring-(--error-muted)"
                    : "border-(--border-default) focus:border-(--accent) focus:ring-(--accent-muted)"
                }`}
              />
              {errors.raw_text && (
                <p className="mt-1.5 text-xs text-(--error)">
                  {errors.raw_text}
                </p>
              )}
            </div>
          )}

          {/* Preprocessed text */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
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
              className={`min-h-[100px] w-full resize-none rounded-md border bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none placeholder:text-(--text-disabled) focus:ring-2 ${
                errors.preprocessed_text
                  ? "border-(--error) focus:ring-(--error-muted)"
                  : "border-(--border-default) focus:border-(--accent) focus:ring-(--accent-muted)"
              }`}
            />
            {errors.preprocessed_text && (
              <p className="mt-1.5 text-xs text-(--error)">
                {errors.preprocessed_text}
              </p>
            )}
          </div>

          {/* Label */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
              Label
            </label>
            {labels.length > 0 ? (
              <select
                value={form.label}
                onChange={(e) => {
                  setForm((p) => ({ ...p, label: e.target.value }));
                  setErrors((p) => ({ ...p, label: undefined }));
                }}
                className={`w-full rounded-md border bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none focus:ring-2 ${
                  errors.label
                    ? "border-(--error) focus:ring-(--error-muted)"
                    : "border-(--border-default) focus:border-(--accent) focus:ring-(--accent-muted)"
                }`}
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
                className={`w-full rounded-md border bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none placeholder:text-(--text-disabled) focus:ring-2 ${
                  errors.label
                    ? "border-(--error) focus:ring-(--error-muted)"
                    : "border-(--border-default) focus:border-(--accent) focus:ring-(--accent-muted)"
                }`}
              />
            )}
            {errors.label && (
              <p className="mt-1.5 text-xs text-(--error)">{errors.label}</p>
            )}
          </div>

          <div className="flex justify-end gap-2.5 border-t border-(--border-default) pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-(--border-default) px-4 py-2 text-sm font-medium text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--bg-base) transition-all duration-150 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:opacity-50"
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

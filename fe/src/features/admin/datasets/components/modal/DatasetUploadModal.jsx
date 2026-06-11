"use client";

import { useState, useRef, useCallback } from "react";
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import useDatasetStore from "../../store";
import { formatSize, parseFilePreview } from "../../helpers";

// ── Komponen utama ─────────────────────────────────────────────

export default function DatasetUploadModal() {
  const { isUploadModalOpen, isSubmitting, closeUploadModal, uploadDataset } =
    useDatasetStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [preview, setPreview] = useState(null); // hasil parseFilePreview
  const [previewError, setPreviewError] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef();

  const processFile = useCallback(async (f) => {
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["csv", "xls", "xlsx"].includes(ext)) {
      setPreviewError("Format must be CSV, XLS, or XLSX");
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(f);
    setPreviewError(null);
    setPreview(null);
    setIsParsing(true);
    try {
      const result = await parseFilePreview(f);
      setPreview(result);

      // Validasi client-side
      if (result.columnCount < 2) {
        setPreviewError(
          `Dataset must have at least 2 columns (found ${result.columnCount} columns)`
        );
      } else if (result.rowCount < 1500) {
        setPreviewError(
          `Dataset must have at least 1500 rows (found ${result.rowCount} rows). Note: large files might be partially read for preview.`
        );
      }
    } catch {
      setPreviewError("Failed to read file. Make sure the file format is correct.");
    } finally {
      setIsParsing(false);
    }
  }, []);

  if (!isUploadModalOpen) return null;

  const handleClose = () => {
    setName("");
    setDescription("");
    setFile(null);
    setPreview(null);
    setPreviewError(null);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
    closeUploadModal();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const handleFileInput = (e) => {
    if (e.target.files[0]) processFile(e.target.files[0]);
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Dataset name is required";
    else if (name.trim().length > 255) {
      e.name = "Dataset name max 255 characters";
    }
    if (!file) e.file = "File must be selected";
    if (description.trim().length > 1000) {
      e.description = "Description max 1000 characters";
    }
    if (previewError) e.file = previewError;
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    if (description.trim()) formData.append("description", description.trim());
    formData.append("file", file);

    try {
      const result = await uploadDataset(formData);
      if (result.success) {
        toast.success(result.message);
        handleClose();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    }
  };

  const isValid = file && preview && !previewError && !isParsing;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-scale-in flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-xl)">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between rounded-t-xl border-b border-(--border-default) bg-(--bg-elevated) px-6 py-4">
          <h2 className="text-base font-semibold tracking-tight text-(--text-primary)">
            Upload Dataset
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close upload dataset modal"
            className="rounded-md p-1.5 text-(--text-tertiary) transition-all duration-150 hover:bg-(--bg-overlay) hover:text-(--text-primary)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Nama */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
              Dataset Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="e.g., Indonesian Twitter Sentiment 2024"
              className={`w-full rounded-md border bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none placeholder:text-(--text-disabled) focus:ring-2 ${
                errors.name
                  ? "border-(--error) focus:ring-(--error-muted)"
                  : "border-(--border-default) focus:border-(--accent) focus:ring-(--accent-muted)"
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-(--error)">{errors.name}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
              Description{" "}
              <span className="font-normal text-(--text-tertiary)">
                (optional)
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this dataset..."
              rows={2}
              className="w-full resize-none rounded-md border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm text-(--text-primary) transition-all duration-150 outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
            />
          </div>

          {/* Upload area */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-(--text-secondary)">
              Dataset File
            </label>
            {!file ? (
              <div
                role="button"
                tabIndex={0}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
                  dragOver
                    ? "border-(--accent) bg-(--accent-muted)"
                    : errors.file
                      ? "border-(--error) bg-(--error-muted)"
                      : "border-(--border-default) hover:border-(--accent) hover:bg-(--bg-overlay)"
                }`}
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-(--bg-elevated) shadow-(--shadow-sm)">
                  <UploadCloud size={24} className="text-(--text-tertiary)" />
                </div>
                <p className="text-sm text-(--text-secondary)">
                  Drag & drop or{" "}
                  <span className="font-medium text-(--accent)">
                    click to select file
                  </span>
                </p>
                <p className="mt-1 text-xs text-(--text-tertiary)">
                  CSV, XLS, or XLSX — min 1500 rows, 2 columns. Dataset name must be unique.
                </p>
              </div>
            ) : (
              <div
                className={`rounded-xl border px-4 py-3 ${
                  previewError
                    ? "border-(--error) bg-(--error-muted)"
                    : "border-(--success) bg-(--success-muted)"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText
                      size={20}
                      className={
                        previewError ? "text-(--error)" : "text-(--success)"
                      }
                    />
                    <div>
                      <p className="text-sm font-medium text-(--text-primary)">
                        {file.name}
                      </p>
                      <p className="text-xs text-(--text-tertiary)">
                        {formatSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                      setPreviewError(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="rounded-md p-1.5 text-(--text-tertiary) transition-colors hover:bg-(--bg-surface) hover:text-(--text-primary)"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              className="hidden"
              onChange={handleFileInput}
            />
            {errors.file && (
              <p className="mt-1.5 text-xs text-(--error)">{errors.file}</p>
            )}
          </div>

          {/* Preview panel */}
          {isParsing && (
            <div className="flex items-center gap-3 rounded-xl border border-(--border-default) bg-(--bg-elevated) p-4">
              <Loader2 size={18} className="animate-spin text-(--accent)" />
              <span className="text-sm font-medium text-(--text-secondary)">
                Reading file...
              </span>
            </div>
          )}

          {preview && !isParsing && (
            <div className="overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface)">
              {/* Header preview */}
              <div
                className={`flex items-center gap-2 border-b border-(--border-default) px-4 py-3 ${
                  previewError ? "bg-(--error-muted)" : "bg-(--success-muted)"
                }`}
              >
                {previewError ? (
                  <AlertCircle size={16} className="shrink-0 text-(--error)" />
                ) : (
                  <CheckCircle
                    size={16}
                    className="shrink-0 text-(--success)"
                  />
                )}
                <span
                  className={`text-sm font-medium ${
                    previewError ? "text-(--error)" : "text-(--success)"
                  }`}
                >
                  {previewError ? "Validation failed" : "Valid file"}
                </span>
              </div>

              {/* Statistik */}
              <div className="grid grid-cols-2 gap-px bg-(--border-subtle) sm:grid-cols-4">
                {[
                  ["Data Rows", preview.rowCount.toLocaleString("id")],
                  ["Column Count", preview.columnCount],
                  ["File Size", formatSize(file?.size)],
                  ["Format", file?.name.split(".").pop().toUpperCase()],
                ].map(([label, value]) => (
                  <div key={label} className="bg-(--bg-surface) px-4 py-3">
                    <p className="text-[10px] font-semibold tracking-wider text-(--text-tertiary) uppercase">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-(--text-primary)">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Nama kolom */}
              {preview.columns.length > 0 && (
                <div className="border-t border-(--border-default) px-4 py-3">
                  <p className="mb-2 text-xs font-medium text-(--text-secondary)">
                    Columns found
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {preview.columns.map((col) => (
                      <span
                        key={col}
                        className="rounded-full bg-(--accent-muted) px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-(--accent)"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabel preview 5 baris */}
              {preview.previewRows.length > 0 && !previewError && (
                <div className="border-t border-(--border-default)">
                  <p className="border-b border-(--border-default) bg-(--bg-elevated) px-4 py-2 text-[10px] font-semibold tracking-wider text-(--text-tertiary) uppercase">
                    Preview first 5 rows
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-(--border-default) bg-(--bg-surface)">
                          {preview.columns.map((col) => (
                            <th
                              key={col}
                              className="px-4 py-2.5 text-left font-semibold whitespace-nowrap text-(--text-secondary)"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-(--border-subtle)">
                        {preview.previewRows.map((row, i) => (
                          <tr key={i} className="hover:bg-(--bg-overlay)">
                            {preview.columns.map((col) => (
                              <td
                                key={col}
                                title={row[col]}
                                className="max-w-[200px] truncate px-4 py-2.5 text-(--text-secondary)"
                              >
                                {row[col] ?? ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Error detail */}
              {previewError && (
                <div className="border-t border-(--border-default) bg-(--error-muted) px-4 py-3">
                  <p className="text-xs text-(--error)">{previewError}</p>
                </div>
              )}
            </div>
          )}

          {/* Info validasi server */}
          {isValid && (
            <div className="rounded-md border border-(--border-default) bg-(--accent-muted) px-3 py-2.5 text-xs leading-relaxed text-(--text-secondary)">
              <span className="mr-1 font-medium text-(--accent)">Info:</span>
              After upload, the server will automatically remove empty rows and duplicates, then re-validate before saving.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-2.5 rounded-b-xl border-t border-(--border-default) bg-(--bg-elevated) px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-md border border-(--border-default) px-4 py-2 text-sm font-medium text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isValid}
            className="rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--bg-base) transition-all duration-150 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Uploading..." : "Upload Dataset"}
          </button>
        </div>
      </div>
    </div>
  );
}

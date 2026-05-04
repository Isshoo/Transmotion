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
    if (!["csv", "tsv", "txt"].includes(ext)) {
      setPreviewError("Format harus CSV, TSV, atau TXT");
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
          `Dataset harus memiliki minimal 2 kolom (ditemukan ${result.columnCount} kolom)`
        );
      } else if (result.rowCount < 100) {
        setPreviewError(
          `Dataset harus memiliki minimal 100 baris (ditemukan ${result.rowCount} baris). Catatan: file besar mungkin dibaca sebagian untuk preview.`
        );
      }
    } catch {
      setPreviewError("Gagal membaca file. Pastikan format file benar.");
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
    if (!name.trim()) e.name = "Nama dataset harus diisi";
    else if (name.trim().length > 255) {
      e.name = "Nama dataset maksimal 255 karakter";
    }
    if (!file) e.file = "File harus dipilih";
    if (description.trim().length > 1000) {
      e.description = "Deskripsi maksimal 1000 karakter";
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
      toast.error("Upload gagal. Silakan coba lagi.");
    }
  };

  const isValid = file && preview && !previewError && !isParsing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            Upload Dataset
          </h2>
          <button
            onClick={handleClose}
            aria-label="Tutup modal upload dataset"
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Nama */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nama Dataset
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="cth. Sentiment Twitter Indonesia 2024"
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${errors.name ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-500"}`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Deskripsi{" "}
              <span className="font-normal text-gray-400">(opsional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat tentang dataset ini..."
              rows={2}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Upload area */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              File Dataset
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
                className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${dragOver ? "border-blue-500 bg-blue-50" : errors.file ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}`}
              >
                <UploadCloud size={30} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Drag & drop atau{" "}
                  <span className="font-medium text-blue-600">
                    klik untuk pilih file
                  </span>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  CSV, TSV, atau TXT — minimal 100 baris, 2 kolom
                </p>
              </div>
            ) : (
              <div
                className={`rounded-xl border px-4 py-3 ${previewError ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText
                      size={18}
                      className={
                        previewError ? "text-red-500" : "text-green-600"
                      }
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
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
                    className="rounded-lg p-1 text-gray-400 hover:bg-white hover:text-gray-600"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.txt"
              className="hidden"
              onChange={handleFileInput}
            />
            {errors.file && (
              <p className="mt-1 text-xs text-red-500">{errors.file}</p>
            )}
          </div>

          {/* Preview panel */}
          {isParsing && (
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-4">
              <Loader2 size={16} className="animate-spin text-blue-500" />
              <span className="text-sm text-gray-500">Membaca file...</span>
            </div>
          )}

          {preview && !isParsing && (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              {/* Header preview */}
              <div
                className={`flex items-center gap-2 px-4 py-3 ${previewError ? "bg-red-50" : "bg-green-50"}`}
              >
                {previewError ? (
                  <AlertCircle size={16} className="shrink-0 text-red-500" />
                ) : (
                  <CheckCircle size={16} className="shrink-0 text-green-600" />
                )}
                <span
                  className={`text-sm font-medium ${previewError ? "text-red-700" : "text-green-700"}`}
                >
                  {previewError ? "Validasi gagal" : "File valid"}
                </span>
              </div>

              {/* Statistik */}
              <div className="grid grid-cols-2 gap-0 divide-x divide-y border-t sm:grid-cols-4">
                {[
                  ["Baris Data", preview.rowCount.toLocaleString("id")],
                  ["Jumlah Kolom", preview.columnCount],
                  ["Ukuran File", formatSize(file?.size)],
                  ["Format", file?.name.split(".").pop().toUpperCase()],
                ].map(([label, value]) => (
                  <div key={label} className="px-4 py-3">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-800">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Nama kolom */}
              {preview.columns.length > 0 && (
                <div className="border-t px-4 py-3">
                  <p className="mb-1.5 text-xs text-gray-400">
                    Kolom yang ditemukan
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {preview.columns.map((col) => (
                      <span
                        key={col}
                        className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabel preview 5 baris */}
              {preview.previewRows.length > 0 && !previewError && (
                <div className="border-t">
                  <p className="px-4 pt-3 pb-1.5 text-xs text-gray-400">
                    Preview 5 baris pertama
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-y bg-gray-50">
                          {preview.columns.map((col) => (
                            <th
                              key={col}
                              className="px-3 py-2 text-left font-medium whitespace-nowrap text-gray-600"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {preview.previewRows.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            {preview.columns.map((col) => (
                              <td
                                key={col}
                                className="max-w-[200px] truncate px-3 py-2 text-gray-600"
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
                <div className="border-t px-4 py-3">
                  <p className="text-xs text-red-600">{previewError}</p>
                </div>
              )}
            </div>
          )}

          {/* Info validasi server */}
          {isValid && (
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
              Setelah diupload, server akan menghapus baris kosong dan duplikat
              secara otomatis, kemudian memvalidasi ulang sebelum menyimpan.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isValid}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Mengupload..." : "Upload Dataset"}
          </button>
        </div>
      </div>
    </div>
  );
}

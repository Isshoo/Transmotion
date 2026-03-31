"use client";

import { useState, useRef } from "react";
import { X, UploadCloud, FileText } from "lucide-react";
import { toast } from "sonner";
import useDatasetStore from "../store";

export default function DatasetUploadModal() {
  const { isUploadModalOpen, isSubmitting, closeUploadModal, uploadDataset } =
    useDatasetStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef();

  if (!isUploadModalOpen) return null;

  const handleClose = () => {
    setName("");
    setDescription("");
    setFile(null);
    setErrors({});
    closeUploadModal();
  };

  const handleFile = (f) => {
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["csv", "tsv", "txt"].includes(ext)) {
      setErrors((p) => ({ ...p, file: "Format harus CSV, TSV, atau TXT" }));
      return;
    }
    setErrors((p) => ({ ...p, file: undefined }));
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Nama dataset harus diisi";
    if (!file) e.file = "File harus dipilih";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    if (description) formData.append("description", description.trim());
    formData.append("file", file);

    const result = await uploadDataset(formData);
    if (result.success) {
      toast.success(result.message);
      handleClose();
    } else {
      toast.error(result.message);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            Upload Dataset
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
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
              placeholder="cth. Sentiment Twitter Indonesia"
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

          {/* Upload Area */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              File Dataset
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${
                dragOver
                  ? "border-blue-500 bg-blue-50"
                  : errors.file
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={20} className="text-blue-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <UploadCloud
                    size={28}
                    className="mx-auto mb-2 text-gray-400"
                  />
                  <p className="text-sm text-gray-600">
                    Drag & drop atau{" "}
                    <span className="font-medium text-blue-600">
                      klik untuk pilih file
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    CSV, TSV, atau TXT
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files[0]) handleFile(e.target.files[0]);
              }}
            />
            {errors.file && (
              <p className="mt-1 text-xs text-red-500">{errors.file}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={handleClose}
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
              {isSubmitting ? "Mengupload..." : "Upload Dataset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

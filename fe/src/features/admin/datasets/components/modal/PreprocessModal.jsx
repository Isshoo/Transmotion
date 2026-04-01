// ── Modal Preprocessing ────────────────────────────────────────

import { AlertCircle, Cpu, Loader2, X } from "lucide-react";
import { useParams } from "next/navigation";
import useDatasetStore from "../../store";
import { toast } from "sonner";

export default function PreprocessModal({ dataset, onClose }) {
  const { id } = useParams();
  const { isSubmitting, startPreprocessing } = useDatasetStore();
  const isRepreprocess = (dataset.num_rows_preprocessed ?? 0) > 0;

  const handleStart = async () => {
    const result = await startPreprocessing(id);
    if (result.success) {
      toast.info("Preprocessing dimulai, mohon tunggu...");
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            {isRepreprocess ? "Preprocessing Ulang" : "Mulai Preprocessing"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {isRepreprocess && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0 text-amber-600"
              />
              <p className="text-xs text-amber-700">
                Data preprocessed yang ada (
                {dataset.num_rows_preprocessed?.toLocaleString("id")} baris)
                akan dihapus dan diganti dengan hasil preprocessing baru.
              </p>
            </div>
          )}

          <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-xs font-semibold text-blue-700">
              Konfigurasi yang akan digunakan:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-blue-500">Kolom Teks:</span>
                <span className="ml-1 font-medium text-blue-800">
                  {dataset.text_column}
                </span>
              </div>
              <div>
                <span className="text-blue-500">Kolom Label:</span>
                <span className="ml-1 font-medium text-blue-800">
                  {dataset.label_column}
                </span>
              </div>
              <div>
                <span className="text-blue-500">Total Data Raw:</span>
                <span className="ml-1 font-medium text-blue-800">
                  {dataset.num_rows_raw?.toLocaleString("id")} baris
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-xs text-gray-500">
            <p className="font-medium text-gray-700">
              Proses yang akan dijalankan:
            </p>
            <ul className="list-inside list-disc space-y-0.5 text-gray-500">
              <li>Hapus URL, email, mention (@), hashtag (#), tag HTML</li>
              <li>Normalisasi whitespace berlebih</li>
              <li>Hapus baris yang hasilnya kosong setelah preprocessing</li>
              <li>Hapus duplikat (berdasarkan teks + label)</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleStart}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Cpu size={14} />
              )}
              {isSubmitting ? "Memulai..." : "Mulai Preprocessing"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

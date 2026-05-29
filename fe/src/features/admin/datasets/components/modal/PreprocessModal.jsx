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
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-md rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-xl)">
        <div className="flex items-center justify-between rounded-t-xl border-b border-(--border-default) bg-(--bg-elevated) px-6 py-4">
          <h2 className="text-base font-semibold tracking-tight text-(--text-primary)">
            {isRepreprocess ? "Preprocessing Ulang" : "Mulai Preprocessing"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-(--text-tertiary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary)"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {isRepreprocess && (
            <div className="flex items-start gap-2.5 rounded-md border border-(--warning-muted) bg-(--warning-muted) px-3 py-2.5 opacity-90">
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0 text-(--warning)"
              />
              <p className="text-xs leading-relaxed text-(--warning)">
                Data preprocessed yang ada (
                <span className="font-semibold">
                  {dataset.num_rows_preprocessed?.toLocaleString("id")} baris
                </span>
                ) akan dihapus dan diganti dengan hasil preprocessing baru.
              </p>
            </div>
          )}

          <div className="space-y-2.5 rounded-md border border-(--accent-muted) bg-(--accent-muted) px-4 py-3 opacity-90">
            <p className="text-xs font-semibold tracking-wide text-(--accent) uppercase">
              Konfigurasi saat ini:
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="mb-0.5 block text-[10px] tracking-wider text-(--accent) uppercase opacity-80">
                  Kolom Teks
                </span>
                <span className="font-medium text-(--accent)">
                  {dataset.text_column}
                </span>
              </div>
              <div>
                <span className="mb-0.5 block text-[10px] tracking-wider text-(--accent) uppercase opacity-80">
                  Kolom Label
                </span>
                <span className="font-medium text-(--accent)">
                  {dataset.label_column}
                </span>
              </div>
              <div>
                <span className="mb-0.5 block text-[10px] tracking-wider text-(--accent) uppercase opacity-80">
                  Total Data Raw
                </span>
                <span className="font-medium text-(--accent)">
                  {dataset.num_rows_raw?.toLocaleString("id")} baris
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-md border border-(--border-default) bg-(--bg-elevated) p-4 text-xs text-(--text-secondary)">
            <p className="mb-2 font-semibold text-(--text-primary)">
              Proses yang akan dijalankan:
            </p>
            <ul className="ml-1 list-inside list-disc space-y-1.5 text-left text-(--text-secondary)">
              <li>Hapus URL, email, mention (@), hashtag (#), tag HTML</li>
              <li>Normalisasi whitespace berlebih</li>
              <li>Hapus baris kosong (setelah dibersihkan)</li>
              <li>Hapus duplikat (berdasarkan teks + label)</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-(--border-default) px-4 py-2 text-sm font-medium text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleStart}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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

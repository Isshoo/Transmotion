import { Trash2 } from "lucide-react";
import useModelStore from "../../store";
import { toast } from "sonner";

export default function DeleteConfirmModal() {
  const {
    isDeleteModalOpen,
    deleteTarget,
    isSubmitting,
    closeDeleteModal,
    deleteModel,
  } = useModelStore();

  if (!isDeleteModalOpen || !deleteTarget) return null;

  const handleConfirm = async () => {
    const result = await deleteModel(deleteTarget.id);
    if (result.success) {
      toast.success(result.message);
      closeDeleteModal();
    } else toast.error(result.message);
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="animate-scale-in w-full max-w-sm rounded-2xl border border-(--border-default) bg-(--bg-surface) p-6 shadow-(--shadow-lg)"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-(--error-muted)/50 bg-(--error-muted)/20">
          <Trash2 size={24} className="text-(--error)" />
        </div>
        <h2 className="mb-2 text-lg font-bold tracking-tight text-(--text-primary)">
          Hapus Model?
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-(--text-secondary)">
          Model{" "}
          <span className="font-semibold text-(--text-primary)">
            {deleteTarget.name}
          </span>{" "}
          dan file-nya akan dihapus permanen. Tindakan ini tidak dapat
          dibatalkan.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={closeDeleteModal}
            disabled={isSubmitting}
            className="rounded-lg border border-(--border-strong) bg-(--bg-elevated) px-4 py-2 text-sm font-medium tracking-wide text-(--text-secondary) transition-all hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-(--error) px-4 py-2 text-sm font-bold tracking-wide text-(--bg-base) shadow-(--shadow-sm) transition-all hover:bg-(--error-hover) hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

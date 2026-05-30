// ── Modal Konfirmasi Hapus ─────────────────────────────────────

import { Trash2 } from "lucide-react";
import useUsersStore from "../../store";
import { toast } from "sonner";

export default function DeleteUserModal() {
  const {
    isDeleteModalOpen,
    selectedUser,
    isSubmitting,
    closeDeleteModal,
    deleteUser,
  } = useUsersStore();

  if (!isDeleteModalOpen || !selectedUser) return null;

  const handleConfirm = async () => {
    const result = await deleteUser(selectedUser.id);
    if (result.success) {
      toast.success(result.message);
      closeDeleteModal();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-sm rounded-2xl border border-(--border-default) bg-(--bg-elevated) p-6 shadow-(--shadow-lg)">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-(--error-muted)/30 bg-(--error-muted)/20">
          <Trash2 size={20} className="text-(--error)" />
        </div>
        <h2 className="mb-2 text-base font-bold tracking-tight text-(--text-primary)">
          Hapus Pengguna?
        </h2>
        <p className="mb-7 text-sm leading-relaxed font-medium text-(--text-secondary)">
          Akun{" "}
          <span className="font-bold text-(--text-primary)">
            {selectedUser.name ?? selectedUser.email}
          </span>{" "}
          akan dihapus permanen dan tidak dapat dipulihkan.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={closeDeleteModal}
            disabled={isSubmitting}
            className="rounded-xl border border-(--border-default) bg-(--bg-surface) px-5 py-2.5 text-sm font-bold text-(--text-secondary) transition-all duration-150 hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="rounded-xl bg-(--error) px-5 py-2.5 text-sm font-bold text-(--bg-base) shadow-(--shadow-md) transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

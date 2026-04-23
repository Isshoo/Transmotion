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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <Trash2 size={22} className="text-red-600" />
        </div>
        <h2 className="mb-1 text-base font-semibold text-gray-800">
          Hapus Pengguna?
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Akun{" "}
          <span className="font-medium text-gray-700">
            {selectedUser.name ?? selectedUser.email}
          </span>{" "}
          akan dihapus permanen dan tidak dapat dipulihkan.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={closeDeleteModal}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

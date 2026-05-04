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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
          <Trash2 size={20} className="text-red-600" />
        </div>
        <h2 className="mb-1 text-base font-semibold text-gray-800">
          Hapus Model?
        </h2>
        <p className="mb-5 text-sm text-gray-500">
          Model{" "}
          <span className="font-medium text-gray-700">{deleteTarget.name}</span>{" "}
          dan file-nya akan dihapus permanen.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={closeDeleteModal}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import useModelStore from "../../store";

export default function EditModelModal() {
  const {
    isEditModalOpen,
    currentModel,
    isSubmitting,
    closeEditModal,
    updateModel,
  } = useModelStore();

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_active: true,
    is_public: true,
  });

  useEffect(() => {
    if (currentModel) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: currentModel.name ?? "",
        description: currentModel.description ?? "",
        is_active: currentModel.is_active ?? true,
        is_public: currentModel.is_public ?? true,
      });
    }
  }, [currentModel]);

  if (!isEditModalOpen || !currentModel) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nama model harus diisi");
      return;
    }
    const result = await updateModel(currentModel.id, form);
    if (result.success) {
      toast.success(result.message);
      closeEditModal();
    } else toast.error(result.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">Edit Model</h2>
          <button
            onClick={closeEditModal}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nama Model
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Deskripsi{" "}
              <span className="font-normal text-gray-400">(opsional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-6">
            {[
              { key: "is_active", label: "Model Aktif" },
              { key: "is_public", label: "Publik (dapat digunakan user)" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [key]: e.target.checked }))
                  }
                  className="h-4 w-4 rounded accent-blue-600"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={closeEditModal}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

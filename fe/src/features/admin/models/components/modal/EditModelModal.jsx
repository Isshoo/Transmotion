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
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="animate-scale-in flex w-full max-w-md flex-col rounded-2xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-lg)"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between rounded-t-2xl border-b border-(--border-subtle) bg-(--bg-elevated) px-6 py-4">
          <h2 className="text-lg font-bold tracking-tight text-(--text-primary)">
            Edit Model
          </h2>
          <button
            onClick={closeEditModal}
            className="rounded-lg p-2 text-(--text-tertiary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary)"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wide text-(--text-secondary) uppercase">
              Nama Model
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-xl border border-(--border-strong) bg-(--bg-elevated) px-4 py-2.5 text-sm font-medium text-(--text-primary) transition-all outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
              placeholder="Masukkan nama model"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-bold tracking-wide text-(--text-secondary) uppercase">
              Deskripsi
              <span className="rounded bg-(--bg-overlay) px-1.5 py-0.5 text-[10px] font-normal text-(--text-tertiary) normal-case">
                opsional
              </span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={3}
              placeholder="Masukkan deskripsi model..."
              className="w-full resize-none rounded-xl border border-(--border-strong) bg-(--bg-elevated) px-4 py-2.5 text-sm font-medium text-(--text-primary) transition-all outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
            />
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-(--border-default) bg-(--bg-elevated) p-4">
            {[
              {
                key: "is_active",
                label: "Model Aktif",
                desc: "Model dapat diakses di sistem",
              },
              {
                key: "is_public",
                label: "Publik",
                desc: "Model dapat digunakan oleh user lain",
              },
            ].map(({ key, label, desc }) => (
              <label
                key={key}
                className="group flex cursor-pointer items-start gap-3 rounded-lg transition-colors"
              >
                <div className="relative flex items-center pt-0.5">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [key]: e.target.checked }))
                    }
                    className="peer sr-only"
                  />
                  <div className="h-5 w-5 rounded border-2 border-(--border-strong) bg-(--bg-surface) transition-colors peer-checked:border-(--accent) peer-checked:bg-(--accent) peer-focus-visible:ring-2 peer-focus-visible:ring-(--accent-muted)" />
                  <svg
                    className="pointer-events-none absolute top-[55%] left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-(--bg-base) opacity-0 transition-opacity peer-checked:opacity-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-(--text-primary) transition-colors group-hover:text-(--accent)">
                    {label}
                  </span>
                  <span className="text-[11px] font-medium text-(--text-tertiary)">
                    {desc}
                  </span>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeEditModal}
              disabled={isSubmitting}
              className="rounded-xl border border-(--border-strong) bg-(--bg-elevated) px-4 py-2.5 text-sm font-bold tracking-wide text-(--text-secondary) transition-all hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-(--accent) px-4 py-2.5 text-sm font-bold tracking-wide text-(--bg-base) shadow-(--shadow-sm) transition-all hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { toast } from "sonner";
import useTrainingStore from "../../store";
import { Ban } from "lucide-react";

export default function CancelConfirmModal() {
  const {
    isCancelModalOpen,
    cancelTarget,
    isSubmitting,
    closeCancelModal,
    cancelJob,
  } = useTrainingStore();
  if (!isCancelModalOpen || !cancelTarget) return null;

  const handleConfirm = async () => {
    const result = await cancelJob(cancelTarget.id);
    if (result.success) {
      toast.success(result.message);
      closeCancelModal();
    } else toast.error(result.message);
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-sm rounded-xl border border-(--border-default) bg-(--bg-surface) p-6 shadow-(--shadow-xl)">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-(--error-muted)">
          <Ban size={20} className="text-(--error)" />
        </div>
        <h2 className="mb-1.5 text-base font-semibold tracking-tight text-(--text-primary)">
          Batalkan Job?
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-(--text-secondary)">
          Job{" "}
          <span className="font-medium text-(--text-primary)">
            {cancelTarget.display_name}
          </span>{" "}
          akan dibatalkan.
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            onClick={closeCancelModal}
            disabled={isSubmitting}
            className="rounded-md border border-(--border-default) px-4 py-2 text-sm font-medium text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:opacity-50"
          >
            Tidak
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="rounded-md bg-(--error) px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-[#dc2626] disabled:opacity-50"
          >
            {isSubmitting ? "Membatalkan..." : "Ya, Batalkan"}
          </button>
        </div>
      </div>
    </div>
  );
}

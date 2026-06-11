import { Ban } from "lucide-react";

export function CancelConfirm2Modal({ onConfirm, onCancel, isLoading }) {
  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-sm rounded-xl border border-(--border-default) bg-(--bg-surface) p-6 shadow-(--shadow-xl)">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-(--error-muted)">
          <Ban size={20} className="text-(--error)" />
        </div>
        <h2 className="mb-1.5 text-base font-semibold tracking-tight text-(--text-primary)">
          Cancel Training?
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-(--text-secondary)">
          The ongoing training process will be stopped.
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-md border border-(--border-default) px-4 py-2 text-sm font-medium text-(--text-secondary) transition-all duration-150 hover:border-(--border-strong) hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:opacity-50"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-md bg-(--error) px-4 py-2 text-sm font-medium text-(--bg-base) transition-all duration-150 hover:bg-(--error-hover) disabled:opacity-50"
          >
            {isLoading ? "Cancelling..." : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

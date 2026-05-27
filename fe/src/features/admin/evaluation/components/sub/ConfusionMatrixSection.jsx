import ConfusionMatrix from "@/features/admin/training/components/ConfusionMatrix";

export default function ConfusionMatrixSection({ mbert, xlmr }) {
  const bMbert = mbert.find((m) => m.confusion_matrix);
  const bXlmr = xlmr.find((m) => m.confusion_matrix);

  if (!bMbert && !bXlmr) return null;

  return (
    <div>
      <p className="mb-4 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
        Confusion Matrix (Model Terbaik)
      </p>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {bXlmr?.confusion_matrix && (
          <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm)">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-md border border-(--data-4)/20 bg-(--data-4)/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-(--data-4) uppercase shadow-(--shadow-sm)">
                XLM-R
              </span>
              <span title={bXlmr.name} className="truncate text-xs font-bold text-(--text-secondary)">
                {bXlmr.name}
              </span>
            </div>
            <ConfusionMatrix data={bXlmr.confusion_matrix} />
          </div>
        )}
        {bMbert?.confusion_matrix && (
          <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm)">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-md border border-(--data-1)/20 bg-(--data-1)/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-(--data-1) uppercase shadow-(--shadow-sm)">
                MBERT
              </span>
              <span title={bMbert.name} className="truncate text-xs font-bold text-(--text-secondary)">
                {bMbert.name}
              </span>
            </div>
            <ConfusionMatrix data={bMbert.confusion_matrix} />
          </div>
        )}
      </div>
    </div>
  );
}

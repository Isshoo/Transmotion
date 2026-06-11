import ConfusionMatrix from "@/features/admin/training/components/ConfusionMatrix";
import InfoPopup from "@/components/ui/InfoPopup";
import { CONFUSION_MATRIX_COMPARISON_INFO } from "@/components/ui/InfoContents";

export default function ConfusionMatrixSection({ mbert, xlmr }) {
  const bMbert = mbert.find((m) => m.confusion_matrix);
  const bXlmr = xlmr.find((m) => m.confusion_matrix);

  if (!bMbert && !bXlmr) return null;

  return (
    <div>
      <div className="mb-4 flex items-center gap-1.5">
        <p className="text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
          Confusion Matrix (Best Model)
        </p>
        <InfoPopup title="Confusion Matrix Comparison — Guide">
          {CONFUSION_MATRIX_COMPARISON_INFO}
        </InfoPopup>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {bXlmr?.confusion_matrix && (
          <div className="rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm)">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-md border border-(--data-4)/20 bg-(--data-4)/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-(--data-4) uppercase shadow-(--shadow-sm)">
                XLM-R
              </span>
              <span
                title={bXlmr.name}
                className="truncate text-xs font-bold text-(--text-secondary)"
              >
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
              <span
                title={bMbert.name}
                className="truncate text-xs font-bold text-(--text-secondary)"
              >
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

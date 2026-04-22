import ConfusionMatrix from "@/features/admin/training/components/ConfusionMatrix";

export default function ConfusionMatrixSection({ mbert, xlmr }) {
  const bMbert = mbert.find((m) => m.confusion_matrix);
  const bXlmr = xlmr.find((m) => m.confusion_matrix);

  if (!bMbert && !bXlmr) return null;

  return (
    <div>
      <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        Confusion Matrix (Model Terbaik)
      </p>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {bXlmr?.confusion_matrix && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                XLM-R
              </span>
              <span className="truncate text-xs text-gray-500">
                {bXlmr.name}
              </span>
            </div>
            <ConfusionMatrix data={bXlmr.confusion_matrix} />
          </div>
        )}
        {bMbert?.confusion_matrix && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700">
                MBERT
              </span>
              <span className="truncate text-xs text-gray-500">
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

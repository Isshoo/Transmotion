import { bestModel, fmt } from "../ui/Helpers";

export default function ComparisonTable({ mbert, xlmr }) {
  const bMbert = bestModel(mbert);
  const bXlmr = bestModel(xlmr);

  const rows = [
    { label: "Accuracy", xlmrVal: bXlmr?.accuracy, mbertVal: bMbert?.accuracy },
    {
      label: "Precision",
      xlmrVal: bXlmr?.precision,
      mbertVal: bMbert?.precision,
    },
    { label: "Recall", xlmrVal: bXlmr?.recall, mbertVal: bMbert?.recall },
    { label: "F1-score", xlmrVal: bXlmr?.f1_score, mbertVal: bMbert?.f1_score },
    {
      label: "Macro Average",
      xlmrVal: bXlmr?.macro_avg?.f1,
      mbertVal: bMbert?.macro_avg?.f1,
    },
    {
      label: "Weighted Average",
      xlmrVal: bXlmr?.weighted_avg?.f1,
      mbertVal: bMbert?.weighted_avg?.f1,
    },
    { label: "MCC", xlmrVal: bXlmr?.mcc, mbertVal: bMbert?.mcc, raw: true },
    {
      label: "ROC-AUC",
      xlmrVal: bXlmr?.roc_auc,
      mbertVal: bMbert?.roc_auc,
      raw: true,
    },
    {
      label: "Mean Std",
      xlmrVal: bXlmr?.mean_std,
      mbertVal: bMbert?.mean_std,
      raw: true,
      lowerBetter: true,
    },
  ];

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-(--border-default) shadow-(--shadow-sm)">
        <div className="scrollbar-thin scrollbar-thumb-(--border-strong) overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-34 border-r border-b border-(--border-default) bg-(--bg-elevated) px-6 py-3.5 text-left text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                  Metric
                </th>
                <th className="border-r border-b border-(--border-default) bg-(--data-4)/10 px-6 py-3.5 text-center text-[10px] font-black tracking-wider text-(--data-4) uppercase">
                  XLM-R
                </th>
                <th className="border-b border-(--border-default) bg-(--data-1)/10 px-6 py-3.5 text-center text-[10px] font-black tracking-wider text-(--data-1) uppercase">
                  MBERT
                </th>
              </tr>
            </thead>
            <tbody className="bg-(--bg-surface)">
              {rows.map(
                ({ label, xlmrVal, mbertVal, raw, lowerBetter }, idx) => {
                  const xlmrWins =
                    xlmrVal != null &&
                    mbertVal != null &&
                    (lowerBetter ? xlmrVal < mbertVal : xlmrVal > mbertVal);
                  const mbertWins =
                    xlmrVal != null &&
                    mbertVal != null &&
                    (lowerBetter ? mbertVal < xlmrVal : mbertVal > xlmrVal);

                  const isLast = idx === rows.length - 1;

                  return (
                    <tr
                      key={label}
                      className="transition-colors duration-150 hover:bg-(--bg-overlay)"
                    >
                      <td
                        className={`border-r border-(--border-default) ${!isLast ? "border-b" : ""} bg-(--bg-elevated) px-5 py-3 text-[13px] font-bold text-(--text-primary)`}
                      >
                        {label}
                        {lowerBetter && (
                          <span className="ml-2 inline-flex items-center rounded-md border border-(--border-subtle) bg-(--bg-overlay) px-1.5 py-0.5 text-[9px] font-medium text-(--text-tertiary)">
                            ↓ lower is better
                          </span>
                        )}
                      </td>
                      <td
                        className={`border-r border-(--border-default) ${!isLast ? "border-b" : ""} px-5 py-3 text-center font-mono text-[13px] font-medium ${
                          xlmrWins
                            ? "bg-(--success-muted)/10 font-bold text-(--success)"
                            : "text-(--text-secondary)"
                        }`}
                      >
                        {fmt(xlmrVal, raw)}
                        {xlmrWins && (
                          <span className="ml-1.5 text-[10px] text-(--success)">
                            ▲
                          </span>
                        )}
                      </td>
                      <td
                        className={`border-(--border-default) ${!isLast ? "border-b" : ""} px-5 py-3 text-center font-mono text-[13px] font-medium ${
                          mbertWins
                            ? "bg-(--success-muted)/10 font-bold text-(--success)"
                            : "text-(--text-secondary)"
                        }`}
                      >
                        {fmt(mbertVal, raw)}
                        {mbertWins && (
                          <span className="ml-1.5 text-[10px] text-(--success)">
                            ▲
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-lg border border-(--border-subtle) bg-(--bg-elevated) p-3">
        <span className="text-sm">💡</span>
        <p className="text-[11px] leading-relaxed text-(--text-tertiary)">
          <strong className="text-(--success)">▲</strong> indicates a better value. The best model is selected based on the highest{" "}
          <strong className="text-(--text-secondary)">Accuracy</strong>.
          <br />
          <strong className="text-(--text-secondary)">Mean Std:</strong>{" "}
          average standard deviation of confidence scores (lower = more confident).
        </p>
      </div>
    </div>
  );
}

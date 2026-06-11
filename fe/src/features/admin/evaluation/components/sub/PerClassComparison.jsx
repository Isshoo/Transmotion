import { bestModel } from "../ui/Helpers";
import InfoPopup from "@/components/ui/InfoPopup";
import { PER_CLASS_COMPARISON_INFO } from "@/components/ui/InfoContents";

export default function PerClassComparison({ mbert, xlmr }) {
  const bMbert = bestModel(mbert);
  const bXlmr = bestModel(xlmr);

  const mbertPc = bMbert?.per_class_metrics;
  const xlmrPc = bXlmr?.per_class_metrics;

  if (!mbertPc && !xlmrPc) return null;

  const labels = [
    ...new Set([...Object.keys(xlmrPc || {}), ...Object.keys(mbertPc || {})]),
  ].sort();

  return (
    <div>
      <div className="mb-4 flex items-center gap-1.5">
        <p className="text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
          Per-Class Metrics (Best Model)
        </p>
        <InfoPopup title="Per-Class Comparison — Guide">
          {PER_CLASS_COMPARISON_INFO}
        </InfoPopup>
      </div>
      <div className="overflow-hidden rounded-xl border border-(--border-default) shadow-(--shadow-sm)">
        <div className="scrollbar-thin scrollbar-thumb-(--border-strong) overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th
                  rowSpan={2}
                  className="border-r border-b border-(--border-default) bg-(--bg-elevated) px-5 py-3 text-left text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase"
                >
                  Class
                </th>
                <th
                  colSpan={3}
                  className="border-r border-b border-(--border-default) bg-(--data-4)/10 px-5 py-2.5 text-center text-[10px] font-black tracking-wider text-(--data-4) uppercase"
                >
                  XLM-R
                </th>
                <th
                  colSpan={3}
                  className="border-b border-(--border-default) bg-(--data-1)/10 px-5 py-2.5 text-center text-[10px] font-black tracking-wider text-(--data-1) uppercase"
                >
                  MBERT
                </th>
              </tr>
              <tr>
                {["Precision", "Recall", "F1"].map((h) => (
                  <th
                    key={`xlmr-${h}`}
                    className="border-r border-b border-(--border-default) bg-(--bg-surface) px-4 py-2 text-center text-[9px] font-bold tracking-wider text-(--text-tertiary) uppercase"
                  >
                    {h}
                  </th>
                ))}
                {["Precision", "Recall", "F1"].map((h, i) => (
                  <th
                    key={`mbert-${h}`}
                    className={`border-b ${i !== 2 ? "border-r" : ""} border-(--border-default) bg-(--bg-surface) px-4 py-2 text-center text-[9px] font-bold tracking-wider text-(--text-tertiary) uppercase`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-(--bg-surface)">
              {labels.map((cls, idx) => {
                const xm = xlmrPc?.[cls];
                const bm = mbertPc?.[cls];
                const isLast = idx === labels.length - 1;
                return (
                  <tr
                    key={cls}
                    className="transition-colors duration-150 hover:bg-(--bg-overlay)"
                  >
                    <td
                      className={`border-r border-(--border-default) ${!isLast ? "border-b" : ""} bg-(--bg-elevated) px-5 py-3 font-bold text-(--text-primary)`}
                    >
                      {cls}
                    </td>
                    {["precision", "recall", "f1"].map((metric) => (
                      <td
                        key={`xlmr-${metric}`}
                        className={`border-r border-(--border-default) ${!isLast ? "border-b" : ""} px-4 py-3 text-center font-mono text-[11px] font-medium ${
                          xm?.[metric] != null &&
                          bm?.[metric] != null &&
                          xm[metric] > bm[metric]
                            ? "bg-(--success-muted)/10 font-bold text-(--success)"
                            : "text-(--text-secondary)"
                        }`}
                      >
                        {xm?.[metric] != null
                          ? `${(xm[metric] * 100).toFixed(2)}%`
                          : "—"}
                      </td>
                    ))}
                    {["precision", "recall", "f1"].map((metric, i) => (
                      <td
                        key={`mbert-${metric}`}
                        className={`${i !== 2 ? "border-r" : ""} border-(--border-default) ${!isLast ? "border-b" : ""} px-4 py-3 text-center font-mono text-[11px] font-medium ${
                          bm?.[metric] != null &&
                          xm?.[metric] != null &&
                          bm[metric] > xm[metric]
                            ? "bg-(--success-muted)/10 font-bold text-(--success)"
                            : "text-(--text-secondary)"
                        }`}
                      >
                        {bm?.[metric] != null
                          ? `${(bm[metric] * 100).toFixed(2)}%`
                          : "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

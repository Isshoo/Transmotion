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
    <div className="overflow-x-auto">
      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-44 border border-gray-300 bg-blue-800 px-5 py-2.5 font-semibold text-white">
              {" "}
              Metrik{" "}
            </th>
            <th className="border border-gray-300 bg-blue-600 px-6 py-2.5 text-center font-semibold text-white">
              XLM-R
            </th>
            <th className="border border-gray-300 bg-blue-400 px-6 py-2.5 text-center font-semibold text-white">
              MBERT
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, xlmrVal, mbertVal, raw, lowerBetter }) => {
            const xlmrWins =
              xlmrVal != null &&
              mbertVal != null &&
              (lowerBetter ? xlmrVal < mbertVal : xlmrVal > mbertVal);
            const mbertWins =
              xlmrVal != null &&
              mbertVal != null &&
              (lowerBetter ? mbertVal < xlmrVal : mbertVal > xlmrVal);

            return (
              <tr key={label} className="hover:bg-gray-50">
                <td className="border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700">
                  {label}
                  {lowerBetter && (
                    <span className="ml-1 text-[10px] text-gray-400">
                      (↓ lebih baik)
                    </span>
                  )}
                </td>
                <td
                  className={`border border-gray-200 px-4 py-2.5 text-center text-sm font-semibold ${
                    xlmrWins ? "bg-green-50 text-green-700" : "text-gray-800"
                  }`}
                >
                  {fmt(xlmrVal, raw)}
                  {xlmrWins && (
                    <span className="ml-1 text-[10px] text-green-500">▲</span>
                  )}
                </td>
                <td
                  className={`border border-gray-200 px-4 py-2.5 text-center text-sm font-semibold ${
                    mbertWins ? "bg-green-50 text-green-700" : "text-gray-800"
                  }`}
                >
                  {fmt(mbertVal, raw)}
                  {mbertWins && (
                    <span className="ml-1 text-[10px] text-green-500">▲</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-1.5 text-[10px] text-gray-400">
        ▲ = nilai lebih baik. Best model dipilih berdasarkan Accuracy tertinggi.
        Mean Std: rata-rata standar deviasi confidence score (lebih rendah =
        lebih confident).
      </p>
    </div>
  );
}

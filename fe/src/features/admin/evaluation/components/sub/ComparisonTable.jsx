import { bestModel, fmtPct } from "../ui/Helpers";

export default function ComparisonTable({ mbert, xlmr }) {
  const bMbert = bestModel(mbert);
  const bXlmr = bestModel(xlmr);

  const rows = [
    {
      label: "Accuracy",
      xlmrVal: bXlmr?.accuracy,
      mbertVal: bMbert?.accuracy,
    },
    {
      label: "Precision",
      xlmrVal: bXlmr?.precision,
      mbertVal: bMbert?.precision,
    },
    {
      label: "Recall",
      xlmrVal: bXlmr?.recall,
      mbertVal: bMbert?.recall,
    },
    {
      label: "F1-score",
      xlmrVal: bXlmr?.f1_score,
      mbertVal: bMbert?.f1_score,
    },
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
  ];

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-40 border border-gray-300 bg-blue-800 px-5 py-2.5 font-semibold text-white">
              Metrik
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
          {rows.map(({ label, xlmrVal, mbertVal }) => {
            const xlmrWins =
              xlmrVal !== null && mbertVal !== null && xlmrVal > mbertVal;
            const mbertWins =
              xlmrVal !== null && mbertVal !== null && mbertVal > xlmrVal;

            return (
              <tr key={label} className="hover:bg-gray-50">
                <td className="border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700">
                  {label}
                </td>
                <td
                  className={`border border-gray-200 px-4 py-2.5 text-center text-sm font-semibold ${
                    xlmrWins ? "bg-green-50 text-green-700" : "text-gray-800"
                  }`}
                >
                  {fmtPct(xlmrVal)}
                  {xlmrWins && (
                    <span className="ml-1 text-[10px] text-green-500">▲</span>
                  )}
                </td>
                <td
                  className={`border border-gray-200 px-4 py-2.5 text-center text-sm font-semibold ${
                    mbertWins ? "bg-green-50 text-green-700" : "text-gray-800"
                  }`}
                >
                  {fmtPct(mbertVal)}
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
        ▲ = nilai lebih tinggi. Dibandingkan dari model terbaik (F1 tertinggi)
        masing-masing tipe.
      </p>
    </div>
  );
}

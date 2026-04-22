import { bestModel } from "../ui/Helpers";

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
      <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        Metrik Per Kelas (Model Terbaik)
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="border border-gray-300 bg-blue-800 px-4 py-2 text-left font-semibold text-white"
              >
                Kelas
              </th>
              <th
                colSpan={3}
                className="border border-gray-300 bg-blue-600 px-4 py-2 text-center font-semibold text-white"
              >
                XLM-R
              </th>
              <th
                colSpan={3}
                className="border border-gray-300 bg-blue-400 px-4 py-2 text-center font-semibold text-white"
              >
                MBERT
              </th>
            </tr>
            <tr>
              {["Precision", "Recall", "F1"].map((h) => (
                <th
                  key={`xlmr-${h}`}
                  className="border border-gray-200 bg-blue-50 px-3 py-1.5 text-center font-semibold text-blue-700"
                >
                  {h}
                </th>
              ))}
              {["Precision", "Recall", "F1"].map((h) => (
                <th
                  key={`mbert-${h}`}
                  className="border border-gray-200 bg-blue-50 px-3 py-1.5 text-center font-semibold text-blue-700"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((cls) => {
              const xm = xlmrPc?.[cls];
              const bm = mbertPc?.[cls];
              return (
                <tr key={cls} className="hover:bg-gray-50">
                  <td className="border border-gray-200 bg-gray-50 px-4 py-2 font-semibold text-gray-700">
                    {cls}
                  </td>
                  {["precision", "recall", "f1"].map((metric) => (
                    <td
                      key={`xlmr-${metric}`}
                      className={`border border-gray-200 px-3 py-2 text-center font-medium ${
                        xm?.[metric] !== null &&
                        bm?.[metric] !== null &&
                        xm[metric] > bm[metric]
                          ? "bg-green-50 text-green-700"
                          : "text-gray-700"
                      }`}
                    >
                      {xm?.[metric] !== null
                        ? `${(xm[metric] * 100).toFixed(2)}%`
                        : "—"}
                    </td>
                  ))}
                  {["precision", "recall", "f1"].map((metric) => (
                    <td
                      key={`mbert-${metric}`}
                      className={`border border-gray-200 px-3 py-2 text-center font-medium ${
                        bm?.[metric] !== null &&
                        xm?.[metric] !== null &&
                        bm[metric] > xm[metric]
                          ? "bg-green-50 text-green-700"
                          : "text-gray-700"
                      }`}
                    >
                      {bm?.[metric] !== null
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
  );
}

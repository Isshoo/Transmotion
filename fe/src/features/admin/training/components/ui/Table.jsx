export function PerClassTable({ perClass, labels }) {
  if (!perClass || Object.keys(perClass).length === 0) return null;
  const rows = labels || Object.keys(perClass);

  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        Metrik Per Kelas
      </p>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-gray-50">
              {["Kelas", "Precision", "Recall", "F1-Score", "Support"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left font-semibold text-gray-500"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((cls) => {
              const m = perClass[cls];
              if (!m) return null;
              return (
                <tr key={cls} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-semibold text-gray-700">
                    {cls}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {(m.precision * 100).toFixed(2)}%
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {(m.recall * 100).toFixed(2)}%
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {(m.f1 * 100).toFixed(2)}%
                  </td>
                  <td className="px-3 py-2 text-gray-500">{m.support}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AverageTable({ macroAvg, weightedAvg }) {
  if (!macroAvg && !weightedAvg) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        Rata-rata
      </p>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-gray-50">
              {["", "Precision", "Recall", "F1-Score"].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left font-semibold text-gray-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {macroAvg && (
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 font-semibold text-gray-700">
                  Macro Average
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {(macroAvg.precision * 100).toFixed(2)}%
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {(macroAvg.recall * 100).toFixed(2)}%
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {(macroAvg.f1 * 100).toFixed(2)}%
                </td>
              </tr>
            )}
            {weightedAvg && (
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 font-semibold text-gray-700">
                  Weighted Average
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {(weightedAvg.precision * 100).toFixed(2)}%
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {(weightedAvg.recall * 100).toFixed(2)}%
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {(weightedAvg.f1 * 100).toFixed(2)}%
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

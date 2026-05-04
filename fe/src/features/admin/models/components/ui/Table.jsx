export function PerClassTable({ perClass }) {
  if (!perClass || Object.keys(perClass).length === 0) return null;
  return (
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
          {Object.entries(perClass).map(([cls, m]) => (
            <tr key={cls} className="hover:bg-gray-50">
              <td className="px-3 py-2 font-semibold text-gray-700">{cls}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

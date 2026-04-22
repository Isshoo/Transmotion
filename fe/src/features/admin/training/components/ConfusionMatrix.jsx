export default function ConfusionMatrix({ data }) {
  if (!data || !data.matrix || !data.labels) return null;

  const { matrix, labels } = data;
  const total = matrix.flat().reduce((a, b) => a + b, 0);

  // Nilai max untuk intensitas warna
  const maxVal = Math.max(...matrix.flat());

  const getBg = (val, isCorrect) => {
    if (val === 0) return "bg-gray-50 text-gray-300";
    const intensity = val / maxVal;
    if (isCorrect) {
      // Diagonal — biru
      if (intensity > 0.7) return "bg-blue-600 text-white";
      if (intensity > 0.4) return "bg-blue-400 text-white";
      return "bg-blue-200 text-blue-800";
    } else {
      // Off-diagonal — merah
      if (intensity > 0.3) return "bg-red-400 text-white";
      if (intensity > 0.1) return "bg-red-200 text-red-800";
      return "bg-red-50 text-red-500";
    }
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="w-20 px-2 py-1 text-right text-[10px] text-gray-400">
                Aktual ↓ / Prediksi →
              </th>
              {labels.map((l) => (
                <th
                  key={l}
                  className="border border-gray-200 bg-gray-100 px-3 py-2 text-center font-semibold text-gray-700"
                >
                  {l}
                </th>
              ))}
              <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-center font-semibold text-gray-500">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => {
              const rowTotal = row.reduce((a, b) => a + b, 0);
              return (
                <tr key={i}>
                  <td className="border border-gray-200 bg-gray-100 px-2 py-2 text-right font-semibold whitespace-nowrap text-gray-700">
                    {labels[i]}
                  </td>
                  {row.map((val, j) => (
                    <td
                      key={j}
                      className={`border border-gray-200 px-3 py-2 text-center font-semibold ${getBg(val, i === j)}`}
                    >
                      <div>{val}</div>
                      {rowTotal > 0 && (
                        <div className="text-[10px] font-normal opacity-75">
                          {((val / rowTotal) * 100).toFixed(0)}%
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="border border-gray-200 bg-gray-50 px-3 py-2 text-center font-medium text-gray-500">
                    {rowTotal}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-1 text-[10px] text-gray-400">Total sampel: {total}</p>
    </div>
  );
}

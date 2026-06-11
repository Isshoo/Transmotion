export default function ConfusionMatrix({ data }) {
  if (!data || !data.matrix || !data.labels) return null;

  const { matrix, labels } = data;
  const total = matrix.flat().reduce((a, b) => a + b, 0);

  // Nilai max untuk intensitas warna
  const maxVal = Math.max(...matrix.flat());

  const getBg = (val, isCorrect) => {
    if (val === 0) return "bg-(--bg-elevated) text-(--text-tertiary)";
    const intensity = val / maxVal;
    if (isCorrect) {
      // Diagonal — biru/accent
      if (intensity > 0.7)
        return "bg-(--accent) text-(--bg-base) font-bold ring-1 ring-inset ring-(--accent-hover)";
      if (intensity > 0.4) return "bg-(--accent)/70 text-(--bg-base) font-bold";
      return "bg-(--accent-muted) text-(--accent)";
    } else {
      // Off-diagonal — merah/error
      if (intensity > 0.3)
        return "bg-(--error) text-(--bg-base) font-bold ring-1 ring-inset ring-(--error-hover)";
      if (intensity > 0.1) return "bg-(--error)/70 text-(--bg-base) font-bold";
      return "bg-(--error-muted) text-(--error)";
    }
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-(--border-default) shadow-(--shadow-sm)">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="w-28 bg-(--bg-surface) px-3 py-2 text-right text-[10px] font-medium tracking-wider text-(--text-tertiary) uppercase">
                Actual ↓ / Predicted →
              </th>
              {labels.map((l) => (
                <th
                  key={l}
                  className="border border-(--border-default) bg-(--bg-elevated) px-4 py-3 text-center font-semibold tracking-wide whitespace-nowrap text-(--text-primary)"
                >
                  {l}
                </th>
              ))}
              <th className="border border-(--border-default) bg-(--bg-overlay) px-4 py-3 text-center font-semibold tracking-wide text-(--text-secondary)">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => {
              const rowTotal = row.reduce((a, b) => a + b, 0);
              return (
                <tr key={i}>
                  <td className="border border-(--border-default) bg-(--bg-elevated) px-3 py-3 text-right font-semibold whitespace-nowrap text-(--text-primary)">
                    {labels[i]}
                  </td>
                  {row.map((val, j) => (
                    <td
                      key={j}
                      className={`border border-(--border-default) px-3 py-2 text-center transition-colors duration-200 ${getBg(val, i === j)}`}
                    >
                      <div className="text-sm">{val}</div>
                      {rowTotal > 0 && (
                        <div className="mt-0.5 text-[10px] font-medium opacity-75">
                          {((val / rowTotal) * 100).toFixed(0)}%
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="border border-(--border-default) bg-(--bg-overlay) px-3 py-3 text-center font-bold text-(--text-secondary)">
                    {rowTotal}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-right text-[10px] font-medium tracking-wide text-(--text-tertiary) uppercase">
        Total samples:{" "}
        <span className="font-bold text-(--text-secondary)">{total}</span>
      </p>
    </div>
  );
}

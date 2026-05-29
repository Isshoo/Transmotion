export function PerClassTable({ perClass }) {
  if (!perClass || Object.keys(perClass).length === 0) return null;
  return (
    <div className="overflow-hidden rounded-lg border border-(--border-default) shadow-(--shadow-sm)">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-(--border-default) bg-(--bg-elevated)">
            {["Kelas", "Precision", "Recall", "F1-Score", "Support"].map(
              (h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-semibold whitespace-nowrap text-(--text-secondary)"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-(--border-subtle) bg-(--bg-surface)">
          {Object.entries(perClass).map(([cls, m]) => (
            <tr
              key={cls}
              className="transition-colors duration-150 hover:bg-(--bg-overlay)"
            >
              <td className="px-4 py-3 font-bold text-(--text-primary)">
                {cls}
              </td>
              <td className="px-4 py-3 font-mono font-medium text-(--text-secondary)">
                {(m.precision * 100).toFixed(2)}%
              </td>
              <td className="px-4 py-3 font-mono font-medium text-(--text-secondary)">
                {(m.recall * 100).toFixed(2)}%
              </td>
              <td className="px-4 py-3 font-mono font-bold text-(--accent)">
                {(m.f1 * 100).toFixed(2)}%
              </td>
              <td className="px-4 py-3 font-mono font-medium text-(--text-tertiary)">
                {m.support}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

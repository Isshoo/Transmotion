export function PerClassTable({ perClass, labels }) {
  if (!perClass || Object.keys(perClass).length === 0) return null;
  const rows = labels || Object.keys(perClass);

  return (
    <div>
      <p className="mb-3 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
        Metrik Per Kelas
      </p>
      <div className="overflow-hidden rounded-lg border border-(--border-default) shadow-(--shadow-sm)">
        <div className="overflow-x-auto">
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
              {rows.map((cls) => {
                const m = perClass[cls];
                if (!m) return null;
                return (
                  <tr
                    key={cls}
                    className="transition-colors duration-150 hover:bg-(--bg-overlay)"
                  >
                    <td className="px-4 py-3 font-semibold text-(--text-primary)">
                      {cls}
                    </td>
                    <td className="px-4 py-3 font-mono text-(--text-secondary)">
                      {(m.precision * 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 font-mono text-(--text-secondary)">
                      {(m.recall * 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-(--text-secondary)">
                      {(m.f1 * 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 font-mono text-(--text-tertiary)">
                      {m.support}
                    </td>
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

export function AverageTable({ macroAvg, weightedAvg }) {
  if (!macroAvg && !weightedAvg) return null;
  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-(--border-default) shadow-(--shadow-sm)">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-(--border-default) bg-(--bg-elevated)">
                {["Average Type", "Precision", "Recall", "F1-Score"].map(
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
              {macroAvg && (
                <tr className="transition-colors duration-150 hover:bg-(--bg-overlay)">
                  <td className="px-4 py-3 font-bold text-(--text-primary)">
                    Macro Average
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-(--text-secondary)">
                    {(macroAvg.precision * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-(--text-secondary)">
                    {(macroAvg.recall * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-(--accent)">
                    {(macroAvg.f1 * 100).toFixed(2)}%
                  </td>
                </tr>
              )}
              {weightedAvg && (
                <tr className="transition-colors duration-150 hover:bg-(--bg-overlay)">
                  <td className="px-4 py-3 font-bold text-(--text-primary)">
                    Weighted Average
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-(--text-secondary)">
                    {(weightedAvg.precision * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-(--text-secondary)">
                    {(weightedAvg.recall * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-(--accent)">
                    {(weightedAvg.f1 * 100).toFixed(2)}%
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

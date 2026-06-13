export default function EpochLogsTable({ logs }) {
  if (!logs || logs.length === 0) return null;

  const calculateAverage = (key) => {
    const validLogs = logs.filter((log) => log[key] != null);
    if (validLogs.length === 0) return null;
    return validLogs.reduce((acc, log) => acc + log[key], 0) / validLogs.length;
  };

  const avgAccuracy = calculateAverage("val_accuracy");
  const avgPrecision = calculateAverage("val_precision");
  const avgRecall = calculateAverage("val_recall");
  const avgF1 = calculateAverage("val_f1");

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-(--border-default) shadow-(--shadow-sm)">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-(--border-default) bg-(--bg-elevated)">
                <th className="px-4 py-3 text-left font-semibold whitespace-nowrap text-(--text-secondary)">
                  Epoch
                </th>
                <th className="border-l border-(--border-subtle) bg-(--accent-muted)/20 px-4 py-3 text-left font-semibold text-(--text-secondary)">
                  Loss
                </th>
                <th className="bg-(--accent-muted)/20 px-4 py-3 text-left font-semibold text-(--text-secondary)">
                  Acc
                </th>
                <th className="bg-(--accent-muted)/20 px-4 py-3 text-left font-semibold text-(--text-secondary)">
                  Prec
                </th>
                <th className="bg-(--accent-muted)/20 px-4 py-3 text-left font-semibold text-(--text-secondary)">
                  Recall
                </th>
                <th className="bg-(--accent-muted)/20 px-4 py-3 text-left font-semibold text-(--text-secondary)">
                  F1
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-subtle) bg-(--bg-surface)">
              {logs.map((log, i) => {
                return (
                  <tr
                    key={i}
                    className="transition-colors duration-150 hover:bg-(--bg-overlay)"
                  >
                    <td className="px-4 py-3 font-semibold text-(--text-primary)">
                      {log.epoch}
                    </td>
                    <td className="border-l border-(--border-subtle) bg-(--accent-muted)/5 px-4 py-3 font-mono text-(--text-secondary)">
                      {log.val_loss?.toFixed(4) ?? "—"}
                    </td>
                    <td className="bg-(--accent-muted)/5 px-4 py-3 font-mono text-(--text-secondary)">
                      {log.val_accuracy != null
                        ? `${(log.val_accuracy * 100).toFixed(2)}%`
                        : "—"}
                    </td>
                    <td className="bg-(--accent-muted)/5 px-4 py-3 font-mono text-(--text-secondary)">
                      {log.val_precision != null
                        ? `${(log.val_precision * 100).toFixed(2)}%`
                        : "—"}
                    </td>
                    <td className="bg-(--accent-muted)/5 px-4 py-3 font-mono text-(--text-secondary)">
                      {log.val_recall != null
                        ? `${(log.val_recall * 100).toFixed(2)}%`
                        : "—"}
                    </td>
                    <td className="bg-(--accent-muted)/5 px-4 py-3 font-mono text-(--text-secondary)">
                      {log.val_f1 != null
                        ? `${(log.val_f1 * 100).toFixed(2)}%`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-(--border-subtle) bg-(--accent-muted)/10">
              <tr>
                <td className="px-4 py-3 font-semibold text-(--text-primary)">
                  Average
                </td>

                <td className="border-l border-(--border-subtle) bg-(--accent-muted)/5 px-4 py-3 font-mono text-(--text-secondary)">
                  —
                </td>
                <td className="bg-(--accent-muted)/5 px-4 py-3 font-mono font-semibold text-(--text-primary)">
                  {avgAccuracy != null
                    ? `${(avgAccuracy * 100).toFixed(2)}%`
                    : "—"}
                </td>
                <td className="bg-(--accent-muted)/5 px-4 py-3 font-mono font-semibold text-(--text-primary)">
                  {avgPrecision != null
                    ? `${(avgPrecision * 100).toFixed(2)}%`
                    : "—"}
                </td>
                <td className="bg-(--accent-muted)/5 px-4 py-3 font-mono font-semibold text-(--text-primary)">
                  {avgRecall != null ? `${(avgRecall * 100).toFixed(2)}%` : "—"}
                </td>
                <td className="bg-(--accent-muted)/5 px-4 py-3 font-mono font-semibold text-(--text-primary)">
                  {avgF1 != null ? `${(avgF1 * 100).toFixed(2)}%` : "—"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

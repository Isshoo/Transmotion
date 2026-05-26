export default function EpochLogsTable({ logs }) {
  if (!logs || logs.length === 0) return null;

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
                <th className="bg-(--accent-muted)/20 px-4 py-3 text-left font-semibold text-(--text-secondary)">
                  Train Loss
                </th>
                <th className="border-l border-(--border-subtle) bg-(--accent-muted)/20 px-4 py-3 text-left font-semibold text-(--text-secondary)">
                  Val Loss
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
                const isLast = i === logs.length - 1;
                return (
                  <tr
                    key={i}
                    className={`transition-colors duration-150 ${isLast ? "bg-(--accent-muted)/10" : "hover:bg-(--bg-overlay)"}`}
                  >
                    <td className="px-4 py-3 font-semibold text-(--text-primary)">
                      {log.epoch}
                    </td>
                    <td className="bg-(--accent-muted)/5 px-4 py-3 font-mono text-(--text-secondary)">
                      {log.train_loss?.toFixed(4) ?? "—"}
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
          </table>
        </div>
      </div>
    </div>
  );
}

export default function EpochLogsTable({ logs }) {
  if (!logs || logs.length === 0) return null;

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap text-gray-500">
                  Epoch
                </th>
                <th className="bg-purple-50 px-3 py-2 text-left font-semibold text-gray-500">
                  Train Loss
                </th>
                <th className="bg-purple-50 px-3 py-2 text-left font-semibold text-gray-500">
                  Val Loss
                </th>
                <th className="bg-purple-50 px-3 py-2 text-left font-semibold text-gray-500">
                  Acc
                </th>
                <th className="bg-purple-50 px-3 py-2 text-left font-semibold text-gray-500">
                  Prec
                </th>
                <th className="bg-purple-50 px-3 py-2 text-left font-semibold text-gray-500">
                  Recall
                </th>
                <th className="bg-purple-50 px-3 py-2 text-left font-semibold text-gray-500">
                  F1
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log, i) => {
                const isLast = i === logs.length - 1;
                return (
                  <tr
                    key={i}
                    className={isLast ? "bg-blue-50" : "hover:bg-gray-50"}
                  >
                    <td className="px-3 py-2 font-semibold text-gray-700">
                      {log.epoch}
                    </td>
                    <td className="bg-purple-50/30 px-3 py-2 text-gray-600">
                      {log.train_loss?.toFixed(4) ?? "—"}
                    </td>
                    <td className="bg-purple-50/30 px-3 py-2 text-gray-600">
                      {log.eval_loss?.toFixed(4) ?? "—"}
                    </td>
                    <td className="bg-purple-50/30 px-3 py-2 text-gray-600">
                      {log.eval_accuracy != null
                        ? `${(log.eval_accuracy * 100).toFixed(2)}%`
                        : "—"}
                    </td>
                    <td className="bg-purple-50/30 px-3 py-2 text-gray-600">
                      {log.eval_precision != null
                        ? `${(log.eval_precision * 100).toFixed(2)}%`
                        : "—"}
                    </td>
                    <td className="bg-purple-50/30 px-3 py-2 text-gray-600">
                      {log.eval_recall != null
                        ? `${(log.eval_recall * 100).toFixed(2)}%`
                        : "—"}
                    </td>
                    <td className="bg-purple-50/30 px-3 py-2 text-gray-600">
                      {log.eval_f1 != null
                        ? `${(log.eval_f1 * 100).toFixed(2)}%`
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

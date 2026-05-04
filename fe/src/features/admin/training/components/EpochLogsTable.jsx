export default function EpochLogsTable({ logs }) {
  if (!logs || logs.length === 0) return null;

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-gray-50">
              {[
                "Epoch",
                "Train Loss",
                "Val Loss",
                "Val Accuracy",
                "Val F1",
              ].map((h) => (
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
            {logs.map((log, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-semibold text-gray-700">
                  {log.epoch}
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {log.train_loss?.toFixed(4) ?? "—"}
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {log.val_loss?.toFixed(4) ?? "—"}
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {log.val_accuracy !== null
                    ? `${(log.val_accuracy * 100).toFixed(2)}%`
                    : "—"}
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {log.val_f1 !== null
                    ? `${(log.val_f1 * 100).toFixed(2)}%`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { ChevronLeft, ChevronRight } from "lucide-react";
import useTestingStore from "../../store";
import { ConfidenceBar } from "./Bar";

export function HistoryTable() {
  const {
    history,
    historyTotal,
    historyPage,
    historyPerPage,
    isLoadingHistory,
    setHistoryPage,
  } = useTestingStore();

  const totalPages = Math.ceil(historyTotal / historyPerPage);
  if (!isLoadingHistory && historyTotal === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Riwayat Klasifikasi
      </h3>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {["Teks", "Prediksi", "Confidence", "Model", "Waktu"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoadingHistory
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3 w-24 rounded bg-gray-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                : history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="max-w-[280px] px-4 py-3">
                        <span className="line-clamp-1 text-xs text-gray-700">
                          {item.input_text}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          {item.predicted_label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.confidence !== null && (
                          <ConfidenceBar value={item.confidence} />
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {item.model_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {historyTotal > historyPerPage && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-gray-500">
              {historyTotal.toLocaleString("id")} total
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setHistoryPage(historyPage - 1)}
                disabled={historyPage <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="px-2 text-xs text-gray-600">
                {historyPage}/{totalPages}
              </span>
              <button
                onClick={() => setHistoryPage(historyPage + 1)}
                disabled={historyPage >= totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

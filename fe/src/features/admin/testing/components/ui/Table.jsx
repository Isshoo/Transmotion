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
  if (historyTotal === 0) return null;

  return (
    <div className="animate-fade-in mt-8 border-t border-(--border-default) pt-6">
      <h3 className="mb-4 text-sm font-bold tracking-tight text-(--text-primary)">
        Riwayat Klasifikasi
      </h3>
      <div className="overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-sm)">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-(--border-default) bg-(--bg-elevated)">
                {["Teks", "Prediksi", "Confidence", "Model", "Waktu"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-bold tracking-wider whitespace-nowrap text-(--text-secondary) uppercase"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-subtle)">
              {isLoadingHistory
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-3.5 w-24 rounded-md bg-(--bg-elevated)" />
                        </td>
                      ))}
                    </tr>
                  ))
                : history.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-(--bg-overlay)"
                    >
                      <td className="max-w-[280px] px-4 py-3">
                        <span className="line-clamp-2 font-mono text-[11px] leading-relaxed text-(--text-secondary)">
                          {item.input_text}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="rounded-md border border-(--accent-muted) bg-(--accent-muted)/20 px-2 py-1 text-[10px] font-bold tracking-wide text-(--accent) uppercase">
                          {item.predicted_label}
                        </span>
                      </td>
                      <td className="min-w-[140px] px-4 py-3">
                        {item.confidence !== null && (
                          <ConfidenceBar value={item.confidence} />
                        )}
                      </td>
                      <td className="px-4 py-3 text-[11px] font-medium whitespace-nowrap text-(--text-tertiary)">
                        {item.model_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-[10px] font-medium whitespace-nowrap text-(--text-tertiary)">
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
          <div className="flex items-center justify-between border-t border-(--border-default) bg-(--bg-elevated) px-4 py-3">
            <p className="text-[11px] font-medium tracking-wide text-(--text-tertiary)">
              <span className="font-bold text-(--text-primary)">
                {historyTotal.toLocaleString("id")}
              </span>{" "}
              total
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setHistoryPage(historyPage - 1)}
                disabled={historyPage <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-(--border-default) bg-(--bg-surface) text-(--text-secondary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:opacity-40 disabled:hover:bg-(--bg-surface)"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="px-2 text-[11px] font-semibold text-(--text-secondary)">
                {historyPage}{" "}
                <span className="text-(--text-tertiary)">/ {totalPages}</span>
              </span>
              <button
                onClick={() => setHistoryPage(historyPage + 1)}
                disabled={historyPage >= totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-(--border-default) bg-(--bg-surface) text-(--text-secondary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:opacity-40 disabled:hover:bg-(--bg-surface)"
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

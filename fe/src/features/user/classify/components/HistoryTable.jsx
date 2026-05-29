// ── History table ──────────────────────────────────────────────

import { ChevronLeft, ChevronRight } from "lucide-react";
import useClassifyStore from "../store";

export default function HistoryTable() {
  const {
    history,
    historyTotal,
    historyPage,
    historyPerPage,
    isLoadingHistory,
    setHistoryPage,
  } = useClassifyStore();

  const totalPages = Math.ceil(historyTotal / historyPerPage);
  const from = historyTotal === 0 ? 0 : (historyPage - 1) * historyPerPage + 1;
  const to = Math.min(historyPage * historyPerPage, historyTotal);

  if (historyTotal === 0) return null;

  return (
    <div className="animate-slide-up">
      <h3 className="mb-4 text-sm font-bold tracking-tight text-(--text-primary)">
        Riwayat Klasifikasi
      </h3>
      <div className="overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-sm)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-default) bg-(--bg-elevated)">
                {["No", "Teks", "Prediksi", "Confidence", "Waktu"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-[10px] font-bold tracking-wider whitespace-nowrap text-(--text-secondary) uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-subtle)">
              {isLoadingHistory && historyTotal === 0
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3 w-24 rounded-md bg-(--bg-elevated)" />
                        </td>
                      ))}
                    </tr>
                  ))
                : history.map((item, index) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-(--bg-overlay)"
                    >
                      <td className="max-w-[10px] px-5 py-3.5 whitespace-nowrap">
                        <span className="text-(--text-secondary)">
                          {(historyPage - 1) * historyPerPage + index + 1}
                        </span>
                      </td>
                      <td className="max-w-[280px] px-5 py-3.5">
                        <span className="line-clamp-2 text-[13px] leading-relaxed font-medium text-(--text-primary)">
                          {item.input_text}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex rounded-md border border-(--accent-muted)/50 bg-(--accent-muted)/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-(--accent) uppercase shadow-(--shadow-sm)">
                          {item.predicted_label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px]">
                        {item.confidence !== null ? (
                          <span
                            className={`font-bold ${
                              item.confidence >= 0.8
                                ? "text-(--success)"
                                : item.confidence >= 0.6
                                  ? "text-(--warning)"
                                  : "text-(--error)"
                            }`}
                          >
                            {(item.confidence * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-(--text-disabled)">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[11px] font-medium text-(--text-tertiary)">
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
          <div className="flex items-center justify-between border-t border-(--border-default) bg-(--bg-elevated) px-5 py-3">
            <p className="text-[11px] font-medium tracking-wide text-(--text-tertiary)">
              {from}–{to} dari {historyTotal}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setHistoryPage(historyPage - 1)}
                disabled={historyPage <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-(--border-strong) bg-(--bg-surface) text-(--text-secondary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 text-[11px] font-bold text-(--text-secondary)">
                {historyPage}/{totalPages}
              </span>
              <button
                onClick={() => setHistoryPage(historyPage + 1)}
                disabled={historyPage >= totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-(--border-strong) bg-(--bg-surface) text-(--text-secondary) transition-colors hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

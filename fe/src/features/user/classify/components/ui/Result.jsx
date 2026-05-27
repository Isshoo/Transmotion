import { ConfidenceBar } from "./Bar";

export function SingleResult({ result, selectedModel }) {
  if (!result) return null;
  const scores = result.all_scores || {};
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return (
    <div className="animate-scale-in overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-sm)">
      {/* Header */}
      <div className="border-b border-(--border-subtle) bg-linear-to-br from-(--accent-muted)/10 to-(--bg-surface) px-5 py-5">
        <p className="mb-2 text-[10px] font-bold tracking-wider text-(--accent) uppercase">
          Hasil Klasifikasi
        </p>
        <p className="text-3xl font-black tracking-tight text-(--text-primary)">
          {result.predicted_label}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <p className="text-sm font-medium text-(--text-secondary)">
            Confidence:{" "}
            <span className="font-bold text-(--text-primary)">
              {result.confidence !== null
                ? `${(result.confidence * 100).toFixed(1)}%`
                : "—"}
            </span>
          </p>
          {selectedModel && (
            <span className="rounded-md border border-(--border-strong) bg-(--bg-elevated) px-2 py-0.5 text-[10px] font-bold text-(--text-tertiary)">
              Model: {selectedModel.name}
            </span>
          )}
        </div>
      </div>

      {/* Skor semua kelas */}
      {entries.length > 1 && (
        <div className="space-y-3 bg-(--bg-elevated) px-5 py-5">
          <p className="mb-4 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
            Distribusi Skor Probabilitas
          </p>
          {entries.map(([label, score]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4"
            >
              <span
                className={`min-w-[100px] text-[13px] font-bold ${
                  label === result.predicted_label
                    ? "text-(--accent)"
                    : "text-(--text-secondary)"
                }`}
              >
                {label}
              </span>
              <div className="flex-1">
                <ConfidenceBar value={score} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teks input */}
      <div className="border-t border-(--border-subtle) bg-(--bg-surface) px-5 py-4">
        <p className="mb-1.5 text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
          Teks Input
        </p>
        <p className="line-clamp-4 text-sm leading-relaxed font-medium text-(--text-secondary)">
          {result.input_text}
        </p>
      </div>
    </div>
  );
}

export function BatchResults({ results, errors, csvTexts }) {
  if (results.length === 0 && errors.length === 0) return null;

  // Hitung distribusi
  const dist = {};
  results.forEach((r) => {
    dist[r.predicted_label] = (dist[r.predicted_label] || 0) + 1;
  });

  return (
    <div className="animate-scale-in space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col justify-center rounded-xl border border-(--border-default) bg-(--bg-surface) px-5 py-4 text-center shadow-(--shadow-sm)">
          <p className="mb-1 text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
            Total
          </p>
          <p className="text-2xl font-black text-(--text-primary)">
            {csvTexts.length}
          </p>
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-(--success-muted)/30 bg-(--success-muted)/10 px-5 py-4 text-center shadow-(--shadow-sm)">
          <p className="mb-1 text-[10px] font-bold tracking-wider text-(--success)/80 uppercase">
            Berhasil
          </p>
          <p className="text-2xl font-black text-(--success)">
            {results.length}
          </p>
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-(--error-muted)/30 bg-(--error-muted)/10 px-5 py-4 text-center shadow-(--shadow-sm)">
          <p className="mb-1 text-[10px] font-bold tracking-wider text-(--error)/80 uppercase">
            Error
          </p>
          <p className="text-2xl font-black text-(--error)">{errors.length}</p>
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-(--info-muted)/30 bg-(--info-muted)/10 px-5 py-4 text-center shadow-(--shadow-sm)">
          <p className="mb-1 text-[10px] font-bold tracking-wider text-(--info)/80 uppercase">
            Kelas
          </p>
          <p className="text-2xl font-black text-(--info)">
            {Object.keys(dist).length}
          </p>
        </div>
      </div>

      {/* Distribusi */}
      {/* {Object.keys(dist).length > 0 && (
        <div className="space-y-4 rounded-xl border border-(--border-default) bg-(--bg-surface) p-5 shadow-(--shadow-sm)">
          <p className="border-b border-(--border-subtle) pb-2 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
            Distribusi Prediksi
          </p>
          <div className="space-y-3">
            {Object.entries(dist)
              .sort((a, b) => b[1] - a[1])
              .map(([label, count]) => {
                const pct = ((count / results.length) * 100).toFixed(1);
                return (
                  <div key={label}>
                    <div className="mb-1.5 flex justify-between text-xs font-bold">
                      <span className="text-(--text-primary)">{label}</span>
                      <span className="text-(--text-tertiary)">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full border border-(--border-subtle) bg-(--bg-elevated)">
                      <div
                        className="h-full rounded-full bg-(--accent) shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )} */}

      {/* Tabel hasil */}
      <div className="overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-sm)">
        <div className="scrollbar-thin scrollbar-thumb-(--border-strong) max-h-94 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 border-b border-(--border-default) bg-(--bg-elevated)">
              <tr>
                {["#", "Teks", "Prediksi", "Confidence"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-bold tracking-wider whitespace-nowrap text-(--text-secondary) uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-subtle)">
              {results.map((r, i) => (
                <tr
                  key={i}
                  className="transition-colors hover:bg-(--bg-overlay)"
                >
                  <td className="px-4 py-3 text-[11px] font-medium text-(--text-tertiary)">
                    {i + 1}
                  </td>
                  <td className="max-w-[300px] px-4 py-3">
                    <span className="line-clamp-2 text-[13px] leading-relaxed font-medium text-(--text-primary)">
                      {r.input_text}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md border border-(--accent-muted)/50 bg-(--accent-muted)/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-(--accent) uppercase shadow-(--shadow-sm)">
                      {r.predicted_label}
                    </span>
                  </td>
                  <td className="w-32 px-4 py-3">
                    <ConfidenceBar value={r.confidence} />
                  </td>
                </tr>
              ))}
              {errors.map((e, i) => (
                <tr key={`err-${i}`} className="bg-(--error-muted)/5">
                  <td className="px-4 py-3 text-[11px] font-medium text-(--text-tertiary)">
                    {e.index + 1}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-(--text-secondary) italic">
                    {e.text ?? "—"}
                  </td>
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-[11px] font-bold text-(--error)"
                  >
                    {e.error}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

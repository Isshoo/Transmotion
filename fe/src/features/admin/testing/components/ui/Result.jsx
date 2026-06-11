import { ConfidenceBar } from "./Bar";

export function SingleResult({ result }) {
  if (!result) return null;
  const scores = result.all_scores || {};
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return (
    <div className="animate-scale-in overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-md)">
      {/* Header */}
      <div className="border-b border-(--border-subtle) bg-(--accent-muted)/10 px-6 py-5">
        <p className="mb-2 text-[10px] font-bold tracking-wider text-(--accent) uppercase">
          Classification Result
        </p>
        <p className="text-3xl font-black tracking-tight text-(--text-primary)">
          {result.predicted_label}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <p className="text-[11px] font-bold tracking-wide text-(--text-tertiary) uppercase">
            Confidence:
          </p>
          <span className="inline-flex items-center rounded-md bg-(--accent) px-2 py-0.5 text-[11px] font-bold text-(--bg-base) shadow-(--shadow-sm)">
            {result.confidence !== null
              ? `${(result.confidence * 100).toFixed(1)}%`
              : "—"}
          </span>
        </div>
      </div>

      {/* Probability score distribution */}
      {entries.length > 1 && (
        <div className="m-2 space-y-3 rounded-2xl bg-(--bg-elevated) px-6 py-5">
          <p className="mb-4 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
            Probability Score Distribution
          </p>
          <div className="space-y-3">
            {entries.map(([label, score]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4"
              >
                <span
                  className={`min-w-[80px] text-xs font-semibold ${
                    label === result.predicted_label
                      ? "text-(--accent)"
                      : "text-(--text-secondary)"
                  }`}
                >
                  {label}
                </span>
                <ConfidenceBar value={score} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teks input */}
      {/* <div className="border-t border-(--border-default) bg-(--bg-surface) px-6 py-4">
        <p className="mb-1.5 text-[10px] font-semibold text-(--text-tertiary)">
          Teks input
        </p>
        <p className="text-sm text-(--text-secondary)">{result.input_text}</p>
      </div> */}
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
    <div className="animate-scale-in space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-(--border-subtle) bg-(--bg-elevated) px-4 py-4 text-center shadow-(--shadow-sm)">
          <p className="text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
            Total
          </p>
          <p className="mt-1.5 text-2xl font-black text-(--text-primary)">
            {csvTexts.length}
          </p>
        </div>
        <div className="rounded-xl border border-(--success-muted)/50 bg-(--success-muted)/10 px-4 py-4 text-center shadow-(--shadow-sm)">
          <p className="text-[10px] font-bold tracking-wider text-(--success) uppercase">
            Successful
          </p>
          <p className="mt-1.5 text-2xl font-black text-(--success)">
            {results.length}
          </p>
        </div>
        <div className="rounded-xl border border-(--error-muted)/50 bg-(--error-muted)/10 px-4 py-4 text-center shadow-(--shadow-sm)">
          <p className="text-[10px] font-bold tracking-wider text-(--error) uppercase">
            Error
          </p>
          <p className="mt-1.5 text-2xl font-black text-(--error)">
            {errors.length}
          </p>
        </div>
        <div className="rounded-xl border border-(--accent-muted)/50 bg-(--accent-muted)/10 px-4 py-4 text-center shadow-(--shadow-sm)">
          <p className="text-[10px] font-bold tracking-wider text-(--accent) uppercase">
            Classes
          </p>
          <p className="mt-1.5 text-2xl font-black text-(--accent)">
            {Object.keys(dist).length}
          </p>
        </div>
      </div>

      {/* Distribusi */}
      {/* {Object.keys(dist).length > 0 && (
        <div className="rounded-xl border border-(--border-default) bg-(--bg-elevated) p-5 shadow-(--shadow-sm)">
          <p className="mb-4 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
            Prediction Distribution
          </p>
          <div className="space-y-3.5">
            {Object.entries(dist)
              .sort((a, b) => b[1] - a[1])
              .map(([label, count]) => {
                const pct = ((count / results.length) * 100).toFixed(1);
                return (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-[11px] font-medium tracking-wide uppercase">
                      <span className="text-(--text-secondary)">{label}</span>
                      <span className="text-(--text-tertiary)">
                        <strong className="text-(--text-primary)">
                          {count}
                        </strong>{" "}
                        ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--border-strong)">
                      <div
                        className="h-1.5 rounded-full bg-(--accent) shadow-(--shadow-sm) transition-all duration-500"
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
        <div className="scrollbar-thin scrollbar-thumb-(--border-strong) scrollbar-track-transparent max-h-108 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 border-b border-(--border-default) bg-(--bg-elevated) shadow-sm">
              <tr>
                {["#", "Text", "Prediction", "Confidence"].map((h) => (
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
                  <td className="px-4 py-3 font-mono text-(--text-tertiary)">
                    {i + 1}
                  </td>
                  <td className="max-w-[300px] px-4 py-3">
                    <span className="line-clamp-2 font-mono leading-relaxed text-(--text-secondary)">
                      {r.input_text}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="rounded-md border border-(--accent-muted) bg-(--accent-muted)/20 px-2 py-1 text-[10px] font-bold tracking-wide text-(--accent) uppercase">
                      {r.predicted_label}
                    </span>
                  </td>
                  <td className="min-w-[140px] px-4 py-3">
                    <ConfidenceBar value={r.confidence} />
                  </td>
                </tr>
              ))}
              {errors.map((e, i) => (
                <tr
                  key={`err-${i}`}
                  className="bg-(--error-muted)/5 transition-colors hover:bg-(--error-muted)/10"
                >
                  <td className="px-4 py-3 font-mono text-(--text-tertiary)">
                    {e.index + 1}
                  </td>
                  <td className="px-4 py-3 font-mono text-(--text-tertiary) italic">
                    {e.text ?? "—"}
                  </td>
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-[11px] font-medium text-(--error)"
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

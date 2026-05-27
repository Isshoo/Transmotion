// ── Distribusi kelas (tabel sederhana) ─────────────────────────

export default function ClassDistribution({
  rawDistribution,
  preprocessedDistribution,
  status,
}) {
  if (!rawDistribution || Object.keys(rawDistribution).length === 0)
    return null;

  const rawTotal = Object.values(rawDistribution).reduce((a, b) => a + b, 0);
  const preprocessedTotal = preprocessedDistribution
    ? Object.values(preprocessedDistribution).reduce((a, b) => a + b, 0)
    : 0;

  const showPreprocessed = status === "completed" && preprocessedTotal > 0;

  // Gabungkan semua key (label) unik
  const allLabels = new Set([
    ...Object.keys(rawDistribution),
    ...Object.keys(preprocessedDistribution || {}),
  ]);

  // Siapkan data terstruktur dan sort berdasarkan jumlah raw terbanyak
  const distributionData = Array.from(allLabels)
    .map((label) => {
      const rawCount = rawDistribution[label] || 0;
      const preCount =
        (preprocessedDistribution && preprocessedDistribution[label]) || 0;
      return {
        label,
        rawCount,
        preCount,
        rawPct: rawTotal > 0 ? (rawCount / rawTotal) * 100 : 0,
        prePct:
          preprocessedTotal > 0 ? (preCount / preprocessedTotal) * 100 : 0,
      };
    })
    .sort((a, b) => b.rawCount - a.rawCount);

  return (
    <div className="overflow-hidden rounded-lg border border-(--border-default)">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-(--border-default) bg-(--bg-elevated)">
            <th className="px-4 py-2.5 text-left text-xs font-semibold tracking-wider text-(--text-tertiary) uppercase">
              Label
            </th>
            <th className="px-4 py-2.5 text-center text-xs font-semibold tracking-wider text-(--text-tertiary) uppercase">
              Raw
            </th>
            {showPreprocessed && (
              <th className="px-4 py-2.5 text-center text-xs font-semibold tracking-wider text-(--text-tertiary) uppercase">
                Preprocessed
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-(--border-subtle)">
          {distributionData.map(
            ({ label, rawCount, preCount, rawPct, prePct }) => (
              <tr
                key={label}
                className="transition-colors duration-100 hover:bg-(--bg-overlay)"
              >
                <td className="px-4 py-2 text-xs font-medium text-(--text-secondary)">
                  {label}
                </td>
                <td className="px-4 py-2 text-center text-xs text-(--text-primary) tabular-nums">
                  {rawCount.toLocaleString("id")}
                  <span className="ml-1.5 text-(--text-tertiary) opacity-70">
                    ({rawPct.toFixed(1)}%)
                  </span>
                </td>
                {showPreprocessed && (
                  <td className="px-4 py-2 text-center text-xs text-(--text-primary) tabular-nums">
                    {preCount.toLocaleString("id")}
                    <span className="ml-1.5 text-(--text-tertiary) opacity-70">
                      ({prePct.toFixed(1)}%)
                    </span>
                  </td>
                )}
              </tr>
            )
          )}
        </tbody>
        <tfoot>
          <tr className="border-t border-(--border-default) bg-(--bg-elevated)">
            <td className="px-4 py-2.5 text-xs font-semibold text-(--text-primary)">
              Total
            </td>
            <td className="px-4 py-2.5 text-center text-xs font-semibold text-(--text-primary) tabular-nums">
              {rawTotal.toLocaleString("id")}
            </td>
            {showPreprocessed && (
              <td className="px-4 py-2.5 text-center text-xs font-semibold text-(--text-primary) tabular-nums">
                {preprocessedTotal.toLocaleString("id")}
              </td>
            )}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

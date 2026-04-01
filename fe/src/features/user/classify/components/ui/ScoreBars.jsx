// ── Score bars ─────────────────────────────────────────────────

export default function ScoreBars({ scores, predictedLabel }) {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-2">
      {entries.map(([label, score]) => {
        const pct = (score * 100).toFixed(1);
        const isTop = label === predictedLabel;
        return (
          <div key={label}>
            <div className="mb-0.5 flex justify-between text-xs">
              <span
                className={`font-medium ${isTop ? "text-blue-700" : "text-gray-600"}`}
              >
                {label}
              </span>
              <span
                className={
                  isTop ? "font-semibold text-blue-700" : "text-gray-500"
                }
              >
                {pct}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${isTop ? "bg-blue-500" : "bg-gray-300"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

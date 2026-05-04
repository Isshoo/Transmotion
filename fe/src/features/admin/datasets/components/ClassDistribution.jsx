// ── Distribusi kelas ───────────────────────────────────────────

export default function ClassDistribution({ title, distribution, colorClass }) {
  if (!distribution || Object.keys(distribution).length === 0) return null;
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        {title}
      </p>
      <div className="space-y-2">
        {Object.entries(distribution)
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => {
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            return (
              <div key={label}>
                <div className="mb-0.5 flex justify-between text-xs">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-gray-500">
                    {count.toLocaleString("id")} ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full transition-all ${colorClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        <p className="pt-1 text-xs text-gray-400">
          Total: {total.toLocaleString("id")} baris
        </p>
      </div>
    </div>
  );
}

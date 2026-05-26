// ── Distribusi kelas ───────────────────────────────────────────

export default function ClassDistribution({ title, distribution, colorClass }) {
  if (!distribution || Object.keys(distribution).length === 0) return null;
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <div>
      <p className="mb-2.5 text-[10px] font-semibold tracking-widest text-(--text-tertiary) uppercase">
        {title}
      </p>
      <div className="space-y-3">
        {Object.entries(distribution)
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => {
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            return (
              <div key={label}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-medium text-(--text-secondary)">
                    {label}
                  </span>
                  <span className="text-(--text-tertiary)">
                    {count.toLocaleString("id")}{" "}
                    <span className="opacity-60">({pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--bg-elevated)">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        <div className="pt-2">
          <p className="text-[10px] font-medium tracking-wider text-(--text-disabled) uppercase">
            Total: {total.toLocaleString("id")} baris
          </p>
        </div>
      </div>
    </div>
  );
}

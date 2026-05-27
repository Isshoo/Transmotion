export function MetricBar({ label, value, color }) {
  const pct = value !== null ? (value * 100).toFixed(2) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-(--text-secondary)">{label}</span>
        <span className="font-semibold text-(--text-primary)">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-(--bg-elevated)">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ClassDistBar({ label, count, total }) {
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  return (
    <div>
      <div className="mb-0.5 flex justify-between text-xs">
        <span className="font-medium text-(--text-primary)">{label}</span>
        <span className="text-(--text-tertiary)">
          {count.toLocaleString("id")} ({pct}%)
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-(--bg-elevated)">
        <div
          className="h-1.5 rounded-full bg-(--data-7)"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Bar({ label, count, total, color }) {
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] font-medium tracking-wide uppercase">
        <span className="text-(--text-secondary)">{label}</span>
        <span className="text-(--text-tertiary)">
          <strong className="text-(--text-primary)">
            {count.toLocaleString("id")}
          </strong>{" "}
          ({pct}%)
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--border-strong)">
        <div
          className={`h-1.5 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ProgressBar({ progress, status }) {
  if (status !== "running") return null;
  return (
    <div className="mt-1.5 flex items-center gap-2.5">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--border-strong)">
        <div
          className="h-1.5 rounded-full bg-(--accent) shadow-(--shadow-accent) transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="w-6 text-[10px] font-bold text-(--accent) opacity-80">
        {progress}%
      </span>
    </div>
  );
}

export function MetricBar({ label, value, color }) {
  const pct = value !== null ? (value * 100).toFixed(2) : 0;
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-[10px] font-bold tracking-wider uppercase">
        <span className="text-(--text-tertiary)">{label}</span>
        <span className="text-(--text-primary)">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--border-strong)">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

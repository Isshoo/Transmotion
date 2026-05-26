export function MetricPill({ value, color }) {
  if (value === null)
    return (
      <span className="text-[11px] font-medium text-(--text-tertiary)">—</span>
    );
  return (
    <span
      className={`inline-flex items-center rounded-md border border-(--border-subtle) bg-(--bg-elevated) px-2 py-1 text-[11px] font-bold ${color}`}
    >
      {(value * 100).toFixed(1)}%
    </span>
  );
}

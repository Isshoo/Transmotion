export function MetricPill({ value, color }) {
  if (value === null) return <span className="text-xs text-gray-400">—</span>;
  return (
    <span className={`text-xs font-semibold ${color}`}>
      {(value * 100).toFixed(1)}%
    </span>
  );
}

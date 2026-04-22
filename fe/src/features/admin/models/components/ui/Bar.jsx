export function MetricBar({ label, value, color }) {
  const pct = value !== null ? (value * 100).toFixed(2) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-800">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
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
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">
          {count.toLocaleString("id")} ({pct}%)
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div
          className="h-1.5 rounded-full bg-purple-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

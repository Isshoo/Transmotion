export function Bar({ label, count, total, color }) {
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
          className={`h-1.5 rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ProgressBar({ progress, status }) {
  if (status !== "running") return null;
  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-1.5 rounded-full bg-blue-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[10px] text-gray-400">{progress}%</span>
    </div>
  );
}

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
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

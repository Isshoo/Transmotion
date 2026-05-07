export function ConfidenceBar({ value }) {
  const pct = value !== null ? (value * 100).toFixed(1) : 0;
  const color =
    value >= 0.8
      ? "bg-green-500"
      : value >= 0.6
        ? "bg-amber-500"
        : "bg-red-400";
  return (
    <div className="flex min-w-[120px] items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-gray-100">
        <div
          className={`h-1.5 rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-xs font-semibold ${
          value >= 0.8
            ? "text-green-600"
            : value >= 0.6
              ? "text-amber-600"
              : "text-red-500"
        }`}
      >
        {pct}%
      </span>
    </div>
  );
}

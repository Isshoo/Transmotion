export function ConfidenceBar({ value }) {
  const pct = value !== null ? (value * 100).toFixed(1) : 0;
  const color =
    value >= 0.8
      ? "bg-(--success) shadow-(--shadow-sm)"
      : value >= 0.6
        ? "bg-(--warning) shadow-(--shadow-sm)"
        : "bg-(--error) shadow-(--shadow-sm)";
  const textColor =
    value >= 0.8
      ? "text-(--success)"
      : value >= 0.6
        ? "text-(--warning)"
        : "text-(--error)";

  return (
    <div className="flex min-w-[120px] items-center gap-2.5">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--border-strong)">
        <div
          className={`h-1.5 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[10px] font-bold ${textColor} w-[42px]`}>
        {pct}%
      </span>
    </div>
  );
}

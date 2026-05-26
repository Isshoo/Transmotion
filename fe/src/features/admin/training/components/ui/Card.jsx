export function MetricCard({
  label,
  value,
  suffix = "",
  color = "text-(--text-primary)",
}) {
  return (
    <div className="rounded-xl border border-(--border-default) bg-(--bg-elevated) px-4 py-3.5 text-center shadow-(--shadow-sm)">
      <p className="text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
        {label}
      </p>
      <p className={`mt-1.5 text-xl font-black tracking-tight ${color}`}>
        {value !== null ? `${(value * 100).toFixed(2)}${suffix}` : "—"}
      </p>
    </div>
  );
}

export function MetricsCard({
  label,
  value,
  color = "text-(--accent)",
  suffix = "%",
}) {
  const pct =
    value !== null
      ? `${(suffix === "%" ? value * 100 : value).toFixed(2)}${suffix}`
      : "—";
  return (
    <div className="rounded-xl border border-(--border-default) bg-(--bg-elevated) px-4 py-4 text-center shadow-(--shadow-sm) transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-md)">
      <p className="text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-black tracking-tighter ${color}`}>
        {pct}
      </p>
    </div>
  );
}

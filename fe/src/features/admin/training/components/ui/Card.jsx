export function MetricCard({ label, value, suffix = "" }) {
  return (
    <div className="rounded-lg border border-gray-200 px-4 py-3 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-800">
        {value !== null ? `${(value * 100).toFixed(2)}${suffix}` : "—"}
      </p>
    </div>
  );
}

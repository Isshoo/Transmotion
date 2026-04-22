import { fmtPct } from "./Helpers";

export function MetricCell({ value, highlight }) {
  if (value === null)
    return (
      <td className="border border-gray-200 px-3 py-2 text-center text-xs text-gray-300">
        —
      </td>
    );
  return (
    <td
      className={`border border-gray-200 px-3 py-2 text-center text-xs font-semibold ${
        highlight ? "bg-blue-50 text-blue-800" : "text-gray-800"
      }`}
    >
      {fmtPct(value)}
    </td>
  );
}

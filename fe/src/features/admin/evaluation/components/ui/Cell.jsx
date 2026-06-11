import { fmt } from "./Helpers";

export function MetricCell({ value, highlight, onClick, cursor, raw }) {
  if (value == null)
    return (
      <td className="border border-(--border-default) px-3 py-2 text-center text-xs text-(--text-disabled)">
        —
      </td>
    );
  return (
    <td
      className={`border border-(--border-default) px-3 py-2 text-center text-xs font-semibold transition-colors duration-150 ${
        highlight
          ? "bg-(--accent-muted)/20 text-(--accent)"
          : "text-(--text-primary) hover:bg-(--bg-overlay)"
      }`}
      onClick={onClick}
      style={{ cursor }}
    >
      {fmt(value, raw)}
    </td>
  );
}

// ── Confidence ring ────────────────────────────────────────────

export default function ConfidenceRing({ value }) {
  const pct = Math.round(value * 100);
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  // Use CSS variable names for semantic colors
  const colorVar =
    pct >= 80
      ? "var(--success)"
      : pct >= 60
        ? "var(--warning)"
        : "var(--error)";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--border-default)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={colorVar}
          strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x="40"
          y="45"
          textAnchor="middle"
          fontSize="16"
          fontWeight="600"
          fill={colorVar}
        >
          {pct}%
        </text>
      </svg>
      <p className="text-xs text-(--text-tertiary)">Confidence</p>
    </div>
  );
}

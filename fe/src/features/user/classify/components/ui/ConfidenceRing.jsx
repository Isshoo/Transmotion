// ── Confidence ring ────────────────────────────────────────────

export default function ConfidenceRing({ value }) {
  const pct = Math.round(value * 100);
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
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
          fill={color}
        >
          {pct}%
        </text>
      </svg>
      <p className="text-xs text-gray-400">Confidence</p>
    </div>
  );
}

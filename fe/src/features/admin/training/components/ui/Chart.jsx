export function EpochChart({ logs }) {
  if (!logs || logs.length === 0) return null;

  const maxVal = 1;
  const chartH = 80;
  const chartW = 280;
  const padLeft = 24;
  const padBottom = 20;
  const innerW = chartW - padLeft;
  const innerH = chartH - padBottom;

  const toX = (i) => padLeft + (i / (logs.length - 1 || 1)) * innerW;
  const toY = (v) => (v !== null ? innerH - (v / maxVal) * innerH : null);

  const pathD = (key) => {
    const points = logs
      .map((l, i) => {
        const y = toY(l[key]);
        return y !== null ? `${toX(i)},${y}` : null;
      })
      .filter(Boolean);
    if (points.length < 2) return null;
    return "M " + points.join(" L ");
  };

  const accPath = pathD("val_accuracy");
  const lossPath = pathD("val_loss");

  return (
    <div>
      <svg
        width="100%"
        viewBox={`0 0 ${chartW} ${chartH}`}
        className="overflow-visible"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => {
          const y = toY(v);
          return (
            <g key={v}>
              <line
                x1={padLeft}
                y1={y}
                x2={chartW}
                y2={y}
                stroke="var(--border-strong)"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
              <text
                x={padLeft - 4}
                y={y + 3}
                fontSize="7"
                fill="var(--text-disabled)"
                textAnchor="end"
                className="font-medium"
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* Epoch labels */}
        {logs.map((l, i) => {
          // Culling label agar tidak menumpuk jika epoch banyak
          if (
            logs.length > 10 &&
            i % Math.ceil(logs.length / 10) !== 0 &&
            i !== logs.length - 1
          )
            return null;
          return (
            <text
              key={i}
              x={toX(i)}
              y={chartH - 2}
              fontSize="7"
              fill="var(--text-disabled)"
              textAnchor="middle"
              className="font-medium"
            >
              {l.epoch}
            </text>
          );
        })}

        {/* Lines */}
        {accPath && (
          <path
            d={accPath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_2px_4px_rgba(37,99,235,0.2)]"
          />
        )}
        {lossPath && (
          <path
            d={lossPath}
            fill="none"
            stroke="var(--warning)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_2px_4px_rgba(245,158,11,0.2)]"
          />
        )}

        {/* Dots — last point */}
        {logs.slice(-1).map((l, i) => {
          const accY = toY(l.val_accuracy);
          const lossY = toY(l.val_loss);
          return (
            <g key={i}>
              {accY !== null && (
                <circle
                  cx={toX(logs.length - 1)}
                  cy={accY}
                  r="2.5"
                  fill="var(--bg-surface)"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                />
              )}
              {lossY !== null && (
                <circle
                  cx={toX(logs.length - 1)}
                  cy={lossY}
                  r="2.5"
                  fill="var(--bg-surface)"
                  stroke="var(--warning)"
                  strokeWidth="1.5"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-4 rounded-md border border-(--border-subtle) bg-(--bg-elevated) p-1.5">
        {[
          ["bg-(--accent)", "Val Accuracy"],
          ["bg-(--warning)", "Val Loss"],
        ].map(([color, label]) => (
          <span
            key={label}
            className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-(--text-secondary) uppercase"
          >
            <span className={`inline-block h-2 w-4 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

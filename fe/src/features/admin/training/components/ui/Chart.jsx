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
      <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        Training Progress
      </p>
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
                stroke="#e5e7eb"
                strokeWidth="0.5"
              />
              <text
                x={padLeft - 4}
                y={y + 4}
                fontSize="8"
                fill="#9ca3af"
                textAnchor="end"
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* Epoch labels */}
        {logs.map((l, i) => (
          <text
            key={i}
            x={toX(i)}
            y={chartH - 4}
            fontSize="8"
            fill="#9ca3af"
            textAnchor="middle"
          >
            {l.epoch}
          </text>
        ))}

        {/* Lines */}
        {accPath && (
          <path
            d={accPath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {lossPath && (
          <path
            d={lossPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
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
                  r="3"
                  fill="#3b82f6"
                />
              )}
              {lossY !== null && (
                <circle
                  cx={toX(logs.length - 1)}
                  cy={lossY}
                  r="3"
                  fill="#f59e0b"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-1 flex gap-4">
        {[
          ["#3b82f6", "Val Accuracy"],
          ["#f59e0b", "Val Loss"],
        ].map(([color, label]) => (
          <span
            key={label}
            className="flex items-center gap-1 text-xs text-gray-500"
          >
            <span
              className="inline-block h-2 w-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

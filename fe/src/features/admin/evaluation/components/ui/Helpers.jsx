const TOLERANCE = 0.025;

export function findModelsBySplit(models, targetTestSize) {
  return models.filter(
    (m) =>
      m.test_size !== null &&
      Math.abs(m.test_size - targetTestSize) <= TOLERANCE
  );
}

export function fmtPct(val, decimals = 2) {
  if (val === null || val === undefined) return "—";
  return `${(val * 100).toFixed(decimals)}%`;
}

export function fmt(val, raw) {
  if (val == null) return "—";
  return raw ? val.toFixed(4) : `${(val * 100).toFixed(2)}%`;
}

export function bestModel(models) {
  if (!models || models.length === 0) return null;
  return models.reduce(
    (best, m) => (!best || (m.accuracy ?? 0) > (best.accuracy ?? 0) ? m : best),
    null
  );
}

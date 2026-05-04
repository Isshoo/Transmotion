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

export function bestModel(models) {
  if (!models || models.length === 0) return null;
  return models.reduce(
    (best, m) => (!best || (m.f1_score ?? 0) > (best.f1_score ?? 0) ? m : best),
    null
  );
}

import { MetricCell } from "../ui/Cell";
import { findModelsBySplit, fmtPct } from "../ui/Helpers";

const SPLITS = [
  { label: "60:40", testSize: 0.4 },
  { label: "70:30", testSize: 0.3 },
  { label: "80:20", testSize: 0.2 },
  { label: "90:10", testSize: 0.1 },
];

export default function IterationTable({ mbert, xlmr, metric = "f1_score" }) {
  const maxIter = SPLITS.reduce((acc, s) => {
    const xlmrCount = findModelsBySplit(xlmr, s.testSize).length;
    const mbertCount = findModelsBySplit(mbert, s.testSize).length;
    return Math.max(acc, xlmrCount, mbertCount);
  }, 0);

  const iterations = Array.from(
    { length: Math.min(Math.max(maxIter, 1), 5) },
    (_, i) => i
  );

  // Hitung rata-rata per split per model type
  const average = (models, testSize) => {
    const filtered = findModelsBySplit(models, testSize).filter(
      (m) => m[metric] != null
    );
    if (filtered.length === 0) return null;
    return filtered.reduce((a, m) => a + m[metric], 0) / filtered.length;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <tr>
            <th
              rowSpan={2}
              className="border border-gray-300 bg-blue-800 px-4 py-2.5 text-left font-semibold whitespace-nowrap text-white"
            >
              ITERASI
            </th>
            <th
              colSpan={4}
              className="border border-gray-300 bg-blue-600 px-4 py-2 text-center font-semibold text-white"
            >
              XLM-R
            </th>
            <th
              colSpan={4}
              className="border border-gray-300 bg-blue-400 px-4 py-2 text-center font-semibold text-white"
            >
              MBERT
            </th>
          </tr>
          <tr>
            {SPLITS.map((s) => (
              <th
                key={`xlmr-${s.label}`}
                className="border border-gray-300 bg-blue-100 px-3 py-2 text-center font-semibold whitespace-nowrap text-blue-800"
              >
                {s.label}
              </th>
            ))}
            {SPLITS.map((s) => (
              <th
                key={`mbert-${s.label}`}
                className="border border-gray-300 bg-blue-50 px-3 py-2 text-center font-semibold whitespace-nowrap text-blue-700"
              >
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {iterations.map((iter) => (
            <tr key={iter} className="hover:bg-gray-50">
              <td className="border border-gray-200 bg-blue-800 px-4 py-2 text-center font-semibold text-white">
                {iter + 1}
              </td>
              {SPLITS.map((s) => {
                const models = findModelsBySplit(xlmr, s.testSize);
                const m = models[iter];
                return (
                  <MetricCell
                    key={`xlmr-${s.label}-${iter}`}
                    value={m?.[metric]}
                    highlight={iter === models.length - 1 && models.length > 0}
                  />
                );
              })}
              {SPLITS.map((s) => {
                const models = findModelsBySplit(mbert, s.testSize);
                const m = models[iter];
                return (
                  <MetricCell
                    key={`mbert-${s.label}-${iter}`}
                    value={m?.[metric]}
                    highlight={iter === models.length - 1 && models.length > 0}
                  />
                );
              })}
            </tr>
          ))}

          {/* Baris rata-rata */}
          <tr className="font-semibold">
            <td className="border border-gray-300 bg-blue-800 px-4 py-2.5 text-center text-white">
              Average
            </td>
            {SPLITS.map((s) => {
              const avg = average(xlmr, s.testSize);
              return (
                <td
                  key={`xlmr-avg-${s.label}`}
                  className="border border-gray-200 bg-blue-50 px-3 py-2.5 text-center text-xs font-semibold text-blue-800"
                >
                  {fmtPct(avg)}
                </td>
              );
            })}
            {SPLITS.map((s) => {
              const avg = average(mbert, s.testSize);
              return (
                <td
                  key={`mbert-avg-${s.label}`}
                  className="border border-gray-200 bg-blue-50 px-3 py-2.5 text-center text-xs font-semibold text-blue-800"
                >
                  {fmtPct(avg)}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

import { MetricCell } from "../ui/Cell";
import { findModelsBySplit, fmtPct } from "../ui/Helpers";
import { useRouter } from "next/navigation";

const SPLITS = [
  { label: "60:40", testSize: 0.4 },
  { label: "70:30", testSize: 0.3 },
  { label: "80:20", testSize: 0.2 },
  { label: "90:10", testSize: 0.1 },
];

export default function IterationTable({ mbert, xlmr, metric = "accuracy" }) {
  const router = useRouter();
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
    <div className="overflow-hidden rounded-xl border border-(--border-default) shadow-(--shadow-sm)">
      <div className="scrollbar-thin scrollbar-thumb-(--border-strong) overflow-x-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="border-r border-b border-(--border-default) bg-(--bg-elevated) px-5 py-3 text-left text-[10px] font-bold tracking-wider whitespace-nowrap text-(--text-secondary) uppercase"
              >
                ITERASI
              </th>
              <th
                colSpan={4}
                className="border-r border-b border-(--border-default) bg-(--data-4)/10 px-5 py-2.5 text-center text-[10px] font-black tracking-wider text-(--data-4) uppercase"
              >
                XLM-R
              </th>
              <th
                colSpan={4}
                className="border-b border-(--border-default) bg-(--data-1)/10 px-5 py-2.5 text-center text-[10px] font-black tracking-wider text-(--data-1) uppercase"
              >
                MBERT
              </th>
            </tr>
            <tr>
              {SPLITS.map((s) => (
                <th
                  key={`xlmr-${s.label}`}
                  className="border-r border-b border-(--border-default) bg-(--bg-surface) px-4 py-2 text-center text-[9px] font-bold tracking-wider whitespace-nowrap text-(--text-tertiary) uppercase"
                >
                  {s.label}
                </th>
              ))}
              {SPLITS.map((s, i) => (
                <th
                  key={`mbert-${s.label}`}
                  className={`border-b ${i !== 3 ? "border-r" : ""} border-(--border-default) bg-(--bg-surface) px-4 py-2 text-center text-[9px] font-bold tracking-wider whitespace-nowrap text-(--text-tertiary) uppercase`}
                >
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-(--bg-surface)">
            {iterations.map((iter) => (
              <tr
                key={iter}
                className="transition-colors duration-150 hover:bg-(--bg-overlay)"
              >
                <td className="border-r border-b border-(--border-default) bg-(--bg-elevated) px-5 py-3 text-center font-black text-(--text-primary)">
                  {iter + 1}
                </td>
                {SPLITS.map((s) => {
                  const models = findModelsBySplit(xlmr, s.testSize);
                  const m = models[iter];

                  const handleClick = () => {
                    if (!m) return;
                    router.push(`/admin/models/${m.id}`);
                  };
                  return (
                    <MetricCell
                      key={`xlmr-${s.label}-${iter}`}
                      value={m?.[metric]}
                      highlight={
                        iter === models.length - 1 && models.length > 0
                      }
                      onClick={handleClick}
                      cursor={m ? "pointer" : "default"}
                    />
                  );
                })}
                {SPLITS.map((s) => {
                  const models = findModelsBySplit(mbert, s.testSize);
                  const m = models[iter];
                  const handleClick = () => {
                    if (!m) return;
                    router.push(`/admin/models/${m.id}`);
                  };
                  return (
                    <MetricCell
                      key={`mbert-${s.label}-${iter}`}
                      value={m?.[metric]}
                      highlight={
                        iter === models.length - 1 && models.length > 0
                      }
                      onClick={handleClick}
                      cursor={m ? "pointer" : "default"}
                    />
                  );
                })}
              </tr>
            ))}

            {/* Baris rata-rata */}
            <tr className="bg-(--bg-elevated)">
              <td className="border-r border-(--border-default) px-5 py-3.5 text-center text-[10px] font-black tracking-wider text-(--text-secondary) uppercase">
                Average
              </td>
              {SPLITS.map((s) => {
                const avg = average(xlmr, s.testSize);
                return (
                  <td
                    key={`xlmr-avg-${s.label}`}
                    className="border-r border-(--border-default) bg-(--accent-muted)/10 px-4 py-3 text-center text-[11px] font-bold text-(--accent)"
                  >
                    {fmtPct(avg)}
                  </td>
                );
              })}
              {SPLITS.map((s, i) => {
                const avg = average(mbert, s.testSize);
                return (
                  <td
                    key={`mbert-avg-${s.label}`}
                    className={`${i !== 3 ? "border-r" : ""} border-(--border-default) bg-(--accent-muted)/10 px-4 py-3 text-center text-[11px] font-bold text-(--accent)`}
                  >
                    {fmtPct(avg)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

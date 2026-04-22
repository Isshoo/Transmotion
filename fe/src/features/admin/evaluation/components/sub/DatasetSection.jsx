import { bestModel, fmtPct } from "../ui/Helpers";
import ComparisonTable from "./ComparisonTable";
import ConfusionMatrixSection from "./ConfusionMatrixSection";
import IterationTable from "./IterationTable";
import PerClassComparison from "./PerClassComparison";

export default function DatasetSection({ group }) {
  const { mbert, xlmr } = group;
  const hasData = mbert.length > 0 || xlmr.length > 0;

  if (!hasData) return null;

  return (
    <div className="space-y-5">
      {/* Summary counts */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
            XLM-R
          </span>
          <span className="text-sm text-gray-600">{xlmr.length} model</span>
        </div>
        <span className="text-gray-300">·</span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-400 px-3 py-0.5 text-xs font-semibold text-white">
            MBERT
          </span>
          <span className="text-sm text-gray-600">{mbert.length} model</span>
        </div>
        {xlmr.length > 0 && (
          <>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">
              Best XLM-R F1:{" "}
              <span className="font-semibold text-gray-700">
                {fmtPct(bestModel(xlmr)?.f1_score)}
              </span>
            </span>
          </>
        )}
        {mbert.length > 0 && (
          <>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">
              Best MBERT F1:{" "}
              <span className="font-semibold text-gray-700">
                {fmtPct(bestModel(mbert)?.f1_score)}
              </span>
            </span>
          </>
        )}
      </div>

      {/* Tabel iterasi */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Tabel Iterasi — F1 Score
        </p>
        <p className="mb-4 text-[11px] text-gray-400">
          Setiap baris = iterasi training ke-N dengan split yang sama. Rata-rata
          dihitung dari semua iterasi per kolom.
        </p>
        <IterationTable mbert={mbert} xlmr={xlmr} metric="f1_score" />
      </div>

      {/* Tabel perbandingan */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Perbandingan Metrik — Model Terbaik
        </p>
        <p className="mb-4 text-[11px] text-gray-400">
          Dibandingkan dari model dengan F1 Score tertinggi masing-masing tipe.
        </p>
        <ComparisonTable mbert={mbert} xlmr={xlmr} />
      </div>

      {/* Per-class comparison */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <PerClassComparison mbert={mbert} xlmr={xlmr} />
      </div>

      {/* Confusion matrix */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <ConfusionMatrixSection mbert={mbert} xlmr={xlmr} />
      </div>
    </div>
  );
}

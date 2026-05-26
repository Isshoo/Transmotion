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
    <div className="space-y-6">
      {/* Summary counts */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-(--border-default) bg-(--bg-surface) py-1 pr-3 pl-1 shadow-(--shadow-sm)">
          <span className="rounded-full bg-(--data-4)/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-(--data-4) uppercase">
            XLM-R
          </span>
          <span className="text-xs font-bold text-(--text-primary)">
            {xlmr.length} model
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-(--border-default) bg-(--bg-surface) py-1 pr-3 pl-1 shadow-(--shadow-sm)">
          <span className="rounded-full bg-(--data-1)/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-(--data-1) uppercase">
            MBERT
          </span>
          <span className="text-xs font-bold text-(--text-primary)">
            {mbert.length} model
          </span>
        </div>

        {xlmr.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-(--border-default) bg-(--bg-surface) px-3 py-1.5 shadow-(--shadow-sm)">
            <span className="text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
              Best XLM-R Accuracy:
            </span>
            <span className="rounded-md border border-(--success-muted)/20 bg-(--success-muted)/10 px-2 py-0.5 text-[11px] font-black text-(--success)">
              {fmtPct(bestModel(xlmr)?.accuracy)}
            </span>
          </div>
        )}
        {mbert.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-(--border-default) bg-(--bg-surface) px-3 py-1.5 shadow-(--shadow-sm)">
            <span className="text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
              Best MBERT Accuracy:
            </span>
            <span className="rounded-md border border-(--success-muted)/20 bg-(--success-muted)/10 px-2 py-0.5 text-[11px] font-black text-(--success)">
              {fmtPct(bestModel(mbert)?.accuracy)}
            </span>
          </div>
        )}
      </div>

      {/* Tabel iterasi */}
      <div className="rounded-2xl border border-(--border-default) bg-(--bg-surface) p-6 shadow-(--shadow-sm)">
        <div className="mb-5">
          <p className="text-sm font-bold tracking-tight text-(--text-primary)">
            Tabel Iterasi — Accuracy
          </p>
          <p className="mt-1 text-xs font-medium text-(--text-secondary)">
            Setiap baris = iterasi training ke-N dengan split yang sama.
            Rata-rata dihitung dari semua iterasi per kolom.
          </p>
        </div>
        <IterationTable mbert={mbert} xlmr={xlmr} metric="accuracy" />
      </div>

      {/* Tabel perbandingan */}
      <div className="rounded-2xl border border-(--border-default) bg-(--bg-surface) p-6 shadow-(--shadow-sm)">
        <div className="mb-5">
          <p className="text-sm font-bold tracking-tight text-(--text-primary)">
            Perbandingan Metrik — Model Terbaik
          </p>
          <p className="mt-1 text-xs font-medium text-(--text-secondary)">
            Dibandingkan dari model dengan Accuracy tertinggi masing-masing
            tipe.
          </p>
        </div>
        <ComparisonTable mbert={mbert} xlmr={xlmr} />
      </div>

      {/* Per-class comparison */}
      <div className="rounded-2xl border border-(--border-default) bg-(--bg-surface) p-6 shadow-(--shadow-sm)">
        <PerClassComparison mbert={mbert} xlmr={xlmr} />
      </div>

      {/* Confusion matrix */}
      <div className="rounded-2xl border border-(--border-default) bg-(--bg-surface) p-6 shadow-(--shadow-sm)">
        <ConfusionMatrixSection mbert={mbert} xlmr={xlmr} />
      </div>
    </div>
  );
}

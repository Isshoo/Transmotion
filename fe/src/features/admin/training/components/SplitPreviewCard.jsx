"use client";

import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Bar } from "./ui/Bar";

export default function SplitPreviewCard({ preview, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-(--border-default) bg-(--bg-surface) p-4 shadow-(--shadow-sm)">
        <Loader2 size={15} className="animate-spin text-(--accent)" />
        <span className="text-sm font-medium text-(--text-secondary)">
          Calculating distribution...
        </span>
      </div>
    );
  }

  if (!preview) return null;

  const hasErrors = !preview.is_valid && preview.validation_errors?.length > 0;

  return (
    <div
      className={`animate-scale-in overflow-hidden rounded-xl border bg-(--bg-surface) shadow-(--shadow-sm) ${hasErrors ? "border-(--error)/30" : "border-(--success)/30"}`}
    >
      {/* Header */}
      <div
        className={`flex items-center gap-2 px-4 py-2.5 ${hasErrors ? "bg-(--error-muted)/30" : "bg-(--success-muted)/30"}`}
      >
        {hasErrors ? (
          <AlertCircle size={15} className="shrink-0 text-(--error)" />
        ) : (
          <CheckCircle size={15} className="shrink-0 text-(--success)" />
        )}
        <span
          className={`text-sm font-semibold tracking-wide ${hasErrors ? "text-(--error)" : "text-(--success)"}`}
        >
          {hasErrors ? "Insufficient data" : "Split valid"}
        </span>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-4 divide-x divide-(--border-subtle) border-t border-(--border-subtle)">
        {[
          ["Total", preview.total],
          ["Train", preview.train_total],
          ["Validation", preview.val_total],
          ["Test", preview.test_total],
        ].map(([label, value]) => (
          <div key={label} className="bg-(--bg-elevated) px-4 py-3 text-center">
            <p className="text-[10px] font-bold tracking-wider text-(--text-tertiary) uppercase">
              {label}
            </p>
            <p className="mt-1 text-base font-bold text-(--text-primary)">
              {(value ?? 0).toLocaleString("id")}
            </p>
          </div>
        ))}
      </div>

      {/* Per kelas */}
      {preview.train_per_class &&
        Object.keys(preview.train_per_class).length > 0 && (
          <div className="grid grid-cols-1 gap-5 border-t border-(--border-default) p-5 sm:grid-cols-3">
            <div>
              <p className="mb-3 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                Train set
              </p>
              <div className="space-y-2.5">
                {Object.entries(preview.train_per_class).map(
                  ([label, count]) => (
                    <Bar
                      key={label}
                      label={label}
                      count={count}
                      total={preview.train_total}
                      color="bg-(--accent)"
                    />
                  )
                )}
              </div>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                Validation set
              </p>
              <div className="space-y-2.5">
                {Object.entries(preview.val_per_class || {}).map(
                  ([label, count]) => (
                    <Bar
                      key={label}
                      label={label}
                      count={count}
                      total={preview.val_total}
                      color="bg-(--data-2)"
                    />
                  )
                )}
              </div>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                Test set
              </p>
              <div className="space-y-2.5">
                {Object.entries(preview.test_per_class).map(
                  ([label, count]) => (
                    <Bar
                      key={label}
                      label={label}
                      count={count}
                      total={preview.test_total}
                      color="bg-(--warning)"
                    />
                  )
                )}
              </div>
            </div>
          </div>
        )}

      {/* Legend */}
      <div className="flex gap-4 border-t border-(--border-subtle) bg-(--bg-elevated) px-5 py-3">
        {[
          ["bg-(--accent)", "Train"],
          ["bg-(--data-2)", "Validation"],
          ["bg-(--warning)", "Test"],
        ].map(([color, label]) => (
          <span
            key={label}
            className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-(--text-secondary) uppercase"
          >
            <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>

      {/* Error list */}
      {hasErrors && (
        <div className="border-t border-(--error)/20 bg-(--error-muted)/50 px-5 py-3">
          <ul className="space-y-1">
            {preview.validation_errors.map((e, i) => (
              <li key={i} className="text-xs font-medium text-(--error)">
                • {e}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

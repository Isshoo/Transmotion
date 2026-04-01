"use client";

import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Bar } from "./ui/Bar";

export default function SplitPreviewCard({ preview, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-4">
        <Loader2 size={15} className="animate-spin text-blue-500" />
        <span className="text-sm text-gray-500">Menghitung distribusi...</span>
      </div>
    );
  }

  if (!preview) return null;

  const hasErrors = !preview.is_valid && preview.validation_errors?.length > 0;

  return (
    <div
      className={`overflow-hidden rounded-xl border ${hasErrors ? "border-red-200" : "border-green-200"}`}
    >
      {/* Header */}
      <div
        className={`flex items-center gap-2 px-4 py-2.5 ${hasErrors ? "bg-red-50" : "bg-green-50"}`}
      >
        {hasErrors ? (
          <AlertCircle size={15} className="shrink-0 text-red-500" />
        ) : (
          <CheckCircle size={15} className="shrink-0 text-green-600" />
        )}
        <span
          className={`text-sm font-medium ${hasErrors ? "text-red-700" : "text-green-700"}`}
        >
          {hasErrors ? "Data tidak mencukupi" : "Split valid"}
        </span>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-3 divide-x border-t">
        {[
          ["Total", preview.total],
          ["Train", preview.train_total],
          ["Test", preview.test_total],
        ].map(([label, value]) => (
          <div key={label} className="px-4 py-2.5 text-center">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="mt-0.5 text-base font-semibold text-gray-800">
              {(value ?? 0).toLocaleString("id")}
            </p>
          </div>
        ))}
      </div>

      {/* Per kelas */}
      {preview.train_per_class &&
        Object.keys(preview.train_per_class).length > 0 && (
          <div className="grid grid-cols-1 gap-4 border-t p-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Train set
              </p>
              <div className="space-y-2">
                {Object.entries(preview.train_per_class).map(
                  ([label, count]) => (
                    <Bar
                      key={label}
                      label={label}
                      count={count}
                      total={preview.train_total}
                      color="bg-blue-400"
                    />
                  )
                )}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Test set
              </p>
              <div className="space-y-2">
                {Object.entries(preview.test_per_class).map(
                  ([label, count]) => (
                    <Bar
                      key={label}
                      label={label}
                      count={count}
                      total={preview.test_total}
                      color="bg-amber-400"
                    />
                  )
                )}
              </div>
            </div>
          </div>
        )}

      {/* Error list */}
      {hasErrors && (
        <div className="border-t bg-red-50 px-4 py-3">
          <ul className="space-y-1">
            {preview.validation_errors.map((e, i) => (
              <li key={i} className="text-xs text-red-600">
                • {e}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

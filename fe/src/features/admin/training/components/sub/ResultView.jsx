import { Ban, CheckCircle, RotateCcw, XCircle } from "lucide-react";
import useTrainingStore from "../../store";
import EvaluationResults from "../EvaluationResults";

export default function ResultView() {
  const { activeJob, resetToForm } = useTrainingStore();

  if (!activeJob) return null;

  const job = activeJob;
  const isSuccess = job.status === "completed";
  const isFailed = job.status === "failed";
  const isCancelled = job.status === "cancelled";

  const formatDur = (secs) => {
    if (!secs) return null;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0 ? `${h}j ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header result */}
      <div
        className={`rounded-xl border p-5 ${
          isSuccess
            ? "border-green-200 bg-green-50"
            : isFailed
              ? "border-red-200 bg-red-50"
              : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              {isSuccess && (
                <CheckCircle size={18} className="text-green-600" />
              )}
              {isFailed && <XCircle size={18} className="text-red-500" />}
              {isCancelled && <Ban size={18} className="text-gray-500" />}
              <p
                className={`text-base font-semibold ${
                  isSuccess
                    ? "text-green-800"
                    : isFailed
                      ? "text-red-800"
                      : "text-gray-700"
                }`}
              >
                {isSuccess
                  ? "Training Selesai!"
                  : isFailed
                    ? "Training Gagal"
                    : "Training Dibatalkan"}
              </p>
            </div>
            <p
              className={`text-sm ${
                isSuccess
                  ? "text-green-700"
                  : isFailed
                    ? "text-red-600"
                    : "text-gray-500"
              }`}
            >
              {job.display_name}
            </p>
            <div
              className={`mt-1.5 flex flex-wrap gap-3 text-xs ${
                isSuccess
                  ? "text-green-600"
                  : isFailed
                    ? "text-red-500"
                    : "text-gray-400"
              }`}
            >
              {job.dataset_name && <span>Dataset: {job.dataset_name}</span>}
              {job.model_type && (
                <span>Model: {job.model_type.toUpperCase()}</span>
              )}
              {job.duration_seconds && (
                <span>Durasi: {formatDur(job.duration_seconds)}</span>
              )}
            </div>

            {isFailed && job.error_message && (
              <div className="mt-2 rounded-lg bg-red-100 px-3 py-2">
                <p className="font-mono text-xs whitespace-pre-wrap text-red-700">
                  {job.error_message}
                </p>
              </div>
            )}
          </div>

          {/* Tombol train baru */}
          <button
            onClick={resetToForm}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <RotateCcw size={15} />
            Training Baru
          </button>
        </div>
      </div>

      {/* Hasil evaluasi — hanya jika selesai */}
      {isSuccess && <EvaluationResults job={job} />}

      {/* Log epoch yang sempat masuk (untuk cancelled/failed) */}
      {!isSuccess && job.epoch_logs?.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Log Epoch (Parsial)
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-gray-50">
                  {[
                    "Epoch",
                    "Train Loss",
                    "Val Loss",
                    "Val Accuracy",
                    "Val F1",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-semibold text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {job.epoch_logs.map((log, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-700">
                      {log.epoch}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {log.train_loss?.toFixed(4) ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {log.val_loss?.toFixed(4) ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {log.val_accuracy !== null
                        ? `${(log.val_accuracy * 100).toFixed(2)}%`
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {log.val_f1 !== null
                        ? `${(log.val_f1 * 100).toFixed(2)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

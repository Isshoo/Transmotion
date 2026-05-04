import { Ban, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useTrainingStore from "../../store";

export default function ProgressView() {
  const { activeJob, isSubmitting, cancelJob } = useTrainingStore();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!activeJob) return null;

  const job = activeJob;
  const pct = job.progress || 0;

  const handleCancel = async () => {
    const result = await cancelJob();
    if (result.success) {
      toast.success(result.message);
      setShowCancelConfirm(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Status utama */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Loader2 size={18} className="animate-spin text-blue-600" />
              <p className="text-base font-semibold text-blue-800">
                Training Berjalan...
              </p>
            </div>
            <p className="text-sm text-blue-600">{job.display_name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-700">{pct}%</p>
            <p className="text-xs text-blue-500">
              Epoch {job.current_epoch} / {job.total_epochs}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-blue-200">
          <div
            className="h-3 rounded-full bg-blue-600 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Info dataset & model */}
        <div className="flex flex-wrap gap-3 text-xs text-blue-600">
          <span>
            Dataset: <strong>{job.dataset_name}</strong>
          </span>
          <span>
            Model: <strong>{job.model_type?.toUpperCase()}</strong>
          </span>
          {job.split_info && (
            <span>
              Train:{" "}
              <strong>
                {job.split_info.train_total?.toLocaleString("id")}
              </strong>{" "}
              / Test:{" "}
              <strong>{job.split_info.test_total?.toLocaleString("id")}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Live metrics dari epoch terbaru */}
      {job.epoch_logs?.length > 0 &&
        (() => {
          const last = job.epoch_logs[job.epoch_logs.length - 1];
          return (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Train Loss", last.train_loss?.toFixed(4)],
                ["Val Loss", last.val_loss?.toFixed(4)],
                [
                  "Val Accuracy",
                  last.val_accuracy !== null
                    ? `${(last.val_accuracy * 100).toFixed(2)}%`
                    : null,
                ],
                [
                  "Val F1",
                  last.val_f1 !== null
                    ? `${(last.val_f1 * 100).toFixed(2)}%`
                    : null,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center"
                >
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="mt-0.5 text-lg font-bold text-gray-800">
                    {value ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          );
        })()}

      {/* Log per epoch */}
      {job.epoch_logs?.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b bg-gray-50 px-5 py-3">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Log Per Epoch
            </p>
          </div>
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
                      className="px-4 py-2.5 text-left font-semibold text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {job.epoch_logs.map((log, i) => (
                  <tr
                    key={i}
                    className={
                      i === job.epoch_logs.length - 1
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-4 py-2.5 font-semibold text-gray-700">
                      {log.epoch}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">
                      {log.train_loss?.toFixed(4) ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">
                      {log.val_loss?.toFixed(4) ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">
                      {log.val_accuracy !== null
                        ? `${(log.val_accuracy * 100).toFixed(2)}%`
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">
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

      {/* Hyperparameter */}
      {job.hyperparams && (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Konfigurasi Training
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              ["LR", job.hyperparams.learning_rate],
              ["Epochs", job.hyperparams.epochs],
              ["Batch", job.hyperparams.batch_size],
              ["MaxLen", job.hyperparams.max_length],
              ["Warmup", job.hyperparams.warmup_steps],
              ["Decay", job.hyperparams.weight_decay],
            ].map(([l, v]) => (
              <span
                key={l}
                className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
              >
                {l}: <span className="font-semibold text-gray-800">{v}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tombol batal */}
      {!showCancelConfirm ? (
        <div className="flex justify-end">
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <Ban size={15} /> Batalkan Training
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="mb-3 text-sm font-medium text-red-800">
            Yakin ingin membatalkan training?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? "Membatalkan..." : "Ya, Batalkan"}
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Tidak
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

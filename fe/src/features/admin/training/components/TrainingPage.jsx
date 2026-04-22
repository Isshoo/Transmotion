"use client";

import { useEffect } from "react";
import { BrainCircuit } from "lucide-react";
import { toast } from "sonner";
import { useSSE } from "@/hooks/useSSE";
import useTrainingStore from "../store";
import FormView from "./sub/FormView";
import ProgressView from "./sub/ProgressView";
import ResultView from "./sub/ResultView";

export default function TrainingPage() {
  const { view, activeJob, init, setActiveJob } = useTrainingStore();

  // Reset dan cek job aktif setiap kali halaman dibuka
  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SSE — follow job aktif
  const activeJobId = activeJob?.id;
  const isJobActive =
    activeJob && ["queued", "running"].includes(activeJob.status);

  useSSE(
    activeJobId && isJobActive ? `/api/sse/training-jobs/${activeJobId}` : null,
    {
      enabled: !!activeJobId && isJobActive,
      onMessage: (data, eventType) => {
        if (!data?.id) return;
        if (eventType === "update" || eventType === "init") {
          setActiveJob(data);
        }
        if (eventType === "complete") {
          setActiveJob(data);
          toast.success("Training selesai!");
        }
        if (eventType === "error_event") {
          setActiveJob(data);
          toast.error("Training gagal: " + (data?.error_message ?? ""));
        }
      },
    }
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <BrainCircuit size={20} className="text-blue-600" />
          Training Model
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {view === "form" &&
            "Konfigurasi dan mulai pelatihan model mBERT / XLM-R"}
          {view === "progress" &&
            "Training sedang berjalan — progress diperbarui otomatis"}
          {view === "result" &&
            "Training selesai — lihat hasil evaluasi atau mulai training baru"}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[
          { key: "form", label: "Konfigurasi" },
          { key: "progress", label: "Training" },
          { key: "result", label: "Hasil" },
        ].map(({ key, label }, i) => (
          <div key={key} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`h-px w-8 ${
                  view === "result" || (view === "progress" && i === 1)
                    ? "bg-blue-400"
                    : "bg-gray-200"
                }`}
              />
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                view === key
                  ? "bg-blue-600 text-white"
                  : (key === "progress" && view === "result") ||
                      (key === "form" && view !== "form")
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Content */}
      {view === "form" && <FormView />}
      {view === "progress" && <ProgressView />}
      {view === "result" && <ResultView />}
    </div>
  );
}

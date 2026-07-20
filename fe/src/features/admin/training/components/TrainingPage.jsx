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
  const { view, activeJob, init, setActiveJob, isCheckingActive } =
    useTrainingStore();

  useEffect(() => {
    init();
    return () => {
      useTrainingStore.setState({ isCheckingActive: true });
    };
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
          toast.success("Training complete!");
        }
        if (eventType === "error_event") {
          setActiveJob(data);
          toast.error("Training failed: " + (data?.error_message ?? ""));
        }
      },
    }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-(--text-primary)">
          <BrainCircuit size={20} className="text-(--accent)" />
          Training Model
        </h1>
        <p className="mt-1 text-sm text-(--text-secondary)">
          {view === "form" &&
            "Configure and start training an mBERT / XLM-R model"}
          {view === "progress" &&
            "Training is running — progress updates automatically"}
          {view === "result" &&
            "Training complete — view evaluation results or start a new training"}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[
          { key: "form", label: "Configuration" },
          { key: "progress", label: "Training" },
          { key: "result", label: "Result" },
        ].map(({ key, label }, i) => (
          <div key={key} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`h-px w-8 ${
                  view === "result" || (view === "progress" && i === 1)
                    ? "bg-(--accent)"
                    : "bg-(--border-default)"
                }`}
              />
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide transition-colors duration-200 ${
                view === key
                  ? "bg-(--accent) text-(--bg-base) shadow-(--shadow-accent)"
                  : (key === "progress" && view === "result") ||
                      (key === "form" && view !== "form")
                    ? "bg-(--accent-muted) text-(--accent)"
                    : "bg-(--bg-elevated) text-(--text-tertiary)"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {isCheckingActive ? (
          <div className="animate-pulse space-y-6">
            <div className="h-36 w-full rounded-xl bg-(--bg-elevated)" />
            <div className="h-64 w-full rounded-xl bg-(--bg-elevated)" />
            <div className="h-40 w-full rounded-xl bg-(--bg-elevated)" />
            <div className="h-72 w-full rounded-xl bg-(--bg-elevated)" />
            <div className="h-14 w-full rounded-xl bg-(--bg-elevated)" />
          </div>
        ) : (
          <>
            {view === "form" && <FormView />}
            {view === "progress" && <ProgressView />}
            {view === "result" && <ResultView />}
          </>
        )}
      </div>
    </div>
  );
}

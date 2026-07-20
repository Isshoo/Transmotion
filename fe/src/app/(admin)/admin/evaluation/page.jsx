import EvaluationPageComponent from "@/features/admin/evaluation/components/EvaluationPage";

export const metadata = { title: "Performance Evaluation" };

export default function EvaluationPage() {
  return (
    <div className="space-y-6">
      <EvaluationPageComponent />
    </div>
  );
}

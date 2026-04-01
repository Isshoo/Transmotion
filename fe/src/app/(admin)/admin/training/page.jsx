import TrainingJobTable from "@/features/admin/training/components/TrainingJobTable";

export const metadata = { title: "Training Job" };

export default function TrainingPage() {
  return (
    <div className="space-y-6">
      <TrainingJobTable />
    </div>
  );
}

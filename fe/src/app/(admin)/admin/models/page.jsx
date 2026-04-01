import ModelTable from "@/features/admin/models/components/ModelTable";

export const metadata = { title: "Model Terlatih" };

export default function ModelsPage() {
  return (
    <div className="space-y-6">
      <ModelTable />
    </div>
  );
}

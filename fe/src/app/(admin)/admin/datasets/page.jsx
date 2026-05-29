import DatasetTable from "@/features/admin/datasets/components/DatasetTable";

export const metadata = { title: "Manajemen Dataset" };

export default function DatasetsPage() {
  return (
    <div className="space-y-6">
      <DatasetTable />
    </div>
  );
}

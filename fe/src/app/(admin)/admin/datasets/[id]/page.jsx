import DatasetDetail from "@/features/admin/datasets/components/DatasetDetail";

export const metadata = { title: "Detail Dataset" };

export default async function DatasetDetailPage({ params }) {
  const { id } = await params;
  return <DatasetDetail datasetId={id} />;
}

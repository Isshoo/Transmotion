import ModelDetail from "@/features/admin/models/components/ModelDetail";

export const metadata = { title: "Detail Model" };

export default async function ModelDetailPage({ params }) {
  const { id } = await params;
  return <ModelDetail modelId={id} />;
}

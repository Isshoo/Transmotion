import ClassifyForm from "@/features/user/classify/components/ClassifyForm";

export const metadata = { title: "Klasifikasi Teks" };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <ClassifyForm />
    </div>
  );
}

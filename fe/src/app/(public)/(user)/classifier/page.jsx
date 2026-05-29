import ClassifyForm from "@/features/user/classify/components/ClassifyForm";

export const metadata = { title: "Klasifikasi" };

export default function ClassifierPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-5 pb-8">
      <ClassifyForm />
    </div>
  );
}

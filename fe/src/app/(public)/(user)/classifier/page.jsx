import ClassifyForm from "@/features/user/classify/components/ClassifyForm";

export const metadata = { title: "Klasifikasi" };

export default function ClassifierPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-20 lg:py-25">
      <ClassifyForm />
    </div>
  );
}

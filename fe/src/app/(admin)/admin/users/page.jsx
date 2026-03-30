import UserTable from "@/features/admin/users/components/UserTable";

export const metadata = {
  title: "Manajemen User",
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <UserTable />
    </div>
  );
}

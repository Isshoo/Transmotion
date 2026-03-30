import AdminSidebar from "@/components/layouts/AdminSidebar";
import ProtectedRoute from "@/components/routes/ProtectedRoute";

export default async function AdminLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}

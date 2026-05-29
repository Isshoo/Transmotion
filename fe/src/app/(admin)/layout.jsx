import AdminLayoutWrapper from "@/components/layouts/AdminLayoutWrapper";
import ProtectedRoute from "@/components/routes/ProtectedRoute";

export default async function AdminLayout({ children }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </ProtectedRoute>
  );
}

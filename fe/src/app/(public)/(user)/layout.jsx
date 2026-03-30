import ProtectedRoute from "@/components/routes/ProtectedRoute";

export default async function UserLayout({ children }) {
  return <ProtectedRoute requiredRole="user">{children}</ProtectedRoute>;
}

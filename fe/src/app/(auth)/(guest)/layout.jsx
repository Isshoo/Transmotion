import GuestRoute from "@/components/routes/GuestRoute";

export default function AuthProtectedLayout({ children }) {
  return <GuestRoute>{children}</GuestRoute>;
}

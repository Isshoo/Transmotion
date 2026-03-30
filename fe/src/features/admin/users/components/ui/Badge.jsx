import { ShieldCheck } from "lucide-react";

export function RoleBadge({ role }) {
  return role === "admin" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
      <ShieldCheck size={11} />
      Admin
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
      User
    </span>
  );
}

export function StatusBadge({ isActive }) {
  return isActive ? (
    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      Aktif
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
      Nonaktif
    </span>
  );
}

export function VerifiedBadge({ isVerified }) {
  return isVerified ? (
    <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
      Terverifikasi
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
      Belum
    </span>
  );
}

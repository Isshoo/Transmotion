import { ShieldCheck } from "lucide-react";

export function RoleBadge({ role }) {
  return role === "admin" ? (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-(--accent-muted)/50 bg-(--accent-muted)/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-(--accent) uppercase shadow-(--shadow-sm)">
      <ShieldCheck size={10} />
      Admin
    </span>
  ) : (
    <span className="inline-flex rounded-md border border-(--border-strong) bg-(--bg-elevated) px-2 py-0.5 text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
      User
    </span>
  );
}

export function StatusBadge({ isActive }) {
  return isActive ? (
    <span className="inline-flex rounded-md border border-(--success-muted)/50 bg-(--success-muted)/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-(--success) uppercase shadow-(--shadow-sm)">
      Active
    </span>
  ) : (
    <span className="inline-flex rounded-md border border-(--error-muted)/50 bg-(--error-muted)/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-(--error) uppercase">
      Inactive
    </span>
  );
}

export function VerifiedBadge({ isVerified }) {
  return isVerified ? (
    <span className="inline-flex rounded-md border border-(--info-muted)/50 bg-(--info-muted)/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-(--info) uppercase shadow-(--shadow-sm)">
      Verified
    </span>
  ) : (
    <span className="inline-flex rounded-md border border-(--warning-muted)/50 bg-(--warning-muted)/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-(--warning) uppercase">
      Unverified
    </span>
  );
}

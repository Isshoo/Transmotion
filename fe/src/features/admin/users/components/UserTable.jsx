"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  RotateCcw,
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import useUsersStore from "../store";
import useAuthStore from "@/features/auth/store";
import { formatDate } from "@/helpers/formatter";
import UserFormModal from "./modal/UserFormModal";
import DeleteUserModal from "./modal/DeleteUserModal";
import Avatar from "./ui/Avatar";
import { RoleBadge, StatusBadge, VerifiedBadge } from "./ui/Badge";
import { ActionButton, PaginationButton } from "./ui/Button";
import UserTableSkeleton from "./UserTableSkeleton";
import { buildPageRange } from "../helpers";

export default function UserTable() {
  const {
    users,
    total,
    totalPages,
    page,
    perPage,
    search,
    role,
    isActive,
    isLoading,
    isSubmitting,
    fetchUsers,
    setPage,
    setSearch,
    setRole,
    setIsActive,
    resetFilters,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    toggleUserActive,
  } = useUsersStore();

  const { user: currentUser } = useAuthStore();

  // Debounce search
  const searchTimeout = useRef(null);
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    fetchUsers();
    return () => {
      useUsersStore.setState({ isLoading: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(value);
    }, 400);
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    setSearch("");
  };

  const handleToggleActive = async (user) => {
    const result = await toggleUserActive(user);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const hasActiveFilters = search || role || isActive !== "";

  // ── Range info pagination
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="animate-fade-in space-y-4">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-(--text-primary)">
            <Users size={20} className="text-(--accent)" />
            User Management
          </h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Manage all user accounts here
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--bg-base) transition-all duration-150 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            size={14}
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-(--text-tertiary)"
          />
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Search name or email..."
            className="w-full rounded-lg border border-(--border-default) bg-(--bg-elevated) py-2 pr-9 pl-9 text-sm font-medium text-(--text-primary) transition-all duration-150 outline-none placeholder:text-(--text-disabled) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
          />
          {localSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-(--text-tertiary) transition-colors hover:text-(--text-primary)"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Role filter */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm font-medium text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        {/* Status filter */}
        <select
          value={isActive}
          onChange={(e) => setIsActive(e.target.value)}
          className="rounded-lg border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm font-medium text-(--text-primary) transition-all duration-150 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setLocalSearch("");
              resetFilters();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--border-default) bg-(--bg-elevated) px-3 py-2 text-sm font-bold text-(--text-secondary) transition-all duration-150 hover:bg-(--bg-overlay) hover:text-(--text-primary)"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        )}
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-surface) shadow-(--shadow-sm)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-default) bg-(--bg-elevated)">
                {["User", "Role", "Status", "Verified", "Joined"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-[10px] font-bold tracking-wider whitespace-nowrap text-(--text-secondary) uppercase"
                  >
                    {h}
                  </th>
                ))}
                <th className="px-5 py-3.5 text-right text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-subtle)">
              {isLoading ? (
                <UserTableSkeleton />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-(--bg-elevated)">
                      <Search size={24} className="text-(--text-tertiary)" />
                    </div>
                    <p className="text-sm font-bold text-(--text-primary)">
                      No users found
                    </p>
                    {hasActiveFilters && (
                      <p className="mt-1 text-xs font-medium text-(--text-tertiary)">
                        Try changing the filter or search keyword
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <tr
                      key={user.id}
                      className="group transition-colors duration-150 hover:bg-(--bg-overlay)"
                    >
                      {/* Pengguna */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar user={user} />
                          <div>
                            <p className="leading-tight font-semibold text-(--text-primary) transition-colors group-hover:text-(--accent)">
                              {user.name ?? "—"}
                              {isSelf && (
                                <span className="ml-1.5 rounded-md border border-(--accent-muted)/50 bg-(--accent-muted)/20 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-(--accent) uppercase">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 text-[11px] font-medium text-(--text-tertiary)">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge isActive={user.is_active} />
                      </td>

                      {/* Verifikasi */}
                      <td className="px-5 py-3.5">
                        <VerifiedBadge isVerified={user.is_verified} />
                      </td>

                      {/* Bergabung */}
                      <td className="px-5 py-3.5 text-[11px] font-medium text-(--text-tertiary)">
                        {user.created_at
                          ? formatDate(user.created_at, "dd MMM yyyy")
                          : "—"}
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit */}
                          <ActionButton
                            onClick={() => openEditModal(user)}
                            title="Edit user"
                            className="text-(--text-tertiary) hover:bg-(--accent-muted)/30 hover:text-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
                          >
                            <Pencil size={14} />
                          </ActionButton>

                          {/* Aktifkan / Nonaktifkan */}
                          {!isSelf && (
                            <ActionButton
                              onClick={() => handleToggleActive(user)}
                              disabled={isSubmitting}
                              title={
                                user.is_active
                                  ? "Deactivate account"
                                  : "Activate account"
                              }
                              className={
                                user.is_active
                                  ? "text-(--text-tertiary) hover:bg-(--warning-muted)/30 hover:text-(--warning) focus:ring-2 focus:ring-(--warning-muted)"
                                  : "text-(--text-tertiary) hover:bg-(--success-muted)/30 hover:text-(--success) focus:ring-2 focus:ring-(--success-muted)"
                              }
                            >
                              {user.is_active ? (
                                <ShieldOff size={14} />
                              ) : (
                                <ShieldCheck size={14} />
                              )}
                            </ActionButton>
                          )}

                          {/* Delete */}
                          {!isSelf && (
                            <ActionButton
                              onClick={() => openDeleteModal(user)}
                              title="Delete user"
                              className="text-(--text-tertiary) hover:bg-(--error-muted)/30 hover:text-(--error) focus:ring-2 focus:ring-(--error-muted)"
                            >
                              <Trash2 size={14} />
                            </ActionButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ─────────────────────────────────── */}
        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between border-t border-(--border-default) bg-(--bg-elevated) px-5 py-3">
            <p className="text-[11px] font-medium tracking-wide text-(--text-tertiary)">
              Showing{" "}
              <span className="font-bold text-(--text-primary)">
                {from}–{to}
              </span>{" "}
              of{" "}
              <span className="font-bold text-(--text-primary)">{total}</span>{" "}
              users
            </p>

            <div className="flex items-center gap-1">
              <PaginationButton
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                title="Previous page"
              >
                <ChevronLeft size={14} />
              </PaginationButton>

              {buildPageRange(page, totalPages).map((p, i) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-1 text-xs text-(--text-disabled)"
                  >
                    …
                  </span>
                ) : (
                  <PaginationButton
                    key={p}
                    onClick={() => setPage(p)}
                    active={p === page}
                  >
                    {p}
                  </PaginationButton>
                )
              )}

              <PaginationButton
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                title="Next page"
              >
                <ChevronRight size={14} />
              </PaginationButton>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────── */}
      <UserFormModal />
      <DeleteUserModal />
    </div>
  );
}

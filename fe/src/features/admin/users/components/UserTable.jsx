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
  X,
} from "lucide-react";
import { toast } from "sonner";
import useUsersStore from "../store";
import useAuthStore from "@/features/auth/store";
import UserFormModal from "./UserFormModal";
import { formatDate } from "@/helpers/formatter";
import DeleteUserModal from "./DeleteUserModal";
import Avatar from "./ui/Avatar";
import { RoleBadge, StatusBadge, VerifiedBadge } from "./ui/Badge";
import { ActionButton, PaginationButton } from "./ui/Button";
import buildPageRange from "../helpers/buildPageRange";
import UserTableSkeleton from "./UserTableSkeleton";

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
    <div className="space-y-4">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-gray-500">
            Kelola semua akun pengguna di sini
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={16} />
          Tambah Pengguna
        </button>
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            size={15}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Cari nama atau email..."
            className="w-full rounded-lg border border-gray-300 py-2 pr-9 pl-9 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {localSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Role filter */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Semua Role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        {/* Status filter */}
        <select
          value={isActive}
          onChange={(e) => setIsActive(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Semua Status</option>
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
        </select>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setLocalSearch("");
              resetFilters();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Pengguna
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Verifikasi
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Bergabung
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                // Skeleton rows
                <UserTableSkeleton />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Search size={22} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      Tidak ada pengguna ditemukan
                    </p>
                    {hasActiveFilters && (
                      <p className="mt-1 text-xs text-gray-400">
                        Coba ubah filter atau kata kunci pencarian
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
                      className="transition-colors hover:bg-gray-50"
                    >
                      {/* Pengguna */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar user={user} />
                          <div>
                            <p className="leading-tight font-medium text-gray-800">
                              {user.name ?? "—"}
                              {isSelf && (
                                <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                                  Kamu
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge isActive={user.is_active} />
                      </td>

                      {/* Verifikasi */}
                      <td className="px-4 py-3">
                        <VerifiedBadge isVerified={user.is_verified} />
                      </td>

                      {/* Bergabung */}
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {user.created_at
                          ? formatDate(user.created_at, "dd MMM yyyy")
                          : "—"}
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit */}
                          <ActionButton
                            onClick={() => openEditModal(user)}
                            title="Edit pengguna"
                            className="text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil size={14} />
                          </ActionButton>

                          {/* Aktifkan / Nonaktifkan — tidak bisa ke diri sendiri */}
                          {!isSelf && (
                            <ActionButton
                              onClick={() => handleToggleActive(user)}
                              disabled={isSubmitting}
                              title={
                                user.is_active
                                  ? "Nonaktifkan akun"
                                  : "Aktifkan akun"
                              }
                              className={
                                user.is_active
                                  ? "text-amber-500 hover:bg-amber-50 hover:text-amber-600"
                                  : "text-green-600 hover:bg-green-50 hover:text-green-700"
                              }
                            >
                              {user.is_active ? (
                                <ShieldOff size={14} />
                              ) : (
                                <ShieldCheck size={14} />
                              )}
                            </ActionButton>
                          )}

                          {/* Hapus — tidak bisa ke diri sendiri */}
                          {!isSelf && (
                            <ActionButton
                              onClick={() => openDeleteModal(user)}
                              title="Hapus pengguna"
                              className="text-gray-500 hover:bg-red-50 hover:text-red-600"
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
          <div className="flex items-center justify-between border-t bg-white px-4 py-3">
            <p className="text-xs text-gray-500">
              Menampilkan{" "}
              <span className="font-medium text-gray-700">
                {from}–{to}
              </span>{" "}
              dari <span className="font-medium text-gray-700">{total}</span>{" "}
              pengguna
            </p>

            <div className="flex items-center gap-1">
              <PaginationButton
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                title="Halaman sebelumnya"
              >
                <ChevronLeft size={15} />
              </PaginationButton>

              {/* Page numbers */}
              {buildPageRange(page, totalPages).map((p, i) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-1 text-xs text-gray-400"
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
                title="Halaman berikutnya"
              >
                <ChevronRight size={15} />
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

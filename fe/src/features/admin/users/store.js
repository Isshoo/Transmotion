import { create } from "zustand";
import usersApi from "./api";
import { getErrorMessage } from "@/helpers/error";

const useUsersStore = create((set, get) => ({
  // ── Data ──────────────────────────────────────────────────────
  users: [],
  total: 0,
  totalPages: 0,

  // ── Pagination ────────────────────────────────────────────────
  page: 1,
  perPage: 10,

  // ── Filters ───────────────────────────────────────────────────
  search: "",
  role: "",
  isVerified: "",
  isActive: "",
  sortBy: "created_at",
  sortOrder: "desc",

  // ── UI State ──────────────────────────────────────────────────
  isLoading: false,
  isSubmitting: false,
  error: null,

  // ── Modal State ───────────────────────────────────────────────
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isDeleteModalOpen: false,
  selectedUser: null,

  // ── Actions: Fetch ────────────────────────────────────────────
  fetchUsers: async () => {
    const {
      users,
      page,
      perPage,
      search,
      role,
      isVerified,
      isActive,
      sortBy,
      sortOrder,
    } = get();

    if (users.length === 0) {
      set({ isLoading: true, error: null });
    }

    try {
      const params = {
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      if (search) params.search = search;
      if (role) params.role = role;
      if (isVerified !== "") params.is_verified = isVerified;
      if (isActive !== "") params.is_active = isActive;

      const { data: res } = await usersApi.getAll(params);

      set({
        users: res.data,
        total: res.meta?.pagination?.total ?? 0,
        totalPages: res.meta?.pagination?.total_pages ?? 1,
        isLoading: false,
      });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  // ── Actions: CRUD ─────────────────────────────────────────────
  createUser: async (data) => {
    set({ isSubmitting: true });
    try {
      const { data: res } = await usersApi.create(data);
      await get().fetchUsers();
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateUser: async (id, data) => {
    set({ isSubmitting: true });
    try {
      const { data: res } = await usersApi.update(id, data);
      await get().fetchUsers();
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteUser: async (id) => {
    set({ isSubmitting: true });
    try {
      const { data: res } = await usersApi.delete(id);
      // Kalau hapus user terakhir di halaman ini, mundur satu halaman
      const { page, users } = get();
      const nextPage = users.length === 1 && page > 1 ? page - 1 : page;
      set({ page: nextPage });
      await get().fetchUsers();
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  toggleUserActive: async (user) => {
    set({ isSubmitting: true });
    try {
      const action = user.is_active ? usersApi.deactivate : usersApi.activate;
      const { data: res } = await action(user.id);
      await get().fetchUsers();
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      set({ isSubmitting: false });
    }
  },

  // ── Actions: Filters & Pagination ─────────────────────────────
  setPage: (page) => {
    set({ page });
    get().fetchUsers();
  },

  setSearch: (search) => {
    set({ search, page: 1 });
    get().fetchUsers();
  },

  setRole: (role) => {
    set({ role, page: 1 });
    get().fetchUsers();
  },

  setIsVerified: (isVerified) => {
    set({ isVerified, page: 1 });
    get().fetchUsers();
  },

  setIsActive: (isActive) => {
    set({ isActive, page: 1 });
    get().fetchUsers();
  },

  resetFilters: () => {
    set({ search: "", role: "", isVerified: "", isActive: "", page: 1 });
    get().fetchUsers();
  },

  // ── Actions: Modal ────────────────────────────────────────────
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  openEditModal: (user) => set({ selectedUser: user, isEditModalOpen: true }),
  closeEditModal: () => set({ selectedUser: null, isEditModalOpen: false }),

  openDeleteModal: (user) =>
    set({ selectedUser: user, isDeleteModalOpen: true }),
  closeDeleteModal: () => set({ selectedUser: null, isDeleteModalOpen: false }),
}));

export default useUsersStore;

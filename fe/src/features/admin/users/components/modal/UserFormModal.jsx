"use client";

import { useEffect, useState } from "react";
import useUsersStore from "../../store";

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  role: "user",
  is_verified: true,
  is_active: true,
};

export default function UserFormModal() {
  const {
    isCreateModalOpen,
    isEditModalOpen,
    selectedUser,
    isSubmitting,
    closeCreateModal,
    closeEditModal,
    createUser,
    updateUser,
  } = useUsersStore();

  const isOpen = isCreateModalOpen || isEditModalOpen;
  const isEdit = isEditModalOpen && !!selectedUser;

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  // Isi form saat edit
  useEffect(() => {
    if (isEdit && selectedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: selectedUser.name ?? "",
        email: selectedUser.email ?? "",
        password: "",
        role: selectedUser.role ?? "user",
        is_verified: selectedUser.is_verified ?? true,
        is_active: selectedUser.is_active ?? true,
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setErrors({});
    setServerError(null);
  }, [isEdit, selectedUser, isOpen]);

  const handleClose = () => {
    if (isCreateModalOpen) closeCreateModal();
    if (isEditModalOpen) closeEditModal();
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Nama harus diisi";
    if (!form.email.trim()) newErrors.email = "Email harus diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Format email tidak valid";
    if (!isEdit && !form.password) newErrors.password = "Password harus diisi";
    if (!isEdit && form.password && form.password.length < 8)
      newErrors.password = "Password minimal 8 karakter";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Buat payload — kalau edit dan password kosong, jangan kirim
    const payload = { ...form };
    if (isEdit && !payload.password) delete payload.password;

    const result = isEdit
      ? await updateUser(selectedUser.id, payload)
      : await createUser(payload);

    if (result.success) {
      handleClose();
    } else {
      setServerError(result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? "Edit Pengguna" : "Tambah Pengguna Baru"}
          </h2>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {serverError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          {/* Nama */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama pengguna"
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${
                errors.name
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="pengguna@email.com"
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${
                errors.email
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password{" "}
              {isEdit && (
                <span className="font-normal text-gray-400">
                  (kosongkan jika tidak ingin mengubah)
                </span>
              )}
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${
                errors.password
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Checkboxes */}
          {isEdit && (
            <div className="flex gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="is_verified"
                  checked={form.is_verified}
                  onChange={handleChange}
                  className="h-4 w-4 rounded accent-blue-600"
                />
                Email Terverifikasi
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded accent-blue-600"
                />
                Akun Aktif
              </label>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Tambah Pengguna"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

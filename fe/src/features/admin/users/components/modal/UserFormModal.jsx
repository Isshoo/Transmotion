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
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email format";
    if (!isEdit && !form.password) newErrors.password = "Password is required";
    if (!isEdit && form.password && form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="animate-scale-in w-full max-w-md rounded-2xl border border-(--border-default) bg-(--bg-elevated) shadow-(--shadow-lg)">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--border-subtle) px-6 py-4">
          <h2 className="text-base font-bold tracking-tight text-(--text-primary)">
            {isEdit ? "Edit User" : "Add New User"}
          </h2>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {serverError && (
            <div className="rounded-xl border border-(--error-muted)/50 bg-(--error-muted)/10 p-3.5 text-xs font-bold text-(--error)">
              {serverError}
            </div>
          )}

          {/* Nama */}
          <div>
            <label className="mb-2 block text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="User name"
              className={`w-full rounded-xl border bg-(--bg-surface) px-4 py-2.5 text-sm font-medium text-(--text-primary) transition-all duration-200 outline-none placeholder:text-(--text-disabled) ${
                errors.name
                  ? "border-(--error) focus:ring-2 focus:ring-(--error-muted)"
                  : "border-(--border-strong) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 text-[11px] font-bold text-(--error)">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="user@email.com"
              className={`w-full rounded-xl border bg-(--bg-surface) px-4 py-2.5 text-sm font-medium text-(--text-primary) transition-all duration-200 outline-none placeholder:text-(--text-disabled) ${
                errors.email
                  ? "border-(--error) focus:ring-2 focus:ring-(--error-muted)"
                  : "border-(--border-strong) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-[11px] font-bold text-(--error)">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
              Password{" "}
              {isEdit && (
                <span className="font-normal text-(--text-tertiary) normal-case">
                  (leave blank to keep unchanged)
                </span>
              )}
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full rounded-xl border bg-(--bg-surface) px-4 py-2.5 text-sm font-medium text-(--text-primary) transition-all duration-200 outline-none placeholder:text-(--text-disabled) ${
                errors.password
                  ? "border-(--error) focus:ring-2 focus:ring-(--error-muted)"
                  : "border-(--border-strong) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
              }`}
            />
            {errors.password && (
              <p className="mt-1.5 text-[11px] font-bold text-(--error)">
                {errors.password}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-[10px] font-bold tracking-wider text-(--text-secondary) uppercase">
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-(--border-strong) bg-(--bg-surface) px-4 py-2.5 text-sm font-medium text-(--text-primary) transition-all duration-200 outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-muted)"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Checkboxes */}
          {isEdit && (
            <div className="flex gap-6 rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-4">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-(--text-secondary)">
                <input
                  type="checkbox"
                  name="is_verified"
                  checked={form.is_verified}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-(--border-strong) accent-(--accent)"
                />
                Email Verified
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-(--text-secondary)">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-(--border-strong) accent-(--accent)"
                />
                Account Active
              </label>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-(--border-subtle) pt-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl border border-(--border-default) bg-(--bg-surface) px-5 py-2.5 text-sm font-bold text-(--text-secondary) transition-all duration-150 hover:bg-(--bg-overlay) hover:text-(--text-primary) disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-(--accent) px-5 py-2.5 text-sm font-bold text-(--bg-base) shadow-(--shadow-md) transition-all hover:bg-(--accent-hover) hover:shadow-(--shadow-accent) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

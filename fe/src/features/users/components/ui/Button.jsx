// ── Helper: tombol aksi ────────────────────────────────────────

export function ActionButton({
  onClick,
  disabled,
  title,
  className,
  children,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

// ── Helper: tombol paginasi ────────────────────────────────────

export function PaginationButton({
  onClick,
  disabled,
  active,
  title,
  children,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-blue-600 text-white"
          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

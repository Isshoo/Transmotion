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
      className={`rounded-md p-1.5 transition-colors duration-150 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

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
      className={`flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-[11px] font-bold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-(--accent) text-(--bg-base) shadow-(--shadow-sm)"
          : "border border-(--border-default) bg-(--bg-surface) text-(--text-secondary) hover:bg-(--bg-overlay) hover:text-(--text-primary)"
      }`}
    >
      {children}
    </button>
  );
}

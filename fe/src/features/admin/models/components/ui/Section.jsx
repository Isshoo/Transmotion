export function Section({ title, children }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold tracking-wide text-(--text-tertiary) uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}

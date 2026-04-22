export function Section({ title, children }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}

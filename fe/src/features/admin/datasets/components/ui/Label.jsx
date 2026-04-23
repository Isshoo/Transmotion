export function SizeLabel({ bytes }) {
  if (!bytes) return <span className="text-gray-400">—</span>;
  if (bytes < 1024 * 1024) return <>{(bytes / 1024).toFixed(1)} KB</>;
  return <>{(bytes / 1024 / 1024).toFixed(1)} MB</>;
}

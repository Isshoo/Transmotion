export default function UserTableSkeleton() {
  return Array.from({ length: 8 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-(--bg-elevated)" />
          <div className="space-y-2">
            <div className="h-3 w-28 rounded-md bg-(--bg-elevated)" />
            <div className="h-2 w-36 rounded-md bg-(--bg-overlay)" />
          </div>
        </div>
      </td>
      {[...Array(4)].map((_, j) => (
        <td key={j} className="px-5 py-4">
          <div className="h-5 w-16 rounded-md bg-(--bg-elevated)" />
        </td>
      ))}
      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <div className="h-7 w-7 rounded-md bg-(--bg-elevated)" />
          <div className="h-7 w-7 rounded-md bg-(--bg-elevated)" />
          <div className="h-7 w-7 rounded-md bg-(--bg-elevated)" />
        </div>
      </td>
    </tr>
  ));
}

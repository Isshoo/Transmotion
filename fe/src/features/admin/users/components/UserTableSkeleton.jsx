export default function UserTableSkeleton() {
  return Array.from({ length: 8 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-200" />
          <div className="space-y-1.5">
            <div className="h-3 w-28 rounded bg-gray-200" />
            <div className="h-2.5 w-36 rounded bg-gray-100" />
          </div>
        </div>
      </td>
      {[...Array(4)].map((_, j) => (
        <td key={j} className="px-4 py-3">
          <div className="h-5 w-16 rounded-full bg-gray-200" />
        </td>
      ))}
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <div className="h-7 w-7 rounded bg-gray-200" />
          <div className="h-7 w-7 rounded bg-gray-200" />
          <div className="h-7 w-7 rounded bg-gray-200" />
        </div>
      </td>
    </tr>
  ));
}

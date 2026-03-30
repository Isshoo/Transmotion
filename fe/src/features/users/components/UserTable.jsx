"use client";

export default function UserTable() {
  return (
    <div className="space-y-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground border-b text-left">
            <th className="pb-3 font-medium">Nama</th>
            <th className="pb-3 font-medium">Email</th>
            <th className="pb-3 font-medium">Role</th>
            <th className="pb-3 text-right font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          <tr>
            <td>Nama User</td>
            <td>Email User</td>
            <td>Role User</td>
            <td>Aksi</td>
          </tr>
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Total 0 user</p>
        <div className="flex gap-2">
          <button className="hover:bg-muted rounded-md border px-3 py-1 text-sm transition-colors disabled:opacity-50">
            Sebelumnya
          </button>
          <button className="hover:bg-muted rounded-md border px-3 py-1 text-sm transition-colors disabled:opacity-50">
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}

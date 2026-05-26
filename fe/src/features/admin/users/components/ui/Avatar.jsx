import Image from "next/image";

export default function Avatar({ user }) {
  if (user.avatar_url) {
    return (
      <Image
        src={user.avatar_url}
        alt={user.name}
        width={32}
        height={32}
        className="h-8 w-8 rounded-full border border-(--border-subtle) object-cover shadow-(--shadow-sm)"
      />
    );
  }
  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-(--accent-muted) bg-(--accent-muted) text-[11px] font-black text-(--accent) shadow-(--shadow-sm)">
      {initials}
    </div>
  );
}

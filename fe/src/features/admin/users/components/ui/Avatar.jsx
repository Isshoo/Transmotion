import Image from "next/image";

export default function Avatar({ user }) {
  if (user.avatar_url) {
    return (
      <Image
        src={user.avatar_url}
        alt={user.name}
        width={8}
        height={8}
        className="h-8 w-8 rounded-full object-cover"
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
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
      {initials}
    </div>
  );
}

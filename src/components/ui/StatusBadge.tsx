interface StatusBadgeProps {
  status: "ACTIVE" | "INACTIVE";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "ACTIVE") {
    return (
      <span className="inline-flex items-center gap-2 px-2 py-1 bg-green-500/20 text-green-400 border border-green-500 text-xs font-medium">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        ACTIVE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 px-2 py-1 bg-red-500/20 text-red-400 border border-red-500 text-xs font-medium">
      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
      INACTIVE
    </span>
  );
}

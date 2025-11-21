import { IoShieldCheckmark, IoShield, IoStar, IoEye } from "react-icons/io5";

interface Role {
  id: string;
  name: string;
  slug: string;
  permissions?: string[];
  isSystem?: boolean;
}

interface RoleBadgeProps {
  role: Role | "ADMIN" | "SUPER_ADMIN"; // Support both old and new format
  showTooltip?: boolean;
}

export default function RoleBadge({ role, showTooltip = false }: RoleBadgeProps) {
  // Handle legacy string format
  if (typeof role === "string") {
    if (role === "SUPER_ADMIN") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 border border-green-500 text-xs font-medium">
          <IoShieldCheckmark className="text-sm" />
          SUPER ADMIN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500 text-xs font-medium">
        <IoShield className="text-sm" />
        ADMIN
      </span>
    );
  }

  // Handle new object format with dynamic colors based on slug
  const getColorClass = () => {
    switch (role.slug) {
      case "super_admin":
        return {
          bg: "bg-green-500/20",
          text: "text-green-400",
          border: "border-green-500",
          icon: <IoShieldCheckmark className="text-sm" />,
        };
      case "admin":
        return {
          bg: "bg-blue-500/20",
          text: "text-blue-400",
          border: "border-blue-500",
          icon: <IoShield className="text-sm" />,
        };
      case "editor":
        return {
          bg: "bg-purple-500/20",
          text: "text-purple-400",
          border: "border-purple-500",
          icon: <IoStar className="text-sm" />,
        };
      case "viewer":
        return {
          bg: "bg-gray-500/20",
          text: "text-gray-400",
          border: "border-gray-500",
          icon: <IoEye className="text-sm" />,
        };
      default:
        return {
          bg: "bg-cyan-500/20",
          text: "text-cyan-400",
          border: "border-cyan-500",
          icon: <IoShield className="text-sm" />,
        };
    }
  };

  const colorClass = getColorClass();
  const tooltipText = showTooltip && role.permissions
    ? `${role.permissions.length} permissions`
    : undefined;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 ${colorClass.bg} ${colorClass.text} border ${colorClass.border} text-xs font-medium`}
      title={tooltipText}
    >
      {colorClass.icon}
      {role.name.toUpperCase()}
    </span>
  );
}

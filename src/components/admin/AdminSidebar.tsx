"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  IoHome, 
  IoDocument, 
  IoImage, 
  IoSettings,
  IoLogOut,
  IoGameController,
  IoChevronDown,
  IoKey,
  IoStatsChart
} from "react-icons/io5";
import { useState } from "react";

// Helper function to get role badge styles
const getRoleBadgeClass = (role: string) => {
  switch (role.toLowerCase()) {
    case 'super_admin':
      return 'bg-purple-500/20 text-purple-400';
    case 'admin':
      return 'bg-blue-500/20 text-blue-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [openMenus, setOpenMenus] = useState<string[]>(["content"]);

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <IoStatsChart className="text-xl" />,
    },
    {
      id: "content",
      title: "Content",
      icon: <IoDocument className="text-xl" />,
      submenu: [
        { title: "Hero Section", href: "/admin/content/hero" },
        { title: "Features", href: "/admin/content/features" },
        { title: "How It Works", href: "/admin/content/how-it-works" },
        { title: "Roadmap", href: "/admin/content/roadmap" },
        { title: "FAQ", href: "/admin/content/faq" },
      ],
    },
    {
      title: "Media Library",
      href: "/admin/media",
      icon: <IoImage className="text-xl" />,
    },
    {
      id: "settings",
      title: "Settings",
      icon: <IoSettings className="text-xl" />,
      submenu: [
        { title: "API Keys", href: "/admin/settings/api-keys" },
        { title: "General", href: "/admin/settings/general" },
      ],
    },
  ];

  const isActive = (href: string) => pathname === href;
  
  // Check if parent menu should be highlighted
  const isParentActive = (parentPath: string) => {
    return pathname.startsWith(parentPath);
  };
  
  const toggleMenu = (menuId: string) => {
    setOpenMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-3">
          <IoGameController className="text-3xl text-green-400" />
          <div>
            <div className="text-lg font-bold text-white">
              MONQUEST
            </div>
            <div className="text-xs text-gray-400">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ring-green-500/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.name}</div>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${getRoleBadgeClass(user.role)}`}>
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.href ? (
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-none
                  border-l-[6px] transition-all duration-100 text-sm font-medium
                  ${
                    isActive(item.href)
                      ? "border-green-400 bg-green-500/10 text-green-400 shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]"
                      : "border-transparent text-gray-400 hover:bg-gray-800/70 hover:text-white hover:border-gray-700"
                  }
                `}
                style={isActive(item.href) ? {
                  boxShadow: '4px 0 0 0 rgba(34, 197, 94, 0.3), inset 0 0 20px rgba(34, 197, 94, 0.1)'
                } : undefined}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ) : (
              <>
                <button
                  onClick={() => item.id && toggleMenu(item.id)}
                  className={`
                    w-full flex items-center justify-between gap-3 px-4 py-3 rounded-none
                    border-l-4 transition-all duration-100 text-sm font-medium
                    ${
                      item.id && isParentActive(`/admin/${item.id}`)
                        ? "border-green-400 bg-green-500/5 text-white shadow-[inset_0_0_15px_rgba(34,197,94,0.08)]"
                        : "border-transparent text-gray-400 hover:bg-gray-800/70 hover:text-white hover:border-gray-700"
                    }
                  `}
                  style={item.id && isParentActive(`/admin/${item.id}`) ? {
                    boxShadow: '3px 0 0 0 rgba(34, 197, 94, 0.2), inset 0 0 15px rgba(34, 197, 94, 0.08)'
                  } : undefined}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                  {item.id && (
                    <IoChevronDown 
                      className={`text-sm transition-transform ${
                        openMenus.includes(item.id) ? "rotate-180" : ""
                      }`} 
                    />
                  )}
                </button>
                {item.submenu && item.id && openMenus.includes(item.id) && (
                  <div className="mt-1 space-y-0.5">
                    {item.submenu.map((subitem, subindex) => (
                      <Link
                        key={subindex}
                        href={subitem.href}
                        className={`
                          flex items-center pl-12 pr-4 py-2.5 rounded-none text-xs
                          border-l-[6px] transition-all duration-100
                          ${
                            isActive(subitem.href)
                              ? "border-green-400 bg-green-500/15 text-green-400 font-medium"
                              : "border-transparent text-gray-400 hover:bg-gray-800/70 hover:text-white hover:border-gray-700"
                          }
                        `}
                        style={isActive(subitem.href) ? {
                          boxShadow: '4px 0 0 0 rgba(34, 197, 94, 0.4), inset 0 0 25px rgba(34, 197, 94, 0.15), 0 0 10px rgba(34, 197, 94, 0.1)'
                        } : undefined}
                      >
                        <span className={`w-1.5 h-1.5 ${isActive(subitem.href) ? 'rounded-none' : 'rounded-full'} bg-current mr-3 ${isActive(subitem.href) ? 'opacity-100' : 'opacity-50'}`}></span>
                        {subitem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-900">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium rounded-lg"
        >
          <IoLogOut className="text-xl" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

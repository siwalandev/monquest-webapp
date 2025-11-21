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
      title: "Content Management",
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
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-medium text-white">{user.name}</div>
              <div className="text-xs text-gray-400">{user.email}</div>
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
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  ${
                    isActive(item.href)
                      ? "bg-green-500/10 text-green-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }
                  transition-all duration-200
                  text-sm font-medium
                `}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ) : (
              <>
                <button
                  onClick={() => item.id && toggleMenu(item.id)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 text-sm font-medium rounded-lg"
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
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu.map((subitem, subindex) => (
                      <Link
                        key={subindex}
                        href={subitem.href}
                        className={`
                          block px-4 py-2 rounded-lg text-sm
                          ${
                            isActive(subitem.href)
                              ? "bg-green-500/10 text-green-400"
                              : "text-gray-400 hover:bg-gray-800 hover:text-white"
                          }
                          transition-all duration-200
                        `}
                      >
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

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
  IoStatsChart,
  IoPeople,
  IoShield,
  IoMenu,
  IoClose,
  IoColorPalette
} from "react-icons/io5";
import { useState, useEffect } from "react";

// Helper function to get role badge styles
const getRoleBadgeClass = (role: any) => {
  // Handle both old string format and new object format
  const slug = typeof role === 'string' ? role.toLowerCase() : role?.slug || '';
  
  switch (slug) {
    case 'super_admin':
      return 'bg-purple-500/20 text-purple-400';
    case 'admin':
      return 'bg-blue-500/20 text-blue-400';
    case 'editor':
      return 'bg-green-500/20 text-green-400';
    case 'viewer':
      return 'bg-gray-500/20 text-gray-400';
    default:
      return 'bg-cyan-500/20 text-cyan-400';
  }
};

// Helper to get role display name
const getRoleDisplayName = (role: any) => {
  if (typeof role === 'string') {
    return role.replace('_', ' ');
  }
  return role?.name || 'Unknown';
};

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps = {}) {
  const pathname = usePathname();
  const { logout, user, hasPermission } = useAuth();
  const [openMenus, setOpenMenus] = useState<string[]>(["content"]);
  const [, forceUpdate] = useState(0); // Force re-render on permission changes
  
  // Listen for permission updates
  useEffect(() => {
    const handlePermissionUpdate = () => {
      console.log('🔄 Sidebar: Permission updated, forcing re-render...');
      forceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('permissionsUpdated', handlePermissionUpdate);
    return () => window.removeEventListener('permissionsUpdated', handlePermissionUpdate);
  }, []);
  
  const handleLinkClick = () => {
    // Close mobile sidebar when a link is clicked
    if (onClose) {
      onClose();
    }
  };

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <IoStatsChart className="text-xl" />,
      permission: null, // Dashboard accessible to all
    },
    {
      id: "content",
      title: "Content",
      icon: <IoDocument className="text-xl" />,
      permission: "content.view",
      submenu: [
        { title: "Hero Section", href: "/admin/content/hero", permission: "content.view" },
        { title: "Features", href: "/admin/content/features", permission: "content.view" },
        { title: "How It Works", href: "/admin/content/how-it-works", permission: "content.view" },
        { title: "Roadmap", href: "/admin/content/roadmap", permission: "content.view" },
        { title: "FAQ", href: "/admin/content/faq", permission: "content.view" },
      ],
    },
    // {
    //   title: "Media Library",
    //   href: "/admin/media",
    //   icon: <IoImage className="text-xl" />,
    //   permission: "media.view",
    // },
    {
      title: "Users",
      href: "/admin/users",
      icon: <IoPeople className="text-xl" />,
      permission: "users.view",
    },
    {
      title: "Roles",
      href: "/admin/roles",
      icon: <IoShield className="text-xl" />,
      permission: "roles.view",
    },
    {
      id: "settings",
      title: "Settings",
      icon: <IoSettings className="text-xl" />,
      permission: "settings.view",
      submenu: [
        { title: "Theme", href: "/admin/settings/theme", permission: "settings.view", icon: <IoColorPalette /> },
        { title: "API Keys", href: "/admin/settings/api-keys", permission: "apiKeys.view" },
        { title: "General", href: "/admin/settings/general", permission: "settings.view" },
      ],
    },
  ];

  // Check if user has permission for a menu item
  const hasMenuPermission = (permission: string | null) => {
    if (!permission) return true; // No permission required
    return hasPermission(permission);
  };

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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto z-50
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }
      `}>
      {/* Logo/Brand */}
      <div className="px-6 h-[66px] flex items-center border-b-2 border-gray-800">
        <div className="flex items-center justify-between w-full">
          <Link href="/admin" className="flex items-center gap-3" onClick={handleLinkClick}>
            <IoGameController className="text-3xl text-pixel-primary" />
            <div>
              <div className="text-lg font-bold text-white">
                MONQUEST
              </div>
            </div>
          </Link>
          
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-100"
            aria-label="Close menu"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 pb-20">
        {menuItems.map((item, index) => {
          const hasAccess = hasMenuPermission(item.permission);
          
          return (
          <div key={index}>
            {item.href ? (
              hasAccess ? (
              <Link
                href={item.href}
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-none
                  border-l-[6px] transition-all duration-100 text-sm font-medium
                  ${
                    isActive(item.href)
                      ? "border-pixel-primary bg-pixel-primary/10 text-pixel-primary"
                      : "border-transparent text-gray-400 hover:bg-gray-800/70 hover:text-white hover:border-gray-700"
                  }
                `}
                style={isActive(item.href) ? {
                  boxShadow: '4px 0 0 0 var(--pixel-primary), inset 0 0 20px color-mix(in srgb, var(--pixel-primary) 10%, transparent)'
                } : undefined}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
              ) : (
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-none border-l-[6px] border-transparent text-gray-600 text-sm font-medium cursor-not-allowed opacity-50"
                  title="You don't have permission to access this page"
                >
                  {item.icon}
                  <span>{item.title}</span>
                </div>
              )
            ) : (
              <>
                <button
                  onClick={() => item.id && toggleMenu(item.id)}
                  className={`
                    w-full flex items-center justify-between gap-3 px-4 py-3 rounded-none
                    border-l-4 transition-all duration-100 text-sm font-medium
                    ${
                      item.id && isParentActive(`/admin/${item.id}`)
                        ? "border-pixel-primary bg-pixel-primary/5 text-white"
                        : "border-transparent text-gray-400 hover:bg-gray-800/70 hover:text-white hover:border-gray-700"
                    }
                  `}
                  style={item.id && isParentActive(`/admin/${item.id}`) ? {
                    boxShadow: '3px 0 0 0 color-mix(in srgb, var(--pixel-primary) 30%, transparent), inset 0 0 15px color-mix(in srgb, var(--pixel-primary) 8%, transparent)'
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
                    {item.submenu.map((subitem, subindex) => {
                      const hasSubAccess = hasMenuPermission(subitem.permission);
                      
                      return hasSubAccess ? (
                      <Link
                        key={subindex}
                        href={subitem.href}
                        onClick={handleLinkClick}
                        className={`
                          flex items-center pl-12 pr-4 py-2.5 rounded-none text-xs
                          border-l-[6px] transition-all duration-100
                          ${
                            isActive(subitem.href)
                              ? "border-pixel-primary bg-pixel-primary/15 text-pixel-primary font-medium"
                              : "border-transparent text-gray-400 hover:bg-gray-800/70 hover:text-white hover:border-gray-700"
                          }
                        `}
                        style={isActive(subitem.href) ? {
                          boxShadow: '4px 0 0 0 color-mix(in srgb, var(--pixel-primary) 40%, transparent), inset 0 0 25px color-mix(in srgb, var(--pixel-primary) 15%, transparent)'
                        } : undefined}
                      >
                        <span className={`w-1.5 h-1.5 ${isActive(subitem.href) ? 'rounded-none' : 'rounded-full'} bg-current mr-3 ${isActive(subitem.href) ? 'opacity-100' : 'opacity-50'}`}></span>
                        {subitem.title}
                      </Link>
                      ) : (
                        <div
                          key={subindex}
                          className="flex items-center pl-12 pr-4 py-2.5 rounded-none text-xs border-l-[6px] border-transparent text-gray-600 cursor-not-allowed opacity-50"
                          title="You don't have permission to access this page"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-3 opacity-50"></span>
                          {subitem.title}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        );})}
      </nav>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-pixel-dark bg-pixel-darker">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium rounded-lg"
        >
          <IoLogOut className="text-xl" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
}

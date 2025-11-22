"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IoDocument, IoImage, IoEye, IoPeople, IoTrendingUp, IoArrowForward, IoKey } from "react-icons/io5";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";
import PermissionGuard from "@/components/PermissionGuard";
import { authFetch } from "@/lib/fetch";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalContent: 0,
    totalMedia: 0,
    totalApiKeys: 0,
    activeApiKeys: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await authFetch("/api/dashboard/stats");
        const result = await response.json();
        
        if (result.success) {
          setStats(result.data.stats);
          setRecentActivity(result.data.recentActivity);
        } else {
          toast.error("Failed to load dashboard data");
        }
      } catch (error) {
        console.error("Fetch dashboard data error:", error);
        toast.error("Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const chartData = [
    { name: "Mon", views: 400, users: 240 },
    { name: "Tue", views: 300, users: 198 },
    { name: "Wed", views: 600, users: 380 },
    { name: "Thu", views: 800, users: 490 },
    { name: "Fri", views: 500, users: 380 },
    { name: "Sat", views: 700, users: 430 },
    { name: "Sun", views: 900, users: 520 },
  ];

  const quickActions = [
    { title: "Edit Hero Section", href: "/admin/content/hero", icon: <IoDocument /> },
    { title: "Manage Features", href: "/admin/content/features", icon: <IoDocument /> },
    { title: "Upload Media", href: "/admin/media", icon: <IoImage /> },
    { title: "API Settings", href: "/admin/settings/api-keys", icon: <IoTrendingUp /> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  const statsDisplay = [
    { 
      label: "Total Content", 
      value: stats.totalContent.toString(), 
      icon: <IoDocument className="text-2xl" />,
    },
    { 
      label: "Media Files", 
      value: stats.totalMedia.toString(), 
      icon: <IoImage className="text-2xl" />,
    },
    { 
      label: "Total API Keys", 
      value: stats.totalApiKeys.toString(), 
      icon: <IoKey className="text-2xl" />,
    },
    { 
      label: "Active API Keys", 
      value: stats.activeApiKeys.toString(), 
      icon: <IoTrendingUp className="text-2xl" />,
    },
  ];

  return (
    <PermissionGuard permissions="panel.access">
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          Welcome back! Here's what's happening with your website.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsDisplay.map((stat, index) => (
          <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="text-gray-400 text-xl sm:text-2xl">{stat.icon}</div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Page Views Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Page Views</h2>
          <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="views" stroke="#10b981" fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Users Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Active Users</h2>
          <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
          <div className="space-y-2 sm:space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors group min-h-[48px]"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-green-400 text-lg sm:text-base">{action.icon}</div>
                  <span className="text-white font-medium text-sm sm:text-base">{action.title}</span>
                </div>
                <IoArrowForward className="text-gray-400 group-hover:text-green-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-800 last:border-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {activity.action} on {activity.resource}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      by {activity.user.name} • {formatTimeAgo(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
    </PermissionGuard>
  );
}

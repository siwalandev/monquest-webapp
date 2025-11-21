"use client";

import Link from "next/link";
import { IoDocument, IoImage, IoEye, IoPeople, IoTrendingUp, IoArrowForward } from "react-icons/io5";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const stats = [
    { 
      label: "Total Content", 
      value: "24", 
      change: "+12%",
      icon: <IoDocument className="text-2xl" />,
      trend: "up"
    },
    { 
      label: "Media Files", 
      value: "156", 
      change: "+8%",
      icon: <IoImage className="text-2xl" />,
      trend: "up"
    },
    { 
      label: "Page Views", 
      value: "12.5K", 
      change: "+23%",
      icon: <IoEye className="text-2xl" />,
      trend: "up"
    },
    { 
      label: "Active Users", 
      value: "1.2K", 
      change: "+5%",
      icon: <IoPeople className="text-2xl" />,
      trend: "up"
    },
  ];

  const recentActivity = [
    { action: "Hero Section updated", user: "Admin", time: "2 hours ago" },
    { action: "New feature added", user: "Admin", time: "5 hours ago" },
    { action: "FAQ section updated", user: "Admin", time: "1 day ago" },
    { action: "Roadmap milestone added", user: "Admin", time: "2 days ago" },
    { action: "Media files uploaded", user: "Admin", time: "3 days ago" },
  ];

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-400">
          Welcome back! Here's what's happening with your website.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400">{stat.icon}</div>
              <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Page Views</h2>
          <ResponsiveContainer width="100%" height={250}>
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
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Active Users</h2>
          <ResponsiveContainer width="100%" height={250}>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-green-400">{action.icon}</div>
                  <span className="text-white font-medium">{action.title}</span>
                </div>
                <IoArrowForward className="text-gray-400 group-hover:text-green-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-800 last:border-0">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{activity.action}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    by {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

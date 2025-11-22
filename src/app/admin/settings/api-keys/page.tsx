"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { IoAdd, IoTrash, IoEye, IoEyeOff, IoCopy, IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/lib/fetch";

interface APIKey {
  id: string;
  name: string;
  key: string;
  environment: "PRODUCTION" | "DEVELOPMENT" | "STAGING";
  createdAt: string;
  updatedAt: string;
  status: "ACTIVE" | "INACTIVE";
  user: {
    name: string;
    email: string;
  };
}

export default function APIKeysPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    environment: "DEVELOPMENT" as "PRODUCTION" | "DEVELOPMENT" | "STAGING",
  });

  // Fetch API keys
  const fetchApiKeys = async () => {
    try {
      const response = await authFetch("/api/api-keys");
      const data = await response.json();
      
      if (data.success) {
        setApiKeys(data.data);
      } else {
        toast.error("Failed to fetch API keys");
      }
    } catch (error) {
      console.error("Fetch API keys error:", error);
      toast.error("Failed to load API keys");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const toggleShowKey = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard!");
  };

  const deleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return;

    try {
      const response = await authFetch(`/api/api-keys/${id}?userId=${user?.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("API key deleted successfully!");
        fetchApiKeys();
      } else {
        toast.error(data.error || "Failed to delete API key");
      }
    } catch (error) {
      console.error("Delete API key error:", error);
      toast.error("Failed to delete API key");
    }
  };

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const response = await authFetch("/api/api-keys", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          environment: formData.environment,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("API key created successfully!");
        setShowModal(false);
        setFormData({ name: "", environment: "DEVELOPMENT" });
        fetchApiKeys();
      } else {
        toast.error(data.error || "Failed to create API key");
      }
    } catch (error) {
      console.error("Create API key error:", error);
      toast.error("Failed to create API key");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case "PRODUCTION":
        return "bg-red-500/10 text-red-400";
      case "DEVELOPMENT":
        return "bg-blue-500/10 text-blue-400";
      case "STAGING":
        return "bg-yellow-500/10 text-yellow-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const columns: ColumnDef<APIKey>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-white">{row.original.name}</div>
          <div className="text-xs text-gray-500">
            Created by {row.original.user.name}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "key",
      header: "API Key",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <code className="text-xs bg-gray-800 px-2 py-1 rounded font-mono">
            {showKey[row.original.id]
              ? row.original.key
              : "•".repeat(20) + row.original.key.slice(-4)}
          </code>
          <button
            onClick={() => toggleShowKey(row.original.id)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {showKey[row.original.id] ? <IoEyeOff /> : <IoEye />}
          </button>
          <button
            onClick={() => copyToClipboard(row.original.key)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <IoCopy />
          </button>
        </div>
      ),
    },
    {
      accessorKey: "environment",
      header: "Environment",
      cell: ({ row }) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEnvironmentColor(
            row.original.environment
          )}`}
        >
          {row.original.environment}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm">{formatDate(row.original.createdAt)}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            row.original.status === "ACTIVE"
              ? "bg-green-500/10 text-green-400"
              : "bg-gray-500/10 text-gray-400"
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          onClick={() => deleteKey(row.original.id)}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          <IoTrash />
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">API Keys</h1>
          <p className="text-gray-400">
            Manage your API keys for external integrations
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
        >
          <IoAdd className="text-xl" />
          Create API Key
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Total Keys</div>
          <div className="text-3xl font-bold text-white">{apiKeys.length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Active Keys</div>
          <div className="text-3xl font-bold text-green-400">
            {apiKeys.filter((k) => k.status === "ACTIVE").length}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Inactive Keys</div>
          <div className="text-3xl font-bold text-gray-400">
            {apiKeys.filter((k) => k.status === "INACTIVE").length}
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={apiKeys}
        searchPlaceholder="Search API keys..."
      />

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Create New API Key</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>

            <form onSubmit={createApiKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Production API Key"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Environment
                </label>
                <select
                  value={formData.environment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      environment: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="DEVELOPMENT">Development</option>
                  <option value="STAGING">Staging</option>
                  <option value="PRODUCTION">Production</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { IoAdd, IoTrash, IoEye, IoEyeOff, IoCopy } from "react-icons/io5";
import toast from "react-hot-toast";

interface APIKey {
  id: string;
  name: string;
  key: string;
  environment: "Production" | "Development";
  createdAt: string;
  lastUsed: string;
  status: "Active" | "Inactive";
}

export default function APIKeysPage() {
  const [showModal, setShowModal] = useState(false);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: "1",
      name: "Production API Key",
      key: "mk_prod_1234567890abcdefghij",
      environment: "Production",
      createdAt: "2025-01-15",
      lastUsed: "2 hours ago",
      status: "Active",
    },
    {
      id: "2",
      name: "Development API Key",
      key: "mk_dev_0987654321zyxwvutsrq",
      environment: "Development",
      createdAt: "2025-01-10",
      lastUsed: "1 day ago",
      status: "Active",
    },
    {
      id: "3",
      name: "Test API Key",
      key: "mk_test_abcd1234efgh5678ijkl",
      environment: "Development",
      createdAt: "2025-01-05",
      lastUsed: "3 days ago",
      status: "Inactive",
    },
  ]);

  const toggleShowKey = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard!");
  };

  const deleteKey = (id: string) => {
    if (confirm("Are you sure you want to delete this API key?")) {
      setApiKeys(apiKeys.filter((key) => key.id !== id));
      toast.success("API key deleted successfully!");
    }
  };

  const columns: ColumnDef<APIKey>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-white">{row.original.name}</div>
          <div className="text-xs text-gray-500">{row.original.environment}</div>
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
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => <div className="text-sm">{row.original.createdAt}</div>,
    },
    {
      accessorKey: "lastUsed",
      header: "Last Used",
      cell: ({ row }) => <div className="text-sm">{row.original.lastUsed}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            row.original.status === "Active"
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
            {apiKeys.filter((k) => k.status === "Active").length}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Inactive Keys</div>
          <div className="text-3xl font-bold text-gray-400">
            {apiKeys.filter((k) => k.status === "Inactive").length}
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={apiKeys}
        searchPlaceholder="Search API keys..."
      />

      {/* Create Modal (simplified) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create New API Key</h2>
            <p className="text-gray-400 text-sm mb-4">
              This feature will be implemented with backend integration.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

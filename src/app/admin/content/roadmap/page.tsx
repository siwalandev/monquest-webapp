"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import DraggableCard from "@/components/ui/DraggableCard";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import PermissionGuard from "@/components/PermissionGuard";
import ColorSelector from "@/components/ui/ColorSelector";
import { IoAdd, IoSave } from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { nanoid } from "nanoid";
import { authFetch } from "@/lib/fetch";

interface RoadmapItem {
  id: string;
  phase: string;
  quarter: string;
  title: string;
  status: "completed" | "in-progress" | "upcoming";
  items: string[];
  order: number;
  color: "primary" | "secondary" | "accent";
}

interface RoadmapData {
  title: string;
  subtitle: string;
  items: RoadmapItem[];
}

export default function RoadmapContentPage() {
  const { user } = useAuth();
  const [roadmapData, setRoadmapData] = useState<RoadmapData>({
    title: "",
    subtitle: "",
    items: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [itemForm, setItemForm] = useState({
    phase: "",
    quarter: "",
    title: "",
    status: "upcoming" as "completed" | "in-progress" | "upcoming",
    items: [""],
    color: "primary" as "primary" | "secondary" | "accent",
  });

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    item: RoadmapItem | null;
  }>({ isOpen: false, item: null });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchRoadmapData();
  }, []);

  const fetchRoadmapData = async () => {
    try {
      const response = await authFetch("/api/content/roadmap");
      const result = await response.json();

      if (result.success) {
        const data = result.data.data;
        setRoadmapData({
          title: data.title || "",
          subtitle: data.subtitle || "",
          items: data.items || [],
        });
      } else {
        toast.error("Failed to load roadmap content");
      }
    } catch (error) {
      console.error("Fetch roadmap error:", error);
      toast.error("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  };

  const saveRoadmapData = async (updatedItems?: RoadmapItem[]) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = updatedItems
        ? { ...roadmapData, items: updatedItems }
        : roadmapData;

      const response = await authFetch("/api/content/roadmap", {
        method: "PUT",
        body: JSON.stringify({
          data: dataToSave,
          userId: user.id,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Roadmap saved successfully!");
        return true;
      } else {
        toast.error(result.error || "Failed to save content");
        return false;
      }
    } catch (error) {
      console.error("Save roadmap error:", error);
      toast.error("Failed to save content");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Drag & Drop
  const handleItemDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = roadmapData.items.findIndex((item) => item.id === active.id);
      const newIndex = roadmapData.items.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(roadmapData.items, oldIndex, newIndex).map(
        (item, idx) => ({
          ...item,
          order: idx,
        })
      );
      setRoadmapData({ ...roadmapData, items: reordered });
      saveRoadmapData(reordered);
    }
  };

  // CRUD Operations
  const openAddItemModal = () => {
    setEditingItem(null);
    setItemForm({
      phase: "",
      quarter: "",
      title: "",
      status: "upcoming",
      items: [""],
      color: "primary",
    });
    setItemModalOpen(true);
  };

  const openEditItemModal = (item: RoadmapItem) => {
    setEditingItem(item);
    setItemForm({
      phase: item.phase,
      quarter: item.quarter,
      title: item.title,
      status: item.status,
      items: item.items.length > 0 ? item.items : [""],
      color: item.color || "primary",
    });
    setItemModalOpen(true);
  };

  const handleItemSubmit = async () => {
    if (!itemForm.phase || !itemForm.quarter || !itemForm.title) {
      toast.error("Please fill all required fields");
      return;
    }

    const filteredItems = itemForm.items.filter((item) => item.trim() !== "");
    if (filteredItems.length === 0) {
      toast.error("Please add at least one checklist item");
      return;
    }

    let updatedItems: RoadmapItem[];
    if (editingItem) {
      updatedItems = roadmapData.items.map((item) =>
        item.id === editingItem.id
          ? { ...editingItem, ...itemForm, items: filteredItems }
          : item
      );
    } else {
      const newItem: RoadmapItem = {
        id: nanoid(),
        ...itemForm,
        items: filteredItems,
        order: roadmapData.items.length,
      };
      updatedItems = [...roadmapData.items, newItem];
    }

    setRoadmapData({ ...roadmapData, items: updatedItems });
    setItemModalOpen(false);
    
    // Save to database immediately
    const saved = await saveRoadmapData(updatedItems);
    if (saved) {
      toast.success(editingItem ? "Phase updated" : "Phase added");
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirm.item) return;
    const updated = roadmapData.items
      .filter((item) => item.id !== deleteConfirm.item!.id)
      .map((item, idx) => ({ ...item, order: idx }));
    setRoadmapData({ ...roadmapData, items: updated });
    setDeleteConfirm({ isOpen: false, item: null });
    
    // Save to database immediately
    const saved = await saveRoadmapData(updated);
    if (saved) {
      toast.success("Phase deleted");
    }
  };

  const addChecklistItem = () => {
    setItemForm({ ...itemForm, items: [...itemForm.items, ""] });
  };

  const removeChecklistItem = (index: number) => {
    const newItems = itemForm.items.filter((_, i) => i !== index);
    setItemForm({ ...itemForm, items: newItems.length > 0 ? newItems : [""] });
  };

  const updateChecklistItem = (index: number, value: string) => {
    const newItems = [...itemForm.items];
    newItems[index] = value;
    setItemForm({ ...itemForm, items: newItems });
  };

  const statusColors = {
    completed: "border-green-500 bg-green-500/10 text-green-400",
    "in-progress": "border-blue-500 bg-blue-500/10 text-blue-400",
    upcoming: "border-gray-500 bg-gray-500/10 text-gray-400",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <PermissionGuard permissions="content.view">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b-2 border-gray-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl text-white font-bold mb-2">Edit Roadmap</h1>
            <p className="text-sm text-gray-400">Manage project phases and milestones</p>
          </div>
          <button
            onClick={() => saveRoadmapData()}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 min-h-[44px] bg-green-500 hover:bg-green-600 text-white font-medium transition-all duration-100 disabled:opacity-50"
          >
            <IoSave className="text-xl" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Basic Info */}
        <div className="bg-gray-900 border-2 border-gray-800 p-4 sm:p-6 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Section Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
            <input
              type="text"
              value={roadmapData.title}
              onChange={(e) =>
                setRoadmapData({ ...roadmapData, title: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
              placeholder="Roadmap"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Subtitle *</label>
            <input
              type="text"
              value={roadmapData.subtitle}
              onChange={(e) =>
                setRoadmapData({ ...roadmapData, subtitle: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
              placeholder="Our journey to build the ultimate tower defense game"
            />
          </div>
        </div>

        {/* Roadmap Phases */}
        <div className="bg-gray-900 border-2 border-gray-800 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-white">
              Phases <span className="text-sm text-gray-500">({roadmapData.items.length})</span>
            </h2>
            <button
              onClick={openAddItemModal}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-3 py-1.5 min-h-[44px] sm:min-h-0 bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all duration-100"
            >
              <IoAdd className="text-lg" />
              Add Phase
            </button>
          </div>

          {roadmapData.items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No phases yet. Add your first phase!</p>
              <button
                onClick={openAddItemModal}
                className="px-4 py-2 min-h-[44px] bg-green-500 hover:bg-green-600 text-white font-medium transition-all duration-100"
              >
                Add First Phase
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleItemDragEnd}
            >
              <SortableContext
                items={roadmapData.items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {roadmapData.items.map((item) => (
                    <DraggableCard
                      key={item.id}
                      id={item.id}
                      onEdit={() => openEditItemModal(item)}
                      onDelete={() => setDeleteConfirm({ isOpen: true, item })}
                    >
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{item.phase}</span>
                            <span className="text-lg font-bold text-green-400">{item.quarter}</span>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                              statusColors[item.status]
                            }`}
                          >
                            {item.status.replace("-", " ")}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">{item.title}</h3>
                        <ul className="text-sm text-gray-400 space-y-1">
                          {item.items.map((task, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </DraggableCard>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={itemModalOpen}
          onClose={() => setItemModalOpen(false)}
          title={editingItem ? "Edit Phase" : "Add Phase"}
          size="lg"
          footer={
            <>
              <button
                onClick={() => setItemModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 min-h-[44px] text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100"
              >
                Cancel
              </button>
              <button
                onClick={handleItemSubmit}
                className="w-full sm:w-auto px-4 py-2 min-h-[44px] text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition-all duration-100"
              >
                {editingItem ? "Update" : "Add"} Phase
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Phase *</label>
                <input
                  type="text"
                  value={itemForm.phase}
                  onChange={(e) => setItemForm({ ...itemForm, phase: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
                  placeholder="Phase 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Quarter *</label>
                <input
                  type="text"
                  value={itemForm.quarter}
                  onChange={(e) => setItemForm({ ...itemForm, quarter: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
                  placeholder="Q1 2025"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
              <input
                type="text"
                value={itemForm.title}
                onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
                placeholder="Foundation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Status *</label>
              <div className="grid grid-cols-3 gap-2">
                {(["completed", "in-progress", "upcoming"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setItemForm({ ...itemForm, status })}
                    className={`
                      p-3 border-2 transition-all duration-100 text-sm font-medium capitalize
                      ${
                        itemForm.status === status
                          ? statusColors[status]
                          : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                      }
                    `}
                  >
                    {status.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-400">Checklist Items *</label>
                <button
                  onClick={addChecklistItem}
                  className="text-xs text-green-400 hover:text-green-300 font-medium"
                >
                  + Add Item
                </button>
              </div>
              <div className="space-y-2">
                {itemForm.items.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateChecklistItem(index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
                      placeholder="✅ Concept & Design"
                    />
                    {itemForm.items.length > 1 && (
                      <button
                        onClick={() => removeChecklistItem(index)}
                        className="px-3 py-2 bg-red-500/10 text-red-400 border-2 border-red-500 hover:bg-red-500/20 transition-all duration-100"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <ColorSelector
              value={itemForm.color}
              onChange={(color) => setItemForm({ ...itemForm, color })}
            />
          </div>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
          onConfirm={handleDeleteItem}
          title="Delete Phase?"
          message={`Are you sure you want to delete "${deleteConfirm.item?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </PermissionGuard>
  );
}

"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import DraggableCard from "@/components/ui/DraggableCard";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import IconPicker from "@/components/ui/IconPicker";
import { IoAdd } from "react-icons/io5";
import * as Icons from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { nanoid } from "nanoid";
import { authFetch } from "@/lib/fetch";

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: "primary" | "secondary" | "accent";
}

export default function FeaturesContentPage() {
  const { user } = useAuth();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; feature: Feature | null }>({ isOpen: false, feature: null });
  const [formData, setFormData] = useState({
    icon: "IoGameController",
    title: "",
    description: "",
    color: "primary" as "primary" | "secondary" | "accent",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await authFetch("/api/content/features");
      const result = await response.json();
      
      if (result.success) {
        setFeatures(result.data.data.items || []);
      } else {
        toast.error("Failed to load features");
      }
    } catch (error) {
      console.error("Fetch features error:", error);
      toast.error("Failed to load features");
    } finally {
      setIsLoading(false);
    }
  };

  const saveFeatures = async (updatedFeatures: Feature[]) => {
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    try {
      const response = await authFetch("/api/content/features", {
        method: "PUT",
        body: JSON.stringify({
          data: {
            title: "Game Features",
            subtitle: "Why players love Monquest",
            items: updatedFeatures,
          },
          userId: user.id,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Features updated successfully!");
        return true;
      } else {
        toast.error(result.error || "Failed to save features");
        return false;
      }
    } catch (error) {
      console.error("Save features error:", error);
      toast.error("Failed to save features");
      return false;
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = features.findIndex((f) => f.id === active.id);
      const newIndex = features.findIndex((f) => f.id === over.id);

      const reorderedFeatures = arrayMove(features, oldIndex, newIndex);
      setFeatures(reorderedFeatures);
      await saveFeatures(reorderedFeatures);
    }
  };

  const openAddModal = () => {
    setEditingFeature(null);
    setFormData({
      icon: "IoGameController",
      title: "",
      description: "",
      color: "primary",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (feature: Feature) => {
    setEditingFeature(feature);
    setFormData({
      icon: feature.icon,
      title: feature.title,
      description: feature.description,
      color: feature.color,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Please fill all required fields");
      return;
    }

    let updatedFeatures: Feature[];

    if (editingFeature) {
      // Update existing
      updatedFeatures = features.map((f) =>
        f.id === editingFeature.id ? { ...editingFeature, ...formData } : f
      );
    } else {
      // Add new
      const newFeature: Feature = {
        id: nanoid(),
        ...formData,
      };
      updatedFeatures = [...features, newFeature];
    }

    const success = await saveFeatures(updatedFeatures);
    if (success) {
      setFeatures(updatedFeatures);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.feature) return;

    const updatedFeatures = features.filter((f) => f.id !== deleteConfirm.feature!.id);
    const success = await saveFeatures(updatedFeatures);
    
    if (success) {
      setFeatures(updatedFeatures);
      setDeleteConfirm({ isOpen: false, feature: null });
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="text-2xl" /> : null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl text-white font-bold mb-2">Manage Features</h1>
          <p className="text-sm text-gray-400">Drag to reorder, click to edit or delete</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium transition-all duration-100"
        >
          <IoAdd className="text-xl" />
          Add Feature
        </button>
      </div>

      {/* Features List */}
      {features.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 border-2 border-gray-800">
          <p className="text-gray-400 mb-4">No features yet</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium transition-all duration-100"
          >
            Add First Feature
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={features.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {features.map((feature) => (
                <DraggableCard
                  key={feature.id}
                  id={feature.id}
                  onEdit={() => openEditModal(feature)}
                  onDelete={() => setDeleteConfirm({ isOpen: true, feature })}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      feature.color === 'primary' ? 'bg-green-500/10 text-green-400' :
                      feature.color === 'secondary' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-orange-500/10 text-orange-400'
                    }`}>
                      {getIcon(feature.icon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </DraggableCard>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFeature ? "Edit Feature" : "Add Feature"}
        size="md"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition-all duration-100"
            >
              {editingFeature ? "Update" : "Add"} Feature
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Icon</label>
            <button
              onClick={() => setIsIconPickerOpen(true)}
              className="w-full p-4 bg-gray-800 border-2 border-gray-700 hover:border-gray-600 text-white flex items-center gap-3 transition-all duration-100"
            >
              {getIcon(formData.icon)}
              <span>{formData.icon}</span>
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
              placeholder="Enter feature title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100 resize-none"
              placeholder="Enter feature description"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Color Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {(["primary", "secondary", "accent"] as const).map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`
                    p-3 border-2 transition-all duration-100 text-sm font-medium capitalize
                    ${formData.color === color
                      ? color === 'primary' ? 'border-green-500 bg-green-500/10 text-green-400' :
                        color === 'secondary' ? 'border-blue-500 bg-blue-500/10 text-blue-400' :
                        'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                    }
                  `}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Icon Picker Modal */}
      <IconPicker
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelect={(iconName) => setFormData({ ...formData, icon: iconName })}
        selectedIcon={formData.icon}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, feature: null })}
        onConfirm={handleDelete}
        title="Delete Feature?"
        message={`Are you sure you want to delete "${deleteConfirm.feature?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import DraggableCard from "@/components/ui/DraggableCard";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import IconPicker from "@/components/ui/IconPicker";
import ColorSelector from "@/components/ui/ColorSelector";
import { IoAdd, IoSave } from "react-icons/io5";
import * as Icons from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { nanoid } from "nanoid";
import { authFetch } from "@/lib/fetch";

interface Step {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
  color: "primary" | "secondary" | "accent";
}

interface HowItWorksData {
  title: string;
  subtitle: string;
  steps: Step[];
}

export default function HowItWorksContentPage() {
  const { user } = useAuth();
  const [howItWorksData, setHowItWorksData] = useState<HowItWorksData>({
    title: "",
    subtitle: "",
    steps: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Step Modal states
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [stepForm, setStepForm] = useState({
    icon: "IoLink",
    title: "",
    description: "",
    color: "secondary" as "primary" | "secondary" | "accent",
  });

  // Icon Picker
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    step: Step | null;
  }>({ isOpen: false, step: null });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchHowItWorksData();
  }, []);

  const fetchHowItWorksData = async () => {
    try {
      const response = await authFetch("/api/content/how-it-works");
      const result = await response.json();

      if (result.success) {
        const data = result.data.data;
        setHowItWorksData({
          title: data.title || "",
          subtitle: data.subtitle || "",
          steps: data.steps || [],
        });
      } else {
        toast.error("Failed to load how it works content");
      }
    } catch (error) {
      console.error("Fetch how it works error:", error);
      toast.error("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  };

  const saveHowItWorksData = async (updatedSteps?: Step[]) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = updatedSteps
        ? { ...howItWorksData, steps: updatedSteps }
        : howItWorksData;

      const response = await authFetch("/api/content/how-it-works", {
        method: "PUT",
        body: JSON.stringify({
          data: dataToSave,
          userId: user.id,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("How It Works saved successfully!");
        return true;
      } else {
        toast.error(result.error || "Failed to save content");
        return false;
      }
    } catch (error) {
      console.error("Save how it works error:", error);
      toast.error("Failed to save content");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Drag & Drop
  const handleStepDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = howItWorksData.steps.findIndex((s) => s.id === active.id);
      const newIndex = howItWorksData.steps.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(howItWorksData.steps, oldIndex, newIndex).map(
        (item, idx) => ({
          ...item,
          order: idx,
        })
      );
      setHowItWorksData({ ...howItWorksData, steps: reordered });
      saveHowItWorksData(reordered);
    }
  };

  // CRUD Operations
  const openAddStepModal = () => {
    setEditingStep(null);
    setStepForm({ icon: "IoLink", title: "", description: "", color: "secondary" });
    setStepModalOpen(true);
  };

  const openEditStepModal = (step: Step) => {
    setEditingStep(step);
    setStepForm({ icon: step.icon, title: step.title, description: step.description, color: step.color || "secondary" });
    setStepModalOpen(true);
  };

  const handleStepSubmit = async () => {
    if (!stepForm.title || !stepForm.description) {
      toast.error("Please fill all required fields");
      return;
    }

    let updatedSteps: Step[];
    if (editingStep) {
      updatedSteps = howItWorksData.steps.map((s) =>
        s.id === editingStep.id ? { ...editingStep, ...stepForm } : s
      );
    } else {
      const newStep: Step = {
        id: nanoid(),
        ...stepForm,
        order: howItWorksData.steps.length,
      };
      updatedSteps = [...howItWorksData.steps, newStep];
    }

    setHowItWorksData({ ...howItWorksData, steps: updatedSteps });
    setStepModalOpen(false);
    
    // Save to database immediately
    const saved = await saveHowItWorksData(updatedSteps);
    if (saved) {
      toast.success(editingStep ? "Step updated" : "Step added");
    }
  };

  const handleDeleteStep = async () => {
    if (!deleteConfirm.step) return;
    const updated = howItWorksData.steps
      .filter((s) => s.id !== deleteConfirm.step!.id)
      .map((s, idx) => ({ ...s, order: idx }));
    setHowItWorksData({ ...howItWorksData, steps: updated });
    setDeleteConfirm({ isOpen: false, step: null });
    
    // Save to database immediately
    const saved = await saveHowItWorksData(updated);
    if (saved) {
      toast.success("Step deleted");
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
          <h1 className="text-3xl text-white font-bold mb-2">Edit How It Works</h1>
          <p className="text-sm text-gray-400">Update the step-by-step guide</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => saveHowItWorksData()}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-pixel-primary hover:brightness-110 text-white font-medium transition-all duration-100 disabled:opacity-50"
          >
            <IoSave className="text-xl" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-gray-900 border-2 border-gray-800 p-6 space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">Section Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
          <input
            type="text"
            value={howItWorksData.title}
            onChange={(e) =>
              setHowItWorksData({ ...howItWorksData, title: e.target.value })
            }
            className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-pixel-primary focus:outline-none transition-colors duration-100"
            placeholder="How It Works"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Subtitle *</label>
          <input
            type="text"
            value={howItWorksData.subtitle}
            onChange={(e) =>
              setHowItWorksData({ ...howItWorksData, subtitle: e.target.value })
            }
            className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-pixel-primary focus:outline-none transition-colors duration-100"
            placeholder="Start your adventure in just 4 simple steps"
          />
        </div>
      </div>

      {/* Steps */}
      <div className="bg-gray-900 border-2 border-gray-800 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            Steps <span className="text-sm text-gray-500">({howItWorksData.steps.length})</span>
          </h2>
          <button
            onClick={openAddStepModal}
            className="flex items-center gap-2 px-3 py-1.5 bg-pixel-primary hover:brightness-110 text-white text-sm font-medium transition-all duration-100"
          >
            <IoAdd className="text-lg" />
            Add Step
          </button>
        </div>

        {howItWorksData.steps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No steps yet. Add your first step!</p>
            <button
              onClick={openAddStepModal}
              className="px-4 py-2 bg-pixel-primary hover:brightness-110 text-white font-medium transition-all duration-100"
            >
              Add First Step
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleStepDragEnd}
          >
            <SortableContext
              items={howItWorksData.steps.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {howItWorksData.steps.map((step, index) => (
                  <DraggableCard
                    key={step.id}
                    id={step.id}
                    onEdit={() => openEditStepModal(step)}
                    onDelete={() => setDeleteConfirm({ isOpen: true, step })}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-800 text-pixel-primary font-bold text-lg rounded">
                        {index + 1}
                      </div>
                      <div className="p-3 bg-gray-800/50 rounded">
                        {getIcon(step.icon)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-white mb-1">{step.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2">{step.description}</p>
                      </div>
                    </div>
                  </DraggableCard>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Step Modal */}
      <Modal
        isOpen={stepModalOpen}
        onClose={() => setStepModalOpen(false)}
        title={editingStep ? "Edit Step" : "Add Step"}
        size="md"
        footer={
          <>
            <button
              onClick={() => setStepModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100"
            >
              Cancel
            </button>
            <button
              onClick={handleStepSubmit}
              className="px-4 py-2 text-sm font-medium bg-pixel-primary hover:brightness-110 text-white transition-all duration-100"
            >
              {editingStep ? "Update" : "Add"} Step
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Icon</label>
            <button
              onClick={() => setIconPickerOpen(true)}
              className="w-full p-4 bg-gray-800 border-2 border-gray-700 hover:border-gray-600 text-white flex items-center gap-3 transition-all duration-100"
            >
              {getIcon(stepForm.icon)}
              <span>{stepForm.icon}</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
            <input
              type="text"
              value={stepForm.title}
              onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-pixel-primary focus:outline-none transition-colors duration-100"
              placeholder="Connect Wallet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description *
            </label>
            <textarea
              value={stepForm.description}
              onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-pixel-primary focus:outline-none transition-colors duration-100 resize-none"
              placeholder="Connect your Web3 wallet to access the game..."
            />
          </div>

          {/* Color Selector */}
          <ColorSelector
            value={stepForm.color}
            onChange={(color) => setStepForm({ ...stepForm, color })}
          />
        </div>
      </Modal>

      {/* Icon Picker */}
      <IconPicker
        isOpen={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        onSelect={(iconName) => setStepForm({ ...stepForm, icon: iconName })}
        selectedIcon={stepForm.icon}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, step: null })}
        onConfirm={handleDeleteStep}
        title="Delete Step?"
        message={`Are you sure you want to delete "${deleteConfirm.step?.title}"? This will renumber all following steps.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

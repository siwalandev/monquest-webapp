"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import DraggableCard from "@/components/ui/DraggableCard";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import PermissionGuard from "@/components/PermissionGuard";
import ColorSelector from "@/components/ui/ColorSelector";
import { IoAdd, IoSave, IoChevronDown } from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { nanoid } from "nanoid";
import { authFetch } from "@/lib/fetch";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  color: "primary" | "secondary" | "accent";
}

interface FAQData {
  title: string;
  subtitle: string;
  items: FAQItem[];
}

export default function FAQContentPage() {
  const { user } = useAuth();
  const [faqData, setFaqData] = useState<FAQData>({
    title: "",
    subtitle: "",
    items: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);

  // Modal states
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [itemForm, setItemForm] = useState({
    question: "",
    answer: "",
    color: "secondary" as "primary" | "secondary" | "accent",
  });

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    item: FAQItem | null;
  }>({ isOpen: false, item: null });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchFAQData();
  }, []);

  const fetchFAQData = async () => {
    try {
      const response = await authFetch("/api/content/faq");
      const result = await response.json();

      if (result.success) {
        const data = result.data.data;
        setFaqData({
          title: data.title || "",
          subtitle: data.subtitle || "",
          items: data.items || [],
        });
      } else {
        toast.error("Failed to load FAQ content");
      }
    } catch (error) {
      console.error("Fetch FAQ error:", error);
      toast.error("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  };

  const saveFAQData = async (updatedItems?: FAQItem[]) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = updatedItems
        ? { ...faqData, items: updatedItems }
        : faqData;

      const response = await authFetch("/api/content/faq", {
        method: "PUT",
        body: JSON.stringify({
          data: dataToSave,
          userId: user.id,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("FAQ saved successfully!");
        return true;
      } else {
        toast.error(result.error || "Failed to save content");
        return false;
      }
    } catch (error) {
      console.error("Save FAQ error:", error);
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
      const oldIndex = faqData.items.findIndex((item) => item.id === active.id);
      const newIndex = faqData.items.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(faqData.items, oldIndex, newIndex).map(
        (item, idx) => ({
          ...item,
          order: idx,
        })
      );
      setFaqData({ ...faqData, items: reordered });
      saveFAQData(reordered);
    }
  };

  // CRUD Operations
  const openAddItemModal = () => {
    setEditingItem(null);
    setItemForm({
      question: "",
      answer: "",
      color: "secondary",
    });
    setItemModalOpen(true);
  };

  const openEditItemModal = (item: FAQItem) => {
    setEditingItem(item);
    setItemForm({
      question: item.question,
      answer: item.answer,
      color: item.color || "secondary",
    });
    setItemModalOpen(true);
  };

  const handleItemSubmit = async () => {
    if (!itemForm.question || !itemForm.answer) {
      toast.error("Please fill all required fields");
      return;
    }

    let updatedItems: FAQItem[];
    if (editingItem) {
      updatedItems = faqData.items.map((item) =>
        item.id === editingItem.id ? { ...editingItem, ...itemForm } : item
      );
    } else {
      const newItem: FAQItem = {
        id: nanoid(),
        ...itemForm,
        order: faqData.items.length,
      };
      updatedItems = [...faqData.items, newItem];
    }

    setFaqData({ ...faqData, items: updatedItems });
    setItemModalOpen(false);
    
    // Save to database immediately
    const saved = await saveFAQData(updatedItems);
    if (saved) {
      toast.success(editingItem ? "FAQ updated" : "FAQ added");
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirm.item) return;
    const updated = faqData.items
      .filter((item) => item.id !== deleteConfirm.item!.id)
      .map((item, idx) => ({ ...item, order: idx }));
    setFaqData({ ...faqData, items: updated });
    setDeleteConfirm({ isOpen: false, item: null });
    
    // Save to database immediately
    const saved = await saveFAQData(updated);
    if (saved) {
      toast.success("FAQ deleted");
    }
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
            <h1 className="text-2xl sm:text-3xl text-white font-bold mb-2">Edit FAQ</h1>
            <p className="text-sm text-gray-400">Manage frequently asked questions</p>
          </div>
          <button
            onClick={() => saveFAQData()}
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
              value={faqData.title}
              onChange={(e) => setFaqData({ ...faqData, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
              placeholder="FAQ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Subtitle *</label>
            <input
              type="text"
              value={faqData.subtitle}
              onChange={(e) => setFaqData({ ...faqData, subtitle: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
              placeholder="Got questions? We've got answers!"
            />
          </div>
        </div>

        {/* FAQ Items */}
        <div className="bg-gray-900 border-2 border-gray-800 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-white">
              Questions <span className="text-sm text-gray-500">({faqData.items.length})</span>
            </h2>
            <button
              onClick={openAddItemModal}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-3 py-1.5 min-h-[44px] sm:min-h-0 bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all duration-100"
            >
              <IoAdd className="text-lg" />
              Add Question
            </button>
          </div>

          {faqData.items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No FAQs yet. Add your first question!</p>
              <button
                onClick={openAddItemModal}
                className="px-4 py-2 min-h-[44px] bg-green-500 hover:bg-green-600 text-white font-medium transition-all duration-100"
              >
                Add First Question
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleItemDragEnd}
            >
              <SortableContext
                items={faqData.items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {faqData.items.map((item) => (
                    <DraggableCard
                      key={item.id}
                      id={item.id}
                      onEdit={() => openEditItemModal(item)}
                      onDelete={() => setDeleteConfirm({ isOpen: true, item })}
                    >
                      <div className="space-y-2">
                        <button
                          onClick={() =>
                            setExpandedPreview(expandedPreview === item.id ? null : item.id)
                          }
                          className="w-full text-left flex items-start justify-between gap-3"
                        >
                          <h3 className="text-base font-bold text-white flex-1">
                            {item.question}
                          </h3>
                          <IoChevronDown
                            className={`text-gray-400 text-xl flex-shrink-0 transition-transform duration-200 ${
                              expandedPreview === item.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {expandedPreview === item.id && (
                          <p className="text-sm text-gray-400 leading-relaxed pt-2 border-t border-gray-700">
                            {item.answer}
                          </p>
                        )}
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
          title={editingItem ? "Edit FAQ" : "Add FAQ"}
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
                {editingItem ? "Update" : "Add"} FAQ
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Question *</label>
              <input
                type="text"
                value={itemForm.question}
                onChange={(e) => setItemForm({ ...itemForm, question: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100"
                placeholder="What is Monquest?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Answer *</label>
              <textarea
                value={itemForm.answer}
                onChange={(e) => setItemForm({ ...itemForm, answer: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-green-500 focus:outline-none transition-colors duration-100 resize-none"
                placeholder="Monquest is a pixel-art tower defense game built on Monad blockchain..."
              />
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
          title="Delete FAQ?"
          message={`Are you sure you want to delete "${deleteConfirm.item?.question}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </PermissionGuard>
  );
}

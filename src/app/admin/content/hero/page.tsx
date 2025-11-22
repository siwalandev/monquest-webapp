"use client";

import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, rectSortingStrategy } from "@dnd-kit/sortable";
import DraggableCard from "@/components/ui/DraggableCard";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import IconPicker from "@/components/ui/IconPicker";
import { IoAdd, IoEye, IoSave } from "react-icons/io5";
import * as Icons from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { nanoid } from "nanoid";
import { authFetch } from "@/lib/fetch";

interface CTAButton {
  id: string;
  text: string;
  icon: string;
  variant: "primary" | "secondary" | "outline";
  link: string;
  order: number;
}

interface Stat {
  id: string;
  value: string;
  label: string;
  icon?: string;
  order: number;
}

interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  ctaButtons: CTAButton[];
  stats: Stat[];
}

export default function HeroContentPage() {
  const { user } = useAuth();
  const [heroData, setHeroData] = useState<HeroData>({
    title: "",
    subtitle: "",
    description: "",
    ctaButtons: [],
    stats: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // CTA Modal states
  const [ctaModalOpen, setCtaModalOpen] = useState(false);
  const [editingCta, setEditingCta] = useState<CTAButton | null>(null);
  const [ctaForm, setCtaForm] = useState({
    text: "",
    icon: "IoRocket",
    variant: "primary" as "primary" | "secondary" | "outline",
    link: "",
  });
  
  // Stat Modal states
  const [statModalOpen, setStatModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<Stat | null>(null);
  const [statForm, setStatForm] = useState({
    value: "",
    label: "",
    icon: "",
  });
  
  // Icon Picker states
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconPickerTarget, setIconPickerTarget] = useState<"cta" | "stat">("cta");
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ 
    isOpen: boolean; 
    type: "cta" | "stat"; 
    item: any 
  }>({ isOpen: false, type: "cta", item: null });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      const response = await authFetch("/api/content/hero");
      const result = await response.json();
      
      if (result.success) {
        const data = result.data.data;
        setHeroData({
          title: data.title || "",
          subtitle: data.subtitle || "",
          description: data.description || "",
          ctaButtons: data.ctaButtons || [],
          stats: data.stats || [],
        });
      } else {
        toast.error("Failed to load hero content");
      }
    } catch (error) {
      console.error("Fetch hero error:", error);
      toast.error("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  };

  const saveHeroData = async () => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setIsSaving(true);
    try {
      const response = await authFetch("/api/content/hero", {
        method: "PUT",
        body: JSON.stringify({
          data: heroData,
          userId: user.id,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Hero content saved successfully!");
      } else {
        toast.error(result.error || "Failed to save content");
      }
    } catch (error) {
      console.error("Save hero error:", error);
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  };

  // CTA Functions
  const handleCtaDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = heroData.ctaButtons.findIndex((c) => c.id === active.id);
      const newIndex = heroData.ctaButtons.findIndex((c) => c.id === over.id);
      const reordered = arrayMove(heroData.ctaButtons, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        order: idx,
      }));
      setHeroData({ ...heroData, ctaButtons: reordered });
    }
  };

  const openAddCtaModal = () => {
    setEditingCta(null);
    setCtaForm({ text: "", icon: "IoRocket", variant: "primary", link: "" });
    setCtaModalOpen(true);
  };

  const openEditCtaModal = (cta: CTAButton) => {
    setEditingCta(cta);
    setCtaForm({ text: cta.text, icon: cta.icon, variant: cta.variant, link: cta.link });
    setCtaModalOpen(true);
  };

  const handleCtaSubmit = () => {
    if (!ctaForm.text || !ctaForm.link) {
      toast.error("Please fill all required fields");
      return;
    }

    if (heroData.ctaButtons.length >= 3 && !editingCta) {
      toast.error("Maximum 3 CTA buttons allowed");
      return;
    }

    let updatedButtons: CTAButton[];
    if (editingCta) {
      updatedButtons = heroData.ctaButtons.map((c) =>
        c.id === editingCta.id ? { ...editingCta, ...ctaForm } : c
      );
    } else {
      const newCta: CTAButton = {
        id: nanoid(),
        ...ctaForm,
        order: heroData.ctaButtons.length,
      };
      updatedButtons = [...heroData.ctaButtons, newCta];
    }

    setHeroData({ ...heroData, ctaButtons: updatedButtons });
    setCtaModalOpen(false);
    toast.success(editingCta ? "CTA updated" : "CTA added");
  };

  const handleDeleteCta = () => {
    if (!deleteConfirm.item) return;
    const updated = heroData.ctaButtons
      .filter((c) => c.id !== deleteConfirm.item.id)
      .map((c, idx) => ({ ...c, order: idx }));
    setHeroData({ ...heroData, ctaButtons: updated });
    setDeleteConfirm({ isOpen: false, type: "cta", item: null });
    toast.success("CTA deleted");
  };

  // Stat Functions
  const handleStatDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = heroData.stats.findIndex((s) => s.id === active.id);
      const newIndex = heroData.stats.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(heroData.stats, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        order: idx,
      }));
      setHeroData({ ...heroData, stats: reordered });
    }
  };

  const openAddStatModal = () => {
    setEditingStat(null);
    setStatForm({ value: "", label: "", icon: "" });
    setStatModalOpen(true);
  };

  const openEditStatModal = (stat: Stat) => {
    setEditingStat(stat);
    setStatForm({ value: stat.value, label: stat.label, icon: stat.icon || "" });
    setStatModalOpen(true);
  };

  const handleStatSubmit = () => {
    if (!statForm.value || !statForm.label) {
      toast.error("Please fill all required fields");
      return;
    }

    if (heroData.stats.length >= 6 && !editingStat) {
      toast.error("Maximum 6 stats allowed");
      return;
    }

    let updatedStats: Stat[];
    if (editingStat) {
      updatedStats = heroData.stats.map((s) =>
        s.id === editingStat.id ? { ...editingStat, ...statForm } : s
      );
    } else {
      const newStat: Stat = {
        id: nanoid(),
        ...statForm,
        order: heroData.stats.length,
      };
      updatedStats = [...heroData.stats, newStat];
    }

    setHeroData({ ...heroData, stats: updatedStats });
    setStatModalOpen(false);
    toast.success(editingStat ? "Stat updated" : "Stat added");
  };

  const handleDeleteStat = () => {
    if (!deleteConfirm.item) return;
    const updated = heroData.stats
      .filter((s) => s.id !== deleteConfirm.item.id)
      .map((s, idx) => ({ ...s, order: idx }));
    setHeroData({ ...heroData, stats: updated });
    setDeleteConfirm({ isOpen: false, type: "stat", item: null });
    toast.success("Stat deleted");
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
          <h1 className="text-3xl text-white font-bold mb-2">Edit Hero Section</h1>
          <p className="text-sm text-gray-400">Update main landing page hero content</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.open("/", "_blank")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium transition-all duration-100"
          >
            <IoEye className="text-xl" />
            Preview
          </button>
          <button
            onClick={() => saveHeroData()}
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
        <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
          <input
            type="text"
            value={heroData.title}
            onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-pixel-primary focus:outline-none transition-colors duration-100"
            placeholder="MONQUEST"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Subtitle *</label>
          <input
            type="text"
            value={heroData.subtitle}
            onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-pixel-primary focus:outline-none transition-colors duration-100"
            placeholder="Defend Your Kingdom in Epic Pixel-Art Tower Defense"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
          <textarea
            value={heroData.description}
            onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-pixel-primary focus:outline-none transition-colors duration-100 resize-none"
            placeholder="Build towers, summon heroes, and conquer waves of monsters..."
          />
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="bg-gray-900 border-2 border-gray-800 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            CTA Buttons <span className="text-sm text-gray-500">({heroData.ctaButtons.length}/3)</span>
          </h2>
          <button
            onClick={openAddCtaModal}
            disabled={heroData.ctaButtons.length >= 3}
            className="flex items-center gap-2 px-3 py-1.5 bg-pixel-primary hover:brightness-110 text-white text-sm font-medium transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoAdd className="text-lg" />
            Add Button
          </button>
        </div>

        {heroData.ctaButtons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No CTA buttons yet. Add your first button!
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCtaDragEnd}>
            <SortableContext items={heroData.ctaButtons.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {heroData.ctaButtons.map((cta) => (
                  <DraggableCard
                    key={cta.id}
                    id={cta.id}
                    onEdit={() => openEditCtaModal(cta)}
                    onDelete={() => setDeleteConfirm({ isOpen: true, type: "cta", item: cta })}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-gray-800 ${
                        cta.variant === 'primary' ? 'text-pixel-primary' :
                        cta.variant === 'secondary' ? 'text-pixel-secondary' :
                        'text-pixel-accent'
                      }`}>
                        {getIcon(cta.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-white">{cta.text}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-gray-800 ${
                            cta.variant === 'primary' ? 'text-pixel-primary' :
                            cta.variant === 'secondary' ? 'text-pixel-secondary' :
                            'text-pixel-accent'
                          }`}>
                            {cta.variant}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{cta.link}</p>
                      </div>
                    </div>
                  </DraggableCard>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Stats */}
      <div className="bg-gray-900 border-2 border-gray-800 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            Statistics <span className="text-sm text-gray-500">({heroData.stats.length}/6)</span>
          </h2>
          <button
            onClick={openAddStatModal}
            disabled={heroData.stats.length >= 6}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoAdd className="text-lg" />
            Add Stat
          </button>
        </div>

        {heroData.stats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No statistics yet. Add your first stat!
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleStatDragEnd}>
            <SortableContext items={heroData.stats.map((s) => s.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {heroData.stats.map((stat) => (
                  <DraggableCard
                    key={stat.id}
                    id={stat.id}
                    onEdit={() => openEditStatModal(stat)}
                    onDelete={() => setDeleteConfirm({ isOpen: true, type: "stat", item: stat })}
                  >
                    <div>
                      <div className="text-xl font-bold text-pixel-primary mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  </DraggableCard>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* CTA Modal */}
      <Modal
        isOpen={ctaModalOpen}
        onClose={() => setCtaModalOpen(false)}
        title={editingCta ? "Edit CTA Button" : "Add CTA Button"}
        size="md"
        footer={
          <>
            <button
              onClick={() => setCtaModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100"
            >
              Cancel
            </button>
            <button
              onClick={handleCtaSubmit}
              className="px-4 py-2 text-sm font-medium bg-pixel-primary hover:brightness-110 text-white transition-all duration-100"
            >
              {editingCta ? "Update" : "Add"} CTA
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Icon</label>
            <button
              onClick={() => {
                setIconPickerTarget("cta");
                setIconPickerOpen(true);
              }}
              className="w-full p-4 bg-gray-800 border-2 border-gray-700 hover:border-gray-600 text-white flex items-center gap-3 transition-all duration-100"
            >
              {getIcon(ctaForm.icon)}
              <span>{ctaForm.icon}</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Text *</label>
            <input
              type="text"
              value={ctaForm.text}
              onChange={(e) => setCtaForm({ ...ctaForm, text: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-pixel-primary focus:outline-none transition-colors duration-100"
              placeholder="Play Now"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Link *</label>
            <input
              type="text"
              value={ctaForm.link}
              onChange={(e) => setCtaForm({ ...ctaForm, link: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-pixel-primary focus:outline-none transition-colors duration-100"
              placeholder="/play or https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Variant</label>
            <div className="grid grid-cols-3 gap-2">
              {(["primary", "secondary", "outline"] as const).map((variant) => (
                <button
                  key={variant}
                  onClick={() => setCtaForm({ ...ctaForm, variant })}
                  className={`
                    p-3 border-2 transition-all duration-100 text-sm font-medium capitalize bg-gray-800
                    ${ctaForm.variant === variant
                      ? variant === 'primary' ? 'border-pixel-primary text-pixel-primary' :
                        variant === 'secondary' ? 'border-pixel-secondary text-pixel-secondary' :
                        'border-pixel-accent text-pixel-accent'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                    }
                  `}
                >
                  {variant}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Stat Modal */}
      <Modal
        isOpen={statModalOpen}
        onClose={() => setStatModalOpen(false)}
        title={editingStat ? "Edit Statistic" : "Add Statistic"}
        size="md"
        footer={
          <>
            <button
              onClick={() => setStatModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100"
            >
              Cancel
            </button>
            <button
              onClick={handleStatSubmit}
              className="px-4 py-2 text-sm font-medium bg-pixel-primary hover:brightness-110 text-white transition-all duration-100"
            >
              {editingStat ? "Update" : "Add"} Stat
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Value *</label>
            <input
              type="text"
              value={statForm.value}
              onChange={(e) => setStatForm({ ...statForm, value: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-pixel-primary focus:outline-none transition-colors duration-100"
              placeholder="1000+ or 24/7"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Label *</label>
            <input
              type="text"
              value={statForm.label}
              onChange={(e) => setStatForm({ ...statForm, label: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white focus:border-pixel-primary focus:outline-none transition-colors duration-100"
              placeholder="Players or Online"
            />
          </div>
        </div>
      </Modal>

      {/* Icon Picker */}
      <IconPicker
        isOpen={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        onSelect={(iconName) => {
          if (iconPickerTarget === "cta") {
            setCtaForm({ ...ctaForm, icon: iconName });
          } else {
            setStatForm({ ...statForm, icon: iconName });
          }
        }}
        selectedIcon={iconPickerTarget === "cta" ? ctaForm.icon : statForm.icon}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, type: "cta", item: null })}
        onConfirm={deleteConfirm.type === "cta" ? handleDeleteCta : handleDeleteStat}
        title={`Delete ${deleteConfirm.type === "cta" ? "CTA Button" : "Statistic"}?`}
        message={`Are you sure you want to delete "${deleteConfirm.item?.text || deleteConfirm.item?.label}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

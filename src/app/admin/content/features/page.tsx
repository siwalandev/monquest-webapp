"use client";

import { useState } from "react";
import PixelCard from "@/components/ui/PixelCard";
import PixelInput from "@/components/ui/PixelInput";
import PixelTextarea from "@/components/ui/PixelTextarea";
import PixelButton from "@/components/ui/PixelButton";
import { IoSave, IoAdd, IoTrash } from "react-icons/io5";
import featuresData from "@/data/features.json";

export default function FeaturesContentPage() {
  const [formData, setFormData] = useState(featuresData);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Features saved successfully!");
    }, 1000);
  };

  const handleFeatureChange = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addFeature = () => {
    const newFeature = {
      id: String(formData.items.length + 1),
      icon: "IoHome",
      title: "New Feature",
      description: "Feature description",
      color: "primary" as const,
    };
    setFormData({ ...formData, items: [...formData.items, newFeature] });
  };

  const deleteFeature = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b-4 border-pixel-primary pb-6">
        <div>
          <h1 className="text-3xl text-pixel-primary font-pixel text-shadow-pixel mb-2">
            Manage Features
          </h1>
          <p className="text-sm text-pixel-light/70">
            Add, edit, or remove game features
          </p>
        </div>
        <div className="flex gap-3">
          <PixelButton variant="secondary" onClick={addFeature}>
            <IoAdd className="inline mr-2" /> Add Feature
          </PixelButton>
          <PixelButton 
            variant="primary" 
            onClick={handleSave}
            disabled={isSaving}
          >
            <IoSave className="inline mr-2" /> 
            {isSaving ? "Saving..." : "Save Changes"}
          </PixelButton>
        </div>
      </div>

      {/* Section Info */}
      <PixelCard>
        <div className="space-y-4">
          <h2 className="text-lg text-pixel-primary font-pixel mb-4">
            Section Info
          </h2>
          <PixelInput
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <PixelInput
            label="Subtitle"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          />
        </div>
      </PixelCard>

      {/* Features List */}
      <div className="space-y-4">
        {formData.items.map((feature, index) => (
          <PixelCard key={feature.id} glowColor={feature.color as "primary" | "secondary" | "accent"}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base text-pixel-primary font-pixel">
                  Feature #{index + 1}
                </h3>
                <PixelButton 
                  size="sm" 
                  variant="secondary"
                  onClick={() => deleteFeature(index)}
                >
                  <IoTrash className="inline mr-1" /> Delete
                </PixelButton>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PixelInput
                  label="Icon Name"
                  value={feature.icon}
                  onChange={(e) => handleFeatureChange(index, "icon", e.target.value)}
                  placeholder="IoHome, IoShield, etc."
                />
                <PixelInput
                  label="Color"
                  value={feature.color}
                  onChange={(e) => handleFeatureChange(index, "color", e.target.value)}
                  placeholder="primary, secondary, accent"
                />
              </div>

              <PixelInput
                label="Title"
                value={feature.title}
                onChange={(e) => handleFeatureChange(index, "title", e.target.value)}
              />

              <PixelTextarea
                label="Description"
                value={feature.description}
                onChange={(e) => handleFeatureChange(index, "description", e.target.value)}
                rows={3}
              />
            </div>
          </PixelCard>
        ))}
      </div>
    </div>
  );
}

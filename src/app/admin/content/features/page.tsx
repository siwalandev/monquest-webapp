"use client";

import { useState, useEffect } from "react";
import PixelCard from "@/components/ui/PixelCard";
import PixelInput from "@/components/ui/PixelInput";
import PixelTextarea from "@/components/ui/PixelTextarea";
import PixelButton from "@/components/ui/PixelButton";
import { IoSave, IoAdd, IoTrash } from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function FeaturesContentPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/content/features");
        const result = await response.json();
        
        if (result.success) {
          setFormData(result.data.data);
        } else {
          toast.error("Failed to load features content");
        }
      } catch (error) {
        console.error("Fetch features content error:", error);
        toast.error("Failed to load content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleSave = async () => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/content/features", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: formData,
          userId: user.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Features saved successfully!");
      } else {
        toast.error(result.error || "Failed to save content");
      }
    } catch (error) {
      console.error("Save features content error:", error);
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
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
    const newItems = formData.items.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-pixel-light">Loading...</div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-pixel-light">No content found</div>
      </div>
    );
  }

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
        {formData.items.map((feature: any, index: number) => (
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

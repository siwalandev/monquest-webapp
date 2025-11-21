"use client";

import { useState, useEffect } from "react";
import PixelCard from "@/components/ui/PixelCard";
import PixelInput from "@/components/ui/PixelInput";
import PixelTextarea from "@/components/ui/PixelTextarea";
import PixelButton from "@/components/ui/PixelButton";
import { IoSave, IoEye } from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function HeroContentPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch hero content from database
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/content/hero");
        const result = await response.json();
        
        if (result.success) {
          setFormData(result.data.data);
        } else {
          toast.error("Failed to load hero content");
        }
      } catch (error) {
        console.error("Fetch hero content error:", error);
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
      const response = await fetch("/api/content/hero", {
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
        toast.success("Hero content saved successfully!");
      } else {
        toast.error(result.error || "Failed to save content");
      }
    } catch (error) {
      console.error("Save hero content error:", error);
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleStatChange = (index: number, field: string, value: string) => {
    const newStats = [...formData.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setFormData({ ...formData, stats: newStats });
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
            Edit Hero Section
          </h1>
          <p className="text-sm text-pixel-light/70">
            Update the main hero section content
          </p>
        </div>
        <div className="flex gap-3">
          <PixelButton variant="secondary">
            <IoEye className="inline mr-2" /> Preview
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

      {/* Form */}
      <PixelCard>
        <div className="space-y-6">
          <h2 className="text-lg text-pixel-primary font-pixel mb-4">
            Main Content
          </h2>

          <PixelInput
            label="Title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Enter main title"
          />

          <PixelInput
            label="Subtitle"
            value={formData.subtitle}
            onChange={(e) => handleInputChange("subtitle", e.target.value)}
            placeholder="Enter subtitle"
          />

          <PixelTextarea
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Enter description"
            rows={4}
          />
        </div>
      </PixelCard>

      {/* CTA Buttons */}
      <PixelCard>
        <div className="space-y-6">
          <h2 className="text-lg text-pixel-primary font-pixel mb-4">
            Call-to-Action Buttons
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <PixelInput
              label="Primary Button Text"
              value={formData.ctaPrimary.text}
              onChange={(e) => 
                setFormData({
                  ...formData,
                  ctaPrimary: { ...formData.ctaPrimary, text: e.target.value }
                })
              }
            />
            <PixelInput
              label="Secondary Button Text"
              value={formData.ctaSecondary.text}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ctaSecondary: { ...formData.ctaSecondary, text: e.target.value }
                })
              }
            />
          </div>
        </div>
      </PixelCard>

      {/* Stats */}
      <PixelCard>
        <div className="space-y-6">
          <h2 className="text-lg text-pixel-primary font-pixel mb-4">
            Statistics
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {formData.stats.map((stat: any, index: number) => (
              <div key={index} className="space-y-4 p-4 border-2 border-pixel-primary/30">
                <h3 className="text-sm text-pixel-secondary font-pixel">
                  Stat #{index + 1}
                </h3>
                <PixelInput
                  label="Value"
                  value={stat.value}
                  onChange={(e) => handleStatChange(index, "value", e.target.value)}
                  placeholder="e.g., 1000+"
                />
                <PixelInput
                  label="Label"
                  value={stat.label}
                  onChange={(e) => handleStatChange(index, "label", e.target.value)}
                  placeholder="e.g., Players"
                />
              </div>
            ))}
          </div>
        </div>
      </PixelCard>
    </div>
  );
}

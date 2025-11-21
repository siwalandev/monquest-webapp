"use client";

import { useState, useEffect } from "react";
import PixelCard from "@/components/ui/PixelCard";
import PixelInput from "@/components/ui/PixelInput";
import PixelTextarea from "@/components/ui/PixelTextarea";
import PixelButton from "@/components/ui/PixelButton";
import { IoSave, IoAdd, IoTrash } from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function HowItWorksContentPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/content/how-it-works");
        const result = await response.json();
        
        if (result.success) {
          setFormData(result.data.data);
        } else {
          toast.error("Failed to load how it works content");
        }
      } catch (error) {
        console.error("Fetch how it works content error:", error);
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
      const response = await fetch("/api/content/how-it-works", {
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
        toast.success("How It Works saved successfully!");
      } else {
        toast.error(result.error || "Failed to save content");
      }
    } catch (error) {
      console.error("Save how it works content error:", error);
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStepChange = (index: number, field: string, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const addStep = () => {
    const newStep = {
      id: String(formData.steps.length + 1),
      number: String(formData.steps.length + 1),
      icon: "IoLink",
      title: "New Step",
      description: "Step description",
    };
    setFormData({ ...formData, steps: [...formData.steps, newStep] });
  };

  const deleteStep = (index: number) => {
    const newSteps = formData.steps.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, steps: newSteps });
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
            Edit How It Works
          </h1>
          <p className="text-sm text-pixel-light/70">
            Update the step-by-step guide
          </p>
        </div>
        <div className="flex gap-3">
          <PixelButton variant="secondary" onClick={addStep}>
            <IoAdd className="inline mr-2" /> Add Step
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

      {/* Steps List */}
      <div className="space-y-4">
        {formData.steps.map((step: any, index: number) => (
          <PixelCard key={step.id} glowColor="secondary">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base text-pixel-primary font-pixel">
                  Step {step.number}
                </h3>
                <PixelButton 
                  size="sm" 
                  variant="secondary"
                  onClick={() => deleteStep(index)}
                >
                  <IoTrash className="inline mr-1" /> Delete
                </PixelButton>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PixelInput
                  label="Icon Name"
                  value={step.icon}
                  onChange={(e) => handleStepChange(index, "icon", e.target.value)}
                  placeholder="IoLink, IoCompass, etc."
                />
                <PixelInput
                  label="Step Number"
                  value={step.number}
                  onChange={(e) => handleStepChange(index, "number", e.target.value)}
                  type="number"
                />
              </div>

              <PixelInput
                label="Title"
                value={step.title}
                onChange={(e) => handleStepChange(index, "title", e.target.value)}
              />

              <PixelTextarea
                label="Description"
                value={step.description}
                onChange={(e) => handleStepChange(index, "description", e.target.value)}
                rows={3}
              />
            </div>
          </PixelCard>
        ))}
      </div>
    </div>
  );
}

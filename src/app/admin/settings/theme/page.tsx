"use client";

import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import {
  IoColorPalette,
  IoCheckmark,
  IoTrash,
  IoAdd,
  IoRefresh,
  IoShieldCheckmark,
  IoPencil,
  IoSave,
} from "react-icons/io5";
import toast from "react-hot-toast";
import PermissionGuard from "@/components/PermissionGuard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";
import PixelButton from "@/components/ui/PixelButton";
import PixelCard from "@/components/ui/PixelCard";
import PixelInput from "@/components/ui/PixelInput";
import { authFetch } from "@/lib/fetch";
import { useAuth } from "@/contexts/AuthContext";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  darker: string;
  light: string;
}

interface ThemePreset {
  id: string;
  name: string;
  slug: string;
  colors: ThemeColors;
  isDefault: boolean;
  isSystem: boolean;
}

const COLOR_LABELS = {
  primary: "Primary Color",
  secondary: "Secondary Color",
  accent: "Accent Color",
  dark: "Dark Background",
  darker: "Darker Background",
  light: "Light Text",
};

export default function ThemeSettingsPage() {
  const { user, refreshUser } = useAuth();
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [activePresetSlug, setActivePresetSlug] = useState<string>("default");
  const [editingColors, setEditingColors] = useState<ThemeColors>({
    primary: "#4ADE80",
    secondary: "#60A5FA",
    accent: "#FB923C",
    dark: "#1E293B",
    darker: "#0F172A",
    light: "#F1F5F9",
  });
  const [originalColors, setOriginalColors] = useState<ThemeColors>(editingColors);
  const [activeColorPicker, setActiveColorPicker] = useState<keyof ThemeColors | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; preset: ThemePreset | null }>({
    show: false,
    preset: null,
  });
  const [editingPreset, setEditingPreset] = useState<ThemePreset | null>(null);
  const [hasRefreshed, setHasRefreshed] = useState(false);

  useEffect(() => {
    fetchPresets();
    fetchActivePreset();
  }, []);

  useEffect(() => {
    // Apply colors to CSS variables for live preview
    Object.entries(editingColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--pixel-${key}`, value);
    });
  }, [editingColors]);

  const fetchPresets = async () => {
    try {
      const response = await authFetch("/api/theme-presets");
      
      // Check if 403 and hasn't refreshed yet
      if (response.status === 403 && !hasRefreshed) {
        console.log('🔄 Got 403, refreshing user permissions...');
        setHasRefreshed(true);
        await refreshUser();
        // Retry after 1 second
        setTimeout(() => {
          fetchPresets();
          fetchActivePreset();
        }, 1000);
        return;
      }
      
      const result = await response.json();
      if (result.success) {
        setPresets(result.data);
      } else if (result.debug) {
        console.error('Permission denied:', result.debug);
        toast.error(`Access denied: ${result.debug.role} role missing settings.view`);
      }
    } catch (error) {
      console.error("Failed to fetch presets:", error);
      toast.error("Failed to load theme presets");
    }
  };

  const fetchActivePreset = async () => {
    try {
      const response = await authFetch("/api/settings/active_theme_preset");
      
      // Check if 403 - will be retried after refreshUser() in fetchPresets
      if (response.status === 403) {
        return;
      }
      
      const result = await response.json();
      if (result.success) {
        // Extract slug from value (which is stored as {slug: "preset-name"})
        const slug = typeof result.data.value === 'string' 
          ? result.data.value 
          : result.data.value?.slug || 'default';
        setActivePresetSlug(slug);
        
        // Load active preset colors
        const presetResponse = await authFetch(`/api/theme-presets/${slug}`);
        const presetResult = await presetResponse.json();
        if (presetResult.success) {
          setEditingColors(presetResult.data.colors);
          setOriginalColors(presetResult.data.colors);
          setEditingPreset(presetResult.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch active preset:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = async (preset: ThemePreset) => {
    try {
      const response = await authFetch(`/api/theme-presets/${preset.slug}/apply`, {
        method: "POST",
      });
      const result = await response.json();
      
      if (result.success) {
        setActivePresetSlug(preset.slug);
        setEditingColors(preset.colors);
        setOriginalColors(preset.colors);
        setEditingPreset(preset);
        toast.success(`Applied "${preset.name}" theme`);
      } else {
        toast.error(result.error || "Failed to apply preset");
      }
    } catch (error) {
      console.error("Apply preset error:", error);
      toast.error("Failed to apply preset");
    }
  };

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setEditingColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleHexInputChange = (key: keyof ThemeColors, value: string) => {
    // Validate hex format
    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
      setEditingColors((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleSaveChanges = async () => {
    if (editingPreset?.isSystem) {
      setShowSaveModal(true);
      return;
    }

    if (!editingPreset) {
      setShowSaveModal(true);
      return;
    }

    // Update existing custom preset
    setIsSaving(true);
    try {
      const response = await authFetch(`/api/theme-presets/${editingPreset.slug}`, {
        method: "PUT",
        body: JSON.stringify({ colors: editingColors }),
      });
      const result = await response.json();
      
      if (result.success) {
        setOriginalColors(editingColors);
        await fetchPresets();
        toast.success("Theme colors updated!");
      } else {
        toast.error(result.error || "Failed to save changes");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAsNewPreset = async () => {
    if (!newPresetName.trim()) {
      toast.error("Please enter a preset name");
      return;
    }

    setIsSaving(true);
    try {
      const response = await authFetch("/api/theme-presets", {
        method: "POST",
        body: JSON.stringify({
          name: newPresetName.trim(),
          colors: editingColors,
        }),
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchPresets();
        await handleApplyPreset(result.data);
        setShowSaveModal(false);
        setNewPresetName("");
        toast.success(`Created preset "${result.data.name}"`);
      } else {
        toast.error(result.error || "Failed to create preset");
      }
    } catch (error) {
      console.error("Create preset error:", error);
      toast.error("Failed to create preset");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePreset = async (preset: ThemePreset) => {
    try {
      const response = await authFetch(`/api/theme-presets/${preset.slug}`, {
        method: "DELETE",
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchPresets();
        
        // If deleted preset was active, switch to default
        if (preset.slug === activePresetSlug) {
          const defaultPreset = presets.find((p) => p.slug === "default");
          if (defaultPreset) {
            await handleApplyPreset(defaultPreset);
          }
        }
        
        toast.success("Preset deleted");
      } else {
        toast.error(result.error || "Failed to delete preset");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete preset");
    } finally {
      setDeleteConfirm({ show: false, preset: null });
    }
  };

  const handleReset = () => {
    setEditingColors(originalColors);
    toast.success("Colors reset");
  };

  const hasChanges = JSON.stringify(editingColors) !== JSON.stringify(originalColors);

  if (isLoading) {
    return (
      <PermissionGuard permissions="settings.view">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading theme settings...</div>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permissions="settings.view">
      <div className="space-y-6">
        {/* Header - Match Users Page Style */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b-2 border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <IoColorPalette className="text-3xl text-green-400" />
              <h1 className="text-2xl sm:text-3xl text-white font-bold">Theme Settings</h1>
            </div>
            <p className="text-sm text-gray-400">
              Customize your brand colors and manage theme presets
            </p>
          </div>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Preset List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 border-2 border-gray-700 p-4">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <IoShieldCheckmark className="text-blue-400" />
                Theme Presets
              </h2>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className={`p-3 border-2 transition-all duration-200 cursor-pointer ${
                      preset.slug === activePresetSlug
                        ? "border-pixel-primary bg-pixel-primary/10"
                        : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                    }`}
                    onClick={() => handleApplyPreset(preset)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{preset.name}</span>
                        {preset.isSystem && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs border border-blue-500">
                            System
                          </span>
                        )}
                      </div>
                      {preset.slug === activePresetSlug && (
                        <IoCheckmark className="text-green-400 text-xl" />
                      )}
                    </div>
                    
                    {/* Color Preview */}
                    <div className="flex gap-1">
                      {Object.values(preset.colors).map((color, idx) => (
                        <div
                          key={idx}
                          className="flex-1 h-6 border border-gray-600"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    
                    {/* Actions */}
                    {!preset.isSystem && (
                      <div className="flex gap-2 mt-2">
                        <PixelButton
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingColors(preset.colors);
                            setEditingPreset(preset);
                            toast.success(`Editing "${preset.name}"`);
                          }}
                          className="flex-1 flex items-center justify-center gap-1"
                        >
                          <IoPencil /> Edit
                        </PixelButton>
                        <PixelButton
                          variant="accent"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({ show: true, preset });
                          }}
                          className="flex-1 flex items-center justify-center gap-1"
                        >
                          <IoTrash /> Delete
                        </PixelButton>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Color Editor */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 border-2 border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Color Editor</h2>
                {editingPreset && (
                  <div className="text-sm text-gray-400">
                    Editing: <span className="text-white font-medium">{editingPreset.name}</span>
                    {editingPreset.isSystem && (
                      <span className="ml-2 text-yellow-400">(Read-only)</span>
                    )}
                  </div>
                )}
              </div>

              {/* Color Pickers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {(Object.keys(COLOR_LABELS) as Array<keyof ThemeColors>).map((key) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      {COLOR_LABELS[key]}
                    </label>
                    
                    {/* Color Preview Box */}
                    <div
                      className="w-full h-16 border-2 border-gray-600 cursor-pointer hover:border-gray-500 transition-colors relative"
                      style={{ backgroundColor: editingColors[key] }}
                      onClick={() => setActiveColorPicker(activeColorPicker === key ? null : key)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="px-2 py-1 bg-black/50 text-white text-xs font-mono">
                          {editingColors[key]}
                        </span>
                      </div>
                    </div>

                    {/* Hex Input */}
                    <input
                      type="text"
                      value={editingColors[key]}
                      onChange={(e) => handleHexInputChange(key, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border-2 border-gray-700 text-white focus:border-pixel-primary focus:outline-none transition-colors duration-100 font-mono text-sm"
                      placeholder="#000000"
                      maxLength={7}
                    />

                    {/* Color Picker Popover */}
                    {activeColorPicker === key && (
                      <div className="relative z-10">
                        <div className="absolute top-0 left-0 p-3 bg-gray-900 border-2 border-gray-600 shadow-xl">
                          <HexColorPicker
                            color={editingColors[key]}
                            onChange={(color) => handleColorChange(key, color)}
                          />
                          <button
                            onClick={() => setActiveColorPicker(null)}
                            className="w-full mt-2 px-3 py-1 bg-gray-700 text-white hover:bg-gray-600 transition-colors text-sm"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <PermissionGuard permissions="settings.edit">
                <div className="flex flex-col sm:flex-row gap-3">
                  <PixelButton
                    variant="primary"
                    size="md"
                    onClick={handleSaveChanges}
                    disabled={!hasChanges || isSaving}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <IoSave />
                    {isSaving ? "Saving..." : editingPreset?.isSystem ? "Save as New Preset" : "Save Changes"}
                  </PixelButton>
                  
                  <PixelButton
                    variant="secondary"
                    size="md"
                    onClick={() => setShowSaveModal(true)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <IoAdd />
                    Save as New Preset
                  </PixelButton>
                  
                  <PixelButton
                    variant="accent"
                    size="md"
                    onClick={handleReset}
                    disabled={!hasChanges}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <IoRefresh />
                    Reset
                  </PixelButton>
                </div>
              </PermissionGuard>
            </div>

            {/* Live Preview Info */}
            <div className="mt-4 p-4 bg-blue-500/10 border-2 border-blue-500 text-blue-400 text-sm">
              <strong>💡 Live Preview:</strong> Color changes are applied instantly. Save to persist your changes.
            </div>
          </div>
        </div>

        {/* Save as New Preset Modal */}
        {showSaveModal && (
          <Modal
            isOpen={showSaveModal}
            onClose={() => {
              setShowSaveModal(false);
              setNewPresetName("");
            }}
            title="Save as New Preset"
          >
            <div className="space-y-4">
              <PixelInput
                label="Preset Name"
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="My Custom Theme"
                maxLength={50}
                autoFocus
              />

              <div className="flex gap-3">
                <PixelButton
                  variant="primary"
                  size="md"
                  onClick={handleSaveAsNewPreset}
                  disabled={!newPresetName.trim() || isSaving}
                  className="flex-1"
                >
                  {isSaving ? "Creating..." : "Create Preset"}
                </PixelButton>
                <PixelButton
                  variant="accent"
                  size="md"
                  onClick={() => {
                    setShowSaveModal(false);
                    setNewPresetName("");
                  }}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancel
                </PixelButton>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && deleteConfirm.preset && (
          <ConfirmModal
            isOpen={deleteConfirm.show}
            onClose={() => setDeleteConfirm({ show: false, preset: null })}
            onConfirm={() => handleDeletePreset(deleteConfirm.preset!)}
            title="Delete Theme Preset"
            message={`Are you sure you want to delete "${deleteConfirm.preset.name}"? This action cannot be undone.`}
            variant="danger"
          />
        )}
      </div>
    </PermissionGuard>
  );
}

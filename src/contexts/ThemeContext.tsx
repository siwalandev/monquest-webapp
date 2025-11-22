"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authFetch } from "@/lib/fetch";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  darker: string;
  light: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  activePreset: string;
  updateColors: (colors: ThemeColors) => void;
  refreshTheme: () => Promise<void>;
}

const defaultColors: ThemeColors = {
  primary: "#4ADE80",
  secondary: "#60A5FA",
  accent: "#FB923C",
  dark: "#1E293B",
  darker: "#0F172A",
  light: "#F1F5F9",
};

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  activePreset: "default",
  updateColors: () => {},
  refreshTheme: async () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [activePreset, setActivePreset] = useState<string>("default");
  const [isLoaded, setIsLoaded] = useState(false);

  const applyColorsToCSS = (themeColors: ThemeColors) => {
    // Apply colors to CSS variables on document root
    Object.entries(themeColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--pixel-${key}`, value);
    });
  };

  const fetchTheme = async () => {
    try {
      // Check if user is authenticated (optional for public theme access)
      const userId = typeof window !== 'undefined' ? localStorage.getItem('admin_user') : null;
      
      // If not authenticated, use default colors (public/landing page scenario)
      if (!userId) {
        console.log('🎨 ThemeContext: No user found, using default colors');
        applyColorsToCSS(defaultColors);
        setIsLoaded(true);
        return;
      }

      // Fetch active preset setting
      const settingResponse = await authFetch("/api/settings/active_theme_preset");
      
      if (!settingResponse.ok) {
        console.warn("Failed to fetch active theme preset, using defaults");
        applyColorsToCSS(defaultColors);
        setIsLoaded(true);
        return;
      }

      const settingResult = await settingResponse.json();
      const presetSlug = settingResult.success ? settingResult.data.value : "default";
      setActivePreset(presetSlug);

      // Fetch preset colors
      const presetResponse = await authFetch(`/api/theme-presets/${presetSlug}`);
      
      if (!presetResponse.ok) {
        console.warn("Failed to fetch theme preset, using defaults");
        applyColorsToCSS(defaultColors);
        setIsLoaded(true);
        return;
      }

      const presetResult = await presetResponse.json();
      
      if (presetResult.success && presetResult.data.colors) {
        const themeColors = presetResult.data.colors;
        setColors(themeColors);
        applyColorsToCSS(themeColors);
      } else {
        applyColorsToCSS(defaultColors);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
      applyColorsToCSS(defaultColors);
    } finally {
      setIsLoaded(true);
    }
  };

  const refreshTheme = async () => {
    await fetchTheme();
  };

  const updateColors = (newColors: ThemeColors) => {
    setColors(newColors);
    applyColorsToCSS(newColors);
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  // Inject CSS variables into style tag for SSR compatibility
  const cssVariables = Object.entries(colors)
    .map(([key, value]) => `--pixel-${key}: ${value};`)
    .join("\n    ");

  return (
    <ThemeContext.Provider value={{ colors, activePreset, updateColors, refreshTheme }}>
      {/* Inject CSS variables */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              ${cssVariables}
            }
          `,
        }}
      />
      {children}
    </ThemeContext.Provider>
  );
}

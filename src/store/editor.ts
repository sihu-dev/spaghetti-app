/**
 * Editor State Management with Zustand
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExtractedColor } from "@/lib/color/extraction";
import type { ColorScale } from "@/lib/color/ramp";
import type { ThemePalette } from "@/lib/color/darkmode";

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

export type PreviewTab = "buttons" | "forms" | "cards";
export type SidebarTab = "colors" | "accessibility" | "darkmode";

interface EditorState {
  // Images
  images: UploadedImage[];
  addImage: (image: UploadedImage) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;

  // Colors
  extractedColors: ExtractedColor[];
  setExtractedColors: (colors: ExtractedColor[]) => void;
  selectedColor: string | null;
  setSelectedColor: (color: string | null) => void;
  colorRamp: ColorScale | null;
  setColorRamp: (ramp: ColorScale | null) => void;

  // Theme
  themePalette: ThemePalette | null;
  setThemePalette: (palette: ThemePalette | null) => void;
  previewDarkMode: boolean;
  togglePreviewDarkMode: () => void;

  // UI State
  previewTab: PreviewTab;
  setPreviewTab: (tab: PreviewTab) => void;
  sidebarTab: SidebarTab;
  setSidebarTab: (tab: SidebarTab) => void;
  isDemoMode: boolean;
  setIsDemoMode: (isDemo: boolean) => void;

  // Loading States
  isExtracting: boolean;
  setIsExtracting: (isExtracting: boolean) => void;
  extractProgress: number;
  setExtractProgress: (progress: number) => void;
  isExporting: boolean;
  setIsExporting: (isExporting: boolean) => void;

  // Errors
  extractError: string | null;
  setExtractError: (error: string | null) => void;

  // Actions
  reset: () => void;
}

const initialState = {
  images: [],
  extractedColors: [],
  selectedColor: null,
  colorRamp: null,
  themePalette: null,
  previewDarkMode: false,
  previewTab: "buttons" as PreviewTab,
  sidebarTab: "colors" as SidebarTab,
  isDemoMode: false,
  isExtracting: false,
  extractProgress: 0,
  isExporting: false,
  extractError: null,
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      ...initialState,

      // Images
      addImage: (image) =>
        set((state) => ({ images: [...state.images, image] })),
      removeImage: (id) =>
        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
        })),
      clearImages: () => set({ images: [] }),

      // Colors
      setExtractedColors: (colors) => set({ extractedColors: colors }),
      setSelectedColor: (color) => set({ selectedColor: color }),
      setColorRamp: (ramp) => set({ colorRamp: ramp }),

      // Theme
      setThemePalette: (palette) => set({ themePalette: palette }),
      togglePreviewDarkMode: () =>
        set((state) => ({ previewDarkMode: !state.previewDarkMode })),

      // UI State
      setPreviewTab: (tab) => set({ previewTab: tab }),
      setSidebarTab: (tab) => set({ sidebarTab: tab }),
      setIsDemoMode: (isDemo) => set({ isDemoMode: isDemo }),

      // Loading States
      setIsExtracting: (isExtracting) => set({ isExtracting }),
      setExtractProgress: (progress) => set({ extractProgress: progress }),
      setIsExporting: (isExporting) => set({ isExporting }),

      // Errors
      setExtractError: (error) => set({ extractError: error }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: "spaghetti-editor",
      partialize: (state) => ({
        // Only persist selected color and color ramp
        selectedColor: state.selectedColor,
        colorRamp: state.colorRamp,
        previewDarkMode: state.previewDarkMode,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useSelectedColor = () =>
  useEditorStore((state) => state.selectedColor);
export const useColorRamp = () => useEditorStore((state) => state.colorRamp);
export const useThemePalette = () =>
  useEditorStore((state) => state.themePalette);
export const usePreviewDarkMode = () =>
  useEditorStore((state) => state.previewDarkMode);
export const useIsExtracting = () =>
  useEditorStore((state) => state.isExtracting);

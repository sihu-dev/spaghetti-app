/**
 * Editor State Management with Zustand
 * Includes project save/load and history management
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

// Project type for save/load
export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  selectedColor: string | null;
  colorRamp: ColorScale | null;
  themePalette: ThemePalette | null;
}

// History entry for undo/redo
interface HistoryEntry {
  selectedColor: string | null;
  colorRamp: ColorScale | null;
}

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

  // Project Management
  currentProjectId: string | null;
  currentProjectName: string;
  setProjectName: (name: string) => void;
  projects: Project[];
  saveProject: () => string;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;

  // History Management (Undo/Redo)
  history: HistoryEntry[];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Actions
  reset: () => void;
}

const MAX_HISTORY_LENGTH = 50;

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
  currentProjectId: null,
  currentProjectName: "Untitled Project",
  projects: [],
  history: [],
  historyIndex: -1,
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
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
      setSelectedColor: (color) => {
        get().pushHistory();
        set({ selectedColor: color });
      },
      setColorRamp: (ramp) => {
        get().pushHistory();
        set({ colorRamp: ramp });
      },

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

      // Project Management
      setProjectName: (name) => set({ currentProjectName: name }),

      saveProject: () => {
        const state = get();
        const id = state.currentProjectId || crypto.randomUUID();
        const now = new Date().toISOString();

        const project: Project = {
          id,
          name: state.currentProjectName,
          createdAt: state.projects.find(p => p.id === id)?.createdAt || now,
          updatedAt: now,
          selectedColor: state.selectedColor,
          colorRamp: state.colorRamp,
          themePalette: state.themePalette,
        };

        set((state) => ({
          currentProjectId: id,
          projects: [
            project,
            ...state.projects.filter(p => p.id !== id),
          ].slice(0, 20), // Keep max 20 projects
        }));

        return id;
      },

      loadProject: (id) => {
        const project = get().projects.find(p => p.id === id);
        if (project) {
          set({
            currentProjectId: project.id,
            currentProjectName: project.name,
            selectedColor: project.selectedColor,
            colorRamp: project.colorRamp,
            themePalette: project.themePalette,
            history: [],
            historyIndex: -1,
          });
        }
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter(p => p.id !== id),
          ...(state.currentProjectId === id ? {
            currentProjectId: null,
            currentProjectName: "Untitled Project",
          } : {}),
        }));
      },

      // History Management
      pushHistory: () => {
        const state = get();
        const entry: HistoryEntry = {
          selectedColor: state.selectedColor,
          colorRamp: state.colorRamp,
        };

        // Remove any redo history if we're not at the end
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(entry);

        // Limit history size
        if (newHistory.length > MAX_HISTORY_LENGTH) {
          newHistory.shift();
        }

        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          const entry = state.history[newIndex];
          set({
            historyIndex: newIndex,
            selectedColor: entry.selectedColor,
            colorRamp: entry.colorRamp,
          });
        }
      },

      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1;
          const entry = state.history[newIndex];
          set({
            historyIndex: newIndex,
            selectedColor: entry.selectedColor,
            colorRamp: entry.colorRamp,
          });
        }
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      // Reset
      reset: () => set({
        ...initialState,
        projects: get().projects, // Keep projects on reset
      }),
    }),
    {
      name: "spaghetti-editor",
      partialize: (state) => ({
        selectedColor: state.selectedColor,
        colorRamp: state.colorRamp,
        previewDarkMode: state.previewDarkMode,
        currentProjectId: state.currentProjectId,
        currentProjectName: state.currentProjectName,
        projects: state.projects,
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
export const useProjects = () =>
  useEditorStore((state) => state.projects);
export const useCanUndo = () =>
  useEditorStore((state) => state.canUndo());
export const useCanRedo = () =>
  useEditorStore((state) => state.canRedo());

/**
 * Demo Color Presets Configuration
 * Predefined color palettes for quick demonstration
 */

export interface ColorPreset {
  id: string;
  name: string;
  hex: string;
  description?: string;
  category?: "nature" | "warm" | "cool" | "neutral";
}

/**
 * Default demo presets
 */
export const DEMO_PRESETS: ColorPreset[] = [
  {
    id: "olive",
    name: "Olive",
    hex: "#5C6356",
    description: "자연스러운 올리브 그린",
    category: "nature",
  },
  {
    id: "terracotta",
    name: "Terracotta",
    hex: "#C87A5A",
    description: "따뜻한 테라코타",
    category: "warm",
  },
  {
    id: "ocean",
    name: "Ocean",
    hex: "#2E6B8A",
    description: "깊고 차분한 오션 블루",
    category: "cool",
  },
  {
    id: "berry",
    name: "Berry",
    hex: "#8B4A6B",
    description: "우아한 베리 퍼플",
    category: "warm",
  },
  {
    id: "coral",
    name: "Coral",
    hex: "#E07B6C",
    description: "생동감 있는 코랄 핑크",
    category: "warm",
  },
];

/**
 * Extended color presets for more options
 */
export const EXTENDED_PRESETS: ColorPreset[] = [
  ...DEMO_PRESETS,
  {
    id: "forest",
    name: "Forest",
    hex: "#2D5A4A",
    description: "깊은 숲의 그린",
    category: "nature",
  },
  {
    id: "slate",
    name: "Slate",
    hex: "#64748B",
    description: "모던한 슬레이트 그레이",
    category: "neutral",
  },
  {
    id: "amber",
    name: "Amber",
    hex: "#D97706",
    description: "따뜻한 앰버 오렌지",
    category: "warm",
  },
  {
    id: "indigo",
    name: "Indigo",
    hex: "#4F46E5",
    description: "선명한 인디고 블루",
    category: "cool",
  },
  {
    id: "rose",
    name: "Rose",
    hex: "#E11D48",
    description: "강렬한 로즈 레드",
    category: "warm",
  },
  {
    id: "teal",
    name: "Teal",
    hex: "#0D9488",
    description: "청록색 틸",
    category: "cool",
  },
  {
    id: "sand",
    name: "Sand",
    hex: "#A8977A",
    description: "부드러운 모래색",
    category: "neutral",
  },
];

/**
 * Get preset by ID
 */
export function getPresetById(id: string): ColorPreset | undefined {
  return EXTENDED_PRESETS.find((preset) => preset.id === id);
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(
  category: ColorPreset["category"],
): ColorPreset[] {
  return EXTENDED_PRESETS.filter((preset) => preset.category === category);
}

/**
 * Validate if a hex color is valid
 */
export function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

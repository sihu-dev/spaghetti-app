/**
 * Component Code Generation Types
 */

export interface ComponentTemplate {
  name: string;
  description: string;
  category: "ui" | "layout" | "form";
  template: string;
  dependencies?: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: "component" | "style" | "token" | "util" | "config";
}

export interface CodeGenContext {
  projectName: string;
  tokens: TokenContext;
  components: string[];
  framework: "react" | "vue" | "svelte";
}

export interface TokenContext {
  colors: {
    primary: string;
    primaryScale: Record<string, string>;
    secondary?: string;
    neutral?: Record<string, string>;
  };
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
  };
  spacing: Record<string, string>;
  radius: Record<string, string>;
}

export const DEFAULT_TOKENS: TokenContext = {
  colors: {
    primary: "#5C6356",
    primaryScale: {
      "50": "#f6f7f5",
      "100": "#e8eae5",
      "200": "#d1d5cc",
      "300": "#b3baa8",
      "400": "#939c84",
      "500": "#5C6356",
      "600": "#4a5045",
      "700": "#3d4239",
      "800": "#33372f",
      "900": "#2b2e27",
      "950": "#171915",
    },
  },
  typography: {
    fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
    },
  },
  spacing: {
    "0": "0",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "6": "1.5rem",
    "8": "2rem",
  },
  radius: {
    none: "0",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "1rem",
    full: "9999px",
  },
};

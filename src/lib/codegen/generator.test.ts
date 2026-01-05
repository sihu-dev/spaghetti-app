/**
 * Code Generator Tests
 */

import { describe, it, expect } from "vitest";
import {
  generateCssTokens,
  generateTailwindConfig,
  generateJsonTokens,
  generateUtils,
  generateReadme,
  generateComponentIndex,
  generateFiles,
} from "./generator";
import { DEFAULT_TOKENS, type TokenContext } from "./types";

describe("Code Generator", () => {
  const mockTokens: TokenContext = {
    colors: {
      primary: "#5C6356",
      primaryScale: {
        "50": "#f6f7f5",
        "100": "#e8eae5",
        "500": "#5C6356",
        "900": "#2b2e27",
      },
    },
    typography: {
      fontFamily: "Pretendard, sans-serif",
      fontSize: { sm: "0.875rem", base: "1rem", lg: "1.125rem" },
    },
    spacing: { "1": "0.25rem", "2": "0.5rem", "4": "1rem" },
    radius: { sm: "0.25rem", md: "0.5rem", lg: "1rem" },
  };

  describe("generateCssTokens", () => {
    it("should generate valid CSS with :root selector", () => {
      const css = generateCssTokens(mockTokens);

      expect(css).toContain(":root {");
      expect(css).toContain("}");
    });

    it("should include primary color variables", () => {
      const css = generateCssTokens(mockTokens);

      expect(css).toContain("--color-primary: #5C6356");
      expect(css).toContain("--color-primary-500: #5C6356");
    });

    it("should include typography variables", () => {
      const css = generateCssTokens(mockTokens);

      expect(css).toContain("--font-family:");
      expect(css).toContain("--font-size-base:");
    });

    it("should include spacing variables", () => {
      const css = generateCssTokens(mockTokens);

      expect(css).toContain("--spacing-1:");
      expect(css).toContain("--spacing-4:");
    });

    it("should include radius variables", () => {
      const css = generateCssTokens(mockTokens);

      expect(css).toContain("--radius-sm:");
      expect(css).toContain("--radius-lg:");
    });

    it("should generate default neutral colors when not provided", () => {
      const css = generateCssTokens(mockTokens);

      expect(css).toContain("--color-neutral-");
    });
  });

  describe("generateTailwindConfig", () => {
    it("should generate valid TypeScript config", () => {
      const config = generateTailwindConfig(mockTokens);

      expect(config).toContain("import type { Config }");
      expect(config).toContain("export default config");
    });

    it("should include color configuration", () => {
      const config = generateTailwindConfig(mockTokens);

      expect(config).toContain('"primary"');
      expect(config).toContain("#5C6356");
    });

    it("should include typography configuration", () => {
      const config = generateTailwindConfig(mockTokens);

      expect(config).toContain("fontFamily");
      expect(config).toContain("fontSize");
    });

    it("should include content paths", () => {
      const config = generateTailwindConfig(mockTokens);

      expect(config).toContain("content");
      expect(config).toContain("./src/**/*.{js,ts,jsx,tsx,mdx}");
    });
  });

  describe("generateJsonTokens", () => {
    it("should generate valid JSON", () => {
      const json = generateJsonTokens(mockTokens);
      const parsed = JSON.parse(json);

      expect(parsed).toBeDefined();
    });

    it("should include schema reference", () => {
      const json = generateJsonTokens(mockTokens);
      const parsed = JSON.parse(json);

      expect(parsed.$schema).toBeDefined();
    });

    it("should include version and generator", () => {
      const json = generateJsonTokens(mockTokens);
      const parsed = JSON.parse(json);

      expect(parsed.version).toBe("1.0.0");
      expect(parsed.generator).toBe("Spaghetti AI");
    });

    it("should include color tokens with type", () => {
      const json = generateJsonTokens(mockTokens);
      const parsed = JSON.parse(json);

      expect(parsed.colors.primary.$value).toBe("#5C6356");
      expect(parsed.colors.primary.$type).toBe("color");
    });

    it("should include timestamp", () => {
      const json = generateJsonTokens(mockTokens);
      const parsed = JSON.parse(json);

      expect(parsed.generatedAt).toBeDefined();
    });
  });

  describe("generateUtils", () => {
    it("should generate cn utility function", () => {
      const utils = generateUtils();

      expect(utils).toContain("export function cn");
      expect(utils).toContain("twMerge");
      expect(utils).toContain("clsx");
    });

    it("should import required dependencies", () => {
      const utils = generateUtils();

      expect(utils).toContain('from "clsx"');
      expect(utils).toContain('from "tailwind-merge"');
    });
  });

  describe("generateReadme", () => {
    it("should include project name", () => {
      const readme = generateReadme("My Design System");

      expect(readme).toContain("My Design System");
    });

    it("should include installation instructions", () => {
      const readme = generateReadme("Test Project");

      expect(readme).toContain("npm install");
      expect(readme).toContain("Quick Start");
    });

    it("should include usage examples", () => {
      const readme = generateReadme("Test Project");

      expect(readme).toContain("import");
      expect(readme).toContain("Button");
    });
  });

  describe("generateComponentIndex", () => {
    it("should export all components", () => {
      const index = generateComponentIndex(["Button", "Input", "Card"]);

      expect(index).toContain('export * from "./Button"');
      expect(index).toContain('export * from "./Input"');
      expect(index).toContain('export * from "./Card"');
    });

    it("should handle empty array", () => {
      const index = generateComponentIndex([]);

      expect(index).toBe("\n");
    });
  });

  describe("generateFiles", () => {
    it("should generate all required files", () => {
      const files = generateFiles({
        projectName: "Test",
        tokens: DEFAULT_TOKENS,
        components: ["Button"],
        framework: "react",
      });

      const paths = files.map((f) => f.path);

      expect(paths).toContain("tokens/tokens.css");
      expect(paths).toContain("tokens/tokens.json");
      expect(paths).toContain("tokens/tailwind.config.ts");
      expect(paths).toContain("lib/utils.ts");
      expect(paths).toContain("README.md");
    });

    it("should include component files", () => {
      const files = generateFiles({
        projectName: "Test",
        tokens: DEFAULT_TOKENS,
        components: ["Button"],
        framework: "react",
      });

      const componentFiles = files.filter((f) =>
        f.path.includes("components/ui/"),
      );

      expect(componentFiles.length).toBeGreaterThan(0);
    });

    it("should set correct file types", () => {
      const files = generateFiles({
        projectName: "Test",
        tokens: DEFAULT_TOKENS,
        components: ["Button"],
        framework: "react",
      });

      const cssFile = files.find((f) => f.path.endsWith(".css"));
      const jsonFile = files.find((f) => f.path.endsWith(".json"));
      const configFile = files.find((f) => f.path.includes("tailwind.config"));

      expect(cssFile?.type).toBe("token");
      expect(jsonFile?.type).toBe("token");
      expect(configFile?.type).toBe("config");
    });
  });
});

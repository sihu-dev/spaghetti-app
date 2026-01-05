/**
 * Templates tests
 */

import { describe, it, expect } from "vitest";
import {
  BUTTON_TEMPLATE,
  INPUT_TEMPLATE,
  CARD_TEMPLATE,
  BADGE_TEMPLATE,
  ALL_TEMPLATES,
  getTemplateByName,
} from "./templates";
import type { ComponentTemplate } from "./types";

describe("templates", () => {
  describe("BUTTON_TEMPLATE", () => {
    it("should have correct structure", () => {
      expect(BUTTON_TEMPLATE.name).toBe("Button");
      expect(BUTTON_TEMPLATE.category).toBe("ui");
      expect(BUTTON_TEMPLATE.dependencies).toContain(
        "class-variance-authority",
      );
    });

    it("should contain valid JSX template", () => {
      expect(BUTTON_TEMPLATE.template).toContain("use client");
      expect(BUTTON_TEMPLATE.template).toContain("forwardRef");
      expect(BUTTON_TEMPLATE.template).toContain("buttonVariants");
      expect(BUTTON_TEMPLATE.template).toContain("export { Button");
    });

    it("should include variant options", () => {
      expect(BUTTON_TEMPLATE.template).toContain("filled:");
      expect(BUTTON_TEMPLATE.template).toContain("outlined:");
      expect(BUTTON_TEMPLATE.template).toContain("text:");
      expect(BUTTON_TEMPLATE.template).toContain("ghost:");
    });

    it("should include size options", () => {
      expect(BUTTON_TEMPLATE.template).toContain("sm:");
      expect(BUTTON_TEMPLATE.template).toContain("md:");
      expect(BUTTON_TEMPLATE.template).toContain("lg:");
    });

    it("should include loading state", () => {
      expect(BUTTON_TEMPLATE.template).toContain("loading");
      expect(BUTTON_TEMPLATE.template).toContain("animate-spin");
    });
  });

  describe("INPUT_TEMPLATE", () => {
    it("should have correct structure", () => {
      expect(INPUT_TEMPLATE.name).toBe("Input");
      expect(INPUT_TEMPLATE.category).toBe("form");
    });

    it("should contain form elements", () => {
      expect(INPUT_TEMPLATE.template).toContain("<label");
      expect(INPUT_TEMPLATE.template).toContain("<input");
      expect(INPUT_TEMPLATE.template).toContain("htmlFor");
    });

    it("should include error handling", () => {
      expect(INPUT_TEMPLATE.template).toContain("error?");
      expect(INPUT_TEMPLATE.template).toContain("border-red-500");
    });

    it("should include hint text support", () => {
      expect(INPUT_TEMPLATE.template).toContain("hint");
    });

    it("should include accessibility attributes", () => {
      expect(INPUT_TEMPLATE.template).toContain("id={inputId}");
      expect(INPUT_TEMPLATE.template).toContain("htmlFor={inputId}");
    });
  });

  describe("CARD_TEMPLATE", () => {
    it("should have correct structure", () => {
      expect(CARD_TEMPLATE.name).toBe("Card");
      expect(CARD_TEMPLATE.category).toBe("ui");
    });

    it("should include card variants", () => {
      expect(CARD_TEMPLATE.template).toContain("elevated:");
      expect(CARD_TEMPLATE.template).toContain("outlined:");
      expect(CARD_TEMPLATE.template).toContain("filled:");
    });

    it("should include padding options", () => {
      expect(CARD_TEMPLATE.template).toContain("padding:");
      expect(CARD_TEMPLATE.template).toContain('none: ""');
      expect(CARD_TEMPLATE.template).toContain('sm: "p-4"');
      expect(CARD_TEMPLATE.template).toContain('md: "p-6"');
      expect(CARD_TEMPLATE.template).toContain('lg: "p-8"');
    });

    it("should export all card components", () => {
      expect(CARD_TEMPLATE.template).toContain("CardHeader");
      expect(CARD_TEMPLATE.template).toContain("CardTitle");
      expect(CARD_TEMPLATE.template).toContain("CardDescription");
      expect(CARD_TEMPLATE.template).toContain("CardContent");
      expect(CARD_TEMPLATE.template).toContain("CardFooter");
    });
  });

  describe("BADGE_TEMPLATE", () => {
    it("should have correct structure", () => {
      expect(BADGE_TEMPLATE.name).toBe("Badge");
      expect(BADGE_TEMPLATE.category).toBe("ui");
    });

    it("should include semantic variants", () => {
      expect(BADGE_TEMPLATE.template).toContain("success:");
      expect(BADGE_TEMPLATE.template).toContain("warning:");
      expect(BADGE_TEMPLATE.template).toContain("error:");
    });

    it("should use span element", () => {
      expect(BADGE_TEMPLATE.template).toContain("<span");
      expect(BADGE_TEMPLATE.template).toContain("HTMLSpanElement");
    });
  });

  describe("ALL_TEMPLATES", () => {
    it("should contain all 4 templates", () => {
      expect(ALL_TEMPLATES).toHaveLength(4);
    });

    it("should include Button, Input, Card, Badge", () => {
      const names = ALL_TEMPLATES.map((t) => t.name);
      expect(names).toContain("Button");
      expect(names).toContain("Input");
      expect(names).toContain("Card");
      expect(names).toContain("Badge");
    });

    it("all templates should have required properties", () => {
      ALL_TEMPLATES.forEach((template: ComponentTemplate) => {
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.category).toBeDefined();
        expect(template.template).toBeDefined();
        expect(typeof template.template).toBe("string");
        expect(template.template.length).toBeGreaterThan(0);
      });
    });

    it("all templates should be valid TypeScript/JSX", () => {
      ALL_TEMPLATES.forEach((template: ComponentTemplate) => {
        // Check for common syntax patterns
        expect(template.template).toContain("export");
        expect(template.template).toContain("import");
      });
    });
  });

  describe("getTemplateByName", () => {
    it("should find Button template", () => {
      const template = getTemplateByName("Button");
      expect(template).toBeDefined();
      expect(template?.name).toBe("Button");
    });

    it("should find Input template", () => {
      const template = getTemplateByName("Input");
      expect(template).toBeDefined();
      expect(template?.name).toBe("Input");
    });

    it("should find Card template", () => {
      const template = getTemplateByName("Card");
      expect(template).toBeDefined();
      expect(template?.name).toBe("Card");
    });

    it("should find Badge template", () => {
      const template = getTemplateByName("Badge");
      expect(template).toBeDefined();
      expect(template?.name).toBe("Badge");
    });

    it("should be case insensitive", () => {
      expect(getTemplateByName("button")).toBeDefined();
      expect(getTemplateByName("BUTTON")).toBeDefined();
      expect(getTemplateByName("BuTtOn")).toBeDefined();
    });

    it("should return undefined for unknown template", () => {
      expect(getTemplateByName("Unknown")).toBeUndefined();
      expect(getTemplateByName("")).toBeUndefined();
      expect(getTemplateByName("NonExistent")).toBeUndefined();
    });
  });
});

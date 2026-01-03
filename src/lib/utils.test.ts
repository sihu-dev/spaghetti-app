/**
 * Utility Functions Tests
 */

import { describe, it, expect, vi } from "vitest";
import {
  cn,
  delay,
  safeJsonParse,
  formatFileSize,
  generateId,
  debounce,
} from "./utils";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("should merge class names", () => {
      const result = cn("px-4", "py-2");
      expect(result).toBe("px-4 py-2");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn("base", isActive && "active");
      expect(result).toContain("active");
    });

    it("should resolve Tailwind conflicts", () => {
      const result = cn("px-4", "px-6");
      expect(result).toBe("px-6");
    });

    it("should handle arrays", () => {
      const result = cn(["px-4", "py-2"]);
      expect(result).toBe("px-4 py-2");
    });

    it("should handle objects", () => {
      const result = cn({ "px-4": true, "py-2": false });
      expect(result).toBe("px-4");
    });

    it("should handle undefined and null", () => {
      const result = cn("px-4", undefined, null, "py-2");
      expect(result).toBe("px-4 py-2");
    });
  });

  describe("delay", () => {
    it("should resolve after specified time", async () => {
      const start = Date.now();
      await delay(50);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(45);
    });

    it("should return a promise", () => {
      const result = delay(10);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe("safeJsonParse", () => {
    it("should parse valid JSON", () => {
      const result = safeJsonParse('{"name": "test"}', {});
      expect(result).toEqual({ name: "test" });
    });

    it("should return fallback for invalid JSON", () => {
      const fallback = { default: true };
      const result = safeJsonParse("not valid json", fallback);
      expect(result).toEqual(fallback);
    });

    it("should parse arrays", () => {
      const result = safeJsonParse("[1, 2, 3]", []);
      expect(result).toEqual([1, 2, 3]);
    });

    it("should parse primitives", () => {
      expect(safeJsonParse("123", 0)).toBe(123);
      expect(safeJsonParse('"hello"', "")).toBe("hello");
      expect(safeJsonParse("true", false)).toBe(true);
    });
  });

  describe("formatFileSize", () => {
    it("should format bytes", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
      expect(formatFileSize(500)).toBe("500 Bytes");
    });

    it("should format kilobytes", () => {
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(2048)).toBe("2 KB");
    });

    it("should format megabytes", () => {
      expect(formatFileSize(1024 * 1024)).toBe("1 MB");
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
    });

    it("should format gigabytes", () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
    });

    it("should handle decimal values", () => {
      expect(formatFileSize(1536)).toBe("1.5 KB");
    });
  });

  describe("generateId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
    });

    it("should include prefix when provided", () => {
      const id = generateId("user");

      expect(id).toMatch(/^user_/);
    });

    it("should generate ID without prefix", () => {
      const id = generateId();

      expect(id).not.toContain("_");
    });

    it("should generate alphanumeric IDs", () => {
      const id = generateId();

      expect(id).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe("debounce", () => {
    it("should delay function execution", async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 50);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      await delay(60);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should only call once for rapid calls", async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 50);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      await delay(60);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should pass arguments to the function", async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 50);

      debouncedFn("arg1", "arg2");

      await delay(60);
      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
    });
  });
});

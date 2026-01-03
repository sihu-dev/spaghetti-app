/**
 * Environment validation tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  validateServerEnv,
  validateClientEnv,
  getEnv,
  isProduction,
  isDevelopment,
  isTest,
} from "./env";

describe("env", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("validateServerEnv", () => {
    it("should validate with default NODE_ENV", () => {
      delete process.env.NODE_ENV;
      const env = validateServerEnv();
      expect(env.NODE_ENV).toBe("development");
    });

    it("should accept development environment", () => {
      process.env.NODE_ENV = "development";
      const env = validateServerEnv();
      expect(env.NODE_ENV).toBe("development");
    });

    it("should accept production environment", () => {
      process.env.NODE_ENV = "production";
      const env = validateServerEnv();
      expect(env.NODE_ENV).toBe("production");
    });

    it("should accept test environment", () => {
      process.env.NODE_ENV = "test";
      const env = validateServerEnv();
      expect(env.NODE_ENV).toBe("test");
    });
  });

  describe("validateClientEnv", () => {
    it("should validate with no optional vars", () => {
      delete process.env.NEXT_PUBLIC_GA_ID;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const env = validateClientEnv();
      expect(env.NEXT_PUBLIC_GA_ID).toBeUndefined();
      expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeUndefined();
      expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeUndefined();
    });

    it("should accept valid GA ID", () => {
      process.env.NEXT_PUBLIC_GA_ID = "G-XXXXXXXXXX";
      const env = validateClientEnv();
      expect(env.NEXT_PUBLIC_GA_ID).toBe("G-XXXXXXXXXX");
    });

    it("should accept valid Supabase URL", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      const env = validateClientEnv();
      expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
    });

    it("should accept valid Supabase anon key", () => {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
      const env = validateClientEnv();
      expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    });
  });

  describe("getEnv", () => {
    it("should return client env in browser environment", () => {
      process.env.NEXT_PUBLIC_GA_ID = "G-TEST";
      const env = getEnv();
      // In jsdom environment (simulating browser), only client env is returned
      expect(env.NEXT_PUBLIC_GA_ID).toBe("G-TEST");
    });

    it("should return env without errors", () => {
      const env = getEnv();
      expect(env).toBeDefined();
      expect(typeof env).toBe("object");
    });
  });

  describe("environment checks", () => {
    it("isProduction returns true in production", () => {
      process.env.NODE_ENV = "production";
      expect(isProduction()).toBe(true);
      expect(isDevelopment()).toBe(false);
      expect(isTest()).toBe(false);
    });

    it("isDevelopment returns true in development", () => {
      process.env.NODE_ENV = "development";
      expect(isProduction()).toBe(false);
      expect(isDevelopment()).toBe(true);
      expect(isTest()).toBe(false);
    });

    it("isTest returns true in test", () => {
      process.env.NODE_ENV = "test";
      expect(isProduction()).toBe(false);
      expect(isDevelopment()).toBe(false);
      expect(isTest()).toBe(true);
    });
  });
});

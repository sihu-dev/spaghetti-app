/**
 * Environment variable validation
 * Ensures required environment variables are set before runtime
 */

import { z } from "zod";

/**
 * Server-side environment variables schema
 */
const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

/**
 * Client-side environment variables schema
 * Only NEXT_PUBLIC_ prefixed variables are exposed to the client
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

/**
 * Combined environment variables type
 */
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validate server environment variables
 * Call this at application startup (e.g., in instrumentation.ts)
 */
export function validateServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid server environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid server environment variables");
  }

  return parsed.data;
}

/**
 * Validate client environment variables
 * Safe to call on both server and client
 */
export function validateClientEnv(): ClientEnv {
  const clientEnv = {
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  const parsed = clientEnvSchema.safeParse(clientEnv);

  if (!parsed.success) {
    console.error(
      "❌ Invalid client environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid client environment variables");
  }

  return parsed.data;
}

/**
 * Get validated environment variables
 * Returns both server and client env vars when called on server
 * Returns only client env vars when called on client
 */
export function getEnv(): ClientEnv & Partial<ServerEnv> {
  if (typeof window === "undefined") {
    // Server-side: return both server and client env vars
    return {
      ...validateServerEnv(),
      ...validateClientEnv(),
    };
  }

  // Client-side: return only client env vars
  return validateClientEnv();
}

/**
 * Check if we're in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if we're in development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Check if we're in test environment
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === "test";
}

/**
 * Authentication Hooks
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const supabase = getSupabaseClient();

        // 현재 세션 가져오기
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          setState({
            user: session?.user ?? null,
            session,
            isLoading: false,
            error: null,
          });
        }

        // 인증 상태 변경 구독
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(
          (_event: string, session: Session | null) => {
            if (mounted) {
              setState({
                user: session?.user ?? null,
                session,
                isLoading: false,
                error: null,
              });
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        if (mounted) {
          setState({
            user: null,
            session: null,
            isLoading: false,
            error: error as Error,
          });
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    []
  );

  const signInWithOAuth = useCallback(
    async (provider: "google" | "github") => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return data;
    },
    []
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
    return data;
  }, []);

  return {
    ...state,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    signOut,
    resetPassword,
    isAuthenticated: !!state.user,
  };
}

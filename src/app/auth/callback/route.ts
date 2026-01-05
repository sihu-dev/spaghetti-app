/**
 * OAuth Callback Route
 * Supabase OAuth 인증 후 리디렉션 처리
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        `${origin}/auth/error?message=${error.message}`,
      );
    }
  }

  // 인증 성공 시 에디터로 리디렉션
  return NextResponse.redirect(`${origin}/editor`);
}

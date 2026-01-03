/**
 * API 키 검증 엔드포인트
 * GET /api/test-keys
 *
 * OpenAI 및 Supabase API 키가 환경변수에 설정되어 있는지 확인
 */

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const results: {
    openai: { configured: boolean; valid?: boolean; error?: string };
    supabase: { configured: boolean; valid?: boolean; error?: string };
    timestamp: string;
  } = {
    openai: { configured: false },
    supabase: { configured: false },
    timestamp: new Date().toISOString(),
  };

  // OpenAI 검증
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    results.openai.configured = true;
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 10,
        messages: [{ role: "user", content: "Hi" }],
      });

      results.openai.valid = !!response.choices[0];
    } catch (error: any) {
      results.openai.valid = false;
      results.openai.error = error.message;
    }
  }

  // Supabase 검증
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    results.supabase.configured = true;
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 간단한 쿼리 (테이블이 없어도 연결은 확인 가능)
      const { error } = await supabase.from("profiles").select("count").limit(1);

      if (error) {
        // 테이블이 없는 경우는 연결은 성공
        if (error.message.includes("does not exist")) {
          results.supabase.valid = true;
          results.supabase.error = "Connected (table not created yet)";
        } else {
          results.supabase.valid = false;
          results.supabase.error = error.message;
        }
      } else {
        results.supabase.valid = true;
      }
    } catch (error: any) {
      results.supabase.valid = false;
      results.supabase.error = error.message;
    }
  }

  return NextResponse.json(results);
}

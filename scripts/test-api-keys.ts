/**
 * API 키 검증 스크립트
 * OpenAI 및 Supabase API 키가 유효한지 테스트
 *
 * 사용법:
 * 1. .env.local 파일 생성
 * 2. API 키 입력
 * 3. npx tsx scripts/test-api-keys.ts
 */

import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

async function testOpenAI() {
  console.log("🔍 OpenAI API 키 검증 중...");

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.log("❌ OPENAI_API_KEY가 환경변수에 없습니다.");
    console.log("   .env.local 파일에 추가하세요:");
    console.log("   OPENAI_API_KEY=sk-...");
    return false;
  }

  try {
    const openai = new OpenAI({ apiKey });

    // 간단한 텍스트 요청으로 API 키 검증
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 50,
      messages: [
        {
          role: "user",
          content: "Say 'API key is valid' in Korean.",
        },
      ],
    });

    const result = response.choices[0]?.message?.content;
    console.log("✅ OpenAI API 키 유효함");
    console.log(`   응답: ${result}`);
    console.log(`   모델: ${response.model}`);
    return true;
  } catch (error: any) {
    console.log("❌ OpenAI API 키 오류:");
    console.log(`   ${error.message}`);
    return false;
  }
}

async function testOpenAIVision() {
  console.log("\n🔍 OpenAI Vision API 테스트 중...");

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.log("❌ OPENAI_API_KEY가 설정되지 않음");
    return false;
  }

  try {
    const openai = new OpenAI({ apiKey });

    // 테스트용 placeholder 이미지로 Vision API 테스트
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: "https://via.placeholder.com/400x300/2563EB/FFFFFF?text=TEST",
              },
            },
            {
              type: "text",
              text: "이미지에 무엇이 보이나요? 한국어로 짧게 답변하세요.",
            },
          ],
        },
      ],
    });

    const result = response.choices[0]?.message?.content;
    console.log("✅ OpenAI Vision API 작동 확인");
    console.log(`   응답: ${result}`);
    return true;
  } catch (error: any) {
    console.log("❌ OpenAI Vision API 오류:");
    console.log(`   ${error.message}`);
    return false;
  }
}

async function testSupabase() {
  console.log("\n🔍 Supabase 연결 테스트 중...");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.log("❌ Supabase 환경변수가 설정되지 않음");
    console.log("   .env.local 파일에 추가하세요:");
    console.log("   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co");
    console.log("   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...");
    return false;
  }

  try {
    const supabase = createClient(url, key);

    // 간단한 쿼리로 연결 확인
    const { error } = await supabase.from("profiles").select("count").limit(1);

    if (error) {
      // 테이블이 없을 수도 있으니 특정 에러만 체크
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        console.log("✅ Supabase 연결 성공 (테이블 미생성)");
        console.log("   ⚠️  데이터베이스 스키마를 생성하세요:");
        console.log("   supabase/schema.sql 파일을 Supabase SQL Editor에서 실행");
        return true;
      } else {
        throw error;
      }
    }

    console.log("✅ Supabase 연결 및 테이블 확인 완료");
    return true;
  } catch (error: any) {
    console.log("❌ Supabase 연결 오류:");
    console.log(`   ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("🧪 CATALOG.AI - API 키 검증 테스트");
  console.log("=".repeat(60));
  console.log();

  const results = {
    openai: await testOpenAI(),
    vision: false,
    supabase: await testSupabase(),
  };

  // OpenAI가 성공하면 Vision도 테스트
  if (results.openai) {
    results.vision = await testOpenAIVision();
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 테스트 결과 요약");
  console.log("=".repeat(60));
  console.log(`OpenAI 텍스트: ${results.openai ? "✅" : "❌"}`);
  console.log(`OpenAI Vision: ${results.vision ? "✅" : "❌"}`);
  console.log(`Supabase:      ${results.supabase ? "✅" : "❌"}`);
  console.log();

  if (results.openai && results.vision && results.supabase) {
    console.log("🎉 모든 API 키가 유효합니다!");
    console.log("   이제 실제 카탈로그 생성을 테스트할 수 있습니다.");
  } else {
    console.log("⚠️  일부 API 키가 유효하지 않습니다.");
    console.log("   .env.local 파일을 확인하고 다시 시도하세요.");
  }

  console.log();
}

main().catch(console.error);

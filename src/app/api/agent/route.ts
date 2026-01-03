/**
 * AI Agent API - 자율 실행 엔드포인트
 * POST /api/agent
 */

import { NextRequest, NextResponse } from "next/server";
import { createCatalogAuto } from "@/lib/ai/agent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { goal, images, logo, companyName } = body;

    // 유효성 검사
    if (!goal || typeof goal !== "string") {
      return NextResponse.json(
        { error: "목표(goal)를 입력해주세요" },
        { status: 400 }
      );
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "최소 1개 이상의 제품 이미지가 필요합니다" },
        { status: 400 }
      );
    }

    console.log(`🚀 AI Agent starting: "${goal}"`);
    console.log(`   Images: ${images.length}`);
    console.log(`   Logo: ${logo ? "Yes" : "No"}`);

    // AI 에이전트 실행
    const result = await createCatalogAuto({
      goal,
      images,
      logo,
      companyName,
    });

    console.log("✅ AI Agent completed successfully");

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ AI Agent error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "AI 에이전트 실행 중 오류가 발생했습니다",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agent
 * 에이전트 상태 확인 (헬스체크)
 */
export async function GET() {
  return NextResponse.json({
    status: "ready",
    version: "1.0.0",
    features: [
      "extract_product_info",
      "extract_brand_colors",
      "select_template",
      "translate_content",
      "generate_pdf",
    ],
  });
}

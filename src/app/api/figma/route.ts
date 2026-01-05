/**
 * Figma Plugin API Route
 * Figma 플러그인과 웹앱 간 데이터 교환 API
 */

import { NextRequest, NextResponse } from "next/server";
import type {
  FigmaApiResponse,
  FigmaExportPayload,
  FigmaImportPayload,
} from "@/lib/figma/types";

/**
 * GET: Figma 플러그인 상태 확인
 */
export async function GET() {
  const response: FigmaApiResponse<{ status: string; version: string }> = {
    success: true,
    data: {
      status: "ready",
      version: "1.0.0",
    },
  };

  return NextResponse.json(response);
}

/**
 * POST: Figma에서 색상 데이터 가져오기
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FigmaImportPayload;

    if (!body.styles || !Array.isArray(body.styles)) {
      const errorResponse: FigmaApiResponse<null> = {
        success: false,
        error: "Invalid payload: styles array is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 스타일 데이터 처리
    const processedStyles = body.styles.map((style) => ({
      id: style.id,
      name: style.name,
      color: style.color,
      description: style.description,
    }));

    const response: FigmaApiResponse<{
      imported: number;
      styles: typeof processedStyles;
    }> = {
      success: true,
      data: {
        imported: processedStyles.length,
        styles: processedStyles,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: FigmaApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PUT: Figma로 디자인 토큰 내보내기
 */
export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as FigmaExportPayload;

    if (!body.projectName || !body.primaryColor || !body.colorScale) {
      const errorResponse: FigmaApiResponse<null> = {
        success: false,
        error:
          "Invalid payload: projectName, primaryColor, and colorScale are required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 내보내기 데이터 준비
    const exportData = {
      projectName: body.projectName,
      primaryColor: body.primaryColor,
      colorScale: body.colorScale,
      semanticColors: body.semanticColors || {},
      timestamp: body.timestamp || new Date().toISOString(),
    };

    const response: FigmaApiResponse<typeof exportData> = {
      success: true,
      data: exportData,
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: FigmaApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

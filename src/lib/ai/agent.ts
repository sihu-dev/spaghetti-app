/**
 * AI Agent - 자율 실행 시스템
 * 목표만 주면 전체 카탈로그 생성 프로세스를 자동 수행
 */

import Anthropic from "@anthropic-ai/sdk";
import { extractProductInfo, type ProductInfo } from "./vision";
import { extractColorsFromImage } from "../color/extraction";
import { generateColorRamp } from "../color/ramp";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AgentTask {
  id: string;
  goal: string; // "제품 카탈로그 만들어줘"
  status: "pending" | "running" | "completed" | "failed";
  steps: AgentStep[];
  result?: CatalogResult;
  error?: string;
}

export interface AgentStep {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt?: Date;
  completedAt?: Date;
  output?: any;
  error?: string;
}

export interface CatalogResult {
  products: ProductInfo[];
  brandColors: {
    primary: string;
    palette: string[];
  };
  catalogData: {
    title: string;
    companyName: string;
    language: string[];
  };
  pdfUrl?: string;
}

/**
 * AI 에이전트 실행
 *
 * @example
 * ```typescript
 * const agent = new CatalogAgent();
 * const task = await agent.execute({
 *   goal: "펌프 제품 카탈로그를 영어와 한국어로 만들어줘",
 *   images: ["/uploads/pump1.jpg", "/uploads/pump2.jpg"],
 *   logo: "/uploads/logo.png",
 * });
 * ```
 */
export class CatalogAgent {
  private task: AgentTask | null = null;

  /**
   * 목표 이해 및 계획 수립
   */
  async planSteps(goal: string): Promise<AgentStep[]> {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `사용자 목표: "${goal}"

이 목표를 달성하기 위한 단계별 계획을 JSON 배열로 작성하세요.

각 단계는 다음 형식을 따릅니다:
{
  "name": "단계 이름",
  "description": "무엇을 하는지 설명"
}

가능한 단계:
1. "extract_product_info" - 제품 사진에서 정보 추출
2. "extract_brand_colors" - 로고에서 브랜드 컬러 추출
3. "select_template" - 산업별 템플릿 선택
4. "translate_content" - 다국어 번역
5. "generate_pdf" - PDF 카탈로그 생성

JSON 배열만 반환하세요:`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Invalid response from AI");
    }

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse plan from AI");
    }

    const planData = JSON.parse(jsonMatch[0]);

    return planData.map((step: any) => ({
      name: step.name,
      status: "pending" as const,
    }));
  }

  /**
   * 에이전트 실행
   */
  async execute(input: {
    goal: string;
    images: string[];
    logo?: string;
    companyName?: string;
  }): Promise<AgentTask> {
    this.task = {
      id: Math.random().toString(36).substring(7),
      goal: input.goal,
      status: "running",
      steps: [],
    };

    try {
      // Step 1: 계획 수립
      console.log("🤖 AI Agent: Planning steps...");
      this.task.steps = await this.planSteps(input.goal);

      // Step 2: 각 단계 실행
      for (const step of this.task.steps) {
        await this.executeStep(step, input);
      }

      this.task.status = "completed";
      return this.task;
    } catch (error) {
      this.task.status = "failed";
      this.task.error = error instanceof Error ? error.message : "Unknown error";
      throw error;
    }
  }

  /**
   * 개별 단계 실행
   */
  private async executeStep(
    step: AgentStep,
    input: {
      goal: string;
      images: string[];
      logo?: string;
      companyName?: string;
    }
  ): Promise<void> {
    step.status = "running";
    step.startedAt = new Date();

    try {
      switch (step.name) {
        case "extract_product_info":
          step.output = await this.extractProductInfo(input.images);
          break;

        case "extract_brand_colors":
          if (input.logo) {
            step.output = await this.extractBrandColors(input.logo);
          }
          break;

        case "select_template":
          step.output = await this.selectTemplate(step);
          break;

        case "translate_content":
          step.output = await this.translateContent(step);
          break;

        case "generate_pdf":
          step.output = await this.generatePdf(step);
          break;

        default:
          throw new Error(`Unknown step: ${step.name}`);
      }

      step.status = "completed";
      step.completedAt = new Date();

      console.log(`✅ Completed: ${step.name}`);
    } catch (error) {
      step.status = "failed";
      step.error = error instanceof Error ? error.message : "Unknown error";
      step.completedAt = new Date();

      console.error(`❌ Failed: ${step.name}`, error);
      throw error;
    }
  }

  /**
   * 제품 정보 추출
   */
  private async extractProductInfo(images: string[]): Promise<ProductInfo[]> {
    console.log(`📸 Extracting info from ${images.length} images...`);

    const products: ProductInfo[] = [];

    for (const imageUrl of images) {
      const info = await extractProductInfo(imageUrl);
      products.push(info);
    }

    return products;
  }

  /**
   * 브랜드 컬러 추출
   */
  private async extractBrandColors(logoUrl: string): Promise<{
    primary: string;
    palette: string[];
  }> {
    console.log("🎨 Extracting brand colors from logo...");

    const colors = await extractColorsFromImage(logoUrl, { colorCount: 5 });

    return {
      primary: colors[0]?.hex || "#2563EB",
      palette: colors.map(c => c.hex),
    };
  }

  /**
   * 템플릿 선택
   */
  private async selectTemplate(step: AgentStep): Promise<string> {
    // 제품 카테고리 기반으로 템플릿 선택
    const productStep = this.task?.steps.find(s => s.name === "extract_product_info");
    const products = productStep?.output as ProductInfo[] | undefined;

    if (!products || products.length === 0) {
      return "industrial"; // 기본값
    }

    const categories = products.map(p => p.category).filter(Boolean);
    const mainCategory = categories[0] || "기타";

    // 카테고리별 템플릿 매핑
    const templateMap: Record<string, string> = {
      "펌프": "industrial",
      "워터펌프": "industrial",
      "모터": "industrial",
      "밸브": "industrial",
      "센서": "electronics",
      "전자부품": "electronics",
      "식품": "consumer",
      "소비재": "consumer",
    };

    return templateMap[mainCategory] || "industrial";
  }

  /**
   * 다국어 번역
   */
  private async translateContent(step: AgentStep): Promise<{
    ko: any;
    en?: any;
    zh?: any;
    ja?: any;
  }> {
    console.log("🌐 Translating content...");

    // 목표에서 언어 추출
    const goal = this.task?.goal || "";
    const needsEnglish = goal.includes("영어") || goal.includes("English");
    const needsChinese = goal.includes("중국어") || goal.includes("中文");
    const needsJapanese = goal.includes("일본어") || goal.includes("日本語");

    const productStep = this.task?.steps.find(s => s.name === "extract_product_info");
    const products = productStep?.output as ProductInfo[] | undefined;

    const result: any = { ko: products };

    if (needsEnglish) {
      result.en = await this.translateProducts(products || [], "en");
    }

    if (needsChinese) {
      result.zh = await this.translateProducts(products || [], "zh");
    }

    if (needsJapanese) {
      result.ja = await this.translateProducts(products || [], "ja");
    }

    return result;
  }

  /**
   * 제품 정보 번역
   */
  private async translateProducts(
    products: ProductInfo[],
    targetLang: "en" | "zh" | "ja"
  ): Promise<ProductInfo[]> {
    const langNames = { en: "영어", zh: "중국어", ja: "일본어" };

    console.log(`  → ${langNames[targetLang]} 번역 중...`);

    // Claude API로 번역 (실제 구현 시)
    // 여기서는 간단히 원본 반환
    return products;
  }

  /**
   * PDF 생성
   */
  private async generatePdf(step: AgentStep): Promise<string> {
    console.log("📄 Generating PDF catalog...");

    // 필요한 데이터 수집
    const productStep = this.task?.steps.find(s => s.name === "extract_product_info");
    const colorStep = this.task?.steps.find(s => s.name === "extract_brand_colors");

    const products = productStep?.output as ProductInfo[] || [];
    const brandColors = colorStep?.output as { primary: string; palette: string[] } | undefined;

    // PDF 생성 (동적 import - 클라이언트 번들에서 제외)
    const { generateCatalogPDF, productInfoToCatalogData } = await import("../pdf/generator");

    const catalogData = productInfoToCatalogData(products, {
      title: "Product Catalog",
      companyName: "Company Name",
      brandColor: brandColors?.primary,
    });

    const pdfUrl = await generateCatalogPDF(catalogData);

    return pdfUrl;
  }

  /**
   * 진행 상태 조회
   */
  getProgress(): {
    total: number;
    completed: number;
    current?: string;
    percentage: number;
  } {
    if (!this.task) {
      return { total: 0, completed: 0, percentage: 0 };
    }

    const total = this.task.steps.length;
    const completed = this.task.steps.filter(s => s.status === "completed").length;
    const current = this.task.steps.find(s => s.status === "running")?.name;

    return {
      total,
      completed,
      current,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}

/**
 * 간편 실행 함수
 */
export async function createCatalogAuto(input: {
  goal: string;
  images: string[];
  logo?: string;
  companyName?: string;
  onProgress?: (progress: { percentage: number; current?: string }) => void;
}): Promise<CatalogResult> {
  const agent = new CatalogAgent();

  // 진행 상태 모니터링
  const progressInterval = setInterval(() => {
    if (input.onProgress) {
      const progress = agent.getProgress();
      input.onProgress({
        percentage: progress.percentage,
        current: progress.current,
      });
    }
  }, 500);

  try {
    const task = await agent.execute(input);
    clearInterval(progressInterval);

    // 결과 정리
    const productStep = task.steps.find(s => s.name === "extract_product_info");
    const colorStep = task.steps.find(s => s.name === "extract_brand_colors");
    const pdfStep = task.steps.find(s => s.name === "generate_pdf");

    return {
      products: productStep?.output || [],
      brandColors: colorStep?.output || { primary: "#2563EB", palette: [] },
      catalogData: {
        title: input.companyName ? `${input.companyName} 제품 카탈로그` : "제품 카탈로그",
        companyName: input.companyName || "회사명",
        language: ["ko", "en"],
      },
      pdfUrl: pdfStep?.output,
    };
  } finally {
    clearInterval(progressInterval);
  }
}

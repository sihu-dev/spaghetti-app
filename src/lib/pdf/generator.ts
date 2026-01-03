/**
 * PDF Generator
 * React-PDF로 카탈로그 생성 및 저장
 */

import { renderToBuffer } from "@react-pdf/renderer";
import { CatalogDocument, type CatalogData } from "./catalog-template";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * PDF 생성 및 저장
 *
 * @param data - 카탈로그 데이터
 * @param filename - 파일명 (선택사항, 기본값: catalog-{timestamp}.pdf)
 * @returns PDF 파일 경로
 */
export async function generateCatalogPDF(
  data: CatalogData,
  filename?: string
): Promise<string> {
  try {
    // PDF 렌더링
    const pdfBuffer = await renderToBuffer(<CatalogDocument data={data} />);

    // 저장 경로 설정
    const publicDir = join(process.cwd(), "public", "downloads");

    // 디렉토리 생성 (없으면)
    if (!existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true });
    }

    // 파일명 생성
    const pdfFilename = filename || `catalog-${Date.now()}.pdf`;
    const filePath = join(publicDir, pdfFilename);

    // 파일 저장
    await writeFile(filePath, pdfBuffer);

    console.log(`✅ PDF generated: ${filePath}`);

    // 공개 URL 반환
    return `/downloads/${pdfFilename}`;
  } catch (error) {
    console.error("❌ PDF generation error:", error);
    throw new Error("Failed to generate PDF");
  }
}

/**
 * ProductInfo를 CatalogData로 변환
 */
import type { ProductInfo } from "../ai/vision";

export function productInfoToCatalogData(
  products: ProductInfo[],
  options: {
    title?: string;
    companyName?: string;
    logo?: string;
    brandColor?: string;
    contact?: {
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
    };
  }
): CatalogData {
  return {
    title: options.title || "Product Catalog",
    companyName: options.companyName || "Company Name",
    logo: options.logo,
    products,
    brandColor: options.brandColor,
    contact: options.contact,
  };
}

/**
 * 다국어 카탈로그 생성
 */
export async function generateMultilingualCatalogs(
  data: CatalogData,
  languages: string[]
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  for (const lang of languages) {
    // 언어별 번역된 데이터 (TODO: 실제 번역 로직)
    const translatedData = { ...data };

    const filename = `catalog-${lang}-${Date.now()}.pdf`;
    const pdfUrl = await generateCatalogPDF(translatedData, filename);

    results[lang] = pdfUrl;
  }

  return results;
}

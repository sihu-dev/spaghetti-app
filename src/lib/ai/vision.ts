/**
 * AI Vision - 제품 이미지 분석
 * Claude 3.5 Sonnet Vision API를 사용하여 제품 정보 자동 추출
 */

import Anthropic from "@anthropic-ai/sdk";

export interface ProductInfo {
  modelName: string | null;
  category: string | null;
  specifications: {
    [key: string]: string | string[];
  };
  features: string[];
  detectedText: string[];
  confidence: "high" | "medium" | "low";
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * 이미지를 base64로 변환
 */
async function imageUrlToBase64(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith("data:")) {
    // 이미 base64인 경우
    return imageUrl.split(",")[1];
  }

  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return base64;
}

/**
 * 제품 이미지에서 정보 자동 추출
 *
 * @param imageUrl - 제품 이미지 URL 또는 base64 data URL
 * @returns 추출된 제품 정보
 *
 * @example
 * ```typescript
 * const info = await extractProductInfo("/uploads/pump.jpg");
 * console.log(info.modelName); // "KP-500A"
 * console.log(info.specifications); // { voltage: "220V/380V", capacity: "500L/min" }
 * ```
 */
export async function extractProductInfo(
  imageUrl: string
): Promise<ProductInfo> {
  try {
    const base64Image = await imageUrlToBase64(imageUrl);

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `이 제품 이미지를 분석하여 다음 정보를 JSON 형식으로 추출해주세요:

1. modelName: 제품 모델명 (명판, 스티커에서 발견)
2. category: 제품 카테고리 (예: "펌프", "모터", "밸브", "센서" 등)
3. specifications: 제품 스펙
   - voltage: 전압 (예: "220V", "380V")
   - capacity: 용량 (예: "500L/min")
   - power: 출력 (예: "5HP", "3.7kW")
   - material: 재질 (예: "SUS304", "Cast Iron")
   - pressure: 압력 (예: "10bar", "150psi")
   - temperature: 온도 범위 (예: "-20°C ~ 120°C")
   - size: 크기/규격 (예: "DN50", "2inch")
   - weight: 무게 (예: "50kg")
4. features: 제품 특징 리스트 (예: ["내부식성", "고효율", "저소음"])
5. detectedText: 이미지에서 발견된 모든 텍스트
6. confidence: 추출 신뢰도 ("high" | "medium" | "low")

**중요:**
- 명확히 보이는 정보만 추출하세요
- 불확실한 경우 null 또는 빈 배열을 반환하세요
- 한국어로 응답하세요 (영어 모델명은 그대로)
- JSON만 반환하세요 (추가 설명 없이)

응답 형식:
{
  "modelName": "KP-500A",
  "category": "워터펌프",
  "specifications": {
    "voltage": "220V/380V",
    "capacity": "500L/min",
    "material": "SUS304"
  },
  "features": ["내부식성", "고효율"],
  "detectedText": ["KP-500A", "220V", "MADE IN KOREA"],
  "confidence": "high"
}`,
            },
          ],
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // JSON 추출 (코드 블록 제거)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from AI response");
    }

    const productInfo: ProductInfo = JSON.parse(jsonMatch[0]);
    return productInfo;
  } catch (error) {
    console.error("Product info extraction error:", error);
    return {
      modelName: null,
      category: null,
      specifications: {},
      features: [],
      detectedText: [],
      confidence: "low",
    };
  }
}

/**
 * 여러 제품 이미지 일괄 분석
 */
export async function extractMultipleProducts(
  imageUrls: string[]
): Promise<ProductInfo[]> {
  const results = await Promise.all(imageUrls.map(extractProductInfo));
  return results;
}

/**
 * 제품 카테고리 자동 판별 (간단한 분류)
 */
export async function detectProductCategory(
  imageUrl: string
): Promise<string> {
  try {
    const base64Image = await imageUrlToBase64(imageUrl);

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `이 제품의 카테고리를 한 단어로 답하세요. 예: 펌프, 모터, 밸브, 센서, 컨베이어, 공구, 기계부품, 전자부품`,
            },
          ],
        },
      ],
    });

    const category =
      message.content[0].type === "text"
        ? message.content[0].text.trim()
        : "기타";
    return category;
  } catch (error) {
    console.error("Category detection error:", error);
    return "기타";
  }
}

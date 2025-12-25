import Anthropic from '@anthropic-ai/sdk';
import { Theme, claudeThemeResponseSchema } from '../schemas/theme.schema';
import { validateImageUrl, isValidImageMimeType, isValidHexColor } from '../utils/security';
import { Errors } from '../utils/errors';
import { env } from '../config/env';

// Claude API client initialization with validated API key
const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

/**
 * Extract theme colors from an image using Claude AI
 */
export async function extractThemeFromImage(
  imageFile?: Express.Multer.File,
  imageUrl?: string
): Promise<Theme> {
  let imageData: string;
  let mediaType: ImageMediaType;

  if (imageFile) {
    // Validate uploaded file
    if (!isValidImageMimeType(imageFile.mimetype)) {
      throw Errors.invalidImage(`Unsupported file type: ${imageFile.mimetype}`);
    }

    // Check file size (max 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      throw Errors.invalidImage('File size exceeds 10MB limit');
    }

    imageData = imageFile.buffer.toString('base64');
    mediaType = getMediaType(imageFile.mimetype);
  } else if (imageUrl) {
    // SSRF prevention - validate URL before fetching
    validateImageUrl(imageUrl);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'AI-Spaghetti/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw Errors.invalidImage(`Failed to fetch image: HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || 'image/png';
      if (!isValidImageMimeType(contentType)) {
        throw Errors.invalidImage(`Unsupported content type: ${contentType}`);
      }

      // Check content length
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > 10 * 1024 * 1024) {
        throw Errors.invalidImage('Remote image exceeds 10MB limit');
      }

      const arrayBuffer = await response.arrayBuffer();
      imageData = Buffer.from(arrayBuffer).toString('base64');
      mediaType = getMediaType(contentType);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw Errors.invalidImage('Image fetch timed out');
      }
      throw error;
    }
  } else {
    throw Errors.badRequest('Either image file or imageUrl is required');
  }

  // Call Claude API for image analysis
  let message;
  try {
    message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageData,
              },
            },
            {
              type: 'text',
              text: `이 이미지를 분석하여 웹 UI 테마에 적합한 색상 팔레트를 추출해주세요.

다음 형식의 JSON으로만 응답해주세요:
{
  "colors": ["#RRGGBB", "#RRGGBB", ...],
  "primary": "#RRGGBB",
  "secondary": "#RRGGBB",
  "accent": "#RRGGBB",
  "background": "#RRGGBB",
  "surface": "#RRGGBB",
  "text": "#RRGGBB",
  "mood": "설명",
  "suggestion": "테마 활용 제안"
}

색상은 5-10개 정도로, 이미지의 주요 색상을 조화롭게 추출해주세요.
primary, secondary, accent는 UI의 주요 색상으로 사용됩니다.
background와 surface는 배경색, text는 텍스트 색상입니다.`,
            },
          ],
        },
      ],
    });
  } catch (error) {
    if (error instanceof Error) {
      throw Errors.externalApi('Claude AI', error.message);
    }
    throw Errors.themeExtractionFailed('Claude API call failed');
  }

  // Parse response
  const textContent = message.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw Errors.themeExtractionFailed('No text response from Claude');
  }

  // Extract JSON from response
  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw Errors.themeExtractionFailed('Could not parse JSON from response');
  }

  let parsedData: unknown;
  try {
    parsedData = JSON.parse(jsonMatch[0]) as unknown;
  } catch {
    throw Errors.themeExtractionFailed('Invalid JSON in response');
  }

  // Validate with Zod schema (lenient parsing)
  const validationResult = claudeThemeResponseSchema.safeParse(parsedData);
  if (!validationResult.success) {
    console.error('Theme validation failed:', validationResult.error);
    throw Errors.themeExtractionFailed('Invalid theme data structure');
  }

  const themeData = validationResult.data;

  // Validate and sanitize colors
  const validatedColors = themeData.colors.filter(isValidHexColor);
  if (validatedColors.length === 0) {
    throw Errors.themeExtractionFailed('No valid colors extracted');
  }

  const theme: Theme = {
    id: `theme-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    colors: validatedColors,
    primary: isValidHexColor(themeData.primary || '') ? themeData.primary : validatedColors[0],
    secondary: isValidHexColor(themeData.secondary || '') ? themeData.secondary : validatedColors[1],
    accent: isValidHexColor(themeData.accent || '') ? themeData.accent : validatedColors[2],
    background: isValidHexColor(themeData.background || '') ? themeData.background : undefined,
    surface: isValidHexColor(themeData.surface || '') ? themeData.surface : undefined,
    text: isValidHexColor(themeData.text || '') ? themeData.text : undefined,
    mood: themeData.mood?.substring(0, 500),
    suggestion: themeData.suggestion?.substring(0, 1000),
    createdAt: new Date().toISOString(),
  };

  return theme;
}

/**
 * Convert MIME type to Claude API format
 */
function getMediaType(mimeType: string): ImageMediaType {
  const typeMap: Record<string, ImageMediaType> = {
    'image/jpeg': 'image/jpeg',
    'image/jpg': 'image/jpeg',
    'image/png': 'image/png',
    'image/gif': 'image/gif',
    'image/webp': 'image/webp',
  };

  return typeMap[mimeType.toLowerCase()] || 'image/png';
}

/**
 * Validate color palette format
 */
export function validateColorPalette(colors: string[]): boolean {
  return colors.every(isValidHexColor);
}

/**
 * Calculate contrast ratio (WCAG accessibility)
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): number[] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

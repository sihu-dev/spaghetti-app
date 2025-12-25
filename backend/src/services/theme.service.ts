import Anthropic from '@anthropic-ai/sdk';
import { Theme } from '../types';
import { prisma } from '../lib/prisma';

// Claude API 클라이언트 초기화
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

/**
 * 이미지에서 테마 색상을 추출하는 서비스
 */
export async function extractThemeFromImage(
  imageFile?: Express.Multer.File,
  imageUrl?: string
): Promise<Theme> {
  let imageData: string;
  let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

  if (imageFile) {
    // 업로드된 파일 처리
    imageData = imageFile.buffer.toString('base64');
    mediaType = getMediaType(imageFile.mimetype);
  } else if (imageUrl) {
    // URL에서 이미지 가져오기
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    imageData = Buffer.from(arrayBuffer).toString('base64');
    mediaType = getMediaType(response.headers.get('content-type') || 'image/png');
  } else {
    throw new Error('No image provided');
  }

  // Claude API로 이미지 분석
  const message = await anthropic.messages.create({
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
              data: imageData
            }
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
background와 surface는 배경색, text는 텍스트 색상입니다.`
          }
        ]
      }
    ]
  });

  // 응답 파싱
  const textContent = message.content.find(c => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('Failed to get response from Claude');
  }

  // JSON 추출
  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse theme from response');
  }

  const themeData = JSON.parse(jsonMatch[0]);
  
  const theme: Theme = {
    colors: themeData.colors || [],
    primary: themeData.primary,
    secondary: themeData.secondary,
    accent: themeData.accent,
    background: themeData.background,
    surface: themeData.surface,
    text: themeData.text,
    mood: themeData.mood,
    suggestion: themeData.suggestion,
    createdAt: new Date().toISOString()
  };

  return theme;
}

/**
 * MIME 타입을 Claude API 형식으로 변환
 */
function getMediaType(
  mimeType: string
): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
  const typeMap: Record<string, 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'> = {
    'image/jpeg': 'image/jpeg',
    'image/jpg': 'image/jpeg',
    'image/png': 'image/png',
    'image/gif': 'image/gif',
    'image/webp': 'image/webp'
  };
  
  return typeMap[mimeType] || 'image/png';
}

/**
 * 색상 조합 유효성 검사
 */
export function validateColorPalette(colors: string[]): boolean {
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  return colors.every(color => hexRegex.test(color));
}

/**
 * 대비 비율 계산 (WCAG 접근성)
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
  const [r, g, b] = rgb.map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): number[] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ];
}

/**
 * Save theme to database
 */
export async function saveTheme(theme: Theme): Promise<Theme> {
  const savedTheme = await prisma.theme.create({
    data: {
      colors: JSON.stringify(theme.colors),
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent,
      background: theme.background,
      surface: theme.surface,
      text: theme.text,
      mood: theme.mood,
      suggestion: theme.suggestion,
      savedAt: new Date()
    }
  });

  return {
    id: savedTheme.id,
    colors: JSON.parse(savedTheme.colors),
    primary: savedTheme.primary || undefined,
    secondary: savedTheme.secondary || undefined,
    accent: savedTheme.accent || undefined,
    background: savedTheme.background || undefined,
    surface: savedTheme.surface || undefined,
    text: savedTheme.text || undefined,
    mood: savedTheme.mood || undefined,
    suggestion: savedTheme.suggestion || undefined,
    createdAt: savedTheme.createdAt.toISOString(),
    savedAt: savedTheme.savedAt?.toISOString()
  };
}

/**
 * Get theme by ID from database
 */
export async function getThemeById(id: number): Promise<Theme | null> {
  const theme = await prisma.theme.findUnique({
    where: { id }
  });

  if (!theme) return null;

  return {
    id: theme.id,
    colors: JSON.parse(theme.colors),
    primary: theme.primary || undefined,
    secondary: theme.secondary || undefined,
    accent: theme.accent || undefined,
    background: theme.background || undefined,
    surface: theme.surface || undefined,
    text: theme.text || undefined,
    mood: theme.mood || undefined,
    suggestion: theme.suggestion || undefined,
    createdAt: theme.createdAt.toISOString(),
    savedAt: theme.savedAt?.toISOString()
  };
}

/**
 * Get all themes from database
 */
export async function getAllThemes(): Promise<Theme[]> {
  const themes = await prisma.theme.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return themes.map(theme => ({
    id: theme.id,
    colors: JSON.parse(theme.colors),
    primary: theme.primary || undefined,
    secondary: theme.secondary || undefined,
    accent: theme.accent || undefined,
    background: theme.background || undefined,
    surface: theme.surface || undefined,
    text: theme.text || undefined,
    mood: theme.mood || undefined,
    suggestion: theme.suggestion || undefined,
    createdAt: theme.createdAt.toISOString(),
    savedAt: theme.savedAt?.toISOString()
  }));
}

/**
 * Delete theme from database
 */
export async function deleteTheme(id: number): Promise<boolean> {
  try {
    await prisma.theme.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    return false;
  }
}

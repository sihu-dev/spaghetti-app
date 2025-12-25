import { themeSchema, claudeThemeResponseSchema } from '../../schemas/theme.schema';

describe('Theme Schemas', () => {
  describe('themeSchema', () => {
    it('should validate a complete theme', () => {
      const validTheme = {
        id: 'theme-123',
        colors: ['#FF5733', '#33FF57', '#3357FF'],
        primary: '#FF5733',
        secondary: '#33FF57',
        accent: '#3357FF',
        background: '#FFFFFF',
        surface: '#F5F5F5',
        text: '#000000',
        mood: 'Vibrant and energetic',
        suggestion: 'Great for creative websites',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const result = themeSchema.safeParse(validTheme);
      expect(result.success).toBe(true);
    });

    it('should validate a minimal theme', () => {
      const minimalTheme = {
        colors: ['#FF5733'],
      };

      const result = themeSchema.safeParse(minimalTheme);
      expect(result.success).toBe(true);
    });

    it('should reject theme without colors', () => {
      const noColors = {
        primary: '#FF5733',
      };

      const result = themeSchema.safeParse(noColors);
      expect(result.success).toBe(false);
    });

    it('should reject empty colors array', () => {
      const emptyColors = {
        colors: [],
      };

      const result = themeSchema.safeParse(emptyColors);
      expect(result.success).toBe(false);
    });

    it('should reject invalid hex colors', () => {
      const invalidColors = {
        colors: ['#FF5733', 'not-a-color', '#33FF57'],
      };

      const result = themeSchema.safeParse(invalidColors);
      expect(result.success).toBe(false);
    });

    it('should reject colors array with more than 20 items', () => {
      const tooManyColors = {
        colors: Array(21).fill('#FF5733'),
      };

      const result = themeSchema.safeParse(tooManyColors);
      expect(result.success).toBe(false);
    });

    it('should reject invalid primary color format', () => {
      const invalidPrimary = {
        colors: ['#FF5733'],
        primary: 'red',
      };

      const result = themeSchema.safeParse(invalidPrimary);
      expect(result.success).toBe(false);
    });

    it('should truncate long mood strings', () => {
      const longMood = {
        colors: ['#FF5733'],
        mood: 'a'.repeat(600),
      };

      const result = themeSchema.safeParse(longMood);
      expect(result.success).toBe(false);
    });
  });

  describe('claudeThemeResponseSchema', () => {
    it('should validate Claude AI response', () => {
      const claudeResponse = {
        colors: ['#FF5733', '#33FF57', '#3357FF', '#F5F5F5', '#333333'],
        primary: '#FF5733',
        secondary: '#33FF57',
        accent: '#3357FF',
        background: '#FFFFFF',
        surface: '#F5F5F5',
        text: '#000000',
        mood: '활기차고 에너지 넘치는 분위기',
        suggestion: '크리에이티브 웹사이트에 적합합니다',
      };

      const result = claudeThemeResponseSchema.safeParse(claudeResponse);
      expect(result.success).toBe(true);
    });

    it('should accept minimal Claude response', () => {
      const minimalResponse = {
        colors: ['#FF5733'],
      };

      const result = claudeThemeResponseSchema.safeParse(minimalResponse);
      expect(result.success).toBe(true);
    });

    it('should be more lenient with color format (allows any string)', () => {
      const lenientResponse = {
        colors: ['#FF5733', 'rgb(255, 0, 0)'], // Claude might return various formats
        primary: 'red', // Non-hex format
      };

      const result = claudeThemeResponseSchema.safeParse(lenientResponse);
      expect(result.success).toBe(true);
    });
  });
});

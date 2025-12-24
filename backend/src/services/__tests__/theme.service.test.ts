import {
  validateColorPalette,
  calculateContrastRatio
} from '../theme.service';

// Mock the Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  const mockCreate = jest.fn();
  const MockAnthropic = jest.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate
    }
  }));
  // Store mockCreate on the constructor so we can access it
  (MockAnthropic as any).mockCreate = mockCreate;
  return MockAnthropic;
});

describe('Theme Service', () => {
  describe('validateColorPalette', () => {
    it('should return true for valid hex colors', () => {
      const validColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000'];
      expect(validateColorPalette(validColors)).toBe(true);
    });

    it('should return true for valid hex colors with lowercase letters', () => {
      const validColors = ['#ff0000', '#00ff00', '#0000ff', '#abcdef'];
      expect(validateColorPalette(validColors)).toBe(true);
    });

    it('should return false for invalid hex colors without hash', () => {
      const invalidColors = ['FF0000', '#00FF00'];
      expect(validateColorPalette(invalidColors)).toBe(false);
    });

    it('should return false for hex colors with wrong length', () => {
      const invalidColors = ['#FFF', '#00FF00'];
      expect(validateColorPalette(invalidColors)).toBe(false);
    });

    it('should return false for non-hex characters', () => {
      const invalidColors = ['#GGGGGG', '#00FF00'];
      expect(validateColorPalette(invalidColors)).toBe(false);
    });

    it('should return true for empty array', () => {
      expect(validateColorPalette([])).toBe(true);
    });
  });

  describe('calculateContrastRatio', () => {
    it('should calculate contrast ratio for black and white', () => {
      const ratio = calculateContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate contrast ratio for same colors', () => {
      const ratio = calculateContrastRatio('#FF0000', '#FF0000');
      expect(ratio).toBe(1);
    });

    it('should calculate contrast ratio symmetrically', () => {
      const ratio1 = calculateContrastRatio('#FF0000', '#0000FF');
      const ratio2 = calculateContrastRatio('#0000FF', '#FF0000');
      expect(ratio1).toBe(ratio2);
    });

    it('should calculate correct ratio for red and blue', () => {
      const ratio = calculateContrastRatio('#FF0000', '#0000FF');
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(21);
    });

    it('should calculate contrast for gray colors', () => {
      const ratio = calculateContrastRatio('#888888', '#CCCCCC');
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(5);
    });

    it('should handle lowercase hex colors', () => {
      const ratio = calculateContrastRatio('#ffffff', '#000000');
      expect(ratio).toBeCloseTo(21, 0);
    });
  });

  describe('extractThemeFromImage', () => {
    let mockCreate: jest.Mock;

    beforeEach(() => {
      // Clear all mocks before each test
      jest.clearAllMocks();
      // Get the mock create function from the mocked Anthropic
      const Anthropic = require('@anthropic-ai/sdk');
      mockCreate = (Anthropic as any).mockCreate;
    });

    it('should extract theme from uploaded image file', async () => {
      const { extractThemeFromImage } = require('../theme.service');

      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/png'
      } as Express.Multer.File;

      const mockResponse = {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              colors: ['#FF0000', '#00FF00', '#0000FF'],
              primary: '#FF0000',
              secondary: '#00FF00',
              accent: '#0000FF',
              background: '#FFFFFF',
              surface: '#F5F5F5',
              text: '#000000',
              mood: 'vibrant',
              suggestion: 'Use for energetic designs'
            })
          }
        ]
      };

      mockCreate.mockResolvedValue(mockResponse);

      const theme = await extractThemeFromImage(mockFile);

      expect(theme).toBeDefined();
      expect(theme.colors).toHaveLength(3);
      expect(theme.primary).toBe('#FF0000');
      expect(theme.secondary).toBe('#00FF00');
      expect(theme.mood).toBe('vibrant');
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should extract theme from image URL', async () => {
      const { extractThemeFromImage } = require('../theme.service');

      global.fetch = jest.fn().mockResolvedValue({
        arrayBuffer: async () => new ArrayBuffer(8),
        headers: {
          get: () => 'image/jpeg'
        }
      });

      const mockResponse = {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              colors: ['#123456', '#789ABC'],
              primary: '#123456',
              secondary: '#789ABC',
              accent: '#FEDCBA',
              background: '#FFFFFF',
              surface: '#F0F0F0',
              text: '#333333',
              mood: 'calm',
              suggestion: 'Use for professional designs'
            })
          }
        ]
      };

      mockCreate.mockResolvedValue(mockResponse);

      const theme = await extractThemeFromImage(undefined, 'https://example.com/image.jpg');

      expect(theme).toBeDefined();
      expect(theme.primary).toBe('#123456');
      expect(theme.mood).toBe('calm');
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/image.jpg');
    });

    it('should throw error when no image is provided', async () => {
      const { extractThemeFromImage } = require('../theme.service');
      await expect(extractThemeFromImage()).rejects.toThrow('No image provided');
    });

    it('should throw error when Claude API response is invalid', async () => {
      const { extractThemeFromImage } = require('../theme.service');

      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/png'
      } as Express.Multer.File;

      const mockResponse = {
        content: [
          {
            type: 'image',
            source: {}
          }
        ]
      };

      mockCreate.mockResolvedValue(mockResponse);

      await expect(extractThemeFromImage(mockFile)).rejects.toThrow(
        'Failed to get response from Claude'
      );
    });

    it('should throw error when response does not contain valid JSON', async () => {
      const { extractThemeFromImage } = require('../theme.service');

      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/png'
      } as Express.Multer.File;

      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'This is not JSON'
          }
        ]
      };

      mockCreate.mockResolvedValue(mockResponse);

      await expect(extractThemeFromImage(mockFile)).rejects.toThrow(
        'Failed to parse theme from response'
      );
    });

    it('should handle different image MIME types', async () => {
      const { extractThemeFromImage } = require('../theme.service');

      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/webp'
      } as Express.Multer.File;

      const mockResponse = {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              colors: ['#AAAAAA'],
              primary: '#AAAAAA',
              secondary: '#BBBBBB',
              accent: '#CCCCCC',
              background: '#FFFFFF',
              surface: '#EEEEEE',
              text: '#000000',
              mood: 'neutral',
              suggestion: 'Versatile design'
            })
          }
        ]
      };

      mockCreate.mockResolvedValue(mockResponse);

      const theme = await extractThemeFromImage(mockFile);

      expect(theme).toBeDefined();
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.arrayContaining([
                expect.objectContaining({
                  type: 'image',
                  source: expect.objectContaining({
                    media_type: 'image/webp'
                  })
                })
              ])
            })
          ])
        })
      );
    });
  });
});

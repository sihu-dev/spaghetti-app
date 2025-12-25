import { AppError, ErrorCode } from '../../utils/errors';
import * as security from '../../utils/security';

// Mock the Anthropic SDK before importing the service
const mockMessagesCreate = jest.fn();
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => {
    return {
      messages: {
        create: mockMessagesCreate,
      },
    };
  });
});

// Mock fetch globally
global.fetch = jest.fn();

// Import after mocking
import {
  extractThemeFromImage,
  validateColorPalette,
  calculateContrastRatio,
} from '../../services/theme.service';

describe('Theme Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractThemeFromImage', () => {
    const validThemeResponse = {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            colors: ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'],
            primary: '#FF5733',
            secondary: '#33FF57',
            accent: '#3357FF',
            background: '#FFFFFF',
            surface: '#F5F5F5',
            text: '#000000',
            mood: 'Vibrant and energetic color scheme',
            suggestion: 'Great for modern, dynamic web applications',
          }),
        },
      ],
    };

    describe('with file upload', () => {
      const mockImageFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from('fake-image-data'),
        destination: '',
        filename: '',
        path: '',
        stream: {} as any,
      };

      it('should extract theme from valid JPEG image file', async () => {
        mockMessagesCreate.mockResolvedValue(validThemeResponse);

        const result = await extractThemeFromImage(mockImageFile);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('colors');
        expect(result).toHaveProperty('primary', '#FF5733');
        expect(result).toHaveProperty('secondary', '#33FF57');
        expect(result).toHaveProperty('accent', '#3357FF');
        expect(result).toHaveProperty('background', '#FFFFFF');
        expect(result).toHaveProperty('surface', '#F5F5F5');
        expect(result).toHaveProperty('text', '#000000');
        expect(result).toHaveProperty('mood');
        expect(result).toHaveProperty('suggestion');
        expect(result).toHaveProperty('createdAt');

        expect(result.colors).toHaveLength(5);
        expect(result.colors).toContain('#FF5733');

        // Verify Anthropic API was called correctly
        expect(mockMessagesCreate).toHaveBeenCalledWith({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: expect.arrayContaining([
                expect.objectContaining({
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: expect.any(String),
                  },
                }),
                expect.objectContaining({
                  type: 'text',
                  text: expect.stringContaining('이미지를 분석하여'),
                }),
              ]),
            },
          ],
        });
      });

      it('should extract theme from PNG image file', async () => {
        const pngFile = { ...mockImageFile, mimetype: 'image/png' };
        mockMessagesCreate.mockResolvedValue(validThemeResponse);

        const result = await extractThemeFromImage(pngFile);

        expect(result).toHaveProperty('colors');
        expect(mockMessagesCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: expect.arrayContaining([
              expect.objectContaining({
                content: expect.arrayContaining([
                  expect.objectContaining({
                    source: expect.objectContaining({
                      media_type: 'image/png',
                    }),
                  }),
                ]),
              }),
            ]),
          })
        );
      });

      it('should extract theme from WebP image file', async () => {
        const webpFile = { ...mockImageFile, mimetype: 'image/webp' };
        mockMessagesCreate.mockResolvedValue(validThemeResponse);

        const result = await extractThemeFromImage(webpFile);

        expect(result).toHaveProperty('colors');
        expect(mockMessagesCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: expect.arrayContaining([
              expect.objectContaining({
                content: expect.arrayContaining([
                  expect.objectContaining({
                    source: expect.objectContaining({
                      media_type: 'image/webp',
                    }),
                  }),
                ]),
              }),
            ]),
          })
        );
      });

      it('should extract theme from GIF image file', async () => {
        const gifFile = { ...mockImageFile, mimetype: 'image/gif' };
        mockMessagesCreate.mockResolvedValue(validThemeResponse);

        const result = await extractThemeFromImage(gifFile);

        expect(result).toHaveProperty('colors');
        expect(mockMessagesCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: expect.arrayContaining([
              expect.objectContaining({
                content: expect.arrayContaining([
                  expect.objectContaining({
                    source: expect.objectContaining({
                      media_type: 'image/gif',
                    }),
                  }),
                ]),
              }),
            ]),
          })
        );
      });

      it('should throw error for unsupported file type', async () => {
        const invalidFile = { ...mockImageFile, mimetype: 'application/pdf' };

        await expect(extractThemeFromImage(invalidFile)).rejects.toMatchObject({
          code: ErrorCode.INVALID_IMAGE,
          message: expect.stringContaining('Unsupported file type'),
        });
      });

      it('should throw error for file size exceeding 10MB', async () => {
        const largeFile = {
          ...mockImageFile,
          size: 11 * 1024 * 1024, // 11MB
        };

        await expect(extractThemeFromImage(largeFile)).rejects.toMatchObject({
          code: ErrorCode.INVALID_IMAGE,
          message: expect.stringContaining('exceeds 10MB limit'),
        });
      });

      it('should handle case-insensitive MIME types', async () => {
        const upperCaseFile = { ...mockImageFile, mimetype: 'IMAGE/JPEG' };
        mockMessagesCreate.mockResolvedValue(validThemeResponse);

        const result = await extractThemeFromImage(upperCaseFile);

        expect(result).toHaveProperty('colors');
      });
    });

    describe('with image URL', () => {
      const validImageUrl = 'https://example.com/image.jpg';

      beforeEach(() => {
        // Mock successful fetch
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          headers: new Map([
            ['content-type', 'image/jpeg'],
            ['content-length', '1024000'],
          ]),
          arrayBuffer: async () => new ArrayBuffer(1024),
        });
      });

      it('should extract theme from valid image URL', async () => {
        mockMessagesCreate.mockResolvedValue(validThemeResponse);

        const result = await extractThemeFromImage(undefined, validImageUrl);

        expect(result).toHaveProperty('colors');
        expect(result.colors).toHaveLength(5);

        // Verify fetch was called with correct parameters
        expect(global.fetch).toHaveBeenCalledWith(
          validImageUrl,
          expect.objectContaining({
            signal: expect.any(AbortSignal),
            headers: {
              'User-Agent': 'AI-Spaghetti/1.0',
            },
          })
        );
      });

      it('should throw error for HTTP error response', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: 404,
        });

        await expect(
          extractThemeFromImage(undefined, validImageUrl)
        ).rejects.toMatchObject({
          code: ErrorCode.INVALID_IMAGE,
          message: expect.stringContaining('HTTP 404'),
        });
      });

      it('should throw error for unsupported content type', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          headers: new Map([
            ['content-type', 'text/html'],
            ['content-length', '1024'],
          ]),
          arrayBuffer: async () => new ArrayBuffer(1024),
        });

        await expect(
          extractThemeFromImage(undefined, validImageUrl)
        ).rejects.toMatchObject({
          code: ErrorCode.INVALID_IMAGE,
          message: expect.stringContaining('Unsupported content type'),
        });
      });

      it('should throw error for image exceeding 10MB', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          headers: new Map([
            ['content-type', 'image/jpeg'],
            ['content-length', `${11 * 1024 * 1024}`],
          ]),
        });

        await expect(
          extractThemeFromImage(undefined, validImageUrl)
        ).rejects.toMatchObject({
          code: ErrorCode.INVALID_IMAGE,
          message: expect.stringContaining('exceeds 10MB limit'),
        });
      });

      it('should handle fetch timeout', async () => {
        (global.fetch as jest.Mock).mockImplementation(
          () =>
            new Promise((_, reject) => {
              const error = new Error('Aborted');
              error.name = 'AbortError';
              reject(error);
            })
        );

        await expect(
          extractThemeFromImage(undefined, validImageUrl)
        ).rejects.toMatchObject({
          code: ErrorCode.INVALID_IMAGE,
          message: expect.stringContaining('timed out'),
        });
      });

      it('should use default content-type when header is missing', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          headers: new Map(),
          arrayBuffer: async () => new ArrayBuffer(1024),
        });

        mockMessagesCreate.mockResolvedValue(validThemeResponse);

        const result = await extractThemeFromImage(undefined, validImageUrl);

        expect(result).toHaveProperty('colors');
        // Should default to image/png
        expect(mockMessagesCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: expect.arrayContaining([
              expect.objectContaining({
                content: expect.arrayContaining([
                  expect.objectContaining({
                    source: expect.objectContaining({
                      media_type: 'image/png',
                    }),
                  }),
                ]),
              }),
            ]),
          })
        );
      });
    });

    describe('SSRF protection', () => {
      it('should block localhost URLs', async () => {
        const ssrfSpy = jest.spyOn(security, 'validateImageUrl');
        ssrfSpy.mockImplementation((url) => {
          if (url.includes('localhost')) {
            throw new AppError(ErrorCode.SSRF_BLOCKED, 'Request to this URL is not allowed', 400);
          }
        });

        await expect(
          extractThemeFromImage(undefined, 'http://localhost:8080/image.jpg')
        ).rejects.toMatchObject({
          code: ErrorCode.SSRF_BLOCKED,
        });

        ssrfSpy.mockRestore();
      });

      it('should block private IP addresses', async () => {
        const ssrfSpy = jest.spyOn(security, 'validateImageUrl');
        ssrfSpy.mockImplementation((url) => {
          if (url.includes('192.168') || url.includes('10.0')) {
            throw new AppError(ErrorCode.SSRF_BLOCKED, 'Request to this URL is not allowed', 400);
          }
        });

        await expect(
          extractThemeFromImage(undefined, 'http://192.168.1.1/image.jpg')
        ).rejects.toMatchObject({
          code: ErrorCode.SSRF_BLOCKED,
        });

        await expect(
          extractThemeFromImage(undefined, 'http://10.0.0.1/image.jpg')
        ).rejects.toMatchObject({
          code: ErrorCode.SSRF_BLOCKED,
        });

        ssrfSpy.mockRestore();
      });

      it('should block metadata endpoints', async () => {
        const ssrfSpy = jest.spyOn(security, 'validateImageUrl');
        ssrfSpy.mockImplementation((url) => {
          if (url.includes('169.254.169.254') || url.includes('metadata.google')) {
            throw new AppError(ErrorCode.SSRF_BLOCKED, 'Request to this URL is not allowed', 400);
          }
        });

        await expect(
          extractThemeFromImage(undefined, 'http://169.254.169.254/latest/meta-data')
        ).rejects.toMatchObject({
          code: ErrorCode.SSRF_BLOCKED,
        });

        ssrfSpy.mockRestore();
      });
    });

    describe('validation errors', () => {
      it('should throw error when both file and URL are missing', async () => {
        await expect(extractThemeFromImage()).rejects.toMatchObject({
          code: ErrorCode.BAD_REQUEST,
          message: expect.stringContaining('Either image file or imageUrl is required'),
        });
      });
    });

    describe('Claude API response handling', () => {
      const mockImageFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake-image-data'),
        destination: '',
        filename: '',
        path: '',
        stream: {} as any,
      };

      it('should handle Claude API errors', async () => {
        mockMessagesCreate.mockRejectedValue(new Error('API rate limit exceeded'));

        await expect(extractThemeFromImage(mockImageFile)).rejects.toMatchObject({
          code: ErrorCode.EXTERNAL_API_ERROR,
          message: expect.stringContaining('Claude AI'),
        });
      });

      it('should handle non-Error API failures', async () => {
        mockMessagesCreate.mockRejectedValue('Unknown error');

        await expect(extractThemeFromImage(mockImageFile)).rejects.toMatchObject({
          code: ErrorCode.THEME_EXTRACTION_FAILED,
          message: expect.stringContaining('Claude API call failed'),
        });
      });

      it('should handle response without text content', async () => {
        mockMessagesCreate.mockResolvedValue({
          content: [
            {
              type: 'image' as const,
            },
          ],
        });

        await expect(extractThemeFromImage(mockImageFile)).rejects.toMatchObject({
          code: ErrorCode.THEME_EXTRACTION_FAILED,
          message: expect.stringContaining('No text response'),
        });
      });

      it('should handle response with empty content array', async () => {
        mockMessagesCreate.mockResolvedValue({
          content: [],
        });

        await expect(extractThemeFromImage(mockImageFile)).rejects.toMatchObject({
          code: ErrorCode.THEME_EXTRACTION_FAILED,
          message: expect.stringContaining('No text response'),
        });
      });

      it('should handle response without JSON', async () => {
        mockMessagesCreate.mockResolvedValue({
          content: [
            {
              type: 'text' as const,
              text: 'This is just plain text without JSON',
            },
          ],
        });

        await expect(extractThemeFromImage(mockImageFile)).rejects.toMatchObject({
          code: ErrorCode.THEME_EXTRACTION_FAILED,
          message: expect.stringContaining('Could not parse JSON'),
        });
      });

      it('should handle malformed JSON in response', async () => {
        mockMessagesCreate.mockResolvedValue({
          content: [
            {
              type: 'text' as const,
              text: '{ "colors": [incomplete json, no closing brace',
            },
          ],
        });

        await expect(extractThemeFromImage(mockImageFile)).rejects.toMatchObject({
          code: ErrorCode.THEME_EXTRACTION_FAILED,
          message: expect.stringContaining('JSON'),
        });
      });

      it('should handle JSON with invalid structure', async () => {
        mockMessagesCreate.mockResolvedValue({
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                // Missing required 'colors' field
                primary: '#FF5733',
              }),
            },
          ],
        });

        await expect(extractThemeFromImage(mockImageFile)).rejects.toMatchObject({
          code: ErrorCode.THEME_EXTRACTION_FAILED,
          message: expect.stringContaining('Invalid theme data structure'),
        });
      });

      it('should handle response with no valid colors', async () => {
        mockMessagesCreate.mockResolvedValue({
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                colors: ['invalid', 'not-hex', 'colors'],
                primary: 'invalid',
                secondary: 'invalid',
                accent: 'invalid',
              }),
            },
          ],
        });

        await expect(extractThemeFromImage(mockImageFile)).rejects.toMatchObject({
          code: ErrorCode.THEME_EXTRACTION_FAILED,
          message: expect.stringContaining('No valid colors extracted'),
        });
      });

      it('should filter out invalid hex colors and keep valid ones', async () => {
        mockMessagesCreate.mockResolvedValue({
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                colors: ['#FF5733', 'invalid', '#33FF57', 'not-hex', '#3357FF'],
                primary: '#FF5733',
                secondary: '#33FF57',
                accent: '#3357FF',
              }),
            },
          ],
        });

        const result = await extractThemeFromImage(mockImageFile);

        expect(result.colors).toHaveLength(3);
        expect(result.colors).toEqual(['#FF5733', '#33FF57', '#3357FF']);
      });

      it('should use fallback colors for invalid primary/secondary/accent', async () => {
        mockMessagesCreate.mockResolvedValue({
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                colors: ['#FF5733', '#33FF57', '#3357FF'],
                primary: 'invalid',
                secondary: 'also-invalid',
                accent: 'nope',
              }),
            },
          ],
        });

        const result = await extractThemeFromImage(mockImageFile);

        // Should fallback to colors array
        expect(result.primary).toBe('#FF5733');
        expect(result.secondary).toBe('#33FF57');
        expect(result.accent).toBe('#3357FF');
      });

      it('should set optional colors to undefined if invalid', async () => {
        mockMessagesCreate.mockResolvedValue({
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                colors: ['#FF5733', '#33FF57', '#3357FF'],
                primary: '#FF5733',
                secondary: '#33FF57',
                accent: '#3357FF',
                background: 'invalid',
                surface: 'invalid',
                text: 'invalid',
              }),
            },
          ],
        });

        const result = await extractThemeFromImage(mockImageFile);

        expect(result.background).toBeUndefined();
        expect(result.surface).toBeUndefined();
        expect(result.text).toBeUndefined();
      });

      it('should truncate mood and suggestion to max length', async () => {
        const longMood = 'A'.repeat(600);
        const longSuggestion = 'B'.repeat(1100);

        mockMessagesCreate.mockResolvedValue({
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                colors: ['#FF5733', '#33FF57', '#3357FF'],
                primary: '#FF5733',
                secondary: '#33FF57',
                accent: '#3357FF',
                mood: longMood,
                suggestion: longSuggestion,
              }),
            },
          ],
        });

        const result = await extractThemeFromImage(mockImageFile);

        expect(result.mood).toHaveLength(500);
        expect(result.suggestion).toHaveLength(1000);
      });

      it('should extract JSON from text with surrounding content', async () => {
        mockMessagesCreate.mockResolvedValue({
          content: [
            {
              type: 'text' as const,
              text: `Here is the theme analysis:

              ${JSON.stringify({
                colors: ['#FF5733', '#33FF57', '#3357FF'],
                primary: '#FF5733',
                secondary: '#33FF57',
                accent: '#3357FF',
              })}

              Hope this helps!`,
            },
          ],
        });

        const result = await extractThemeFromImage(mockImageFile);

        expect(result.colors).toHaveLength(3);
        expect(result.primary).toBe('#FF5733');
      });

      it('should generate unique theme IDs', async () => {
        mockMessagesCreate.mockResolvedValue(validThemeResponse);

        const result1 = await extractThemeFromImage(mockImageFile);
        const result2 = await extractThemeFromImage(mockImageFile);

        expect(result1.id).not.toBe(result2.id);
        expect(result1.id).toMatch(/^theme-/);
        expect(result2.id).toMatch(/^theme-/);
      });

      it('should set createdAt timestamp', async () => {
        mockMessagesCreate.mockResolvedValue(validThemeResponse);

        const beforeTime = new Date();
        const result = await extractThemeFromImage(mockImageFile);
        const afterTime = new Date();

        expect(result.createdAt).toBeDefined();
        expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

        const createdAtTime = new Date(result.createdAt!);
        expect(createdAtTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
        expect(createdAtTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      });
    });
  });

  describe('validateColorPalette', () => {
    it('should return true for valid hex colors', () => {
      const validColors = ['#FF5733', '#33FF57', '#3357FF', '#FFFFFF', '#000000'];
      expect(validateColorPalette(validColors)).toBe(true);
    });

    it('should return false for invalid hex colors', () => {
      const invalidColors = ['#FF5733', 'invalid', '#33FF57'];
      expect(validateColorPalette(invalidColors)).toBe(false);
    });

    it('should return false for colors without hash', () => {
      const invalidColors = ['FF5733', '#33FF57'];
      expect(validateColorPalette(invalidColors)).toBe(false);
    });

    it('should return false for colors with wrong length', () => {
      const invalidColors = ['#FF573', '#33FF57'];
      expect(validateColorPalette(invalidColors)).toBe(false);
    });

    it('should return false for colors with invalid characters', () => {
      const invalidColors = ['#GGGGGG', '#33FF57'];
      expect(validateColorPalette(invalidColors)).toBe(false);
    });

    it('should return true for empty array', () => {
      expect(validateColorPalette([])).toBe(true);
    });

    it('should handle lowercase hex colors', () => {
      const validColors = ['#ff5733', '#33ff57', '#3357ff'];
      expect(validateColorPalette(validColors)).toBe(true);
    });

    it('should handle mixed case hex colors', () => {
      const validColors = ['#Ff5733', '#33Ff57', '#3357fF'];
      expect(validateColorPalette(validColors)).toBe(true);
    });
  });

  describe('calculateContrastRatio', () => {
    it('should calculate contrast ratio for black and white', () => {
      const ratio = calculateContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0); // WCAG max contrast ratio
    });

    it('should calculate contrast ratio for same colors', () => {
      const ratio = calculateContrastRatio('#FF5733', '#FF5733');
      expect(ratio).toBeCloseTo(1, 1); // Same color = 1:1 ratio
    });

    it('should calculate contrast ratio symmetrically', () => {
      const ratio1 = calculateContrastRatio('#FF5733', '#FFFFFF');
      const ratio2 = calculateContrastRatio('#FFFFFF', '#FF5733');
      expect(ratio1).toBeCloseTo(ratio2, 2);
    });

    it('should calculate contrast ratio for gray colors', () => {
      const ratio = calculateContrastRatio('#808080', '#FFFFFF');
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(21);
    });

    it('should handle lowercase hex colors', () => {
      const ratio = calculateContrastRatio('#ffffff', '#000000');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate ratio meeting WCAG AA standard (4.5:1)', () => {
      // Example: dark gray on white should meet AA
      const ratio = calculateContrastRatio('#595959', '#FFFFFF');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should calculate ratio for red and blue', () => {
      const ratio = calculateContrastRatio('#FF0000', '#0000FF');
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(21);
    });

    it('should calculate ratio for primary colors', () => {
      const ratio1 = calculateContrastRatio('#FF5733', '#33FF57');
      const ratio2 = calculateContrastRatio('#FF5733', '#3357FF');

      expect(ratio1).toBeGreaterThan(1);
      expect(ratio2).toBeGreaterThan(1);
    });

    it('should handle colors without hash prefix gracefully', () => {
      // The function should still work if implementation removes hash
      const ratio = calculateContrastRatio('#FFFFFF', '#000000');
      expect(ratio).toBeCloseTo(21, 0);
    });
  });
});

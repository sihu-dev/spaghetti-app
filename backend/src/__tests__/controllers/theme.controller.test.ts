import { Request, Response, NextFunction } from 'express';
import { extractTheme, SuccessResponse } from '../../controllers/theme.controller';
import * as themeService from '../../services/theme.service';
import { Theme } from '../../schemas/theme.schema';
import { Errors } from '../../utils/errors';

// Mock the theme service
jest.mock('../../services/theme.service');

describe('Theme Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockTheme: Theme = {
    id: 'theme-123',
    colors: ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'],
    primary: '#FF5733',
    secondary: '#33FF57',
    accent: '#3357FF',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#000000',
    mood: 'Vibrant and energetic color scheme',
    suggestion: 'Great for modern, dynamic web applications',
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup response mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      file: undefined,
      body: {},
      headers: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = jest.fn();
  });

  describe('extractTheme', () => {
    describe('successful extraction', () => {
      it('should extract theme from uploaded image file', async () => {
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

        mockRequest.file = mockImageFile;

        (themeService.extractThemeFromImage as jest.Mock).mockResolvedValue(mockTheme);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(themeService.extractThemeFromImage).toHaveBeenCalledWith(
          mockImageFile,
          undefined
        );
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: mockTheme,
            timestamp: expect.any(String),
          })
        );
      });

      it('should extract theme from image URL', async () => {
        const imageUrl = 'https://example.com/image.jpg';
        mockRequest.body = { imageUrl };

        (themeService.extractThemeFromImage as jest.Mock).mockResolvedValue(mockTheme);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(themeService.extractThemeFromImage).toHaveBeenCalledWith(
          undefined,
          imageUrl
        );
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: mockTheme,
            timestamp: expect.any(String),
          })
        );
      });

      it('should include requestId in response when provided', async () => {
        const requestId = 'req-123';
        mockRequest.headers = { 'x-request-id': requestId };
        mockRequest.body = { imageUrl: 'https://example.com/image.jpg' };

        (themeService.extractThemeFromImage as jest.Mock).mockResolvedValue(mockTheme);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: mockTheme,
            requestId,
            timestamp: expect.any(String),
          })
        );
      });

      it('should return response with valid timestamp', async () => {
        mockRequest.body = { imageUrl: 'https://example.com/image.jpg' };

        (themeService.extractThemeFromImage as jest.Mock).mockResolvedValue(mockTheme);

        const beforeTime = new Date();
        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
        const afterTime = new Date();

        expect(jsonMock).toHaveBeenCalled();
        const response = jsonMock.mock.calls[0][0] as SuccessResponse<Theme>;

        expect(response.timestamp).toBeDefined();
        const responseTime = new Date(response.timestamp);
        expect(responseTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
        expect(responseTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      });

      it('should prefer file over URL when both are provided', async () => {
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

        mockRequest.file = mockImageFile;
        mockRequest.body = { imageUrl: 'https://example.com/image.jpg' };

        (themeService.extractThemeFromImage as jest.Mock).mockResolvedValue(mockTheme);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(themeService.extractThemeFromImage).toHaveBeenCalledWith(
          mockImageFile,
          'https://example.com/image.jpg'
        );
      });
    });

    describe('request validation', () => {
      it('should throw error when both image file and URL are missing', async () => {
        mockRequest.file = undefined;
        mockRequest.body = {};

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'BAD_REQUEST',
            message: 'Image file or URL is required',
            statusCode: 400,
          })
        );
        expect(themeService.extractThemeFromImage).not.toHaveBeenCalled();
      });

      it('should throw error when imageUrl is empty string', async () => {
        mockRequest.body = { imageUrl: '' };

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'BAD_REQUEST',
            message: 'Image file or URL is required',
          })
        );
      });

      it('should throw error when imageUrl is null', async () => {
        mockRequest.body = { imageUrl: null };

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'BAD_REQUEST',
            message: 'Image file or URL is required',
          })
        );
      });

      it('should throw error when imageUrl is undefined', async () => {
        mockRequest.body = { imageUrl: undefined };

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'BAD_REQUEST',
            message: 'Image file or URL is required',
          })
        );
      });
    });

    describe('error handling', () => {
      it('should handle service errors from extractThemeFromImage', async () => {
        mockRequest.body = { imageUrl: 'https://example.com/image.jpg' };

        const serviceError = Errors.invalidImage('Unsupported file type');
        (themeService.extractThemeFromImage as jest.Mock).mockRejectedValue(serviceError);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Wait for promise to settle
        await new Promise(process.nextTick);

        expect(mockNext).toHaveBeenCalledWith(serviceError);
        expect(statusMock).not.toHaveBeenCalled();
      });

      it('should handle theme extraction failed errors', async () => {
        mockRequest.body = { imageUrl: 'https://example.com/image.jpg' };

        const extractionError = Errors.themeExtractionFailed('Claude API error');
        (themeService.extractThemeFromImage as jest.Mock).mockRejectedValue(extractionError);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Wait for promise to settle
        await new Promise(process.nextTick);

        expect(mockNext).toHaveBeenCalledWith(extractionError);
      });

      it('should handle SSRF blocked errors', async () => {
        mockRequest.body = { imageUrl: 'http://localhost/image.jpg' };

        const ssrfError = Errors.ssrfBlocked('http://localhost/image.jpg');
        (themeService.extractThemeFromImage as jest.Mock).mockRejectedValue(ssrfError);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Wait for promise to settle
        await new Promise(process.nextTick);

        expect(mockNext).toHaveBeenCalledWith(ssrfError);
      });

      it('should handle external API errors', async () => {
        mockRequest.body = { imageUrl: 'https://example.com/image.jpg' };

        const apiError = Errors.externalApi('Claude AI', 'Rate limit exceeded');
        (themeService.extractThemeFromImage as jest.Mock).mockRejectedValue(apiError);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Wait for promise to settle
        await new Promise(process.nextTick);

        expect(mockNext).toHaveBeenCalledWith(apiError);
      });

      it('should handle unexpected errors', async () => {
        mockRequest.body = { imageUrl: 'https://example.com/image.jpg' };

        const unexpectedError = new Error('Unexpected error occurred');
        (themeService.extractThemeFromImage as jest.Mock).mockRejectedValue(unexpectedError);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Wait for promise to settle
        await new Promise(process.nextTick);

        expect(mockNext).toHaveBeenCalledWith(unexpectedError);
      });

      it('should handle network errors when fetching image URL', async () => {
        mockRequest.body = { imageUrl: 'https://example.com/image.jpg' };

        const networkError = Errors.invalidImage('Failed to fetch image: Network error');
        (themeService.extractThemeFromImage as jest.Mock).mockRejectedValue(networkError);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Wait for promise to settle
        await new Promise(process.nextTick);

        expect(mockNext).toHaveBeenCalledWith(networkError);
      });
    });

    describe('response format validation', () => {
      it('should return response with correct structure', async () => {
        mockRequest.body = { imageUrl: 'https://example.com/image.jpg' };

        (themeService.extractThemeFromImage as jest.Mock).mockResolvedValue(mockTheme);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        const response = jsonMock.mock.calls[0][0] as SuccessResponse<Theme>;

        expect(response).toHaveProperty('success', true);
        expect(response).toHaveProperty('data');
        expect(response).toHaveProperty('timestamp');
        expect(typeof response.timestamp).toBe('string');
      });

      it('should return theme data with all required fields', async () => {
        mockRequest.body = { imageUrl: 'https://example.com/image.jpg' };

        (themeService.extractThemeFromImage as jest.Mock).mockResolvedValue(mockTheme);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        const response = jsonMock.mock.calls[0][0] as SuccessResponse<Theme>;
        const { data } = response;

        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('colors');
        expect(data).toHaveProperty('primary');
        expect(data).toHaveProperty('secondary');
        expect(data).toHaveProperty('accent');
        expect(Array.isArray(data.colors)).toBe(true);
        expect(data.colors.length).toBeGreaterThan(0);
      });

      it('should return theme data with optional fields when present', async () => {
        mockRequest.body = { imageUrl: 'https://example.com/image.jpg' };

        (themeService.extractThemeFromImage as jest.Mock).mockResolvedValue(mockTheme);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        const response = jsonMock.mock.calls[0][0] as SuccessResponse<Theme>;
        const { data } = response;

        expect(data).toHaveProperty('background', '#FFFFFF');
        expect(data).toHaveProperty('surface', '#F5F5F5');
        expect(data).toHaveProperty('text', '#000000');
        expect(data).toHaveProperty('mood');
        expect(data).toHaveProperty('suggestion');
        expect(data).toHaveProperty('createdAt');
      });

      it('should handle theme without optional fields', async () => {
        const minimalTheme: Theme = {
          id: 'theme-456',
          colors: ['#FF5733', '#33FF57', '#3357FF'],
          primary: '#FF5733',
          secondary: '#33FF57',
          accent: '#3357FF',
        };

        mockRequest.body = { imageUrl: 'https://example.com/image.jpg' };

        (themeService.extractThemeFromImage as jest.Mock).mockResolvedValue(minimalTheme);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        const response = jsonMock.mock.calls[0][0] as SuccessResponse<Theme>;
        const { data } = response;

        expect(data).toMatchObject(minimalTheme);
        expect(data.background).toBeUndefined();
        expect(data.surface).toBeUndefined();
        expect(data.text).toBeUndefined();
        expect(data.mood).toBeUndefined();
        expect(data.suggestion).toBeUndefined();
      });
    });

    describe('edge cases', () => {
      it('should handle request with multiple headers', async () => {
        mockRequest.headers = {
          'x-request-id': 'req-123',
          'user-agent': 'Mozilla/5.0',
          'content-type': 'multipart/form-data',
        };
        mockRequest.body = { imageUrl: 'https://example.com/image.jpg' };

        (themeService.extractThemeFromImage as jest.Mock).mockResolvedValue(mockTheme);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            requestId: 'req-123',
          })
        );
      });

      it('should handle request with x-request-id as array', async () => {
        mockRequest.headers = {
          'x-request-id': ['req-123', 'req-456'] as any,
        };
        mockRequest.body = { imageUrl: 'https://example.com/image.jpg' };

        (themeService.extractThemeFromImage as jest.Mock).mockResolvedValue(mockTheme);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Should handle array by taking first element or converting to string
        expect(jsonMock).toHaveBeenCalled();
      });

      it('should handle imageUrl with special characters', async () => {
        const specialUrl = 'https://example.com/images/test%20image.jpg?v=1&format=jpeg';
        mockRequest.body = { imageUrl: specialUrl };

        (themeService.extractThemeFromImage as jest.Mock).mockResolvedValue(mockTheme);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(themeService.extractThemeFromImage).toHaveBeenCalledWith(
          undefined,
          specialUrl
        );
      });

      it('should handle large image files', async () => {
        const largeFile: Express.Multer.File = {
          fieldname: 'image',
          originalname: 'large-image.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: 9 * 1024 * 1024, // 9MB
          buffer: Buffer.alloc(9 * 1024 * 1024),
          destination: '',
          filename: '',
          path: '',
          stream: {} as any,
        };

        mockRequest.file = largeFile;

        (themeService.extractThemeFromImage as jest.Mock).mockResolvedValue(mockTheme);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(themeService.extractThemeFromImage).toHaveBeenCalledWith(
          largeFile,
          undefined
        );
      });

      it('should handle different image file types', async () => {
        const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        for (const mimetype of imageTypes) {
          jest.clearAllMocks();

          const file: Express.Multer.File = {
            fieldname: 'image',
            originalname: `test.${mimetype.split('/')[1]}`,
            encoding: '7bit',
            mimetype,
            size: 1024,
            buffer: Buffer.from('fake-image-data'),
            destination: '',
            filename: '',
            path: '',
            stream: {} as any,
          };

          mockRequest.file = file;

          (themeService.extractThemeFromImage as jest.Mock).mockResolvedValue(mockTheme);

          await extractTheme(
            mockRequest as Request,
            mockResponse as Response,
            mockNext
          );

          expect(themeService.extractThemeFromImage).toHaveBeenCalledWith(
            file,
            undefined
          );
          expect(statusMock).toHaveBeenCalledWith(200);
        }
      });
    });

    describe('asyncHandler wrapper', () => {
      it('should catch and forward errors to next middleware', async () => {
        mockRequest.body = { imageUrl: 'https://example.com/image.jpg' };

        const testError = new Error('Test error');
        (themeService.extractThemeFromImage as jest.Mock).mockRejectedValue(testError);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Wait for promise to settle
        await new Promise(process.nextTick);

        expect(mockNext).toHaveBeenCalledWith(testError);
        expect(statusMock).not.toHaveBeenCalled();
      });

      it('should not call response methods when error occurs', async () => {
        mockRequest.body = { imageUrl: 'https://example.com/image.jpg' };

        const testError = Errors.invalidImage('Test error');
        (themeService.extractThemeFromImage as jest.Mock).mockRejectedValue(testError);

        await extractTheme(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(statusMock).not.toHaveBeenCalled();
        expect(jsonMock).not.toHaveBeenCalled();
      });
    });
  });
});

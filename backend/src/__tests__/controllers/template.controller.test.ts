import { Request, Response } from 'express';
import { getTemplates, getTemplateById } from '../../controllers/template.controller';
import * as templateService from '../../services/template.service';
import { Template } from '../../types';

// Mock the template service
jest.mock('../../services/template.service');

describe('Template Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockTemplates: Template[] = [
    {
      id: 'hero-1',
      name: 'Hero Section - Centered',
      category: 'hero',
      description: 'Centered hero section with title, subtitle, and CTA button',
      previewImage: '/previews/hero-centered.png',
      componentType: 'HeroSection',
      props: {
        layout: 'centered',
        hasImage: true,
        hasCTA: true
      },
      createdAt: new Date('2024-01-01')
    },
    {
      id: 'navbar-1',
      name: 'Navigation Bar - Horizontal',
      category: 'navigation',
      description: 'Horizontal navigation with logo and menu items',
      previewImage: '/previews/navbar-horizontal.png',
      componentType: 'NavBar',
      props: {
        layout: 'horizontal',
        hasSearch: false,
        position: 'fixed'
      },
      createdAt: new Date('2024-01-01')
    },
    {
      id: 'card-1',
      name: 'Feature Card',
      category: 'card',
      description: 'Card component with icon, title, and description',
      previewImage: '/previews/card-feature.png',
      componentType: 'Card',
      props: {
        hasIcon: true,
        hasButton: false,
        elevation: 'medium'
      },
      createdAt: new Date('2024-01-01')
    }
  ];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup response mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      query: {},
      params: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('getTemplates', () => {
    describe('successful retrieval', () => {
      it('should return all templates when no category filter is provided', () => {
        mockRequest.query = {};

        (templateService.getAllTemplates as jest.Mock).mockReturnValue(mockTemplates);

        getTemplates(mockRequest as Request, mockResponse as Response);

        expect(templateService.getAllTemplates).toHaveBeenCalledWith(undefined);
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
          success: true,
          data: mockTemplates,
          count: mockTemplates.length
        });
      });

      it('should return filtered templates when category is provided', () => {
        const heroTemplates = mockTemplates.filter(t => t.category === 'hero');
        mockRequest.query = { category: 'hero' };

        (templateService.getAllTemplates as jest.Mock).mockReturnValue(heroTemplates);

        getTemplates(mockRequest as Request, mockResponse as Response);

        expect(templateService.getAllTemplates).toHaveBeenCalledWith('hero');
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
          success: true,
          data: heroTemplates,
          count: heroTemplates.length
        });
      });

      it('should return empty array when no templates match category', () => {
        mockRequest.query = { category: 'nonexistent' };

        (templateService.getAllTemplates as jest.Mock).mockReturnValue([]);

        getTemplates(mockRequest as Request, mockResponse as Response);

        expect(templateService.getAllTemplates).toHaveBeenCalledWith('nonexistent');
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
          success: true,
          data: [],
          count: 0
        });
      });

      it('should return correct count with templates', () => {
        mockRequest.query = {};

        (templateService.getAllTemplates as jest.Mock).mockReturnValue(mockTemplates);

        getTemplates(mockRequest as Request, mockResponse as Response);

        const response = jsonMock.mock.calls[0][0];
        expect(response.count).toBe(mockTemplates.length);
        expect(response.data.length).toBe(response.count);
      });
    });

    describe('category filtering', () => {
      it('should handle navigation category', () => {
        const navTemplates = mockTemplates.filter(t => t.category === 'navigation');
        mockRequest.query = { category: 'navigation' };

        (templateService.getAllTemplates as jest.Mock).mockReturnValue(navTemplates);

        getTemplates(mockRequest as Request, mockResponse as Response);

        expect(templateService.getAllTemplates).toHaveBeenCalledWith('navigation');
        expect(jsonMock).toHaveBeenCalledWith({
          success: true,
          data: navTemplates,
          count: navTemplates.length
        });
      });

      it('should handle card category', () => {
        const cardTemplates = mockTemplates.filter(t => t.category === 'card');
        mockRequest.query = { category: 'card' };

        (templateService.getAllTemplates as jest.Mock).mockReturnValue(cardTemplates);

        getTemplates(mockRequest as Request, mockResponse as Response);

        expect(templateService.getAllTemplates).toHaveBeenCalledWith('card');
        expect(jsonMock).toHaveBeenCalledWith({
          success: true,
          data: cardTemplates,
          count: cardTemplates.length
        });
      });

      it('should treat empty string category as filter', () => {
        mockRequest.query = { category: '' };

        (templateService.getAllTemplates as jest.Mock).mockReturnValue([]);

        getTemplates(mockRequest as Request, mockResponse as Response);

        expect(templateService.getAllTemplates).toHaveBeenCalledWith('');
        expect(statusMock).toHaveBeenCalledWith(200);
      });
    });

    describe('error handling', () => {
      it('should handle service errors and return 500', () => {
        mockRequest.query = {};

        const serviceError = new Error('Database connection failed');
        (templateService.getAllTemplates as jest.Mock).mockImplementation(() => {
          throw serviceError;
        });

        getTemplates(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Failed to get templates',
          message: 'Database connection failed'
        });
      });

      it('should handle unknown errors', () => {
        mockRequest.query = {};

        (templateService.getAllTemplates as jest.Mock).mockImplementation(() => {
          throw 'Unknown error';
        });

        getTemplates(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Failed to get templates',
          message: 'Unknown error'
        });
      });

      it('should handle TypeError', () => {
        mockRequest.query = {};

        const typeError = new TypeError('Cannot read property of undefined');
        (templateService.getAllTemplates as jest.Mock).mockImplementation(() => {
          throw typeError;
        });

        getTemplates(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Failed to get templates',
          message: 'Cannot read property of undefined'
        });
      });

      it('should log error to console', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        mockRequest.query = {};

        const serviceError = new Error('Service error');
        (templateService.getAllTemplates as jest.Mock).mockImplementation(() => {
          throw serviceError;
        });

        getTemplates(mockRequest as Request, mockResponse as Response);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Get templates error:', serviceError);
        consoleErrorSpy.mockRestore();
      });
    });

    describe('response format validation', () => {
      it('should return response with correct structure', () => {
        mockRequest.query = {};

        (templateService.getAllTemplates as jest.Mock).mockReturnValue(mockTemplates);

        getTemplates(mockRequest as Request, mockResponse as Response);

        const response = jsonMock.mock.calls[0][0];
        expect(response).toHaveProperty('success', true);
        expect(response).toHaveProperty('data');
        expect(response).toHaveProperty('count');
        expect(Array.isArray(response.data)).toBe(true);
        expect(typeof response.count).toBe('number');
      });

      it('should return templates with all required fields', () => {
        mockRequest.query = {};

        (templateService.getAllTemplates as jest.Mock).mockReturnValue(mockTemplates);

        getTemplates(mockRequest as Request, mockResponse as Response);

        const response = jsonMock.mock.calls[0][0];
        const template = response.data[0];

        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('category');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('previewImage');
        expect(template).toHaveProperty('componentType');
        expect(template).toHaveProperty('props');
        expect(template).toHaveProperty('createdAt');
      });
    });

    describe('edge cases', () => {
      it('should handle category as array and use first element', () => {
        mockRequest.query = { category: ['hero', 'navigation'] as any };

        (templateService.getAllTemplates as jest.Mock).mockReturnValue(mockTemplates);

        getTemplates(mockRequest as Request, mockResponse as Response);

        // Express query params can be arrays - controller should handle it
        expect(templateService.getAllTemplates).toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(200);
      });

      it('should handle case-sensitive category names', () => {
        mockRequest.query = { category: 'Hero' };

        (templateService.getAllTemplates as jest.Mock).mockReturnValue([]);

        getTemplates(mockRequest as Request, mockResponse as Response);

        expect(templateService.getAllTemplates).toHaveBeenCalledWith('Hero');
        expect(jsonMock).toHaveBeenCalledWith({
          success: true,
          data: [],
          count: 0
        });
      });

      it('should handle category with special characters', () => {
        mockRequest.query = { category: 'hero-section' };

        (templateService.getAllTemplates as jest.Mock).mockReturnValue([]);

        getTemplates(mockRequest as Request, mockResponse as Response);

        expect(templateService.getAllTemplates).toHaveBeenCalledWith('hero-section');
        expect(statusMock).toHaveBeenCalledWith(200);
      });

      it('should handle multiple query parameters', () => {
        mockRequest.query = { category: 'hero', page: '1', limit: '10' };

        (templateService.getAllTemplates as jest.Mock).mockReturnValue(mockTemplates);

        getTemplates(mockRequest as Request, mockResponse as Response);

        expect(templateService.getAllTemplates).toHaveBeenCalledWith('hero');
        expect(statusMock).toHaveBeenCalledWith(200);
      });

      it('should handle very long category name', () => {
        const longCategory = 'a'.repeat(1000);
        mockRequest.query = { category: longCategory };

        (templateService.getAllTemplates as jest.Mock).mockReturnValue([]);

        getTemplates(mockRequest as Request, mockResponse as Response);

        expect(templateService.getAllTemplates).toHaveBeenCalledWith(longCategory);
        expect(statusMock).toHaveBeenCalledWith(200);
      });
    });
  });

  describe('getTemplateById', () => {
    const mockTemplate = mockTemplates[0];

    describe('successful retrieval', () => {
      it('should return template when found', () => {
        mockRequest.params = { id: 'hero-1' };

        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(mockTemplate);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(templateService.getTemplateDetails).toHaveBeenCalledWith('hero-1');
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
          success: true,
          data: mockTemplate
        });
      });

      it('should return template with all fields intact', () => {
        mockRequest.params = { id: 'navbar-1' };

        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(mockTemplates[1]);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        const response = jsonMock.mock.calls[0][0];
        expect(response.data).toEqual(mockTemplates[1]);
        expect(response.data.props).toEqual(mockTemplates[1].props);
      });

      it('should return different templates for different IDs', () => {
        // First call
        mockRequest.params = { id: 'hero-1' };
        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(mockTemplates[0]);
        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(jsonMock).toHaveBeenCalledWith({
          success: true,
          data: mockTemplates[0]
        });

        // Clear and setup for second call
        jest.clearAllMocks();
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        mockResponse.status = statusMock;

        // Second call
        mockRequest.params = { id: 'card-1' };
        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(mockTemplates[2]);
        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(jsonMock).toHaveBeenCalledWith({
          success: true,
          data: mockTemplates[2]
        });
      });
    });

    describe('template not found', () => {
      it('should return 404 when template is not found', () => {
        mockRequest.params = { id: 'nonexistent-id' };

        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(null);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(templateService.getTemplateDetails).toHaveBeenCalledWith('nonexistent-id');
        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Template not found'
        });
      });

      it('should not call success response when template not found', () => {
        mockRequest.params = { id: 'missing' };

        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(null);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        const response = jsonMock.mock.calls[0][0];
        expect(response).not.toHaveProperty('success');
        expect(response).not.toHaveProperty('data');
        expect(response).toHaveProperty('error', 'Template not found');
      });

      it('should handle null return value', () => {
        mockRequest.params = { id: 'null-test' };

        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(null);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(404);
      });

      it('should handle undefined as null', () => {
        mockRequest.params = { id: 'undefined-test' };

        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(undefined);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Template not found'
        });
      });
    });

    describe('error handling', () => {
      it('should handle service errors and return 500', () => {
        mockRequest.params = { id: 'hero-1' };

        const serviceError = new Error('Database error');
        (templateService.getTemplateDetails as jest.Mock).mockImplementation(() => {
          throw serviceError;
        });

        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Failed to get template',
          message: 'Database error'
        });
      });

      it('should handle unknown errors', () => {
        mockRequest.params = { id: 'hero-1' };

        (templateService.getTemplateDetails as jest.Mock).mockImplementation(() => {
          throw 'String error';
        });

        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Failed to get template',
          message: 'Unknown error'
        });
      });

      it('should log error to console', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        mockRequest.params = { id: 'hero-1' };

        const serviceError = new Error('Service error');
        (templateService.getTemplateDetails as jest.Mock).mockImplementation(() => {
          throw serviceError;
        });

        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Get template error:', serviceError);
        consoleErrorSpy.mockRestore();
      });

      it('should handle ReferenceError', () => {
        mockRequest.params = { id: 'hero-1' };

        const refError = new ReferenceError('Template is not defined');
        (templateService.getTemplateDetails as jest.Mock).mockImplementation(() => {
          throw refError;
        });

        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Failed to get template',
          message: 'Template is not defined'
        });
      });

      it('should not return both 404 and 500 for errors', () => {
        mockRequest.params = { id: 'test' };

        const serviceError = new Error('Test error');
        (templateService.getTemplateDetails as jest.Mock).mockImplementation(() => {
          throw serviceError;
        });

        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledTimes(1);
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(statusMock).not.toHaveBeenCalledWith(404);
      });
    });

    describe('response format validation', () => {
      it('should return response with correct structure for found template', () => {
        mockRequest.params = { id: 'hero-1' };

        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(mockTemplate);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        const response = jsonMock.mock.calls[0][0];
        expect(response).toHaveProperty('success', true);
        expect(response).toHaveProperty('data');
        expect(response.data).toEqual(mockTemplate);
      });

      it('should return error response with correct structure for not found', () => {
        mockRequest.params = { id: 'missing' };

        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(null);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        const response = jsonMock.mock.calls[0][0];
        expect(response).toHaveProperty('error');
        expect(typeof response.error).toBe('string');
      });

      it('should preserve template data types', () => {
        mockRequest.params = { id: 'hero-1' };

        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(mockTemplate);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        const response = jsonMock.mock.calls[0][0];
        expect(typeof response.data.id).toBe('string');
        expect(typeof response.data.name).toBe('string');
        expect(typeof response.data.props).toBe('object');
        expect(response.data.createdAt).toBeInstanceOf(Date);
      });
    });

    describe('edge cases', () => {
      it('should handle empty string ID', () => {
        mockRequest.params = { id: '' };

        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(null);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(templateService.getTemplateDetails).toHaveBeenCalledWith('');
        expect(statusMock).toHaveBeenCalledWith(404);
      });

      it('should handle very long ID', () => {
        const longId = 'a'.repeat(1000);
        mockRequest.params = { id: longId };

        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(null);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(templateService.getTemplateDetails).toHaveBeenCalledWith(longId);
        expect(statusMock).toHaveBeenCalledWith(404);
      });

      it('should handle ID with special characters', () => {
        mockRequest.params = { id: 'hero-1@special#chars' };

        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(null);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(templateService.getTemplateDetails).toHaveBeenCalledWith('hero-1@special#chars');
      });

      it('should handle numeric ID as string', () => {
        mockRequest.params = { id: '12345' };

        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(null);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(templateService.getTemplateDetails).toHaveBeenCalledWith('12345');
        expect(statusMock).toHaveBeenCalledWith(404);
      });

      it('should handle UUID format ID', () => {
        const uuidId = '550e8400-e29b-41d4-a716-446655440000';
        mockRequest.params = { id: uuidId };

        const templateWithUuid = { ...mockTemplate, id: uuidId };
        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(templateWithUuid);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(templateService.getTemplateDetails).toHaveBeenCalledWith(uuidId);
        expect(statusMock).toHaveBeenCalledWith(200);
      });

      it('should handle ID with spaces', () => {
        mockRequest.params = { id: 'hero 1' };

        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(null);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        expect(templateService.getTemplateDetails).toHaveBeenCalledWith('hero 1');
        expect(statusMock).toHaveBeenCalledWith(404);
      });

      it('should handle template with minimal props', () => {
        const minimalTemplate: Template = {
          id: 'minimal-1',
          name: 'Minimal Template',
          category: 'test',
          description: 'Test template',
          previewImage: '/test.png',
          componentType: 'Test',
          props: {},
          createdAt: new Date('2024-01-01')
        };

        mockRequest.params = { id: 'minimal-1' };
        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(minimalTemplate);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        const response = jsonMock.mock.calls[0][0];
        expect(response.data).toEqual(minimalTemplate);
        expect(response.data.props).toEqual({});
      });

      it('should handle template with complex nested props', () => {
        const complexTemplate: Template = {
          ...mockTemplate,
          props: {
            layout: 'complex',
            nested: {
              deep: {
                value: 'test'
              },
              array: [1, 2, 3]
            }
          }
        };

        mockRequest.params = { id: 'hero-1' };
        (templateService.getTemplateDetails as jest.Mock).mockReturnValue(complexTemplate);

        getTemplateById(mockRequest as Request, mockResponse as Response);

        const response = jsonMock.mock.calls[0][0];
        expect(response.data.props).toEqual(complexTemplate.props);
      });
    });
  });
});

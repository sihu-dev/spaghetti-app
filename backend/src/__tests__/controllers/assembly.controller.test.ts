import { Request, Response } from 'express';
import { generateAssembly, getAssembly } from '../../controllers/assembly.controller';
import * as assemblyService from '../../services/assembly.service';
import { Assembly } from '../../types';

// Mock the assembly service
jest.mock('../../services/assembly.service');

describe('Assembly Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    mockRequest = {
      body: {},
      params: {},
    };
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('generateAssembly', () => {
    const mockAssembly: Assembly = {
      id: 'assembly-123',
      templateId: 'template-456',
      themeId: 'theme-789',
      customizations: {
        backgroundColor: '#FF5733',
        padding: '20px',
      },
      generatedCode: 'import React from "react";\n\nconst Component = () => {}',
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    describe('successful assembly creation', () => {
      it('should create assembly with valid request', () => {
        mockRequest.body = {
          templateId: 'template-456',
          themeId: 'theme-789',
          customizations: {
            backgroundColor: '#FF5733',
            padding: '20px',
          },
        };

        (assemblyService.createAssembly as jest.Mock).mockReturnValue(mockAssembly);

        generateAssembly(mockRequest as Request, mockResponse as Response);

        expect(assemblyService.createAssembly).toHaveBeenCalledWith({
          templateId: 'template-456',
          themeId: 'theme-789',
          customizations: {
            backgroundColor: '#FF5733',
            padding: '20px',
          },
        });
        expect(mockStatus).toHaveBeenCalledWith(201);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: mockAssembly,
        });
      });

      it('should create assembly without customizations', () => {
        mockRequest.body = {
          templateId: 'template-456',
          themeId: 'theme-789',
        };

        const assemblyWithoutCustomizations = { ...mockAssembly, customizations: undefined };
        (assemblyService.createAssembly as jest.Mock).mockReturnValue(assemblyWithoutCustomizations);

        generateAssembly(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(201);
      });
    });

    describe('request validation', () => {
      it('should return 400 when templateId is missing', () => {
        mockRequest.body = { themeId: 'theme-789' };

        generateAssembly(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'templateId and themeId are required',
        });
        expect(assemblyService.createAssembly).not.toHaveBeenCalled();
      });

      it('should return 400 when themeId is missing', () => {
        mockRequest.body = { templateId: 'template-456' };

        generateAssembly(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(assemblyService.createAssembly).not.toHaveBeenCalled();
      });

      it('should return 400 when both fields are missing', () => {
        mockRequest.body = {};

        generateAssembly(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(400);
      });
    });

    describe('error handling', () => {
      it('should return 500 when service throws error', () => {
        mockRequest.body = {
          templateId: 'template-456',
          themeId: 'theme-789',
        };

        (assemblyService.createAssembly as jest.Mock).mockImplementation(() => {
          throw new Error('Service unavailable');
        });

        generateAssembly(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Failed to generate assembly',
          message: 'Service unavailable',
        });
      });

      it('should handle non-Error exceptions', () => {
        mockRequest.body = {
          templateId: 'template-456',
          themeId: 'theme-789',
        };

        (assemblyService.createAssembly as jest.Mock).mockImplementation(() => {
          throw 'Unknown error';
        });

        generateAssembly(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Failed to generate assembly',
          message: 'Unknown error',
        });
      });
    });
  });

  describe('getAssembly', () => {
    const mockAssembly: Assembly = {
      id: 'assembly-123',
      templateId: 'template-456',
      themeId: 'theme-789',
      customizations: { backgroundColor: '#FF5733' },
      generatedCode: 'import React from "react";',
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    describe('successful retrieval', () => {
      it('should return assembly when it exists', () => {
        mockRequest.params = { id: 'assembly-123' };
        (assemblyService.findAssemblyById as jest.Mock).mockReturnValue(mockAssembly);

        getAssembly(mockRequest as Request, mockResponse as Response);

        expect(assemblyService.findAssemblyById).toHaveBeenCalledWith('assembly-123');
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: mockAssembly,
        });
      });
    });

    describe('not found scenarios', () => {
      it('should return 404 when assembly does not exist', () => {
        mockRequest.params = { id: 'non-existent-id' };
        (assemblyService.findAssemblyById as jest.Mock).mockReturnValue(null);

        getAssembly(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Assembly not found',
        });
      });
    });

    describe('error handling', () => {
      it('should return 500 when service throws error', () => {
        mockRequest.params = { id: 'assembly-123' };
        (assemblyService.findAssemblyById as jest.Mock).mockImplementation(() => {
          throw new Error('Database error');
        });

        getAssembly(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Failed to get assembly',
          message: 'Database error',
        });
      });
    });
  });
});

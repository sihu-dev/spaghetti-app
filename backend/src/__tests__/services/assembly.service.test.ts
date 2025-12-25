import {
  createAssembly,
  findAssemblyById,
  getAllAssemblies,
} from '../../services/assembly.service';
import * as templateService from '../../services/template.service';
import { AssemblyGenerationRequest, Template } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// Mock the template service
jest.mock('../../services/template.service');

// Mock uuid
jest.mock('uuid');

describe('Assembly Service', () => {
  const mockTemplateId = 'hero-1';
  const mockThemeId = 'theme-123';
  const mockAssemblyId = 'assembly-456';

  const mockTemplate: Template = {
    id: mockTemplateId,
    name: 'Hero Section - Centered',
    category: 'hero',
    description: 'Centered hero section with title, subtitle, and CTA button',
    previewImage: '/previews/hero-centered.png',
    componentType: 'HeroSection',
    props: {
      layout: 'centered',
      hasImage: true,
      hasCTA: true,
    },
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (uuidv4 as jest.Mock).mockReturnValue(mockAssemblyId);
    (templateService.getTemplateDetails as jest.Mock).mockReturnValue(mockTemplate);
  });

  describe('createAssembly', () => {
    const validRequest: AssemblyGenerationRequest = {
      templateId: mockTemplateId,
      themeId: mockThemeId,
      customizations: {
        backgroundColor: '#FF5733',
        padding: '20px',
        borderRadius: '12px',
      },
    };

    it('should create an assembly with valid inputs', () => {
      const result = createAssembly(validRequest);

      expect(result).toHaveProperty('id', mockAssemblyId);
      expect(result).toHaveProperty('templateId', mockTemplateId);
      expect(result).toHaveProperty('themeId', mockThemeId);
      expect(result).toHaveProperty('customizations', validRequest.customizations);
      expect(result).toHaveProperty('generatedCode');
      expect(result).toHaveProperty('createdAt');
      expect(() => new Date(result.createdAt)).not.toThrow();
    });

    it('should generate code with custom values', () => {
      const result = createAssembly(validRequest);

      expect(result.generatedCode).toContain("backgroundColor: '#FF5733'");
      expect(result.generatedCode).toContain("padding: '20px'");
      expect(result.generatedCode).toContain("borderRadius: '12px'");
      expect(result.generatedCode).toContain(`template: ${mockTemplateId}`);
      expect(result.generatedCode).toContain(`theme: ${mockThemeId}`);
    });

    it('should generate code with default values when no customizations provided', () => {
      const requestWithoutCustomizations: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: mockThemeId,
      };

      const result = createAssembly(requestWithoutCustomizations);

      expect(result.generatedCode).toContain("backgroundColor: '#FFFFFF'");
      expect(result.generatedCode).toContain("padding: '16px'");
      expect(result.generatedCode).toContain("borderRadius: '8px'");
    });

    it('should validate template exists', () => {
      createAssembly(validRequest);

      expect(templateService.getTemplateDetails).toHaveBeenCalledWith(mockTemplateId);
      expect(templateService.getTemplateDetails).toHaveBeenCalledTimes(1);
    });

    it('should throw error when template is not found', () => {
      (templateService.getTemplateDetails as jest.Mock).mockReturnValue(null);

      expect(() => createAssembly(validRequest)).toThrow(`Template ${mockTemplateId} not found`);
    });

    it('should generate unique IDs for each assembly', () => {
      const firstId = 'first-id';
      const secondId = 'second-id';

      (uuidv4 as jest.Mock)
        .mockReturnValueOnce(firstId)
        .mockReturnValueOnce(secondId);

      const first = createAssembly(validRequest);
      const second = createAssembly(validRequest);

      expect(first.id).toBe(firstId);
      expect(second.id).toBe(secondId);
    });

    it('should store assembly in memory', () => {
      const result = createAssembly(validRequest);
      const found = findAssemblyById(result.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(result.id);
    });
  });

  describe('findAssemblyById', () => {
    it('should return assembly when it exists', () => {
      const request: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: mockThemeId,
      };

      const created = createAssembly(request);
      const found = findAssemblyById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.templateId).toBe(mockTemplateId);
    });

    it('should return null when assembly does not exist', () => {
      const found = findAssemblyById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('getAllAssemblies', () => {
    it('should return an array', () => {
      const result = getAllAssemblies();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should include created assemblies', () => {
      const request: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: mockThemeId,
      };

      const created = createAssembly(request);
      const all = getAllAssemblies();

      expect(all.some(a => a.id === created.id)).toBe(true);
    });
  });

  describe('generateCode Logic', () => {
    it('should generate valid React component code', () => {
      const request: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: mockThemeId,
      };

      const result = createAssembly(request);

      expect(result.generatedCode).toContain("import React from 'react';");
      expect(result.generatedCode).toContain('const Component = () => {');
      expect(result.generatedCode).toContain('export default Component;');
    });

    it('should include template and theme IDs in comments', () => {
      const request: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: mockThemeId,
      };

      const result = createAssembly(request);

      expect(result.generatedCode).toContain(mockTemplateId);
      expect(result.generatedCode).toContain(mockThemeId);
    });
  });

  describe('Error Scenarios', () => {
    it('should reject with error when template does not exist', () => {
      const invalidRequest: AssemblyGenerationRequest = {
        templateId: 'non-existent-template',
        themeId: mockThemeId,
      };

      (templateService.getTemplateDetails as jest.Mock).mockReturnValue(null);

      expect(() => createAssembly(invalidRequest)).toThrow('Template non-existent-template not found');
    });

    it('should handle empty customizations object', () => {
      const request: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: mockThemeId,
        customizations: {},
      };

      const result = createAssembly(request);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('generatedCode');
      expect(result.customizations).toEqual({});
    });
  });
});

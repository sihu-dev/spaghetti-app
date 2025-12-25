import {
  createAssembly,
  findAssemblyById,
  getAllAssemblies,
} from '../../services/assembly.service';
import * as templateService from '../../services/template.service';
import { AssemblyGenerationRequest, Assembly, Template } from '../../types';
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
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    (uuidv4 as jest.Mock).mockReturnValue(mockAssemblyId);
    (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(mockTemplate);
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

    it('should create an assembly with valid inputs', async () => {
      const result = await createAssembly(validRequest);

      expect(result).toHaveProperty('id', mockAssemblyId);
      expect(result).toHaveProperty('templateId', mockTemplateId);
      expect(result).toHaveProperty('themeId', mockThemeId);
      expect(result).toHaveProperty('customizations', validRequest.customizations);
      expect(result).toHaveProperty('generatedCode');
      expect(result).toHaveProperty('createdAt');

      // Verify createdAt is a valid ISO string
      expect(() => new Date(result.createdAt)).not.toThrow();
    });

    it('should generate code with custom values', async () => {
      const result = await createAssembly(validRequest);

      expect(result.generatedCode).toContain('backgroundColor: \'#FF5733\'');
      expect(result.generatedCode).toContain('padding: \'20px\'');
      expect(result.generatedCode).toContain('borderRadius: \'12px\'');
      expect(result.generatedCode).toContain(`template: ${mockTemplateId}`);
      expect(result.generatedCode).toContain(`theme: ${mockThemeId}`);
    });

    it('should generate code with default values when no customizations provided', async () => {
      const requestWithoutCustomizations: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: mockThemeId,
      };

      const result = await createAssembly(requestWithoutCustomizations);

      expect(result.generatedCode).toContain('backgroundColor: \'#FFFFFF\'');
      expect(result.generatedCode).toContain('padding: \'16px\'');
      expect(result.generatedCode).toContain('borderRadius: \'8px\'');
    });

    it('should validate template exists', async () => {
      await createAssembly(validRequest);

      expect(templateService.getTemplateDetails).toHaveBeenCalledWith(mockTemplateId);
      expect(templateService.getTemplateDetails).toHaveBeenCalledTimes(1);
    });

    it('should throw error when template is not found', async () => {
      const invalidTemplateId = 'invalid-template-id';
      const invalidRequest: AssemblyGenerationRequest = {
        templateId: invalidTemplateId,
        themeId: mockThemeId,
      };

      (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(null);

      await expect(createAssembly(invalidRequest)).rejects.toThrow(
        `Template ${invalidTemplateId} not found`
      );
    });

    it('should generate unique assembly IDs', async () => {
      const firstAssemblyId = 'assembly-001';
      const secondAssemblyId = 'assembly-002';

      (uuidv4 as jest.Mock)
        .mockReturnValueOnce(firstAssemblyId)
        .mockReturnValueOnce(secondAssemblyId);

      const assembly1 = await createAssembly(validRequest);
      const assembly2 = await createAssembly(validRequest);

      expect(assembly1.id).toBe(firstAssemblyId);
      expect(assembly2.id).toBe(secondAssemblyId);
      expect(assembly1.id).not.toBe(assembly2.id);
    });

    it('should store assembly in memory', async () => {
      const assembly = await createAssembly(validRequest);

      // Verify we can retrieve it by ID
      const retrieved = await findAssemblyById(assembly.id);
      expect(retrieved).toEqual(assembly);
    });

    it('should handle partial customizations', async () => {
      const partialRequest: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: mockThemeId,
        customizations: {
          backgroundColor: '#123456',
        },
      };

      const result = await createAssembly(partialRequest);

      expect(result.generatedCode).toContain('backgroundColor: \'#123456\'');
      expect(result.generatedCode).toContain('padding: \'16px\''); // default
      expect(result.generatedCode).toContain('borderRadius: \'8px\''); // default
    });

    it('should include React import in generated code', async () => {
      const result = await createAssembly(validRequest);

      expect(result.generatedCode).toContain('import React from \'react\'');
    });

    it('should export default component in generated code', async () => {
      const result = await createAssembly(validRequest);

      expect(result.generatedCode).toContain('export default Component');
    });
  });

  describe('findAssemblyById', () => {
    it('should return assembly when it exists', async () => {
      const request: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: mockThemeId,
      };

      const created = await createAssembly(request);
      const found = await findAssemblyById(created.id);

      expect(found).not.toBeNull();
      expect(found).toEqual(created);
      expect(found!.id).toBe(created.id);
      expect(found!.templateId).toBe(mockTemplateId);
      expect(found!.themeId).toBe(mockThemeId);
    });

    it('should return null when assembly does not exist', async () => {
      const result = await findAssemblyById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return correct assembly when multiple assemblies exist', async () => {
      const assemblyId1 = 'assembly-001';
      const assemblyId2 = 'assembly-002';

      (uuidv4 as jest.Mock)
        .mockReturnValueOnce(assemblyId1)
        .mockReturnValueOnce(assemblyId2);

      const request: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: mockThemeId,
      };

      await createAssembly(request);
      const assembly2 = await createAssembly(request);

      const found = await findAssemblyById(assemblyId2);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(assemblyId2);
      expect(found).toEqual(assembly2);
    });
  });

  describe('getAllAssemblies', () => {
    it('should return an array', async () => {
      const result = await getAllAssemblies();

      expect(Array.isArray(result)).toBe(true);
    });

    it('should return all created assemblies', async () => {
      const assemblyId1 = 'assembly-001';
      const assemblyId2 = 'assembly-002';
      const assemblyId3 = 'assembly-003';

      (uuidv4 as jest.Mock)
        .mockReturnValueOnce(assemblyId1)
        .mockReturnValueOnce(assemblyId2)
        .mockReturnValueOnce(assemblyId3);

      const request1: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: 'theme-1',
      };

      const request2: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: 'theme-2',
        customizations: { backgroundColor: '#000000' },
      };

      const request3: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: 'theme-3',
      };

      const assembly1 = await createAssembly(request1);
      const assembly2 = await createAssembly(request2);
      const assembly3 = await createAssembly(request3);

      const allAssemblies = await getAllAssemblies();

      // These assemblies should be in the result
      expect(allAssemblies).toContainEqual(assembly1);
      expect(allAssemblies).toContainEqual(assembly2);
      expect(allAssemblies).toContainEqual(assembly3);
    });

    it('should return array of assemblies with correct structure', async () => {
      const uniqueId = 'assembly-test-structure';
      (uuidv4 as jest.Mock).mockReturnValue(uniqueId);

      const request: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: mockThemeId,
        customizations: { backgroundColor: '#FF5733' },
      };

      await createAssembly(request);
      const allAssemblies = await getAllAssemblies();

      // Find the assembly we just created
      const assembly = allAssemblies.find((a: Assembly) => a.id === uniqueId);

      expect(assembly).toBeDefined();
      expect(assembly).toHaveProperty('id');
      expect(assembly).toHaveProperty('templateId');
      expect(assembly).toHaveProperty('themeId');
      expect(assembly).toHaveProperty('customizations');
      expect(assembly).toHaveProperty('generatedCode');
      expect(assembly).toHaveProperty('createdAt');
    });
  });

  describe('generateCode', () => {
    it('should generate valid React component code', async () => {
      const request: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: mockThemeId,
        customizations: {
          backgroundColor: '#ABCDEF',
          padding: '24px',
          borderRadius: '16px',
        },
      };

      const result = await createAssembly(request);

      // Check for basic React component structure
      expect(result.generatedCode).toContain('import React from \'react\'');
      expect(result.generatedCode).toContain('const Component = () => {');
      expect(result.generatedCode).toContain('return (');
      expect(result.generatedCode).toContain('</div>');
      expect(result.generatedCode).toContain('export default Component');
    });

    it('should include template and theme IDs in comments', async () => {
      const customTemplateId = 'custom-template-123';
      const customThemeId = 'custom-theme-456';

      const request: AssemblyGenerationRequest = {
        templateId: customTemplateId,
        themeId: customThemeId,
      };

      const result = await createAssembly(request);

      expect(result.generatedCode).toContain(`template: ${customTemplateId}`);
      expect(result.generatedCode).toContain(`theme: ${customThemeId}`);
    });

    it('should apply customizations to inline styles', async () => {
      const request: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: mockThemeId,
        customizations: {
          backgroundColor: '#112233',
          padding: '32px',
          borderRadius: '20px',
        },
      };

      const result = await createAssembly(request);

      expect(result.generatedCode).toContain('backgroundColor: \'#112233\'');
      expect(result.generatedCode).toContain('padding: \'32px\'');
      expect(result.generatedCode).toContain('borderRadius: \'20px\'');
    });

    it('should use default styles when customizations are undefined', async () => {
      const request: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: mockThemeId,
        customizations: undefined,
      };

      const result = await createAssembly(request);

      expect(result.generatedCode).toContain('backgroundColor: \'#FFFFFF\'');
      expect(result.generatedCode).toContain('padding: \'16px\'');
      expect(result.generatedCode).toContain('borderRadius: \'8px\'');
    });

    it('should generate code with proper indentation and formatting', async () => {
      const request: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: mockThemeId,
      };

      const result = await createAssembly(request);

      // Check for proper code structure (not checking exact indentation due to trim())
      expect(result.generatedCode).toMatch(/import React from 'react';/);
      expect(result.generatedCode).toMatch(/const Component = \(\) => \{/);
      expect(result.generatedCode).toMatch(/return \(/);
      expect(result.generatedCode).toMatch(/<div style=\{\{/);
      expect(result.generatedCode).toContain('};');
      expect(result.generatedCode).toMatch(/export default Component;/);
    });
  });

  describe('Error Scenarios', () => {
    describe('Invalid Template', () => {
      it('should reject with error when template does not exist', async () => {
        const invalidRequest: AssemblyGenerationRequest = {
          templateId: 'non-existent-template',
          themeId: mockThemeId,
        };

        (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(null);

        await expect(createAssembly(invalidRequest)).rejects.toThrow(
          'Template non-existent-template not found'
        );
      });

      it('should reject with error when template validation fails', async () => {
        const invalidRequest: AssemblyGenerationRequest = {
          templateId: '',
          themeId: mockThemeId,
        };

        (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(null);

        await expect(createAssembly(invalidRequest)).rejects.toThrow();
      });

      it('should not create assembly when template is invalid', async () => {
        const invalidRequest: AssemblyGenerationRequest = {
          templateId: 'invalid-template',
          themeId: mockThemeId,
        };

        (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(null);

        const beforeCount = (await getAllAssemblies()).length;

        try {
          await createAssembly(invalidRequest);
        } catch (error) {
          // Expected error
        }

        const afterCount = (await getAllAssemblies()).length;
        expect(afterCount).toBe(beforeCount);
      });
    });

    describe('Template Service Errors', () => {
      it('should propagate errors from template service', async () => {
        const request: AssemblyGenerationRequest = {
          templateId: mockTemplateId,
          themeId: mockThemeId,
        };

        const serviceError = new Error('Template service unavailable');
        (templateService.getTemplateDetails as jest.Mock).mockRejectedValue(serviceError);

        await expect(createAssembly(request)).rejects.toThrow('Template service unavailable');
      });

      it('should handle template service timeout', async () => {
        const request: AssemblyGenerationRequest = {
          templateId: mockTemplateId,
          themeId: mockThemeId,
        };

        (templateService.getTemplateDetails as jest.Mock).mockImplementation(
          () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
        );

        await expect(createAssembly(request)).rejects.toThrow('Timeout');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty customizations object', async () => {
        const request: AssemblyGenerationRequest = {
          templateId: mockTemplateId,
          themeId: mockThemeId,
          customizations: {},
        };

        const result = await createAssembly(request);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('generatedCode');
        expect(result.customizations).toEqual({});
      });

      it('should handle special characters in theme ID', async () => {
        const specialThemeId = 'theme-with-special-chars-!@#$%';
        const request: AssemblyGenerationRequest = {
          templateId: mockTemplateId,
          themeId: specialThemeId,
        };

        const result = await createAssembly(request);

        expect(result.themeId).toBe(specialThemeId);
        expect(result.generatedCode).toContain(specialThemeId);
      });

      it('should handle very long customization values', async () => {
        const longValue = 'x'.repeat(1000);
        const request: AssemblyGenerationRequest = {
          templateId: mockTemplateId,
          themeId: mockThemeId,
          customizations: {
            backgroundColor: longValue,
          },
        };

        const result = await createAssembly(request);

        expect(result.customizations?.backgroundColor).toBe(longValue);
      });

      it('should handle nested customization objects', async () => {
        const request: AssemblyGenerationRequest = {
          templateId: mockTemplateId,
          themeId: mockThemeId,
          customizations: {
            backgroundColor: '#FF0000',
            nested: {
              key: 'value',
            },
          },
        };

        const result = await createAssembly(request);

        expect(result.customizations).toEqual(request.customizations);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should support full workflow: create, find, and list assemblies', async () => {
      // Create first assembly
      const request1: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: 'theme-workflow-1',
      };

      (uuidv4 as jest.Mock).mockReturnValueOnce('assembly-workflow-1');
      const assembly1 = await createAssembly(request1);

      // Create second assembly
      const request2: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: 'theme-workflow-2',
        customizations: { backgroundColor: '#000000' },
      };

      (uuidv4 as jest.Mock).mockReturnValueOnce('assembly-workflow-2');
      const assembly2 = await createAssembly(request2);

      // Find individual assemblies
      const found1 = await findAssemblyById('assembly-workflow-1');
      const found2 = await findAssemblyById('assembly-workflow-2');

      expect(found1).toEqual(assembly1);
      expect(found2).toEqual(assembly2);

      // Get all assemblies
      const allAssemblies = await getAllAssemblies();

      // Both assemblies should be in the result
      expect(allAssemblies).toContainEqual(assembly1);
      expect(allAssemblies).toContainEqual(assembly2);
    });

    it('should maintain assembly state across multiple operations', async () => {
      const request: AssemblyGenerationRequest = {
        templateId: mockTemplateId,
        themeId: mockThemeId,
        customizations: { backgroundColor: '#123456' },
      };

      const created = await createAssembly(request);

      // Verify the assembly exists in multiple ways
      const foundById = await findAssemblyById(created.id);
      const allAssemblies = await getAllAssemblies();

      expect(foundById).toEqual(created);
      expect(allAssemblies).toContainEqual(created);
      expect(allAssemblies.find((a: any) => a.id === created.id)).toEqual(created);
    });
  });
});

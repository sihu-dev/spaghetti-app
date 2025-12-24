import {
  createAssembly,
  findAssemblyById,
  getAllAssemblies
} from '../assembly.service';
import { AssemblyGenerationRequest, Assembly } from '../../types';
import * as templateService from '../template.service';

// Mock template service
jest.mock('../template.service');

describe('Assembly Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAssembly', () => {
    it('should create an assembly with valid template', async () => {
      const mockTemplate = {
        id: 'hero-1',
        name: 'Hero Section - Centered',
        category: 'hero',
        description: 'Test hero section',
        previewImage: '/preview.png',
        componentType: 'HeroSection',
        props: { layout: 'centered' },
        createdAt: new Date()
      };

      (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(mockTemplate);

      const request: AssemblyGenerationRequest = {
        templateId: 'hero-1',
        themeId: 'theme-1',
        customizations: {
          backgroundColor: '#FFFFFF',
          padding: '20px'
        }
      };

      const assembly = await createAssembly(request);

      expect(assembly).toBeDefined();
      expect(assembly.id).toBeDefined();
      expect(assembly.templateId).toBe('hero-1');
      expect(assembly.themeId).toBe('theme-1');
      expect(assembly.customizations).toEqual(request.customizations);
      expect(assembly.generatedCode).toBeDefined();
      expect(assembly.createdAt).toBeInstanceOf(Date);
    });

    it('should generate React code with customizations', async () => {
      const mockTemplate = {
        id: 'card-1',
        name: 'Feature Card',
        category: 'card',
        description: 'Test card',
        previewImage: '/preview.png',
        componentType: 'Card',
        props: { hasIcon: true },
        createdAt: new Date()
      };

      (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(mockTemplate);

      const request: AssemblyGenerationRequest = {
        templateId: 'card-1',
        themeId: 'theme-2',
        customizations: {
          backgroundColor: '#F0F0F0',
          padding: '24px',
          borderRadius: '12px'
        }
      };

      const assembly = await createAssembly(request);

      expect(assembly.generatedCode).toContain('React');
      expect(assembly.generatedCode).toContain('24px'); // padding customization
      expect(assembly.generatedCode).toContain('12px'); // borderRadius customization
      expect(assembly.generatedCode).toContain('Card'); // component type
    });

    it('should create assembly without customizations', async () => {
      const mockTemplate = {
        id: 'navbar-1',
        name: 'Navigation Bar',
        category: 'navigation',
        description: 'Test navbar',
        previewImage: '/preview.png',
        componentType: 'NavBar',
        props: { layout: 'horizontal' },
        createdAt: new Date()
      };

      (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(mockTemplate);

      const request: AssemblyGenerationRequest = {
        templateId: 'navbar-1',
        themeId: 'theme-3'
      };

      const assembly = await createAssembly(request);

      expect(assembly).toBeDefined();
      expect(assembly.templateId).toBe('navbar-1');
      expect(assembly.themeId).toBe('theme-3');
      expect(assembly.customizations).toBeUndefined();
      expect(assembly.generatedCode).toBeDefined();
    });

    it('should use default values when customizations are not provided', async () => {
      const mockTemplate = {
        id: 'footer-1',
        name: 'Footer',
        category: 'footer',
        description: 'Test footer',
        previewImage: '/preview.png',
        componentType: 'Footer',
        props: { columns: 3 },
        createdAt: new Date()
      };

      (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(mockTemplate);

      const request: AssemblyGenerationRequest = {
        templateId: 'footer-1',
        themeId: 'theme-4'
      };

      const assembly = await createAssembly(request);

      expect(assembly.generatedCode).toContain('#FFFFFF'); // default background
      expect(assembly.generatedCode).toContain('16px'); // default padding
      expect(assembly.generatedCode).toContain('8px'); // default border radius
    });

    it('should throw error when template does not exist', async () => {
      (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(null);

      const request: AssemblyGenerationRequest = {
        templateId: 'non-existent',
        themeId: 'theme-1'
      };

      await expect(createAssembly(request)).rejects.toThrow(
        'Template non-existent not found'
      );
    });

    it('should generate unique IDs for each assembly', async () => {
      const mockTemplate = {
        id: 'hero-1',
        name: 'Hero',
        category: 'hero',
        description: 'Test',
        previewImage: '/preview.png',
        componentType: 'Hero',
        props: {},
        createdAt: new Date()
      };

      (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(mockTemplate);

      const request: AssemblyGenerationRequest = {
        templateId: 'hero-1',
        themeId: 'theme-1'
      };

      const assembly1 = await createAssembly(request);
      const assembly2 = await createAssembly(request);

      expect(assembly1.id).not.toBe(assembly2.id);
    });

    it('should verify template existence before creating assembly', async () => {
      const mockTemplate = {
        id: 'test-1',
        name: 'Test',
        category: 'test',
        description: 'Test template',
        previewImage: '/preview.png',
        componentType: 'Test',
        props: {},
        createdAt: new Date()
      };

      (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(mockTemplate);

      const request: AssemblyGenerationRequest = {
        templateId: 'test-1',
        themeId: 'theme-5'
      };

      await createAssembly(request);

      expect(templateService.getTemplateDetails).toHaveBeenCalledWith('test-1');
      expect(templateService.getTemplateDetails).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAssemblyById', () => {
    it('should return assembly by id', async () => {
      const mockTemplate = {
        id: 'hero-1',
        name: 'Hero',
        category: 'hero',
        description: 'Test',
        previewImage: '/preview.png',
        componentType: 'Hero',
        props: {},
        createdAt: new Date()
      };

      (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(mockTemplate);

      const request: AssemblyGenerationRequest = {
        templateId: 'hero-1',
        themeId: 'theme-1'
      };

      const createdAssembly = await createAssembly(request);
      const foundAssembly = await findAssemblyById(createdAssembly.id);

      expect(foundAssembly).toBeDefined();
      expect(foundAssembly).not.toBeNull();
      expect(foundAssembly?.id).toBe(createdAssembly.id);
      expect(foundAssembly?.templateId).toBe(createdAssembly.templateId);
      expect(foundAssembly?.themeId).toBe(createdAssembly.themeId);
    });

    it('should return null for non-existent assembly id', async () => {
      const assembly = await findAssemblyById('non-existent-id');

      expect(assembly).toBeNull();
    });

    it('should return correct assembly among multiple assemblies', async () => {
      const mockTemplate = {
        id: 'card-1',
        name: 'Card',
        category: 'card',
        description: 'Test',
        previewImage: '/preview.png',
        componentType: 'Card',
        props: {},
        createdAt: new Date()
      };

      (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(mockTemplate);

      const request1: AssemblyGenerationRequest = {
        templateId: 'card-1',
        themeId: 'theme-1'
      };

      const request2: AssemblyGenerationRequest = {
        templateId: 'card-1',
        themeId: 'theme-2'
      };

      const assembly1 = await createAssembly(request1);
      const assembly2 = await createAssembly(request2);

      const found1 = await findAssemblyById(assembly1.id);
      const found2 = await findAssemblyById(assembly2.id);

      expect(found1?.id).toBe(assembly1.id);
      expect(found2?.id).toBe(assembly2.id);
      expect(found1?.themeId).toBe('theme-1');
      expect(found2?.themeId).toBe('theme-2');
    });

    it('should return assembly with all properties intact', async () => {
      const mockTemplate = {
        id: 'form-1',
        name: 'Form',
        category: 'form',
        description: 'Test',
        previewImage: '/preview.png',
        componentType: 'Form',
        props: {},
        createdAt: new Date()
      };

      (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(mockTemplate);

      const customizations = {
        backgroundColor: '#E0E0E0',
        textColor: '#333333',
        fontSize: '14px'
      };

      const request: AssemblyGenerationRequest = {
        templateId: 'form-1',
        themeId: 'theme-6',
        customizations
      };

      const createdAssembly = await createAssembly(request);
      const foundAssembly = await findAssemblyById(createdAssembly.id);

      expect(foundAssembly).toBeDefined();
      expect(foundAssembly?.customizations).toEqual(customizations);
      expect(foundAssembly?.generatedCode).toBe(createdAssembly.generatedCode);
      expect(foundAssembly?.createdAt).toEqual(createdAssembly.createdAt);
    });
  });

  describe('getAllAssemblies', () => {
    beforeEach(() => {
      // Clear assemblies between tests by creating a fresh mock
      jest.clearAllMocks();
    });

    it('should return empty array when no assemblies exist', async () => {
      const assemblies = await getAllAssemblies();

      expect(assemblies).toBeDefined();
      expect(Array.isArray(assemblies)).toBe(true);
    });

    it('should return all created assemblies', async () => {
      const mockTemplate = {
        id: 'test-1',
        name: 'Test',
        category: 'test',
        description: 'Test',
        previewImage: '/preview.png',
        componentType: 'Test',
        props: {},
        createdAt: new Date()
      };

      (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(mockTemplate);

      const request1: AssemblyGenerationRequest = {
        templateId: 'test-1',
        themeId: 'theme-1'
      };

      const request2: AssemblyGenerationRequest = {
        templateId: 'test-1',
        themeId: 'theme-2'
      };

      await createAssembly(request1);
      await createAssembly(request2);

      const assemblies = await getAllAssemblies();

      expect(assemblies.length).toBeGreaterThanOrEqual(2);
      expect(assemblies.every((a: Assembly) => a.id !== undefined)).toBe(true);
    });

    it('should return assemblies as an array', async () => {
      const assemblies = await getAllAssemblies();

      expect(Array.isArray(assemblies)).toBe(true);
    });
  });

  describe('Assembly code generation', () => {
    it('should generate valid React component structure', async () => {
      const mockTemplate = {
        id: 'hero-1',
        name: 'Hero',
        category: 'hero',
        description: 'Test',
        previewImage: '/preview.png',
        componentType: 'HeroSection',
        props: {},
        createdAt: new Date()
      };

      (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(mockTemplate);

      const request: AssemblyGenerationRequest = {
        templateId: 'hero-1',
        themeId: 'theme-1',
        customizations: {
          padding: '100px 24px'
        }
      };

      const assembly = await createAssembly(request);

      expect(assembly.generatedCode).toContain('import React');
      expect(assembly.generatedCode).toContain('const HeroSection');
      expect(assembly.generatedCode).toContain('return');
      expect(assembly.generatedCode).toContain('export default HeroSection');
    });

    it('should include proper component naming in generated code', async () => {
      const mockTemplate = {
        id: 'card-1',
        name: 'Card',
        category: 'card',
        description: 'Test',
        previewImage: '/preview.png',
        componentType: 'Card',
        props: {},
        createdAt: new Date()
      };

      (templateService.getTemplateDetails as jest.Mock).mockResolvedValue(mockTemplate);

      const request: AssemblyGenerationRequest = {
        templateId: 'card-1',
        themeId: 'theme-1'
      };

      const assembly = await createAssembly(request);

      expect(assembly.generatedCode).toContain('React');
      expect(assembly.generatedCode).toContain('Card');
      expect(assembly.generatedCode).toContain('export default');
    });
  });
});

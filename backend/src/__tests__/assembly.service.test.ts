import { createAssembly, findAssemblyById, getAllAssemblies } from '../services/assembly.service';

describe('Assembly Service', () => {
  describe('createAssembly', () => {
    it('should create assembly with valid template', async () => {
      const assembly = await createAssembly({
        templateId: 'hero-1',
        themeId: 'test-theme-123'
      });

      expect(assembly).toBeDefined();
      expect(assembly.id).toBeDefined();
      expect(assembly.templateId).toBe('hero-1');
      expect(assembly.themeId).toBe('test-theme-123');
      expect(assembly.generatedCode).toContain('React');
      expect(assembly.createdAt).toBeInstanceOf(Date);
    });

    it('should create assembly with customizations', async () => {
      const customizations = {
        backgroundColor: '#FF5733',
        padding: '32px',
        borderRadius: '16px'
      };

      const assembly = await createAssembly({
        templateId: 'card-1',
        themeId: 'test-theme-456',
        customizations
      });

      expect(assembly.customizations).toEqual(customizations);
      expect(assembly.generatedCode).toContain('#FF5733');
    });

    it('should throw error for non-existent template', async () => {
      await expect(
        createAssembly({
          templateId: 'non-existent',
          themeId: 'test-theme'
        })
      ).rejects.toThrow('Template non-existent not found');
    });

    it('should generate different code for different templates', async () => {
      const heroAssembly = await createAssembly({
        templateId: 'hero-1',
        themeId: 'theme-1'
      });

      const cardAssembly = await createAssembly({
        templateId: 'card-1',
        themeId: 'theme-1'
      });

      expect(heroAssembly.generatedCode).not.toEqual(cardAssembly.generatedCode);
    });
  });

  describe('findAssemblyById', () => {
    it('should find created assembly by id', async () => {
      const created = await createAssembly({
        templateId: 'form-1',
        themeId: 'theme-test'
      });

      const found = await findAssemblyById(created.id);
      expect(found).toEqual(created);
    });

    it('should return null for non-existent id', async () => {
      const found = await findAssemblyById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('getAllAssemblies', () => {
    it('should return array of assemblies', async () => {
      const assemblies = await getAllAssemblies();
      expect(assemblies).toBeInstanceOf(Array);
    });
  });
});

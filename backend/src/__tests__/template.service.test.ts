import { getAllTemplates, getTemplateDetails, getTemplatesByCategory } from '../services/template.service';

describe('Template Service', () => {
  describe('getAllTemplates', () => {
    it('should return all templates when no category specified', async () => {
      const templates = await getAllTemplates();
      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should filter templates by category', async () => {
      const heroTemplates = await getAllTemplates('hero');
      expect(heroTemplates.every(t => t.category === 'hero')).toBe(true);
    });

    it('should return empty array for non-existent category', async () => {
      const templates = await getAllTemplates('nonexistent');
      expect(templates).toEqual([]);
    });
  });

  describe('getTemplateDetails', () => {
    it('should return template by id', async () => {
      const template = await getTemplateDetails('hero-1');
      expect(template).not.toBeNull();
      expect(template?.id).toBe('hero-1');
      expect(template?.name).toBeDefined();
    });

    it('should return null for non-existent template', async () => {
      const template = await getTemplateDetails('non-existent-id');
      expect(template).toBeNull();
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates matching category', async () => {
      const cardTemplates = await getTemplatesByCategory('card');
      expect(cardTemplates.every(t => t.category === 'card')).toBe(true);
    });

    it('should return navigation templates', async () => {
      const navTemplates = await getTemplatesByCategory('navigation');
      expect(navTemplates.length).toBeGreaterThan(0);
    });
  });
});

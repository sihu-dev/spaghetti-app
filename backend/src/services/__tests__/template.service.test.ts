import {
  getAllTemplates,
  getTemplateDetails,
  getTemplatesByCategory
} from '../template.service';
import { Template } from '../../types';

describe('Template Service', () => {
  describe('getAllTemplates', () => {
    it('should return all templates when no category is specified', async () => {
      const templates = await getAllTemplates();

      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should return templates with correct structure', async () => {
      const templates = await getAllTemplates();

      templates.forEach((template: Template) => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('category');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('previewImage');
        expect(template).toHaveProperty('componentType');
        expect(template).toHaveProperty('props');
        expect(template).toHaveProperty('createdAt');
        expect(typeof template.id).toBe('string');
        expect(typeof template.name).toBe('string');
        expect(typeof template.category).toBe('string');
      });
    });

    it('should filter templates by category when category is specified', async () => {
      const heroTemplates = await getAllTemplates('hero');

      expect(heroTemplates).toBeDefined();
      expect(Array.isArray(heroTemplates)).toBe(true);
      heroTemplates.forEach((template: Template) => {
        expect(template.category).toBe('hero');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const templates = await getAllTemplates('non-existent-category');

      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBe(0);
    });

    it('should return navigation templates when filtered by navigation category', async () => {
      const navTemplates = await getAllTemplates('navigation');

      expect(navTemplates).toBeDefined();
      expect(navTemplates.length).toBeGreaterThan(0);
      navTemplates.forEach((template: Template) => {
        expect(template.category).toBe('navigation');
      });
    });
  });

  describe('getTemplateDetails', () => {
    it('should return template details for valid id', async () => {
      const template = await getTemplateDetails('hero-1');

      expect(template).toBeDefined();
      expect(template).not.toBeNull();
      expect(template?.id).toBe('hero-1');
      expect(template?.name).toBe('Hero Section - Centered');
      expect(template?.category).toBe('hero');
    });

    it('should return template with correct props structure', async () => {
      const template = await getTemplateDetails('hero-1');

      expect(template).toBeDefined();
      expect(template?.props).toBeDefined();
      expect(typeof template?.props).toBe('object');
      expect(template?.props.layout).toBe('centered');
      expect(template?.props.hasImage).toBe(true);
      expect(template?.props.hasCTA).toBe(true);
    });

    it('should return null for non-existent template id', async () => {
      const template = await getTemplateDetails('non-existent-id');

      expect(template).toBeNull();
    });

    it('should return navbar template with correct details', async () => {
      const template = await getTemplateDetails('navbar-1');

      expect(template).toBeDefined();
      expect(template?.id).toBe('navbar-1');
      expect(template?.componentType).toBe('NavBar');
      expect(template?.props.layout).toBe('horizontal');
    });

    it('should return card template with correct details', async () => {
      const template = await getTemplateDetails('card-1');

      expect(template).toBeDefined();
      expect(template?.id).toBe('card-1');
      expect(template?.category).toBe('card');
      expect(template?.componentType).toBe('Card');
    });

    it('should return footer template with correct details', async () => {
      const template = await getTemplateDetails('footer-1');

      expect(template).toBeDefined();
      expect(template?.id).toBe('footer-1');
      expect(template?.props.columns).toBe(4);
      expect(template?.props.hasSocial).toBe(true);
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return all templates in hero category', async () => {
      const templates = await getTemplatesByCategory('hero');

      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
      templates.forEach((template: Template) => {
        expect(template.category).toBe('hero');
      });
    });

    it('should return all templates in card category', async () => {
      const templates = await getTemplatesByCategory('card');

      expect(templates).toBeDefined();
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((template: Template) => {
        expect(template.category).toBe('card');
        expect(template.componentType).toBe('Card');
      });
    });

    it('should return all templates in footer category', async () => {
      const templates = await getTemplatesByCategory('footer');

      expect(templates).toBeDefined();
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((template: Template) => {
        expect(template.category).toBe('footer');
      });
    });

    it('should return all templates in form category', async () => {
      const templates = await getTemplatesByCategory('form');

      expect(templates).toBeDefined();
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((template: Template) => {
        expect(template.category).toBe('form');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const templates = await getTemplatesByCategory('non-existent');

      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBe(0);
    });

    it('should be consistent with getAllTemplates when filtering by category', async () => {
      const category = 'navigation';
      const templatesFromGetAll = await getAllTemplates(category);
      const templatesFromGetByCategory = await getTemplatesByCategory(category);

      expect(templatesFromGetAll).toEqual(templatesFromGetByCategory);
    });

    it('should return different results for different categories', async () => {
      const heroTemplates = await getTemplatesByCategory('hero');
      const cardTemplates = await getTemplatesByCategory('card');

      expect(heroTemplates).not.toEqual(cardTemplates);

      if (heroTemplates.length > 0 && cardTemplates.length > 0) {
        expect(heroTemplates[0].category).not.toBe(cardTemplates[0].category);
      }
    });
  });

  describe('Template data integrity', () => {
    it('should have unique template IDs', async () => {
      const templates = await getAllTemplates();
      const ids = templates.map(t => t.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid dates for all templates', async () => {
      const templates = await getAllTemplates();

      templates.forEach((template: Template) => {
        expect(template.createdAt).toBeInstanceOf(Date);
        expect(template.createdAt.getTime()).not.toBeNaN();
      });
    });

    it('should have non-empty names and descriptions', async () => {
      const templates = await getAllTemplates();

      templates.forEach((template: Template) => {
        expect(template.name).toBeTruthy();
        expect(template.description).toBeTruthy();
        expect(template.name.length).toBeGreaterThan(0);
        expect(template.description.length).toBeGreaterThan(0);
      });
    });
  });
});

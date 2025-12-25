import {
  getAllTemplates,
  getTemplateDetails,
  getTemplatesByCategory,
} from '../../services/template.service';

describe('Template Service', () => {
  describe('getAllTemplates', () => {
    it('should return all templates when no category is provided', async () => {
      const templates = await getAllTemplates();

      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);

      // Verify each template has required properties
      templates.forEach((template) => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('category');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('previewImage');
        expect(template).toHaveProperty('componentType');
        expect(template).toHaveProperty('props');
        expect(template).toHaveProperty('createdAt');
        expect(template.createdAt).toBeInstanceOf(Date);
      });
    });

    it('should return filtered templates when category is provided', async () => {
      const heroTemplates = await getAllTemplates('hero');

      expect(Array.isArray(heroTemplates)).toBe(true);
      expect(heroTemplates.length).toBeGreaterThan(0);

      // All returned templates should belong to 'hero' category
      heroTemplates.forEach((template) => {
        expect(template.category).toBe('hero');
      });
    });

    it('should return navigation templates when category is "navigation"', async () => {
      const navTemplates = await getAllTemplates('navigation');

      expect(Array.isArray(navTemplates)).toBe(true);
      expect(navTemplates.length).toBeGreaterThan(0);

      navTemplates.forEach((template) => {
        expect(template.category).toBe('navigation');
      });
    });

    it('should return card templates when category is "card"', async () => {
      const cardTemplates = await getAllTemplates('card');

      expect(Array.isArray(cardTemplates)).toBe(true);
      expect(cardTemplates.length).toBeGreaterThan(0);

      cardTemplates.forEach((template) => {
        expect(template.category).toBe('card');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const templates = await getAllTemplates('non-existent-category');

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBe(0);
    });

    it('should return different counts for filtered vs all templates', async () => {
      const allTemplates = await getAllTemplates();
      const heroTemplates = await getAllTemplates('hero');

      expect(allTemplates.length).toBeGreaterThan(heroTemplates.length);
    });
  });

  describe('getTemplateDetails', () => {
    it('should return template by valid ID', async () => {
      const template = await getTemplateDetails('hero-1');

      expect(template).not.toBeNull();
      expect(template).toHaveProperty('id', 'hero-1');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('category');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('previewImage');
      expect(template).toHaveProperty('componentType');
      expect(template).toHaveProperty('props');
      expect(template).toHaveProperty('createdAt');
    });

    it('should return correct template details for hero-1', async () => {
      const template = await getTemplateDetails('hero-1');

      expect(template).not.toBeNull();
      expect(template!.id).toBe('hero-1');
      expect(template!.name).toBe('Hero Section - Centered');
      expect(template!.category).toBe('hero');
      expect(template!.componentType).toBe('HeroSection');
      expect(template!.props).toHaveProperty('layout', 'centered');
      expect(template!.props).toHaveProperty('hasImage', true);
      expect(template!.props).toHaveProperty('hasCTA', true);
    });

    it('should return correct template details for navbar-1', async () => {
      const template = await getTemplateDetails('navbar-1');

      expect(template).not.toBeNull();
      expect(template!.id).toBe('navbar-1');
      expect(template!.name).toBe('Navigation Bar - Horizontal');
      expect(template!.category).toBe('navigation');
      expect(template!.componentType).toBe('NavBar');
      expect(template!.props).toHaveProperty('layout', 'horizontal');
      expect(template!.props).toHaveProperty('hasSearch', false);
      expect(template!.props).toHaveProperty('position', 'fixed');
    });

    it('should return correct template details for card-1', async () => {
      const template = await getTemplateDetails('card-1');

      expect(template).not.toBeNull();
      expect(template!.id).toBe('card-1');
      expect(template!.name).toBe('Feature Card');
      expect(template!.category).toBe('card');
      expect(template!.componentType).toBe('Card');
      expect(template!.props).toHaveProperty('hasIcon', true);
      expect(template!.props).toHaveProperty('hasButton', false);
      expect(template!.props).toHaveProperty('elevation', 'medium');
    });

    it('should return correct template details for footer-1', async () => {
      const template = await getTemplateDetails('footer-1');

      expect(template).not.toBeNull();
      expect(template!.id).toBe('footer-1');
      expect(template!.name).toBe('Footer - Multi-column');
      expect(template!.category).toBe('footer');
      expect(template!.componentType).toBe('Footer');
      expect(template!.props).toHaveProperty('columns', 4);
      expect(template!.props).toHaveProperty('hasSocial', true);
      expect(template!.props).toHaveProperty('hasNewsletter', true);
    });

    it('should return correct template details for form-1', async () => {
      const template = await getTemplateDetails('form-1');

      expect(template).not.toBeNull();
      expect(template!.id).toBe('form-1');
      expect(template!.name).toBe('Contact Form');
      expect(template!.category).toBe('form');
      expect(template!.componentType).toBe('Form');
      expect(template!.props).toHaveProperty('fields');
      expect(template!.props).toHaveProperty('hasValidation', true);
    });

    it('should return null for non-existent ID', async () => {
      const template = await getTemplateDetails('non-existent-id');

      expect(template).toBeNull();
    });

    it('should return null for empty string ID', async () => {
      const template = await getTemplateDetails('');

      expect(template).toBeNull();
    });

    it('should return template with createdAt as Date instance', async () => {
      const template = await getTemplateDetails('hero-1');

      expect(template).not.toBeNull();
      expect(template!.createdAt).toBeInstanceOf(Date);
    });

    it('should return template with props as object', async () => {
      const template = await getTemplateDetails('hero-1');

      expect(template).not.toBeNull();
      expect(typeof template!.props).toBe('object');
      expect(template!.props).not.toBeNull();
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates for "hero" category', async () => {
      const templates = await getTemplatesByCategory('hero');

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);

      templates.forEach((template) => {
        expect(template.category).toBe('hero');
      });
    });

    it('should return templates for "navigation" category', async () => {
      const templates = await getTemplatesByCategory('navigation');

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);

      templates.forEach((template) => {
        expect(template.category).toBe('navigation');
      });
    });

    it('should return templates for "card" category', async () => {
      const templates = await getTemplatesByCategory('card');

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);

      templates.forEach((template) => {
        expect(template.category).toBe('card');
      });
    });

    it('should return templates for "footer" category', async () => {
      const templates = await getTemplatesByCategory('footer');

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);

      templates.forEach((template) => {
        expect(template.category).toBe('footer');
      });
    });

    it('should return templates for "form" category', async () => {
      const templates = await getTemplatesByCategory('form');

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);

      templates.forEach((template) => {
        expect(template.category).toBe('form');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const templates = await getTemplatesByCategory('non-existent-category');

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBe(0);
    });

    it('should return empty array for empty string category', async () => {
      const templates = await getTemplatesByCategory('');

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBe(0);
    });

    it('should return templates with all required properties', async () => {
      const templates = await getTemplatesByCategory('hero');

      templates.forEach((template) => {
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

    it('should return same results as getAllTemplates with category filter', async () => {
      const category = 'hero';
      const templatesFromGetAll = await getAllTemplates(category);
      const templatesFromGetByCategory = await getTemplatesByCategory(category);

      expect(templatesFromGetAll).toEqual(templatesFromGetByCategory);
      expect(templatesFromGetAll.length).toBe(templatesFromGetByCategory.length);
    });
  });

  describe('Template Data Integrity', () => {
    it('should have consistent template IDs across all functions', async () => {
      const allTemplates = await getAllTemplates();
      const templateIds = allTemplates.map((t) => t.id);

      // Check that each template ID can be retrieved individually
      for (const id of templateIds) {
        const template = await getTemplateDetails(id);
        expect(template).not.toBeNull();
        expect(template!.id).toBe(id);
      }
    });

    it('should have at least 5 templates available', async () => {
      const templates = await getAllTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(5);
    });

    it('should have multiple categories', async () => {
      const templates = await getAllTemplates();
      const categories = new Set(templates.map((t) => t.category));
      expect(categories.size).toBeGreaterThan(1);
    });

    it('should have unique template IDs', async () => {
      const templates = await getAllTemplates();
      const ids = templates.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have non-empty names and descriptions', async () => {
      const templates = await getAllTemplates();

      templates.forEach((template) => {
        expect(template.name.length).toBeGreaterThan(0);
        expect(template.description.length).toBeGreaterThan(0);
      });
    });
  });
});

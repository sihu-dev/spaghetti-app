import { Template } from '../types';

// In-memory storage (replace with database in production)
class TemplateModel {
  private templates: Map<string, Template> = new Map();

  create(template: Template): Template {
    this.templates.set(template.id, template);
    return template;
  }

  findById(id: string): Template | null {
    return this.templates.get(id) || null;
  }

  findAll(): Template[] {
    return Array.from(this.templates.values());
  }

  findByCategory(category: string): Template[] {
    return Array.from(this.templates.values()).filter(
      t => t.category === category
    );
  }

  update(id: string, updates: Partial<Template>): Template | null {
    const template = this.templates.get(id);
    if (!template) return null;

    const updatedTemplate = { ...template, ...updates };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  delete(id: string): boolean {
    return this.templates.delete(id);
  }
}

export default new TemplateModel();

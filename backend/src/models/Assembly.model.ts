import { Assembly } from '../types';

// In-memory storage (replace with database in production)
class AssemblyModel {
  private assemblies: Map<string, Assembly> = new Map();

  create(assembly: Assembly): Assembly {
    this.assemblies.set(assembly.id, assembly);
    return assembly;
  }

  findById(id: string): Assembly | null {
    return this.assemblies.get(id) || null;
  }

  findAll(): Assembly[] {
    return Array.from(this.assemblies.values());
  }

  findByTemplateId(templateId: string): Assembly[] {
    return Array.from(this.assemblies.values()).filter(
      a => a.templateId === templateId
    );
  }

  findByThemeId(themeId: string): Assembly[] {
    return Array.from(this.assemblies.values()).filter(
      a => a.themeId === themeId
    );
  }

  update(id: string, updates: Partial<Assembly>): Assembly | null {
    const assembly = this.assemblies.get(id);
    if (!assembly) return null;

    const updatedAssembly = { ...assembly, ...updates };
    this.assemblies.set(id, updatedAssembly);
    return updatedAssembly;
  }

  delete(id: string): boolean {
    return this.assemblies.delete(id);
  }
}

export default new AssemblyModel();

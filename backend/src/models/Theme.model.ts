import { Theme } from '../types';

// In-memory storage (replace with database in production)
class ThemeModel {
  private themes: Map<string, Theme> = new Map();

  create(theme: Theme): Theme {
    const id = theme.id || `theme-${Date.now()}`;
    const themeWithId = { ...theme, id };
    this.themes.set(id, themeWithId);
    return themeWithId;
  }

  findById(id: string): Theme | null {
    return this.themes.get(id) || null;
  }

  findAll(): Theme[] {
    return Array.from(this.themes.values());
  }

  update(id: string, updates: Partial<Theme>): Theme | null {
    const theme = this.themes.get(id);
    if (!theme) return null;

    const updatedTheme = { ...theme, ...updates };
    this.themes.set(id, updatedTheme);
    return updatedTheme;
  }

  delete(id: string): boolean {
    return this.themes.delete(id);
  }
}

export default new ThemeModel();

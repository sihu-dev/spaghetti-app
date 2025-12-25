import { validateColorPalette, calculateContrastRatio } from '../services/theme.service';

describe('Theme Service', () => {
  describe('validateColorPalette', () => {
    it('should validate correct hex colors', () => {
      const validColors = ['#FF5733', '#00FF00', '#0000FF', '#FFFFFF', '#000000'];
      expect(validateColorPalette(validColors)).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      const invalidColors = ['#FF573', 'red', '#GGGGGG', '000000'];
      expect(validateColorPalette(invalidColors)).toBe(false);
    });

    it('should handle empty array', () => {
      expect(validateColorPalette([])).toBe(true);
    });

    it('should handle lowercase hex colors', () => {
      const lowercaseColors = ['#ff5733', '#00ff00', '#abcdef'];
      expect(validateColorPalette(lowercaseColors)).toBe(true);
    });
  });

  describe('calculateContrastRatio', () => {
    it('should calculate high contrast between black and white', () => {
      const ratio = calculateContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate low contrast between similar colors', () => {
      const ratio = calculateContrastRatio('#AAAAAA', '#BBBBBB');
      expect(ratio).toBeLessThan(2);
    });

    it('should return same ratio regardless of color order', () => {
      const ratio1 = calculateContrastRatio('#000000', '#FFFFFF');
      const ratio2 = calculateContrastRatio('#FFFFFF', '#000000');
      expect(ratio1).toEqual(ratio2);
    });

    it('should meet WCAG AA standard for good contrast', () => {
      // WCAG AA requires 4.5:1 for normal text
      const ratio = calculateContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});

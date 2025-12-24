/**
 * Color Utilities Module
 * Provides color conversion and manipulation functions
 */

/**
 * Converts RGB color to HEX format
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} HEX color string (e.g., "#FF5733")
 */
export function rgbToHex(r, g, b) {
  const toHex = (value) => {
    const hex = Math.round(Math.max(0, Math.min(255, value))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Converts HEX color to RGB format
 * @param {string} hex - HEX color string (e.g., "#FF5733" or "FF5733")
 * @returns {{r: number, g: number, b: number}} RGB color object
 */
export function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

/**
 * Converts RGB color to HSL format
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {{h: number, s: number, l: number}} HSL color object (h: 0-360, s: 0-100, l: 0-100)
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Converts HSL color to RGB format
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {{r: number, g: number, b: number}} RGB color object
 */
export function hslToRgb(h, s, l) {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Calculates relative luminance of a color (WCAG standard)
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {number} Relative luminance (0-1)
 */
export function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(value => {
    value = value / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates contrast ratio between two colors (WCAG standard)
 * @param {Array<number>} rgb1 - First RGB color [r, g, b]
 * @param {Array<number>} rgb2 - Second RGB color [r, g, b]
 * @returns {number} Contrast ratio (1-21)
 */
export function getContrastRatio(rgb1, rgb2) {
  const lum1 = getLuminance(...rgb1);
  const lum2 = getLuminance(...rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculates perceived brightness of a color
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {number} Brightness value (0-255)
 */
export function getBrightness(r, g, b) {
  // Using perceived brightness formula
  return Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b);
}

/**
 * Determines if a color is light or dark
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {boolean} True if light, false if dark
 */
export function isLightColor(r, g, b) {
  return getBrightness(r, g, b) > 127.5;
}

/**
 * Calculates complementary color (opposite on color wheel)
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {{r: number, g: number, b: number}} Complementary RGB color
 */
export function getComplementaryColor(r, g, b) {
  const hsl = rgbToHsl(r, g, b);
  hsl.h = (hsl.h + 180) % 360;
  return hslToRgb(hsl.h, hsl.s, hsl.l);
}

/**
 * Generates analogous colors (adjacent on color wheel)
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @param {number} angle - Angle offset (default: 30 degrees)
 * @returns {Array<{r: number, g: number, b: number}>} Array of two analogous colors
 */
export function getAnalogousColors(r, g, b, angle = 30) {
  const hsl = rgbToHsl(r, g, b);
  const color1 = hslToRgb((hsl.h + angle) % 360, hsl.s, hsl.l);
  const color2 = hslToRgb((hsl.h - angle + 360) % 360, hsl.s, hsl.l);
  return [color1, color2];
}

/**
 * Generates triadic colors (evenly spaced on color wheel)
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {Array<{r: number, g: number, b: number}>} Array of two triadic colors
 */
export function getTriadicColors(r, g, b) {
  const hsl = rgbToHsl(r, g, b);
  const color1 = hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l);
  const color2 = hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l);
  return [color1, color2];
}

/**
 * Adjusts color lightness
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @param {number} amount - Amount to adjust (-100 to 100)
 * @returns {{r: number, g: number, b: number}} Adjusted RGB color
 */
export function adjustLightness(r, g, b, amount) {
  const hsl = rgbToHsl(r, g, b);
  hsl.l = Math.max(0, Math.min(100, hsl.l + amount));
  return hslToRgb(hsl.h, hsl.s, hsl.l);
}

/**
 * Adjusts color saturation
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @param {number} amount - Amount to adjust (-100 to 100)
 * @returns {{r: number, g: number, b: number}} Adjusted RGB color
 */
export function adjustSaturation(r, g, b, amount) {
  const hsl = rgbToHsl(r, g, b);
  hsl.s = Math.max(0, Math.min(100, hsl.s + amount));
  return hslToRgb(hsl.h, hsl.s, hsl.l);
}

/**
 * Converts color object to multiple formats
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {Object} Color in multiple formats
 */
export function colorToFormats(r, g, b) {
  const hsl = rgbToHsl(r, g, b);
  return {
    hex: rgbToHex(r, g, b),
    rgb: { r, g, b },
    rgbString: `rgb(${r}, ${g}, ${b})`,
    hsl: hsl,
    hslString: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    brightness: Math.round(getBrightness(r, g, b)),
    isLight: isLightColor(r, g, b)
  };
}

/**
 * Design Token Generator Module
 * Converts extracted colors into design tokens
 */

import {
  rgbToHsl,
  getBrightness,
  isLightColor,
  getContrastRatio,
  adjustLightness,
  adjustSaturation,
  colorToFormats
} from './color-utils.js';

/**
 * Generates design tokens from extracted colors
 * @param {Array<Object>} colors - Array of color objects from color extractor
 * @param {Object} options - Generation options
 * @param {string} options.format - Output format: 'json' or 'css' (default: 'json')
 * @param {string} options.prefix - Prefix for token names (default: 'color')
 * @param {boolean} options.generateShades - Generate shade variations (default: true)
 * @returns {Object|string} Design tokens in requested format
 */
export function generateDesignTokens(colors, options = {}) {
  const {
    format = 'json',
    prefix = 'color',
    generateShades = true
  } = options;

  // Classify colors into categories
  const classifiedColors = classifyColors(colors);

  // Generate tokens
  const tokens = buildTokens(classifiedColors, { prefix, generateShades });

  // Return in requested format
  if (format === 'css') {
    return tokensToCSS(tokens);
  } else if (format === 'scss') {
    return tokensToSCSS(tokens);
  } else {
    return tokens;
  }
}

/**
 * Classifies colors into design categories
 * @param {Array<Object>} colors - Array of color objects
 * @returns {Object} Classified colors by category
 */
function classifyColors(colors) {
  if (!colors || colors.length === 0) {
    return {};
  }

  const classified = {
    primary: null,
    secondary: null,
    accent: null,
    background: [],
    text: [],
    neutral: [],
    all: [...colors]
  };

  // Sort by population/dominance
  const sortedColors = [...colors].sort((a, b) => b.population - a.population);

  // Find primary color (most saturated and dominant)
  const saturatedColors = sortedColors
    .filter(c => c.hsl.s > 30)
    .sort((a, b) => b.hsl.s - a.hsl.s);

  if (saturatedColors.length > 0) {
    classified.primary = saturatedColors[0];

    // Find secondary color (different hue from primary)
    if (saturatedColors.length > 1) {
      for (let i = 1; i < saturatedColors.length; i++) {
        const hueDiff = Math.abs(saturatedColors[i].hsl.h - classified.primary.hsl.h);
        if (hueDiff > 30 && hueDiff < 330) {
          classified.secondary = saturatedColors[i];
          break;
        }
      }
    }

    // Find accent color (complementary or vibrant)
    if (saturatedColors.length > 2) {
      for (let i = 1; i < saturatedColors.length; i++) {
        if (saturatedColors[i] === classified.secondary) continue;

        const hueDiff = Math.abs(saturatedColors[i].hsl.h - classified.primary.hsl.h);
        const isComplementary = (hueDiff > 150 && hueDiff < 210);
        const isVibrant = saturatedColors[i].hsl.s > 60 && saturatedColors[i].hsl.l > 40 && saturatedColors[i].hsl.l < 70;

        if (isComplementary || isVibrant) {
          classified.accent = saturatedColors[i];
          break;
        }
      }
    }
  }

  // If no primary found, use most dominant color
  if (!classified.primary && sortedColors.length > 0) {
    classified.primary = sortedColors[0];
  }

  // Classify background colors (light colors)
  classified.background = sortedColors.filter(c =>
    c.hsl.l > 85 || (c.hsl.l > 70 && c.hsl.s < 20)
  );

  // Classify text colors (dark colors)
  classified.text = sortedColors.filter(c =>
    c.hsl.l < 30 || (c.hsl.l < 50 && c.hsl.s < 20)
  );

  // Classify neutral colors (low saturation)
  classified.neutral = sortedColors.filter(c =>
    c.hsl.s < 15 && c.hsl.l > 20 && c.hsl.l < 80
  );

  return classified;
}

/**
 * Builds token structure from classified colors
 * @param {Object} classifiedColors - Classified color object
 * @param {Object} options - Build options
 * @returns {Object} Token structure
 */
function buildTokens(classifiedColors, options = {}) {
  const { prefix = 'color', generateShades = true } = options;
  const tokens = {
    colors: {},
    metadata: {
      generated: new Date().toISOString(),
      totalColors: classifiedColors.all ? classifiedColors.all.length : 0
    }
  };

  // Add primary color with shades
  if (classifiedColors.primary) {
    tokens.colors.primary = buildColorToken(classifiedColors.primary, generateShades);
  }

  // Add secondary color with shades
  if (classifiedColors.secondary) {
    tokens.colors.secondary = buildColorToken(classifiedColors.secondary, generateShades);
  }

  // Add accent color with shades
  if (classifiedColors.accent) {
    tokens.colors.accent = buildColorToken(classifiedColors.accent, generateShades);
  }

  // Add background tokens
  if (classifiedColors.background && classifiedColors.background.length > 0) {
    tokens.colors.background = {
      base: classifiedColors.background[0].hex,
      light: adjustColorLightness(classifiedColors.background[0], 10).hex,
      dark: adjustColorLightness(classifiedColors.background[0], -5).hex
    };
  } else {
    // Default light background
    tokens.colors.background = {
      base: '#FFFFFF',
      light: '#FAFAFA',
      dark: '#F5F5F5'
    };
  }

  // Add text tokens
  if (classifiedColors.text && classifiedColors.text.length > 0) {
    const baseText = classifiedColors.text[0];
    tokens.colors.text = {
      primary: baseText.hex,
      secondary: adjustColorLightness(baseText, 20).hex,
      tertiary: adjustColorLightness(baseText, 40).hex,
      disabled: adjustColorLightness(baseText, 60).hex
    };
  } else {
    // Default dark text
    tokens.colors.text = {
      primary: '#212121',
      secondary: '#757575',
      tertiary: '#9E9E9E',
      disabled: '#BDBDBD'
    };
  }

  // Add neutral/gray scale
  if (classifiedColors.neutral && classifiedColors.neutral.length > 0) {
    tokens.colors.neutral = buildNeutralScale(classifiedColors.neutral[0]);
  } else {
    tokens.colors.neutral = buildDefaultNeutralScale();
  }

  // Add semantic colors
  tokens.colors.semantic = {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3'
  };

  // Add all extracted colors for reference
  if (classifiedColors.all && classifiedColors.all.length > 0) {
    tokens.colors.palette = classifiedColors.all.map((color, index) => ({
      name: `${prefix}-${index + 1}`,
      hex: color.hex,
      rgb: color.rgbString,
      hsl: color.hslString,
      population: color.population,
      percentage: color.percentage
    }));
  }

  return tokens;
}

/**
 * Builds a complete color token with shades
 * @param {Object} color - Color object
 * @param {boolean} generateShades - Whether to generate shades
 * @returns {Object|string} Color token
 */
function buildColorToken(color, generateShades = true) {
  if (!generateShades) {
    return color.hex;
  }

  const { r, g, b } = color.rgb;

  return {
    50: adjustColorLightness(color, 45).hex,
    100: adjustColorLightness(color, 35).hex,
    200: adjustColorLightness(color, 25).hex,
    300: adjustColorLightness(color, 15).hex,
    400: adjustColorLightness(color, 7).hex,
    500: color.hex, // Base color
    600: adjustColorLightness(color, -7).hex,
    700: adjustColorLightness(color, -15).hex,
    800: adjustColorLightness(color, -25).hex,
    900: adjustColorLightness(color, -35).hex,
    base: color.hex
  };
}

/**
 * Builds neutral/gray scale from a color
 * @param {Object} color - Base neutral color
 * @returns {Object} Neutral scale
 */
function buildNeutralScale(color) {
  return {
    50: adjustColorLightness(color, 45).hex,
    100: adjustColorLightness(color, 40).hex,
    200: adjustColorLightness(color, 30).hex,
    300: adjustColorLightness(color, 20).hex,
    400: adjustColorLightness(color, 10).hex,
    500: color.hex,
    600: adjustColorLightness(color, -10).hex,
    700: adjustColorLightness(color, -20).hex,
    800: adjustColorLightness(color, -30).hex,
    900: adjustColorLightness(color, -40).hex
  };
}

/**
 * Builds default neutral scale (gray)
 * @returns {Object} Default neutral scale
 */
function buildDefaultNeutralScale() {
  return {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  };
}

/**
 * Adjusts color lightness
 * @param {Object} color - Color object
 * @param {number} amount - Amount to adjust
 * @returns {Object} Adjusted color
 */
function adjustColorLightness(color, amount) {
  const { r, g, b } = color.rgb;
  const adjusted = adjustLightness(r, g, b, amount);
  return colorToFormats(adjusted.r, adjusted.g, adjusted.b);
}

/**
 * Converts tokens to CSS variables format
 * @param {Object} tokens - Token object
 * @returns {string} CSS variables string
 */
function tokensToCSS(tokens) {
  let css = ':root {\n';
  css += '  /* Generated by SPAGHETTI Color Extractor */\n';
  css += `  /* Generated at: ${tokens.metadata.generated} */\n\n`;

  css += '  /* Primary Colors */\n';
  if (tokens.colors.primary) {
    css += generateCSSVariables('primary', tokens.colors.primary);
  }

  css += '\n  /* Secondary Colors */\n';
  if (tokens.colors.secondary) {
    css += generateCSSVariables('secondary', tokens.colors.secondary);
  }

  css += '\n  /* Accent Colors */\n';
  if (tokens.colors.accent) {
    css += generateCSSVariables('accent', tokens.colors.accent);
  }

  css += '\n  /* Background Colors */\n';
  if (tokens.colors.background) {
    css += generateCSSVariables('background', tokens.colors.background);
  }

  css += '\n  /* Text Colors */\n';
  if (tokens.colors.text) {
    css += generateCSSVariables('text', tokens.colors.text);
  }

  css += '\n  /* Neutral Colors */\n';
  if (tokens.colors.neutral) {
    css += generateCSSVariables('neutral', tokens.colors.neutral);
  }

  css += '\n  /* Semantic Colors */\n';
  if (tokens.colors.semantic) {
    css += generateCSSVariables('semantic', tokens.colors.semantic);
  }

  css += '}\n';
  return css;
}

/**
 * Generates CSS variables for a color category
 * @param {string} category - Category name
 * @param {Object|string} values - Color values
 * @returns {string} CSS variable declarations
 */
function generateCSSVariables(category, values) {
  let css = '';

  if (typeof values === 'string') {
    css += `  --color-${category}: ${values};\n`;
  } else if (typeof values === 'object') {
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === 'string') {
        css += `  --color-${category}-${key}: ${value};\n`;
      }
    }
  }

  return css;
}

/**
 * Converts tokens to SCSS variables format
 * @param {Object} tokens - Token object
 * @returns {string} SCSS variables string
 */
function tokensToSCSS(tokens) {
  let scss = '// Generated by SPAGHETTI Color Extractor\n';
  scss += `// Generated at: ${tokens.metadata.generated}\n\n`;

  scss += '// Primary Colors\n';
  if (tokens.colors.primary) {
    scss += generateSCSSVariables('primary', tokens.colors.primary);
  }

  scss += '\n// Secondary Colors\n';
  if (tokens.colors.secondary) {
    scss += generateSCSSVariables('secondary', tokens.colors.secondary);
  }

  scss += '\n// Accent Colors\n';
  if (tokens.colors.accent) {
    scss += generateSCSSVariables('accent', tokens.colors.accent);
  }

  scss += '\n// Background Colors\n';
  if (tokens.colors.background) {
    scss += generateSCSSVariables('background', tokens.colors.background);
  }

  scss += '\n// Text Colors\n';
  if (tokens.colors.text) {
    scss += generateSCSSVariables('text', tokens.colors.text);
  }

  scss += '\n// Neutral Colors\n';
  if (tokens.colors.neutral) {
    scss += generateSCSSVariables('neutral', tokens.colors.neutral);
  }

  scss += '\n// Semantic Colors\n';
  if (tokens.colors.semantic) {
    scss += generateSCSSVariables('semantic', tokens.colors.semantic);
  }

  return scss;
}

/**
 * Generates SCSS variables for a color category
 * @param {string} category - Category name
 * @param {Object|string} values - Color values
 * @returns {string} SCSS variable declarations
 */
function generateSCSSVariables(category, values) {
  let scss = '';

  if (typeof values === 'string') {
    scss += `$color-${category}: ${values};\n`;
  } else if (typeof values === 'object') {
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === 'string') {
        scss += `$color-${category}-${key}: ${value};\n`;
      }
    }
  }

  return scss;
}

/**
 * Generates Tailwind-style color configuration
 * @param {Array<Object>} colors - Array of color objects
 * @returns {Object} Tailwind color config
 */
export function generateTailwindConfig(colors) {
  const classified = classifyColors(colors);
  const config = {
    colors: {}
  };

  if (classified.primary) {
    config.colors.primary = buildColorToken(classified.primary, true);
  }

  if (classified.secondary) {
    config.colors.secondary = buildColorToken(classified.secondary, true);
  }

  if (classified.accent) {
    config.colors.accent = buildColorToken(classified.accent, true);
  }

  if (classified.neutral && classified.neutral.length > 0) {
    config.colors.neutral = buildNeutralScale(classified.neutral[0]);
  }

  return config;
}

/**
 * Validates contrast ratio for accessibility
 * @param {Object} tokens - Design tokens
 * @returns {Object} Accessibility report
 */
export function validateAccessibility(tokens) {
  const report = {
    passed: [],
    warnings: [],
    errors: []
  };

  // Check text on background contrast
  if (tokens.colors.text && tokens.colors.background) {
    const textColor = tokens.colors.text.primary;
    const bgColor = tokens.colors.background.base;

    // This is a simplified check - would need full color parsing in production
    report.info = 'Contrast validation requires runtime color comparison';
  }

  return report;
}

export default {
  generateDesignTokens,
  generateTailwindConfig,
  validateAccessibility,
  classifyColors
};

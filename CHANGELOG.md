# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive test coverage (85%+) for color utilities
- ESLint configuration with TypeScript support
- Performance optimizations with `useCallback` and `useMemo`
- `normalizeHex()` utility for robust HEX validation
- `colorScaleToRecord()` utility for type-safe color scale conversion
- WCAG accessibility checking utilities
- Dark mode theme generation
- Comprehensive README with API documentation
- CHANGELOG.md for tracking changes

### Changed
- Migrated from Google Fonts to system font stack for network independence
- Updated `getPixelsFromImageData()` to support optional `maxPixels` sampling
- Fixed ColorScale key type consistency (numeric keys)
- Improved type safety by removing unsafe type casts

### Fixed
- Build failures in network-restricted environments
- Function signature mismatch between implementation and tests
- Missing 950 shade in neutral color defaults
- ESLint configuration for ESLint v9

## [0.1.0] - 2025-01-03

### Added
- Initial release of Spaghetti AI Design System Generator
- K-Means clustering for dominant color extraction from images
- HCT (Hue-Chroma-Tone) color space support via Material Design 3
- 11-step color ramp generation (50-950)
- CSS Variables export
- Tailwind CSS configuration export
- JSON Design Tokens export
- ZIP package export with React components
- Real-time component preview (Buttons, Forms, Cards)
- Landing page with feature showcase
- Editor page with drag-and-drop image upload
- Dark/Light mode preview toggle

### Technical Details
- Built with Next.js 15.1 App Router
- React 19 with TypeScript 5
- Tailwind CSS v4 for styling
- @material/material-color-utilities for HCT calculations
- Vitest for unit testing
- Playwright for E2E testing (planned)

---

[Unreleased]: https://github.com/sihu-dev/spaghetti-app/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/sihu-dev/spaghetti-app/releases/tag/v0.1.0

# Prisma ORM Setup Guide

This document describes the Prisma ORM setup for the SPAGHETTI backend application.

## Overview

Prisma ORM has been configured with SQLite as the database provider. All services have been updated to use Prisma for data persistence instead of in-memory storage.

## Database Models

The following models are defined in `prisma/schema.prisma`:

### Theme
- Stores color palettes extracted from images
- Fields: id, colors (JSON), primary, secondary, accent, background, surface, text, mood, suggestion, createdAt, savedAt

### Template
- Stores UI component templates
- Fields: id, name, category, description, previewImage, componentType, props (JSON), createdAt

### Assembly
- Stores generated component assemblies
- Fields: id, templateId, themeId, customizations (JSON), generatedCode, createdAt
- Relations: Template and Theme (cascade delete)

### User
- For future authentication
- Fields: id, email, password, name, createdAt, updatedAt

## Environment Setup

1. Create a `.env` file in the backend directory:
   ```bash
   cp .env.example .env
   ```

2. Add the DATABASE_URL to your `.env` file:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

## Database Commands

The following npm scripts are available:

- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database (development)
- `npm run db:migrate` - Create and apply migrations (production)

## Initial Setup

To initialize the database for the first time:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

## Updated Services

### Theme Service (`src/services/theme.service.ts`)
Added functions:
- `saveTheme(theme)` - Save theme to database
- `getThemeById(id)` - Get theme by ID
- `getAllThemes()` - Get all themes
- `deleteTheme(id)` - Delete theme

### Template Service (`src/services/template.service.ts`)
Updated to use Prisma:
- `getAllTemplates(category?)` - Get all templates (auto-seeds if empty)
- `getTemplateDetails(id)` - Get template by ID
- `getTemplatesByCategory(category)` - Get templates by category
- `createTemplate(template)` - Create new template
- `deleteTemplate(id)` - Delete template

### Assembly Service (`src/services/assembly.service.ts`)
Updated to use Prisma:
- `createAssembly(request)` - Create new assembly
- `findAssemblyById(id)` - Get assembly by ID
- `getAllAssemblies()` - Get all assemblies

## Prisma Client Singleton

A Prisma client singleton is available at `src/lib/prisma.ts`. Import it in your services:

```typescript
import { prisma } from '../lib/prisma';
```

## Database File Location

The SQLite database file is located at:
- Development: `/prisma/dev.db`
- This file is gitignored and should not be committed

## Backward Compatibility

All existing functionality has been preserved:
- Template service auto-seeds the database with mock data on first use
- Theme service maintains the same API for extracting themes from images
- Assembly service continues to generate React components with the same interface

## Migration Strategy

When making schema changes:

1. Update `prisma/schema.prisma`
2. Run `npm run db:push` for development
3. Run `npm run db:migrate` for production migrations

## Notes

- The database uses JSON fields for storing complex data (colors, props, customizations)
- Foreign keys are set with cascade delete to maintain referential integrity
- Indexes are added on frequently queried fields (category, templateId, themeId)

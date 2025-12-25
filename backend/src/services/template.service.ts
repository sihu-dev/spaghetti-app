import { Template } from '../types';
import { prisma } from '../lib/prisma';

// Mock template data (used for seeding database)
const mockTemplates: Template[] = [
  {
    id: 'hero-1',
    name: 'Hero Section - Centered',
    category: 'hero',
    description: 'Centered hero section with title, subtitle, and CTA button',
    previewImage: '/previews/hero-centered.png',
    componentType: 'HeroSection',
    props: {
      layout: 'centered',
      hasImage: true,
      hasCTA: true
    },
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'navbar-1',
    name: 'Navigation Bar - Horizontal',
    category: 'navigation',
    description: 'Horizontal navigation with logo and menu items',
    previewImage: '/previews/navbar-horizontal.png',
    componentType: 'NavBar',
    props: {
      layout: 'horizontal',
      hasSearch: false,
      position: 'fixed'
    },
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'card-1',
    name: 'Feature Card',
    category: 'card',
    description: 'Card component with icon, title, and description',
    previewImage: '/previews/card-feature.png',
    componentType: 'Card',
    props: {
      hasIcon: true,
      hasButton: false,
      elevation: 'medium'
    },
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'footer-1',
    name: 'Footer - Multi-column',
    category: 'footer',
    description: 'Footer with multiple columns for links and info',
    previewImage: '/previews/footer-multi.png',
    componentType: 'Footer',
    props: {
      columns: 4,
      hasSocial: true,
      hasNewsletter: true
    },
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'form-1',
    name: 'Contact Form',
    category: 'form',
    description: 'Contact form with name, email, and message fields',
    previewImage: '/previews/form-contact.png',
    componentType: 'Form',
    props: {
      fields: ['name', 'email', 'message'],
      hasValidation: true
    },
    createdAt: new Date('2024-01-01')
  },
  // Additional Hero Sections
  {
    id: 'hero-2',
    name: 'Hero Section - Split Layout',
    category: 'hero',
    description: 'Split layout hero with image on left and content on right',
    previewImage: '/previews/hero-split.png',
    componentType: 'HeroSection',
    props: {
      layout: 'split',
      imagePosition: 'left',
      hasImage: true,
      hasCTA: true,
      backgroundColor: 'gradient'
    },
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'hero-3',
    name: 'Hero Section - Video Background',
    category: 'hero',
    description: 'Full-screen hero with video background and overlay',
    previewImage: '/previews/hero-video.png',
    componentType: 'HeroSection',
    props: {
      layout: 'fullscreen',
      hasVideo: true,
      hasOverlay: true,
      overlayOpacity: 0.5,
      hasCTA: true,
      textAlign: 'center'
    },
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'hero-4',
    name: 'Hero Section - Minimal Typography',
    category: 'hero',
    description: 'Minimalist hero section with large typography and subtle animations',
    previewImage: '/previews/hero-minimal.png',
    componentType: 'HeroSection',
    props: {
      layout: 'minimal',
      hasImage: false,
      hasCTA: true,
      typography: 'large',
      hasAnimation: true,
      backgroundColor: 'solid'
    },
    createdAt: new Date('2024-01-15')
  },
  // Additional Navigation
  {
    id: 'navbar-2',
    name: 'Navigation Bar - Sidebar',
    category: 'navigation',
    description: 'Vertical sidebar navigation with collapsible sections',
    previewImage: '/previews/navbar-sidebar.png',
    componentType: 'NavBar',
    props: {
      layout: 'sidebar',
      position: 'fixed',
      collapsible: true,
      hasSearch: true,
      width: '250px'
    },
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'navbar-3',
    name: 'Navigation Bar - Mega Menu',
    category: 'navigation',
    description: 'Horizontal navigation with dropdown mega menu sections',
    previewImage: '/previews/navbar-mega.png',
    componentType: 'NavBar',
    props: {
      layout: 'horizontal',
      hasMegaMenu: true,
      hasSearch: true,
      position: 'sticky',
      dropdownStyle: 'mega'
    },
    createdAt: new Date('2024-01-15')
  },
  // Additional Cards
  {
    id: 'card-2',
    name: 'Pricing Card',
    category: 'card',
    description: 'Pricing card with plan details, features list, and CTA button',
    previewImage: '/previews/card-pricing.png',
    componentType: 'Card',
    props: {
      hasIcon: false,
      hasButton: true,
      hasBadge: true,
      elevation: 'high',
      features: true,
      highlighted: false
    },
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'card-3',
    name: 'Team Member Card',
    category: 'card',
    description: 'Team member card with photo, name, role, and social links',
    previewImage: '/previews/card-team.png',
    componentType: 'Card',
    props: {
      hasImage: true,
      hasIcon: false,
      hasButton: false,
      hasSocialLinks: true,
      elevation: 'medium',
      imageShape: 'circle'
    },
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'card-4',
    name: 'Testimonial Card',
    category: 'card',
    description: 'Testimonial card with quote, author details, and rating',
    previewImage: '/previews/card-testimonial.png',
    componentType: 'Card',
    props: {
      hasIcon: true,
      hasImage: true,
      hasButton: false,
      hasRating: true,
      elevation: 'low',
      quoteStyle: 'modern'
    },
    createdAt: new Date('2024-01-15')
  },
  // Section Templates
  {
    id: 'features-1',
    name: 'Features Section - Grid',
    category: 'section',
    description: '3-column feature grid with icons, titles, and descriptions',
    previewImage: '/previews/section-features.png',
    componentType: 'Section',
    props: {
      layout: 'grid',
      columns: 3,
      hasIcons: true,
      iconStyle: 'outlined',
      alignment: 'center'
    },
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'cta-1',
    name: 'Call-to-Action Banner',
    category: 'section',
    description: 'Full-width CTA banner with headline, description, and action buttons',
    previewImage: '/previews/section-cta.png',
    componentType: 'Section',
    props: {
      layout: 'centered',
      hasBackground: true,
      backgroundStyle: 'gradient',
      buttonCount: 2,
      hasImage: false
    },
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'stats-1',
    name: 'Statistics Section',
    category: 'section',
    description: 'Statistics section with animated counters and labels',
    previewImage: '/previews/section-stats.png',
    componentType: 'Section',
    props: {
      layout: 'grid',
      columns: 4,
      hasAnimation: true,
      animationType: 'counter',
      hasIcons: true
    },
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'gallery-1',
    name: 'Image Gallery Grid',
    category: 'section',
    description: 'Responsive image gallery grid with lightbox functionality',
    previewImage: '/previews/section-gallery.png',
    componentType: 'Section',
    props: {
      layout: 'masonry',
      columns: 3,
      hasLightbox: true,
      imageRatio: 'auto',
      gap: 'medium'
    },
    createdAt: new Date('2024-01-15')
  }
];

/**
 * Get all templates from database (optionally filter by category)
 */
export const getAllTemplates = async (category?: string): Promise<Template[]> => {
  // Check if database has templates, if not seed it
  const count = await prisma.template.count();
  if (count === 0) {
    await seedTemplates();
  }

  const dbTemplates = await prisma.template.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: 'asc' }
  });

  return dbTemplates.map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    description: t.description,
    previewImage: t.previewImage,
    componentType: t.componentType,
    props: JSON.parse(t.props),
    createdAt: t.createdAt
  }));
};

/**
 * Get template details by ID
 */
export const getTemplateDetails = async (id: string): Promise<Template | null> => {
  const template = await prisma.template.findUnique({
    where: { id }
  });

  if (!template) return null;

  return {
    id: template.id,
    name: template.name,
    category: template.category,
    description: template.description,
    previewImage: template.previewImage,
    componentType: template.componentType,
    props: JSON.parse(template.props),
    createdAt: template.createdAt
  };
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = async (category: string): Promise<Template[]> => {
  const dbTemplates = await prisma.template.findMany({
    where: { category },
    orderBy: { createdAt: 'asc' }
  });

  return dbTemplates.map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    description: t.description,
    previewImage: t.previewImage,
    componentType: t.componentType,
    props: JSON.parse(t.props),
    createdAt: t.createdAt
  }));
};

/**
 * Seed database with mock templates
 */
async function seedTemplates(): Promise<void> {
  // Seed templates one by one to handle potential duplicates
  for (const t of mockTemplates) {
    try {
      await prisma.template.create({
        data: {
          id: t.id,
          name: t.name,
          category: t.category,
          description: t.description,
          previewImage: t.previewImage,
          componentType: t.componentType,
          props: JSON.stringify(t.props),
          createdAt: t.createdAt
        }
      });
    } catch (error) {
      // Skip if template already exists
      continue;
    }
  }
}

/**
 * Create a new template
 */
export const createTemplate = async (template: Omit<Template, 'createdAt'>): Promise<Template> => {
  const created = await prisma.template.create({
    data: {
      id: template.id,
      name: template.name,
      category: template.category,
      description: template.description,
      previewImage: template.previewImage,
      componentType: template.componentType,
      props: JSON.stringify(template.props)
    }
  });

  return {
    id: created.id,
    name: created.name,
    category: created.category,
    description: created.description,
    previewImage: created.previewImage,
    componentType: created.componentType,
    props: JSON.parse(created.props),
    createdAt: created.createdAt
  };
};

/**
 * Delete a template
 */
export const deleteTemplate = async (id: string): Promise<boolean> => {
  try {
    await prisma.template.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    return false;
  }
};

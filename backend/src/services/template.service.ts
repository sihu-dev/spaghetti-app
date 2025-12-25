import { Template } from '../types';

// Mock template data (replace with database in production)
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
  }
];

export const getAllTemplates = (category?: string): Template[] => {
  if (category) {
    return mockTemplates.filter(t => t.category === category);
  }
  return mockTemplates;
};

export const getTemplateDetails = (id: string): Template | null => {
  return mockTemplates.find(t => t.id === id) || null;
};

export const getTemplatesByCategory = (category: string): Template[] => {
  return mockTemplates.filter(t => t.category === category);
};

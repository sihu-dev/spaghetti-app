import { Assembly, AssemblyGenerationRequest, AssemblyCustomizations, Template } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getTemplateDetails } from './template.service';

// In-memory storage (replace with database in production)
const assemblies = new Map<string, Assembly>();

interface ComponentCodeOptions {
  template: Template;
  themeId: string;
  customizations?: AssemblyCustomizations;
}

/**
 * 템플릿 타입에 따른 React 컴포넌트 코드 생성
 */
const generateReactCode = (options: ComponentCodeOptions): string => {
  const { template, themeId, customizations } = options;
  const { componentType, props } = template;

  const styles = {
    backgroundColor: customizations?.backgroundColor || 'var(--background)',
    padding: customizations?.padding || '24px',
    borderRadius: customizations?.borderRadius || '12px',
    fontSize: customizations?.fontSize || '16px',
    fontFamily: customizations?.fontFamily || "'Inter', sans-serif"
  };

  const componentTemplates: Record<string, string> = {
    HeroSection: `
import React from 'react';
import './styles.css';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = 'Welcome to Our Platform',
  subtitle = 'Build amazing experiences with AI-powered themes',
  ctaText = 'Get Started',
  ctaLink = '#'
}) => {
  return (
    <section
      className="hero-section"
      style={{
        backgroundColor: '${styles.backgroundColor}',
        padding: '${styles.padding}',
        borderRadius: '${styles.borderRadius}',
        fontFamily: ${styles.fontFamily}
      }}
    >
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
        ${props.hasCTA ? `<a href={ctaLink} className="hero-cta">{ctaText}</a>` : ''}
      </div>
    </section>
  );
};

export default HeroSection;
// Theme ID: ${themeId}
`.trim(),

    NavBar: `
import React, { useState } from 'react';
import './styles.css';

interface NavItem {
  label: string;
  href: string;
}

interface NavBarProps {
  logo?: string;
  items?: NavItem[];
}

const NavBar: React.FC<NavBarProps> = ({
  logo = '🍝 Spaghetti',
  items = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' }
  ]
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="navbar"
      style={{
        backgroundColor: '${styles.backgroundColor}',
        padding: '${styles.padding}',
        fontFamily: ${styles.fontFamily}
      }}
    >
      <div className="nav-brand">{logo}</div>
      <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>☰</button>
      <ul className={\`nav-menu \${isOpen ? 'open' : ''}\`}>
        {items.map((item, index) => (
          <li key={index} className="nav-item">
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;
// Theme ID: ${themeId}
`.trim(),

    Card: `
import React from 'react';
import './styles.css';

interface CardProps {
  icon?: string;
  title?: string;
  description?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  icon = '✨',
  title = 'Feature Title',
  description = 'Description of this amazing feature that helps users.',
  onClick
}) => {
  return (
    <div
      className="feature-card"
      style={{
        backgroundColor: '${styles.backgroundColor}',
        padding: '${styles.padding}',
        borderRadius: '${styles.borderRadius}',
        fontFamily: ${styles.fontFamily}
      }}
      onClick={onClick}
    >
      ${props.hasIcon ? `<span className="card-icon">{icon}</span>` : ''}
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
      ${props.hasButton ? `<button className="card-button">Learn More</button>` : ''}
    </div>
  );
};

export default Card;
// Theme ID: ${themeId}
`.trim(),

    Footer: `
import React from 'react';
import './styles.css';

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

interface FooterProps {
  columns?: FooterColumn[];
  copyright?: string;
}

const Footer: React.FC<FooterProps> = ({
  columns = [
    { title: 'Product', links: [{ label: 'Features', href: '#' }, { label: 'Pricing', href: '#' }] },
    { title: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Careers', href: '#' }] },
    { title: 'Resources', links: [{ label: 'Blog', href: '#' }, { label: 'Docs', href: '#' }] },
    { title: 'Legal', links: [{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }] }
  ],
  copyright = '© 2024 AI Spaghetti. All rights reserved.'
}) => {
  return (
    <footer
      className="footer"
      style={{
        backgroundColor: '${styles.backgroundColor}',
        padding: '${styles.padding}',
        fontFamily: ${styles.fontFamily}
      }}
    >
      <div className="footer-columns">
        {columns.map((col, index) => (
          <div key={index} className="footer-column">
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link, linkIndex) => (
                <li key={linkIndex}><a href={link.href}>{link.label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      ${props.hasSocial ? `
      <div className="footer-social">
        <a href="#">Twitter</a>
        <a href="#">GitHub</a>
        <a href="#">LinkedIn</a>
      </div>` : ''}
      <p className="footer-copyright">{copyright}</p>
    </footer>
  );
};

export default Footer;
// Theme ID: ${themeId}
`.trim(),

    Form: `
import React, { useState, FormEvent } from 'react';
import './styles.css';

interface FormProps {
  onSubmit?: (data: Record<string, string>) => void;
}

const ContactForm: React.FC<FormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.message) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate() && onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <form
      className="contact-form"
      style={{
        backgroundColor: '${styles.backgroundColor}',
        padding: '${styles.padding}',
        borderRadius: '${styles.borderRadius}',
        fontFamily: ${styles.fontFamily}
      }}
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
        {errors.message && <span className="error">{errors.message}</span>}
      </div>
      <button type="submit" className="submit-btn">Send Message</button>
    </form>
  );
};

export default ContactForm;
// Theme ID: ${themeId}
`.trim()
  };

  return componentTemplates[componentType] || componentTemplates.Card;
};

export const createAssembly = async (
  request: AssemblyGenerationRequest
): Promise<Assembly> => {
  const { templateId, themeId, customizations } = request;

  // Validate template exists
  const template = await getTemplateDetails(templateId);
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  const generatedCode = generateReactCode({ template, themeId, customizations });

  const assembly: Assembly = {
    id: uuidv4(),
    templateId,
    themeId,
    customizations,
    generatedCode,
    createdAt: new Date()
  };

  assemblies.set(assembly.id, assembly);

  return assembly;
};

export const findAssemblyById = async (id: string): Promise<Assembly | null> => {
  return assemblies.get(id) || null;
};

export const getAllAssemblies = async (): Promise<Assembly[]> => {
  return Array.from(assemblies.values());
};

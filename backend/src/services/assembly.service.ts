import { Assembly, AssemblyGenerationRequest, Theme } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getTemplateDetails } from './template.service';

// In-memory storage (replace with database in production)
const assemblies = new Map<string, Assembly>();

// Mock theme storage (in production, fetch from database)
const mockThemes = new Map<string, Theme>();

// Helper to get theme by ID
const getThemeById = (themeId: string): Theme => {
  // Default theme if not found
  const defaultTheme: Theme = {
    colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'],
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#EC4899',
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#1F2937'
  };

  return mockThemes.get(themeId) || defaultTheme;
};

// Component-specific generators
interface GeneratorOptions {
  theme: Theme;
  customizations?: Record<string, any>;
  templateProps?: Record<string, any>;
}

const generateHeroSection = (options: GeneratorOptions): string => {
  const { theme, customizations, templateProps } = options;
  const layout = templateProps?.layout || 'centered';
  const hasCTA = templateProps?.hasCTA !== false;

  const padding = customizations?.padding || '80px 24px';
  const borderRadius = customizations?.borderRadius || '0px';

  return `import React from 'react';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = "Welcome to Our Platform",
  subtitle = "Build amazing experiences with our powerful tools",
  ctaText = "Get Started",
  ctaLink = "#",
  backgroundImage
}) => {
  const containerStyle: React.CSSProperties = {
    backgroundColor: '${theme.background}',
    backgroundImage: backgroundImage ? \`linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(\${backgroundImage})\` : \`linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)\`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '${padding}',
    borderRadius: '${borderRadius}',
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: '${layout === 'centered' ? 'center' : 'flex-start'}',
    justifyContent: 'center',
    textAlign: '${layout === 'centered' ? 'center' : 'left'}',
    color: '${theme.text === '#1F2937' ? '#FFFFFF' : theme.text}'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    lineHeight: '1.2',
    maxWidth: '800px'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    marginBottom: '2rem',
    opacity: 0.9,
    maxWidth: '600px'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '${theme.accent}',
    color: '#FFFFFF',
    padding: '16px 32px',
    fontSize: '1.125rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>{title}</h1>
      <p style={subtitleStyle}>{subtitle}</p>${hasCTA ? `
      <a
        href={ctaLink}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }}
      >
        {ctaText}
      </a>` : ''}
    </div>
  );
};

export default HeroSection;`;
};

const generateNavBar = (options: GeneratorOptions): string => {
  const { theme, customizations, templateProps } = options;
  const position = templateProps?.position || 'fixed';

  const padding = customizations?.padding || '16px 24px';
  const borderRadius = customizations?.borderRadius || '0px';

  return `import React, { useState } from 'react';

interface MenuItem {
  label: string;
  href: string;
}

interface NavBarProps {
  logo?: string;
  brandName?: string;
  menuItems?: MenuItem[];
}

const NavBar: React.FC<NavBarProps> = ({
  logo,
  brandName = "Brand",
  menuItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' }
  ]
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navStyle: React.CSSProperties = {
    position: '${position}' as any,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '${theme.surface}',
    borderBottom: \`1px solid \${adjustOpacity('${theme.text}', 0.1)}\`,
    padding: '${padding}',
    borderRadius: '${borderRadius}',
    zIndex: 1000,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const logoStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '${theme.primary}',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const menuStyle: React.CSSProperties = {
    display: 'flex',
    gap: '24px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    alignItems: 'center'
  };

  const menuItemStyle: React.CSSProperties = {
    color: '${theme.text}',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'color 0.2s',
    cursor: 'pointer'
  };

  const mobileMenuButtonStyle: React.CSSProperties = {
    display: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    color: '${theme.text}',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '8px'
  };

  const adjustOpacity = (color: string, opacity: number): string => {
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
  };

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <a href="/" style={logoStyle}>
          {logo && <img src={logo} alt={brandName} style={{ height: '32px' }} />}
          <span>{brandName}</span>
        </a>

        <button
          style={mobileMenuButtonStyle}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <ul style={menuStyle}>
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.href}
                style={menuItemStyle}
                onMouseEnter={(e) => e.currentTarget.style.color = '${theme.primary}'}
                onMouseLeave={(e) => e.currentTarget.style.color = '${theme.text}'}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;`;
};

const generateCard = (options: GeneratorOptions): string => {
  const { theme, customizations, templateProps } = options;
  const hasIcon = templateProps?.hasIcon !== false;
  const hasButton = templateProps?.hasButton || false;
  const elevation = templateProps?.elevation || 'medium';

  const padding = customizations?.padding || '24px';
  const borderRadius = customizations?.borderRadius || '12px';

  const shadowMap = {
    low: '0 1px 3px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
    high: '0 10px 15px rgba(0, 0, 0, 0.1)'
  };

  return `import React from 'react';

interface CardProps {
  icon?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

const Card: React.FC<CardProps> = ({
  icon = "⭐",
  title = "Feature Title",
  description = "This is a feature card with icon, title, and description. Customize it to match your needs.",
  buttonText = "Learn More",
  buttonLink = "#"
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: '${theme.surface}',
    padding: '${padding}',
    borderRadius: '${borderRadius}',
    boxShadow: '${shadowMap[elevation as keyof typeof shadowMap]}',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: \`1px solid \${adjustOpacity('${theme.text}', 0.1)}\`,
    maxWidth: '400px'
  };

  const iconContainerStyle: React.CSSProperties = {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '${theme.primary}',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    marginBottom: '16px',
    color: '#FFFFFF'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '${theme.text}',
    marginBottom: '12px',
    marginTop: 0
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '1rem',
    color: \`\${adjustOpacity('${theme.text}', 0.7)}\`,
    lineHeight: '1.6',
    marginBottom: '${hasButton ? '20px' : '0'}'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '${theme.accent}',
    color: '#FFFFFF',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'background-color 0.2s'
  };

  const adjustOpacity = (color: string, opacity: number): string => {
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 20px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '${shadowMap[elevation as keyof typeof shadowMap]}';
      }}
    >${hasIcon ? `
      <div style={iconContainerStyle}>
        {icon}
      </div>` : ''}
      <h3 style={titleStyle}>{title}</h3>
      <p style={descriptionStyle}>{description}</p>${hasButton ? `
      <a
        href={buttonLink}
        style={buttonStyle}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '${adjustColor(theme.accent || '#EC4899', -20)}'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '${theme.accent}'}
      >
        {buttonText}
      </a>` : ''}
    </div>
  );
};

export default Card;`;
};

const generateFooter = (options: GeneratorOptions): string => {
  const { theme, customizations, templateProps } = options;
  const columns = templateProps?.columns || 4;
  const hasSocial = templateProps?.hasSocial !== false;
  const hasNewsletter = templateProps?.hasNewsletter !== false;

  const padding = customizations?.padding || '64px 24px 24px';
  const borderRadius = customizations?.borderRadius || '0px';

  return `import React, { useState } from 'react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  brandName?: string;
  columns?: FooterColumn[];
  socialLinks?: { platform: string; url: string; icon: string }[];
}

const Footer: React.FC<FooterProps> = ({
  brandName = "Brand",
  columns = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Documentation", href: "/docs" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" }
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Community", href: "/community" },
        { label: "Support", href: "/support" },
        { label: "Status", href: "/status" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" }
      ]
    }
  ],
  socialLinks = [
    { platform: "Twitter", url: "#", icon: "𝕏" },
    { platform: "GitHub", url: "#", icon: "⚙" },
    { platform: "LinkedIn", url: "#", icon: "in" }
  ]
}) => {
  const [email, setEmail] = useState('');

  const footerStyle: React.CSSProperties = {
    backgroundColor: '${theme.surface}',
    borderTop: \`2px solid \${adjustOpacity('${theme.primary}', 0.2)}\`,
    padding: '${padding}',
    borderRadius: '${borderRadius}'
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '32px',
    marginBottom: '48px'
  };

  const columnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const columnTitleStyle: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '${theme.text}',
    marginBottom: '8px'
  };

  const linkStyle: React.CSSProperties = {
    color: \`\${adjustOpacity('${theme.text}', 0.7)}\`,
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.2s'
  };${hasNewsletter ? `

  const newsletterStyle: React.CSSProperties = {
    marginBottom: '48px',
    padding: '32px',
    backgroundColor: \`\${adjustOpacity('${theme.primary}', 0.1)}\`,
    borderRadius: '12px'
  };

  const inputStyle: React.CSSProperties = {
    padding: '12px',
    border: \`1px solid \${adjustOpacity('${theme.text}', 0.2)}\`,
    borderRadius: '8px',
    fontSize: '1rem',
    flex: 1,
    outline: 'none'
  };

  const subscribeButtonStyle: React.CSSProperties = {
    backgroundColor: '${theme.primary}',
    color: '#FFFFFF',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };` : ''}${hasSocial ? `

  const socialContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    marginTop: '24px'
  };

  const socialLinkStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '${theme.primary}',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    fontSize: '1.25rem',
    transition: 'transform 0.2s, background-color 0.2s'
  };` : ''}

  const bottomStyle: React.CSSProperties = {
    borderTop: \`1px solid \${adjustOpacity('${theme.text}', 0.1)}\`,
    paddingTop: '24px',
    marginTop: '24px',
    textAlign: 'center',
    color: \`\${adjustOpacity('${theme.text}', 0.6)}\`,
    fontSize: '0.9rem'
  };

  const adjustOpacity = (color: string, opacity: number): string => {
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>${hasNewsletter ? `
        <div style={newsletterStyle}>
          <h3 style={{ color: '${theme.text}', marginTop: 0 }}>Subscribe to our newsletter</h3>
          <p style={{ color: \`\${adjustOpacity('${theme.text}', 0.7)}\`, marginBottom: '16px' }}>
            Get the latest updates and news delivered to your inbox.
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
            <button
              type="submit"
              style={subscribeButtonStyle}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '${adjustColor(theme.primary || '#3B82F6', -20)}'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '${theme.primary}'}
            >
              Subscribe
            </button>
          </form>
        </div>` : ''}

        <div style={gridStyle}>
          {columns.slice(0, ${columns}).map((column, index) => (
            <div key={index} style={columnStyle}>
              <h4 style={columnTitleStyle}>{column.title}</h4>
              {column.links.map((link, linkIndex) => (
                <a
                  key={linkIndex}
                  href={link.href}
                  style={linkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.color = '${theme.primary}'}
                  onMouseLeave={(e) => e.currentTarget.style.color = adjustOpacity('${theme.text}', 0.7)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>${hasSocial ? `

        <div style={socialContainerStyle}>
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.url}
              style={socialLinkStyle}
              aria-label={social.platform}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.backgroundColor = '${theme.accent}';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.backgroundColor = '${theme.primary}';
              }}
            >
              {social.icon}
            </a>
          ))}
        </div>` : ''}

        <div style={bottomStyle}>
          <p>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;`;
};

const generateForm = (options: GeneratorOptions): string => {
  const { theme, customizations, templateProps } = options;
  const fields = templateProps?.fields || ['name', 'email', 'message'];
  const hasValidation = templateProps?.hasValidation !== false;

  const padding = customizations?.padding || '32px';
  const borderRadius = customizations?.borderRadius || '12px';

  return `import React, { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  message: string;
  [key: string]: string;
}

interface FormErrors {
  [key: string]: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const formStyle: React.CSSProperties = {
    backgroundColor: '${theme.surface}',
    padding: '${padding}',
    borderRadius: '${borderRadius}',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    margin: '0 auto'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '${theme.text}',
    marginBottom: '8px',
    marginTop: 0
  };

  const subtitleStyle: React.CSSProperties = {
    color: \`\${adjustOpacity('${theme.text}', 0.7)}\`,
    marginBottom: '32px'
  };

  const fieldGroupStyle: React.CSSProperties = {
    marginBottom: '24px'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    color: '${theme.text}',
    fontWeight: '600',
    fontSize: '0.95rem'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    border: \`2px solid \${adjustOpacity('${theme.text}', 0.2)}\`,
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: 'inherit'
  };

  const errorStyle: React.CSSProperties = {
    color: '#EF4444',
    fontSize: '0.875rem',
    marginTop: '4px'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '${theme.primary}',
    color: '#FFFFFF',
    padding: '14px 32px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1.125rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.2s',
    opacity: isSubmitting ? 0.7 : 1
  };

  const successStyle: React.CSSProperties = {
    backgroundColor: \`\${adjustOpacity('${theme.accent}', 0.1)}\`,
    border: \`2px solid ${theme.accent}\`,
    color: '${theme.text}',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    textAlign: 'center'
  };

  const adjustOpacity = (color: string, opacity: number): string => {
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};${hasValidation ? `

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }` : ''}

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Form submitted:', formData);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', message: '' });

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form style={formStyle} onSubmit={handleSubmit}>
      <h2 style={titleStyle}>Contact Us</h2>
      <p style={subtitleStyle}>
        Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
      </p>

      {submitSuccess && (
        <div style={successStyle}>
          <strong>Success!</strong> Your message has been sent. We'll get back to you soon.
        </div>
      )}${fields.includes('name') ? `

      <div style={fieldGroupStyle}>
        <label htmlFor="name" style={labelStyle}>Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          style={{
            ...inputStyle,
            borderColor: errors.name ? '#EF4444' : adjustOpacity('${theme.text}', 0.2)
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '${theme.primary}'}
          onBlur={(e) => !errors.name && (e.currentTarget.style.borderColor = adjustOpacity('${theme.text}', 0.2))}
        />
        {errors.name && <div style={errorStyle}>{errors.name}</div>}
      </div>` : ''}${fields.includes('email') ? `

      <div style={fieldGroupStyle}>
        <label htmlFor="email" style={labelStyle}>Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          style={{
            ...inputStyle,
            borderColor: errors.email ? '#EF4444' : adjustOpacity('${theme.text}', 0.2)
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '${theme.primary}'}
          onBlur={(e) => !errors.email && (e.currentTarget.style.borderColor = adjustOpacity('${theme.text}', 0.2))}
        />
        {errors.email && <div style={errorStyle}>{errors.email}</div>}
      </div>` : ''}${fields.includes('message') ? `

      <div style={fieldGroupStyle}>
        <label htmlFor="message" style={labelStyle}>Message *</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          style={{
            ...textareaStyle,
            borderColor: errors.message ? '#EF4444' : adjustOpacity('${theme.text}', 0.2)
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '${theme.primary}'}
          onBlur={(e) => !errors.message && (e.currentTarget.style.borderColor = adjustOpacity('${theme.text}', 0.2))}
        />
        {errors.message && <div style={errorStyle}>{errors.message}</div>}
      </div>` : ''}

      <button
        type="submit"
        style={buttonStyle}
        disabled={isSubmitting}
        onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '${adjustColor(theme.primary || '#3B82F6', -20)}')}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '${theme.primary}'}
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};

export default ContactForm;`;
};

// Helper function to adjust color brightness
const adjustColor = (color: string, amount: number): string => {
  const clamp = (num: number) => Math.min(Math.max(num, 0), 255);
  const hex = color.replace('#', '');
  const r = clamp(parseInt(hex.substring(0, 2), 16) + amount);
  const g = clamp(parseInt(hex.substring(2, 4), 16) + amount);
  const b = clamp(parseInt(hex.substring(4, 6), 16) + amount);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
};

// Main code generation function
const generateReactCode = (templateId: string, themeId: string, customizations?: Record<string, any>): string => {
  const theme = getThemeById(themeId);

  // Get template to determine component type
  let componentType = 'HeroSection'; // default
  let templateProps: Record<string, any> = {};

  // Map template IDs to component types and props
  const templateMap: Record<string, { type: string; props: Record<string, any> }> = {
    'hero-1': { type: 'HeroSection', props: { layout: 'centered', hasImage: true, hasCTA: true } },
    'navbar-1': { type: 'NavBar', props: { layout: 'horizontal', hasSearch: false, position: 'fixed' } },
    'card-1': { type: 'Card', props: { hasIcon: true, hasButton: false, elevation: 'medium' } },
    'footer-1': { type: 'Footer', props: { columns: 4, hasSocial: true, hasNewsletter: true } },
    'form-1': { type: 'Form', props: { fields: ['name', 'email', 'message'], hasValidation: true } }
  };

  if (templateMap[templateId]) {
    componentType = templateMap[templateId].type;
    templateProps = templateMap[templateId].props;
  }

  const options: GeneratorOptions = {
    theme,
    customizations,
    templateProps
  };

  // Generate code based on component type
  switch (componentType) {
    case 'HeroSection':
      return generateHeroSection(options);
    case 'NavBar':
      return generateNavBar(options);
    case 'Card':
      return generateCard(options);
    case 'Footer':
      return generateFooter(options);
    case 'Form':
      return generateForm(options);
    default:
      return generateHeroSection(options);
  }
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

  const generatedCode = generateReactCode(templateId, themeId, customizations);

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

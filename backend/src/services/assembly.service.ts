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
  const variant = templateProps?.variant || 'hero-1';
  const hasCTA = templateProps?.hasCTA !== false;

  const padding = customizations?.padding || '80px 24px';
  const borderRadius = customizations?.borderRadius || '0px';

  // hero-1: Centered layout (existing)
  if (variant === 'hero-1') {
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
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
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
  }

  // hero-2: Split layout (image left, content right)
  if (variant === 'hero-2') {
    return `import React from 'react';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  image?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = "Transform Your Business",
  subtitle = "Powerful tools and solutions to help you grow and succeed in the digital age",
  ctaText = "Get Started",
  ctaLink = "#",
  image = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
}) => {
  const containerStyle: React.CSSProperties = {
    backgroundColor: '${theme.background}',
    padding: '${padding}',
    borderRadius: '${borderRadius}',
    minHeight: '600px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '48px',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto'
  };

  const contentStyle: React.CSSProperties = {
    padding: '0 24px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    lineHeight: '1.2',
    color: '${theme.text}'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    marginBottom: '2rem',
    color: \`\${adjustOpacity('${theme.text}', 0.8)}\`,
    lineHeight: '1.6'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '${theme.primary}',
    color: '#FFFFFF',
    padding: '18px 36px',
    fontSize: '1.125rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'background-color 0.2s, transform 0.2s',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  const imageContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '600px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  const adjustOpacity = (color: string, opacity: number): string => {
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
  };

  return (
    <div style={containerStyle}>
      <div style={imageContainerStyle}>
        <img src={image} alt="Hero" style={imageStyle} />
      </div>
      <div style={contentStyle}>
        <h1 style={titleStyle}>{title}</h1>
        <p style={subtitleStyle}>{subtitle}</p>${hasCTA ? `
        <a
          href={ctaLink}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '${adjustColor(theme.primary || '#3B82F6', -20)}';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '${theme.primary}';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {ctaText}
        </a>` : ''}
      </div>
    </div>
  );
};

export default HeroSection;`;
  }

  // hero-3: Video background with overlay
  if (variant === 'hero-3') {
    return `import React, { useRef, useEffect } from 'react';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  videoUrl?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = "Experience Innovation",
  subtitle = "Discover the future of technology with immersive experiences",
  ctaText = "Watch Demo",
  ctaLink = "#",
  videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.log('Video autoplay failed:', err));
    }
  }, []);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: '700px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '${borderRadius}'
  };

  const videoStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    minWidth: '100%',
    minHeight: '100%',
    width: 'auto',
    height: 'auto',
    transform: 'translate(-50%, -50%)',
    zIndex: 0,
    objectFit: 'cover'
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    color: '#FFFFFF',
    padding: '${padding}',
    maxWidth: '900px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '4rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    lineHeight: '1.1',
    textShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    marginBottom: '2.5rem',
    opacity: 0.95,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '${theme.accent}',
    color: '#FFFFFF',
    padding: '20px 40px',
    fontSize: '1.25rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'transform 0.3s, box-shadow 0.3s',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
  };

  return (
    <div style={containerStyle}>
      <video
        ref={videoRef}
        style={videoStyle}
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      <div style={overlayStyle}></div>
      <div style={contentStyle}>
        <h1 style={titleStyle}>{title}</h1>
        <p style={subtitleStyle}>{subtitle}</p>${hasCTA ? `
        <a
          href={ctaLink}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
          }}
        >
          {ctaText}
        </a>` : ''}
      </div>
    </div>
  );
};

export default HeroSection;`;
  }

  // hero-4: Minimal typography with animations
  if (variant === 'hero-4') {
    return `import React, { useState, useEffect } from 'react';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = "Less is More",
  subtitle = "Elegant simplicity meets powerful functionality",
  ctaText = "Explore",
  ctaLink = "#"
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const containerStyle: React.CSSProperties = {
    backgroundColor: '${theme.background}',
    padding: '${padding}',
    borderRadius: '${borderRadius}',
    minHeight: '700px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden'
  };

  const decorativeLineStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: '1px',
    backgroundColor: '${theme.primary}',
    opacity: 0.2,
    transform: 'translateY(-50%)'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '5rem',
    fontWeight: '300',
    marginBottom: '1rem',
    lineHeight: '1.1',
    color: '${theme.text}',
    letterSpacing: '-0.02em',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transition: 'opacity 1s ease-out, transform 1s ease-out',
    maxWidth: '1000px',
    position: 'relative',
    zIndex: 1
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: '300',
    marginBottom: '3rem',
    color: \`\${adjustOpacity('${theme.text}', 0.6)}\`,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transition: 'opacity 1s ease-out 0.3s, transform 1s ease-out 0.3s',
    position: 'relative',
    zIndex: 1
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: '${theme.primary}',
    padding: '16px 48px',
    fontSize: '1rem',
    fontWeight: '400',
    border: \`2px solid ${theme.primary}\`,
    borderRadius: '0',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transitionDelay: '0.6s',
    position: 'relative',
    zIndex: 1
  };

  const adjustOpacity = (color: string, opacity: number): string => {
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
  };

  return (
    <div style={containerStyle}>
      <div style={decorativeLineStyle}></div>
      <h1 style={titleStyle}>{title}</h1>
      <p style={subtitleStyle}>{subtitle}</p>${hasCTA ? `
      <a
        href={ctaLink}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '${theme.primary}';
          e.currentTarget.style.color = '#FFFFFF';
          e.currentTarget.style.transform = 'translateX(10px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '${theme.primary}';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        {ctaText}
      </a>` : ''}
    </div>
  );
};

export default HeroSection;`;
  }

  // Default to hero-1
  return generateHeroSection({ ...options, templateProps: { ...templateProps, variant: 'hero-1' } });
};

const generateNavBar = (options: GeneratorOptions): string => {
  const { theme, customizations, templateProps } = options;
  const variant = templateProps?.variant || 'navbar-1';
  const position = templateProps?.position || 'fixed';

  const padding = customizations?.padding || '16px 24px';
  const borderRadius = customizations?.borderRadius || '0px';

  // navbar-1: Horizontal navigation (existing)
  if (variant === 'navbar-1') {
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
  }

  // navbar-2: Sidebar navigation (vertical, collapsible)
  if (variant === 'navbar-2') {
    return `import React, { useState } from 'react';

interface MenuItem {
  label: string;
  href: string;
  icon?: string;
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
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'Projects', href: '/projects', icon: '📁' },
    { label: 'Team', href: '/team', icon: '👥' },
    { label: 'Analytics', href: '/analytics', icon: '📈' },
    { label: 'Settings', href: '/settings', icon: '⚙️' }
  ]
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: isCollapsed ? '80px' : '260px',
    backgroundColor: '${theme.surface}',
    borderRight: \`1px solid \${adjustOpacity('${theme.text}', 0.1)}\`,
    padding: '24px 16px',
    borderRadius: '${borderRadius}',
    zIndex: 1000,
    transition: 'width 0.3s ease',
    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: \`1px solid \${adjustOpacity('${theme.text}', 0.1)}\`
  };

  const logoStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '${theme.primary}',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  };

  const toggleButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: 'none',
    color: '${theme.text}',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '4px',
    transition: 'transform 0.3s ease',
    transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)'
  };

  const menuStyle: React.CSSProperties = {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: '${theme.text}',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s, color 0.2s',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    minWidth: '24px',
    textAlign: 'center'
  };

  const adjustOpacity = (color: string, opacity: number): string => {
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
  };

  return (
    <nav style={sidebarStyle}>
      <div style={headerStyle}>
        <a href="/" style={logoStyle}>
          {logo && <img src={logo} alt={brandName} style={{ height: '28px' }} />}
          {!isCollapsed && <span>{brandName}</span>}
        </a>
        <button
          style={toggleButtonStyle}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Toggle sidebar"
        >
          ◄
        </button>
      </div>

      <ul style={menuStyle}>
        {menuItems.map((item, index) => (
          <li key={index}>
            <a
              href={item.href}
              style={menuItemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = adjustOpacity('${theme.primary}', 0.1);
                e.currentTarget.style.color = '${theme.primary}';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '${theme.text}';
              }}
            >
              <span style={iconStyle}>{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;`;
  }

  // navbar-3: Mega menu navigation
  if (variant === 'navbar-3') {
    return `import React, { useState } from 'react';

interface SubMenuItem {
  label: string;
  href: string;
  description?: string;
}

interface MenuItem {
  label: string;
  href?: string;
  subItems?: SubMenuItem[];
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
    {
      label: 'Products',
      subItems: [
        { label: 'Analytics', href: '/products/analytics', description: 'Advanced data insights' },
        { label: 'Marketing', href: '/products/marketing', description: 'Growth automation' },
        { label: 'Commerce', href: '/products/commerce', description: 'E-commerce solutions' },
        { label: 'Security', href: '/products/security', description: 'Enterprise protection' }
      ]
    },
    {
      label: 'Solutions',
      subItems: [
        { label: 'For Startups', href: '/solutions/startups', description: 'Scale your startup' },
        { label: 'For Enterprise', href: '/solutions/enterprise', description: 'Enterprise-grade tools' },
        { label: 'For Developers', href: '/solutions/developers', description: 'Build with APIs' }
      ]
    },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '/docs' }
  ]
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

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
    maxWidth: '1400px',
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
    gap: '32px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    alignItems: 'center'
  };

  const menuItemContainerStyle: React.CSSProperties = {
    position: 'relative'
  };

  const menuItemStyle: React.CSSProperties = {
    color: '${theme.text}',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'color 0.2s',
    cursor: 'pointer',
    padding: '8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const megaMenuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '16px',
    backgroundColor: '${theme.surface}',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    padding: '32px',
    minWidth: '600px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    border: \`1px solid \${adjustOpacity('${theme.text}', 0.1)}\`,
    zIndex: 1001
  };

  const subItemStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'block',
    transition: 'background-color 0.2s'
  };

  const subItemTitleStyle: React.CSSProperties = {
    color: '${theme.text}',
    fontWeight: '600',
    fontSize: '1rem',
    marginBottom: '4px'
  };

  const subItemDescStyle: React.CSSProperties = {
    color: \`\${adjustOpacity('${theme.text}', 0.6)}\`,
    fontSize: '0.875rem'
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

        <ul style={menuStyle}>
          {menuItems.map((item, index) => (
            <li
              key={index}
              style={menuItemContainerStyle}
              onMouseEnter={() => item.subItems && setActiveMenu(item.label)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              {item.subItems ? (
                <>
                  <span
                    style={menuItemStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '${theme.primary}')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '${theme.text}')}
                  >
                    {item.label}
                    <span style={{ fontSize: '0.75rem' }}>▼</span>
                  </span>
                  {activeMenu === item.label && (
                    <div style={megaMenuStyle}>
                      {item.subItems.map((subItem, subIndex) => (
                        <a
                          key={subIndex}
                          href={subItem.href}
                          style={subItemStyle}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = adjustOpacity('${theme.primary}', 0.05);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={subItemTitleStyle}>{subItem.label}</div>
                          {subItem.description && (
                            <div style={subItemDescStyle}>{subItem.description}</div>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <a
                  href={item.href}
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '${theme.primary}')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '${theme.text}')}
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;`;
  }

  // Default to navbar-1
  return generateNavBar({ ...options, templateProps: { ...templateProps, variant: 'navbar-1' } });
};

const generateCard = (options: GeneratorOptions): string => {
  const { theme, customizations, templateProps } = options;
  const variant = templateProps?.variant || 'card-1';
  const elevation = templateProps?.elevation || 'medium';

  const padding = customizations?.padding || '24px';
  const borderRadius = customizations?.borderRadius || '12px';

  const shadowMap = {
    low: '0 1px 3px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
    high: '0 10px 15px rgba(0, 0, 0, 0.1)'
  };

  // card-1: Feature card (existing)
  if (variant === 'card-1') {
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
    marginBottom: '20px'
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
    >
      <div style={iconContainerStyle}>
        {icon}
      </div>
      <h3 style={titleStyle}>{title}</h3>
      <p style={descriptionStyle}>{description}</p>
      <a
        href={buttonLink}
        style={buttonStyle}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '${adjustColor(theme.accent || '#EC4899', -20)}'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '${theme.accent}'}
      >
        {buttonText}
      </a>
    </div>
  );
};

export default Card;`;
  }

  // card-2: Pricing card with features list
  if (variant === 'card-2') {
    return `import React from 'react';

interface CardProps {
  planName?: string;
  price?: string;
  period?: string;
  features?: string[];
  buttonText?: string;
  buttonLink?: string;
  highlighted?: boolean;
}

const Card: React.FC<CardProps> = ({
  planName = "Pro Plan",
  price = "$29",
  period = "month",
  features = [
    "Unlimited projects",
    "24/7 support",
    "Advanced analytics",
    "Custom integrations",
    "Team collaboration"
  ],
  buttonText = "Get Started",
  buttonLink = "#",
  highlighted = false
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: '${theme.surface}',
    padding: '${padding}',
    borderRadius: '${borderRadius}',
    boxShadow: highlighted ? '0 20px 40px rgba(0, 0, 0, 0.15)' : '${shadowMap[elevation as keyof typeof shadowMap]}',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: highlighted ? \`2px solid ${theme.primary}\` : \`1px solid \${adjustOpacity('${theme.text}', 0.1)}\`,
    maxWidth: '400px',
    position: 'relative'
  };

  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: '${theme.primary}',
    color: '#FFFFFF',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase'
  };

  const planNameStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '${theme.text}',
    marginBottom: '16px',
    marginTop: 0
  };

  const priceContainerStyle: React.CSSProperties = {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: \`1px solid \${adjustOpacity('${theme.text}', 0.1)}\`
  };

  const priceStyle: React.CSSProperties = {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '${theme.primary}',
    lineHeight: '1'
  };

  const periodStyle: React.CSSProperties = {
    fontSize: '1rem',
    color: \`\${adjustOpacity('${theme.text}', 0.6)}\`,
    marginLeft: '8px'
  };

  const featuresListStyle: React.CSSProperties = {
    listStyle: 'none',
    margin: '0 0 32px 0',
    padding: 0
  };

  const featureItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    color: '${theme.text}',
    fontSize: '1rem'
  };

  const checkIconStyle: React.CSSProperties = {
    color: '${theme.primary}',
    fontSize: '1.25rem',
    fontWeight: 'bold'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: highlighted ? '${theme.primary}' : '${theme.accent}',
    color: '#FFFFFF',
    padding: '14px 32px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'block',
    textAlign: 'center',
    width: '100%',
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
        e.currentTarget.style.boxShadow = highlighted ? '0 25px 50px rgba(0, 0, 0, 0.2)' : '0 12px 20px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = highlighted ? '0 20px 40px rgba(0, 0, 0, 0.15)' : '${shadowMap[elevation as keyof typeof shadowMap]}';
      }}
    >
      {highlighted && <div style={badgeStyle}>Popular</div>}

      <h3 style={planNameStyle}>{planName}</h3>

      <div style={priceContainerStyle}>
        <span style={priceStyle}>{price}</span>
        <span style={periodStyle}>/ {period}</span>
      </div>

      <ul style={featuresListStyle}>
        {features.map((feature, index) => (
          <li key={index} style={featureItemStyle}>
            <span style={checkIconStyle}>✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={buttonLink}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = highlighted
            ? '${adjustColor(theme.primary || '#3B82F6', -20)}'
            : '${adjustColor(theme.accent || '#EC4899', -20)}';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = highlighted ? '${theme.primary}' : '${theme.accent}';
        }}
      >
        {buttonText}
      </a>
    </div>
  );
};

export default Card;`;
  }

  // card-3: Team member card with circular photo
  if (variant === 'card-3') {
    return `import React from 'react';

interface CardProps {
  photo?: string;
  name?: string;
  role?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

const Card: React.FC<CardProps> = ({
  photo = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
  name = "John Doe",
  role = "Software Engineer",
  bio = "Passionate about building amazing products and solving complex problems.",
  socialLinks = {
    twitter: "#",
    linkedin: "#",
    github: "#"
  }
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: '${theme.surface}',
    padding: '${padding}',
    borderRadius: '${borderRadius}',
    boxShadow: '${shadowMap[elevation as keyof typeof shadowMap]}',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: \`1px solid \${adjustOpacity('${theme.text}', 0.1)}\`,
    maxWidth: '350px',
    textAlign: 'center'
  };

  const photoContainerStyle: React.CSSProperties = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    overflow: 'hidden',
    margin: '0 auto 20px',
    border: \`4px solid ${theme.primary}\`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  };

  const photoStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  const nameStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '${theme.text}',
    marginBottom: '8px',
    marginTop: 0
  };

  const roleStyle: React.CSSProperties = {
    fontSize: '1rem',
    color: '${theme.primary}',
    fontWeight: '600',
    marginBottom: '16px'
  };

  const bioStyle: React.CSSProperties = {
    fontSize: '0.95rem',
    color: \`\${adjustOpacity('${theme.text}', 0.7)}\`,
    lineHeight: '1.6',
    marginBottom: '24px'
  };

  const socialLinksStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  };

  const socialLinkStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: \`\${adjustOpacity('${theme.primary}', 0.1)}\`,
    color: '${theme.primary}',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    fontSize: '1.25rem',
    transition: 'background-color 0.2s, color 0.2s'
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
    >
      <div style={photoContainerStyle}>
        <img src={photo} alt={name} style={photoStyle} />
      </div>

      <h3 style={nameStyle}>{name}</h3>
      <div style={roleStyle}>{role}</div>
      <p style={bioStyle}>{bio}</p>

      <div style={socialLinksStyle}>
        {socialLinks.twitter && (
          <a
            href={socialLinks.twitter}
            style={socialLinkStyle}
            aria-label="Twitter"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '${theme.primary}';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = adjustOpacity('${theme.primary}', 0.1);
              e.currentTarget.style.color = '${theme.primary}';
            }}
          >
            𝕏
          </a>
        )}
        {socialLinks.linkedin && (
          <a
            href={socialLinks.linkedin}
            style={socialLinkStyle}
            aria-label="LinkedIn"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '${theme.primary}';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = adjustOpacity('${theme.primary}', 0.1);
              e.currentTarget.style.color = '${theme.primary}';
            }}
          >
            in
          </a>
        )}
        {socialLinks.github && (
          <a
            href={socialLinks.github}
            style={socialLinkStyle}
            aria-label="GitHub"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '${theme.primary}';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = adjustOpacity('${theme.primary}', 0.1);
              e.currentTarget.style.color = '${theme.primary}';
            }}
          >
            ⚙
          </a>
        )}
      </div>
    </div>
  );
};

export default Card;`;
  }

  // card-4: Testimonial card with quote and rating
  if (variant === 'card-4') {
    return `import React from 'react';

interface CardProps {
  quote?: string;
  author?: string;
  authorRole?: string;
  authorPhoto?: string;
  rating?: number;
}

const Card: React.FC<CardProps> = ({
  quote = "This product has completely transformed how we work. The team is incredibly responsive and the features are exactly what we needed.",
  author = "Sarah Johnson",
  authorRole = "CEO, TechCorp",
  authorPhoto = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
  rating = 5
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: '${theme.surface}',
    padding: '${padding}',
    borderRadius: '${borderRadius}',
    boxShadow: '${shadowMap[elevation as keyof typeof shadowMap]}',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: \`1px solid \${adjustOpacity('${theme.text}', 0.1)}\`,
    maxWidth: '450px',
    position: 'relative'
  };

  const quoteIconStyle: React.CSSProperties = {
    fontSize: '3rem',
    color: \`\${adjustOpacity('${theme.primary}', 0.2)}\`,
    lineHeight: '1',
    marginBottom: '16px'
  };

  const quoteTextStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    color: '${theme.text}',
    lineHeight: '1.7',
    marginBottom: '24px',
    fontStyle: 'italic'
  };

  const ratingStyle: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    marginBottom: '24px'
  };

  const starStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    color: '#F59E0B'
  };

  const authorContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    paddingTop: '20px',
    borderTop: \`1px solid \${adjustOpacity('${theme.text}', 0.1)}\`
  };

  const authorPhotoStyle: React.CSSProperties = {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    objectFit: 'cover'
  };

  const authorInfoStyle: React.CSSProperties = {
    flex: 1
  };

  const authorNameStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '${theme.text}',
    marginBottom: '4px'
  };

  const authorRoleStyle: React.CSSProperties = {
    fontSize: '0.95rem',
    color: \`\${adjustOpacity('${theme.text}', 0.6)}\`
  };

  const adjustOpacity = (color: string, opacity: number): string => {
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} style={starStyle}>
        {index < rating ? '★' : '☆'}
      </span>
    ));
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
    >
      <div style={quoteIconStyle}>"</div>

      <p style={quoteTextStyle}>{quote}</p>

      <div style={ratingStyle}>
        {renderStars()}
      </div>

      <div style={authorContainerStyle}>
        <img src={authorPhoto} alt={author} style={authorPhotoStyle} />
        <div style={authorInfoStyle}>
          <div style={authorNameStyle}>{author}</div>
          <div style={authorRoleStyle}>{authorRole}</div>
        </div>
      </div>
    </div>
  );
};

export default Card;`;
  }

  // Default to card-1
  return generateCard({ ...options, templateProps: { ...templateProps, variant: 'card-1' } });
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

const generateSection = (options: GeneratorOptions): string => {
  const { theme, customizations, templateProps } = options;
  const variant = templateProps?.variant || 'features-1';
  const layout = templateProps?.layout || 'grid';
  const columns = templateProps?.columns || 3;
  const hasIcons = templateProps?.hasIcons !== false;
  const hasAnimation = templateProps?.hasAnimation !== false;
  const hasLightbox = templateProps?.hasLightbox || false;

  const padding = customizations?.padding || '80px 24px';
  const borderRadius = customizations?.borderRadius || '0px';

  // Generate Features Section (features-1)
  if (variant === 'features-1') {
    return `import React from 'react';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesSectionProps {
  title?: string;
  subtitle?: string;
  features?: Feature[];
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  title = "Our Features",
  subtitle = "Everything you need to build amazing products",
  features = [
    {
      icon: "🚀",
      title: "Fast Performance",
      description: "Lightning-fast load times and optimized performance for the best user experience."
    },
    {
      icon: "🎨",
      title: "Beautiful Design",
      description: "Stunning, modern designs that captivate your audience and enhance usability."
    },
    {
      icon: "🔒",
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee for peace of mind."
    },
    {
      icon: "📱",
      title: "Mobile Responsive",
      description: "Perfectly optimized for all devices, from desktop to mobile phones."
    },
    {
      icon: "⚡",
      title: "Easy Integration",
      description: "Simple APIs and SDKs that integrate seamlessly with your existing tools."
    },
    {
      icon: "💪",
      title: "Powerful Features",
      description: "Advanced capabilities that scale with your business needs and growth."
    }
  ]
}) => {
  const sectionStyle: React.CSSProperties = {
    backgroundColor: '${theme.background}',
    padding: '${padding}',
    borderRadius: '${borderRadius}'
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '64px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '${theme.text}',
    marginBottom: '16px',
    marginTop: 0
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    color: \`\${adjustOpacity('${theme.text}', 0.7)}\`,
    maxWidth: '700px',
    margin: '0 auto'
  };

  const gridStyle: React.CSSProperties = {
    display: '${layout === 'masonry' ? 'flex' : 'grid'}',
    gridTemplateColumns: \`repeat(auto-fit, minmax(300px, 1fr))\`,
    gap: '32px',${layout === 'masonry' ? `
    flexWrap: 'wrap',
    justifyContent: 'center'` : ''}${layout === 'centered' ? `
    justifyItems: 'center'` : ''}
  };

  const featureCardStyle: React.CSSProperties = {
    backgroundColor: '${theme.surface}',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    border: \`1px solid \${adjustOpacity('${theme.text}', 0.1)}\`,${layout === 'masonry' ? `
    flex: '0 0 calc(33.333% - 24px)',
    maxWidth: 'calc(33.333% - 24px)'` : ''}${hasAnimation ? `
    transform: 'translateY(0)',
    opacity: 1` : ''}
  };

  const iconContainerStyle: React.CSSProperties = {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: \`linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)\`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    marginBottom: '20px',
    transition: 'transform 0.3s ease'
  };

  const featureTitleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '${theme.text}',
    marginBottom: '12px',
    marginTop: 0
  };

  const featureDescriptionStyle: React.CSSProperties = {
    fontSize: '1rem',
    color: \`\${adjustOpacity('${theme.text}', 0.7)}\`,
    lineHeight: '1.6',
    margin: 0
  };

  const adjustOpacity = (color: string, opacity: number): string => {
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
  };

  return (
    <section style={sectionStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
          <p style={subtitleStyle}>{subtitle}</p>
        </div>

        <div style={gridStyle}>
          {features.slice(0, ${columns * 2}).map((feature, index) => (
            <div
              key={index}
              style={featureCardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                const iconEl = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
                if (iconEl) iconEl.style.transform = 'scale(1.1) rotate(5deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                const iconEl = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
                if (iconEl) iconEl.style.transform = 'scale(1) rotate(0deg)';
              }}
            >${hasIcons ? `
              <div style={iconContainerStyle} data-icon>
                {feature.icon}
              </div>` : ''}
              <h3 style={featureTitleStyle}>{feature.title}</h3>
              <p style={featureDescriptionStyle}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;`;
  }

  // Generate CTA Section (cta-1)
  if (variant === 'cta-1') {
    return `import React from 'react';

interface CTASectionProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

const CTASection: React.FC<CTASectionProps> = ({
  title = "Ready to Get Started?",
  description = "Join thousands of satisfied customers who have transformed their business with our platform.",
  primaryButtonText = "Start Free Trial",
  primaryButtonLink = "#",
  secondaryButtonText = "Schedule Demo",
  secondaryButtonLink = "#"
}) => {
  const sectionStyle: React.CSSProperties = {
    background: \`linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.accent} 100%)\`,
    padding: '${padding}',
    borderRadius: '${borderRadius}',
    position: 'relative',
    overflow: 'hidden'
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
    pointerEvents: 'none'
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: '20px',
    marginTop: 0,${hasAnimation ? `
    animation: 'fadeInUp 0.8s ease-out'` : ''}
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '40px',
    lineHeight: '1.6',
    maxWidth: '700px',
    margin: '0 auto 40px'
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  };

  const primaryButtonStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    color: '${theme.primary}',
    padding: '16px 40px',
    fontSize: '1.125rem',
    fontWeight: '700',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(0)'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    padding: '16px 40px',
    fontSize: '1.125rem',
    fontWeight: '700',
    border: '2px solid #FFFFFF',
    borderRadius: '12px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.3s ease',
    transform: 'translateY(0)'
  };

  return (
    <section style={sectionStyle}>
      <div style={overlayStyle} />
      <div style={containerStyle}>
        <h2 style={titleStyle}>{title}</h2>
        <p style={descriptionStyle}>{description}</p>
        <div style={buttonContainerStyle}>
          <a
            href={primaryButtonLink}
            style={primaryButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
            }}
          >
            {primaryButtonText}
          </a>
          <a
            href={secondaryButtonLink}
            style={secondaryButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {secondaryButtonText}
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;`;
  }

  // Generate Stats Section (stats-1)
  if (variant === 'stats-1') {
    return `import React, { useState, useEffect, useRef } from 'react';

interface Stat {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

interface StatsSectionProps {
  title?: string;
  subtitle?: string;
  stats?: Stat[];
}

const StatsSection: React.FC<StatsSectionProps> = ({
  title = "Our Impact in Numbers",
  subtitle = "Join thousands of successful businesses using our platform",
  stats = [
    { value: 10000, label: "Active Users", suffix: "+" },
    { value: 98, label: "Satisfaction Rate", suffix: "%" },
    { value: 500, label: "Projects Completed", suffix: "+" },
    { value: 24, label: "Support Available", suffix: "/7" }
  ]
}) => {
  const [counters, setCounters] = useState<number[]>(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {${hasAnimation ? `
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();` : `
    animateCounters();`}
  }, [hasAnimated]);

  const animateCounters = () => {
    stats.forEach((stat, index) => {
      const duration = 2000;
      const steps = 60;
      const increment = stat.value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timer);
        }
        setCounters((prev) => {
          const newCounters = [...prev];
          newCounters[index] = Math.floor(current);
          return newCounters;
        });
      }, duration / steps);
    });
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: '${theme.surface}',
    padding: '${padding}',
    borderRadius: '${borderRadius}',
    background: \`linear-gradient(135deg, \${adjustOpacity('${theme.primary}', 0.05)} 0%, \${adjustOpacity('${theme.secondary}', 0.05)} 100%)\`
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '64px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '${theme.text}',
    marginBottom: '16px',
    marginTop: 0
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    color: \`\${adjustOpacity('${theme.text}', 0.7)}\`,
    maxWidth: '700px',
    margin: '0 auto'
  };

  const statsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: \`repeat(auto-fit, minmax(250px, 1fr))\`,
    gap: '40px'
  };

  const statItemStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '32px',
    backgroundColor: '${theme.background}',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    border: \`2px solid \${adjustOpacity('${theme.primary}', 0.1)}\`
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    background: \`linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)\`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '12px',
    fontVariantNumeric: 'tabular-nums'
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    color: \`\${adjustOpacity('${theme.text}', 0.8)}\`,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  const adjustOpacity = (color: string, opacity: number): string => {
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
  };

  return (
    <section style={sectionStyle} ref={sectionRef}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
          <p style={subtitleStyle}>{subtitle}</p>
        </div>

        <div style={statsGridStyle}>
          {stats.map((stat, index) => (
            <div
              key={index}
              style={statItemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '${theme.primary}';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = adjustOpacity('${theme.primary}', 0.1);
              }}
            >
              <div style={statValueStyle}>
                {stat.prefix || ''}{counters[index].toLocaleString()}{stat.suffix || ''}
              </div>
              <div style={statLabelStyle}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;`;
  }

  // Generate Gallery Section (gallery-1)
  if (variant === 'gallery-1') {
    return `import React, { useState } from 'react';

interface GalleryImage {
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

interface GallerySectionProps {
  title?: string;
  subtitle?: string;
  images?: GalleryImage[];
}

const GallerySection: React.FC<GallerySectionProps> = ({
  title = "Our Gallery",
  subtitle = "Explore our collection of beautiful work",
  images = [
    { src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800", alt: "Gallery 1", title: "Project Alpha" },
    { src: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800", alt: "Gallery 2", title: "Project Beta" },
    { src: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=800", alt: "Gallery 3", title: "Project Gamma" },
    { src: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=800", alt: "Gallery 4", title: "Project Delta" },
    { src: "https://images.unsplash.com/photo-1617791160588-241658c0f566?w=800", alt: "Gallery 5", title: "Project Epsilon" },
    { src: "https://images.unsplash.com/photo-1617817546909-1f1d0b6f4f29?w=800", alt: "Gallery 6", title: "Project Zeta" }
  ]
}) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const sectionStyle: React.CSSProperties = {
    backgroundColor: '${theme.background}',
    padding: '${padding}',
    borderRadius: '${borderRadius}'
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '64px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '${theme.text}',
    marginBottom: '16px',
    marginTop: 0
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    color: \`\${adjustOpacity('${theme.text}', 0.7)}\`,
    maxWidth: '700px',
    margin: '0 auto'
  };

  const galleryGridStyle: React.CSSProperties = {
    display: '${layout === 'masonry' ? 'columns' : 'grid'}',${layout === 'masonry' ? `
    columns: '${columns}',
    columnGap: '24px'` : `
    gridTemplateColumns: \`repeat(auto-fill, minmax(300px, 1fr))\`,
    gap: '24px'`}
  };

  const imageContainerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '16px',
    cursor: 'pointer',${layout === 'masonry' ? `
    marginBottom: '24px',
    breakInside: 'avoid'` : `
    aspectRatio: '1 / 1'`}
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
    display: 'block'
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: \`linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 50%)\`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '24px',
    color: '#FFFFFF'
  };

  const overlayTitleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    margin: 0
  };${hasLightbox ? `

  const lightboxStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '40px',
    cursor: 'pointer'
  };

  const lightboxImageStyle: React.CSSProperties = {
    maxWidth: '90%',
    maxHeight: '90%',
    objectFit: 'contain',
    borderRadius: '8px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: '#FFFFFF',
    color: '${theme.text}',
    border: 'none',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease'
  };` : ''}

  const adjustOpacity = (color: string, opacity: number): string => {
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
  };

  return (
    <>
      <section style={sectionStyle}>
        <div style={containerStyle}>
          <div style={headerStyle}>
            <h2 style={titleStyle}>{title}</h2>
            <p style={subtitleStyle}>{subtitle}</p>
          </div>

          <div style={galleryGridStyle}>
            {images.map((image, index) => (
              <div
                key={index}
                style={imageContainerStyle}
                onClick={() => ${hasLightbox ? 'setSelectedImage(image)' : 'console.log(image)'}}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  style={imageStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    const overlay = e.currentTarget.nextElementSibling as HTMLElement;
                    if (overlay) overlay.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    const overlay = e.currentTarget.nextElementSibling as HTMLElement;
                    if (overlay) overlay.style.opacity = '0';
                  }}
                />
                <div style={overlayStyle}>
                  {image.title && <h3 style={overlayTitleStyle}>{image.title}</h3>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>${hasLightbox ? `

      {selectedImage && (
        <div
          style={lightboxStyle}
          onClick={() => setSelectedImage(null)}
        >
          <button
            style={closeButtonStyle}
            onClick={() => setSelectedImage(null)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ×
          </button>
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
            style={lightboxImageStyle}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}` : ''}
    </>
  );
};

export default GallerySection;`;
  }

  // Default fallback to features
  return generateSection({ ...options, templateProps: { ...templateProps, variant: 'features-1' } });
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
    // Hero Section variants
    'hero-1': { type: 'HeroSection', props: { variant: 'hero-1', hasCTA: true } },
    'hero-2': { type: 'HeroSection', props: { variant: 'hero-2', hasCTA: true } },
    'hero-3': { type: 'HeroSection', props: { variant: 'hero-3', hasCTA: true } },
    'hero-4': { type: 'HeroSection', props: { variant: 'hero-4', hasCTA: true } },

    // NavBar variants
    'navbar-1': { type: 'NavBar', props: { variant: 'navbar-1', position: 'fixed' } },
    'navbar-2': { type: 'NavBar', props: { variant: 'navbar-2', position: 'fixed' } },
    'navbar-3': { type: 'NavBar', props: { variant: 'navbar-3', position: 'fixed' } },

    // Card variants
    'card-1': { type: 'Card', props: { variant: 'card-1', elevation: 'medium' } },
    'card-2': { type: 'Card', props: { variant: 'card-2', elevation: 'medium' } },
    'card-3': { type: 'Card', props: { variant: 'card-3', elevation: 'medium' } },
    'card-4': { type: 'Card', props: { variant: 'card-4', elevation: 'medium' } },

    // Section variants
    'features-1': { type: 'Section', props: { variant: 'features-1', layout: 'grid', columns: 3, hasIcons: true, hasAnimation: true } },
    'cta-1': { type: 'Section', props: { variant: 'cta-1', hasAnimation: true } },
    'stats-1': { type: 'Section', props: { variant: 'stats-1', hasAnimation: true } },
    'gallery-1': { type: 'Section', props: { variant: 'gallery-1', layout: 'grid', columns: 3, hasLightbox: true } },

    // Footer and Form (unchanged)
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
    case 'Section':
      return generateSection(options);
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

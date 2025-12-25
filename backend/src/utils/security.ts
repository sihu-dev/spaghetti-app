import { Errors } from './errors';

// SSRF Prevention - Blocked hosts and IPs
const BLOCKED_HOSTNAMES = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]',
];

const BLOCKED_IP_PREFIXES = [
  '10.',           // Private Class A
  '172.16.',       // Private Class B (172.16.0.0 - 172.31.255.255)
  '172.17.',
  '172.18.',
  '172.19.',
  '172.20.',
  '172.21.',
  '172.22.',
  '172.23.',
  '172.24.',
  '172.25.',
  '172.26.',
  '172.27.',
  '172.28.',
  '172.29.',
  '172.30.',
  '172.31.',
  '192.168.',      // Private Class C
  '169.254.',      // Link-local
  'fc00:',         // IPv6 private
  'fe80:',         // IPv6 link-local
];

const BLOCKED_SCHEMES = ['file:', 'ftp:', 'gopher:', 'data:', 'javascript:'];

export function validateImageUrl(url: string): void {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw Errors.badRequest('Invalid URL format');
  }

  // Check scheme
  if (BLOCKED_SCHEMES.includes(parsed.protocol)) {
    throw Errors.ssrfBlocked(url);
  }

  // Only allow http and https
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw Errors.ssrfBlocked(url);
  }

  // Check hostname
  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    throw Errors.ssrfBlocked(url);
  }

  // Check IP prefixes
  for (const prefix of BLOCKED_IP_PREFIXES) {
    if (hostname.startsWith(prefix)) {
      throw Errors.ssrfBlocked(url);
    }
  }

  // Block metadata endpoints (AWS, GCP, Azure)
  const metadataHosts = [
    '169.254.169.254',  // AWS/GCP metadata
    'metadata.google.internal',
    'metadata.google.com',
  ];

  if (metadataHosts.includes(hostname)) {
    throw Errors.ssrfBlocked(url);
  }
}

// Sanitize filename for safe storage
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}

// Validate hex color format
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

// Validate MIME type for images
export function isValidImageMimeType(mimeType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  return validTypes.includes(mimeType.toLowerCase());
}

// Generate secure random ID
export function generateSecureId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
}

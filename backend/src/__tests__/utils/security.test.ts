import {
  validateImageUrl,
  isValidHexColor,
  isValidImageMimeType,
  sanitizeFilename,
  generateSecureId,
} from '../../utils/security';
import { AppError } from '../../utils/errors';

describe('Security Utils', () => {
  describe('validateImageUrl', () => {
    it('should accept valid HTTPS URLs', () => {
      expect(() => validateImageUrl('https://example.com/image.png')).not.toThrow();
      expect(() => validateImageUrl('https://cdn.example.com/path/to/image.jpg')).not.toThrow();
    });

    it('should accept valid HTTP URLs', () => {
      expect(() => validateImageUrl('http://example.com/image.png')).not.toThrow();
    });

    it('should reject localhost URLs', () => {
      expect(() => validateImageUrl('http://localhost/image.png')).toThrow(AppError);
      expect(() => validateImageUrl('http://localhost:3000/image.png')).toThrow(AppError);
    });

    it('should reject 127.0.0.1 URLs', () => {
      expect(() => validateImageUrl('http://127.0.0.1/image.png')).toThrow(AppError);
      expect(() => validateImageUrl('http://127.0.0.1:8080/image.png')).toThrow(AppError);
    });

    it('should reject private IP ranges (10.x.x.x)', () => {
      expect(() => validateImageUrl('http://10.0.0.1/image.png')).toThrow(AppError);
      expect(() => validateImageUrl('http://10.255.255.255/image.png')).toThrow(AppError);
    });

    it('should reject private IP ranges (172.16-31.x.x)', () => {
      expect(() => validateImageUrl('http://172.16.0.1/image.png')).toThrow(AppError);
      expect(() => validateImageUrl('http://172.31.255.255/image.png')).toThrow(AppError);
    });

    it('should reject private IP ranges (192.168.x.x)', () => {
      expect(() => validateImageUrl('http://192.168.0.1/image.png')).toThrow(AppError);
      expect(() => validateImageUrl('http://192.168.1.100/image.png')).toThrow(AppError);
    });

    it('should reject link-local addresses (169.254.x.x)', () => {
      expect(() => validateImageUrl('http://169.254.0.1/image.png')).toThrow(AppError);
    });

    it('should reject AWS metadata endpoint', () => {
      expect(() => validateImageUrl('http://169.254.169.254/latest/meta-data')).toThrow(AppError);
    });

    it('should reject file:// protocol', () => {
      expect(() => validateImageUrl('file:///etc/passwd')).toThrow(AppError);
    });

    it('should reject data: URLs', () => {
      expect(() => validateImageUrl('data:image/png;base64,abc')).toThrow(AppError);
    });

    it('should reject invalid URLs', () => {
      expect(() => validateImageUrl('not-a-url')).toThrow(AppError);
      expect(() => validateImageUrl('')).toThrow(AppError);
    });
  });

  describe('isValidHexColor', () => {
    it('should accept valid 6-digit hex colors', () => {
      expect(isValidHexColor('#000000')).toBe(true);
      expect(isValidHexColor('#FFFFFF')).toBe(true);
      expect(isValidHexColor('#ff5733')).toBe(true);
      expect(isValidHexColor('#ABC123')).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      expect(isValidHexColor('#FFF')).toBe(false); // 3-digit
      expect(isValidHexColor('000000')).toBe(false); // no hash
      expect(isValidHexColor('#GGGGGG')).toBe(false); // invalid chars
      expect(isValidHexColor('#12345')).toBe(false); // 5 digits
      expect(isValidHexColor('#1234567')).toBe(false); // 7 digits
      expect(isValidHexColor('')).toBe(false);
    });
  });

  describe('isValidImageMimeType', () => {
    it('should accept valid image MIME types', () => {
      expect(isValidImageMimeType('image/jpeg')).toBe(true);
      expect(isValidImageMimeType('image/jpg')).toBe(true);
      expect(isValidImageMimeType('image/png')).toBe(true);
      expect(isValidImageMimeType('image/gif')).toBe(true);
      expect(isValidImageMimeType('image/webp')).toBe(true);
    });

    it('should reject invalid MIME types', () => {
      expect(isValidImageMimeType('image/svg+xml')).toBe(false);
      expect(isValidImageMimeType('image/bmp')).toBe(false);
      expect(isValidImageMimeType('text/plain')).toBe(false);
      expect(isValidImageMimeType('application/json')).toBe(false);
      expect(isValidImageMimeType('')).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('should preserve safe characters', () => {
      expect(sanitizeFilename('image.png')).toBe('image.png');
      expect(sanitizeFilename('my-file.jpg')).toBe('my-file.jpg');
      expect(sanitizeFilename('file123.webp')).toBe('file123.webp');
    });

    it('should replace unsafe characters with underscores', () => {
      expect(sanitizeFilename('file name.png')).toBe('file_name.png');
      expect(sanitizeFilename('file<>name.png')).toBe('file__name.png');
      // '../etc/passwd' -> '__/etc/passwd' -> '__etc_passwd' -> dots collapsed -> '._etc_passwd'
      expect(sanitizeFilename('../etc/passwd')).toBe('._etc_passwd');
    });

    it('should collapse multiple dots', () => {
      expect(sanitizeFilename('file...png')).toBe('file.png');
    });

    it('should truncate long filenames', () => {
      const longName = 'a'.repeat(300) + '.png';
      expect(sanitizeFilename(longName).length).toBeLessThanOrEqual(255);
    });
  });

  describe('generateSecureId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with correct format', () => {
      const id = generateSecureId();
      expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
    });
  });
});

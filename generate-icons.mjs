import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const sizes = [16, 32, 48, 128];
const outputDir = './frontend/extension/icons';

// 보라색 그라데이션 원형 SVG 생성
function createIconSvg(size) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#6366f1"/>
        <stop offset="100%" style="stop-color:#8b5cf6"/>
      </linearGradient>
    </defs>
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="url(#grad)"/>
    <text x="${size/2}" y="${size*0.68}" font-size="${size*0.5}" text-anchor="middle" fill="white" font-family="Arial">🍝</text>
  </svg>`;
}

async function generateIcons() {
  try {
    // 디렉토리 생성
    await mkdir(outputDir, { recursive: true });
    
    for (const size of sizes) {
      const svg = createIconSvg(size);
      const filename = join(outputDir, `icon${size}.png`);
      
      await sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toFile(filename);
      
      console.log(`Created: ${filename}`);
    }
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();

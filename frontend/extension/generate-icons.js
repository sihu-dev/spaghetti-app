const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

// icons 폴더가 없으면 생성
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 원의 중심과 반지름
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - (size * 0.05); // 약간의 여백

  // 보라색 그라데이션 생성 (대각선 방향)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#6366f1');    // indigo-500
  gradient.addColorStop(1, '#8b5cf6');    // violet-500

  // 원 그리기
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // 작은 아이콘이 아닌 경우 파스타 이모지 대신 심플한 디자인 추가
  if (size >= 32) {
    // 중앙에 작은 흰색 원 (눈에 띄는 포인트)
    ctx.beginPath();
    const innerRadius = radius * 0.35;
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();

    // 내부에 보라색 점
    ctx.beginPath();
    const dotRadius = radius * 0.15;
    ctx.arc(centerX, centerY, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#7c3aed'; // violet-600
    ctx.fill();
  }

  return canvas;
}

// 각 사이즈별 아이콘 생성
sizes.forEach(size => {
  const canvas = generateIcon(size);
  const buffer = canvas.toBuffer('image/png');
  const filename = path.join(iconsDir, `icon${size}.png`);

  fs.writeFileSync(filename, buffer);
  console.log(`✓ Generated: icon${size}.png (${size}x${size})`);
});

console.log('\n아이콘 생성 완료!');
console.log(`생성 위치: ${iconsDir}`);

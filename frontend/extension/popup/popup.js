// Import modules
import { extractColors } from '../lib/color-extractor.js';
import { generateDesignTokens } from '../lib/token-generator.js';

// DOM 요소
const captureBtn = document.getElementById('captureBtn');
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const extractBtn = document.getElementById('extractBtn');
const loadingState = document.getElementById('loadingState');
const resultSection = document.getElementById('resultSection');
const colorPalette = document.getElementById('colorPalette');
const downloadTokenBtn = document.getElementById('downloadTokenBtn');
const copyTokenBtn = document.getElementById('copyTokenBtn');
const openSidePanelBtn = document.getElementById('openSidePanelBtn');
const openOptionsBtn = document.getElementById('openOptionsBtn');

let currentImageSource = null;
let currentColors = null;
let currentTokens = null;

// 초기화
document.addEventListener('DOMContentLoaded', init);

async function init() {
  setupEventListeners();
  await loadSavedColors();
}

function setupEventListeners() {
  // 캡처 버튼
  captureBtn.addEventListener('click', captureScreenshot);

  // 업로드 영역 클릭
  uploadArea.addEventListener('click', () => imageInput.click());

  // 파일 선택
  imageInput.addEventListener('change', handleFileSelect);

  // 드래그 앤 드롭
  uploadArea.addEventListener('dragover', handleDragOver);
  uploadArea.addEventListener('dragleave', handleDragLeave);
  uploadArea.addEventListener('drop', handleDrop);

  // 추출 버튼
  extractBtn.addEventListener('click', extractColorsFromImage);

  // 토큰 액션 버튼
  downloadTokenBtn.addEventListener('click', downloadTokens);
  copyTokenBtn.addEventListener('click', copyTokens);

  // 푸터 버튼
  openSidePanelBtn.addEventListener('click', openSidePanel);
  openOptionsBtn.addEventListener('click', openOptions);
}

// 스크린샷 캡처
async function captureScreenshot() {
  try {
    showLoading(true, '페이지 캡처 중...');

    // 현재 탭의 스크린샷 캡처
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
      quality: 100
    });

    // 미리보기 표시
    currentImageSource = dataUrl;
    previewImage.src = dataUrl;
    previewImage.classList.remove('hidden');
    document.querySelector('.upload-content').classList.add('hidden');

    updateExtractButton();
    showToast('페이지 캡처 완료!', 'success');
  } catch (error) {
    console.error('Screenshot capture error:', error);
    showToast('스크린샷 캡처 실패: ' + error.message, 'error');
  } finally {
    showLoading(false);
  }
}

// 파일 선택 핸들러
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    currentImageSource = file;
    showPreview(file);
    updateExtractButton();
  }
}

// 드래그 오버 핸들러
function handleDragOver(e) {
  e.preventDefault();
  uploadArea.classList.add('dragover');
}

// 드래그 리브 핸들러
function handleDragLeave(e) {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
}

// 드롭 핸들러
function handleDrop(e) {
  e.preventDefault();
  uploadArea.classList.remove('dragover');

  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    currentImageSource = file;
    showPreview(file);
    updateExtractButton();
  }
}

// 미리보기 표시
function showPreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target.result;
    previewImage.classList.remove('hidden');
    document.querySelector('.upload-content').classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

// 추출 버튼 상태 업데이트
function updateExtractButton() {
  const hasImage = currentImageSource !== null;
  extractBtn.disabled = !hasImage;
}

// 색상 추출 (로컬 처리)
async function extractColorsFromImage() {
  try {
    if (!currentImageSource) {
      showToast('이미지를 선택해주세요', 'error');
      return;
    }

    showLoading(true, '색상 추출 중...');

    // 색상 추출 (Canvas API 사용)
    const colorObjects = await extractColors(currentImageSource, {
      colorCount: 8,
      quality: 5,
      excludeWhite: true,
      excludeBlack: true
    });

    // HEX 색상만 추출
    currentColors = colorObjects.map(c => c.hex);

    // 디자인 토큰 생성
    currentTokens = generateDesignTokens(colorObjects, {
      format: 'json',
      prefix: 'color',
      generateShades: true
    });

    // 결과 표시
    displayColors(currentColors);

    // 저장
    await saveColors(currentColors, currentTokens);

    showToast(`${currentColors.length}개 색상이 추출되었습니다!`, 'success');
  } catch (error) {
    console.error('Color extraction error:', error);
    showToast('색상 추출 실패: ' + error.message, 'error');
  } finally {
    showLoading(false);
  }
}

// 색상 팔레트 표시
function displayColors(colors) {
  resultSection.classList.remove('hidden');
  colorPalette.innerHTML = '';

  colors.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color;
    swatch.setAttribute('data-color', color);
    swatch.title = `클릭하여 ${color} 복사`;

    swatch.addEventListener('click', async () => {
      await copyToClipboard(color);
      showToast(`${color} 복사됨!`, 'success');
    });

    colorPalette.appendChild(swatch);
  });
}

// 토큰 다운로드 (JSON 파일)
async function downloadTokens() {
  if (!currentTokens) {
    showToast('추출된 색상이 없습니다', 'error');
    return;
  }

  try {
    const json = JSON.stringify(currentTokens, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `spaghetti-tokens-${timestamp}.json`;

    // 다운로드
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
    showToast('토큰이 다운로드되었습니다!', 'success');
  } catch (error) {
    console.error('Download error:', error);
    showToast('다운로드 실패', 'error');
  }
}

// 토큰 JSON 복사
async function copyTokens() {
  if (!currentTokens) {
    showToast('추출된 색상이 없습니다', 'error');
    return;
  }

  try {
    const json = JSON.stringify(currentTokens, null, 2);
    await copyToClipboard(json);
    showToast('토큰 JSON이 복사되었습니다!', 'success');
  } catch (error) {
    console.error('Copy error:', error);
    showToast('복사 실패', 'error');
  }
}

// 색상 저장
async function saveColors(colors, tokens) {
  try {
    await chrome.storage.local.set({
      lastColors: colors,
      lastTokens: tokens,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Save colors error:', error);
  }
}

// 저장된 색상 로드
async function loadSavedColors() {
  try {
    const result = await chrome.storage.local.get(['lastColors', 'lastTokens']);
    if (result.lastColors && result.lastColors.length > 0) {
      currentColors = result.lastColors;
      currentTokens = result.lastTokens;
      displayColors(currentColors);
    }
  } catch (error) {
    console.error('Load colors error:', error);
  }
}

// 사이드 패널 열기
async function openSidePanel() {
  try {
    await chrome.sidePanel.open({ windowId: (await chrome.windows.getCurrent()).id });
  } catch (error) {
    console.error('Open side panel error:', error);
    showToast('사이드 패널을 열 수 없습니다', 'error');
  }
}

// 옵션 페이지 열기
function openOptions() {
  chrome.runtime.openOptionsPage();
}

// 클립보드에 복사
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // 폴백: 임시 텍스트 영역 사용
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

// 로딩 상태 표시
function showLoading(show, message = '색상을 분석 중...') {
  if (show) {
    loadingState.querySelector('p').textContent = message;
  }
  loadingState.classList.toggle('hidden', !show);
  extractBtn.disabled = show;
  captureBtn.disabled = show;
}

// 토스트 알림 표시
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

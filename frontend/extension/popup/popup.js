// API 설정
const API_BASE_URL = 'http://localhost:3000/api';

// DOM 요소
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const imageUrl = document.getElementById('imageUrl');
const previewImage = document.getElementById('previewImage');
const extractBtn = document.getElementById('extractBtn');
const loadingState = document.getElementById('loadingState');
const resultSection = document.getElementById('resultSection');
const colorPalette = document.getElementById('colorPalette');
const applyThemeBtn = document.getElementById('applyThemeBtn');
const copyThemeBtn = document.getElementById('copyThemeBtn');
const saveThemeBtn = document.getElementById('saveThemeBtn');
const openSidePanelBtn = document.getElementById('openSidePanelBtn');
const openOptionsBtn = document.getElementById('openOptionsBtn');

let currentImageFile = null;
let currentTheme = null;

// 초기화
document.addEventListener('DOMContentLoaded', init);

async function init() {
  setupEventListeners();
  await loadSavedTheme();
}

function setupEventListeners() {
  // 업로드 영역 클릭
  uploadArea.addEventListener('click', () => imageInput.click());
  
  // 파일 선택
  imageInput.addEventListener('change', handleFileSelect);
  
  // 드래그 앤 드롭
  uploadArea.addEventListener('dragover', handleDragOver);
  uploadArea.addEventListener('dragleave', handleDragLeave);
  uploadArea.addEventListener('drop', handleDrop);
  
  // URL 입력
  imageUrl.addEventListener('input', handleUrlInput);
  
  // 추출 버튼
  extractBtn.addEventListener('click', extractTheme);
  
  // 테마 액션 버튼
  applyThemeBtn.addEventListener('click', applyTheme);
  copyThemeBtn.addEventListener('click', copyTheme);
  saveThemeBtn.addEventListener('click', saveTheme);
  
  // 푸터 버튼
  openSidePanelBtn.addEventListener('click', openSidePanel);
  openOptionsBtn.addEventListener('click', openOptions);
}

// 파일 선택 핸들러
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    currentImageFile = file;
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
    currentImageFile = file;
    showPreview(file);
    updateExtractButton();
  }
}

// URL 입력 핸들러
function handleUrlInput(e) {
  const url = e.target.value.trim();
  if (url) {
    currentImageFile = null;
    previewImage.src = url;
    previewImage.classList.remove('hidden');
    document.querySelector('.upload-content').classList.add('hidden');
  }
  updateExtractButton();
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
  const hasImage = currentImageFile || imageUrl.value.trim();
  extractBtn.disabled = !hasImage;
}

// 테마 추출
async function extractTheme() {
  try {
    showLoading(true);
    
    const formData = new FormData();
    
    if (currentImageFile) {
      formData.append('image', currentImageFile);
    } else if (imageUrl.value.trim()) {
      formData.append('imageUrl', imageUrl.value.trim());
    }
    
    const response = await fetch(`${API_BASE_URL}/theme/extract`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('테마 추출 실패');
    }
    
    const result = await response.json();
    
    if (result.success) {
      currentTheme = result.data;
      displayTheme(currentTheme);
      showToast('테마가 성공적으로 추출되었습니다!', 'success');
    } else {
      throw new Error(result.error || '알 수 없는 오류');
    }
  } catch (error) {
    console.error('Theme extraction error:', error);
    showToast(error.message, 'error');
  } finally {
    showLoading(false);
  }
}

// 테마 표시
function displayTheme(theme) {
  resultSection.classList.remove('hidden');
  colorPalette.innerHTML = '';
  
  const colors = theme.colors || [];
  colors.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color;
    swatch.setAttribute('data-color', color);
    swatch.addEventListener('click', () => copyToClipboard(color));
    colorPalette.appendChild(swatch);
  });
}

// 테마 적용
async function applyTheme() {
  if (!currentTheme) return;
  
  try {
    // 현재 탭에 테마 적용
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectTheme,
      args: [currentTheme]
    });
    
    showToast('테마가 적용되었습니다!', 'success');
  } catch (error) {
    console.error('Apply theme error:', error);
    showToast('테마 적용 실패', 'error');
  }
}

// 페이지에 테마 주입
function injectTheme(theme) {
  const root = document.documentElement;
  const colors = theme.colors || [];
  
  if (colors.length >= 5) {
    root.style.setProperty('--ai-spaghetti-primary', colors[0]);
    root.style.setProperty('--ai-spaghetti-secondary', colors[1]);
    root.style.setProperty('--ai-spaghetti-accent', colors[2]);
    root.style.setProperty('--ai-spaghetti-background', colors[3]);
    root.style.setProperty('--ai-spaghetti-text', colors[4]);
  }
}

// 테마 복사
async function copyTheme() {
  if (!currentTheme) return;
  
  const themeJson = JSON.stringify(currentTheme, null, 2);
  await copyToClipboard(themeJson);
  showToast('테마가 클립보드에 복사되었습니다!', 'success');
}

// 테마 저장
async function saveTheme() {
  if (!currentTheme) return;
  
  try {
    const savedThemes = await chrome.storage.local.get('themes');
    const themes = savedThemes.themes || [];
    
    currentTheme.id = Date.now();
    currentTheme.savedAt = new Date().toISOString();
    
    themes.push(currentTheme);
    await chrome.storage.local.set({ themes });
    
    showToast('테마가 저장되었습니다!', 'success');
  } catch (error) {
    console.error('Save theme error:', error);
    showToast('테마 저장 실패', 'error');
  }
}

// 저장된 테마 로드
async function loadSavedTheme() {
  try {
    const result = await chrome.storage.local.get('currentTheme');
    if (result.currentTheme) {
      currentTheme = result.currentTheme;
      displayTheme(currentTheme);
    }
  } catch (error) {
    console.error('Load theme error:', error);
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
function showLoading(show) {
  loadingState.classList.toggle('hidden', !show);
  extractBtn.disabled = show;
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

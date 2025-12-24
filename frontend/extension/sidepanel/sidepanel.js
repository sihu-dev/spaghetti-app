// AI Spaghetti Side Panel - Theme Manager
// Handles theme history, preview, and management

// State
let allThemes = [];
let filteredThemes = [];
let currentTheme = null;
let currentFilter = 'all';
let searchQuery = '';
let selectedPreviewTheme = null;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const captureBtn = document.getElementById('captureBtn');
const refreshBtn = document.getElementById('refreshBtn');
const currentThemeContent = document.getElementById('currentThemeContent');
const themesList = document.getElementById('themesList');
const emptyThemes = document.getElementById('emptyThemes');
const themeCount = document.getElementById('themeCount');
const openPopupBtn = document.getElementById('openPopupBtn');
const openOptionsBtn = document.getElementById('openOptionsBtn');
const previewModal = document.getElementById('previewModal');
const closePreviewBtn = document.getElementById('closePreviewBtn');
const previewTitle = document.getElementById('previewTitle');
const previewBody = document.getElementById('previewBody');
const previewApplyBtn = document.getElementById('previewApplyBtn');
const previewCopyBtn = document.getElementById('previewCopyBtn');
const previewDeleteBtn = document.getElementById('previewDeleteBtn');
const toastContainer = document.getElementById('toastContainer');

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  setupEventListeners();
  await loadCurrentTheme();
  await loadThemes();

  // Listen for storage changes
  chrome.storage.onChanged.addListener(handleStorageChange);
}

// Event Listeners
function setupEventListeners() {
  // Search
  searchInput.addEventListener('input', handleSearch);
  clearSearchBtn.addEventListener('click', clearSearch);

  // Filters
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => handleFilterChange(btn.dataset.filter));
  });

  // Actions
  captureBtn.addEventListener('click', captureCurrentPage);
  refreshBtn.addEventListener('click', refreshThemes);
  openPopupBtn.addEventListener('click', openPopup);
  openOptionsBtn.addEventListener('click', openOptions);

  // Modal
  closePreviewBtn.addEventListener('click', closePreview);
  previewModal.querySelector('.modal-overlay').addEventListener('click', closePreview);
  previewApplyBtn.addEventListener('click', applyPreviewTheme);
  previewCopyBtn.addEventListener('click', copyPreviewCSS);
  previewDeleteBtn.addEventListener('click', deletePreviewTheme);
}

// Load current theme from storage
async function loadCurrentTheme() {
  try {
    const result = await chrome.storage.local.get('currentTheme');
    if (result.currentTheme) {
      currentTheme = result.currentTheme;
      displayCurrentTheme(currentTheme);
    }
  } catch (error) {
    console.error('Load current theme error:', error);
  }
}

// Display current theme
function displayCurrentTheme(theme) {
  if (!theme || !theme.colors || theme.colors.length === 0) {
    currentThemeContent.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🎨</span>
        <p>테마가 선택되지 않았습니다</p>
        <small>페이지에서 테마를 추출하거나 저장된 테마를 선택하세요</small>
      </div>
    `;
    return;
  }

  const colors = theme.colors.slice(0, 8);
  const colorSwatches = colors.map(color => `
    <div class="color-swatch"
         style="background-color: ${color}"
         data-color="${color}"
         title="${color}"
         onclick="copyColor('${color}')">
    </div>
  `).join('');

  currentThemeContent.innerHTML = `
    <div class="theme-display">
      <div class="color-palette">
        ${colorSwatches}
      </div>
      <div class="color-details">
        <div class="detail-row">
          <span class="detail-label">색상 수</span>
          <span class="detail-value">${colors.length}개</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">주요 색상</span>
          <span class="detail-value">${colors[0]}</span>
        </div>
      </div>
      <div class="theme-actions">
        <button class="action-btn primary" onclick="applyCurrentTheme()">
          ✨ 적용
        </button>
        <button class="action-btn secondary" onclick="copyCurrentCSS()">
          📋 CSS
        </button>
        <button class="action-btn secondary" onclick="saveCurrentTheme()">
          💾 저장
        </button>
      </div>
    </div>
  `;
}

// Load themes from storage via service worker
async function loadThemes() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_THEMES' });

    if (response.success) {
      allThemes = response.themes || [];
      applyFiltersAndSearch();
      updateThemeCount();
    } else {
      showToast('테마 목록을 불러올 수 없습니다', 'error');
    }
  } catch (error) {
    console.error('Load themes error:', error);
    showToast('테마 목록을 불러오는 중 오류가 발생했습니다', 'error');
  }
}

// Apply filters and search
function applyFiltersAndSearch() {
  let themes = [...allThemes];

  // Apply filter
  if (currentFilter === 'recent') {
    themes = themes.slice(-10).reverse();
  } else if (currentFilter === 'favorites') {
    themes = themes.filter(t => t.favorite);
  }

  // Apply search
  if (searchQuery) {
    themes = themes.filter(theme => {
      const searchLower = searchQuery.toLowerCase();
      const colorMatch = theme.colors?.some(c => c.toLowerCase().includes(searchLower));
      const dateMatch = theme.savedAt?.toLowerCase().includes(searchLower);
      return colorMatch || dateMatch;
    });
  }

  filteredThemes = themes.sort((a, b) =>
    new Date(b.savedAt) - new Date(a.savedAt)
  );

  displayThemes();
}

// Display themes list
function displayThemes() {
  if (filteredThemes.length === 0) {
    themesList.innerHTML = '';
    emptyThemes.classList.remove('hidden');
    return;
  }

  emptyThemes.classList.add('hidden');

  themesList.innerHTML = filteredThemes.map(theme => {
    const colors = theme.colors?.slice(0, 6) || [];
    const date = formatDate(theme.savedAt);
    const colorSwatches = colors.map(color => `
      <div class="theme-card-color"
           style="background-color: ${color}"
           title="${color}">
      </div>
    `).join('');

    return `
      <div class="theme-card" data-theme-id="${theme.id}" onclick="showThemePreview(${theme.id})">
        <div class="theme-card-header">
          <span class="theme-card-title">Theme #${theme.id}</span>
          <span class="theme-card-date">${date}</span>
        </div>
        <div class="theme-card-colors">
          ${colorSwatches}
        </div>
        <div class="theme-card-actions" onclick="event.stopPropagation()">
          <button class="card-action-btn" onclick="applyTheme(${theme.id})">
            적용
          </button>
          <button class="card-action-btn" onclick="copyThemeCSS(${theme.id})">
            복사
          </button>
          <button class="card-action-btn danger" onclick="deleteTheme(${theme.id})">
            삭제
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Show theme preview modal
window.showThemePreview = function(themeId) {
  const theme = allThemes.find(t => t.id === themeId);
  if (!theme) return;

  selectedPreviewTheme = theme;

  const colors = theme.colors || [];
  const colorPalette = colors.map((color, index) => {
    const contrast = calculateContrastRatio(color, '#ffffff');
    const contrastPass = contrast >= 4.5;

    return `
      <div style="margin-bottom: 16px;">
        <div class="color-swatch"
             style="background-color: ${color}; width: 100%; height: 80px;"
             data-color="${color}"
             onclick="copyColor('${color}')">
        </div>
        <div class="color-details" style="margin-top: 8px;">
          <div class="detail-row">
            <span class="detail-label">HEX</span>
            <span class="detail-value">${color}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">RGB</span>
            <span class="detail-value">${hexToRgb(color)}</span>
          </div>
          <div class="contrast-info">
            <span class="detail-label">명암비</span>
            <span class="contrast-badge ${contrastPass ? 'pass' : 'fail'}">
              ${contrast.toFixed(2)} ${contrastPass ? 'PASS' : 'FAIL'}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  previewTitle.textContent = `Theme #${theme.id}`;
  previewBody.innerHTML = `
    <div class="detail-row" style="margin-bottom: 16px;">
      <span class="detail-label">생성일</span>
      <span class="detail-value">${formatDate(theme.savedAt)}</span>
    </div>
    <div class="detail-row" style="margin-bottom: 20px;">
      <span class="detail-label">색상 수</span>
      <span class="detail-value">${colors.length}개</span>
    </div>
    ${colorPalette}
  `;

  previewModal.classList.remove('hidden');
};

// Close preview modal
function closePreview() {
  previewModal.classList.add('hidden');
  selectedPreviewTheme = null;
}

// Apply theme from preview
async function applyPreviewTheme() {
  if (!selectedPreviewTheme) return;
  await applyTheme(selectedPreviewTheme.id);
  closePreview();
}

// Copy CSS from preview
async function copyPreviewCSS() {
  if (!selectedPreviewTheme) return;
  await copyThemeCSS(selectedPreviewTheme.id);
}

// Delete theme from preview
async function deletePreviewTheme() {
  if (!selectedPreviewTheme) return;
  await deleteTheme(selectedPreviewTheme.id);
  closePreview();
}

// Apply theme to current page
window.applyTheme = async function(themeId) {
  const theme = allThemes.find(t => t.id === themeId);
  if (!theme) return;

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'APPLY_THEME',
      data: theme
    });

    if (response.success) {
      showToast('테마가 현재 페이지에 적용되었습니다', 'success');
      currentTheme = theme;
      displayCurrentTheme(theme);
      await chrome.storage.local.set({ currentTheme: theme });
    } else {
      showToast('테마 적용 실패: ' + (response.error || '알 수 없는 오류'), 'error');
    }
  } catch (error) {
    console.error('Apply theme error:', error);
    showToast('테마 적용 중 오류가 발생했습니다', 'error');
  }
};

// Apply current theme
window.applyCurrentTheme = async function() {
  if (!currentTheme) {
    showToast('적용할 테마가 없습니다', 'warning');
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'APPLY_THEME',
      data: currentTheme
    });

    if (response.success) {
      showToast('테마가 현재 페이지에 적용되었습니다', 'success');
    } else {
      showToast('테마 적용 실패', 'error');
    }
  } catch (error) {
    console.error('Apply current theme error:', error);
    showToast('테마 적용 중 오류가 발생했습니다', 'error');
  }
};

// Copy theme CSS
window.copyThemeCSS = async function(themeId) {
  const theme = allThemes.find(t => t.id === themeId);
  if (!theme) return;

  const css = generateCSS(theme);
  await copyToClipboard(css);
  showToast('CSS가 클립보드에 복사되었습니다', 'success');
};

// Copy current theme CSS
window.copyCurrentCSS = async function() {
  if (!currentTheme) {
    showToast('복사할 테마가 없습니다', 'warning');
    return;
  }

  const css = generateCSS(currentTheme);
  await copyToClipboard(css);
  showToast('CSS가 클립보드에 복사되었습니다', 'success');
};

// Generate CSS from theme
function generateCSS(theme) {
  const colors = theme.colors || [];

  let css = ':root {\n';
  colors.forEach((color, index) => {
    css += `  --color-${index + 1}: ${color};\n`;
  });

  if (colors.length >= 6) {
    css += `  /* Semantic Colors */\n`;
    css += `  --primary: ${colors[0]};\n`;
    css += `  --secondary: ${colors[1]};\n`;
    css += `  --accent: ${colors[2]};\n`;
    css += `  --background: ${colors[3]};\n`;
    css += `  --surface: ${colors[4]};\n`;
    css += `  --text: ${colors[5]};\n`;
  }

  css += '}';
  return css;
}

// Delete theme
window.deleteTheme = async function(themeId) {
  if (!confirm('이 테마를 삭제하시겠습니까?')) return;

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'DELETE_THEME',
      data: { id: themeId }
    });

    if (response.success) {
      showToast('테마가 삭제되었습니다', 'success');
      await loadThemes();
    } else {
      showToast('테마 삭제 실패', 'error');
    }
  } catch (error) {
    console.error('Delete theme error:', error);
    showToast('테마 삭제 중 오류가 발생했습니다', 'error');
  }
};

// Save current theme to history
window.saveCurrentTheme = async function() {
  if (!currentTheme) {
    showToast('저장할 테마가 없습니다', 'warning');
    return;
  }

  try {
    // Check if already saved
    const existingTheme = allThemes.find(t =>
      JSON.stringify(t.colors) === JSON.stringify(currentTheme.colors)
    );

    if (existingTheme) {
      showToast('이미 저장된 테마입니다', 'info');
      return;
    }

    const response = await chrome.runtime.sendMessage({
      type: 'SAVE_THEME',
      data: currentTheme
    });

    if (response.success) {
      showToast('테마가 저장되었습니다', 'success');
      await loadThemes();
    } else {
      showToast('테마 저장 실패', 'error');
    }
  } catch (error) {
    console.error('Save theme error:', error);
    showToast('테마 저장 중 오류가 발생했습니다', 'error');
  }
};

// Copy color to clipboard
window.copyColor = async function(color) {
  await copyToClipboard(color);
  showToast(`${color} 복사됨`, 'success');
};

// Capture current page
async function captureCurrentPage() {
  try {
    captureBtn.innerHTML = '<span class="loading"></span>';
    captureBtn.disabled = true;

    const captureResponse = await chrome.runtime.sendMessage({ type: 'CAPTURE_TAB' });

    if (captureResponse.success) {
      const extractResponse = await chrome.runtime.sendMessage({
        type: 'EXTRACT_THEME',
        data: { imageBase64: captureResponse.imageBase64 }
      });

      if (extractResponse.success) {
        currentTheme = extractResponse.theme;
        displayCurrentTheme(currentTheme);
        showToast('테마가 추출되었습니다', 'success');
      } else {
        showToast('테마 추출 실패: ' + (extractResponse.error || '알 수 없는 오류'), 'error');
      }
    } else {
      showToast('페이지 캡처 실패', 'error');
    }
  } catch (error) {
    console.error('Capture error:', error);
    showToast('페이지 캡처 중 오류가 발생했습니다', 'error');
  } finally {
    captureBtn.innerHTML = '📸';
    captureBtn.disabled = false;
  }
}

// Refresh themes
async function refreshThemes() {
  refreshBtn.innerHTML = '<span class="loading"></span>';
  refreshBtn.disabled = true;

  await loadThemes();
  await loadCurrentTheme();

  refreshBtn.innerHTML = '🔄';
  refreshBtn.disabled = false;

  showToast('새로고침 완료', 'success');
}

// Handle search
function handleSearch(e) {
  searchQuery = e.target.value.trim();
  clearSearchBtn.classList.toggle('hidden', !searchQuery);
  applyFiltersAndSearch();
}

// Clear search
function clearSearch() {
  searchInput.value = '';
  searchQuery = '';
  clearSearchBtn.classList.add('hidden');
  applyFiltersAndSearch();
}

// Handle filter change
function handleFilterChange(filter) {
  currentFilter = filter;

  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  applyFiltersAndSearch();
}

// Update theme count
function updateThemeCount() {
  themeCount.textContent = allThemes.length;
}

// Handle storage changes
function handleStorageChange(changes, areaName) {
  if (areaName === 'local') {
    if (changes.themes) {
      loadThemes();
    }
    if (changes.currentTheme) {
      loadCurrentTheme();
    }
  }
}

// Open popup (extension action)
function openPopup() {
  // Get current window and open popup
  chrome.action.openPopup();
}

// Open options page
function openOptions() {
  chrome.runtime.openOptionsPage();
}

// Utility: Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

// Utility: Format date
function formatDate(dateString) {
  if (!dateString) return '날짜 없음';

  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Utility: Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 'Invalid';

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgb(${r}, ${g}, ${b})`;
}

// Utility: Calculate contrast ratio
function calculateContrastRatio(color1, color2) {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Utility: Get relative luminance
function getRelativeLuminance(hex) {
  const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!rgb) return 0;

  const r = parseInt(rgb[1], 16) / 255;
  const g = parseInt(rgb[2], 16) / 255;
  const b = parseInt(rgb[3], 16) / 255;

  const [rs, gs, bs] = [r, g, b].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Show toast notification
function showToast(message, type = 'info') {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Log initialization
console.log('AI Spaghetti Side Panel initialized');

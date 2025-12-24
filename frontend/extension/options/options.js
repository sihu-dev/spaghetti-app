// Options Page Script
document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadSettings();
  await loadSavedThemes();
  setupEventListeners();
}

function setupEventListeners() {
  document.getElementById('autoApply').addEventListener('change', saveSettings);
  document.getElementById('notifications').addEventListener('change', saveSettings);
  document.getElementById('apiUrl').addEventListener('change', saveSettings);
  document.getElementById('extensionTheme').addEventListener('change', saveSettings);
  
  document.getElementById('exportData').addEventListener('click', exportData);
  document.getElementById('importData').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', importData);
  document.getElementById('clearData').addEventListener('click', clearAllData);
}

async function loadSettings() {
  const result = await chrome.storage.local.get('settings');
  const settings = result.settings || {};
  
  document.getElementById('autoApply').checked = settings.autoApplyTheme || false;
  document.getElementById('notifications').checked = settings.notificationsEnabled !== false;
  document.getElementById('apiUrl').value = settings.apiUrl || 'http://localhost:3000/api';
  document.getElementById('extensionTheme').value = settings.theme || 'dark';
}

async function saveSettings() {
  const settings = {
    autoApplyTheme: document.getElementById('autoApply').checked,
    notificationsEnabled: document.getElementById('notifications').checked,
    apiUrl: document.getElementById('apiUrl').value,
    theme: document.getElementById('extensionTheme').value
  };
  
  await chrome.storage.local.set({ settings });
}

async function loadSavedThemes() {
  const result = await chrome.storage.local.get('themes');
  const themes = result.themes || [];
  const container = document.getElementById('savedThemes');
  
  if (themes.length === 0) {
    container.innerHTML = '<p class="empty-message">저장된 테마가 없습니다.</p>';
    return;
  }
  
  container.innerHTML = themes.map(theme => `
    <div class="theme-card" data-id="${theme.id}">
      <div class="theme-colors">
        ${(theme.colors || []).slice(0, 5).map(c => `<div class="theme-color" style="background:${c}"></div>`).join('')}
      </div>
      <div class="theme-actions">
        <button onclick="applyTheme(${theme.id})">적용</button>
        <button onclick="deleteTheme(${theme.id})">삭제</button>
      </div>
    </div>
  `).join('');
}

window.applyTheme = async function(id) {
  const result = await chrome.storage.local.get('themes');
  const theme = (result.themes || []).find(t => t.id === id);
  if (theme) {
    await chrome.storage.local.set({ currentTheme: theme });
    alert('테마가 적용되었습니다!');
  }
};

window.deleteTheme = async function(id) {
  if (!confirm('이 테마를 삭제하시겠습니까?')) return;
  
  const result = await chrome.storage.local.get('themes');
  const themes = (result.themes || []).filter(t => t.id !== id);
  await chrome.storage.local.set({ themes });
  await loadSavedThemes();
};

async function exportData() {
  const data = await chrome.storage.local.get(null);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-spaghetti-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

async function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    await chrome.storage.local.set(data);
    await loadSettings();
    await loadSavedThemes();
    alert('데이터를 성공적으로 가져왔습니다!');
  } catch (error) {
    alert('데이터 가져오기 실패: ' + error.message);
  }
}

async function clearAllData() {
  if (!confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
  
  await chrome.storage.local.clear();
  await loadSettings();
  await loadSavedThemes();
  alert('모든 데이터가 삭제되었습니다.');
}

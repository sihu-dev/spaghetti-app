// AI Spaghetti Chrome Extension - Service Worker (Manifest V3)
// 이벤트 기반 백그라운드 스크립트

const API_BASE_URL = 'http://localhost:3000/api';

// 확장 프로그램 설치 시 초기화
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('AI Spaghetti Extension installed:', details.reason);
  
  // 기본 설정 저장
  if (details.reason === 'install') {
    await chrome.storage.local.set({
      settings: {
        autoApplyTheme: false,
        notificationsEnabled: true,
        apiUrl: API_BASE_URL,
        theme: 'dark'
      },
      themes: [],
      currentTheme: null
    });
    
    // 옵션 페이지 열기
    chrome.runtime.openOptionsPage();
  }
  
  // Side Panel 설정
  await setupSidePanel();
});

// Side Panel 설정
async function setupSidePanel() {
  try {
    await chrome.sidePanel.setOptions({
      enabled: true
    });
  } catch (error) {
    console.error('Side panel setup error:', error);
  }
}

// 메시지 리스너 (팝업, 컨텐츠 스크립트와 통신)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true; // 비동기 응답을 위해 true 반환
});

// 메시지 핸들러
async function handleMessage(message, sender) {
  switch (message.type) {
    case 'EXTRACT_THEME':
      return await extractThemeFromImage(message.data);
    
    case 'APPLY_THEME':
      return await applyThemeToTab(message.data, sender.tab?.id);
    
    case 'SAVE_THEME':
      return await saveTheme(message.data);
    
    case 'GET_THEMES':
      return await getSavedThemes();
    
    case 'DELETE_THEME':
      return await deleteTheme(message.data.id);
    
    case 'GET_SETTINGS':
      return await getSettings();
    
    case 'UPDATE_SETTINGS':
      return await updateSettings(message.data);
    
    case 'CAPTURE_TAB':
      return await captureCurrentTab();
    
    default:
      return { success: false, error: 'Unknown message type' };
  }
}

// 이미지에서 테마 추출
async function extractThemeFromImage(data) {
  try {
    const formData = new FormData();
    
    if (data.imageFile) {
      formData.append('image', data.imageFile);
    } else if (data.imageUrl) {
      formData.append('imageUrl', data.imageUrl);
    } else if (data.imageBase64) {
      // Base64 이미지를 Blob으로 변환
      const blob = await base64ToBlob(data.imageBase64);
      formData.append('image', blob, 'screenshot.png');
    }
    
    const response = await fetch(`${API_BASE_URL}/theme/extract`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      // 현재 테마로 저장
      await chrome.storage.local.set({ currentTheme: result.data });
      return { success: true, theme: result.data };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Extract theme error:', error);
    return { success: false, error: error.message };
  }
}

// 탭에 테마 적용
async function applyThemeToTab(theme, tabId) {
  try {
    if (!tabId) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      tabId = tab.id;
    }
    
    await chrome.scripting.executeScript({
      target: { tabId },
      func: injectThemeToPage,
      args: [theme]
    });
    
    return { success: true };
  } catch (error) {
    console.error('Apply theme error:', error);
    return { success: false, error: error.message };
  }
}

// 페이지에 테마 CSS 주입
function injectThemeToPage(theme) {
  const styleId = 'ai-spaghetti-theme';
  let styleEl = document.getElementById(styleId);
  
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  
  const colors = theme.colors || [];
  const css = `
    :root {
      --ai-spaghetti-primary: ${colors[0] || '#6366f1'};
      --ai-spaghetti-secondary: ${colors[1] || '#8b5cf6'};
      --ai-spaghetti-accent: ${colors[2] || '#06b6d4'};
      --ai-spaghetti-background: ${colors[3] || '#0f172a'};
      --ai-spaghetti-surface: ${colors[4] || '#1e293b'};
      --ai-spaghetti-text: ${colors[5] || '#f8fafc'};
    }
  `;
  
  styleEl.textContent = css;
}

// 테마 저장
async function saveTheme(theme) {
  try {
    const result = await chrome.storage.local.get('themes');
    const themes = result.themes || [];
    
    theme.id = Date.now();
    theme.savedAt = new Date().toISOString();
    
    themes.push(theme);
    await chrome.storage.local.set({ themes });
    
    return { success: true, theme };
  } catch (error) {
    console.error('Save theme error:', error);
    return { success: false, error: error.message };
  }
}

// 저장된 테마 목록 가져오기
async function getSavedThemes() {
  try {
    const result = await chrome.storage.local.get('themes');
    return { success: true, themes: result.themes || [] };
  } catch (error) {
    console.error('Get themes error:', error);
    return { success: false, error: error.message };
  }
}

// 테마 삭제
async function deleteTheme(id) {
  try {
    const result = await chrome.storage.local.get('themes');
    const themes = (result.themes || []).filter(t => t.id !== id);
    await chrome.storage.local.set({ themes });
    
    return { success: true };
  } catch (error) {
    console.error('Delete theme error:', error);
    return { success: false, error: error.message };
  }
}

// 설정 가져오기
async function getSettings() {
  try {
    const result = await chrome.storage.local.get('settings');
    return { success: true, settings: result.settings || {} };
  } catch (error) {
    console.error('Get settings error:', error);
    return { success: false, error: error.message };
  }
}

// 설정 업데이트
async function updateSettings(newSettings) {
  try {
    const result = await chrome.storage.local.get('settings');
    const settings = { ...result.settings, ...newSettings };
    await chrome.storage.local.set({ settings });
    
    return { success: true, settings };
  } catch (error) {
    console.error('Update settings error:', error);
    return { success: false, error: error.message };
  }
}

// 현재 탭 캡처
async function captureCurrentTab() {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    return { success: true, imageBase64: dataUrl };
  } catch (error) {
    console.error('Capture tab error:', error);
    return { success: false, error: error.message };
  }
}

// Base64를 Blob으로 변환
async function base64ToBlob(base64) {
  const response = await fetch(base64);
  return await response.blob();
}

// 컨텍스트 메뉴 설정
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'extractFromImage',
    title: '이 이미지에서 테마 추출',
    contexts: ['image']
  });
  
  chrome.contextMenus.create({
    id: 'extractFromPage',
    title: '현재 페이지에서 테마 추출',
    contexts: ['page']
  });
});

// 컨텍스트 메뉴 클릭 핸들러
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'extractFromImage' && info.srcUrl) {
    const result = await extractThemeFromImage({ imageUrl: info.srcUrl });
    if (result.success) {
      // 알림 표시
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'AI Spaghetti',
        message: '이미지에서 테마가 추출되었습니다!'
      });
    }
  } else if (info.menuItemId === 'extractFromPage') {
    const result = await captureCurrentTab();
    if (result.success) {
      await extractThemeFromImage({ imageBase64: result.imageBase64 });
    }
  }
});

// 키보드 단축키 핸들러
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'extract-theme') {
    const result = await captureCurrentTab();
    if (result.success) {
      await extractThemeFromImage({ imageBase64: result.imageBase64 });
    }
  }
});

console.log('AI Spaghetti Service Worker initialized');

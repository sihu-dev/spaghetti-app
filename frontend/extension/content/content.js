// AI Spaghetti - Content Script
// 웹 페이지에 주입되어 테마를 적용하는 스크립트

(function() {
  'use strict';
  
  // 이미 로드되었는지 확인
  if (window.__aiSpaghettiLoaded) return;
  window.__aiSpaghettiLoaded = true;
  
  console.log('AI Spaghetti Content Script loaded');
  
  // 메시지 리스너
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'INJECT_THEME':
        injectTheme(message.data);
        sendResponse({ success: true });
        break;
      
      case 'REMOVE_THEME':
        removeTheme();
        sendResponse({ success: true });
        break;
      
      case 'GET_PAGE_COLORS':
        sendResponse({ success: true, colors: extractPageColors() });
        break;
    }
    return true;
  });
  
  // 테마 주입
  function injectTheme(theme) {
    const styleId = 'ai-spaghetti-injected-theme';
    let styleEl = document.getElementById(styleId);
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    const colors = theme.colors || [];
    
    styleEl.textContent = `
      :root {
        --ai-spaghetti-primary: ${colors[0] || '#6366f1'} !important;
        --ai-spaghetti-secondary: ${colors[1] || '#8b5cf6'} !important;
        --ai-spaghetti-accent: ${colors[2] || '#06b6d4'} !important;
        --ai-spaghetti-background: ${colors[3] || '#0f172a'} !important;
        --ai-spaghetti-surface: ${colors[4] || '#1e293b'} !important;
        --ai-spaghetti-text: ${colors[5] || '#f8fafc'} !important;
      }
      
      /* AI Spaghetti 테마 적용 (선택적) */
      body.ai-spaghetti-theme-applied {
        background-color: var(--ai-spaghetti-background) !important;
        color: var(--ai-spaghetti-text) !important;
      }
      
      body.ai-spaghetti-theme-applied a {
        color: var(--ai-spaghetti-primary) !important;
      }
      
      body.ai-spaghetti-theme-applied button,
      body.ai-spaghetti-theme-applied .btn {
        background-color: var(--ai-spaghetti-primary) !important;
        color: white !important;
      }
    `;
    
    // 테마 적용 플래그
    document.body.classList.add('ai-spaghetti-theme-applied');
    
    // 커스텀 이벤트 발생
    window.dispatchEvent(new CustomEvent('ai-spaghetti-theme-changed', { 
      detail: theme 
    }));
  }
  
  // 테마 제거
  function removeTheme() {
    const styleEl = document.getElementById('ai-spaghetti-injected-theme');
    if (styleEl) {
      styleEl.remove();
    }
    document.body.classList.remove('ai-spaghetti-theme-applied');
    
    window.dispatchEvent(new CustomEvent('ai-spaghetti-theme-removed'));
  }
  
  // 페이지에서 색상 추출
  function extractPageColors() {
    const colors = new Set();
    
    // 계산된 스타일에서 색상 추출
    const elements = document.querySelectorAll('*');
    const sampleSize = Math.min(elements.length, 100);
    
    for (let i = 0; i < sampleSize; i++) {
      const el = elements[Math.floor(Math.random() * elements.length)];
      const style = window.getComputedStyle(el);
      
      const bgColor = style.backgroundColor;
      const textColor = style.color;
      const borderColor = style.borderColor;
      
      [bgColor, textColor, borderColor].forEach(color => {
        if (color && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') {
          const hex = rgbToHex(color);
          if (hex) colors.add(hex);
        }
      });
    }
    
    return Array.from(colors).slice(0, 10);
  }
  
  // RGB를 HEX로 변환
  function rgbToHex(rgb) {
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return null;
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
  
  // 저장된 테마 자동 적용
  async function autoApplyTheme() {
    try {
      const result = await chrome.storage.local.get(['settings', 'currentTheme']);
      
      if (result.settings?.autoApplyTheme && result.currentTheme) {
        injectTheme(result.currentTheme);
      }
    } catch (error) {
      console.error('Auto apply theme error:', error);
    }
  }
  
  // 초기화
  autoApplyTheme();
})();

// ================================================================
//  虚拟手机扩展 - 可拖动窗口 + 内嵌 rphone.html
//  仓库: https://github.com/isabellabutler10874-max/myphone
// ================================================================

// 设备检测
const IS_TOUCH_DEVICE = window.matchMedia('(hover: none) and (pointer: coarse)').matches
                     || /Android|iPhone|iPod/i.test(navigator.userAgent);

// 注入样式（悬浮按钮 + 可拖动手机窗口）
const CSS = `
#rp-fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 2147483647;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255,255,255,.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0,0,0,.1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  overflow: hidden;
  cursor: grab;
  box-shadow: 0 4px 24px rgba(0,0,0,.18);
  transition: transform .15s;
  user-select: none;
  touch-action: none;
}
#rp-fab:hover { transform: scale(1.1); }
#rp-fab svg { width: 100%; height: 100%; display: block; }

/* 手机窗口容器 */
#rp-phone-window {
  position: fixed;
  z-index: 10000;
  width: 390px;
  height: 700px;
  background: #000;
  border-radius: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  display: none;
  overflow: hidden;
  resize: both;
  min-width: 300px;
  min-height: 500px;
  /* 默认位置由 JS 设置 */
}

/* 标题栏（用于拖动窗口） */
#rp-window-header {
  height: 36px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  cursor: move;
  user-select: none;
  border-bottom: 1px solid rgba(255,255,255,0.2);
}
#rp-window-title {
  color: white;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
}
#rp-window-close {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: background .15s;
}
#rp-window-close:hover { background: rgba(255,80,80,0.8); }

/* iframe 填满剩余空间 */
#rp-phone-iframe {
  width: 100%;
  height: calc(100% - 36px);
  border: none;
  display: block;
}

/* 右下角调整大小把手（可选） */
#rp-resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  cursor: nwse-resize;
  z-index: 10;
}

/* 手机端适配 */
@media (max-width: 768px) {
  #rp-fab {
    width: 42px; height: 42px;
    right: 12px; bottom: 12px;
  }
  #rp-phone-window {
    width: 320px; height: 640px;
  }
}
`;

function injectStyles() {
  if (document.getElementById('rp-phone-css')) return;
  const style = document.createElement('style');
  style.id = 'rp-phone-css';
  style.textContent = CSS;
  document.head.appendChild(style);
}

// 创建 UI
function createUI() {
  // 悬浮按钮
  const fab = document.createElement('div');
  fab.id = 'rp-fab';
  fab.innerHTML = `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="3" width="32" height="42" rx="6" fill="#fff" stroke="#e0e0e0" stroke-width="1.5"/>
      <rect x="11" y="7" width="26" height="30" rx="3" fill="#f0f4ff"/>
      <circle cx="24" cy="41" r="2.2" fill="#c8c8d0"/>
      <rect x="19" y="5" width="10" height="2" rx="1" fill="#d0d0d8"/>
      <rect x="13" y="10" width="22" height="14" rx="2" fill="#7c9fff" opacity=".7"/>
      <rect x="13" y="27" width="10" height="3" rx="1.5" fill="#b0bcff"/>
      <rect x="25" y="27" width="10" height="3" rx="1.5" fill="#ffa0b4"/>
      <rect x="13" y="32" width="22" height="3" rx="1.5" fill="#e0e0e8"/>
    </svg>
  `;
  document.body.appendChild(fab);

  // 可拖动窗口
  const win = document.createElement('div');
  win.id = 'rp-phone-window';
  win.innerHTML = `
    <div id="rp-window-header">
      <span id="rp-window-title">📱 我的小手机</span>
      <div id="rp-window-close">✕</div>
    </div>
    <iframe id="rp-phone-iframe" allow="clipboard-write"></iframe>
    <div id="rp-resize-handle"></div>
  `;
  document.body.appendChild(win);

  return {
    fab,
    win,
    iframe: win.querySelector('#rp-phone-iframe'),
    header: win.querySelector('#rp-window-header'),
    closeBtn: win.querySelector('#rp-window-close'),
    resizeHandle: win.querySelector('#rp-resize-handle')
  };
}

// 使元素可拖动（通过标题栏）
function makeDraggable(element, handle) {
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let newLeft = startLeft + dx;
    let newTop = startTop + dy;
    // 边界限制（保留一部分在屏幕内）
    const winW = element.offsetWidth;
    const winH = element.offsetHeight;
    newLeft = Math.max(-winW + 50, Math.min(window.innerWidth - 50, newLeft));
    newTop = Math.max(0, Math.min(window.innerHeight - 40, newTop));
    element.style.left = newLeft + 'px';
    element.style.top = newTop + 'px';
    element.style.right = 'auto';
    element.style.bottom = 'auto';
  };

  const onMouseUp = () => {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    handle.style.cursor = 'move';
  };

  handle.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = element.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    isDragging = true;
    handle.style.cursor = 'grabbing';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // 触摸支持
  handle.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const rect = element.getBoundingClientRect();
    startX = touch.clientX;
    startY = touch.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    isDragging = true;
    const onTouchMove = (e2) => {
      if (!isDragging) return;
      e2.preventDefault();
      const touch2 = e2.touches[0];
      const dx = touch2.clientX - startX;
      const dy = touch2.clientY - startY;
      let newLeft = startLeft + dx;
      let newTop = startTop + dy;
      const winW = element.offsetWidth;
      const winH = element.offsetHeight;
      newLeft = Math.max(-winW + 50, Math.min(window.innerWidth - 50, newLeft));
      newTop = Math.max(0, Math.min(window.innerHeight - 40, newTop));
      element.style.left = newLeft + 'px';
      element.style.top = newTop + 'px';
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    };
    const onTouchEnd = () => {
      isDragging = false;
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  }, { passive: false });
}

// 使悬浮按钮可拖动
function makeFabDraggable(fab) {
  let dragging = false, startX, startY, startLeft, startTop;
  const onMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;
    const dx = clientX - startX;
    const dy = clientY - startY;
    let newLeft = startLeft + dx;
    let newTop = startTop + dy;
    newLeft = Math.max(0, Math.min(window.innerWidth - fab.offsetWidth, newLeft));
    newTop = Math.max(0, Math.min(window.innerHeight - fab.offsetHeight, newTop));
    fab.style.left = newLeft + 'px';
    fab.style.top = newTop + 'px';
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';
  };
  const onEnd = () => {
    dragging = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
  };
  fab.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = fab.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    dragging = true;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
  });
  fab.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const rect = fab.getBoundingClientRect();
    startX = touch.clientX;
    startY = touch.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    dragging = true;
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  });
}

// 窗口大小调整（简单实现）
function makeResizable(win, handle) {
  let isResizing = false;
  let startX, startY, startWidth, startHeight;

  const onMouseMove = (e) => {
    if (!isResizing) return;
    e.preventDefault();
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const newWidth = Math.max(300, startWidth + dx);
    const newHeight = Math.max(500, startHeight + dy);
    win.style.width = newWidth + 'px';
    win.style.height = newHeight + 'px';
  };

  const onMouseUp = () => {
    isResizing = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    startX = e.clientX;
    startY = e.clientY;
    startWidth = win.offsetWidth;
    startHeight = win.offsetHeight;
    isResizing = true;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

// 初始化
async function init() {
  injectStyles();
  const { fab, win, iframe, header, closeBtn, resizeHandle } = createUI();

  // 设置初始位置（右下角）
  win.style.left = (window.innerWidth - 390 - 20) + 'px';
  win.style.top = (window.innerHeight - 700 - 20) + 'px';

  // 拖动功能
  makeDraggable(win, header);
  makeFabDraggable(fab);
  makeResizable(win, resizeHandle);

  // 你的 GitHub Pages 地址
  const PHONE_URL = 'https://isabellabutler10874-max.github.io/myphone/rphone.html';

  let iframeLoaded = false;

  // 点击悬浮按钮打开/关闭窗口
  fab.addEventListener('click', (e) => {
    if (e.defaultPrevented) return; // 防止拖动触发
    if (win.style.display === 'none' || !win.style.display) {
      if (!iframeLoaded) {
        iframe.src = PHONE_URL;
        iframeLoaded = true;
      }
      win.style.display = 'block';
    } else {
      win.style.display = 'none';
    }
  });

  // 关闭按钮
  closeBtn.addEventListener('click', () => {
    win.style.display = 'none';
  });

  console.log('📱 虚拟手机（可拖动窗口版）已加载');
}

// 启动
jQuery(() => init());

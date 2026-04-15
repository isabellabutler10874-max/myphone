// ================================================================
//  虚拟手机扩展 - 纯透明可拖动窗口 + 始终可见悬浮球
// ================================================================

const IS_TOUCH_DEVICE = window.matchMedia('(hover: none) and (pointer: coarse)').matches
                     || /Android|iPhone|iPod/i.test(navigator.userAgent);

// 极简样式：悬浮球 + 完全透明的手机容器 + 透明拖动把手
const CSS = `
/* 悬浮球 - 强制右下角，无视任何 transform */
#rp-fab {
  position: fixed !important;
  right: 20px !important;
  bottom: 20px !important;
  left: auto !important;
  top: auto !important;
  z-index: 2147483647 !important;
  width: 52px !important;
  height: 52px !important;
  border-radius: 50% !important;
  background: rgba(255,255,255,0.95) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(0,0,0,0.1) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 6px !important;
  overflow: hidden !important;
  cursor: grab !important;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18) !important;
  transition: transform 0.15s !important;
  user-select: none !important;
  touch-action: none !important;
}
#rp-fab:hover { transform: scale(1.1) !important; }
#rp-fab svg { width: 100% !important; height: 100% !important; display: block !important; }

/* 手机容器 - 完全透明，无背景，无边框，无阴影 */
#rp-phone-host {
  position: fixed !important;
  z-index: 10000 !important;
  width: 390px;
  height: 650px;
  display: none;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  pointer-events: none;
}

/* iframe 填满，背景透明 */
#rp-phone-iframe {
  width: 100% !important;
  height: 100% !important;
  border: none !important;
  background: transparent !important;
  pointer-events: auto;
}

/* 透明拖动把手 - 覆盖灵动岛区域 */
#rp-drag-handle {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 60px !important;
  cursor: move !important;
  pointer-events: auto !important;
  background: transparent !important;
  z-index: 10 !important;
}

/* 手机端适配 */
@media (max-width: 768px) {
  #rp-fab {
    width: 42px !important; height: 42px !important;
    right: 12px !important; bottom: 12px !important;
  }
  #rp-phone-host {
    width: 320px;
    height: 533px;
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

function createUI() {
  // 悬浮球
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

  // 手机宿主容器
  const host = document.createElement('div');
  host.id = 'rp-phone-host';
  host.innerHTML = `
    <div id="rp-drag-handle" title="按住拖动手机"></div>
    <iframe id="rp-phone-iframe" allow="clipboard-write"></iframe>
  `;
  document.body.appendChild(host);

  return {
    fab,
    host,
    iframe: host.querySelector('#rp-phone-iframe'),
    dragHandle: host.querySelector('#rp-drag-handle')
  };
}

// 拖动窗口
function makeWindowDraggable(win, handle) {
  let dragging = false, startX, startY, startLeft, startTop;

  const onMouseMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let newLeft = startLeft + dx;
    let newTop = startTop + dy;
    win.style.left = newLeft + 'px';
    win.style.top = newTop + 'px';
  };

  const onMouseUp = () => {
    dragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  const startDrag = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = win.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    dragging = true;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  handle.addEventListener('mousedown', startDrag);

  // 触摸事件
  const startDragTouch = (e) => {
    const touch = e.touches[0];
    const rect = win.getBoundingClientRect();
    startX = touch.clientX;
    startY = touch.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    dragging = true;
    const onTouchMove = (e2) => {
      if (!dragging) return;
      e2.preventDefault();
      const touch2 = e2.touches[0];
      const dx = touch2.clientX - startX;
      const dy = touch2.clientY - startY;
      let newLeft = startLeft + dx;
      let newTop = startTop + dy;
      win.style.left = newLeft + 'px';
      win.style.top = newTop + 'px';
    };
    const onTouchEnd = () => {
      dragging = false;
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  };

  handle.addEventListener('touchstart', startDragTouch, { passive: false });
}

// 悬浮球可拖动（位置会被保存）
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
    localStorage.setItem('rp_fab_pos', JSON.stringify({ left: fab.style.left, top: fab.style.top }));
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

// 恢复悬浮球位置（竖屏也永远可见）
function fixFabPosition(fab) {
  const saved = localStorage.getItem('rp_fab_pos');
  if (saved) {
    try {
      const { left, top } = JSON.parse(saved);
      fab.style.left = left;
      fab.style.top = top;
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
      return;
    } catch(e) {}
  }
  // 默认右下角
  fab.style.right = '20px';
  fab.style.bottom = '20px';
  fab.style.left = 'auto';
  fab.style.top = 'auto';
}

// 监听来自 iframe 的关闭消息
function setupMessageListener(host) {
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'CLOSE_PHONE') {
      host.style.display = 'none';
    }
  });
}

// 初始化
async function init() {
  injectStyles();
  const { fab, host, iframe, dragHandle } = createUI();

  // 初始位置
  host.style.left = (window.innerWidth - 390 - 20) + 'px';
  host.style.top = (window.innerHeight - 650 - 20) + 'px';

  makeWindowDraggable(host, dragHandle);
  makeFabDraggable(fab);
  fixFabPosition(fab);

  const PHONE_URL = 'https://isabellabutler10874-max.github.io/myphone/rphone.html';
  let iframeLoaded = false;

  fab.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;
    if (host.style.display === 'none' || !host.style.display) {
      if (!iframeLoaded) {
        iframe.src = PHONE_URL;
        iframeLoaded = true;
      }
      host.style.display = 'block';
      if (IS_TOUCH_DEVICE) {
        const w = host.offsetWidth;
        const h = host.offsetHeight;
        host.style.left = `${(window.innerWidth - w) / 2}px`;
        host.style.top = `${(window.innerHeight - h) / 2}px`;
      }
    } else {
      host.style.display = 'none';
    }
  });

  setupMessageListener(host);

  console.log('📱 虚拟手机扩展已加载 - 透明无边框版');
}

jQuery(() => init());

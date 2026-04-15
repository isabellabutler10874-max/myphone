// ================================================================
//  虚拟手机扩展 - 悬浮按钮 + 可拖动窗口（内嵌自定义 rphone.html）
//  仓库: https://github.com/isabellabutler10874-max/myphone
// ================================================================

const IS_TOUCH_DEVICE = window.matchMedia('(hover: none) and (pointer: coarse)').matches
                     || /Android|iPhone|iPod/i.test(navigator.userAgent);

// 样式：仅包含悬浮按钮和窗口容器（无手机外壳）
const CSS = `
#rp-fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 2147483647;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  overflow: hidden;
  cursor: grab;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  transition: transform 0.15s;
  user-select: none;
  touch-action: none;
}
#rp-fab:hover { transform: scale(1.1); }
#rp-fab svg { width: 100%; height: 100%; display: block; }

#rp-phone-window {
  position: fixed;
  z-index: 10000;
  width: 390px;
  height: 650px;  /* 3:5 比例 */
  background: transparent;
  display: none;
  overflow: hidden;
  border-radius: 45px;        /* 与你的 .iphone 保持一致 */
  box-shadow: 0 25px 60px rgba(0,0,0,0.6); /* 给窗口加个阴影，更像漂浮手机 */
  /* 默认位置由 JS 设置 */
}

/* 标题栏（拖动热区） */
#rp-window-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;               /* 覆盖灵动岛区域，方便拖动 */
  background: transparent;
  cursor: move;
  z-index: 10;
  /* 完全透明，不遮挡你的灵动岛 */
}

/* iframe 填满整个窗口 */
#rp-phone-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* 手机端适配 */
@media (max-width: 768px) {
  #rp-fab {
    width: 42px; height: 42px;
  }
  #rp-phone-window {
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

  // 手机窗口容器（无额外外壳）
  const win = document.createElement('div');
  win.id = 'rp-phone-window';
  win.innerHTML = `
    <div id="rp-window-header" title="按住拖动手机"></div>
    <iframe id="rp-phone-iframe" allow="clipboard-write"></iframe>
  `;
  document.body.appendChild(win);

  return {
    fab,
    win,
    iframe: win.querySelector('#rp-phone-iframe'),
    header: win.querySelector('#rp-window-header')
  };
}

// 拖动窗口（通过标题栏）
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
    win.style.right = 'auto';
    win.style.bottom = 'auto';
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
      win.style.right = 'auto';
      win.style.bottom = 'auto';
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

// 悬浮按钮拖动
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

// 修正竖屏悬浮球位置（ST 会动态给 html 加 transform，导致 fixed 失效）
function fixFabPosition(fab) {
  const updatePos = () => {
    if (!IS_TOUCH_DEVICE) return;
    fab.style.left = 'auto';
    fab.style.right = '12px';
    fab.style.bottom = '12px';
    fab.style.top = 'auto';
  };
  updatePos();
  window.addEventListener('resize', updatePos);
  const observer = new MutationObserver(updatePos);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
}

// 监听 iframe 消息（关闭窗口）
function setupMessageListener(win) {
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'CLOSE_PHONE') {
      win.style.display = 'none';
    }
  });
}

// 初始化
async function init() {
  injectStyles();
  const { fab, win, iframe, header } = createUI();

  // 设置初始位置（右下角）
  win.style.left = (window.innerWidth - 390 - 20) + 'px';
  win.style.top = (window.innerHeight - 650 - 20) + 'px';

  makeWindowDraggable(win, header);
  makeFabDraggable(fab);
  fixFabPosition(fab);

  const PHONE_URL = 'https://isabellabutler10874-max.github.io/myphone/rphone.html';
  let iframeLoaded = false;

  fab.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;
    if (win.style.display === 'none' || !win.style.display) {
      if (!iframeLoaded) {
        iframe.src = PHONE_URL;
        iframeLoaded = true;
      }
      win.style.display = 'block';
      if (IS_TOUCH_DEVICE) {
        const w = win.offsetWidth;
        const h = win.offsetHeight;
        win.style.left = `${(window.innerWidth - w) / 2}px`;
        win.style.top = `${(window.innerHeight - h) / 2}px`;
      }
    } else {
      win.style.display = 'none';
    }
  });

  setupMessageListener(win);

  console.log('📱 虚拟手机扩展已加载');
}

jQuery(() => init());

// ================================================================
//  虚拟手机扩展 - 纯透明可拖动窗口 + 可拖动悬浮球（完整修复版）
// ================================================================

const IS_TOUCH_DEVICE = window.matchMedia('(hover: none) and (pointer: coarse)').matches
                     || /Android|iPhone|iPod/i.test(navigator.userAgent);

const CSS = `
/* ===== 悬浮球 - 用 left/top 绝对像素定位，避免 right/bottom 在嵌入环境偏移 ===== */
#rp-fab {
  position: fixed !important;
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
  user-select: none !important;
  touch-action: none !important;
  /* 初始位置 - 用 left/top 计算 */
  right: auto !important;
  bottom: auto !important;
}
#rp-fab:active { cursor: grabbing !important; }
#rp-fab svg { width: 100% !important; height: 100% !important; display: block !important; pointer-events: none !important; }

/* ===== 手机容器 ===== */
#rp-phone-host {
  position: fixed !important;
  z-index: 10000 !important;
  display: none;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  pointer-events: none;
}

#rp-phone-iframe {
  width: 100% !important;
  height: 100% !important;
  border: none !important;
  background: transparent !important;
  pointer-events: auto;
  border-radius: 28px;
}

/* 透明拖动把手 */
#rp-drag-handle {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 50px !important;
  cursor: move !important;
  pointer-events: auto !important;
  background: transparent !important;
  z-index: 10 !important;
}

/* ===== 响应式尺寸 ===== */
@media (min-width: 769px) {
  #rp-phone-host {
    width: 375px;
    height: 625px;
  }
}

@media (max-width: 768px) and (min-width: 481px) {
  #rp-fab {
    width: 46px !important;
    height: 46px !important;
  }
  #rp-phone-host {
    width: 340px;
    height: 567px;
  }
}

@media (max-width: 480px) {
  #rp-fab {
    width: 42px !important;
    height: 42px !important;
  }
  #rp-phone-host {
    width: calc(100vw - 20px);
    height: calc(100vh - 60px);
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

/* ===== 手机窗口拖动 ===== */
function makeWindowDraggable(win, handle) {
  let dragging = false, startX, startY, startLeft, startTop;

  function clampPosition(left, top) {
    return {
      left: Math.max(0, Math.min(window.innerWidth - win.offsetWidth, left)),
      top: Math.max(0, Math.min(window.innerHeight - win.offsetHeight, top))
    };
  }

  handle.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = win.getBoundingClientRect();
    startX = e.clientX; startY = e.clientY;
    startLeft = rect.left; startTop = rect.top;
    dragging = true;

    const onMove = (e2) => {
      if (!dragging) return;
      e2.preventDefault();
      const pos = clampPosition(startLeft + (e2.clientX - startX), startTop + (e2.clientY - startY));
      win.style.left = pos.left + 'px';
      win.style.top = pos.top + 'px';
    };
    const onUp = () => {
      dragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  handle.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const rect = win.getBoundingClientRect();
    startX = touch.clientX; startY = touch.clientY;
    startLeft = rect.left; startTop = rect.top;
    dragging = true;

    const onMove = (e2) => {
      if (!dragging) return;
      e2.preventDefault();
      const t = e2.touches[0];
      const pos = clampPosition(startLeft + (t.clientX - startX), startTop + (t.clientY - startY));
      win.style.left = pos.left + 'px';
      win.style.top = pos.top + 'px';
    };
    const onEnd = () => {
      dragging = false;
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }, { passive: false });
}

/* ===== 悬浮球拖动（区分拖动和点击） ===== */
function makeFabDraggable(fab) {
  let dragging = false, moved = false;
  let startX, startY, startLeft, startTop;

  function clamp(left, top) {
    return {
      left: Math.max(0, Math.min(window.innerWidth - fab.offsetWidth, left)),
      top: Math.max(0, Math.min(window.innerHeight - fab.offsetHeight, top))
    };
  }

  function savePos() {
    localStorage.setItem('rp_fab_pos', JSON.stringify({
      // 保存为相对比例，避免窗口大小变化后超出
      leftRatio: parseFloat(fab.style.left) / window.innerWidth,
      topRatio: parseFloat(fab.style.top) / window.innerHeight
    }));
  }

  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;
    const dx = clientX - startX;
    const dy = clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
    const pos = clamp(startLeft + dx, startTop + dy);
    fab.style.left = pos.left + 'px';
    fab.style.top = pos.top + 'px';
  }

  function onEnd() {
    dragging = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
    if (moved) savePos();
  }

  fab.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = fab.getBoundingClientRect();
    startX = e.clientX; startY = e.clientY;
    startLeft = rect.left; startTop = rect.top;
    dragging = true; moved = false;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
  });

  fab.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const rect = fab.getBoundingClientRect();
    startX = touch.clientX; startY = touch.clientY;
    startLeft = rect.left; startTop = rect.top;
    dragging = true; moved = false;
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }, { passive: true });

  // 暴露 moved 状态
  fab._wasDragged = () => moved;
}

/* ===== 悬浮球位置恢复 ===== */
function fixFabPosition(fab) {
  const saved = localStorage.getItem('rp_fab_pos');
  if (saved) {
    try {
      const { leftRatio, topRatio } = JSON.parse(saved);
      if (typeof leftRatio === 'number' && typeof topRatio === 'number') {
        let l = leftRatio * window.innerWidth;
        let t = topRatio * window.innerHeight;
        l = Math.max(0, Math.min(window.innerWidth - fab.offsetWidth, l));
        t = Math.max(0, Math.min(window.innerHeight - fab.offsetHeight, t));
        fab.style.left = l + 'px';
        fab.style.top = t + 'px';
        return;
      }
    } catch(e) {}
  }
  // 默认右下角
  fab.style.left = (window.innerWidth - fab.offsetWidth - 20) + 'px';
  fab.style.top = (window.innerHeight - fab.offsetHeight - 20) + 'px';
}

/* ===== 监听 iframe 消息 ===== */
function setupMessageListener(host) {
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'CLOSE_PHONE') {
      host.style.display = 'none';
    }
  });
}

/* ===== 初始化 ===== */
async function init() {
  injectStyles();
  const { fab, host, iframe, dragHandle } = createUI();

  makeWindowDraggable(host, dragHandle);
  makeFabDraggable(fab);

  // 等渲染完成后设置位置
  requestAnimationFrame(() => {
    fixFabPosition(fab);
  });

  const PHONE_URL = 'https://isabellabutler10874-max.github.io/myphone/rphone.html';
  let iframeLoaded = false;

  // 点击悬浮球 - 如果是拖动则忽略
  fab.addEventListener('click', (e) => {
    if (fab._wasDragged && fab._wasDragged()) return;
    if (e.defaultPrevented) return;

    if (host.style.display === 'none' || !host.style.display) {
      if (!iframeLoaded) {
        iframe.src = PHONE_URL;
        iframeLoaded = true;
      }
      host.style.display = 'block';
      // 居中显示
      requestAnimationFrame(() => {
        const w = host.offsetWidth;
        const h = host.offsetHeight;
        host.style.left = Math.max(0, (window.innerWidth - w) / 2) + 'px';
        host.style.top = Math.max(0, (window.innerHeight - h) / 2) + 'px';
      });
    } else {
      host.style.display = 'none';
    }
  });

  // 窗口resize时修正悬浮球位置
  window.addEventListener('resize', () => {
    const rect = fab.getBoundingClientRect();
    let l = Math.max(0, Math.min(window.innerWidth - fab.offsetWidth, rect.left));
    let t = Math.max(0, Math.min(window.innerHeight - fab.offsetHeight, rect.top));
    fab.style.left = l + 'px';
    fab.style.top = t + 'px';
  });

  setupMessageListener(host);
  console.log('📱 虚拟手机扩展已加载 - 完整修复版');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

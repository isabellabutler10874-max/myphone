// ================================================================
//  虚拟手机扩展 (mochi 外壳 + 自定义 rphone.html)
//  仓库: https://github.com/isabellabutler10874-max/myphone
// ================================================================

// 完整的手机外壳 CSS（来自 mochi.js，保留灵动岛、边框、毛玻璃效果）
const RP_PHONE_CSS = `
/* ── wrapper ── */
#rp-wrapper { position:fixed; right:20px; bottom:20px; z-index:9998; }
/* ── FAB ── */
#rp-fab {
  position:fixed; right:20px; bottom:20px; z-index:2147483647;
  width:52px; height:52px; border-radius:50%;
  background:rgba(255,255,255,.95); backdrop-filter:blur(12px);
  border:1px solid rgba(0,0,0,.1);
  display:flex; align-items:center; justify-content:center;
  padding:6px; overflow:hidden; cursor:grab;
  box-shadow:0 4px 24px rgba(0,0,0,.18);
  transition:box-shadow .15s;
  user-select:none; touch-action:none;
}
#rp-fab:hover { transform:scale(1.1); }
/* ── phone container ── */
#rp-phone {
  position:fixed; right:84px; bottom:20px; z-index:10000;
  cursor:default;
}
/* ══════════════════════════════════════
   📱 MOBILE RESPONSIVE ADAPTATION
   ══════════════════════════════════════ */
@media (max-width: 768px) {
  #rp-fab {
    width: 32px !important; height: 32px !important;
    top: calc(100vh - 142px) !important;
    bottom: auto !important;
    right: 14px !important; left: auto !important;
    transform: none !important;
    background: rgba(255,255,255,.95) !important;
    border: 1px solid rgba(0,0,0,.1) !important;
    box-shadow: 0 4px 24px rgba(0,0,0,.18) !important;
    backdrop-filter: blur(12px) !important;
    z-index: 2147483647 !important;
  }
  #rp-phone.rp-mobile-pos {
    left: calc(50vw - 150px) !important;
    top: calc(50vh - 280px) !important;
    right: auto !important; bottom: auto !important;
    transform: none !important;
    z-index: 2147483645 !important;
  }
  #rp-frame {
    width: 300px !important; height: 560px !important;
    border-radius: 38px !important;
  }
  #rp-screen {
    border-radius: min(40px, 6vw) !important;
  }
}
/* ── 手机框架 (iPhone 15 Pro 风格) ── */
#rp-frame {
  position:relative; width:286px; height:580px;
  background: linear-gradient(160deg,#e8e8e8,#d0d0d0);
  border-radius:50px;
  box-shadow: 0 0 0 1.5px rgba(0,0,0,.12),0 0 0 1.5px rgba(0,0,0,.08),0 36px 80px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.5);
  padding:11px;
}
/* 侧边按钮 */
.rp-btn { position:absolute; border-radius:2px; background:#c0c0c0; }
.rp-vol-up  { left:-3px; top:88px;  width:3px; height:34px; }
.rp-vol-dn  { left:-3px; top:130px; width:3px; height:34px; }
.rp-power   { right:-3px; top:106px; width:3px; height:46px; }
/* ── 屏幕区域 ── */
#rp-screen {
  width:100%; height:100%;
  background: #fff;
  border-radius:40px; overflow:hidden;
  position:relative;
}
/* 灵动岛 */
#rp-island {
  position:absolute; top:11px; left:50%; transform:translateX(-50%);
  width:86px; height:28px; background:#000; border-radius:20px; z-index:200;
  box-shadow:0 0 0 2px #f5f5f5;
}
/* 状态栏 */
#rp-sbar {
  position:absolute; top:0; left:0; right:0; height:48px;
  display:flex; align-items:flex-end; justify-content:space-between;
  padding:0 20px 7px; z-index:199; color:#e06080;
  font-size:12px; font-weight:600; letter-spacing:-.2px;
}
.rp-sbar-r { display:flex; align-items:center; gap:6px; }
#rp-bat { width:22px; height:11px; border:1.5px solid rgba(0,0,0,.4); border-radius:3px; padding:1.5px; position:relative; }
#rp-bat::after { content:''; position:absolute; right:-4px; top:50%; transform:translateY(-50%); width:2px; height:5px; background:rgba(0,0,0,.3); border-radius:0 1px 1px 0; }
#rp-bat-fill { height:100%; width:85%; background:#34c759; border-radius:1.5px; }
/* 底栏 Home 指示条 */
#rp-home-ind {
  position:absolute; bottom:7px; left:50%; transform:translateX(-50%);
  width:90px; height:4px; background:rgba(0,0,0,.25); border-radius:2px; z-index:300;
}
`;

// 检测是否为触屏设备
const IS_TOUCH_DEVICE = window.matchMedia('(hover: none) and (pointer: coarse)').matches
                     || /Android|iPhone|iPod/i.test(navigator.userAgent);

// 注入样式
function injectStyles() {
  if (document.getElementById('rp-phone-css')) return;
  const style = document.createElement('style');
  style.id = 'rp-phone-css';
  style.textContent = RP_PHONE_CSS;
  document.head.appendChild(style);
  console.log('[虚拟手机] CSS 已注入');
}

// 创建 UI 元素
function createUI() {
  // 悬浮按钮
  const fab = document.createElement('div');
  fab.id = 'rp-fab';
  fab.innerHTML = `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;">
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

  // 手机外壳容器
  const wrapper = document.createElement('div');
  wrapper.id = 'rp-wrapper';
  const phone = document.createElement('div');
  phone.id = 'rp-phone';
  phone.style.display = 'none';
  if (IS_TOUCH_DEVICE) phone.classList.add('rp-mobile-pos');

  // 手机内部结构
  phone.innerHTML = `
    <div id="rp-frame">
      <div class="rp-btn rp-vol-up"></div>
      <div class="rp-btn rp-vol-dn"></div>
      <div class="rp-btn rp-power"></div>
      <div id="rp-screen">
        <div id="rp-island"></div>
        <div id="rp-sbar">
          <span id="rp-sbar-time">09:41</span>
          <div class="rp-sbar-r">
            <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor" opacity=".8">
              <rect x="0" y="4" width="3" height="6" rx="1"/>
              <rect x="4" y="2" width="3" height="8" rx="1"/>
              <rect x="8" y="0" width="3" height="10" rx="1"/>
              <rect x="12" y="0" width="3" height="10" rx="1" opacity=".3"/>
            </svg>
            <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor" opacity=".8">
              <path d="M7 2C9.5 2 11.7 3.1 13.2 4.8L14 4C12.3 2 9.8 1 7 1S1.7 2 0 4l.8.8C2.3 3.1 4.5 2 7 2z"/>
              <path d="M7 4c1.7 0 3.2.7 4.3 1.8L12 5c-1.3-1.3-3-2-5-2S3.3 3.7 2 5l.7.8C3.8 4.7 5.3 4 7 4z"/>
              <circle cx="7" cy="9" r="1.2"/>
            </svg>
            <div id="rp-bat">
              <div id="rp-bat-fill"></div>
            </div>
          </div>
        </div>
        <!-- iframe 加载你的主界面 -->
        <iframe id="rp-iframe" src="" style="width:100%;height:100%;border:none;display:block;margin-top:48px;height:calc(100% - 48px);"></iframe>
        <div id="rp-home-ind"></div>
      </div>
    </div>
  `;
  wrapper.appendChild(phone);
  document.body.appendChild(wrapper);

  return { fab, phone, iframe: phone.querySelector('#rp-iframe') };
}

// 拖动悬浮按钮
function makeDraggable(fab) {
  let dragging = false, startX, startY, startLeft, startTop;
  const onMouseMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let newLeft = startLeft + dx;
    let newTop = startTop + dy;
    newLeft = Math.max(0, Math.min(window.innerWidth - fab.offsetWidth, newLeft));
    newTop = Math.max(0, Math.min(window.innerHeight - fab.offsetHeight, newTop));
    fab.style.left = newLeft + 'px';
    fab.style.top = newTop + 'px';
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';
  };
  const onMouseUp = () => {
    dragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
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
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
  // 触摸事件
  fab.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const rect = fab.getBoundingClientRect();
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
      newLeft = Math.max(0, Math.min(window.innerWidth - fab.offsetWidth, newLeft));
      newTop = Math.max(0, Math.min(window.innerHeight - fab.offsetHeight, newTop));
      fab.style.left = newLeft + 'px';
      fab.style.top = newTop + 'px';
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
    };
    const onTouchEnd = () => {
      dragging = false;
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  }, { passive: true });
}

// 更新状态栏时间
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const timeEl = document.querySelector('#rp-sbar-time');
  if (timeEl) timeEl.textContent = `${h}:${m}`;
}

// 主初始化
async function init() {
  injectStyles();
  const { fab, phone, iframe } = createUI();
  makeDraggable(fab);

  // 你的 GitHub Pages 地址（确保 rphone.html 在根目录）
  const PHONE_URL = 'https://isabellabutler10874-max.github.io/myphone/rphone.html';

  let phoneVisible = false;
  let iframeLoaded = false;

  fab.addEventListener('click', (e) => {
    if (e.defaultPrevented) return; // 防止拖动后触发

    if (!phoneVisible) {
      if (!iframeLoaded) {
        iframe.src = PHONE_URL;
        iframeLoaded = true;
      }
      phone.style.display = 'block';
      phoneVisible = true;
      // 手机端位置修正
      if (IS_TOUCH_DEVICE) {
        const pw = phone.offsetWidth;
        const ph = phone.offsetHeight;
        phone.style.left = `${(window.innerWidth - pw) / 2}px`;
        phone.style.top = `${(window.innerHeight - ph) / 2}px`;
      }
    } else {
      phone.style.display = 'none';
      phoneVisible = false;
    }
  });

  // 点击外部关闭手机
  document.addEventListener('click', (e) => {
    if (!phoneVisible) return;
    if (phone.contains(e.target) || fab.contains(e.target)) return;
    phone.style.display = 'none';
    phoneVisible = false;
  });

  // 更新时间
  updateClock();
  setInterval(updateClock, 1000);

  console.log('📱 虚拟手机（mochi 外壳版）已加载');
}

// 启动
jQuery(() => init());

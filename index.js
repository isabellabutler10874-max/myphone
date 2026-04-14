import { extension_settings } from '../../../extensions.js';

// 你的 GitHub 网址
const YOUR_GITHUB_URL = 'https://isabellabutler10874-max.github.io/myphone/';

jQuery(async () => {
    // 1. 创建悬浮球的 HTML (设置在屏幕右下角)
    const floatingButtonHtml = `
        <div id="virtual-phone-floating-btn" style="
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 45px;
            height: 45px;
            background-color: rgba(255, 255, 255, 0.85); /* 半透明白色背景 */
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); /* 轻微阴影，悬浮感 */
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 22px; /* emoji大小 */
            cursor: pointer;
            z-index: 99999;
            backdrop-filter: blur(5px); /* 毛玻璃效果 */
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        " 
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.3)';" 
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)';">
            ℹ️
        </div>
    `;

    // 2. 创建承载手机网页的弹窗容器 (默认隐藏)
    const phoneModalHtml = `
        <div id="virtual-phone-modal" style="
            display: none;
            position: fixed;
            bottom: 90px; /* 悬浮在按钮上方 */
            right: 30px;
            width: 430px; /* 稍微比你写的 390px 宽一点，用来装下阴影和边框 */
            height: 720px; 
            z-index: 99998;
            background: transparent;
            border-radius: 45px;
            overflow: hidden; /* 防止内容溢出 */
            box-shadow: 0 20px 50px rgba(0,0,0,0.4);
        ">
            <iframe src="${YOUR_GITHUB_URL}" style="width: 100%; height: 100%; border: none; background: #1c1c1e;"></iframe>
        </div>
    `;

    // 3. 将悬浮球和弹窗注入到游戏页面中
    $('body').append(floatingButtonHtml);
    $('body').append(phoneModalHtml);

    // 4. 点击悬浮球时，平滑切换手机的显示与隐藏
    $('#virtual-phone-floating-btn').on('click', () => {
        $('#virtual-phone-modal').fadeToggle(250); // 250毫秒的淡入淡出动画
    });
});

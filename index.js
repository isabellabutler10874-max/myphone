// ================================================
// 虚拟手机扩展 - SillyTavern 入口
// 仓库：https://github.com/isabellabutler10874-max/myphone
// ================================================

(async function() {
    console.log('📱 虚拟手机扩展启动中...');

    // 等待扩展菜单加载完成
    function waitForMenu(callback) {
        if ($('#extensionsMenu').length) {
            callback();
        } else {
            setTimeout(() => waitForMenu(callback), 200);
        }
    }

    // 尝试导入 SillyTavern 内置弹窗模块
    let showIframeModal;
    try {
        const utils = await import('../../../utils.js');
        showIframeModal = utils.showIframeModal;
        console.log('✅ utils.js 导入成功，将使用内置弹窗');
    } catch (e) {
        console.warn('⚠️ utils.js 导入失败，降级为新窗口打开', e);
        showIframeModal = (title, url, w, h) => {
            window.open(url, '_blank', `width=${w},height=${h}`);
        };
    }

    // ⚠️ 重要：这里填你 GitHub Pages 上 rphone.html 的真实地址
    const PHONE_URL = 'https://isabellabutler10874-max.github.io/myphone/rphone.html';

    // 插入手机按钮到右上角工具栏
    waitForMenu(() => {
        const phoneBtn = $(`
            <div id="virtual-phone-btn" 
                 class="fa-solid fa-mobile-screen-button interactable" 
                 style="margin-left: 8px; cursor: pointer;" 
                 title="打开虚拟手机">
            </div>
        `);

        phoneBtn.on('click', () => {
            // 弹窗尺寸设置为 390x700（跟你的手机容器宽高匹配）
            if (showIframeModal) {
                showIframeModal('📱 虚拟手机', PHONE_URL, 400, 750);
            } else {
                window.open(PHONE_URL, '_blank', 'width=400,height=750');
            }
        });

        $('#extensionsMenu').append(phoneBtn);
        console.log('📱 手机按钮已添加到工具栏，点击打开：', PHONE_URL);
    });
})();

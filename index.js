// 虚拟手机扩展 —— 动态加载模块，安全插入按钮
(async function() {
    console.log('📱 虚拟手机扩展启动中...');

    // 1. 等待 jQuery 和 extensionsMenu 就绪
    function waitForMenu(callback) {
        if ($('#extensionsMenu').length) {
            callback();
        } else {
            setTimeout(() => waitForMenu(callback), 200);
        }
    }

    // 2. 动态导入 utils（避免模块路径报错）
    let showIframeModal;
    try {
        const utils = await import('../../../utils.js');
        showIframeModal = utils.showIframeModal;
        console.log('✅ utils.js 加载成功');
    } catch (e) {
        console.warn('⚠️ utils.js 导入失败，降级使用 window.open', e);
        // 降级方案：新窗口打开
        showIframeModal = (title, url, w, h) => {
            window.open(url, '_blank', `width=${w},height=${h}`);
        };
    }

    // 3. 你手机主界面的 URL（改成你自己的 GitHub Pages 地址）
    const PHONE_URL = 'https://github.com/isabellabutler10874-max/myphone
/rphone.html';
    // 如果你暂时没上传 GitHub，也可以先用本地测试地址：
    // const PHONE_URL = 'http://localhost:8000/phone.html';

    // 4. 创建按钮并插入工具栏
    waitForMenu(() => {
        const btn = $(`
            <div id="virtual-phone-btn" 
                 class="fa-solid fa-mobile-screen-button interactable" 
                 style="margin-left: 8px; cursor: pointer;" 
                 title="打开虚拟手机">
            </div>
        `);

        btn.on('click', () => {
            if (showIframeModal) {
                // SillyTavern 内置弹窗，嵌入 iframe
                showIframeModal('📱 虚拟手机', PHONE_URL, 400, 700);
            } else {
                // 降级：新窗口打开
                window.open(PHONE_URL, '_blank', 'width=400,height=700');
            }
        });

        $('#extensionsMenu').append(btn);
        console.log('📱 虚拟手机按钮已添加到工具栏');
    });
})();

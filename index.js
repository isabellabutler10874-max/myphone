import { extensionHelper } from '../../../../extensions.js';

jQuery(async () => {
    const button = $(`
        <div id="my_phone_button" class="fa-solid fa-mobile-screen-button interactable" 
             title="打开我的小手机" style="margin: 0 4px; cursor: pointer;">
        </div>
    `);

    button.on('click', () => {
        // 方式 A：弹出新窗口（最简单）
        window.open('https://你的github用户名.github.io/仓库名/主界面.html', 
                    '_blank', 'width=400,height=700');

        // 方式 B：在 ST 内嵌 iframe 弹窗（后面细讲）
    });

    $('#extensionsMenu').append(button);  // 按钮会出现在 ST 右上角插件区
});

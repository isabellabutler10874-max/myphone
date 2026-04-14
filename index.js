// index.js 最简测试版
console.log('✅ 虚拟手机扩展已加载');

jQuery(() => {
    const btn = $(`<div class="fa-solid fa-mobile-screen-button" style="margin:0 6px; cursor:pointer;" title="打开手机"></div>`);
    btn.on('click', () => alert('手机按钮点了！'));
    $('#extensionsMenu').append(btn);
});

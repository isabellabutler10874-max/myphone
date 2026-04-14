(function() {
    // 这里依然调用你生成的 .io 网页画面
    const YOUR_GITHUB_URL = 'https://isabellabutler10874-max.github.io/myphone/';

    const initExtension = () => {
        const floatingButtonHtml = `
            <div id="virtual-phone-floating-btn" style="
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 48px;
                height: 48px;
                background-color: white;
                border-radius: 50%;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 24px;
                cursor: pointer;
                z-index: 999999;
            ">ℹ️</div>
        `;

        const phoneModalHtml = `
            <div id="virtual-phone-modal" style="
                display: none;
                position: fixed;
                bottom: 90px;
                right: 30px;
                width: 410px;
                height: 720px;
                z-index: 999998;
                background: transparent;
            ">
                <iframe src="${YOUR_GITHUB_URL}" style="width: 100%; height: 100%; border: none; border-radius: 40px;"></iframe>
            </div>
        `;

        if (!$('#virtual-phone-floating-btn').length) {
            $('body').append(floatingButtonHtml);
            $('body').append(phoneModalHtml);

            $('#virtual-phone-floating-btn').on('click', function() {
                $('#virtual-phone-modal').fadeToggle(200);
            });
        }
    };

    $(document).ready(initExtension);
})();

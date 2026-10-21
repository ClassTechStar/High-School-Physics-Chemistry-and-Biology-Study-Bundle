/* 主题引导 · 外置自 index.html head 内联脚本（T3-4e）；非 defer 同步加载，须在 body 渲染前执行以避免首屏闪白 */
/* ---- 主题引导脚本：必须在 <body> 渲染前同步执行，避免首屏闪白 ---- */
(function () {
    var KEY = 'hspcb_theme', LEGACY = 'hspcb_dark_mode', theme;
    try {
        theme = localStorage.getItem(KEY);
        if (theme !== 'dark' && theme !== 'light') {
            var legacy = localStorage.getItem(LEGACY);
            if (legacy === '1' || legacy === 'true') {
                theme = 'dark';
            } else {
                theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
            }
        }
    } catch (e) { theme = 'light'; }

    var root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    document.addEventListener('DOMContentLoaded', function () {
        var btn = document.getElementById('themeToggle');
        if (btn) {
            btn.textContent = theme === 'dark' ? '☀️' : '🌙';
            btn.title = theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式';
            btn.setAttribute('aria-label', btn.title);
        }
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f172a' : '#4f6ef6');
    });
})();

/* 统一主题切换 · 外置自 index.html 内联脚本（e）；defer，置于 app.js 之前保持执行序 */
/* ---- 统一主题切换（全站唯一入口，深色 / 浅色） ---- */
(function () {
    'use strict';
    var KEY = 'hspcb_theme', LEGACY = 'hspcb_dark_mode';

    function current() {
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function apply(theme) {
        var root = document.documentElement;
        root.setAttribute('data-theme', theme);
        root.style.colorScheme = theme;

        var btn = document.getElementById('themeToggle');
        if (btn) {
            btn.textContent = theme === 'dark' ? '☀️' : '🌙';
            btn.title = theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式';
            btn.setAttribute('aria-label', btn.title);
            btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        }

        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f172a' : '#4f6ef6');

        try {
            localStorage.setItem(KEY, theme);
            localStorage.setItem(LEGACY, theme === 'dark' ? '1' : '0');
        } catch (e) {}
    }

    window.toggleTheme = function () { apply(current() === 'dark' ? 'light' : 'dark'); };
    window.setTheme = apply;
    window.getTheme = current;

    // ===== c / T12：主题切换按钮的内联事件属性改事件委托 =====
    // 原：<button ...>（内联事件属性，CSP script-src 去掉
    // 'unsafe-inline' 后会被浏览器拦截）。现改为 data-action="toggle-theme" + 文档级委托。
    // window.toggleTheme 保留：外部调用方可能还在用它。
    document.addEventListener('click', function (e) {
        var t = e.target && e.target.closest ? e.target.closest('[data-action="toggle-theme"]') : null;
        if (!t) return;
        window.toggleTheme();
    });

    apply(current());
})();

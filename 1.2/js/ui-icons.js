// ui-icons.js — 内联 SVG 图标集（v1.9 §4.2）
// 目的：把「用 emoji 当图标」换成矢量图标——emoji 在 Windows 低分屏与不同字体
// 回退下像素发虚、尺寸随平台变化；SVG 走 currentColor，跟随主题与字号。
// 用法：
//   1) 静态标记：<span data-icon="exam" title="真题练习"></span>（本文件会自动注入）
//   2) 动态拼串：HSPCBIcon.svg('exam')
// 图标路径采用 24×24 线性风格（stroke，无填充），与项目现有视觉一致。
(function () {
    'use strict';

    var PATHS = {
        exam: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H16l4 4v10.5A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5z"/><path d="M16 4v4h4"/><path d="M8 12h8M8 16h5"/>',
        notebook: '<path d="M6 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6z"/><path d="M6 3.5A1.5 1.5 0 0 0 4.5 5v14A1.5 1.5 0 0 0 6 20.5"/><path d="M9 8h6M9 12h6M9 16h3"/>',
        calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3.5V7M16 3.5V7"/><path d="M8 14h2M14 14h2M8 17.5h2"/>',
        clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
        target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
        search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
        chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-5M12.5 16V7M17 16v-8"/>',
        book: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"/>',
        tools: '<path d="M14.5 6.5a3.5 3.5 0 0 0-4.6 4.6L4.5 16.5a2 2 0 1 0 2.8 2.8l5.4-5.4a3.5 3.5 0 0 0 4.6-4.6l-2.1 2.1-2.1-2.1z"/>',
        flag: '<path d="M6 3.5v17"/><path d="M6 4.5h11l-2.5 4L17 12.5H6"/>',
        layers: '<path d="M12 3.5 3.5 8 12 12.5 20.5 8z"/><path d="M3.5 12.5 12 17l8.5-4.5"/><path d="M3.5 16.5 12 21l8.5-4.5"/>',
        atom: '<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="9" ry="4"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)"/>',
        flask: '<path d="M9 3.5h6"/><path d="M10 3.5v5L5.5 17a2 2 0 0 0 1.7 3h9.6a2 2 0 0 0 1.7-3L14 8.5v-5"/><path d="M7.5 14h9"/>',
        dna: '<path d="M8 3.5c0 5 8 6 8 11M16 3.5c0 5-8 6-8 11"/><path d="M8.5 20.5c0-2 1-3 3.5-3s3.5 1 3.5 3"/><path d="M9 8h6M9.5 12h5"/>',
        sigma: '<path d="M17 5H7l6 7-6 7h10"/>',
        pen: '<path d="M4.5 19.5l4-1 10-10a2.1 2.1 0 0 0-3-3l-10 10z"/><path d="M13.5 6.5l3 3"/>',
        bulb: '<path d="M9 17.5h6"/><path d="M10 20.5h4"/><path d="M12 3.5a6 6 0 0 0-3.5 10.9V17h7v-2.6A6 6 0 0 0 12 3.5z"/>',
        shield: '<path d="M12 3.5 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="M9 12l2 2 4-4"/>',
        refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4h-4"/>',
        check: '<path d="M4.5 12.5l5 5 10-11"/>',
        grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
        cloud: '<path d="M7 18.5h10a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.6 1.3A3.6 3.6 0 0 0 7 18.5z"/>'
    };

    function svg(name, extraClass) {
        var body = PATHS[name];
        if (!body) return '';
        return '<span class="hspcb-i' + (extraClass ? ' ' + extraClass : '') + '" aria-hidden="true">'
            + '<svg viewBox="0 0 24 24" focusable="false">' + body + '</svg></span>';
    }

    /** 把文档里所有 <span data-icon="x"> 替换为内联 SVG（幂等）。 */
    function hydrate(root) {
        var scope = root || document;
        var nodes = scope.querySelectorAll('[data-icon]');
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            var name = el.getAttribute('data-icon');
            if (!name || !PATHS[name]) continue;
            el.innerHTML = svg(name);
            el.removeAttribute('data-icon');
            el.setAttribute('data-icon-done', name);
        }
    }

    window.HSPCBIcon = { svg: svg, hydrate: hydrate, names: Object.keys(PATHS) };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { hydrate(); });
    } else {
        hydrate();
    }
})();

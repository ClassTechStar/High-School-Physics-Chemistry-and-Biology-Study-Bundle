/* main-init.js — 主逻辑·初始化（v1.8 P3 自 main-inline.js 拆分）
   原为单个约 2460 行 IIFE，现按「初始化 / 路由导航 / 内容渲染 / 工具」拆为四件套：
   main-init → main-views → main-nav → main-tools（均为解析期非 defer 脚本，按此序加载）。
   跨文件共享状态收敛在 window.HSPCBMain：CD/PS/CE 为 defer 模块的实时回填缓存，
   views 为内容渲染器注册表（仅供 main-nav 的 navigateToolPage 分发调用）。
   原始说明：外置自 index.html body 内联脚本（e）；非 defer 解析期同步执行，
   内部按 document.readyState 分支引导 defer 模块就绪。 */
(function() {
    'use strict';

    var M = window.HSPCBMain = window.HSPCBMain || { CD: null, PS: null, CE: null, views: {} };

    // 修复：comprehensive-data.js / platform-system.js / content-enhancement.js
    // 均为 <script defer>，在本解析期脚本执行时尚未就绪。此处若直接
    // `var CD = window.ComprehensiveData` 捕获到的将永久是 undefined 且不会自更新，
    // 导致平台区 8 个 tab、三科 checklist、2 个器材工具与 2 处错误页全部失效。
    // 改为「声明但不赋值」，由 syncModules() 在真正需要时点实时回填（写入 HSPCBMain）。

    function syncModules() {
        M.CD = window.ComprehensiveData || null;
        M.PS = window.PlatformSystem || null;
        M.CE = window.ContentEnhancer || null;
        return M;
    }
    M.syncModules = syncModules;
    syncModules();

    // v1.3: 外部模块脚本带 defer，解析期尚未就绪 —— 平台初始化延后到 DOMContentLoaded
    function bootPlatform() {
        M.syncModules();
        if (M.PS) { M.PS.init(); }
        if (window.darkModeToggle && window.darkModeToggle.render) { window.darkModeToggle.render(); }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootPlatform);
    } else {
        bootPlatform();
    }

    var firstPhysicsTab = document.querySelector('#physics-section .module-tab');
    if (firstPhysicsTab) {
        firstPhysicsTab.classList.add('active');
        try { if (typeof loadModuleContent === 'function') loadModuleContent('physics', 'concepts'); } catch(e) {}
    }

 /* 实验卡片折叠（原 17 处内联 onclick 的 classList.toggle） */
    if (window.HSPCBEV) {
        HSPCBEV.on('click', '[data-hook="exp-card-toggle"]', function (el) {
            el.parentElement.classList.toggle('exp-open');
        });
    }
})();

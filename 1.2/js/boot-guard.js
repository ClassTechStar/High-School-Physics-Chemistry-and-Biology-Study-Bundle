// ============================================================
// boot-guard.js — 启动自检与安全模式（借鉴 Class-Widgets-2 safe-mode /
// ClassIsland 恢复模式的最小子集）
//   ?safe=1            进入安全模式（插件等可跳过部分不加载）
//   关键模块缺失        DOM 就绪 5s 后体检，缺失则计数并通知；
//                      同一模块连续 2 次启动缺失 → 写入隔离名单（boot.skip），
//                      注册表型模块（插件/仪表盘组件）据此跳过。
// 只做「检测 + 计数 + 通知」，不阻断任何现有加载流程。
// ============================================================
window.HSPCBBoot = (function () {
    'use strict';

    var safe = typeof location !== 'undefined' && /(?:^|[?&])safe=1/.test(location.search || '');

    var CRITICAL = ['HSPCBProgress', 'HSPCBStore', 'CommonUtils', 'HSPCBNotify', 'HSPCBTick',
        'PlatformSystem', 'toggleTheme', 'MODULE_REGISTRY'];

    function readStore(key, fallback) {
        try {
            var raw = window.HSPCBStore && HSPCBStore.get(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) { return fallback; }
    }
    function writeStore(key, val) {
        try { window.HSPCBStore && HSPCBStore.set(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
    }

    var fails = readStore('boot.fails', {});
    var skip = readStore('boot.skip', {});
    var lastMissing = [];

    function bump(key) {
        fails[key] = (fails[key] || 0) + 1;
        writeStore('boot.fails', fails);
        if (fails[key] >= 2 && !skip[key]) {
            skip[key] = true;
            writeStore('boot.skip', skip);
        }
    }

    function audit() {
        try {
            lastMissing = CRITICAL.filter(function (n) { return typeof window[n] === 'undefined'; });
            lastMissing.forEach(bump);
            if (lastMissing.length && window.HSPCBNotify && typeof HSPCBNotify.notify === 'function') {
                HSPCBNotify.notify({
                    id: 'boot.missing',
                    level: 'warn',
                    title: '部分功能未加载',
                    message: '缺失模块：' + lastMissing.join('、') + '。同一模块连续出现将自动隔离；也可在地址后加 ?safe=1 进入安全模式。'
                });
            }
        } catch (e) { /* 自检自身不抛错 */ }
    }

    function scheduleAudit() {
        if (typeof setTimeout !== 'function') { audit(); return; }
        setTimeout(audit, 5000);
    }
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleAudit);
        else scheduleAudit();
    }

    return {
        isSafe: function () { return safe; },
        /** 注册表型模块（插件等）是否应跳过加载 */
        pluginsBlocked: function () { return safe || !!skip['HSPCBPlugins'] || fails['HSPCBPlugins'] >= 2; },
        isSkipped: function (key) { return !!skip[key]; },
        /** 供各模块上报自身装载失败 */
        fail: bump,
        report: function () {
            return { safe: safe, missing: lastMissing.slice(), fails: JSON.parse(JSON.stringify(fails)), skip: JSON.parse(JSON.stringify(skip)) };
        },
        _resetStats: function () { fails = {}; skip = {}; writeStore('boot.fails', fails); writeStore('boot.skip', skip); }
    };
})();

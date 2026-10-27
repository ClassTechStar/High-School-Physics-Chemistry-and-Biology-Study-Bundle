// ============================================================
// theme-loader.js — 主题覆盖包加载器（v1.5 / T14，借鉴 Class-Widgets-2
// 主题包「缺失回退」思路的最小实现）
// 主题包 = css/themes/<name>.css（仅覆盖 tokens 变量）。
// 加载失败（404/语法导致的 error 事件）自动移除并回退默认外观。
// 内置包清单见 PACKS；新包需同时登记此处与 css/themes/ 目录。
// ============================================================
window.HSPCBTheme = (function () {
    'use strict';

    var LINK_ID = 'hspcb-theme-pack';
    var PACKS = [
        { id: 'none', name: '默认外观' },
        { id: 'sepia', name: '护眼纸色' }
    ];
    var current = 'none';

    function apply(name) {
        if (typeof document === 'undefined') return false;
        var old = document.getElementById(LINK_ID);
        if (old && old.parentNode) old.parentNode.removeChild(old);
        if (!name || name === 'none') { current = 'none'; return true; }
        if (!PACKS.some(function (p) { return p.id === name; })) return false;

        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = LINK_ID;
        link.href = 'css/themes/' + name + '.css';
        link.addEventListener('error', function () {
            if (link.parentNode) link.parentNode.removeChild(link);
            current = 'none';
            try {
                if (window.HSPCBProgress && HSPCBProgress.updateSettings) {
                    HSPCBProgress.updateSettings(function (s) { s.appearance.themePack = 'none'; });
                }
            } catch (e) { /* ignore */ }
            try {
                window.HSPCBNotify && HSPCBNotify.notify({
                    id: 'theme.rollback', level: 'warn',
                    title: '主题包加载失败', message: '「' + name + '」无法加载，已回退默认外观。'
                });
            } catch (e) { /* ignore */ }
        });
        document.head.appendChild(link);
        current = name;
        return true;
    }

    function setPack(name) {
        try {
            if (window.HSPCBProgress && HSPCBProgress.updateSettings) {
                HSPCBProgress.updateSettings(function (s) { s.appearance.themePack = name; });
            }
        } catch (e) { /* ignore */ }
        return apply(name);
    }

    // 启动时恢复用户选择
    try {
        var s = window.HSPCBProgress && HSPCBProgress.getSettings && HSPCBProgress.getSettings();
        if (s && s.appearance && s.appearance.themePack && s.appearance.themePack !== 'none') {
            apply(s.appearance.themePack);
        }
    } catch (e) { /* ignore */ }

    return {
        setPack: setPack,
        apply: apply,
        listPacks: function () { return PACKS.slice(); },
        current: function () { return current; }
    };
})();

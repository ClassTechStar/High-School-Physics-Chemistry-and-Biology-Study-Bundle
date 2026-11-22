// ============================================================
// pwa-install.js — PWA 安装入口（适配自 cn-math-taxonomy 的分平台安装引导）
//
// 目标项目本来就能装（manifest + Service Worker 齐全），但没有任何引导：
// 用户不知道可以装到桌面/主屏，白丢一个离线可用入口。
//
// 这里只做「能力探测 + 一个状态对象」，UI 交给设置中心已有的卡片/按钮渲染，
// 不新增任何样式与 DOM 结构，也不改变未满足条件时的界面。
//
// 平台差异（与 cn-math 的做法一致）：
//   · Chromium 系：监听 beforeinstallprompt，缓存事件，用户点「安装」时 prompt()
//   · iOS Safari ：没有该事件，退化为文字引导（分享 → 添加到主屏幕）
//   · 已安装（standalone）或已装过（appinstalled）：整体不出现
// ============================================================
window.HSPCBPwaInstall = (function () {
    'use strict';

    var deferred = null;      // beforeinstallprompt 事件
    var installed = false;    // 本次会话内完成安装
    var dismissed = false;    // 用户在 prompt 里取消

    function isStandalone() {
        try {
            if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
            return window.navigator.standalone === true; // iOS Safari 专有
        } catch (e) { return false; }
    }

    function isIOS() {
        var ua = (window.navigator && window.navigator.userAgent) || '';
        // iPadOS 13+ 的 UA 伪装成 macOS，用触点数量补判
        var iPadOS = /Macintosh/.test(ua) && window.navigator.maxTouchPoints > 1;
        return /iPad|iPhone|iPod/.test(ua) || iPadOS;
    }

    /** 是否值得出现这个入口（已装 / 已放弃 都不出现） */
    function available() {
        if (installed || isStandalone() || dismissed) return false;
        return !!deferred || isIOS();
    }

    /** 能否直接唤起系统安装框（否则只能给文字引导） */
    function canPrompt() { return !!deferred; }

    function hint() {
        if (deferred) return '装到桌面后可以全屏打开，离线也能用已缓存的题库。';
        if (isIOS()) return 'Safari 里点底部的「分享」，选「添加到主屏幕」即可。';
        return '当前浏览器未提供安装入口，可换 Chrome / Edge 试试。';
    }

    /** 唤起安装流程；返回 Promise<boolean> 表示是否接受 */
    function prompt() {
        if (!deferred) return Promise.resolve(false);
        var ev = deferred;
        deferred = null; // 事件只能用一次
        try {
            ev.prompt();
            return ev.userChoice.then(function (r) {
                var ok = r && r.outcome === 'accepted';
                if (!ok) dismissed = true;
                return ok;
            })['catch'](function () { return false; });
        } catch (e) {
            return Promise.resolve(false);
        }
    }

    if (window.addEventListener) {
        window.addEventListener('beforeinstallprompt', function (e) {
            // 阻止浏览器默认的迷你提示条，改由设置中心统一承接
            e.preventDefault();
            deferred = e;
        });
        window.addEventListener('appinstalled', function () {
            installed = true;
            deferred = null;
        });
    }

    return {
        available: available,
        canPrompt: canPrompt,
        hint: hint,
        prompt: prompt,
        isStandalone: isStandalone
    };
})();

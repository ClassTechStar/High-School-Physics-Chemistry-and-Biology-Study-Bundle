// ============================================================
// deep-link.js — ?goto= 深链路由（v1.5 / T14，借鉴 ClassIsland
// UriNavigationService 的注册表思路）
// 路由表：
//   home / exam / physics / chemistry / biology / math / chinese / english / platform
//   settings                          打开设置中心
//   tool:<data-tool-id>               打开学科下的指定工具
// 与既有 ?subject= 深链互不干扰（仅处理 goto）。
// ============================================================
window.HSPCBDeepLink = (function () {
    'use strict';

    var SECTIONS = {
        home: 'home-section',
        exam: 'exam-section',
        physics: 'physics-section',
        chemistry: 'chemistry-section',
        biology: 'biology-section',
        math: 'math-section',
        chinese: 'chinese-section',
        english: 'english-section',
        platform: 'platform-section'
    };
    var TOOL_SUBJECTS = ['physics', 'chemistry', 'biology', 'math', 'chinese', 'english'];

    function go(key) {
        if (typeof showSection !== 'function') return false;
        if (SECTIONS[key]) { showSection(SECTIONS[key]); return true; }
        if (key === 'settings') {
            if (window.HSPCBSettingsUI && HSPCBSettingsUI.open) { HSPCBSettingsUI.open(); return true; }
            return false;
        }
        if (key.indexOf('tool:') === 0) {
            var tool = key.slice(5);
            var subject = null;
            for (var i = 0; i < TOOL_SUBJECTS.length; i++) {
                if (tool.indexOf(TOOL_SUBJECTS[i] + '-') === 0) { subject = TOOL_SUBJECTS[i]; break; }
            }
            if (subject) {
                showSection(subject + '-section');
                if (typeof setActiveNav === 'function') setActiveNav(subject);
                if (typeof navigateToolPage === 'function') {
                    setTimeout(function () { try { navigateToolPage(tool); } catch (e) { /* ignore */ } }, 200);
                }
                return true;
            }
            // 无六科前缀的工具（如 chem-equilibrium）：页面里存在对应 data-tool
            // 入口按钮时直接触发它，走既有委托路由
            var trigger = document.querySelector('[data-tool="' + tool + '"]');
            if (trigger) { trigger.click(); return true; }
            return false;
        }
        return false;
    }

    function boot() {
        try {
            if (typeof location === 'undefined') return;
            var m = /[?&]goto=([^&#]+)/.exec(location.search || '');
            if (!m) return;
            var key = decodeURIComponent(m[1]);
            var okNav = go(key);
            if (!okNav) {
                window.HSPCBNotify && HSPCBNotify.notify({
                    id: 'deeplink.unknown', level: 'warn',
                    title: '未识别的跳转目标', message: 'goto=' + key + ' 不在路由表中。'
                });
            }
            if (typeof history !== 'undefined' && history.replaceState) {
                history.replaceState(null, '', location.pathname);
            }
        } catch (e) { /* ignore */ }
    }

    if (typeof document !== 'undefined') {
        // 本文件随 defer 批装载时 readyState 已是 'interactive'，但同批后面的
        // 模块（如 settings-center.js）尚未执行 —— 必须等 DOMContentLoaded
        //（defer 全部执行完才触发）再跑路由，否则 ?goto=settings 必然扑空。
        if (document.readyState === 'complete') boot();
        else document.addEventListener('DOMContentLoaded', boot);
    }

    return { go: go, routes: function () { return Object.keys(SECTIONS).concat(['settings', 'tool:*']); } };
})();

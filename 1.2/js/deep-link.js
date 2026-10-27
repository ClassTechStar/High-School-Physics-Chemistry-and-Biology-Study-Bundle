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
            if (!subject) return false;
            showSection(subject + '-section');
            if (typeof setActiveNav === 'function') setActiveNav(subject);
            if (typeof navigateToolPage === 'function') {
                setTimeout(function () { try { navigateToolPage(tool); } catch (e) { /* ignore */ } }, 200);
            }
            return true;
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
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
        else boot();
    }

    return { go: go, routes: function () { return Object.keys(SECTIONS).concat(['settings', 'tool:*']); } };
})();

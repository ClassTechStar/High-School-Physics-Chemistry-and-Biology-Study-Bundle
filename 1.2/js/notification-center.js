// ============================================================
// notification-center.js — 通知中心（v1.5 / T2）
// 借鉴 ClassIsland NotificationHostService 与 Class-Widgets-2 NotificationManager
// 的最小可用子集：Provider 注册表 + payload 规范 + 队列（上限/去重/限流）
// + 应用内 toast + 可选系统通知桥接。
// payload: { id(必填,去重键), providerId?, level?('info'|'warn'|'error'),
//            title, message, duration?(ms,0=常驻), closable?(默认true) }
// 开关体系：总开关 settings.notifications.master + 每 Provider 独立开关。
// ============================================================
window.HSPCBNotify = (function () {
    'use strict';

    var providers = {};   // id -> {id, name, enabledDefault}
    var active = [];      // 当前 toast 元素
    var seen = {};        // id -> ts（60s 去重）
    var lastGlobal = 0;   // 全局限流（error 级豁免）
    var MAX_ACTIVE = 3;
    var root = null;

    function settings() {
        try {
            if (window.HSPCBProgress && typeof HSPCBProgress.getSettings === 'function') {
                return HSPCBProgress.getSettings();
            }
        } catch (e) { /* ignore */ }
        return { notifications: { master: true, providers: {} } };
    }

    function registerProvider(id, name, enabledDefault) {
        if (!id) return false;
        providers[id] = { id: id, name: name || id, enabledDefault: enabledDefault !== false };
        return true;
    }

    function isEnabled(providerId) {
        var s = settings();
        var n = s.notifications || {};
        if (n.master === false) return false;
        if (!providerId) return true;
        if (n.providers && typeof n.providers[providerId] === 'boolean') return n.providers[providerId];
        return providers[providerId] ? providers[providerId].enabledDefault : true;
    }

    function setMaster(on) {
        try {
            HSPCBProgress.updateSettings(function (s) { s.notifications.master = on !== false; });
        } catch (e) { /* ignore */ }
    }

    function setProviderEnabled(providerId, on) {
        try {
            HSPCBProgress.updateSettings(function (s) {
                s.notifications.providers[providerId] = on !== false;
            });
        } catch (e) { /* ignore */ }
    }

    function listProviders() {
        return Object.keys(providers).map(function (id) {
            return { id: id, name: providers[id].name, enabled: isEnabled(id) };
        });
    }

    function ensureRoot() {
        if (root && root.parentNode) return root;
        root = document.createElement('div');
        root.id = 'hspcb-notify-root';
        root.className = 'hspcb-notify-root';
        root.setAttribute('role', 'status');
        root.setAttribute('aria-live', 'polite');
        document.body.appendChild(root);
        return root;
    }

    function removeToast(el) {
        var i = active.indexOf(el);
        if (i >= 0) active.splice(i, 1);
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    function systemNotify(payload) {
        try {
            if (typeof Notification === 'undefined') return;
            if (Notification.permission !== 'granted') return;
            if (!document.hidden) return; // 前台时只用应用内 toast
            new Notification(payload.title || '学习提醒', { body: payload.message || '', tag: payload.id });
        } catch (e) { /* ignore */ }
    }

    function notify(payload) {
        try {
            if (!payload || typeof payload.id !== 'string' || !payload.id) return { ok: false, reason: 'bad-payload' };
            var s = settings();
            if ((s.notifications || {}).master === false) return { ok: false, reason: 'master-off' };
            var providerId = payload.providerId || '';
            if (providerId && !isEnabled(providerId)) return { ok: false, reason: 'provider-off' };

            var now = Date.now();
            var level = payload.level === 'warn' || payload.level === 'error' ? payload.level : 'info';
            if (level !== 'error' && now - lastGlobal < 10000) return { ok: false, reason: 'rate-limited' };
            lastGlobal = now;

            if (seen[payload.id] && now - seen[payload.id] < 60000) return { ok: false, reason: 'deduped' };
            seen[payload.id] = now;

            systemNotify(payload);

            if (typeof document === 'undefined' || !document.body) return { ok: true, reason: 'no-dom' };
            var container = ensureRoot();

            while (active.length >= MAX_ACTIVE) removeToast(active[0]);

            var toast = document.createElement('div');
            toast.className = 'hspcb-toast lv-' + level;

            var icon = document.createElement('span');
            icon.className = 'hspcb-toast-icon';
            icon.textContent = level === 'error' ? '⛔' : (level === 'warn' ? '⚠️' : 'ℹ️');

            var body = document.createElement('div');
            body.className = 'hspcb-toast-body';
            var t = document.createElement('div');
            t.className = 'hspcb-toast-title';
            t.textContent = payload.title || '提醒';
            var m = document.createElement('div');
            m.className = 'hspcb-toast-msg';
            m.textContent = payload.message || '';
            body.appendChild(t); body.appendChild(m);

            toast.appendChild(icon); toast.appendChild(body);

            if (payload.closable !== false) {
                var close = document.createElement('button');
                close.className = 'hspcb-toast-close';
                close.setAttribute('aria-label', '关闭提醒');
                close.textContent = '✕';
                close.addEventListener('click', function () { removeToast(toast); });
                toast.appendChild(close);
            }

            container.appendChild(toast);
            active.push(toast);

            var duration = typeof payload.duration === 'number' ? payload.duration : 6000;
            if (duration > 0 && typeof setTimeout === 'function') {
                setTimeout(function () { removeToast(toast); }, duration);
            }
            return { ok: true };
        } catch (e) {
            console.warn('[HSPCBNotify] 通知渲染失败:', e && e.message);
            return { ok: false, reason: 'render-error' };
        }
    }

    function requestSystemPermission() {
        try {
            if (typeof Notification === 'undefined') return Promise.resolve('unsupported');
            if (Notification.permission === 'granted' || Notification.permission === 'denied') {
                return Promise.resolve(Notification.permission);
            }
            return Notification.requestPermission();
        } catch (e) { return Promise.resolve('error'); }
    }

    // 内置基础 Provider 占位（ Provider 清单在各自模块注册，如 automation.* ）
    registerProvider('system', '系统提示', true);

    return {
        notify: notify,
        registerProvider: registerProvider,
        isEnabled: isEnabled,
        setMaster: setMaster,
        setProviderEnabled: setProviderEnabled,
        listProviders: listProviders,
        requestSystemPermission: requestSystemPermission,
        _active: function () { return active.length; }
    };
})();

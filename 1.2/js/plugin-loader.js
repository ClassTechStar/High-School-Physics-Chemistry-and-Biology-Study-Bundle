// ============================================================
// plugin-loader.js — 轻插件加载器（v1.5 / T11）
// 借鉴 ClassIsland PluginService 与 Class-Widgets-2 PluginLoader 的最小子集：
//   - 清单 hspcb-plugin.json（必填 id/name/version/apiVersion/entry）
//   - apiVersion 主版本号必须等于本运行时的主版本号，否则拒载
//   - 入口脚本以 <script src> 同源注入（CSP script-src 'self' 天然限制外源）
//   - 失败隔离：超时/报错计数进 HSPCBBoot，连续 2 次失败自动停载
//   - ?safe=1 或 settings.plugins.enabled=false 时全部跳过
// 插件入口调用 window.HSPCBPlugin.register({id,name,version,apiVersion,setup})
// setup(ctx) 收到 ctx：{ id, notify, bus, widgets, store }
// 插件清单在 1.2/plugins/index.json 中登记（相对 1.2 根目录路径）。
// ============================================================
window.HSPCBPlugins = (function () {
    'use strict';

    var API_MAJOR = 1;
    var manifests = [];   // 已成功装载的清单
    var failed = [];      // [{id, reason}]

    function storeKey(pluginId) { return 'plugin.' + pluginId + '.'; }

    function makeCtx(id) {
        return {
            id: id,
            notify: function (payload) {
                try {
                    window.HSPCBNotify && HSPCBNotify.notify(Object.assign({ providerId: 'plugin.' + id }, payload));
                } catch (e) { /* ignore */ }
            },
            bus: window.HSPCBBus || null,
            widgets: window.HSPCBDashboard || null,
            store: {
                get: function (k) { try { return window.HSPCBStore ? HSPCBStore.get(storeKey(id) + k) : null; } catch (e) { return null; } },
                set: function (k, v) { try { window.HSPCBStore && HSPCBStore.set(storeKey(id) + k, v); } catch (e) { /* ignore */ } }
            }
        };
    }

    /** 插件入口的唯一注册口 */
    window.HSPCBPlugin = {
        register: function (meta) {
            try {
                if (!meta || typeof meta.id !== 'string' || typeof meta.setup !== 'function') {
                    throw new Error('清单缺少 id 或 setup');
                }
                var major = parseInt(String(meta.apiVersion || '0').split('.')[0], 10);
                if (major !== API_MAJOR) {
                    throw new Error('apiVersion ' + meta.apiVersion + ' 与运行时 ' + API_MAJOR + '.x 不兼容');
                }
                manifests.push(meta);
                meta.setup(makeCtx(meta.id));
            } catch (e) {
                fail(meta && meta.id || 'unknown', e && e.message || String(e));
            }
        }
    };

    function fail(id, reason) {
        failed.push({ id: id, reason: reason });
        try { window.HSPCBBoot && HSPCBBoot.fail('HSPCBPlugins'); } catch (e) { /* ignore */ }
        try {
            window.HSPCBNotify && HSPCBNotify.notify({
                id: 'plugin.fail.' + id, level: 'warn',
                title: '插件加载失败', message: id + '：' + reason + '（连续失败将自动停载）'
            });
        } catch (e) { /* ignore */ }
    }

    function isDisabled(id) {
        try {
            var s = window.HSPCBProgress && HSPCBProgress.getSettings();
            return !!(s && s.plugins && s.plugins.disabled && s.plugins.disabled[id]);
        } catch (e) { return false; }
    }

    function dirOf(manifestPath) {
        var i = manifestPath.lastIndexOf('/');
        return i >= 0 ? manifestPath.slice(0, i + 1) : '';
    }

    function loadOne(manifestPath) {
        if (typeof fetch !== 'function') return;
        fetch(manifestPath).then(function (r) { return r.ok ? r.json() : null; }).then(function (m) {
            if (!m || !m.id || !m.entry) throw new Error('清单不完整');
            if (isDisabled(m.id)) return; // 用户停用，静默跳过
            var base = dirOf(manifestPath);
            var s = document.createElement('script');
            s.src = base + m.entry;
            s.async = false;
            s.addEventListener('error', function () { fail(m.id, '脚本加载失败'); });
            // 装载超时看门狗：5s 内未注册视为失败
            setTimeout(function () {
                if (!manifests.some(function (x) { return x.id === m.id; })) {
                    fail(m.id, '加载超时（入口未调用 register）');
                }
            }, 5000);
            document.head.appendChild(s);
        }).catch(function (e) {
            fail(manifestPath, e && e.message || '清单读取失败');
        });
    }

    function init() {
        try {
            if (window.HSPCBBoot && HSPCBBoot.pluginsBlocked()) {
                console.info('[HSPCBPlugins] 安全模式或已停载，跳过插件加载');
                return;
            }
            var enabled = true;
            try {
                var st = window.HSPCBProgress && HSPCBProgress.getSettings();
                enabled = !(st && st.plugins && st.plugins.enabled === false);
            } catch (e) { enabled = true; }
            if (!enabled) return;
            if (typeof fetch !== 'function' || typeof document === 'undefined') return;
            fetch('plugins/index.json').then(function (r) { return r.ok ? r.json() : []; }).then(function (list) {
                if (!Array.isArray(list)) return;
                list.forEach(loadOne);
            }).catch(function () { /* 无插件清单：静默 */ });
        } catch (e) { /* ignore */ }
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
        else init();
    }

    return {
        list: function () {
            return manifests.map(function (m) {
                return { id: m.id, name: m.name, version: m.version, apiVersion: m.apiVersion, disabled: isDisabled(m.id) };
            }).concat(failed.map(function (f) {
                return { id: f.id, name: f.id, version: null, apiVersion: null, disabled: false, failed: f.reason };
            }));
        },
        setEnabled: function (id, on) {
            try {
                HSPCBProgress.updateSettings(function (s) { s.plugins.disabled[id] = on === false; });
            } catch (e) { /* ignore */ }
        },
        _loadedCount: function () { return manifests.length; },
        _failedCount: function () { return failed.length; }
    };
})();

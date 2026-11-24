// data-sync.js — 数据可携（v1.9 §3.3）
//
// 学习工具留存的生死线是「换设备数据不丢」。本模块提供三条零后端路径：
//   1. 导出/导入 JSON 文件 —— 全平台兜底；
//   2. File System Access API 另存为 —— Chromium 系直接写本地文件；
//   3. WebDAV 同步（MVP）—— 坚果云/Nextcloud 等任意 WebDAV 服务，
//      用户自备账号，数据只在自己与服务商之间流转，不经本项目任何服务器。
//
// 安全边界：
//   · 导入走与备份恢复相同的结构校验（只接受 app=hspcb 的 bundle，逐键字符串化）；
//   · WebDAV 凭据只存本机 localStorage（明文），设置页明确提示，建议用应用专用密码；
//   · 远端文件是整份快照，上传即覆盖（不做双向合并，避免半同步状态）。
window.HSPCBDatasync = (function () {
    'use strict';

    var CONFIG_KEY = 'datasync.config';
    var BUNDLE_APP = 'hspcb-datasync';
    var BUNDLE_VERSION = 1;

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }

    function getConfig() {
        try {
            var raw = window.HSPCBStore && HSPCBStore.get(CONFIG_KEY);
            var cfg = raw ? JSON.parse(raw) : null;
            return cfg && typeof cfg === 'object' ? cfg : { url: '', user: '', pass: '', file: 'hspcb-sync.json' };
        } catch (e) {
            return { url: '', user: '', pass: '', file: 'hspcb-sync.json' };
        }
    }

    function saveConfig(cfg) {
        var out = {
            url: String(cfg.url || '').trim(),
            user: String(cfg.user || ''),
            pass: String(cfg.pass || ''),
            // 文件名规范化：去掉首尾斜杠，空值回退默认（与 davUrl 的拼接约定一致）
            file: String(cfg.file || 'hspcb-sync.json').trim().replace(/^\/+|\/+$/g, '') || 'hspcb-sync.json'
        };
        try { HSPCBStore.set(CONFIG_KEY, JSON.stringify(out)); } catch (e) { /* ignore */ }
        return out;
    }

    /* ---------------- bundle ---------------- */

    function buildBundle() {
        var store = {};
        try {
            store = (window.HSPCBStore && HSPCBStore.dump) ? HSPCBStore.dump() : {};
        } catch (e) { store = {}; }
        return {
            app: BUNDLE_APP,
            version: BUNDLE_VERSION,
            appVersion: (document.documentElement.getAttribute('data-app-version') || ''),
            exportedAt: new Date().toISOString(),
            store: store
        };
    }

    function parseBundle(text) {
        var b;
        try { b = typeof text === 'string' ? JSON.parse(text) : text; }
        catch (e) { return { ok: false, error: '不是合法 JSON' }; }
        if (!b || b.app !== BUNDLE_APP) return { ok: false, error: '不是本应用的数据快照' };
        if (Number(b.version) > BUNDLE_VERSION) return { ok: false, error: '快照版本比当前应用新，请先升级' };
        if (!b.store || typeof b.store !== 'object') return { ok: false, error: '快照缺少 store 数据' };
        return { ok: true, bundle: b };
    }

    /**
     * 应用快照。mode='replace' 先清空本命名空间再写入；'merge' 仅覆盖同名键。
     * 返回 { ok, written }。
     */
    function applyBundle(bundle, mode) {
        var b = bundle && bundle.bundle ? bundle.bundle : bundle;
        var check = parseBundle(b);
        if (!check.ok) return { ok: false, error: check.error };

        var written = 0;
        try {
            if (mode === 'replace' && window.HSPCBStore && HSPCBStore.purgeAll) {
                // purgeAll 会清命名空间与旧裸 key，避免导入后旧数据"复活"
                HSPCBStore.purgeAll();
            }
            written = (window.HSPCBStore && HSPCBStore.restore)
                ? HSPCBStore.restore(check.bundle.store)
                : 0;
        } catch (e) {
            return { ok: false, error: String(e && e.message || e) };
        }
        return { ok: true, written: written };
    }

    /* ---------------- 文件导出/导入 ---------------- */

    function downloadBundle() {
        var text = JSON.stringify(buildBundle(), null, 2);
        var blob = new Blob([text], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'hspcb-sync-' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        return true;
    }

    /** Chromium：直接用系统「另存为」写盘；不支持时回退下载。 */
    function saveToFile() {
        if (!window.showSaveFilePicker) { downloadBundle(); return Promise.resolve({ ok: true, fallback: true }); }
        var text = JSON.stringify(buildBundle(), null, 2);
        return window.showSaveFilePicker({
            suggestedName: 'hspcb-sync-' + new Date().toISOString().slice(0, 10) + '.json',
            types: [{ description: 'HSPCB 学习数据', accept: { 'application/json': ['.json'] } }]
        }).then(function (handle) {
            return handle.createWritable().then(function (w) {
                return w.write(text).then(function () { return w.close(); });
            }).then(function () { return { ok: true }; });
        }).catch(function (e) {
            return { ok: false, error: String(e && e.message || e) };
        });
    }

    /** 读取用户选择的文件并导入；返回 Promise<{ok, written?, error?}> */
    function importFromFile(file) {
        if (!file) return Promise.resolve({ ok: false, error: '未选择文件' });
        return new Promise(function (resolve) {
            var reader = new FileReader();
            reader.onload = function () {
                var r = parseBundle(String(reader.result || ''));
                if (!r.ok) { resolve(r); return; }
                resolve(applyBundle(r.bundle, 'merge'));
            };
            reader.onerror = function () { resolve({ ok: false, error: '读取文件失败' }); };
            reader.readAsText(file);
        });
    }

    /* ---------------- WebDAV ---------------- */

    function davUrl(cfg) {
        var base = String(cfg.url || '').replace(/\/+$/, '');
        var file = String(cfg.file || 'hspcb-sync.json').replace(/^\/+/, '');
        return base ? base + '/' + file : '';
    }

    function authHeader(cfg) {
        if (!cfg.user) return {};
        try { return { Authorization: 'Basic ' + btoa(cfg.user + ':' + cfg.pass) }; }
        catch (e) { return {}; }
    }

    function webdavPut(cfg) {
        var url = davUrl(cfg);
        if (!url) return Promise.resolve({ ok: false, error: '未配置 WebDAV 地址' });
        var headers = authHeader(cfg);
        headers['Content-Type'] = 'application/json';
        return fetch(url, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(buildBundle(), null, 2)
        }).then(function (res) {
            if (res.ok || res.status === 201 || res.status === 204) {
                return { ok: true, status: res.status, at: new Date().toISOString() };
            }
            return { ok: false, error: 'HTTP ' + res.status };
        }).catch(function (e) {
            return { ok: false, error: '网络错误：' + String(e && e.message || e) };
        });
    }

    function webdavGet(cfg) {
        var url = davUrl(cfg);
        if (!url) return Promise.resolve({ ok: false, error: '未配置 WebDAV 地址' });
        return fetch(url, { method: 'GET', headers: authHeader(cfg) })
            .then(function (res) {
                if (!res.ok) return { ok: false, error: 'HTTP ' + res.status };
                return res.text();
            })
            .then(function (text) {
                if (typeof text !== 'string') return text;
                var r = parseBundle(text);
                if (!r.ok) return r;
                var applied = applyBundle(r.bundle, 'merge');
                if (!applied.ok) return applied;
                return { ok: true, written: applied.written, at: r.bundle.exportedAt || '' };
            })
            .catch(function (e) {
                return { ok: false, error: '网络错误：' + String(e && e.message || e) };
            });
    }

    /** 打开文件选择器（供设置页按钮复用）。 */
    function pickAndImport() {
        return new Promise(function (resolve) {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json,.json';
            input.addEventListener('change', function () {
                var f = input.files && input.files[0];
                resolve(importFromFile(f));
            });
            input.click();
        });
    }

    return {
        getConfig: getConfig,
        saveConfig: saveConfig,
        buildBundle: buildBundle,
        parseBundle: parseBundle,
        applyBundle: applyBundle,
        downloadBundle: downloadBundle,
        saveToFile: saveToFile,
        importFromFile: importFromFile,
        pickAndImport: pickAndImport,
        webdavPut: webdavPut,
        webdavGet: webdavGet
    };
})();

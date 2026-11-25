// data-sync.js — 数据可携（v1.9 §3.3 / v1.10 T15）
//
// 学习工具留存的生死线是「换设备数据不丢」。本模块提供三条零后端路径：
//   1. 导出/导入 JSON 文件 —— 全平台兜底；
//   2. File System Access API 另存为 —— Chromium 系直接写本地文件；
//   3. WebDAV 同步 —— 坚果云/Nextcloud 等任意 WebDAV 服务，
//      用户自备账号，数据只在自己与服务商之间流转，不经本项目任何服务器。
//
// v1.10 T15 可靠性升级：
//   · bundle 增加 progress（hspcb.v2.progress 全量学习数据）+ meta（Store 键级更新时间）
//     + deviceId —— 此前只导出 hspcb.st.*，错题本/进度其实没同步；
//   · 合并按时间戳判断：远端更新才覆盖，本机更新则跳过并列入 stale；
//     两端在 5 分钟窗口内都改过且值不同 → conflicts，默认保留本机，可再选择用远端覆盖；
//   · 双方都无时间戳（v1 旧快照）时保持旧行为：导入优先覆盖，避免"导入了没反应"。
//
// 安全边界：
//   · 导入走与备份恢复相同的结构校验（只接受 app=hspcb 的 bundle，逐键字符串化）；
//   · progress 部分交给 HSPCBProgress.importData（白名单净化 + 配额失败回滚）；
//   · WebDAV 凭据只存本机 localStorage（明文），设置页明确提示，建议用应用专用密码；
//   · 远端文件是整份快照，上传即覆盖（不做自动三方合并，宁可少同步也不静默丢）。
window.HSPCBDatasync = (function () {
    'use strict';

    var CONFIG_KEY = 'datasync.config';
    var BUNDLE_APP = 'hspcb-datasync';
    var BUNDLE_VERSION = 2;
    // 冲突窗口：两端时间戳差在该窗口内视为"同时修改"，无法判断谁更新 → 交用户决定。
    // 取 5 分钟是为了容忍设备时钟漂移（手机与电脑常有几十秒到几分钟误差）。
    var CONFLICT_WINDOW_MS = 5 * 60 * 1000;
    var DEVICE_KEY = 'hspcb.datasync.deviceId';

    var lastBundle = null;
    var lastConflicts = [];

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }

    /** 本机标识：只用于快照里标注来源，不参与冲突判定，永不离开本机与用户自己的远端。 */
    function getDeviceId() {
        var id = null;
        try { id = localStorage.getItem(DEVICE_KEY); } catch (e) { id = null; }
        if (!id) {
            id = 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
            try { localStorage.setItem(DEVICE_KEY, id); } catch (e) { /* 私密模式：本次会话用临时 id */ }
        }
        return id || 'dev-unknown';
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
        // v1.10 T15：WebDAV 凭据存在 Store 命名空间，但绝不能进入快照/远端文件
        delete store[CONFIG_KEY];
        var meta = {};
        try {
            meta = (window.HSPCBStore && HSPCBStore.metaDump) ? HSPCBStore.metaDump() : {};
        } catch (e) { meta = {}; }
        var progress = null;
        try {
            progress = (window.HSPCBProgress && HSPCBProgress.exportData)
                ? HSPCBProgress.exportData() : null;
        } catch (e) { progress = null; }
        return {
            app: BUNDLE_APP,
            version: BUNDLE_VERSION,
            appVersion: (document.documentElement.getAttribute('data-app-version') || ''),
            deviceId: getDeviceId(),
            exportedAt: new Date().toISOString(),
            store: store,
            meta: meta,
            progress: progress
        };
    }

    function parseBundle(text) {
        var b;
        try { b = typeof text === 'string' ? JSON.parse(text) : text; }
        catch (e) { return { ok: false, error: '不是合法 JSON' }; }
        if (!b || b.app !== BUNDLE_APP) return { ok: false, error: '不是本应用的数据快照' };
        if (Number(b.version) > BUNDLE_VERSION) return { ok: false, error: '快照版本比当前应用新，请先升级' };
        if (!b.store || typeof b.store !== 'object') return { ok: false, error: '快照缺少 store 数据' };
        if (b.progress != null && typeof b.progress !== 'object') {
            return { ok: false, error: '快照的进度数据格式不正确' };
        }
        return { ok: true, bundle: b };
    }

    /**
     * 应用快照。
     * mode='merge'（默认）按时间戳合并；'replace' 清空后全量写入；'force' 不看时间戳全量覆盖。
     * opts.forceKeys：指定键强制用远端值（冲突解决用，键名 'progress' 表示进度主档）。
     * 返回 { ok, written, progress, stale[], conflicts[], fromDevice, exportedAt }。
     */
    function applyBundle(bundle, mode, opts) {
        opts = opts || {};
        var b = bundle && bundle.bundle ? bundle.bundle : bundle;
        var check = parseBundle(b);
        if (!check.ok) return { ok: false, error: check.error };

        var storeApi = window.HSPCBStore;
        var local = {};
        try { local = (storeApi && storeApi.dump) ? storeApi.dump() : {}; } catch (e) { local = {}; }
        var localMeta = {};
        try { localMeta = (storeApi && storeApi.metaDump) ? storeApi.metaDump() : {}; } catch (e) { localMeta = {}; }
        var remoteMeta = (b.meta && typeof b.meta === 'object') ? b.meta : {};
        var exportedAt = Date.parse(b.exportedAt || '') || 0;

        var forceAll = mode === 'replace' || mode === 'force';
        var forceKeys = Array.isArray(opts.forceKeys) ? opts.forceKeys : null;
        var forced = function (key) {
            return forceAll || (forceKeys && forceKeys.indexOf(key) >= 0);
        };

        var stale = [];
        var conflicts = [];
        var toWrite = {};
        var incoming = (b.store && typeof b.store === 'object') ? b.store : {};
        for (var k in incoming) {
            if (!Object.prototype.hasOwnProperty.call(incoming, k)) continue;
            if (k === '__meta__') continue;
            var rv = incoming[k];
            if (typeof rv !== 'string') continue;
            if (forced(k)) { toWrite[k] = rv; continue; }

            var hasLocal = Object.prototype.hasOwnProperty.call(local, k);
            var lv = hasLocal ? local[k] : null;
            if (!hasLocal) { toWrite[k] = rv; continue; }
            if (lv === rv) continue;

            var rt = Number(remoteMeta[k]) || exportedAt || 0;
            var lt = Number(localMeta[k]) || 0;
            if (rt === 0) {
                // 远端是 v1 旧快照且本地也没有时间戳 → 保持"导入优先"的旧行为；
                // 本地有明确更新时间而远端未知 → 保守跳过（旧包不能覆盖本机新数据）。
                if (lt === 0) toWrite[k] = rv;
                else stale.push(k);
            } else if (rt - lt > CONFLICT_WINDOW_MS) {
                toWrite[k] = rv;
            } else if (lt - rt > CONFLICT_WINDOW_MS) {
                stale.push(k);
            } else {
                // 两端在冲突窗口内都改过且值不同：默认保留本机，交用户决定
                conflicts.push(k);
            }
        }

        var written = 0;
        try {
            if (mode === 'replace' && storeApi && storeApi.purgeAll) storeApi.purgeAll();
            if (Object.keys(toWrite).length) {
                written = storeApi && storeApi.restore
                    ? storeApi.restore(toWrite, remoteMeta)
                    : 0;
            } else if (mode === 'replace' && storeApi && storeApi.restore) {
                storeApi.restore({}, remoteMeta); // replace 空快照：至少把时间线恢复成远端
            }
        } catch (e) {
            return { ok: false, error: String(e && e.message || e) };
        }

        // ---- 进度主档（hspcb.v2.progress）：单键，用其自身 meta.updatedAt 判断新旧 ----
        var progressResult = 'none';
        var incomingProgress = (b.progress && typeof b.progress === 'object') ? b.progress : null;
        if (incomingProgress) {
            var P = window.HSPCBProgress;
            if (!(P && P.importData)) {
                progressResult = 'unsupported';
            } else if (forced('progress')) {
                var pr = P.importData(incomingProgress, mode === 'replace' || mode === 'force' ? 'replace' : 'merge');
                if (!pr || !pr.ok) return { ok: false, error: (pr && pr.error) || '进度写入失败' };
                progressResult = 'applied';
            } else {
                var remoteProgressAt = Date.parse((incomingProgress.meta && incomingProgress.meta.updatedAt)
                    || b.exportedAt || '') || 0;
                var localProgress = null;
                try { localProgress = P.exportData ? P.exportData() : null; } catch (e) { localProgress = null; }
                var localProgressAt = Date.parse((localProgress && localProgress.meta && localProgress.meta.updatedAt) || '') || 0;
                if (!localProgressAt && !remoteProgressAt) {
                    progressResult = 'skipped';
                } else if (remoteProgressAt - localProgressAt > CONFLICT_WINDOW_MS) {
                    var pr2 = P.importData(incomingProgress, 'merge');
                    if (!pr2 || !pr2.ok) return { ok: false, error: (pr2 && pr2.error) || '进度写入失败' };
                    progressResult = 'merged';
                } else if (localProgressAt - remoteProgressAt > CONFLICT_WINDOW_MS) {
                    stale.push('progress');
                    progressResult = 'skipped';
                } else {
                    conflicts.push('progress');
                    progressResult = 'conflict';
                }
            }
        }

        lastBundle = b;
        lastConflicts = conflicts.slice();
        return {
            ok: true,
            written: written,
            progress: progressResult,
            stale: stale,
            conflicts: conflicts,
            fromDevice: b.deviceId || '',
            exportedAt: b.exportedAt || '',
            mode: mode || 'merge'
        };
    }

    /**
     * 冲突解决：choice='remote' 用上次快照的远端值强制覆盖冲突键；
     * 其他值 = 保留本机（仅关闭提示）。
     */
    function resolveConflicts(choice) {
        if (choice !== 'remote') return { ok: true, resolved: 'local' };
        if (!lastBundle) return { ok: false, error: '没有可用的远端快照' };
        if (!lastConflicts.length) return { ok: true, resolved: 'none' };
        return applyBundle(lastBundle, 'merge', { forceKeys: lastConflicts });
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
                return {
                    ok: true,
                    written: applied.written,
                    progress: applied.progress,
                    stale: applied.stale,
                    conflicts: applied.conflicts,
                    fromDevice: applied.fromDevice,
                    at: r.bundle.exportedAt || ''
                };
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
        getDeviceId: getDeviceId,
        buildBundle: buildBundle,
        parseBundle: parseBundle,
        applyBundle: applyBundle,
        resolveConflicts: resolveConflicts,
        downloadBundle: downloadBundle,
        saveToFile: saveToFile,
        importFromFile: importFromFile,
        pickAndImport: pickAndImport,
        webdavPut: webdavPut,
        webdavGet: webdavGet
    };
})();

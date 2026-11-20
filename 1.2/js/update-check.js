// ============================================================
// update-check.js — 检查更新（v1.8.1，双端统一入口）
// 更新源（按序尝试，任一成功即用）：
//   1. GitHub Releases API   —— 权威源（tag + 说明 + CI 自动构建的 APK 附件）
//   2. Gitee Releases API    —— 大陆网络回退（仅版本号与发布页）
//   3. GitHub raw 清单        —— 仓库 1.2/update-manifest.json（轻量兜底）
//   4. Gitee raw 清单         —— 同上，大陆网络兜底
// 结果写入 HSPCBUpdate.lastResult 并派发 'hspcb-update-result' 事件
//（设置中心据此渲染）；24h 频控存 settings.update.lastCheck，手动检查跳过。
//
// 安卓端（window.HSPCBNative 存在，由 MainActivity 注入）：
//   checkUpdate/downloadUpdate 走原生 —— 发现新版可下载 APK 并唤起系统安装器；
//   原生结果经 window.__hspcbUpdateResult(json) 回调回本文件。
// 浏览器/PWA：发现新版提示刷新（GitHub Pages 部署即最新代码）或打开发布页。
// 隐私：仅向上述两个代码托管域发起只读 GET，无任何用户数据上传。
// ============================================================
window.HSPCBUpdate = (function () {
    'use strict';

    var GH_REPO = 'ClassTechStar/High-School-Physics-Chemistry-and-Biology-Study-Bundle';
    var GITEE_REPO = 'qualcommsnapdragon/High-School-Physics-Chemistry-and-Biology-Study-Bundle';
    var RELEASE_URL = 'https://github.com/' + GH_REPO + '/releases/latest';
    var DAY = 24 * 3600 * 1000;

    var lastResult = null;
    var currentCheck = null; // 进行中的检查（autoCheck 与手动检查共享同一 Promise）

    function currentVersion() {
        var v = document.documentElement.getAttribute('data-app-version');
        return v || '0.0.0';
    }

    function norm(v) {
        var m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(String(v || ''));
        return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [0, 0, 0];
    }

    function isNewer(remote, local) {
        var r = norm(remote), l = norm(local);
        for (var i = 0; i < 3; i++) {
            if (r[i] !== l[i]) return r[i] > l[i];
        }
        return false;
    }

    /**
     * 从 release assets 里选 APK：优先「文件名含 tag 版本串且最后上传」的附件
     * ——多附件并存时（如 CI 构建与人工签名件同名族），后者才是可覆盖安装的
     * 推荐件；找不到匹配时回退最后一个 .apk。
     */
    function pickApk(rel, tag) {
        var assets = rel.assets || [];
        var key = String(tag || '').replace(/^v/i, '');
        var lastApk = null, matched = null;
        for (var i = 0; i < assets.length; i++) {
            var a = assets[i];
            if (!/\.apk$/i.test(a.name || '')) continue;
            lastApk = a.browser_download_url;
            if (key && (a.name || '').indexOf(key) >= 0) matched = a.browser_download_url;
        }
        return matched || lastApk;
    }

    function xhrJSON(url, timeout) {
        return new Promise(function (resolve, reject) {
            try {
                var x = new XMLHttpRequest();
                x.open('GET', url, true);
                x.timeout = timeout || 8000;
                x.onload = function () {
                    if (x.status >= 200 && x.status < 300) {
                        try { resolve(JSON.parse(x.responseText)); } catch (e) { reject(e); }
                    } else reject(new Error('HTTP ' + x.status));
                };
                x.onerror = function () { reject(new Error('network')); };
                x.ontimeout = function () { reject(new Error('timeout')); };
                x.send(null);
            } catch (e) { reject(e); }
        });
    }

    /** 逐源尝试，返回 {version, notes, releaseUrl, apkUrl, source} 或 null */
    function fetchRemote() {
        var GH_API = 'https://api.github.com/repos/' + GH_REPO + '/releases/latest';
        var GITEE_API = 'https://gitee.com/api/v5/repos/' + GITEE_REPO + '/releases/latest';
        var GH_RAW = 'https://raw.githubusercontent.com/' + GH_REPO + '/main/1.2/update-manifest.json';
        var GITEE_RAW = 'https://gitee.com/' + GITEE_REPO + '/raw/main/1.2/update-manifest.json';

        return xhrJSON(GH_API, 8000).then(function (rel) {
            if (!rel || !rel.tag_name) throw new Error('empty');
            var apk = pickApk(rel, rel.tag_name);
            return {
                version: rel.tag_name,
                notes: rel.body || '',
                releaseUrl: rel.html_url || RELEASE_URL,
                apkUrl: apk,
                source: 'github-release'
            };
        }).catch(function () {
            return xhrJSON(GITEE_API, 8000).then(function (rel) {
                if (!rel || !rel.tag_name) throw new Error('empty');
                return {
                    version: rel.tag_name,
                    notes: rel.body || '',
                    releaseUrl: rel.html_url || ('https://gitee.com/' + GITEE_REPO + '/releases'),
                    apkUrl: null,
                    source: 'gitee-release'
                };
            }).catch(function () {
                return xhrJSON(GH_RAW, 8000).then(function (m) {
                    if (!m || !m.version) throw new Error('empty');
                    return {
                        version: m.version,
                        notes: m.notes || '',
                        releaseUrl: RELEASE_URL,
                        apkUrl: m.apk ? 'https://github.com/' + GH_REPO + '/releases/download/v' + m.version + '/' + m.apk : null,
                        source: 'github-manifest'
                    };
                }).catch(function () {
                    return xhrJSON(GITEE_RAW, 8000).then(function (m) {
                        if (!m || !m.version) throw new Error('empty');
                        return {
                            version: m.version,
                            notes: m.notes || '',
                            releaseUrl: 'https://gitee.com/' + GITEE_REPO + '/releases',
                            apkUrl: m.apk ? 'https://gitee.com/' + GITEE_REPO + '/releases/download/v' + m.version + '/' + m.apk : null,
                            source: 'gitee-manifest'
                        };
                    });
                });
            });
        });
    }

    function publish(result) {
        lastResult = result;
        try {
            window.dispatchEvent(new CustomEvent('hspcb-update-result', { detail: result }));
        } catch (e) { /* ignore */ }
        return result;
    }

    function markChecked() {
        try {
            if (window.HSPCBProgress && HSPCBProgress.updateSettings) {
                HSPCBProgress.updateSettings(function (s) {
                    s.update = s.update || {};
                    s.update.lastCheck = Date.now();
                });
            }
        } catch (e) { /* ignore */ }
    }

    function shouldAutoCheck() {
        try {
            var s = window.HSPCBProgress && HSPCBProgress.getSettings();
            var last = s && s.update && s.update.lastCheck;
            return !last || (Date.now() - last) > DAY;
        } catch (e) { return true; }
    }

    /* ---------------- 浏览器路径 ---------------- */

    function checkWeb(manual) {
        return fetchRemote().then(function (r) {
            markChecked();
            var local = currentVersion();
            r.hasUpdate = isNewer(r.version, local);
            r.localVersion = local;
            r.checkedAt = new Date().toISOString();
            publish(r);
            if (r.hasUpdate) {
                window.HSPCBNotify && HSPCBNotify.notify({
                    id: 'update.available.' + r.version,
                    level: 'info', duration: 0, closable: true,
                    title: '发现新版本 ' + r.version,
                    message: '当前 ' + local + '。可在 设置 → 通用 → 检查更新 打开发布页获取。'
                });
            } else if (manual) {
                window.HSPCBNotify && HSPCBNotify.notify({
                    id: 'update.latest.' + Date.now(),
                    level: 'info', duration: 4000,
                    title: '已是最新版本', message: '当前 ' + local + '（更新源：' + r.source + '）。'
                });
            }
            return r;
        }).catch(function (e) {
            var r = { ok: false, error: String(e && e.message || e), hasUpdate: false, localVersion: currentVersion() };
            publish(r);
            if (manual) {
                window.HSPCBNotify && HSPCBNotify.notify({
                    id: 'update.err.' + Date.now(), level: 'warn', duration: 5000,
                    title: '检查更新失败', message: '无法访问更新源（GitHub/Gitee），请稍后重试。'
                });
            }
            return r;
        });
    }

    /* ---------------- 安卓路径（经原生桥） ---------------- */

    var nativePending = null;
    window.__hspcbUpdateResult = function (json) {
        // 原生桥回调：json 由 UpdateManager 以 org.json 生成，结构见 UpdateManager
        try {
            var r = typeof json === 'string' ? JSON.parse(json) : json;
            r.checkedAt = new Date().toISOString();
            if (!r.localVersion) r.localVersion = currentVersion();
            markChecked();
            publish(r);
            if (nativePending) { nativePending(r); nativePending = null; }
        } catch (e) { /* ignore */ }
    };

    function checkNative(manual) {
        return new Promise(function (resolve) {
            nativePending = resolve;
            try {
                window.HSPCBNative.checkUpdate();
            } catch (e) {
                resolve({ ok: false, error: String(e && e.message || e), hasUpdate: false });
            }
            if (typeof setTimeout === 'function') {
                setTimeout(function () {
                    if (nativePending) {
                        nativePending({ ok: false, error: 'timeout', hasUpdate: false });
                        nativePending = null;
                    }
                }, 15000);
            }
        });
    }

    function isNative() {
        return typeof window.HSPCBNative !== 'undefined' && window.HSPCBNative &&
            typeof window.HSPCBNative.checkUpdate === 'function';
    }

    /**
     * 统一入口。
     * manual=true 时跳过频控并在失败/已是最新时给出即时反馈。
     * 并发调用（如启动自动检查与用户手点）共享同一次检查结果。
     */
    function check(manual) {
        if (currentCheck) return currentCheck;
        currentCheck = Promise.resolve(
            isNative() ? checkNative(manual) : checkWeb(manual)
        ).then(function (r) {
            currentCheck = null;
            return r;
        }).catch(function (e) {
            currentCheck = null;
            return { ok: false, error: String(e), hasUpdate: false, localVersion: currentVersion() };
        });
        return currentCheck;
    }

    /** 安卓：触发原生下载（完成后原生自动唤起安装器） */
    function downloadApk() {
        if (isNative() && typeof window.HSPCBNative.downloadUpdate === 'function') {
            window.HSPCBNative.downloadUpdate();
            return true;
        }
        return false;
    }

    /** 安卓启动自动检查（24h 频控由原生侧 SharedPreferences 控制） */
    function autoCheck() {
        if (isNative()) {
            if (shouldAutoCheck()) {
                try { window.HSPCBNative.checkUpdate(); } catch (e) { /* ignore */ }
            }
            return;
        }
        if (shouldAutoCheck()) check(false);
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoCheck);
        else autoCheck();
    }

    return {
        check: check,
        downloadApk: downloadApk,
        isNative: isNative,
        autoCheck: autoCheck,
        currentVersion: currentVersion,
        isNewer: isNewer,
        get lastResult() { return lastResult; }
    };
})();

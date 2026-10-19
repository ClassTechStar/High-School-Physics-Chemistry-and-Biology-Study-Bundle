// ============================================================
// progress.js — HSPCB 统一学习进度存储 (Phase A / A5)
// 目标:
//   1. 唯一权威 key 前缀 hspcb.v2.*
//   2. 启动时从 v1 裸 key 迁移
//   3. 提供 export/import，便于换机与备份
// 用法:
//   <script src="js/progress.js"></script>
//   HSPCBProgress.get('wrongQuestions')
//   HSPCBProgress.append('wrongQuestions', item)
// ES5 兼容, 零依赖
// ============================================================

window.HSPCBProgress = (function () {
    'use strict';

    var NS = 'hspcb.v2.';
    var SCHEMA_VERSION = 2;
    var MIGRATED_FLAG = NS + 'migratedFromV1';

    /** 默认结构 */
    var DEFAULTS = {
        theme: 'light',
        wrongQuestions: [],
        notes: [],
        examHistory: [],
        quizRecords: [],
        dailyCheckin: [],
        studyTime: [],
        toolsUsed: [],
        openAnswerRecords: [],
        gameScores: {},
        moduleStats: {},
        coverageSnapshots: [],
        variationChains: [],
        selfScoreSessions: [],
        sprintMode: null,
        meta: { schemaVersion: SCHEMA_VERSION, updatedAt: null }
    };

    /** v1 key → v2 path 映射（仅列表/对象，字符串主题单独处理） */
    var V1_MAP = [
        // 错题: 多源合并
        { v1: 'hspcb_wrong_records', v2: 'wrongQuestions', merge: true },
        { v1: 'hspcb_error_notebook', v2: 'wrongQuestions', merge: true },
        { v1: 'wrongPhotosynthesis', v2: 'wrongQuestions', merge: true, wrap: function (arr, v1key) {
            if (!Array.isArray(arr)) return [];
            return arr.map(function (x) {
                return Object.assign({ sourceModule: 'photosynthesis', legacyKey: v1key }, x);
            });
        } },
        { v1: 'photo_wrong_answers', v2: 'wrongQuestions', merge: true, wrap: function (arr, v1key) {
            if (!Array.isArray(arr)) return [];
            return arr.map(function (x) {
                return Object.assign({ sourceModule: 'photo', legacyKey: v1key }, x);
            });
        } },

        // 笔记
        { v1: 'hspcb_notes', v2: 'notes', merge: true },
        { v1: 'hspcb_notebook', v2: 'notes', merge: true },

        // 考试/练习历史
        { v1: 'hspcb_exam_history', v2: 'examHistory', merge: true },
        { v1: 'mockExamHistory', v2: 'examHistory', merge: true, wrap: function (arr, v1key) {
            if (!Array.isArray(arr)) return [];
            return arr.map(function (x) {
                return Object.assign({ sourceModule: 'mock-exam', legacyKey: v1key }, x);
            });
        } },

        // 刷题
        { v1: 'hspcb_quiz_records', v2: 'quizRecords', merge: true },
        { v1: 'examPractice_stats', v2: 'moduleStats.examPractice', merge: false },
        { v1: 'genetics_history', v2: 'moduleStats.genetics.history', merge: false },
        { v1: 'genetics_score', v2: 'moduleStats.genetics.score', merge: false },
        { v1: 'safety_history', v2: 'moduleStats.chemSafety.history', merge: false },
        { v1: 'equationFavorites', v2: 'moduleStats.equationFavorites', merge: false },
        { v1: 'cn_sentence_correction_history', v2: 'moduleStats.cnSentence.history', merge: false },

        // 打卡 / 时长 / 工具
        { v1: 'hspcb_daily_checkin', v2: 'dailyCheckin', merge: true },
        { v1: 'dailyLearningState', v2: 'moduleStats.dailyLearning', merge: false },
        { v1: 'hspcb_study_time', v2: 'studyTime', merge: true },
        { v1: 'hspcb_tools_used', v2: 'toolsUsed', merge: true },
        { v1: 'hspcb_open_answer_records', v2: 'openAnswerRecords', merge: true },
        { v1: 'hspcb_recitation_scores', v2: 'moduleStats.recitation', merge: false },
        { v1: 'photo_score', v2: 'moduleStats.photoScore', merge: false },
        { v1: 'hspcb_spaced_repetition', v2: 'moduleStats.spacedRepetition', merge: false },
        { v1: 'hspcb_scratchpad_data', v2: 'moduleStats.scratchpad', merge: false },

        // 游戏
        { v1: 'hspcb_game_scores', v2: 'gameScores', merge: true },
        { v1: 'hspcb_concept_game_best', v2: 'gameScores.concept', merge: false },
        { v1: 'hspcb_card_game_best', v2: 'gameScores.card', merge: false }
    ];

    var THEME_KEYS = [
        { v1: 'hspcb_theme', path: 'theme' },
        { v1: 'hspcb_dark_mode', path: 'theme', map: function (v) { return (v === '1' || v === 'true') ? 'dark' : 'light'; } }
    ];

    function storageAvailable() {
        try {
            var k = NS + '__probe';
            localStorage.setItem(k, '1');
            localStorage.removeItem(k);
            return true;
        } catch (e) {
            return false;
        }
    }

    function safeParse(raw, fallback) {
        if (raw == null || raw === '') return fallback;
        try {
            var v = JSON.parse(raw);
            return v == null ? fallback : v;
        } catch (e) {
            return fallback;
        }
    }

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function getByPath(obj, path) {
        var parts = path.split('.');
        var cur = obj;
        for (var i = 0; i < parts.length; i++) {
            if (cur == null || typeof cur !== 'object') return undefined;
            cur = cur[parts[i]];
        }
        return cur;
    }

    function setByPath(obj, path, value) {
        var parts = path.split('.');
        var cur = obj;
        for (var i = 0; i < parts.length - 1; i++) {
            var p = parts[i];
            if (cur[p] == null || typeof cur[p] !== 'object') cur[p] = {};
            cur = cur[p];
        }
        cur[parts[parts.length - 1]] = value;
    }

    /** 读取整个进度对象（内存缓存 + localStorage） */
    var _cache = null;

    function loadAll() {
        if (_cache) return _cache;
        if (!storageAvailable()) {
            _cache = clone(DEFAULTS);
            return _cache;
        }
        var raw = localStorage.getItem(NS + 'progress');
        var data = safeParse(raw, null);
        if (!data || typeof data !== 'object') {
            data = clone(DEFAULTS);
        }
        // 补默认字段
        for (var k in DEFAULTS) {
            if (data[k] === undefined) data[k] = clone(DEFAULTS[k]);
        }
        _cache = data;
        return _cache;
    }

    function saveAll() {
        if (!storageAvailable() || !_cache) return false;
        _cache.meta = _cache.meta || {};
        _cache.meta.schemaVersion = SCHEMA_VERSION;
        _cache.meta.updatedAt = new Date().toISOString();
        try {
            localStorage.setItem(NS + 'progress', JSON.stringify(_cache));
            return true;
        } catch (e) {
            console.error('HSPCBProgress.saveAll 失败', e);
            return false;
        }
    }

    function get(path, fallback) {
        var data = loadAll();
        if (!path) return data;
        var v = getByPath(data, path);
        return v === undefined ? fallback : v;
    }

    function set(path, value) {
        var data = loadAll();
        setByPath(data, path, value);
        return saveAll();
    }

    function append(path, item) {
        var data = loadAll();
        var arr = getByPath(data, path);
        if (!Array.isArray(arr)) {
            arr = [];
            setByPath(data, path, arr);
        }
        arr.push(item);
        return saveAll();
    }

    function mergeArray(path, items, idKey) {
        if (!Array.isArray(items)) return 0;
        var data = loadAll();
        var arr = getByPath(data, path);
        if (!Array.isArray(arr)) {
            arr = [];
            setByPath(data, path, arr);
        }
        var seen = {};
        if (idKey) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] && arr[i][idKey] != null) seen[arr[i][idKey]] = true;
            }
        }
        var added = 0;
        for (var j = 0; j < items.length; j++) {
            var it = items[j];
            if (!it) continue;
            if (idKey && it[idKey] != null && seen[it[idKey]]) continue;
            if (idKey && it[idKey] != null) seen[it[idKey]] = true;
            arr.push(it);
            added += 1;
        }
        saveAll();
        return added;
    }

    function uniqueById(list, idKey) {
        var seen = {};
        var out = [];
        for (var i = 0; i < list.length; i++) {
            var it = list[i];
            if (!it || typeof it !== 'object') continue;
            var id = idKey && it[idKey] != null ? it[idKey] : JSON.stringify(it);
            if (seen[id]) continue;
            seen[id] = true;
            out.push(it);
        }
        return out;
    }

    /* ── v1 → v2 迁移 ── */

    function readV1(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    function migrateFromV1(options) {
        options = options || {};
        var force = !!options.force;
        var removeLegacy = !!options.removeLegacy;
        if (!storageAvailable()) {
            return { migrated: false, reason: 'storage-unavailable', merged: {} };
        }
        if (!force && localStorage.getItem(MIGRATED_FLAG) === '1') {
            return { migrated: false, reason: 'already-done', merged: {} };
        }

        var data = loadAll();
        var merged = {};
        var touchedLegacy = [];

        // theme
        for (var t = 0; t < THEME_KEYS.length; t++) {
            var tk = THEME_KEYS[t];
            var rawTheme = readV1(tk.v1);
            if (rawTheme == null) continue;
            var themeVal = tk.map ? tk.map(rawTheme) : rawTheme;
            if (themeVal === 'dark' || themeVal === 'light') {
                data.theme = themeVal;
                merged[tk.v1] = themeVal;
                touchedLegacy.push(tk.v1);
            }
        }

        for (var i = 0; i < V1_MAP.length; i++) {
            var m = V1_MAP[i];
            var raw = readV1(m.v1);
            if (raw == null) continue;
            var parsed = safeParse(raw, null);
            if (parsed == null) continue;

            var value = m.wrap ? m.wrap(parsed, m.v1) : parsed;

            if (m.merge) {
                var idKey = 'id';
                var existing = getByPath(data, m.v2);
                if (!Array.isArray(existing)) {
                    setByPath(data, m.v2, Array.isArray(value) ? value.slice() : []);
                } else if (Array.isArray(value)) {
                    setByPath(data, m.v2, uniqueById(existing.concat(value), idKey));
                } else if (value && typeof value === 'object') {
                    var obj = getByPath(data, m.v2);
                    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                        for (var key in value) {
                            if (obj[key] === undefined) obj[key] = value[key];
                        }
                    } else {
                        setByPath(data, m.v2, value);
                    }
                }
            } else {
                if (getByPath(data, m.v2) === undefined) {
                    setByPath(data, m.v2, value);
                }
            }
            merged[m.v1] = m.v2;
            touchedLegacy.push(m.v1);
        }

        saveAll();
        try {
            localStorage.setItem(MIGRATED_FLAG, '1');
        } catch (e) { /* ignore */ }

        // T2-2 / P0-8: 搬迁后可选删除旧裸 key。
        // 默认保留（便于回滚），但保留旧 key 会与"清除学习数据"语义冲突——
        // 清除后旧 key 仍在，任何直读裸 key 的代码都会看到"已清除"的数据。
        // 传入 { removeLegacy: true } 时，搬迁成功即删除本次搬迁涉及的裸 key。
        var removedLegacy = [];
        if (removeLegacy) {
            for (var r = 0; r < touchedLegacy.length; r++) {
                try {
                    localStorage.removeItem(touchedLegacy[r]);
                    removedLegacy.push(touchedLegacy[r]);
                } catch (e) { /* ignore */ }
            }
        }

        return { migrated: true, merged: merged, removedLegacy: removedLegacy };
    }

    /* ── 导出 / 导入 ── */

    function exportData() {
        var data = clone(loadAll());
        data.__export = {
            app: 'hspcb',
            schemaVersion: SCHEMA_VERSION,
            exportedAt: new Date().toISOString()
        };
        return data;
    }

    function exportJSON(pretty) {
        return JSON.stringify(exportData(), null, pretty === false ? 0 : 2);
    }

    /**
     * 导入备份。mode: 'merge' | 'replace'
     */
    function importData(payload, mode) {
        if (!payload || typeof payload !== 'object') {
            return { ok: false, error: 'invalid-payload' };
        }
        var incoming = payload.progress && typeof payload.progress === 'object'
            ? payload.progress
            : payload;
        // 去掉导出元数据
        if (incoming.__export) {
            incoming = clone(incoming);
            delete incoming.__export;
        }

        var data = loadAll();
        if (mode === 'replace') {
            var next = clone(DEFAULTS);
            for (var k in incoming) {
                if (k === 'meta') continue;
                next[k] = incoming[k];
            }
            _cache = next;
            saveAll();
            return { ok: true, mode: 'replace' };
        }

        // merge: 数组按 id 合并，标量取 incoming，对象浅合并
        for (var key in incoming) {
            if (key === 'meta') continue;
            var val = incoming[key];
            var cur = data[key];
            if (Array.isArray(val)) {
                if (Array.isArray(cur)) {
                    data[key] = uniqueById(cur.concat(val), 'id');
                } else {
                    data[key] = val.slice();
                }
            } else if (val && typeof val === 'object') {
                if (cur && typeof cur === 'object' && !Array.isArray(cur)) {
                    for (var sub in val) {
                        cur[sub] = val[sub];
                    }
                } else {
                    data[key] = val;
                }
            } else if (val !== undefined) {
                data[key] = val;
            }
        }
        saveAll();
        return { ok: true, mode: 'merge' };
    }

    /** 触发浏览器下载备份文件 */
    function downloadBackup() {
        var json = exportJSON(true);
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        var d = new Date();
        var stamp = d.getFullYear() +
            String(d.getMonth() + 1).padStart(2, '0') +
            String(d.getDate()).padStart(2, '0');
        a.href = url;
        a.download = 'hspcb-backup-' + stamp + '.json';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
        return true;
    }

    /**
     * T2-2 / P0-8: 清除全部学习进度（权威轨）。
     * 删除 hspcb.v2.progress 与迁移标记，并重置内存缓存。
     * 注意：不删除主题偏好（theme 随进度对象一起重置为默认 light，
     * 调用方如需保留主题应在清除后重新 set）。
     */
    function resetAll() {
        _cache = null;
        try {
            localStorage.removeItem(NS + 'progress');
            localStorage.removeItem(MIGRATED_FLAG);
        } catch (e) { /* ignore */ }
        return true;
    }

    /** 仅调试/测试用 */
    function _resetForTest() {
        resetAll();
    }

    /** 初始化：自动迁移一次（幂等） */
    function init(options) {
        var result = migrateFromV1(options);
        if (result.migrated) {
            console.info('HSPCBProgress: 已从 v1 迁移', Object.keys(result.merged).length, '个旧 key');
        }
        return result;
    }

    return {
        NS: NS,
        SCHEMA_VERSION: SCHEMA_VERSION,
        DEFAULTS: DEFAULTS,
        V1_MAP: V1_MAP,
        V1_KEYS: V1_MAP.map(function (m) { return m.v1; })
            .concat(THEME_KEYS.map(function (t) { return t.v1; })),
        init: init,
        get: get,
        set: set,
        append: append,
        mergeArray: mergeArray,
        loadAll: loadAll,
        saveAll: saveAll,
        exportData: exportData,
        exportJSON: exportJSON,
        importData: importData,
        downloadBackup: downloadBackup,
        migrateFromV1: migrateFromV1,
        resetAll: resetAll,
        storageAvailable: storageAvailable,
        _resetForTest: _resetForTest
    };
})();

// 页面加载后自动迁移一次
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            try { window.HSPCBProgress.init(); } catch (e) { console.warn(e); }
        });
    } else {
        try { window.HSPCBProgress.init(); } catch (e) { console.warn(e); }
    }
}

// ============================================================
// HSPCBStore — 散装工具数据的统一命名空间门面 (v1.3 / T4)
// 目标: 各工具模块不再直接使用裸 localStorage。
//   - 读写统一走 hspcb.st.<key> 命名空间
//   - 首次访问旧裸 key 时自动搬迁（旧数据保留，不删除，便于回滚）
//   - 统一 try/catch，隐私模式/配额超限不再抛错
// 例外（白名单，仍为裸 localStorage）:
//   - index.html 主题引导脚本（早于本文件执行）
//   - study-tools-enhanced.js 数据导出/清理工具（需枚举原始 key）
// ============================================================
window.HSPCBStore = (function () {
    'use strict';
    var NS = 'hspcb.st.';
    var migratedKeys = {};

    // T2-2 / P0-8: 透明搬迁成功后是否删除旧裸 key。
    // 默认 false（保留便于回滚）；"清除学习数据"流程不依赖此选项，
    // 因为 remove/purgeAll 已同时删除两轨。设为 true 可彻底消除
    // "旧 key 永存 → 直读裸 key 的代码看到已清除数据"的隐患。
    var config = { removeLegacyAfterMigrate: false };

    function raw(k) {
        try { return localStorage.getItem(k); } catch (e) { return null; }
    }

    /** T2-2: 运行期配置（目前仅 removeLegacyAfterMigrate） */
    function configure(opts) {
        if (!opts || typeof opts !== 'object') return config;
        if (typeof opts.removeLegacyAfterMigrate === 'boolean') {
            config.removeLegacyAfterMigrate = opts.removeLegacyAfterMigrate;
        }
        return config;
    }

    // T0-17: 搬迁标记不能是简单的布尔值。
    // 原实现 `migratedKeys[key] = true` 只允许搬迁一次，导致：
    //   用户点"清除数据"(remove 同时清了 NS 与裸 key) → 某个旧模块再次写入裸 key
    //   → 标记仍为 true，永不再搬迁 → 数据看似丢失。
    // 改为记录"上次搬迁时看到的裸 key 值"，值变了或为 null 时允许重新搬迁。
    function shouldMigrate(key) {
        var legacy = raw(key);
        if (legacy == null) { migratedKeys[key] = null; return false; }
        if (migratedKeys[key] === legacy) return false;
        if (raw(NS + key) == null) { migratedKeys[key] = legacy; return true; }
        migratedKeys[key] = legacy;
        return false;
    }

    function get(key) {
        if (typeof key !== 'string') return null;
        if (shouldMigrate(key)) {
            try { localStorage.setItem(NS + key, raw(key)); } catch (e) { /* ignore */ }
            if (config.removeLegacyAfterMigrate) {
                try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
            }
        }
        return raw(NS + key);
    }

    function set(key, value) {
        if (typeof key !== 'string') return false;
        try { localStorage.setItem(NS + key, String(value)); return true; } catch (e) { return false; }
    }

    // T0-17 / P0-8: remove 必须同时清掉旧裸 key。
    // 否则"清除学习数据"只删了 hspcb.st.<key>，旧裸 key 仍在，
    // 下次 get() 的自动搬迁会把它原样搬回来 → 用户点了清除，数据又复活。
    function remove(key) {
        if (typeof key !== 'string') return;
        try { localStorage.removeItem(NS + key); } catch (e) { /* ignore */ }
        try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
        migratedKeys[key] = null;
    }

    /**
     * T2-2 / P0-8: 已知 v1 裸 key 全集（学习数据向，不含主题偏好）。
     * 来源：HSPCBProgress.V1_MAP + 散装工具自有 key。
     * 惰性求值——progress.js 先于本 IIFE 定义，运行时一定可用。
     */
    var STORE_ONLY_KEYS = ['hspcb_manual_mastery'];
    function legacyKeys() {
        var out = [];
        try {
            var v1 = window.HSPCBProgress && window.HSPCBProgress.V1_KEYS;
            if (v1 && v1.length) out = out.concat(v1);
        } catch (e) { /* ignore */ }
        for (var i = 0; i < STORE_ONLY_KEYS.length; i++) {
            if (out.indexOf(STORE_ONLY_KEYS[i]) === -1) out.push(STORE_ONLY_KEYS[i]);
        }
        return out;
    }

    /**
     * T2-2 / P0-8: 一次性清除本命名空间下**所有** key + 全部已知 v1 裸 key。
     * 供"清除所有学习数据"使用——单 key remove 覆盖面不足，
     * 用户点清除后期望 examHistory / gameScores / checkin 等一并消失。
     * 返回 { removed: [...], failed: [...] }。
     */
    function purgeAll() {
        var removed = [];
        var failed = [];
        var targets = keys();
        var legacy = legacyKeys();
        for (var i = 0; i < legacy.length; i++) {
            if (targets.indexOf(legacy[i]) === -1) targets.push(legacy[i]);
        }
        for (var j = 0; j < targets.length; j++) {
            var k = targets[j];
            try {
                var hadNs = raw(NS + k) != null;
                var hadBare = raw(k) != null;
                if (!hadNs && !hadBare) continue;
                localStorage.removeItem(NS + k);
                localStorage.removeItem(k);
                if (hadNs || hadBare) removed.push(k);
            } catch (e) {
                failed.push(k);
            }
            migratedKeys[k] = null;
        }
        return { removed: removed, failed: failed };
    }

    // 枚举命名空间下的全部 key（供备份/诊断使用）
    function keys() {
        var out = [];
        try {
            for (var i = 0; i < localStorage.length; i++) {
                var k = localStorage.key(i);
                if (k && k.indexOf(NS) === 0) out.push(k.slice(NS.length));
            }
        } catch (e) { /* ignore */ }
        return out;
    }

    // ============================================================
    // T0-17 打卡数据归一化
    // 同一 key `hspcb_daily_checkin` 历史上被写成两种结构：
    //   A) learning-tools.js  → { "2027-06-07": true, ... }（对象 map）
    //   B) gamification-system → [ "2027-06-07", {date:"..."} ]（数组）
    // 消费方各自 Array.isArray / Object.keys 判定，导致：
    //   - 打卡后 gamification 的 streakDays 恒为 0
    //   - "清除数据"后 learning-tools 认为已打卡、gamification 认为没打过
    // 统一为**对象 map**（写入方单一，无歧义），读取时把数组形态归一进来。
    // ============================================================
    var CHECKIN_KEY = 'hspcb_daily_checkin';

    function parse(raw) {
        if (raw == null || raw === '') return null;
        try { var v = JSON.parse(raw); return v == null ? null : v; } catch (e) { return null; }
    }

    function normalizeCheckin(value) {
        var map = {};
        if (!value) return map;
        if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                var it = value[i];
                var d = typeof it === 'string' ? it : (it && it.date);
                if (d) map[d] = true;
            }
            return map;
        }
        if (typeof value === 'object') {
            for (var k in value) {
                if (!Object.prototype.hasOwnProperty.call(value, k)) continue;
                if (value[k]) map[k] = true;
            }
        }
        return map;
    }

    /** 读取打卡数据，始终返回 { "YYYY-MM-DD": true } 对象 map */
    function getCheckin() {
        var rawVal = get(CHECKIN_KEY);
        if (rawVal == null) return {};
        return normalizeCheckin(parse(rawVal));
    }

    /** 标记某天已打卡，返回完整对象 map */
    function markCheckin(dateKey) {
        if (typeof dateKey !== 'string' || !dateKey) return getCheckin();
        var map = getCheckin();
        map[dateKey] = true;
        set(CHECKIN_KEY, JSON.stringify(map));
        return map;
    }

    /** 取消某天打卡 */
    function unmarkCheckin(dateKey) {
        var map = getCheckin();
        delete map[dateKey];
        set(CHECKIN_KEY, JSON.stringify(map));
        return map;
    }

    /** 打卡日期升序数组（供 streak 计算） */
    function checkinDays() {
        var map = getCheckin();
        return Object.keys(map).sort();
    }

    // getItem/setItem/removeItem 为兼容别名（早期替换脚本使用了原生方法名）
    return {
        get: get, set: set, remove: remove,
        getItem: get, setItem: set, removeItem: remove,
        keys: keys, NS: NS,
        CHECKIN_KEY: CHECKIN_KEY,
        normalizeCheckin: normalizeCheckin,
        getCheckin: getCheckin,
        markCheckin: markCheckin,
        unmarkCheckin: unmarkCheckin,
        checkinDays: checkinDays,
        legacyKeys: legacyKeys,
        purgeAll: purgeAll,
        configure: configure
    };
})();

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
        if (!storageAvailable()) {
            return { migrated: false, reason: 'storage-unavailable', merged: {} };
        }
        if (!force && localStorage.getItem(MIGRATED_FLAG) === '1') {
            return { migrated: false, reason: 'already-done', merged: {} };
        }

        var data = loadAll();
        var merged = {};

        // theme
        for (var t = 0; t < THEME_KEYS.length; t++) {
            var tk = THEME_KEYS[t];
            var rawTheme = readV1(tk.v1);
            if (rawTheme == null) continue;
            var themeVal = tk.map ? tk.map(rawTheme) : rawTheme;
            if (themeVal === 'dark' || themeVal === 'light') {
                data.theme = themeVal;
                merged[tk.v1] = themeVal;
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
        }

        saveAll();
        try {
            localStorage.setItem(MIGRATED_FLAG, '1');
        } catch (e) { /* ignore */ }

        return { migrated: true, merged: merged };
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

    /** 仅调试/测试用 */
    function _resetForTest() {
        _cache = null;
        try {
            localStorage.removeItem(NS + 'progress');
            localStorage.removeItem(MIGRATED_FLAG);
        } catch (e) { /* ignore */ }
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

// mastery-tracker.js — 掌握度统计与统一复习队列（v1.10 T16）
//
// 职责：
//   1. 订阅 exam:answered（app-exam.js）与 sm2:reviewed（error-notebook.js），
//      按「学科::知识点」聚合答题次数/正确数/复习质量；
//   2. 把聚合结果与每日平均掌握度写进 HSPCBStore（mastery.records / mastery.history）；
//   3. 给仪表盘与学习路径提供 summary()/queue()/history()。
//
// 公式单一来源：动态 import js/modules/mastery.js（纯函数，Node 单测同一份）。
// 模块就绪前到达的事件先进 pending 队列，就绪后回放 —— 不在本文件维护第二份公式。
window.HSPCBMastery = (function () {
    'use strict';

    var REC_KEY = 'mastery.records';
    var HIST_KEY = 'mastery.history';
    var HISTORY_MAX = 30;

    var core = null;
    var pending = [];
    var ready = false;
    var readyFns = [];
    var records = {};
    var history = [];

    function load() {
        try {
            var raw = window.HSPCBStore && HSPCBStore.get(REC_KEY);
            var obj = raw ? JSON.parse(raw) : null;
            records = (obj && typeof obj === 'object') ? obj : {};
        } catch (e) { records = {}; }
        try {
            var rawH = window.HSPCBStore && HSPCBStore.get(HIST_KEY);
            var arr = rawH ? JSON.parse(rawH) : null;
            history = Array.isArray(arr) ? arr : [];
        } catch (e) { history = []; }
    }

    function persist() {
        try { HSPCBStore.set(REC_KEY, JSON.stringify(records)); } catch (e) { /* ignore */ }
        try { HSPCBStore.set(HIST_KEY, JSON.stringify(history.slice(-HISTORY_MAX))); } catch (e) { /* ignore */ }
    }

    function dayKey(ts) {
        var d = new Date(ts || Date.now());
        var m = d.getMonth() + 1;
        var day = d.getDate();
        return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
    }

    function avgNow() {
        return core ? core.summarize(records, Date.now()).avg : 0;
    }

    /** 当天历史项 upsert（同一天多次答题只保留一条，值为当天最新平均掌握度）。 */
    function upsertHistory() {
        if (!core) return;
        var k = dayKey();
        var v = Math.round(avgNow() * 100);
        var last = history[history.length - 1];
        if (last && last.d === k) last.v = v;
        else history.push({ d: k, v: v });
        if (history.length > HISTORY_MAX) history = history.slice(-HISTORY_MAX);
    }

    function ensureRec(key) {
        if (!records[key] || typeof records[key] !== 'object') {
            records[key] = { attempts: 0, correct: 0, qualitySum: 0, qualityCount: 0, lastAt: 0 };
        }
        return records[key];
    }

    function pointsOf(payload, fallbackKey) {
        var points = Array.isArray(payload && payload.knowledgePoints)
            ? payload.knowledgePoints.filter(function (x) { return typeof x === 'string' && x; })
            : [];
        if (!points.length) points = [fallbackKey || '__all__'];
        return points;
    }

    function applyAnswer(payload) {
        if (!payload || payload.pending) return; // 主观题待自评：不计入正确率
        var subject = payload.subject || 'general';
        var points = pointsOf(payload, payload.category);
        var now = Date.now();
        for (var i = 0; i < points.length; i++) {
            var rec = ensureRec(subject + '::' + points[i]);
            rec.attempts += 1;
            if (payload.isCorrect) rec.correct += 1;
            rec.lastAt = now;
        }
    }

    function applyReview(payload) {
        if (!payload) return;
        var subject = payload.subject || 'general';
        var points = pointsOf(payload, payload.chapter);
        var now = Date.now();
        // 记住了=4 / 忘了=2（SM-2 的 0-5 质量刻度；错题本只有二值自评）
        var quality = payload.remembered ? 4 : 2;
        for (var i = 0; i < points.length; i++) {
            var rec = ensureRec(subject + '::' + points[i]);
            rec.qualitySum += quality;
            rec.qualityCount += 1;
            rec.lastAt = now;
        }
    }

    function commit() {
        upsertHistory();
        persist();
    }

    function handle(kind, payload) {
        if (!ready) { pending.push([kind, payload]); return; }
        if (kind === 'answer') applyAnswer(payload);
        else applyReview(payload);
        commit();
    }

    function dueCount() {
        try {
            if (window.errorNotebook && typeof errorNotebook.dueErrors === 'function') {
                return errorNotebook.dueErrors().length;
            }
        } catch (e) { /* ignore */ }
        return 0;
    }

    function summary() {
        var sum = core ? core.summarize(records, Date.now()) : null;
        var q = core ? core.buildQueue(records, dueCount(), Date.now()) : null;
        return {
            ready: !!ready,
            avg: sum ? sum.avg : 0,
            count: sum ? sum.count : 0,
            level: sum ? core.levelOf(sum.avg) : '未练',
            levels: sum ? sum.levels : {},
            due: q ? q.due : 0,
            weak: q ? q.weak : [],
            queueTotal: q ? q.total : 0,
            history: history.slice()
        };
    }

    function queue() {
        if (!core) return { due: dueCount(), weak: [], weakCount: 0, total: dueCount(), avg: 0, count: 0 };
        return core.buildQueue(records, dueCount(), Date.now());
    }

    function onReady(fn) {
        if (typeof fn !== 'function') return;
        if (ready) { fn(); return; }
        readyFns.push(fn);
    }

    function boot() {
        load();
        if (window.HSPCBBus) {
            HSPCBBus.on('exam:answered', function (p) { handle('answer', p); });
            HSPCBBus.on('sm2:reviewed', function (p) { handle('review', p); });
        }
        try {
            import(new URL('js/modules/mastery.js', document.baseURI).href).then(function (m) {
                core = m;
                ready = true;
                var q = pending;
                pending = [];
                for (var i = 0; i < q.length; i++) {
                    if (q[i][0] === 'answer') applyAnswer(q[i][1]);
                    else applyReview(q[i][1]);
                }
                if (q.length) commit();
                for (var j = 0; j < readyFns.length; j++) {
                    try { readyFns[j](); } catch (e) { /* ignore */ }
                }
                readyFns = [];
            }).catch(function () { /* 模块不可用：保持 ready=false，仪表盘显示加载中 */ });
        } catch (e) { /* 动态 import 不可用（旧浏览器）：同上 */ }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    return {
        summary: summary,
        queue: queue,
        onReady: onReady,
        dueCount: dueCount
    };
})();

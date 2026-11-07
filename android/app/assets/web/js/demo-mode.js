// ============================================================
// demo-mode.js — 评委演示模式（v1.6）
// 目的：让评委在 30 秒内看到「有血有肉」的仪表盘/错题本/打卡数据，
//       而不是一片空白。所有数据均为本地生成的示例，注入前自动快照，
//       可在 设置 → 备份 一键恢复真实数据，或「清除演示数据」整体重置。
// 数据落点：HSPCBProgress.wrongQuestions（仪表盘错题概览/积压规则）、
//           hspcb_error_notebook（错题本页面，仅五科：其渲染器无英语）、
//           hspcb_daily_checkin（打卡连击组件与打卡提醒）。
// 入口：设置 → 通用 →「注入评委演示数据」；或地址栏 ?demo=1（每次会话只自动注入一次）。
// ============================================================
window.HSPCBDemo = (function () {
    'use strict';

    var DEMO_MARK = 'DEMO_';
    var autoInjected = false;

    function notify(payload) {
        try { window.HSPCBNotify && HSPCBNotify.notify(payload); } catch (e) { /* ignore */ }
    }

    function hasDemoData() {
        try {
            var wrong = window.HSPCBProgress && HSPCBProgress.get('wrongQuestions') || [];
            if (wrong.some(function (w) { return String(w.id || '').indexOf(DEMO_MARK) === 0; })) return true;
            var nb = window.HSPCBStore && HSPCBStore.get('hspcb_error_notebook');
            return !!(nb && nb.indexOf(DEMO_MARK) >= 0);
        } catch (e) { return false; }
    }

    function dateKey(offsetDays) {
        var d = new Date();
        d.setDate(d.getDate() - (offsetDays || 0));
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    /** 从题库取六科各 4 道真题，改写为错题记录（字段与错题本渲染对齐的超集） */
    function buildWrongQuestions() {
        var pool = [];
        try {
            if (window.examPracticeSystem && typeof examPracticeSystem.getAllExams === 'function') {
                pool = examPracticeSystem.getAllExams('all');
            }
        } catch (e) { pool = []; }
        var out = [];
        var picked = {};
        for (var i = 0; i < pool.length && out.length < 24; i++) {
            var q = pool[i];
            var s = q.subject || 'physics';
            if ((picked[s] || 0) >= 4) continue;
            picked[s] = (picked[s] || 0) + 1;
            out.push({
                id: DEMO_MARK + q.id,
                sourceId: q.id,
                subject: q.subject,
                question: String(q.question || '').slice(0, 100),
                analysis: q.analysis || '',
                knowledgePoints: q.knowledgePoints || [],
                category: q.category || '',
                wrongCount: 1,
                addedAt: dateKey(Math.floor(Math.random() * 14))
            });
        }
        return out;
    }

    /** 组装错题本页（hspcb_error_notebook）示例条目：五科各 2 道，schema 与 error-notebook.addError 对齐 */
    function buildNotebookEntries() {
        var pool = [];
        try {
            if (window.examPracticeSystem && typeof examPracticeSystem.getAllExams === 'function') {
                pool = examPracticeSystem.getAllExams('all');
            }
        } catch (e) { pool = []; }
        var NOTE_SUBJECTS = { physics: '物理', chemistry: '化学', biology: '生物', chinese: '语文', math: '数学' };
        var out = [];
        var picked = {};
        for (var i = 0; i < pool.length && out.length < 10; i++) {
            var q = pool[i];
            var s = q.subject || 'physics';
            if (!NOTE_SUBJECTS[s] || (picked[s] || 0) >= 2) continue;
            picked[s] = (picked[s] || 0) + 1;
            out.push({
                id: DEMO_MARK + 'nb_' + q.id,
                question: String(q.question || '').slice(0, 200),
                userAnswer: q.answer === 'A' ? 'B' : 'A',
                correctAnswer: q.answer || '',
                subject: s,
                difficulty: (q.difficulty === 'hard' || q.difficulty === 'easy') ? q.difficulty : 'medium',
                chapter: q.category || '',
                options: Array.isArray(q.options) ? q.options : [],
                explanation: String(q.analysis || '').slice(0, 200),
                timestamp: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000).toISOString(),
                mastered: false,
                correctCount: 0,
                source: 'demo'
            });
        }
        return out;
    }

    var injecting = false; // 防双触发竞态（?demo=1 自动注入与手点按钮并发）

    function inject() {
        try {
            if (injecting) return false;
            if (hasDemoData()) {
                notify({ id: 'demo.dup', level: 'warn', duration: 4000, title: '演示数据已存在', message: '如需重来，请先点「清除演示数据」。' });
                return false;
            }
            // 题库未就绪（惰性加载）：等预热完成后再注入
            var eps = window.examPracticeSystem;
            if (eps && typeof eps.ensureLoaded === 'function' && !eps.examData) {
                eps.ensureLoaded().then(function () { inject(); });
                return true;
            }
            injecting = true;

            // 注入前快照，评委演示后可一键恢复真实数据（设置 → 备份）
            try { window.HSPCBProgress && HSPCBProgress.snapshotNow(); } catch (e) { /* ignore */ }

            var wrong = buildWrongQuestions();

            var res = window.HSPCBProgress && HSPCBProgress.importData({
                wrongQuestions: wrong
            }, 'merge');

            if (!res || res.ok !== true) {
                injecting = false;
                notify({ id: 'demo.fail', level: 'error', duration: 5000, title: '演示数据注入失败', message: '请刷新页面后重试。' });
                return false;
            }

            // 错题本页面（error-notebook.js 读独立存储 hspcb_error_notebook）
            try {
                if (window.HSPCBStore) {
                    var nb = { errors: buildNotebookEntries(), redoStats: { totalAttempts: 4, totalCorrect: 1, sessions: [] } };
                    HSPCBStore.set('hspcb_error_notebook', JSON.stringify(nb));
                }
            } catch (e) { /* ignore */ }

            // 打卡连击：过去 12 天
            try {
                if (window.HSPCBStore && typeof HSPCBStore.markCheckin === 'function') {
                    for (var d = 0; d < 12; d++) HSPCBStore.markCheckin(dateKey(d));
                }
            } catch (e) { /* ignore */ }

            notify({
                id: 'demo.done', level: 'info', duration: 7000,
                title: '演示数据已注入',
                message: '仪表盘错题概览、打卡连击与错题本页面已填充示例。真实数据可经 设置 → 备份 恢复，或点「清除演示数据」重置。'
            });
            injecting = false;
            return true;
        } catch (e) {
            injecting = false;
            notify({ id: 'demo.err', level: 'error', duration: 5000, title: '演示数据注入异常', message: String(e && e.message || e) });
            return false;
        }
    }

    function clear() {
        try {
            if (!window.confirm('清除演示数据将重置全部本地学习记录（含真实数据），确定继续？')) return false;
            // 打卡等散装数据在 HSPCBStore 轨，仅 resetAll 清不掉 —— 两轨成对清
            try { window.HSPCBStore && typeof HSPCBStore.purgeAll === 'function' && HSPCBStore.purgeAll(); } catch (e) { /* ignore */ }
            window.HSPCBProgress && HSPCBProgress.resetAll();
            window.location.reload();
            return true;
        } catch (e) { return false; }
    }

    // ?demo=1 自动注入（每次页面会话最多一次；题库未就绪时延迟到预热完成后）
    function autoRun() {
        try {
            if (autoInjected) return;
            if (typeof location === 'undefined' || !/(?:^|[?&])demo=1/.test(location.search || '')) return;
            autoInjected = true;
            var tryInject = function (n) {
                if (window.examPracticeSystem && examPracticeSystem.examData) { inject(); return; }
                if (n <= 0) return;
                setTimeout(function () { tryInject(n - 1); }, 800);
            };
            tryInject(15);
        } catch (e) { /* ignore */ }
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoRun);
        else autoRun();
    }

    return { inject: inject, clear: clear, hasDemoData: hasDemoData };
})();

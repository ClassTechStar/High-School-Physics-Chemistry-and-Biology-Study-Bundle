// ============================================================
// demo-mode.js — 评委演示模式（v1.6）
// 目的：让评委在 30 秒内看到「有血有肉」的仪表盘/错题本/打卡数据，
//       而不是一片空白。所有数据均为本地生成的示例，注入前自动快照，
//       可在 设置 → 备份 一键恢复真实数据，或「清除演示数据」整体重置。
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
            return wrong.some(function (w) { return String(w.id || '').indexOf(DEMO_MARK) === 0; });
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

    function inject() {
        try {
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
            // 注入前快照，评委演示后可一键恢复真实数据（设置 → 备份）
            try { window.HSPCBProgress && HSPCBProgress.snapshotNow(); } catch (e) { /* ignore */ }

            var wrong = buildWrongQuestions();

            var res = window.HSPCBProgress && HSPCBProgress.importData({
                wrongQuestions: wrong,
                notes: [
                    { id: DEMO_MARK + 'note1', title: '错题复盘方法', content: '先重做，再写「当时为什么错」，最后归类到考点。', createdAt: dateKey(2) },
                    { id: DEMO_MARK + 'note2', title: '本周目标', content: '物理电磁感应专项 20 题，英语完形 2 篇。', createdAt: dateKey(1) }
                ]
            }, 'merge');

            if (!res || res.ok !== true) {
                notify({ id: 'demo.fail', level: 'error', duration: 5000, title: '演示数据注入失败', message: '请刷新页面后重试。' });
                return false;
            }

            // 打卡连击：过去 12 天
            try {
                if (window.HSPCBStore && typeof HSPCBStore.markCheckin === 'function') {
                    for (var d = 0; d < 12; d++) HSPCBStore.markCheckin(dateKey(d));
                }
            } catch (e) { /* ignore */ }

            notify({
                id: 'demo.done', level: 'info', duration: 7000,
                title: '演示数据已注入',
                message: '错题本 / 打卡 / 笔记已填充示例。真实数据可经 设置 → 备份 恢复，或点「清除演示数据」重置。'
            });
            return true;
        } catch (e) {
            notify({ id: 'demo.err', level: 'error', duration: 5000, title: '演示数据注入异常', message: String(e && e.message || e) });
            return false;
        }
    }

    function clear() {
        try {
            if (!window.confirm('清除演示数据将重置全部本地学习记录（含真实数据），确定继续？')) return false;
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

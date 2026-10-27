// ============================================================
// automation.js — 自动化提醒规则（v1.5 / T13）
// 借鉴 Class-Widgets-2 AutomationTask（每秒 update + 冷却）最小子集。
// 内置规则（均可在 设置 → 通知 中按 Provider 单独关闭）：
//   automation.checkin   每天 19:00 后仍未打卡 → 提醒（每自然日一次）
//   automation.backlog   错题本 ≥ 50 题 → 建议清理（冷却 24h）
//   automation.session   作息表进入学习/自主时段 → 开始提醒（每时段一次）
// 全部本地判定，无任何网络请求。
// ============================================================
window.HSPCBAutomation = (function () {
    'use strict';

    var lastFired = {};
    var lastEntryKey = null;

    function loadLast() {
        try {
            var raw = window.HSPCBStore && HSPCBStore.get('automation.lastFired');
            lastFired = raw ? JSON.parse(raw) : {};
        } catch (e) { lastFired = {}; }
    }
    function saveLast() {
        try { window.HSPCBStore && HSPCBStore.set('automation.lastFired', JSON.stringify(lastFired)); } catch (e) { /* ignore */ }
    }
    loadLast();

    function dateKey(d) {
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function fire(key, payload, cooldownMs) {
        var now = Date.now();
        if (lastFired[key] && now - lastFired[key] < (cooldownMs || 24 * 3600e3)) return;
        lastFired[key] = now;
        saveLast();
        try {
            window.HSPCBNotify && HSPCBNotify.notify(Object.assign({ id: 'auto.' + key }, payload));
        } catch (e) { /* ignore */ }
    }

    function enabled() {
        try {
            var s = window.HSPCBProgress && HSPCBProgress.getSettings();
            return !(s && s.automation && s.automation.enabled === false);
        } catch (e) { return true; }
    }

    function update(now) {
        if (!enabled() || !window.HSPCBNotify) return;
        var dk = dateKey(now);

        // 1. 打卡提醒（19:00 后）
        if (now.getHours() >= 19) {
            var done = false;
            try {
                var raw = window.HSPCBStore && HSPCBStore.get('hspcb_daily_checkin');
                var map = raw ? JSON.parse(raw) : {};
                done = map[dk] === true;
            } catch (e) { done = false; }
            if (!done) {
                fire('checkin:' + dk, {
                    providerId: 'automation.checkin', level: 'info',
                    title: '今天还没打卡',
                    message: '花 1 分钟打个卡，保住连续学习记录。'
                });
            }
        }

        // 2. 错题积压（冷却 24h）
        try {
            var wrongCount = (window.HSPCBProgress && HSPCBProgress.get('wrongQuestions') || []).length;
            if (wrongCount >= 50) {
                fire('backlog', {
                    providerId: 'automation.backlog', level: 'warn',
                    title: '错题本积压 ' + wrongCount + ' 题',
                    message: '建议先清理一周前的旧错题，再继续刷新题。'
                });
            }
        } catch (e) { /* ignore */ }
    }

    // 3. 作息时段开始提醒（订阅 tick，状态跃迁触发）
    function watchSession() {
        if (!window.HSPCBSchedule) return;
        HSPCBSchedule.getStatus(function (st) {
            if (!st || !st.enabled || !st.current) { lastEntryKey = null; return; }
            if (st.current.type === 'break') { lastEntryKey = null; return; }
            var key = dateKey(new Date()) + ':' + st.current.start;
            if (lastEntryKey !== key) {
                lastEntryKey = key;
                fire('session:' + key, {
                    providerId: 'automation.session', level: 'info',
                    title: '进入' + (st.current.type === 'activity' ? '自主安排' : '学习时段'),
                    message: (st.current.title || '') + '（到 ' + st.current.end + '）'
                });
            }
        });
    }

    if (window.HSPCBTick) {
        HSPCBTick.on(function (now) {
            try { update(now); } catch (e) { /* ignore */ }
            try { watchSession(); } catch (e) { /* ignore */ }
        });
    }

    // Provider 注册（设置 → 通知 中可见可关）
    if (window.HSPCBNotify) {
        HSPCBNotify.registerProvider('automation.checkin', '打卡提醒', true);
        HSPCBNotify.registerProvider('automation.backlog', '错题积压提醒', true);
        HSPCBNotify.registerProvider('automation.session', '时段开始提醒', false);
    }

    return {
        update: update,
        _resetCooldowns: function () { lastFired = {}; saveLast(); }
    };
})();

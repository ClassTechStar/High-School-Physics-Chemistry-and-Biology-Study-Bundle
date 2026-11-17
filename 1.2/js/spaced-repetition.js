// spaced-repetition.js — 简化 SM-2 间隔重复调度（v1.8 P3）
// 纯计算模块（不碰 DOM / 存储），供错题本（error-notebook.js）与仪表盘「今日应复习」调用。
// 调度模型（简化 SM-2）：
//   卡片 = { ease: 难度系数(≥1.3), interval: 间隔天数, due: 下次复习时间戳, reps: 连对次数 }
//   记住了：reps+1；间隔 1 → 3 → 此后 interval × ease 递增；到期时间顺延。
//   忘了：reps 归零、间隔归零、ease −0.2（下限 1.3），10 分钟后再来一遍。
window.HSPCBSpacedRepetition = (function () {
    'use strict';

    var DAY = 86400000;

    /** 新卡片初始调度（入错题本即待复习） */
    function initCard(now) {
        return { ease: 2.5, interval: 0, due: now || Date.now(), reps: 0 };
    }

    /** 复习一次：remembered=true 记住了 / false 忘了。返回新卡片对象（不改原对象） */
    function schedule(card, remembered, now) {
        var n = now || Date.now();
        var c = {
            ease: (card && typeof card.ease === 'number') ? card.ease : 2.5,
            interval: (card && card.interval) || 0,
            due: (card && card.due) || n,
            reps: (card && card.reps) || 0
        };
        if (remembered) {
            c.reps += 1;
            c.interval = c.reps === 1 ? 1 : (c.reps === 2 ? 3 : Math.max(1, Math.round(c.interval * c.ease)));
            c.due = n + c.interval * DAY;
        } else {
            c.reps = 0;
            c.interval = 0;
            c.ease = Math.max(1.3, c.ease - 0.2);
            c.due = n + 10 * 60000;
        }
        return c;
    }

    /** 是否到期待复习（无调度信息的旧条目一律视为待复习） */
    function isDue(card, now) {
        if (!card || typeof card.due !== 'number') return true;
        return card.due <= (now || Date.now());
    }

    /** 复习状态短标签：今天应复习 / N 天后复习 / 已到期 */
    function dueLabel(card, now) {
        if (isDue(card, now)) return '今天应复习';
        var days = Math.ceil((card.due - (now || Date.now())) / DAY);
        return days + ' 天后复习';
    }

    return {
        DAY: DAY,
        initCard: initCard,
        schedule: schedule,
        isDue: isDue,
        dueLabel: dueLabel
    };
})();

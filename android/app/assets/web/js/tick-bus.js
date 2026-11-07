// ============================================================
// tick-bus.js — 全局 1Hz tick 总线（借鉴 Class-Widgets-2 UnionUpdateTimer）
// 以「系统秒变化」为触发（250ms 轮询检测），页面隐藏时降频到 5s，
// 避免多处 setInterval 各自计时导致的漂移与浪费。
// 用法: const off = HSPCBTick.on(function (nowDate) { ... });
// 订阅者异常被隔离，不影响其他订阅者。测试环境无定时器时可用 _pump() 手动驱动。
// ============================================================
window.HSPCBTick = (function () {
    'use strict';

    var subs = [];
    var lastSec = -1;
    var timer = null;
    var HAS_TIMERS = typeof setInterval === 'function' && typeof clearInterval === 'function';

    function period() {
        return (typeof document !== 'undefined' && document.hidden) ? 5000 : 250;
    }

    function loop() {
        var s = Math.floor(Date.now() / 1000);
        if (s === lastSec) return;
        lastSec = s;
        var now = new Date();
        for (var i = 0; i < subs.length; i++) {
            try { subs[i](now); } catch (e) { console.warn('[HSPCBTick] 订阅者异常:', e && e.message); }
        }
    }

    function restart() {
        if (!HAS_TIMERS) return;
        if (timer) clearInterval(timer);
        timer = setInterval(loop, period());
    }

    function on(fn) {
        if (typeof fn !== 'function') return function () {};
        subs.push(fn);
        restart();
        return function () {
            var i = subs.indexOf(fn);
            if (i >= 0) subs.splice(i, 1);
        };
    }

    if (typeof document !== 'undefined' && document.addEventListener) {
        document.addEventListener('visibilitychange', restart);
    }
    restart();

    return {
        on: on,
        _pump: loop, // 测试环境手动驱动一帧
        _count: function () { return subs.length; }
    };
})();

// lazy-loader.js — 工具脚本按需加载（v1.9 性能 §3.2-A）
//
// 背景：index.html 尾部曾有 61 个 <script defer>，首屏要解析 3.3MB 工具脚本，
// 而其中大多数只在进入对应 section/工具后才用得到。
// 做法：只保留「应用壳」脚本为 defer（主题/进度/委托/设置/更新…），其余 42 个
// 工具脚本交给本加载器：
//   1. 空闲分片加载 —— 首个 requestIdleCallback 开始，每次空闲加载 1 个脚本，
//      不阻塞首屏渲染与交互；
//   2. 快速路径 —— 用户点 [data-tool]/[data-subject]/[data-module]/[data-back]
//      时立即按顺序整批加载，加载完成后重放这次点击（capture 阶段拦截）；
//   3. 顺序保证 —— 严格按原 index.html 中的先后顺序串行注入，模块注册次序
//      与改造前完全一致（顶层 window.* 挂载依赖顺序）。
//
// 降级：脚本 404/超时只告警不阻塞（对应功能打开时自然报缺），
// 加载器自身异常时 ensureAll 立即 resolve —— 最坏情况回到「点击后用不了」，
// 而不是整页卡死。
(function () {
    'use strict';

    // 工具脚本清单（顺序 = 原 index.html 中 <script defer> 的先后顺序）。
    // 新增工具脚本：加到这里，并同步 scripts/runtime-defer-check.mjs 的双清单断言。
    var LIST = [
        'js/app-chemistry.js',
        'js/app-physics.js',
        'js/app-biology.js',
        'js/app-exam.js',
        'js/enhanced-tools.js',
        'js/content.js',
        'js/comprehensive-data.js',
        'js/exam-review-system.js',
        'js/platform-system.js',
        'js/missing-tools-part2.js',
        'js/guangdong-features.js',
        'js/study-enhanced.js',
        'js/visual-enhanced.js',
        'js/auxiliary-tools.js',
        'js/math-tools.js',
        'js/chinese-tools.js',
        'js/spaced-repetition.js',
        'js/error-notebook.js',
        'js/mock-exam.js',
        'js/global-search.js',
        'js/chinese-sentence-correction.js',
        'js/physics-wave-optics.js',
        'js/chemistry-3d-molecules.js',
        'js/biology-cell-division.js',
        'js/study-dashboard.js',
        'js/onboarding.js',
        'js/english-vocabulary.js',
        'js/game-scratchpad.js',
        'js/learning-tools.js',
        'js/open-answer-trainer.js',
        'js/english-tools.js',
        'js/study-tools-v2.js',
        'js/study-tools-enhanced.js',
        'js/interactive-physics-bio.js',
        'js/interactive-chemistry.js',
        'js/subject-gap-1.js',
        'js/subject-gap-2.js',
        'js/subject-gap-3.js',
        'js/gamification-system.js',
        'js/data-analysis-enhanced.js',
        'js/utility-tools-v2.js',
        'js/learning-path-recommender.js'
    ];

    var PENDING = 0, LOADING = 1, DONE = 2;
    var state = LIST.map(function () { return PENDING; });
    var chain = Promise.resolve();
    var allPromise = null;

    function inject(src) {
        return new Promise(function (resolve) {
            var s = document.createElement('script');
            s.src = src;
            s.async = false; // 保序：动态脚本默认 async，显式关掉
            s.onload = function () { resolve(true); };
            s.onerror = function () {
                console.warn('[lazy] 工具脚本加载失败：' + src + '（对应功能可能不可用）');
                resolve(false);
            };
            document.body.appendChild(s);
        });
    }

    function loadIndex(i) {
        if (i >= LIST.length) return Promise.resolve();
        if (state[i] === DONE) return loadIndex(i + 1);
        if (state[i] === LOADING) return loadIndex(i + 1);
        state[i] = LOADING;
        return inject(LIST[i]).then(function () {
            state[i] = DONE;
            return loadIndex(i + 1);
        });
    }

    /** 顺序加载剩余全部脚本（幂等，多次调用共享同一 Promise 链）。 */
    function ensureAll() {
        if (allPromise) return allPromise;
        allPromise = chain = chain.then(function () {
            return loadIndex(0);
        }).catch(function (e) {
            console.warn('[lazy] 加载器异常，工具脚本降级为缺失状态', e);
        });
        return allPromise;
    }

    function allDone() {
        return state.every(function (s) { return s === DONE; });
    }

    /* ---------- 空闲分片：每次空闲只加载一个，避免长任务 ---------- */
    function idleLoad() {
        if (window.__hspcbLazyAll) return;
        var i = state.indexOf(PENDING);
        if (i < 0) return;
        state[i] = LOADING;
        inject(LIST[i]).then(function () {
            state[i] = DONE;
            scheduleIdle();
        });
    }

    function scheduleIdle() {
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(idleLoad, { timeout: 3000 });
        } else {
            setTimeout(idleLoad, 400);
        }
    }

    /* ---------- 快速路径：拦截导航点击，加载完成后重放 ----------
       capture 阶段先于 data-call / data-tool 的业务委托执行；用一次性的重放标志
       避免拦截自己派发的合成点击。 */
    var REPLAY = '__hspcbLazyReplay';

    function intercept(e) {
        if (e[REPLAY] || allDone() || window.__hspcbLazyAll) return;
        var t = e.target;
        if (!t || !t.closest) return;
        var el = t.closest('[data-tool],[data-subject],[data-module],[data-back]');
        if (!el) return;
        e.preventDefault();
        e.stopPropagation();
        window.__hspcbLazyAll = true;
        ensureAll().then(function () {
            window.__hspcbLazyAll = false;
            var ev = new MouseEvent('click', {
                bubbles: true, cancelable: true, view: window,
                detail: 1
            });
            ev[REPLAY] = true;
            el.dispatchEvent(ev);
        });
    }

    document.addEventListener('click', intercept, true);

    /* ---------- 程序化导航（搜索/仪表盘/深链）----------
       navigateToolPage / showSection 被模块内部直接调用时无法拦截签名，
       但外部入口（搜索跳转、插件、深链）都走 window 上的同名函数，
       这里包一层：脚本未齐时先加载再执行。 */
    function wrap(name) {
        var orig = window[name];
        if (typeof orig !== 'function' || orig.__lazyWrapped) return;
        var wrapped = function () {
            var args = arguments;
            if (allDone()) return orig.apply(window, args);
            ensureAll().then(function () { orig.apply(window, args); });
        };
        wrapped.__lazyWrapped = true;
        window[name] = wrapped;
    }

    wrap('navigateToolPage');
    wrap('showSection');

    /* ---------- 启动 ----------
       ?subject= 深链需要在首帧后就绪对应学科脚本，直接进入整批加载；
       普通访问走空闲分片，几乎不影响首屏。 */
    function boot() {
        if (/(?:^|[?&])subject=/.test(location.search || '')) {
            window.__hspcbLazyAll = true;
            ensureAll().then(function () { window.__hspcbLazyAll = false; });
            return;
        }
        scheduleIdle();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    window.HSPCBLazy = {
        list: LIST,
        ensureAll: ensureAll,
        allDone: allDone,
        /** 供测试/调试：已加载数量 */
        loadedCount: function () { return state.filter(function (s) { return s === DONE; }).length; }
    };
})();

/**
 * 把模板里的 data-style 写成元素的行内样式。
 *
 * 为什么模板里不直接写 style 属性：CSP 的 style-src 'unsafe-inline' 会拦掉
 * 解析期生成的 style 属性，但拦不住 el.style.setProperty 这类 CSSOM 写法。
 * 所以模板统一改成 data-style，DOM 插进来之后在这里写进去。
 *
 * 有个坑：theme-dark.css 的暗色覆盖写的是 [data-style*="..."]，不是 [style*=]。
 * 因为 CSSOM 写入会把颜色值规范化（#fff 变成 rgb(255,255,255)），用 [style*=]
 * 会匹配不上，暗色就失效了。data-style 保留模板里的原文，不受规范化影响，
 * 所以暗色覆盖得跟着一起改。
 *
 * 用法：模板写 data-style="color:#666;font-size:13px"，插入 DOM 后自动生效；
 * 也可以手动补扫：window.HSPCBStyles.apply(el)。
 */
(function () {
    'use strict';

    var OBSERVING = false;

 /** 把 "color:#666;font-size:13px" 逐条写入 CSSOM。 */
    function applyDecls(el, raw) {
        if (!raw) return;
        var list = String(raw).split(';');
        for (var i = 0; i < list.length; i++) {
            var decl = list[i];
            var idx = decl.indexOf(':');
            if (idx < 0) continue;
            var prop = decl.slice(0, idx).trim();
            var val = decl.slice(idx + 1).trim();
            if (!prop || !val) continue;
            try {
                if (/!\s*important\s*$/.test(val)) {
                    el.style.setProperty(prop, val.replace(/!\s*important\s*$/, '').trim(), 'important');
                } else {
                    el.style.setProperty(prop, val);
                }
            } catch (e) {
 /* 非法声明（不支持的属性 / 非法值）跳过，不影响其余声明 */
            }
        }
    }

    function applyOne(el) {
        if (!el || el.nodeType !== 1) return;
        if (el.__hspcbStyleApplied) return;
        if (el.hasAttribute('data-style')) applyDecls(el, el.getAttribute('data-style'));
        el.__hspcbStyleApplied = true;
    }

 /** 对 root（含其自身）子树里所有 [data-style] 应用声明。 */
    function applyTree(root) {
        if (!root) return;
        if (root.nodeType === 1) {
            applyOne(root);
            if (root.querySelectorAll) {
                var kids = root.querySelectorAll('[data-style]');
                for (var i = 0; i < kids.length; i++) applyOne(kids[i]);
            }
        }
    }

    var pending = [];
    var scheduled = false;

    function flush() {
        scheduled = false;
        var q = pending;
        pending = [];
        for (var i = 0; i < q.length; i++) {
            var n = q[i];
            if (n && n.nodeType === 1) applyTree(n);
        }
    }

    function schedule(node) {
        if (!node || node.nodeType !== 1) return;
        pending.push(node);
        if (scheduled) return;
        scheduled = true;
        if (typeof queueMicrotask === 'function') queueMicrotask(flush);
        else if (typeof Promise !== 'undefined') Promise.resolve().then(flush);
        else setTimeout(flush, 0);
    }

    function start(root) {
        if (OBSERVING || typeof MutationObserver === 'undefined') return;
        var mo = new MutationObserver(function (records) {
            for (var i = 0; i < records.length; i++) {
                var added = records[i].addedNodes;
                for (var j = 0; j < added.length; j++) schedule(added[j]);
            }
        });
        // 只监听 childList：CSSOM 写入会触发 attributes 变更，若一并监听将自激
        mo.observe(root, { childList: true, subtree: true });
        OBSERVING = true;
        applyTree(document.body);
    }

    /* 本脚本位于 head 且非 defer：此刻 documentElement 已存在，
       必须在所有解析期 / defer 脚本之前完成挂载，否则会漏掉早期插入。 */
    var root = document.documentElement;
    if (root) start(root);
    else document.addEventListener('readystatechange', function () {
        if (!OBSERVING && document.documentElement) start(document.documentElement);
    });

    window.HSPCBStyles = { apply: applyTree, applyOne: applyOne, version: '1.0' };
})();

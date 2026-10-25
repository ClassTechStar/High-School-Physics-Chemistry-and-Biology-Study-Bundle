/**
 * cssom-style-bridge.js —— D 类内联样式收敛桥（T3-4f / D3，v1.4）
 *
 * 原理
 * ----
 * CSP 的 style-src 'unsafe-inline' 只管辖「由 HTML 解析产生的 style 属性」及
 * 内联 <style> 块；**不**管辖通过 CSSOM 写入的样式（el.style.setProperty）。
 * 据此约定：js/ 字符串模板里不再写 style 属性，改写为 data-style 属性，
 * 插入 DOM 后由本模块统一写入 CSSOM。
 *
 * 为什么用 data-style 而不是「生成类名 + 属性选择器」
 * ------------------------------------------------
 * 内联样式的层叠优先级击败**一切**非 !important 选择器，任何 `[data-st][data-st]`
 * 形式的属性选择器（哪怕堆到 (0,3,0)）都可能输给更具体的选择器，造成外观回归
 * （实测：属性选择器方案光态每科 186 处差异）。只有 CSSOM 写入能**等价复现**
 * 内联样式优先级，故本模块采用 CSSOM。
 *
 * 为什么保留原始声明文本
 * --------------------
 * theme-dark.css 第 6 节用 `[style*="background:#fff" i]` 这类**字面文本**属性
 * 选择器 + !important 来压制内联样式（257 条）。CSSOM 写入会把值重新序列化
 * （#fff → rgb(255, 255, 255)），若继续用 [style*=] 便失配、暗色覆盖失效
 * （实测：暗态每科 242 处差异）。因此本节约定同步把第 6 节选择器改写为
 * `[data-style*="..."]`——data-* 属性保留模板原文，不参与序列化归一，匹配语义
 * 与改造前完全一致。
 *
 * 实证依据（Edge headless，CSP `style-src 'self'` 且无 'unsafe-inline'）
 *   - innerHTML 里的内联 style 属性              → 被阻止（computed 仍为默认值）
 *   - el.style.color = 'rgb(0,128,0)'            → 生效
 *   - 由 data-style 桥接写入                       → 生效
 *
 * 用法
 * ----
 * 模板：`<div class="card" data-style="color:#666;font-size:13px">...</div>`
 * 自动：MutationObserver 监听新增节点，无需调用方显式触发。
 * 手动：window.HSPCBStyles.apply(rootEl) 可对指定子树补扫。
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

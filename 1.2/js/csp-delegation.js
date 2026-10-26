/**
 * csp-delegation.js —— d：JS 模板内联事件属性的统一委托中枢
 *
 * 背景：1.2/index.html 的 CSP 为 script-src 'self' 'unsafe-inline'。
 * 静态 HTML 的内联事件属性已于 c 清零，但 js/*.js 的字符串模板仍在生成
 * `onclick="NS.method(args)"` 形态的属性（浏览器解析 innerHTML 时会把它们编译成
 * 真实 DOM 属性，同样受 'unsafe-inline' 管辖）。本文件提供替代机制：
 *
 * 模板里写 ：<button data-call="NS.method" data-arg1="...">
 * 本文件负责 ：文档级委托 + 参数解码 + 调用分发
 *
 * 参数编码（data-argN 的值）：
 * @el 触发事件的元素本身（原 this）
 * @ev 事件对象（原 event）
 * @val 元素 value（原 this.value）
 * @valn 元素 value 转 Number（原 parseFloat(this.value)）
 * @chk 元素 checked
 * @txt 元素 textContent
 * @doc:ID document.getElementById(ID)
 * @docval:ID document.getElementById(ID).value
 * @s:TEXT 字符串字面量（原 'TEXT'）
 * @n:N 数字字面量
 * null 字面量 null（原 null）
 * undefined 字面量 undefined（原 undefined）
 * true / false 字面量布尔值（原 true / false）
 * 其余 模板插值结果：形如数字（含指数形式）则转 Number，否则按字符串
 *
 * 悬停样式（纯样式操作，无逻辑）：
 * data-hover="prop: val; prop2: val2" 指针进入时应用（setProperty）
 * data-rest="prop: val; prop2" 指针离开时恢复；声明缺值 = removeProperty
 * 例：data-hover="box-shadow: 0 4px 8px rgba(0,0,0,.2)" data-rest="box-shadow"
 *
 * 语义说明：内联属性时代，嵌套元素各自的内联 handler 会自内向外依次触发
 * （除非调用了 event.stopPropagation）。本实现用 closest() 取最近的一个
 * 带 data-call 的祖先分发，与「内层 handler + stopPropagation」的原意图一致；
 * 全库已验证唯一嵌套场景（收藏按钮 vs 卡片选中）正是该形态。
 *
 * 特殊形态（多语句、条件判断、纯样式操作）不适用 data-call，改用：
 * HSPCBEV.on('click', '[data-hook="xxx"]', function (el, ev) { ... });
 */

(function () {
    'use strict';

    if (window.HSPCBEV) return;

 /* 需要冒泡到 document 才能被委托接管的事件类型 */
    var EVENTS = [
        'click', 'dblclick', 'change', 'input', 'submit',
        'keydown', 'keypress', 'keyup',
        'mousedown', 'mouseup', 'mouseover', 'mouseout', 'wheel', 'contextmenu',
        'dragstart', 'dragover', 'drop', 'focusin', 'focusout'
    ];

    var registry = [];   // { ev, selector, handler }
    var warned = {};     // 已告警过的 data-call 路径，避免刷屏

    function decodeArg(raw, el, ev) {
        if (raw === '@el') return el;
        if (raw === '@ev') return ev;
        if (raw === '@val') return el.value;
        if (raw === '@valn') return parseFloat(el.value);
        if (raw === '@chk') return el.checked;
        if (raw === '@txt') return el.textContent;
        if (raw === 'null') return null;
        if (raw === 'undefined') return undefined;
        if (raw === 'true') return true;
        if (raw === 'false') return false;
        if (raw.indexOf('@docval:') === 0) {
            var dv = document.getElementById(raw.slice(8));
            return dv ? dv.value : undefined;
        }
        if (raw.indexOf('@doc:') === 0) return document.getElementById(raw.slice(5));
        if (raw.indexOf('@s:') === 0) return raw.slice(3);
        if (raw.indexOf('@n:') === 0) return Number(raw.slice(3));
        if (raw !== '' && /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(raw)) return Number(raw);
        return raw;
    }

    function collectArgs(el, ev) {
        var args = [];
        var i = 1;
        var raw;
        while ((raw = el.getAttribute('data-arg' + i)) !== null) {
            args.push(decodeArg(raw, el, ev));
            i++;
        }
        return args;
    }

 /** 解析 'a.b.c' 形式的调用路径，返回 { base, fn }；base 为最末段前的对象（原 this）。 */
    function resolveCall(path) {
        var parts = String(path).split('.');
        var base = window;
        for (var i = 0; i < parts.length - 1; i++) {
            if (base == null) return { base: null, fn: null };
            base = base[parts[i]];
        }
        if (base == null) return { base: null, fn: null };
        return { base: base, fn: base[parts[parts.length - 1]] };
    }

    function runCall(el, ev) {
        var path = el.getAttribute('data-call');
        if (!path) return false;
        var r = resolveCall(path);
        if (typeof r.fn !== 'function') {
            if (!warned[path]) {
                warned[path] = true;
                if (window.console && console.warn) {
                    console.warn('[HSPCBEV] data-call 未解析到函数：' + path);
                }
            }
            return false;
        }
        r.fn.apply(r.base, collectArgs(el, ev));
        return true;
    }

    function dispatch(ev) {
        var target = ev.target;
        if (!target || typeof target.closest !== 'function') return;

 /* 1) 手工注册的精确 selector 优先（少而明确，全部经人工核对无嵌套冲突） */
        for (var i = 0; i < registry.length; i++) {
            var r = registry[i];
            if (r.ev !== ev.type) continue;
            var hit = target.closest(r.selector);
            if (hit) {
                r.handler(hit, ev);
                return;
            }
        }

 /* 2) data-call 批量机制 */
        var el = target.closest('[data-call]');
        if (el) runCall(el, ev);
    }

    EVENTS.forEach(function (type) {
        document.addEventListener(type, dispatch, false);
    });

    /**
 * 应用一串 CSS 声明到元素（悬停样式机制）。
 * decls 形如 "box-shadow: 0 4px 8px rgba(0,0,0,.2); transform: scale(1.02)"；
 * 单条声明缺值（"box-shadow"）表示 removeProperty——即恢复内联样式表中的原值。
     */
    function applyStyleDecls(el, decls) {
        if (!decls) return;
        decls.split(';').forEach(function (decl) {
            var idx = decl.indexOf(':');
            if (idx < 0) return;
            var prop = decl.slice(0, idx).trim();
            var val = decl.slice(idx + 1).trim();
            if (!prop) return;
            if (val) el.style.setProperty(prop, val);
            else el.style.removeProperty(prop);
        });
    }

    /* 指针进入 / 离开判定：mouseover/mouseout 会冒泡且在子元素间移动时也触发，
       用 relatedTarget 是否仍在元素内部来区分「真正进入/离开」与「内部移动」。 */
    function entering(el, ev) {
        return !(ev.relatedTarget && el.contains(ev.relatedTarget));
    }

    window.HSPCBEV = {
        version: '1.0',
 /** 注册一个委托处理器：HSPCBEV.on(evType, cssSelector, handler(el, ev)) */
        on: function (ev, selector, handler) {
            registry.push({ ev: ev, selector: selector, handler });
        },
 /** 供调试：当前已注册的手工处理器数量 */
        registrySize: function () { return registry.length; }
    };

    HSPCBEV.on('mouseover', '[data-hover]', function (el, ev) {
        if (!entering(el, ev)) return;
        applyStyleDecls(el, el.getAttribute('data-hover'));
    });
    HSPCBEV.on('mouseout', '[data-hover]', function (el, ev) {
        if (!entering(el, ev)) return;
        applyStyleDecls(el, el.getAttribute('data-rest'));
    });
})();

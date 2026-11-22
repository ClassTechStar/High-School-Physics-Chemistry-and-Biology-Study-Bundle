// ============================================================
// md3.js — Material Design 3 组件构造器
//
// 只做两件事：
//   1. 主题切换（light / dark / auto），把选择写到 <html data-md3-theme>
//   2. 用最少的 DOM 构造出 md3-components.css 已定义好的组件结构
//
// 设计约束（与 mochi-compose 对齐的部分）：
//   · 组件 DOM 结构固定，样式全部来自 class，不在 JS 里写 inline style
//     （项目 CSP 为 style-src 'self'，inline style 会被浏览器拦掉）
//   · 状态层交给 CSS ::before，JS 不参与视觉状态
//   · ES5 语法、IIFE、零依赖，与项目其余模块一致
// ============================================================
window.MD3 = (function () {
    'use strict';

    var THEME_KEY = 'md3.theme';
    var current = 'auto';

    /* ---------------- 主题 ---------------- */

    // 持久化：只有在宿主页引入了 HSPCBStore 时才落盘（项目规范：裸 localStorage
    // 一律收敛到 HSPCBStore）。独立文档页没有该模块，主题就只在本次会话生效，
    // 这对组件目录页完全够用，也避免为存一个字段拖入重型依赖。
    function readSavedTheme() {
        try {
            if (window.HSPCBStore && typeof HSPCBStore.get === 'function') {
                return HSPCBStore.get(THEME_KEY);
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    function writeSavedTheme(mode) {
        try {
            if (window.HSPCBStore && typeof HSPCBStore.set === 'function') {
                HSPCBStore.set(THEME_KEY, mode);
            }
        } catch (e) { /* ignore */ }
    }

    function applyTheme(mode) {
        current = mode === 'light' || mode === 'dark' ? mode : 'auto';
        var root = document.documentElement;
        if (current === 'auto') root.removeAttribute('data-md3-theme');
        else root.setAttribute('data-md3-theme', current);
        writeSavedTheme(current);
        return current;
    }

    function initTheme() {
        return applyTheme(readSavedTheme() || 'auto');
    }

    function currentTheme() { return current; }

    /* ---------------- DOM 工具 ---------------- */

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = String(text);
        return n;
    }

    /** 合并 class：md3-btn md3-btn--filled md3-btn--sm */
    function cls(base) {
        var extra = Array.prototype.slice.call(arguments, 1);
        return [base].concat(extra.filter(Boolean)).join(' ');
    }

    /* ---------------- 组件 ---------------- */

    /** 按钮：variant = filled | tonal | elevated | outlined | text */
    function button(opts) {
        var o = opts || {};
        var b = el('button', cls('md3-btn', 'md3-btn--' + (o.variant || 'filled'), o.size ? 'md3-btn--' + o.size : ''));
        b.type = 'button';
        if (o.icon) {
            var ic = el('span', 'md3-btn__icon', o.icon);
            ic.setAttribute('aria-hidden', 'true');
            b.appendChild(ic);
        }
        b.appendChild(document.createTextNode(o.label || '按钮'));
        if (o.onClick) b.addEventListener('click', o.onClick);
        if (o.disabled) b.disabled = true;
        if (o.ariaLabel) b.setAttribute('aria-label', o.ariaLabel);
        return b;
    }

    /** 图标按钮（触控区 44px） */
    function iconButton(opts) {
        var o = opts || {};
        var b = el('button', 'md3-icon-btn', o.icon || '⋯');
        b.type = 'button';
        b.setAttribute('aria-label', o.label || '操作');
        if (o.onClick) b.addEventListener('click', o.onClick);
        return b;
    }

    /** FAB */
    function fab(opts) {
        var o = opts || {};
        var b = el('button', 'md3-fab');
        b.type = 'button';
        if (o.icon) {
            var ic = el('span', null, o.icon);
            ic.setAttribute('aria-hidden', 'true');
            b.appendChild(ic);
        }
        if (o.label) b.appendChild(document.createTextNode(o.label));
        b.setAttribute('aria-label', o.ariaLabel || o.label || '主要操作');
        if (o.onClick) b.addEventListener('click', o.onClick);
        return b;
    }

    /** 卡片：variant = elevated | filled | outlined */
    function card(opts) {
        var o = opts || {};
        var c = el('div', cls('md3-card', 'md3-card--' + (o.variant || 'elevated'), o.interactive ? 'md3-card--interactive' : ''));
        if (o.title) c.appendChild(el('h3', 'md3-card__title md3-title-medium', o.title));
        if (o.body) c.appendChild(el('p', 'md3-card__body md3-body-medium', o.body));
        if (o.content) c.appendChild(o.content);
        if (o.onClick) {
            c.addEventListener('click', o.onClick);
            c.setAttribute('role', 'button');
            c.tabIndex = 0;
            c.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); o.onClick(e); }
            });
        }
        return c;
    }

    /** 输入框：variant = outlined | filled */
    function field(opts) {
        var o = opts || {};
        var tag = o.multiline ? 'textarea' : 'input';
        var f = el(tag, cls('md3-field', o.variant === 'filled' ? 'md3-field--filled' : ''));
        if (!o.multiline && o.type) f.type = o.type;
        if (o.placeholder) f.placeholder = o.placeholder;
        if (o.value != null) f.value = o.value;
        if (o.label) f.setAttribute('aria-label', o.label);
        if (o.id) f.id = o.id;
        return f;
    }

    /** 芯片 */
    function chip(opts) {
        var o = opts || {};
        var c = el('button', cls('md3-chip', o.selected ? 'md3-chip--selected' : '', o.variant === 'assist' ? 'md3-chip--assist' : ''));
        c.type = 'button';
        if (o.icon) {
            var ic = el('span', null, o.icon);
            ic.setAttribute('aria-hidden', 'true');
            c.appendChild(ic);
        }
        c.appendChild(document.createTextNode(o.label || ''));
        if (o.selected) c.setAttribute('aria-pressed', 'true');
        if (o.onClick) c.addEventListener('click', o.onClick);
        return c;
    }

    /** 开关：返回 <label>，input 是真控件（可键盘操作） */
    function toggle(opts) {
        var o = opts || {};
        var wrap = el('label', 'md3-switch');
        var input = el('input');
        input.type = 'checkbox';
        if (o.checked) input.checked = true;
        if (o.label) input.setAttribute('aria-label', o.label);
        if (o.onChange) input.addEventListener('change', function () { o.onChange(input.checked); });
        wrap.appendChild(input);
        wrap.appendChild(el('span', 'md3-switch__track'));
        wrap.appendChild(el('span', 'md3-switch__thumb'));
        return wrap;
    }

    /** 复选 / 单选：type = checkbox | radio */
    function check(opts) {
        var o = opts || {};
        var wrap = el('label', 'md3-check');
        var input = el('input');
        input.type = o.type === 'radio' ? 'radio' : 'checkbox';
        if (o.checked) input.checked = true;
        if (o.name) input.name = o.name;
        if (o.value) input.value = o.value;
        if (o.onChange) input.addEventListener('change', function () { o.onChange(input.checked); });
        wrap.appendChild(input);
        wrap.appendChild(el('span', null, o.label || ''));
        return wrap;
    }

    /** 列表：items = [{text, support, trail, selected, onClick}] */
    function list(items, opts) {
        var o = opts || {};
        var ul = el('ul', 'md3-list');
        if (o.label) ul.setAttribute('aria-label', o.label);
        (items || []).forEach(function (it) {
            var li = el('li', cls('md3-list__item', it.selected ? 'md3-list__item--selected' : ''));
            var txt = el('div', 'md3-list__text');
            txt.appendChild(el('div', null, it.text || ''));
            if (it.support) txt.appendChild(el('div', 'md3-list__support', it.support));
            li.appendChild(txt);
            if (it.trail) li.appendChild(el('div', 'md3-list__trail', it.trail));
            if (it.onClick) {
                li.setAttribute('role', 'button');
                li.tabIndex = 0;
                li.addEventListener('click', it.onClick);
                li.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); it.onClick(e); }
                });
            }
            ul.appendChild(li);
        });
        return ul;
    }

    /** 对话框：返回 {node, close}，自动管理遮罩与 Esc */
    function dialog(opts) {
        var o = opts || {};
        var scrim = el('div', 'md3-dialog-scrim');
        var box = el('div', 'md3-dialog');
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-modal', 'true');
        if (o.title) {
            var t = el('h2', 'md3-dialog__title md3-headline-small', o.title);
            t.id = 'md3-dialog-title';
            box.setAttribute('aria-labelledby', t.id);
            box.appendChild(t);
        }
        if (o.body) box.appendChild(el('p', 'md3-dialog__body md3-body-medium', o.body));
        if (o.content) box.appendChild(o.content);

        var actions = el('div', 'md3-dialog__actions');
        (o.actions || []).forEach(function (a) {
            actions.appendChild(button({
                label: a.label,
                variant: a.variant || 'text',
                onClick: function () { if (a.onClick) a.onClick(); if (a.close !== false) close(); }
            }));
        });
        if ((o.actions || []).length) box.appendChild(actions);

        function onKey(e) { if (e.key === 'Escape') close(); }
        function close() {
            document.removeEventListener('keydown', onKey);
            if (scrim.parentNode) scrim.parentNode.removeChild(scrim);
            if (box.parentNode) box.parentNode.removeChild(box);
            if (o.onClose) o.onClose();
        }
        scrim.addEventListener('click', close);
        document.addEventListener('keydown', onKey);

        document.body.appendChild(scrim);
        document.body.appendChild(box);
        return { node: box, close: close };
    }

    /** Snackbar：action 可选 */
    function snackbar(opts) {
        var o = opts || {};
        var bar = el('div', 'md3-snackbar');
        bar.setAttribute('role', 'status');
        bar.setAttribute('aria-live', 'polite');
        bar.appendChild(el('span', null, o.message || ''));
        if (o.action) {
            var a = el('button', 'md3-snackbar__action', o.action);
            a.type = 'button';
            a.addEventListener('click', function () {
                if (o.onAction) o.onAction();
                remove();
            });
            bar.appendChild(a);
        }
        function remove() { if (bar.parentNode) bar.parentNode.removeChild(bar); }
        document.body.appendChild(bar);
        var ms = o.duration == null ? 4000 : o.duration;
        if (ms > 0) setTimeout(remove, ms);
        return { node: bar, close: remove };
    }

    /** 进度条：value 0-100，null 表示不确定态 */
    function progress(opts) {
        var o = opts || {};
        var wrap = el('div', cls('md3-progress', o.value == null ? 'md3-progress--indeterminate' : ''));
        wrap.setAttribute('role', 'progressbar');
        wrap.setAttribute('aria-valuemin', '0');
        wrap.setAttribute('aria-valuemax', '100');
        if (o.value != null) wrap.setAttribute('aria-valuenow', String(o.value));
        var bar = el('div', 'md3-progress__bar');
        if (o.value != null) bar.style.width = Math.max(0, Math.min(100, o.value)) + '%';
        wrap.appendChild(bar);
        return wrap;
    }

    /** 徽标 */
    function badge(text) { return el('span', 'md3-badge', text); }

    /** 头像：首字母 */
    function avatar(text) { return el('span', 'md3-avatar', text || '?'); }

    /** 标签栏：items = [{icon, label, active, onClick}] */
    function navbar(items, opts) {
        var o = opts || {};
        var nav = el('nav', 'md3-navbar');
        nav.setAttribute('aria-label', o.label || '主导航');
        (items || []).forEach(function (it) {
            var b = el('button', cls('md3-navbar__item', it.active ? 'md3-navbar__item--active' : ''));
            b.type = 'button';
            if (it.active) b.setAttribute('aria-current', 'page');
            b.appendChild(el('span', null, it.icon || ''));
            b.appendChild(el('span', null, it.label || ''));
            if (it.onClick) b.addEventListener('click', it.onClick);
            nav.appendChild(b);
        });
        return nav;
    }

    /** 分隔线 */
    function divider() { return el('hr', 'md3-divider'); }

    /* ---------------- 导出 ---------------- */

    return {
        // 主题
        initTheme: initTheme,
        applyTheme: applyTheme,
        currentTheme: currentTheme,
        // 组件
        button: button,
        iconButton: iconButton,
        fab: fab,
        card: card,
        field: field,
        chip: chip,
        toggle: toggle,
        check: check,
        list: list,
        dialog: dialog,
        snackbar: snackbar,
        progress: progress,
        badge: badge,
        avatar: avatar,
        navbar: navbar,
        divider: divider,
        // 工具
        el: el,
        cls: cls
    };
})();

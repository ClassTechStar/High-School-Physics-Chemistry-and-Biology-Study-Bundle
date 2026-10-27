// ============================================================
// dashboard-widgets.js — 仪表盘迷你组件注册表（v1.5 / T7）
// 借鉴 Class-Widgets-2 小组件三层模型的最小子集：
//   定义 register({id,name,render,bodyEl,settings,instance})
//   → 实例 settings.dashboard.layout:[{id,widget,settings}]
//   → 预设：layout 为空时使用内置默认布局
// 挂载点：提分工具仪表盘容器 #study-dashboard-app 末尾（容器被重渲染后自动补挂）。
// 插件可通过本注册表扩展卡片（见 plugins/example）。
// ============================================================
window.HSPCBDashboard = (function () {
    'use strict';

    var defs = {};
    var BLOCK_ID = 'hspcb-widgets-block';
    var clockOff = null;

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }

    function register(def) {
        if (!def || !def.id || typeof def.render !== 'function') return false;
        var isNew = !defs[def.id];
        defs[def.id] = { id: def.id, name: def.name || def.id, render: def.render, defaultSettings: def.defaultSettings || {} };
        if (isNew) return true;
        return true;
    }

    function getLayout() {
        var layout = null;
        try {
            var s = window.HSPCBProgress && HSPCBProgress.getSettings();
            layout = s && s.dashboard && Array.isArray(s.dashboard.layout) ? s.dashboard.layout : null;
        } catch (e) { layout = null; }
        if (!layout || !layout.length) {
            layout = ['clock', 'today', 'wrong', 'checkin'].filter(function (id) { return defs[id]; })
                .map(function (id, i) { return { id: 'w' + (i + 1), widget: id, settings: {} }; });
        }
        return layout.filter(function (inst) { return inst && inst.id && defs[inst.widget]; });
    }

    function persist(layout) {
        try {
            HSPCBProgress.updateSettings(function (s) { s.dashboard.layout = layout; });
        } catch (e) { /* ignore */ }
    }

    function add(widgetId) {
        if (!defs[widgetId]) return false;
        var layout = getLayout();
        layout.push({ id: 'w' + Date.now().toString(36), widget: widgetId, settings: {} });
        persist(layout);
        remount();
        return true;
    }

    function remove(instId) {
        persist(getLayout().filter(function (x) { return x.id !== instId; }));
        remount();
    }

    function move(instId, dir) {
        var layout = getLayout();
        var i = layout.findIndex(function (x) { return x.id === instId; });
        var j = i + dir;
        if (i < 0 || j < 0 || j >= layout.length) return;
        var t = layout[i]; layout[i] = layout[j]; layout[j] = t;
        persist(layout);
        remount();
    }

    function renderCard(inst) {
        var def = defs[inst.widget];
        var card = el('div', 'hspcb-widget-card');
        card.setAttribute('data-widget-instance', inst.id);

        var head = el('div', 'hspcb-widget-head');
        head.appendChild(el('span', 'hspcb-widget-name', def.name));
        var actions = el('div', 'hspcb-widget-actions');
        var up = el('button', null, '▲');
        up.type = 'button'; up.title = '上移'; up.setAttribute('aria-label', '上移组件');
        up.addEventListener('click', function () { move(inst.id, -1); });
        var down = el('button', null, '▼');
        down.type = 'button'; down.title = '下移'; down.setAttribute('aria-label', '下移组件');
        down.addEventListener('click', function () { move(inst.id, 1); });
        var close = el('button', null, '✕');
        close.type = 'button'; close.title = '移除'; close.setAttribute('aria-label', '移除组件');
        close.addEventListener('click', function () { remove(inst.id); });
        actions.appendChild(up); actions.appendChild(down); actions.appendChild(close);
        head.appendChild(actions);
        card.appendChild(head);

        var body = el('div', 'hspcb-widget-body');
        var merged = {};
        Object.keys(def.defaultSettings).forEach(function (k) { merged[k] = def.defaultSettings[k]; });
        Object.keys(inst.settings || {}).forEach(function (k) { merged[k] = inst.settings[k]; });
        try {
            def.render(body, merged, inst);
        } catch (e) {
            body.textContent = '组件加载失败：' + (e && e.message || '未知错误');
        }
        card.appendChild(body);
        return card;
    }

    function mount() {
        var host = document.getElementById('study-dashboard-app');
        if (!host || document.getElementById(BLOCK_ID)) return false;
        var block = el('div', 'hspcb-widgets-block');
        block.id = BLOCK_ID;

        var head = el('div', 'hspcb-widgets-head');
        head.appendChild(el('span', 'hspcb-widgets-title', '🧩 迷你组件'));
        var addSel = el('select', 'hspcb-select');
        addSel.setAttribute('aria-label', '添加组件');
        addSel.appendChild(el('option', null, '＋ 添加组件'));
        Object.keys(defs).forEach(function (id) {
            var o = el('option', null, defs[id].name);
            o.value = id;
            addSel.appendChild(o);
        });
        addSel.addEventListener('change', function () {
            if (addSel.value) { add(addSel.value); addSel.value = ''; }
        });
        head.appendChild(addSel);
        block.appendChild(head);

        var grid = el('div', 'hspcb-widgets-grid');
        getLayout().forEach(function (inst) { grid.appendChild(renderCard(inst)); });
        if (!grid.childNodes.length) {
            grid.appendChild(el('div', 'hspcb-muted', '暂无组件'));
        }
        block.appendChild(grid);
        host.appendChild(block);
        return true;
    }

    function remount() {
        var host = document.getElementById('study-dashboard-app');
        var old = host && host.querySelector('#' + BLOCK_ID);
        if (old && old.parentNode) old.parentNode.removeChild(old);
        mount();
    }

    // 容器被 study-dashboard 重渲染后自动补挂（tick 轮询，代价一次 getElementById）
    if (window.HSPCBTick) {
        HSPCBTick.on(function () {
            try {
                if (typeof document === 'undefined') return;
                var host = document.getElementById('study-dashboard-app');
                if (host && !document.getElementById(BLOCK_ID)) mount();
            } catch (e) { /* ignore */ }
        });
    }

    /* ---------------- 内置组件 ---------------- */

    register({
        id: 'clock', name: '时钟',
        render: function (body) {
            if (clockOff) { clockOff(); clockOff = null; }
            var time = el('div', 'hspcb-clock-time', '--:--:--');
            var date = el('div', 'hspcb-clock-date', '');
            body.appendChild(time); body.appendChild(date);
            function tick(now) {
                var p = function (x) { return x < 10 ? '0' + x : '' + x; };
                time.textContent = p(now.getHours()) + ':' + p(now.getMinutes()) + ':' + p(now.getSeconds());
                var week = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];
                date.textContent = (now.getMonth() + 1) + '月' + now.getDate() + '日 · 周' + week;
            }
            tick(new Date());
            if (window.HSPCBTick) clockOff = HSPCBTick.on(tick);
        }
    });

    register({
        id: 'today', name: '当前时段',
        render: function (body) {
            var line = el('div', null, '作息表未启用');
            line.className = 'hspcb-muted';
            body.appendChild(line);
            if (!window.HSPCBSchedule) return;
            HSPCBSchedule.getStatus(function (st) {
                body.textContent = '';
                if (!st.enabled) {
                    line.textContent = '作息表未启用（设置 → 作息表）';
                    body.appendChild(line);
                    return;
                }
                var chip = el('div', null);
                var label = { study: '学习中', break: '休息中', activity: '自主安排', preparation: '即将开始', free: '空闲' }[st.state] || st.state;
                chip.textContent = '【' + label + '】' + (st.scheduleName || '');
                if (st.current) {
                    chip.appendChild(el('div', 'hspcb-muted', st.current.title + '（还剩 ' + st.remainingMinutes + ' 分钟）'));
                } else if (st.next) {
                    chip.appendChild(el('div', 'hspcb-muted', '下一项：' + st.next.start + ' ' + st.next.title));
                }
                body.appendChild(chip);
            });
        }
    });

    register({
        id: 'wrong', name: '错题概览',
        render: function (body) {
            var count = 0;
            try { count = (window.HSPCBProgress && HSPCBProgress.get('wrongQuestions') || []).length; } catch (e) { count = 0; }
            var big = el('div', 'hspcb-stat-big', String(count));
            big.style !== undefined && (big.style.color = count > 0 ? 'var(--exam, #ef4444)' : 'var(--success, #10b981)');
            body.appendChild(big);
            body.appendChild(el('div', 'hspcb-muted', '错题本待清理'));
            if (count > 0 && typeof showSection === 'function') {
                var btn = el('button', 'hspcb-widget-btn', '去刷题');
                btn.type = 'button';
                btn.addEventListener('click', function () { try { showSection('exam-section'); } catch (e) { /* ignore */ } });
                body.appendChild(btn);
            }
        }
    });

    register({
        id: 'checkin', name: '打卡连击',
        render: function (body) {
            var streak = 0;
            try {
                var raw = window.HSPCBStore && HSPCBStore.get('hspcb_daily_checkin');
                var map = raw ? JSON.parse(raw) : {};
                var d = new Date();
                for (;;) {
                    var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                    if (map[key] === true) { streak++; d.setDate(d.getDate() - 1); } else break;
                }
            } catch (e) { streak = 0; }
            var big = el('div', 'hspcb-stat-big', streak + ' 天');
            body.appendChild(big);
            body.appendChild(el('div', 'hspcb-muted', streak > 0 ? '保持下去' : '今天打个卡吧（提分工具）'));
        }
    });

    return {
        register: register,
        add: add,
        remove: remove,
        move: move,
        mount: mount,
        remount: remount,
        listDefs: function () { return Object.keys(defs).map(function (id) { return { id: id, name: defs[id].name }; }); }
    };
})();

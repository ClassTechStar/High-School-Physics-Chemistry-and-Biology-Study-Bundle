// ============================================================
// settings-center.js — 设置中心（v1.5 / T4 UI + T8 备份 UI + T12 作息编辑器
// + T14 主题包/锁定模式 + 插件管理）
// 入口：页角 ⚙️ 按钮（data-hook="open-settings"）或深链 ?goto=settings
// 全部 DOM 构建 + 真实事件绑定，无内联事件/内联样式（CSP 合规）。
// ============================================================
window.HSPCBSettingsUI = (function () {
    'use strict';

    var maskEl = null;
    var bodyEl = null;
    var tabbarEl = null;
    var activeTab = 'general';

    /* ---------------- 小工具 ---------------- */

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = text;
        return n;
    }
    function row(labelText, hintText) {
        var r = el('div', 'hspcb-row');
        var left = el('div');
        left.appendChild(el('div', 'hspcb-row-label', labelText));
        if (hintText) left.appendChild(el('div', 'hspcb-row-hint', hintText));
        r.appendChild(left);
        return r;
    }
    function checkbox(checked, onChange, label) {
        var cb = el('input');
        cb.type = 'checkbox';
        cb.checked = !!checked;
        if (label) cb.setAttribute('aria-label', label);
        cb.addEventListener('change', function () { onChange(cb.checked); });
        return cb;
    }
    function select(options, value, onChange) {
        var s = el('select', 'hspcb-select');
        options.forEach(function (o) {
            var op = el('option', null, o.name);
            op.value = o.value;
            s.appendChild(op);
        });
        s.value = value;
        s.addEventListener('change', function () { onChange(s.value); });
        return s;
    }
    function btn(text, cls, onClick) {
        var b = el('button', 'hspcb-btn' + (cls ? ' ' + cls : ''), text);
        b.type = 'button';
        b.addEventListener('click', onClick);
        return b;
    }
    function hashPin(pin) { // 防误触用的轻混淆，非加密（界面已明示）
        var h = 5381;
        var s = String(pin);
        for (var i = 0; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; }
        return 'h' + h.toString(16);
    }

    /* ---------------- Tab：通用 ---------------- */

    function tabGeneral() {
        var frag = document.createDocumentFragment();
        var s = HSPCBProgress.getSettings();

        var rTheme = row('界面主题', '与右下角 🌙 按钮等效');
        rTheme.appendChild(select([{ value: 'light', name: '亮色' }, { value: 'dark', name: '暗色' }], s.theme || 'light', function (v) {
            try {
                if (typeof window.setTheme === 'function') window.setTheme(v);
                HSPCBProgress.updateSettings(function (st) { st.theme = v; });
            } catch (e) { /* ignore */ }
        }));
        frag.appendChild(rTheme);

        var packs = (window.HSPCBTheme && HSPCBTheme.listPacks()) || [{ id: 'none', name: '默认外观' }];
        var rPack = row('外观主题包', '加载失败会自动回退默认');
        rPack.appendChild(select(packs.map(function (p) { return { value: p.id, name: p.name }; }),
            (window.HSPCBTheme && HSPCBTheme.current()) || 'none',
            function (v) { window.HSPCBTheme && HSPCBTheme.setPack(v); }));
        frag.appendChild(rPack);

        var about = el('div', 'hspcb-card hspcb-muted');
        about.textContent = 'HSPCB ' + (document.documentElement.getAttribute('data-app-version') || '') + ' · 所有数据仅存于本浏览器。';
        frag.appendChild(about);
        return frag;
    }

    /* ---------------- Tab：通知 ---------------- */

    function tabNotify() {
        var frag = document.createDocumentFragment();
        var s = HSPCBProgress.getSettings();

        var rMaster = row('启用应用内提醒', '关闭后所有提醒静默');
        rMaster.appendChild(checkbox((s.notifications || {}).master !== false, function (on) {
            window.HSPCBNotify && HSPCBNotify.setMaster(on);
            rerenderBody();
        }, '启用应用内提醒'));
        frag.appendChild(rMaster);

        if (window.HSPCBNotify) {
            HSPCBNotify.listProviders().forEach(function (p) {
                var r = row(p.name, p.id);
                r.appendChild(checkbox(p.enabled, function (on) { HSPCBNotify.setProviderEnabled(p.id, on); }, p.name));
                frag.appendChild(r);
            });
        }

        var actions = el('div', 'hspcb-card');
        actions.appendChild(btn('申请系统通知权限', 'hspcb-btn-primary', function () {
            if (!window.HSPCBNotify) return;
            HSPCBNotify.requestSystemPermission().then(function (state) {
                window.HSPCBNotify.notify({
                    id: 'notify.perm.' + Date.now(), level: 'info', duration: 4000,
                    title: '系统通知权限：' + state,
                    message: state === 'granted' ? '页面在后台时也会收到系统通知。' : '未授权时仅使用应用内提醒。'
                });
            });
        }));
        actions.appendChild(btn('发一条测试提醒', null, function () {
            window.HSPCBNotify && HSPCBNotify.notify({
                id: 'notify.test.' + Date.now(), level: 'info', duration: 5000,
                title: '这是一条测试提醒', message: '如果你能看到这行字，说明通知中心工作正常。'
            });
        }));
        frag.appendChild(actions);
        return frag;
    }

    /* ---------------- Tab：作息表（含编辑器 T12） ---------------- */

    var editorRules = null; // 编辑中的 rules 数组

    function scheduleStatusLine() {
        var s = HSPCBProgress.getSettings();
        var file = (s.schedule || {}).file;
        var line = el('div', 'hspcb-muted');
        line.textContent = file ? '当前数据源：' + file : '未启用（启用后，「当前时段」组件与时段提醒可用）';
        return line;
    }

    function tabSchedule() {
        var frag = document.createDocumentFragment();
        frag.appendChild(scheduleStatusLine());

        var actions = el('div', 'hspcb-card');
        actions.appendChild(btn('启用示例作息', 'hspcb-btn-primary', function () {
            HSPCBProgress.updateSettings(function (st) { st.schedule.file = 'data/schedules/study-example.json'; });
            window.HSPCBSchedule && HSPCBSchedule.configure(null);
            rerenderBody();
        }));
        actions.appendChild(btn('新建/编辑我的作息', null, function () {
            editorRules = null;
            rerenderBody('editor');
        }));
        actions.appendChild(btn('停用作息表', 'hspcb-btn-danger', function () {
            HSPCBProgress.updateSettings(function (st) { st.schedule.file = null; });
            window.HSPCBSchedule && HSPCBSchedule.configure(null);
            rerenderBody();
        }));
        frag.appendChild(actions);

        if (activeSub === 'editor') {
            frag.appendChild(el('div', 'hspcb-widgets-title', '作息表编辑器'));
            frag.appendChild(renderEditor());
        }
        return frag;
    }

    function loadEditorRules(cb) {
        if (editorRules) { cb(editorRules); return; }
        var s = HSPCBProgress.getSettings();
        var file = (s.schedule || {}).file;
        var finish = function (data) {
            editorRules = (data && Array.isArray(data.days)) ? JSON.parse(JSON.stringify(data.days)) : [];
            cb(editorRules);
        };
        if (file && file.indexOf('store:') === 0) {
            var raw = window.HSPCBStore && HSPCBStore.get(file.slice(6));
            var parsed = null;
            try { parsed = raw ? JSON.parse(raw) : null; } catch (e) { parsed = null; }
            finish(parsed);
        } else if (file) {
            if (typeof fetch !== 'function') { finish(null); return; }
            fetch(file).then(function (r) { return r.ok ? r.json() : null; }).then(finish).catch(function () { finish(null); });
        } else {
            finish(null);
        }
    }

    function entryRow(entry, onRemove) {
        var r = el('div', 'hspcb-entry-row');
        var type = el('select', 'hspcb-select');
        [['study', '学习'], ['activity', '自主'], ['break', '休息']].forEach(function (p) {
            var o = el('option', null, p[1]); o.value = p[0]; type.appendChild(o);
        });
        type.value = entry.type;
        type.addEventListener('change', function () { entry.type = type.value; });

        var start = el('input', 'hspcb-input'); start.type = 'time'; start.value = entry.start;
        start.addEventListener('change', function () { entry.start = start.value; });
        var end = el('input', 'hspcb-input'); end.type = 'time'; end.value = entry.end;
        end.addEventListener('change', function () { entry.end = end.value; });
        var title = el('input', 'hspcb-input hspcb-entry-title');
        title.type = 'text'; title.placeholder = '内容（可选）'; title.value = entry.title || '';
        title.addEventListener('input', function () { entry.title = title.value; });
        var del = btn('删', 'hspcb-btn-danger', onRemove);

        r.appendChild(type); r.appendChild(start); r.appendChild(end); r.appendChild(title); r.appendChild(del);
        return r;
    }

    function renderEditor() {
        var wrap = el('div');
        var hint = el('div', 'hspcb-muted', '时段类型：学习 / 自主 / 休息。保存后立即生效并本地保存。');
        wrap.appendChild(hint);
        var list = el('div');

        loadEditorRules(function (rules) {
            list.textContent = '';
            rules.forEach(function (rule, ri) {
                var card = el('div', 'hspcb-card hspcb-rule-card');
                var head = el('div', 'hspcb-rule-head');

                var wd = el('select', 'hspcb-select');
                [['1', '周一'], ['2', '周二'], ['3', '周三'], ['4', '周四'], ['5', '周五'], ['6', '周六'], ['7', '周日']].forEach(function (p) {
                    var o = el('option', null, p[1]); o.value = p[0]; wd.appendChild(o);
                });
                wd.value = String(rule.dayOfWeek || 1);
                wd.addEventListener('change', function () { rule.dayOfWeek = parseInt(wd.value, 10); });

                var wk = el('select', 'hspcb-select');
                [['all', '每周'], ['odd', '单周'], ['even', '双周']].forEach(function (p) {
                    var o = el('option', null, p[1]); o.value = p[0]; wk.appendChild(o);
                });
                wk.value = typeof rule.weeks === 'string' ? rule.weeks : 'all';
                wk.addEventListener('change', function () { rule.weeks = wk.value; });

                head.appendChild(wd); head.appendChild(wk);
                head.appendChild(btn('删除此规则', 'hspcb-btn-danger', function () {
                    rules.splice(ri, 1); rerenderBody('editor');
                }));
                card.appendChild(head);

                (rule.entries || []).forEach(function (entry, ei) {
                    card.appendChild(entryRow(entry, function () {
                        rule.entries.splice(ei, 1); rerenderBody('editor');
                    }));
                });
                card.appendChild(btn('＋ 添加时段', null, function () {
                    rule.entries = rule.entries || [];
                    rule.entries.push({ type: 'study', start: '19:00', end: '20:00', title: '' });
                    rerenderBody('editor');
                }));
                list.appendChild(card);
            });

            wrap.appendChild(list);
            var foot = el('div');
            foot.appendChild(btn('＋ 添加规则', null, function () {
                rules.push({ dayOfWeek: 1, weeks: 'all', entries: [{ type: 'study', start: '19:00', end: '20:00', title: '' }] });
                rerenderBody('editor');
            }));
            foot.appendChild(btn('保存并启用', 'hspcb-btn-primary', function () {
                var data = { meta: { name: '我的作息', schemaVersion: 1 }, days: rules, overrides: {} };
                var err = window.HSPCBSchedule && HSPCBSchedule.validate(data);
                if (err) {
                    window.HSPCBNotify && HSPCBNotify.notify({
                        id: 'schedule.invalid', level: 'error', duration: 6000,
                        title: '作息表校验未通过', message: err
                    });
                    return;
                }
                try {
                    window.HSPCBStore && HSPCBStore.set('schedule.custom', JSON.stringify(data));
                    HSPCBProgress.updateSettings(function (st) { st.schedule.file = 'store:schedule.custom'; });
                    window.HSPCBSchedule && HSPCBSchedule.configure(null);
                    window.HSPCBNotify && HSPCBNotify.notify({
                        id: 'schedule.saved', level: 'info', duration: 4000,
                        title: '作息表已保存', message: '已启用「我的作息」。'
                    });
                    activeSub = null;
                    rerenderBody();
                } catch (e) { /* ignore */ }
            }));
            foot.appendChild(btn('返回', null, function () { activeSub = null; rerenderBody(); }));
            wrap.appendChild(foot);
        });
        return wrap;
    }

    /* ---------------- Tab：备份 ---------------- */

    function tabBackup() {
        var frag = document.createDocumentFragment();
        frag.appendChild(el('div', 'hspcb-muted', '每日首次打开页面自动快照，保留最近 3 份。恢复会覆盖当前全部学习记录。'));
        var slots = (window.HSPCBProgress && HSPCBProgress.listSnapshots) ? HSPCBProgress.listSnapshots() : [];
        var card = el('div', 'hspcb-card');
        if (!slots.length) {
            card.appendChild(el('div', 'hspcb-muted', '暂无快照'));
        }
        slots.forEach(function (s) {
            var r = el('div', 'hspcb-row');
            r.appendChild(el('div', 'hspcb-row-label', '快照 · ' + s.date + '（' + s.count + ' 条记录）'));
            r.appendChild(btn('恢复', 'hspcb-btn-danger', function () {
                if (!window.confirm('确定恢复到 ' + s.date + ' 的快照？当前学习记录将被覆盖。')) return;
                var res = HSPCBProgress.restoreSnapshot(s.slot);
                if (res && res.ok) window.location.reload();
            }));
            card.appendChild(r);
        });
        frag.appendChild(card);
        frag.appendChild(btn('立即创建快照', 'hspcb-btn-primary', function () {
            window.HSPCBProgress && HSPCBProgress.snapshotNow();
            window.HSPCBNotify && HSPCBNotify.notify({
                id: 'backup.manual', level: 'info', duration: 4000,
                title: '快照已创建', message: '可在本页随时恢复。'
            });
            rerenderBody();
        }));
        return frag;
    }

    /* ---------------- Tab：安全与插件 ---------------- */

    function applyLockUI() {
        try {
            var s = HSPCBProgress.getSettings();
            var locked = !!(s.security && s.security.lockPin);
            document.body.classList.toggle('hspcb-locked', locked);
            if (locked) {
                // 标记清数据入口（锁定期间隐藏）
                document.querySelectorAll('.btn-reset-stats, [data-call="HSPCBProgress.resetAll"]').forEach(function (n) {
                    n.setAttribute('data-lock-hide', '');
                });
            }
        } catch (e) { /* ignore */ }
    }

    function tabSecurity() {
        var frag = document.createDocumentFragment();
        var s = HSPCBProgress.getSettings();
        var locked = !!(s.security && s.security.lockPin);

        var lockCard = el('div', 'hspcb-card');
        if (!locked) {
            lockCard.appendChild(el('div', 'hspcb-row-label', '启用锁定模式'));
            lockCard.appendChild(el('div', 'hspcb-row-hint', '隐藏「清除学习数据」类入口，防止机房共用电脑误清记录。PIN 仅作防误触（非加密）。'));
            var pinRow = el('div', 'hspcb-entry-row');
            var pin = el('input', 'hspcb-input');
            pin.type = 'password'; pin.placeholder = '4-8 位数字'; pin.setAttribute('maxlength', '8');
            pinRow.appendChild(pin);
            pinRow.appendChild(btn('启用', 'hspcb-btn-primary', function () {
                if (!/^\d{4,8}$/.test(pin.value)) {
                    window.HSPCBNotify && HSPCBNotify.notify({ id: 'lock.bad', level: 'warn', duration: 4000, title: 'PIN 需为 4-8 位数字' });
                    return;
                }
                HSPCBProgress.updateSettings(function (st) { st.security.lockPin = hashPin(pin.value); });
                applyLockUI();
                rerenderBody();
            }));
            lockCard.appendChild(pinRow);
        } else {
            lockCard.appendChild(el('div', 'hspcb-row-label', '锁定模式已启用'));
            var unlockRow = el('div', 'hspcb-entry-row');
            var pin2 = el('input', 'hspcb-input');
            pin2.type = 'password'; pin2.placeholder = '输入 PIN 解除';
            unlockRow.appendChild(pin2);
            unlockRow.appendChild(btn('解除锁定', null, function () {
                if (hashPin(pin2.value) !== s.security.lockPin) {
                    window.HSPCBNotify && HSPCBNotify.notify({ id: 'lock.wrong', level: 'warn', duration: 4000, title: 'PIN 不正确' });
                    return;
                }
                HSPCBProgress.updateSettings(function (st) { st.security.lockPin = null; });
                applyLockUI();
                rerenderBody();
            }));
            lockCard.appendChild(unlockRow);
        }
        frag.appendChild(lockCard);

        // 插件管理
        var pluginCard = el('div', 'hspcb-card');
        pluginCard.appendChild(el('div', 'hspcb-row-label', '插件'));
        var list = window.HSPCBPlugins ? HSPCBPlugins.list() : [];
        if (!list.length) pluginCard.appendChild(el('div', 'hspcb-row-hint', '未加载任何插件（清单见 1.2/plugins/index.json）'));
        list.forEach(function (p) {
            var r = el('div', 'hspcb-row');
            var label = p.name + (p.version ? ' · v' + p.version : '') + (p.failed ? '（失败：' + p.failed + '）' : '');
            r.appendChild(el('div', 'hspcb-row-label', label));
            r.appendChild(checkbox(!p.disabled, function (on) {
                window.HSPCBPlugins && HSPCBPlugins.setEnabled(p.id, on);
                window.HSPCBNotify && HSPCBNotify.notify({
                    id: 'plugin.toggle', level: 'info', duration: 4000,
                    title: '已' + (on ? '启用' : '停用') + '插件', message: '刷新页面后生效。'
                });
            }, p.name));
            pluginCard.appendChild(r);
        });
        frag.appendChild(pluginCard);

        // 启动自检报告
        var bootCard = el('div', 'hspcb-card');
        bootCard.appendChild(el('div', 'hspcb-row-label', '启动自检'));
        var rep = window.HSPCBBoot ? HSPCBBoot.report() : { safe: false, missing: [], fails: {}, skip: {} };
        var repText = '安全模式：' + (rep.safe ? '是' : '否') +
            (rep.missing && rep.missing.length ? ' · 缺失模块：' + rep.missing.join('、') : ' · 核心模块齐全');
        bootCard.appendChild(el('div', 'hspcb-row-hint', repText));
        frag.appendChild(bootCard);
        return frag;
    }

    /* ---------------- 弹窗骨架 ---------------- */

    var TABS = [
        { id: 'general', name: '通用', render: tabGeneral },
        { id: 'notify', name: '通知', render: tabNotify },
        { id: 'schedule', name: '作息表', render: tabSchedule },
        { id: 'backup', name: '备份', render: tabBackup },
        { id: 'security', name: '安全与插件', render: tabSecurity }
    ];
    var activeSub = null; // 作息表内的子视图：'editor'

    function rerenderBody(sub) {
        if (sub !== undefined) activeSub = sub;
        if (!bodyEl) return;
        bodyEl.textContent = '';
        var tab = TABS.filter(function (t) { return t.id === activeTab; })[0] || TABS[0];
        try {
            bodyEl.appendChild(tab.render());
        } catch (e) {
            bodyEl.appendChild(el('div', 'hspcb-muted', '该页渲染出错：' + (e && e.message)));
        }
    }

    function renderTabs() {
        if (!tabbarEl) return;
        tabbarEl.textContent = '';
        TABS.forEach(function (t) {
            var b = el('button', 'hspcb-tab' + (t.id === activeTab ? ' hspcb-tab-active' : ''), t.name);
            b.type = 'button';
            b.addEventListener('click', function () {
                activeTab = t.id;
                activeSub = null;
                renderTabs();
                rerenderBody();
            });
            tabbarEl.appendChild(b);
        });
    }

    function open() {
        if (maskEl) { rerenderBody(); return; }
        maskEl = el('div', 'hspcb-modal-mask');
        var modal = el('div', 'hspcb-modal');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-label', '设置');

        var head = el('div', 'hspcb-modal-head');
        head.appendChild(el('div', 'hspcb-modal-title', '设置'));
        var close = el('button', 'hspcb-modal-close', '✕');
        close.type = 'button';
        close.setAttribute('aria-label', '关闭设置');
        close.addEventListener('click', closeSelf);
        head.appendChild(close);
        modal.appendChild(head);

        tabbarEl = el('div', 'hspcb-modal-tabs');
        modal.appendChild(tabbarEl);

        bodyEl = el('div', 'hspcb-modal-body');
        modal.appendChild(bodyEl);

        maskEl.appendChild(modal);
        maskEl.addEventListener('click', function (ev) { if (ev.target === maskEl) closeSelf(); });
        document.addEventListener('keydown', onKey);
        document.body.appendChild(maskEl);

        renderTabs();
        rerenderBody();
    }

    function onKey(ev) {
        if (ev.key === 'Escape') closeSelf();
    }

    function closeSelf() {
        if (maskEl && maskEl.parentNode) maskEl.parentNode.removeChild(maskEl);
        maskEl = null; bodyEl = null; tabbarEl = null; activeSub = null;
        document.removeEventListener('keydown', onKey);
    }

    // 入口接线：⚙️ 按钮（data-hook 委托）
    function wire() {
        try {
            if (window.HSPCBEV && typeof HSPCBEV.on === 'function') {
                HSPCBEV.on('click', '[data-hook="open-settings"]', function () { open(); });
            } else if (typeof document !== 'undefined') {
                document.addEventListener('click', function (ev) {
                    var t = ev.target && ev.target.closest ? ev.target.closest('[data-hook="open-settings"]') : null;
                    if (t) open();
                });
            }
        } catch (e) { /* ignore */ }
        // 启动时应用锁定状态
        if (typeof document !== 'undefined') {
            var apply = function () { applyLockUI(); };
            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
            else apply();
        }
    }
    wire();

    return { open: open, close: closeSelf };
})();

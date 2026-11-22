// ============================================================
// md3-demo.js — MD3 组件目录页的装配脚本
// 页面骨架在 md3.html，组件全部由 window.MD3 构造；
// 这里不写任何视觉数值，避免与 token 体系脱节。
// ============================================================
(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }

    ready(function () {
        var M = window.MD3;
        if (!M) return;

        M.initTheme();

        /* ---------- 主题切换 ---------- */
        var themeBtn = document.getElementById('themeBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', function () {
                var next = M.currentTheme() === 'dark' ? 'light' : 'dark';
                M.applyTheme(next);
                themeBtn.setAttribute('aria-label', next === 'dark' ? '切换到浅色' : '切换到深色');
            });
        }

        /* ---------- 色彩 ---------- */
        var PALETTE = [
            'primary', 'on-primary', 'primary-container', 'on-primary-container',
            'secondary', 'secondary-container', 'tertiary', 'tertiary-container',
            'surface', 'surface-container-lowest', 'surface-container-low', 'surface-container',
            'surface-container-high', 'surface-container-highest', 'on-surface', 'on-surface-variant',
            'outline', 'outline-variant', 'error', 'error-container',
            'inverse-surface', 'inverse-primary', 'surface-bright', 'surface-dim'
        ];
        var sw = document.getElementById('swatches');
        if (sw) {
            PALETTE.forEach(function (name) {
                var box = M.el('div', 'swatch');
                var chip = M.el('div', 'swatch__chip');
                chip.style.background = 'var(--md3-' + name + ')';
                var meta = M.el('div', 'swatch__meta');
                meta.appendChild(M.el('div', 'swatch__name', '--md3-' + name));
                box.appendChild(chip);
                box.appendChild(meta);
                sw.appendChild(box);
            });
        }

        /* ---------- 字阶 ---------- */
        var TYPE = [
            ['display-large', 'Display Large 57/64'], ['display-medium', 'Display Medium 45/52'],
            ['display-small', 'Display Small 36/44'], ['headline-large', 'Headline Large 32/40'],
            ['headline-medium', 'Headline Medium 28/36'], ['headline-small', 'Headline Small 24/32'],
            ['title-large', 'Title Large 22/28'], ['title-medium', 'Title Medium 16/24'],
            ['title-small', 'Title Small 14/20'], ['body-large', 'Body Large 16/24'],
            ['body-medium', 'Body Medium 14/20'], ['body-small', 'Body Small 12/16'],
            ['label-large', 'Label Large 14/20'], ['label-medium', 'Label Medium 12/16'],
            ['label-small', 'Label Small 11/16'], ['large-title', 'Large Title 34/41（iOS）'],
            ['nav-title', 'Nav Title 17/22（iOS）'], ['subhead', 'Subhead 15/20（iOS）'],
            ['footnote', 'Footnote 13/18（iOS）']
        ];
        var ts = document.getElementById('typeScale');
        if (ts) {
            TYPE.forEach(function (pair) {
                var row = M.el('div', 'type-row');
                row.appendChild(M.el('span', 'type-row__label md3-label-small', pair[1]));
                row.appendChild(M.el('span', 'md3-' + pair[0], '永字八法 Aa 123'));
                ts.appendChild(row);
            });
        }

        /* ---------- 按钮 ---------- */
        var btnRow = document.getElementById('btnRow');
        if (btnRow) {
            ['filled', 'tonal', 'elevated', 'outlined', 'text'].forEach(function (v) {
                btnRow.appendChild(M.button({
                    label: v, variant: v,
                    onClick: function () {
                        M.snackbar({ message: '你点了 ' + v + ' 按钮', action: '知道了' });
                    }
                }));
            });
        }
        var btnSizeRow = document.getElementById('btnSizeRow');
        if (btnSizeRow) {
            btnSizeRow.appendChild(M.button({ label: '小（44px）', size: 'sm' }));
            btnSizeRow.appendChild(M.button({ label: '默认（48px）' }));
            btnSizeRow.appendChild(M.button({ label: '大（56px）', size: 'lg' }));
            btnSizeRow.appendChild(M.button({ label: '禁用', disabled: true }));
        }
        var btnMiscRow = document.getElementById('btnMiscRow');
        if (btnMiscRow) {
            btnMiscRow.appendChild(M.iconButton({ icon: '⚙', label: '设置' }));
            btnMiscRow.appendChild(M.iconButton({ icon: '🔍', label: '搜索' }));
            btnMiscRow.appendChild(M.fab({ icon: '＋', label: '新建', ariaLabel: '新建条目' }));
            btnMiscRow.appendChild(M.badge('3'));
            btnMiscRow.appendChild(M.avatar('物'));
        }

        /* ---------- 卡片 ---------- */
        var cards = document.getElementById('cardGrid');
        if (cards) {
            cards.appendChild(M.card({ variant: 'elevated', title: 'Elevated', body: '带双层阴影，用于需要浮起感的独立信息块。' }));
            cards.appendChild(M.card({ variant: 'filled', title: 'Filled', body: '用 surface-container-highest 承托内容，强调分区。' }));
            cards.appendChild(M.card({ variant: 'outlined', title: 'Outlined', body: '描边代替阴影，信息密度高的列表区更清爽。' }));
            cards.appendChild(M.card({
                variant: 'elevated', interactive: true, title: '可交互卡片',
                body: '悬停抬升一档阴影，键盘 Enter / Space 可触发。',
                onClick: function () { M.snackbar({ message: '卡片被激活' }); }
            }));
        }

        /* ---------- 输入 ---------- */
        var fields = document.getElementById('fieldStack');
        if (fields) {
            fields.appendChild(M.field({ placeholder: 'Outlined 输入框', label: '示例输入' }));
            fields.appendChild(M.field({ placeholder: 'Filled 输入框', variant: 'filled', label: '填充式输入' }));
            fields.appendChild(M.field({ placeholder: '多行文本…', multiline: true, label: '多行输入' }));
            fields.appendChild(M.field({ placeholder: '禁用状态', label: '禁用输入', value: '' })).disabled = true;
        }

        /* ---------- 选择控件 ---------- */
        var choice = document.getElementById('choiceRow');
        if (choice) {
            choice.appendChild(M.toggle({ label: '开启提醒', checked: true, onChange: function (v) {
                M.snackbar({ message: '开关 → ' + (v ? '开' : '关') });
            } }));
            choice.appendChild(M.check({ label: '复选框', checked: true }));
            choice.appendChild(M.check({ label: '单选 A', type: 'radio', name: 'demo-radio', checked: true }));
            choice.appendChild(M.check({ label: '单选 B', type: 'radio', name: 'demo-radio' }));
        }

        /* ---------- 芯片 ---------- */
        var chips = document.getElementById('chipRow');
        if (chips) {
            chips.appendChild(M.chip({ label: '全部', selected: true }));
            chips.appendChild(M.chip({ label: '物理' }));
            chips.appendChild(M.chip({ label: '化学' }));
            chips.appendChild(M.chip({ label: '生物' }));
            chips.appendChild(M.chip({ label: '＋ 添加', variant: 'assist' }));
        }

        /* ---------- 列表 ---------- */
        var listHost = document.getElementById('listHost');
        if (listHost) {
            listHost.appendChild(M.list([
                { text: '错题本', support: '按知识点归类的待复习条目', trail: '12', onClick: function () { M.snackbar({ message: '打开错题本' }); } },
                { text: '模拟考试', support: '六科组卷，限时计分' },
                { text: '学习仪表盘', support: '打卡连击与今日应复习', selected: true },
                { text: '设置', trail: '›' }
            ], { label: '功能列表' }));
        }

        /* ---------- 进度 ---------- */
        var prog = document.getElementById('progressStack');
        if (prog) {
            prog.appendChild(M.el('div', 'md3-label-small', '确定态 68%'));
            prog.appendChild(M.progress({ value: 68 }));
            prog.appendChild(M.el('div', 'md3-label-small', '不确定态'));
            prog.appendChild(M.progress({ value: null }));
        }
        var fb = document.getElementById('feedbackRow');
        if (fb) {
            fb.appendChild(M.button({ label: '弹 Snackbar', variant: 'tonal', onClick: function () {
                M.snackbar({ message: '已保存到本地', action: '撤销', onAction: function () { M.snackbar({ message: '已撤销' }); } });
            } }));
            fb.appendChild(M.button({ label: '打开对话框', variant: 'filled', onClick: function () {
                M.dialog({
                    title: '确认清除？',
                    body: '该操作会清空本机学习记录，且无法撤销。',
                    actions: [
                        { label: '取消', variant: 'text' },
                        { label: '确认清除', variant: 'filled', onClick: function () { M.snackbar({ message: '（演示）已清除' }); } }
                    ]
                });
            } }));
        }

        /* ---------- 导航 ---------- */
        var navHost = document.getElementById('navHost');
        if (navHost) {
            navHost.appendChild(M.navbar([
                { icon: '🏠', label: '首页', active: true },
                { icon: '📚', label: '题库' },
                { icon: '📝', label: '错题本' },
                { icon: '📊', label: '仪表盘' },
                { icon: '⚙️', label: '设置' }
            ], { label: '示例标签栏' }));
        }
        var ov = document.getElementById('overlayRow');
        if (ov) {
            ov.appendChild(M.button({ label: '图标按钮组', variant: 'outlined', onClick: function () {
                M.snackbar({ message: '图标按钮在导航区已展示' });
            } }));
        }

        /* ---------- 形状 ---------- */
        var SHAPES = [
            ['extra-small', '4px'], ['small', '8px'], ['medium', '12px'], ['large', '16px'],
            ['large-increased', '20px'], ['extra-large', '28px'], ['extra-large-increased', '32px'],
            ['extra-extra-large', '48px'], ['full', '胶囊']
        ];
        var shapeGrid = document.getElementById('shapeGrid');
        if (shapeGrid) {
            SHAPES.forEach(function (pair) {
                var card = M.el('div', 'shape-card');
                var demo = M.el('div', 'shape-demo', pair[1]);
                demo.style.borderRadius = 'var(--md3-shape-' + pair[0] + ')';
                var meta = M.el('div', 'shape-card__meta', '--md3-shape-' + pair[0]);
                card.appendChild(demo);
                card.appendChild(meta);
                shapeGrid.appendChild(card);
            });
        }

        /* ---------- 阴影 ---------- */
        var ELEV = [
            ['rest', 'Rest 0.0'], ['low', 'Low 0.2'], ['raised', 'Raised 0.35'],
            ['lifted', 'Lifted 0.6'], ['floating', 'Floating 1.0']
        ];
        var elevGrid = document.getElementById('elevGrid');
        if (elevGrid) {
            ELEV.forEach(function (pair) {
                var card = M.el('div', 'shape-card');
                card.appendChild(M.el('div', 'elev-demo elev-' + pair[0], pair[1]));
                card.appendChild(M.el('div', 'shape-card__meta', '--md3-elevation-' + pair[0] + '-shadow'));
                elevGrid.appendChild(card);
            });
        }
    });
})();

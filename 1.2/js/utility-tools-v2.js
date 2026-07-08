// ============================================================
// js/utility-tools-v2.js — 实用工具 V2
// 包含：考试计时器 Pro / 知识点卡片导出
// ES5 兼容，零依赖，innerHTML + 内联 style + Canvas 渲染
// ============================================================

// ============================================================
// 模块 1: examTimerPro — 考试计时器 Pro
// 容器 ID: exam-timer-pro-app
// 功能：多学科考试计时 / 阶段提醒 / 时间分配建议 / 历史记录
// ============================================================
window.examTimerPro = (function () {
    'use strict';

    var STORAGE_KEY = 'hspcb_exam_timer_pro';
    var HISTORY_KEY = 'hspcb_exam_timer_history';

    // 广东高考各科考试时长（分钟）
    var EXAM_CONFIG = {
        '语文':   { duration: 150, total: 150, parts: [
            { name: '现代文阅读', suggest: 35, score: 35 },
            { name: '古代诗文',   suggest: 30, score: 35 },
            { name: '语言文字运用', suggest: 20, score: 20 },
            { name: '作文',       suggest: 60, score: 60 }
        ]},
        '数学':   { duration: 120, total: 150, parts: [
            { name: '选择题',     suggest: 30, score: 60 },
            { name: '填空题',     suggest: 15, score: 20 },
            { name: '解答题',     suggest: 75, score: 70 }
        ]},
        '英语':   { duration: 120, total: 150, parts: [
            { name: '听力',       suggest: 22, score: 30 },
            { name: '阅读理解',   suggest: 30, score: 40 },
            { name: '语言运用',   suggest: 25, score: 25 },
            { name: '写作',       suggest: 35, score: 25 },
            { name: '检查',       suggest: 8,  score: 0 }
        ]},
        '物理':   { duration: 75,  total: 100, parts: [
            { name: '选择题',     suggest: 20, score: 46 },
            { name: '实验题',     suggest: 15, score: 12 },
            { name: '计算题',     suggest: 40, score: 42 }
        ]},
        '化学':   { duration: 75,  total: 100, parts: [
            { name: '选择题',     suggest: 22, score: 42 },
            { name: '非选择题',   suggest: 53, score: 58 }
        ]},
        '生物':   { duration: 75,  total: 100, parts: [
            { name: '选择题',     suggest: 22, score: 40 },
            { name: '非选择题',   suggest: 53, score: 60 }
        ]},
        '理综模拟': { duration: 150, total: 300, parts: [
            { name: '生物部分',   suggest: 40, score: 90 },
            { name: '化学部分',   suggest: 50, score: 100 },
            { name: '物理部分',   suggest: 60, score: 110 }
        ]}
    };

    // 阶段提醒节点（剩余分钟）
    var ALERT_POINTS = [
        { at: 0.5, msg: '⏰ 仅剩 30 秒，请立即填涂答题卡！', tone: 'danger' },
        { at: 5,   msg: '⚠️ 仅剩 5 分钟，请检查答题卡填写情况', tone: 'danger' },
        { at: 15,  msg: '🔔 剩余 15 分钟，建议开始检查或攻作文', tone: 'warn' },
        { at: 30,  msg: '📢 时间过半，注意控制节奏', tone: 'info' },
        { at: 60,  msg: '📢 剩余 1 小时，把握主战场', tone: 'info' },
        { at: 0.999, msg: '🚀 时间到，请停笔！', tone: 'end' }
    ];

    var state = {
        subject: '语文',
        running: false,
        paused: false,
        startTs: 0,
        elapsedBeforePause: 0,   // 暂停前已累计毫秒
        remaining: 0,            // 剩余毫秒
        firedAlerts: {},         // 已触发的提醒 key
        timerId: null
    };

    function safeParse(raw, fb) {
        try { var v = JSON.parse(raw); return v == null ? fb : v; }
        catch (e) { return fb; }
    }

    function loadHistory() {
        return safeParse(localStorage.getItem(HISTORY_KEY), []);
    }

    function saveHistory(arr) {
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(-50))); } catch (e) {}
    }

    function fmt(ms) {
        if (ms < 0) ms = 0;
        var total = Math.floor(ms / 1000);
        var h = Math.floor(total / 3600);
        var m = Math.floor((total % 3600) / 60);
        var s = total % 60;
        function pad(n) { return (n < 10 ? '0' : '') + n; }
        return pad(h) + ':' + pad(m) + ':' + pad(s);
    }

    function getConfig() {
        return EXAM_CONFIG[state.subject] || EXAM_CONFIG['语文'];
    }

    function totalMs() {
        return getConfig().duration * 60 * 1000;
    }

    function computeRemaining() {
        if (!state.running) return state.remaining;
        var now = Date.now();
        var used = state.elapsedBeforePause + (now - state.startTs);
        return Math.max(0, totalMs() - used);
    }

    // 渲染主界面
    function render() {
        var container = document.getElementById('exam-timer-pro-app');
        if (!container) return;
        var cfg = getConfig();
        var rem = computeRemaining();
        var total = totalMs();
        var usedPct = total > 0 ? ((total - rem) / total) * 100 : 0;
        if (usedPct > 100) usedPct = 100;

        // 状态色
        var barColor = '#10b981';
        if (rem < 5 * 60 * 1000) barColor = '#ef4444';
        else if (rem < 15 * 60 * 1000) barColor = '#f59e0b';

        var html = '';
        html += '<div style="max-width:900px;margin:0 auto;padding:16px;font-family:system-ui,\'Microsoft YaHei\',sans-serif;">';

        // 标题区
        html += '<div style="text-align:center;margin-bottom:18px;">';
        html += '<h2 style="margin:0 0 6px;font-size:22px;color:#1f2937;">⏱️ 考试计时器 Pro</h2>';
        html += '<p style="margin:0;font-size:13px;color:#6b7280;">广东高考时长标准 · 阶段提醒 · 时间分配建议</p>';
        html += '</div>';

        // 学科选择
        html += '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px;margin-bottom:14px;">';
        html += '<div style="font-size:13px;color:#6b7280;margin-bottom:8px;">选择考试科目</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
        for (var subj in EXAM_CONFIG) {
            if (!EXAM_CONFIG.hasOwnProperty(subj)) continue;
            var active = subj === state.subject;
            html += '<button onclick="window.examTimerPro.selectSubject(\'' + subj + '\')" ' +
                'style="padding:7px 14px;border-radius:6px;border:1px solid ' + (active ? '#3b82f6' : '#d1d5db') + ';' +
                'background:' + (active ? '#3b82f6' : '#fff') + ';color:' + (active ? '#fff' : '#374151') + ';' +
                'cursor:pointer;font-size:13px;font-weight:' + (active ? '600' : '400') + ';">' + subj + ' ' + EXAM_CONFIG[subj].duration + 'min</button>';
        }
        html += '</div></div>';

        // 主计时显示
        html += '<div style="background:linear-gradient(135deg,#1e3a8a,#3730a3);border-radius:14px;padding:28px 18px;color:#fff;text-align:center;margin-bottom:14px;">';
        html += '<div style="font-size:13px;opacity:0.85;margin-bottom:6px;">' + state.subject + ' · 满分 ' + cfg.total + ' 分</div>';
        html += '<div id="etp-clock" style="font-size:64px;font-weight:700;font-family:\'Consolas\',monospace;letter-spacing:2px;text-shadow:0 2px 10px rgba(0,0,0,0.3);">' + fmt(rem) + '</div>';
        html += '<div style="font-size:12px;opacity:0.85;margin-top:6px;">' + (state.running ? (state.paused ? '已暂停' : '计时中…') : '未开始') + '</div>';

        // 进度条
        html += '<div style="background:rgba(255,255,255,0.2);border-radius:6px;height:10px;margin:16px 0 6px;overflow:hidden;">';
        html += '<div id="etp-bar" style="background:' + barColor + ';height:100%;width:' + usedPct + '%;transition:width 0.5s linear;border-radius:6px;"></div>';
        html += '</div>';
        html += '<div style="font-size:11px;opacity:0.75;">已用 ' + usedPct.toFixed(1) + '% / 剩余 ' + ((rem / 60000)).toFixed(1) + ' 分钟</div>';
        html += '</div>';

        // 控制按钮
        html += '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:18px;flex-wrap:wrap;">';
        if (!state.running) {
            html += '<button onclick="window.examTimerPro.start()" style="padding:10px 22px;background:#10b981;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">▶ 开始计时</button>';
        } else if (state.paused) {
            html += '<button onclick="window.examTimerPro.resume()" style="padding:10px 22px;background:#10b981;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">▶ 继续</button>';
        } else {
            html += '<button onclick="window.examTimerPro.pause()" style="padding:10px 22px;background:#f59e0b;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">⏸ 暂停</button>';
        }
        html += '<button onclick="window.examTimerPro.stop(true)" style="padding:10px 22px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">⏹ 结束</button>';
        html += '<button onclick="window.examTimerPro.reset()" style="padding:10px 22px;background:#6b7280;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">↻ 重置</button>';
        html += '</div>';

        // 时间分配建议
        html += '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px;margin-bottom:14px;">';
        html += '<div style="font-size:14px;font-weight:600;color:#1f2937;margin-bottom:10px;">📋 ' + state.subject + ' 时间分配建议</div>';
        html += '<table style="width:100%;border-collapse:collapse;font-size:13px;">';
        html += '<thead><tr style="background:#f9fafb;">';
        html += '<th style="padding:8px;text-align:left;border-bottom:1px solid #e5e7eb;">题型</th>';
        html += '<th style="padding:8px;text-align:center;border-bottom:1px solid #e5e7eb;">建议用时</th>';
        html += '<th style="padding:8px;text-align:center;border-bottom:1px solid #e5e7eb;">分值</th>';
        html += '<th style="padding:8px;text-align:center;border-bottom:1px solid #e5e7eb;">性价比</th>';
        html += '</tr></thead><tbody>';
        for (var i = 0; i < cfg.parts.length; i++) {
            var p = cfg.parts[i];
            var ratio = p.suggest > 0 ? (p.score / p.suggest).toFixed(2) : '-';
            html += '<tr>';
            html += '<td style="padding:8px;border-bottom:1px solid #f3f4f6;">' + p.name + '</td>';
            html += '<td style="padding:8px;text-align:center;border-bottom:1px solid #f3f4f6;">' + p.suggest + ' min</td>';
            html += '<td style="padding:8px;text-align:center;border-bottom:1px solid #f3f4f6;">' + p.score + ' 分</td>';
            html += '<td style="padding:8px;text-align:center;border-bottom:1px solid #f3f4f6;color:' + (ratio !== '-' && parseFloat(ratio) >= 1 ? '#10b981' : '#6b7280') + ';">' + ratio + (ratio !== '-' ? ' 分/分' : '') + '</td>';
            html += '</tr>';
        }
        html += '</tbody></table>';
        html += '<div style="font-size:11px;color:#9ca3af;margin-top:8px;">💡 性价比 = 分值 / 用时（分钟），数值越高越值得优先攻克</div>';
        html += '</div>';

        // 历史记录
        var history = loadHistory();
        html += '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
        html += '<div style="font-size:14px;font-weight:600;color:#1f2937;">📊 历史计时记录</div>';
        if (history.length > 0) {
            html += '<button onclick="window.examTimerPro.clearHistory()" style="padding:4px 10px;background:#fef2f2;color:#ef4444;border:1px solid #fecaca;border-radius:5px;font-size:12px;cursor:pointer;">清空</button>';
        }
        html += '</div>';
        if (history.length === 0) {
            html += '<div style="text-align:center;padding:18px;color:#9ca3af;font-size:13px;">暂无记录，开始一次完整计时后将自动保存</div>';
        } else {
            html += '<div style="max-height:220px;overflow-y:auto;">';
            for (var j = history.length - 1; j >= 0 && j >= history.length - 10; j--) {
                var h = history[j];
                html += '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f3f4f6;font-size:12px;">';
                html += '<span style="color:#6b7280;">' + (h.subject || '未知') + '</span>';
                html += '<span style="color:#1f2937;">用时 ' + fmt(h.elapsed) + '</span>';
                html += '<span style="color:#6b7280;">' + (h.date || '') + '</span>';
                html += '</div>';
            }
            html += '</div>';
        }
        html += '</div>';

        html += '<div style="text-align:center;font-size:11px;color:#9ca3af;margin-top:12px;">提示：开始计时后请勿关闭页面，可暂停但避免刷新</div>';
        html += '</div>';

        container.innerHTML = html;
    }

    // 每秒刷新（仅更新时钟与进度条，避免全量重绘）
    function tick() {
        var rem = computeRemaining();
        var clockEl = document.getElementById('etp-clock');
        var barEl = document.getElementById('etp-bar');
        if (clockEl) clockEl.textContent = fmt(rem);
        if (barEl) {
            var total = totalMs();
            var usedPct = total > 0 ? ((total - rem) / total) * 100 : 0;
            if (usedPct > 100) usedPct = 100;
            barEl.style.width = usedPct + '%';
            if (rem < 5 * 60 * 1000) barEl.style.background = '#ef4444';
            else if (rem < 15 * 60 * 1000) barEl.style.background = '#f59e0b';
        }

        // 触发阶段提醒
        var remainMin = rem / 60000;
        for (var i = 0; i < ALERT_POINTS.length; i++) {
            var ap = ALERT_POINTS[i];
            var key = ap.at + '';
            if (!state.firedAlerts[key] && remainMin <= ap.at) {
                state.firedAlerts[key] = true;
                showAlert(ap.msg, ap.tone);
                if (ap.tone === 'end') {
                    stop(false);
                    return;
                }
            }
        }
    }

    function showAlert(msg, tone) {
        var colors = { danger: '#ef4444', warn: '#f59e0b', info: '#3b82f6', end: '#7c3aed' };
        var c = colors[tone] || '#3b82f6';
        var div = document.createElement('div');
        div.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:' + c + ';color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:10000;animation:etp-slide-in 0.3s ease;';
        div.textContent = msg;
        document.body.appendChild(div);
        try {
            if (typeof speechSynthesis !== 'undefined' && speechSynthesis.speak) {
                var u = new SpeechSynthesisUtterance(msg.replace(/[⏰⚠️🔔📢🚀]/g, ''));
                u.lang = 'zh-CN';
                u.rate = 1.1;
                speechSynthesis.speak(u);
            }
        } catch (e) {}
        setTimeout(function () {
            if (div.parentNode) div.parentNode.removeChild(div);
        }, 4500);
    }

    // —— 对外方法 ——
    function selectSubject(subj) {
        if (state.running) {
            if (!confirm('正在计时中，切换科目将重置当前计时，确认？')) return;
            stop(false);
        }
        state.subject = subj;
        state.remaining = totalMs();
        render();
    }

    function start() {
        if (state.running) return;
        state.running = true;
        state.paused = false;
        state.startTs = Date.now();
        state.elapsedBeforePause = 0;
        state.firedAlerts = {};
        state.remaining = totalMs();
        if (state.timerId) clearInterval(state.timerId);
        state.timerId = setInterval(tick, 1000);
        render();
    }

    function pause() {
        if (!state.running || state.paused) return;
        state.paused = true;
        state.elapsedBeforePause += Date.now() - state.startTs;
        if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
        render();
    }

    function resume() {
        if (!state.running || !state.paused) return;
        state.paused = false;
        state.startTs = Date.now();
        if (state.timerId) clearInterval(state.timerId);
        state.timerId = setInterval(tick, 1000);
        render();
    }

    function stop(saveRecord) {
        if (!state.running) return;
        var elapsed = state.elapsedBeforePause;
        if (!state.paused) elapsed += Date.now() - state.startTs;
        state.running = false;
        state.paused = false;
        state.remaining = 0;
        if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }

        if (saveRecord && elapsed > 10000) {
            var history = loadHistory();
            var d = new Date();
            history.push({
                subject: state.subject,
                elapsed: elapsed,
                date: d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes()
            });
            saveHistory(history);
        }
        render();
    }

    function reset() {
        if (state.running) {
            if (!confirm('确认重置计时？当前进度将丢失')) return;
        }
        state.running = false;
        state.paused = false;
        state.startTs = 0;
        state.elapsedBeforePause = 0;
        state.remaining = totalMs();
        state.firedAlerts = {};
        if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
        render();
    }

    function clearHistory() {
        if (!confirm('确认清空所有历史记录？')) return;
        try { localStorage.removeItem(HISTORY_KEY); } catch (e) {}
        render();
    }

    // 初始化样式
    function initStyle() {
        if (document.getElementById('etp-style')) return;
        var style = document.createElement('style');
        style.id = 'etp-style';
        style.textContent = '@keyframes etp-slide-in{from{opacity:0;transform:translateX(-50%) translateY(-12px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}';
        document.head.appendChild(style);
    }

    // 自动初始化
    function init() {
        initStyle();
        state.remaining = totalMs();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        render: render,
        selectSubject: selectSubject,
        start: start,
        pause: pause,
        resume: resume,
        stop: stop,
        reset: reset,
        clearHistory: clearHistory
    };
})();

// ============================================================
// 模块 2: knowledgeCardExporter — 知识点卡片导出
// 容器 ID: knowledge-card-exporter-app
// 功能：从知识图谱提取 / 生成可打印卡片 / Canvas 导出图片 / 双面打印
// ============================================================
window.knowledgeCardExporter = (function () {
    'use strict';

    var STORAGE_KEY = 'hspcb_custom_cards';
    var SELECT_KEY = 'hspcb_card_selection';

    // 预置学科速记卡片库
    var BUILTIN_CARDS = [
        // —— 物理 ——
        { subject: '物理', chapter: '力学', title: '牛顿第二定律', front: 'F = ma\n力是改变物体运动状态的原因\n加速度方向与合外力方向相同', back: '适用范围：宏观低速\n单位：N = kg·m/s²\n注意：F 为合外力，a 与 F 同向同刻' },
        { subject: '物理', chapter: '力学', title: '动能定理', front: 'W = ΔEk = Ek2 − Ek1\n合外力做功等于动能变化量', back: '标量式 · 适用于全程\nW 包含所有力做的功（含重力）\nEk = ½mv²' },
        { subject: '物理', chapter: '电学', title: '欧姆定律', front: 'I = U / R\n闭合电路欧姆定律：I = E/(R+r)', back: '适用纯电阻电路\n路端电压 U = E − Ir\n短路时 I = E/r' },
        { subject: '物理', chapter: '电磁', title: '法拉第电磁感应定律', front: 'E = n·ΔΦ/Δt\n感应电动势 = 匝数 × 磁通量变化率', back: '方向由楞次定律判定\n切割磁感线：E = BLv\n单位：V = Wb/s' },
        { subject: '物理', chapter: '光学', title: '光电效应方程', front: 'Ek = hν − W\n逸出功 W = hν₀', back: 'h = 6.63×10⁻³⁴ J·s\n极限频率 ν₀ = W/h\n红光限频低于紫光' },
        { subject: '物理', chapter: '近代物理', title: '质能方程', front: 'E = mc²\n质能联系方程', back: 'c = 3×10⁸ m/s\n质量亏损 Δm 释放能量 ΔE = Δmc²\n核反应中体现' },

        // —— 化学 ——
        { subject: '化学', chapter: '氧化还原', title: '氧化还原反应本质', front: '本质：电子转移\n特征：化合价升降\n氧化剂 → 得电子 → 还原产物\n还原剂 → 失电子 → 氧化产物', back: '口诀：升失氧 还原剂\n（化合价升高 / 失电子 / 被氧化）\n电子守恒、电荷守恒、原子守恒' },
        { subject: '化学', chapter: '化学平衡', title: '勒夏特列原理', front: '改变影响平衡的一个条件\n平衡就向减弱这种改变的方向移动', back: '浓度↑ → 正向移动\n温度↑ → 吸热方向\n压强↑ → 摩尔数减小方向\n催化剂不影响平衡移动' },
        { subject: '化学', chapter: '电解质', title: '弱电解质电离平衡', front: 'CH₃COOH ⇌ CH₃COO⁻ + H⁺\n电离度 α = 已电离/总浓度', back: '稀释促进电离\n温度升高促进电离\n加同离子抑制电离\nKa 只与温度有关' },
        { subject: '化学', chapter: '有机化学', title: '官能团特性', front: '—OH 醇/酚\n—CHO 醛（可氧化可还原）\n—COOH 羧酸（酸性）\n>C=O 酮/醛', back: '酯化：酸+醇→酯+水\n加成：C=C、C=O\n消去：醇脱 水\n氧化：醛→羧酸' },
        { subject: '化学', chapter: '元素周期律', title: '周期表位置与性质', front: '同周期左→右：金属性减弱\n同主族上→下：金属性增强\n原子半径同周期递减', back: '电负性：F > O > N > Cl\n第一电离能：同周期增大\n主族序数 = 最外层电子数' },

        // —— 生物 ——
        { subject: '生物', chapter: '细胞', title: '细胞呼吸', front: '有氧呼吸：C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 能量\n三阶段：糖酵解→丙酮酸氧化→三羧酸循环', back: '第一阶段：细胞质基质\n第二、三阶段：线粒体\n无氧呼吸：乳酸/酒精发酵\n产生 ATP：有氧 38 / 无氧 2' },
        { subject: '生物', chapter: '遗传', title: 'DNA 复制', front: '半保留复制\n边解旋边复制\n多起点双向复制', back: '解旋酶：断氢键\nDNA 聚合酶：5\'→3\' 方向\n引物：RNA 短链\n原料：4 种脱氧核苷酸' },
        { subject: '生物', chapter: '遗传', title: '基因表达 - 中心法则', front: 'DNA → RNA → 蛋白质\n复制 / 转录 / 翻译', back: '转录：DNA→mRNA（细胞核）\n翻译：mRNA→蛋白质（核糖体）\n密码子：3 个碱基决定 1 个氨基酸\n终止密码子不编码氨基酸' },
        { subject: '生物', chapter: '调节', title: '神经-体液调节', front: '神经调节：快、准、短\n体液调节：慢、广、久\n反射弧：感受器→传入→中枢→传出→效应器', back: '静息电位：K⁺ 外流（外正内负）\n动作电位：Na⁺ 内流（外负内正）\n突触传递：电→化学→电' },

        // —— 数学 ——
        { subject: '数学', chapter: '函数', title: '函数单调性判定', front: '导数法：f\'(x) > 0 增\nf\'(x) < 0 减\n定义法：x₁<x₂ → f(x₁)<f(x₂)', back: '极值点：f\'=0 且变号\n最值：极值点与端点比较\n注意：导数不存在的点也可能是极值' },
        { subject: '数学', chapter: '三角', title: '三角恒等变换', front: 'sin²θ + cos²θ = 1\ntanθ = sinθ/cosθ\nsin2θ = 2sinθcosθ\ncos2θ = cos²θ−sin²θ', back: '和差化积、积化和差\n辅助角公式：\nasinθ+bcosθ = √(a²+b²)sin(θ+φ)\ntanφ = b/a' },
        { subject: '数学', chapter: '数列', title: '等差等比数列', front: '等差：aₙ = a₁ + (n−1)d\n前 n 项和：Sₙ = na₁ + n(n−1)d/2', back: '等比：aₙ = a₁·q^(n−1)\nSₙ = a₁(1−qⁿ)/(1−q)\n等差中项：2b = a+c\n等比中项：b² = ac' },
        { subject: '数学', chapter: '立体几何', title: '空间向量', front: '向量点积：a·b = |a||b|cosθ\n叉积：|a×b| = |a||b|sinθ', back: '法向量求法：两向量叉积\n点到面距离：\nd = |n·PQ| / |n|\n线面角：sinθ = |a·n|/(|a||n|)' },

        // —— 语文 ——
        { subject: '语文', chapter: '文言文', title: '常见通假字', front: '说→悦（高兴）\n反→返（返回）\n知→智（智慧）\n内→纳（接纳）', back: '辟→避（躲避）\n奉→俸（俸禄）\n蚤→早（早晨）\n被→披（穿/披）' },
        { subject: '语文', chapter: '古诗', title: '诗歌鉴赏术语', front: '表现手法：借景抒情 / 托物言志\n用典 / 虚实相生 / 动静结合\n修辞：比喻 / 拟人 / 借代', back: '意境：雄浑 / 苍凉 / 悠远\n风格：豪放 / 婉约 / 沉郁\n炼字：诗眼 / 题眼' },
        { subject: '语文', chapter: '作文', title: '议论文结构', front: '引论（提出论点）\n本论（分论点 + 论据）\n结论（升华/呼应）', back: '并列式 / 递进式 / 对照式\n论据类型：事实 / 道理\n论证方法：举例 / 引用 / 对比 / 类比' },

        // —— 英语 ——
        { subject: '英语', chapter: '语法', title: '时态总览', front: '一般现在：do/does\n一般过去：did\n现在进行：am/is/are doing', back: '现在完成：have/has done\n过去完成：had done\n将来时：will do / be going to do\n现在完成进行：have been doing' },
        { subject: '英语', chapter: '写作', title: '议论文连接词', front: 'First / Firstly / To begin with\nMoreover / Furthermore / In addition', back: 'However / Nevertheless / On the contrary\nTherefore / Consequently / As a result\nIn conclusion / To sum up / All in all' },
        { subject: '英语', chapter: '阅读', title: '阅读推断题技巧', front: '题干关键词 → 原文定位\n推断基于原文，不主观\n注意 may / probably / seems', back: '排除绝对化选项（always/never）\n注意作者态度词\n代词指代向前找\n段落首句常为主题句' }
    ];

    var state = {
        subjectFilter: '全部',
        chapterFilter: '全部',
        selected: {},     // 卡片标题为 key
        showFront: true,
        customInput: ''
    };

    function safeParse(raw, fb) {
        try { var v = JSON.parse(raw); return v == null ? fb : v; }
        catch (e) { return fb; }
    }

    function loadCustom() {
        return safeParse(localStorage.getItem(STORAGE_KEY), []);
    }

    function saveCustom(arr) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (e) {}
    }

    function loadSelection() {
        var s = safeParse(localStorage.getItem(SELECT_KEY), {});
        state.selected = s || {};
    }

    function saveSelection() {
        try { localStorage.setItem(SELECT_KEY, JSON.stringify(state.selected)); } catch (e) {}
    }

    function getAllCards() {
        var custom = loadCustom();
        return BUILTIN_CARDS.concat(custom);
    }

    function getSubjects() {
        var seen = { '全部': true };
        var arr = ['全部'];
        var all = getAllCards();
        for (var i = 0; i < all.length; i++) {
            var s = all[i].subject;
            if (!seen[s]) { seen[s] = true; arr.push(s); }
        }
        return arr;
    }

    function getChapters(subject) {
        var seen = { '全部': true };
        var arr = ['全部'];
        var all = getAllCards();
        for (var i = 0; i < all.length; i++) {
            if (subject !== '全部' && all[i].subject !== subject) continue;
            var c = all[i].chapter;
            if (!seen[c]) { seen[c] = true; arr.push(c); }
        }
        return arr;
    }

    function getFiltered() {
        var all = getAllCards();
        var out = [];
        for (var i = 0; i < all.length; i++) {
            if (state.subjectFilter !== '全部' && all[i].subject !== state.subjectFilter) continue;
            if (state.chapterFilter !== '全部' && all[i].chapter !== state.chapterFilter) continue;
            out.push(all[i]);
        }
        return out;
    }

    function getSelected() {
        var filtered = getFiltered();
        var out = [];
        for (var i = 0; i < filtered.length; i++) {
            if (state.selected[filtered[i].title]) out.push(filtered[i]);
        }
        return out;
    }

    function render() {
        var container = document.getElementById('knowledge-card-exporter-app');
        if (!container) return;

        var subjects = getSubjects();
        var chapters = getChapters(state.subjectFilter);
        var filtered = getFiltered();
        var selected = getSelected();

        var html = '';
        html += '<div style="max-width:1000px;margin:0 auto;padding:16px;font-family:system-ui,\'Microsoft YaHei\',sans-serif;">';

        // 标题
        html += '<div style="text-align:center;margin-bottom:18px;">';
        html += '<h2 style="margin:0 0 6px;font-size:22px;color:#1f2937;">📇 知识点卡片导出</h2>';
        html += '<p style="margin:0;font-size:13px;color:#6b7280;">速记卡 · 双面打印 · 一键导出图片 · 自定义卡片</p>';
        html += '</div>';

        // 筛选区
        html += '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px;margin-bottom:14px;">';
        html += '<div style="display:flex;flex-wrap:wrap;gap:14px;">';
        // 学科
        html += '<div><div style="font-size:12px;color:#6b7280;margin-bottom:4px;">学科</div><select id="kce-subj" onchange="window.knowledgeCardExporter.changeFilter(\'subject\', this.value)" style="padding:6px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;background:#fff;">';
        for (var i = 0; i < subjects.length; i++) {
            html += '<option value="' + subjects[i] + '"' + (subjects[i] === state.subjectFilter ? ' selected' : '') + '>' + subjects[i] + '</option>';
        }
        html += '</select></div>';
        // 章节
        html += '<div><div style="font-size:12px;color:#6b7280;margin-bottom:4px;">章节</div><select id="kce-chap" onchange="window.knowledgeCardExporter.changeFilter(\'chapter\', this.value)" style="padding:6px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;background:#fff;">';
        for (var j = 0; j < chapters.length; j++) {
            html += '<option value="' + chapters[j] + '"' + (chapters[j] === state.chapterFilter ? ' selected' : '') + '>' + chapters[j] + '</option>';
        }
        html += '</select></div>';
        // 全选/反选
        html += '<div style="display:flex;align-items:flex-end;gap:6px;">';
        html += '<button onclick="window.knowledgeCardExporter.selectAll(true)" style="padding:6px 12px;background:#3b82f6;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;">全选</button>';
        html += '<button onclick="window.knowledgeCardExporter.selectAll(false)" style="padding:6px 12px;background:#f3f4f6;color:#374151;border:1px solid #d1d5db;border-radius:6px;font-size:12px;cursor:pointer;">清空</button>';
        html += '</div>';
        // 已选统计 + 导出按钮
        html += '<div style="margin-left:auto;display:flex;align-items:flex-end;gap:6px;">';
        html += '<span style="font-size:12px;color:#6b7280;padding-bottom:8px;">已选 ' + selected.length + ' 张</span>';
        html += '<button onclick="window.knowledgeCardExporter.exportImage()" style="padding:6px 12px;background:#10b981;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;">🖼 导出图片</button>';
        html += '<button onclick="window.knowledgeCardExporter.printCards()" style="padding:6px 12px;background:#7c3aed;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;">🖨 打印</button>';
        html += '</div>';
        html += '</div></div>';

        // 卡片网格
        if (filtered.length === 0) {
            html += '<div style="text-align:center;padding:40px;color:#9ca3af;font-size:14px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;">该筛选条件下暂无卡片</div>';
        } else {
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-bottom:18px;">';
            for (var k = 0; k < filtered.length; k++) {
                var card = filtered[k];
                var isSel = !!state.selected[card.title];
                var borderC = isSel ? '#3b82f6' : '#e5e7eb';
                var bgC = isSel ? '#eff6ff' : '#fff';
                html += '<div onclick="window.knowledgeCardExporter.toggle(\'' + card.title.replace(/'/g, '') + '\')" style="background:' + bgC + ';border:2px solid ' + borderC + ';border-radius:10px;padding:12px;cursor:pointer;transition:all 0.2s;">';
                html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">';
                html += '<span style="font-size:11px;color:#6b7280;background:#f3f4f6;padding:2px 6px;border-radius:4px;">' + card.subject + ' · ' + card.chapter + '</span>';
                html += '<span style="font-size:14px;color:' + (isSel ? '#3b82f6' : '#d1d5db') + ';">' + (isSel ? '✓' : '○') + '</span>';
                html += '</div>';
                html += '<div style="font-size:14px;font-weight:600;color:#1f2937;margin-bottom:6px;">' + card.title + '</div>';
                html += '<div style="font-size:11px;color:#6b7280;white-space:pre-line;line-height:1.5;max-height:80px;overflow:hidden;">' + (card.front || '').substring(0, 80) + '</div>';
                html += '</div>';
            }
            html += '</div>';
        }

        // 自定义卡片添加
        html += '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px;margin-bottom:14px;">';
        html += '<div style="font-size:14px;font-weight:600;color:#1f2937;margin-bottom:10px;">➕ 添加自定义卡片</div>';
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;margin-bottom:8px;">';
        html += '<input id="kce-c-subj" placeholder="学科（如 物理）" style="padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;">';
        html += '<input id="kce-c-chap" placeholder="章节（如 力学）" style="padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;">';
        html += '<input id="kce-c-title" placeholder="卡片标题" style="padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;">';
        html += '</div>';
        html += '<textarea id="kce-c-front" placeholder="正面内容（速记要点，支持换行）" style="width:100%;padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;min-height:60px;margin-bottom:8px;font-family:inherit;"></textarea>';
        html += '<textarea id="kce-c-back" placeholder="背面内容（详解/口诀/注意点）" style="width:100%;padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;min-height:60px;margin-bottom:8px;font-family:inherit;"></textarea>';
        html += '<button onclick="window.knowledgeCardExporter.addCustom()" style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;">添加卡片</button>';
        html += '</div>';

        // 自定义卡片列表
        var custom = loadCustom();
        if (custom.length > 0) {
            html += '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px;">';
            html += '<div style="font-size:14px;font-weight:600;color:#1f2937;margin-bottom:10px;">🗂 我的自定义卡片（' + custom.length + '）</div>';
            for (var m = 0; m < custom.length; m++) {
                html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f3f4f6;">';
                html += '<div><span style="font-size:12px;color:#6b7280;">' + custom[m].subject + ' · ' + custom[m].chapter + '</span> <span style="font-size:13px;color:#1f2937;margin-left:6px;">' + custom[m].title + '</span></div>';
                html += '<button onclick="window.knowledgeCardExporter.removeCustom(' + m + ')" style="padding:3px 8px;background:#fef2f2;color:#ef4444;border:1px solid #fecaca;border-radius:4px;font-size:11px;cursor:pointer;">删除</button>';
                html += '</div>';
            }
            html += '</div>';
        }

        html += '<div style="text-align:center;font-size:11px;color:#9ca3af;margin-top:12px;">点击卡片选/取消 · 导出图片为 Canvas 长图 · 打印支持双面手动翻转</div>';
        html += '</div>';

        container.innerHTML = html;
    }

    function changeFilter(type, value) {
        if (type === 'subject') {
            state.subjectFilter = value;
            state.chapterFilter = '全部';
        } else {
            state.chapterFilter = value;
        }
        render();
    }

    function toggle(title) {
        if (state.selected[title]) delete state.selected[title];
        else state.selected[title] = true;
        saveSelection();
        render();
    }

    function selectAll(flag) {
        var filtered = getFiltered();
        if (!flag) {
            state.selected = {};
        } else {
            for (var i = 0; i < filtered.length; i++) {
                state.selected[filtered[i].title] = true;
            }
        }
        saveSelection();
        render();
    }

    function addCustom() {
        var subj = document.getElementById('kce-c-subj').value.trim();
        var chap = document.getElementById('kce-c-chap').value.trim();
        var title = document.getElementById('kce-c-title').value.trim();
        var front = document.getElementById('kce-c-front').value.trim();
        var back = document.getElementById('kce-c-back').value.trim();
        if (!subj || !title || !front) {
            alert('请至少填写学科、标题、正面内容');
            return;
        }
        var custom = loadCustom();
        // 检查重名
        for (var i = 0; i < custom.length; i++) {
            if (custom[i].title === title) {
                alert('已存在同名自定义卡片：' + title);
                return;
            }
        }
        custom.push({ subject: subj, chapter: chap || '其他', title: title, front: front, back: back });
        saveCustom(custom);
        // 清空输入
        document.getElementById('kce-c-subj').value = '';
        document.getElementById('kce-c-chap').value = '';
        document.getElementById('kce-c-title').value = '';
        document.getElementById('kce-c-front').value = '';
        document.getElementById('kce-c-back').value = '';
        render();
    }

    function removeCustom(idx) {
        var custom = loadCustom();
        if (idx < 0 || idx >= custom.length) return;
        var removed = custom.splice(idx, 1)[0];
        saveCustom(custom);
        if (removed && state.selected[removed.title]) delete state.selected[removed.title];
        saveSelection();
        render();
    }

    // 导出为 Canvas 长图
    function exportImage() {
        var selected = getSelected();
        if (selected.length === 0) {
            alert('请先选择要导出的卡片');
            return;
        }
        var W = 1080;
        var cardH = 360;
        var margin = 30;
        var gap = 20;
        var H = margin * 2 + selected.length * cardH + (selected.length - 1) * gap + 80;

        var canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        var ctx = canvas.getContext('2d');

        // 背景
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(0, 0, W, H);

        // 标题
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 32px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📇 知识点速记卡片', W / 2, 55);
        ctx.font = '14px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('共 ' + selected.length + ' 张 · ' + new Date().toLocaleDateString('zh-CN'), W / 2, 80);

        var y = 100;
        for (var i = 0; i < selected.length; i++) {
            var c = selected[i];
            // 卡片背景
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            roundRect(ctx, margin, y, W - margin * 2, cardH, 12);
            ctx.fill();
            ctx.stroke();

            // 学科标签
            ctx.fillStyle = '#dbeafe';
            roundRect(ctx, margin + 16, y + 16, 120, 28, 6);
            ctx.fill();
            ctx.fillStyle = '#1e40af';
            ctx.font = 'bold 13px "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(c.subject + ' · ' + c.chapter, margin + 26, y + 35);

            // 标题
            ctx.fillStyle = '#111827';
            ctx.font = 'bold 22px "Microsoft YaHei", sans-serif';
            ctx.fillText(c.title, margin + 16, y + 72);

            // 分隔线
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(margin + 16, y + 88);
            ctx.lineTo(W - margin - 16, y + 88);
            ctx.stroke();

            // 正面内容
            ctx.fillStyle = '#1f2937';
            ctx.font = '15px "Microsoft YaHei", sans-serif';
            var frontLines = (c.front || '').split('\n');
            var fy = y + 114;
            for (var f = 0; f < frontLines.length && f < 7; f++) {
                ctx.fillText(frontLines[f], margin + 16, fy);
                fy += 22;
            }

            // 背面提示
            ctx.fillStyle = '#6b7280';
            ctx.font = 'italic 13px "Microsoft YaHei", sans-serif';
            var backShort = (c.back || '').replace(/\n/g, ' ').substring(0, 50);
            ctx.fillText('背面：' + backShort + '…', margin + 16, y + cardH - 18);

            y += cardH + gap;
        }

        // 页脚
        ctx.fillStyle = '#9ca3af';
        ctx.font = '11px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HSPCB 知识点卡片导出器 · ' + new Date().toLocaleString('zh-CN'), W / 2, H - 12);

        // 下载
        try {
            var link = document.createElement('a');
            link.download = '知识卡片_' + selected.length + '张_' + Date.now() + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            alert('导出失败：' + e.message);
        }
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    // 打印（双面）
    function printCards() {
        var selected = getSelected();
        if (selected.length === 0) {
            alert('请先选择要打印的卡片');
            return;
        }
        var html = '';
        html += '<!DOCTYPE html><html><head><meta charset="utf-8"><title>知识点卡片打印</title>';
        html += '<style>';
        html += '@page { size: A4; margin: 12mm; }';
        html += 'body { font-family: "Microsoft YaHei", sans-serif; margin: 0; padding: 0; color: #1f2937; }';
        html += '.page { page-break-after: always; padding: 0; }';
        html += '.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; }';
        html += '.card { border: 1.5px solid #3b82f6; border-radius: 6px; padding: 8mm; min-height: 70mm; box-sizing: border-box; }';
        html += '.tag { font-size: 10pt; color: #1e40af; background: #dbeafe; padding: 2px 6px; border-radius: 3px; display: inline-block; margin-bottom: 4mm; }';
        html += '.title { font-size: 14pt; font-weight: bold; margin: 0 0 3mm; }';
        html += '.content { font-size: 11pt; line-height: 1.6; white-space: pre-line; }';
        html += '.back-label { font-size: 9pt; color: #6b7280; font-style: italic; margin-top: 4mm; padding-top: 3mm; border-top: 1px dashed #d1d5db; }';
        html += 'h2 { text-align: center; font-size: 16pt; margin: 0 0 6mm; }';
        html += '.info { text-align: center; font-size: 10pt; color: #6b7280; margin-bottom: 6mm; }';
        html += '</style></head><body>';

        // 第一部分：正面
        html += '<div class="page"><h2>知识点速记卡片 · 正面</h2><div class="info">共 ' + selected.length + ' 张 · 打印后将纸张翻转再打印背面</div><div class="grid">';
        for (var i = 0; i < selected.length; i++) {
            var c = selected[i];
            html += '<div class="card">';
            html += '<div class="tag">' + c.subject + ' · ' + c.chapter + '</div>';
            html += '<div class="title">' + c.title + '</div>';
            html += '<div class="content">' + (c.front || '') + '</div>';
            html += '</div>';
        }
        html += '</div></div>';

        // 第二部分：背面（顺序反转，确保双面对齐：第1张正面在左上，背面应在右下）
        // 简化处理：每页 2 列，背面按"镜像"排列
        html += '<div class="page"><h2>知识点速记卡片 · 背面</h2><div class="info">请将打印纸按长边翻转后送入打印机</div><div class="grid">';
        // 按 2 列分组反转
        var pairCount = Math.ceil(selected.length / 2);
        for (var p = 0; p < pairCount; p++) {
            // 一个"对"对应一行的两张卡，正反顺序：正(左,右) → 反(右,左)
            var leftIdx = p * 2;
            var rightIdx = p * 2 + 1;
            // 先放右边的背面
            if (rightIdx < selected.length) {
                var rc = selected[rightIdx];
                html += '<div class="card"><div class="back-label">[' + rc.title + ']</div><div class="content">' + (rc.back || rc.front || '') + '</div></div>';
            } else {
                html += '<div class="card" style="border:none;"></div>';
            }
            // 再放左边的背面
            if (leftIdx < selected.length) {
                var lc = selected[leftIdx];
                html += '<div class="card"><div class="back-label">[' + lc.title + ']</div><div class="content">' + (lc.back || lc.front || '') + '</div></div>';
            }
        }
        html += '</div></div>';

        html += '</body></html>';

        var win = window.open('', '_blank');
        if (!win) {
            alert('请允许弹出窗口以打印卡片');
            return;
        }
        win.document.write(html);
        win.document.close();
        setTimeout(function () {
            win.focus();
            win.print();
        }, 400);
    }

    // 初始化
    function init() {
        loadSelection();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        render: render,
        changeFilter: changeFilter,
        toggle: toggle,
        selectAll: selectAll,
        addCustom: addCustom,
        removeCustom: removeCustom,
        exportImage: exportImage,
        printCards: printCards
    };
})();

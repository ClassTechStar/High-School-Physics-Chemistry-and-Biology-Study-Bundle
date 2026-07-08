// 学习激励与体验 - 成就系统+分享图+暗黑模式+分数计算器
// ============================================================
// js/gamification-system.js — 学习激励与体验模块集合
// 包含：成就徽章系统 / 学习打卡分享图 / 暗黑模式切换 / 分数计算器
// ES5 兼容，零依赖，innerHTML + 内联 style + Canvas 渲染
// ============================================================

// ============================================================
// 模块 1: achievementSystem — 成就徽章系统
// 容器 ID: achievement-system-app
// ============================================================
window.achievementSystem = (function () {
    'use strict';

    // 成就定义（20 个）。每个含分类、图标、名称、描述、目标值、积分
    var ACHIEVEMENTS = [
        // —— 刷题类（5 个） ——
        { id: 'q10',    cat: '刷题', icon: '🌱', name: '初出茅庐', desc: '做满 10 题',     goal: 10,   score: 10,  check: function (s) { return s.totalQuestions; } },
        { id: 'q100',   cat: '刷题', icon: '📚', name: '勤学苦练', desc: '做满 100 题',    goal: 100,  score: 30,  check: function (s) { return s.totalQuestions; } },
        { id: 'q500',   cat: '刷题', icon: '🔥', name: '刷题达人', desc: '做满 500 题',    goal: 500,  score: 80,  check: function (s) { return s.totalQuestions; } },
        { id: 'q1000',  cat: '刷题', icon: '⚔️', name: '千题斩',   desc: '做满 1000 题',   goal: 1000, score: 150, check: function (s) { return s.totalQuestions; } },
        { id: 'q2000',  cat: '刷题', icon: '🌊', name: '题海无涯', desc: '做满 2000 题',   goal: 2000, score: 300, check: function (s) { return s.totalQuestions; } },
        // —— 打卡类（5 个） ——
        { id: 'c3',     cat: '打卡', icon: '📅', name: '坚持三天', desc: '连续打卡 3 天',  goal: 3,    score: 20,  check: function (s) { return s.streakDays; } },
        { id: 'c7',     cat: '打卡', icon: '⭐', name: '坚持之星', desc: '连续打卡 7 天',  goal: 7,    score: 50,  check: function (s) { return s.streakDays; } },
        { id: 'c15',    cat: '打卡', icon: '🌟', name: '半月不懈', desc: '连续打卡 15 天', goal: 15,   score: 100, check: function (s) { return s.streakDays; } },
        { id: 'c30',    cat: '打卡', icon: '🌙', name: '月度坚持', desc: '连续打卡 30 天', goal: 30,   score: 200, check: function (s) { return s.streakDays; } },
        { id: 'c100',   cat: '打卡', icon: '🏆', name: '百日誓师', desc: '连续打卡 100 天', goal: 100, score: 500, check: function (s) { return s.streakDays; } },
        // —— 正确率类（5 个） ——
        { id: 'a60',    cat: '正确率', icon: '🎯', name: '小试牛刀', desc: '单科正确率 > 60%',  goal: 60,  score: 30,  check: function (s) { return s.maxSubjectAcc; } },
        { id: 'a70',    cat: '正确率', icon: '📈', name: '稳中有进', desc: '单科正确率 > 70%',  goal: 70,  score: 60,  check: function (s) { return s.maxSubjectAcc; } },
        { id: 'a80',    cat: '正确率', icon: '🎓', name: '学霸降临', desc: '单科正确率 > 80%',  goal: 80,  score: 100, check: function (s) { return s.maxSubjectAcc; } },
        { id: 'aperf',  cat: '正确率', icon: '💯', name: '满分达人', desc: '单次练习全对',      goal: 1,   score: 80,  check: function (s) { return s.perfectPractice ? 1 : 0; } },
        { id: 'aall',   cat: '正确率', icon: '🏅', name: '全科精通', desc: '六科正确率均 > 75%', goal: 6,   score: 250, check: function (s) { return s.subjectsOver75; } },
        // —— 探索类（5 个） ——
        { id: 'tools',  cat: '探索', icon: '🔍', name: '博览群书',   desc: '使用过 20 个不同工具',    goal: 20, score: 100, check: function (s) { return s.toolsUsed; } },
        { id: 'allsub', cat: '探索', icon: '🛡️', name: '全能战士',   desc: '六科都做过题',            goal: 6,  score: 80,  check: function (s) { return s.subjectsTouched; } },
        { id: 'wrong',  cat: '探索', icon: '❌', name: '错题终结者', desc: '重做错题正确率 > 80%',    goal: 80, score: 120, check: function (s) { return s.redoAcc; } },
        { id: 'note',   cat: '探索', icon: '✍️', name: '笔耕不辍',   desc: '创建 10 条笔记',          goal: 10, score: 60,  check: function (s) { return s.notesCount; } },
        { id: 'mock',   cat: '探索', icon: '🧪', name: '模考勇士',   desc: '完成 3 次模拟考试',       goal: 3,  score: 90,  check: function (s) { return s.mockCount; } }
    ];

    var STORAGE_KEY = 'hspcb_achievements';
    var CAT_COLORS = {
        '刷题':   '#3b82f6',
        '打卡':   '#10b981',
        '正确率': '#f59e0b',
        '探索':   '#ec4899'
    };

    function safeParse(raw, fallback) {
        try {
            var v = JSON.parse(raw);
            return v == null ? fallback : v;
        } catch (e) {
            return fallback;
        }
    }

    function todayStr() {
        var d = new Date();
        var m = '' + (d.getMonth() + 1);
        var day = '' + d.getDate();
        if (m.length < 2) m = '0' + m;
        if (day.length < 2) day = '0' + day;
        return d.getFullYear() + '-' + m + '-' + day;
    }

    function fmt(d) {
        var m = '' + (d.getMonth() + 1);
        var day = '' + d.getDate();
        if (m.length < 2) m = '0' + m;
        if (day.length < 2) day = '0' + day;
        return d.getFullYear() + '-' + m + '-' + day;
    }

    function normalizeDate(s) {
        if (!s) return '';
        return ('' + s).substring(0, 10);
    }

    // 汇总各数据源，得到统计指标
    function gatherStats() {
        var stats = {
            totalQuestions: 0,
            streakDays: 0,
            maxSubjectAcc: 0,
            perfectPractice: false,
            subjectsOver75: 0,
            toolsUsed: 0,
            subjectsTouched: 0,
            redoAcc: 0,
            notesCount: 0,
            mockCount: 0
        };

        var quiz = safeParse(localStorage.getItem('hspcb_quiz_records'), []);
        if (!Array.isArray(quiz)) quiz = [];
        var subjStats = {};
        var subjSet = {};
        for (var i = 0; i < quiz.length; i++) {
            var r = quiz[i] || {};
            var total = r.total || r.totalQuestions || r.count || 0;
            var correct = r.correct || r.score || 0;
            stats.totalQuestions += total;
            var subj = r.subject || r.type || '';
            if (subj) {
                if (!subjStats[subj]) subjStats[subj] = { c: 0, t: 0 };
                subjStats[subj].c += correct;
                subjStats[subj].t += total;
                subjSet[subj] = true;
            }
            if (total > 0 && correct === total) stats.perfectPractice = true;
        }

        var exam = safeParse(localStorage.getItem('hspcb_exam_history'), []);
        if (!Array.isArray(exam)) exam = [];
        stats.mockCount = exam.length;
        for (var j = 0; j < exam.length; j++) {
            var e = exam[j] || {};
            stats.totalQuestions += (e.totalQuestions || e.total || 0);
        }

        var checkin = safeParse(localStorage.getItem('hspcb_daily_checkin'), []);
        if (!Array.isArray(checkin)) checkin = [];
        var days = [];
        for (var k = 0; k < checkin.length; k++) {
            var item = checkin[k];
            var d = typeof item === 'string' ? item : (item && item.date);
            if (d) days.push(d);
        }
        stats.streakDays = computeStreak(days);

        var wrong = safeParse(localStorage.getItem('hspcb_wrong_records'), null);
        if (!wrong) wrong = safeParse(localStorage.getItem('hspcb_error_notebook'), []);
        if (!Array.isArray(wrong)) wrong = [];
        var redoCorrect = 0, redoTotal = 0;
        for (var m = 0; m < wrong.length; m++) {
            var w = wrong[m] || {};
            if (w.redoTotal || w.redoCount) {
                redoTotal += (w.redoTotal || w.redoCount || 0);
                redoCorrect += (w.redoCorrect || 0);
            }
        }
        if (redoTotal > 0) stats.redoAcc = Math.round(redoCorrect / redoTotal * 100);

        var notes = safeParse(localStorage.getItem('hspcb_notes'), null);
        if (!notes) notes = safeParse(localStorage.getItem('hspcb_notebook'), []);
        if (Array.isArray(notes)) stats.notesCount = notes.length;

        var tools = safeParse(localStorage.getItem('hspcb_tools_used'), []);
        if (Array.isArray(tools)) {
            stats.toolsUsed = tools.length;
        } else if (typeof tools === 'object') {
            var cnt = 0;
            for (var key in tools) { if (tools.hasOwnProperty(key)) cnt++; }
            stats.toolsUsed = cnt;
        }

        for (var s in subjStats) {
            if (subjStats.hasOwnProperty(s) && subjStats[s].t > 0) {
                var acc = subjStats[s].c / subjStats[s].t * 100;
                if (acc > stats.maxSubjectAcc) stats.maxSubjectAcc = acc;
                if (acc > 75) stats.subjectsOver75++;
            }
        }
        stats.maxSubjectAcc = Math.round(stats.maxSubjectAcc);

        var touched = 0;
        for (var ts in subjSet) { if (subjSet.hasOwnProperty(ts)) touched++; }
        stats.subjectsTouched = touched;

        return stats;
    }

    function computeStreak(days) {
        if (!days || days.length === 0) return 0;
        var set = {};
        for (var i = 0; i < days.length; i++) set[normalizeDate(days[i])] = true;
        var streak = 0;
        var cur = new Date();
        if (!set[fmt(cur)]) cur.setDate(cur.getDate() - 1);
        while (set[fmt(cur)]) {
            streak++;
            cur.setDate(cur.getDate() - 1);
        }
        return streak;
    }

    function loadUnlocked() {
        var raw = localStorage.getItem(STORAGE_KEY);
        var obj = safeParse(raw, {});
        return (obj && typeof obj === 'object') ? obj : {};
    }
    function saveUnlocked(obj) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch (e) {}
    }

    function detect() {
        var stats = gatherStats();
        var unlocked = loadUnlocked();
        var newlyUnlocked = [];
        for (var i = 0; i < ACHIEVEMENTS.length; i++) {
            var a = ACHIEVEMENTS[i];
            var val = a.check(stats);
            var reached = (a.id === 'aperf') ? (val >= 1) : (val >= a.goal);
            if (reached && !unlocked[a.id]) {
                unlocked[a.id] = todayStr();
                newlyUnlocked.push(a);
            }
        }
        if (newlyUnlocked.length > 0) saveUnlocked(unlocked);
        return { unlocked: unlocked, newlyUnlocked: newlyUnlocked, stats: stats };
    }

    function totalScore(unlocked) {
        var sum = 0;
        for (var i = 0; i < ACHIEVEMENTS.length; i++) {
            if (unlocked[ACHIEVEMENTS[i].id]) sum += ACHIEVEMENTS[i].score;
        }
        return sum;
    }

    function showCelebration(achievements) {
        if (!achievements || achievements.length === 0) return;
        var overlay = document.createElement('div');
        overlay.id = 'achievement-celebrate';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';
        var html = '<div style="background:linear-gradient(135deg,#fbbf24,#f59e0b);border-radius:16px;padding:28px 36px;text-align:center;max-width:360px;box-shadow:0 10px 40px rgba(0,0,0,0.3);animation:achPop 0.5s ease;">';
        html += '<div style="font-size:14px;color:#fff;letter-spacing:2px;margin-bottom:10px;">🎉 成就解锁</div>';
        for (var i = 0; i < achievements.length; i++) {
            var a = achievements[i];
            html += '<div style="margin:10px 0;"><div style="font-size:48px;">' + a.icon + '</div>' +
                '<div style="font-size:18px;font-weight:bold;color:#fff;">' + a.name + '</div>' +
                '<div style="font-size:12px;color:#fef3c7;">' + a.desc + ' (+' + a.score + '分)</div></div>';
        }
        html += '<button id="ach-celebrate-close" style="margin-top:12px;background:#fff;color:#d97706;border:none;border-radius:20px;padding:6px 20px;font-size:13px;cursor:pointer;font-weight:bold;">太棒了</button>';
        html += '</div>';
        overlay.innerHTML = html;
        document.body.appendChild(overlay);
        var style = document.createElement('style');
        style.innerHTML = '@keyframes achPop{0%{transform:scale(0.5);opacity:0;}100%{transform:scale(1);opacity:1;}}';
        document.head.appendChild(style);
        var closeBtn = document.getElementById('ach-celebrate-close');
        if (closeBtn) {
            closeBtn.onclick = function () {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            };
        }
        setTimeout(function () {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 5000);
    }

    function renderBadge(a, unlocked, stats) {
        var isUnlocked = !!unlocked[a.id];
        var val = a.check(stats);
        var pct = a.goal > 0 ? Math.min(100, Math.round(val / a.goal * 100)) : 0;
        var catColor = CAT_COLORS[a.cat] || '#6b7280';
        var dateStr = isUnlocked ? unlocked[a.id] : '';
        var cardStyle, iconStyle, nameStyle, descStyle, barBg;
        if (isUnlocked) {
            cardStyle = 'background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #fbbf24;box-shadow:0 0 12px rgba(251,191,36,0.4);';
            iconStyle = 'font-size:42px;filter:drop-shadow(0 0 6px #fbbf24);';
            nameStyle = 'color:#92400e;font-weight:bold;font-size:15px;';
            descStyle = 'color:#a16207;font-size:12px;';
            barBg = '#fde68a';
        } else {
            cardStyle = 'background:#f9fafb;border:2px solid #e5e7eb;opacity:0.85;';
            iconStyle = 'font-size:42px;filter:grayscale(1) opacity(0.5);';
            nameStyle = 'color:#6b7280;font-weight:bold;font-size:15px;';
            descStyle = 'color:#9ca3af;font-size:12px;';
            barBg = '#e5e7eb';
        }
        var html = '<div data-cat="' + a.cat + '" style="' + cardStyle + 'border-radius:12px;padding:14px;position:relative;">';
        html += '<div style="position:absolute;top:8px;right:10px;font-size:10px;background:' + catColor + ';color:#fff;padding:2px 8px;border-radius:10px;">' + a.cat + '</div>';
        if (!isUnlocked) {
            html += '<div style="position:absolute;top:8px;left:10px;font-size:14px;">🔒</div>';
        }
        html += '<div style="text-align:center;margin:6px 0 4px;"><span style="' + iconStyle + '">' + a.icon + '</span></div>';
        html += '<div style="text-align:center;' + nameStyle + '">' + a.name + '</div>';
        html += '<div style="text-align:center;' + descStyle + 'margin:2px 0 8px;">' + a.desc + '</div>';
        html += '<div style="background:' + barBg + ';border-radius:8px;height:8px;overflow:hidden;margin-bottom:4px;">' +
            '<div style="width:' + pct + '%;height:100%;background:' + (isUnlocked ? '#f59e0b' : catColor) + ';transition:width .3s;"></div></div>';
        html += '<div style="display:flex;justify-content:space-between;font-size:11px;color:#6b7280;">';
        html += '<span>' + Math.min(val, a.goal) + '/' + a.goal + '</span>';
        html += '<span>' + (isUnlocked ? ('✅ ' + dateStr) : (pct + '%')) + '</span>';
        html += '</div>';
        if (isUnlocked) {
            html += '<div style="text-align:center;margin-top:6px;font-size:11px;color:#d97706;font-weight:bold;">+' + a.score + ' 积分</div>';
        }
        html += '</div>';
        return html;
    }

    function render() {
        var container = document.getElementById('achievement-system-app');
        if (!container) return;

        var result = detect();
        var unlocked = result.unlocked;
        var stats = result.stats;
        var unlockedCount = 0;
        for (var k in unlocked) { if (unlocked.hasOwnProperty(k)) unlockedCount++; }
        var score = totalScore(unlocked);

        var html = '<div class="tool-app-container" style="padding:16px;font-family:sans-serif;">';

        html += '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;">' +
            '<div style="flex:1;min-width:140px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border-radius:12px;padding:16px;text-align:center;">' +
            '<div style="font-size:12px;opacity:0.85;">已解锁成就</div>' +
            '<div style="font-size:28px;font-weight:bold;margin:6px 0;">' + unlockedCount + '<span style="font-size:14px;opacity:0.8;">/20</span></div>' +
            '<div style="font-size:11px;opacity:0.75;">徽章总数</div></div>' +
            '<div style="flex:1;min-width:140px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;border-radius:12px;padding:16px;text-align:center;">' +
            '<div style="font-size:12px;opacity:0.85;">成就总积分</div>' +
            '<div style="font-size:28px;font-weight:bold;margin:6px 0;">' + score + '</div>' +
            '<div style="font-size:11px;opacity:0.75;">分</div></div>' +
            '<div style="flex:1;min-width:140px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border-radius:12px;padding:16px;text-align:center;">' +
            '<div style="font-size:12px;opacity:0.85;">累计做题</div>' +
            '<div style="font-size:28px;font-weight:bold;margin:6px 0;">' + stats.totalQuestions + '</div>' +
            '<div style="font-size:11px;opacity:0.75;">题</div></div>' +
            '<div style="flex:1;min-width:140px;background:linear-gradient(135deg,#ec4899,#db2777);color:#fff;border-radius:12px;padding:16px;text-align:center;">' +
            '<div style="font-size:12px;opacity:0.85;">连续打卡</div>' +
            '<div style="font-size:28px;font-weight:bold;margin:6px 0;">' + stats.streakDays + '</div>' +
            '<div style="font-size:11px;opacity:0.75;">天</div></div>' +
            '</div>';

        var cats = ['全部', '刷题', '打卡', '正确率', '探索'];
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;" id="ach-filter-bar">';
        for (var ci = 0; ci < cats.length; ci++) {
            var c = cats[ci];
            var col = c === '全部' ? '#6b7280' : (CAT_COLORS[c] || '#6b7280');
            html += '<button class="ach-filter-btn" data-cat="' + c + '" style="background:#fff;border:2px solid ' + col + ';color:' + col + ';padding:4px 14px;border-radius:16px;font-size:12px;cursor:pointer;">' + c + '</button>';
        }
        html += '</div>';

        html += '<div id="ach-wall" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">';
        for (var i = 0; i < ACHIEVEMENTS.length; i++) {
            html += renderBadge(ACHIEVEMENTS[i], unlocked, stats);
        }
        html += '</div>';

        html += '</div>';
        container.innerHTML = html;

        var btns = container.querySelectorAll('.ach-filter-btn');
        for (var bi = 0; bi < btns.length; bi++) {
            (function (btn) {
                btn.onclick = function () {
                    var cat = btn.getAttribute('data-cat');
                    var wall = document.getElementById('ach-wall');
                    if (!wall) return;
                    var cards = wall.children;
                    for (var x = 0; x < cards.length; x++) {
                        var cc = cards[x].getAttribute('data-cat');
                        cards[x].style.display = (cat === '全部' || cc === cat) ? '' : 'none';
                    }
                };
            })(btns[bi]);
        }

        if (result.newlyUnlocked.length > 0) {
            setTimeout(function () { showCelebration(result.newlyUnlocked); }, 300);
        }
    }

    return {
        render: render,
        detect: detect,
        getAchievements: function () { return ACHIEVEMENTS.slice(); }
    };
})();


// ============================================================
// 模块 2: studyShareCard — 学习打卡分享图
// 容器 ID: study-share-card-app
// ============================================================
window.studyShareCard = (function () {
    'use strict';

    var QUOTES = [
        '星光不问赶路人，时光不负有心人。',
        '所有的努力都不会白费。',
        '你只管努力，剩下的交给时间。',
        '今天流下的汗水，是明天的铠甲。',
        '拼搏到无能为力，努力到感动自己。',
        '未来的你，一定会感谢现在拼命的自己。',
        '不是有了希望才坚持，而是坚持了才有希望。',
        '把简单的事做到极致，就是绝招。',
        '熬过最苦的日子，做最酷的自己。',
        '每一个不努力的日子，都是对生命的辜负。',
        '与其仰望星空，不如做那个发光的人。',
        '没有伞的孩子必须努力奔跑。',
        '吃得了苦，扛得住压，世界才是你的。',
        '高考不是终点，而是新生活的起点。',
        '自律者出众，不自律者出局。',
        '越努力，越幸运；越自律，越自由。',
        '今天的懒惰，是明天的遗憾。',
        '想要不可替代，就必须与众不同。',
        '不苦不累，高三无味；不拼不搏，高三白活。',
        '行动是治愈恐惧的良药，犹豫是滋生恐惧的温床。',
        '哪怕是最没有希望的事情，只要坚持去做，到最后就会拥有希望。',
        '不要在该奋斗的年纪，选择安逸。',
        '成绩是学出来的，不是等出来的。',
        '所有的闪耀，都需要经历沉淀。',
        '苦心人天不负，卧薪尝胆，三千越甲可吞吴。',
        '宁可辛苦一阵子，不要辛苦一辈子。',
        '没有一种不通过蔑视、忍受和奋斗就可以征服的命运。',
        '当你想要放弃的时候，想想当初为什么开始。',
        '愿你在合上笔盖的那一刻，有着战士收刀入鞘的骄傲。',
        '人生没有彩排，每天都是现场直播。'
    ];

    var THEMES = {
        blue:   { name: '蓝紫', bg1: '#6366f1', bg2: '#a855f7', accent: '#fbbf24', text: '#ffffff' },
        green:  { name: '青绿', bg1: '#059669', bg2: '#10b981', accent: '#fde047', text: '#ffffff' },
        purple: { name: '紫粉', bg1: '#7c3aed', bg2: '#ec4899', accent: '#fcd34d', text: '#ffffff' }
    };

    var CANVAS_W = 750, CANVAS_H = 1000;
    var currentTheme = 'blue';
    var currentQuote = '';

    function safeParse(raw, fallback) {
        try { var v = JSON.parse(raw); return v == null ? fallback : v; } catch (e) { return fallback; }
    }

    function todayStr() {
        var d = new Date();
        var m = '' + (d.getMonth() + 1);
        var day = '' + d.getDate();
        if (m.length < 2) m = '0' + m;
        if (day.length < 2) day = '0' + day;
        return d.getFullYear() + '-' + m + '-' + day;
    }

    function daysToGaokao() {
        var now = new Date();
        var year = now.getFullYear();
        var gk = new Date(year, 5, 7);
        if (now > gk) gk = new Date(year + 1, 5, 7);
        var diff = Math.ceil((gk - now) / (24 * 3600 * 1000));
        return diff;
    }

    function gatherTodayData() {
        var data = { count: 0, correct: 0, total: 0, accuracy: 0, minutes: 0, checkinDays: 0, subjectDist: {} };
        var today = todayStr();
        var quiz = safeParse(localStorage.getItem('hspcb_quiz_records'), []);
        if (!Array.isArray(quiz)) quiz = [];
        for (var i = 0; i < quiz.length; i++) {
            var r = quiz[i] || {};
            var d = r.date || r.timestamp || '';
            d = ('' + d).substring(0, 10);
            if (d === today) {
                var t = r.total || r.totalQuestions || r.count || 0;
                var c = r.correct || r.score || 0;
                data.count += t;
                data.correct += c;
                data.total += t;
                var subj = r.subject || r.type || '其他';
                if (!data.subjectDist[subj]) data.subjectDist[subj] = 0;
                data.subjectDist[subj] += t;
            }
        }
        if (data.total > 0) data.accuracy = Math.round(data.correct / data.total * 100);
        data.minutes = Math.floor(data.count * 1.5);

        var checkin = safeParse(localStorage.getItem('hspcb_daily_checkin'), []);
        if (Array.isArray(checkin)) {
            data.checkinDays = checkin.length;
        }
        return data;
    }

    function pickQuote() {
        currentQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        return currentQuote;
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

    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        var chars = ('' + text).split('');
        var line = '';
        var lineY = y;
        for (var i = 0; i < chars.length; i++) {
            var test = line + chars[i];
            if (ctx.measureText(test).width > maxWidth && line.length > 0) {
                ctx.fillText(line, x, lineY);
                line = chars[i];
                lineY += lineHeight;
            } else {
                line = test;
            }
        }
        if (line) ctx.fillText(line, x, lineY);
    }

    function drawPoster(canvas, data) {
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var theme = THEMES[currentTheme] || THEMES.blue;
        canvas.width = CANVAS_W;
        canvas.height = CANVAS_H;

        var grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
        grad.addColorStop(0, theme.bg1);
        grad.addColorStop(1, theme.bg2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = '#ffffff';
        for (var i = 0; i < 30; i++) {
            var x = (i * 73) % CANVAS_W;
            var y = (i * 137) % CANVAS_H;
            var r = 4 + (i % 5) * 3;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(CANVAS_W - 60, 120, 120, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(60, CANVAS_H - 100, 90, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        var padX = 50;
        var y = 60;

        ctx.fillStyle = theme.text;
        ctx.textAlign = 'center';
        ctx.font = 'bold 30px sans-serif';
        ctx.fillText('高考倒计时 ' + daysToGaokao() + ' 天', CANVAS_W / 2, y);
        y += 36;
        ctx.font = '16px sans-serif';
        ctx.globalAlpha = 0.85;
        ctx.fillText(todayStr(), CANVAS_W / 2, y);
        ctx.globalAlpha = 1;
        y += 30;

        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(padX + 80, y); ctx.lineTo(CANVAS_W - padX - 80, y); ctx.stroke();
        y += 30;

        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        roundRect(ctx, padX, y, CANVAS_W - padX * 2, 150, 16);
        ctx.fill();
        y += 24;

        ctx.fillStyle = theme.text;
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('今日学习', padX + 20, y);
        y += 16;

        var cellW = (CANVAS_W - padX * 2 - 40) / 4;
        var cellY = y + 10;
        var stats = [
            { label: '做题数', value: data.count + '题' },
            { label: '正确率', value: data.accuracy + '%' },
            { label: '学习时长', value: data.minutes + '分' },
            { label: '打卡天数', value: data.checkinDays + '天' }
        ];
        for (var s = 0; s < stats.length; s++) {
            var cx = padX + 20 + cellW * s + cellW / 2;
            ctx.textAlign = 'center';
            ctx.font = '13px sans-serif';
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = theme.text;
            ctx.fillText(stats[s].label, cx, cellY + 18);
            ctx.globalAlpha = 1;
            ctx.font = 'bold 26px sans-serif';
            ctx.fillStyle = theme.accent;
            ctx.fillText(stats[s].value, cx, cellY + 50);
        }
        y = cellY + 70;

        y += 20;
        var ringCX = padX + 100;
        var ringCY = y + 80;
        var ringR = 70;
        ctx.save();
        ctx.lineWidth = 18;
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath(); ctx.arc(ringCX, ringCY, ringR, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = theme.accent;
        ctx.beginPath();
        ctx.arc(ringCX, ringCY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (data.accuracy / 100));
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = theme.text;
        ctx.textAlign = 'center';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(data.accuracy + '%', ringCX, ringCY + 10);
        ctx.font = '13px sans-serif';
        ctx.globalAlpha = 0.85;
        ctx.fillText('今日正确率', ringCX, ringCY + 32);
        ctx.globalAlpha = 1;

        var barX = ringCX + ringR + 60;
        ctx.fillStyle = theme.text;
        ctx.textAlign = 'left';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('各科做题分布', barX, y + 20);
        var subjKeys = [];
        for (var sk in data.subjectDist) { if (data.subjectDist.hasOwnProperty(sk)) subjKeys.push(sk); }
        var maxVal = 1;
        for (var mi = 0; mi < subjKeys.length; mi++) {
            if (data.subjectDist[subjKeys[mi]] > maxVal) maxVal = data.subjectDist[subjKeys[mi]];
        }
        var barStartY = y + 40;
        var barH = 22;
        var gap = 8;
        var barMaxW = CANVAS_W - padX - barX - 20;
        if (subjKeys.length === 0) {
            ctx.font = '13px sans-serif';
            ctx.globalAlpha = 0.7;
            ctx.fillText('今日暂无数据', barX, barStartY + 16);
            ctx.globalAlpha = 1;
        } else {
            for (var bi = 0; bi < subjKeys.length; bi++) {
                var sy = barStartY + bi * (barH + gap);
                ctx.fillStyle = theme.text;
                ctx.font = '12px sans-serif';
                ctx.fillText(subjKeys[bi], barX, sy + 14);
                var w = (data.subjectDist[subjKeys[bi]] / maxVal) * (barMaxW - 60);
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                roundRect(ctx, barX + 40, sy, barMaxW - 60, barH, 6); ctx.fill();
                ctx.fillStyle = theme.accent;
                roundRect(ctx, barX + 40, sy, Math.max(4, w), barH, 6); ctx.fill();
                ctx.fillStyle = theme.text;
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText(data.subjectDist[subjKeys[bi]], barX + 40 + Math.max(4, w) + 6, sy + 14);
            }
        }
        y = ringCY + ringR + 40;

        y += 20;
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(padX + 60, y); ctx.lineTo(CANVAS_W - padX - 60, y); ctx.stroke();
        y += 30;
        ctx.fillStyle = theme.text;
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px sans-serif';
        wrapText(ctx, currentQuote, CANVAS_W / 2, y, CANVAS_W - padX * 2 - 40, 30);

        ctx.globalAlpha = 0.7;
        ctx.font = '14px sans-serif';
        ctx.fillText('— HSPCB 智能备考 —', CANVAS_W / 2, CANVAS_H - 40);
        ctx.globalAlpha = 1;
    }

    function render() {
        var container = document.getElementById('study-share-card-app');
        if (!container) return;

        pickQuote();
        var data = gatherTodayData();

        var html = '<div class="tool-app-container" style="padding:16px;font-family:sans-serif;">';
        html += '<div style="text-align:center;margin-bottom:12px;">';
        html += '<h3 style="margin:0 0 8px;color:#333;font-size:18px;">📸 学习打卡分享图</h3>';
        html += '<div style="font-size:13px;color:#666;">一键生成精美海报，分享你的学习成果</div>';
        html += '</div>';

        html += '<div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:14px;">';
        html += '<span style="font-size:13px;color:#666;">背景主题：</span>';
        var keys = ['blue', 'green', 'purple'];
        for (var i = 0; i < keys.length; i++) {
            var t = THEMES[keys[i]];
            html += '<button class="share-theme-btn" data-theme="' + keys[i] + '" style="background:linear-gradient(135deg,' + t.bg1 + ',' + t.bg2 + ');border:2px solid #fff;color:#fff;padding:6px 16px;border-radius:18px;font-size:12px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.15);">' + t.name + '</button>';
        }
        html += '</div>';

        html += '<div style="text-align:center;background:#f3f4f6;border-radius:12px;padding:12px;margin-bottom:14px;overflow:auto;">';
        html += '<canvas id="share-card-canvas" width="' + CANVAS_W + '" height="' + CANVAS_H + '" style="max-width:100%;height:auto;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.2);"></canvas>';
        html += '</div>';

        html += '<div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">';
        html += '<button id="share-download-btn" style="background:#3b82f6;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer;">⬇️ 下载海报</button>';
        html += '<button id="share-quote-btn" style="background:#f59e0b;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer;">🔄 换一张语录</button>';
        html += '<button id="share-redraw-btn" style="background:#10b981;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer;">🎨 重绘海报</button>';
        html += '</div>';

        html += '</div>';
        container.innerHTML = html;

        var canvas = document.getElementById('share-card-canvas');
        drawPoster(canvas, data);

        var themeBtns = container.querySelectorAll('.share-theme-btn');
        for (var ti = 0; ti < themeBtns.length; ti++) {
            (function (btn) {
                btn.onclick = function () {
                    currentTheme = btn.getAttribute('data-theme');
                    drawPoster(canvas, data);
                };
            })(themeBtns[ti]);
        }

        var dlBtn = document.getElementById('share-download-btn');
        if (dlBtn) {
            dlBtn.onclick = function () {
                try {
                    var dataURL = canvas.toDataURL('image/png');
                    var a = document.createElement('a');
                    a.href = dataURL;
                    a.download = 'HSPCB_打卡_' + todayStr() + '.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                } catch (e) {
                    alert('下载失败：' + e.message);
                }
            };
        }

        var qBtn = document.getElementById('share-quote-btn');
        if (qBtn) {
            qBtn.onclick = function () {
                pickQuote();
                drawPoster(canvas, data);
            };
        }

        var rBtn = document.getElementById('share-redraw-btn');
        if (rBtn) {
            rBtn.onclick = function () {
                data = gatherTodayData();
                drawPoster(canvas, data);
            };
        }
    }

    return {
        render: render,
        drawPoster: drawPoster,
        getQuotes: function () { return QUOTES.slice(); }
    };
})();


// ============================================================
// 模块 3: darkModeToggle — 暗黑模式切换
// 无独立容器 ID，注入切换按钮到页面右上角
// ============================================================
window.darkModeToggle = (function () {
    'use strict';

    var STORAGE_KEY = 'hspcb_dark_mode';
    var isOn = false;

    function loadPref() {
        try {
            var v = localStorage.getItem(STORAGE_KEY);
            return v === '1' || v === 'true';
        } catch (e) { return false; }
    }
    function savePref(on) {
        try { localStorage.setItem(STORAGE_KEY, on ? '1' : '0'); } catch (e) {}
    }

    function injectStyle() {
        if (document.getElementById('hspcb-dark-mode-style')) return;
        var style = document.createElement('style');
        style.id = 'hspcb-dark-mode-style';
        style.innerHTML = '' +
            'body.dark-mode { background-color:#0f172a !important; color:#e2e8f0 !important; }\n' +
            'body.dark-mode .tool-app-container,\n' +
            'body.dark-mode .app-container,\n' +
            'body.dark-mode .panel,\n' +
            'body.dark-mode .card { background-color:#1e293b !important; color:#e2e8f0 !important; border-color:#334155 !important; }\n' +
            'body.dark-mode input,\n' +
            'body.dark-mode textarea,\n' +
            'body.dark-mode select { background-color:#0f172a !important; color:#e2e8f0 !important; border-color:#334155 !important; }\n' +
            'body.dark-mode button { background-color:#334155 !important; color:#e2e8f0 !important; border-color:#475569 !important; }\n' +
            'body.dark-mode a { color:#60a5fa !important; }\n' +
            'body.dark-mode table { border-color:#334155 !important; }\n' +
            'body.dark-mode th,\n' +
            'body.dark-mode td { border-color:#334155 !important; color:#e2e8f0 !important; }\n' +
            'body.dark-mode h1,\n' +
            'body.dark-mode h2,\n' +
            'body.dark-mode h3,\n' +
            'body.dark-mode h4 { color:#f1f5f9 !important; }\n' +
            'body.dark-mode .nav,\n' +
            'body.dark-mode header,\n' +
            'body.dark-mode nav { background-color:#1e293b !important; border-color:#334155 !important; }\n';
        document.head.appendChild(style);
    }

    function applyState(on) {
        isOn = on;
        if (on) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        var btn = document.getElementById('hspcb-dark-toggle-btn');
        if (btn) {
            btn.innerHTML = on ? '☀️' : '🌙';
            btn.title = on ? '切换到亮色模式' : '切换到暗黑模式';
        }
        savePref(on);
    }

    function toggle() {
        applyState(!isOn);
    }

    function render() {
        injectStyle();
        if (document.getElementById('hspcb-dark-toggle-btn')) {
            applyState(loadPref());
            return;
        }
        var btn = document.createElement('button');
        btn.id = 'hspcb-dark-toggle-btn';
        btn.style.cssText = 'position:fixed;top:12px;right:16px;z-index:99998;width:40px;height:40px;border-radius:50%;border:2px solid #e5e7eb;background:#fff;font-size:18px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;padding:0;line-height:1;';
        btn.innerHTML = '🌙';
        btn.title = '切换暗黑模式';
        btn.onclick = toggle;
        document.body.appendChild(btn);
        applyState(loadPref());
    }

    return {
        render: render,
        toggle: toggle,
        isOn: function () { return isOn; }
    };
})();


// ============================================================
// 模块 4: scoreCalculator — 分数计算器 / 志愿参考
// 容器 ID: score-calculator-app
// ============================================================
window.scoreCalculator = (function () {
    'use strict';

    var SUBJECTS = [
        { key: 'chinese',  name: '语文', short: '语', full: 150, color: '#ef4444' },
        { key: 'math',     name: '数学', short: '数', full: 150, color: '#3b82f6' },
        { key: 'english',  name: '英语', short: '英', full: 150, color: '#10b981' },
        { key: 'physics',  name: '物理', short: '物', full: 100, color: '#f59e0b' },
        { key: 'chemistry',name: '化学', short: '化', full: 100, color: '#8b5cf6' },
        { key: 'biology',  name: '生物', short: '生', full: 100, color: '#ec4899' }
    ];

    var SCORE_LINES = [
        { year: 2022, phy_b: 445, phy_s: 538, his_b: 437, his_s: 532 },
        { year: 2023, phy_b: 439, phy_s: 539, his_b: 433, his_s: 540 },
        { year: 2024, phy_b: 442, phy_s: 544, his_b: 428, his_s: 540 },
        { year: 2025, phy_b: 445, phy_s: 545, his_b: 430, his_s: 542 },
        { year: 2026, phy_b: 448, phy_s: 548, his_b: 432, his_s: 544 }
    ];

    function recommendCollege(total) {
        if (total >= 650) return { tier: '985 重点大学', color: '#7c3aed', schools: '中山大学、华南理工大学、暨南大学、哈尔滨工业大学(深圳)、北京师范大学(珠海)' };
        if (total >= 600) return { tier: '211 大学',     color: '#3b82f6', schools: '华南师范大学、深圳大学、广东外语外贸大学、汕头大学、南方医科大学' };
        if (total >= 550) return { tier: '一本大学',     color: '#10b981', schools: '广东工业大学、广州大学、广州中医药大学、广东财经大学、广州医科大学' };
        if (total >= 500) return { tier: '二本大学',     color: '#f59e0b', schools: '广东海洋大学、五邑大学、肇庆学院、惠州学院、岭南师范学院' };
        if (total >= 450) return { tier: '本科线附近',   color: '#6366f1', schools: '广东技术师范大学、韩山师范学院、嘉应学院、韶关学院、广东石油化工学院' };
        return { tier: '专科院校', color: '#6b7280', schools: '深圳职业技术大学、广东轻工职业技术学院、广州番禺职业技术学院、顺德职业技术学院' };
    }

    var sliderSubject = 'math';
    var sliderBoost = 10;
    var currentScores = { chinese: 0, math: 0, english: 0, physics: 0, chemistry: 0, biology: 0 };

    function clampScore(key, val) {
        var full = 150;
        for (var i = 0; i < SUBJECTS.length; i++) {
            if (SUBJECTS[i].key === key) full = SUBJECTS[i].full;
        }
        val = parseInt(val, 10) || 0;
        if (val < 0) val = 0;
        if (val > full) val = full;
        return val;
    }

    function sumScores(scores) {
        var sum = 0;
        for (var k in scores) { if (scores.hasOwnProperty(k)) sum += scores[k] || 0; }
        return sum;
    }

    function render() {
        var container = document.getElementById('score-calculator-app');
        if (!container) return;

        var html = '<div class="tool-app-container" style="padding:16px;font-family:sans-serif;">';

        html += '<div style="text-align:center;margin-bottom:16px;">';
        html += '<h3 style="margin:0 0 6px;color:#333;font-size:18px;">🎯 高考分数计算器 / 志愿参考</h3>';
        html += '<div style="font-size:13px;color:#666;">广东新高考 · 总分 750 分（语数英各 150 + 物化生各 100）</div>';
        html += '</div>';

        html += '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin-bottom:14px;">';
        html += '<div style="font-size:14px;font-weight:bold;color:#333;margin-bottom:10px;">📝 输入各科预估分</div>';
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;">';
        for (var i = 0; i < SUBJECTS.length; i++) {
            var s = SUBJECTS[i];
            html += '<div style="display:flex;align-items:center;gap:8px;background:#f9fafb;border-radius:8px;padding:8px;">';
            html += '<span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background:' + s.color + ';color:#fff;font-size:13px;font-weight:bold;">' + s.short + '</span>';
            html += '<label style="font-size:13px;color:#555;flex:1;">' + s.name + ' <span style="color:#999;font-size:11px;">/ ' + s.full + '</span></label>';
            html += '<input type="number" class="score-input" data-key="' + s.key + '" min="0" max="' + s.full + '" value="' + (currentScores[s.key] || 0) + '" style="width:64px;padding:4px 6px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;text-align:center;">';
            html += '</div>';
        }
        html += '</div>';
        html += '</div>';

        html += '<div id="score-result" style="margin-bottom:14px;"></div>';

        html += '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin-bottom:14px;">';
        html += '<div style="font-size:14px;font-weight:bold;color:#333;margin-bottom:10px;">📊 各科得分率雷达图</div>';
        html += '<div id="score-radar" style="text-align:center;"></div>';
        html += '</div>';

        html += '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin-bottom:14px;">';
        html += '<div style="font-size:14px;font-weight:bold;color:#333;margin-bottom:10px;">🔮 "如果提高" 模拟器</div>';
        html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;">';
        html += '<span style="font-size:13px;color:#555;">如果</span>';
        html += '<select id="sim-subject" style="padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;">';
        for (var si = 0; si < SUBJECTS.length; si++) {
            var sel = SUBJECTS[si].key === sliderSubject ? ' selected' : '';
            html += '<option value="' + SUBJECTS[si].key + '"' + sel + '>' + SUBJECTS[si].name + '</option>';
        }
        html += '</select>';
        html += '<span style="font-size:13px;color:#555;">提高</span>';
        html += '<input type="range" id="sim-boost" min="0" max="50" value="' + sliderBoost + '" style="flex:1;min-width:140px;">';
        html += '<span id="sim-boost-val" style="font-size:13px;font-weight:bold;color:#f59e0b;width:50px;">+' + sliderBoost + '分</span>';
        html += '</div>';
        html += '<div id="sim-result" style="background:#fef3c7;border-radius:8px;padding:10px;font-size:13px;color:#92400e;"></div>';
        html += '</div>';

        html += '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin-bottom:14px;">';
        html += '<div style="font-size:14px;font-weight:bold;color:#333;margin-bottom:10px;">📋 广东历年高考分数线参考（2022-2026）</div>';
        html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12px;">';
        html += '<thead><tr style="background:#f3f4f6;">';
        html += '<th style="border:1px solid #e5e7eb;padding:8px;">年份</th>';
        html += '<th style="border:1px solid #e5e7eb;padding:8px;" colspan="2">物理类</th>';
        html += '<th style="border:1px solid #e5e7eb;padding:8px;" colspan="2">历史类</th>';
        html += '</tr><tr style="background:#f9fafb;">';
        html += '<th style="border:1px solid #e5e7eb;padding:6px;"></th>';
        html += '<th style="border:1px solid #e5e7eb;padding:6px;">本科线</th>';
        html += '<th style="border:1px solid #e5e7eb;padding:6px;">特招线</th>';
        html += '<th style="border:1px solid #e5e7eb;padding:6px;">本科线</th>';
        html += '<th style="border:1px solid #e5e7eb;padding:6px;">特招线</th>';
        html += '</tr></thead><tbody>';
        for (var li = 0; li < SCORE_LINES.length; li++) {
            var row = SCORE_LINES[li];
            html += '<tr style="text-align:center;">';
            html += '<td style="border:1px solid #e5e7eb;padding:6px;font-weight:bold;">' + row.year + '</td>';
            html += '<td style="border:1px solid #e5e7eb;padding:6px;">' + row.phy_b + '</td>';
            html += '<td style="border:1px solid #e5e7eb;padding:6px;color:#7c3aed;font-weight:bold;">' + row.phy_s + '</td>';
            html += '<td style="border:1px solid #e5e7eb;padding:6px;">' + row.his_b + '</td>';
            html += '<td style="border:1px solid #e5e7eb;padding:6px;color:#7c3aed;font-weight:bold;">' + row.his_s + '</td>';
            html += '</tr>';
        }
        html += '</tbody></table></div>';
        html += '<div style="font-size:11px;color:#999;margin-top:6px;">注：数据为广东高考录取控制分数线，仅供参考。特招线相当于原一本线参考。</div>';
        html += '</div>';

        html += '</div>';
        container.innerHTML = html;

        bindEvents();
        updateAll();
    }

    function bindEvents() {
        var inputs = document.querySelectorAll('.score-input');
        for (var i = 0; i < inputs.length; i++) {
            (function (inp) {
                var handler = function () {
                    var key = inp.getAttribute('data-key');
                    currentScores[key] = clampScore(key, inp.value);
                    inp.value = currentScores[key];
                    updateAll();
                };
                inp.oninput = handler;
                inp.onchange = handler;
            })(inputs[i]);
        }
        var simSub = document.getElementById('sim-subject');
        if (simSub) {
            simSub.onchange = function () {
                sliderSubject = simSub.value;
                updateSimulator();
            };
        }
        var simBoost = document.getElementById('sim-boost');
        if (simBoost) {
            simBoost.oninput = function () {
                sliderBoost = parseInt(simBoost.value, 10) || 0;
                var v = document.getElementById('sim-boost-val');
                if (v) v.innerHTML = '+' + sliderBoost + '分';
                updateSimulator();
            };
        }
    }

    function updateAll() {
        updateResult();
        updateRadar();
        updateSimulator();
    }

    function updateResult() {
        var box = document.getElementById('score-result');
        if (!box) return;
        var total = sumScores(currentScores);
        var rec = recommendCollege(total);
        var html = '<div style="background:linear-gradient(135deg,' + rec.color + ',#1e293b);color:#fff;border-radius:12px;padding:16px;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">';
        html += '<div>';
        html += '<div style="font-size:12px;opacity:0.85;">预估总分</div>';
        html += '<div style="font-size:36px;font-weight:bold;">' + total + '<span style="font-size:14px;opacity:0.7;"> / 750</span></div>';
        html += '</div>';
        html += '<div style="text-align:right;">';
        html += '<div style="font-size:12px;opacity:0.85;">院校推荐</div>';
        html += '<div style="font-size:18px;font-weight:bold;background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:14px;">' + rec.tier + '</div>';
        html += '</div>';
        html += '</div>';
        html += '<div style="margin-top:10px;font-size:12px;opacity:0.9;">参考院校：' + rec.schools + '</div>';
        html += '</div>';

        html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-top:12px;">';
        for (var i = 0; i < SUBJECTS.length; i++) {
            var s = SUBJECTS[i];
            var val = currentScores[s.key] || 0;
            var rate = s.full > 0 ? Math.round(val / s.full * 100) : 0;
            html += '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px;text-align:center;">';
            html += '<div style="font-size:11px;color:#666;">' + s.name + '</div>';
            html += '<div style="font-size:16px;font-weight:bold;color:' + s.color + ';">' + val + '/' + s.full + '</div>';
            html += '<div style="font-size:11px;color:#999;">得分率 ' + rate + '%</div>';
            html += '</div>';
        }
        html += '</div>';
        box.innerHTML = html;
    }

    function updateRadar() {
        var box = document.getElementById('score-radar');
        if (!box) return;
        var size = 280, cx = size / 2, cy = size / 2, R = 100;
        var n = SUBJECTS.length;
        var html = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">';
        for (var g = 1; g <= 5; g++) {
            var rr = R * g / 5;
            var pts = [];
            for (var i = 0; i < n; i++) {
                var ang = -Math.PI / 2 + i * 2 * Math.PI / n;
                pts.push((cx + rr * Math.cos(ang)).toFixed(1) + ',' + (cy + rr * Math.sin(ang)).toFixed(1));
            }
            html += '<polygon points="' + pts.join(' ') + '" fill="none" stroke="#e5e7eb" stroke-width="1"/>';
        }
        for (var ax = 0; ax < n; ax++) {
            var ang2 = -Math.PI / 2 + ax * 2 * Math.PI / n;
            html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + R * Math.cos(ang2)).toFixed(1) + '" y2="' + (cy + R * Math.sin(ang2)).toFixed(1) + '" stroke="#d1d5db" stroke-width="1"/>';
        }
        var dataPts = [];
        for (var d = 0; d < n; d++) {
            var s = SUBJECTS[d];
            var rate = s.full > 0 ? (currentScores[s.key] || 0) / s.full : 0;
            var ang3 = -Math.PI / 2 + d * 2 * Math.PI / n;
            dataPts.push((cx + R * rate * Math.cos(ang3)).toFixed(1) + ',' + (cy + R * rate * Math.sin(ang3)).toFixed(1));
        }
        html += '<polygon points="' + dataPts.join(' ') + '" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" stroke-width="2"/>';
        for (var p = 0; p < n; p++) {
            var ang4 = -Math.PI / 2 + p * 2 * Math.PI / n;
            var s2 = SUBJECTS[p];
            var rate2 = s2.full > 0 ? (currentScores[s2.key] || 0) / s2.full : 0;
            var px = cx + R * rate2 * Math.cos(ang4);
            var py = cy + R * rate2 * Math.sin(ang4);
            html += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="3" fill="' + s2.color + '"/>';
            var lx = cx + (R + 18) * Math.cos(ang4);
            var ly = cy + (R + 18) * Math.sin(ang4);
            html += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#555">' + s2.short + '</text>';
        }
        html += '</svg>';
        html += '<div style="font-size:11px;color:#999;margin-top:6px;">外圈为各科满分，蓝色区域为当前得分率</div>';
        box.innerHTML = html;
    }

    function updateSimulator() {
        var box = document.getElementById('sim-result');
        if (!box) return;
        var subjName = '';
        var subjFull = 150;
        for (var i = 0; i < SUBJECTS.length; i++) {
            if (SUBJECTS[i].key === sliderSubject) {
                subjName = SUBJECTS[i].name;
                subjFull = SUBJECTS[i].full;
            }
        }
        var baseTotal = sumScores(currentScores);
        var curVal = currentScores[sliderSubject] || 0;
        var newVal = Math.min(subjFull, curVal + sliderBoost);
        var actualBoost = newVal - curVal;
        var newTotal = baseTotal + actualBoost;
        var recOld = recommendCollege(baseTotal);
        var recNew = recommendCollege(newTotal);

        var html = '如果 <b>' + subjName + '</b> 由 <b>' + curVal + '</b> 分提高到 <b>' + newVal + '</b> 分（+' + actualBoost + '分），<br>';
        html += '总分将由 <b>' + baseTotal + '</b> → <b style="color:#d97706;">' + newTotal + '</b> 分。<br>';
        if (recOld.tier === recNew.tier) {
            html += '院校推荐区间不变：<b>' + recNew.tier + '</b>。';
        } else {
            html += '院校推荐区间：<b>' + recOld.tier + '</b> → <b style="color:#10b981;">' + recNew.tier + '</b> 🎉';
        }
        box.innerHTML = html;
    }

    return {
        render: render,
        recommendCollege: recommendCollege,
        getScoreLines: function () { return SCORE_LINES.slice(); }
    };
})();

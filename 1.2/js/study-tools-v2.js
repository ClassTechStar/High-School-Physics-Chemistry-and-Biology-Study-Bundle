// ============================================================
// js/study-tools-v2.js — Study Enhancement Tools (5 Modules)
// ES5 Compatible | IIFE Pattern | Canvas Charts | Inline Styles
// ============================================================

/* ========== SHARED UTILITIES ========== */

var _ST = {
    card: 'background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,0.08);margin-bottom:16px;',
    btn: 'display:inline-block;padding:10px 22px;border:none;border-radius:8px;cursor:pointer;font-size:14px;color:#fff;transition:opacity .2s;',
    btnPrimary: 'background:#4a90e2;',
    btnSuccess: 'background:#52c41a;',
    btnDanger: 'background:#ff4d4f;',
    btnWarning: 'background:#faad14;',
    btnGray: 'background:#bfbfbf;',
    btnSm: 'padding:6px 14px;font-size:12px;border-radius:6px;',
    input: 'padding:8px 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;width:100%;box-sizing:border-box;',
    select: 'padding:8px 12px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;background:#fff;',
    label: 'display:block;margin-bottom:6px;font-weight:bold;color:#555;font-size:14px;',
    table: 'width:100%;border-collapse:collapse;margin-top:12px;',
    th: 'padding:10px 12px;background:#4a90e2;color:#fff;text-align:left;font-size:13px;',
    td: 'padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;',
    tag: 'display:inline-block;padding:2px 10px;border-radius:10px;font-size:12px;margin:2px;',
    section: 'margin-bottom:20px;',
    flexRow: 'display:flex;gap:16px;align-items:center;flex-wrap:wrap;',
    flexCol: 'display:flex;flex-direction:column;gap:12px;'
};

var _util = {
    todayStr: function() {
        var d = new Date();
        var y = d.getFullYear();
        var m = d.getMonth() + 1;
        var day = d.getDate();
        return y + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
    },

    genId: function(prefix) {
        return (prefix || 'id') + '_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    },

    escapeHtml: function(text) {
        if (!text) return '';
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    loadJson: function(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* corrupted */ }
        return fallback;
    },

    saveJson: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) { /* storage full */ }
    },

    formatDate: function(date) {
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var d = date.getDate();
        var weekdays = ['\u65E5', '\u4E00', '\u4E8C', '\u4E09', '\u56DB', '\u4E94', '\u516D'];
        return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d) + ' \u5468' + weekdays[date.getDay()];
    },

    btn: function(text, onClick, styleExtra) {
        var b = document.createElement('button');
        b.textContent = text;
        b.style.cssText = _ST.btn + (styleExtra || '');
        b.addEventListener('click', onClick);
        return b;
    }
};

/* ============================================================
   MODULE 1: pomodoroTimer
   ============================================================ */
window.pomodoroTimer = (function() {
    'use strict';

    var STORAGE_KEY = 'hspcb_pomodoro_data';
    var FOCUS_SECONDS = 25 * 60;
    var BREAK_SECONDS = 5 * 60;
    var SUBJECTS = ['\u7269\u7406', '\u5316\u5B66', '\u751F\u7269', '\u8BED\u6587', '\u6570\u5B66', '\u82F1\u8BED'];

    var state = {
        mode: 'focus',
        remaining: FOCUS_SECONDS,
        running: false,
        intervalId: null,
        subject: SUBJECTS[0]
    };

    var audioCtx = null;

    function getAudioCtx() {
        if (!audioCtx) {
            try {
                var AC = window.AudioContext || window.webkitAudioContext;
                if (AC) audioCtx = new AC();
            } catch (e) { /* no audio */ }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playBeep() {
        var ctx = getAudioCtx();
        if (!ctx) return;
        try {
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.6);

            /* second beep after short gap */
            var osc2 = ctx.createOscillator();
            var gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.3);
            gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.3);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
            osc2.start(ctx.currentTime + 0.3);
            osc2.stop(ctx.currentTime + 0.9);
        } catch (e) { /* audio error */ }
    }

    function loadData() {
        return _util.loadJson(STORAGE_KEY, { sessions: [], dailyCount: {}, dailyTime: {} });
    }

    function saveData(data) {
        _util.saveJson(STORAGE_KEY, data);
    }

    function recordSession(subject) {
        var data = loadData();
        var today = _util.todayStr();
        data.sessions.push({
            date: today,
            subject: subject,
            duration: 25,
            timestamp: new Date().toISOString()
        });
        if (!data.dailyCount[today]) data.dailyCount[today] = 0;
        data.dailyCount[today]++;
        if (!data.dailyTime[today]) data.dailyTime[today] = 0;
        data.dailyTime[today] += 25;
        /* keep only last 200 sessions */
        if (data.sessions.length > 200) {
            data.sessions = data.sessions.slice(-200);
        }
        saveData(data);
    }

    function getTodayCount() {
        var data = loadData();
        return data.dailyCount[_util.todayStr()] || 0;
    }

    function getTodayTime() {
        var data = loadData();
        return data.dailyTime[_util.todayStr()] || 0;
    }

    function getTodaySessions() {
        var data = loadData();
        var today = _util.todayStr();
        var result = [];
        for (var i = data.sessions.length - 1; i >= 0; i--) {
            if (data.sessions[i].date === today) result.push(data.sessions[i]);
        }
        return result;
    }

    /* ===== Canvas Progress Ring ===== */

    function drawRing() {
        var canvas = document.getElementById('pomodoro-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = canvas.width, h = canvas.height;
        var cx = w / 2, cy = h / 2;
        var radius = Math.min(w, h) / 2 - 22;

        ctx.clearRect(0, 0, w, h);

        /* background ring */
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#e8e8e8';
        ctx.lineWidth = 10;
        ctx.stroke();

        /* progress ring (remaining) */
        var total = state.mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;
        var progress = total > 0 ? state.remaining / total : 0;
        var startAngle = -Math.PI / 2;
        var endAngle = startAngle + progress * 2 * Math.PI;
        var color = state.mode === 'focus' ? '#4a90e2' : '#52c41a';

        if (progress > 0) {
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.strokeStyle = color;
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        /* time text */
        var mins = Math.floor(state.remaining / 60);
        var secs = state.remaining % 60;
        var timeStr = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;

        ctx.font = 'bold 40px Arial, sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(timeStr, cx, cy - 8);

        /* mode label */
        ctx.font = '15px Arial, sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(state.mode === 'focus' ? '\u4E13\u6CE8\u4E2D' : '\u4F11\u606F\u4E2D', cx, cy + 24);

        /* subject label */
        ctx.font = '13px Arial, sans-serif';
        ctx.fillStyle = '#999';
        ctx.fillText(state.subject, cx, cy + 46);
    }

    function updateStatusText() {
        var countEl = document.getElementById('pomo-session-count');
        var timeEl = document.getElementById('pomo-today-time');
        if (countEl) countEl.textContent = getTodayCount();
        if (timeEl) timeEl.textContent = getTodayTime();

        var modeEl = document.getElementById('pomo-mode-label');
        if (modeEl) {
            modeEl.textContent = state.mode === 'focus' ? '\u4E13\u6CE8\u65F6\u95F4' : '\u4F11\u606F\u65F6\u95F4';
            modeEl.style.color = state.mode === 'focus' ? '#4a90e2' : '#52c41a';
        }

        var startBtn = document.getElementById('pomo-start-btn');
        if (startBtn) {
            startBtn.textContent = state.running ? '\u6B63\u5728\u8FD0\u884C' : '\u5F00\u59CB';
            startBtn.disabled = state.running;
            startBtn.style.opacity = state.running ? '0.6' : '1';
        }
    }

    function renderSessionList() {
        var container = document.getElementById('pomo-session-list');
        if (!container) return;
        var sessions = getTodaySessions();
        if (sessions.length === 0) {
            container.innerHTML = '<div style="color:#999;font-size:13px;text-align:center;padding:10px;">\u4ECA\u5929\u8FD8\u6CA1\u6709\u5B8C\u6210\u7684\u756A\u8304\u949F</div>';
            return;
        }
        var html = '';
        for (var i = 0; i < sessions.length; i++) {
            var s = sessions[i];
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f5f5f5;">';
            html += '<span style="font-size:13px;color:#555;">' + (i + 1) + '. ' + _util.escapeHtml(s.subject) + '</span>';
            html += '<span style="font-size:12px;color:#999;">' + s.duration + '\u5206\u949F</span>';
            html += '</div>';
        }
        container.innerHTML = html;
    }

    function tick() {
        state.remaining--;
        if (state.remaining <= 0) {
            completePhase();
            return;
        }
        drawRing();
        updateStatusText();
    }

    function completePhase() {
        if (state.intervalId) {
            clearInterval(state.intervalId);
            state.intervalId = null;
        }
        state.running = false;
        playBeep();

        if (state.mode === 'focus') {
            recordSession(state.subject);
            state.mode = 'break';
            state.remaining = BREAK_SECONDS;
        } else {
            state.mode = 'focus';
            state.remaining = FOCUS_SECONDS;
        }
        drawRing();
        updateStatusText();
        renderSessionList();
    }

    function start() {
        if (state.running) return;
        getAudioCtx(); /* initialize audio on user interaction */
        state.running = true;
        state.intervalId = setInterval(tick, 1000);
        updateStatusText();
    }

    function pause() {
        if (!state.running) return;
        state.running = false;
        if (state.intervalId) {
            clearInterval(state.intervalId);
            state.intervalId = null;
        }
        updateStatusText();
    }

    function reset() {
        if (state.intervalId) {
            clearInterval(state.intervalId);
            state.intervalId = null;
        }
        state.running = false;
        state.mode = 'focus';
        state.remaining = FOCUS_SECONDS;
        drawRing();
        updateStatusText();
    }

    function setSubject(subj) {
        state.subject = subj;
        drawRing();
    }

    function render() {
        var container = document.getElementById('pomodoro-timer-app');
        if (!container) return;

        var subjectOpts = '';
        for (var i = 0; i < SUBJECTS.length; i++) {
            subjectOpts += '<option value="' + SUBJECTS[i] + '"' + (state.subject === SUBJECTS[i] ? ' selected' : '') + '>' + SUBJECTS[i] + '</option>';
        }

        var html = '';
        html += '<div style="' + _ST.card + '">';
        html += '<h2 style="margin:0 0 16px;font-size:20px;color:#333;">\u756A\u8304\u949F\u5B66\u4E60\u6CD5</h2>';
        html += '<div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start;">';

        /* canvas area */
        html += '<div style="flex:0 0 auto;text-align:center;">';
        html += '<canvas id="pomodoro-canvas" width="220" height="220" style="display:block;margin:0 auto;"></canvas>';
        html += '<div style="margin-top:12px;display:flex;gap:10px;justify-content:center;">';
        html += '<button id="pomo-start-btn" style="' + _ST.btn + _ST.btnPrimary + '">' + (state.running ? '\u6B63\u5728\u8FD0\u884C' : '\u5F00\u59CB') + '</button>';
        html += '<button id="pomo-pause-btn" style="' + _ST.btn + _ST.btnWarning + _ST.btnSm + '">\u6682\u505C</button>';
        html += '<button id="pomo-reset-btn" style="' + _ST.btn + _ST.btnGray + _ST.btnSm + '">\u91CD\u7F6E</button>';
        html += '</div></div>';

        /* controls area */
        html += '<div style="flex:1;min-width:240px;">';
        html += '<label style="' + _ST.label + '">\u5B66\u79D1\u9009\u62E9</label>';
        html += '<select id="pomo-subject-select" style="' + _ST.select + 'width:100%;">' + subjectOpts + '</select>';
        html += '<div style="margin-top:16px;display:flex;gap:24px;">';
        html += '<div style="text-align:center;flex:1;background:#f0f7ff;padding:12px;border-radius:8px;">';
        html += '<div style="font-size:32px;font-weight:bold;color:#4a90e2;" id="pomo-session-count">' + getTodayCount() + '</div>';
        html += '<div style="font-size:12px;color:#666;">\u4ECA\u65E5\u5B8C\u6210\u6570</div>';
        html += '</div>';
        html += '<div style="text-align:center;flex:1;background:#f6ffed;padding:12px;border-radius:8px;">';
        html += '<div style="font-size:32px;font-weight:bold;color:#52c41a;" id="pomo-today-time">' + getTodayTime() + '</div>';
        html += '<div style="font-size:12px;color:#666;">\u4ECA\u65E6\u5B66\u4E60(\u5206\u949F)</div>';
        html += '</div>';
        html += '</div>';
        html += '<div style="margin-top:12px;font-size:13px;color:#999;text-align:center;" id="pomo-mode-label">' + (state.mode === 'focus' ? '\u4E13\u6CE8\u65F6\u95F4' : '\u4F11\u606F\u65F6\u95F4') + '</div>';
        html += '</div>';
        html += '</div>'; /* end flex */

        /* session list */
        html += '<div style="margin-top:20px;">';
        html += '<h3 style="font-size:15px;color:#555;margin:0 0 8px;">\u4ECA\u65E5\u5B8C\u6210\u8BB0\u5F55</h3>';
        html += '<div id="pomo-session-list" style="max-height:200px;overflow-y:auto;"></div>';
        html += '</div>';

        html += '</div>';

        container.innerHTML = html;

        /* attach listeners */
        var startBtn = document.getElementById('pomo-start-btn');
        if (startBtn) startBtn.addEventListener('click', start);
        var pauseBtn = document.getElementById('pomo-pause-btn');
        if (pauseBtn) pauseBtn.addEventListener('click', pause);
        var resetBtn = document.getElementById('pomo-reset-btn');
        if (resetBtn) resetBtn.addEventListener('click', reset);
        var subjSelect = document.getElementById('pomo-subject-select');
        if (subjSelect) subjSelect.addEventListener('change', function() {
            setSubject(this.value);
        });

        drawRing();
        renderSessionList();

        /* resume interval if was running */
        if (state.running && !state.intervalId) {
            state.intervalId = setInterval(tick, 1000);
        }
    }

    return {
        render: render,
        start: start,
        pause: pause,
        reset: reset
    };
})();

/* ============================================================
   MODULE 2: studyPlanGenerator
   ============================================================ */
window.studyPlanGenerator = (function() {
    'use strict';

    var STORAGE_KEY = 'hspcb_study_plan';
    var SUBJECTS = ['\u7269\u7406', '\u5316\u5B66', '\u751F\u7269', '\u8BED\u6587', '\u6570\u5B66', '\u82F1\u8BED'];

    function calcDaysUntilGaokao() {
        var now = new Date();
        var year = now.getFullYear();
        var gaokao = new Date(year, 5, 7, 0, 0, 0); /* June 7 */
        if (gaokao.getTime() <= now.getTime()) {
            gaokao = new Date(year + 1, 5, 7, 0, 0, 0);
        }
        var diff = Math.ceil((gaokao.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    }

    function generatePlan(days, targetScore, weakSubjects) {
        var plan = [];
        if (!days || days < 1) days = 30;
        days = Math.min(days, 365);

        /* build weighted subject pool */
        var pool = [];
        for (var i = 0; i < SUBJECTS.length; i++) {
            var weight = 1;
            for (var w = 0; w < weakSubjects.length; w++) {
                if (weakSubjects[w] === SUBJECTS[i]) { weight = 3; break; }
            }
            for (var k = 0; k < weight; k++) pool.push(SUBJECTS[i]);
        }

        var startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        var slotIdx = 0;
        var practiceCounter = 0;
        var recentSubjects = [];

        function pickSubject(usedToday) {
            var subj = pool[slotIdx % pool.length];
            var attempts = 0;
            while (usedToday.length > 0 && usedToday.indexOf(subj) !== -1 && attempts < pool.length) {
                slotIdx++;
                subj = pool[slotIdx % pool.length];
                attempts++;
            }
            slotIdx++;
            recentSubjects.push(subj);
            return subj;
        }

        for (var d = 0; d < days; d++) {
            var date = new Date(startDate.getTime() + d * 24 * 60 * 60 * 1000);
            var dateStr = _util.formatDate(date);

            /* rest day every 7 days */
            if ((d + 1) % 7 === 0) {
                plan.push({
                    date: dateStr,
                    morning: '\u4F11\u606F',
                    afternoon: '\u4F11\u606F',
                    evening: '\u8F7B\u5EA6\u590D\u4E60',
                    practiceTest: '\u65E0',
                    isRestDay: true
                });
                continue;
            }

            var usedToday = [];
            var morning = pickSubject(usedToday);
            usedToday.push(morning);
            var afternoon = pickSubject(usedToday);
            usedToday.push(afternoon);
            var evening = pickSubject(usedToday);
            usedToday.push(evening);

            /* practice test every 3 study days */
            practiceCounter++;
            var practiceTest = '\u65E0';
            if (practiceCounter >= 3) {
                practiceTest = morning + ' + ' + afternoon + ' \u7EFC\u5408\u7EC3';
                practiceCounter = 0;
            }

            plan.push({
                date: dateStr,
                morning: morning,
                afternoon: afternoon,
                evening: evening + ' \u590D\u4E60',
                practiceTest: practiceTest,
                isRestDay: false
            });
        }

        return plan;
    }

    function savePlan(plan, config) {
        _util.saveJson(STORAGE_KEY, { plan: plan, config: config, savedAt: new Date().toISOString() });
    }

    function loadSavedPlan() {
        return _util.loadJson(STORAGE_KEY, null);
    }

    function renderPlanTable(plan) {
        var html = '<div style="' + _ST.card + '">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
        html += '<h3 style="margin:0;font-size:16px;color:#333;">\u590D\u4E60\u8BA1\u5212\u8868</h3>';
        html += '<div>';
        html += '<button id="sp-export-btn" style="' + _ST.btn + _ST.btnPrimary + _ST.btnSm + ';margin-right:8px;">\u5BFC\u51FA\u6253\u5370</button>';
        html += '<button id="sp-save-btn" style="' + _ST.btn + _ST.btnSuccess + _ST.btnSm + '">\u4FDD\u5B58\u8BA1\u5212</button>';
        html += '</div>';
        html += '</div>';

        /* stats summary */
        var studyDays = 0, restDays = 0;
        var subjCount = {};
        for (var i = 0; i < plan.length; i++) {
            if (plan[i].isRestDay) restDays++;
            else {
                studyDays++;
                if (!subjCount[plan[i].morning]) subjCount[plan[i].morning] = 0;
                subjCount[plan[i].morning]++;
                if (!subjCount[plan[i].afternoon]) subjCount[plan[i].afternoon] = 0;
                subjCount[plan[i].afternoon]++;
                if (!subjCount[plan[i].evening]) subjCount[plan[i].evening] = 0;
                subjCount[plan[i].evening]++;
            }
        }

        html += '<div style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap;">';
        html += '<div style="background:#e6f7ff;padding:8px 16px;border-radius:8px;font-size:13px;">\u603B\u5929\u6570: <b>' + plan.length + '</b></div>';
        html += '<div style="background:#f6ffed;padding:8px 16px;border-radius:8px;font-size:13px;">\u5B66\u4E60\u5929: <b>' + studyDays + '</b></div>';
        html += '<div style="background:#fff7e6;padding:8px 16px;border-radius:8px;font-size:13px;">\u4F11\u606F\u5929: <b>' + restDays + '</b></div>';
        html += '</div>';

        /* subject distribution */
        html += '<div style="margin-bottom:12px;font-size:13px;color:#666;">';
        var subjKeys = Object.keys(subjCount);
        for (var s = 0; s < subjKeys.length; s++) {
            html += '<span style="' + _ST.tag + 'background:#f0f5ff;color:#4a90e2;">' + subjKeys[s] + ': ' + subjCount[subjKeys[s]] + ' \u6B21</span>';
        }
        html += '</div>';

        /* table */
        html += '<div style="overflow-x:auto;max-height:500px;overflow-y:auto;">';
        html += '<table style="' + _ST.table + '">';
        html += '<thead><tr><th style="' + _ST.th + '">\u65E5\u671F</th><th style="' + _ST.th + '">\u4E0A\u5348</th><th style="' + _ST.th + '">\u4E0B\u5348</th><th style="' + _ST.th + '">\u665A\u95F4\u590D\u4E60</th><th style="' + _ST.th + '">\u7EC3\u4E60\u6D4B\u8BD5</th></tr></thead>';
        html += '<tbody>';
        for (var r = 0; r < plan.length; r++) {
            var day = plan[r];
            var rowStyle = day.isRestDay ? 'background:#fffbe6;' : (r % 2 === 1 ? 'background:#fafafa;' : '');
            html += '<tr style="' + rowStyle + '">';
            html += '<td style="' + _ST.td + 'white-space:nowrap;font-weight:bold;">' + day.date + '</td>';
            html += '<td style="' + _ST.td + '">' + _util.escapeHtml(day.morning) + '</td>';
            html += '<td style="' + _ST.td + '">' + _util.escapeHtml(day.afternoon) + '</td>';
            html += '<td style="' + _ST.td + '">' + _util.escapeHtml(day.evening) + '</td>';
            html += '<td style="' + _ST.td + (day.practiceTest !== '\u65E0' ? 'color:#fa8c16;font-weight:bold;' : 'color:#ccc;') + '">' + _util.escapeHtml(day.practiceTest) + '</td>';
            html += '</tr>';
        }
        html += '</tbody></table>';
        html += '</div>';
        html += '</div>';

        return html;
    }

    function exportPlan(plan) {
        var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>\u9AD8\u8003\u590D\u4E60\u8BA1\u5212</title><style>';
        html += 'body{font-family:Arial,sans-serif;padding:30px;max-width:1000px;margin:0 auto;}';
        html += 'h1{color:#4a90e2;text-align:center;}';
        html += 'table{width:100%;border-collapse:collapse;margin-top:20px;}';
        html += 'th{background:#4a90e2;color:#fff;padding:10px;text-align:left;font-size:13px;}';
        html += 'td{padding:8px 10px;border:1px solid #e0e0e0;font-size:12px;}';
        html += '.rest{background:#fffbe6;}';
        html += '@media print{button{display:none;}body{padding:10px;}}';
        html += '</style></head><body>';
        html += '<h1>\u9AD8\u8003\u590D\u4E60\u8BA1\u5212\u8868</h1>';
        html += '<table><thead><tr><th>\u65E5\u671F</th><th>\u4E0A\u5348</th><th>\u4E0B\u5348</th><th>\u665A\u95F4\u590D\u4E60</th><th>\u7EC3\u4E60\u6D4B\u8BD5</th></tr></thead><tbody>';
        for (var i = 0; i < plan.length; i++) {
            var d = plan[i];
            html += '<tr class="' + (d.isRestDay ? 'rest' : '') + '">';
            html += '<td>' + d.date + '</td><td>' + d.morning + '</td><td>' + d.afternoon + '</td><td>' + d.evening + '</td><td>' + d.practiceTest + '</td>';
            html += '</tr>';
        }
        html += '</tbody></table>';
        html += '<button onclick="window.print()" style="margin-top:20px;padding:10px 24px;background:#4a90e2;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;">\u6253\u5370\u6216\u4FDD\u5B58\u4E3APDF</button>';
        html += '</body></html>';

        var w = window.open('', '_blank');
        if (w) {
            w.document.write(html);
            w.document.close();
        }
    }

    function generate() {
        var daysInput = document.getElementById('sp-days-input');
        var scoreInput = document.getElementById('sp-score-input');
        var days = parseInt(daysInput.value, 10) || calcDaysUntilGaokao();
        var targetScore = parseInt(scoreInput.value, 10) || 600;

        var weakSubjects = [];
        var checkboxes = document.getElementsByName('sp-weak-subject');
        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) weakSubjects.push(checkboxes[i].value);
        }

        var plan = generatePlan(days, targetScore, weakSubjects);
        var config = { days: days, targetScore: targetScore, weakSubjects: weakSubjects };
        savePlan(plan, config);

        var tableContainer = document.getElementById('sp-plan-output');
        if (tableContainer) {
            tableContainer.innerHTML = renderPlanTable(plan);
            var exportBtn = document.getElementById('sp-export-btn');
            if (exportBtn) exportBtn.addEventListener('click', function() { exportPlan(plan); });
            var saveBtn = document.getElementById('sp-save-btn');
            if (saveBtn) {
                saveBtn.textContent = '\u5DF2\u4FDD\u5B58';
                saveBtn.disabled = true;
                saveBtn.style.opacity = '0.6';
            }
        }
    }

    function render() {
        var container = document.getElementById('study-plan-generator-app');
        if (!container) return;

        var defaultDays = calcDaysUntilGaokao();

        var html = '';
        html += '<div style="' + _ST.card + '">';
        html += '<h2 style="margin:0 0 16px;font-size:20px;color:#333;">\u9AD8\u8003\u590D\u4E60\u8BA1\u5212\u751F\u6210\u5668</h2>';

        /* input form */
        html += '<div style="' + _ST.flexCol + 'margin-bottom:16px;">';
        html += '<div style="' + _ST.flexRow + '">';
        html += '<div style="flex:1;min-width:180px;"><label style="' + _ST.label + '">\u8DDD\u9AD8\u8003\u5929\u6570</label>';
        html += '<input id="sp-days-input" type="number" value="' + defaultDays + '" min="1" max="365" style="' + _ST.input + '"></div>';
        html += '<div style="flex:1;min-width:180px;"><label style="' + _ST.label + '">\u76EE\u6807\u5206\u6570</label>';
        html += '<input id="sp-score-input" type="number" value="600" min="300" max="750" style="' + _ST.input + '"></div>';
        html += '</div>';

        /* weak subjects checkboxes */
        html += '<div><label style="' + _ST.label + '">\u8584\u5F31\u5B66\u79D1\uFF08\u52FE\u9009\u540E\u5C06\u83B7\u5F97\u66F4\u591A\u65F6\u95F4\u5206\u914D\uFF09</label>';
        html += '<div style="' + _ST.flexRow + '">';
        for (var i = 0; i < SUBJECTS.length; i++) {
            html += '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;padding:6px 12px;border:1px solid #d9d9d9;border-radius:6px;">';
            html += '<input type="checkbox" name="sp-weak-subject" value="' + SUBJECTS[i] + '"> ' + SUBJECTS[i] + '</label>';
        }
        html += '</div></div>';

        html += '<div><button id="sp-generate-btn" style="' + _ST.btn + _ST.btnPrimary + '">\u751F\u6210\u590D\u4E60\u8BA1\u5212</button></div>';
        html += '</div>';

        /* saved plan notice */
        var saved = loadSavedPlan();
        if (saved && saved.plan) {
            html += '<div style="background:#f6ffed;border:1px solid #b7eb84;padding:10px 16px;border-radius:8px;font-size:13px;color:#52c41a;margin-bottom:12px;">';
            html += '\u5DF2\u4FDD\u5B58\u7684\u8BA1\u5212: ' + (saved.config ? saved.config.days + '\u5929\u8BA1\u5212' : '\u672A\u77E5\u5929\u6570') + ' (\u4FDD\u5B58\u4E8E ' + (saved.savedAt || '').slice(0, 10) + ')';
            html += '</div>';
        }

        html += '</div>';

        /* plan output area */
        html += '<div id="sp-plan-output"></div>';

        container.innerHTML = html;

        var genBtn = document.getElementById('sp-generate-btn');
        if (genBtn) genBtn.addEventListener('click', generate);

        /* if saved plan exists, render it */
        if (saved && saved.plan) {
            var out = document.getElementById('sp-plan-output');
            if (out) {
                out.innerHTML = renderPlanTable(saved.plan);
                var exportBtn = document.getElementById('sp-export-btn');
                if (exportBtn) exportBtn.addEventListener('click', function() { exportPlan(saved.plan); });
                var saveBtn = document.getElementById('sp-save-btn');
                if (saveBtn) {
                    saveBtn.textContent = '\u91CD\u65B0\u4FDD\u5B58';
                    saveBtn.addEventListener('click', function() {
                        savePlan(saved.plan, saved.config || {});
                        saveBtn.textContent = '\u5DF2\u4FDD\u5B58';
                        saveBtn.disabled = true;
                        saveBtn.style.opacity = '0.6';
                    });
                }
            }
        }
    }

    return {
        render: render,
        generatePlan: generatePlan,
        calcDaysUntilGaokao: calcDaysUntilGaokao
    };
})();

/* ============================================================
   MODULE 3: masteryRadar
   ============================================================ */
window.masteryRadar = (function() {
    'use strict';

    var STORAGE_KEY = 'hspcb_mastery_data';
    var ERROR_KEY = 'hspcb_error_notebook';

    var DIMENSIONS = {
        physics: { name: '\u7269\u7406', dims: ['\u529B\u5B66', '\u7535\u78C1', '\u70ED\u5B66', '\u5149\u5B66', '\u539F\u5B50', '\u5B9E\u9A8C'] },
        chemistry: { name: '\u5316\u5B66', dims: ['\u53CD\u5E94\u539F\u7406', '\u65E0\u673A', '\u6709\u673A', '\u5B9E\u9A8C', '\u8BA1\u7B97', '\u5DE5\u4E1A\u6D41\u7A0B'] },
        biology: { name: '\u751F\u7269', dims: ['\u7EC6\u80DE', '\u9057\u4F20', '\u7A33\u6001', '\u751F\u6001', '\u5B9E\u9A8C', '\u751F\u7269\u6280\u672F'] },
        math: { name: '\u6570\u5B66', dims: ['\u51FD\u6570', '\u4E09\u89D2', '\u6570\u5217', '\u51E0\u4F55', '\u6982\u7387', '\u5BFC\u6570'] },
        chinese: { name: '\u8BED\u6587', dims: ['\u73B0\u4EE3\u6587', '\u6587\u8A00\u6587', '\u8BD7\u8BCD', '\u9ED8\u5199', '\u8BED\u8A00\u8FD0\u7528', '\u4F5C\u6587'] },
        english: { name: '\u82F1\u8BED', dims: ['\u8BED\u6CD5', '\u8BCD\u6C47', '\u9605\u8BFB', '\u5B8C\u5F62', '\u5199\u4F5C', '\u542C\u529B'] }
    };

    var SUBJECT_KEYS = ['physics', 'chemistry', 'biology', 'math', 'chinese', 'english'];

    var CHAPTER_MAP = {
        physics: [
            { keys: ['\u529B', '\u8FD0\u52A8', '\u725B\u987F', '\u52A8\u91CF', '\u529F', '\u80FD'], dim: '\u529B\u5B66' },
            { keys: ['\u7535', '\u78C1', '\u7535\u78C1'], dim: '\u7535\u78C1' },
            { keys: ['\u70ED', '\u6E29\u5EA6', '\u5185\u80FD'], dim: '\u70ED\u5B66' },
            { keys: ['\u5149', '\u6298\u5C04', '\u53CD\u5C04', '\u5E72\u6D89', '\u8870\u5C04'], dim: '\u5149\u5B66' },
            { keys: ['\u539F\u5B50', '\u6838', '\u8870\u53D8', '\u805A\u53D8', '\u88C2\u53D8'], dim: '\u539F\u5B50' },
            { keys: ['\u5B9E\u9A8C'], dim: '\u5B9E\u9A8C' }
        ],
        chemistry: [
            { keys: ['\u53CD\u5E94', '\u5E73\u8861', '\u901F\u7387', '\u70ED'], dim: '\u53CD\u5E94\u539F\u7406' },
            { keys: ['\u65E0\u673A', '\u91D1\u5C5E', '\u975E\u91D1\u5C5E', '\u5143\u7D20'], dim: '\u65E0\u673A' },
            { keys: ['\u6709\u673A', '\u70F7', '\u9187', '\u916F'], dim: '\u6709\u673A' },
            { keys: ['\u5B9E\u9A8C', '\u88C5\u7F6E', '\u64CD\u4F5C'], dim: '\u5B9E\u9A8C' },
            { keys: ['\u8BA1\u7B97', '\u6469\u5C14', '\u6D53\u5EA6'], dim: '\u8BA1\u7B97' },
            { keys: ['\u5DE5\u4E1A', '\u6D41\u7A0B', '\u5236\u5907'], dim: '\u5DE5\u4E1A\u6D41\u7A0B' }
        ],
        biology: [
            { keys: ['\u7EC6\u80DE', '\u5206\u88C2', '\u7ED3\u6784', '\u4EE3\u8C22'], dim: '\u7EC6\u80DE' },
            { keys: ['\u9057\u4F20', 'DNA', '\u57FA\u56E0', '\u53D8\u5F02'], dim: '\u9057\u4F20' },
            { keys: ['\u7A33\u6001', '\u795E\u7ECF', '\u6FC0\u7D20', '\u514D\u75AB'], dim: '\u7A33\u6001' },
            { keys: ['\u751F\u6001', '\u79CD\u7FA4', '\u7FA4\u843D', '\u73AF\u5883'], dim: '\u751F\u6001' },
            { keys: ['\u5B9E\u9A8C'], dim: '\u5B9E\u9A8C' },
            { keys: ['\u751F\u7269\u6280\u672F', '\u5DE5\u7A0B', 'PCR', '\u57F9\u517B'], dim: '\u751F\u7269\u6280\u672F' }
        ],
        math: [
            { keys: ['\u51FD\u6570', '\u5B9A\u4E49\u57DF', '\u503C\u57DF', '\u5355\u8C03', '\u6781\u503C'], dim: '\u51FD\u6570' },
            { keys: ['\u4E09\u89D2', '\u6B63\u5F26', '\u4F59\u5F26', '\u6B63\u5207'], dim: '\u4E09\u89D2' },
            { keys: ['\u6570\u5217', '\u7B49\u5DEE', '\u7B49\u6BD4', '\u901A\u9879', '\u6C42\u548C'], dim: '\u6570\u5217' },
            { keys: ['\u51E0\u4F55', '\u5411\u91CF', '\u7ACB\u4F53', '\u89E3\u6790', '\u5706\u9525'], dim: '\u51E0\u4F55' },
            { keys: ['\u6982\u7387', '\u7EDF\u8BA1', '\u5206\u5E03', '\u671F\u671B'], dim: '\u6982\u7387' },
            { keys: ['\u5BFC\u6570', '\u5FAE\u5206', '\u5207\u7EBF'], dim: '\u5BFC\u6570' }
        ],
        chinese: [
            { keys: ['\u73B0\u4EE3\u6587', '\u9605\u8BFB', '\u8BF4\u660E\u6587', '\u8BAE\u8BBA\u6587'], dim: '\u73B0\u4EE3\u6587' },
            { keys: ['\u6587\u8A00', '\u53E4\u6587', '\u5B9E\u8BCD', '\u865A\u8BCD'], dim: '\u6587\u8A00\u6587' },
            { keys: ['\u8BD7\u8BCD', '\u8BD7\u6B4C', '\u9274\u8D4F'], dim: '\u8BD7\u8BCD' },
            { keys: ['\u9ED8\u5199', '\u80CC\u8BF5', '\u540D\u53E5'], dim: '\u9ED8\u5199' },
            { keys: ['\u8BED\u8A00', '\u8FD0\u7528', '\u75C5\u53E5', '\u6210\u8BED'], dim: '\u8BED\u8A00\u8FD0\u7528' },
            { keys: ['\u4F5C\u6587', '\u5199\u4F5C'], dim: '\u4F5C\u6587' }
        ],
        english: [
            { keys: ['\u8BED\u6CD5', '\u65F6\u6001', '\u4ECE\u53E5'], dim: '\u8BED\u6CD5' },
            { keys: ['\u8BCD\u6C47', '\u5355\u8BCD'], dim: '\u8BCD\u6C47' },
            { keys: ['\u9605\u8BFB', '\u7406\u89E3'], dim: '\u9605\u8BFB' },
            { keys: ['\u5B8C\u5F62', '\u586B\u7A7A'], dim: '\u5B8C\u5F62' },
            { keys: ['\u5199\u4F5C', '\u4F5C\u6587'], dim: '\u5199\u4F5C' },
            { keys: ['\u542C\u529B'], dim: '\u542C\u529B' }
        ]
    };

    function mapChapterToDim(subject, chapter) {
        var mappings = CHAPTER_MAP[subject];
        if (!mappings) return null;
        var ch = chapter || '';
        for (var i = 0; i < mappings.length; i++) {
            for (var j = 0; j < mappings[i].keys.length; j++) {
                if (ch.indexOf(mappings[i].keys[j]) !== -1) return mappings[i].dim;
            }
        }
        return null;
    }

    function loadMasteryData() {
        return _util.loadJson(STORAGE_KEY, {});
    }

    function saveMasteryData(data) {
        _util.saveJson(STORAGE_KEY, data);
    }

    function computeFromErrors(subject) {
        var dims = DIMENSIONS[subject].dims;
        var stats = {};
        for (var i = 0; i < dims.length; i++) stats[dims[i]] = { total: 0, mastered: 0 };

        var errorData = _util.loadJson(ERROR_KEY, { errors: [] });
        var errors = errorData.errors || [];
        for (var j = 0; j < errors.length; j++) {
            var e = errors[j];
            if (e.subject !== subject) continue;
            var dim = mapChapterToDim(subject, e.chapter || '');
            if (dim && stats[dim]) {
                stats[dim].total++;
                if (e.mastered) stats[dim].mastered++;
            }
        }

        var result = {};
        for (var k = 0; k < dims.length; k++) {
            var s = stats[dims[k]];
            result[dims[k]] = s.total > 0 ? Math.round(s.mastered / s.total * 100) : null;
        }
        return result;
    }

    function getValues(subject) {
        var dims = DIMENSIONS[subject].dims;
        var saved = loadMasteryData();
        var savedSubj = saved[subject] || {};
        var errorBased = computeFromErrors(subject);
        var values = [];
        for (var i = 0; i < dims.length; i++) {
            var d = dims[i];
            if (typeof savedSubj[d] === 'number') {
                values.push(savedSubj[d]);
            } else if (errorBased[d] !== null) {
                values.push(errorBased[d]);
            } else {
                values.push(50);
            }
        }
        return values;
    }

    function getDataSources(subject) {
        var dims = DIMENSIONS[subject].dims;
        var saved = loadMasteryData();
        var savedSubj = saved[subject] || {};
        var errorBased = computeFromErrors(subject);
        var sources = [];
        for (var i = 0; i < dims.length; i++) {
            var d = dims[i];
            if (typeof savedSubj[d] === 'number') sources.push('self');
            else if (errorBased[d] !== null) sources.push('error');
            else sources.push('default');
        }
        return sources;
    }

    function drawRadar(canvas, subject, values) {
        var ctx = canvas.getContext('2d');
        var w = canvas.width, h = canvas.height;
        var cx = w / 2, cy = h / 2 + 10;
        var radius = Math.min(w, h) / 2 - 50;
        var labels = DIMENSIONS[subject].dims;
        var n = labels.length;

        ctx.clearRect(0, 0, w, h);

        /* grid rings */
        for (var r = 1; r <= 4; r++) {
            ctx.beginPath();
            var rr = radius * r / 4;
            for (var i = 0; i <= n; i++) {
                var angle = -Math.PI / 2 + i * 2 * Math.PI / n;
                var x = cx + rr * Math.cos(angle);
                var y = cy + rr * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = r === 4 ? '#d0d0d0' : '#e8e8e8';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        /* grid level labels */
        ctx.font = '10px Arial, sans-serif';
        ctx.fillStyle = '#bbb';
        ctx.textAlign = 'left';
        for (var rl = 1; rl <= 4; rl++) {
            ctx.fillText((rl * 25) + '', cx + 2, cy - radius * rl / 4 + 3);
        }

        /* axes */
        for (var a = 0; a < n; a++) {
            var angleA = -Math.PI / 2 + a * 2 * Math.PI / n;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + radius * Math.cos(angleA), cy + radius * Math.sin(angleA));
            ctx.strokeStyle = '#d8d8d8';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        /* data polygon */
        ctx.beginPath();
        for (var d = 0; d <= n; d++) {
            var idx = d % n;
            var val = values[idx] / 100;
            var angleD = -Math.PI / 2 + idx * 2 * Math.PI / n;
            var x = cx + radius * val * Math.cos(angleD);
            var y = cy + radius * val * Math.sin(angleD);
            if (d === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.fillStyle = 'rgba(74, 144, 226, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        ctx.stroke();

        /* data points */
        for (var p = 0; p < n; p++) {
            var valP = values[p] / 100;
            var angleP = -Math.PI / 2 + p * 2 * Math.PI / n;
            var px = cx + radius * valP * Math.cos(angleP);
            var py = cy + radius * valP * Math.sin(angleP);
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#4a90e2';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        /* labels */
        ctx.font = '13px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (var l = 0; l < n; l++) {
            var angleL = -Math.PI / 2 + l * 2 * Math.PI / n;
            var lx = cx + (radius + 24) * Math.cos(angleL);
            var ly = cy + (radius + 24) * Math.sin(angleL);
            ctx.fillStyle = '#555';
            ctx.fillText(labels[l], lx, ly);

            /* value below label */
            ctx.font = '11px Arial, sans-serif';
            ctx.fillStyle = '#4a90e2';
            ctx.fillText(values[l] + '', lx, ly + 14);
            ctx.font = '13px Arial, sans-serif';
        }

        /* title */
        ctx.font = 'bold 16px Arial, sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText(DIMENSIONS[subject].name + ' \u638C\u63E1\u5EA6\u96F7\u8FBE\u56FE', cx, 18);
    }

    var currentSubject = 'physics';

    function updateRadar() {
        var canvas = document.getElementById('mastery-canvas');
        if (!canvas) return;
        var values = getValues(currentSubject);
        drawRadar(canvas, currentSubject, values);
    }

    function onSliderChange(dimIdx, value) {
        var dims = DIMENSIONS[currentSubject].dims;
        var dim = dims[dimIdx];
        var data = loadMasteryData();
        if (!data[currentSubject]) data[currentSubject] = {};
        data[currentSubject][dim] = parseInt(value, 10);
        saveMasteryData(data);

        /* update value display */
        var valEl = document.getElementById('mastery-slider-val-' + dimIdx);
        if (valEl) valEl.textContent = value;

        updateRadar();
    }

    function switchSubject(key) {
        currentSubject = key;
        renderSliders();
        updateRadar();
    }

    function renderSliders() {
        var container = document.getElementById('mastery-sliders');
        if (!container) return;

        var dims = DIMENSIONS[currentSubject].dims;
        var values = getValues(currentSubject);
        var sources = getDataSources(currentSubject);

        var html = '';
        for (var i = 0; i < dims.length; i++) {
            var src = sources[i];
            var srcLabel = src === 'error' ? '\u9519\u9898\u63A8\u7B97' : (src === 'self' ? '\u81EA\u8BC4' : '\u9ED8\u8BA4');
            var srcColor = src === 'error' ? '#fa8c16' : (src === 'self' ? '#52c41a' : '#bfbfbf');
            html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">';
            html += '<span style="width:70px;font-size:13px;color:#555;flex-shrink:0;">' + dims[i] + '</span>';
            html += '<input type="range" min="0" max="100" value="' + values[i] + '" data-idx="' + i + '" ';
            html += 'style="flex:1;accent-color:#4a90e2;" class="mastery-slider">';
            html += '<span id="mastery-slider-val-' + i + '" style="width:36px;text-align:right;font-size:13px;font-weight:bold;color:#4a90e2;">' + values[i] + '</span>';
            html += '<span style="font-size:11px;color:' + srcColor + ';width:56px;">' + srcLabel + '</span>';
            html += '</div>';
        }
        container.innerHTML = html;

        var sliders = container.getElementsByClassName('mastery-slider');
        for (var j = 0; j < sliders.length; j++) {
            (function(slider, idx) {
                slider.addEventListener('input', function() {
                    onSliderChange(idx, slider.value);
                });
            })(sliders[j], j);
        }
    }

    function render() {
        var container = document.getElementById('mastery-radar-app');
        if (!container) return;

        var html = '';
        html += '<div style="' + _ST.card + '">';
        html += '<h2 style="margin:0 0 16px;font-size:20px;color:#333;">\u638C\u63E1\u5EA6\u96F7\u8FBE\u56FE</h2>';

        /* subject tabs */
        html += '<div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;">';
        for (var i = 0; i < SUBJECT_KEYS.length; i++) {
            var key = SUBJECT_KEYS[i];
            var active = key === currentSubject;
            html += '<button class="mastery-subj-btn" data-key="' + key + '" style="';
            html += 'padding:8px 16px;border:1px solid ' + (active ? '#4a90e2' : '#d9d9d9') + ';';
            html += 'border-radius:8px;cursor:pointer;font-size:13px;';
            html += 'background:' + (active ? '#4a90e2' : '#fff') + ';';
            html += 'color:' + (active ? '#fff' : '#555') + ';">' + DIMENSIONS[key].name + '</button>';
        }
        html += '</div>';

        /* canvas + sliders */
        html += '<div style="display:flex;gap:24px;flex-wrap:wrap;">';
        html += '<div style="flex:0 0 360px;text-align:center;">';
        html += '<canvas id="mastery-canvas" width="360" height="360" style="display:block;margin:0 auto;"></canvas>';
        html += '</div>';
        html += '<div style="flex:1;min-width:280px;">';
        html += '<h3 style="font-size:14px;color:#555;margin:0 0 12px;">\u8C03\u6574\u5404\u7EF4\u5EA6\u638C\u63E1\u5EA6 (0-100)</h3>';
        html += '<div id="mastery-sliders"></div>';
        html += '<div style="margin-top:12px;padding:10px;background:#f5f5f5;border-radius:8px;font-size:12px;color:#888;line-height:1.6;">';
        html += '<b>\u6570\u636E\u6765\u6E90:</b><br>';
        html += '\u2022 \u9519\u9898\u63A8\u7B97: \u4ECE\u9519\u9898\u672C\u638C\u63E1\u7387\u8BA1\u7B97<br>';
        html += '\u2022 \u81EA\u8BC4: \u624B\u52A8\u8C03\u6574\u540E\u4FDD\u5B58\u7684\u503C<br>';
        html += '\u2022 \u9ED8\u8BA4: \u65E0\u6570\u636E\u65F6\u7684\u521D\u59CB\u503C(50)';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        container.innerHTML = html;

        /* attach tab listeners */
        var tabs = container.getElementsByClassName('mastery-subj-btn');
        for (var j = 0; j < tabs.length; j++) {
            (function(tab) {
                tab.addEventListener('click', function() {
                    switchSubject(tab.getAttribute('data-key'));
                    /* update tab styles */
                    var allTabs = container.getElementsByClassName('mastery-subj-btn');
                    for (var k = 0; k < allTabs.length; k++) {
                        allTabs[k].style.borderColor = '#d9d9d9';
                        allTabs[k].style.background = '#fff';
                        allTabs[k].style.color = '#555';
                    }
                    tab.style.borderColor = '#4a90e2';
                    tab.style.background = '#4a90e2';
                    tab.style.color = '#fff';
                });
            })(tabs[j]);
        }

        renderSliders();
        updateRadar();
    }

    return {
        render: render,
        getValues: getValues,
        computeFromErrors: computeFromErrors
    };
})();

/* ============================================================
   MODULE 4: errorVariation
   ============================================================ */
window.errorVariation = (function() {
    'use strict';

    var ERROR_KEY = 'hspcb_error_notebook';
    var STATS_KEY = 'hspcb_variation_stats';

    var SUBJECT_NAMES = {
        physics: '\u7269\u7406', chemistry: '\u5316\u5B66', biology: '\u751F\u7269',
        chinese: '\u8BED\u6587', math: '\u6570\u5B66', english: '\u82F1\u8BED'
    };

    var state = {
        variations: [],
        currentIdx: 0,
        correctCount: 0,
        totalCount: 0,
        answered: false
    };

    function loadErrors() {
        var data = _util.loadJson(ERROR_KEY, { errors: [] });
        return data.errors || [];
    }

    function loadStats() {
        return _util.loadJson(STATS_KEY, { totalAttempts: 0, totalCorrect: 0, bySubject: {} });
    }

    function saveStats(stats) {
        _util.saveJson(STATS_KEY, stats);
    }

    function recordResult(subject, correct) {
        var stats = loadStats();
        stats.totalAttempts = (stats.totalAttempts || 0) + 1;
        if (correct) stats.totalCorrect = (stats.totalCorrect || 0) + 1;
        if (!stats.bySubject) stats.bySubject = {};
        if (!stats.bySubject[subject]) stats.bySubject[subject] = { total: 0, correct: 0 };
        stats.bySubject[subject].total++;
        if (correct) stats.bySubject[subject].correct++;
        saveStats(stats);
    }

    /* ===== Variation Generation ===== */

    function generateVariation(error) {
        var q = error.question || '';
        var subj = error.subject || 'math';
        var correctAnswer = error.correctAnswer || '';
        var options = error.options || [];

        var numRegex = /\d+\.?\d*/g;
        var numbers = q.match(numRegex);
        if (!numbers || numbers.length === 0) return null;

        var newQuestion = q;
        var changes = [];

        for (var i = 0; i < numbers.length; i++) {
            var orig = parseFloat(numbers[i]);
            if (orig === 0 || orig > 10000) continue;
            if (numbers[i].length <= 1 && orig < 2) continue; /* skip tiny numbers like 0, 1 */

            var factor;
            if (subj === 'math') {
                factor = 0.5 + Math.random() * 1.5;
            } else if (subj === 'physics') {
                factor = 0.6 + Math.random() * 0.9;
            } else if (subj === 'chemistry') {
                factor = 0.5 + Math.random() * 1.5;
            } else {
                factor = 0.6 + Math.random() * 1.0;
            }

            var newVal = Math.round(orig * factor * 100) / 100;
            if (newVal === orig) newVal = orig + 1;
            if (newVal < 0) newVal = Math.abs(newVal);
            if (newVal === 0) newVal = 1;

            newQuestion = newQuestion.replace(numbers[i], String(newVal));
            changes.push({ from: orig, to: newVal, factor: orig !== 0 ? newVal / orig : 1 });
        }

        if (changes.length === 0) return null;

        /* try to compute new answer */
        var newAnswer = correctAnswer;
        var canCompute = false;
        var ansNumMatch = correctAnswer.match(numRegex);
        if (ansNumMatch && ansNumMatch.length > 0) {
            var ansOrig = parseFloat(ansNumMatch[0]);
            var avgFactor = 1;
            var sumFactor = 0;
            var cntFactor = 0;
            for (var c = 0; c < changes.length; c++) {
                sumFactor += changes[c].factor;
                cntFactor++;
            }
            if (cntFactor > 0) avgFactor = sumFactor / cntFactor;
            var newAnsNum = Math.round(ansOrig * avgFactor * 100) / 100;
            newAnswer = correctAnswer.replace(ansNumMatch[0], String(newAnsNum));
            canCompute = true;
        }

        /* update options if multiple choice */
        var newOptions = [];
        for (var o = 0; o < options.length; o++) {
            var opt = options[o];
            var optNew = opt;
            var optNums = opt.match(numRegex) || [];
            for (var ci = 0; ci < changes.length; ci++) {
                for (var on = 0; on < optNums.length; on++) {
                    var onOrig = parseFloat(optNums[on]);
                    if (Math.abs(onOrig - changes[ci].from) < 0.001) {
                        optNew = optNew.replace(optNums[on], String(changes[ci].to));
                    }
                }
            }
            newOptions.push(optNew);
        }

        return {
            originalQuestion: q,
            originalAnswer: correctAnswer,
            originalOptions: options,
            variationQuestion: newQuestion,
            variationAnswer: newAnswer,
            variationOptions: newOptions,
            subject: subj,
            chapter: error.chapter || '',
            changes: changes,
            canCompute: canCompute
        };
    }

    function checkAnswer(userInput, variation) {
        if (!variation.canCompute) {
            return null; /* self-grade */
        }
        var correct = variation.variationAnswer || '';
        var userNum = parseFloat(userInput);
        var correctNum = parseFloat(correct);
        if (!isNaN(userNum) && !isNaN(correctNum)) {
            var tolerance = Math.max(Math.abs(correctNum * 0.03), 0.5);
            return Math.abs(userNum - correctNum) <= tolerance;
        }
        return userInput.trim().toLowerCase() === correct.trim().toLowerCase();
    }

    function buildVariations() {
        var errors = loadErrors();
        if (errors.length === 0) return [];

        var variations = [];
        for (var i = 0; i < errors.length; i++) {
            if (errors[i].mastered) continue; /* skip mastered */
            var v = generateVariation(errors[i]);
            if (v) {
                v.errorId = errors[i].id;
                variations.push(v);
            }
        }
        /* limit to 20 variations */
        if (variations.length > 20) variations = variations.slice(0, 20);
        return variations;
    }

    function startPractice() {
        state.variations = buildVariations();
        state.currentIdx = 0;
        state.correctCount = 0;
        state.totalCount = 0;
        state.answered = false;

        if (state.variations.length === 0) {
            var container = document.getElementById('error-variation-app');
            if (!container) return;
            var noData = '<div style="' + _ST.card + 'text-align:center;padding:40px;">';
            noData += '<div style="font-size:48px;margin-bottom:12px;">\u{1F4DD}</div>';
            noData += '<p style="font-size:16px;color:#666;">\u9519\u9898\u672C\u4E2D\u6CA1\u6709\u53EF\u7528\u7684\u672A\u638C\u63E1\u9519\u9898</p>';
            noData += '<p style="font-size:13px;color:#999;">\u8BF7\u5148\u5728\u9519\u9898\u672C\u4E2D\u6DFB\u52A0\u9519\u9898\uFF0C\u7136\u540E\u56DE\u6765\u7EC3\u4E60\u53D8\u5F0F</p>';
            noData += '</div>';
            container.innerHTML = noData;
            return;
        }

        renderCurrentVariation();
    }

    function renderCurrentVariation() {
        var container = document.getElementById('error-variation-app');
        if (!container) return;
        var v = state.variations[state.currentIdx];
        if (!v) {
            renderSummary();
            return;
        }

        var html = '';
        html += '<div style="' + _ST.card + '">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
        html += '<h2 style="margin:0;font-size:18px;color:#333;">\u53D8\u5F0F\u7EC3\u4E60</h2>';
        html += '<span style="font-size:13px;color:#999;">\u7B2C ' + (state.currentIdx + 1) + ' / ' + state.variations.length + ' \u9053</span>';
        html += '</div>';

        /* progress bar */
        var progress = state.variations.length > 0 ? (state.currentIdx / state.variations.length) * 100 : 0;
        html += '<div style="background:#f0f0f0;border-radius:4px;height:6px;margin-bottom:16px;overflow:hidden;">';
        html += '<div style="width:' + progress + '%;height:100%;background:#4a90e2;transition:width .3s;"></div></div>';

        /* score so far */
        html += '<div style="display:flex;gap:12px;margin-bottom:16px;">';
        html += '<span style="' + _ST.tag + 'background:#e6f7ff;color:#4a90e2;">\u6B63\u786E: ' + state.correctCount + '</span>';
        html += '<span style="' + _ST.tag + 'background:#fff1f0;color:#ff4d4f;">\u9519\u8BEF: ' + (state.totalCount - state.correctCount) + '</span>';
        html += '<span style="' + _ST.tag + 'background:#f6ffed;color:#52c41a;">\u5B66\u79D1: ' + SUBJECT_NAMES[v.subject] + '</span>';
        html += '</div>';

        /* variation question */
        html += '<div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-bottom:16px;">';
        html += '<div style="font-size:11px;color:#fa8c16;margin-bottom:8px;">\u2191 \u4EE5\u4E0B\u4E3A\u53D8\u5F0F\u9898\u76EE\uFF08\u6570\u503C\u5DF2\u4FEE\u6539\uFF09</div>';
        html += '<p style="font-size:15px;line-height:1.8;color:#333;margin:0;">' + _util.escapeHtml(v.variationQuestion) + '</p>';
        html += '</div>';

        /* options or input */
        if (v.variationOptions && v.variationOptions.length > 0) {
            html += '<div id="ev-options-area" style="margin-bottom:16px;">';
            for (var i = 0; i < v.variationOptions.length; i++) {
                var letter = String.fromCharCode(65 + i);
                html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;margin-bottom:6px;border:1px solid #e0e0e0;border-radius:6px;cursor:pointer;" class="ev-option" data-idx="' + i + '">';
                html += '<span style="font-weight:bold;color:#4a90e2;">' + letter + '.</span>';
                html += '<span style="font-size:14px;color:#555;">' + _util.escapeHtml(v.variationOptions[i]) + '</span>';
                html += '</div>';
            }
            html += '</div>';
        } else {
            html += '<div style="margin-bottom:16px;">';
            html += '<label style="' + _ST.label + '">\u4F60\u7684\u7B54\u6848</label>';
            html += '<input id="ev-answer-input" type="text" style="' + _ST.input + '" placeholder="\u8F93\u5165\u7B54\u6848...">';
            html += '</div>';
        }

        /* action buttons */
        if (!state.answered) {
            html += '<div id="ev-action-area">';
            html += '<button id="ev-submit-btn" style="' + _ST.btn + _ST.btnPrimary + '">\u63D0\u4EA4\u7B54\u6848</button>';
            if (!v.canCompute) {
                html += '<span style="margin-left:8px;font-size:12px;color:#fa8c16;">\u26A0 \u6B64\u9898\u65E0\u6CD5\u81EA\u52A8\u5224\u65AD\uFF0C\u8BF7\u81EA\u884C\u5BF9\u7167\u539F\u9898\u7B54\u6848</span>';
            }
            html += '</div>';
        }

        /* result area (filled after answering) */
        html += '<div id="ev-result-area"></div>';

        html += '</div>';

        container.innerHTML = html;

        /* attach listeners */
        var submitBtn = document.getElementById('ev-submit-btn');
        if (submitBtn) submitBtn.addEventListener('click', submitAnswer);

        var optionEls = container.getElementsByClassName('ev-option');
        for (var j = 0; j < optionEls.length; j++) {
            (function(el) {
                el.addEventListener('click', function() {
                    if (state.answered) return;
                    /* deselect others */
                    var siblings = container.getElementsByClassName('ev-option');
                    for (var k = 0; k < siblings.length; k++) {
                        siblings[k].style.borderColor = '#e0e0e0';
                        siblings[k].style.background = '#fff';
                    }
                    el.style.borderColor = '#4a90e2';
                    el.style.background = '#e6f7ff';
                    el.setAttribute('data-selected', 'true');
                });
            })(optionEls[j]);
        }
    }

    function submitAnswer() {
        var v = state.variations[state.currentIdx];
        if (!v || state.answered) return;
        state.answered = true;

        var userInput = '';
        var selectedOpt = null;
        var optionEls = document.getElementsByClassName('ev-option');
        if (optionEls.length > 0) {
            for (var i = 0; i < optionEls.length; i++) {
                if (optionEls[i].getAttribute('data-selected') === 'true') {
                    selectedOpt = parseInt(optionEls[i].getAttribute('data-idx'), 10);
                    userInput = v.variationOptions[selectedOpt];
                    break;
                }
            }
            if (selectedOpt === null) {
                var resultArea = document.getElementById('ev-result-area');
                if (resultArea) resultArea.innerHTML = '<div style="color:#ff4d4f;font-size:13px;">\u8BF7\u5148\u9009\u62E9\u4E00\u4E2A\u9009\u9879</div>';
                state.answered = false;
                return;
            }
        } else {
            var input = document.getElementById('ev-answer-input');
            userInput = input ? input.value : '';
            if (!userInput.trim()) {
                var resultArea2 = document.getElementById('ev-result-area');
                if (resultArea2) resultArea2.innerHTML = '<div style="color:#ff4d4f;font-size:13px;">\u8BF7\u8F93\u5165\u7B54\u6848</div>';
                state.answered = false;
                return;
            }
        }

        var isCorrect = checkAnswer(userInput, v);
        state.totalCount++;

        var resultHtml = '';
        if (isCorrect === true) {
            state.correctCount++;
            recordResult(v.subject, true);
            resultHtml += '<div style="background:#f6ffed;border:1px solid #b7eb84;padding:14px;border-radius:8px;margin-top:12px;">';
            resultHtml += '<div style="font-size:16px;color:#52c41a;font-weight:bold;margin-bottom:8px;">\u2714 \u7B54\u5BF9\u4E86\uFF01</div>';
        } else if (isCorrect === false) {
            recordResult(v.subject, false);
            resultHtml += '<div style="background:#fff1f0;border:1px solid #ffa39e;padding:14px;border-radius:8px;margin-top:12px;">';
            resultHtml += '<div style="font-size:16px;color:#ff4d4f;font-weight:bold;margin-bottom:8px;">\u2718 \u7B54\u9519\u4E86</div>';
        } else {
            /* self-grade */
            resultHtml += '<div style="background:#fffbe6;border:1px solid #ffe58f;padding:14px;border-radius:8px;margin-top:12px;">';
            resultHtml += '<div style="font-size:16px;color:#faad14;font-weight:bold;margin-bottom:8px;">\u8BF7\u81EA\u884C\u5224\u65AD</div>';
        }

        /* show original vs variation */
        resultHtml += '<div style="margin-top:10px;font-size:13px;">';
        resultHtml += '<div style="margin-bottom:6px;color:#666;"><b>\u539F\u9898:</b> ' + _util.escapeHtml(v.originalQuestion) + '</div>';
        resultHtml += '<div style="margin-bottom:6px;color:#666;"><b>\u539F\u7B54\u6848:</b> ' + _util.escapeHtml(v.originalAnswer) + '</div>';
        if (v.canCompute) {
            resultHtml += '<div style="margin-bottom:6px;color:#4a90e2;"><b>\u53D8\u5F0F\u53C2\u8003\u7B54\u6848:</b> ' + _util.escapeHtml(v.variationAnswer) + '</div>';
        }
        if (v.changes && v.changes.length > 0) {
            resultHtml += '<div style="margin-bottom:6px;color:#fa8c16;"><b>\u6570\u503C\u53D8\u5316:</b> ';
            for (var c = 0; c < v.changes.length; c++) {
                if (c > 0) resultHtml += ', ';
                resultHtml += v.changes[c].from + ' \u2192 ' + v.changes[c].to;
            }
            resultHtml += '</div>';
        }
        resultHtml += '</div>';

        /* self-grade buttons if needed */
        if (isCorrect === null) {
            resultHtml += '<div style="margin-top:10px;display:flex;gap:8px;">';
            resultHtml += '<button id="ev-self-correct" style="' + _ST.btn + _ST.btnSuccess + _ST.btnSm + '">\u6211\u7B54\u5BF9\u4E86</button>';
            resultHtml += '<button id="ev-self-wrong" style="' + _ST.btn + _ST.btnDanger + _ST.btnSm + '">\u6211\u7B54\u9519\u4E86</button>';
            resultHtml += '</div>';
        }

        resultHtml += '<button id="ev-next-btn" style="' + _ST.btn + _ST.btnPrimary + ';margin-top:12px;">' + (state.currentIdx < state.variations.length - 1 ? '\u4E0B\u4E00\u9053 \u2192' : '\u67E5\u770B\u7ED3\u679C') + '</button>';
        resultHtml += '</div>';

        var resultArea = document.getElementById('ev-result-area');
        if (resultArea) resultArea.innerHTML = resultHtml;

        /* hide submit area */
        var actionArea = document.getElementById('ev-action-area');
        if (actionArea) actionArea.style.display = 'none';

        /* attach next button */
        var nextBtn = document.getElementById('ev-next-btn');
        if (nextBtn) nextBtn.addEventListener('click', nextVariation);

        /* attach self-grade buttons */
        var selfCorrect = document.getElementById('ev-self-correct');
        if (selfCorrect) selfCorrect.addEventListener('click', function() {
            state.correctCount++;
            recordResult(v.subject, true);
            selfCorrect.disabled = true;
            selfCorrect.style.opacity = '0.5';
            var sw = document.getElementById('ev-self-wrong');
            if (sw) { sw.disabled = true; sw.style.opacity = '0.5'; }
        });
        var selfWrong = document.getElementById('ev-self-wrong');
        if (selfWrong) selfWrong.addEventListener('click', function() {
            recordResult(v.subject, false);
            selfWrong.disabled = true;
            selfWrong.style.opacity = '0.5';
            var sc = document.getElementById('ev-self-correct');
            if (sc) { sc.disabled = true; sc.style.opacity = '0.5'; }
        });
    }

    function nextVariation() {
        state.currentIdx++;
        state.answered = false;
        if (state.currentIdx >= state.variations.length) {
            renderSummary();
        } else {
            renderCurrentVariation();
        }
    }

    function renderSummary() {
        var container = document.getElementById('error-variation-app');
        if (!container) return;
        var stats = loadStats();
        var accuracy = state.totalCount > 0 ? Math.round(state.correctCount / state.totalCount * 100) : 0;
        var overallAcc = stats.totalAttempts > 0 ? Math.round(stats.totalCorrect / stats.totalAttempts * 100) : 0;

        var html = '';
        html += '<div style="' + _ST.card + 'text-align:center;padding:40px;">';
        html += '<h2 style="margin:0 0 20px;font-size:22px;color:#333;">\u7EC3\u4E60\u5B8C\u6210\uFF01</h2>';
        html += '<div style="font-size:48px;font-weight:bold;color:' + (accuracy >= 60 ? '#52c41a' : '#fa8c16') + ';">' + accuracy + '%</div>';
        html += '<p style="font-size:14px;color:#666;margin:8px 0 20px;">\u672C\u6B21\u6B63\u786E\u7387</p>';
        html += '<div style="display:flex;justify-content:center;gap:24px;margin-bottom:24px;">';
        html += '<div><div style="font-size:24px;font-weight:bold;color:#52c41a;">' + state.correctCount + '</div><div style="font-size:12px;color:#999;">\u6B63\u786E</div></div>';
        html += '<div><div style="font-size:24px;font-weight:bold;color:#ff4d4f;">' + (state.totalCount - state.correctCount) + '</div><div style="font-size:12px;color:#999;">\u9519\u8BEF</div></div>';
        html += '<div><div style="font-size:24px;font-weight:bold;color:#4a90e2;">' + state.totalCount + '</div><div style="font-size:12px;color:#999;">\u603B\u8BA1</div></div>';
        html += '</div>';

        /* overall stats */
        html += '<div style="background:#f5f5f5;padding:12px;border-radius:8px;margin-bottom:20px;font-size:13px;color:#666;">';
        html += '\u5386\u53F2\u53D8\u5F0F\u7EC3\u4E60: ' + stats.totalAttempts + ' \u6B21\uFF0C\u603B\u6B63\u786E\u7387: ' + overallAcc + '%';
        html += '</div>';

        /* by subject */
        if (stats.bySubject) {
            var keys = Object.keys(stats.bySubject);
            if (keys.length > 0) {
                html += '<div style="margin-bottom:20px;"><h3 style="font-size:14px;color:#555;margin:0 0 8px;">\u5404\u5B66\u79D1\u53D8\u5F0F\u6B63\u786E\u7387</h3>';
                for (var i = 0; i < keys.length; i++) {
                    var s = stats.bySubject[keys[i]];
                    var acc = s.total > 0 ? Math.round(s.correct / s.total * 100) : 0;
                    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">';
                    html += '<span style="width:50px;font-size:13px;">' + (SUBJECT_NAMES[keys[i]] || keys[i]) + '</span>';
                    html += '<div style="flex:1;background:#f0f0f0;border-radius:4px;height:18px;overflow:hidden;">';
                    html += '<div style="width:' + acc + '%;height:100%;background:' + (acc >= 60 ? '#52c41a' : '#fa8c16') + ';"></div></div>';
                    html += '<span style="width:60px;font-size:12px;color:#666;">' + s.correct + '/' + s.total + ' (' + acc + '%)</span>';
                    html += '</div>';
                }
                html += '</div>';
            }
        }

        html += '<button id="ev-restart-btn" style="' + _ST.btn + _ST.btnPrimary + '">\u518D\u6B21\u7EC3\u4E60</button>';
        html += '</div>';

        container.innerHTML = html;

        var restartBtn = document.getElementById('ev-restart-btn');
        if (restartBtn) restartBtn.addEventListener('click', startPractice);
    }

    function render() {
        var container = document.getElementById('error-variation-app');
        if (!container) return;
        state.variations = [];
        state.currentIdx = 0;
        state.correctCount = 0;
        state.totalCount = 0;
        state.answered = false;

        var errors = loadErrors();
        var unmastered = 0;
        for (var i = 0; i < errors.length; i++) {
            if (!errors[i].mastered) unmastered++;
        }

        var stats = loadStats();
        var overallAcc = stats.totalAttempts > 0 ? Math.round(stats.totalCorrect / stats.totalAttempts * 100) : 0;

        var html = '';
        html += '<div style="' + _ST.card + 'text-align:center;padding:32px;">';
        html += '<h2 style="margin:0 0 16px;font-size:20px;color:#333;">\u9519\u9898\u53D8\u5F0F\u7EC3\u4E60</h2>';
        html += '<p style="font-size:14px;color:#666;line-height:1.8;margin-bottom:16px;">\u4ECE\u9519\u9898\u672C\u4E2D\u8BFB\u53D6\u672A\u638C\u63E1\u7684\u9519\u9898\uFF0C\u81EA\u52A8\u4FEE\u6539\u6570\u503C\u751F\u6210\u53D8\u5F0F\u9898\u76EE\uFF0C\u5E2E\u52A9\u4F60\u53CD\u590D\u7EC3\u4E60\u540C\u7C7B\u9898\u578B</p>';

        html += '<div style="display:flex;justify-content:center;gap:16px;margin-bottom:24px;">';
        html += '<div style="background:#e6f7ff;padding:12px 24px;border-radius:8px;text-align:center;">';
        html += '<div style="font-size:28px;font-weight:bold;color:#4a90e2;">' + unmastered + '</div>';
        html += '<div style="font-size:12px;color:#666;">\u672A\u638C\u63E1\u9519\u9898</div>';
        html += '</div>';
        html += '<div style="background:#f6ffed;padding:12px 24px;border-radius:8px;text-align:center;">';
        html += '<div style="font-size:28px;font-weight:bold;color:#52c41a;">' + overallAcc + '%</div>';
        html += '<div style="font-size:12px;color:#666;">\u5386\u53F2\u6B63\u786E\u7387</div>';
        html += '</div>';
        html += '</div>';

        if (unmastered === 0) {
            html += '<div style="background:#fffbe6;padding:16px;border-radius:8px;font-size:14px;color:#fa8c16;margin-bottom:16px;">';
            html += '\u9519\u9898\u672C\u4E2D\u6CA1\u6709\u672A\u638C\u63E1\u7684\u9519\u9898\uFF0C\u8BF7\u5148\u53BB\u505A\u9898\u5E76\u8BB0\u5F55\u9519\u9898</div>';
        } else {
            html += '<button id="ev-start-btn" style="' + _ST.btn + _ST.btnPrimary + ';font-size:16px;padding:12px 32px;">\u5F00\u59CB\u53D8\u5F0F\u7EC3\u4E60</button>';
        }
        html += '</div>';

        container.innerHTML = html;

        var startBtn = document.getElementById('ev-start-btn');
        if (startBtn) startBtn.addEventListener('click', startPractice);
    }

    return {
        render: render,
        generateVariation: generateVariation,
        startPractice: startPractice
    };
})();

/* ============================================================
   MODULE 5: noteSystem
   ============================================================ */
window.noteSystem = (function() {
    'use strict';

    var STORAGE_KEY = 'hspcb_notes';
    var SUBJECTS = ['\u7269\u7406', '\u5316\u5B66', '\u751F\u7269', '\u8BED\u6587', '\u6570\u5B66', '\u82F1\u8BED', '\u5176\u4ED6'];

    var editingId = null;

    function loadData() {
        var data = _util.loadJson(STORAGE_KEY, []);
        if (!Array.isArray(data)) return [];
        return data;
    }

    function saveData(notes) {
        _util.saveJson(STORAGE_KEY, notes);
    }

    function addNote(subject, topic, content) {
        var notes = loadData();
        var note = {
            id: _util.genId('note'),
            subject: subject,
            topic: topic || '',
            content: content || '',
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };
        notes.unshift(note);
        saveData(notes);
        return note;
    }

    function updateNote(id, subject, topic, content) {
        var notes = loadData();
        for (var i = 0; i < notes.length; i++) {
            if (notes[i].id === id) {
                notes[i].subject = subject;
                notes[i].topic = topic;
                notes[i].content = content;
                notes[i].updated = new Date().toISOString();
                saveData(notes);
                return notes[i];
            }
        }
        return null;
    }

    function deleteNote(id) {
        var notes = loadData();
        var filtered = [];
        for (var i = 0; i < notes.length; i++) {
            if (notes[i].id !== id) filtered.push(notes[i]);
        }
        saveData(filtered);
    }

    /* ===== Simple Markdown Renderer ===== */

    function inlineFormat(text) {
        var t = _util.escapeHtml(text);
        /* bold */
        t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        /* inline code */
        t = t.replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 5px;border-radius:3px;font-size:13px;">$1</code>');
        return t;
    }

    function renderMarkdown(text) {
        if (!text) return '';
        var lines = text.split('\n');
        var html = '';
        var inList = false;
        var inCode = false;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var trimmed = line.replace(/^\s+/, '');

            /* code block toggle */
            if (trimmed.indexOf('```') === 0) {
                if (inCode) {
                    html += '</code></pre>';
                    inCode = false;
                } else {
                    if (inList) { html += '</ul>'; inList = false; }
                    html += '<pre style="background:#f5f5f5;padding:12px;border-radius:6px;overflow-x:auto;margin:8px 0;"><code style="font-size:13px;">';
                    inCode = true;
                }
                continue;
            }
            if (inCode) {
                html += _util.escapeHtml(line) + '\n';
                continue;
            }

            /* headers */
            if (trimmed.indexOf('### ') === 0) {
                if (inList) { html += '</ul>'; inList = false; }
                html += '<h3 style="margin:10px 0 5px;font-size:15px;color:#333;">' + inlineFormat(trimmed.slice(4)) + '</h3>';
            } else if (trimmed.indexOf('## ') === 0) {
                if (inList) { html += '</ul>'; inList = false; }
                html += '<h2 style="margin:12px 0 6px;font-size:17px;color:#333;">' + inlineFormat(trimmed.slice(3)) + '</h2>';
            } else if (trimmed.indexOf('# ') === 0) {
                if (inList) { html += '</ul>'; inList = false; }
                html += '<h1 style="margin:14px 0 8px;font-size:19px;color:#333;">' + inlineFormat(trimmed.slice(2)) + '</h1>';
            } else if (trimmed.charAt(0) === '-' || trimmed.charAt(0) === '*') {
                if (trimmed.charAt(1) === ' ') {
                    if (!inList) { html += '<ul style="margin:5px 0;padding-left:20px;">'; inList = true; }
                    html += '<li style="margin:3px 0;font-size:14px;line-height:1.6;">' + inlineFormat(trimmed.slice(2)) + '</li>';
                } else {
                    if (inList) { html += '</ul>'; inList = false; }
                    html += '<p style="margin:5px 0;font-size:14px;line-height:1.6;">' + inlineFormat(line) + '</p>';
                }
            } else if (trimmed === '') {
                if (inList) { html += '</ul>'; inList = false; }
                html += '<br>';
            } else {
                if (inList) { html += '</ul>'; inList = false; }
                html += '<p style="margin:5px 0;font-size:14px;line-height:1.6;">' + inlineFormat(line) + '</p>';
            }
        }
        if (inList) html += '</ul>';
        if (inCode) html += '</code></pre>';
        return html;
    }

    function getFilteredNotes(keyword, subject) {
        var notes = loadData();
        var result = [];
        var kw = (keyword || '').toLowerCase();
        for (var i = 0; i < notes.length; i++) {
            var n = notes[i];
            if (subject && subject !== 'all' && n.subject !== subject) continue;
            if (kw) {
                var inTopic = (n.topic || '').toLowerCase().indexOf(kw) !== -1;
                var inContent = (n.content || '').toLowerCase().indexOf(kw) !== -1;
                if (!inTopic && !inContent) continue;
            }
            result.push(n);
        }
        return result;
    }

    function exportNotes() {
        var notes = loadData();
        var json = JSON.stringify(notes, null, 2);
        try {
            var blob = new Blob([json], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'hspcb_notes_' + _util.todayStr() + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            /* fallback for older browsers */
            var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(json);
            var a2 = document.createElement('a');
            a2.href = dataStr;
            a2.download = 'hspcb_notes_' + _util.todayStr() + '.json';
            document.body.appendChild(a2);
            a2.click();
            document.body.removeChild(a2);
        }
    }

    function submitNote() {
        var subjectEl = document.getElementById('note-subject-select');
        var topicEl = document.getElementById('note-topic-input');
        var contentEl = document.getElementById('note-content-input');

        var subject = subjectEl ? subjectEl.value : SUBJECTS[0];
        var topic = topicEl ? topicEl.value.trim() : '';
        var content = contentEl ? contentEl.value.trim() : '';

        if (!content) {
            var msg = document.getElementById('note-form-msg');
            if (msg) {
                msg.textContent = '\u8BF7\u8F93\u5165\u7B14\u8BB0\u5185\u5BB9';
                msg.style.color = '#ff4d4f';
            }
            return;
        }

        if (editingId) {
            updateNote(editingId, subject, topic, content);
            editingId = null;
        } else {
            addNote(subject, topic, content);
        }

        /* reset form */
        if (topicEl) topicEl.value = '';
        if (contentEl) contentEl.value = '';
        var submitBtn = document.getElementById('note-submit-btn');
        if (submitBtn) submitBtn.textContent = '\u6DFB\u52A0\u7B14\u8BB0';
        var cancelBtn = document.getElementById('note-cancel-btn');
        if (cancelBtn) cancelBtn.style.display = 'none';

        renderNoteList();
    }

    function startEdit(id) {
        var notes = loadData();
        var note = null;
        for (var i = 0; i < notes.length; i++) {
            if (notes[i].id === id) { note = notes[i]; break; }
        }
        if (!note) return;

        editingId = id;
        var subjectEl = document.getElementById('note-subject-select');
        var topicEl = document.getElementById('note-topic-input');
        var contentEl = document.getElementById('note-content-input');

        if (subjectEl) subjectEl.value = note.subject;
        if (topicEl) topicEl.value = note.topic || '';
        if (contentEl) contentEl.value = note.content || '';

        var submitBtn = document.getElementById('note-submit-btn');
        if (submitBtn) submitBtn.textContent = '\u66F4\u65B0\u7B14\u8BB0';
        var cancelBtn = document.getElementById('note-cancel-btn');
        if (cancelBtn) cancelBtn.style.display = 'inline-block';

        if (contentEl) contentEl.focus();
    }

    function cancelEdit() {
        editingId = null;
        var topicEl = document.getElementById('note-topic-input');
        var contentEl = document.getElementById('note-content-input');
        if (topicEl) topicEl.value = '';
        if (contentEl) contentEl.value = '';
        var submitBtn = document.getElementById('note-submit-btn');
        if (submitBtn) submitBtn.textContent = '\u6DFB\u52A0\u7B14\u8BB0';
        var cancelBtn = document.getElementById('note-cancel-btn');
        if (cancelBtn) cancelBtn.style.display = 'none';
    }

    function removeNote(id) {
        if (!confirm('\u786E\u5B9A\u5220\u9664\u8FD9\u6761\u7B14\u8BB0\u5417\uFF1F')) return;
        deleteNote(id);
        if (editingId === id) cancelEdit();
        renderNoteList();
    }

    function renderNoteList() {
        var container = document.getElementById('note-list');
        if (!container) return;

        var searchEl = document.getElementById('note-search-input');
        var filterEl = document.getElementById('note-filter-select');
        var keyword = searchEl ? searchEl.value : '';
        var subject = filterEl ? filterEl.value : 'all';

        var notes = getFilteredNotes(keyword, subject);

        var countEl = document.getElementById('note-count');
        if (countEl) countEl.textContent = notes.length;

        if (notes.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:30px;color:#999;font-size:14px;">\u{1F4DD} \u8FD8\u6CA1\u6709\u7B14\u8BB0\uFF0C\u5F00\u59CB\u8BB0\u5F55\u5427\uFF01</div>';
            return;
        }

        var html = '';
        for (var i = 0; i < notes.length; i++) {
            var n = notes[i];
            var isEditing = (editingId === n.id);
            html += '<div style="background:' + (isEditing ? '#e6f7ff' : '#fafafa') + ';border:1px solid ' + (isEditing ? '#4a90e2' : '#eee') + ';border-radius:8px;padding:14px;margin-bottom:10px;">';
            html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">';
            html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
            html += '<span style="' + _ST.tag + 'background:#e6f7ff;color:#4a90e2;font-weight:bold;">' + _util.escapeHtml(n.subject) + '</span>';
            if (n.topic) {
                html += '<span style="' + _ST.tag + 'background:#f6ffed;color:#52c41a;">' + _util.escapeHtml(n.topic) + '</span>';
            }
            html += '</div>';
            html += '<div style="display:flex;gap:6px;flex-shrink:0;">';
            html += '<button onclick="window.noteSystem._startEdit(\'' + n.id + '\')" style="' + _ST.btn + _ST.btnWarning + _ST.btnSm + '">\u7F16\u8F91</button>';
            html += '<button onclick="window.noteSystem._removeNote(\'' + n.id + '\')" style="' + _ST.btn + _ST.btnDanger + _ST.btnSm + '">\u5220\u9664</button>';
            html += '</div>';
            html += '</div>';
            html += '<div style="font-size:14px;line-height:1.7;color:#444;">' + renderMarkdown(n.content) + '</div>';
            html += '<div style="font-size:11px;color:#bbb;margin-top:8px;">' + (n.updated || n.created || '').slice(0, 16).replace('T', ' ') + '</div>';
            html += '</div>';
        }
        container.innerHTML = html;
    }

    function render() {
        var container = document.getElementById('note-system-app');
        if (!container) return;
        editingId = null;

        var subjectOpts = '<option value="all">\u5168\u90E8\u5B66\u79D1</option>';
        for (var i = 0; i < SUBJECTS.length; i++) {
            subjectOpts += '<option value="' + SUBJECTS[i] + '">' + SUBJECTS[i] + '</option>';
        }

        var subjectOptsForm = '';
        for (var j = 0; j < SUBJECTS.length; j++) {
            subjectOptsForm += '<option value="' + SUBJECTS[j] + '"' + (j === 0 ? ' selected' : '') + '>' + SUBJECTS[j] + '</option>';
        }

        var html = '';
        html += '<div style="' + _ST.card + '">';
        html += '<h2 style="margin:0 0 16px;font-size:20px;color:#333;">\u5B66\u4E60\u7B14\u8BB0</h2>';

        /* editor form */
        html += '<div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-bottom:16px;">';
        html += '<div style="' + _ST.flexRow + 'margin-bottom:10px;">';
        html += '<div style="flex:0 0 120px;"><label style="' + _ST.label + '">\u5B66\u79D1</label>';
        html += '<select id="note-subject-select" style="' + _ST.select + 'width:100%;">' + subjectOptsForm + '</select></div>';
        html += '<div style="flex:1;"><label style="' + _ST.label + '">\u77E5\u8BC6\u70B9</label>';
        html += '<input id="note-topic-input" type="text" style="' + _ST.input + '" placeholder="\u5982: \u4E8C\u6B21\u51FD\u6570"></div>';
        html += '</div>';
        html += '<div><label style="' + _ST.label + '">\u5185\u5BB9\uFF08\u652F\u6301 Markdown: # \u6807\u9898, **\u52A0\u7C97**, - \u5217\u8868, ```\u4EE3\u7801\u5757```\uFF09</label>';
        html += '<textarea id="note-content-input" style="' + _ST.input + 'min-height:120px;resize:vertical;font-family:inherit;" placeholder="\u5728\u6B64\u8F93\u5165\u7B14\u8BB0\u5185\u5BB9..."></textarea></div>';
        html += '<div style="margin-top:10px;display:flex;gap:8px;align-items:center;">';
        html += '<button id="note-submit-btn" style="' + _ST.btn + _ST.btnPrimary + '">\u6DFB\u52A0\u7B14\u8BB0</button>';
        html += '<button id="note-cancel-btn" style="' + _ST.btn + _ST.btnGray + _ST.btnSm + ';display:none;">\u53D6\u6D88\u7F16\u8F91</button>';
        html += '<span id="note-form-msg" style="font-size:13px;"></span>';
        html += '</div>';
        html += '</div>';

        /* search and filter bar */
        html += '<div style="' + _ST.flexRow + 'margin-bottom:12px;">';
        html += '<input id="note-search-input" type="text" style="' + _ST.input + 'flex:1;" placeholder="\u641C\u7D22\u7B14\u8BB0...">';
        html += '<select id="note-filter-select" style="' + _ST.select + 'width:140px;">' + subjectOpts + '</select>';
        html += '<button id="note-export-btn" style="' + _ST.btn + _ST.btnSuccess + _ST.btnSm + '">\u5BFC\u51FA JSON</button>';
        html += '</div>';

        /* note count */
        html += '<div style="font-size:13px;color:#999;margin-bottom:8px;">\u5171 <span id="note-count">0</span> \u6761\u7B14\u8BB0</div>';

        /* note list */
        html += '<div id="note-list"></div>';

        html += '</div>';

        container.innerHTML = html;

        /* attach listeners */
        var submitBtn = document.getElementById('note-submit-btn');
        if (submitBtn) submitBtn.addEventListener('click', submitNote);
        var cancelBtn = document.getElementById('note-cancel-btn');
        if (cancelBtn) cancelBtn.addEventListener('click', cancelEdit);
        var exportBtn = document.getElementById('note-export-btn');
        if (exportBtn) exportBtn.addEventListener('click', exportNotes);

        var searchInput = document.getElementById('note-search-input');
        if (searchInput) {
            var searchTimer = null;
            searchInput.addEventListener('input', function() {
                if (searchTimer) clearTimeout(searchTimer);
                searchTimer = setTimeout(renderNoteList, 200);
            });
        }
        var filterSelect = document.getElementById('note-filter-select');
        if (filterSelect) filterSelect.addEventListener('change', renderNoteList);

        /* keyboard shortcut: Ctrl+Enter to submit */
        var contentInput = document.getElementById('note-content-input');
        if (contentInput) {
            contentInput.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && e.keyCode === 13) {
                    submitNote();
                }
            });
        }

        renderNoteList();
    }

    /* expose edit/delete for inline onclick handlers */
    return {
        render: render,
        _startEdit: startEdit,
        _removeNote: removeNote,
        _renderNoteList: renderNoteList,
        addNote: addNote,
        updateNote: updateNote,
        deleteNote: deleteNote,
        renderMarkdown: renderMarkdown
    };
})();

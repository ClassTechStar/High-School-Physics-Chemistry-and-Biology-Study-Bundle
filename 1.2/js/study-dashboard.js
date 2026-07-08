// ============================================================
// js/study-dashboard.js — 学习数据仪表盘
// ============================================================
window.studyDashboard = (function() {
    'use strict';

    function gatherData() {
        var data = {
            examHistory: [],
            errorNotebook: [],
            gameScores: [],
            recitationScores: []
        };

        try {
            // Mock exam history
            var examRaw = localStorage.getItem('hspcb_exam_history');
            if (examRaw) data.examHistory = JSON.parse(examRaw);
            if (!Array.isArray(data.examHistory)) data.examHistory = [];

            // Error notebook
            var errorsRaw = localStorage.getItem('hspcb_error_notebook');
            if (errorsRaw) data.errorNotebook = JSON.parse(errorsRaw);
            if (!Array.isArray(data.errorNotebook)) data.errorNotebook = [];

            // Game scores
            var gameRaw = localStorage.getItem('hspcb_game_scores');
            if (gameRaw) data.gameScores = JSON.parse(gameRaw);
            if (!Array.isArray(data.gameScores)) data.gameScores = [];

            // Recitation scores
            var recRaw = localStorage.getItem('hspcb_recitation_scores');
            if (recRaw) data.recitationScores = JSON.parse(recRaw);
            if (!Array.isArray(data.recitationScores)) data.recitationScores = [];
        } catch (e) {
            // Ignore parse errors
        }

        return data;
    }

    function getTotalQuestions(data) {
        var total = 0;
        if (Array.isArray(data.examHistory)) {
            for (var i = 0; i < data.examHistory.length; i++) {
                var e = data.examHistory[i];
                total += (e.totalQuestions || e.total || 0);
            }
        }
        if (Array.isArray(data.gameScores)) {
            for (var j = 0; j < data.gameScores.length; j++) {
                var g = data.gameScores[j];
                total += (g.questions || g.total || 0);
            }
        }
        return total;
    }

    function getAccuracyTrend(data) {
        var trend = [];
        var source = data.examHistory;
        if (source.length === 0) {
            // Create mock trend from other sources
            var allItems = [];
            if (Array.isArray(data.gameScores)) allItems = allItems.concat(data.gameScores);
            if (Array.isArray(data.recitationScores)) allItems = allItems.concat(data.recitationScores);
            source = allItems;
        }
        for (var i = Math.max(0, source.length - 10); i < source.length; i++) {
            var item = source[i];
            var correct = item.correct || item.score || 0;
            var total = item.totalQuestions || item.total || 1;
            var acc = total > 0 ? (correct / total * 100) : 0;
            trend.push({
                label: item.date || item.subject || ('#' + (i + 1)),
                accuracy: Math.round(acc)
            });
        }
        return trend;
    }

    function getSubjectBreakdown(data) {
        var subjects = {};
        var allItems = [];
        if (Array.isArray(data.examHistory)) allItems = allItems.concat(data.examHistory);
        if (Array.isArray(data.gameScores)) allItems = allItems.concat(data.gameScores);
        if (Array.isArray(data.errorNotebook)) allItems = allItems.concat(data.errorNotebook);

        for (var i = 0; i < allItems.length; i++) {
            var item = allItems[i];
            var subj = item.subject || '\u672A\u5206\u7C7B';
            if (!subjects[subj]) subjects[subj] = 0;
            subjects[subj] += (item.totalQuestions || item.total || 1);
        }

        if (Object.keys(subjects).length === 0) {
            subjects = { '\u6570\u5B66': 0, '\u7269\u7406': 0, '\u5316\u5B66': 0, '\u751F\u7269': 0 };
        }
        return subjects;
    }

    function getRecentActivity(data) {
        var activities = [];
        var allItems = [];

        var pushItems = function(arr, type) {
            if (!Array.isArray(arr)) return;
            for (var i = arr.length - 1; i >= Math.max(0, arr.length - 15); i--) {
                allItems.push({ item: arr[i], type: type });
            }
        };

        pushItems(data.examHistory, '\u6A21\u62DF\u8003\u8BD5');
        pushItems(data.gameScores, '\u6E38\u620F');
        pushItems(data.recitationScores, '\u80CC\u8BF5');

        // Sort by recency
        allItems.sort(function(a, b) {
            var da = a.item.date || a.item.timestamp || '';
            var db = b.item.date || b.item.timestamp || '';
            return db.localeCompare(da);
        });

        for (var j = 0; j < Math.min(8, allItems.length); j++) {
            var entry = allItems[j];
            var score = entry.item.score || entry.item.correct || 0;
            var total = entry.item.totalQuestions || entry.item.total || 1;
            activities.push({
                type: entry.type,
                subject: entry.item.subject || '',
                detail: score + '/' + total,
                date: entry.item.date || ''
            });
        }

        if (activities.length === 0) {
            activities.push({
                type: '\u63D0\u793A',
                subject: '',
                detail: '\u8FD8\u6CA1\u6709\u6570\u636E\uFF0C\u5FEB\u53BB\u505A\u9898\u5427\uFF01',
                date: ''
            });
        }
        return activities;
    }

    function hasAnyData(data) {
        return (Array.isArray(data.examHistory) && data.examHistory.length > 0) ||
               (Array.isArray(data.errorNotebook) && data.errorNotebook.length > 0) ||
               (Array.isArray(data.gameScores) && data.gameScores.length > 0) ||
               (Array.isArray(data.recitationScores) && data.recitationScores.length > 0);
    }

    function drawBarChart(canvasId, data, labels) {
        var canvas = document.getElementById(canvasId);
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        if (!data || data.length === 0) {
            ctx.fillStyle = '#999'; ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('\u6682\u65E0\u6570\u636E', w / 2, h / 2);
            return;
        }

        var margin = { top: 20, right: 20, bottom: 50, left: 45 };
        var plotW = w - margin.left - margin.right;
        var plotH = h - margin.top - margin.bottom;

        var maxVal = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i] > maxVal) maxVal = data[i];
        }
        if (maxVal === 0) maxVal = 100;
        maxVal = Math.ceil(maxVal / 20) * 20;

        var barW = Math.max(8, Math.min(40, plotW / data.length - 6));
        var xStep = plotW / data.length;

        // Grid
        ctx.strokeStyle = '#eee'; ctx.lineWidth = 1;
        for (var gy = 0; gy <= maxVal; gy += 20) {
            var py = margin.top + plotH - (gy / maxVal) * plotH;
            ctx.beginPath(); ctx.moveTo(margin.left, py); ctx.lineTo(w - margin.right, py); ctx.stroke();
            ctx.fillStyle = '#999'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
            ctx.fillText(gy + '%', margin.left - 6, py + 4);
        }

        // Axes
        ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(margin.left, margin.top); ctx.lineTo(margin.left, margin.top + plotH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(margin.left, margin.top + plotH); ctx.lineTo(w - margin.right, margin.top + plotH); ctx.stroke();

        // Bars
        for (var j = 0; j < data.length; j++) {
            var val = data[j];
            var barH = (val / maxVal) * plotH;
            var x = margin.left + j * xStep + (xStep - barW) / 2;
            var y = margin.top + plotH - barH;

            var gradient = ctx.createLinearGradient(x, y, x, margin.top + plotH);
            gradient.addColorStop(0, '#3b82f6');
            gradient.addColorStop(1, '#93c5fd');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barW, barH);

            // Value on top
            ctx.fillStyle = '#333'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(val + '%', x + barW / 2, y - 4);

            // Label below
            if (labels && labels[j]) {
                ctx.fillStyle = '#666'; ctx.font = '9px sans-serif';
                ctx.save();
                ctx.translate(x + barW / 2, margin.top + plotH + 12);
                ctx.rotate(-0.5);
                ctx.fillText(labels[j], 0, 0);
                ctx.restore();
            }
        }
    }

    function drawPieChart(canvasId, subjects) {
        var canvas = document.getElementById(canvasId);
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        var keys = Object.keys(subjects);
        if (keys.length === 0) {
            ctx.fillStyle = '#999'; ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('\u6682\u65E0\u6570\u636E', w / 2, h / 2);
            return;
        }

        var colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];
        var total = 0;
        for (var k = 0; k < keys.length; k++) {
            total += subjects[keys[k]];
        }
        if (total === 0) {
            // Draw empty with equal slices for demo
            total = keys.length;
            for (var k2 = 0; k2 < keys.length; k2++) subjects[keys[k2]] = 1;
        }

        var cx = w / 2, cy = h / 2, radius = Math.min(w, h) / 2 - 50;
        var startAngle = -Math.PI / 2;

        for (var i = 0; i < keys.length; i++) {
            var sliceAngle = (subjects[keys[i]] / total) * Math.PI * 2;
            var color = colors[i % colors.length];

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();

            // Stroke
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
            ctx.stroke();

            // Label
            var midAngle = startAngle + sliceAngle / 2;
            var labelX = cx + Math.cos(midAngle) * (radius + 30);
            var labelY = cy + Math.sin(midAngle) * (radius + 30);
            ctx.fillStyle = '#333'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(keys[i], labelX, labelY - 6);
            ctx.fillText('(' + subjects[keys[i]] + '\u9898)', labelX, labelY + 8);

            startAngle += sliceAngle;
        }

        // Center hole (donut style)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('\u603B\u8BA1', cx, cy - 6);
        ctx.fillText(total + '\u9898', cx, cy + 16);
    }

    function render() {
        var container = document.getElementById('study-dashboard-app');
        if (!container) return;

        var data = gatherData();
        var totalQuestions = getTotalQuestions(data);
        var studyMinutes = Math.max(0, Math.floor(totalQuestions * 1.5));
        var accuracyTrend = getAccuracyTrend(data);
        var subjectBreakdown = getSubjectBreakdown(data);
        var recentActivity = getRecentActivity(data);
        var hasData = hasAnyData(data);

        var accuracyValues = [];
        var accuracyLabels = [];
        for (var i = 0; i < accuracyTrend.length; i++) {
            accuracyValues.push(accuracyTrend[i].accuracy);
            accuracyLabels.push(accuracyTrend[i].label);
        }

        container.innerHTML = '<div class="tool-app-container" style="padding:16px;">' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px;">' +
            '<div style="background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;border-radius:12px;padding:16px;text-align:center;">' +
            '<div style="font-size:12px;opacity:0.85;">\u7D2F\u8BA1\u5B66\u4E60\u65F6\u957F</div>' +
            '<div style="font-size:28px;font-weight:bold;margin:6px 0;">' + studyMinutes + '</div>' +
            '<div style="font-size:11px;opacity:0.75;">\u5206\u949F (\u4F30\u7B97)</div></div>' +
            '<div style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border-radius:12px;padding:16px;text-align:center;">' +
            '<div style="font-size:12px;opacity:0.85;">\u5DF2\u7B54\u9898\u76EE</div>' +
            '<div style="font-size:28px;font-weight:bold;margin:6px 0;">' + totalQuestions + '</div>' +
            '<div style="font-size:11px;opacity:0.75;">\u9898</div></div>' +
            '<div style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border-radius:12px;padding:16px;text-align:center;">' +
            '<div style="font-size:12px;opacity:0.85;">\u9519\u9898\u672C</div>' +
            '<div style="font-size:28px;font-weight:bold;margin:6px 0;">' + (data.errorNotebook.length || 0) + '</div>' +
            '<div style="font-size:11px;opacity:0.75;">\u6761\u8BB0\u5F55</div></div>' +
            '<div style="background:linear-gradient(135deg,#ec4899,#db2777);color:#fff;border-radius:12px;padding:16px;text-align:center;">' +
            '<div style="font-size:12px;opacity:0.85;">\u5B66\u4E60\u6B21\u6570</div>' +
            '<div style="font-size:28px;font-weight:bold;margin:6px 0;">' + (data.examHistory.length + data.gameScores.length) + '</div>' +
            '<div style="font-size:11px;opacity:0.75;">\u6B21</div></div>' +
            '</div>';

        if (!hasData) {
            container.innerHTML += '<div style="text-align:center;padding:30px;background:#fefce8;border-radius:12px;border:2px dashed #facc15;">' +
                '<div style="font-size:16px;color:#92400e;margin-bottom:8px;">\uD83D\uDCDA \u8FD8\u6CA1\u6709\u5B66\u4E60\u6570\u636E</div>' +
                '<div style="font-size:13px;color:#a16207;">\u5F00\u59CB\u4F7F\u7528\u5DE5\u5177\u540E\uFF0C\u8FD9\u91CC\u5C06\u5C55\u793A\u4F60\u7684\u5B66\u4E60\u6570\u636E\u7EDF\u8BA1\u3002<br>\u53EF\u4EE5\u5148\u8BD5\u8BD5\u6A21\u62DF\u8003\u8BD5\u3001\u77E5\u8BC6\u95EF\u5173\u6216\u80CC\u8BF5\u6A21\u5F0F\uFF01</div></div>';
            return;
        }

        container.innerHTML += '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;">' +
            '<div style="flex:1;min-width:280px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:12px;">' +
            '<div style="font-size:14px;font-weight:bold;color:#333;margin-bottom:8px;">\u51C6\u786E\u7387\u8D8B\u52BF</div>' +
            '<canvas id="dashboard-bar" width="420" height="280" style="width:100%;max-width:420px;"></canvas></div>' +
            '<div style="flex:1;min-width:280px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:12px;">' +
            '<div style="font-size:14px;font-weight:bold;color:#333;margin-bottom:8px;">\u5B66\u79D1\u5206\u5E03</div>' +
            '<canvas id="dashboard-pie" width="300" height="300" style="width:100%;max-width:300px;display:block;margin:0 auto;"></canvas></div>' +
            '</div>';

        // Recent activity
        container.innerHTML += '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:12px;">' +
            '<div style="font-size:14px;font-weight:bold;color:#333;margin-bottom:10px;">\u8FD1\u671F\u6D3B\u52A8</div>';
        for (var j = 0; j < recentActivity.length; j++) {
            var act = recentActivity[j];
            container.innerHTML += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#555;">' +
                '<span><span style="background:#eff6ff;color:#3b82f6;padding:2px 8px;border-radius:10px;font-size:11px;margin-right:8px;">' + act.type + '</span>' + act.subject + '</span>' +
                '<span style="color:#999;">' + act.detail + ' <span style="margin-left:8px;font-size:11px;">' + act.date + '</span></span></div>';
        }
        container.innerHTML += '</div>';

        // Draw charts after DOM update
        setTimeout(function() {
            drawBarChart('dashboard-bar', accuracyValues, accuracyLabels);
            drawPieChart('dashboard-pie', subjectBreakdown);
        }, 50);
    }

    return { render: render };
})();

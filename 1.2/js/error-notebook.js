window.errorNotebook = (function() {
    'use strict';

    var STORAGE_KEY = 'hspcb_error_notebook';
    var SUBJECTS = ['physics', 'chemistry', 'biology', 'chinese', 'math'];
    var SUBJECT_NAMES = { physics: '物理', chemistry: '化学', biology: '生物', chinese: '语文', math: '数学' };
    var DIFFICULTY_LABELS = { easy: '基础', medium: '中等', hard: '较难' };
    var DIFFICULTY_STARS = { easy: '⭐', medium: '⭐⭐', hard: '⭐⭐⭐' };

    /* ========== DATA LAYER ========== */

    function loadData() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var data = JSON.parse(raw);
                if (!data.errors) data.errors = [];
                if (!data.redoStats) data.redoStats = { totalAttempts: 0, totalCorrect: 0, sessions: [] };
                return data;
            }
        } catch (e) {
            /* corrupted data, reset */
        }
        return { errors: [], redoStats: { totalAttempts: 0, totalCorrect: 0, sessions: [] } };
    }

    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            /* storage full */
        }
    }

    function generateId() {
        return 'err_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    }

    function nowISO() {
        return new Date().toISOString();
    }

    /* Add a wrong answer entry. Called by exam-review-system or other quiz modules. */
    function addError(entry) {
        var data = loadData();
        var err = {
            id: entry.id || generateId(),
            question: entry.question || '',
            userAnswer: entry.userAnswer || '',
            correctAnswer: entry.correctAnswer || '',
            subject: entry.subject || 'physics',
            difficulty: entry.difficulty || 'medium',
            chapter: entry.chapter || '',
            options: entry.options || [],
            explanation: entry.explanation || '',
            timestamp: entry.timestamp || nowISO(),
            mastered: false,
            correctCount: 0,
            source: entry.source || 'unknown'
        };
        data.errors.push(err);
        saveData(data);
        return err;
    }

    function deleteError(id) {
        var data = loadData();
        var before = data.errors.length;
        data.errors = data.errors.filter(function(e) { return e.id !== id; });
        if (data.errors.length < before) {
            saveData(data);
            return true;
        }
        return false;
    }

    function clearAll() {
        saveData({ errors: [], redoStats: { totalAttempts: 0, totalCorrect: 0, sessions: [] } });
    }

    function clearBySubject(subject) {
        var data = loadData();
        data.errors = data.errors.filter(function(e) { return e.subject !== subject; });
        saveData(data);
    }

    function markMastered(id) {
        var data = loadData();
        for (var i = 0; i < data.errors.length; i++) {
            if (data.errors[i].id === id) {
                data.errors[i].mastered = true;
                saveData(data);
                return true;
            }
        }
        return false;
    }

    function incrementCorrectCount(id) {
        var data = loadData();
        for (var i = 0; i < data.errors.length; i++) {
            if (data.errors[i].id === id) {
                data.errors[i].correctCount = (data.errors[i].correctCount || 0) + 1;
                if (data.errors[i].correctCount >= 2) {
                    data.errors[i].mastered = true;
                }
                saveData(data);
                return data.errors[i];
            }
        }
        return null;
    }

    function recordRedoAttempt(correct) {
        var data = loadData();
        data.redoStats.totalAttempts = (data.redoStats.totalAttempts || 0) + 1;
        if (correct) {
            data.redoStats.totalCorrect = (data.redoStats.totalCorrect || 0) + 1;
        }
        saveData(data);
    }

    /* ========== STATS ========== */

    function getStats() {
        var data = loadData();
        var errors = data.errors;
        var subjectStats = {};
        for (var i = 0; i < SUBJECTS.length; i++) {
            subjectStats[SUBJECTS[i]] = { total: 0, mastered: 0, easy: 0, medium: 0, hard: 0 };
        }
        for (var j = 0; j < errors.length; j++) {
            var e = errors[j];
            if (!subjectStats[e.subject]) continue;
            subjectStats[e.subject].total++;
            if (e.mastered) subjectStats[e.subject].mastered++;
            if (e.difficulty === 'easy') subjectStats[e.subject].easy++;
            else if (e.difficulty === 'medium') subjectStats[e.subject].medium++;
            else if (e.difficulty === 'hard') subjectStats[e.subject].hard++;
        }
        return { subjectStats: subjectStats, redoStats: data.redoStats, totalErrors: errors.length };
    }

    /* Group errors by date for accuracy-over-time chart */
    function getDailyAccuracy() {
        var data = loadData();
        var daily = {};
        var errors = data.errors;
        for (var i = 0; i < errors.length; i++) {
            var d = errors[i].timestamp.slice(0, 10);
            if (!daily[d]) daily[d] = { total: 0, mastered: 0 };
            daily[d].total++;
            if (errors[i].mastered) daily[d].mastered++;
        }
        var keys = Object.keys(daily).sort();
        var result = [];
        for (var k = 0; k < keys.length; k++) {
            var day = daily[keys[k]];
            result.push({
                date: keys[k],
                total: day.total,
                mastered: day.mastered,
                rate: day.total > 0 ? Math.round(day.mastered / day.total * 100) : 0
            });
        }
        return result;
    }

    /* ========== FILTERING ========== */

    function getFilteredErrors(filters) {
        var data = loadData();
        var errors = data.errors;
        var result = [];
        for (var i = 0; i < errors.length; i++) {
            var e = errors[i];

            if (filters.subject && filters.subject !== 'all' && e.subject !== filters.subject) continue;
            if (filters.difficulty && filters.difficulty !== 'all' && e.difficulty !== filters.difficulty) continue;
            if (filters.mastered === 'mastered' && !e.mastered) continue;
            if (filters.mastered === 'unmastered' && e.mastered) continue;

            if (filters.dateFrom || filters.dateTo) {
                var d = e.timestamp.slice(0, 10);
                if (filters.dateFrom && d < filters.dateFrom) continue;
                if (filters.dateTo && d > filters.dateTo) continue;
            }

            if (filters.keyword) {
                var kw = filters.keyword.toLowerCase();
                var matchQ = e.question.toLowerCase().indexOf(kw) !== -1;
                var matchCh = e.chapter.toLowerCase().indexOf(kw) !== -1;
                if (!matchQ && !matchCh) continue;
            }

            result.push(e);
        }
        return result;
    }

    /* ========== EXPORT ========== */

    function exportAsText(filters) {
        var errors = filters ? getFilteredErrors(filters) : loadData().errors;
        if (errors.length === 0) return '当前没有错题记录。';
        var lines = [];
        lines.push('========================================');
        lines.push('  错题本导出 (高中学习平台 HSPCB)');
        lines.push('  导出时间: ' + nowISO());
        lines.push('  错题总数: ' + errors.length);
        lines.push('========================================');
        lines.push('');

        for (var i = 0; i < errors.length; i++) {
            var e = errors[i];
            var subjName = SUBJECT_NAMES[e.subject] || e.subject;
            var diffLabel = DIFFICULTY_LABELS[e.difficulty] || e.difficulty;
            lines.push('--- 第 ' + (i + 1) + ' 题 ---');
            lines.push('学科: ' + subjName + ' | 难度: ' + diffLabel + ' | 章节: ' + e.chapter);
            lines.push('时间: ' + e.timestamp.slice(0, 10));
            lines.push('题目: ' + e.question);
            lines.push('你的答案: ' + e.userAnswer);
            lines.push('正确答案: ' + e.correctAnswer);
            if (e.options && e.options.length > 0) {
                lines.push('选项: ' + e.options.join(' | '));
            }
            lines.push('解析: ' + e.explanation);
            lines.push('状态: ' + (e.mastered ? '已掌握' : '未掌握') + ' | 正确次数: ' + (e.correctCount || 0));
            lines.push('');
        }
        return lines.join('\n');
    }

    function triggerExport(filters) {
        var text = exportAsText(filters);
        var blob = new Blob([text], { type: 'text/plain;charset=UTF-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'hspcb_error_notebook_' + new Date().toISOString().slice(0, 10) + '.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /* ========== CSS STYLES ========== */

    function injectStyles() {
        if (document.getElementById('error-notebook-styles')) return;
        var style = document.createElement('style');
        style.id = 'error-notebook-styles';
        style.textContent = [
            '#error-notebook-app {',
            '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;',
            '  color: #333;',
            '  max-width: 100%;',
            '  padding: 16px;',
            '  box-sizing: border-box;',
            '}',
            '#error-notebook-app * { box-sizing: border-box; }',
            '.enb-header {',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  flex-wrap: wrap;',
            '  gap: 12px;',
            '  margin-bottom: 16px;',
            '  padding-bottom: 12px;',
            '  border-bottom: 2px solid #e0e0e0;',
            '}',
            '.enb-header h2 { margin: 0; font-size: 1.3rem; color: #1a237e; }',
            '.enb-header-actions { display: flex; gap: 8px; flex-wrap: wrap; }',
            '.enb-btn {',
            '  padding: 7px 16px;',
            '  border: 1px solid #ccc;',
            '  border-radius: 6px;',
            '  cursor: pointer;',
            '  font-size: 0.85rem;',
            '  background: #fff;',
            '  color: #333;',
            '  transition: all 0.2s;',
            '  white-space: nowrap;',
            '}',
            '.enb-btn:hover { background: #f0f0f0; }',
            '.enb-btn-primary { background: #1a237e; color: #fff; border-color: #1a237e; }',
            '.enb-btn-primary:hover { background: #283593; }',
            '.enb-btn-danger { background: #fff; color: #c62828; border-color: #c62828; }',
            '.enb-btn-danger:hover { background: #ffebee; }',
            '.enb-btn-success { background: #2e7d32; color: #fff; border-color: #2e7d32; }',
            '.enb-btn-success:hover { background: #388e3c; }',
            '.enb-btn-sm { padding: 4px 10px; font-size: 0.78rem; }',
            '.enb-tabs {',
            '  display: flex;',
            '  gap: 2px;',
            '  margin-bottom: 16px;',
            '  border-bottom: 2px solid #e0e0e0;',
            '}',
            '.enb-tab {',
            '  padding: 10px 20px;',
            '  border: none;',
            '  background: transparent;',
            '  cursor: pointer;',
            '  font-size: 0.9rem;',
            '  color: #666;',
            '  border-bottom: 3px solid transparent;',
            '  transition: all 0.2s;',
            '  font-weight: 500;',
            '}',
            '.enb-tab:hover { color: #1a237e; }',
            '.enb-tab.active { color: #1a237e; border-bottom-color: #1a237e; font-weight: 700; }',
            '.enb-stats-bar {',
            '  display: flex;',
            '  gap: 12px;',
            '  flex-wrap: wrap;',
            '  margin-bottom: 16px;',
            '}',
            '.enb-stat-card {',
            '  flex: 1;',
            '  min-width: 120px;',
            '  padding: 12px;',
            '  border-radius: 8px;',
            '  background: #f5f5f5;',
            '  text-align: center;',
            '}',
            '.enb-stat-card .enb-stat-num { font-size: 1.6rem; font-weight: 700; color: #1a237e; }',
            '.enb-stat-card .enb-stat-label { font-size: 0.78rem; color: #666; margin-top: 4px; }',
            '.enb-filters {',
            '  display: flex;',
            '  gap: 10px;',
            '  flex-wrap: wrap;',
            '  align-items: center;',
            '  margin-bottom: 16px;',
            '  padding: 12px;',
            '  background: #fafafa;',
            '  border-radius: 8px;',
            '  border: 1px solid #e8e8e8;',
            '}',
            '.enb-filters select, .enb-filters input {',
            '  padding: 6px 10px;',
            '  border: 1px solid #ccc;',
            '  border-radius: 4px;',
            '  font-size: 0.85rem;',
            '}',
            '.enb-error-list {',
            '  display: flex;',
            '  flex-direction: column;',
            '  gap: 10px;',
            '}',
            '.enb-error-card {',
            '  border: 1px solid #e0e0e0;',
            '  border-radius: 8px;',
            '  padding: 14px;',
            '  background: #fff;',
            '  transition: box-shadow 0.2s;',
            '}',
            '.enb-error-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }',
            '.enb-error-card.mastered { border-left: 4px solid #4caf50; background: #f9fdf9; }',
            '.enb-error-card.unmastered { border-left: 4px solid #f44336; }',
            '.enb-error-meta {',
            '  display: flex;',
            '  gap: 8px;',
            '  flex-wrap: wrap;',
            '  align-items: center;',
            '  margin-bottom: 8px;',
            '  font-size: 0.8rem;',
            '  color: #666;',
            '}',
            '.enb-error-meta .enb-badge {',
            '  display: inline-block;',
            '  padding: 2px 8px;',
            '  border-radius: 10px;',
            '  font-size: 0.75rem;',
            '  font-weight: 500;',
            '}',
            '.enb-badge-subject { background: #e3f2fd; color: #1565c0; }',
            '.enb-badge-diff-easy { background: #e8f5e9; color: #2e7d32; }',
            '.enb-badge-diff-medium { background: #fff8e1; color: #f57f17; }',
            '.enb-badge-diff-hard { background: #fce4ec; color: #c62828; }',
            '.enb-badge-mastered { background: #e8f5e9; color: #2e7d32; }',
            '.enb-badge-pending { background: #fff3e0; color: #e65100; }',
            '.enb-error-question { font-weight: 600; margin-bottom: 6px; line-height: 1.5; }',
            '.enb-error-answer { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 6px; font-size: 0.9rem; }',
            '.enb-error-answer .wrong { color: #c62828; }',
            '.enb-error-answer .right { color: #2e7d32; }',
            '.enb-error-explain { font-size: 0.82rem; color: #555; background: #f9f9f9; padding: 8px; border-radius: 4px; line-height: 1.5; }',
            '.enb-error-actions { margin-top: 8px; display: flex; gap: 6px; }',
            '.enb-subject-grid {',
            '  display: grid;',
            '  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));',
            '  gap: 12px;',
            '  margin-bottom: 16px;',
            '}',
            '.enb-subject-card {',
            '  border: 1px solid #e0e0e0;',
            '  border-radius: 8px;',
            '  padding: 14px;',
            '  cursor: pointer;',
            '  transition: all 0.2s;',
            '  background: #fff;',
            '}',
            '.enb-subject-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-color: #1a237e; }',
            '.enb-subject-card.selected { border-color: #1a237e; background: #e8eaf6; }',
            '.enb-subject-card h4 { margin: 0 0 8px 0; }',
            '.enb-subject-card .enb-subject-stats { font-size: 0.82rem; color: #666; }',
            '.enb-redo-container {',
            '  max-width: 700px;',
            '  margin: 0 auto;',
            '}',
            '.enb-redo-progress {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 8px;',
            '  margin-bottom: 16px;',
            '  font-size: 0.9rem;',
            '}',
            '.enb-redo-progress-bar {',
            '  flex: 1;',
            '  height: 10px;',
            '  background: #e0e0e0;',
            '  border-radius: 5px;',
            '  overflow: hidden;',
            '}',
            '.enb-redo-progress-fill {',
            '  height: 100%;',
            '  background: #1a237e;',
            '  border-radius: 5px;',
            '  transition: width 0.3s;',
            '}',
            '.enb-redo-card {',
            '  border: 1px solid #e0e0e0;',
            '  border-radius: 10px;',
            '  padding: 20px;',
            '  background: #fff;',
            '  margin-bottom: 12px;',
            '}',
            '.enb-redo-card h4 { margin-top: 0; }',
            '.enb-redo-options { margin: 12px 0; }',
            '.enb-redo-option {',
            '  display: block;',
            '  width: 100%;',
            '  text-align: left;',
            '  padding: 10px 14px;',
            '  margin: 6px 0;',
            '  border: 1px solid #ddd;',
            '  border-radius: 6px;',
            '  background: #fff;',
            '  cursor: pointer;',
            '  font-size: 0.9rem;',
            '  transition: all 0.15s;',
            '}',
            '.enb-redo-option:hover { background: #f5f5f5; border-color: #aaa; }',
            '.enb-redo-option.correct { background: #e8f5e9; border-color: #4caf50; color: #2e7d32; }',
            '.enb-redo-option.wrong { background: #fce4ec; border-color: #f44336; color: #c62828; }',
            '.enb-redo-option:disabled { cursor: not-allowed; opacity: 0.7; }',
            '.enb-redo-feedback {',
            '  margin-top: 10px;',
            '  padding: 10px;',
            '  border-radius: 6px;',
            '  display: none;',
            '}',
            '.enb-redo-feedback.show { display: block; }',
            '.enb-redo-feedback.correct { background: #e8f5e9; border-left: 4px solid #4caf50; }',
            '.enb-redo-feedback.wrong { background: #fff3e0; border-left: 4px solid #ff9800; }',
            '.enb-redo-summary {',
            '  text-align: center;',
            '  padding: 30px;',
            '  background: #f5f5f5;',
            '  border-radius: 10px;',
            '}',
            '.enb-redo-summary h3 { margin-top: 0; }',
            '.enb-redo-summary .enb-score { font-size: 3rem; font-weight: 700; color: #1a237e; }',
            '.enb-empty {',
            '  text-align: center;',
            '  padding: 40px 20px;',
            '  color: #999;',
            '}',
            '.enb-empty-icon { font-size: 3rem; margin-bottom: 10px; }',
            '.enb-report-table {',
            '  width: 100%;',
            '  border-collapse: collapse;',
            '  font-size: 0.85rem;',
            '  margin-top: 10px;',
            '}',
            '.enb-report-table th, .enb-report-table td {',
            '  padding: 8px;',
            '  border: 1px solid #ddd;',
            '  text-align: center;',
            '}',
            '.enb-report-table th {',
            '  background: #1a237e;',
            '  color: #fff;',
            '}',
            '.enb-report-table tr:nth-child(even) { background: #f9f9f9; }',
            '.enb-modal-overlay {',
            '  position: fixed;',
            '  top: 0; left: 0; right: 0; bottom: 0;',
            '  background: rgba(0,0,0,0.5);',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  z-index: 10000;',
            '}',
            '.enb-modal {',
            '  background: #fff;',
            '  border-radius: 10px;',
            '  padding: 24px;',
            '  max-width: 500px;',
            '  width: 90%;',
            '  box-shadow: 0 4px 20px rgba(0,0,0,0.2);',
            '}',
            '.enb-modal h3 { margin-top: 0; }',
            '.enb-modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }',
            '@media (max-width: 600px) {',
            '  .enb-header { flex-direction: column; align-items: flex-start; }',
            '  .enb-filters { flex-direction: column; }',
            '  .enb-subject-grid { grid-template-columns: 1fr; }',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    /* ========== RENDER FUNCTIONS ========== */

    var currentTab = 'all';
    var currentFilters = { subject: 'all', difficulty: 'all', mastered: 'all', dateFrom: '', dateTo: '', keyword: '' };
    var redoState = null;

    function render() {
        var app = document.getElementById('error-notebook-app');
        if (!app) return;
        injectStyles();
        currentTab = 'all';
        currentFilters = { subject: 'all', difficulty: 'all', mastered: 'all', dateFrom: '', dateTo: '', keyword: '' };
        redoState = null;
        app.innerHTML = '';
        buildLayout(app);
    }

    function buildLayout(app) {
        /* Header */
        var header = document.createElement('div');
        header.className = 'enb-header';
        var title = document.createElement('h2');
        title.textContent = '错题本 (Error Notebook)';
        header.appendChild(title);
        var actions = document.createElement('div');
        actions.className = 'enb-header-actions';
        header.appendChild(actions);
        app.appendChild(header);

        /* Stats bar */
        var statsBar = document.createElement('div');
        statsBar.className = 'enb-stats-bar';
        statsBar.id = 'enb-stats-bar';
        app.appendChild(statsBar);

        /* Tabs */
        var tabs = document.createElement('div');
        tabs.className = 'enb-tabs';
        tabs.id = 'enb-tabs';
        app.appendChild(tabs);

        /* Tab content area */
        var content = document.createElement('div');
        content.id = 'enb-tab-content';
        app.appendChild(content);

        /* Build header action buttons */
        buildHeaderActions(actions);

        /* Build tabs */
        buildTabs(tabs);

        /* Refresh stats */
        refreshStats();

        /* Show default tab */
        switchTab('all');
    }

    function buildHeaderActions(container) {
        container.innerHTML = '';

        var exportBtn = document.createElement('button');
        exportBtn.className = 'enb-btn';
        exportBtn.textContent = '导出';
        exportBtn.title = '导出错题文本';
        exportBtn.onclick = function() { triggerExport(currentFilters); };
        container.appendChild(exportBtn);

        var clearBtn = document.createElement('button');
        clearBtn.className = 'enb-btn enb-btn-danger';
        clearBtn.textContent = '清空全部';
        clearBtn.title = '删除所有错题记录';
        clearBtn.onclick = function() { showClearConfirm(); };
        container.appendChild(clearBtn);
    }

    function buildTabs(container) {
        container.innerHTML = '';

        var tab1 = document.createElement('button');
        tab1.className = 'enb-tab active';
        tab1.textContent = '全部错题';
        tab1.setAttribute('data-tab', 'all');
        tab1.onclick = function() { switchTab('all'); };
        container.appendChild(tab1);

        var tab2 = document.createElement('button');
        tab2.className = 'enb-tab';
        tab2.textContent = '按学科筛选';
        tab2.setAttribute('data-tab', 'subject');
        tab2.onclick = function() { switchTab('subject'); };
        container.appendChild(tab2);

        var tab3 = document.createElement('button');
        tab3.className = 'enb-tab';
        tab3.textContent = '重做模式';
        tab3.setAttribute('data-tab', 'redo');
        tab3.onclick = function() { switchTab('redo'); };
        container.appendChild(tab3);
    }

    function switchTab(tab) {
        currentTab = tab;
        redoState = null;

        /* Update active tab styling */
        var tabEls = document.querySelectorAll('#enb-tabs .enb-tab');
        for (var i = 0; i < tabEls.length; i++) {
            tabEls[i].classList.remove('active');
            if (tabEls[i].getAttribute('data-tab') === tab) {
                tabEls[i].classList.add('active');
            }
        }

        var content = document.getElementById('enb-tab-content');
        if (!content) return;
        content.innerHTML = '';

        if (tab === 'all') renderAllTab(content);
        else if (tab === 'subject') renderSubjectTab(content);
        else if (tab === 'redo') renderRedoTab(content);

        refreshStats();
    }

    function refreshStats() {
        var bar = document.getElementById('enb-stats-bar');
        if (!bar) return;
        var stats = getStats();
        var total = stats.totalErrors;
        var mastered = 0;
        for (var k in stats.subjectStats) {
            if (stats.subjectStats.hasOwnProperty(k)) {
                mastered += stats.subjectStats[k].mastered;
            }
        }
        var redo = stats.redoStats;
        var redoRate = redo.totalAttempts > 0 ? Math.round(redo.totalCorrect / redo.totalAttempts * 100) : 0;

        bar.innerHTML = '';
        bar.appendChild(makeStatCard(total + '', '总错题数'));
        bar.appendChild(makeStatCard(mastered + '', '已掌握'));
        bar.appendChild(makeStatCard((total - mastered) + '', '待攻克'));
        bar.appendChild(makeStatCard(redoRate + '%', '重做正确率'));
    }

    function makeStatCard(num, label) {
        var card = document.createElement('div');
        card.className = 'enb-stat-card';
        var numEl = document.createElement('div');
        numEl.className = 'enb-stat-num';
        numEl.textContent = num;
        var labelEl = document.createElement('div');
        labelEl.className = 'enb-stat-label';
        labelEl.textContent = label;
        card.appendChild(numEl);
        card.appendChild(labelEl);
        return card;
    }

    /* ========== TAB: ALL ERRORS ========== */

    function renderAllTab(container) {
        /* Filters */
        var filtersDiv = buildFilters();
        container.appendChild(filtersDiv);

        /* Error list */
        var listDiv = document.createElement('div');
        listDiv.id = 'enb-error-list';
        listDiv.className = 'enb-error-list';
        container.appendChild(listDiv);

        refreshErrorList();
    }

    function buildFilters() {
        var div = document.createElement('div');
        div.className = 'enb-filters';

        /* Subject filter */
        var subjLabel = document.createElement('span');
        subjLabel.textContent = '学科:';
        subjLabel.style.cssText = 'font-size:0.85rem;font-weight:500;';
        div.appendChild(subjLabel);

        var subjSel = document.createElement('select');
        subjSel.id = 'enb-filter-subject';
        subjSel.onchange = function() {
            currentFilters.subject = subjSel.value;
            refreshErrorList();
        };
        var subjOpts = [{ v: 'all', l: '全部' }];
        for (var i = 0; i < SUBJECTS.length; i++) {
            subjOpts.push({ v: SUBJECTS[i], l: SUBJECT_NAMES[SUBJECTS[i]] });
        }
        for (var j = 0; j < subjOpts.length; j++) {
            var opt = document.createElement('option');
            opt.value = subjOpts[j].v;
            opt.textContent = subjOpts[j].l;
            subjSel.appendChild(opt);
        }
        div.appendChild(subjSel);

        /* Difficulty filter */
        var diffLabel = document.createElement('span');
        diffLabel.textContent = '难度:';
        diffLabel.style.cssText = 'font-size:0.85rem;font-weight:500;margin-left:8px;';
        div.appendChild(diffLabel);

        var diffSel = document.createElement('select');
        diffSel.id = 'enb-filter-difficulty';
        diffSel.onchange = function() {
            currentFilters.difficulty = diffSel.value;
            refreshErrorList();
        };
        var diffOpts = [
            { v: 'all', l: '全部' },
            { v: 'easy', l: '基础 ⭐' },
            { v: 'medium', l: '中等 ⭐⭐' },
            { v: 'hard', l: '较难 ⭐⭐⭐' }
        ];
        for (var d = 0; d < diffOpts.length; d++) {
            var dopt = document.createElement('option');
            dopt.value = diffOpts[d].v;
            dopt.textContent = diffOpts[d].l;
            diffSel.appendChild(dopt);
        }
        div.appendChild(diffSel);

        /* Status filter */
        var statLabel = document.createElement('span');
        statLabel.textContent = '状态:';
        statLabel.style.cssText = 'font-size:0.85rem;font-weight:500;margin-left:8px;';
        div.appendChild(statLabel);

        var statSel = document.createElement('select');
        statSel.id = 'enb-filter-mastered';
        statSel.onchange = function() {
            currentFilters.mastered = statSel.value;
            refreshErrorList();
        };
        var statOpts = [
            { v: 'all', l: '全部' },
            { v: 'unmastered', l: '未掌握' },
            { v: 'mastered', l: '已掌握' }
        ];
        for (var s = 0; s < statOpts.length; s++) {
            var sopt = document.createElement('option');
            sopt.value = statOpts[s].v;
            sopt.textContent = statOpts[s].l;
            statSel.appendChild(sopt);
        }
        div.appendChild(statSel);

        /* Keyword */
        var kwInput = document.createElement('input');
        kwInput.type = 'text';
        kwInput.placeholder = '搜索关键词...';
        kwInput.style.cssText = 'min-width:120px;margin-left:8px;';
        kwInput.id = 'enb-filter-keyword';
        var kwTimeout = null;
        kwInput.oninput = function() {
            if (kwTimeout) clearTimeout(kwTimeout);
            kwTimeout = setTimeout(function() {
                currentFilters.keyword = kwInput.value;
                refreshErrorList();
            }, 300);
        };
        div.appendChild(kwInput);

        /* Date range */
        var fromLabel = document.createElement('span');
        fromLabel.textContent = '从:';
        fromLabel.style.cssText = 'font-size:0.85rem;font-weight:500;margin-left:8px;';
        div.appendChild(fromLabel);
        var dateFrom = document.createElement('input');
        dateFrom.type = 'date';
        dateFrom.id = 'enb-filter-datefrom';
        dateFrom.style.cssText = 'width:130px;';
        dateFrom.onchange = function() {
            currentFilters.dateFrom = dateFrom.value;
            refreshErrorList();
        };
        div.appendChild(dateFrom);

        var toLabel = document.createElement('span');
        toLabel.textContent = '到:';
        toLabel.style.cssText = 'font-size:0.85rem;font-weight:500;margin-left:4px;';
        div.appendChild(toLabel);
        var dateTo = document.createElement('input');
        dateTo.type = 'date';
        dateTo.id = 'enb-filter-dateto';
        dateTo.style.cssText = 'width:130px;';
        dateTo.onchange = function() {
            currentFilters.dateTo = dateTo.value;
            refreshErrorList();
        };
        div.appendChild(dateTo);

        return div;
    }

    function refreshErrorList() {
        var listDiv = document.getElementById('enb-error-list');
        if (!listDiv) return;
        var errors = getFilteredErrors(currentFilters);
        listDiv.innerHTML = '';

        if (errors.length === 0) {
            var empty = document.createElement('div');
            empty.className = 'enb-empty';
            empty.innerHTML = '<div class="enb-empty-icon">&#x1F4DA;</div><p>暂无匹配的错题记录</p><p style="font-size:0.85rem;">在练习中答错的题目会自动收录到错题本</p>';
            listDiv.appendChild(empty);
            return;
        }

        /* Sort by timestamp descending */
        errors.sort(function(a, b) {
            if (a.timestamp > b.timestamp) return -1;
            if (a.timestamp < b.timestamp) return 1;
            return 0;
        });

        for (var i = 0; i < errors.length; i++) {
            listDiv.appendChild(buildErrorCard(errors[i]));
        }
    }

    function buildErrorCard(err) {
        var card = document.createElement('div');
        card.className = 'enb-error-card ' + (err.mastered ? 'mastered' : 'unmastered');
        card.setAttribute('data-id', err.id);

        /* Meta row */
        var meta = document.createElement('div');
        meta.className = 'enb-error-meta';

        var subjBadge = document.createElement('span');
        subjBadge.className = 'enb-badge enb-badge-subject';
        subjBadge.textContent = SUBJECT_NAMES[err.subject] || err.subject;
        meta.appendChild(subjBadge);

        var diffBadge = document.createElement('span');
        var diffClass = 'enb-badge-diff-' + err.difficulty;
        diffBadge.className = 'enb-badge ' + diffClass;
        diffBadge.textContent = DIFFICULTY_STARS[err.difficulty] || err.difficulty;
        meta.appendChild(diffBadge);

        if (err.chapter) {
            var chBadge = document.createElement('span');
            chBadge.className = 'enb-badge';
            chBadge.style.cssText = 'background:#f3e5f5;color:#6a1b9a;';
            chBadge.textContent = err.chapter;
            meta.appendChild(chBadge);
        }

        var statusBadge = document.createElement('span');
        statusBadge.className = 'enb-badge ' + (err.mastered ? 'enb-badge-mastered' : 'enb-badge-pending');
        statusBadge.textContent = err.mastered ? '已掌握' : '未掌握';
        meta.appendChild(statusBadge);

        var dateSpan = document.createElement('span');
        dateSpan.textContent = err.timestamp.slice(0, 10);
        meta.appendChild(dateSpan);

        card.appendChild(meta);

        /* Question */
        var questionDiv = document.createElement('div');
        questionDiv.className = 'enb-error-question';
        questionDiv.textContent = err.question;
        card.appendChild(questionDiv);

        /* Answer row */
        var answerDiv = document.createElement('div');
        answerDiv.className = 'enb-error-answer';
        var wrongSpan = document.createElement('span');
        wrongSpan.className = 'wrong';
        wrongSpan.textContent = '你的答案: ' + err.userAnswer;
        answerDiv.appendChild(wrongSpan);
        var rightSpan = document.createElement('span');
        rightSpan.className = 'right';
        rightSpan.textContent = '正确答案: ' + err.correctAnswer;
        answerDiv.appendChild(rightSpan);
        var countSpan = document.createElement('span');
        countSpan.style.cssText = 'color:#888;font-size:0.82rem;';
        countSpan.textContent = '(重做正确 ' + (err.correctCount || 0) + ' 次)';
        answerDiv.appendChild(countSpan);
        card.appendChild(answerDiv);

        /* Explanation */
        if (err.explanation) {
            var explainDiv = document.createElement('div');
            explainDiv.className = 'enb-error-explain';
            explainDiv.textContent = '解析: ' + err.explanation;
            card.appendChild(explainDiv);
        }

        /* Options if present */
        if (err.options && err.options.length > 0) {
            var optsDiv = document.createElement('div');
            optsDiv.style.cssText = 'font-size:0.82rem;color:#555;margin-top:4px;';
            optsDiv.textContent = '选项: ' + err.options.join('  |  ');
            card.appendChild(optsDiv);
        }

        /* Actions */
        var actionsDiv = document.createElement('div');
        actionsDiv.className = 'enb-error-actions';

        var delBtn = document.createElement('button');
        delBtn.className = 'enb-btn enb-btn-sm';
        delBtn.textContent = '删除';
        delBtn.style.cssText = 'color:#c62828;border-color:#c62828;';
        delBtn.onclick = (function(id) {
            return function() {
                if (confirm('确定要删除这条错题记录吗？')) {
                    deleteError(id);
                    refreshErrorList();
                    refreshStats();
                }
            };
        })(err.id);
        actionsDiv.appendChild(delBtn);

        if (!err.mastered) {
            var masBtn = document.createElement('button');
            masBtn.className = 'enb-btn enb-btn-sm enb-btn-success';
            masBtn.textContent = '标记已掌握';
            masBtn.onclick = (function(id) {
                return function() {
                    markMastered(id);
                    refreshErrorList();
                    refreshStats();
                };
            })(err.id);
            actionsDiv.appendChild(masBtn);
        }

        card.appendChild(actionsDiv);

        return card;
    }

    /* ========== TAB: BY SUBJECT ========== */

    function renderSubjectTab(container) {
        var stats = getStats();
        var subjStats = stats.subjectStats;

        var desc = document.createElement('p');
        desc.style.cssText = 'color:#666;margin-bottom:12px;font-size:0.9rem;';
        desc.textContent = '点击学科卡片查看该学科的错题详情。';
        container.appendChild(desc);

        /* Subject cards grid */
        var grid = document.createElement('div');
        grid.className = 'enb-subject-grid';
        grid.id = 'enb-subject-grid';
        container.appendChild(grid);

        for (var i = 0; i < SUBJECTS.length; i++) {
            var subj = SUBJECTS[i];
            var st = subjStats[subj] || { total: 0, mastered: 0, easy: 0, medium: 0, hard: 0 };
            grid.appendChild(buildSubjectCard(subj, st));
        }

        /* Detail area */
        var detailDiv = document.createElement('div');
        detailDiv.id = 'enb-subject-detail';
        container.appendChild(detailDiv);
    }

    function buildSubjectCard(subject, st) {
        var card = document.createElement('div');
        card.className = 'enb-subject-card';
        card.setAttribute('data-subject', subject);
        card.onclick = function() {
            /* Deselect all */
            var allCards = document.querySelectorAll('.enb-subject-card');
            for (var i = 0; i < allCards.length; i++) {
                allCards[i].classList.remove('selected');
            }
            card.classList.add('selected');
            showSubjectDetail(subject);
        };

        var name = SUBJECT_NAMES[subject] || subject;
        var total = st.total;
        var mastered = st.mastered;
        var pending = total - mastered;
        var rate = total > 0 ? Math.round(mastered / total * 100) : 0;

        card.innerHTML =
            '<h4>' + name + '</h4>' +
            '<div class="enb-subject-stats">' +
            '<div>错题总数: <strong>' + total + '</strong></div>' +
            '<div>已掌握: <strong style="color:#2e7d32;">' + mastered + '</strong> | 待攻克: <strong style="color:#c62828;">' + pending + '</strong></div>' +
            '<div>掌握率: <strong>' + rate + '%</strong></div>' +
            '<div style="margin-top:6px;">' +
            '<span style="color:#2e7d32;">基础: ' + st.easy + '</span> | ' +
            '<span style="color:#f57f17;">中等: ' + st.medium + '</span> | ' +
            '<span style="color:#c62828;">较难: ' + st.hard + '</span>' +
            '</div>' +
            '</div>';

        return card;
    }

    function showSubjectDetail(subject) {
        var detailDiv = document.getElementById('enb-subject-detail');
        if (!detailDiv) return;

        var filters = {
            subject: subject,
            difficulty: 'all',
            mastered: 'all',
            dateFrom: '',
            dateTo: '',
            keyword: ''
        };
        var errors = getFilteredErrors(filters);

        detailDiv.innerHTML = '';

        var headerBar = document.createElement('div');
        headerBar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding:12px;background:#f5f5f5;border-radius:8px;';
        var headerTitle = document.createElement('h4');
        headerTitle.style.cssText = 'margin:0;';
        headerTitle.textContent = SUBJECT_NAMES[subject] + ' 错题详情 (' + errors.length + ' 题)';
        headerBar.appendChild(headerTitle);

        var headerActions = document.createElement('div');
        headerActions.style.cssText = 'display:flex;gap:8px;';

        var redoBtn = document.createElement('button');
        redoBtn.className = 'enb-btn enb-btn-primary enb-btn-sm';
        redoBtn.textContent = '重做该学科错题';
        redoBtn.onclick = function() {
            currentFilters.subject = subject;
            switchTab('redo');
        };
        headerActions.appendChild(redoBtn);

        var clearSubjBtn = document.createElement('button');
        clearSubjBtn.className = 'enb-btn enb-btn-danger enb-btn-sm';
        clearSubjBtn.textContent = '清空该学科';
        clearSubjBtn.onclick = function() {
            if (confirm('确定要清空「' + SUBJECT_NAMES[subject] + '」的所有错题吗？此操作不可撤销。')) {
                clearBySubject(subject);
                switchTab('subject');
                refreshStats();
            }
        };
        headerActions.appendChild(clearSubjBtn);

        headerBar.appendChild(headerActions);
        detailDiv.appendChild(headerBar);

        if (errors.length === 0) {
            var empty = document.createElement('div');
            empty.className = 'enb-empty';
            empty.innerHTML = '<p style="padding:20px;">该学科暂无错题记录，继续保持！</p>';
            detailDiv.appendChild(empty);
            return;
        }

        /* Difficulty breakdown in subject view */
        var diffBreakdown = document.createElement('div');
        diffBreakdown.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;margin:12px 0;font-size:0.85rem;';
        var difficulties = ['easy', 'medium', 'hard'];
        for (var d = 0; d < difficulties.length; d++) {
            var diff = difficulties[d];
            var diffErrors = [];
            for (var i = 0; i < errors.length; i++) {
                if (errors[i].difficulty === diff) diffErrors.push(errors[i]);
            }
            var masteredCount = 0;
            for (var j = 0; j < diffErrors.length; j++) {
                if (diffErrors[j].mastered) masteredCount++;
            }
            var badge = document.createElement('span');
            badge.style.cssText = 'padding:6px 12px;border-radius:16px;background:#f5f5f5;';
            badge.textContent = DIFFICULTY_LABELS[diff] + ': ' + diffErrors.length + '题 (掌握 ' + masteredCount + ')';
            diffBreakdown.appendChild(badge);
        }
        detailDiv.appendChild(diffBreakdown);

        /* Error list for subject */
        var listDiv = document.createElement('div');
        listDiv.className = 'enb-error-list';
        errors.sort(function(a, b) {
            if (a.timestamp > b.timestamp) return -1;
            if (a.timestamp < b.timestamp) return 1;
            return 0;
        });
        for (var k = 0; k < errors.length; k++) {
            listDiv.appendChild(buildErrorCard(errors[k]));
        }
        detailDiv.appendChild(listDiv);
    }

    /* ========== TAB: REDO MODE ========== */

    function renderRedoTab(container) {
        /* Get errors for redo (filtered by current subject filter or all unmastered) */
        var redoFilters = {
            subject: currentFilters.subject || 'all',
            difficulty: 'all',
            mastered: 'unmastered',
            dateFrom: '',
            dateTo: '',
            keyword: ''
        };
        var errors = getFilteredErrors(redoFilters);

        var redoContainer = document.createElement('div');
        redoContainer.className = 'enb-redo-container';
        redoContainer.id = 'enb-redo-container';
        container.appendChild(redoContainer);

        if (errors.length === 0) {
            redoContainer.innerHTML =
                '<div class="enb-empty"><div class="enb-empty-icon">&#x1F389;</div>' +
                '<p>所有错题已掌握，没有需要重做的题目！</p>' +
                '<p style="font-size:0.85rem;">你可以切换到「全部错题」查看已掌握的错题，或继续练习积累新的错题。</p></div>';
            return;
        }

        /* Initialize redo session */
        redoState = {
            errors: errors,
            currentIndex: 0,
            total: errors.length,
            correct: 0,
            incorrect: 0,
            answered: false,
            sessionStart: new Date().toISOString()
        };

        renderRedoCard(redoContainer);
    }

    function renderRedoCard(container) {
        if (!redoState) return;
        var idx = redoState.currentIndex;
        var total = redoState.total;
        var err = redoState.errors[idx];
        var progress = Math.round((idx) / total * 100);

        container.innerHTML = '';

        /* Progress bar */
        var progressDiv = document.createElement('div');
        progressDiv.className = 'enb-redo-progress';

        var progressLabel = document.createElement('span');
        progressLabel.textContent = '第 ' + (idx + 1) + ' / ' + total + ' 题';
        progressDiv.appendChild(progressLabel);

        var barOuter = document.createElement('div');
        barOuter.className = 'enb-redo-progress-bar';
        var barFill = document.createElement('div');
        barFill.className = 'enb-redo-progress-fill';
        barFill.style.width = progress + '%';
        barOuter.appendChild(barFill);
        progressDiv.appendChild(barOuter);

        var scoreLabel = document.createElement('span');
        scoreLabel.textContent = '对 ' + redoState.correct + ' / 错 ' + redoState.incorrect;
        progressDiv.appendChild(scoreLabel);

        container.appendChild(progressDiv);

        /* Question card */
        var card = document.createElement('div');
        card.className = 'enb-redo-card';

        /* Meta */
        var meta = document.createElement('div');
        meta.className = 'enb-error-meta';
        var subjBadge = document.createElement('span');
        subjBadge.className = 'enb-badge enb-badge-subject';
        subjBadge.textContent = SUBJECT_NAMES[err.subject] || err.subject;
        meta.appendChild(subjBadge);
        var diffBadge = document.createElement('span');
        diffBadge.className = 'enb-badge enb-badge-diff-' + err.difficulty;
        diffBadge.textContent = DIFFICULTY_STARS[err.difficulty] || err.difficulty;
        meta.appendChild(diffBadge);
        var chBadge = document.createElement('span');
        chBadge.className = 'enb-badge';
        chBadge.style.cssText = 'background:#f3e5f5;color:#6a1b9a;';
        chBadge.textContent = err.chapter || '';
        meta.appendChild(chBadge);
        card.appendChild(meta);

        /* Question text */
        var questionP = document.createElement('p');
        questionP.style.cssText = 'font-weight:600;line-height:1.6;margin:10px 0;';
        questionP.textContent = err.question;
        card.appendChild(questionP);

        /* Options */
        if (err.options && err.options.length > 0) {
            var optsDiv = document.createElement('div');
            optsDiv.className = 'enb-redo-options';
            optsDiv.id = 'enb-redo-options';

            var optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
            for (var i = 0; i < err.options.length; i++) {
                var btn = document.createElement('button');
                btn.className = 'enb-redo-option';
                btn.textContent = optionLabels[i] + '. ' + err.options[i];
                btn.setAttribute('data-option-index', i);
                btn.onclick = (function(index, correctAnswer) {
                    return function() { handleRedoAnswer(index, correctAnswer); };
                })(i, err.correctAnswer);
                optsDiv.appendChild(btn);
            }
            card.appendChild(optsDiv);
        } else {
            /* If no option list, provide text input */
            var inputDiv = document.createElement('div');
            inputDiv.style.cssText = 'margin:10px 0;';
            var inputLabel = document.createElement('label');
            inputLabel.textContent = '输入你的答案: ';
            inputLabel.style.cssText = 'font-weight:500;';
            inputDiv.appendChild(inputLabel);
            var textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.id = 'enb-redo-text-input';
            textInput.style.cssText = 'padding:8px 12px;border:1px solid #ccc;border-radius:4px;font-size:0.9rem;width:200px;';
            textInput.onkeydown = function(e) {
                if (e.key === 'Enter') {
                    handleRedoAnswerText(textInput.value, err.correctAnswer);
                }
            };
            inputDiv.appendChild(textInput);
            var submitBtn = document.createElement('button');
            submitBtn.className = 'enb-btn enb-btn-primary enb-btn-sm';
            submitBtn.textContent = '提交';
            submitBtn.style.cssText = 'margin-left:8px;';
            submitBtn.onclick = function() {
                handleRedoAnswerText(textInput.value, err.correctAnswer);
            };
            inputDiv.appendChild(submitBtn);
            card.appendChild(inputDiv);
        }

        /* Feedback */
        var feedback = document.createElement('div');
        feedback.className = 'enb-redo-feedback';
        feedback.id = 'enb-redo-feedback';
        card.appendChild(feedback);

        container.appendChild(card);
    }

    function handleRedoAnswer(selectedIndex, correctAnswer) {
        if (!redoState || redoState.answered) return;
        redoState.answered = true;

        var optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
        var userAnswerLetter = selectedIndex < optionLabels.length ? optionLabels[selectedIndex] : String(selectedIndex);
        var isCorrect = (userAnswerLetter === correctAnswer);

        /* Highlight options */
        var optionBtns = document.querySelectorAll('#enb-redo-options .enb-redo-option');
        for (var i = 0; i < optionBtns.length; i++) {
            optionBtns[i].disabled = true;
            var btnIndex = parseInt(optionBtns[i].getAttribute('data-option-index'), 10);
            var btnLetter = btnIndex < optionLabels.length ? optionLabels[btnIndex] : String(btnIndex);
            if (btnLetter === correctAnswer) {
                optionBtns[i].classList.add('correct');
            } else if (btnIndex === selectedIndex && !isCorrect) {
                optionBtns[i].classList.add('wrong');
            }
        }

        processRedoResult(isCorrect, userAnswerLetter, correctAnswer);
    }

    function handleRedoAnswerText(userText, correctAnswer) {
        if (!redoState || redoState.answered) return;
        redoState.answered = true;

        var trimmed = (userText || '').trim().toUpperCase();
        var isCorrect = (trimmed === correctAnswer.toUpperCase());

        processRedoResult(isCorrect, trimmed, correctAnswer);
    }

    function processRedoResult(isCorrect, userAnswer, correctAnswer) {
        var err = redoState.errors[redoState.currentIndex];

        if (isCorrect) {
            redoState.correct++;
            incrementCorrectCount(err.id);
        } else {
            redoState.incorrect++;
        }
        recordRedoAttempt(isCorrect);

        /* Show feedback */
        var feedback = document.getElementById('enb-redo-feedback');
        if (feedback) {
            feedback.className = 'enb-redo-feedback show ' + (isCorrect ? 'correct' : 'wrong');
            if (isCorrect) {
                feedback.innerHTML = '<strong>正确！</strong> ' + (err.explanation || '');
            } else {
                feedback.innerHTML = '<strong>错误！</strong> 你的答案: ' + userAnswer + '，正确答案: ' + correctAnswer + '<br>' + (err.explanation || '');
            }
        }

        /* Next button */
        var container = document.getElementById('enb-redo-container');
        if (!container) return;

        var navDiv = document.createElement('div');
        navDiv.style.cssText = 'display:flex;justify-content:center;gap:12px;margin-top:12px;';

        if (redoState.currentIndex < redoState.total - 1) {
            var nextBtn = document.createElement('button');
            nextBtn.className = 'enb-btn enb-btn-primary';
            nextBtn.textContent = '下一题';
            nextBtn.onclick = function() {
                redoState.currentIndex++;
                redoState.answered = false;
                renderRedoCard(container);
            };
            navDiv.appendChild(nextBtn);
        } else {
            /* Session complete */
            var finishBtn = document.createElement('button');
            finishBtn.className = 'enb-btn enb-btn-primary';
            finishBtn.textContent = '查看结果';
            finishBtn.onclick = function() {
                showRedoSummary(container);
            };
            navDiv.appendChild(finishBtn);
        }

        /* Skip / end early */
        var endBtn = document.createElement('button');
        endBtn.className = 'enb-btn';
        endBtn.textContent = '结束重做';
        endBtn.onclick = function() {
            showRedoSummary(container);
        };
        navDiv.appendChild(endBtn);

        container.appendChild(navDiv);
    }

    function showRedoSummary(container) {
        if (!redoState) return;
        var total = redoState.total;
        var correct = redoState.correct;
        var incorrect = redoState.incorrect;
        var rate = total > 0 ? Math.round(correct / (correct + incorrect) * 100) : 0;
        var emoji = rate >= 80 ? '🎉' : rate >= 60 ? '👍' : '💪';

        container.innerHTML =
            '<div class="enb-redo-summary">' +
            '<h3>' + emoji + ' 重做完成！</h3>' +
            '<div class="enb-score">' + rate + '%</div>' +
            '<p style="font-size:1.1rem;">正确: <strong style="color:#2e7d32;">' + correct + '</strong> | 错误: <strong style="color:#c62828;">' + incorrect + '</strong> | 总计: ' + total + '</p>' +
            '<p style="color:#666;">其中 ' + correct + ' 道题的掌握度已提升。</p>' +
            '<div style="margin-top:16px;display:flex;gap:8px;justify-content:center;">' +
            '<button class="enb-btn enb-btn-primary" onclick="window.errorNotebook.switchTab(\'redo\')">再次重做</button>' +
            '<button class="enb-btn" onclick="window.errorNotebook.switchTab(\'all\')">返回全部错题</button>' +
            '</div></div>';

        redoState = null;
        refreshStats();
    }

    /* ========== MODAL ========== */

    function showClearConfirm() {
        var data = loadData();
        if (data.errors.length === 0) {
            alert('当前没有错题记录，无需清空。');
            return;
        }
        var overlay = document.createElement('div');
        overlay.className = 'enb-modal-overlay';
        overlay.id = 'enb-modal-overlay';

        var modal = document.createElement('div');
        modal.className = 'enb-modal';
        modal.innerHTML =
            '<h3>确认清空</h3>' +
            '<p>确定要删除全部 <strong>' + data.errors.length + '</strong> 条错题记录吗？</p>' +
            '<p style="color:#c62828;font-size:0.85rem;">此操作不可撤销，所有错题、掌握状态、重做统计都将被清除。</p>' +
            '<div class="enb-modal-actions">' +
            '<button class="enb-btn" id="enb-modal-cancel">取消</button>' +
            '<button class="enb-btn enb-btn-danger" id="enb-modal-confirm">确认清空</button>' +
            '</div>';

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        document.getElementById('enb-modal-cancel').onclick = function() {
            document.body.removeChild(overlay);
        };
        document.getElementById('enb-modal-confirm').onclick = function() {
            clearAll();
            document.body.removeChild(overlay);
            switchTab('all');
            refreshStats();
        };
        overlay.onclick = function(e) {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        };
    }

    /* ========== PUBLIC API ========== */

    function getErrorsBySubject(subject) {
        var data = loadData();
        return data.errors.filter(function(e) { return e.subject === subject; });
    }

    function getAllErrors() {
        return loadData().errors;
    }

    return {
        render: render,
        addError: addError,
        deleteError: deleteError,
        clearAll: clearAll,
        clearBySubject: clearBySubject,
        markMastered: markMastered,
        getStats: getStats,
        getDailyAccuracy: getDailyAccuracy,
        getFilteredErrors: getFilteredErrors,
        getErrorsBySubject: getErrorsBySubject,
        getAllErrors: getAllErrors,
        exportAsText: exportAsText,
        triggerExport: triggerExport,
        switchTab: switchTab,
        loadData: loadData,
        STORAGE_KEY: STORAGE_KEY,
        SUBJECTS: SUBJECTS,
        SUBJECT_NAMES: SUBJECT_NAMES
    };
})();

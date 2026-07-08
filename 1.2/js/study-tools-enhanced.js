// ============================================================
// study-tools-enhanced.js - HSPCB Enhanced Study Tools
// Modules: keyboardShortcuts, accessibilityEnhancer,
//          dataExporter, lazyLoader
// ES5 Compatible | IIFE Pattern
// ============================================================

// ============================================================
// 1. KEYBOARD SHORTCUTS MODULE
// ============================================================
window.keyboardShortcuts = (function () {
    'use strict';

    var helpOverlayVisible = false;
    var helpOverlayEl = null;

    // Subject key map: number keys 1-6
    var SUBJECT_MAP = {
        '1': { section: 'physics-section', nav: 'physics' },
        '2': { section: 'chemistry-section', nav: 'chemistry' },
        '3': { section: 'biology-section', nav: 'biology' },
        '4': { section: 'chinese-section', nav: 'chinese' },
        '5': { section: 'math-section', nav: 'math' },
        '6': { section: 'english-section', nav: 'english' }
    };

    function isInputFocused() {
        var el = document.activeElement;
        if (!el) return false;
        var tag = (el.tagName || '').toLowerCase();
        return tag === 'input' || tag === 'textarea' || el.isContentEditable;
    }

    function navigateToSection(sectionId, navSubject) {
        if (typeof showSection === 'function') {
            showSection(sectionId);
        } else {
            var sec = document.getElementById(sectionId);
            if (sec) {
                document.querySelectorAll('.section').forEach(function (s) {
                    s.classList.remove('active');
                });
                sec.classList.add('active');
            }
        }
        if (typeof setActiveNav === 'function') {
            setActiveNav(navSubject);
        } else {
            document.querySelectorAll('.nav-btn').forEach(function (b) {
                b.classList.remove('active');
            });
            var btn = document.querySelector('[data-subject="' + navSubject + '"]');
            if (btn) btn.classList.add('active');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goHome() {
        if (typeof showSection === 'function') {
            showSection('home');
        } else {
            var home = document.getElementById('home') || document.getElementById('home-section');
            if (home) {
                document.querySelectorAll('.section').forEach(function (s) {
                    s.classList.remove('active');
                });
                home.classList.add('active');
            }
        }
        document.querySelectorAll('.nav-btn').forEach(function (b) {
            b.classList.remove('active');
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openGlobalSearch() {
        if (window.globalSearch && typeof window.globalSearch.open === 'function') {
            window.globalSearch.open();
        } else {
            var searchInput = document.getElementById('global-search-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    function openErrorNotebook() {
        navigateToSection('error-notebook-section', 'error-notebook');
        if (window.errorNotebook && typeof window.errorNotebook.render === 'function') {
            setTimeout(function () {
                window.errorNotebook.render();
            }, 100);
        }
    }

    function openMockExam() {
        navigateToSection('mock-exam-section', 'mock-exam');
        if (window.mockExam && typeof window.mockExam.render === 'function') {
            setTimeout(function () {
                window.mockExam.render();
            }, 100);
        }
    }

    function openStudyDashboard() {
        navigateToSection('study-dashboard-section', 'study-dashboard');
        if (window.studyDashboard && typeof window.studyDashboard.render === 'function') {
            setTimeout(function () {
                window.studyDashboard.render();
            }, 100);
        }
    }

    function openPomodoro() {
        navigateToSection('pomodoro-section', 'pomodoro');
        if (window.pomodoroTimer && typeof window.pomodoroTimer.render === 'function') {
            setTimeout(function () {
                window.pomodoroTimer.render();
            }, 100);
        }
    }

    function createHelpOverlay() {
        if (helpOverlayEl) return helpOverlayEl;
        helpOverlayEl = document.createElement('div');
        helpOverlayEl.id = 'keyboard-shortcuts-help';
        helpOverlayEl.style.cssText = [
            'position:fixed',
            'top:0',
            'left:0',
            'width:100%',
            'height:100%',
            'background:rgba(0,0,0,0.85)',
            'z-index:99999',
            'display:none',
            'align-items:center',
            'justify-content:center',
            'font-family:system-ui,-apple-system,sans-serif'
        ].join(';');

        var content = document.createElement('div');
        content.style.cssText = [
            'background:#1a1a2e',
            'border:2px solid #4A90D9',
            'border-radius:16px',
            'padding:40px 50px',
            'max-width:560px',
            'width:90%',
            'color:#e0e0e0',
            'box-shadow:0 20px 60px rgba(0,0,0,0.5)'
        ].join(';');

        var title = document.createElement('h2');
        title.textContent = 'Keyboard Shortcuts';
        title.style.cssText = 'margin:0 0 24px 0;color:#4A90D9;font-size:1.5rem;text-align:center';
        content.appendChild(title);

        var shortcuts = [
            { keys: 'Ctrl + K', desc: 'Open Global Search' },
            { keys: 'Ctrl + E', desc: 'Open Error Notebook' },
            { keys: 'Ctrl + M', desc: 'Open Mock Exam' },
            { keys: 'Ctrl + D', desc: 'Open Study Dashboard' },
            { keys: 'Ctrl + P', desc: 'Open Pomodoro Timer' },
            { keys: '1 - 6', desc: 'Switch: Physics / Chem / Bio / Chinese / Math / English' },
            { keys: 'Esc', desc: 'Go Back to Home' },
            { keys: 'Ctrl + /', desc: 'Toggle This Help Overlay' }
        ];

        shortcuts.forEach(function (s) {
            var row = document.createElement('div');
            row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #333';
            var kbd = document.createElement('kbd');
            kbd.textContent = s.keys;
            kbd.style.cssText = 'background:#2a2a4a;border:1px solid #555;border-radius:6px;padding:4px 12px;font-size:0.9rem;color:#7CB342;font-family:monospace';
            var desc = document.createElement('span');
            desc.textContent = s.desc;
            desc.style.cssText = 'color:#ccc;font-size:0.95rem';
            row.appendChild(kbd);
            row.appendChild(desc);
            content.appendChild(row);
        });

        var closeHint = document.createElement('p');
        closeHint.textContent = 'Press Ctrl + / or Esc to close';
        closeHint.style.cssText = 'margin:20px 0 0 0;text-align:center;color:#666;font-size:0.85rem';
        content.appendChild(closeHint);

        helpOverlayEl.appendChild(content);
        document.body.appendChild(helpOverlayEl);

        helpOverlayEl.addEventListener('click', function (e) {
            if (e.target === helpOverlayEl) hideHelpOverlay();
        });

        return helpOverlayEl;
    }

    function showHelpOverlay() {
        createHelpOverlay();
        helpOverlayEl.style.display = 'flex';
        helpOverlayVisible = true;
    }

    function hideHelpOverlay() {
        if (helpOverlayEl) {
            helpOverlayEl.style.display = 'none';
        }
        helpOverlayVisible = false;
    }

    function toggleHelpOverlay() {
        if (helpOverlayVisible) {
            hideHelpOverlay();
        } else {
            showHelpOverlay();
        }
    }

    function handleKeyDown(e) {
        var ctrl = e.ctrlKey || e.metaKey;

        // Ctrl + / : toggle help overlay
        if (ctrl && e.key === '/') {
            e.preventDefault();
            toggleHelpOverlay();
            return;
        }

        // Escape: go home or close help
        if (e.key === 'Escape') {
            if (helpOverlayVisible) {
                hideHelpOverlay();
                return;
            }
            goHome();
            return;
        }

        // Don't interfere with text input
        if (isInputFocused()) return;

        // Ctrl+K: global search
        if (ctrl && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            openGlobalSearch();
            return;
        }

        // Ctrl+E: error notebook
        if (ctrl && (e.key === 'e' || e.key === 'E')) {
            e.preventDefault();
            openErrorNotebook();
            return;
        }

        // Ctrl+M: mock exam
        if (ctrl && (e.key === 'm' || e.key === 'M')) {
            e.preventDefault();
            openMockExam();
            return;
        }

        // Ctrl+D: study dashboard
        if (ctrl && (e.key === 'd' || e.key === 'D')) {
            e.preventDefault();
            openStudyDashboard();
            return;
        }

        // Ctrl+P: pomodoro
        if (ctrl && (e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            openPomodoro();
            return;
        }

        // Number keys 1-6: subject switching (no modifier)
        if (!ctrl && !e.altKey && !e.shiftKey) {
            var subject = SUBJECT_MAP[e.key];
            if (subject) {
                e.preventDefault();
                navigateToSection(subject.section, subject.nav);
                return;
            }
        }
    }

    function init() {
        document.addEventListener('keydown', handleKeyDown);
        createHelpOverlay();
        console.log('[keyboardShortcuts] initialized - press Ctrl+/ for help');
    }

    return {
        init: init,
        showHelp: showHelpOverlay,
        hideHelp: hideHelpOverlay,
        toggleHelp: toggleHelpOverlay
    };
})();

// ============================================================
// 2. ACCESSIBILITY ENHANCER MODULE
// ============================================================
window.accessibilityEnhancer = (function () {
    'use strict';

    function addAriaToNavButtons() {
        var navBtns = document.querySelectorAll('.nav-btn, .navbar a, .nav-links a');
        navBtns.forEach(function (btn) {
            if (!btn.getAttribute('aria-label')) {
                var text = btn.textContent || btn.getAttribute('data-subject') || '';
                var subject = btn.getAttribute('data-subject');
                if (subject) {
                    var labels = {
                        physics: 'Physics Section',
                        chemistry: 'Chemistry Section',
                        biology: 'Biology Section',
                        chinese: 'Chinese Section',
                        math: 'Math Section',
                        english: 'English Section'
                    };
                    btn.setAttribute('aria-label', labels[subject] || text);
                } else {
                    btn.setAttribute('aria-label', text.trim() || 'Navigation Button');
                }
                btn.setAttribute('role', 'button');
            }
        });
    }

    function addAriaToToolCards() {
        var toolCards = document.querySelectorAll('.tool-card, .quick-tool-btn, .feature-card, .feature-card-enhanced');
        toolCards.forEach(function (card) {
            if (!card.getAttribute('aria-label')) {
                var title = card.querySelector('h3, h4, .tool-name, .tool-title');
                var label = title ? title.textContent.trim() : (card.textContent || '').trim().slice(0, 60);
                card.setAttribute('aria-label', label || 'Tool Card');
            }
            if (!card.getAttribute('role')) {
                card.setAttribute('role', 'button');
            }
            if (!card.hasAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
            }

            // Add keyboard activation (Enter or Space to activate)
            if (!card._accessibilityEnhanced) {
                card._accessibilityEnhanced = true;
                card.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        var clickTarget = card.querySelector('button, a') || card;
                        clickTarget.click();
                    }
                });
            }
        });
    }

    function addAriaToBackButtons() {
        var backBtns = document.querySelectorAll('.back-btn, .back-button, [class*="back"]');
        backBtns.forEach(function (btn) {
            if (!btn.getAttribute('aria-label')) {
                btn.setAttribute('aria-label', 'Go Back');
            }
            if (!btn.getAttribute('role')) {
                btn.setAttribute('role', 'button');
            }
        });
    }

    function addRoleMain() {
        var mainContent = document.querySelector('.section.active, #home, .main-content, .presentation, main');
        if (mainContent && !mainContent.getAttribute('role')) {
            mainContent.setAttribute('role', 'main');
        }
        // Also ensure any existing main elements are labeled
        var mains = document.querySelectorAll('main, [role="main"]');
        if (mains.length === 0) {
            var container = document.querySelector('.presentation') ||
                            document.querySelector('#app') ||
                            document.querySelector('.container');
            if (container) {
                container.setAttribute('role', 'main');
            }
        }
    }

    function addTabindexToInteractive() {
        var interactive = document.querySelectorAll(
            'button:not([tabindex]), ' +
            'a:not([tabindex]), ' +
            'select:not([tabindex]), ' +
            '[onclick]:not([tabindex]):not(button):not(a)'
        );
        interactive.forEach(function (el) {
            var tag = (el.tagName || '').toLowerCase();
            if (tag !== 'button' && tag !== 'a' && tag !== 'select' && tag !== 'input' && tag !== 'textarea') {
                if (!el.hasAttribute('tabindex')) {
                    el.setAttribute('tabindex', '0');
                }
            }
        });
    }

    function addAriaLandmarks() {
        // Add aria-label to search input
        var searchInputs = document.querySelectorAll(
            '#global-search-input, input[type="search"], input[placeholder*="search"], input[placeholder*="\u641c\u7d22"]'
        );
        searchInputs.forEach(function (input) {
            if (!input.getAttribute('aria-label')) {
                input.setAttribute('aria-label', 'Search');
            }
        });

        // Add aria-label to nav element
        var navs = document.querySelectorAll('nav, .navbar, .navigation');
        navs.forEach(function (nav) {
            if (!nav.getAttribute('aria-label')) {
                nav.setAttribute('aria-label', 'Main Navigation');
            }
            nav.setAttribute('role', 'navigation');
        });

        // Add aria-label to footer
        var footers = document.querySelectorAll('footer, .footer');
        footers.forEach(function (footer) {
            if (!footer.getAttribute('aria-label')) {
                footer.setAttribute('aria-label', 'Footer');
            }
        });
    }

    function enhanceDynamicContent() {
        // Use MutationObserver to enhance dynamically added content
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) return;
                    if (node.classList && (node.classList.contains('tool-card') || node.classList.contains('quick-tool-btn'))) {
                        addAriaToToolCards();
                    }
                    if (node.querySelector && node.querySelector('.tool-card, .quick-tool-btn, .back-btn')) {
                        addAriaToToolCards();
                        addAriaToBackButtons();
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function init() {
        addAriaToNavButtons();
        addAriaToToolCards();
        addAriaToBackButtons();
        addRoleMain();
        addTabindexToInteractive();
        addAriaLandmarks();
        enhanceDynamicContent();
        console.log('[accessibilityEnhancer] initialized - ARIA labels and keyboard navigation added');
    }

    return {
        init: init,
        refresh: init
    };
})();

// ============================================================
// 3. DATA EXPORTER MODULE
// ============================================================
window.dataExporter = (function () {
    'use strict';

    var STORAGE_KEYS = [
        'hspcb_error_notebook',
        'hspcb_exam_history',
        'hspcb_quiz_records',
        'hspcb_wrong_records',
        'hspcb_game_scores',
        'hspcb_recitation_scores',
        'hspcb_card_game_best',
        'hspcb_concept_game_best',
        'hspcb_daily_checkin',
        'hspcb_english_vocabulary',
        'hspcb_manual_mastery',
        'hspcb_open_answer_records',
        'hspcb_spaced_repetition',
        'hspcb_scratchpad_data',
        'hspcb_study_tasks',
        'hspcb_framework_records',
        'hspcb_variation_history',
        'hspcb_onboarding_complete',
        'hspcb_global_search_recent',
        'mockExamHistory',
        'dailyLearningState',
        'equationFavorites',
        'examPractice_stats',
        'genetics_history',
        'genetics_score',
        'safety_history',
        'wrongPhotosynthesis',
        'cn_sentence_correction_history',
        'photo_score',
        'photo_wrong_answers',
        'theme',
        'themePreference',
        'darkMode',
        'pomodoroData',
        'pomodoro_stats'
    ];

    function collectAllData() {
        var data = {};
        var stats = { totalKeys: 0, totalSize: 0 };

        STORAGE_KEYS.forEach(function (key) {
            try {
                var raw = localStorage.getItem(key);
                if (raw !== null) {
                    data[key] = raw;
                    stats.totalKeys++;
                    stats.totalSize += raw.length;
                }
            } catch (e) {
                // Skip inaccessible keys
            }
        });

        // Also scan for any other hspcb_ prefixed keys
        try {
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key && key.indexOf('hspcb_') === 0 && !data[key]) {
                    data[key] = localStorage.getItem(key);
                    stats.totalKeys++;
                    stats.totalSize += (data[key] || '').length;
                }
            }
        } catch (e) {
            // Ignore
        }

        data.__meta = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            keyCount: stats.totalKeys,
            approxSizeBytes: stats.totalSize,
            platform: 'HSPCB'
        };

        return data;
    }

    function downloadJSON(data, filename) {
        var jsonStr = JSON.stringify(data, null, 2);
        var blob = new Blob([jsonStr], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename || ('hspcb-data-export-' + Date.now() + '.json');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function handleExport() {
        var data = collectAllData();
        var dateStr = new Date().toISOString().slice(0, 10);
        downloadJSON(data, 'hspcb-backup-' + dateStr + '.json');
        showToast('Data exported successfully (' + data.__meta.keyCount + ' keys)');
    }

    function handleImport(file) {
        if (!file) {
            showToast('No file selected', 'error');
            return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            try {
                var data = JSON.parse(e.target.result);
                if (!data || typeof data !== 'object') {
                    showToast('Invalid file format', 'error');
                    return;
                }

                var importedCount = 0;
                Object.keys(data).forEach(function (key) {
                    if (key === '__meta') return;
                    try {
                        var value = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
                        localStorage.setItem(key, value);
                        importedCount++;
                    } catch (err) {
                        console.warn('Failed to import key:', key, err);
                    }
                });

                showToast('Imported ' + importedCount + ' data entries. Reloading...');
                setTimeout(function () {
                    window.location.reload();
                }, 1500);
            } catch (err) {
                showToast('Failed to parse file: ' + err.message, 'error');
            }
        };
        reader.onerror = function () {
            showToast('Failed to read file', 'error');
        };
        reader.readAsText(file);
    }

    function handleClearAll() {
        var confirmed = confirm(
            'WARNING: This will permanently delete ALL your study data including:\n' +
            '- Error notebook entries\n' +
            '- Mock exam history\n' +
            '- Pomodoro records\n' +
            '- Game scores\n' +
            '- Notes and recitation scores\n' +
            '- Theme preferences\n\n' +
            'This action CANNOT be undone. Make sure you have exported a backup first.\n\n' +
            'Click OK to proceed, or Cancel to abort.'
        );

        if (!confirmed) return;

        var doubleConfirm = confirm('Are you absolutely sure? This will erase everything.');
        if (!doubleConfirm) return;

        STORAGE_KEYS.forEach(function (key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                // Ignore
            }
        });

        // Also remove any hspcb_ prefixed keys
        try {
            var keysToRemove = [];
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key && key.indexOf('hspcb_') === 0) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(function (key) {
                localStorage.removeItem(key);
            });
        } catch (e) {
            // Ignore
        }

        showToast('All study data cleared. Reloading...');
        setTimeout(function () {
            window.location.reload();
        }, 1500);
    }

    function showToast(msg, type) {
        var toast = document.createElement('div');
        toast.style.cssText = [
            'position:fixed',
            'bottom:30px',
            'left:50%',
            'transform:translateX(-50%)',
            'background:' + (type === 'error' ? '#e53935' : '#2e7d32'),
            'color:#fff',
            'padding:14px 28px',
            'border-radius:10px',
            'font-size:0.95rem',
            'z-index:99999',
            'box-shadow:0 4px 20px rgba(0,0,0,0.3)',
            'opacity:0',
            'transition:opacity 0.3s'
        ].join(';');
        toast.textContent = msg;
        document.body.appendChild(toast);

        requestAnimationFrame(function () {
            toast.style.opacity = '1';
        });

        setTimeout(function () {
            toast.style.opacity = '0';
            setTimeout(function () {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 3000);
    }

    function render() {
        var app = document.getElementById('data-exporter-app');
        if (!app) {
            console.warn('[dataExporter] #data-exporter-app container not found');
            return;
        }

        var data = collectAllData();
        var sizeKB = (data.__meta.approxSizeBytes / 1024).toFixed(1);

        var html = '<div class="knowledge-section" style="max-width:700px;margin:0 auto;padding:30px;">';
        html += '<h2 style="text-align:center;margin-bottom:8px;">Data Management Center</h2>';
        html += '<p style="text-align:center;color:#888;margin-bottom:30px;">Backup, restore, or clear your study data</p>';

        // Stats card
        html += '<div style="background:#1a1a2e;border:1px solid #333;border-radius:12px;padding:24px;margin-bottom:24px;">';
        html += '<h3 style="margin:0 0 16px 0;color:#4A90D9;">Data Overview</h3>';
        html += '<div style="display:flex;gap:20px;flex-wrap:wrap;">';
        html += '<div style="flex:1;min-width:140px;text-align:center;padding:16px;background:#2a2a4a;border-radius:8px;">';
        html += '<div style="font-size:2rem;font-weight:bold;color:#7CB342;">' + data.__meta.keyCount + '</div>';
        html += '<div style="color:#888;font-size:0.85rem;">Data Keys</div>';
        html += '</div>';
        html += '<div style="flex:1;min-width:140px;text-align:center;padding:16px;background:#2a2a4a;border-radius:8px;">';
        html += '<div style="font-size:2rem;font-weight:bold;color:#4A90D9;">' + sizeKB + ' KB</div>';
        html += '<div style="color:#888;font-size:0.85rem;">Total Size</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        // Export section
        html += '<div style="background:#1a1a2e;border:1px solid #333;border-radius:12px;padding:24px;margin-bottom:16px;">';
        html += '<h3 style="margin:0 0 8px 0;color:#7CB342;">Export Data</h3>';
        html += '<p style="color:#888;font-size:0.9rem;margin:0 0 16px 0;">Download all your study data as a JSON backup file. Includes error notebook, exam history, game scores, notes, and more.</p>';
        html += '<button id="de-export-btn" style="width:100%;padding:14px;background:linear-gradient(135deg,#43a047,#2e7d32);color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.85" onmouseout="this.style.opacity=1">';
        html += 'Download Backup (JSON)';
        html += '</button>';
        html += '</div>';

        // Import section
        html += '<div style="background:#1a1a2e;border:1px solid #333;border-radius:12px;padding:24px;margin-bottom:16px;">';
        html += '<h3 style="margin:0 0 8px 0;color:#4A90D9;">Import Data</h3>';
        html += '<p style="color:#888;font-size:0.9rem;margin:0 0 16px 0;">Restore from a previously exported JSON backup file. This will overwrite existing data.</p>';
        html += '<label for="de-import-input" style="display:block;width:100%;padding:14px;background:#1a3a5e;color:#fff;border:2px dashed #4A90D9;border-radius:8px;font-size:1rem;cursor:pointer;text-align:center;transition:background 0.2s;" onmouseover="this.style.background=\'#1a4a7e\'" onmouseout="this.style.background=\'#1a3a5e\'">';
        html += 'Choose JSON File to Import';
        html += '</label>';
        html += '<input type="file" id="de-import-input" accept=".json,application/json" style="display:none" />';
        html += '<p id="de-import-status" style="color:#888;font-size:0.85rem;margin:8px 0 0 0;text-align:center;"></p>';
        html += '</div>';

        // Clear section
        html += '<div style="background:#1a1a2e;border:1px solid #e53935;border-radius:12px;padding:24px;margin-bottom:16px;">';
        html += '<h3 style="margin:0 0 8px 0;color:#e53935;">Clear All Data</h3>';
        html += '<p style="color:#888;font-size:0.9rem;margin:0 0 16px 0;">Permanently delete all study data. This action cannot be undone. Make sure to export a backup first.</p>';
        html += '<button id="de-clear-btn" style="width:100%;padding:14px;background:linear-gradient(135deg,#e53935,#c62828);color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.85" onmouseout="this.style.opacity=1">';
        html += 'Delete All Data';
        html += '</button>';
        html += '</div>';

        // Data breakdown
        html += '<div style="background:#1a1a2e;border:1px solid #333;border-radius:12px;padding:24px;">';
        html += '<h3 style="margin:0 0 12px 0;color:#aaa;">Data Breakdown</h3>';
        html += '<div style="display:flex;flex-direction:column;gap:6px;">';
        var hasAny = false;
        STORAGE_KEYS.forEach(function (key) {
            var raw = localStorage.getItem(key);
            if (raw !== null) {
                hasAny = true;
                var size = (raw.length / 1024).toFixed(1);
                html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #2a2a3a;font-size:0.85rem;">';
                html += '<span style="color:#ccc;">' + key + '</span>';
                html += '<span style="color:#666;">' + size + ' KB</span>';
                html += '</div>';
            }
        });
        if (!hasAny) {
            html += '<p style="color:#666;text-align:center;padding:12px;">No data stored yet</p>';
        }
        html += '</div>';
        html += '</div>';

        html += '</div>';

        app.innerHTML = html;

        // Attach event listeners
        var exportBtn = document.getElementById('de-export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', handleExport);
        }

        var importInput = document.getElementById('de-import-input');
        if (importInput) {
            importInput.addEventListener('change', function () {
                var file = this.files[0];
                var status = document.getElementById('de-import-status');
                if (file) {
                    if (status) status.textContent = 'Importing ' + file.name + '...';
                    handleImport(file);
                }
            });
        }

        var clearBtn = document.getElementById('de-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', handleClearAll);
        }
    }

    return {
        render: render,
        collectAllData: collectAllData,
        export: handleExport,
        import: handleImport,
        clearAll: handleClearAll
    };
})();

// ============================================================
// 4. LAZY LOADER MODULE
// ============================================================
window.lazyLoader = (function () {
    'use strict';

    // Map of tool IDs to JS file paths and render function names
    var TOOL_SCRIPT_MAP = {
        'physics-formula':            { file: 'js/physics-formula-calculator.js', render: 'physicsFormulaCalculator.renderCalculator', type: 'object' },
        'physics-projectile':         { file: 'js/physics-wave-optics.js',        render: 'projectileSimulator.renderSimulator',      type: 'object' },
        'chemistry-balancer':         { file: 'js/interactive-chemistry.js',     render: 'renderChemistryBalancer',                  type: 'function' },
        'chemistry-quiz':             { file: 'js/interactive-chemistry.js',     render: 'renderChemistryQuiz',                      type: 'function' },
        'chemistry-process-analyzer': { file: 'js/enhanced-tools.js',             render: 'chemistryProcessAnalyzerEnhanced.render',  type: 'object' },
        'biology-genetics':           { file: 'js/interactive-physics-bio.js',   render: 'geneticsSimulator.render',                 type: 'object' },
        'biology-mindmap':            { file: 'js/enhanced-tools.js',             render: 'biologyMindMapEnhanced.render',            type: 'object' },
        'biology-photosynthesis':     { file: 'js/enhanced-tools.js',             render: 'photosynthesisTrainerEnhanced.render',     type: 'object' },
        'biology-pedigree':           { file: 'js/enhanced-tools.js',             render: 'geneticsPedigreeTrainerEnhanced.render',   type: 'object' },
        'biology-experiment':         { file: 'js/enhanced-tools.js',             render: 'experimentDesignerEnhanced.render',        type: 'object' },
        'chinese-sentence-correction':{ file: 'js/chinese-sentence-correction.js',render: 'sentenceCorrectionTool.render',           type: 'object' },
        'chinese-tools':              { file: 'js/chinese-tools.js',              render: 'chineseTools.render',                      type: 'object' },
        'english-vocabulary':         { file: 'js/english-vocabulary.js',         render: 'englishVocabulary.render',                 type: 'object' },
        'math-grapher':               { file: 'js/math-tools.js',                 render: 'mathTools.renderGrapher',                   type: 'object' },
        'math-derivative':            { file: 'js/math-tools.js',                 render: 'mathTools.renderDerivative',                type: 'object' },
        'math-geometry':              { file: 'js/math-tools.js',                 render: 'mathTools.renderGeometry',                  type: 'object' },
        'math-probability':           { file: 'js/math-tools.js',                 render: 'mathTools.renderProbability',               type: 'object' },
        'error-notebook':             { file: 'js/error-notebook.js',             render: 'errorNotebook.render',                     type: 'object' },
        'mock-exam':                  { file: 'js/mock-exam.js',                  render: 'mockExam.render',                          type: 'object' },
        'global-search':              { file: 'js/global-search.js',              render: 'globalSearch.render',                      type: 'object' },
        'study-dashboard':            { file: 'js/study-dashboard.js',            render: 'studyDashboard.render',                    type: 'object' },
        'learning-tools':             { file: 'js/learning-tools.js',             render: 'learningTools.render',                     type: 'object' },
        'open-answer-trainer':        { file: 'js/open-answer-trainer.js',        render: 'openAnswerTrainer.render',                 type: 'object' },
        'auxiliary-tools':            { file: 'js/auxiliary-tools.js',            render: 'auxiliaryTools.render',                    type: 'object' },
        'exam-review':                { file: 'js/exam-review-system.js',         render: 'examReviewSystem.render',                  type: 'object' },
        'onboarding':                 { file: 'js/onboarding.js',                 render: 'onboarding.render',                        type: 'object' },
        'game-scratchpad':            { file: 'js/game-scratchpad.js',            render: 'gameScratchpad.render',                    type: 'object' },
        'data-exporter':              { file: 'js/study-tools-enhanced.js',       render: 'dataExporter.render',                      type: 'object' }
    };

    var loadedScripts = {};
    var originalNavigateToolPage = null;

    function isScriptLoaded(filePath) {
        if (loadedScripts[filePath]) return true;
        var scripts = document.querySelectorAll('script[src]');
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].getAttribute('src') || '';
            if (src.indexOf(filePath) >= 0 || src.indexOf(filePath.replace('js/', '')) >= 0) {
                loadedScripts[filePath] = true;
                return true;
            }
        }
        return false;
    }

    function loadScript(filePath, callback) {
        if (isScriptLoaded(filePath)) {
            callback();
            return;
        }

        var script = document.createElement('script');
        script.src = filePath;
        script.type = 'text/javascript';
        script.async = true;

        script.onload = function () {
            loadedScripts[filePath] = true;
            callback();
        };

        script.onerror = function () {
            console.error('[lazyLoader] Failed to load script:', filePath);
            callback(new Error('Failed to load ' + filePath));
        };

        document.head.appendChild(script);
    }

    function callRenderFunction(renderPath) {
        var parts = renderPath.split('.');
        var obj = window;
        for (var i = 0; i < parts.length; i++) {
            if (obj == null) return false;
            obj = obj[parts[i]];
        }
        if (typeof obj === 'function') {
            obj.call(null);
            return true;
        }
        return false;
    }

    function showLoadingSpinner(container) {
        if (!container) return;
        container.innerHTML =
            '<div style="display:flex;align-items:center;justify-content:center;min-height:200px;flex-direction:column;">' +
            '<div style="width:48px;height:48px;border:4px solid #333;border-top-color:#4A90D9;border-radius:50%;' +
            'animation:ll-spin 0.8s linear infinite;"></div>' +
            '<p style="color:#888;margin-top:16px;font-size:0.9rem;">Loading tool...</p>' +
            '</div>' +
            '<style>@keyframes ll-spin{to{transform:rotate(360deg)}}</style>';
    }

    function enhancedNavigateToolPage(tool) {
        if (!tool) return;

        var mapEntry = TOOL_SCRIPT_MAP[tool];

        // Show the section first
        var sectionId = tool + '-section';
        var targetSection = document.getElementById(sectionId);
        if (!targetSection) {
            console.warn('[lazyLoader] Section not found:', sectionId);
            return;
        }

        if (typeof showSection === 'function') {
            showSection(sectionId);
        } else {
            document.querySelectorAll('.section').forEach(function (s) {
                s.classList.remove('active');
            });
            targetSection.classList.add('active');
        }

        // If no script mapping, fall back to original function
        if (!mapEntry) {
            if (originalNavigateToolPage) {
                return originalNavigateToolPage(tool);
            }
            console.warn('[lazyLoader] No script mapping for tool:', tool);
            return;
        }

        // Find app container
        var appEl = targetSection.querySelector('.tool-app-container') ||
                     targetSection.querySelector('[id$="-app"]');

        // Show loading spinner
        if (appEl) {
            showLoadingSpinner(appEl);
        }

        // Load script and render
        loadScript(mapEntry.file, function (err) {
            if (err) {
                if (appEl) {
                    appEl.innerHTML = '<div class="knowledge-section"><p style="color:#e53935;text-align:center;padding:40px;">' +
                        'Failed to load tool. Please refresh the page and try again.</p></div>';
                }
                return;
            }

            // Small delay to ensure script is fully initialized
            setTimeout(function () {
                var success = callRenderFunction(mapEntry.render);
                if (!success) {
                    if (originalNavigateToolPage) {
                        originalNavigateToolPage(tool);
                    } else if (appEl) {
                        appEl.innerHTML = '<div class="knowledge-section"><p style="color:#888;text-align:center;padding:40px;">' +
                            'Tool is loading. Please wait...</p></div>';
                    }
                }
            }, 50);
        });
    }

    function init() {
        // Store original navigateToolPage if it exists
        if (typeof navigateToolPage === 'function') {
            originalNavigateToolPage = navigateToolPage;
        }

        // Override the global navigateToolPage
        window.navigateToolPage = enhancedNavigateToolPage;
        try {
            navigateToolPage = enhancedNavigateToolPage;
        } catch (e) {
            // It might be in strict mode or const, ignore
        }

        console.log('[lazyLoader] initialized - navigateToolPage overridden for lazy loading');
    }

    return {
        init: init,
        loadScript: loadScript,
        isLoaded: isScriptLoaded,
        getMap: function () { return TOOL_SCRIPT_MAP; },
        registerTool: function (toolId, file, renderFn, type) {
            TOOL_SCRIPT_MAP[toolId] = { file: file, render: renderFn, type: type || 'function' };
        }
    };
})();

// ============================================================
// AUTO-INITIALIZATION (on DOMContentLoaded)
// ============================================================
(function () {
    function autoInit() {
        try {
            if (window.keyboardShortcuts) window.keyboardShortcuts.init();
        } catch (e) {
            console.error('[study-tools-enhanced] keyboardShortcuts init failed:', e);
        }
        try {
            if (window.accessibilityEnhancer) window.accessibilityEnhancer.init();
        } catch (e) {
            console.error('[study-tools-enhanced] accessibilityEnhancer init failed:', e);
        }
        try {
            if (window.lazyLoader) window.lazyLoader.init();
        } catch (e) {
            console.error('[study-tools-enhanced] lazyLoader init failed:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }
})();

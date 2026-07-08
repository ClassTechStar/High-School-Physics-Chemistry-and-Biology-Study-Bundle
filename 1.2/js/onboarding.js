window.onboarding = (function() {
    'use strict';

    var STORAGE_KEY = 'hspcb_onboarding_complete';
    var STEPS = [
        {
            title: '欢迎来到 HSPCB',
            text: '这是你的高考备考一站式平台。我们整合了九大学科的知识图谱、历年真题、模拟考试和学习工具，帮助你高效备战高考。',
            spotlight: null,
            position: 'center'
        },
        {
            title: '导航栏',
            text: '顶部导航栏可以快速切换学科：语文、数学、英语、物理、化学、生物、政治、历史、地理。点击任意学科即可进入对应的学习模块。',
            spotlight: '.main-nav',
            position: 'bottom'
        },
        {
            title: '快捷工具',
            text: '首页下方的快捷工具区提供了常用功能入口：错题本、模拟考试、知识图谱、学习工具等，一键直达你需要的功能。',
            spotlight: '.quick-access',
            position: 'top'
        },
        {
            title: '考试中心',
            text: '在考试中心，你可以进行限时模拟考试、查看历年真题、分析成绩趋势。支持自动批改和详细解析，帮你找到薄弱环节。',
            spotlight: '.exam-center-section',
            position: 'top'
        },
        {
            title: '准备就绪！',
            text: '你已经了解了平台的基本功能。现在开始你的学习之旅吧！点击"开始学习"进入主页，祝你备考顺利，金榜题名！',
            spotlight: null,
            position: 'center'
        }
    ];

    var currentStep = 0;
    var overlayEl = null;
    var spotlightEl = null;
    var tooltipEl = null;
    var dotsEl = null;
    var helpBtn = null;

    /* ========== CSS INJECTION ========== */

    function injectStyles() {
        if (document.getElementById('hspcb-onboarding-styles')) return;
        var style = document.createElement('style');
        style.id = 'hspcb-onboarding-styles';
        style.textContent =
            '#hspcb-onboarding-overlay {' +
                'position: fixed; top: 0; left: 0; width: 100%; height: 100%;' +
                'background: rgba(0, 0, 0, 0.65); z-index: 10000;' +
                'transition: opacity 0.3s ease;' +
            '}' +
            '#hspcb-onboarding-spotlight {' +
                'position: fixed; z-index: 10001;' +
                'border-radius: 8px;' +
                'box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.65);' +
                'transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);' +
                'pointer-events: none;' +
            '}' +
            '#hspcb-onboarding-tooltip {' +
                'position: fixed; z-index: 10002;' +
                'background: #ffffff; border-radius: 12px;' +
                'padding: 28px 32px; max-width: 420px;' +
                'box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);' +
                'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;' +
                'transition: opacity 0.3s ease, transform 0.3s ease;' +
            '}' +
            '#hspcb-onboarding-tooltip h2 {' +
                'margin: 0 0 8px 0; font-size: 20px; color: #1a1a2e;' +
            '}' +
            '#hspcb-onboarding-tooltip .onboarding-step-num {' +
                'font-size: 13px; color: #888; margin-bottom: 12px;' +
            '}' +
            '#hspcb-onboarding-tooltip .onboarding-text {' +
                'font-size: 15px; color: #444; line-height: 1.7; margin-bottom: 24px;' +
            '}' +
            '#hspcb-onboarding-tooltip .onboarding-buttons {' +
                'display: flex; align-items: center; justify-content: space-between;' +
            '}' +
            '#hspcb-onboarding-tooltip .onboarding-btn {' +
                'padding: 10px 24px; border-radius: 8px; font-size: 14px; cursor: pointer;' +
                'border: none; transition: all 0.2s; font-family: inherit;' +
            '}' +
            '#hspcb-onboarding-tooltip .onboarding-btn-skip {' +
                'background: transparent; color: #999;' +
            '}' +
            '#hspcb-onboarding-tooltip .onboarding-btn-skip:hover {' +
                'color: #666;' +
            '}' +
            '#hspcb-onboarding-tooltip .onboarding-btn-next {' +
                'background: #4a6cf7; color: #fff;' +
            '}' +
            '#hspcb-onboarding-tooltip .onboarding-btn-next:hover {' +
                'background: #3b5de7;' +
            '}' +
            '#hspcb-onboarding-tooltip .onboarding-btn-finish {' +
                'background: linear-gradient(135deg, #4a6cf7, #6c5ce7); color: #fff;' +
            '}' +
            '#hspcb-onboarding-tooltip .onboarding-btn-finish:hover {' +
                'opacity: 0.9;' +
            '}' +
            '#hspcb-onboarding-dots {' +
                'display: flex; gap: 8px;' +
            '}' +
            '#hspcb-onboarding-dots .onboarding-dot {' +
                'width: 8px; height: 8px; border-radius: 50%; background: #ddd;' +
                'transition: all 0.3s;' +
            '}' +
            '#hspcb-onboarding-dots .onboarding-dot.active {' +
                'background: #4a6cf7; width: 24px; border-radius: 4px;' +
            '}' +
            '#hspcb-onboarding-help {' +
                'position: fixed; bottom: 28px; right: 28px; z-index: 9999;' +
                'width: 44px; height: 44px; border-radius: 50%;' +
                'background: #4a6cf7; color: #fff; font-size: 22px;' +
                'border: none; cursor: pointer;' +
                'box-shadow: 0 4px 16px rgba(74, 108, 247, 0.4);' +
                'display: flex; align-items: center; justify-content: center;' +
                'transition: all 0.3s;' +
            '}' +
            '#hspcb-onboarding-help:hover {' +
                'background: #3b5de7; transform: scale(1.1);' +
            '}';
        document.head.appendChild(style);
    }

    /* ========== DOM BUILDERS ========== */

    function createOverlay() {
        var el = document.createElement('div');
        el.id = 'hspcb-onboarding-overlay';
        document.body.appendChild(el);
        return el;
    }

    function createSpotlight() {
        var el = document.createElement('div');
        el.id = 'hspcb-onboarding-spotlight';
        document.body.appendChild(el);
        return el;
    }

    function createTooltip() {
        var el = document.createElement('div');
        el.id = 'hspcb-onboarding-tooltip';
        document.body.appendChild(el);
        return el;
    }

    function createHelpButton() {
        if (document.getElementById('hspcb-onboarding-help')) return;
        var btn = document.createElement('button');
        btn.id = 'hspcb-onboarding-help';
        btn.title = '查看新手指引';
        btn.textContent = '?';
        btn.addEventListener('click', function() {
            startGuide();
        });
        document.body.appendChild(btn);
        return btn;
    }

    /* ========== POSITIONING ========== */

    function getSpotlightRect(selector) {
        if (!selector) return null;
        try {
            var el = document.querySelector(selector);
            if (!el) return null;
            var rect = el.getBoundingClientRect();
            return {
                top: rect.top - 8,
                left: rect.left - 8,
                width: rect.width + 16,
                height: rect.height + 16
            };
        } catch (e) {
            return null;
        }
    }

    function positionSpotlight(rect) {
        if (!rect) {
            spotlightEl.style.display = 'none';
            return;
        }
        spotlightEl.style.display = 'block';
        spotlightEl.style.top = rect.top + 'px';
        spotlightEl.style.left = rect.left + 'px';
        spotlightEl.style.width = rect.width + 'px';
        spotlightEl.style.height = rect.height + 'px';
    }

    function positionTooltip(spotlightRect, position) {
        var tipW = 420;
        var tipH = 240;
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var top, left;

        if (position === 'center' || !spotlightRect) {
            top = (vh - tipH) / 2;
            left = (vw - tipW) / 2;
        } else if (position === 'bottom') {
            top = spotlightRect.top + spotlightRect.height + 16;
            left = spotlightRect.left + spotlightRect.width / 2 - tipW / 2;
        } else if (position === 'top') {
            top = spotlightRect.top - tipH - 16;
            left = spotlightRect.left + spotlightRect.width / 2 - tipW / 2;
        } else {
            top = (vh - tipH) / 2;
            left = (vw - tipW) / 2;
        }

        // Clamp
        top = Math.max(10, Math.min(top, vh - tipH - 10));
        left = Math.max(10, Math.min(left, vw - tipW - 10));

        tooltipEl.style.top = top + 'px';
        tooltipEl.style.left = left + 'px';
    }

    /* ========== STEP RENDERING ========== */

    function renderStep(stepIndex) {
        var step = STEPS[stepIndex];
        if (!step) return;

        var spotlightRect = getSpotlightRect(step.spotlight);
        positionSpotlight(spotlightRect);
        positionTooltip(spotlightRect, step.position);

        var isLast = stepIndex === STEPS.length - 1;

        var html = '<h2>' + step.title + '</h2>';
        html += '<div class="onboarding-step-num">' + (stepIndex + 1) + ' / ' + STEPS.length + '</div>';
        html += '<div class="onboarding-text">' + step.text + '</div>';
        html += '<div class="onboarding-buttons">';
        html += '<div id="hspcb-onboarding-dots">';
        for (var i = 0; i < STEPS.length; i++) {
            html += '<div class="onboarding-dot' + (i === stepIndex ? ' active' : '') + '"></div>';
        }
        html += '</div>';
        html += '<div>';
        html += '<button class="onboarding-btn onboarding-btn-skip" id="onboarding-skip-btn">' + (isLast ? '' : '跳过') + '</button>';
        if (isLast) {
            html += '<button class="onboarding-btn onboarding-btn-finish" id="onboarding-next-btn">开始学习</button>';
        } else {
            html += '<button class="onboarding-btn onboarding-btn-next" id="onboarding-next-btn">下一步</button>';
        }
        html += '</div></div>';

        tooltipEl.innerHTML = html;

        // Bind events
        document.getElementById('onboarding-skip-btn').addEventListener('click', function() {
            dismissGuide();
        });
        document.getElementById('onboarding-next-btn').addEventListener('click', function() {
            if (stepIndex < STEPS.length - 1) {
                currentStep++;
                renderStep(currentStep);
            } else {
                dismissGuide();
            }
        });
    }

    /* ========== LIFECYCLE ========== */

    function startGuide() {
        currentStep = 0;

        if (!overlayEl) overlayEl = createOverlay();
        else overlayEl.style.display = 'block';

        if (!spotlightEl) spotlightEl = createSpotlight();
        else spotlightEl.style.display = 'block';

        if (!tooltipEl) tooltipEl = createTooltip();
        else tooltipEl.style.display = 'block';

        overlayEl.style.opacity = '1';
        tooltipEl.style.opacity = '1';
        tooltipEl.style.transform = 'scale(1)';

        renderStep(0);
    }

    function dismissGuide() {
        if (overlayEl) overlayEl.style.display = 'none';
        if (spotlightEl) spotlightEl.style.display = 'none';
        if (tooltipEl) tooltipEl.style.display = 'none';

        // Mark complete
        try {
            localStorage.setItem(STORAGE_KEY, '1');
        } catch (e) {
            /* storage not available */
        }
    }

    function checkFirstVisit() {
        try {
            return localStorage.getItem(STORAGE_KEY) !== '1';
        } catch (e) {
            return true; // If storage unavailable, assume first visit
        }
    }

    /* ========== PUBLIC API ========== */

    function render() {
        injectStyles();
        createHelpButton();

        if (checkFirstVisit()) {
            // Small delay to let the page render first
            setTimeout(function() {
                startGuide();
            }, 800);
        }
    }

    /* ========== KEYBOARD SUPPORT ========== */

    function handleKeydown(e) {
        if (!overlayEl || overlayEl.style.display === 'none') return;
        if (e.key === 'Escape') {
            dismissGuide();
        } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
            e.preventDefault();
            if (currentStep < STEPS.length - 1) {
                currentStep++;
                renderStep(currentStep);
            } else {
                dismissGuide();
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (currentStep > 0) {
                currentStep--;
                renderStep(currentStep);
            }
        }
    }

    document.addEventListener('keydown', handleKeydown);

    return {
        render: render,
        checkFirstVisit: checkFirstVisit
    };
})();

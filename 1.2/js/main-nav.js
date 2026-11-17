/* main-nav.js — 主逻辑·路由/导航（v1.8 P3 自 main-inline.js 拆分）
   section 切换、导航高亮、工具页路由（navigateToolPage）、平台 tab、模块 tab、
   文档级 data-tool/data-module/data-subject/data-back 事件委托与语文侧栏补丁。 */
(function() {
    'use strict';
    var M = window.HSPCBMain;

    function walkUp(el, attr) {
        while (el && el !== document.body && el !== document.documentElement) {
            if (el.hasAttribute && el.hasAttribute(attr)) return el;
            el = el.parentElement;
        }
        return null;
    }

    function getClosestWithAttr(el, attr) {
        if (!el) return null;
        if (el.closest) {
            return el.closest('[' + attr + ']');
        }
        return walkUp(el, attr);
    }

    // 隐藏区块惰性实例化。<template data-lazy-content> 内的节点不在文档树中，
    // 首次导航到该 section 时才展开（当前用于语文知识库 20 张大表）。
    function materializeSection(id) {
        var sec = document.getElementById(id);
        if (!sec) return;
        var templates = sec.querySelectorAll('template[data-lazy-content]');
        for (var i = 0; i < templates.length; i++) {
            var tpl = templates[i];
            if (tpl.parentNode) tpl.parentNode.replaceChild(tpl.content, tpl);
        }
    }

    function showSection(id) {
        materializeSection(id);
        document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
        var sec = document.getElementById(id);
        if (sec) { sec.classList.add('active'); window.scrollTo({top:0,behavior:'smooth'}); }
        var subject = id.replace('-section', '');
        if (['physics', 'chemistry', 'biology'].indexOf(subject) >= 0) {
            var activeTab = document.querySelector('#' + id + ' .module-tab.active');
            var module = activeTab ? activeTab.getAttribute('data-module') : 'concepts';
            var contentEl = document.getElementById(subject + '-content');
            if (contentEl && !contentEl.hasChildNodes()) {
                if (typeof loadModuleContent === 'function') {
                    loadModuleContent(subject, module);
                } else if (typeof window.loadModuleContent === 'function') {
                    window.loadModuleContent(subject, module);
                }
            }
        }
        if (subject === 'platform' && typeof handlePlatformTab === 'function') {
            handlePlatformTab('overview');
        }
    }

    function setActiveNav(subject) {
        document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
        var btn = document.querySelector('[data-subject="' + subject + '"]');
        if (btn) btn.classList.add('active');
    }

    function navigateToolPage(tool) {
        if (!tool) return;
        try {
            var sectionId = tool + '-section';
            var targetSection = document.getElementById(sectionId);
            if (!targetSection) { console.warn('Section not found:', sectionId); return; }

            showSection(sectionId);

            var appEl = targetSection.querySelector('.tool-app-container') || targetSection.querySelector('[id$="-app"]');

            switch(tool) {
                case 'physics-measurement': M.views.renderPhysicsInstruments(); break;
                case 'chemistry-equipment': M.views.renderChemistryEquipment(); break;
                case 'biology-exam-skills': M.views.renderBiologyExamSkills(); break;
                case 'biology-knowledge-graph': M.views.renderBiologyKnowledgeGraph(); break;
                case 'biology-pcr-sim': M.views.renderPCRSimulation(); break;
                case 'biology-electrophoresis': M.views.renderElectrophoresisSimulation(); break;
                case 'physics-formula':
                    if(typeof physicsFormulaCalculator!=='undefined'&&typeof physicsFormulaCalculator.renderCalculator==='function')
                        physicsFormulaCalculator.renderCalculator();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>物理公式计算器加载中...</p></div>';
                    break;
                case 'physics-mechanics': M.views.populatePhysicsMechanics(); break;
                case 'physics-projectile':
                    if(typeof projectileSimulator!=='undefined'&&typeof projectileSimulator.renderSimulator==='function')
                        projectileSimulator.renderSimulator();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>抛体运动模拟器加载中...</p></div>';
                    break;
                case 'physics-electricity': M.views.populatePhysicsElectricity(); break;
                case 'physics-optics': M.views.populatePhysicsOptics(); break;
                case 'chemistry-balancer':
                    if(typeof renderChemistryBalancer==='function') renderChemistryBalancer();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>化学方程配平器加载中...</p></div>';
                    break;
                case 'chemistry-quiz':
                    if(typeof renderChemistryQuiz==='function') renderChemistryQuiz();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>化学练习系统加载中...</p></div>';
                    break;
                case 'chemistry-safety':
                    if(typeof chemistrySafetySystem!=='undefined'&&typeof chemistrySafetySystem.renderSystem==='function')
                        chemistrySafetySystem.renderSystem();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>化学安全系统加载中...</p></div>';
                    break;
                case 'chemistry-electrochem':
                    if(typeof electrochemistryViewer!=='undefined'&&typeof electrochemistryViewer.renderViewer==='function')
                        electrochemistryViewer.renderViewer();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>电化学可视化工具加载中...</p></div>';
                    break;
                case 'chemistry-process':
                    if(typeof chemicalProcessFlow!=='undefined'&&typeof chemicalProcessFlow.renderSystem==='function')
                        chemicalProcessFlow.renderSystem();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>工业流程分析器加载中...</p></div>';
                    break;
                case 'chemistry-organic':
                    if(typeof organicConverter!=='undefined'&&typeof organicConverter.renderConverter==='function')
                        organicConverter.renderConverter();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>有机物转化工具加载中...</p></div>';
                    break;
                case 'chemistry-notebook':
                    if(typeof equationNotebook!=='undefined'&&typeof equationNotebook.renderNotebook==='function')
                        equationNotebook.renderNotebook();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>方程式抄本加载中...</p></div>';
                    break;
                case 'chemistry-process-analyzer':
                    if(typeof chemistryProcessAnalyzer!=='undefined'&&typeof chemistryProcessAnalyzer.renderAnalyzer==='function')
                        chemistryProcessAnalyzer.renderAnalyzer();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>工艺过程分析器加载中...</p></div>';
                    break;
                case 'biology-genetics':
                    if(typeof renderBiologyGenetics==='function') renderBiologyGenetics();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>遗传规律模拟器加载中...</p></div>';
                    break;
                case 'biology-ecosystem':
                    if(typeof ecosystemSimulator!=='undefined'&&typeof ecosystemSimulator.renderSimulation==='function')
                        ecosystemSimulator.renderSimulation();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>生态系统模拟器加载中...</p></div>';
                    break;
                case 'biology-mindmap':
                    if(typeof biologyMindMap!=='undefined'&&typeof biologyMindMap.renderMindMap==='function')
                        biologyMindMap.renderMindMap();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>生物思维导图加载中...</p></div>';
                    break;
                case 'biology-pedigree':
                    // renderTrainer() 开头是「没有 currentProblem 就直接 return」，
                    // 首次进入时它还是 null，等于什么都不画。入口应走 selectProblem()/init()。
                    if (typeof geneticsPedigreeTrainerEnhanced !== 'undefined'
                        && typeof geneticsPedigreeTrainerEnhanced.init === 'function')
                        geneticsPedigreeTrainerEnhanced.init();
                    else if (typeof geneticsPedigreeTrainer !== 'undefined'
                        && typeof geneticsPedigreeTrainer.selectProblem === 'function')
                        geneticsPedigreeTrainer.selectProblem();
                    else if (appEl) appEl.innerHTML = '<div class="knowledge-section"><p>遗传系谱训练器加载中...</p></div>';
                    break;
                case 'biology-cell': M.views.populateBiologyCell(); break;
                case 'biology-protein': M.views.populateBiologyProtein(); break;
                case 'biology-photosynthesis':
                    if(typeof photosynthesisTrainer!=='undefined'&&typeof photosynthesisTrainer.renderTrainer==='function')
                        photosynthesisTrainer.renderTrainer();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>光合作用训练器加载中...</p></div>';
                    break;
                case 'biology-experiment':
                    if(typeof experimentDesigner!=='undefined'&&typeof experimentDesigner.renderDesigner==='function')
                        experimentDesigner.renderDesigner();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>实验方案设计器加载中...</p></div>';
                    break;
                case 'biology-metabolism': M.views.populateBiologyMetabolism(); break;
                case 'biology-evolution': M.views.populateBiologyEvolution(); break;
                case 'biology-biotech': M.views.populateBiologyBiotech(); break;
                case 'pcr-sim':
                case 'pcr-animation': M.views.renderPCRSimulation(); break;
                case 'electrophoresis': M.views.renderElectrophoresisSimulation(); break;
                case 'exam-dashboard':
                    setActiveNav('exam');
                    if(typeof examPracticeSystem!=='undefined'&&typeof examPracticeSystem.renderExamDashboard==='function')
                        examPracticeSystem.renderExamDashboard(document.getElementById('exam-content'));
                    break;
                case 'platform-overview':
                    setActiveNav('platform');
                    M.syncModules();
                    if(M.PS && M.PS.renderPlatformPage) M.PS.renderPlatformPage();
                    break;
                case 'secondary-conclusions':
                    M.views.renderSecondaryConclusions();
                    break;
                case 'valence-atlas':
                    M.views.renderValenceAtlas();
                    break;
                case 'formula-handbook':
                    if(typeof formulaHandbook!=='undefined'&&typeof formulaHandbook.render==='function')
                        formulaHandbook.render();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>公式手册加载中...</p></div>';
                    break;
                case 'timed-quiz':
                    if(typeof timedQuiz!=='undefined'&&typeof timedQuiz.render==='function')
                        timedQuiz.render();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>计时刷题加载中...</p></div>';
                    break;
                                                case 'daily-learning':
                    if(typeof dailyLearning!=='undefined'&&typeof dailyLearning.render==='function')
                        dailyLearning.render();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>每日一题加载中...</p></div>';
                    break;
                case 'interdisciplinary':
                    if(typeof interdisciplinaryTopics!=='undefined'&&typeof interdisciplinaryTopics.render==='function')
                        interdisciplinaryTopics.render();
                    else if(appEl) appEl.innerHTML='<div class="knowledge-section"><p>学科交叉专题加载中...</p></div>';
                    break;
                // 高级备考工具
                case 'guangdong-analysis':
                    if(typeof guangdongAnalysis!=='undefined'&&typeof guangdongAnalysis.render==='function')guangdongAnalysis.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>命题规律白皮书加载中...</p></div>';
                    break;
                case 'situational-quiz':
                    if(typeof situationalQuiz!=='undefined'&&typeof situationalQuiz.render==='function')situationalQuiz.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>情境化试题加载中...</p></div>';
                    break;
                case 'cross-subject-enhanced':
                    if(typeof crossSubjectTopics!=='undefined'&&typeof crossSubjectTopics.init==='function')crossSubjectTopics.init();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>跨学科融合专题加载中...</p></div>';
                    break;
                case 'tech-frontiers':
                    if(typeof techFrontiers!=='undefined'&&typeof techFrontiers.init==='function')techFrontiers.init();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>科技前沿关联加载中...</p></div>';
                    break;
                case 'answer-template':
                    if(typeof answerTemplateLib!=='undefined'&&typeof answerTemplateLib.render==='function')answerTemplateLib.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>答题模板库加载中...</p></div>';
                    break;
                case 'calc-step':
                    if(typeof calcStepTrainer!=='undefined'&&typeof calcStepTrainer.render==='function')calcStepTrainer.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>计算题分步训练加载中...</p></div>';
                    break;
                case 'interactive-mistakes':
                    if(typeof interactiveMistakes!=='undefined'&&typeof interactiveMistakes.render==='function')interactiveMistakes.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>交互式易错点加载中...</p></div>';
                    break;
                case 'exam-strategy':
                    if(typeof examStrategy!=='undefined'&&typeof examStrategy.render==='function')examStrategy.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>考前策略加载中...</p></div>';
                    break;
                case 'spaced-repetition':
                    if(typeof spacedRepetition!=='undefined'&&typeof spacedRepetition.init==='function')spacedRepetition.init();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>间隔重复记忆系统加载中...</p></div>';
                    break;
                case 'textbook-fill':
                    if(typeof textbookFillBlank!=='undefined'&&typeof textbookFillBlank.init==='function')textbookFillBlank.init();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>教材挖空加载中...</p></div>';
                    break;
                case 'adaptive-diagnosis':
                    if(typeof adaptiveDiagnosis!=='undefined'&&typeof adaptiveDiagnosis.init==='function')adaptiveDiagnosis.init();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>自适应诊断加载中...</p></div>';
                    break;
                case 'knowledge-heatmap':
                    if(typeof knowledgeHeatmap!=='undefined'&&typeof knowledgeHeatmap.init==='function')knowledgeHeatmap.init();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>知识盲区热力图加载中...</p></div>';
                    break;
                case 'formula-derivation':
                    if(typeof formulaDerivation!=='undefined'&&typeof formulaDerivation.init==='function')formulaDerivation.init();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>公式推导动画加载中...</p></div>';
                    break;
                case 'physics-model':
                    if(typeof physicsModelSim!=='undefined'&&typeof physicsModelSim.init==='function')physicsModelSim.init();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>物理模型可视化加载中...</p></div>';
                    break;
                case 'chem-transform':
                    if(typeof chemTransformNet!=='undefined'&&typeof chemTransformNet.init==='function')chemTransformNet.init();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>化学转化网络加载中...</p></div>';
                    break;
                case 'bio-chart':
                    if(typeof bioChartTrainer!=='undefined'&&typeof bioChartTrainer.init==='function')bioChartTrainer.init();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>生物图表题加载中...</p></div>';
                    break;
                case 'exam-variation':
                    if(typeof examVariation!=='undefined'&&typeof examVariation.render==='function')examVariation.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>真题变式生成器加载中...</p></div>';
                    break;
                case 'wrong-variation':
                    if(typeof wrongVariationGen!=='undefined'&&typeof wrongVariationGen.render==='function')wrongVariationGen.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>错题变式生成加载中...</p></div>';
                    break;
                case 'study-calendar':
                    if(typeof studyCalendar!=='undefined'&&typeof studyCalendar.render==='function')studyCalendar.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>学习日历加载中...</p></div>';
                    break;
                                case 'error-notebook':
                    if(typeof errorNotebook!=='undefined'&&typeof errorNotebook.render==='function')errorNotebook.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>错题本系统加载中...</p></div>';
                    break;
                case 'mock-exam':
                    if(typeof mockExam!=='undefined'&&typeof mockExam.render==='function')mockExam.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>模拟考试加载中...</p></div>';
                    break;
                case 'global-search':
                    if(typeof globalSearch!=='undefined'&&typeof globalSearch.open==='function')globalSearch.open();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>全局搜索加载中...</p></div>';
                    break;
                case 'onboarding':
                    if(typeof onboarding!=='undefined'&&typeof onboarding.render==='function')onboarding.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>新手引导加载中...</p></div>';
                    break;
                case 'study-dashboard':
                    if(typeof studyDashboard!=='undefined'&&typeof studyDashboard.render==='function')studyDashboard.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>学习仪表盘加载中...</p></div>';
                    break;
                case 'english-vocabulary':
                    if(typeof englishVocabulary!=='undefined'&&typeof englishVocabulary.render==='function')englishVocabulary.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>英语词汇加载中...</p></div>';
                    break;
                case 'physics-wave-optics':
                    if(typeof physicsWaveOptics!=='undefined'&&typeof physicsWaveOptics.render==='function')physicsWaveOptics.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>波动光学加载中...</p></div>';
                    break;
                case 'chemistry-3d-molecules':
                    if(typeof chemistry3DMolecules!=='undefined'&&typeof chemistry3DMolecules.render==='function')chemistry3DMolecules.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>3D分子模型加载中...</p></div>';
                    break;
                case 'biology-cell-division':
                    if(typeof biologyCellDivision!=='undefined'&&typeof biologyCellDivision.render==='function')biologyCellDivision.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>细胞分裂动画加载中...</p></div>';
                    break;
                case 'chinese-recitation':
                    if(typeof chineseRecitation!=='undefined'&&typeof chineseRecitation.renderRecitation==='function')chineseRecitation.renderRecitation();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>默写自测加载中...</p></div>';
                    break;
                case 'chinese-vocabulary-quiz':
                    if(typeof chineseVocabularyQuiz!=='undefined'&&typeof chineseVocabularyQuiz.renderVocabularyQuiz==='function')chineseVocabularyQuiz.renderVocabularyQuiz();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>实词闯关加载中...</p></div>';
                    break;
                case 'chinese-composition-materials':
                    if(typeof chineseCompositionMaterials!=='undefined'&&typeof chineseCompositionMaterials.renderCompositionMaterials==='function')chineseCompositionMaterials.renderCompositionMaterials();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>作文素材加载中...</p></div>';
                    break;
                case 'chinese-sentence-correction':
                    if(typeof chineseSentenceCorrection!=='undefined'&&typeof chineseSentenceCorrection.render==='function')chineseSentenceCorrection.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>病句修改加载中...</p></div>';
                    break;
                case 'math-grapher':
                    if(typeof mathGrapher!=='undefined'&&typeof mathGrapher.renderGrapher==='function')mathGrapher.renderGrapher();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>函数图像加载中...</p></div>';
                    break;
                case 'math-derivative':
                    if(typeof mathDerivative!=='undefined'&&typeof mathDerivative.renderDerivative==='function')mathDerivative.renderDerivative();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>导数计算加载中...</p></div>';
                    break;
                case 'math-geometry':
                    if(typeof mathGeometry!=='undefined'&&typeof mathGeometry.renderGeometry==='function')mathGeometry.renderGeometry();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>几何画板加载中...</p></div>';
                    break;
                case 'math-sequence':
                    if(typeof mathSequence!=='undefined'&&typeof mathSequence.renderSequence==='function')mathSequence.renderSequence();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>数列可视化加载中...</p></div>';
                    break;
                case 'math-probability':
                    if(typeof mathProbability!=='undefined'&&typeof mathProbability.renderProbability==='function')mathProbability.renderProbability();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>概率模拟加载中...</p></div>';
                    break;
                case 'math-handbook':
                    if(typeof mathHandbook!=='undefined'&&typeof mathHandbook.renderHandbook==='function')mathHandbook.renderHandbook();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>数学公式手册加载中...</p></div>';
                    break;
                case 'math-integral':
                    if(typeof mathIntegral!=='undefined'&&typeof mathIntegral.renderIntegral==='function')mathIntegral.renderIntegral();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>积分计算加载中...</p></div>';
                    break;
                case 'english-grammar-quiz':
                    if(typeof englishGrammarQuiz!=='undefined'&&typeof englishGrammarQuiz.render==='function')englishGrammarQuiz.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>语法闯关加载中...</p></div>';
                    break;
                case 'english-reading-trainer':
                    if(typeof englishReadingTrainer!=='undefined'&&typeof englishReadingTrainer.render==='function')englishReadingTrainer.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>阅读训练加载中...</p></div>';
                    break;
                case 'english-composition-templates':
                    if(typeof englishCompositionTemplates!=='undefined'&&typeof englishCompositionTemplates.render==='function')englishCompositionTemplates.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>作文模板加载中...</p></div>';
                    break;
                case 'pomodoro-timer':
                    if(typeof pomodoroTimer!=='undefined'&&typeof pomodoroTimer.render==='function')pomodoroTimer.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>番茄钟加载中...</p></div>';
                    break;
                case 'study-plan-generator':
                    if(typeof studyPlanGenerator!=='undefined'&&typeof studyPlanGenerator.render==='function')studyPlanGenerator.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>学习计划加载中...</p></div>';
                    break;
                case 'mastery-radar':
                    if(typeof masteryRadar!=='undefined'&&typeof masteryRadar.render==='function')masteryRadar.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>雷达图加载中...</p></div>';
                    break;
                case 'error-variation':
                    if(typeof errorVariation!=='undefined'&&typeof errorVariation.render==='function')errorVariation.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>错题变式加载中...</p></div>';
                    break;
                case 'note-system':
                    if(typeof noteSystem!=='undefined'&&typeof noteSystem.render==='function')noteSystem.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>笔记系统加载中...</p></div>';
                    break;
                case 'data-exporter':
                    if(typeof dataExporter!=='undefined'&&typeof dataExporter.render==='function')dataExporter.render();
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>数据导出加载中...</p></div>';
                    break;
                case 'chinese-knowledge':
                    if(typeof showSection==='function'){showSection('chinese');setActiveNav('chinese');}
                    else if(appEl)appEl.innerHTML='<div class="knowledge-section"><p>????...</p></div>';
                    break;
                case 'chem-lab-builder': if(window.chemistryLabBuilder&&window.chemistryLabBuilder.render)window.chemistryLabBuilder.render(); break;
                case 'physics-graph-lab': if(window.physicsGraphLab&&window.physicsGraphLab.render)window.physicsGraphLab.render(); break;
                case 'chem-equilibrium': if(window.chemEquilibriumSim&&window.chemEquilibriumSim.render)window.chemEquilibriumSim.render(); break;
                case 'periodic-table': if(window.periodicTableInteractive&&window.periodicTableInteractive.render)window.periodicTableInteractive.render(); break;
                case 'punnett-square': if(window.punnettSquareCalc&&window.punnettSquareCalc.render)window.punnettSquareCalc.render(); break;
                case 'open-answer-trainer': if(window.openAnswerTrainer&&window.openAnswerTrainer.render)window.openAnswerTrainer.render(); break;
                case 'framework-trainer': if(window.frameworkAnswerTrainer&&window.frameworkAnswerTrainer.render)window.frameworkAnswerTrainer.render(); break;
                case 'exam-heatmap': if(window.examHeatmap&&window.examHeatmap.render)window.examHeatmap.render(); break;
                case 'terminology': if(window.terminologyChecker&&window.terminologyChecker.render)window.terminologyChecker.render(); break;
                case 'countdown-task': if(window.countdownTaskSystem&&window.countdownTaskSystem.render)window.countdownTaskSystem.render(); break;
                case 'concept-match': if(window.conceptMatchGame&&window.conceptMatchGame.render)window.conceptMatchGame.render(); break;
                case 'scratchpad': if(window.scratchpad&&window.scratchpad.render)window.scratchpad.render(); break;
                case 'study-report': if(window.studyReport&&window.studyReport.render)window.studyReport.render(); break;
                case 'experiment-table': if(window.experimentTable&&window.experimentTable.render)window.experimentTable.render(); break;
                case 'thinking-chain': if(window.thinkingChain&&window.thinkingChain.render)window.thinkingChain.render(); break;
                case 'variation-rec': if(window.variationRecommender&&window.variationRecommender.render)window.variationRecommender.render(); break;
                case 'poem-appreciation': if(window.poemAppreciation&&window.poemAppreciation.render)window.poemAppreciation.render(); break;
                case 'classical-translation': if(window.classicalTranslation&&window.classicalTranslation.render)window.classicalTranslation.render(); break;
                case 'solid-geometry-3d': if(window.solidGeometry3D&&window.solidGeometry3D.render)window.solidGeometry3D.render(); break;
                case 'trig-unit-circle': if(window.trigUnitCircle&&window.trigUnitCircle.render)window.trigUnitCircle.render(); break;
                case 'english-listening': if(window.englishListening&&window.englishListening.render)window.englishListening.render(); break;
                case 'english-cloze': if(window.englishCloze&&window.englishCloze.render)window.englishCloze.render(); break;
                case 'celestial-motion': if(window.celestialMotionSim&&window.celestialMotionSim.render)window.celestialMotionSim.render(); break;
                case 'crystal-structure-3d': if(window.crystalStructure3D&&window.crystalStructure3D.render)window.crystalStructure3D.render(); break;
                case 'dna-central-dogma': if(window.dnaCentralDogma&&window.dnaCentralDogma.render)window.dnaCentralDogma.render(); break;
                case 'achievement-system': if(window.achievementSystem&&window.achievementSystem.render)window.achievementSystem.render(); break;
                case 'study-share-card': if(window.studyShareCard&&window.studyShareCard.render)window.studyShareCard.render(); break;
                case 'score-calculator': if(window.scoreCalculator&&window.scoreCalculator.render)window.scoreCalculator.render(); break;
                case 'error-analysis-report': if(window.errorAnalysisReport&&window.errorAnalysisReport.render)window.errorAnalysisReport.render(); break;
                case 'time-management': if(window.timeManagementAnalyzer&&window.timeManagementAnalyzer.render)window.timeManagementAnalyzer.render(); break;
                case 'score-line': if(window.scoreLineVisualization&&window.scoreLineVisualization.render)window.scoreLineVisualization.render(); break;
                case 'experiment-exam-special': if(window.experimentExamSpecial&&window.experimentExamSpecial.render)window.experimentExamSpecial.render(); break;
                case 'choice-tricks': if(window.choiceQuestionTricks&&window.choiceQuestionTricks.render)window.choiceQuestionTricks.render(); break;
                case 'sentence-analyzer': if(window.englishSentenceAnalyzer&&window.englishSentenceAnalyzer.render)window.englishSentenceAnalyzer.render(); break;
                case 'exam-timer-pro': if(window.examTimerPro&&window.examTimerPro.render)window.examTimerPro.render(); break;
                case 'knowledge-card-exporter': if(window.knowledgeCardExporter&&window.knowledgeCardExporter.render)window.knowledgeCardExporter.render(); break;
                case 'learning-path-recommender': if(window.learningPathRecommender&&window.learningPathRecommender.render)window.learningPathRecommender.render(); break;
                default:
                    if(appEl && !appEl.innerHTML.trim())
                        appEl.innerHTML = '<div class="knowledge-section"><h3>' + tool + '</h3><div class="knowledge-card"><p>该功能正在开发完善中，敬请期待！</p></div></div>';
                    break;
            }
        } catch(err) {
            // 原来只打日志 + alert，用户看到的就是一片空白，找不到原因。
            // 改成把错误显示到对应容器里，至少能看出是哪个工具、什么错。
            console.error('navigateToolPage error:', err, 'tool:', tool);
            var errSec = document.getElementById(tool + '-section');
            var errBox = errSec ? (errSec.querySelector('[id$="-app"]') || errSec.querySelector('.tool-app-container')) : null;
            if (errBox) {
                errBox.innerHTML = '<div class="tool-error">'
                    + '<strong>这个工具加载失败了</strong>'
                    + '<div class="tool-error-detail">' + String(err && err.message ? err.message : err).replace(/</g, '&lt;') + '</div>'
                    + '</div>';
            }
        }
    }

    function handlePlatformTab(module) {
        M.syncModules();
        var el = document.getElementById('platform-content');
        if (!el) return;
        if (!M.PS) { el.innerHTML = '<div class="knowledge-section"><p>平台模块加载中...</p></div>'; return; }
        if (module === 'overview') { M.PS.renderPlatformPage(); }
        else if (module === 'round1') { el.innerHTML = '<div class="knowledge-section"><h3>📗 一轮系统复习</h3><div class="knowledge-card"><h4>选择学科查看一轮复习详情</h4><div data-style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;"><button class="btn btn-primary" data-subject="physics" data-style="flex:1;min-width:100px;">⚡ 物理一轮</button><button class="btn btn-primary" data-subject="chemistry" data-style="flex:1;min-width:100px;">🧪 化学一轮</button><button class="btn btn-primary" data-subject="biology" data-style="flex:1;min-width:100px;">🧬 生物一轮</button></div></div></div>'; }
        else if (module === 'round2') { el.innerHTML = '<div class="knowledge-section"><h3>📕 二轮专题冲刺</h3><div class="knowledge-card"><h4>选择学科查看二轮专题详情</h4><div data-style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;"><button class="btn btn-primary" data-subject="physics" data-style="flex:1;min-width:100px;">⚡ 物理二轮</button><button class="btn btn-primary" data-subject="chemistry" data-style="flex:1;min-width:100px;">🧪 化学二轮</button><button class="btn btn-primary" data-subject="biology" data-style="flex:1;min-width:100px;">🧬 生物二轮</button></div></div></div>'; }
        else if (module === 'bank') { el.innerHTML = '<div class="knowledge-section"><h3>🏦 题库</h3><div class="knowledge-card"><h4>选择学科查看题库详情</h4><div data-style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;"><button class="btn btn-primary" data-subject="physics" data-style="flex:1;min-width:100px;">⚡ 物理题库</button><button class="btn btn-primary" data-subject="chemistry" data-style="flex:1;min-width:100px;">🧪 化学题库</button><button class="btn btn-primary" data-subject="biology" data-style="flex:1;min-width:100px;">🧬 生物题库</button></div></div></div>'; }
        else if (module === 'experiment-center') {
            var html = '<div class="knowledge-section"><h3>🔬 实验与探究资源中心（三层架构）</h3>';
            if (M.PS && M.PS.experimentCenter && M.PS.experimentCenter.coreTiers) {
                M.PS.experimentCenter.coreTiers.forEach(function(tier) {
                    html += '<div class="knowledge-card" data-style="border-left:4px solid #10b981;"><h4>' + tier.name + ' <span data-style="font-size:0.75rem;color:#10b981;">（' + tier.positioning + '）</span></h4>';
                    tier.features.forEach(function(f) { html += '<div class="key-point">✅ ' + f + '</div>'; });
                    html += '</div>';
                });
            }
            html += '</div>';
            el.innerHTML = html;
        }
        else if (module === 'learning-path') {
            el.innerHTML = '<div class="knowledge-section"><h3>🛤️ 学习路径推荐</h3>'+
                '<div class="knowledge-card"><h4>推荐依据</h4>'+
                '<div class="key-point"><strong>错题归类：</strong>读取错题本里的记录，按 knowledgePoints 归到具体考点（考点名经别名表映射到知识点体系）</div>'+
                '<div class="key-point"><strong>薄弱排序：</strong>按每个考点的错误次数统计，错误多的排在前面</div>'+
                '<div class="key-point"><strong>配套练习：</strong>每个考点给出题库里同考点的题目，可直接进入练习</div>'+
                '<div class="key-point"><strong>答题模板：</strong>部分考点能从 answer-templates.json 匹配到对应的答题模板</div>'+
                '<div class="key-point"><strong>知识点关系图：</strong>按章节画出考点间的前后关系，标出错题集中的位置</div>'+
                '</div>'+
                '<div class="knowledge-card"><h4>📅 两周冲刺计划</h4>'+
                '<table data-style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-top:8px;">'+
                '<tr data-style="background:var(--primary);color:#fff;"><th data-style="padding:8px;border:1px solid #ddd;">阶段</th><th data-style="padding:8px;border:1px solid #ddd;">天数</th><th data-style="padding:8px;border:1px solid #ddd;">物理</th><th data-style="padding:8px;border:1px solid #ddd;">化学</th><th data-style="padding:8px;border:1px solid #ddd;">生物</th></tr>'+
                '<tr><td data-style="padding:6px;border:1px solid #ddd;font-weight:700;color:#e74c3c;">第1阶段</td><td data-style="padding:6px;border:1px solid #ddd;text-align:center;">Day1-3</td><td data-style="padding:6px;border:1px solid #ddd;">运动学与牛顿定律</td><td data-style="padding:6px;border:1px solid #ddd;">氧化还原与离子反应</td><td data-style="padding:6px;border:1px solid #ddd;">细胞组成与结构</td></tr>'+
                '<tr><td data-style="padding:6px;border:1px solid #ddd;font-weight:700;color:#e67e22;">第2阶段</td><td data-style="padding:6px;border:1px solid #ddd;text-align:center;">Day4-6</td><td data-style="padding:6px;border:1px solid #ddd;">曲线运动与万有引力</td><td data-style="padding:6px;border:1px solid #ddd;">元素化合物（Na/Fe/Cu）</td><td data-style="padding:6px;border:1px solid #ddd;">细胞代谢（光合与呼吸）</td></tr>'+
                '<tr><td data-style="padding:6px;border:1px solid #ddd;font-weight:700;color:#f1c40f;">第3阶段</td><td data-style="padding:6px;border:1px solid #ddd;text-align:center;">Day7-8</td><td data-style="padding:6px;border:1px solid #ddd;">动能定理与动量守恒</td><td data-style="padding:6px;border:1px solid #ddd;">反应速率与化学平衡</td><td data-style="padding:6px;border:1px solid #ddd;">遗传规律与伴性遗传</td></tr>'+
                '<tr><td data-style="padding:6px;border:1px solid #ddd;font-weight:700;color:#27ae60;">第4阶段</td><td data-style="padding:6px;border:1px solid #ddd;text-align:center;">Day9-10</td><td data-style="padding:6px;border:1px solid #ddd;">电场与电磁感应</td><td data-style="padding:6px;border:1px solid #ddd;">电化学与盐类水解</td><td data-style="padding:6px;border:1px solid #ddd;">调节与稳态</td></tr>'+
                '<tr><td data-style="padding:6px;border:1px solid #ddd;font-weight:700;color:#3498db;">第5阶段</td><td data-style="padding:6px;border:1px solid #ddd;text-align:center;">Day11-12</td><td data-style="padding:6px;border:1px solid #ddd;">热学、光学与近代物理</td><td data-style="padding:6px;border:1px solid #ddd;">有机化学与实验操作</td><td data-style="padding:6px;border:1px solid #ddd;">变异、进化与生物技术</td></tr>'+
                '<tr data-style="background:#fef2f2;"><td data-style="padding:6px;border:1px solid #ddd;font-weight:700;color:#c62828;">冲刺阶段</td><td data-style="padding:6px;border:1px solid #ddd;text-align:center;">Day13-14</td><td data-style="padding:6px;border:1px solid #ddd;" colspan="3">三科综合模拟 + 错题回顾 + 薄弱点强化</td></tr>'+
                '</table>'+
                '<div data-style="margin-top:10px;font-size:0.82rem;color:#666;">每日时间分配可按自己的薄弱项调整，优先给错误率最高的考点</div>'+
                '</div>'+
                '</div>';
        }
        else if (module === 'teaching-apps') {
            el.innerHTML = '<div class="knowledge-section"><h3>🏫 课堂与自习场景</h3>'+
                '<div class="knowledge-card"><h4>📱 四种用法</h4>'+
                '<div class="key-point"><strong>按错题排复习清单：</strong>学生标记错题后按考点归类，列出要先补的考点</div>'+
                '<div class="key-point"><strong>按考点集中练：</strong>从题库按知识点、难度、年份筛选，生成一组同类题</div>'+
                '<div class="key-point"><strong>实验方法对照：</strong>实验中心按教材实验、创新案例、科研摘要三层整理</div>'+
                '<div class="key-point"><strong>答题规范对照：</strong>主观题答案与解析给出参考答案，可与自己的作答逐点比对</div>'+
                '</div>'+
                '<div class="knowledge-card"><h4>👨‍🏫 教师用</h4>'+
                '<div class="key-point">📝 <strong>组卷：</strong>按学科、章节、知识点、难度、年份筛选题目，导出为一组练习</div>'+
                '<div class="key-point">📊 <strong>知识梳理：</strong>六科 168 个考点的知识要点与常见错误，可直接当讲义</div>'+
                '<div class="key-point">📈 <strong>学情记录：</strong>学生的错题与正确率存在本地，可导出备份后汇总</div>'+
                '</div></div>';
        }
        else if (module === 'competition') {
            el.innerHTML = '<div class="knowledge-section"><h3>🏆 项目说明</h3>'+
                '<div class="knowledge-card" data-style="background:linear-gradient(135deg,rgba(245,158,11,0.06),rgba(239,68,68,0.06));border:2px solid rgba(245,158,11,0.3);">'+
                '<h4>📐 一套纯静态、能离线、能核对的学习工具</h4>'+
                '</div>'+
                '<div class="knowledge-card"><h4>📋 数据层</h4>'+
                '<div class="key-point">题库：六科 1301 道，2018-2026 年，每题带解析与考点标注</div>'+
                '<div class="key-point">知识点：六科 41 章 168 个考点，含核心要点、常见错误、公式与应试提示</div>'+
                '<div class="key-point">学习记录：错题、正确率、打卡与考试记录存在浏览器 localStorage</div>'+
                '</div>'+
                '<div class="knowledge-card"><h4>🔧 功能层</h4>'+
                '<div class="key-point">真题练习：按学科、章节、难度、年份筛选，作答后出解析</div>'+
                '<div class="key-point">错题本：标记错题后按知识点归类，生成复习清单</div>'+
                '<div class="key-point">模拟考试：按学科组卷，计时作答后出分并记录</div>'+
                '<div class="key-point">工具：122 个在线小工具，含化学配平、3D 分子、细胞分裂模拟、波动光学</div>'+
                '</div>'+
                '<div class="knowledge-card"><h4>📊 工程实现</h4>'+
                '<div class="key-point">零依赖：HTML + CSS + 原生 JS，无构建步骤，npm install 不装任何东西</div>'+
                '<div class="key-point">离线可用：Service Worker 缓存资源，可安装为 PWA</div>'+
                '<div class="key-point">质量门禁：数据质检、声明碰撞扫描、静态与内容规则、运行时检查、单测与冒烟，CI 每次 push 自动跑</div>'+
                '</div>'+
                '<div class="knowledge-card"><h4>✅ 数据说明</h4>'+
                '<div class="key-point">题目与知识点整理自公开教材与考纲，仅供学习参考，真题版权归原作者与出版方</div>'+
                '<div class="key-point">本地存储数据可随时导出备份，也可一键清除</div>'+
                '</div>'+
                '<div class="knowledge-card" data-style="background:linear-gradient(135deg,rgba(16,185,129,0.06),rgba(79,110,246,0.06));">'+
                '<h4>🏅 特点</h4>'+
                '<div class="key-point"><strong>可离线：</strong>装上之后断网也能用</div>'+
                '<div class="key-point"><strong>可核对：</strong>题量、答案分布这些数字都能在仓库里查到</div>'+
                '<div class="key-point"><strong>无账号：</strong>不收集任何数据，学习记录只存在本机浏览器里</div>'+
                '</div></div>';
        }
        else { el.innerHTML = '<div class="knowledge-section"><p>该模块内容加载中...</p></div>'; }
    }

    function renderPhysicsExperiments(subject, contentEl) {
        var sc = window.subjectContent;
        var data = (sc && sc.physics && sc.physics.experiments) ? sc.physics.experiments : null;
        var html = '<div class="experiments-section"><h3>🔬 物理实验指导</h3>';
        html += '<div class="exp-cards">';

        html += '<div class="exp-card"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">⏱️</span><h4>实验一：用打点计时器测速度</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<p><strong>实验目的：</strong>学会使用打点计时器测速度，区分平均速度和瞬时速度</p>'+
            '<p><strong>实验原理：</strong>利用打点计时器记录物体运动的时间间隔，通过纸带上的点间距计算速度。打点周期T=0.02s（50Hz电源）。</p>'+
            '<div class="exp-steps"><h5>📋 实验步骤</h5><ol>'+
            '<li>把打点计时器固定在实验台上，检查限位孔是否对正</li>'+
            '<li>将纸带穿过打点计时器限位孔，另一端连接运动物体</li>'+
            '<li><strong>先接通电源</strong>，待打点稳定后<strong>释放纸带</strong></li>'+
            '<li>纸带通过后立即关闭电源，取下纸带</li>'+
            '<li>从点迹清晰处开始，每5个点取一个计数点（T=0.1s）</li>'+
            '<li>测量相邻计数点间的距离Δx，计算各段平均速度v=Δx/Δt</li>'+
            '</ol></div>'+
            '<div class="exp-caution"><h5>⚠️ 注意事项</h5><ul>'+
            '<li>打点计时器<strong>必须先通电后释放纸带</strong>，否则第一个点不清晰</li>'+
            '<li>选取纸带时，应选点迹清晰且连续的</li>'+
            '<li>计数点间隔选取要合理，通常取5个点为一个计数周期</li>'+
            '<li>纸带要平直穿过限位孔，避免卡纸</li>'+
            '</ul></div></div></div>';

        html += '<div class="exp-card"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">⚡</span><h4>实验二：测定金属的电阻率</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<p><strong>实验目的：</strong>学会用伏安法测电阻，掌握螺旋测微器的使用，测定金属的电阻率</p>'+
            '<p><strong>实验原理：</strong>R=ρl/S，通过测金属丝长度l、直径d（算截面积S=πd²/4）、电压U、电流I，计算电阻率ρ=RS/l=πd²U/(4lI)</p>'+
            '<div class="exp-steps"><h5>📋 实验步骤</h5><ol>'+
            '<li>用刻度尺测量金属丝接入电路的有效长度l（精确到mm）</li>'+
            '<li>用螺旋测微器在金属丝不同位置测直径d，取平均值</li>'+
            '<li>按电路图连接电路：电流表外接法（测小电阻）或内接法（测大电阻）</li>'+
            '<li>闭合开关，调节滑动变阻器，读取多组U、I值（至少6组）</li>'+
            '<li>作U-I图线，斜率即为电阻R</li>'+
            '<li>代入公式ρ=RS/l计算电阻率，保留3位有效数字</li>'+
            '</ol></div>'+
            '<div class="exp-caution"><h5>⚠️ 注意事项</h5><ul>'+
            '<li>电流不宜过大（一般不超过0.6A），防止金属丝发热导致电阻变化</li>'+
            '<li>电压表内接法适合测大电阻（R>>RA），外接法适合测小电阻（R<<RV）</li>'+
            '<li>螺旋测微器读数=固定刻度+可动刻度×0.01mm，需估读到0.001mm</li>'+
            '<li>金属丝接入长度应从接线柱内侧量起</li>'+
            '</ul></div></div></div>';

        html += '<div class="exp-card"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">🔍</span><h4>实验三：测定玻璃的折射率</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<p><strong>实验目的：</strong>用插针法测定玻璃的折射率</p>'+
            '<p><strong>实验原理：</strong>n=sin i/sin r，利用光从空气射入玻璃的折射现象</p>'+
            '<div class="exp-steps"><h5>📋 实验步骤</h5><ol>'+
            '<li>将玻璃砖放在白纸上，用铅笔描出界面aa\'和bb\'</li>'+
            '<li>在aa\'一侧适当位置竖直插两枚大头针P₁、P₂</li>'+
            '<li>在bb\'另一侧透过玻璃砖观察P₁、P₂的像，调整视线使P₂的像挡住P₁的像</li>'+
            '<li>在bb\'侧竖直插P₃、P₄，使P₄挡住P₃和P₁、P₂的像</li>'+
            '<li>取下大头针，连接P₁P₂、P₃P₄，画出光路图</li>'+
            '<li>用量角器测量入射角i和折射角r，sin值查表</li>'+
            '<li>计算折射率n=sin i/sin r，多次测量取平均值</li>'+
            '</ol></div>'+
            '<div class="exp-caution"><h5>⚠️ 注意事项</h5><ul>'+
            '<li>大头针要竖直插牢，插针间距不宜过小</li>'+
            '<li>入射角不能太大也不能太小（建议30°-60°），避免全反射或误差过大</li>'+
            '<li>玻璃砖的光学面不能用手触摸</li>'+
            '<li>实验过程中玻璃砖不能移动</li>'+
            '</ul></div></div></div>';

        html += '<div class="exp-card"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">🌈</span><h4>实验四：用双缝干涉测光的波长</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<p><strong>实验目的：</strong>测定单色光的波长</p>'+
            '<p><strong>实验原理：</strong>相邻亮条纹间距Δx=λL/d，其中L为缝到屏距离，d为双缝间距</p>'+
            '<div class="exp-steps"><h5>📋 实验步骤</h5><ol>'+
            '<li>安装双缝干涉仪，调整光源、滤光片、单缝、双缝共轴</li>'+
            '<li>调节单缝与双缝平行，使屏上出现清晰的干涉条纹</li>'+
            '<li>用测量头测出n条亮纹（或暗纹）间的距离a</li>'+
            '<li>计算相邻亮纹间距Δx=a/(n-1)</li>'+
            '<li>用米尺测量双缝到屏的距离L</li>'+
            '<li>已知双缝间距d（仪器铭牌标注），计算λ=Δx·d/L</li>'+
            '<li>换用不同滤光片测量不同波长进行比较</li>'+
            '</ol></div>'+
            '<div class="exp-caution"><h5>⚠️ 注意事项</h5><ul>'+
            '<li>各光学元件共轴是实验成败的关键</li>'+
            '<li>测量条纹间距时，尽量多测几条以减小误差</li>'+
            '<li>不要用眼睛直接观察激光</li>'+
            '</ul></div></div></div>';

        html += '<div class="exp-card"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">🎯</span><h4>实验五：验证动量守恒定律</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<p><strong>实验目的：</strong>验证碰撞中的动量守恒定律</p>'+
            '<p><strong>实验原理：</strong>m₁v₁+m₂v₂=m₁v₁\'+m₂v₂\'，利用平抛运动水平位移之比替代速度之比</p>'+
            '<div class="exp-steps"><h5>📋 实验步骤</h5><ol>'+
            '<li>用天平称量两球质量m₁（入射球）、m₂（靶球），应满足m₁>m₂</li>'+
            '<li>按图安装实验装置，调整斜槽末端水平</li>'+
            '<li>先让入射球从斜槽某高度自由滚下，记录落地点P</li>'+
            '<li>将靶球放在斜槽末端，再让入射球从同一高度滚下碰撞</li>'+
            '<li>记录碰撞后两球的落地点M（入射球）、N（靶球）</li>'+
            '<li>用刻度尺测量OP、OM、O\'N距离</li>'+
            '<li>验证m₁·OP=m₁·OM+m₂·O\'N</li>'+
            '</ol></div>'+
            '<div class="exp-caution"><h5>⚠️ 注意事项</h5><ul>'+
            '<li>斜槽末端必须水平（检验：小球放在槽口能静止）</li>'+
            '<li>入射球每次必须从同一高度由静止释放</li>'+
            '<li>m₁>m₂——保证入射球碰撞后不反弹</li>'+
            '<li>用尽量小的圆将所有落点圈入，取圆心为落点位置</li>'+
            '</ul></div></div></div>';

        html += '<div class="exp-card"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">🕰️</span><h4>实验六：用单摆测定重力加速度</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<p><strong>实验目的：</strong>利用单摆测定当地的重力加速度g</p>'+
            '<p><strong>实验原理：</strong>单摆周期T=2π√(l/g)，得g=(4π²l)/T²</p>'+
            '<div class="exp-steps"><h5>📋 实验步骤</h5><ol>'+
            '<li>用米尺测量摆线长度l₀（悬点到摆球中心的距离=摆线长+球半径）</li>'+
            '<li>将摆球拉开一个小角度（<5°），由静止释放</li>'+
            '<li>用秒表测量摆球完成n=30-50次全振动的时间t</li>'+
            '<li>周期T=t/n，重复测量3次取平均值</li>'+
            '<li>计算g=4π²l/T²</li>'+
            '<li>改变摆长，重复实验，作T²-l图线求斜率</li>'+
            '</ol></div>'+
            '<div class="exp-caution"><h5>⚠️ 注意事项</h5><ul>'+
            '<li>摆角<strong>必须小于5°</strong>（小角度近似成立条件）</li>'+
            '<li>摆线要细且不易伸长，长度取1m左右</li>'+
            '<li>应从摆球经过<strong>平衡位置（最低点）</strong>开始计时</li>'+
            '<li>测量周期时需连续计数，用累积法减小误差</li>'+
            '</ul></div></div></div>';

        html += '</div></div>';
        contentEl.innerHTML = html;
        var card = contentEl.querySelector('.exp-card');
        if (card) card.classList.add('exp-open');
    }

    function renderChemistryExperiments(subject, contentEl) {
        var sc = window.subjectContent;
        var html = '<div class="experiments-section"><h3>🧪 化学实验指导</h3>';
        html += '<div class="exp-cards">';

        html += '<div class="exp-card exp-open"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">🧪</span><h4>实验一：酸碱中和滴定</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<p><strong>实验目的：</strong>学会用滴定法测定酸或碱的浓度，练习滴定管的使用</p>'+
            '<p><strong>实验原理：</strong>h₊·c₊·V₊=h₋·c₋·V₋（一元酸碱：c₊V₊=c₋V₋）</p>'+
            '<div class="exp-steps"><h5>📋 实验步骤</h5><ol>'+
            '<li><strong>检漏：</strong>滴定管注满水，静置2min观察是否漏水</li>'+
            '<li><strong>洗涤与润洗：</strong>先用蒸馏水洗，再用标准液润洗2-3次（锥形瓶不能润洗！）</li>'+
            '<li><strong>装液：</strong>装入标准液至"0"刻线以上，赶尽尖嘴气泡</li>'+
            '<li><strong>调零：</strong>调整液面至0.00mL，记录初读数</li>'+
            '<li><strong>移取待测液：</strong>用移液管精确移取25.00mL待测液于锥形瓶</li>'+
            '<li><strong>加指示剂：</strong>滴加2-3滴酚酞（碱滴定酸用酚酞，酸滴定碱用甲基橙）</li>'+
            '<li><strong>滴定：</strong>左手控制滴定管活塞，右手摇动锥形瓶，眼观溶液颜色变化</li>'+
            '<li><strong>终点判断：</strong>溶液恰好变色且30秒内不褪色——即为终点</li>'+
            '<li><strong>读数：</strong>读取末读数，精确到0.01mL</li>'+
            '<li><strong>重复：</strong>实验重复2-3次，取平均值</li>'+
            '</ol></div>'+
            '<div class="exp-indicator-demo"><h5>🎨 指示剂参考</h5><div class="indicator-cards">'+
            '<div class="ind-card"><span class="ind-color" data-style="background:#ff6b9d;"></span><strong>酚酞</strong><br>变色范围：8.2-10.0<br>酸：无色 → 碱：红色<br>适用于<strong>强碱滴定强酸/弱酸</strong></div>'+
            '<div class="ind-card"><span class="ind-color" data-style="background:#ff9800;"></span><strong>甲基橙</strong><br>变色范围：3.1-4.4<br>酸：红色 → 碱：黄色<br>适用于<strong>强酸滴定强碱/弱碱</strong></div>'+
            '</div></div>'+
            '<div class="exp-caution"><h5>⚠️ 注意事项</h5><ul>'+
            '<li>滴定管读数必须精确到<strong>0.01mL</strong></li>'+
            '<li><strong>锥形瓶不能润洗</strong>（否则待测液物质的量偏大）</li>'+
            '<li>尖嘴部分必须充满液体，<strong>不能有气泡</strong></li>'+
            '<li>强碱溶液须用碱式滴定管（橡皮管+玻璃珠），酸用酸式滴定管（玻璃活塞）</li>'+
            '</ul></div></div></div>';

        html += '<div class="exp-card"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">⚗️</span><h4>实验二：配制一定物质的量浓度溶液</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<p><strong>实验目的：</strong>掌握配制一定物质的量浓度溶液的方法和容量瓶的使用</p>'+
            '<p><strong>仪器：</strong>×00mL容量瓶、烧杯、玻璃棒、胶头滴管、托盘天平（或分析天平）</p>'+
            '<div class="exp-steps"><h5>📋 实验步骤（以配制100mL 1.00mol/L NaCl为例）</h5><ol>'+
            '<li><strong>计算：</strong>m(NaCl)=n×M=c×V×M=1.00×0.100×58.5=5.85g</li>'+
            '<li><strong>称量：</strong>用托盘天平（或分析天平）称取5.9g NaCl</li>'+
            '<li><strong>溶解：</strong>将NaCl放入烧杯，加适量蒸馏水，用玻璃棒搅拌至完全溶解</li>'+
            '<li><strong>冷却：</strong>溶液冷却至室温（热溶液转移会使容量瓶体积不准）</li>'+
            '<li><strong>转移：</strong>将溶液沿玻璃棒小心转入100mL容量瓶</li>'+
            '<li><strong>洗涤：</strong>用蒸馏水洗涤烧杯和玻璃棒2-3次，洗涤液全部转入容量瓶</li>'+
            '<li><strong>定容：</strong>加蒸馏水至离刻度线1-2cm处，改用胶头滴管逐滴加入</li>'+
            '<li><strong>调平：</strong>视线与凹液面最低点平齐，水滴至恰好与刻度线相切</li>'+
            '<li><strong>摇匀：</strong>盖紧瓶塞，反复倒转摇匀</li>'+
            '</ol></div>'+
            '<div class="exp-caution"><h5>⚠️ 注意事项</h5><ul>'+
            '<li><strong>容量瓶不能用于溶解、稀释或长期存放溶液</strong></li>'+
            '<li>转移时玻璃棒下端必须靠在刻度线以下内壁上</li>'+
            '<li>定容时视线必须与凹液面最低点平齐</li>'+
            '<li>若定容时加水过量，必须<strong>重新配制</strong></li>'+
            '<li>摇匀后液面可能略低于刻度线——正常，不能再加水</li>'+
            '</ul></div></div></div>';

        html += '<div class="exp-card"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">☣️</span><h4>实验三：氯气的实验室制法</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<p><strong>反应原理：</strong></p><div class="exp-formula">MnO₂+4HCl（浓）<span class="exp-arrow-r">→</span><sup>Δ</sup>MnCl₂+Cl₂↑+2H₂O</div>'+
            '<p><strong>气体发生装置：</strong>固+液<span class="exp-arrow-r">→</span><sup>Δ</sup>气体（固液加热型）</p>'+
            '<div class="exp-steps"><h5>📋 实验流程</h5><ol>'+
            '<li>按固液加热型装置连接仪器：圆底烧瓶→洗气瓶→收集装置→尾气处理</li>'+
            '<li>在圆底烧瓶中加入MnO₂，分液漏斗中加入浓盐酸</li>'+
            '<li>通过盛有<strong>饱和食盐水的洗气瓶</strong>除去HCl杂质</li>'+
            '<li>通过<strong>浓H₂SO₄的干燥管</strong>进行干燥</li>'+
            '<li>用<strong>向上排空气法</strong>（或排饱和食盐水法）收集Cl₂</li>'+
            '<li>尾气用<strong>NaOH溶液吸收</strong>（Cl₂+2NaOH=NaCl+NaClO+H₂O）</li>'+
            '</ol></div>'+
            '<div class="exp-caution"><h5>⚠️ 注意事项</h5><ul>'+
            '<li><strong>Cl₂有毒！必须在通风橱中操作！</strong></li>'+
            '<li>必须用<strong>浓盐酸</strong>（稀盐酸不与MnO₂反应）</li>'+
            '<li>加热时温度不宜过高（防止HCl大量挥发）</li>'+
            '<li>导管插入液面以下会<strong>引起倒吸</strong></li>'+
            '<li>用NaOH溶液吸尾气后，废液应中和处理</li>'+
            '</ul></div></div></div>';

        html += '<div class="exp-card"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">🍇</span><h4>实验四：乙酸乙酯的制备</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<p><strong>反应原理：</strong></p><div class="exp-formula">CH₃COOH+CH₃CH₂OH<span class="exp-arrow-r">⇌</span><sup>浓H₂SO₄,Δ</sup>CH₃COOCH₂CH₃+H₂O</div>'+
            '<p><strong>反应类型：</strong>酯化反应（取代反应），可逆反应</p>'+
            '<div class="exp-steps"><h5>📋 实验步骤</h5><ol>'+
            '<li>在试管中加入<strong>2mL无水乙醇</strong></li>'+
            '<li>边振荡边缓慢加入<strong>2mL浓硫酸</strong>（密度大往密度小里加）</li>'+
            '<li>再加入<strong>2mL冰醋酸</strong></li>'+
            '<li>加入几片<strong>碎瓷片</strong>（防暴沸）</li>'+
            '<li>按图组装装置，用酒精灯小心加热3-5分钟</li>'+
            '<li>将产生的蒸气经导管通入<strong>饱和Na₂CO₃溶液</strong>的液面上</li>'+
            '<li>观察到Na₂CO₃液面上有透明油状液体生成——乙酸乙酯</li>'+
            '</ol></div>'+
            '<div class="exp-caution"><h5>⚠️ 注意事项</h5><ul>'+
            '<li>加试剂顺序：<strong>乙醇→浓硫酸→冰醋酸</strong>（密度顺序）</li>'+
            '<li>导管末端<strong>不能插入Na₂CO₃液面以下</strong>（防倒吸）</li>'+
            '<li>饱和Na₂CO₃溶液三作用：中和乙酸、溶解乙醇、降低酯溶解度</li>'+
            '<li>碎瓷片（沸石）不可重复使用，冷却后重新加入</li>'+
            '</ul></div>'+
            '<div class="exp-smell"><h5>👃 鉴别特征</h5><p>乙酸乙酯具有<strong>果香味</strong>（类似香蕉/苹果气味），用于调配香精</p></div></div></div>';

        html += '<div class="exp-card"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">🔬</span><h4>化学实验仪器分类全解</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<div class="equipment-grid">'+
            '<div class="eq-card"><h5>🔥 反应加热类</h5><p><strong>烧杯：</strong>配制溶液、溶解、加热（需垫石棉网）</p><p><strong>锥形瓶：</strong>滴定反应、振荡（液体不易溅出）</p><p><strong>圆底烧瓶：</strong>加热、蒸馏、回流（受热均匀）</p><p><strong>试管：</strong>少量试剂反应、可直接加热</p></div>'+
            '<div class="eq-card"><h5>📏 量器类</h5><p><strong>容量瓶：</strong>精确配制溶液（不可加热/储存）</p><p><strong>量筒：</strong>粗略量取液体体积</p><p><strong>移液管：</strong>精确移取一定体积液体</p><p><strong>滴定管：</strong>滴定分析，精确到0.01mL</p></div>'+
            '<div class="eq-card"><h5>🔽 分离类</h5><p><strong>漏斗：</strong>过滤/加液，\"一贴二低三靠\"</p><p><strong>分液漏斗：</strong>分离不相溶液体</p><p><strong>蒸馏烧瓶：</strong>蒸馏分离沸点不同的液体</p><p><strong>冷凝管：</strong>冷凝蒸气回收液体</p></div>'+
            '<div class="eq-card"><h5>📦 储存类</h5><p><strong>广口瓶：</strong>储存固体试剂</p><p><strong>细口瓶：</strong>储存液体试剂（棕色瓶存见光易分解物）</p><p><strong>集气瓶：</strong>收集气体</p><p><strong>干燥器：</strong>存放干燥样品</p></div>'+
            '</div>'+
            '<div class="common-mistake">⚠️ 考试常见错误：容量瓶用于溶解或储存；量筒用作反应容器；加热仪器混淆（烧杯/烧瓶需垫石棉网，容量瓶/量筒严禁加热）</div>'+
            '</div></div>';

        html += '</div></div>';
        contentEl.innerHTML = html;
    }

    function renderBiologyExperiments(subject, contentEl) {
        var html = '<div class="experiments-section"><h3>🧬 生物实验指导</h3>';
        html += '<div class="exp-cards">';

        html += '<div class="exp-card exp-open"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">🧪</span><h4>实验一：探究酶的专一性</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<p><strong>实验目的：</strong>验证酶具有催化作用和专一性（一种酶只能催化一种或一类化学反应）</p>'+
            '<p><strong>实验原理：</strong>淀粉酶只能催化淀粉水解为麦芽糖，不能催化蔗糖水解。用<strong>斐林试剂</strong>检测还原糖的存在。</p>'+
            '<div class="exp-steps"><h5>📋 实验步骤</h5><ol>'+
            '<li>取4支洁净试管，编号1-4</li>'+
            '<li>1号、2号管各加2mL淀粉溶液；3号、4号管各加2mL蔗糖溶液</li>'+
            '<li>1号和3号管各加2mL淀粉酶溶液；2号和4号管各加2mL蒸馏水（对照）</li>'+
            '<li>将4支试管放入<strong>60℃水浴</strong>保温5-10分钟</li>'+
            '<li>各加入2mL斐林试剂，放入沸水浴中加热2分钟</li>'+
            '<li>观察颜色变化：1号管出现砖红色沉淀（淀粉被水解产生还原糖），3号管无变化</li>'+
            '</ol></div>'+
            '<div class="exp-caution"><h5>⚠️ 注意事项</h5><ul>'+
            '<li>酶的催化需要<strong>适宜的温度和pH</strong></li>'+
            '<li>检测前应煮沸使酶变性失活，终止反应</li>'+
            '<li>斐林试剂要<strong>现配现用</strong>，甲液和乙液等量混合</li>'+
            '<li>对照组（2号和4号）是验证自发水解的可能性</li>'+
            '</ul></div></div></div>';

        html += '<div class="exp-card"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">🔬</span><h4>实验二：观察根尖分生组织细胞的有丝分裂</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<p><strong>实验目的：</strong>观察植物细胞有丝分裂各个时期的特征，理解细胞周期的过程</p>'+
            '<p><strong>实验材料：</strong>洋葱根尖（提前3-4天培养至根长2-5cm）</p>'+
            '<div class="exp-steps"><h5>📋 实验步骤</h5><ol>'+
            '<li><strong>培养根尖：</strong>将洋葱放在装满水的广口瓶上，底部接触水面，每天换水</li>'+
            '<li><strong>取材：</strong>上午10-14点剪取根尖<strong>2-3mm</strong>（此时分裂最旺盛）</li>'+
            '<li><strong>解离：</strong>放入15%HCl和95%酒精1:1混合液中<strong>3-5分钟</strong>（使细胞分离）</li>'+
            '<li><strong>漂洗：</strong>用清水漂洗约10分钟（去除解离液，便于染色）</li>'+
            '<li><strong>染色：</strong>用<strong>甲紫溶液</strong>（或醋酸洋红）染色3-5分钟</li>'+
            '<li><strong>制片：</strong>放在载玻片水滴中弄碎，盖上盖玻片，再加一片载玻片轻压</li>'+
            '<li><strong>观察：</strong>先在低倍镜下找到<strong>分生区</strong>（正方形细胞、排列紧密），再用高倍镜观察各期特点</li>'+
            '</ol></div>'+
            '<div class="exp-tip"><h5>💡 各分裂期识别要点</h5>'+
            '<div class="mitosis-cards">'+
            '<div class="mitosis-card"><strong>间期：</strong>细胞数量最多（时间最长），可见细胞核和核仁</div>'+
            '<div class="mitosis-card"><strong>前期：</strong>染色体出现（螺旋化），核膜核仁逐渐消失</div>'+
            '<div class="mitosis-card"><strong>中期：</strong>染色体排列在赤道板上，形态最清晰、数目最易数</div>'+
            '<div class="mitosis-card"><strong>后期：</strong>着丝点分裂，染色体向两极移动</div>'+
            '<div class="mitosis-card"><strong>末期：</strong>染色体变成染色质，核膜核仁重新出现，形成细胞板</div>'+
            '</div></div>'+
            '<div class="exp-caution"><h5>⚠️ 注意事项</h5><ul>'+
            '<li>解离后细胞<strong>已失活</strong>，观察的是静态的死细胞</li>'+
            '<li>分生区细胞特点：<strong>正方形、排列紧密、核大</strong></li>'+
            '<li>压片时不能研转，防止细胞重叠</li>'+
            '<li>大多数细胞处于间期（间期占细胞周期90%以上）</li>'+
            '</ul></div></div></div>';

        html += '<div class="exp-card"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">💧</span><h4>实验三：探究植物细胞的吸水与失水</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<p><strong>实验目的：</strong>观察植物细胞的质壁分离和复原现象，验证渗透吸水原理</p>'+
            '<p><strong>实验原理：</strong>成熟植物细胞是一个渗透系统，原生质层（细胞膜+液泡膜+两层膜间细胞质）相当于<strong>半透膜</strong></p>'+
            '<div class="exp-steps"><h5>📋 实验步骤</h5><ol>'+
            '<li>制作<strong>紫色洋葱鳞片叶外表皮</strong>的临时装片</li>'+
            '<li>在低倍镜下观察正常细胞：可见<strong>紫色大液泡</strong>，原生质层紧贴细胞壁</li>'+
            '<li>从盖玻片一侧滴加<strong>0.3g/mL蔗糖溶液</strong>，另一侧用吸水纸吸引（引流法）</li>'+
            '<li>重复引流2-3次，使细胞完全浸润</li>'+
            '<li>观察：液泡体积变<strong>小</strong>、颜色变<strong>深</strong>，原生质层与细胞壁分离→质壁分离</li>'+
            '<li>在盖玻片一侧滴加清水，另一侧吸水纸吸引</li>'+
            '<li>观察：液泡体积变<strong>大</strong>、颜色变<strong>浅</strong>，原生质层重新贴近细胞壁→质壁分离复原</li>'+
            '</ol></div>'+
            '<div class="exp-caution"><h5>⚠️ 注意事项</h5><ul>'+
            '<li>选紫色洋葱——便于观察液泡大小和颜色变化</li>'+
            '<li>蔗糖溶液浓度不宜过高（>0.5g/mL会导致细胞死亡）</li>'+
            '<li>死细胞<strong>不能发生质壁分离复原</strong></li>'+
            '<li>未成熟的植物细胞（分生区细胞）无大液泡，不发生质壁分离</li>'+
            '</ul></div></div></div>';

        html += '<div class="exp-card"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">🍃</span><h4>实验四：叶绿体色素的提取和分离</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<p><strong>实验目的：</strong>提取和分离叶绿体中的光合色素</p>'+
            '<p><strong>实验原理：</strong>色素溶于有机溶剂（无水乙醇提取）；不同色素在层析液中溶解度不同，在滤纸上扩散速率不同→分离</p>'+
            '<div class="exp-steps"><h5>📋 实验步骤</h5><ol>'+
            '<li><strong>提取：</strong>称取5g新鲜绿叶，剪碎→加少许<strong>SiO₂</strong>（助研磨）和<strong>CaCO₃</strong>（防叶绿素被破坏）→加10mL无水乙醇→迅速充分研磨</li>'+
            '<li><strong>过滤：</strong>用尼龙布过滤，收集墨绿色滤液于试管中，棉塞封口</li>'+
            '<li><strong>制备滤纸条：</strong>剪去两角→在一端约1cm处用铅笔（不能用圆珠笔）画一条细线</li>'+
            '<li><strong>画滤液细线：</strong>用毛细吸管吸取滤液，沿铅笔线画一条<strong>细、直、浓</strong>的线，干燥后重复2-3次</li>'+
            '<li><strong>层析：</strong>将适量层析液（石油醚:丙酮=10:1）倒入烧杯→将滤纸条插入（细线端在下，<strong>不能没入层析液</strong>）→盖上培养皿</li>'+
            '<li><strong>观察：</strong>待层析液扩散至距顶端约1cm时取出，观察色素带</li>'+
            '</ol></div>'+
            '<div class="exp-chromato"><h5>🌈 四条色素带（从上到下）</h5><div class="chromato-strip">'+
            '<div class="chromato-band" data-style="background:#f59e0b;color:#fff;">🥕 胡萝卜素（橙黄色）——溶解度最高，扩散最快，含量最少</div>'+
            '<div class="chromato-band" data-style="background:#eab308;color:#fff;">🍂 叶黄素（黄色）——溶解度第二</div>'+
            '<div class="chromato-band" data-style="background:#10b981;color:#fff;">🌿 叶绿素a（蓝绿色）——含量最多</div>'+
            '<div class="chromato-band" data-style="background:#84cc16;color:#fff;">🌱 叶绿素b（黄绿色）——溶解度最低，扩散最慢</div>'+
            '</div></div>'+
            '<div class="exp-caution"><h5>⚠️ 注意事项</h5><ul>'+
            '<li>研磨要<strong>迅速充分</strong>（减少色素氧化）</li>'+
            '<li>CaCO₃的作用：<strong>防止研磨中叶绿素被破坏</strong></li>'+
            '<li>滤液细线要<strong>细、直、浓</strong>（保证分离效果）</li>'+
            '<li>层析液<strong>绝对不能没及滤液细线</strong>（色素会溶入层析液）</li>'+
            '</ul></div></div></div>';

        html += '<div class="exp-card"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">🧬</span><h4>实验五：DNA的粗提取与鉴定</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<p><strong>实验目的：</strong>掌握从生物组织中粗提取DNA的方法，学会鉴定DNA</p>'+
            '<p><strong>实验原理：</strong>DNA在不同浓度NaCl中溶解度不同（0.14mol/L时最低）；DNA不溶于冷酒精（可析出）；DNA+二苯胺试剂<span class="exp-arrow-r">→</span><sup>沸水浴</sup>蓝色</p>'+
            '<div class="exp-steps"><h5>📋 实验步骤</h5><ol>'+
            '<li><strong>研磨：</strong>称取20g鸡血细胞液→加20mL蒸馏水→加洗涤剂→充分搅拌</li>'+
            '<li><strong>过滤：</strong>用纱布过滤，收集滤液（含DNA和蛋白质）</li>'+
            '<li><strong>溶解DNA：</strong>向滤液中加2mol/L NaCl溶液40mL，搅拌使DNA充分溶解</li>'+
            '<li><strong>析出DNA：</strong>沿烧杯壁缓慢加入等体积<strong>预冷的95%酒精</strong>，静置2-3分钟</li>'+
            '<li><strong>获取DNA：</strong>用玻璃棒轻轻卷起界面处的白色絮状物——即DNA粗提物</li>'+
            '<li><strong>鉴定：</strong>取DNA提取物→加5mL 0.015mol/L NaCl→加4mL二苯胺→沸水浴5min→出现<strong>蓝色</strong></li>'+
            '</ol></div>'+
            '<div class="exp-caution"><h5>⚠️ 注意事项</h5><ul>'+
            '<li>DNA在<strong>0.14mol/L NaCl中溶解度最低</strong>（此浓度用于进一步纯化）</li>'+
            '<li>不能用哺乳动物成熟红细胞（<strong>无细胞核和线粒体</strong>，不含DNA）</li>'+
            '<li>玻璃棒搅拌要轻柔，防止DNA断裂</li>'+
            '<li>酒精要预冷，提高DNA析出效果</li>'+
            '</ul></div></div></div>';

        html += '<div class="exp-card"><div class="exp-card-header" data-hook="exp-card-toggle"><span class="exp-card-icon">🔬</span><h4>实验六：显微镜的使用与生物绘图</h4><span class="exp-card-arrow">▼</span></div><div class="exp-card-body">'+
            '<p><strong>实验目的：</strong>熟练掌握光学显微镜的使用方法和生物绘图规范</p>'+
            '<div class="exp-steps"><h5>📋 使用步骤</h5><ol>'+
            '<li><strong>取镜安放：</strong>右手握镜臂，左手托镜座，轻放实验台距边缘5-7cm处</li>'+
            '<li><strong>对光：</strong>转动转换器使<strong>低倍物镜</strong>对准通光孔→调大光圈→左眼注视目镜→转动反光镜至视野明亮</li>'+
            '<li><strong>低倍镜观察：</strong>将装片放在载物台上→转动粗准焦螺旋使镜筒下降(从侧面看)→左眼看目镜反向转动粗准焦螺旋至看清物像→调细准焦螺旋清晰</li>'+
            '<li><strong>高倍镜观察：</strong>将目标移至视野中央→转动转换器换高倍物镜→只用<strong>细准焦螺旋</strong>调至清晰</li>'+
            '<li><strong>绘图：</strong>用<strong>3H铅笔</strong>→如实勾画轮廓→用疏密不同的小点表示明暗→标注图名和图注</li>'+
            '</ol></div>'+
            '<div class="exp-caution"><h5>⚠️ 注意事项</h5><ul>'+
            '<li>显微镜放大倍数=目镜倍数×物镜倍数</li>'+
            '<li>物像为<strong>倒像</strong>（上下左右均颠倒），移动装片要向相反方向</li>'+
            '<li>高倍镜下<strong>禁止使用粗准焦螺旋</strong>（易压碎装片和镜头）</li>'+
            '<li>视野亮度调节：高倍镜下视野变<strong>暗</strong>，需调大光圈/调亮光源</li>'+
            '</ul></div></div></div>';

        html += '</div></div>';
        contentEl.innerHTML = html;
        var card = contentEl.querySelector('.exp-card');
        if (card) card.classList.add('exp-open');
    }

    function handleModuleTabClick(subject, module, contentEl) {
        M.syncModules();
        if (module === 'concepts' || module === 'examples' || module === 'experiments' || module === 'tests') {
            if (typeof loadModuleContent === 'function') {
                loadModuleContent(subject, module === 'concepts' ? 'knowledge' : module);
                return;
            }
        }
        if (module === 'round1' && M.PS && M.PS.getRound1Content) {
            contentEl.innerHTML = M.PS.getRound1Content(subject); return;
        }
        if (module === 'round2' && M.PS && M.PS.getRound2Content) {
            contentEl.innerHTML = M.PS.getRound2Content(subject); return;
        }
        if (module === 'bank' && M.PS && M.PS.getQuestionBankContent) {
            contentEl.innerHTML = M.PS.getQuestionBankContent(subject); return;
        }
        if (module === 'experiment-center' && M.PS && M.PS.getExperimentCenterContent) {
            contentEl.innerHTML = M.PS.getExperimentCenterContent(subject); return;
        }
        if (module === 'methodology') {
            try { if (typeof getMethodologyContent === 'function') { contentEl.innerHTML = getMethodologyContent(subject); return; } } catch(e) {}
            contentEl.innerHTML = '<div class="knowledge-section"><h3>📝 解题方法论</h3><div class="knowledge-card"><h4>通用解题框架</h4><div class="key-point">①<strong>审题：</strong>读题干→圈关键词→明确待求量</div><div class="key-point">②<strong>建模：</strong>匹配学科模型→确定适用公式/原理</div><div class="key-point">③<strong>列式：</strong>按步骤列出方程/推理路径</div><div class="key-point">④<strong>求解：</strong>代入数据→统一单位→计算→检查量纲</div><div class="key-point">⑤<strong>规范：</strong>带单位答卷→合理使用有效数字→逻辑链完整</div></div></div>'; return;
        }
        if (module === 'errors') {
            contentEl.innerHTML = '<div class="knowledge-section"><h3>⚠️ 易错汇编</h3><div class="knowledge-card"><h4>三科高频易错点速查</h4><div class="key-point" data-style="background:#fee2e2;border-left:3px solid #ef4444;"><strong>物理：</strong>混淆平均功率与瞬时功率 | 误用机械能守恒条件（忽略摩擦力做功）| 左手定则与右手定则混用 | 带电粒子在磁场中时间计算直接用t=s/v（应用t=θ/2π·T）</div><div class="key-point" data-style="background:#fee2e2;border-left:3px solid #ef4444;"><strong>化学：</strong>混淆"氧化性强弱"与"得电子数目" | 电解池中离子放电顺序错误 | 同分异构体漏计顺反异构 | 未考虑盐类水解对溶液中离子浓度的影响</div><div class="key-point" data-style="background:#fee2e2;border-left:3px solid #ef4444;"><strong>生物：</strong>有氧呼吸全过程中并非每一步都需O₂ | 植物细胞≠都有叶绿体（根尖细胞无叶绿体）| ATP不只在线粒体产生（光合作用光反应也产生）| 基因频率计算中显性纯合与杂合混淆</div></div></div>'; return;
        }
        if (module === 'graph') {
            try { if (typeof getKnowledgeGraphContent === 'function') { contentEl.innerHTML = getKnowledgeGraphContent(subject); return; } } catch(e) {}
            contentEl.innerHTML = '<div class="knowledge-section"><p>知识图谱正在加载中...</p></div>'; return;
        }
        if (module === 'hotspot') {
            try { if (typeof getHotspotContent === 'function') { contentEl.innerHTML = getHotspotContent(subject); return; } } catch(e) {}
            contentEl.innerHTML = '<div class="knowledge-section"><p>热点聚焦正在加载中...</p></div>'; return;
        }
        if (module === 'tools') {
            var tHtml = '<div class="knowledge-section"><h3>🛠️ 特色工具</h3><div class="knowledge-card"><h4>快速入口</h4><div class="quick-tools-grid">';
            tHtml += '<button class="quick-tool-btn" data-call="quickTool" data-arg1="@s:physics-section" data-arg2="@s:physics" data-arg3="@s:physics-formula">⚡物理公式计算器</button>';
            tHtml += '<button class="quick-tool-btn" data-call="quickTool" data-arg1="@s:chemistry-section" data-arg2="@s:chemistry" data-arg3="@s:chemistry-balancer">⚗️化学方程配平</button>';
            tHtml += '<button class="quick-tool-btn" data-call="quickTool" data-arg1="@s:biology-section" data-arg2="@s:biology" data-arg3="@s:biology-genetics">🧬遗传模拟器</button>';
            tHtml += '</div></div></div>';
            contentEl.innerHTML = tHtml; return;
        }
        contentEl.innerHTML = '<div class="knowledge-section"><p>该模块内容正在丰富中...</p></div>';
    }

    // 模块 tab 委托结果导出（app.js 的 MODULE_REGISTRY 调用）
    window.handleModuleTabClick = handleModuleTabClick;

    document.addEventListener('click', function(e) {
        var target = e.target;

        var toolEl = getClosestWithAttr(target, 'data-tool');
        if (toolEl) {
            e.preventDefault();
            e.stopPropagation();
            var tool = toolEl.getAttribute('data-tool');
            if (!tool) return;
            try { navigateToolPage(tool); } catch(err) {
                console.error('Tool navigation error:', err, 'tool:', tool);
                alert('工具 "' + tool + '" 加载失败，请刷新页面重试');
            }
            return;
        }

        var moduleTabEl = getClosestWithAttr(target, 'data-module');
        if (moduleTabEl) {
            e.preventDefault();
            e.stopPropagation();
            var module = moduleTabEl.getAttribute('data-module');
            var parentSection = moduleTabEl.closest('.section');
            if (!parentSection) return;
            var sectionId = parentSection.id;
            var subject = sectionId.replace('-section', '');
            // 原白名单只有 physics/chemistry/biology/platform，把 数学/语文/英语 排除在外，
            // 导致这 3 科的「考情分析 / 一轮复习 / 二轮专题 / 互动练习」4 个 tab 全是死按钮。
            // 这些 tab 由 exam-review-system.js 在 DOMContentLoaded 中**追加**（晚于 app.js 的扫描），
            // 所以必须靠这里的 document 级事件委托兜住，不能只依赖 app.js 的一次性绑定。
            if (!['physics', 'chemistry', 'biology', 'platform', 'math', 'chinese', 'english'].includes(subject)) return;

            parentSection.querySelectorAll('.module-tab').forEach(function(t) { t.classList.remove('active'); });
            moduleTabEl.classList.add('active');

            if (subject === 'platform') { try { handlePlatformTab(module); } catch(e) {} return; }
            try { loadModuleContent(subject, module); } catch(e) { var mcEl = parentSection.querySelector('.module-content'); if (mcEl) mcEl.innerHTML = '<div class="knowledge-section"><p>模块内容正在加载中...</p></div>'; }
            return;
        }

        var subjectEl = getClosestWithAttr(target, 'data-subject');
        if (subjectEl) {
            e.preventDefault();
            e.stopPropagation();
            var subject = subjectEl.getAttribute('data-subject');
            if (!subject) return;
            showSection(subject + '-section');
            setActiveNav(subject);
            if (subject === 'exam' && typeof examPracticeSystem !== 'undefined') {
                examPracticeSystem.renderExamDashboard(document.getElementById('exam-content'));
            }
            if (subject === 'platform') {
                handlePlatformTab('overview');
            }
            return;
        }

        var backEl = getClosestWithAttr(target, 'data-back');
        if (backEl) {
            e.preventDefault();
            e.stopPropagation();
            var backSection = backEl.getAttribute('data-back');
            showSection(backSection + '-section');
            setActiveNav(backSection);
            window.scrollTo({top:0,behavior:'smooth'});
            return;
        }
    });

    // 不再用解析期捕获值覆写全局（那是定时炸弹：任一 defer 脚本被移除即把真实模块置 undefined）
    window.navigateToolPage = navigateToolPage;

    // Route chinese-knowledge tool to chinese section
    document.querySelectorAll('[data-tool="chinese-knowledge"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            showSection('chinese-section');
            setActiveNav('chinese');
        });
    });

    // Init Chinese sidebar when section is shown
    var origShowSection = showSection;
    showSection = function(id) {
        origShowSection(id);
        if (id === "chinese-section") {
            window.initChineseSidebar();
        }
    };

    // v1.3: 暴露到全局 —— 修复内联事件属性无法引用 IIFE 内部函数的问题
    window.showSection = showSection;
    window.materializeSection = materializeSection;
    window.setActiveNav = setActiveNav;
    // handlePlatformTab 未导出 → global-search 搜到"平台架构总览/备考数据中心"时无法路由
    window.handlePlatformTab = handlePlatformTab;

 /* 首页快捷工具跳转（原 3 处内联 onclick 的三语句包装） */
    window.quickTool = function (section, nav, tool) {
        showSection(section);
        setActiveNav(nav);
        setTimeout(function () { try { navigateToolPage(tool); } catch (e) {} }, 200);
    };
})();

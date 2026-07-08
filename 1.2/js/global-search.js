/**
 * Global Search Tool - HSPCB High School Study Platform
 * ES5 Compatible | IIFE Pattern | window.globalSearch
 *
 * Indexes: 84 tools, 5 knowledge graphs, 628 exam questions, cross-subject topics
 * Features: real-time filtering, grouped results, Ctrl+K shortcut, recent searches
 */
window.globalSearch = (function() {
    'use strict';

    // ============================================================
    // CONSTANTS
    // ============================================================
    var MAX_RECENT = 10;
    var STORAGE_KEY = 'hspcb_global_search_recent';

    // ============================================================
    // FALLBACK TOOL INDEX (84 tools across all subjects)
    // ============================================================
    var TOOL_INDEX = [
        // === 物理 Physics (16 tools) ===
        { name: '物理公式计算器', desc: '力学·电磁学·热学公式速算', tool: 'physics-formula', subject: '物理', icon: '📐' },
        { name: '抛体运动模拟', desc: '初速度·角度·落点可视化·最高点分析', tool: 'physics-projectile', subject: '物理', icon: '🎯' },
        { name: '受力分析工具', desc: '斜面·滑轮·传送带模型·摩擦力判断', tool: 'physics-mechanics', subject: '物理', icon: '🔧' },
        { name: '电路分析工具', desc: '欧姆定律·基尔霍夫定律·等效电阻计算', tool: 'physics-electricity', subject: '物理', icon: '⚡' },
        { name: '光学模拟', desc: '折射定律·反射定律·透镜成像·全反射', tool: 'physics-optics', subject: '物理', icon: '🔍' },
        { name: '物理测量仪器指南', desc: '游标卡尺·螺旋测微器·多用电表精读', tool: 'physics-measurement', subject: '物理', icon: '📏' },
        { name: '运动学计算器', desc: '匀变速直线运动·自由落体·竖直上抛', tool: 'physics-kinematics', subject: '物理', icon: '🏃' },
        { name: '牛顿运动定律模拟', desc: '板块模型·连接体·临界状态分析', tool: 'physics-newton', subject: '物理', icon: '🍎' },
        { name: '动量守恒模拟', desc: '碰撞类型·爆炸·人船模型·反冲', tool: 'physics-momentum', subject: '物理', icon: '💥' },
        { name: '机械能守恒模拟', desc: '动能·势能·功能关系·能量转化', tool: 'physics-energy', subject: '物理', icon: '🔋' },
        { name: '电场模拟器', desc: '点电荷电场·匀强电场·电势·等势面', tool: 'physics-electric-field', subject: '物理', icon: '⚛️' },
        { name: '磁场模拟器', desc: '安培力·洛伦兹力·带电粒子圆周运动', tool: 'physics-magnetic', subject: '物理', icon: '🧲' },
        { name: '电磁感应模拟', desc: '法拉第定律·楞次定律·动生电动势', tool: 'physics-induction', subject: '物理', icon: '🔄' },
        { name: '热学计算器', desc: '气体实验定律·热力学第一定律·pV图', tool: 'physics-thermo', subject: '物理', icon: '🌡️' },
        { name: '振动与波模拟', desc: '简谐运动·机械波·干涉衍射', tool: 'physics-wave', subject: '物理', icon: '〰️' },
        { name: '原子物理工具', desc: '波尔模型·能级跃迁·核反应方程', tool: 'physics-atomic', subject: '物理', icon: '🔬' },

        // === 化学 Chemistry (17 tools) ===
        { name: '化学方程式配平', desc: '智能配平+原子守恒检验+反应类型识别', tool: 'chemistry-balancer', subject: '化学', icon: '⚖️' },
        { name: '化学知识闯关', desc: '选择题·填空题·判断题·限时挑战', tool: 'chemistry-quiz', subject: '化学', icon: '📝' },
        { name: '实验室安全', desc: '操作规范·应急处理·危化品管理', tool: 'chemistry-safety', subject: '化学', icon: '⚠️' },
        { name: '电化学模拟', desc: '原电池·电解池·金属腐蚀与防护', tool: 'chemistry-electrochem', subject: '化学', icon: '🔋' },
        { name: '化工流程分析', desc: '工业制酸·合成氨·氯碱工业·物质转化', tool: 'chemistry-process', subject: '化学', icon: '🏭' },
        { name: '有机化学工具', desc: '官能团识别·同分异构·合成路线设计', tool: 'chemistry-organic', subject: '化学', icon: '🧬' },
        { name: '化学实验器材大全', desc: '烧杯·漏斗·量器·瓶类·加热器全解', tool: 'chemistry-equipment', subject: '化学', icon: '🔬' },
        { name: '方程式抄本', desc: '分类整理·一键复制·高频考点标注', tool: 'chemistry-notebook', subject: '化学', icon: '📓' },
        { name: '元素价态图谱', desc: 'Na·Fe·S·N 价态二维图·反应网络', tool: 'chemistry-valence', subject: '化学', icon: '⚗️' },
        { name: '工业流程核心反应提取', desc: '氧化还原·pH调节·结晶除杂分析', tool: 'chemistry-process-analyzer', subject: '化学', icon: '🧪' },
        { name: '物质的量计算器', desc: 'n·m·V·c相互换算·阿伏伽德罗常数', tool: 'chemistry-mole', subject: '化学', icon: '🧮' },
        { name: '化学平衡模拟', desc: '勒夏特列原理·平衡常数·转化率分析', tool: 'chemistry-equilibrium', subject: '化学', icon: '⚖️' },
        { name: '离子反应分析', desc: '离子方程式·共存判断·沉淀溶解', tool: 'chemistry-ion', subject: '化学', icon: '💧' },
        { name: '物质结构工具', desc: '电子排布·分子构型·晶体类型·杂化轨道', tool: 'chemistry-structure', subject: '化学', icon: '🔷' },
        { name: '氧化还原分析器', desc: '化合价升降·电子转移·配平策略', tool: 'chemistry-redox', subject: '化学', icon: '🔄' },
        { name: '化学反应速率工具', desc: '浓度·温度·催化剂影响·活化能', tool: 'chemistry-rate', subject: '化学', icon: '⏱️' },
        { name: '化学实验设计器', desc: '实验目的·原理·步骤·现象分析', tool: 'chemistry-experiment', subject: '化学', icon: '🧫' },

        // === 生物 Biology (14 tools) ===
        { name: '遗传规律模拟器', desc: '孟德尔定律·伴性遗传·基因频率计算', tool: 'biology-genetics', subject: '生物', icon: '🧬' },
        { name: '生态系统模拟', desc: '食物链·能量流动·物质循环·碳循环', tool: 'biology-ecosystem', subject: '生物', icon: '🌍' },
        { name: '知识思维导图', desc: '13大热点专题·6维关联·考点清单', tool: 'biology-mindmap', subject: '生物', icon: '🗺️' },
        { name: '生物知识图谱', desc: '考点关联网络·知识溯源·热点覆盖', tool: 'biology-knowledge-graph', subject: '生物', icon: '🔥' },
        { name: '生物答题技巧全解', desc: '信息题·选择题·实验设计·遗传计算', tool: 'biology-exam-skills', subject: '生物', icon: '📝' },
        { name: 'PCR扩增模拟动画', desc: '变性·退火·延伸三步骤可视化', tool: 'biology-pcr', subject: '生物', icon: '🧬' },
        { name: '凝胶电泳模拟', desc: 'DNA片段分离·条带判读·Marker对照', tool: 'biology-electrophoresis', subject: '生物', icon: '🔬' },
        { name: '遗传系谱分析器', desc: '显隐性判断·常/伴性遗传·概率计算', tool: 'biology-pedigree', subject: '生物', icon: '👨‍👩‍👧' },
        { name: '细胞结构浏览器', desc: '细胞膜·细胞器·细胞核·3D结构', tool: 'biology-cell', subject: '生物', icon: '🔬' },
        { name: '蛋白质合成模拟', desc: '转录·翻译·中心法则·基因表达', tool: 'biology-protein', subject: '生物', icon: '🧬' },
        { name: '光合作用模拟器', desc: '光反应·暗反应·C3/C4途径·影响因素', tool: 'biology-photosynthesis', subject: '生物', icon: '🌿' },
        { name: '呼吸作用模拟器', desc: '有氧呼吸三阶段·无氧呼吸·ATP计算', tool: 'biology-respiration', subject: '生物', icon: '🫁' },
        { name: '神经体液调节工具', desc: '反射弧·动作电位·激素调节通路', tool: 'biology-regulation', subject: '生物', icon: '🧠' },
        { name: '免疫系统模拟', desc: '体液免疫·细胞免疫·特异性免疫', tool: 'biology-immunity', subject: '生物', icon: '🛡️' },

        // === 数学 Math (11 tools) ===
        { name: '数学复习资料', desc: '选必一·选必二 全章节知识点梳理', tool: 'math-review', subject: '数学', icon: '📐' },
        { name: '函数图像绘制器', desc: '多函数叠加·平滑绘图·坐标网格', tool: 'math-grapher', subject: '数学', icon: '📈' },
        { name: '导数计算器', desc: '符号求导·数值计算·图像对比', tool: 'math-derivative', subject: '数学', icon: '📐' },
        { name: '几何画板', desc: '直线·圆·椭圆·双曲线·抛物线', tool: 'math-geometry', subject: '数学', icon: '📏' },
        { name: '数列可视化', desc: '等差·等比·柱状图·通项公式', tool: 'math-sequence', subject: '数学', icon: '📊' },
        { name: '概率模拟器', desc: '古典概型·二项分布·频率直方图', tool: 'math-probability', subject: '数学', icon: '🎲' },
        { name: '数学公式手册', desc: '7大分类·34条核心公式速查', tool: 'math-handbook', subject: '数学', icon: '📖' },
        { name: '三角函数工具', desc: '单位圆·图像变换·和差化积', tool: 'math-trigonometry', subject: '数学', icon: '🔺' },
        { name: '向量计算器', desc: '坐标运算·数量积·向量积·夹角', tool: 'math-vector', subject: '数学', icon: '➡️' },
        { name: '立体几何工具', desc: '三视图·体积计算·截面分析', tool: 'math-solid-geometry', subject: '数学', icon: '📦' },
        { name: '统计工具', desc: '均值·方差·回归分析·相关系数', tool: 'math-statistics', subject: '数学', icon: '📉' },

        // === 语文 Chinese (6 tools) ===
        { name: '语文知识点合集', desc: '现代文·文言文·诗词·作文全解', tool: 'chinese-knowledge', subject: '语文', icon: '📚' },
        { name: '默写自测系统', desc: '19篇必背·情境填空·即时批改', tool: 'chinese-recitation', subject: '语文', icon: '📝' },
        { name: '文言实词闯关', desc: '25个实词·选择题·配对练习', tool: 'chinese-vocabulary-quiz', subject: '语文', icon: '🎯' },
        { name: '作文素材库', desc: '4大主题·人物名言事例·一键复制', tool: 'chinese-composition-materials', subject: '语文', icon: '📚' },
        { name: '诗词鉴赏工具', desc: '意象分析·手法鉴赏·情感主旨', tool: 'chinese-poetry', subject: '语文', icon: '🎋' },
        { name: '现代文阅读工具', desc: '论述类·实用类·文学类文本分析', tool: 'chinese-reading', subject: '语文', icon: '📖' },

        // === 英语 English (4 tools) ===
        { name: '英语词汇速查', desc: '3500课标词·同义词辨析·词根词缀', tool: 'english-vocabulary', subject: '英语', icon: '📖' },
        { name: '语法知识图谱', desc: '时态·从句·非谓语动词·虚拟语气', tool: 'english-grammar', subject: '英语', icon: '📝' },
        { name: '阅读理解训练', desc: '细节题·推理题·主旨题·猜词题', tool: 'english-reading', subject: '英语', icon: '📄' },
        { name: '写作模板库', desc: '书信·议论文·读后续写·概要写作', tool: 'english-writing', subject: '英语', icon: '✍️' },

        // === 历史 History (3 tools) ===
        { name: '历史年表工具', desc: '中国史·世界史大事记·时序梳理', tool: 'history-timeline', subject: '历史', icon: '📅' },
        { name: '历史材料题分析', desc: '史料解读·答题模板·史论结合', tool: 'history-materials', subject: '历史', icon: '📜' },
        { name: '历史概念辨析', desc: '易混概念·制度对比·阶段特征', tool: 'history-concepts', subject: '历史', icon: '🔍' },

        // === 地理 Geography (3 tools) ===
        { name: '地理地图工具', desc: '中国地形·世界气候·洋流分布', tool: 'geography-map', subject: '地理', icon: '🗺️' },
        { name: '地理计算器', desc: '地方时·区时·太阳高度角·昼夜长短', tool: 'geography-calculator', subject: '地理', icon: '🧮' },
        { name: '地理综合题分析', desc: '自然地理·人文地理·区域可持续发展', tool: 'geography-analysis', subject: '地理', icon: '🌏' },

        // === 政治 Politics (3 tools) ===
        { name: '政治概念图谱', desc: '必修1-4知识网络·核心概念关联', tool: 'politics-concepts', subject: '政治', icon: '📋' },
        { name: '时政热点分析', desc: '年度热点·考点链接·答题术语', tool: 'politics-current', subject: '政治', icon: '📰' },
        { name: '政治主观题模板', desc: '是什么·为什么·怎么办答题框架', tool: 'politics-template', subject: '政治', icon: '📝' },

        // === 跨学科 / 平台工具 Platform (7 tools) ===
        { name: '备考数据中心', desc: '分数线·知识图谱·个性化推荐·进度追踪', tool: 'exam-dashboard', subject: '备考', icon: '🎯' },
        { name: '平台架构总览', desc: '一体两翼·三层四柱·命题趋势分析', tool: 'platform-overview', subject: '平台', icon: '🏛️' },
        { name: '物化二级结论', desc: '物理快捷公式·化学核心结论速查', tool: 'secondary-conclusions', subject: '跨学科', icon: '📋' },
        { name: '命题规律白皮书', desc: '广东高考趋势分析·考点权重变化', tool: 'guangdong-analysis', subject: '备考', icon: '📊' },
        { name: '情境化试题训练', desc: '无情境不成题·科技前沿·生活实践', tool: 'situational-quiz', subject: '备考', icon: '🌍' },
        { name: '跨学科融合专题', desc: '理化生综合·知识交叉·综合能力', tool: 'cross-subject-enhanced', subject: '跨学科', icon: '🔬' },
        { name: '科技前沿关联', desc: '诺贝尔奖·最新科研成果·学科前沿', tool: 'tech-frontiers', subject: '跨学科', icon: '🏆' }
    ];

    // ============================================================
    // STATE
    // ============================================================
    var state = {
        query: '',
        results: [],
        scope: { tools: true, knowledge: true, exams: true },
        allScope: true,
        recentSearches: [],
        isOpen: false,
        selectedIndex: -1,
        searchIndex: null
    };

    // ============================================================
    // RECENT SEARCHES (localStorage)
    // ============================================================
    function loadRecentSearches() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                state.recentSearches = JSON.parse(raw);
                if (!Array.isArray(state.recentSearches)) {
                    state.recentSearches = [];
                }
            }
        } catch (e) {
            state.recentSearches = [];
        }
    }

    function saveRecentSearches() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.recentSearches));
        } catch (e) {
            // quota exceeded or unavailable, silently fail
        }
    }

    function addRecentSearch(query) {
        if (!query || query.trim().length === 0) return;
        var q = query.trim();
        state.recentSearches = state.recentSearches.filter(function(item) {
            return item !== q;
        });
        state.recentSearches.unshift(q);
        if (state.recentSearches.length > MAX_RECENT) {
            state.recentSearches = state.recentSearches.slice(0, MAX_RECENT);
        }
        saveRecentSearches();
    }

    function clearRecentSearches() {
        state.recentSearches = [];
        saveRecentSearches();
    }

    // ============================================================
    // SEARCH INDEX BUILDER
    // ============================================================

    function extractPageTools() {
        var tools = [];
        var cards = document.querySelectorAll('[data-tool]');
        for (var i = 0; i < cards.length; i++) {
            var el = cards[i];
            var toolId = el.getAttribute('data-tool');
            if (!toolId) continue;
            var nameEl = el.querySelector('h4');
            var descEl = el.querySelector('p');
            var tagEl = el.querySelector('.tool-tag');
            var name = nameEl ? nameEl.textContent.trim() : toolId;
            var desc = descEl ? descEl.textContent.trim() : '';
            var subject = tagEl ? tagEl.textContent.trim() : '';
            var iconEl = el.querySelector('.tool-icon');
            var icon = iconEl ? iconEl.textContent.trim() : '🔧';
            tools.push({
                name: name,
                desc: desc,
                tool: toolId,
                subject: subject,
                icon: icon,
                source: 'page'
            });
        }
        return tools;
    }

    function extractPageKnowledge() {
        var entries = [];
        var sections = document.querySelectorAll('.section');
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            var sectionId = section.id || '';
            var subject = sectionId.replace('-section', '');

            var headings = section.querySelectorAll('h2, h3, h4');
            for (var j = 0; j < headings.length; j++) {
                var h = headings[j];
                var text = h.textContent.trim();
                if (text.length > 3 && text.length < 120) {
                    entries.push({
                        title: text,
                        excerpt: '',
                        subject: subject,
                        sectionId: sectionId,
                        source: 'page-heading'
                    });
                }
            }

            var keyPoints = section.querySelectorAll('.key-point, .knowledge-card h4');
            for (var k = 0; k < keyPoints.length; k++) {
                var kp = keyPoints[k];
                var kpText = kp.textContent.trim();
                if (kpText.length > 5 && kpText.length < 300) {
                    entries.push({
                        title: kpText.substring(0, 80),
                        excerpt: kpText,
                        subject: subject,
                        sectionId: sectionId,
                        source: 'page-content'
                    });
                }
            }
        }
        return entries;
    }

    function extractExamQuestions() {
        var questions = [];
        try {
            var eps = window.examPracticeSystem;
            if (eps && eps.examData) {
                var data = eps.examData;
                var subjects = Object.keys(data).filter(function(k) {
                    return k !== 'meta' && data[k] && data[k].exams;
                });
                for (var i = 0; i < subjects.length; i++) {
                    var subj = subjects[i];
                    var exams = data[subj].exams || [];
                    for (var j = 0; j < exams.length; j++) {
                        var exam = exams[j];
                        var stem = exam.stem || exam.question || exam.title || '';
                        if (stem.length > 0) {
                            questions.push({
                                title: stem.substring(0, 100),
                                excerpt: stem,
                                subject: subj,
                                examId: exam.id || '',
                                year: exam.year || '',
                                source: 'exam-bank'
                            });
                        }
                    }
                }
            }
        } catch (e) {
            // exam bank not available
        }
        return questions;
    }

    function extractComprehensiveData() {
        var entries = [];
        try {
            var cd = window.ComprehensiveData;
            if (!cd) return entries;

            if (cd.physicsInstruments) {
                var pi = cd.physicsInstruments;
                if (pi.estimationRules && pi.estimationRules.categories) {
                    pi.estimationRules.categories.forEach(function(cat) {
                        entries.push({
                            title: cat.name,
                            excerpt: cat.content ? cat.content.replace(/<[^>]+>/g, '').substring(0, 200) : '',
                            subject: '物理',
                            sectionId: 'physics-measurement-section',
                            source: 'comprehensive-data'
                        });
                    });
                }
                if (pi.physicalModels && pi.physicalModels.models) {
                    pi.physicalModels.models.forEach(function(m) {
                        entries.push({
                            title: m.name,
                            excerpt: m.description || '',
                            subject: '物理',
                            sectionId: 'physics-measurement-section',
                            source: 'comprehensive-data'
                        });
                    });
                }
            }

            if (cd.chemistryEquipment) {
                var ce = cd.chemistryEquipment;
                Object.keys(ce).forEach(function(key) {
                    var cat = ce[key];
                    if (cat && cat.equipments) {
                        cat.equipments.forEach(function(eq) {
                            entries.push({
                                title: eq.name,
                                excerpt: (eq.usage || '') + ' ' + (eq.examTip || ''),
                                subject: '化学',
                                sectionId: 'chemistry-equipment-section',
                                source: 'comprehensive-data'
                            });
                        });
                    }
                });
            }

            if (cd.biologyExamSkills) {
                var bes = cd.biologyExamSkills;
                if (bes.skillCategories) {
                    bes.skillCategories.forEach(function(sc) {
                        entries.push({
                            title: sc.title || sc.name || '',
                            excerpt: sc.description || '',
                            subject: '生物',
                            sectionId: 'biology-exam-skills-section',
                            source: 'comprehensive-data'
                        });
                    });
                }
            }
        } catch (e) {
            // comprehensive data not available
        }
        return entries;
    }

    function extractCrossSubjectTopics() {
        var entries = [];
        var crossTopics = [
            { title: '理化综合：电化学与电路分析', subject: '跨学科', excerpt: '原电池电动势计算、电解池与电路综合、法拉第常数应用' },
            { title: '理化生综合：能量转化', subject: '跨学科', excerpt: '光合作用光能转化率、呼吸作用ATP产率、热力学第一定律与生物代谢' },
            { title: '数理综合：函数与物理图像', subject: '跨学科', excerpt: 'v-t图斜率与加速度、F-x图面积与功、三角函数与简谐运动' },
            { title: '生化综合：有机化学与生物大分子', subject: '跨学科', excerpt: '官能团与氨基酸、酯化反应与脂质、糖类结构与还原性' },
            { title: '物理与地理综合', subject: '跨学科', excerpt: '地磁场、地球自转偏向力、太阳辐射与光学' },
            { title: '化学与地理综合', subject: '跨学科', excerpt: '岩石风化化学方程式、大气污染化学、水体富营养化' }
        ];
        crossTopics.forEach(function(ct) {
            entries.push({
                title: ct.title,
                excerpt: ct.excerpt,
                subject: ct.subject,
                sectionId: '',
                source: 'cross-subject'
            });
        });
        return entries;
    }

    function buildSearchIndex() {
        if (state.searchIndex) return state.searchIndex;

        var index = {
            tools: [],
            knowledge: [],
            exams: [],
            crossSubject: []
        };

        // 1. Tools from page DOM
        var pageTools = extractPageTools();
        if (pageTools.length > 0) {
            index.tools = pageTools;
        } else {
            index.tools = TOOL_INDEX.map(function(t) {
                return {
                    name: t.name,
                    desc: t.desc,
                    tool: t.tool,
                    subject: t.subject,
                    icon: t.icon,
                    source: 'fallback'
                };
            });
        }

        // merge fallback tools not found on page
        var pageToolIds = {};
        index.tools.forEach(function(t) { pageToolIds[t.tool] = true; });
        TOOL_INDEX.forEach(function(t) {
            if (!pageToolIds[t.tool]) {
                index.tools.push({
                    name: t.name,
                    desc: t.desc,
                    tool: t.tool,
                    subject: t.subject,
                    icon: t.icon,
                    source: 'fallback'
                });
            }
        });

        // 2. Knowledge from page DOM
        index.knowledge = extractPageKnowledge();

        // 3. Knowledge from ComprehensiveData
        var cdEntries = extractComprehensiveData();
        index.knowledge = index.knowledge.concat(cdEntries);

        // 4. Exam questions
        index.exams = extractExamQuestions();

        // 5. Cross-subject topics
        index.crossSubject = extractCrossSubjectTopics();

        state.searchIndex = index;
        return index;
    }

    // ============================================================
    // SEARCH ENGINE
    // ============================================================

    function matchesQuery(text, queryTerms) {
        if (!text) return false;
        var lower = text.toLowerCase();
        for (var i = 0; i < queryTerms.length; i++) {
            if (lower.indexOf(queryTerms[i]) === -1) return false;
        }
        return true;
    }

    function highlightKeywords(text, queryTerms) {
        if (!text || queryTerms.length === 0) return text || '';
        var result = text;
        for (var i = 0; i < queryTerms.length; i++) {
            var term = queryTerms[i];
            if (term.length === 0) continue;
            var escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            var regex = new RegExp('(' + escaped + ')', 'gi');
            result = result.replace(regex, '<mark>$1</mark>');
        }
        return result;
    }

    function search(query) {
        var q = query.trim();
        if (q.length === 0) {
            state.results = [];
            state.query = '';
            return;
        }

        state.query = q;
        var queryTerms = q.toLowerCase().split(/\s+/).filter(function(t) { return t.length > 0; });
        if (queryTerms.length === 0) {
            state.results = [];
            return;
        }

        var index = buildSearchIndex();
        var results = [];

        // search tools
        if (state.scope.tools) {
            for (var i = 0; i < index.tools.length; i++) {
                var t = index.tools[i];
                var searchText = (t.name || '') + ' ' + (t.desc || '') + ' ' + (t.subject || '');
                if (matchesQuery(searchText, queryTerms)) {
                    results.push({
                        category: 'tools',
                        icon: t.icon || '🔧',
                        title: t.name,
                        excerpt: t.desc || '',
                        tool: t.tool,
                        subject: t.subject,
                        action: 'tool'
                    });
                }
            }
        }

        // search knowledge
        if (state.scope.knowledge) {
            for (var j = 0; j < index.knowledge.length; j++) {
                var k = index.knowledge[j];
                var kText = (k.title || '') + ' ' + (k.excerpt || '');
                if (matchesQuery(kText, queryTerms)) {
                    results.push({
                        category: 'knowledge',
                        icon: getSubjectIcon(k.subject),
                        title: k.title,
                        excerpt: k.excerpt ? k.excerpt.substring(0, 200) : '',
                        subject: k.subject,
                        sectionId: k.sectionId,
                        action: 'knowledge'
                    });
                }
            }
        }

        // search exam questions
        if (state.scope.exams) {
            for (var m = 0; m < index.exams.length; m++) {
                var e = index.exams[m];
                if (e.excerpt && matchesQuery(e.excerpt, queryTerms)) {
                    results.push({
                        category: 'exams',
                        icon: '📝',
                        title: e.title,
                        excerpt: e.excerpt ? e.excerpt.substring(0, 200) : '',
                        subject: e.subject,
                        year: e.year,
                        examId: e.examId,
                        action: 'exam'
                    });
                }
            }
        }

        // search cross-subject
        for (var n = 0; n < index.crossSubject.length; n++) {
            var cs = index.crossSubject[n];
            if (matchesQuery(cs.title + ' ' + cs.excerpt, queryTerms)) {
                results.push({
                    category: 'crossSubject',
                    icon: '🌐',
                    title: cs.title,
                    excerpt: cs.excerpt ? cs.excerpt.substring(0, 200) : '',
                    subject: cs.subject,
                    action: 'crossSubject'
                });
            }
        }

        state.results = results;
    }

    function getSubjectIcon(subject) {
        var map = {
            '物理': '⚡',
            '化学': '🧪',
            '生物': '🧬',
            '数学': '📐',
            '语文': '📚',
            '英语': '📖',
            '历史': '📅',
            '地理': '🗺️',
            '政治': '📋',
            '备考': '🎯',
            '平台': '🏛️',
            '跨学科': '🌐'
        };
        return map[subject] || '📄';
    }

    // ============================================================
    // RESULT GROUPING
    // ============================================================

    var CATEGORY_CONFIG = {
        tools:       { label: '🔧 工具',       order: 1 },
        knowledge:   { label: '📚 知识点',     order: 2 },
        exams:       { label: '📝 真题',       order: 3 },
        crossSubject:{ label: '🌐 跨学科',     order: 4 }
    };

    function groupResults(results) {
        var groups = {};
        for (var i = 0; i < results.length; i++) {
            var cat = results[i].category;
            if (!groups[cat]) {
                groups[cat] = [];
            }
            groups[cat].push(results[i]);
        }

        var sortedGroups = [];
        var catKeys = Object.keys(groups);
        catKeys.sort(function(a, b) {
            var orderA = CATEGORY_CONFIG[a] ? CATEGORY_CONFIG[a].order : 99;
            var orderB = CATEGORY_CONFIG[b] ? CATEGORY_CONFIG[b].order : 99;
            return orderA - orderB;
        });

        for (var j = 0; j < catKeys.length; j++) {
            var key = catKeys[j];
            sortedGroups.push({
                key: key,
                label: CATEGORY_CONFIG[key] ? CATEGORY_CONFIG[key].label : key,
                items: groups[key]
            });
        }
        return sortedGroups;
    }

    // ============================================================
    // NAVIGATION HANDLERS
    // ============================================================

    function navigateToolResult(item) {
        if (!item.tool) return;
        var toolId = item.tool;

        try {
            if (typeof window.loadChemistryTool === 'function') {
                var chemTools = {
                    'chemistry-balancer': 'balancer',
                    'chemistry-quiz': 'quiz',
                    'chemistry-safety': 'safety',
                    'chemistry-electrochem': 'electrochem',
                    'chemistry-process': 'process',
                    'chemistry-organic': 'organic',
                    'chemistry-notebook': 'notebook',
                    'chemistry-process-analyzer': 'process-analyzer',
                    'chemistry-equipment': 'equipment',
                    'chemistry-valence': 'valence',
                    'chemistry-mole': 'mole',
                    'chemistry-equilibrium': 'equilibrium',
                    'chemistry-ion': 'ion',
                    'chemistry-structure': 'structure',
                    'chemistry-redox': 'redox',
                    'chemistry-rate': 'rate',
                    'chemistry-experiment': 'experiment'
                };
                if (chemTools[toolId]) {
                    window.loadChemistryTool(chemTools[toolId]);
                    closeSearch();
                    return;
                }
            }

            if (typeof window.loadBiologyTool === 'function') {
                var bioTools = {
                    'biology-genetics': 'genetics',
                    'biology-ecosystem': 'ecosystem',
                    'biology-mindmap': 'mindmap',
                    'biology-knowledge-graph': 'mindmap',
                    'biology-exam-skills': 'exam-skills',
                    'biology-pcr': 'pcr',
                    'biology-electrophoresis': 'electrophoresis',
                    'biology-pedigree': 'pedigree',
                    'biology-cell': 'cell',
                    'biology-protein': 'protein',
                    'biology-photosynthesis': 'photosynthesis',
                    'biology-respiration': 'respiration',
                    'biology-regulation': 'regulation',
                    'biology-immunity': 'immunity'
                };
                if (bioTools[toolId]) {
                    window.loadBiologyTool(bioTools[toolId]);
                    closeSearch();
                    return;
                }
            }

            if (typeof window.loadPhysicsTool === 'function') {
                var physTools = {
                    'physics-formula': 'calculator',
                    'physics-projectile': 'projectile',
                    'physics-mechanics': 'mechanics',
                    'physics-electricity': 'electricity',
                    'physics-optics': 'optics',
                    'physics-measurement': 'measurement',
                    'physics-kinematics': 'kinematics',
                    'physics-newton': 'newton',
                    'physics-momentum': 'momentum',
                    'physics-energy': 'energy',
                    'physics-electric-field': 'electric-field',
                    'physics-magnetic': 'magnetic',
                    'physics-induction': 'induction',
                    'physics-thermo': 'thermo',
                    'physics-wave': 'wave',
                    'physics-atomic': 'atomic'
                };
                if (physTools[toolId]) {
                    window.loadPhysicsTool(physTools[toolId]);
                    closeSearch();
                    return;
                }
            }
        } catch (e) {
            // loader not available, fall through
        }

        // Fallback: navigate via section ID
        if (typeof window.navigateTo === 'function') {
            window.navigateTo(toolId);
        } else {
            var sections = document.querySelectorAll('.section');
            for (var i = 0; i < sections.length; i++) {
                sections[i].classList.remove('active');
            }
            var target = document.getElementById(toolId + '-section');
            if (target) {
                target.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        closeSearch();
    }

    function navigateKnowledgeResult(item) {
        var targetId = item.sectionId;
        if (targetId && targetId.length > 0) {
            var sectionName = targetId.replace('-section', '');
            if (typeof window.navigateTo === 'function') {
                window.navigateTo(sectionName);
                closeSearch();
                return;
            }
        }

        var subject = item.subject;
        if (subject && typeof window.navigateTo === 'function') {
            var subjectMap = {
                '物理': 'physics',
                '化学': 'chemistry',
                '生物': 'biology',
                '数学': 'math',
                '语文': 'chinese',
                '英语': 'english',
                '历史': 'history',
                '地理': 'geography',
                '政治': 'politics',
                '备考': 'exam',
                '平台': 'platform'
            };
            var navSubject = subjectMap[subject] || subject;
            window.navigateTo(navSubject);
        }
        closeSearch();
    }

    function navigateExamResult(item) {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('exam');
        }
        closeSearch();
    }

    function navigateCrossSubjectResult(item) {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('platform');
        }
        closeSearch();
    }

    // ============================================================
    // RENDER
    // ============================================================

    function renderSearchInput() {
        var query = state.query;
        return '<div class="gs-search-input-wrap">' +
            '<span class="gs-search-icon">🔍</span>' +
            '<input type="text" id="gs-search-input" class="gs-search-input" ' +
            'placeholder="输入关键词搜索..." value="' + escapeHtml(query) + '" autofocus>' +
            (query.length > 0 ? '<button class="gs-search-clear" id="gs-search-clear">&times;</button>' : '') +
            '<button class="gs-search-close" id="gs-search-close">&times;</button>' +
            '</div>';
    }

    function renderScopeCheckboxes() {
        var allChecked = state.scope.tools && state.scope.knowledge && state.scope.exams;
        return '<div class="gs-scope-bar">' +
            '<label class="gs-scope-item' + (state.scope.tools ? ' active' : '') + '">' +
            '<input type="checkbox" id="gs-scope-tools" ' + (state.scope.tools ? 'checked' : '') + '> 工具</label>' +
            '<label class="gs-scope-item' + (state.scope.knowledge ? ' active' : '') + '">' +
            '<input type="checkbox" id="gs-scope-knowledge" ' + (state.scope.knowledge ? 'checked' : '') + '> 知识点</label>' +
            '<label class="gs-scope-item' + (state.scope.exams ? ' active' : '') + '">' +
            '<input type="checkbox" id="gs-scope-exams" ' + (state.scope.exams ? 'checked' : '') + '> 真题</label>' +
            '<label class="gs-scope-item gs-scope-all' + (allChecked ? ' active' : '') + '">' +
            '<input type="checkbox" id="gs-scope-all" ' + (allChecked ? 'checked' : '') + '> 全部</label>' +
            '</div>';
    }

    function renderResultItem(item, index, queryTerms) {
        var highlightedTitle = highlightKeywords(item.title, queryTerms);
        var highlightedExcerpt = highlightKeywords(item.excerpt || '', queryTerms);
        var subjectTag = item.subject ? '<span class="gs-result-tag">' + escapeHtml(item.subject) + '</span>' : '';
        var meta = '';
        if (item.year) {
            meta += '<span class="gs-result-meta">' + escapeHtml(item.year) + '</span>';
        }

        return '<div class="gs-result-item" data-index="' + index + '" data-action="' + (item.action || '') + '">' +
            '<span class="gs-result-icon">' + (item.icon || '📄') + '</span>' +
            '<div class="gs-result-content">' +
            '<div class="gs-result-title">' + highlightedTitle + subjectTag + meta + '</div>' +
            (highlightedExcerpt ? '<div class="gs-result-excerpt">' + highlightedExcerpt + '</div>' : '') +
            '</div>' +
            '</div>';
    }

    function renderResultGroup(group, queryTerms) {
        if (group.items.length === 0) return '';

        var itemsHtml = '';
        for (var i = 0; i < group.items.length; i++) {
            itemsHtml += renderResultItem(group.items[i], i, queryTerms);
        }

        return '<div class="gs-result-group">' +
            '<div class="gs-group-header">' +
            '<span class="gs-group-label">' + group.label + '</span>' +
            '<span class="gs-group-count">' + group.items.length + ' 条结果</span>' +
            '</div>' +
            '<div class="gs-group-items">' + itemsHtml + '</div>' +
            '</div>';
    }

    function renderEmptyState() {
        var html = '<div class="gs-empty">';
        html += '<div class="gs-empty-icon">🔍</div>';
        html += '<div class="gs-empty-text">输入关键词搜索...</div>';
        html += '<div class="gs-empty-hint">支持搜索工具名称、知识点、真题、跨学科内容</div>';

        if (state.recentSearches.length > 0) {
            html += '<div class="gs-recent-section">';
            html += '<div class="gs-recent-header">' +
                '<span>🕐 最近搜索</span>' +
                '<button class="gs-recent-clear" id="gs-recent-clear">清空</button>' +
                '</div>';
            html += '<div class="gs-recent-list">';
            for (var i = 0; i < state.recentSearches.length; i++) {
                html += '<button class="gs-recent-item" data-query="' + escapeHtml(state.recentSearches[i]) + '">' +
                    '<span class="gs-recent-icon">🕐</span>' +
                    '<span>' + escapeHtml(state.recentSearches[i]) + '</span>' +
                    '</button>';
            }
            html += '</div></div>';
        }

        html += '</div>';
        return html;
    }

    function renderNoResults() {
        return '<div class="gs-empty">' +
            '<div class="gs-empty-icon">😕</div>' +
            '<div class="gs-empty-text">未找到相关结果</div>' +
            '<div class="gs-empty-hint">试试其他关键词，或调整搜索范围</div>' +
            '</div>';
    }

    function renderResults(queryTerms) {
        if (state.results.length === 0 && state.query.length > 0) {
            return renderNoResults();
        }

        if (state.results.length === 0) {
            return renderEmptyState();
        }

        var groups = groupResults(state.results);
        var html = '';
        for (var i = 0; i < groups.length; i++) {
            html += renderResultGroup(groups[i], queryTerms);
        }

        html += '<div class="gs-results-footer">共找到 <strong>' + state.results.length + '</strong> 条结果</div>';
        return html;
    }

    function render() {
        var app = document.getElementById('global-search-app');
        if (!app) return;

        var q = state.query;
        var queryTerms = q.toLowerCase().split(/\s+/).filter(function(t) { return t.length > 0; });

        var html = '';
        html += renderSearchInput();
        html += renderScopeCheckboxes();
        html += '<div class="gs-results-container" id="gs-results-container">';
        html += renderResults(queryTerms);
        html += '</div>';

        app.innerHTML = html;

        bindEvents();
    }

    // ============================================================
    // EVENT BINDING
    // ============================================================

    function bindEvents() {
        var input = document.getElementById('gs-search-input');
        if (input) {
            input.addEventListener('input', function() {
                state.query = this.value;
                state.selectedIndex = -1;
                performSearch();
            });
            input.addEventListener('keydown', function(e) {
                handleInputKeydown(e);
            });
            setTimeout(function() { input.focus(); }, 50);
        }

        var clearBtn = document.getElementById('gs-search-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                state.query = '';
                state.results = [];
                state.selectedIndex = -1;
                render();
            });
        }

        var closeBtn = document.getElementById('gs-search-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                closeSearch();
            });
        }

        bindScopeCheckbox('gs-scope-tools', 'tools');
        bindScopeCheckbox('gs-scope-knowledge', 'knowledge');
        bindScopeCheckbox('gs-scope-exams', 'exams');

        var allCb = document.getElementById('gs-scope-all');
        if (allCb) {
            allCb.addEventListener('change', function() {
                var checked = this.checked;
                state.scope.tools = checked;
                state.scope.knowledge = checked;
                state.scope.exams = checked;
                render();
                performSearch();
            });
        }

        var resultItems = document.querySelectorAll('.gs-result-item');
        for (var i = 0; i < resultItems.length; i++) {
            resultItems[i].addEventListener('click', function() {
                var index = parseInt(this.getAttribute('data-index'));
                handleResultClickByIndex(index);
            });
        }

        var recentItems = document.querySelectorAll('.gs-recent-item');
        for (var j = 0; j < recentItems.length; j++) {
            recentItems[j].addEventListener('click', function() {
                var q = this.getAttribute('data-query');
                if (q) {
                    state.query = q;
                    performSearch();
                    render();
                }
            });
        }

        var clearRecentBtn = document.getElementById('gs-recent-clear');
        if (clearRecentBtn) {
            clearRecentBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                clearRecentSearches();
                render();
            });
        }

        var overlay = document.getElementById('global-search-overlay');
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    closeSearch();
                }
            });
        }

        document.addEventListener('keydown', handleGlobalKeydown);
    }

    function bindScopeCheckbox(id, scopeKey) {
        var cb = document.getElementById(id);
        if (cb) {
            cb.addEventListener('change', function() {
                state.scope[scopeKey] = this.checked;
                var allCb = document.getElementById('gs-scope-all');
                if (allCb) {
                    allCb.checked = state.scope.tools && state.scope.knowledge && state.scope.exams;
                }
                render();
                performSearch();
            });
        }
    }

    function handleInputKeydown(e) {
        var resultItems = document.querySelectorAll('.gs-result-item');
        var totalItems = resultItems.length;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (totalItems > 0) {
                state.selectedIndex = Math.min(state.selectedIndex + 1, totalItems - 1);
                updateSelection(resultItems);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (totalItems > 0) {
                state.selectedIndex = Math.max(state.selectedIndex - 1, 0);
                updateSelection(resultItems);
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (state.selectedIndex >= 0 && state.selectedIndex < totalItems) {
                handleResultClickByIndex(state.selectedIndex);
            } else if (state.query.length > 0) {
                addRecentSearch(state.query);
                performSearch();
                render();
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closeSearch();
        }
    }

    function updateSelection(items) {
        for (var i = 0; i < items.length; i++) {
            if (i === state.selectedIndex) {
                items[i].classList.add('gs-selected');
                items[i].scrollIntoView({ block: 'nearest' });
            } else {
                items[i].classList.remove('gs-selected');
            }
        }
    }

    function handleResultClickByIndex(index) {
        var groupItems = getAllResultItems();
        if (index >= 0 && index < groupItems.length) {
            var item = groupItems[index];
            addRecentSearch(state.query);
            handleResultAction(item);
        }
    }

    function getAllResultItems() {
        var flat = [];
        var groups = groupResults(state.results);
        for (var i = 0; i < groups.length; i++) {
            for (var j = 0; j < groups[i].items.length; j++) {
                flat.push(groups[i].items[j]);
            }
        }
        return flat;
    }

    function handleResultAction(item) {
        if (!item) return;
        switch (item.action) {
            case 'tool':
                navigateToolResult(item);
                break;
            case 'knowledge':
                navigateKnowledgeResult(item);
                break;
            case 'exam':
                navigateExamResult(item);
                break;
            case 'crossSubject':
                navigateCrossSubjectResult(item);
                break;
            default:
                if (item.tool) {
                    navigateToolResult(item);
                } else if (item.sectionId) {
                    navigateKnowledgeResult(item);
                }
                break;
        }
    }

    function performSearch() {
        search(state.query);
        render();
    }

    // ============================================================
    // GLOBAL KEYBOARD SHORTCUT
    // ============================================================

    function handleGlobalKeydown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            e.stopPropagation();
            if (state.isOpen) {
                closeSearch();
            } else {
                openSearch();
            }
        }
        if (e.key === 'Escape' && state.isOpen) {
            closeSearch();
        }
    }

    // ============================================================
    // OPEN / CLOSE
    // ============================================================

    function openSearch() {
        if (state.isOpen) return;

        state.query = '';
        state.results = [];
        state.selectedIndex = -1;

        var overlay = document.createElement('div');
        overlay.id = 'global-search-overlay';
        overlay.className = 'gs-overlay';
        overlay.innerHTML = '<div class="gs-modal" id="global-search-modal">' +
            '<div id="global-search-app" class="gs-app"></div>' +
            '</div>';
        document.body.appendChild(overlay);

        document.body.style.overflow = 'hidden';
        state.isOpen = true;
        render();

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeSearch();
            }
        });
    }

    function closeSearch() {
        if (!state.isOpen) return;

        var overlay = document.getElementById('global-search-overlay');
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }

        document.body.style.overflow = '';
        state.isOpen = false;
        state.query = '';
        state.results = [];
        state.selectedIndex = -1;
    }

    function toggleSearch() {
        if (state.isOpen) {
            closeSearch();
        } else {
            openSearch();
        }
    }

    // ============================================================
    // UTILITY
    // ============================================================

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================

    function init() {
        loadRecentSearches();
        document.addEventListener('keydown', handleGlobalKeydown);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ============================================================
    // INJECT STYLES
    // ============================================================

    function injectStyles() {
        if (document.getElementById('gs-styles')) return;

        var css = [
            '.gs-overlay {',
            '  position:fixed;top:0;left:0;width:100%;height:100%;',
            '  background:rgba(0,0,0,0.5);z-index:10000;',
            '  display:flex;align-items:flex-start;justify-content:center;',
            '  padding-top:8vh;animation:gsFadeIn 0.15s ease;',
            '}',
            '@keyframes gsFadeIn { from{opacity:0} to{opacity:1} }',
            '.gs-modal {',
            '  width:680px;max-width:95vw;max-height:82vh;',
            '  background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);',
            '  display:flex;flex-direction:column;overflow:hidden;',
            '  animation:gsSlideDown 0.2s ease;',
            '}',
            '@keyframes gsSlideDown { from{transform:translateY(-20px);opacity:0} to{transform:translateY(0);opacity:1} }',
            '.gs-app { display:flex;flex-direction:column;overflow:hidden;max-height:82vh; }',
            '.gs-search-input-wrap {',
            '  display:flex;align-items:center;padding:16px 20px 8px;gap:10px;',
            '  border-bottom:1px solid #e5e7eb;',
            '}',
            '.gs-search-icon { font-size:20px;flex-shrink:0; }',
            '.gs-search-input {',
            '  flex:1;border:0;outline:0;font-size:17px;color:#1f2937;',
            '  background:transparent;padding:8px 0;font-family:inherit;',
            '}',
            '.gs-search-input::placeholder { color:#9ca3af; }',
            '.gs-search-clear, .gs-search-close {',
            '  border:0;background:none;font-size:22px;cursor:pointer;',
            '  color:#9ca3af;padding:4px 8px;border-radius:6px;line-height:1;',
            '}',
            '.gs-search-clear:hover, .gs-search-close:hover { color:#374151;background:#f3f4f6; }',
            '.gs-scope-bar {',
            '  display:flex;gap:6px;padding:8px 20px;flex-wrap:wrap;',
            '  border-bottom:1px solid #f3f4f6;',
            '}',
            '.gs-scope-item {',
            '  font-size:12px;padding:4px 12px;border-radius:14px;cursor:pointer;',
            '  background:#f3f4f6;color:#6b7280;display:flex;align-items:center;gap:4px;',
            '  user-select:none;transition:background 0.15s,color 0.15s;',
            '}',
            '.gs-scope-item.active { background:#dbeafe;color:#2563eb; }',
            '.gs-scope-item input { display:none; }',
            '.gs-scope-item:hover { background:#e5e7eb; }',
            '.gs-scope-item.active:hover { background:#bfdbfe; }',
            '.gs-scope-all { font-weight:600; }',
            '.gs-results-container {',
            '  flex:1;overflow-y:auto;padding:8px 0;',
            '  max-height:55vh;',
            '}',
            '.gs-result-group { margin-bottom:4px; }',
            '.gs-group-header {',
            '  display:flex;align-items:center;justify-content:space-between;',
            '  padding:8px 20px 4px;',
            '}',
            '.gs-group-label { font-size:13px;font-weight:700;color:#374151; }',
            '.gs-group-count { font-size:11px;color:#9ca3af; }',
            '.gs-result-item {',
            '  display:flex;align-items:flex-start;gap:12px;padding:10px 20px;',
            '  cursor:pointer;transition:background 0.1s;',
            '  border-left:3px solid transparent;',
            '}',
            '.gs-result-item:hover, .gs-result-item.gs-selected {',
            '  background:#f0f7ff;border-left-color:#3b82f6;',
            '}',
            '.gs-result-icon { font-size:20px;flex-shrink:0;margin-top:2px;width:28px;text-align:center; }',
            '.gs-result-content { flex:1;min-width:0; }',
            '.gs-result-title {',
            '  font-size:14px;font-weight:600;color:#111827;line-height:1.5;',
            '  display:flex;align-items:center;gap:8px;flex-wrap:wrap;',
            '}',
            '.gs-result-title mark {',
            '  background:#fef08a;color:#854d0e;padding:1px 3px;border-radius:2px;',
            '}',
            '.gs-result-excerpt {',
            '  font-size:12px;color:#6b7280;margin-top:2px;line-height:1.5;',
            '  overflow:hidden;text-overflow:ellipsis;display:-webkit-box;',
            '  -webkit-line-clamp:2;-webkit-box-orient:vertical;',
            '}',
            '.gs-result-excerpt mark {',
            '  background:#fef08a;color:#854d0e;padding:1px 2px;border-radius:2px;',
            '}',
            '.gs-result-tag {',
            '  font-size:10px;padding:2px 8px;border-radius:10px;',
            '  background:#e5e7eb;color:#6b7280;font-weight:500;white-space:nowrap;',
            '}',
            '.gs-result-meta {',
            '  font-size:11px;color:#9ca3af;',
            '}',
            '.gs-empty {',
            '  display:flex;flex-direction:column;align-items:center;',
            '  padding:40px 20px;text-align:center;',
            '}',
            '.gs-empty-icon { font-size:48px;margin-bottom:12px; }',
            '.gs-empty-text { font-size:16px;color:#6b7280;margin-bottom:6px; }',
            '.gs-empty-hint { font-size:12px;color:#9ca3af; }',
            '.gs-recent-section {',
            '  margin-top:20px;width:100%;max-width:400px;text-align:left;',
            '}',
            '.gs-recent-header {',
            '  display:flex;justify-content:space-between;align-items:center;',
            '  margin-bottom:8px;font-size:13px;font-weight:600;color:#374151;',
            '}',
            '.gs-recent-clear {',
            '  border:0;background:none;font-size:12px;color:#9ca3af;cursor:pointer;',
            '  padding:2px 8px;border-radius:4px;',
            '}',
            '.gs-recent-clear:hover { color:#ef4444;background:#fef2f2; }',
            '.gs-recent-list { display:flex;flex-wrap:wrap;gap:6px; }',
            '.gs-recent-item {',
            '  display:flex;align-items:center;gap:4px;',
            '  padding:6px 12px;background:#f3f4f6;border:0;border-radius:8px;',
            '  font-size:13px;color:#374151;cursor:pointer;font-family:inherit;',
            '  transition:background 0.15s;',
            '}',
            '.gs-recent-item:hover { background:#e5e7eb; }',
            '.gs-recent-icon { font-size:12px; }',
            '.gs-results-footer {',
            '  text-align:center;padding:12px 20px;font-size:12px;',
            '  color:#9ca3af;border-top:1px solid #f3f4f6;',
            '}',
            '@media (max-width:700px) {',
            '  .gs-modal { width:100vw;max-width:100vw;max-height:100vh;border-radius:0; }',
            '  .gs-app { max-height:100vh; }',
            '  .gs-results-container { max-height:65vh; }',
            '  .gs-overlay { padding-top:0;align-items:stretch; }',
            '}'
        ].join('\n');

        var style = document.createElement('style');
        style.id = 'gs-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
        injectStyles();
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    return {
        open: openSearch,
        close: closeSearch,
        toggle: toggleSearch,
        render: render,
        search: function(query) {
            state.query = query || '';
            performSearch();
        },
        getState: function() { return state; },
        getToolIndex: function() { return TOOL_INDEX; },
        buildSearchIndex: buildSearchIndex,
        clearRecent: clearRecentSearches
    };

})();

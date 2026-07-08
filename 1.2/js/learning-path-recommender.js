// ============================================================
// js/learning-path-recommender.js — 知识图谱与题库联动 + 学习路径推荐
// 容器 ID: learning-path-recommender-app
// 功能：
//   1. 加载六科 knowledge.json，构建知识点索引
//   2. 加载 exam-bank.json，建立知识点→题目映射
//   3. 读取错题本，分析薄弱知识点
//   4. 基于薄弱点推荐题目、模板、学习路径
//   5. 可视化学习路径（Canvas 知识图谱）
// ES5 兼容，零依赖，innerHTML + Canvas
// ============================================================

window.learningPathRecommender = (function () {
    'use strict';

    var STORAGE_KEY = 'hspcb_error_notebook';

    // 学科中英文映射
    var SUBJECT_MAP = {
        'physics': '物理', 'chemistry': '化学', 'biology': '生物',
        'math': '数学', 'chinese': '语文', 'english': '英语'
    };
    var SUBJECT_EN = {
        '物理': 'physics', '化学': 'chemistry', '生物': 'biology',
        '数学': 'math', '语文': 'chinese', '英语': 'english'
    };

    // 知识点别名映射表：题库知识点 → 知识图谱topic名
    // 解决"牛顿第一定律"↔"牛顿运动定律"等同义/下属关系无子串包含的问题
    var TOPIC_ALIAS_MAP = {
        '物理': {
            '牛顿第一定律': '牛顿运动定律', '牛顿第二定律': '牛顿运动定律', '牛顿第三定律': '牛顿运动定律',
            '受力分析': '相互作用与力', '摩擦力': '相互作用与力', '力的合成与分解': '相互作用与力', '弹力': '相互作用与力',
            '动能定理': '机械能', '机械能守恒': '机械能', '功能关系': '机械能', '势能': '机械能',
            '类平抛运动': '曲线运动与平抛', '平抛运动': '曲线运动与平抛',
            '向心力': '圆周运动', '向心加速度': '圆周运动', '圆周运动规律': '圆周运动',
            '万有引力定律': '万有引力与航天', '卫星运动': '万有引力与航天', '天体运动': '万有引力与航天',
            '电场强度': '静电场', '电势能': '静电场', '电势差': '静电场', '带电粒子在电场中的运动': '静电场',
            '串并联电路': '直流电路', '电阻测量': '直流电路', '电阻定律': '直流电路', '电功率': '直流电路', '欧姆定律': '直流电路',
            '安培力': '磁场', '洛伦兹力': '磁场', '带电粒子在磁场中的运动': '磁场',
            '法拉第电磁感应定律': '电磁感应', '楞次定律': '电磁感应', '交变电流': '电磁感应', '变压器': '电磁感应',
            '光的直线传播': '几何光学', '光的折射': '几何光学', '全反射': '几何光学',
            '能级跃迁': '原子结构与玻尔理论', '玻尔模型': '原子结构与玻尔理论',
            '核裂变': '原子核与核反应', '核聚变': '原子核与核反应', '半衰期': '原子核与核反应',
            '动量守恒': '动量', '冲量': '动量', '动量定理': '动量',
            '理想气体状态方程': '气体实验定律', '玻意耳定律': '气体实验定律',
            '能量守恒': '热力学定律', '热力学第一定律': '热力学定律',
            '光的干涉': '波动光学', '光的衍射': '波动光学', '光的偏振': '波动光学'
        },
        '化学': {
            '钠及其化合物': '碱金属（钠）', '钠的性质': '碱金属（钠）',
            '铁的化合物': '铁及其化合物', '铁离子检验': '铁及其化合物',
            '原电池': '电化学', '电极反应': '电化学', '电解池': '电化学', '电镀': '电化学',
            '离子浓度比较': '电解质溶液', '盐类水解': '电解质溶液', '水的电离': '电解质溶液',
            '勒夏特列原理': '化学反应速率与化学平衡', '化学反应速率影响因素': '化学反应速率与化学平衡', '平衡常数': '化学反应速率与化学平衡',
            '实验仪器': '基本实验操作', '实验基本操作': '基本实验操作', '蒸馏': '物质的分离与提纯', '过滤': '物质的分离与提纯',
            '有机物分类': '有机物基础', '同分异构体': '有机物基础',
            '醇的性质': '烃的衍生物', '醛的性质': '烃的衍生物', '羧酸': '烃的衍生物', '酯化反应': '烃的衍生物',
            '加成反应': '烃', '取代反应': '烃', '乙烯': '烃', '苯': '烃',
            '周期表': '元素周期律', '元素周期表应用': '元素周期律',
            '共价键': '化学键与分子结构', '离子键': '化学键与分子结构', '杂化轨道': '化学键与分子结构',
            '气体摩尔体积': '物质的量', '阿伏加德罗常数': '物质的量',
            '氧化还原方程式配平': '氧化还原反应', '氧化剂': '氧化还原反应', '还原剂': '氧化还原反应'
        },
        '生物': {
            'DNA复制': 'DNA与基因', '转录': 'DNA与基因', '翻译': 'DNA与基因', '基因表达': 'DNA与基因',
            '常染色体隐性遗传': '孟德尔遗传定律', '常染色体显性遗传': '孟德尔遗传定律', '自由组合定律': '孟德尔遗传定律', '分离定律': '孟德尔遗传定律', '杂合子自交': '孟德尔遗传定律',
            '遗传与变异': '生物变异', '基因突变': '生物变异', '基因重组': '生物变异', '染色体变异': '生物变异',
            '现代进化理论': '现代生物进化理论', '自然选择': '现代生物进化理论',
            '种群增长': '种群与群落', '种群特征': '种群与群落', '种间关系（捕食/竞争）': '种群与群落', '群落演替': '种群与群落',
            '食物链': '生态系统', '生物多样性': '生态系统', '生态金字塔': '生态系统',
            '光合作用': '细胞代谢', '呼吸作用': '细胞代谢', '酶的特性': '细胞代谢', 'ATP': '细胞代谢',
            '有丝分裂': '细胞分裂', '减数分裂': '细胞分裂', '细胞周期': '细胞分裂',
            '生长素': '植物激素调节', '植物激素': '植物激素调节',
            '神经调节': '动物生命活动调节', '体液调节': '动物生命活动调节',
            '体液免疫': '免疫调节', '细胞免疫': '免疫调节',
            '能量流动': '生态系统物质循环与能量流动', '物质循环': '生态系统物质循环与能量流动'
        },
        '数学': {
            '异面直线所成角': '空间向量的应用——角度与距离', '二面角': '空间向量的应用——角度与距离', '线面角': '空间向量的应用——角度与距离',
            '圆的切线': '直线与圆、圆与圆的位置关系', '相交弦': '直线与圆、圆与圆的位置关系',
            '三角函数周期': '三角函数的图像与性质', '正弦函数': '三角函数的图像与性质', '余弦函数': '三角函数的图像与性质',
            '导数求极值': '导数与极值、最值', '导数求最值': '导数与极值、最值',
            '独立事件': '随机事件与概率', '古典概型': '随机事件与概率', '条件概率计算': '条件概率与全概率公式',
            '充分不必要条件': '充分条件与必要条件', '必要不充分条件': '充分条件与必要条件',
            '等差数列通项': '等差数列', '等差数列求和': '等差数列',
            '等比数列通项': '等比数列', '等比数列求和': '等比数列',
            '椭圆标准方程': '椭圆', '椭圆性质': '椭圆',
            '双曲线标准方程': '双曲线', '双曲线渐近线': '双曲线',
            '抛物线标准方程': '抛物线', '抛物线焦点': '抛物线',
            '函数零点': '函数的概念及表示', '函数定义域': '函数的概念及表示', '函数值域': '函数的概念及表示',
            '对数运算': '对数与对数运算', '指数运算': '指数与指数幂运算',
            '二项式展开式': '二项式定理', '二项式系数': '二项式定理',
            '排列数公式': '排列与组合', '组合数公式': '排列与组合',
            '导数几何意义': '导数的概念与运算', '导数四则运算': '导数的概念与运算'
        },
        '语文': {
            '炼字': '词曲鉴赏', '豪放词': '词曲鉴赏', '婉约词': '词曲鉴赏',
            '通感': '表达技巧与艺术手法', '白描手法': '表达技巧与艺术手法', '借景抒情': '表达技巧与艺术手法', '象征手法': '表达技巧与艺术手法',
            '小说阅读': '文学类文本阅读——小说', '小说三要素': '文学类文本阅读——小说',
            '散文阅读': '文学类文本阅读——散文',
            '名句默写': '高中必背篇目（文言文）', '古诗文默写': '高中必背篇目（诗词曲）',
            '词语辨析': '词语运用（实词、虚词、成语）', '成语运用': '词语运用（实词、虚词、成语）',
            '病句类型': '病句辨析与修改', '语序不当': '病句辨析与修改',
            '文言文翻译': '文言文翻译与断句', '文言文断句': '文言文翻译与断句',
            '论述文阅读': '论述类文本阅读',
            '辩证立意': '审题立意', '议论文立意': '审题立意',
            '论证方法': '论据使用与论证分析', '论据选择': '论据使用与论证分析'
        },
        '英语': {
            '过去分词作状语': '非谓语动词', '现在分词作定语': '非谓语动词', '不定式': '非谓语动词', '动名词': '非谓语动词',
            '动词时态': '时态与语态', '被动语态': '时态与语态', '现在完成时': '时态与语态',
            'with复合结构': '从句', '定语从句': '从句', '名词性从句': '从句', '状语从句': '从句',
            '比较级': '词义辨析', '最高级': '词义辨析', '近义词辨析': '词义辨析',
            '构词法应用': '构词法', '词根词缀': '构词法',
            '短文改错': '主谓一致',
            '邀请表达': '书信作文', '建议信': '书信作文', '感谢信': '书信作文'
        }
    };

    // 知识图谱缓存
    var knowledgeCache = {};
    // 题库缓存
    var examCache = null;
    // 知识点→题目索引：{ '物理|力学|牛顿运动定律': [题目1, 题目2, ...] }
    var topicQuestionIndex = {};

    var state = {
        currentSubject: '物理',
        loading: true,
        weakTopics: [],      // 薄弱知识点列表
        recommendPath: []    // 推荐学习路径
    };

    function safeParse(raw, fb) {
        try { var v = JSON.parse(raw); return v == null ? fb : v; }
        catch (e) { return fb; }
    }

    // 通过别名映射表解析知识点，返回标准化topic名
    // 优先级：1.别名表精确匹配 2.indexOf双向包含 3.原值返回
    function resolveTopicName(subject, rawName) {
        if (!rawName) return rawName;
        var aliasMap = TOPIC_ALIAS_MAP[subject] || {};
        // 1. 别名表精确匹配
        if (aliasMap[rawName]) return aliasMap[rawName];
        // 2. 别名表key的indexOf双向包含（处理"牛顿第二定律的应用"→"牛顿第二定律"）
        for (var alias in aliasMap) {
            if (aliasMap.hasOwnProperty(alias)) {
                if (rawName.indexOf(alias) !== -1 || alias.indexOf(rawName) !== -1) {
                    return aliasMap[alias];
                }
            }
        }
        // 3. 无匹配，返回原值
        return rawName;
    }

    // —— 数据加载 ——
    function loadKnowledge(subject, callback) {
        var enName = SUBJECT_EN[subject] || subject;
        if (knowledgeCache[enName]) {
            callback(knowledgeCache[enName]);
            return;
        }
        var url = 'data/' + enName + '/knowledge.json';
        fetch(url).then(function (res) {
            if (!res.ok) throw new Error('加载失败: ' + res.status);
            return res.json();
        }).then(function (data) {
            knowledgeCache[enName] = data;
            callback(data);
        }).catch(function (err) {
            console.error('加载知识图谱失败:', enName, err);
            callback(null);
        });
    }

    function loadExamBank(callback) {
        if (examCache) { callback(examCache); return; }
        fetch('data/exam-bank.json').then(function (res) {
            if (!res.ok) throw new Error('加载失败: ' + res.status);
            return res.json();
        }).then(function (data) {
            examCache = data;
            buildTopicQuestionIndex();
            callback(data);
        }).catch(function (err) {
            console.error('加载题库失败:', err);
            callback(null);
        });
    }

    // 构建知识点→题目索引
    function buildTopicQuestionIndex() {
        topicQuestionIndex = {};
        if (!examCache) return;

        var subjects = ['physics', 'chemistry', 'biology', 'math', 'chinese', 'english'];
        for (var i = 0; i < subjects.length; i++) {
            var subjEn = subjects[i];
            var subjCn = SUBJECT_MAP[subjEn] || subjEn;
            var subjData = examCache[subjEn];
            if (!subjData || !subjData.exams) continue;

            for (var j = 0; j < subjData.exams.length; j++) {
                var q = subjData.exams[j];
                var kps = q.knowledgePoints || [];
                for (var k = 0; k < kps.length; k++) {
                    var kp = kps[k];
                    if (!kp) continue;
                    var key = subjCn + '|' + (q.category || '未分类') + '|' + kp;
                    if (!topicQuestionIndex[key]) topicQuestionIndex[key] = [];
                    topicQuestionIndex[key].push(q);
                }
            }
        }
    }

    // 读取错题本
    function loadErrorNotebook() {
        var raw = localStorage.getItem(STORAGE_KEY);
        var data = safeParse(raw, []);
        if (!Array.isArray(data)) return [];
        return data;
    }

    // 分析薄弱知识点
    function analyzeWeakTopics(subject, callback) {
        var errors = loadErrorNotebook();
        var subjEn = SUBJECT_EN[subject] || subject;

        loadKnowledge(subject, function (knowledge) {
            loadExamBank(function (bank) {
                // 统计每个知识点的错误率
                var topicStats = {};  // key: 知识点关键词, { total, wrong, rate }

                // 从错题本统计
                for (var i = 0; i < errors.length; i++) {
                    var e = errors[i];
                    // 错题本条目可能包含 subject/knowledgePoints
                    var eSubject = e.subject || '';
                    if (eSubject !== subject && eSubject !== subjEn) continue;

                    var kps = e.knowledgePoints || e.tags || [];
                    if (typeof kps === 'string') kps = [kps];
                    for (var j = 0; j < kps.length; j++) {
                        var kp = kps[j];
                        if (!kp) continue;
                        if (!topicStats[kp]) topicStats[kp] = { total: 0, wrong: 0, rate: 0 };
                        topicStats[kp].wrong++;
                        topicStats[kp].total++;
                    }
                }

                // 从题库统计做题记录（如果有记录的话）
                // 这里主要依赖错题本

                // 计算错误率
                var weakTopics = [];
                for (var key in topicStats) {
                    if (!topicStats.hasOwnProperty(key)) continue;
                    var s = topicStats[key];
                    s.rate = s.total > 0 ? s.wrong / s.total : 0;
                    s.topic = key;
                    s.subject = subject;
                    if (s.wrong >= 1) weakTopics.push(s);
                }

                // 按错误次数降序
                weakTopics.sort(function (a, b) {
                    return b.wrong - a.wrong;
                });

                state.weakTopics = weakTopics;

                // 如果错题本为空，从知识图谱中选取重点知识点作为推荐
                if (weakTopics.length === 0 && knowledge) {
                    state.weakTopics = generateDefaultRecommendations(knowledge, subject);
                }

                // 生成学习路径
                generateLearningPath(knowledge, bank, subject);

                callback(weakTopics);
            });
        });
    }

    // 默认推荐（无错题时）
    function generateDefaultRecommendations(knowledge, subject) {
        var recs = [];
        if (!knowledge || !knowledge.chapters) return recs;

        for (var i = 0; i < knowledge.chapters.length; i++) {
            var ch = knowledge.chapters[i];
            if (!ch.topics) continue;
            for (var j = 0; j < ch.topics.length; j++) {
                var t = ch.topics[j];
                // 选取有 commonMistakes 的知识点作为推荐
                if (t.commonMistakes && t.commonMistakes.length > 0) {
                    recs.push({
                        topic: t.name,
                        subject: subject,
                        chapter: ch.name,
                        wrong: 0,
                        total: 0,
                        rate: 0,
                        isDefault: true,
                        keyPoints: t.keyPoints || [],
                        commonMistakes: t.commonMistakes || [],
                        formulas: t.formulas || [],
                        examTips: t.examTips || []
                    });
                }
            }
            // 只取前6个推荐
            if (recs.length >= 6) break;
        }
        return recs.slice(0, 6);
    }

    // 生成学习路径
    function generateLearningPath(knowledge, bank, subject) {
        var path = [];
        var weak = state.weakTopics.slice(0, 5); // 取前5个薄弱点

        for (var i = 0; i < weak.length; i++) {
            var w = weak[i];
            var topicName = w.topic;
            // 通过别名表解析为标准化topic名
            var resolvedName = resolveTopicName(subject, topicName);

            // 在知识图谱中查找对应知识点
            var topicData = null;
            var chapterName = w.chapter || '';
            if (knowledge && knowledge.chapters) {
                for (var c = 0; c < knowledge.chapters.length; c++) {
                    var ch = knowledge.chapters[c];
                    if (!ch.topics) continue;
                    for (var t = 0; t < ch.topics.length; t++) {
                        var tName = ch.topics[t].name;
                        if (tName === resolvedName || tName === topicName ||
                            tName.indexOf(resolvedName) !== -1 || resolvedName.indexOf(tName) !== -1 ||
                            tName.indexOf(topicName) !== -1 || topicName.indexOf(tName) !== -1) {
                            topicData = ch.topics[t];
                            chapterName = ch.name;
                            break;
                        }
                    }
                    if (topicData) break;
                }
            }

            // 查找相关题目
            var relatedQuestions = findRelatedQuestions(subject, chapterName, topicName);

            // 查找相关答题模板
            var relatedTemplate = findRelatedTemplate(subject, topicName);

            path.push({
                step: i + 1,
                topic: topicName,
                chapter: chapterName,
                weakLevel: w.wrong > 0 ? (w.rate >= 0.5 ? '高' : (w.rate >= 0.3 ? '中' : '低')) : '建议学习',
                wrongCount: w.wrong || 0,
                keyPoints: topicData ? (topicData.keyPoints || []) : (w.keyPoints || []),
                commonMistakes: topicData ? (topicData.commonMistakes || []) : (w.commonMistakes || []),
                formulas: topicData ? (topicData.formulas || []) : (w.formulas || []),
                examTips: topicData ? (topicData.examTips || []) : (w.examTips || []),
                recommendedQuestions: relatedQuestions.slice(0, 5),
                recommendedTemplate: relatedTemplate
            });
        }

        state.recommendPath = path;
    }

    // 查找相关题目
    function findRelatedQuestions(subject, chapter, topic) {
        var results = [];
        var subjEn = SUBJECT_EN[subject] || subject;
        if (!examCache || !examCache[subjEn]) return results;

        var exams = examCache[subjEn].exams || [];
        var topicLower = (topic || '').toLowerCase();
        // 通过别名表解析，支持"牛顿运动定律"匹配到"牛顿第二定律"等下属知识点
        var resolvedLower = (resolveTopicName(subject, topic) || '').toLowerCase();

        for (var i = 0; i < exams.length; i++) {
            var q = exams[i];
            var kps = q.knowledgePoints || [];
            var matched = false;
            for (var k = 0; k < kps.length; k++) {
                var kp = kps[k] || '';
                var kpLower = kp.toLowerCase();
                // 先用别名表解析题库知识点
                var kpResolved = (resolveTopicName(subject, kp) || '').toLowerCase();
                if (kpLower.indexOf(topicLower) !== -1 || topicLower.indexOf(kpLower) !== -1 ||
                    kpResolved.indexOf(resolvedLower) !== -1 || resolvedLower.indexOf(kpResolved) !== -1 ||
                    kpLower.indexOf(resolvedLower) !== -1 || resolvedLower.indexOf(kpLower) !== -1) {
                    matched = true;
                    break;
                }
            }
            if (matched) {
                results.push({
                    id: q.id,
                    year: q.year,
                    type: q.type,
                    difficulty: q.difficulty,
                    category: q.category,
                    question: (q.question || '').substring(0, 100) + '...',
                    knowledgePoints: kps
                });
            }
        }
        return results;
    }

    // 查找相关答题模板
    function findRelatedTemplate(subject, topic) {
        // 关键词匹配 + 别名表解析
        var topicLower = (topic || '').toLowerCase();
        var resolvedLower = (resolveTopicName(subject, topic) || '').toLowerCase();
        var templates = window.answerTemplatesData;
        if (!templates) return null;

        var subjKey = SUBJECT_EN[subject] || subject;
        var subjTemplates = templates.subjects && templates.subjects[subjKey];
        if (!subjTemplates || !subjTemplates.templates) return null;

        for (var i = 0; i < subjTemplates.templates.length; i++) {
            var t = subjTemplates.templates[i];
            var nameLower = (t.name || '').toLowerCase();
            var typeLower = (t.type || '').toLowerCase();
            if (nameLower.indexOf(topicLower) !== -1 || topicLower.indexOf(nameLower) !== -1 ||
                typeLower.indexOf(topicLower) !== -1 ||
                nameLower.indexOf(resolvedLower) !== -1 || resolvedLower.indexOf(nameLower) !== -1 ||
                typeLower.indexOf(resolvedLower) !== -1) {
                return { id: t.id, name: t.name, type: t.type };
            }
        }
        // 返回第一个模板作为默认
        if (subjTemplates.templates.length > 0) {
            var first = subjTemplates.templates[0];
            return { id: first.id, name: first.name, type: first.type };
        }
        return null;
    }

    // —— 渲染 ——
    function render() {
        var container = document.getElementById('learning-path-recommender-app');
        if (!container) return;

        var html = '';
        html += '<div style="max-width:1100px;margin:0 auto;padding:16px;font-family:system-ui,\'Microsoft YaHei\',sans-serif;">';

        // 标题
        html += '<div style="text-align:center;margin-bottom:18px;">';
        html += '<h2 style="margin:0 0 6px;font-size:22px;color:#1f2937;">🧭 学习路径推荐</h2>';
        html += '<p style="margin:0;font-size:13px;color:#6b7280;">知识图谱 × 题库联动 · 智能推荐薄弱知识点学习路径</p>';
        html += '</div>';

        // 学科选择
        html += '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px;margin-bottom:14px;">';
        html += '<div style="font-size:13px;color:#6b7280;margin-bottom:8px;">选择学科</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
        var subjects = ['物理', '化学', '生物', '数学', '语文', '英语'];
        for (var i = 0; i < subjects.length; i++) {
            var active = subjects[i] === state.currentSubject;
            html += '<button onclick="window.learningPathRecommender.selectSubject(\'' + subjects[i] + '\')" ' +
                'style="padding:7px 14px;border-radius:6px;border:1px solid ' + (active ? '#3b82f6' : '#d1d5db') + ';' +
                'background:' + (active ? '#3b82f6' : '#fff') + ';color:' + (active ? '#fff' : '#374151') + ';' +
                'cursor:pointer;font-size:13px;font-weight:' + (active ? '600' : '400') + ';">' + subjects[i] + '</button>';
        }
        html += '</div></div>';

        // 刷新按钮
        html += '<div style="text-align:center;margin-bottom:14px;">';
        html += '<button onclick="window.learningPathRecommender.refresh()" style="padding:8px 20px;background:#10b981;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">🔄 重新分析并生成路径</button>';
        html += '</div>';

        // 薄弱知识点概览
        if (state.weakTopics.length === 0 && !state.loading) {
            html += '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:24px;text-align:center;">';
            html += '<div style="font-size:48px;margin-bottom:10px;">📭</div>';
            html += '<div style="font-size:15px;color:#6b7280;margin-bottom:6px;">暂无错题记录</div>';
            html += '<div style="font-size:12px;color:#9ca3af;">去做一些练习题，错题将自动记录，系统会根据错题为你推荐学习路径</div>';
            html += '</div>';
        } else {
            // 路径步骤
            html += '<div id="lpr-path-container">';
            for (var j = 0; j < state.recommendPath.length; j++) {
                html += renderPathStep(state.recommendPath[j]);
            }
            html += '</div>';
        }

        // 知识图谱可视化
        html += '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px;margin-top:14px;">';
        html += '<div style="font-size:14px;font-weight:600;color:#1f2937;margin-bottom:10px;">🕸 知识图谱可视化</div>';
        html += '<canvas id="lpr-graph-canvas" width="1060" height="400" style="border:1px solid #e5e7eb;border-radius:8px;background:#fafafa;max-width:100%;"></canvas>';
        html += '<div style="font-size:11px;color:#9ca3af;margin-top:6px;">节点大小表示题目数量，红色表示薄弱知识点，绿色表示已掌握</div>';
        html += '</div>';

        html += '<div style="text-align:center;font-size:11px;color:#9ca3af;margin-top:12px;">基于错题本+知识图谱+题库联动分析 · 数据存储在 localStorage</div>';
        html += '</div>';

        container.innerHTML = html;

        // 绘制知识图谱
        drawKnowledgeGraph();
    }

    function renderPathStep(step) {
        var html = '';
        var levelColor = step.weakLevel === '高' ? '#ef4444' : (step.weakLevel === '中' ? '#f59e0b' : '#10b981');
        var levelBg = step.weakLevel === '高' ? '#fef2f2' : (step.weakLevel === '中' ? '#fffbeb' : '#f0fdf4');

        html += '<div style="background:' + levelBg + ';border:1px solid ' + levelColor + ';border-left:4px solid ' + levelColor + ';border-radius:10px;padding:16px;margin-bottom:12px;">';

        // 步骤头
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
        html += '<div>';
        html += '<span style="background:' + levelColor + ';color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;margin-right:6px;">步骤 ' + step.step + '</span>';
        html += '<span style="font-size:16px;font-weight:600;color:#1f2937;">' + step.topic + '</span>';
        if (step.chapter) {
            html += '<span style="font-size:12px;color:#6b7280;margin-left:8px;">(' + step.chapter + ')</span>';
        }
        html += '</div>';
        html += '<div style="font-size:12px;color:' + levelColor + ';font-weight:600;">' + step.weakLevel;
        if (step.wrongCount > 0) html += ' · 错' + step.wrongCount + '次';
        html += '</div>';
        html += '</div>';

        // 关键知识点
        if (step.keyPoints && step.keyPoints.length > 0) {
            html += '<details style="margin-bottom:8px;"><summary style="cursor:pointer;font-size:13px;color:#374151;font-weight:600;">📚 核心知识点（' + step.keyPoints.length + '）</summary>';
            html += '<ul style="margin:6px 0 0 18px;font-size:12px;color:#4b5563;line-height:1.6;">';
            for (var i = 0; i < step.keyPoints.length; i++) {
                html += '<li>' + step.keyPoints[i] + '</li>';
            }
            html += '</ul></details>';
        }

        // 公式
        if (step.formulas && step.formulas.length > 0) {
            html += '<details style="margin-bottom:8px;"><summary style="cursor:pointer;font-size:13px;color:#374151;font-weight:600;">📐 重要公式（' + step.formulas.length + '）</summary>';
            html += '<ul style="margin:6px 0 0 18px;font-size:12px;color:#4b5563;line-height:1.6;font-family:Consolas,monospace;">';
            for (var f = 0; f < step.formulas.length; f++) {
                html += '<li>' + step.formulas[f] + '</li>';
            }
            html += '</ul></details>';
        }

        // 常见错误
        if (step.commonMistakes && step.commonMistakes.length > 0) {
            html += '<details style="margin-bottom:8px;"><summary style="cursor:pointer;font-size:13px;color:#ef4444;font-weight:600;">⚠️ 易错点（' + step.commonMistakes.length + '）</summary>';
            html += '<ul style="margin:6px 0 0 18px;font-size:12px;color:#dc2626;line-height:1.6;">';
            for (var m = 0; m < step.commonMistakes.length; m++) {
                html += '<li>' + step.commonMistakes[m] + '</li>';
            }
            html += '</ul></details>';
        }

        // 考试技巧
        if (step.examTips && step.examTips.length > 0) {
            html += '<details style="margin-bottom:8px;"><summary style="cursor:pointer;font-size:13px;color:#7c3aed;font-weight:600;">💡 考试技巧（' + step.examTips.length + '）</summary>';
            html += '<ul style="margin:6px 0 0 18px;font-size:12px;color:#6d28d9;line-height:1.6;">';
            for (var t = 0; t < step.examTips.length; t++) {
                html += '<li>' + step.examTips[t] + '</li>';
            }
            html += '</ul></details>';
        }

        // 推荐题目
        if (step.recommendedQuestions && step.recommendedQuestions.length > 0) {
            html += '<div style="margin-top:10px;padding-top:10px;border-top:1px dashed #e5e7eb;">';
            html += '<div style="font-size:13px;font-weight:600;color:#1f2937;margin-bottom:6px;">📝 推荐练习题（' + step.recommendedQuestions.length + '）</div>';
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;">';
            for (var q = 0; q < step.recommendedQuestions.length; q++) {
                var question = step.recommendedQuestions[q];
                var diffColor = question.difficulty === 'hard' ? '#ef4444' : (question.difficulty === 'medium' ? '#f59e0b' : '#10b981');
                html += '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:8px;font-size:11px;cursor:pointer;" onclick="window.learningPathRecommender.startPractice(\'' + (question.id || '') + '\')">';
                html += '<div style="display:flex;justify-content:space-between;margin-bottom:3px;">';
                html += '<span style="color:#6b7280;">' + (question.year || '') + ' · ' + (question.type || '') + '</span>';
                html += '<span style="color:' + diffColor + ';font-size:10px;">' + (question.difficulty || '') + '</span>';
                html += '</div>';
                html += '<div style="color:#374151;line-height:1.4;">' + (question.question || '').substring(0, 50) + '...</div>';
                html += '</div>';
            }
            html += '</div></div>';
        }

        // 推荐模板
        if (step.recommendedTemplate) {
            html += '<div style="margin-top:8px;padding-top:8px;border-top:1px dashed #e5e7eb;font-size:12px;color:#6b7280;">';
            html += '📋 推荐答题模板：<span style="color:#3b82f6;cursor:pointer;text-decoration:underline;" onclick="window.learningPathRecommender.openTemplate(\'' + (step.recommendedTemplate.id || '') + '\')">' + step.recommendedTemplate.name + '</span>';
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    // 绘制知识图谱
    function drawKnowledgeGraph() {
        var canvas = document.getElementById('lpr-graph-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var W = canvas.width;
        var H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        // 获取当前学科知识图谱
        var subjEn = SUBJECT_EN[state.currentSubject] || state.currentSubject;
        var knowledge = knowledgeCache[subjEn];
        if (!knowledge || !knowledge.chapters) {
            ctx.fillStyle = '#9ca3af';
            ctx.font = '14px "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('点击"重新分析并生成路径"加载知识图谱', W / 2, H / 2);
            return;
        }

        // 构建节点
        var nodes = [];
        var centerX = W / 2;
        var centerY = H / 2;

        // 中心节点（学科名）
        nodes.push({ x: centerX, y: centerY, r: 30, label: state.currentSubject, color: '#1f2937', isCenter: true });

        // 章节节点
        var chapters = knowledge.chapters;
        var chapterCount = chapters.length;
        var chapterRadius = Math.min(140, Math.max(80, chapterCount * 12));

        for (var i = 0; i < chapterCount; i++) {
            var angle = (i / chapterCount) * 2 * Math.PI - Math.PI / 2;
            var ch = chapters[i];
            var cx = centerX + Math.cos(angle) * chapterRadius;
            var cy = centerY + Math.sin(angle) * chapterRadius;

            // 检查是否是薄弱章节
            var isWeak = false;
            for (var w = 0; w < state.weakTopics.length; w++) {
                if (state.weakTopics[w].chapter === ch.name) { isWeak = true; break; }
            }

            nodes.push({
                x: cx, y: cy, r: 16,
                label: ch.name || ch.title || '',
                color: isWeak ? '#ef4444' : '#3b82f6',
                isChapter: true,
                chapterIndex: i
            });

            // 知识点节点
            var topics = ch.topics || [];
            var topicCount = topics.length;
            for (var j = 0; j < topicCount && j < 6; j++) {
                var tAngle = angle + (j - (topicCount - 1) / 2) * 0.3;
                var tRadius = chapterRadius + 80;
                var tx = centerX + Math.cos(tAngle) * tRadius;
                var ty = centerY + Math.sin(tAngle) * tRadius;

                // 检查是否薄弱（支持别名表解析）
                var isTopicWeak = false;
                for (var wt = 0; wt < state.weakTopics.length; wt++) {
                    var wtName = state.weakTopics[wt].topic || state.weakTopics[wt].name || '';
                    var wtResolved = resolveTopicName(state.currentSubject, wtName);
                    if (wtName === topics[j].name || wtResolved === topics[j].name ||
                        (topics[j].name && (topics[j].name.indexOf(wtName) !== -1 || topics[j].name.indexOf(wtResolved) !== -1)) ||
                        (wtName && (wtName.indexOf(topics[j].name) !== -1)) ||
                        (wtResolved && (wtResolved.indexOf(topics[j].name) !== -1))) {
                        isTopicWeak = true; break;
                    }
                }

                // 题目数量决定节点大小
                var qCount = 0;
                var key = state.currentSubject + '|' + (ch.name || '') + '|' + (topics[j].name || '');
                if (topicQuestionIndex[key]) qCount = topicQuestionIndex[key].length;

                nodes.push({
                    x: tx, y: ty,
                    r: Math.max(6, Math.min(14, 6 + qCount)),
                    label: topics[j].name || '',
                    color: isTopicWeak ? '#ef4444' : '#10b981',
                    isTopic: true,
                    questionCount: qCount
                });
            }
        }

        // 绘制连线
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
        for (var n = 1; n < nodes.length; n++) {
            ctx.beginPath();
            ctx.moveTo(nodes[0].x, nodes[0].y);
            ctx.lineTo(nodes[n].x, nodes[n].y);
            ctx.stroke();
        }

        // 绘制节点
        for (var m = 0; m < nodes.length; m++) {
            var node = nodes[m];
            // 填充
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.r, 0, 2 * Math.PI);
            ctx.fill();
            // 边框
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 标签
            ctx.fillStyle = '#1f2937';
            ctx.font = (node.isCenter ? 'bold 13px' : (node.isChapter ? '11px' : '10px')) + ' "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'center';
            var labelY = node.y + node.r + 12;
            ctx.fillText(node.label, node.x, labelY);

            // 题目数标注
            if (node.isTopic && node.questionCount > 0) {
                ctx.fillStyle = '#6b7280';
                ctx.font = '9px "Microsoft YaHei", sans-serif';
                ctx.fillText(node.questionCount + '题', node.x, labelY + 11);
            }
        }

        // 图例
        ctx.font = '11px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(15, H - 25, 5, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = '#6b7280';
        ctx.fillText('薄弱知识点', 25, H - 21);
        ctx.fillStyle = '#10b981';
        ctx.beginPath(); ctx.arc(110, H - 25, 5, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = '#6b7280';
        ctx.fillText('已掌握/正常', 120, H - 21);
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath(); ctx.arc(210, H - 25, 8, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = '#6b7280';
        ctx.fillText('章节', 222, H - 21);
    }

    // —— 对外方法 ——
    function selectSubject(subj) {
        state.currentSubject = subj;
        state.loading = true;
        render();
        analyzeWeakTopics(subj, function () {
            state.loading = false;
            render();
        });
    }

    function refresh() {
        state.loading = true;
        render();
        analyzeWeakTopics(state.currentSubject, function () {
            state.loading = false;
            render();
        });
    }

    function startPractice(questionId) {
        if (window.app && typeof window.app.startPractice === 'function') {
            window.app.startPractice(questionId);
        } else {
            alert('题目ID: ' + questionId + '\n请通过学科导航进入做题界面');
        }
    }

    function openTemplate(templateId) {
        if (typeof window.navigateToolPage === 'function') {
            window.navigateToolPage('framework-trainer');
        } else {
            alert('答题模板ID: ' + templateId + '\n请通过"框架式答题训练"查看');
        }
    }

    // 初始化
    function init() {
        state.loading = true;
        // 预加载答题模板数据（如果存在）
        fetch('data/answer-templates.json').then(function (res) {
            return res.json();
        }).then(function (data) {
            window.answerTemplatesData = data;
        }).catch(function () {});

        // 加载初始学科
        analyzeWeakTopics(state.currentSubject, function () {
            state.loading = false;
            render();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        render: render,
        selectSubject: selectSubject,
        refresh: refresh,
        startPractice: startPractice,
        openTemplate: openTemplate
    };
})();

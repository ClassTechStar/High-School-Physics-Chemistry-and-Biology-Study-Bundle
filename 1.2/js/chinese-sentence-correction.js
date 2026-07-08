// ============================================================
// js/chinese-sentence-correction.js — 病句修改训练器
// 高考语言文字运用 · 病句辨析 (9分)
// ============================================================

window.chineseSentenceCorrection = (function() {
    'use strict';

    // ============================================================
    // 题库：30道高考风格病句（6大类型 × 3个难度级别）
    // ============================================================
    var QUESTIONS = [
        // ========== 基础 (10题) ==========
        {
            id: 1,
            sentence: '通过这次学习，使我明白了许多道理。',
            errorType: '成分残缺',
            correction: '这次学习使我明白了许多道理。',
            explanation: '主语残缺。介词"通过"与"使"连用，导致句子缺少主语。删除"通过"或"使"即可。也可改为"通过这次学习，我明白了许多道理。"',
            level: '基础'
        },
        {
            id: 2,
            sentence: '他的写作水平有了明显的提高和改进。',
            errorType: '搭配不当',
            correction: '他的写作水平有了明显的提高。',
            explanation: '动宾搭配不当。"水平"可以与"提高"搭配，但不能与"改进"搭配。"改进"通常用于方法、作风、技术等。应删除"和改进"。',
            level: '基础'
        },
        {
            id: 3,
            sentence: '我们必须认真克服并善于发现工作中的缺点。',
            errorType: '语序不当',
            correction: '我们必须善于发现并认真克服工作中的缺点。',
            explanation: '语序不当。按照逻辑顺序，应当先"发现"缺点，再"克服"缺点。并列短语的顺序应符合认知逻辑。',
            level: '基础'
        },
        {
            id: 4,
            sentence: '这本书大约需要20元左右。',
            errorType: '成分赘余',
            correction: '这本书大约需要20元。',
            explanation: '成分赘余。"大约"与"左右"都表示概数，同时使用造成语义重复。删除"大约"或"左右"均可。',
            level: '基础'
        },
        {
            id: 5,
            sentence: '科学发展到了今天，谁也不能否认它不是日新月异的。',
            errorType: '不合逻辑',
            correction: '科学发展到了今天，谁也不能否认它是日新月异的。',
            explanation: '否定不当。"不能否认"已是双重否定（=肯定），再加"不"变成三重否定（=否定），与原意相反。应删除多余的"不"。',
            level: '基础'
        },
        {
            id: 6,
            sentence: '能否努力学习是取得好成绩的关键。',
            errorType: '搭配不当',
            correction: '努力学习是取得好成绩的关键。',
            explanation: '两面对一面（照应不周）。"能否"包含"能"与"否"两面，而"取得好成绩"只对应"能"一面，前后不对应。',
            level: '基础'
        },
        {
            id: 7,
            sentence: '他的家乡是山东人。',
            errorType: '搭配不当',
            correction: '他的家乡是山东。',
            explanation: '主宾搭配不当（判断不当）。"家乡"是一个地方，不能是"人"。应改为"他的家乡是山东"或"他是山东人"。',
            level: '基础'
        },
        {
            id: 8,
            sentence: '在老师的帮助下，使他的学习成绩有了很大提高。',
            errorType: '成分残缺',
            correction: '在老师的帮助下，他的学习成绩有了很大提高。',
            explanation: '主语残缺。介词结构"在……下"与"使"连用导致主语缺失。删除"使"，让"他的学习成绩"作主语。',
            level: '基础'
        },
        {
            id: 9,
            sentence: '我断定他大概会来。',
            errorType: '不合逻辑',
            correction: '我断定他会来。',
            explanation: '前后矛盾。"断定"表示肯定判断，"大概"表示推测，两者语义矛盾。删除"大概"或把"断定"改为"猜想"。',
            level: '基础'
        },
        {
            id: 10,
            sentence: '我们班有三个同学们参加了比赛。',
            errorType: '成分赘余',
            correction: '我们班有三个同学参加了比赛。',
            explanation: '成分赘余。"三个"已表示复数，"同学们"中的"们"也表复数，语义重复。应删除"们"或删除"三个"并将"同学们"改为"同学"。',
            level: '基础'
        },

        // ========== 进阶 (10题) ==========
        {
            id: 11,
            sentence: '我国棉花的生产，长期不能自给。',
            errorType: '语序不当',
            correction: '我国生产的棉花，长期不能自给。',
            explanation: '定语与中心语位置颠倒。"自给"的主语应是"棉花"而非"生产"，应改为"生产的棉花"。这是高考常见语序错误。',
            level: '进阶'
        },
        {
            id: 12,
            sentence: '同学们以敬佩的目光注视着和倾听着这位专家的报告。',
            errorType: '搭配不当',
            correction: '同学们以敬佩的目光注视着这位专家，倾听着他的报告。',
            explanation: '搭配不当（顾此失彼）。"目光"可以"注视"但不能"倾听"，一个谓语同时支配两个宾语，其中一个搭配不当。应分开表述。',
            level: '进阶'
        },
        {
            id: 13,
            sentence: '他的学习成绩好的原因是他刻苦努力的结果。',
            errorType: '结构混乱',
            correction: '他的学习成绩好是因为他刻苦努力。',
            explanation: '句式杂糅。"原因是……"与"是……的结果"两种句式混杂在一起。应取其一，改为"原因是……"或"是……的结果"。',
            level: '进阶'
        },
        {
            id: 14,
            sentence: '从这件事中，使我们懂得了一个道理。',
            errorType: '成分残缺',
            correction: '这件事使我们懂得了一个道理。',
            explanation: '主语残缺。介词结构"从……中"与"使"连用导致主语缺失。删除"从……中"或"使"即可。',
            level: '进阶'
        },
        {
            id: 15,
            sentence: '她的歌声清亮、甜美、大方。',
            errorType: '搭配不当',
            correction: '她的歌声清亮、甜美。',
            explanation: '搭配不当。"大方"形容人的举止、态度，不能用来形容"歌声"。并列谓语/定语中存在与主语不搭配的成分。',
            level: '进阶'
        },
        {
            id: 16,
            sentence: '我们要尽可能减少不必要的浪费。',
            errorType: '不合逻辑',
            correction: '我们要尽可能减少浪费。',
            explanation: '语义重复。"浪费"本身就意味着"不必要"的消耗，"不必要的浪费"语义赘余。删除"不必要的"。',
            level: '进阶'
        },
        {
            id: 17,
            sentence: '不仅他学习好，而且体育也很棒。',
            errorType: '语序不当',
            correction: '他不仅学习好，而且体育也很棒。',
            explanation: '关联词语位置不当。前后分句主语相同（均为"他"），"不仅"应放在主语之后。若主语不同，"不仅"才放在主语前。',
            level: '进阶'
        },
        {
            id: 18,
            sentence: '两个学校的老师都来参加了会议。',
            errorType: '表意不明',
            correction: '学校的两位老师都来参加了会议。',
            explanation: '歧义。"两个学校的老师"可理解为"两所学校的老师"或"学校的两位老师"。应将"两个"改为"两位"或"两所"。',
            level: '进阶'
        },
        {
            id: 19,
            sentence: '他是众多死难者中幸免的一个。',
            errorType: '不合逻辑',
            correction: '他是这次灾难中幸免于难的一个。',
            explanation: '自相矛盾。"死难者"指已经死去的人，不可能"幸免"。应将"死难者"改为"遇难者"或"受灾者"。',
            level: '进阶'
        },
        {
            id: 20,
            sentence: '为了预防感冒不再发生，我们要加强锻炼。',
            errorType: '不合逻辑',
            correction: '为了预防感冒发生，我们要加强锻炼。',
            explanation: '否定不当。"预防"含有否定意味，"不再发生"也是否定，双重否定变为肯定（=让感冒发生）。删除"不再"或将"预防"改为"使"。',
            level: '进阶'
        },

        // ========== 冲刺 (10题) ==========
        {
            id: 21,
            sentence: '本栏目将各地电视台选送的歌舞曲艺、风情民俗和体育活动等方面的节目，加以重新编排和润色，进行的再创作。',
            errorType: '成分残缺',
            correction: '本栏目将各地电视台选送的歌舞曲艺、风情民俗和体育活动等方面的节目，加以重新编排和润色，进行了再创作。',
            explanation: '谓语残缺。"进行的再创作"是名词性短语，前面缺少谓语动词，应将"进行"改为"进行了"。这是高考难度较大的缺谓语题。',
            level: '冲刺'
        },
        {
            id: 22,
            sentence: '他潜心研究，反复试验，终于成功开发了具有预防及治疗胃肠病的新药。',
            errorType: '成分残缺',
            correction: '他潜心研究，反复试验，终于成功开发了具有预防及治疗胃肠病功效的新药。',
            explanation: '宾语中心语残缺。"具有"后面缺少与之搭配的宾语中心语，应补上"功效""作用"或"效果"。',
            level: '冲刺'
        },
        {
            id: 23,
            sentence: '作为一个共产党员，办事、想问题，都要从党和人民的根本利益为出发点。',
            errorType: '结构混乱',
            correction: '作为一个共产党员，办事、想问题，都要以党和人民的根本利益为出发点。',
            explanation: '句式杂糅。"从……出发"与"以……为出发点"两种句式混杂。应将"从"改为"以"，或改为"从……出发"。',
            level: '冲刺'
        },
        {
            id: 24,
            sentence: '电子工业能否迅速发展，并广泛渗透到各行各业中去，关键在于要加速训练并造就一批专门技术人才。',
            errorType: '搭配不当',
            correction: '电子工业能否迅速发展，并广泛渗透到各行各业中去，关键在于能否加速训练并造就一批专门技术人才。',
            explanation: '两面对一面。"能否"是两面词，而后文"要加速"只对应了"能"这一面，应在"要加速"前加"能否"。',
            level: '冲刺'
        },
        {
            id: 25,
            sentence: '这位老艺术家的表演，可以说已经达到了维妙维肖、出神入化的境界。',
            errorType: '成分赘余',
            correction: '这位老艺术家的表演，可以说已经达到了出神入化的境界。',
            explanation: '语义重复。"维妙维肖"与"出神入化"都形容技艺精湛，语义相近，同时使用造成赘余。保留一个即可。',
            level: '冲刺'
        },
        {
            id: 26,
            sentence: '美国政府表示仍然支持强势美元，但这到底只是嘴上说说还是要采取果断措施，经济学家对此的看法是否定的。',
            errorType: '表意不明',
            correction: '美国政府表示仍然支持强势美元，但这到底只是嘴上说说还是要采取果断措施，经济学家认为这只是嘴上说说。',
            explanation: '表意不明（指代不明）。"此"指代的是"嘴上说说"还是"采取果断措施"不清楚，造成歧义。应明确指代对象。',
            level: '冲刺'
        },
        {
            id: 27,
            sentence: '由于技术水平太低，这些产品质量不是比沿海地区的同类产品低，就是成本比沿海地区的高。',
            errorType: '语序不当',
            correction: '由于技术水平太低，这些产品不是质量比沿海地区的同类产品低，就是成本比沿海地区的高。',
            explanation: '关联词位置不当。前后分句主语相同（都是"这些产品"），"不是"应放在主语之后、谓语之前。',
            level: '冲刺'
        },
        {
            id: 28,
            sentence: '近年来，随着教育教学改革的不断深化，高等学校学生的培养质量，越来越受到社会的广泛重视。',
            errorType: '语序不当',
            correction: '近年来，随着教育教学改革的不断深化，高等学校培养学生的质量，越来越受到社会的广泛重视。',
            explanation: '定语语序不当。"学生的培养质量"语序不对，应改为"培养学生的质量"或"所培养学生的质量"，"培养"应修饰"学生"。',
            level: '冲刺'
        },
        {
            id: 29,
            sentence: '为了防止这类事故不再发生，我们加强了交通安全的教育和管理。',
            errorType: '不合逻辑',
            correction: '为了防止这类事故再次发生，我们加强了交通安全的教育和管理。',
            explanation: '否定不当（高考高频考点）。"防止"含否定义，"不再"也是否定，双重否定＝肯定（"让事故发生"）。将"不再"改为"再次"。',
            level: '冲刺'
        },
        {
            id: 30,
            sentence: '这位老先生虽然已经八十多岁了，但他的思路还很清晰，记忆力强，说话时口齿也很清楚。',
            errorType: '搭配不当',
            correction: '这位老先生虽然已经八十多岁了，但他的思路还很清晰，记忆力强，说话时口齿也很清晰。',
            explanation: '搭配不当。"口齿"应与"清晰""伶俐"搭配，不能与"清楚"搭配。"清楚"通常用于"思路""条理"等。改为"口齿也很清晰"。',
            level: '冲刺'
        }
    ];

    // 六大病句类型（用于选项展示）
    var ERROR_CATEGORIES = [
        '语序不当',
        '搭配不当',
        '成分残缺或赘余',
        '结构混乱',
        '表意不明',
        '不合逻辑'
    ];

    // 将具体错误类型映射到六大类
    var ERROR_TYPE_TO_CATEGORY = {
        '语序不当': '语序不当',
        '搭配不当': '搭配不当',
        '成分残缺': '成分残缺或赘余',
        '成分赘余': '成分残缺或赘余',
        '成分残缺或赘余': '成分残缺或赘余',
        '结构混乱': '结构混乱',
        '表意不明': '表意不明',
        '不合逻辑': '不合逻辑'
    };

    var LEVELS = ['基础', '进阶', '冲刺'];
    var QUESTIONS_PER_LEVEL = 10;

    // ============================================================
    // 状态管理
    // ============================================================
    var state = {
        page: 'home',          // 'home' | 'quiz' | 'result' | 'stats'
        mode: 'choice',        // 'choice' | 'correction'
        level: '基础',
        questions: [],
        currentIndex: 0,
        score: 0,
        totalAnswered: 0,
        answers: [],           // {questionId, userAnswer, isCorrect}
        // 按题型统计
        typeStats: {},         // {errorType: {correct, total}}
        // 历史记录
        history: loadHistory()
    };

    function resetState() {
        state.page = 'home';
        state.mode = 'choice';
        state.level = '基础';
        state.questions = [];
        state.currentIndex = 0;
        state.score = 0;
        state.totalAnswered = 0;
        state.answers = [];
        state.typeStats = {};
    }

    function loadHistory() {
        try {
            var raw = localStorage.getItem('cn_sentence_correction_history');
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) {
            // ignore
        }
        return { totalSessions: 0, totalCorrect: 0, totalQuestions: 0, typeStats: {} };
    }

    function saveHistory() {
        try {
            localStorage.setItem('cn_sentence_correction_history', JSON.stringify(state.history));
        } catch (e) {
            // ignore
        }
    }

    // ============================================================
    // 工具函数
    // ============================================================
    function shuffle(arr) {
        var result = arr.slice();
        var i = result.length;
        while (i) {
            var j = Math.floor(Math.random() * i);
            i--;
            var tmp = result[i];
            result[i] = result[j];
            result[j] = tmp;
        }
        return result;
    }

    function getCategory(errorType) {
        return ERROR_TYPE_TO_CATEGORY[errorType] || errorType;
    }

    function getQuestionsByLevel(level) {
        var filtered = [];
        for (var i = 0; i < QUESTIONS.length; i++) {
            if (QUESTIONS[i].level === level) {
                filtered.push(QUESTIONS[i]);
            }
        }
        return shuffle(filtered);
    }

    function getTypeAccuracy(type) {
        if (!state.typeStats[type]) return null;
        var s = state.typeStats[type];
        return s.total > 0 ? Math.round(s.correct / s.total * 100) : 0;
    }

    function getOverallAccuracy() {
        return state.totalAnswered > 0 ? Math.round(state.score / state.totalAnswered * 100) : 0;
    }

    // 标准化答案字符串，用于对比
    function normalizeStr(str) {
        if (!str) return '';
        return str.replace(/\s+/g, '')
            .replace(/[，,]/g, '，')
            .replace(/[。.]/g, '。')
            .replace(/[！!]/g, '！')
            .replace(/[？?]/g, '？')
            .replace(/[；;]/g, '；')
            .replace(/[：:]/g, '：')
            .replace(/[""＂]/g, '"')
            .replace(/[''＇]/g, '\'')
            .replace(/[（\(]/g, '（')
            .replace(/[）\)]/g, '）')
            .trim();
    }

    // ============================================================
    // 生成错误类型的4个选项（1个正确 + 3个干扰项）
    // ============================================================
    function generateOptions(correctErrorType) {
        var correctCat = getCategory(correctErrorType);
        var distractors = [];
        for (var i = 0; i < ERROR_CATEGORIES.length; i++) {
            if (ERROR_CATEGORIES[i] !== correctCat) {
                distractors.push(ERROR_CATEGORIES[i]);
            }
        }
        distractors = shuffle(distractors).slice(0, 3);
        var options = distractors.concat([correctCat]);
        return shuffle(options);
    }

    // ============================================================
    // CSS 样式注入
    // ============================================================
    var STYLE_INJECTED = false;

    function injectStyles() {
        if (STYLE_INJECTED) return;
        STYLE_INJECTED = true;
        var css = [
            '#chinese-sentence-correction-app { font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif; color: #1f2937; }',
            '#chinese-sentence-correction-app * { box-sizing: border-box; margin: 0; padding: 0; }',
            '#chinese-sentence-correction-app .csc-container { max-width: 720px; margin: 0 auto; padding: 16px; }',
            '#chinese-sentence-correction-app .csc-card { background: #fff; border-radius: 12px; padding: 20px 24px; margin-bottom: 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }',
            '#chinese-sentence-correction-app .csc-title { font-size: 22px; font-weight: 700; color: #111827; text-align: center; margin-bottom: 6px; }',
            '#chinese-sentence-correction-app .csc-subtitle { font-size: 13px; color: #6b7280; text-align: center; margin-bottom: 18px; }',
            '#chinese-sentence-correction-app .csc-btn { display: inline-block; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; transition: all 0.2s; outline: none; }',
            '#chinese-sentence-correction-app .csc-btn:hover { opacity: 0.88; transform: translateY(-1px); }',
            '#chinese-sentence-correction-app .csc-btn:active { transform: translateY(0); }',
            '#chinese-sentence-correction-app .csc-btn-primary { background: #6366f1; color: #fff; }',
            '#chinese-sentence-correction-app .csc-btn-success { background: #10b981; color: #fff; }',
            '#chinese-sentence-correction-app .csc-btn-danger { background: #ef4444; color: #fff; }',
            '#chinese-sentence-correction-app .csc-btn-outline { background: #fff; color: #6366f1; border: 2px solid #6366f1; }',
            '#chinese-sentence-correction-app .csc-btn-outline:hover { background: #eef2ff; }',
            '#chinese-sentence-correction-app .csc-btn-sm { padding: 6px 12px; font-size: 13px; border-radius: 6px; }',
            '#chinese-sentence-correction-app .csc-sentence-box { background: #fefce8; border: 2px solid #fde68a; border-radius: 10px; padding: 16px 20px; font-size: 17px; line-height: 1.8; color: #1f2937; margin-bottom: 16px; word-break: break-word; }',
            '#chinese-sentence-correction-app .csc-option { display: block; width: 100%; padding: 12px 16px; margin-bottom: 8px; background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; font-size: 15px; text-align: left; transition: all 0.2s; color: #374151; }',
            '#chinese-sentence-correction-app .csc-option:hover { border-color: #6366f1; background: #eef2ff; }',
            '#chinese-sentence-correction-app .csc-option.correct { border-color: #10b981; background: #d1fae5; color: #065f46; }',
            '#chinese-sentence-correction-app .csc-option.wrong { border-color: #ef4444; background: #fee2e2; color: #991b1b; }',
            '#chinese-sentence-correction-app .csc-option.disabled { pointer-events: none; opacity: 0.75; }',
            '#chinese-sentence-correction-app .csc-feedback { padding: 14px 16px; border-radius: 8px; margin-top: 12px; font-size: 14px; line-height: 1.7; }',
            '#chinese-sentence-correction-app .csc-feedback-correct { background: #d1fae5; border: 1px solid #6ee7b7; color: #065f46; }',
            '#chinese-sentence-correction-app .csc-feedback-wrong { background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; }',
            '#chinese-sentence-correction-app .csc-text-input { width: 100%; padding: 12px 14px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 15px; line-height: 1.6; font-family: inherit; resize: vertical; min-height: 60px; transition: border-color 0.2s; }',
            '#chinese-sentence-correction-app .csc-text-input:focus { border-color: #6366f1; outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }',
            '#chinese-sentence-correction-app .csc-progress-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 16px; }',
            '#chinese-sentence-correction-app .csc-progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 4px; transition: width 0.3s ease; }',
            '#chinese-sentence-correction-app .csc-progress-text { font-size: 13px; color: #6b7280; margin-bottom: 6px; text-align: right; }',
            '#chinese-sentence-correction-app .csc-level-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }',
            '#chinese-sentence-correction-app .csc-level-basic { background: #dbeafe; color: #1e40af; }',
            '#chinese-sentence-correction-app .csc-level-adv { background: #fef3c7; color: #92400e; }',
            '#chinese-sentence-correction-app .csc-level-sprint { background: #fce7f3; color: #9d174d; }',
            '#chinese-sentence-correction-app .csc-stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; margin-top: 10px; }',
            '#chinese-sentence-correction-app .csc-stat-item { background: #f9fafb; border-radius: 8px; padding: 12px 14px; text-align: center; border: 1px solid #e5e7eb; }',
            '#chinese-sentence-correction-app .csc-stat-val { font-size: 24px; font-weight: 700; color: #6366f1; }',
            '#chinese-sentence-correction-app .csc-stat-label { font-size: 12px; color: #6b7280; margin-top: 2px; }',
            '#chinese-sentence-correction-app .csc-divider { border: none; border-top: 1px solid #e5e7eb; margin: 14px 0; }',
            '#chinese-sentence-correction-app .csc-mode-select { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }',
            '#chinese-sentence-correction-app .csc-mode-card { flex: 1; min-width: 200px; max-width: 280px; padding: 20px; border: 2px solid #e5e7eb; border-radius: 12px; cursor: pointer; text-align: center; transition: all 0.2s; background: #fff; }',
            '#chinese-sentence-correction-app .csc-mode-card:hover { border-color: #6366f1; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99,102,241,0.15); }',
            '#chinese-sentence-correction-app .csc-mode-icon { font-size: 36px; margin-bottom: 8px; }',
            '#chinese-sentence-correction-app .csc-mode-name { font-size: 17px; font-weight: 700; color: #1f2937; margin-bottom: 4px; }',
            '#chinese-sentence-correction-app .csc-mode-desc { font-size: 13px; color: #6b7280; }',
            '#chinese-sentence-correction-app .csc-nav-row { display: flex; gap: 8px; align-items: center; justify-content: space-between; flex-wrap: wrap; margin-bottom: 14px; }',
            '#chinese-sentence-correction-app .csc-nav-row .csc-btn { margin: 0; }',
            '#chinese-sentence-correction-app .csc-score-display { font-size: 15px; font-weight: 600; color: #374151; }',
            '#chinese-sentence-correction-app .csc-error-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: #fef2f2; color: #dc2626; margin-right: 4px; }',
            '#chinese-sentence-correction-app .csc-correct-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: #d1fae5; color: #059669; margin-right: 4px; }',
            '#chinese-sentence-correction-app .csc-answer-compare { display: flex; gap: 12px; margin-top: 10px; flex-wrap: wrap; }',
            '#chinese-sentence-correction-app .csc-answer-col { flex: 1; min-width: 200px; padding: 12px; border-radius: 8px; font-size: 14px; line-height: 1.6; }',
            '#chinese-sentence-correction-app .csc-answer-col-user { background: #fee2e2; border: 1px solid #fca5a5; }',
            '#chinese-sentence-correction-app .csc-answer-col-ref { background: #d1fae5; border: 1px solid #6ee7b7; }',
            '@media (max-width: 600px) {',
            '  #chinese-sentence-correction-app .csc-container { padding: 10px; }',
            '  #chinese-sentence-correction-app .csc-card { padding: 14px 16px; }',
            '  #chinese-sentence-correction-app .csc-sentence-box { font-size: 15px; padding: 12px 14px; }',
            '}'
        ].join('\n');
        var style = document.createElement('style');
        style.id = 'csc-injected-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ============================================================
    // 渲染：首页
    // ============================================================
    function renderHome() {
        var app = document.getElementById('chinese-sentence-correction-app');
        if (!app) return;

        var html = '<div class="csc-container">';
        html += '<div class="csc-card">';
        html += '<h1 class="csc-title">病句修改训练器</h1>';
        html += '<p class="csc-subtitle">高考语言文字运用 &middot; 病句辨析（9分）&middot; 六大类型全覆盖</p>';

        // 模式选择
        html += '<p style="font-weight:600;margin-bottom:10px;text-align:center;font-size:15px;">请选择训练模式</p>';
        html += '<div class="csc-mode-select">';
        html += '<div class="csc-mode-card" id="csc-mode-choice">';
        html += '<div class="csc-mode-icon">A</div>';
        html += '<div class="csc-mode-name">选择题模式</div>';
        html += '<div class="csc-mode-desc">判断句子中的病句类型<br>从四个选项中选出正确答案</div>';
        html += '</div>';
        html += '<div class="csc-mode-card" id="csc-mode-correction">';
        html += '<div class="csc-mode-icon">✎</div>';
        html += '<div class="csc-mode-name">修改题模式</div>';
        html += '<div class="csc-mode-desc">自主修改病句<br>输入修改后的正确句子</div>';
        html += '</div>';
        html += '</div>';

        html += '<hr class="csc-divider">';

        // 级别选择
        html += '<p style="font-weight:600;margin-bottom:10px;text-align:center;font-size:15px;">选择难度级别</p>';
        html += '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">';
        var levelNames = { '基础': '基础 (入门)', '进阶': '进阶 (提升)', '冲刺': '冲刺 (突破)' };
        var levelBadges = { '基础': 'csc-level-basic', '进阶': 'csc-level-adv', '冲刺': 'csc-level-sprint' };
        for (var i = 0; i < LEVELS.length; i++) {
            var lvl = LEVELS[i];
            html += '<button class="csc-btn csc-btn-outline csc-level-select" data-level="' + lvl + '" style="min-width:140px;">';
            html += '<span class="csc-level-badge ' + levelBadges[lvl] + '">' + levelNames[lvl] + '</span>';
            html += '<br><span style="font-size:12px;color:#6b7280;">' + QUESTIONS_PER_LEVEL + ' 道题</span>';
            html += '</button>';
        }
        html += '</div>';

        // 历史简要
        if (state.history.totalQuestions > 0) {
            html += '<hr class="csc-divider">';
            html += '<div style="text-align:center;">';
            html += '<p style="font-size:13px;color:#6b7280;margin-bottom:6px;">历史记录：共练习 ' + state.history.totalQuestions + ' 题，正确 ' + state.history.totalCorrect + ' 题</p>';
            html += '<button class="csc-btn csc-btn-sm csc-btn-outline" id="csc-view-stats">查看详细统计</button>';
            html += '</div>';
        }

        html += '</div>'; // csc-card
        html += '</div>'; // csc-container

        app.innerHTML = html;

        // 绑定事件
        document.getElementById('csc-mode-choice').addEventListener('click', function() {
            state.mode = 'choice';
            // 高亮选中的模式
            document.getElementById('csc-mode-choice').style.borderColor = '#6366f1';
            document.getElementById('csc-mode-choice').style.background = '#eef2ff';
            document.getElementById('csc-mode-correction').style.borderColor = '#e5e7eb';
            document.getElementById('csc-mode-correction').style.background = '#fff';
        });
        document.getElementById('csc-mode-correction').addEventListener('click', function() {
            state.mode = 'correction';
            document.getElementById('csc-mode-correction').style.borderColor = '#6366f1';
            document.getElementById('csc-mode-correction').style.background = '#eef2ff';
            document.getElementById('csc-mode-choice').style.borderColor = '#e5e7eb';
            document.getElementById('csc-mode-choice').style.background = '#fff';
        });

        var levelBtns = document.querySelectorAll('.csc-level-select');
        for (var j = 0; j < levelBtns.length; j++) {
            levelBtns[j].addEventListener('click', function() {
                state.level = this.getAttribute('data-level');
                startQuiz();
            });
        }

        var statsBtn = document.getElementById('csc-view-stats');
        if (statsBtn) {
            statsBtn.addEventListener('click', function() {
                state.page = 'stats';
                render();
            });
        }
    }

    // ============================================================
    // 开始答题
    // ============================================================
    function startQuiz() {
        state.questions = getQuestionsByLevel(state.level);
        state.currentIndex = 0;
        state.score = 0;
        state.totalAnswered = 0;
        state.answers = [];
        state.typeStats = {};
        state.page = 'quiz';
        render();
    }

    // ============================================================
    // 渲染：答题页面
    // ============================================================
    function renderQuiz() {
        var app = document.getElementById('chinese-sentence-correction-app');
        if (!app) return;

        if (state.currentIndex >= state.questions.length) {
            finishQuiz();
            return;
        }

        var q = state.questions[state.currentIndex];
        var progressPct = Math.round(state.currentIndex / state.questions.length * 100);
        var levelBadges = { '基础': 'csc-level-basic', '进阶': 'csc-level-adv', '冲刺': 'csc-level-sprint' };
        var modeLabel = state.mode === 'choice' ? '选择题模式' : '修改题模式';

        var html = '<div class="csc-container">';

        // 导航栏
        html += '<div class="csc-nav-row">';
        html += '<button class="csc-btn csc-btn-sm csc-btn-outline" id="csc-back-home">← 返回首页</button>';
        html += '<span class="csc-level-badge ' + (levelBadges[state.level] || 'csc-level-basic') + '">' + state.level + ' · ' + modeLabel + '</span>';
        html += '<span class="csc-score-display">得分: ' + state.score + '/' + state.totalAnswered + '</span>';
        html += '</div>';

        // 进度条
        html += '<div class="csc-progress-text">第 ' + (state.currentIndex + 1) + ' / ' + state.questions.length + ' 题</div>';
        html += '<div class="csc-progress-bar"><div class="csc-progress-fill" style="width:' + progressPct + '%;"></div></div>';

        // 题目卡片
        html += '<div class="csc-card">';
        html += '<div style="font-size:12px;color:#9ca3af;margin-bottom:8px;">请仔细阅读以下句子，找出其中的语病：</div>';
        html += '<div class="csc-sentence-box">' + escapeHTML(q.sentence) + '</div>';

        if (state.mode === 'choice') {
            // 选择题模式
            html += '<p style="font-weight:600;margin-bottom:10px;font-size:14px;color:#374151;">这个句子的病句类型是：</p>';
            html += '<div id="csc-options-container"></div>';
        } else {
            // 修改题模式
            html += '<p style="font-weight:600;margin-bottom:10px;font-size:14px;color:#374151;">请在下方输入修改后的正确句子：</p>';
            html += '<textarea class="csc-text-input" id="csc-correction-input" placeholder="在此输入你的修改..."></textarea>';
            html += '<button class="csc-btn csc-btn-primary" id="csc-submit-correction" style="margin-top:10px;width:100%;">提交修改</button>';
        }

        html += '<div id="csc-feedback-area"></div>';
        html += '</div>'; // csc-card

        html += '</div>'; // csc-container

        app.innerHTML = html;

        // 绑定返回按钮
        document.getElementById('csc-back-home').addEventListener('click', function() {
            resetState();
            render();
        });

        if (state.mode === 'choice') {
            renderChoiceOptions(q);
        } else {
            document.getElementById('csc-submit-correction').addEventListener('click', function() {
                handleCorrectionSubmit(q);
            });
            // 回车提交
            document.getElementById('csc-correction-input').addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCorrectionSubmit(q);
                }
            });
        }
    }

    function renderChoiceOptions(q) {
        var container = document.getElementById('csc-options-container');
        if (!container) return;

        var options = generateOptions(q.errorType);
        var html = '';
        for (var i = 0; i < options.length; i++) {
            html += '<button class="csc-option" data-answer="' + options[i] + '">' +
                String.fromCharCode(65 + i) + '. ' + options[i] +
                '</button>';
        }
        container.innerHTML = html;

        var buttons = container.querySelectorAll('.csc-option');
        for (var j = 0; j < buttons.length; j++) {
            buttons[j].addEventListener('click', function() {
                handleChoiceAnswer(q, this);
            });
        }
    }

    // ============================================================
    // 处理选择题答案
    // ============================================================
    function handleChoiceAnswer(q, clickedBtn) {
        // 禁用所有选项
        var allBtns = document.querySelectorAll('#csc-options-container .csc-option');
        for (var i = 0; i < allBtns.length; i++) {
            allBtns[i].classList.add('disabled');
        }

        var userAnswer = clickedBtn.getAttribute('data-answer');
        var correctCat = getCategory(q.errorType);
        var isCorrect = (userAnswer === correctCat);

        // 高亮正确选项
        for (var j = 0; j < allBtns.length; j++) {
            if (allBtns[j].getAttribute('data-answer') === correctCat) {
                allBtns[j].classList.add('correct');
            }
        }

        // 如果选错，高亮错误选项
        if (!isCorrect) {
            clickedBtn.classList.add('wrong');
        }

        // 记录答案
        recordAnswer(q, userAnswer, isCorrect);

        // 显示反馈
        var feedbackArea = document.getElementById('csc-feedback-area');
        if (feedbackArea) {
            var fbClass = isCorrect ? 'csc-feedback-correct' : 'csc-feedback-wrong';
            var fbTitle = isCorrect ? '✓ 回答正确！' : '✗ 回答错误';
            var fbDetail = '';
            if (!isCorrect) {
                fbDetail = '<p style="margin-top:6px;">你选择了：<span class="csc-error-tag">' + escapeHTML(userAnswer) + '</span> ' +
                    '正确答案：<span class="csc-correct-tag">' + escapeHTML(correctCat) + '</span></p>';
            }
            fbDetail += '<p style="margin-top:8px;font-weight:600;">修改建议：</p>';
            fbDetail += '<p>' + escapeHTML(q.correction) + '</p>';
            fbDetail += '<p style="margin-top:6px;color:#6b7280;">' + escapeHTML(q.explanation) + '</p>';

            feedbackArea.innerHTML = '<div class="csc-feedback ' + fbClass + '">' +
                '<p style="font-weight:700;">' + fbTitle + '</p>' + fbDetail +
                '</div>';
        }

        // 下一题按钮
        showNextButton();
    }

    // ============================================================
    // 处理修改题提交
    // ============================================================
    function handleCorrectionSubmit(q) {
        var input = document.getElementById('csc-correction-input');
        if (!input) return;

        var userCorrection = input.value.trim();
        if (!userCorrection) {
            alert('请输入你的修改。');
            return;
        }

        // 禁用提交按钮和输入框
        input.disabled = true;
        var submitBtn = document.getElementById('csc-submit-correction');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.style.cursor = 'not-allowed';
        }

        // 判断是否正确
        var normalizedUser = normalizeStr(userCorrection);
        var normalizedRef = normalizeStr(q.correction);
        // 检查：用户答案包含关键修改（去掉了错误部分），或与参考答案匹配
        var isCorrect = (normalizedUser === normalizedRef);

        // 也接受其他合理修改：如果用户答案不包含原句的明显错误
        // 简单判断：用户的修改包含q.correction的关键词
        if (!isCorrect) {
            // 宽松判断：用户的修改去除了错误且语法通顺
            // 这里采用用户自我判断 + 参照答案对比
            // 我们展示对比，让用户自行确认
        }

        recordAnswer(q, userCorrection, isCorrect);

        // 显示反馈
        var feedbackArea = document.getElementById('csc-feedback-area');
        if (feedbackArea) {
            var fbClass = isCorrect ? 'csc-feedback-correct' : 'csc-feedback-wrong';
            var fbTitle = isCorrect ? '✓ 修改正确！' : '✗ 修改有差异，请对照参考答案：';

            var fbDetail = '<div class="csc-answer-compare">';
            fbDetail += '<div class="csc-answer-col csc-answer-col-user"><strong>你的修改：</strong><br>' + escapeHTML(userCorrection) + '</div>';
            fbDetail += '<div class="csc-answer-col csc-answer-col-ref"><strong>参考答案：</strong><br>' + escapeHTML(q.correction) + '</div>';
            fbDetail += '</div>';
            fbDetail += '<p style="margin-top:10px;color:#6b7280;">' + escapeHTML(q.explanation) + '</p>';

            // 如果自动判断为错误，提供手动确认
            if (!isCorrect) {
                fbDetail += '<div style="margin-top:12px;display:flex;gap:8px;">' +
                    '<button class="csc-btn csc-btn-sm csc-btn-success" id="csc-self-correct">✓ 我的修改也正确</button>' +
                    '<button class="csc-btn csc-btn-sm csc-btn-danger" id="csc-self-wrong">✗ 我确实答错了</button>' +
                    '</div>';
            }

            feedbackArea.innerHTML = '<div class="csc-feedback ' + fbClass + '">' +
                '<p style="font-weight:700;">' + fbTitle + '</p>' + fbDetail +
                '</div>';

            // 手动确认按钮
            var selfCorrectBtn = document.getElementById('csc-self-correct');
            var selfWrongBtn = document.getElementById('csc-self-wrong');
            if (selfCorrectBtn && selfWrongBtn) {
                selfCorrectBtn.addEventListener('click', function() {
                    // 纠正自动判断
                    adjustLastAnswer(true);
                    var fb = document.querySelector('#csc-feedback-area .csc-feedback');
                    if (fb) {
                        fb.className = 'csc-feedback csc-feedback-correct';
                        fb.querySelector('p').innerHTML = '✓ 修改正确！';
                    }
                    selfCorrectBtn.style.display = 'none';
                    selfWrongBtn.style.display = 'none';
                    document.getElementById('csc-next-btn').style.display = 'inline-block';
                });
                selfWrongBtn.addEventListener('click', function() {
                    selfCorrectBtn.style.display = 'none';
                    selfWrongBtn.style.display = 'none';
                    document.getElementById('csc-next-btn').style.display = 'inline-block';
                });
            }
        }

        showNextButton();
    }

    // ============================================================
    // 记录答案与统计
    // ============================================================
    function recordAnswer(q, userAnswer, isCorrect) {
        state.totalAnswered++;
        if (isCorrect) {
            state.score++;
        }

        state.answers.push({
            questionId: q.id,
            userAnswer: userAnswer,
            isCorrect: isCorrect
        });

        // 按类型统计
        var cat = getCategory(q.errorType);
        if (!state.typeStats[cat]) {
            state.typeStats[cat] = { correct: 0, total: 0 };
        }
        state.typeStats[cat].total++;
        if (isCorrect) {
            state.typeStats[cat].correct++;
        }
    }

    function adjustLastAnswer(isCorrect) {
        if (state.answers.length === 0) return;
        var last = state.answers[state.answers.length - 1];
        if (last.isCorrect === isCorrect) return;

        last.isCorrect = isCorrect;
        if (isCorrect) {
            state.score++;
        } else {
            state.score--;
        }

        // 更新类型统计
        // 找到对应的题目
        var q = null;
        for (var i = 0; i < QUESTIONS.length; i++) {
            if (QUESTIONS[i].id === last.questionId) {
                q = QUESTIONS[i];
                break;
            }
        }
        if (q) {
            var cat = getCategory(q.errorType);
            if (state.typeStats[cat]) {
                if (isCorrect) {
                    state.typeStats[cat].correct++;
                } else {
                    state.typeStats[cat].correct--;
                }
            }
        }
    }

    // ============================================================
    // 下一题按钮
    // ============================================================
    function showNextButton() {
        var card = document.querySelector('#chinese-sentence-correction-app .csc-card');
        if (!card) return;

        // 移除已存在的下一题按钮
        var existing = document.getElementById('csc-next-btn-area');
        if (existing) existing.parentNode.removeChild(existing);

        var isLast = (state.currentIndex >= state.questions.length - 1);
        var btnText = isLast ? '查看结果' : '下一题 →';
        var nextHtml = '<div id="csc-next-btn-area" style="text-align:center;margin-top:14px;">' +
            '<button class="csc-btn csc-btn-primary" id="csc-next-btn" style="' + (state.mode === 'correction' && !isLast ? '' : '') + '">' + btnText + '</button>' +
            '</div>';
        card.insertAdjacentHTML('beforeend', nextHtml);

        var nextBtn = document.getElementById('csc-next-btn');
        // 修改题模式下，如果自动判断为错误且手动确认按钮存在，先隐藏下一题按钮
        if (state.mode === 'correction') {
            var selfBtns = document.querySelectorAll('#csc-self-correct, #csc-self-wrong');
            if (selfBtns.length > 0) {
                nextBtn.style.display = 'none';
            }
        }

        nextBtn.addEventListener('click', function() {
            state.currentIndex++;
            if (state.currentIndex >= state.questions.length) {
                finishQuiz();
            } else {
                state.page = 'quiz';
                render();
            }
        });
    }

    // ============================================================
    // 完成答题
    // ============================================================
    function finishQuiz() {
        state.page = 'result';

        // 更新历史记录
        state.history.totalSessions++;
        state.history.totalCorrect += state.score;
        state.history.totalQuestions += state.totalAnswered;
        for (var cat in state.typeStats) {
            if (state.typeStats.hasOwnProperty(cat)) {
                if (!state.history.typeStats[cat]) {
                    state.history.typeStats[cat] = { correct: 0, total: 0 };
                }
                state.history.typeStats[cat].correct += state.typeStats[cat].correct;
                state.history.typeStats[cat].total += state.typeStats[cat].total;
            }
        }
        saveHistory();

        render();
    }

    // ============================================================
    // 渲染：结果页面
    // ============================================================
    function renderResult() {
        var app = document.getElementById('chinese-sentence-correction-app');
        if (!app) return;

        var accuracy = getOverallAccuracy();
        var totalQuestions = state.questions.length;
        var levelBadges = { '基础': 'csc-level-basic', '进阶': 'csc-level-adv', '冲刺': 'csc-level-sprint' };
        var modeLabel = state.mode === 'choice' ? '选择题模式' : '修改题模式';

        var html = '<div class="csc-container">';
        html += '<div class="csc-card" style="text-align:center;">';

        // 成绩
        var gradeEmoji = accuracy >= 90 ? '🏆' : accuracy >= 70 ? '👍' : accuracy >= 50 ? '📚' : '💪';
        html += '<div style="font-size:48px;margin-bottom:8px;">' + gradeEmoji + '</div>';
        html += '<h2 style="font-size:22px;margin-bottom:4px;">训练完成！</h2>';
        html += '<p style="color:#6b7280;margin-bottom:16px;">' +
            '<span class="csc-level-badge ' + (levelBadges[state.level] || '') + '">' + state.level + '</span> ' +
            modeLabel +
            '</p>';

        html += '<div class="csc-stat-grid">';
        html += '<div class="csc-stat-item"><div class="csc-stat-val">' + state.score + '/' + totalQuestions + '</div><div class="csc-stat-label">得分</div></div>';
        html += '<div class="csc-stat-item"><div class="csc-stat-val">' + accuracy + '%</div><div class="csc-stat-label">正确率</div></div>';
        html += '<div class="csc-stat-item"><div class="csc-stat-val">' + state.totalAnswered + '</div><div class="csc-stat-label">答题数</div></div>';
        html += '</div>';

        // 按错误类型统计
        html += '<hr class="csc-divider">';
        html += '<p style="font-weight:600;margin-bottom:8px;text-align:left;">各类型正确率：</p>';
        html += '<div style="text-align:left;">';
        for (var k = 0; k < ERROR_CATEGORIES.length; k++) {
            var cat = ERROR_CATEGORIES[k];
            var acc = getTypeAccuracy(cat);
            if (acc !== null) {
                var barColor = acc >= 80 ? '#10b981' : acc >= 60 ? '#f59e0b' : '#ef4444';
                html += '<div style="margin-bottom:8px;">';
                html += '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px;">';
                html += '<span>' + cat + '</span><span style="font-weight:600;">' + acc + '%</span>';
                html += '</div>';
                html += '<div style="height:6px;background:#e5e7eb;border-radius:3px;"><div style="height:100%;width:' + acc + '%;background:' + barColor + ';border-radius:3px;"></div></div>';
                html += '</div>';
            }
        }
        html += '</div>';

        // 操作按钮
        html += '<hr class="csc-divider">';
        html += '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">';
        html += '<button class="csc-btn csc-btn-primary" id="csc-retry">重新练习（' + state.level + '）</button>';
        html += '<button class="csc-btn csc-btn-outline" id="csc-home">返回首页</button>';
        html += '</div>';

        // 错题回顾
        var wrongAnswers = [];
        for (var a = 0; a < state.answers.length; a++) {
            if (!state.answers[a].isCorrect) {
                wrongAnswers.push(state.answers[a]);
            }
        }
        if (wrongAnswers.length > 0) {
            html += '<hr class="csc-divider">';
            html += '<p style="font-weight:600;text-align:left;margin-bottom:8px;">错题回顾 (' + wrongAnswers.length + '题)：</p>';
            for (var w = 0; w < wrongAnswers.length; w++) {
                var wa = wrongAnswers[w];
                var wq = null;
                for (var wi = 0; wi < QUESTIONS.length; wi++) {
                    if (QUESTIONS[wi].id === wa.questionId) {
                        wq = QUESTIONS[wi];
                        break;
                    }
                }
                if (wq) {
                    html += '<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 14px;margin-bottom:8px;text-align:left;">';
                    html += '<p style="font-weight:600;margin-bottom:4px;">' + (w + 1) + '. ' + escapeHTML(wq.sentence) + '</p>';
                    html += '<p style="font-size:13px;color:#dc2626;">错误类型：' + escapeHTML(wq.errorType) + '</p>';
                    html += '<p style="font-size:13px;color:#059669;">修改：' + escapeHTML(wq.correction) + '</p>';
                    html += '<p style="font-size:12px;color:#6b7280;">' + escapeHTML(wq.explanation) + '</p>';
                    html += '</div>';
                }
            }
        }

        html += '</div>'; // csc-card
        html += '</div>'; // csc-container

        app.innerHTML = html;

        document.getElementById('csc-retry').addEventListener('click', function() {
            startQuiz();
        });
        document.getElementById('csc-home').addEventListener('click', function() {
            resetState();
            render();
        });
    }

    // ============================================================
    // 渲染：统计页面
    // ============================================================
    function renderStats() {
        var app = document.getElementById('chinese-sentence-correction-app');
        if (!app) return;

        var h = state.history;
        var hAccuracy = h.totalQuestions > 0 ? Math.round(h.totalCorrect / h.totalQuestions * 100) : 0;
        var levelBadges = { '基础': 'csc-level-basic', '进阶': 'csc-level-adv', '冲刺': 'csc-level-sprint' };

        var html = '<div class="csc-container">';
        html += '<div class="csc-card">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
        html += '<h2 style="font-size:20px;">学习统计</h2>';
        html += '<button class="csc-btn csc-btn-sm csc-btn-outline" id="csc-stats-back">← 返回</button>';
        html += '</div>';

        html += '<div class="csc-stat-grid" style="margin-bottom:12px;">';
        html += '<div class="csc-stat-item"><div class="csc-stat-val">' + h.totalSessions + '</div><div class="csc-stat-label">训练次数</div></div>';
        html += '<div class="csc-stat-item"><div class="csc-stat-val">' + h.totalQuestions + '</div><div class="csc-stat-label">累计答题</div></div>';
        html += '<div class="csc-stat-item"><div class="csc-stat-val">' + h.totalCorrect + '</div><div class="csc-stat-label">累计正确</div></div>';
        html += '<div class="csc-stat-item"><div class="csc-stat-val">' + hAccuracy + '%</div><div class="csc-stat-label">总正确率</div></div>';
        html += '</div>';

        html += '<hr class="csc-divider">';
        html += '<p style="font-weight:600;margin-bottom:8px;">各类型正确率（历史累计）：</p>';
        var hasStats = false;
        for (var k = 0; k < ERROR_CATEGORIES.length; k++) {
            var cat = ERROR_CATEGORIES[k];
            var hs = h.typeStats[cat];
            if (hs && hs.total > 0) {
                hasStats = true;
                var acc = Math.round(hs.correct / hs.total * 100);
                var barColor = acc >= 80 ? '#10b981' : acc >= 60 ? '#f59e0b' : '#ef4444';
                html += '<div style="margin-bottom:8px;">';
                html += '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px;">';
                html += '<span>' + cat + ' (' + hs.correct + '/' + hs.total + ')</span><span style="font-weight:600;">' + acc + '%</span>';
                html += '</div>';
                html += '<div style="height:6px;background:#e5e7eb;border-radius:3px;"><div style="height:100%;width:' + acc + '%;background:' + barColor + ';border-radius:3px;"></div></div>';
                html += '</div>';
            }
        }
        if (!hasStats) {
            html += '<p style="color:#9ca3af;font-size:13px;">暂无统计数据，开始练习吧！</p>';
        }

        html += '<hr class="csc-divider">';
        html += '<button class="csc-btn csc-btn-danger csc-btn-sm" id="csc-clear-history" style="width:100%;">清除历史记录</button>';

        html += '</div>'; // csc-card
        html += '</div>'; // csc-container

        app.innerHTML = html;

        document.getElementById('csc-stats-back').addEventListener('click', function() {
            state.page = 'home';
            render();
        });
        document.getElementById('csc-clear-history').addEventListener('click', function() {
            if (confirm('确定要清除所有历史记录吗？此操作不可撤销。')) {
                state.history = { totalSessions: 0, totalCorrect: 0, totalQuestions: 0, typeStats: {} };
                saveHistory();
                render();
            }
        });
    }

    // ============================================================
    // HTML 转义
    // ============================================================
    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ============================================================
    // 主渲染入口
    // ============================================================
    function render() {
        var app = document.getElementById('chinese-sentence-correction-app');
        if (!app) return;

        injectStyles();

        switch (state.page) {
            case 'home':
                renderHome();
                break;
            case 'quiz':
                renderQuiz();
                break;
            case 'result':
                renderResult();
                break;
            case 'stats':
                renderStats();
                break;
            default:
                resetState();
                renderHome();
                break;
        }
    }

    // ============================================================
    // 公开 API
    // ============================================================
    return {
        render: render,
        // 方便外部重置
        reset: function() {
            resetState();
            render();
        },
        // 获取状态（调试用）
        getState: function() {
            return state;
        }
    };
})();

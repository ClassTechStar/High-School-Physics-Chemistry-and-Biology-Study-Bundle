// ============================================================
// js/chinese-tools.js — 语文交互式工具模块(3个工具)
// ============================================================

// ============================================================
// 模块1：chineseRecitation - 默写自测系统
// ============================================================
window.chineseRecitation = (function() {
    'use strict';
    var texts = [
        { title: '劝学', author: '荀子', dynasty: '战国', excerpt: '青，取之于蓝，而青于蓝；冰，水为之，而寒于水。', blanks: [{ word: '蓝', hint: '一种植物染料' }, { word: '水', hint: '液体' }] },
        { title: '劝学', author: '荀子', dynasty: '战国', excerpt: '故木受绳则直，金就砺则利，君子博学而日参省乎己，则知明而行无过矣。', blanks: [{ word: '绳', hint: '墨线' }, { word: '砺', hint: '磨刀石' }, { word: '参省', hint: '反省检查' }] },
        { title: '师说', author: '韩愈', dynasty: '唐', excerpt: '师者，所以传道受业解惑也。', blanks: [{ word: '道', hint: '道理' }, { word: '业', hint: '学业' }, { word: '解惑', hint: '解答疑惑' }] },
        { title: '师说', author: '韩愈', dynasty: '唐', excerpt: '是故弟子不必不如师，师不必贤于弟子，闻道有先后，术业有专攻，如是而已。', blanks: [{ word: '贤', hint: '超过、胜过' }, { word: '术业', hint: '技艺和学业' }] },
        { title: '赤壁赋', author: '苏轼', dynasty: '宋', excerpt: '壬戌之秋，七月既望，苏子与客泛舟游于赤壁之下。', blanks: [{ word: '既望', hint: '农历十六日' }, { word: '泛舟', hint: '乘船' }] },
        { title: '赤壁赋', author: '苏轼', dynasty: '宋', excerpt: '清风徐来，水波不兴。举酒属客，诵明月之诗，歌窈窕之章。', blanks: [{ word: '兴', hint: '起' }, { word: '属', hint: '劝请' }, { word: '窈窕', hint: '美好' }] },
        { title: '琵琶行', author: '白居易', dynasty: '唐', excerpt: '千呼万唤始出来，犹抱琵琶半遮面。', blanks: [{ word: '唤', hint: '呼叫' }, { word: '遮', hint: '遮挡' }] },
        { title: '琵琶行', author: '白居易', dynasty: '唐', excerpt: '大弦嘈嘈如急雨，小弦切切如私语。嘈嘈切切错杂弹，大珠小珠落玉盘。', blanks: [{ word: '嘈嘈', hint: '声音沉重' }, { word: '切切', hint: '声音轻细' }, { word: '玉盘', hint: '玉石盘子' }] },
        { title: '离骚', author: '屈原', dynasty: '战国', excerpt: '长太息以掩涕兮，哀民生之多艰。', blanks: [{ word: '太息', hint: '叹息' }, { word: '掩涕', hint: '擦泪' }] },
        { title: '离骚', author: '屈原', dynasty: '战国', excerpt: '亦余心之所善兮，虽九死其犹未悔。', blanks: [{ word: '善', hint: '崇尚' }, { word: '悔', hint: '后悔' }] },
        { title: '逍遥游', author: '庄子', dynasty: '战国', excerpt: '鹏之徙于南冥也，水击三千里，抟扶摇而上者九万里。', blanks: [{ word: '徙', hint: '迁徙' }, { word: '抟', hint: '盘旋' }, { word: '扶摇', hint: '旋风' }] },
        { title: '阿房宫赋', author: '杜牧', dynasty: '唐', excerpt: '六王毕，四海一，蜀山兀，阿房出。', blanks: [{ word: '毕', hint: '灭亡' }, { word: '兀', hint: '光秃' }] },
        { title: '阿房宫赋', author: '杜牧', dynasty: '唐', excerpt: '秦人不暇自哀，而后人哀之；后人哀之而不鉴之，亦使后人而复哀后人也。', blanks: [{ word: '暇', hint: '空闲' }, { word: '鉴', hint: '借鉴' }] },
        { title: '岳阳楼记', author: '范仲淹', dynasty: '宋', excerpt: '先天下之忧而忧，后天下之乐而乐。', blanks: [{ word: '忧', hint: '忧虑' }, { word: '乐', hint: '快乐' }] },
        { title: '岳阳楼记', author: '范仲淹', dynasty: '宋', excerpt: '不以物喜，不以己悲。', blanks: [{ word: '物', hint: '外物' }, { word: '己', hint: '自己' }] },
        { title: '醉翁亭记', author: '欧阳修', dynasty: '宋', excerpt: '醉翁之意不在酒，在乎山水之间也。', blanks: [{ word: '意', hint: '意趣' }, { word: '山水', hint: '自然景色' }] },
        { title: '醉翁亭记', author: '欧阳修', dynasty: '宋', excerpt: '野芳发而幽香，佳木秀而繁阴。', blanks: [{ word: '芳', hint: '花' }, { word: '秀', hint: '茂盛' }] },
        { title: '前出师表', author: '诸葛亮', dynasty: '三国', excerpt: '臣本布衣，躬耕于南阳，苟全性命于乱世，不求闻达于诸侯。', blanks: [{ word: '布衣', hint: '平民' }, { word: '躬耕', hint: '亲自耕种' }, { word: '闻达', hint: '出名显达' }] },
        { title: '前出师表', author: '诸葛亮', dynasty: '三国', excerpt: '受任于败军之际，奉命于危难之间。', blanks: [{ word: '败军', hint: '战败' }, { word: '危难', hint: '危急困难' }] }
    ];

    var state = { mode: 'sequential', currentIdx: 0, score: 0, total: 0, userAnswers: {}, showResults: false };

    function renderRecitation() {
        var container = document.getElementById('chinese-recitation-app');
        if (!container) return;
        state = { mode: 'sequential', currentIdx: 0, score: 0, total: 0, userAnswers: {}, showResults: false };
        renderUI();
    }

    function renderUI() {
        var container = document.getElementById('chinese-recitation-app');
        if (!container) return;
        var items = state.mode === 'random' ? shuffleArray(texts.slice()) : texts;
        var current = items[state.currentIdx];
        var html = '<div class="tool-app-container" style="padding:16px;">' +
            '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center;">' +
            '<button class="rec-mode-btn" data-mode="sequential" style="padding:7px 14px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:' + (state.mode === 'sequential' ? '#0ea5e9' : '#fff') + ';color:' + (state.mode === 'sequential' ? '#fff' : '#333') + ';">顺序</button>' +
            '<button class="rec-mode-btn" data-mode="random" style="padding:7px 14px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:' + (state.mode === 'random' ? '#0ea5e9' : '#fff') + ';color:' + (state.mode === 'random' ? '#fff' : '#333') + ';">随机</button>' +
            (state.showResults ? '' : '<button id="rec-next" style="padding:7px 14px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;">' + (state.currentIdx >= texts.length - 1 ? '完成' : '下一题') + '</button>') +
            '<span style="margin-left:auto;font-size:13px;color:#666;">' + (state.currentIdx + 1) + '/' + texts.length + ' | 得分: ' + state.score + '/' + state.total + '</span>' +
            '</div>';

        if (state.showResults) {
            html += '<div style="text-align:center;padding:40px;"><h3 style="color:#0ea5e9;">测试完成!</h3><p style="font-size:18px;margin:16px 0;">得分: ' + state.score + ' / ' + state.total + '</p><p style="font-size:14px;color:#666;">正确率: ' + (state.total > 0 ? Math.round(state.score / state.total * 100) : 0) + '%</p><button id="rec-restart" style="padding:10px 24px;background:#0ea5e9;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;margin-top:16px;">重新开始</button></div>';
        } else {
            html += '<div style="margin-bottom:16px;padding:12px 16px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;">' +
                '<div style="font-size:13px;color:#666;">' + current.title + ' · ' + current.author + ' · ' + current.dynasty + '</div>' +
                '</div>';
            var excerptHtml = current.excerpt;
            for (var i = 0; i < current.blanks.length; i++) {
                var b = current.blanks[i];
                var key = current.title + '_' + i;
                var userAns = state.userAnswers[key] || '';
                var feedback = '';
                if (state.userAnswers.hasOwnProperty(key)) {
                    var correct = userAns === b.word;
                    feedback = '<span style="color:' + (correct ? '#10b981' : '#ef4444') + ';font-size:12px;">' + (correct ? ' ✓' : ' ✗ 正确答案: ' + b.word) + '</span>';
                }
                excerptHtml = excerptHtml.replace(b.word, '<span style="background:#fef08a;padding:0 4px;border-radius:3px;">___</span>');
                var inputHtml = '<div style="margin:8px 0;display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:#999;">提示: ' + b.hint + '</span><input class="rec-input" data-key="' + key + '" data-answer="' + b.word + '" style="width:120px;padding:4px 8px;border:1px solid #d1d5db;border-radius:4px;font-size:13px;" value="' + userAns + '"' + (state.userAnswers.hasOwnProperty(key) ? ' disabled' : '') + '>' + feedback + '</div>';
                html += inputHtml;
            }
            html += '<div style="margin-top:12px;padding:12px;background:#f9fafb;border-radius:6px;font-size:14px;line-height:1.8;color:#333;">' + excerptHtml + '</div>';
            html += '<button id="rec-check" style="margin-top:8px;padding:7px 16px;background:#0ea5e9;color:#fff;border:none;border-radius:6px;cursor:pointer;">检查答案</button>';
        }

        container.innerHTML = html;

        if (state.showResults) {
            var restartBtn = document.getElementById('rec-restart');
            if (restartBtn) restartBtn.onclick = function() { state = { mode: 'sequential', currentIdx: 0, score: 0, total: 0, userAnswers: {}, showResults: false }; renderUI(); };
        } else {
            var modeBtns = container.querySelectorAll('.rec-mode-btn');
            for (var i = 0; i < modeBtns.length; i++) {
                modeBtns[i].onclick = function() {
                    state.mode = this.getAttribute('data-mode');
                    state.currentIdx = 0;
                    state.userAnswers = {};
                    state.showResults = false;
                    renderUI();
                };
            }
            var nextBtn = document.getElementById('rec-next');
            if (nextBtn) nextBtn.onclick = function() {
                if (state.currentIdx >= texts.length - 1) { state.showResults = true; renderUI(); }
                else { state.currentIdx++; state.userAnswers = {}; renderUI(); }
            };
            var checkBtn = document.getElementById('rec-check');
            if (checkBtn) checkBtn.onclick = function() {
                var inputs = container.querySelectorAll('.rec-input');
                var allFilled = true;
                for (var j = 0; j < inputs.length; j++) {
                    var key = inputs[j].getAttribute('data-key');
                    var answer = inputs[j].getAttribute('data-answer');
                    var userAns = inputs[j].value.trim();
                    state.userAnswers[key] = userAns;
                    state.total++;
                    if (userAns === answer) state.score++;
                    if (!userAns) allFilled = false;
                }
                renderUI();
            };
        }
    }

    function shuffleArray(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        }
        return a;
    }

    return { renderRecitation: renderRecitation };
})();

// ============================================================
// 模块2：chineseVocabularyQuiz - 文言实词闯关
// ============================================================
window.chineseVocabularyQuiz = (function() {
    'use strict';
    var words = [
        { word: '爱', meaning: '吝惜，舍不得', sentence: '齐国虽褊小，吾何爱一牛？', options: ['吝惜', '喜欢', '爱护', '亲近'], source: '《孟子·齐桓晋文之事》' },
        { word: '安', meaning: '怎么，哪里', sentence: '燕雀安知鸿鹄之志哉？', options: ['怎么', '安全', '安稳', '安心'], source: '《史记·陈涉世家》' },
        { word: '被', meaning: '通"披"，穿', sentence: '将军身被坚执锐。', options: ['通"披"，穿', '遭遇', '覆盖', '被动'], source: '《史记·陈涉世家》' },
        { word: '倍', meaning: '通"背"，违背', sentence: '愿伯具言臣之不敢倍德也。', options: ['通"背"，违背', '加倍', '倍数', '背离'], source: '《鸿门宴》' },
        { word: '本', meaning: '推究', sentence: '抑本其成败之迹。', options: ['推究', '根本', '本来', '课本'], source: '《伶官传序》' },
        { word: '鄙', meaning: '边境', sentence: '蜀之鄙有二僧。', options: ['边境', '鄙视', '浅陋', '粗俗'], source: '《为学》' },
        { word: '兵', meaning: '武器', sentence: '收天下之兵，聚之咸阳。', options: ['武器', '士兵', '军队', '战争'], source: '《过秦论》' },
        { word: '病', meaning: '担心，忧虑', sentence: '君子病无能焉，不病人之不己知也。', options: ['担心', '生病', '毛病', '困苦'], source: '《论语》' },
        { word: '察', meaning: '考察，了解', sentence: '陛下亦宜自谋，以咨诹善道，察纳雅言。', options: ['考察', '观察', '明白', '精明'], source: '《出师表》' },
        { word: '朝', meaning: '早晨', sentence: '朝服衣冠，窥镜。', options: ['早晨', '朝廷', '朝拜', '朝代'], source: '《邹忌讽齐王纳谏》' },
        { word: '曾', meaning: '竟然', sentence: '曾不若孀妻弱子。', options: ['竟然', '曾经', '通"层"', '增加'], source: '《愚公移山》' },
        { word: '乘', meaning: '趁着', sentence: '因利乘便，宰割天下。', options: ['趁着', '乘坐', '辆', '乘法'], source: '《过秦论》' },
        { word: '诚', meaning: '确实，的确', sentence: '臣诚知不如徐公美。', options: ['确实', '真诚', '如果', '诚意'], source: '《邹忌讽齐王纳谏》' },
        { word: '除', meaning: '授予官职', sentence: '寻蒙国恩，除臣洗马。', options: ['授予官职', '除去', '台阶', '除法'], source: '《陈情表》' },
        { word: '辞', meaning: '推辞', sentence: '蒙辞以军中多务。', options: ['推辞', '言辞', '告辞', '辞赋'], source: '《孙权劝学》' },
        { word: '从', meaning: '跟随', sentence: '沛公旦日从百余骑来见项王。', options: ['使……跟随', '跟随', '听从', '自从'], source: '《鸿门宴》' },
        { word: '殆', meaning: '大概', sentence: '郦元之所见闻，殆与余同。', options: ['大概', '危险', '近于', '疑惑'], source: '《石钟山记》' },
        { word: '当', meaning: '抵挡', sentence: '料大王士卒足以当项王乎？', options: ['抵挡', '应当', '面对', '主持'], source: '《鸿门宴》' },
        { word: '道', meaning: '说', sentence: '何可胜道也哉！', options: ['说', '道路', '道理', '方法'], source: '《游褒禅山记》' },
        { word: '得', meaning: '能够', sentence: '沛公军霸上，未得与项羽相见。', options: ['能够', '得到', '应该', '满足'], source: '《鸿门宴》' },
        { word: '度', meaning: '估计', sentence: '度我至军中，公乃入。', options: ['估计', '度过', '制度', '气度'], source: '《鸿门宴》' },
        { word: '非', meaning: '不是', sentence: '人非生而知之者，孰能无惑？', options: ['不是', '没有', '除非', '错误'], source: '《师说》' },
        { word: '复', meaning: '恢复', sentence: '师道之不复可知矣。', options: ['恢复', '又', '反复', '答复'], source: '《师说》' },
        { word: '盖', meaning: '大概', sentence: '盖余所至，比好游者尚不能十一。', options: ['大概', '遮盖', '车盖', '胜过'], source: '《游褒禅山记》' },
        { word: '故', meaning: '所以', sentence: '故木受绳则直。', options: ['所以', '旧的', '故意', '原因'], source: '《劝学》' }
    ];

    var state = { mode: 'choice', currentIdx: 0, score: 0, total: 0, answered: [], level: 1, wordsPerLevel: 10 };

    function renderVocabularyQuiz() {
        var container = document.getElementById('chinese-vocabulary-quiz-app');
        if (!container) return;
        state = { mode: 'choice', currentIdx: 0, score: 0, total: 0, answered: [], level: 1, wordsPerLevel: 10 };
        renderQuizUI();
    }

    function renderQuizUI() {
        var container = document.getElementById('chinese-vocabulary-quiz-app');
        if (!container) return;
        var totalLevels = Math.ceil(words.length / state.wordsPerLevel);
        var startIdx = (state.level - 1) * state.wordsPerLevel;
        var endIdx = Math.min(startIdx + state.wordsPerLevel, words.length);
        var levelWords = words.slice(startIdx, endIdx);

        if (state.currentIdx >= levelWords.length) {
            container.innerHTML = '<div class="tool-app-container" style="padding:16px;text-align:center;">' +
                '<h3 style="color:#0ea5e9;">第' + state.level + '关完成!</h3>' +
                '<p style="font-size:18px;">得分: ' + state.score + ' / ' + state.total + '</p>' +
                '<p style="font-size:14px;color:#666;">正确率: ' + (state.total > 0 ? Math.round(state.score / state.total * 100) : 0) + '%</p>' +
                (state.level < totalLevels ? '<button id="vocab-next-level" style="padding:10px 24px;background:#0ea5e9;color:#fff;border:none;border-radius:8px;cursor:pointer;margin:8px;">进入第' + (state.level + 1) + '关</button>' : '<p style="color:#10b981;">全部通关!</p>') +
                '<button id="vocab-restart" style="padding:10px 24px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;margin:8px;">重新开始</button></div>';
            if (document.getElementById('vocab-next-level')) document.getElementById('vocab-next-level').onclick = function() { state.level++; state.currentIdx = 0; state.answered = []; renderQuizUI(); };
            if (document.getElementById('vocab-restart')) document.getElementById('vocab-restart').onclick = function() { state = { mode: 'choice', currentIdx: 0, score: 0, total: 0, answered: [], level: 1, wordsPerLevel: 10 }; renderQuizUI(); };
            return;
        }

        var current = levelWords[state.currentIdx];
        var html = '<div class="tool-app-container" style="padding:16px;">' +
            '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center;">' +
            '<button class="vocab-mode-btn" data-mode="choice" style="padding:7px 14px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:' + (state.mode === 'choice' ? '#0ea5e9' : '#fff') + ';color:' + (state.mode === 'choice' ? '#fff' : '#333') + ';">选择题</button>' +
            '<button class="vocab-mode-btn" data-mode="match" style="padding:7px 14px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:' + (state.mode === 'match' ? '#0ea5e9' : '#fff') + ';color:' + (state.mode === 'match' ? '#fff' : '#333') + ';">配对</button>' +
            '<span style="margin-left:8px;font-size:13px;color:#666;">第' + state.level + '关</span>' +
            '<span style="margin-left:auto;font-size:13px;color:#666;">' + (state.currentIdx + 1) + '/' + levelWords.length + ' | 得分: ' + state.score + '/' + state.total + '</span>' +
            '</div>';

        if (state.mode === 'choice') {
            html += '<div style="padding:16px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;margin-bottom:12px;">' +
                '<div style="font-size:14px;color:#666;margin-bottom:6px;">' + current.source + '</div>' +
                '<div style="font-size:16px;color:#333;margin-bottom:4px;">' + current.sentence.replace(current.word, '<strong style="color:#0ea5e9;">' + current.word + '</strong>') + '</div>' +
                '<div style="font-size:14px;color:#666;">"' + current.word + '" 字的意思是?</div></div>';
            var opts = shuffleArray(current.options.slice());
            for (var i = 0; i < opts.length; i++) {
                var isAnswered = state.answered.indexOf(state.currentIdx) >= 0;
                var isCorrect = opts[i] === current.meaning;
                var bg = '#fff';
                if (isAnswered) { bg = isCorrect ? '#d1fae5' : (opts[i] === state.lastChoice ? '#fee2e2' : '#fff'); }
                html += '<div class="vocab-option" data-answer="' + opts[i] + '" style="padding:10px 14px;border:1px solid #d1d5db;border-radius:6px;margin-bottom:6px;cursor:pointer;background:' + bg + ';font-size:14px;' + (isAnswered ? 'pointer-events:none;' : '') + '">' + opts[i] + '</div>';
            }
            if (isAnswered) {
                html += '<div style="margin-top:12px;padding:10px;background:#f9fafb;border-radius:6px;font-size:13px;color:#555;">讲解: "' + current.word + '" 在此处意为"' + current.meaning + '"，出自' + current.source + '</div>';
                html += '<button id="vocab-next" style="margin-top:8px;padding:7px 16px;background:#0ea5e9;color:#fff;border:none;border-radius:6px;cursor:pointer;">下一题</button>';
            }
        } else {
            // Matching mode: show word, options for meanings
            html += '<div style="padding:16px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;margin-bottom:12px;">' +
                '<div style="font-size:16px;color:#333;">请选择"<strong style="color:#0ea5e9;">' + current.word + '</strong>"的含义</div></div>';
            var meanings = shuffleArray([current.meaning].concat(pickRandomOthers(current.meaning, 3)));
            for (var j = 0; j < meanings.length; j++) {
                var isAnswered2 = state.answered.indexOf(state.currentIdx) >= 0;
                var isCorrect2 = meanings[j] === current.meaning;
                var bg2 = '#fff';
                if (isAnswered2) { bg2 = isCorrect2 ? '#d1fae5' : (meanings[j] === state.lastChoice ? '#fee2e2' : '#fff'); }
                html += '<div class="vocab-option" data-answer="' + meanings[j] + '" style="padding:10px 14px;border:1px solid #d1d5db;border-radius:6px;margin-bottom:6px;cursor:pointer;background:' + bg2 + ';font-size:14px;' + (isAnswered2 ? 'pointer-events:none;' : '') + '">' + meanings[j] + '</div>';
            }
            if (isAnswered2) {
                html += '<div style="margin-top:12px;padding:10px;background:#f9fafb;border-radius:6px;font-size:13px;color:#555;">讲解: "' + current.word + '" 意为"' + current.meaning + '"，出自' + current.source + '</div>';
                html += '<button id="vocab-next" style="margin-top:8px;padding:7px 16px;background:#0ea5e9;color:#fff;border:none;border-radius:6px;cursor:pointer;">下一题</button>';
            }
        }
        container.innerHTML = html;

        var isAnswered3 = state.answered.indexOf(state.currentIdx) >= 0;
        var modeBtns = container.querySelectorAll('.vocab-mode-btn');
        for (var k = 0; k < modeBtns.length; k++) {
            modeBtns[k].onclick = function() {
                state.mode = this.getAttribute('data-mode');
                state.currentIdx = 0; state.answered = []; state.score = 0; state.total = 0;
                renderQuizUI();
            };
        }
        if (!isAnswered3) {
            var options = container.querySelectorAll('.vocab-option');
            for (var m = 0; m < options.length; m++) {
                options[m].onclick = function() {
                    var answer = this.getAttribute('data-answer');
                    var correct = answer === current.meaning;
                    state.answered.push(state.currentIdx);
                    state.total++;
                    if (correct) state.score++;
                    state.lastChoice = answer;
                    renderQuizUI();
                };
            }
        } else {
            if (document.getElementById('vocab-next')) {
                document.getElementById('vocab-next').onclick = function() {
                    state.currentIdx++;
                    renderQuizUI();
                };
            }
        }
    }

    function shuffleArray(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; }
        return a;
    }

    function pickRandomOthers(correct, count) {
        var all = words.map(function(w) { return w.meaning; });
        var others = [];
        for (var i = 0; i < all.length && others.length < count; i++) {
            if (all[i] !== correct && others.indexOf(all[i]) < 0) others.push(all[i]);
        }
        while (others.length < count) others.push('其他');
        return others;
    }

    return { renderVocabularyQuiz: renderVocabularyQuiz };
})();

// ============================================================
// 模块3：chineseCompositionMaterials - 作文素材库
// ============================================================
window.chineseCompositionMaterials = (function() {
    'use strict';
    var materials = [
        // 家国情怀
        { topic: '家国情怀', type: '人物', title: '屈原', content: '屈原是战国时期楚国诗人，主张联齐抗秦，遭谗去职，被流放。在流放途中，他仍心系楚国，最后自沉汨罗江以明志。《离骚》中"长太息以掩涕兮，哀民生之多艰"表达了他对国家和人民的深切关怀。', application: '适用于爱国、忠诚、坚守信念等主题', source: '《史记·屈原贾生列传》' },
        { topic: '家国情怀', type: '人物', title: '岳飞', content: '南宋抗金名将，率领岳家军北伐，在朱仙镇大破金军。面对"莫须有"的罪名慷慨赴死，背上"精忠报国"四字是千古爱国精神的象征。', application: '适用于爱国、忠勇、民族气节主题', source: '《宋史·岳飞传》' },
        { topic: '家国情怀', type: '名言', title: '天下兴亡，匹夫有责', content: '出自顾炎武《日知录》。意为国家的兴衰与每个普通人都息息相关，强调个人对国家命运的责任感。', application: '适用于责任、爱国、担当主题', source: '顾炎武《日知录》' },
        { topic: '家国情怀', type: '名言', title: '为天地立心，为生民立命', content: '出自张载"横渠四句"：为天地立心，为生民立命，为往圣继绝学，为万世开太平。是儒家知识分子最高理想。', application: '适用于理想、担当、知识分子使命', source: '张载《横渠语录》' },
        { topic: '家国情怀', type: '事例', title: '钱学森归国', content: '1955年，钱学森放弃美国优越条件，历经五年软禁，冲破重重阻挠回到祖国，为中国航天事业奠定基础。"我的事业在中国，我的成就在中国，我的归宿在中国。"', application: '适用于爱国、科技报国、选择主题', source: '钱学森传记' },
        { topic: '家国情怀', type: '事例', title: '戍边英雄', content: '2020年6月，中印边境加勒万河谷冲突中，祁发宝、陈红军、陈祥榕、肖思远、王焯冉等官兵英勇战斗。"清澈的爱，只为中国"——陈祥榕的战斗口号感动全国。', application: '适用于爱国、牺牲、青春价值主题', source: '新闻报道' },
        // 青春奋斗
        { topic: '青春奋斗', type: '人物', title: '苏炳添', content: '中国短跑运动员，32岁"高龄"时在东京奥运会上以9秒83打破亚洲纪录闯入百米决赛。"我想证明，中国人也能在短跑项目中站上世界舞台。"', application: '适用于拼搏、突破、坚持、自律主题', source: '东京奥运会报道' },
        { topic: '青春奋斗', type: '人物', title: '袁隆平', content: '"杂交水稻之父"，一生致力于杂交水稻研究。90岁高龄仍下田工作，梦想"让天下人都吃饱饭"。他的奋斗精神诠释了科学家对国家和人类的责任。', application: '适用于奋斗、奉献、科学精神主题', source: '袁隆平传记' },
        { topic: '青春奋斗', type: '名言', title: '天行健，君子以自强不息', content: '出自《周易》。天道运行刚健有力，君子应当效法天道，自强不息，奋发向上。', application: '适用于奋斗、自强、成长主题', source: '《周易·乾卦》' },
        { topic: '青春奋斗', type: '名言', title: '路漫漫其修远兮，吾将上下而求索', content: '出自屈原《离骚》。前方的道路漫长而遥远，我将上天下地追寻探索。表达了矢志不渝的追求精神。', application: '适用于坚持、追求、探索主题', source: '屈原《离骚》' },
        { topic: '青春奋斗', type: '事例', title: '中国女排精神', content: '从1981年首夺世界冠军到2019年十冠王，中国女排历经低谷与辉煌，始终秉持"顽强拼搏、永不言弃"的精神。郎平说："女排精神不是赢得冠军，而是即使知道不会赢，也竭尽全力。"', application: '适用于拼搏、团队、永不言弃主题', source: '中国女排报道' },
        { topic: '青春奋斗', type: '事例', title: '张桂梅', content: '云南华坪女子高级中学校长，身患重病仍坚守教育一线，创办全国第一所免费女子高中，帮助1800多名贫困女孩走出大山。"我生来就是高山而非溪流。"', application: '适用于奉献、教育、坚持、女性力量', source: '感动中国人物' },
        // 科技创新
        { topic: '科技创新', type: '人物', title: '屠呦呦', content: '中国药学家，从中药青蒿中提取青蒿素，为全球抗疟疾做出了巨大贡献，2015年获诺贝尔生理学或医学奖。她"以身试药"的精神令人敬佩。', application: '适用于创新、奉献、科学精神、传统与现代', source: '诺贝尔奖官网' },
        { topic: '科技创新', type: '人物', title: '任正非', content: '华为创始人，带领华为从一家小公司成长为全球通信巨头。面对技术封锁，坚持自主创新。"我们除了胜利，已经无路可走。"', application: '适用于创新、自主、企业家精神', source: '华为公开报道' },
        { topic: '科技创新', type: '名言', title: '苟日新，日日新，又日新', content: '出自《礼记·大学》。商汤的座右铭，意为如果一天能够自新，就应该天天自新，永远保持更新。', application: '适用于创新、进步、自我革新主题', source: '《礼记·大学》' },
        { topic: '科技创新', type: '名言', title: '创新是引领发展的第一动力', content: '习近平总书记的重要论述，强调创新在国家发展全局中的核心地位。', application: '适用于创新、发展、时代主题', source: '习近平讲话' },
        { topic: '科技创新', type: '事例', title: '中国空间站建设', content: '从"神舟"到"天宫"，从"嫦娥"到"天问"，中国航天人一步一个脚印，建成了自己的空间站。2022年，中国空间站"T"字构型组装完成，标志着中国成为世界上第三个独立掌握空间站技术的国家。', application: '适用于科技自立、梦想、奋斗主题', source: '中国载人航天工程' },
        { topic: '科技创新', type: '事例', title: 'DeepSeek大模型', content: '2025年，中国AI公司深度求索发布DeepSeek大模型，以极低成本达到世界顶尖水平，引发全球关注。用开源和工程创新证明了"算力不是唯一出路"。', application: '适用于创新、突破、中国科技崛起', source: '科技媒体报道' },
        // 文化传承
        { topic: '文化传承', type: '人物', title: '樊锦诗', content: '"敦煌女儿"，从北京大学毕业后扎根敦煌莫高窟五十余年，致力于石窟考古和文物保护。"此生命定，我就是个莫高窟的守护人。"', application: '适用于坚守、传承、文化保护主题', source: '《樊锦诗自述》' },
        { topic: '文化传承', type: '人物', title: '叶嘉莹', content: '中国古典诗词研究大家，一生致力于古典诗词的传播与教学。90多岁仍坚持上课，将毕生积蓄捐赠给南开大学。"诗词让我心灵不死。"', application: '适用于文化传承、教育、热爱情怀', source: '叶嘉莹传记' },
        { topic: '文化传承', type: '名言', title: '不忘本来，吸收外来，面向未来', content: '习近平总书记对文化建设的重要论述，强调在传承中华优秀传统文化的同时，吸收外来文化精华，面向未来创新发展。', application: '适用于文化自信、传承创新主题', source: '习近平讲话' },
        { topic: '文化传承', type: '名言', title: '周虽旧邦，其命维新', content: '出自《诗经·大雅·文王》。周朝虽然是古老的邦国，但它的使命是不断革新。比喻传统文化需要不断创新。', application: '适用于传承与创新、文化生命力主题', source: '《诗经》' },
        { topic: '文化传承', type: '事例', title: '《只此青绿》', content: '2022年春晚舞蹈诗剧《只此青绿》，以北宋王希孟《千里江山图》为灵感，用现代舞蹈语言演绎古典美学，成为现象级文化IP，让年轻人重新爱上传统文化。', application: '适用于文化创新、传统与现代结合', source: '春晚报道' },
        { topic: '文化传承', type: '事例', title: '故宫文创', content: '故宫博物院通过文创产品开发，让600年紫禁城"活"了起来。从"朕知道了"胶带到故宫口红，年销售额超15亿元，让传统文化以新形式走进年轻人的生活。', application: '适用于文化创新、产业升级、传承主题', source: '故宫博物院公开资料' }
    ];

    var state = { topic: '全部', type: '全部', search: '' };

    function renderCompositionMaterials() {
        var container = document.getElementById('chinese-composition-materials-app');
        if (!container) return;
        render();
    }

    function render() {
        var container = document.getElementById('chinese-composition-materials-app');
        if (!container) return;
        var topics = ['全部', '家国情怀', '青春奋斗', '科技创新', '文化传承'];
        var types = ['全部', '人物', '名言', '事例'];

        var html = '<div class="tool-app-container" style="padding:16px;">' +
            '<div style="margin-bottom:8px;font-size:13px;color:#666;">主题筛选</div>' +
            '<div id="mat-topic-filters" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;"></div>' +
            '<div style="margin-bottom:8px;font-size:13px;color:#666;">类型筛选</div>' +
            '<div id="mat-type-filters" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;"></div>' +
            '<div style="margin-bottom:16px;"><input id="mat-search" placeholder="搜索素材..." style="width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;max-width:400px;" value="' + state.search + '"></div>' +
            '<div id="mat-list"></div></div>';

        container.innerHTML = html;

        var topicDiv = document.getElementById('mat-topic-filters');
        for (var i = 0; i < topics.length; i++) {
            var btn = document.createElement('button');
            btn.textContent = topics[i];
            btn.style.cssText = 'padding:5px 10px;font-size:12px;border:1px solid #d1d5db;border-radius:16px;cursor:pointer;background:' + (state.topic === topics[i] ? '#0ea5e9' : '#fff') + ';color:' + (state.topic === topics[i] ? '#fff' : '#333') + ';';
            btn.setAttribute('data-topic', topics[i]);
            btn.onclick = function() { state.topic = this.getAttribute('data-topic'); render(); };
            topicDiv.appendChild(btn);
        }

        var typeDiv = document.getElementById('mat-type-filters');
        for (var j = 0; j < types.length; j++) {
            var btn2 = document.createElement('button');
            btn2.textContent = types[j];
            btn2.style.cssText = 'padding:5px 10px;font-size:12px;border:1px solid #d1d5db;border-radius:16px;cursor:pointer;background:' + (state.type === types[j] ? '#0ea5e9' : '#fff') + ';color:' + (state.type === types[j] ? '#fff' : '#333') + ';';
            btn2.setAttribute('data-type', types[j]);
            btn2.onclick = function() { state.type = this.getAttribute('data-type'); render(); };
            typeDiv.appendChild(btn2);
        }

        document.getElementById('mat-search').oninput = function() { state.search = this.value.trim(); render(); };

        var listDiv = document.getElementById('mat-list');
        var filtered = [];
        for (var k = 0; k < materials.length; k++) {
            var m = materials[k];
            if (state.topic !== '全部' && m.topic !== state.topic) continue;
            if (state.type !== '全部' && m.type !== state.type) continue;
            if (state.search && m.title.indexOf(state.search) === -1 && m.content.indexOf(state.search) === -1 && m.application.indexOf(state.search) === -1) continue;
            filtered.push(m);
        }

        if (filtered.length === 0) {
            listDiv.innerHTML = '<div style="padding:20px;text-align:center;color:#999;">没有找到匹配的素材</div>';
        } else {
            var listHtml = '';
            for (var l = 0; l < filtered.length; l++) {
                var m2 = filtered[l];
                var typeColor = m2.type === '人物' ? '#8b5cf6' : (m2.type === '名言' ? '#f59e0b' : '#10b981');
                var id = 'mat-' + l;
                listHtml += '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;margin-bottom:10px;background:#fff;">' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">' +
                    '<span style="background:' + typeColor + ';color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;">' + m2.type + '</span>' +
                    '<span style="font-weight:bold;font-size:15px;color:#333;">' + m2.title + '</span>' +
                    '<span style="font-size:12px;color:#999;margin-left:auto;">' + m2.topic + '</span>' +
                    '</div>' +
                    '<div style="font-size:13px;color:#555;line-height:1.7;margin-bottom:6px;">' + m2.content + '</div>' +
                    '<div style="font-size:12px;color:#888;">适用: ' + m2.application + '</div>' +
                    '<div style="font-size:11px;color:#aaa;">来源: ' + m2.source + '</div>' +
                    '<button class="mat-copy-btn" data-id="' + id + '" style="margin-top:6px;padding:4px 12px;font-size:11px;border:1px solid #d1d5db;border-radius:4px;background:#f9fafb;cursor:pointer;">复制内容</button>' +
                    '</div>';
            }
            listDiv.innerHTML = listHtml;

            var copyBtns = listDiv.querySelectorAll('.mat-copy-btn');
            for (var n = 0; n < copyBtns.length; n++) {
                copyBtns[n].onclick = function() {
                    var idx = parseInt(this.getAttribute('data-id').replace('mat-', ''));
                    var text = filtered[idx].title + ': ' + filtered[idx].content;
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(text).then(function() {
                            alert('已复制到剪贴板!');
                        }).catch(function(err) {
                            console.error('剪贴板写入失败:', err);
                            alert('复制失败，请手动复制');
                        });
                    } else {
                        var ta = document.createElement('textarea');
                        ta.value = text;
                        ta.style.position = 'fixed';
                        ta.style.left = '-9999px';
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                        alert('已复制到剪贴板!');
                    }
                };
            }
        }
    }

    return { renderCompositionMaterials: renderCompositionMaterials };
})();
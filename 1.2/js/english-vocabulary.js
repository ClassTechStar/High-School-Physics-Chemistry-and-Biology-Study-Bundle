window.englishVocabulary = (function() {
    'use strict';

    var STORAGE_KEY = 'hspcb_english_vocabulary';
    var MODE_CARD = 'card';
    var MODE_QUIZ = 'quiz';

    /* ========== EMBEDDED VOCABULARY (60+ high-frequency gaokao words) ========== */

    var WORDS = [
        { word: 'abandon',      chinese: '放弃；遗弃',           pos: 'v.',     example: 'They had to abandon the plan due to bad weather.' },
        { word: 'ability',      chinese: '能力；才能',           pos: 'n.',     example: 'She has the ability to learn languages quickly.' },
        { word: 'absorb',       chinese: '吸收；吸引',           pos: 'v.',     example: 'Plants absorb nutrients from the soil.' },
        { word: 'accept',       chinese: '接受；承认',           pos: 'v.',     example: 'He accepted the invitation to the party.' },
        { word: 'access',       chinese: '进入；使用权',         pos: 'n./v.',  example: 'Students have free access to the library.' },
        { word: 'achieve',      chinese: '实现；达到',           pos: 'v.',     example: 'He worked hard to achieve his goals.' },
        { word: 'adapt',        chinese: '适应；改编',           pos: 'v.',     example: 'We must adapt to the changing environment.' },
        { word: 'affect',       chinese: '影响；感动',           pos: 'v.',     example: 'The weather can greatly affect our mood.' },
        { word: 'analyze',      chinese: '分析',                pos: 'v.',     example: 'We need to analyze the data carefully.' },
        { word: 'approach',     chinese: '方法；接近',           pos: 'n./v.',  example: 'A new approach to solving the problem was proposed.' },
        { word: 'argue',        chinese: '争论；论证',           pos: 'v.',     example: 'They argued about the best way to proceed.' },
        { word: 'attempt',      chinese: '尝试；企图',           pos: 'v./n.',  example: 'She made an attempt to break the world record.' },
        { word: 'attract',      chinese: '吸引',                pos: 'v.',     example: 'The festival attracts thousands of visitors every year.' },
        { word: 'available',    chinese: '可用的；有空的',       pos: 'adj.',   example: 'Is this seat available?' },
        { word: 'balance',      chinese: '平衡；余额',           pos: 'n./v.',  example: 'It is important to keep a balance between work and rest.' },
        { word: 'benefit',      chinese: '好处；有益于',         pos: 'n./v.',  example: 'Regular exercise brings many benefits to your health.' },
        { word: 'bother',       chinese: '打扰；烦恼',           pos: 'v.',     example: 'Don\'t bother him while he is working.' },
        { word: 'broadcast',    chinese: '广播；播送',           pos: 'v./n.',  example: 'The news was broadcast live across the country.' },
        { word: 'budget',       chinese: '预算',                pos: 'n./v.',  example: 'We need to plan our budget for the coming year.' },
        { word: 'capable',      chinese: '有能力的',             pos: 'adj.',   example: 'She is capable of handling difficult situations.' },
        { word: 'challenge',    chinese: '挑战',                pos: 'n./v.',  example: 'The project presents a real challenge to the team.' },
        { word: 'character',    chinese: '性格；角色；字符',     pos: 'n.',     example: 'He is a man of good character.' },
        { word: 'combine',      chinese: '结合；联合',           pos: 'v.',     example: 'We should combine theory with practice.' },
        { word: 'communicate',  chinese: '交流；沟通',           pos: 'v.',     example: 'It is important to communicate clearly with your team.' },
        { word: 'compare',      chinese: '比较；对比',           pos: 'v.',     example: 'Let us compare the two products side by side.' },
        { word: 'compete',      chinese: '竞争；比赛',           pos: 'v.',     example: 'Athletes from all over the world compete in the Olympics.' },
        { word: 'concentrate',  chinese: '集中；专心',           pos: 'v.',     example: 'I cannot concentrate with all this noise.' },
        { word: 'confident',    chinese: '自信的',               pos: 'adj.',   example: 'She is confident that she will pass the exam.' },
        { word: 'consider',     chinese: '考虑；认为',           pos: 'v.',     example: 'You should consider all the options before deciding.' },
        { word: 'consume',      chinese: '消耗；消费',           pos: 'v.',     example: 'This device consumes a lot of electricity.' },
        { word: 'contribute',   chinese: '贡献；捐献',           pos: 'v.',     example: 'Everyone should contribute to protecting the environment.' },
        { word: 'convince',     chinese: '说服；使确信',         pos: 'v.',     example: 'He tried to convince me to change my mind.' },
        { word: 'create',       chinese: '创造；创建',           pos: 'v.',     example: 'Artists create works that inspire people.' },
        { word: 'curious',      chinese: '好奇的',               pos: 'adj.',   example: 'Children are naturally curious about the world.' },
        { word: 'decline',      chinese: '下降；拒绝',           pos: 'v./n.',  example: 'The company\'s profits declined by 10% last year.' },
        { word: 'decrease',     chinese: '减少；降低',           pos: 'v./n.',  example: 'The price of oil has decreased significantly.' },
        { word: 'definitely',   chinese: '肯定地；明确地',       pos: 'adv.',   example: 'I will definitely attend the meeting tomorrow.' },
        { word: 'demonstrate',  chinese: '演示；证明',           pos: 'v.',     example: 'The experiment demonstrates that water expands when heated.' },
        { word: 'deserve',      chinese: '值得；应得',           pos: 'v.',     example: 'You deserve a break after all this hard work.' },
        { word: 'determine',    chinese: '决定；确定',           pos: 'v.',     example: 'We need to determine the cause of the problem.' },
        { word: 'develop',      chinese: '发展；开发',           pos: 'v.',     example: 'The company plans to develop new products next year.' },
        { word: 'disappear',    chinese: '消失',                pos: 'v.',     example: 'The sun disappeared behind the clouds.' },
        { word: 'discover',     chinese: '发现；发觉',           pos: 'v.',     example: 'Scientists continue to discover new species every year.' },
        { word: 'distinguish',  chinese: '区分；辨别',           pos: 'v.',     example: 'Can you distinguish between the two sounds?' },
        { word: 'efficient',    chinese: '高效的',               pos: 'adj.',   example: 'This method is more efficient than the old one.' },
        { word: 'encourage',    chinese: '鼓励；激励',           pos: 'v.',     example: 'Teachers should encourage students to ask questions.' },
        { word: 'environment',  chinese: '环境',                pos: 'n.',     example: 'We must protect the environment for future generations.' },
        { word: 'essential',    chinese: '必要的；本质的',       pos: 'adj.',   example: 'Water is essential for all living things.' },
        { word: 'establish',    chinese: '建立；设立',           pos: 'v.',     example: 'The school was established in 1950.' },
        { word: 'evidence',     chinese: '证据；迹象',           pos: 'n.',     example: 'There is strong evidence to support this theory.' },
        { word: 'exchange',     chinese: '交换；交流',           pos: 'v./n.',  example: 'We exchanged ideas during the discussion.' },
        { word: 'exist',        chinese: '存在；生存',           pos: 'v.',     example: 'Many different opinions exist on this subject.' },
        { word: 'expect',       chinese: '期望；预料',           pos: 'v.',     example: 'I expect to finish the project by Friday.' },
        { word: 'experience',   chinese: '经验；经历',           pos: 'n./v.',  example: 'Working abroad was a valuable experience.' },
        { word: 'explain',      chinese: '解释；说明',           pos: 'v.',     example: 'Can you explain how this machine works?' },
        { word: 'familiar',     chinese: '熟悉的',               pos: 'adj.',   example: 'I am familiar with the local customs.' },
        { word: 'guarantee',    chinese: '保证；担保',           pos: 'v./n.',  example: 'Hard work does not guarantee success, but it helps.' },
        { word: 'identify',     chinese: '识别；确认',           pos: 'v.',     example: 'Can you identify the person in this photo?' },
        { word: 'ignore',       chinese: '忽视；不理睬',         pos: 'v.',     example: 'You should not ignore your health problems.' },
        { word: 'imagine',      chinese: '想象；设想',           pos: 'v.',     example: 'Can you imagine what life will be like in 100 years?' },
        { word: 'impress',      chinese: '给...留下印象',        pos: 'v.',     example: 'His speech impressed everyone in the audience.' },
        { word: 'increase',     chinese: '增加；增长',           pos: 'v./n.',  example: 'The population of the city has increased rapidly.' },
        { word: 'indicate',     chinese: '表明；指示',           pos: 'v.',     example: 'The results indicate that the treatment is effective.' },
        { word: 'influence',    chinese: '影响；感化',           pos: 'n./v.',  example: 'Social media has a huge influence on young people.' },
        { word: 'inspire',      chinese: '激励；启发',           pos: 'v.',     example: 'Her story inspired many people to pursue their dreams.' },
        { word: 'involve',      chinese: '涉及；包含',           pos: 'v.',     example: 'The project involves a lot of research work.' },
        { word: 'maintain',     chinese: '维持；保养',           pos: 'v.',     example: 'It is important to maintain good relationships with others.' },
        { word: 'measure',      chinese: '测量；措施',           pos: 'v./n.',  example: 'The government has taken measures to reduce pollution.' },
        { word: 'motivate',     chinese: '激励；激发',           pos: 'v.',     example: 'A good teacher can motivate students to learn.' },
        { word: 'observe',      chinese: '观察；遵守',           pos: 'v.',     example: 'We should carefully observe the natural world around us.' },
        { word: 'obtain',       chinese: '获得；得到',           pos: 'v.',     example: 'She obtained a degree from Beijing University.' },
        { word: 'obvious',      chinese: '明显的',               pos: 'adj.',   example: 'It is obvious that he is not telling the truth.' },
        { word: 'operate',      chinese: '操作；运转',           pos: 'v.',     example: 'Do you know how to operate this machine?' },
        { word: 'opportunity',  chinese: '机会',                pos: 'n.',     example: 'This is a great opportunity to improve your skills.' },
        { word: 'organize',     chinese: '组织；整理',           pos: 'v.',     example: 'She helped organize the school sports meeting.' },
        { word: 'participate',  chinese: '参加；参与',           pos: 'v.',     example: 'All students should participate in class discussions.' },
        { word: 'perform',      chinese: '表演；执行',           pos: 'v.',     example: 'The band will perform at the concert tonight.' },
        { word: 'persuade',     chinese: '说服；劝服',           pos: 'v.',     example: 'I tried to persuade her to come with us.' },
        { word: 'phenomenon',   chinese: '现象',                pos: 'n.',     example: 'Global warming is a complex phenomenon.' },
        { word: 'potential',    chinese: '潜力；潜在的',         pos: 'n./adj.',example: 'She has great potential as a writer.' },
        { word: 'predict',      chinese: '预测；预言',           pos: 'v.',     example: 'It is difficult to predict what will happen tomorrow.' },
        { word: 'prefer',       chinese: '更喜欢',               pos: 'v.',     example: 'I prefer tea to coffee.' },
        { word: 'prevent',      chinese: '防止；阻止',           pos: 'v.',     example: 'Vaccination can prevent many diseases.' },
        { word: 'promote',      chinese: '促进；推广；晋升',     pos: 'v.',     example: 'Exercise can promote both physical and mental health.' },
        { word: 'prove',        chinese: '证明；证实',           pos: 'v.',     example: 'The evidence proved that he was innocent.' },
        { word: 'purchase',     chinese: '购买',                pos: 'v./n.',  example: 'You can purchase tickets online.' },
        { word: 'purpose',      chinese: '目的；意图',           pos: 'n.',     example: 'What is the purpose of your visit?' },
        { word: 'realize',      chinese: '意识到；实现',         pos: 'v.',     example: 'I suddenly realized that I had made a mistake.' },
        { word: 'recognize',    chinese: '认出；认可',           pos: 'v.',     example: 'I hardly recognized her with her new hairstyle.' },
        { word: 'recommend',    chinese: '推荐；建议',           pos: 'v.',     example: 'Can you recommend a good restaurant nearby?' },
        { word: 'recover',      chinese: '恢复；康复',           pos: 'v.',     example: 'It took him a long time to recover from the illness.' },
        { word: 'reduce',       chinese: '减少；降低',           pos: 'v.',     example: 'We need to reduce our carbon footprint.' },
        { word: 'reflect',      chinese: '反映；反思',           pos: 'v.',     example: 'The report reflects the current situation of the economy.' },
        { word: 'regard',       chinese: '看待；认为',           pos: 'v.',     example: 'He is regarded as one of the best scientists in his field.' },
        { word: 'relate',       chinese: '联系；叙述',           pos: 'v.',     example: 'These two events are closely related to each other.' },
        { word: 'replace',      chinese: '代替；替换',           pos: 'v.',     example: 'Robots may replace some human workers in the future.' },
        { word: 'represent',    chinese: '代表；表示',           pos: 'v.',     example: 'The red color represents good luck in Chinese culture.' },
        { word: 'require',      chinese: '需要；要求',           pos: 'v.',     example: 'This job requires a lot of patience and skill.' },
        { word: 'resource',     chinese: '资源',                pos: 'n.',     example: 'We should make good use of natural resources.' },
        { word: 'responsible',  chinese: '负责的；有责任的',     pos: 'adj.',   example: 'Everyone should be responsible for their own actions.' },
        { word: 'reward',       chinese: '回报；奖励',           pos: 'n./v.',  example: 'Hard work often brings its own reward.' },
        { word: 'satisfy',      chinese: '使满意；满足',         pos: 'v.',     example: 'The result did not satisfy our expectations.' },
        { word: 'schedule',     chinese: '时间表；安排',         pos: 'n./v.',  example: 'The meeting is scheduled for Monday morning.' },
        { word: 'select',       chinese: '选择；挑选',           pos: 'v.',     example: 'She carefully selected a gift for her mother.' },
        { word: 'separate',     chinese: '分开；分隔',           pos: 'v./adj.',example: 'The wall separates the garden from the road.' },
        { word: 'significant',  chinese: '重要的；显著的',       pos: 'adj.',   example: 'This discovery is of significant importance.' },
        { word: 'solution',     chinese: '解决方案；溶液',       pos: 'n.',     example: 'We need to find a solution to this problem.' },
        { word: 'specific',     chinese: '具体的；特定的',       pos: 'adj.',   example: 'Can you give me some specific examples?' },
        { word: 'strategy',     chinese: '策略；战略',           pos: 'n.',     example: 'We need a good strategy to win the game.' },
        { word: 'struggle',     chinese: '奋斗；挣扎',           pos: 'v./n.',  example: 'Many students struggle with math problems.' },
        { word: 'succeed',      chinese: '成功',                pos: 'v.',     example: 'If you work hard, you will succeed.' },
        { word: 'suffer',       chinese: '遭受；受苦',           pos: 'v.',     example: 'Many people suffer from air pollution.' },
        { word: 'suitable',     chinese: '合适的',               pos: 'adj.',   example: 'This film is not suitable for young children.' },
        { word: 'supply',       chinese: '供应；提供',           pos: 'v./n.',  example: 'The company supplies electricity to the whole city.' },
        { word: 'support',      chinese: '支持；支撑',           pos: 'v./n.',  example: 'My family has always supported my decisions.' },
        { word: 'survive',      chinese: '生存；幸存',           pos: 'v.',     example: 'Only a few plants can survive in the desert.' },
        { word: 'suspect',      chinese: '怀疑；嫌疑犯',         pos: 'v./n.',  example: 'I suspect that he is not telling the whole truth.' },
        { word: 'tend',         chinese: '倾向于；往往会',       pos: 'v.',     example: 'People tend to feel tired in the afternoon.' },
        { word: 'threat',       chinese: '威胁',                pos: 'n.',     example: 'Pollution poses a serious threat to human health.' },
        { word: 'transfer',     chinese: '转移；调动',           pos: 'v./n.',  example: 'He was transferred to another department.' },
        { word: 'transform',    chinese: '改变；转变',           pos: 'v.',     example: 'Technology has transformed the way we live.' },
        { word: 'treasure',     chinese: '珍视；宝物',           pos: 'v./n.',  example: 'I will treasure this gift forever.' },
        { word: 'unique',       chinese: '独特的；唯一的',       pos: 'adj.',   example: 'Each person has a unique personality.' },
        { word: 'various',      chinese: '各种各样的',           pos: 'adj.',   example: 'There are various ways to solve the problem.' },
        { word: 'volunteer',    chinese: '志愿者；自愿',         pos: 'n./v.',  example: 'Many volunteers helped clean up the park.' },
        { word: 'voyage',       chinese: '航行；旅行',           pos: 'n.',     example: 'The voyage across the ocean took three months.' },
        { word: 'witness',      chinese: '目击；见证',           pos: 'v./n.',  example: 'We are witnessing great changes in our society.' },
        { word: 'worthwhile',   chinese: '值得的',               pos: 'adj.',   example: 'Teaching is a worthwhile career.' }
    ];

    /* ========== STATE ========== */

    var currentMode = MODE_CARD;
    var currentCardIndex = 0;
    var cardFlipped = false;
    var quizOptions = [];
    var quizCorrectIndex = 0;
    var quizAnswered = false;
    var progressData = null;
    var containerEl = null;

    /* ========== DATA LAYER ========== */

    function loadProgress() {
        if (progressData) return progressData;
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                progressData = JSON.parse(raw);
            } else {
                progressData = { known: {}, reviewLater: {}, masteredCount: 0 };
            }
        } catch (e) {
            progressData = { known: {}, reviewLater: {}, masteredCount: 0 };
        }
        // Ensure all fields exist
        if (!progressData.known) progressData.known = {};
        if (!progressData.reviewLater) progressData.reviewLater = {};
        if (typeof progressData.masteredCount !== 'number') {
            progressData.masteredCount = Object.keys(progressData.known).length;
        }
        return progressData;
    }

    function saveProgress() {
        progressData.masteredCount = Object.keys(progressData.known).length;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
        } catch (e) {
            /* storage full */
        }
    }

    function isKnown(word) {
        var pd = loadProgress();
        return pd.known[word] === true;
    }

    function isReviewLater(word) {
        var pd = loadProgress();
        return pd.reviewLater[word] === true;
    }

    function markKnown(word) {
        var pd = loadProgress();
        pd.known[word] = true;
        delete pd.reviewLater[word];
        saveProgress();
    }

    function markReviewLater(word) {
        var pd = loadProgress();
        delete pd.known[word];
        pd.reviewLater[word] = true;
        saveProgress();
    }

    function unmarkWord(word) {
        var pd = loadProgress();
        delete pd.known[word];
        delete pd.reviewLater[word];
        saveProgress();
    }

    function getMasteredCount() {
        var pd = loadProgress();
        return Object.keys(pd.known).length;
    }

    /* ========== CSS INJECTION ========== */

    function injectStyles() {
        if (document.getElementById('hspcb-evocab-styles')) return;
        var style = document.createElement('style');
        style.id = 'hspcb-evocab-styles';
        style.textContent =
            '#evocab-container {' +
                'max-width: 700px; margin: 0 auto; padding: 24px;' +
                'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;' +
            '}' +
            '#evocab-container h1 {' +
                'text-align: center; font-size: 22px; color: #1a1a2e; margin-bottom: 8px;' +
            '}' +
            '#evocab-container .evocab-stats {' +
                'text-align: center; color: #888; font-size: 13px; margin-bottom: 20px;' +
            '}' +
            '#evocab-container .evocab-mode-tabs {' +
                'display: flex; justify-content: center; gap: 0; margin-bottom: 24px;' +
            '}' +
            '#evocab-container .evocab-mode-tab {' +
                'padding: 10px 32px; border: 2px solid #4a6cf7; cursor: pointer;' +
                'font-size: 14px; font-family: inherit;' +
                'background: #fff; color: #4a6cf7;' +
                'transition: all 0.2s;' +
            '}' +
            '#evocab-container .evocab-mode-tab:first-child {' +
                'border-radius: 8px 0 0 8px;' +
            '}' +
            '#evocab-container .evocab-mode-tab:last-child {' +
                'border-radius: 0 8px 8px 0;' +
            '}' +
            '#evocab-container .evocab-mode-tab.active {' +
                'background: #4a6cf7; color: #fff;' +
            '}' +
            '#evocab-container .evocab-card {' +
                'background: #fff; border-radius: 16px;' +
                'box-shadow: 0 4px 24px rgba(0,0,0,0.08);' +
                'padding: 40px 32px; text-align: center;' +
                'min-height: 280px; display: flex; flex-direction: column;' +
                'justify-content: center; align-items: center;' +
                'cursor: pointer; transition: transform 0.4s, box-shadow 0.2s;' +
                'user-select: none; position: relative;' +
            '}' +
            '#evocab-container .evocab-card:hover {' +
                'box-shadow: 0 8px 32px rgba(0,0,0,0.12);' +
            '}' +
            '#evocab-container .evocab-card .evocab-hint {' +
                'position: absolute; top: 16px; right: 24px;' +
                'font-size: 12px; color: #bbb;' +
            '}' +
            '#evocab-container .evocab-card .evocab-word {' +
                'font-size: 36px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px;' +
            '}' +
            '#evocab-container .evocab-card .evocab-pos-tag {' +
                'display: inline-block; background: #f0f0ff; color: #4a6cf7;' +
                'padding: 4px 12px; border-radius: 20px; font-size: 13px; margin-bottom: 16px;' +
            '}' +
            '#evocab-container .evocab-card .evocab-chinese {' +
                'font-size: 22px; color: #e74c3c; font-weight: 600; margin-bottom: 12px;' +
            '}' +
            '#evocab-container .evocab-card .evocab-example {' +
                'font-size: 14px; color: #666; font-style: italic; line-height: 1.6;' +
                'max-width: 500px;' +
            '}' +
            '#evocab-container .evocab-card .evocab-example-label {' +
                'font-size: 12px; color: #aaa; display: block; margin-bottom: 4px;' +
                'font-style: normal;' +
            '}' +
            '#evocab-container .evocab-card.flipped {' +
                'transform: rotateY(0deg);' +
            '}' +
            '#evocab-container .evocab-card-actions {' +
                'display: flex; gap: 12px; justify-content: center; margin-top: 20px;' +
            '}' +
            '#evocab-container .evocab-btn {' +
                'padding: 12px 28px; border: none; border-radius: 8px;' +
                'font-size: 14px; cursor: pointer; font-family: inherit;' +
                'transition: all 0.2s;' +
            '}' +
            '#evocab-container .evocab-btn-known {' +
                'background: #27ae60; color: #fff;' +
            '}' +
            '#evocab-container .evocab-btn-known:hover {' +
                'background: #219a52;' +
            '}' +
            '#evocab-container .evocab-btn-review {' +
                'background: #f39c12; color: #fff;' +
            '}' +
            '#evocab-container .evocab-btn-review:hover {' +
                'background: #e08e0b;' +
            '}' +
            '#evocab-container .evocab-btn-undo {' +
                'background: transparent; color: #999; border: 1px solid #ddd;' +
            '}' +
            '#evocab-container .evocab-btn-undo:hover {' +
                'background: #f5f5f5;' +
            '}' +
            '#evocab-container .evocab-btn-next {' +
                'background: #4a6cf7; color: #fff;' +
            '}' +
            '#evocab-container .evocab-btn-next:hover {' +
                'background: #3b5de7;' +
            '}' +
            '#evocab-container .evocab-nav-row {' +
                'display: flex; justify-content: center; align-items: center; gap: 18px; margin-top: 16px;' +
            '}' +
            '#evocab-container .evocab-nav-info {' +
                'font-size: 13px; color: #999;' +
            '}' +
            '#evocab-container .evocab-filter-row {' +
                'display: flex; justify-content: center; gap: 10px; margin-bottom: 20px;' +
                'flex-wrap: wrap;' +
            '}' +
            '#evocab-container .evocab-filter-btn {' +
                'padding: 6px 16px; border: 1px solid #ddd; border-radius: 20px;' +
                'background: #fff; color: #666; font-size: 13px; cursor: pointer;' +
                'font-family: inherit; transition: all 0.2s;' +
            '}' +
            '#evocab-container .evocab-filter-btn.active {' +
                'background: #4a6cf7; color: #fff; border-color: #4a6cf7;' +
            '}' +
            '#evocab-container .evocab-filter-btn:hover {' +
                'border-color: #4a6cf7; color: #4a6cf7;' +
            '}' +
            '#evocab-container .evocab-filter-btn.active:hover {' +
                'background: #3b5de7; color: #fff;' +
            '}' +
            /* Quiz mode styles */
            '#evocab-container .evocab-quiz {' +
                'background: #fff; border-radius: 16px;' +
                'box-shadow: 0 4px 24px rgba(0,0,0,0.08);' +
                'padding: 40px 32px; text-align: center;' +
            '}' +
            '#evocab-container .evocab-quiz-word {' +
                'font-size: 32px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px;' +
            '}' +
            '#evocab-container .evocab-quiz-pos {' +
                'display: inline-block; background: #f0f0ff; color: #4a6cf7;' +
                'padding: 4px 12px; border-radius: 20px; font-size: 13px; margin-bottom: 28px;' +
            '}' +
            '#evocab-container .evocab-option {' +
                'display: block; width: 100%; padding: 14px 20px; margin-bottom: 10px;' +
                'border: 2px solid #e8e8e8; border-radius: 10px;' +
                'background: #fff; font-size: 15px; cursor: pointer;' +
                'text-align: left; font-family: inherit;' +
                'transition: all 0.2s;' +
            '}' +
            '#evocab-container .evocab-option:hover {' +
                'border-color: #4a6cf7; background: #f8f9ff;' +
            '}' +
            '#evocab-container .evocab-option.correct {' +
                'border-color: #27ae60; background: #eafaf1; color: #27ae60;' +
            '}' +
            '#evocab-container .evocab-option.wrong {' +
                'border-color: #e74c3c; background: #fdedec; color: #e74c3c;' +
            '}' +
            '#evocab-container .evocab-feedback {' +
                'margin-top: 16px; font-size: 15px; min-height: 24px;' +
            '}' +
            '#evocab-container .evocab-feedback.correct-msg {' +
                'color: #27ae60;' +
            '}' +
            '#evocab-container .evocab-feedback.wrong-msg {' +
                'color: #e74c3c;' +
            '}';
        document.head.appendChild(style);
    }

    /* ========== HELPERS ========== */

    function shuffleArray(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = a[i];
            a[i] = a[j];
            a[j] = tmp;
        }
        return a;
    }

    function getFilteredWords(filter) {
        if (filter === 'known') return WORDS.filter(function(w) { return isKnown(w.word); });
        if (filter === 'review') return WORDS.filter(function(w) { return isReviewLater(w.word); });
        if (filter === 'unseen') return WORDS.filter(function(w) { return !isKnown(w.word) && !isReviewLater(w.word); });
        if (filter === 'remaining') return WORDS.filter(function(w) { return !isKnown(w.word); });
        return WORDS.slice();
    }

    /* ========== CARD MODE ========== */

    function renderCardMode(filter) {
        var filtered = getFilteredWords(filter);
        if (filtered.length === 0) {
            containerEl.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#999;">' +
                '<p style="font-size:48px;margin-bottom:16px;">&#127881;</p>' +
                '<p style="font-size:18px;">全部单词已掌握！</p>' +
                '<p style="font-size:14px;">太棒了，你已经掌握了所有词汇。</p>' +
                '</div>';
            return;
        }
        if (currentCardIndex >= filtered.length) {
            currentCardIndex = 0;
        }
        var wordObj = filtered[currentCardIndex];
        cardFlipped = false;

        var knownState = isKnown(wordObj.word) ? 'known' : (isReviewLater(wordObj.word) ? 'review' : 'unseen');
        var statusLabel = knownState === 'known' ? '&#9989; 已掌握' : (knownState === 'review' ? '&#128260; 待复习' : '');

        var html = '';
        html += '<div class="evocab-card" id="evocab-card-el" data-action="flip-card">';
        if (statusLabel) {
            html += '<div class="evocab-hint">' + statusLabel + '</div>';
        }
        html += '<div class="evocab-hint" style="top:auto;bottom:16px;right:24px;font-size:12px;color:#ccc;">点击翻转</div>';
        html += '<div class="evocab-word">' + wordObj.word + '</div>';
        html += '<span class="evocab-pos-tag">' + wordObj.pos + '</span>';
        html += '<div class="evocab-chinese" style="visibility:hidden;">' + wordObj.chinese + '</div>';
        html += '<div style="visibility:hidden;">' +
            '<span class="evocab-example-label">例句</span>' +
            '<div class="evocab-example">' + wordObj.example + '</div>' +
            '</div>';
        html += '</div>';

        html += '<div class="evocab-card-actions">';
        if (knownState === 'known' || knownState === 'review') {
            html += '<button class="evocab-btn evocab-btn-undo" data-action="undo-card">撤销标记</button>';
        }
        if (knownState !== 'known') {
            html += '<button class="evocab-btn evocab-btn-known" data-action="mark-known">&#10003; 已掌握</button>';
        }
        if (knownState !== 'review' && knownState !== 'known') {
            html += '<button class="evocab-btn evocab-btn-review" data-action="mark-review">&#128260; 再复习</button>';
        }
        html += '</div>';

        html += '<div class="evocab-nav-row">';
        html += '<button class="evocab-btn evocab-btn-next" data-action="prev-card">&laquo; 上一个</button>';
        html += '<span class="evocab-nav-info">' + (currentCardIndex + 1) + ' / ' + filtered.length + '</span>';
        html += '<button class="evocab-btn evocab-btn-next" data-action="next-card">下一个 &raquo;</button>';
        html += '</div>';

        containerEl.innerHTML = html;

        // Store current state for flip/card functions
        containerEl._filtered = filtered;
        containerEl._wordObj = wordObj;
    }

    function flipCard() {
        var cardEl = document.getElementById('evocab-card-el');
        if (!cardEl) return;
        var wordObj = containerEl._wordObj;
        if (!wordObj) return;

        cardFlipped = !cardFlipped;
        if (cardFlipped) {
            cardEl.querySelector('.evocab-word').style.opacity = '0.3';
            cardEl.querySelector('.evocab-word').style.fontSize = '16px';
            var cnEl = cardEl.querySelector('.evocab-chinese');
            cnEl.style.visibility = 'visible';
            cnEl.style.fontSize = '28px';
            cardEl.querySelectorAll('div[style*="visibility:hidden"]')[0].style.visibility = 'visible';
            cardEl.querySelector('.evocab-hint').style.display = 'none';
        } else {
            cardEl.querySelector('.evocab-word').style.opacity = '1';
            cardEl.querySelector('.evocab-word').style.fontSize = '36px';
            cardEl.querySelector('.evocab-chinese').style.visibility = 'hidden';
            cardEl.querySelectorAll('div[style*="visibility:hidden"]')[0].style.visibility = 'hidden';
            var hints = cardEl.querySelectorAll('.evocab-hint');
            for (var i = 0; i < hints.length; i++) {
                hints[i].style.display = '';
            }
        }
    }

    function markKnownCard() {
        var wordObj = containerEl._wordObj;
        if (!wordObj) return;
        markKnown(wordObj.word);
        renderCardMode(containerEl._filterMode || 'all');
    }

    function markReviewCard() {
        var wordObj = containerEl._wordObj;
        if (!wordObj) return;
        markReviewLater(wordObj.word);
        renderCardMode(containerEl._filterMode || 'all');
    }

    function undoCard() {
        var wordObj = containerEl._wordObj;
        if (!wordObj) return;
        unmarkWord(wordObj.word);
        renderCardMode(containerEl._filterMode || 'all');
    }

    function nextCard() {
        var filtered = containerEl._filtered || getFilteredWords(containerEl._filterMode || 'all');
        currentCardIndex = (currentCardIndex + 1) % filtered.length;
        cardFlipped = false;
        renderCardMode(containerEl._filterMode || 'all');
    }

    function prevCard() {
        var filtered = containerEl._filtered || getFilteredWords(containerEl._filterMode || 'all');
        currentCardIndex = (currentCardIndex - 1 + filtered.length) % filtered.length;
        cardFlipped = false;
        renderCardMode(containerEl._filterMode || 'all');
    }

    /* ========== QUIZ MODE ========== */

    function generateQuizOptions(correctWordObj) {
        var others = WORDS.filter(function(w) { return w.word !== correctWordObj.word; });
        others = shuffleArray(others);
        var distractors = others.slice(0, 3);
        var options = distractors.map(function(w) { return w.chinese; });
        options.push(correctWordObj.chinese);
        options = shuffleArray(options);
        var correctIdx = -1;
        for (var i = 0; i < options.length; i++) {
            if (options[i] === correctWordObj.chinese) {
                correctIdx = i;
                break;
            }
        }
        return { options: options, correctIndex: correctIdx };
    }

    function renderQuizMode() {
        // Pick a random word from the remaining words (not yet mastered)
        var remaining = WORDS.filter(function(w) { return !isKnown(w.word); });
        if (remaining.length === 0) {
            // All mastered - still allow quiz with any word
            remaining = WORDS.slice();
        }
        var wordObj = remaining[Math.floor(Math.random() * remaining.length)];

        var quizData = generateQuizOptions(wordObj);
        quizOptions = quizData.options;
        quizCorrectIndex = quizData.correctIndex;
        quizAnswered = false;

        var html = '';
        html += '<div class="evocab-quiz" id="evocab-quiz-el">';
        html += '<div class="evocab-quiz-word">' + wordObj.word + '</div>';
        html += '<span class="evocab-quiz-pos">' + wordObj.pos + '</span>';
        html += '<div style="font-size:13px;color:#aaa;margin-bottom:12px;">选择正确的中文意思</div>';
        for (var i = 0; i < quizOptions.length; i++) {
            html += '<button class="evocab-option" id="evocab-opt-' + i + '" data-action="select-option" data-index="' + i + '">';
            html += String.fromCharCode(65 + i) + '. ' + quizOptions[i];
            html += '</button>';
        }
        html += '<div class="evocab-feedback" id="evocab-feedback-el"></div>';
        html += '</div>';

        html += '<div style="text-align:center;margin-top:20px;">';
        html += '<button class="evocab-btn evocab-btn-next" data-action="next-quiz">下一题 &raquo;</button>';
        html += '</div>';

        containerEl.innerHTML = html;
        containerEl._quizWordObj = wordObj;
    }

    function selectQuizOption(index) {
        if (quizAnswered) return;
        quizAnswered = true;

        var fbEl = document.getElementById('evocab-feedback-el');
        var wordObj = containerEl._quizWordObj;

        for (var i = 0; i < 4; i++) {
            var optEl = document.getElementById('evocab-opt-' + i);
            if (!optEl) continue;
            optEl.style.pointerEvents = 'none';
            if (i === quizCorrectIndex) {
                optEl.classList.add('correct');
            }
        }

        if (index === quizCorrectIndex) {
            document.getElementById('evocab-opt-' + index).classList.add('correct');
            fbEl.className = 'evocab-feedback correct-msg';
            fbEl.innerHTML = '&#10003; 正确！<br><small>例句: ' + wordObj.example + '</small>';
            markKnown(wordObj.word);
        } else {
            document.getElementById('evocab-opt-' + index).classList.add('wrong');
            fbEl.className = 'evocab-feedback wrong-msg';
            fbEl.innerHTML = '&#10007; 错误！正确答案是 <b>' + String.fromCharCode(65 + quizCorrectIndex) + '. ' + quizOptions[quizCorrectIndex] + '</b><br><small>例句: ' + wordObj.example + '</small>';
            markReviewLater(wordObj.word);
        }
    }

    function nextQuiz() {
        renderQuizMode();
    }

    /* ========== MODE SWITCHING ========== */

    function switchMode(mode) {
        currentMode = mode;
        currentCardIndex = 0;
        cardFlipped = false;

        // Update tab buttons
        var tabs = containerEl.querySelectorAll('.evocab-mode-tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.remove('active');
        }
        var activeTab = containerEl.querySelector('[data-mode="' + mode + '"]');
        if (activeTab) activeTab.classList.add('active');

        if (mode === MODE_CARD) {
            renderCardMode(containerEl._filterMode || 'all');
        } else {
            renderQuizMode();
        }
    }

    /* ========== FILTER SWITCHING ========== */

    function setFilter(filter) {
        containerEl._filterMode = filter;
        currentCardIndex = 0;
        cardFlipped = false;

        // Update filter buttons
        var filterBtns = containerEl.querySelectorAll('.evocab-filter-btn');
        for (var i = 0; i < filterBtns.length; i++) {
            filterBtns[i].classList.remove('active');
        }
        var activeFilter = containerEl.querySelector('[data-filter="' + filter + '"]');
        if (activeFilter) activeFilter.classList.add('active');

        renderCardMode(filter);
    }

    /* ========== EVENT DELEGATION ========== */

    function handleClick(e) {
        var target = e.target.closest('[data-action]');
        if (!target) return;
        var action = target.getAttribute('data-action');
        switch (action) {
            case 'flip-card':
                flipCard();
                break;
            case 'undo-card':
                undoCard();
                break;
            case 'mark-known':
                markKnownCard();
                break;
            case 'mark-review':
                markReviewCard();
                break;
            case 'prev-card':
                prevCard();
                break;
            case 'next-card':
                nextCard();
                break;
            case 'select-option':
                selectQuizOption(parseInt(target.getAttribute('data-index'), 10));
                break;
            case 'next-quiz':
                nextQuiz();
                break;
            case 'switch-mode':
                switchMode(target.getAttribute('data-mode'));
                break;
            case 'set-filter':
                setFilter(target.getAttribute('data-filter'));
                break;
        }
    }

    /* ========== MAIN RENDER ========== */

    function render() {
        loadProgress();
        injectStyles();

        // Create or reuse container
        var existingContainer = document.getElementById('evocab-container');
        if (existingContainer) {
            containerEl = existingContainer;
        } else {
            containerEl = document.createElement('div');
            containerEl.id = 'evocab-container';
            // Try to find a suitable mount point
            var mountPoint = document.querySelector('.main-content') || document.querySelector('#app') || document.body;
            mountPoint.appendChild(containerEl);
        }

        // Attach event delegation once (container is stable/reused)
        if (!containerEl._evocabDelegated) {
            containerEl.addEventListener('click', handleClick);
            containerEl._evocabDelegated = true;
        }

        containerEl._filterMode = containerEl._filterMode || 'all';
        currentCardIndex = 0;
        cardFlipped = false;

        var mastered = getMasteredCount();
        var total = WORDS.length;

        var html = '';
        html += '<h1>高考英语词汇记忆</h1>';
        html += '<div class="evocab-stats">已掌握 ' + mastered + ' / ' + total + ' (' + Math.round(mastered / total * 100) + '%)</div>';

        // Mode tabs
        html += '<div class="evocab-mode-tabs">';
        html += '<button class="evocab-mode-tab active" data-mode="card" data-action="switch-mode">&#x1F0CF; 单词卡片</button>';
        html += '<button class="evocab-mode-tab" data-mode="quiz" data-action="switch-mode">&#x270F; 选择题</button>';
        html += '</div>';

        // Filter row (only for card mode)
        html += '<div class="evocab-filter-row" id="evocab-filter-row">';
        html += '<button class="evocab-filter-btn active" data-filter="all" data-action="set-filter">全部</button>';
        html += '<button class="evocab-filter-btn" data-filter="remaining" data-action="set-filter">未掌握</button>';
        html += '<button class="evocab-filter-btn" data-filter="known" data-action="set-filter">已掌握</button>';
        html += '<button class="evocab-filter-btn" data-filter="review" data-action="set-filter">待复习</button>';
        html += '<button class="evocab-filter-btn" data-filter="unseen" data-action="set-filter">未学习</button>';
        html += '</div>';

        // Content area
        html += '<div id="evocab-content-area"></div>';

        containerEl.innerHTML = html;

        // Re-get content area
        var contentArea = document.getElementById('evocab-content-area');
        // We'll use containerEl as the render target for card/quiz content
        // Override: repoint containerEl temporarily for renderCardMode/renderQuizMode
        var savedContainer = containerEl;
        containerEl = contentArea;

        // Set initial mode
        if (savedContainer._filterMode) {
            renderCardMode(savedContainer._filterMode);
        } else {
            renderCardMode('all');
        }

        containerEl = savedContainer;
    }

    /* ========== PUBLIC API ========== */

    return {
        render: render
    };
})();

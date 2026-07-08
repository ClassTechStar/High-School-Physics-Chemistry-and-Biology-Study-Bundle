// 记忆巩固与诊断模块
// 包含：spacedRepetition(间隔重复), textbookFillBlank(教材挖空),
//       adaptiveDiagnosis(自适应诊断), knowledgeHeatmap(知识盲区热力图)
// 代码风格：ES5兼容，innerHTML渲染，内联样式，window暴露对象
// ============================================================

// ==================== 1. 间隔重复记忆系统（spacedRepetition）====================
var spacedRepetition = {
    STORAGE_KEY: 'hspcb_spaced_repetition',
    INTERVALS: [1, 3, 7, 15, 30], // 间隔天数：初次1天→3天→7天→15天→30天

    state: {
        currentIndex: 0,
        flipped: false,
        filter: 'due', // due(今日待复习) / all(全部) / mastered(已掌握)
        subject: 'all' // all / chemistry / biology / physics
    },

    // 内嵌35张卡片数据
    cards: [
        // ===== 化学-氧化还原 =====
        { id: 'sr-c01', type: 'chemistry', subtype: '氧化还原', front: '黄铁矿焙烧（硫酸工业第一步）的化学方程式？', back: '4FeS₂ + 11O₂ →(高温) 2Fe₂O₃ + 8SO₂\n【要点】Fe: +2→+3，S: -1→+4，O: 0→-2' },
        { id: 'sr-c02', type: 'chemistry', subtype: '氧化还原', front: '铜与浓硫酸反应的化学方程式？', back: 'Cu + 2H₂SO₄(浓) →(Δ) CuSO₄ + SO₂↑ + 2H₂O\n【要点】浓硫酸既显氧化性又显酸性' },
        { id: 'sr-c03', type: 'chemistry', subtype: '氧化还原', front: '铜与稀硝酸反应的化学方程式？', back: '3Cu + 8HNO₃(稀) → 3Cu(NO₃)₂ + 2NO↑ + 4H₂O\n【要点】稀硝酸被还原为NO' },
        { id: 'sr-c04', type: 'chemistry', subtype: '氧化还原', front: '实验室制氯气的化学方程式（二氧化锰与浓盐酸）？', back: 'MnO₂ + 4HCl(浓) →(Δ) MnCl₂ + Cl₂↑ + 2H₂O\n【要点】Mn: +4→+2，Cl: -1→0' },
        { id: 'sr-c05', type: 'chemistry', subtype: '氧化还原', front: '氨的催化氧化（工业制硝酸关键步骤）？', back: '4NH₃ + 5O₂ →(催化剂,Δ) 4NO + 6H₂O\n【要点】Pt-Rh催化，N: -3→+2' },
        { id: 'sr-c06', type: 'chemistry', subtype: '氧化还原', front: '高炉炼铁中一氧化碳还原氧化铁的方程式？', back: 'Fe₂O₃ + 3CO →(高温) 2Fe + 3CO₂\n【要点】Fe: +3→0，C: +2→+4' },
        // ===== 化学-复分解 =====
        { id: 'sr-c07', type: 'chemistry', subtype: '复分解', front: '盐酸与氢氧化钠中和反应方程式？', back: 'HCl + NaOH → NaCl + H₂O\n【要点】强酸强碱中和，ΔH<0' },
        { id: 'sr-c08', type: 'chemistry', subtype: '复分解', front: '硝酸银溶液检验氯离子的离子方程式？', back: 'Ag⁺ + Cl⁻ → AgCl↓\n【要点】白色沉淀，不溶于稀硝酸' },
        { id: 'sr-c09', type: 'chemistry', subtype: '复分解', front: '钡离子与硫酸根反应的离子方程式？', back: 'Ba²⁺ + SO₄²⁻ → BaSO₄↓\n【要点】白色沉淀，不溶于稀盐酸' },
        { id: 'sr-c10', type: 'chemistry', subtype: '复分解', front: '碳酸钙与稀盐酸反应制CO₂的方程式？', back: 'CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O\n【要点】不能用硫酸（生成微溶CaSO₄阻碍反应）' },
        { id: 'sr-c11', type: 'chemistry', subtype: '复分解', front: '碳酸氢钠受热分解方程式？', back: '2NaHCO₃ →(Δ) Na₂CO₃ + CO₂↑ + H₂O\n【要点】可用于鉴别Na₂CO₃与NaHCO₃' },
        { id: 'sr-c12', type: 'chemistry', subtype: '复分解', front: '明矾净水的原理（铝离子水解）？', back: 'Al³⁺ + 3H₂O ⇌ Al(OH)₃(胶体) + 3H⁺\n【要点】Al(OH)₃胶体吸附水中悬浮杂质' },
        // ===== 化学-有机 =====
        { id: 'sr-c13', type: 'chemistry', subtype: '有机', front: '甲烷燃烧的化学方程式？', back: 'CH₄ + 2O₂ →(点燃) CO₂ + 2H₂O\n【要点】火焰呈淡蓝色，产物可用无水CuSO₄和澄清石灰水检验' },
        { id: 'sr-c14', type: 'chemistry', subtype: '有机', front: '乙烯与水加成制乙醇的方程式？', back: 'CH₂=CH₂ + H₂O →(催化剂,加压加热) CH₃CH₂OH\n【要点】工业制乙醇方法之一' },
        { id: 'sr-c15', type: 'chemistry', subtype: '有机', front: '乙酸与乙醇酯化反应方程式？', back: 'CH₃COOH + C₂H₅OH ⇌(浓硫酸,Δ) CH₃COOC₂H₅ + H₂O\n【要点】酯化反应机理：酸脱羟基醇脱氢' },
        { id: 'sr-c16', type: 'chemistry', subtype: '有机', front: '葡萄糖在体内氧化的方程式？', back: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O (酶催化)\n【要点】放能反应，为生命活动供能' },
        { id: 'sr-c17', type: 'chemistry', subtype: '有机', front: '乙醛催化加氢还原为乙醇？', back: 'CH₃CHO + H₂ →(催化剂,Δ) CH₃CH₂OH\n【要点】C=O双键加氢，官能团由醛基变羟基' },
        // ===== 生物-教材填空 =====
        { id: 'sr-b01', type: 'biology', subtype: '光合作用', front: '光反应阶段产生的ATP和NADPH用于？', back: '用于暗反应中C₃的还原。\n【要点】光反应为暗反应提供[H]（NADPH）和ATP' },
        { id: 'sr-b02', type: 'biology', subtype: '光合作用', front: '暗反应中CO₂的固定是指？', back: 'CO₂与C₅（五碳化合物）结合形成C₃（三碳化合物）的过程。\n【要点】该反应不需要酶的催化消耗ATP' },
        { id: 'sr-b03', type: 'biology', subtype: '呼吸作用', front: '有氧呼吸第三阶段发生什么？', back: '前两个阶段产生的[H]与O₂结合生成水，释放大量能量。\n【要点】在线粒体内膜上进行，产生大量ATP' },
        { id: 'sr-b04', type: 'biology', subtype: '呼吸作用', front: '无氧呼吸产生乳酸的生物举例？', back: '乳酸菌、动物骨骼肌细胞、马铃薯块茎、玉米胚。\n【要点】C₆H₁₂O₆ → 2C₃H₆O₃（乳酸）+ 少量能量' },
        { id: 'sr-b05', type: 'biology', subtype: '遗传', front: '基因分离定律的实质？', back: '在杂合子细胞中，位于一对同源染色体上的等位基因，具有一定的独立性，减数分裂形成配子时，等位基因随同源染色体分开而分离，分别进入两个配子中，独立地随配子遗传给后代。' },
        { id: 'sr-b06', type: 'biology', subtype: '遗传', front: 'DNA双螺旋结构的主要特点？', back: '①两条链反向平行；②脱氧核糖和磷酸交替连接排列在外侧构成基本骨架；③碱基排列在内侧，A=T、G=C通过氢键连接成碱基对。' },
        { id: 'sr-b07', type: 'biology', subtype: '细胞', front: '细胞膜的功能特性有哪些？', back: '①具有选择透过性；②将细胞与外界环境分隔开；③控制物质进出细胞；④进行细胞间的信息交流。' },
        { id: 'sr-b08', type: 'biology', subtype: '细胞', front: '线粒体的功能？', back: '细胞进行有氧呼吸的主要场所，被称为细胞的"动力车间"。细胞生命活动所需的能量约95%来自线粒体。' },
        { id: 'sr-b09', type: 'biology', subtype: '激素', front: '胰岛素的生理作用？', back: '胰岛素是唯一降低血糖浓度的激素。促进组织细胞对葡萄糖的摄取、利用和储存；促进糖原合成；抑制非糖物质转化为葡萄糖。' },
        { id: 'sr-b10', type: 'biology', subtype: '生态', front: '生态系统能量流动的特点？', back: '①单向流动：能量只能沿食物链由低营养级流向高营养级；②逐级递减：传递效率为10%~20%。' },
        // ===== 物理-二级结论 =====
        { id: 'sr-p01', type: 'physics', subtype: '力学', front: '平抛运动中速度偏角α与位移偏角β的关系？', back: 'tanα = 2·tanβ\n【推导】速度偏角tanα=vy/vx=gt/v₀；位移偏角tanβ=y/x=gt²/(2v₀t)=gt/(2v₀)' },
        { id: 'sr-p02', type: 'physics', subtype: '力学', front: '圆周运动中"绳模型"过最高点的临界条件？', back: 'v_min = √(gr)\n【要点】绳只能拉不能推，最高点重力恰好提供向心力时速度最小' },
        { id: 'sr-p03', type: 'physics', subtype: '力学', front: '圆周运动中"杆模型"过最高点的临界条件？', back: 'v_min = 0\n【要点】杆既能拉也能推，最高点速度可以为零' },
        { id: 'sr-p04', type: 'physics', subtype: '电磁', front: '安培力方向判断用哪只手？', back: '左手定则：伸开左手，拇指与其余四指垂直且在同一平面内，磁感线穿入手心，四指指向电流方向，拇指所指为安培力方向。' },
        { id: 'sr-p05', type: 'physics', subtype: '电磁', front: '洛伦兹力做功的特点？', back: '洛伦兹力始终与速度方向垂直，永不做功。\n【要点】但洛伦兹力的分力可以做功' },
        { id: 'sr-p06', type: 'physics', subtype: '电磁', front: '变压器原副线圈电压、电流与匝数关系？', back: 'U₁/U₂ = n₁/n₂ ；I₁/I₂ = n₂/n₁ ；理想变压器输入功率等于输出功率 P₁=P₂' },
        { id: 'sr-p07', type: 'physics', subtype: '力学', front: '完全非弹性碰撞的特点？', back: '碰撞后两物体粘在一起以共同速度运动，动量守恒但机械能损失最大。\n【公式】m₁v₁+m₂v₂=(m₁+m₂)v' },
        { id: 'sr-p08', type: 'physics', subtype: '热学', front: '理想气体状态方程？', back: 'pV/T = C（常量）或 p₁V₁/T₁ = p₂V₂/T₂\n【条件】气体质量不变，温度取热力学温度T=t+273.15K' },
        { id: 'sr-p09', type: 'physics', subtype: '光学', front: '光电效应中极限频率与金属逸出功的关系？', back: 'W = h·ν₀\n【要点】ν₀为极限频率，当入射光频率ν≥ν₀时才能发生光电效应' },
        { id: 'sr-p10', type: 'physics', subtype: '原子', front: '氢原子能级跃迁吸收或释放光子的条件？', back: 'hν = E_m - E_n (m>n时释放光子，m<n时吸收光子)\n【要点】只能吸收等于能级差的光子（频率条件）' }
    ],

    progress: {}, // {cardId: {lastReview, reviewCount, nextReview, mastery}}

    init: function() {
        this.loadProgress();
        this._render();
    },

    loadProgress: function() {
        try {
            var data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                this.progress = JSON.parse(data);
            }
        } catch (e) {
            this.progress = {};
        }
    },

    saveProgress: function() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.progress));
        } catch (e) {}
    },

    _getCardProgress: function(cardId) {
        if (!this.progress[cardId]) {
            this.progress[cardId] = {
                lastReview: 0,
                reviewCount: 0,
                nextReview: Date.now(),
                mastery: 0 // 0-5，对应INTERVALS下标
            };
        }
        return this.progress[cardId];
    },

    _getDueCards: function() {
        var self = this;
        var now = Date.now();
        var due = [];
        this.cards.forEach(function(card) {
            if (self.state.subject !== 'all' && card.type !== self.state.subject) return;
            var p = self._getCardProgress(card.id);
            if (p.nextReview <= now) {
                due.push(card);
            }
        });
        return due;
    },

    _getMasteredCount: function() {
        var self = this;
        var count = 0;
        this.cards.forEach(function(card) {
            var p = self._getCardProgress(card.id);
            if (p.mastery >= 4) count++; // 掌握程度达到30天间隔视为已掌握
        });
        return count;
    },

    _getStats: function() {
        var due = this._getDueCards();
        var mastered = this._getMasteredCount();
        return {
            due: due.length,
            mastered: mastered,
            total: this.cards.length
        };
    },

    _reviewCard: function(cardId, known) {
        var p = this._getCardProgress(cardId);
        p.lastReview = Date.now();
        p.reviewCount++;
        if (known) {
            // 答对升级
            if (p.mastery < this.INTERVALS.length - 1) {
                p.mastery++;
            }
        } else {
            // 答错重置
            p.mastery = 0;
        }
        p.nextReview = Date.now() + this.INTERVALS[p.mastery] * 24 * 60 * 60 * 1000;
        this.saveProgress();
    },

    _render: function() {
        var app = document.getElementById('spaced-repetition-app');
        if (!app) return;
        var self = this;
        var stats = this._getStats();
        var dueCards = this._getDueCards();

        var html = '<div style="padding:16px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;">';

        // 标题与统计
        html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">';
        html += '<h3 style="margin:0;color:#0f172a;">🧠 间隔重复记忆系统</h3>';
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
        html += '<span style="background:#fee2e2;color:#b91c1c;padding:6px 12px;border-radius:6px;font-size:0.9rem;">📅 今日待复习：<strong>' + stats.due + '</strong></span>';
        html += '<span style="background:#dcfce7;color:#166534;padding:6px 12px;border-radius:6px;font-size:0.9rem;">✅ 已掌握：<strong>' + stats.mastered + '</strong></span>';
        html += '<span style="background:#eff6ff;color:#1e40af;padding:6px 12px;border-radius:6px;font-size:0.9rem;">📊 总计：<strong>' + stats.total + '</strong></span>';
        html += '</div></div>';

        // 学科筛选
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;padding:10px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">';
        var subjects = [['all', '全部'], ['chemistry', '🧪 化学'], ['biology', '🧬 生物'], ['physics', '⚛️ 物理']];
        subjects.forEach(function(s) {
            var active = self.state.subject === s[0];
            html += '<button data-sr-subject="' + s[0] + '" style="background:' + (active ? '#3b82f6' : '#fff') + ';color:' + (active ? '#fff' : '#475569') + ';border:1px solid ' + (active ? '#3b82f6' : '#cbd5e1') + ';padding:5px 12px;border-radius:6px;cursor:pointer;font-size:0.88rem;">' + s[1] + '</button>';
        });
        html += '</div>';

        // 卡片区域
        if (dueCards.length === 0) {
            html += '<div style="background:#dcfce7;border:1px solid #86efac;padding:30px;border-radius:10px;text-align:center;color:#166534;">';
            html += '<div style="font-size:2.5rem;">🎉</div>';
            html += '<div style="font-size:1.1rem;font-weight:600;margin-top:8px;">今日复习任务已完成！</div>';
            html += '<div style="margin-top:6px;color:#15803d;">坚持每日复习，记忆效果翻倍</div>';
            html += '<button id="sr-show-all" style="margin-top:14px;background:#3b82f6;color:#fff;border:0;padding:8px 18px;border-radius:6px;cursor:pointer;">查看全部卡片</button>';
            html += '</div>';
        } else {
            var card = dueCards[0];
            var p = this._getCardProgress(card.id);
            var flipped = this.state.flipped;

            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">';
            // 卡片头部
            var typeColor = card.type === 'chemistry' ? '#3b82f6' : (card.type === 'biology' ? '#10b981' : '#f59e0b');
            var typeName = card.type === 'chemistry' ? '化学' : (card.type === 'biology' ? '生物' : '物理');
            html += '<div style="background:' + typeColor + ';color:#fff;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;">';
            html += '<span style="font-size:0.85rem;">' + typeName + ' · ' + card.subtype + '</span>';
            html += '<span style="font-size:0.8rem;opacity:0.9;">复习次数：' + p.reviewCount + ' · 掌握度：' + p.mastery + '/' + (this.INTERVALS.length - 1) + '</span>';
            html += '</div>';

            // 卡片内容
            html += '<div id="sr-card-body" style="padding:28px 20px;min-height:160px;cursor:pointer;display:flex;align-items:center;justify-content:center;">';
            if (!flipped) {
                html += '<div style="text-align:center;">';
                html += '<div style="font-size:0.8rem;color:#94a3b8;margin-bottom:10px;">📌 正面 · 问题</div>';
                html += '<div style="font-size:1.1rem;color:#1e293b;line-height:1.7;white-space:pre-wrap;">' + card.front + '</div>';
                html += '<div style="margin-top:18px;font-size:0.85rem;color:#64748b;">💡 点击卡片查看答案</div>';
                html += '</div>';
            } else {
                html += '<div style="text-align:center;">';
                html += '<div style="font-size:0.8rem;color:#94a3b8;margin-bottom:10px;">✅ 背面 · 答案</div>';
                html += '<div style="font-size:1.05rem;color:#0f172a;line-height:1.8;white-space:pre-wrap;background:#f0fdf4;padding:14px;border-radius:8px;border-left:4px solid #10b981;">' + card.back + '</div>';
                html += '</div>';
            }
            html += '</div>';

            // 操作按钮
            html += '<div style="padding:14px 16px;border-top:1px solid #e2e8f0;display:flex;gap:10px;justify-content:center;">';
            if (!flipped) {
                html += '<button id="sr-flip" style="background:#6366f1;color:#fff;border:0;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:0.95rem;">🔄 翻转卡片</button>';
            } else {
                html += '<button data-sr-review="0" style="background:#ef4444;color:#fff;border:0;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:0.95rem;">❌ 不认识（重置）</button>';
                html += '<button data-sr-review="1" style="background:#10b981;color:#fff;border:0;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:0.95rem;">✅ 认识（升级）</button>';
            }
            html += '</div>';
            html += '</div>';

            // 进度提示
            html += '<div style="margin-top:10px;text-align:center;font-size:0.85rem;color:#64748b;">当前第 1/' + dueCards.length + ' 张待复习</div>';
        }

        // 全部卡片视图
        if (this.state.filter === 'showall' || dueCards.length === 0) {
            html += '<div style="margin-top:18px;">';
            html += '<h4 style="color:#0f172a;margin-bottom:10px;">📋 全部卡片列表（' + this.cards.length + '张）</h4>';
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;">';
            this.cards.forEach(function(card) {
                var cp = self._getCardProgress(card.id);
                var tc = card.type === 'chemistry' ? '#3b82f6' : (card.type === 'biology' ? '#10b981' : '#f59e0b');
                var masteryColor = cp.mastery >= 4 ? '#10b981' : (cp.mastery >= 2 ? '#f59e0b' : '#ef4444');
                html += '<div style="background:#fff;border:1px solid #e2e8f0;border-left:3px solid ' + tc + ';padding:10px;border-radius:6px;">';
                html += '<div style="font-size:0.8rem;color:#64748b;margin-bottom:4px;">' + card.subtype + '</div>';
                html += '<div style="font-size:0.88rem;color:#1e293b;line-height:1.5;">' + card.front.substring(0, 50) + (card.front.length > 50 ? '...' : '') + '</div>';
                html += '<div style="margin-top:6px;font-size:0.78rem;color:' + masteryColor + ';">掌握度：' + cp.mastery + '/' + (self.INTERVALS.length - 1) + ' · 复习' + cp.reviewCount + '次</div>';
                html += '</div>';
            });
            html += '</div></div>';
        }

        html += '</div>';
        app.innerHTML = html;
        this._bindEvents();
    },

    _bindEvents: function() {
        var self = this;
        // 学科筛选
        var subBtns = document.querySelectorAll('[data-sr-subject]');
        for (var i = 0; i < subBtns.length; i++) {
            (function(btn) {
                btn.onclick = function() {
                    self.state.subject = btn.getAttribute('data-sr-subject');
                    self.state.flipped = false;
                    self._render();
                };
            })(subBtns[i]);
        }
        // 翻转卡片
        var flipBtn = document.getElementById('sr-flip');
        var cardBody = document.getElementById('sr-card-body');
        if (flipBtn) {
            flipBtn.onclick = function() {
                self.state.flipped = true;
                self._render();
            };
        }
        if (cardBody && !this.state.flipped) {
            cardBody.onclick = function() {
                self.state.flipped = true;
                self._render();
            };
        }
        // 评价按钮
        var reviewBtns = document.querySelectorAll('[data-sr-review]');
        for (var j = 0; j < reviewBtns.length; j++) {
            (function(btn) {
                btn.onclick = function() {
                    var known = btn.getAttribute('data-sr-review') === '1';
                    var dueCards = self._getDueCards();
                    if (dueCards.length > 0) {
                        self._reviewCard(dueCards[0].id, known);
                    }
                    self.state.flipped = false;
                    self._render();
                };
            })(reviewBtns[j]);
        }
        // 查看全部
        var showAllBtn = document.getElementById('sr-show-all');
        if (showAllBtn) {
            showAllBtn.onclick = function() {
                self.state.filter = 'showall';
                self._render();
            };
        }
    }
};

// ==================== 2. 教材原文挖空（textbookFillBlank）====================
var textbookFillBlank = {
    state: {
        subject: 'biology',
        currentIndex: 0,
        userAnswer: '',
        showAnswer: false
    },

    // 内嵌22道填空题
    questions: [
        // ===== 生物（重点，12题）=====
        { id: 'tb-b01', subject: 'biology', chapter: '光合作用', passage: '光合作用的光反应阶段，叶绿素吸收光能，将水分解为______和______，同时合成______。', answer: '氧气（O₂）', answer2: '[H]（NADPH）', answer3: 'ATP', hint: '光反应的三个产物' },
        { id: 'tb-b02', subject: 'biology', chapter: '光合作用', passage: '暗反应阶段，CO₂被______固定形成C₃，随后C₃在______和多种酶的催化下被还原。', answer: 'C₅（五碳化合物）', answer2: 'ATP和NADPH提供的[H]', answer3: '', hint: 'CO₂固定与C₃还原' },
        { id: 'tb-b03', subject: 'biology', chapter: '光合作用', passage: '影响光合作用速率的环境因素主要包括______、______和______。', answer: '光照强度', answer2: 'CO₂浓度', answer3: '温度', hint: '三大主要外部因素' },
        { id: 'tb-b04', subject: 'biology', chapter: '呼吸作用', passage: '有氧呼吸第一阶段在______中进行，将葡萄糖分解为______和少量[H]，释放少量能量。', answer: '细胞质基质', answer2: '丙酮酸', answer3: '', hint: '糖酵解的场所和产物' },
        { id: 'tb-b05', subject: 'biology', chapter: '呼吸作用', passage: '有氧呼吸第二阶段在______中进行，丙酮酸与水反应生成______和大量[H]，释放少量能量。', answer: '线粒体基质', answer2: 'CO₂', answer3: '', hint: '三羧酸循环的场所' },
        { id: 'tb-b06', subject: 'biology', chapter: '呼吸作用', passage: '有氧呼吸第三阶段在前两个阶段产生的______与______结合生成水，同时释放大量能量。', answer: '[H]', answer2: 'O₂（氧气）', answer3: '', hint: '最终电子受体' },
        { id: 'tb-b07', subject: 'biology', chapter: '遗传', passage: 'DNA复制的方式为______，复制时需要______酶解开双链，子链合成方向为______。', answer: '半保留复制', answer2: '解旋', answer3: '5\'→3\'', hint: '复制特点与方向' },
        { id: 'tb-b08', subject: 'biology', chapter: '遗传', passage: '基因表达包括______和______两个过程，前者发生在______中，后者发生在______上。', answer: '转录', answer2: '翻译', answer3: '细胞核', hint: '基因表达的两步' },
        { id: 'tb-b09', subject: 'biology', chapter: '遗传', passage: '密码子共有______种，其中终止密码子有______种，起始密码子有______种。', answer: '64', answer2: '3', answer3: '2', hint: '密码子总数与分类' },
        { id: 'tb-b10', subject: 'biology', chapter: '细胞', passage: '细胞膜的结构特点是具有______，功能特性是具有______。', answer: '一定的流动性', answer2: '选择透过性', answer3: '', hint: '结构特点与功能特性' },
        { id: 'tb-b11', subject: 'biology', chapter: '细胞', passage: '主动运输需要______和______，其运输方向为______。', answer: '载体蛋白', answer2: '能量（ATP）', answer3: '从低浓度到高浓度', hint: '主动运输的三个条件' },
        { id: 'tb-b12', subject: 'biology', chapter: '激素', passage: '血糖调节中，降低血糖的激素是______，由______分泌；升高血糖的激素主要是______。', answer: '胰岛素', answer2: '胰岛B细胞', answer3: '胰高血糖素', hint: '血糖调节的激素' },
        // ===== 物理（5题）=====
        { id: 'tb-p01', subject: 'physics', chapter: '牛顿运动定律', passage: '牛顿第一定律指出：一切物体总保持______状态或______状态，除非作用在它上面的力迫使它改变这种状态。', answer: '匀速直线运动', answer2: '静止', answer3: '', hint: '惯性定律' },
        { id: 'tb-p02', subject: 'physics', chapter: '万有引力', passage: '万有引力定律公式为F=______，其中G=______N·m²/kg²，由______通过扭秤实验测得。', answer: 'Gm₁m₂/r²', answer2: '6.67×10⁻¹¹', answer3: '卡文迪许', hint: '引力常量与测量者' },
        { id: 'tb-p03', subject: 'physics', chapter: '动能定理', passage: '动能定理表述为：合外力对物体所做的功等于物体______的变化量，公式为W=______。', answer: '动能', answer2: 'ΔEk=Ek₂-Ek₁', answer3: '', hint: '功与动能的关系' },
        { id: 'tb-p04', subject: 'physics', chapter: '电磁感应', passage: '法拉第电磁感应定律：电路中感应电动势的大小，跟穿过这一电路的______成正比，公式E=______。', answer: '磁通量的变化率', answer2: 'n·ΔΦ/Δt', answer3: '', hint: '感应电动势的决定因素' },
        { id: 'tb-p05', subject: 'physics', chapter: '动量', passage: '动量守恒定律的条件是系统______或______，公式为______。', answer: '不受外力', answer2: '所受外力之和为零', answer3: 'm₁v₁+m₂v₂=m₁v₁\'+m₂v₂\'', hint: '守恒条件与公式' },
        // ===== 化学（5题）=====
        { id: 'tb-c01', subject: 'chemistry', chapter: '氧化还原', passage: '氧化还原反应的本质是______的转移，特征是______的变化。失去电子的物质是______剂。', answer: '电子', answer2: '元素化合价', answer3: '还原', hint: '本质与特征' },
        { id: 'tb-c02', subject: 'chemistry', chapter: '化学键', passage: '共价键分为______键和______键，其中σ键的特点是______，π键的特点是______。', answer: 'σ', answer2: 'π', answer3: '电子云沿键轴方向呈轴对称', hint: '共价键分类' },
        { id: 'tb-c03', subject: 'chemistry', chapter: '化学平衡', passage: '化学平衡状态是指在一定条件下的______反应中，正反应速率与逆反应速率______，反应混合物中各组分的浓度______。', answer: '可逆', answer2: '相等', answer3: '保持不变', hint: '平衡的三个特征' },
        { id: 'tb-c04', subject: 'chemistry', chapter: '电解质', passage: '弱电解质的电离平衡常数K只受______影响，与______无关。对于CH₃COOH⇌CH₃COO⁻+H⁺，加水稀释时电离程度______。', answer: '温度', answer2: '浓度', answer3: '增大', hint: '平衡常数的影响因素' },
        { id: 'tb-c05', subject: 'chemistry', chapter: '原电池', passage: '原电池中，电子由______极流向______极（外电路），负极发生______反应，正极发生______反应。', answer: '负', answer2: '正', answer3: '氧化', hint: '电极反应类型' }
    ],

    init: function() {
        this._render();
    },

    _getQuestions: function() {
        var self = this;
        return this.questions.filter(function(q) {
            return q.subject === self.state.subject;
        });
    },

    _render: function() {
        var app = document.getElementById('textbook-fill-app');
        if (!app) return;
        var self = this;
        var list = this._getQuestions();
        var idx = Math.min(this.state.currentIndex, list.length - 1);
        var q = list[idx];

        var html = '<div style="padding:16px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;">';

        // 标题
        html += '<h3 style="margin:0 0 14px 0;color:#0f172a;">📖 教材原文挖空训练</h3>';

        // 学科切换
        html += '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">';
        var subs = [['biology', '🧬 生物'], ['physics', '⚛️ 物理'], ['chemistry', '🧪 化学']];
        subs.forEach(function(s) {
            var active = self.state.subject === s[0];
            html += '<button data-tb-subject="' + s[0] + '" style="background:' + (active ? '#3b82f6' : '#fff') + ';color:' + (active ? '#fff' : '#475569') + ';border:1px solid ' + (active ? '#3b82f6' : '#cbd5e1') + ';padding:6px 14px;border-radius:6px;cursor:pointer;">' + s[1] + '</button>';
        });
        html += '</div>';

        // 章节导航
        html += '<div style="margin-bottom:14px;display:flex;gap:6px;flex-wrap:wrap;">';
        list.forEach(function(item, i) {
            var active = i === idx;
            html += '<button data-tb-idx="' + i + '" style="background:' + (active ? '#6366f1' : '#f1f5f9') + ';color:' + (active ? '#fff' : '#475569') + ';border:1px solid ' + (active ? '#6366f1' : '#cbd5e1') + ';padding:4px 10px;border-radius:5px;cursor:pointer;font-size:0.8rem;">' + item.chapter + '</button>';
        });
        html += '</div>';

        // 题目卡片
        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">';
        html += '<div style="font-size:0.85rem;color:#64748b;margin-bottom:10px;">第 ' + (idx + 1) + ' 题 · ' + q.chapter + '</div>';
        html += '<div style="font-size:1.05rem;color:#1e293b;line-height:2.0;background:#f8fafc;padding:16px;border-radius:8px;border-left:4px solid #6366f1;">' + q.passage + '</div>';

        // 输入区
        html += '<div style="margin-top:16px;">';
        html += '<label style="font-size:0.88rem;color:#475569;display:block;margin-bottom:6px;">✏️ 请填写空格答案（多个空用逗号分隔）：</label>';
        html += '<input type="text" id="tb-input" value="' + (this.state.userAnswer || '') + '" placeholder="输入你的答案..." style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.95rem;box-sizing:border-box;" />';
        html += '</div>';

        // 按钮
        html += '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">';
        html += '<button id="tb-check" style="background:#3b82f6;color:#fff;border:0;padding:8px 18px;border-radius:6px;cursor:pointer;">🔍 自检</button>';
        html += '<button id="tb-next" style="background:#10b981;color:#fff;border:0;padding:8px 18px;border-radius:6px;cursor:pointer;">⏭ 下一题</button>';
        html += '<button id="tb-prev" style="background:#f1f5f9;color:#475569;border:0;padding:8px 18px;border-radius:6px;cursor:pointer;">⏮ 上一题</button>';
        html += '</div>';

        // 答案显示
        if (this.state.showAnswer) {
            html += '<div style="margin-top:16px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:14px;">';
            html += '<div style="font-size:0.85rem;color:#166534;font-weight:600;margin-bottom:8px;">✅ 正确答案：</div>';
            html += '<div style="color:#15803d;line-height:1.8;">';
            html += '<div>空1：<strong>' + q.answer + '</strong></div>';
            if (q.answer2) html += '<div>空2：<strong>' + q.answer2 + '</strong></div>';
            if (q.answer3) html += '<div>空3：<strong>' + q.answer3 + '</strong></div>';
            html += '</div>';
            html += '<div style="margin-top:8px;font-size:0.85rem;color:#64748b;">💡 提示：' + q.hint + '</div>';
            html += '</div>';
        }
        html += '</div>';

        html += '</div>';
        app.innerHTML = html;
        this._bindEvents();
    },

    _bindEvents: function() {
        var self = this;
        // 学科切换
        var subBtns = document.querySelectorAll('[data-tb-subject]');
        for (var i = 0; i < subBtns.length; i++) {
            (function(btn) {
                btn.onclick = function() {
                    self.state.subject = btn.getAttribute('data-tb-subject');
                    self.state.currentIndex = 0;
                    self.state.userAnswer = '';
                    self.state.showAnswer = false;
                    self._render();
                };
            })(subBtns[i]);
        }
        // 题目导航
        var idxBtns = document.querySelectorAll('[data-tb-idx]');
        for (var j = 0; j < idxBtns.length; j++) {
            (function(btn) {
                btn.onclick = function() {
                    self.state.currentIndex = parseInt(btn.getAttribute('data-tb-idx'), 10);
                    self.state.userAnswer = '';
                    self.state.showAnswer = false;
                    self._render();
                };
            })(idxBtns[j]);
        }
        // 输入
        var input = document.getElementById('tb-input');
        if (input) {
            input.oninput = function() {
                self.state.userAnswer = input.value;
            };
        }
        // 自检
        var checkBtn = document.getElementById('tb-check');
        if (checkBtn) {
            checkBtn.onclick = function() {
                self.state.showAnswer = true;
                self._render();
            };
        }
        // 下一题
        var nextBtn = document.getElementById('tb-next');
        if (nextBtn) {
            nextBtn.onclick = function() {
                var list = self._getQuestions();
                self.state.currentIndex = (self.state.currentIndex + 1) % list.length;
                self.state.userAnswer = '';
                self.state.showAnswer = false;
                self._render();
            };
        }
        // 上一题
        var prevBtn = document.getElementById('tb-prev');
        if (prevBtn) {
            prevBtn.onclick = function() {
                var list = self._getQuestions();
                self.state.currentIndex = (self.state.currentIndex - 1 + list.length) % list.length;
                self.state.userAnswer = '';
                self.state.showAnswer = false;
                self._render();
            };
        }
    }
};

// ==================== 3. 自适应诊断测试（adaptiveDiagnosis）====================
var adaptiveDiagnosis = {
    state: {
        phase: 'select', // select(选科) / testing(测试中) / result(结果)
        subject: '',
        currentIdx: 0,
        answers: [], // {questionId, correct, knowledgePoints}
        weakMap: {} // {knowledgePoint: weakScore}
    },

    // 内嵌20道诊断题：物理7题、化学7题、生物6题
    questions: [
        // ===== 物理 7题 =====
        { id: 'dg-p01', subject: 'physics', chapter: '运动学', kp: '匀变速直线运动公式', q: '一物体从静止开始做匀加速直线运动，加速度为2m/s²，求第3秒内的位移？', options: ['5m', '7m', '9m', '11m'], answer: 0, explain: '第3秒内位移=s₃-s₂=½×2×9-½×2×4=9-4=5m' },
        { id: 'dg-p02', subject: 'physics', chapter: '牛顿运动定律', kp: '牛顿第二定律应用', q: '质量为2kg的物体受到水平向右10N的拉力和水平向左4N的摩擦力，其加速度大小为？', options: ['2m/s²', '3m/s²', '5m/s²', '7m/s²'], answer: 1, explain: 'F合=10-4=6N，a=F/m=6/2=3m/s²' },
        { id: 'dg-p03', subject: 'physics', chapter: '抛体运动', kp: '平抛运动规律', q: '从高20m处水平抛出一物体，初速度为10m/s，g=10m/s²，求落地时间？', options: ['1s', '2s', '3s', '4s'], answer: 1, explain: 't=√(2h/g)=√(40/10)=2s' },
        { id: 'dg-p04', subject: 'physics', chapter: '圆周运动', kp: '向心力来源分析', q: '汽车在水平弯道上转弯，提供向心力的是？', options: ['重力', '支持力', '静摩擦力', '牵引力'], answer: 2, explain: '水平路面上转弯，静摩擦力提供向心力' },
        { id: 'dg-p05', subject: 'physics', chapter: '功和能', kp: '动能定理', q: '质量为1kg的物体速度从4m/s增大到6m/s，合外力做的功为？', options: ['8J', '10J', '18J', '26J'], answer: 1, explain: 'W=ΔEk=½×1×36-½×1×16=18-8=10J' },
        { id: 'dg-p06', subject: 'physics', chapter: '电磁感应', kp: '法拉第电磁感应定律', q: '穿过单匝线圈的磁通量在0.1s内从0.2Wb均匀变化到0.4Wb，感应电动势为？', options: ['1V', '2V', '4V', '6V'], answer: 1, explain: 'E=ΔΦ/Δt=(0.4-0.2)/0.1=2V' },
        { id: 'dg-p07', subject: 'physics', chapter: '动量', kp: '动量守恒定律', q: '质量为2kg的小球以3m/s速度与静止的质量为1kg小球发生正碰后粘合，碰后共同速度为？', options: ['1m/s', '2m/s', '3m/s', '6m/s'], answer: 1, explain: 'm₁v₁=(m₁+m₂)v，v=2×3/3=2m/s' },
        // ===== 化学 7题 =====
        { id: 'dg-c01', subject: 'chemistry', chapter: '氧化还原', kp: '氧化还原方程式配平', q: '反应MnO₂+4HCl(浓)→MnCl₂+Cl₂↑+2H₂O中，被氧化的元素是？', options: ['Mn', 'Cl', 'O', 'H'], answer: 1, explain: 'Cl从-1价升到0价，被氧化；Mn从+4降到+2被还原' },
        { id: 'dg-c02', subject: 'chemistry', chapter: '物质结构', kp: '化学键类型判断', q: '下列物质中只含离子键的是？', options: ['NaOH', 'NaCl', 'NH₄Cl', 'HCl'], answer: 1, explain: 'NaCl只含离子键；NaOH含离子键和共价键；NH₄Cl含离子键和共价键' },
        { id: 'dg-c03', subject: 'chemistry', chapter: '化学平衡', kp: '平衡移动方向判断', q: '对于N₂+3H₂⇌2NH₃（放热反应），下列能提高NH₃产率的是？', options: ['升高温度', '减小压强', '降低温度', '加催化剂'], answer: 2, explain: '放热反应降温正向移动，且正反应气体体积减小，加压也利于正向' },
        { id: 'dg-c04', subject: 'chemistry', chapter: '电解质溶液', kp: 'pH计算', q: '将pH=2的盐酸稀释100倍后，溶液的pH为？', options: ['1', '3', '4', '5'], answer: 2, explain: '稀释100倍，c(H⁺)变为1/100，pH增大2，变为4' },
        { id: 'dg-c05', subject: 'chemistry', chapter: '电化学', kp: '原电池工作原理', q: '锌铜原电池中，铜片上发生的反应是？', options: ['Zn→Zn²⁺+2e⁻', 'Zn²⁺+2e⁻→Zn', '2H⁺+2e⁻→H₂↑', 'Cu→Cu²⁺+2e⁻'], answer: 2, explain: '铜为正极，得电子，溶液中H⁺在铜片上放电生成H₂' },
        { id: 'dg-c06', subject: 'chemistry', chapter: '有机化学', kp: '官能团性质', q: '能发生银镜反应的有机物一定含有？', options: ['羟基', '羧基', '醛基', '酯基'], answer: 2, explain: '银镜反应是醛基的特征反应，-CHO被氧化为-COOH' },
        { id: 'dg-c07', subject: 'chemistry', chapter: '元素周期律', kp: '元素周期表与周期律', q: '下列元素中，非金属性最强的是？', options: ['F', 'Cl', 'O', 'S'], answer: 0, explain: '同主族从上到下非金属性减弱，同周期从左到右增强，F是非金属性最强的元素' },
        // ===== 生物 6题 =====
        { id: 'dg-b01', subject: 'biology', chapter: '细胞', kp: '细胞器功能', q: '被称为"蛋白质合成工厂"的细胞器是？', options: ['线粒体', '核糖体', '高尔基体', '内质网'], answer: 1, explain: '核糖体是蛋白质合成的场所，线粒体是"动力车间"' },
        { id: 'dg-b02', subject: 'biology', chapter: '光合作用', kp: '光反应与暗反应', q: '光反应为暗反应提供的物质是？', options: ['O₂和CO₂', 'ATP和NADPH', '葡萄糖和O₂', 'CO₂和H₂O'], answer: 1, explain: '光反应产生ATP和[H](NADPH)，用于暗反应C₃的还原' },
        { id: 'dg-b03', subject: 'biology', chapter: '呼吸作用', kp: '有氧呼吸过程', q: '有氧呼吸产生CO₂的阶段是？', options: ['第一阶段', '第二阶段', '第三阶段', '三个阶段都产生'], answer: 1, explain: '第二阶段丙酮酸与水反应生成CO₂和[H]，释放少量能量' },
        { id: 'dg-b04', subject: 'biology', chapter: '遗传', kp: 'DNA结构与复制', q: 'DNA分子中，腺嘌呤(A)占全部碱基的20%，则鸟嘌呤(G)占？', options: ['20%', '30%', '40%', '60%'], answer: 1, explain: 'A=T=20%，G=C，G=(100%-40%)/2=30%' },
        { id: 'dg-b05', subject: 'biology', chapter: '遗传', kp: '基因表达', q: '翻译过程中，一个mRNA上可以结合多个核糖体，其意义是？', options: ['加快转录速度', '合成不同种蛋白质', '少量mRNA合成大量蛋白质', '提高DNA复制效率'], answer: 2, explain: '多聚核糖体可在短时间内合成大量同种蛋白质，提高效率' },
        { id: 'dg-b06', subject: 'biology', chapter: '激素调节', kp: '血糖调节', q: '人体内唯一降低血糖的激素是？', options: ['胰高血糖素', '肾上腺素', '胰岛素', '甲状腺激素'], answer: 2, explain: '胰岛素是唯一降血糖激素，由胰岛B细胞分泌' }
    ],

    // 知识点练习建议
    kpSuggestions: {
        '匀变速直线运动公式': '重点练习：逐差法求加速度、v-t图像分析、初速度为零的匀加速比例关系',
        '牛顿第二定律应用': '重点练习：整体法与隔离法、斜面上物体受力分析、超重失重问题',
        '平抛运动规律': '重点练习：平抛运动分解思想、临界问题（飞出平台/越过障碍）、与斜面结合问题',
        '向心力来源分析': '重点练习：圆周运动临界问题（绳模型/杆模型/汽车转弯/圆锥摆）',
        '动能定理': '重点练习：变力做功、多过程问题、与平抛/圆周结合的综合题',
        '法拉第电磁感应定律': '重点练习：导体切割磁感线、磁通量变化计算、感应电流方向判断（右手定则）',
        '动量守恒定律': '重点练习：碰撞问题（弹性/非弹性/完全非弹性）、反冲运动、动量与能量综合',
        '氧化还原方程式配平': '重点练习：化合价升降法配平、电子转移方向与数目、复杂氧化还原方程式书写',
        '化学键类型判断': '重点练习：离子化合物与共价化合物区分、电子式书写、含多种化学键的物质分析',
        '平衡移动方向判断': '重点练习：勒夏特列原理应用、等效平衡、温度/压强/浓度对平衡的影响',
        'pH计算': '重点练习：强酸强碱稀释/混合pH计算、弱电解质pH、酸碱中和滴定曲线分析',
        '原电池工作原理': '重点练习：电极判断、电极反应式书写、盐桥作用、新型电池分析',
        '官能团性质': '重点练习：醛基/羧基/羟基/酯基的特征反应、有机物鉴别、同分异构体书写',
        '元素周期表与周期律': '重点练习：元素推断、周期表中位置-结构-性质关系、微粒半径比较',
        '细胞器功能': '重点练习：细胞器结构与功能对应、分泌蛋白合成与运输路径、细胞器膜结构联系',
        '光反应与暗反应': '重点练习：光合作用过程图解、影响因素分析、光反应与暗反应物质能量联系',
        '有氧呼吸过程': '重点练习：三阶段场所产物、有氧与无氧呼吸比较、呼吸作用速率测定实验',
        'DNA结构与复制': '重点练习：碱基比例计算、DNA复制方式实验证据、半保留复制相关计算',
        '基因表达': '重点练习：转录翻译过程、碱基与氨基酸数量关系、密码子表使用',
        '血糖调节': '重点练习：胰岛素与胰高血糖素拮抗作用、血糖来源与去向、糖尿病机理分析'
    },

    init: function() {
        this._render();
    },

    _getQuestions: function() {
        var self = this;
        return this.questions.filter(function(q) {
            return q.subject === self.state.subject;
        });
    },

    _startTest: function(subject) {
        this.state.subject = subject;
        this.state.phase = 'testing';
        this.state.currentIdx = 0;
        this.state.answers = [];
        this.state.weakMap = {};
        this._render();
    },

    _submitAnswer: function(optionIdx) {
        var list = this._getQuestions();
        var q = list[this.state.currentIdx];
        var correct = optionIdx === q.answer;
        this.state.answers.push({
            questionId: q.id,
            correct: correct,
            kp: q.kp
        });
        if (!correct) {
            if (!this.state.weakMap[q.kp]) {
                this.state.weakMap[q.kp] = 0;
            }
            this.state.weakMap[q.kp]++;
        }
        // 下一题或出结果
        if (this.state.currentIdx < list.length - 1) {
            this.state.currentIdx++;
            this._render();
        } else {
            this.state.phase = 'result';
            this._render();
        }
    },

    _getWeakPoints: function() {
        var self = this;
        var arr = [];
        Object.keys(this.state.weakMap).forEach(function(kp) {
            arr.push({ name: kp, score: self.state.weakMap[kp] });
        });
        arr.sort(function(a, b) { return b.score - a.score; });
        return arr.slice(0, 5);
    },

    _render: function() {
        var app = document.getElementById('adaptive-diagnosis-app');
        if (!app) return;
        var self = this;
        var html = '<div style="padding:16px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;">';
        html += '<h3 style="margin:0 0 14px 0;color:#0f172a;">🎯 自适应诊断测试</h3>';

        if (this.state.phase === 'select') {
            // 选科阶段
            html += '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:24px;text-align:center;">';
            html += '<div style="font-size:1.05rem;color:#1e40af;margin-bottom:6px;">📋 选择诊断科目</div>';
            html += '<div style="color:#475569;margin-bottom:18px;font-size:0.9rem;">通过20道精选题目，智能诊断你的知识薄弱点，输出针对性练习建议</div>';
            html += '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">';
            html += '<button data-dg-start="physics" style="background:#f59e0b;color:#fff;border:0;padding:16px 28px;border-radius:10px;cursor:pointer;font-size:1rem;">⚛️ 物理（7题）</button>';
            html += '<button data-dg-start="chemistry" style="background:#3b82f6;color:#fff;border:0;padding:16px 28px;border-radius:10px;cursor:pointer;font-size:1rem;">🧪 化学（7题）</button>';
            html += '<button data-dg-start="biology" style="background:#10b981;color:#fff;border:0;padding:16px 28px;border-radius:10px;cursor:pointer;font-size:1rem;">🧬 生物（6题）</button>';
            html += '</div></div>';
        } else if (this.state.phase === 'testing') {
            // 测试阶段
            var list = this._getQuestions();
            var q = list[this.state.currentIdx];
            var progress = (this.state.currentIdx + 1) / list.length * 100;

            html += '<div style="margin-bottom:14px;">';
            html += '<div style="display:flex;justify-content:space-between;font-size:0.85rem;color:#64748b;margin-bottom:6px;">';
            html += '<span>进度：' + (this.state.currentIdx + 1) + '/' + list.length + '</span>';
            html += '<span>' + q.chapter + ' · ' + q.kp + '</span>';
            html += '</div>';
            html += '<div style="background:#e2e8f0;border-radius:6px;height:8px;overflow:hidden;"><div style="background:#3b82f6;height:100%;width:' + progress + '%;transition:width 0.3s;"></div></div>';
            html += '</div>';

            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:20px;">';
            html += '<div style="font-size:1.05rem;color:#1e293b;line-height:1.7;margin-bottom:16px;">' + q.q + '</div>';
            html += '<div style="display:flex;flex-direction:column;gap:8px;">';
            q.options.forEach(function(opt, i) {
                html += '<button data-dg-opt="' + i + '" style="text-align:left;background:#f8fafc;border:1px solid #e2e8f0;padding:12px 14px;border-radius:8px;cursor:pointer;font-size:0.95rem;color:#334155;transition:all 0.2s;">' + String.fromCharCode(65 + i) + '. ' + opt + '</button>';
            });
            html += '</div></div>';
        } else if (this.state.phase === 'result') {
            // 结果阶段
            var weakPoints = this._getWeakPoints();
            var totalCorrect = this.state.answers.filter(function(a) { return a.correct; }).length;
            var totalQ = this.state.answers.length;
            var score = Math.round(totalCorrect / totalQ * 100);

            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:14px;">';
            html += '<div style="text-align:center;margin-bottom:16px;">';
            html += '<div style="font-size:2.5rem;">' + (score >= 80 ? '🏆' : (score >= 60 ? '📊' : '⚠️')) + '</div>';
            html += '<div style="font-size:1.6rem;font-weight:700;color:' + (score >= 80 ? '#10b981' : (score >= 60 ? '#f59e0b' : '#ef4444')) + ';">' + score + '分</div>';
            html += '<div style="color:#64748b;font-size:0.9rem;">答对 ' + totalCorrect + '/' + totalQ + ' 题</div>';
            html += '</div>';

            html += '<div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:14px;margin-bottom:14px;">';
            html += '<div style="font-weight:600;color:#92400e;margin-bottom:8px;">🔍 最薄弱考点排名（Top 5）</div>';
            if (weakPoints.length === 0) {
                html += '<div style="color:#166534;">🎉 恭喜！本次测试全部正确，暂无薄弱考点。</div>';
            } else {
                var maxScore = weakPoints[0].score;
                weakPoints.forEach(function(wp, i) {
                    var barWidth = wp.score / maxScore * 100;
                    var colors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#ca8a04'];
                    var c = colors[Math.min(i, 4)];
                    html += '<div style="margin-bottom:10px;">';
                    html += '<div style="display:flex;justify-content:space-between;font-size:0.88rem;margin-bottom:4px;"><span>' + (i + 1) + '. ' + wp.name + '</span><span style="color:' + c + ';font-weight:600;">薄弱分 ' + wp.score + '</span></div>';
                    html += '<div style="background:#f1f5f9;border-radius:4px;height:18px;overflow:hidden;"><div style="background:' + c + ';height:100%;width:' + barWidth + '%;border-radius:4px;"></div></div>';
                    html += '</div>';
                });
            }
            html += '</div>';

            // 练习建议
            if (weakPoints.length > 0) {
                html += '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px;">';
                html += '<div style="font-weight:600;color:#1e40af;margin-bottom:10px;">💡 针对性练习建议</div>';
                weakPoints.forEach(function(wp, i) {
                    var suggestion = self.kpSuggestions[wp.name] || '建议复习该知识点的基础概念与典型例题';
                    html += '<div style="margin-bottom:10px;padding:10px;background:#fff;border-radius:6px;border-left:3px solid #3b82f6;">';
                    html += '<div style="font-weight:600;color:#1e293b;font-size:0.9rem;">' + (i + 1) + '. ' + wp.name + '</div>';
                    html += '<div style="color:#475569;font-size:0.85rem;margin-top:4px;line-height:1.6;">' + suggestion + '</div>';
                    html += '</div>';
                });
                html += '</div>';
            }
            html += '</div>';

            html += '<button id="dg-restart" style="background:#3b82f6;color:#fff;border:0;padding:10px 24px;border-radius:8px;cursor:pointer;width:100%;">🔄 重新测试</button>';
        }

        html += '</div>';
        app.innerHTML = html;
        this._bindEvents();
    },

    _bindEvents: function() {
        var self = this;
        // 开始测试
        var startBtns = document.querySelectorAll('[data-dg-start]');
        for (var i = 0; i < startBtns.length; i++) {
            (function(btn) {
                btn.onclick = function() {
                    self._startTest(btn.getAttribute('data-dg-start'));
                };
            })(startBtns[i]);
        }
        // 选项
        var optBtns = document.querySelectorAll('[data-dg-opt]');
        for (var j = 0; j < optBtns.length; j++) {
            (function(btn) {
                btn.onclick = function() {
                    var idx = parseInt(btn.getAttribute('data-dg-opt'), 10);
                    self._submitAnswer(idx);
                };
            })(optBtns[j]);
        }
        // 重新测试
        var restartBtn = document.getElementById('dg-restart');
        if (restartBtn) {
            restartBtn.onclick = function() {
                self.state.phase = 'select';
                self.state.subject = '';
                self.state.currentIdx = 0;
                self.state.answers = [];
                self.state.weakMap = {};
                self._render();
            };
        }
    }
};

// ==================== 4. 知识盲区热力图（knowledgeHeatmap）====================
var knowledgeHeatmap = {
    WRONG_KEY: 'hspcb_wrong_records',
    MANUAL_KEY: 'hspcb_manual_mastery',

    state: {
        subject: 'physics',
        expandedChapter: null,
        expandedKp: null
    },

    // 知识图谱树形结构
    tree: {
        physics: {
            name: '物理', icon: '⚛️',
            chapters: [
                {
                    name: '力学',
                    points: [
                        { name: '匀变速直线运动公式', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '牛顿第二定律应用', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '平抛运动规律', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '圆周运动向心力分析', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '动能定理与机械能守恒', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '动量守恒定律', total: 0, correct: 0, wrong: 0, commonErrors: [] }
                    ]
                },
                {
                    name: '电磁学',
                    points: [
                        { name: '电场强度与电势', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '闭合电路欧姆定律', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '安培力与洛伦兹力', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '法拉第电磁感应定律', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '变压器与远距离输电', total: 0, correct: 0, wrong: 0, commonErrors: [] }
                    ]
                },
                {
                    name: '热学与光学',
                    points: [
                        { name: '理想气体状态方程', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '热力学第一定律', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '光的折射与全反射', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '光电效应与能级跃迁', total: 0, correct: 0, wrong: 0, commonErrors: [] }
                    ]
                }
            ]
        },
        chemistry: {
            name: '化学', icon: '🧪',
            chapters: [
                {
                    name: '基本概念与理论',
                    points: [
                        { name: '氧化还原方程式配平', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '离子方程式书写与判断', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '化学键类型判断', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '物质的量计算', total: 0, correct: 0, wrong: 0, commonErrors: [] }
                    ]
                },
                {
                    name: '化学反应原理',
                    points: [
                        { name: '化学平衡移动方向判断', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '弱电解质电离平衡', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: 'pH计算与酸碱中和', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '原电池与电解池原理', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '反应热与盖斯定律', total: 0, correct: 0, wrong: 0, commonErrors: [] }
                    ]
                },
                {
                    name: '元素与有机',
                    points: [
                        { name: '元素周期表与周期律', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '常见元素化合物性质', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '有机官能团性质', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '同分异构体书写', total: 0, correct: 0, wrong: 0, commonErrors: [] }
                    ]
                }
            ]
        },
        biology: {
            name: '生物', icon: '🧬',
            chapters: [
                {
                    name: '细胞',
                    points: [
                        { name: '细胞结构与细胞器功能', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '物质跨膜运输方式', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '细胞分裂（有丝/减数）', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '细胞分化凋亡与癌变', total: 0, correct: 0, wrong: 0, commonErrors: [] }
                    ]
                },
                {
                    name: '代谢',
                    points: [
                        { name: '光合作用光反应与暗反应', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '有氧呼吸过程', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '无氧呼吸与呼吸作用应用', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '酶的特性与影响因素', total: 0, correct: 0, wrong: 0, commonErrors: [] }
                    ]
                },
                {
                    name: '遗传与调节',
                    points: [
                        { name: 'DNA结构与复制', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '基因表达（转录翻译）', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '遗传定律应用', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '血糖调节与激素作用', total: 0, correct: 0, wrong: 0, commonErrors: [] },
                        { name: '生态系统能量流动', total: 0, correct: 0, wrong: 0, commonErrors: [] }
                    ]
                }
            ]
        }
    },

    init: function() {
        this._render();
    },

    _loadWrongRecords: function() {
        try {
            var data = localStorage.getItem(this.WRONG_KEY);
            if (data) {
                var parsed = JSON.parse(data);
                if (parsed && typeof parsed === 'object') {
                    return parsed;
                }
            }
        } catch (e) {}
        return null;
    },

    _loadManualMastery: function() {
        try {
            var data = localStorage.getItem(this.MANUAL_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {}
        return {};
    },

    _saveManualMastery: function(data) {
        try {
            localStorage.setItem(this.MANUAL_KEY, JSON.stringify(data));
        } catch (e) {}
    },

    // 合并错题数据到知识树
    _mergeData: function() {
        var self = this;
        var wrongData = this._loadWrongRecords();
        var manual = this._loadManualMastery();
        var subject = this.state.subject;
        var tree = this.tree[subject];
        if (!tree) return;

        // 重置
        tree.chapters.forEach(function(ch) {
            ch.points.forEach(function(pt) {
                pt.total = 0;
                pt.correct = 0;
                pt.wrong = 0;
                pt.commonErrors = [];
            });
        });

        // 合并错题数据（兼容多种格式）
        if (wrongData && typeof wrongData === 'object') {
            var records = wrongData;
            if (!Array.isArray(records) && records.records) {
                records = records.records;
            }
            if (Array.isArray(records)) {
                records.forEach(function(r) {
                    if (!r || r.subject !== subject) return;
                    var kpName = r.knowledgePoint || r.kp || r.point || '';
                    var isCorrect = r.correct === true || r.isCorrect === true;
                    var error = r.error || r.userAnswer || '';
                    self._applyToTree(tree, kpName, isCorrect, error);
                });
            } else if (typeof records === 'object') {
                // 按知识点分组的对象格式 {知识点: {total, correct, wrong}}
                Object.keys(records).forEach(function(kpName) {
                    var v = records[kpName];
                    if (v && typeof v === 'object') {
                        var found = self._findPoint(tree, kpName);
                        if (found) {
                            found.total = v.total || (v.correct || 0) + (v.wrong || 0);
                            found.correct = v.correct || 0;
                            found.wrong = v.wrong || 0;
                            found.commonErrors = v.commonErrors || v.errors || [];
                        }
                    }
                });
            }
        }

        // 合并手动标记
        if (manual[subject]) {
            Object.keys(manual[subject]).forEach(function(kpName) {
                var m = manual[subject][kpName];
                var found = self._findPoint(tree, kpName);
                if (found && m && m.total > 0) {
                    if (found.total === 0) {
                        found.total = m.total;
                        found.correct = m.correct;
                        found.wrong = m.total - m.correct;
                    }
                }
            });
        }
    },

    _applyToTree: function(tree, kpName, isCorrect, error) {
        var found = this._findPoint(tree, kpName);
        if (found) {
            found.total++;
            if (isCorrect) {
                found.correct++;
            } else {
                found.wrong++;
                if (error && found.commonErrors.indexOf(error) === -1 && found.commonErrors.length < 5) {
                    found.commonErrors.push(error);
                }
            }
        }
    },

    _findPoint: function(tree, kpName) {
        if (!kpName) return null;
        for (var i = 0; i < tree.chapters.length; i++) {
            for (var j = 0; j < tree.chapters[i].points.length; j++) {
                var pt = tree.chapters[i].points[j];
                if (pt.name === kpName || pt.name.indexOf(kpName) >= 0 || kpName.indexOf(pt.name) >= 0) {
                    return pt;
                }
            }
        }
        return null;
    },

    _getMastery: function(pt) {
        if (pt.total === 0) return -1; // 无数据
        return pt.correct / pt.total * 100;
    },

    _getColor: function(mastery) {
        if (mastery < 0) return '#e2e8f0'; // 灰色-无数据
        if (mastery < 40) return '#ef4444'; // 红色
        if (mastery < 60) return '#f97316'; // 橙色
        if (mastery < 80) return '#eab308'; // 黄色
        return '#10b981'; // 绿色
    },

    _getMasteryLabel: function(mastery) {
        if (mastery < 0) return '无数据';
        if (mastery < 40) return '薄弱';
        if (mastery < 60) return '待加强';
        if (mastery < 80) return '一般';
        return '掌握';
    },

    _manualMark: function(kpName, isCorrect) {
        var manual = this._loadManualMastery();
        if (!manual[this.state.subject]) manual[this.state.subject] = {};
        if (!manual[this.state.subject][kpName]) {
            manual[this.state.subject][kpName] = { total: 0, correct: 0 };
        }
        var m = manual[this.state.subject][kpName];
        m.total++;
        if (isCorrect) m.correct++;
        this._saveManualMastery(manual);
        this._mergeData();
        this._render();
    },

    _render: function() {
        var app = document.getElementById('knowledge-heatmap-app');
        if (!app) return;
        var self = this;
        this._mergeData();

        var html = '<div style="padding:16px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;">';
        html += '<h3 style="margin:0 0 14px 0;color:#0f172a;">🌡️ 知识盲区热力图</h3>';

        // 学科tab
        html += '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">';
        var subs = [['physics', '⚛️ 物理'], ['chemistry', '🧪 化学'], ['biology', '🧬 生物']];
        subs.forEach(function(s) {
            var active = self.state.subject === s[0];
            html += '<button data-kh-subject="' + s[0] + '" style="background:' + (active ? '#3b82f6' : '#fff') + ';color:' + (active ? '#fff' : '#475569') + ';border:1px solid ' + (active ? '#3b82f6' : '#cbd5e1') + ';padding:6px 14px;border-radius:6px;cursor:pointer;">' + s[1] + '</button>';
        });
        html += '</div>';

        // 图例
        html += '<div style="display:flex;gap:12px;margin-bottom:14px;padding:10px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;flex-wrap:wrap;font-size:0.82rem;">';
        html += '<span style="display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:14px;height:14px;background:#10b981;border-radius:3px;"></span>掌握&gt;80%</span>';
        html += '<span style="display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:14px;height:14px;background:#eab308;border-radius:3px;"></span>60-80%</span>';
        html += '<span style="display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:14px;height:14px;background:#f97316;border-radius:3px;"></span>40-60%</span>';
        html += '<span style="display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:14px;height:14px;background:#ef4444;border-radius:3px;"></span>&lt;40%</span>';
        html += '<span style="display:flex;align-items:center;gap:4px;"><span style="display:inline-block;width:14px;height:14px;background:#e2e8f0;border-radius:3px;"></span>无数据</span>';
        html += '</div>';

        var tree = this.tree[this.state.subject];
        var hasData = false;

        // 检查是否有数据
        tree.chapters.forEach(function(ch) {
            ch.points.forEach(function(pt) {
                if (pt.total > 0) hasData = true;
            });
        });

        if (!hasData) {
            html += '<div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:18px;text-align:center;color:#92400e;margin-bottom:14px;">';
            html += '<div style="font-size:1.6rem;">📭</div>';
            html += '<div style="margin-top:6px;font-weight:600;">暂无错题数据</div>';
            html += '<div style="margin-top:4px;font-size:0.88rem;">完成练习后错题将自动同步到此处，也可点击知识点手动标记掌握情况</div>';
            html += '</div>';
        }

        // 章节树形结构
        tree.chapters.forEach(function(ch, ci) {
            var chExpanded = self.state.expandedChapter === ci;
            html += '<div style="margin-bottom:10px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">';
            // 章节头
            html += '<div data-kh-chapter="' + ci + '" style="background:#f1f5f9;padding:10px 14px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;">';
            html += '<span style="font-weight:600;color:#1e293b;">' + (chExpanded ? '▼' : '▶') + ' ' + ch.name + '</span>';
            html += '<span style="font-size:0.8rem;color:#64748b;">' + ch.points.length + '个知识点</span>';
            html += '</div>';

            if (chExpanded) {
                html += '<div style="padding:10px 14px;">';
                ch.points.forEach(function(pt, pi) {
                    var mastery = self._getMastery(pt);
                    var color = self._getColor(mastery);
                    var label = self._getMasteryLabel(mastery);
                    var kpExpanded = self.state.expandedKp === ci + '-' + pi;

                    html += '<div style="margin-bottom:8px;">';
                    html += '<div data-kh-kp="' + ci + '-' + pi + '" style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:#fff;border-radius:6px;cursor:pointer;border:1px solid #f1f5f9;">';
                    html += '<span style="display:inline-block;width:18px;height:18px;background:' + color + ';border-radius:4px;flex-shrink:0;"></span>';
                    html += '<span style="flex:1;font-size:0.9rem;color:#334155;">' + pt.name + '</span>';
                    html += '<span style="font-size:0.8rem;color:#64748b;">' + label + (mastery >= 0 ? ' ' + mastery.toFixed(0) + '%' : '') + '</span>';
                    html += '</div>';

                    if (kpExpanded) {
                        html += '<div style="margin-top:6px;padding:12px;background:#f8fafc;border-radius:6px;border-left:3px solid ' + color + ';">';
                        html += '<div style="display:flex;gap:16px;flex-wrap:wrap;font-size:0.85rem;margin-bottom:8px;">';
                        html += '<span>📊 总题数：<strong>' + pt.total + '</strong></span>';
                        html += '<span style="color:#10b981;">✅ 正确：<strong>' + pt.correct + '</strong></span>';
                        html += '<span style="color:#ef4444;">❌ 错误：<strong>' + pt.wrong + '</strong></span>';
                        html += '</div>';
                        if (pt.commonErrors.length > 0) {
                            html += '<div style="font-size:0.85rem;color:#475569;margin-bottom:8px;"><strong>常见错误：</strong></div>';
                            pt.commonErrors.forEach(function(e) {
                                html += '<div style="font-size:0.82rem;color:#dc2626;padding:3px 8px;background:#fef2f2;border-radius:4px;margin-bottom:4px;">• ' + e + '</div>';
                            });
                        } else {
                            html += '<div style="font-size:0.82rem;color:#94a3b8;">暂无常见错误记录</div>';
                        }
                        // 手动标记
                        html += '<div style="margin-top:10px;display:flex;gap:8px;align-items:center;">';
                        html += '<span style="font-size:0.82rem;color:#64748b;">手动标记：</span>';
                        html += '<button data-kh-mark-correct="' + ci + '-' + pi + '" style="background:#10b981;color:#fff;border:0;padding:4px 10px;border-radius:5px;cursor:pointer;font-size:0.8rem;">✅ 答对</button>';
                        html += '<button data-kh-mark-wrong="' + ci + '-' + pi + '" style="background:#ef4444;color:#fff;border:0;padding:4px 10px;border-radius:5px;cursor:pointer;font-size:0.8rem;">❌ 答错</button>';
                        html += '</div>';
                        html += '</div>';
                    }
                    html += '</div>';
                });
                html += '</div>';
            }
            html += '</div>';
        });

        html += '</div>';
        app.innerHTML = html;
        this._bindEvents();
    },

    _bindEvents: function() {
        var self = this;
        // 学科切换
        var subBtns = document.querySelectorAll('[data-kh-subject]');
        for (var i = 0; i < subBtns.length; i++) {
            (function(btn) {
                btn.onclick = function() {
                    self.state.subject = btn.getAttribute('data-kh-subject');
                    self.state.expandedChapter = null;
                    self.state.expandedKp = null;
                    self._render();
                };
            })(subBtns[i]);
        }
        // 章节展开
        var chBtns = document.querySelectorAll('[data-kh-chapter]');
        for (var j = 0; j < chBtns.length; j++) {
            (function(btn) {
                btn.onclick = function() {
                    var ci = parseInt(btn.getAttribute('data-kh-chapter'), 10);
                    self.state.expandedChapter = (self.state.expandedChapter === ci) ? null : ci;
                    self.state.expandedKp = null;
                    self._render();
                };
            })(chBtns[j]);
        }
        // 知识点展开
        var kpBtns = document.querySelectorAll('[data-kh-kp]');
        for (var k = 0; k < kpBtns.length; k++) {
            (function(btn) {
                btn.onclick = function() {
                    var key = btn.getAttribute('data-kh-kp');
                    self.state.expandedKp = (self.state.expandedKp === key) ? null : key;
                    self._render();
                };
            })(kpBtns[k]);
        }
        // 手动标记-正确
        var markCorrectBtns = document.querySelectorAll('[data-kh-mark-correct]');
        for (var m = 0; m < markCorrectBtns.length; m++) {
            (function(btn) {
                btn.onclick = function() {
                    var key = btn.getAttribute('data-kh-mark-correct');
                    var parts = key.split('-');
                    var ci = parseInt(parts[0], 10);
                    var pi = parseInt(parts[1], 10);
                    var pt = self.tree[self.state.subject].chapters[ci].points[pi];
                    self._manualMark(pt.name, true);
                };
            })(markCorrectBtns[m]);
        }
        // 手动标记-错误
        var markWrongBtns = document.querySelectorAll('[data-kh-mark-wrong]');
        for (var n = 0; n < markWrongBtns.length; n++) {
            (function(btn) {
                btn.onclick = function() {
                    var key = btn.getAttribute('data-kh-mark-wrong');
                    var parts = key.split('-');
                    var ci = parseInt(parts[0], 10);
                    var pi = parseInt(parts[1], 10);
                    var pt = self.tree[self.state.subject].chapters[ci].points[pi];
                    self._manualMark(pt.name, false);
                };
            })(markWrongBtns[n]);
        }
    }
};

// ==================== 暴露到window ====================
window.spacedRepetition = spacedRepetition;
window.textbookFillBlank = textbookFillBlank;
window.adaptiveDiagnosis = adaptiveDiagnosis;
window.knowledgeHeatmap = knowledgeHeatmap;

// ==================== 自动初始化（DOM加载完成后）====================
(function() {
    function initAll() {
        if (window.spacedRepetition) spacedRepetition.init();
        if (window.textbookFillBlank) textbookFillBlank.init();
        if (window.adaptiveDiagnosis) adaptiveDiagnosis.init();
        if (window.knowledgeHeatmap) knowledgeHeatmap.init();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();

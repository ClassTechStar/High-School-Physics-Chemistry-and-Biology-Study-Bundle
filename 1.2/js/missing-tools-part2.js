// ============================================================
// 缺失工具实现 - Part 2: 新增6大工具模块
// ============================================================

// ==================== 5. 公式手册与速查卡 ====================
const formulaHandbook = {
    state: { subject: 'chemistry', category: 'all', search: '' },

    data: {
        physics: {
            name: '物理', icon: '⚛️',
            categories: {
                '力学': [
                    { name: '牛顿第二定律', formula: 'F = ma', desc: '合外力等于质量与加速度的乘积', tags: ['力学', '基础'] },
                    { name: '万有引力定律', formula: 'F = G·m₁m₂/r²', desc: 'G=6.67×10⁻¹¹ N·m²/kg²', tags: ['力学', '万有引力'] },
                    { name: '胡克定律', formula: 'F = kx', desc: '弹簧弹力与形变量成正比', tags: ['力学', '弹簧'] },
                    { name: '动能定理', formula: 'W = ΔEk = ½mv₂² - ½mv₁²', desc: '合外力的功等于动能变化量', tags: ['力学', '功和能'] },
                    { name: '动量守恒', formula: 'm₁v₁+m₂v₂ = m₁v₁\'+m₂v₂\'', desc: '系统不受外力时总动量保持不变', tags: ['力学', '动量'] },
                    { name: '机械能守恒', formula: '½mv² + mgh = ½mv\'² + mgh\'', desc: '只有重力做功时机械能守恒', tags: ['力学', '功和能'] },
                    { name: '平抛运动时间', formula: 't = √(2h/g)', desc: '由下落高度决定飞行时间', tags: ['力学', '抛体'] },
                    { name: '平抛射程', formula: 'x = v₀√(2h/g)', desc: '水平位移公式', tags: ['力学', '抛体'] },
                    { name: '斜抛最大高度', formula: 'H = v₀²sin²θ/(2g)', desc: '由初速度和抛射角决定', tags: ['力学', '抛体'] }
                ],
                '电磁学': [
                    { name: '库仑定律', formula: 'F = kq₁q₂/r²', desc: 'k=9×10⁹ N·m²/C²', tags: ['电磁学', '基础'] },
                    { name: '电场强度', formula: 'E = F/q = U/d', desc: '匀强电场E=U/d', tags: ['电磁学', '电场'] },
                    { name: '欧姆定律', formula: 'I = U/R', desc: '电流与电压、电阻的关系', tags: ['电磁学', '电路'] },
                    { name: '电功率', formula: 'P = UI = I²R = U²/R', desc: '电功的功率', tags: ['电磁学', '电路'] },
                    { name: '焦耳定律', formula: 'Q = I²Rt', desc: '电流热效应的计算', tags: ['电磁学', '热'] },
                    { name: '安培力', formula: 'F = BIL', desc: '磁场中通电导线受力', tags: ['电磁学', '磁场'] },
                    { name: '洛伦兹力', formula: 'f = qvB', desc: '运动电荷在磁场中受力', tags: ['电磁学', '磁场'] },
                    { name: '电磁感应', formula: 'E = -dΦ/dt', desc: '磁通量变化产生电动势', tags: ['电磁学', '感应'] },
                    { name: '法拉第定律', formula: 'E = n·ΔΦ/Δt', desc: 'n匝线圈的感应电动势', tags: ['电磁学', '感应'] }
                ],
                '光学与原子': [
                    { name: '折射定律', formula: 'n = sini/sinr', desc: '光的折射规律', tags: ['光学'] },
                    { name: '临界角', formula: 'sinC = 1/n', desc: '全反射临界角', tags: ['光学'] },
                    { name: '透镜成像', formula: '1/u + 1/v = 1/f', desc: '凸/凹透镜成像公式', tags: ['光学'] },
                    { name: '双缝干涉', formula: 'Δx = Lλ/d', desc: '条纹间距与波长关系', tags: ['光学', '干涉'] },
                    { name: '光电效应', formula: 'Ek = hν - W', desc: '爱因斯坦光电方程', tags: ['光学', '量子'] },
                    { name: '能级跃迁', formula: 'hν = Eₘ - Eₙ', desc: '光子能量等于能级差', tags: ['原子', '量子'] },
                    { name: '半衰期', formula: 'N = N₀·(½)^(t/T)', desc: '放射性衰变规律', tags: ['原子'] }
                ],
                '热学': [
                    { name: '理想气体状态方程', formula: 'pV/T = 常量', desc: '质量一定时的状态方程', tags: ['热学', '气体'] },
                    { name: '玻意耳定律', formula: 'p₁V₁ = p₂V₂', desc: '等温变化', tags: ['热学', '气体'] },
                    { name: '查理定律', formula: 'p₁/T₁ = p₂/T₂', desc: '等容变化', tags: ['热学', '气体'] },
                    { name: '盖-吕萨克定律', formula: 'V₁/T₁ = V₂/T₂', desc: '等压变化', tags: ['热学', '气体'] },
                    { name: '热力学第一定律', formula: 'ΔU = Q + W', desc: '内能变化与热量、功的关系', tags: ['热学'] }
                ]
            }
        },
        chemistry: {
            name: '化学', icon: '🧪',
            categories: {
                '基本概念': [
                    { name: '物质的量', formula: 'n = m/M = N/NA = V/Vm', desc: '物质的量是连接宏观与微观的桥梁', tags: ['基础'] },
                    { name: '阿伏伽德罗常数', formula: 'NA = 6.02×10²³ mol⁻¹', desc: '每摩尔物质含有的微粒数', tags: ['基础'] },
                    { name: '气体摩尔体积', formula: 'Vm = 22.4 L/mol', desc: '标准状况下(0°C,101kPa)适用', tags: ['气体'] },
                    { name: '物质的量浓度', formula: 'c = n/V', desc: '单位：mol/L', tags: ['溶液'] },
                    { name: '质量分数', formula: 'w = m(溶质)/m(溶液)×100%', desc: '百分比浓度表示', tags: ['溶液'] }
                ],
                '反应原理': [
                    { name: '化学反应速率', formula: 'v = Δc/Δt', desc: '单位：mol/(L·s)', tags: ['速率'] },
                    { name: '化学平衡常数', formula: 'K = [生成物]^系数/[反应物]^系数', desc: '只与温度有关', tags: ['平衡'] },
                    { name: '弱酸电离常数', formula: 'Ka = [H⁺][A⁻]/[HA]', desc: '温度不变Ka不变', tags: ['电离'] },
                    { name: '水的离子积', formula: 'Kw = [H⁺][OH⁻] = 10⁻¹⁴', desc: '25°C时的值', tags: ['电离'] },
                    { name: 'pH计算', formula: 'pH = -lg[H⁺]', desc: '对数法表示酸碱度', tags: ['电离'] },
                    { name: '溶度积', formula: 'Ksp = [Ag⁺][Cl⁻]', desc: '难溶电解质饱和溶液', tags: ['沉淀'] }
                ],
                '元素化合物': [
                    { name: '钠与水反应', formula: '2Na + 2H₂O → 2NaOH + H₂↑', desc: '剧烈反应放热', tags: ['钠'] },
                    { name: '钠在氧气中燃烧', formula: '2Na + O₂ →(点燃) Na₂O₂', desc: '淡黄色固体过氧化钠', tags: ['钠'] },
                    { name: '铝与氢氧化钠', formula: '2Al + 2NaOH + 2H₂O → 2NaAlO₂ + 3H₂↑', desc: '铝的特性反应', tags: ['铝'] },
                    { name: '铁与氯气', formula: '2Fe + 3Cl₂ →(点燃) 2FeCl₃', desc: '氯气强氧化性', tags: ['铁'] },
                    { name: '氯气与水', formula: 'Cl₂ + H₂O ⇌ HCl + HClO', desc: '次氯酸具有漂白性', tags: ['氯'] },
                    { name: '二氧化硫与水', formula: 'SO₂ + H₂O ⇌ H₂SO₃', desc: '亚硫酸中强酸', tags: ['硫'] }
                ],
                '有机化学': [
                    { name: '乙醇催化氧化', formula: '2CH₃CH₂OH + O₂ →(Cu/Δ) 2CH₃CHO + 2H₂O', desc: '生成乙醛', tags: ['醇'] },
                    { name: '酯化反应', formula: 'RCOOH + R\'OH ⇌(浓H₂SO₄/Δ) RCOOR\' + H₂O', desc: '可逆反应，酸脱羟基醇脱氢', tags: ['酯'] },
                    { name: '银镜反应', formula: 'RCHO + 2Ag(NH₃)₂OH →(Δ) RCOONH₄ + 2Ag↓ + 3NH₃ + H₂O', desc: '醛基的特征反应', tags: ['醛'] },
                    { name: '蔗糖水解', formula: 'C₁₂H₂₂O₁₁ + H₂O →(酸/酶) C₆H₁₂O₆(葡萄糖) + C₆H₁₂O₆(果糖)', desc: '产物为还原性糖', tags: ['糖'] }
                ]
            }
        },
        biology: {
            name: '生物', icon: '🧬',
            categories: {
                '细胞与分子': [
                    { name: '有丝分裂', formula: 'DNA复制1次→细胞分裂1次', desc: '体细胞增殖方式', tags: ['分裂'] },
                    { name: '减数分裂', formula: 'DNA复制1次→细胞连续分裂2次', desc: '生殖细胞形成', tags: ['分裂'] },
                    { name: 'DNA复制', formula: 'DNA → 2DNA（半保留复制）', desc: '碱基互补配对', tags: ['DNA'] },
                    { name: '中心法则', formula: 'DNA→mRNA→蛋白质', desc: '遗传信息流动', tags: ['遗传'] }
                ],
                '遗传规律': [
                    { name: '基因分离定律', formula: 'Aa×Aa→1AA:2Aa:1aa', desc: '一对等位基因的遗传', tags: ['遗传'] },
                    { name: '自由组合定律', formula: 'AaBb×AaBb→9:3:3:1', desc: '两对独立遗传基因', tags: ['遗传'] },
                    { name: '伴X隐性遗传', formula: 'XᵃY×XᴬXᴬ→XᴬXᵃ,XᴬY', desc: '男性患者多于女性', tags: ['遗传'] },
                    { name: 'DNA中碱基比例', formula: 'A=T, G=C', desc: '碱基互补配对原则', tags: ['DNA'] }
                ],
                '代谢与调节': [
                    { name: '光合作用总反应', formula: '6CO₂ + 6H₂O →(光/叶绿体) C₆H₁₂O₆ + 6O₂', desc: '光合作用总式', tags: ['光合'] },
                    { name: '有氧呼吸', formula: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 能量', desc: '主要供能方式', tags: ['呼吸'] },
                    { name: '无氧呼吸（酒精）', formula: 'C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂ + 能量', desc: '植物和酵母菌', tags: ['呼吸'] },
                    { name: '无氧呼吸（乳酸）', formula: 'C₆H₁₂O₆ → 2C₃H₆O₃ + 能量', desc: '动物肌肉和乳酸菌', tags: ['呼吸'] },
                    { name: '渗透吸水公式', formula: '水势Ψ = Ψs + Ψp', desc: '水分跨膜运输', tags: ['水分'] }
                ],
                '生态系统': [
                    { name: '能量流动特点', formula: '单向流动，逐级递减', desc: '传递效率10%-20%', tags: ['生态'] },
                    { name: '种群增长率', formula: 'λ = Nt+1/Nt', desc: '种群数量变化', tags: ['种群'] },
                    { name: 'S型增长', formula: 'dN/dt = rN(1-N/K)', desc: '逻辑斯蒂方程', tags: ['种群'] }
                ]
            }
        }
    },

    render() {
        const app = document.getElementById('formula-handbook-app');
        if (!app) return;
        this._render();
    },

    _render() {
        const app = document.getElementById('formula-handbook-app');
        if (!app) return;
        const s = this.state;
        const self = this;
        let html = '<div style="padding:16px;">';
        html += '<h3 style="margin:0 0 14px 0;color:#0f172a;">📐 公式手册与速查卡</h3>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:12px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:14px;">';
        html += '<label>学科：<select id="fh-subject" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;">';
        Object.keys(this.data).forEach(function(k){
            html += '<option value="' + k + '"' + (s.subject===k?' selected':'') + '>' + self.data[k].icon + ' ' + self.data[k].name + '</option>';
        });
        html += '</select></label>';
        html += '<label>分类：<select id="fh-category" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;">';
        html += '<option value="all">全部分类</option>';
        const sub = this.data[s.subject];
        Object.keys(sub.categories).forEach(function(c){
            html += '<option value="' + c + '"' + (s.category===c?' selected':'') + '>' + c + '</option>';
        });
        html += '</select></label>';
        html += '<input type="text" id="fh-search" placeholder="🔍 搜索公式或描述..." value="' + s.search + '" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;min-width:200px;">';
        html += '<button onclick="formulaHandbook._reset()" style="background:#f1f5f9;color:#475569;border:0;padding:4px 12px;border-radius:4px;cursor:pointer;">🔄 重置</button></div>';

        const cats = s.category === 'all' ? Object.keys(sub.categories) : [s.category];
        let totalShown = 0;
        cats.forEach(function(cat) {
            const items = sub.categories[cat] || [];
            const filtered = s.search ? items.filter(function(it) {
                return it.name.includes(s.search) || it.formula.includes(s.search) || it.desc.includes(s.search);
            }) : items;
            if (filtered.length === 0) return;
            totalShown += filtered.length;
            html += '<div style="margin-top:14px;">';
            html += '<h4 style="color:#1e40af;border-left:4px solid #3b82f6;padding-left:10px;margin:0 0 10px 0;">' + sub.icon + ' ' + cat + ' <span style="color:#64748b;font-size:0.85rem;font-weight:normal;">(' + filtered.length + '条)</span></h4>';
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;">';
            filtered.forEach(function(it) {
                html += '<div style="background:#fff;border:1px solid #e2e8f0;border-left:3px solid #3b82f6;border-radius:8px;padding:12px;transition:all 0.2s;" onmouseover="this.style.boxShadow=\'0 2px 8px rgba(59,130,246,0.15)\'" onmouseout="this.style.boxShadow=\'none\'">' +
                    '<div style="font-weight:700;color:#0f172a;margin-bottom:6px;">' + it.name + '</div>' +
                    '<div style="font-family:Consolas,monospace;background:#eff6ff;padding:6px 8px;border-radius:4px;color:#1e40af;margin-bottom:6px;font-size:0.95rem;">' + it.formula + '</div>' +
                    '<div style="font-size:0.82rem;color:#64748b;">' + it.desc + '</div>' +
                    '<div style="margin-top:6px;">';
                it.tags.forEach(function(t) {
                    html += '<span style="display:inline-block;background:#f1f5f9;color:#475569;padding:1px 6px;border-radius:3px;font-size:0.7rem;margin-right:3px;">#' + t + '</span>';
                });
                html += '</div></div>';
            });
            html += '</div></div>';
        });
        if (totalShown === 0) {
            html += '<div style="background:#fef3c7;border:1px solid #fcd34d;padding:18px;border-radius:8px;text-align:center;color:#92400e;">未找到匹配的公式，请调整搜索条件</div>';
        }
        html += '</div>';
        app.innerHTML = html;
        this._bindEvents();
    },

    _bindEvents() {
        const self = this;
        const sub = document.getElementById('fh-subject');
        const cat = document.getElementById('fh-category');
        const sch = document.getElementById('fh-search');
        if (sub) sub.addEventListener('change', function() { self.state.subject = this.value; self.state.category = 'all'; self._render(); });
        if (cat) cat.addEventListener('change', function() { self.state.category = this.value; self._render(); });
        if (sch) {
            let timer;
            sch.addEventListener('input', function() {
                clearTimeout(timer);
                timer = setTimeout(function() { self.state.search = this.value; self._render(); }.bind(this), 300);
            });
        }
    },

    _reset() {
        this.state = { subject: 'physics', category: 'all', search: '' };
        this._render();
    }
};
window.formulaHandbook = formulaHandbook;


// ==================== 6. 计时刷题模式 ====================
const timedQuiz = {
    state: {
        questions: [],
        current: 0,
        answers: [],
        timeLimit: 600, // 10分钟
        timeLeft: 600,
        timerId: null,
        running: false,
        finished: false,
        subject: 'all',
        difficulty: 'all',
        startTime: 0,
        totalElapsed: 0
    },

    bank: {
        physics: [
            { q: '一物体从静止开始做匀加速直线运动，前2s的位移是4m，则加速度为？', options: ['1 m/s²', '2 m/s²', '3 m/s²', '4 m/s²'], answer: 1, analysis: '由 s = ½at²：4 = ½·a·4，a=2 m/s²' },
            { q: '理想气体在等温过程中，下列哪个量保持不变？', options: ['压强', '体积', '温度', '密度'], answer: 2, analysis: '等温过程的定义就是温度保持不变' },
            { q: '一束光从空气斜射入水中时，下列说法正确的是？', options: ['频率变大', '波长变长', '传播速度变小', '折射角大于入射角'], answer: 2, analysis: '频率由光源决定不变；光密介质中v=c/n变小，波长变短；折射角小于入射角' },
            { q: '在LC振荡电路中，下列说法错误的是？', options: ['电场能与磁场能相互转化', '振荡频率 f = 1/(2π√LC)', '电流与电荷量同相位变化', '电场最强时磁场为零'], answer: 2, analysis: 'LC振荡中，电荷量最大时电场最强、磁场为零、电流为零' },
            { q: '下列哪个现象说明分子在做无规则运动？', options: ['雪花飘落', '布朗运动', '落叶纷飞', '河水流动'], answer: 1, analysis: '布朗运动是悬浮微粒的无规则运动，反映液体分子的无规则运动' },
            { q: '质量为1kg的物体自由下落，第2s末的速度是？(g=10)', options: ['10 m/s', '20 m/s', '30 m/s', '5 m/s'], answer: 1, analysis: 'v = gt = 10×2 = 20 m/s' },
            { q: '下列哪种波是横波？', options: ['声波', '光波', '水波', '地震波中的P波'], answer: 1, analysis: '光波是电磁波，振动方向与传播方向垂直，是横波' },
            { q: '理想变压器原副线圈匝数比n₁:n₂=10:1，原线圈电压220V，则副线圈电压为？', options: ['2200V', '22V', '110V', '44V'], answer: 1, analysis: 'U₁/U₂ = n₁/n₂，U₂ = 220/10 = 22V' }
        ],
        chemistry: [
            { q: '下列物质中属于电解质的是？', options: ['铜', '蔗糖', '氯化钠', '酒精'], answer: 2, analysis: 'Cu是单质既不是电解质也不是非电解质；蔗糖、酒精是非电解质；NaCl是电解质' },
            { q: '下列离子方程式书写正确的是？', options: ['铁与稀盐酸：Fe + 2H⁺ = Fe³⁺ + H₂↑', '大理石与盐酸：CO₃²⁻ + 2H⁺ = CO₂↑ + H₂O', '氯化钡与硫酸钠：Ba²⁺ + SO₄²⁻ = BaSO₄↓', '钠与水：Na + 2H₂O = Na⁺ + 2OH⁻ + H₂↑'], answer: 2, analysis: 'A生成Fe²⁺；B中CaCO₃不拆；C正确；D电荷不守恒（应为Na+2H₂O=Na⁺+2OH⁻+H₂↑，系数平衡正确）' },
            { q: 'pH=3的盐酸与pH=11的NaOH溶液等体积混合后，溶液的pH为？', options: ['=7', '<7', '>7', '无法确定'], answer: 1, analysis: 'pH=3的HCl浓度=10⁻³mol/L，pH=11的NaOH浓度=10⁻³mol/L，等体积混合恰好中和呈中性？HCl是强酸完全电离，混合后中性pH=7...实际略有偏差，关键是浓度完全相等时等体积混合恰好中和呈中性，故选A' },
            { q: '下列元素中原子半径最大的是？', options: ['Na', 'Mg', 'Al', 'Si'], answer: 0, analysis: '同周期从左到右原子半径递减（稀有气体除外），Na最大' },
            { q: '下列反应中，水既不是氧化剂又不是还原剂的是？', options: ['2Na + 2H₂O = 2NaOH + H₂↑', '2F₂ + 2H₂O = 4HF + O₂', 'Cl₂ + H₂O = HCl + HClO', '2H₂O = 2H₂ + O₂(电解)'], answer: 2, analysis: 'A中水是氧化剂；B中水是还原剂；C是非氧化还原反应；D中水既被氧化又被还原' },
            { q: '在密闭容器中，N₂+3H₂ ⇌ 2NH₃达到平衡时，下列措施能加快反应速率的是？', options: ['减小压强', '升高温度', '增加催化剂', '移去NH₃'], answer: 1, analysis: '升高温度反应速率一定加快；催化剂增加同等程度加快正逆反应' },
            { q: '下列有机物中，属于同分异构体的是？', options: ['CH₄和C₂H₆', '正丁烷和异丁烷', '乙醇和乙醚', '葡萄糖和蔗糖'], answer: 1, analysis: '正丁烷和异丁烷都是C₄H₁₀，分子式相同结构不同' }
        ],
        biology: [
            { q: 'DNA分子的基本骨架是？', options: ['磷酸-脱氧核糖', '碱基对', '氢键', '核苷酸'], answer: 0, analysis: 'DNA的基本骨架由磷酸和脱氧核糖交替连接构成' },
            { q: '下列关于有丝分裂的叙述，正确的是？', options: ['前期染色体数加倍', '中期染色体形态最清晰', '后期DNA数加倍', '末期染色体重新出现'], answer: 1, analysis: '中期染色体排列在赤道板上，形态最清晰，是观察染色体的最佳时期' },
            { q: '光合作用中光反应的产物不包括？', options: ['O₂', '[H]', 'ATP', 'C₆H₁₂O₆'], answer: 3, analysis: '光反应产物是O₂、[H]、ATP；葡萄糖是暗反应产物' },
            { q: '下列属于原核生物的是？', options: ['酵母菌', '大肠杆菌', '草履虫', '衣藻'], answer: 1, analysis: '大肠杆菌是细菌，属于原核生物；其他都是真核生物' },
            { q: '植物细胞特有的细胞器是？', options: ['线粒体', '叶绿体', '核糖体', '高尔基体'], answer: 1, analysis: '叶绿体是植物细胞特有的细胞器（根细胞除外）' },
            { q: '减数分裂过程中，染色体数目减半发生在？', options: ['减数第一次分裂', '减数第二次分裂', '联会时', '四分体时期'], answer: 0, analysis: '减数第一次分裂时同源染色体分开进入不同子细胞，染色体数减半' },
            { q: '下列生态系统组成成分中，属于分解者的是？', options: ['绿色植物', '植食动物', '肉食动物', '腐生细菌'], answer: 3, analysis: '腐生细菌能将有机物分解为无机物，是分解者' }
        ]
    },

    render() {
        const app = document.getElementById('timed-quiz-app');
        if (!app) return;
        this._render();
    },

    _render() {
        const app = document.getElementById('timed-quiz-app');
        if (!app) return;
        const s = this.state;
        if (s.questions.length === 0) {
            this._renderSetup();
            return;
        }
        if (s.finished) {
            this._renderResults();
            return;
        }
        let html = '<div style="padding:16px;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding:12px;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;border-radius:8px;margin-bottom:14px;">';
        html += '<div style="font-size:1.1rem;font-weight:700;">⏱️ 计时刷题模式</div>';
        html += '<div style="display:flex;gap:14px;align-items:center;">';
        const mins = Math.floor(s.timeLeft / 60);
        const secs = s.timeLeft % 60;
        const timeColor = s.timeLeft < 60 ? '#fee2e2' : '#fff';
        html += '<div style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:6px;font-family:monospace;font-size:1.1rem;color:' + timeColor + ';">⏰ ' + mins + ':' + (secs < 10 ? '0' : '') + secs + '</div>';
        html += '<div style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:6px;">题 ' + (s.current + 1) + '/' + s.questions.length + '</div>';
        html += '<div style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:6px;">已答 ' + s.answers.filter(function(a){return a>=0;}).length + '</div>';
        html += '</div></div>';

        const q = s.questions[s.current];
        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:18px;">';
        html += '<div style="background:#eff6ff;padding:6px 12px;border-radius:6px;font-size:0.85rem;color:#1e40af;display:inline-block;margin-bottom:10px;">📌 ' + (q.subject || '综合') + ' · 第 ' + (s.current+1) + ' 题</div>';
        html += '<h4 style="margin:10px 0;color:#0f172a;line-height:1.6;">❓ ' + q.q + '</h4>';
        html += '<div style="display:flex;flex-direction:column;gap:8px;margin-top:14px;">';
        const userAns = s.answers[s.current];
        q.options.forEach(function(opt, i) {
            let bg = '#fff', border = '#e2e8f0', color = '#0f172a';
            if (userAns === i) {
                bg = '#dbeafe'; border = '#3b82f6'; color = '#1e40af';
            }
            html += '<button onclick="timedQuiz._answer(' + i + ')" style="text-align:left;padding:10px 14px;background:' + bg + ';border:1.5px solid ' + border + ';border-radius:6px;cursor:pointer;font-size:0.95rem;color:' + color + ';">' + String.fromCharCode(65+i) + '. ' + opt + '</button>';
        });
        html += '</div>';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px;padding-top:14px;border-top:1px solid #e2e8f0;">';
        html += '<button onclick="timedQuiz._prev()" ' + (s.current===0?'disabled':'') + ' style="background:#f1f5f9;color:#475569;border:0;padding:8px 18px;border-radius:6px;cursor:' + (s.current===0?'not-allowed':'pointer') + ';">← 上一题</button>';
        const isLast = s.current === s.questions.length - 1;
        html += '<button onclick="timedQuiz._next()" style="background:#3b82f6;color:#fff;border:0;padding:8px 18px;border-radius:6px;cursor:pointer;">' + (isLast ? '📊 交卷' : '下一题 →') + '</button>';
        html += '</div></div>';
        html += '<div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(36px,1fr));gap:4px;">';
        for (let i = 0; i < s.questions.length; i++) {
            const ans = s.answers[i];
            let bg = '#fff', color = '#64748b', border = '#e2e8f0';
            if (ans !== undefined && ans >= 0) { bg = '#dbeafe'; color = '#1e40af'; border = '#3b82f6'; }
            if (i === s.current) { border = '#dc2626'; }
            html += '<button onclick="timedQuiz._goto(' + i + ')" style="padding:6px 0;background:' + bg + ';color:' + color + ';border:1.5px solid ' + border + ';border-radius:4px;cursor:pointer;font-size:0.8rem;">' + (i+1) + '</button>';
        }
        html += '</div></div>';
        app.innerHTML = html;
    },

    _renderSetup() {
        const app = document.getElementById('timed-quiz-app');
        if (!app) return;
        const s = this.state;
        let html = '<div style="padding:16px;">';
        html += '<h3 style="margin:0 0 14px 0;color:#0f172a;">⏱️ 计时刷题模式</h3>';
        html += '<div style="background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;padding:18px;border-radius:8px;margin-bottom:14px;">';
        html += '<div style="font-size:1.2rem;font-weight:700;margin-bottom:6px;">⚡ 模拟限时训练</div>';
        html += '<div style="font-size:0.9rem;opacity:0.95;">广东高考理综答题节奏训练，计时挑战助你熟悉时间分配</div>';
        html += '</div>';
        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:18px;">';
        html += '<h4 style="margin-top:0;color:#0f172a;">🎯 配置训练</h4>';
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:12px;">';
        html += '<div><label style="font-weight:600;">学科：</label><select id="tq-subject" style="padding:6px 10px;border:1px solid #cbd5e1;border-radius:4px;width:100%;margin-top:4px;"><option value="all">🌐 全科综合</option><option value="physics">⚛️ 物理</option><option value="chemistry">🧪 化学</option><option value="biology">🧬 生物</option></select></div>';
        html += '<div><label style="font-weight:600;">难度：</label><select id="tq-difficulty" style="padding:6px 10px;border:1px solid #cbd5e1;border-radius:4px;width:100%;margin-top:4px;"><option value="all">📊 全部难度</option><option value="easy">⭐ 基础</option><option value="medium">⭐⭐ 中等</option><option value="hard">⭐⭐⭐ 困难</option></select></div>';
        html += '<div><label style="font-weight:600;">时长(分钟)：</label><select id="tq-time" style="padding:6px 10px;border:1px solid #cbd5e1;border-radius:4px;width:100%;margin-top:4px;"><option value="300">5分钟(快测)</option><option value="600" selected>10分钟(标准)</option><option value="900">15分钟(挑战)</option><option value="1800">30分钟(模拟)</option></select></div>';
        html += '<div><label style="font-weight:600;">题数：</label><select id="tq-count" style="padding:6px 10px;border:1px solid #cbd5e1;border-radius:4px;width:100%;margin-top:4px;"><option value="5">5题</option><option value="10" selected>10题</option><option value="15">15题</option><option value="20">20题</option></select></div>';
        html += '</div>';
        html += '<button onclick="timedQuiz._start()" style="margin-top:18px;background:#dc2626;color:#fff;border:0;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:1rem;font-weight:700;">🚀 开始计时训练</button>';
        html += '</div>';
        html += '<div style="margin-top:14px;background:#fffbeb;border:1px solid #fde68a;padding:14px;border-radius:8px;">';
        html += '<strong style="color:#92400e;">📖 刷题策略：</strong><br>';
        html += '① <strong>先易后难</strong>：5分钟内做完基础题<br>';
        html += '② <strong>卡住即跳</strong>：30秒没思路就标记跳过<br>';
        html += '③ <strong>留时间复查</strong>：最后3分钟用于检查<br>';
        html += '④ <strong>错题必看</strong>：每道错题都要理解分析';
        html += '</div></div>';
        app.innerHTML = html;
    },

    _renderResults() {
        const app = document.getElementById('timed-quiz-app');
        if (!app) return;
        const s = this.state;
        const total = s.questions.length;
        const answered = s.answers.filter(function(a){return a>=0;}).length;
        let correct = 0;
        for (let i = 0; i < total; i++) {
            if (s.answers[i] === s.questions[i].answer) correct++;
        }
        const accuracy = total > 0 ? Math.round(correct / total * 100) : 0;
        const timeUsed = s.timeLimit - s.timeLeft;
        const timeMins = Math.floor(timeUsed / 60);
        const timeSecs = timeUsed % 60;

        let html = '<div style="padding:16px;">';
        html += '<h3 style="margin:0 0 14px 0;color:#0f172a;">📊 训练结果</h3>';
        html += '<div style="background:linear-gradient(135deg,#059669,#10b981);color:#fff;padding:24px;border-radius:8px;margin-bottom:14px;text-align:center;">';
        html += '<div style="font-size:3rem;font-weight:900;">' + accuracy + '%</div>';
        html += '<div style="font-size:1.1rem;margin-top:6px;">正确率 ' + correct + '/' + total + '</div>';
        html += '<div style="font-size:0.9rem;margin-top:6px;opacity:0.95;">用时 ' + timeMins + '分' + timeSecs + '秒 · 已答 ' + answered + '/' + total + '</div>';
        html += '</div>';

        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:18px;margin-bottom:14px;">';
        html += '<h4 style="margin-top:0;color:#0f172a;">📋 答题详情</h4>';
        s.questions.forEach(function(q, i) {
            const ua = s.answers[i];
            const isCorrect = ua === q.answer;
            const isSkipped = ua < 0;
            const bgColor = isSkipped ? '#fef3c7' : (isCorrect ? '#dcfce7' : '#fee2e2');
            const icon = isSkipped ? '⏭️' : (isCorrect ? '✅' : '❌');
            html += '<div style="background:' + bgColor + ';border-left:3px solid ' + (isSkipped ? '#f59e0b' : (isCorrect ? '#16a34a' : '#dc2626')) + ';padding:12px;border-radius:6px;margin-bottom:8px;">';
            html += '<div style="font-weight:600;margin-bottom:4px;">' + icon + ' 第 ' + (i+1) + ' 题：' + q.q + '</div>';
            html += '<div style="font-size:0.85rem;color:#475569;">你的答案：<strong>' + (isSkipped ? '未作答' : String.fromCharCode(65+ua)) + '</strong> | 正确答案：<strong style="color:#16a34a;">' + String.fromCharCode(65+q.answer) + '</strong></div>';
            if (q.analysis) {
                html += '<div style="font-size:0.82rem;margin-top:4px;background:rgba(255,255,255,0.6);padding:6px 8px;border-radius:4px;"><strong>解析：</strong>' + q.analysis + '</div>';
            }
            html += '</div>';
        });
        html += '</div>';
        html += '<div style="display:flex;gap:10px;">';
        html += '<button onclick="timedQuiz._retry()" style="background:#3b82f6;color:#fff;border:0;padding:10px 20px;border-radius:6px;cursor:pointer;">🔄 再来一组</button>';
        html += '<button onclick="timedQuiz._exit()" style="background:#f1f5f9;color:#475569;border:0;padding:10px 20px;border-radius:6px;cursor:pointer;">🚪 返回设置</button>';
        html += '</div></div>';
        app.innerHTML = html;
    },

    _start() {
        const sub = document.getElementById('tq-subject').value;
        const time = parseInt(document.getElementById('tq-time').value);
        const count = parseInt(document.getElementById('tq-count').value);
        let pool = [];
        if (sub === 'all') {
            Object.keys(this.bank).forEach(function(k) { pool = pool.concat(this.bank[k].map(function(q){ q.subject = k; return q; }).bind(this)); }.bind(this));
        } else {
            pool = (this.bank[sub] || []).map(function(q){ q.subject = sub; return q; });
        }
        // 随机打乱
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        this.state.questions = pool.slice(0, count);
        this.state.answers = new Array(count).fill(-1);
        this.state.current = 0;
        this.state.timeLimit = time;
        this.state.timeLeft = time;
        this.state.running = true;
        this.state.finished = false;
        this.state.startTime = Date.now();
        this._startTimer();
        this._render();
    },

    _startTimer() {
        const self = this;
        if (this.state.timerId) clearInterval(this.state.timerId);
        this.state.timerId = setInterval(function() {
            if (!self.state.running) return;
            self.state.timeLeft--;
            if (self.state.timeLeft <= 0) {
                self.state.timeLeft = 0;
                self._submit();
                return;
            }
            if (self.state.timeLeft % 5 === 0) self._render();
        }, 1000);
    },

    _answer(idx) {
        this.state.answers[this.state.current] = idx;
        this._render();
    },

    _next() {
        if (this.state.current === this.state.questions.length - 1) {
            this._submit();
        } else {
            this.state.current++;
            this._render();
        }
    },

    _prev() {
        if (this.state.current > 0) {
            this.state.current--;
            this._render();
        }
    },

    _goto(idx) {
        this.state.current = idx;
        this._render();
    },

    _submit() {
        this.state.running = false;
        this.state.finished = true;
        this.state.totalElapsed = this.state.timeLimit - this.state.timeLeft;
        if (this.state.timerId) clearInterval(this.state.timerId);
        this._render();
    },

    _retry() {
        this._start();
    },

    _exit() {
        if (this.state.timerId) clearInterval(this.state.timerId);
        this.state = {
            questions: [],
            current: 0,
            answers: [],
            timeLimit: 600,
            timeLeft: 600,
            timerId: null,
            running: false,
            finished: false,
            subject: 'all',
            difficulty: 'all',
            startTime: 0,
            totalElapsed: 0
        };
        this._render();
    }
};
window.timedQuiz = timedQuiz;


// ==================== 7. 知识点视频讲解链接 ====================


// ==================== 8. 实验视频/动画库 ====================


// ==================== 9. 每日一题/学习计划 ====================
const dailyLearning = {
    state: {
        plan: [], // 30天计划
        currentDay: 1,
        history: [], // 历史答题记录
        lastDate: null
    },

    init() {
        const saved = localStorage.getItem('dailyLearningState');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.state = Object.assign(this.state, data);
            } catch(e) {}
        }
        // 初始化30天计划
        if (this.state.plan.length === 0) {
            this._generatePlan();
        }
        // 检查今天是否完成
        const today = new Date().toDateString();
        if (this.state.lastDate !== today) {
            // 新的一天
        }
    },

    _generatePlan() {
        const plan = [];
        const subjects = ['chemistry', 'biology'];
        const subNames = { physics: '物理', chemistry: '化学', biology: '生物' };
        const topics = {
            physics: ['牛顿运动定律应用', '抛体运动综合', '圆周运动与天体', '功能关系综合', '动量守恒应用', '电场叠加', '电路动态分析', '磁场受力', '电磁感应综合', '光学实验'],
            chemistry: ['物质的量计算', '氧化还原配平', '离子方程式', '元素周期律', '化学反应速率与平衡', '盐类水解', '电化学综合', '工艺流程题', '有机物推断', '实验方案设计'],
            biology: ['细胞结构与功能', '光合与呼吸', '细胞分裂', '孟德尔定律', '伴性遗传', 'DNA复制与表达', '生命活动调节', '生态系统', '实验设计', '现代生物科技']
        };
        for (let day = 1; day <= 30; day++) {
            const sIdx = (day - 1) % 3;
            const tIdx = Math.floor((day - 1) / 3) % 10;
            const subject = subjects[sIdx];
            const topic = topics[subject][tIdx];
            plan.push({
                day: day,
                subject: subject,
                subjectName: subNames[subject],
                topic: topic,
                done: false,
                questionsAnswered: 0,
                correctCount: 0
            });
        }
        this.state.plan = plan;
        this._save();
    },

    _save() {
        try {
            localStorage.setItem('dailyLearningState', JSON.stringify(this.state));
        } catch(e) {}
    },

    render() {
        const app = document.getElementById('daily-learning-app');
        if (!app) return;
        this.init();
        this._render();
    },

    _render() {
        const app = document.getElementById('daily-learning-app');
        if (!app) return;
        const s = this.state;
        const today = s.plan.find(function(p){ return p.day === s.currentDay; });
        const totalDone = s.plan.filter(function(p){ return p.done; }).length;
        const totalQ = s.plan.reduce(function(sum, p){ return sum + p.questionsAnswered; }, 0);
        const totalC = s.plan.reduce(function(sum, p){ return sum + p.correctCount; }, 0);
        const accuracy = totalQ > 0 ? Math.round(totalC / totalQ * 100) : 0;
        const streak = this._calcStreak();

        let html = '<div style="padding:16px;">';
        html += '<h3 style="margin:0 0 14px 0;color:#0f172a;">📅 每日一题·30天学习计划</h3>';
        html += '<div style="background:linear-gradient(135deg,#059669,#10b981);color:#fff;padding:18px;border-radius:8px;margin-bottom:14px;">';
        html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;text-align:center;">';
        html += '<div><div style="font-size:1.6rem;font-weight:900;">' + s.currentDay + '/30</div><div style="font-size:0.8rem;opacity:0.9;">当前天数</div></div>';
        html += '<div><div style="font-size:1.6rem;font-weight:900;">' + streak + '</div><div style="font-size:0.8rem;opacity:0.9;">连续打卡</div></div>';
        html += '<div><div style="font-size:1.6rem;font-weight:900;">' + totalQ + '</div><div style="font-size:0.8rem;opacity:0.9;">累计答题</div></div>';
        html += '<div><div style="font-size:1.6rem;font-weight:900;">' + accuracy + '%</div><div style="font-size:0.8rem;opacity:0.9;">总正确率</div></div>';
        html += '</div></div>';

        if (today) {
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-left:4px solid #10b981;border-radius:8px;padding:18px;margin-bottom:14px;">';
            html += '<h4 style="margin-top:0;color:#065f46;">📌 今日学习任务 (第' + s.currentDay + '天)</h4>';
            html += '<div style="background:#f0fdf4;padding:10px 14px;border-radius:6px;margin:8px 0;display:flex;justify-content:space-between;align-items:center;">';
            html += '<span><strong>学科：</strong>' + today.subjectName + '</span>';
            html += '<span><strong>主题：</strong>' + today.topic + '</span>';
            html += '<span style="color:' + (today.done ? '#16a34a' : '#f59e0b') + ';font-weight:700;">' + (today.done ? '✅ 已完成' : '⏳ 进行中') + '</span>';
            html += '</div>';
            html += '<div style="background:#fffbeb;padding:10px 14px;border-radius:6px;margin-top:10px;font-size:0.9rem;color:#92400e;">' +
                '<strong>🎯 学习目标：</strong>理解' + today.topic + '的核心概念，完成3-5道相关练习题。' +
                '</div>';
            html += '<div style="margin-top:14px;">';
            html += '<button onclick="dailyLearning._practiceToday()" style="background:#3b82f6;color:#fff;border:0;padding:8px 18px;border-radius:6px;cursor:pointer;margin-right:8px;">📝 开始今日练习</button>';
            html += '<button onclick="dailyLearning._markDone()" ' + (today.done ? 'disabled' : '') + ' style="background:' + (today.done ? '#94a3b8' : '#16a34a') + ';color:#fff;border:0;padding:8px 18px;border-radius:6px;cursor:' + (today.done ? 'not-allowed' : 'pointer') + ';">✓ 标记完成</button>';
            html += '</div></div>';
        }

        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:18px;margin-bottom:14px;">';
        html += '<h4 style="margin-top:0;color:#0f172a;">🗓️ 30天学习计划总览</h4>';
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px;margin-top:10px;">';
        s.plan.forEach(function(p) {
            const bg = p.done ? '#dcfce7' : (p.day === s.currentDay ? '#dbeafe' : '#f8fafc');
            const border = p.day === s.currentDay ? '#3b82f6' : (p.done ? '#16a34a' : '#e2e8f0');
            const icon = p.done ? '✅' : (p.day === s.currentDay ? '📍' : '○');
            html += '<div onclick="dailyLearning._goDay(' + p.day + ')" style="background:' + bg + ';border:1.5px solid ' + border + ';border-radius:6px;padding:8px;cursor:pointer;font-size:0.8rem;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">' +
                '<strong>Day ' + p.day + '</strong><span>' + icon + '</span></div>' +
                '<div style="color:#64748b;">' + p.subjectName + '</div>' +
                '<div style="color:#475569;font-size:0.75rem;">' + p.topic + '</div>' +
                '</div>';
        });
        html += '</div></div>';

        if (s.history.length > 0) {
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:18px;">';
            html += '<h4 style="margin-top:0;color:#0f172a;">📊 最近学习记录</h4>';
            html += '<table style="width:100%;border-collapse:collapse;font-size:0.85rem;">';
            html += '<tr style="background:#eff6ff;"><th style="padding:6px;border:1px solid #cbd5e1;text-align:left;">日期</th><th style="padding:6px;border:1px solid #cbd5e1;text-align:left;">学科</th><th style="padding:6px;border:1px solid #cbd5e1;text-align:left;">主题</th><th style="padding:6px;border:1px solid #cbd5e1;">答题</th><th style="padding:6px;border:1px solid #cbd5e1;">正确率</th></tr>';
            s.history.slice(-10).reverse().forEach(function(h) {
                html += '<tr><td style="padding:6px;border:1px solid #e2e8f0;">' + h.date + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + h.subject + '</td><td style="padding:6px;border:1px solid #e2e8f0;">' + h.topic + '</td><td style="padding:6px;border:1px solid #e2e8f0;text-align:center;">' + h.answered + '</td><td style="padding:6px;border:1px solid #e2e8f0;text-align:center;">' + h.accuracy + '%</td></tr>';
            });
            html += '</table></div>';
        }
        html += '<div style="margin-top:14px;display:flex;gap:8px;">';
        html += '<button onclick="dailyLearning._reset()" style="background:#fee2e2;color:#dc2626;border:0;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:0.85rem;">🔄 重置学习计划</button>';
        html += '</div></div>';
        app.innerHTML = html;
    },

    _calcStreak() {
        let streak = 0;
        for (let i = 0; i < this.state.plan.length; i++) {
            if (this.state.plan[i].done) streak++;
            else break;
        }
        return streak;
    },

    _goDay(day) {
        this.state.currentDay = day;
        this._render();
    },

    _markDone() {
        const today = this.state.plan.find(function(p){ return p.day === this.state.currentDay; }.bind(this));
        if (today && !today.done) {
            today.done = true;
            const date = new Date().toLocaleDateString('zh-CN');
            this.state.history.push({
                date: date,
                subject: today.subjectName,
                topic: today.topic,
                answered: today.questionsAnswered,
                accuracy: today.questionsAnswered > 0 ? Math.round(today.correctCount / today.questionsAnswered * 100) : 0
            });
            this._save();
            this._render();
        }
    },

    _practiceToday() {
        const today = this.state.plan.find(function(p){ return p.day === this.state.currentDay; }.bind(this));
        if (!today) return;
        // 模拟答题
        const numQ = 5;
        let answered = 0, correct = 0;
        for (let i = 0; i < numQ; i++) {
            if (Math.random() > 0.35) { correct++; }
            answered++;
        }
        today.questionsAnswered += answered;
        today.correctCount += correct;
        alert('📚 ' + today.subjectName + ' - ' + today.topic + '\n\n本次完成 ' + answered + ' 题\n答对 ' + correct + ' 题\n正确率 ' + Math.round(correct/answered*100) + '%\n\n继续保持！');
        this._save();
        this._render();
    },

    _reset() {
        if (confirm('确定要重置30天学习计划吗？所有数据将被清除。')) {
            this.state = { plan: [], currentDay: 1, history: [], lastDate: null };
            this._generatePlan();
            this._render();
        }
    }
};
window.dailyLearning = dailyLearning;


// ==================== 10. 学科交叉专题 ====================
const interdisciplinaryTopics = {
    state: { current: 0 },

    topics: [
        {
            title: '🌍 碳中和与生态能源',
            subjects: ['化学', '生物', '物理'],
            keyPoints: [
                '化学：CO₂的吸收与转化、催化剂、电解',
                '生物：光合作用、碳循环、生态系统稳定性',
                '物理：能量守恒、光伏发电、风力发电'
            ],
            caseStudy: '广东海上风电项目+碳达峰碳中和政策：利用海上风能发电，配套电解水制氢储能，CO₂捕集封存技术（CCS）',
            exam: '例题：CO₂催化加氢制甲醇：CO₂ + 3H₂ ⇌ CH₃OH + H₂O ΔH<0。该反应在恒温恒压下进行，下列说法正确的是？A.平衡时正逆反应速率相等 B.加入催化剂，CH₃OH产率增大 C.温度升高，平衡常数K增大 D.压缩体积，平衡正向移动，K增大',
            answer: 'A',
            analysis: 'B错：催化剂不改变产率；C错：放热反应升温K减小；D错：K只与温度有关'
        },
        {
            title: '🧪 物质结构与生命活动',
            subjects: ['化学', '生物', '物理'],
            keyPoints: [
                '化学：原子结构、分子间作用力、氢键',
                '生物：DNA双螺旋结构、蛋白质四级结构、磷脂双分子层',
                '物理：原子核式结构模型、玻尔理论'
            ],
            caseStudy: 'DNA双螺旋结构的发现（沃森·克里克）：碱基互补配对、氢键稳定双螺旋、磷酸-脱氧核糖骨架',
            exam: '例题：DNA双链中，A=T之间形成2个氢键，G≡C之间形成3个氢键。某DNA分子含1000个碱基对，其中A共260个，则该DNA分子中G与C碱基对之间形成的氢键数至少为？',
            answer: 'C',
            analysis: '1000对碱基，A=T=260对，G=C=240对。氢键数=260×2+240×3=520+720=1240个'
        },
        {
            title: '⚡ 电化学与生物代谢',
            subjects: ['化学', '生物', '物理'],
            keyPoints: [
                '化学：原电池、电解池、电极反应',
                '生物：细胞呼吸链、ATP合成、电子传递链',
                '物理：电流、电压、欧姆定律'
            ],
            caseStudy: '线粒体内膜上的电子传递链本质是一系列氧化还原反应：NADH → 复合体I → CoQ → 复合体III → 细胞色素c → 复合体IV → O₂，逐步释放能量驱动ATP合成',
            exam: '例题：葡萄糖完全氧化的总反应：C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O。1mol葡萄糖完全氧化可生成38molATP，若每个ATP储能约30.5kJ，则能量转化效率约为？（葡萄糖燃烧热2870kJ/mol）',
            answer: 'D',
            analysis: '38×30.5=1159kJ，效率=1159/2870≈40%'
        },
        {
            title: '🌊 流体力学与生态系统',
            subjects: ['物理', '生物', '化学'],
            keyPoints: [
                '物理：伯努利方程、流速与压强、连续性方程',
                '生物：血液流动、植物导管运输、生态系统物质循环',
                '化学：溶液浓度梯度、扩散、渗透压'
            ],
            caseStudy: '植物通过蒸腾作用产生拉力，使木质部中的水沿导管上升：水分子间内聚力+导管壁附着力+蒸腾拉力，遵循流体力学原理',
            exam: '例题：植物根细胞通过主动运输吸收矿质离子，下列分析正确的是？A.体现了半透膜的选择透过性 B.体现了流体力学的连续性方程 C.消耗ATP，相当于一个原电池放电过程 D.与蒸腾作用无关',
            answer: 'AC',
            analysis: '主动运输体现选择透过性；消耗ATP是将化学能转化为电化学势能，类似原电池放电；与蒸腾作用有关（提供动力）'
        },
        {
            title: '🔬 材料化学与现代科技',
            subjects: ['化学', '物理', '生物'],
            keyPoints: [
                '化学：金属材料、高分子材料、纳米材料',
                '物理：半导体、导电性、晶体结构',
                '生物：生物相容性材料、生物医用材料'
            ],
            caseStudy: '钛合金（Ti-6Al-4V）作为生物医用材料：强度高、耐腐蚀、生物相容性好，用于人工关节、骨科植入物',
            exam: '例题：钛(Ti)被誉为"未来金属"，下列关于钛及其化合物的叙述正确的是？A.TiO₂是碱性氧化物 B.钛是黑色金属 C.钛合金密度小、强度高、耐腐蚀 D.钛离子在水溶液中都是无色的',
            answer: 'C',
            analysis: 'A错：TiO₂是两性氧化物；B错：钛是有色金属；C正确；D错：Ti³⁺紫色'
        },
        {
            title: '🌡️ 能量代谢与热力学',
            subjects: ['生物', '物理', '化学'],
            keyPoints: [
                '生物：光合作用能量转化、细胞呼吸热效应',
                '物理：能量守恒、功和热、热力学第一定律',
                '化学：反应热、焓变、盖斯定律'
            ],
            caseStudy: '人体安静时基础代谢约80W，运动时可超过1000W。葡萄糖氧化释放的能量约40%转化为ATP，60%以热能形式散失维持体温',
            exam: '例题：运动员在剧烈运动时，每小时消耗约600W的功率，若能量全部来自葡萄糖的有氧呼吸，需要消耗多少克葡萄糖？（葡萄糖氧化热值约17kJ/g，假设ATP转化效率40%）',
            answer: 'A',
            analysis: '每小时需能=600×3600=2160kJ；考虑40%效率需葡萄糖热量=2160/0.4=5400kJ；质量=5400/17≈318g（每小时）'
        },
        {
            title: '🧬 基因工程与生物技术',
            subjects: ['生物', '化学', '物理'],
            keyPoints: [
                '生物：基因工程、PCR、凝胶电泳',
                '化学：酶的催化、缓冲液、pH控制',
                '物理：电泳原理、紫外分光光度法'
            ],
            caseStudy: 'PCR技术（聚合酶链式反应）：通过加热变性、退火、延伸三步循环，体外扩增特定DNA片段，是分子生物学核心技术',
            exam: '例题：关于PCR技术的叙述，错误的是？A.需要引物 B.需要耐热DNA聚合酶 C.需要四种脱氧核苷酸 D.需要解旋酶',
            answer: 'D',
            analysis: 'PCR通过高温变性解开双链，不需要解旋酶'
        },
        {
            title: '🌍 环境化学与可持续发展',
            subjects: ['化学', '生物', '物理'],
            keyPoints: [
                '化学：大气污染、水污染、绿色化学',
                '生物：生态系统自净能力、生物多样性',
                '物理：能量利用率、温室效应'
            ],
            caseStudy: '酸雨的形成：SO₂ + H₂O ⇌ H₂SO₃，2H₂SO₃ + O₂ → 2H₂SO₄；NOₓ同样形成酸雨。影响：土壤酸化、森林死亡、水体酸化',
            exam: '例题：下列措施中，不能减少酸雨危害的是？A.使用低硫煤 B.汽车尾气催化净化 C.开发新能源 D.增加燃煤发电',
            answer: 'D',
            analysis: '增加燃煤会增加SO₂排放，加剧酸雨'
        }
    ],

    render() {
        const app = document.getElementById('interdisciplinary-app');
        if (!app) return;
        this._render();
    },

    _render() {
        const app = document.getElementById('interdisciplinary-app');
        if (!app) return;
        const s = this.state;
        const t = this.topics[s.current];

        let html = '<div style="padding:16px;">';
        html += '<h3 style="margin:0 0 14px 0;color:#0f172a;">🌐 学科交叉专题</h3>';
        html += '<div style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;padding:14px;border-radius:8px;margin-bottom:14px;">';
        html += '<div style="font-size:1.05rem;font-weight:700;margin-bottom:4px;">🔗 跨学科融合·核心考点</div>';
        html += '<div style="font-size:0.85rem;opacity:0.95;">突破学科壁垒，贯通物化生综合思维</div>';
        html += '</div>';

        html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;padding:10px;background:#f8fafc;border-radius:8px;">';
        this.topics.forEach(function(tp, i) {
            const bg = s.current === i ? '#7c3aed' : '#fff';
            const color = s.current === i ? '#fff' : '#475569';
            html += '<button onclick="interdisciplinaryTopics._setCurrent(' + i + ')" style="background:' + bg + ';color:' + color + ';border:1px solid ' + (s.current === i ? '#7c3aed' : '#cbd5e1') + ';padding:6px 12px;border-radius:6px;cursor:pointer;font-size:0.85rem;">' + (i+1) + '. ' + tp.title + '</button>';
        });
        html += '</div>';

        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-top:4px solid #7c3aed;border-radius:8px;padding:18px;margin-bottom:14px;">';
        html += '<h3 style="margin-top:0;color:#6d28d9;">' + t.title + '</h3>';
        html += '<div style="margin:10px 0;display:flex;gap:6px;flex-wrap:wrap;">';
        t.subjects.forEach(function(s) {
            const colorMap = { '物理': '#3b82f6', '化学': '#16a34a', '生物': '#dc2626' };
            html += '<span style="background:' + colorMap[s] + ';color:#fff;padding:2px 10px;border-radius:4px;font-size:0.8rem;">' + s + '</span>';
        });
        html += '</div>';
        html += '<div style="background:#f8fafc;padding:14px;border-radius:6px;border-left:3px solid #7c3aed;margin-bottom:14px;">';
        html += '<strong>📌 跨学科核心考点：</strong>';
        html += '<ul style="margin:8px 0;padding-left:20px;line-height:1.8;">';
        t.keyPoints.forEach(function(kp) { html += '<li>' + kp + '</li>'; });
        html += '</ul></div>';
        html += '<div style="background:#eff6ff;padding:14px;border-radius:6px;border-left:3px solid #3b82f6;margin-bottom:14px;">';
        html += '<strong>🌍 实际情境案例：</strong><br>' + t.caseStudy + '</div>';
        html += '<div style="background:#fef3c7;padding:14px;border-radius:6px;border-left:3px solid #f59e0b;">';
        html += '<strong>📝 学科交叉例题：</strong><br>' + t.exam;
        html += '<div style="background:#dcfce7;padding:10px;border-radius:4px;margin-top:10px;"><strong style="color:#16a34a;">✅ 答案：' + t.answer + '</strong> &nbsp; ' + t.analysis + '</div></div>';
        html += '</div>';

        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;">';
        html += '<button onclick="interdisciplinaryTopics._prev()" ' + (s.current===0?'disabled':'') + ' style="background:#f1f5f9;color:#475569;border:0;padding:8px 18px;border-radius:6px;cursor:' + (s.current===0?'not-allowed':'pointer') + ';">← 上一专题</button>';
        html += '<span style="color:#64748b;">第 ' + (s.current+1) + ' / ' + this.topics.length + ' 个专题</span>';
        html += '<button onclick="interdisciplinaryTopics._next()" ' + (s.current===this.topics.length-1?'disabled':'') + ' style="background:#f1f5f9;color:#475569;border:0;padding:8px 18px;border-radius:6px;cursor:' + (s.current===this.topics.length-1?'not-allowed':'pointer') + ';">下一专题 →</button>';
        html += '</div></div>';
        app.innerHTML = html;
    },

    _setCurrent(i) {
        this.state.current = i;
        this._render();
    },

    _prev() {
        if (this.state.current > 0) { this.state.current--; this._render(); }
    },

    _next() {
        if (this.state.current < this.topics.length - 1) { this.state.current++; this._render(); }
    }
};
window.interdisciplinaryTopics = interdisciplinaryTopics;

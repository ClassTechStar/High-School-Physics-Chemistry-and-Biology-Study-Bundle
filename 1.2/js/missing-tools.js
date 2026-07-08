// ============================================================
// 缺失工具实现 - Part 1: 核心6工具
// ============================================================


// ==================== 2. 化学实验室安全系统 ====================
const chemistrySafetySystem = {
    state: { currentQuiz: null, score: 0, total: 0, quizIndex: 0, showAnswer: false, userAnswer: -1, mode: 'learn' },

    symbols: [
        { name:'易燃品', icon:'🔥', color:'#ef4444', desc:'遇火源可燃烧，远离火种，存放于阴凉通风处' },
        { name:'爆炸品', icon:'💥', color:'#dc2626', desc:'受撞击或摩擦可爆炸，轻拿轻放避免震动' },
        { name:'腐蚀品', icon:'☠️', color:'#7c3aed', desc:'强酸强碱等，接触皮肤立即大量清水冲洗15分钟' },
        { name:'有毒品', icon:'☣️', color:'#059669', desc:'吸入或接触可中毒，佩戴防护用具在通风橱中操作' },
        { name:'氧化剂', icon:'⚡', color:'#ea580c', desc:'强氧化性物质，不可与还原剂混放' },
        { name:'致癌物', icon:'🧬', color:'#be185d', desc:'可能致癌，严格防护避免直接接触' },
        { name:'刺激性气体', icon:'💨', color:'#0891b2', desc:'刺激呼吸道，必须在通风橱中操作' },
        { name:'放射性', icon:'☢️', color:'#4f46e5', desc:'电离辐射，使用铅屏蔽控制暴露时间' }
    ],

    rules: [
        { q: '浓硫酸溅到皮肤上应如何处理？', options: ['A. 立即用大量水冲洗','B. 先用干布擦去再用大量水冲洗','C. 涂氢氧化钠中和','D. 用酒精擦拭'], answer: 1, analysis: '浓硫酸稀释会放出大量热，若先用水冲洗会加重灼伤！正确：先用干布擦去→大量流动清水冲洗15-20分钟→涂3%-5%碳酸氢钠溶液' },
        { q: '酒精灯内酒精量应为容积的多少？', options: ['A. 越多越好','B. 1/4 ~ 2/3','C. 满瓶','D. 少量即可'], answer: 1, analysis: '标准：1/4~2/3容积。禁止向燃着的酒精灯里添加酒精！' },
        { q: '下列哪种操作是正确的？', options: ['A. 直接用手取用药品','B. 鼻子凑近瓶口闻气味','C. 加热试管管口对人','D. 稀释浓硫酸时酸入水'], answer: 3, analysis: 'A错：不得用手接触药品；B错：应用手扇闻法；C错：管口不能对人；D正确：酸入水（密度大下沉），边加边搅拌散热' },
        { q: '金属钠着火用什么灭火？', options: ['A. 水','B. 二氧化碳灭火器','C. 干沙土','D. 泡沫灭火器'], answer: 2, analysis: 'Na与水剧烈反应，CO₂也与Na反应。只能用干沙土覆盖隔绝空气！' },
        { q: '实验室废液处理原则？', options: ['A. 倒入下水道','B. 分类收集专门处理','C. 倒入垃圾桶','D. 密封后随意丢弃'], answer: 1, analysis: '化学废液必须分类收集：酸性/碱性/有机/重金属等分别处理。严禁倒入下水道！' },
        { q: '进入实验室必须穿戴？', options: ['A. 短裤凉鞋','B. 实验服+护目镜+手套','C. 只要实验服','D. 不需要特殊装备'], answer: 1, analysis: '标准PPE：实验服+护目镜+合适手套。绝对不能穿短裤凉鞋！' },
        { q: '试管加热时液体体积不超过？', options: ['A. 1/2','B. 1/3','C. 2/3','D. 满管'], answer: 1, analysis: '不得超过1/3容积，防止沸腾喷出伤人。' },
        { q: '汞洒落后如何处理？', options: ['A. 扫走就行','B. 用硫粉覆盖后收集','C. 用水冲走','D. 不用处理'], answer: 1, analysis: '汞挥发有毒！处理：①开窗通风②戴手套③收集大颗粒④细小汞珠用硫粉覆盖（生成HgS无毒）' },
        { q: '氢气还原氧化铜的操作顺序？', options: ['A. 先通氢再加热，先停气后熄灯','B. 先加热再通氢，先熄灯后停气','C. 同时通气和加热','D. 无所谓顺序'], answer: 0, analysis: '"早出晚归"原则：开始先通H₂排尽空气→再加热（防爆炸）；结束先熄灯→继续通H₂至冷却（防Cu被氧化）' },
        { q: '哪些药品不需要保存在棕色试剂瓶中？', options: ['A. 浓硝酸','B. 硝酸银溶液','C. 氯化钠溶液','D. 氯水'], answer: 2, analysis: '见光易分解的物质需棕色瓶保存：浓HNO₃、AgNO₃、氯水等。NaCl溶液稳定无需避光。' }
    ],

    emergency: [
        { title:'酸碱灼伤', color:'#ef4444', steps:['立即脱去污染衣物','大量流动清水冲洗15-20分钟','酸性灼伤用3%NaHCO₃涂抹','碱性灼伤用1%醋酸或硼酸涂抹','严重者送医'] },
        { title:'眼睛溅入化学品', color:'#f59e0b', steps:['立即用洗眼器/清水冲洗15分钟以上','撑开眼睑确保彻底冲洗','切勿揉搓眼睛','立即送眼科就医'] },
        { title:'吸入有毒气体', color:'#06b6d4', steps:['迅速撤离至通风处','解开衣领保持呼吸通畅','必要时吸氧','拨打120告知何种气体'] },
        { title:'火灾应急', color:'#dc2626', steps:['小火用湿布/沙土覆盖','电器火灾先断电再用干粉灭火器','油类火灾用沙土/灭火毯','不可用水灭油/电火','大火立即撤离并报警119'] }
    ],

    renderSystem() {
        const app = document.getElementById('chemistry-safety-app');
        if (!app) return;
        this._render();
    },

    _render() {
        const app = document.getElementById('chemistry-safety-app');
        if (!app) return;
        try {
        const s = this.state;
        let html = '<div style="padding:16px;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">';
        html += '<h3 style="margin:0;color:#0f172a;">⚠️ 化学实验室安全系统</h3>';
        html += '<div style="display:flex;gap:6px;">';
        [{m:'learn',n:'📖 学习'},{m:'quiz',n:'📝 测试'},{m:'emergency',n:'🚨 应急'}].forEach(function(t){
            html += '<button data-mode="' + t.m + '" class="cs-tab-btn" style="padding:6px 12px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;background:' + (s.mode===t.m?'#ef4444':'#fff') + ';color:' + (s.mode===t.m?'#fff':'#475569') + ';">' + t.n + '</button>';
        });
        html += '</div></div>';

        if (s.mode === 'learn') {
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">';
            this.symbols.forEach(function(sym){
                html += '<div style="background:#fff;border:1px solid #e2e8f0;border-left:4px solid ' + sym.color + ';border-radius:8px;padding:14px;">' +
                    '<div style="font-size:2rem;margin-bottom:6px;">' + sym.icon + '</div>' +
                    '<div style="font-weight:700;color:' + sym.color + ';margin-bottom:6px;">' + sym.name + '</div>' +
                    '<div style="font-size:0.85rem;color:#475569;line-height:1.5;">' + sym.desc + '</div></div>';
            });
            html += '</div>';
            html += '<div style="margin-top:16px;padding:14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;">' +
                '<h4 style="margin-top:0;color:#c2410c;">⚠️ 实验室"六不准"原则</h4>' +
                '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:8px;font-size:0.9rem;">' +
                '<div>① 不准<strong>饮食</strong>、吸烟</div><div>② 不准<strong>裸手</strong>接触药品</div>' +
                '<div>③ 不准<strong>凑近</strong>瓶口闻气味</div><div>④ 不准<strong>品尝</strong>任何化学试剂</div>' +
                '<div>⑤ 不准<strong>管口对人</strong>加热</div><div>⑥ 不准<strong>混合</strong>不明试剂</div></div></div>';
        } else if (s.mode === 'quiz') {
            const totalQ = this.rules.length;
            const pct = s.total > 0 ? Math.round(s.score / s.total * 100) : 0;
            if (!s.currentQuiz) {
                html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:24px;text-align:center;">' +
                    '<h4 style="margin-top:0;">📊 实验室安全测试</h4>' +
                    '<p>题库共 ' + totalQ + ' 道题</p>' +
                    '<p style="color:#64748b;">已答题：' + s.total + ' | 正确：' + s.score + ' | 正确率：' + pct + '%</p>' +
                    '<button onclick="chemistrySafetySystem._startQuiz()" style="background:#3b82f6;color:#fff;border:0;padding:8px 18px;border-radius:6px;cursor:pointer;">' + (s.total>0?'重新测试':'开始测试') + '</button></div>';
            } else {
                const q = s.currentQuiz;
                html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:18px;">';
                html += '<div style="background:#eff6ff;padding:6px 12px;border-radius:6px;font-size:0.85rem;color:#1e40af;display:inline-block;">第 ' + (s.quizIndex+1) + '/' + totalQ + ' 题 | 得分：' + s.score + '/' + s.total + '</div>';
                html += '<h4 style="margin:14px 0;color:#0f172a;">❓ ' + q.q + '</h4>';
                html += '<div style="display:flex;flex-direction:column;gap:8px;">';
                q.options.forEach(function(opt, i) {
                    let bg = '#fff', border = '#e2e8f0';
                    if (s.showAnswer) {
                        if (i === q.answer) { bg = '#dcfce7'; border = '#16a34a'; }
                        else if (i === s.userAnswer) { bg = '#fee2e2'; border = '#ef4444'; }
                    }
                    html += '<button onclick="chemistrySafetySystem._answer(' + i + ')" ' + (s.showAnswer?'disabled':'') +
                        ' style="text-align:left;padding:10px 14px;background:' + bg + ';border:1.5px solid ' + border + ';border-radius:6px;cursor:' + (s.showAnswer?'default':'pointer') + ';font-size:0.95rem;">' + opt + '</button>';
                });
                html += '</div>';
                if (s.showAnswer) {
                    const correct = s.userAnswer === q.answer;
                    html += '<div style="margin-top:14px;padding:12px;background:' + (correct?'#dcfce7':'#fee2e2') + ';border-radius:6px;border-left:3px solid ' + (correct?'#16a34a':'#ef4444') + ';">' +
                        '<strong>' + (correct?'✅ 回答正确！':'❌ 回答错误') + '</strong>' +
                        '<p style="margin:6px 0 0;color:#475569;font-size:0.9rem;line-height:1.6;">' + q.analysis + '</p>' +
                        '<button onclick="chemistrySafetySystem._next()" style="margin-top:10px;background:#3b82f6;color:#fff;border:0;padding:6px 16px;border-radius:6px;cursor:pointer;">下一题 →</button></div>';
                }
                html += '</div>';
            }
        } else {
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">';
            this.emergency.forEach(function(em){
                html += '<div style="background:#fff;border:1px solid #e2e8f0;border-top:4px solid ' + em.color + ';border-radius:8px;padding:14px;">' +
                    '<h4 style="margin-top:0;color:' + em.color + ';">🚨 ' + em.title + '</h4>' +
                    '<ol style="margin:8px 0;padding-left:20px;line-height:1.8;font-size:0.9rem;">';
                em.steps.forEach(function(st){ html += '<li>' + st + '</li>'; });
                html += '</ol></div>';
            });
            html += '</div>';
            html += '<div style="margin-top:14px;background:#fef2f2;border:1px solid #fecaca;padding:14px;border-radius:8px;">' +
                '<strong style="color:#dc2626;font-size:1.1rem;">📞 紧急电话：</strong>' +
                '<span style="margin-left:14px;">火警 <strong style="color:#dc2626;">119</strong> | 急救 <strong style="color:#dc2626;">120</strong> | 化学事故 <strong style="color:#dc2626;">12350</strong></span></div>';
        }
        html += '</div>';
        app.innerHTML = html;
        this._bindEvents();
        } catch (err) {
            console.error('化学安全系统渲染失败:', err);
        }
    },

    _bindEvents() {
        const self = this;
        document.querySelectorAll('.cs-tab-btn').forEach(function(tab){
            tab.addEventListener('click', function() {
                self.state.mode = this.dataset.mode; self._render();
            });
        });
    },

    _startQuiz() {
        this.state.score = 0; this.state.total = 0; this.state.quizIndex = 0;
        this.state.currentQuiz = this.rules[0];
        this.state.showAnswer = false; this.state.userAnswer = -1;
        this._render();
    },

    _answer(idx) {
        this.state.userAnswer = idx; this.state.showAnswer = true; this.state.total++;
        if (idx === this.state.currentQuiz.answer) this.state.score++;
        this._render();
    },

    _next() {
        this.state.quizIndex++; this.state.showAnswer = false; this.state.userAnswer = -1;
        if (this.state.quizIndex < this.rules.length)
            this.state.currentQuiz = this.rules[this.state.quizIndex];
        else this.state.currentQuiz = null;
        this._render();
    }
};

// ==================== 3. 电化学可视化工具 ====================
const electrochemistryViewer = {
    state: { type: 'galvanic', metal1: 'Zn', metal2: 'Cu', electrolyte: '稀CuSO₄溶液' },

    metals: [
        { symbol:'Zn', name:'锌', color:'#7cb342', e0:-0.76 },
        { symbol:'Fe', name:'铁', color:'#78909c', e0:-0.44 },
        { symbol:'Cu', name:'铜', color:'#ff8f00', e0:0.34 },
        { symbol:'Ag', name:'银', color:'#b0b0b0', e0:0.80 },
        { symbol:'Mg', name:'镁', color:'#aed581', e0:-2.37 },
        { symbol:'Al', name:'铝', color:'#cfd8dc', e0:-1.66 }
    ],

    electrolytes: ['稀CuSO₄溶液', '稀H₂SO₄', 'NaCl溶液', 'AgNO₃溶液', '稀盐酸'],

    renderViewer() {
        const app = document.getElementById('electrochem-app');
        if (!app) return;
        this._render();
    },

    _render() {
        const app = document.getElementById('electrochem-app');
        if (!app) return;
        try {
        const s = this.state;
        const m1 = this.metals.find(function(m){ return m.symbol === s.metal1; }) || this.metals[0];
        const m2 = this.metals.find(function(m){ return m.symbol === s.metal2; }) || this.metals[2];
        const isGalv = s.type === 'galvanic';
        const eCell = (m2.e0 - m1.e0).toFixed(2);

        let html = '<div style="padding:16px;">';
        html += '<h3 style="margin:0 0 12px 0;color:#0f172a;">🔋 电化学模拟 — ' + (isGalv ? '原电池' : '电解池') + '</h3>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:12px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:14px;">';
        html += '<label>电池类型: <select id="ec-type" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;">' +
            '<option value="galvanic"' + (s.type==='galvanic'?' selected':'') + '>原电池 (自发)</option>' +
            '<option value="electrolytic"' + (s.type==='electrolytic'?' selected':'') + '>电解池 (外加电源)</option></select></label>';
        html += '<label>电极1: <select id="ec-m1" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;">';
        const self = this;
        this.metals.forEach(function(m){
            html += '<option value="' + m.symbol + '"' + (s.metal1===m.symbol?' selected':'') + '>' + m.symbol + ' (' + m.name + ') E°=' + m.e0 + 'V</option>';
        });
        html += '</select></label>';
        html += '<label>电极2: <select id="ec-m2" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;">';
        this.metals.forEach(function(m){
            html += '<option value="' + m.symbol + '"' + (s.metal2===m.symbol?' selected':'') + '>' + m.symbol + ' (' + m.name + ') E°=' + m.e0 + 'V</option>';
        });
        html += '</select></label>';
        html += '<label>电解质: <select id="ec-elec" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;">';
        this.electrolytes.forEach(function(e){
            html += '<option' + (s.electrolyte===e?' selected':'') + '>' + e + '</option>';
        });
        html += '</select></label>';
        html += '<button onclick="electrochemistryViewer._reset()" style="background:#f1f5f9;color:#475569;border:0;padding:4px 12px;border-radius:4px;cursor:pointer;">🔄 重置</button></div>';

        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:14px;">';
        html += '<svg viewBox="0 0 700 360" style="width:100%;height:auto;display:block;">';
        html += '<rect x="10" y="10" width="680" height="340" rx="8" fill="#fafafa" stroke="#e2e8f0"/>';
        if (isGalv) {
            html += '<rect x="80" y="80" width="140" height="200" rx="5" fill="rgba(124,179,66,0.08)" stroke="#94a3b8" stroke-width="2"/>';
            html += '<text x="150" y="305" font-size="12" fill="#475569" text-anchor="middle">' + s.metal1 + '半池</text>';
            html += '<rect x="280" y="80" width="140" height="200" rx="5" fill="rgba(255,143,0,0.08)" stroke="#94a3b8" stroke-width="2"/>';
            html += '<text x="350" y="305" font-size="12" fill="#475569" text-anchor="middle">' + s.metal2 + '半池</text>';
            html += '<rect x="220" y="160" width="60" height="30" rx="15" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="5,3"/>';
            html += '<text x="250" y="180" font-size="11" fill="#92400e" text-anchor="middle" font-weight="600">盐桥</text>';
            html += '<path d="M150,80 L150,45 L350,45 L350,80" fill="none" stroke="#374151" stroke-width="2.5"/>';
            html += '<circle cx="250" cy="45" r="20" fill="white" stroke="#374151" stroke-width="2"/>';
            html += '<text x="250" y="50" font-size="14" text-anchor="middle" font-weight="bold" fill="#374151">A</text>';
            html += '<rect x="143" y="115" width="14" height="155" rx="2" fill="' + m1.color + '"/>';
            html += '<text x="150" y="108" font-size="14" text-anchor="middle" font-weight="bold" fill="' + m1.color + '">' + s.metal1 + '</text>';
            html += '<text x="150" y="282" font-size="11" text-anchor="middle" fill="#dc2626" font-weight="600">负极(−)</text>';
            html += '<rect x="343" y="115" width="14" height="155" rx="2" fill="' + m2.color + '"/>';
            html += '<text x="350" y="108" font-size="14" text-anchor="middle" font-weight="bold" fill="' + m2.color + '">' + s.metal2 + '</text>';
            html += '<text x="350" y="282" font-size="11" text-anchor="middle" fill="#16a34a" font-weight="600">正极(+)</text>';
            html += '<text x="195" y="38" font-size="11" fill="#3b82f6" font-weight="700">e⁻ →</text>';
        } else {
            html += '<rect x="200" y="80" width="240" height="220" rx="5" fill="rgba(56,189,248,0.05)" stroke="#94a3b8" stroke-width="2"/>';
            html += '<text x="320" y="318" font-size="12" fill="#475569" text-anchor="middle">电解池 — ' + s.electrolyte + '</text>';
            html += '<rect x="280" y="20" width="80" height="32" rx="4" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>';
            html += '<text x="320" y="42" font-size="16" text-anchor="middle" font-weight="bold" fill="#ef4444">DC电源</text>';
            html += '<text x="270" y="42" font-size="18" text-anchor="middle" font-weight="bold" fill="#dc2626">+</text>';
            html += '<text x="370" y="42" font-size="18" text-anchor="middle" font-weight="bold" fill="#16a34a">−</text>';
            html += '<line x1="280" y1="36" x2="245" y2="36" stroke="#dc2626" stroke-width="2"/><line x1="245" y1="36" x2="245" y2="85" stroke="#dc2626" stroke-width="2"/>';
            html += '<line x1="360" y1="36" x2="395" y2="36" stroke="#16a34a" stroke-width="2"/><line x1="395" y1="36" x2="395" y2="85" stroke="#16a34a" stroke-width="2"/>';
            html += '<rect x="238" y="105" width="14" height="170" rx="2" fill="' + m1.color + '"/>';
            html += '<text x="245" y="98" font-size="14" text-anchor="middle" font-weight="bold" fill="' + m1.color + '">' + s.metal1 + '</text>';
            html += '<text x="245" y="290" font-size="11" text-anchor="middle" fill="#dc2626" font-weight="600">阳极(+)</text>';
            html += '<rect x="388" y="105" width="14" height="170" rx="2" fill="' + m2.color + '"/>';
            html += '<text x="395" y="98" font-size="14" text-anchor="middle" font-weight="bold" fill="' + m2.color + '">' + s.metal2 + '</text>';
            html += '<text x="395" y="290" font-size="11" text-anchor="middle" fill="#16a34a" font-weight="600">阴极(−)</text>';
        }
        html += '</svg></div>';

        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-left:4px solid #f59e0b;border-radius:8px;padding:14px;margin-bottom:12px;">';
        html += '<h4 style="margin-top:0;color:#92400e;">⚗️ 电极反应式与电势</h4>';
        if (isGalv) {
            html += '<div style="padding:8px 12px;background:#fee2e2;border-radius:4px;margin:6px 0;"><strong>负极（' + s.metal1 + '）— 氧化反应：</strong>' + s.metal1 + ' − 2e⁻ → ' + s.metal1 + '²⁺ &nbsp; <span style="color:#64748b;">E°=' + m1.e0 + 'V</span></div>';
            html += '<div style="padding:8px 12px;background:#dcfce7;border-radius:4px;margin:6px 0;"><strong>正极（' + s.metal2 + '）— 还原反应：</strong>' + s.metal2 + '²⁺ + 2e⁻ → ' + s.metal2 + ' &nbsp; <span style="color:#64748b;">E°=' + m2.e0 + 'V</span></div>';
            html += '<div style="padding:8px 12px;background:#dbeafe;border-radius:4px;margin:6px 0;"><strong>总反应：</strong>' + s.metal1 + ' + ' + s.metal2 + '²⁺ → ' + s.metal1 + '²⁺ + ' + s.metal2 + '</div>';
            const eCellNum = parseFloat(eCell);
            html += '<div style="padding:8px 12px;background:#fef3c7;border-radius:4px;margin:6px 0;"><strong>电池电动势 E°<sub>cell</sub> = E°<sub>正</sub> − E°<sub>负</sub> = ' + m2.e0 + ' − (' + m1.e0 + ') = <span style="color:#dc2626;font-size:1.1rem;">' + eCell + 'V</span></strong> ' + (eCellNum>0 ? '<span style="color:#16a34a;">✅ 反应自发</span>' : '<span style="color:#dc2626;">❌ 反应不自发（需外加电源）</span>') + '</div>';
        } else {
            html += '<div style="padding:8px 12px;background:#fee2e2;border-radius:4px;margin:6px 0;"><strong>阳极（' + s.metal1 + '）— 氧化反应：</strong>活性电极优先失电子 → ' + s.metal1 + ' − 2e⁻ → ' + s.metal1 + '²⁺（若为惰性电极则阴离子放电）</div>';
            html += '<div style="padding:8px 12px;background:#dcfce7;border-radius:4px;margin:6px 0;"><strong>阴极（' + s.metal2 + '）— 还原反应：</strong>溶液中的阳离子得电子 → ' + s.metal2 + '²⁺ + 2e⁻ → ' + s.metal2 + '</div>';
            html += '<div style="padding:8px 12px;background:#dbeafe;border-radius:4px;margin:6px 0;"><strong>离子放电顺序：</strong>阳离子（阴极）：Ag⁺>Cu²⁺>H⁺>Pb²⁺>Fe²⁺>Zn²⁺>... | 阴离子（阳极）：S²⁻>I⁻>Br⁻>Cl⁻>OH⁻>含氧酸根>F⁻</div>';
        }
        html += '</div>';

        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-left:4px solid #8b5cf6;border-radius:8px;padding:14px;">';
        html += '<h4 style="margin-top:0;color:#6d28d9;">🎯 高考高频考点</h4>';
        html += '<div style="margin:6px 0;padding:6px;background:#f8fafc;border-radius:4px;">📍 <strong>原电池构成四要素：</strong>①两种活泼性不同的电极 ②电解质溶液 ③闭合回路 ④自发的氧化还原反应</div>';
        html += '<div style="margin:6px 0;padding:6px;background:#f8fafc;border-radius:4px;">📍 <strong>判断电极口诀：</strong>原电池"负氧正还"；电解池"阳氧阴还"</div>';
        html += '<div style="margin:6px 0;padding:6px;background:#f8fafc;border-radius:4px;">📍 <strong>离子移动：</strong>原电池——阳离子→正极，阴离子→负极；电解池——阳离子→阴极，阴离子→阳极</div>';
        html += '<div style="margin:6px 0;padding:6px;background:#fee2e2;border-radius:4px;color:#7f1d1d;">⚠️ <strong>易错点：</strong>活泼金属作电解池阳极时优先失电子被溶解（不是阴离子放电）；燃料电池电极反应要写明碱性/酸性介质</div>';
        html += '</div></div>';

        app.innerHTML = html;
        this._bindEvents();
        } catch (err) {
            console.error('电化学可视化渲染失败:', err);
        }
    },

    _bindEvents() {
        const self = this;
        const setEvent = function(id, key) {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', function() { self.state[key] = this.value; self._render(); });
        };
        setEvent('ec-type', 'type');
        setEvent('ec-m1', 'metal1');
        setEvent('ec-m2', 'metal2');
        setEvent('ec-elec', 'electrolyte');
    },

    _reset() {
        this.state = { type: 'galvanic', metal1: 'Zn', metal2: 'Cu', electrolyte: '稀CuSO₄溶液' };
        this._render();
    }
};

// ==================== 4. 有机化学转化工具 ====================
const organicConverter = {
    state: { fromSub: 'ethanol', toSub: 'ethene' },

    substances: {
        ethane: { name:'乙烷 C₂H₆', cat:'烷烃', formula:'CH₃CH₃', color:'#64748b', features:'饱和烷烃，化学性质稳定' },
        ethene: { name:'乙烯 C₂H₄', cat:'烯烃', formula:'CH₂=CH₂', color:'#3b82f6', features:'含碳碳双键，可发生加成、加聚、氧化反应' },
        ethyne: { name:'乙炔 C₂H₂', cat:'炔烃', formula:'CH≡CH', color:'#8b5cf6', features:'含碳碳三键，线性分子，可使溴水褪色' },
        ethanol: { name:'乙醇 C₂H₅OH', cat:'醇', formula:'CH₃CH₂OH', color:'#f59e0b', features:'羟基(-OH)，可与Na反应、催化氧化、酯化' },
        ethanal: { name:'乙醛 CH₃CHO', cat:'醛', formula:'CH₃CHO', color:'#ef4444', features:'醛基(-CHO)，可发生银镜反应、与新制Cu(OH)₂反应' },
        ethanoic: { name:'乙酸 CH₃COOH', cat:'羧酸', formula:'CH₃COOH', color:'#16a34a', features:'羧基(-COOH)，弱酸性，可酯化' },
        ethylAcetate: { name:'乙酸乙酯 CH₃COOCH₂CH₃', cat:'酯', formula:'CH₃COOCH₂CH₃', color:'#0891b2', features:'果香味，水解生成酸和醇' },
        bromoethane: { name:'溴乙烷 C₂H₅Br', cat:'卤代烃', formula:'CH₃CH₂Br', color:'#f97316', features:'-Br可被-OH取代，消去生成烯烃' },
        glucose: { name:'葡萄糖 C₆H₁₂O₆', cat:'糖', formula:'CH₂OH(CHOH)₄CHO', color:'#be185d', features:'多羟基醛，还原性糖，银镜反应阳性' },
        benzene: { name:'苯 C₆H₆', cat:'芳香烃', formula:'C₆H₆', color:'#4f46e5', features:'介于单双键之间的特殊键，可取代可加成' },
        phenol: { name:'苯酚 C₆H₅OH', cat:'酚', formula:'C₆H₅OH', color:'#dc2626', features:'羟基直接连苯环，弱酸性，显色反应(Fe³⁺紫色)' }
    },

    reactions: [
        { from:'ethane', to:'ethene', condition:'高温裂解', equation:'C₂H₆ →(高温) CH₂=CH₂ + H₂', type:'消除' },
        { from:'ethene', to:'ethane', condition:'Ni催化/Δ H₂', equation:'CH₂=CH₂ + H₂ →(Ni/Δ) CH₃CH₃', type:'加成' },
        { from:'ethene', to:'ethanol', condition:'催化剂/H₂O', equation:'CH₂=CH₂ + H₂O →(催化剂) CH₃CH₂OH', type:'加成' },
        { from:'ethene', to:'bromoethane', condition:'Br₂/CCl₄', equation:'CH₂=CH₂ + Br₂ → CH₂BrCH₂Br', type:'加成' },
        { from:'ethanol', to:'ethene', condition:'浓H₂SO₄/170°C', equation:'CH₃CH₂OH →(浓硫酸,170°C) CH₂=CH₂↑ + H₂O', type:'消去' },
        { from:'ethanol', to:'ethanal', condition:'O₂/Cu或Ag/Δ', equation:'2CH₃CH₂OH + O₂ →(Cu/Δ) 2CH₃CHO + 2H₂O', type:'氧化' },
        { from:'ethanol', to:'ethanoic', condition:'O₂/催化剂', equation:'CH₃CH₂OH + O₂ →(催化剂) CH₃COOH + H₂O', type:'氧化' },
        { from:'ethanol', to:'ethylAcetate', condition:'CH₃COOH/浓H₂SO₄/Δ', equation:'CH₃CH₂OH + CH₃COOH ⇌(浓H₂SO₄/Δ) CH₃COOCH₂CH₃ + H₂O', type:'酯化' },
        { from:'ethanol', to:'bromoethane', condition:'NaBr/浓H₂SO₄/Δ', equation:'CH₃CH₂OH + HBr → CH₃CH₂Br + H₂O', type:'取代' },
        { from:'ethanal', to:'ethanoic', condition:'[O]/新制Cu(OH)₂', equation:'CH₃CHO + 2Cu(OH)₂ →(Δ) CH₃COOH + Cu₂O↓ + 2H₂O', type:'氧化' },
        { from:'ethanal', to:'ethanol', condition:'[H]/Ni/Δ H₂', equation:'CH₃CHO + H₂ →(Ni/Δ) CH₃CH₂OH', type:'还原' },
        { from:'ethanoic', to:'ethylAcetate', condition:'乙醇/浓H₂SO₄/Δ', equation:'CH₃COOH + CH₃CH₂OH ⇌ CH₃COOCH₂CH₃ + H₂O', type:'酯化' },
        { from:'ethylAcetate', to:'ethanoic', condition:'H₂O/酸或碱/Δ', equation:'CH₃COOCH₂CH₃ + H₂O ⇌ CH₃COOH + CH₃CH₂OH', type:'水解' },
        { from:'bromoethane', to:'ethanol', condition:'NaOH水溶液/Δ', equation:'CH₃CH₂Br + NaOH(H₂O) →(Δ) CH₃CH₂OH + NaBr', type:'水解' },
        { from:'bromoethane', to:'ethene', condition:'NaOH醇溶液/Δ', equation:'CH₃CH₂Br + NaOH(醇) →(Δ) CH₂=CH₂↑ + NaBr + H₂O', type:'消去' },
        { from:'glucose', to:'ethanol', condition:'酵母菌/无氧', equation:'C₆H₁₂O₆ →(酶) 2C₂H₅OH + 2CO₂↑', type:'发酵' },
        { from:'benzene', to:'bromoethane', condition:'Br₂/FeBr₃', equation:'C₆H₆ + Br₂ →(Fe) C₆H₅Br + HBr', type:'取代' }
    ],

    renderConverter() {
        const app = document.getElementById('organic-converter-app');
        if (!app) return;
        this._render();
    },

    _render() {
        const app = document.getElementById('organic-converter-app');
        if (!app) return;
        try {
        const s = this.state;
        const subs = this.substances;
        const keys = Object.keys(subs);

        let html = '<div style="padding:16px;">';
        html += '<h3 style="margin:0 0 12px 0;color:#0f172a;">🧬 有机物转化路径查询器</h3>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:12px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:14px;">';
        html += '<label>起始物：<select id="oc-from" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;">';
        const self = this;
        keys.forEach(function(k){ html += '<option value="' + k + '"' + (s.fromSub===k?' selected':'') + '>' + subs[k].name + '</option>'; });
        html += '</select></label>';
        html += '<span style="font-size:1.2rem;">→</span>';
        html += '<label>目标物：<select id="oc-to" style="padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;">';
        keys.forEach(function(k){ html += '<option value="' + k + '"' + (s.toSub===k?' selected':'') + '>' + subs[k].name + '</option>'; });
        html += '</select></label>';
        html += '<button onclick="organicConverter._findPath()" style="background:#3b82f6;color:#fff;border:0;padding:6px 14px;border-radius:6px;cursor:pointer;">🔍 查询转化路径</button></div>';
        html += '<div id="oc-result"></div>';
        html += '<div style="margin-top:14px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;">';
        html += '<h4 style="margin-top:0;">📋 物质卡片速查</h4>';
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">';
        keys.forEach(function(k){
            html += '<div onclick="organicConverter._showSub(\'' + k + '\')" style="padding:10px;background:#f8fafc;border-left:3px solid ' + subs[k].color + ';border-radius:6px;cursor:pointer;">' +
                '<strong style="color:' + subs[k].color + ';">' + subs[k].name + '</strong>' +
                '<div style="font-size:0.8rem;color:#64748b;margin-top:2px;">' + subs[k].cat + ' | ' + subs[k].formula + '</div></div>';
        });
        html += '</div></div>';
        html += '<div style="margin-top:14px;background:#fff;border:1px solid #e2e8f0;border-left:4px solid #f59e0b;border-radius:8px;padding:14px;">';
        html += '<h4 style="margin-top:0;color:#92400e;">🔥 有机反应类型总结</h4>';
        html += '<table style="width:100%;border-collapse:collapse;font-size:0.85rem;">';
        html += '<tr style="background:#fef3c7;"><th style="padding:6px;border:1px solid #fcd34d;text-align:left;">类型</th><th style="padding:6px;border:1px solid #fcd34d;text-align:left;">定义</th><th style="padding:6px;border:1px solid #fcd34d;text-align:left;">实例</th></tr>';
        html += '<tr><td style="padding:5px;border:1px solid #fcd34d;font-weight:600;">取代</td><td style="padding:5px;border:1px solid #fcd34d;">原子/团被其他原子/团代替</td><td style="padding:5px;border:1px solid #fcd34d;">烷烃卤代、苯的硝化/磺化、酯化/水解</td></tr>';
        html += '<tr><td style="padding:5px;border:1px solid #fcd34d;font-weight:600;">加成</td><td style="padding:5px;border:1px solid #fcd34d;">不饱和键断裂加原子/团</td><td style="padding:5px;border:1px solid #fcd34d;">烯烃加HX/H₂/X₂/H₂O、醛酮加氢</td></tr>';
        html += '<tr><td style="padding:5px;border:1px solid #fcd34d;font-weight:600;">消去</td><td style="padding:5px;border:1px solid #fcd34d;">脱去小分子形成不饱和键</td><td style="padding:5px;border:1px solid #fcd34d;">乙醇→乙烯(170°C)、卤代烃→烯烃</td></tr>';
        html += '<tr><td style="padding:5px;border:1px solid #fcd34d;font-weight:600;">氧化</td><td style="padding:5px;border:1px solid #fcd34d;">加氧或去氢</td><td style="padding:5px;border:1px solid #fcd34d;">醇→醛→羧酸、燃烧、KMnO₄褪色</td></tr>';
        html += '<tr><td style="padding:5px;border:1px solid #fcd34d;font-weight:600;">还原</td><td style="padding:5px;border:1px solid #fcd34d;">加氢或去氧</td><td style="padding:5px;border:1px solid #fcd34d;">醛/酮→醇、烯烃→烷烃(加H₂)</td></tr>';
        html += '<tr><td style="padding:5px;border:1px solid #fcd34d;font-weight:600;">聚合</td><td style="padding:5px;border:1px solid #fcd34d;">小分子→高分子</td><td style="padding:5px;border:1px solid #fcd34d;">加聚(烯烃)、缩聚(羟酸/氨基酸)</td></tr>';
        html += '<tr style="background:#fee2e2;"><td colspan="3" style="padding:5px;border:1px solid #fcd34d;"><strong>⚠️ 条件不同产物不同：</strong>乙醇+浓H₂SO₄/170°C→乙烯(消去)；乙醇+浓H₂SO₄/140°C→乙醚(分子间脱水)；乙醇+NaBr/浓H₂SO₄→溴乙烷(取代)</td></tr>';
        html += '</table></div></div>';

        app.innerHTML = html;
        this._bindEvents();
        } catch (err) {
            console.error('有机物转化工具渲染失败:', err);
        }
    },

    _bindEvents() {
        const self = this;
        const fromEl = document.getElementById('oc-from');
        const toEl = document.getElementById('oc-to');
        if (fromEl) fromEl.addEventListener('change', function() { self.state.fromSub = this.value; });
        if (toEl) toEl.addEventListener('change', function() { self.state.toSub = this.value; });
    },

    _findPath() {
        const s = this.state;
        const start = s.fromSub, end = s.toSub;
        const visited = new Set([start]);
        const queue = [[start]];
        let found = null;
        while (queue.length > 0 && !found) {
            const path = queue.shift();
            const cur = path[path.length - 1];
            if (cur === end) { found = path; break; }
            this.reactions.forEach(function(r) {
                if (r.from === cur && !visited.has(r.to)) {
                    visited.add(r.to);
                    queue.push([...path, r.to]);
                }
            });
        }
        this._showPathResult(found || []);
    },

    _showPathResult(path) {
        const el = document.getElementById('oc-result');
        if (!el) return;
        const subs = this.substances;
        if (path.length === 0) {
            el.innerHTML = '<div style="background:#fee2e2;border:1px solid #fecaca;padding:14px;border-radius:8px;margin-bottom:12px;"><p>未找到从 <strong>' + (subs[this.state.fromSub]?.name||this.state.fromSub) + '</strong> 到 <strong>' + (subs[this.state.toSub]?.name||this.state.toSub) + '</strong> 的直接转化路径。</p><p style="font-size:0.85rem;color:#64748b;">提示：可选择更接近的物质作为中间步骤。</p></div>';
            return;
        }
        let html = '<div style="background:#fff;border:1px solid #e2e8f0;border-left:4px solid #3b82f6;border-radius:8px;padding:14px;margin-bottom:12px;">';
        html += '<h4 style="margin-top:0;color:#1e40af;">🔄 转化路径（共 ' + (path.length - 1) + ' 步）</h4>';
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i], to = path[i + 1];
            const rxn = this.reactions.find(function(r){ return r.from === from && r.to === to; });
            html += '<div style="margin:10px 0;padding:12px;background:#f8fafc;border-radius:8px;">';
            html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">';
            html += '<span style="font-weight:600;color:' + subs[from].color + ';">' + subs[from].name + '</span>';
            html += '<span style="color:#64748b;font-size:1.1rem;">→</span>';
            html += '<span style="font-weight:600;color:' + subs[to].color + ';">' + subs[to].name + '</span>';
            if (rxn) html += '<span style="background:#f59e0b;color:#fff;padding:2px 8px;border-radius:4px;font-size:0.8rem;">' + rxn.type + '</span>';
            html += '</div>';
            if (rxn) {
                html += '<div style="font-size:0.84rem;background:white;padding:8px;border-radius:6px;border:1px solid #e2e8f0;">';
                html += '<strong style="color:#d97706;">反应条件：</strong>' + rxn.condition + '<br>';
                html += '<code style="color:#1e40af;background:#eff6ff;padding:2px 6px;border-radius:3px;display:inline-block;margin-top:4px;">' + rxn.equation + '</code>';
                html += '</div>';
            }
            html += '</div>';
        }
        html += '</div>';
        el.innerHTML = html;
    },

    _showSub(key) {
        const sub = this.substances[key];
        if (!sub) return;
        alert('【' + sub.name + '】\n类别: ' + sub.cat + '\n结构简式: ' + sub.formula + '\n\n特性：\n' + (sub.features || '基础有机化合物'));
    }
};
// END PART 1

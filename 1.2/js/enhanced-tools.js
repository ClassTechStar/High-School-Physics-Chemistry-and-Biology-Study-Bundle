// ============================================================
// 增强工具模块 - 化学工业流程/生物四大工具深度增强版
// 包含：chemistryProcessAnalyzer(增强), biologyMindMap(增强), 
//       geneticsPedigreeTrainer(增强), photosynthesisTrainer(增强), experimentDesigner(增强)
// ============================================================

// ==================== 1. 化学工业流程核心反应提取工具（增强版）====================
const chemistryProcessAnalyzerEnhanced = {
    state: { inputText: '', extractedReactions: [], analysis: null, examPoints: [], mode: 'core', batchHistory: [] },
    
    oxidantDB: ['O₂','Cl₂','Br₂','H₂SO₄(浓)','HNO₃(浓)','HNO₃(稀)','Fe³⁺','KMnO₄(H⁺)','MnO₂(H⁺)','Cu²⁺','NO₂','NaClO','H₂O₂'],
    reductantDB: ['C','CO','H₂','Fe','Zn','Mg','Al','Cu','SO₂','H₂S','S²⁻','I⁻','Br⁻','NH₃','NO'],
    
    coreReactionDB: [
        { eq:'4FeS₂ + 11O₂ → 2Fe₂O₃ + 8SO₂', type:'氧化还原', desc:'黄铁矿焙烧', category:'硫酸工业' },
        { eq:'2SO₂ + O₂ ⇌ 2SO₃', type:'催化氧化', desc:'接触室催化氧化', category:'硫酸工业' },
        { eq:'SO₃ + H₂O → H₂SO₄', type:'化合吸收', desc:'硫酸吸收', category:'硫酸工业' },
        { eq:'3Cu + 8HNO₃(稀) → 3Cu(NO₃)₂ + 2NO↑ + 4H₂O', type:'氧化还原', desc:'铜与稀硝酸', category:'硝酸工业' },
        { eq:'4NH₃ + 5O₂ → 4NO + 6H₂O', type:'催化氧化', desc:'氨的催化氧化', category:'合成氨-硝酸' },
        { eq:'Fe₂O₃ + 3CO → 2Fe + 3CO₂', type:'氧化还原', desc:'高炉炼铁核心反应', category:'钢铁冶炼' },
        { eq:'Co₂O₃ + 6HCl + 2Cl⁻ → 2CoCl₂ + Cl₂↑ + 3H₂O', type:'氧化还原', desc:'钴氧化物溶出', category:'湿法冶金' },
        { eq:'2NaCl + 2H₂O → 2NaOH + H₂↑ + Cl₂↑', type:'电解', desc:'氯碱工业', category:'电化学' }
    ],

    gdExamRules: {
        pH调节:{ k:['pH','调节','控制'], p:[{q:'调pH的目的？',a:'使目标离子完全沉淀或杂质离子沉淀除去'}, {q:'为何选该试剂？',a:'不引入新杂质、成本低、易得'}] },
        结晶:{ k:['结晶','晶体','过滤'], p:[{q:'蒸发还是冷却结晶？',a:'溶解度随温度变化大→冷却；小→蒸发'}, {q:'为何趁热过滤？',a:'防止目标物质提前结晶降低产率'}] },
        氧化剂:{ k:['氧化','氧化剂','高价'], p:[{q:'选此氧化剂原因？',a:'能将目标氧化到所需价态、不引入新杂质、成本合理'}] },
        除杂:{ k:['除杂','除去','净化'], p:[{q:'除杂原则？',a:'不减少目标物、不引入新杂质、操作简便、除杂彻底'}] }
    },

    analyzeText(text) {
        if (!text || text.trim().length < 5) return;
        this.state.inputText = text;
        this.state.extractedReactions = this._extractCore(text);
        this.state.analysis = this._analyzeEnhanced(text);
        this.state.examPoints = this._generateGdPoints(text);
        this._render();
    },

    _extractCore(text) {
        const reactions = [];
        this.coreReactionDB.forEach(r => {
            if (text.includes(r.eq.split(/[→=⟶]/)[0])) reactions.push({...r, conf:0.95});
        });
        const steps = text.match(/\d+[.、）)]\s*.+/g) || [];
        steps.forEach((s,i) => {
            const matched = this.coreReactionDB.find(r => s.includes(r.eq.split(/[→=⟶]/)[0]));
            if (!reactions.some(r => r.eq?.includes(s.slice(0,15)))) {
                reactions.push({eq:`【步骤${i+1}】${s.slice(0,60)}${s.length>60?'...':''}`, type:matched?.type||'工艺步骤', category:matched?.category||'未分类', conf:matched?0.8:0.6});
            }
        });
        return reactions.sort((a,b)=>b.conf-a.conf).slice(0,12);
    },

    _analyzeEnhanced(text) {
        return {
            redox: this._doRedox(text),
            cycles: this._findCycles(text),
            impurity: this._doImpurity(text),
            operations: this._findOps(text),
            envFactors: this._doEnv(text)
        };
    },

    _doRedox(text) {
        const result = [];
        this.state.extractedReactions.filter(r=>r.type?.includes('氧化')).forEach(r=>{
            let ox='待定', rd='待定';
            this.oxidantDB.forEach(o=>{if(r.eq?.includes(o)||text.includes(o)) ox=o;});
            this.reductantDB.forEach(d=>{if(r.eq?.includes(d)||text.includes(d)) rd=d;});
            result.push({rxn:r.eq?.slice(0,40), ox, rd});
        });
        return result;
    },

    _findCycles(text) {
        const subs=['Fe₂O₃','SO₂','CO','H₂O','O₂','NO','NO₂','母液','滤液'];
        const found = subs.filter(s=>(text.match(new RegExp(s,'g'))||[]).length>=2);
        return { substances:found, paths: found.map(s=>({from:'前段工序', via:s, to:'后段工序', purpose:'提高原料利用率'})) };
    },

    _doImpurity(text) {
        const rules = [
            {t:/调pH|调节pH|控制pH/, p:'通过调节pH使金属离子形成氢氧化物沉淀除去', m:'NaOH/Ca(OH)₂/NH₃·H₂O'},
            {t:/过滤/, p:'分离固体和液体混合物', m:'常压/减压过滤，趁热过滤防结晶'},
            {t:/结晶|重结晶/, p:'利用溶解度差异分离纯化', m:'蒸发结晶(差异小)/冷却结晶(差异大)'},
            {t:/灼烧|焙烧|煅烧/, p:'高温除可燃性杂质或转化物质形态', m:'控温控时'},
            {t:/萃取|分液/, p:'利用分配系数差异在两相中分离', m:'选合适萃取剂'}
        ];
        return rules.filter(r=>r.t.test(text)).map(r=>({op:r.t.source.split('|')[0], principle:r.p, method:r.m}));
    },

    _findOps(text) {
        const ops = [
            {p:/(?:粉碎|研磨).*?(?:矿石|原料)/, n:'原料预处理', r:'增大接触面积加快反应'},
            {p:/(?:酸浸|碱溶|浸出)/, n:'浸出溶解', r:'将目标成分转入溶液'},
            {p:/(?:调|控制).{0,5}(?:pH|酸度)/, n:'pH调控', r:'控制离子沉淀条件'},
            {p:/(?:蒸发|浓缩|结晶)/, n:'浓缩结晶', r:'从溶液中获得晶体产品'},
            {p:/(?:洗涤|水洗)/, n:'晶体洗涤', r:'除去表面吸附的可溶性杂质'}
        ];
        return ops.filter(o=>o.p.test(text)).map(o=>({op:o.n, detail:o.p.exec(text)?.[0], reason:o.r}));
    },

    _doEnv(text) {
        const f = [];
        if(/(?:高温|800|900|1000|1200).*?[°℃度]/gi.test(text)) f.push({f:'高温条件', n:'提供活化能加快反应'});
        if(/(?:催化剂|V₂O₅|Pt|Ni|Fe)/gi.test(text)) f.push({f:'催化剂', n:'降低活化能提高选择性'});
        if(/(?:尾气|废气|废水|环保|污染)/gi.test(text)) f.push({f:'三废处理', n:'绿色化学理念考查点'});
        if(/(?:循环|回用|返回)/gi.test(text)) f.push({f:'资源循环', n:'提高原子利用率降成本'});
        return f;
    },

    _generateGdPoints(text) {
        const pts = [];
        Object.entries(this.gdExamRules).forEach(([cat,rule])=>{
            const hits = rule.k.reduce((c,kw)=>c+(new RegExp(kw,'gi').test(text)?1:0),0);
            if(hits>0) rule.points.forEach(p=>pts.push({cat, q:p.q, a:p.a, score:hits>2?10:hits===1?6:8}));
        });
        if(this.state.analysis?.cycles?.substances?.length>0)
            pts.push({cat:'循环物质', q:'本流程中的循环物质有哪些？', a:this.state.analysis.cycles.substances.map(s=>s).join('、')+'。目的：提高原料利用率减少排放', score:10});
        return pts.sort((a,b)=>b.score-a.score).slice(0,10);
    },

    loadSample(id) {
        const samples = {
            'iron':`高炉炼铁：\n原料：铁矿石(Fe₂O₃)、焦炭、石灰石\n1.C+O₂→CO₂  2.CO₂+C→2CO 3.Fe₂O₃+3CO→2Fe+3CO₂\n4.CaCO₃→CaO+CO₂；CaO+SiO₂→CaSiO₃\n循环：CO | 除杂：石灰石除SiO₂`,
            'sulfuric':`接触法制硫酸：\n1.S+O₂→SO₂ 或 4FeS₂+11O₂→2Fe₂O₃+8SO₂\n2.2SO₂+O₂⇌2SO₃(V₂O₅,400-500℃)\n3.SO₃+H₂O→H₂SO₄(用98%浓酸吸收防酸雾)\n关键：400-500℃兼顾速率与转化率`,
            'cobalt':`含钴废料回收(广东卷2022改编)：\n1.酸浸：Co₂O₃+6HCl+2Cl⁻→2CoCl₂+Cl₂↑+3H₂O(Co³⁺强氧化性！)\n2.加H₂O₂将Fe²⁺→Fe³⁺，调pH≈3.5使Fe³⁺/Al³⁺沉淀\n3.P204萃取Co²⁴→盐酸反萃→草酸沉钴→煅烧\n核心考点：Co₂O₃与盐酸是氧化还原！pH3.5是关键`,
            'lithium':`磷酸铁锂LiFePO₄制备：\n配料比 Li:Fe:P:C = 1:1:1:(0.1~0.3)\n烧结(核)：2FePO₄+Li₂CO₃+C→2LiFePO₄+3CO↑(Ar气氛600-800℃)\n关键：必须在保护气氛中防止Fe²⁺被氧化`
        };
        const el = document.getElementById('process-input');
        if(el && samples[id]) { el.value = samples[id]; this.analyzeText(samples[id]); }
    },

    setMode(m) { this.state.mode=m; const el=document.getElementById('process-input'); if(el&&el.value) this.analyzeText(el.value); else this._render(); },

    switchTab(id) { document.querySelectorAll('.tab-c').forEach(t=>t.classList.remove('active')); document.getElementById(id)?.classList.add('active'); event.target.classList.add('active'); },

    importBatch(input) {
        const file=input.files[0]; if(!file) return;
        const reader=new FileReader(); reader.onload=e=>{
            try{
                const c=e.target.result;
                if(file.name.endsWith('.json')){const d=JSON.parse(c); d.problems?.forEach((p,i)=>this.state.batchHistory.push({id:Date.now()+i,title:p.title||`题${i+1}`,content:typeof p.content==='string'?p.content:JSON.stringify(p),time:new Date().toLocaleString()}));}
                else{c.split(/\n\s*\n/).filter(p=>p.length>50).forEach((p,i)=>this.state.batchHistory.push({id:Date.now()+i,title:`文本${i+1}`,content:p,time:new Date().toLocaleString()}));}
                this._renderBatch(); alert(`导入成功！`);
            }catch(err){alert('解析失败:'+err.message);}
        }; reader.readAsText(file);
    },

    _render() {
        const app=document.getElementById('process-analyzer-app'); if(!app) return;
        const {er,an,ep}=this.state;
        app.innerHTML=`
        <div class="pa-enhanced">
            <div class="pa-head"><h2>🏭 化学工业流程核心反应提取工具 <span class="gd-badge">广东卷专用</span></h2>
                <div class="mode-switch"><button class="msw ${this.state.mode==='core'?'act':''}" onclick="chemistryProcessAnalyzerEnhanced.setMode('core')">🎯 核心提取</button><button class="msw ${this.state.mode==='line'?'act':''}" onclick="chemistryProcessAnalyzerEnhanced.setMode('line')">📋 逐行分析</button></div>
            </div>
            <div class="pa-body">
                <div class="input-zone">
                    <div class="samples"><span>📚 示例：</span>
                        <button class="bs" onclick="chemistryProcessAnalyzerEnhanced.loadSample('iron')">⚙️ 高炉炼铁</button>
                        <button class="bs" onclick="chemistryProcessAnalyzerEnhanced.loadSample('sulfuric')">💧 硫酸工业</button>
                        <button class="bs" onclick="chemistryProcessAnalyzerEnhanced.loadSample('cobalt')">🔵 钴冶炼</button>
                        <button class="bs" onclick="chemistryProcessAnalyzerEnhanced.loadSample('lithium')">🔋 锂电池</button>
                    </div>
                    <label class="bi">📁 批量导入：<input type="file" accept=".txt,.json" onchange="chemistryProcessAnalyzerEnhanced.importBatch(this)"></label>
                    <div id="batch-lst"></div>
                    <textarea id="process-input" placeholder="粘贴工业流程题文本..." oninput="if(this.value.length>30)chemistryProcessAnalyzerEnhanced.analyzeText(this.value)"></textarea>
                    <div class="iactions"><span id="ccnt">0</span><button class="bgo" onclick="chemistryProcessAnalyzerEnhanced.analyzeText(document.getElementById('process-input').value)">🔍 智能分析</button></div>
                </div>
                ${er.length>0?`
                <div class="results-e">
                    <div class="rp"><h3>⚗️ 核心反应 (${er.length}个)</h3>${er.map((r,i)=>
                    `<div class="rc ${r.conf>0.85?'hc':r.conf>0.7?'mc':'lc'}"><div class="rt"><span>#${i+1}</span><span class="tp">${r.type}</span><span class="cf">${Math.round(r.conf*100)}%</span></div><div class="eq">${r.eq}</div>${r.desc?`<div class="ds">${r.desc}</div>`:''}${r.category?`<span class="ct">${r.category}</span>`:''}</div>`
                    ).join('')}</div>
                    ${an?`
                    <div class="tabs"><div class="tb"><button class="tc act" onclick="chemistryProcessAnalyzerEnhanced.switchTab('t1')">⚡ 氧化还原</button><button class="tc" onclick="chemistryProcessAnalyzerEnhanced.switchTab('t2')">🔄 物质循环</button><button class="tc" onclick="chemistryProcessAnalyzerEnhanced.switchTab('t3')">🧹 除杂原理</button><button class="tc" onclick="chemistryProcessAnalyzerEnhanced.switchTab('t4')">⚙️ 操作步骤</button><button class="tc" onclick="chemistryProcessAnalyzerEnhanced.switchTab('t5')">♻️ 绿色化学</button></div>
                        <div class="tab-c active" id="t1">${an.redox.length?`<table class="rot"><tr><th>反应</th><th>氧化剂</th><th>还原剂</th></tr>${an.redox.map(x=>'<tr><td>'+x.rxn+'</td><td class="ox">'+x.ox+'</td><td class="rd">'+x.rd+'</td></tr>').join('')}</table>`:'<p class="nd">未检测到氧化还原</p>'}</div>
                        <div class="tab-c" id="t2">${an.cycles.substances.length?`<div class="cycl">${an.cycles.substances.map(s=>'<span class="cy">'+s+'</span>').join('')}</div><div class="cp">${an.cycles.paths.map(p=>p.from+'→['+p.via+']→'+p.to+': '+p.purpose).join('<br>')}</div>`:'<p class="nd">无</p>'}</div>
                        <div class="tab-c" id="t3">${an.impurity.length?`<div class="imp">${an.impurity.map(i=>'<div class="ic"><b>'+i.op+'</b>: '+i.principle+'<br><small>方法:'+i.method+'</small></div>').join('')}</div>`:'<p class="nd">无</p>'}</div>
                        <div class="tab-c" id="t4">${an.operations.length?`<div class="ops-tl">${an.operations.map((o,i)=>'<div class="os"><span class="om">'+(i+1)+'</span><b>'+o.op+'</b>: '+o.detail+'<br><small>'+o.reason+'</small></div>').join('')}</div>`:'<p class="nd">请输入更详细描述</p>'}</div>
                        <div class="tab-c" id="t5">${an.envFactors.length?`<div class="env">${an.envFactors.map(e=>'<div class="ef"><span>'+(e.f.includes('三废')||e.f.includes('循环')?'♻️':'⚡')+'</span><b>'+e.f+'</b><p>'+e.n+'</p></div>').join('')}</div>`:'<p class="nd">暂无</p>'}</div>
                    `:''}
                    ${ep.length>0?`
                    <div class="gd-panel"><h3>📚 广东卷考点清单 <span class="ts">${ep.reduce((s,p)=>s+p.score,0)}分</span></h3>
                        ${ep.map((p,i)=>'<div class="pc '+(p.score>=10?'hv':p.score>=6?'mv':'')+'"><div class="ph"><span>#'+String(i+1).padStart(2,'0')+'</span><span class="pcat">'+p.cat+'</span><span class="psc">'+p.score+'分</span></div><div class="pq">❓ '+p.q+'</div><div class="pa">✅ '+p.a+'</div></div>').join('')}
                    </div>
                    <div class="strat"><h3>💡 解题策略</h3><div class="sg">1️⃣找源头 2️⃣画主线 3️⃣识循环 4️⃣析除杂 5️⃣记考点 ⭐防陷阱</div></div>
                    `:''}
                </div>
                `:`<div class="ph-e"><div class="pi">🏭</div><h3>等待输入</h3><p>粘贴或选择示例开始智能分析</p></div>`}
            </div>
        </div>`;
        document.getElementById('ccnt').textContent=document.getElementById('process-input')?.value?.length||0;
        if(this.state.batchHistory.length>0) this._renderBatch();
    },

    _renderBatch() {
        const el=document.getElementById('batch-lst'); if(!el) return;
        el.innerHTML=this.state.batchHistory.map(i=>`<div class="bi" onclick="chemistryProcessAnalyzerEnhanced._loadBi(${i.id})">${i.title} <span>${i.time}</span></div>`).join('');
    },
    _loadBi(id){const it=this.state.batchHistory.find(i=>i.id===id);if(it){document.getElementById('process-input').value=it.content;this.analyzeText(it.content);}}
};

// ==================== 2. 生物概念图/思维导图生成器（增强版）====================
const biologyMindMapEnhanced = {
    concepts: {
        '光合作用':{ branches:['光反应阶段','暗反应阶段','影响因素','实际应用'], sub:{'光反应':['水的光解','ATP合成','NADPH生成'],'暗反应':['CO₂固定','C₃化合物还原','糖类生成']}},
        '细胞呼吸':{ branches:['有氧呼吸','无氧呼吸','能量转换','应用'], sub:{'有氧呼吸':['糖酵解→丙酮酸氧化→电子传递链'],'无氧呼吸':['酒精发酵','乳酸发酵']}},
        '遗传信息':{ branches:['DNA复制','转录','翻译','中心法则','基因表达调控']},
        '免疫调节':{ branches:['非特异性免疫','特异性免疫','体液免疫','细胞免疫','免疫失调']},
        '内环境稳态':{ branches:['渗透压平衡','体温调节','血糖调节','水盐平衡','pH调节']},
        '生态系统':{ branches:['种群数量变化','群落演替','能量流动','物质循环','信息传递','稳定性']},
        '生命活动调节':{ branches:['神经调节','体液调节','免疫调节','反馈机制']}
    },
    layouts: ['tree', 'radial', 'hierarchy'],
    currentLayout: 'radial',
    nodes: [],
    selectedNode: null,
    
    init(concept) {
        this.currentConcept = concept || '光合作用';
        this.nodes = this._buildNodes(concept);
        this._render();
    },

    _buildNodes(concept) {
        const data = this.concepts[concept];
        if (!data) { return [{id:'root', label:concept, x:400,y:300, level:0, children:[], color:'#7CB342'}]; }
        
        const root = {id:'root', label:concept, x:400,y:300, level:0, children:[], color:'#667eea'};
        data.branches.forEach((branch, i) => {
            const branchNode = {id:`b_${i}`, label:branch, x:400, y:300, level:1, parent:'root', children:[], color:'#48A9A6'};
            root.children.push(branchNode);
            
            if (data.sub && data.sub[branch]) {
                data.sub[branch].forEach((sub, j) => {
                    const subNode = {id:`s_${i}_${j}`, label:sub, x:400, y:300, level:2, parent:`b_${i}`, children:[], color:'#FF9800'};
                    branchNode.children.push(subNode);
                    
                    // Add key points (广东卷高频)
                    const keyPoints = this._getKeyPoints(concept, branch, sub);
                    keyPoints.forEach((kp, k) => {
                        const kpNode = {id:`k_${i}_${j}_${k}`, label:kp, x:400,y:300, level:3, parent:`s_${i}_${j}`, children:[], color:'#E74C3C', isKeyPoint:true};
                        subNode.children.push(kpNode);
                    });
                });
            } else {
                // Auto-generate sub-concepts
                const autoSubs = this._autoGenerateSubs(branch);
                autoSubs.forEach((asub, j) => {
                    const asubNode = {id:`as_${i}_${j}`, label:asub, x:400,y:300,level:2,parent:`b_${i}`,children:[],color:'#90CAF9'};
                    branchNode.children.push(asubNode);
                });
            }
        });
        
        return [root, ...this._getAllChildren(root)];
    },

    _autoGenerateSubs(branch) {
        const map = {
            '光反应阶段':['叶绿体类囊体薄膜','光系统I和II','光合色素','水的光解'],
            '暗反应阶段':['卡尔文循环','C₃途径','C₄途径','CAM途径'],
            '影响因素':['光照强度','CO₂浓度','温度','水分','矿质元素'],
            '非特异性免疫':['第一道防线','皮肤黏膜','吞噬细胞','炎症反应'],
            '特异性免疫':['B细胞介导体液免疫','T细胞介导细胞免疫','抗体产生'],
            '种群数量变化':['J型增长','S型增长','K值','环境容纳量'],
            '能量流动':['生产者→消费者→分解者','能量递减','传递效率10%-20%'],
            '物质循环':['碳循环','氮循环','水循环','物质循环全球性']
        };
        return map[branch] || [branch+'的基本概念', branch+'的特点', branch+'的意义'];
    },

    _getKeyPoints(concept, branch, sub) {
        const gdKeyPoints = {
            '光合作用':{'光反应阶段':['光反应场所：类囊体薄膜','光系统II吸收680nm','光系统I吸收700nm','特殊分子：P680/P700'],'暗反应阶段':['C₃途径(卡尔文循环)直接产物：三碳糖(G3P)','C₄途径产物：草酰乙酸(OAA)/苹果酸等四碳有机酸','CAM途径特点：夜间固定CO₂白天气孔关闭'],'影响因素':['光补偿点含义','光饱和点限制因素','CO₂浓度对净光合的影响','温度对酶活性的双重影响']},
            '细胞呼吸':{'有氧呼吸':['三个阶段场所与产物','[H]的来源与去向','O₂的消耗量计算','能量转化效率约40%'],'无氧呼吸':['酒精发酵总反应式','乳酸发酵总反应式','两种方式的共同点与区别']},
            '遗传信息':{'DNA复制':['半保留复制','边解边复制','DNA聚合酶的作用','复制方向5\'→3\''],'转录':['RNA聚合酶','启动子与终止子','mRNA加工过程','三种RNA的区别'],'翻译':['核糖体的结构','tRNA的反密码子','肽链延伸方向','多聚核糖体的意义']},
            '免疫调节':{'体液免疫':['抗体的结构(Y形)','二次免疫应答更快更强','过敏反应的机理','自身免疫病实例'],'细胞免疫':['效应T细胞的作用','记忆T细胞的形成','细胞毒性T细胞攻击靶细胞','移植排斥的机理']},
            '生态系统':{'能量流动':['单向流动不可循环','逐级递减(10%-20%)','食物链营养级越高能量越少'],'物质循环':['碳循环形式：CO₂/有机物','氮循环中的固氮/反硝化/氨化','水循环的主要环节','物质循环具有全球性']}
        };
        return gdKeyPoints[concept]?.[branch]?.[sub] || gdKeyPoints[concept]?.[branch]?.[Object.keys(gdKeyPoints[concept][branch]||{})[0]] || [];
    },

    _getAllChildren(node) {
        let all = [];
        node.children.forEach(c => { all.push(c); all = all.concat(this._getAllChildren(c)); });
        return all;
    },

    setLayout(layout) {
        this.currentLayout = layout;
        this._positionNodes();
        this._render();
    },

    _positionNodes() {
        const cx = 400, cy = 300;
        if (this.currentLayout === 'radial') {
            this._layoutRadial(this.nodes[0], cx, cy, 0, Math.PI * 2 / Math.max(1, this.nodes[0].children.length));
        } else if (this.currentLayout === 'tree') {
            this._layoutTree(this.nodes[0], cx, 50, 0, 120);
        } else {
            this._layoutHierarchy(this.nodes[0], cx, 50, 0, 80);
        }
    },

    _layoutRadial(node, cx, cy, startAngle, angleStep) {
        node.x = cx; node.y = cy;
        if (node.children.length > 0) {
            const childAngle = angleStep / node.children.length;
            node.children.forEach((child, i) => {
                const angle = startAngle - angleStep/2 + childAngle/2 + i * childAngle;
                const radius = 180 + node.level * 120;
                child.x = cx + Math.cos(angle) * radius;
                child.y = cy + Math.sin(angle) * radius;
                this._layoutRadial(child, child.x, child.y, angle, childAngle);
            });
        }
    },

    _layoutTree(node, x, y, level, spacing) {
        node.x = x; node.y = y;
        node.children.forEach((child, i) => {
            child.x = x + spacing;
            child.y = y + 100;
            this._layoutTree(child, child.x, child.y, level + 1, spacing * 0.75);
        });
    },

    _layoutHierarchy(node, x, y, level, spacing) {
        node.x = x; node.y = y;
        node.children.forEach((child, i) => {
            child.x = x + (i % 2 === 0 ? -spacing : spacing) * (1 + Math.floor(i / 2));
            child.y = y + 90;
            this._layoutHierarchy(child, child.x, child.y, level + 1, spacing * 0.85);
        });
    },

    _render() {
        const app = document.getElementById('biology-mindmap-app');
        if (!app) return;

        app.innerHTML = `
        <div class="mm-enhanced">
            <div class="mm-header">
                <h2>🗺️ 生物概念图/思维导图生成器</h2>
                <div class="mm-controls">
                    <select id="concept-select" onchange="biologyMindMapEnhanced.init(this.value)">
                        <option value="">-- 选择中心概念 --</option>
                        ${Object.keys(this.concepts).map(c=>`<option value="${c}">${c}</option>`).join('')}
                        <option value="custom">自定义概念...</option>
                    </select>
                    <div class="layout-btns">
                        <button class="${this.currentLayout==='tree'?'lb-act':''}" onclick="biologyMindMapEnhanced.setLayout('tree')">🌳 树状</button>
                        <button class="${this.currentLayout==='radial'?'lb-act':''}" onclick="biologyMindMapEnhanced.setLayout('radial')">☀️ 辐射状</button>
                        <button class="${this.currentLayout==='hierarchy'?'lb-act':''}" onclick="biologyMindMapEnhanced.setLayout('hierarchy')">📊 层级状</button>
                    </div>
                    <button class="btn-export" onclick="biologyMindMapEnhanced.exportPNG()">💾 导出图片</button>
                </div>
            </div>

            <svg id="mindmap-svg" width="800" height="600" viewBox="0 0 800 600" class="mm-svg">
                <defs>
                    <marker id="arrow-mm" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#999"/></marker>
                    <filter id="shadow-mm"><feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.15"/></filter>
                </defs>
                ${this._drawSVGConnections()}
                ${this._drawSVGNodes()}
            </svg>

            <div class="mm-info">
                <div class="mm-stats">
                    <span>📍 节点数: ${this.nodes.length}</span>
                    <span>🔑 关键考点: ${this.nodes.filter(n=>n.isKeyPoint).length}</span>
                    <span>📐 布局: ${this.currentLayout==='tree'?'树状':this.currentLayout==='radial'?'辐射':'层级'}</span>
                </div>
                <div class="mm-legend">
                    <span class="lg-item"><span style="background:#667eea"></span> 核心概念</span>
                    <span class="lg-item"><span style="background:#48A9A6"></span> 一级分支</span>
                    <span class="lg-item"><span style="background:#FF9800"></span> 二级分支</span>
                    <span class="lg-item"><span style="background:#E74C3C"></span> 广东卷高频</span>
                </div>
            </div>
        </div>`;
        this._attachSVGEvents();
    },

    _drawSVGConnections() {
        return this.nodes.filter(n=>n.parent).map(n=>{
            const p=this.nodes.find(no=>no.id===n.parent);
            return `<line x1="${p.x}" y1="${p.y}" x2="${n.x}" y2="${n.y}" stroke="#ccc" stroke-width="2" marker-end="url(#arrow-mm)" />`;
        }).join('');
    },

    _drawSVGNodes() {
        return this.nodes.map(n=>{
            const w=n.isKeyPoint?130:(n.level===0?160:n.level===1?130:110), h=n.isKeyPoint?50:40;
            return `<g class="mm-node" data-id="${n.id}" transform="translate(${n.x-w/2},${n.y-h/2})" cursor="pointer">
                <rect width="${w}" height="${h}" rx="10" fill="${n.color}" filter="url(#shadow-mm)" stroke="${n.selected?'#667eea':'#ddd'}" stroke-width="${n.selected?3:1}"/>
                <text x="${w/2}" y="${h/2}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="${n.level===0?16:n.level===1?13:11}" font-weight="600">${n.label}</text>
                ${n.isKeyPoint?'<circle cx="${w-12}" cy="12" r="6" fill="#E74C3C"/><text x="${w-18}" y="16" font-size="8" fill="#E74C3C">★</text>':''}
            </g>`;
        }).join('');
    },

    _attachSVGEvents() {
        setTimeout(()=>{
            document.querySelectorAll('.mm-node').forEach(node=>{
                node.addEventListener('click',(e)=>{
                    this.nodes.forEach(n=>n.selected=false);
                    const clicked=this.nodes.find(n=>n.id===node.dataset.id);
                    if(clicked){clicked.selected=true;this._render();}
                });
            });
        },100);
    },

    exportPNG() {
        const svg=document.getElementById('mindmap-svg');
        const canvas=document.createElement('canvas');
        canvas.width=1600;canvas.height=1200;
        const ctx=canvas.getContext('2d');
        const svgData=new XMLSerializer().serializeToString(svg);
        const img=new Image();
        img.onload=()=>{
            ctx.drawImage(img,0,0);
            const link=document.createElement('a');
            link.download=`思维导图-${this.currentConcept}.png`;
            link.href=canvas.toDataURL('image/png');
            link.click();
        };
        img.src='data:image/svg+xml;base64,'+btoa(unescape(svgData));
    }
};

// ==================== 3. 遗传系谱图练习器（20+类型）====================
const geneticsPedigreeTrainerEnhanced = {
    types: [
        {id:'ar_dom', name:'常染色体显性遗传', pattern:'AA×aa→全显/Aa×aa→1:1', example:'并指多指', key:'父母正常子女患病→显性；男女患病概率相等', difficulty:2},
        {id:'ar_rec', name:'常染色体隐性遗传', pattern:'Aa×Aa→3:1(显隐)', example:'白化/苯丙酮尿症', key:'无中生有为隐性；男女患病相等；往往隔代遗传', difficulty:3},
        {id:'xd_dom', name:'伴X染色体显性遗传', pattern:'XᴬXʲ→女儿全显儿子正常', example:'抗维生素D佝偻病', key:'男患母必患；父女皆可患病；交叉遗传特点', difficulty:3},
        {id:'xd_rec', name:'伴X染色体隐性遗传', pattern:'XᵇY→男患女携带', example:'色盲/血友病', key:'男患者多于女；交叉遗传；母患子必患', difficulty:4},
        {id:'y_linked', name:'Y染色体遗传', pattern:'父传子不传女', example:'外耳道多毛症', key:'只有男性患病；父→子→孙', difficulty:2},
        {id:'cyto', name:'细胞质遗传', pattern:'母系遗传', example:'线粒体肌病', key:'母病子女皆病；与性别无关', difficulty:4},
        {id:'incomplete_dom', name:'不完全显性遗传', pattern:'RR×rr→中间型', example:'家族性高胆固醇血症/紫茉莉花色', key:'F₁代为中间型；F₂代出现性状分离(1:2:1)', difficulty:3},
        {id:'codominance', name:'共显性遗传', pattern:'两个等位基因同时表达', example:'AB型血型/ MN血型系统', key:'同一基因座上的两个等位基因同时表达(复等位基因)', difficulty:3},
        {id:'lethal', name:'致死遗传', pattern:'某些基因型致死', example:'显性致死(AA死亡)', key:'基因型致死的个体不能存活', difficulty:4},
        {id:'sex_influenced', name:'从性遗传', pattern:'表现型受性别影响', example:'秃顶', key:'男性发病率高于女性；同一基因型在不同性别表型不同', difficulty:4},
        {id:'delayed_onset', name:'延迟遗传', pattern:'年龄增长才表现', example:'亨廷顿舞蹈症', key:'个体发育到一定年龄后症状才显现', difficulty:4},
        {id:'mitochondrial', name:'线粒体遗传', pattern:'母系遗传', example:'Leber遗传性视神经病变', key:'遵循母系遗传规律', difficulty:4},
        {id:'genomic_imprinting', name:'基因组印记', pattern:'取决于来自父方或母方', example:'Prader-Willi综合征', key:'同源染色体若来自不同亲代则表达不同', difficulty:5},
        {id:'polygenic', name:'多基因遗传', pattern:'受多对等位基因控制', example:'身高/智力/肤色', key:'表现为数量性状；受环境因素影响大', difficulty:3},
        {id:'pleiotropy', name:'基因多效性', pattern:'一个基因影响多种性状', example:'苯丙酮尿症(智力低下+色素减少)', key:'一个突变基因导致多种异常表型', difficulty:4},
        {id:'sex_limited', name:'限性遗传', pattern:'只在一种性别表达', example:'前列腺癌/子宫发育不全', key:'性状只在一种性别中表达（基因可在常染色体或性染色体上，受性激素调控）', difficulty:4},
        {id:'mosaic', name:'镶嵌遗传', pattern:'同一个体不同细胞基因型不同', example:'花猫(雌猫)', key:'X染色体失活程度在不同细胞不同', difficulty:5},
        {id:'dynamic', name:'动态突变', pattern:'基因不稳定重复扩增', example:'脆性X综合征(FMR1基因CGG重复)', key:'代数增加越严重', difficulty:5},
        {id:'imprinting_disorder', name:'印记紊乱', problem:'Prader-Willi综合征', pattern:'父源染色体缺失/重复', tip:'源自父亲的15号染色体q11-q13缺失'},
        {id:'complex_1', name:'复合型遗传(常隐+伴X隐)', problem:'红绿色盲+白化病', pattern:'两种遗传病同时存在', tip:'分别判断各病的遗传方式再综合'},
        {id:'complex_2', name:'复合型遗传(从性+多基因)', problem:'先天性心脏病', pattern:'主基因+微效基因+环境因素', tip:'需综合多种遗传方式分析'},
        {id:'complex_3', name:'复合型遗传(线粒体+核基因)', problem:'Leber遗传性视神经病变+其他眼疾', pattern:'mtDNA突变+核基因突变的叠加效应', tip:'先判断是否为母系遗传，再考虑核基因影响'}
    ],
    currentType: null,
    userAnswer: null,
    hintLevel: 0,
    score: { total:0, correct:0 },
    history: [],
    currentQuestion: null,

    init() {
        this._render();
    },

    selectType(typeId) {
        this.currentType = this.types.find(t => t.id === typeId);
        this.hintLevel = 0;
        this.userAnswer = null;
        this.currentQuestion = this._generateQuestion(this.currentType);
        this._render();
    },

    _generateQuestion(type) {
        if (!type) return null;
        
        const templates = {
            'ar_dom': {
                pedigree: this._drawPedigree('ar_dom'),
                question: '根据系谱图，该遗传病的遗传方式是？',
                options: ['常染色体显性遗传', '常染色体隐性遗传', '伴X染色体显性遗传', '伴X染色体隐性遗传'],
                answer: 0,
                analysis: '判断依据：①父母患病子女正常→显性遗传；②男女患病概率相等→常染色体；③无"父传子不传女"特征排除Y连锁。综合：常染色体显性遗传。',
                geneTypes: { I_1:'Aa', I_2:'aa', II_1:'Aa', II_2:'aa', III_1:'Aa' },
                probability: '若II-1(Aa)与正常女性(aa)婚配，子代患病概率=50%'
            },
            'ar_rec': {
                pedigree: this._drawPedigree('ar_rec'),
                question: '系谱图中III-1的基因型可能是？',
                options: ['AA或Aa', 'AA或aa', 'Aa或aa', '只能是Aa'],
                answer: 0,
                analysis: '"无中生有"为隐性。男女患病概率相等说明是常染色体隐性。父母(I-1,I-2)均为携带者(Aa)，则III-1表现型正常，基因型可能为AA(1/3)或Aa(2/3)。',
                geneTypes: { I_1:'Aa', I_2:'Aa', II_1:'Aa', II_2:'Aa', III_1:'AA/Aa' },
                probability: 'III-1与携带者婚配，子代患病概率=2/3×1/4=1/6'
            },
            'xd_rec': {
                pedigree: this._drawPedigree('xd_rec'),
                question: '该系谱图最可能的遗传方式是？',
                options: ['常染色体隐性遗传', '伴X染色体隐性遗传', '常染色体显性遗传', 'Y染色体遗传'],
                answer: 1,
                analysis: '关键特征：①男患者多于女患者；②交叉遗传(外祖父→母亲→儿子)；③母患子必患。符合伴X隐性遗传特点。',
                geneTypes: { I_1:'XᴮXᵇ', I_2:'XᴮY', II_1:'XᵇXᵇ', II_2:'XᴮY', III_1:'XᴮXᵇ' },
                probability: 'III-1(XᴮXᵇ)与正常男性(XᴮY)婚配，儿子患病概率=1/4'
            },
            'xd_dom': {
                pedigree: this._drawPedigree('xd_dom'),
                question: '若II-2（杂合子患者XᴬXᵃ）与正常男性结婚，其女儿患病的概率是？',
                options: ['0', '1/2', '1/4', '100%'],
                answer: 1,
                analysis: '伴X显性遗传：II-2为杂合子患者(XᴬXᵃ)，与正常男性(XᵃY)结婚。女儿从父亲获得Xᵃ（固定），从母亲获得Xᴬ或Xᵃ各50%概率。若获得Xᴬ则患病(XᴬXᵃ)，若获得Xᵃ则正常(XᵃXᵃ)。故女儿患病概率=1/2。',
                geneTypes: { I_1:'XᵃXᵃ', I_2:'XᴬY', II_1:'XᴬXᵃ', II_2:'XᴬXᵃ', III_1:'XᴬXᵃ/XᵃXᵃ' },
                probability: '女儿患病概率=1/2(母传Xᴬ的概率)'
            },
            'y_linked': {
                pedigree: this._drawPedigree('y_linked'),
                question: '该遗传病的遗传特点是？',
                options: ['男女患病概率相等', '只有男性患病且父传子', '女性患者多于男性', '隔代遗传'],
                answer: 1,
                analysis: 'Y染色体遗传特征：①致病基因位于Y染色体上；②只有男性患病；③父→子→孙，代代相传；④不会出现女性患者。',
                geneTypes: { I_1:'XX', I_2:'XYᴬ', II_1:'XYᴬ', II_2:'XX', III_1:'XYᴬ' },
                probability: '男性后代100%患病，女性后代0%患病'
            }
        };

        const base = templates[type.id] || {
            pedigree: this._drawPedigree(type.id),
            question: `关于${type.name}，以下说法正确的是？`,
            options: [type.key, '该病只在女性中发病', '属于多基因遗传病', '与环境因素无关'],
            answer: 0,
            analysis: type.key + '\n\n这是广东卷高频考点，需牢记各遗传方式的典型特征和判断口诀。',
            geneTypes: {},
            probability: '详见具体系谱图分析'
        };

        return {
            ...base,
            typeId: type.id,
            typeName: type.name,
            difficulty: type.difficulty,
            hintSteps: [
                `提示1：观察系谱图中男女患者的数量关系`,
                `提示2：${type.key.split('；')[0]}`,
                `提示3：${type.key.split('；')[1] || type.example}`
            ]
        };
    },

    _drawPedigree(typeId) {
        const svgTemplates = {
            'ar_dom': `<svg viewBox="0 0 400 300" class="pedigree-svg">
                <defs><marker id="parr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#333"/></marker></defs>
                <g stroke="#333" fill="none" stroke-width="1.5"><line x1="200" y1="40" x2="120" y2="90"/><line x1="200" y1="40" x2="280" y2="90"/><line x1="120" y1="130" x2="80" y2="180"/><line x1="120" y1="130" x2="160" y2="180"/><line x1="280" y1="130" x2="240" y2="180"/><line x1="280" y1="130" x2="320" y2="180"/></g>
                <circle cx="200" cy="25" r="15" fill="#fff" stroke="#E74C3C" stroke-width="2.5"/><text x="200" y="30" text-anchor="middle" font-size="11">Ⅰ-1</text>
                <rect x="105" y="90" width="30" height="30" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="120" y="110" text-anchor="middle" font-size="10">Ⅰ-2</text>
                <circle cx="80" cy="195" r="14" fill="#FFE0E0" stroke="#E74C3C" stroke-width="2"/><text x="80" y="199" text-anchor="middle" font-size="9">Ⅱ-1</text>
                <rect x="145" y="180" width="28" height="28" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="159" y="198" text-anchor="middle" font-size="9">Ⅱ-2</text>
                <circle cx="240" cy="195" r="14" fill="#FFE0E0" stroke="#E74C3C" stroke-width="2"/><text x="240" y="199" text-anchor="middle" font-size="9">Ⅱ-3</text>
                <rect x="305" y="180" width="28" height="28" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="319" y="198" text-anchor="middle" font-size="9">Ⅱ-4</text>
                <text x="20" y="280" font-size="10" fill="#666">■正常男 ●正常女 ■患病男 ●患病女</text>
            </svg>`,
            'ar_rec': `<svg viewBox="0 0 400 300" class="pedigree-svg">
                <defs><marker id="parr2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#333"/></marker></defs>
                <g stroke="#333" fill="none" stroke-width="1.5"><line x1="200" y1="40" x2="120" y2="90"/><line x1="200" y1="40" x2="280" y2="90"/><line x1="120" y1="130" x2="80" y2="180"/><line x1="120" y1="130" x2="160" y2="180"/><line x1="160" y1="210" x2="140" y2="250"/><line x1="160" y1="210" x2="180" y2="250"/></g>
                <circle cx="200" cy="25" r="15" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="200" y="30" text-anchor="middle" font-size="11">Ⅰ-1</text>
                <rect x="105" y="90" width="30" height="30" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="120" y="110" text-anchor="middle" font-size="10">Ⅰ-2</text>
                <circle cx="80" cy="195" r="14" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="80" y="199" text-anchor="middle" font-size="9">Ⅱ-1</text>
                <rect x="145" y="180" width="28" height="28" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="159" y="198" text-anchor="middle" font-size="9">Ⅱ-2</text>
                <circle cx="140" cy="265" r="13" fill="#FFE0E0" stroke="#E74C3C" stroke-width="2"/><text x="140" y="269" text-anchor="middle" font-size="8">Ⅲ-1</text>
                <rect x="165" y="250" width="26" height="26" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="178" y="267" text-anchor="middle" font-size="8">Ⅲ-2</text>
                <text x="20" y="290" font-size="10" fill="#666">■正常男 ●正常女 ■患病男 ●患病女</text>
            </svg>`,
            'xd_rec': `<svg viewBox="0 0 450 320" class="pedigree-svg">
                <defs><marker id="parr3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#333"/></marker></defs>
                <g stroke="#333" fill="none" stroke-width="1.5"><line x1="225" y1="45" x2="140" y2="95"/><line x1="225" y1="45" x2="310" y2="95"/><line x1="140" y1="135" x2="100" y2="185"/><line x1="140" y1="135" x2="180" y2="185"/><line x1="310" y1="135" x2="270" y2="185"/><line x1="310" y1="135" x2="350" y2="185"/><line x1="180" y1="215" x2="160" y2="260"/><line x1="180" y1="215" x2="200" y2="260"/></g>
                <circle cx="225" cy="30" r="16" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="225" y="35" text-anchor="middle" font-size="10">Ⅰ-1</text>
                <rect x="123" y="95" width="32" height="32" rx="3" fill="#FFD0D0" stroke="#E74C3C" stroke-width="2.5"/><text x="139" y="116" text-anchor="middle" font-size="10">Ⅰ-2♂</text>
                <circle cx="100" cy="200" r="15" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="100" y="204" text-anchor="middle" font-size="9">Ⅱ-1</text>
                <circle cx="180" cy="200" r="15" fill="#FFD0D0" stroke="#E74C3C" stroke-width="2.5"/><text x="180" y="204" text-anchor="middle" font-size="9">Ⅱ-2♀</text>
                <rect x="255" y="185" width="30" height="30" rx="3" fill="#FFD0D0" stroke="#E74C3C" stroke-width="2.5"/><text x="270" y="205" text-anchor="middle" font-size="9">Ⅱ-3♂</text>
                <circle cx="350" cy="200" r="15" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="350" y="204" text-anchor="middle" font-size="9">Ⅱ-4</text>
                <rect x="147" y="260" width="28" height="28" rx="3" fill="#FFD0D0" stroke="#E74C3C" stroke-width="2.5"/><text x="161" y="279" text-anchor="middle" font-size="9">Ⅲ-1♂</text>
                <circle cx="200" cy="275" r="14" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="200" y="279" text-anchor="middle" font-size="8">Ⅲ-2</text>
                <text x="20" y="305" font-size="10" fill="#E74C3C">★ 男患者明显多于女患者 → 伴X隐性</text>
            </svg>`,
            'xd_dom': `<svg viewBox="0 0 420 300" class="pedigree-svg">
                <defs><marker id="parr4" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#333"/></marker></defs>
                <g stroke="#333" fill="none" stroke-width="1.5"><line x1="210" y1="40" x2="130" y2="90"/><line x1="210" y1="40" x2="290" y2="90"/><line x1="130" y1="130" x2="90" y2="180"/><line x1="130" y1="130" x2="170" y2="180"/><line x1="290" y1="130" x2="250" y2="180"/><line x1="290" y1="130" x2="330" y2="180"/></g>
                <rect x="195" y="25" width="30" height="30" rx="3" fill="#FFD0D0" stroke="#E74C3C" stroke-width="2.5"/><text x="210" y="45" text-anchor="middle" font-size="10">Ⅰ-1♂</text>
                <circle cx="130" cy="115" r="15" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="130" y="119" text-anchor="middle" font-size="9">Ⅰ-2</text>
                <circle cx="90" cy="195" r="14" fill="#FFD0D0" stroke="#E74C3C" stroke-width="2.5"/><text x="90" y="199" text-anchor="middle" font-size="9">Ⅱ-1♀</text>
                <rect x="155" y="180" width="28" height="28" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="169" y="198" text-anchor="middle" font-size="9">Ⅱ-2</text>
                <circle cx="250" cy="195" r="14" fill="#FFD0D0" stroke="#E74C3C" stroke-width="2.5"/><text x="250" y="199" text-anchor="middle" font-size="9">Ⅱ-3♀</text>
                <rect x="315" y="180" width="28" height="28" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="329" y="198" text-anchor="middle" font-size="9">Ⅱ-4</text>
                <text x="20" y="280" font-size="10" fill="#E74C3C">★ 父亲患病女儿必患 → 伴X显性</text>
            </svg>`,
            'y_linked': `<svg viewBox="0 0 380 280" class="pedigree-svg">
                <defs><marker id="parr5" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#333"/></marker></defs>
                <g stroke="#333" fill="none" stroke-width="1.5"><line x1="190" y1="40" x2="120" y2="90"/><line x1="190" y1="40" x2="260" y2="90"/><line x1="120" y1="130" x2="85" y2="175"/><line x1="120" y1="130" x2="155" y2="175"/><line x1="155" y1="205" x2="135" y2="245"/><line x1="155" y1="205" x2="175" y2="245"/></g>
                <rect x="175" y="25" width="30" height="30" rx="3" fill="#FFD0D0" stroke="#E74C3C" stroke-width="2.5"/><text x="190" y="45" text-anchor="middle" font-size="10">Ⅰ-1♂</text>
                <circle cx="120" cy="115" r="15" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="120" y="119" text-anchor="middle" font-size="9">Ⅰ-2</text>
                <circle cx="85" cy="190" r="14" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="85" y="194" text-anchor="middle" font-size="9">Ⅱ-1</text>
                <rect x="140" y="175" width="30" height="30" rx="3" fill="#FFD0D0" stroke="#E74C3C" stroke-width="2.5"/><text x="155" y="195" text-anchor="middle" font-size="9">Ⅱ-2♂</text>
                <rect x="122" y="245" width="26" height="26" rx="3" fill="#FFD0D0" stroke="#E74C3C" stroke-width="2.5"/><text x="135" y="263" text-anchor="middle" font-size="8">Ⅲ-1♂</text>
                <rect x="162" y="245" width="26" height="26" rx="3" fill="#fff" stroke="#333" stroke-width="1.5"/><text x="175" y="263" text-anchor="middle" font-size="8">Ⅲ-2</text>
                <text x="20" y="270" font-size="10" fill="#E74C3C">★ 只有男性患病，父传子 → Y染色体遗传</text>
            </svg>`
        };

        return svgTemplates[typeId] || svgTemplates['ar_dom'];
    },

    checkAnswer(optionIndex) {
        if (!this.currentQuestion || optionIndex === undefined) return;
        
        this.userAnswer = optionIndex;
        const isCorrect = optionIndex === this.currentQuestion.answer;
        
        this.score.total++;
        if (isCorrect) this.score.correct++;
        
        this.history.push({
            typeId: this.currentType.id,
            typeName: this.currentType.name,
            question: this.currentQuestion.question,
            userAnswer: optionIndex,
            correctAnswer: this.currentQuestion.answer,
            isCorrect,
            timestamp: new Date().toLocaleString()
        });

        localStorage.setItem('genetics_history', JSON.stringify(this.history));
        localStorage.setItem('genetics_score', JSON.stringify(this.score));

        this._render();
    },

    showHint() {
        if (this.hintLevel < 3) {
            this.hintLevel++;
            this._render();
        }
    },

    nextQuestion() {
        if (this.currentType) {
            this.currentQuestion = this._generateQuestion(this.currentType);
            this.hintLevel = 0;
            this.userAnswer = null;
            this._render();
        }
    },

    resetScore() {
        this.score = { total:0, correct:0 };
        this.history = [];
        localStorage.removeItem('genetics_history');
        localStorage.removeItem('genetics_score');
        this._render();
    },

    exportWrongPDF() {
        const wrongAnswers = this.history.filter(h => !h.isCorrect);
        if (wrongAnswers.length === 0) {
            alert('太棒了！没有错题！');
            return;
        }

        let content = `% 遗传系谱图练习 - 错题集\n\n`;
        content += `生成时间：${new Date().toLocaleString()}\n`;
        content += `总题数：${this.score.total} | 正确：${this.score.correct} | 正确率：${Math.round(this.score.correct/Math.max(1,this.score.total)*100)}%\n\n`;
        content += `${'='.repeat(60)}\n\n`;

        wrongAnswers.forEach((w, i) => {
            content += `【错题 ${i+1}】${w.typeName}\n`;
            content += `题目：${w.question}\n`;
            content += `你的答案：${['A','B','C','D'][w.userAnswer]} | 正确答案：${['A','B','C','D'][w.correctAnswer]}\n`;
            content += `\n`;
        });

        const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `遗传系谱图错题集_${new Date().toLocaleDateString()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    },

    _render() {
        const app = document.getElementById('genetics-pedigree-app');
        if (!app) return;

        app.innerHTML = `
        <div class="gt-enhanced">
            <div class="gt-header">
                <h2>🧬 遗传系谱图练习器 <span class="gd-badge">广东卷专用</span></h2>
                <div class="gt-stats">
                    <span>📊 总题数: ${this.score.total}</span>
                    <span>✅ 正确: ${this.score.correct}</span>
                    <span>📈 正确率: ${this.score.total > 0 ? Math.round(this.score.correct/this.score.total*100) : 0}%</span>
                    <button onclick="geneticsPedigreeTrainerEnhanced.resetScore()" title="重置统计">🔄</button>
                </div>
            </div>

            <div class="gt-body">
                <div class="type-selector">
                    <h3>📋 选择遗传方式类型 (${this.types.length}种)</h3>
                    <div class="type-grid">
                        ${this.types.map(t => `
                            <button class="type-card ${this.currentType?.id===t.id?'tc-active':''}" 
                                    onclick="geneticsPedigreeTrainerEnhanced.selectType('${t.id}')"
                                    data-diff="${t.difficulty}">
                                <div class="tc-name">${t.name}</div>
                                <div class="tc-example">例：${t.example}</div>
                                <div class="tc-diff">${'⭐'.repeat(t.difficulty)}</div>
                            </button>
                        `).join('')}
                    </div>
                </div>

                ${this.currentQuestion ? `
                <div class="question-panel">
                    <div class="q-header">
                        <span class="q-type">${this.currentQuestion.typeName}</span>
                        <span class="q-diff">难度：${'⭐'.repeat(this.currentQuestion.difficulty)}</span>
                    </div>

                    <div class="pedigree-display">
                        ${this.currentQuestion.pedigree}
                    </div>

                    <div class="q-text">${this.currentQuestion.question}</div>

                    <div class="options-grid">
                        ${this.currentQuestion.options.map((opt, i) => `
                            <button class="opt-btn ${this.userAnswer!==null?(i===this.currentQuestion.answer?'opt-correct':i===this.userAnswer?'opt-wrong':''):''}"
                                    onclick="geneticsPedigreeTrainerEnhanced.checkAnswer(${i})"
                                    ${this.userAnswer!==null?'disabled':''}>
                                <span class="opt-label">${['A','B','C','D'][i]}</span>
                                <span class="opt-text">${opt}</span>
                            </button>
                        `).join('')}
                    </div>

                    ${this.userAnswer !== null ? `
                    <div class="result-panel ${this.userAnswer===this.currentQuestion.answer?'result-correct':'result-wrong'}">
                        <h4>${this.userAnswer===this.currentQuestion.answer?'✅ 回答正确！':'❌ 回答错误'}</h4>
                        <div class="analysis-box">
                            <h5>📖 详细解析：</h5>
                            <p>${this.currentQuestion.analysis.replace(/\n/g,'<br>')}</p>
                            <div class="gene-info">
                                <strong>基因型参考：</strong>${Object.entries(this.currentQuestion.geneTypes).map(([k,v])=>`${k}:${v}`).join(' | ')}
                            </div>
                            <div class="prob-info">
                                <strong>概率计算：</strong>${this.currentQuestion.probability}
                            </div>
                        </div>
                        <div class="action-btns">
                            <button onclick="geneticsPedigreeTrainerEnhanced.nextQuestion()">📝 下一题</button>
                            <button onclick="geneticsPedigreeTrainerEnhanced.showHint()" ${this.hintLevel>=3?'disabled':''}>💡 提示(${this.hintLevel}/3)</button>
                        </div>
                    </div>
                    ` : `
                    <div class="action-bar">
                        <button onclick="geneticsPedigreeTrainerEnhanced.showHint()" ${this.hintLevel>=3?'disabled':''}>💡 获取提示</button>
                    </div>
                    `}

                    ${this.hintLevel > 0 && this.userAnswer === null ? `
                    <div class="hint-box">
                        <strong>💡 提示：</strong>${this.currentQuestion.hintSteps[this.hintLevel-1]}
                    </div>
                    ` : ''}
                </div>
                ` : `
                <div class="welcome-panel">
                    <div class="wp-icon">🧬</div>
                    <h3>欢迎来到遗传系谱图练习器</h3>
                    <p>选择上方的遗传方式类型开始练习<br>涵盖广东卷所有高频考点</p>
                    <div class="features-list">
                        <div class="feature-item">✅ 22种遗传方式全覆盖</div>
                        <div class="feature-item">✅ 即时反馈与详细解析</div>
                        <div class="feature-item">✅ 分步提示系统</div>
                        <div class="feature-item">✅ 错题自动收集导出</div>
                    </div>
                </div>
                `}
            </div>

            <div class="gt-footer">
                <button onclick="geneticsPedigreeTrainerEnhanced.exportWrongPDF()">📥 导出错题</button>
                <div class="tips-bar">
                    💡 <strong>解题技巧：</strong>"无中生有为隐性，有中生无为显性"；"隐性看女病，显性看男病"
                </div>
            </div>
        </div>`;
    }
};

// ==================== 5. 实验设计模板生成器（增强版）====================
const experimentDesignerEnhanced = {
    experimentTypes: [
        {id:'explore', name:'探究性实验', icon:'🔬', desc:'探究X对Y的影响（如：光照强度对光合速率的影响）',
         template:{
             purpose:'探究__对__的影响',
             hypothesis:'如果__，则__（预期：随着__的增加/减少，__将__）',
             variables:{
                 independent:'自变量：__（操作：__；梯度设置：__）',
                 dependent:'因变量：__（观测指标：__；测量方法：__）',
                 controlled:'无关变量：①__ ②__ ③__ ④__（控制方法：保持相同且适宜）'
             },
             materials:'实验材料：__\n实验器材：__\n试剂药品：__',
             steps:[
                 '1. 材料准备与预处理：__',
                 '2. 分组与标记：__（对照组/实验组1/实验组2...）',
                 '3. 自变量处理：按照__梯度分别进行__处理，保持其他条件相同',
                 '4. 培养或反应：在__条件下培养/反应__时间',
                 '5. 因变量测定：使用__方法测定__指标，记录数据',
                 '6. 数据处理：计算__，绘制__图表'
             ],
             expected:'预期结果：__\n（可描述曲线趋势、柱状图差异等）',
             conclusion:'结论：__（由实验结果可知，__对__有__影响，表现为__）'
         },
         tips:['明确自变量的操作定义和梯度','选择合适的观测指标和测量方法','注意平行重复原则（每组至少3次重复）','设置空白对照或标准对照'],
         commonErrors:['未控制无关变量导致结果不可靠','样本量过小缺乏统计学意义','未说明具体操作步骤','缺少重复实验验证']
        },
        {id:'verify', name:'验证性实验', icon:'✅', desc:'验证某生物学事实（如：验证光合作用产生氧气）',
         template:{
             purpose:'验证__',
             hypothesis:'若__成立，则应观察到__现象/结果',
             variables:{
                 independent:'自变量：__（是否具备__条件）',
                 dependent:'因变量：__（观察/检测到的现象：__）',
                 controlled:'无关变量：温度、pH、材料生理状态等保持一致'
             },
             materials:'实验对象：__\n关键试剂：__（用于检测/显色）\n仪器设备：__',
             steps:[
                 '1. 取__作为实验材料，分为A、B两组',
                 '2. A组（实验组）：给予__处理/条件',
                 '3. B组（对照组）：不给予__处理/或给予__处理作为对照',
                 '4. 在相同条件下培养/反应__时间',
                 '5. 观察记录两组的__现象/检测结果',
                 '6. 比较分析两组差异，得出结论'
             ],
             expected:'预期：实验组出现__现象，对照组__（或不出现该现象）',
             conclusion:'结论：实验证明__/否定了__这一生物学事实'
         },
         tips:['对照设置要合理（阳性对照/阴性对照）','检测方法要有特异性','实验条件要明确可复现','结果判断标准要客观'],
         commonErrors:['对照组设置不当','检测方法灵敏度不够','未排除干扰因素','主观臆断代替客观数据']
        },
        {id:'observe', name:'观察类实验', icon:'👁️', desc:'观察类实验（如：观察细胞的有丝分裂、观察质壁分离等）',
         template:{
             purpose:'观察__',
             hypothesis:'通过__方法可以观察到__的结构/过程/现象',
             variables:{},
             materials:'观察对象：__（来源、状态要求）\n制片试剂：__（染色剂、固定液等）\n显微镜及配件：__',
             steps:[
                 '1. 取材：选取__部位/时期的材料',
                 '2. 固定/处理：用__溶液固定/处理__时间',
                 '3. 制片：__（装片/切片/涂片），滴加__染色',
                 '4. 观察：先用低倍镜找到__，再换高倍镜观察__细节',
                 '5. 记录：绘制__示意图/拍照记录/描述观察到的特征',
                 '6. 统计：统计__数量/比例/分布情况'
             ],
             expected:'预期观察到：①__ ②__ ③__',
             conclusion:'结论：__具有__特征/__过程中发生了__变化'
         },
         tips:['取材时机很重要（如根尖分生区取分裂旺盛时期）','临时装片制作要规范（避免气泡、重叠）','先低倍后高倍，不要直接用高倍镜','绘图要真实反映观察到的内容'],
         commonErrors:['取材部位或时期不当','装片制作质量差影响观察','未遵循正确的显微镜使用顺序','绘图失真或标注错误']
        },
        {id:'survey', name:'调查类实验', icon:'📊', desc:'调查类实验（如：调查人群中的遗传病、调查种群密度等）',
         template:{
             purpose:'调查__（如：某种遗传病的发病率/某区域种群密度）',
             hypothesis:'__地区/人群中__的__为__（预估）',
             variables:{
                 independent:'调查范围/样本：__',
                 dependent:'记录指标：__（发病率/密度/多样性指数等）',
                 controlled:'调查方法统一、评判标准一致'
             },
             materials:'调查表/记录本\n计数工具（样方框、标志物等）\n参考资料/鉴定手册',
             steps:[
                 '1. 确定调查对象和范围：__（总体/抽样方法）',
                 '2. 设计调查方案：采用__法（样方法/标志重捕法/问卷调查法等）',
                 '3. 实施调查：按照__方法进行__，记录原始数据',
                 '4. 数据整理：汇总数据，计算__（发病率=患病人数/总人数×100%等）',
                 '5. 结果分析：比较不同__之间的差异，分析可能原因',
                 '6. 撰写报告：包括目的、方法、结果、讨论和建议'
             ],
             expected:'预计调查结果：__',
             conclusion:'结论：__（结合调查数据和背景知识进行分析）'
         },
         tips:['样本量要足够大且有代表性','随机取样避免主观偏差','遗传病调查要注意区分发病率和遗传方式','保护被调查者隐私'],
         commonErrors:['样本量太小或取样不随机','混淆发病率与遗传方式','数据处理方法不当','伦理问题考虑不足']
        },
        {id:'model', name:'模拟/模型实验', icon:'🧪', desc:'模拟实验（如：模拟性状分离比、模拟种群数量变化等）',
         template:{
             purpose:'模拟__过程/现象',
             hypothesis:'通过__模型可以模拟/展示__规律',
             variables:{
                 independent:'模型参数：__（代表__）',
                 dependent:'模型输出/结果：__（代表__）',
                 controlled:'每次模拟的条件保持一致'
             },
             materials:'模拟材料：__（代表生物体/基因/个体等）\n容器/场地：__\n记录工具：__',
             steps:[
                 '1. 建立模型：用__代表__，设定初始条件__',
                 '2. 设定规则：__操作代表__过程（如抓取代表配子结合等）',
                 '3. 进行多次重复模拟：每次__，共重复__次',
                 '4. 记录每次结果：__',
                 '5. 统计分析：计算__比例/趋势，与理论值比较',
                 '6. 得出结论：模拟结果说明__'
             ],
             expected:'预期模拟结果接近理论值：__',
             conclusion:'结论：__过程遵循__规律（或：__因素会影响__）'
         },
         tips:['明确模型的对应关系（什么代表什么）','重复次数要足够多以减小误差','记录原始数据便于统计分析','讨论模型的局限性'],
         commonErrors:['模型简化过度失去代表性','重复次数不够导致偏差大','未说明模型假设条件','忽视模型与现实差异']
        }
    ],

    caseLibrary: [
        {id:1, title:'探究光照强度对光合速率的影响', type:'explore', difficulty:3,
         content:`【实验目的】探究不同光照强度对黑藻光合速率的影响

【实验假设】如果光照强度是限制光合作用的主要因素，则随着光照强度增加，单位时间内叶片上浮的数量（或O₂释放量）将增加，直至达到光饱和点。

【变量设计】
- 自变量：光照强度（通过调节光源距离或使用不同功率光源实现）
  操作：设置5个梯度（如：弱光、中弱光、中等光、中强光、强光）
  或使用照度计精确控制：0.5k、1k、2k、4k、8k klx
- 因变量：光合速率
  观测指标：单位时间内圆形叶片上浮的数量（沉浮法）
  或：单位时间内O₂气泡释放量（计数法）
  或：单位时间内CO₂吸收量（红外线CO₂分析仪）
- 无关变量：温度（恒温水浴25℃）、CO₂浓度（NaHCO₃溶液提供）、叶片大小和生理状态（选取同一植株相似位置的叶片）、pH值

【材料与器材】
- 材料：生长健壮的黑藻（或金鱼藻、菠菜叶圆片）
- 器材：100mL烧杯（5个）、光源（台灯或LED灯）、镊子、打孔器（直径0.5cm）、秒表、直尺
- 试剂：0.5% NaHCO₃溶液（提供CO₂）、蒸馏水

【实验步骤】
1. 叶片制备：用打孔器避开叶脉打取30个叶圆片，放入注射器中，抽取少量水后排出空气，使叶片下沉（抽出叶肉细胞间隙的气体）
2. 分组：向5个烧杯各加入等量（50mL）的0.5% NaHCO₃溶液，各放入6个下沉的叶圆片
3. 光照处理：将烧杯分别置于距光源10cm、20cm、40cm、60cm、80cm处（或其他设定的光照强度梯度），同时开始计时
4. 观察记录：每分钟记录一次各烧杯中上浮叶片的累计数量，持续15分钟
5. 重复：每个光照强度重复3次，取平均值
6. 数据处理：以上浮叶片数/时间为纵坐标，光照强度为横坐标绘制曲线图

【预期结果】
- 弱光条件下上浮速度慢（光合<呼吸或略大于呼吸）
- 随着光照强度增加，上浮速度加快（光合速率增大）
- 达到某一光照强度后，上浮速度不再明显加快（达到光饱和点）

【实验结论】
在一定范围内，光照强度越大，光合速率越快；但超过光饱和点后，光照不再是限制因素。

【广东卷考点提示】
⭐ 自变量的"等梯度"设置方法
⭐ 无关变量的控制（温度用恒温水浴最常用）
⭐ "沉浮法"原理：光合产生O₂填充叶肉间隙使叶片上浮
⭐ 曲线分析与实际应用（大棚补光的依据）`,
         tags:['光合作用','环境因素','定量实验']},
        {id:2, title:'验证光合作用的产物和场所', type:'verify', difficulty:2,
         content:`【实验目的】验证：（1）光合作用产生淀粉；（2）光合作用需要叶绿体；（3）光合作用需要光

【实验假设】若光合作用产生淀粉且需要光和叶绿体，则：
- 见光部分遇碘变蓝，遮光部分不变蓝
- 绿色部分变蓝，非绿色部分不变蓝（如银边天竺葵）

【经典实验：萨克斯实验（1864年）】

【实验步骤】
1. 暗处理：将天竺葵放在黑暗处24-48小时（耗尽原有淀粉）
   目的：排除原有淀粉对实验结果的干扰
2. 选叶遮光：选取一片健康叶片，用锡箔纸（或黑纸片）遮盖叶片的一部分（上下两面都要遮）
   设置：见光部分 vs 遮光部分 → 形成对照
3. 光照：将植物移到光下照射几小时（通常2-4小时）
4. 脱色：摘下叶片，去掉锡箔纸，放入盛有酒精的小烧杯中
   - 将小烧杯置于大烧杯中隔水加热（水浴加热）
   - 直至叶片变成黄白色（叶绿素溶解于酒精中）
   注意：酒精易燃，必须水浴加热！不能直接加热！
5. 漂洗染色：用清水漂洗叶片后，滴加碘液
6. 观察：稍停片刻，用清水冲掉碘液，观察颜色变化

【预期结果】
- 见光部分：呈蓝色（产生了淀粉）
- 遮光部分：呈黄褐色/棕黄色（没有产生淀粉）

【实验结论】
1. 光合作用产生了淀粉
2. 光是光合作用的必要条件

【银边天竺葵实验扩展】
- 绿色部分变蓝（有叶绿体→能进行光合→产生淀粉）
- 白色边缘不变蓝（无叶绿体→不能进行光合→无淀粉）
→ 结论：叶绿体是光合作用的场所

【常见答题要点】
⭐ "暗处理"的目的和必要性
⭐ "隔水加热"的原因（酒精沸点78℃，易燃）
⭐ 碘液检测的是淀粉（专一性）
⭐ 对照实验的设计思想（单一变量原则）
⭐ 此实验还能证明什么？（叶绿体是场所——需用银边天竺葵）`,
         tags:['光合作用','经典实验','验证性实验']},
        {id:3, title:'观察植物细胞的有丝分裂', type:'observe', difficulty:3,
         content:`【实验目的】观察植物细胞有丝分裂的过程，识别分裂各时期的细胞形态特点

【实验原理】
- 高等植物细胞的有丝分裂主要发生在分生组织（如根尖、茎尖生长点）
- 细胞在解离液中被杀死并分散开，便于制片观察
- 龙胆紫/醋酸洋红染液可使染色体着色，便于观察

【材料与试剂】
- 材料：洋葱根尖（或大蒜根尖）
- 试剂：
  * 解离液：95%酒精 : 浓盐酸 = 1:1（体积比）
  * 染色液：0.01g/mL龙胆紫溶液（或醋酸洋红染液）
  * 清水（用于漂洗）
- 器材：显微镜、载玻片、盖玻片、玻璃皿、镊子、滴管、剪刀

【实验步骤（关键步骤详解）】

1. **培养生根（提前3-4天）**
   - 将洋葱放在装满水的广口瓶上，使根部接触水面
   - 室温（约25℃）培养至根长1-5cm
   - 最佳取材时间：上午10-14时（分裂旺盛期）

2. **解离（约3-5分钟）**
   - 切取根尖2-3mm（只取分生区！）
   - 放入解离液中，室温下解离3-5分钟
   - 目的：使组织中的细胞相互分离开来
   ⚠️ 解离时间不能过长（否则细胞结构破坏过度）
   ⚠️ 不能过短（否则细胞分散不开）

3. **漂洗（约10分钟）**
   - 用镊子取出根尖，放入清水中漂洗10分钟
   - 目的：洗去解离液，防止解离过度并利于染色
   ⚠️ 这一步常被忽略但不能省略！

4. **染色（约3-5分钟）**
   - 把根尖放在载玻片上，加一滴染液
   - 染色3-5分钟
   - 目的：使染色体着色（深色或紫红色）

5. **制片与压片（关键技术！）**
   - 加一滴清水，盖上盖玻片
   - 先用拇指轻压盖玻片（使根尖分散开）
   - 再用铅笔橡皮头轻轻敲击盖玻片（使细胞分散成单层）
   ⚠️ 力度要适中：太轻→细胞重叠；太压→细胞破碎

6. **观察（先低倍后高倍）**
   - 低倍镜：找到分生区（细胞呈正方形、排列紧密、有的细胞正在分裂）
   - 高倍镜：寻找各分裂期的典型细胞
   - 重点观察：染色体形态和行为变化

【各时期识别要点】
| 时期 | 主要特征 | 染色体行为 |
|------|---------|-----------|
| 间期 | 核膜完整，染色质呈细丝状 | DNA复制+蛋白质合成 |
| 前期 | 核膜核仁消失，染色体出现 | 染质螺旋化→染色体 |
| 中期 | 染色体排列在赤道板上 | 形态清晰、数目可数 ★ |
| 后期 | 着丝粒分裂，姐妹染色单体分开 | 向两极移动 |
| 末期 | 核膜核仁重建，细胞板形成 | 每极得到一套染色体 |

【实验结论】
观察到了细胞有丝分裂各时期的图像，证实了植物细胞的分裂过程遵循：间期→前期→中期→后期→末期的顺序。

【广东卷高频考点】
⭐ 为什么取根尖2-3mm？（分生区在此范围）
⭐ 解离液的作用？漂洗的目的？
⭐ 为什么找不到间期细胞？（间期占时长但细胞数目不一定最多）
⭐ 最容易观察和计数的是哪个时期？（中期——染色体形态最清晰）
⭐ 细胞为什么死亡？（解离液杀死了细胞）`,
         tags:['有丝分裂','显微观察','细胞分裂']},
        {id:4, title:'探究酶的特性（温度/pH对酶活性的影响）', type:'explore', difficulty:4,
         content:`【实验目的】探究温度（或pH）对酶活性的影响

【实验假设】酶活性受温度（或pH）影响，在最适温度（或pH）时活性最高，偏离最适值活性降低

【以"探究温度对唾液淀粉酶活性的影响"为例】

【变量设计】
- 自变量：温度（设置5个梯度：0℃、20℃、37℃、60℃、80℃）
- 因变量：酶活性（通过淀粉分解程度间接反映）
  检测方法：碘液检测剩余淀粉（蓝色深浅）或斐林试剂检测还原糖
- 无关变量：唾液稀释度、淀粉溶液浓度、反应时间、pH值、试剂用量等

【材料与器材】
- 新鲜唾液（提前漱口后收集，稀释10倍）
- 3%可溶性淀粉溶液
- 碘液（或班氏试剂/斐林试剂）
- 试管（10支以上）、试管架、滴管、温度计、水浴锅（或烧杯+温水）
- 冰块、热水、秒表

【实验步骤】

**方案一：碘液法（定性/半定量）**

1. 准备阶段：
   - 取洁净试管10支，编号1-10（每2支为一组，设5个温度梯度）
   - 每支试管加入2mL淀粉溶液

2. 温度预处理（关键步骤！）：
   - 将试管分别置于：冰水混合物(0℃)、室温(20℃)、37℃水浴、60℃水浴、80℃水浴
   - 平衡5分钟，使淀粉溶液达到设定温度
   - 同时将唾液也分别在相应温度下预处理

3. 酶促反应：
   - 迅速向各试管中加入1mL相应温度的唾液，摇匀
   - 计时，准确反应5分钟（或设定统一时间）

4. 终止反应与检测：
   - 时间到后立即向每支试管滴加1-2滴碘液
   - 观察颜色变化并记录（深蓝→浅蓝→浅黄→棕黄→不变色）

5. 结果记录：

| 温度 | 颜色深浅 | 淀粉分解程度 | 酶活性判断 |
|-----|---------|------------|-----------|
| 0℃ | 深蓝色 | 几乎未分解 | 极低（低温抑制）|
| 20℃ | 蓝色 | 部分分解 | 较低 |
| 37℃ | 浅黄/不变色 | 完全或几乎完全分解 | 最高（最适温度）|
| 60℃ | 浅蓝色 | 少量分解 | 较低（部分变性）|
| 80℃ | 深蓝色 | 几乎未分解 | 极低（高温变性失活）|

**方案二：斐林试剂法（需水浴加热检测）**

- 反应结束后加入斐林试剂，50-65℃水浴加热2分钟
- 观察砖红色沉淀的多少（越多说明还原糖越多→酶活性越高）

【预期结果】
- 37℃左右酶活性最高（唾液淀粉酶最适温度约为37℃）
- 低于最适温度：随温度降低活性降低（低温抑制但可逆）
- 高于最适温度：随温度升高活性急剧下降直至失活（高温变性不可逆）

【实验结论】
唾液淀粉酶的活性受温度影响，在最适温度（约37℃）时活性最高；低温抑制酶活性但不会使酶失活（可逆）；高温会使酶变性失活（不可逆）。

【重要注意事项】
⭐ 必须先将底物和酶分别预热/预冷到设定温度再混合！（这是最常见的错误！）
⭐ 为什么不用过氧化氢酶做温度实验？（H₂O₂本身受热会分解，干扰结果）
⭐ 碘液法和斐林试剂法的区别：前者可在任意温度检测，后者需加热可能影响结果
⭐ pH实验不能用淀粉酶+淀粉体系？（淀粉在强酸条件下也会水解）`,
         tags:['酶','影响因素','对照实验']},
        {id:5, title:'调查人群中的遗传病', type:'survey', difficulty:3,
         content:`【调查目的】调查某地区人群中某种遗传病的发病率，分析其遗传方式和特点

【调查类型区分】
- 发病率调查：在广大人群中随机抽样调查，计算：患病人数/被调查总人数×100%
- 遗传方式调查：在患者家系内调查，绘制系谱图分析遗传方式

【以"调查红绿色盲的发病率"为例】

【调查准备】
1. 确定调查对象：某学校/社区全体学生或居民（样本量≥1000人）
2. 设计调查问卷/表格：
   - 基本信息：性别、年龄
   - 色觉检查结果（使用标准色盲检查图）
   - 家族史（如有家族病例可进一步追踪）
3. 准备工具：色盲检查图（石原氏色盲本等）、记录表格、知情同意书

【调查步骤】

1. **宣传与知情同意**
   - 说明调查目的和意义
   - 强调自愿参与原则
   - 保护个人隐私（匿名或编号记录）

2. **实施调查**
   - 使用标准色盲检查图逐一测试
   - 在自然光线下进行（避免光线影响判断）
   - 记录每位受试者的性别和检测结果
   - 正常/红绿色盲/色弱（细分类型可选）

3. **数据整理**
   - 统计总调查人数：N
   - 统计男性人数：Nₘ，女性人数：Nᵥ
   - 统计男性患者数：nₘ，女性患者数：nᵥ

4. **数据分析与计算**

   总发病率 = (nₘ + nᵥ) / N × 100%

   男性发病率 = nₘ / Nₘ × 100%（预期≈7%）
   女性发病率 = nᵥ / Nᵥ × 100%（预期≈0.5%）

   性别差异比 = (nₘ/Nₘ) / (nᵥ/Nᵥ)（预期男:女 ≈ 14:1）

5. **结果解释**
   - 若男性发病率显著高于女性 → 支持伴X隐性遗传
   - 与文献报道值（男7%、女0.5%）比较
   - 分析可能的误差来源

【预期结果】
- 总发病率约4-5%（男女平均）
- 男性发病率明显高于女性（约14:1的比例）
- 符合伴X染色体隐性遗传的特点

【调查报告撰写框架】
1. 标题、调查者信息、日期
2. 调查目的与意义
3. 对象与方法（抽样方法、样本量、检测方法）
4. 结果（数据表格、统计图表）
5. 分析与讨论（与理论值比较、误差分析）
6. 结论与建议
7. 参考文献

【注意事项与伦理要求】
⭐ 样本量要足够大（一般≥1000人才有统计学意义）
⭐ 随机抽样避免选择性偏倚
⭐ 保护受试者隐私（去标识化处理）
⭐ 获得知情同意
⭐ 不歧视任何受试者
⭐ 区分"发病率"和"遗传方式"两种调查的不同方法`,
         tags:['遗传病','调查方法','人类遗传学']}
    ],

    state: {
        selectedType: null,
        currentTemplate: null,
        userInputs: {},
        selectedCase: null,
        validationErrors: [],
        showTips: false
    },

    init() {
        this._render();
    },

    selectType(typeId) {
        this.state.selectedType = this.experimentTypes.find(t => t.id === typeId);
        this.state.currentTemplate = JSON.parse(JSON.stringify(this.state.selectedType.template));
        this.state.userInputs = {};
        this.state.validationErrors = [];
        this.state.showTips = false;
        this._render();
    },

    loadCase(caseId) {
        this.state.selectedCase = this.caseLibrary.find(c => c.id === caseId);
        this._render();
    },

    updateInput(field, value) {
        this.state.userInputs[field] = value;
        
        if (this.state.showTips) {
            this.validateForm();
        }
        this._render();
    },

    validateForm() {
        this.state.validationErrors = [];
        const requiredFields = ['purpose', 'hypothesis'];
        
        requiredFields.forEach(field => {
            if (!this.state.userInputs[field] || this.state.userInputs[field].trim().length < 5) {
                this.state.validationErrors.push(`${field === 'purpose' ? '实验目的' : '实验假设'} 内容过于简短，请详细描述`);
            }
        });

        if (this.state.userInputs.purpose && !this.state.userInputs.purpose.includes('探究') && 
            !this.state.userInputs.purpose.includes('验证') && !this.state.userInputs.purpose.includes('观察')) {
            this.state.validationErrors.push('建议实验目的以"探究/验证/观察"开头');
        }

        return this.state.validationErrors.length === 0;
    },

    toggleTips() {
        this.state.showTips = !this.state.showTips;
        if (this.state.showTips) {
            this.validateForm();
        }
        this._render();
    },

    generateTemplate() {
        if (!this.state.selectedType) return;

        let template = {...this.state.currentTemplate};
        
        Object.keys(this.state.userInputs).forEach(key => {
            const value = this.state.userInputs[key];
            
            if (typeof template[key] === 'string') {
                template[key] = template[key].replace(/__/g, value || '___');
            } else if (typeof template[key] === 'object' && template[key] !== null) {
                Object.keys(template[key]).forEach(subKey => {
                    if (typeof template[key][subKey] === 'string') {
                        template[key][subKey] = template[key][subKey].replace(/__/g, value || '___');
                    } else if (Array.isArray(template[key][subKey])) {
                        template[key][subKey] = template[key][subKey].map(step => 
                            typeof step === 'string' ? step.replace(/__/g, value || '___') : step
                        );
                    }
                });
            }

            if (Array.isArray(template.steps)) {
                template.steps = template.steps.map(step =>
                    typeof step === 'string' ? step.replace(/__/g, value || '___') : step
                );
            }
        });

        return template;
    },

    exportTemplate() {
        const template = this.generateTemplate();
        if (!template) return;

        let content = `# ${this.state.selectedType.name}设计模板\n\n`;
        content += `生成时间：${new Date().toLocaleString()}\n`;
        content += `${'='.repeat(50)}\n\n`;

        content += `## 一、实验目的\n${template.purpose}\n\n`;
        content += `## 二、实验假设\n${template.hypothesis}\n\n`;

        if (Object.keys(template.variables).length > 0) {
            content += `## 三、变量设计\n`;
            Object.entries(template.variables).forEach(([key, val]) => {
                content += `- **${key}**: ${val}\n`;
            });
            content += '\n';
        }

        content += `## 四、材料与器材\n${template.materials}\n\n`;
        
        content += `## 五、实验步骤\n`;
        if (Array.isArray(template.steps)) {
            template.steps.forEach((step, i) => {
                content += `${step}\n`;
            });
        }
        content += '\n';

        content += `## 六、预期结果\n${template.expected}\n\n`;
        content += `## 七、实验结论\n${template.conclusion}\n\n`;

        if (this.state.selectedType.tips) {
            content += `## 八、答题技巧与注意事项\n`;
            this.state.selectedType.tips.forEach(tip => {
                content += `⭐ ${tip}\n`;
            });
            content += '\n';
        }

        if (this.state.selectedType.commonErrors) {
            content += `## 九、常见错误警示\n`;
            this.state.selectedType.commonErrors.forEach(error => {
                content += `❌ ${error}\n`;
            });
        }

        const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `实验设计模板_${this.state.selectedType.name}_${new Date().toLocaleDateString()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    },

    _render() {
        const app = document.getElementById('experiment-designer-app');
        if (!app) return;

        app.innerHTML = `
        <div class="ed-enhanced">
            <div class="ed-header">
                <h2>🧪 实验设计模板生成器 <span class="gd-badge">广东卷专用</span></h2>
                <p class="ed-subtitle">标准化实验设计模板 · 广东卷答题规范 · 案例参考库</p>
            </div>

            <div class="ed-body">
                <div class="type-selector">
                    <h3>📋 选择实验类型 (${this.experimentTypes.length}种)</h3>
                    <div class="type-grid-ed">
                        ${this.experimentTypes.map(t => `
                            <button class="type-card-ed ${this.state.selectedType?.id===t.id?'tce-active':''}" 
                                    onclick="experimentDesignerEnhanced.selectType('${t.id}')">
                                <span class="tce-icon">${t.icon}</span>
                                <span class="tce-name">${t.name}</span>
                                <span class="tce-desc">${t.desc}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="case-library-section">
                    <h3>📚 经典案例库 (${this.caseLibrary.length}例)</h3>
                    <div class="case-grid">
                        ${this.caseLibrary.map(c => `
                            <button class="case-card ${this.state.selectedCase?.id===c.id?'case-active':''}"
                                    onclick="experimentDesignerEnhanced.loadCase(${c.id})">
                                <span class="case-type">${this.experimentTypes.find(t=>t.id===c.type)?.icon||''} ${c.type==='explore'?'探究':c.type==='verify'?'验证':c.type==='observe'?'观察':'调查'}</span>
                                <span class="case-title">${c.title}</span>
                                <span class="case-diff">${'⭐'.repeat(c.difficulty)}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                ${this.state.selectedCase ? `
                <div class="case-detail-panel">
                    <h4>📖 案例：${this.state.selectedCase.title}</h4>
                    <div class="case-content">${this.state.selectedCase.content.replace(/\n/g,'<br>').replace(/⭐/g,'<span class="gd-star">⭐</span>').replace(/⚠️/g,'<span class="warning">⚠️</span>').replace(/❌/g,'<span class="error">❌</span>')}</div>
                    <div class="case-tags">
                        ${this.state.selectedCase.tags.map(tag=>`<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                ` : ''}

                ${this.state.selectedType ? `
                <div class="template-builder">
                    <div class="tb-header">
                        <h3>📝 ${this.state.selectedType.name}模板生成器</h3>
                        <div class="tb-actions">
                            <button onclick="experimentDesignerEnhanced.toggleTips()">
                                ${this.state.showTips?'隐藏提示':'显示提示'}
                            </button>
                            <button onclick="experimentDesignerEnhanced.exportTemplate()" class="btn-primary">💾 导出模板</button>
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group fg-wide">
                            <label>🎯 实验目的 <span class="required">*</span></label>
                            <textarea id="input-purpose" placeholder="例如：探究光照强度对黑藻光合速率的影响"
                                      oninput="experimentDesignerEnhanced.updateInput('purpose', this.value)"
                                      rows="2">${this.state.userInputs.purpose||''}</textarea>
                            ${this.state.validationErrors.some(e=>e.includes('目的'))?`<div class="error-msg">${this.state.validationErrors.find(e=>e.includes('目的'))}</div>`:''}
                        </div>

                        <div class="form-group fg-wide">
                            <label>💭 实验假设 <span class="required">*</span></label>
                            <textarea id="input-hypothesis" placeholder="如果...则...（预测实验结果）"
                                      oninput="experimentDesignerEnhanced.updateInput('hypothesis', this.value)"
                                      rows="2">${this.state.userInputs.hypothesis||''}</textarea>
                            ${this.state.validationErrors.some(e=>e.includes('假设'))?`<div class="error-msg">${this.state.validationErrors.find(e=>e.includes('假设'))}</div>`:''}
                        </div>

                        ${this.state.selectedType.template.variables && Object.keys(this.state.selectedType.template.variables).length > 0 ? `
                        <div class="form-group fg-wide">
                            <label>🔬 变量设计</label>
                            <div class="variables-inputs">
                                ${Object.entries(this.state.selectedType.template.variables).map(([key, val]) => `
                                    <div class="var-item">
                                        <strong>${key}:</strong>
                                        <textarea placeholder="${val.slice(0,50)}..."
                                                  oninput="experimentDesignerEnhanced.updateInput('${key}', this.value)"
                                                  rows="2">${this.state.userInputs[key]||''}</textarea>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}

                        <div class="form-group fg-half">
                            <label>🧪 材料与器材</label>
                            <textarea id="input-materials" placeholder="列出所需的实验材料、仪器设备和试剂..."
                                      oninput="experimentDesignerEnhanced.updateInput('materials', this.value)"
                                      rows="3">${this.state.userInputs.materials||''}</textarea>
                        </div>

                        <div class="form-group fg-half">
                            <label>📋 实验步骤</label>
                            <textarea id="input-steps" placeholder="按顺序写出详细的实验操作步骤...
1. ...
2. ..."
                                      oninput="experimentDesignerEnhanced.updateInput('steps', this.value)"
                                      rows="4">${this.state.userInputs.steps||''}</textarea>
                        </div>

                        <div class="form-group fg-half">
                            <label>📊 预期结果</label>
                            <textarea id="input-expected" placeholder="描述预期的实验现象或数据趋势..."
                                      oninput="experimentDesignerEnhanced.updateInput('expected', this.value)"
                                      rows="2">${this.state.userInputs.expected||''}</textarea>
                        </div>

                        <div class="form-group fg-half">
                            <label>✅ 实验结论</label>
                            <textarea id="input-conclusion" placeholder="根据预期结果得出的科学结论..."
                                      oninput="experimentDesignerEnhanced.updateInput('conclusion', this.value)"
                                      rows="2">${this.state.userInputs.conclusion||''}</textarea>
                        </div>
                    </div>

                    ${this.state.showTips ? `
                    <div class="tips-panel">
                        <h4>💡 ${this.state.selectedType.name}答题技巧</h4>
                        <div class="tips-list">
                            ${this.state.selectedType.tips?.map(tip => `<div class="tip-item">✅ ${tip}</div>`).join('') || ''}
                        </div>
                        
                        ${this.state.selectedType.commonErrors?.length > 0 ? `
                        <h4 style="margin-top:15px;">❌ 常见错误警示</h4>
                        <div class="errors-list">
                            ${this.state.selectedType.commonErrors.map(err => `<div class="err-item">❌ ${err}</div>`).join('')}
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}

                    <div class="preview-panel">
                        <h4>👁️ 模板预览</h4>
                        <div class="preview-content">
                            ${this.generateTemplate() ? `
                                <div class="preview-section"><strong>实验目的：</strong>${this.generateTemplate().purpose || '待填写'}</div>
                                <div class="preview-section"><strong>实验假设：</strong>${this.generateTemplate().hypothesis || '待填写'}</div>
                                ${this.generateTemplate().materials ? `<div class="preview-section"><strong>材料器材：</strong><pre>${this.generateTemplate().materials}</pre></div>` : ''}
                                ${this.generateTemplate().steps?.length ? `<div class="preview-section"><strong>实验步骤：</strong><ol>${this.generateTemplate().steps.map(s=>`<li>${s}</li>`).join('')}</ol></div>` : ''}
                                <div class="preview-section"><strong>预期结果：</strong>${this.generateTemplate().expected || '待填写'}</div>
                                <div class="preview-section"><strong>实验结论：</strong>${this.generateTemplate().conclusion || '待填写'}</div>
                            ` : '<p class="empty-preview">请选择实验类型并填写内容</p>'}
                        </div>
                    </div>
                </div>
                ` : `
                <div class="welcome-panel">
                    <div class="wp-icon">🧪</div>
                    <h3>欢迎来到实验设计模板生成器</h3>
                    <p>选择实验类型开始创建标准化实验设计方案<br>符合广东卷实验题答题规范</p>
                    <div class="features-list">
                        <div class="feature-item">✅ 5种实验类型全覆盖</div>
                        <div class="feature-item">✅ 5个经典案例参考</div>
                        <div class="feature-item">✅ 实时格式检查与提示</div>
                        <div class="feature-item">✅ 一键导出规范化模板</div>
                    </div>
                </div>
                `}
            </div>

            <div class="ed-footer">
                <div class="tips-bar">
                    💡 <strong>广东卷实验题答题要点：</strong>目的明确→假设合理→变量清楚→步骤可操作→预期与结论呼应
                </div>
            </div>
        </div>`;
    }
};

// ==================== 4. 光合/呼吸曲线解读训练（增强版）====================
const photosynthesisTrainerEnhanced = {
    curves: [
        {id:1, name:'光照强度-光合速率曲线', type:'光照', category:'基础', difficulty:2,
         desc:'横坐标为光照强度，纵坐标为光合速率。关键点：光补偿点、光饱和点',
         keyPoints:[
             {x:'原点', label:'A点', meaning:'只进行呼吸作用，无光合', formula:'Pn = -R'},
             {x:'光补偿点', label:'B点', meaning:'光合速率=呼吸速率，净光合为0', formula:'Pn = 0, Pg = R'},
             {x:'光饱和点前', label:'BC段', meaning:'限制因素是光照强度，随光照增强光合加快', formula:'Pn ∝ Light'},
             {x:'光饱和点', label:'C点', meaning:'达到最大光合速率，再增加光照不再提升', formula:'Pn = Pmax'},
             {x:'光饱和点后', label:'CD段', meaning:'限制因素转为CO₂浓度或温度', formula:'受CO₂或Temp限制'}
         ],
         questions:[
             {type:'choice', q:'图中B点的生物学含义是什么？', options:['光合速率=呼吸速率','光合速率最大','只进行呼吸','CO₂吸收量最大'], answer:0, analysis:'B点是光补偿点，此时光合速率等于呼吸速率，净光合速率为0，植物不积累有机物。'},
             {type:'choice', q:'CD段限制光合作用的主要因素是？', options:['光照强度','CO₂浓度','温度','水分'], answer:1, analysis:'达到光饱和点后，光照不再是限制因素，此时主要限制因素是CO₂浓度（或温度）。'},
             {type:'fill', q:'若该植物呼吸速率为6单位，则C点总光合速率=__单位（假设C点净光合为18）', answer:'24', analysis:'总光合速率(Pg) = 净光合速率(Pn) + 呼吸速率(R) = 18 + 6 = 24单位'}
         ]},
        {id:2, name:'CO₂浓度-光合速率曲线', type:'CO2', category:'基础', difficulty:2,
         desc:'横坐标为CO₂浓度，纵坐标为光合速率。关键点：CO₂补偿点、CO₂饱和点',
         keyPoints:[
             {x:'CO₂补偿点', label:'A点', meaning:'光合速率=呼吸速率的最低CO₂浓度', formula:'Pn = 0'},
             {x:'AB段', label:'AB段', meaning:'CO₂浓度是限制因素', formula:'Pn ∝ [CO₂]'},
             {x:'CO₂饱和点', label:'B点', meaning:'达到最大光合速率', formula:'Pn = Pmax'},
             {x:'BC段', label:'BC段', meaning:'限制因素转为光照强度或温度', formula:'受Light或Temp限制'}
         ],
         questions:[
             {type:'choice', q:'大棚中增施CO₂肥的作用原理？', options:['提高光饱和点','提高酶活性','提供更多原料','降低呼吸消耗'], answer:2, analysis:'CO₂是暗反应的原料，增施CO₂可促进暗反应，从而提高光合速率。在CO₂浓度低于饱和点时效果显著。'},
             {type:'fill', q:'温室中白天适宜的CO₂浓度约为__ppm（正常大气约400ppm）', answer:'800-1000', analysis:'温室中适当提高CO₂浓度至800-1000ppm可显著提高光合效率，但过高会导致气孔关闭反而下降。'}
         ]},
        {id:3, name:'温度-光合速率曲线', type:'temp', category:'综合', difficulty:3,
         desc:'双峰曲线，展示温度对光合和呼吸的不同影响。关键点：最适温度、三线交点',
         keyPoints:[
             {x:'低温区', label:'OA段', meaning:'酶活性低，光合<呼吸', formula:'酶活性受限'},
             {x:'最适温度(光合)', label:'B点', meaning:'光合速率最大的温度', formula:'T_opt_photo ≈ 25-30℃'},
             {x:'最适温度(呼吸)', label:'C点', meaning:'呼吸速率最大的温度', formula:'T_opt_resp ≈ 35-40℃'},
             {x:'高温区', label:'CD段', meaning:'酶变性失活，两者都下降', formula:'蛋白质变性'},
             {x:'净光合=0点', label:'D点', meaning:'净光合由正转负的温度', formula:'有机物开始消耗'}
         ],
         questions:[
             {type:'choice', q:'为什么光合作用的最适温度低于呼吸作用？', options:['光合酶更耐热','呼吸酶种类多','不同酶的最适温度不同','测量误差'], answer:2, analysis:'光合作用涉及多种酶（如Rubisco、ATP合成酶等），它们的最适温度通常在25-30℃；而呼吸作用的某些酶（如细胞色素氧化酶）最适温度更高。'},
             {type:'fill', q:'昼夜温差大有利于有机物积累的原因：白天温度高______强，夜间温度低______弱', answer:'光合；呼吸', analysis:'白天较高温度有利于光合作用制造有机物，夜间较低温度减弱呼吸作用减少消耗，因此昼夜温差大有利于净积累。'}
         ]},
        {id:4, name:'光照强度×CO₂浓度复合曲线', type:'compound', category:'进阶', difficulty:4,
         desc:'多条曲线展示不同CO₂浓度下的光照响应。考查多因素综合分析能力。',
         keyPoints:[
             {x:'CO₂升高效应', label:'曲线右移', meaning:'相同光照下更高CO₂→更高光合速率', formula:'[CO₂]↑ → Pmax↑'},
             {x:'光饱和点变化', label:'右移上移', meaning:'CO₂升高使光饱和点也提高', formula:'Lsat ↑ with CO₂↑'},
             {x:'实际应用', label:'农业应用', meaning:'大棚需同时调控光照和CO₂', formula:'协同优化'}
         ],
         questions:[
             {type:'choice', q:'当CO₂浓度从a提高到b时，光饱和点如何变化？', options:['不变','升高','降低','先升后降'], answer:1, analysis:'CO₂浓度升高后，暗反应速率加快，能利用更多的ATP和NADPH，因此需要更强的光照才能达到新的平衡，故光饱和点升高。'},
             {type:'fill', q:'图中M点表示在CO₂浓度为b、光照强度为__时的状态', answer:'光饱和点对应值', analysis:'M点是CO₂浓度为b时的光饱和点，此时光合速率达到该条件下的最大值。'}
         ]},
        {id:5, name:'一天中光合速率变化曲线', type:'diurnal', category:'应用', difficulty:3,
         desc:'横坐标为时间（0-24h），展示自然条件下光合速率的日变化规律。',
         keyPoints:[
             {x:'夜间(0-5时)', label:'OA段', meaning:'只有呼吸作用，Pn<0', formula:'Pn = -R'},
             {x:'日出前后', label:'AB段', meaning:'光照增强，Pn由负转正', formula:'经过光补偿点'},
             {x:'中午(12时)', label:'C点(午休)', meaning:'可能出现"午休"现象', formula:'气孔关闭→CO₂↓→Pn↓'},
             {x:'下午', label:'CD段', meaning:'光照减弱但温度适宜', formula:'可能有小幅回升'},
             {x:'日落', label:'DE段', meaning:'光照降至0以下，Pn回到负值', formula:'进入夜间模式'}
         ],
         questions:[
             {type:'choice', q:'中午光合速率下降（午休）的主要原因是？', options:['光照过强','温度过高导致气孔关闭','CO₂浓度过低','酶活性降低'], answer:1, analysis:'中午温度高、蒸腾作用强，植物为减少水分散失而关闭部分气孔，导致CO₂供应不足，光合速率下降。这称为"光合午休现象"。'},
             {type:'fill', q:'有机物积累最快的时段大约是__(如8-10时)', answer:'上午8-11时', analysis:'此时段光照充足、温度适宜、气孔开放良好，光合速率高且呼吸相对较低，净光合速率最大。'}
         ]},
        {id:6, name:'叶绿体色素吸收光谱', type:'spectrum', category:'基础', difficulty:2,
         desc:'展示叶绿素a、叶绿素b、类胡萝卜素对不同波长光的吸收情况。',
         keyPoints:[
             {x:'蓝紫光区', label:'400-500nm', meaning:'叶绿素和类胡萝卜素均强烈吸收', formula:'吸收高峰'},
             {x:'红光区', label:'640-680nm', meaning:'叶绿素主要吸收区域', formula:'Chl a主峰~663nm'},
             {x:'绿光区', label:'495-570nm', meaning:'吸收最少，反射/透射多→叶片呈绿色', formula:'吸收谷'},
             {x:'类胡萝卜素', label:'辅助色素', meaning:'吸收蓝紫光，传递能量给叶绿素', formula:'保护作用+光能传递'}
         ],
         questions:[
             {type:'choice', q:'为什么大棚选用红光或蓝紫光补光灯？', options:['成本低','这些光是光合有效辐射','其他光有害','习惯做法'], answer:1, analysis:'叶绿素主要吸收红光（640-680nm）和蓝紫光（400-500nm），对绿光吸收很少。补光灯使用这两种光能最高效地促进光合作用。'},
             {type:'fill', q:'温室大棚常用__色或__色塑料薄膜（选两种）', answer:'无色透明；红色或蓝色', analysis:'无色透明膜允许全光谱通过；有色膜可选择性地透过光合有效辐射波段的光，提高能效。'}
         ]},
        {id:7, name:'净光合与总光合关系图', type:'relation', category:'核心概念', difficulty:3,
         desc:'清晰展示Pg（总光合）、Pn（净光合）、R（呼吸）三者之间的关系及计算方法。',
         keyPoints:[
             {x:'定义式', label:'核心公式', meaning:'总光合 = 净光合 + 呼吸', formula:'Pg = Pn + R'},
             {x:'测定方法', label:'三种方法', meaning:'①红外线CO₂分析仪测Pn ②半叶法测Pg ③黑暗处理测R', formula:'仪器法/称重法'},
             {x:'曲线表示', label:'图像理解', meaning:'Pn曲线=R曲线上方部分即为Pg', formula:'面积法'},
             {x:'常见误区', label:'易错点', meaning:'混淆Pn和Pg，忘记加上呼吸消耗', formula:'注意符号！'}
         ],
         questions:[
             {type:'choice', q:'某植物光照下测得CO₂吸收量为12mg/h，黑暗中释放量为4mg/h，则总光合速率为？', options:['12 mg/h','16 mg/h','8 mg/h','4 mg/h'], answer:1, analysis:'CO₂吸收量代表净光合速率(Pn)=12，黑暗中释放量代表呼吸速率(R)=4，总光合速率Pg=Pn+R=12+4=16 mg/h。'},
             {type:'fill', q:'若要测定真正的光合速率，必须同时测定__速率和__速率', answer:'净光合；呼吸', analysis:'真正（总）光合速率无法直接测量，需要通过净光合速率+呼吸速率间接计算得到。这是广东卷高频考点。'}
         ]},
        {id:8, name:'密闭容器中O₂/CO₂变化曲线', type:'closed', category:'实验', difficulty:4,
         desc:'密闭装置中植物光合作用导致的气体浓度变化曲线。常考实验题。',
         keyPoints:[
             {x:'初始阶段', label:'OA段', meaning:'呼吸>光合，O₂↓CO₂↑', formula:'净消耗O₂'},
             {x:'平衡点', label:'B点', meaning:'光合=呼吸，气体量不变', formula:'Pn = 0时刻'},
             {x:'净积累阶段', label:'BC段', meaning:'光合>呼吸，O₂↑CO₂↓', formula:'净产生O₂'},
             {x:'最终稳定', label:'CD段', meaning:'CO₂耗尽或达到新平衡', formula:'限制因素转变'}
         ],
         questions:[
             {type:'choice', q:'密闭容器中B点（气体量不变）时，植物是否在进行光合作用？', options:['否，只进行呼吸','是，且光合=呼吸','是，但光合很弱','无法判断'], answer:1, analysis:'B点时光合速率等于呼吸速率（净光合为0），并非没有光合作用。此时植物既进行光合又进行呼吸，只是两者的气体交换量恰好抵消。'},
             {type:'fill', q:'若初始CO₂浓度为X，B点时为Y，则从开始到B点这段时间内，植物净固定的CO₂量为__', answer:'X-Y', analysis:'CO₂浓度的减少量就是被植物净固定（用于合成有机物）的量。注意这是净固定量，不是总光合量。'}
         ]},
        {id:9, name:'不同植物光合曲线对比', type:'compare', category:'综合', difficulty:4,
         desc:'C₃植物（如水稻）、C₄植物（如玉米）、CAM植物（如仙人掌）的光合特性对比。',
         keyPoints:[
             {x:'C₃植物', label:'水稻/小麦', meaning:'光补偿点高、光饱和点低、CO₂补偿点高', formula:'典型温带作物'},
             {x:'C₄植物', label:'玉米/甘蔗', meaning:'光补偿点低、光饱和点高、CO₂补偿点极低', formula:'PEP羧化酶高效固CO₂'},
             {x:'CAM植物', label:'仙人掌/菠萝', meaning:'夜间固定CO₂（气孔夜间开），白天还原', formula:'适应干旱环境'},
             {x:'比较意义', label:'育种应用', meaning:'将C₄机制引入C₃作物可提高产量', formula:'生物工程方向'}
         ],
         questions:[
             {type:'choice', q:'C₄植物比C₃植物光合效率高的主要原因是？', options:['叶绿素含量多','有CO₂泵浓缩机制','呼吸速率低','叶片面积大'], answer:1, analysis:'C₄植物的PEP羧化酶对CO₂亲和力极高（Km很低），能在极低CO₂浓度下高效固定CO₂，并通过"CO₂泵"将CO₂浓缩到维管束鞘细胞中供给Rubisco使用，几乎无光呼吸损失。'},
             {type:'fill', q:'C₄植物固定CO₂的第一个产物是__（四碳化合物），场所是__', answer:'草酰乙酸(OAA)；叶肉细胞细胞质', analysis:'C₄途径第一步：在叶肉细胞质中，PEP羧化酶催化PEP+HCO₃⁻→草酰乙酸(C₄)，然后转运至维管束鞘细胞释放CO₂供卡尔文循环使用。'}
         ]},
        {id:10, name:'矿质元素缺乏对光合的影响', type:'mineral', category:'应用', difficulty:3,
         desc:'N、Mg、P、K等元素缺乏对光合作用各阶段的影响曲线。',
         keyPoints:[
             {x:'N缺乏', label:'氮', meaning:'影响酶、叶绿素、ATP/NADPH合成', formula:'全面抑制'},
             {x:'Mg缺乏', label:'镁', meaning:'叶绿素组成成分，缺Mg→叶片黄化', formula:'直接影响光反应'},
             {x:'P缺乏', label:'磷', meaning:'ATP、NADPH、核酸组分，影响能量代谢', formula:'影响光反应+暗反应'},
             {x:'K缺乏', label:'钾', meaning:'影响气孔开闭、物质运输', formula:'间接影响CO₂供应'}
         ],
         questions:[
             {type:'choice', q:'缺镁植株叶片发黄的直接原因是？', options:['水分运输受阻','叶绿素合成受阻','酶活性降低','细胞分裂停止'], answer:1, analysis:'Mg是叶绿素的中心原子（每个叶绿素分子含1个Mg²⁺），缺Mg直接影响叶绿素的合成，导致叶片呈现类胡萝卜素的颜色（黄色）。'},
             {type:'fill', q:'老叶先黄化说明该元素是__（能否再利用）元素，如__', answer:'可再利用;N或Mg', analysis:'可再利用元素（如N、Mg、K）可以从衰老器官转移到新生部位，所以缺乏时老叶先出现症状；不可再利用元素（如Ca、Fe）则新叶先出现症状。'}
         ]},
        {id:11, name:'水份胁迫对光合的影响', type:'water', category:'环境', difficulty:3,
         desc:'土壤水份亏缺对光合速率的多方面影响及其恢复过程。',
         keyPoints:[
             {x:'轻度缺水', label:'气孔限制', meaning:'气孔部分关闭→CO₂进入减少', formula:'主要限制因素'},
             {x:'重度缺水', label:'非气孔限制', meaning:'叶绿体结构破坏、酶活性下降', formula:'不可逆损伤'},
             {x:'复水后', label:'恢复过程', meaning:'轻度可快速恢复，重度恢复慢或不完全', formula:'滞后效应'},
            {x:'最佳含水量', label:'田间持水量', meaning:'土壤含水量60-80%时光合最强', formula:'农业灌溉依据'}
         ],
         questions:[
             {type:'choice', q:'干旱初期光合速率下降的主要原因是？', options:['叶绿素分解','RuBP羧化酶活性下降','气孔关闭CO₂不足','ATP合成受阻'], answer:2, analysis:'干旱初期主要是气孔因素（气孔关闭导致CO₂供应不足），属于可逆的限制；长期严重干旱才会导致非气孔限制（叶绿体结构破坏等不可逆损伤）。'},
             {type:'fill', q:'农业生产中的"蹲苗"措施是通过适度干旱促进__生长，提高后期抗旱性', answer:'根系', analysis:'适度干旱胁迫会诱导根系向下生长（根冠比增大），同时激活一系列抗逆基因表达，提高植物整体的抗旱能力和后期产量潜力。'}
         ]},
        {id:12, name:'O₂浓度对光合的影响（光呼吸）', type:'oxygen', category:'进阶', difficulty:5,
         desc:'展示O₂浓度通过影响光呼吸而对净光合产生的复杂影响。',
         keyPoints:[
             {x:'低O₂(<21%)', label:'抑制光呼吸', meaning:'Rubisco加氧酶活性降低', formula:'Pn↑（净光合提高）'},
             {x:'正常空气(21%)', label:'自然状态', meaning:'光呼吸消耗光合产物的20-50%', formula:'显著降低光合效率'},
             {x:'高O₂(>21%)', label:'促进光呼吸', meaning:'竞争性抑制CO₂固定', formula:'Pn↓明显'},
             {x:'C₄vsC₃', label:'差异', meaning:'C₄植物几乎不受O₂浓度影响', formula:'CO₂泵机制屏蔽'}
         ],
         questions:[
             {type:'choice', q:'提高O₂浓度会降低C₃植物净光合的原因是？', options:['抑制光反应','促进光呼吸消耗有机物','破坏叶绿体','抑制酶活性'], answer:1, analysis:'O₂是Rubisco的竞争性底物。高O₂时，Rubisco更多地催化加氧反应（光呼吸），生成乙醇酸并最终释放CO₂，消耗了光合产物却不产生有用的有机物，导致净光合下降。'},
             {type:'fill', q:'光呼吸的底物是__，场所是__', answer:'RuBP(核酮糖-1,5-二磷酸)；叶绿体基质→过氧化物酶体→线粒体', analysis:'光呼吸是Rubisco催化RuBP与O₂反应生成磷酸乙醇酸的过程，随后在叶绿体（起始）、过氧化物酶体（转化）、线粒体（释放CO₂）三个细胞器中完成整个光呼吸碳氧化循环。'}
         ]},
        {id:13, name:'植物不同部位/龄期光合曲线', type:'development', category:'综合', difficulty:3,
         desc:'同一植株不同叶位、不同发育时期的光合能力差异。',
         keyPoints:[
             {x:'幼叶', label:'展开初期', meaning:'叶绿体未成熟，光合能力弱', formula:'Pn < R（依赖营养输入）'},
             {x:'功能叶', label:'完全展开', meaning:'光合能力最强，净输出有机物', formula:'源叶（Source）'},
             {x:'老叶', label:'衰老期', meaning:'叶绿素分解，光合下降', formula:'逐渐转为库叶（Sink）'},
            {x:'应用', label:'打顶/摘心', meaning:'去除顶端优势，促进侧芽功能叶发育', formula:'农业增产措施'}
         ],
         questions:[
             {type:'choice', q:'棉花打顶（摘除顶芽）的主要生理学目的是？', options:['减少养分消耗','促进侧芽发育为功能叶','防止徒长','以上都对'], answer:3, analysis:'打顶可以：①解除顶端优势，促进侧芽发育；②减少营养生长消耗，使更多同化物分配给生殖器官（棉铃）；③改善群体通风透光条件，提高整体光合效率。'},
             {type:'fill', q:'农作物产量主要取决于__期的光合产物积累，此时期的叶片称为__叶', answer:'功能叶（或生殖生长期）；源（或功能）', analysis:'生殖生长期的功能叶（源叶）是产量形成的关键。此时应保证良好的水肥供应和病虫害防治，维持功能叶的高光合活性至成熟期。'}
         ]},
        {id:14, name:'CO₂倍增与全球变暖综合效应', type:'global', category:'前沿', difficulty:4,
         desc:'气候变化背景下CO₂浓度升高和温度上升对生态系统光合作用的综合影响。',
         keyPoints:[
             {x:'CO₂施肥效应', label:'短期促进', meaning:'CO₂升高→C₃植物光合增强', formula:' fertilization effect'},
             {x:' acclimation', label:'长期适应', meaning:'植物下调Rubisco含量（光合适应）', formula:'down-regulation'},
             {x:'升温负效应', label:'温度升高', meaning:'呼吸增加幅度>光合增加幅度', formula:'R > Pg increment'},
             {x:'极端气候', label:'干旱/热害', meaning:'频繁极端天气抵消CO₂正面效应', formula:'net effect uncertain'}
         ],
         questions:[
             {type:'choice', q:'关于CO₂浓度升高对农作物产量的影响，下列说法正确的是？', options:['必然大幅增产','短期增产但长期效应不确定','只对C₄作物有利','没有任何影响'], answer:1, analysis:'短期内CO₂施肥效应确实能提高C₃作物光合速率；但长期来看存在光合适应（下调光合能力）、升温导致呼吸消耗增加、极端天气频发等负面因素，净效应具有很大不确定性。'},
             {type:'fill', q:'全球变暖可能导致粮食安全问题的原因是：①极端天气增多②__③__(任填两个)', answer:'病虫害北扩；水资源短缺（或生育期缩短/品质下降等）', analysis:'气候变化对农业的影响是多方面的，包括生物因子（病虫害分布改变）、非生物因子（水资源、热害、生育期变化）以及社会经济因素的综合作用。'}
         ]},
        {id:15, name:'光合作用测定方法与技术', type:'method', category:'实验', difficulty:4,
         desc:'介绍各种光合速率测定方法的原理、优缺点及应用场景。',
         keyPoints:[
             {x:'红外线CO₂分析法(IRGA)', label:'仪器法', meaning:'实时准确，适合动态监测', formula:'Δ[CO₂]/Δt × 流量'},
             {x:'半叶法', label:'经典方法', meaning:'遮光对照，烘干称重差', formula:'Δ干重/面积/时间'},
             {x:'氧电极法', label:'测O₂释放', meaning:'适合离体叶组织或悬浮藻类', formula:'极谱法测O₂'},
             {x:'荧光法', label:'叶绿素荧光', meaning:'无损快速反映PSⅡ活性', formula:'Fv/Fm = 最大量子产额'}
         ],
         questions:[
             {type:'choice', q:'叶绿素荧光参数Fv/Fm的含义是？', options:['光化学猝灭系数','PSⅡ最大光化学量子产量','非光化学猝灭系数','电子传递速率'], answer:1, analysis:'Fv/Fm（可变荧光/最大荧光）代表PSⅡ反应中心完全开放时的最大光化学量子产量，是反映植物光合性能的重要指标。健康植物的Fv/Fm≈0.83，逆境下会下降。'},
             {type:'fill', q:'半叶法的原理是通过比较__和__的干重差异来计算光合速率', answer:'照光叶；遮光叶（或处理叶；对照叶）', analysis:'半叶法是将叶片一部分遮光（只进行呼吸）另一部分照光（同时进行光合和呼吸），一段时间后分别取下烘干称重，其差值即为这段时间内的净光合产物量。'
            }
        ]}
    ],

    state: {
        currentCurve: null,
        questionIndex: 0,
        userAnswer: null,
        score: { total:0, correct:0 },
        wrongAnswers: [],
        mode: 'learn',
        animationId: null
    },

    init() {
        this._render();
    },

    selectCurve(curveId) {
        this.state.currentCurve = this.curves.find(c => c.id === curveId);
        this.state.questionIndex = 0;
        this.state.userAnswer = null;
        this.state.mode = 'learn';
        this._render();
        setTimeout(() => this._drawCurve(), 100);
    },

    setMode(mode) {
        this.state.mode = mode;
        if (mode === 'practice') {
            this.state.questionIndex = 0;
            this.state.userAnswer = null;
        }
        this._render();
        if (this.state.currentCurve) setTimeout(() => this._drawCurve(), 100);
    },

    _drawCurve() {
        const canvas = document.getElementById('curve-canvas');
        if (!canvas || !this.state.currentCurve) return;

        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0, 0, w, h);
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(60, 20);
        ctx.lineTo(60, h - 40);
        ctx.lineTo(w - 20, h - 40);
        ctx.stroke();

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.state.currentCurve.type === 'light' ? '光照强度(klx)' : 
                     this.state.currentCurve.type === 'CO2' ? 'CO₂浓度(ppm)' :
                     this.state.currentCurve.type === 'temp' ? '温度(℃)' :
                     this.state.currentCurve.type === 'diurnal' ? '时间(h)' : '自变量', (w + 60) / 2, h - 15);
        
        ctx.save();
        ctx.translate(18, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('光合速率', 0, 0);
        ctx.restore();

        const padding = { left: 70, right: 30, top: 30, bottom: 50 };
        const graphW = w - padding.left - padding.right;
        const graphH = h - padding.top - padding.bottom;

        let progress = 0;
        const animate = () => {
            progress += 0.03;
            if (progress > 1) progress = 1;
            
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            for (let i = 1; i <= 5; i++) {
                const y = padding.top + graphH * (1 - i / 5);
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(w - padding.right, y);
                ctx.stroke();
                ctx.fillStyle = '#999';
                ctx.font = '10px Arial';
                ctx.textAlign = 'right';
                ctx.fillText((i * 20).toString(), padding.left - 5, y + 3);
            }

            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 3;
            ctx.beginPath();

            const points = [];
            for (let i = 0; i <= 100; i++) {
                const x = padding.left + (i / 100) * graphW;
                let y;
                
                if (this.state.currentCurve.id <= 7) {
                    const normalizedX = i / 100;
                    if (this.state.currentCurve.id === 1) {
                        if (normalizedX < 0.1) y = padding.top + graphH * 0.9;
                        else if (normalizedX < 0.2) y = padding.top + graphH * (0.9 - (normalizedX - 0.1) * 4.5);
                        else if (normalizedX < 0.6) y = padding.top + graphH * (0.45 - (normalizedX - 0.2) * 0.75);
                        else y = padding.top + graphH * 0.15;
                    } else if (this.state.currentCurve.id === 2) {
                        if (normalizedX < 0.05) y = padding.top + graphH * 0.95;
                        else if (normalizedX < 0.3) y = padding.top + graphH * (0.95 - (normalizedX - 0.05) * 2);
                        else if (normalizedX < 0.7) y = padding.top + graphH * (0.45 - (normalizedX - 0.3) * 0.625);
                        else y = padding.top + graphH * 0.2;
                    } else if (this.state.currentCurve.id === 3) {
                        const temp = normalizedX * 50;
                        if (temp < 10) y = padding.top + graphH * (0.9 - temp * 0.02);
                        else if (temp < 28) y = padding.top + graphH * (0.7 - (temp - 10) * 0.025);
                        else if (temp < 38) y = padding.top + graphH * (0.25 + (temp - 28) * 0.04);
                        else y = padding.top + graphH * (0.65 - (temp - 38) * 0.015);
                    } else if (this.state.currentCurve.id === 5) {
                        const hour = normalizedX * 24;
                        if (hour < 6) y = padding.top + graphH * 0.85;
                        else if (hour < 10) y = padding.top + graphH * (0.85 - (hour - 6) * 0.15);
                        else if (hour < 13) y = padding.top + graphH * (0.25 + (hour - 10) * 0.08);
                        else if (hour < 16) y = padding.top + graphH * (0.49 - (hour - 13) * 0.08);
                        else if (hour < 19) y = padding.top + graphH * (0.25 - (hour - 16) * 0.06);
                        else y = padding.top + graphH * 0.07;
                    } else {
                        y = padding.top + graphH * (0.9 - Math.pow(normalizedX, 0.6) * 0.75);
                    }

                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);

                    if (i <= progress * 100) {
                        points.push({ x, y });
                    }
                }
            }
            ctx.stroke();

            if (this.state.currentCurve.keyPoints && progress >= 1) {
                this.state.currentCurve.keyPoints.forEach((kp, idx) => {
                    const px = padding.left + ((idx + 1) / (this.state.currentCurve.keyPoints.length + 1)) * graphW;
                    let py;
                    
                    if (idx === 0) py = padding.top + graphH * 0.9;
                    else if (idx === 1) py = padding.top + graphH * 0.55;
                    else if (idx === 2) py = padding.top + graphH * 0.25;
                    else if (idx === 3) py = padding.top + graphH * 0.2;
                    else py = padding.top + graphH * 0.3;

                    ctx.fillStyle = '#E74C3C';
                    ctx.beginPath();
                    ctx.arc(px, py, 6, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(String.fromCharCode(65 + idx), px, py + 3);

                    ctx.fillStyle = '#333';
                    ctx.font = '11px Arial';
                    ctx.textAlign = 'left';
                    ctx.fillText(`${kp.label}: ${kp.meaning}`, px + 12, py - 5);
                    ctx.fillStyle = '#666';
                    ctx.font = 'italic 10px Arial';
                    ctx.fillText(kp.formula, px + 12, py + 10);
                });
            }

            if (progress < 1) {
                this.state.animationId = requestAnimationFrame(animate);
            }
        };

        if (this.state.animationId) cancelAnimationFrame(this.state.animationId);
        animate();
    },

    checkAnswer(answer) {
        if (!this.state.currentCurve || this.state.userAnswer !== null) return;

        const currentQ = this.state.currentCurve.questions[this.state.questionIndex];
        this.state.userAnswer = answer;
        this.state.score.total++;

        const isCorrect = currentQ.type === 'fill' ? 
            answer.toLowerCase().trim() === currentQ.answer.toLowerCase().trim() :
            answer === currentQ.answer;

        if (isCorrect) {
            this.state.score.correct++;
        } else {
            this.state.wrongAnswers.push({
                curveId: this.state.currentCurve.id,
                curveName: this.state.currentCurve.name,
                question: currentQ.q,
                userAnswer: currentQ.type === 'fill' ? answer : ['A','B','C','D'][answer],
                correctAnswer: currentQ.type === 'fill' ? currentQ.answer : ['A','B','C','D'][currentQ.answer],
                timestamp: new Date().toLocaleString()
            });
        }

        localStorage.setItem('photo_wrong_answers', JSON.stringify(this.state.wrongAnswers));
        localStorage.setItem('photo_score', JSON.stringify(this.state.score));

        this._render();
        setTimeout(() => this._drawCurve(), 100);
    },

    nextQuestion() {
        if (!this.state.currentCurve) return;
        
        this.state.questionIndex++;
        this.state.userAnswer = null;

        if (this.state.questionIndex >= this.state.currentCurve.questions.length) {
            this.state.questionIndex = 0;
        }

        this._render();
        setTimeout(() => this._drawCurve(), 100);
    },

    exportWrongPDF() {
        if (this.state.wrongAnswers.length === 0) {
            alert('太棒了！没有错题！');
            return;
        }

        let content = `% 光合/呼吸曲线解读训练 - 错题集\n\n`;
        content += `生成时间：${new Date().toLocaleString()}\n`;
        content += `总练习数：${this.state.score.total} | 正确：${this.state.score.correct} | 正确率：${Math.round(this.state.score.correct/Math.max(1,this.state.score.total)*100)}%\n\n`;
        content += `${'='.repeat(60)}\n\n`;

        this.state.wrongAnswers.forEach((w, i) => {
            content += `【错题 ${i+1}】${w.curveName}\n`;
            content += `题目：${w.question}\n`;
            content += `你的答案：${w.userAnswer}\n`;
            content += `正确答案：${w.correctAnswer}\n\n`;
        });

        const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `光合曲线错题集_${new Date().toLocaleDateString()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    },

    _render() {
        const app = document.getElementById('photosynthesis-trainer-app');
        if (!app) return;

        app.innerHTML = `
        <div class="pt-enhanced">
            <div class="pt-header">
                <h2>🌿 光合/呼吸曲线解读训练 <span class="gd-badge">广东卷专用</span></h2>
                <div class="pt-stats">
                    <span>📊 练习: ${this.state.score.total}</span>
                    <span>✅ 正确: ${this.state.score.correct}</span>
                    <span>📈 正确率: ${this.state.score.total > 0 ? Math.round(this.state.score.correct/this.state.score.total*100) : 0}%</span>
                </div>
            </div>

            <div class="pt-body">
                <div class="curve-selector">
                    <h3>📈 选择曲线类型 (${this.curves.length}种)</h3>
                    <div class="curve-grid">
                        ${this.curves.map(c => `
                            <button class="curve-card ${this.state.currentCurve?.id===c.id?'cc-active':''}" 
                                    onclick="photosynthesisTrainerEnhanced.selectCurve(${c.id})"
                                    data-diff="${c.difficulty}">
                                <div class="cc-name">${c.name}</div>
                                <div class="cc-cat">${c.category}</div>
                                <div class="cc-diff">${'⭐'.repeat(c.difficulty)}</div>
                            </button>
                        `).join('')}
                    </div>
                </div>

                ${this.state.currentCurve ? `
                <div class="curve-panel">
                    <div class="cp-header">
                        <span class="cp-title">${this.state.currentCurve.name}</span>
                        <span class="cp-desc">${this.state.currentCurve.desc}</span>
                        <div class="mode-switch">
                            <button class="${this.state.mode==='learn'?'ms-act':''}" onclick="photosynthesisTrainerEnhanced.setMode('learn')">📖 学习模式</button>
                            <button class="${this.state.mode==='practice'?'ms-act':''}" onclick="photosynthesisTrainerEnhanced.setMode('practice')">✏️ 练习模式</button>
                        </div>
                    </div>

                    <div class="canvas-container">
                        <canvas id="curve-canvas" width="700" height="400"></canvas>
                    </div>

                    ${this.state.mode === 'practice' && this.state.currentCurve.questions.length > 0 ? `
                    <div class="question-area">
                        <div class="qa-header">
                            <span>题目 ${this.state.questionIndex + 1}/${this.state.currentCurve.questions.length}</span>
                            <span class="q-type-badge">${this.state.currentCurve.questions[this.state.questionIndex].type === 'choice' ? '选择题' : '填空题'}</span>
                        </div>
                        
                        <div class="q-text">${this.state.currentCurve.questions[this.state.questionIndex].q}</div>

                        ${this.state.currentCurve.questions[this.state.questionIndex].type === 'choice' ? `
                        <div class="options-area">
                            ${this.state.currentCurve.questions[this.state.questionIndex].options.map((opt, i) => `
                                <button class="opt-btn ${this.state.userAnswer!==null?(i===this.state.currentCurve.questions[this.state.questionIndex].answer?'opt-correct':i===this.state.userAnswer?'opt-wrong':''):''}"
                                        onclick="photosynthesisTrainerEnhanced.checkAnswer(${i})"
                                        ${this.state.userAnswer!==null?'disabled':''}>
                                    ${['A','B','C','D'][i]}. ${opt}
                                </button>
                            `).join('')}
                        </div>
                        ` : `
                        <div class="fill-area">
                            <input type="text" id="fill-answer" placeholder="请输入答案..." 
                                   onkeypress="if(event.key==='Enter')photosynthesisTrainerEnhanced.checkAnswer(document.getElementById('fill-answer').value)"
                                   ${this.state.userAnswer!==null?'disabled':''}>
                            <button onclick="photosynthesisTrainerEnhanced.checkAnswer(document.getElementById('fill-answer').value)"
                                    ${this.state.userAnswer!==null?'disabled':''}>提交</button>
                        </div>
                        `}

                        ${this.state.userAnswer !== null ? `
                        <div class="result-box ${this.state.userAnswer === (this.state.currentCurve.questions[this.state.questionIndex].type === 'fill' ? 
                            this.state.currentCurve.questions[this.state.questionIndex].answer : 
                            this.state.currentQuestion?.answer || this.state.currentCurve.questions[this.state.questionIndex].answer) ||
                            (typeof this.state.userAnswer === 'string' && this.state.userAnswer.toLowerCase().trim() === this.state.currentCurve.questions[this.state.questionIndex].answer.toLowerCase().trim())
                            ? 'result-correct' : 'result-wrong'}">
                            <strong>${(typeof this.state.userAnswer === 'string' && this.state.userAnswer.toLowerCase().trim() === this.state.currentCurve.questions[this.state.questionIndex].answer.toLowerCase().trim()) || 
                                    (this.state.userAnswer === this.state.currentCurve.questions[this.state.questionIndex].answer) ? '✅ 回答正确！' : '❌ 回答错误'}</strong>
                            <p class="analysis-text">${this.state.currentCurve.questions[this.state.questionIndex].analysis}</p>
                            <button onclick="photosynthesisTrainerEnhanced.nextQuestion()">下一题 →</button>
                        </div>
                        ` : ''}
                    </div>

                    <div class="key-points-panel">
                        <h4>📍 关键知识点</h4>
                        ${this.state.currentCurve.keyPoints.map((kp, i) => `
                            <div class="kp-item">
                                <span class="kp-label">${kp.label}</span>
                                <span class="kp-meaning">${kp.meaning}</span>
                                <span class="kp-formula"><code>${kp.formula}</code></span>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                <div class="welcome-panel">
                    <div class="wp-icon">🌿</div>
                    <h3>欢迎来到光合/呼吸曲线解读训练</h3>
                    <p>选择上方曲线类型开始学习或练习<br>涵盖广东卷所有高频曲线类型</p>
                    <div class="features-list">
                        <div class="feature-item">✅ 15种典型曲线全覆盖</div>
                        <div class="feature-item">✅ 动态可视化演示</div>
                        <div class="feature-item">✅ 选择题+填空题双模式</div>
                        <div class="feature-item">✅ 错题自动收集导出</div>
                    </div>
                </div>
                `}
            </div>

            <div class="pt-footer">
                <button onclick="photosynthesisTrainerEnhanced.exportWrongPDF()">📥 导出错题集</button>
                <div class="tips-bar">
                    💡 <strong>核心公式：</strong>Pg（总光合）= Pn（净光合）+ R（呼吸）| 记住这个公式解决90%的曲线问题
                </div>
            </div>
        </div>`;
    }
};

// ============================================================
// 暴露到 window 对象（修复死代码问题）
// ============================================================
window.chemistryProcessAnalyzerEnhanced = chemistryProcessAnalyzerEnhanced;
window.biologyMindMapEnhanced = biologyMindMapEnhanced;
window.geneticsPedigreeTrainerEnhanced = geneticsPedigreeTrainerEnhanced;
window.experimentDesignerEnhanced = experimentDesignerEnhanced;
window.photosynthesisTrainerEnhanced = photosynthesisTrainerEnhanced;
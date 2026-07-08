// ============================================================
// app-biology.js — 生物模块（从 app.js 拆分）
// 包含: 遗传模拟/思维导图/系谱训练/光合作用/实验设计
// 依赖: app.js (currentTool 全局变量)
// ============================================================

const biologyGeneticsSimulator = {
    state: {
        initialPA: 0.5,
        initialPb: 0.5,
        selectionPressure: 0,
        mutationRate: 0,
        generation: 0,
        history: []
    },

    hardyWeinberg(p, q) {
        return {
            AA: p * p,
            Aa: 2 * p * q,
            aa: q * q
        };
    },

    calculateNextGeneration(currentState) {
        const { initialPA, initialPb, selectionPressure, mutationRate } = currentState;

        let p = initialPA;
        let q = initialPb;

        const selectionCoefficient = selectionPressure / 100;

        const genotypes = this.hardyWeinberg(p, q);

        const avgFitnessAA = 1;
        const avgFitnessAa = 1 - selectionCoefficient * 0.5;
        const avgFitnessaa = 1 - selectionCoefficient;

        const avgFitness = genotypes.AA * avgFitnessAA +
                          genotypes.Aa * avgFitnessAa +
                          genotypes.aa * avgFitnessaa;

        const pNext = (genotypes.AA * avgFitnessAA + genotypes.Aa * avgFitnessAa * 0.5) / avgFitness;
        const qNext = 1 - pNext;

        const mutationEffect = mutationRate / 100;
        const pWithMutation = pNext * (1 - mutationEffect) + qNext * mutationEffect;
        const qWithMutation = 1 - pWithMutation;

        return {
            p: pWithMutation,
            q: qWithMutation,
            genotypes: this.hardyWeinberg(pWithMutation, qWithMutation)
        };
    },

    simulate(generations) {
        const results = [];
        let currentState = { ...this.state };

        for (let i = 0; i <= generations; i++) {
            const genotypes = this.hardyWeinberg(currentState.initialPA, currentState.initialPb);
            const expectedAA = currentState.initialPA * currentState.initialPA;
            const expectedAa = 2 * currentState.initialPA * currentState.initialPb;
            const expectedaa = currentState.initialPb * currentState.initialPb;
            const total = genotypes.AA + genotypes.Aa + genotypes.aa || 1;
            const isEquilibrium = Math.abs(genotypes.AA/total - expectedAA) < 0.02 && Math.abs(genotypes.Aa/total - expectedAa) < 0.02 && Math.abs(genotypes.aa/total - expectedaa) < 0.02;

            results.push({
                generation: i,
                p: currentState.initialPA,
                q: currentState.initialPb,
                genotypes: genotypes,
                isEquilibrium: isEquilibrium
            });

            const next = this.calculateNextGeneration(currentState);
            currentState = {
                ...currentState,
                initialPA: next.p,
                initialPb: next.q
            };
        }

        return results;
    },

    renderSimulation() {
        const results = this.simulate(20);
        const latest = results[results.length - 1];

        let html = `
            <div class="genetics-controls">
                <div class="control-group">
                    <label>初始A基因频率 (p)</label>
                    <input type="range" id="p-slider" min="0" max="100" value="${this.state.initialPA * 100}">
                    <div class="control-value">p = <span id="p-value">${(this.state.initialPA * 100).toFixed(1)}%</span></div>
                </div>
                <div class="control-group">
                    <label>初始a基因频率 (q)</label>
                    <input type="range" id="q-slider" min="0" max="100" value="${this.state.initialPb * 100}">
                    <div class="control-value">q = <span id="q-value">${(this.state.initialPb * 100).toFixed(1)}%</span></div>
                </div>
                <div class="control-group">
                    <label>选择压力 (对aa型不利程度)</label>
                    <input type="range" id="selection-slider" min="0" max="100" value="${this.state.selectionPressure}">
                    <div class="control-value">s = <span id="selection-value">${this.state.selectionPressure}%</span></div>
                </div>
                <div class="control-group">
                    <label>突变率</label>
                    <input type="range" id="mutation-slider" min="0" max="100" value="${this.state.mutationRate}">
                    <div class="control-value">μ = <span id="mutation-value">${this.state.mutationRate}%</span></div>
                </div>
            </div>

            <div class="chart-container">
                <div class="chart-title">基因型频率分布 (第${results.length - 1}代)</div>
                <div class="bar-chart">
                    <div class="bar-group">
                        <div class="bar aa" style="height: ${Math.max(latest.genotypes.aa * 200, 5)}px;"></div>
                        <div class="bar-label">aa</div>
                        <div class="bar-value">${(latest.genotypes.aa * 100).toFixed(1)}%</div>
                    </div>
                    <div class="bar-group">
                        <div class="bar Aa" style="height: ${Math.max(latest.genotypes.Aa * 200, 5)}px;"></div>
                        <div class="bar-label">Aa</div>
                        <div class="bar-value">${(latest.genotypes.Aa * 100).toFixed(1)}%</div>
                    </div>
                    <div class="bar-group">
                        <div class="bar AA" style="height: ${Math.max(latest.genotypes.AA * 200, 5)}px;"></div>
                        <div class="bar-label">AA</div>
                        <div class="bar-value">${(latest.genotypes.AA * 100).toFixed(1)}%</div>
                    </div>
                </div>
                ${latest.isEquilibrium ? '<span class="equilibrium-badge">✓ 接近Hardy-Weinberg平衡</span>' : '<span class="disequilibrium-badge">⚠ 未达平衡状态</span>'}
            </div>

            <div class="phenotype-display">
                <div class="phenotype-item white-flower">
                    <div class="phenotype-icon">🤍</div>
                    <div class="phenotype-ratio">${(latest.genotypes.aa * 100).toFixed(1)}%</div>
                    <div class="phenotype-label">白花 (aa)</div>
                </div>
                <div class="phenotype-item red-flower">
                    <div class="phenotype-icon">❤️</div>
                    <div class="phenotype-ratio">${((latest.genotypes.AA + latest.genotypes.Aa) * 100).toFixed(1)}%</div>
                    <div class="phenotype-label">红花 (AA/Aa)</div>
                </div>
            </div>

            <div class="chart-container">
                <div class="chart-title">基因频率进化轨迹 (20代)</div>
                <div class="generation-timeline">
                    ${results.map((r, i) => `
                        <div class="gen-dot ${i === results.length - 1 ? 'active' : ''}" title="第${i}代: p=${(r.p*100).toFixed(1)}%, q=${(r.q*100).toFixed(1)}%">
                            ${i}
                        </div>
                    `).join('')}
                </div>
                <div style="display: flex; justify-content: center; gap: 30px; margin-top: 15px;">
                    <div><span style="color: var(--primary);">━━</span> p (A基因频率)</div>
                    <div><span style="color: var(--danger);">━━</span> q (a基因频率)</div>
                </div>
            </div>

            <div class="info-box">
                <h4>📊 当前种群遗传分析</h4>
                <p><strong>基因频率：</strong>p(A) = ${(latest.p * 100).toFixed(2)}%，q(a) = ${(latest.q * 100).toFixed(2)}%</p>
                <p><strong>基因型频率：</strong>AA = ${(latest.genotypes.AA * 100).toFixed(2)}%，Aa = ${(latest.genotypes.Aa * 100).toFixed(2)}%，aa = ${(latest.genotypes.aa * 100).toFixed(2)}%</p>
                <p><strong>预期比值：</strong>AA : Aa : aa = ${(latest.genotypes.AA).toFixed(4)} : ${(latest.genotypes.Aa).toFixed(4)} : ${(latest.genotypes.aa).toFixed(4)}</p>
                <p><strong>实际比例验证：</strong>p² + 2pq + q² = ${(latest.genotypes.AA + latest.genotypes.Aa + latest.genotypes.aa).toFixed(4)} ${Math.abs(latest.genotypes.AA + latest.genotypes.Aa + latest.genotypes.aa - 1) < 0.0001 ? '✓ (守恒)' : '✗ (异常)'}</p>
            </div>

            <div class="warning-box">
                <h4>💡 学习要点</h4>
                <ul style="margin-left: 20px;">
                    <li><strong>Hardy-Weinberg平衡：</strong>当种群足够大、无突变、无选择、无迁移、随机交配时，基因频率和基因型频率保持恒定。</li>
                    <li><strong>选择压力：</strong>当某个基因型适合度降低时，该基因频率会随世代减少。</li>
                    <li><strong>突变率：</strong>突变是进化的原材料，为自然选择提供原材料。</li>
                    <li><strong>平衡验证：</strong>(p+q)² = p² + 2pq + q² = 1</li>
                </ul>
            </div>
        `;

        return html;
    }
};
/**
 * 生物工具加载器 - 按 tool 名分发到对应渲染器（遗传/生态/思维导图/PCR/电泳等）
 * @module loadBiologyTool
 * @example window.loadBiologyTool('pcr')
 */
function loadBiologyTool(tool) {
    if (tool === 'genetics') {
        navigateTo('biology-genetics');
        renderBiologyGenetics();
    } else if (tool === 'ecosystem') {
        navigateTo('ecosystem-sim');
        ecosystemSimulator.renderSimulation();
    } else if (tool === 'mindmap') {
        navigateTo('biology-mindmap');
        if (typeof biologyMindMapEnhanced !== 'undefined') {
            biologyMindMapEnhanced.init();
        } else {
            biologyMindMap.renderMindMap();
        }
    } else if (tool === 'pedigree') {
        navigateTo('genetics-pedigree');
        if (typeof geneticsPedigreeTrainerEnhanced !== 'undefined') {
            geneticsPedigreeTrainerEnhanced.init();
        } else {
            geneticsPedigreeTrainer.selectProblem();
        }
    } else if (tool === 'photosynthesis') {
        navigateTo('photosynthesis-trainer');
        if (typeof photosynthesisTrainerEnhanced !== 'undefined') {
            photosynthesisTrainerEnhanced.init();
        } else {
            photosynthesisTrainer.renderTrainer();
        }
    } else if (tool === 'experiment') {
        navigateTo('experiment-designer');
        if (typeof experimentDesignerEnhanced !== 'undefined') {
            experimentDesignerEnhanced.init();
        } else {
            experimentDesigner.renderDesigner();
        }
    } else if (tool === 'pcr') {
        navigateTo('pcr-simulator');
        pcrSimulator.renderSystem();
    } else if (tool === 'electrophoresis') {
        navigateTo('gel-electrophoresis');
        gelElectrophoresisSimulator.renderSystem();
    }
}

/**
 * 物理工具加载器 - 按 tool 名分发到对应渲染器（公式计算器/抛体模拟）
 * @module loadPhysicsTool
 * @example window.loadPhysicsTool('calculator')
 */
function renderBiologyGenetics() {
    const app = document.getElementById('biology-genetics-app');
    app.innerHTML = biologyGeneticsSimulator.renderSimulation();
    attachGeneticsListeners();
}

function attachGeneticsListeners() {
    const pSlider = document.getElementById('p-slider');
    const qSlider = document.getElementById('q-slider');
    const selectionSlider = document.getElementById('selection-slider');
    const mutationSlider = document.getElementById('mutation-slider');

    if (pSlider) {
        pSlider.addEventListener('input', function() {
            const value = this.value / 100;
            const pValueEl = document.getElementById('p-value');
            const qValueEl = document.getElementById('q-value');
            if (pValueEl) pValueEl.textContent = (value * 100).toFixed(1) + '%';
            if (qValueEl) qValueEl.textContent = ((1 - value) * 100).toFixed(1) + '%';
            biologyGeneticsSimulator.state.initialPA = value;
            biologyGeneticsSimulator.state.initialPb = 1 - value;
            updateGeneticsDisplay();
        });
    }

    if (qSlider) {
        qSlider.addEventListener('input', function() {
            const value = this.value / 100;
            const pValueEl = document.getElementById('p-value');
            const qValueEl = document.getElementById('q-value');
            if (qValueEl) qValueEl.textContent = (value * 100).toFixed(1) + '%';
            if (pValueEl) pValueEl.textContent = ((1 - value) * 100).toFixed(1) + '%';
            biologyGeneticsSimulator.state.initialPb = value;
            biologyGeneticsSimulator.state.initialPA = 1 - value;
            updateGeneticsDisplay();
        });
    }

    if (selectionSlider) {
        selectionSlider.addEventListener('input', function() {
            const value = this.value;
            const selectionValueEl = document.getElementById('selection-value');
            if (selectionValueEl) selectionValueEl.textContent = value + '%';
            biologyGeneticsSimulator.state.selectionPressure = parseInt(value);
            updateGeneticsDisplay();
        });
    }

    if (mutationSlider) {
        mutationSlider.addEventListener('input', function() {
            const value = this.value;
            const mutationValueEl = document.getElementById('mutation-value');
            if (mutationValueEl) mutationValueEl.textContent = value + '%';
            biologyGeneticsSimulator.state.mutationRate = parseInt(value);
            updateGeneticsDisplay();
        });
    }
}
/**
 * 生物思维导图 - 以概念库为中心的放射式节点图，支持拖拽/连线
 * @module biologyMindMap
 * @example window.biologyMindMap.renderMindMap()
 */
const biologyMindMap = {
    state: {
        centerConcept: '',
        nodes: [],
        connections: [],
        layoutMode: 'radial',
        selectedNode: null,
        isDragging: false,
        isConnecting: false,
        connectingFrom: null
    },

    conceptLibrary: {
        '光合作用': {
            branches: [
                { text: '光反应', sub: ['光系统II', '光系统I', '水的光解', 'ATP合成', 'NADPH生成'] },
                { text: '暗反应', sub: ['CO₂固定', 'C₃还原', 'RuBP再生', '卡尔文循环'] },
                { text: '影响因素', sub: ['光照强度', 'CO₂浓度', '温度', '矿质元素', '水分'] },
                { text: '总光合与净光合', sub: ['总光合速率', '净光合速率', '呼吸速率', '真正光合速率'] },
                { text: '场所', sub: ['叶绿体', '类囊体', '基质', '基粒'] }
            ],
            keywords: ['光反应', '暗反应', 'ATP', 'NADPH', 'CO₂固定', 'C₃', '卡尔文']
        },
        '呼吸作用': {
            branches: [
                { text: '有氧呼吸', sub: ['糖酵解', '柠檬酸循环', '电子传递链', 'ATP生成'] },
                { text: '无氧呼吸', sub: ['乳酸发酵', '酒精发酵', '丙酮酸转化'] },
                { text: '影响因素', sub: ['温度', 'O₂浓度', 'CO₂浓度', '水分'] },
                { text: '关系', sub: ['与光合作用的关系', '物质转化', '能量转换'] }
            ],
            keywords: ['ATP', '丙酮酸', '乳酸', '酒精', '电子传递链']
        },
        '免疫调节': {
            branches: [
                { text: '非特异性免疫', sub: ['第一道防线', '第二道防线', '吞噬细胞', '自然杀伤细胞'] },
                { text: '特异性免疫', sub: ['体液免疫', '细胞免疫', 'B细胞', 'T细胞'] },
                { text: '免疫系统', sub: ['免疫器官', '免疫细胞', '免疫物质'] },
                { text: '免疫失调', sub: ['过敏反应', '自身免疫病', '免疫缺陷病'] },
                { text: '免疫应用', sub: ['疫苗', '抗原', '抗体', '单克隆抗体'] }
            ],
            keywords: ['抗原', '抗体', 'B细胞', 'T细胞', '淋巴因子']
        },
        '神经调节': {
            branches: [
                { text: '神经元', sub: ['细胞体', '突起', '轴突', '树突', '突触'] },
                { text: '反射与反射弧', sub: ['感受器', '传入神经', '神经中枢', '传出神经', '效应器'] },
                { text: '兴奋的传导', sub: ['神经冲动', '电位变化', '传导特点'] },
                { text: '兴奋的传递', sub: ['突触传递', '神经递质', '受体'] },
                { text: '高级神经中枢', sub: ['大脑皮层', '躯体运动中枢', '语言中枢'] }
            ],
            keywords: ['神经元', '突触', '神经递质', '反射弧', '电位']
        },
        '遗传基本规律': {
            branches: [
                { text: '分离定律', sub: ['等位基因', '杂合子', '纯合子', '性状分离'] },
                { text: '自由组合定律', sub: ['非同源染色体', '自由组合', '基因重组'] },
                { text: '连锁与交换定律', sub: ['完全连锁', '不完全连锁', '交换率'] },
                { text: '伴性遗传', sub: ['X连锁', 'Y连锁', '交叉遗传', '男性多于女性'] },
                { text: '遗传病', sub: ['单基因遗传', '多基因遗传', '染色体异常'] }
            ],
            keywords: ['等位基因', '纯合子', '杂合子', '性状分离', '基因型']
        },
        '细胞分裂': {
            branches: [
                { text: '有丝分裂', sub: ['间期', '前期', '中期', '后期', '末期', '染色体行为'] },
                { text: '减数分裂', sub: ['第一次分裂', '第二次分裂', '同源染色体', '四分体'] },
                { text: '配子形成', sub: ['精子形成', '卵细胞形成', '受精作用'] },
                { text: '分裂与遗传', sub: ['DNA复制', '染色体数目', '基因分离', '基因重组'] }
            ],
            keywords: ['染色体', 'DNA', '同源染色体', '四分体', '姐妹染色单体']
        },
        'DNA与基因': {
            branches: [
                { text: 'DNA结构', sub: ['双螺旋', '碱基配对', '磷酸二酯键', '反向平行'] },
                { text: 'DNA复制', sub: ['半保留复制', '解旋酶', 'DNA聚合酶', '原料'] },
                { text: '基因表达', sub: ['转录', '翻译', 'mRNA', 'tRNA', '密码子'] },
                { text: '基因工程', sub: ['限制酶', '载体', '目的基因', '转基因'] }
            ],
            keywords: ['DNA', '基因', '转录', '翻译', '密码子', '反密码子']
        },
        '生态系统': {
            branches: [
                { text: '组成成分', sub: ['生产者', '消费者', '分解者', '非生物物质'] },
                { text: '结构', sub: ['食物链', '食物网', '营养级', '生物富集'] },
                { text: '能量流动', sub: ['输入', '传递', '散失', '金字塔'] },
                { text: '物质循环', sub: ['碳循环', '氮循环', '水循环'] },
                { text: '稳定性', sub: ['抵抗力稳定性', '恢复力稳定性', '反馈调节'] }
            ],
            keywords: ['食物链', '能量流动', '物质循环', '抵抗力稳定性']
        },
        '植物激素调节': {
            branches: [
                { text: '生长素', sub: ['促进生长', '两重性', '顶端优势', '向性运动'] },
                { text: '其他植物激素', sub: ['赤霉素', '细胞分裂素', '乙烯', '脱落酸'] },
                { text: '生长调节剂', sub: ['类似物', '抑制剂', '人工合成'] },
                { text: '应用', sub: ['扦插', '果实发育', '除草剂'] }
            ],
            keywords: ['生长素', '两重性', '顶端优势', '赤霉素', '乙烯']
        },
        '变异与进化': {
            branches: [
                { text: '基因突变', sub: ['类型', '特点', '原因', '意义'] },
                { text: '染色体变异', sub: ['结构变异', '数目变异', '多倍体', '单倍体'] },
                { text: '可遗传变异', sub: ['基因突变', '基因重组', '染色体变异'] },
                { text: '进化理论', sub: ['拉马克', '达尔文', '现代综合进化论'] },
                { text: '种群基因频率', sub: ['基因频率', '基因型频率', '哈迪温伯格'] }
            ],
            keywords: ['基因突变', '染色体变异', '基因频率', '自然选择', '隔离']
        }
    },

    generateMindMap(concept) {
        this.state.centerConcept = concept;
        this.state.nodes = [];
        this.state.connections = [];
        this.state.selectedNode = null;

        const library = this.conceptLibrary[concept];
        if (!library) return;

        this.state.nodes.push({
            id: 'center',
            text: concept,
            x: 500,
            y: 300,
            isCenter: true,
            keywords: library.keywords
        });

        const centerX = 500;
        const centerY = 300;
        const branchRadius = 200;

        library.branches.forEach((branch, idx) => {
            const angle = (idx / library.branches.length) * 2 * Math.PI - Math.PI / 2;
            const bx = centerX + branchRadius * Math.cos(angle);
            const by = centerY + branchRadius * Math.sin(angle);

            const branchNode = {
                id: `branch-${idx}`,
                text: branch.text,
                x: bx,
                y: by,
                isBranch: true,
                angle: angle
            };
            this.state.nodes.push(branchNode);
            this.state.connections.push({ from: 'center', to: branchNode.id });

            const subRadius = 100;
            branch.sub.forEach((subText, subIdx) => {
                const subAngle = angle + (subIdx - (branch.sub.length - 1) / 2) * 0.4;
                const sx = bx + subRadius * Math.cos(subAngle);
                const sy = by + subRadius * Math.sin(subAngle);

                const subNode = {
                    id: `sub-${idx}-${subIdx}`,
                    text: subText,
                    x: sx,
                    y: sy,
                    isSub: true
                };
                this.state.nodes.push(subNode);
                this.state.connections.push({ from: branchNode.id, to: subNode.id });
            });
        });

        this.renderMindMap();
    },

    setLayout(mode) {
        this.state.layoutMode = mode;
        this.rearrangeLayout();
        this.renderMindMap();
    },

    rearrangeLayout() {
        if (this.state.nodes.length === 0) return;

        const center = this.state.nodes.find(n => n.isCenter);
        if (!center) return;

        center.x = 500;
        center.y = 300;

        const branches = this.state.nodes.filter(n => n.isBranch);
        const branchRadius = this.state.layoutMode === 'tree' ? 180 : 220;

        branches.forEach((branch, idx) => {
            const angle = (idx / branches.length) * 2 * Math.PI - Math.PI / 2;
            branch.x = center.x + branchRadius * Math.cos(angle);
            branch.y = center.y + branchRadius * Math.sin(angle);
            branch.angle = angle;
        });

        this.state.nodes.filter(n => n.isSub).forEach(sub => {
            const parentId = this.state.connections.find(c => c.to === sub.id)?.from;
            const parent = this.state.nodes.find(n => n.id === parentId);
            if (parent) {
                const siblings = this.state.nodes.filter(n =>
                    n.isSub && this.state.connections.find(c => c.from === parentId && c.to === n.id)
                );
                const idx = siblings.indexOf(sub);
                const angleOffset = (idx - (siblings.length - 1) / 2) * 0.5;
                const angle = parent.angle + angleOffset;
                const dist = 100;
                sub.x = parent.x + dist * Math.cos(angle);
                sub.y = parent.y + dist * Math.sin(angle);
            }
        });
    },

    addNode(parentId, text) {
        const parent = this.state.nodes.find(n => n.id === parentId);
        if (!parent) return;

        const newId = `custom-${Date.now()}`;
        const angle = Math.random() * Math.PI * 2;
        const dist = 120;

        this.state.nodes.push({
            id: newId,
            text: text,
            x: parent.x + dist * Math.cos(angle),
            y: parent.y + dist * Math.sin(angle),
            isCustom: true
        });

        this.state.connections.push({ from: parentId, to: newId });
        this.renderMindMap();
    },

    deleteNode(nodeId) {
        const node = this.state.nodes.find(n => n.id === nodeId);
        if (!node || node.isCenter) return;

        this.state.nodes = this.state.nodes.filter(n => {
            const conn = this.state.connections.find(c => c.from === n.id || c.to === n.id);
            return conn !== undefined;
        });

        this.state.connections = this.state.connections.filter(c => c.from !== nodeId && c.to !== nodeId);
        this.state.connections = this.state.connections.filter(c =>
            this.state.nodes.some(n => n.id === c.from) && this.state.nodes.some(n => n.id === c.to)
        );

        const childIds = this.state.connections.filter(c => c.from === nodeId).map(c => c.to);
        childIds.forEach(childId => this.deleteNode(childId));

        this.state.nodes = this.state.nodes.filter(n => n.id !== nodeId);
        this.renderMindMap();
    },

    startDrag(nodeId, e) {
        this.state.isDragging = true;
        this.state.selectedNode = nodeId;
        this.state.dragOffset = {
            x: e.clientX - this.state.nodes.find(n => n.id === nodeId).x,
            y: e.clientY - this.state.nodes.find(n => n.id === nodeId).y
        };
    },

    onDrag(e) {
        if (!this.state.isDragging || !this.state.selectedNode) return;

        const node = this.state.nodes.find(n => n.id === this.state.selectedNode);
        if (node) {
            node.x = e.clientX - this.state.dragOffset.x;
            node.y = e.clientY - this.state.dragOffset.y;
            this.renderMindMap();
        }
    },

    endDrag() {
        this.state.isDragging = false;
        this.state.selectedNode = null;
    },

    highlightKeywords() {
        if (!this.state.selectedNode) return;
        const node = this.state.nodes.find(n => n.id === this.state.selectedNode);
        if (node && node.keywords) {
            node.text = node.text.split('').map(c =>
                node.keywords.includes(c) ? `<mark>${c}</mark>` : c
            ).join('');
        }
    },

    exportAsImage() {
        const svg = document.querySelector('.mindmap-svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        canvas.width = 1200;
        canvas.height = 800;

        img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const link = document.createElement('a');
            link.download = `${this.state.centerConcept}-思维导图.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    },

    renderMindMap() {
        const app = document.getElementById('biology-mindmap-app');
        if (!app) return;

        let svgContent = `<svg class="mindmap-svg" width="1000" height="600" style="background: #fafafa">`;

        this.state.connections.forEach(conn => {
            const from = this.state.nodes.find(n => n.id === conn.from);
            const to = this.state.nodes.find(n => n.id === conn.to);
            if (from && to) {
                const isMain = from.isCenter;
                svgContent += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
                    stroke="${isMain ? '#4CAF50' : '#666'}" stroke-width="${isMain ? 3 : 1.5}"
                    style="pointer-events: none"/>`;
            }
        });

        this.state.nodes.forEach(node => {
            const isSelected = this.state.selectedNode === node.id;
            const isCenter = node.isCenter;

            let fillColor = isCenter ? '#4CAF50' : node.isBranch ? '#2196F3' : '#fff';
            let textColor = isCenter || node.isBranch ? '#fff' : '#333';
            let fontSize = isCenter ? 18 : node.isBranch ? 14 : 12;
            let width = isCenter ? 160 : node.isBranch ? 120 : 100;
            let height = isCenter ? 50 : node.isBranch ? 40 : 35;

            svgContent += `
                <g class="node ${node.isCenter ? 'center-node' : ''}"
                    style="cursor: move"
                    data-id="${node.id}"
                    onmousedown="biologyMindMap.startDrag('${node.id}', event)">
                    <rect x="${node.x - width/2}" y="${node.y - height/2}"
                        width="${width}" height="${height}"
                        fill="${fillColor}" stroke="${isSelected ? '#ff9800' : 'transparent'}"
                        stroke-width="${isSelected ? 3 : 0}" rx="8"/>
                    <text x="${node.x}" y="${node.y + 5}"
                        text-anchor="middle" fill="${textColor}"
                        font-size="${fontSize}" font-weight="${isCenter ? 'bold' : 'normal'}">
                        ${node.text}
                    </text>
                </g>
            `;
        });

        svgContent += '</svg>';

        const conceptNames = Object.keys(this.conceptLibrary);

        app.innerHTML = `
            <div class="mindmap-generator">
                <div class="mm-header">
                    <h3>🧠 生物概念图/思维导图生成器</h3>
                    <div class="mm-controls">
                        <select onchange="biologyMindMap.generateMindMap(this.value)">
                            <option value="">选择核心概念...</option>
                            ${conceptNames.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                        <div class="layout-buttons">
                            <button class="btn ${this.state.layoutMode === 'radial' ? 'btn-primary' : 'btn-secondary'}"
                                onclick="biologyMindMap.setLayout('radial')">放射状</button>
                            <button class="btn ${this.state.layoutMode === 'tree' ? 'btn-primary' : 'btn-secondary'}"
                                onclick="biologyMindMap.setLayout('tree')">树状</button>
                            <button class="btn ${this.state.layoutMode === 'flow' ? 'btn-primary' : 'btn-secondary'}"
                                onclick="biologyMindMap.setLayout('flow')">流程式</button>
                        </div>
                        <button class="btn btn-primary" onclick="biologyMindMap.exportAsImage()">
                            📷 导出PNG
                        </button>
                    </div>
                </div>

                <div class="mm-main">
                    <div class="mindmap-canvas" id="mindmap-canvas">
                        ${this.state.nodes.length > 0 ? svgContent : `
                            <div class="mm-placeholder">
                                <div class="placeholder-icon">🧠</div>
                                <p>请从上方选择核心概念</p>
                                <p>系统将自动生成思维导图</p>
                            </div>
                        `}
                    </div>

                    <div class="node-editor">
                        <h4>📝 节点编辑</h4>
                        <div id="editor-content">
                            ${this.state.selectedNode ? this.renderNodeEditor() : '<p class="placeholder-text">选择节点进行编辑</p>'}
                        </div>
                    </div>
                </div>

                <div class="mm-tips">
                    <div class="info-box">
                        <h4>💡 使用技巧</h4>
                        <ul>
                            <li>选择核心概念后，系统会自动生成包含广东卷考点的思维导图</li>
                            <li>拖拽节点可调整位置</li>
                            <li>点击节点后可编辑文本或添加子节点</li>
                            <li>支持三种布局模式切换</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('mouseup', () => this.endDrag());
    },

    renderNodeEditor() {
        const node = this.state.nodes.find(n => n.id === this.state.selectedNode);
        if (!node) return '';

        return `
            <div class="editor-form">
                <div class="form-group">
                    <label>节点文本</label>
                    <input type="text" id="node-text" value="${node.text}" onchange="biologyMindMap.updateNodeText(this.value)">
                </div>
                ${!node.isCenter ? `
                    <div class="form-group">
                        <label>添加子节点</label>
                        <div class="add-sub">
                            <input type="text" id="sub-text" placeholder="输入子节点内容...">
                            <button class="btn btn-primary" onclick="biologyMindMap.addSubNode()">添加</button>
                        </div>
                    </div>
                    <button class="btn btn-danger" onclick="biologyMindMap.deleteNode('${node.id}')">🗑️ 删除此节点</button>
                ` : '<p class="tip">中心节点不能删除，但可以修改文本</p>'}
            </div>
        `;
    },

    updateNodeText(text) {
        const node = this.state.nodes.find(n => n.id === this.state.selectedNode);
        if (node) {
            node.text = text;
            this.renderMindMap();
        }
    },

    addSubNode() {
        const text = document.getElementById('sub-text').value;
        if (text && this.state.selectedNode) {
            this.addNode(this.state.selectedNode, text);
        }
    }
};

/**
 * 遗传系谱训练器 - 系谱图判读与遗传方式判断练习，含提示与错题记录
 * @module geneticsPedigreeTrainer
 * @example window.geneticsPedigreeTrainer.selectProblem()
 */
const geneticsPedigreeTrainer = {
    state: {
        currentProblem: null,
        userAnswers: {},
        showAnswer: false,
        hintLevel: 0,
        wrongAnswers: []
    },

    problems: [
        {
            id: 1,
            type: 'autosomal-dominant',
            name: '常染色体显性遗传-1',
            description: '某医院收治了如下所示的家系，回答问题：',
            pedigree: '01-02/03-04-05/06-07/08',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'judgment',
                    question: '判断该遗传病的遗传方式',
                    options: ['常染色体显性遗传', '常染色体隐性遗传', 'X染色体显性遗传', 'X染色体隐性遗传'],
                    correct: 0,
                    explanation: '分析要点：①男女患病率无明显差异 ②患者后代中约有1/2患病 ③存在连续遗传现象，符合显性遗传特征'
                },
                {
                    type: 'genotype',
                    question: '写出I-1的基因型',
                    options: ['AA', 'Aa', 'aa', '无法确定'],
                    correct: 1,
                    explanation: 'I-1患病，但其女儿（II-2）正常，说明I-1为杂合子Aa。若为AA，则女儿全部患病'
                },
                {
                    type: 'probability',
                    question: '若II-3与正常男性结婚，其后代患病的概率是',
                    options: ['1/4', '1/2', '2/3', '3/4'],
                    correct: 1,
                    explanation: 'II-3正常，其基因型为aa；II-4患病，其基因型可能为Aa或AA，但根据家系分析为Aa的概率为2/3（排除AA），故后代患病概率=2/3×1/2=1/3≈1/2'
                }
            ],
            keyPoints: ['显性遗传连续遗传', '男女患病机会均等', '患者多为杂合子']
        },
        {
            id: 2,
            type: 'autosomal-recessive',
            name: '常染色体隐性遗传-1',
            description: '分析下列遗传系谱图，回答问题：',
            pedigree: '01-02/03-04/05-06',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'judgment',
                    question: '判断该遗传病的遗传方式',
                    options: ['常染色体显性遗传', '常染色体隐性遗传', 'X染色体显性遗传', 'Y染色体遗传'],
                    correct: 1,
                    explanation: '分析要点：①正常父母生出患病子女，符合隐性遗传 ②男女患病率无明显差异 ③隔代遗传现象'
                },
                {
                    type: 'genotype',
                    question: '写出II-3的基因型',
                    options: ['AA', 'Aa', 'aa', '无法确定'],
                    correct: 2,
                    explanation: 'II-3患病，其基因型只能是aa'
                },
                {
                    type: 'probability',
                    question: '若III-1与基因型为Aa的人结婚，其后代患病的概率是',
                    options: ['1/4', '1/2', '1/3', '1/6'],
                    correct: 1,
                    explanation: 'III-1正常但携带致病基因（Aa），与Aa结婚，后代患病概率=1/2×1/2=1/4（aa），但需考虑III-1为携带者的概率'
                }
            ],
            keyPoints: ['隐性遗传隔代遗传', '携带者不表现病症', '近亲结婚增加发病率']
        },
        {
            id: 3,
            type: 'x-linked-recessive',
            name: 'X染色体隐性遗传-1',
            description: '某红绿色盲家系如下，回答问题：',
            pedigree: '01-02/03-04-05/06-07/08',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'judgment',
                    question: '判断该遗传病的遗传方式',
                    options: ['常染色体显性遗传', '常染色体隐性遗传', 'X染色体显性遗传', 'X染色体隐性遗传'],
                    correct: 3,
                    explanation: '分析要点：①男性患者显著多于女性 ②交叉遗传（外公→外婆→舅舅）③母亲携带者传递给儿子'
                },
                {
                    type: 'genotype',
                    question: '写出I-1的基因型',
                    options: ['X^B X^b', 'X^b X^b', 'X^B Y', 'X^b Y'],
                    correct: 3,
                    explanation: 'I-1为男性患者，基因型为X^b Y'
                },
                {
                    type: 'probability',
                    question: '若II-4（正常女性）与正常男性结婚，其儿子患病的概率是',
                    options: ['0', '1/4', '1/2', '1/8'],
                    correct: 2,
                    explanation: 'II-4正常，其父亲I-2为患者(X^b Y)，故II-4必为携带者X^B X^b；与正常男性(X^B Y)结婚，儿子从母亲获得X^B或X^b各50%概率，获得X^b则患病，故儿子患病概率=1/2'
                }
            ],
            keyPoints: ['男性患者多于女性', '交叉遗传特点', '女儿正常则不为携带者']
        },
        {
            id: 4,
            type: 'x-linked-dominant',
            name: 'X染色体显性遗传-1',
            description: '研究某遗传病家系：',
            pedigree: '01-02/03-04-05/06-07',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'judgment',
                    question: '判断该遗传病的遗传方式',
                    options: ['常染色体显性遗传', '常染色体隐性遗传', 'X染色体显性遗传', 'X染色体隐性遗传'],
                    correct: 2,
                    explanation: '分析要点：①女性患者多于男性 ②世代相传 ③男性患者女儿全部患病'
                },
                {
                    type: 'probability',
                    question: '若II-2（杂合子患者X^A X^a）与正常男性结婚，其子女患病情况是',
                    options: ['女儿和儿子均有50%概率患病', '全部正常', '女儿患病儿子正常', '儿子患病女儿正常'],
                    correct: 0,
                    explanation: 'II-2为杂合子患者X^A X^a，与正常男性X^a Y结婚：女儿获得X^A或X^a各50%，儿子获得X^A或Y(含X^a)各50%。故女儿和儿子患病概率均为1/2，与性别无关'
                }
            ],
            keyPoints: ['女性患者多于男性', '男性患者女儿全患病', '连续遗传']
        },
        {
            id: 5,
            type: 'y-linked',
            name: 'Y染色体遗传-1',
            description: '某家族中外耳道多毛症家系：',
            pedigree: '01/02-03/04-05/06',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'judgment',
                    question: '判断该遗传病的遗传方式',
                    options: ['常染色体遗传', 'X染色体遗传', 'Y染色体遗传', '细胞质遗传'],
                    correct: 2,
                    explanation: '分析要点：①男性全部患病 ②女性正常 ③父传子、子传孙'
                },
                {
                    type: 'judgment',
                    question: '关于该遗传病的说法正确的是',
                    options: ['男性发病与母亲有关', '女儿可能遗传父亲性状', '符合父传子传孙规律', '需要环境因素触发'],
                    correct: 2,
                    explanation: 'Y染色体遗传的特点：限雄遗传，父亲传给儿子，儿子传给孙子'
                }
            ],
            keyPoints: ['限雄遗传', '父传子子传孙', '女性不患病']
        },
        {
            id: 6,
            type: 'autosomal-dominant',
            name: '常染色体显性遗传-2（罕见）',
            description: '并指症家系分析：',
            pedigree: '01-02/03-04-05/06-07/08-09',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'genotype',
                    question: 'II-5的基因型可能是（用A表示致病基因）',
                    options: ['AA', 'Aa', 'aa', 'AA或Aa'],
                    correct: 3,
                    explanation: 'II-5患病，可能为AA或Aa。若为AA，则其所有子女均患病；若为Aa，则子女患病概率为1/2'
                },
                {
                    type: 'probability',
                    question: '若II-5与正常女性结婚生了两个儿子，第一个正常，第二个患病的概率是',
                    options: ['1/4', '1/2', '1/3', '2/3'],
                    correct: 1,
                    explanation: '已生一个正常儿子，说明II-5必为Aa（若为AA则子全部患病），故再生儿子患病概率=1/2'
                }
            ],
            keyPoints: ['不完全外显', '杂合子可表现正常', '概率计算需考虑已生子女']
        },
        {
            id: 7,
            type: 'autosomal-recessive',
            name: '常染色体隐性遗传-2（白化病）',
            description: '白化病遗传家系：',
            pedigree: '01-02/03-04/05-06-07/08-09',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'probability',
                    question: 'III-1为携带者的概率是',
                    options: ['1/4', '1/3', '2/3', '1/2'],
                    correct: 2,
                    explanation: 'II-3和II-4均为携带者（Aa），其子II-5正常的概率=2/3（排除aa），为携带者的概率=2/3'
                },
                {
                    type: 'probability',
                    question: '若III-1与正常女性（其兄弟患病）结婚，第一个孩子患病的概率是',
                    options: ['1/9', '1/4', '1/3', '2/9'],
                    correct: 0,
                    explanation: 'III-1为Aa的概率=2/3，正常女性兄弟患病，其父母均为携带者，故该女性为携带者概率=2/3，后代患病概率=2/3×2/3×1/4=1/9'
                }
            ],
            keyPoints: ['携带者概率计算', '近亲结婚风险', '基因频率应用']
        },
        {
            id: 8,
            type: 'x-linked-recessive',
            name: 'X染色体隐性遗传-2（血友病）',
            description: '血友病家系分析：',
            pedigree: '01-02/03-04/05-06-07/08',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'genotype',
                    question: 'II-3的基因型是',
                    options: ['X^H X^H', 'X^H X^h', 'X^h X^h', '无法确定'],
                    correct: 1,
                    explanation: 'II-3正常，但其母I-2为携带者，其父正常，故II-3为携带者的概率=1/2'
                },
                {
                    type: 'probability',
                    question: 'II-3与正常男性结婚，生一个儿子，患病的概率是',
                    options: ['0', '1/8', '1/4', '1/2'],
                    correct: 2,
                    explanation: 'II-3为携带者X^H X^h的概率=1/2，与正常男性X^H Y结婚，儿子患病概率=1/2×1/2=1/4'
                }
            ],
            keyPoints: ['携带者频率计算', '男孩患病率', '产前诊断意义']
        },
        {
            id: 9,
            type: 'multiple-genes',
            name: '多基因遗传-身高',
            description: '人类身高受多基因控制：',
            pedigree: '父母均160cm/子女分布',
            legend: '父母身高遗传给子女',
            questions: [
                {
                    type: 'judgment',
                    question: '关于多基因遗传的说法正确的是',
                    options: ['完全由环境决定', '完全由基因决定', '基因与环境共同决定', '符合孟德尔遗传规律'],
                    correct: 2,
                    explanation: '多基因遗传的特点：①基因数目多②每对基因作用微小③环境因素有重要影响④呈正态分布'
                },
                {
                    type: 'calculation',
                    question: '若父母身高均为170cm，子女身高分布应该是',
                    options: ['全部170cm', '全部180cm', '正态分布', '无法预测'],
                    correct: 2,
                    explanation: '多基因遗传的数量性状在群体中呈正态分布，子女身高向平均值回归'
                }
            ],
            keyPoints: ['数量性状', '正态分布', '遗传率']
        },
        {
            id: 10,
            type: 'mitochondrial',
            name: '细胞质遗传（线粒体）',
            description: '某线粒体遗传病家系：',
            pedigree: '01-02/03-04/05-06',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'judgment',
                    question: '判断该遗传病的遗传方式',
                    options: ['常染色体遗传', 'X染色体遗传', 'Y染色体遗传', '细胞质遗传'],
                    correct: 3,
                    explanation: '线粒体遗传特点：①母亲传递给孩子 ②子女均可患病 ③父亲不传递'
                },
                {
                    type: 'judgment',
                    question: '关于线粒体遗传的说法正确的是',
                    options: ['父亲可以传递', '只传男不传女', '母亲传递给孩子', '符合孟德尔定律'],
                    correct: 2,
                    explanation: '线粒体DNA只通过卵细胞传递，所以是母系遗传'
                }
            ],
            keyPoints: ['母系遗传', '线粒体DNA', '不影响男性后代']
        },
        {
            id: 11,
            type: 'autosomal-dominant',
            name: '常染色体显性遗传-3（软骨发育不全）',
            description: '软骨发育不全侏儒症家系：',
            pedigree: '01-02/03-04-05/06-07',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'judgment',
                    question: '该遗传病的遗传方式可能是',
                    options: ['常染色体隐性', '常染色体显性', 'X连锁隐性', 'X连锁显性'],
                    correct: 1,
                    explanation: '患者父母一方患病，子女患病率约1/2，符合显性遗传'
                },
                {
                    type: 'probability',
                    question: '若患者与正常人结婚，其子女患病概率是',
                    options: ['0', '1/4', '1/2', '3/4'],
                    correct: 2,
                    explanation: '患者多为杂合子Aa，与正常人aa结婚，子女患病概率=1/2'
                }
            ],
            keyPoints: ['显性遗传', '侏儒症', '纯合子致死']
        },
        {
            id: 12,
            type: 'autosomal-recessive',
            name: '常染色体隐性遗传-3（苯丙酮尿症）',
            description: '苯丙酮尿症家系：',
            pedigree: '01-02/03-04/05-06-07',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'genotype',
                    question: 'II-3的基因型是',
                    options: ['AA', 'Aa', 'aa', '可能为Aa或AA'],
                    correct: 2,
                    explanation: 'II-3患病，基因型为aa'
                },
                {
                    type: 'probability',
                    question: 'II-4是携带者的概率是',
                    options: ['1/4', '1/3', '1/2', '2/3'],
                    correct: 3,
                    explanation: 'II-4表现正常，其父母均为携带者，故II-4为携带者概率=2/3'
                }
            ],
            keyPoints: ['隐性遗传', '携带者频率', '近亲结婚风险']
        },
        {
            id: 13,
            type: 'x-linked-recessive',
            name: 'X染色体隐性遗传-3（进行性肌营养不良）',
            description: 'DMD家系分析：',
            pedigree: '01-02/03-04/05-06-07',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'genotype',
                    question: 'I-1的基因型是',
                    options: ['X^D X^D', 'X^D X^d', 'X^d X^d', 'X^D Y'],
                    correct: 3,
                    explanation: 'I-1为男性患者，基因型为X^d Y'
                },
                {
                    type: 'probability',
                    question: '若II-2与正常男性结婚，其后代患病的概率是',
                    options: ['0', '1/4', '1/2', '无法计算'],
                    correct: 0,
                    explanation: 'II-2正常，其母I-2为携带者，其父I-1为患者，故II-2为携带者的概率=1/2×1/2=1/4（考虑母亲传递概率），但题目中II-2已知正常...'
                }
            ],
            keyPoints: ['严重遗传病', '携带者检测', '基因治疗']
        },
        {
            id: 14,
            type: 'autosomal-dominant',
            name: '常染色体显性遗传-4（亨丁顿舞蹈症）',
            description: '亨丁顿舞蹈症家系：',
            pedigree: '01-02/03-04/05-06-07-08',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'judgment',
                    question: '该病的遗传特点是',
                    options: ['早发型', '迟发型', '胚胎致死', '发病与年龄无关'],
                    correct: 1,
                    explanation: '亨丁顿舞蹈症为迟发性遗传病，发病年龄与基因型有关，纯合子发病更早更严重'
                },
                {
                    type: 'probability',
                    question: '若II-3在40岁正常，其子女发病概率是',
                    options: ['0', '1/4', '1/2', '无法确定'],
                    correct: 2,
                    explanation: 'II-3已40岁未发病，仍有50%概率携带致病基因，其子女发病概率=1/2'
                }
            ],
            keyPoints: ['迟发性遗传', '三核苷酸重复', '基因诊断']
        },
        {
            id: 15,
            type: 'complex-inheritance',
            name: '复杂遗传（精神分裂症）',
            description: '精神分裂症遗传家系：',
            pedigree: '01-02/03-04/05-06-07',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'judgment',
                    question: '关于该病遗传方式说法正确的是',
                    options: ['单基因遗传', '多基因遗传', '染色体病', '线粒体遗传'],
                    correct: 1,
                    explanation: '精神分裂症是多基因遗传病，受多个基因和环境因素共同影响'
                },
                {
                    type: 'judgment',
                    question: '该病的遗传特点包括',
                    options: ['完全外显', '家系聚集性', '与环境无关', '只有基因决定'],
                    correct: 1,
                    explanation: '多基因遗传病的特点：①家系聚集性②遗传率一般在40-60%③环境因素起重要作用'
                }
            ],
            keyPoints: ['多基因遗传', '遗传率', '家系聚集']
        },
        {
            id: 16,
            type: 'autosomal-recessive',
            name: '常染色体隐性遗传-4（先天性耳聋）',
            description: '先天性耳聋家系分析：',
            pedigree: '01-02/03-04/05-06',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'genotype',
                    question: 'II-2的基因型是',
                    options: ['AA', 'Aa或AA', 'aa', '无法确定'],
                    correct: 1,
                    explanation: 'II-2表现正常，但其兄患病，其父母均为携带者，故II-2为携带者或纯合子正常'
                },
                {
                    type: 'probability',
                    question: '若II-2与II-3结婚，其后代患病的概率是',
                    options: ['1/16', '1/9', '1/4', '1/3'],
                    correct: 2,
                    explanation: 'II-2为携带者概率=2/3，II-3为携带者概率=2/3，后代患病概率=2/3×2/3×1/4=1/9'
                }
            ],
            keyPoints: ['遗传异质性', '携带者概率', '近亲结婚']
        },
        {
            id: 17,
            type: 'x-linked-recessive',
            name: 'X染色体隐性遗传-4（红绿色盲）',
            description: '红绿色盲遗传分析：',
            pedigree: '01-02/03-04/05-06/07-08',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'probability',
                    question: '若II-3与正常男性结婚，其儿子患病的概率是',
                    options: ['0', '1/4', '1/2', '1/8'],
                    correct: 2,
                    explanation: 'II-3正常，其母I-2为携带者，其父正常，故II-3为携带者概率=1/2，儿子患病概率=1/2×1/2=1/4（考虑生男生女）'
                },
                {
                    type: 'probability',
                    question: '其女儿患病的概率是',
                    options: ['0', '1/4', '1/2', '1'],
                    correct: 0,
                    explanation: '女儿不会患病，但可能是携带者（若II-3为携带者X^B X^b，则女儿1/2为携带者）'
                }
            ],
            keyPoints: ['男性发病率高', '携带者频率', '产前诊断']
        },
        {
            id: 18,
            type: 'autosomal-dominant',
            name: '常染色体显性遗传-5（马凡综合征）',
            description: '马凡综合征家系（身材高、臂长、晶体脱位）：',
            pedigree: '01-02/03-04-05/06-07',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'judgment',
                    question: '该病的遗传方式是',
                    options: ['常染色体隐性', '常染色体显性', 'X连锁隐性', 'X连锁显性'],
                    correct: 1,
                    explanation: '连续遗传、男女患病，符合显性遗传特点'
                },
                {
                    type: 'probability',
                    question: '若II-5与正常人结婚，其儿子患病的概率是',
                    options: ['0', '1/4', '1/2', '1'],
                    correct: 2,
                    explanation: '患者多为杂合子，与正常人结婚，子女患病概率=1/2'
                }
            ],
            keyPoints: ['显性遗传', '不完全外显', '临床异质性']
        },
        {
            id: 19,
            type: 'autosomal-recessive',
            name: '常染色体隐性遗传-5（肝豆状核变性）',
            description: '肝豆状核变性（铜代谢障碍）家系：',
            pedigree: '01-02/03-04/05-06-07',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'genotype',
                    question: 'III-1的基因型可能是',
                    options: ['AA', 'Aa', 'aa', 'Aa或AA'],
                    correct: 1,
                    explanation: 'III-1正常，但其姐患病，其父母均为携带者，故III-1为携带者或纯合子正常'
                },
                {
                    type: 'probability',
                    question: 'III-1与基因型相同的异性结婚，其后代为携带者的概率是',
                    options: ['1/4', '1/2', '2/3', '1'],
                    correct: 1,
                    explanation: '若III-1为携带者（Aa），与Aa结婚，后代为携带者（AA或Aa）的概率=1/2（排除aa）'
                }
            ],
            keyPoints: ['代谢病', '携带者', '治疗方案']
        },
        {
            id: 20,
            type: 'special-pattern',
            name: '遗传印记-Prader-Willi综合征',
            description: 'Prader-Willi综合征（肥胖、智力障碍）家系：',
            pedigree: '01-02/03-04/05-06',
            legend: '■=患病男性 □=正常男性 ●=患病女性 ○=正常女性',
            questions: [
                {
                    type: 'judgment',
                    question: '该病可能属于哪种遗传方式',
                    options: ['常染色体显性', '常染色体隐性', '印记遗传', '多基因遗传'],
                    correct: 2,
                    explanation: 'Prader-Willi综合征是印记遗传的典型例子，来自父亲的15q11-13缺失导致发病，来自母亲的该区域缺失则不发病（Angelman综合征）'
                },
                {
                    type: 'judgment',
                    question: '关于遗传印记的说法正确的是',
                    options: ['基因序列改变', '基因表达水平不同', 'DNA序列不变', '只影响男性'],
                    correct: 2,
                    explanation: '遗传印记是表观遗传现象，DNA序列不变但基因表达因亲本来源不同而差异'
                }
            ],
            keyPoints: ['遗传印记', '表观遗传', '亲本效应']
        }
    ],

    loadProblem(problemId) {
        this.state.currentProblem = this.problems.find(p => p.id === problemId);
        this.state.userAnswers = {};
        this.state.showAnswer = false;
        this.state.hintLevel = 0;
        this.renderTrainer();
    },

    selectProblem() {
        const app = document.getElementById('genetics-pedigree-app');
        if (!app) return;

        app.innerHTML = `
            <div class="pedigree-trainer">
                <div class="pt-header">
                    <h3>🧬 遗传系谱图练习器</h3>
                    <p class="pt-intro">练习遗传系谱图分析，掌握广东卷遗传题解题技巧</p>
                </div>

                <div class="pt-main">
                    <div class="problem-selector">
                        <h4>📚 题目类型</h4>
                        <div class="problem-categories">
                            <div class="category">
                                <h5>常染色体遗传</h5>
                                ${this.problems.filter(p => p.type.startsWith('autosomal')).map(p => `
                                    <button class="problem-btn" onclick="geneticsPedigreeTrainer.loadProblem(${p.id})">
                                        ${p.name}
                                    </button>
                                `).join('')}
                            </div>
                            <div class="category">
                                <h5>X染色体遗传</h5>
                                ${this.problems.filter(p => p.type.includes('x-')).map(p => `
                                    <button class="problem-btn" onclick="geneticsPedigreeTrainer.loadProblem(${p.id})">
                                        ${p.name}
                                    </button>
                                `).join('')}
                            </div>
                            <div class="category">
                                <h5>其他类型</h5>
                                ${this.problems.filter(p => !p.type.startsWith('autosomal') && !p.type.includes('x-')).map(p => `
                                    <button class="problem-btn" onclick="geneticsPedigreeTrainer.loadProblem(${p.id})">
                                        ${p.name}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <div class="wrong-answer-review">
                            <h4>📝 错题复习</h4>
                            ${this.state.wrongAnswers.length === 0 ?
                                '<p class="no-wrong">暂无错题记录</p>' :
                                this.state.wrongAnswers.map(w => `
                                    <button class="problem-btn wrong-btn" onclick="geneticsPedigreeTrainer.loadProblem(${w.problemId})">
                                        ${w.name} - 第${w.questionIndex + 1}题
                                    </button>
                                `).join('')
                            }
                        </div>
                    </div>

                    <div class="problem-area">
                        <div class="placeholder-area">
                            <div class="placeholder-icon">🧬</div>
                            <p>请从左侧选择题目开始练习</p>
                            <p>系统将提供即时验证和详细解析</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderTrainer() {
        const app = document.getElementById('genetics-pedigree-app');
        if (!app || !this.state.currentProblem) return;

        const problem = this.state.currentProblem;

        app.innerHTML = `
            <div class="pedigree-trainer">
                <div class="pt-header">
                    <h3>🧬 遗传系谱图练习器</h3>
                    <button class="btn btn-secondary" onclick="geneticsPedigreeTrainer.selectProblem()">← 返回选题</button>
                </div>

                <div class="pt-main">
                    <div class="pedigree-display">
                        <h4>系谱图</h4>
                        <div class="pedigree-svg">
                            ${this.renderPedigreeSVG(problem)}
                        </div>
                        <p class="legend">${problem.legend}</p>
                    </div>

                    <div class="questions-area">
                        ${problem.questions.map((q, idx) => `
                            <div class="question-card ${this.state.userAnswers[idx] !== undefined ? 'answered' : ''}">
                                <h5>问题 ${idx + 1}：${q.question}</h5>
                                <div class="options">
                                    ${q.options.map((opt, optIdx) => `
                                        <div class="option ${this.getOptionClass(q, idx, optIdx)}"
                                            onclick="geneticsPedigreeTrainer.selectAnswer(${idx}, ${optIdx})">
                                            <span class="opt-letter">${String.fromCharCode(65 + optIdx)}</span>
                                            <span class="opt-text">${opt}</span>
                                            ${this.state.userAnswers[idx] === optIdx ? this.getResultIcon(q, idx, optIdx) : ''}
                                        </div>
                                    `).join('')}
                                </div>

                                ${this.state.showAnswer || this.state.userAnswers[idx] !== undefined ? `
                                    <div class="explanation">
                                        <div class="explanation-header">
                                            <span class="explanation-icon">📖</span>
                                            <span>详细解析</span>
                                        </div>
                                        <p>${q.explanation}</p>
                                    </div>
                                ` : ''}

                                ${this.state.showAnswer ? '' : this.state.hintLevel > idx ? '' : `
                                    <button class="btn btn-hint" onclick="geneticsPedigreeTrainer.showHint(${idx})">
                                        💡 提示
                                    </button>
                                `}
                            </div>
                        `).join('')}

                        ${this.state.showAnswer ? '' : `
                            <button class="btn btn-primary btn-block" onclick="geneticsPedigreeTrainer.submitAll()">
                                提交答案
                            </button>
                        `}

                        ${this.state.showAnswer ? `
                            <div class="score-card">
                                <h4>得分：${this.calculateScore()}/${problem.questions.length}</h4>
                                <div class="key-points">
                                    <h5>🎯 关键考点</h5>
                                    <ul>
                                        ${problem.keyPoints.map(kp => `<li>${kp}</li>`).join('')}
                                    </ul>
                                </div>
                                <button class="btn btn-secondary" onclick="geneticsPedigreeTrainer.selectProblem()">
                                    选择下一题
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    renderPedigreeSVG(problem) {
        const patterns = {
            '01-02': [{x:50,y:50,s:'■'},{x:100,y:50,s:'□'},{x:75,y:80,l:1}],
            '03-04-05': [{x:50,y:150,s:'■'},{x:100,y:150,s:'□'},{x:150,y:150,s:'■'},{x:75,y:180,l:1},{x:125,y:180,l:1}],
            '06-07': [{x:75,y:220,s:'●'},{x:125,y:220,s:'○'},{x:100,y:250,l:1}],
            '08': [{x:100,y:280,s:'■'}],
            '01-02/03-04': [{x:50,y:50,s:'■'},{x:100,y:50,s:'□'},{x:75,y:80,l:1},{x:50,y:150,s:'■'},{x:100,y:150,s:'□'}],
            '05-06-07/08-09': [{x:50,y:200,s:'■'},{x:100,y:200,s:'□'},{x:150,y:200,s:'●'},{x:75,y:230,l:1},{x:125,y:230,l:1},{x:50,y:280,s:'□'},{x:100,y:280,s:'■'}],
            'parents': [{x:50,y:50,s:'□'},{x:100,y:50,s:'□'},{x:75,y:80,l:1}]
        };

        let svg = '<svg width="200" height="320" style="border:1px solid #ccc;background:#fafafa">';

        const ped = problem.pedigree;
        if (ped.includes('01-02/03-04-05')) {
            svg += this.drawPerson(50,50,'■','患病男');svg += this.drawPerson(100,50,'□','正常男');
            svg += this.drawPerson(50,100,'●','患病女');svg += this.drawPerson(100,100,'○','正常女');
            svg += '<line x1="75" y1="60" x2="75" y2="80" stroke="#333"/>';
            svg += this.drawPerson(50,150,'■','患病男');svg += this.drawPerson(100,150,'■','患病男');
            svg += '<line x1="75" y1="110" x2="75" y2="130" stroke="#333"/>';
        } else if (ped.includes('01-02')) {
            svg += this.drawPerson(50,50,'■','患病男');svg += this.drawPerson(100,50,'□','正常男');
            svg += '<line x1="75" y1="60" x2="75" y2="80" stroke="#333"/>';
        } else if (ped.includes('parents')) {
            svg += this.drawPerson(50,50,'□','正常男');svg += this.drawPerson(100,50,'□','正常男');
            svg += '<line x1="75" y1="60" x2="75" y2="80" stroke="#333"/>';
        }

        svg += '<text x="100" y="300" text-anchor="middle" font-size="12">系谱图示意</text>';
        svg += '</svg>';
        return svg;
    },

    drawPerson(x,y,symbol,label) {
        const fill = symbol.includes('■') || symbol.includes('●') ? '#333' : '#fff';
        const shape = symbol.includes('■') || symbol.includes('□') ? 'rect' : 'circle';
        let elem = '';
        if (shape === 'rect') {
            elem = `<rect x="${x-10}" y="${y-10}" width="20" height="20" fill="${fill}" stroke="#333"/>`;
        } else {
            elem = `<circle cx="${x}" cy="${y}" r="10" fill="${fill}" stroke="#333"/>`;
        }
        return elem;
    },

    selectAnswer(qIdx, optIdx) {
        if (this.state.showAnswer) return;
        this.state.userAnswers[qIdx] = optIdx;
        this.renderTrainer();
    },

    getOptionClass(question, qIdx, optIdx) {
        if (this.state.showAnswer) {
            if (optIdx === question.correct) return 'correct';
            if (this.state.userAnswers[qIdx] === optIdx) return 'wrong';
        }
        if (this.state.userAnswers[qIdx] === optIdx) return 'selected';
        return '';
    },

    getResultIcon(question, qIdx, optIdx) {
        if (this.state.showAnswer) {
            if (optIdx === question.correct) return '<span class="result-icon correct">✓</span>';
            if (this.state.userAnswers[qIdx] === optIdx) return '<span class="result-icon wrong">✗</span>';
        }
        return '';
    },

    showHint(qIdx) {
        const hints = [
            '提示1：该遗传病具有隔代遗传的特点',
            '提示2：注意观察男女患病比例',
            '提示3：考虑基因型频率的计算'
        ];
        alert(hints[Math.min(this.state.hintLevel, hints.length - 1)]);
        this.state.hintLevel = qIdx + 1;
    },

    submitAll() {
        if (Object.keys(this.state.userAnswers).length < this.state.currentProblem.questions.length) {
            alert('请回答所有问题');
            return;
        }

        this.state.showAnswer = true;

        this.state.currentProblem.questions.forEach((q, idx) => {
            if (this.state.userAnswers[idx] !== q.correct) {
                this.state.wrongAnswers.push({
                    problemId: this.state.currentProblem.id,
                    name: this.state.currentProblem.name,
                    questionIndex: idx
                });
            }
        });

        this.renderTrainer();
    },

    calculateScore() {
        if (!this.state.currentProblem) return 0;
        let correct = 0;
        this.state.currentProblem.questions.forEach((q, idx) => {
            if (this.state.userAnswers[idx] === q.correct) correct++;
        });
        return correct;
    },

    renderTrainer() {
        const app = document.getElementById('genetics-pedigree-app');
        if (!app || !this.state.currentProblem) return;

        const problem = this.state.currentProblem;

        app.innerHTML = `
            <div class="pedigree-trainer">
                <div class="pt-header">
                    <h3>🧬 遗传系谱图练习器</h3>
                    <button class="btn btn-secondary" onclick="geneticsPedigreeTrainer.selectProblem()">← 返回选题</button>
                </div>

                <div class="pt-main">
                    <div class="pedigree-display">
                        <h4>${problem.name}</h4>
                        <p class="problem-desc">${problem.description}</p>
                        <div class="pedigree-svg">
                            ${this.renderPedigreeSVG(problem)}
                        </div>
                        <p class="legend">${problem.legend}</p>
                    </div>

                    <div class="questions-area">
                        ${problem.questions.map((q, idx) => this.renderQuestion(q, idx)).join('')}

                        ${this.state.showAnswer ? `
                            <div class="score-card">
                                <h4>📊 得分：${this.calculateScore()}/${problem.questions.length}</h4>
                                <div class="key-points">
                                    <h5>🎯 关键考点</h5>
                                    <ul>
                                        ${problem.keyPoints.map(kp => `<li>${kp}</li>`).join('')}
                                    </ul>
                                </div>
                                <button class="btn btn-secondary" onclick="geneticsPedigreeTrainer.selectProblem()">
                                    选择下一题
                                </button>
                            </div>
                        ` : `
                            <button class="btn btn-primary btn-block" onclick="geneticsPedigreeTrainer.submitAll()"
                                ${Object.keys(this.state.userAnswers).length < problem.questions.length ? 'disabled' : ''}>
                                提交答案
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    },

    renderQuestion(q, idx) {
        return `
            <div class="question-card">
                <h5>问题 ${idx + 1}：${q.question}</h5>
                <div class="options">
                    ${q.options.map((opt, optIdx) => `
                        <div class="option ${this.getOptionClass(q, idx, optIdx)}"
                            onclick="geneticsPedigreeTrainer.selectAnswer(${idx}, ${optIdx})">
                            <span class="opt-letter">${String.fromCharCode(65 + optIdx)}</span>
                            <span class="opt-text">${opt}</span>
                            ${this.state.showAnswer && optIdx === q.correct ? '<span class="result-icon correct">✓</span>' : ''}
                            ${this.state.showAnswer && this.state.userAnswers[idx] === optIdx && optIdx !== q.correct ? '<span class="result-icon wrong">✗</span>' : ''}
                        </div>
                    `).join('')}
                </div>

                ${this.state.showAnswer ? `
                    <div class="explanation">
                        <div class="explanation-header">📖 解析</div>
                        <p>${q.explanation}</p>
                    </div>
                ` : ''}

                ${!this.state.showAnswer ? `
                    <button class="btn btn-hint" onclick="geneticsPedigreeTrainer.showHint(${idx})">💡 提示</button>
                ` : ''}
            </div>
        `;
    }
};

/**
 * 光合作用曲线训练器 - 光照/CO₂/温度等曲线分析，含错题本地存储
 * @module photosynthesisTrainer
 * @example window.photosynthesisTrainer.renderTrainer()
 */
const photosynthesisTrainer = {
    state: {
        currentCurve: null,
        userAnswer: null,
        showExplanation: false,
        wrongQuestions: JSON.parse(localStorage.getItem('wrongPhotosynthesis') || '[]')
    },

    curves: [
        {
            id: 1,
            name: '光照强度对光合作用的影响',
            type: 'photosynthesis',
            image: 'light-intensity',
            description: '在一定CO₂浓度和温度条件下，研究光照强度对光合速率的影响',
            data: { xLabel: '光照强度', yLabel: '光合速率', xUnit: 'klx', yUnit: 'mgCO₂/dm²·h' },
            keyPoints: ['A点：光照为0，只进行呼吸作用', 'AB段：光合速率随光照增强而增加', 'B点：光补偿点（Pn=0，Pg=R）', 'BC段：光合速率不变（限制因素为CO₂或温度）', 'C点：光饱和点'],
            questions: [
                {
                    type: 'choice',
                    question: '图中A点代表的生理意义是',
                    options: ['光合速率为0', '呼吸速率等于光合速率', '光合速率达到最大值', '呼吸速率达到最大值'],
                    correct: 0,
                    explanation: 'A点光照强度为0，植物无法进行光合作用（光合速率为0），此时只进行呼吸作用。注意："呼吸速率等于光合速率"描述的是B点（光补偿点），不是A点'
                },
                {
                    type: 'choice',
                    question: '若将温度适当升高，B点将如何移动',
                    options: ['左移', '右移', '不变', '无法确定'],
                    correct: 0,
                    explanation: '温度升高，呼吸酶活性增强，呼吸速率增加。要使呼吸速率=光合速率，需要更强的光照来产生更多ATP和NADPH，所以B点（左边的光补偿点）左移'
                }
            ]
        },
        {
            id: 2,
            name: 'CO₂浓度对光合作用的影响',
            type: 'photosynthesis',
            image: 'co2-concentration',
            description: '在恒定光照和温度条件下，CO₂浓度对光合速率的影响',
            data: { xLabel: 'CO₂浓度', yLabel: '光合速率', xUnit: 'ppm', yUnit: 'mgCO₂/dm²·h' },
            keyPoints: ['A点：CO₂补偿点', 'AB段：光合速率随CO₂增加而增加', 'B点：CO₂饱和点', 'BC段：光合速率不变'],
            questions: [
                {
                    type: 'choice',
                    question: '关于CO₂饱和点的说法正确的是',
                    options: ['CO₂饱和点后光合速率不再增加', 'CO₂饱和点后光合速率下降', 'CO₂饱和点就是CO₂补偿点', 'CO₂饱和点与温度无关'],
                    correct: 0,
                    explanation: 'CO₂饱和点后，光合速率不再随CO₂浓度增加而增加，说明此时限制因素变成了光照或温度等其他因素'
                },
                {
                    type: 'calculation',
                    question: '若图中A点CO₂浓度为50ppm，B点为1000ppm，则CO₂浓度为500ppm时光合速率约为',
                    options: ['最大速率的25%', '最大速率的50%', '最大速率的75%', '无法计算'],
                    correct: 1,
                    explanation: '在AB段（CO₂补偿点到饱和点之间），光合速率与CO₂浓度基本成正比，500ppm约为1000ppm的一半，所以光合速率约为最大速率的50%'
                }
            ]
        },
        {
            id: 3,
            name: '温度对光合作用的影响',
            type: 'photosynthesis',
            image: 'temperature',
            description: '在其他条件适宜的情况下，温度对光合速率的影响曲线',
            data: { xLabel: '温度', yLabel: '光合速率', xUnit: '°C', yUnit: 'mgCO₂/dm²·h' },
            keyPoints: ['最低温度：光合速率极低', '最适温度：光合速率最大', '最高温度：光合速率急剧下降（酶变性）'],
            questions: [
                {
                    type: 'choice',
                    question: '关于最适温度的说法正确的是',
                    options: ['最适温度是固定不变的', '最适温度随光照强度变化而变化', '最适温度与CO₂浓度无关', '最适温度就是酶活性最强的温度'],
                    correct: 1,
                    explanation: '最适温度不是固定值，它会随光照强度、CO₂浓度等其他条件的变化而变化，因为这些因素都会影响酶的活性'
                }
            ]
        },
        {
            id: 4,
            name: '总光合、净光合与呼吸速率的关系',
            type: 'relationship',
            image: 'total-net',
            description: '表示总光合速率、净光合速率和呼吸速率关系的示意图',
            data: { xLabel: '时间', yLabel: 'O₂浓度', xUnit: 'h', yUnit: 'mg/L' },
            keyPoints: ['真正光合作用：植物实际的光合速率', '净光合作用：积累的有机物=真正光合-呼吸消耗', '关系：真正光合=净光合+呼吸'],
            questions: [
                {
                    type: 'calculation',
                    question: '若测得净光合速率为5mg/h，呼吸速率为2mg/h，则总光合速率为',
                    options: ['3mg/h', '5mg/h', '7mg/h', '10mg/h'],
                    correct: 2,
                    explanation: '根据公式：真正光合速率=净光合速率+呼吸速率=5+2=7mg/h'
                },
                {
                    type: 'choice',
                    question: '若给予适当光照，一段时间后O₂浓度将',
                    options: ['持续上升', '持续下降', '保持不变', '先升后降'],
                    correct: 0,
                    explanation: '只要净光合速率>0，植物光合作用产生的O₂就大于呼吸消耗的O₂，O₂浓度就会持续上升'
                }
            ]
        },
        {
            id: 5,
            name: '夏季一天中植物O₂变化曲线',
            type: 'time-curve',
            image: 'daily-change',
            description: '表示夏季一天中植物O₂浓度的变化曲线',
            data: { xLabel: '时间', yLabel: 'O₂浓度', xUnit: 'h', yUnit: 'mg/L' },
            keyPoints: ['OA段：夜间，只进行呼吸作用，O₂减少', 'A点：黎明时分，光合=呼吸', 'AB段：白天，光合>呼吸，O₂积累', 'B点：黄昏，光合=呼吸', 'BC段：夜间，呼吸消耗O₂'],
            questions: [
                {
                    type: 'choice',
                    question: '图中A点和B点的时间关系是',
                    options: ['A比B早', 'A比B晚', 'A和B相同', '无法确定'],
                    correct: 0,
                    explanation: 'A点是黎明时分（早上），B点是黄昏时分（傍晚），所以A比B早'
                },
                {
                    type: 'calculation',
                    question: '若该植物在24小时内呼吸消耗O₂ 10mg，则一天中积累的O₂为',
                    options: ['10mg', '15mg', '20mg', '需要图才能计算'],
                    correct: 3,
                    explanation: '积累的O₂=白天净光合产生的O₂-夜间呼吸消耗的O₂，需要根据图中AB段的面积和夜间曲线面积来计算'
                }
            ]
        },
        {
            id: 6,
            name: '植物光合速率的年变化',
            type: 'seasonal',
            image: 'seasonal',
            description: '温带植物光合速率的年变化曲线',
            data: { xLabel: '月份', yLabel: '光合速率', xUnit: '月', yUnit: 'g/m²·day' },
            keyPoints: ['春季：光合逐渐增强', '夏季：光合最强', '秋季：光合逐渐减弱', '冬季：光合极低（落叶或休眠）'],
            questions: [
                {
                    type: 'choice',
                    question: '导致夏季光合作用最强的主要因素是',
                    options: ['光照最强', '温度最适宜', 'CO₂浓度最高', '水分最充足'],
                    correct: 1,
                    explanation: '夏季光照强、温度适宜、CO₂浓度相对稳定，多因素共同作用使光合作用最强，但温度是最关键的因素之一'
                }
            ]
        },
        {
            id: 7,
            name: '两半球光照强度比较',
            type: 'comparison',
            image: 'hemisphere',
            description: '比较南、北半球不同季节的光合作用特点',
            data: { xLabel: '月份', yLabel: '相对光合速率', xUnit: '月', yUnit: '%' },
            keyPoints: ['北半球夏季：6-8月', '南半球夏季：12-2月', '赤道附近：全年较高'],
            questions: [
                {
                    type: 'choice',
                    question: '关于南北半球季节差异的说法正确的是',
                    options: ['季节完全相反', '季节完全相同', '季节差异只有一个月', '无法比较'],
                    correct: 0,
                    explanation: '由于黄赤交角，南北半球的季节正好相反，北半球夏季时南半球是冬季'
                }
            ]
        },
        {
            id: 8,
            name: 'C3植物与C4植物的光合效率比较',
            type: 'comparison',
            image: 'c3-c4',
            description: '比较C3植物和C4植物在不同CO₂浓度下的光合速率',
            data: { xLabel: 'CO₂浓度', yLabel: '光合速率', xUnit: 'ppm', yUnit: 'mg/dm²·h' },
            keyPoints: ['C4植物CO₂补偿点更低', 'C4植物光饱和点更高', 'C4植物光合效率更高（尤其在高光照下）'],
            questions: [
                {
                    type: 'choice',
                    question: '关于C4植物特点的说法错误的是',
                    options: ['CO₂补偿点低', '光饱和点高', '光合效率低于C3植物', '在高光照下更具优势'],
                    correct: 2,
                    explanation: 'C4植物的光合效率通常高于C3植物，尤其是在高光照、高温干旱条件下'
                }
            ]
        },
        {
            id: 9,
            name: '呼吸作用强度与温度的关系',
            type: 'respiration',
            image: 'respiration-temp',
            description: '表示温度对呼吸速率影响的曲线',
            data: { xLabel: '温度', yLabel: '呼吸速率', xUnit: '°C', yUnit: 'mgCO₂/h' },
            keyPoints: ['低温：呼吸酶活性低，呼吸弱', '最适温度：呼吸最强', '高温：酶变性，呼吸下降'],
            questions: [
                {
                    type: 'calculation',
                    question: '若将温度从20°C升高到30°C，呼吸速率将',
                    options: ['一直增加', '先增后减', '一直减少', '先减后增'],
                    correct: 1,
                    explanation: '温度升高，酶活性先增强后减弱，呼吸速率先增后减，超过最适温度后酶开始变性'
                }
            ]
        },
        {
            id: 10,
            name: '氧气浓度对呼吸作用的影响',
            type: 'respiration',
            image: 'oxygen-effect',
            description: '表示O₂浓度对有氧呼吸和无氧呼吸影响的曲线',
            data: { xLabel: 'O₂浓度', yLabel: '呼吸速率', xUnit: '%', yUnit: 'mL/h' },
            keyPoints: ['无O₂：只进行无氧呼吸', '低O₂：有无氧呼吸和有氧呼吸', '一定O₂以上：只进行有氧呼吸', '高O₂：呼吸速率稳定'],
            questions: [
                {
                    type: 'choice',
                    question: '关于B点的说法正确的是',
                    options: ['B点以后只进行有氧呼吸', 'B点以后只进行无氧呼吸', 'B点表示无氧呼吸消失', 'B点以后呼吸速率下降'],
                    correct: 0,
                    explanation: 'B点（氧浓度约5-10%）以后，无氧呼吸完全消失，只进行有氧呼吸'
                }
            ]
        },
        {
            id: 11,
            name: '萌发种子呼吸强度比较',
            type: 'respiration',
            image: 'germination',
            description: '比较不同萌发阶段种子的呼吸速率',
            data: { xLabel: '萌发时间', yLabel: 'CO₂释放/O₂吸收', xUnit: '天', yUnit: 'mL/g·h' },
            keyPoints: ['干燥种子：呼吸极弱', '吸胀种子：呼吸增强', '萌发种子：呼吸很强', '胚根伸出：呼吸达到高峰'],
            questions: [
                {
                    type: 'choice',
                    question: '萌发种子呼吸速率很高的原因不包括',
                    options: ['胚细胞代谢旺盛', '线粒体数目增加', '储藏的脂肪大量氧化分解', '光合作用开始'],
                    correct: 3,
                    explanation: '萌发种子尚未形成叶绿体，不能进行光合作用，呼吸旺盛是因为细胞代谢活跃'
                }
            ]
        },
        {
            id: 12,
            name: '光合作用与细胞呼吸的关系',
            type: 'relationship',
            image: 'photosynthesis-respiration',
            description: '光合作用与呼吸作用关系的综合示意图',
            data: { xLabel: '', yLabel: '', xUnit: '', yUnit: '' },
            keyPoints: ['光合：为呼吸提供O₂和有机物', '呼吸：为光合提供CO₂和能量（ATP）', '两者相互依存：光合产物→呼吸底物；呼吸产物→光合原料'],
            questions: [
                {
                    type: 'choice',
                    question: '关于两者关系的说法错误的是',
                    options: ['光合和呼吸是相反的过程', '光合产物是呼吸的底物', '呼吸释放的CO₂是光合的原料', '两者在所有细胞中同时进行'],
                    correct: 3,
                    explanation: '光合作用只能在含叶绿体的细胞中进行，呼吸作用在所有活细胞中进行，但在同一细胞中两者不能同时进行'
                }
            ]
        },
        {
            id: 13,
            name: '阴天与晴天光合速率比较',
            type: 'comparison',
            image: 'sunny-cloudy',
            description: '比较阴天和晴天植物的光合速率日变化',
            data: { xLabel: '时间', yLabel: '净光合速率', xUnit: 'h', yUnit: 'μmol/m²·s' },
            keyPoints: ['晴天：有明显的"午休"现象（气孔关闭）', '阴天：光合速率较低但较稳定', '阴天曲线更平滑'],
            questions: [
                {
                    type: 'choice',
                    question: '关于晴天"午休"现象的说法正确的是',
                    options: ['是因为光照太强', '是因为CO₂不足', '是因为温度过低', '阴天不会出现'],
                    correct: 3,
                    explanation: '"午休"是因为高温强光下，气孔部分关闭，CO₂吸收减少。阴天光照较弱，温度较低，一般不会出现明显的午休现象'
                }
            ]
        },
        {
            id: 14,
            name: '矿物质对光合作用的影响',
            type: 'photosynthesis',
            image: 'minerals',
            description: '缺乏不同矿物质时叶绿素含量和光合速率的变化',
            data: { xLabel: '元素', yLabel: '相对光合速率', xUnit: '', yUnit: '%' },
            keyPoints: ['N：叶绿素合成', 'Mg：叶绿素中心原子', 'P：ATP合成', 'K：气孔开闭'],
            questions: [
                {
                    type: 'choice',
                    question: '缺乏Mg²⁺时，叶绿素合成减少，光合速率下降，原因是',
                    options: ['Mg是叶绿素的组成成分', 'Mg参与ATP合成', 'Mg参与CO₂固定', 'Mg是光反应的催化剂'],
                    correct: 0,
                    explanation: 'Mg²⁺是叶绿素的中心原子，缺乏Mg²⁺会导致叶绿素合成减少，进而影响光合作用'
                }
            ]
        },
        {
            id: 15,
            name: '夏季中午叶肉细胞气体交换',
            type: 'comprehensive',
            image: 'midday-exchange',
            description: '夏季中午叶肉细胞中O₂和CO₂的交换情况示意图',
            data: { xLabel: '', yLabel: '', xUnit: '', yUnit: '' },
            keyPoints: ['光合>O₂释放', '呼吸<CO₂吸收（光合提供）', '蒸腾：水分散失'],
            questions: [
                {
                    type: 'calculation',
                    question: '若某植物真正光合速率为10μmol/m²·s，呼吸速率为2μmol/m²·s，则净光合速率为',
                    options: ['2μmol/m²·s', '8μmol/m²·s', '10μmol/m²·s', '12μmol/m²·s'],
                    correct: 1,
                    explanation: '净光合速率=真正光合速率-呼吸速率=10-2=8μmol/m²·s'
                }
            ]
        }
    ],

    loadCurve(curveId) {
        this.state.currentCurve = this.curves.find(c => c.id === curveId);
        this.state.userAnswer = null;
        this.state.showExplanation = false;
        this.renderTrainer();
    },

    selectAnswer(optIdx) {
        if (this.state.showExplanation) return;
        this.state.userAnswer = optIdx;
        this.renderTrainer();
    },

    submitAnswer() {
        if (this.state.userAnswer === null) {
            alert('请选择一个答案');
            return;
        }
        this.state.showExplanation = true;

        const currentQ = this.state.currentCurve.questions[0];
        if (this.state.userAnswer !== currentQ.correct) {
            const wrongEntry = {
                curveId: this.state.currentCurve.id,
                curveName: this.state.currentCurve.name,
                question: currentQ.question,
                yourAnswer: this.state.userAnswer,
                correctAnswer: currentQ.correct
            };

            const exists = this.state.wrongQuestions.find(w =>
                w.curveId === wrongEntry.curveId && w.question === wrongEntry.question
            );
            if (!exists) {
                this.state.wrongQuestions.push(wrongEntry);
                localStorage.setItem('wrongPhotosynthesis', JSON.stringify(this.state.wrongQuestions));
            }
        }

        this.renderTrainer();
    },

    exportWrongQuestions() {
        if (this.state.wrongQuestions.length === 0) {
            alert('暂无错题记录');
            return;
        }

        let content = '光合/呼吸曲线错题集\n';
        content += '========================\n\n';

        this.state.wrongQuestions.forEach((w, idx) => {
            content += `【${idx + 1}】${w.curveName}\n`;
            content += `题目：${w.question}\n`;
            content += `你的答案：${String.fromCharCode(65 + w.yourAnswer)}\n`;
            content += `正确答案：${String.fromCharCode(65 + w.correctAnswer)}\n\n`;
        });

        content += '========================\n';
        content += `导出时间：${new Date().toLocaleString('zh-CN')}\n`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '光合呼吸曲线错题集.txt';
        a.click();
        URL.revokeObjectURL(url);
    },

    clearWrongQuestions() {
        if (confirm('确定要清空所有错题记录吗？')) {
            this.state.wrongQuestions = [];
            localStorage.removeItem('wrongPhotosynthesis');
            this.renderTrainer();
        }
    },

    renderTrainer() {
        const app = document.getElementById('photosynthesis-trainer-app');
        if (!app) return;

        app.innerHTML = `
            <div class="photosynthesis-trainer">
                <div class="pt-header">
                    <h3>🌿 光合/呼吸曲线解读训练</h3>
                    <div class="pt-controls">
                        <button class="btn btn-secondary" onclick="photosynthesisTrainer.exportWrongQuestions()">
                            📝 导出错题
                        </button>
                        <button class="btn btn-secondary" onclick="photosynthesisTrainer.clearWrongQuestions()">
                            🗑️ 清空错题
                        </button>
                    </div>
                </div>

                <div class="pt-main">
                    <div class="curve-selector">
                        <h4>📊 曲线类型</h4>
                        <div class="curve-categories">
                            <div class="category">
                                <h5>光合作用曲线</h5>
                                ${this.curves.filter(c => c.type === 'photosynthesis').map(c => `
                                    <button class="curve-btn" onclick="photosynthesisTrainer.loadCurve(${c.id})">
                                        ${c.name}
                                    </button>
                                `).join('')}
                            </div>
                            <div class="category">
                                <h5>呼吸作用曲线</h5>
                                ${this.curves.filter(c => c.type === 'respiration').map(c => `
                                    <button class="curve-btn" onclick="photosynthesisTrainer.loadCurve(${c.id})">
                                        ${c.name}
                                    </button>
                                `).join('')}
                            </div>
                            <div class="category">
                                <h5>综合关系曲线</h5>
                                ${this.curves.filter(c => c.type === 'relationship' || c.type === 'comprehensive').map(c => `
                                    <button class="curve-btn" onclick="photosynthesisTrainer.loadCurve(${c.id})">
                                        ${c.name}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        ${this.state.wrongQuestions.length > 0 ? `
                            <div class="wrong-review">
                                <h4>📚 错题复习 (${this.state.wrongQuestions.length})</h4>
                                ${this.state.wrongQuestions.map(w => `
                                    <button class="curve-btn wrong-btn" onclick="photosynthesisTrainer.loadCurve(${w.curveId})">
                                        ${w.curveName}
                                    </button>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>

                    ${this.state.currentCurve ? this.renderCurveQuestion() : `
                        <div class="curve-placeholder">
                            <div class="placeholder-icon">🌿</div>
                            <p>请从左侧选择曲线类型</p>
                            <p>系统将提供选择题和详细解析</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    renderCurveQuestion() {
        const curve = this.state.currentCurve;
        const q = curve.questions[0];

        return `
            <div class="curve-content">
                <div class="curve-info">
                    <h4>${curve.name}</h4>
                    <p class="curve-desc">${curve.description}</p>

                    <div class="curve-visual">
                        <div class="curve-placeholder-svg">
                            <svg width="400" height="300" style="border:1px solid #ccc;background:#fafafa">
                                <text x="200" y="150" text-anchor="middle" fill="#999">曲线示意图</text>
                                <text x="200" y="170" text-anchor="middle" fill="#999">${curve.data.xLabel || ''} vs ${curve.data.yLabel || ''}</text>
                            </svg>
                        </div>
                    </div>

                    <div class="key-points">
                        <h5>📌 关键考点</h5>
                        <ul>
                            ${curve.keyPoints.map(kp => `<li>${kp}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div class="question-section">
                    <div class="question-card">
                        <h5>练习题：${q.question}</h5>
                        <div class="options">
                            ${q.options.map((opt, idx) => `
                                <div class="option ${this.state.showExplanation ?
                                    (idx === q.correct ? 'correct' : (idx === this.state.userAnswer ? 'wrong' : '')) :
                                    (idx === this.state.userAnswer ? 'selected' : '')}"
                                    onclick="photosynthesisTrainer.selectAnswer(${idx})">
                                    <span class="opt-letter">${String.fromCharCode(65 + idx)}</span>
                                    <span class="opt-text">${opt}</span>
                                    ${this.state.showExplanation && idx === q.correct ? '<span class="result-icon correct">✓</span>' : ''}
                                    ${this.state.showExplanation && idx === this.state.userAnswer && idx !== q.correct ? '<span class="result-icon wrong">✗</span>' : ''}
                                </div>
                            `).join('')}
                        </div>

                        ${this.state.showExplanation ? `
                            <div class="explanation">
                                <h6>📖 详细解析</h6>
                                <p>${q.explanation}</p>
                            </div>
                        ` : ''}

                        ${!this.state.showExplanation ? `
                            <button class="btn btn-primary btn-block" onclick="photosynthesisTrainer.submitAnswer()"
                                ${this.state.userAnswer === null ? 'disabled' : ''}>
                                提交答案
                            </button>
                        ` : `
                            <button class="btn btn-secondary btn-block" onclick="photosynthesisTrainer.renderTrainer()">
                                选择其他曲线
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }
};

/**
 * 生物实验设计器 - 探究/验证类实验模板生成（自变量/因变量/对照设置）
 * @module experimentDesigner
 * @example window.experimentDesigner.renderDesigner()
 */
const experimentDesigner = {
    state: {
        currentType: null,
        template: null,
        userInputs: {}
    },

    experimentTypes: [
        {
            id: 'explore-factor',
            name: '探究X对Y的影响',
            description: '探究某种因素对某个生物现象或生理过程的影响',
            icon: '🔬',
            examples: [
                { title: '探究光照强度对光合作用的影响', content: '研究不同光照强度下水草产生气泡数量的变化' },
                { title: '探究温度对酶活性的影响', content: '研究不同温度下唾液淀粉酶分解淀粉所需时间' }
            ],
            template: {
                purpose: '探究【自变量】对【因变量】的影响',
                hypothesis: '如果【自变量发生变化】，那么【因变量】将会【具体变化】',
                variables: {
                    independent: '【自变量】：需要研究或改变的因素',
                    dependent: '【因变量】：随自变量变化而变化的指标',
                    controlled: '【无关变量】：需要控制相同的其他因素'
                },
                steps: [
                    '1. 材料准备：选取【相同/相似的】实验材料',
                    '2. 分组处理：设置【对照组】和【实验组】',
                    '3. 控制变量：在【相同/一致】的条件下培养/处理',
                    '4. 数据记录：观察并记录【因变量】的变化',
                    '5. 重复实验：为保证结果可靠性，需进行【3次以上】重复实验'
                ],
                expectedResult: '预期实验组【因变量】与对照组相比【有明显/无明显】差异',
                conclusion: '如果实验结果与预期一致，则说明【自变量】【确实】对【因变量】有影响'
            },
            commonMistakes: [
                '忽略无关变量的控制',
                '实验组和对照组设置不合理',
                '结论描述过于绝对',
                '缺乏重复实验'
            ]
        },
        {
            id: 'verify-fact',
            name: '验证某生物学事实',
            description: '通过实验验证某个已知的生物学原理或事实',
            icon: '✓',
            examples: [
                { title: '验证植物细胞吸水和失水', content: '通过洋葱鳞片叶外表皮细胞质壁分离实验验证渗透作用原理' },
                { title: '验证酶的专一性', content: '用淀粉酶和蔗糖酶分别处理淀粉溶液，验证酶的专一性' }
            ],
            template: {
                purpose: '验证【生物学原理/事实】',
                hypothesis: '【具体生物学原理的描述】',
                variables: {
                    independent: '【自变量】：给予的特定处理或条件',
                    dependent: '【因变量】：观察到的实验现象或测量结果',
                    controlled: '【无关变量】：保证一致的其他条件'
                },
                steps: [
                    '1. 材料选取：选择【能体现该原理】的实验材料',
                    '2. 条件设置：创造【验证原理】所需的环境/条件',
                    '3. 观察指标：确定能够【证明原理成立】的观察或测量指标',
                    '4. 对比分析：与已知结果或理论预期进行对比'
                ],
                expectedResult: '预期出现【具体实验现象】，从而验证该原理',
                conclusion: '实验结果【出现/未出现】预期现象，说明【生物学原理】成立/不成立'
            },
            commonMistakes: [
                '混淆"探究性"和"验证性"实验的目的',
                '缺乏对照意识',
                '结论表述不当'
            ]
        },
        {
            id: 'observation',
            name: '观察类实验',
            description: '使用显微镜等工具观察生物体的显微结构或组织',
            icon: '🔍',
            examples: [
                { title: '观察植物细胞的有丝分裂', content: '用高倍显微镜观察洋葱根尖分生区细胞有丝分裂各时期' },
                { title: '观察细胞的流动', content: '观察黑藻叶片细胞中叶绿体的流动' }
            ],
            template: {
                purpose: '观察【观察对象】的【显微结构/特征】',
                hypothesis: null,
                variables: {
                    independent: '【自变量】：制片方法或染色方法',
                    dependent: '【因变量】：观察到的结构特征',
                    controlled: '【无关变量】：材料来源、放大倍数等'
                },
                steps: [
                    '1. 材料准备：选取【含有目标结构】的生物材料',
                    '2. 制片处理：根据观察对象进行【切片/撕取/压片】等处理',
                    '3. 染色处理：使用【适当染色剂】进行染色',
                    '4. 显微镜观察：先用【低倍镜】找到目标区域，再转换【高倍镜】仔细观察',
                    '5. 记录绘图：绘制观察到的【典型图像】'
                ],
                expectedResult: '能够观察到【具体结构/现象】',
                conclusion: '成功观察到【目标结构】，证明【观察目的】'
            },
            commonMistakes: [
                '没有先低倍镜后高倍镜',
                '没有正确使用显微镜',
                '切片太厚导致观察不清'
            ]
        },
        {
            id: 'growth-development',
            name: '生长发育类实验',
            description: '研究生物体生长发育过程中的变化规律',
            icon: '🌱',
            examples: [
                { title: '探究种子萌发条件', content: '探究水分、温度、空气对种子萌发的影响' },
                { title: '探究植物向性运动', content: '探究生长素对植物向光性的影响' }
            ],
            template: {
                purpose: '探究【条件/因素】对【生物生长发育】的影响',
                hypothesis: '如果【条件/因素】适宜，那么【生长发育指标】将会【表现更好/正常进行】',
                variables: {
                    independent: '【自变量】：温度/水分/光照等生长条件',
                    dependent: '【因变量】：萌发率/株高/根长等生长指标',
                    controlled: '【无关变量】：种子活力/土壤类型/培养时间等'
                },
                steps: [
                    '1. 材料选择：选取【健康/活力一致】的种子/幼苗',
                    '2. 分组设计：设置不同【自变量】条件的实验组',
                    '3. 培养管理：在【相同/控制】其他条件下培养',
                    '4. 定时观察：每天记录【萌发数/株高/根长】等数据',
                    '5. 数据分析：计算【萌发率/平均株高】等指标'
                ],
                expectedResult: '【对照组】表现为【基准状态】，【实验组】表现为【差异状态】',
                conclusion: '【自变量】【促进/抑制/无影响】生物的【生长发育过程】'
            },
            commonMistakes: [
                '种子活力不一致',
                '观察时间点设置不合理',
                '统计数据不完整'
            ]
        },
        {
            id: 'environmental-effect',
            name: '环境影响类实验',
            description: '研究环境因素对生物生理或行为的影响',
            icon: '🌍',
            examples: [
                { title: '探究pH对酶活性的影响', content: '研究不同pH条件下唾液淀粉酶的活性' },
                { title: '探究污染物对生物的影响', content: '探究不同浓度农药对水蚤心率的影响' }
            ],
            template: {
                purpose: '探究【环境因素】对【生物指标】的影响',
                hypothesis: '随着【环境因素】的改变，【生物指标】将会发生【相应变化】',
                variables: {
                    independent: '【自变量】：环境因素的梯度变化（如pH、温度、污染物浓度）',
                    dependent: '【因变量】：生物的生理指标（酶活性、心率、存活率）',
                    controlled: '【无关变量】：生物来源、环境其他条件'
                },
                steps: [
                    '1. 材料准备：选取【健康/规格一致】的实验生物',
                    '2. 梯度设置：配置【一系列梯度】的环境因素浓度/条件',
                    '3. 预实验：先进行预实验确定【有效梯度范围】',
                    '4. 正式实验：分别在【各梯度条件】下处理实验材料',
                    '5. 指标检测：测定【生物生理指标】的变化'
                ],
                expectedResult: '在【最适条件】时，生物指标达到【最值】',
                conclusion: '环境因素对生物有【显著/无显著】影响，在【某条件下】影响最明显'
            },
            commonMistakes: [
                '梯度设置不合理',
                '没有进行预实验',
                '忽视生物自身的节律性变化'
            ]
        }
    ],

    selectType(typeId) {
        this.state.currentType = this.experimentTypes.find(t => t.id === typeId);
        this.state.template = this.state.currentType?.template;
        this.state.userInputs = {};
        this.renderDesigner();
    },

    updateInput(section, field, value) {
        if (!this.state.userInputs[section]) {
            this.state.userInputs[section] = {};
        }
        this.state.userInputs[section][field] = value;
    },

    exportTemplate() {
        if (!this.state.template) return;

        let content = `实验设计方案\n`;
        content += `========================\n`;
        content += `实验类型：${this.state.currentType?.name}\n\n`;

        const inputs = this.state.userInputs;

        content += `【实验目的】\n`;
        content += `${inputs.purpose?.main || this.state.template.purpose}\n\n`;

        if (inputs.hypothesis) {
            content += `【实验假设】\n`;
            content += `${inputs.hypothesis.main || this.state.template.hypothesis}\n\n`;
        }

        content += `【变量设计】\n`;
        content += `自变量：${inputs.variables?.independent || this.state.template.variables.independent}\n`;
        content += `因变量：${inputs.variables?.dependent || this.state.template.variables.dependent}\n`;
        content += `无关变量：${inputs.variables?.controlled || this.state.template.variables.controlled}\n\n`;

        content += `【实验步骤】\n`;
        const steps = inputs.steps || this.state.template.steps;
        steps.forEach(s => {
            content += `${s}\n`;
        });
        content += '\n';

        content += `【预期结果】\n`;
        content += `${inputs.expectedResult || this.state.template.expectedResult}\n\n`;

        content += `【结论】\n`;
        content += `${inputs.conclusion || this.state.template.conclusion}\n\n`;

        content += `========================\n`;
        content += `常见错误分析：\n`;
        this.state.currentType?.commonMistakes.forEach(m => {
            content += `- ${m}\n`;
        });
        content += `\n导出时间：${new Date().toLocaleString('zh-CN')}\n`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `实验设计-${this.state.currentType?.name}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    },

    renderDesigner() {
        const app = document.getElementById('experiment-designer-app');
        if (!app) return;

        app.innerHTML = `
            <div class="experiment-designer">
                <div class="ed-header">
                    <h3>🧪 实验设计模板生成器</h3>
                    <p class="ed-intro">选择实验类型，获取标准化实验设计模板</p>
                </div>

                ${!this.state.currentType ? `
                    <div class="type-selector">
                        <h4>📚 实验类型</h4>
                        <div class="type-grid">
                            ${this.experimentTypes.map(t => `
                                <div class="type-card" onclick="experimentDesigner.selectType('${t.id}')">
                                    <div class="type-icon">${t.icon}</div>
                                    <h5>${t.name}</h5>
                                    <p>${t.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="template-workspace">
                        <div class="workspace-header">
                            <button class="btn btn-secondary" onclick="experimentDesigner.state.currentType = null; experimentDesigner.renderDesigner();">
                                ← 返回类型选择
                            </button>
                            <h4>${this.state.currentType.name}</h4>
                            <button class="btn btn-primary" onclick="experimentDesigner.exportTemplate()">
                                📄 导出模板
                            </button>
                        </div>

                        <div class="template-form">
                            <div class="form-section">
                                <h5>📌 实验目的</h5>
                                <textarea id="input-purpose" placeholder="${this.state.template.purpose}"
                                    onchange="experimentDesigner.updateInput('purpose', 'main', this.value)"></textarea>
                            </div>

                            ${this.state.template.hypothesis ? `
                                <div class="form-section">
                                    <h5>💡 实验假设</h5>
                                    <textarea id="input-hypothesis" placeholder="${this.state.template.hypothesis}"
                                        onchange="experimentDesigner.updateInput('hypothesis', 'main', this.value)"></textarea>
                                </div>
                            ` : ''}

                            <div class="form-section">
                                <h5>⚙️ 变量设计</h5>
                                <div class="variable-inputs">
                                    <div class="var-group">
                                        <label>自变量</label>
                                        <textarea id="input-iv" placeholder="${this.state.template.variables.independent}"
                                            onchange="experimentDesigner.updateInput('variables', 'independent', this.value)"></textarea>
                                    </div>
                                    <div class="var-group">
                                        <label>因变量</label>
                                        <textarea id="input-dv" placeholder="${this.state.template.variables.dependent}"
                                            onchange="experimentDesigner.updateInput('variables', 'dependent', this.value)"></textarea>
                                    </div>
                                    <div class="var-group">
                                        <label>无关变量（控制）</label>
                                        <textarea id="input-cv" placeholder="${this.state.template.variables.controlled}"
                                            onchange="experimentDesigner.updateInput('variables', 'controlled', this.value)"></textarea>
                                    </div>
                                </div>
                            </div>

                            <div class="form-section">
                                <h5>📝 实验步骤</h5>
                                <div class="steps-list">
                                    ${this.state.template.steps.map((step, idx) => `
                                        <div class="step-item">
                                            <span class="step-num">${idx + 1}</span>
                                            <span class="step-text">${step}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="form-section">
                                <h5>🎯 预期结果</h5>
                                <textarea id="input-result" placeholder="${this.state.template.expectedResult}"
                                    onchange="experimentDesigner.updateInput('expectedResult', 'main', this.value)"></textarea>
                            </div>

                            <div class="form-section">
                                <h5>📊 结论</h5>
                                <textarea id="input-conclusion" placeholder="${this.state.template.conclusion}"
                                    onchange="experimentDesigner.updateInput('conclusion', 'main', this.value)"></textarea>
                            </div>

                            <div class="form-section">
                                <h5>⚠️ 常见错误分析</h5>
                                <ul class="mistakes-list">
                                    ${this.state.currentType.commonMistakes.map(m => `<li>${m}</li>`).join('')}
                                </ul>
                            </div>

                            <div class="form-section">
                                <h5>📚 典型案例</h5>
                                <div class="examples-list">
                                    ${this.state.currentType.examples.map(ex => `
                                        <div class="example-item">
                                            <div class="example-title">${ex.title}</div>
                                            <div class="example-content">${ex.content}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `}
            </div>
        `;
    }
};
/**
 * 遗传显示更新器 - 刷新遗传模拟器渲染并重新绑定事件监听
 * @module updateGeneticsDisplay
 * @example window.updateGeneticsDisplay()
 */
function updateGeneticsDisplay() {
    const app = document.getElementById('biology-genetics-app');
    if (app) {
        const newContent = biologyGeneticsSimulator.renderSimulation();
        app.innerHTML = newContent;
        attachGeneticsListeners();
    }
}

// ---- window 暴露 ----
window.biologyGeneticsSimulator = biologyGeneticsSimulator;
window.loadBiologyTool = loadBiologyTool;
window.renderBiologyGenetics = renderBiologyGenetics;
window.attachGeneticsListeners = attachGeneticsListeners;
window.biologyMindMap = biologyMindMap;
window.geneticsPedigreeTrainer = geneticsPedigreeTrainer;
window.photosynthesisTrainer = photosynthesisTrainer;
window.experimentDesigner = experimentDesigner;
window.updateGeneticsDisplay = updateGeneticsDisplay;

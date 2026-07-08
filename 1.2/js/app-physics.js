// ============================================================
// app-physics.js — 物理模块（从 app.js 拆分）
// 包含: 公式计算器/抛体模拟/生态系统模拟
// 依赖: app.js (currentTool 全局变量)
// ============================================================

/**
 * 物理工具加载器 - 按 tool 名分发到对应渲染器（公式计算器/抛体模拟）
 * @module loadPhysicsTool
 * @example window.loadPhysicsTool('calculator')
 */
function loadPhysicsTool(tool) {
    if (tool === 'calculator') {
        navigateTo('physics-calculator');
        physicsFormulaCalculator.renderCalculator();
    } else if (tool === 'projectile') {
        navigateTo('projectile-sim');
        projectileSimulator.renderSimulator();
    }
}

/**
 * 物理公式计算器 - 内置力学/电磁/热学等公式库，支持任意未知量求解
 * @module physicsFormulaCalculator
 * @example window.physicsFormulaCalculator.renderCalculator()
 */
const physicsFormulaCalculator = {
    formulaDatabase: {
        mechanics: {
            name: '力学',
            formulas: [
                { name: '加速度', formula: 'a = (v - v₀) / t', variables: ['v', 'v0', 't', 'a'],
                  solvers: { a: (v)=>(v.v-v.v0)/v.t, v: (v)=>v.a*v.t+v.v0, v0: (v)=>v.v-v.a*v.t, t: (v)=>(v.v-v.v0)/v.a } },
                { name: '位移', formula: 's = v₀t + ½at²', variables: ['v0', 't', 'a', 's'],
                  solvers: { s: (v)=>v.v0*v.t+0.5*v.a*v.t*v.t, a: (v)=>2*(v.s-v.v0*v.t)/(v.t*v.t), v0: (v)=>(v.s-0.5*v.a*v.t*v.t)/v.t } },
                { name: '速度-位移', formula: 'v² - v₀² = 2as', variables: ['v', 'v0', 'a', 's'],
                  solvers: { v: (v)=>Math.sqrt(v.v0*v.v0+2*v.a*v.s), v0: (v)=>Math.sqrt(v.v*v.v-2*v.a*v.s), a: (v)=>(v.v*v.v-v.v0*v.v0)/(2*v.s), s: (v)=>(v.v*v.v-v.v0*v.v0)/(2*v.a) } },
                { name: '牛顿第二定律', formula: 'F = ma', variables: ['F', 'm', 'a'],
                  solvers: { F: (v)=>v.m*v.a, m: (v)=>v.F/v.a, a: (v)=>v.F/v.m } },
                { name: '动能', formula: 'Ek = ½mv²', variables: ['m', 'v', 'Ek'],
                  solvers: { Ek: (v)=>0.5*v.m*v.v*v.v, m: (v)=>2*v.Ek/(v.v*v.v), v: (v)=>Math.sqrt(2*v.Ek/v.m) } },
                { name: '势能', formula: 'Ep = mgh', variables: ['m', 'g', 'h', 'Ep'],
                  solvers: { Ep: (v)=>v.m*v.g*v.h, m: (v)=>v.Ep/(v.g*v.h), g: (v)=>v.Ep/(v.m*v.h), h: (v)=>v.Ep/(v.m*v.g) } },
                { name: '动量', formula: 'p = mv', variables: ['m', 'v', 'p'],
                  solvers: { p: (v)=>v.m*v.v, m: (v)=>v.p/v.v, v: (v)=>v.p/v.m } },
                { name: '功', formula: 'W = Fd·cosθ', variables: ['F', 'd', 'theta', 'W'],
                  solvers: { W: (v)=>v.F*v.d*Math.cos(v.theta*Math.PI/180), F: (v)=>v.W/(v.d*Math.cos(v.theta*Math.PI/180)), d: (v)=>v.W/(v.F*Math.cos(v.theta*Math.PI/180)) } },
                { name: '功率', formula: 'P = W/t', variables: ['W', 't', 'P'],
                  solvers: { P: (v)=>v.W/v.t, W: (v)=>v.P*v.t, t: (v)=>v.W/v.P } }
            ]
        },
        projectile: {
            name: '抛体运动',
            formulas: [
                { name: '水平射程', formula: 'R = v₀²sin(2θ)/g', variables: ['v0', 'theta', 'g', 'R'],
                  solvers: { R: (v)=>v.v0*v.v0*Math.sin(2*v.theta*Math.PI/180)/v.g, v0: (v)=>Math.sqrt(v.R*v.g/Math.sin(2*v.theta*Math.PI/180)) } },
                { name: '最大高度', formula: 'H = v₀²sin²θ/(2g)', variables: ['v0', 'theta', 'g', 'H'],
                  solvers: { H: (v)=>v.v0*v.v0*Math.pow(Math.sin(v.theta*Math.PI/180),2)/(2*v.g), v0: (v)=>Math.sqrt(2*v.H*v.g)/Math.sin(v.theta*Math.PI/180) } },
                { name: '飞行时间', formula: 'T = 2v₀sinθ/g', variables: ['v0', 'theta', 'g', 'T'],
                  solvers: { T: (v)=>2*v.v0*Math.sin(v.theta*Math.PI/180)/v.g, v0: (v)=>v.T*v.g/(2*Math.sin(v.theta*Math.PI/180)) } }
            ]
        },
        electricity: {
            name: '电学',
            formulas: [
                { name: '欧姆定律', formula: 'I = U/R', variables: ['U', 'R', 'I'],
                  solvers: { I: (v)=>v.U/v.R, U: (v)=>v.I*v.R, R: (v)=>v.U/v.I } },
                { name: '电功率', formula: 'P = UI', variables: ['U', 'I', 'P'],
                  solvers: { P: (v)=>v.U*v.I, U: (v)=>v.P/v.I, I: (v)=>v.P/v.U } },
                { name: '电阻定律', formula: 'R = ρl/S', variables: ['rho', 'len', 'S', 'R'],
                  solvers: { R: (v)=>v.rho*v.len/v.S, rho: (v)=>v.R*v.S/v.len, len: (v)=>v.R*v.S/v.rho, S: (v)=>v.rho*v.len/v.R } },
                { name: '焦耳定律', formula: 'Q = I²Rt', variables: ['I', 'R', 't', 'Q'],
                  solvers: { Q: (v)=>v.I*v.I*v.R*v.t, I: (v)=>Math.sqrt(v.Q/(v.R*v.t)), R: (v)=>v.Q/(v.I*v.I*v.t), t: (v)=>v.Q/(v.I*v.I*v.R) } }
            ]
        },
        thermodynamics: {
            name: '热学',
            formulas: [
                { name: '理想气体状态方程', formula: 'PV = nRT', variables: ['P', 'V', 'n', 'T'],
                  solvers: { P: (v)=>v.n*8.314*v.T/v.V, V: (v)=>v.n*8.314*v.T/v.P, n: (v)=>v.P*v.V/(8.314*v.T), T: (v)=>v.P*v.V/(8.314*v.n) } },
                { name: '内能变化', formula: 'ΔU = Q + W', variables: ['Q', 'W', 'deltaU'],
                  solvers: { deltaU: (v)=>v.Q+v.W, Q: (v)=>v.deltaU-v.W, W: (v)=>v.deltaU-v.Q } },
                { name: '热容', formula: 'Q = mcΔT', variables: ['m', 'c_heat', 'deltaT', 'Q'],
                  solvers: { Q: (v)=>v.m*v.c_heat*v.deltaT, m: (v)=>v.Q/(v.c_heat*v.deltaT), c_heat: (v)=>v.Q/(v.m*v.deltaT), deltaT: (v)=>v.Q/(v.m*v.c_heat) } }
            ]
        },
        waves: {
            name: '波动',
            formulas: [
                { name: '波速', formula: 'v = λf', variables: ['lambda', 'f', 'v'],
                  solvers: { v: (v)=>v.lambda*v.f, lambda: (v)=>v.v/v.f, f: (v)=>v.v/v.lambda } },
                { name: '周期频率', formula: 'T = 1/f', variables: ['f', 'T'],
                  solvers: { T: (v)=>1/v.f, f: (v)=>1/v.T } },
                { name: '单摆周期', formula: 'T = 2π√(l/g)', variables: ['l_pend', 'g', 'T'],
                  solvers: { T: (v)=>2*Math.PI*Math.sqrt(v.l_pend/v.g), l_pend: (v)=>v.g*Math.pow(v.T/(2*Math.PI),2), g: (v)=>v.l_pend*Math.pow(2*Math.PI/v.T,2) } },
                { name: '弹簧振子周期', formula: 'T = 2π√(m/k)', variables: ['m', 'k', 'T'],
                  solvers: { T: (v)=>2*Math.PI*Math.sqrt(v.m/v.k), m: (v)=>v.k*Math.pow(v.T/(2*Math.PI),2), k: (v)=>v.m*Math.pow(2*Math.PI/v.T,2) } }
            ]
        },
        atomic: {
            name: '原子物理',
            formulas: [
                { name: '光子能量', formula: 'E = hc/λ', variables: ['lambda', 'E'],
                  solvers: { E: (v)=>6.63e-34*3e8/v.lambda, lambda: (v)=>6.63e-34*3e8/v.E } },
                { name: '光电方程', formula: 'Ek = hν - W', variables: ['nu', 'W', 'Ek'],
                  solvers: { Ek: (v)=>6.63e-34*v.nu-v.W, nu: (v)=>(v.Ek+v.W)/6.63e-34, W: (v)=>6.63e-34*v.nu-v.Ek } },
                { name: '质能方程', formula: 'E = mc²', variables: ['m', 'E'],
                  solvers: { E: (v)=>v.m*9e16, m: (v)=>v.E/9e16 } },
                { name: '巴尔末公式', formula: '1/λ = R(1/m² - 1/n²)', variables: ['m', 'n', 'lambda'],
                  solvers: { lambda: (v)=>1/(1.097e7*(1/(v.m*v.m)-1/(v.n*v.n))) } }
            ]
        }
    },

    varLabels: {
        'v':'v 速度(m/s)','v0':'v₀ 初速度(m/s)','a':'a 加速度(m/s²)','t':'t 时间(s)','s':'s 位移(m)',
        'F':'F 力(N)','m':'m 质量(kg)','Ek':'Ek 动能(J)','Ep':'Ep 势能(J)','p':'p 动量(kg·m/s)',
        'W':'W 功(J)','P':'P 功率(W)','R':'R 射程(m)','theta':'θ 角度(°)','g':'g 重力加速度(m/s²)',
        'U':'U 电压(V)','I':'I 电流(A)','rho':'ρ 电阻率(Ω·m)','len':'l 长度(m)','S':'S 截面积(m²)',
        'Q':'Q 热量(J)','n':'n 物质的量(mol)','T':'T 周期(s)或温度(K)','deltaU':'ΔU 内能变化(J)',
        'c_heat':'c 比热容(J/kg·K)','deltaT':'ΔT 温度变化(K)','lambda':'λ 波长(m)','f':'f 频率(Hz)',
        'l_pend':'l 摆长(m)','h':'h 普朗克常量','c':'c 光速','nu':'ν 频率(Hz)',
        'H':'H 最大高度(m)','k':'k 劲度系数(N/m)'
    },

    varUnits: {
        'v':'m/s','v0':'m/s','a':'m/s²','t':'s','s':'m',
        'F':'N','m':'kg','Ek':'J','Ep':'J','p':'kg·m/s',
        'W':'J','P':'W','R':'m','theta':'°','g':'m/s²',
        'U':'V','I':'A','rho':'Ω·m','len':'m','S':'m²',
        'Q':'J','n':'mol','T':'s','deltaU':'J',
        'c_heat':'J/(kg·K)','deltaT':'K','lambda':'m','f':'Hz',
        'l_pend':'m','H':'m','k':'N/m','nu':'Hz'
    },

    state: {
        history: [],
        currentFormula: null,
        isListening: false,
        recognition: null
    },

    init() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.state.recognition = new SpeechRecognition();
            this.state.recognition.continuous = false;
            this.state.recognition.interimResults = false;
            this.state.recognition.lang = 'zh-CN';

            this.state.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('formula-input').value = transcript;
                this.parseAndCalculate(transcript);
            };

            this.state.recognition.onend = () => {
                this.state.isListening = false;
                const btn = document.getElementById('voice-btn');
                if (btn) btn.classList.remove('listening');
            };
        }
    },

    toggleVoice() {
        if (!this.state.recognition) {
            alert('您的浏览器不支持语音识别功能，请使用Chrome浏览器');
            return;
        }

        if (this.state.isListening) {
            this.state.recognition.stop();
        } else {
            this.state.isListening = true;
            const btn = document.getElementById('voice-btn');
            if (btn) btn.classList.add('listening');
            this.state.recognition.start();
        }
    },

    parseAndCalculate(input) {
        input = input.toLowerCase().replace(/\s+/g, '');

        const patterns = [
            { regex: /(.+)加速度(.+)初速度(.+)末速度(.+)时间(.+)/, vars: ['v0', 'v', 't'] },
            { regex: /(.+)速度(.+)加速度(.+)时间(.+)位移/, vars: ['v0', 'a', 't', 's'] },
            { regex: /(.+)力(.+)质量(.+)加速度/, vars: ['F', 'm', 'a'] },
            { regex: /(.+)动能(.+)质量(.+)速度/, vars: ['Ek', 'm', 'v'] },
            { regex: /(.+)势能(.+)质量(.+)高度/, vars: ['Ep', 'm', 'h'] },
            { regex: /(.+)电流(.+)电压(.+)电阻/, vars: ['I', 'U', 'R'] },
            { regex: /(.+)功率(.+)电压(.+)电流/, vars: ['P', 'U', 'I'] },
            { regex: /(.+)射程(.+)初速度(.+)角度/, vars: ['v0', 'theta', 'R'] },
            { regex: /(.+)高度(.+)初速度(.+)角度/, vars: ['v0', 'theta', 'H'] },
            { regex: /(.+)时间(.+)初速度(.+)角度/, vars: ['v0', 'theta', 'T'] },
            { regex: /(.+)周期(.+)长度/, vars: ['l', 'T', 'g'] },
            { regex: /(.+)能量(.+)质量/, vars: ['E', 'm', 'c'] }
        ];

        for (const pattern of patterns) {
            const match = input.match(pattern.regex);
            if (match) {
                this.findAndApplyFormula(pattern.vars);
                return;
            }
        }

        const formulaKeys = ['加速度', '位移', '力', '动能', '势能', '动量', '电流', '电压', '功率', '射程', '高度', '时间', '周期', '能量'];
        for (const key of formulaKeys) {
            if (input.includes(key)) {
                const category = this.findCategoryByKeyword(key);
                if (category) {
                    this.selectCategory(category);
                    return;
                }
            }
        }
    },

    findCategoryByKeyword(keyword) {
        if (['加速度', '位移', '力', '动能', '势能', '动量', '功', '功率'].some(k => keyword.includes(k))) return 'mechanics';
        if ( ['射程', '高度', '时间', '抛体'].some(k => keyword.includes(k))) return 'projectile';
        if (['电流', '电压', '电阻', '功率'].some(k => keyword.includes(k))) return 'electricity';
        if (['内能', '热', '温度', '热容'].some(k => keyword.includes(k))) return 'thermodynamics';
        if (['波', '周期', '频率', '波长'].some(k => keyword.includes(k))) return 'waves';
        if (['光子', '能量', '质量', '原子'].some(k => keyword.includes(k))) return 'atomic';
        return null;
    },

    findAndApplyFormula(targetVars) {
        for (const category in this.formulaDatabase) {
            for (const f of this.formulaDatabase[category].formulas) {
                if (targetVars.every(v => f.variables.includes(v))) {
                    this.state.currentFormula = f;
                    this.showFormulaInput(f);
                    return;
                }
            }
        }
    },

    selectCategory(category) {
        const cat = this.formulaDatabase[category];
        if (!cat) return;

        let html = `<div class="formula-list"><h4>${cat.name}</h4>`;
        cat.formulas.forEach((f, idx) => {
            html += `
                <div class="formula-item" onclick="physicsFormulaCalculator.selectFormula('${category}', ${idx})">
                    <div class="formula-name">${f.name}</div>
                    <div class="formula-expr">${f.formula}</div>
                </div>
            `;
        });
        html += '</div>';

        const listEl = document.getElementById('formula-list');
        if (listEl) listEl.innerHTML = html;
    },

    selectFormula(category, idx) {
        const formula = this.formulaDatabase[category].formulas[idx];
        this.state.currentFormula = formula;
        this.showFormulaInput(formula);
    },

    showFormulaInput(formula) {
        const inputEl = document.getElementById('formula-input');
        if (inputEl) inputEl.value = formula.formula;

        const varsEl = document.getElementById('formula-vars');
        if (!varsEl || !formula) return;

        let html = `<div class="vars-input-grid"><h4>输入已知量（留空一个变量自动求解）</h4>`;
        formula.variables.forEach(v => {
            const label = this.varLabels[v] || v;
            html += `
                <div class="var-input-group">
                    <label for="var-${v}">${label}</label>
                    <input type="number" id="var-${v}" placeholder="留空=待求" step="any">
                </div>
            `;
        });
        html += `<button class="btn btn-primary" onclick="physicsFormulaCalculator.calculate()">🔍 计算</button>`;
        html += '</div>';

        varsEl.innerHTML = html;
    },

    calculate() {
        if (!this.state.currentFormula) return;

        const formula = this.state.currentFormula;
        const vars = {};
        const missing = [];

        formula.variables.forEach(v => {
            const input = document.getElementById(`var-${v}`);
            if (input) {
                const val = parseFloat(input.value);
                if (isNaN(val) || input.value.trim() === '') {
                    missing.push(v);
                } else {
                    vars[v] = val;
                }
            }
        });

        if (missing.length === 0) {
            const result = {};
            for (const [key, solver] of Object.entries(formula.solvers)) {
                try { result[key] = solver(vars); } catch(e) {}
                break;
            }
            this.displayResult(formula, vars, result);
            this.addToHistory(formula, vars, result);
            return;
        }

        if (missing.length > 1) {
            alert('请至少填写除一个变量外的所有参数（当前缺少：' + missing.join(', ') + '）');
            return;
        }

        const solveFor = missing[0];
        if (!formula.solvers || !formula.solvers[solveFor]) {
            alert('该公式暂不支持求解 ' + solveFor + '，请尝试填写该值');
            return;
        }

        try {
            const resultVal = formula.solvers[solveFor](vars);
            if (typeof resultVal !== 'number' || !isFinite(resultVal)) {
                alert('计算结果无效，请检查输入值是否合理');
                return;
            }
            const result = {};
            result[solveFor] = resultVal;
            this.displayResult(formula, vars, result);
            this.addToHistory(formula, vars, result);
        } catch (e) {
            alert('计算错误：' + e.message);
        }
    },

    displayResult(formula, inputVars, result) {
        const resultEl = document.getElementById('formula-result');
        if (!resultEl) return;

        let html = '<div class="result-card"><h4>📊 计算结果</h4>';
        html += `<div class="formula-display">${formula.formula}</div>`;
        html += '<div class="result-values">';

        for (const [key, value] of Object.entries(result)) {
            const label = this.varLabels[key] || key;
            const unit = this.varUnits[key] || '';
            html += `<div class="result-item">
                <span class="result-label">${label} = </span>
                <span class="result-value">${typeof value === 'number' ? value.toPrecision(6) : value} ${unit}</span>
            </div>`;
        }

        html += '<div style="margin-top:10px;font-size:0.85rem;color:#666;">已知量：';
        for (const [k, v] of Object.entries(inputVars)) {
            const lb = this.varLabels[k] || k;
            const un = this.varUnits[k] || '';
            html += lb + '=' + v + un + '；';
        }
        html += '</div></div></div>';
        resultEl.innerHTML = html;
    },

    getUnit(varName) {
        return this.varUnits[varName] || '';
    },

    addToHistory(formula, inputVars, result) {
        const entry = {
            formula: formula.name,
            formulaText: formula.formula,
            inputs: { ...inputVars },
            results: { ...result },
            timestamp: new Date().toLocaleString('zh-CN')
        };

        this.state.history.unshift(entry);
        if (this.state.history.length > 10) {
            this.state.history.pop();
        }

        this.renderHistory();
    },

    renderHistory() {
        const histEl = document.getElementById('formula-history');
        if (!histEl) return;

        if (this.state.history.length === 0) {
            histEl.innerHTML = '<p class="no-history">暂无计算历史</p>';
            return;
        }

        let html = '<div class="history-list">';
        this.state.history.forEach((entry, idx) => {
            const resultKey = Object.keys(entry.results)[0];
            const resultVal = Object.values(entry.results)[0];
            html += `
                <div class="history-item" onclick="physicsFormulaCalculator.loadFromHistory(${idx})">
                    <div class="history-formula">${entry.formula}</div>
                    <div class="history-result">${resultKey} = ${typeof resultVal === 'number' ? resultVal.toPrecision(3) : resultVal}</div>
                    <div class="history-time">${entry.timestamp}</div>
                </div>
            `;
        });
        html += '</div>';
        histEl.innerHTML = html;
    },

    loadFromHistory(idx) {
        const entry = this.state.history[idx];
        if (!entry) return;

        const category = this.findCategoryForFormula(entry.formula);
        if (category) {
            const cat = this.formulaDatabase[category];
            const formulaObj = cat.formulas.find(f => f.name === entry.formula);
            if (formulaObj) {
                this.state.currentFormula = formulaObj;
                this.showFormulaInput(formulaObj);

                for (const [key, value] of Object.entries(entry.inputs)) {
                    const input = document.getElementById(`var-${key}`);
                    if (input) input.value = value;
                }

                this.displayResult(formulaObj, entry.inputs, entry.results);
            }
        }
    },

    findCategoryForFormula(formulaName) {
        for (const [cat, data] of Object.entries(this.formulaDatabase)) {
            if (data.formulas.some(f => f.name === formulaName)) {
                return cat;
            }
        }
        return null;
    },

    renderCalculator() {
        const app = document.getElementById('physics-calculator-app');
        if (!app) return;

        app.innerHTML = `
            <div class="physics-calculator">
                <div class="calc-section">
                    <h3>🧮 物理公式计算器</h3>
                    <div class="voice-input-wrapper">
                        <input type="text" id="formula-input" class="formula-input-field"
                            placeholder="输入公式名称或物理量，如：加速度、初速度、末速度、时间..."
                            onkeypress="if(event.key==='Enter')physicsFormulaCalculator.parseAndCalculate(this.value)">
                        <button id="voice-btn" class="voice-btn" onclick="physicsFormulaCalculator.toggleVoice()" title="语音输入">
                            🎤
                        </button>
                    </div>
                    <button class="btn btn-primary" onclick="physicsFormulaCalculator.parseAndCalculate(document.getElementById('formula-input').value)">
                        🔍 解析
                    </button>
                </div>

                <div id="formula-list" class="formula-list-container">
                    <h4>📚 公式分类</h4>
                    <div class="category-tabs">
                        <button class="cat-tab active" onclick="physicsFormulaCalculator.selectCategory('mechanics')">力学</button>
                        <button class="cat-tab" onclick="physicsFormulaCalculator.selectCategory('projectile')">抛体运动</button>
                        <button class="cat-tab" onclick="physicsFormulaCalculator.selectCategory('electricity')">电学</button>
                        <button class="cat-tab" onclick="physicsFormulaCalculator.selectCategory('thermodynamics')">热学</button>
                        <button class="cat-tab" onclick="physicsFormulaCalculator.selectCategory('waves')">波动</button>
                        <button class="cat-tab" onclick="physicsFormulaCalculator.selectCategory('atomic')">原子物理</button>
                    </div>
                </div>

                <div id="formula-vars" class="vars-container"></div>
                <div id="formula-result" class="result-container"></div>

                <div class="calc-section">
                    <h4>📜 计算历史</h4>
                    <div id="formula-history" class="history-container">
                        <p class="no-history">暂无计算历史</p>
                    </div>
                </div>

                <div class="info-box">
                    <h4>💡 使用说明</h4>
                    <ul>
                        <li>语音输入：点击🎤按钮，用语音描述物理量关系</li>
                        <li>快速选择：从分类标签中选择公式类型</li>
                        <li>手动输入：在输入框中输入物理量名称</li>
                        <li>自动计算：填写参数后点击计算按钮</li>
                    </ul>
                </div>
            </div>
        `;

        this.selectCategory('mechanics');
        this.renderHistory();
    }
};

/**
 * 抛体运动模拟器 - 支持初速度/角度/空气阻力调节与轨迹动画
 * @module projectileSimulator
 * @example window.projectileSimulator.renderSimulator()
 */
const projectileSimulator = {
    state: {
        v0: 20,
        theta: 45,
        g: 9.8,
        dragCoeff: 0,
        mass: 1,
        isRunning: false,
        isPaused: false,
        animationId: null,
        currentT: 0,
        trajectoryData: [],
        trajectories: [],
        height: 400,
        width: 800,
        showHelp: false,
        showCharts: false,
        speed: 1
    },

    calculateTrajectory(v0, thetaDeg, g = 9.8, dragCoeff = 0, mass = 1, dt = 0.01) {
        const thetaRad = thetaDeg * Math.PI / 180;
        let vx = v0 * Math.cos(thetaRad);
        let vy = v0 * Math.sin(thetaRad);
        let x = 0, y = 0, t = 0;
        const dataPoints = [];

        while (y >= 0 || t === 0) {
            const v = Math.sqrt(vx * vx + vy * vy);
            dataPoints.push({ x, y, t, vx, vy, v });

            if (dragCoeff > 0) {
                const dragForce = 0.5 * dragCoeff * 1.225 * 0.01 * v * v;
                const ax = -dragForce * vx / (v * mass);
                const ay = -g - dragForce * vy / (v * mass);
                vx += ax * dt;
                vy += ay * dt;
            } else {
                vy -= g * dt;
            }

            x += vx * dt;
            y += vy * dt;
            t += dt;

            if (t > 100) break;
        }

        const lastGround = dataPoints.find((p, i) => i > 0 && p.y < 0);
        let tFlight = t;
        let range = x;
        let maxHeight = Math.max(...dataPoints.map(p => p.y));

        if (dragCoeff === 0) {
            tFlight = 2 * v0 * Math.sin(thetaRad) / g;
            range = v0 * v0 * Math.sin(2 * thetaRad) / g;
            maxHeight = (v0 * v0 * Math.sin(thetaRad) * Math.sin(thetaRad)) / (2 * g);
        }

        return { dataPoints, tFlight, maxHeight, range };
    },

    renderSimulator() {
        const app = document.getElementById('projectile-sim-app');
        if (!app) return;

        const { v0, theta, g, dragCoeff, mass, isRunning, isPaused, showHelp, showCharts, speed } = this.state;

        app.innerHTML = `
        <div class="projectile-sim">
            <div class="ps-header">
                <h3>🎯 抛物线运动模拟器</h3>
                <p class="ps-intro">模拟物体在重力作用下的抛物线运动，支持空气阻力计算</p>
                <button class="help-btn" onclick="projectileSimulator.toggleHelp()">${showHelp ? '📖 隐藏说明' : '📖 使用说明'}</button>
            </div>

            ${showHelp ? `
            <div class="help-panel">
                <h4>📋 使用说明</h4>
                <div class="help-content">
                    <div class="help-section">
                        <h5>🎯 参数说明</h5>
                        <ul>
                            <li><strong>初始速度 v₀</strong>：物体抛出时的速度大小(5-50 m/s)</li>
                            <li><strong>发射角度 θ</strong>：抛出方向与水平面的夹角(0-90°)</li>
                            <li><strong>重力加速度 g</strong>：不同星球的重力加速度不同</li>
                            <li><strong>空气阻力系数</strong>：0表示无阻力，值越大阻力越大</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h5>📐 运动公式</h5>
                        <ul>
                            <li><strong>水平位移：</strong>x = v₀cosθ · t</li>
                            <li><strong>竖直位移：</strong>y = v₀sinθ · t - ½gt²</li>
                            <li><strong>水平速度：</strong>vₓ = v₀cosθ（恒定）</li>
                            <li><strong>竖直速度：</strong>vᵧ = v₀sinθ - gt</li>
                            <li><strong>射程：</strong>R = v₀²sin2θ/g</li>
                            <li><strong>最大高度：</strong>H = v₀²sin²θ/2g</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h5>🔬 空气阻力</h5>
                        <p>当空气阻力系数大于0时，物体受到与速度方向相反的阻力作用。阻力公式：F = ½ρCdAv²，其中ρ为空气密度，Cd为阻力系数，A为迎风面积。</p>
                    </div>
                </div>
            </div>
            ` : ''}

            <div class="ps-main">
                <div class="ps-controls">
                    <h4>⚙️ 运动参数</h4>

                    <div class="param-group">
                        <label>初始速度 v₀</label>
                        <input type="range" id="v0-slider" min="5" max="50" value="${v0}" oninput="projectileSimulator.updateParam('v0', this.value)" ${isRunning && !isPaused ? 'disabled' : ''}>
                        <span class="param-value">${v0} m/s</span>
                    </div>

                    <div class="param-group">
                        <label>发射角度 θ</label>
                        <input type="range" id="theta-slider" min="5" max="85" value="${theta}" oninput="projectileSimulator.updateParam('theta', this.value)" ${isRunning && !isPaused ? 'disabled' : ''}>
                        <span class="param-value">${theta}°</span>
                    </div>

                    <div class="param-group">
                        <label>重力加速度 g</label>
                        <select id="g-select" onchange="projectileSimulator.updateParam('g', parseFloat(this.value))" ${isRunning && !isPaused ? 'disabled' : ''}>
                            <option value="9.8" ${g === 9.8 ? 'selected' : ''}>地球 g = 9.8 m/s²</option>
                            <option value="1.62" ${g === 1.62 ? 'selected' : ''}>月球 g = 1.62 m/s²</option>
                            <option value="3.71" ${g === 3.71 ? 'selected' : ''}>火星 g = 3.71 m/s²</option>
                            <option value="24.79" ${g === 24.79 ? 'selected' : ''}>木星 g = 24.79 m/s²</option>
                        </select>
                    </div>

                    <div class="param-group">
                        <label>空气阻力系数</label>
                        <input type="range" id="drag-slider" min="0" max="2" step="0.1" value="${dragCoeff}" oninput="projectileSimulator.updateParam('dragCoeff', parseFloat(this.value))" ${isRunning && !isPaused ? 'disabled' : ''}>
                        <span class="param-value">${dragCoeff.toFixed(1)}</span>
                    </div>

                    <div class="param-group">
                        <label>模拟速度</label>
                        <input type="range" id="speed-slider" min="0.5" max="3" step="0.5" value="${speed}" oninput="projectileSimulator.updateParam('speed', parseFloat(this.value))">
                        <span class="param-value">${speed}x</span>
                    </div>

                    <div class="control-buttons">
                        ${!isRunning ? `
                            <button class="btn btn-primary" onclick="projectileSimulator.startSimulation()">▶ 开始模拟</button>
                        ` : isPaused ? `
                            <button class="btn btn-primary" onclick="projectileSimulator.resumeSimulation()">▶ 继续</button>
                        ` : `
                            <button class="btn btn-secondary" onclick="projectileSimulator.pauseSimulation()">⏸ 暂停</button>
                        `}
                        <button class="btn btn-secondary" onclick="projectileSimulator.resetSimulation()">↺ 重置</button>
                        <button class="btn btn-info" onclick="projectileSimulator.toggleCharts()">${showCharts ? '📊 隐藏图表' : '📊 数据图表'}</button>
                    </div>

                    <div class="stats-box">
                        <h4>📐 运动分析</h4>
                        <div id="sim-stats"></div>
                    </div>

                    <div class="presets-box">
                        <h4>🎯 快捷预设</h4>
                        <div class="presets-grid">
                            <button class="preset-btn" onclick="projectileSimulator.loadPreset(20, 45, 0)">标准抛射</button>
                            <button class="preset-btn" onclick="projectileSimulator.loadPreset(30, 30, 0)">平射</button>
                            <button class="preset-btn" onclick="projectileSimulator.loadPreset(30, 60, 0)">高射</button>
                            <button class="preset-btn" onclick="projectileSimulator.loadPreset(20, 45, 0.5)">有阻力</button>
                            <button class="preset-btn" onclick="projectileSimulator.loadPreset(20, 45, 0, 1.62)">月球抛射</button>
                        </div>
                    </div>
                </div>

                <div class="ps-visualization">
                    <div class="canvas-container">
                        <canvas id="trajectory-canvas"></canvas>
                        <div class="trajectory-stats" id="traj-stats">
                            <span id="stat-x">x: 0.00 m</span>
                            <span id="stat-y">y: 0.00 m</span>
                            <span id="stat-t">t: 0.00 s</span>
                            <span id="stat-v">v: ${v0.toFixed(1)} m/s</span>
                        </div>
                    </div>

                    ${showCharts ? `
                    <div class="charts-panel">
                        <div class="chart-container">
                            <h5>位移-时间曲线</h5>
                            <canvas id="chart-displacement" width="350" height="150"></canvas>
                        </div>
                        <div class="chart-container">
                            <h5>速度-时间曲线</h5>
                            <canvas id="chart-velocity" width="350" height="150"></canvas>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>

            <div class="ps-principle">
                <h4>💡 物理原理</h4>
                <div class="principle-cards">
                    <div class="principle-card">
                        <h5>🎯 运动分解</h5>
                        <p>抛体运动可分解为水平方向的匀速直线运动和竖直方向的匀变速直线运动。两个分运动相互独立，同时进行。</p>
                    </div>
                    <div class="principle-card">
                        <h5>📐 射程分析</h5>
                        <p>当θ=45°时，射程最大。在无空气阻力情况下，θ和(90°-θ)的射程相同。实际中由于空气阻力，最佳角度略小于45°。</p>
                    </div>
                    <div class="principle-card">
                        <h5>🔄 对称性</h5>
                        <p>无阻力时，上升和下降过程对称：上升时间等于下降时间，同一高度处速度大小相等、方向相反。</p>
                    </div>
                </div>
            </div>

            <div class="gd-section">
                <h5>🎯 高考考点</h5>
                <ul class="gd-points">
                    <li>抛体运动的分解与合成：运动的独立性原理</li>
                    <li>射程公式R=v₀²sin2θ/g的推导与应用</li>
                    <li>最大高度H=v₀²sin²θ/2g的计算</li>
                    <li>速度方向与位移方向的区别：速度方向沿切线，位移方向从起点指向终点</li>
                    <li>空气阻力对运动的影响：射程减小、最佳角度变小</li>
                </ul>
            </div>
        </div>`;

        this.initCanvas();
        this.updateStats();
        this.drawCurrentTrajectory();
    },

    initCanvas() {
        const canvas = document.getElementById('trajectory-canvas');
        if (!canvas) return;

        const container = canvas.parentElement;
        canvas.width = container.clientWidth || 800;
        canvas.height = 400;
        this.state.width = canvas.width;
        this.state.height = canvas.height;
    },

    drawGrid(ctx, w, h) {
        ctx.fillStyle = '#f8f9fb';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = '#e4e8ee';
        ctx.lineWidth = 1;

        for (let x = 0; x <= w; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        for (let y = 0; y <= h; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        const groundY = h - 50;
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(w, groundY);
        ctx.stroke();

        ctx.fillStyle = '#27ae60';
        ctx.fillRect(0, groundY, w, 50);

        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.fillText('地面', 10, groundY + 25);
    },

    updateParam(param, value) {
        this.state[param] = value;

        const displayEl = document.getElementById(param + '-display') || document.getElementById(param + '-slider')?.nextElementSibling;
        if (displayEl && param !== 'g' && param !== 'speed') {
            if (param === 'dragCoeff') {
                displayEl.textContent = value.toFixed(1);
            } else if (param === 'theta') {
                displayEl.textContent = value + '°';
            } else {
                displayEl.textContent = value + (param === 'v0' ? ' m/s' : '');
            }
        }

        if (!this.state.isRunning) {
            this.updateStats();
            this.drawCurrentTrajectory();
        }
    },

    loadPreset(v0, theta, dragCoeff) {
        this.state.v0 = v0;
        this.state.theta = theta;
        this.state.dragCoeff = dragCoeff;

        const v0Slider = document.getElementById('v0-slider');
        const thetaSlider = document.getElementById('theta-slider');
        const dragSlider = document.getElementById('drag-slider');

        if (v0Slider) v0Slider.value = v0;
        if (thetaSlider) thetaSlider.value = theta;
        if (dragSlider) dragSlider.value = dragCoeff;

        this.updateStats();
        this.drawCurrentTrajectory();
    },

    updateStats() {
        const { v0, theta, g, dragCoeff } = this.state;
        const thetaRad = theta * Math.PI / 180;

        let maxHeight, range, tFlight;

        if (dragCoeff === 0) {
            maxHeight = (v0 * v0 * Math.sin(thetaRad) * Math.sin(thetaRad)) / (2 * g);
            range = v0 * v0 * Math.sin(2 * thetaRad) / g;
            tFlight = 2 * v0 * Math.sin(thetaRad) / g;
        } else {
            const { tFlight: tf, range: r, maxHeight: h } = this.calculateTrajectory(v0, theta, g, dragCoeff);
            tFlight = tf;
            range = r;
            maxHeight = h;
        }

        const statsEl = document.getElementById('sim-stats');
        if (statsEl) {
            statsEl.innerHTML = `
                <div class="stat-row"><span>最大高度 H:</span><span>${maxHeight.toFixed(2)} m</span></div>
                <div class="stat-row"><span>水平射程 R:</span><span>${range.toFixed(2)} m</span></div>
                <div class="stat-row"><span>飞行时间 T:</span><span>${tFlight.toFixed(2)} s</span></div>
                <div class="stat-row"><span>v₀ₓ:</span><span>${(v0 * Math.cos(thetaRad)).toFixed(2)} m/s</span></div>
                <div class="stat-row"><span>v₀ᵧ:</span><span>${(v0 * Math.sin(thetaRad)).toFixed(2)} m/s</span></div>
                ${dragCoeff > 0 ? '<div class="stat-row warning"><span>⚠️</span><span>含空气阻力</span></div>' : ''}
            `;
        }
    },

    drawCurrentTrajectory() {
        const canvas = document.getElementById('trajectory-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        const { v0, theta, g, dragCoeff } = this.state;

        this.drawGrid(ctx, w, h);

        const { dataPoints, range, maxHeight } = this.calculateTrajectory(v0, theta, g, dragCoeff);

        if (dataPoints.length === 0) return;

        const padding = 60;
        const scaleX = (w - padding * 2) / (range + 10);
        const scaleY = (h - padding - 50) / (maxHeight + 5);
        const scale = Math.min(scaleX, scaleY, 3);

        const offsetX = padding;
        const offsetY = h - 50;

        ctx.strokeStyle = '#5b6abf';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();

        dataPoints.forEach((p, i) => {
            const screenX = offsetX + p.x * scale;
            const screenY = offsetY - p.y * scale;

            if (i === 0) {
                ctx.moveTo(screenX, screenY);
            } else {
                ctx.lineTo(screenX, screenY);
            }
        });
        ctx.stroke();

        ctx.fillStyle = '#5b6abf';
        ctx.beginPath();
        ctx.arc(offsetX, offsetY - 0, 6, 0, Math.PI * 2);
        ctx.fill();

        this.drawAxisLabels(ctx, range, maxHeight, scale, offsetX, offsetY, w, h);

        this.state.trajectoryData = dataPoints;
    },

    drawAxisLabels(ctx, range, maxHeight, scale, offsetX, offsetY, w, h) {
        ctx.fillStyle = '#7f8c9b';
        ctx.font = '11px sans-serif';

        const xSteps = 5;
        const xStep = range / xSteps;
        for (let i = 0; i <= xSteps; i++) {
            const x = i * xStep;
            const screenX = offsetX + x * scale;
            ctx.fillText(x.toFixed(0) + 'm', screenX - 10, offsetY + 20);
        }

        const ySteps = 4;
        const yStep = maxHeight / ySteps;
        for (let i = 0; i <= ySteps; i++) {
            const y = i * yStep;
            const screenY = offsetY - y * scale;
            if (screenY > 20) {
                ctx.fillText(y.toFixed(0) + 'm', 5, screenY + 4);
            }
        }
    },

    startSimulation() {
        if (this.state.isRunning) return;

        this.state.isRunning = true;
        this.state.isPaused = false;
        this.state.currentT = 0;

        const { v0, theta, g, dragCoeff, speed } = this.state;
        const { dataPoints, tFlight, range, maxHeight } = this.calculateTrajectory(v0, theta, g, dragCoeff);

        this.state.trajectoryData = dataPoints;

        const canvas = document.getElementById('trajectory-canvas');
        if (!canvas) return;

        const w = canvas.width, h = canvas.height;
        const padding = 60;
        const scaleX = (w - padding * 2) / (range + 10);
        const scaleY = (h - padding - 50) / (maxHeight + 5);
        const scale = Math.min(scaleX, scaleY, 3);

        const offsetX = padding;
        const offsetY = h - 50;

        let dataIndex = 0;

        const animate = () => {
            if (!this.state.isRunning || this.state.isPaused) return;

            const point = dataPoints[dataIndex];
            if (!point) {
                this.state.isRunning = false;
                return;
            }

            const ctx = canvas.getContext('2d');
            this.drawGrid(ctx, w, h);

            ctx.strokeStyle = 'rgba(91, 106, 191, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i <= dataIndex; i++) {
                const p = dataPoints[i];
                const screenX = offsetX + p.x * scale;
                const screenY = offsetY - p.y * scale;
                if (i === 0) ctx.moveTo(screenX, screenY);
                else ctx.lineTo(screenX, screenY);
            }
            ctx.stroke();

            const screenX = offsetX + point.x * scale;
            const screenY = offsetY - point.y * scale;

            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(screenX, screenY, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
            ctx.fill();

            const statX = document.getElementById('stat-x');
            const statY = document.getElementById('stat-y');
            const statT = document.getElementById('stat-t');
            const statV = document.getElementById('stat-v');

            if (statX) statX.textContent = 'x: ' + point.x.toFixed(2) + ' m';
            if (statY) statY.textContent = 'y: ' + Math.max(0, point.y).toFixed(2) + ' m';
            if (statT) statT.textContent = 't: ' + point.t.toFixed(2) + ' s';
            if (statV) statV.textContent = 'v: ' + point.v.toFixed(1) + ' m/s';

            if (this.state.showCharts) {
                this.updateCharts(dataIndex);
            }

            dataIndex += Math.ceil(speed);
            if (dataIndex >= dataPoints.length) {
                this.state.isRunning = false;
                return;
            }

            this.state.animationId = requestAnimationFrame(animate);
        };

        this.state.animationId = requestAnimationFrame(animate);
    },

    pauseSimulation() {
        this.state.isPaused = true;
        if (this.state.animationId) {
            cancelAnimationFrame(this.state.animationId);
        }
        this.renderSimulator();
    },

    resumeSimulation() {
        if (!this.state.isRunning) return;
        this.state.isPaused = false;
        this.renderSimulator();
        this.startSimulation();
    },

    resetSimulation() {
        this.state.isRunning = false;
        this.state.isPaused = false;
        this.state.currentT = 0;

        if (this.state.animationId) {
            cancelAnimationFrame(this.state.animationId);
        }

        const statX = document.getElementById('stat-x');
        const statY = document.getElementById('stat-y');
        const statT = document.getElementById('stat-t');
        const statV = document.getElementById('stat-v');

        if (statX) statX.textContent = 'x: 0.00 m';
        if (statY) statY.textContent = 'y: 0.00 m';
        if (statT) statT.textContent = 't: 0.00 s';
        if (statV) statV.textContent = 'v: ' + this.state.v0.toFixed(1) + ' m/s';

        this.renderSimulator();
    },

    toggleHelp() {
        this.state.showHelp = !this.state.showHelp;
        this.renderSimulator();
    },

    toggleCharts() {
        this.state.showCharts = !this.state.showCharts;
        this.renderSimulator();
    },

    updateCharts(currentIndex) {
        const data = this.state.trajectoryData.slice(0, currentIndex + 1);
        if (data.length < 2) return;

        const dispCanvas = document.getElementById('chart-displacement');
        const velCanvas = document.getElementById('chart-velocity');

        if (dispCanvas) this._drawDisplacementChart(dispCanvas, data);
        if (velCanvas) this._drawVelocityChart(velCanvas, data);
    },

    _drawDisplacementChart(canvas, data) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;

        ctx.fillStyle = '#f8f9fb';
        ctx.fillRect(0, 0, w, h);

        const maxT = Math.max(...data.map(d => d.t));
        const maxX = Math.max(...data.map(d => d.x));
        const maxY = Math.max(...data.map(d => d.y));

        const scaleX = (w - 60) / maxT;
        const scaleY = (h - 40) / Math.max(maxX, maxY);

        ctx.strokeStyle = '#e4e8ee';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = 20 + (h - 40) * i / 4;
            ctx.beginPath();
            ctx.moveTo(40, y);
            ctx.lineTo(w - 10, y);
            ctx.stroke();
        }

        ctx.strokeStyle = '#5b6abf';
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((d, i) => {
            const x = 40 + d.t * scaleX;
            const y = h - 20 - d.x * scaleY;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((d, i) => {
            const x = 40 + d.t * scaleX;
            const y = h - 20 - d.y * scaleY;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        ctx.fillStyle = '#7f8c9b';
        ctx.font = '10px sans-serif';
        ctx.fillText('x(t)', 50, 15);
        ctx.fillStyle = '#27ae60';
        ctx.fillText('y(t)', 80, 15);
    },

    _drawVelocityChart(canvas, data) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;

        ctx.fillStyle = '#f8f9fb';
        ctx.fillRect(0, 0, w, h);

        const maxT = Math.max(...data.map(d => d.t));
        const maxV = Math.max(...data.map(d => d.v));

        const scaleX = (w - 60) / maxT;
        const scaleY = (h - 40) / maxV;

        ctx.strokeStyle = '#e4e8ee';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = 20 + (h - 40) * i / 4;
            ctx.beginPath();
            ctx.moveTo(40, y);
            ctx.lineTo(w - 10, y);
            ctx.stroke();
        }

        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((d, i) => {
            const x = 40 + d.t * scaleX;
            const y = h - 20 - d.v * scaleY;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        ctx.fillStyle = '#e74c3c';
        ctx.font = '10px sans-serif';
        ctx.fillText('v(t)', 50, 15);
    }
};
/**
 * 生态系统模拟器 - 模拟生产者/消费者种群动态与温湿度环境影响
 * @module ecosystemSimulator
 * @example window.ecosystemSimulator.renderSimulation()
 */
const ecosystemSimulator = {
    species: [
        { id: 'grass', name: '草', color: '#4CAF50', type: 'producer', energy: 10, reproductionRate: 0.15, maxPopulation: 500, tempRange: [-10, 40], moistureRange: [0.2, 1] },
        { id: 'rabbit', name: '兔子', color: '#8B4513', type: 'herbivore', energy: 25, reproductionRate: 0.08, maxPopulation: 150, tempRange: [-15, 35], moistureRange: [0.3, 0.9] },
        { id: 'fox', name: '狐狸', color: '#FF6B00', type: 'carnivore', energy: 50, reproductionRate: 0.05, maxPopulation: 50, tempRange: [-20, 35], moistureRange: [0.2, 0.8] }
    ],

    state: {
        populations: { grass: 300, rabbit: 80, fox: 15 },
        temperature: 20,
        moisture: 0.6,
        year: 0,
        history: [],
        isRunning: false,
        animFrameId: null,
        lastSimTime: 0,
        simInterval: 800
    },

    calculateModifier(species, temp, moisture) {
        const tempMod = 1 - Math.abs(temp - 20) / 50;
        const moistMod = moisture > 0.5 ? moisture : 1 - moisture;
        return Math.max(0.3, Math.min(1.5, tempMod * moistMod * 2));
    },

    simulateYear() {
        const { populations, temperature, moisture } = this.state;
        const newPopulations = { ...populations };
        const historyEntry = { year: this.state.year, ...populations };

        this.species.forEach(sp => {
            const currentPop = populations[sp.id];
            if (currentPop === 0) return;

            const modifier = this.calculateModifier(sp, temperature, moisture);

            if (sp.type === 'producer') {
                const growth = currentPop * sp.reproductionRate * modifier;
                newPopulations[sp.id] = Math.min(sp.maxPopulation, Math.floor(currentPop + growth));
            } else if (sp.type === 'herbivore') {
                const foodAvailable = populations.grass / 10;
                const foodConsumed = Math.min(currentPop * 0.5, foodAvailable);
                const survivalRate = Math.min(1, foodConsumed / (currentPop * 0.3));
                const growth = currentPop * sp.reproductionRate * survivalRate * modifier;
                newPopulations[sp.id] = Math.min(sp.maxPopulation, Math.max(0, Math.floor(currentPop + growth)));
            } else if (sp.type === 'carnivore') {
                const preyAvailable = populations.rabbit / 5;
                const foodConsumed = Math.min(currentPop * 0.8, preyAvailable);
                const survivalRate = Math.min(1, foodConsumed / (currentPop * 0.5));
                const growth = currentPop * sp.reproductionRate * survivalRate * modifier;
                newPopulations[sp.id] = Math.min(sp.maxPopulation, Math.max(0, Math.floor(currentPop + growth)));
            }
        });

        this.state.populations = newPopulations;
        this.state.year++;
        this.state.history.push(historyEntry);

        if (this.state.history.length > 50) {
            this.state.history.shift();
        }

        return newPopulations;
    },

    startSimulation() {
        if (this.state.isRunning) return;

        this.state.isRunning = true;
        this.state.lastSimTime = performance.now();
        this.state.simInterval = 800;
        const tick = (now) => {
            if (!this.state.isRunning) return;
            if (now - this.state.lastSimTime >= this.state.simInterval) {
                this.state.lastSimTime = now;
                this.simulateYear();
                this.renderSimulation();
            }
            this.state.animFrameId = requestAnimationFrame(tick);
        };
        this.state.animFrameId = requestAnimationFrame(tick);
    },

    pauseSimulation() {
        this.state.isRunning = false;
        if (this.state.animFrameId) {
            cancelAnimationFrame(this.state.animFrameId);
            this.state.animFrameId = null;
        }
    },

    resetSimulation() {
        this.pauseSimulation();
        this.state.populations = { grass: 300, rabbit: 80, fox: 15 };
        this.state.year = 0;
        this.state.history = [];
        this.renderSimulation();
    },

    setEnvironment(type) {
        const envSettings = {
            spring: { temperature: 20, moisture: 0.6 },
            summer: { temperature: 30, moisture: 0.4 },
            autumn: { temperature: 15, moisture: 0.5 },
            winter: { temperature: 5, moisture: 0.7 }
        };

        if (envSettings[type]) {
            this.state.temperature = envSettings[type].temperature;
            this.state.moisture = envSettings[type].moisture;
            this.renderSimulation();
        }
    },

    renderSimulation() {
        var app = document.getElementById('ecosystem-sim-app');
        if (!app) return;

        var st = this.state;
        var chartHTML = st.history.length > 1 ? this.renderChart() : '<p class="no-data">\u8FD0\u884C\u4E00\u6BB5\u65F6\u95F4\u540E\u663E\u793A\u56FE\u8868</p>';

        var h = [];
        h.push('<div class="eco-sim-container">');
        h.push('<div class="eco-sim-toolbar">');
        h.push('<div class="eco-sim-title"><span class="eco-sim-icon">\uD83C\uDF0D</span><h2>\u751F\u6001\u52A8\u6001\u7CFB\u7EDF\u6A21\u62DF</h2></div>');
        h.push('<div class="eco-sim-actions">');
        h.push('<button class="eco-btn eco-btn-start" onclick="ecosystemSimulator.startSimulation()">\u25B6 \u5F00\u59CB\u6A21\u62DF</button>');
        h.push('<button class="eco-btn eco-btn-pause" onclick="ecosystemSimulator.pauseSimulation()">\u23F8 \u6682\u505C</button>');
        h.push('<button class="eco-btn eco-btn-reset" onclick="ecosystemSimulator.resetSimulation()">\u21BB \u91CD\u7F6E</button>');
        h.push('</div></div>');
        h.push('<div class="eco-sim-main">');
        h.push('<div class="eco-species-panel">');
        h.push('<div class="eco-year-indicator"><span class="eco-year-label">\u6A21\u62DF\u65F6\u95F4</span><span class="eco-year-value">\u7B2C ' + st.year + ' \u5E74</span></div>');

        var i, sp, pop, max, pct, mod, tLabel, tIcon, modClass;
        for (i = 0; i < this.species.length; i++) {
            sp = this.species[i];
            pop = st.populations[sp.id] || 0;
            max = sp.maxPopulation;
            pct = (pop / max * 100).toFixed(1);
            mod = this.calculateModifier(sp, st.temperature, st.moisture);
            tLabel = sp.type === 'producer' ? '\u751F\u4EA7\u8005' : sp.type === 'herbivore' ? '\u521D\u7EA7\u6D88\u8D39\u8005' : '\u6B21\u7EA7\u6D88\u8D39\u8005';
            tIcon = sp.type === 'producer' ? '\uD83C\uDF31' : sp.type === 'herbivore' ? '\uD83D\uDC07' : '\uD83E\uDD8A';
            modClass = mod > 1 ? 'good' : mod > 0.7 ? 'medium' : 'bad';

            h.push('<div class="eco-species-card" style="--sp-color:' + sp.color + '">');
            h.push('<div class="eco-sp-header">');
            h.push('<div class="eco-sp-icon">' + tIcon + '</div>');
            h.push('<div class="eco-sp-info"><span class="eco-sp-name">' + sp.name + '</span><span class="eco-sp-type">' + tLabel + '</span></div>');
            h.push('<div class="eco-sp-count">' + pop + ' <small>\u53EA</small></div>');
            h.push('</div>');
            h.push('<div class="eco-sp-bar-wrapper"><div class="eco-sp-bar"><div class="eco-sp-bar-fill" style="width:' + pct + '%;background:' + sp.color + '"></div></div><span class="eco-sp-percent">' + pct + '%</span></div>');
            h.push('<div class="eco-sp-meta"><span class="eco-sp-modifier ' + modClass + '">\uD83C\uDF21\uFE0F \u9002\u5E94\u5EA6 \u00D7' + mod.toFixed(2) + '</span></div>');
            h.push('</div>');
        }

        h.push('</div>');
        h.push('<div class="eco-control-panel">');
        h.push('<div class="eco-panel-section">');
        h.push('<h4 class="eco-panel-title">\uD83C\uDF21\uFE0F \u73AF\u5883\u53C2\u6570\u8C03\u8282</h4>');
        h.push('<div class="eco-slider-group">');
        h.push('<div class="eco-slider-item">');
        h.push('<div class="eco-slider-header"><label>\uD83C\uDF21\uFE0F \u6E29\u5EA6</label><span class="eco-slider-value">' + st.temperature + '\u00B0C</span></div>');
        h.push('<input type="range" class="eco-range" min="-10" max="40" value="' + st.temperature + '" oninput="ecosystemSimulator.state.temperature=parseInt(this.value);ecosystemSimulator.renderSimulation();">');
        h.push('<div class="eco-slider-labels"><span>-10\u00B0C</span><span>15\u00B0C</span><span>40\u00B0C</span></div>');
        h.push('</div>');
        h.push('<div class="eco-slider-item">');
        h.push('<div class="eco-slider-header"><label>\uD83D\uDCA7 \u6E7F\u5EA6</label><span class="eco-slider-value">' + (st.moisture * 100).toFixed(0) + '%</span></div>');
        h.push('<input type="range" class="eco-range" min="0" max="100" value="' + (st.moisture * 100) + '" oninput="ecosystemSimulator.state.moisture=parseInt(this.value)/100;ecosystemSimulator.renderSimulation();">');
        h.push('<div class="eco-slider-labels"><span>0%</span><span>50%</span><span>100%</span></div>');
        h.push('</div>');
        h.push('</div></div>');

        h.push('<div class="eco-panel-section">');
        h.push('<h4 class="eco-panel-title">\uD83C\uDF43 \u5B63\u8282\u9884\u8BBE</h4>');
        h.push('<div class="eco-season-grid">');
        h.push('<button class="eco-season-btn" onclick="ecosystemSimulator.setEnvironment(\'spring\')"><span class="eco-season-icon">\uD83C\uDF38</span><span class="eco-season-name">\u6625\u5B63</span><span class="eco-season-desc">\u6E29\u6696\u6E7F\u6DA6</span></button>');
        h.push('<button class="eco-season-btn" onclick="ecosystemSimulator.setEnvironment(\'summer\')"><span class="eco-season-icon">\u2600\uFE0F</span><span class="eco-season-name">\u590F\u5B63</span><span class="eco-season-desc">\u708E\u70ED\u5E72\u71E5</span></button>');
        h.push('<button class="eco-season-btn" onclick="ecosystemSimulator.setEnvironment(\'autumn\')"><span class="eco-season-icon">\uD83C\uDF42</span><span class="eco-season-name">\u79CB\u5B63</span><span class="eco-season-desc">\u51C9\u723D\u8212\u9002</span></button>');
        h.push('<button class="eco-season-btn" onclick="ecosystemSimulator.setEnvironment(\'winter\')"><span class="eco-season-icon">\u2744\uFE0F</span><span class="eco-season-name">\u51AC\u5B63</span><span class="eco-season-desc">\u5BD2\u51B7\u6F6E\u6E7F</span></button>');
        h.push('</div></div>');

        h.push('<div class="eco-panel-section">');
        h.push('<h4 class="eco-panel-title">\uD83D\uDCA1 \u64CD\u4F5C\u63D0\u793A</h4>');
        h.push('<div class="eco-tips">');
        h.push('<p>\u70B9\u51FB <strong>\u5F00\u59CB\u6A21\u62DF</strong> \u542F\u52A8\u751F\u6001\u6F14\u5316</p>');
        h.push('<p>\u8C03\u8282 <strong>\u6E29\u6E7F\u5EA6</strong> \u89C2\u5BDF\u7269\u79CD\u53D8\u5316</p>');
        h.push('<p>\u67E5\u770B <strong>\u79CD\u7FA4\u66F2\u7EBF</strong> \u5206\u6790\u98DF\u7269\u94FE\u52A8\u6001</p>');
        h.push('<p><strong>\u9002\u5E94\u5EA6</strong> &gt; 1.0 \u8868\u793A\u73AF\u5883\u6709\u5229</p>');
        h.push('</div></div>');
        h.push('</div></div>');

        h.push('<div class="eco-chart-section">');
        h.push('<h4 class="eco-chart-title">\uD83D\uDCC8 \u79CD\u7FA4\u52A8\u6001\u8D8B\u52BF\u56FE</h4>');
        h.push('<div class="eco-chart-container" id="eco-chart-container">' + chartHTML + '</div>');
        h.push('</div>');
        h.push('</div>');

        app.innerHTML = h.join('');
    },

    renderChart() {
        const history = this.state.history;
        if (history.length < 2) return '<p>数据收集中...</p>';

        const width = 600;
        const height = 250;
        const padding = 40;

        const maxPop = Math.max(...history.map(h => Math.max(h.grass, h.rabbit, h.fox)));

        const getX = (i) => padding + (i / (history.length - 1)) * (width - padding * 2);
        const getY = (pop) => height - padding - (pop / maxPop) * (height - padding * 2);

        let pathGrass = '', pathRabbit = '', pathFox = '';

        history.forEach((h, i) => {
            const x = getX(i);
            if (i === 0) {
                pathGrass = `M ${x} ${getY(h.grass)}`;
                pathRabbit = `M ${x} ${getY(h.rabbit)}`;
                pathFox = `M ${x} ${getY(h.fox)}`;
            } else {
                pathGrass += ` L ${x} ${getY(h.grass)}`;
                pathRabbit += ` L ${x} ${getY(h.rabbit)}`;
                pathFox += ` L ${x} ${getY(h.fox)}`;
            }
        });

        return `
            <svg width="${width}" height="${height}" class="eco-svg">
                <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#333"/>
                <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#333"/>

                ${[0, 0.25, 0.5, 0.75, 1].map(p => {
                    const y = height - padding - p * (height - padding * 2);
                    return `<text x="${padding - 5}" y="${y + 3}" class="axis-label" text-anchor="end">${Math.round(maxPop * p)}</text>`;
                }).join('')}

                <path d="${pathGrass}" stroke="#4CAF50" stroke-width="2" fill="none"/>
                <path d="${pathRabbit}" stroke="#8B4513" stroke-width="2" fill="none"/>
                <path d="${pathFox}" stroke="#FF6B00" stroke-width="2" fill="none"/>

                <text x="${width / 2}" y="${height - 5}" text-anchor="middle" class="axis-label">时间（年）</text>
                <text x="${padding - 30}" y="${height / 2}" text-anchor="middle" class="axis-label" transform="rotate(-90, ${padding - 30}, ${height / 2})">种群数量</text>
            </svg>
        `;
    }
};

// ---- window 暴露 ----
window.loadPhysicsTool = loadPhysicsTool;
window.physicsFormulaCalculator = physicsFormulaCalculator;
window.projectileSimulator = projectileSimulator;
window.ecosystemSimulator = ecosystemSimulator;

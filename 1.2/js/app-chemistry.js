// ============================================================
// app-chemistry.js — 化学模块（从 app.js 拆分）
// 包含: 方程式配平/测验生成/安全系统/电化学/化工流程/
//       方程式笔记本/有机转换/过程分析/方程式Pro
// 依赖: app.js (currentTool 全局变量)
// ============================================================

/**
 * 化学方程式配平器 - 支持氧化还原/非氧化还原方程式自动配平与原子守恒检验
 * @module chemistryBalancer
 * @example window.chemistryBalancer.parseEquation('Fe + O2 -> Fe2O3')
 */
const chemistryBalancer = {
    elements: {
        H: 1, He: 2, Li: 3, Be: 4, B: 5, C: 6, N: 7, O: 8, F: 9, Ne: 10,
        Na: 11, Mg: 12, Al: 13, Si: 14, P: 15, S: 16, Cl: 17, Ar: 18,
        K: 19, Ca: 20, Fe: 23, Cu: 29, Zn: 30, Br: 35, Ag: 47, I: 53,
        Mn: 25, Cr: 24
    },

    parseFormula(formula) {
        const atoms = {};
        const regex = /([A-Z][a-z]?)(\d*)/g;
        let match;
        while ((match = regex.exec(formula)) !== null) {
            if (match[1]) {
                const element = match[1];
                const count = match[2] ? parseInt(match[2]) : 1;
                atoms[element] = (atoms[element] || 0) + count;
            }
        }
        return atoms;
    },

    parseEquation(equation) {
        const parts = equation.replace(/→|->|=/g, '->').split('->');
        if (parts.length !== 2) {
            return { reactants: [], products: [], valid: false };
        }

        const parseSide = (side) => {
            return side.split('+').map(s => s.trim()).filter(s => s && s !== '');
        };

        return {
            reactants: parseSide(parts[0]),
            products: parseSide(parts[1]),
            valid: true
        };
    },

    gcd(a, b) {
        return b === 0 ? a : this.gcd(b, a % b);
    },

    lcm(a, b) {
        return (a * b) / this.gcd(a, b);
    },

    balanceEquation(reactants, products) {
        const allFormulas = [...reactants, ...products];
        const elementList = {};

        allFormulas.forEach((formula, idx) => {
            const atoms = this.parseFormula(formula);
            Object.keys(atoms).forEach(el => {
                if (!elementList[el]) {
                    elementList[el] = new Array(allFormulas.length).fill(0);
                }
                elementList[el][idx] = atoms[el];
            });
        });

        const totalSpecies = reactants.length + products.length;
        const equations = [];
        const variables = [];

        for (let i = 0; i < totalSpecies; i++) {
            variables.push(1);
        }

        for (const el in elementList) {
            const coeffs = elementList[el];
            const reactantSum = coeffs.slice(0, reactants.length);
            const productSum = coeffs.slice(reactants.length);

            const rCoeffs = reactantSum.map((c, i) => i === 0 ? c : `+${c}`);
            const pCoeffs = productSum.map((c, i) => `-${c}`);

            equations.push([...reactantSum, ...productSum.map(c => -c)]);
        }

        const solution = this.solveLinearSystem(equations, totalSpecies);

        if (solution) {
            const minCoeff = Math.min(...solution.filter(n => n > 0));
            return solution.map(n => Math.round(n / minCoeff));
        }

        return new Array(totalSpecies).fill(1);
    },

    solveLinearSystem(equations, numVars) {
        const n = equations.length;
        const m = numVars;

        if (n >= m - 1) {
            const result = new Array(m).fill(1);
            for (let i = 0; i < m - 1 && i < n; i++) {
                const pivot = equations[i][i];
                if (pivot !== 0) {
                    for (let j = i; j < m; j++) {
                        equations[i][j] /= pivot;
                    }
                    for (let k = 0; k < n; k++) {
                        if (k !== i && equations[k][i] !== 0) {
                            const factor = equations[k][i];
                            for (let j = i; j < m; j++) {
                                equations[k][j] -= factor * equations[i][j];
                            }
                        }
                    }
                }
            }

            for (let i = 0; i < m; i++) {
                let found = false;
                for (let j = 0; j < n; j++) {
                    if (Math.abs(equations[j][i]) > 0.001) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    result[i] = 1;
                }
            }

            const freeVar = m - 1;
            result[freeVar] = 1;

            for (let i = Math.min(n, m) - 1; i >= 0; i--) {
                let sum = 0;
                let pivotCol = -1;
                for (let j = 0; j < m; j++) {
                    if (Math.abs(equations[i][j]) > 0.001) {
                        sum += equations[i][j] * (result[j] || 0);
                        if (Math.abs(equations[i][j] - 1) < 0.001) {
                            pivotCol = j;
                        }
                    }
                }
                if (pivotCol >= 0) {
                    result[pivotCol] = -sum + equations[i][pivotCol];
                }
            }

            return result.map(n => Math.abs(Math.round(n)) || 1);
        }

        return null;
    },

    tryBalance(reactants, products) {
        const total = reactants.length + products.length;
        const maxCoeff = 20;

        const tryCoeffs = (coeffs) => {
            if (coeffs.length < total) {
                coeffs = [...coeffs, ...new Array(total - coeffs.length).fill(1)];
            }

            const leftAtoms = {};
            reactants.forEach((f, i) => {
                const atoms = this.parseFormula(f);
                Object.keys(atoms).forEach(el => {
                    leftAtoms[el] = (leftAtoms[el] || 0) + atoms[el] * coeffs[i];
                });
            });

            const rightAtoms = {};
            products.forEach((f, i) => {
                const atoms = this.parseFormula(f);
                Object.keys(atoms).forEach(el => {
                    rightAtoms[el] = (rightAtoms[el] || 0) + atoms[el] * coeffs[reactants.length + i];
                });
            });

            for (const el in leftAtoms) {
                if (!rightAtoms[el] || Math.abs(leftAtoms[el] - rightAtoms[el]) > 0.001) {
                    return false;
                }
            }
            for (const el in rightAtoms) {
                if (!leftAtoms[el] || Math.abs(leftAtoms[el] - rightAtoms[el]) > 0.001) {
                    return false;
                }
            }
            return true;
        };

        for (let a = 1; a <= maxCoeff; a++) {
            for (let b = 1; b <= maxCoeff; b++) {
                for (let c = 1; c <= maxCoeff; c++) {
                    for (let d = 1; d <= maxCoeff; d++) {
                        const coeffs = [a, b, c, d].slice(0, total);
                        if (tryCoeffs(coeffs)) {
                            return coeffs;
                        }
                    }
                }
            }
        }

        return new Array(total).fill(1);
    },

    formatBalancedEquation(reactants, products, coefficients) {
        const formatSpecies = (formulas, startIdx) => {
            return formulas.map((f, i) => {
                const coeff = coefficients[startIdx + i] || 1;
                return coeff === 1 ? f : `${coeff}${f}`;
            }).join(' + ');
        };

        return `${formatSpecies(reactants, 0)} → ${formatSpecies(products, reactants.length)}`;
    }
};

const chemistryQuizGenerator = {
    currentQuestions: [],

    questionBanks: {
        ionCoexistence: [
            {
                question: "下列离子能在溶液中大量共存的是：",
                options: [
                    "Na⁺、Cl⁻、Ag⁺、NO₃⁻",
                    "K⁺、SO₄²⁻、Ba²⁺、NO₃⁻",
                    "Na⁺、Cl⁻、K⁺、NO₃⁻",
                    "Ca²⁺、CO₃²⁻、H⁺、Cl⁻"
                ],
                answer: 2,
                explanation: "Ag⁺与Cl⁻生成AgCl沉淀，Ba²⁺与SO₄²⁻生成BaSO₄沉淀，Ca²⁺与CO₃²⁻生成CaCO₃沉淀，且CO₃²⁻与H⁺反应。"
            },
            {
                question: "在酸性溶液中，能大量共存的离子组是：",
                options: [
                    "OH⁻、Na⁺、Cl⁻、K⁺",
                    "SO₄²⁻、Cu²⁺、Na⁺、Cl⁻",
                    "CO₃²⁻、Ca²⁺、Na⁺、NO₃⁻",
                    "S²⁻、K⁺、NH₄⁺、Cl⁻"
                ],
                answer: 1,
                explanation: "酸性条件下，OH⁻、CO₃²⁻、S²⁻不能大量存在。SO₄²⁻、Cu²⁺、Na⁺、Cl⁻在酸性条件下可以共存。"
            },
            {
                question: "下列各组离子，能在pH=1的溶液中大量共存的是：",
                options: [
                    "Mg²⁺、Fe³⁺、NO₃⁻、SO₄²⁻",
                    "Na⁺、OH⁻、K⁺、Cl⁻",
                    "K⁺、Cl⁻、HCO₃⁻、Ca²⁺",
                    "Ba²⁺、OH⁻、NO₃⁻、Na⁺"
                ],
                answer: 0,
                explanation: "pH=1为强酸性溶液，OH⁻、HCO₃⁻不能大量存在。Mg²⁺、Fe³⁺、NO₃⁻、SO₄²⁻在酸性条件下可共存。"
            },
            {
                question: "某无色溶液中可能含有：Na⁺、Mg²⁺、Fe³⁺、Cu²⁺、Cl⁻、SO₄²⁻、NO₃⁻等离子。已知溶液呈酸性，则一定能大量共存的是：",
                options: [
                    "Na⁺、Cl⁻、NO₃⁻、SO₄²⁻",
                    "Cu²⁺、Cl⁻、SO₄²⁻、NO₃⁻",
                    "Fe³⁺、Cl⁻、SO₄²⁻、NO₃⁻",
                    "Na⁺、OH⁻、SO₄²⁻、NO₃⁻"
                ],
                answer: 0,
                explanation: "溶液无色，排除Fe³⁺（黄色）、Cu²⁺（蓝色）。酸性条件下OH⁻不能大量共存。"
            },
            {
                question: "下列离子组在碱性溶液中能大量共存的是：",
                options: [
                    "NH₄⁺、H⁺、NO₃⁻、Cl⁻",
                    "K⁺、Na⁺、Cl⁻、SO₄²⁻",
                    "Al³⁺、OH⁻、Na⁺、Cl⁻",
                    "H⁺、HCO₃⁻、Na⁺、Cl⁻"
                ],
                answer: 1,
                explanation: "碱性条件下，NH₄⁺、H⁺、Al³⁺、HCO₃⁻均不能大量共存。K⁺、Na⁺、Cl⁻、SO₄²⁻在碱性条件下可以共存。"
            }
        ],
        naQuestions: [
            {
                question: "标准状况下，11.2L CH₄含有的分子数约为：",
                options: ["3.01×10²³", "6.02×10²³", "9.03×10²³", "1.204×10²⁴"],
                answer: 0,
                explanation: "n(CH₄) = 11.2/22.4 = 0.5mol，N = 0.5 × 6.02×10²³ = 3.01×10²³"
            },
            {
                question: "24.5g H₂SO₄含有的氧原子数约为：",
                options: ["9.03×10²³", "1.204×10²⁴", "1.505×10²⁴", "1.806×10²⁴"],
                answer: 1,
                explanation: "M(H₂SO₄) = 98g/mol，n = 24.5/98 = 0.25mol，每个H₂SO₄含4个O原子，所以O原子物质的量 = 0.25×4 = 1mol，N ≈ 1.204×10²⁴"
            },
            {
                question: "相同条件下，等质量的下列气体中，分子数最多的是：",
                options: ["O₂", "Cl₂", "N₂", "CO₂"],
                answer: 2,
                explanation: "分子数 N = m/M × NA，质量相同时，M越小分子数越多。N₂的摩尔质量最小(28g/mol)。"
            },
            {
                question: "配制500mL 0.2mol/L NaOH溶液，需要NaOH的质量为：",
                options: ["4.0g", "8.0g", "16.0g", "40.0g"],
                answer: 0,
                explanation: "n(NaOH) = 0.5L × 0.2mol/L = 0.1mol，m(NaOH) = 0.1mol × 40g/mol = 4.0g"
            },
            {
                question: "下列物质中，含有分子数最多的是（原子质量：H=1，C=12，O=16，S=32）：",
                options: ["18g H₂O", "32g O₂", "44g CO₂", "64g SO₂"],
                answer: 0,
                explanation: "18g H₂O = 1mol，32g O₂ = 1mol，44g CO₂ = 1mol，64g SO₂ = 1mol。但H₂O摩尔质量最小，所以18g时物质的量最大。"
            }
        ],
        electrochemistry: [
            {
                question: "下列装置中，能构成原电池的是：",
                options: [
                    "Zn片 | ZnSO₄溶液 | Cu片",
                    "Zn片 | 稀H₂SO₄ | Zn片",
                    "Cu片 | 稀H₂SO₄ | Zn片",
                    "Fe片 | CuSO₄溶液 | Cu片"
                ],
                answer: 2,
                explanation: "原电池需两个不同电极、电解质溶液和闭合回路。Cu片 | 稀H₂SO₄ | Zn片符合条件，Zn比Cu活泼，作负极。"
            },
            {
                question: "铁的电化学腐蚀中，发生氧化反应的是：",
                options: ["Fe", "H₂O", "O₂", "Fe²⁺"],
                answer: 0,
                explanation: "电化学腐蚀中，负极（较活泼金属）发生氧化反应。Fe作负极：Fe - 2e⁻ = Fe²⁺"
            },
            {
                question: "用石墨电极电解CuSO₄溶液，阳极产物是：",
                options: ["Cu", "O₂", "H₂", "SO₂"],
                answer: 1,
                explanation: "电解CuSO₄溶液，阳极发生氧化反应：4OH⁻ - 4e⁻ = 2H₂O + O₂↑（或2H₂O - 4e⁻ = O₂↑ + 4H⁺）"
            },
            {
                question: "下列关于电解的说法正确的是：",
                options: [
                    "电解池中，电流流向与电子流向相同",
                    "电解饱和食盐水时，阴极产物为NaOH和H₂",
                    "电解精炼铜时，粗铜作阳极",
                    "电解熔融Al₂O₃时，阴极产物为Al和O₂"
                ],
                answer: 2,
                explanation: "粗铜精炼时，粗铜作阳极（氧化），纯铜作阴极（还原）。阳极：Cu - 2e⁻ = Cu²⁺，阴极：Cu²⁺ + 2e⁻ = Cu。"
            },
            {
                question: "钢铁腐蚀的正极反应为：",
                options: [
                    "Fe - 2e⁻ = Fe²⁺",
                    "2H₂O + O₂ + 4e⁻ = 4OH⁻",
                    "2H⁺ + 2e⁻ = H₂↑",
                    "4OH⁻ - 4e⁻ = 2H₂O + O₂"
                ],
                answer: 1,
                explanation: "钢铁腐蚀的吸氧腐蚀中，正极（阴极）为氧气得电子：2H₂O + O₂ + 4e⁻ = 4OH⁻"
            }
        ],
        reactionProcess: [
            {
                question: "反应历程图中，决定反应速率的步骤是：",
                options: [
                    "反应物到中间体的步骤",
                    "活化能最大的步骤",
                    "中间体到产物的步骤",
                    "活化能最小的步骤"
                ],
                answer: 1,
                explanation: "反应速率由活化能决定，活化能最大的步骤是决速步骤（速率决定步骤）。"
            },
            {
                question: "下列关于催化剂的说法正确的是：",
                options: [
                    "催化剂能加快反应速率，不参与反应",
                    "催化剂同等程度地加快正逆反应速率",
                    "催化剂能改变反应的热效应",
                    "生物体内的催化剂具有高度专一性"
                ],
                answer: 1,
                explanation: "催化剂同等程度地加快正逆反应速率，不改变平衡位置，只缩短达到平衡的时间。"
            },
            {
                question: "反应 A + B ⇌ C + D 的 ΔH < 0，若温度升高，则：",
                options: [
                    "正反应速率加快，逆反应速率减慢",
                    "正逆反应速率都加快，逆反应加快更多",
                    "正逆反应速率都减慢",
                    "正反应速率减慢，逆反应速率加快"
                ],
                answer: 1,
                explanation: "温度升高，正逆反应速率都加快。对放热反应，逆反应活化能更低，升温对其速率影响更大，所以逆反应加快更多。"
            },
            {
                question: "对于反应 2SO₂ + O₂ ⇌ 2SO₃，下列措施能加快反应速率的是：",
                options: [
                    "增大容器体积",
                    "加入催化剂",
                    "移走SO₃",
                    "降低温度"
                ],
                answer: 1,
                explanation: "加入催化剂可降低活化能，加快反应速率。增大体积（减小浓度）、移走产物、降低温度都会减慢反应速率。"
            },
            {
                question: "反应物的转化率与反应时间的关系图正确的是：",
                options: [
                    "转化率随时间线性增加",
                    "转化率随时间先快后慢最终达平衡",
                    "转化率随时间先慢后快",
                    "转化率与时间无关"
                ],
                answer: 1,
                explanation: "反应初期反应物浓度大，反应速率快，转化率增加快；随着反应进行，浓度下降，速率减慢，转化率增加变慢，最终达到平衡。"
            }
        ],
        experimentOperation: [
            {
                question: "下列操作会导致配制的NaOH溶液浓度偏高的是：",
                options: [
                    "定容时俯视刻度线",
                    "容量瓶用蒸馏水洗净后未干燥",
                    "转移溶液时烧杯内有蒸馏水",
                    "摇匀后液面低于刻度线，再补加蒸馏水"
                ],
                answer: 0,
                explanation: "定容时俯视会导致液面低于刻度线，实际加水量偏少，浓度偏高。容量瓶未干燥、烧杯内有水不影响最终浓度，因为定容时仍需加水至刻度线。"
            },
            {
                question: "实验室制取氯气时，多余氯气应采用什么吸收：",
                options: [
                    "澄清石灰水",
                    "饱和食盐水",
                    "氢氧化钠溶液",
                    "浓硫酸"
                ],
                answer: 2,
                explanation: "氯气与NaOH反应：Cl₂ + 2NaOH = NaCl + NaClO + H₂O，可用于吸收多余氯气。饱和食盐水用于除去Cl₂中的HCl，浓硫酸用于干燥氯气。"
            },
            {
                question: "配制一定物质的量浓度溶液的步骤，正确的顺序是：\n①溶解 ②转移 ③洗涤 ④定容 ⑤摇匀 ⑥称量",
                options: [
                    "⑥①③②④⑤",
                    "①⑥③②④⑤",
                    "⑥①②③④⑤",
                    "①⑥②③④⑤"
                ],
                answer: 0,
                explanation: "配制步骤：称量→溶解→转移→洗涤→定容→摇匀。注意：溶解后需冷却再转移，定容后需摇匀。"
            },
            {
                question: "下列实验操作正确的是：",
                options: [
                    "用嘴吹灭酒精灯",
                    "给试管内液体加热时，试管口对着人",
                    "稀释浓硫酸时，将水倒入浓硫酸",
                    "闻气体时用手轻轻扇闻"
                ],
                answer: 3,
                explanation: "闻气体时应轻轻扇闻，避免大量吸入。酒精灯应用灯帽盖灭；试管口不能对着人；稀释浓硫酸应将浓硫酸沿器壁倒入水中。"
            },
            {
                question: "分液漏斗使用时，正确的操作是：",
                options: [
                    "上层液体从下口放出",
                    "下层液体从下口放出",
                    "上下层液体同时从下口放出",
                    "先分离上层液体，再从下口放下层液体"
                ],
                answer: 1,
                explanation: "分液时，下层液体从下口放出，上层液体从上口倒出。若上层液体从下口放出，会混入下层液体。"
            }
        ]
    },

    generateQuiz(types, count = 8) {
        const questions = [];
        const typeList = types.length > 0 ? types : Object.keys(this.questionBanks);
        const usedQuestions = new Set();

        for (let i = 0; i < count && questions.length < count; i++) {
            const randomType = typeList[Math.floor(Math.random() * typeList.length)];
            const bank = this.questionBanks[randomType];
            if (bank && bank.length > 0) {
                let attempts = 0;
                while (attempts < 10) {
                    const randomIndex = Math.floor(Math.random() * bank.length);
                    const question = { ...bank[randomIndex], type: randomType };
                    if (!usedQuestions.has(question.question)) {
                        usedQuestions.add(question.question);
                        questions.push(question);
                        break;
                    }
                    attempts++;
                }
            }
        }

        this.currentQuestions = questions;
        return questions;
    },

    renderQuiz(questions) {
        return questions.map((q, idx) => `
            <div class="quiz-question" data-index="${idx}">
                <div class="question-number">第 ${idx + 1} 题 ${this.getTypeName(q.type)}</div>
                <div class="question-text">${q.question}</div>
                <div class="quiz-options">
                    ${q.options.map((opt, optIdx) => `
                        <div class="quiz-option" data-option="${optIdx}" onclick="checkAnswer(${idx}, ${optIdx})">
                            ${String.fromCharCode(65 + optIdx)}. ${opt}
                        </div>
                    `).join('')}
                </div>
                <div class="answer-toggle" style="display:none;" id="answer-${idx}">
                    <div class="info-box">
                        <h4>正确答案：${String.fromCharCode(65 + q.answer)}</h4>
                        <p><strong>解析：</strong>${q.explanation}</p>
                    </div>
                </div>
            </div>
        `).join('');
    },

    getTypeName(type) {
        const names = {
            ionCoexistence: '【离子共存】',
            naQuestions: '【NA计算】',
            electrochemistry: '【电化学】',
            reactionProcess: '【反应历程图】',
            experimentOperation: '【实验操作】'
        };
        return names[type] || '';
    }
};
/**
 * 化学工具加载器 - 按 tool 名分发到对应渲染器（配平/测验/安全/电化学/化工流程等）
 * @module loadChemistryTool
 * @example window.loadChemistryTool('balancer')
 */
function loadChemistryTool(tool) {
    if (tool === 'balancer') {
        navigateTo('chemistry-balancer');
        renderChemistryBalancer();
    } else if (tool === 'quiz') {
        navigateTo('chemistry-quiz');
        renderChemistryQuiz();
    } else if (tool === 'safety') {
        navigateTo('chemistry-safety');
        chemistrySafetySystem.renderSystem();
    } else if (tool === 'electrochem') {
        navigateTo('electrochem');
        electrochemistryViewer.renderViewer();
    } else if (tool === 'process') {
        navigateTo('process-flow');
        chemicalProcessFlow.renderSystem();
    } else if (tool === 'notebook') {
        navigateTo('equation-notebook');
        equationNotebook.renderNotebook();
    } else if (tool === 'organic') {
        navigateTo('organic-converter');
        organicConverter.renderConverter();
    } else if (tool === 'process-analyzer') {
        navigateTo('process-analyzer');
        if (typeof chemistryProcessAnalyzerEnhanced !== 'undefined') {
            chemistryProcessAnalyzerEnhanced._render();
        } else {
            chemistryProcessAnalyzer.renderAnalyzer();
        }
    } else if (tool === 'equation-balancer') {
        navigateTo('equation-balancer');
        equationBalancerPro.renderSystem();
    }
}

/**
 * 生物工具加载器 - 按 tool 名分发到对应渲染器（遗传/生态/思维导图/PCR/电泳等）
 * @module loadBiologyTool
 * @example window.loadBiologyTool('pcr')
 */
function renderChemistryBalancer() {
    const app = document.getElementById('chemistry-balancer-app');
    app.innerHTML = `
        <div class="chemistry-app">
            <div class="app-section">
                <h3>⚗️ 方程式输入</h3>
                <input type="text" class="balance-input" id="equation-input"
                    placeholder="例如: Fe + O2 -> Fe2O3"
                    value="Fe + O2 -> Fe2O3">
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="balanceEquation()">配平方程</button>
                    <button class="btn btn-secondary" onclick="loadPreset('h2o')">2H2 + O2 → 2H2O</button>
                    <button class="btn btn-secondary" onclick="loadPreset('fe+o2')">Fe + O2 → Fe2O3</button>
                    <button class="btn btn-secondary" onclick="loadPreset('naoh+hcl')">NaOH + HCl → NaCl + H2O</button>
                    <button class="btn btn-secondary" onclick="loadPreset('combustion')">C6H12O6 + O2 → CO2 + H2O</button>
                </div>
            </div>

            <div id="balance-result" class="balance-result" style="display:none;">
                <h3>✅ 配平结果</h3>
                <div class="balanced-equation" id="balanced-eq"></div>

                <h4>原子守恒检验：</h4>
                <div class="atom-counts" id="atom-counts"></div>

                <h4>分子可视化：</h4>
                <div class="visualization">
                    <div class="molecule-visual" id="molecule-visual"></div>
                </div>
            </div>

            <div class="app-section">
                <h3>📚 配平方法说明</h3>
                <div class="info-box">
                    <h4>最小公倍数法</h4>
                    <p>适用于：等式两边各出现一次的元素，且较大原子数与较小原子数的比值简单。</p>
                    <p>步骤：1) 找出在反应物和生成物中只出现一次的元素；2) 求出其最小公倍数；3) 确定系数。</p>
                </div>
                <div class="info-box">
                    <h4>氧化数法（电子得失法）</h4>
                    <p>适用于：氧化还原反应。</p>
                    <p>步骤：1) 标出元素化合价；2) 计算化合价变化；3) 找最小公倍数使化合价升降相等；4) 配平其他原子。</p>
                </div>
                <div class="warning-box">
                    <h4>⚠️ 常见错误</h4>
                    <ul style="margin-left: 20px;">
                        <li>忘记配平氢原子和氧原子（最后检查）</li>
                        <li>忘记检查产物与反应物的原子种类是否一致</li>
                        <li>有机物燃烧反应先配平C和H，最后配平O</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

/**
 * 预设加载器 - 将预设化学方程式填入配平输入框
 * @module loadPreset
 * @example window.loadPreset('h2o')
 */
function loadPreset(preset) {
    const presets = {
        'h2o': 'H2 + O2 -> H2O',
        'fe+o2': 'Fe + O2 -> Fe2O3',
        'naoh+hcl': 'NaOH + HCl -> NaCl + H2O',
        'combustion': 'C6H12O6 + O2 -> CO2 + H2O'
    };
    document.getElementById('equation-input').value = presets[preset] || '';
}

/**
 * 方程式配平执行器 - 读取输入并调用 chemistryBalancer 配平，渲染系数/原子守恒/分子可视化
 * @module balanceEquation
 * @example window.balanceEquation()
 */
function balanceEquation() {
    const input = document.getElementById('equation-input').value.trim();
    const result = chemistryBalancer.parseEquation(input);

    if (!result.valid || result.reactants.length === 0 || result.products.length === 0) {
        alert('请输入正确格式的方程式，使用 "+" 分隔反应物和生成物，使用 "->" 或 "→" 表示反应方向，例如: Fe + O2 -> Fe2O3');
        return;
    }

    const coefficients = chemistryBalancer.tryBalance(result.reactants, result.products);
    const balancedStr = chemistryBalancer.formatBalancedEquation(result.reactants, result.products, coefficients);

    document.getElementById('balanced-eq').textContent = balancedStr;

    let atomCountsHTML = '';
    const reactantCoeffs = coefficients.slice(0, result.reactants.length);
    const productCoeffs = coefficients.slice(result.reactants.length);

    const allElements = new Set();
    result.reactants.forEach(f => {
        Object.keys(chemistryBalancer.parseFormula(f)).forEach(el => allElements.add(el));
    });
    result.products.forEach(f => {
        Object.keys(chemistryBalancer.parseFormula(f)).forEach(el => allElements.add(el));
    });

    allElements.forEach(el => {
        let reactantCount = 0;
        result.reactants.forEach((f, i) => {
            const atoms = chemistryBalancer.parseFormula(f);
            if (atoms[el]) {
                reactantCount += atoms[el] * reactantCoeffs[i];
            }
        });

        let productCount = 0;
        result.products.forEach((f, i) => {
            const atoms = chemistryBalancer.parseFormula(f);
            if (atoms[el]) {
                productCount += atoms[el] * productCoeffs[i];
            }
        });

        const isBalanced = reactantCount === productCount;
        atomCountsHTML += `
            <div class="atom-count ${isBalanced ? 'balanced' : 'unbalanced'}">
                <strong>${el}</strong><br>
                反应物: ${reactantCount} | 生成物: ${productCount}
                ${isBalanced ? '✓' : '✗'}
            </div>
        `;
    });

    document.getElementById('atom-counts').innerHTML = atomCountsHTML;

    let visualHTML = '<div class="reactant">';
    result.reactants.forEach((f, i) => {
        const coeff = reactantCoeffs[i];
        visualHTML += `
            <div class="molecule">
                <div class="coefficient">${coeff}</div>
                <div class="formula">${f}</div>
            </div>
            ${i < result.reactants.length - 1 ? '<span class="plus-sign">+</span>' : ''}
        `;
    });
    visualHTML += '</div><div class="arrow">→</div><div class="product">';
    result.products.forEach((f, i) => {
        const coeff = productCoeffs[i];
        visualHTML += `
            <div class="molecule">
                <div class="coefficient">${coeff}</div>
                <div class="formula">${f}</div>
            </div>
            ${i < result.products.length - 1 ? '<span class="plus-sign">+</span>' : ''}
        `;
    });
    visualHTML += '</div>';

    document.getElementById('molecule-visual').innerHTML = visualHTML;
    document.getElementById('balance-result').style.display = 'block';
}

function renderChemistryQuiz() {
    const app = document.getElementById('chemistry-quiz-app');
    app.innerHTML = `
        <div class="chemistry-app">
            <div class="app-section">
                <h3>📝 选择题型（可多选）</h3>
                <div class="quiz-type-selector">
                    <div class="quiz-type-btn selected" data-type="ionCoexistence" onclick="toggleQuizType(this)">
                        <div class="icon">🧪</div>
                        <div class="label">离子共存</div>
                    </div>
                    <div class="quiz-type-btn selected" data-type="naQuestions" onclick="toggleQuizType(this)">
                        <div class="icon">🔢</div>
                        <div class="label">NA计算</div>
                    </div>
                    <div class="quiz-type-btn selected" data-type="electrochemistry" onclick="toggleQuizType(this)">
                        <div class="icon">⚡</div>
                        <div class="label">电化学</div>
                    </div>
                    <div class="quiz-type-btn selected" data-type="reactionProcess" onclick="toggleQuizType(this)">
                        <div class="icon">📊</div>
                        <div class="label">反应历程图</div>
                    </div>
                    <div class="quiz-type-btn selected" data-type="experimentOperation" onclick="toggleQuizType(this)">
                        <div class="icon">🔬</div>
                        <div class="label">实验操作</div>
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <label>题目数量：</label>
                    <select id="question-count" style="padding: 8px; border-radius: 4px; margin-left: 10px;">
                        <option value="5">5题</option>
                        <option value="8" selected>8题</option>
                        <option value="10">10题</option>
                    </select>
                </div>
                <button class="btn btn-primary btn-block" style="margin-top: 20px;" onclick="generateNewQuiz()">
                    🎲 生成新的小练习
                </button>
            </div>

            <div id="quiz-container" class="quiz-container"></div>
        </div>
    `;
}

let selectedQuizTypes = ['ionCoexistence', 'naQuestions', 'electrochemistry', 'reactionProcess', 'experimentOperation'];

/**
 * 测验题型切换器 - 切换化学测验题型的选中状态（可多选）
 * @module toggleQuizType
 * @example window.toggleQuizType(btn)
 */
function toggleQuizType(btn) {
    btn.classList.toggle('selected');
    const type = btn.dataset.type;
    if (selectedQuizTypes.includes(type)) {
        selectedQuizTypes = selectedQuizTypes.filter(t => t !== type);
    } else {
        selectedQuizTypes.push(type);
    }
}

/**
 * 测验生成器 - 按所选题型和数量生成新的化学小练习
 * @module generateNewQuiz
 * @example window.generateNewQuiz()
 */
function generateNewQuiz() {
    if (selectedQuizTypes.length === 0) {
        alert('请至少选择一种题型！');
        return;
    }

    const count = parseInt(document.getElementById('question-count').value);
    const questions = chemistryQuizGenerator.generateQuiz(selectedQuizTypes, count);
    document.getElementById('quiz-container').innerHTML = chemistryQuizGenerator.renderQuiz(questions);
}

/**
 * 答案校验器 - 校验测验选项答案，标注正确/错误并显示解析开关
 * @module checkAnswer
 * @example window.checkAnswer(0, 1)
 */
function checkAnswer(questionIndex, optionIndex) {
    const questions = chemistryQuizGenerator.currentQuestions;
    const questionEl = document.querySelector(`[data-index="${questionIndex}"]`);
    const options = questionEl.querySelectorAll('.quiz-option');

    options.forEach(opt => {
        opt.style.pointerEvents = 'none';
    });

    const correctAnswer = questions[questionIndex].answer;

    if (optionIndex === correctAnswer) {
        options[optionIndex].classList.add('correct');
    } else {
        options[optionIndex].classList.add('incorrect');
        if (options[correctAnswer]) {
            options[correctAnswer].classList.add('correct');
        }
    }

    const answerToggle = questionEl.querySelector('.answer-toggle');
    if (answerToggle) {
        answerToggle.style.display = 'block';
    }
}
/**
 * 化学实验安全规范系统 - 规则库识别违规操作并评分（含广东卷考点）
 * @module chemistrySafetySystem
 * @example window.chemistrySafetySystem.renderSystem()
 */
const chemistrySafetySystem = {
    rules: [
        { id:'no-mouth-suction', title:'禁止口吸液体', category:'基本操作', level:'high', score:-30,
          keywords:['口吸','用嘴吸','嘴巴吸'], description:'禁止用嘴通过玻璃管或胶头滴管吸取液体，防止中毒或腐蚀', gdPoint:'广东卷必考：胶头滴管使用规范' },
        { id:'fire-handling', title:'酒精灯使用规范', category:'加热操作', level:'high', score:-25,
          keywords:['酒精灯','点燃','加热'], description:'酒精灯点燃应用火柴，不可用另一个燃着的酒精灯点火；熄灭时用灯帽盖灭，不可用嘴吹', gdPoint:'广东卷高频：酒精灯三禁止' },
        { id:'hot-object', title:'热物体处理', category:'加热操作', level:'high', score:-20,
          keywords:['热试管','热坩埚','烧杯','加热后'], description:'加热后的器皿应放在石棉网上冷却，不可直接放在桌面上', gdPoint:'' },
        { id:'acid-to-water', title:'酸入水原则', category:'液体混合', level:'high', score:-25,
          keywords:['稀释浓硫酸','浓硫酸加水','酸稀释','水入酸','将水倒入浓硫酸'], description:'稀释浓硫酸时，应将浓硫酸沿器壁缓缓加入水中，边加边搅拌。切忌将水倒入浓硫酸中！', gdPoint:'广东卷必考：浓硫酸稀释操作' },
        { id:'waste-disposal', title:'废液分类处理', category:'废物处理', level:'medium', score:-15,
          keywords:['废液','倒入水槽','废酸','废碱','下水道'], description:'废酸废碱应先中和再排放，有机废液应分类回收，不可随意倒入下水道', gdPoint:'广东卷：废液处理原则' },
        { id:'eye-protection', title:'护目镜佩戴', category:'个人防护', level:'high', score:-20,
          keywords:['腐蚀性液体','浓酸','浓碱','强酸','强碱','眼睛'], description:'使用腐蚀性液体时必须佩戴护目镜，防止溅入眼中', gdPoint:'' },
        { id:'fume-hood', title:'通风橱使用', category:'有毒气体', level:'high', score:-20,
          keywords:['有毒气体','氯气','氨气','硫化氢','制取氯气','NO₂'], description:'制取或使用有毒气体时应在通风橱中进行', gdPoint:'广东卷高频：有毒气体实验必须在通风橱' },
        { id:'gas-light', title:'气体点燃安全', category:'气体操作', level:'high', score:-30,
          keywords:['点燃氢气','氢气纯度','验纯','点燃可燃气体'], description:'点燃可燃性气体前必须验纯，防止爆炸', gdPoint:'广东卷必考：可燃气体验纯' },
        { id:'pressure-release', title:'试管口朝向', category:'加热操作', level:'medium', score:-15,
          keywords:['试管加热','液体加热','试管口'], description:'加热液体时试管口应朝向无人的方向，防止液体喷出伤人', gdPoint:'' },
        { id:'equipment-check', title:'仪器检查', category:'基本操作', level:'medium', score:-10,
          keywords:['装置气密性','检查气密','导管','连接'], description:'实验前应检查装置气密性，防止漏气或爆炸', gdPoint:'广东卷：气密性检查方法' },
        { id:'reagent-label', title:'试剂标识', category:'基本操作', level:'low', score:-5,
          keywords:['取用试剂','瓶盖','标签','放回'], description:'取用试剂后应立即盖好瓶盖，标签朝向手心，防止污染', gdPoint:'广东卷：试剂取用规范' },
        { id:'emergency-shower', title:'应急喷淋', category:'应急处理', level:'high', score:-15,
          keywords:['浓酸溅到','浓碱溅到','皮肤','衣服'], description:'若酸碱溅到皮肤或衣服上，应立即用大量清水冲洗', gdPoint:'广东卷：酸碱灼伤处理' },
        { id:'na-storage', title:'钠的保存与取用', category:'特殊试剂', level:'high', score:-25,
          keywords:['手拿钠','用手取钠','钠切','钠块'], description:'钠应保存在煤油中，取用时用镊子，在玻璃片上用小刀切割，滤纸吸干煤油', gdPoint:'广东卷高频：钠的保存取用' },
        { id:'hf-danger', title:'氢氟酸防护', category:'特殊试剂', level:'high', score:-30,
          keywords:['氢氟酸','HF'], description:'氢氟酸有剧毒且腐蚀玻璃，必须在塑料器皿中使用，戴防护手套', gdPoint:'' },
        { id:'organic-safety', title:'有机溶剂安全', category:'有机实验', level:'high', score:-20,
          keywords:['乙醇','乙醚','丙酮','苯','明火','有机溶剂'], description:'有机溶剂易燃，使用时远离明火，在通风处操作', gdPoint:'广东卷：有机实验安全' },
        { id:'glass-tube', title:'玻璃管连接安全', category:'基本操作', level:'medium', score:-10,
          keywords:['玻璃管插入','橡胶管','旋转'], description:'玻璃管插入橡胶管或胶塞时，应先用水润湿，旋转插入，不可用力过猛', gdPoint:'' },
        { id:'smell-gas', title:'闻气体气味', category:'基本操作', level:'medium', score:-10,
          keywords:['直接闻','鼻子凑近','闻气味'], description:'闻气体气味应用手在瓶口轻轻扇动，使少量气体飘进鼻孔，不可直接凑近闻', gdPoint:'广东卷必考：闻气味的正确方法' },
        { id:'filter-hot', title:'热过滤安全', category:'分离操作', level:'medium', score:-10,
          keywords:['趁热过滤','热过滤','烫伤'], description:'趁热过滤时应使用热过滤漏斗，注意防止烫伤', gdPoint:'' },
        { id:'distillation', title:'蒸馏安全', category:'分离操作', level:'high', score:-15,
          keywords:['蒸馏','沸石','暴沸','冷凝水'], description:'蒸馏时需加沸石防止暴沸；冷凝水从下口进上口出；不可蒸干', gdPoint:'广东卷高频：蒸馏操作要点' },
        { id:'titration-read', title:'滴定管读数', category:'定量实验', level:'medium', score:-10,
          keywords:['滴定管读数','仰视读数','俯视读数','视线'], description:'滴定管读数时视线应与液面凹液面最低点相平，仰视偏小俯视偏大', gdPoint:'广东卷必考：滴定管读数误差分析' }
    ],

    experiments: {
        '酸碱中和滴定': {
            icon: '🧪', difficulty: 3, category: '定量实验',
            steps: [
                { text:'检查滴定管是否漏水', safe:true, tip:'使用前必须检漏' },
                { text:'用蒸馏水洗涤滴定管', safe:true, tip:'洗涤2-3次' },
                { text:'用标准液润洗滴定管', safe:true, tip:'润洗液从滴定管口倒出，不可从下端放出' },
                { text:'装入标准液，排气泡，记录初读数', safe:true, tip:'注意排气泡和读数方法' },
                { text:'取待测液于锥形瓶中', safe:true, tip:'用移液管或量筒量取' },
                { text:'加入2-3滴酚酞指示剂', safe:true, tip:'指示剂用量不宜过多' },
                { text:'滴定至溶液刚好变色，半分钟不褪色', safe:true, tip:'滴定终点判断' },
                { text:'记录终读数，计算浓度', safe:true, tip:'重复2-3次取平均值' }
            ],
            dangerSteps: [
                { text:'用嘴吸取标准液装入滴定管', safe:false, ruleId:'no-mouth-suction', correctWay:'应将溶液从上方倒入滴定管' },
                { text:'仰视读取滴定管初读数', safe:false, ruleId:'titration-read', correctWay:'视线应与凹液面最低点相平' },
                { text:'将废液直接倒入水槽', safe:false, ruleId:'waste-disposal', correctWay:'废液应回收处理' }
            ],
            safetyPoints: [
                { step:2, rule:'acid-to-water', note:'润洗是少量多次，润洗液从滴定管口倒出' },
                { step:6, rule:'eye-protection', note:'注意酚酞指示剂的正确使用' }
            ]
        },
        '氯气制取与性质': {
            icon: '☁️', difficulty: 4, category: '气体制备',
            steps: [
                { text:'检查装置气密性', safe:true, tip:'用手捂法或加热法检查' },
                { text:'向圆底烧瓶中加入二氧化锰', safe:true, tip:'用药匙或纸槽加入' },
                { text:'向分液漏斗中加入浓盐酸', safe:true, tip:'浓盐酸有腐蚀性，注意防护' },
                { text:'缓缓滴加浓盐酸并加热', safe:true, tip:'控制反应速率' },
                { text:'用向上排空气法收集氯气', safe:true, tip:'氯气密度大于空气' },
                { text:'多余氯气用氢氧化钠溶液吸收', safe:true, tip:'尾气处理防止污染' }
            ],
            dangerSteps: [
                { text:'在室内直接制取氯气不用通风橱', safe:false, ruleId:'fume-hood', correctWay:'氯气有毒，必须在通风橱中制取' },
                { text:'用手直接闻氯气气味', safe:false, ruleId:'smell-gas', correctWay:'应用手扇动法闻气味' },
                { text:'将氯气直接排放到空气中', safe:false, ruleId:'waste-disposal', correctWay:'必须用NaOH溶液吸收尾气' }
            ],
            safetyPoints: [
                { step:2, rule:'no-mouth-suction', note:'浓盐酸具有强腐蚀性' },
                { step:4, rule:'fume-hood', note:'氯气有毒，制取应在通风橱中进行' },
                { step:5, rule:'waste-disposal', note:'废液用氢氧化钠溶液吸收' }
            ]
        },
        '钠与水反应': {
            icon: '💥', difficulty: 3, category: '元素化合物',
            steps: [
                { text:'用镊子取出一小块钠', safe:true, tip:'不可用手直接接触' },
                { text:'用滤纸吸干表面的煤油', safe:true, tip:'除去表面煤油' },
                { text:'在玻璃片上用小刀切取绿豆大小', safe:true, tip:'切割时注意安全' },
                { text:'将钠小心放入烧杯中的水里', safe:true, tip:'轻轻放入，不可抛入' },
                { text:'观察反应现象', safe:true, tip:'浮→熔→游→响→红' },
                { text:'向反应后的溶液中滴加酚酞', safe:true, tip:'验证生成NaOH' }
            ],
            dangerSteps: [
                { text:'用手直接拿取金属钠', safe:false, ruleId:'na-storage', correctWay:'必须用镊子取用' },
                { text:'将大块钠投入水中', safe:false, ruleId:'pressure-release', correctWay:'应切取绿豆大小，小块放入' },
                { text:'将钠放入密闭容器中加水', safe:false, ruleId:'gas-light', correctWay:'密闭容器中产生的H₂可能爆炸' }
            ],
            safetyPoints: [
                { step:0, rule:'na-storage', note:'钠必须用镊子取用，不可用手直接接触' },
                { step:3, rule:'fire-handling', note:'钠与水反应剧烈，可能产生氢气燃烧' },
                { step:3, rule:'pressure-release', note:'烧杯口不可对人，防止碱液飞溅' }
            ]
        },
        '浓硫酸稀释': {
            icon: '⚠️', difficulty: 2, category: '基本操作',
            steps: [
                { text:'计算出所需浓硫酸的体积', safe:true, tip:'先计算后操作' },
                { text:'向烧杯中加入适量蒸馏水', safe:true, tip:'先加水' },
                { text:'用胶头滴管吸取浓硫酸', safe:true, tip:'不可用嘴吸' },
                { text:'沿器壁缓缓将浓硫酸滴入水中', safe:true, tip:'酸入水，不可水入酸' },
                { text:'边滴加边用玻璃棒搅拌', safe:true, tip:'及时散热' },
                { text:'冷却后装瓶贴标签', safe:true, tip:'标注名称和浓度' }
            ],
            dangerSteps: [
                { text:'将水倒入浓硫酸中', safe:false, ruleId:'acid-to-water', correctWay:'必须将浓硫酸缓缓加入水中！水入酸会沸腾飞溅' },
                { text:'用嘴吸取浓硫酸', safe:false, ruleId:'no-mouth-suction', correctWay:'绝对禁止用嘴吸取，应使用胶头滴管' },
                { text:'不戴护目镜操作浓硫酸', safe:false, ruleId:'eye-protection', correctWay:'浓硫酸有强腐蚀性，必须佩戴护目镜' }
            ],
            safetyPoints: [
                { step:3, rule:'acid-to-water', note:'必须酸入水，不可水入酸' },
                { step:4, rule:'eye-protection', note:'浓硫酸具有强腐蚀性，注意防护' },
                { step:2, rule:'no-mouth-suction', note:'绝对禁止用嘴吸取浓硫酸' }
            ]
        },
        '蒸馏操作': {
            icon: '🔥', difficulty: 3, category: '分离提纯',
            steps: [
                { text:'组装蒸馏装置，检查气密性', safe:true, tip:'从下到上，从左到右组装' },
                { text:'向蒸馏烧瓶中加入待分离液体', safe:true, tip:'液体量不超过烧瓶容积的2/3' },
                { text:'加入几粒沸石', safe:true, tip:'防止暴沸，不可在加热后补加' },
                { text:'插入温度计，水银球位于支管口', safe:true, tip:'测量蒸气温度' },
                { text:'通入冷凝水（下进上出）', safe:true, tip:'冷凝水从下口进上口出' },
                { text:'加热蒸馏，收集馏分', safe:true, tip:'控制加热温度' },
                { text:'蒸馏结束，先停止加热后关冷凝水', safe:true, tip:'注意操作顺序' }
            ],
            dangerSteps: [
                { text:'加热时忘记加沸石', safe:false, ruleId:'distillation', correctWay:'必须加沸石防止暴沸' },
                { text:'冷凝水从上口进下口出', safe:false, ruleId:'distillation', correctWay:'冷凝水应下进上出，充分冷却' },
                { text:'将液体蒸干', safe:false, ruleId:'distillation', correctWay:'不可蒸干，防止过热爆炸' }
            ],
            safetyPoints: [
                { step:2, rule:'distillation', note:'沸石防止暴沸' },
                { step:4, rule:'distillation', note:'冷凝水方向' }
            ]
        },
        '氢气制取与点燃': {
            icon: '🎈', difficulty: 4, category: '气体制备',
            steps: [
                { text:'检查装置气密性', safe:true, tip:'制气前必检' },
                { text:'向试管中加入锌粒', safe:true, tip:'先固后液' },
                { text:'通过分液漏斗加入稀硫酸', safe:true, tip:'控制反应速率' },
                { text:'收集氢气并验纯', safe:true, tip:'用向下排空气法或排水法收集' },
                { text:'验纯后点燃氢气', safe:true, tip:'听到"噗"声为纯' }
            ],
            dangerSteps: [
                { text:'不验纯直接点燃氢气', safe:false, ruleId:'gas-light', correctWay:'点燃前必须验纯！不纯会爆炸' },
                { text:'用向上排空气法收集氢气', safe:false, ruleId:'equipment-check', correctWay:'氢气密度小于空气，应用向下排空气法' },
                { text:'在密闭容器中点燃氢气', safe:false, ruleId:'gas-light', correctWay:'必须在开放环境中点燃' }
            ],
            safetyPoints: [
                { step:3, rule:'gas-light', note:'可燃气体点燃前必须验纯' }
            ]
        },
        '乙醇的催化氧化': {
            icon: '🍷', difficulty: 3, category: '有机实验',
            steps: [
                { text:'向试管中加入少量乙醇', safe:true, tip:'有机溶剂，远离明火' },
                { text:'将铜丝在酒精灯上灼烧至变黑', safe:true, tip:'Cu→CuO' },
                { text:'迅速将灼热的铜丝插入乙醇中', safe:true, tip:'CuO+CH₃CH₂OH→Cu+CH₃CHO+H₂O' },
                { text:'观察铜丝由黑变红，闻气味', safe:true, tip:'生成乙醛有刺激性气味' },
                { text:'用手扇动法闻气味', safe:true, tip:'不可直接凑近闻' }
            ],
            dangerSteps: [
                { text:'在明火旁直接倒乙醇', safe:false, ruleId:'organic-safety', correctWay:'乙醇易燃，远离明火操作' },
                { text:'直接将鼻子凑近试管闻气味', safe:false, ruleId:'smell-gas', correctWay:'应用手扇动法闻气味' },
                { text:'将废乙醇倒入水槽', safe:false, ruleId:'waste-disposal', correctWay:'有机废液应回收处理' }
            ],
            safetyPoints: [
                { step:0, rule:'organic-safety', note:'乙醇易燃，注意防火' },
                { step:4, rule:'smell-gas', note:'闻气味方法' }
            ]
        },
        '乙酸乙酯的制取': {
            icon: '🧴', difficulty: 3, category: '有机实验',
            steps: [
                { text:'向试管中加入乙醇和乙酸', safe:true, tip:'先加乙醇再加乙酸' },
                { text:'缓缓加入浓硫酸', safe:true, tip:'浓硫酸作催化剂和吸水剂' },
                { text:'加入碎瓷片防止暴沸', safe:true, tip:'加热前必须加沸石/碎瓷片' },
                { text:'小火加热', safe:true, tip:'控制温度防止副反应' },
                { text:'将产生的蒸气通入饱和Na₂CO₃溶液', safe:true, tip:'吸收乙醇和乙酸，溶解乙醇' },
                { text:'在液面上收集到透明油状液体', safe:true, tip:'即为乙酸乙酯' }
            ],
            dangerSteps: [
                { text:'不加碎瓷片直接加热', safe:false, ruleId:'distillation', correctWay:'必须加碎瓷片防止暴沸' },
                { text:'将浓硫酸快速倒入混合液中', safe:false, ruleId:'acid-to-water', correctWay:'应沿器壁缓缓加入' },
                { text:'在明火旁操作乙醇', safe:false, ruleId:'organic-safety', correctWay:'乙醇易燃，远离明火' }
            ],
            safetyPoints: [
                { step:1, rule:'acid-to-water', note:'浓硫酸加入方式' },
                { step:2, rule:'distillation', note:'碎瓷片防暴沸' },
                { step:3, rule:'organic-safety', note:'乙醇易燃' }
            ]
        }
    },

    emergencyGuide: [
        { type:'酸灼伤', icon:'🧪', steps:['立即用大量清水冲洗15分钟以上','再用3-5% NaHCO₃溶液冲洗','严重者送医'], gdPoint:'广东卷：酸灼伤处理步骤' },
        { type:'碱灼伤', icon:'⚗️', steps:['立即用大量清水冲洗15分钟以上','再用2%硼酸溶液冲洗','严重者送医'], gdPoint:'' },
        { type:'酸溅入眼', icon:'👁️', steps:['立即用大量清水冲洗眼睛15分钟','边冲洗边眨眼','立即送医，不可拖延'], gdPoint:'广东卷必考：眼灼伤处理' },
        { type:'酒精灯失火', icon:'🔥', steps:['用湿抹布盖灭','不可用水浇灭（酒精比水轻）','不可用嘴吹'], gdPoint:'广东卷：酒精灯灭火方法' },
        { type:'化学品泄漏', icon:'☢️', steps:['立即通风','用沙土覆盖吸收','不可直接用水冲洗','通知老师处理'], gdPoint:'' },
        { type:'割伤处理', icon:'🩹', steps:['用双氧水或碘酒消毒伤口','用创可贴或纱布包扎','严重者送医'], gdPoint:'' },
        { type:'中毒急救', icon:'💊', steps:['立即将患者移至通风处','解开衣领保持呼吸通畅','拨打120急救','保留毒物信息供医生参考'], gdPoint:'' }
    ],

    state: {
        currentExperiment: null,
        selectedSteps: [],
        studentLog: [],
        score: 100,
        violations: [],
        mode: 'guided',
        showEmergency: false,
        showRules: false,
        history: []
    },

    selectExperiment(expName) {
        this.state.currentExperiment = expName;
        this.state.selectedSteps = [];
        this.state.studentLog = [];
        this.state.score = 100;
        this.state.violations = [];
        this.state.mode = 'guided';
        this.renderSystem();
    },

    selectStep(stepIndex) {
        const exp = this.experiments[this.state.currentExperiment];
        if (!exp) return;
        const step = exp.steps[stepIndex];
        if (!step) return;

        this.state.selectedSteps.push(stepIndex);
        this.state.studentLog.push({
            operation: step.text,
            timestamp: new Date().toLocaleString('zh-CN'),
            safe: step.safe,
            violations: [],
            pointsDeducted: 0,
            tip: step.tip
        });
        this.renderSystem();
    },

    selectDangerStep(stepIndex) {
        const exp = this.experiments[this.state.currentExperiment];
        if (!exp) return;
        const step = exp.dangerSteps[stepIndex];
        if (!step) return;

        const rule = this.rules.find(r => r.id === step.ruleId);
        this.state.violations.push({ operation: step.text, rule, correctWay: step.correctWay });
        this.state.score = Math.max(0, this.state.score + rule.score);

        this.state.studentLog.push({
            operation: step.text,
            timestamp: new Date().toLocaleString('zh-CN'),
            safe: false,
            violations: [rule],
            pointsDeducted: rule.score,
            correctWay: step.correctWay
        });
        this.renderSystem();
    },

    logOperation(operation) {
        if (!operation || !operation.trim()) return;
        const log = { operation: operation.trim(), timestamp: new Date().toLocaleString('zh-CN'), violations: [], pointsDeducted: 0, safe: true };
        this.rules.forEach(rule => {
            if (rule.keywords.some(kw => operation.includes(kw))) {
                log.violations.push(rule);
                log.pointsDeducted += rule.score;
                log.safe = false;
                this.state.violations.push({ operation, rule, correctWay: rule.description });
                this.state.score = Math.max(0, this.state.score + rule.score);
            }
        });
        this.state.studentLog.push(log);
        this.renderSystem();
    },

    evaluateExperiment() {
        const grade = this.getGrade(this.state.score);
        this.state.history.push({
            experiment: this.state.currentExperiment,
            score: this.state.score,
            grade,
            violations: this.state.violations.length,
            timestamp: new Date().toLocaleString('zh-CN')
        });
        localStorage.setItem('safety_history', JSON.stringify(this.state.history));
        this.renderSystem();
    },

    resetExperiment() {
        this.state.selectedSteps = [];
        this.state.studentLog = [];
        this.state.score = 100;
        this.state.violations = [];
        this.renderSystem();
    },

    toggleEmergency() {
        this.state.showEmergency = !this.state.showEmergency;
        this.renderSystem();
    },

    toggleRules() {
        this.state.showRules = !this.state.showRules;
        this.renderSystem();
    },

    getGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 70) return 'B';
        if (score >= 50) return 'C';
        return 'D';
    },

    getGradeDesc(grade) {
        return { A:'优秀 - 安全意识强，操作规范', B:'良好 - 基本掌握安全操作', C:'及格 - 存在安全隐患，需加强', D:'不及格 - 安全意识不足' }[grade] || '';
    },

    getGradeColor(grade) {
        return { A:'#27ae60', B:'#f39c12', C:'#e67e22', D:'#e74c3c' }[grade] || '#999';
    },

    _renderScoreRing() {
        const score = this.state.score;
        const grade = this.getGrade(score);
        const color = this.getGradeColor(grade);
        const pct = score / 100;
        const r = 45, cx = 55, cy = 55;
        const circ = 2 * Math.PI * r;
        const offset = circ * (1 - pct);
        return '<svg viewBox="0 0 110 110" class="score-ring-svg">' +
            '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#e8e8e8" stroke-width="8"/>' +
            '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="8" ' +
                'stroke-dasharray="'+circ+'" stroke-dashoffset="'+offset+'" ' +
                'transform="rotate(-90 '+cx+' '+cy+')" stroke-linecap="round"/>' +
            '<text x="'+cx+'" y="'+(cy-5)+'" text-anchor="middle" fill="'+color+'" font-size="24" font-weight="bold">'+score+'</text>' +
            '<text x="'+cx+'" y="'+(cy+15)+'" text-anchor="middle" fill="#999" font-size="12">'+grade+'级</text>' +
        '</svg>';
    },

    renderSystem() {
        const app = document.getElementById('chemistry-safety-app');
        if (!app) return;

        const expNames = Object.keys(this.experiments);
        const exp = this.experiments[this.state.currentExperiment];
        const grade = this.getGrade(this.state.score);
        const gradeColor = this.getGradeColor(grade);
        const isEvaluated = this.state.studentLog.length > 0 && this.state.studentLog.every(l => l.safe === false || l.safe === true) && this.state.violations.length > 0 || this.state.score < 100;

        app.innerHTML = `
        <div class="chemistry-safety">
            <div class="safety-header">
                <h3>⚗️ 化学实验安全评判系统 <span class="gd-badge">广东卷专用</span></h3>
                <p class="safety-intro">选择实验场景，模拟实验操作，系统将自动评估安全操作规范</p>
            </div>

            <div class="safety-toolbar">
                <button class="st-btn ${this.state.showEmergency?'st-act':''}" onclick="chemistrySafetySystem.toggleEmergency()">🚑 应急处理指南</button>
                <button class="st-btn ${this.state.showRules?'st-act':''}" onclick="chemistrySafetySystem.toggleRules()">📖 安全规则库(${this.rules.length}条)</button>
                <button class="st-btn" onclick="chemistrySafetySystem.exportReport()">📄 导出报告</button>
            </div>

            ${this.state.showEmergency ? `
            <div class="emergency-panel">
                <h4>🚑 应急处理指南</h4>
                <div class="emergency-grid">
                    ${this.emergencyGuide.map(e => `
                        <div class="emergency-card">
                            <div class="ec-header"><span class="ec-icon">${e.icon}</span><span class="ec-type">${e.type}</span></div>
                            <ol class="ec-steps">${e.steps.map(s => '<li>'+s+'</li>').join('')}</ol>
                            ${e.gdPoint ? '<div class="ec-gd">⭐ '+e.gdPoint+'</div>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${this.state.showRules ? `
            <div class="rules-panel">
                <h4>📖 安全规则库 (${this.rules.length}条)</h4>
                <div class="rules-grid">
                    ${this.rules.map(r => `
                        <div class="rule-card ${r.level==='high'?'rule-high':r.level==='medium'?'rule-medium':'rule-low'}">
                            <div class="rule-title">${r.title}</div>
                            <div class="rule-level">${r.level==='high'?'⚠️ 高危':r.level==='medium'?'⚡ 中危':'💡 低危'}</div>
                            <div class="rule-desc">${r.description}</div>
                            <div class="rule-score">${r.score}分</div>
                            ${r.gdPoint ? '<div class="rule-gd">⭐ '+r.gdPoint+'</div>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <div class="exp-selector">
                <h4>🧪 选择实验场景 (${expNames.length}个)</h4>
                <div class="exp-buttons">
                    ${expNames.map(name => {
                        const e = this.experiments[name];
                        return '<button class="exp-btn '+(this.state.currentExperiment===name?'exp-active':'')+'" onclick="chemistrySafetySystem.selectExperiment(\''+name+'\')">' +
                            '<span class="eb-icon">'+e.icon+'</span>' +
                            '<span class="eb-name">'+name+'</span>' +
                            '<span class="eb-diff">'+('⭐'.repeat(e.difficulty))+'</span>' +
                            '<span class="eb-cat">'+e.category+'</span>' +
                        '</button>';
                    }).join('')}
                </div>
            </div>

            ${exp ? `
            <div class="exp-detail">
                <div class="ed-header">
                    <h4>${exp.icon} ${this.state.currentExperiment}</h4>
                    <div class="ed-score">${this._renderScoreRing()}</div>
                </div>

                <div class="ed-body">
                    <div class="ed-steps">
                        <h5>✅ 正确操作步骤</h5>
                        <div class="steps-list">
                            ${exp.steps.map((step, i) => {
                                const done = this.state.selectedSteps.includes(i);
                                return '<div class="step-item '+(done?'step-done':'')+'" onclick="chemistrySafetySystem.selectStep('+i+')">' +
                                    '<span class="step-num">'+(i+1)+'</span>' +
                                    '<span class="step-text">'+step.text+'</span>' +
                                    (done ? '<span class="step-check">✓</span>' : '<span class="step-hint">点击执行</span>') +
                                '</div>';
                            }).join('')}
                        </div>

                        ${exp.dangerSteps && exp.dangerSteps.length > 0 ? `
                        <h5 class="danger-heading">❌ 危险操作（点击查看后果）</h5>
                        <div class="danger-steps">
                            ${exp.dangerSteps.map((step, i) => `
                                <div class="danger-step" onclick="chemistrySafetySystem.selectDangerStep(${i})">
                                    <span class="ds-icon">⚠️</span>
                                    <span class="ds-text">${step.text}</span>
                                    <span class="ds-hint">点击查看</span>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>

                    <div class="ed-ops">
                        <h5>📝 自由操作记录</h5>
                        <div class="quick-ops">
                            <input type="text" id="op-input" placeholder="输入您的操作步骤..."
                                   onkeypress="if(event.key==='Enter')chemistrySafetySystem.logOperation(this.value)">
                            <button class="btn btn-primary" onclick="chemistrySafetySystem.logOperation(document.getElementById('op-input').value)">记录</button>
                        </div>
                        <div class="common-ops">
                            <p>快捷操作：</p>
                            <div class="op-chips">
                                ${this._getQuickOps().map(op =>
                                    '<button class="op-chip" onclick="chemistrySafetySystem.logOperation(\''+op.text+'\')">'+op.label+'</button>'
                                ).join('')}
                            </div>
                        </div>

                        <div class="op-log">
                            ${this.state.studentLog.length === 0 ? '<p class="no-log">暂无操作记录</p>' :
                                '<h5>操作历史 ('+this.state.studentLog.length+'步)</h5>' +
                                this.state.studentLog.map((log, i) => {
                                    const hasV = log.violations && log.violations.length > 0;
                                    return '<div class="log-item '+(hasV?'log-error':'log-ok')+'">' +
                                        '<div class="log-header">' +
                                            '<span class="log-num">#'+(i+1)+'</span>' +
                                            '<span class="log-time">'+log.timestamp+'</span>' +
                                            (hasV ? '<span class="log-deduct">'+log.pointsDeducted+'分</span>' : '<span class="log-ok-badge">✓ 安全</span>') +
                                        '</div>' +
                                        '<div class="log-op">'+log.operation+'</div>' +
                                        (hasV ? '<div class="log-violations">'+log.violations.map(v => '<span class="violation-tag">'+v.title+'</span>').join('')+'</div>' : '') +
                                        (hasV && log.correctWay ? '<div class="log-correct">✅ 正确做法：'+log.correctWay+'</div>' : '') +
                                        (log.tip && !hasV ? '<div class="log-tip">💡 '+log.tip+'</div>' : '') +
                                    '</div>';
                                }).join('')
                            }
                            ${this.state.studentLog.length > 0 ? '<div class="current-score">当前得分：<strong style="color:'+gradeColor+'">'+this.state.score+'</strong> 分</div>' : ''}
                        </div>

                        <div class="eval-panel">
                            <button class="btn btn-success btn-block" onclick="chemistrySafetySystem.evaluateExperiment()">🔍 提交评估</button>
                            <button class="btn btn-secondary" onclick="chemistrySafetySystem.resetExperiment()">🔄 重新开始</button>
                        </div>
                    </div>
                </div>

                ${this.state.violations.length > 0 ? `
                <div class="safety-result">
                    <div class="safety-result-card">
                        <div class="result-header" style="border-color: ${gradeColor}">
                            <div class="grade-badge" style="background: ${gradeColor}">${grade}</div>
                            <div class="score-display">
                                <span class="score-label">实验安全评分</span>
                                <span class="score-value" style="color:${gradeColor}">${this.state.score}</span>
                            </div>
                        </div>
                        <div class="result-summary">
                            <p>共记录 ${this.state.studentLog.length} 步操作</p>
                            <p>发现 <strong style="color:#e74c3c">${this.state.violations.length}</strong> 处安全隐患</p>
                            <p>安全等级：<strong style="color: ${gradeColor}">${this.getGradeDesc(grade)}</strong></p>
                        </div>
                        <div class="violations-list">
                            <h4>⚠️ 安全隐患详情</h4>
                            ${this.state.violations.map((v, i) => `
                                <div class="violation-item">
                                    <div class="violation-header">
                                        <span class="violation-num">#${i + 1}</span>
                                        <span class="violation-title">${v.rule.title}</span>
                                        <span class="violation-score" style="color: #ff4444">${v.rule.score}分</span>
                                    </div>
                                    <p class="violation-op">操作：${v.operation}</p>
                                    <p class="violation-desc">${v.rule.description}</p>
                                    ${v.correctWay ? '<p class="violation-correct">✅ 正确做法：'+v.correctWay+'</p>' : ''}
                                    ${v.rule.gdPoint ? '<p class="violation-gd">⭐ '+v.rule.gdPoint+'</p>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ` : this.state.studentLog.length > 0 ? '<div class="safe-badge">✓ 暂未发现安全隐患，继续保持！</div>' : ''}
            </div>
            ` : `
            <div class="safety-welcome">
                <div class="sw-icon">⚗️</div>
                <h4>欢迎来到化学实验安全评判系统</h4>
                <p>选择实验场景开始模拟操作</p>
                <div class="sw-features">
                    <div class="sw-f">✅ ${expNames.length}个实验场景</div>
                    <div class="sw-f">✅ ${this.rules.length}条安全规则</div>
                    <div class="sw-f">✅ ${this.emergencyGuide.length}项应急指南</div>
                    <div class="sw-f">✅ 广东卷考点适配</div>
                </div>
            </div>
            `}
        </div>`;
    },

    _getQuickOps() {
        const exp = this.experiments[this.state.currentExperiment];
        const base = [
            { label:'佩戴护目镜', text:'佩戴护目镜' },
            { label:'打开通风橱', text:'打开通风橱' },
            { label:'检查气密性', text:'检查装置气密性' },
            { label:'点燃酒精灯', text:'点燃酒精灯' }
        ];
        const danger = [
            { label:'水入酸(错误)', text:'将水倒入浓硫酸中' },
            { label:'废液倒入水槽', text:'将废液倒入下水道' },
            { label:'手拿钠(错误)', text:'用手直接拿取金属钠' },
            { label:'直接闻气味', text:'直接将鼻子凑近闻气味' }
        ];
        return [...base, ...danger];
    },

    exportReport() {
        if (this.state.studentLog.length === 0) { alert('请先进行实验操作'); return; }
        const grade = this.getGrade(this.state.score);
        let content = '化学实验安全评判报告\n========================\n\n';
        content += '实验：' + this.state.currentExperiment + '\n';
        content += '安全评分：' + this.state.score + ' 分 (' + grade + '级)\n';
        content += '安全等级：' + this.getGradeDesc(grade) + '\n';
        content += '操作步骤：' + this.state.studentLog.length + '步\n';
        content += '安全隐患：' + this.state.violations.length + '处\n\n';
        if (this.state.violations.length > 0) {
            content += '--- 安全隐患详情 ---\n';
            this.state.violations.forEach((v, i) => {
                content += (i+1) + '. ' + v.rule.title + ' (' + v.rule.score + '分)\n';
                content += '   操作：' + v.operation + '\n';
                content += '   说明：' + v.rule.description + '\n';
                if (v.correctWay) content += '   正确做法：' + v.correctWay + '\n';
                content += '\n';
            });
        }
        content += '========================\n导出时间：' + new Date().toLocaleString('zh-CN') + '\n';
        const blob = new Blob([content], {type:'text/plain;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '化学实验安全报告.txt';
        a.click();
        URL.revokeObjectURL(url);
    }
};
/**
 * 电化学可视化器 - 原电池/电解池原理动画，含电极反应与离子迁移
 * @module electrochemistryViewer
 * @example window.electrochemistryViewer.renderViewer()
 */
const electrochemistryViewer = {
    state: {
        currentType: 'galvanic',
        currentExample: null,
        isAnimating: false,
        animFrameId: null,
        particles: [],
        speed: 1,
        showLabels: true
    },

    examples: {
        galvanic: [
            {
                id: 'zn-cu-h2so4', name: 'Zn-Cu原电池（硫酸介质）', icon: '🔋',
                description: '锌铜原电池，稀硫酸为电解质溶液',
                electrodes: {
                    anode: { material:'Zn', name:'锌棒(负极)', reaction:'Zn - 2e⁻ = Zn²⁺', type:'oxidation', color:'#71797E' },
                    cathode: { material:'Cu', name:'铜棒(正极)', reaction:'2H⁺ + 2e⁻ = H₂↑', type:'reduction', color:'#b87333' }
                },
                electrolyte: '稀H₂SO₄溶液', electrolyteColor: '#d4edfc',
                ionFlow: 'SO₄²⁻向负极迁移，H⁺向正极迁移',
                electronFlow: 'Zn → 导线 → Cu（外电路）',
                overall: 'Zn + H₂SO₄ = ZnSO₄ + H₂↑',
                features: ['锌棒逐渐溶解变细', '铜棒表面有气泡冒出(H₂)', '电流表指针偏转', '溶液蓝色不变'],
                gdPoints: ['广东卷必考：正负极判断方法', '广东卷高频：原电池电子流向', '广东卷：电极反应式的书写']
            },
            {
                id: 'fe-o2', name: '钢铁吸氧腐蚀', icon: '🔩',
                description: '铁在潮湿空气中发生的电化学腐蚀',
                electrodes: {
                    anode: { material:'Fe', name:'铁(负极)', reaction:'Fe - 2e⁻ = Fe²⁺', type:'oxidation', color:'#5c5c5c' },
                    cathode: { material:'C', name:'碳(正极)', reaction:'O₂ + 2H₂O + 4e⁻ = 4OH⁻', type:'reduction', color:'#36454F' }
                },
                electrolyte: '水膜(含O₂)', electrolyteColor: '#e8f5e9',
                ionFlow: 'Fe²⁺和OH⁻在水膜中迁移',
                electronFlow: 'Fe → C（铁碳微电池）',
                overall: '2Fe + O₂ + 2H₂O = 2Fe(OH)₂',
                features: ['铁表面产生红褐色锈斑', '属于吸氧腐蚀', '水膜中性或弱酸性', '最终生成Fe₂O₃·xH₂O'],
                gdPoints: ['广东卷必考：吸氧腐蚀vs析氢腐蚀', '广东卷高频：正极反应式书写', '广东卷：防腐蚀方法']
            },
            {
                id: 'daniel', name: '丹尼尔电池(盐桥)', icon: '🔬',
                description: '经典的铜-锌硫酸铜原电池，含盐桥',
                electrodes: {
                    anode: { material:'Zn', name:'锌极(负极)', reaction:'Zn - 2e⁻ = Zn²⁺', type:'oxidation', color:'#71797E' },
                    cathode: { material:'Cu', name:'铜极(正极)', reaction:'Cu²⁺ + 2e⁻ = Cu', type:'reduction', color:'#b87333' }
                },
                electrolyte: 'ZnSO₄溶液 | CuSO₄溶液', electrolyteColor: '#d4edfc',
                ionFlow: '盐桥中：K⁺→CuSO₄侧，Cl⁻→ZnSO₄侧',
                electronFlow: 'Zn → 导线 → Cu（外电路）',
                overall: 'Zn + CuSO₄ = ZnSO₄ + Cu',
                features: ['锌极溶解，铜极镀铜', '盐桥维持电中性', '电动势约1.1V', '两个半电池分开'],
                gdPoints: ['广东卷必考：盐桥的作用和离子迁移方向', '广东卷：盐桥中离子如何选择迁移', '广东卷：双液原电池vs单液原电池']
            },
            {
                id: 'li-battery', name: '锂电池原理', icon: '📱',
                description: '锂离子电池充放电原理',
                electrodes: {
                    anode: { material:'C', name:'石墨(负极)', reaction:'LiₓC₆ - xe⁻ = xLi⁺ + C₆', type:'oxidation', color:'#333' },
                    cathode: { material:'LiCoO₂', name:'钴酸锂(正极)', reaction:'Li₁₋ₓCoO₂ + xLi⁺ + xe⁻ = LiCoO₂', type:'reduction', color:'#2196F3' }
                },
                electrolyte: '有机电解液(含Li⁺)', electrolyteColor: '#fff9c4',
                ionFlow: 'Li⁺在正负极间往返迁移(摇椅电池)',
                electronFlow: '放电：C → 导线 → LiCoO₂',
                overall: 'LiₓC₆ + Li₁₋ₓCoO₂ ⇌ C₆ + LiCoO₂',
                features: ['Li⁺在正负极间嵌入/脱出', '充电时Li⁺从正极→负极', '放电时Li⁺从负极→正极', '能量密度高'],
                gdPoints: ['广东卷：新型电池电极反应式书写', '广东卷：充电/放电时Li⁺迁移方向', '广东卷：新型化学电源分析']
            }
        ],
        electrolytic: [
            {
                id: 'cuso4', name: '电镀铜(电解CuSO₄)', icon: '🪙',
                description: '用铜作电极电解硫酸铜溶液——电镀原理',
                electrodes: {
                    anode: { material:'Cu', name:'铜棒(阳极)', reaction:'Cu - 2e⁻ = Cu²⁺', type:'oxidation', color:'#b87333' },
                    cathode: { material:'Fe', name:'铁棒(阴极)', reaction:'Cu²⁺ + 2e⁻ = Cu', type:'reduction', color:'#5c5c5c' }
                },
                electrolyte: 'CuSO₄溶液', electrolyteColor: '#bbdefb',
                ionFlow: 'Cu²⁺向阴极迁移，SO₄²⁻向阳极迁移',
                electronFlow: '电源负极 → 阴极 → 阳极 → 电源正极',
                overall: '阳极Cu溶解 = 阴极Cu析出（电镀）',
                features: ['阳极铜逐渐溶解', '阴极铁表面镀上铜', '电解质浓度不变', '属于电镀原理'],
                gdPoints: ['广东卷必考：电镀条件（阳极材料=镀层金属）', '广东卷：电解池电极判断', '广东卷：电镀时电解质浓度变化']
            },
            {
                id: 'nacl', name: '电解饱和食盐水(氯碱工业)', icon: '🏭',
                description: '氯碱工业的核心反应——离子交换膜法',
                electrodes: {
                    anode: { material:'C', name:'钛网(阳极)', reaction:'2Cl⁻ - 2e⁻ = Cl₂↑', type:'oxidation', color:'#36454F' },
                    cathode: { material:'Fe', name:'钢网(阴极)', reaction:'2H₂O + 2e⁻ = H₂↑ + 2OH⁻', type:'reduction', color:'#5c5c5c' }
                },
                electrolyte: '饱和NaCl溶液', electrolyteColor: '#e0f7fa',
                ionFlow: 'Na⁺通过离子交换膜向阴极迁移',
                electronFlow: '电源负极 → 阴极 → 阳极 → 电源正极',
                overall: '2NaCl + 2H₂O = 2NaOH + H₂↑ + Cl₂↑',
                features: ['阳极产生黄绿色Cl₂', '阴极产生无色H₂', '阴极区生成NaOH溶液', '离子交换膜阻止Cl⁻和OH⁻混合'],
                gdPoints: ['广东卷必考：离子交换膜的作用', '广东卷高频：氯碱工业电极反应式', '广东卷：阳离子交换膜只允许阳离子通过']
            },
            {
                id: 'h2so4', name: '电解水', icon: '💧',
                description: '酸性条件下电解水生成氢气和氧气',
                electrodes: {
                    anode: { material:'Pt', name:'铂电极(阳极)', reaction:'2H₂O - 4e⁻ = O₂↑ + 4H⁺', type:'oxidation', color:'#c0c0c0' },
                    cathode: { material:'Pt', name:'铂电极(阴极)', reaction:'2H⁺ + 2e⁻ = H₂↑', type:'reduction', color:'#c0c0c0' }
                },
                electrolyte: '稀H₂SO₄溶液', electrolyteColor: '#f3e5f5',
                ionFlow: 'H⁺向阴极迁移，SO₄²⁻向阳极迁移',
                electronFlow: '电源负极 → 阴极 → 阳极 → 电源正极',
                overall: '2H₂O = 2H₂↑ + O₂↑',
                features: ['阳极产生O₂(气泡少)', '阴极产生H₂(气泡多)', 'V(H₂):V(O₂)=2:1', '实际电解的是水'],
                gdPoints: ['广东卷必考：电解水体积比2:1', '广东卷：用惰性电极电解含氧酸实质是电解水', '广东卷：电解前后溶液pH变化']
            },
            {
                id: 'nacl-melt', name: '电解熔融NaCl(冶炼钠)', icon: '🔥',
                description: '工业上电解熔融氯化钠制取金属钠',
                electrodes: {
                    anode: { material:'C', name:'石墨(阳极)', reaction:'2Cl⁻ - 2e⁻ = Cl₂↑', type:'oxidation', color:'#36454F' },
                    cathode: { material:'Fe', name:'铁(阴极)', reaction:'Na⁺ + e⁻ = Na', type:'reduction', color:'#5c5c5c' }
                },
                electrolyte: '熔融NaCl', electrolyteColor: '#fff3e0',
                ionFlow: 'Na⁺向阴极迁移，Cl⁻向阳极迁移',
                electronFlow: '电源负极 → 阴极 → 阳极 → 电源正极',
                overall: '2NaCl(熔融) = 2Na + Cl₂↑',
                features: ['阴极产生银白色Na', '阳极产生黄绿色Cl₂', '需要高温(801℃以上)', '属于电解冶炼'],
                gdPoints: ['广东卷必考：电解熔融盐vs电解盐溶液的区别', '广东卷：活泼金属冶炼方法', '广东卷：电解熔融Al₂O₃制铝']
            }
        ]
    },

    selectType(type) {
        this.stopAnimation();
        this.state.currentType = type;
        this.state.currentExample = null;
        this.renderViewer();
    },

    selectExample(exampleId) {
        this.stopAnimation();
        const examples = this.examples[this.state.currentType];
        this.state.currentExample = examples.find(e => e.id === exampleId);
        this.state.particles = [];
        this.renderViewer();
    },

    startAnimation() {
        if (this.state.isAnimating) return;
        this.state.isAnimating = true;
        this._initParticles();
        this._animate();
        this.renderViewer();
    },

    stopAnimation() {
        this.state.isAnimating = false;
        if (this.state.animFrameId) {
            cancelAnimationFrame(this.state.animFrameId);
            this.state.animFrameId = null;
        }
    },

    setSpeed(s) {
        this.state.speed = s;
    },

    toggleLabels() {
        this.state.showLabels = !this.state.showLabels;
        this.renderViewer();
    },

    _initParticles() {
        this.state.particles = [];
        const ex = this.state.currentExample;
        if (!ex) return;

        for (let i = 0; i < 8; i++) {
            this.state.particles.push({
                type: 'electron',
                x: 300, y: 30,
                progress: i / 8,
                speed: 0.003 + Math.random() * 0.002
            });
        }
        for (let i = 0; i < 6; i++) {
            this.state.particles.push({
                type: 'cation',
                x: 0, y: 0,
                progress: i / 6,
                speed: 0.002 + Math.random() * 0.001,
                side: 'left'
            });
        }
        for (let i = 0; i < 6; i++) {
            this.state.particles.push({
                type: 'anion',
                x: 0, y: 0,
                progress: i / 6,
                speed: 0.002 + Math.random() * 0.001,
                side: 'right'
            });
        }
    },

    _animate() {
        if (!this.state.isAnimating) return;

        const canvas = document.getElementById('ec-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        this._drawDevice(ctx, w, h);
        this._updateAndDrawParticles(ctx, w, h);

        this.state.animFrameId = requestAnimationFrame(() => this._animate());
    },

    _drawDevice(ctx, w, h) {
        const ex = this.state.currentExample;
        if (!ex) return;
        const isGalvanic = this.state.currentType === 'galvanic';

        const leftVessel = { x: 60, y: 100, w: 160, h: 180 };
        const rightVessel = { x: 380, y: 100, w: 160, h: 180 };
        const leftElectrode = { x: 120, y: 130, w: 20, h: 120 };
        const rightElectrode = { x: 460, y: 130, w: 20, h: 120 };

        ctx.fillStyle = ex.electrolyteColor || '#d4edfc';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        this._roundRect(ctx, leftVessel.x, leftVessel.y, leftVessel.w, leftVessel.h, 8);
        ctx.fill(); ctx.stroke();
        this._roundRect(ctx, rightVessel.x, rightVessel.y, rightVessel.w, rightVessel.h, 8);
        ctx.fill(); ctx.stroke();

        if (ex.id === 'daniel') {
            // === Salt Bridge - Professional U-tube rendering ===
            var gapL = leftVessel.x + leftVessel.w;  // 220
            var gapR = rightVessel.x;                  // 380
            var cx = (gapL + gapR) / 2;               // 300 center
            var tubeW = 18;                            // tube half-width
            var armX_L = gapL + 18;                    // left arm X position
            var armX_R = gapR - 18;                    // right arm X position
            var archTop = 50;                          // arch top Y
            var armDepth = 60;                         // how far arms go down

            // Build U-tube path: left arm up → arch → right arm down
            var leftR = cx - armX_L;  // arch radius for left side
            var rightR = armX_R - cx; // arch radius for right side

            // 1) Draw tube outer wall (glass tube)
            ctx.beginPath();
            ctx.moveTo(armX_L - tubeW, archTop + armDepth);
            ctx.lineTo(armX_L - tubeW, archTop);
            ctx.arc(cx, archTop, leftR, Math.PI, 0, false);
            ctx.lineTo(armX_R + tubeW, archTop + armDepth);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#6b7b8a';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // 2) Draw tube inner wall (hollow space)
            ctx.beginPath();
            ctx.moveTo(armX_L - tubeW + 5, archTop + armDepth);
            ctx.lineTo(armX_L - tubeW + 5, archTop);
            ctx.arc(cx, archTop, leftR - 5, Math.PI, 0, false);
            ctx.lineTo(armX_R + tubeW - 5, archTop + armDepth);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(150, 180, 200, 0.5)';
            ctx.stroke();

            // 3) Fill tube with agar-KCl gel (yellow)
            ctx.beginPath();
            ctx.moveTo(armX_L - tubeW + 7, archTop + armDepth);
            ctx.lineTo(armX_L - tubeW + 7, archTop);
            ctx.arc(cx, archTop, leftR - 7, Math.PI, 0, false);
            ctx.lineTo(armX_R + tubeW - 7, archTop + armDepth);
            ctx.lineWidth = (tubeW - 7) * 2 - 2;
            ctx.strokeStyle = 'rgba(255, 230, 120, 0.6)';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // 4) Cotton plugs at arm bottoms
            ctx.fillStyle = 'rgba(240, 230, 210, 0.85)';
            ctx.strokeStyle = '#b0a090';
            ctx.lineWidth = 1;
            // Left plug
            ctx.beginPath();
            ctx.ellipse(armX_L, archTop + armDepth, tubeW - 3, 4, 0, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
            // Right plug
            ctx.beginPath();
            ctx.ellipse(armX_R, archTop + armDepth, tubeW - 3, 4, 0, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();

            // 5) Animated ion flow
            var t = (Date.now() % 3000) / 3000;
            ctx.font = '9px Arial';
            ctx.textAlign = 'center';

            // K+ moving left to right (along the arch)
            ctx.fillStyle = '#e74c3c';
            for (var i = 0; i < 3; i++) {
                var p = (t * 0.6 + i * 0.33) % 1;
                // Calculate position along the U-path
                var totalLen = armDepth + Math.PI * leftR + armDepth;
                var dist = p * totalLen;
                var kx, ky;
                if (dist < armDepth) {
                    // Going up left arm
                    kx = armX_L;
                    ky = archTop + armDepth - dist;
                } else if (dist < armDepth + Math.PI * leftR) {
                    // On the arch
                    var archProg = (dist - armDepth) / (Math.PI * leftR);
                    var ang = Math.PI + archProg * Math.PI;
                    kx = cx + Math.cos(ang) * leftR;
                    ky = archTop + Math.sin(ang) * leftR;
                } else {
                    // Going down right arm
                    var downDist = dist - armDepth - Math.PI * leftR;
                    kx = armX_R;
                    ky = archTop + downDist;
                }
                ctx.fillText('K\u207A', kx, ky + 3);
            }

            // Cl- moving right to left
            ctx.fillStyle = '#27ae60';
            for (var i = 0; i < 3; i++) {
                var p = (t * 0.6 + i * 0.33 + 0.5) % 1;
                var totalLen = armDepth + Math.PI * leftR + armDepth;
                var dist = p * totalLen;
                var clx, cly;
                if (dist < armDepth) {
                    // Going up right arm
                    clx = armX_R;
                    cly = archTop + armDepth - dist;
                } else if (dist < armDepth + Math.PI * leftR) {
                    // On the arch
                    var archProg = 1 - (dist - armDepth) / (Math.PI * leftR);
                    var ang = Math.PI + archProg * Math.PI;
                    clx = cx + Math.cos(ang) * leftR;
                    cly = archTop + Math.sin(ang) * leftR;
                } else {
                    // Going down left arm
                    var downDist = dist - armDepth - Math.PI * leftR;
                    clx = armX_L;
                    cly = archTop + downDist;
                }
                ctx.fillText('Cl\u207B', clx, cly + 3);
            }

            // 6) Labels
            if (this.state.showLabels) {
                ctx.fillStyle = '#5a6b7a';
                ctx.font = 'bold 11px Microsoft YaHei';
                ctx.textAlign = 'center';
                ctx.fillText('\u76D0\u6865', cx, archTop - 12);
                ctx.font = '9px Microsoft YaHei';
                ctx.fillStyle = '#777';
                ctx.fillText('KCl+\u743C\u8102', cx, archTop);

                // Ion flow direction
                ctx.font = '9px Microsoft YaHei';
                ctx.fillStyle = '#e74c3c';
                ctx.fillText('K\u207A\u2192', cx + 30, archTop + leftR + 15);
                ctx.fillStyle = '#27ae60';
                ctx.fillText('\u2190Cl\u207B', cx - 30, archTop + leftR + 15);
            }
        }

        ctx.fillStyle = ex.electrodes.anode.color;
        ctx.fillRect(leftElectrode.x, leftElectrode.y, leftElectrode.w, leftElectrode.h);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(leftElectrode.x, leftElectrode.y, leftElectrode.w, leftElectrode.h);

        ctx.fillStyle = ex.electrodes.cathode.color;
        ctx.fillRect(rightElectrode.x, rightElectrode.y, rightElectrode.w, rightElectrode.h);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rightElectrode.x, rightElectrode.y, rightElectrode.w, rightElectrode.h);

        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(leftElectrode.x + leftElectrode.w / 2, leftElectrode.y);
        ctx.lineTo(leftElectrode.x + leftElectrode.w / 2, 40);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rightElectrode.x + rightElectrode.w / 2, rightElectrode.y);
        ctx.lineTo(rightElectrode.x + rightElectrode.w / 2, 40);
        ctx.stroke();

        if (isGalvanic) {
            ctx.beginPath();
            ctx.moveTo(leftElectrode.x + leftElectrode.w / 2, 40);
            ctx.lineTo(300, 20);
            ctx.lineTo(rightElectrode.x + rightElectrode.w / 2, 40);
            ctx.stroke();

            ctx.fillStyle = '#ffcc00';
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(300, 20, 14, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#333';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('A', 300, 25);
        } else {
            ctx.beginPath();
            ctx.moveTo(leftElectrode.x + leftElectrode.w / 2, 40);
            ctx.lineTo(260, 15);
            ctx.lineTo(340, 15);
            ctx.lineTo(rightElectrode.x + rightElectrode.w / 2, 40);
            ctx.stroke();

            ctx.fillStyle = '#e74c3c';
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(260, 15, 12, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('+', 260, 19);

            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.arc(340, 15, 12, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.fillText('−', 340, 19);
        }

        if (this.state.showLabels) {
            ctx.fillStyle = '#333';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(ex.electrodes.anode.name, leftVessel.x + leftVessel.w / 2, leftVessel.y + leftVessel.h + 20);

            ctx.font = '11px Arial';
            ctx.fillStyle = '#e74c3c';
            ctx.fillText(ex.electrodes.anode.type === 'oxidation' ? '⚠️ 氧化反应' : '✅ 还原反应', leftVessel.x + leftVessel.w / 2, leftVessel.y + leftVessel.h + 38);

            ctx.fillStyle = '#333';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(ex.electrodes.cathode.name, rightVessel.x + rightVessel.w / 2, rightVessel.y + rightVessel.h + 20);

            ctx.font = '11px Arial';
            ctx.fillStyle = '#27ae60';
            ctx.fillText(ex.electrodes.cathode.type === 'reduction' ? '✅ 还原反应' : '⚠️ 氧化反应', rightVessel.x + rightVessel.w / 2, rightVessel.y + rightVessel.h + 38);

            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.fillText(ex.electrolyte, leftVessel.x + leftVessel.w / 2, leftVessel.y - 8);
            ctx.fillText(ex.electrolyte, rightVessel.x + rightVessel.w / 2, rightVessel.y - 8);

            if (isGalvanic) {
                ctx.fillStyle = '#ff6b6b';
                ctx.font = '10px Arial';
                ctx.fillText('e⁻ →', 300, 55);
            } else {
                ctx.fillStyle = '#ff6b6b';
                ctx.font = '10px Arial';
                ctx.fillText('e⁻ ←', 300, 55);
            }
        }
    },

    _updateAndDrawParticles(ctx, w, h) {
        const ex = this.state.currentExample;
        if (!ex) return;
        const isGalvanic = this.state.currentType === 'galvanic';
        const spd = this.state.speed;

        this.state.particles.forEach(p => {
            p.progress += p.speed * spd;
            if (p.progress > 1) p.progress -= 1;

            if (p.type === 'electron') {
                const lx = 130, rx = 470, ty = 30, by = 300;
                if (isGalvanic) {
                    const t = p.progress;
                    if (t < 0.25) {
                        p.x = lx + (rx - lx) * (t / 0.25);
                        p.y = ty;
                    } else if (t < 0.5) {
                        p.x = rx;
                        p.y = ty + (by - ty) * ((t - 0.25) / 0.25);
                    } else if (t < 0.75) {
                        p.x = rx - (rx - lx) * ((t - 0.5) / 0.25);
                        p.y = by;
                    } else {
                        p.x = lx;
                        p.y = by - (by - ty) * ((t - 0.75) / 0.25);
                    }
                } else {
                    const t = p.progress;
                    if (t < 0.25) {
                        p.x = rx - (rx - lx) * (t / 0.25);
                        p.y = ty;
                    } else if (t < 0.5) {
                        p.x = lx;
                        p.y = ty + (by - ty) * ((t - 0.25) / 0.25);
                    } else if (t < 0.75) {
                        p.x = lx + (rx - lx) * ((t - 0.5) / 0.25);
                        p.y = by;
                    } else {
                        p.x = rx;
                        p.y = by - (by - ty) * ((t - 0.75) / 0.25);
                    }
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#ff6b6b';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();

                if (this.state.showLabels) {
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 7px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('e⁻', p.x, p.y + 3);
                }

            } else if (p.type === 'cation') {
                const vessel = p.side === 'left' ? { x: 60, y: 100, w: 160, h: 180 } : { x: 380, y: 100, w: 160, h: 180 };
                p.x = vessel.x + 20 + p.progress * (vessel.w - 40);
                p.y = vessel.y + 40 + Math.sin(p.progress * Math.PI * 4) * 30 + 50;

                ctx.beginPath();
                ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#4ecdc4';
                ctx.fill();
                ctx.strokeStyle = '#2eaa9e';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                if (this.state.showLabels) {
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 7px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('+', p.x, p.y + 3);
                }

            } else if (p.type === 'anion') {
                const vessel = p.side === 'left' ? { x: 60, y: 100, w: 160, h: 180 } : { x: 380, y: 100, w: 160, h: 180 };
                p.x = vessel.x + vessel.w - 20 - p.progress * (vessel.w - 40);
                p.y = vessel.y + 60 + Math.cos(p.progress * Math.PI * 3) * 25 + 40;

                ctx.beginPath();
                ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#45b7d1';
                ctx.fill();
                ctx.strokeStyle = '#2e8fa8';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                if (this.state.showLabels) {
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 7px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('−', p.x, p.y + 3);
                }
            }
        });
    },

    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    },

    renderViewer() {
        const app = document.getElementById('electrochem-app');
        if (!app) return;

        const { currentType, currentExample, isAnimating } = this.state;
        const examples = this.examples[currentType];

        app.innerHTML = `
        <div class="electrochem-viewer">
            <div class="ec-header">
                <h3>⚡ 电化学装置动态示意系统 <span class="gd-badge">广东卷专用</span></h3>
                <div class="type-switcher">
                    <button class="type-btn ${currentType === 'galvanic' ? 'active' : ''}" onclick="electrochemistryViewer.selectType('galvanic')">🔋 原电池</button>
                    <button class="type-btn ${currentType === 'electrolytic' ? 'active' : ''}" onclick="electrochemistryViewer.selectType('electrolytic')">⚡ 电解池</button>
                </div>
            </div>

            <div class="ec-main">
                <div class="examples-panel">
                    <h4>📚 ${currentType === 'galvanic' ? '原电池' : '电解池'}实例库</h4>
                    <div class="examples-list">
                        ${examples.map(ex => `
                            <div class="example-item ${currentExample && currentExample.id === ex.id ? 'active' : ''}"
                                onclick="electrochemistryViewer.selectExample('${ex.id}')">
                                <div class="example-icon">${ex.icon}</div>
                                <div class="example-name">${ex.name}</div>
                                <div class="example-desc">${ex.description}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="visualization-panel">
                    ${currentExample ? `
                    <div class="device-visual">
                        <canvas id="ec-canvas" width="600" height="350" class="ec-canvas"></canvas>
                        <div class="particle-legend">
                            <div class="legend-item"><span class="particle electron-dot"></span><span>e⁻ 电子(沿导线)</span></div>
                            <div class="legend-item"><span class="particle cation-dot"></span><span>阳离子(向阴极)</span></div>
                            <div class="legend-item"><span class="particle anion-dot"></span><span>阴离子(向阳极)</span></div>
                        </div>
                        <div class="reaction-cards">
                            <div class="reaction-card anode">
                                <h5>${currentExample.electrodes.anode.name}</h5>
                                <div class="reaction-eq">${currentExample.electrodes.anode.reaction}</div>
                                <div class="reaction-type">${currentExample.electrodes.anode.type === 'oxidation' ? '⚠️ 氧化反应(失电子)' : '✅ 还原反应(得电子)'}</div>
                            </div>
                            <div class="reaction-card cathode">
                                <h5>${currentExample.electrodes.cathode.name}</h5>
                                <div class="reaction-eq">${currentExample.electrodes.cathode.reaction}</div>
                                <div class="reaction-type">${currentExample.electrodes.cathode.type === 'reduction' ? '✅ 还原反应(得电子)' : '⚠️ 氧化反应(失电子)'}</div>
                            </div>
                        </div>
                        <div class="anim-controls">
                            <button class="btn btn-primary" onclick="electrochemistryViewer.startAnimation()" ${isAnimating?'disabled':''}>▶ 开始动画</button>
                            <button class="btn btn-secondary" onclick="electrochemistryViewer.stopAnimation(); electrochemistryViewer.renderViewer();">⏸ 暂停</button>
                            <div class="speed-control">
                                <span>速度：</span>
                                <button class="spd-btn ${this.state.speed===0.5?'spd-act':''}" onclick="electrochemistryViewer.setSpeed(0.5)">0.5x</button>
                                <button class="spd-btn ${this.state.speed===1?'spd-act':''}" onclick="electrochemistryViewer.setSpeed(1)">1x</button>
                                <button class="spd-btn ${this.state.speed===2?'spd-act':''}" onclick="electrochemistryViewer.setSpeed(2)">2x</button>
                            </div>
                            <button class="btn btn-secondary" onclick="electrochemistryViewer.toggleLabels()">${this.state.showLabels?'🏷️ 隐藏标签':'🏷️ 显示标签'}</button>
                        </div>
                    </div>
                    ` : `
                    <div class="placeholder">
                        <div class="placeholder-icon">⚡</div>
                        <p>请从左侧选择一个电化学实例</p>
                        <p>系统将为您动态展示装置结构、反应机理</p>
                    </div>
                    `}
                </div>

                <div class="info-panel">
                    ${currentExample ? this.renderInfo() : '<p class="placeholder-text">选择实例后显示详细信息</p>'}
                </div>
            </div>
        </div>`;

        if (isAnimating && currentExample) {
            requestAnimationFrame(() => this._animate());
        } else if (currentExample) {
            const canvas = document.getElementById('ec-canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this._drawDevice(ctx, canvas.width, canvas.height);
            }
        }
    },

    renderInfo() {
        const ex = this.state.currentExample;
        const isGalvanic = this.state.currentType === 'galvanic';

        return `
        <div class="device-info">
            <h4>${ex.icon} ${ex.name}</h4>
            <p class="info-desc">${ex.description}</p>

            <div class="info-section">
                <h5>🔬 反应原理</h5>
                <div class="info-content"><p><strong>总反应：</strong>${ex.overall}</p></div>
            </div>

            <div class="info-section">
                <h5>⚡ 电子流向</h5>
                <div class="info-content">
                    <p>${ex.electronFlow}</p>
                    <p class="flow-note">${isGalvanic ? '电子从负极（自发）流向正极' : '电子由电源负极→阴极，阳极→电源正极'}</p>
                </div>
            </div>

            <div class="info-section">
                <h5>💧 离子迁移</h5>
                <div class="info-content">
                    <p>${ex.ionFlow}</p>
                    <p class="flow-note">阳离子向阴极迁移，阴离子向阳极迁移</p>
                </div>
            </div>

            <div class="info-section">
                <h5>📋 实验现象</h5>
                <ul class="features-list">${ex.features.map(f => '<li>'+f+'</li>').join('')}</ul>
            </div>

            ${ex.gdPoints && ex.gdPoints.length > 0 ? `
            <div class="info-section gd-section">
                <h5>🎯 广东卷考点</h5>
                <ul class="gd-points">${ex.gdPoints.map(p => '<li>'+p+'</li>').join('')}</ul>
            </div>
            ` : ''}

            <div class="info-section">
                <h5>📝 电极判断口诀</h5>
                <div class="info-content">
                    <p class="flow-note">${isGalvanic ? '原电池：活泼金属→负极(氧化)；不活泼→正极(还原)' : '电解池：接电源正极→阳极(氧化)；接电源负极→阴极(还原)'}</p>
                </div>
            </div>
        </div>`;
    }
};

/**
 * 化工流程学习系统 - 拖拽排序练习工艺步骤（高炉炼铁等）并评分
 * @module chemicalProcessFlow
 * @example window.chemicalProcessFlow.renderSystem()
 */
const chemicalProcessFlow = {
    state: {
        currentProcess: null,
        userOrder: [],
        isDragging: false,
        mode: 'practice',
        showDetails: null,
        score: 0,
        attempts: 0
    },

    processes: {
        'iron-extraction': {
            id: 'iron-extraction',
            name: '高炉炼铁',
            icon: '🏭',
            description: '高炉炼铁的完整工艺流程',
            category: 'metallurgy',
            correctOrder: ['ore', 'crush', 'roast', 'reduce', 'cast'],
            steps: [
                {
                    id: 'ore', name: '矿石预处理', icon: '🪨',
                    purpose: '将铁矿石破碎并精选，提高反应速率',
                    principle: '利用物理方法分离杂质，提高矿石纯度',
                    equations: ['主要成分：Fe₂O₃、Fe₃O₄'],
                    conditions: '常温物理处理',
                    examQA: [
                        { q: '为什么要将矿石粉碎？', a: '增大反应接触面积，加快反应速率' },
                        { q: '常用哪些矿石？', a: '赤铁矿（Fe₂O₃）、磁铁矿（Fe₃O₄）' }
                    ]
                },
                {
                    id: 'crush', name: '高温焙烧', icon: '🔥',
                    purpose: '去除硫、砷等有害杂质，使矿石疏松',
                    principle: '高温下杂质与氧气反应生成气体逸出',
                    equations: ['4FeS₂ + 11O₂ → 2Fe₂O₃ + 8SO₂', 'S + O₂ → SO₂'],
                    conditions: '高温',
                    examQA: [
                        { q: '焙烧的目的？', a: '1.除去挥发性杂质 2.将低价铁氧化为高价铁 3.使矿石疏松多孔' }
                    ]
                },
                {
                    id: 'roast', name: '还原反应', icon: '⬇️',
                    purpose: '用还原剂将铁的氧化物还原为单质铁',
                    principle: '利用CO还原Fe₂O₃，在高温下发生氧化还原反应',
                    equations: ['Fe₂O₃ + 3CO →(高温) 2Fe + 3CO₂', '3Fe₂O₃ + CO →(高温) 2Fe₃O₄ + CO₂', 'Fe₃O₄ + CO →(高温) 3FeO + CO₂'],
                    conditions: '高温',
                    examQA: [
                        { q: '还原剂是什么？', a: '焦炭不完全燃烧生成的CO' },
                        { q: '为什么使用过量CO？', a: '确保Fe₂O₃完全还原，提高产率' }
                    ]
                },
                {
                    id: 'reduce', name: '炉渣分离', icon: '🧱',
                    purpose: '分离铁水和炉渣，得到生铁',
                    principle: '铁水密度大于炉渣，在炉底分层',
                    equations: ['CaCO₃ →(高温) CaO + CO₂↑', 'CaO + SiO₂ →(高温) CaSiO₃（炉渣）'],
                    conditions: '高温',
                    examQA: [
                        { q: '石灰石的作用？', a: '作熔剂，与SiO₂形成CaSiO₃炉渣' },
                        { q: '生铁和钢的区别？', a: '含碳量不同：生铁2%~4.3%，钢0.03%~2%' }
                    ]
                },
                {
                    id: 'cast', name: '铸造成型', icon: '🔧',
                    purpose: '将铁水铸造成特定形状的生铁或进一步炼钢',
                    principle: '冷却凝固过程中控制结晶',
                    equations: ['生铁成分：Fe、C、Si、Mn、S、P'],
                    conditions: '冷却',
                    examQA: [
                        { q: '高炉炼铁的产物？', a: '生铁（铸铁）、炉渣、高炉煤气' },
                        { q: '高炉煤气的成分？', a: 'CO、CO₂、N₂，可作燃料使用' }
                    ]
                }
            ],
            gdPoints: [
                '广东卷必考：高炉炼铁三原料（矿石、焦炭、石灰石）的作用',
                '广东卷高频：焦炭的作用——提供热源+提供还原剂CO',
                '广东卷：石灰石作熔剂除SiO₂的化学方程式',
                '广东卷：高炉煤气成分及用途'
            ]
        },
        'sulfuric-acid': {
            id: 'sulfuric-acid',
            name: '接触法制硫酸',
            icon: '⚗️',
            description: '接触法制硫酸的完整工艺',
            category: 'inorganic',
            correctOrder: ['sulfur', 'burn', 'so2', 'so3', 'absorb'],
            steps: [
                {
                    id: 'sulfur', name: '原料制备', icon: '🪨',
                    purpose: '提供制酸原料——硫磺或黄铁矿',
                    principle: '硫磺或黄铁矿燃烧提供SO₂',
                    equations: ['S + O₂ →(点燃) SO₂', '4FeS₂ + 11O₂ →(高温) 2Fe₂O₃ + 8SO₂'],
                    conditions: '点燃/高温',
                    examQA: [
                        { q: '工业制硫酸的原料？', a: '硫磺或黄铁矿（FeS₂）' },
                        { q: '为什么优先选硫磺？', a: '硫磺纯度高，燃烧产物SO₂浓度大，无需除矿渣' }
                    ]
                },
                {
                    id: 'burn', name: '燃烧与净化', icon: '🔥',
                    purpose: '生成SO₂并除尘、洗涤、干燥',
                    principle: '燃烧反应及杂质去除，防止催化剂中毒',
                    equations: ['S + O₂ →(点燃) SO₂', '净化：除尘→洗涤→干燥'],
                    conditions: '点燃',
                    examQA: [
                        { q: '为什么要净化？', a: '防止催化剂中毒（砷、硒等化合物会使V₂O₅失效）' },
                        { q: '净化的三步？', a: '除尘→洗涤→干燥，除去粉尘和有害气体' }
                    ]
                },
                {
                    id: 'so2', name: 'SO₂催化氧化', icon: '⬇️',
                    purpose: '将SO₂氧化为SO₃（接触室）',
                    principle: '使用V₂O₅催化剂，反应为可逆放热反应',
                    equations: ['2SO₂ + O₂ ⇌(V₂O₅,400-500℃) 2SO₃', 'ΔH = -196 kJ/mol'],
                    conditions: 'V₂O₅催化, 400-500℃',
                    examQA: [
                        { q: '为什么使用催化剂？', a: '加快反应速率，缩短到达平衡时间' },
                        { q: '为什么控制温度400-500℃？', a: '温度过高平衡左移降低转化率，温度过低反应速率慢' },
                        { q: '为什么要使用过量空气？', a: '增大O₂浓度，使平衡右移，提高SO₂转化率' }
                    ]
                },
                {
                    id: 'so3', name: 'SO₃吸收', icon: '💧',
                    purpose: '用98.3%浓硫酸吸收SO₃',
                    principle: '避免用水直接吸收SO₃（会形成酸雾，难以吸收）',
                    equations: ['SO₃ + H₂O → H₂SO₄', '98.3%浓H₂SO₄吸收SO₃ → 发烟硫酸'],
                    conditions: '常压',
                    examQA: [
                        { q: '为什么不用水直接吸收SO₃？', a: 'SO₃与水反应放出大量热形成酸雾，阻碍进一步吸收' },
                        { q: '产品形式？', a: '98.3%浓硫酸或含SO₃的发烟硫酸' }
                    ]
                },
                {
                    id: 'absorb', name: '尾气处理', icon: '📦',
                    purpose: '处理未反应的SO₂尾气，保护环境',
                    principle: '用氨水吸收尾气中的SO₂，变废为宝',
                    equations: ['SO₂ + 2NH₃·H₂O → (NH₄)₂SO₃ + H₂O', '(NH₄)₂SO₃ + SO₂ → 2NH₄HSO₃'],
                    conditions: '常温',
                    examQA: [
                        { q: '尾气成分？', a: '未反应的SO₂、O₂及N₂，必须处理后排放' },
                        { q: '如何处理尾气？', a: '用氨水吸收得到(NH₄)₂SO₃/(NH₄)HSO₃，可作化肥' }
                    ]
                }
            ],
            gdPoints: [
                '广东卷必考：接触法制硫酸三个阶段（造气→催化氧化→吸收）',
                '广东卷高频：为什么用98.3%浓硫酸吸收SO₃而不用水',
                '广东卷：SO₂催化氧化的条件选择（温度、压强、催化剂）',
                '广东卷：尾气处理方法及环保意义',
                '广东卷：净化炉气的目的——防止催化剂中毒'
            ]
        },
        'ammonia': {
            id: 'ammonia',
            name: '合成氨工艺',
            icon: '🔬',
            description: '哈伯法合成氨的完整流程',
            category: 'inorganic',
            correctOrder: ['reform', 'shift', 'purify', 'synthesize', 'separate'],
            steps: [
                {
                    id: 'reform', name: '原料气制备', icon: '💨',
                    purpose: '制备N₂和H₂',
                    principle: '天然气水蒸汽重整制H₂，空气液化分馏制N₂',
                    equations: ['CH₄ + H₂O →(高温) CO + 3H₂', 'CₙH₂ₙ₊₂ + nH₂O →(高温) nCO + (2n+1)H₂'],
                    conditions: '高温',
                    examQA: [
                        { q: '原料气的来源？', a: 'N₂来自空气液化分馏，H₂来自天然气水蒸汽重整' }
                    ]
                },
                {
                    id: 'shift', name: '变换反应', icon: '🔄',
                    purpose: '将CO转化为CO₂并增加H₂产量',
                    principle: '水煤气变换反应，同时除去CO（防止催化剂中毒）',
                    equations: ['CO + H₂O ⇌(催化剂) CO₂ + H₂', 'ΔH = -41 kJ/mol'],
                    conditions: '催化剂',
                    examQA: [
                        { q: '为什么要变换？', a: '除去CO（会使催化剂中毒）并提高H₂产率' }
                    ]
                },
                {
                    id: 'purify', name: '脱碳净化', icon: '🧹',
                    purpose: '除去CO₂等杂质得到纯净的合成气',
                    principle: '化学吸收法（常用碱液或氨水吸收CO₂）',
                    equations: ['CO₂ + 2NH₃ + H₂O → (NH₄)₂CO₃', 'CO₂ + NaOH → Na₂CO₃ + H₂O'],
                    conditions: '常温常压',
                    examQA: [
                        { q: '如何获得N₂？', a: '将空气液化分馏得到N₂，或燃烧法除去O₂' },
                        { q: '为什么要脱碳？', a: 'CO₂会使合成氨催化剂中毒失效' }
                    ]
                },
                {
                    id: 'synthesize', name: '氨合成', icon: '⚛️',
                    purpose: '在高温高压和催化剂存在下合成氨',
                    principle: 'N₂ + 3H₂ ⇌ 2NH₃，使用铁触媒催化',
                    equations: ['N₂ + 3H₂ ⇌(Fe,400-500℃,15-30MPa) 2NH₃', 'ΔH = -92 kJ/mol'],
                    conditions: 'Fe催化, 400-500℃, 15-30MPa',
                    examQA: [
                        { q: '反应条件？', a: '温度400-500℃，压强15-30MPa，铁触媒催化' },
                        { q: '为什么选此温度？', a: '折中温度：兼顾反应速率和平衡转化率' },
                        { q: '为什么选此压强？', a: '折中压强：高压有利于平衡但设备要求高' }
                    ]
                },
                {
                    id: 'separate', name: '氨分离与循环', icon: '🔀',
                    purpose: '分离出液氨，未反应气体循环使用',
                    principle: '降压降温使NH₃液化分离，未反应气循环',
                    equations: ['产物：液态NH₃', '未反应N₂+H₂循环使用'],
                    conditions: '降温降压',
                    examQA: [
                        { q: '为什么循环？', a: '提高原料利用率，降低成本' },
                        { q: '反应特征？', a: '正反应放热，分子数减少（4→2），正反应气体体积缩小' }
                    ]
                }
            ],
            gdPoints: [
                '广东卷必考：合成氨条件选择——折中温度+折中压强',
                '广东卷高频：合成氨是可逆反应，N₂转化率低需循环',
                '广东卷：原料气净化目的——防止催化剂中毒',
                '广东卷：合成氨工业的三重折中（温度/压强/浓度）'
            ]
        },
        'aluminum': {
            id: 'aluminum',
            name: '铝的冶炼(电解熔融Al₂O₃)',
            icon: '⚡',
            description: '霍尔-埃鲁法电解熔融氧化铝制取金属铝',
            category: 'metallurgy',
            correctOrder: ['bauxite', 'digest', 'calcine', 'electrolyze', 'cast'],
            steps: [
                {
                    id: 'bauxite', name: '铝土矿预处理', icon: '🪨',
                    purpose: '获取铝土矿原料（主要成分为Al₂O₃·xH₂O）',
                    principle: '铝土矿中含Fe₂O₃、SiO₂等杂质，需提纯',
                    equations: ['铝土矿成分：Al₂O₃·xH₂O、Fe₂O₃、SiO₂'],
                    conditions: '常温',
                    examQA: [
                        { q: '铝土矿的主要成分？', a: 'Al₂O₃·xH₂O（氧化铝水合物）' },
                        { q: '铝在地壳中的含量？', a: '地壳中含量最多的金属元素（7.73%）' }
                    ]
                },
                {
                    id: 'digest', name: '碱溶提纯', icon: '🧪',
                    purpose: '用NaOH溶液溶解Al₂O₃，与杂质分离',
                    principle: 'Al₂O₃是两性氧化物，可溶于NaOH；Fe₂O₃不溶',
                    equations: ['Al₂O₃ + 2NaOH → 2NaAlO₂ + H₂O', '过滤除去Fe₂O₃等不溶杂质'],
                    conditions: '加热',
                    examQA: [
                        { q: '为什么用NaOH？', a: 'Al₂O₃是两性氧化物，溶于碱；Fe₂O₃不溶，可过滤分离' },
                        { q: 'SiO₂如何除去？', a: 'SiO₂也溶于NaOH生成Na₂SiO₃，需后续通CO₂沉淀Al(OH)₃' }
                    ]
                },
                {
                    id: 'calcine', name: '煅烧得纯Al₂O₃', icon: '🔥',
                    purpose: '将Al(OH)₃煅烧得到纯净的Al₂O₃',
                    principle: '氢氧化铝受热分解为氧化铝和水',
                    equations: ['NaAlO₂ + CO₂ + 2H₂O → Al(OH)₃↓ + NaHCO₃', '2Al(OH)₃ →(高温) Al₂O₃ + 3H₂O'],
                    conditions: '高温煅烧',
                    examQA: [
                        { q: '为什么通CO₂？', a: 'CO₂酸性强于Al(OH)₃，使偏铝酸钠转化为Al(OH)₃沉淀' },
                        { q: '为什么不用过量酸？', a: 'Al(OH)₃是两性氢氧化物，过量酸会使其溶解' }
                    ]
                },
                {
                    id: 'electrolyze', name: '电解熔融Al₂O₃', icon: '⚡',
                    purpose: '电解熔融Al₂O₃得到金属铝',
                    principle: '冰晶石(Na₃AlF₆)作熔剂降低Al₂O₃熔点',
                    equations: ['2Al₂O₃(熔融) →(电解,Na₃AlF₆) 4Al + 3O₂↑', '阳极(C)：2O²⁻ - 4e⁻ → O₂↑', '阴极(C)：Al³⁺ + 3e⁻ → Al'],
                    conditions: '电解, 950℃, Na₃AlF₆',
                    examQA: [
                        { q: '为什么加冰晶石？', a: '降低Al₂O₃熔点（从2050℃降至950℃），节省能源' },
                        { q: '阳极为什么需定期补充？', a: '阳极产生的O₂与碳反应消耗C极：C + O₂ → CO₂' },
                        { q: '为什么电解熔融盐而非水溶液？', a: 'Al³⁺在水中放电能力远弱于H⁺，水溶液中无法得到Al' }
                    ]
                },
                {
                    id: 'cast', name: '铸锭成型', icon: '🔧',
                    purpose: '将铝液铸造成铝锭或合金产品',
                    principle: '铝液冷却凝固，可加入其他金属制铝合金',
                    equations: ['产品：纯铝锭或铝合金'],
                    conditions: '冷却',
                    examQA: [
                        { q: '铝合金的优点？', a: '密度小、强度高、耐腐蚀，广泛用于航空和建筑' },
                        { q: '铝的冶炼为什么是耗能大户？', a: '电解需大量电能，每生产1t Al约耗电13000-15000kWh' }
                    ]
                }
            ],
            gdPoints: [
                '广东卷必考：电解熔融Al₂O₃的电极反应式',
                '广东卷高频：冰晶石(Na₃AlF₆)的作用——降低熔点',
                '广东卷：铝土矿提纯流程（碱溶→过滤→通CO₂→煅烧）',
                '广东卷：为什么电解熔融盐而非水溶液',
                '广东卷：阳极碳块消耗原因'
            ]
        },
        'chlor-alkali': {
            id: 'chlor-alkali',
            name: '氯碱工业(电解食盐水)',
            icon: '🏭',
            description: '离子交换膜法电解饱和食盐水',
            category: 'electrolysis',
            correctOrder: ['brine', 'purify', 'electrolyze', 'separate', 'product'],
            steps: [
                {
                    id: 'brine', name: '配制饱和食盐水', icon: '🧂',
                    purpose: '制备精制饱和NaCl溶液',
                    principle: '粗盐中含有Ca²⁺、Mg²⁺、SO₄²⁻等杂质需除去',
                    equations: ['粗盐成分：NaCl + Ca²⁺ + Mg²⁺ + SO₄²⁻'],
                    conditions: '常温',
                    examQA: [
                        { q: '为什么要精制食盐水？', a: 'Ca²⁺、Mg²⁺会与OH⁻形成沉淀堵塞离子交换膜' }
                    ]
                },
                {
                    id: 'purify', name: '盐水精制', icon: '🧹',
                    purpose: '除去Ca²⁺、Mg²⁺、SO₄²⁻等杂质离子',
                    principle: '依次加入BaCl₂→Na₂CO₃→NaOH除去杂质',
                    equations: ['BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl', 'Na₂CO₃ + CaCl₂ → CaCO₃↓ + 2NaCl', '2NaOH + MgCl₂ → Mg(OH)₂↓ + 2NaCl'],
                    conditions: '常温',
                    examQA: [
                        { q: '除杂顺序？', a: '先加BaCl₂除SO₄²⁻，再加Na₂CO₃除Ca²⁺和过量Ba²⁺，最后加NaOH除Mg²⁺' },
                        { q: '为什么Na₂CO₃要在BaCl₂之后加？', a: '需除去过量Ba²⁺' }
                    ]
                },
                {
                    id: 'electrolyze', name: '电解(离子交换膜法)', icon: '⚡',
                    purpose: '电解饱和食盐水生产Cl₂、H₂和NaOH',
                    principle: '阳离子交换膜只允许Na⁺通过，阻止Cl⁻和OH⁻混合',
                    equations: ['2NaCl + 2H₂O →(电解) 2NaOH + H₂↑ + Cl₂↑', '阳极：2Cl⁻ - 2e⁻ → Cl₂↑', '阴极：2H₂O + 2e⁻ → H₂↑ + 2OH⁻'],
                    conditions: '电解',
                    examQA: [
                        { q: '离子交换膜的作用？', a: '只允许阳离子通过，阻止阴离子(Cl⁻、OH⁻)通过，防止Cl₂与NaOH反应' },
                        { q: '为什么不能用隔膜法？', a: '隔膜法产品浓度低、纯度差，离子交换膜法更优' }
                    ]
                },
                {
                    id: 'separate', name: '产物分离', icon: '🔀',
                    purpose: '分别收集Cl₂、H₂和NaOH溶液',
                    principle: '阳极室出Cl₂，阴极室出H₂和NaOH溶液',
                    equations: ['阳极室：Cl₂↑', '阴极室：H₂↑ + NaOH溶液'],
                    conditions: '常温常压',
                    examQA: [
                        { q: '如何检验Cl₂？', a: '用湿润的淀粉碘化钾试纸，变蓝' },
                        { q: 'NaOH溶液浓度？', a: '阴极室NaOH浓度约30%~35%' }
                    ]
                },
                {
                    id: 'product', name: '产品加工', icon: '📦',
                    purpose: '将产品加工为工业品或进一步利用',
                    principle: 'Cl₂可用于制盐酸、漂白粉；NaOH用于制皂、造纸',
                    equations: ['Cl₂ + 2NaOH → NaCl + NaClO + H₂O（制漂白液）', '2Cl₂ + 2Ca(OH)₂ → CaCl₂ + Ca(ClO)₂ + 2H₂O（制漂白粉）'],
                    conditions: '常温',
                    examQA: [
                        { q: '漂白粉的有效成分？', a: 'Ca(ClO)₂（次氯酸钙）' },
                        { q: '漂白粉的漂白原理？', a: 'Ca(ClO)₂ + CO₂ + H₂O → CaCO₃↓ + 2HClO，HClO具有强氧化性' }
                    ]
                }
            ],
            gdPoints: [
                '广东卷必考：离子交换膜的作用——只允许阳离子通过',
                '广东卷高频：氯碱工业电极反应式',
                '广东卷：盐水精制的除杂顺序和试剂选择',
                '广东卷：漂白粉的制备和漂白原理',
                '广东卷：电解前后溶液pH变化'
            ]
        },
        'seawater-bromine': {
            id: 'seawater-bromine',
            name: '海水提溴',
            icon: '🌊',
            description: '从海水中提取溴的完整工艺流程',
            category: 'extraction',
            correctOrder: ['acidify', 'oxidize', 'blow', 'absorb', 'distill'],
            steps: [
                {
                    id: 'acidify', name: '酸化海水', icon: '🧪',
                    purpose: '调节海水pH至酸性，为氧化创造条件',
                    principle: '酸性条件下Cl₂氧化Br⁻更彻底',
                    equations: ['加入稀H₂SO₄调节pH≈3.5'],
                    conditions: '常温',
                    examQA: [
                        { q: '为什么要酸化？', a: '酸性条件下Cl₂氧化Br⁻更完全，防止Br₂歧化' }
                    ]
                },
                {
                    id: 'oxidize', name: 'Cl₂氧化Br⁻', icon: '⚡',
                    purpose: '通入Cl₂将Br⁻氧化为Br₂',
                    principle: 'Cl₂氧化性强于Br₂，可置换出Br₂',
                    equations: ['Cl₂ + 2Br⁻ → 2Cl⁻ + Br₂'],
                    conditions: '常温',
                    examQA: [
                        { q: '为什么用Cl₂氧化？', a: 'Cl₂氧化性强于Br₂，能将Br⁻氧化为Br₂' },
                        { q: '能否用F₂？', a: '不能，F₂太活泼会与水反应' }
                    ]
                },
                {
                    id: 'blow', name: '吹出Br₂', icon: '💨',
                    purpose: '用空气将Br₂从溶液中吹出',
                    principle: '利用Br₂的挥发性，用热空气吹出',
                    equations: ['Br₂(溶液) →(热空气) Br₂(气)'],
                    conditions: '加热',
                    examQA: [
                        { q: '为什么要用热空气？', a: '加热增大Br₂的挥发性，提高吹出效率' }
                    ]
                },
                {
                    id: 'absorb', name: 'SO₂吸收', icon: '🧹',
                    purpose: '用SO₂吸收Br₂转化为HBr和H₂SO₄，富集溴',
                    principle: 'SO₂还原Br₂，使溴在溶液中富集',
                    equations: ['Br₂ + SO₂ + 2H₂O → 2HBr + H₂SO₄'],
                    conditions: '常温',
                    examQA: [
                        { q: '为什么用SO₂吸收？', a: '将Br₂转化为HBr和H₂SO₄，便于后续浓缩提纯' },
                        { q: '这一步的氧化还原关系？', a: 'SO₂是还原剂，Br₂是氧化剂' }
                    ]
                },
                {
                    id: 'distill', name: '再次氧化蒸馏', icon: '🔥',
                    purpose: '再次用Cl₂氧化后蒸馏得到液溴',
                    principle: '浓缩后的HBr再被Cl₂氧化，蒸馏得纯Br₂',
                    equations: ['2HBr + Cl₂ → 2HCl + Br₂', '蒸馏分离得到液溴(Br₂)'],
                    conditions: 'Cl₂氧化+蒸馏',
                    examQA: [
                        { q: '为什么需要两次氧化？', a: '第一次氧化吹出浓度低，需SO₂吸收富集后再氧化蒸馏' },
                        { q: '液溴如何保存？', a: '密封保存在棕色瓶中，加水液封防止挥发' }
                    ]
                }
            ],
            gdPoints: [
                '广东卷必考：海水提溴的两步氧化法',
                '广东卷高频：Cl₂氧化Br⁻的离子方程式',
                '广东卷：SO₂吸收Br₂的化学方程式',
                '广东卷：为什么要酸化——防止Br₂歧化',
                '广东卷：液溴的保存方法'
            ]
        },
        'soda-ash': {
            id: 'soda-ash',
            name: '侯氏制碱法(联合制碱)',
            icon: '🧂',
            description: '侯德榜联合制碱法的完整工艺流程',
            category: 'inorganic',
            correctOrder: ['ammoniate', 'carbonate', 'crystallize', 'calcine', 'recover'],
            steps: [
                {
                    id: 'ammoniate', name: '氨化饱和盐水', icon: '💨',
                    purpose: '先通入NH₃使盐水饱和',
                    principle: 'NH₃溶解度大，先通入可提高后续CO₂吸收效率',
                    equations: ['NH₃ + H₂O ⇌ NH₃·H₂O'],
                    conditions: '常温常压',
                    examQA: [
                        { q: '为什么先通NH₃后通CO₂？', a: 'NH₃溶解度远大于CO₂，先通NH₃可提高CO₂吸收效率' }
                    ]
                },
                {
                    id: 'carbonate', name: '通入CO₂碳酸化', icon: '🫧',
                    purpose: '通入CO₂使NaHCO₃结晶析出',
                    principle: 'CO₂与氨水反应生成HCO₃⁻，NaHCO₃溶解度小而析出',
                    equations: ['NH₃ + CO₂ + H₂O → NH₄HCO₃', 'NH₄HCO₃ + NaCl → NaHCO₃↓ + NH₄Cl'],
                    conditions: '常温常压',
                    examQA: [
                        { q: '为什么NaHCO₃能析出？', a: 'NaHCO₃在相同条件下溶解度小于NaCl、NH₄Cl、NH₄HCO₃' },
                        { q: '总反应方程式？', a: 'NaCl + NH₃ + CO₂ + H₂O → NaHCO₃↓ + NH₄Cl' }
                    ]
                },
                {
                    id: 'crystallize', name: '过滤结晶', icon: '🔬',
                    purpose: '过滤得到NaHCO₃晶体',
                    principle: 'NaHCO₃溶解度最小，优先结晶析出',
                    equations: ['NaHCO₃↓（晶体）', '母液含NH₄Cl和未反应NaCl'],
                    conditions: '常温',
                    examQA: [
                        { q: '滤液成分？', a: 'NH₄Cl和未反应的NaCl' },
                        { q: '如何提高NaHCO₃产率？', a: '控制温度在35℃左右，增大CO₂浓度' }
                    ]
                },
                {
                    id: 'calcine', name: '煅烧NaHCO₃', icon: '🔥',
                    purpose: '加热NaHCO₃分解得到纯碱Na₂CO₃',
                    principle: 'NaHCO₃受热分解生成Na₂CO₃',
                    equations: ['2NaHCO₃ →(加热) Na₂CO₃ + H₂O + CO₂↑'],
                    conditions: '加热(200℃)',
                    examQA: [
                        { q: 'CO₂如何利用？', a: '回收的CO₂可循环用于碳酸化步骤' },
                        { q: '产品是什么？', a: '纯碱Na₂CO₃（碳酸钠）' }
                    ]
                },
                {
                    id: 'recover', name: '回收NH₄Cl', icon: '♻️',
                    purpose: '从母液中回收NH₄Cl，循环利用NH₃',
                    principle: '向母液中通入NH₃并加NaCl细粉，利用同离子效应',
                    equations: ['母液 + NH₃ + NaCl(细粉) → NH₄Cl↓ + NaCl溶液', 'NH₄Cl →(加热) NH₃↑ + HCl↑（回收NH₃）'],
                    conditions: '低温析出',
                    examQA: [
                        { q: '侯氏制碱法与索尔维法的区别？', a: '侯氏法将合成氨与制碱联合，NH₄Cl作化肥，无废渣；索尔维法产生大量CaCl₂废渣' },
                        { q: '侯氏法的优点？', a: '食盐利用率高(96%)，无废渣，副产NH₄Cl化肥' }
                    ]
                }
            ],
            gdPoints: [
                '广东卷必考：侯氏制碱法原理——先通NH₃后通CO₂',
                '广东卷高频：NaHCO₃析出原因——溶解度最小',
                '广东卷：2NaHCO₃→Na₂CO₃+H₂O+CO₂↑煅烧方程式',
                '广东卷：侯氏法vs索尔维法的比较',
                '广东卷：CO₂循环利用的绿色化学思想'
            ]
        }
    },

    selectProcess(processId) {
        this.state.currentProcess = this.processes[processId];
        this.state.userOrder = [...this.state.currentProcess.steps];
        this.state.showDetails = null;
        this.state.score = 0;
        this.state.attempts = 0;
        this.renderSystem();
    },

    setMode(mode) {
        this.state.mode = mode;
        this.renderSystem();
    },

    moveCard(dragIndex, hoverIndex) {
        const cards = [...this.state.userOrder];
        const [removed] = cards.splice(dragIndex, 1);
        cards.splice(hoverIndex, 0, removed);
        this.state.userOrder = cards;
        this.renderSystem();
    },

    moveCardUp(index) {
        if (index <= 0) return;
        this.moveCard(index, index - 1);
    },

    moveCardDown(index) {
        if (index >= this.state.userOrder.length - 1) return;
        this.moveCard(index, index + 1);
    },

    toggleDetails(stepId) {
        this.state.showDetails = this.state.showDetails === stepId ? null : stepId;
        const el = document.getElementById('details-' + stepId);
        if (el) {
            el.style.display = this.state.showDetails === stepId ? 'block' : 'none';
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    },

    verifyOrder() {
        if (!this.state.currentProcess) return;

        const correct = this.state.currentProcess.correctOrder;
        const userOrder = this.state.userOrder.map(s => s.id);

        const result = document.getElementById('flow-result');
        if (!result) return;

        let correctCount = 0;
        userOrder.forEach((id, idx) => {
            if (id === correct[idx]) correctCount++;
        });

        this.state.attempts++;
        const percentage = (correctCount / correct.length * 100).toFixed(0);
        const isCorrect = percentage == 100;
        if (isCorrect) this.state.score++;

        result.innerHTML = `
            <div class="verify-result ${isCorrect ? 'success' : 'error'}">
                <div class="verify-icon">${isCorrect ? '✅' : '❌'}</div>
                <div class="verify-info">
                    <h4>${isCorrect ? '恭喜！排序完全正确！' : '排序有误，请重新调整'}</h4>
                    <p>正确率：${percentage}%（${correctCount}/${correct.length}）| 累计得分：${this.state.score} | 尝试次数：${this.state.attempts}</p>
                </div>
                ${!isCorrect ? `
                    <div class="correct-order">
                        <h5>正确顺序：</h5>
                        <div class="order-sequence">
                            ${this.state.currentProcess.correctOrder.map((id, idx) => {
                                const step = this.state.currentProcess.steps.find(s => s.id === id);
                                return '<span class="order-item ' + (userOrder[idx] === id ? 'match' : 'mismatch') + '">' + (idx + 1) + '. ' + step.icon + ' ' + step.name + '</span>';
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    shuffleCards() {
        const cards = [...this.state.userOrder];
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        this.state.userOrder = cards;
        this.state.showDetails = null;
        this.renderSystem();
    },

    resetOrder() {
        if (!this.state.currentProcess) return;
        this.state.userOrder = [...this.state.currentProcess.steps];
        this.state.showDetails = null;
        this.renderSystem();
    },

    initDragAndDrop() {
        const container = document.getElementById('cards-container');
        if (!container) return;

        let draggedIdx = null;

        container.querySelectorAll('.node-card').forEach((card, idx) => {
            card.addEventListener('dragstart', (e) => {
                draggedIdx = parseInt(card.dataset.index);
                e.dataTransfer.effectAllowed = 'move';
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                draggedIdx = null;
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            card.addEventListener('drop', (e) => {
                e.preventDefault();
                const targetIdx = parseInt(card.dataset.index);
                if (draggedIdx !== null && draggedIdx !== targetIdx) {
                    this.moveCard(draggedIdx, targetIdx);
                }
            });
        });
    },

    renderFlowDiagram() {
        const ex = this.state.currentProcess;
        if (!ex) return '';
        const correct = ex.correctOrder;
        const userOrder = this.state.userOrder.map(s => s.id);
        const isPractice = this.state.mode === 'practice';

        return '<div class="flow-diagram">' + correct.map((id, idx) => {
            const step = ex.steps.find(s => s.id === id);
            const userPos = userOrder.indexOf(id);
            const isMatch = !isPractice || userOrder[idx] === id;
            return '<div class="flow-node ' + (isMatch ? 'node-match' : 'node-mismatch') + '">' +
                '<div class="flow-node-num">' + (idx + 1) + '</div>' +
                '<div class="flow-node-icon">' + step.icon + '</div>' +
                '<div class="flow-node-name">' + step.name + '</div>' +
                (isPractice && !isMatch ? '<div class="flow-node-hint">当前在第' + (userPos + 1) + '位</div>' : '') +
            '</div>' +
            (idx < correct.length - 1 ? '<div class="flow-arrow">→</div>' : '');
        }).join('') + '</div>';
    },

    renderSystem() {
        const app = document.getElementById('process-flow-app');
        if (!app) return;

        const processList = Object.values(this.processes);
        const { currentProcess, mode, userOrder } = this.state;
        const categories = { metallurgy: '冶金工业', inorganic: '无机化工', electrolysis: '电解工业', extraction: '提取工艺' };

        app.innerHTML = `
        <div class="process-flow-system">
            <div class="pf-header">
                <h3>🏭 化学工艺流程节点卡片系统 <span class="gd-badge">广东卷专用</span></h3>
                <p class="pf-intro">通过拖拽排序练习工艺流程重组，强化理解化工步骤逻辑</p>
                ${currentProcess ? `
                <div class="pf-mode-switch">
                    <button class="mode-btn ${mode==='practice'?'mode-act':''}" onclick="chemicalProcessFlow.setMode('practice')">🃏 练习模式</button>
                    <button class="mode-btn ${mode==='learn'?'mode-act':''}" onclick="chemicalProcessFlow.setMode('learn')">📖 学习模式</button>
                </div>
                ` : ''}
            </div>

            <div class="pf-main">
                <div class="process-selector">
                    <h4>📚 工艺流程库</h4>
                    <div class="process-list">
                        ${processList.map(p => `
                            <div class="process-item ${currentProcess && currentProcess.id === p.id ? 'active' : ''}"
                                onclick="chemicalProcessFlow.selectProcess('${p.id}')">
                                <div class="process-icon">${p.icon}</div>
                                <div class="process-info">
                                    <div class="process-name">${p.name}</div>
                                    <div class="process-desc">${p.description}</div>
                                    <div class="process-tag">${categories[p.category] || p.category}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${currentProcess ? `
                    ${mode === 'learn' ? `
                    <div class="flow-workspace">
                        <div class="workspace-header">
                            <h4>📖 ${currentProcess.icon} ${currentProcess.name} — 学习模式</h4>
                            <p>查看完整工艺流程和每个步骤的详细信息</p>
                        </div>
                        ${this.renderFlowDiagram()}
                        <div class="learn-cards">
                            ${currentProcess.steps.map((step, idx) => `
                                <div class="learn-card">
                                    <div class="learn-card-header">
                                        <span class="learn-step-num">${idx + 1}</span>
                                        <span class="learn-step-icon">${step.icon}</span>
                                        <span class="learn-step-name">${step.name}</span>
                                        ${step.conditions ? '<span class="learn-condition">' + step.conditions + '</span>' : ''}
                                    </div>
                                    <div class="learn-card-body">
                                        <div class="learn-section"><h6>📌 操作目的</h6><p>${step.purpose}</p></div>
                                        <div class="learn-section"><h6>⚙️ 反应原理</h6><p>${step.principle}</p></div>
                                        ${step.equations.length > 0 ? '<div class="learn-section"><h6>⚗️ 化学方程式</h6><div class="equations-list">' + step.equations.map(eq => '<div class="eq-item">' + eq + '</div>').join('') + '</div></div>' : ''}
                                        <div class="learn-section"><h6>🎯 考试设问</h6><div class="qa-list">' + step.examQA.map(qa => '<div class="qa-item"><div class="q">Q: ' + qa.q + '</div><div class="a">A: ' + qa.a + '</div></div>').join('') + '</div></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        ${currentProcess.gdPoints && currentProcess.gdPoints.length > 0 ? `
                        <div class="gd-section">
                            <h5>🎯 广东卷考点</h5>
                            <ul class="gd-points">${currentProcess.gdPoints.map(p => '<li>' + p + '</li>').join('')}</ul>
                        </div>
                        ` : ''}
                    </div>
                    ` : `
                    <div class="flow-workspace">
                        <div class="workspace-header">
                            <h4>🃏 ${currentProcess.icon} ${currentProcess.name} — 排序练习</h4>
                            <p>将操作步骤按正确顺序排列（拖拽卡片或使用↑↓按钮）</p>
                            <div class="workspace-actions">
                                <button class="btn btn-secondary" onclick="chemicalProcessFlow.shuffleCards()">🔀 重新打乱</button>
                                <button class="btn btn-secondary" onclick="chemicalProcessFlow.resetOrder()">↩️ 恢复初始</button>
                            </div>
                        </div>

                        <div class="cards-container" id="cards-container">
                            ${userOrder.map((step, idx) => this.renderCard(step, idx)).join('')}
                        </div>

                        <div class="workspace-controls">
                            <button class="btn btn-primary btn-block" onclick="chemicalProcessFlow.verifyOrder()">
                                ✓ 验证排序
                            </button>
                        </div>

                        <div id="flow-result" class="flow-result"></div>
                    </div>
                    `}
                ` : `
                    <div class="flow-placeholder">
                        <div class="placeholder-icon">🏭</div>
                        <p>请从左侧选择一个工艺流程</p>
                        <p>系统将展示该工艺的各个环节</p>
                    </div>
                `}
            </div>
        </div>`;

        if (currentProcess && mode === 'practice') {
            this.initDragAndDrop();
        }
    },

    renderCard(step, index) {
        const correctIdx = this.state.currentProcess.correctOrder.indexOf(step.id);
        return `
            <div class="node-card" draggable="true" data-index="${index}" id="card-${step.id}">
                <div class="card-header">
                    <div class="card-header-left">
                        <span class="card-icon">${step.icon}</span>
                        <span class="card-title">${step.name}</span>
                    </div>
                    <div class="card-header-right">
                        <span class="card-num">第${index + 1}位</span>
                        <div class="card-move-btns">
                            <button class="move-btn" onclick="event.stopPropagation();chemicalProcessFlow.moveCardUp(${index})" ${index===0?'disabled':''}>↑</button>
                            <button class="move-btn" onclick="event.stopPropagation();chemicalProcessFlow.moveCardDown(${index})" ${index===this.state.userOrder.length-1?'disabled':''}>↓</button>
                        </div>
                    </div>
                </div>
                <div class="card-summary" onclick="chemicalProcessFlow.toggleDetails('${step.id}')">
                    <span>${step.purpose}</span>
                    <span class="card-toggle">${this.state.showDetails === step.id ? '▲' : '▼'}</span>
                </div>
                <div class="card-details" id="details-${step.id}" style="display:${this.state.showDetails === step.id ? 'block' : 'none'}">
                    <div class="detail-section">
                        <h6>⚙️ 反应原理</h6>
                        <p>${step.principle}</p>
                    </div>
                    ${step.equations.length > 0 ? `
                        <div class="detail-section">
                            <h6>⚗️ 化学方程式</h6>
                            <div class="equations-list">
                                ${step.equations.map(eq => '<div class="eq-item">' + eq + '</div>').join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${step.conditions ? '<div class="detail-section"><h6>🌡️ 反应条件</h6><p>' + step.conditions + '</p></div>' : ''}
                    <div class="detail-section">
                        <h6>🎯 考试设问</h6>
                        <div class="qa-list">
                            ${step.examQA.map(qa => `
                                <div class="qa-item">
                                    <div class="q">Q: ${qa.q}</div>
                                    <div class="a">A: ${qa.a}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
/**
 * 化学方程式笔记本 - 分类收藏/搜索方程式，支持收藏与多选
 * @module equationNotebook
 * @example window.equationNotebook.renderNotebook()
 */
const equationNotebook = {
    state: {
        currentCategory: 'all',
        searchQuery: '',
        favoritesOnly: false,
        selectedEquations: new Set()
    },

    equations: {
        'redox': {
            name: '氧化还原反应',
            icon: '⚡',
            items: [
                { id: 'r1', equation: '2Na + Cl₂ → 2NaCl', type: '化合反应', substances: ['Na', 'Cl₂', 'NaCl'], conditions: '点燃', notes: '钠在氯气中燃烧，发出黄光，生成白烟' },
                { id: 'r2', equation: '4Fe + 3O₂ → 2Fe₂O₃', type: '化合反应', substances: ['Fe', 'O₂', 'Fe₂O₃'], conditions: '点燃', notes: '铁丝在氧气中燃烧，火星四射，生成黑色固体' },
                { id: 'r3', equation: '2Mg + CO₂ → 2MgO + C', type: '置换反应', substances: ['Mg', 'CO₂', 'MgO', 'C'], conditions: '点燃', notes: '镁条在CO₂中燃烧，是灭火原理的例外' },
                { id: 'r4', equation: 'Zn + H₂SO₄ → ZnSO₄ + H₂↑', type: '置换反应', substances: ['Zn', 'H₂SO₄', 'ZnSO₄', 'H₂'], conditions: '常温', notes: '锌与稀硫酸反应，实验室制氢气' },
                { id: 'r5', equation: '2H₂O₂ → 2H₂O + O₂↑', type: '分解反应', substances: ['H₂O₂', 'H₂O', 'O₂'], conditions: 'MnO₂催化', notes: '过氧化氢分解，实验室制氧气方法之一' },
                { id: 'r6', equation: 'Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag', type: '置换反应', substances: ['Cu', 'AgNO₃', 'Cu(NO₃)₂', 'Ag'], conditions: '常温', notes: '铜置换出银，溶液由无色变为蓝色' },
                { id: 'r7', equation: '2FeCl₃ + Cu → 2FeCl₂ + CuCl₂', type: '氧化还原', substances: ['FeCl₃', 'Cu', 'FeCl₂', 'CuCl₂'], conditions: '常温', notes: 'Fe³⁺氧化Cu，溶液由黄色变为绿色' },
                { id: 'r8', equation: 'SO₂ + 2H₂S → 3S + 2H₂O', type: '氧化还原', substances: ['SO₂', 'H₂S', 'S', 'H₂O'], conditions: '常温', notes: 'SO₂与H₂S反应，是酸雨形成的反应之一' }
            ]
        },
        'ionic': {
            name: '离子反应',
            icon: '💧',
            items: [
                { id: 'i1', equation: 'H⁺ + OH⁻ → H₂O', type: '中和反应', substances: ['H⁺', 'OH⁻', 'H₂O'], conditions: '任意', notes: '酸碱中和的本质，离子方程式' },
                { id: 'i2', equation: 'CO₃²⁻ + 2H⁺ → CO₂↑ + H₂O', type: '复分解', substances: ['CO₃²⁻', 'H⁺', 'CO₂', 'H₂O'], conditions: '任意', notes: '碳酸盐与酸反应，放出CO₂气体' },
                { id: 'i3', equation: 'Ba²⁺ + SO₄²⁻ → BaSO₄↓', type: '复分解', substances: ['Ba²⁺', 'SO₄²⁻', 'BaSO₄'], conditions: '任意', notes: '钡离子检验硫酸根，生成白色沉淀' },
                { id: 'i4', equation: 'Ag⁺ + Cl⁻ → AgCl↓', type: '复分解', substances: ['Ag⁺', 'Cl⁻', 'AgCl'], conditions: '任意', notes: '银离子检验氯离子，生成白色沉淀' },
                { id: 'i5', equation: 'Ca²⁺ + CO₃²⁻ → CaCO₃↓', type: '复分解', substances: ['Ca²⁺', 'CO₃²⁻', 'CaCO₃'], conditions: '任意', notes: '碳酸钙沉淀，鸡蛋壳成分' },
                { id: 'i6', equation: 'NH₄⁺ + OH⁻ → NH₃↑ + H₂O', type: '复分解', substances: ['NH₄⁺', 'OH⁻', 'NH₃', 'H₂O'], conditions: '加热', notes: '铵盐与碱反应，生成氨气' },
                { id: 'i7', equation: 'Fe³⁺ + 3OH⁻ → Fe(OH)₃↓', type: '复分解', substances: ['Fe³⁺', 'OH⁻', 'Fe(OH)₃'], conditions: '任意', notes: '铁离子与碱反应，生成红褐色沉淀' },
                { id: 'i8', equation: 'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓', type: '复分解', substances: ['Cu²⁺', 'OH⁻', 'Cu(OH)₂'], conditions: '任意', notes: '铜离子与碱反应，生成蓝色沉淀' }
            ]
        },
        'organic': {
            name: '有机转化反应',
            icon: '🔗',
            items: [
                { id: 'o1', equation: 'CH₄ + Cl₂ → CH₃Cl + HCl', type: '取代反应', substances: ['CH₄', 'Cl₂', 'CH₃Cl', 'HCl'], conditions: '光照', notes: '甲烷的氯代反应' },
                { id: 'o2', equation: 'C₂H₅OH → C₂H₄ + H₂O', type: '消去反应', substances: ['C₂H₅OH', 'C₂H₄', 'H₂O'], conditions: '浓H₂SO₄, 170°C', notes: '乙醇分子内脱水制乙烯' },
                { id: 'o3', equation: 'C₂H₄ + H₂O → C₂H₅OH', type: '加成反应', substances: ['C₂H₄', 'H₂O', 'C₂H₅OH'], conditions: '浓H₂SO₄', notes: '乙烯水化制乙醇' },
                { id: 'o4', equation: 'C₂H₅OH + CH₃COOH → CH₃COOC₂H₅ + H₂O', type: '酯化反应', substances: ['C₂H₅OH', 'CH₃COOH', 'CH₃COOC₂H₅', 'H₂O'], conditions: '浓H₂SO₄, 加热', notes: '乙醇与乙酸酯化，生成乙酸乙酯' },
                { id: 'o5', equation: 'C₂H₅OH + Na → C₂H₅ONa + H₂↑', type: '置换反应', substances: ['C₂H₅OH', 'Na', 'C₂H₅ONa', 'H₂'], conditions: '常温', notes: '乙醇与钠反应，放出氢气' },
                { id: 'o6', equation: 'CH₃CHO + H₂ → C₂H₅OH', type: '加成反应', substances: ['CH₃CHO', 'H₂', 'C₂H₅OH'], conditions: 'Ni, 加热', notes: '乙醛加氢还原为乙醇' },
                { id: 'o7', equation: '2CH₃CHO + O₂ → 2CH₃COOH', type: '氧化反应', substances: ['CH₃CHO', 'O₂', 'CH₃COOH'], conditions: '催化剂', notes: '乙醛氧化为乙酸' },
                { id: 'o8', equation: 'CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O', type: '酯化反应', substances: ['CH₃COOH', 'C₂H₅OH', 'CH₃COOC₂H₅', 'H₂O'], conditions: '浓H₂SO₄, 加热', notes: '可逆反应，生成酯和水' }
            ]
        },
        'process': {
            name: '工艺流程反应',
            icon: '🏭',
            items: [
                { id: 'p1', equation: '2Fe₂O₃ + 3C → 4Fe + 3CO₂↑', type: '还原反应', substances: ['Fe₂O₃', 'C', 'Fe', 'CO₂'], conditions: '高温', notes: '高炉炼铁的核心反应' },
                { id: 'p2', equation: 'CaCO₃ → CaO + CO₂↑', type: '分解反应', substances: ['CaCO₃', 'CaO', 'CO₂'], conditions: '高温', notes: '石灰石分解，生石灰的制备' },
                { id: 'p3', equation: 'SiO₂ + Na₂CO₃ → Na₂SiO₃ + CO₂↑', type: '复杂反应', substances: ['SiO₂', 'Na₂CO₃', 'Na₂SiO₃', 'CO₂'], conditions: '高温', notes: '玻璃工业反应' },
                { id: 'p4', equation: '2SO₂ + O₂ ⇌ 2SO₃', type: '化合反应', substances: ['SO₂', 'O₂', 'SO₃'], conditions: 'V₂O₅, 400-500°C', notes: '接触法制硫酸的核心反应' },
                { id: 'p5', equation: 'N₂ + 3H₂ ⇌ 2NH₃', type: '化合反应', substances: ['N₂', 'H₂', 'NH₃'], conditions: 'Fe, 高温高压', notes: '合成氨反应，哈伯法' },
                { id: 'p6', equation: '4NH₃ + 5O₂ → 4NO + 6H₂O', type: '氧化反应', substances: ['NH₃', 'O₂', 'NO', 'H₂O'], conditions: 'Pt-Rh, 加热', notes: '氨的催化氧化，工业制硝酸' },
                { id: 'p7', equation: '3NO₂ + H₂O → 2HNO₃ + NO', type: '氧化还原', substances: ['NO₂', 'H₂O', 'HNO₃', 'NO'], conditions: '常温', notes: 'NO₂与水反应，工业制硝酸' },
                { id: 'p8', equation: 'Al₂O₃ + 2NaOH → 2NaAlO₂ + H₂O', type: '复杂反应', substances: ['Al₂O₃', 'NaOH', 'NaAlO₂', 'H₂O'], conditions: '加热', notes: '铝土矿的碱溶，制铝工艺' }
            ]
        }
    },

    favorites: JSON.parse(localStorage.getItem('equationFavorites') || '[]'),

    toggleFavorite(id) {
        const idx = this.favorites.indexOf(id);
        if (idx > -1) {
            this.favorites.splice(idx, 1);
        } else {
            this.favorites.push(id);
        }
        localStorage.setItem('equationFavorites', JSON.stringify(this.favorites));
        this.renderNotebook();
    },

    isFavorite(id) {
        return this.favorites.includes(id);
    },

    setCategory(cat) {
        this.state.currentCategory = cat;
        this.renderNotebook();
    },

    setSearch(query) {
        this.state.searchQuery = query;
        this.renderNotebook();
    },

    toggleFavoritesOnly() {
        this.state.favoritesOnly = !this.state.favoritesOnly;
        this.renderNotebook();
    },

    toggleSelect(id) {
        if (this.state.selectedEquations.has(id)) {
            this.state.selectedEquations.delete(id);
        } else {
            this.state.selectedEquations.add(id);
        }
        this.renderNotebook();
    },

    getFilteredEquations() {
        let cats = this.state.currentCategory === 'all'
            ? Object.keys(this.equations)
            : [this.state.currentCategory];

        let results = [];
        cats.forEach(cat => {
            this.equations[cat].items.forEach(eq => {
                if (this.state.favoritesOnly && !this.isFavorite(eq.id)) return;

                if (this.state.searchQuery) {
                    const q = this.state.searchQuery.toLowerCase();
                    const match = eq.equation.toLowerCase().includes(q) ||
                        eq.substances.some(s => s.toLowerCase().includes(q)) ||
                        eq.type.toLowerCase().includes(q) ||
                        (eq.notes && eq.notes.toLowerCase().includes(q));
                    if (match) results.push(eq);
                } else {
                    results.push(eq);
                }
            });
        });

        return results;
    },

    exportToPDF() {
        const selected = Array.from(this.state.selectedEquations);
        if (selected.length === 0) {
            alert('请先选择要导出的方程式');
            return;
        }

        let content = '高中化学方程式速录本\n';
        content += '========================\n\n';

        selected.forEach(id => {
            let eq = null;
            for (const cat of Object.values(this.equations)) {
                eq = cat.items.find(item => item.id === id);
                if (eq) break;
            }
            if (eq) {
                content += `【${eq.type}】\n`;
                content += `${eq.equation}\n`;
                content += `反应物：${eq.substances.slice(0, Math.ceil(eq.substances.length/2)).join(', ')}\n`;
                content += `生成物：${eq.substances.slice(Math.ceil(eq.substances.length/2)).join(', ')}\n`;
                content += `条件：${eq.conditions}\n`;
                if (eq.notes) content += `备注：${eq.notes}\n`;
                content += '\n---\n\n';
            }
        });

        content += '\n========================\n';
        content += `共导出 ${selected.length} 个方程式\n`;
        content += `导出时间：${new Date().toLocaleString('zh-CN')}\n`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '化学方程式速录本.txt';
        a.click();
        URL.revokeObjectURL(url);
    },

    renderNotebook() {
        const app = document.getElementById('equation-notebook-app');
        if (!app) return;

        const filtered = this.getFilteredEquations();
        const categories = Object.keys(this.equations);

        app.innerHTML = `
            <div class="equation-notebook">
                <div class="en-header">
                    <h3>📝 化学方程式速录本</h3>
                    <div class="en-controls">
                        <button class="btn btn-secondary" onclick="equationNotebook.exportToPDF()">
                            📄 导出选中
                        </button>
                        <button class="btn ${this.state.favoritesOnly ? 'btn-primary' : 'btn-secondary'}"
                            onclick="equationNotebook.toggleFavoritesOnly()">
                            ${this.state.favoritesOnly ? '⭐ 已收藏' : '☆ 收藏'}
                        </button>
                    </div>
                </div>

                <div class="en-filters">
                    <div class="search-box">
                        <input type="text" placeholder="搜索方程式、物质或类型..."
                            value="${this.state.searchQuery}"
                            oninput="equationNotebook.setSearch(this.value)">
                    </div>
                    <div class="category-tabs">
                        <button class="cat-tab ${this.state.currentCategory === 'all' ? 'active' : ''}"
                            onclick="equationNotebook.setCategory('all')">
                            全部
                        </button>
                        ${categories.map(cat => `
                            <button class="cat-tab ${this.state.currentCategory === cat ? 'active' : ''}"
                                onclick="equationNotebook.setCategory('${cat}')">
                                ${this.equations[cat].icon} ${this.equations[cat].name}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="en-stats">
                    <span>共 ${filtered.length} 个方程式</span>
                    <span>已选择 ${this.state.selectedEquations.size} 个</span>
                </div>

                <div class="equations-grid">
                    ${filtered.length === 0 ? `
                        <div class="no-results">
                            <p>没有找到符合条件的方程式</p>
                            <p>试试其他关键词或取消筛选</p>
                        </div>
                    ` : filtered.map(eq => `
                        <div class="equation-card ${this.state.selectedEquations.has(eq.id) ? 'selected' : ''}"
                            onclick="equationNotebook.toggleSelect('${eq.id}')">
                            <div class="eq-header">
                                <span class="eq-type">${eq.type}</span>
                                <button class="fav-btn ${this.isFavorite(eq.id) ? 'active' : ''}"
                                    onclick="event.stopPropagation(); equationNotebook.toggleFavorite('${eq.id}')">
                                    ${this.isFavorite(eq.id) ? '⭐' : '☆'}
                                </button>
                            </div>
                            <div class="eq-equation">${eq.equation}</div>
                            <div class="eq-details">
                                <div class="eq-condition">条件：${eq.conditions}</div>
                                ${eq.notes ? `<div class="eq-notes">${eq.notes}</div>` : ''}
                            </div>
                            <div class="eq-substances">
                                ${eq.substances.map(s => `<span class="substance-tag">${s}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="en-footer">
                    <div class="info-box">
                        <h4>💡 使用说明</h4>
                        <ul>
                            <li>点击卡片可选择/取消选择方程式</li>
                            <li>点击⭐收藏方程式，收藏的方程式会保存到本地</li>
                            <li>使用搜索框可按物质名称、反应类型搜索</li>
                            <li>选择方程式后点击"导出选中"可下载复习资料</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
};
/**
 * 有机物转化关系图 - 物质库与反应连线可视化，支持搜索与详情查看
 * @module organicConverter
 * @example window.organicConverter.renderConverter()
 */
const organicConverter = {
    state: {
        selectedSubstances: [],
        connections: [],
        viewMode: 'diagram',
        searchQuery: '',
        highlightType: null,
        selectedDetail: null,
        showAllReactions: false
    },

    substanceLibrary: {
        'methane': { id: 'methane', name: '甲烷', formula: 'CH₄', category: '烷烃', color: '#3498db', properties: ['无色无味气体', '难溶于水', '密度小于空气', '天然气主要成分'], reactions: [] },
        'ethane': { id: 'ethane', name: '乙烷', formula: 'C₂H₆', category: '烷烃', color: '#2980b9', properties: ['无色无味气体', '可燃', '石油裂解产物'], reactions: [] },
        'propane': { id: 'propane', name: '丙烷', formula: 'C₃H₈', category: '烷烃', color: '#2471a3', properties: ['无色气体', '液化石油气成分'], reactions: [] },
        'ethylene': { id: 'ethylene', name: '乙烯', formula: 'C₂H₄', category: '烯烃', color: '#e74c3c', properties: ['无色略带甜味气体', '稍溶于水', '可作果实催熟剂', '石油化工基础原料'], reactions: [] },
        'propene': { id: 'propene', name: '丙烯', formula: 'C₃H₆', category: '烯烃', color: '#c0392b', properties: ['无色气体', '加聚反应制聚丙烯'], reactions: [] },
        'butadiene': { id: 'butadiene', name: '1,3-丁二烯', formula: 'CH₂=CH-CH=CH₂', category: '烯烃', color: '#a93226', properties: ['共轭二烯烃', '可发生1,2-加成和1,4-加成'], reactions: [] },
        'acetylene': { id: 'acetylene', name: '乙炔', formula: 'C₂H₂', category: '炔烃', color: '#9b59b6', properties: ['无色无味气体', '微溶于水', '氧炔焰温度3000℃以上'], reactions: [] },
        'benzene': { id: 'benzene', name: '苯', formula: 'C₆H₆', category: '芳香烃', color: '#f39c12', properties: ['无色有特殊气味液体', '密度小于水', '易挥发', '不使KMnO₄褪色'], reactions: [] },
        'toluene': { id: 'toluene', name: '甲苯', formula: 'C₇H₈', category: '芳香烃', color: '#d35400', properties: ['无色有芳香气味', '不溶于水', '侧链可被KMnO₄氧化'], reactions: [] },
        'styrene': { id: 'styrene', name: '苯乙烯', formula: 'C₆H₅CH=CH₂', category: '芳香烃', color: '#e67e22', properties: ['无色液体', '可加聚制聚苯乙烯'], reactions: [] },
        'chloromethane': { id: 'chloromethane', name: '一氯甲烷', formula: 'CH₃Cl', category: '卤代烃', color: '#1abc9c', properties: ['无色气体', '微溶于水'], reactions: [] },
        'chloroethane': { id: 'chloroethane', name: '氯乙烷', formula: 'C₂H₅Cl', category: '卤代烃', color: '#2ecc71', properties: ['无色气体', '低温可液化', '可作冷冻剂'], reactions: [] },
        'chlorobenzene': { id: 'chlorobenzene', name: '氯苯', formula: 'C₆H₅Cl', category: '卤代烃', color: '#27ae60', properties: ['无色液体', '不溶于水'], reactions: [] },
        'bromoethane': { id: 'bromoethane', name: '溴乙烷', formula: 'C₂H₅Br', category: '卤代烃', color: '#16a085', properties: ['无色液体', '不溶于水', '卤代烃代表物'], reactions: [] },
        'ethanol': { id: 'ethanol', name: '乙醇', formula: 'C₂H₅OH', category: '醇', color: '#3498db', properties: ['无色有特殊气味', '易溶于水', '可燃', '能杀菌消毒(75%)'], reactions: [] },
        'methanol': { id: 'methanol', name: '甲醇', formula: 'CH₃OH', category: '醇', color: '#2980b9', properties: ['无色易挥发液体', '有毒', '可致失明'], reactions: [] },
        'ethylene-glycol': { id: 'ethylene-glycol', name: '乙二醇', formula: 'HOCH₂CH₂OH', category: '醇', color: '#16a085', properties: ['无色粘稠液体', '易溶于水', '防冻剂'], reactions: [] },
        'glycerol': { id: 'glycerol', name: '甘油', formula: 'C₃H₈O₃', category: '醇', color: '#8e44ad', properties: ['无色粘稠液体', '有吸湿性', '溶于水', '日用化工原料'], reactions: [] },
        'phenol': { id: 'phenol', name: '苯酚', formula: 'C₆H₅OH', category: '酚', color: '#e91e63', properties: ['无色晶体(粉红色)', '有特殊气味', '微溶于水(65℃以上互溶)', '有毒', '弱酸性'], reactions: [] },
        'acetaldehyde': { id: 'acetaldehyde', name: '乙醛', formula: 'CH₃CHO', category: '醛', color: '#ff5722', properties: ['无色有刺激性气味', '易溶于水', '易氧化', '可发生银镜反应'], reactions: [] },
        'formaldehyde': { id: 'formaldehyde', name: '甲醛', formula: 'HCHO', category: '醛', color: '#ff9800', properties: ['无色有刺激性气味', '易溶于水', '有毒', '能凝固蛋白质', '防腐剂'], reactions: [] },
        'benzaldehyde': { id: 'benzaldehyde', name: '苯甲醛', formula: 'C₆H₅CHO', category: '醛', color: '#f44336', properties: ['无色有苦杏仁味', '不溶于水'], reactions: [] },
        'acetone': { id: 'acetone', name: '丙酮', formula: 'CH₃COCH₃', category: '酮', color: '#795548', properties: ['无色易挥发液体', '易溶于水', '常见溶剂'], reactions: [] },
        'acetic-acid': { id: 'acetic-acid', name: '乙酸', formula: 'CH₃COOH', category: '羧酸', color: '#e91e63', properties: ['无色有刺激性气味液体', '易溶于水', '醋的主要成分', '弱酸'], reactions: [] },
        'formic-acid': { id: 'formic-acid', name: '甲酸', formula: 'HCOOH', category: '羧酸', color: '#d32f2f', properties: ['无色有刺激性气味', '易溶于水', '有腐蚀性', '同时含醛基和羧基'], reactions: [] },
        'oxalic-acid': { id: 'oxalic-acid', name: '草酸', formula: 'HOOC-COOH', category: '羧酸', color: '#7b1fa2', properties: ['无色晶体', '溶于水', '有还原性'], reactions: [] },
        'benzoic-acid': { id: 'benzoic-acid', name: '苯甲酸', formula: 'C₆H₅COOH', category: '羧酸', color: '#c62828', properties: ['白色晶体', '微溶于水', '防腐剂'], reactions: [] },
        'methyl-acetate': { id: 'methyl-acetate', name: '乙酸甲酯', formula: 'CH₃COOCH₃', category: '酯', color: '#009688', properties: ['无色有香味液体', '易挥发'], reactions: [] },
        'ethyl-acetate': { id: 'ethyl-acetate', name: '乙酸乙酯', formula: 'CH₃COOC₂H₅', category: '酯', color: '#00bcd4', properties: ['无色有果香味液体', '易挥发', '难溶于水', '常用溶剂'], reactions: [] },
        'methyl-formate': { id: 'methyl-formate', name: '甲酸甲酯', formula: 'HCOOCH₃', category: '酯', color: '#00897b', properties: ['无色有香味', '易挥发'], reactions: [] },
        'sodium-acetate': { id: 'sodium-acetate', name: '乙酸钠', formula: 'CH₃COONa', category: '盐', color: '#607d8b', properties: ['白色粉末', '易溶于水'], reactions: [] },
        'sodium-formate': { id: 'sodium-formate', name: '甲酸钠', formula: 'HCOONa', category: '盐', color: '#78909c', properties: ['白色粉末', '易溶于水'], reactions: [] },
        'glucose': { id: 'glucose', name: '葡萄糖', formula: 'C₆H₁₂O₆', category: '糖类', color: '#ff6f00', properties: ['白色晶体', '易溶于水', '多羟基醛', '可发生银镜反应'], reactions: [] },
        'sucrose': { id: 'sucrose', name: '蔗糖', formula: 'C₁₂H₂₂O₁₁', category: '糖类', color: '#f57c00', properties: ['白色晶体', '易溶于水', '二糖', '无醛基不发生银镜反应'], reactions: [] },
        'starch': { id: 'starch', name: '淀粉', formula: '(C₆H₁₀O₅)ₙ', category: '糖类', color: '#ef6c00', properties: ['白色粉末', '不溶于冷水', '多糖', '遇碘变蓝'], reactions: [] },
        'cellulose': { id: 'cellulose', name: '纤维素', formula: '(C₆H₁₀O₅)ₙ', category: '糖类', color: '#e65100', properties: ['白色纤维状', '不溶于水', '多糖', '可制硝化纤维'], reactions: [] },
        'peptide': { id: 'peptide', name: '多肽', formula: '—CO—NH—', category: '蛋白质', color: '#4a148c', properties: ['氨基酸缩合产物', '含肽键', '可水解'], reactions: [] },
        'protein': { id: 'protein', name: '蛋白质', formula: '复杂高分子', category: '蛋白质', color: '#6a1b9a', properties: ['含C/H/O/N/S', '可盐析/变性/水解', '遇浓HNO₃变黄'], reactions: [] },
        'triglyceride': { id: 'triglyceride', name: '油脂', formula: '混合物', category: '脂类', color: '#827717', properties: ['高级脂肪酸甘油酯', '可皂化', '密度小于水'], reactions: [] },
        'soap': { id: 'soap', name: '肥皂', formula: 'RCOONa', category: '脂类', color: '#9e9d24', properties: ['高级脂肪酸钠', '可降低表面张力', '硬水失效'], reactions: [] }
    },

    conversionRules: [
        { from: 'methane', to: 'chloromethane', reaction: 'CH₄ + Cl₂ → CH₃Cl + HCl', conditions: '光照', type: '取代反应', gdPoint: '广东卷高频：取代反应条件辨析' },
        { from: 'methane', to: 'acetylene', reaction: '2CH₄ → C₂H₂ + 3H₂', conditions: '高温(1500℃)', type: '分解反应', gdPoint: '' },
        { from: 'ethylene', to: 'chloroethane', reaction: 'C₂H₄ + HCl → C₂H₅Cl', conditions: '催化剂', type: '加成反应', gdPoint: '加成vs取代：乙烯加HCl是加成' },
        { from: 'ethylene', to: 'ethanol', reaction: 'C₂H₄ + H₂O → C₂H₅OH', conditions: '浓H₂SO₄,加热加压', type: '加成反应(水化)', gdPoint: '广东卷高频：乙烯水化法制乙醇' },
        { from: 'ethylene', to: 'acetaldehyde', reaction: 'C₂H₄ → CH₃CHO', conditions: '催化氧化(PdCl₂/CuCl₂)', type: '氧化反应', gdPoint: '工业制乙醛的Wacker法' },
        { from: 'ethylene', to: 'propene', reaction: '2C₂H₄ → C₃H₆ + CH₄', conditions: '催化歧化', type: '歧化反应', gdPoint: '' },
        { from: 'ethylene', to: 'butadiene', reaction: '2C₂H₄ → CH₂=CH-CH=CH₂ + H₂', conditions: '催化脱氢偶联', type: '偶联反应', gdPoint: '' },
        { from: 'ethylene', to: 'styrene', reaction: 'C₂H₄ + C₆H₆ → C₆H₅CH=CH₂ + H₂', conditions: '催化', type: '偶联反应', gdPoint: '' },
        { from: 'acetylene', to: 'acetaldehyde', reaction: 'C₂H₂ + H₂O → CH₃CHO', conditions: 'HgSO₄/H₂SO₄', type: '加成反应(水化)', gdPoint: '广东卷高频：乙炔水化法制乙醛' },
        { from: 'acetylene', to: 'chloroethane', reaction: 'C₂H₂ + 2H₂ → C₂H₆ → C₂H₅Cl', conditions: 'Ni,Δ then HCl', type: '加成反应', gdPoint: '注意：先加H₂再加HCl' },
        { from: 'benzene', to: 'toluene', reaction: 'C₆H₆ + CH₃Cl → C₆H₅CH₃ + HCl', conditions: 'AlCl₃催化剂', type: '取代反应(烷基化)', gdPoint: '' },
        { from: 'benzene', to: 'chlorobenzene', reaction: 'C₆H₆ + Cl₂ → C₆H₅Cl + HCl', conditions: 'FeCl₃催化剂', type: '取代反应', gdPoint: '广东卷高频：苯的卤代条件FeCl₃' },
        { from: 'benzene', to: 'styrene', reaction: 'C₆H₆ + C₂H₄ → C₆H₅CH=CH₂', conditions: '催化', type: '烷基化+脱氢', gdPoint: '' },
        { from: 'benzene', to: 'phenol', reaction: 'C₆H₆ → C₆H₅OH', conditions: '丙烯异丙苯法', type: '间接合成', gdPoint: '工业制苯酚：异丙苯法' },
        { from: 'benzene', to: 'benzoic-acid', reaction: 'C₆H₅CH₃ → C₆H₅COOH', conditions: 'KMnO₄氧化侧链', type: '氧化反应', gdPoint: '广东卷高频：苯环侧链可被KMnO₄氧化' },
        { from: 'toluene', to: 'benzoic-acid', reaction: 'C₇H₈ + [O] → C₆H₅COOH + H₂O', conditions: 'KMnO₄/H⁺', type: '氧化反应', gdPoint: '甲苯侧链氧化成苯甲酸' },
        { from: 'toluene', to: 'benzaldehyde', reaction: 'C₇H₈ + [O] → C₆H₅CHO + H₂O', conditions: 'MnO₂/H₂SO₄', type: '氧化反应', gdPoint: '' },
        { from: 'chloroethane', to: 'ethanol', reaction: 'C₂H₅Cl + NaOH → C₂H₅OH + NaCl', conditions: 'NaOH水溶液,加热', type: '取代反应(水解)', gdPoint: '广东卷高频：卤代烃水解条件' },
        { from: 'chloroethane', to: 'ethylene', reaction: 'C₂H₅Cl + NaOH → C₂H₄ + NaCl + H₂O', conditions: 'NaOH醇溶液,加热', type: '消去反应', gdPoint: '广东卷必考：卤代烃消去条件NaOH/醇' },
        { from: 'bromoethane', to: 'ethanol', reaction: 'C₂H₅Br + NaOH → C₂H₅OH + NaBr', conditions: 'NaOH水溶液,加热', type: '取代反应(水解)', gdPoint: '溴乙烷是卤代烃水解代表物' },
        { from: 'bromoethane', to: 'ethylene', reaction: 'C₂H₅Br + NaOH → C₂H₄ + NaBr + H₂O', conditions: 'NaOH醇溶液,加热', type: '消去反应', gdPoint: '广东卷必考：消去反应条件' },
        { from: 'chlorobenzene', to: 'phenol', reaction: 'C₆H₅Cl + NaOH → C₆H₅OH + NaCl', conditions: 'NaOH,高温高压', type: '取代反应(水解)', gdPoint: '氯苯水解条件比卤代烷烃苛刻' },
        { from: 'ethanol', to: 'ethylene', reaction: 'C₂H₅OH → C₂H₄ + H₂O', conditions: '浓H₂SO₄, 170℃', type: '消去反应', gdPoint: '广东卷必考：乙醇消去制乙烯(170℃)' },
        { from: 'ethanol', to: 'acetaldehyde', reaction: '2C₂H₅OH + O₂ → 2CH₃CHO + 2H₂O', conditions: 'Cu或Ag, 加热', type: '催化氧化', gdPoint: '广东卷高频：乙醇催化氧化' },
        { from: 'ethanol', to: 'ethyl-acetate', reaction: 'C₂H₅OH + CH₃COOH ⇌ CH₃COOC₂H₅ + H₂O', conditions: '浓H₂SO₄, 加热', type: '酯化反应(取代)', gdPoint: '广东卷必考：酯化反应可逆' },
        { from: 'ethanol', to: 'chloroethane', reaction: 'C₂H₅OH + HCl → C₂H₅Cl + H₂O', conditions: '加热', type: '取代反应', gdPoint: '' },
        { from: 'ethanol', to: 'sodium-acetate', reaction: 'C₂H₅OH → CH₃CHO → CH₃COOH → CH₃COONa', conditions: '逐步氧化再中和', type: '连续转化', gdPoint: '' },
        { from: 'phenol', to: 'benzene', reaction: 'C₆H₅OH → C₆H₆', conditions: '锌粉蒸馏', type: '脱羟基', gdPoint: '' },
        { from: 'acetaldehyde', to: 'ethanol', reaction: 'CH₃CHO + H₂ → C₂H₅OH', conditions: 'Ni催化剂, 加热', type: '加成反应(还原)', gdPoint: '醛的加成/还原反应' },
        { from: 'acetaldehyde', to: 'acetic-acid', reaction: 'CH₃CHO + O₂ → CH₃COOH', conditions: '催化剂, 加热', type: '氧化反应', gdPoint: '广东卷高频：乙醛氧化制乙酸' },
        { from: 'acetaldehyde', to: 'ethyl-acetate', reaction: 'CH₃CHO → CH₃COOH → CH₃COOC₂H₅', conditions: '先氧化再酯化', type: '连续转化', gdPoint: 'Tollen试剂(银镜)检验醛基' },
        { from: 'formaldehyde', to: 'formic-acid', reaction: 'HCHO + O₂ → HCOOH', conditions: '催化剂', type: '氧化反应', gdPoint: '' },
        { from: 'formaldehyde', to: 'methanol', reaction: 'HCHO + H₂ → CH₃OH', conditions: 'Ni, 加热', type: '加成反应(还原)', gdPoint: '' },
        { from: 'benzaldehyde', to: 'benzoic-acid', reaction: 'C₆H₅CHO + [O] → C₆H₅COOH', conditions: 'O₂或KMnO₄', type: '氧化反应', gdPoint: '' },
        { from: 'acetic-acid', to: 'ethyl-acetate', reaction: 'CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O', conditions: '浓H₂SO₄, 加热', type: '酯化反应(取代)', gdPoint: '广东卷必考：酯化反应原理' },
        { from: 'acetic-acid', to: 'methyl-acetate', reaction: 'CH₃COOH + CH₃OH ⇌ CH₃COOCH₃ + H₂O', conditions: '浓H₂SO₄, 加热', type: '酯化反应', gdPoint: '' },
        { from: 'acetic-acid', to: 'sodium-acetate', reaction: 'CH₃COOH + NaOH → CH₃COONa + H₂O', conditions: '常温', type: '中和反应', gdPoint: '' },
        { from: 'acetic-acid', to: 'acetaldehyde', reaction: 'CH₃COOH → CH₃CHO', conditions: 'LiAlH₄还原', type: '还原反应', gdPoint: '实验室方法' },
        { from: 'formic-acid', to: 'sodium-formate', reaction: 'HCOOH + NaOH → HCOONa + H₂O', conditions: '常温', type: '中和反应', gdPoint: '' },
        { from: 'formic-acid', to: 'methyl-formate', reaction: 'HCOOH + CH₃OH ⇌ HCOOCH₃ + H₂O', conditions: '浓H₂SO₄, 加热', type: '酯化反应', gdPoint: '' },
        { from: 'ethyl-acetate', to: 'ethanol', reaction: 'CH₃COOC₂H₅ + NaOH → CH₃COONa + C₂H₅OH', conditions: 'NaOH水溶液,加热', type: '水解反应', gdPoint: '广东卷必考：酯的水解(碱性)' },
        { from: 'ethyl-acetate', to: 'acetic-acid', reaction: 'CH₃COOC₂H₅ + H₂O ⇌ CH₃COOH + C₂H₅OH', conditions: '稀H₂SO₄,加热', type: '水解反应(酸性)', gdPoint: '广东卷：酸性水解可逆vs碱性水解完全' },
        { from: 'methyl-acetate', to: 'acetic-acid', reaction: 'CH₃COOCH₃ + H₂O → CH₃COOH + CH₃OH', conditions: '稀H₂SO₄或NaOH', type: '水解反应', gdPoint: '' },
        { from: 'glucose', to: 'ethanol', reaction: 'C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂↑', conditions: '酵母菌,无氧', type: '发酵反应', gdPoint: '广东卷高频：葡萄糖发酵制乙醇' },
        { from: 'glucose', to: 'acetic-acid', reaction: 'C₆H₁₂O₆ → 2CH₃COOH', conditions: '醋酸菌,有氧', type: '发酵反应', gdPoint: '' },
        { from: 'sucrose', to: 'glucose', reaction: 'C₁₂H₂₂O₁₁ + H₂O → C₆H₁₂O₆ + C₆H₁₂O₆', conditions: '稀H₂SO₄,加热', type: '水解反应', gdPoint: '蔗糖水解生成葡萄糖+果糖' },
        { from: 'starch', to: 'glucose', reaction: '(C₆H₁₀O₅)ₙ + nH₂O → nC₆H₁₂O₆', conditions: '稀H₂SO₄,加热', type: '水解反应', gdPoint: '广东卷：淀粉水解程度检验' },
        { from: 'cellulose', to: 'glucose', reaction: '(C₆H₁₀O₅)ₙ + nH₂O → nC₆H₁₂O₆', conditions: '浓H₂SO₄催化,加热', type: '水解反应', gdPoint: '' },
        { from: 'triglyceride', to: 'soap', reaction: '油脂 + NaOH → 皂化反应 → RCOONa + 甘油', conditions: 'NaOH, 加热', type: '皂化反应(水解)', gdPoint: '广东卷：皂化反应原理' },
        { from: 'triglyceride', to: 'glycerol', reaction: '油脂 + NaOH → RCOONa + 甘油', conditions: 'NaOH, 加热', type: '皂化反应', gdPoint: '皂化反应的副产物是甘油' },
        { from: 'protein', to: 'peptide', reaction: '蛋白质 → 多肽 + 氨基酸', conditions: '酶或酸碱,加热', type: '水解反应', gdPoint: '蛋白质水解断肽键' },
        { from: 'peptide', to: 'protein', reaction: '氨基酸 → 多肽 → 蛋白质', conditions: '缩合反应', type: '缩合反应', gdPoint: '' }
    ],

    reactionTypes: ['取代反应', '加成反应', '消去反应', '氧化反应', '还原反应', '酯化反应(取代)', '水解反应', '加成反应(水化)', '加成反应(还原)', '催化氧化', '分解反应', '皂化反应(水解)', '发酵反应', '中和反应', '缩合反应', '连续转化', '歧化反应', '偶联反应', '间接合成', '烷基化+脱氢', '取代反应(烷基化)', '取代反应(水解)', '脱羟基'],

    addSubstance(substanceId) {
        if (this.state.selectedSubstances.includes(substanceId)) return;
        this.state.selectedSubstances.push(substanceId);
        this.updateConnections();
        this.renderConverter();
    },

    removeSubstance(substanceId) {
        const idx = this.state.selectedSubstances.indexOf(substanceId);
        if (idx > -1) {
            this.state.selectedSubstances.splice(idx, 1);
            this.updateConnections();
            this.renderConverter();
        }
    },

    updateConnections() {
        this.state.connections = [];
        for (let i = 0; i < this.state.selectedSubstances.length; i++) {
            for (let j = i + 1; j < this.state.selectedSubstances.length; j++) {
                const from = this.state.selectedSubstances[i];
                const to = this.state.selectedSubstances[j];
                const conversions = this.conversionRules.filter(r =>
                    (r.from === from && r.to === to) || (r.from === to && r.to === from)
                );
                conversions.forEach(conversion => {
                    this.state.connections.push({ from, to, ...conversion });
                });
            }
        }
    },

    getConversionsFor(substanceId) {
        return this.conversionRules.filter(r => r.from === substanceId || r.to === substanceId);
    },

    setViewMode(mode) {
        this.state.viewMode = mode;
        this.renderConverter();
    },

    setHighlightType(type) {
        this.state.highlightType = this.state.highlightType === type ? null : type;
        this.renderConverter();
    },

    toggleShowAll() {
        this.state.showAllReactions = !this.state.showAllReactions;
        this.renderConverter();
    },

    searchSubstances(query) {
        this.state.searchQuery = query.toLowerCase();
        this.renderConverter();
    },

    loadPreset(name) {
        this.state.selectedSubstances = [];
        this.state.connections = [];
        const presets = {
            'ethanol-chain': ['ethylene', 'ethanol', 'acetaldehyde', 'acetic-acid', 'ethyl-acetate', 'sodium-acetate'],
            'benzene-family': ['benzene', 'toluene', 'chlorobenzene', 'phenol', 'benzaldehyde', 'benzoic-acid', 'styrene'],
            'halo-derivatives': ['methane', 'chloromethane', 'chloroethane', 'bromoethane', 'ethanol', 'ethylene'],
            'carbonyl': ['acetylene', 'acetaldehyde', 'formaldehyde', 'acetone', 'acetic-acid', 'formic-acid', 'ethanol'],
            'ester-system': ['ethanol', 'methanol', 'acetic-acid', 'formic-acid', 'ethyl-acetate', 'methyl-acetate', 'methyl-formate'],
            'sugar-system': ['glucose', 'sucrose', 'starch', 'cellulose', 'ethanol', 'acetic-acid']
        };
        if (presets[name]) {
            this.state.selectedSubstances = [...presets[name]];
            this.updateConnections();
            this.renderConverter();
        }
    },

    _computeLayout() {
        const subs = this.state.selectedSubstances;
        if (subs.length === 0) return { nodes: [], edges: [], width: 1000, height: 700 };

        const width = 1000, height = 700;
        const padding = 100;
        const nodeRadius = 50;
        
        // 使用层次化布局 + 力导向优化
        // 首先构建邻接表
        const adj = {};
        subs.forEach(id => adj[id] = []);
        this.state.connections.forEach(conn => {
            if (!adj[conn.from]) adj[conn.from] = [];
            if (!adj[conn.to]) adj[conn.to] = [];
            adj[conn.from].push(conn.to);
            adj[conn.to].push(conn.from);
        });

        // 计算每个节点的度数并排序
        const degrees = subs.map(id => ({
            id,
            degree: (adj[id] || []).length,
            ...this.substanceLibrary[id]
        })).sort((a, b) => b.degree - a.degree);

        // 层次化布局：根据连接关系分层
        const levels = {};
        const visited = new Set();
        let currentLevel = 0;

        function assignLevel(nodeId, level) {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            if (!levels[level]) levels[level] = [];
            levels[level].push(nodeId);

            // 找到未访问的邻居，分配到下一层
            const neighbors = (adj[nodeId] || []).filter(n => !visited.has(n));
            if (neighbors.length > 0) {
                neighbors.forEach(n => assignLevel(n, level + 1));
            }
        }

        // 从度数最高的节点开始分配层次
        if (degrees.length > 0) {
            assignLevel(degrees[0].id, 0);
            // 处理未访问的节点
            subs.forEach(id => {
                if (!visited.has(id)) {
                    assignLevel(id, Object.keys(levels).length || 0);
                }
            });
        } else {
            subs.forEach((id, i) => {
                if (!levels[i % 3]) levels[i % 3] = [];
                levels[i % 3].push(id);
            });
        }

        // 根据层次计算位置
        const levelKeys = Object.keys(levels).map(Number).sort((a, b) => a - b);
        const numLevels = Math.max(levelKeys.length, 1);
        const levelHeight = (height - padding * 2) / Math.max(numLevels - 1, 1);

        const nodes = [];
        levelKeys.forEach((level, li) => {
            const nodesInLevel = levels[level];
            const y = padding + li * levelHeight;
            const xStep = (width - padding * 2) / Math.max(nodesInLevel.length - 1, 1);
            
            nodesInLevel.forEach((id, ni) => {
                nodes.push({
                    id,
                    x: padding + ni * xStep + (Math.random() - 0.5) * 30,
                    y: y + (Math.random() - 0.5) * 30,
                    ...this.substanceLibrary[id]
                });
            });
        });

        // 力导向微调（避免重叠）
        const edgeList = this.state.connections.map(conn => ({
            source: conn.from,
            target: conn.to
        }));

        const iterations = 150;
        for (let iter = 0; iter < iterations; iter++) {
            // 斥力
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    let dx = nodes[i].x - nodes[j].x;
                    let dy = nodes[i].y - nodes[j].y;
                    let dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
                    let minDist = nodeRadius * 2.5;
                    if (dist < minDist) {
                        let force = (minDist - dist) / dist * 5;
                        let fx = (dx / dist) * force;
                        let fy = (dy / dist) * force;
                        nodes[i].x += fx; nodes[i].y += fy;
                        nodes[j].x -= fx; nodes[j].y -= fy;
                    }
                }
            }
            // 边界约束
            nodes.forEach(n => {
                n.x = Math.max(padding, Math.min(width - padding, n.x));
                n.y = Math.max(padding, Math.min(height - padding, n.y));
            });
        }

        const edges = this.state.connections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            return { ...conn, fromNode, toNode };
        });

        return { nodes, edges, width, height };
    },

    _renderSVG() {
        const { nodes, edges, width, height } = this._computeLayout();
        if (nodes.length === 0) return '';

        const typeColors = {
            '取代反应': '#3498db', '加成反应': '#e74c3c', '消去反应': '#9b59b6',
            '氧化反应': '#e67e22', '还原反应': '#2ecc71', '酯化反应(取代)': '#1abc9c',
            '水解反应': '#f39c12', '加成反应(水化)': '#c0392b', '加成反应(还原)': '#27ae60',
            '催化氧化': '#d35400', '分解反应': '#8e44ad', '皂化反应(水解)': '#16a085',
            '发酵反应': '#f1c40f', '中和反应': '#95a5a6', '缩合反应': '#7f8c8d',
            '连续转化': '#bdc3c7', '歧化反应': '#34495e', '偶联反应': '#2c3e50',
            '间接合成': '#1a5276', '烷基化+脱氢': '#6c3483', '取代反应(烷基化)': '#2874a6',
            '取代反应(水解)': '#148f77', '脱羟基': '#7d3c98'
        };

        let svgParts = [];
        svgParts.push(`<svg viewBox="0 0 ${width} ${height}" class="oc-diagram-svg" xmlns="http://www.w3.org/2000/svg">`);
        svgParts.push(`<defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <path d="M0,0 L10,3.5 L0,7 Z" fill="#666"/>
            </marker>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.2"/>
            </filter>
            <filter id="node-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.15"/>
            </filter>
        </defs>`);

        // 先画连线（在节点下方）
        edges.forEach((edge, idx) => {
            const fn = edge.fromNode, tn = edge.toNode;
            if (!fn || !tn) return;
            const sx = fn.x, sy = fn.y, ex = tn.x, ey = tn.y;
            const dx = ex - sx, dy = ey - sy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 1) return;
            const nx = dx / dist, ny = dy / dist;
            // 箭头偏移：从节点边缘开始
            const nodeR = 48;
            const startX = sx + nx * nodeR, startY = sy + ny * nodeR;
            const endX = ex - nx * (nodeR + 12), endY = ey - ny * (nodeR + 12);
            const midX = (startX + endX) / 2, midY = (startY + endY) / 2;
            // 轻微曲线避免直线重叠
            const perpX = -ny * 15, perpY = nx * 15;
            const ctrlX = midX + perpX, ctrlY = midY + perpY;

            const lineColor = typeColors[edge.type] || '#666';
            const isHighlighted = !this.state.highlightType || this.state.highlightType === edge.type;
            const opacity = isHighlighted ? 0.8 : 0.15;
            const strokeWidth = isHighlighted ? 2.5 : 1.5;

            svgParts.push(`<path d="M${startX.toFixed(1)},${startY.toFixed(1)} Q${ctrlX.toFixed(1)},${ctrlY.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}" 
                fill="none" stroke="${lineColor}" stroke-width="${strokeWidth}" opacity="${opacity}"
                marker-end="url(#arrowhead)"/>`);

            // 反应类型标签
            if (isHighlighted) {
                const labelX = ctrlX, labelY = ctrlY - 10;
                // 背景圆角矩形
                svgParts.push(`<rect x="${labelX - 40}" y="${labelY - 10}" width="80" height="20" rx="10" fill="${lineColor}" opacity="0.85"/>`);
                svgParts.push(`<text x="${labelX}" y="${labelY + 3}" text-anchor="middle" fill="white" font-size="10" font-weight="600" style="pointer-events:none;">${edge.type}</text>`);
                // 反应条件（在标签下方）
                if (edge.conditions && edge.conditions.length > 0) {
                    const condY = labelY + 22;
                    svgParts.push(`<rect x="${labelX - 35}" y="${condY - 8}" width="70" height="16" rx="8" fill="white" stroke="${lineColor}" stroke-width="0.8" opacity="0.9"/>`);
                    svgParts.push(`<text x="${labelX}" y="${condY + 3}" text-anchor="middle" fill="#444" font-size="9" style="pointer-events:none;">${edge.conditions}</text>`);
                }
            }
        });

        // 再画节点（在连线上方）
        nodes.forEach(node => {
            const r = 44;
            // 节点外圈
            svgParts.push(`<circle cx="${node.x}" cy="${node.y}" r="${r + 2}" fill="none" stroke="${node.color}" stroke-width="1" opacity="0.3"/>`);
            // 节点主体
            svgParts.push(`<circle cx="${node.x}" cy="${node.y}" r="${r}" fill="white" stroke="${node.color}" stroke-width="3" filter="url(#node-shadow)"/>`);
            // 物质名称（加大字号）
            svgParts.push(`<text x="${node.x}" y="${node.y - 6}" text-anchor="middle" fill="${node.color}" font-size="13" font-weight="700" style="pointer-events:none;">${node.name}</text>`);
            // 分子式
            svgParts.push(`<text x="${node.x}" y="${node.y + 14}" text-anchor="middle" fill="#555" font-size="11" style="pointer-events:none;">${node.formula}</text>`);
        });

        svgParts.push(`</svg>`);
        return svgParts.join('\n');
    },

    exportDiagram() {
        if (this.state.selectedSubstances.length === 0) { alert('请先选择有机物'); return; }
        let content = '有机物转化关系图\n========================\n\n';
        this.state.selectedSubstances.forEach(id => {
            const sub = this.substanceLibrary[id];
            content += '【' + sub.name + '】' + sub.formula + '\n';
            content += '类别：' + sub.category + '\n';
            content += '性质：' + sub.properties.join('；') + '\n';
            const conversions = this.getConversionsFor(id);
            if (conversions.length > 0) {
                content += '转化反应：\n';
                conversions.forEach(c => {
                    const target = c.to === id ? this.substanceLibrary[c.from].name : this.substanceLibrary[c.to].name;
                    content += '  → ' + target + '：' + c.reaction + '（' + c.conditions + '）\n';
                });
            }
            content += '\n';
        });
        if (this.state.connections.length > 0) {
            content += '------------------------\n转化关系：\n';
            this.state.connections.forEach(conn => {
                content += this.substanceLibrary[conn.from].name + ' ' + conn.type + ' ' + this.substanceLibrary[conn.to].name + '\n';
                content += '反应：' + conn.reaction + '\n条件：' + conn.conditions + '\n\n';
            });
        }
        content += '========================\n导出时间：' + new Date().toLocaleString('zh-CN') + '\n';
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '有机物转化图.txt';
        a.click();
        URL.revokeObjectURL(url);
    },

    renderConverter() {
        const app = document.getElementById('organic-converter-app');
        if (!app) return;

        const categories = {};
        Object.values(this.substanceLibrary).forEach(sub => {
            if (!categories[sub.category]) categories[sub.category] = [];
            categories[sub.category].push(sub);
        });

        const filteredLib = this.state.searchQuery
            ? Object.values(this.substanceLibrary).filter(s =>
                s.name.toLowerCase().includes(this.state.searchQuery) ||
                s.formula.toLowerCase().includes(this.state.searchQuery) ||
                s.category.toLowerCase().includes(this.state.searchQuery))
            : Object.values(this.substanceLibrary);

        const filteredCats = {};
        filteredLib.forEach(sub => {
            if (!filteredCats[sub.category]) filteredCats[sub.category] = [];
            filteredCats[sub.category].push(sub);
        });

        const activeTypes = [...new Set(this.state.connections.map(c => c.type))];

        app.innerHTML = `
        <div class="oc-container">
            <header class="oc-header-bar">
                <h2>🔗 有机物转化图绘制器</h2>
                <span class="gd-badge">广东卷专用</span>
                <div class="header-actions">
                    <button class="btn-oc btn-secondary" onclick="organicConverter.clearAll()">🗑️ 清空</button>
                    <button class="btn-oc btn-secondary" onclick="organicConverter.toggleShowAll()">${this.state.showAllReactions ? '📌 隐藏' : '📋 全部反应'}</button>
                    <button class="btn-oc btn-primary" onclick="organicConverter.exportDiagram()">📄 导出</button>
                </div>
            </header>

            <nav class="preset-nav">
                <button class="preset-tab ${this.state.selectedSubstances.length === 0 && !this.state.searchQuery ? 'active' : ''}" onclick="organicConverter.clearAll(); organicConverter.renderConverter();">全部物质</button>
                <button class="preset-tab" onclick="organicConverter.loadPreset('ethanol-chain')">🍷 乙醇链</button>
                <button class="preset-tab" onclick="organicConverter.loadPreset('benzene-family')">⬡ 苯系族</button>
                <button class="preset-tab" onclick="organicConverter.loadPreset('halo-derivatives')">🧂 卤代烃</button>
                <button class="preset-tab" onclick="organicConverter.loadPreset('carbonyl')">⚗️ 羰基类</button>
                <button class="preset-tab" onclick="organicConverter.loadPreset('ester-system')">🧪 酯化系</button>
                <button class="preset-tab" onclick="organicConverter.loadPreset('sugar-system')">🍬 糖类系</button>
            </nav>

            <main class="oc-main-content">
                <aside class="substance-sidebar">
                    <div class="sidebar-header">
                        <input type="text" class="search-input" placeholder="🔍 搜索物质..."
                               value="${this.state.searchQuery}" oninput="organicConverter.searchSubstance(this.value)">
                        <span class="sub-count">共${filteredLib.length}种</span>
                    </div>
                    <div class="category-list">
                        ${Object.entries(filteredCats).map(([cat, subs]) => `
                            <details open class="cat-group">
                                <summary class="cat-title">${cat} <span class="cat-count">(${subs.length})</span></summary>
                                <div class="cat-items">
                                    ${subs.map(sub => `
                                        <button class="sub-item ${this.state.selectedSubstances.includes(sub.id) ? 'selected' : ''}"
                                            style="--sub-color: ${sub.color}"
                                            onclick="organicConverter.toggleSubstance('${sub.id}')"
                                            title="${sub.properties.join('\\n')}">
                                            <span class="sub-dot" style="background:${sub.color}"></span>
                                            <span class="sub-name">${sub.name}</span>
                                            <span class="sub-formula">${sub.formula}</span>
                                        </button>
                                    `).join('')}
                                </div>
                            </details>
                        `).join('')}
                    </div>
                </aside>

                <section class="diagram-area">
                    <div class="area-toolbar">
                        <h3>🔄 转化关系图</h3>
                        <div class="toolbar-right">
                            <div class="view-switch">
                                <button class="${this.state.viewMode==='diagram'?'active':''}" onclick="organicConverter.setViewMode('diagram')">
                                    📊 图谱
                                </button>
                                <button class="${this.state.viewMode==='list'?'active':''}" onclick="organicConverter.setViewMode('list')">
                                    📋 列表
                                </button>
                            </div>
                        </div>
                    </div>

                    ${activeTypes.length > 0 ? `
                    <div class="type-filter-bar">
                        <span>筛选：</span>
                        ${activeTypes.slice(0, 6).map(t => `
                            <button class="type-chip ${this.state.highlightType===t?'active':''}"
                                style="--chip-color: ${getTypeColor(t)}"
                                onclick="organicConverter.setHighlightType('${t}')">${t}</button>
                        `).join('')}
                        ${activeTypes.length > 6 ? `<span class="more-types">+${activeTypes.length - 6}种</span>` : ''}
                        ${this.state.highlightType ? `<button class="clear-filter" onclick="organicConverter.setHighlightType(null)">✕ 清除</button>` : ''}
                    </div>` : ''}

                    <div class="diagram-view">
                        ${this.state.selectedSubstances.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-icon">🧪</div>
                            <p class="empty-title">选择有机物开始探索转化关系</p>
                            <p class="empty-desc">从左侧选择物质，或点击上方预设快速加载常见转化链</p>
                            <div class="quick-presets">
                                <button onclick="organicConverter.loadPreset('benzene-family')">⬡ 苯系家族</button>
                                <button onclick="organicConverter.loadPreset('ethanol-chain')">🍷 乙醇转化链</button>
                                <button onclick="organicConverter.loadPreset('ester-system')">🧪 酯化体系</button>
                            </div>
                        </div>
                        ` : this.state.viewMode === 'diagram' ? `
                        <div class="svg-wrapper">
                            ${this._renderSVG()}
                        </div>
                        <div class="diagram-stats">
                            <span class="stat-item">已选 <strong>${this.state.selectedSubstances.length}</strong> 种物质</span>
                            <span class="stat-item">发现 <strong>${this.state.connections.length}</strong> 条转化关系</span>
                        </div>
                        ` : `
                        <div class="list-view">
                            ${this.connections.map(conn => this._renderConnectionCard(conn)).join('')}
                        </div>
                        `}
                    </div>
                </section>
            </main>

            ${this.state.showAllReactions ? `
            <section class="all-reactions-panel">
                <h4>📋 所有转化反应 (${this.conversionRules.length}条)</h4>
                <div class="reactions-grid">
                    ${this.conversionRules.map(r => {
                        const fromSub = this.substanceLibrary[r.from];
                        const toSub = this.substanceLibrary[r.to];
                        const isAvailable = this.state.selectedSubstances.includes(r.from) && this.state.selectedSubstances.includes(r.to);
                        return '<div class="reaction-card' + (isAvailable ? ' available' : '') + '">' +
                            '<div class="rc-from" style="color:' + fromSub.color + '">' + fromSub.name + '</div>' +
                            '<div class="rc-arrow">' + r.type + '</div>' +
                            '<div class="rc-to" style="color:' + toSub.color + '">' + toSub.name + '</div>' +
                            '<div class="rc-eq">' + r.reaction + '</div>' +
                            '<div class="rc-cond">条件：' + r.conditions + '</div>' +
                            (r.gdPoint ? '<div class="rc-gd">⭐ ' + r.gdPoint + '</div>' : '') +
                            '</div>';
                    }).join('')}
                </div>
            </section>` : ''}
        </div>`;
    },

    _renderDetail(substanceId) {
        const sub = this.substanceLibrary[substanceId];
        if (!sub) return '<p class="placeholder-text">物质不存在</p>';
        const conversions = this.getConversionsFor(substanceId);
        return '<div class="detail-card">' +
            '<div class="detail-header" style="background:' + sub.color + '">' +
                '<h4>' + sub.name + '</h4>' +
                '<div class="detail-formula">' + sub.formula + '</div>' +
            '</div>' +
            '<div class="detail-section">' +
                '<h5>📌 基本信息</h5>' +
                '<div class="detail-row"><span>类别：</span><span>' + sub.category + '</span></div>' +
            '</div>' +
            '<div class="detail-section">' +
                '<h5>🔬 物理性质</h5>' +
                '<ul class="properties-list">' + sub.properties.map(p => '<li>' + p + '</li>').join('') + '</ul>' +
            '</div>' +
            (conversions.length > 0 ? '<div class="detail-section">' +
                '<h5>⚗️ 相关转化反应 (' + conversions.length + '条)</h5>' +
                '<div class="reactions-list">' + conversions.map(c => {
                    const target = c.to === substanceId ? this.substanceLibrary[c.from] : this.substanceLibrary[c.to];
                    return '<div class="reaction-item">' +
                        '<div class="reaction-eq">' + c.reaction + '</div>' +
                        '<div class="reaction-info">' +
                            '<span class="reaction-type">' + c.type + '</span>' +
                            '<span class="reaction-cond">条件：' + c.conditions + '</span>' +
                        '</div>' +
                        '<div class="reaction-path">' + sub.name + ' → ' + target.name + '</div>' +
                        (c.gdPoint ? '<div class="reaction-gd">⭐ ' + c.gdPoint + '</div>' : '') +
                    '</div>';
                }).join('') + '</div></div>' : '') +
            '<button class="btn ' + (this.state.selectedSubstances.includes(substanceId) ? 'btn-secondary' : 'btn-primary') + '" onclick="organicConverter.toggleSubstance(\'' + substanceId + '\')">' +
                (this.state.selectedSubstances.includes(substanceId) ? '移除' : '添加到转化图') +
            '</button>' +
        '</div>';
    },

    toggleSubstance(substanceId) {
        if (this.state.selectedSubstances.includes(substanceId)) {
            this.removeSubstance(substanceId);
        } else {
            this.addSubstance(substanceId);
        }
    },

    searchSubstance(query) {
        this.state.searchQuery = query.toLowerCase();
        this.renderConverter();
    },

    clearAll() {
        this.state.selectedSubstances = [];
        this.state.connections = [];
        this.state.highlightType = null;
        this.state.selectedDetail = null;
        this.renderConverter();
    },

    showSubstanceDetail(substanceId) {
        this.state.selectedDetail = substanceId;
        const detailContent = document.getElementById('sub-detail-content');
        if (detailContent) {
            detailContent.innerHTML = this._renderDetail(substanceId);
        }
    },

    _renderConnectionCard(conn) {
        const fromSub = this.substanceLibrary[conn.from];
        const toSub = this.substanceLibrary[conn.to];
        return '<div class="connection-card">' +
            '<div class="cc-header">' +
                '<span class="cc-type" style="background:' + getTypeColor(conn.type) + '">' + conn.type + '</span>' +
                (conn.gdPoint ? '<span class="cc-gd">⭐ 广东卷</span>' : '') +
            '</div>' +
            '<div class="cc-body">' +
                '<div class="cc-equation">' + conn.reaction + '</div>' +
                '<div class="cc-path">' +
                    '<span style="color:' + fromSub.color + ';font-weight:600;">' + fromSub.name + '</span>' +
                    ' <span class="cc-arrow">→</span> ' +
                    '<span style="color:' + toSub.color + ';font-weight:600;">' + toSub.name + '</span>' +
                '</div>' +
                '<div class="cc-condition">🔬 条件：' + conn.conditions + '</div>' +
            '</div>' +
            (conn.gdPoint ? '<div class="cc-tip">💡 ' + conn.gdPoint + '</div>' : '') +
        '</div>';
    }
};

function getTypeColor(type) {
    const colors = {
        '取代反应': '#3498db', '加成反应': '#e74c3c', '消去反应': '#9b59b6',
        '氧化反应': '#e67e22', '还原反应': '#2ecc71', '酯化反应(取代)': '#1abc9c',
        '水解反应': '#f39c12', '加成反应(水化)': '#c0392b', '加成反应(还原)': '#27ae60',
        '催化氧化': '#d35400', '分解反应': '#8e44ad', '皂化反应(水解)': '#16a085',
        '发酵反应': '#f1c40f', '中和反应': '#95a5a6', '缩合反应': '#7f8c8d'
    };
    return colors[type] || '#666';
}
/**
 * 化学过程分析器 - 从文本提取反应方程式并按反应类型归类分析考点
 * @module chemistryProcessAnalyzer
 * @example window.chemistryProcessAnalyzer.renderAnalyzer()
 */
const chemistryProcessAnalyzer = {
    state: {
        inputText: '',
        extractedReactions: [],
        analysis: null,
        examPoints: []
    },

    reactionPatterns: {
       氧化还原: [
            { pattern: /(\w+)\+(\w+)\s*→\s*(\w+)\+(\w+)/g, name: '置换反应' },
            { pattern: /(\w+)\s*\+\s*O₂\s*→\s*(\w+)/g, name: '燃烧/氧化' },
            { pattern: /(\w+)\s*\+\s*H₂SO₄\(浓\)\s*→/g, name: '浓硫酸强氧化性' },
            { pattern: /(\w+)\s*\+\s*HNO₃\s*→/g, name: '硝酸氧化性' },
            { pattern: /(\w+)\s*\+\s*Cl₂\s*→/g, name: '氯气氧化' }
        ],
       酸碱反应: [
            { pattern: /(\w+)\s*\+\s*H₂SO₄\s*→/g, name: '酸与金属/氧化物反应' },
            { pattern: /(\w+)\s*\+\s*NaOH\s*→/g, name: '碱与非金属/盐反应' },
            { pattern: /酸\s*调节|pH\s*调节/g, name: 'pH调节' }
        ],
       沉淀反应: [
            { pattern: /生成\s*(\w+↓|\w+沉淀)/g, name: '沉淀生成' },
            { pattern: /(\w+)\s*\+\s*(\w+)\s*→\s*\w*[Ss][Tt]|\w*沉淀/g, name: '离子沉淀' }
        ],
       结晶: [
            { pattern: /结晶|蒸发结晶|冷却结晶|重结晶/g, name: '结晶方法' },
            { pattern: /加热浓缩|冷却结晶/g, name: '结晶条件' }
        ]
    },

   氧化剂库: ['O₂', 'Cl₂', 'H₂SO₄(浓)', 'HNO₃', 'Fe³⁺', 'KMnO₄', 'MnO₂', 'Cu²⁺'],
   还原剂库: ['C', 'CO', 'H₂', 'Fe', 'Zn', 'Mg', 'Al', 'Cu'],

   循环物质库: ['Fe₂O₃', 'Fe₃O₄', 'SO₂', 'SO₃', 'NO', 'NO₂', 'CO', 'H₂O', 'O₂', 'N₂'],

    analyzeText(text) {
        this.state.inputText = text;
        this.state.extractedReactions = this.extractReactions(text);
        this.state.analysis = this.analyzeReactions();
        this.state.examPoints = this.generateExamPoints();
        this.renderAnalyzer();
    },

    extractReactions(text) {
        const reactions = [];
        const lines = text.split('\n');

        const reactionRegex = /[^\n]*(?:→|→|=|→|⟶)[^\n]*/g;
        const matches = text.match(reactionRegex) || [];

        const commonReactions = [
            { eq: '2Fe₂O₃ + 3C → 4Fe + 3CO₂', type: '氧化还原', desc: '高炉炼铁核心反应' },
            { eq: 'Fe₂O₃ + 3CO → 2Fe + 3CO₂', type: '氧化还原', desc: '一氧化碳还原氧化铁' },
            { eq: 'CaCO₃ → CaO + CO₂', type: '分解', desc: '石灰石分解' },
            { eq: '2SO₂ + O₂ ⇌ 2SO₃', type: '氧化还原', desc: 'SO₂催化氧化' },
            { eq: 'SO₃ + H₂O → H₂SO₄', type: '化合', desc: '三氧化硫吸收' },
            { eq: 'N₂ + 3H₂ ⇌ 2NH₃', type: '氧化还原', desc: '合成氨' },
            { eq: '4NH₃ + 5O₂ → 4NO + 6H₂O', type: '氧化还原', desc: '氨的催化氧化' },
            { eq: '2NO + O₂ → 2NO₂', type: '氧化还原', desc: 'NO氧化' },
            { eq: '3NO₂ + H₂O → 2HNO₃ + NO', type: '氧化还原', desc: 'NO₂与水反应' },
            { eq: 'Al₂O₃ + 2NaOH → 2NaAlO₂ + H₂O', type: '酸碱', desc: '铝土矿碱溶' },
            { eq: '2Al + Fe₂O₃ → Al₂O₃ + 2Fe', type: '铝热反应', desc: '铝热法炼铁' },
            { eq: 'SiO₂ + Na₂CO₃ → Na₂SiO₃ + CO₂', type: '复杂反应', desc: '玻璃工业' },
            { eq: '2C + SiO₂ → Si + 2CO', type: '氧化还原', desc: '硅的制备' },
            { eq: 'TiCl₄ + 2Mg → Ti + 2MgCl₂', type: '氧化还原', desc: '钛的制备' },
            { eq: 'MgCl₂·6H₂O → MgCl₂ + 6H₂O', type: '分解', desc: '盐脱水' },
            { eq: 'Cr₂O₃ + 2Al → Al₂O₃ + 2Cr', type: '铝热反应', desc: '铬的制备' },
            { eq: '2NaCl + 2H₂O → 2NaOH + H₂ + Cl₂', type: '氧化还原', desc: '氯碱工业' },
            { eq: 'Cu + 2H₂SO₄(浓) → CuSO₄ + SO₂ + 2H₂O', type: '氧化还原', desc: '铜与浓硫酸' },
            { eq: '3Cu + 8HNO₃ → 3Cu(NO₃)₂ + 2NO + 4H₂O', type: '氧化还原', desc: '铜与稀硝酸' },
            { eq: 'CuO + H₂SO₄ → CuSO₄ + H₂O', type: '酸碱', desc: '氧化铜酸溶' }
        ];

        commonReactions.forEach(r => {
            if (text.toLowerCase().includes(r.eq.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 8))) {
                reactions.push(r);
            }
        });

        const numberedSteps = text.match(/\d+[.、)]\s*[^\n]+(?:反应|生成|得到|产生)[^\n]*/g) || [];
        numberedSteps.forEach((step, idx) => {
            const stepNum = idx + 1;
            const relevantReaction = commonReactions.find(r =>
                step.includes(r.eq.split('→')[0].trim()) || step.includes(r.eq.split('→')[1].trim())
            );
            reactions.push({
                eq: `步骤${stepNum}: ${step.trim().slice(0, 50)}...`,
                type: relevantReaction?.type || '未分类',
                desc: step.trim().slice(0, 80)
            });
        });

        return reactions.slice(0, 10);
    },

    analyzeReactions() {
        const analysis = {
           氧化剂还原剂: [],
           循环物质: [],
           除杂原理: [],
           反应类型统计: {}
        };

        this.state.extractedReactions.forEach(r => {
            if (r.type === '氧化还原') {
                analysis.氧化剂还原剂.push({
                    reaction: r.eq,
                    氧化剂: this.identifyOxidant(r.eq),
                    还原剂: this.identifyReductant(r.eq)
                });
            }

            if (r.desc && r.desc.includes('循环')) {
                analysis.循环物质.push(r.eq);
            }
        });

        const循环Candidates = ['Fe₂O₃', 'SO₂', 'CO', 'H₂O', 'O₂', 'N₂', 'NO', 'NO₂'];
       循环Candidates.forEach(sub => {
            if (this.state.inputText.includes(sub)) {
                const count = (this.state.inputText.match(new RegExp(sub, 'g')) || []).length;
                if (count >= 2) {
                    analysis.循环物质.push(sub);
                }
            }
        });

        if (this.state.inputText.includes('pH') || this.state.inputText.includes('调节')) {
            analysis.除杂原理.push('通过调节pH使某些金属离子形成沉淀而除去');
        }
        if (this.state.inputText.includes('过滤')) {
            analysis.除杂原理.push('过滤用于分离固体和液体');
        }
        if (this.state.inputText.includes('结晶') || this.state.inputText.includes('重结晶')) {
            analysis.除杂原理.push('结晶或重结晶用于分离和提纯固体物质');
        }
        if (this.state.inputText.includes('灼烧') || this.state.inputText.includes('焙烧')) {
            analysis.除杂原理.push('高温灼烧用于除去可燃性杂质');
        }
        if (this.state.inputText.includes('水洗')) {
            analysis.除杂原理.push('水洗用于除去可溶性杂质');
        }

        this.state.extractedReactions.forEach(r => {
            analysis.反应类型统计[r.type] = (analysis.反应类型统计[r.type] || 0) + 1;
        });

        return analysis;
    },

    identifyOxidant(equation) {
        const oxidants = ['O₂', 'Cl₂', 'H₂SO₄(浓)', 'HNO₃', 'KMnO₄', 'MnO₂', 'Fe³⁺', 'Cu²⁺', 'NO₂'];
        for (const ox of oxidants) {
            if (equation.includes(ox)) return ox;
        }
        return '未明确';
    },

    identifyReductant(equation) {
        const reductants = ['C', 'CO', 'H₂', 'Fe', 'Zn', 'Mg', 'Al', 'Cu', 'S²⁻', 'I⁻'];
        for (const rd of reductants) {
            if (equation.includes(rd)) return rd;
        }
        return '未明确';
    },

    generateExamPoints() {
        const points = [];
        const text = this.state.inputText;

        if (text.includes('pH') || text.includes('调pH')) {
            points.push({
                type: '调节pH',
                question: '调pH的目的是什么？如何选择调节pH的试剂？',
                answer: '目的：使某些金属离子形成沉淀而除去。选择试剂时需考虑：①不引入新杂质②不过量以免浪费③选择成本低的试剂如NaOH、Ca(OH)₂等'
            });
        }

        if (text.includes('结晶') || text.includes('晶体')) {
            points.push({
                type: '结晶方法',
                question: '选择蒸发结晶还是冷却结晶？依据是什么？',
                answer: '①蒸发结晶：适用于溶解度随温度变化不大的物质（如NaCl）②冷却结晶：适用于溶解度随温度变化大的物质（如KNO₃）③根据物质的溶解度曲线特点选择'
            });
        }

        if (text.includes('过滤')) {
            points.push({
                type: '过滤操作',
                question: '过滤的目的是什么？有哪些常见考点？',
                answer: '目的：分离固体和液体。考点：①趁热过滤的原因②过滤速率影响因素③滤渣成分分析'
            });
        }

        if (text.includes('灼烧') || text.includes('焙烧') || text.includes('煅烧')) {
            points.push({
                type: '高温处理',
                question: '灼烧/焙烧的目的是什么？温度如何控制？',
                answer: '目的：①除去可燃性杂质②使物质分解转化③形成所需晶型。温度需根据反应热力学和动力学综合考虑'
            });
        }

        if (text.includes('酸溶') || text.includes('碱溶')) {
            points.push({
                type: '酸碱溶出',
                question: '酸溶/碱溶的目的是什么？',
                answer: '目的：将不溶性物质转化为可溶性物质，便于后续分离提纯。如铝土矿碱溶：Al₂O₃ + 2NaOH → 2NaAlO₂ + H₂O'
            });
        }

        if (text.includes('氧化') || text.includes('还原')) {
            points.push({
                type: '氧化还原',
                question: '氧化/还原的目的是什么？如何判断？',
                answer: '目的：改变元素价态或物质形态。判断方法：①化合价升高→氧化反应②化合价降低→还原反应③氧化剂得电子被还原，还原剂失电子被氧化'
            });
        }

        if (text.includes('循环') || this.state.analysis?.循环物质.length > 0) {
            points.push({
                type: '循环物质',
                question: '循环物质的判断方法？有什么作用？',
                answer: '判断方法：①在流程中出现多次②反应前后质量不变。作用：提高原料利用率，减少污染，降低成本'
            });
        }

        if (text.includes('除杂') || text.includes('净化')) {
            points.push({
                type: '除杂原理',
                question: '工业流程中的除杂原则是什么？',
                answer: '原则：①不引入新杂质②除去原有杂质③杂质转化或回收利用。常用方法：调pH沉淀、萃取、离子交换、膜分离等'
            });
        }

        if (text.includes('Fe') && text.includes('Al')) {
            points.push({
                type: '金属分离',
                question: '如何分离Fe和Al？',
                answer: '方法：①碱溶法：Al与NaOH反应溶解，Fe不溶②利用Al的两性性质进行分离'
            });
        }

        if (text.includes('Mn') || text.includes('Cr')) {
            points.push({
                type: '重金属分离',
                question: '重金属元素的分离提纯方法？',
                answer: '常用方法：①调节pH沉淀②硫化物沉淀③离子交换④溶剂萃取'
            });
        }

        if (points.length === 0) {
            points.push({
                type: '流程分析',
                question: '工业流程题的一般分析方法？',
                answer: '①找原料和目的②分析预处理步骤③核心反应追踪④分离提纯⑤循环物质识别⑥环保与经济意识'
            });
        }

        return points;
    },

    loadSampleProblem(problemId) {
        const samples = {
            'iron': `高炉炼铁流程：
原料：铁矿石（主要成分Fe₂O₃）、焦炭、石灰石
主要反应：
1. 碳不完全燃烧：C + O₂ → CO（部分碳燃烧生成CO₂）
2. 二氧化碳还原：C + CO₂ → 2CO（焦炭不完全燃烧）
3. 氧化铁还原：Fe₂O₃ + 3CO → 2Fe + 3CO₂
4. 造渣反应：CaCO₃ → CaO + CO₂；CaO + SiO₂ → CaSiO₃
5. 生铁冶炼完成

产品：生铁（主要含Fe、C、Si、Mn、S、P）
循环物质：CO（循环使用）
除杂：石灰石用于除去SiO₂等酸性杂质`,

            'sulfuric': `接触法制硫酸流程：
原料：硫磺或黄铁矿（FeS₂）
主要反应：
1. 硫燃烧：S + O₂ → SO₂
2. 或黄铁矿焙烧：4FeS₂ + 11O₂ → 2Fe₂O₃ + 8SO₂
3. SO₂催化氧化：2SO₂ + O₂ ⇌ 2SO₃（V₂O₅催化，400-500°C）
4. SO₃吸收：SO₃ + H₂O → H₂SO₄
尾气处理：含有SO₂，用氨水吸收
循环物质：SO₂（部分循环）
除杂：焙烧除去As、Se等杂质`,

            'titanium': `钛白粉制备流程（硫酸法）：
原料：钛铁矿（主要成分FeTiO₃）
主要反应：
1. 酸溶：FeTiO₃ + 3H₂SO₄ → TiOSO₄ + FeSO₄ + 3H₂O
2. 水解：TiOSO₄ + H₂O → TiO₂ + H₂SO₄
3. 煅烧：TiO₂ → TiO₂（高温下转化为金红石型）
除杂：通过沉降、过滤除去Fe³⁺等杂质
废水处理：含硫酸亚铁，需综合利用`
        };

        const textarea = document.getElementById('process-input');
        if (textarea && samples[problemId]) {
            textarea.value = samples[problemId];
            this.analyzeText(samples[problemId]);
        }
    },

    renderAnalyzer() {
        const app = document.getElementById('process-analyzer-app');
        if (!app) return;

        const { extractedReactions, analysis, examPoints } = this.state;

        app.innerHTML = `
            <div class="process-analyzer">
                <div class="pa-header">
                    <h3>🏭 化学工业流程核心反应提取工具</h3>
                    <p class="pa-intro">输入工业流程题，自动提取核心反应，分析考点</p>
                </div>

                <div class="pa-main">
                    <div class="input-section">
                        <div class="sample-buttons">
                            <span>快速加载示例：</span>
                            <button class="btn btn-secondary btn-sm" onclick="chemistryProcessAnalyzer.loadSampleProblem('iron')">高炉炼铁</button>
                            <button class="btn btn-secondary btn-sm" onclick="chemistryProcessAnalyzer.loadSampleProblem('sulfuric')">硫酸工业</button>
                            <button class="btn btn-secondary btn-sm" onclick="chemistryProcessAnalyzer.loadSampleProblem('titanium')">钛白粉制备</button>
                        </div>
                        <textarea id="process-input" class="process-input"
                            placeholder="请粘贴工业流程题文本..."

                            oninput="if(this.value.length > 50) chemistryProcessAnalyzer.analyzeText(this.value)"></textarea>
                        <button class="btn btn-primary btn-block" onclick="chemistryProcessAnalyzer.analyzeText(document.getElementById('process-input').value)">
                            🔍 开始分析
                        </button>
                    </div>

                    ${extractedReactions.length > 0 ? `
                        <div class="results-section">
                            <div class="result-panel">
                                <h4>⚗️ 核心反应提取</h4>
                                <div class="reactions-list">
                                    ${extractedReactions.map((r, idx) => `
                                        <div class="reaction-item">
                                            <div class="reaction-header">
                                                <span class="reaction-num">${idx + 1}</span>
                                                <span class="reaction-type">${r.type}</span>
                                            </div>
                                            <div class="reaction-eq">${r.eq}</div>
                                            <div class="reaction-desc">${r.desc || ''}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            ${analysis ? `
                                <div class="result-panel">
                                    <h4>🔬 反应分析</h4>

                                    <div class="analysis-section">
                                        <h5>⚡ 氧化剂与还原剂</h5>
                                        ${analysis.氧化剂还原剂.length > 0 ? `
                                            <div class="ox-red-table">
                                                <table>
                                                    <thead>
                                                        <tr><th>反应</th><th>氧化剂</th><th>还原剂</th></tr>
                                                    </thead>
                                                    <tbody>
                                                        ${analysis.氧化剂还原剂.map(item => `
                                                            <tr>
                                                                <td>${item.reaction.slice(0, 30)}...</td>
                                                                <td class="oxidant">${item.氧化剂}</td>
                                                                <td class="reductant">${item.还原剂}</td>
                                                            </tr>
                                                        `).join('')}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ` : '<p class="no-data">未检测到氧化还原反应</p>'}
                                    </div>

                                    <div class="analysis-section">
                                        <h5>🔄 循环物质识别</h5>
                                        ${analysis.循环物质.length > 0 ? `
                                            <div class="cycle-substances">
                                                ${[...new Set(analysis.循环物质)].map(s => `
                                                    <span class="cycle-tag">${s}</span>
                                                `).join('')}
                                            </div>
                                            <p class="analysis-note">循环物质可提高原料利用率，降低生产成本</p>
                                        ` : '<p class="no-data">未识别到明显的循环物质</p>'}
                                    </div>

                                    <div class="analysis-section">
                                        <h5>🧹 除杂原理</h5>
                                        ${analysis.除杂原理.length > 0 ? `
                                            <ul class="principles-list">
                                                ${analysis.除杂原理.map(p => `<li>${p}</li>`).join('')}
                                            </ul>
                                        ` : '<p class="no-data">未检测到明确的除杂步骤</p>'}
                                    </div>

                                    <div class="analysis-section">
                                        <h5>📊 反应类型统计</h5>
                                        <div class="type-stats">
                                            ${Object.entries(analysis.反应类型统计).map(([type, count]) => `
                                                <div class="stat-item">
                                                    <span class="stat-label">${type}</span>
                                                    <span class="stat-value">${count}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            ` : ''}

                            <div class="result-panel">
                                <h4>📚 广东卷核心考点清单</h4>
                                <div class="exam-points-list">
                                    ${examPoints.map((ep, idx) => `
                                        <div class="exam-point-item">
                                            <div class="ep-header">
                                                <span class="ep-num">${idx + 1}</span>
                                                <span class="ep-type">${ep.type}</span>
                                            </div>
                                            <div class="ep-question">
                                                <strong>典型设问：</strong>${ep.question}
                                            </div>
                                            <div class="ep-answer">
                                                <strong>答题要点：</strong>${ep.answer}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="result-panel">
                                <h4>💡 解题策略</h4>
                                <div class="strategy-box">
                                    <ol>
                                        <li><strong>找源头：</strong>首先确定原料和目标产物</li>
                                        <li><strong>画主线：</strong>用箭头标出主要化学变化路径</li>
                                        <li><strong>识循环：</strong>找出循环使用的物质</li>
                                        <li><strong>析除杂：</strong>理解每步除杂的目的和方法</li>
                                        <li><strong>记考点：</strong>熟记pH调节、结晶方法、温度控制等高频考点</li>
                                        <li><strong>防陷阱：</strong>注意"过量"与"适量"、"先"与"后"的区别</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <div class="results-placeholder">
                            <div class="placeholder-icon">🏭</div>
                            <p>请输入工业流程题文本</p>
                            <p>系统将自动提取核心反应并生成考点清单</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
};
const equationBalancerPro = {
    state: {
        equations: [],
        currentIndex: 0,
        userCoefficients: {},
        showSteps: false,
        showAnswer: false,
        showHelp: false,
        filterType: 'all'
    },

    equationsData: [
        { id: 1, type: 'combustion', reactants: ['C', 'O2'], products: ['CO2'], name: '碳燃烧', difficulty: 1, category: '无机-氧化还原' },
        { id: 2, type: 'combustion', reactants: ['S', 'O2'], products: ['SO2'], name: '硫燃烧', difficulty: 1, category: '无机-氧化还原' },
        { id: 3, type: 'combustion', reactants: ['H2', 'O2'], products: ['H2O'], name: '氢气燃烧', difficulty: 1, category: '无机-氧化还原' },
        { id: 4, type: 'combustion', reactants: ['CH4', 'O2'], products: ['CO2', 'H2O'], name: '甲烷燃烧', difficulty: 2, category: '有机-氧化还原' },
        { id: 5, type: 'combustion', reactants: ['C2H5OH', 'O2'], products: ['CO2', 'H2O'], name: '乙醇燃烧', difficulty: 2, category: '有机-氧化还原' },
        { id: 6, type: 'redox', reactants: ['Fe', 'O2'], products: ['Fe3O4'], name: '铁在氧气中燃烧', difficulty: 2, category: '无机-氧化还原' },
        { id: 7, type: 'redox', reactants: ['Fe', 'Cl2'], products: ['FeCl3'], name: '铁与氯气反应', difficulty: 1, category: '无机-氧化还原' },
        { id: 8, type: 'redox', reactants: ['Cu', 'O2'], products: ['CuO'], name: '铜与氧气反应', difficulty: 1, category: '无机-氧化还原' },
        { id: 9, type: 'redox', reactants: ['Al', 'O2'], products: ['Al2O3'], name: '铝热反应', difficulty: 2, category: '无机-氧化还原' },
        { id: 10, type: 'redox', reactants: ['Na', 'O2'], products: ['Na2O2'], name: '钠与氧气反应', difficulty: 2, category: '无机-氧化还原' },
        { id: 11, type: 'redox', reactants: ['Mg', 'O2'], products: ['MgO'], name: '镁燃烧', difficulty: 1, category: '无机-氧化还原' },
        { id: 12, type: 'redox', reactants: ['P', 'O2'], products: ['P2O5'], name: '磷燃烧', difficulty: 1, category: '无机-氧化还原' },
        { id: 13, type: 'displacement', reactants: ['Zn', 'HCl'], products: ['ZnCl2', 'H2'], name: '锌与盐酸反应', difficulty: 1, category: '无机-置换' },
        { id: 14, type: 'displacement', reactants: ['Fe', 'CuSO4'], products: ['FeSO4', 'Cu'], name: '铁与硫酸铜反应', difficulty: 1, category: '无机-置换' },
        { id: 15, type: 'displacement', reactants: ['Cu', 'AgNO3'], products: ['Cu(NO3)2', 'Ag'], name: '铜与硝酸银反应', difficulty: 1, category: '无机-置换' },
        { id: 16, type: 'decomposition', reactants: ['H2O'], products: ['H2', 'O2'], name: '水电解', difficulty: 1, category: '无机-分解' },
        { id: 17, type: 'decomposition', reactants: ['KMnO4'], products: ['K2MnO4', 'MnO2', 'O2'], name: '高锰酸钾分解', difficulty: 3, category: '无机-分解' },
        { id: 18, type: 'decomposition', reactants: ['CaCO3'], products: ['CaO', 'CO2'], name: '碳酸钙分解', difficulty: 1, category: '无机-分解' },
        { id: 19, type: 'decomposition', reactants: ['H2CO3'], products: ['H2O', 'CO2'], name: '碳酸分解', difficulty: 1, category: '无机-分解' },
        { id: 20, type: 'combination', reactants: ['CaO', 'H2O'], products: ['Ca(OH)2'], name: '生石灰与水反应', difficulty: 1, category: '无机-化合' },
        { id: 21, type: 'combination', reactants: ['CO2', 'H2O'], products: ['H2CO3'], name: '二氧化碳与水反应', difficulty: 1, category: '无机-化合' },
        { id: 22, type: 'combination', reactants: ['SO3', 'H2O'], products: ['H2SO4'], name: '三氧化硫与水反应', difficulty: 1, category: '无机-化合' },
        { id: 23, type: 'neutralization', reactants: ['NaOH', 'HCl'], products: ['NaCl', 'H2O'], name: '氢氧化钠与盐酸', difficulty: 1, category: '无机-中和' },
        { id: 24, type: 'neutralization', reactants: ['Ca(OH)2', 'H2SO4'], products: ['CaSO4', 'H2O'], name: '氢氧化钙与硫酸', difficulty: 2, category: '无机-中和' },
        { id: 25, type: 'neutralization', reactants: ['NaOH', 'H2SO4'], products: ['Na2SO4', 'H2O'], name: '氢氧化钠与硫酸', difficulty: 2, category: '无机-中和' },
        { id: 26, type: 'precipitation', reactants: ['NaCl', 'AgNO3'], products: ['AgCl', 'NaNO3'], name: '氯化钠与硝酸银', difficulty: 1, category: '无机-沉淀' },
        { id: 27, type: 'precipitation', reactants: ['BaCl2', 'Na2SO4'], products: ['BaSO4', 'NaCl'], name: '氯化钡与硫酸钠', difficulty: 2, category: '无机-沉淀' },
        { id: 28, type: 'redox', reactants: ['Cu', 'HNO3(conc)'], products: ['Cu(NO3)2', 'NO2', 'H2O'], name: '铜与浓硝酸', difficulty: 3, category: '无机-氧化还原' },
        { id: 29, type: 'redox', reactants: ['Cu', 'HNO3(dil)'], products: ['Cu(NO3)2', 'NO', 'H2O'], name: '铜与稀硝酸', difficulty: 3, category: '无机-氧化还原' },
        { id: 30, type: 'redox', reactants: ['Fe', 'H2SO4(dil)'], products: ['FeSO4', 'H2'], name: '铁与稀硫酸', difficulty: 1, category: '无机-置换' },
        { id: 31, type: 'organic', reactants: ['C2H4', 'O2'], products: ['CO2', 'H2O'], name: '乙烯燃烧', difficulty: 2, category: '有机-氧化还原' },
        { id: 32, type: 'organic', reactants: ['C2H2', 'O2'], products: ['CO2', 'H2O'], name: '乙炔燃烧', difficulty: 2, category: '有机-氧化还原' },
        { id: 33, type: 'organic', reactants: ['C6H12O6', 'O2'], products: ['CO2', 'H2O'], name: '葡萄糖燃烧', difficulty: 2, category: '有机-氧化还原' },
        { id: 34, type: 'redox', reactants: ['H2', 'CuO'], products: ['Cu', 'H2O'], name: '氢气还原氧化铜', difficulty: 2, category: '无机-氧化还原' },
        { id: 35, type: 'redox', reactants: ['CO', 'CuO'], products: ['Cu', 'CO2'], name: '一氧化碳还原氧化铜', difficulty: 2, category: '无机-氧化还原' }
    ],

    init() {
        this.state.equations = this.equationsData;
    },

    selectEquation(id) {
        this.state.currentIndex = this.state.equations.findIndex(e => e.id === id);
        this.state.userCoefficients = {};
        this.state.showSteps = false;
        this.state.showAnswer = false;
        this.renderSystem();
    },

    setFilter(type) {
        this.state.filterType = type;
        this.renderSystem();
    },

    toggleSteps() {
        this.state.showSteps = !this.state.showSteps;
        this.renderSystem();
    },

    toggleAnswer() {
        this.state.showAnswer = !this.state.showAnswer;
        this.renderSystem();
    },

    toggleHelp() {
        this.state.showHelp = !this.state.showHelp;
        this.renderSystem();
    },

    updateCoefficient(compound, value) {
        this.state.userCoefficients[compound] = parseInt(value) || 1;
        this.renderSystem();
    },

    checkBalance() {
        const eq = this.state.equations[this.state.currentIndex];
        if (!eq) return { correct: false, message: '请先选择方程式' };

        const correct = this._getCorrectCoefficients(eq);
        const user = this.state.userCoefficients;

        let allCorrect = true;
        let message = '';

        for (const [compound, coeff] of Object.entries(correct)) {
            if ((user[compound] || 1) !== coeff) {
                allCorrect = false;
                message += compound + '系数应为' + coeff + '，';
            }
        }

        return {
            correct: allCorrect,
            message: allCorrect ? '✅ 配平正确！' : '❌ ' + message
        };
    },

    _getCorrectCoefficients(eq) {
        const coeffs = {
            1: { C: 1, O2: 1, CO2: 1 },
            2: { S: 1, O2: 1, SO2: 1 },
            3: { H2: 2, O2: 1, H2O: 2 },
            4: { CH4: 1, O2: 2, CO2: 1, H2O: 2 },
            5: { C2H5OH: 1, O2: 3, CO2: 2, H2O: 3 },
            6: { Fe: 3, O2: 2, Fe3O4: 1 },
            7: { Fe: 2, Cl2: 3, FeCl3: 2 },
            8: { Cu: 2, O2: 1, CuO: 2 },
            9: { Al: 4, O2: 3, Al2O3: 2 },
            10: { Na: 2, O2: 1, Na2O2: 1 },
            11: { Mg: 2, O2: 1, MgO: 2 },
            12: { P: 4, O2: 5, P2O5: 2 },
            13: { Zn: 1, HCl: 2, ZnCl2: 1, H2: 1 },
            14: { Fe: 1, CuSO4: 1, FeSO4: 1, Cu: 1 },
            15: { Cu: 1, AgNO3: 2, 'Cu(NO3)2': 1, Ag: 2 },
            16: { H2O: 2, H2: 2, O2: 1 },
            17: { KMnO4: 2, K2MnO4: 1, MnO2: 1, O2: 1 },
            18: { CaCO3: 1, CaO: 1, CO2: 1 },
            19: { H2CO3: 1, H2O: 1, CO2: 1 },
            20: { CaO: 1, H2O: 1, 'Ca(OH)2': 1 },
            21: { CO2: 1, H2O: 1, H2CO3: 1 },
            22: { SO3: 1, H2O: 1, H2SO4: 1 },
            23: { NaOH: 1, HCl: 1, NaCl: 1, H2O: 1 },
            24: { 'Ca(OH)2': 1, H2SO4: 1, CaSO4: 1, H2O: 2 },
            25: { NaOH: 2, H2SO4: 1, Na2SO4: 1, H2O: 2 },
            26: { NaCl: 1, AgNO3: 1, AgCl: 1, NaNO3: 1 },
            27: { BaCl2: 1, Na2SO4: 1, BaSO4: 1, NaCl: 2 },
            28: { Cu: 1, 'HNO3(conc)': 4, 'Cu(NO3)2': 1, NO2: 2, H2O: 2 },
            29: { Cu: 3, 'HNO3(dil)': 8, 'Cu(NO3)2': 3, NO: 2, H2O: 4 },
            30: { Fe: 1, 'H2SO4(dil)': 1, FeSO4: 1, H2: 1 },
            31: { C2H4: 1, O2: 3, CO2: 2, H2O: 2 },
            32: { C2H2: 2, O2: 5, CO2: 4, H2O: 2 },
            33: { C6H12O6: 1, O2: 6, CO2: 6, H2O: 6 },
            34: { H2: 1, CuO: 1, Cu: 1, H2O: 1 },
            35: { CO: 1, CuO: 1, Cu: 1, CO2: 1 }
        };
        return coeffs[eq.id] || {};
    },

    _getBalanceSteps(eq) {
        const stepsMap = {
            3: [
                { step: 1, desc: '观察反应物和产物', detail: 'H2 + O2 → H2O' },
                { step: 2, desc: '统计原子数', detail: '左边: H=2, O=2；右边: H=2, O=1' },
                { step: 3, desc: '氧原子不守恒，在H2O前加2', detail: 'H2 + O2 → 2H2O' },
                { step: 4, desc: '氢原子不守恒，在H2前加2', detail: '2H2 + O2 → 2H2O' },
                { step: 5, desc: '验证', detail: '左边: H=4, O=2；右边: H=4, O=2 ✓' }
            ],
            6: [
                { step: 1, desc: '观察反应', detail: 'Fe + O2 → Fe3O4' },
                { step: 2, desc: 'Fe3O4中有3个Fe', detail: '在Fe前加3：3Fe + O2 → Fe3O4' },
                { step: 3, desc: 'Fe3O4中有4个O', detail: '在O2前加2：3Fe + 2O2 → Fe3O4' },
                { step: 4, desc: '验证', detail: 'Fe: 3=3, O: 4=4 ✓' }
            ],
            7: [
                { step: 1, desc: '观察反应', detail: 'Fe + Cl2 → FeCl3' },
                { step: 2, desc: 'FeCl3中有3个Cl', detail: '需要3个Cl原子，但Cl2成对出现' },
                { step: 3, desc: '最小公倍数法', detail: 'Cl的最小公倍数为6，FeCl3前加2' },
                { step: 4, desc: '配平Cl', detail: 'Fe + 3Cl2 → 2FeCl3' },
                { step: 5, desc: '配平Fe', detail: '2Fe + 3Cl2 → 2FeCl3' }
            ],
            17: [
                { step: 1, desc: '观察反应', detail: 'KMnO4 → K2MnO4 + MnO2 + O2' },
                { step: 2, desc: 'K原子守恒', detail: 'K2MnO4前加1，KMnO4前至少需要2' },
                { step: 3, desc: 'Mn原子守恒', detail: '2KMnO4中有2个Mn，产物共2个Mn ✓' },
                { step: 4, desc: 'O原子守恒', detail: '左边8个O，右边4+2+2=8个O ✓' },
                { step: 5, desc: '最终结果', detail: '2KMnO4 → K2MnO4 + MnO2 + O2' }
            ]
        };
        return stepsMap[eq.id] || [
            { step: 1, desc: '观察反应物和产物', detail: '确定各元素原子数' },
            { step: 2, desc: '找出不守恒的元素', detail: '从最复杂的化合物开始' },
            { step: 3, desc: '调整系数', detail: '使各元素原子数相等' },
            { step: 4, desc: '验证配平结果', detail: '检查所有元素是否守恒' }
        ];
    },

    renderSystem() {
        const app = document.getElementById('equation-balancer-app');
        if (!app) return;

        const { equations, currentIndex, filterType, showSteps, showAnswer, showHelp, userCoefficients } = this.state;

        const filteredEquations = filterType === 'all' ? equations : equations.filter(e => e.type === filterType);
        const currentEq = equations[currentIndex];

        const checkResult = this.checkBalance();

        app.innerHTML = `
        <div class="balancer-system">
            <div class="balancer-header">
                <h3>⚗️ 高中化学方程式配平训练系统</h3>
                <p class="balancer-intro">收录35个高中核心化学方程式，支持分步演示和配平原理解释</p>
                <button class="help-btn" onclick="equationBalancerPro.toggleHelp()">${showHelp ? '📖 隐藏说明' : '📖 使用说明'}</button>
            </div>

            ${showHelp ? `
            <div class="help-panel">
                <h4>📋 配平方法指南</h4>
                <div class="help-content">
                    <div class="help-section">
                        <h5>🎯 配平原则</h5>
                        <p>质量守恒定律：反应前后各元素原子个数相等</p>
                    </div>
                    <div class="help-section">
                        <h5>📝 配平方法</h5>
                        <ul>
                            <li><strong>最小公倍数法</strong>：适用于简单方程式，找出原子数不等的元素，求最小公倍数</li>
                            <li><strong>观察法</strong>：从最复杂的物质入手，逐步调整系数</li>
                            <li><strong>奇数配偶法</strong>：当某元素原子数为奇数时，先配成偶数</li>
                            <li><strong>化合价升降法</strong>：适用于氧化还原反应，根据电子得失守恒配平</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h5>⚠️ 注意事项</h5>
                        <ul>
                            <li>系数只能加在化学式前面，不能改变化学式</li>
                            <li>系数必须是最简整数比</li>
                            <li>配平后要逐一检查各元素原子数</li>
                        </ul>
                    </div>
                </div>
            </div>
            ` : ''}

            <div class="balancer-main">
                <div class="equation-list">
                    <h4>📚 方程式库 (${filteredEquations.length}个)</h4>
                    <div class="filter-tabs">
                        <button class="filter-tab ${filterType === 'all' ? 'active' : ''}" onclick="equationBalancerPro.setFilter('all')">全部</button>
                        <button class="filter-tab ${filterType === 'combustion' ? 'active' : ''}" onclick="equationBalancerPro.setFilter('combustion')">燃烧</button>
                        <button class="filter-tab ${filterType === 'redox' ? 'active' : ''}" onclick="equationBalancerPro.setFilter('redox')">氧化还原</button>
                        <button class="filter-tab ${filterType === 'displacement' ? 'active' : ''}" onclick="equationBalancerPro.setFilter('displacement')">置换</button>
                        <button class="filter-tab ${filterType === 'decomposition' ? 'active' : ''}" onclick="equationBalancerPro.setFilter('decomposition')">分解</button>
                    </div>
                    <div class="equation-items">
                        ${filteredEquations.map((eq, idx) => `
                            <div class="equation-item ${currentIndex === equations.findIndex(e => e.id === eq.id) ? 'active' : ''}" onclick="equationBalancerPro.selectEquation(${eq.id})">
                                <span class="eq-name">${eq.name}</span>
                                <span class="eq-category">${eq.category}</span>
                                <span class="eq-difficulty">${'★'.repeat(eq.difficulty)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="equation-workspace">
                    ${currentEq ? `
                        <div class="equation-display">
                            <h4>${currentEq.name} <span class="difficulty-badge">${'★'.repeat(currentEq.difficulty)}</span></h4>
                            <div class="equation-formula">
                                <div class="reactants">
                                    ${currentEq.reactants.map(r => `
                                        <div class="compound-input">
                                            <input type="number" min="1" max="10" value="${userCoefficients[r] || 1}" onchange="equationBalancerPro.updateCoefficient('${r}', this.value)">
                                            <span class="compound">${r}</span>
                                        </div>
                                    `).join(' + ')}
                                </div>
                                <span class="arrow">→</span>
                                <div class="products">
                                    ${currentEq.products.map(p => `
                                        <div class="compound-input">
                                            <input type="number" min="1" max="10" value="${userCoefficients[p] || 1}" onchange="equationBalancerPro.updateCoefficient('${p}', this.value)">
                                            <span class="compound">${p}</span>
                                        </div>
                                    `).join(' + ')}
                                </div>
                            </div>
                        </div>

                        <div class="check-result ${checkResult.correct ? 'correct' : 'incorrect'}">
                            ${checkResult.message}
                        </div>

                        <div class="workspace-actions">
                            <button class="btn btn-primary" onclick="equationBalancerPro.checkBalance()">✓ 检查配平</button>
                            <button class="btn btn-secondary" onclick="equationBalancerPro.toggleSteps()">${showSteps ? '隐藏步骤' : '分步演示'}</button>
                            <button class="btn btn-secondary" onclick="equationBalancerPro.toggleAnswer()">${showAnswer ? '隐藏答案' : '显示答案'}</button>
                        </div>

                        ${showSteps ? `
                        <div class="steps-panel">
                            <h5>📝 配平步骤</h5>
                            <div class="steps-list">
                                ${this._getBalanceSteps(currentEq).map(s => `
                                    <div class="step-item">
                                        <span class="step-num">步骤${s.step}</span>
                                        <span class="step-desc">${s.desc}</span>
                                        <span class="step-detail">${s.detail}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}

                        ${showAnswer ? `
                        <div class="answer-panel">
                            <h5>✅ 正确答案</h5>
                            <div class="correct-equation">
                                ${(() => {
                                    const coeffs = this._getCorrectCoefficients(currentEq);
                                    return currentEq.reactants.map(r => (coeffs[r] || 1) + r).join(' + ') + ' → ' + currentEq.products.map(p => (coeffs[p] || 1) + p).join(' + ');
                                })()}
                            </div>
                        </div>
                        ` : ''}
                    ` : `
                        <div class="no-selection">
                            <p>请从左侧选择一个方程式开始练习</p>
                        </div>
                    `}
                </div>

                <div class="equation-info">
                    ${currentEq ? `
                        <h4>💡 知识要点</h4>
                        <div class="info-section">
                            <h5>反应类型</h5>
                            <p>${currentEq.category}</p>
                        </div>
                        <div class="info-section">
                            <h5>难度等级</h5>
                            <p>${'★'.repeat(currentEq.difficulty)}${'☆'.repeat(3 - currentEq.difficulty)}</p>
                        </div>
                        <div class="info-section">
                            <h5>配平提示</h5>
                            <p>${currentEq.difficulty === 1 ? '基础方程式，观察法即可配平' : currentEq.difficulty === 2 ? '中等难度，注意原子守恒' : '较难方程式，建议使用化合价升降法'}</p>
                        </div>
                    ` : ''}
                </div>
            </div>

            <div class="gd-section">
                <h5>🎯 高考考点</h5>
                <ul class="gd-points">
                    <li>化学方程式配平是高考必考基础技能</li>
                    <li>氧化还原反应配平常用化合价升降法</li>
                    <li>有机反应配平注意C、H、O原子守恒</li>
                    <li>配平后系数必须是最简整数比</li>
                </ul>
            </div>
        </div>`;
    }
};

// ---- window 暴露 ----
window.chemistryBalancer = chemistryBalancer;
window.chemistryQuizGenerator = chemistryQuizGenerator;
window.loadChemistryTool = loadChemistryTool;
window.renderChemistryBalancer = renderChemistryBalancer;
window.loadPreset = loadPreset;
window.balanceEquation = balanceEquation;
window.renderChemistryQuiz = renderChemistryQuiz;
window.toggleQuizType = toggleQuizType;
window.generateNewQuiz = generateNewQuiz;
window.checkAnswer = checkAnswer;
window.chemistrySafetySystem = chemistrySafetySystem;
window.electrochemistryViewer = electrochemistryViewer;
window.chemicalProcessFlow = chemicalProcessFlow;
window.equationNotebook = equationNotebook;
window.organicConverter = organicConverter;
window.chemistryProcessAnalyzer = chemistryProcessAnalyzer;
window.equationBalancerPro = equationBalancerPro;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof equationBalancerPro !== 'undefined') equationBalancerPro.init();
});

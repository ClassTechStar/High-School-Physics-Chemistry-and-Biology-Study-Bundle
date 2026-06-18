let currentSubject = 'home';
let currentTool = null;

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

const subjectContent = {
    physics: {
        knowledge: `
            <div class="knowledge-section">
                <h3>📚 物理知识点总结</h3>

                <div class="knowledge-card">
                    <h4>第一章 运动的描述</h4>
                    <div class="key-point">质点：忽略物体大小和形状，突出"物体具有质量"这一要素的点</div>
                    <div class="key-point">参考系：描述物体运动时，选作标准的物体</div>
                    <div class="key-point">位移：描述位置变化，是矢量，有大小和方向</div>
                    <div class="key-point">速度：v=Δx/Δt，描述物体运动快慢和方向</div>
                    <div class="key-point">加速度：a=Δv/Δt，描述速度变化的快慢</div>
                    <div class="common-mistake">常见错误：混淆位移与路程，位移是矢量，路程是标量</div>
                </div>

                <div class="knowledge-card">
                    <h4>第二章 相互作用与力</h4>
                    <div class="key-point">重力：G=mg，方向竖直向下</div>
                    <div class="key-point">弹力：胡克定律F=kx</div>
                    <div class="key-point">摩擦力：静摩擦0<f≤F_max，滑动摩擦f=μN</div>
                    <div class="key-point">力的合成与分解：平行四边形定则</div>
                    <div class="key-point">共点力平衡条件：ΣF=0</div>
                    <div class="common-mistake">常见错误：认为摩擦力一定是阻力</div>
                </div>

                <div class="knowledge-card">
                    <h4>第三章 牛顿运动定律</h4>
                    <div class="key-point">牛顿第一定律：惯性定律，一切物体保持匀速直线运动或静止状态</div>
                    <div class="key-point">牛顿第二定律：F=ma，加速度与合外力同向</div>
                    <div class="key-point">牛顿第三定律：作用力与反作用力大小相等、方向相反</div>
                    <div class="key-point">超重与失重：视重与实际重力的差值</div>
                    <div class="common-mistake">常见错误：认为作用力与反作用力是平衡力</div>
                </div>

                <div class="knowledge-card">
                    <h4>第四章 机械能</h4>
                    <div class="key-point">功：W=Flcosα，正功、负功、零功的判断</div>
                    <div class="key-point">功率：P=W/t，P=Fv（瞬时功率）</div>
                    <div class="key-point">动能：Ek=½mv²，动能定理W=ΔEk</div>
                    <div class="key-point">势能：重力势能Ep=mgh，弹性势能Ep=½kx²</div>
                    <div class="key-point">机械能守恒定律：只有重力或弹力做功时，机械能守恒</div>
                    <div class="common-mistake">常见错误：重力势能正负号意义不清</div>
                </div>

                <div class="knowledge-card">
                    <h4>第五章 动量</h4>
                    <div class="key-point">动量：p=mv，矢量</div>
                    <div class="key-point">动量定理：I=Δp</div>
                    <div class="key-point">动量守恒定律：系统合外力为零时，总动量不变</div>
                    <div class="key-point">碰撞：弹性碰撞、完全非弹性碰撞、非弹性碰撞</div>
                    <div class="common-mistake">常见错误：动量守恒条件判断错误</div>
                </div>

                <div class="knowledge-card">
                    <h4>第六章 静电场</h4>
                    <div class="key-point">电荷守恒定律：系统电荷代数和不变</div>
                    <div class="key-point">库仑定律：F=kq₁q₂/r²</div>
                    <div class="key-point">电场强度：E=F/q，矢量，方向规定为正电荷受力方向</div>
                    <div class="key-point">电势能、电势、电势差：Eₚ=qφ，U=Eₚ/q</div>
                    <div class="key-point">电容：C=Q/U，决定式C=εS/(4πkd)</div>
                    <div class="common-mistake">常见错误：混淆电场强度和电势，电场强度是矢量，电势是标量</div>
                </div>

                <div class="knowledge-card">
                    <h4>第七章 直流电路</h4>
                    <div class="key-point">电流：I=q/t，方向为正电荷移动方向</div>
                    <div class="key-point">电阻定律：R=ρl/S</div>
                    <div class="key-point">欧姆定律：I=U/R</div>
                    <div class="key-point">电功：W=UIt，电功率：P=UI</div>
                    <div class="key-point">串并联电路特点：串联分压、并联分流</div>
                    <div class="key-point">闭合电路欧姆定律：I=E/(R+r)</div>
                    <div class="common-mistake">常见错误：混淆电动势与路端电压</div>
                </div>

                <div class="knowledge-card">
                    <h4>第八章 磁场</h4>
                    <div class="key-point">磁感应强度：B=F/(IL)，描述磁场强弱</div>
                    <div class="key-point">安培力：F=BIL（I⊥B），左手定则</div>
                    <div class="key-point">洛伦兹力：F=qvB（v⊥B），左手定则</div>
                    <div class="key-point">带电粒子在磁场中的运动：匀速圆周运动，r=mv/(qB)，T=2πm/(qB)</div>
                    <div class="common-mistake">常见错误：左手定则与右手定则混淆</div>
                </div>

                <div class="knowledge-card">
                    <h4>第九章 电磁感应</h4>
                    <div class="key-point">磁通量：Φ=BS，变化产生感应电动势</div>
                    <div class="key-point">法拉第电磁感应定律：E=nΔΦ/Δt</div>
                    <div class="key-point">楞次定律：感应电流的磁场阻碍原磁场变化</div>
                    <div class="key-point">自感现象：自感电动势E=LΔI/Δt</div>
                    <div class="key-point">交变电流：e=Eₘsinωt</div>
                    <div class="common-mistake">常见错误：感应电流方向判断错误</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十章 几何光学</h4>
                    <div class="key-point">光的直线传播：同种均匀介质中光沿直线传播</div>
                    <div class="key-point">光的反射：反射定律，反射角等于入射角</div>
                    <div class="key-point">光的折射：n=sin i/sin r，折射率n>1</div>
                    <div class="key-point">全反射：sin C=1/n，临界角C</div>
                    <div class="key-point">透镜成像规律：1/u+1/v=1/f</div>
                    <div class="common-mistake">常见错误：全反射条件判断错误</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十一章 波动光学</h4>
                    <div class="key-point">光的干涉：双缝干涉明纹条件Δx=λL/d</div>
                    <div class="key-point">光的衍射：单缝衍射，中央明纹最亮</div>
                    <div class="key-point">光的偏振：横波特有现象</div>
                    <div class="key-point">电磁波谱：无线电波→红外线→可见光→紫外线→X射线→γ射线</div>
                    <div class="common-mistake">常见错误：干涉与衍射混淆</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十二章 热学</h4>
                    <div class="key-point">分子动理论：物体由大量分子组成，分子在做永不停息的无规则运动</div>
                    <div class="key-point">温度：分子平均动能的标志</div>
                    <div class="key-point">内能：物体内所有分子动能和势能的总和</div>
                    <div class="key-point">热力学第一定律：ΔU=Q+W</div>
                    <div class="key-point">气体实验定律：玻意耳定律、查理定律、盖·吕萨克定律</div>
                    <div class="key-point">理想气体状态方程：PV=nRT</div>
                    <div class="common-mistake">常见错误：温度单位必须用热力学温标</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十三章 机械振动</h4>
                    <div class="key-point">简谐运动：F=-kx，回复力与位移成正比</div>
                    <div class="key-point">振幅A：振动物体离开平衡位置的最大距离</div>
                    <div class="key-point">周期T：完成一次全振动的时间</div>
                    <div class="key-point">频率f：单位时间内完成全振动的次数，f=1/T</div>
                    <div class="key-point">单摆周期：T=2π√(l/g)</div>
                    <div class="key-point">受迫振动：物体在周期性外力作用下的振动</div>
                    <div class="key-point">共振：受迫振动频率等于固有频率时，振幅最大</div>
                    <div class="common-mistake">常见错误：混淆周期和频率的关系</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十四章 机械波</h4>
                    <div class="key-point">机械波：机械振动在介质中的传播</div>
                    <div class="key-point">横波：质点振动方向与波传播方向垂直</div>
                    <div class="key-point">纵波：质点振动方向与波传播方向平行</div>
                    <div class="key-point">波长λ：相邻波峰或波谷之间的距离</div>
                    <div class="key-point">波速v：波传播的速度，v=λ/T=λf</div>
                    <div class="key-point">波的干涉：两列相干波叠加，形成稳定干涉图样</div>
                    <div class="key-point">波的衍射：波绕过障碍物传播的现象</div>
                    <div class="common-mistake">常见错误：混淆波速与质点振动速度</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十五章 原子物理</h4>
                    <div class="key-point">原子结构：核式结构（原子核+核外电子）</div>
                    <div class="key-point">氢原子光谱：巴尔末公式1/λ=R(1/2²-1/n²)</div>
                    <div class="key-point">玻尔理论：能量量子化，稳定态假设，频率条件</div>
                    <div class="key-point">能级跃迁：hν=Eₙ-Eₘ</div>
                    <div class="key-point">原子核组成：质子+中子</div>
                    <div class="key-point">天然放射现象：α、β、γ三种射线</div>
                    <div class="key-point">半衰期：放射性元素原子核数减半所需时间</div>
                    <div class="key-point">核反应方程：质量数守恒、电荷数守恒</div>
                    <div class="key-point">爱因斯坦质能方程：E=mc²</div>
                    <div class="common-mistake">常见错误：混淆衰变次数与半衰期</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十六章 光电效应</h4>
                    <div class="key-point">光电效应：光子照射金属表面发射电子的现象</div>
                    <div class="key-point">爱因斯坦光电方程：Eₖ=hv-W₀</div>
                    <div class="key-point">最大初动能：电子逸出金属表面时的最大动能</div>
                    <div class="key-point">逸出功W₀：使电子逸出金属表面所需最小能量</div>
                    <div class="key-point">截止频率：使金属发生光电效应的最小频率</div>
                    <div class="key-point">光子能量：E=hv=h(c/λ)</div>
                    <div class="common-mistake">常见错误：认为光电子数目与入射光频率成正比</div>
                </div>

                <div class="knowledge-card">
                    <h4>附录一：常用仪器读数与估读规则</h4>
                    <div class="key-point"><strong>核心原则：</strong>使读数的最后一位（估读位）与仪器误差所在位对齐，误差取最小分度值的一半</div>
                    <div class="key-point"><strong>需要估读：</strong>刻度尺、螺旋测微器、电流表、电压表、弹簧测力计（刻度线可连续变化）</div>
                    <div class="key-point"><strong>不需估读：</strong>游标卡尺、机械秒表、电阻箱、数字式仪表（示数跳跃变化）</div>
                    <div class="key-point"><strong>估读口诀：</strong>"见1（含0.1）估下位，见2估半格（同一位），见5估五份（同一位）"</div>
                </div>

                <div class="knowledge-card">
                    <h4>附录二：刻度尺与螺旋测微器</h4>
                    <div class="key-point"><strong>刻度尺：</strong>估读到最小分度值下一位。毫米尺(精度1mm)读到0.1mm位。如13.55cm，"13.5"为准确值，"0.05"为估读值。末端对准整刻度线时记录为21.00cm</div>
                    <div class="key-point"><strong>螺旋测微器读数三步法：</strong>①读固定刻度（注意半毫米刻线是否露出）②读可动刻度（哪条线与基线对齐）③相加：测量值=固定刻度+可动刻度格数×0.01mm</div>
                    <div class="key-point"><strong>小数位规则：</strong>以mm为单位，小数点后必须有三位（最后一位为估读位），精度0.01mm，1/10估读到0.001mm</div>
                    <div class="common-mistake">常见错误：螺旋测微器忘记检查半毫米刻线是否露出；刻度尺末端对准整刻度时未补零</div>
                </div>

                <div class="knowledge-card">
                    <h4>附录三：游标卡尺</h4>
                    <div class="key-point"><strong>读数三步法（无需估读）：</strong>①主尺整数：游标"0"线左侧最近的整毫米刻度 ②游标小数：找到游标上与主尺对齐的第n条线，小数=n×精度 ③相加得结果</div>
                    <div class="key-point"><strong>10分度：</strong>精度0.1mm，结果1位小数，如23.4mm</div>
                    <div class="key-point"><strong>20分度：</strong>精度0.05mm，结果2位小数（末位0或5），如23.40mm或23.45mm</div>
                    <div class="key-point"><strong>50分度：</strong>精度0.02mm，结果2位小数（末位偶数），如23.42mm</div>
                    <div class="common-mistake">常见错误：游标卡尺误估读；不同分度精度混淆</div>
                </div>

                <div class="knowledge-card">
                    <h4>附录四：电流表与电压表估读</h4>
                    <div class="key-point"><strong>电流表：</strong>串联，"+"进"-"出，严禁直接接电源。先估测或用"试触法"选量程（指针偏转超过满偏1/3，最好在2/3左右）</div>
                    <div class="key-point"><strong>电压表：</strong>并联，"+"接高电势端</div>
                    <div class="key-point"><strong>最小分度为"1"（如0.1A, 0.1V）：</strong>1/10估读法，估读到下一位。如0~3A档读数1.23A</div>
                    <div class="key-point"><strong>最小分度为"2"（如0.02A, 0.2V）：</strong>1/2估读法（半格估读），估读到同一位。如0~0.6A档读数0.45A</div>
                    <div class="key-point"><strong>最小分度为"5"（如0.5V, 0.05A）：</strong>1/5估读法，估读到同一位。如0~15V档读数11.7V</div>
                    <div class="common-mistake">常见错误：不同量程估读方法混淆；电流表并联使用</div>
                </div>

                <div class="knowledge-card">
                    <h4>附录五：多用电表与电表改装</h4>
                    <div class="key-point"><strong>多用电表通用步骤：</strong>机械调零→插好表笔(红+黑-)→选功能和量程→测量→用毕置于OFF或交流最高档</div>
                    <div class="key-point"><strong>欧姆档使用：</strong>选倍率(使指针指中值附近)→欧姆调零(短接表笔调零)→测量(电阻与电路断开)→读数=示数×倍率。每次换挡必须重新调零！</div>
                    <div class="key-point"><strong>改装电压表：</strong>串联大电阻分压，R=U/Ig-Rg，内阻RV=Rg+R（很大），测量时并联</div>
                    <div class="key-point"><strong>改装电流表：</strong>并联小电阻分流，R=(Ig×Rg)/(I-Ig)，内阻RA=(Rg×R)/(Rg+R)（很小），测量时串联</div>
                    <div class="key-point"><strong>欧姆表原理：</strong>I=E/(R内+Rx)，刻度不均匀（左密右疏），中值电阻=内阻</div>
                    <div class="key-point"><strong>记忆口诀：</strong>"电压串联大电阻，电流并联小电阻；电压并着测，电流串着测"；"换挡必调零，刻度反着读，中阻即内阻"</div>
                    <div class="common-mistake">常见错误：欧姆档换挡后忘记重新调零；电表改装公式混淆</div>
                </div>
            </div>
        `,
        examples: `
            <div class="examples-section">
                <h3>📝 典型例题</h3>

                <div class="knowledge-card">
                    <h4>例题1：运动学计算</h4>
                    <p>一个物体从静止开始做匀加速直线运动，已知第3秒内的位移为6m，则物体的加速度为多少？</p>
                    <div class="key-point">解答：第3秒内的位移等于前3秒位移减去前2秒位移。设加速度为a，前3秒位移x₃=½a·9=4.5a，前2秒位移x₂=½a·4=2a，第3秒位移Δx=x₃-x₂=2.5a=6m，解得a=2.4m/s²。</div>
                    <div class="common-mistake">常见错误：直接用x₃=½a·9=6m，解得a=4/3m/s²</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题2：摩擦力计算</h4>
                    <p>在水平地面上放置一个质量为2kg的物体，若它受到10N的水平拉力后做匀速直线运动，则物体与地面间的动摩擦因数μ为多少？</p>
                    <div class="key-point">解答：匀速运动时，拉力与摩擦力平衡，f=μmg=10N，所以μ=10/(2×10)=0.5。</div>
                    <div class="common-mistake">常见错误：忘记乘以g，直接计算μ=10/2=5</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题3：电场强度与电势</h4>
                    <p>在点电荷Q的电场中，距离Q为r的A点场强为E，电势为φ。则以下说法正确的是：</p>
                    <p style="color: var(--gray);">A. E与r²成反比，φ与r成正比</p>
                    <p style="color: var(--gray);">B. E与r²成反比，φ与r成反比</p>
                    <p style="color: var(--gray);">C. E与r成正比，φ与r成反比</p>
                    <p style="color: var(--gray);">D. E与r成正比，φ与r成正比</p>
                    <div class="key-point">答案：B</div>
                    <div class="common-mistake">E=kQ/r²，φ=kQ/r</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题4：原子跃迁</h4>
                    <p>氢原子从n=3的能级跃迁到n=1的能级时，辐射光子的波长为多少？（R=1.097×10⁷m⁻¹）</p>
                    <div class="key-point">解答：1/λ=R(1/1²-1/3²)=R(8/9)，λ=9/(8R)=1.025×10⁻⁷m</div>
                    <div class="common-mistake">计算时注意单位统一</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题5：理想气体状态方程</h4>
                    <p>一容器内盛有理想气体，温度为27°C，压强为2×10⁵Pa。则该气体在127°C时的压强为多少？</p>
                    <div class="key-point">解答：T₁=300K，T₂=400K，P₁/T₁=P₂/T₂，2×10⁵/300=P₂/400，P₂=2.67×10⁵Pa</div>
                    <div class="common-mistake">温度必须用热力学温标</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题6：光电效应</h4>
                    <p>某金属的逸出功为3.68×10⁻¹⁹J，用波长为300nm的光照射该金属，求光电子的最大初动能。</p>
                    <div class="key-point">解答：E=hc/λ=6.63×10⁻³⁴×3×10⁸/(300×10⁻⁹)=6.63×10⁻¹⁹J</div>
                    <div class="key-point">Eₖ=hv-W₀=6.63×10⁻¹⁹-3.68×10⁻¹⁹=2.95×10⁻¹⁹J</div>
                    <div class="common-mistake">计算时注意单位换算</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题7：简谐运动周期</h4>
                    <p>一弹簧振子的周期为2s，若将弹簧剪掉一半，振子周期变为多少？</p>
                    <div class="key-point">解答：T=2π√(m/k)，k与弹簧长度成反比，减半后k变为2k</div>
                    <div class="key-point">T'=2π√(m/2k)=T/√2=√2s≈1.41s</div>
                    <div class="common-mistake">弹簧减半，劲度系数加倍</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题8：波的干涉</h4>
                    <p>两列相干波在P点相遇，波程差为3λ，则P点是振动加强点还是减弱点？</p>
                    <div class="key-point">解答：波程差=3λ=3×λ，满足Δs=nλ（n=3），所以P点是振动加强点</div>
                    <div class="common-mistake">加强条件：Δs=nλ；减弱条件：Δs=(2n+1)λ/2</div>
                </div>
            </div>
        `,
        experiments: `
            <div class="experiments-section">
                <h3>🔬 实验指导</h3>

                <div class="knowledge-card">
                    <h4>实验：测速度</h4>
                    <p><strong>实验目的：</strong>学会使用打点计时器测速度，区分平均速度和瞬时速度</p>
                    <p><strong>实验原理：</strong>利用打点计时器记录物体运动的时间间隔，通过纸带上的点间距计算速度</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>把打点计时器固定在实验台上</li>
                        <li>将纸带穿过打点计时器，另一端连接运动物体</li>
                        <li>先接通电源，后释放纸带</li>
                        <li>取纸带后关闭电源</li>
                        <li>选取计数点，测量相邻计数点间距</li>
                        <li>计算各段平均速度和瞬时速度</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>打点计时器必须先通电后释放纸带</li>
                        <li>选取纸带时，应选点迹清晰且连续的</li>
                        <li>计数点间隔选取要合理</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验：测定金属的电阻率</h4>
                    <p><strong>实验目的：</strong>学会用伏安法测电阻，测定金属的电阻率</p>
                    <p><strong>实验原理：</strong>R=ρl/S，通过测量长度l、电压U、电流I，计算电阻ρ</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>用刻度尺测量金属丝长度</li>
                        <li>用螺旋测微器测量直径</li>
                        <li>按电路图连接电路</li>
                        <li>闭合开关，调节变阻器</li>
                        <li>读取多组U、I值</li>
                        <li>计算电阻率</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>电流不宜过大</li>
                        <li>电压表内接法适合测大电阻</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验：测定玻璃的折射率</h4>
                    <p><strong>实验目的：</strong>用插针法测定玻璃的折射率</p>
                    <p><strong>实验原理：</strong>n=sin i/sin r</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>将玻璃砖放在白纸上，描出界面aa'和bb'</li>
                        <li>在aa'一侧插两枚大头针P₁、P₂</li>
                        <li>在bb'一侧观察P₁、P₂的像，插P₃、P₄使其与像共线</li>
                        <li>画出光路，测量入射角i和折射角r</li>
                        <li>计算折射率n</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>大头针要竖直插牢</li>
                        <li>入射角不能太大（避免全反射）</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验：用双缝干涉测光的波长</h4>
                    <p><strong>实验目的：</strong>测定单色光的波长</p>
                    <p><strong>实验原理：</strong>条纹间距Δx=λL/d</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>安装双缝干涉仪，调整光路</li>
                        <li>调节单缝使光源发出清晰干涉条纹</li>
                        <li>测量n条亮纹间的距离</li>
                        <li>计算相邻亮纹间距Δx</li>
                        <li>已知L、d，计算波长λ=Δx·d/L</li>
                    </ol>
                </div>

                <div class="knowledge-card">
                    <h4>实验：验证动量守恒定律</h4>
                    <p><strong>实验目的：</strong>验证碰撞中的动量守恒</p>
                    <p><strong>实验原理：</strong>m₁v₁+m₂v₂=m₁v₁'+m₂v₂'</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>用天平称量两球质量m₁、m₂</li>
                        <li>按图安装实验装置</li>
                        <li>让小球从斜槽某一高度滚下</li>
                        <li>记录落地点位置</li>
                        <li>重复实验多次</li>
                        <li>验证动量守恒</li>
                    </ol>
                </div>

                <div class="knowledge-card">
                    <h4>实验：验证单摆周期公式</h4>
                    <p><strong>实验目的：</strong>验证单摆周期与摆长的关系</p>
                    <p><strong>实验原理：</strong>T=2π√(l/g)</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>安装单摆，摆长约1m</li>
                        <li>测出摆长l</li>
                        <li>让单摆做小角度摆动</li>
                        <li>测出30-50次全振动的时间t</li>
                        <li>计算周期T=t/n</li>
                        <li>改变摆长，重复实验</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>摆角小于5°</li>
                        <li>摆线要细且不易伸长</li>
                    </ul>
                </div>
            </div>
        `,
        tests: `
            <div class="tests-section">
                <h3>📋 模拟测试</h3>

                <div class="knowledge-card">
                    <h4>基础巩固</h4>
                    <p>1. 关于位移和路程的说法，正确的是（ ）</p>
                    <p style="color: var(--gray);">A. 位移的大小一定大于路程</p>
                    <p style="color: var(--gray);">B. 物体做直线运动时，位移的大小等于路程</p>
                    <p style="color: var(--gray);">C. 位移是矢量，路程是标量</p>
                    <p style="color: var(--gray);">D. 位移取决于初始位置和终止位置，与路径无关</p>
                    <p style="color: var(--secondary);">答案：C、D</p>
                </div>

                <div class="knowledge-card">
                    <h4>能力提升</h4>
                    <p>2. 一个物体从H高处自由下落，经时间t落地，则当它下落t/2时，离地面的高度为（ ）</p>
                    <p style="color: var(--gray);">A. H/2</p>
                    <p style="color: var(--gray);">B. H/4</p>
                    <p style="color: var(--gray);">C. 3H/4</p>
                    <p style="color: var(--gray);">D. H</p>
                    <p style="color: var(--secondary);">答案：C</p>
                </div>

                <div class="knowledge-card">
                    <h4>高考冲刺</h4>
                    <p>3. 在光滑水平面上，一质量为m的小球以速度v撞击静止的相同质量的小球，碰撞后它们的速度可能为（ ）</p>
                    <p style="color: var(--gray);">A. v和0</p>
                    <p style="color: var(--gray);">B. 0和v</p>
                    <p style="color: var(--gray);">C. v/2和v/2</p>
                    <p style="color: var(--gray);">D. 0和0</p>
                    <p style="color: var(--secondary);">答案：C</p>
                </div>

                <div class="knowledge-card">
                    <h4>高考冲刺</h4>
                    <p>4. 一束光从空气射入玻璃，已知入射角为60°，折射角为30°，则玻璃的折射率为（ ）</p>
                    <p style="color: var(--gray);">A. √3</p>
                    <p style="color: var(--gray);">B. √3/3</p>
                    <p style="color: var(--gray);">C. 1/√3</p>
                    <p style="color: var(--gray);">D. √2</p>
                    <p style="color: var(--secondary);">答案：A（n=sin60°/sin30°=√3）</p>
                </div>

                <div class="knowledge-card">
                    <h4>高考冲刺</h4>
                    <p>5. 氢原子的基态能量为-13.6eV，则氢原子从n=3跃迁到n=1时，辐射光子的能量为（ ）</p>
                    <p style="color: var(--gray);">A. 12.09eV</p>
                    <p style="color: var(--gray);">B. 10.2eV</p>
                    <p style="color: var(--gray);">C. 1.89eV</p>
                    <p style="color: var(--gray);">D. 3.4eV</p>
                    <p style="color: var(--secondary);">答案：A（ΔE=-13.6/9-(-13.6)=12.09eV）</p>
                </div>

                <div class="knowledge-card">
                    <h4>高考冲刺</h4>
                    <p>6. 一定量的理想气体，体积膨胀时（ ）</p>
                    <p style="color: var(--gray);">A. 分子平均动能一定增大</p>
                    <p style="color: var(--gray);">B. 气体一定对外做功</p>
                    <p style="color: var(--gray);">C. 气体一定吸热</p>
                    <p style="color: var(--gray);">D. 内能一定增加</p>
                    <p style="color: var(--secondary);">答案：B</p>
                </div>

                <div class="knowledge-card">
                    <h4>高考冲刺</h4>
                    <p>7. 两列相干波在空间相遇，某点恰为振动加强点，则该点到两波源的距离差为（ ）</p>
                    <p style="color: var(--gray);">A. λ/2的奇数倍</p>
                    <p style="color: var(--gray);">B. λ的整数倍</p>
                    <p style="color: var(--gray);">C. λ/2的整数倍</p>
                    <p style="color: var(--gray);">D. 3λ/4</p>
                    <p style="color: var(--secondary);">答案：B（加强：Δs=nλ）</p>
                </div>

                <div class="knowledge-card">
                    <h4>高考冲刺</h4>
                    <p>8. 光电效应中，光电子的最大初动能与入射光的关系是（ ）</p>
                    <p style="color: var(--gray);">A. 与入射光强度成正比</p>
                    <p style="color: var(--gray);">B. 与入射光频率成正比</p>
                    <p style="color: var(--gray);">C. 与入射光频率成线性关系</p>
                    <p style="color: var(--gray);">D. 与入射光波长成反比</p>
                    <p style="color: var(--secondary);">答案：C</p>
                </div>
            </div>
        `
    },
    chemistry: {
        knowledge: `
            <div class="knowledge-section">
                <h3>📚 化学知识点总结</h3>

                <div class="knowledge-card">
                    <h4>第一章 化学计量</h4>
                    <div class="key-point">物质的量(n)：表示含有一定数目粒子的集合体，单位mol</div>
                    <div class="key-point">阿伏伽德罗常数(NA)：6.02×10²³ mol⁻¹</div>
                    <div class="key-point">摩尔质量(M)：单位物质的量的物质所具有的质量，g/mol</div>
                    <div class="key-point">气体摩尔体积(Vm)：标准状况下，1mol任何气体的体积约为22.4L</div>
                    <div class="key-point">物质的量浓度(c)：c=n/V，单位mol/L</div>
                    <div class="key-point">配制一定物质的量浓度溶液的步骤：计算→称量→溶解→冷却→转移→洗涤→定容→摇匀</div>
                    <div class="common-mistake">常见错误：气体摩尔体积22.4L/mol仅适用于标准状况；容量瓶不能用于溶解或稀释</div>
                </div>

                <div class="knowledge-card">
                    <h4>第二章 离子反应</h4>
                    <div class="key-point">电解质：在水溶液或熔融状态下能导电的化合物（酸、碱、盐）</div>
                    <div class="key-point">非电解质：在水溶液和熔融状态下均不能导电的化合物（蔗糖、酒精等）</div>
                    <div class="key-point">强电解质：完全电离（强酸、强碱、大多数盐）</div>
                    <div class="key-point">弱电解质：部分电离（弱酸、弱碱、水）</div>
                    <div class="key-point">离子反应发生的条件：生成沉淀、气体、弱电解质或发生氧化还原反应</div>
                    <div class="key-point">离子方程式书写步骤：写→拆→删→查</div>
                    <div class="common-mistake">常见错误：离子方程式拆写错误（如CaCO₃写成Ca²⁺+CO₃²⁻）；弱电解质不能拆</div>
                </div>

                <div class="knowledge-card">
                    <h4>第三章 氧化还原反应</h4>
                    <div class="key-point">氧化反应：失去电子（或化合价升高）</div>
                    <div class="key-point">还原反应：得到电子（或化合价降低）</div>
                    <div class="key-point">氧化剂：得电子，化合价降低，被还原，发生还原反应</div>
                    <div class="key-point">还原剂：失电子，化合价升高，被氧化，发生氧化反应</div>
                    <div class="key-point">氧化还原反应规律：电子守恒、化合价升降总数相等</div>
                    <div class="key-point">常见氧化剂：O₂、Cl₂、HNO₃、KMnO₄、浓H₂SO₄</div>
                    <div class="key-point">常见还原剂：Na、Fe、C、CO、H₂、SO₂</div>
                    <div class="common-mistake">常见错误：氧化剂被还原（不是被氧化）；还原剂被氧化（不是被还原）</div>
                </div>

                <div class="knowledge-card">
                    <h4>第四章 电化学</h4>
                    <div class="key-point">原电池：化学能转化为电能，负极氧化、正极还原</div>
                    <div class="key-point">原电池构成条件：两个活泼性不同的电极、电解质溶液、形成闭合回路、自发氧化还原反应</div>
                    <div class="key-point">电解池：电能转化为化学能，阳极氧化、阴极还原</div>
                    <div class="key-point">金属腐蚀：化学腐蚀与电化学腐蚀（吸氧腐蚀为主）</div>
                    <div class="key-point">金属防护：牺牲阳极阴极保护法、外加电流阴极保护法</div>
                    <div class="common-mistake">常见错误：原电池正负极判断错误；电解池阴阳极与电源正负极对应关系混淆</div>
                </div>

                <div class="knowledge-card">
                    <h4>第五章 元素周期律与周期表</h4>
                    <div class="key-point">元素周期表结构：7个周期（3短3长1不完全）、16族（7主7副1Ⅷ10）</div>
                    <div class="key-point">同周期从左到右：原子半径减小、金属性减弱、非金属性增强</div>
                    <div class="key-point">同主族从上到下：原子半径增大、金属性增强、非金属性减弱</div>
                    <div class="key-point">金属性判断依据：与水/酸反应剧烈程度、最高价氧化物水化物碱性、置换反应</div>
                    <div class="key-point">非金属性判断依据：与H₂化合难易、气态氢化物稳定性、最高价含氧酸酸性</div>
                    <div class="common-mistake">常见错误：混淆金属性与非金属性的递变规律；原子半径比较忽略电子层数</div>
                </div>

                <div class="knowledge-card">
                    <h4>第六章 化学键与物质结构</h4>
                    <div class="key-point">离子键：阴阳离子之间的静电作用（活泼金属与活泼非金属）</div>
                    <div class="key-point">共价键：原子间通过共用电子对形成的化学键（极性键与非极性键）</div>
                    <div class="key-point">金属键：金属阳离子与自由电子之间的作用力</div>
                    <div class="key-point">分子间作用力：范德华力、氢键</div>
                    <div class="key-point">晶体类型：离子晶体、原子晶体、分子晶体、金属晶体</div>
                    <div class="key-point">杂化轨道理论：sp（直线形）、sp²（平面三角形）、sp³（四面体形）</div>
                    <div class="common-mistake">常见错误：分子间作用力不属于化学键；氢键是分子间作用力不是化学键</div>
                </div>

                <div class="knowledge-card">
                    <h4>第七章 化学反应与能量</h4>
                    <div class="key-point">吸热反应：反应物总能量小于生成物总能量</div>
                    <div class="key-point">放热反应：反应物总能量大于生成物总能量</div>
                    <div class="key-point">焓变(ΔH)：ΔH=生成物总能量-反应物总能量</div>
                    <div class="key-point">热化学方程式书写：注明聚集状态、ΔH带正负号、化学计量数可为分数</div>
                    <div class="key-point">盖斯定律：化学反应的反应热只与始态和终态有关，与途径无关</div>
                    <div class="common-mistake">常见错误：ΔH正负号含义混淆；热化学方程式不标状态</div>
                </div>

                <div class="knowledge-card">
                    <h4>第八章 化学反应速率与化学平衡</h4>
                    <div class="key-point">化学反应速率：v=Δc/Δt，单位mol/(L·s)</div>
                    <div class="key-point">影响速率因素：浓度、温度、催化剂、压强（气体）、表面积</div>
                    <div class="key-point">化学平衡状态标志：正反应速率=逆反应速率，各组分浓度不变</div>
                    <div class="key-point">平衡移动原理（勒夏特列原理）：改变条件，平衡向减弱该改变的方向移动</div>
                    <div class="key-point">平衡常数K：K值越大，正反应进行程度越大；K只与温度有关</div>
                    <div class="key-point">转化率α=已反应的量/起始总量×100%</div>
                    <div class="common-mistake">常见错误：催化剂不能使平衡移动；增大压强不一定改变速率（恒容充惰气）</div>
                </div>

                <div class="knowledge-card">
                    <h4>第九章 水溶液中的离子平衡</h4>
                    <div class="key-point">弱电解质电离平衡：电离度α、电离常数Ka/Kb</div>
                    <div class="key-point">水的电离：Kw=[H⁺][OH⁻]=1×10⁻¹⁴(25°C)</div>
                    <div class="key-point">pH=-lg[H⁺]，酸性pH<7，碱性pH>7</div>
                    <div class="key-point">盐类水解：有弱才水解，谁弱谁水解，谁强显谁性</div>
                    <div class="key-point">沉淀溶解平衡：溶度积Ksp，Ksp与溶解度关系</div>
                    <div class="key-point">离子浓度大小比较：物料守恒、电荷守恒、质子守恒</div>
                    <div class="common-mistake">常见错误：盐溶液酸碱性判断错误；离子浓度大小排序遗漏守恒关系</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十章 有机化学基础</h4>
                    <div class="key-point">烷烃(CₙH₂ₙ₊₂)：取代反应为主，甲烷正四面体结构</div>
                    <div class="key-point">烯烃(CₙH₂ₙ)：加成反应、加聚反应，乙烯平面形</div>
                    <div class="key-point">炔烃(CₙH₂ₙ₋₂)：加成反应，乙炔直线形</div>
                    <div class="key-point">苯：特殊结构，兼有加成和取代反应，不能使KMnO₄褪色</div>
                    <div class="key-point">卤代烃：水解反应（NaOH水溶液）、消去反应（NaOH醇溶液）</div>
                    <div class="key-point">醇：与Na反应、催化氧化、消去、酯化</div>
                    <div class="key-point">醛：银镜反应、与新制Cu(OH)₂反应、氧化为酸</div>
                    <div class="key-point">羧酸：酸性、酯化反应</div>
                    <div class="key-point">酯：水解反应（酸性/碱性条件）</div>
                    <div class="common-mistake">常见错误：混淆加成与取代反应条件；醇的催化氧化产物判断错误</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十一章 化学实验基础</h4>
                    <div class="key-point">常用仪器：容量瓶、滴定管、蒸馏烧瓶、分液漏斗</div>
                    <div class="key-point">基本操作：称量、溶解、过滤、蒸发、蒸馏、分液、萃取</div>
                    <div class="key-point">气体制备：发生装置→净化装置→干燥装置→收集装置→尾气处理</div>
                    <div class="key-point">离子检验：Cl⁻(AgNO₃)、SO₄²⁻(BaCl₂)、CO₃²⁻(HCl+石灰水)、Fe³⁺(KSCN)</div>
                    <div class="key-point">安全操作：防倒吸、防暴沸、防污染、尾气处理</div>
                    <div class="common-mistake">常见错误：容量瓶使用方法错误；蒸馏温度计位置错误</div>
                </div>
            </div>
        `,
        examples: `
            <div class="examples-section">
                <h3>📝 典型例题</h3>

                <div class="knowledge-card">
                    <h4>例题1：NA计算</h4>
                    <p>标准状况下，5.6L O₂所含的分子数约为多少？</p>
                    <div class="key-point">解答：n(O₂)=5.6/22.4=0.25mol，N=0.25×6.02×10²³=1.505×10²³</div>
                    <div class="common-mistake">常见错误：直接写成5.6×6.02×10²³</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题2：离子共存</h4>
                    <p>下列离子能在溶液中大量共存的是：</p>
                    <p style="color: var(--gray);">A. Na⁺、Cl⁻、Ag⁺、NO₃⁻</p>
                    <p style="color: var(--gray);">B. K⁺、SO₄²⁻、Ba²⁺、NO₃⁻</p>
                    <p style="color: var(--gray);">C. Na⁺、Cl⁻、K⁺、NO₃⁻</p>
                    <p style="color: var(--gray);">D. Ca²⁺、CO₃²⁻、H⁺、Cl⁻</p>
                    <div class="key-point">答案：C</div>
                    <div class="common-mistake">A中Ag⁺+Cl⁻→AgCl↓；B中Ba²⁺+SO₄²⁻→BaSO₄↓；D中CO₃²⁻+H⁺→CO₂↑+H₂O</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题3：氧化还原反应配平</h4>
                    <p>配平：Cu + HNO₃(稀) → Cu(NO₃)₂ + NO↑ + H₂O</p>
                    <div class="key-point">解答：Cu化合价升高2，N化合价降低3（+5→+2），最小公倍数为6</div>
                    <div class="key-point">3Cu + 8HNO₃(稀) → 3Cu(NO₃)₂ + 2NO↑ + 4H₂O</div>
                    <div class="common-mistake">注意：8mol HNO₃中只有2mol被还原，6mol起酸性作用</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题4：原电池计算</h4>
                    <p>锌铜原电池中，若导线中通过0.2mol电子，求消耗锌的质量和生成铜的质量。</p>
                    <div class="key-point">解答：负极 Zn-2e⁻→Zn²⁺，正极 Cu²⁺+2e⁻→Cu</div>
                    <div class="key-point">n(Zn)=n(e⁻)/2=0.1mol，m(Zn)=0.1×65=6.5g</div>
                    <div class="key-point">n(Cu)=n(e⁻)/2=0.1mol，m(Cu)=0.1×64=6.4g</div>
                    <div class="common-mistake">常见错误：电子转移数与物质的量关系计算错误</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题5：化学平衡计算</h4>
                    <p>在密闭容器中，N₂+3H₂⇌2NH₃，起始时N₂为4mol，H₂为8mol，达平衡时N₂转化率为25%，求H₂转化率和NH₃的体积分数。</p>
                    <div class="key-point">解答：转化的N₂=4×25%=1mol，转化的H₂=3mol，生成的NH₃=2mol</div>
                    <div class="key-point">平衡时：N₂=3mol，H₂=5mol，NH₃=2mol，总量=10mol</div>
                    <div class="key-point">H₂转化率=3/8×100%=37.5%，NH₃体积分数=2/10×100%=20%</div>
                    <div class="common-mistake">常见错误：三段式计算时起始量、转化量、平衡量混淆</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题6：盐类水解</h4>
                    <p>比较等浓度的①CH₃COONa ②NaCl ③NH₄Cl ④NaHCO₃溶液的pH由大到小的顺序。</p>
                    <div class="key-point">解答：④NaHCO₃水解呈碱性(pH>7) > ①CH₃COONa水解呈碱性(pH>7) > ②NaCl不水解(pH=7) > ③NH₄Cl水解呈酸性(pH<7)</div>
                    <div class="key-point">注意：HCO₃⁻水解程度大于CH₃COO⁻，故NaHCO₃碱性更强</div>
                    <div class="common-mistake">常见错误：NaHCO₃和CH₃COONa碱性强弱判断错误</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题7：有机物同分异构体</h4>
                    <p>分子式为C₄H₈的有机物有多少种同分异构体（不考虑立体异构）？</p>
                    <div class="key-point">解答：C₄H₈不饱和度为1，可能是烯烃或环烷烃</div>
                    <div class="key-point">烯烃：CH₂=CHCH₂CH₃(1-丁烯)、CH₃CH=CHCH₃(2-丁烯)、CH₂=C(CH₃)₂(2-甲基丙烯)共3种</div>
                    <div class="key-point">环烷烃：环丁烷、甲基环丙烷共2种</div>
                    <div class="key-point">总计5种同分异构体</div>
                    <div class="common-mistake">常见错误：遗漏环烷烃或2-甲基丙烯</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题8：元素周期律推断</h4>
                    <p>短周期元素X、Y、Z，X原子的最外层电子数是内层的2倍，Y是地壳中含量最多的元素，Z与Y同主族。则下列说法正确的是？</p>
                    <div class="key-point">解答：X最外层是内层2倍→X为C(2,4)；Y地壳含量最多→Y为O；Z与O同主族→Z为S</div>
                    <div class="key-point">原子半径：S>C>O；最高价含氧酸酸性：H₂SO₄>H₂CO₃</div>
                    <div class="key-point">气态氢化物稳定性：H₂O>H₂S</div>
                    <div class="common-mistake">常见错误：原子半径比较忽略电子层数影响</div>
                </div>
            </div>
        `,
        experiments: `
            <div class="experiments-section">
                <h3>🔬 实验指导</h3>

                <div class="knowledge-card">
                    <h4>实验一：酸碱中和滴定</h4>
                    <p><strong>实验目的：</strong>学会用滴定法测定酸或碱的浓度</p>
                    <p><strong>实验原理：</strong>利用酸碱中和反应，按照化学计量数比完全反应，通过已知浓度的溶液测定未知浓度</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>滴定管检漏、洗涤、润洗</li>
                        <li>装入标准液，赶气泡，记录初读数</li>
                        <li>用待测液润洗移液管</li>
                        <li>移取25.00mL待测液于锥形瓶中</li>
                        <li>加入2-3滴酚酞指示剂</li>
                        <li>滴定：边滴边摇，至溶液恰好变色</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>滴定管读数精确到0.01mL</li>
                        <li>锥形瓶不能用待测液润洗</li>
                        <li>滴定终点：半滴标准液使溶液变色且30秒不褪色</li>
                        <li>重复2-3次取平均值</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验二：配制一定物质的量浓度溶液</h4>
                    <p><strong>实验目的：</strong>掌握配制一定物质的量浓度溶液的方法</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>计算所需固体质量或液体体积</li>
                        <li>用天平称量（或量筒量取）</li>
                        <li>在烧杯中溶解（或稀释），用玻璃棒搅拌</li>
                        <li>冷却至室温后转移至容量瓶</li>
                        <li>用蒸馏水洗涤烧杯和玻璃棒2-3次，洗涤液转入容量瓶</li>
                        <li>加水至刻度线1-2cm处，改用胶头滴管定容</li>
                        <li>颠倒摇匀</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>容量瓶不能用于溶解或存放溶液</li>
                        <li>转移时玻璃棒下端靠在刻度线以下</li>
                        <li>定容时视线与凹液面最低点平齐</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验三：氯气的实验室制法</h4>
                    <p><strong>反应原理：</strong>MnO₂+4HCl(浓)→MnCl₂+Cl₂↑+2H₂O</p>
                    <p><strong>装置：</strong>固液加热型发生装置</p>
                    <p><strong>净化：</strong>通过饱和食盐水除去HCl，通过浓H₂SO₄干燥</p>
                    <p><strong>收集：</strong>向上排空气法或排饱和食盐水法</p>
                    <p><strong>尾气处理：</strong>NaOH溶液吸收</p>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>必须用浓盐酸，稀盐酸不反应</li>
                        <li>加热时温度不宜过高</li>
                        <li>氯气有毒，必须在通风橱中进行</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验四：乙酸乙酯的制备</h4>
                    <p><strong>反应原理：</strong>CH₃COOH+CH₃CH₂OH⇌CH₃COOCH₂CH₃+H₂O（可逆反应）</p>
                    <p><strong>条件：</strong>浓H₂SO₄催化、加热</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>在试管中加入乙醇2mL</li>
                        <li>边振荡边缓慢加入浓硫酸2mL</li>
                        <li>再加入冰醋酸2mL</li>
                        <li>加入碎瓷片防止暴沸</li>
                        <li>加热，将产生的蒸气导出至饱和Na₂CO₃溶液液面上</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>浓硫酸先加乙醇再加酸（密度大倒入密度小）</li>
                        <li>饱和Na₂CO₃溶液作用：中和乙酸、溶解乙醇、降低酯溶解度</li>
                        <li>导管不能插入液面以下（防倒吸）</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>附录：化学实验仪器分类与用途</h4>
                    <p><strong>一、反应与加热类容器（耐热玻璃）</strong></p>
                    <div class="key-point"><strong>烧杯(Beaker)：</strong>圆柱形有倾倒嘴，配制溶液/溶解/加热液体，加热需垫石棉网。规格：50-1000mL</div>
                    <div class="key-point"><strong>锥形瓶(Erlenmeyer Flask)：</strong>平底圆锥形窄口，滴定反应/振荡反应（液体不易溅出），加热需垫石棉网</div>
                    <div class="key-point"><strong>圆底烧瓶(Round-bottom Flask)：</strong>球状圆底长颈，加热/蒸馏/回流反应，受热均匀，需垫石棉网</div>
                    <div class="key-point"><strong>平底烧瓶(Flat-bottom Flask)：</strong>球状平底，储存液体/温和加热（不适合强烈加热），可直立放置</div>
                    <div class="key-point"><strong>三口烧瓶(Three-neck Flask)：</strong>三个颈，复杂合成实验，可同时安装冷凝管/温度计/搅拌器</div>
                    <p><strong>二、量器类（普通玻璃，不可加热）</strong></p>
                    <div class="key-point"><strong>容量瓶(Volumetric Flask)：</strong>细长颈梨形平底有磨口塞，精确配制物质的量浓度溶液，瓶颈标线表示特定温度下准确体积，不可加热或长期储存</div>
                    <div class="key-point"><strong>量筒(Graduated Cylinder)：</strong>圆柱形有倾倒嘴，粗略量取液体体积，精度低于滴定管，不可加热或作反应容器</div>
                    <div class="key-point"><strong>滴定管(Burette)：</strong>精确量取液体，酸式(玻璃活塞)/碱式(橡胶管+玻璃珠)，读数精确到0.01mL</div>
                    <p><strong>三、分离与萃取类</strong></p>
                    <div class="key-point"><strong>分液漏斗(Separatory Funnel)：</strong>梨形/球形有活塞和磨口塞，分离互不相溶液体/萃取操作，通过活塞控制下层液体流出</div>
                    <div class="key-point"><strong>滴液漏斗(Dropping Funnel)：</strong>颈部较长末端细，向反应体系缓慢滴加液体试剂，可控制滴加速度</div>
                    <p><strong>四、储存与收集类</strong></p>
                    <div class="key-point"><strong>广口瓶(Wide-mouth Bottle)：</strong>口径大瓶口磨砂，储存固体试剂，不可加热</div>
                    <div class="key-point"><strong>细口瓶(Narrow-mouth Bottle)：</strong>口径小瓶口磨砂，储存液体试剂。棕色瓶储存见光易分解物质（如AgNO₃）</div>
                    <div class="key-point"><strong>集气瓶(Gas Collection Bottle)：</strong>广口瓶口平面磨砂配毛玻璃片，收集气体/进行气体反应</div>
                    <p><strong>五、特殊用途</strong></p>
                    <div class="key-point"><strong>干燥器(Desiccator)：</strong>带磨口盖厚壁玻璃缸内有瓷板，存放已干燥样品防吸湿，底部放干燥剂（硅胶/CaCl₂）</div>
                    <div class="key-point"><strong>称量瓶(Weighing Bottle)：</strong>矮圆柱形配磨口盖，精密称量固体样品，防止吸潮或污染</div>
                    <div class="common-mistake">常见错误：容量瓶用于溶解或储存；量筒用作反应容器；加热规范混淆（烧杯/烧瓶需垫石棉网，容量瓶/量筒严禁加热）</div>
                </div>
            </div>
        `,
        tests: `
            <div class="tests-section">
                <h3>📋 模拟测试</h3>

                <div class="knowledge-card">
                    <h4>基础巩固</h4>
                    <p>1. 下列物质中，含有分子数最多的是（原子质量：H=1，C=12，O=16）</p>
                    <p style="color: var(--gray);">A. 18g H₂O</p>
                    <p style="color: var(--gray);">B. 32g O₂</p>
                    <p style="color: var(--gray);">C. 44g CO₂</p>
                    <p style="color: var(--gray);">D. 64g SO₂</p>
                </div>

                <div class="knowledge-card">
                    <h4>能力提升</h4>
                    <p>2. 用石墨电极电解CuSO₄溶液，阳极产物是（ ）</p>
                    <p style="color: var(--gray);">A. Cu</p>
                    <p style="color: var(--gray);">B. O₂</p>
                    <p style="color: var(--gray);">C. H₂</p>
                    <p style="color: var(--gray);">D. SO₂</p>
                </div>
            </div>
        `
    },
    biology: {
        knowledge: `
            <div class="knowledge-section">
                <h3>📚 生物知识点总结</h3>

                <div class="knowledge-card">
                    <h4>第一章 细胞的分子组成</h4>
                    <div class="key-point">蛋白质：基本单位氨基酸（20种），脱水缩合形成肽键-CO-NH-</div>
                    <div class="key-point">蛋白质多样性原因：氨基酸种类、数目、排列顺序、空间结构</div>
                    <div class="key-point">核酸：DNA（脱氧核苷酸）、RNA（核糖核苷酸），携带遗传信息</div>
                    <div class="key-point">糖类：单糖（葡萄糖）、二糖（蔗糖/麦芽糖/乳糖）、多糖（淀粉/糖原/纤维素）</div>
                    <div class="key-point">脂质：脂肪（储能）、磷脂（构成膜）、固醇（调节）</div>
                    <div class="key-point">水和无机盐：自由水与结合水、无机盐以离子形式存在</div>
                    <div class="common-mistake">常见错误：混淆肽键数与脱水数（n个氨基酸形成m条肽链，肽键数=脱水数=n-m）</div>
                </div>

                <div class="knowledge-card">
                    <h4>第二章 细胞的基本结构</h4>
                    <div class="key-point">细胞膜：流动镶嵌模型，功能特性选择透过性</div>
                    <div class="key-point">细胞器：线粒体（有氧呼吸主要场所）、叶绿体（光合作用场所）</div>
                    <div class="key-point">内质网：粗面（蛋白质加工）、滑面（脂质合成）</div>
                    <div class="key-point">高尔基体：蛋白质进一步加工、分类、包装、运输</div>
                    <div class="key-point">核糖体：蛋白质合成场所（无膜结构）</div>
                    <div class="key-point">细胞核：遗传信息库，DNA存储和复制，控制代谢</div>
                    <div class="key-point">生物膜系统：细胞膜、核膜、细胞器膜的总称</div>
                    <div class="common-mistake">常见错误：混淆不同细胞器的功能；核糖体和中心体无膜</div>
                </div>

                <div class="knowledge-card">
                    <h4>第三章 细胞代谢</h4>
                    <div class="key-point">酶：高效性、专一性、作用条件温和，本质大多数为蛋白质</div>
                    <div class="key-point">酶促反应动力学：底物浓度、酶浓度、温度、pH对酶活性的影响</div>
                    <div class="key-point">ATP：细胞的能量通货，A-P~P~P，远离A的高能磷酸键易断裂</div>
                    <div class="key-point">细胞呼吸：有氧呼吸三个阶段（糖酵解→丙酮酸氧化→电子传递链）</div>
                    <div class="key-point">有氧呼吸总反应式：C₆H₁₂O₆+6O₂+6H₂O→6CO₂+12H₂O+能量</div>
                    <div class="key-point">无氧呼吸：产生酒精+CO₂（植物/酵母菌）或乳酸（动物/乳酸菌）</div>
                    <div class="key-point">光合作用：光反应（类囊体薄膜）→暗反应（叶绿体基质）</div>
                    <div class="key-point">光反应：水的光解→[H]+O₂；ATP合成</div>
                    <div class="key-point">暗反应：CO₂固定→C₃；C₃还原→(CH₂O)+C₅</div>
                    <div class="common-mistake">常见错误：认为光合作用O₂来自CO₂（实际来自H₂O）；混淆光反应与暗反应场所</div>
                </div>

                <div class="knowledge-card">
                    <h4>第四章 细胞的生命历程</h4>
                    <div class="key-point">有丝分裂：前期（膜仁消失现两体）→中期（形定数晰赤道板）→后期（点裂数增均两极）→末期（两消两现重开始）</div>
                    <div class="key-point">减数分裂：减数第一次分裂（同源染色体分离）→减数第二次分裂（着丝点分裂）</div>
                    <div class="key-point">减数分裂与有丝分裂区别：是否有同源染色体分离和联会</div>
                    <div class="key-point">细胞分化：基因的选择性表达</div>
                    <div class="key-point">细胞凋亡：基因控制的程序性死亡（正常生理过程）</div>
                    <div class="key-point">细胞癌变：原癌基因和抑癌基因突变</div>
                    <div class="common-mistake">常见错误：混淆细胞凋亡与细胞坏死；减数分裂中DNA复制次数与分裂次数</div>
                </div>

                <div class="knowledge-card">
                    <h4>第五章 孟德尔遗传定律</h4>
                    <div class="key-point">分离定律：杂合子中，等位基因分离，形成配子时比例1:1</div>
                    <div class="key-point">自由组合定律：非同源染色体上的非等位基因自由组合</div>
                    <div class="key-point">遗传图谱分析：基因型推断、概率计算</div>
                    <div class="key-point">伴性遗传：X染色体显性/隐性遗传、Y染色体遗传</div>
                    <div class="key-point">常见遗传病：色盲（X隐）、白化病（常隐）、多指（常显）</div>
                    <div class="common-mistake">常见错误：分离定律与自由组合定律适用范围混淆；伴性遗传与常染色体遗传判断错误</div>
                </div>

                <div class="knowledge-card">
                    <h4>第六章 遗传的分子基础</h4>
                    <div class="key-point">DNA是主要遗传物质：肺炎双球菌转化实验、噬菌体侵染细菌实验</div>
                    <div class="key-point">DNA复制：半保留复制，边解旋边复制，需要模板、原料、酶、能量</div>
                    <div class="key-point">转录：以DNA一条链为模板合成mRNA，场所主要在细胞核</div>
                    <div class="key-point">翻译：以mRNA为模板，tRNA为运载工具，在核糖体上合成蛋白质</div>
                    <div class="key-point">中心法则：DNA→DNA（复制）、DNA→RNA（转录）、RNA→蛋白质（翻译）</div>
                    <div class="key-point">基因表达调控：转录水平调控、翻译水平调控</div>
                    <div class="common-mistake">常见错误：混淆复制、转录、翻译的原料和场所；密码子在mRNA上，反密码子在tRNA上</div>
                </div>

                <div class="knowledge-card">
                    <h4>第七章 变异与进化</h4>
                    <div class="key-point">基因突变：碱基对的增添、缺失、替换（分子水平变异）</div>
                    <div class="key-point">基因重组：自由组合型、交叉互换型</div>
                    <div class="key-point">染色体变异：结构变异（缺失/重复/倒位/易位）、数目变异</div>
                    <div class="key-point">多倍体：秋水仙素处理抑制纺锤体形成</div>
                    <div class="key-point">现代生物进化理论：种群是进化基本单位，突变和基因重组提供原材料</div>
                    <div class="key-point">自然选择：定向选择作用于表型，改变基因频率</div>
                    <div class="key-point">物种形成：突变→选择→隔离（地理隔离→生殖隔离）</div>
                    <div class="common-mistake">常见错误：基因突变不一定改变氨基酸种类（简并性）；生物进化不一定形成新物种</div>
                </div>

                <div class="knowledge-card">
                    <h4>第八章 生命活动的调节</h4>
                    <div class="key-point">神经调节：反射弧（感受器→传入神经→神经中枢→传出神经→效应器）</div>
                    <div class="key-point">兴奋传导：神经纤维上双向传导，突触间单向传递</div>
                    <div class="key-point">神经递质：突触前膜释放→突触间隙→突触后膜受体</div>
                    <div class="key-point">体液调节：激素通过体液运输作用于靶器官/靶细胞</div>
                    <div class="key-point">血糖调节：胰岛素（降血糖）、胰高血糖素（升血糖）</div>
                    <div class="key-point">甲状腺激素分级调节：下丘脑→TRH→垂体→TSH→甲状腺→甲状腺激素（负反馈）</div>
                    <div class="key-point">免疫调节：非特异性免疫（第一、二道防线）、特异性免疫（第三道防线）</div>
                    <div class="key-point">体液免疫：B细胞→浆细胞→分泌抗体</div>
                    <div class="key-point">细胞免疫：T细胞→效应T细胞→与靶细胞接触</div>
                    <div class="common-mistake">常见错误：突触传递方向判断错误；激素调节中正反馈与负反馈混淆</div>
                </div>

                <div class="knowledge-card">
                    <h4>第九章 生态学</h4>
                    <div class="key-point">种群特征：种群密度、出生率/死亡率、年龄组成、性别比例</div>
                    <div class="key-point">种群数量变化：J型增长（Nt=N₀λᵗ）、S型增长（K值/环境容纳量）</div>
                    <div class="key-point">群落：垂直结构（分层现象）、水平结构（镶嵌分布）</div>
                    <div class="key-point">群落演替：初生演替（从无到有）、次生演替（原有土壤条件保留）</div>
                    <div class="key-point">生态系统的结构：非生物的物质和能量、生产者、消费者、分解者</div>
                    <div class="key-point">能量流动：单向流动、逐级递减（传递效率10%-20%）</div>
                    <div class="key-point">物质循环：碳循环（CO₂形式）、氮循环</div>
                    <div class="key-point">信息传递：物理信息、化学信息、行为信息</div>
                    <div class="key-point">生态系统的稳定性：抵抗力稳定性、恢复力稳定性</div>
                    <div class="common-mistake">常见错误：能量传递效率不是营养级之间的比值；K值不是种群最大数量</div>
                </div>

                <div class="knowledge-card">
                    <h4>第十章 生物技术与工程</h4>
                    <div class="key-point">基因工程：限制酶切割→DNA连接酶连接→导入受体细胞→筛选鉴定</div>
                    <div class="key-point">PCR技术：变性(95°C)→退火(55°C)→延伸(72°C)，指数扩增DNA</div>
                    <div class="key-point">琼脂糖凝胶电泳：根据DNA片段大小分离，小片段迁移快</div>
                    <div class="key-point">植物细胞工程：植物组织培养（全能性）、植物体细胞杂交</div>
                    <div class="key-point">动物细胞工程：动物细胞培养、动物细胞融合、单克隆抗体</div>
                    <div class="key-point">胚胎工程：体外受精、胚胎移植、胚胎分割</div>
                    <div class="common-mistake">常见错误：PCR需要引物不需要解旋酶；限制酶识别特定核苷酸序列</div>
                </div>
            </div>
        `,
        examples: `
            <div class="examples-section">
                <h3>📝 典型例题</h3>

                <div class="knowledge-card">
                    <h4>例题1：蛋白质计算</h4>
                    <p>某蛋白质由2条肽链组成，共有109个氨基酸，则该蛋白质分子中至少含有游离的氨基和羧基数分别为多少？</p>
                    <div class="key-point">解答：每条肽链至少含1个游离氨基和1个游离羧基（位于两端），2条肽链至少含2个游离氨基和2个游离羧基</div>
                    <div class="key-point">脱水数=肽键数=109-2=107</div>
                    <div class="common-mistake">常见错误：认为只有1个游离氨基和1个游离羧基；忘记侧链R基上的氨基/羧基</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题2：孟德尔遗传</h4>
                    <p>孟德尔分离定律的实质是？</p>
                    <div class="key-point">答案：配子形成时，等位基因随同源染色体的分开而分离</div>
                    <div class="common-mistake">分离定律发生在减数分裂Ⅰ后期，等位基因随着同源染色体的分开而分离</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题3：自由组合定律概率计算</h4>
                    <p>基因型为AaBb的个体自交（两对基因独立遗传），子代中基因型为Aabb的个体占多少？</p>
                    <div class="key-point">解答：Aa×Aa→AA:Aa:aa=1:2:1；Bb×Bb→BB:Bb:bb=1:2:1</div>
                    <div class="key-point">Aabb=1/2×1/4=1/8</div>
                    <div class="common-mistake">常见错误：直接用1/4×1/4=1/16（混淆基因型比例与配子比例）</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题4：伴性遗传</h4>
                    <p>一对色觉正常的夫妇，女方父亲患色盲，则他们所生儿子患色盲的概率为？</p>
                    <div class="key-point">解答：色盲为X染色体隐性遗传病。女方父亲色盲(XᵇY)→女方XᴮXᵇ(携带者)</div>
                    <div class="key-point">男方XᴮY正常，儿子X染色体来自母亲</div>
                    <div class="key-point">儿子色盲概率=母亲传递Xᵇ的概率=1/2=50%</div>
                    <div class="common-mistake">常见错误：忘记伴性遗传中儿子只继承母亲的X染色体</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题5：光合呼吸综合</h4>
                    <p>将一植物置于密闭容器中，用红外测量仪测得CO₂吸收量随光照强度变化如下：黑暗时CO₂释放量为4mg/h，光照强度为2klx时CO₂吸收量为0，光照强度为8klx时CO₂吸收量为8mg/h。求光补偿点和光饱和点。</p>
                    <div class="key-point">解答：光补偿点=2klx（净光合=0，即光合=呼吸）</div>
                    <div class="key-point">黑暗时呼吸速率=4mg/h，光补偿点时光合=呼吸=4mg/h</div>
                    <div class="key-point">8klx时净光合=8mg/h，真正光合=8+4=12mg/h</div>
                    <div class="common-mistake">常见错误：混淆净光合速率与真正光合速率；光补偿点不是光照强度为0</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题6：DNA复制计算</h4>
                    <p>一个DNA分子含有100个碱基对，其中含腺嘌呤40个。该DNA连续复制3次，需要游离的胞嘧啶脱氧核苷酸多少个？</p>
                    <div class="key-point">解答：A=40，则T=40，G=C=(200-80)/2=60</div>
                    <div class="key-point">复制3次产生2³=8个DNA分子，新增7个</div>
                    <div class="key-point">需要胞嘧啶=7×60=420个</div>
                    <div class="common-mistake">常见错误：用8×60=480（未减去原DNA中的60个）</div>
                </div>

                <div class="knowledge-card">
                    <h4>例题7：生态系统能量流动</h4>
                    <p>某生态系统中，生产者固定的太阳能为10000kJ，按10%-20%传递效率，第三营养级最多获得多少能量？</p>
                    <div class="key-point">解答：第一营养级→第二营养级：10000×20%=2000kJ（最大传递）</div>
                    <div class="key-point">第二营养级→第三营养级：2000×20%=400kJ</div>
                    <div class="key-point">第三营养级最多获得400kJ能量</div>
                    <div class="common-mistake">常见错误：求"最多"应用最大传递效率20%，不是10%</div>
                </div>
            </div>
        `,
        experiments: `
            <div class="experiments-section">
                <h3>🔬 实验指导</h3>

                <div class="knowledge-card">
                    <h4>实验一：探究酶的专一性</h4>
                    <p><strong>实验目的：</strong>验证酶具有催化作用和专一性</p>
                    <p><strong>实验原理：</strong>利用淀粉酶催化淀粉水解，碘液检测淀粉是否存在</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>制备淀粉溶液和蔗糖溶液</li>
                        <li>设置试管，编号</li>
                        <li>分别加入淀粉酶溶液</li>
                        <li>保温一定时间</li>
                        <li>加入斐林试剂或碘液检测</li>
                        <li>观察颜色变化，记录结果</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>酶需要适宜的温度和pH</li>
                        <li>检测前应煮沸，破坏酶活性</li>
                        <li>斐林试剂需要现配现用</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验二：观察根尖分生组织细胞的有丝分裂</h4>
                    <p><strong>实验目的：</strong>观察细胞有丝分裂各个时期的特征</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>培养洋葱根尖（提前3-4天）</li>
                        <li>固定：上午10-14点取材，放入卡诺固定液</li>
                        <li>解离：放入15%盐酸和95%酒精混合液(1:1)，3-5min</li>
                        <li>漂洗：用清水漂洗10min</li>
                        <li>染色：用甲紫或醋酸洋红液染色3-5min</li>
                        <li>制片：弄碎根尖，盖上盖玻片，再盖一片载玻片，用拇指轻压</li>
                        <li>观察：先低倍镜找分生区，再高倍镜观察</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>解离后细胞已死亡，不能观察动态过程</li>
                        <li>分生区细胞特点：正方形、排列紧密</li>
                        <li>大多数细胞处于间期（间期时间最长）</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验三：探究植物细胞的吸水与失水</h4>
                    <p><strong>实验目的：</strong>验证植物细胞的渗透吸水和失水</p>
                    <p><strong>实验原理：</strong>成熟植物细胞是一个渗透系统（原生质层相当于半透膜）</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>制作洋葱鳞片叶外表皮临时装片</li>
                        <li>低倍镜观察正常细胞（液泡大、紫色深）</li>
                        <li>在盖玻片一侧滴加0.3g/mL蔗糖溶液，另一侧用吸水纸吸引</li>
                        <li>重复几次，使细胞完全浸润在蔗糖溶液中</li>
                        <li>观察质壁分离现象</li>
                        <li>用清水替换蔗糖溶液，观察质壁分离复原</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>选择紫色洋葱便于观察液泡变化</li>
                        <li>蔗糖溶液浓度不宜过高（细胞会死亡）</li>
                        <li>死细胞不能发生质壁分离复原</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验四：叶绿体色素的提取和分离</h4>
                    <p><strong>实验目的：</strong>提取和分离叶绿体中的色素</p>
                    <p><strong>实验原理：</strong>色素溶于有机溶剂；不同色素在层析液中溶解度不同，扩散速度不同</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>提取：研磨叶片（加SiO₂助研磨、CaCO₃防色素破坏、无水乙醇溶解色素）</li>
                        <li>过滤：用尼龙布过滤，收集滤液</li>
                        <li>制备滤纸条：剪去两角，画铅笔细线</li>
                        <li>画滤液细线：用毛细吸管画线，干燥后重复2-3次</li>
                        <li>层析：将滤纸条插入层析液中（细线不能没入层析液）</li>
                        <li>观察：从上到下依次为胡萝卜素(橙黄)、叶黄素(黄)、叶绿素a(蓝绿)、叶绿素b(黄绿)</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>研磨要迅速充分</li>
                        <li>滤液细线要细、直、浓</li>
                        <li>层析液不能没及滤液细线</li>
                        <li>叶绿素a含量最多，叶绿素b溶解度最小</li>
                    </ul>
                </div>

                <div class="knowledge-card">
                    <h4>实验五：DNA的粗提取与鉴定</h4>
                    <p><strong>实验原理：</strong>DNA在不同浓度NaCl溶液中溶解度不同；DNA遇二苯胺在沸水浴条件下变蓝</p>
                    <p><strong>实验步骤：</strong></p>
                    <ol style="margin-left: 20px;">
                        <li>破碎细胞：研磨鸡血细胞液，加入蒸馏水</li>
                        <li>过滤：用纱布过滤，收集含DNA的滤液</li>
                        <li>溶解DNA：加入2mol/L NaCl溶液，搅拌溶解</li>
                        <li>析出DNA：用0.14mol/L NaCl溶液反复析出和溶解DNA</li>
                        <li>去除杂质：加入嫩肉粉（蛋白酶）或蒸馏水</li>
                        <li>鉴定：加入二苯胺试剂，沸水浴加热5min，呈蓝色</li>
                    </ol>
                    <p><strong>注意事项：</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>DNA在0.14mol/L NaCl中溶解度最低</li>
                        <li>不能用哺乳动物成熟红细胞（无细胞核）</li>
                        <li>玻璃棒搅拌要轻柔，防止DNA断裂</li>
                    </ul>
                </div>
            </div>
        `,
        tests: `
            <div class="tests-section">
                <h3>📋 模拟测试</h3>

                <div class="knowledge-card">
                    <h4>基础巩固</h4>
                    <p>1. 下列细胞器中，不含有磷脂的是（ ）</p>
                    <p style="color: var(--gray);">A. 线粒体</p>
                    <p style="color: var(--gray);">B. 核糖体</p>
                    <p style="color: var(--gray);">C. 内质网</p>
                    <p style="color: var(--gray);">D. 高尔基体</p>
                    <div class="key-point">答案：B（核糖体无膜结构，不含磷脂）</div>
                </div>

                <div class="knowledge-card">
                    <h4>基础巩固</h4>
                    <p>2. 下列关于酶的叙述，正确的是（ ）</p>
                    <p style="color: var(--gray);">A. 酶只能在细胞内起催化作用</p>
                    <p style="color: var(--gray);">B. 酶的催化效率比无机催化剂高</p>
                    <p style="color: var(--gray);">C. 酶的化学本质都是蛋白质</p>
                    <p style="color: var(--gray);">D. 高温能使酶失活，低温也能使酶失活</p>
                    <div class="key-point">答案：B（酶可在细胞外催化；少数酶是RNA；低温抑制酶活性但不失活）</div>
                </div>

                <div class="knowledge-card">
                    <h4>能力提升</h4>
                    <p>3. 基因型为AaBb的个体自交（两对基因独立遗传），子代中基因型为Aabb的个体占多少？</p>
                    <div class="key-point">答案：1/8</div>
                    <div class="common-mistake">Aa×Aa→AA:Aa:aa=1:2:1；Bb×Bb→BB:Bb:bb=1:2:1，所以Aabb=1/2×1/4=1/8</div>
                </div>

                <div class="knowledge-card">
                    <h4>能力提升</h4>
                    <p>4. 将植物置于密闭容器中，在不同光照强度下测定CO₂吸收量。下列叙述正确的是（ ）</p>
                    <p style="color: var(--gray);">A. 黑暗条件下，植物既不进行光合作用也不进行呼吸作用</p>
                    <p style="color: var(--gray);">B. 光补偿点时，光合速率等于呼吸速率</p>
                    <p style="color: var(--gray);">C. 光照强度越大，光合速率越大</p>
                    <p style="color: var(--gray);">D. 光饱和点后，限制光合速率的因素只有CO₂浓度</p>
                    <div class="key-point">答案：B（黑暗时只进行呼吸作用；光照强度增大到一定程度光合速率不再增大；光饱和点后限制因素还有温度等）</div>
                </div>

                <div class="knowledge-card">
                    <h4>高考冲刺</h4>
                    <p>5. 某二倍体动物（2n=4）的基因型为AaBb，若图示细胞为该动物的一个初级精母细胞，请回答：</p>
                    <p>（1）该细胞处于减数第一次分裂______期</p>
                    <p>（2）该细胞分裂后产生的子细胞基因型为______</p>
                    <p>（3）若该动物与基因型为Aabb的个体交配，后代中基因型为AaBb的概率为______</p>
                    <div class="key-point">答案：（1）后期（同源染色体分离）（2）AB和ab或Ab和aB（3）1/2×1/2=1/4</div>
                    <div class="common-mistake">注意：初级精母细胞产生2个次级精母细胞，最终产生4个精细胞</div>
                </div>
            </div>
        `
    }
};

function navigateTo(section) {
    document.querySelectorAll('.section').forEach(s => {
        s.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const targetSection = document.getElementById(section + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
        if (section === 'exam') {
            const examContainer = document.getElementById('exam-content');
            if (examContainer && examPracticeSystem) {
                examPracticeSystem.renderExamDashboard(examContainer);
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const navBtn = document.querySelector('[data-subject="' + section + '"]');
    if (navBtn) {
        navBtn.classList.add('active');
    }

    currentSubject = section;
}

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

function loadPhysicsTool(tool) {
    if (tool === 'calculator') {
        navigateTo('physics-calculator');
        physicsFormulaCalculator.renderCalculator();
    } else if (tool === 'projectile') {
        navigateTo('projectile-sim');
        projectileSimulator.renderSimulator();
    }
}

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

function loadPreset(preset) {
    const presets = {
        'h2o': 'H2 + O2 -> H2O',
        'fe+o2': 'Fe + O2 -> Fe2O3',
        'naoh+hcl': 'NaOH + HCl -> NaCl + H2O',
        'combustion': 'C6H12O6 + O2 -> CO2 + H2O'
    };
    document.getElementById('equation-input').value = presets[preset] || '';
}

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

function toggleQuizType(btn) {
    btn.classList.toggle('selected');
    const type = btn.dataset.type;
    if (selectedQuizTypes.includes(type)) {
        selectedQuizTypes = selectedQuizTypes.filter(t => t !== type);
    } else {
        selectedQuizTypes.push(type);
    }
}

function generateNewQuiz() {
    if (selectedQuizTypes.length === 0) {
        alert('请至少选择一种题型！');
        return;
    }

    const count = parseInt(document.getElementById('question-count').value);
    const questions = chemistryQuizGenerator.generateQuiz(selectedQuizTypes, count);
    document.getElementById('quiz-container').innerHTML = chemistryQuizGenerator.renderQuiz(questions);
}

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

function updateGeneticsDisplay() {
    const app = document.getElementById('biology-genetics-app');
    if (app) {
        const newContent = biologyGeneticsSimulator.renderSimulation();
        app.innerHTML = newContent;
        attachGeneticsListeners();
    }
}

function loadModuleContent(subject, module) {
    const contentId = `${subject}-content`;
    const contentEl = document.getElementById(contentId);

    if (contentEl && subjectContent[subject]) {
        const content = subjectContent[subject][module] || '<p>该模块内容正在开发中...</p>';
        contentEl.innerHTML = content;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const subject = this.dataset.subject;
            navigateTo(subject);
        });
    });

    document.querySelectorAll('.module-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const module = this.dataset.module;
            const parent = this.closest('.section');
            if (!parent) return;
            parent.querySelectorAll('.module-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const subject = parent.id.replace('-section', '');
            if (['physics', 'chemistry', 'biology'].includes(subject)) {
                loadModuleContent(subject, module);
            }
        });
    });

    const firstPhysicsTab = document.querySelector('#physics-section .module-tab');
    if (firstPhysicsTab) {
        firstPhysicsTab.click();
    }
});

window.navigateTo = navigateTo;
window.loadChemistryTool = loadChemistryTool;
window.loadBiologyTool = loadBiologyTool;
window.loadPhysicsTool = loadPhysicsTool;
window.balanceEquation = balanceEquation;
window.loadPreset = loadPreset;
window.toggleQuizType = toggleQuizType;
window.generateNewQuiz = generateNewQuiz;
window.checkAnswer = checkAnswer;
window.loadModuleContent = loadModuleContent;
window.updateGeneticsDisplay = updateGeneticsDisplay;
window.physicsFormulaCalculator = physicsFormulaCalculator;
window.projectileSimulator = projectileSimulator;
window.chemistrySafetySystem = chemistrySafetySystem;
window.ecosystemSimulator = ecosystemSimulator;
window.electrochemistryViewer = electrochemistryViewer;
window.chemicalProcessFlow = chemicalProcessFlow;
window.equationNotebook = equationNotebook;
window.organicConverter = organicConverter;
window.biologyMindMap = biologyMindMap;
window.geneticsPedigreeTrainer = geneticsPedigreeTrainer;
window.photosynthesisTrainer = photosynthesisTrainer;
window.experimentDesigner = experimentDesigner;
window.chemistryProcessAnalyzer = chemistryProcessAnalyzer;
window.subjectContent = subjectContent;

// ==================== 高考真题练习与备考评估系统 (2018-2024) ====================
const examPracticeSystem = {
    examData: null,
    currentExam: null,
    userAnswers: {},
    results: [],
    stats: {
        totalAnswered: 0,
        correctCount: 0,
        subjectStats: { physics: {total: 0, correct: 0}, chemistry: {total: 0, correct: 0}, biology: {total: 0, correct: 0} },
        categoryStats: {},
        yearStats: {},
        difficultyStats: { easy: {total: 0, correct: 0}, medium: {total: 0, correct: 0}, hard: {total: 0, correct: 0} },
        history: []
    },

    async init() {
        try {
            const response = await fetch('data/exam-bank.json');
            this.examData = await response.json();
            this.loadStats();
            console.log('真题库加载成功:', this.examData.meta.totalQuestions + '道题目');
        } catch (e) {
            console.error('加载真题库失败，使用内置数据', e);
            this.examData = this.getFallbackData();
        }
    },

    getFallbackData() {
        return {
            meta: { version: "1.0", totalQuestions: 20, subjects: ["physics", "chemistry", "biology"], years: [2022, 2023, 2024] },
            physics: {
                name: "物理", total: 7,
                exams: [
                    { id: "PHY_F1", year: 2022, type: "选择题", difficulty: "medium", points: 6, category: "力学",
                      question: "一质量为2kg的物体在水平恒力F=10N作用下从静止开始运动，动摩擦因数μ=0.2，g=10m/s²。求加速度？",
                      options: ["a=3m/s²", "a=4m/s²", "a=5m/s²", "a=2m/s²"], answer: "A",
                      analysis: "由牛顿第二定律：F-μmg=ma → 10-0.2×2×10=2a → a=3m/s²", knowledgePoints: ["牛顿第二定律"] },
                    { id: "PHY_F2", year: 2023, type: "计算题", difficulty: "hard", points: 14, category: "电磁学",
                      question: "矩形线圈面积S=0.1m²，匝数n=100，B=0.5T，转速1200r/min。求感应电动势最大值。",
                      options: ["Eₘ=200πV", "Eₘ=400πV", "Eₘ=100πV", "Eₘ=600πV"], answer: "A",
                      analysis: "ω=2πn/60=40π rad/s, Eₘ=nBSω=100×0.5×0.1×40π=200π V", knowledgePoints: ["交变电流"] },
                    { id: "PHY_F3", year: 2024, type: "选择题", difficulty: "easy", points: 6, category: "光学",
                      question: "关于光的性质，下列说法正确的是：",
                      options: ["光在同种均匀介质中一定沿直线传播", "光从光疏介质射向光密介质时折射角大于入射角", "双缝干涉条纹间距与波长成正比", "光电效应说明光具有波动性"],
                      answer: "C", analysis: "Δx=Lλ/d，条纹间距与波长成正比", knowledgePoints: ["光学"] },
                    { id: "PHY_F4", year: 2022, type: "选择题", difficulty: "medium", points: 6, category: "电学",
                      question: "电源电动势E=12V，内阻r=1Ω，R₁=3Ω，R₂=6Ω，R₃=2Ω。求通过R₁的电流？",
                      options: ["I=1.6A", "I=2A", "I=2.4A", "I=1.2A"], answer: "A",
                      analysis: "R外=R₃+R₁R₂/(R₁+R₂)=4Ω, I总=E/(R外+r)=12/5=2.4A, I₁=I总×R₂/(R₁+R₂)=1.6A", knowledgePoints: ["闭合电路欧姆定律"] },
                    { id: "PHY_F5", year: 2023, type: "实验题", difficulty: "medium", points: 10, category: "实验",
                      question: "验证机械能守恒定律实验中，重锤减少的重力势能总是略大于增加的动能，原因是？",
                      options: ["空气阻力", "测量误差", "系统误差", "以上都是"], answer: "D",
                      analysis: "存在空气阻力和摩擦阻力，同时有测量误差和系统误差", knowledgePoints: ["实验误差分析"] },
                    { id: "PHY_F6", year: 2024, type: "选择题", difficulty: "hard", points: 8, category: "原子物理",
                      question: "关于氢原子光谱，下列说法正确的是：",
                      options: ["电子从高能级跃迁到低能级时吸收光子", "巴耳末系是电子从n≥2跃迁到n=1产生的", "电子轨道半径越大能量越低", "玻尔理论可以解释所有原子的光谱"],
                      answer: "B", analysis: "巴耳末系对应n→2的跃迁，发射可见光", knowledgePoints: ["氢原子光谱"] },
                    { id: "PHY_F7", year: 2023, type: "计算题", difficulty: "hard", points: 16, category: "综合",
                      question: "带电粒子(q=+1×10⁻⁶C,m=1×10⁻³kg)以v₀=10m/s沿x轴进入E=100V/m的匀强电场(沿y轴正方向)。求到达y=0.05m处的速度？",
                      options: ["v≈10.0005m/s", "v≈10.05m/s", "v≈14.14m/s", "v≈11.18m/s"], answer: "A",
                      analysis: "a=qE/m=0.1m/s², y=½at²→t=1s, v=√(v₀²+(at)²)≈10.0005m/s", knowledgePoints: ["带电粒子运动"] }
                ]
            },
            chemistry: {
                name: "化学", total: 7,
                exams: [
                    { id: "CHEM_F1", year: 2022, type: "工业流程", difficulty: "hard", points: 15, category: "工艺流程",
                      question: "以硫铁矿(FeS₂)制硫酸：(1)焙烧反应方程式 (2)SO₂氧化反应热ΔH___0 (3)为何不用水吸收SO₃ (4)每吨矿产1.5吨98%硫酸，求FeS₂纯度",
                      options: ["(1)4FeS₂+11O₂→2Fe₂O₃+8SO₂ (2)< (3)易形成酸雾 (4)75%", "(1)同左 (2)> (3)溶解度小 (4)72.5%", "(1)FeS₂+O₂→Fe₂O₃+SO₂ (2)< (3)速率慢 (4)78%", "(1)同A (2)< (3)易酸雾 (4)90%"],
                      answer: "D", analysis: "硫酸工业核心反应，需掌握氧化还原分析和化学计算", knowledgePoints: ["硫酸工业"] },
                    { id: "CHEM_F2", year: 2023, type: "原理综合", difficulty: "medium", points: 6, category: "原理综合",
                      question: "室温下，下列叙述正确的是：",
                      options: ["向CH₃COOH中加CH₃COONa，c(H⁺)/c(CH₃COOH)增大", "氨水稀释10倍，pH下降小于1", "AgCl悬浊液中加NaBr，c(Ag⁺)不变", "pH=2盐酸与pH=12氨水等体积混合后pH=7"],
                      answer: "B", analysis: "稀释弱碱促进电离，pH变化小于1个单位", knowledgePoints: ["弱电解质平衡"] },
                    { id: "CHEM_F3", year: 2024, type: "有机化学", difficulty: "hard", points: 10, category: "有机化学",
                      question: "化合物A(C₉H₁₀O₂)：①能发生银镜反应 ②能与NaHCO₃反应放出CO₂ ③核磁共振4组峰(3:2:2:1)。求A的结构简式。",
                      options: ["CH₃CH=C(CH₃)COOH", "Ph-COOH", "CH₂=C(CH₃)CH₂COOH", "CH₃CH₂CH₂COOH"],
                      answer: "A", analysis: "含-COOH和-CHO，不饱和度5，结合氢谱推断结构", knowledgePoints: ["有机推断"] },
                    { id: "CHEM_F4", year: 2022, type: "实验探究", difficulty: "hard", points: 15, category: "实验探究",
                      question: "探究浓度对Na₂S₂O₃+H₂SO₄反应速率的影响：(1)离子方程式 (2)控制变量 (3)浓度大则时间__(长/短) (4)其他测速方法",
                      options: ["(1)S₂O₃²⁻+2H⁺→S↓+SO₂↑+H₂O (2)温度、催化剂 (3)短 (4)单位时间沉淀质量", "(1)同上 (2)温度、体积 (3)长 (4)测定pH", "(1)2S₂O₃²⁻+... (2)光照 (3)短 (4)气体体积", "(1)同A (2)pH、温度 (3)短 (4)生成物物质的量"],
                      answer: "D", analysis: "浓度越大活化分子越多，有效碰撞频率越高，反应越快", knowledgePoints: ["化学反应速率"] },
                    { id: "CHEM_F5", year: 2023, type: "工业流程", difficulty: "hard", points: 14, category: "工艺流程",
                      question: "从含钴废料回收钴：(1)Co₂O₃与盐酸反应离子方程式 (2)加H₂O₂目的 (3)除Fe³⁺pH范围 (4)反萃试剂 (5)煅烧CoC₂O₄方程式",
                      options: ["(1)Co₂O₃+6H⁺+2Cl⁻→2Co²⁺+Cl₂↑+3H₂O (2)氧化Fe²⁺ (3)3~4 (4)稀盐酸 (5)2CoC₂O₄+3O₂→2Co₂O₃+4CO₂", "(1)Co₂O₃+6H⁺→2Co²⁺+3H₂O+3/2O₂ (2)调pH (3)2~3 (4)稀H₂SO₄ (5)CoC₂O₄→CoO+CO+CO₂", "(1)Co₂O₃+2H⁺→2Co²⁺+H₂O+1/2O₂ (3)NaOH (4)同(4)", "(1)同A (2)(3)(4)同A (5)2CoC₂O₄+2O₂→2Co₂O₃+4CO₂"],
                      answer: "A", analysis: "钴冶炼关键步骤：氧化还原、沉淀分离、萃取提纯", knowledgePoints: ["金属冶炼"] },
                    { id: "CHEM_F6", year: 2024, type: "原理综合", difficulty: "medium", points: 6, category: "原理综合",
                      question: "下列关于电解池的说法正确的是：",
                      options: ["阳极一定发生氧化反应", "电解NaCl溶液阴极产生O₂", "精炼铜时粗铜作阴极", "电解Al₂O₃用Cu电极"],
                      answer: "A", analysis: "阳极氧化、阴极还原；电解NaCl阴极出H₂；粗铜为阳极；电解Al用惰性电极", knowledgePoints: ["电解池"] },
                    { id: "CHEM_F7", year: 2022, type: "选择题", difficulty: "easy", points: 6, category: "基础",
                      question: "NA代表阿伏伽德罗常数，下列说法正确的是：",
                      options: ["标准状况下22.4L O₂含NA个氧原子", "1mol NaCl含NA个NaCl单元", "1g H₂O含NA/18个分子", "NA≈6.02×10²³ mol⁻¹"],
                      answer: "B", analysis: "标准状况22.4L O₂含2NA个O原子；1g H₂O含1/18×NA个分子；NA≈6.02×10²³ mol⁻¹", knowledgePoints: ["阿伏伽德罗常数"] }
                ]
            },
            biology: {
                name: "生物", total: 6,
                exams: [
                    { id: "BIO_F1", year: 2022, type: "遗传计算", difficulty: "hard", points: 10, category: "遗传与变异",
                      question: "两对独立基因(A/a,B/b)控制花色。A红色素，B紫色素，两者并存为蓝色。AaBb自交得9:3:3:1。(1)蓝花基因型 (2)红花比例 (3)纯合子比例 (4)蓝花自由交配后代白花概率",
                      options: ["(1)AaBb (2)3/16 (3)1/4 (4)1/36", "(1)AABB (2)3/16 (3)1/4 (4)1/16", "(1)AaBb (2)3/16 (3)1/8 (4)1/9", "(1)AABB (2)9/16 (3)1/4 (4)1/16"],
                      answer: "B", analysis: "9:3:3:1为典型自由组合，亲本必为双杂合子AaBb", knowledgePoints: ["自由组合定律"] },
                    { id: "BIO_F2", year: 2023, type: "曲线分析", difficulty: "medium", points: 8, category: "代谢调节",
                      question: "光合速率曲线分析：(1)a点含义 (2)b点含义 (3)c点限制因素 (4)升温后各点移动方向",
                      options: ["(1)呼吸速率 (2)光补偿点 (3)CO₂浓度 (4)各点均右移", "(1)呼吸速率 (2)光补偿点 (3)CO₂浓度 (4)a点上移b右移c可能左移", "(1)净光合为零点 (2)最大光合点 (3)温度 (4)无法确定"],
                      answer: "B", analysis: "a点呼吸速率，b点光补偿点，c点饱和点受CO₂限制，升温影响酶活性", knowledgePoints: ["光合作用"] },
                    { id: "BIO_F3", year: 2024, type: "系谱图分析", difficulty: "hard", points: 12, category: "遗传与变异",
                      question: "家族甲病(常隐)乙病(伴X隐性)系谱：(1)判断遗传方式 (2)Ⅱ-3基因型(aaXᴮXᵇ?) (3)Ⅲ-1与正常男结婚生患病男孩概率",
                      options: ["(1)甲常隐乙伴X隐 (2)aaXᴮXᵇ (3)1/12", "(1)甲常隐乙伴X显 (2)aaXᵇXᵇ (3)1/8", "(1)伴X隐常隐 (2)XᵃYXᴮXᵇ (3)1/6", "(1)甲常隐乙伴X隐 (2)aaXᴮXᵇ (3)1/12"],
                      answer: "A", analysis: "\"无中生有\"判隐性；男患者母正常排除伴X；概率需考虑配子法", knowledgePoints: ["系谱图判读"] },
                    { id: "BIO_F4", year: 2022, type: "生态分析", difficulty: "medium", points: 8, category: "生态与环境",
                      question: "种群数据：物种A(50→120→200→280→280)，物种B(0→30→60→45→30)。问：(1)增长类型 (2)B达K值? (3)AB关系 (4)保护B的措施",
                      options: ["(1)S型 (2)K值 (3)捕食 (4)控制A数量", "(1)J型 (2)一半 (3)竞争 (4)增加B食物", "(1)J型 (2)K值 (4)寄生 (5)建立保护区", "(1)S型 (2)一半 (3)捕食 (4)控制A数量"],
                      answer: "A", analysis: "增长率递减呈S型；先增后减呈捕食关系；保护被捕食者应控制捕食者", knowledgePoints: ["种群动态"] },
                    { id: "BIO_F5", year: 2023, type: "实验设计", difficulty: "hard", points: 15, category: "实验设计",
                      question: "探究NAA对扦插枝条生根的影响：(1)自变量因变量 (2)补充完整步骤 (3)结果记录表 (4)结论预期",
                      options: ["(1)NAA浓度；生根数量/长度 (2)分组→处理→培养→统计 (3)表格含浓度/生根数/根长 (4)适中促进过高抑制", "(1)NAA有无；生根率 (2)分组→施加→观察 (3)同上 (4)NAA促进生根", "(1)浓度和部位 (3)多指标表格 (4)存在最适浓度"],
                      answer: "A", analysis: "生长素类似物具有两重性，需设置浓度梯度并设对照组", knowledgePoints: ["实验设计原则"] },
                    { id: "BIO_F6", year: 2024, type: "综合分析", difficulty: "medium", points: 10, category: "代谢调节",
                      question: "马拉松运动员生理变化，正确的是：",
                      options: ["初期主要依靠磷酸肌酸供能，随后糖酵解增强", "比赛中血糖持续上升，胰高血糖素分泌增加", "后期无氧呼吸增强导致血液pH明显下降", "赛后应大量补充清水快速恢复体液"],
                      answer: "A", analysis: "供能顺序：ATP-CP→糖酵解→有氧氧化；血糖不会持续上升；缓冲系统维持pH稳定；应补电解质饮料", knowledgePoints: ["运动生理学"] }
                ]
            }
        };
    },

    loadStats() {
        const saved = localStorage.getItem('examPractice_stats');
        if (saved) {
            this.stats = JSON.parse(saved);
        }
    },

    saveStats() {
        localStorage.setItem('examPractice_stats', JSON.stringify(this.stats));
    },

    getAllExams(subject, filters) {
        let exams = [];
        
        if (!subject || subject === 'all') {
            ['physics', 'chemistry', 'biology'].forEach(s => {
                if (this.examData[s] && this.examData[s].exams) {
                    exams = exams.concat(this.examData[s].exams.map(e => ({ ...e, subject: s })));
                }
            });
        } else if (this.examData[subject] && this.examData[subject].exams) {
            exams = this.examData[subject].exams.map(e => ({ ...e, subject }));
        }

        if (filters) {
            if (filters.year && filters.year !== 'all') {
                exams = exams.filter(e => e.year === parseInt(filters.year));
            }
            if (filters.category && filters.category !== 'all') {
                exams = exams.filter(e => e.category === filters.category);
            }
            if (filters.difficulty && filters.difficulty !== 'all') {
                exams = exams.filter(e => e.difficulty === filters.difficulty);
            }
            if (filters.type && filters.type !== 'all') {
                exams = exams.filter(e => e.type === filters.type);
            }
        }

        return exams;
    },

    getRandomExams(count, subject, difficulty) {
        let exams = this.getAllExams(subject);
        if (difficulty && difficulty !== 'all') {
            exams = exams.filter(e => e.difficulty === difficulty);
        }
        
        for (let i = exams.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [exams[i], exams[j]] = [exams[j], exams[i]];
        }
        
        return exams.slice(0, count);
    },

    startExam(examId) {
        const allExams = this.getAllExams('all');
        this.currentExam = allExams.find(e => e.id === examId);
        return this.currentExam;
    },

    submitAnswer(examId, selectedOption) {
        const allExams = this.getAllExams('all');
        const exam = allExams.find(e => e.id === examId);
        if (!exam) return null;

        const isCorrect = selectedOption === exam.answer;
        const result = {
            examId,
            selectedOption,
            correctAnswer: exam.answer,
            isCorrect,
            timestamp: Date.now(),
            subject: exam.subject,
            year: exam.year,
            category: exam.category,
            difficulty: exam.difficulty,
            points: exam.points
        };

        this.results.push(result);
        this.stats.totalAnswered++;
        this.stats.subjectStats[exam.subject].total++;
        this.stats.difficultyStats[exam.difficulty].total++;
        
        if (isCorrect) {
            this.stats.correctCount++;
            this.stats.subjectStats[exam.subject].correct++;
            this.stats.difficultyStats[exam.difficulty].correct++;
        }

        if (!this.stats.yearStats[exam.year]) {
            this.stats.yearStats[exam.year] = { total: 0, correct: 0 };
        }
        this.stats.yearStats[exam.year].total++;
        if (isCorrect) this.stats.yearStats[exam.year].correct++;

        if (!this.stats.categoryStats[exam.category]) {
            this.stats.categoryStats[exam.category] = { total: 0, correct: 0 };
        }
        this.stats.categoryStats[exam.category].total++;
        if (isCorrect) this.stats.categoryStats[exam.category].correct++;

        this.stats.history.push(result);
        if (this.stats.history.length > 500) {
            this.stats.history.shift();
        }

        this.saveStats();
        return result;
    },

    getOverallScore() {
        if (this.stats.totalAnswered === 0) return 0;
        return ((this.stats.correctCount / this.stats.totalAnswered) * 100).toFixed(1);
    },

    getSubjectScore(subject) {
        const s = this.stats.subjectStats[subject];
        if (s.total === 0) return 0;
        return ((s.correct / s.total) * 100).toFixed(1);
    },

    getLevelAssessment() {
        const score = parseFloat(this.getOverallScore());
        if (score >= 85) return { level: '优秀', color: '#27ae60', desc: '已具备冲击高分实力！' };
        if (score >= 70) return { level: '良好', color: '#667eea', desc: '基础知识扎实，继续保持！' };
        if (score >= 55) return { level: '中等', color: '#f39c12', desc: '还需加强薄弱环节训练。' };
        if (score >= 40) return { level: '及格', color: '#e67e22', desc: '建议回归课本巩固基础。' };
        return { level: '需努力', color: '#e74c3c', desc: '需要系统性复习，加油！' };
    },

    getWeakAreas() {
        const weakAreas = [];
        Object.keys(this.stats.subjectStats).forEach(subject => {
            const s = this.stats.subjectStats[subject];
            if (s.total >= 3) {
                const score = (s.correct / s.total) * 100;
                if (score < 60) {
                    weakAreas.push({ subject, score: score.toFixed(1), name: this.examData[subject]?.name || subject });
                }
            }
        });
        Object.keys(this.stats.categoryStats).forEach(cat => {
            const c = this.stats.categoryStats[cat];
            if (c.total >= 3) {
                const score = (c.correct / c.total) * 100;
                if (score < 60) {
                    weakAreas.push({ category: cat, score: score.toFixed(1), type: 'category' });
                }
            }
        });

        return weakAreas.sort((a, b) => parseFloat(a.score) - parseFloat(b.score));
    },

    getRecommendations() {
        const weak = this.getWeakAreas();
        const recs = [];

        weak.forEach(w => {
            if (w.subject === 'physics') {
                recs.push({ tool: '物理公式智能计算器', reason: '加强公式应用能力' });
                recs.push({ tool: '抛物线运动模拟器', reason: '理解物理过程' });
            } else if (w.subject === 'chemistry') {
                recs.push({ tool: '工业流程核心反应提取', reason: '广东卷高频考点' });
                recs.push({ tool: '化学方程式智能配平', reason: '夯实基础' });
            } else if (w.subject === 'biology') {
                recs.push({ tool: '遗传系谱图练习器', reason: '重点难点突破' });
                recs.push({ tool: '光合/呼吸曲线解读', reason: '提升图表分析能力' });
            }
        });

        if (recs.length === 0) {
            recs.push({ tool: '保持当前学习节奏', reason: '各方面均衡发展' });
        }

        return [...new Map(recs.map(r => [r.tool, r]))].values();
    },

    getProgressChart() {
        const years = Object.keys(this.stats.yearStats).sort();
        return years.map(y => ({
            year: y,
            total: this.stats.yearStats[y].total,
            correct: this.stats.yearStats[y].correct,
            rate: this.stats.yearStats[y].total > 0 
                ? ((this.stats.yearStats[y].correct / this.stats.yearStats[y].total) * 100).toFixed(1)
                : 0
        }));
    },

    resetStats() {
        this.stats = {
            totalAnswered: 0,
            correctCount: 0,
            subjectStats: { physics: {total: 0, correct: 0}, chemistry: {total: 0, correct: 0}, biology: {total: 0, correct: 0} },
            categoryStats: {},
            yearStats: {},
            difficultyStats: { easy: {total: 0, correct: 0}, medium: {total: 0, correct: 0}, hard: {total: 0, correct: 0} },
            history: []
        };
        this.results = [];
        this.saveStats();
    },

    renderExamDashboard(container) {
        container.innerHTML = `
            <div class="exam-dashboard">
                <div class="exam-header">
                    <h2>📝 高考真题练习系统 <span class="year-badge">2018-2024</span></h2>
                    <p class="exam-subtitle">广东省高考真题 · 实时评估 · 智能推荐</p>
                </div>
                
                <div class="dashboard-grid">
                    <!-- 左侧：统计面板 -->
                    <div class="stats-panel">
                        <div class="overall-score">
                            <h3>🎯 综合得分</h3>
                            <div class="score-circle" id="score-display">
                                <span class="score-number">${this.getOverallScore()}</span>
                                <span class="score-unit">分</span>
                            </div>
                            <div class="level-badge" id="level-badge">${this.getLevelAssessment().level}</div>
                            <p class="level-desc">${this.getLevelAssessment().desc}</p>
                        </div>

                        <div class="subject-scores">
                            <h4>📊 各科得分</h4>
                            ${['physics', 'chemistry', 'biology'].map(s => `
                                <div class="subject-score-item">
                                    <span class="subj-icon">${s==='physics'?'⚡':s==='chemistry'?'🧪':'🧬'}</span>
                                    <span class="subj-name">${this.examData[s]?.name||s}</span>
                                    <div class="score-bar-container">
                                        <div class="score-bar" style="width:${this.getSubjectScore(s)}%"></div>
                                        <span class="score-text">${this.getSubjectScore(s)}%</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <div class="quick-stats">
                            <div class="qs-item">
                                <span class="qs-num">${this.stats.totalAnswered}</span>
                                <span class="qs-label">已答题</span>
                            </div>
                            <div class="qs-item">
                                <span class="qs-num">${this.stats.correctCount}</span>
                                <span class="qs-label">答对</span>
                            </div>
                            <div class="qs-item">
                                <span class="qs-num">${this.examData?.meta?.totalQuestions||120}</span>
                                <span class="qs-label">题库总量</span>
                            </div>
                        </div>

                        <button class="btn-reset-stats" onclick="examPracticeSystem.resetStats(); examPracticeSystem.renderExamDashboard(document.getElementById('exam-content'));">🔄 重置统计数据</button>
                    </div>

                    <!-- 右侧：练习区域 -->
                    <div class="practice-area">
                        <div class="filter-bar">
                            <select id="exam-subject-filter" onchange="examPracticeSystem.updateExamList()">
                                <option value="all">全部学科</option>
                                <option value="physics">物理</option>
                                <option value="chemistry">化学</option>
                                <option value="biology">生物</option>
                            </select>
                            <select id="exam-year-filter" onchange="examPracticeSystem.updateExamList()">
                                <option value="all">全部年份</option>
                                ${[2024,2023,2022,2021,2020,2019,2018].map(y => `<option value="${y}">${y}年</option>`).join('')}
                            </select>
                            <select id="exam-difficulty-filter" onchange="examPracticeSystem.updateExamList()">
                                <option value="all">全部难度</option>
                                <option value="easy">简单</option>
                                <option value="medium">中等</option>
                                <option value="hard">困难</option>
                            </select>
                            <button class="btn-random-exam" onclick="examPracticeSystem.startRandomQuiz()">🎲 随机出题</button>
                        </div>

                        <div class="exam-list" id="exam-list"></div>

                        <div class="exam-detail" id="exam-detail" style="display:none;"></div>
                        
                        <div class="weakness-panel" id="weakness-panel" style="display:none;">
                            <h4>🔍 薄弱点分析</h4>
                            <div class="weakness-list" id="weakness-list"></div>
                            
                            <h4>💡 学习建议</h4>
                            <div class="recommendations" id="recommendations"></div>
                        </div>
                    </div>
                </div>

                <div class="progress-chart-section">
                    <h4>📈 做题进度趋势</h4>
                    <div class="chart-container" id="progress-chart"></div>
                </div>
            </div>
        `;

        this.updateExamList();
        this.renderProgressChart();

        document.querySelectorAll('.subject-score-item').forEach(item => {
            item.addEventListener('click', () => {
                const subj = item.querySelector('.subj-name').textContent;
                this.showWeaknessAnalysis(subj);
            });
        });
    },

    updateExamList() {
        const subject = document.getElementById('exam-subject-filter').value;
        const year = document.getElementById('exam-year-filter').value;
        const difficulty = document.getElementById('exam-difficulty-filter').value;
        
        const exams = this.getAllExams(subject, { year, difficulty });
        const listEl = document.getElementById('exam-list');
        
        listEl.innerHTML = exams.map((exam, idx) => `
            <div class="exam-item ${exam.difficulty}" data-id="${exam.id}">
                <div class="exam-info">
                    <span class="exam-subject-tag ${exam.subject}">${exam.subject==='physics'?'物理':exam.subject==='chemistry'?'化学':'生物'}</span>
                    <span class="exam-year">${exam.year}年</span>
                    <span class="exam-type">${exam.type}</span>
                    <span class="exam-points">${exam.points}分</span>
                </div>
                <div class="exam-question-preview">${exam.question.substring(0, 60)}...</div>
                <div class="exam-actions">
                    <button class="btn-start-exam" onclick="examPracticeSystem.showExamDetail('${exam.id}')">开始答题</button>
                </div>
            </div>
        `).join('');

        if (exams.length === 0) {
            listEl.innerHTML = '<div class="no-results">😅 暂无符合条件的题目，请调整筛选条件</div>';
        }
    },

    showExamDetail(examId) {
        const exam = this.startExam(examId);
        const detailEl = document.getElementById('exam-detail');
        const listEl = document.getElementById('exam-list');
        
        listEl.style.display = 'none';
        detailEl.style.display = 'block';

        detailEl.innerHTML = `
            <div class="exam-detail-content">
                <div class="detail-header">
                    <button class="btn-back-list" onclick="examPracticeSystem.backToList()">← 返回列表</button>
                    <div class="detail-meta">
                        <span class="exam-subject-tag ${exam.subject}">${exam.subject==='physics'?'物理':exam.subject==='chemistry'?'化学':'生物'}</span>
                        <span>${exam.year}年 · ${exam.type} · ${exam.points}分 · ${exam.difficulty==='hard'?'困难':exam.difficulty==='medium'?'中等':'简单'}</span>
                    </div>
                </div>

                <div class="question-box">
                    <h4>📋 题目内容</h4>
                    <p class="question-text">${exam.question.replace(/\n/g, '<br>')}</p>
                </div>

                <div class="options-box">
                    <h4>📝 请选择答案</h4>
                    ${exam.options.map((opt, i) => `
                        <label class="option-label" data-option="${String.fromCharCode(65+i)}">
                            <input type="radio" name="exam-answer" value="${String.fromCharCode(65+i)}">
                            <span class="option-letter">${String.fromCharCode(65+i)}</span>
                            <span class="option-text">${opt}</span>
                        </label>
                    `).join('')}
                </div>

                <div class="action-buttons">
                    <button class="btn-submit-answer" onclick="examPracticeSystem.submitCurrentAnswer()">✅ 提交答案</button>
                </div>

                <div class="result-box" id="result-box" style="display:none;"></div>

                <div class="analysis-box" id="analysis-box" style="display:none;">
                    <h4>📖 详细解析</h4>
                    <div class="analysis-content">${exam.analysis.replace(/\n/g, '<br>')}</div>
                    
                    <div class="knowledge-points">
                        <h5>🎯 知识考点：</h5>
                        <div class="kp-tags">${exam.knowledgePoints.map(kp => `<span class="kp-tag">${kp}</span>`).join('')}</div>
                    </div>
                </div>
            </div>
        `;
    },

    submitCurrentAnswer() {
        const selected = document.querySelector('input[name="exam-answer"]:checked');
        const resultBox = document.getElementById('result-box');
        const analysisBox = document.getElementById('analysis-box');

        if (!selected) {
            alert('请先选择一个答案！');
            return;
        }

        const result = this.submitAnswer(this.currentExam.id, selected.value);

        resultBox.style.display = 'block';
        resultBox.className = 'result-box ' + (result.isCorrect ? 'correct' : 'wrong');
        resultBox.innerHTML = `
            <div class="result-icon">${result.isCorrect ? '🎉 回答正确！' : '❌ 回答错误'}</div>
            <div class="result-details">
                <p>你的答案：<strong>${result.selectedOption}</strong></p>
                <p>正确答案：<strong>${result.correctAnswer}</strong></p>
                <p>本题分值：<strong>${result.points}分</strong></p>
            </div>
        `;

        analysisBox.style.display = 'block';

        document.querySelectorAll('.option-label').forEach(label => {
            label.classList.remove('selected', 'correct-option', 'wrong-option');
            if (label.querySelector('input').checked) {
                label.classList.add('selected');
                if (result.isCorrect) {
                    label.classList.add('correct-option');
                } else {
                    label.classList.add('wrong-option');
                }
            }
            if (label.dataset.option === result.correctAnswer) {
                label.classList.add('show-correct');
            }
        });

        setTimeout(() => {
            this.refreshStats();
        }, 300);
    },

    backToList() {
        document.getElementById('exam-detail').style.display = 'none';
        document.getElementById('exam-list').style.display = 'block';
    },

    startRandomQuiz() {
        const exams = this.getRandomExams(1, 
            document.getElementById('exam-subject-filter').value,
            document.getElementById('exam-difficulty-filter').value
        );
        if (exams.length > 0) {
            this.showExamDetail(exams[0].id);
        }
    },

    refreshStats() {
        const scoreEl = document.getElementById('score-display');
        if (scoreEl) {
            scoreEl.querySelector('.score-number').textContent = this.getOverallScore();
        }

        const levelBadge = document.getElementById('level-badge');
        if (levelBadge) {
            const assessment = this.getLevelAssessment();
            levelBadge.textContent = assessment.level;
            levelBadge.style.color = assessment.color;
        }

        document.querySelectorAll('.subject-score-item .score-bar').forEach(bar => {
            const subjName = bar.closest('.subject-score-item').querySelector('.subj-name').textContent;
            const subjKey = Object.keys(this.examData).find(k => 
                this.examData[k]?.name === subjName
            ) || 'physics';
            bar.style.width = this.getSubjectScore(subjKey) + '%';
            bar.nextElementSibling.textContent = this.getSubjectScore(subjKey) + '%';
        });

        document.querySelectorAll('.qs-item')[0].querySelector('.qs-num').textContent = this.stats.totalAnswered;
        document.querySelectorAll('.qs-item')[1].querySelector('.qs-num').textContent = this.stats.correctCount;

        this.renderProgressChart();
    },

    showWeaknessAnalysis(subject) {
        const panel = document.getElementById('weakness-panel');
        const listEl = document.getElementById('weakness-list');
        const recEl = document.getElementById('recommendations');
        
        panel.style.display = 'block';

        const weak = this.getWeakAreas().filter(w => !subject || w.name === subject || w.subject === subject);
        
        if (weak.length === 0) {
            listEl.innerHTML = '<div class="no-weakness">👍 太棒了！该科目没有明显的薄弱环节</div>';
        } else {
            listEl.innerHTML = weak.map(w => `
                <div class="weak-item">
                    <span class="weak-score" style="color:${parseFloat(w.score)<40?'#e74c3c':parseFloat(w.score)<60?'#f39c12':'#27ae60'}">${w.score}%</span>
                    <span class="weak-name">${w.name || w.category || w.subject}</span>
                    <span class="weak-desc">${parseFloat(w.score)<40?'急需加强':parseFloat(w.score)<60?'需要提升':'有待提高'}</span>
                </div>
            `).join('');
        }

        const recs = this.getRecommendations();
        recEl.innerHTML = recs.map(r => `
            <div class="rec-item">
                <span class="rec-tool">🛠️ ${r.tool}</span>
                <span class="rec-reason">${r.reason}</span>
            </div>
        `).join('');
    },

    renderProgressChart() {
        const chartEl = document.getElementById('progress-chart');
        const data = this.getProgressChart();
        
        if (data.length === 0) {
            chartEl.innerHTML = '<p class="no-data">完成一些题目后将显示进度趋势图</p>';
            return;
        }

        const maxTotal = Math.max(...data.map(d => d.total)) || 1;
        
        chartEl.innerHTML = `
            <div class="bar-chart-vertical">
                ${data.map(d => `
                    <div class="bar-row">
                        <span class="bar-year">${d.year}</span>
                        <div class="bar-track-v">
                            <div class="bar-fill-v correct" style="height:${(d.correct/d.maxTotal*100)||0}%"></div>
                            <div class="bar-fill-v total" style="height:${(d.total/d.maxTotal*100)||0}%"></div>
                        </div>
                        <div class="bar-stats-v">
                            <span class="stat-correct">${d.correct}/${d.total}</span>
                            <span class="stat-rate">${d.rate}%</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// 初始化真题系统
document.addEventListener('DOMContentLoaded', () => {
    examPracticeSystem.init();
});

const pcrSimulator = {
    state: {
        currentStep: 0,
        cycle: 1,
        maxCycles: 30,
        isRunning: false,
        animFrameId: null,
        temperature: 25,
        targetTemp: 95,
        dnaStrands: [],
        params: {
            denaturationTemp: 95,
            annealingTemp: 55,
            extensionTemp: 72,
            denaturationTime: 30,
            annealingTime: 30,
            extensionTime: 60,
            cycles: 30
        },
        amplificationData: [],
        showHelp: false
    },

    steps: [
        { id: 'denaturation', name: '变性', temp: '94-98°C', time: '20-30s', icon: '🔥', description: '双链DNA在高温下解旋为单链', color: '#e74c3c' },
        { id: 'annealing', name: '退火', temp: '50-65°C', time: '20-30s', icon: '❄️', description: '引物与单链DNA模板结合', color: '#3498db' },
        { id: 'extension', name: '延伸', temp: '72°C', time: '30-60s', icon: '🔗', description: 'Taq聚合酶沿模板合成新链', color: '#27ae60' }
    ],

    initDNA() {
        this.state.dnaStrands = [
            { id: 1, type: 'template', strand: '5\'-ATCGATCGATCG-3\'', visible: true },
            { id: 2, type: 'complement', strand: '3\'-TAGCTAGCTAGC-5\'', visible: true }
        ];
        this.state.amplificationData = [];
        let initial = 1;
        for (let i = 0; i <= this.state.params.cycles; i++) {
            this.state.amplificationData.push({ cycle: i, copies: initial });
            initial *= 2;
        }
    },

    startSimulation() {
        if (this.state.isRunning) return;
        this.state.isRunning = true;
        this.state.cycle = 1;
        this.state.currentStep = 0;
        this.initDNA();
        this._animate();
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
        this.state.cycle = 1;
        this.state.currentStep = 0;
        this.state.temperature = 25;
        this.state.dnaStrands = [];
        this.renderSystem();
    },

    updateParam(param, value) {
        this.state.params[param] = parseInt(value);
        if (param === 'cycles') {
            this.initDNA();
        }
        this.renderSystem();
    },

    _animate() {
        if (!this.state.isRunning) return;

        const step = this.steps[this.state.currentStep];
        const targetTemps = { denaturation: this.state.params.denaturationTemp, annealing: this.state.params.annealingTemp, extension: this.state.params.extensionTemp };
        const targetTemp = targetTemps[step.id];

        if (Math.abs(this.state.temperature - targetTemp) < 1) {
            setTimeout(() => {
                this.state.currentStep++;
                if (this.state.currentStep >= 3) {
                    this.state.currentStep = 0;
                    this.state.cycle++;
                    if (this.state.cycle > this.state.params.cycles) {
                        this.state.isRunning = false;
                        this.renderSystem();
                        return;
                    }
                }
                if (this.state.isRunning) {
                    this._animate();
                }
            }, 500);
        } else {
            this.state.temperature += (targetTemp - this.state.temperature) * 0.1;
        }

        this.renderSystem();
        this.state.animFrameId = requestAnimationFrame(() => this._animate());
    },

    toggleHelp() {
        this.state.showHelp = !this.state.showHelp;
        this.renderSystem();
    },

    renderSystem() {
        const app = document.getElementById('pcr-simulator-app');
        if (!app) return;

        const { currentStep, cycle, isRunning, temperature, params, amplificationData, showHelp } = this.state;

        app.innerHTML = `
        <div class="pcr-system">
            <div class="pcr-header">
                <h3>🧬 PCR聚合酶链式反应模拟实验系统</h3>
                <p class="pcr-intro">PCR是一种体外扩增DNA的技术，通过变性-退火-延伸三个步骤循环进行，实现DNA片段的指数级扩增</p>
                <button class="help-btn" onclick="pcrSimulator.toggleHelp()">${showHelp ? '📖 隐藏说明' : '📖 使用说明'}</button>
            </div>

            ${showHelp ? `
            <div class="help-panel">
                <h4>📋 实验操作指南</h4>
                <div class="help-content">
                    <div class="help-section">
                        <h5>🎯 实验目的</h5>
                        <p>理解PCR技术的基本原理，掌握变性、退火、延伸三个关键步骤的温度和时间控制</p>
                    </div>
                    <div class="help-section">
                        <h5>⚙️ 参数说明</h5>
                        <ul>
                            <li><strong>变性温度(94-98°C)</strong>：使DNA双链解旋为单链，氢键断裂</li>
                            <li><strong>退火温度(50-65°C)</strong>：引物与模板结合，温度取决于引物Tm值</li>
                            <li><strong>延伸温度(72°C)</strong>：Taq聚合酶最适温度，合成新链</li>
                            <li><strong>循环次数(25-40次)</strong>：决定扩增产物量，理论上每循环产物翻倍</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h5>🔬 关键试剂</h5>
                        <ul>
                            <li><strong>DNA模板</strong>：含有目标序列的DNA片段</li>
                            <li><strong>引物(Primer)</strong>：与目标序列两端互补的短单链DNA</li>
                            <li><strong>Taq聚合酶</strong>：耐高温DNA聚合酶，最适温度72°C</li>
                            <li><strong>dNTPs</strong>：四种脱氧核糖核苷酸，合成新链的原料</li>
                            <li><strong>缓冲液</strong>：提供合适的pH和Mg²⁺离子环境</li>
                        </ul>
                    </div>
                </div>
            </div>
            ` : ''}

            <div class="pcr-main">
                <div class="pcr-controls">
                    <h4>⚙️ 实验参数设置</h4>
                    <div class="param-group">
                        <label>变性温度 (°C)</label>
                        <input type="range" min="94" max="98" value="${params.denaturationTemp}" onchange="pcrSimulator.updateParam('denaturationTemp', this.value)">
                        <span class="param-value">${params.denaturationTemp}°C</span>
                    </div>
                    <div class="param-group">
                        <label>退火温度 (°C)</label>
                        <input type="range" min="50" max="65" value="${params.annealingTemp}" onchange="pcrSimulator.updateParam('annealingTemp', this.value)">
                        <span class="param-value">${params.annealingTemp}°C</span>
                    </div>
                    <div class="param-group">
                        <label>延伸温度 (°C)</label>
                        <input type="range" min="68" max="75" value="${params.extensionTemp}" onchange="pcrSimulator.updateParam('extensionTemp', this.value)">
                        <span class="param-value">${params.extensionTemp}°C</span>
                    </div>
                    <div class="param-group">
                        <label>循环次数</label>
                        <input type="range" min="25" max="40" value="${params.cycles}" onchange="pcrSimulator.updateParam('cycles', this.value)">
                        <span class="param-value">${params.cycles}次</span>
                    </div>

                    <div class="control-buttons">
                        <button class="btn btn-primary" onclick="pcrSimulator.startSimulation()" ${isRunning ? 'disabled' : ''}>▶ 开始模拟</button>
                        <button class="btn btn-secondary" onclick="pcrSimulator.pauseSimulation()" ${!isRunning ? 'disabled' : ''}>⏸ 暂停</button>
                        <button class="btn btn-secondary" onclick="pcrSimulator.resetSimulation()">↺ 重置</button>
                    </div>
                </div>

                <div class="pcr-visualization">
                    <div class="temp-display">
                        <div class="temp-circle" style="background: ${temperature > 80 ? '#e74c3c' : temperature > 60 ? '#f39c12' : '#3498db'}">
                            <span class="temp-value">${temperature.toFixed(1)}</span>
                            <span class="temp-unit">°C</span>
                        </div>
                    </div>

                    <div class="steps-display">
                        ${this.steps.map((step, idx) => `
                            <div class="step-card ${currentStep === idx && isRunning ? 'active' : ''}" style="border-color: ${step.color}">
                                <div class="step-icon">${step.icon}</div>
                                <div class="step-info">
                                    <h5 style="color: ${step.color}">${step.name}</h5>
                                    <p>${step.temp} | ${step.time}</p>
                                    <p class="step-desc">${step.description}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="cycle-info">
                        <span class="cycle-label">当前循环</span>
                        <span class="cycle-value">${cycle} / ${params.cycles}</span>
                    </div>
                </div>

                <div class="pcr-results">
                    <h4>📊 扩增结果</h4>
                    <div class="amplification-chart">
                        <canvas id="pcr-chart" width="300" height="200"></canvas>
                    </div>
                    <div class="result-stats">
                        <div class="stat-item">
                            <span class="stat-label">理论产物数</span>
                            <span class="stat-value">${Math.pow(2, cycle - 1)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">扩增倍数</span>
                            <span class="stat-value">${Math.pow(2, cycle - 1)}x</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pcr-principle">
                <h4>💡 PCR原理要点</h4>
                <div class="principle-cards">
                    <div class="principle-card">
                        <h5>🔥 变性阶段</h5>
                        <p>高温(94-98°C)使DNA双链间的氢键断裂，双螺旋解旋为两条单链。此过程可逆，降温后互补链可通过氢键重新配对（复性），是PCR循环的起点。</p>
                    </div>
                    <div class="principle-card">
                        <h5>❄️ 退火阶段</h5>
                        <p>温度降低至引物Tm值附近(50-65°C)，引物与模板DNA的互补序列通过碱基配对结合。引物设计需考虑GC含量和长度。</p>
                    </div>
                    <div class="principle-card">
                        <h5>🔗 延伸阶段</h5>
                        <p>在Taq聚合酶作用下，以dNTPs为原料，从引物3'端开始沿模板合成新的DNA链。延伸方向始终为5'→3'。</p>
                    </div>
                </div>
            </div>

            <div class="gd-section">
                <h5>🎯 高考考点</h5>
                <ul class="gd-points">
                    <li>PCR技术的原理：体外DNA扩增，无需细胞参与</li>
                    <li>Taq聚合酶的特点：耐高温，最适温度72°C</li>
                    <li>引物设计原则：与目标序列两端互补，长度18-25bp</li>
                    <li>PCR应用：基因诊断、亲子鉴定、病原体检测、基因克隆</li>
                </ul>
            </div>
        </div>`;

        this._drawChart();
    },

    _drawChart() {
        const canvas = document.getElementById('pcr-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = '#e4e8ee';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = 20 + (h - 40) * i / 5;
            ctx.beginPath();
            ctx.moveTo(40, y);
            ctx.lineTo(w - 20, y);
            ctx.stroke();
        }

        const data = this.state.amplificationData.slice(0, this.state.cycle + 1);
        if (data.length < 2) return;

        const maxVal = Math.max(...data.map(d => d.copies));
        const xScale = (w - 60) / this.state.params.cycles;
        const yScale = (h - 40) / Math.log10(maxVal + 1);

        ctx.strokeStyle = '#5b6abf';
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((d, i) => {
            const x = 40 + d.cycle * xScale;
            const y = h - 20 - Math.log10(d.copies + 1) * yScale;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        ctx.fillStyle = '#5b6abf';
        data.forEach(d => {
            const x = 40 + d.cycle * xScale;
            const y = h - 20 - Math.log10(d.copies + 1) * yScale;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = '#7f8c9b';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('循环次数', w / 2, h - 2);
        ctx.save();
        ctx.translate(12, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('产物量(log)', 0, 0);
        ctx.restore();
    }
};

const gelElectrophoresisSimulator = {
    state: {
        samples: [],
        markers: [
            { name: '1000bp', size: 1000, color: '#333' },
            { name: '750bp', size: 750, color: '#333' },
            { name: '500bp', size: 500, color: '#333' },
            { name: '250bp', size: 250, color: '#333' },
            { name: '100bp', size: 100, color: '#333' }
        ],
        isRunning: false,
        animFrameId: null,
        voltage: 100,
        runTime: 0,
        maxTime: 45,
        gelPercentage: 1.5,
        showHelp: false
    },

    defaultSamples: [
        { id: 1, name: 'Marker', bands: [1000, 750, 500, 250, 100], color: '#333', type: 'marker' },
        { id: 2, name: '样本1', bands: [650], color: '#e74c3c', type: 'sample' },
        { id: 3, name: '样本2', bands: [420], color: '#3498db', type: 'sample' },
        { id: 4, name: '样本3', bands: [850, 320], color: '#27ae60', type: 'sample' },
        { id: 5, name: 'PCR产物', bands: [500], color: '#9b59b6', type: 'sample' }
    ],

    init() {
        this.state.samples = JSON.parse(JSON.stringify(this.defaultSamples));
    },

    addSample(name, bands, color) {
        const id = this.state.samples.length + 1;
        this.state.samples.push({ id, name, bands: bands.split(',').map(b => parseInt(b.trim())), color, type: 'sample' });
        this.renderSystem();
    },

    removeSample(id) {
        this.state.samples = this.state.samples.filter(s => s.id !== id);
        this.renderSystem();
    },

    updateVoltage(value) {
        this.state.voltage = parseInt(value);
        this.renderSystem();
    },

    updateGelPercentage(value) {
        this.state.gelPercentage = parseFloat(value);
        this.renderSystem();
    },

    startRun() {
        if (this.state.isRunning) return;
        this.state.isRunning = true;
        this.state.runTime = 0;
        this._animate();
    },

    pauseRun() {
        this.state.isRunning = false;
        if (this.state.animFrameId) {
            cancelAnimationFrame(this.state.animFrameId);
            this.state.animFrameId = null;
        }
    },

    resetRun() {
        this.pauseRun();
        this.state.runTime = 0;
        this.renderSystem();
    },

    toggleHelp() {
        this.state.showHelp = !this.state.showHelp;
        this.renderSystem();
    },

    _animate() {
        if (!this.state.isRunning) return;

        this.state.runTime += 0.1;
        if (this.state.runTime >= this.state.maxTime) {
            this.state.isRunning = false;
            this.renderSystem();
            return;
        }

        this.renderSystem();
        this.state.animFrameId = requestAnimationFrame(() => this._animate());
    },

    _calculateMigration(size, time) {
        const logSize = Math.log10(size);
        const maxMigration = 280;
        const speedFactor = (this.state.voltage / 100) * (1.5 / this.state.gelPercentage);
        const migration = (1 - logSize / 4) * maxMigration * (time / this.state.maxTime) * speedFactor;
        return Math.min(migration, maxMigration);
    },

    renderSystem() {
        const app = document.getElementById('gel-electrophoresis-app');
        if (!app) return;

        const { samples, voltage, runTime, maxTime, gelPercentage, isRunning, showHelp } = this.state;

        app.innerHTML = `
        <div class="gel-system">
            <div class="gel-header">
                <h3>🔬 琼脂糖凝胶电泳模拟工具</h3>
                <p class="gel-intro">电泳是根据DNA片段大小进行分离的技术，小片段迁移更快，大片段迁移更慢</p>
                <button class="help-btn" onclick="gelElectrophoresisSimulator.toggleHelp()">${showHelp ? '📖 隐藏说明' : '📖 使用说明'}</button>
            </div>

            ${showHelp ? `
            <div class="help-panel">
                <h4>📋 实验操作指南</h4>
                <div class="help-content">
                    <div class="help-section">
                        <h5>🎯 实验原理</h5>
                        <p>DNA分子在电场中向正极移动，迁移速率与分子量对数成反比。琼脂糖凝胶形成网状结构，起分子筛作用。</p>
                    </div>
                    <div class="help-section">
                        <h5>⚙️ 参数影响</h5>
                        <ul>
                            <li><strong>凝胶浓度</strong>：浓度越高，孔径越小，分离小片段效果越好</li>
                            <li><strong>电压</strong>：电压越高，迁移越快，但过高会导致条带变形</li>
                            <li><strong>电泳时间</strong>：时间越长，分离效果越好，但条带会扩散</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h5>🔬 操作步骤</h5>
                        <ol>
                            <li>制备琼脂糖凝胶(1-2%)，加入核酸染料</li>
                            <li>将凝胶放入电泳槽，加入电泳缓冲液</li>
                            <li>在加样孔中加入DNA样品和Marker</li>
                            <li>接通电源，设定电压(80-120V)</li>
                            <li>电泳结束后，在紫外灯下观察条带</li>
                        </ol>
                    </div>
                </div>
            </div>
            ` : ''}

            <div class="gel-main">
                <div class="gel-controls">
                    <h4>⚙️ 实验参数</h4>
                    <div class="param-group">
                        <label>电压 (V)</label>
                        <input type="range" min="50" max="150" value="${voltage}" onchange="gelElectrophoresisSimulator.updateVoltage(this.value)">
                        <span class="param-value">${voltage}V</span>
                    </div>
                    <div class="param-group">
                        <label>凝胶浓度 (%)</label>
                        <input type="range" min="0.8" max="2.5" step="0.1" value="${gelPercentage}" onchange="gelElectrophoresisSimulator.updateGelPercentage(this.value)">
                        <span class="param-value">${gelPercentage}%</span>
                    </div>

                    <div class="control-buttons">
                        <button class="btn btn-primary" onclick="gelElectrophoresisSimulator.startRun()" ${isRunning ? 'disabled' : ''}>▶ 开始电泳</button>
                        <button class="btn btn-secondary" onclick="gelElectrophoresisSimulator.pauseRun()" ${!isRunning ? 'disabled' : ''}>⏸ 暂停</button>
                        <button class="btn btn-secondary" onclick="gelElectrophoresisSimulator.resetRun()">↺ 重置</button>
                    </div>

                    <div class="time-display">
                        <span>运行时间: ${runTime.toFixed(1)} / ${maxTime} 分钟</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(runTime / maxTime) * 100}%"></div>
                        </div>
                    </div>
                </div>

                <div class="gel-visualization">
                    <div class="gel-container">
                        <div class="gel-labels">
                            <div class="gel-label-top">加样孔</div>
                            <div class="gel-label-bottom">正极(+)↓</div>
                        </div>
                        <canvas id="gel-canvas" width="400" height="350"></canvas>
                    </div>
                </div>

                <div class="gel-analysis">
                    <h4>📊 结果分析</h4>
                    <div class="sample-list">
                        ${samples.map(s => `
                            <div class="sample-item" style="border-left: 3px solid ${s.color}">
                                <span class="sample-name">${s.name}</span>
                                <span class="sample-bands">${s.bands.map(b => b + 'bp').join(', ')}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="analysis-tips">
                        <h5>💡 分析提示</h5>
                        <p>• 条带位置与DNA片段大小成反比</p>
                        <p>• Marker用于确定未知片段大小</p>
                        <p>• 条带亮度与DNA浓度成正比</p>
                    </div>
                </div>
            </div>

            <div class="gel-principle">
                <h4>💡 电泳原理要点</h4>
                <div class="principle-cards">
                    <div class="principle-card">
                        <h5>🔬 分子筛效应</h5>
                        <p>琼脂糖凝胶形成网状结构，DNA分子通过时受到阻力。小分子通过容易，迁移快；大分子受阻大，迁移慢。</p>
                    </div>
                    <div class="principle-card">
                        <h5>⚡ 电荷效应</h5>
                        <p>DNA分子带负电荷(磷酸基团)，在电场中向正极移动。电荷密度相同，故迁移速率主要取决于分子大小。</p>
                    </div>
                    <div class="principle-card">
                        <h5>📏 片段大小测定</h5>
                        <p>通过比较未知样品与Marker的迁移距离，可估算DNA片段大小。迁移距离与log(分子量)呈线性关系。</p>
                    </div>
                </div>
            </div>

            <div class="gd-section">
                <h5>🎯 高考考点</h5>
                <ul class="gd-points">
                    <li>电泳分离原理：分子筛效应+电荷效应</li>
                    <li>凝胶浓度选择：大片段用低浓度，小片段用高浓度</li>
                    <li>DNA分子带负电，向正极移动</li>
                    <li>电泳应用：DNA指纹图谱、基因诊断、亲子鉴定</li>
                </ul>
            </div>
        </div>`;

        this._drawGel();
    },

    _drawGel() {
        const canvas = document.getElementById('gel-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;

        ctx.fillStyle = '#d4e6f1';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#aed6f1';
        ctx.fillRect(20, 10, w - 40, 30);

        const wellWidth = 40;
        const wellSpacing = (w - 40) / this.state.samples.length;
        this.state.samples.forEach((s, i) => {
            ctx.fillStyle = '#fff';
            ctx.fillRect(20 + i * wellSpacing + 5, 15, wellWidth - 10, 20);
        });

        this.state.samples.forEach((sample, idx) => {
            const x = 20 + idx * wellSpacing + wellSpacing / 2;
            sample.bands.forEach(size => {
                const migration = this._calculateMigration(size, this.state.runTime);
                const y = 45 + migration;
                const bandWidth = wellWidth - 10;

                ctx.fillStyle = sample.color;
                ctx.globalAlpha = 0.8;
                ctx.fillRect(x - bandWidth / 2, y, bandWidth, 4);
                ctx.globalAlpha = 1;
            });
        });

        ctx.fillStyle = '#7f8c9b';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        const markerSizes = [1000, 750, 500, 250, 100];
        markerSizes.forEach(size => {
            const y = 45 + this._calculateMigration(size, this.state.maxTime);
            ctx.fillText(size + 'bp', w - 45, y + 4);
        });
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

document.addEventListener('DOMContentLoaded', () => {
    pcrSimulator.initDNA();
    gelElectrophoresisSimulator.init();
    equationBalancerPro.init();
});

window.pcrSimulator = pcrSimulator;
window.gelElectrophoresisSimulator = gelElectrophoresisSimulator;
window.equationBalancerPro = equationBalancerPro;
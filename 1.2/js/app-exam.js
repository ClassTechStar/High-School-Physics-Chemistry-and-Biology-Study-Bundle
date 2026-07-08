// ============================================================
// app-exam.js — 高考真题与实验室模拟（从 app.js 拆分）
// 包含: 真题练习系统/PCR模拟器/凝胶电泳模拟器
// 依赖: 无外部依赖，examPracticeSystem 被 navigateTo 引用
// ============================================================

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
            try {
                this.stats = JSON.parse(saved);
            } catch (e) {
                console.error('统计数据解析错误:', e.message);
            }
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

/**
 * PCR扩增模拟器 - 变性/退火/延伸循环动画，含温度变化与扩增数据曲线
 * @module pcrSimulator
 * @example window.pcrSimulator.renderSystem()
 */
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

/**
 * 凝胶电泳模拟器 - DNA片段电泳分离动画，含Marker与电压/胶浓度调节
 * @module gelElectrophoresisSimulator
 * @example window.gelElectrophoresisSimulator.renderSystem()
 */
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

// ---- window 暴露 ----
window.examPracticeSystem = examPracticeSystem;
window.pcrSimulator = pcrSimulator;
window.gelElectrophoresisSimulator = gelElectrophoresisSimulator;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof pcrSimulator !== 'undefined') pcrSimulator.initDNA();
    if (typeof gelElectrophoresisSimulator !== 'undefined') gelElectrophoresisSimulator.init();
});

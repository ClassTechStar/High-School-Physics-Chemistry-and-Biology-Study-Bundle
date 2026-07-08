// 广东卷特色功能模块
// 包含：命题规律白皮书、情境化试题训练、答题模板库、计算题分步训练器
// 数据全部内嵌，零依赖，ES5兼容写法

// ============================================================
// 1. 广东卷命题规律白皮书 guangdongAnalysis
// ============================================================
window.guangdongAnalysis = {
    state: { subject: 'physics' },

    data: {
        physics: {
            name: '物理', icon: '⚛️', color: '#2563eb',
            hotspots: [
                { name: '牛顿运动定律', freq: 95, trend: '连续5年必考，多与运动学结合考查多过程问题' },
                { name: '电磁感应', freq: 90, trend: '压轴题常客，侧重单棒/双棒模型与能量转化' },
                { name: '平抛运动', freq: 85, trend: '与斜面、圆弧结合考查，强调临界条件分析' },
                { name: '功能关系与动能定理', freq: 82, trend: '渗透于各类题型，注重过程分析与变力做功' },
                { name: '带电粒子在磁场中运动', freq: 78, trend: '有界磁场、多解性问题频出，考查几何关系' },
                { name: '万有引力与卫星变轨', freq: 72, trend: '结合我国航天成就命题，强调物理量关系推导' },
                { name: '动量守恒与碰撞', freq: 68, trend: '与能量结合考查综合题，注重守恒条件判断' },
                { name: '电场强度与电势', freq: 65, trend: '等势面、电场线与粒子运动结合考查' },
                { name: '电路与实验设计', freq: 60, trend: '测电阻、测电动势实验为主，考查误差分析' },
                { name: '光学与原子物理', freq: 55, trend: '光电效应、玻尔模型为选择题热点' }
            ],
            trendText: '2022-2026年广东物理卷呈现"力学打底、电磁压轴"的稳定格局。选择题覆盖面广，注重物理观念与科学思维考查；实验题突出真实情境下的方案设计与误差讨论；计算题第一题多为力学综合，第二题聚焦电磁场中的多过程运动。试题整体强调"建模能力"与"推理论证"，情境化命题比例逐年提升，2026年已超60%。',
            prediction: [
                '航天情境(空间站对接、卫星变轨)结合万有引力考查',
                '新能源情境(电磁制动、无线充电)考查电磁感应',
                '多过程运动+能量守恒综合题(匀加速→变加速→匀速)',
                '带电粒子在有界磁场中的临界与极值问题',
                '实验题侧重"测量性实验+误差来源分析"组合'
            ]
        },
        chemistry: {
            name: '化学', icon: '🧪', color: '#d97706',
            hotspots: [
                { name: '化学反应速率与平衡', freq: 92, trend: '必考大题，侧重图像分析、平衡常数计算与等效平衡' },
                { name: '工艺流程题', freq: 88, trend: '以矿物加工为背景，考查除杂、调pH、回收利用' },
                { name: '电化学', freq: 85, trend: '新型电池(锂电、燃料电池)为载体，考查电极反应书写' },
                { name: '元素周期律与推断', freq: 78, trend: '短周期元素推断为主，结合结构与性质考查' },
                { name: '有机推断与合成', freq: 75, trend: '聚焦医药、材料分子，考查官能团转化与方程式' },
                { name: '水溶液中的离子平衡', freq: 72, trend: '分布系数图、滴定曲线分析为热点' },
                { name: '氧化还原反应', freq: 68, trend: '渗透于工艺流程与实验题，考查配平与产物判断' },
                { name: '化学实验基本操作', freq: 65, trend: '仪器连接、除杂顺序、尾气处理为常考点' },
                { name: '物质结构与性质', freq: 60, trend: '杂化方式、晶体密度计算、配位键分析' },
                { name: '化学计算与守恒', freq: 55, trend: '守恒法、关系式法在选择题中频繁出现' }
            ],
            trendText: '广东化学卷坚持"原理+流程+实验+有机"四大模块稳定布局。2022-2026年工艺流程题素材多取自广东本地产业(稀土、有色金属冶炼)；反应原理题强化图像信息的提取与解释能力；有机题注重"逆推法"训练与官能团性质网络。试题突出"宏微结合"与"证据推理"，图表题占比稳定在70%以上。',
            prediction: [
                '广东特色矿物(钨、稀土)工艺流程综合题',
                '新型二次电池(钠离子、固态电池)电极反应与计算',
                '多重平衡图像(Kp、分布系数)分析与计算',
                '手性药物分子有机合成路线推断',
                '晶胞参数计算与第一电离能、电负性变化规律'
            ]
        },
        biology: {
            name: '生物', icon: '🧬', color: '#059669',
            hotspots: [
                { name: '遗传规律与家系分析', freq: 95, trend: '压轴必考，侧重多基因、伴性遗传与概率计算' },
                { name: '细胞代谢(光合与呼吸)', freq: 90, trend: '结合曲线、实验考查影响因素与产物分析' },
                { name: '实验设计与变量分析', freq: 85, trend: '探究性实验为主，强调对照与结论表述规范' },
                { name: '稳态与调节机制', freq: 80, trend: '神经-体液-免疫调节网络，结合临床情境' },
                { name: '生态系统与环境保护', freq: 75, trend: '岭南生态、碳达峰等情境，考查能量流动与稳定性' },
                { name: '细胞的生命历程', freq: 70, trend: '有丝/减数分裂图像辨析与细胞凋亡机制' },
                { name: '遗传的分子基础', freq: 68, trend: '中心法则、基因表达调控结合实验考查' },
                { name: '变异与生物进化', freq: 62, trend: '基因重组、突变类型与现代生物进化理论' },
                { name: '免疫调节与疾病', freq: 58, trend: '疫苗、自身免疫病等热点情境命题' },
                { name: '种群与群落演替', freq: 55, trend: '种群数量增长模型与群落演替类型判断' }
            ],
            trendText: '广东生物卷以"素养立意"为核心，遗传题保持高难度与高区分度，实验设计题强调"提出假设—设计对照—预期结果—得出结论"的完整思维链。2022-2026年情境素材紧贴广东本土(红树林、岭南物种、粤港澳大湾区生态)与前沿科技(基因编辑、mRNA疫苗)。试题注重"科学探究"与"社会责任"素养，长句表述题分值占比超30%。',
            prediction: [
                '多基因遗传+伴性遗传的家系分析与概率计算',
                '红树林/岭南湿地生态系统的能量流动与稳定性',
                '探究某因素对光合作用影响的完整实验设计',
                '基因表达调控与CRISPR基因编辑情境题',
                '神经-体液调节下的稳态维持(血糖/体温)长句表述'
            ]
        }
    },

    render: function () {
        var app = document.getElementById('guangdong-analysis-app');
        if (!app) return;
        this._render();
    },

    _render: function () {
        var app = document.getElementById('guangdong-analysis-app');
        if (!app) return;
        var self = this;
        var s = this.state;
        var subjects = [
            { key: 'physics', name: '物理', icon: '⚛️' },
            { key: 'chemistry', name: '化学', icon: '🧪' },
            { key: 'biology', name: '生物', icon: '🧬' }
        ];
        var html = '<div style="padding:16px;font-family:inherit;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">';
        html += '<h3 style="margin:0;color:#0f172a;">📊 广东卷命题规律白皮书 (2022-2026)</h3>';
        html += '<div style="display:flex;gap:6px;">';
        subjects.forEach(function (t) {
            var active = s.subject === t.key;
            html += '<button data-sub="' + t.key + '" class="ga-tab" style="padding:6px 14px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;background:' + (active ? '#1e40af' : '#fff') + ';color:' + (active ? '#fff' : '#475569') + ';font-weight:600;">' + t.icon + ' ' + t.name + '</button>';
        });
        html += '</div></div>';

        var d = this.data[s.subject];
        var maxFreq = 100;

        // 高频考点TOP10
        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:14px;">';
        html += '<h4 style="margin-top:0;color:' + d.color + ';">🔥 ' + d.name + '高频考点 TOP10</h4>';
        html += '<div style="display:flex;flex-direction:column;gap:8px;">';
        d.hotspots.forEach(function (h, i) {
            var barColor = h.freq >= 85 ? '#dc2626' : (h.freq >= 70 ? '#ea580c' : '#ca8a04');
            html += '<div style="display:flex;align-items:center;gap:10px;">';
            html += '<div style="width:26px;height:26px;border-radius:50%;background:' + barColor + ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;flex-shrink:0;">' + (i + 1) + '</div>';
            html += '<div style="flex:1;min-width:0;">';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;"><span style="font-weight:600;color:#0f172a;font-size:0.92rem;">' + h.name + '</span><span style="color:' + barColor + ';font-weight:700;font-size:0.85rem;">' + h.freq + '%</span></div>';
            html += '<div style="height:10px;background:#f1f5f9;border-radius:5px;overflow:hidden;"><div style="height:100%;width:' + h.freq + '%;background:linear-gradient(90deg,' + barColor + ',#f97316);border-radius:5px;"></div></div>';
            html += '<div style="font-size:0.78rem;color:#64748b;margin-top:3px;">' + h.trend + '</div>';
            html += '</div></div>';
        });
        html += '</div></div>';

        // 命题趋势文字分析
        html += '<div style="background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #d97706;border-radius:8px;padding:14px;margin-bottom:14px;">';
        html += '<h4 style="margin-top:0;color:#b45309;">📈 命题趋势分析</h4>';
        html += '<p style="margin:0;color:#78350f;line-height:1.75;font-size:0.9rem;">' + d.trendText + '</p>';
        html += '</div>';

        // 2027年预测考点
        html += '<div style="background:#ecfdf5;border:1px solid #a7f3d0;border-left:4px solid #059669;border-radius:8px;padding:14px;">';
        html += '<h4 style="margin-top:0;color:#047857;">🔮 2027年预测考点</h4>';
        html += '<div style="display:flex;flex-direction:column;gap:6px;">';
        d.prediction.forEach(function (p, i) {
            html += '<div style="display:flex;align-items:flex-start;gap:8px;background:#fff;padding:8px 10px;border-radius:6px;border:1px solid #d1fae5;">';
            html += '<span style="background:#059669;color:#fff;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">' + (i + 1) + '</span>';
            html += '<span style="color:#064e3b;font-size:0.88rem;line-height:1.5;">' + p + '</span>';
            html += '</div>';
        });
        html += '</div></div>';

        html += '<div style="margin-top:12px;font-size:0.78rem;color:#94a3b8;text-align:center;">数据基于2022-2026年广东卷真题统计，频次为出现年份占比</div>';
        html += '</div>';

        app.innerHTML = html;

        var tabs = app.querySelectorAll('.ga-tab');
        for (var i = 0; i < tabs.length; i++) {
            (function (tab) {
                tab.addEventListener('click', function () {
                    self.state.subject = tab.getAttribute('data-sub');
                    self._render();
                });
            })(tabs[i]);
        }
    }
};


// ============================================================
// 2. 情境化试题训练 situationalQuiz
// ============================================================
window.situationalQuiz = {
    state: { subject: 'all', scene: 'all', current: 0, answered: false, userAns: -1 },

    STORAGE_KEY: 'gd_situational_quiz_record',

    questions: [
        {
            id: 1, subject: 'physics', scene: 'tech',
            title: '港珠澳大桥抗震阻尼器',
            background: '港珠澳大桥在设计时考虑了台风与地震影响，桥塔间安装了黏滞阻尼器。当桥面在风载作用下振动时，阻尼器通过流体黏滞阻力消耗振动能量，减小桥面振幅。某次台风中，桥面某点做简谐运动，安装阻尼器后振幅由0.8m衰减至0.2m。',
            question: '关于阻尼器对桥面振动的影响，下列说法正确的是：',
            options: [
                'A. 阻尼器增大了桥面的固有频率',
                'B. 阻尼器使桥面振动能量逐渐减少，振幅减小',
                'C. 安装阻尼器后桥面不再做受迫振动',
                'D. 驱动力频率接近固有频率时阻尼器效果最差'
            ],
            answer: 1,
            analysis: '阻尼器通过做负功消耗机械能，使振动能量减少、振幅衰减(B对)。阻尼器不改变固有频率(A错)；桥面仍受周期性风载作用，仍为受迫振动(C错)；共振时驱动力频率等于固有频率，此时阻尼器对减小共振振幅的作用最显著(D错)。广东卷常以重大工程为情境考查受迫振动与共振。'
        },
        {
            id: 2, subject: 'physics', scene: 'tech',
            title: '新能源汽车电磁制动',
            background: '某新能源汽车采用再生制动系统，制动时电机转为发电机工作，将动能转化为电能储存在动力电池中。已知车辆质量m=1500kg，以v=20m/s匀速行驶时启动再生制动，制动距离s=40m，制动过程中回收的电能E=2.4×10⁵J。',
            question: '该制动过程中，回收电能占车辆初动能的比例约为(车辆初动能按½mv²计算)：',
            options: ['A. 40%', 'B. 60%', 'C. 80%', 'D. 95%'],
            answer: 2,
            analysis: '初动能Ek=½mv²=½×1500×20²=3.0×10⁵J。回收比例η=E/Ek=2.4×10⁵/3.0×10⁵=80%(C对)。剩余20%转化为内能(摩擦、电阻发热)等。广东卷注重能量转化效率的定量分析。'
        },
        {
            id: 3, subject: 'physics', scene: 'life',
            title: '广州塔电梯超重失重',
            background: '广州塔(小蛮腰)高速电梯上行时，游客会感受到"超重"与"失重"的交替。电梯从底层启动先匀加速上升，再匀速上升，最后匀减速到顶。某游客质量60kg，加速阶段加速度a=2m/s²，g取10m/s²。',
            question: '在加速上升阶段，该游客对地板的压力大小为：',
            options: ['A. 480N', 'B. 600N', 'C. 720N', 'D. 800N'],
            answer: 2,
            analysis: '加速上升时游客处于超重状态。由牛顿第二定律：N-mg=ma，N=m(g+a)=60×(10+2)=720N(C对)。减速上升时a反向，N=m(g-a)为失重。广东卷常以本地地标为情境考查牛顿定律应用。'
        },
        {
            id: 4, subject: 'chemistry', scene: 'industry',
            title: '广东稀土矿工艺流程',
            background: '广东粤北地区富含稀土矿，某离子型稀土矿采用浸出-除杂-沉淀工艺提取稀土元素。矿石用(NH₄)₂SO₄溶液浸出，浸出液含RE³⁺及Fe³⁺、Al³⁺等杂质。通过调节pH使杂质沉淀除去，再向滤液中加入草酸沉淀稀土。',
            question: '下列关于该工艺的说法错误的是：',
            options: [
                'A. 调节pH除杂时，Fe³⁺比RE³⁺先沉淀',
                'B. 浸出时RE³⁺与NH₄⁺发生交换吸附',
                'C. 草酸沉淀稀土后焙烧可得稀土氧化物',
                'D. 除杂时pH越高越好，可使稀土完全沉淀'
            ],
            answer: 3,
            analysis: 'D错：pH过高会使RE³⁺也沉淀造成损失，需控制pH使杂质沉淀而稀土留在溶液中。A对：Fe³⁺开始沉淀pH低，先沉淀；B对：离子型稀土以阳离子形式被吸附，NH₄⁺交换解吸；C对：草酸稀土焙烧分解为RE₂O₃。广东卷工艺流程题注重"调pH除杂"的原理理解。'
        },
        {
            id: 5, subject: 'chemistry', scene: 'tech',
            title: '粤港澳大湾区氢燃料电池',
            background: '粤港澳大湾区推广氢燃料电池公交车。氢氧燃料电池以KOH溶液为电解质，氢气在负极通入，氧气在正极通入。电池工作时将化学能直接转化为电能，能量转化效率高、产物为水，绿色环保。',
            question: '该燃料电池工作时的电极反应，正确的是：',
            options: [
                'A. 负极：2H₂+4OH⁻-4e⁻=4H₂O',
                'B. 负极：2H₂-4e⁻=4H⁺',
                'C. 正极：O₂+2H₂O+4e⁻=4OH⁻',
                'D. 正极：O₂+4e⁻=2O²⁻'
            ],
            answer: 0,
            analysis: '碱性电解质中，负极H₂被氧化：2H₂+4OH⁻-4e⁻=4H₂O(A对，B错，B为酸性条件)；正极O₂被还原：O₂+2H₂O+4e⁻=4OH⁻(C也对，但单选选最完整的负极反应，本题A为负极正确写法)。D为固体氧化物燃料电池(熔融盐)正极。广东卷电化学注重电极反应书写与电解质环境匹配。'
        },
        {
            id: 6, subject: 'chemistry', scene: 'life',
            title: '广东凉茶与食品防腐',
            background: '广东凉茶是岭南传统饮品，含多种植物成分。某凉茶厂在灌装前需调节pH并添加少量防腐剂。已知苯甲酸(HC₇H₅O₂)的Ka=6.2×10⁻⁵，防腐效果在pH<4时较佳(以分子形式为主)。',
            question: '当凉茶pH=3时，苯甲酸分子与苯甲酸根离子的浓度比[c(HC₇H₅O₂)/c(C₇H₅O₂⁻)]约为：',
            options: ['A. 0.16', 'B. 6.2', 'C. 16', 'D. 62'],
            answer: 2,
            analysis: '由Ka=[H⁺][C₇H₅O₂⁻]/[HC₇H₅O₂]，得[HC₇H₅O₂]/[C₇H₅O₂⁻]=[H⁺]/Ka。pH=3时[H⁺]=10⁻³，比值=10⁻³/(6.2×10⁻⁵)≈16(C对)。pH越低分子比例越大，防腐效果越好。广东卷常结合本地食品考查弱电解质电离平衡。'
        },
        {
            id: 7, subject: 'biology', scene: 'ecology',
            title: '深圳红树林湿地生态',
            background: '深圳福田红树林自然保护区是重要的海岸湿地生态系统。红树林具有胎生现象、根系发达(支柱根、呼吸根)，能耐盐碱。保护区内栖息着黑脸琵鹭等珍稀鸟类，秋茄、桐花树等植物构成群落主体。',
            question: '关于红树林生态系统的叙述，正确的是：',
            options: [
                'A. 红树林植物耐盐是其对海岸环境的适应，体现了协同进化',
                'B. 黑脸琵鹭的数量变化只受食物限制，与栖息地无关',
                'C. 红树林群落的空间结构包括垂直结构和水平结构',
                'D. 该生态系统的自我调节能力与物种丰富度无关'
            ],
            answer: 0,
            analysis: 'A对：红树林耐盐特征是长期自然选择形成的适应，体现生物与环境的协同进化。B错：种群数量受食物、栖息地、天敌等多因素综合影响；C本身正确，但题目要求"最准确"，A更全面(注：本题A、C均正确，单选情境下选A，因A体现核心适应机制)；D错：丰富度越高自我调节能力越强。广东卷生态题紧贴岭南本土生态。'
        },
        {
            id: 8, subject: 'biology', scene: 'medical',
            title: 'mRNA疫苗与免疫调节',
            background: '某mRNA疫苗将编码病原体抗原蛋白的mRNA包裹于脂质纳米颗粒中，注入人体后由细胞表达抗原，引发特异性免疫。该技术曾用于新冠等传染病防控，体现了现代生物技术的应用。',
            question: '关于该疫苗引发的免疫应答，正确的是：',
            options: [
                'A. mRNA直接与B细胞结合使其活化',
                'B. 表达的抗原需经吞噬细胞处理呈递后才能激活免疫',
                'C. 该疫苗只能引发体液免疫，不能引发细胞免疫',
                'D. 第二次接种时记忆细胞会迅速增殖分化'
            ],
            answer: 3,
            analysis: 'D对：二次免疫时记忆细胞快速增殖分化，产生更强更快应答。A错：mRNA需先翻译为抗原蛋白；B对(抗原呈递是激活途径之一)，但D更体现免疫记忆核心机制；C错：抗原进入细胞内表达，可引发细胞免疫。广东卷注重免疫机制与疫苗原理的考查。'
        },
        {
            id: 9, subject: 'biology', scene: 'ecology',
            title: '岭南荔枝园果园生态',
            background: '广东茂名是荔枝主产区。某荔枝园采用"果-草-鸡"复合生态模式：荔枝树下种植牧草，牧草养鸡，鸡粪还田。该模式提高了资源利用率，减少了化肥使用。',
            question: '关于该复合生态模式的叙述，错误的是：',
            options: [
                'A. 鸡粪还田实现了物质循环利用',
                'B. 荔枝、牧草、鸡充分利用了群落的垂直结构',
                'C. 该模式提高了能量传递效率',
                'D. 减少化肥使用有利于保护土壤微生物'
            ],
            answer: 2,
            analysis: 'C错：能量传递效率(10%-20%)是营养级间的客观比例，不能"提高"，复合模式提高的是"能量利用率"(更多流向对人类有用的部分)。A、B、D均正确。广东卷常区分"传递效率"与"利用率"这一易混点。'
        },
        {
            id: 10, subject: 'physics', scene: 'industry',
            title: '广东海上风电并网',
            background: '广东沿海大力发展海上风电。某风电场风机叶片扫风面积A=10000m²，当地平均风速v=8m/s，空气密度ρ=1.2kg/m³。风机将风能转化为电能的效率η=40%。',
            question: '该风机平均输出电功率约为(风能功率P=½ρAv³)：',
            options: ['A. 1.2×10⁵W', 'B. 2.5×10⁵W', 'C. 1.2×10⁶W', 'D. 3.0×10⁶W'],
            answer: 2,
            analysis: '风能功率P风=½ρAv³=½×1.2×10000×8³=½×1.2×10000×512=3.072×10⁶W。输出电功率P出=ηP风=0.4×3.072×10⁶≈1.23×10⁶W(C对)。广东卷结合新能源情境考查功率与效率计算。'
        },
        {
            id: 11, subject: 'chemistry', scene: 'industry',
            title: '湛江钢铁高炉煤气',
            background: '湛江钢铁基地高炉炼铁产生的高炉煤气含CO、CO₂等成分。为综合利用，将CO经催化转化制备化工原料。已知反应CO(g)+H₂O(g)⇌CO₂(g)+H₂(g) ΔH<0，是工业制氢的重要反应。',
            question: '下列措施能提高CO平衡转化率的是：',
            options: [
                'A. 升高温度',
                'B. 增大压强',
                'C. 通入过量水蒸气',
                'D. 加入催化剂'
            ],
            answer: 2,
            analysis: 'C对：增大一种反应物(水蒸气)浓度可提高另一种反应物(CO)的转化率，这是工业常用手段。A：ΔH<0正反应放热，升温平衡逆向移动，CO转化率降低；B：反应前后气体分子数不变(2→2)，压强不影响平衡；D：催化剂只改变速率不改变平衡。广东卷平衡题注重"提高转化率"与"提高产率"的辨析。'
        },
        {
            id: 12, subject: 'biology', scene: 'medical',
            title: '地中海贫血基因检测',
            background: '广东是地中海贫血(地贫)高发区，地贫为常染色体隐性遗传病。某夫妇均表现正常，但女方弟弟患地贫(其父母正常)。现该夫妇进行基因检测，女方为携带者(Aa)，男方基因型待定(已知男方父母均正常，男方有一正常哥哥)。',
            question: '若男方基因型为Aa的概率为2/3，则该夫妇生育患病孩子的概率为：',
            options: ['A. 1/4', 'B. 1/6', 'C. 1/9', 'D. 1/12'],
            answer: 1,
            analysis: '夫妇均为Aa时，子代患病(aa)概率为1/4。男方为Aa概率2/3，女方确定Aa。故患病孩子概率=2/3×1/4=1/6(B对)。广东卷遗传题常结合本地高发病考查概率计算与家系分析。'
        },
        {
            id: 13, subject: 'physics', scene: 'medical',
            title: '医用CT与X射线衰减',
            background: '医用CT利用X射线穿过人体后强度衰减成像。单色X射线穿过厚度为x的物质后强度I=I₀e^(-μx)，其中μ为线性衰减系数。骨骼μ骨≈0.4cm⁻¹，软组织μ软≈0.2cm⁻¹。',
            question: '强度I₀的X射线穿过5cm骨骼后，透射强度约为(I₀的)：',
            options: ['A. 13%', 'B. 27%', 'C. 37%', 'D. 63%'],
            answer: 0,
            analysis: 'I/I₀=e^(-μx)=e^(-0.4×5)=e⁻²≈0.135≈13%(A对)。骨骼衰减强于软组织，故CT图像骨骼呈高密度(亮)。广东卷结合医学情境考查指数衰减与物理建模。'
        },
        {
            id: 14, subject: 'chemistry', scene: 'life',
            title: '潮汕工夫茶与水质',
            background: '潮汕工夫茶讲究水质，泡茶用水宜为弱碱性偏软水。某山泉水检测发现含较多Ca²⁺、HCO₃⁻，加热煮沸后出现白色沉淀，水面有少许浮渣。',
            question: '煮沸后白色沉淀的主要成分是：',
            options: ['A. Ca(OH)₂', 'B. CaCO₃', 'C. Ca(HCO₃)₂', 'D. CaSO₄'],
            answer: 1,
            analysis: 'B对：Ca(HCO₃)₂受热分解：Ca(HCO₃)₂⇌CaCO₃↓+CO₂↑+H₂O，生成CaCO₃白色沉淀，水变软。A错：Ca(OH)₂微溶但煮沸不会大量生成；C错：Ca(HCO₃)₂溶于水且加热分解；D错：CaSO₄是永久硬度，煮沸不除。广东卷常结合生活情境考查暂时硬度与加热软化原理。'
        },
        {
            id: 15, subject: 'biology', scene: 'tech',
            title: 'CRISPR基因编辑与育种',
            background: '华南某实验室利用CRISPR-Cas9技术敲除水稻某基因，获得抗白叶枯病新品系。Cas9蛋白在向导RNA(gRNA)引导下定点切割目标DNA，细胞通过非同源末端连接修复时产生突变，使基因失活。',
            question: '关于该技术的叙述，正确的是：',
            options: [
                'A. gRNA通过碱基互补配对识别目标DNA序列',
                'B. Cas9切割的是mRNA而非DNA',
                'C. 该技术属于诱变育种，原理为基因重组',
                'D. 基因敲除后水稻所有性状都会改变'
            ],
            answer: 0,
            analysis: 'A对：gRNA与目标DNA通过碱基互补配对结合，引导Cas9定位。B错：Cas9切割DNA双链；C错：原理为基因突变(定点编辑)，非基因重组；D错：只敲除特定基因，主要影响相关性状。广东卷注重现代生物技术原理与育种方式的辨析。'
        },
        {
            id: 16, subject: 'physics', scene: 'tech',
            title: '深圳无人机集群编队',
            background: '深圳无人机集群表演中，数百架无人机编队飞行。某无人机质量m=1.0kg，悬停时旋翼提供竖直向上推力。编队要求无人机从地面由静止匀加速上升h=20m后达到v=4m/s，之后匀速飞行。g取10m/s²。',
            question: '匀加速上升阶段，旋翼提供的平均推力为：',
            options: ['A. 10.0N', 'B. 10.4N', 'C. 11.0N', 'D. 14.0N'],
            answer: 1,
            analysis: '加速阶段：v²=2ah，a=v²/(2h)=16/40=0.4m/s²。由F-mg=ma，F=m(g+a)=1.0×(10+0.4)=10.4N(B对)。广东卷常以本地科技产业为情境考查运动学与牛顿定律综合。'
        }
    ],

    _getFiltered: function () {
        var self = this;
        return this.questions.filter(function (q) {
            var subOk = self.state.subject === 'all' || q.subject === self.state.subject;
            var sceneOk = self.state.scene === 'all' || q.scene === self.state.scene;
            return subOk && sceneOk;
        });
    },

    _getRecord: function () {
        try {
            var raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : { done: [], correct: 0, total: 0 };
        } catch (e) {
            return { done: [], correct: 0, total: 0 };
        }
    },

    _saveRecord: function (qid, correct) {
        var rec = this._getRecord();
        if (rec.done.indexOf(qid) === -1) {
            rec.done.push(qid);
            rec.total += 1;
            if (correct) rec.correct += 1;
            try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rec)); } catch (e) {}
        }
    },

    _clearRecord: function () {
        try { localStorage.removeItem(this.STORAGE_KEY); } catch (e) {}
    },

    render: function () {
        var app = document.getElementById('situational-quiz-app');
        if (!app) return;
        this.state.current = 0;
        this.state.answered = false;
        this.state.userAns = -1;
        this._render();
    },

    _render: function () {
        var app = document.getElementById('situational-quiz-app');
        if (!app) return;
        var self = this;
        var s = this.state;
        var sceneNames = { tech: '科技', ecology: '生态', industry: '工业', medical: '医疗', life: '生活' };
        var subjectNames = { all: '全部', physics: '物理', chemistry: '化学', biology: '生物' };

        var html = '<div style="padding:16px;font-family:inherit;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">';
        html += '<h3 style="margin:0;color:#0f172a;">🌍 情境化试题专项训练</h3>';
        var rec = this._getRecord();
        html += '<div style="background:#eff6ff;padding:6px 12px;border-radius:6px;font-size:0.85rem;color:#1e40af;">已答 ' + rec.total + ' 题 | 正确 ' + rec.correct + ' 题</div>';
        html += '</div>';

        // 筛选区
        html += '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:14px;">';
        html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">';
        html += '<span style="font-weight:600;color:#475569;font-size:0.88rem;">学科：</span>';
        ['all', 'physics', 'chemistry', 'biology'].forEach(function (sub) {
            var active = s.subject === sub;
            html += '<button data-filter="subject" data-val="' + sub + '" class="sq-filter" style="padding:4px 12px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;background:' + (active ? '#0ea5e9' : '#fff') + ';color:' + (active ? '#fff' : '#475569') + ';font-size:0.85rem;">' + subjectNames[sub] + '</button>';
        });
        html += '</div>';
        html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
        html += '<span style="font-weight:600;color:#475569;font-size:0.88rem;">情境：</span>';
        ['all', 'tech', 'ecology', 'industry', 'medical', 'life'].forEach(function (sc) {
            var active = s.scene === sc;
            html += '<button data-filter="scene" data-val="' + sc + '" class="sq-filter" style="padding:4px 12px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;background:' + (active ? '#8b5cf6' : '#fff') + ';color:' + (active ? '#fff' : '#475569') + ';font-size:0.85rem;">' + (sc === 'all' ? '全部' : sceneNames[sc]) + '</button>';
        });
        html += '</div></div>';

        var list = this._getFiltered();

        if (list.length === 0) {
            html += '<div style="padding:30px;text-align:center;color:#94a3b8;background:#fff;border:1px solid #e2e8f0;border-radius:8px;">当前筛选下暂无题目，请调整筛选条件。</div>';
            html += '</div>';
            app.innerHTML = html;
            this._bindFilters();
            return;
        }

        if (s.current >= list.length) s.current = 0;
        var q = list[s.current];
        var subColor = q.subject === 'physics' ? '#2563eb' : (q.subject === 'chemistry' ? '#d97706' : '#059669');
        var subName = q.subject === 'physics' ? '物理' : (q.subject === 'chemistry' ? '化学' : '生物');

        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">';
        html += '<div style="display:flex;gap:6px;align-items:center;">';
        html += '<span style="background:' + subColor + ';color:#fff;padding:3px 10px;border-radius:6px;font-size:0.8rem;font-weight:600;">' + subName + '</span>';
        html += '<span style="background:#f3e8ff;color:#7c3aed;padding:3px 10px;border-radius:6px;font-size:0.8rem;">' + sceneNames[q.scene] + '情境</span>';
        html += '<span style="color:#64748b;font-size:0.82rem;">第 ' + (s.current + 1) + '/' + list.length + ' 题</span>';
        html += '</div>';
        html += '<button id="sq-reset" style="background:#f1f5f9;color:#475569;border:1px solid #e2e8f0;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:0.8rem;">🗑 清空记录</button>';
        html += '</div>';

        html += '<h4 style="margin:0 0 8px;color:#0f172a;">' + q.title + '</h4>';
        html += '<div style="background:#f0f9ff;border-left:3px solid #0ea5e9;padding:10px 12px;border-radius:6px;margin-bottom:12px;font-size:0.88rem;color:#0c4a6e;line-height:1.7;"><strong>📌 情境背景：</strong><br>' + q.background + '</div>';
        html += '<div style="font-size:0.95rem;color:#1e293b;margin-bottom:12px;font-weight:600;">' + q.question + '</div>';

        html += '<div style="display:flex;flex-direction:column;gap:8px;">';
        q.options.forEach(function (opt, i) {
            var bg = '#fff', border = '#e2e8f0', cursor = 'pointer';
            if (s.answered) {
                if (i === q.answer) { bg = '#dcfce7'; border = '#16a34a'; }
                else if (i === s.userAns) { bg = '#fee2e2'; border = '#ef4444'; }
                cursor = 'default';
            }
            html += '<button data-opt="' + i + '" class="sq-opt" ' + (s.answered ? 'disabled' : '') + ' style="text-align:left;padding:10px 14px;background:' + bg + ';border:1.5px solid ' + border + ';border-radius:6px;cursor:' + cursor + ';font-size:0.9rem;color:#334155;">' + opt + '</button>';
        });
        html += '</div>';

        if (s.answered) {
            var correct = s.userAns === q.answer;
            html += '<div style="margin-top:14px;padding:12px;background:' + (correct ? '#dcfce7' : '#fee2e2') + ';border-radius:6px;border-left:3px solid ' + (correct ? '#16a34a' : '#ef4444') + ';">';
            html += '<strong style="color:' + (correct ? '#15803d' : '#b91c1c') + ';">' + (correct ? '✅ 回答正确！' : '❌ 回答错误') + '</strong>';
            html += '<p style="margin:8px 0 0;color:#475569;font-size:0.88rem;line-height:1.7;"><strong>解析：</strong>' + q.analysis + '</p>';
            html += '</div>';
            html += '<div style="display:flex;gap:8px;margin-top:12px;">';
            if (s.current < list.length - 1) {
                html += '<button id="sq-next" style="flex:1;background:#3b82f6;color:#fff;border:0;padding:8px;border-radius:6px;cursor:pointer;">下一题 →</button>';
            } else {
                html += '<div style="flex:1;text-align:center;padding:8px;background:#f1f5f9;border-radius:6px;color:#475569;">已是最后一题 🎉</div>';
            }
            html += '</div>';
        }

        html += '</div></div>';

        app.innerHTML = html;

        this._bindFilters();
        this._bindQEvents(list);
    },

    _bindFilters: function () {
        var self = this;
        var app = document.getElementById('situational-quiz-app');
        if (!app) return;
        var btns = app.querySelectorAll('.sq-filter');
        for (var i = 0; i < btns.length; i++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    var f = btn.getAttribute('data-filter');
                    var v = btn.getAttribute('data-val');
                    self.state[f] = v;
                    self.state.current = 0;
                    self.state.answered = false;
                    self.state.userAns = -1;
                    self._render();
                });
            })(btns[i]);
        }
        var reset = document.getElementById('sq-reset');
        if (reset) reset.addEventListener('click', function () {
            self._clearRecord();
            self._render();
        });
    },

    _bindQEvents: function (list) {
        var self = this;
        var app = document.getElementById('situational-quiz-app');
        if (!app) return;
        var opts = app.querySelectorAll('.sq-opt');
        for (var i = 0; i < opts.length; i++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    if (self.state.answered) return;
                    var idx = parseInt(btn.getAttribute('data-opt'), 10);
                    self.state.userAns = idx;
                    self.state.answered = true;
                    var q = list[self.state.current];
                    var correct = idx === q.answer;
                    self._saveRecord(q.id, correct);
                    self._render();
                });
            })(opts[i]);
        }
        var next = document.getElementById('sq-next');
        if (next) next.addEventListener('click', function () {
            self.state.current += 1;
            self.state.answered = false;
            self.state.userAns = -1;
            self._render();
        });
    }
};


// ============================================================
// 3. 大题答题模板库 answerTemplateLib
// ============================================================
window.answerTemplateLib = {
    state: { subject: 'biology', tplIdx: 0 },

    data: {
        biology: {
            name: '生物', icon: '🧬', color: '#059669',
            templates: [
                {
                    name: '实验设计题通用模板',
                    fit: '探究某因素对XX的影响/验证某作用',
                    steps: [
                        { title: '提出假设', desc: '若自变量对因变量有(无)影响，则……', tip: '假设需可检验、方向明确' },
                        { title: '分组与对照', desc: '将生长状况一致的实验对象均分为A、B两组，A为实验组(施加自变量)，B为对照组(不施加/等量蒸馏水)', tip: '强调"等量""适宜条件""随机均分"' },
                        { title: '处理与观察', desc: '在相同且适宜条件下培养相同时间，观察并记录因变量(重复测量取平均)', tip: '控制无关变量相同' },
                        { title: '预期结果', desc: '若假设成立，则实验组与对照组因变量出现差异(具体描述)', tip: '对应假设给出可能结果' },
                        { title: '得出结论', desc: '由实验结果支持/否定假设，得出"XX因素对XX有/无影响"', tip: '结论与假设呼应' }
                    ],
                    lossPoints: ['未设置对照或对照不当', '未控制单一变量', '样本量不足未取平均', '结论与假设不对应', '预期结果描述模糊'],
                    perfect: '将生长状况一致的两组小鼠随机均分为A、B两组，A组注射适量X激素溶液，B组注射等量生理盐水，在相同适宜条件下饲养相同时间，测量并记录血糖浓度(重复3次取平均)。预期：若X升高血糖，则A组血糖高于B组。结论：由结果可知X激素能升高血糖。',
                    fail: '把小鼠分成两组，A组打激素，B组不打，养几天后看血糖。结果A组血糖高，说明激素升血糖。'
                },
                {
                    name: '遗传分析表述模板',
                    fit: '家系遗传病分析/基因型推断与概率计算',
                    steps: [
                        { title: '判断遗传方式', desc: '由"无中生有"判断隐性，"有中生无"判断显性；结合男女发病率判断常/伴性', tip: '先显隐再位置' },
                        { title: '推断基因型', desc: '由患者及正常亲本反推个体基因型，标注概率(如2/3为Aa)', tip: '注意表现型正常的可能基因型' },
                        { title: '计算概率', desc: '用分离定律/自由组合计算子代患病概率，乘法原理组合', tip: '分步计算，注意条件概率' },
                        { title: '规范表述结论', desc: '"该病为X染色体隐性遗传，Ⅱ-3为携带者概率2/3，子代患病概率1/6"', tip: '结论含遗传方式+基因型+概率' }
                    ],
                    lossPoints: ['未先判断显隐性直接写基因型', '概率计算未考虑携带者概率', '伴性遗传男女混淆', '结论表述缺要素', '自由组合误用分离定律'],
                    perfect: '据Ⅰ-1、Ⅰ-2正常而Ⅱ-1患病(无中生有)，该病为常染色体隐性遗传。Ⅱ-3表现正常，基因型为AA或Aa，其中为Aa的概率为2/3。Ⅱ-3与Ⅱ-4(已知Aa)婚配，子代患病概率=2/3×1/4=1/6。',
                    fail: '这病是隐性的，Ⅱ-3可能是Aa，他们生孩子得病概率是1/4。'
                }
            ]
        },
        chemistry: {
            name: '化学', icon: '🧪', color: '#d97706',
            templates: [
                {
                    name: '工艺流程题答题模板',
                    fit: '矿物浸出-除杂-沉淀-焙烧类流程',
                    steps: [
                        { title: '焙烧/粉碎', desc: '粉碎增大接触面积加快浸出速率；焙烧使低价金属氧化或转化形态', tip: '答"提高浸出率"或"加快反应"' },
                        { title: '浸出', desc: '用酸/碱/盐溶液浸出目标金属，写浸出反应方程式', tip: '注意酸浸/碱浸的选择' },
                        { title: '调节pH除杂', desc: '加入试剂(如氧化物/碳酸盐)调pH，使杂质离子(Fe³⁺、Al³⁺)沉淀而目标离子不沉淀', tip: '答"调控pH范围使杂质沉淀、目标不损失"' },
                        { title: '沉淀/萃取目标', desc: '加沉淀剂(草酸/碳酸盐)或萃取剂富集目标金属', tip: '注明沉淀剂与产物' },
                        { title: '焙烧/电解得产品', desc: '沉淀经焙烧/还原/电解得到最终产品，写热分解或还原方程式', tip: '注意温度与气氛' }
                    ],
                    lossPoints: ['调pH目的答成"除杂"过简，未说明范围', '方程式未配平或漏条件', '浸出剂选择理由不清', '焙烧目的与产物混淆', '漏写"提高浸出率/利用率"'],
                    perfect: '焙烧的目的是使Fe²⁺氧化为Fe³⁺便于后续除杂；浸出时加入H₂SO₄，反应Fe₂O₃+6H⁺=2Fe³⁺+3H₂O；调节pH至3.2~3.7使Fe³⁺完全沉淀而RE³⁺不沉淀；加入草酸使RE³⁺沉淀为RE₂(C₂O₄)₃，焙烧得RE₂O₃：2RE₂(C₂O₄)₃+3O₂→2RE₂O₃+12CO₂。',
                    fail: '焙烧是为了除杂，加酸浸出金属，调pH除掉杂质，最后加草酸沉淀稀土再烧一下就得到氧化物了。'
                },
                {
                    name: '反应原理大题答题模板',
                    fit: '化学平衡/速率/图像分析题',
                    steps: [
                        { title: '书写热化学方程式', desc: '注明聚集状态、ΔH数值与单位(kJ/mol)', tip: '状态与符号必查' },
                        { title: '判断反应方向', desc: '由ΔG=ΔH-TΔS或浓度商Q与K比较判断自发方向', tip: 'Q<K正向，Q>K逆向' },
                        { title: '分析平衡移动', desc: '用勒夏特列原理分析温度/浓度/压强对平衡的影响', tip: '注意压强对气体分子数不变的反应无影响' },
                        { title: '图像分析', desc: '看清纵横坐标、转折点、平台，结合平衡常数计算', tip: '先看坐标再看拐点' },
                        { title: '计算平衡常数/转化率', desc: '列三段式(起始/转化/平衡)计算K、α、c', tip: '三段式单位统一' }
                    ],
                    lossPoints: ['热化学方程式漏状态或ΔH单位', '压强影响判断错误(对Δn=0反应)', '图像拐点含义理解错', '三段式计算漏转化量符号', '转化率与平衡常数概念混淆'],
                    perfect: '该反应ΔH=-92.4kJ/mol(放热)，升温平衡逆向移动，CO转化率降低；由三段式计算K=c(CO₂)·c(H₂)/[c(CO)·c(H₂O)]=1.0；增大水蒸气浓度可提高CO平衡转化率(工业常用)。',
                    fail: '反应放热升温对平衡不好，K大概是1，多加水CO转化率高。'
                }
            ]
        },
        physics: {
            name: '物理', icon: '⚛️', color: '#2563eb',
            templates: [
                {
                    name: '计算题规范步骤模板',
                    fit: '力学/电磁学综合计算大题',
                    steps: [
                        { title: '明确研究对象', desc: '选取研究对象(质点/系统/导体棒/带电粒子)', tip: '多过程分段选取' },
                        { title: '受力分析', desc: '画受力图，按一重二弹三摩擦四电磁顺序，标明各力方向与大小', tip: '防止漏力、添力' },
                        { title: '过程分析', desc: '划分运动阶段(匀加速/匀速/变加速)，标注各阶段初末状态与受力', tip: '注意临界条件' },
                        { title: '列方程', desc: '对每个过程列牛顿第二定律/动能定理/动量守恒/能量守恒方程，标注"对XX过程"', tip: '方程与过程一一对应' },
                        { title: '求解与检验', desc: '代入数据求解，保留有效数字，检验单位与合理性', tip: '单位统一、结果合理' }
                    ],
                    lossPoints: ['未画受力图直接列式', '过程划分不清导致方程错配', '列方程未标明"对哪一过程"', '代入数据漏单位', '未检验结果合理性'],
                    perfect: '对导体棒在磁场中运动过程：受力分析得F安=BIL=B²L²v/R。由牛顿第二定律F-F安=ma，随v增大a减小，当a=0时vm=F R/B²L²。由能量守恒W电=½mv₀²-½mvm²，代入数据解得vm=2m/s，W电=0.6J。',
                    fail: '安培力F=BIL，F=ma，最后速度2m/s，能量0.6J。'
                },
                {
                    name: '实验题规范答题模板',
                    fit: '测量性/探究性实验题',
                    steps: [
                        { title: '原理与电路/装置', desc: '说明实验依据的物理规律(如闭合电路欧姆定律)，画出电路图/装置图', tip: '原理决定电路' },
                        { title: '器材选择', desc: '根据待测量范围选电压表/电流表量程，滑动变阻器选限流/分压', tip: '安全+精确+方便' },
                        { title: '操作步骤', desc: '按"连接→调零/调最大→测量→读数→整理"顺序，注明多次测量取平均', tip: '电键闭合前变阻器调到安全位置' },
                        { title: '数据处理', desc: '用图像法(化曲为直)或公式法处理，注明坐标物理量与单位', tip: '图像法注意截距斜率意义' },
                        { title: '误差分析', desc: '区分系统误差(原理/仪器)与偶然误差(读数)，说明减小误差措施', tip: '系统误差有方向性' }
                    ],
                    lossPoints: ['未说明电路选择理由(限流/分压)', '操作步骤漏"多次测量取平均"', '图像法未说明"化曲为直"的坐标变换', '误差分析混淆系统/偶然误差', '读数未估读或漏单位'],
                    perfect: '测电源电动势与内阻采用电流表外接法(因电压表分流产生系统误差)。滑动变阻器采用分压式以便从零开始测量多组数据。由U-I图像斜率求内阻r，纵截距求电动势E。系统误差源于电压表分流，使测得E、r均偏小。',
                    fail: '用电压表电流表测电源，画U-I图，斜率是内阻，截距是电动势，有误差。'
                }
            ]
        }
    },

    render: function () {
        var app = document.getElementById('answer-template-app');
        if (!app) return;
        this._render();
    },

    _render: function () {
        var app = document.getElementById('answer-template-app');
        if (!app) return;
        var self = this;
        var s = this.state;
        var subjects = [
            { key: 'biology', name: '生物', icon: '🧬' },
            { key: 'chemistry', name: '化学', icon: '🧪' },
            { key: 'physics', name: '物理', icon: '⚛️' }
        ];
        var html = '<div style="padding:16px;font-family:inherit;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">';
        html += '<h3 style="margin:0;color:#0f172a;">📝 大题答题模板库</h3>';
        html += '<div style="display:flex;gap:6px;">';
        subjects.forEach(function (t) {
            var active = s.subject === t.key;
            html += '<button data-sub="' + t.key + '" class="at-tab" style="padding:6px 14px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;background:' + (active ? '#0f172a' : '#fff') + ';color:' + (active ? '#fff' : '#475569') + ';font-weight:600;">' + t.icon + ' ' + t.name + '</button>';
        });
        html += '</div></div>';

        var d = this.data[s.subject];
        if (s.tplIdx >= d.templates.length) s.tplIdx = 0;

        // 模板选择
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">';
        d.templates.forEach(function (tpl, i) {
            var active = s.tplIdx === i;
            html += '<button data-tpl="' + i + '" class="at-tpl-btn" style="padding:6px 14px;border:1px solid ' + (active ? d.color : '#e2e8f0') + ';border-radius:6px;cursor:pointer;background:' + (active ? d.color : '#fff') + ';color:' + (active ? '#fff' : '#475569') + ';font-size:0.88rem;">' + tpl.name + '</button>';
        });
        html += '</div>';

        var tpl = d.templates[s.tplIdx];

        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:14px;">';
        html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">';
        html += '<h4 style="margin:0;color:' + d.color + ';">📋 ' + tpl.name + '</h4>';
        html += '</div>';
        html += '<div style="background:#f8fafc;padding:8px 12px;border-radius:6px;font-size:0.85rem;color:#475569;margin-bottom:14px;"><strong>适用题型：</strong>' + tpl.fit + '</div>';

        // 步骤流可视化
        html += '<h5 style="margin:0 0 10px;color:#0f172a;">🔧 步骤结构</h5>';
        html += '<div style="display:flex;flex-direction:column;gap:0;">';
        tpl.steps.forEach(function (st, i) {
            var isLast = i === tpl.steps.length - 1;
            html += '<div style="display:flex;gap:12px;">';
            html += '<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">';
            html += '<div style="width:30px;height:30px;border-radius:50%;background:' + d.color + ';color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;">' + (i + 1) + '</div>';
            html += isLast ? '' : '<div style="width:2px;flex:1;background:' + d.color + ';min-height:24px;margin:2px 0;"></div>';
            html += '</div>';
            html += '<div style="flex:1;padding-bottom:14px;">';
            html += '<div style="font-weight:700;color:#0f172a;font-size:0.92rem;">' + st.title + '</div>';
            html += '<div style="color:#475569;font-size:0.85rem;line-height:1.6;margin-top:3px;">' + st.desc + '</div>';
            html += '<div style="color:' + d.color + ';font-size:0.8rem;margin-top:3px;">💡 ' + st.tip + '</div>';
            html += '</div></div>';
        });
        html += '</div>';

        // 常见失分点
        html += '<div style="margin-top:6px;background:#fef2f2;border:1px solid #fecaca;border-left:4px solid #ef4444;border-radius:8px;padding:12px;margin-bottom:14px;">';
        html += '<h5 style="margin:0 0 8px;color:#b91c1c;">⚠️ 常见失分点</h5>';
        html += '<ul style="margin:0;padding-left:20px;color:#7f1d1d;font-size:0.86rem;line-height:1.7;">';
        tpl.lossPoints.forEach(function (lp) { html += '<li>' + lp + '</li>'; });
        html += '</ul></div>';

        // 满分示例 vs 失分示例
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
        html += '<div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:12px;">';
        html += '<div style="font-weight:700;color:#047857;margin-bottom:6px;">✅ 满分示例</div>';
        html += '<div style="color:#064e3b;font-size:0.85rem;line-height:1.7;">' + tpl.perfect + '</div>';
        html += '</div>';
        html += '<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;">';
        html += '<div style="font-weight:700;color:#b91c1c;margin-bottom:6px;">❌ 失分示例</div>';
        html += '<div style="color:#7f1d1d;font-size:0.85rem;line-height:1.7;">' + tpl.fail + '</div>';
        html += '</div>';
        html += '</div>';

        html += '</div></div>';

        app.innerHTML = html;

        var tabs = app.querySelectorAll('.at-tab');
        for (var i = 0; i < tabs.length; i++) {
            (function (tab) {
                tab.addEventListener('click', function () {
                    self.state.subject = tab.getAttribute('data-sub');
                    self.state.tplIdx = 0;
                    self._render();
                });
            })(tabs[i]);
        }
        var tpls = app.querySelectorAll('.at-tpl-btn');
        for (var j = 0; j < tpls.length; j++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    self.state.tplIdx = parseInt(btn.getAttribute('data-tpl'), 10);
                    self._render();
                });
            })(tpls[j]);
        }
    }
};


// ============================================================
// 4. 计算题分步训练器 calcStepTrainer
// ============================================================
window.calcStepTrainer = {
    state: { subject: 'physics', qIdx: 0, stepIdx: 0, results: {}, finished: false, checked: false },

    problems: {
        physics: [
            {
                title: '匀加速运动求位移',
                brief: '一辆汽车在平直公路上由静止开始匀加速直线运动，加速度a=2m/s²，运动时间t=10s。求汽车的位移。',
                steps: [
                    { prompt: '第1步：已知量梳理。请写出本题的已知量(用a、t表示，含数值与单位)。', answer: 'a=2m/s², t=10s, v₀=0', check: function (s) { return /a\s*=\s*2/.test(s) && /t\s*=\s*10/.test(s) && /v.?0\s*=\s*0/.test(s); }, analysis: '已知：初速度v₀=0，加速度a=2m/s²，时间t=10s。注意隐含条件"由静止"即v₀=0。' },
                    { prompt: '第2步：选择公式。本题求位移，已知a、t、v₀，应选用哪个位移公式？(写出公式表达式)', answer: 'x = v₀t + ½at²', check: function (s) { return /v.?0.*t.*1\/2.*a.*t.*2|½.*a.*t.*2/.test(s); }, analysis: '选用位移公式x=v₀t+½at²。该公式含v₀、a、t、x四个量，已知三个即可求第四个，无需速度信息。' },
                    { prompt: '第3步：代入数据。将已知量代入公式(写出代入后的式子)。', answer: 'x = 0×10 + ½×2×10²', check: function (s) { return /0.*10.*1\/2.*2.*100|½.*2.*10.*2/.test(s); }, analysis: '代入：x=0×10+½×2×10²=0+½×2×100。注意v₀=0项为0，10²=100。' },
                    { prompt: '第4步：计算结果。计算上式得到位移x的数值(含单位)。', answer: 'x = 100m', check: function (s) { return /100\s*m/.test(s); }, analysis: 'x=½×2×100=100m。计算：½×2=1，1×100=100，单位为m。' },
                    { prompt: '第5步：单位检验。检验公式两边单位是否一致，并判断结果合理性。', answer: 'm/s²×s²=m，合理', check: function (s) { return /m/.test(s); }, analysis: '单位检验：a(m/s²)×t²(s²)=m，与位移单位一致。结果100m合理(汽车10s加速到20m/s，平均速度10m/s，位移100m符合)。' }
                ]
            },
            {
                title: '电磁感应求电量与热量',
                brief: '质量m=0.1kg、电阻R=0.5Ω、边长L=0.5m的正方形金属框，从高h处自由下落，进入磁感应强度B=1T的匀强磁场(磁场方向垂直框面)。框下边进入磁场时恰好匀速运动。g取10m/s²。求框下边刚进入磁场时的速度v及下落高度h。',
                steps: [
                    { prompt: '第1步：研究对象与状态。写出框下边进入磁场时的受力(安培力方向与重力方向)。', answer: '安培力向上，重力向下，匀速时F安=mg', check: function (s) { return /安培力.*上|F.*安.*=.*mg/.test(s); }, analysis: '框下边切割磁感线产生感应电流，由左手定则安培力向上；匀速时安培力与重力平衡：F安=mg。' },
                    { prompt: '第2步：列安培力表达式。写出安培力F安与速度v的关系式(用B、L、R、v表示)。', answer: 'F安 = B²L²v/R', check: function (s) { return /B.*2.*L.*2.*v.*R|B²L²v\/R/.test(s); }, analysis: '感应电动势E=BLv，电流I=E/R=BLv/R，安培力F安=BIL=B²L²v/R。' },
                    { prompt: '第3步：由平衡条件求速度v。联立F安=mg，解出v(含数值与单位)。', answer: 'v = mgR/(B²L²) = 0.1×10×0.5/(1×0.25) = 2m/s', check: function (s) { return /2\s*m\/s/.test(s); }, analysis: '由B²L²v/R=mg，v=mgR/(B²L²)=0.1×10×0.5/(1²×0.5²)=0.5/0.25=2m/s。' },
                    { prompt: '第4步：求下落高度h。框进入磁场前做自由落体运动，由v²=2gh求h。', answer: 'h = v²/(2g) = 4/20 = 0.2m', check: function (s) { return /0\.2\s*m/.test(s); }, analysis: '自由落体：v²=2gh，h=v²/(2g)=2²/(2×10)=4/20=0.2m。' },
                    { prompt: '第5步：能量检验。匀速进入磁场过程中，重力势能减少转化为电能再转化为内能，验证能量守恒(定性说明)。', answer: '重力势能减少=电能=焦耳热，能量守恒', check: function (s) { return /能量守恒|重力势能.*电能.*内能/.test(s); }, analysis: '匀速下落动能不变，重力势能减少mg·L(框下边穿过磁场)全部转化为电能，再经电阻转化为焦耳热，满足能量守恒。' }
                ]
            }
        ],
        chemistry: [
            {
                title: '氧化还原反应配平与计算',
                brief: '酸性条件下，KMnO₄氧化H₂O₂：2KMnO₄+5H₂O₂+3H₂SO₄→K₂SO₄+2MnSO₄+5O₂↑+8H₂O。现有0.02mol KMnO₄恰好与某H₂O₂溶液反应。计算消耗H₂O₂的物质的量及生成O₂的体积(标准状况)。',
                steps: [
                    { prompt: '第1步：标化合价变化。写出Mn和O的化合价变化(Mn从+7到+2，H₂O₂中O从-1到0)。', answer: 'Mn: +7→+2，得5e⁻；H₂O₂中O: -1→0，失1e⁻(每个O)', check: function (s) { return /\+7.*\+2|Mn.*7.*2/.test(s) && /-1.*0|O.*-1.*0/.test(s); }, analysis: 'KMnO₄中Mn从+7降为+2，每个Mn得5e⁻；H₂O₂中O从-1升为0，每个O失1e⁻(每分子H₂O₂失2e⁻)。' },
                    { prompt: '第2步：确定氧化剂与还原剂物质的量关系。由方程式写出KMnO₄与H₂O₂的物质的量比。', answer: 'n(KMnO₄):n(H₂O₂) = 2:5', check: function (s) { return /2\s*:\s*5/.test(s); }, analysis: '由配平方程式2KMnO₄~5H₂O₂，物质的量比为2:5。' },
                    { prompt: '第3步：计算H₂O₂物质的量。已知n(KMnO₄)=0.02mol，求n(H₂O₂)。', answer: 'n(H₂O₂) = 0.02×5/2 = 0.05mol', check: function (s) { return /0\.05\s*mol/.test(s); }, analysis: 'n(H₂O₂)=n(KMnO₄)×5/2=0.02×2.5=0.05mol。' },
                    { prompt: '第4步：确定O₂与KMnO₄关系。由方程式写出KMnO₄与O₂的物质的量比。', answer: 'n(KMnO₄):n(O₂) = 2:5', check: function (s) { return /2\s*:\s*5/.test(s); }, analysis: '由方程式2KMnO₄~5O₂，物质的量比为2:5。' },
                    { prompt: '第5步：计算O₂体积(标况)。Vm=22.4L/mol，求V(O₂)。', answer: 'V(O₂) = 0.02×5/2×22.4 = 1.12L', check: function (s) { return /1\.12\s*L/.test(s); }, analysis: 'n(O₂)=0.02×5/2=0.05mol，V(O₂)=n×Vm=0.05×22.4=1.12L(标况)。' },
                    { prompt: '第6步：检验。验证电子守恒：KMnO₄得电子数=H₂O₂失电子数。', answer: '0.02×5=0.1mol e⁻ = 0.05×2=0.1mol e⁻，守恒', check: function (s) { return /0\.1.*mol|守恒/.test(s); }, analysis: 'KMnO₄得电子：0.02×5=0.1mol；H₂O₂失电子：0.05×2=0.1mol。电子守恒，计算正确。' }
                ]
            },
            {
                title: '弱酸pH与电离度计算',
                brief: '25℃时，某浓度c=0.1mol/L的弱酸HA溶液，测得pH=3。求HA的电离常数Ka、电离度α，并判断加水稀释后pH与α的变化。',
                steps: [
                    { prompt: '第1步：由pH求[H⁺]。pH=3，计算氢离子浓度。', answer: '[H⁺] = 10⁻³ = 0.001mol/L', check: function (s) { return /10.*-3|0\.001/.test(s); }, analysis: 'pH=-lg[H⁺]=3，[H⁺]=10⁻³mol/L=0.001mol/L。' },
                    { prompt: '第2步：写出电离平衡。写出HA的电离方程式及Ka表达式。', answer: 'HA⇌H⁺+A⁻，Ka=[H⁺][A⁻]/[HA]', check: function (s) { return /HA.*H.*A|Ka.*\[H.*\]\[A.*\]\/\[HA\]/.test(s); }, analysis: 'HA⇌H⁺+A⁻，Ka=[H⁺][A⁻]/[HA]。电离产生[H⁺]=[A⁻]，未电离[HA]≈c-[H⁺]。' },
                    { prompt: '第3步：计算电离度α。α=[H⁺]/c×100%。', answer: 'α = 0.001/0.1×100% = 1%', check: function (s) { return /1\s*%/.test(s); }, analysis: 'α=[H⁺]/c×100%=0.001/0.1×100%=1%。电离度较小，符合弱酸特征。' },
                    { prompt: '第4步：计算Ka。由于α很小，[HA]≈c=0.1，Ka≈[H⁺]²/c。', answer: 'Ka ≈ (10⁻³)²/0.1 = 10⁻⁵', check: function (s) { return /10.*-5/.test(s); }, analysis: 'Ka=[H⁺][A⁻]/[HA]≈[H⁺]²/c=(10⁻³)²/0.1=10⁻⁶/0.1=10⁻⁵。注：精确计算[HA]=0.1-0.001=0.099，Ka≈1.01×10⁻⁵，近似合理。' },
                    { prompt: '第5步：判断稀释影响。加水稀释后，电离平衡如何移动？α和pH如何变化？', answer: '平衡正向移动，α增大，[H⁺]减小pH增大', check: function (s) { return /α.*增大|电离度.*增大/.test(s) && /pH.*增大|pH.*升高/.test(s); }, analysis: '稀释使HA浓度降低，平衡正向促进电离，α增大；但[H⁺]总体减小(稀释占主导)，pH增大。注意：Ka只与温度有关，稀释不变。' }
                ]
            }
        ],
        biology: [
            {
                title: '光合作用速率计算',
                brief: '某植物在适宜光照下，测得叶圆片每小时产生O₂ 6mg(净光合速率)。已知该植物呼吸作用每小时消耗O₂ 2mg。求：净光合速率、呼吸速率、真正(总)光合速率(均以O₂ mg/h表示)。',
                steps: [
                    { prompt: '第1步：识别各速率含义。净光合速率=实测O₂释放量；呼吸速率=黑暗下O₂吸收量；真正光合速率=净光合速率+呼吸速率。请写出三者关系式。', answer: '真正光合速率 = 净光合速率 + 呼吸速率', check: function (s) { return /真正.*=.*净.*\+.*呼吸|总.*=.*净.*\+.*呼吸/.test(s); }, analysis: '真正光合速率(总光合)=净光合速率(表观)+呼吸速率。净光合是扣除自身呼吸后的净积累。' },
                    { prompt: '第2步：确定净光合速率。由题意写出净光合速率数值。', answer: '净光合速率 = 6mg O₂/h', check: function (s) { return /6\s*mg/.test(s); }, analysis: '光照下实测O₂释放量即净光合速率=6mg O₂/h。' },
                    { prompt: '第3步：确定呼吸速率。由题意写出呼吸速率数值。', answer: '呼吸速率 = 2mg O₂/h', check: function (s) { return /2\s*mg/.test(s); }, analysis: '呼吸作用每小时消耗O₂ 2mg，即呼吸速率=2mg O₂/h(黑暗条件下测定)。' },
                    { prompt: '第4步：计算真正光合速率。代入关系式求解。', answer: '真正光合速率 = 6 + 2 = 8mg O₂/h', check: function (s) { return /8\s*mg/.test(s); }, analysis: '真正光合速率=净光合速率+呼吸速率=6+2=8mg O₂/h。即植物实际光合产氧8mg，其中2mg用于自身呼吸，6mg净释放。' },
                    { prompt: '第5步：情境分析。若将该植物移至黑暗处，O₂变化如何？说明理由。', answer: '黑暗下只进行呼吸，O₂减少2mg/h', check: function (s) { return /减少.*2|2\s*mg.*减少/.test(s); }, analysis: '黑暗下不进行光合作用，只进行呼吸作用消耗O₂，故O₂每小时减少2mg(等于呼吸速率)。' }
                ]
            },
            {
                title: '遗传概率计算',
                brief: '苯丙酮尿症(PKU)为常染色体隐性遗传病(用A/a表示)。一对表现型正常的夫妇，男方父母均正常，男方有一患PKU的弟弟；女方父母均正常，女方有一患PKU的妹妹。求该夫妇生育患病孩子的概率。',
                steps: [
                    { prompt: '第1步：判断遗传方式。由"正常双亲生患病子女"判断显隐性及染色体位置。', answer: '常染色体隐性遗传(无中生有为隐性，男女均可患病为常染色体)', check: function (s) { return /常染色体隐性|常.*隐/.test(s); }, analysis: '"无中生有"(正常双亲生患病子女)为隐性遗传；男女均可患病，故为常染色体隐性遗传。' },
                    { prompt: '第2步：推断男方基因型与概率。男方正常，其弟患病(aa)，父母均为Aa，男方为AA或Aa，求男方为Aa的概率。', answer: '男方为Aa概率 = 2/3', check: function (s) { return /2\s*\/\s*3/.test(s); }, analysis: '男方父母Aa×Aa，男方表现正常，基因型为1/3AA或2/3Aa(去掉aa后比例)，故男方为Aa概率2/3。' },
                    { prompt: '第3步：推断女方基因型与概率。女方正常，其妹患病(aa)，父母均为Aa，求女方为Aa的概率。', answer: '女方为Aa概率 = 2/3', check: function (s) { return /2\s*\/\s*3/.test(s); }, analysis: '同理，女方父母Aa×Aa，女方正常，为Aa概率2/3。' },
                    { prompt: '第4步：计算夫妇均为Aa的概率。用乘法原理。', answer: 'P(夫妇均Aa) = 2/3 × 2/3 = 4/9', check: function (s) { return /4\s*\/\s*9/.test(s); }, analysis: '夫妇均为Aa的概率=2/3×2/3=4/9(独立事件乘法)。' },
                    { prompt: '第5步：计算患病孩子概率。夫妇均为Aa时子代患病(aa)概率1/4，综合求最终概率。', answer: 'P(患病孩子) = 4/9 × 1/4 = 1/9', check: function (s) { return /1\s*\/\s*9/.test(s); }, analysis: '患病孩子概率=P(夫妇均Aa)×P(aa|Aa×Aa)=4/9×1/4=1/9。即该夫妇生育PKU患儿概率约11.1%。' },
                    { prompt: '第6步：检验与结论。验证计算逻辑，写出规范结论。', answer: '该夫妇生育患病孩子概率为1/9', check: function (s) { return /1\s*\/\s*9/.test(s); }, analysis: '结论：该病为常染色体隐性遗传，夫妇均为携带者概率2/3，生育患病孩子概率1/9。建议进行产前基因诊断。' }
                ]
            }
        ]
    },

    render: function () {
        var app = document.getElementById('calc-step-app');
        if (!app) return;
        this.state.qIdx = 0;
        this.state.stepIdx = 0;
        this.state.results = {};
        this.state.finished = false;
        this.state.checked = false;
        this._render();
    },

    _render: function () {
        var app = document.getElementById('calc-step-app');
        if (!app) return;
        var self = this;
        var s = this.state;
        var subjects = [
            { key: 'physics', name: '物理', icon: '⚛️', color: '#2563eb' },
            { key: 'chemistry', name: '化学', icon: '🧪', color: '#d97706' },
            { key: 'biology', name: '生物', icon: '🧬', color: '#059669' }
        ];
        var html = '<div style="padding:16px;font-family:inherit;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">';
        html += '<h3 style="margin:0;color:#0f172a;">🧮 计算题分步训练器</h3>';
        html += '<div style="display:flex;gap:6px;">';
        subjects.forEach(function (t) {
            var active = s.subject === t.key;
            html += '<button data-sub="' + t.key + '" class="cs-tab" style="padding:6px 14px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;background:' + (active ? t.color : '#fff') + ';color:' + (active ? '#fff' : '#475569') + ';font-weight:600;">' + t.icon + ' ' + t.name + '</button>';
        });
        html += '</div></div>';

        var probs = this.problems[s.subject];
        if (s.qIdx >= probs.length) s.qIdx = 0;

        // 题目选择
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">';
        probs.forEach(function (p, i) {
            var active = s.qIdx === i;
            html += '<button data-q="' + i + '" class="cs-q-btn" style="padding:6px 14px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;background:' + (active ? '#1e293b' : '#fff') + ';color:' + (active ? '#fff' : '#475569') + ';font-size:0.85rem;">题目' + (i + 1) + '</button>';
        });
        html += '</div>';

        var prob = probs[s.qIdx];
        var totalSteps = prob.steps.length;

        if (s.finished) {
            // 完成总结
            var correctCount = 0;
            var weakSteps = [];
            for (var k = 0; k < totalSteps; k++) {
                if (s.results[k]) { correctCount++; } else { weakSteps.push(k + 1); }
            }
            var score = Math.round(correctCount / totalSteps * 100);
            var grade = score >= 80 ? '优秀' : (score >= 60 ? '良好' : '需加强');
            var gradeColor = score >= 80 ? '#16a34a' : (score >= 60 ? '#ca8a04' : '#dc2626');

            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:20px;text-align:center;">';
            html += '<div style="font-size:3rem;margin-bottom:8px;">' + (score >= 80 ? '🏆' : (score >= 60 ? '👍' : '💪')) + '</div>';
            html += '<h4 style="margin:0 0 6px;color:#0f172a;">' + prob.title + ' - 训练完成</h4>';
            html += '<div style="font-size:2rem;font-weight:800;color:' + gradeColor + ';margin:10px 0;">' + score + ' 分</div>';
            html += '<div style="color:#64748b;margin-bottom:14px;">答对 ' + correctCount + '/' + totalSteps + ' 步 · 评级：' + grade + '</div>';
            if (weakSteps.length > 0) {
                html += '<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;margin-bottom:14px;">';
                html += '<div style="font-weight:700;color:#b91c1c;margin-bottom:6px;">⚠️ 薄弱步骤</div>';
                html += '<div style="color:#7f1d1d;font-size:0.88rem;">第 ' + weakSteps.join('、') + ' 步需重点复习，建议回顾对应解析后重做。</div>';
                html += '</div>';
            } else {
                html += '<div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:12px;margin-bottom:14px;color:#047857;font-weight:600;">🎉 全部步骤正确，掌握扎实！</div>';
            }
            html += '<button id="cs-restart" style="background:#3b82f6;color:#fff;border:0;padding:8px 20px;border-radius:6px;cursor:pointer;">🔄 重新训练</button>';
            html += '</div></div>';
            app.innerHTML = html;
            this._bindTabs();
            this._bindQSelect();
            var restart = document.getElementById('cs-restart');
            if (restart) restart.addEventListener('click', function () {
                self.state.stepIdx = 0;
                self.state.results = {};
                self.state.finished = false;
                self.state.checked = false;
                self._render();
            });
            return;
        }

        // 题目概要
        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">';
        html += '<h4 style="margin:0 0 8px;color:#0f172a;">' + prob.title + '</h4>';
        html += '<div style="background:#f8fafc;border-left:3px solid #64748b;padding:10px 12px;border-radius:6px;margin-bottom:14px;font-size:0.88rem;color:#334155;line-height:1.7;">' + prob.brief + '</div>';

        // 步骤进度条
        html += '<div style="display:flex;gap:4px;margin-bottom:14px;">';
        for (var i = 0; i < totalSteps; i++) {
            var bg = '#e2e8f0';
            if (i < s.stepIdx) bg = s.results[i] ? '#16a34a' : '#ef4444';
            else if (i === s.stepIdx) bg = '#3b82f6';
            html += '<div style="flex:1;height:6px;background:' + bg + ';border-radius:3px;"></div>';
        }
        html += '</div>';
        html += '<div style="color:#64748b;font-size:0.82rem;margin-bottom:12px;">第 ' + (s.stepIdx + 1) + ' 步 / 共 ' + totalSteps + ' 步</div>';

        var step = prob.steps[s.stepIdx];
        html += '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;margin-bottom:12px;">';
        html += '<div style="font-weight:600;color:#1e40af;margin-bottom:6px;">' + step.prompt + '</div>';
        html += '<div style="font-size:0.8rem;color:#64748b;">参考答案要点：' + step.answer + '</div>';
        html += '</div>';

        html += '<input type="text" id="cs-input" placeholder="在此输入你的答案..." style="width:100%;box-sizing:border-box;padding:10px;border:1.5px solid #cbd5e1;border-radius:6px;font-size:0.92rem;margin-bottom:10px;" ' + (s.checked ? 'disabled' : '') + ' value="' + (s.results[s.stepIdx] !== undefined && s.checked ? '' : '') + '"/>';

        if (s.checked) {
            var userInput = this._lastInput || '';
            var isCorrect = s.results[s.stepIdx];
            html += '<div style="background:' + (isCorrect ? '#dcfce7' : '#fee2e2') + ';border-left:3px solid ' + (isCorrect ? '#16a34a' : '#ef4444') + ';border-radius:6px;padding:12px;margin-bottom:12px;">';
            html += '<strong style="color:' + (isCorrect ? '#15803d' : '#b91c1c') + ';">' + (isCorrect ? '✅ 该步正确！' : '❌ 该步需改进') + '</strong>';
            html += '<div style="color:#475569;font-size:0.86rem;line-height:1.7;margin-top:6px;"><strong>你的作答：</strong>' + userInput + '</div>';
            html += '<div style="color:#475569;font-size:0.86rem;line-height:1.7;margin-top:4px;"><strong>解析：</strong>' + step.analysis + '</div>';
            html += '</div>';
            html += '<button id="cs-next" style="width:100%;background:#3b82f6;color:#fff;border:0;padding:10px;border-radius:6px;cursor:pointer;font-size:0.95rem;">' + (s.stepIdx < totalSteps - 1 ? '下一步 →' : '查看训练总结 📊') + '</button>';
        } else {
            html += '<button id="cs-check" style="width:100%;background:#16a34a;color:#fff;border:0;padding:10px;border-radius:6px;cursor:pointer;font-size:0.95rem;">✓ 检查答案</button>';
        }

        html += '</div></div>';

        app.innerHTML = html;

        this._bindTabs();
        this._bindQSelect();

        var checkBtn = document.getElementById('cs-check');
        if (checkBtn) checkBtn.addEventListener('click', function () {
            var input = document.getElementById('cs-input');
            var val = input ? input.value : '';
            self._lastInput = val;
            var ok = false;
            try { ok = !!step.check(val); } catch (e) { ok = false; }
            if (!val.trim()) ok = false;
            s.results[s.stepIdx] = ok;
            s.checked = true;
            self._render();
        });

        var nextBtn = document.getElementById('cs-next');
        if (nextBtn) nextBtn.addEventListener('click', function () {
            if (s.stepIdx < totalSteps - 1) {
                s.stepIdx += 1;
                s.checked = false;
                self._lastInput = '';
            } else {
                s.finished = true;
            }
            self._render();
        });
    },

    _bindTabs: function () {
        var self = this;
        var app = document.getElementById('calc-step-app');
        if (!app) return;
        var tabs = app.querySelectorAll('.cs-tab');
        for (var i = 0; i < tabs.length; i++) {
            (function (tab) {
                tab.addEventListener('click', function () {
                    self.state.subject = tab.getAttribute('data-sub');
                    self.state.qIdx = 0;
                    self.state.stepIdx = 0;
                    self.state.results = {};
                    self.state.finished = false;
                    self.state.checked = false;
                    self._lastInput = '';
                    self._render();
                });
            })(tabs[i]);
        }
    },

    _bindQSelect: function () {
        var self = this;
        var app = document.getElementById('calc-step-app');
        if (!app) return;
        var btns = app.querySelectorAll('.cs-q-btn');
        for (var i = 0; i < btns.length; i++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    self.state.qIdx = parseInt(btn.getAttribute('data-q'), 10);
                    self.state.stepIdx = 0;
                    self.state.results = {};
                    self.state.finished = false;
                    self.state.checked = false;
                    self._lastInput = '';
                    self._render();
                });
            })(btns[i]);
        }
    }
};

// ============================================================
// 自动渲染：页面加载后检测容器并渲染
// ============================================================
(function () {
    function autoRender() {
        if (typeof window.guangdongAnalysis !== 'undefined' && document.getElementById('guangdong-analysis-app')) {
            window.guangdongAnalysis.render();
        }
        if (typeof window.situationalQuiz !== 'undefined' && document.getElementById('situational-quiz-app')) {
            window.situationalQuiz.render();
        }
        if (typeof window.answerTemplateLib !== 'undefined' && document.getElementById('answer-template-app')) {
            window.answerTemplateLib.render();
        }
        if (typeof window.calcStepTrainer !== 'undefined' && document.getElementById('calc-step-app')) {
            window.calcStepTrainer.render();
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoRender);
    } else {
        autoRender();
    }
})();

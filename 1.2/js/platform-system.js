var PlatformSystem={
    init:function(){
        this.renderPlatformPage();
        this.renderRound1Modules();
        this.renderRound2Modules();
        this.renderQuestionBank();
        this.renderExperimentCenter();
        this.renderLearningPath();
        this.renderTeachingApps();
        this.renderCompetitionOutput();
        this.renderChecklist();
        this.addModuleTabs();
        this.initSimulations();
    },

    renderPlatformPage:function(){
        var el=document.getElementById('platform-content');
        if(!el) return;
        el.innerHTML='<div class="knowledge-section">'+
            '<h3>🏛️ 平台结构</h3>'+

            '<div class="knowledge-card" style="background:linear-gradient(135deg,rgba(239,68,68,0.06),rgba(245,158,11,0.06));border:2px solid rgba(239,68,68,0.2);">'+
            '<h4 style="color:#e74c3c;">📐 三层结构</h4>'+
            '<div class="platform-arch-diagram">'+
            '<div class="arch-core">🎯 核心：六科的知识点、题库和练习都在一个页面里</div>'+
            '<span class="arch-arrow">⬇</span>'+
            '<div class="arch-brain">🧠 中枢：学习路径推荐与错题反馈</div>'+
            '<span class="arch-arrow">⬇ ⬇</span>'+
            '<div class="arch-wings">'+
            '<div class="arch-wing-left"><div>📖 一轮</div><div style="font-size:0.85rem;margin-top:4px;">知识体系构建</div><div style="font-size:0.75rem;opacity:0.85;">一轮复习模块</div><div style="font-size:0.75rem;opacity:0.85;">学科知识图谱</div></div>'+
            '<div class="arch-wing-right"><div>🚀 二轮</div><div style="font-size:0.85rem;margin-top:4px;">专题训练</div><div style="font-size:0.75rem;opacity:0.85;">二轮专题模块</div><div style="font-size:0.75rem;opacity:0.85;">情境题库 · 实验中心</div></div>'+
            '</div></div>'+

            '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:12px;">'+
            '<div style="flex:1;min-width:140px;background:rgba(239,68,68,0.08);border-radius:8px;padding:12px;text-align:center;border:1px solid rgba(239,68,68,0.2);"><div style="font-weight:700;color:#e74c3c;">按考情组织</div><div style="font-size:0.75rem;color:#666;">题库覆盖 2018-2026</div></div>'+
            '<div style="flex:1;min-width:140px;background:rgba(245,158,11,0.08);border-radius:8px;padding:12px;text-align:center;border:1px solid rgba(245,158,11,0.2);"><div style="font-weight:700;color:#f59e0b;">重情境</div><div style="font-size:0.75rem;color:#666;">按情境分类的练习题</div></div>'+
            '<div style="flex:1;min-width:140px;background:rgba(59,130,246,0.08);border-radius:8px;padding:12px;text-align:center;border:1px solid rgba(59,130,246,0.2);"><div style="font-weight:700;color:#3b82f6;">重衔接</div><div style="font-size:0.75rem;color:#666;">知识点与题目互相打通</div></div>'+
            '<div style="flex:1;min-width:140px;background:rgba(16,185,129,0.08);border-radius:8px;padding:12px;text-align:center;border:1px solid rgba(16,185,129,0.2);"><div style="font-weight:700;color:#10b981;">重规范</div><div style="font-size:0.75rem;color:#666;">答题步骤与术语对照</div></div>'+
            '</div></div>'+

            '<div class="knowledge-card"><h4>📊 三科模块权重与命题趋势</h4>'+
            '<div style="margin:10px 0;"><div style="font-weight:700;color:#8b5cf6;margin-bottom:6px;">⚡ 物理：力学≈40% | 电磁学≈33%</div>'+
            '<div style="display:flex;align-items:center;margin:4px 0;gap:8px;"><span style="min-width:80px;font-size:0.85rem;">力学</span><div style="flex:1;background:#f1f5f9;border-radius:4px;height:18px;overflow:hidden;"><div style="width:40%;height:100%;background:linear-gradient(90deg,#8b5cf6,#a78bfa);border-radius:4px;display:flex;align-items:center;justify-content:center;color:white;font-size:0.7rem;font-weight:600;">40%</div></div></div>'+
            '<div style="display:flex;align-items:center;margin:4px 0;gap:8px;"><span style="min-width:80px;font-size:0.85rem;">电磁学</span><div style="flex:1;background:#f1f5f9;border-radius:4px;height:18px;overflow:hidden;"><div style="width:33%;height:100%;background:linear-gradient(90deg,#7c3aed,#8b5cf6);border-radius:4px;display:flex;align-items:center;justify-content:center;color:white;font-size:0.7rem;font-weight:600;">33%</div></div></div>'+
            '</div>'+
            '<div style="margin:10px 0;"><div style="font-weight:700;color:#3b82f6;margin-bottom:6px;">🧪 化学：四大核心板块</div>'+
            '<div style="display:flex;flex-wrap:wrap;gap:6px;">'+
            '<span style="background:rgba(59,130,246,0.1);padding:4px 10px;border-radius:12px;font-size:0.85rem;font-weight:600;">化学反应原理</span>'+
            '<span style="background:rgba(59,130,246,0.1);padding:4px 10px;border-radius:12px;font-size:0.85rem;font-weight:600;">化学实验</span>'+
            '<span style="background:rgba(59,130,246,0.1);padding:4px 10px;border-radius:12px;font-size:0.85rem;font-weight:600;">有机化学</span>'+
            '<span style="background:rgba(59,130,246,0.1);padding:4px 10px;border-radius:12px;font-size:0.85rem;font-weight:600;">工业流程</span></div></div>'+
            '<div style="margin:10px 0;"><div style="font-weight:700;color:#10b981;margin-bottom:6px;">🧬 生物：三大支柱</div>'+
            '<div style="display:flex;align-items:center;margin:4px 0;gap:8px;"><span style="min-width:100px;font-size:0.85rem;">遗传与进化</span><div style="flex:1;background:#f1f5f9;border-radius:4px;height:18px;overflow:hidden;"><div style="width:28%;height:100%;background:linear-gradient(90deg,#10b981,#34d399);border-radius:4px;display:flex;align-items:center;justify-content:center;color:white;font-size:0.7rem;font-weight:600;">22-28%</div></div></div>'+
            '<div style="display:flex;align-items:center;margin:4px 0;gap:8px;"><span style="min-width:100px;font-size:0.85rem;">稳态与调节</span><div style="flex:1;background:#f1f5f9;border-radius:4px;height:18px;overflow:hidden;"><div style="width:24%;height:100%;background:linear-gradient(90deg,#059669,#10b981);border-radius:4px;display:flex;align-items:center;justify-content:center;color:white;font-size:0.7rem;font-weight:600;">20-24%</div></div></div>'+
            '<div style="display:flex;align-items:center;margin:4px 0;gap:8px;"><span style="min-width:100px;font-size:0.85rem;">分子与细胞</span><div style="flex:1;background:#f1f5f9;border-radius:4px;height:18px;overflow:hidden;"><div style="width:22%;height:100%;background:linear-gradient(90deg,#047857,#059669);border-radius:4px;display:flex;align-items:center;justify-content:center;color:white;font-size:0.7rem;font-weight:600;">18-22%</div></div></div>'+
            '</div></div>'+

            '<div class="knowledge-card"><h4>🏗️ 三层技术架构</h4>'+
            '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;">'+
            '<div style="flex:1;min-width:160px;background:linear-gradient(135deg,rgba(16,185,129,0.06),rgba(16,185,129,0.12));padding:14px;text-align:center;border-radius:8px;border:1px solid rgba(16,185,129,0.2);"><div style="font-size:1.4rem;font-weight:800;color:#10b981;">💾 数据层</div><div style="font-size:0.85rem;color:#666;">题库 JSON + 六科知识点 JSON + 浏览器本地学习记录</div></div>'+
            '<div style="flex:1;min-width:160px;background:linear-gradient(135deg,rgba(99,102,241,0.06),rgba(99,102,241,0.12));padding:14px;text-align:center;border-radius:8px;border:1px solid rgba(99,102,241,0.2);"><div style="font-size:1.4rem;font-weight:800;color:#6366f1;">⚙️ 逻辑层</div><div style="font-size:0.85rem;color:#666;">知识点别名映射 + 错题归因 + 学习路径排序</div></div>'+
            '<div style="flex:1;min-width:160px;background:linear-gradient(135deg,rgba(245,158,11,0.06),rgba(245,158,11,0.12));padding:14px;text-align:center;border-radius:8px;border:1px solid rgba(245,158,11,0.2);"><div style="font-size:1.4rem;font-weight:800;color:#f59e0b;">🖥️ 应用层</div><div style="font-size:0.85rem;color:#666;">六科学习页 + 122 个工具 + 模考与错题本</div></div>'+
            '</div></div>'+

            '<div class="knowledge-card"><h4>📋 命题转型特征（2022-2026）</h4>'+
            '<div class="key-point"><strong>难度分布：</strong>基础题约60% | 中档题约25%-30% | 难题约10%-15%（易:中:难≈5:3:2）</div>'+
            '<div class="key-point"><strong>命题共识：</strong>"无情境，不物理"、"无情境，不成题" — 试题素材来源科技前沿/生产生活/地域文化/社会热点</div>'+
            '<div class="key-point"><strong>核心转型：</strong>从"知识立意"向"素养立意"全面转型，呈现"情境化、综合化、探究化"鲜明特点</div>'+
            '<div class="key-point"><strong>备考路径：</strong>从"机械刷题"转向"真题研究与规范表达"，从"孤立知识点"转向"构建知识网络"</div>'+
            '</div></div>';
    },

    renderRound1Modules:function(){
        this.round1Data={
            physics:{
                modules:['力学（≈40%）','电磁学（≈30-35%）','热学','光学与近代物理'],
                keyPoints:['牛顿运动定律（传送带、斜面模型）','动能定理与机械能守恒定律','动量定理与动量守恒定律','静电场（场强、电势）','电磁感应定律','带电粒子在匀强磁场中运动基础','气体实验定律与热力学第一定律'],
                resources:{lecture:'30%',practice:'50%',diagnostic:'20%'},
                designPrinciples:['📌 情境化基础训练：一轮从生活实践/教材原型切入','📚 模块化系统覆盖：按分值权重确保无遗漏','🛠️ 资源形态多元：微课+概念辨析+诊断卷闭环','⚡ 精准纠错与规范：源头减少非智力失分']
            },
            chemistry:{
                modules:['化学反应原理','化学实验基础','有机化学','无机流程基础'],
                keyPoints:['化学平衡状态判断','反应速率计算','原电池/电解池原理','基础操作与常见装置','官能团性质与典型反应','同分异构体（简单计数）','物质转化与基本分离提纯'],
                resources:{concept:'40%',experiment:'25%',practice:'35%'},
                designPrinciples:['概念辨析题组针对易错点','教材实验深度解读','分块巩固基础应用训练','化学式/方程式书写规范']
            },
            biology:{
                modules:['遗传与进化','稳态与调节','分子与细胞','生物与环境'],
                keyPoints:['孟德尔定律与伴性遗传基础','神经/体液/免疫调节基础过程','光合与呼吸作用过程','种群特征与生态系统功能入门'],
                resources:{expression:'30%',conceptMap:'30%',scenario:'40%'},
                designPrinciples:['长句表述训练强化规范用语','核心概念图谱填空自建知识网络','基础情境应用题结合生活/生态','专业术语书写规范训练']
            }
        };

        this.round1Methodology={
            textbook:['教材精读微课系列（每概念5-10分钟）','教材插图/旁栏/课后习题命题价值解析','教材实验全景复盘（目标/原理/步骤逻辑/结果分析）'],
            diagnostic:['标准化错因标签库','定向纠错练习系统','规范表达强化营'],
            transition:['模块末设置"中档过渡题"','输出个性化知识网络图','数据汇总至统一用户画像供二轮调用']
        };
    },

    renderRound2Modules:function(){
        this.round2Data={
            physics:[
                {name:'力电综合专题',desc:'带电粒子在复合场中的运动、电磁感应中的动力学与能量问题',target:'攻克压轴题，训练多过程分析、临界条件判断与数学工具应用'},
                {name:'实验创新专题',desc:'1道基础实验+1道创新实验模式，侧重原理理解和迁移应用',target:'从操作复现到原理迁移，应对情境建模挑战'}
            ],
            chemistry:[
                {name:'反应原理与工业流程融合',desc:'化工流程反套路设问，模块融合成为常态',target:'信息整合、平衡移动定量分析、陌生反应方程式书写'},
                {name:'实验探究与定量分析',desc:'实验原理型探究，探究设计而非操作记忆',target:'完整科学探究逻辑链，证据推理与误差分析'},
                {name:'有机合成与结构推断',desc:'路线设计推演与绿色化学评价',target:'有机推断能力与合成路线设计能力'}
            ],
            biology:[
                {name:'遗传与代谢调控网络',desc:'遗传+代谢交叉热点，复杂系谱分析',target:'复杂遗传情境建模、概率计算与实验方案设计'},
                {name:'稳态调节与疾病模型',desc:'神经-免疫-内分泌交叉综合',target:'长链条逻辑表述、原因分析与结论推导规范化'},
                {name:'生态工程与生物技术实践',desc:'碳汇渔业、红树林修复等广东特色情境',target:'运用生命观念分析生态问题，理解科研逻辑'}
            ],
            abilityTraining:[
                {name:'表述规范化工厂',desc:'高考官方评分细则样例 | 口语化vs标准术语对比纠错 | 模板化逻辑链训练'},
                {name:'情境建模工作坊',desc:'训练"阅读题干→提取关键参数→匹配学科模型→建立方程/推理路径"标准化流程'},
                {name:'实验设计竞技场',desc:'半开放式课题：自主提出假设、设计对照、控制变量、分析潜在误差'}
            ],
            smartLoop:'诊断→推送→训练→再诊断增长闭环：定位能力标签缺陷→动态组装微专题补强包→追踪表现趋势→阈值触发升级'
        };
    },

    renderQuestionBank:function(){
        this.questionBank={
            dataSources:{
                gk:'2018-2026 年真题整理，六科共 1301 道（物理 248 / 化学 217 / 生物 216 / 数学 200 / 语文 200 / 英语 220）',
                mock:'地市模拟卷尚未收录；题库当前只含真题与按考点自编的练习题'
            },
            tagDimensions:[
                {name:'学科与章节',tags:'物理（力学/电磁学/光学/热学/振动与波/近代物理）| 化学（计量/反应原理/结构/元素/有机/实验）| 生物（细胞/遗传/进化/调节/稳态/生态）| 数学、语文、英语按教材章节'},
                {name:'知识点',tags:'每题标注 knowledgePoints，与六科知识点体系的 168 个考点对应'},
                {name:'题型',tags:'选择题、实验题、计算题、解答题、填空题、阅读理解、听力、书面表达等'},
                {name:'难度',tags:'easy / medium / hard 三档'},
                {name:'分值',tags:'按广东卷赋分记录points'},
                {name:'年份',tags:'2018-2026 逐年分布，可按年份筛选'}
            ],
            propositionEngine:{
                features:['按学科、章节、知识点、难度、年份筛选题目，可直接生成自定义练习','每题带解析与考点标注，筛选后可按知识点回看同类题','答题结果按知识点归类到错题本，作为复习清单'],
                guangdongFeatures:['大湾区新能源汽车电池技术','潮汕工夫茶中的化学','珠江口湿地生态修复工程','粤西红树林修复','岭南中药有效成分提取','碳汇渔业','绿氨生产','人工智能辅助合成']
            },
            dataLoop:'做题记录与错题回流到本地，薄弱考点随之更新；题库本身是静态 JSON，需要手动补充'
        };
    },

    renderExperimentCenter:function(){
        this.experimentCenter={
            examImperative:{
                biology:'实验设计占比高达30%（2025广东卷），贯穿全卷',
                chemistry:'设问从仪器识别升级为实验设计/证据推理/方案优化',
                physics:'1道基础实验+1道创新实验，侧重原理迁移（16-20分）'
            },
            coreTiers:[
                {name:'📚 教材实验深析库',icon:'📚',
                    features:['原理逻辑链：深度剖析"为什么这么做"','关键操作与误差定量分析','变式拓展："若更换某材料/条件，如何调整方案？"'],
                    positioning:'一轮复习→二轮过渡桥梁'},
                {name:'🔬 创新实验案例库',icon:'🔬',
                    features:['来源：广州一模抗肿瘤新药机制探究 | 深圳一模纯氨燃料船催化反应 | 汕头一模海洋生物活性物质提取','结构化解构：探究目标+自变量/因变量+对照设置+预期结果推导','半开放课题：补充步骤/设计验证实验'],
                    positioning:'二轮"实验设计竞技场"核心弹药'},
                {name:'📄 科研摘要解读库',icon:'📄',
                    features:['情境：合成生物学 | 碳汇渔业 | 新型太阳能电池 | 珠江口湿地修复 | 神经-免疫调节','能力训练：从复杂文字图表快速提取关键假设/方法/结论','迁移问题："该研究如何体现对照原则？"'],
                    positioning:'应对高考"科研摘要化"趋势'}
            ],
            integration:'← 一轮教材实验错题回流 | → 二轮专题调用创新案例 | ↔ 情境题库互馈（实验题素材提炼入"广东特色情境素材库"）'
        };
    },

    renderLearningPath:function(){
        this.learningPath={
            userProfile:{
                knowledgeNetwork:'错题按知识点归类后统计错误率，标出薄弱考点',
                abilityDefects:'错题对应的考点、题型与难度分布，可作为复习顺序的依据'
            },
            recommendationLogic:{
                round1Goal:'先把错误率最高的考点补上，配合该考点的同知识点练习题',
                round2Goal:'再按题型和难度补齐错得较多的部分',
                crossDbDispatch:{
                    experimentWeak:'从题库筛出实验相关题，配套实验中心的方法说明',
                    scenarioWeak:'按知识点找同类题集中练习',
                    integrationWeak:'按章节找跨考点的综合题'
                }
            },
            optimization:{
                complexityGradient:'先做同考点的同类题，再逐步换表述与情境',
                targetWeighting:'按自己的薄弱项调整投入时间',
                feedbackLoop:'每次练习后更新错题与错误率，复习清单随之变化'
            }
        };
    },

    renderTeachingApps:function(){
        this.teachingApps={
            scenarios:[
                {name:'按错题定复习清单',
                    desc:'学生把错题标记后，系统按知识点归类，列出需要优先补的考点'},
                {name:'按考点集中练',
                    desc:'从题库按知识点、难度、年份筛选，生成一组同类题连续练习'},
                {name:'实验方法对照',
                    desc:'实验中心按教材实验、创新案例、科研摘要三层整理，可与实验题对照看'},
                {name:'答题规范对照',
                    desc:'主观题答案与解析给出参考答案，可与自己的作答对照检查步骤与术语'}
            ],
            teacherDev:[
                {name:'组卷',desc:'按学科、章节、知识点、难度、年份筛选题目，导出为一组练习'},
                {name:'知识梳理',desc:'六科 168 个考点的知识要点与常见错误，可直接当讲义用'},
                {name:'学情记录',desc:'学生的错题与正确率保存在本地，可导出备份后在班级层面汇总'}
            ]
        };
    },

    renderCompetitionOutput:function(){
        this.competitionOutput={
            coreProposition:'一个纯静态的高考学习工具，题库、知识点与工具都在浏览器本地运行，不需要后端也不需要联网',
            materials:[
                {name:'数据层',items:['题库：六科 1301 道，2018-2026 年，含解析与考点标注','知识点：六科 41 章 168 个考点，含核心要点、常见错误、公式与应试提示','学习记录：错题、正确率、打卡与考试记录存在浏览器 localStorage']},
                {name:'功能层',items:['真题练习：按学科、章节、难度、年份筛选，作答后出解析','错题本：标记错题后按知识点归类，生成复习清单','模拟考试：按学科组卷，计时作答后出分并记录','工具：122 个在线小工具，含化学配平、3D 分子、细胞分裂模拟、波动光学']},
                {name:'工程实现',items:['零依赖：HTML + CSS + 原生 JS，无构建步骤，npm install 不装任何东西','离线可用：Service Worker 缓存资源，可安装为 PWA','质量门禁：数据质检、声明碰撞扫描、静态与内容规则、运行时检查、单测与冒烟，CI 在每次 push 自动跑']},
                {name:'数据说明',items:['题目与知识点整理自公开教材与考纲，仅供学习参考','真题内容版权归原作者与出版方','本地存储数据可随时导出备份，也可一键清除']}
            ],
            competitiveEdge:'<b>可离线：</b>装上之后断网也能用 | <b>可核对：</b>题库、题量、答案分布这些数字都能在仓库里查到 | <b>无账号：</b>不收集任何数据，学习记录只存在本机浏览器里'
        };
    },

    addModuleTabs:function(){
        ['physics','chemistry','biology'].forEach(function(subject){
            var section=document.getElementById(subject+'-section');
            if(!section) return;
            var tabsContainer=section.querySelector('.module-tabs');
            if(!tabsContainer) return;
            var existing={};
            tabsContainer.querySelectorAll('.module-tab').forEach(function(t){existing[t.dataset.module]=true;});
            var toAdd={round1:'📗 一轮复习',round2:'📕 二轮专题',bank:'🏦 情境题库','experiment-center':'🔬 探究中心',methodology:'📝 解题方法',errors:'⚠️ 易错汇编'};
            if(subject==='biology'){toAdd.graph='🗺️ 知识图谱';toAdd.hotspot='🔥 热点聚焦';}
            Object.keys(toAdd).forEach(function(mod){
                if(!existing[mod]){
                    var b=document.createElement('button');
                    b.className='module-tab';b.dataset.module=mod;b.textContent=toAdd[mod];
                    tabsContainer.appendChild(b);
                }
            });
        });
    },

    getRound1Content:function(subject){
        var data=this.round1Data[subject];
        if(!data) return '<p>一轮复习模块正在开发中...</p>';
        var names={physics:'物理',chemistry:'化学',biology:'生物'};
        var colors={physics:'#8b5cf6',chemistry:'#3b82f6',biology:'#10b981'};
        var c=colors[subject];
        var html='<div class="knowledge-section"><h3>📗 '+names[subject]+' 一轮系统复习模块</h3>';
        html+='<div class="knowledge-card" style="background:linear-gradient(135deg,'+c+'10,'+c+'08);border:1px solid '+c+'30;">';
        html+='<h4 style="color:'+c+';">🎯 阶段目标：基础题零失分（攻克约60%基础题）</h4>';
        html+='<div class="key-point"><strong>核心策略：</strong>回归教材、覆盖主干、深刻理解概念本质。一轮并非追求难题怪题，而是确保基础分"颗粒归仓"</div>';
        html+='<div class="key-point"><strong>设计原则：</strong>'+data.designPrinciples.join(' ● ')+'</div>';
        html+='</div><div class="knowledge-card"><h4>📊 核心复习模块（按近五年分值权重排序）</h4>';
        if(subject==='physics'){
            html+='<div style="margin:8px 0;"><div style="font-weight:700;margin-bottom:6px;">核心模块权重分布</div>';
            data.modules.forEach(function(m,i){
                var widths=[40,33,8,8];
                html+='<div style="display:flex;align-items:center;margin:4px 0;gap:8px;"><span style="min-width:170px;font-size:0.85rem;">'+m+'</span><div style="flex:1;background:#f1f5f9;border-radius:4px;height:16px;"><div style="width:'+widths[i]+'%;height:100%;background:'+c+';border-radius:4px;display:flex;align-items:center;justify-content:center;color:white;font-size:0.65rem;font-weight:700;"></div></div></div>';
            });
        }else{
            data.modules.forEach(function(m){html+='<div class="key-point">📌 '+m+'</div>';});
        }
        html+='</div><div class="knowledge-card"><h4>🔥 高频考点（近五年必考/高频）</h4>';
        data.keyPoints.forEach(function(p){html+='<div class="key-point">✅ '+p+'</div>';});
        html+='</div><div class="knowledge-card"><h4>📦 一轮资源形态配比</h4><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">';
        var labels={lecture:'微课精讲',practice:'基础题组',diagnostic:'单元诊断卷',concept:'概念辨析题组',experiment:'教材实验微课',expression:'长句表述训练',conceptMap:'概念图谱填空',scenario:'情境应用题'};
        Object.keys(data.resources).forEach(function(k){
            html+='<div style="flex:1;min-width:100px;background:white;border-radius:8px;padding:10px;text-align:center;border:1px solid '+c+'20;"><div style="font-size:1.2rem;font-weight:700;color:'+c+';">'+data.resources[k]+'</div><div style="font-size:0.8rem;color:#666;">'+(labels[k]||k)+'</div></div>';
        });
        html+='</div></div><div class="knowledge-card"><h4>📖 回归教材策略</h4>';
        var mt=this.round1Methodology;
        mt.textbook.forEach(function(t){html+='<div class="key-point">📘 '+t+'</div>';});
        mt.diagnostic.forEach(function(t){html+='<div class="key-point">🔧 '+t+'</div>';});
        mt.transition.forEach(function(t){html+='<div class="key-point">🔄 '+t+'</div>';});
        html+='</div></div>';
        return html;
    },

    getRound2Content:function(subject){
        var data=this.round2Data[subject];
        if(!subject) return '<p>二轮专题模块正在开发中...</p>';
        var names={physics:'物理',chemistry:'化学',biology:'生物'};
        var html='<div class="knowledge-section"><h3>📕 '+names[subject]+' 二轮专题冲刺模块</h3>';
        html+='<div class="knowledge-card" style="background:linear-gradient(135deg,rgba(239,68,68,0.06),rgba(245,158,11,0.06));border:1px solid rgba(239,68,68,0.2);">';
        html+='<h4 style="color:#ef4444;">🎯 阶段目标：攻克中高难题（约30-40%区分题）</h4>';
        html+='<div class="key-point"><strong>三大支柱：</strong>跨模块综合 | 情境迁移 | 规范表达</div>';
        html+='<div class="key-point"><strong>关键跃升：</strong>孤立知识点→跨模块网络 | 熟悉模型→陌生情境建模 | 结论性作答→过程性规范表达</div>';
        html+='</div>';
        if(Array.isArray(data)){
            data.forEach(function(t){
                html+='<div class="knowledge-card" style="border-left:4px solid #ef4444;"><h4>🔶 '+t.name+'</h4>';
                html+='<div class="key-point"><strong>内容：</strong>'+t.desc+'</div><div class="key-point"><strong>目标：</strong>'+t.target+'</div></div>';
            });
        }
        if(this.round2Data.abilityTraining){
            html+='<div class="knowledge-card"><h4>🏋️ 能力突破专项训练营</h4>';
            this.round2Data.abilityTraining.forEach(function(a){
                html+='<div class="key-point"><strong>'+a.name+'：</strong>'+a.desc+'</div>';
            });
            html+='</div>';
        }
        html+='<div class="knowledge-card"><h4>🔄 智能诊断闭环</h4>';
        html+='<div class="key-point"><strong>诊断：</strong>错题溯源→定位至知识图谱特定"能力标签"缺陷（如"物理几何分析薄弱"/"化学平衡图像信息提取不足"）</div>';
        html+='<div class="key-point"><strong>推送：</strong>动态组装微专题补强包→同类情境变式题靶向突破</div>';
        html+='<div class="key-point"><strong>追踪：</strong>阈值触发→自动建议进入下一专题/提升难度→'+(this.round2Data.smartLoop||'')+'</div>';
        html+='</div></div>';
        return html;
    },

    getQuestionBankContent:function(subject){
        var qb=this.questionBank;
        var names={physics:'物理',chemistry:'化学',biology:'生物'};
        var html='<div class="knowledge-section"><h3>🏦 '+names[subject]+' 题库</h3>';
        html+='<div class="knowledge-card"><h4>📥 题目来源</h4>';
        html+='<div class="key-point"><strong>高考真题：</strong>'+qb.dataSources.gk+'</div>';
        html+='<div class="key-point"><strong>模拟卷：</strong>'+qb.dataSources.mock+'</div>';
        html+='<div class="key-point"><strong>每题都带：</strong>考点标注、难度、分值、年份、解析</div>';
        html+='</div><div class="knowledge-card"><h4>🏷️ 可筛选的六个维度</h4>';
        qb.tagDimensions.forEach(function(dim){html+='<div class="key-point"><strong>'+dim.name+'：</strong>'+dim.tags+'</div>';});
        html+='</div><div class="knowledge-card"><h4>⚙️ 组卷与练习</h4>';
        qb.propositionEngine.features.forEach(function(f){html+='<div class="key-point">✅ '+f+'</div>';});
        html+='<div style="margin-top:10px;"><strong>🎨 广东特色情境：</strong><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">';
        qb.propositionEngine.guangdongFeatures.forEach(function(gf){html+='<span style="background:rgba(245,158,11,0.1);padding:3px 8px;border-radius:10px;font-size:0.8rem;border:1px solid rgba(245,158,11,0.3);">'+gf+'</span>';});
        html+='</div></div></div><div class="knowledge-card"><h4>🔄 练习与复盘</h4>';
        html+='<div class="key-point">'+qb.dataLoop+'</div></div></div>';
        return html;
    },

    getExperimentCenterContent:function(subject){
        var ec=this.experimentCenter;
        var names={physics:'物理',chemistry:'化学',biology:'生物'};
        var html='<div class="knowledge-section"><h3>🔬 '+names[subject]+' 实验与探究资源中心</h3>';
        html+='<div class="knowledge-card" style="background:linear-gradient(135deg,rgba(239,68,68,0.06),rgba(245,158,11,0.06));border:1px solid rgba(239,68,68,0.2);">';
        html+='<h4 style="color:#ef4444;">📋 高考命题导向</h4>';
        html+='<div class="key-point"><strong>生物：</strong>'+ec.examImperative.biology+'</div>';
        html+='<div class="key-point"><strong>化学：</strong>'+ec.examImperative.chemistry+'</div>';
        html+='<div class="key-point"><strong>物理：</strong>'+ec.examImperative.physics+'</div>';
        html+='</div>';
        ec.coreTiers.forEach(function(tier){
            html+='<div class="knowledge-card" style="border-left:4px solid #10b981;"><h4>'+tier.name+' <span style="font-size:0.75rem;color:#10b981;">（'+tier.positioning+'）</span></h4>';
            tier.features.forEach(function(f){html+='<div class="key-point">✅ '+f+'</div>';});
            html+='</div>';
        });
        html+='<div class="knowledge-card"><h4>⚡ 系统内协同</h4>';
        html+='<div class="key-point">'+ec.integration+'</div></div></div>';
        return html;
    },

    _renderModuleContent:function(sectionId,dataFn,subject){
        var section=document.getElementById(sectionId);
        if(section){
            var content=section.querySelector('.module-content');
            if(content&&typeof dataFn==='function'){content.innerHTML=dataFn(subject);}
        }
    },

    renderChecklist:function(){
        this.checklistData={
            physics:{
                title:'⚡ 物理考前冲刺清单',
                color:'#8b5cf6',
                items:[
                    {category:'🔧 实验仪器',items:['刻度尺读数（估读到最小分度下一位，末端对整刻度记为x.xx cm）','螺旋测微器（固定刻度+可动刻度×0.01mm，小数点后三位）','游标卡尺（主尺整数+游标对齐线×精度，不估读）','电流表/电压表（见1估下位，见2估半格，见5估五份）','多用电表欧姆档（换挡必调零，刻度反着读）']},
                    {category:'📐 力学核心',items:['受力分析（重力→弹力→摩擦力→已知力，正交分解）','牛顿第二定律（F=ma，注意整体法与隔离法）','动能定理（合外力做功=动能变化，标量式）','动量守恒（系统不受外力或外力远小于内力）','机械能守恒（只有重力/弹力做功）']},
                    {category:'⚡ 电磁学核心',items:['电场强度与电势（E=F/q，沿电场线方向电势降低）','欧姆定律与电功率（I=U/R，P=UI=I²R）','电磁感应（E=BLv，楞次定律判方向）','带电粒子在磁场中（r=mv/qB，T=2πm/qB）']},
                    {category:'📝 答题规范',items:['计算题要有公式→代入数据→结果（带单位）','矢量要说明方向（如"方向水平向右"）','有效数字与题目一致','单位换算（cm→m，g→kg）','不要漏写"由牛顿第三定律得"']}
                ]
            },
            chemistry:{
                title:'🧪 化学考前冲刺清单',
                color:'#3b82f6',
                items:[
                    {category:'🔬 实验仪器',items:['烧杯/锥形瓶（加热垫石棉网）','容量瓶（不可加热，标线为准确体积）','分液漏斗（下层液体从下口放出）','滴定管（酸式/碱式区分，读数估到0.01mL）','冷凝管（下进上出）']},
                    {category:'⚗️ 反应原理',items:['化学平衡（勒夏特列原理，K只与温度有关）','原电池（负极氧化，正极还原，电子从负极流出）','电解池（阳极氧化，阴极还原）','反应速率（v=Δc/Δt，催化剂降低活化能）']},
                    {category:'🧬 有机化学',items:['官能团性质（双键/三键/羟基/羧基/醛基）','同分异构体（碳链异构/位置异构/官能团异构）','有机反应类型（取代/加成/消去/氧化/还原）','有机合成路线设计（逆合成分析）']},
                    {category:'📝 答题规范',items:['化学方程式配平（原子守恒/电荷守恒）','热化学方程式标注状态与ΔH正负','离子方程式可溶强电解质拆写','实验现象描述（颜色/沉淀/气体/温度变化）','计算结果保留有效数字']}
                ]
            },
            biology:{
                title:'🧬 生物考前冲刺清单',
                color:'#10b981',
                items:[
                    {category:'🧪 实验操作',items:['斐林试剂（甲液+乙液等量混合，水浴加热）','双缩脲试剂（先A液后B液）','色素提取（无水乙醇提取，层析液分离）','质壁分离（0.3g/mL蔗糖，低倍镜观察）','有丝分裂（解离→漂洗→染色→制片）']},
                    {category:'🧬 遗传与进化',items:['分离定律（等位基因随同源染色体分离）','自由组合定律（非同源染色体上非等位基因自由组合）','伴性遗传（隐雌×显雄判X连锁）','DNA复制（半保留复制，边解旋边复制）','中心法则（DNA→RNA→蛋白质）']},
                    {category:'🌿 生态与调节',items:['神经调节（反射弧，突触单向传递）','体液调节（激素分级调节与反馈调节）','免疫调节（三道防线，特异性/非特异性）','能量流动（单向流动，逐级递减10-20%）','物质循环（全球性，循环性）']},
                    {category:'📝 答题规范',items:['长句表述逻辑完整（前提→过程→结果）','专业术语准确（原生质层≠原生质体）','实验设计五要素（分组/处理/培养/观测/结论）','对照原则（空白/条件/自身对照）','结论用"如果…则说明…"句式（探究性实验）']}
                ]
            }
        };
    },

    getChecklistContent:function(subject){
        var data=this.checklistData[subject];
        if(!data) return '<p>考点清单正在生成中...</p>';
        var html='<div class="knowledge-section"><h3>'+data.title+'</h3>';
        html+='<div class="knowledge-card" style="background:linear-gradient(135deg,'+data.color+'10,'+data.color+'08);border:1px solid '+data.color+'30;">';
        html+='<h4 style="color:'+data.color+';">📋 考前15分钟速查清单</h4>';
        html+='<div class="key-point"><strong>使用指南：</strong>考试前快速浏览，确认每个要点已掌握。点击复选框标记完成项，系统会自动保存进度。</div></div>';
        data.items.forEach(function(cat){
            html+='<div class="knowledge-card" style="border-left:4px solid '+data.color+';"><h4>'+cat.category+'</h4>';
            cat.items.forEach(function(item,idx){
                html+='<div style="display:flex;align-items:flex-start;gap:8px;margin:6px 0;padding:8px;background:rgba(255,255,255,0.5);border-radius:6px;">';
                html+='<input type="checkbox" id="chk_'+subject+'_'+idx+'" style="margin-top:3px;cursor:pointer;" onchange="PlatformSystem.saveChecklist(this,\''+subject+'\','+idx+')">';
                html+='<label for="chk_'+subject+'_'+idx+'" style="cursor:pointer;font-size:0.9rem;line-height:1.5;">'+item+'</label></div>';
            });
            html+='</div>';
        });
        html+='<div class="knowledge-card"><h4>📊 完成度统计</h4>';
        html+='<div id="checklist-stats-'+subject+'" style="font-size:1.1rem;font-weight:600;color:'+data.color+';">已完成 0 / '+data.items.reduce(function(s,c){return s+c.items.length;},0)+' 项</div>';
        html+='<div style="margin-top:8px;height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden;"><div id="checklist-bar-'+subject+'" style="width:0%;height:100%;background:'+data.color+';transition:width 0.3s;"></div></div></div>';
        html+='</div>';
        return html;
    },

    saveChecklist:function(el,subject,idx){
        var key='checklist_'+subject;
        var saved;
        try {
            saved=JSON.parse((window.HSPCBStore ? HSPCBStore.get(key) : localStorage.getItem(key))||'[]');
        } catch(err){
            console.error('读取检查清单失败，回退到内存模式:',err);
            saved=this._checklistMemory=this._checklistMemory||{};
            saved[key]=saved[key]||[];
            saved=saved[key];
        }
        if(el.checked) saved.push(idx); else saved=saved.filter(function(i){return i!==idx;});
        try {
            (window.HSPCBStore ? HSPCBStore.set(key,JSON.stringify(saved)) : localStorage.setItem(key,JSON.stringify(saved)));
        } catch(err){
            console.error('保存检查清单失败:',err);
            if(!this._checklistMemory) this._checklistMemory={};
            this._checklistMemory[key]=saved;
        }
        this.updateChecklistStats(subject);
    },

    updateChecklistStats:function(subject){
        var data=this.checklistData[subject]; if(!data) return;
        var total=data.items.reduce(function(s,c){return s+c.items.length;},0);
        var key='checklist_'+subject;
        var saved;
        try {
            saved=JSON.parse((window.HSPCBStore ? HSPCBStore.get(key) : localStorage.getItem(key))||'[]');
        } catch(err){
            console.error('读取检查清单统计失败:',err);
            saved=(this._checklistMemory&&this._checklistMemory[key])||[];
        }
        var count=saved.length;
        var statsEl=document.getElementById('checklist-stats-'+subject);
        var barEl=document.getElementById('checklist-bar-'+subject);
        if(statsEl) statsEl.textContent='已完成 '+count+' / '+total+' 项';
        if(barEl) barEl.style.width=(count/total*100)+'%';
    },

    initSimulations:function(){
        this.pcrSimulator={active:false,cycle:0,dnaFragments:[],settings:{denatureTemp:95,annealTemp:55,extendTemp:72,cycles:30},init:function(){this.active=true;this.cycle=0;this.dnaFragments=[{length:500,name:'模板DNA',label:'template'}];},runCycle:function(){this.dnaFragments.push({length:500,name:'扩增产物-循环'+this.cycle,label:'amplicon'});this.cycle++;return this.cycle<=this.settings.cycles;},getStats:function(){return{totalCycles:this.cycle,totalFragments:this.dnaFragments.length,amplification:Math.pow(2,this.cycle)}}};

        this.electrophoresisSimulator={active:false,samples:[],settings:{agarosePercent:1.0,voltage:120,runTime:30},init:function(){this.active=true;this.samples=[{name:'DNA Marker',fragments:[100,250,500,750,1000,2000]},{name:'样品A',fragments:[500]},{name:'样品B',fragments:[250,750]},{name:'样品C',fragments:[1200]}].map(function(s){return{name:s.name,fragments:s.fragments.map(function(f){return{size:f,position:0,color:'#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0').slice(0,6)}})};});},runElectrophoresis:function(minutes){if(!minutes)minutes=this.settings.runTime;this.samples.forEach(function(s){s.fragments.forEach(function(f){var mobility=Math.max(0.1,1000/(f.size+200));f.position=Math.min(95,mobility*100*(minutes/30)*Math.random()+mobility*50);});});return this.samples;}};
    }
};

window.PlatformSystem=PlatformSystem;
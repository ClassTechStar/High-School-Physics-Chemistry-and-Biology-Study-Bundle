// 开放性试题答题框架训练系统
(function(){
'use strict';

// ==================== 题库 ====================
var QUESTION_BANK = [
    // ---------- 原因分析题（7道） ----------
    {
        id: 'reason_01',
        subject: '物理',
        framework: '原因分析',
        question: '为什么汽车急刹车时乘客会向前倾？',
        context: '一辆行驶中的汽车突然遇到紧急情况急刹车，车上的乘客身体向前倾倒。请用物理学原理解释这一现象。',
        modelAnswer: {
            step1: '一切物体都具有惯性，惯性是物体保持原来运动状态不变的性质',
            step2: '当汽车急刹车时，汽车速度急剧减小，但乘客上半身由于惯性仍要保持原来的向前运动状态',
            step3: '因此乘客上半身继续向前运动，而下半身随车减速，导致乘客身体向前倾倒'
        },
        keyPoints: ['惯性', '保持原来运动状态', '汽车减速', '乘客上半身向前运动', '相对运动'],
        commonErrors: '常见错误：只说"惯性"而不描述运动状态的变化过程；混淆惯性与力的概念；遗漏"保持原来运动状态"这一关键表述。',
        score: 6,
        examYear: '2023广州一模'
    },
    {
        id: 'reason_02',
        subject: '物理',
        framework: '原因分析',
        question: '为什么高压输电要采用高电压？',
        context: '远距离输电时，发电厂通常先将电压升高至数百千伏再进行输送，到达用户端再降压。请解释为什么要采用高电压输电。',
        modelAnswer: {
            step1: '根据焦耳定律Q=I²Rt，输电线上发热损耗与电流的平方成正比；输电功率P=UI一定时，电压越高电流越小',
            step2: '采用高电压输电时，在输送功率不变的情况下，输电线上的电流大幅减小',
            step3: '因此输电线上的电能损耗大幅降低，远距离输电的经济性和效率显著提高'
        },
        keyPoints: ['焦耳定律Q=I²Rt', 'P=UI', '电流减小', '电能损耗降低', '远距离输电'],
        commonErrors: '常见错误：混淆P=UI和P=I²R的适用条件；未说明"功率一定"的前提；遗漏对输电损耗公式的引用。',
        score: 6,
        examYear: '2024广东高考'
    },
    {
        id: 'reason_03',
        subject: '物理',
        framework: '原因分析',
        question: '为什么卫星在近地点速度最大？',
        context: '人造地球卫星绕地球做椭圆轨道运动，在近地点时速度最大，远地点时速度最小。请用物理学原理加以解释。',
        modelAnswer: {
            step1: '根据开普勒第二定律（面积定律），行星与太阳的连线在相等时间内扫过相等的面积；根据机械能守恒定律，卫星在椭圆轨道上动能与势能之和保持不变',
            step2: '卫星从远地点向近地点运动时，万有引力做正功，重力势能转化为动能，卫星速度不断增大；到达近地点时势能最小、动能最大',
            step3: '因此卫星在近地点时速度最大，在远地点时速度最小'
        },
        keyPoints: ['开普勒第二定律', '机械能守恒', '万有引力做正功', '势能转化为动能', '近地点势能最小动能最大'],
        commonErrors: '常见错误：只提机械能守恒而忽略开普勒定律的引用；未说明"万有引力做功"的物理过程；混淆线速度与角速度概念。',
        score: 6,
        examYear: '2023深圳二模'
    },
    {
        id: 'reason_04',
        subject: '化学',
        framework: '原因分析',
        question: '为什么FeCl₃溶液加热后颜色变深？',
        context: '实验室中观察到，淡黄色的FeCl₃溶液在加热后颜色明显加深变为棕黄色。请从化学平衡角度解释这一现象。',
        modelAnswer: {
            step1: 'FeCl₃溶液中存在水解平衡：Fe³⁺ + 3H₂O ⇌ Fe(OH)₃ + 3H⁺，水解反应是吸热反应',
            step2: '加热后，根据勒夏特列原理，平衡向吸热方向（水解方向）移动，Fe(OH)₃浓度增大',
            step3: '因此Fe(OH)₃的棕黄色加深，溶液颜色变深'
        },
        keyPoints: ['水解平衡', 'Fe³⁺+3H₂O⇌Fe(OH)₃+3H⁺', '吸热反应', '勒夏特列原理', '平衡向水解方向移动', 'Fe(OH)₃浓度增大'],
        commonErrors: '常见错误：不写水解方程式；遗漏"水解是吸热反应"的关键信息；错误引用平衡移动方向；用物理原理解释颜色变化。',
        score: 6,
        examYear: '2024广州调研'
    },
    {
        id: 'reason_05',
        subject: '化学',
        framework: '原因分析',
        question: '为什么浓硫酸稀释时要把酸加入水中？',
        context: '实验室稀释浓硫酸的操作规范是：将浓硫酸沿容器壁缓慢倒入水中，边倒边搅拌。请解释为什么不能将水倒入浓硫酸中。',
        modelAnswer: {
            step1: '浓硫酸溶于水时放出大量热（溶解过程是放热过程），且浓硫酸密度比水大（约1.84g/cm³）',
            step2: '若将水倒入浓硫酸，水浮在浓硫酸表面，接触面局部温度骤升导致水瞬间沸腾汽化，使酸液飞溅造成危险；而将酸加入水中时，浓硫酸沉入水底并逐渐扩散，热量均匀分散',
            step3: '因此必须将浓硫酸沿器壁缓缓加入水中并搅拌，以确保安全'
        },
        keyPoints: ['浓硫酸溶于水放热', '密度比水大', '水浮在酸表面', '局部温度骤升', '酸液飞溅', '酸入水沉底扩散均匀'],
        commonErrors: '常见错误：只知道放热而不知道密度关系的决定性作用；未说明水浮在酸面的后果；缺少安全操作的完整逻辑链。',
        score: 6,
        examYear: '2023广东高考'
    },
    {
        id: 'reason_06',
        subject: '生物',
        framework: '原因分析',
        question: '为什么连续分裂的细胞具有细胞周期？',
        context: '洋葱根尖分生区细胞具有明显的细胞周期，能够持续进行有丝分裂。而神经细胞则不再分裂。请从细胞周期的概念和调控角度解释。',
        modelAnswer: {
            step1: '细胞周期是指连续分裂的细胞从一次分裂完成时开始到下一次分裂完成时为止所经历的过程，包括分裂间期（G₁、S、G₂期）和分裂期（M期）；细胞周期的运转受细胞周期蛋白和CDK等分子调控',
            step2: '分生区细胞接收到分裂信号后，细胞周期蛋白与CDK结合形成活性复合物，推动细胞依次通过各检验点，完成DNA复制和细胞分裂',
            step3: '因此具有分裂能力的细胞表现出周期性的DNA复制与分裂，而高度分化的神经细胞退出细胞周期进入G₀期不再分裂'
        },
        keyPoints: ['细胞周期定义', '间期G₁SG₂', '分裂期M期', '细胞周期蛋白', 'CDK', '检验点调控', 'G₀期退出'],
        commonErrors: '常见错误：仅描述阶段而忽视分子调控机制；混淆连续分裂细胞与暂不分裂细胞（G₀期）；遗漏"检验点"概念。',
        score: 6,
        examYear: '2024广州一模'
    },
    {
        id: 'reason_07',
        subject: '生物',
        framework: '原因分析',
        question: '为什么深海鱼被捕捞上岸后会死亡？',
        context: '深海鱼类生活在几百米甚至上千米的深海中，被打捞上岸后很快就会死亡。请从多角度解释这一现象。',
        modelAnswer: {
            step1: '深海环境具有高压（每深10m增加约1个大气压）、低温、低光照的特点；深海鱼体内气体压强与外界水压平衡，细胞膜结构和酶活性适应高压环境',
            step2: '被捕捞上岸后外界压强骤减，鱼体内溶解气体（尤其是氧气和氮气）迅速析出形成气泡栓塞血管，鱼鳔急剧膨胀挤压内脏，细胞膜上的不饱和脂肪酸比例变化导致膜流动性异常，酶的空间结构因压力骤变而失活',
            step3: '因此深海鱼因气压骤变导致的气体栓塞、器官损伤和细胞代谢紊乱而迅速死亡'
        },
        keyPoints: ['高压环境', '气体溶解度与压强关系', '气体栓塞', '鱼鳔膨胀', '细胞膜结构', '渗透压', '酶活性'],
        commonErrors: '常见错误：只提气压变化而不联系气体溶解度（亨利定律）；遗漏细胞层次的分析（膜结构、酶活性）；未用"气体栓塞"等专业术语。',
        score: 6,
        examYear: '2024广东高考适应性'
    },

    // ---------- 实验设计题（5道） ----------
    {
        id: 'experiment_01',
        subject: '生物',
        framework: '实验设计',
        question: '设计实验验证光合作用需要CO₂',
        context: '已知光合作用需要光、CO₂和水。请设计一个实验来验证CO₂是光合作用的必要条件。可选用材料：盆栽天竺葵、NaOH溶液（吸收CO₂）、清水、碘液、酒精、烧杯等。',
        modelAnswer: {
            step1: '取两盆长势相同的天竺葵，标记为A组（对照组）和B组（实验组），暗处理24小时耗尽叶片中原有淀粉',
            step2: '在A组烧杯中放清水，B组烧杯中放等量NaOH溶液（吸收CO₂），将两盆植物分别放入密闭玻璃罩中，置于相同光照条件下照射4小时',
            step3: '两组均在相同光照、温度条件下培养4小时',
            step4: '分别摘取A、B组叶片，用酒精隔水加热脱色后滴加碘液，观察颜色变化',
            step5: '若A组叶片变蓝（有淀粉生成），B组叶片不变蓝（无淀粉生成），则证明CO₂是光合作用的必要条件'
        },
        keyPoints: ['对照组与实验组', '单一变量CO₂', '暗处理耗尽淀粉', 'NaOH吸收CO₂', '碘液检测淀粉', '光照条件相同', '对照组变蓝实验组不变蓝'],
        commonErrors: '常见错误：不设置对照组；未做暗处理直接实验；未说明NaOH的作用；忽略其他条件的等量原则。',
        score: 10,
        examYear: '2023广东高考真题'
    },
    {
        id: 'experiment_02',
        subject: '生物',
        framework: '实验设计',
        question: '设计实验探究温度对酶活性的影响',
        context: '淀粉酶能催化淀粉水解为麦芽糖。请设计实验探究不同温度（0℃、37℃、60℃、100℃）对淀粉酶活性的影响。材料：α-淀粉酶溶液、淀粉溶液、碘液、试管、水浴锅等。',
        modelAnswer: {
            step1: '取4组试管，每组3支（平行实验），分别编号T₁-T₄，各组分别置于0℃（冰水浴）、37℃（温水浴）、60℃（热水浴）、100℃（沸水浴）中保温5分钟',
            step2: '向每组试管中各加入等量的α-淀粉酶溶液和淀粉溶液，分别在对应温度下反应5分钟',
            step3: '分别在各自温度下保温反应，严格控制反应时间5分钟',
            step4: '反应结束后立即向各试管加入等量碘液，观察并记录颜色变化（蓝色深浅表示淀粉剩余量）',
            step5: 'T₂（37℃）蓝色最浅或消失→酶活性最大；T₁蓝色较深→低温抑制酶活性；T₃蓝色较深→高温部分失活；T₄蓝色最深→高温使酶变性失活；结论：淀粉酶活性受温度影响，37℃最适'
        },
        keyPoints: ['设置温度梯度', '等量原则', '保温预处理', '控制反应时间', '碘液检测', '37℃最适温度', '100℃酶变性失活'],
        commonErrors: '常见错误：未设温度梯度或缺少最适温度；加碘液前未终止反应；混淆抑制与变性失活；缺少平行实验。',
        score: 10,
        examYear: '2024深圳一模'
    },
    {
        id: 'experiment_03',
        subject: '化学',
        framework: '实验设计',
        question: '设计实验证明某溶液中含有Fe²⁺',
        context: '实验室有一瓶未知浓度的浅绿色溶液，可能是FeSO₄溶液。请设计实验方案验证该溶液中含有Fe²⁺（需排除Fe³⁺干扰），写出操作步骤、预期现象和结论。',
        modelAnswer: {
            step1: '取两支洁净试管，分别编号①和②，各加入约2mL待测溶液作为实验组和对照组',
            step2: '向①号试管滴入2-3滴KSCN溶液，观察颜色变化（验证无Fe³⁺干扰）；再滴入几滴氯水（或H₂O₂），振荡观察；向②号试管滴入几滴NaOH溶液',
            step3: '室温下反应，振荡试管使充分接触',
            step4: '观察①号试管加KSCN后是否变红；加氯水后是否变红；观察②号试管沉淀颜色变化（先生成白色沉淀→迅速变为灰绿色→最终为红褐色）',
            step5: '若①号试管加KSCN不变红，加氯水后变红→证明原溶液含Fe²⁺无Fe³⁺；②号试管沉淀由白→灰绿→红褐→验证Fe(OH)₂被氧化为Fe(OH)₃，进一步确认Fe²⁺'
        },
        keyPoints: ['KSCN检验Fe³⁺排除干扰', '氯水/H₂O₂氧化Fe²⁺', '先不变红后变红', 'NaOH生成Fe(OH)₂白色沉淀', '沉淀颜色变化白→灰绿→红褐', '两组验证相互印证'],
        commonErrors: '常见错误：直接用KSCN而不排除Fe³⁺干扰；不写氧化剂名称；遗漏沉淀颜色变化描述；只会一种检验方法而缺少交叉验证。',
        score: 10,
        examYear: '2023广东高考'
    },
    {
        id: 'experiment_04',
        subject: '化学',
        framework: '实验设计',
        question: '设计实验比较Na₂CO₃和NaHCO₃的热稳定性',
        context: '碳酸钠（Na₂CO₃）和碳酸氢钠（NaHCO₃）是两种常见的钠盐，它们的化学性质有相似之处也有差异。请设计实验比较二者的热稳定性强弱。',
        modelAnswer: {
            step1: '取两支干燥试管，分别加入等量的Na₂CO₃固体粉末和NaHCO₃固体粉末，记为A管（Na₂CO₃）和B管（NaHCO₃）',
            step2: '将两支试管分别用带导管的单孔橡皮塞塞紧，导管另一端通入盛有澄清石灰水的试管中',
            step3: '用酒精灯同时均匀加热两支试管，控制加热温度和时间相同',
            step4: '观察并记录两试管内固体变化和对应石灰水的变化情况',
            step5: '加热NaHCO₃的试管连接的石灰水变浑浊（产生CO₂），加热Na₂CO₃的石灰水无明显变化→NaHCO₃受热分解：2NaHCO₃≜Na₂CO₃+CO₂↑+H₂O，Na₂CO₃受热不分解→结论：热稳定性Na₂CO₃ > NaHCO₃'
        },
        keyPoints: ['等量固体', '带导管连接石灰水', '均匀加热', '石灰水变浑浊检测CO₂', 'NaHCO₃分解方程式', 'Na₂CO₃不分解', '热稳定性比较结论'],
        commonErrors: '常见错误：未连接石灰水检测CO₂的生成；不写化学方程式；未控制变量（等量、同时加热）；遗漏实验结论表述。',
        score: 10,
        examYear: '2024广州调研'
    },
    {
        id: 'experiment_05',
        subject: '物理',
        framework: '实验设计',
        question: '设计实验测量重力加速度g',
        context: '利用单摆装置测量当地的重力加速度g。已知单摆周期公式T=2π√(L/g)，提供器材：铁架台、细线、小球（直径较小）、刻度尺、秒表。请设计实验方案。',
        modelAnswer: {
            step1: '将细线一端固定在铁架台上，另一端拴住小球，使摆线长度约1m；测量不同摆长（如0.5m、0.7m、1.0m、1.2m）各一组，每组为实验组',
            step2: '用刻度尺测量摆线长度L（悬点到球心距离=L线+d/2），将小球拉开一个小角度（<5°）后释放',
            step3: '让单摆在竖直平面内做简谐运动，等待摆动稳定后开始计时',
            step4: '用秒表测量单摆完成30次全振动所用时间t，则周期T=t/30；每个摆长重复测量3次取平均值',
            step5: '将数据代入g=4π²L/T²计算每组g值，取平均值即为测量结果；也可作T²-L图，斜率k=4π²/g则g=4π²/k，可减小偶然误差'
        },
        keyPoints: ['单摆周期公式T=2π√(L/g)', '摆角<5°', '摆长L线+d/2', '测30次全振动取平均值', 'T²-L图像法', '重复测量减小误差'],
        commonErrors: '常见错误：摆角过大不满足简谐运动条件；摆长测量未包含球半径；周期测量只用一次全振动；遗漏图像法处理数据。',
        score: 10,
        examYear: '2024广东高考'
    },

    // ---------- 曲线分析题（3道） ----------
    {
        id: 'curve_01',
        subject: '生物',
        framework: '曲线分析',
        question: '分析光合作用速率日变化曲线（双峰型，中午光合午休）',
        context: '下图为某植物在晴天条件下光合作用速率的日变化曲线。曲线呈双峰型：上午从6:00起光合速率逐渐升高，到10:00左右达到第一个高峰，此后开始下降，到13:00左右达到低谷（光合午休），14:00后又开始回升，16:00达到第二个高峰（低于第一个），此后逐渐下降至日落趋零。',
        modelAnswer: {
            step1: '整体趋势为双峰型：上午6:00-10:00逐步上升（第一个峰），10:00-13:00下降至低谷（光合午休），13:00-16:00回升至第二个峰（较低），16:00后持续下降至日落',
            step2: '上午升温光照增强→气孔开放CO₂供应充足→光合速率上升；中午高温强光→气孔部分关闭减少蒸腾→CO₂供应不足→光合速率下降（光合午休）；午后温度回落→气孔重新开放→光合速率回升；傍晚光照减弱→光合速率下降',
            step3: '关键拐点①10:00左右（第一个峰值——光照增强与CO₂供应平衡点），②13:00左右（低谷——光合午休最深处），③16:00左右（第二个峰——下午CO₂恢复与光照减弱的平衡点）',
            step4: '与阴天单峰曲线对比：晴天有午休现象而阴天没有（光照弱气孔不关闭）；与C₄植物对比：C₄植物CO₂补偿点低，一般无光合午休'
        },
        keyPoints: ['双峰型', '光合午休', '气孔关闭', 'CO₂供应不足', '蒸腾作用', '关键拐点三处', 'C₃与C₄对比'],
        commonErrors: '常见错误：不知道午休机制是气孔关闭而非光合酶失活；遗漏午后第二个峰的解释；未区分C₃和C₄植物的差异；忽略对比分析。',
        score: 8,
        examYear: '2023广东高考'
    },
    {
        id: 'curve_02',
        subject: '化学',
        framework: '曲线分析',
        question: '分析化学平衡中反应速率-时间曲线',
        context: '可逆反应mA+nB⇌pC+qD（正反应为放热反应），在t₁时刻增大反应物A的浓度（或升高温度，或增大压强），v-t曲线发生如下变化：v正瞬间上升，v逆逐渐上升至新平衡。请分析图像变化规律。',
        modelAnswer: {
            step1: '增大反应物浓度后：v正瞬间上升（反应物浓度增大），v逆从原平衡点逐渐上升（生成物浓度暂时不变，随正反应进行产物浓度增大），两条曲线最终在更高反应速率处相交达到新平衡',
            step2: '增大反应物浓度使Qc<K（或Q<K），平衡向正反应方向移动以抵消浓度变化，符合勒夏特列原理；升高温度使平衡向吸热方向（逆反应方向）移动；增大压强使平衡向气体分子数减少方向移动',
            step3: '关键拐点t₁处：v正曲线出现跳跃式上升（瞬时变化），v逆曲线在t₁处无跳跃，从t₁后逐渐平滑上升；表征浓度变化只瞬间影响正向反应速率',
            step4: '对比：增大生成物浓度→v逆瞬间上升v正逐渐上升；加入催化剂→v正和v逆同比例上升不改变平衡位置；升高温度→吸热方向速率增大更多'
        },
        keyPoints: ['v正瞬间上升', 'v逆逐渐上升', '勒夏特列原理', 'Qc<K平衡正移', '拐点t₁瞬时跳跃', '催化剂同比例影响', '温度影响速率和平衡'],
        commonErrors: '常见错误：认为改变浓度时正逆反应速率同时瞬间变化；混淆速率变化和平衡移动的关系；遗漏Qc（或Q）与K的比较；对催化剂作用理解不到位。',
        score: 8,
        examYear: '2024广州一模'
    },
    {
        id: 'curve_03',
        subject: '物理',
        framework: '曲线分析',
        question: '分析电源输出功率-外电阻曲线',
        context: '某闭合电路中电源电动势E、内阻r一定，负载为可变电阻R。输出功率P出=I²R随R变化曲线如图所示，呈先升后降趋势，在R=r处取得最大值Pmax=E²/(4r)。曲线两端：R→0时P出→0，R→∞时P出→0。',
        modelAnswer: {
            step1: '整体趋势为先增大后减小（单峰型）：R从0增大到r过程中P出逐渐增大，R=r时达到最大值，R>r后P出逐渐减小并趋近于0',
            step2: 'P出=I²R=[E/(R+r)]²R。当R<r时，R增大使电流I=E/(R+r)减小，但R增大对P出的正向贡献大于I²减小的负向贡献，故P出增大；当R=r时两者平衡P出最大；当R>r时R增大对P出的贡献小于I²减小的贡献，P出减小',
            step3: '关键拐点R=r处：输出功率最大Pmax=E²/(4r)，此时电源效率η=R/(R+r)=50%只有一半能量输出给外电路；该点左侧P出随R增大而增大，右侧随R增大而减小',
            step4: '对比：电源总功率P总=EI=E²/(R+r)随R增大单调递减，电源内耗功率Pr=I²r随R增大单调递减；输出功率最大时效率仅50%，效率最高时（R→∞）输出功率趋零，说明功率与效率存在矛盾'
        },
        keyPoints: ['先升后降单峰型', 'R=r时Pmax', 'Pmax=E²/(4r)', '功率公式P出=I²R', 'I=E/(R+r)', '最大功率时效率50%', '功率与效率矛盾'],
        commonErrors: '常见错误：不能正确推导P出-R关系式；误以为R越大输出功率越大；遗漏最大功率时效率为50%的结论；混淆输出功率、总功率和内耗功率三者关系。',
        score: 8,
        examYear: '2024深圳二模'
    }
];

// ==================== 框架定义 ====================
var FRAMEWORKS = {
    '原因分析': {
        name: '原因分析题 - 三段式',
        steps: ['原理阐述', '变化过程', '结论结果'],
        template: '因为...（原理阐述），导致...（变化过程），所以...（结论结果）',
        descriptions: [
            '引用教材核心概念/定律/原理，阐述相关的科学原理',
            '描述具体对象的变化过程，说明中间因果关系',
            '得出最终结论，回扣题目所问'
        ],
        example: {
            question: '为什么深海鱼被捕捞上岸后会死亡？',
            steps: [
                '深海鱼体内气体压强与外界水压平衡，细胞膜结构和酶活性适应高压环境。根据亨利定律，气体在液体中的溶解度与压强成正比。',
                '捕捞上岸后外界压强骤减，鱼体内溶解气体迅速析出形成气泡栓塞血管，鱼鳔急剧膨胀挤压内脏器官，细胞膜流动性异常、酶空间结构因压力骤变失活。',
                '因此深海鱼因气压骤变导致的气体栓塞、器官损伤和细胞代谢紊乱而迅速死亡。'
            ]
        },
        perfectAnswer: '满分答案：原理引用正确（亨利定律/气体溶解度），变化过程清晰（气泡栓塞→器官损伤→代谢紊乱），结论完整回扣题目。',
        poorAnswer: '失分答案：只写"因为压强变了鱼就死了"，缺少原理引用、缺少具体过程分析、缺少专业术语。'
    },
    '实验设计': {
        name: '实验设计题 - 五步法',
        steps: ['分组', '处理', '培养/反应', '观察记录', '预期结果'],
        template: '分组→处理→培养/反应→观察记录→预期结果',
        descriptions: [
            '设置对照组与实验组，遵循单一变量原则，确保其他条件相同且适宜',
            '对实验组施加自变量处理，对照组不做处理或做空白处理，说明具体操作步骤',
            '将各组置于相同且适宜的条件下培养或反应，控制无关变量',
            '明确观察指标和测量方法，说明记录什么数据、用什么工具',
            '预测实验结果，根据假设推导结论，形成"若...则..."的逻辑闭环'
        ],
        example: {
            question: '设计实验验证"光照强度对光合作用速率的影响"',
            steps: [
                '取生长状况相同的盆栽植物3盆，分别标记A（强光）、B（中光）、C（弱光），暗处理24h耗尽淀粉。',
                'A组置于距光源20cm处、B组40cm处、C组80cm处（控制光照强度为唯一变量），其他条件相同。',
                '在相同温度（25℃）、相同CO₂浓度下光照4小时。',
                '摘取各组的等量叶片，酒精脱色后滴加碘液，用比色卡比较蓝色深浅（或用排水集气法测量O₂释放量）。',
                '预期：A组蓝色最深（光合速率最高），B组次之，C组最浅。说明在一定范围内光照越强光合速率越高。'
            ]
        },
        perfectAnswer: '满分答案：分组明确（对照组+实验组），单一变量控制到位，操作步骤具体可操作，检测指标量化，预期结果与结论逻辑闭环。',
        poorAnswer: '失分答案：只写"拿两盆植物一盆照光一盆不照光"，未说明如何控制变量、未写具体操作步骤、未写预期结果。'
    },
    '曲线分析': {
        name: '曲线分析题 - 四步法',
        steps: ['趋势描述', '原因解释', '关键拐点', '对比分析'],
        template: '趋势描述→原因解释→关键拐点→对比分析',
        descriptions: [
            '描述曲线整体变化趋势：上升/下降/先升后降/波动等，注意区分阶段',
            '用学科原理解释每一阶段趋势变化的根本原因和机制',
            '标注曲线中的关键拐点（转折点、极值点、交点），解释拐点含义',
            '多条曲线间或与标准曲线的对比，说明差异原因和意义'
        ],
        example: {
            question: '分析光合作用速率随CO₂浓度变化的曲线图',
            steps: [
                '曲线整体呈先升后平趋势：CO₂浓度从0→C₀阶段，光合速率随CO₂浓度增加线性上升；C₀→C₁阶段上升放缓；C₁以后趋于稳定（饱和）。',
                'CO₂是光合作用暗反应的原料，浓度增大→CO₂固定速率加快→光合速率上升；达到CO₂饱和点(C₁)后，受光反应产生的[H]和ATP供应限制，光合速率不再增加。',
                '关键拐点①CO₂补偿点（曲线与X轴交点）：光合速率=呼吸速率，净光合为0；②CO₂饱和点C₁：此后增加CO₂光合速率不再增加，限制因素转为光照强度和温度。',
                '对比：C₃植物CO₂饱和点高，C₄植物CO₂饱和点低（C₄植物对CO₂亲和力高）；光照强时CO₂饱和点更高，光照弱时CO₂饱和点更低。'
            ]
        },
        perfectAnswer: '满分答案：趋势分阶段描述清晰，原理引用准确（暗反应/光反应/CO₂固定），拐点名称与含义正确，对比分析有深度。',
        poorAnswer: '失分答案：只写"CO₂越多光合越强"，未分阶段描述、未指出饱和现象、未分析拐点含义、未做对比分析。'
    }
};

// ==================== 主模块 ====================
var openAnswerTrainer = {
    // 状态
    currentFramework: '原因分析',
    currentQuestionIndex: 0,
    currentStep: 1,
    userAnswers: {},
    records: [],

    // 初始化
    init: function() {
        var self = this;
        self.loadRecords();
        self.render();
    },

    // 加载记录
    loadRecords: function() {
        var raw = localStorage.getItem('hspcb_open_answer_records');
        if (raw) {
            try {
                this.records = JSON.parse(raw);
            } catch (e) {
                this.records = [];
            }
        } else {
            this.records = [];
        }
    },

    // 保存记录
    saveRecords: function() {
        localStorage.setItem('hspcb_open_answer_records', JSON.stringify(this.records));
    },

    // 获取当前框架下的题目
    getQuestionsByFramework: function(fw) {
        var result = [];
        for (var i = 0; i < QUESTION_BANK.length; i++) {
            if (QUESTION_BANK[i].framework === fw) {
                result.push(QUESTION_BANK[i]);
            }
        }
        return result;
    },

    // 获取当前题目
    getCurrentQuestion: function() {
        var qs = this.getQuestionsByFramework(this.currentFramework);
        return qs[this.currentQuestionIndex] || null;
    },

    // 检查题目是否已完成
    isQuestionCompleted: function(qid) {
        for (var i = 0; i < this.records.length; i++) {
            if (this.records[i].qid === qid) {
                return true;
            }
        }
        return false;
    },

    // 获取题目得分
    getQuestionScore: function(qid) {
        for (var i = 0; i < this.records.length; i++) {
            if (this.records[i].qid === qid) {
                return this.records[i].score;
            }
        }
        return null;
    },

    // 评分
    gradeAnswer: function(qid, answers) {
        var q = null;
        for (var i = 0; i < QUESTION_BANK.length; i++) {
            if (QUESTION_BANK[i].id === qid) {
                q = QUESTION_BANK[i];
                break;
            }
        }
        if (!q) return { total: 0, details: [] };

        var fw = FRAMEWORKS[q.framework];
        var steps = fw.steps;
        var totalScore = 0;
        var details = [];
        var maxStepScore = 2;
        var keywordBonus = 0;

        for (var s = 0; s < steps.length; s++) {
            var stepKey = 'step' + (s + 1);
            var userAnswer = (answers && answers[stepKey]) ? answers[stepKey] : '';
            var stepScore = 0;
            var feedback = '';

            if (userAnswer.trim().length > 0) {
                stepScore = Math.min(maxStepScore, Math.ceil(userAnswer.trim().length / 15));
                // 关键词匹配加分
                var matchedKeys = [];
                for (var k = 0; k < q.keyPoints.length; k++) {
                    if (userAnswer.indexOf(q.keyPoints[k]) !== -1) {
                        matchedKeys.push(q.keyPoints[k]);
                        keywordBonus += 0.5;
                    }
                }
                if (matchedKeys.length > 0) {
                    feedback = '匹配关键词: ' + matchedKeys.join('、');
                }
                if (userAnswer.trim().length < 8) {
                    stepScore = Math.max(0.5, stepScore);
                    if (!feedback) feedback = '作答内容过短，建议补充更多细节';
                }
            } else {
                stepScore = 0;
                feedback = '未作答此步骤';
            }

            totalScore += stepScore;
            details.push({
                step: steps[s],
                stepKey: stepKey,
                userAnswer: userAnswer,
                score: stepScore,
                maxScore: maxStepScore,
                feedback: feedback
            });
        }

        totalScore = Math.min(totalScore + Math.floor(keywordBonus), q.score);
        totalScore = Math.round(totalScore * 10) / 10;

        return {
            total: totalScore,
            maxTotal: q.score,
            details: details,
            keywordBonus: Math.floor(keywordBonus)
        };
    },

    // 切换框架
    switchFramework: function(fw) {
        this.currentFramework = fw;
        this.currentQuestionIndex = 0;
        this.currentStep = 1;
        this.userAnswers = {};
        this.render();
    },

    // 切换题目
    switchQuestion: function(index) {
        this.currentQuestionIndex = index;
        this.currentStep = 1;
        this.userAnswers = {};
        this.render();
    },

    // 进入下一步
    nextStep: function() {
        var q = this.getCurrentQuestion();
        if (!q) return;

        if (this.currentStep === 1) {
            // 保存框架选择
            this.userAnswers.frameworkChoice = q.framework;
            this.currentStep = 2;
        } else if (this.currentStep === 2) {
            // 保存框架步骤作答
            this.currentStep = 3;
        } else if (this.currentStep === 3) {
            // 进入评分
            this.currentStep = 4;
        } else if (this.currentStep === 4) {
            // 完成，保存记录
            this.saveCurrentRecord();
            // 自动跳下一题
            var qs = this.getQuestionsByFramework(this.currentFramework);
            if (this.currentQuestionIndex < qs.length - 1) {
                this.currentQuestionIndex++;
                this.currentStep = 1;
                this.userAnswers = {};
            }
        }
        this.render();
    },

    // 保存当前答题记录
    saveCurrentRecord: function() {
        var q = this.getCurrentQuestion();
        if (!q) return;

        var grading = this.gradeAnswer(q.id, this.userAnswers);

        // 检查是否已有记录
        var existingIndex = -1;
        for (var i = 0; i < this.records.length; i++) {
            if (this.records[i].qid === q.id) {
                existingIndex = i;
                break;
            }
        }

        var record = {
            qid: q.id,
            subject: q.subject,
            framework: q.framework,
            question: q.question,
            score: grading.total,
            maxScore: grading.maxTotal,
            answers: this.userAnswers,
            gradingDetails: grading.details,
            keywordBonus: grading.keywordBonus,
            timestamp: new Date().toISOString()
        };

        if (existingIndex >= 0) {
            this.records[existingIndex] = record;
        } else {
            this.records.push(record);
        }
        this.saveRecords();
        this.render();
    },

    // 获取统计
    getStats: function() {
        var total = QUESTION_BANK.length;
        var completed = this.records.length;
        var totalScore = 0;
        var maxPossible = 0;

        for (var i = 0; i < this.records.length; i++) {
            totalScore += this.records[i].score;
            maxPossible += this.records[i].maxScore;
        }

        var avgScore = completed > 0 ? Math.round((totalScore / completed) * 10) / 10 : 0;

        var byFramework = { '原因分析': 0, '实验设计': 0, '曲线分析': 0 };
        var byFrameworkTotal = { '原因分析': 7, '实验设计': 5, '曲线分析': 3 };

        for (var j = 0; j < this.records.length; j++) {
            var fw = this.records[j].framework;
            if (byFramework[fw] !== undefined) {
                byFramework[fw]++;
            }
        }

        return {
            total: total,
            completed: completed,
            avgScore: avgScore,
            totalScore: totalScore,
            byFramework: byFramework,
            byFrameworkTotal: byFrameworkTotal
        };
    },

    // ==================== 渲染 ====================
    render: function() {
        var container = document.getElementById('open-answer-trainer-app');
        if (!container) {
            console.warn('容器 #open-answer-trainer-app 未找到，将在 DOMContentLoaded 时重试');
            return;
        }

        var self = this;
        var q = self.getCurrentQuestion();
        var fw = FRAMEWORKS[self.currentFramework];
        var qs = self.getQuestionsByFramework(self.currentFramework);
        var stats = self.getStats();

        var html = '';
        html += '<div style="font-family:\'Microsoft YaHei\',\'PingFang SC\',sans-serif;max-width:1200px;margin:0 auto;padding:12px;">';

        // ===== 顶部：框架Tab切换 =====
        html += '<div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">';
        var frameworks = ['原因分析', '实验设计', '曲线分析'];
        var fwColors = { '原因分析': '#e74c3c', '实验设计': '#2ecc71', '曲线分析': '#3498db' };
        var fwIcons = { '原因分析': '🔍', '实验设计': '🧪', '曲线分析': '📈' };

        for (var fi = 0; fi < frameworks.length; fi++) {
            var fwName = frameworks[fi];
            var isActive = self.currentFramework === fwName;
            var disabledCount = stats.byFramework[fwName] || 0;
            var disabledTotal = stats.byFrameworkTotal[fwName] || 0;
            html += '<div style="' +
                'padding:10px 18px;border-radius:10px;cursor:pointer;font-weight:600;font-size:14px;' +
                'transition:all 0.2s;user-select:none;' +
                'border:2px solid ' + (isActive ? fwColors[fwName] : '#e0e0e0') + ';' +
                'background:' + (isActive ? fwColors[fwName] : '#fff') + ';' +
                'color:' + (isActive ? '#fff' : '#333') + ';' +
                '" onclick="openAnswerTrainer.switchFramework(\'' + fwName + '\')">' +
                fwIcons[fwName] + ' ' + fwName + ' ' +
                '<span style="font-size:11px;opacity:0.8;">(' + disabledCount + '/' + disabledTotal + ')</span>' +
                '</div>';
        }
        html += '</div>';

        // ===== 主体三栏布局 =====
        html += '<div style="display:flex;gap:10px;flex-wrap:wrap;">';

        // ---- 左侧：题目列表 ----
        html += '<div style="flex:0 0 240px;min-width:200px;background:#fff;border-radius:10px;padding:10px;border:1px solid #e8e8e8;max-height:500px;overflow-y:auto;">';
        html += '<div style="font-weight:700;font-size:13px;color:#555;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #eee;">📋 题目列表</div>';
        for (var qi = 0; qi < qs.length; qi++) {
            var questionItem = qs[qi];
            var isDone = self.isQuestionCompleted(questionItem.id);
            var isCurrent = qi === self.currentQuestionIndex;
            var qScore = self.getQuestionScore(questionItem.id);

            html += '<div style="' +
                'padding:8px 10px;margin-bottom:4px;border-radius:6px;cursor:pointer;font-size:12px;' +
                'transition:all 0.15s;' +
                'border:1px solid ' + (isCurrent ? fwColors[self.currentFramework] : 'transparent') + ';' +
                'background:' + (isCurrent ? 'rgba(' + (self.currentFramework === '原因分析' ? '231,76,60' : self.currentFramework === '实验设计' ? '46,204,113' : '52,152,219') + ',0.08)' : '#fafafa') + ';' +
                '" onclick="openAnswerTrainer.switchQuestion(' + qi + ')">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;">' +
                '<span style="font-weight:' + (isCurrent ? '700' : '400') + ';color:#333;">' +
                (isDone ? '✓ ' : '') + '#' + (qi + 1) + ' ' +
                '<span style="font-size:10px;background:#eee;padding:1px 5px;border-radius:3px;margin-left:2px;">' + questionItem.subject + '</span>' +
                '</span>' +
                (qScore !== null ? '<span style="color:' + fwColors[self.currentFramework] + ';font-weight:700;">' + qScore + '分</span>' : '') +
                '</div>' +
                '<div style="color:#888;font-size:11px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + questionItem.question + '</div>' +
                '</div>';
        }
        html += '</div>';

        // ---- 中间：题目展示 + 作答区 ----
        html += '<div style="flex:1;min-width:350px;background:#fff;border-radius:10px;padding:14px;border:1px solid #e8e8e8;min-height:400px;">';

        if (!q) {
            html += '<div style="text-align:center;color:#999;padding:60px 0;">暂无题目</div>';
        } else {
            // 题目信息
            html += '<div style="margin-bottom:10px;">';
            html += '<span style="background:' + fwColors[self.currentFramework] + ';color:#fff;padding:3px 10px;border-radius:12px;font-size:11px;margin-right:6px;">' + fwIcons[self.currentFramework] + ' ' + self.currentFramework + '</span>';
            html += '<span style="background:#f0f0f0;padding:3px 10px;border-radius:12px;font-size:11px;margin-right:6px;">' + q.subject + '</span>';
            html += '<span style="background:#f0f0f0;padding:3px 10px;border-radius:12px;font-size:11px;">满分' + q.score + '分</span>';
            html += '<span style="float:right;font-size:11px;color:#999;">' + q.examYear + '</span>';
            html += '</div>';

            html += '<div style="font-size:15px;font-weight:700;color:#222;margin-bottom:6px;">' + q.question + '</div>';
            if (q.context) {
                html += '<div style="background:#f8f9fa;padding:10px;border-radius:6px;font-size:12px;color:#555;margin-bottom:12px;line-height:1.8;">' + q.context + '</div>';
            }

            // 训练步骤
            html += '<div style="margin:12px 0;padding:8px;background:rgba(' + (self.currentFramework === '原因分析' ? '231,76,60' : self.currentFramework === '实验设计' ? '46,204,113' : '52,152,219') + ',0.05);border-radius:8px;">';

            // 步骤1：选择框架
            if (self.currentStep === 1) {
                html += '<div style="font-weight:700;font-size:13px;color:#333;margin-bottom:8px;">第1步：选择适用答题框架</div>';
                html += '<div style="font-size:12px;color:#888;margin-bottom:10px;">阅读题目，判断该题最适合使用哪种答题框架</div>';
                html += '<div style="display:flex;gap:6px;flex-wrap:wrap;">';
                for (var fi2 = 0; fi2 < frameworks.length; fi2++) {
                    var fn = frameworks[fi2];
                    var isSelected = self.userAnswers.frameworkChoice === fn;
                    html += '<label style="' +
                        'padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;border:2px solid ' + (isSelected ? fwColors[fn] : '#ddd') + ';' +
                        'background:' + (isSelected ? 'rgba(' + (fn === '原因分析' ? '231,76,60' : fn === '实验设计' ? '46,204,113' : '52,152,219') + ',0.1)' : '#fff') + ';' +
                        '">' +
                        '<input type="radio" name="frameworkChoice" value="' + fn + '" ' + (isSelected ? 'checked' : '') + ' style="margin-right:4px;" onchange="openAnswerTrainer.userAnswers.frameworkChoice=\'' + fn + '\';openAnswerTrainer.render();">' +
                        fwIcons[fn] + ' ' + FRAMEWORKS[fn].name +
                        '</label>';
                }
                html += '</div>';
            }

            // 步骤2：按框架步骤填写
            if (self.currentStep >= 2) {
                html += '<div style="font-weight:700;font-size:13px;color:#333;margin-bottom:4px;">第2步：按框架步骤作答</div>';
                html += '<div style="font-size:11px;color:#888;margin-bottom:10px;">框架：' + fw.template + '</div>';

                for (var si = 0; si < fw.steps.length; si++) {
                    var stepName = fw.steps[si];
                    var stepDesc = fw.descriptions[si];
                    var stepKey = 'step' + (si + 1);
                    var userVal = self.userAnswers[stepKey] || '';
                    var readonly = self.currentStep >= 3;

                    html += '<div style="margin-bottom:10px;border:1px solid #eee;border-radius:8px;padding:10px;background:#fafafa;">';
                    html += '<div style="font-weight:600;font-size:12px;color:' + fwColors[self.currentFramework] + ';margin-bottom:4px;">' +
                        '步骤' + (si + 1) + '：' + stepName + '</div>';
                    html += '<div style="font-size:11px;color:#888;margin-bottom:6px;">' + stepDesc + '</div>';

                    if (readonly) {
                        html += '<div style="padding:8px;background:#fff;border-radius:4px;min-height:30px;font-size:12px;border:1px solid #e0e0e0;line-height:1.6;color:#333;">' +
                            (userVal || '<span style="color:#ccc;">未作答</span>') + '</div>';
                    } else {
                        html += '<textarea id="answer-' + stepKey + '" ' +
                            'style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:12px;resize:vertical;min-height:50px;box-sizing:border-box;font-family:inherit;" ' +
                            'placeholder="请在此输入' + stepName + '的关键词或短语..." ' +
                            'oninput="openAnswerTrainer.userAnswers[\'' + stepKey + '\']=this.value;">' +
                            userVal +
                            '</textarea>';
                    }
                    html += '</div>';
                }
            }

            // 步骤3：查看标准答案对比
            if (self.currentStep >= 3) {
                html += '<div style="font-weight:700;font-size:13px;color:#333;margin-bottom:4px;margin-top:12px;border-top:1px solid #eee;padding-top:10px;">第3步：标准答案框架对比</div>';
                html += '<div style="background:#fffbe6;border:1px solid #ffd666;border-radius:8px;padding:12px;font-size:12px;line-height:1.8;">';

                var modelKeys = Object.keys(q.modelAnswer);
                for (var mk = 0; mk < modelKeys.length; mk++) {
                    var mLabel = fw.steps[mk] || modelKeys[mk];
                    html += '<div style="margin-bottom:6px;">';
                    html += '<span style="font-weight:600;color:' + fwColors[self.currentFramework] + ';">步骤' + (mk + 1) + '-' + mLabel + '：</span>';
                    html += '<span style="color:#333;">' + q.modelAnswer[modelKeys[mk]] + '</span>';
                    html += '</div>';
                }
                html += '<div style="margin-top:8px;padding-top:6px;border-top:1px dashed #ffd666;">';
                html += '<span style="font-weight:600;color:#e67e22;">📌 采分关键词：</span>';
                html += '<span style="color:#444;">' + q.keyPoints.join('、') + '</span>';
                html += '</div>';
                html += '<div style="margin-top:6px;padding-top:6px;border-top:1px dashed #ffd666;">';
                html += '<span style="font-weight:600;color:#e74c3c;">⚠ ' + q.commonErrors + '</span>';
                html += '</div>';
                html += '</div>';
            }

            // 步骤4：评分
            if (self.currentStep >= 4) {
                var grading = self.gradeAnswer(q.id, self.userAnswers);
                html += '<div style="font-weight:700;font-size:13px;color:#333;margin-bottom:4px;margin-top:12px;border-top:1px solid #eee;padding-top:10px;">第4步：系统评分</div>';
                html += '<div style="background:#f0faf0;border:2px solid #2ecc71;border-radius:10px;padding:14px;text-align:center;">';
                html += '<div style="font-size:36px;font-weight:700;color:#2ecc71;">' + grading.total + '<span style="font-size:18px;color:#999;"> / ' + grading.maxTotal + '</span></div>';
                html += '<div style="font-size:12px;color:#888;margin-top:4px;">（关键词匹配加分：+' + grading.keywordBonus + '分）</div>';
                html += '</div>';

                // 分步评分详情
                html += '<div style="margin-top:10px;">';
                for (var gi = 0; gi < grading.details.length; gi++) {
                    var detail = grading.details[gi];
                    html += '<div style="display:flex;align-items:center;padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:12px;">';
                    html += '<span style="flex:1;color:#555;">' + detail.step + '</span>';
                    html += '<span style="font-weight:600;color:' + (detail.score >= detail.maxScore ? '#2ecc71' : detail.score > 0 ? '#f39c12' : '#e74c3c') + ';">' + detail.score + '/' + detail.maxScore + '分</span>';
                    if (detail.feedback) {
                        html += '<span style="margin-left:6px;font-size:11px;color:#888;">' + detail.feedback + '</span>';
                    }
                    html += '</div>';
                }
                html += '</div>';
            }

            html += '</div>';

            // 操作按钮
            html += '<div style="margin-top:12px;display:flex;gap:8px;justify-content:center;">';
            if (self.currentStep === 1) {
                html += '<button style="padding:10px 28px;background:' + fwColors[self.currentFramework] + ';color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;" ' +
                    'onclick="openAnswerTrainer.nextStep()"' +
                    (self.userAnswers.frameworkChoice ? '' : ' disabled style="opacity:0.5;cursor:not-allowed;"') + '>确认框架 → 开始作答</button>';
            } else if (self.currentStep === 2) {
                html += '<button style="padding:10px 28px;background:' + fwColors[self.currentFramework] + ';color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;" ' +
                    'onclick="openAnswerTrainer.nextStep()">提交作答 → 查看标准答案</button>';
            } else if (self.currentStep === 3) {
                html += '<button style="padding:10px 28px;background:#e67e22;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;" ' +
                    'onclick="openAnswerTrainer.nextStep()">查看系统评分</button>';
            } else if (self.currentStep === 4) {
                html += '<button style="padding:10px 28px;background:#2ecc71;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;" ' +
                    'onclick="openAnswerTrainer.nextStep()">保存并进入下一题 →</button>';
                html += '<button style="padding:10px 20px;background:#fff;color:#e67e22;border:2px solid #e67e22;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;" ' +
                    'onclick="openAnswerTrainer.currentStep=2;openAnswerTrainer.render();">重新作答</button>';
            }
            html += '</div>';
        }

        html += '</div>';

        // ---- 右侧：框架提示卡片 ----
        html += '<div style="flex:0 0 260px;min-width:220px;">';

        // 框架说明卡片
        html += '<div style="background:#fff;border-radius:10px;padding:14px;border:1px solid #e8e8e8;margin-bottom:8px;">';
        html += '<div style="font-weight:700;font-size:14px;color:' + fwColors[self.currentFramework] + ';margin-bottom:8px;">📖 当前框架：' + fw.name + '</div>';
        html += '<div style="font-size:12px;color:#666;line-height:1.6;margin-bottom:10px;">' +
            '<span style="background:' + fwColors[self.currentFramework] + ';color:#fff;padding:2px 8px;border-radius:4px;">' + fw.template + '</span>' +
            '</div>';

        for (var si2 = 0; si2 < fw.steps.length; si2++) {
            html += '<div style="padding:6px 0;border-bottom:1px solid #f5f5f5;font-size:12px;">';
            html += '<span style="font-weight:600;color:' + fwColors[self.currentFramework] + ';">' + (si2 + 1) + '. ' + fw.steps[si2] + '</span>';
            html += '<div style="color:#888;font-size:11px;margin-top:2px;">' + fw.descriptions[si2] + '</div>';
            html += '</div>';
        }

        // 满分vs失分对比
        html += '<div style="margin-top:10px;padding:8px;background:#f0faf0;border-radius:6px;">';
        html += '<div style="font-size:11px;font-weight:600;color:#2ecc71;">✅ ' + fw.perfectAnswer + '</div>';
        html += '</div>';
        html += '<div style="margin-top:6px;padding:8px;background:#fef5f5;border-radius:6px;">';
        html += '<div style="font-size:11px;font-weight:600;color:#e74c3c;">❌ ' + fw.poorAnswer + '</div>';
        html += '</div>';

        html += '</div>';

        // 进度统计卡片
        html += '<div style="background:#fff;border-radius:10px;padding:14px;border:1px solid #e8e8e8;">';
        html += '<div style="font-weight:700;font-size:13px;color:#555;margin-bottom:10px;">📊 学习进度</div>';
        html += '<div style="font-size:12px;color:#666;line-height:1.8;">';
        html += '<div>总题量：<span style="font-weight:700;">' + stats.total + '</span> 道</div>';
        html += '<div>已完成：<span style="font-weight:700;color:#2ecc71;">' + stats.completed + '</span> 道</div>';
        html += '<div>完成率：<span style="font-weight:700;color:#3498db;">' + (stats.total > 0 ? Math.round(stats.completed / stats.total * 100) : 0) + '%</span></div>';
        html += '<div>平均分：<span style="font-weight:700;color:' + (stats.avgScore >= 6 ? '#2ecc71' : stats.avgScore >= 4 ? '#f39c12' : '#e74c3c') + ';">' + stats.avgScore + '</span></div>';
        html += '</div>';

        // 进度条
        var progressPct = stats.total > 0 ? Math.round(stats.completed / stats.total * 100) : 0;
        html += '<div style="margin-top:8px;background:#f0f0f0;border-radius:8px;height:12px;overflow:hidden;">';
        html += '<div style="width:' + progressPct + '%;height:100%;background:linear-gradient(90deg,#2ecc71,#27ae60);border-radius:8px;transition:width 0.5s;"></div>';
        html += '</div>';

        // 各框架进度
        html += '<div style="margin-top:12px;font-size:11px;color:#888;">';
        for (var fk in stats.byFramework) {
            if (stats.byFramework.hasOwnProperty(fk)) {
                var fCount = stats.byFramework[fk];
                var fTotal = stats.byFrameworkTotal[fk];
                var fPct = fTotal > 0 ? Math.round(fCount / fTotal * 100) : 0;
                html += '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
                    '<span>' + fwIcons[fk] + ' ' + fk + '</span>' +
                    '<span>' + fCount + '/' + fTotal + ' (' + fPct + '%)</span>' +
                    '</div>';
            }
        }
        html += '</div>';

        // 查看历史记录按钮
        html += '<button style="margin-top:12px;width:100%;padding:8px;background:#f0f0f0;border:1px solid #ddd;border-radius:6px;cursor:pointer;font-size:12px;color:#555;" ' +
            'onclick="openAnswerTrainer.showHistory()">📋 查看历史记录</button>';
        html += '</div>';

        html += '</div>'; // end 右侧

        html += '</div>'; // end 主体三栏

        html += '</div>'; // end 外层容器

        container.innerHTML = html;
    },

    // 显示历史记录
    showHistory: function() {
        var container = document.getElementById('open-answer-trainer-app');
        if (!container) return;

        var self = this;
        var html = '';

        html += '<div style="font-family:\'Microsoft YaHei\',\'PingFang SC\',sans-serif;max-width:800px;margin:0 auto;padding:12px;">';
        html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
        html += '<div style="font-size:16px;font-weight:700;color:#333;">📋 答题历史记录</div>';
        html += '<div style="display:flex;gap:8px;">';
        html += '<button style="padding:8px 16px;background:#fff;border:1px solid #ddd;border-radius:6px;cursor:pointer;font-size:12px;" ' +
            'onclick="openAnswerTrainer.render()">← 返回训练</button>';
        html += '<button style="padding:8px 16px;background:#e74c3c;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;" ' +
            'onclick="if(confirm(\'确定要清空所有答题记录吗？此操作不可撤销。\')){openAnswerTrainer.records=[];openAnswerTrainer.saveRecords();openAnswerTrainer.showHistory();}">清空记录</button>';
        html += '</div>';
        html += '</div>';

        if (self.records.length === 0) {
            html += '<div style="text-align:center;padding:40px;color:#999;background:#fff;border-radius:10px;border:1px solid #e8e8e8;">暂无答题记录，开始训练吧！</div>';
        } else {
            // 按时间倒序
            var sortedRecords = self.records.slice().sort(function(a, b) {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });

            var fwColors = { '原因分析': '#e74c3c', '实验设计': '#2ecc71', '曲线分析': '#3498db' };
            var fwIcons = { '原因分析': '🔍', '实验设计': '🧪', '曲线分析': '📈' };

            for (var ri = 0; ri < sortedRecords.length; ri++) {
                var rec = sortedRecords[ri];
                var dateStr = rec.timestamp ? new Date(rec.timestamp).toLocaleString('zh-CN') : '未知时间';
                var fwColor = fwColors[rec.framework] || '#999';
                var fwIcon = fwIcons[rec.framework] || '';

                html += '<div style="background:#fff;border-radius:10px;padding:14px;border:1px solid #e8e8e8;margin-bottom:8px;">';
                html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">';
                html += '<span style="font-weight:700;font-size:13px;color:#333;">' + rec.question + '</span>';
                html += '<span style="font-size:18px;font-weight:700;color:' + fwColor + ';">' + rec.score + '/' + rec.maxScore + '</span>';
                html += '</div>';
                html += '<div style="font-size:11px;color:#888;margin-bottom:6px;">';
                html += '<span style="background:' + fwColor + ';color:#fff;padding:2px 6px;border-radius:4px;margin-right:6px;">' + fwIcon + ' ' + rec.framework + '</span>';
                html += '<span style="background:#f0f0f0;padding:2px 6px;border-radius:4px;margin-right:6px;">' + rec.subject + '</span>';
                html += '<span>' + dateStr + '</span>';
                html += '</div>';

                // 展开详情
                html += '<details style="font-size:11px;color:#666;margin-top:6px;">';
                html += '<summary style="cursor:pointer;color:' + fwColor + ';font-weight:600;">查看作答详情</summary>';
                if (rec.gradingDetails) {
                    for (var gdi = 0; gdi < rec.gradingDetails.length; gdi++) {
                        var gd = rec.gradingDetails[gdi];
                        html += '<div style="padding:4px 0;border-bottom:1px solid #f5f5f5;">';
                        html += '<span style="font-weight:600;">' + gd.step + '(' + gd.score + '/' + gd.maxScore + '分)</span>: ';
                        html += '<span>' + (gd.userAnswer || '<i style="color:#ccc;">未作答</i>') + '</span>';
                        if (gd.feedback) {
                            html += ' <span style="color:#e67e22;">[' + gd.feedback + ']</span>';
                        }
                        html += '</div>';
                    }
                }
                html += '</details>';
                html += '</div>';
            }

            html += '<div style="text-align:center;font-size:11px;color:#999;margin-top:8px;">共 ' + sortedRecords.length + ' 条记录</div>';
        }

        html += '</div>';
        container.innerHTML = html;
    }
};

// 暴露到 window
window.openAnswerTrainer = openAnswerTrainer;

// DOM加载后初始化
document.addEventListener('DOMContentLoaded', function() {
    openAnswerTrainer.init();
});

// 如果DOM已经加载完毕，立即初始化
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    openAnswerTrainer.init();
}

})();

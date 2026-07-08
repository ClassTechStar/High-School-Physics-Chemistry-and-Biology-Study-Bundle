// 内容补深V3 - 实验题专项+选择题技巧+长难句分析

// ============================================================
// 模块1: experimentExamSpecial（物化生历年实验题专项）
// 容器ID: experiment-exam-special-app
// ============================================================
(function(){
'use strict';

var EXPERIMENT_QUESTIONS = [
    {
        id: 'p1',
        subject: '物理',
        year: 2024,
        chapter: '运动学',
        title: '测定匀变速直线运动加速度（打点计时器）',
        question: '某同学用电磁打点计时器研究小车在长木板上的匀加速直线运动。已知交流电源频率50Hz。请回答：\n(1) 除打点计时器、纸带、复写纸外，本实验还需要下列器材中的______（填字母）。\nA. 天平  B. 低压交流电源  C. 直流电源  D. 刻度尺\n(2) 实验中得到一条清晰纸带，舍去开始密集的点，每隔4个点取一个计数点，相邻计数点间距离分别为x1、x2、x3、x4、x5。已知逐差法计算加速度公式a=______。\n(3) 若测得x1=3.20cm，x2=4.70cm，x3=6.20cm，x4=7.70cm，x5=9.20cm，求加速度大小a=______ m/s²。',
        apparatus: ['电磁打点计时器', '纸带', '复写纸', '低压交流电源(4~6V)', '刻度尺', '小车', '长木板', '细线', '砝码'],
        steps: [
            '安装器材：长木板一端垫高平衡摩擦力，打点计时器固定在木板一端',
            '连接小车：用细线跨过滑轮连接小车与砝码，纸带穿过打点计时器',
            '接通电源：先接通电源再释放小车',
            '取下纸带：在小车到达滑轮前用手按住小车，断开电源',
            '数据处理：选取清晰一段，每隔4个点取计数点，测量各段距离',
            '逐差法计算加速度'
        ],
        scoringCriteria: [
            {item: '器材选择(BD)', score: 4, standard: '正确选择低压交流电源和刻度尺，每个2分'},
            {item: '逐差法公式', score: 5, standard: '写出a=[(x4+x5)-(x1+x2)]/(6T²)或正确变形，公式正确5分'},
            {item: '数据计算', score: 5, standard: 'T=0.1s代入正确，计算结果1.50m/s²，结果正确5分，过程对结果错3分'},
            {item: '实验步骤', score: 4, standard: '先接电源后释放小车2分；平衡摩擦力2分'},
            {item: '有效数字', score: 2, standard: '结果保留三位有效数字2分'}
        ],
        commonDeductions: [
            '错选直流电源或高压电源（-2分）',
            '公式中T取0.02s未考虑每隔4个点取计数点（-3分）',
            '忘记平衡摩擦力说明（-2分）',
            '先释放小车后接电源（-2分）',
            '有效数字位数错误（-1分）'
        ],
        fullScore: 20,
        answer: '(1) BD\n(2) a=[(x4+x5)-(x1+x2)]/(6T²)，其中T=5×0.02s=0.1s\n(3) a=[(7.70+9.20)-(3.20+4.70)]×10⁻²/(6×0.1²)=1.50 m/s²\n\n实验注意事项：①平衡摩擦力是关键；②先接电源后释放小车，避免开始点过密；③逐差法可减小偶然误差。'
    },
    {
        id: 'p2',
        subject: '物理',
        year: 2023,
        chapter: '电学',
        title: '测量金属丝电阻率（伏安法）',
        question: '某同学要测量一段金属丝的电阻率ρ。\n(1) 用螺旋测微器测金属丝直径d，读数如图所示，d=______ mm。\n(2) 已知金属丝电阻约5Ω，电源电动势3V，内阻不计。为减小误差，电流表应采用______接法（内/外），理由是______。\n(3) 用毫米刻度尺测金属丝长度L，用伏安法测电阻R，则电阻率ρ=______（用d、L、R表示）。\n(4) 若测得d=0.500mm，L=50.0cm，U=2.40V，I=0.50A，求ρ=______ Ω·m。',
        apparatus: ['螺旋测微器', '毫米刻度尺', '电压表(0~3V)', '电流表(0~0.6A)', '滑动变阻器', '直流电源(3V)', '开关', '导线', '待测金属丝'],
        steps: [
            '用螺旋测微器在金属丝三个不同位置测直径，取平均值',
            '用毫米刻度尺测接入电路的金属丝长度L（多次测量取平均）',
            '按电流表外接法连接电路（因Rx=5Ω远小于电压表内阻）',
            '滑动变阻器调至最大阻值，闭合开关',
            '改变滑动变阻器滑片位置，记录6组U、I数据',
            '断开电路，整理器材',
            '用U-I图象求斜率得电阻R，代入ρ=πd²R/(4L)求电阻率'
        ],
        scoringCriteria: [
            {item: '螺旋测微器读数', score: 3, standard: '正确读数0.500mm(需估读)，主尺+副尺各1.5分'},
            {item: '接法选择', score: 4, standard: '选外接法2分；理由Rx²<RV·RA或RV≫Rx给2分'},
            {item: '电阻率公式', score: 4, standard: 'ρ=πd²R/(4L)，公式正确4分'},
            {item: '数据计算', score: 5, standard: 'R=U/I=4.8Ω，ρ=π×(0.5×10⁻³)²×4.8/(4×0.5)=1.88×10⁻⁶Ω·m，结果4分，过程1分'},
            {item: '电路连接与操作', score: 4, standard: '滑动变阻器分压/限流接法正确2分；多次测量2分'}
        ],
        commonDeductions: [
            '螺旋测微器未估读到0.001mm（-1分）',
            '电流表内外接法判断错误（-2分）',
            '公式中漏掉π或4（-2分）',
            '单位换算错误（mm→m，cm→m）（-1分）',
            '只测一次求平均未体现（-1分）'
        ],
        fullScore: 20,
        answer: '(1) d=0.500mm（估读到千分位）\n(2) 外接法；因为金属丝电阻Rx≈5Ω远小于电压表内阻RV(约3kΩ)，采用外接法电压表分流误差小。\n(3) ρ=πd²R/(4L)\n(4) R=U/I=2.40/0.50=4.8Ω\nρ=π×(0.500×10⁻³)²×4.8/(4×0.500)=1.88×10⁻⁶ Ω·m\n\n注意：螺旋测微器需估读；长度应为接入电路的有效长度。'
    },
    {
        id: 'p3',
        subject: '物理',
        year: 2022,
        chapter: '力学',
        title: '验证机械能守恒定律',
        question: '用打点计时器和重物验证机械能守恒定律。\n(1) 实验中，重物应选______（填"较重"或"较轻"），目的是______。\n(2) 若纸带上第1点O为释放重物瞬间打的点，验证ΔEp=ΔEk时，应测出______。\n(3) 已知打点周期T=0.02s，测得某两点间距离h=19.6cm时对应速度v=1.96m/s，g=9.8m/s²。请验证此过程机械能是否守恒（保留三位有效数字）。\n(4) 实测mgh略大于½mv²的原因是______。',
        apparatus: ['电磁打点计时器', '纸带', '复写纸', '重物(带夹子)', '铁架台', '低压交流电源', '刻度尺', '导线'],
        steps: [
            '将打点计时器固定在铁架台上，纸带穿过打点计时器',
            '纸带下端用夹子夹住重物，重物靠近打点计时器',
            '先接通电源，再释放重物',
            '重物自由下落，打点计时器在纸带上打出点',
            '更换纸带重复实验多次',
            '选取点迹清晰、第1点O明显的纸带',
            '测量各点到O点距离h，计算各点速度v',
            '比较mgh与½mv²'
        ],
        scoringCriteria: [
            {item: '重物选择', score: 3, standard: '选较重2分；目的减小空气阻力影响1分'},
            {item: '验证量说明', score: 4, standard: '应测出下落高度h和瞬时速度v(通过Δx/T)4分'},
            {item: '守恒验证', score: 6, standard: 'mgh=1×9.8×0.196=1.92J，½mv²=0.5×1×1.96²=1.92J，二者相等4分；结论守恒2分'},
            {item: '误差原因', score: 4, standard: '存在空气阻力和摩擦阻力做负功3分；说明具体1分'},
            {item: '操作规范', score: 3, standard: '先接电源后释放1分；选O点明显纸带1分；多次实验1分'}
        ],
        commonDeductions: [
            '选轻物未说明减小阻力（-2分）',
            '速度计算用平均速度公式v=Δx/T错误（-2分）',
            '验证时忘记比较mgh与½mv²（-2分）',
            '误差原因只写"实验误差"无具体分析（-2分）',
            '第1点O不是速度零点（-1分）'
        ],
        fullScore: 20,
        answer: '(1) 较重；减小空气阻力对实验的影响，使重力势能减小量更接近动能增加量。\n(2) 应测出重物下落高度h，以及该时刻的速度v（通过v=Δx/T计算相邻计数点间平均速度近似为瞬时速度）。\n(3) mgh=1×9.8×0.196=1.921J\n½mv²=0.5×1×1.96²=1.921J\n两者近似相等，机械能守恒。\n(4) 重物下落过程中受空气阻力作用，且打点计时器对纸带有摩擦力，这些阻力做负功使部分机械能转化为内能，导致实测mgh略大于½mv²。\n\n注意：第1点O点应满足v≈0。'
    },
    {
        id: 'p4',
        subject: '物理',
        year: 2025,
        chapter: '电学',
        title: '测定电源电动势和内阻',
        question: '用电流表和电压表测定一节干电池的电动势E和内阻r。\n(1) 在方框中画出实验电路图（已知电压表内阻RV=3kΩ，电流表内阻RA=0.1Ω）。\n(2) 由实验数据作出U-I图象，图线纵截距表示______，斜率绝对值表示______。\n(3) 若图线纵截距为1.50V，斜率为-3.0V/A，则E=______V，r=______Ω。\n(4) 实验测得内阻r偏大还是偏小？原因是什么？',
        apparatus: ['干电池', '电压表(0~3V)', '电流表(0~0.6A)', '滑动变阻器', '开关', '导线'],
        steps: [
            '按电路图连接：电压表并联在电池两端，电流表与滑动变阻器串联后接电池',
            '滑动变阻器调到最大阻值',
            '闭合开关，记录电压表和电流表读数',
            '改变滑动变阻器阻值，记录6组以上U、I数据',
            '断开开关，整理器材',
            '作U-I图象，由图象求E和r'
        ],
        scoringCriteria: [
            {item: '电路图', score: 5, standard: '电流表内接(相对电池)3分；滑动变阻器限流接法2分'},
            {item: '图象含义', score: 4, standard: '纵截距=电动势E，2分；斜率绝对值=内阻r，2分'},
            {item: '计算结果', score: 5, standard: 'E=1.50V 2分；r=3.0Ω 2分；单位正确1分'},
            {item: '误差分析', score: 6, standard: '内阻r测量值偏大2分；原因电流表分压使路端电压测量偏低3分；具体说明1分'}
        ],
        commonDeductions: [
            '电流表外接(测r偏小)（-3分）',
            '混淆图象截距和斜率含义（-2分）',
            'U-I图象不过原点未说明（-1分）',
            '误差分析方向错误（-3分）',
            '未说明干电池内阻较小需电流表内接（-1分）'
        ],
        fullScore: 20,
        answer: '(1) 电路：电池→开关→电流表→滑动变阻器→回电池；电压表并联在电池两端(电流表内接)。\n(2) 纵截距表示电源电动势E；斜率绝对值表示电源内阻r。\n(3) E=1.50V，r=3.0Ω\n(4) 测得内阻r偏大。原因：本电路采用电流表内接法，电压表分流使电流测量值I测小于真实干路电流I真，由U=E-Ir知，相同U下I测偏小，导致图线更陡，斜率绝对值偏大，即r测>r真。\n\n注意：干电池内阻小，必须用电流表内接法减小系统误差。'
    },
    {
        id: 'p5',
        subject: '物理',
        year: 2024,
        chapter: '力学',
        title: '探究弹簧弹力与伸长量关系',
        question: '用如图所示装置探究弹簧弹力F与伸长量x的关系。\n(1) 实验前应先测量弹簧的______。\n(2) 悬挂钩码后，应等弹簧______再读数。每次增加一个钩码，测出对应弹簧长度，则伸长量x=______。\n(3) 测得数据如下表，请判断在弹性限度内F与x是否成正比，并求劲度系数k。\n| F/N | 0.5 | 1.0 | 1.5 | 2.0 | 2.5 |\n| x/cm | 1.0 | 2.1 | 3.0 | 4.0 | 5.1 |\n(4) 若弹簧自身重力不可忽略，对实验结果有何影响？',
        apparatus: ['弹簧', '钩码(若干个)', '刻度尺', '铁架台', '指针'],
        steps: [
            '将弹簧一端固定在铁架台上，自然下垂',
            '测量弹簧原长L0(不挂钩码时)',
            '挂上一个钩码，待弹簧静止后读出弹簧长度L1',
            '逐个增加钩码，记录对应弹簧长度Ln',
            '计算伸长量x=Ln-L0',
            '记录钩码重力F(等于弹力)',
            '作F-x图象分析'
        ],
        scoringCriteria: [
            {item: '原长测量', score: 3, standard: '测量弹簧原长L0(自然下垂状态)3分'},
            {item: '读数时机', score: 3, standard: '等弹簧静止(平衡)后读数2分；伸长量x=L-L0 1分'},
            {item: '数据处理', score: 7, standard: '判断成正比(各点近似在过原点直线上)3分；劲度系数k=ΔF/Δx≈50N/m，用图象斜率或差值法2分；单位2分'},
            {item: '重力影响', score: 4, standard: '弹簧自身重力使初始有伸长3分；导致图象不过原点但斜率(劲度系数)不变1分'},
            {item: '操作规范', score: 3, standard: '多次测量2分；不超过弹性限度1分'}
        ],
        commonDeductions: [
            '未说明测原长需自然下垂状态（-1分）',
            '读数时机错误(未等静止)（-2分）',
            '伸长量与弹簧总长混淆（-2分）',
            '劲度系数单位写成N/cm（-1分）',
            '超过弹性限度未说明（-1分）',
            '弹簧自重影响分析不全（-2分）'
        ],
        fullScore: 20,
        answer: '(1) 弹簧原长L0（自然下垂时的长度）\n(2) 静止(平衡)；x=L-L0，L为挂钩码后弹簧总长\n(3) 由表中数据，ΔF/Δx≈0.5/0.01=50 N/m，各点近似在过原点的直线上，故在弹性限度内F与x成正比，劲度系数k≈50 N/m。\n(4) 若弹簧自身重力不可忽略，会使弹簧在未挂钩码时已有一定伸长，导致F-x图象不过原点(横截距为负)，但图象斜率(劲度系数)不受影响。\n\n注意：实验中钩码重力不能超过弹簧弹性限度。'
    },
    {
        id: 'c1',
        subject: '化学',
        year: 2023,
        chapter: '氯及其化合物',
        title: '氯气制备及性质验证',
        question: '实验室用MnO₂与浓盐酸制备Cl₂并验证其性质。\n(1) 写出制取Cl₂的化学方程式______。\n(2) 装置连接顺序为：发生装置→______装置→______装置→收集装置→尾气处理。其中盛装饱和食盐水的作用是______；盛装浓硫酸的作用是______。\n(3) 用排空气法收集Cl₂时，应从______（填"上"或"下"）方进气，因为______。\n(4) 尾气处理用NaOH溶液，反应方程式为______。',
        apparatus: ['圆底烧瓶', '分液漏斗', '酒精灯', '石棉网', '铁架台', '导气管', '集气瓶', '饱和食盐水洗气瓶', '浓硫酸洗气瓶', 'NaOH溶液尾气吸收瓶'],
        steps: [
            '检查装置气密性',
            '装入MnO₂于圆底烧瓶，浓盐酸装入分液漏斗',
            '连接好发生装置→饱和食盐水→浓硫酸→收集装置→尾气处理',
            '加热(需加热)使反应进行',
            '观察黄绿色气体生成，收集气体',
            '验满：用湿润的淀粉KI试纸放在集气瓶口，变蓝则满',
            '实验结束先撤导管后熄灯，尾气用NaOH吸收'
        ],
        scoringCriteria: [
            {item: '化学方程式', score: 5, standard: 'MnO₂+4HCl(浓)△=MnCl₂+Cl₂↑+2H₂O，配平2分，条件1分，气体符号1分，浓盐酸注明1分'},
            {item: '装置顺序', score: 5, standard: '除杂(饱和食盐水)2分；干燥(浓硫酸)2分；顺序正确1分'},
            {item: '收集方法', score: 4, standard: '上方进气2分；原因Cl₂密度比空气大2分'},
            {item: '尾气处理', score: 3, standard: '方程式Cl₂+2NaOH=NaCl+NaClO+H₂O，配平2分，产物1分'},
            {item: '操作规范', score: 3, standard: '气密性检查1分；先撤导管后熄灯1分；验满方法1分'}
        ],
        commonDeductions: [
            '方程式未配平或漏写条件（-2分）',
            '除杂与干燥顺序颠倒（-2分）',
            '用排水法收集Cl₂（-2分）',
            '未说明需加热（-1分）',
            '漏写浓盐酸的"浓"字（-1分）',
            '尾气直接排空（-2分）'
        ],
        fullScore: 20,
        answer: '(1) MnO₂ + 4HCl(浓) ==△== MnCl₂ + Cl₂↑ + 2H₂O\n(2) 除杂(饱和食盐水)；干燥(浓硫酸)；饱和食盐水作用：除去Cl₂中混有的HCl气体；浓硫酸作用：干燥Cl₂，除去水蒸气。\n(3) 上方进气；因为Cl₂密度比空气大，向上排空气法可使空气从下方排出，收集较纯Cl₂。\n(4) Cl₂ + 2NaOH = NaCl + NaClO + H₂O\n\n注意事项：①反应需加热；②Cl₂有毒，必须在通风橱中进行；③尾气必须用碱液吸收。'
    },
    {
        id: 'c2',
        subject: '化学',
        year: 2024,
        chapter: '酸碱中和滴定',
        title: '中和滴定测定盐酸浓度',
        question: '用0.1000mol/L标准NaOH溶液滴定待测盐酸溶液。\n(1) 滴定前准备工作：洗净的酸式滴定管用待测盐酸润洗______次，碱式滴定管用标准NaOH溶液润洗______次。\n(2) 装液后应排尽尖嘴处______，并调节液面至______。\n(3) 取20.00mL待测盐酸于锥形瓶，滴入2滴酚酞指示剂。滴定时眼睛应注视______。\n(4) 滴定终点现象：______。若用去NaOH溶液19.50mL，计算盐酸浓度c(HCl)=______mol/L。\n(5) 下列操作会使测定结果偏大的是______。\nA. 锥形瓶用水洗后未用待测液润洗  B. 滴定管尖嘴气泡未排尽  C. 仰视读NaOH初始读数',
        apparatus: ['酸式滴定管', '碱式滴定管', '锥形瓶', '滴定管夹', '铁架台', '标准NaOH溶液', '酚酞指示剂', '待测盐酸'],
        steps: [
            '检查滴定管是否漏水',
            '洗涤滴定管：先用自来水洗，再用蒸馏水洗，最后用待装液润洗2-3次',
            '装液：分别装入待测盐酸和标准NaOH溶液',
            '排尽尖嘴处气泡，调节液面至"0"或"0"以下某刻度',
            '量取20.00mL待测盐酸于锥形瓶，滴入2滴酚酞',
            '左手控制活塞，右手摇动锥形瓶，眼睛注视锥形瓶内颜色变化',
            '当加入最后一滴NaOH溶液，溶液由无色变浅红色且半分钟不褪色，记录读数',
            '重复滴定2-3次，取平均值'
        ],
        scoringCriteria: [
            {item: '润洗操作', score: 3, standard: '各润洗2-3次，每个1.5分'},
            {item: '排气调零', score: 3, standard: '排尽气泡1.5分；调至"0"或"0"以下1.5分'},
            {item: '滴定操作', score: 3, standard: '眼睛注视锥形瓶颜色变化2分；左手控制活塞右手摇瓶1分'},
            {item: '终点判断', score: 4, standard: '溶液由无色变浅红色且半分钟内不褪色3分；记录读数1分'},
            {item: '浓度计算', score: 4, standard: 'c(HCl)=0.1×19.50/20.00=0.0975mol/L，公式2分，结果2分'},
            {item: '误差分析', score: 3, standard: '选B、C；B气泡导致NaOH体积偏大，C仰视初读数导致NaOH体积偏小分析'}
        ],
        commonDeductions: [
            '未用待装液润洗滴定管（-2分）',
            '锥形瓶用待测液润洗（错误）（-2分）',
            '眼睛盯着刻度而不看颜色变化（-2分）',
            '终点颜色描述错误(变红就停)（-2分）',
            '只滴定一次未取平均（-1分）',
            '读数视线不平视（-1分）'
        ],
        fullScore: 20,
        answer: '(1) 2-3次；2-3次\n(2) 气泡；"0"刻度或"0"以下某刻度\n(3) 锥形瓶内溶液颜色变化\n(4) 滴入最后一滴NaOH溶液后，溶液由无色变为浅红色，且半分钟内不褪色；c(HCl)=c(NaOH)·V(NaOH)/V(HCl)=0.1000×19.50/20.00=0.0975 mol/L\n(5) BC\n\n注意事项：滴定管读数应平视凹液面最低点。'
    },
    {
        id: 'c3',
        subject: '化学',
        year: 2022,
        chapter: '铁及其化合物',
        title: '硫酸亚铁铵的制备',
        question: '实验室用废铁屑制备硫酸亚铁铵晶体(NH₄)₂Fe(SO₄)₂·6H₂O。\n(1) 写出铁屑与稀硫酸反应的离子方程式______。\n(2) 铁屑应先进行"碱洗"以除去油污，所用试剂为______，原理是______。\n(3) 反应后需加入适量(NH₄)₂SO₄固体，蒸发浓缩时不能蒸干的原因是______。\n(4) 冷却结晶后过滤，用______洗涤晶体，检验Fe²⁺被氧化的试剂是______。\n(5) 硫酸亚铁铵比FeSO₄更稳定的原因是______。',
        apparatus: ['烧杯', '玻璃棒', '漏斗', '滤纸', '蒸发皿', '酒精灯', '铁架台', '表面皿', '稀硫酸', '废铁屑', '(NH₄)₂SO₄固体', 'Na₂CO₃溶液', 'KSCN溶液'],
        steps: [
            '碱洗铁屑：用Na₂CO₃溶液加热煮沸除去油污',
            '水洗铁屑至中性',
            '加入稀硫酸反应：Fe+H₂SO₄=FeSO₄+H₂↑，水浴加热加速反应',
            '趁热过滤除去过量铁屑',
            '向滤液中加入适量(NH₄)₂SO₄固体，搅拌溶解',
            '蒸发浓缩至表面出现晶膜',
            '冷却结晶',
            '过滤，用少量乙醇洗涤晶体',
            '用滤纸吸干晶体，称量'
        ],
        scoringCriteria: [
            {item: '离子方程式', score: 3, standard: 'Fe+2H⁺=Fe²⁺+H₂↑，配平2分，气体符号1分'},
            {item: '碱洗原理', score: 4, standard: 'Na₂CO₃溶液2分；油脂在碱性条件下水解生成可溶性盐和醇2分'},
            {item: '不能蒸干', score: 4, standard: '硫酸亚铁铵易被氧化3分；且晶体易失结晶水1分'},
            {item: '洗涤检验', score: 5, standard: '用少量乙醇(或冷水)洗涤2分；KSCN溶液变红证明Fe³⁺存在2分；先加酸酸化1分'},
            {item: '稳定性原因', score: 4, standard: '复盐中Fe²⁺水解程度小3分；同离子效应使Fe²⁺更难被氧化1分'}
        ],
        commonDeductions: [
            '离子方程式未配平或漏气体符号（-1分）',
            '碱洗试剂写成NaOH（-1分）',
            '蒸发时直接蒸干（-2分）',
            '用热水洗涤晶体（-2分）',
            '检验Fe³⁺忘记加酸酸化（-1分）',
            '稳定性原因答"不易吸水"（-2分）'
        ],
        fullScore: 20,
        answer: '(1) Fe + 2H⁺ = Fe²⁺ + H₂↑\n(2) Na₂CO₃溶液(纯碱溶液)；油脂在热的纯碱溶液中发生水解(皂化反应)，生成可溶性的高级脂肪酸钠和甘油，从而被除去。\n(3) 硫酸亚铁铵在高温下易被空气中的氧气氧化为Fe³⁺，且蒸干会导致晶体失去结晶水，故不能蒸干。\n(4) 用少量乙醇(或冷水)洗涤晶体；检验Fe²⁺被氧化(即检验Fe³⁺)：取少量晶体溶于水，先加少量稀盐酸酸化，再滴加KSCN溶液，若变红色说明有Fe³⁺存在。\n(5) 硫酸亚铁铵是复盐，在水溶液中由于NH₄⁺和SO₄²⁻的同离子效应，使Fe²⁺的水解程度减小，故比FeSO₄更难被氧化，更稳定。\n\n注意：全程应保持溶液呈酸性以抑制Fe²⁺水解。'
    },
    {
        id: 'c4',
        subject: '化学',
        year: 2025,
        chapter: '烃的衍生物',
        title: '乙酸乙酯的制备及纯化',
        question: '实验室用乙酸和乙醇制备乙酸乙酯。\n(1) 写出该反应的化学方程式______，反应类型为______，浓硫酸的作用是______。\n(2) 装置中导管不能插入液面下的原因是______。\n(3) 接收试管中盛装饱和Na₂CO₃溶液，其作用是______、______、______。\n(4) 提纯产品需要的玻璃仪器有______，最终得到纯产品的操作是______。\n(5) 欲提高乙酸乙酯产率，可采取的措施有______(写出两点)。',
        apparatus: ['试管', '酒精灯', '导气管', '铁架台', '冰水浴烧杯', '浓硫酸', '冰醋酸', '无水乙醇', '饱和Na₂CO₃溶液', '碎瓷片'],
        steps: [
            '在试管中加入乙醇，然后边振荡边加入浓硫酸和冰醋酸(顺序：乙醇→浓硫酸→乙酸)',
            '加入碎瓷片防止暴沸',
            '安装导管，导管口不能插入接收试管液面下',
            '接收试管中装入饱和Na₂CO₃溶液',
            '小火加热试管，使反应进行',
            '观察有油状液体蒸出，收集在饱和Na₂CO₃溶液上方',
            '停止加热，撤去接收试管',
            '分液，弃去水层，得到粗产品',
            '用饱和食盐水洗涤后分液，加无水CaCl₂干燥，蒸馏得纯品'
        ],
        scoringCriteria: [
            {item: '反应方程式', score: 5, standard: 'CH₃COOH+CH₃CH₂OH⇌CH₃COOCH₂CH₃+H₂O，可逆号2分，条件(浓硫酸△)1分，反应类型酯化1分，浓硫酸作用(催化剂和吸水剂)1分'},
            {item: '导管不插入液面', score: 3, standard: '防止因受热不均引起倒吸3分'},
            {item: 'Na₂CO₃作用', score: 4, standard: '除去乙酸2分；溶解乙醇1分；降低乙酸乙酯溶解度便于分液1分'},
            {item: '提纯仪器', score: 4, standard: '分液漏斗2分；蒸馏操作2分'},
            {item: '提高产率', score: 4, standard: '增加乙醇用量2分；及时蒸出酯2分(其它合理答案同样给分)'}
        ],
        commonDeductions: [
            '方程式写成等号而非可逆号（-2分）',
            '导管插入液面下未说明倒吸（-2分）',
            'Na₂CO₃作用漏答（每点-1分）',
            '用排水法收集乙酸乙酯（-2分）',
            '加试剂顺序错误（-1分）',
            '未加碎瓷片（-1分）'
        ],
        fullScore: 20,
        answer: '(1) CH₃COOH + CH₃CH₂OH ⇌ CH₃COOCH₂CH₃ + H₂O；酯化反应(取代反应)；浓硫酸起催化剂和吸水剂作用(吸收生成的水，使平衡正向移动)。\n(2) 防止因受热不均或停止加热时，接收试管内液体倒吸入反应试管中，造成仪器破裂或溶液飞溅。\n(3) ①除去混在乙酸乙酯中的乙酸；②溶解混入的乙醇；③降低乙酸乙酯的溶解度，便于分液析出。\n(4) 分液漏斗；分液后用无水CaCl₂干燥，再蒸馏(温度控制在75~78℃)得到纯净乙酸乙酯。\n(5) ①增大乙醇的用量(使廉价原料过量，提高乙酸转化率)；②及时将生成的乙酸乙酯蒸出(减小生成物浓度，平衡正向移动)。\n\n注意：加试剂顺序为乙醇→浓硫酸→乙酸，防止浓硫酸与水或乙酸混合时放出大量热飞溅。'
    },
    {
        id: 'c5',
        subject: '化学',
        year: 2024,
        chapter: '氧化还原滴定',
        title: '氧化还原滴定',
        question: '用标准KMnO₄溶液滴定待测草酸(H₂C₂O₄)溶液浓度。\n(1) 写出反应的离子方程式______，反应中氧化剂是______，还原剂是______。\n(2) 该反应______(填"需要"或"不需要")指示剂，原因是______。\n(3) 滴定前酸式滴定管需用______润洗，若未润洗会使测得草酸浓度______(填"偏大"或"偏小")。\n(4) 反应需加热至70~80℃进行，温度过高会导致______。\n(5) 取25.00mL草酸溶液，用0.0200mol/L KMnO₄溶液滴定，用去24.00mL达到终点，计算草酸浓度。',
        apparatus: ['酸式滴定管', '锥形瓶', '滴定管夹', '铁架台', '温度计', '酒精灯', '标准KMnO₄溶液', '待测草酸溶液', '稀硫酸'],
        steps: [
            '检查酸式滴定管是否漏水',
            '洗涤滴定管：自来水→蒸馏水→标准KMnO₄溶液润洗',
            '装入标准KMnO₄溶液，排气泡，调零',
            '量取25.00mL待测草酸溶液于锥形瓶',
            '加入适量稀硫酸酸化',
            '水浴加热至70~80℃',
            '趁热滴定：左手控制活塞，右手摇瓶',
            '滴至加入最后一滴KMnO₄溶液，溶液变为紫红色且半分钟不褪色为终点',
            '记录读数，重复2-3次取平均'
        ],
        scoringCriteria: [
            {item: '离子方程式', score: 5, standard: '2MnO₄⁻+5H₂C₂O₄+6H⁺=2Mn²⁺+10CO₂↑+8H₂O，配平3分，气体符号1分，氧化剂KMnO₄ 0.5分，还原剂H₂C₂O₄ 0.5分'},
            {item: '指示剂', score: 3, standard: '不需要1分；KMnO₄自身作指示剂，过量一滴即显紫红色2分'},
            {item: '润洗误差', score: 3, standard: '标准KMnO₄溶液润洗1分；未润洗使KMnO₄被稀释，V用偏大，c(草酸)偏大2分'},
            {item: '温度影响', score: 3, standard: '温度过高草酸分解2分；导致结果不准确1分'},
            {item: '浓度计算', score: 6, standard: '由方程式n(H₂C₂O₄)=5/2·n(KMnO₄)，c=5/2×0.02×24/25=0.048mol/L，公式3分，代入2分，结果1分'}
        ],
        commonDeductions: [
            '方程式配平错误（-3分）',
            '混淆氧化剂和还原剂（-1分）',
            '误认为需要加指示剂（-2分）',
            '用碱式滴定管装KMnO₄（-2分）',
            '忘记酸化（-1分）',
            '温度过高原因答成"反应过快"（-1分）'
        ],
        fullScore: 20,
        answer: '(1) 2MnO₄⁻ + 5H₂C₂O₄ + 6H⁺ = 2Mn²⁺ + 10CO₂↑ + 8H₂O；氧化剂是KMnO₄(MnO₄⁻)；还原剂是H₂C₂O₄(草酸)。\n(2) 不需要；因为KMnO₄本身呈紫红色，反应后过量一滴即能使溶液显紫红色，可作自身指示剂。\n(3) 标准KMnO₄溶液；若未润洗，KMnO₄被稀释浓度变小，滴定相同草酸需消耗更多体积，导致V(KMnO₄)偏大，故测得草酸浓度偏大。\n(4) 温度过高会使草酸(H₂C₂O₄)分解：H₂C₂O₄ ==△== H₂O + CO₂↑ + CO↑，导致消耗KMnO₄体积偏小，结果偏低。\n(5) 由反应方程式得：n(H₂C₂O₄) = (5/2)·n(KMnO₄)\nc(H₂C₂O₄)·25.00 = (5/2)×0.0200×24.00\nc(H₂C₂O₄) = (5/2×0.0200×24.00)/25.00 = 0.0480 mol/L\n\n注意：KMnO₄滴定需在酸性条件下进行，必须用酸式滴定管(KMnO₄腐蚀橡胶)。'
    },
    {
        id: 'b1',
        subject: '生物',
        year: 2023,
        chapter: '酶与细胞代谢',
        title: '探究酶活性影响因素',
        question: '某同学探究温度对α-淀粉酶活性的影响。\n(1) 实验原理：淀粉在α-淀粉酶催化下水解为______，遇碘液变______色，可通过颜色深浅判断酶活性。\n(2) 实验步骤：\n①取3支试管编号A、B、C，各加入2mL______溶液；\n②另取3支试管分别加入1mLα-淀粉酶溶液，分别置于______、______、______条件下保温5min；\n③将对应温度的淀粉溶液与酶溶液混合，保温5min；\n④各加入碘液，观察颜色变化。\n(3) 实验中设置三个温度梯度的目的是______，本实验的自变量是______，因变量是______。\n(4) 预期结果：______。',
        apparatus: ['试管', '试管架', '量筒', '烧杯', '温度计', '恒温水浴锅', '冰水浴', 'α-淀粉酶溶液', '可溶性淀粉溶液', '碘液', '热水'],
        steps: [
            '取6支试管，3支各加2mL可溶性淀粉溶液，3支各加1mLα-淀粉酶溶液',
            '将1支淀粉试管+1支酶试管置于60℃热水浴(分别保温)',
            '将1支淀粉试管+1支酶试管置于冰水浴(0℃)',
            '将1支淀粉试管+1支酶试管置于沸水浴(100℃)',
            '分别保温5分钟，使达到设定温度',
            '将同温度下的淀粉与酶溶液混合，继续保温5分钟',
            '各试管加入等量碘液，观察颜色变化并记录'
        ],
        scoringCriteria: [
            {item: '实验原理', score: 4, standard: '麦芽糖2分；不变蓝(碘液不变色)2分'},
            {item: '步骤填写', score: 6, standard: '可溶性淀粉2分；三个温度(0℃、60℃、100℃)各1分共3分；先分别保温后混合1分'},
            {item: '变量分析', score: 5, standard: '探究温度影响2分；自变量是温度2分；因变量是酶活性(可用碘液颜色表示)1分'},
            {item: '预期结果', score: 5, standard: '60℃(最适温度)不变蓝3分；0℃和100℃变蓝1分；说明高温低温酶活性降低1分'}
        ],
        commonDeductions: [
            '产物写成葡萄糖（-2分）',
            '碘液遇淀粉变蓝写成变紫（-1分）',
            '淀粉与酶未分别保温就混合（-2分）',
            '自变量与因变量颠倒（-2分）',
            '未说明控制无关变量(如pH、酶量)（-1分）',
            '100℃与0℃都写成酶"失活"(0℃低温不失活只是活性低)（-1分）'
        ],
        fullScore: 20,
        answer: '(1) 麦芽糖；不(碘液不变蓝，因为淀粉被水解)\n(2) ①可溶性淀粉溶液；②0℃(冰水浴)、60℃(热水浴)、100℃(沸水浴)\n(3) 设置三个温度梯度是为了探究不同温度对α-淀粉酶活性的影响；自变量是温度；因变量是酶的活性(可通过碘液颜色深浅反映)。\n(4) 预期结果：\n60℃试管：溶液不变蓝色(最适温度，酶活性最高，淀粉完全水解)；\n0℃试管：溶液变蓝色(低温使酶活性降低，淀粉水解少)；\n100℃试管：溶液变蓝色(高温使酶空间结构破坏而失活，淀粉不水解)。\n结论：酶的催化作用需要适宜温度，高温使酶失活，低温使酶活性降低但不变性。\n\n注意事项：①淀粉与酶溶液必须分别保温达到设定温度后再混合；②严格控制pH等其他变量相同且适宜。'
    },
    {
        id: 'b2',
        subject: '生物',
        year: 2024,
        chapter: '细胞结构与功能',
        title: '质壁分离与复原观察',
        question: '用紫色洋葱外表皮细胞观察质壁分离与复原。\n(1) 实验材料选用紫色洋葱外表皮的原因是______。\n(2) 质壁分离的"质"指______，"壁"指______。发生质壁分离的内因是______，外因是______。\n(3) 实验步骤：制作洋葱表皮临时装片→______→______→观察质壁分离→______→观察复原。\n(4) 某同学用0.3g/mL蔗糖溶液处理，能发生质壁分离，再用0.5g/mL蔗糖溶液处理，则细胞______(填"能"或"不能")复原，原因是______。\n(5) 若用0.3g/mL KNO₃溶液处理，细胞自动复原的原因是______。',
        apparatus: ['显微镜', '载玻片', '盖玻片', '镊子', '滴管', '吸水纸', '紫色洋葱', '0.3g/mL蔗糖溶液', '清水', 'KNO₃溶液'],
        steps: [
            '制作洋葱鳞片叶外表皮临时装片',
            '低倍显微镜观察细胞正常状态(液泡紫色，紧贴细胞壁)',
            '在盖玻片一侧滴0.3g/mL蔗糖溶液，另一侧用吸水纸引流(重复2-3次)',
            '高倍显微镜观察质壁分离过程(液泡变小颜色变深，原生质层与细胞壁分离)',
            '在盖玻片一侧滴清水，另一侧用吸水纸引流(重复2-3次)',
            '观察质壁分离复原(液泡变大颜色变浅，原生质层恢复原位)'
        ],
        scoringCriteria: [
            {item: '材料选择', score: 3, standard: '液泡呈紫色便于观察3分'},
            {item: '质壁含义', score: 5, standard: '"质"是原生质层2分；"壁"是细胞壁1分；内因原生质层伸缩性大于细胞壁1分；外因外界溶液浓度大于细胞液1分'},
            {item: '实验步骤', score: 4, standard: '滴加蔗糖溶液2分；引流观察2分'},
            {item: '高浓度分析', score: 4, standard: '不能复原2分；0.5g/mL浓度过高导致细胞过度失水死亡2分'},
            {item: 'KNO₃复原', score: 4, standard: 'K⁺和NO₃⁻被细胞主动吸收2分；细胞液浓度增大吸水复原2分'}
        ],
        commonDeductions: [
            '选洋葱内表皮(无色)（-2分）',
            '"质"理解成细胞质（-2分）',
            '内因外因颠倒（-2分）',
            '0.5g/mL蔗糖认为能复原（-2分）',
            'KNO₃复原原因答"渗透作用"（-2分）',
            '未说明细胞死亡（-1分）'
        ],
        fullScore: 20,
        answer: '(1) 紫色洋葱鳞片叶外表皮细胞的液泡呈紫色，便于观察质壁分离及复原过程中液泡大小和颜色的变化。\n(2) "质"指原生质层(细胞膜+细胞质+液泡膜)；"壁"指细胞壁。内因：原生质层的伸缩性大于细胞壁的伸缩性；外因：外界溶液浓度大于细胞液浓度，细胞通过渗透作用失水。\n(3) 滴加0.3g/mL蔗糖溶液(用吸水纸引流)；低倍镜→高倍镜观察质壁分离；滴加清水(用吸水纸引流)\n(4) 不能复原；0.5g/mL蔗糖溶液浓度过高，细胞过度失水，导致细胞死亡，原生质层丧失选择透过性，无法再吸水复原。\n(5) 用0.3g/mL KNO₃溶液处理时，最初因外界溶液浓度大于细胞液浓度，细胞发生质壁分离；随后细胞通过主动运输吸收K⁺和NO₃⁻进入细胞，使细胞液浓度增大，当细胞液浓度大于外界溶液时，细胞通过渗透作用吸水，发生质壁分离自动复原。\n\n注意事项：①必须用活细胞(具有生物膜的选择透过性)；②蔗糖溶液浓度要适宜(0.3g/mL)。'
    },
    {
        id: 'b3',
        subject: '生物',
        year: 2022,
        chapter: '细胞呼吸',
        title: '探究酵母菌呼吸方式',
        question: '探究酵母菌在有氧和无氧条件下的呼吸方式。\n(1) 酵母菌是______生物，在有氧和无氧条件下均能生存，因此可用于探究呼吸方式。\n(2) 检测CO₂产生：将酵母菌培养液分别连接澄清石灰水，可通过______判断CO₂产生量。两组对比预期：______组产生的CO₂多。\n(3) 检测酒精产生：取培养液滤液，加入______溶液，在酸性条件下呈______色，说明有酒精生成。______组会产生酒精。\n(4) 有氧组需通入空气，为保证无菌应将空气通过______；无氧组需保证无氧，装置中应______。\n(5) 写出酵母菌无氧呼吸方程式______。',
        apparatus: ['锥形瓶', '橡皮塞', '导气管', '澄清石灰水', '酸性重铬酸钾溶液', '酵母菌培养液', 'NaOH溶液', '注射器', '恒温培养箱'],
        steps: [
            '配制酵母菌培养液(葡萄糖+酵母菌)，分装于两组锥形瓶',
            '有氧组：通过NaOH溶液过滤空气后通入酵母菌培养液，再连接澄清石灰水',
            '无氧组：密封锥形瓶(或先让酵母菌消耗瓶内氧气)，连接澄清石灰水',
            '两组置于25~35℃恒温培养箱中培养一段时间',
            '观察两组澄清石灰水变浑浊程度，比较CO₂产生量',
            '取两组培养液滤液，加入酸性重铬酸钾溶液，观察颜色变化'
        ],
        scoringCriteria: [
            {item: '酵母菌特性', score: 2, standard: '兼性厌氧2分'},
            {item: 'CO₂检测', score: 5, standard: '石灰水变浑浊程度2分；有氧组CO₂多2分；说明有氧呼吸CO₂产量大1分'},
            {item: '酒精检测', score: 5, standard: '重铬酸钾2分；灰绿色1分；无氧组2分'},
            {item: '装置处理', score: 4, standard: 'NaOH溶液除菌2分；密封/液体石蜡密封2分'},
            {item: '呼吸方程式', score: 4, standard: 'C₆H₁₂O₆→2C₂H₅OH+2CO₂+能量，配平2分，条件(酶)1分，能量1分'}
        ],
        commonDeductions: [
            '酵母菌写成厌氧或好氧（-2分）',
            '重铬酸钾写成高锰酸钾（-2分）',
            '颜色答成"红色"（-1分）',
            '有氧组未除菌（-2分）',
            '方程式漏写"酶"（-1分）'
        ],
        fullScore: 20,
        answer: '(1) 兼性厌氧(既能有氧呼吸又能无氧呼吸)\n(2) 石灰水变浑浊的程度(也可用溴麝香草酚蓝水溶液，由蓝变绿再变黄)；有氧组产生的CO₂多(有氧呼吸产生的CO₂量是无氧呼吸的两倍)。\n(3) 重铬酸钾(酸性条件下)；灰绿色；无氧组(无氧呼吸产生酒精和CO₂)。\n(4) NaOH溶液(吸收空气中的CO₂并杀菌)；装置密封(或用液体石蜡液封隔绝空气)。\n(5) C₆H₁₂O₆ --酶--> 2C₂H₅OH(酒精) + 2CO₂ + 少量能量\n\n注意事项：①需控制温度(25~35℃)为酵母菌适宜温度；②必须保证培养液无菌，避免杂菌干扰；③酸性重铬酸钾检测酒精时，橙色的重铬酸钾在酸性条件下被酒精还原为灰绿色。'
    },
    {
        id: 'b4',
        subject: '生物',
        year: 2025,
        chapter: '种群和群落',
        title: '调查种群密度方法',
        question: '调查某草地中蒲公英的种群密度和某池塘中鲫鱼的种群数量。\n(1) 调查蒲公英种群密度应采用______法，取样时常用______法或______法。样方面积一般为______。\n(2) 某同学在5个样方中测得蒲公英数量分别为18、22、20、16、24株，每个样方面积1m²，则该草地蒲公英种群密度为______株/m²。\n(3) 调查鲫鱼种群数量应采用______法。若第一次捕获标记200条，放养后第二次捕获300条，其中有标记的30条，则该池塘鲫鱼总数约为______条。\n(4) 标志重捕法需满足的条件是______(至少两点)。\n(5) 若标志物易脱落，则估算值比实际值______(填"偏大"或"偏小")。',
        apparatus: ['样方框(1m×1m)', '计数器', '捕鱼网', '标志牌(或荧光标记)', '记录本', '皮尺', '随机数字表'],
        steps: [
            '蒲公英调查：确定调查区域，划定边界',
            '用五点取样法或等距取样法在区域内确定样方位置',
            '在每个样方(1m²)内计数蒲公英株数',
            '计算所有样方的平均值，即为种群密度估计值',
            '鲫鱼调查：在池塘中随机捕获一定数量鲫鱼，标记后放回',
            '一段时间后(让标记鱼充分混入种群)再次随机捕获',
            '统计第二次捕获总数和其中带标记的个体数',
            '代入公式N=M×n/m计算种群总数'
        ],
        scoringCriteria: [
            {item: '方法与取样', score: 5, standard: '样方法2分；五点/等距取样法各1分共2分；样方面积1m²(草本)1分'},
            {item: '密度计算', score: 4, standard: '平均值=(18+22+20+16+24)/5=20株/m²，方法2分，结果2分'},
            {item: '鲫鱼调查', score: 5, standard: '标志重捕法2分；N=200×300/30=2000条，公式2分，结果1分'},
            {item: '条件', score: 4, standard: '标志物不脱落1分；标志不影响生存1分；个体随机分布充分混合1分；调查期间数量稳定1分'},
            {item: '误差分析', score: 2, standard: '偏大2分(标志物脱落使m偏小，N偏大)'}
        ],
        commonDeductions: [
            '蒲公英调查用标志重捕法（-3分）',
            '样方面积过大或过小（-1分）',
            '密度计算忘记取平均（-2分）',
            '标志重捕法公式记错（-2分）',
            '条件只写一点（-2分）',
            '误差分析方向错误（-2分）'
        ],
        fullScore: 20,
        answer: '(1) 样方法；五点取样法；等距取样法；1m²(对草本植物而言)。\n(2) 种群密度 = 各样方个体数之和/样方数 = (18+22+20+16+24)/5 = 20 株/m²\n(3) 标志重捕法；N = M×n/m = 200×300/30 = 2000 条\n(4) ①标志物不易脱落，能保持较长时间；②标志不能影响动物的正常生命活动；③调查期间种群数量相对稳定；④标记个体与未标记个体在种群中随机分布，能充分混合。\n(5) 偏大。若标志物易脱落，第二次捕获时带标记的个体数m偏小，由N=M×n/m知，N的计算值偏大。\n\n注意事项：①样方取样应随机；②种群密度计算取各样方平均值；③标志重捕法适用于活动能力强、活动范围大的动物。'
    },
    {
        id: 'b5',
        subject: '生物',
        year: 2024,
        chapter: '光合作用',
        title: '色素提取与纸层析分离',
        question: '提取和分离绿叶中色素。\n(1) 提取色素用的试剂是______，原因是______。研磨时加入少许SiO₂的目的是______，加入CaCO₃的目的是______。\n(2) 滤纸条在层析前需剪去两角，目的是______。\n(3) 纸层析分离色素的原理是______。\n(4) 滤纸条上从上到下四条色素带依次是______、______、______、______，其颜色分别是______、______、______、______。\n(5) 若滤纸条色素带颜色过浅，可能的原因是______(写出两点)。',
        apparatus: ['研钵', '漏斗', '滤纸', '试管', '毛细吸管', '层析罐', '丙酮(或无水乙醇)', '层析液', 'SiO₂', 'CaCO₃', '新鲜菠菜叶'],
        steps: [
            '色素提取：称取5g新鲜菠菜叶剪碎放入研钵',
            '加入少许SiO₂(石英砂)、CaCO₃和适量丙酮(或无水乙醇)',
            '迅速充分研磨(防止丙酮挥发和色素被破坏)',
            '将研磨液通过漏斗(单层尼龙布)过滤到试管中',
            '色素分离：制备滤纸条(剪去两角，距下端1cm处画横线)',
            '用毛细吸管吸取滤液，沿横线画细而直的滤液细线(重复2-3次)',
            '将滤纸条插入层析液(液面不能没过滤液细线)',
            '观察色素带分离后取出滤纸条'
        ],
        scoringCriteria: [
            {item: '提取试剂', score: 5, standard: '无水乙醇(或丙酮)1分；色素易溶于有机溶剂2分；SiO₂助研磨1分；CaCO₃防止研磨中色素被破坏1分'},
            {item: '剪角目的', score: 3, standard: '防止层析液沿边缘扩散过快3分'},
            {item: '分离原理', score: 3, standard: '色素在层析液中溶解度不同3分，溶解度大的扩散快在上'},
            {item: '色素带', score: 5, standard: '胡萝卜素、叶黄素、叶绿素a、叶绿素b 2分；橙黄、黄、蓝绿、黄绿3分'},
            {item: '原因分析', score: 4, standard: '两点各2分：如叶片不新鲜；研磨不充分；试剂过少；画线过粗等'}
        ],
        commonDeductions: [
            '提取试剂写成水（-2分）',
            'SiO₂和CaCO₃作用颠倒（-2分）',
            '未说明画线"细而直"（-1分）',
            '色素带顺序错误（每条-0.5分）',
            '层析液没过滤液细线（-1分）',
            '原因分析笼统（-1分）'
        ],
        fullScore: 20,
        answer: '(1) 无水乙醇(或丙酮)；色素是有机物，易溶于有机溶剂，可被萃取出来。SiO₂(石英砂)使研磨更充分；CaCO₃可中和细胞液中的有机酸，防止酸破坏叶绿素。\n(2) 防止层析液沿滤纸条两侧边缘扩散过快，使色素带不整齐影响观察。\n(3) 不同色素在层析液中的溶解度不同，溶解度大的随层析液扩散快、扩散距离远，反之扩散慢，从而使四种色素分离开来。\n(4) 从上到下依次为：胡萝卜素(橙黄色)、叶黄素(黄色)、叶绿素a(蓝绿色)、叶绿素b(黄绿色)。\n(5) 可能原因：①选取的叶片不新鲜，色素含量少或已被破坏；②研磨不充分，色素未充分释放；③画滤液细线时次数太少或线条过粗过淡；④提取液用量过少或挥发过多。\n\n注意事项：①研磨要迅速充分，防止色素被破坏；②滤液细线不能没入层析液；③实验要避光操作防止色素分解。'
    }
];

var state = {
    subjectFilter: 'all',
    yearFilter: 'all',
    selectedId: null,
    userAnswer: '',
    submitted: false,
    scores: {},
    totalScore: 0
};

function escapeHtml(str){
    if(str == null) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function nl2br(str){ return escapeHtml(str).replace(/\n/g, '<br>'); }

function getYears(){
    var map = {}; var arr = [];
    for(var i=0;i<EXPERIMENT_QUESTIONS.length;i++){
        var y = EXPERIMENT_QUESTIONS[i].year;
        if(!map[y]){ map[y]=true; arr.push(y); }
    }
    arr.sort(function(a,b){return b-a;});
    return arr;
}
function getFilteredQuestions(){
    return EXPERIMENT_QUESTIONS.filter(function(q){
        var sOk = state.subjectFilter==='all' || q.subject===state.subjectFilter;
        var yOk = state.yearFilter==='all' || q.year===state.yearFilter;
        return sOk && yOk;
    });
}
function getQuestion(id){
    for(var i=0;i<EXPERIMENT_QUESTIONS.length;i++){
        if(EXPERIMENT_QUESTIONS[i].id===id) return EXPERIMENT_QUESTIONS[i];
    }
    return null;
}

function renderSidebar(){
    var years = getYears();
    var html = '';
    html += '<div style="padding:10px;border-bottom:1px solid #eee;">';
    html += '<div style="font-weight:bold;margin-bottom:8px;">学科筛选</div>';
    html += '<select id="ees-subjectFilter" style="width:100%;padding:6px;margin-bottom:8px;">';
    html += '<option value="all"' + (state.subjectFilter==='all'?' selected':'') + '>全部</option>';
    var subs = ['物理','化学','生物'];
    for(var s=0;s<subs.length;s++){
        html += '<option value="'+subs[s]+'"' + (state.subjectFilter===subs[s]?' selected':'') + '>'+subs[s]+'</option>';
    }
    html += '</select>';
    html += '<div style="font-weight:bold;margin-bottom:8px;">年份筛选</div>';
    html += '<select id="ees-yearFilter" style="width:100%;padding:6px;">';
    html += '<option value="all"' + (state.yearFilter==='all'?' selected':'') + '>全部</option>';
    for(var yi=0;yi<years.length;yi++){
        html += '<option value="'+years[yi]+'"' + (state.yearFilter===years[yi]?' selected':'') + '>'+years[yi]+'年</option>';
    }
    html += '</select>';
    html += '</div>';
    var list = getFilteredQuestions();
    html += '<div style="overflow-y:auto;max-height:560px;">';
    if(list.length===0){
        html += '<div style="padding:20px;color:#999;text-align:center;">暂无符合条件题目</div>';
    } else {
        for(var i=0;i<list.length;i++){
            var q = list[i];
            var subjectColor = q.subject==='物理' ? '#3b82f6' : (q.subject==='化学' ? '#10b981' : '#f59e0b');
            var isActive = state.selectedId===q.id;
            html += '<div class="ees-qitem" data-id="'+q.id+'" style="padding:10px;border-bottom:1px solid #f0f0f0;cursor:pointer;'+(isActive?'background:#e0f2fe;':'')+'">';
            html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">';
            html += '<span style="background:'+subjectColor+';color:#fff;padding:2px 6px;border-radius:3px;font-size:11px;">'+q.subject+'</span>';
            html += '<span style="color:#888;font-size:11px;">'+q.year+'年</span>';
            html += '<span style="color:#888;font-size:11px;">|'+escapeHtml(q.chapter)+'</span>';
            html += '</div>';
            html += '<div style="font-size:13px;line-height:1.4;">'+escapeHtml(q.title)+'</div>';
            html += '<div style="margin-top:4px;font-size:11px;color:#aaa;">满分'+q.fullScore+'分</div>';
            html += '</div>';
        }
    }
    html += '</div>';
    return html;
}

function renderQuestion(){
    if(!state.selectedId){
        return '<div style="padding:40px;text-align:center;color:#999;">请从左侧选择一道实验题开始练习</div>';
    }
    var q = getQuestion(state.selectedId);
    if(!q) return '';
    var html = '';
    html += '<div style="padding:12px;border-bottom:2px solid #3b82f6;">';
    html += '<div style="font-size:16px;font-weight:bold;color:#1e3a8a;">'+nl2br(q.title)+'</div>';
    html += '<div style="margin-top:6px;font-size:12px;color:#666;">'+q.subject+' · '+q.year+'年 · 章节：'+escapeHtml(q.chapter)+'</div>';
    html += '</div>';
    html += '<div style="padding:12px;border-bottom:1px solid #eee;">';
    html += '<div style="font-weight:bold;color:#374151;margin-bottom:8px;">【题目】</div>';
    html += '<div style="white-space:pre-wrap;line-height:1.7;color:#374151;font-size:13px;">'+nl2br(q.question)+'</div>';
    html += '</div>';
    html += '<div style="padding:12px;border-bottom:1px solid #eee;background:#f9fafb;">';
    html += '<div style="font-weight:bold;color:#374151;margin-bottom:8px;">【实验器材】</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
    for(var ai=0;ai<q.apparatus.length;ai++){
        html += '<span style="background:#fff;border:1px solid #d1d5db;padding:3px 8px;border-radius:12px;font-size:12px;color:#4b5563;">'+escapeHtml(q.apparatus[ai])+'</span>';
    }
    html += '</div>';
    html += '</div>';
    html += '<div style="padding:12px;border-bottom:1px solid #eee;">';
    html += '<div style="font-weight:bold;color:#374151;margin-bottom:8px;">【实验步骤】</div>';
    html += '<ol style="padding-left:20px;margin:0;line-height:1.8;color:#374151;font-size:13px;">';
    for(var si=0;si<q.steps.length;si++){
        html += '<li>'+nl2br(q.steps[si])+'</li>';
    }
    html += '</ol>';
    html += '</div>';
    html += '<div style="padding:12px;border-bottom:1px solid #eee;background:#fef3c7;">';
    html += '<div style="font-weight:bold;color:#92400e;margin-bottom:8px;">【我的作答】</div>';
    var taAttr = state.submitted ? ' disabled ' : '';
    html += '<textarea id="ees-answer" style="width:100%;min-height:120px;padding:8px;border:1px solid #d1d5db;border-radius:4px;font-family:inherit;font-size:13px;line-height:1.6;box-sizing:border-box;" placeholder="请在此作答，可参考实验步骤和评分标准..."'+taAttr+'>'+escapeHtml(state.userAnswer)+'</textarea>';
    if(!state.submitted){
        html += '<button id="ees-submitBtn" style="margin-top:8px;background:#dc2626;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:13px;">提交答案并模拟阅卷</button>';
    } else {
        html += '<button id="ees-resetBtn" style="margin-top:8px;background:#6b7280;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:13px;">重新作答</button>';
    }
    html += '</div>';
    if(state.submitted){
        html += '<div style="padding:12px;background:#dbeafe;border-bottom:1px solid #eee;">';
        html += '<div style="font-weight:bold;color:#1e40af;margin-bottom:8px;">【模拟阅卷结果】</div>';
        html += '<div style="font-size:14px;color:#1e3a8a;margin-bottom:8px;">总分：<b style="font-size:18px;color:#dc2626;">'+state.totalScore+'</b> / '+q.fullScore+' 分</div>';
        html += '<table style="width:100%;border-collapse:collapse;font-size:12px;">';
        html += '<tr style="background:#bfdbfe;"><th style="border:1px solid #93c5fd;padding:5px;text-align:left;">评分项</th><th style="border:1px solid #93c5fd;padding:5px;width:50px;">满分</th><th style="border:1px solid #93c5fd;padding:5px;width:60px;">自评</th></tr>';
        for(var ci=0;ci<q.scoringCriteria.length;ci++){
            var c = q.scoringCriteria[ci];
            var got = state.scores[c.item] || 0;
            html += '<tr>';
            html += '<td style="border:1px solid #bfdbfe;padding:5px;"><b>'+escapeHtml(c.item)+'</b><br><span style="color:#6b7280;font-size:11px;">'+nl2br(c.standard)+'</span></td>';
            html += '<td style="border:1px solid #bfdbfe;padding:5px;text-align:center;">'+c.score+'</td>';
            html += '<td style="border:1px solid #bfdbfe;padding:5px;text-align:center;"><input type="number" class="ees-score" data-item="'+escapeHtml(c.item)+'" min="0" max="'+c.score+'" value="'+got+'" style="width:50px;padding:2px;"></td>';
            html += '</tr>';
        }
        html += '</table>';
        html += '<div style="margin-top:8px;color:#6b7280;font-size:12px;">提示：请根据自己作答情况对照评分标准逐项自评分数，自评后总分自动更新。</div>';
        html += '</div>';
        html += '<div style="padding:12px;background:#f0fdf4;border-bottom:1px solid #eee;">';
        html += '<div style="font-weight:bold;color:#166534;margin-bottom:8px;">【参考答案】</div>';
        html += '<div style="white-space:pre-wrap;line-height:1.7;color:#166534;font-size:13px;background:#fff;padding:10px;border-radius:4px;border:1px solid #bbf7d0;">'+nl2br(q.answer)+'</div>';
        html += '</div>';
    }
    return html;
}

function renderScoringPanel(){
    if(!state.selectedId){
        return '<div style="padding:20px;color:#999;text-align:center;">选择题目后显示评分标准</div>';
    }
    var q = getQuestion(state.selectedId);
    if(!q) return '';
    var html = '';
    html += '<div style="padding:12px;border-bottom:1px solid #eee;">';
    html += '<div style="font-weight:bold;color:#374151;margin-bottom:10px;">评分标准（满分'+q.fullScore+'分）</div>';
    for(var i=0;i<q.scoringCriteria.length;i++){
        var c = q.scoringCriteria[i];
        html += '<div style="padding:8px;background:'+(i%2?'#f9fafb':'#fff')+';border-radius:4px;margin-bottom:6px;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
        html += '<span style="font-weight:bold;color:#1e3a8a;font-size:13px;">'+(i+1)+'. '+escapeHtml(c.item)+'</span>';
        html += '<span style="background:#fee2e2;color:#b91c1c;padding:2px 6px;border-radius:3px;font-size:11px;font-weight:bold;">'+c.score+'分</span>';
        html += '</div>';
        html += '<div style="color:#4b5563;font-size:12px;line-height:1.5;">'+nl2br(c.standard)+'</div>';
        html += '</div>';
    }
    html += '</div>';
    html += '<div style="padding:12px;background:#fff7ed;">';
    html += '<div style="font-weight:bold;color:#9a3412;margin-bottom:10px;">常见扣分点</div>';
    for(var di=0;di<q.commonDeductions.length;di++){
        html += '<div style="color:#9a3412;font-size:12px;line-height:1.7;padding:3px 0;padding-left:16px;position:relative;">';
        html += '<span style="position:absolute;left:0;">•</span>'+nl2br(q.commonDeductions[di])+'</div>';
    }
    html += '</div>';
    return html;
}

function render(){
    var root = document.getElementById('experiment-exam-special-app');
    if(!root) return;
    try {
    var html = '';
    html += '<div style="font-family:Microsoft YaHei,sans-serif;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">';
    html += '<div style="background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;padding:14px 20px;">';
    html += '<div style="font-size:18px;font-weight:bold;">物化生历年实验题专项</div>';
    html += '<div style="font-size:12px;opacity:0.9;margin-top:4px;">从真题库提取实验题 → 按考点分类 → 配评分标准 → 模拟阅卷</div>';
    html += '</div>';
    html += '<div style="display:flex;min-height:600px;">';
    html += '<div id="ees-sidebar" style="width:240px;border-right:1px solid #e5e7eb;background:#fff;flex-shrink:0;">'+renderSidebar()+'</div>';
    html += '<div id="ees-main" style="flex:1;overflow-y:auto;max-height:600px;">'+renderQuestion()+'</div>';
    html += '<div id="ees-panel" style="width:280px;border-left:1px solid #e5e7eb;background:#fff;flex-shrink:0;overflow-y:auto;max-height:600px;">'+renderScoringPanel()+'</div>';
    html += '</div>';
    html += '</div>';
    root.innerHTML = html;
    bindEvents();
    } catch (err) {
        console.error('实验题专项渲染失败:', err);
    }
}

function bindEvents(){
    var sel1 = document.getElementById('ees-subjectFilter');
    if(sel1){
        sel1.onchange = function(){
            state.subjectFilter = this.value;
            state.selectedId = null;
            state.submitted = false;
            render();
        };
    }
    var sel2 = document.getElementById('ees-yearFilter');
    if(sel2){
        sel2.onchange = function(){
            state.yearFilter = this.value==='all' ? 'all' : parseInt(this.value,10);
            state.selectedId = null;
            state.submitted = false;
            render();
        };
    }
    var items = document.querySelectorAll('.ees-qitem');
    for(var i=0;i<items.length;i++){
        items[i].onclick = function(){
            state.selectedId = this.getAttribute('data-id');
            state.userAnswer = '';
            state.submitted = false;
            state.scores = {};
            state.totalScore = 0;
            render();
        };
    }
    var ta = document.getElementById('ees-answer');
    if(ta){
        ta.oninput = function(){ state.userAnswer = this.value; };
    }
    var submitBtn = document.getElementById('ees-submitBtn');
    if(submitBtn){
        submitBtn.onclick = function(){
            if(!state.userAnswer.trim()){
                alert('请先作答再提交！');
                return;
            }
            state.submitted = true;
            state.scores = {};
            state.totalScore = 0;
            render();
        };
    }
    var resetBtn = document.getElementById('ees-resetBtn');
    if(resetBtn){
        resetBtn.onclick = function(){
            state.submitted = false;
            state.scores = {};
            state.totalScore = 0;
            render();
        };
    }
    var scoreInputs = document.querySelectorAll('.ees-score');
    for(var j=0;j<scoreInputs.length;j++){
        scoreInputs[j].oninput = function(){
            var item = this.getAttribute('data-item');
            var val = parseFloat(this.value) || 0;
            var q = getQuestion(state.selectedId);
            var maxScore = 0;
            if(q){
                for(var k=0;k<q.scoringCriteria.length;k++){
                    if(q.scoringCriteria[k].item===item){ maxScore=q.scoringCriteria[k].score; break; }
                }
            }
            if(val<0) val=0;
            if(val>maxScore) val=maxScore;
            state.scores[item] = val;
            var total = 0;
            for(var key in state.scores){ if(state.scores.hasOwnProperty(key)) total += state.scores[key]; }
            state.totalScore = total;
        };
        scoreInputs[j].onchange = function(){ render(); };
    }
}

window.experimentExamSpecial = {
    render: render,
    getQuestions: function(){ return EXPERIMENT_QUESTIONS; }
};

})();


// ============================================================
// 模块2: choiceQuestionTricks（选择题秒杀技巧库）
// 容器ID: choice-tricks-app
// ============================================================
(function(){
'use strict';

var TRICKS = [
    {
        id: 1,
        name: '排除法',
        principle: '通过逐一分析各选项，结合题意和已知知识，排除明显错误或不符合题意的选项，逐步缩小选择范围，最终锁定正确答案。是选择题最基本、最常用的解题方法。',
        steps: ['仔细审题，明确题目所求','逐项分析每个选项的正确性','排除与题意矛盾或本身错误的选项','若剩余选项多于一个，做进一步比较','确定唯一正确答案'],
        scenarios: '适用于所有选择题，特别是当直接求解困难时；选项之间存在明显差异时；考察概念辨析、性质判断的题目。',
        cautions: '排除时需有充分依据，避免主观臆断；当所有选项看似都"错"时要重新审视题意。',
        examples: [
            {question:'下列关于力的说法正确的是？',options:['A. 力是维持物体运动的原因','B. 力可以脱离物体而存在','C. 力是物体对物体的作用','D. 只有相互接触的物体才能产生力'],answer:'C',analysis:'秒杀思路：A错(力是改变运动状态的原因)；B错(力必有施力物和受力物)；D错(磁力、重力不需接触)。逐一排除，剩C正确。',normalSolution:'常规解法：回忆力的定义——力是物体对物体的作用，力的性质包括物质性、相互性等，逐一验证，得出C正确。'},
            {question:'下列物质属于纯净物的是？',options:['A. 洁净的空气','B. 盐酸','C. 冰水混合物','D. 食盐水'],answer:'C',analysis:'秒杀思路：A空气是混合物(排除)；B盐酸是HCl水溶液，混合物(排除)；D食盐水是混合物(排除)。剩C，冰和水都是H₂O，是同种物质，为纯净物。',normalSolution:'常规解法：逐一分析物质组成——空气含N₂、O₂等；盐酸含HCl和水；冰水混合物只含H₂O；食盐水含NaCl和水。逐一比较得出C。'},
            {question:'关于细胞器的叙述，错误的是？',options:['A. 核糖体是蛋白质合成的场所','B. 线粒体是有氧呼吸的主要场所','C. 叶绿体存在于所有植物细胞中','D. 溶酶体能分解衰老的细胞器'],answer:'C',analysis:'秒杀思路：A对(排除)；B对(排除)；D对(排除)。剩C，叶绿体只存在于植物见光部分细胞，根部细胞无叶绿体，C错。',normalSolution:'常规解法：回忆各细胞器功能，逐一判断A、B、D正确，C"所有"过于绝对，举反例根细胞无叶绿体，故选C。'},
            {question:'下列反应属于氧化还原反应的是？',options:['A. CaCO₃ ==高温== CaO + CO₂↑','B. NaOH + HCl = NaCl + H₂O','C. 2Na + Cl₂ ==点燃== 2NaCl','D. CaO + H₂O = Ca(OH)₂'],answer:'C',analysis:'秒杀思路：A复分解反应非氧化还原(排除)；B酸碱中和非氧化还原(排除)；D化合反应非氧化还原(排除)。剩C，Na失电子被氧化，Cl得电子被还原，是氧化还原反应。',normalSolution:'常规解法：逐一标化合价——A中各元素化合价不变；B中各元素化合价不变；D中化合价不变；C中Na由0→+1，Cl由0→-1，化合价改变，为氧化还原反应。'},
            {question:'下列函数中是奇函数的是？',options:['A. y=x²','B. y=2ˣ','C. y=x³','D. y=lgx'],answer:'C',analysis:'秒杀思路：A偶函数(排除)；B指数函数非奇非偶(排除)；D定义域x>0，不关于原点对称(排除)。剩C，y=x³满足f(-x)=-f(x)，是奇函数。',normalSolution:'常规解法：逐一用奇函数定义f(-x)=-f(x)验证——A: f(-x)=x²=f(x)偶；B: f(-x)=2⁻ˣ≠±f(x)；C: f(-x)=(-x)³=-x³=-f(x)奇；D: 定义域不对称。故选C。'}
        ]
    },
    {
        id: 2,
        name: '极端值法',
        principle: '通过选取题目中变量的极端值(如0、∞、最大值、最小值)代入选项，验证选项是否成立，从而快速排除错误选项或确定答案。尤其适用于含变量范围的题目。',
        steps: ['识别题目中的变量及其取值范围','选取变量极端值(如边界值、0、∞)','代入各选项验证','若某选项在极端值下不成立，则排除','若多个选项均成立，需进一步取其他值筛选'],
        scenarios: '适用于含变量、范围、比例的题目；含"任意""存在"等量词的题目；判断函数图象、物理量变化趋势的题目。',
        cautions: '极端值只能排除错误选项，不能直接证明选项正确；需选取恰当的极端值；若多个选项在极端值下都成立，需结合其他方法。',
        examples: [
            {question:'已知0<a<1，下列不等式一定成立的是？',options:['A. a²>a','B. log_a(a+1)>1','C. a^a>1','D. (1/a)>a'],answer:'D',analysis:'秒杀思路：取a=0.5：A: 0.25<0.5错(排除)；B: log_0.5(1.5)<0<1错(排除)；C: 0.5^0.5≈0.707<1错(排除)。剩D，1/a=2>0.5成立。',normalSolution:'常规解法：逐一证明——A: 0<a<1时a²<a错；B: 底数<1真数>1，结果<0错；C: a^a<1错；D: a<1即1/a>1>a成立。'},
            {question:'一物体从高度h处自由下落，下落一半时间时的速度v₁与下落一半高度时的速度v₂比较？',options:['A. v₁>v₂','B. v₁<v₂','C. v₁=v₂','D. 无法比较'],answer:'B',analysis:'秒杀思路：v₁=g(t/2)=gt/2；v₂=√(2g·h/2)=√(gh)=√(g·gt²/2)=gt/√2。比较1/2与1/√2≈0.707，0.5<0.707，故v₁<v₂，选B。',normalSolution:'常规解法：h=gt²/2。v₁=gt/2。一半高度处v₂²=2g(h/2)=gh=g²t²/2，v₂=gt/√2。比较1/2与1/√2，1/√2≈0.707>0.5，故v₁<v₂选B。'},
            {question:'在两端固定水平拉紧的绳上，绳张力T增大时，绳上横波传播速度v如何变化？',options:['A. v增大','B. v减小','C. v不变','D. 无法确定'],answer:'A',analysis:'秒杀思路：极端值T→0：绳子松弛，波无法传播，v→0；T→∞：绳子极紧，v应很大。故v随T增大而增大，选A。',normalSolution:'常规解法：由绳上波速公式v=√(T/μ)，T增大时√(T/μ)增大，故v增大，选A。'},
            {question:'将一定量NaOH固体加入下列溶液中，溶液中离子浓度一定增大的是？',options:['A. NaHCO₃溶液中的HCO₃⁻','B. NaAlO₂溶液中的AlO₂⁻','C. NH₄Cl溶液中的NH₄⁺','D. CH₃COOH溶液中的CH₃COO⁻'],answer:'D',analysis:'秒杀思路：A中HCO₃⁻+OH⁻→CO₃²⁻，HCO₃⁻减小(排除A)；C中NH₄⁺+OH⁻→NH₃·H₂O减小(排除C)；D中CH₃COOH+OH⁻→CH₃COO⁻，CH₃COO⁻增大。选D。',normalSolution:'常规解法：分析各反应——A: HCO₃⁻+OH⁻→CO₃²⁻减小；B: AlO₂⁻与OH⁻不反应，不变；C: NH₄⁺+OH⁻→NH₃·H₂O减小；D: CH₃COOH+OH⁻→CH₃COO⁻增大。选D。'},
            {question:'弹簧振子周期T与质量m、劲度系数k的关系可能是？',options:['A. T=2π√(m/k)','B. T=2π√(k/m)','C. T=2πm/k','D. T=2πk/m'],answer:'A',analysis:'秒杀思路：极端m→0: 周期应→0，A: √(0/k)=0✓；B: √(k/0)=∞✗(排除)；C: 0/k=0✓；D: k/0=∞✗(排除)。再取m→∞: A→∞, C→∞。需量纲判断：C: m/k=s²量纲≠s(排除)。剩A。',normalSolution:'常规解法：记忆弹簧振子周期公式T=2π√(m/k)，选A。'}
        ]
    },
    {
        id: 3,
        name: '量纲分析法',
        principle: '通过检查选项表达式中各物理量的量纲(单位)是否与所求物理量的量纲一致，快速排除量纲不符的错误选项。是物理选择题的快速筛选利器。',
        steps: ['确定题目所求物理量的量纲','逐一检查各选项表达式的量纲','排除量纲与所求不符的选项','若多个选项量纲都正确，再用其他方法','确定最终答案'],
        scenarios: '适用于物理选择题中求表达式、公式判断的题目；选项为字母表达式的题目；验证推导结果的题目。',
        cautions: '量纲正确不代表表达式正确(可能差常数系数)；无量纲量(如角度)用此法无效；注意区分易混量纲(如力与能)。',
        examples: [
            {question:'已知初速度v₀、加速度a、时间t，则位移x的表达式可能是？',options:['A. x=v₀t+at²','B. x=v₀t+½at²','C. x=v₀+½at²','D. x=v₀t²+½at'],answer:'B',analysis:'秒杀思路：位移x量纲[m]。C: v₀为[m/s]≠[m]量纲错(排除)；D: v₀t²为[m·s]≠[m]量纲错(排除)。A与B量纲都对，由匀加速公式x=v₀t+½at²选B。',normalSolution:'常规解法：由匀变速直线运动位移公式x=v₀t+½at²，对比选项，B正确。'},
            {question:'单摆周期T与摆长L、重力加速度g的关系式可能是？',options:['A. T=2π√(g/L)','B. T=2π√(L/g)','C. T=2πL/g','D. T=2πgL'],answer:'B',analysis:'秒杀思路：T量纲[s]。A: √(g/L)=√([m/s²]/[m])=1/s量纲[1/s]≠[s](排除)；B: √(L/g)=√([m]/[m/s²])=s量纲[s]✓；C: L/g=s²量纲[s²]≠[s](排除)；D: gL量纲错(排除)。选B。',normalSolution:'常规解法：记忆单摆周期公式T=2π√(L/g)，选B。'},
            {question:'LC振荡电路周期T表达式可能是？',options:['A. T=2π√(LC)','B. T=2πLC','C. T=2π/√(LC)','D. T=2π(L+C)'],answer:'A',analysis:'秒杀思路：L量纲[H]=[Ω·s]，C量纲[F]=[s/Ω]。A: LC=[Ω·s]·[s/Ω]=s²，√(LC)=s量纲[s]✓；B: LC=s²量纲[s²]≠[s](排除)；C: 1/√(LC)=1/s量纲错(排除)；D: L+C量纲需同才能加(排除)。选A。',normalSolution:'常规解法：记忆LC振荡电路周期公式T=2π√(LC)，选A。'},
            {question:'气体分子平均速率v与温度T、分子质量m的关系式可能是？',options:['A. v∝√(T/m)','B. v∝T/m','C. v∝Tm','D. v∝√(Tm)'],answer:'A',analysis:'秒杀思路：结合玻尔兹曼常数k_B[J/K]=[kg·m²/(s²·K)]，k_BT/m量纲[kg·m²/s²]/[kg]=[m²/s²]，√得[m/s]✓只有A形式正确。B: T/m量纲[K/kg]≠[m/s](排除)。选A。',normalSolution:'常规解法：由分子平均动能½mv²=(3/2)k_BT，v∝√(T/m)，选A。'},
            {question:'弹簧振子周期T与质量m、劲度系数k的关系可能是？',options:['A. T=2π√(m/k)','B. T=2π√(k/m)','C. T=2πm/k','D. T=2πk/m'],answer:'A',analysis:'秒杀思路：T量纲[s]。m量纲[kg]，k量纲[N/m]=[kg/s²]。A: m/k=[kg]/[kg/s²]=s²，√(m/k)=s量纲[s]✓；B: k/m=1/s²量纲错(排除)；C: m/k=s²量纲[s²]≠[s](排除)；D量纲错(排除)。选A。',normalSolution:'常规解法：记忆弹簧振子周期公式T=2π√(m/k)，选A。'}
        ]
    },
    {
        id: 4,
        name: '对称分析法',
        principle: '利用物理过程或数学结构的对称性(如空间对称、时间对称、电荷对称)简化问题，通过对称关系快速判断选项或减少计算量。',
        steps: ['识别题目中的对称性(空间、时间、电场等)','利用对称关系分析各物理量','由对称性直接得出结论或排除选项','验证结论与对称性一致','确定答案'],
        scenarios: '适用于对称电路、对称电场、对称几何问题；含等价电荷、等大反向力等问题；求对称点场强、电势的题目。',
        cautions: '需准确识别对称性，避免"伪对称"；对称性分析只能确定部分性质，定量结果需结合其他方法；注意对称性破缺的情况。',
        examples: [
            {question:'等量异种电荷+Q和-Q连线中垂线上，中点O的电场强度和电势描述正确的是？',options:['A. 场强为零，电势为零','B. 场强不为零，电势为零','C. 场强为零，电势不为零','D. 场强不为零，电势不为零'],answer:'B',analysis:'秒杀思路：对称分析——中垂线关于两电荷对称，任一点到两电荷等距，两电荷在P处电势大小相等符号相反，总电势=0。但场强方向关于中垂线对称，水平分量抵消，垂直分量叠加不为零。选B。',normalSolution:'常规解法：取中垂线上点P，分别计算+Q和-Q在P处的电势和场强。电势φ=kQ/r+k(-Q)/r=0；场强矢量叠加，垂直中垂线方向不为零。选B。'},
            {question:'在均匀带电球壳内部任一点的电场强度为？',options:['A. 不为零，指向球心','B. 不为零，背离球心','C. 为零','D. 无法确定'],answer:'C',analysis:'秒杀思路：对称分析——球壳均匀带电，内部任一点关于球心对称，球壳上对称面元在内部点产生的场强等大反向相互抵消，由球对称性，整个球壳在内部任一点合场强为零。选C。',normalSolution:'常规解法：由高斯定理，在球壳内作半径r<R的高斯球面，面内无电荷∑q=0，∮E·dS=0，故E=0。选C。'},
            {question:'一物体做匀加速直线运动，第1s内、第2s内、第3s内位移之比为？',options:['A. 1:2:3','B. 1:3:5','C. 1:4:9','D. 1:8:27'],answer:'B',analysis:'秒杀思路：初速度为零的匀加速运动，连续相等时间内的位移比1:3:5:7:...(奇数比)，这是时间对称性的体现。选B。',normalSolution:'常规解法：v₀=0，x₁=½at²=½a，x₂=½a(2²-1²)=3/2·a，x₃=½a(3²-2²)=5/2·a，比x₁:x₂:x₃=1:3:5。选B。'},
            {question:'两个完全相同的电阻R串联后接在电压U上，则每个电阻两端电压为？',options:['A. U/4','B. U/2','C. U','D. 2U'],answer:'B',analysis:'秒杀思路：对称分析——两电阻完全相同(对称)，串联电路电流相同，由对称性每个电阻分得电压相等，U₁=U₂=U/2。选B。',normalSolution:'常规解法：串联总电阻2R，电流I=U/(2R)，每个电阻电压U_i=IR=U/2。选B。'},
            {question:'在正三角形中心放一电荷，三个顶点各放等量同种电荷，则中心电荷受力方向？',options:['A. 指向某一顶点','B. 背离某一顶点','C. 不受力','D. 垂直某一边'],answer:'C',analysis:'秒杀思路：对称分析——正三角形三顶点关于中心对称，三个顶点电荷对中心电荷的力等大且互成120°，由三力对称性，合力为零，中心电荷不受力。选C。',normalSolution:'常规解法：设顶点到中心距离r，每个顶点电荷对中心电荷力F=kq₁q₂/r²，三个力互成120°，矢量合成合力为零。选C。'}
        ]
    },
    {
        id: 5,
        name: '守恒法',
        principle: '利用物理过程中守恒的量(能量、动量、电荷、机械能等)列方程，无需分析过程细节，直接由初末状态求解，是解决复杂过程问题的利器。',
        steps: ['分析物理过程，判断适用的守恒定律','确定系统的初末状态','选取恰当的参考面(势能零点)或参考系','列守恒方程','解方程求未知量'],
        scenarios: '适用于碰撞、爆炸、滑块问题；多个物体相互作用；含弹簧、电场、磁场的能量转化问题；无需过程细节的题目。',
        cautions: '注意守恒条件是否满足(如机械能守恒需只有重力弹力做功)；区分系统与单个物体；注意动量守恒需系统不受外力或外力之和为零。',
        examples: [
            {question:'质量为m的子弹以速度v₀水平射入静止在光滑水平面上质量为M的木块并留在其中，则木块最终速度为？',options:['A. mv₀/(M+m)','B. mv₀/M','C. (M+m)v₀/m','D. v₀'],answer:'A',analysis:'秒杀思路：动量守恒——子弹木块系统水平不受外力，动量守恒。初动量mv₀，末动量(M+m)v，mv₀=(M+m)v，v=mv₀/(M+m)。选A。',normalSolution:'常规解法：分析子弹射入过程的摩擦力、相对位移，用动能定理和动量定理联立求解，过程复杂。最终仍得v=mv₀/(M+m)。'},
            {question:'一小球从高H处自由下落，落入泥潭深度h后静止，则小球在泥潭中受到平均阻力是其重力的几倍？',options:['A. H/h','B. (H+h)/h','C. H/h+1','D. (H+h)/h-1'],answer:'B',analysis:'秒杀思路：能量守恒——从开始下落到泥潭中静止，重力做功mg(H+h)，阻力做负功fh，由动能定理0=mg(H+h)-fh，f=mg(H+h)/h，f/mg=(H+h)/h。选B。',normalSolution:'常规解法：分两段——自由下落v²=2gH；泥潭中0-v²=2(-f/m+g)h，联立2gH=2(f/m-g)h，f/m=g+gH/h=g(H+h)/h。选B。'},
            {question:'在核反应 ²³⁵U + ¹n → ¹⁴¹Ba + ⁹²Kr + 3¹n 中，已知反应前后质量亏损Δm，则释放能量为？',options:['A. Δmc²','B. Δmc','C. Δmc²/2','D. 2Δmc²'],answer:'A',analysis:'秒杀思路：能量守恒(质能方程)——核反应中质量亏损Δm对应释放能量ΔE=Δmc²(爱因斯坦质能方程)。选A。',normalSolution:'常规解法：由爱因斯坦质能方程ΔE=Δmc²，其中c为光速。核反应中亏损的质量转化为能量释放，选A。'},
            {question:'一充电后的电容C两端电压U₀，断开电源后接一电感L形成LC回路，则回路最大电流为？',options:['A. U₀√(C/L)','B. U₀√(L/C)','C. U₀CL','D. U₀/C'],answer:'A',analysis:'秒杀思路：能量守恒——LC回路中电能与磁能相互转化，最大电能½CU₀²等于最大磁能½LI²，½CU₀²=½LI²，I=U₀√(C/L)。选A。',normalSolution:'常规解法：建立LC回路微分方程LC·d²q/dt²+q=0，解得q=Q₀cos(ωt)，i=-Q₀ωsin(ωt)，最大电流I=Q₀ω=CU₀·1/√(LC)=U₀√(C/L)。选A。'},
            {question:'两小球在光滑水平面上相向运动，碰撞后粘在一起，碰撞前后下列哪个量一定守恒？',options:['A. 动能','B. 动量','C. 机械能','D. 速度'],answer:'B',analysis:'秒杀思路：守恒法判断——碰撞粘合为完全非弹性碰撞，动能损失(不守恒，排除A、C)；系统不受外力动量守恒(选B)；速度显然变化(排除D)。选B。',normalSolution:'常规解法：分析各物理量——完全非弹性碰撞中系统内力做功，动能损失ΔE>0，动能和机械能不守恒；系统不受外力动量守恒；速度变化。选B。'}
        ]
    },
    {
        id: 6,
        name: '图像法',
        principle: '通过绘制或分析函数图象(v-t图、F-x图、U-I图等)，将抽象的数量关系直观化，利用图象的截距、斜率、面积等几何意义快速求解。',
        steps: ['识别题目涉及的物理量及其关系','选择合适的坐标系绘制图象','分析图象的关键特征(斜率、截距、面积、交点)','将图象特征与物理意义对应','由图象得出结论'],
        scenarios: '适用于运动学问题(v-t图、x-t图)；力学问题(F-x图、能量图)；电学实验(U-I图求电源参数)；含变量关系的分析题。',
        cautions: '注意图象坐标轴的物理意义和单位；区分斜率、面积、截距的物理含义；注意图象的适用范围和边界条件。',
        examples: [
            {question:'一物体做直线运动，v-t图象为过原点的直线，则物体做？',options:['A. 匀速直线运动','B. 匀加速直线运动','C. 匀减速直线运动','D. 变加速直线运动'],answer:'B',analysis:'秒杀思路：v-t图象法——v-t图为直线且过原点，斜率(加速度)为正恒定，初速度为0，是初速度为零的匀加速直线运动。选B。',normalSolution:'常规解法：由v=v₀+at，v-t线性关系，斜率a>0，截距v₀=0，故为匀加速直线运动且初速度为零。选B。'},
            {question:'电源U-I图象的纵截距和斜率绝对值分别表示？',options:['A. 电动势、内阻','B. 内阻、电动势','C. 电动势、外阻','D. 短路电流、内阻'],answer:'A',analysis:'秒杀思路：U-I图象法——由U=E-Ir，U是I的一次函数，纵截距(I=0时U)=E(电动势)，斜率=-r，绝对值=r(内阻)。选A。',normalSolution:'常规解法：闭合电路欧姆定律U=E-Ir，整理为U关于I的线性函数，截距=E，斜率=-r。选A。'},
            {question:'F-x图象(力-位移图)中图线与x轴围成的面积表示？',options:['A. 力做的功','B. 力的冲量','C. 功率','D. 加速度'],answer:'A',analysis:'秒杀思路：F-x图象法——F-x图线下的面积=∫F·dx=W(力做的功)。类比v-t图面积=位移。选A。',normalSolution:'常规解法：功的定义W=∫F·dx，在F-x图象中即图线下的面积。选A。'},
            {question:'在v-t图象中，两图线相交表示？',options:['A. 两物体相遇','B. 两物体速度相等','C. 两物体距离最大','D. 两物体加速度相等'],answer:'B',analysis:'秒杀思路：v-t图象法——v-t图象交点处两物体速度相等(同一时刻v相同)。注意：相遇是x-t图象交点的意义。选B。',normalSolution:'常规解法：v-t图象交点表示该时刻两物体速度相等。相遇对应x-t图象交点(同一时刻位置相同)。选B。'},
            {question:'一定质量理想气体等温变化p-V图象为？',options:['A. 过原点的直线','B. 双曲线一支','C. 抛物线','D. 椭圆'],answer:'B',analysis:'秒杀思路：p-V图象法——等温过程pV=nRT=常数，p与V成反比，p-V图象为双曲线一支(第一象限)。选B。',normalSolution:'常规解法：玻意耳定律pV=常数(等温)，p=常数/V，为反比例函数，图象为双曲线一支。选B。'}
        ]
    },
    {
        id: 7,
        name: '极限分析法',
        principle: '通过分析物理过程或函数在极限情况(如质量趋于0、时间趋于无穷、角度趋于0等)下的表现，判断一般情况下的趋势，快速排除错误选项。',
        steps: ['识别题目中的变量和过程','选取适当的极限情况(0、∞、临界值)','分析极限下各选项的表现','排除与极限情况矛盾的选项','确定答案或缩小范围'],
        scenarios: '适用于含变化过程的题目；判断趋势、单调性的题目；含多个变量、需判断主导因素的题目。',
        cautions: '极限分析只能判断趋势，不能确定具体数值；需选取有物理意义的极限；注意极限与一般情况的区别；可能需多个极限综合判断。',
        examples: [
            {question:'如图斜面上物体随倾角θ增大(摩擦因数μ不变)，物体所受摩擦力变化情况？',options:['A. 一直增大','B. 一直减小','C. 先增大后减小','D. 先减小后增大'],answer:'C',analysis:'秒杀思路：极限分析——θ→0: 物体静止，f=mgsinθ→0；θ增大到临界角θ₀=arctanμ前，物体仍静止f=mgsinθ增大；θ>θ₀后物体滑动f=μmgcosθ随θ增大而减小。故f先增大后减小。选C。',normalSolution:'常规解法：分两阶段——θ≤arctanμ静止，f=mgsinθ随θ增大而增大；θ>arctanμ滑动，f=μmgcosθ随θ增大而减小。临界点处f最大。选C。'},
            {question:'电源电动势E、内阻r，外阻R从0增大到∞，电源输出功率变化？',options:['A. 一直增大','B. 一直减小','C. 先增大后减小','D. 先减小后增大'],answer:'C',analysis:'秒杀思路：极限分析——R→0: 短路P_out=0；R→∞: 断路P_out=0；中间R=r时P_out最大=E²/(4r)。故P随R增大先增大后减小。选C。',normalSolution:'常规解法：P_out=I²R=(E/(R+r))²·R=E²R/(R+r)²，求导dP/dR=0得R=r时取最大值，两端R→0和R→∞时P→0。选C。'},
            {question:'抛体运动中，初速度方向与水平方向夹角θ从0增大到90°，射程变化？',options:['A. 一直增大','B. 一直减小','C. 先增大后减小','D. 先减小后增大'],answer:'C',analysis:'秒杀思路：极限分析——θ=0: 水平抛，X=v₀²sin(2θ)/g=0；θ=45°: X最大=v₀²/g；θ=90°: 竖直抛X=0。故X先增大后减小。选C。',normalSolution:'常规解法：斜抛射程X=v₀²sin(2θ)/g，θ∈[0,90°]，sin(2θ)在θ=45°最大，故X先增大后减小。选C。'},
            {question:'RL电路接通电源瞬间和长时间后，电感线圈中电流分别为？',options:['A. 0、最大','B. 最大、0','C. 0、0','D. 最大、最大'],answer:'A',analysis:'秒杀思路：极限分析——接通瞬间t→0: 电感阻碍电流变化，i→0；长时间t→∞: 电感相当于导线(直流)，i达到最大I₀=U/R。选A。',normalSolution:'常规解法：RL电路电流i=I₀(1-e^(-t/τ))，t=0时i=0，t→∞时i=I₀=U/R。选A。'},
            {question:'一定质量气体等压膨胀过程中，温度T随体积V变化图象，当V→0时T趋向？',options:['A. 0','B. ∞','C. 某定值','D. 无法确定'],answer:'A',analysis:'秒杀思路：极限分析——等压过程V/T=常数(盖-吕萨克定律)，V→0则T→0。选A。',normalSolution:'常规解法：盖-吕萨克定律V/T=常数(等压)，T=V/常数，V→0时T→0。选A。'}
        ]
    },
    {
        id: 8,
        name: '逆向思维法',
        principle: '从题目所求的结果或结论出发，逆向推导所需条件，或利用过程的可逆性、对称性反向思考，避开正面求解的困难。',
        steps: ['明确题目所求','从结果出发逆向思考需要的条件','利用可逆过程或反向关系建立等式','逆向推导至已知量','求解并验证'],
        scenarios: '适用于运动学反向验证；多过程问题的逆向分析；证明题的反证法；求"至少""至多"等极值问题。',
        cautions: '注意过程是否真正可逆(如摩擦不可逆)；逆向推导需逻辑严密；与正向求解结合验证。',
        examples: [
            {question:'一物体以初速度v₀做匀减速直线运动，加速度大小a，求物体停止前最后1s内的位移？',options:['A. v₀-a','B. v₀/2-½a','C. ½a','D. v₀-½a'],answer:'C',analysis:'秒杀思路：逆向思维——将匀减速到停止的过程，逆向看作初速度0、加速度a的匀加速运动，则"最后1s"对应"最初1s"，位移=½at²=½a。选C。',normalSolution:'常规解法：先求总时间t=v₀/a，停止前1s即t-1到t时刻，x=v₀(t-1)-½a(t-1)²-[v₀t-½at²]，化简得½a。计算繁琐。'},
            {question:'小球从斜面顶端A由静止释放滑到底端B，所需时间t₁；从B以初速度v逆向上滑到A刚好停止，所需时间t₂，则t₁与t₂关系？',options:['A. t₁>t₂','B. t₁<t₂','C. t₁=t₂','D. 无法比较'],answer:'C',analysis:'秒杀思路：逆向思维——下滑(初速度0匀加速)和上滑(末速度0匀减速)是可逆过程，加速度大小相同，由对称性t₁=t₂。选C。',normalSolution:'常规解法：设斜面长L、加速度a。下滑L=½at₁²，t₁=√(2L/a)；上滑L=vt₂-½at₂²，v=at₂，L=½at₂²，t₂=√(2L/a)。t₁=t₂。选C。'},
            {question:'要使一物体从地面竖直上抛后回到抛出点，已知上升时间t，则抛出初速度v₀为？(重力加速度g)',options:['A. gt','B. gt/2','C. 2gt','D. gt/4'],answer:'A',analysis:'秒杀思路：逆向思维——上升过程(匀减速到0)逆向看作自由落体(初速度0匀加速g)，速度v=gt。选A。即v₀=gt。',normalSolution:'常规解法：上升过程v=v₀-gt=0，v₀=gt。选A。或下落过程对称，落回速度大小等于v₀=gt。'},
            {question:'欲使凸透镜成放大实像，物距u必须满足？(焦距f)',options:['A. u>f','B. u<f','C. f<u<2f','D. u>2f'],answer:'C',analysis:'秒杀思路：逆向思维——从"放大实像"出发，实像要求u>f，放大要求v>u即像距大于物距，由1/u+1/v=1/f和v>u推得f<u<2f。选C。',normalSolution:'常规解法：放大率m=v/u>1即v>u，又1/u+1/v=1/f，联立解得f<u<2f。选C。'},
            {question:'欲使RC电路放电过程中电容电压降为初始的1/e，所需时间t为？(时间常数τ=RC)',options:['A. τ','B. τ/2','C. 2τ','D. τ/4'],answer:'A',analysis:'秒杀思路：逆向思维——从结果U=U₀/e出发，放电方程U=U₀e^(-t/τ)，令U=U₀/e即e^(-t/τ)=e⁻¹，故t/τ=1，t=τ。选A。',normalSolution:'常规解法：RC放电U=U₀e^(-t/τ)，U/U₀=1/e，e^(-t/τ)=e⁻¹，t/τ=1，t=τ。选A。'}
        ]
    }
];

var state = {
    selectedTrickId: 1,
    currentExampleIdx: 0,
    userChoice: null,
    revealed: false,
    startTime: 0,
    elapsed: 0,
    trickStats: {}
};

function escapeHtml(str){
    if(str==null) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function nl2br(str){ return escapeHtml(str).replace(/\n/g,'<br>'); }

function getTrick(id){
    for(var i=0;i<TRICKS.length;i++){
        if(TRICKS[i].id===id) return TRICKS[i];
    }
    return null;
}

function renderTrickList(){
    var html = '';
    html += '<div style="padding:10px;border-bottom:1px solid #eee;background:#f9fafb;">';
    html += '<div style="font-weight:bold;color:#1e3a8a;">选择秒杀技巧</div>';
    html += '</div>';
    for(var i=0;i<TRICKS.length;i++){
        var t = TRICKS[i];
        var isActive = state.selectedTrickId===t.id;
        var stat = state.trickStats[t.id] || {practiced:0, correct:0};
        var rate = stat.practiced>0 ? Math.round(stat.correct/stat.practiced*100) : 0;
        html += '<div class="ct-trick" data-id="'+t.id+'" style="padding:12px;border-bottom:1px solid #f0f0f0;cursor:pointer;'+(isActive?'background:#dbeafe;border-left:3px solid #3b82f6;':'')+'">';
        html += '<div style="display:flex;align-items:center;gap:8px;">';
        html += '<span style="background:'+(isActive?'#3b82f6':'#9ca3af')+';color:#fff;width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;">'+t.id+'</span>';
        html += '<span style="font-size:14px;font-weight:bold;color:'+(isActive?'#1e3a8a':'#374151')+';">'+escapeHtml(t.name)+'</span>';
        html += '</div>';
        html += '<div style="margin-top:6px;font-size:11px;color:#6b7280;">练习'+stat.practiced+'题 · 正确率'+rate+'%</div>';
        html += '</div>';
    }
    return html;
}

function renderTrickDetail(){
    var t = getTrick(state.selectedTrickId);
    if(!t) return '';
    var html = '';
    html += '<div style="padding:14px;border-bottom:2px solid #8b5cf6;">';
    html += '<div style="font-size:16px;font-weight:bold;color:#5b21b6;">'+escapeHtml(t.name)+'</div>';
    html += '</div>';
    html += '<div style="padding:12px;border-bottom:1px solid #eee;">';
    html += '<div style="font-weight:bold;color:#374151;margin-bottom:6px;">原理说明</div>';
    html += '<div style="color:#4b5563;font-size:13px;line-height:1.7;">'+nl2br(t.principle)+'</div>';
    html += '</div>';
    html += '<div style="padding:12px;border-bottom:1px solid #eee;background:#faf5ff;">';
    html += '<div style="font-weight:bold;color:#374151;margin-bottom:6px;">使用步骤</div>';
    html += '<ol style="padding-left:20px;margin:0;line-height:1.8;color:#4b5563;font-size:13px;">';
    for(var si=0;si<t.steps.length;si++){
        html += '<li>'+nl2br(t.steps[si])+'</li>';
    }
    html += '</ol>';
    html += '</div>';
    html += '<div style="padding:12px;border-bottom:1px solid #eee;">';
    html += '<div style="font-weight:bold;color:#374151;margin-bottom:6px;">适用场景</div>';
    html += '<div style="color:#4b5563;font-size:13px;line-height:1.7;">'+nl2br(t.scenarios)+'</div>';
    html += '</div>';
    html += '<div style="padding:12px;background:#fff7ed;">';
    html += '<div style="font-weight:bold;color:#9a3412;margin-bottom:6px;">注意事项</div>';
    html += '<div style="color:#9a3412;font-size:13px;line-height:1.7;">'+nl2br(t.cautions)+'</div>';
    html += '</div>';
    return html;
}

function renderExampleArea(){
    var t = getTrick(state.selectedTrickId);
    if(!t) return '';
    var html = '';
    html += '<div style="padding:14px;border-bottom:2px solid #10b981;background:#f0fdf4;">';
    html += '<div style="font-size:14px;font-weight:bold;color:#166534;">例题练习</div>';
    html += '<div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap;">';
    for(var i=0;i<t.examples.length;i++){
        var bg = state.currentExampleIdx===i ? '#10b981' : '#d1fae5';
        var color = state.currentExampleIdx===i ? '#fff' : '#166534';
        html += '<span class="ct-exIdx" data-idx="'+i+'" style="background:'+bg+';color:'+color+';padding:4px 10px;border-radius:12px;cursor:pointer;font-size:12px;">第'+(i+1)+'题</span>';
    }
    html += '</div>';
    html += '</div>';
    var ex = t.examples[state.currentExampleIdx];
    if(!ex) return html;
    html += '<div style="padding:12px;">';
    html += '<div style="background:#f9fafb;padding:10px;border-radius:4px;margin-bottom:10px;">';
    html += '<div style="font-weight:bold;color:#374151;margin-bottom:6px;">题目：</div>';
    html += '<div style="color:#1f2937;font-size:13px;line-height:1.7;margin-bottom:8px;">'+nl2br(ex.question)+'</div>';
    for(var oi=0;oi<ex.options.length;oi++){
        html += '<div style="padding:4px 0;color:#374151;font-size:13px;">'+escapeHtml(ex.options[oi])+'</div>';
    }
    html += '</div>';
    if(!state.revealed){
        html += '<div style="background:#fef3c7;padding:10px;border-radius:4px;margin-bottom:10px;">';
        html += '<div style="font-weight:bold;color:#92400e;margin-bottom:6px;">请选择答案：</div>';
        html += '<div style="display:flex;gap:6px;flex-wrap:wrap;">';
        var opts = ['A','B','C','D'];
        for(var ci=0;ci<opts.length;ci++){
            var bg = state.userChoice===opts[ci] ? '#fbbf24' : '#fff';
            html += '<button class="ct-choice" data-opt="'+opts[ci]+'" style="background:'+bg+';border:1px solid #d97706;color:#92400e;padding:6px 14px;border-radius:4px;cursor:pointer;font-weight:bold;">'+opts[ci]+'</button>';
        }
        html += '</div>';
        var dis = state.userChoice ? '' : ' disabled';
        html += '<button id="ct-submit" style="margin-top:10px;background:#dc2626;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;"'+dis+'>提交答案</button>';
        html += '<div style="margin-top:6px;color:#6b7280;font-size:12px;">已用时: '+state.elapsed+'秒</div>';
        html += '</div>';
    } else {
        var isCorrect = state.userChoice===ex.answer;
        var bgColor = isCorrect ? '#d1fae5' : '#fee2e2';
        var bdColor = isCorrect ? '#10b981' : '#ef4444';
        var txColor = isCorrect ? '#166534' : '#991b1b';
        html += '<div style="background:'+bgColor+';border:1px solid '+bdColor+';padding:10px;border-radius:4px;margin-bottom:10px;">';
        html += '<div style="font-weight:bold;color:'+txColor+';margin-bottom:6px;">';
        html += isCorrect ? '回答正确！' : '回答错误';
        html += ' (用时'+state.elapsed+'秒)</div>';
        html += '<div style="color:#374151;font-size:13px;">你的答案：<b>'+escapeHtml(state.userChoice||'(未选)')+'</b> | 正确答案：<b>'+escapeHtml(ex.answer)+'</b></div>';
        html += '</div>';
        html += '<div style="background:#dbeafe;padding:10px;border-radius:4px;margin-bottom:8px;border-left:3px solid #3b82f6;">';
        html += '<div style="font-weight:bold;color:#1e40af;margin-bottom:6px;">秒杀思路</div>';
        html += '<div style="color:#1e3a8a;font-size:13px;line-height:1.7;">'+nl2br(ex.analysis)+'</div>';
        html += '</div>';
        html += '<div style="background:#f3f4f6;padding:10px;border-radius:4px;margin-bottom:8px;border-left:3px solid #9ca3af;">';
        html += '<div style="font-weight:bold;color:#4b5563;margin-bottom:6px;">常规解法对比</div>';
        html += '<div style="color:#374151;font-size:13px;line-height:1.7;">'+nl2br(ex.normalSolution)+'</div>';
        html += '</div>';
        var nextDis = state.currentExampleIdx >= t.examples.length-1 ? ' disabled' : '';
        html += '<button id="ct-next" style="background:#10b981;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;"'+nextDis+'>下一题</button>';
    }
    html += '</div>';
    return html;
}

function renderStats(){
    var html = '';
    html += '<div style="padding:12px;background:#1f2937;color:#fff;">';
    html += '<div style="font-weight:bold;margin-bottom:8px;">技巧使用统计</div>';
    var totalPracticed = 0, totalCorrect = 0;
    for(var i=0;i<TRICKS.length;i++){
        var s = state.trickStats[TRICKS[i].id] || {practiced:0, correct:0};
        totalPracticed += s.practiced;
        totalCorrect += s.correct;
    }
    var totalRate = totalPracticed>0 ? Math.round(totalCorrect/totalPracticed*100) : 0;
    html += '<div style="font-size:13px;line-height:1.8;">';
    html += '<div>总练习题数：<b style="color:#fbbf24;">'+totalPracticed+'</b> 题</div>';
    html += '<div>总正确率：<b style="color:#10b981;">'+totalRate+'%</b></div>';
    var mastered = 0;
    for(var j=0;j<TRICKS.length;j++){
        var st = state.trickStats[TRICKS[j].id];
        if(st && st.practiced>=3) mastered++;
    }
    html += '<div style="margin-top:6px;font-size:11px;color:#9ca3af;">已练习技巧：'+mastered+' / '+TRICKS.length+'</div>';
    html += '</div>';
    html += '</div>';
    return html;
}

var timerInterval = null;
function startTimer(){
    state.startTime = Date.now();
    state.elapsed = 0;
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(function(){
        state.elapsed = Math.floor((Date.now()-state.startTime)/1000);
        var el = document.getElementById('ct-timer');
        if(!el){
            var divs = document.querySelectorAll('#choice-tricks-app div');
            for(var i=0;i<divs.length;i++){
                if(divs[i].innerHTML && divs[i].innerHTML.indexOf('已用时')>=0){
                    divs[i].innerHTML = '已用时: '+state.elapsed+'秒';
                    break;
                }
            }
        }
    }, 1000);
}
function stopTimer(){
    if(timerInterval){ clearInterval(timerInterval); timerInterval = null; }
}

function render(){
    var root = document.getElementById('choice-tricks-app');
    if(!root) return;
    var html = '';
    html += '<div style="font-family:Microsoft YaHei,sans-serif;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">';
    html += '<div style="background:linear-gradient(135deg,#5b21b6,#8b5cf6);color:#fff;padding:14px 20px;">';
    html += '<div style="font-size:18px;font-weight:bold;">选择题秒杀技巧库</div>';
    html += '<div style="font-size:12px;opacity:0.9;margin-top:4px;">8种解题技巧 · 每种5道例题 · 秒杀思路vs常规解法对比</div>';
    html += '</div>';
    html += '<div style="display:flex;min-height:600px;">';
    html += '<div style="width:220px;border-right:1px solid #e5e7eb;background:#fff;flex-shrink:0;overflow-y:auto;max-height:600px;">'+renderTrickList()+'</div>';
    html += '<div style="flex:1;overflow-y:auto;max-height:600px;">'+renderTrickDetail()+'</div>';
    html += '<div style="width:320px;border-left:1px solid #e5e7eb;background:#fff;flex-shrink:0;overflow-y:auto;max-height:600px;">'+renderExampleArea()+'</div>';
    html += '</div>';
    html += renderStats();
    html += '</div>';
    root.innerHTML = html;
    bindEvents();
}

function bindEvents(){
    var tricks = document.querySelectorAll('.ct-trick');
    for(var i=0;i<tricks.length;i++){
        tricks[i].onclick = function(){
            state.selectedTrickId = parseInt(this.getAttribute('data-id'),10);
            state.currentExampleIdx = 0;
            state.userChoice = null;
            state.revealed = false;
            stopTimer();
            render();
        };
    }
    var idxs = document.querySelectorAll('.ct-exIdx');
    for(var j=0;j<idxs.length;j++){
        idxs[j].onclick = function(){
            state.currentExampleIdx = parseInt(this.getAttribute('data-idx'),10);
            state.userChoice = null;
            state.revealed = false;
            stopTimer();
            render();
        };
    }
    var choices = document.querySelectorAll('.ct-choice');
    for(var k=0;k<choices.length;k++){
        choices[k].onclick = function(){
            state.userChoice = this.getAttribute('data-opt');
            if(!state.startTime) startTimer();
            render();
        };
    }
    var submit = document.getElementById('ct-submit');
    if(submit){
        submit.onclick = function(){
            if(!state.userChoice) return;
            stopTimer();
            state.revealed = true;
            var t = getTrick(state.selectedTrickId);
            var ex = t.examples[state.currentExampleIdx];
            var isCorrect = state.userChoice===ex.answer;
            if(!state.trickStats[t.id]) state.trickStats[t.id] = {practiced:0, correct:0};
            state.trickStats[t.id].practiced++;
            if(isCorrect) state.trickStats[t.id].correct++;
            render();
        };
    }
    var next = document.getElementById('ct-next');
    if(next){
        next.onclick = function(){
            var t = getTrick(state.selectedTrickId);
            if(state.currentExampleIdx < t.examples.length-1){
                state.currentExampleIdx++;
                state.userChoice = null;
                state.revealed = false;
                state.startTime = 0;
                state.elapsed = 0;
                render();
            }
        };
    }
}

window.choiceQuestionTricks = {
    render: render,
    getTricks: function(){ return TRICKS; }
};

})();


// ============================================================
// 模块3: englishSentenceAnalyzer（英语长难句分析器）
// 容器ID: sentence-analyzer-app
// ============================================================
(function(){
'use strict';

// 成分颜色：主语红/谓语蓝/宾语绿/定语黄/状语紫/补语橙
var ROLE_COLORS = {
    '主语': '#ef4444',
    '谓语': '#3b82f6',
    '宾语': '#10b981',
    '定语': '#eab308',
    '状语': '#8b5cf6',
    '补语': '#f97316'
};

var PRESET_SENTENCES = [
    {
        sentence: 'The boy who is playing basketball on the playground is my brother.',
        translation: '正在操场上打篮球的那个男孩是我的弟弟。',
        components: [
            {word:'The',role:'定语',clauseType:null},
            {word:'boy',role:'主语',clauseType:null},
            {word:'who is playing basketball on the playground',role:'定语',clauseType:'定语从句'},
            {word:'is',role:'谓语',clauseType:null},
            {word:'my',role:'定语',clauseType:null},
            {word:'brother',role:'表语',clauseType:null}
        ],
        grammarPoints: ['定语从句(who引导，修饰boy)','主系表结构'],
        keyPhrases: ['play basketball','on the playground']
    },
    {
        sentence: 'What he said at the meeting surprised all of us.',
        translation: '他在会上所说的话让我们所有人都感到惊讶。',
        components: [
            {word:'What he said at the meeting',role:'主语',clauseType:'名词性从句(主语从句)'},
            {word:'surprised',role:'谓语',clauseType:null},
            {word:'all',role:'宾语',clauseType:null},
            {word:'of us',role:'定语',clauseType:null}
        ],
        grammarPoints: ['主语从句(What引导)','surprise sb. (使某人惊讶)'],
        keyPhrases: ['at the meeting','all of us']
    },
    {
        sentence: 'Hardly had I arrived at the station when the train left.',
        translation: '我刚到火车站，火车就开走了。',
        components: [
            {word:'Hardly',role:'状语',clauseType:null},
            {word:'had',role:'谓语(助动词)',clauseType:null},
            {word:'I',role:'主语',clauseType:null},
            {word:'arrived',role:'谓语(实义动词)',clauseType:null},
            {word:'at the station',role:'状语',clauseType:null},
            {word:'when the train left',role:'状语',clauseType:'状语从句(时间)'}
        ],
        grammarPoints: ['部分倒装(Hardly位于句首)','Hardly...when...结构(一...就...)','过去完成时'],
        keyPhrases: ['arrive at','hardly...when...']
    },
    {
        sentence: 'It was not until he told me that I realized my mistake.',
        translation: '直到他告诉我，我才意识到自己的错误。',
        components: [
            {word:'It',role:'主语(形式)',clauseType:null},
            {word:'was',role:'谓语',clauseType:null},
            {word:'not until he told me',role:'强调部分',clauseType:'状语从句(被强调)'},
            {word:'that',role:'强调结构词',clauseType:null},
            {word:'I',role:'主语',clauseType:null},
            {word:'realized',role:'谓语',clauseType:null},
            {word:'my',role:'定语',clauseType:null},
            {word:'mistake',role:'宾语',clauseType:null}
        ],
        grammarPoints: ['强调句型(It is/was...that...)','not until的强调用法'],
        keyPhrases: ['not until','realize one\'s mistake']
    },
    {
        sentence: 'If I were you, I would accept the offer.',
        translation: '如果我是你，我会接受这个提议。',
        components: [
            {word:'If I were you',role:'状语',clauseType:'状语从句(条件,虚拟)'},
            {word:'I',role:'主语',clauseType:null},
            {word:'would accept',role:'谓语',clauseType:null},
            {word:'the',role:'定语',clauseType:null},
            {word:'offer',role:'宾语',clauseType:null}
        ],
        grammarPoints: ['虚拟语气(与现在事实相反的假设)','if条件句用过去式were，主句用would+动词原形'],
        keyPhrases: ['accept the offer']
    },
    {
        sentence: 'The book that I bought yesterday is very interesting.',
        translation: '我昨天买的那本书非常有趣。',
        components: [
            {word:'The',role:'定语',clauseType:null},
            {word:'book',role:'主语',clauseType:null},
            {word:'that I bought yesterday',role:'定语',clauseType:'定语从句'},
            {word:'is',role:'谓语',clauseType:null},
            {word:'very',role:'状语',clauseType:null},
            {word:'interesting',role:'表语',clauseType:null}
        ],
        grammarPoints: ['定语从句(that引导，修饰book，作bought的宾语可省略)','主系表结构'],
        keyPhrases: ['buy sth.','very interesting']
    },
    {
        sentence: 'Not only does he study hard, but also he often helps others.',
        translation: '他不仅学习刻苦，而且经常帮助别人。',
        components: [
            {word:'Not only',role:'状语',clauseType:null},
            {word:'does',role:'谓语(助动词,倒装)',clauseType:null},
            {word:'he',role:'主语',clauseType:null},
            {word:'study',role:'谓语(实义动词)',clauseType:null},
            {word:'hard',role:'状语',clauseType:null},
            {word:'but also',role:'连词',clauseType:null},
            {word:'he',role:'主语',clauseType:null},
            {word:'often',role:'状语',clauseType:null},
            {word:'helps',role:'谓语',clauseType:null},
            {word:'others',role:'宾语',clauseType:null}
        ],
        grammarPoints: ['Not only...but also...结构','Not only位于句首引起部分倒装','并列句'],
        keyPhrases: ['not only...but also...','study hard','help others']
    },
    {
        sentence: 'The reason why he was late is that he missed the bus.',
        translation: '他迟到的原因是他错过了公交车。',
        components: [
            {word:'The',role:'定语',clauseType:null},
            {word:'reason',role:'主语',clauseType:null},
            {word:'why he was late',role:'定语',clauseType:'定语从句'},
            {word:'is',role:'谓语',clauseType:null},
            {word:'that he missed the bus',role:'表语',clauseType:'名词性从句(表语从句)'}
        ],
        grammarPoints: ['定语从句(why引导，修饰reason)','表语从句(that引导)','The reason why... is that...句型'],
        keyPhrases: ['be late','miss the bus']
    },
    {
        sentence: 'Only when you work hard can you achieve your goals.',
        translation: '只有努力工作，你才能实现你的目标。',
        components: [
            {word:'Only when you work hard',role:'状语',clauseType:'状语从句(条件)'},
            {word:'can',role:'谓语(助动词,倒装)',clauseType:null},
            {word:'you',role:'主语',clauseType:null},
            {word:'achieve',role:'谓语(实义动词)',clauseType:null},
            {word:'your',role:'定语',clauseType:null},
            {word:'goals',role:'宾语',clauseType:null}
        ],
        grammarPoints: ['Only+状语位于句首引起部分倒装','情态动词can前置','状语从句'],
        keyPhrases: ['work hard','achieve one\'s goals']
    },
    {
        sentence: 'The man standing by the window is our new English teacher.',
        translation: '站在窗边的那个人是我们的新英语老师。',
        components: [
            {word:'The',role:'定语',clauseType:null},
            {word:'man',role:'主语',clauseType:null},
            {word:'standing by the window',role:'定语',clauseType:null},
            {word:'is',role:'谓语',clauseType:null},
            {word:'our',role:'定语',clauseType:null},
            {word:'new',role:'定语',clauseType:null},
            {word:'English',role:'定语',clauseType:null},
            {word:'teacher',role:'表语',clauseType:null}
        ],
        grammarPoints: ['现在分词短语作后置定语(standing by the window修饰man)','主系表结构'],
        keyPhrases: ['stand by','English teacher']
    },
    {
        sentence: 'She asked me whether I had finished my homework.',
        translation: '她问我是否已经完成了作业。',
        components: [
            {word:'She',role:'主语',clauseType:null},
            {word:'asked',role:'谓语',clauseType:null},
            {word:'me',role:'宾语',clauseType:null},
            {word:'whether I had finished my homework',role:'宾语',clauseType:'名词性从句(宾语从句)'}
        ],
        grammarPoints: ['宾语从句(whether引导)','过去完成时(had finished,在asked之前完成)','主谓宾+宾从结构'],
        keyPhrases: ['ask sb.','finish one\'s homework']
    },
    {
        sentence: 'There are many students who want to study abroad in our school.',
        translation: '我们学校有很多想出国留学的学生。',
        components: [
            {word:'There',role:'引导词',clauseType:null},
            {word:'are',role:'谓语',clauseType:null},
            {word:'many',role:'定语',clauseType:null},
            {word:'students',role:'主语',clauseType:null},
            {word:'who want to study abroad',role:'定语',clauseType:'定语从句'},
            {word:'in our school',role:'状语',clauseType:null}
        ],
        grammarPoints: ['There be句型','定语从句(who引导，修饰students)','want to do sth.'],
        keyPhrases: ['study abroad','in our school']
    },
    {
        sentence: 'Had I known the truth, I would have told you earlier.',
        translation: '如果我知道真相，我就会早点告诉你了。',
        components: [
            {word:'Had I known the truth',role:'状语',clauseType:'状语从句(条件,虚拟,倒装)'},
            {word:'I',role:'主语',clauseType:null},
            {word:'would have told',role:'谓语',clauseType:null},
            {word:'you',role:'宾语',clauseType:null},
            {word:'earlier',role:'状语',clauseType:null}
        ],
        grammarPoints: ['虚拟语气(与过去事实相反)','if省略引起倒装(Had I known = If I had known)','过去完成时+would have done'],
        keyPhrases: ['know the truth','tell sb. earlier']
    },
    {
        sentence: 'The more you read, the more you will know.',
        translation: '你读得越多，知道的就越多。',
        components: [
            {word:'The more',role:'状语',clauseType:null},
            {word:'you',role:'主语',clauseType:null},
            {word:'read',role:'谓语',clauseType:null},
            {word:'the more',role:'状语',clauseType:null},
            {word:'you',role:'主语',clauseType:null},
            {word:'will know',role:'谓语',clauseType:null}
        ],
        grammarPoints: ['The+比较级..., the+比较级...句型(越...越...)','复合句'],
        keyPhrases: ['the more...the more...']
    },
    {
        sentence: 'It is said that he has been to many countries around the world.',
        translation: '据说他已经去过世界上许多国家。',
        components: [
            {word:'It',role:'主语(形式)',clauseType:null},
            {word:'is said',role:'谓语(被动)',clauseType:null},
            {word:'that he has been to many countries around the world',role:'主语',clauseType:'名词性从句(主语从句)'}
        ],
        grammarPoints: ['It is said that...句型(据说...)','主语从句(that引导)','现在完成时(has been to)'],
        keyPhrases: ['It is said that','have been to','around the world']
    }
];

// ==================== 状态 ====================
var state = {
    currentIndex: 0,
    customInput: '',
    customAnalysis: null
};

// ==================== 辅助函数 ====================
function escapeHtml(str){
    if(str===null||str===undefined) return '';
    return String(str)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#39;');
}

function nl2br(str){
    if(!str) return '';
    return escapeHtml(str).replace(/\n/g,'<br>');
}

// 获取角色颜色
function getRoleColor(role){
    if(ROLE_COLORS[role]) return ROLE_COLORS[role];
    return '#666';
}

// 获取角色背景色（淡色版）
function getRoleBgColor(role){
    var lightMap = {
        '主语':'#ffebee',
        '谓语':'#e3f2fd',
        '宾语':'#e8f5e9',
        '表语':'#e0f7fa',
        '定语':'#fffde7',
        '状语':'#f3e5f5',
        '补语':'#fff3e0',
        '主语(形式)':'#ffebee',
        '谓语(被动)':'#e3f2fd',
        '引导词':'#efebe9'
    };
    if(lightMap[role]) return lightMap[role];
    return '#f5f5f5';
}

// ==================== 自定义输入规则分析 ====================
function analyzeSentence(text){
    if(!text || text.trim()==='') return null;
    text = text.trim();
    var components = [];
    var grammarPoints = [];
    var keyPhrases = [];

    // 简单分词（按空格）
    var tokens = text.split(/\s+/);
    if(tokens.length===0) return null;

    // 关键动词词表（常见be动词与助动词）
    var beVerbs = ['is','are','was','were','am','be','been','being'];
    var auxVerbs = ['do','does','did','have','has','had','will','would','shall','should','can','could','may','might','must','ought'];
    var commonVerbs = ['asked','told','said','want','know','think','make','go','read','study','finished','told','told','told'];

    // 第一个词通常为主语（简化规则）
    var firstWord = tokens[0].replace(/[^a-zA-Z']/g,'');
    if(firstWord){
        components.push({word:tokens[0],role:'主语',clauseType:null});
    }

    // 寻找动词
    for(var i=1;i<tokens.length;i++){
        var w = tokens[i].toLowerCase().replace(/[^a-zA-Z']/g,'');
        if(beVerbs.indexOf(w)!==-1 || auxVerbs.indexOf(w)!==-1 || /ed$/.test(w) || /ing$/.test(w) || /s$/.test(w) && w.length>3){
            components.push({word:tokens[i],role:'谓语',clauseType:null});
        } else if(w==='that' || w==='which' || w==='who' || w==='whom' || w==='whose' || w==='whether' || w==='if'){
            components.push({word:tokens[i],role:'引导词',clauseType:'从句'});
        } else if(w==='not' || w==='never' || w==='always' || w==='often' || w==='usually' || w==='sometimes'){
            components.push({word:tokens[i],role:'状语',clauseType:null});
        } else {
            // 默认归为宾语/其他
            components.push({word:tokens[i],role:'宾语/其他',clauseType:null});
        }
    }

    // 简单语法点识别
    if(/\bthat\b/i.test(text)) grammarPoints.push('含that引导从句');
    if(/\bwho\b/i.test(text)||/\bwhich\b/i.test(text)||/\bwhom\b/i.test(text)) grammarPoints.push('可能含定语从句');
    if(/\bif\b/i.test(text)||/\bwhether\b/i.test(text)) grammarPoints.push('可能含宾语从句');
    if(/\bhad\s+\w+ed\b/i.test(text)) grammarPoints.push('可能含过去完成时');
    if(/\bhave\s+\w+ed\b/i.test(text)||/\bhas\s+\w+ed\b/i.test(text)) grammarPoints.push('可能含现在完成时');
    if(/\bwill\s+\w+\b/i.test(text)||/\bwould\s+\w+\b/i.test(text)) grammarPoints.push('可能含将来时/虚拟语气');
    if(/\bed\b/i.test(text)) grammarPoints.push('可能含过去时');
    if(/\bing\b/i.test(text)) grammarPoints.push('可能含现在分词/动名词');
    if(/\bthe\s+more\b/i.test(text)) grammarPoints.push('可能含the+比较级句型');

    // 关键短语（简化：识别常见搭配）
    if(/it\s+is\s+said\s+that/i.test(text)) keyPhrases.push('It is said that');
    if(/there\s+(is|are|was|were)/i.test(text)) keyPhrases.push('There be句型');
    if(/want\s+to/i.test(text)) keyPhrases.push('want to do');
    if(/have\s+been\s+to/i.test(text)) keyPhrases.push('have been to');
    if(/look\s+forward\s+to/i.test(text)) keyPhrases.push('look forward to');

    if(grammarPoints.length===0) grammarPoints.push('（自动识别有限，建议人工分析）');

    return {
        sentence: text,
        translation: '（自定义输入，无预置翻译）',
        components: components,
        grammarPoints: grammarPoints,
        keyPhrases: keyPhrases
    };
}

// ==================== 渲染函数 ====================
function renderInputArea(){
    var html = '<div style="background:#fff;padding:16px;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06);margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;color:#333;font-size:16px;">📝 句子输入区</h3>';

    // 预置例句选择下拉
    html += '<div style="margin-bottom:12px;">';
    html += '<label style="display:block;font-size:13px;color:#666;margin-bottom:6px;">从预置例句选择：</label>';
    html += '<select id="sentence-select" onchange="window.englishSentenceAnalyzer._onSelectPreset(this.value)" style="'+
        'width:100%;padding:8px 10px;border:2px solid #ddd;border-radius:6px;font-size:14px;box-sizing:border-box;background:#fff;">';
    for(var i=0;i<PRESET_SENTENCES.length;i++){
        var s = PRESET_SENTENCES[i];
        var short = s.sentence.length>50 ? s.sentence.substring(0,50)+'...' : s.sentence;
        html += '<option value="'+i+'"'+(state.currentIndex===i?' selected':'')+'>'+(i+1)+'. '+escapeHtml(short)+'</option>';
    }
    html += '</select>';
    html += '</div>';

    // 自定义输入
    html += '<div style="margin-bottom:12px;">';
    html += '<label style="display:block;font-size:13px;color:#666;margin-bottom:6px;">或手动输入长难句：</label>';
    html += '<textarea id="custom-sentence-input" placeholder="请输入英文长难句..." style="'+
        'width:100%;min-height:60px;padding:10px 12px;border:2px solid #ddd;border-radius:6px;font-size:14px;resize:vertical;box-sizing:border-box;line-height:1.5;font-family:inherit;" '+
        'oninput="window.englishSentenceAnalyzer._onCustomInput(this.value)">'+escapeHtml(state.customInput)+'</textarea>';
    html += '</div>';

    // 分析按钮
    html += '<div style="display:flex;gap:8px;">';
    html += '<button onclick="window.englishSentenceAnalyzer._analyzeCustom()" style="'+
        'padding:8px 20px;background:#1a73e8;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">🔍 分析自定义句子</button>';
    html += '<button onclick="window.englishSentenceAnalyzer._clearCustom()" style="'+
        'padding:8px 20px;background:#fff;color:#666;border:2px solid #ddd;border-radius:6px;font-size:14px;cursor:pointer;">清空</button>';
    html += '</div>';

    // 当前模式提示
    if(state.customAnalysis){
        html += '<div style="margin-top:10px;padding:8px 12px;background:#fff3e0;border-radius:6px;font-size:12px;color:#e65100;">'+
            '⚠ 当前显示的是自定义句子分析结果，仅供参考（自动识别可能不准确）</div>';
    } else {
        html += '<div style="margin-top:10px;padding:8px 12px;background:#e8f5e9;border-radius:6px;font-size:12px;color:#2e7d32;">'+
            '✓ 当前显示预置例句 #'+(state.currentIndex+1)+'（含完整人工标注）</div>';
    }

    html += '</div>';
    return html;
}

function renderSentenceVisualization(){
    var data = state.customAnalysis || PRESET_SENTENCES[state.currentIndex];
    var html = '<div style="background:#fff;padding:16px;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06);margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;color:#333;font-size:16px;">🎨 成分标注</h3>';

    // 原句
    html += '<div style="background:#f5f5f5;padding:10px 12px;border-radius:6px;margin-bottom:14px;font-size:15px;color:#333;line-height:1.6;font-style:italic;">'+
        '"'+escapeHtml(data.sentence)+'"</div>';

    // 成分标注（彩色标签）
    html += '<div style="line-height:2.4;margin-bottom:14px;">';
    for(var i=0;i<data.components.length;i++){
        var c = data.components[i];
        var color = getRoleColor(c.role);
        var bg = getRoleBgColor(c.role);
        html += '<span style="'+
            'display:inline-block;padding:4px 10px;margin:2px 4px 2px 0;'+
            'background:'+bg+';color:'+color+';border:1.5px solid '+color+';'+
            'border-radius:6px;font-size:14px;'+
            '" title="'+escapeHtml(c.role)+(c.clauseType?(' ('+c.clauseType+')'):'')+'">'+
            escapeHtml(c.word)+'<sub style="font-size:10px;color:'+color+';">'+escapeHtml(c.role)+'</sub></span>';
    }
    html += '</div>';

    // 图例
    html += '<div style="border-top:1px dashed #e0e0e0;padding-top:10px;margin-top:10px;">';
    html += '<div style="font-size:12px;color:#888;margin-bottom:6px;">图例：</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
    var legendRoles = ['主语','谓语','宾语','表语','定语','状语','补语'];
    for(var k=0;k<legendRoles.length;k++){
        var lr = legendRoles[k];
        html += '<span style="display:inline-block;padding:2px 8px;font-size:11px;color:'+getRoleColor(lr)+';background:'+getRoleBgColor(lr)+';border:1px solid '+getRoleColor(lr)+';border-radius:4px;">'+lr+'</span>';
    }
    html += '</div>';
    html += '</div>';

    html += '</div>';
    return html;
}

function renderTranslation(){
    var data = state.customAnalysis || PRESET_SENTENCES[state.currentIndex];
    var html = '<div style="background:#fff;padding:16px;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06);margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;color:#333;font-size:16px;">🌐 参考翻译</h3>';
    html += '<div style="background:#f0f4ff;padding:12px 14px;border-radius:6px;font-size:15px;color:#333;line-height:1.7;">'+
        escapeHtml(data.translation)+'</div>';
    html += '</div>';
    return html;
}

function renderGrammarAnalysis(){
    var data = state.customAnalysis || PRESET_SENTENCES[state.currentIndex];
    var html = '<div style="background:#fff;padding:16px;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06);margin-bottom:16px;">';
    html += '<h3 style="margin:0 0 12px 0;color:#333;font-size:16px;">📖 语法分析</h3>';

    // 语法点
    html += '<div style="margin-bottom:14px;">';
    html += '<div style="font-size:13px;color:#666;margin-bottom:6px;font-weight:600;">语法要点：</div>';
    html += '<ul style="margin:0;padding-left:20px;">';
    for(var i=0;i<data.grammarPoints.length;i++){
        html += '<li style="font-size:14px;color:#333;line-height:1.8;margin-bottom:4px;">'+escapeHtml(data.grammarPoints[i])+'</li>';
    }
    html += '</ul>';
    html += '</div>';

    // 关键短语
    html += '<div style="border-top:1px dashed #e0e0e0;padding-top:12px;">';
    html += '<div style="font-size:13px;color:#666;margin-bottom:6px;font-weight:600;">关键短语：</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
    if(data.keyPhrases && data.keyPhrases.length>0){
        for(var j=0;j<data.keyPhrases.length;j++){
            html += '<span style="display:inline-block;padding:4px 10px;background:#fff3e0;color:#e65100;border:1px solid #ffb74d;border-radius:4px;font-size:13px;">'+escapeHtml(data.keyPhrases[j])+'</span>';
        }
    } else {
        html += '<span style="font-size:13px;color:#999;">（未识别到关键短语）</span>';
    }
    html += '</div>';
    html += '</div>';

    // 成分从句类型汇总
    var hasClause = false;
    for(var k=0;k<data.components.length;k++){
        if(data.components[k].clauseType){ hasClause = true; break; }
    }
    if(hasClause){
        html += '<div style="border-top:1px dashed #e0e0e0;padding-top:12px;margin-top:12px;">';
        html += '<div style="font-size:13px;color:#666;margin-bottom:6px;font-weight:600;">从句结构：</div>';
        html += '<ul style="margin:0;padding-left:20px;">';
        for(var m=0;m<data.components.length;m++){
            var comp = data.components[m];
            if(comp.clauseType){
                html += '<li style="font-size:14px;color:#7b1fa2;line-height:1.8;margin-bottom:4px;">'+
                    '<strong>'+escapeHtml(comp.word)+'</strong> → '+escapeHtml(comp.clauseType)+'（作'+escapeHtml(comp.role)+'）</li>';
            }
        }
        html += '</ul>';
        html += '</div>';
    }

    html += '</div>';
    return html;
}

function render(){
    var container = document.getElementById('sentence-analyzer-app');
    if(!container) return;
    var html = '<div style="max-width:900px;margin:0 auto;padding:16px;">';
    html += '<div style="text-align:center;margin-bottom:18px;">';
    html += '<h2 style="margin:0 0 6px 0;color:#333;font-size:22px;">📖 英语长难句分析器</h2>';
    html += '<p style="margin:0;color:#888;font-size:13px;">15句经典长难句 · 成分标注 · 语法分析 · 支持自定义输入</p>';
    html += '</div>';
    html += renderInputArea();
    html += renderSentenceVisualization();
    html += renderTranslation();
    html += renderGrammarAnalysis();
    html += '<div style="text-align:center;color:#aaa;font-size:12px;padding:12px 0;">共 '+PRESET_SENTENCES.length+' 句预置例句 | 自定义输入仅供参考</div>';
    html += '</div>';
    container.innerHTML = html;
}

// ==================== 事件处理 ====================
function bindEvents(){
    // 事件通过 onclick/oninput 内联绑定，无需额外监听
}

// ==================== 对外接口 ====================
window.englishSentenceAnalyzer = {
    render: render,
    getPresetSentences: function(){ return PRESET_SENTENCES; },
    _onSelectPreset: function(idx){
        state.currentIndex = parseInt(idx,10) || 0;
        state.customAnalysis = null;
        state.customInput = '';
        render();
    },
    _onCustomInput: function(val){
        state.customInput = val;
    },
    _analyzeCustom: function(){
        if(!state.customInput || state.customInput.trim()===''){
            alert('请先输入要分析的英文句子');
            return;
        }
        try {
            state.customAnalysis = analyzeSentence(state.customInput);
        } catch (err) {
            console.error('长难句分析失败:', err);
            state.customAnalysis = null;
        }
        render();
    },
    _clearCustom: function(){
        state.customInput = '';
        state.customAnalysis = null;
        render();
    }
};

})();

// 跨学科与可视化增强模块
// 包含：crossSubjectTopics(跨学科融合专题)、techFrontiers(科技前沿关联)、
//       formulaDerivation(公式推导动画)、physicsModelSim(物理模型可视化)、
//       chemTransformNet(化学物质转化网络)、bioChartTrainer(生物图表题专项)
// 纯前端实现，零依赖，数据内嵌，ES5兼容

// ==================== 1. crossSubjectTopics 跨学科融合专题 ====================
var crossSubjectTopics = {
    state: { currentView: 'list', currentId: null },

    data: [
        {
            id: 'ps_spectrum',
            title: '光合作用 × 光谱分析',
            icon: '🌿',
            subjects: ['生物', '物理', '化学'],
            color: '#16a34a',
            principle: '叶绿素主要吸收红光(640-660nm)和蓝紫光(430-450nm)，反射绿光故呈绿色。不同色素的吸收光谱可通过分光光度计测定，其原理涉及光的波动性、原子能级跃迁和分子轨道理论。光合作用效率与光质密切相关，这成为温室补光、LED植物工厂等现代农业技术的理论基础。',
            keyPoints: [
                '叶绿素a的吸收峰：430nm(蓝紫光)和660nm(红光)',
                '叶绿素b的吸收峰：455nm(蓝紫光)和643nm(红光)',
                '类胡萝卜素只吸收蓝紫光，不吸收红光',
                '光子能量 E=hν=h·c/λ，红光光子能量低于蓝紫光',
                '恩格尔曼实验用好氧细菌验证不同光质下光合速率差异'
            ],
            example: {
                question: '用波长为660nm的红光和430nm的蓝紫光分别照射同一离体叶绿体，其他条件相同且适宜。关于两组实验的叙述正确的是：',
                options: [
                    'A. 红光组光反应产生的ATP多于蓝紫光组',
                    'B. 蓝紫光组单位时间内产生的O2分子数多于红光组',
                    'C. 两组光反应产生的[H]速率相同',
                    'D. 蓝紫光组光子能量高，暗反应固定CO2速率更快'
                ],
                answer: 1,
                analysis: '叶绿素对660nm红光和430nm蓝紫光都有较强吸收，但蓝紫光光子能量更高(E=hν=h·c/λ，波长越短能量越大)，单个光子激发电子能级跃迁释放能量更多，单位光子贡献的光反应效率更高；同时叶绿素a在蓝紫光区吸收系数略低于红光区，但综合光子能量因素，蓝紫光组O2释放速率通常更高。暗反应速率受光反应产物ATP和[H]量影响，蓝紫光组略快。'
            },
            trend: '近年高考常以"光质—光合曲线—色素分离"为情境命题，2023年新课标卷、2022年山东卷均出现。重点考查光子能量计算、色素吸收光谱与光合速率的定量关系，常结合LED补光、设施农业等真实情境。'
        },
        {
            id: 'isotope_dna',
            title: '放射性同位素 × DNA复制',
            icon: '☢️',
            subjects: ['生物', '化学', '物理'],
            color: '#dc2626',
            principle: '梅塞尔森-斯塔尔实验利用¹⁵N(重氮)和¹⁴N(轻氮)标记DNA，通过密度梯度离心区分不同密度的DNA分子。¹⁵N比¹⁴N多一个中子，质量数相差1，导致DNA浮力密度差异约0.005g/cm³，可在CsCl梯度中分离。该实验证明了DNA的半保留复制方式，是同位素示踪技术在分子生物学中的经典应用。',
            keyPoints: [
                '¹⁵N的半衰期无放射性危害(稳定同位素)，适合生物实验',
                '³H、³²P、³⁵S为放射性同位素，分别用于标记不同生物分子',
                '³²P标记DNA磷酸基团，³⁵S标记蛋白质甲硫氨酸/半胱氨酸',
                '赫尔希-蔡斯实验用³²P/³⁵S证明DNA是遗传物质',
                '密度梯度离心原理：CsCl在超速离心下形成密度梯度'
            ],
            example: {
                question: '将含¹⁵N标记的DNA(全重链)的大肠杆菌转移到含¹⁴N的培养基中培养，提取子代DNA进行CsCl密度梯度离心。关于复制n代后DNA带型的叙述，正确的是：',
                options: [
                    'A. 复制1代后出现1条中等密度带和1条轻密度带',
                    'B. 复制2代后中等密度带与轻密度带DNA分子数之比为1:3',
                    'C. 复制3代后只出现轻密度带',
                    'D. 含¹⁵N的DNA链占总链数的比例随复制代数线性递减'
                ],
                answer: 1,
                analysis: '半保留复制：1代后全为中等密度(¹⁵N/¹⁴N杂合)，2个分子；2代后2个中等密度+2个轻密度(¹⁴N/¹⁴N)，比例为1:1；3代后2个中等+6个轻，比例1:3。含¹⁵N的链始终只有2条(原始母链)，总链数为2^(n+1)，比例=2/2^(n+1)=1/2^n，呈指数递减而非线性。故B正确。'
            },
            trend: '同位素示踪是高考高频考点，常以"标记某元素→追踪产物→判断复制方式/代谢途径"为命题逻辑。近年结合PCR、噬菌体侵染、光合作用碳追踪等情境，考查对半保留复制、放射性自显影、密度梯度的综合理解。'
        },
        {
            id: 'equilibrium_enzyme',
            title: '化学平衡 × 酶动力学',
            icon: '⚖️',
            subjects: ['化学', '生物'],
            color: '#0891b2',
            principle: '酶促反应遵循米氏方程 v=vmax·[S]/(Km+[S])，其本质与化学平衡密切相关。当底物浓度远大于Km时，酶被饱和，反应达最大速率；当[S]=Km时，v=vmax/2。温度、pH、抑制剂通过改变酶构象影响反应速率常数k和平衡常数K。竞争性抑制剂增大表观Km但不改变vmax，非竞争性抑制剂降低vmax但不改变Km，这与化学平衡中催化剂不影响平衡移动的原理一致。',
            keyPoints: [
                '米氏常数Km是酶的特征常数，反映酶与底物的亲和力',
                'Km越小，亲和力越大；Km≈[S]时v=vmax/2',
                '竞争性抑制：抑制剂与底物结构相似，竞争活性中心',
                '非竞争性抑制：抑制剂结合于变构位点，改变酶构象',
                '酶的最适温度/ pH是反应速率与变性的综合结果'
            ],
            example: {
                question: '某酶促反应体系中，加入竞争性抑制剂后，下列叙述正确的是：',
                options: [
                    'A. vmax降低，Km不变',
                    'B. vmax不变，Km增大',
                    'C. vmax和Km均降低',
                    'D. vmax和Km均增大'
                ],
                answer: 1,
                analysis: '竞争性抑制剂与底物竞争酶的活性中心，需增大底物浓度才能克服抑制，故表观Km增大(亲和力下降)；但当底物浓度足够大时，可完全置换抑制剂，反应仍能达到最大速率vmax不变。这与化学平衡中加入一种反应物可推动平衡移动的勒夏特列原理一致。非竞争性抑制剂则改变酶构象使有效酶浓度降低，vmax下降而Km不变。'
            },
            trend: '酶动力学曲线分析是生物化学交叉热点，2022年湖南卷、2023年湖北卷考查米氏方程与抑制剂类型判断。命题趋势是结合药物设计(如磺胺类抗菌药竞争性抑制)、代谢调控等情境，考查对Km、vmax物理意义的理解。'
        },
        {
            id: 'electrochem_biosensor',
            title: '电化学 × 生物传感',
            icon: '⚡',
            subjects: ['化学', '生物', '物理'],
            color: '#7c3aed',
            principle: '生物传感器将生物识别元件(酶、抗体、核酸)与信号转换器(电极、光极)结合，利用电化学原理将生化反应转化为电信号。葡萄糖氧化酶电极是经典案例：葡萄糖在GOD催化下氧化生成葡萄糖酸和H2O2，H2O2在电极上氧化产生电流，电流大小与葡萄糖浓度成正比。涉及原电池原理、酶催化、电子传递链等多学科知识。',
            keyPoints: [
                '血糖仪原理：GOD催化葡萄糖氧化，检测H2O2氧化电流',
                '酶电极 = 固定化酶 + 基础电极(铂电极/氧电极)',
                '电流型传感器：测电流变化；电位型传感器：测电位变化',
                '生物传感器的选择性来源于酶的专一性',
                '纳米材料(如金纳米颗粒)可增大电极比表面积提高灵敏度'
            ],
            example: {
                question: '某葡萄糖生物传感器以葡萄糖氧化酶(GOD)修饰铂电极，在恒定电位下检测血液葡萄糖浓度。下列叙述错误的是：',
                options: [
                    'A. 电极上检测到的电流信号来源于H2O2的氧化',
                    'B. 增大酶固定量一定能线性提高检测灵敏度',
                    'C. 该传感器对葡萄糖具有高度选择性源于GOD的专一性',
                    'D. 氧气是该酶促反应的电子受体'
                ],
                answer: 1,
                analysis: 'GOD催化反应：葡萄糖+O2→葡萄糖酸+H2O2。H2O2在铂电极上氧化：H2O2→O2+2H++2e-，产生的电流与葡萄糖浓度成正比，A正确。酶固定量增大到一定程度后，电极表面被酶饱和，传质成为限速步骤，灵敏度不再线性提高，B错误。GOD只催化葡萄糖，选择性源于酶专一性，C正确。O2是GOD的天然电子受体，D正确。'
            },
            trend: '生物传感器是高考化学与生物交叉的新兴热点，常以"血糖仪—酶电极—纳米材料修饰"为情境命题。重点考查原电池/电解池原理、酶催化特性、电流与浓度的定量关系，近年多次出现在新课标卷和北京卷。'
        },
        {
            id: 'fluid_blood',
            title: '流体力学 × 血液循环',
            icon: '🩸',
            subjects: ['物理', '生物'],
            color: '#be185d',
            principle: '血液在血管中的流动遵循泊肃叶定律 Q=πr⁴ΔP/(8ηL)和连续性方程 A1v1=A2v2。毛细血管虽细但总截面积远大于动脉，故血流速度最慢，利于物质交换。血压随血管分支递减，静脉血压最低。血液是非牛顿流体，但在大血管中可近似为牛顿流体处理。心脏做功 W=P·ΔV+½ρv²ΔV，维持血液循环。',
            keyPoints: [
                '泊肃叶定律：流量与半径四次方成正比，半径微小变化显著影响流量',
                '连续性方程：截面积越大流速越慢(毛细血管最慢)',
                '动脉→毛细血管→静脉：总截面积先增后减，流速先减后增',
                '心脏做功 = 体积功(克服血压) + 动能功(赋予血液动能)',
                '血液黏度η≈水的3-4倍，影响流动阻力'
            ],
            example: {
                question: '正常人体血液循环中，关于血流速度和血压的叙述，正确的是：',
                options: [
                    'A. 主动脉血流速度最快，毛细血管血流速度最慢',
                    'B. 毛细血管总截面积最小，故血流速度最慢',
                    'C. 静脉血压高于动脉血压，利于血液回流',
                    'D. 血管半径缩小一半，血流量减少为原来的1/4'
                ],
                answer: 0,
                analysis: '由连续性方程v=Q/A，主动脉截面积小但流量大，流速最快；毛细血管虽单根细，但并联数量极多，总截面积最大(约为主动脉的800倍)，故流速最慢(约0.05cm/s)，利于物质交换，A正确B错误。血压从动脉到静脉递减，静脉血压最低，靠静脉瓣和肌肉泵回流，C错误。由泊肃叶定律Q∝r⁴，半径减半则流量变为1/16，D错误。'
            },
            trend: '流体力学与生理学交叉是物理新高考的命题方向，2022年广东卷、2023年浙江卷出现。重点考查连续性方程、泊肃叶定律在血管中的应用，常结合心脏做功、血压测量等情境，强调物理模型与生理实际的对应。'
        },
        {
            id: 'spectrum_structure',
            title: '光谱分析 × 物质结构',
            icon: '🌈',
            subjects: ['化学', '物理'],
            color: '#ea580c',
            principle: '不同原子/分子的电子能级差决定其吸收或发射光谱的特征波长。原子光谱是线状光谱(如氢原子巴尔末系)，分子光谱是带状光谱。红外光谱(IR)对应分子振动能级跃迁，用于鉴定官能团；紫外光谱(UV)对应电子跃迁，用于共轭体系分析；核磁共振(NMR)对应核自旋能级跃迁，用于测定氢/碳环境。光谱分析是物质结构鉴定的核心手段。',
            keyPoints: [
                '玻尔模型：En=-13.6/n² eV，跃迁光子能量ΔE=hν',
                '氢原子光谱线系：莱曼(UV)、巴尔末(可见)、帕邢(IR)',
                '红外光谱：3300cm⁻¹附近为O-H/N-H伸缩振动',
                '核磁共振氢谱：峰面积比=不同环境氢原子个数比',
                '质谱：分子离子峰确定分子量，碎片峰推断结构'
            ],
            example: {
                question: '某有机物分子式为C2H6O，其红外光谱在3300cm⁻¹处有强宽吸收峰，核磁共振氢谱有两组峰，峰面积比为1:5。该有机物的结构是：',
                options: [
                    'A. CH3-O-CH3(甲醚)',
                    'B. CH3CH2OH(乙醇)',
                    'C. 两者皆可能',
                    'D. 无法判断'
                ],
                answer: 1,
                analysis: '红外光谱3300cm⁻¹强宽吸收为O-H伸缩振动，排除甲醚(无O-H)。核磁共振氢谱两组峰：乙醇CH3CH2OH中CH3(3H,三重峰)、CH2(2H,四重峰)、OH(1H,单峰)理论为三组峰，但OH氢活泼常被合并或位移；若按"甲基氢:亚甲基+羟基氢"分组，峰面积比3:3或1:5需具体条件。题给1:5对应CH3(3H)与CH2+OH(3H)的某种积分方式，结合IR有O-H，确定为乙醇B。甲醚只有一组氢(6H等价)，不符。'
            },
            trend: '光谱解析是化学选考高频考点，2023年全国乙卷、2022年山东卷考查IR+NMR综合推断。命题趋势是给出多谱图数据(分子式+IR+NMR+MS)推断结构，强调谱图与分子结构的对应关系，常结合有机合成情境。'
        },
        {
            id: 'thermo_metabolism',
            title: '热力学 × 细胞代谢',
            icon: '🔥',
            subjects: ['物理', '生物', '化学'],
            color: '#b91c1c',
            principle: '细胞代谢遵循热力学第一定律(能量守恒)和第二定律(熵增)。ATP水解 ΔG=-30.5kJ/mol 是放能反应，驱动吸能反应(如肌肉收缩、主动运输)。葡萄糖彻底氧化 ΔG=-2870kJ/mol，能量约40%转化为ATP，其余以热能散失(维持体温)。呼吸链中电子传递伴随能量逐级释放，符合能量递降原理。光合作用是太阳能→化学能的转化，总熵仍增加。',
            keyPoints: [
                '热力学第一定律：ΔU=Q+W，能量守恒',
                '热力学第二定律：孤立系统熵增，ΔS≥0',
                'ATP水解 ΔG<0 为放能反应，驱动吸能反应',
                '葡萄糖氧化：40%转ATP，60%转热能(代谢效率)',
                '光合作用总反应：6CO2+6H2O→C6H12O6+6O2，ΔG>0吸能'
            ],
            example: {
                question: '关于细胞呼吸与光合作用的能量转化，下列叙述正确的是：',
                options: [
                    'A. 细胞呼吸中葡萄糖的化学能全部转化为ATP中的化学能',
                    'B. 光合作用光反应将光能转化为ATP和NADPH中的化学能，熵减小',
                    'C. 葡萄糖氧化释放的能量中约40%转化为ATP，其余以热能散失',
                    'D. 光合作用总反应是放能反应，细胞呼吸是吸能反应'
                ],
                answer: 2,
                analysis: '细胞呼吸中葡萄糖化学能约40%转ATP，60%以热能散失(维持体温)，A错误C正确。光合作用光反应将光能转ATP/NADPH化学能，但整个光合作用涉及CO2和水转化为有机物，局部熵减但宇宙总熵增(太阳辐射熵增更大)，B表述不严谨。光合作用总反应ΔG>0为吸能反应(储能)，细胞呼吸ΔG<0为放能反应(释能)，D说反。'
            },
            trend: '热力学与代谢的交叉是高考生物与化学的命题热点，2022年全国甲卷、2023年湖南卷考查能量流动效率。重点考查ATP-能量通货、代谢效率、熵变分析，常结合生态系统能量流动、发酵工程等情境。'
        },
        {
            id: 'nano_biomed',
            title: '纳米材料 × 生物医学',
            icon: '🔬',
            subjects: ['化学', '生物', '物理'],
            color: '#0d9488',
            principle: '纳米材料(1-100nm)具有尺寸效应、表面效应和量子效应，在生物医学中应用广泛。金纳米颗粒因表面等离子共振效应(SPR)可用于肿瘤光热治疗；磁性纳米颗粒(Fe3O4)可作MRI造影剂和药物靶向载体；脂质体纳米颗粒是mRNA疫苗递送载体。纳米材料的高比表面积增大载药量，表面修饰可实现主动靶向，EPR效应(实体瘤高通透性和滞留)实现被动靶向。',
            keyPoints: [
                '纳米尺寸效应：1-100nm，性质不同于宏观和分子',
                '表面效应：比表面积大，反应活性高',
                '金纳米颗粒SPR效应：近红外光吸收，光热治疗肿瘤',
                'EPR效应：肿瘤血管通透性高，纳米颗粒被动富集',
                '脂质体递送mRNA：保护核酸，融合细胞膜释放'
            ],
            example: {
                question: '关于纳米材料在生物医学中的应用，下列叙述正确的是：',
                options: [
                    'A. 金纳米颗粒用于肿瘤光热治疗是因为其在可见光区有强吸收',
                    'B. 磁性Fe3O4纳米颗粒作MRI造影剂利用其顺磁性缩短T1或T2',
                    'C. 脂质体纳米颗粒递送mRNA主要依靠主动靶向',
                    'D. 纳米材料的生物安全性已完全解决，可大规模临床应用'
                ],
                answer: 1,
                analysis: '金纳米颗粒通过调控尺寸和形貌，其表面等离子共振吸收可调到近红外区(700-900nm)，该波段生物组织透明窗口，光穿透深，用于光热治疗，A错误(非可见光区)。Fe3O4超顺磁纳米颗粒可缩短质子T2弛豫时间，作T2加权MRI造影剂，B正确。脂质体递送mRNA主要靠EPR效应被动靶向和静电/融合作用，主动靶向需表面修饰配体，C错误。纳米材料生物安全性(毒性、代谢、蓄积)仍是研究热点，未完全解决，D错误。'
            },
            trend: '纳米医学是高考化学与生物的前沿热点，2023年北京卷、2022年浙江卷考查纳米材料性质与应用。命题趋势是结合mRNA疫苗、靶向给药、肿瘤诊疗等真实情境，考查纳米效应、生物相容性、靶向机制，强调结构与功能的关联。'
        }
    ],

    init: function() {
        this._render();
    },

    _render: function() {
        var app = document.getElementById('cross-subject-app');
        if (!app) return;
        try {
            if (this.state.currentView === 'detail' && this.state.currentId) {
                this._renderDetail();
            } else {
                this._renderList();
            }
        } catch (err) {
            console.error('跨学科专题渲染失败:', err);
        }
    },

    _renderList: function() {
        var app = document.getElementById('cross-subject-app');
        if (!app) return;
        var html = '<div style="padding:16px;">' +
            '<div style="background:linear-gradient(135deg,#16a34a,#0891b2);color:#fff;padding:18px 22px;border-radius:12px;margin-bottom:18px;">' +
            '<h3 style="margin:0 0 6px 0;font-size:1.25rem;">🌐 物化生跨学科融合专题</h3>' +
            '<p style="margin:0;font-size:0.9rem;opacity:0.95;">共 ' + this.data.length + ' 个专题，覆盖物理·化学·生物三大学科交叉点，紧扣高考命题趋势</p></div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;">';
        for (var i = 0; i < this.data.length; i++) {
            var t = this.data[i];
            html += '<div onclick="crossSubjectTopics._showDetail(\'' + t.id + '\')" style="background:#fff;border:1px solid #e2e8f0;border-top:4px solid ' + t.color + ';border-radius:10px;padding:16px;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;" onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 20px rgba(0,0,0,0.1)\';" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\';">' +
                '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
                '<span style="font-size:1.8rem;">' + t.icon + '</span>' +
                '<h4 style="margin:0;color:#0f172a;font-size:1.05rem;flex:1;">' + t.title + '</h4></div>' +
                '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px;">';
            for (var j = 0; j < t.subjects.length; j++) {
                html += '<span style="background:' + t.color + ';color:#fff;padding:2px 9px;border-radius:10px;font-size:0.75rem;">' + t.subjects[j] + '</span>';
            }
            html += '</div>' +
                '<p style="margin:0;color:#475569;font-size:0.85rem;line-height:1.6;">' + t.principle.substring(0, 70) + '...</p>' +
                '<div style="margin-top:10px;color:' + t.color + ';font-size:0.85rem;font-weight:600;">查看详情 →</div></div>';
        }
        html += '</div></div>';
        app.innerHTML = html;
    },

    _showDetail: function(id) {
        this.state.currentView = 'detail';
        this.state.currentId = id;
        this._renderDetail();
    },

    _backToList: function() {
        this.state.currentView = 'list';
        this.state.currentId = null;
        this._renderList();
    },

    _renderDetail: function() {
        var app = document.getElementById('cross-subject-app');
        if (!app) return;
        var t = null;
        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].id === this.state.currentId) { t = this.data[i]; break; }
        }
        if (!t) { this._backToList(); return; }
        var html = '<div style="padding:16px;">' +
            '<button onclick="crossSubjectTopics._backToList()" style="background:#f1f5f9;color:#475569;border:0;padding:8px 16px;border-radius:6px;cursor:pointer;margin-bottom:14px;">← 返回专题列表</button>' +
            '<div style="background:linear-gradient(135deg,' + t.color + ',' + t.color + 'cc);color:#fff;padding:22px;border-radius:12px;margin-bottom:18px;">' +
            '<div style="display:flex;align-items:center;gap:12px;">' +
            '<span style="font-size:2.5rem;">' + t.icon + '</span>' +
            '<div><h3 style="margin:0;font-size:1.4rem;">' + t.title + '</h3>' +
            '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">';
        for (var j = 0; j < t.subjects.length; j++) {
            html += '<span style="background:rgba(255,255,255,0.25);padding:3px 10px;border-radius:10px;font-size:0.8rem;">' + t.subjects[j] + '</span>';
        }
        html += '</div></div></div></div>' +
            '<div style="background:#fff;border:1px solid #e2e8f0;border-left:4px solid ' + t.color + ';border-radius:8px;padding:16px;margin-bottom:14px;">' +
            '<h4 style="margin:0 0 10px 0;color:' + t.color + ';">📖 原理讲解</h4>' +
            '<p style="margin:0;color:#334155;line-height:1.8;font-size:0.92rem;">' + t.principle + '</p></div>' +
            '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:14px;">' +
            '<h4 style="margin:0 0 10px 0;color:#0f172a;">🔑 关键知识点</h4>' +
            '<ul style="margin:0;padding-left:20px;">';
        for (var k = 0; k < t.keyPoints.length; k++) {
            html += '<li style="margin:6px 0;color:#334155;line-height:1.6;font-size:0.9rem;">' + t.keyPoints[k] + '</li>';
        }
        html += '</ul></div>' +
            '<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:14px;">' +
            '<h4 style="margin:0 0 10px 0;color:#b45309;">📝 典型例题</h4>' +
            '<p style="margin:0 0 12px 0;color:#1f2937;line-height:1.7;font-size:0.92rem;">' + t.example.question + '</p>' +
            '<div style="display:flex;flex-direction:column;gap:7px;" id="cs-options"></div>' +
            '<div id="cs-analysis" style="display:none;margin-top:12px;padding:12px;background:#f0fdf4;border-radius:6px;border-left:3px solid #16a34a;">' +
            '<strong style="color:#15803d;">解析：</strong>' +
            '<p style="margin:6px 0 0;color:#475569;font-size:0.88rem;line-height:1.7;">' + t.example.analysis + '</p></div></div>' +
            '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;">' +
            '<h4 style="margin:0 0 10px 0;color:#1e40af;">📈 命题趋势</h4>' +
            '<p style="margin:0;color:#1e3a8a;line-height:1.7;font-size:0.9rem;">' + t.trend + '</p></div></div>';
        app.innerHTML = html;
        this._renderOptions();
    },

    _renderOptions: function() {
        var container = document.getElementById('cs-options');
        if (!container) return;
        var t = null;
        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].id === this.state.currentId) { t = this.data[i]; break; }
        }
        if (!t) return;
        var html = '';
        for (var i = 0; i < t.example.options.length; i++) {
            html += '<button onclick="crossSubjectTopics._answer(' + i + ')" data-idx="' + i + '" style="text-align:left;padding:10px 14px;background:#fff;border:1.5px solid #e2e8f0;border-radius:6px;cursor:pointer;font-size:0.9rem;color:#334155;">' + t.example.options[i] + '</button>';
        }
        container.innerHTML = html;
    },

    _answer: function(idx) {
        var t = null;
        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].id === this.state.currentId) { t = this.data[i]; break; }
        }
        if (!t) return;
        var btns = document.getElementById('cs-options').children;
        for (var i = 0; i < btns.length; i++) {
            btns[i].disabled = true;
            var iIdx = parseInt(btns[i].getAttribute('data-idx'), 10);
            if (iIdx === t.example.answer) {
                btns[i].style.background = '#dcfce7';
                btns[i].style.borderColor = '#16a34a';
                btns[i].style.color = '#15803d';
            } else if (iIdx === idx) {
                btns[i].style.background = '#fee2e2';
                btns[i].style.borderColor = '#ef4444';
                btns[i].style.color = '#b91c1c';
            }
        }
        document.getElementById('cs-analysis').style.display = 'block';
    }
};
window.crossSubjectTopics = crossSubjectTopics;


// ==================== 2. techFrontiers 科技前沿关联 ====================
var techFrontiers = {
    state: { filter: 'all' },

    data: [
        { id: 'mrna', topic: 'mRNA疫苗', year: 2023, field: '生物医学', subjects: ['生物', '化学'], icon: '💉',
          points: ['基因表达', '脂质体', '免疫应答', '中心法则'],
          intro: '2023年诺贝尔生理学或医学奖。mRNA疫苗将编码抗原的mRNA包裹于脂质体纳米颗粒中，递送至细胞内翻译为抗原蛋白，激发特异性免疫。核心技术涉及mRNA修饰(假尿苷化避免免疫识别)和脂质体递送系统。',
          example: { question: 'mRNA疫苗进入人体细胞后，发挥作用的场所和直接产物是：', options: ['A. 细胞质基质·抗原蛋白', 'B. 细胞核·抗原蛋白', 'C. 核糖体·mRNA', 'D. 内质网·脂质体'], answer: 0, analysis: 'mRNA疫苗进入细胞后，在细胞质基质的核糖体上翻译为抗原蛋白(直接产物)，抗原蛋白被呈递激发免疫。mRNA不进入细胞核(不与基因组DNA整合)，这是mRNA疫苗安全性高于DNA疫苗的原因之一。' } },
        { id: 'crispr', topic: 'CRISPR-Cas9基因编辑', year: 2020, field: '基因工程', subjects: ['生物', '化学'], icon: '✂️',
          points: ['基因编辑', '向导RNA', 'DNA修复', '限制酶'],
          intro: '2020年诺贝尔化学奖。CRISPR-Cas9系统利用向导RNA(gRNA)识别目标DNA序列，Cas9核酸酶切割DNA，通过非同源末端连接(NHEJ)或同源定向修复(HDR)实现基因敲除或敲入。被誉为"基因剪刀"。',
          example: { question: 'CRISPR-Cas9系统中，决定切割位点特异性的关键是：', options: ['A. Cas9蛋白', 'B. 向导RNA(gRNA)', 'C. PAM序列', 'D. DNA连接酶'], answer: 1, analysis: 'gRNA的前20个碱基与目标DNA互补配对，决定切割位点的特异性。Cas9是执行切割的"剪刀"但本身无序列特异性。PAM序列(NGG)是Cas9识别结合的前提，但特异性由gRNA决定。故选B。' } },
        { id: 'quantum', topic: '量子通信', year: 2022, field: '量子物理', subjects: ['物理'], icon: '🔐',
          points: ['量子纠缠', '不确定性原理', 'BB84协议', '光子偏振'],
          intro: '基于量子纠缠和量子不可克隆定理实现绝对安全的通信。中国"墨子号"卫星实现千公里级量子密钥分发。BB84协议利用光子偏振态编码信息，任何窃听都会改变量子态被发现。',
          example: { question: '量子密钥分发(BB84协议)能实现绝对安全通信的物理基础是：', options: ['A. 量子纠缠的超距作用', 'B. 量子不可克隆定理和测量塌缩', 'C. 海森堡不确定性原理', 'D. 光的波粒二象性'], answer: 1, analysis: 'BB84协议的安全性基于量子力学的两个基本原理：①量子不可克隆定理(无法完美复制未知量子态)；②测量塌缩(任何窃听测量都会改变量子态被察觉)。量子纠缠用于E91协议，不确定性原理是基础但非直接保证。故选B。' } },
        { id: 'graphene', topic: '石墨烯', year: 2010, field: '纳米材料', subjects: ['化学', '物理'], icon: '⬡',
          points: ['sp2杂化', '二维材料', '能带结构', '霍尔效应'],
          intro: '2010年诺贝尔物理学奖。单层碳原子以sp2杂化形成六角蜂窝状二维结构，厚度仅一个原子。具有超高电子迁移率、优异导热性和机械强度。应用于柔性电子、超级电容器、传感器等。',
          example: { question: '关于石墨烯的性质，下列叙述正确的是：', options: ['A. 石墨烯中碳原子为sp3杂化', 'B. 石墨烯是绝缘体，无法导电', 'C. 石墨烯电子迁移率远高于硅', 'D. 石墨烯层间以共价键结合'], answer: 2, analysis: '石墨烯中碳原子为sp2杂化(平面三角形)，A错误。石墨烯是零带隙半导体，导电性优异，B错误。石墨烯电子迁移率约200000cm²/(V·s)，远高于硅(约1400)，C正确。石墨烯层间以范德华力结合(层内共价键)，D错误。' } },
        { id: 'libattery', topic: '锂离子电池', year: 2019, field: '能源化学', subjects: ['化学', '物理'], icon: '🔋',
          points: ['氧化还原', '嵌入反应', '电极电势', '电解质'],
          intro: '2019年诺贝尔化学奖。锂离子电池通过Li+在正极(如LiCoO2)和负极(石墨)间嵌入/脱嵌实现充放电。工作原理涉及电化学氧化还原、离子迁移和嵌入化学。能量密度高、循环寿命长，主导新能源汽车和储能。',
          example: { question: '锂离子电池放电时，关于Li+迁移和电子流向，下列叙述正确的是：', options: ['A. Li+从正极迁向负极，电子从负极流向正极', 'B. Li+从负极迁向正极，电子从负极流向正极', 'C. Li+从正极迁向负极，电子从正极流向负极', 'D. Li+从负极迁向正极，电子从正极流向负极'], answer: 1, analysis: '放电时负极(石墨嵌锂)失电子氧化：LixC6→C6+xLi++xe-，Li+经电解质迁向正极，电子经外电路从负极流向正极；正极得电子还原：Li1-xCoO2+xLi++xe-→LiCoO2。故Li+从负极迁向正极，电子从负极流向正极(外电路)，选B。' } },
        { id: 'gfp', topic: '绿色荧光蛋白GFP', year: 2008, field: '生物技术', subjects: ['生物', '化学'], icon: '🟢',
          points: ['蛋白质荧光', '基因标记', '构象变化', '发色团'],
          intro: '2008年诺贝尔化学奖。GFP来自维多利亚多管发光水母，其发色团由Ser65-Tyr66-Gly67三肽经氧化环化形成，受蓝光激发发射绿色荧光。GFP基因可与目标基因融合，实现活体实时观察蛋白定位和表达，是生物学的"分子灯泡"。',
          example: { question: '将GFP基因与某目的蛋白基因融合表达，关于该技术的应用，错误的是：', options: ['A. 可追踪目的蛋白在细胞内的定位', 'B. 可实时观察目的蛋白的动态变化', 'C. GFP发色团形成需要外部底物添加', 'D. 融合蛋白的荧光信号反映目的蛋白表达量'], answer: 2, analysis: 'GFP的优势在于其发色团可自发形成(由Ser-Tyr-Gly三肽氧化环化)，无需添加外部底物或辅因子，这是其优于其他荧光蛋白的关键，C错误。GFP融合可追踪蛋白定位(A)、观察动态(B)、反映表达量(D)，均正确。' } },
        { id: 'pcr', topic: 'PCR聚合酶链式反应', year: 1993, field: '分子生物', subjects: ['生物', '化学'], icon: '🧬',
          points: ['DNA复制', 'Taq酶', '引物', '温度循环'],
          intro: '1993年诺贝尔化学奖(穆利斯)。PCR通过高温变性-低温退火-中温延伸三步循环，在体外指数扩增DNA。关键试剂包括Taq DNA聚合酶(耐高温)、引物、dNTP、模板。应用于基因检测、疾病诊断、法医鉴定、新冠核酸检测等。',
          example: { question: 'PCR反应中，引物的作用是：', options: ['A. 提供DNA合成的原料', 'B. 提供DNA合成的3\'-OH起点', 'C. 催化磷酸二酯键形成', 'D. 解开DNA双螺旋'], answer: 1, analysis: 'DNA聚合酶不能从头起始DNA合成，必须依赖引物提供游离的3\'-OH，从该处按5\'→3\'方向延伸。引物是与模板互补的短单链DNA/RNA。dNTP提供原料(A)，Taq酶催化磷酸二酯键(C)，高温解开双螺旋(D)。故选B。' } },
        { id: 'nanorobot', topic: '纳米机器人', year: 2024, field: '纳米医学', subjects: ['化学', '生物', '物理'], icon: '🤖',
          points: ['分子马达', '靶向递药', '微纳制造', '生物相容'],
          intro: '纳米机器人是尺寸在纳米级的可控运动装置，由DNA折纸、蛋白质马达或化学驱动纳米颗粒构成。可实现药物靶向递送、细胞内手术、血栓清除等。驱动方式包括化学反应驱动、磁场驱动、超声驱动和光驱动。',
          example: { question: '关于纳米机器人在医学中的应用，下列叙述合理的是：', options: ['A. 纳米机器人可自主完成复杂外科手术', 'B. 纳米机器人可携带药物穿透血脑屏障靶向治疗', 'C. 纳米机器人完全无生物毒性', 'D. 纳米机器人已大规模临床应用'], answer: 1, analysis: '纳米机器人可表面修饰靶向配体，携带药物通过EPR效应或受体介导穿透血脑屏障，实现脑部疾病靶向治疗，B合理。纳米机器人不能自主完成外科手术(需外部控制)，A夸大。纳米材料仍有潜在毒性，C错误。目前多在临床试验阶段，D错误。' } },
        { id: 'artphoto', topic: '人工光合作用', year: 2021, field: '能源化学', subjects: ['化学', '生物', '物理'], icon: '☀️',
          points: ['光催化', '水分解', 'CO2还原', '太阳能燃料'],
          intro: '模拟自然光合作用，利用太阳能分解水制氢或还原CO2制备有机物。核心是光催化剂(如TiO2、钙钛矿)吸收光子产生电子-空穴对，驱动氧化还原反应。是解决能源危机和碳中和的关键技术之一。',
          example: { question: '人工光合作用中，光催化剂TiO2的作用是：', options: ['A. 直接分解水分子', 'B. 吸收光子产生电子-空穴对，引发氧化还原', 'C. 降低水分解反应的活化能但不参与反应', 'D. 将光能直接转化为化学能储存'], answer: 1, analysis: 'TiO2是半导体光催化剂，吸收能量大于带隙的光子后，价带电子跃迁到导带形成电子-空穴对。电子还原H+生成H2，空穴氧化H2O生成O2。TiO2本身不消耗，提供电子-空穴对驱动反应，B正确。催化剂不直接分解水(A)，也不仅是降低活化能(C)，光能先转化为电子-空穴对再驱动化学反应(D不准确)。' } },
        { id: 'carbon', topic: '碳中和', year: 2021, field: '环境化学', subjects: ['化学', '生物'], icon: '🌱',
          points: ['碳循环', '温室效应', 'CCUS技术', '生态固碳'],
          intro: '中国承诺2030年前碳达峰、2060年前碳中和。涉及CO2捕集利用与封存(CCUS)、可再生能源替代、生态固碳(植树造林)、工业减排等。化学领域包括CO2催化加氢制甲醇、CO2矿化等转化利用技术。',
          example: { question: '关于"碳达峰"和"碳中和"，下列叙述正确的是：', options: ['A. 碳达峰指CO2排放量降为零', 'B. 碳中和指CO2排放量与吸收量达到平衡', 'C. 实现碳中和只需减少化石能源使用', 'D. 植树造林对碳中和贡献可忽略'], answer: 1, analysis: '碳达峰指CO2排放量达到历史最高值后开始下降，并非降为零，A错误。碳中和指通过减排和固碳使净排放量为零(排放=吸收)，B正确。碳中和需减排(能源结构调整)+固碳(CCUS、生态固碳)多措并举，C错误。植树造林是重要的生态固碳手段，贡献显著，D错误。' } },
        { id: 'alphafold', topic: 'AlphaFold蛋白质结构预测', year: 2024, field: '计算生物', subjects: ['生物', '化学'], icon: '🧩',
          points: ['蛋白质折叠', '深度学习', '结构生物学', '药物设计'],
          intro: '2024年诺贝尔化学奖。DeepMind的AlphaFold2利用深度学习从氨基酸序列预测蛋白质三维结构，精度接近实验测定。解决了困扰生物学50年的"蛋白质折叠问题"，加速药物设计和疾病机理研究。',
          example: { question: 'AlphaFold预测蛋白质结构的依据是：', options: ['A. 氨基酸序列', 'B. X射线衍射数据', 'C. 核磁共振数据', 'D. 电子显微镜图像'], answer: 0, analysis: 'AlphaFold2的核心突破是从氨基酸序列(一级结构)直接预测三维结构，利用深度学习从已知结构的蛋白质中学习序列-结构映射规律。X射线衍射、NMR、冷冻电镜是实验测定结构的方法，AlphaFold无需这些实验数据。故选A。' } },
        { id: 'fusion', topic: '核聚变', year: 2022, field: '核物理', subjects: ['物理', '化学'], icon: '☀️',
          points: ['质能方程', '结合能', '等离子体', '托卡马克'],
          intro: '2022年美国NIF首次实现核聚变净能量增益(Q>1)。聚变反应(氘+氚→氦+中子)释放巨大能量，依据爱因斯坦质能方程E=mc²。太阳能量来源即核聚变。托卡马克(磁约束)和激光惯性约束是两条主要技术路线，被誉为"人造太阳"。',
          example: { question: '核聚变反应 ²₁H+³₁H→⁴₂He+¹₀n，释放能量来源于：', options: ['A. 化学键断裂与形成', 'B. 反应前后质量亏损对应的能量', 'C. 原子核电子跃迁', 'D. 等离子体热运动'], answer: 1, analysis: '核聚变释放的能量来源于反应前后质量的微小亏损(质量亏损Δm)，由爱因斯坦质能方程E=Δmc²计算。聚变产物氦核和中子的总质量小于反应物氘氚的总质量，亏损质量转化为能量。化学键(A)、电子跃迁(C)涉及的是化学能/原子能，量级远小于核能。故选B。' } }
    ],

    init: function() { this._render(); },

    _render: function() {
        var app = document.getElementById('tech-frontiers-app');
        if (!app) return;
        var allSubjects = ['all', '物理', '化学', '生物'];
        var html = '<div style="padding:16px;">' +
            '<div style="background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;padding:18px 22px;border-radius:12px;margin-bottom:16px;">' +
            '<h3 style="margin:0 0 6px 0;font-size:1.25rem;">🏆 诺贝尔奖/科技前沿 × 高考考点映射</h3>' +
            '<p style="margin:0;font-size:0.9rem;opacity:0.95;">共 ' + this.data.length + ' 项前沿科技，关联高考核心考点</p></div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">';
        for (var i = 0; i < allSubjects.length; i++) {
            var s = allSubjects[i];
            var active = (this.state.filter === s);
            html += '<button onclick="techFrontiers._setFilter(\'' + s + '\')" style="background:' + (active ? '#7c3aed' : '#fff') + ';color:' + (active ? '#fff' : '#475569') + ';border:1.5px solid ' + (active ? '#7c3aed' : '#cbd5e1') + ';padding:6px 16px;border-radius:20px;cursor:pointer;font-size:0.88rem;">' + (s === 'all' ? '全部' : s) + '</button>';
        }
        html += '</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px;">';
        var count = 0;
        for (var i = 0; i < this.data.length; i++) {
            var d = this.data[i];
            if (this.state.filter !== 'all' && d.subjects.indexOf(this.state.filter) < 0) continue;
            count++;
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">' +
                '<div style="background:linear-gradient(135deg,#f5f3ff,#fce7f3);padding:14px 16px;border-bottom:1px solid #e2e8f0;">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">' +
                '<div style="display:flex;align-items:center;gap:10px;">' +
                '<span style="font-size:1.6rem;">' + d.icon + '</span>' +
                '<div><h4 style="margin:0;color:#0f172a;font-size:1.05rem;">' + d.topic + '</h4>' +
                '<div style="font-size:0.78rem;color:#64748b;margin-top:2px;">' + d.year + ' · ' + d.field + '</div></div></div></div>' +
                '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px;">';
            for (var j = 0; j < d.subjects.length; j++) {
                html += '<span style="background:#ede9fe;color:#6d28d9;padding:2px 8px;border-radius:8px;font-size:0.72rem;">' + d.subjects[j] + '</span>';
            }
            html += '</div></div>' +
                '<div style="padding:14px 16px;">' +
                '<p style="margin:0 0 10px 0;color:#475569;font-size:0.85rem;line-height:1.6;">' + d.intro + '</p>' +
                '<div style="margin-bottom:10px;"><div style="font-size:0.78rem;color:#7c3aed;font-weight:600;margin-bottom:5px;">📌 关联考点</div>' +
                '<div style="display:flex;flex-wrap:wrap;gap:5px;">';
            for (var k = 0; k < d.points.length; k++) {
                html += '<span style="background:#f1f5f9;color:#475569;padding:2px 8px;border-radius:6px;font-size:0.75rem;">' + d.points[k] + '</span>';
            }
            html += '</div></div>' +
                '<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:10px;margin-top:8px;">' +
                '<div style="font-size:0.78rem;color:#b45309;font-weight:600;margin-bottom:6px;">📝 关联例题</div>' +
                '<p style="margin:0 0 8px 0;font-size:0.82rem;color:#1f2937;line-height:1.5;">' + d.example.question + '</p>' +
                '<div id="tf-opts-' + d.id + '" style="display:flex;flex-direction:column;gap:5px;">';
            for (var m = 0; m < d.example.options.length; m++) {
                html += '<button onclick="techFrontiers._answer(\'' + d.id + '\',' + m + ')" data-idx="' + m + '" style="text-align:left;padding:6px 10px;background:#fff;border:1px solid #e5e7eb;border-radius:4px;cursor:pointer;font-size:0.78rem;color:#475569;">' + d.example.options[m] + '</button>';
            }
            html += '</div><div id="tf-ana-' + d.id + '" style="display:none;margin-top:8px;padding:8px;background:#f0fdf4;border-radius:4px;font-size:0.78rem;color:#166534;line-height:1.5;"><strong>解析：</strong>' + d.example.analysis + '</div></div></div></div>';
        }
        html += '</div>';
        if (count === 0) {
            html += '<p style="text-align:center;color:#94a3b8;padding:30px;">该学科下暂无条目</p>';
        }
        html += '</div>';
        app.innerHTML = html;
    },

    _setFilter: function(s) {
        this.state.filter = s;
        this._render();
    },

    _answer: function(id, idx) {
        var d = null;
        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].id === id) { d = this.data[i]; break; }
        }
        if (!d) return;
        var opts = document.getElementById('tf-opts-' + id);
        if (!opts) return;
        var btns = opts.children;
        for (var i = 0; i < btns.length; i++) {
            btns[i].disabled = true;
            var iIdx = parseInt(btns[i].getAttribute('data-idx'), 10);
            if (iIdx === d.example.answer) {
                btns[i].style.background = '#dcfce7';
                btns[i].style.borderColor = '#16a34a';
                btns[i].style.color = '#15803d';
            } else if (iIdx === idx) {
                btns[i].style.background = '#fee2e2';
                btns[i].style.borderColor = '#ef4444';
                btns[i].style.color = '#b91c1c';
            }
        }
        document.getElementById('tf-ana-' + id).style.display = 'block';
    }
};
window.techFrontiers = techFrontiers;


// ==================== 3. formulaDerivation 公式推导动画 ====================
var formulaDerivation = {
    state: { formulaId: 'kinetic', step: 0, playing: false, timer: null },

    data: {
        kinetic: {
            name: '动能定理推导',
            icon: '⚡',
            color: '#3b82f6',
            steps: [
                { formula: '由牛顿第二定律：F = ma', highlight: 'F = ma', explain: '从牛顿第二定律出发，合外力 F 等于质量 m 与加速度 a 的乘积，这是动能定理的物理基础。' },
                { formula: '加速度定义：a = dv/dt', highlight: 'a = dv/dt', explain: '加速度是速度对时间的变化率，将其代入牛顿第二定律。' },
                { formula: '代入得：F = m·(dv/dt)', highlight: 'm·(dv/dt)', explain: '将加速度表达式代入 F=ma，得到力与速度变化率的关系。' },
                { formula: '两边乘以位移元 dx：F·dx = m·(dv/dt)·dx', highlight: 'F·dx', explain: '等式两边同乘位移元 dx，左边变为功的微元 F·dx，这是关键的数学操作。' },
                { formula: '由于 v = dx/dt，即 dx = v·dt', highlight: 'dx = v·dt', explain: '由速度定义 v=dx/dt 变形得到 dx=v·dt，用于替换右边的 dx。' },
                { formula: '代入得：F·dx = m·v·dv', highlight: 'm·v·dv', explain: '将 dx=v·dt 代入，(dv/dt)·dx = (dv/dt)·v·dt = v·dv，右边变为 m·v·dv。' },
                { formula: '两边积分：∫F·dx = ∫m·v·dv', highlight: '∫', explain: '对等式两边从初态到末态积分，左边是合外力做功，右边是动能变化。' },
                { formula: '得：W = ½mv₂² - ½mv₁²', highlight: 'W = ½mv₂² - ½mv₁²', explain: '积分结果：合外力做的功 W 等于末动能减初动能，即动能变化量 ΔEk。这就是动能定理！' }
            ]
        },
        projectile: {
            name: '平抛运动轨迹方程推导',
            icon: '🎯',
            color: '#f59e0b',
            steps: [
                { formula: '平抛运动分解：水平匀速 + 竖直自由落体', highlight: '分解', explain: '平抛运动可分解为水平方向的匀速直线运动和竖直方向的自由落体运动，这是运动学分解思想。' },
                { formula: '水平方向：x = v₀·t  →  t = x/v₀', highlight: 't = x/v₀', explain: '水平方向匀速，位移 x=v₀·t，解出时间 t=x/v₀。' },
                { formula: '竖直方向：y = ½·g·t²', highlight: 'y = ½·g·t²', explain: '竖直方向初速度为零，加速度为 g，位移公式 y=½gt²。' },
                { formula: '将 t = x/v₀ 代入 y = ½gt²', highlight: '代入', explain: '将水平方向解出的时间表达式代入竖直位移公式，消去时间参数 t。' },
                { formula: '得：y = ½·g·(x/v₀)²', highlight: '(x/v₀)²', explain: '代入后得到 y=½g(x/v₀)²，这是含 x 和 y 的关系式。' },
                { formula: '化简：y = (g/2v₀²)·x²', highlight: 'g/2v₀²', explain: '整理得 y=(g/2v₀²)x²，这是标准的抛物线方程 y=ax² 形式。' },
                { formula: '轨迹方程：y = gx²/(2v₀²)', highlight: 'y = gx²/(2v₀²)', explain: '最终轨迹方程 y=gx²/(2v₀²)，表明平抛运动轨迹是抛物线，开口向下，形状由初速度 v₀ 和重力加速度 g 决定。' }
            ]
        },
        centripetal: {
            name: '向心加速度公式推导',
            icon: '🔄',
            color: '#10b981',
            steps: [
                { formula: '匀速圆周运动：速度大小不变，方向时刻改变', highlight: '方向改变', explain: '匀速圆周运动中，速度大小(速率)不变，但方向时刻在改变，故存在加速度，方向指向圆心。' },
                { formula: '取时间 Δt 内速度变化 Δv', highlight: 'Δv', explain: '在 Δt 时间内，物体从 A 点运动到 B 点，速度从 vA 变为 vB，速度变化量 Δv=vB-vA。' },
                { formula: '速度三角形与位置三角形相似', highlight: '相似', explain: '速度三角形(由 vA、vB、Δv 构成)与位置三角形(由 OA、OB、弧AB 构成)相似，因两者均为等腰三角形且顶角相同(均为 ωΔt)。' },
                { formula: '故：Δv/v = Δr/r', highlight: 'Δv/v = Δr/r', explain: '由相似三角形对应边成比例：Δv/v = Δr/r，其中 r 为半径，Δr 为弦长 AB。' },
                { formula: '得：Δv = (v/r)·Δr', highlight: 'Δv = (v/r)·Δr', explain: '变形得到 Δv 的表达式，与位移 Δr 相关。' },
                { formula: '加速度 a = Δv/Δt = (v/r)·(Δr/Δt)', highlight: 'Δv/Δt', explain: '加速度定义 a=Δv/Δt，代入上式，将 Δv 替换。' },
                { formula: '当 Δt→0 时，Δr/Δt → v', highlight: 'Δr/Δt → v', explain: '当 Δt 趋近于零时，弦长 Δr 趋近于弧长，Δr/Δt 趋近于线速度 v。' },
                { formula: '得：a = v²/r', highlight: 'a = v²/r', explain: '代入得 a=(v/r)·v=v²/r，这就是向心加速度公式！方向指向圆心，反映速度方向变化的快慢。' }
            ]
        },
        gas: {
            name: '理想气体状态方程推导',
            icon: '🎈',
            color: '#8b5cf6',
            steps: [
                { formula: '玻意耳定律(等温)：p₁V₁ = p₂V₂', highlight: 'p₁V₁ = p₂V₂', explain: '一定质量气体等温变化时，压强与体积成反比，即 pV=常数。' },
                { formula: '查理定律(等容)：p₁/T₁ = p₂/T₂', highlight: 'p₁/T₁ = p₂/T₂', explain: '一定质量气体等容变化时，压强与热力学温度成正比，即 p/T=常数。' },
                { formula: '盖-吕萨克定律(等压)：V₁/T₁ = V₂/T₂', highlight: 'V₁/T₁ = V₂/T₂', explain: '一定质量气体等压变化时，体积与热力学温度成正比，即 V/T=常数。' },
                { formula: '设气体从状态(p₁,V₁,T₁)到(p₂,V₂,T₂)', highlight: '状态', explain: '考虑一定质量气体从初态到末态的一般变化过程，可分解为两个等值过程。' },
                { formula: '中间态：先等温至 (p\', V₂, T₁)', highlight: '等温', explain: '第一步等温变化(玻意耳定律)：p₁V₁=p\'V₂，得 p\'=p₁V₁/V₂。' },
                { formula: '再等容至 (p₂, V₂, T₂)', highlight: '等容', explain: '第二步等容变化(查理定律)：p\'/T₁=p₂/T₂，得 p\'=p₂T₁/T₂。' },
                { formula: '联立：p₁V₁/V₂ = p₂T₁/T₂', highlight: '联立', explain: '将两步得到的 p\' 表达式联立，消去中间量 p\'。' },
                { formula: '得：p₁V₁/T₁ = p₂V₂/T₂', highlight: 'p₁V₁/T₁ = p₂V₂/T₂', explain: '整理得 pV/T=恒量，即理想气体状态方程！对于 1mol 气体，恒量=R(普适气体常量)=8.31J/(mol·K)，一般形式 pV=nRT。' }
            ]
        }
    },

    init: function() { this._render(); },

    _render: function() {
        var app = document.getElementById('formula-derivation-app');
        if (!app) return;
        var keys = ['kinetic', 'projectile', 'centripetal', 'gas'];
        var html = '<div style="padding:16px;">' +
            '<div style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;padding:18px 22px;border-radius:12px;margin-bottom:16px;">' +
            '<h3 style="margin:0 0 6px 0;font-size:1.25rem;">📐 物理公式推导可视化</h3>' +
            '<p style="margin:0;font-size:0.9rem;opacity:0.95;">逐步展示推导过程，高亮关键步骤，支持自动播放</p></div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">';
        for (var i = 0; i < keys.length; i++) {
            var f = this.data[keys[i]];
            var active = (this.state.formulaId === keys[i]);
            html += '<button onclick="formulaDerivation._setFormula(\'' + keys[i] + '\')" style="background:' + (active ? f.color : '#fff') + ';color:' + (active ? '#fff' : '#475569') + ';border:1.5px solid ' + (active ? f.color : '#cbd5e1') + ';padding:8px 14px;border-radius:8px;cursor:pointer;font-size:0.88rem;">' + f.icon + ' ' + f.name + '</button>';
        }
        html += '</div>';
        var cur = this.data[this.state.formulaId];
        var step = this.state.step;
        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">' +
            '<div style="background:' + cur.color + ';color:#fff;padding:14px 20px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<h4 style="margin:0;font-size:1.1rem;">' + cur.icon + ' ' + cur.name + '</h4>' +
            '<span style="background:rgba(255,255,255,0.25);padding:4px 12px;border-radius:12px;font-size:0.85rem;">步骤 ' + (step + 1) + ' / ' + cur.steps.length + '</span></div></div>' +
            '<div style="padding:24px;">' +
            '<svg viewBox="0 0 600 200" style="width:100%;height:auto;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">' +
            '<defs><style>.fstep{font-family:Georgia,serif;font-size:18px;fill:#1e293b;text-anchor:middle}.fhl{fill:#fbbf24;font-weight:bold}.fnum{font-size:13px;fill:#64748b;text-anchor:start}</style></defs>';
        for (var i = 0; i <= step; i++) {
            var s = cur.steps[i];
            var y = 40 + i * 22;
            var isCur = (i === step);
            var opacity = isCur ? 1 : 0.5;
            var bg = isCur ? '#fef3c7' : 'transparent';
            html += '<rect x="10" y="' + (y - 14) + '" width="580" height="22" fill="' + bg + '" rx="4"' + (isCur ? '' : ' opacity="0.6"') + '/>';
            html += '<text x="20" y="' + y + '" class="fnum" opacity="' + opacity + '">' + (i + 1) + '.</text>';
            var formulaText = s.formula;
            var hlIdx = formulaText.indexOf(s.highlight);
            if (hlIdx >= 0 && isCur) {
                var before = formulaText.substring(0, hlIdx);
                var hl = s.highlight;
                var after = formulaText.substring(hlIdx + hl.length);
                var totalLen = formulaText.length;
                var startX = 300 - totalLen * 5;
                html += '<text x="' + startX + '" y="' + y + '" class="fstep">' + this._esc(before) + '<tspan class="fhl">' + this._esc(hl) + '</tspan>' + this._esc(after) + '</text>';
            } else {
                html += '<text x="300" y="' + y + '" class="fstep" opacity="' + opacity + '">' + this._esc(formulaText) + '</text>';
            }
            if (isCur) {
                html += '<polygon points="' + (560) + ',' + (y - 4) + ' ' + (570) + ',' + y + ' ' + (560) + ',' + (y + 4) + '" fill="' + cur.color + '"/>';
            }
        }
        html += '</svg>' +
            '<div style="margin-top:16px;padding:14px;background:#f0f9ff;border-left:4px solid ' + cur.color + ';border-radius:6px;">' +
            '<div style="font-size:0.85rem;color:' + cur.color + ';font-weight:600;margin-bottom:6px;">💡 当前步骤说明</div>' +
            '<p style="margin:0;color:#1e3a8a;line-height:1.7;font-size:0.9rem;">' + cur.steps[step].explain + '</p></div>' +
            '<div style="margin-top:16px;display:flex;gap:10px;justify-content:center;align-items:center;">' +
            '<button onclick="formulaDerivation._prev()" ' + (step === 0 ? 'disabled' : '') + ' style="background:' + (step === 0 ? '#e2e8f0' : '#f1f5f9') + ';color:' + (step === 0 ? '#94a3b8' : '#475569') + ';border:0;padding:8px 18px;border-radius:6px;cursor:' + (step === 0 ? 'not-allowed' : 'pointer') + ';font-size:0.9rem;">⬅ 上一步</button>' +
            '<button onclick="formulaDerivation._togglePlay()" style="background:' + cur.color + ';color:#fff;border:0;padding:8px 22px;border-radius:6px;cursor:pointer;font-size:0.9rem;">' + (this.state.playing ? '⏸ 暂停' : '▶ 自动播放') + '</button>' +
            '<button onclick="formulaDerivation._next()" ' + (step === cur.steps.length - 1 ? 'disabled' : '') + ' style="background:' + (step === cur.steps.length - 1 ? '#e2e8f0' : '#f1f5f9') + ';color:' + (step === cur.steps.length - 1 ? '#94a3b8' : '#475569') + ';border:0;padding:8px 18px;border-radius:6px;cursor:' + (step === cur.steps.length - 1 ? 'not-allowed' : 'pointer') + ';font-size:0.9rem;">下一步 ➡</button></div>' +
            '<div style="margin-top:14px;display:flex;gap:3px;justify-content:center;">';
        for (var i = 0; i < cur.steps.length; i++) {
            html += '<div onclick="formulaDerivation._goto(' + i + ')" style="width:' + (i === step ? '28px' : '10px') + ';height:6px;background:' + (i === step ? cur.color : '#cbd5e1') + ';border-radius:3px;cursor:pointer;transition:width 0.3s;"></div>';
        }
        html += '</div></div></div></div>';
        app.innerHTML = html;
    },

    _esc: function(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    _setFormula: function(id) {
        this._stop();
        this.state.formulaId = id;
        this.state.step = 0;
        this._render();
    },

    _prev: function() {
        if (this.state.step > 0) {
            this.state.step--;
            this._render();
        }
    },

    _next: function() {
        var cur = this.data[this.state.formulaId];
        if (this.state.step < cur.steps.length - 1) {
            this.state.step++;
            this._render();
        } else {
            this._stop();
        }
    },

    _goto: function(i) {
        this._stop();
        this.state.step = i;
        this._render();
    },

    _togglePlay: function() {
        if (this.state.playing) {
            this._stop();
        } else {
            this._play();
        }
    },

    _play: function() {
        var self = this;
        var cur = this.data[this.state.formulaId];
        if (this.state.step >= cur.steps.length - 1) {
            this.state.step = 0;
        }
        this.state.playing = true;
        this._render();
        this.state.timer = setInterval(function() {
            if (self.state.step < cur.steps.length - 1) {
                self.state.step++;
                self._render();
            } else {
                self._stop();
            }
        }, 2200);
    },

    _stop: function() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
            this.state.timer = null;
        }
        if (this.state.playing) {
            this.state.playing = false;
            this._render();
        }
    }
};
window.formulaDerivation = formulaDerivation;


// ==================== 4. physicsModelSim 物理模型可视化 ====================
var physicsModelSim = {
    state: {
        modelId: 'block',
        running: false,
        t: 0,
        timer: null,
        params: { m1: 1, m2: 2, mu: 0.2, v0: 4, belt: 3, angle: 0, k: 50, A: 0.2, v1: 2, v2: 1 }
    },

    models: {
        block: { name: '板块模型', icon: '🟫', color: '#0891b2', params: [
            { key: 'm1', label: '滑块质量m₁(kg)', min: 0.5, max: 5, step: 0.1 },
            { key: 'm2', label: '木板质量m₂(kg)', min: 0.5, max: 5, step: 0.1 },
            { key: 'mu', label: '摩擦因数μ', min: 0.05, max: 0.8, step: 0.05 },
            { key: 'v0', label: '滑块初速度v₀(m/s)', min: 0, max: 10, step: 0.5 }
        ]},
        belt: { name: '传送带模型', icon: '🔄', color: '#f59e0b', params: [
            { key: 'mu', label: '摩擦因数μ', min: 0.05, max: 0.8, step: 0.05 },
            { key: 'v0', label: '物体初速度v₀(m/s)', min: 0, max: 10, step: 0.5 },
            { key: 'belt', label: '传送带速度v(m/s)', min: 0.5, max: 8, step: 0.5 },
            { key: 'angle', label: '倾角θ(°)', min: 0, max: 30, step: 1 }
        ]},
        spring: { name: '弹簧振子模型', icon: '🌀', color: '#10b981', params: [
            { key: 'm1', label: '振子质量m(kg)', min: 0.2, max: 3, step: 0.1 },
            { key: 'k', label: '劲度系数k(N/m)', min: 10, max: 200, step: 5 },
            { key: 'A', label: '振幅A(m)', min: 0.05, max: 0.5, step: 0.05 }
        ]},
        collision: { name: '碰撞模型', icon: '💥', color: '#ef4444', params: [
            { key: 'm1', label: '物体1质量m₁(kg)', min: 0.5, max: 5, step: 0.1 },
            { key: 'm2', label: '物体2质量m₂(kg)', min: 0.5, max: 5, step: 0.1 },
            { key: 'v1', label: '物体1初速度v₁(m/s)', min: 0, max: 8, step: 0.5 },
            { key: 'v2', label: '物体2初速度v₂(m/s)', min: -4, max: 4, step: 0.5 }
        ]}
    },

    init: function() { this._render(); },

    _render: function() {
        var app = document.getElementById('physics-model-app');
        if (!app) return;
        try {
        var keys = ['block', 'belt', 'spring', 'collision'];
        var html = '<div style="padding:16px;">' +
            '<div style="background:linear-gradient(135deg,#0891b2,#0d9488);color:#fff;padding:18px 22px;border-radius:12px;margin-bottom:16px;">' +
            '<h3 style="margin:0 0 6px 0;font-size:1.25rem;">⚙️ 物理模型动态演示</h3>' +
            '<p style="margin:0;font-size:0.9rem;opacity:0.95;">板块·传送带·弹簧振子·碰撞，可调参数，实时受力与v-t图</p></div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">';
        for (var i = 0; i < keys.length; i++) {
            var m = this.models[keys[i]];
            var active = (this.state.modelId === keys[i]);
            html += '<button onclick="physicsModelSim._setModel(\'' + keys[i] + '\')" style="background:' + (active ? m.color : '#fff') + ';color:' + (active ? '#fff' : '#475569') + ';border:1.5px solid ' + (active ? m.color : '#cbd5e1') + ';padding:8px 14px;border-radius:8px;cursor:pointer;font-size:0.88rem;">' + m.icon + ' ' + m.name + '</button>';
        }
        html += '</div>';
        var cur = this.models[this.state.modelId];
        html += '<div style="display:grid;grid-template-columns:1fr;gap:14px;">' +
            '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">' +
            '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;">';
        for (var i = 0; i < cur.params.length; i++) {
            var p = cur.params[i];
            html += '<label style="font-size:0.85rem;color:#475569;">' + p.label + ': ' +
                '<input type="number" id="pm-' + p.key + '" value="' + this.state.params[p.key] + '" min="' + p.min + '" max="' + p.max + '" step="' + p.step + '" style="width:65px;padding:4px 6px;border:1px solid #cbd5e1;border-radius:4px;font-size:0.85rem;"></label>';
        }
        html += '<button onclick="physicsModelSim._toggle()" style="background:' + cur.color + ';color:#fff;border:0;padding:7px 18px;border-radius:6px;cursor:pointer;font-size:0.9rem;">' + (this.state.running ? '⏸ 暂停' : '▶ 播放') + '</button>' +
            '<button onclick="physicsModelSim._reset()" style="background:#f1f5f9;color:#475569;border:0;padding:7px 14px;border-radius:6px;cursor:pointer;font-size:0.9rem;">🔄 重置</button></div></div>' +
            '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">' +
            '<h4 style="margin:0 0 10px 0;color:#0f172a;">🎬 动态演示</h4>' +
            '<svg id="pm-svg" viewBox="0 0 600 220" style="width:100%;height:auto;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">' + this._renderScene() + '</svg></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">' +
            '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">' +
            '<h4 style="margin:0 0 10px 0;color:#0f172a;">🔍 受力分析</h4>' +
            '<div id="pm-force" style="font-size:0.85rem;color:#475569;line-height:1.7;">' + this._forceAnalysis() + '</div></div>' +
            '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">' +
            '<h4 style="margin:0 0 10px 0;color:#0f172a;">📊 速度-时间图像</h4>' +
            '<svg id="pm-vt" viewBox="0 0 280 160" style="width:100%;height:auto;background:#fafafa;border-radius:6px;">' + this._renderVT() + '</svg></div></div>' +
            '<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px;">' +
            '<h4 style="margin:0 0 8px 0;color:#b45309;">📖 模型要点</h4>' +
            '<p style="margin:0;color:#92400e;font-size:0.85rem;line-height:1.7;">' + this._modelTips() + '</p></div></div></div>';
        app.innerHTML = html;
        this._bindParamEvents();
        } catch (err) {
            console.error('物理模型演示渲染失败:', err);
        }
    },

    _renderScene: function() {
        var id = this.state.modelId;
        var p = this.state.params;
        var t = this.state.t;
        if (id === 'block') return this._sceneBlock(p, t);
        if (id === 'belt') return this._sceneBelt(p, t);
        if (id === 'spring') return this._sceneSpring(p, t);
        if (id === 'collision') return this._sceneCollision(p, t);
        return '';
    },

    _sceneBlock: function(p, t) {
        var g = 10;
        var a1 = -p.mu * g;
        var a2 = p.mu * p.m1 / p.m2 * g;
        var v1 = p.v0 + a1 * t;
        var v2 = a2 * t;
        var dv = p.v0;
        var tCommon = dv / (p.mu * g * (1 + p.m1 / p.m2));
        if (t > tCommon) { v1 = v2 = p.v0 * p.m1 / (p.m1 + p.m2); }
        var x1 = p.v0 * t + 0.5 * a1 * t * t;
        var x2 = 0.5 * a2 * t * t;
        var relX = Math.max(0, Math.min(180, x1 * 8));
        var boardX = Math.max(0, Math.min(280, x2 * 8));
        var blockX = 120 + relX + boardX;
        var svg = '<line x1="20" y1="180" x2="580" y2="180" stroke="#94a3b8" stroke-width="2"/>';
        svg += '<g transform="translate(' + boardX + ',140)"><rect x="100" y="20" width="240" height="22" fill="#a16207" stroke="#78350f" stroke-width="1.5" rx="2"/>';
        svg += '<text x="220" y="35" font-size="11" fill="#fff" text-anchor="middle">木板 m₂=' + p.m2 + 'kg</text></g>';
        svg += '<g transform="translate(' + blockX + ',110)"><rect x="0" y="0" width="44" height="30" fill="#0891b2" stroke="#155e75" stroke-width="1.5" rx="3"/>';
        svg += '<text x="22" y="19" font-size="10" fill="#fff" text-anchor="middle">m₁=' + p.m1 + '</text></g>';
        svg += '<text x="30" y="200" font-size="11" fill="#64748b">t=' + t.toFixed(2) + 's</text>';
        svg += '<text x="200" y="200" font-size="11" fill="#0891b2">v₁=' + v1.toFixed(2) + 'm/s</text>';
        svg += '<text x="380" y="200" font-size="11" fill="#a16207">v₂=' + v2.toFixed(2) + 'm/s</text>';
        if (v1 > v2) {
            svg += '<line x1="' + (blockX + 22) + '" y1="125" x2="' + (blockX + 50) + '" y2="125" stroke="#ef4444" stroke-width="2" marker-end="url(#pm-arr)"/>';
        }
        svg += '<defs><marker id="pm-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#ef4444"/></marker></defs>';
        return svg;
    },

    _sceneBelt: function(p, t) {
        var g = 10;
        var theta = p.angle * Math.PI / 180;
        var a = g * (Math.sin(theta) - p.mu * Math.cos(theta));
        if (p.angle === 0) a = -p.mu * g;
        var v = p.v0 + a * t;
        var beltV = p.belt;
        var tSync = (p.v0 - beltV) / a;
        if (a < 0 && t > tSync && tSync > 0) { v = beltV; a = 0; }
        if (a > 0 && t > tSync && tSync > 0) { v = beltV; a = 0; }
        var x = p.v0 * t + 0.5 * a * t * t;
        var objX = Math.max(20, Math.min(540, 80 + x * 8));
        var beltY = p.angle > 0 ? 160 : 170;
        var svg = '';
        if (p.angle > 0) {
            svg += '<line x1="40" y1="200" x2="560" y2="120" stroke="#475569" stroke-width="3"/>';
        } else {
            svg += '<line x1="40" y1="170" x2="560" y2="170" stroke="#475569" stroke-width="3"/>';
        }
        for (var i = 0; i < 8; i++) {
            var bx = 60 + i * 65 + (t * beltV * 15) % 65;
            svg += '<polygon points="' + bx + ',' + (beltY - 4) + ' ' + (bx + 8) + ',' + beltY + ' ' + bx + ',' + (beltY + 4) + '" fill="#64748b"/>';
        }
        var oy = p.angle > 0 ? (170 - (objX - 40) / 520 * 50 - 15) : 145;
        svg += '<rect x="' + objX + '" y="' + oy + '" width="36" height="26" fill="#f59e0b" stroke="#b45309" stroke-width="1.5" rx="3"/>';
        svg += '<text x="' + (objX + 18) + '" y="' + (oy + 16) + '" font-size="10" fill="#fff" text-anchor="middle">m</text>';
        svg += '<text x="30" y="30" font-size="11" fill="#64748b">t=' + t.toFixed(2) + 's</text>';
        svg += '<text x="200" y="30" font-size="11" fill="#f59e0b">v物=' + v.toFixed(2) + 'm/s</text>';
        svg += '<text x="380" y="30" font-size="11" fill="#475569">v带=' + beltV.toFixed(2) + 'm/s</text>';
        return svg;
    },

    _sceneSpring: function(p, t) {
        var omega = Math.sqrt(p.k / p.m1);
        var x = p.A * Math.cos(omega * t);
        var v = -p.A * omega * Math.sin(omega * t);
        var cx = 300 + x * 100;
        var svg = '<line x1="60" y1="180" x2="540" y2="180" stroke="#94a3b8" stroke-width="2"/>';
        svg += '<rect x="55" y="120" width="14" height="60" fill="#475569"/>';
        var coils = 12;
        var startX = 69;
        var endX = cx - 20;
        var dx = (endX - startX) / coils;
        svg += '<path d="M' + startX + ',150 ';
        for (var i = 0; i < coils; i++) {
            var x1 = startX + dx * i + dx * 0.25;
            var x2 = startX + dx * i + dx * 0.75;
            svg += 'L' + x1 + ',135 L' + x2 + ',165 ';
        }
        svg += 'L' + endX + ',150" stroke="#10b981" stroke-width="2" fill="none"/>';
        svg += '<rect x="' + (cx - 20) + '" y="125" width="40" height="50" fill="#10b981" stroke="#047857" stroke-width="1.5" rx="4"/>';
        svg += '<text x="' + cx + '" y="153" font-size="11" fill="#fff" text-anchor="middle">m=' + p.m1 + '</text>';
        svg += '<line x1="300" y1="195" x2="300" y2="210" stroke="#94a3b8" stroke-width="1"/>';
        svg += '<text x="300" y="222" font-size="10" fill="#64748b" text-anchor="middle">O(平衡位置)</text>';
        svg += '<text x="30" y="30" font-size="11" fill="#64748b">t=' + t.toFixed(2) + 's</text>';
        svg += '<text x="200" y="30" font-size="11" fill="#10b981">x=' + x.toFixed(3) + 'm</text>';
        svg += '<text x="380" y="30" font-size="11" fill="#7c3aed">v=' + v.toFixed(2) + 'm/s</text>';
        svg += '<text x="30" y="50" font-size="10" fill="#94a3b8">T=' + (2 * Math.PI / omega).toFixed(2) + 's</text>';
        return svg;
    },

    _sceneCollision: function(p, t) {
        var m1 = p.m1, m2 = p.m2, v1 = p.v1, v2 = p.v2;
        var x1 = 100 + v1 * t * 10;
        var x2 = 400 + v2 * t * 10;
        var collisionT = (400 - 100) / (v1 - v2);
        var v1After = v1, v2After = v2;
        if (v1 > v2 && t >= collisionT && collisionT > 0) {
            v1After = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
            v2After = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
            x1 = 100 + v1 * collisionT * 10 + v1After * (t - collisionT) * 10;
            x2 = 400 + v2 * collisionT * 10 + v2After * (t - collisionT) * 10;
        }
        x1 = Math.max(20, Math.min(560, x1));
        x2 = Math.max(20, Math.min(560, x2));
        var svg = '<line x1="20" y1="160" x2="580" y2="160" stroke="#94a3b8" stroke-width="2"/>';
        svg += '<circle cx="' + x1 + '" cy="140" r="18" fill="#ef4444" stroke="#991b1b" stroke-width="1.5"/>';
        svg += '<text x="' + x1 + '" y="144" font-size="10" fill="#fff" text-anchor="middle">m₁=' + m1 + '</text>';
        svg += '<circle cx="' + x2 + '" cy="140" r="18" fill="#3b82f6" stroke="#1e40af" stroke-width="1.5"/>';
        svg += '<text x="' + x2 + '" y="144" font-size="10" fill="#fff" text-anchor="middle">m₂=' + m2 + '</text>';
        svg += '<text x="30" y="30" font-size="11" fill="#64748b">t=' + t.toFixed(2) + 's</text>';
        svg += '<text x="200" y="30" font-size="11" fill="#ef4444">v₁=' + v1After.toFixed(2) + 'm/s</text>';
        svg += '<text x="380" y="30" font-size="11" fill="#3b82f6">v₂=' + v2After.toFixed(2) + 'm/s</text>';
        if (t >= collisionT && collisionT > 0) {
            svg += '<text x="280" y="50" font-size="11" fill="#16a34a" text-anchor="middle">💥 已碰撞(弹性)</text>';
        }
        return svg;
    },

    _forceAnalysis: function() {
        var id = this.state.modelId;
        var p = this.state.params;
        var g = 10;
        if (id === 'block') {
            var f = p.mu * p.m1 * g;
            var a1 = p.mu * g;
            var a2 = p.mu * p.m1 / p.m2 * g;
            return '<div>🟦 <strong>滑块m₁：</strong>重力m₁g=' + (p.m1 * g).toFixed(1) + 'N ↓，支持力N=m₁g ↑，摩擦力f=μm₁g=' + f.toFixed(2) + 'N ←(反向)</div>' +
                '<div style="margin-top:6px;">🟫 <strong>木板m₂：</strong>重力m₂g=' + (p.m2 * g).toFixed(1) + 'N，支持力N=(m₁+m₂)g，摩擦力f=\'=' + f.toFixed(2) + 'N →(驱动)</div>' +
                '<div style="margin-top:6px;">📐 <strong>加速度：</strong>a₁=' + a1.toFixed(2) + 'm/s²(减速)，a₂=' + a2.toFixed(2) + 'm/s²(加速)</div>' +
                '<div style="margin-top:6px;">⏱ <strong>共速时间：</strong>t=' + (p.v0 / (p.mu * g * (1 + p.m1 / p.m2))).toFixed(2) + 's</div>';
        }
        if (id === 'belt') {
            var f2 = p.mu * p.m1 * g;
            return '<div>🟧 <strong>物体：</strong>重力mg=' + (p.m1 * g).toFixed(1) + 'N ↓，支持力N=mg ↑</div>' +
                '<div style="margin-top:6px;">↔️ <strong>摩擦力：</strong>f=μmg=' + f2.toFixed(2) + 'N(方向取决于v物与v带关系)</div>' +
                '<div style="margin-top:6px;">📐 v物&gt;v带：f向后(减速)；v物&lt;v带：f向前(加速)</div>' +
                '<div style="margin-top:6px;">⏱ <strong>共速后：</strong>若水平传送带，物体随带匀速；若倾斜，需比较mgsinθ与μmgcosθ</div>';
        }
        if (id === 'spring') {
            var omega = Math.sqrt(p.k / p.m1);
            var F = p.k * p.A;
            return '<div>🟩 <strong>振子：</strong>重力mg=' + (p.m1 * g).toFixed(1) + 'N ↓，支持力N=mg ↑</div>' +
                '<div style="margin-top:6px;">🌀 <strong>弹力：</strong>F=-kx，最大F=kA=' + F.toFixed(2) + 'N</div>' +
                '<div style="margin-top:6px;">📐 <strong>周期：</strong>T=2π√(m/k)=' + (2 * Math.PI / omega).toFixed(2) + 's</div>' +
                '<div style="margin-top:6px;">⚡ <strong>能量：</strong>Ep=½kx²，Ek=½mv²，总机械能E=½kA²=' + (0.5 * p.k * p.A * p.A).toFixed(3) + 'J</div>';
        }
        if (id === 'collision') {
            var pBefore = p.m1 * p.v1 + p.m2 * p.v2;
            var ekBefore = 0.5 * p.m1 * p.v1 * p.v1 + 0.5 * p.m2 * p.v2 * p.v2;
            return '<div>🔴 <strong>物体1：</strong>动量p₁=m₁v₁=' + (p.m1 * p.v1).toFixed(2) + 'kg·m/s</div>' +
                '<div style="margin-top:6px;">🔵 <strong>物体2：</strong>动量p₂=m₂v₂=' + (p.m2 * p.v2).toFixed(2) + 'kg·m/s</div>' +
                '<div style="margin-top:6px;">⚖️ <strong>总动量：</strong>P=' + pBefore.toFixed(2) + 'kg·m/s(守恒)</div>' +
                '<div style="margin-top:6px;">⚡ <strong>总动能(碰前)：</strong>Ek=' + ekBefore.toFixed(2) + 'J(弹性碰撞守恒)</div>';
        }
        return '';
    },

    _renderVT: function() {
        var id = this.state.modelId;
        var p = this.state.params;
        var t = this.state.t;
        var svg = '<line x1="30" y1="10" x2="30" y2="140" stroke="#94a3b8" stroke-width="1"/>';
        svg += '<line x1="30" y1="140" x2="270" y2="140" stroke="#94a3b8" stroke-width="1"/>';
        svg += '<text x="265" y="155" font-size="9" fill="#64748b">t</text>';
        svg += '<text x="15" y="15" font-size="9" fill="#64748b">v</text>';
        var points = '';
        var color = this.models[id].color;
        for (var i = 0; i <= 40; i++) {
            var tt = i / 40 * Math.max(t, 2);
            var v = 0;
            if (id === 'block') {
                var a1 = -p.mu * 10;
                var a2 = p.mu * p.m1 / p.m2 * 10;
                var tc = p.v0 / (p.mu * 10 * (1 + p.m1 / p.m2));
                if (tt <= tc) { v = p.v0 + a1 * tt; }
                else { v = p.v0 * p.m1 / (p.m1 + p.m2); }
            } else if (id === 'belt') {
                var a = p.angle === 0 ? -p.mu * 10 : 10 * (Math.sin(p.angle * Math.PI / 180) - p.mu * Math.cos(p.angle * Math.PI / 180));
                v = p.v0 + a * tt;
                if (a < 0 && v < p.belt) v = p.belt;
                if (a > 0 && v > p.belt) v = p.belt;
            } else if (id === 'spring') {
                var omega = Math.sqrt(p.k / p.m1);
                v = -p.A * omega * Math.sin(omega * tt);
            } else if (id === 'collision') {
                var ct = (400 - 100) / (p.v1 - p.v2) / 10;
                if (p.v1 > p.v2 && tt < ct) { v = p.v1; }
                else { v = ((p.m1 - p.m2) * p.v1 + 2 * p.m2 * p.v2) / (p.m1 + p.m2); }
            }
            var px = 30 + (tt / Math.max(t, 2)) * 230;
            var py = 140 - v * 12;
            py = Math.max(10, Math.min(140, py));
            points += (i === 0 ? 'M' : 'L') + px + ',' + py + ' ';
        }
        svg += '<path d="' + points + '" stroke="' + color + '" stroke-width="2" fill="none"/>';
        var curX = 30 + Math.min(t / Math.max(t, 2), 1) * 230;
        svg += '<line x1="' + curX + '" y1="10" x2="' + curX + '" y2="140" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3"/>';
        return svg;
    },

    _modelTips: function() {
        var id = this.state.modelId;
        if (id === 'block') return '板块模型核心：①滑块减速、木板加速，摩擦力为二者间相互作用力 ②当v₁=v₂时相对静止，摩擦力突变为0(或静摩擦) ③关键临界点：共速时刻 ④系统动量守恒(无外力时)：m₁v₀=(m₁+m₂)v共。';
        if (id === 'belt') return '传送带模型核心：①物体初速度与传送带速度关系决定摩擦力方向 ②共速前匀变速，共速后视情况匀速或继续变速 ③倾斜传送带需比较mgsinθ与μmgcosθ ④痕迹长度=相对位移。';
        if (id === 'spring') return '弹簧振子核心：①简谐运动 F=-kx，周期T=2π√(m/k)与振幅无关 ②平衡位置速度最大、加速度为零 ③端点速度为零、加速度最大 ④能量在动能与弹性势能间转化，总机械能守恒。';
        if (id === 'collision') return '碰撞模型核心：①动量守恒：m₁v₁+m₂v₂=m₁v₁\'+m₂v₂\' ②弹性碰撞动能守恒，可解出v₁\'和v₂\' ③完全非弹性碰撞碰后共速，动能损失最大 ④碰撞条件：v₁>v₂且v₁\'≤v₂\'。';
        return '';
    },

    _setModel: function(id) {
        this._stop();
        this.state.modelId = id;
        this.state.t = 0;
        this._render();
    },

    _bindParamEvents: function() {
        var self = this;
        var cur = this.models[this.state.modelId];
        for (var i = 0; i < cur.params.length; i++) {
            (function(p) {
                var el = document.getElementById('pm-' + p.key);
                if (el) el.addEventListener('change', function() {
                    var v = parseFloat(this.value);
                    if (!isNaN(v)) {
                        v = Math.max(p.min, Math.min(p.max, v));
                        self.state.params[p.key] = v;
                        self.state.t = 0;
                        self._stop();
                        self._render();
                    }
                });
            })(cur.params[i]);
        }
    },

    _toggle: function() {
        if (this.state.running) { this._stop(); }
        else { this._play(); }
    },

    _play: function() {
        var self = this;
        this.state.running = true;
        this._render();
        this.state.timer = setInterval(function() {
            self.state.t += 0.05;
            if (self.state.t > 8) { self._stop(); return; }
            self._updateAnim();
        }, 50);
    },

    _stop: function() {
        if (this.state.timer) { clearInterval(this.state.timer); this.state.timer = null; }
        if (this.state.running) { this.state.running = false; this._render(); }
    },

    _reset: function() {
        this._stop();
        this.state.t = 0;
        this._render();
    },

    _updateAnim: function() {
        var svg = document.getElementById('pm-svg');
        if (svg) svg.innerHTML = this._renderScene();
        var vt = document.getElementById('pm-vt');
        if (vt) vt.innerHTML = this._renderVT();
        var fa = document.getElementById('pm-force');
        if (fa) fa.innerHTML = this._forceAnalysis();
    }
};
window.physicsModelSim = physicsModelSim;


// ==================== 5. chemTransformNet 化学物质转化网络 ====================
var chemTransformNet = {
    state: { familyId: 'sodium', selectedNode: null, selectedEdge: null },

    data: {
        sodium: {
            name: '钠族', color: '#dc2626', icon: '🧂',
            nodes: [
                { id: 'Na', name: 'Na(钠)', x: 300, y: 60, props: '银白色金属，质软，密度0.97g/cm³(比水轻)，熔点低，强还原性。保存在煤油中。' },
                { id: 'Na2O', name: 'Na₂O', x: 150, y: 180, props: '白色固体，碱性氧化物，与水反应生成NaOH。' },
                { id: 'Na2O2', name: 'Na₂O₂', x: 450, y: 180, props: '淡黄色固体，过氧化物，既有氧化性又有还原性，与水、CO2反应均放出O2。' },
                { id: 'NaOH', name: 'NaOH', x: 150, y: 300, props: '白色固体，强碱，易潮解，俗称烧碱、火碱、苛性钠。' },
                { id: 'Na2CO3', name: 'Na₂CO₃', x: 300, y: 360, props: '白色固体，俗称纯碱、苏打，水溶液呈碱性。' },
                { id: 'NaHCO3', name: 'NaHCO₃', x: 450, y: 300, props: '白色固体，俗称小苏打，受热易分解，治疗胃酸过多。' },
                { id: 'NaCl', name: 'NaCl', x: 300, y: 180, props: '白色晶体，食盐主要成分，离子化合物，熔点801℃。' }
            ],
            edges: [
                { from: 'Na', to: 'Na2O', cond: '常温氧化', eq: '4Na + O₂ → 2Na₂O' },
                { from: 'Na', to: 'Na2O2', cond: '点燃', eq: '2Na + O₂ →(点燃) Na₂O₂' },
                { from: 'Na', to: 'NaOH', cond: '与水反应', eq: '2Na + 2H₂O → 2NaOH + H₂↑' },
                { from: 'Na2O', to: 'NaOH', cond: '与水', eq: 'Na₂O + H₂O → 2NaOH' },
                { from: 'Na2O2', to: 'NaOH', cond: '与水', eq: '2Na₂O₂ + 2H₂O → 4NaOH + O₂↑' },
                { from: 'Na2O2', to: 'Na2CO3', cond: '与CO₂', eq: '2Na₂O₂ + 2CO₂ → 2Na₂CO₃ + O₂' },
                { from: 'NaOH', to: 'Na2CO3', cond: '吸收CO₂', eq: '2NaOH + CO₂ → Na₂CO₃ + H₂O' },
                { from: 'NaOH', to: 'NaHCO3', cond: '过量CO₂', eq: 'NaOH + CO₂ → NaHCO₃' },
                { from: 'NaHCO3', to: 'Na2CO3', cond: '加热', eq: '2NaHCO₃ →(Δ) Na₂CO₃ + H₂O + CO₂↑' },
                { from: 'Na2CO3', to: 'NaHCO3', cond: '通CO₂', eq: 'Na₂CO₃ + CO₂ + H₂O → 2NaHCO₃' },
                { from: 'NaOH', to: 'NaCl', cond: '+HCl', eq: 'NaOH + HCl → NaCl + H₂O' },
                { from: 'NaCl', to: 'Na', cond: '电解熔融', eq: '2NaCl →(通电) 2Na + Cl₂↑' }
            ]
        },
        iron: {
            name: '铁族', color: '#a16207', icon: '⚙️',
            nodes: [
                { id: 'Fe', name: 'Fe', x: 300, y: 60, props: '银白色金属，有磁性，中等活泼性，地壳含量第二的金属。' },
                { id: 'FeO', name: 'FeO', x: 150, y: 180, props: '黑色粉末，碱性氧化物，不稳定，在空气中加热生成Fe3O4。' },
                { id: 'Fe2O3', name: 'Fe₂O₃', x: 450, y: 180, props: '红棕色粉末，俗称铁红，碱性氧化物，用作颜料。' },
                { id: 'Fe3O4', name: 'Fe₃O₄', x: 300, y: 180, props: '黑色晶体，有磁性，俗称磁性氧化铁，复杂氧化物FeO·Fe₂O₃。' },
                { id: 'FeCl2', name: 'FeCl₂', x: 150, y: 320, props: '浅绿色溶液，Fe²⁺易被氧化为Fe³⁺，保存需加铁粉。' },
                { id: 'FeCl3', name: 'FeCl₃', x: 450, y: 320, props: '棕黄色溶液，Fe³⁺有氧化性，可用KSCN检验。' },
                { id: 'FeOH3', name: 'Fe(OH)₃', x: 450, y: 420, props: '红褐色沉淀，两性偏碱，受热分解生成Fe₂O₃。' },
                { id: 'FeOH2', name: 'Fe(OH)₂', x: 150, y: 420, props: '白色沉淀，迅速氧化为灰绿最后红褐色Fe(OH)₃。' }
            ],
            edges: [
                { from: 'Fe', to: 'Fe3O4', cond: '纯氧点燃', eq: '3Fe + 2O₂ →(点燃) Fe₃O₄' },
                { from: 'Fe', to: 'Fe2O3', cond: '缓慢氧化', eq: '4Fe + 3O₂ → 2Fe₂O₃(铁锈)' },
                { from: 'Fe', to: 'FeCl2', cond: '+稀HCl', eq: 'Fe + 2HCl → FeCl₂ + H₂↑' },
                { from: 'Fe', to: 'FeCl3', cond: '+Cl₂', eq: '2Fe + 3Cl₂ →(点燃) 2FeCl₃' },
                { from: 'FeCl2', to: 'FeCl3', cond: '+Cl₂', eq: '2FeCl₂ + Cl₂ → 2FeCl₃' },
                { from: 'FeCl3', to: 'FeCl2', cond: '+Fe', eq: '2FeCl₃ + Fe → 3FeCl₂' },
                { from: 'FeCl2', to: 'FeOH2', cond: '+NaOH', eq: 'FeCl₂ + 2NaOH → Fe(OH)₂↓ + 2NaCl' },
                { from: 'FeCl3', to: 'FeOH3', cond: '+NaOH', eq: 'FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl' },
                { from: 'FeOH2', to: 'FeOH3', cond: '氧化', eq: '4Fe(OH)₂ + O₂ + 2H₂O → 4Fe(OH)₃' },
                { from: 'FeOH3', to: 'Fe2O3', cond: '加热', eq: '2Fe(OH)₃ →(Δ) Fe₂O₃ + 3H₂O' },
                { from: 'Fe2O3', to: 'Fe', cond: '+CO高温', eq: 'Fe₂O₃ + 3CO →(高温) 2Fe + 3CO₂' },
                { from: 'Fe3O4', to: 'Fe', cond: '铝热', eq: '8Al + 3Fe₃O₄ →(高温) 4Al₂O₃ + 9Fe' }
            ]
        },
        copper: {
            name: '铜族', color: '#0891b2', icon: '🟤',
            nodes: [
                { id: 'Cu', name: 'Cu', x: 300, y: 60, props: '紫红色金属，导电导热性强，化学性质较稳定。' },
                { id: 'CuO', name: 'CuO', x: 150, y: 180, props: '黑色粉末，碱性氧化物，有氧化性，可被H₂、CO还原。' },
                { id: 'Cu2O', name: 'Cu₂O', x: 450, y: 180, props: '砖红色固体，赤铜矿主要成分，葡萄糖检验的产物。' },
                { id: 'CuSO4', name: 'CuSO₄', x: 300, y: 300, props: '白色粉末，遇水变蓝，形成CuSO₄·5H₂O(胆矾)。' },
                { id: 'CuOH2', name: 'Cu(OH)₂', x: 150, y: 400, props: '蓝色絮状沉淀，受热分解为黑色CuO。' },
                { id: 'CuCl2', name: 'CuCl₂', x: 450, y: 300, props: '棕黄色固体，水溶液呈蓝绿色，共价化合物。' }
            ],
            edges: [
                { from: 'Cu', to: 'CuO', cond: '加热', eq: '2Cu + O₂ →(Δ) 2CuO' },
                { from: 'Cu', to: 'CuCl2', cond: '+Cl₂', eq: 'Cu + Cl₂ →(点燃) CuCl₂' },
                { from: 'Cu', to: 'CuSO4', cond: '+浓H₂SO₄', eq: 'Cu + 2H₂SO₄(浓) →(Δ) CuSO₄ + SO₂↑ + 2H₂O' },
                { from: 'CuO', to: 'CuSO4', cond: '+稀H₂SO₄', eq: 'CuO + H₂SO₄ → CuSO₄ + H₂O' },
                { from: 'CuO', to: 'Cu', cond: '+H₂', eq: 'CuO + H₂ →(Δ) Cu + H₂O' },
                { from: 'CuSO4', to: 'CuOH2', cond: '+NaOH', eq: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄' },
                { from: 'CuOH2', to: 'CuO', cond: '加热', eq: 'Cu(OH)₂ →(Δ) CuO + H₂O' },
                { from: 'CuSO4', to: 'Cu', cond: '电解', eq: 'CuSO₄溶液通电 → Cu + ...' },
                { from: 'CuCl2', to: 'CuOH2', cond: '+NaOH', eq: 'CuCl₂ + 2NaOH → Cu(OH)₂↓ + 2NaCl' },
                { from: 'CuO', to: 'CuCl2', cond: '+HCl', eq: 'CuO + 2HCl → CuCl₂ + H₂O' }
            ]
        },
        carbon: {
            name: '碳族', color: '#475569', icon: '⚫',
            nodes: [
                { id: 'C', name: 'C', x: 300, y: 60, props: '有金刚石、石墨、富勒烯等同素异形体，常温稳定。' },
                { id: 'CO', name: 'CO', x: 150, y: 180, props: '无色无味气体，剧毒，还原性，可燃，能与血红蛋白结合。' },
                { id: 'CO2', name: 'CO₂', x: 450, y: 180, props: '无色气体，能使澄清石灰水变浑浊，温室气体。' },
                { id: 'H2CO3', name: 'H₂CO₃', x: 450, y: 300, props: '弱酸，不稳定，只存在于水溶液中。' },
                { id: 'Na2CO3', name: 'Na₂CO₃', x: 300, y: 360, props: '纯碱，强碱弱酸盐，水溶液碱性。' },
                { id: 'CaCO3', name: 'CaCO₃', x: 150, y: 300, props: '白色固体，大理石、石灰石主要成分，难溶于水。' }
            ],
            edges: [
                { from: 'C', to: 'CO', cond: '不完全燃烧', eq: '2C + O₂ →(点燃) 2CO' },
                { from: 'C', to: 'CO2', cond: '完全燃烧', eq: 'C + O₂ →(点燃) CO₂' },
                { from: 'CO', to: 'CO2', cond: '燃烧/氧化', eq: '2CO + O₂ →(点燃) 2CO₂' },
                { from: 'CO2', to: 'CO', cond: '+C高温', eq: 'CO₂ + C →(高温) 2CO' },
                { from: 'CO2', to: 'H2CO3', cond: '溶于水', eq: 'CO₂ + H₂O ⇌ H₂CO₃' },
                { from: 'H2CO3', to: 'CO2', cond: '分解', eq: 'H₂CO₃ → H₂O + CO₂↑' },
                { from: 'CO2', to: 'CaCO3', cond: '+石灰水', eq: 'CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O' },
                { from: 'CaCO3', to: 'CO2', cond: '+HCl/高温', eq: 'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑' },
                { from: 'CO2', to: 'Na2CO3', cond: '+NaOH', eq: '2NaOH + CO₂ → Na₂CO₃ + H₂O' },
                { from: 'CaCO3', to: 'Na2CO3', cond: '+NaOH', eq: 'CaCO₃ + 2NaOH →(纯碱制烧碱) Na₂CO₃ + Ca(OH)₂' }
            ]
        },
        nitrogen: {
            name: '氮族', color: '#7c3aed', icon: '💨',
            nodes: [
                { id: 'N2', name: 'N₂', x: 300, y: 60, props: '无色无味气体，占空气78%，N≡N三键稳定，常温不活泼。' },
                { id: 'NH3', name: 'NH₃', x: 150, y: 180, props: '无色刺激性气味气体，碱性气体，易液化，喷泉实验。' },
                { id: 'NO', name: 'NO', x: 450, y: 180, props: '无色气体，有毒，易被氧化为NO2。' },
                { id: 'NO2', name: 'NO₂', x: 450, y: 300, props: '红棕色刺激性气体，有毒，与水反应生成HNO3。' },
                { id: 'HNO3', name: 'HNO₃', x: 300, y: 380, props: '强酸，强氧化性，不稳定见光易分解。' },
                { id: 'NH4Cl', name: 'NH₄Cl', x: 150, y: 300, props: '白色晶体，铵盐，受热分解，与碱反应放出NH3。' }
            ],
            edges: [
                { from: 'N2', to: 'NH3', cond: '合成氨', eq: 'N₂ + 3H₂ →(高温高压催化) 2NH₃' },
                { from: 'N2', to: 'NO', cond: '放电', eq: 'N₂ + O₂ →(放电) 2NO' },
                { from: 'NH3', to: 'NO', cond: '催化氧化', eq: '4NH₃ + 5O₂ →(催化Δ) 4NO + 6H₂O' },
                { from: 'NO', to: 'NO2', cond: '氧化', eq: '2NO + O₂ → 2NO₂' },
                { from: 'NO2', to: 'NO', cond: '与水', eq: '3NO₂ + H₂O → 2HNO₃ + NO' },
                { from: 'NO2', to: 'HNO3', cond: '与水', eq: '3NO₂ + H₂O → 2HNO₃ + NO' },
                { from: 'NH3', to: 'NH4Cl', cond: '+HCl', eq: 'NH₃ + HCl → NH₄Cl' },
                { from: 'NH4Cl', to: 'NH3', cond: '+碱/加热', eq: 'NH₄Cl + NaOH →(Δ) NaCl + NH₃↑ + H₂O' },
                { from: 'HNO3', to: 'NO2', cond: '见光分解', eq: '4HNO₃ →(光照) 4NO₂↑ + O₂↑ + 2H₂O' },
                { from: 'NH3', to: 'HNO3', cond: '工业制酸', eq: 'NH₃→NO→NO₂→HNO₃(三步)' }
            ]
        },
        oxygen: {
            name: '氧族', color: '#dc2626', icon: '🌬️',
            nodes: [
                { id: 'O2', name: 'O₂', x: 300, y: 60, props: '无色无味气体，助燃，支持呼吸，占空气21%。' },
                { id: 'O3', name: 'O₃', x: 150, y: 180, props: '淡蓝色气体，鱼腥味，强氧化性，臭氧层吸收紫外线。' },
                { id: 'H2O', name: 'H₂O', x: 300, y: 180, props: '无色液体，通用溶剂，电解产生H2和O2。' },
                { id: 'H2O2', name: 'H₂O₂', x: 450, y: 180, props: '无色液体，过氧化氢，俗称双氧水，既有氧化性又有还原性。' },
                { id: 'SO2', name: 'SO₂', x: 150, y: 320, props: '无色刺激性气味气体，有毒，漂白性(可逆)，主要污染物。' },
                { id: 'H2SO4', name: 'H₂SO₄', x: 450, y: 320, props: '强酸，浓硫酸有强氧化性、吸水性、脱水性。' }
            ],
            edges: [
                { from: 'O2', to: 'O3', cond: '放电', eq: '3O₂ →(放电) 2O₃' },
                { from: 'O3', to: 'O2', cond: '分解', eq: '2O₃ → 3O₂' },
                { from: 'O2', to: 'H2O', cond: '+H₂点燃', eq: '2H₂ + O₂ →(点燃) 2H₂O' },
                { from: 'H2O', to: 'O2', cond: '电解', eq: '2H₂O →(通电) 2H₂↑ + O₂↑' },
                { from: 'O2', to: 'H2O2', cond: '+H₂间接', eq: '工业：乙基蒽醌法' },
                { from: 'H2O2', to: 'O2', cond: '分解', eq: '2H₂O₂ →(MnO₂) 2H₂O + O₂↑' },
                { from: 'O2', to: 'SO2', cond: '+S燃烧', eq: 'S + O₂ →(点燃) SO₂' },
                { from: 'SO2', to: 'H2SO4', cond: '催化氧化', eq: '2SO₂ + O₂ →(催化) 2SO₃; SO₃ + H₂O → H₂SO₄' },
                { from: 'H2SO4', to: 'SO2', cond: '+Cu', eq: 'Cu + 2H₂SO₄(浓) →(Δ) CuSO₄ + SO₂↑ + 2H₂O' },
                { from: 'SO2', to: 'H2O', cond: '溶于水', eq: 'SO₂ + H₂O ⇌ H₂SO₃' }
            ]
        },
        halogen: {
            name: '卤族', color: '#16a34a', icon: '🟢',
            nodes: [
                { id: 'Cl2', name: 'Cl₂', x: 300, y: 60, props: '黄绿色气体，刺激性气味，有毒，强氧化性，自来水消毒。' },
                { id: 'HCl', name: 'HCl', x: 150, y: 180, props: '无色刺激性气体，极易溶于水，水溶液为盐酸。' },
                { id: 'HClO', name: 'HClO', x: 450, y: 180, props: '次氯酸，弱酸，强氧化性，漂白性，见光分解。' },
                { id: 'NaClO', name: 'NaClO', x: 450, y: 300, props: '次氯酸钠，84消毒液主要成分，强氧化性。' },
                { id: 'CaCl2', name: 'Ca(ClO)₂', x: 300, y: 320, props: '漂白粉主要成分，与CO2和水反应生成HClO起漂白作用。' },
                { id: 'FeCl3', name: 'FeCl₃', x: 150, y: 320, props: '棕黄色固体，共价化合物，由Cl2与Fe直接化合。' }
            ],
            edges: [
                { from: 'Cl2', to: 'HCl', cond: '+H₂点燃', eq: 'H₂ + Cl₂ →(点燃) 2HCl' },
                { from: 'Cl2', to: 'HClO', cond: '与水', eq: 'Cl₂ + H₂O ⇌ HCl + HClO' },
                { from: 'Cl2', to: 'FeCl3', cond: '+Fe', eq: '2Fe + 3Cl₂ →(点燃) 2FeCl₃' },
                { from: 'Cl2', to: 'NaClO', cond: '+NaOH', eq: 'Cl₂ + 2NaOH → NaCl + NaClO + H₂O' },
                { from: 'Cl2', to: 'CaCl2', cond: '+石灰乳', eq: '2Cl₂ + 2Ca(OH)₂ → Ca(ClO)₂ + CaCl₂ + 2H₂O' },
                { from: 'HClO', to: 'HCl', cond: '见光分解', eq: '2HClO →(光照) 2HCl + O₂↑' },
                { from: 'NaClO', to: 'HClO', cond: '+酸', eq: 'NaClO + HCl → NaCl + HClO' },
                { from: 'CaCl2', to: 'HClO', cond: '+CO₂/H₂O', eq: 'Ca(ClO)₂ + CO₂ + H₂O → CaCO₃↓ + 2HClO' },
                { from: 'HCl', to: 'Cl2', cond: '+MnO₂', eq: 'MnO₂ + 4HCl(浓) →(Δ) MnCl₂ + Cl₂↑ + 2H₂O' },
                { from: 'HCl', to: 'FeCl3', cond: '+Fe(OH)₃', eq: 'Fe(OH)₃ + 3HCl → FeCl₃ + 3H₂O' }
            ]
        }
    },

    init: function() { this._render(); },

    _render: function() {
        var app = document.getElementById('chem-transform-app');
        if (!app) return;
        var keys = ['sodium', 'iron', 'copper', 'carbon', 'nitrogen', 'oxygen', 'halogen'];
        var html = '<div style="padding:16px;">' +
            '<div style="background:linear-gradient(135deg,#16a34a,#0891b2);color:#fff;padding:18px 22px;border-radius:12px;margin-bottom:16px;">' +
            '<h3 style="margin:0 0 6px 0;font-size:1.25rem;">🔗 元素化合物转化网络图</h3>' +
            '<p style="margin:0;font-size:0.9rem;opacity:0.95;">点击节点查看性质，点击边查看方程式</p></div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">';
        for (var i = 0; i < keys.length; i++) {
            var f = this.data[keys[i]];
            var active = (this.state.familyId === keys[i]);
            html += '<button onclick="chemTransformNet._setFamily(\'' + keys[i] + '\')" style="background:' + (active ? f.color : '#fff') + ';color:' + (active ? '#fff' : '#475569') + ';border:1.5px solid ' + (active ? f.color : '#cbd5e1') + ';padding:7px 14px;border-radius:8px;cursor:pointer;font-size:0.85rem;">' + f.icon + ' ' + f.name + '</button>';
        }
        html += '</div>';
        var cur = this.data[this.state.familyId];
        html += '<div style="display:grid;grid-template-columns:1fr 280px;gap:14px;">' +
            '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">' +
            '<h4 style="margin:0 0 10px 0;color:' + cur.color + ';">' + cur.icon + ' ' + cur.name + '转化网络</h4>' +
            '<svg viewBox="0 0 600 480" style="width:100%;height:auto;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">' +
            '<defs><marker id="ct-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8"/></marker></defs>';
        for (var i = 0; i < cur.edges.length; i++) {
            var e = cur.edges[i];
            var n1 = this._findNode(cur, e.from);
            var n2 = this._findNode(cur, e.to);
            if (!n1 || !n2) continue;
            var mx = (n1.x + n2.x) / 2;
            var my = (n1.y + n2.y) / 2;
            var isSel = (this.state.selectedEdge === i);
            html += '<line x1="' + n1.x + '" y1="' + n1.y + '" x2="' + n2.x + '" y2="' + n2.y + '" stroke="' + (isSel ? cur.color : '#cbd5e1') + '" stroke-width="' + (isSel ? '2.5' : '1.5') + '" marker-end="url(#ct-arrow)" style="cursor:pointer;" onclick="chemTransformNet._clickEdge(' + i + ')"/>';
            html += '<text x="' + mx + '" y="' + (my - 4) + '" font-size="9" fill="' + (isSel ? cur.color : '#64748b') + '" text-anchor="middle" style="pointer-events:none;">' + e.cond + '</text>';
        }
        for (var i = 0; i < cur.nodes.length; i++) {
            var n = cur.nodes[i];
            var isSel = (this.state.selectedNode === n.id);
            html += '<g style="cursor:pointer;" onclick="chemTransformNet._clickNode(\'' + n.id + '\')">' +
                '<circle cx="' + n.x + '" cy="' + n.y + '" r="26" fill="' + (isSel ? cur.color : '#fff') + '" stroke="' + cur.color + '" stroke-width="2"/>' +
                '<text x="' + n.x + '" y="' + (n.y + 4) + '" font-size="11" fill="' + (isSel ? '#fff' : cur.color) + '" text-anchor="middle" font-weight="600">' + n.name + '</text></g>';
        }
        html += '</svg></div>' +
            '<div style="display:flex;flex-direction:column;gap:14px;">' +
            '<div id="ct-node-info" style="background:#fff;border:1px solid #e2e8f0;border-left:4px solid ' + cur.color + ';border-radius:8px;padding:14px;min-height:120px;">' +
            '<div style="color:#94a3b8;font-size:0.85rem;text-align:center;padding:20px 0;">点击节点查看物质性质</div></div>' +
            '<div id="ct-edge-info" style="background:#fff;border:1px solid #e2e8f0;border-left:4px solid #16a34a;border-radius:8px;padding:14px;min-height:120px;">' +
            '<div style="color:#94a3b8;font-size:0.85rem;text-align:center;padding:20px 0;">点击边查看反应方程式</div></div></div></div>' +
            '<div style="margin-top:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px;">' +
            '<h4 style="margin:0 0 8px 0;color:#b45309;">📖 ' + cur.name + '学习要点</h4>' +
            '<p style="margin:0;color:#92400e;font-size:0.85rem;line-height:1.7;">' + this._familyTips(cur) + '</p></div></div>';
        app.innerHTML = html;
        if (this.state.selectedNode) this._showNodeInfo();
        if (this.state.selectedEdge !== null) this._showEdgeInfo();
    },

    _findNode: function(family, id) {
        for (var i = 0; i < family.nodes.length; i++) {
            if (family.nodes[i].id === id) return family.nodes[i];
        }
        return null;
    },

    _clickNode: function(id) {
        this.state.selectedNode = id;
        this.state.selectedEdge = null;
        this._render();
    },

    _clickEdge: function(i) {
        this.state.selectedEdge = i;
        this.state.selectedNode = null;
        this._render();
    },

    _showNodeInfo: function() {
        var box = document.getElementById('ct-node-info');
        if (!box) return;
        var cur = this.data[this.state.familyId];
        var n = this._findNode(cur, this.state.selectedNode);
        if (!n) return;
        box.innerHTML = '<h4 style="margin:0 0 8px 0;color:' + cur.color + ';font-size:1.05rem;">🔬 ' + n.name + '</h4>' +
            '<p style="margin:0;color:#334155;font-size:0.88rem;line-height:1.7;">' + n.props + '</p>';
    },

    _showEdgeInfo: function() {
        var box = document.getElementById('ct-edge-info');
        if (!box) return;
        var cur = this.data[this.state.familyId];
        if (this.state.selectedEdge === null) return;
        var e = cur.edges[this.state.selectedEdge];
        if (!e) return;
        box.innerHTML = '<h4 style="margin:0 0 8px 0;color:#16a34a;font-size:1.05rem;">⚗️ 反应方程式</h4>' +
            '<div style="background:#f0fdf4;padding:10px;border-radius:6px;font-family:Georgia,serif;font-size:0.95rem;color:#15803d;line-height:1.6;">' + e.eq + '</div>' +
            '<div style="margin-top:8px;font-size:0.82rem;color:#475569;">条件：<strong>' + e.cond + '</strong></div>' +
            '<div style="margin-top:6px;font-size:0.82rem;color:#475569;">' + this._findNode(cur, e.from).name + ' → ' + this._findNode(cur, e.to).name + '</div>';
    },

    _setFamily: function(id) {
        this.state.familyId = id;
        this.state.selectedNode = null;
        this.state.selectedEdge = null;
        this._render();
    },

    _familyTips: function(cur) {
        var tips = {
            sodium: '钠族核心：①钠的强还原性决定了其与水、酸、盐溶液反应的特殊性 ②Na₂O₂与水、CO₂反应均产生O₂，是供氧剂 ③Na₂CO₃与NaHCO₃的相互转化及热稳定性差异 ④焰色反应检验钠(黄色)和钾(紫色，透过蓝色钴玻璃)。',
            iron: '铁族核心：①Fe²⁺与Fe³⁺的相互转化(氧化还原) ②Fe(OH)₂氧化为Fe(OH)₃的颜色变化：白→灰绿→红褐 ③Fe³⁺的检验：KSCN(血红色)、NaOH(红褐色沉淀) ④炼铁原理：Fe₂O₃+CO高温还原。',
            copper: '铜族核心：①Cu与浓硫酸、稀硝酸、浓硝酸反应均体现酸的氧化性 ②Cu²⁺水溶液蓝色，Cu(OH)₂蓝色絮状沉淀 ③胆矾CuSO₄·5H₂O受热失去结晶水变白 ④铜的电解精炼。',
            carbon: '碳族核心：①碳的完全与不完全燃烧产物不同 ②CO₂与CO的相互转化(氧化还原) ③CO₂的检验：澄清石灰水变浑浊再变清 ④碳酸的弱酸性与不稳定性。',
            nitrogen: '氮族核心：①N₂的三键稳定性与固氮 ②NH₃的碱性、还原性(催化氧化) ③NO→NO₂→HNO₃的工业制酸三步 ④HNO₃的强氧化性(浓稀不同产物不同)。',
            oxygen: '氧族核心：①O₂与O₃的同素异形体转化 ②H₂O₂的氧化还原双重性 ③SO₂的漂白性(可逆)与还原性 ④浓硫酸的三大特性：吸水性、脱水性、强氧化性。',
            halogen: '卤族核心：①Cl₂与水、碱反应的歧化 ②HClO的强氧化性与漂白性(不可逆) ③漂白粉/84消毒液原理：生成HClO ④Cl₂的实验室制法：MnO₂+浓HCl。'
        };
        return tips[this.state.familyId] || '掌握物质间的转化关系是化学学习的核心。';
    }
};
window.chemTransformNet = chemTransformNet;


// ==================== 6. bioChartTrainer 生物图表题专项 ====================
var bioChartTrainer = {
    state: { filter: 'all', currentId: null, answered: {} },

    data: [
        { id: 'bc1', type: '光合作用曲线', icon: '🌿', color: '#16a34a',
          chart: 'photosynthesis',
          question: '如图表示某植物在不同光照强度下CO₂吸收量的变化。下列叙述正确的是：',
          options: ['A. A点时植物既不进行光合作用也不进行呼吸作用', 'B. B点时光合作用速率等于呼吸作用速率', 'C. C点后限制光合作用的主要因素是CO₂浓度', 'D. 整个过程中呼吸作用速率始终为零'],
          answer: 1,
          analysis: 'A点CO₂吸收量为0，表示光合作用=呼吸作用(净光合=0)，但两者都在进行，A错。B点CO₂吸收量为0(光补偿点)，光合速率=呼吸速率，B正确。C点已达光饱和，限制因素变为CO₂浓度或温度，C合理但图中未明确。D点之前有呼吸作用(暗处也有)，D错。' },
        { id: 'bc2', type: '光合作用曲线', icon: '🌱', color: '#16a34a',
          chart: 'photosynthesis2',
          question: '图中是探究pH对某种酶活性的影响曲线。下列分析正确的是：',
          options: ['A. 该酶的最适pH为b', 'B. pH为a时酶的空间结构被破坏', 'C. pH由b到c过程中酶活性逐渐升高', 'D. 该曲线可代表胃蛋白酶的活性变化'],
          answer: 0,
          analysis: '曲线在b点最高，故最适pH为b，A正确。pH为a时酶活性降低但未到失活，空间结构未必破坏(可恢复)，B错。pH由b到c活性下降，C错。胃蛋白酶最适pH约1.5(酸性)，曲线形态不符，D错。' },
        { id: 'bc3', type: '种群数量曲线', icon: '📈', color: '#0891b2',
          chart: 'population',
          question: '图为某岛屿上鹿种群数量随时间的变化曲线。下列叙述正确的是：',
          options: ['A. a-b段种群增长速率为0', 'B. b点时种群增长速率最大', 'C. c点时种群数量达到K值', 'D. d点后种群数量将继续增长'],
          answer: 2,
          analysis: 'a-b段种群数量上升，增长速率>0，A错。b点为对数期中点附近，增长速率较大但未必最大(S型曲线在K/2时最大)，B表述不严谨。c点后种群数量稳定，达到环境容纳量K值，C正确。d点后数量稳定在K值附近波动，D错。' },
        { id: 'bc4', type: '种群数量曲线', icon: '🦌', color: '#0891b2',
          chart: 'population2',
          question: '图中两条曲线分别表示培养液中两种微生物的数量变化。下列分析合理的是：',
          options: ['A. 两种微生物为捕食关系', 'B. 两种微生物为竞争关系', 'C. 两种微生物为互利共生关系', 'D. 两种微生物无种间关系'],
          answer: 1,
          analysis: '两曲线此消彼长但都趋于稳定，且一种数量增加时另一种减少，符合竞争关系(资源竞争)，B正确。捕食关系曲线应有明显的滞后波动，A错。共生应两曲线同向变化，C错。' },
        { id: 'bc5', type: '遗传图谱', icon: '🧬', color: '#7c3aed',
          chart: 'pedigree',
          question: '某遗传病系谱图所示(■●为患者)，关于该病遗传方式的判断，正确的是：',
          options: ['A. 常染色体显性遗传', 'B. 常染色体隐性遗传', 'C. X染色体显性遗传', 'D. X染色体隐性遗传'],
          answer: 1,
          analysis: '图中正常父母生出患病子女(有中生无)，为隐性遗传。若为X染色体隐性，女性患者的父亲和儿子必患病，图中女性患者父亲正常，排除D。故为常染色体隐性遗传，B正确。' },
        { id: 'bc6', type: '酶活性曲线', icon: '⚗️', color: '#f59e0b',
          chart: 'enzyme',
          question: '图中表示三种酶(甲、乙、丙)在不同温度下的活性变化。下列叙述正确的是：',
          options: ['A. 甲酶的最适温度最高', 'B. 丙酶的最适温度最低', 'C. 温度超过最适值后酶活性急剧下降是因为酶被分解', 'D. 三种酶的最适pH一定相同'],
          answer: 1,
          analysis: '由图可知丙酶活性峰值对应温度最低，B正确。甲酶峰值温度未必最高(需看具体位置)，A不确定。温度过高酶空间结构破坏(变性失活)而非被分解，C错。最适温度与最适pH无必然关系，D错。' },
        { id: 'bc7', type: '酶活性曲线', icon: '🧪', color: '#f59e0b',
          chart: 'enzyme2',
          question: '图为酶促反应速率与底物浓度的关系曲线。下列分析正确的是：',
          options: ['A. a点时酶已全部被底物饱和', 'B. b点后反应速率不再增加是因为酶浓度限制', 'C. 增大酶浓度可使b点上移', 'D. 该曲线反映酶活性随底物浓度变化'],
          answer: 2,
          analysis: 'a点速率仍在上升，酶未饱和，A错。b点后速率恒定因酶被底物饱和(所有活性中心被占据)，B表述不完整。增大酶浓度可使更多底物被催化，最大速率提高(b点上移)，C正确。曲线反映反应速率而非酶活性，D错。' },
        { id: 'bc8', type: '细胞分裂图', icon: '🔬', color: '#ef4444',
          chart: 'mitosis',
          question: '图为某动物细胞有丝分裂不同时期的染色体数、染色单体数和DNA分子数。下列判断正确的是：',
          options: ['A. 甲时期染色体数:染色单体数:DNA数=1:2:2', 'B. 乙时期无染色单体', 'C. 丙时期着丝点已分裂', 'D. 丁时期细胞中DNA数为体细胞的2倍'],
          answer: 0,
          analysis: '甲时期(前期/中期)染色体:染色单体:DNA=1:2:2(每条染色体含2条染色单体、2个DNA)，A正确。乙时期若为后期，着丝点分裂后无染色单体，但需看具体数值，B不确定。丙时期若DNA减半则为末期，着丝点已分裂，C可能对但需对应图。丁时期DNA若为2N则为分裂前/中期，D错(应为体细胞2倍在前期)。' },
        { id: 'bc9', type: '细胞分裂图', icon: '🧫', color: '#ef4444',
          chart: 'meiosis',
          question: '图为某哺乳动物减数分裂过程中染色体数目变化曲线。下列叙述正确的是：',
          options: ['A. a-b段发生同源染色体分离', 'B. b-c段染色体数目减半', 'C. c-d段发生姐妹染色单体分离', 'D. d点表示受精作用完成'],
          answer: 2,
          analysis: 'a-b段为减Ⅰ前期/中期，同源染色体尚未分离，A错。b点为减Ⅰ完成，染色体数目减半，b-c段已减半，B错。c-d段为减Ⅱ后期，姐妹染色单体分离，染色体数暂时加倍，C正确。d点为减数分裂完成，非受精，D错。' },
        { id: 'bc10', type: '遗传图谱', icon: '🩺', color: '#7c3aed',
          chart: 'pedigree2',
          question: '某家族遗传病系谱图(阴影为患者)。关于该病遗传方式和发病率，正确的是：',
          options: ['A. 常染色体显性遗传，发病率较高', 'B. X染色体隐性遗传，男性发病率高于女性', 'C. 常染色体隐性遗传，男女发病率相等', 'D. Y染色体遗传，只传男性'],
          answer: 1,
          analysis: '图中患者多为男性，且男性患者的父亲不患病(非Y染色体遗传)，女性携带者传递，符合X染色体隐性遗传。男性发病率高于女性(男性只要一个隐性基因即患病)，B正确。' }
    ],

    init: function() { this._render(); },

    _render: function() {
        var app = document.getElementById('bio-chart-app');
        if (!app) return;
        try {
            if (this.state.currentId) { this._renderDetail(); }
            else { this._renderList(); }
        } catch (err) {
            console.error('生物图表训练渲染失败:', err);
        }
    },

    _renderList: function() {
        var app = document.getElementById('bio-chart-app');
        if (!app) return;
        var types = ['all', '光合作用曲线', '种群数量曲线', '遗传图谱', '酶活性曲线', '细胞分裂图'];
        var html = '<div style="padding:16px;">' +
            '<div style="background:linear-gradient(135deg,#16a34a,#0891b2);color:#fff;padding:18px 22px;border-radius:12px;margin-bottom:16px;">' +
            '<h3 style="margin:0 0 6px 0;font-size:1.25rem;">📊 生物图表题解读专项训练</h3>' +
            '<p style="margin:0;font-size:0.9rem;opacity:0.95;">共 ' + this.data.length + ' 道图表题，覆盖光合·种群·遗传·酶·分裂</p></div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">';
        for (var i = 0; i < types.length; i++) {
            var t = types[i];
            var active = (this.state.filter === t);
            html += '<button onclick="bioChartTrainer._setFilter(\'' + t + '\')" style="background:' + (active ? '#16a34a' : '#fff') + ';color:' + (active ? '#fff' : '#475569') + ';border:1.5px solid ' + (active ? '#16a34a' : '#cbd5e1') + ';padding:6px 14px;border-radius:20px;cursor:pointer;font-size:0.85rem;">' + (t === 'all' ? '全部' : t) + '</button>';
        }
        html += '</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;">';
        var count = 0;
        for (var i = 0; i < this.data.length; i++) {
            var d = this.data[i];
            if (this.state.filter !== 'all' && d.type !== this.state.filter) continue;
            count++;
            var done = this.state.answered[d.id];
            html += '<div onclick="bioChartTrainer._showDetail(\'' + d.id + '\')" style="background:#fff;border:1px solid #e2e8f0;border-left:4px solid ' + d.color + ';border-radius:10px;padding:14px;cursor:pointer;">' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
                '<span style="font-size:1.5rem;">' + d.icon + '</span>' +
                '<div><div style="font-weight:600;color:#0f172a;">' + d.type + ' #' + (i + 1) + '</div>' +
                '<div style="font-size:0.75rem;color:#94a3b8;">' + (done ? '✓ 已作答' : '未作答') + '</div></div></div>' +
                '<p style="margin:0;color:#475569;font-size:0.82rem;line-height:1.5;">' + d.question.substring(0, 50) + '...</p></div>';
        }
        html += '</div>';
        if (count === 0) html += '<p style="text-align:center;color:#94a3b8;padding:30px;">该题型下暂无题目</p>';
        html += '</div>';
        app.innerHTML = html;
    },

    _setFilter: function(t) {
        this.state.filter = t;
        this._renderList();
    },

    _showDetail: function(id) {
        this.state.currentId = id;
        this._renderDetail();
    },

    _backToList: function() {
        this.state.currentId = null;
        this._renderList();
    },

    _renderDetail: function() {
        var app = document.getElementById('bio-chart-app');
        if (!app) return;
        var d = null;
        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].id === this.state.currentId) { d = this.data[i]; break; }
        }
        if (!d) { this._backToList(); return; }
        var html = '<div style="padding:16px;">' +
            '<button onclick="bioChartTrainer._backToList()" style="background:#f1f5f9;color:#475569;border:0;padding:8px 16px;border-radius:6px;cursor:pointer;margin-bottom:14px;">← 返回题目列表</button>' +
            '<div style="background:' + d.color + ';color:#fff;padding:14px 20px;border-radius:10px;margin-bottom:16px;">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
            '<span style="font-size:1.8rem;">' + d.icon + '</span>' +
            '<div><h4 style="margin:0;font-size:1.1rem;">' + d.type + '</h4>' +
            '<div style="font-size:0.82rem;opacity:0.9;">图表解读训练</div></div></div></div>' +
            '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:14px;">' +
            '<h4 style="margin:0 0 12px 0;color:#0f172a;">📊 图表</h4>' +
            '<svg viewBox="0 0 500 280" style="width:100%;height:auto;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">' + this._renderChart(d.chart) + '</svg></div>' +
            '<div style="background:#fff;border:1px solid #e2e8f0;border-left:4px solid ' + d.color + ';border-radius:8px;padding:16px;margin-bottom:14px;">' +
            '<h4 style="margin:0 0 10px 0;color:#0f172a;">❓ 问题</h4>' +
            '<p style="margin:0 0 12px 0;color:#1f2937;line-height:1.7;font-size:0.92rem;">' + d.question + '</p>' +
            '<div id="bc-opts" style="display:flex;flex-direction:column;gap:7px;">';
        for (var i = 0; i < d.options.length; i++) {
            html += '<button onclick="bioChartTrainer._answer(' + i + ')" data-idx="' + i + '" style="text-align:left;padding:10px 14px;background:#fff;border:1.5px solid #e2e8f0;border-radius:6px;cursor:pointer;font-size:0.9rem;color:#334155;">' + d.options[i] + '</button>';
        }
        html += '</div><div id="bc-analysis" style="display:none;margin-top:12px;padding:12px;background:#f0fdf4;border-radius:6px;border-left:3px solid #16a34a;">' +
            '<strong style="color:#15803d;">解析：</strong>' +
            '<p style="margin:6px 0 0;color:#475569;font-size:0.88rem;line-height:1.7;">' + d.analysis + '</p></div></div></div>';
        app.innerHTML = html;
    },

    _answer: function(idx) {
        var d = null;
        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].id === this.state.currentId) { d = this.data[i]; break; }
        }
        if (!d) return;
        this.state.answered[d.id] = true;
        var btns = document.getElementById('bc-opts').children;
        for (var i = 0; i < btns.length; i++) {
            btns[i].disabled = true;
            var iIdx = parseInt(btns[i].getAttribute('data-idx'), 10);
            if (iIdx === d.answer) {
                btns[i].style.background = '#dcfce7';
                btns[i].style.borderColor = '#16a34a';
                btns[i].style.color = '#15803d';
            } else if (iIdx === idx) {
                btns[i].style.background = '#fee2e2';
                btns[i].style.borderColor = '#ef4444';
                btns[i].style.color = '#b91c1c';
            }
        }
        document.getElementById('bc-analysis').style.display = 'block';
    },

    _renderChart: function(type) {
        if (type === 'photosynthesis') return this._chartPhotosynthesis();
        if (type === 'photosynthesis2') return this._chartEnzyme();
        if (type === 'population') return this._chartPopulation();
        if (type === 'population2') return this._chartPopulation2();
        if (type === 'pedigree') return this._chartPedigree();
        if (type === 'pedigree2') return this._chartPedigree2();
        if (type === 'enzyme') return this._chartEnzymeTemp();
        if (type === 'enzyme2') return this._chartEnzymeSub();
        if (type === 'mitosis') return this._chartMitosis();
        if (type === 'meiosis') return this._chartMeiosis();
        return '<text x="250" y="140" text-anchor="middle" fill="#94a3b8">图表加载中</text>';
    },

    _chartPhotosynthesis: function() {
        var pts = '';
        for (var i = 0; i <= 40; i++) {
            var x = 60 + i * 9;
            var light = i / 40;
            var v = light < 0.15 ? -20 + light * 200 : Math.min(120, 10 + (1 - Math.exp(-light * 3)) * 130);
            var y = 200 - v;
            pts += (i === 0 ? 'M' : 'L') + x + ',' + y + ' ';
        }
        return '<line x1="60" y1="20" x2="60" y2="240" stroke="#94a3b8" stroke-width="1.5"/>' +
            '<line x1="60" y1="200" x2="460" y2="200" stroke="#94a3b8" stroke-width="1.5"/>' +
            '<line x1="60" y1="200" x2="460" y2="200" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="4,3"/>' +
            '<text x="20" y="30" font-size="11" fill="#64748b">CO₂</text>' +
            '<text x="15" y="25" font-size="9" fill="#64748b">吸收量</text>' +
            '<text x="450" y="220" font-size="11" fill="#64748b">光照强度</text>' +
            '<path d="' + pts + '" stroke="#16a34a" stroke-width="2.5" fill="none"/>' +
            '<circle cx="60" cy="200" r="4" fill="#ef4444"/><text x="50" y="220" font-size="10" fill="#ef4444">A</text>' +
            '<circle cx="120" cy="200" r="4" fill="#3b82f6"/><text x="115" y="220" font-size="10" fill="#3b82f6">B</text>' +
            '<circle cx="380" cy="80" r="4" fill="#f59e0b"/><text x="375" y="75" font-size="10" fill="#f59e0b">C</text>';
    },

    _chartPopulation: function() {
        var pts = '';
        for (var i = 0; i <= 50; i++) {
            var x = 60 + i * 8;
            var t = i / 50;
            var n = 200 * (1 - Math.exp(-t * 4));
            var y = 220 - n;
            pts += (i === 0 ? 'M' : 'L') + x + ',' + y + ' ';
        }
        return '<line x1="60" y1="20" x2="60" y2="240" stroke="#94a3b8" stroke-width="1.5"/>' +
            '<line x1="60" y1="220" x2="460" y2="220" stroke="#94a3b8" stroke-width="1.5"/>' +
            '<line x1="60" y1="40" x2="460" y2="40" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="4,3"/>' +
            '<text x="465" y="44" font-size="10" fill="#64748b">K值</text>' +
            '<text x="20" y="30" font-size="11" fill="#64748b">种群</text>' +
            '<text x="15" y="44" font-size="9" fill="#64748b">数量</text>' +
            '<text x="440" y="240" font-size="11" fill="#64748b">时间</text>' +
            '<path d="' + pts + '" stroke="#0891b2" stroke-width="2.5" fill="none"/>' +
            '<circle cx="100" cy="155" r="4" fill="#ef4444"/><text x="85" y="150" font-size="10" fill="#ef4444">a</text>' +
            '<circle cx="180" cy="95" r="4" fill="#3b82f6"/><text x="175" y="88" font-size="10" fill="#3b82f6">b</text>' +
            '<circle cx="380" cy="45" r="4" fill="#f59e0b"/><text x="385" y="40" font-size="10" fill="#f59e0b">c</text>' +
            '<circle cx="430" cy="42" r="4" fill="#16a34a"/><text x="435" y="38" font-size="10" fill="#16a34a">d</text>';
    },

    _chartPopulation2: function() {
        var p1 = '', p2 = '';
        for (var i = 0; i <= 50; i++) {
            var x = 60 + i * 8;
            var t = i / 50;
            var n1 = 160 * Math.sin(t * Math.PI) * (1 - t * 0.3);
            var n2 = 140 * Math.sin(t * Math.PI + 0.5) * (1 - t * 0.3);
            p1 += (i === 0 ? 'M' : 'L') + x + ',' + (200 - n1) + ' ';
            p2 += (i === 0 ? 'M' : 'L') + x + ',' + (200 - n2) + ' ';
        }
        return '<line x1="60" y1="20" x2="60" y2="240" stroke="#94a3b8" stroke-width="1.5"/>' +
            '<line x1="60" y1="200" x2="460" y2="200" stroke="#94a3b8" stroke-width="1.5"/>' +
            '<text x="20" y="30" font-size="11" fill="#64748b">微生物</text>' +
            '<text x="15" y="44" font-size="9" fill="#64748b">数量</text>' +
            '<text x="440" y="220" font-size="11" fill="#64748b">时间</text>' +
            '<path d="' + p1 + '" stroke="#0891b2" stroke-width="2.5" fill="none"/>' +
            '<path d="' + p2 + '" stroke="#ef4444" stroke-width="2.5" fill="none"/>' +
            '<text x="380" y="60" font-size="10" fill="#0891b2">物种甲</text>' +
            '<text x="380" y="120" font-size="10" fill="#ef4444">物种乙</text>';
    },

    _chartPedigree: function() {
        return '<line x1="100" y1="60" x2="180" y2="60" stroke="#475569" stroke-width="1.5"/>' +
            '<line x1="140" y1="60" x2="140" y2="120" stroke="#475569" stroke-width="1.5"/>' +
            '<line x1="100" y1="120" x2="300" y2="120" stroke="#475569" stroke-width="1.5"/>' +
            '<line x1="200" y1="120" x2="200" y2="180" stroke="#475569" stroke-width="1.5"/>' +
            '<rect x="85" y="45" width="30" height="30" fill="#fff" stroke="#475569" stroke-width="2"/>' +
            '<circle cx="195" cy="60" r="15" fill="#fff" stroke="#475569" stroke-width="2"/>' +
            '<rect x="85" y="105" width="30" height="30" fill="#fff" stroke="#475569" stroke-width="2"/>' +
            '<circle cx="195" cy="120" r="15" fill="#16a34a" stroke="#15803d" stroke-width="2"/>' +
            '<rect x="285" y="105" width="30" height="30" fill="#16a34a" stroke="#15803d" stroke-width="2"/>' +
            '<circle cx="195" cy="180" r="15" fill="#16a34a" stroke="#15803d" stroke-width="2"/>' +
            '<text x="100" y="95" font-size="9" fill="#64748b">Ⅰ1</text><text x="210" y="65" font-size="9" fill="#64748b">Ⅰ2</text>' +
            '<text x="100" y="155" font-size="9" fill="#64748b">Ⅱ1</text><text x="210" y="125" font-size="9" fill="#64748b">Ⅱ2</text><text x="300" y="155" font-size="9" fill="#64748b">Ⅱ3</text>' +
            '<text x="210" y="185" font-size="9" fill="#64748b">Ⅲ1</text>' +
            '<text x="250" y="240" font-size="10" fill="#64748b">■● 患者</text>';
    },

    _chartEnzyme: function() {
        var pts = '';
        for (var i = 0; i <= 40; i++) {
            var x = 60 + i * 10;
            var ph = i / 40 * 14;
            var v = Math.exp(-Math.pow(ph - 7, 2) / 3) * 150;
            var y = 200 - v;
            pts += (i === 0 ? 'M' : 'L') + x + ',' + y + ' ';
        }
        return '<line x1="60" y1="20" x2="60" y2="220" stroke="#94a3b8" stroke-width="1.5"/>' +
            '<line x1="60" y1="200" x2="470" y2="200" stroke="#94a3b8" stroke-width="1.5"/>' +
            '<text x="20" y="30" font-size="11" fill="#64748b">酶</text>' +
            '<text x="15" y="44" font-size="9" fill="#64748b">活性</text>' +
            '<text x="450" y="220" font-size="11" fill="#64748b">pH</text>' +
            '<path d="' + pts + '" stroke="#f59e0b" stroke-width="2.5" fill="none"/>' +
            '<circle cx="160" cy="60" r="4" fill="#ef4444"/><text x="145" y="55" font-size="10" fill="#ef4444">a</text>' +
            '<circle cx="260" cy="50" r="4" fill="#3b82f6"/><text x="255" y="42" font-size="10" fill="#3b82f6">b</text>' +
            '<circle cx="360" cy="80" r="4" fill="#16a34a"/><text x="355" y="75" font-size="10" fill="#16a34a">c</text>';
    },

    _chartPedigree2: function() {
        return '<line x1="100" y1="60" x2="180" y2="60" stroke="#475569" stroke-width="1.5"/>' +
            '<line x1="140" y1="60" x2="140" y2="120" stroke="#475569" stroke-width="1.5"/>' +
            '<line x1="80" y1="120" x2="320" y2="120" stroke="#475569" stroke-width="1.5"/>' +
            '<line x1="180" y1="120" x2="180" y2="190" stroke="#475569" stroke-width="1.5"/>' +
            '<line x1="280" y1="120" x2="280" y2="190" stroke="#475569" stroke-width="1.5"/>' +
            '<rect x="85" y="45" width="30" height="30" fill="#fff" stroke="#475569" stroke-width="2"/>' +
            '<circle cx="195" cy="60" r="15" fill="#fff" stroke="#475569" stroke-width="2"/>' +
            '<rect x="65" y="105" width="30" height="30" fill="#16a34a" stroke="#15803d" stroke-width="2"/>' +
            '<circle cx="165" cy="120" r="15" fill="#fff" stroke="#475569" stroke-width="2"/>' +
            '<circle cx="265" cy="120" r="15" fill="#fff" stroke="#475569" stroke-width="2"/>' +
            '<rect x="305" y="105" width="30" height="30" fill="#fff" stroke="#475569" stroke-width="2"/>' +
            '<rect x="165" y="175" width="30" height="30" fill="#16a34a" stroke="#15803d" stroke-width="2"/>' +
            '<circle cx="295" cy="190" r="15" fill="#16a34a" stroke="#15803d" stroke-width="2"/>' +
            '<text x="100" y="95" font-size="9" fill="#64748b">Ⅰ1♂</text><text x="210" y="65" font-size="9" fill="#64748b">Ⅰ2♀</text>' +
            '<text x="80" y="155" font-size="9" fill="#64748b">Ⅱ1♂</text><text x="180" y="115" font-size="9" fill="#64748b">Ⅱ2♀</text>' +
            '<text x="280" y="115" font-size="9" fill="#64748b">Ⅱ3♀</text><text x="320" y="155" font-size="9" fill="#64748b">Ⅱ4♂</text>' +
            '<text x="180" y="225" font-size="9" fill="#64748b">Ⅲ1♂</text><text x="300" y="195" font-size="9" fill="#64748b">Ⅲ2♀</text>';
    },

    _chartEnzymeTemp: function() {
        var p1 = '', p2 = '', p3 = '';
        var peaks = [0.35, 0.55, 0.75];
        var colors = ['#3b82f6', '#16a34a', '#ef4444'];
        for (var i = 0; i <= 40; i++) {
            var x = 60 + i * 10;
            var t = i / 40;
            for (var j = 0; j < 3; j++) {
                var v = Math.exp(-Math.pow(t - peaks[j], 2) / 0.02) * 150;
                var y = 200 - v;
                var pts = (i === 0 ? 'M' : 'L') + x + ',' + y + ' ';
                if (j === 0) p1 += pts;
                else if (j === 1) p2 += pts;
                else p3 += pts;
            }
        }
        return '<line x1="60" y1="20" x2="60" y2="220" stroke="#94a3b8" stroke-width="1.5"/>' +
            '<line x1="60" y1="200" x2="470" y2="200" stroke="#94a3b8" stroke-width="1.5"/>' +
            '<text x="20" y="30" font-size="11" fill="#64748b">酶</text>' +
            '<text x="15" y="44" font-size="9" fill="#64748b">活性</text>' +
            '<text x="430" y="220" font-size="11" fill="#64748b">温度</text>' +
            '<path d="' + p1 + '" stroke="' + colors[0] + '" stroke-width="2.5" fill="none"/>' +
            '<path d="' + p2 + '" stroke="' + colors[1] + '" stroke-width="2.5" fill="none"/>' +
            '<path d="' + p3 + '" stroke="' + colors[2] + '" stroke-width="2.5" fill="none"/>' +
            '<text x="380" y="80" font-size="10" fill="#3b82f6">甲</text>' +
            '<text x="380" y="60" font-size="10" fill="#16a34a">乙</text>' +
            '<text x="380" y="100" font-size="10" fill="#ef4444">丙</text>';
    },

    _chartEnzymeSub: function() {
        var pts = '';
        for (var i = 0; i <= 40; i++) {
            var x = 60 + i * 10;
            var s = i / 40;
            var v = (s * 4 / (0.3 + s)) * 40;
            var y = 200 - v;
            pts += (i === 0 ? 'M' : 'L') + x + ',' + y + ' ';
        }
        return '<line x1="60" y1="20" x2="60" y2="220" stroke="#94a3b8" stroke-width="1.5"/>' +
            '<line x1="60" y1="200" x2="470" y2="200" stroke="#94a3b8" stroke-width="1.5"/>' +
            '<line x1="60" y1="60" x2="470" y2="60" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="4,3"/>' +
            '<text x="20" y="30" font-size="11" fill="#64748b">反应</text>' +
            '<text x="15" y="44" font-size="9" fill="#64748b">速率</text>' +
            '<text x="410" y="220" font-size="11" fill="#64748b">底物浓度</text>' +
            '<path d="' + pts + '" stroke="#f59e0b" stroke-width="2.5" fill="none"/>' +
            '<circle cx="200" cy="120" r="4" fill="#ef4444"/><text x="185" y="115" font-size="10" fill="#ef4444">a</text>' +
            '<circle cx="380" cy="65" r="4" fill="#3b82f6"/><text x="375" y="58" font-size="10" fill="#3b82f6">b</text>';
    },

    _chartMitosis: function() {
        return '<line x1="60" y1="20" x2="60" y2="240" stroke="#94a3b8" stroke-width="1.5"/>' +
            '<line x1="60" y1="220" x2="470" y2="220" stroke="#94a3b8" stroke-width="1.5"/>' +
            '<text x="20" y="30" font-size="11" fill="#64748b">数目</text>' +
            '<text x="440" y="240" font-size="11" fill="#64748b">时期</text>' +
            '<line x1="60" y1="60" x2="470" y2="60" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="4,3"/>' +
            '<line x1="60" y1="140" x2="470" y2="140" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="4,3"/>' +
            '<text x="475" y="64" font-size="9" fill="#64748b">4N</text>' +
            '<text x="475" y="144" font-size="9" fill="#64748b">2N</text>' +
            '<path d="M60,140 L150,140 L150,60 L250,60 L250,140 L350,140 L350,220 L470,220" stroke="#3b82f6" stroke-width="2.5" fill="none"/>' +
            '<path d="M60,60 L150,60 L250,60 L350,60 L350,140 L470,140" stroke="#16a34a" stroke-width="2" fill="none" stroke-dasharray="5,3"/>' +
            '<path d="M60,60 L150,60 L250,60 L350,60 L350,140 L470,140" stroke="#ef4444" stroke-width="2" fill="none"/>' +
            '<text x="100" y="160" font-size="9" fill="#3b82f6">染色体</text>' +
            '<text x="100" y="50" font-size="9" fill="#ef4444">DNA</text>' +
            '<text x="100" y="35" font-size="9" fill="#16a34a">染色单体</text>' +
            '<text x="105" y="240" font-size="9" fill="#64748b">甲(前)</text>' +
            '<text x="195" y="240" font-size="9" fill="#64748b">乙(中)</text>' +
            '<text x="295" y="240" font-size="9" fill="#64748b">丙(后)</text>' +
            '<text x="395" y="240" font-size="9" fill="#64748b">丁(末)</text>';
    },

    _chartMeiosis: function() {
        return '<line x1="60" y1="20" x2="60" y2="240" stroke="#94a3b8" stroke-width="1.5"/>' +
            '<line x1="60" y1="220" x2="470" y2="220" stroke="#94a3b8" stroke-width="1.5"/>' +
            '<text x="20" y="30" font-size="11" fill="#64748b">染色体</text>' +
            '<text x="15" y="44" font-size="9" fill="#64748b">数目</text>' +
            '<text x="440" y="240" font-size="11" fill="#64748b">时期</text>' +
            '<line x1="60" y1="60" x2="470" y2="60" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="4,3"/>' +
            '<line x1="60" y1="140" x2="470" y2="140" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="4,3"/>' +
            '<text x="475" y="64" font-size="9" fill="#64748b">2N</text>' +
            '<text x="475" y="144" font-size="9" fill="#64748b">N</text>' +
            '<path d="M60,60 L120,60 L120,140 L200,140 L200,60 L280,60 L280,140 L360,140 L360,60 L470,60" stroke="#7c3aed" stroke-width="2.5" fill="none"/>' +
            '<text x="80" y="50" font-size="9" fill="#64748b">a</text>' +
            '<text x="160" y="155" font-size="9" fill="#64748b">b</text>' +
            '<text x="240" y="50" font-size="9" fill="#64748b">c</text>' +
            '<text x="320" y="155" font-size="9" fill="#64748b">d</text>' +
            '<text x="90" y="240" font-size="9" fill="#64748b">减Ⅰ前</text>' +
            '<text x="180" y="240" font-size="9" fill="#64748b">减Ⅰ末</text>' +
            '<text x="270" y="240" font-size="9" fill="#64748b">减Ⅱ前</text>' +
            '<text x="370" y="240" font-size="9" fill="#64748b">减Ⅱ末</text>';
    }
};
window.bioChartTrainer = bioChartTrainer;
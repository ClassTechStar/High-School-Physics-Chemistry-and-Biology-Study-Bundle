(function(){
'use strict';

var ExamSystem={
    examAnalysis:null,
    reviewRound1:null,
    reviewRound2:null,
    quizEngine:null,

    init:function(){
        this.buildExamAnalysis();
        this.buildReviewRound1();
        this.buildReviewRound2();
        this.buildQuizEngine();
        this.addUIEntries();
    },

    addUIEntries:function(){
        var self=this;
        document.addEventListener('DOMContentLoaded',function(){
            ['physics','chemistry','biology'].forEach(function(subject){
                var section=document.getElementById(subject+'-section');
                if(!section) return;
                var tabsContainer=section.querySelector('.module-tabs');
                if(!tabsContainer) return;
                var existing=tabsContainer.querySelectorAll('.module-tab');
                var hasExam=false,hasR1=false,hasR2=false,hasQuiz=false;
                existing.forEach(function(t){
                    if(t.dataset.module==='exam') hasExam=true;
                    if(t.dataset.module==='round1') hasR1=true;
                    if(t.dataset.module==='round2') hasR2=true;
                    if(t.dataset.module==='quiz') hasQuiz=true;
                });
                if(!hasExam){
                    var b1=document.createElement('button');
                    b1.className='module-tab';b1.dataset.module='exam';b1.textContent='📊 考情分析';
                    tabsContainer.appendChild(b1);
                }
                if(!hasR1){
                    var b2=document.createElement('button');
                    b2.className='module-tab';b2.dataset.module='round1';b2.textContent='📖 一轮复习';
                    tabsContainer.appendChild(b2);
                }
                if(!hasR2){
                    var b3=document.createElement('button');
                    b3.className='module-tab';b3.dataset.module='round2';b3.textContent='🎯 二轮专题';
                    tabsContainer.appendChild(b3);
                }
                if(!hasQuiz){
                    var b4=document.createElement('button');
                    b4.className='module-tab';b4.dataset.module='quiz';b4.textContent='✍️ 互动练习';
                    tabsContainer.appendChild(b4);
                }
            });

            var origLoad=window.loadModuleContent;
            window.loadModuleContent=function(subject,module){
                var contentEl=document.getElementById(subject+'-content');
                if(!contentEl) return;
                if(module==='exam'){contentEl.innerHTML=ExamSystem.renderExamAnalysis(subject);return;}
                if(module==='round1'){contentEl.innerHTML=ExamSystem.renderRound1(subject);return;}
                if(module==='round2'){contentEl.innerHTML=ExamSystem.renderRound2(subject);return;}
                if(module==='quiz'){contentEl.innerHTML=ExamSystem.renderQuiz(subject);return;}
                if(origLoad) origLoad(subject,module);
            };
        });
    },

    buildExamAnalysis:function(){
        this.examAnalysis={
            physics:{
                name:'物理',
                overallTrend:'2022-2026年广东高考物理卷命题趋势：注重基础与能力并重，情境化命题比例增大，实验题创新性增强，计算题注重多过程综合分析',
                yearlyAnalysis:[
                    {year:2022,features:'新高考第二年，难度适中偏易。选择题注重基本概念辨析，实验题考查电表改装和验证机械能守恒，计算题以电磁感应综合为主',difficulty:0.55,hotTopics:['电磁感应综合','平抛运动','电表改装','机械能守恒验证']},
                    {year:2023,features:'难度较2022年有所提升，情境题增多。选择题出现STSE情境，实验题考查伏安法测电阻和探究加速度，计算题涉及带电粒子在复合场中运动',difficulty:0.50,hotTopics:['带电粒子复合场','伏安法测电阻','STSE情境','牛顿定律综合']},
                    {year:2024,features:'难度与2023年持平，创新性增强。实验题出现新情境（传感器应用），计算题考查多过程力学综合+电磁感应，选择题信息量增大',difficulty:0.50,hotTopics:['多过程力学综合','传感器实验','信息题','交流电']},
                    {year:2025,features:'命题更注重核心素养考查，开放性试题增多。实验题考查创新设计，计算题融合力学与电磁学，选择题注重物理思维方法',difficulty:0.48,hotTopics:['创新实验设计','力电综合','物理思维方法','光学与原子物理']},
                    {year:2026,features:'持续深化素养导向，情境化命题成为主流。强调物理模型建构能力，数据处理与图像分析能力考查比重增大',difficulty:0.47,hotTopics:['模型建构','图像分析','情境化命题','实验创新']}
                ],
                frequency:[
                    {topic:'牛顿运动定律',frequency:5,difficulty:'中',type:'选择+计算',trend:'稳中有升，情境化趋势明显'},
                    {topic:'电磁感应综合',frequency:5,difficulty:'难',type:'计算',trend:'每年必考，难度居高不下'},
                    {topic:'带电粒子在磁场中运动',frequency:5,difficulty:'中偏难',type:'选择+计算',trend:'高频考点，注重几何关系'},
                    {topic:'平抛/圆周运动',frequency:4,difficulty:'中',type:'选择+计算',trend:'常与万有引力结合考查'},
                    {topic:'动能定理/机械能守恒',frequency:5,difficulty:'中',type:'选择+计算',trend:'必考内容，多过程综合'},
                    {topic:'电场强度与电势',frequency:4,difficulty:'中',type:'选择',trend:'概念辨析型选择题'},
                    {topic:'电路分析',frequency:4,difficulty:'中偏易',type:'选择+实验',trend:'实验题常考'},
                    {topic:'力学实验',frequency:5,difficulty:'中',type:'实验',trend:'每年必考一个力学实验'},
                    {topic:'电学实验',frequency:5,difficulty:'中偏难',type:'实验',trend:'每年必考一个电学实验'},
                    {topic:'原子物理/光电效应',frequency:4,difficulty:'易',type:'选择',trend:'每年1-2道选择题'},
                    {topic:'热学',frequency:4,difficulty:'易偏中',type:'选择',trend:'气体实验定律+热力学定律'},
                    {topic:'光学',frequency:3,difficulty:'易',type:'选择',trend:'折射/全反射/干涉'},
                    {topic:'动量守恒',frequency:4,difficulty:'中偏难',type:'计算',trend:'碰撞+弹簧综合'},
                    {topic:'交变电流/变压器',frequency:3,difficulty:'易偏中',type:'选择',trend:'远距离输电情境'},
                    {topic:'万有引力与航天',frequency:4,difficulty:'中',type:'选择+计算',trend:'变轨/双星/同步卫星'}
                ],
                scoreDistribution:[
                    {section:'选择题(1-7)',score:28,proportion:'35%',note:'每题4分，含多选题'},
                    {section:'实验题(8-9)',score:16,proportion:'20%',note:'力学实验+电学实验各8分'},
                    {section:'计算题(10-11)',score:20,proportion:'25%',note:'力学综合+电磁综合各10分'},
                    {section:'计算题(12-13)',score:16,proportion:'20%',note:'选做题(热学/光学)各8分'}
                ]
            },
            chemistry:{
                name:'化学',
                overallTrend:'2022-2026年广东高考化学卷命题趋势：注重化学核心素养，工艺流程题和有机推断题仍是压轴大题，实验题创新性增强，选择题注重概念辨析和图像分析',
                yearlyAnalysis:[
                    {year:2022,features:'选择题注重基本概念，离子共存、NA计算、电化学为必考。大题以工艺流程和有机推断为主，实验题考查中和滴定',difficulty:0.52,hotTopics:['工艺流程','有机推断','离子共存','电化学']},
                    {year:2023,features:'难度略有提升，图像分析题增多。工艺流程题引入新元素，有机推断考查同分异构体书写，实验题考查物质制备',difficulty:0.50,hotTopics:['图像分析','新元素工艺流程','同分异构体','物质制备实验']},
                    {year:2024,features:'命题更注重真实情境，工艺流程题以工业实际为背景。有机推断融入合成路线设计，选择题增加实验操作判断',difficulty:0.49,hotTopics:['真实情境工艺流程','合成路线设计','实验操作判断','化学平衡图像']},
                    {year:2025,features:'核心素养导向更明显，开放性设问增多。工艺流程题要求评价工艺优劣，有机推断增加信息给予题，实验题考查方案评价',difficulty:0.48,hotTopics:['工艺评价','信息给予有机题','实验方案评价','电化学综合']},
                    {year:2026,features:'持续深化素养考查，跨模块综合题增多。工艺流程+化学反应原理融合，有机推断+实验设计融合，选择题更注重思维深度',difficulty:0.47,hotTopics:['跨模块综合','工艺+原理融合','有机+实验融合','思维深度选择题']}
                ],
                frequency:[
                    {topic:'离子共存/离子方程式',frequency:5,difficulty:'易偏中',type:'选择',trend:'每年必考1-2题'},
                    {topic:'NA相关计算',frequency:4,difficulty:'中',type:'选择',trend:'常考陷阱题'},
                    {topic:'氧化还原反应',frequency:5,difficulty:'中',type:'选择+大题',trend:'配平+电子转移+计算'},
                    {topic:'电化学(原电池/电解池)',frequency:5,difficulty:'中偏难',type:'选择+大题',trend:'新型电池情境'},
                    {topic:'化学平衡与速率',frequency:5,difficulty:'中偏难',type:'选择+大题',trend:'图像分析+计算'},
                    {topic:'工艺流程题',frequency:5,difficulty:'难',type:'大题',trend:'每年必考压轴大题'},
                    {topic:'有机推断与合成',frequency:5,difficulty:'难',type:'大题',trend:'每年必考压轴大题'},
                    {topic:'化学实验',frequency:5,difficulty:'中偏难',type:'选择+大题',trend:'制备/分离/滴定'},
                    {topic:'元素周期律',frequency:4,difficulty:'易偏中',type:'选择',trend:'元素推断+性质比较'},
                    {topic:'盐类水解/沉淀溶解平衡',frequency:4,difficulty:'中',type:'选择',trend:'图像分析型'},
                    {topic:'有机化学基础(选择题)',frequency:4,difficulty:'中',type:'选择',trend:'官能团性质+反应类型'},
                    {topic:'物质结构与性质',frequency:4,difficulty:'中偏难',type:'选择+大题',trend:'杂化/分子构型/晶体'}
                ],
                scoreDistribution:[
                    {section:'选择题(1-16)',score:44,proportion:'44%',note:'每题2-3分'},
                    {section:'非选择题(17-19)',score:36,proportion:'36%',note:'工艺流程+实验+反应原理'},
                    {section:'非选择题(20-21)',score:20,proportion:'20%',note:'有机推断+选做(结构)'}
                ]
            },
            biology:{
                name:'生物',
                overallTrend:'2022-2026年广东高考生物卷命题趋势：注重生命核心素养，遗传题仍是区分度最大的题型，实验设计题分值增大，情境化命题成为主流，开放性设问比例增加',
                yearlyAnalysis:[
                    {year:2022,features:'选择题注重概念辨析，遗传题考查自由组合定律，实验设计题考查酶活性探究，生态题以种群数量变化为主',difficulty:0.54,hotTopics:['自由组合定律','酶活性探究','种群数量变化','细胞呼吸']},
                    {year:2023,features:'难度较2022年提升，遗传题增加系谱分析，实验设计题考查生长素两重性，分子生物学内容比重增大',difficulty:0.51,hotTopics:['系谱分析','生长素两重性','基因表达','内环境稳态']},
                    {year:2024,features:'遗传题创新性增强（致死+连锁），实验设计题开放度增大，选择题增加图表分析，生态题考查群落演替',difficulty:0.49,hotTopics:['致死+连锁遗传','开放实验设计','图表分析','群落演替']},
                    {year:2025,features:'核心素养导向明显，遗传题融合基因工程，实验设计题要求完整方案设计，选择题注重信息提取能力',difficulty:0.48,hotTopics:['遗传+基因工程','完整实验方案','信息提取题','免疫调节']},
                    {year:2026,features:'情境化命题成主流，遗传题结合育种实践，实验设计题融入真实科研情境，选择题更注重推理分析能力',difficulty:0.47,hotTopics:['遗传+育种实践','科研情境实验','推理分析','光合呼吸综合']}
                ],
                frequency:[
                    {topic:'遗传的基本规律',frequency:5,difficulty:'难',type:'选择+大题',trend:'每年必考，区分度最大'},
                    {topic:'实验设计',frequency:5,difficulty:'中偏难',type:'大题',trend:'分值增大，开放性增强'},
                    {topic:'光合作用与呼吸作用',frequency:5,difficulty:'中偏难',type:'选择+大题',trend:'曲线分析+计算'},
                    {topic:'内环境与稳态',frequency:5,difficulty:'中',type:'选择',trend:'神经-体液-免疫调节'},
                    {topic:'细胞结构与功能',frequency:4,difficulty:'易偏中',type:'选择',trend:'细胞器+膜结构'},
                    {topic:'细胞分裂',frequency:4,difficulty:'中',type:'选择',trend:'有丝分裂+减数分裂图像判断'},
                    {topic:'DNA复制与基因表达',frequency:5,difficulty:'中',type:'选择+大题',trend:'中心法则+计算'},
                    {topic:'变异与进化',frequency:4,difficulty:'中',type:'选择',trend:'基因突变+自然选择'},
                    {topic:'生态学',frequency:5,difficulty:'中',type:'选择+大题',trend:'种群+群落+生态系统'},
                    {topic:'酶与ATP',frequency:4,difficulty:'易偏中',type:'选择+实验',trend:'酶的特性+影响因素'},
                    {topic:'基因工程',frequency:4,difficulty:'中偏难',type:'大题',trend:'PCR+限制酶+载体构建'},
                    {topic:'植物激素调节',frequency:4,difficulty:'中',type:'选择+实验',trend:'生长素两重性+实验探究'}
                ],
                scoreDistribution:[
                    {section:'选择题(1-16)',score:32,proportion:'40%',note:'每题2分'},
                    {section:'非选择题(17-19)',score:30,proportion:'37.5%',note:'必考大题3道'},
                    {section:'非选择题(20-21)',score:18,proportion:'22.5%',note:'选考大题2道(二选一)'}
                ]
            }
        };
    },

    buildReviewRound1:function(){
        this.reviewRound1={
            physics:{
                name:'物理',
                description:'一轮复习：全面覆盖高中物理所有知识点，建立完整的知识体系，夯实基础',
                schedule:[
                    {phase:'第1-2周',topic:'运动的描述与匀变速直线运动',keyPoints:['质点、参考系、位移、速度、加速度','匀变速直线运动公式及推论','自由落体与竖直上抛','追及相遇问题'],difficulty:'基础→中等',exercises:15},
                    {phase:'第3-4周',topic:'相互作用与牛顿运动定律',keyPoints:['重力、弹力、摩擦力','力的合成与分解','牛顿三定律','超重失重、连接体问题'],difficulty:'基础→中等',exercises:15},
                    {phase:'第5-6周',topic:'曲线运动与万有引力',keyPoints:['平抛运动','圆周运动','万有引力定律','天体运动与航天'],difficulty:'中等→较难',exercises:12},
                    {phase:'第7-8周',topic:'机械能与动量',keyPoints:['功和功率','动能定理','机械能守恒','动量定理与动量守恒'],difficulty:'中等→较难',exercises:12},
                    {phase:'第9-10周',topic:'静电场',keyPoints:['库仑定律','电场强度与电势','电容器','带电粒子在电场中运动'],difficulty:'中等→较难',exercises:12},
                    {phase:'第11-12周',topic:'恒定电流与磁场',keyPoints:['欧姆定律与电路分析','磁感应强度与安培力','洛伦兹力','带电粒子在磁场中运动'],difficulty:'中等→较难',exercises:12},
                    {phase:'第13-14周',topic:'电磁感应与交变电流',keyPoints:['法拉第电磁感应定律','楞次定律','自感与互感','交变电流与变压器'],difficulty:'较难',exercises:10},
                    {phase:'第15-16周',topic:'热学、光学与原子物理',keyPoints:['分子动理论与热力学定律','光的折射与全反射','光电效应与波粒二象性','原子结构与核反应'],difficulty:'基础→中等',exercises:10}
                ]
            },
            chemistry:{
                name:'化学',
                description:'一轮复习：系统梳理化学知识网络，从基本概念到综合应用，循序渐进',
                schedule:[
                    {phase:'第1-2周',topic:'化学计量与离子反应',keyPoints:['物质的量计算','离子共存与离子方程式','氧化还原反应概念与配平'],difficulty:'基础→中等',exercises:15},
                    {phase:'第3-4周',topic:'金属及其化合物',keyPoints:['钠、铝、铁、铜及其化合物','焰色反应','Fe²⁺/Fe³⁺检验','Al的两性'],difficulty:'中等',exercises:12},
                    {phase:'第5-6周',topic:'非金属及其化合物',keyPoints:['氯、硫、氮及其化合物','浓硫酸与硝酸的特性','环境保护'],difficulty:'中等',exercises:12},
                    {phase:'第7-8周',topic:'化学反应速率与化学平衡',keyPoints:['速率计算与影响因素','平衡判断与移动','等效平衡','平衡常数计算'],difficulty:'中等→较难',exercises:10},
                    {phase:'第9-10周',topic:'水溶液中的离子平衡',keyPoints:['弱电解质电离','盐类水解','沉淀溶解平衡','Ksp计算'],difficulty:'较难',exercises:10},
                    {phase:'第11-12周',topic:'电化学',keyPoints:['原电池与电解池','金属腐蚀与防护','新型电池分析'],difficulty:'中等→较难',exercises:10},
                    {phase:'第13-14周',topic:'有机化学',keyPoints:['烃及其衍生物','官能团性质与反应类型','同分异构体书写','有机推断方法'],difficulty:'较难',exercises:10},
                    {phase:'第15-16周',topic:'化学实验与物质结构',keyPoints:['实验基本操作与安全','分离提纯与检验','晶体结构与性质','化学键与分子构型'],difficulty:'中等→较难',exercises:10}
                ]
            },
            biology:{
                name:'生物',
                description:'一轮复习：全面覆盖高中生物教材内容，构建知识框架，强化概念理解',
                schedule:[
                    {phase:'第1-2周',topic:'细胞的分子组成与结构',keyPoints:['蛋白质、核酸、糖类、脂质','细胞膜流动镶嵌模型','细胞器的结构与功能','细胞核'],difficulty:'基础→中等',exercises:15},
                    {phase:'第3-4周',topic:'细胞代谢',keyPoints:['酶与ATP','细胞呼吸（有氧+无氧）','光合作用（光反应+暗反应）','光合与呼吸综合计算'],difficulty:'中等→较难',exercises:12},
                    {phase:'第5-6周',topic:'细胞的生命历程',keyPoints:['有丝分裂','减数分裂','细胞分化与凋亡','癌变'],difficulty:'中等',exercises:12},
                    {phase:'第7-8周',topic:'遗传的基本规律',keyPoints:['分离定律','自由组合定律','伴性遗传','系谱图分析'],difficulty:'较难',exercises:10},
                    {phase:'第9-10周',topic:'遗传的分子基础',keyPoints:['DNA复制','转录与翻译','中心法则','基因表达调控'],difficulty:'中等→较难',exercises:10},
                    {phase:'第11-12周',topic:'变异、进化与育种',keyPoints:['基因突变与重组','染色体变异','现代进化理论','育种方式比较'],difficulty:'中等',exercises:10},
                    {phase:'第13-14周',topic:'生命活动的调节',keyPoints:['神经调节','体液调节','免疫调节','植物激素调节'],difficulty:'中等→较难',exercises:10},
                    {phase:'第15-16周',topic:'生态学',keyPoints:['种群与群落','生态系统的结构','能量流动与物质循环','生态系统的稳定性'],difficulty:'中等',exercises:10}
                ]
            }
        };
    },

    buildReviewRound2:function(){
        this.reviewRound2={
            physics:{
                name:'物理',
                description:'二轮专题复习：针对高考重点题型和综合能力进行专项突破',
                topics:[
                    {title:'专题一：力与运动综合',core:'牛顿定律+运动学公式+图像分析',keyModels:['连接体问题','传送带问题','板块问题','弹簧问题'],typicalQuestions:['多过程力学综合','力电综合（力学部分）'],difficulty:'中偏难',guangdongFrequency:'★★★★★'},
                    {title:'专题二：能量与动量综合',core:'动能定理+机械能守恒+动量守恒',keyModels:['碰撞问题','弹簧-能量综合','滑块-曲面综合','反冲与爆炸'],typicalQuestions:['动量+能量综合计算','碰撞类问题'],difficulty:'难',guangdongFrequency:'★★★★★'},
                    {title:'专题三：电场与磁场综合',core:'电场力+洛伦兹力+几何关系',keyModels:['带电粒子在匀强电场中偏转','带电粒子在磁场中圆周运动','复合场问题','电磁场边界问题'],typicalQuestions:['粒子运动轨迹分析','多磁场区域穿越'],difficulty:'难',guangdongFrequency:'★★★★☆'},
                    {title:'专题四：电磁感应综合',core:'法拉第定律+安培力+能量守恒',keyModels:['单杆模型（匀速/匀加速/变加速）','双杆模型','线框穿越磁场','电磁阻尼与电磁驱动'],typicalQuestions:['电磁感应+力学综合','电磁感应+电路+能量综合'],difficulty:'难',guangdongFrequency:'★★★★★'},
                    {title:'专题五：实验专题',core:'力学实验+电学实验+光学实验',keyModels:['伏安法测电阻（内外接法选择）','电表改装与校准','滑动变阻器接法选择','逐差法与作图法数据处理'],typicalQuestions:['电学实验设计','创新实验方案评价'],difficulty:'中偏难',guangdongFrequency:'★★★★★'},
                    {title:'专题六：选考模块突破',core:'热学+光学+原子物理',keyModels:['理想气体状态方程','光的折射与全反射','光电效应','核反应与质能方程'],typicalQuestions:['热学计算','光学计算'],difficulty:'中等',guangdongFrequency:'★★★★☆'}
                ]
            },
            chemistry:{
                name:'化学',
                description:'二轮专题复习：针对高考大题和综合能力进行专项突破',
                topics:[
                    {title:'专题一：无机综合与工艺流程',core:'元素化合物知识+氧化还原+离子反应+化学计算',keyModels:['酸浸/碱浸操作分析','调pH除杂','焙烧/煅烧目的','产品纯度计算'],typicalQuestions:['多步工艺流程分析','工艺条件选择与评价'],difficulty:'难',guangdongFrequency:'★★★★★'},
                    {title:'专题二：化学反应原理综合',core:'速率+平衡+热力学+电化学',keyModels:['速率与平衡图像分析','平衡常数计算','盖斯定律应用','新型电池分析'],typicalQuestions:['反应原理综合大题','图像信息提取与计算'],difficulty:'中偏难',guangdongFrequency:'★★★★★'},
                    {title:'专题三：有机化学综合',core:'官能团+反应类型+同分异构体+合成路线',keyModels:['有机物结构推断','同分异构体书写（限制条件）','合成路线设计','信息给予题处理'],typicalQuestions:['有机推断大题','合成路线设计题'],difficulty:'难',guangdongFrequency:'★★★★★'},
                    {title:'专题四：化学实验综合',core:'实验原理+操作+现象+数据处理',keyModels:['物质制备实验','性质检验实验','定量分析实验','实验方案评价'],typicalQuestions:['实验方案设计与评价','实验异常现象分析'],difficulty:'中偏难',guangdongFrequency:'★★★★☆'},
                    {title:'专题五：选择题专项突破',core:'高频选择题类型集中训练',keyModels:['NA计算陷阱','离子共存判断','电化学分析','化学平衡图像','元素推断'],typicalQuestions:['概念辨析型','图像分析型','计算型'],difficulty:'中等',guangdongFrequency:'★★★★★'},
                    {title:'专题六：物质结构与性质',core:'原子结构+分子结构+晶体结构',keyModels:['杂化方式与分子构型','电负性与电离能递变','晶体类型与性质','配位化合物'],typicalQuestions:['结构分析大题','性质比较与解释'],difficulty:'中偏难',guangdongFrequency:'★★★★☆'}
                ]
            },
            biology:{
                name:'生物',
                description:'二轮专题复习：针对高考重点和难点进行专项突破，强化综合解题能力',
                topics:[
                    {title:'专题一：遗传综合突破',core:'遗传定律+系谱分析+基因定位+致死问题',keyModels:['自由组合定律变式（9:3:3:1变式）','伴性遗传+常染色体遗传','致死基因分析','基因定位方法'],typicalQuestions:['遗传大题（推断+概率计算）','实验设计验证遗传方式'],difficulty:'难',guangdongFrequency:'★★★★★'},
                    {title:'专题二：代谢综合突破',core:'光合+呼吸+酶+ATP',keyModels:['光合呼吸曲线分析','C₃/C₄/CAM比较','影响光合速率的因素','呼吸作用各阶段物质变化'],typicalQuestions:['光合呼吸综合计算','代谢实验设计'],difficulty:'中偏难',guangdongFrequency:'★★★★★'},
                    {title:'专题三：调节综合突破',core:'神经+体液+免疫+植物激素',keyModels:['反射弧与突触传递','血糖调节','甲状腺激素分级调节','免疫过程（二次免疫）','生长素两重性'],typicalQuestions:['调节机制综合分析','实验探究激素作用'],difficulty:'中等',guangdongFrequency:'★★★★★'},
                    {title:'专题四：实验设计专项',core:'实验设计完整框架+广东高考真题训练',keyModels:['探究性实验设计','验证性实验设计','实验方案评价','实验结果预测与分析'],typicalQuestions:['完整实验方案设计','实验方案补充与评价'],difficulty:'中偏难',guangdongFrequency:'★★★★★'},
                    {title:'专题五：生态学综合',core:'种群+群落+生态系统+环境保护',keyModels:['种群增长曲线分析','群落演替','能量流动计算','物质循环与信息传递'],typicalQuestions:['生态综合大题','种群数量变化分析'],difficulty:'中等',guangdongFrequency:'★★★★☆'},
                    {title:'专题六：分子与细胞综合',core:'细胞结构+细胞代谢+细胞分裂+基因表达',keyModels:['细胞器协调配合','有丝分裂与减数分裂比较','DNA复制与基因表达计算','蛋白质分选'],typicalQuestions:['分子细胞综合题','分裂图像判断与分析'],difficulty:'中等',guangdongFrequency:'★★★★☆'}
                ]
            }
        };
    },

    buildQuizEngine:function(){
        this.quizEngine={
            physics:[
                {id:'p1',type:'single',difficulty:1,chapter:'运动的描述',question:'关于质点，下列说法正确的是',options:['质点一定是体积很小的物体','质点是没有质量的点','研究地球公转时可将其视为质点','研究地球自转时可将其视为质点'],answer:2,explanation:'质点是一个理想化模型，当物体大小远小于研究距离时可视为质点。研究地球公转时，地球直径远小于日地距离，可视为质点；但研究自转时不能忽略大小'},
                {id:'p2',type:'single',difficulty:1,chapter:'匀变速直线运动',question:'一个做匀加速直线运动的物体，初速度为2m/s，加速度为1m/s²，则3s末的速度为',options:['3m/s','5m/s','6m/s','8m/s'],answer:1,explanation:'v=v₀+at=2+1×3=5m/s'},
                {id:'p3',type:'single',difficulty:2,chapter:'牛顿运动定律',question:'在光滑水平面上，质量为2kg的物体受到4N的水平力作用，其加速度为',options:['0.5m/s²','2m/s²','4m/s²','8m/s²'],answer:1,explanation:'由F=ma，a=F/m=4/2=2m/s²'},
                {id:'p4',type:'single',difficulty:2,chapter:'曲线运动',question:'关于平抛运动，下列说法正确的是',options:['平抛运动是匀变速运动','平抛运动是变加速运动','落地时间与初速度有关','水平射程与高度无关'],answer:0,explanation:'平抛运动只受重力，加速度恒为g，是匀变速曲线运动。落地时间t=√(2h/g)只与高度有关，水平射程x=v₀√(2h/g)与初速度和高度都有关'},
                {id:'p5',type:'single',difficulty:3,chapter:'万有引力',question:'地球同步卫星的特点是',options:['可以在北京正上方','周期与地球自转周期相同','线速度等于第一宇宙速度','向心加速度等于g'],answer:1,explanation:'同步卫星周期=地球自转周期(24h)，轨道在赤道正上方，线速度小于第一宇宙速度，向心加速度小于g'},
                {id:'p6',type:'single',difficulty:2,chapter:'机械能',question:'关于机械能守恒，下列说法正确的是',options:['合外力为零时机械能守恒','只有重力做功时机械能守恒','物体做匀速运动时机械能守恒','物体做减速运动时机械能不守恒'],answer:1,explanation:'机械能守恒条件：只有重力或弹力做功。合外力为零时可能有摩擦力做功（不守恒），匀速运动可能有非保守力做功'},
                {id:'p7',type:'single',difficulty:3,chapter:'动量',question:'两个物体碰撞后粘合在一起，下列说法正确的是',options:['动量守恒，动能守恒','动量守恒，动能不守恒','动量不守恒，动能守恒','动量和动能都不守恒'],answer:1,explanation:'完全非弹性碰撞：动量守恒（合外力为零），但动能损失最大（部分动能转化为内能）'},
                {id:'p8',type:'single',difficulty:2,chapter:'静电场',question:'关于电场强度和电势，下列说法正确的是',options:['电场强度为零处电势一定为零','电势高处电场强度一定大','电场强度与电势无直接关系','沿电场线方向电势升高'],answer:2,explanation:'E和φ无直接关系。等量异种电荷连线中点E不为零但φ可为零；等量同种电荷连线中点E为零但φ不为零。沿电场线方向电势降低'},
                {id:'p9',type:'single',difficulty:3,chapter:'电磁感应',question:'导体棒在磁场中匀速切割磁力线，下列说法正确的是',options:['安培力做正功','外力做功等于电路产生的焦耳热','感应电动势与速度成反比','导体棒中电流方向用右手定则判断'],answer:1,explanation:'匀速运动：外力=安培力，外力做功=克服安培力做功=电路焦耳热。E=BLv与v成正比。电流方向用右手定则判断（正确），但安培力做负功（阻碍运动）'},
                {id:'p10',type:'single',difficulty:1,chapter:'原子物理',question:'关于光电效应，下列说法正确的是',options:['光越强光电子最大初动能越大','光的频率越高光电子数目越多','存在截止频率','光电效应是波粒二象性的体现'],answer:2,explanation:'光电效应规律：①存在截止频率ν₀=W₀/h；②最大初动能与频率成线性关系，与光强无关；③光电子数目与光强成正比；④瞬时性'},
                {id:'p11',type:'single',difficulty:1,chapter:'运动的描述',question:'下列物理量中属于矢量的是',options:['时间','速率','加速度','温度'],answer:2,explanation:'加速度既有大小又有方向，是矢量。时间、速率、温度只有大小没有方向，是标量'},
                {id:'p12',type:'single',difficulty:2,chapter:'牛顿运动定律',question:'电梯以加速度a向上加速运动，站在电梯里的人对地板的压力为（人质量m，g为重力加速度）',options:['mg','m(g+a)','m(g-a)','ma'],answer:1,explanation:'向上加速时，N-mg=ma，N=m(g+a)。超重状态，视重大于实重'},
                {id:'p13',type:'single',difficulty:2,chapter:'圆周运动',question:'关于向心加速度，下列说法正确的是',options:['向心加速度描述线速度大小变化的快慢','向心加速度只改变速度方向不改变速度大小','匀速圆周运动的向心加速度恒定','向心加速度公式只有a=v²/r一种形式'],answer:1,explanation:'向心加速度只改变速度方向不改变大小。匀速圆周运动a大小恒定但方向时刻改变（指向圆心），所以a不恒定。公式还有a=ω²r、a=4π²r/T²等'},
                {id:'p14',type:'single',difficulty:3,chapter:'动量能量综合',question:'质量为m的子弹以速度v₀射入静止在光滑水平面上的木块M并留在其中，此过程中损失的机械能为',options:['½mv₀²','½Mv₀²','Mmv₀²/[2(M+m)]','½mv₀²·M/(M+m)'],answer:2,explanation:'动量守恒：mv₀=(M+m)v，v=mv₀/(M+m)。损失ΔE=½mv₀²-½(M+m)v²=Mmv₀²/[2(M+m)]'},
                {id:'p15',type:'single',difficulty:2,chapter:'振动与波',question:'关于简谐运动，下列说法正确的是',options:['回复力方向总与位移方向相同','加速度方向总与位移方向相反','速度方向总与位移方向相反','振幅等于最大位移的两倍'],answer:1,explanation:'简谐运动F=-kx，回复力与位移方向相反。由F=ma，加速度也与位移方向相反。速度在向平衡位置运动时与位移反向，远离时同向。振幅=最大位移'},
                {id:'p16',type:'single',difficulty:1,chapter:'热学',question:'关于分子动理论，下列说法正确的是',options:['分子间只有引力','分子间只有斥力','分子间同时存在引力和斥力','分子力就是分子间引力'],answer:2,explanation:'分子间同时存在引力和斥力，r<r₀时斥力>引力表现为斥力，r>r₀时引力>斥力表现为引力，r=r₀时合力为零'},
                {id:'p17',type:'single',difficulty:3,chapter:'电磁感应综合',question:'如图，一金属圆环从条形磁铁上方由静止释放，穿过磁铁落到下方。在圆环下落过程中，从上往下看圆环中感应电流方向为',options:['始终顺时针','始终逆时针','先顺时针后逆时针','先逆时针后顺时针'],answer:2,explanation:'靠近磁铁时，穿过圆环的磁通量向下增大，由楞次定律感应电流阻碍增大，产生向上磁场，从上往下看为顺时针；远离磁铁时磁通量向下减小，感应电流阻碍减小，产生向下磁场，从上往下看为逆时针'},
                {id:'p18',type:'single',difficulty:2,chapter:'交流电',question:'我国照明电路电压为220V，此电压指的是',options:['交流电压的峰值','交流电压的有效值','交流电压的平均值','交流电压的瞬时值'],answer:1,explanation:'日常说的220V是有效值。峰值=220√2≈311V。有效值是根据热效应定义的，交流电通过电阻产生的热量等于直流电通过同一电阻产生的热量时，该直流电压值即为有效值'},
                {id:'p19',type:'single',difficulty:1,chapter:'光学',question:'关于光的折射，下列说法正确的是',options:['光从水中射入空气，折射角小于入射角','光从空气射入水中，折射角小于入射角','光从水中射入空气不可能发生全反射','折射率越大的介质光速越快'],answer:1,explanation:'光从光疏（空气）射入光密（水），折射角<入射角。光从水射入空气，折射角>入射角，可能全反射。n=c/v，折射率越大光速越慢'},
                {id:'p20',type:'single',difficulty:2,chapter:'力学综合',question:'一物体从高h处自由下落，当其动能等于势能时（取地面为零势面），物体距地面的高度为',options:['h/4','h/2','2h/3','3h/4'],answer:1,explanation:'Ek=Ep时，mgh/2=mgh\'，h\'=h/2。此时动能=势能=mgh/2，总机械能=mgh'}
            ],
            chemistry:[
                {id:'c1',type:'single',difficulty:1,chapter:'化学计量',question:'标准状况下，22.4L CO₂的物质的量为',options:['1mol','22.4mol','44mol','无法确定'],answer:0,explanation:'标况下22.4L任何气体为1mol。注意前提：标准状况(0°C,101kPa)且为气体'},
                {id:'c2',type:'single',difficulty:2,chapter:'离子反应',question:'下列离子在溶液中能大量共存的是',options:['H⁺、Cl⁻、SO₄²⁻、CO₃²⁻','Na⁺、K⁺、NO₃⁻、SO₄²⁻','Fe³⁺、Cu²⁺、Cl⁻、OH⁻','NH₄⁺、Na⁺、HCO₃⁻、OH⁻'],answer:1,explanation:'A中H⁺+CO₃²⁻→H₂O+CO₂↑；C中Fe³⁺/Cu²⁺+OH⁻→沉淀；D中NH₄⁺+OH⁻→NH₃·H₂O，HCO₃⁻+OH⁻→CO₃²⁻+H₂O'},
                {id:'c3',type:'single',difficulty:2,chapter:'氧化还原',question:'在反应3Cu+8HNO₃(稀)→3Cu(NO₃)₂+2NO↑+4H₂O中，被还原的HNO₃与未被还原的HNO₃物质的量之比为',options:['1:3','2:3','1:4','3:1'],answer:0,explanation:'8mol HNO₃中，2mol被还原(N+5→+2)，6mol起酸性作用未被还原，比=2:6=1:3'},
                {id:'c4',type:'single',difficulty:2,chapter:'电化学',question:'锌铜原电池中，负极发生的反应是',options:['Zn-2e⁻→Zn²⁺','Cu²⁺+2e⁻→Cu','2H⁺+2e⁻→H₂↑','Zn²⁺+2e⁻→Zn'],answer:0,explanation:'锌比铜活泼，锌为负极失电子发生氧化反应：Zn-2e⁻→Zn²⁺'},
                {id:'c5',type:'single',difficulty:3,chapter:'化学平衡',question:'对于反应N₂+3H₂⇌2NH₃(正反应放热)，下列措施能提高H₂转化率的是',options:['增大压强','升高温度','加入催化剂','减小N₂浓度'],answer:0,explanation:'增大压强：平衡正向移动，H₂转化率升高。升高温度：平衡逆向移动，转化率降低。催化剂不影响平衡移动。减小N₂浓度：平衡逆向移动'},
                {id:'c6',type:'single',difficulty:1,chapter:'有机化学',question:'下列反应属于加成反应的是',options:['甲烷与Cl₂光照反应','乙烯与Br₂反应','乙醇的催化氧化','乙酸与NaOH反应'],answer:1,explanation:'甲烷+Cl₂是取代反应；乙烯+Br₂是加成反应；乙醇催化氧化是氧化反应；乙酸+NaOH是中和反应'},
                {id:'c7',type:'single',difficulty:1,chapter:'化学键',question:'下列物质中含有非极性共价键的是',options:['HCl','Na₂O₂','NaOH','H₂O'],answer:1,explanation:'Na₂O₂中O-O键为非极性共价键（同种元素原子间形成的共价键）。HCl中H-Cl、NaOH中O-H、H₂O中O-H均为极性共价键'},
                {id:'c8',type:'single',difficulty:2,chapter:'元素周期律',question:'下列元素中，第一电离能最大的是',options:['Na','Mg','Al','Si'],answer:1,explanation:'同周期从左到右电离能总体增大，但Mg(3s²全满)>Al(3p¹)，N(2p³半满)>O(2p⁴)。因此第三周期：Ar>Cl>P>Si>Mg>Al>Na>S'},
                {id:'c9',type:'single',difficulty:2,chapter:'化学实验',question:'下列实验操作正确的是',options:['蒸馏时温度计水银球插入液面以下','过滤时滤纸高于漏斗边缘','容量瓶不能用于溶解固体','滴定时锥形瓶需用待测液润洗'],answer:2,explanation:'蒸馏时温度计水银球应在支管口；滤纸应低于漏斗边缘；容量瓶不能溶解或储存（正确）；锥形瓶不能用待测液润洗（否则待测液物质的量偏大）'},
                {id:'c10',type:'single',difficulty:3,chapter:'电解池',question:'用惰性电极电解CuSO₄溶液一段时间后，下列说法正确的是',options:['阴极析出O₂','阳极析出Cu','溶液pH减小','溶液pH增大'],answer:2,explanation:'阳极：4OH⁻-4e⁻→2H₂O+O₂↑，阴极：2Cu²⁺+4e⁻→2Cu。OH⁻消耗使H⁺相对增多，pH减小'},
                {id:'c11',type:'single',difficulty:1,chapter:'化学计量',question:'1mol H₂O中含有的质子数为',options:['10','10NA','18NA','20NA'],answer:1,explanation:'H₂O中：H有1个质子×2=2，O有8个质子，共10个质子。1mol H₂O含10mol质子=10NA'},
                {id:'c12',type:'single',difficulty:2,chapter:'化学反应速率',question:'反应2SO₂+O₂⇌2SO₃，下列措施能加快反应速率的是',options:['减小压强','降低温度','加入催化剂','增大SO₃浓度'],answer:2,explanation:'加催化剂降低活化能，加快正逆反应速率。减小压强和降温均减慢速率。增大SO₃浓度加快逆反应速率但减慢正反应速率（平衡移动角度）'},
                {id:'c13',type:'single',difficulty:2,chapter:'有机化学',question:'下列有机物中，既能发生加成反应又能发生氧化反应的是',options:['甲烷','乙烯','乙醇','乙酸'],answer:1,explanation:'乙烯含C=C双键可加成（如加Br₂），也可被酸性KMnO₄氧化（使KMnO₄褪色）。甲烷不能加成；乙醇不能加成；乙酸不能加成'},
                {id:'c14',type:'single',difficulty:3,chapter:'盐类水解',question:'下列溶液中，pH最大的是',options:['NaCl溶液','Na₂CO₃溶液','NH₄Cl溶液','NaHCO₃溶液'],answer:1,explanation:'NaCl不水解pH=7；Na₂CO₃水解CO₃²⁻+H₂O⇌HCO₃⁻+OH⁻显碱性pH最大；NH₄Cl水解显酸性pH<7；NaHCO₃水解但程度小于Na₂CO₃'},
                {id:'c15',type:'single',difficulty:1,chapter:'化学实验',question:'下列试剂的保存方法正确的是',options:['钠保存在空气中','NaOH溶液用带玻璃塞的试剂瓶','AgNO₃溶液保存在棕色瓶中','HF保存在玻璃瓶中'],answer:2,explanation:'钠保存在煤油中；NaOH溶液用橡胶塞（玻璃塞会粘连）；AgNO₃见光分解需棕色瓶（正确）；HF腐蚀玻璃需塑料瓶'},
                {id:'c16',type:'single',difficulty:2,chapter:'有机推断',question:'某有机物分子式为C₂H₄O₂，能与NaHCO₃反应放出气体，该有机物为',options:['甲酸甲酯','乙酸','乙醇','乙醛'],answer:1,explanation:'能与NaHCO₃反应放出CO₂→含-COOH（羧基）。C₂H₄O₂中含-COOH的只有乙酸CH₃COOH。甲酸甲酯HCOOCH₃不含-COOH不能与NaHCO₃反应'},
                {id:'c17',type:'single',difficulty:3,chapter:'工业流程',question:'在湿法炼铜工艺中，用Fe与CuSO₄溶液反应制备Cu，此反应属于',options:['置换反应','化合反应','分解反应','复分解反应'],answer:0,explanation:'Fe+CuSO₄→FeSO₄+Cu，单质与化合物反应生成新单质和新化合物，属于置换反应。也是氧化还原反应'},
                {id:'c18',type:'single',difficulty:2,chapter:'化学平衡图像',question:'对于可逆反应，达平衡后升高温度，正反应速率和逆反应速率的变化为',options:['正反应速率增大，逆反应速率减小','正反应速率减小，逆反应速率增大','正反应速率和逆反应速率都增大','正反应速率和逆反应速率都减小'],answer:2,explanation:'升高温度，正逆反应速率都增大，但吸热方向增大的幅度更大。若正反应吸热，v正增大>v逆增大，平衡正向移动'},
                {id:'c19',type:'single',difficulty:1,chapter:'化学与生活',question:'下列做法不正确的是',options:['用食醋除去水壶中的水垢','用NaHCO₃治疗胃酸过多','用甲醛溶液浸泡食品防腐','用明矾净水'],answer:2,explanation:'甲醛有毒致癌，严禁用于食品防腐。食醋(醋酸)除水垢(CaCO₃)正确；NaHCO₃中和胃酸(HCl)正确；明矾(Al³⁺水解)净水正确'},
                {id:'c20',type:'single',difficulty:3,chapter:'电化学综合',question:'将锌片和铜片插入稀硫酸中组成原电池，下列说法正确的是',options:['锌为正极','铜片上有气泡产生','电子从铜片流向锌片','锌片质量逐渐增大'],answer:1,explanation:'锌比铜活泼，锌为负极（失电子溶解），铜为正极（H⁺得电子产生H₂气泡）。电子从锌→外电路→铜（电流方向相反）。锌片溶解质量减小'}
            ],
            biology:[
                {id:'b1',type:'single',difficulty:1,chapter:'细胞分子组成',question:'下列关于蛋白质的叙述，正确的是',options:['蛋白质是生命活动的主要承担者','所有蛋白质都含C、H、O、N、S','蛋白质的多样性只与氨基酸种类有关','每种蛋白质都由20种氨基酸组成'],answer:0,explanation:'蛋白质功能多样性是生命活动的主要承担者。并非所有蛋白质含S；多样性由氨基酸种类、数目、排列顺序和空间结构决定；不一定含20种氨基酸'},
                {id:'b2',type:'single',difficulty:2,chapter:'细胞代谢',question:'有氧呼吸过程中，释放CO₂的阶段是',options:['只有第二阶段','第二和第三阶段','只有第三阶段','第一和第二阶段'],answer:0,explanation:'有氧呼吸第二阶段（丙酮酸+H₂O→CO₂+[H]）释放CO₂。第一阶段产生丙酮酸和[H]不释放CO₂，第三阶段[H]+O₂→H₂O也不释放CO₂'},
                {id:'b3',type:'single',difficulty:2,chapter:'细胞分裂',question:'减数分裂过程中，同源染色体分离发生在',options:['减数第一次分裂前期','减数第一次分裂后期','减数第二次分裂后期','有丝分裂后期'],answer:1,explanation:'减数第一次分裂后期，同源染色体在纺锤丝牵引下分别移向细胞两极，实现分离。减数第二次分裂后期是着丝点分裂，姐妹染色单体分离'},
                {id:'b4',type:'single',difficulty:3,chapter:'遗传规律',question:'一对表现型正常的夫妇，女方父亲患白化病(常隐)，男方父母正常但有一白化病弟弟。这对夫妇生一个白化病孩子的概率为',options:['1/4','1/6','1/9','1/18'],answer:2,explanation:'女方父亲aa→女方Aa(1/1)。男方弟弟aa→男方父母Aa×Aa→男方Aa概率2/3。后代aa概率=2/3×1/4=1/6。注意：男方A_中Aa占2/3'},
                {id:'b5',type:'single',difficulty:2,chapter:'遗传分子基础',question:'DNA复制、转录、翻译的原料依次是',options:['脱氧核苷酸、核糖核苷酸、氨基酸','核糖核苷酸、脱氧核苷酸、氨基酸','氨基酸、脱氧核苷酸、核糖核苷酸','脱氧核苷酸、氨基酸、核糖核苷酸'],answer:0,explanation:'DNA复制原料：4种脱氧核苷酸(dNTP)；转录原料：4种核糖核苷酸(NTP)；翻译原料：20种氨基酸'},
                {id:'b6',type:'single',difficulty:2,chapter:'生命活动调节',question:'下列关于神经调节的叙述，正确的是',options:['神经调节的基本方式是反射弧','突触传递是双向的','神经递质只能由突触前膜释放','效应器就是传出神经末梢'],answer:2,explanation:'基本方式是反射（非反射弧）；突触传递单向（突触前膜→突触间隙→突触后膜）；神经递质只能由突触前膜释放作用于突触后膜；效应器=传出神经末梢+它所支配的肌肉或腺体'},
                {id:'b7',type:'single',difficulty:3,chapter:'生态学',question:'在能量流动过程中，第二营养级到第三营养级的能量传递效率为10%-20%，下列解释不合理的是',options:['各营养级生物呼吸作用消耗能量','部分能量流向分解者','部分能量未被利用','各营养级同化量相同'],answer:3,explanation:'能量传递效率=下一营养级同化量/上一营养级同化量×100%。各营养级同化量不同（逐级递减），因此D不合理'},
                {id:'b8',type:'single',difficulty:1,chapter:'变异与进化',question:'下列属于基因重组的是',options:['基因中碱基对的替换','非同源染色体上非等位基因的自由组合','染色体片段的缺失','花药离体培养'],answer:1,explanation:'碱基对替换→基因突变；非同源染色体非等位基因自由组合→基因重组；染色体缺失→染色体结构变异；花药离体培养→染色体数目变异'},
                {id:'b9',type:'single',difficulty:1,chapter:'细胞结构',question:'下列细胞器中，不具有膜结构的是',options:['线粒体','核糖体','内质网','高尔基体'],answer:1,explanation:'核糖体是无膜细胞器。线粒体双层膜，内质网和高尔基体单层膜。无膜细胞器还有中心体'},
                {id:'b10',type:'single',difficulty:2,chapter:'光合作用',question:'在暗反应中，CO₂固定是指',options:['CO₂与C₃结合','CO₂与C₅结合生成C₃','C₃被[H]还原','ATP水解供能'],answer:1,explanation:'CO₂固定：CO₂+C₅→2C₃（由RuBisCO酶催化）。C₃还原：C₃+[H]+ATP→(CH₂O)+C₅'},
                {id:'b11',type:'single',difficulty:2,chapter:'免疫调节',question:'下列关于特异性免疫的叙述，正确的是',options:['浆细胞能识别抗原','效应T细胞能产生抗体','B细胞增殖分化形成浆细胞和记忆细胞','二次免疫反应比初次慢'],answer:2,explanation:'浆细胞不能识别抗原（只能分泌抗体）；效应T细胞不产生抗体（使靶细胞裂解）；B细胞受刺激后增殖分化为浆细胞和记忆细胞（正确）；二次免疫比初次更快更强'},
                {id:'b12',type:'single',difficulty:3,chapter:'遗传综合',question:'基因型为AaBb的个体（两对基因独立遗传），自交后代中与亲本基因型相同的个体占',options:['1/4','1/2','3/8','9/16'],answer:0,explanation:'Aa自交→1/4AA+1/2Aa+1/4aa，Aa占1/2；Bb同理占1/2。AaBb=1/2×1/2=1/4'},
                {id:'b13',type:'single',difficulty:1,chapter:'细胞分子组成',question:'下列关于核酸的叙述，正确的是',options:['DNA和RNA都含T','DNA主要分布在细胞质','RNA是主要的遗传物质','DNA是主要的遗传物质'],answer:3,explanation:'DNA含T不含U，RNA含U不含T；DNA主要分布在细胞核；绝大多数生物DNA是主要遗传物质，少数病毒RNA是遗传物质'},
                {id:'b14',type:'single',difficulty:2,chapter:'植物激素',question:'下列关于植物激素的叙述，正确的是',options:['生长素只能促进生长','赤霉素促进种子萌发','脱落酸促进种子萌发','乙烯只促进果实发育'],answer:1,explanation:'生长素两重性（低促高抑）；赤霉素促进种子萌发和茎伸长（正确）；脱落酸抑制种子萌发促进休眠；乙烯促进果实成熟（非发育）'},
                {id:'b15',type:'single',difficulty:2,chapter:'微生物',question:'在微生物培养中，下列操作正确的是',options:['培养基灭菌后再调pH','倒平板时培养基冷却至50℃左右','接种环灼烧灭菌后立即使用','平板划线法可获得单菌落'],answer:3,explanation:'培养基先调pH再灭菌；倒平板时冷却至50℃左右不烫手即可（正确但非最佳答案）；接种环灼烧后需冷却再使用；平板划线法可获得单菌落（正确）'},
                {id:'b16',type:'single',difficulty:3,chapter:'基因工程',question:'基因工程中，限制酶的作用是',options:['连接DNA片段','识别特定核苷酸序列并切割DNA','将目的基因导入受体细胞','检测目的基因是否表达'],answer:1,explanation:'限制酶（限制性内切酶）识别特定的核苷酸序列（回文序列），并在特定位点切割DNA双链。DNA连接酶连接DNA片段'},
                {id:'b17',type:'single',difficulty:1,chapter:'生态系统',question:'下列属于种群的是',options:['一个池塘中所有的鱼','一片森林中所有的树','一个草原上所有的东亚飞蝗','一块农田中所有的昆虫'],answer:2,explanation:'种群=同种生物个体的总和。池塘中所有鱼包含多种鱼类（群落）；森林中所有树包含多种树木；草原上所有东亚飞蝗是同种（种群）；农田中所有昆虫包含多种'},
                {id:'b18',type:'single',difficulty:2,chapter:'细胞凋亡',question:'下列关于细胞凋亡的叙述，正确的是',options:['细胞凋亡是病理死亡','细胞凋亡由基因控制','细胞凋亡不利于个体发育','细胞凋亡与细胞坏死相同'],answer:1,explanation:'细胞凋亡是由基因决定的程序性死亡（正确），是正常生命现象，有利于个体发育（如蝌蚪尾巴消失），与细胞坏死（病理死亡）不同'},
                {id:'b19',type:'single',difficulty:3,chapter:'伴性遗传',question:'色觉正常的夫妇，女方父亲色盲，他们生一个色盲儿子的概率为',options:['0','1/4','1/2','1'],answer:1,explanation:'色盲为X染色体隐性遗传。女方父亲色盲(XᵇY)→女方XᴮXᵇ(携带者)。男方正常XᴮY。儿子X染色体来自母亲，获得Xᵇ概率1/2，但只有XᵇY才色盲，概率=1/2×1=1/2？不对，生儿子概率1/2，儿子中色盲1/2，总概率1/4'},
                {id:'b20',type:'single',difficulty:2,chapter:'生物技术',question:'PCR技术扩增DNA时，需要的关键酶是',options:['DNA连接酶','RNA聚合酶','耐高温DNA聚合酶(Taq酶)','限制酶'],answer:2,explanation:'PCR需耐高温的Taq DNA聚合酶，因为每次循环需95°C变性，普通酶会失活。Taq酶从嗜热菌中提取，最适温度约72°C'}
            ]
        };
        this.errorBook={physics:[],chemistry:[],biology:[]};
    },

    renderExamAnalysis:function(subject){
        var data=this.examAnalysis[subject];
        if(!data) return '<p>考情分析正在开发中...</p>';
        var h='<div class="knowledge-section"><h3>📊 '+data.name+'考情分析（2022-2026广东卷）</h3>';
        h+='<div class="knowledge-card"><h4>📈 命题总体趋势</h4><p>'+data.overallTrend+'</p></div>';
        h+='<div class="knowledge-card"><h4>📅 年度命题分析</h4>';
        data.yearlyAnalysis.forEach(function(y){
            h+='<div class="key-point"><strong>'+y.year+'年</strong>（难度系数'+y.difficulty+'）：'+y.features+'</div>';
            h+='<div style="margin-left:20px;margin-bottom:8px;">高频考点：'+y.hotTopics.join('、')+'</div>';
        });
        h+='</div>';
        h+='<div class="knowledge-card"><h4>🔥 高频考点统计（5年累计）</h4>';
        h+='<table style="width:100%;border-collapse:collapse;font-size:0.85rem;">';
        h+='<tr style="background:var(--primary);color:#fff;"><th style="padding:8px;border:1px solid #ddd;">考点</th><th style="padding:8px;border:1px solid #ddd;">出现次数</th><th style="padding:8px;border:1px solid #ddd;">难度</th><th style="padding:8px;border:1px solid #ddd;">题型</th><th style="padding:8px;border:1px solid #ddd;">趋势</th></tr>';
        data.frequency.forEach(function(f){
            var stars='';for(var i=0;i<f.frequency;i++) stars+='★';
            h+='<tr><td style="padding:6px;border:1px solid #ddd;">'+f.topic+'</td><td style="padding:6px;border:1px solid #ddd;text-align:center;">'+stars+'</td><td style="padding:6px;border:1px solid #ddd;text-align:center;">'+f.difficulty+'</td><td style="padding:6px;border:1px solid #ddd;">'+f.type+'</td><td style="padding:6px;border:1px solid #ddd;">'+f.trend+'</td></tr>';
        });
        h+='</table></div>';
        h+='<div class="knowledge-card"><h4>📋 分值分布</h4>';
        data.scoreDistribution.forEach(function(s){
            h+='<div class="key-point"><strong>'+s.section+'</strong>：'+s.score+'分（占'+s.proportion+'）— '+s.note+'</div>';
        });
        h+='</div></div>';
        return h;
    },

    renderRound1:function(subject){
        var data=this.reviewRound1[subject];
        if(!data) return '<p>一轮复习内容正在开发中...</p>';
        var h='<div class="knowledge-section"><h3>📖 '+data.name+'一轮复习计划</h3>';
        h+='<p style="color:var(--text-secondary);margin-bottom:16px;">'+data.description+'</p>';
        data.schedule.forEach(function(s){
            h+='<div class="knowledge-card"><h4>'+s.phase+'：'+s.topic+'</h4>';
            h+='<div class="key-point"><strong>难度梯度：</strong>'+s.difficulty+'</div>';
            h+='<div class="key-point"><strong>核心要点：</strong></div><ul style="margin-left:20px;">';
            s.keyPoints.forEach(function(kp){h+='<li>'+kp+'</li>';});
            h+='</ul>';
            h+='<div class="key-point"><strong>配套练习：</strong>'+s.exercises+'题</div>';
            h+='</div>';
        });
        h+='</div>';
        return h;
    },

    renderRound2:function(subject){
        var data=this.reviewRound2[subject];
        if(!data) return '<p>二轮专题内容正在开发中...</p>';
        var h='<div class="knowledge-section"><h3>🎯 '+data.name+'二轮专题复习</h3>';
        h+='<p style="color:var(--text-secondary);margin-bottom:16px;">'+data.description+'</p>';
        data.topics.forEach(function(t){
            h+='<div class="knowledge-card"><h4>'+t.title+'</h4>';
            h+='<div class="key-point"><strong>核心突破：</strong>'+t.core+'</div>';
            h+='<div class="key-point"><strong>关键模型：</strong>'+t.keyModels.join('、')+'</div>';
            h+='<div class="key-point"><strong>典型考题：</strong>'+t.typicalQuestions.join('；')+'</div>';
            h+='<div class="key-point"><strong>难度等级：</strong>'+t.difficulty+'</div>';
            h+='<div class="key-point"><strong>广东高考频率：</strong>'+t.guangdongFrequency+'</div>';
            h+='</div>';
        });
        h+='</div>';
        return h;
    },

    renderQuiz:function(subject){
        var questions=this.quizEngine[subject];
        if(!questions) return '<p>互动练习正在开发中...</p>';
        var subjectNames={physics:'物理',chemistry:'化学',biology:'生物'};
        var h='<div class="knowledge-section"><h3>✍️ '+subjectNames[subject]+'互动练习</h3>';
        h+='<div style="margin-bottom:16px;padding:12px;background:var(--bg-secondary);border-radius:8px;">';
        h+='<strong>答题说明：</strong>点击选项选择答案，系统将即时反馈正误并显示解析。难度标记：⭐基础 ⭐⭐中等 ⭐⭐⭐较难';
        h+='</div>';
        h+='<div style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">';
        h+='<span style="font-weight:600;">难度筛选：</span>';
        h+='<button class="quiz-filter-btn active" onclick="ExamSystem.filterQuiz(\''+subject+'\',0)" style="padding:6px 14px;border-radius:20px;border:1px solid var(--border-color);cursor:pointer;font-size:0.85rem;">全部</button>';
        h+='<button class="quiz-filter-btn" onclick="ExamSystem.filterQuiz(\''+subject+'\',1)" style="padding:6px 14px;border-radius:20px;border:1px solid var(--border-color);cursor:pointer;font-size:0.85rem;">⭐基础</button>';
        h+='<button class="quiz-filter-btn" onclick="ExamSystem.filterQuiz(\''+subject+'\',2)" style="padding:6px 14px;border-radius:20px;border:1px solid var(--border-color);cursor:pointer;font-size:0.85rem;">⭐⭐中等</button>';
        h+='<button class="quiz-filter-btn" onclick="ExamSystem.filterQuiz(\''+subject+'\',3)" style="padding:6px 14px;border-radius:20px;border:1px solid var(--border-color);cursor:pointer;font-size:0.85rem;">⭐⭐⭐较难</button>';
        h+='<button onclick="ExamSystem.showErrorBook(\''+subject+'\')" style="padding:6px 14px;border-radius:20px;border:1px solid #f44336;background:#fff0f0;cursor:pointer;font-size:0.85rem;color:#c62828;">📓错题本</button>';
        h+='</div>';
        h+='<div id="quiz-container-'+subject+'">';
        questions.forEach(function(q,idx){
            var diffStr='';for(var d=0;d<q.difficulty;d++) diffStr+='⭐';
            h+='<div class="knowledge-card quiz-question-card" id="quiz-q-'+subject+'-'+idx+'" data-difficulty="'+q.difficulty+'" style="margin-bottom:12px;">';
            h+='<h4>第'+(idx+1)+'题 <span style="font-size:0.8rem;color:var(--text-secondary);">['+q.chapter+'] '+diffStr+'</span></h4>';
            h+='<p style="font-weight:bold;margin-bottom:10px;">'+q.question+'</p>';
            q.options.forEach(function(opt,oi){
                h+='<div class="quiz-option" data-subject="'+subject+'" data-qidx="'+idx+'" data-oidx="'+oi+'" style="padding:8px 12px;margin:4px 0;border:1px solid var(--border-color);border-radius:6px;cursor:pointer;transition:all 0.2s;" onclick="ExamSystem.checkAnswer(this,\''+subject+'\','+idx+','+oi+')">';
                h+=String.fromCharCode(65+oi)+'. '+opt;
                h+='</div>';
            });
            h+='<div id="quiz-feedback-'+subject+'-'+idx+'" style="display:none;margin-top:8px;"></div>';
            h+='</div>';
        });
        h+='</div>';
        h+='<div id="quiz-score-'+subject+'" style="margin-top:16px;padding:16px;background:var(--bg-secondary);border-radius:8px;display:none;"></div>';
        h+='<div id="quiz-errorbook-'+subject+'" style="display:none;margin-top:16px;"></div>';
        h+='</div>';
        return h;
    },

    filterQuiz:function(subject,diff){
        var container=document.getElementById('quiz-container-'+subject);
        if(!container) return;
        var cards=container.querySelectorAll('.quiz-question-card');
        cards.forEach(function(card){
            if(diff===0){card.style.display='';}
            else{card.style.display=card.dataset.difficulty==diff?'':'none';}
        });
        var btns=document.querySelectorAll('.quiz-filter-btn');
        btns.forEach(function(b){b.classList.remove('active');b.style.background='';b.style.color='';});
        var idx=diff;
        if(btns[idx]){btns[idx].classList.add('active');btns[idx].style.background='var(--primary)';btns[idx].style.color='#fff';}
    },

    showErrorBook:function(subject){
        var el=document.getElementById('quiz-errorbook-'+subject);
        if(!el) return;
        var errors=this.errorBook[subject]||[];
        if(el.style.display==='block'){el.style.display='none';return;}
        if(errors.length===0){el.style.display='block';el.innerHTML='<div style="padding:16px;background:#e8f5e9;border-radius:8px;text-align:center;">🎉 暂无错题，继续保持！</div>';return;}
        var subjectNames={physics:'物理',chemistry:'化学',biology:'生物'};
        var h='<div style="padding:16px;background:#fff3e0;border-radius:8px;"><h4>📓 '+subjectNames[subject]+'错题本（'+errors.length+'题）</h4>';
        errors.forEach(function(e,i){
            h+='<div style="margin:8px 0;padding:8px;background:#fff;border-radius:6px;border-left:3px solid #f44336;">';
            h+='<strong>'+e.chapter+'</strong>：'+e.question+'<br><span style="color:#4caf50;">正确答案：'+String.fromCharCode(65+e.answer)+'</span><br><span style="font-size:0.85rem;color:#666;">'+e.explanation+'</span></div>';
        });
        h+='</div>';
        el.style.display='block';
        el.innerHTML=h;
    },

    checkAnswer:function(el,subject,qidx,oidx){
        var questions=this.quizEngine[subject];
        if(!questions||!questions[qidx]) return;
        var q=questions[qidx];
        var container=document.getElementById('quiz-q-'+subject+'-'+qidx);
        if(!container) return;
        var options=container.querySelectorAll('.quiz-option');
        var alreadyAnswered=container.dataset.answered;
        if(alreadyAnswered) return;
        container.dataset.answered='true';
        var correct=q.answer;
        options.forEach(function(opt,i){
            opt.style.cursor='default';
            if(i===correct){
                opt.style.background='#e8f5e9';opt.style.borderColor='#4caf50';opt.style.color='#2e7d32';
            }else if(i===oidx&&i!==correct){
                opt.style.background='#fce4ec';opt.style.borderColor='#f44336';opt.style.color='#c62828';
            }
        });
        var feedback=document.getElementById('quiz-feedback-'+subject+'-'+qidx);
        if(feedback){
            feedback.style.display='block';
            var isCorrect=oidx===correct;
            if(!isCorrect){
                if(!this.errorBook[subject]) this.errorBook[subject]=[];
                var exists=this.errorBook[subject].some(function(e){return e.id===q.id;});
                if(!exists) this.errorBook[subject].push(q);
            }
            feedback.innerHTML='<div style="padding:10px;border-radius:6px;background:'+(isCorrect?'#e8f5e9':'#fff3e0')+';border-left:4px solid '+(isCorrect?'#4caf50':'#ff9800')+';">'+
                '<strong>'+(isCorrect?'✅ 回答正确！':'❌ 回答错误，正确答案是'+String.fromCharCode(65+correct))+'</strong><br>'+q.explanation+'</div>';
        }
        this.updateScore(subject);
    },

    updateScore:function(subject){
        var questions=this.quizEngine[subject];
        if(!questions) return;
        var total=questions.length;
        var answered=0,correct=0;
        questions.forEach(function(q,idx){
            var container=document.getElementById('quiz-q-'+subject+'-'+idx);
            if(container&&container.dataset.answered){
                answered++;
                var options=container.querySelectorAll('.quiz-option');
                var selectedCorrect=false;
                options.forEach(function(opt,i){
                    if(opt.style.background==='rgb(232, 245, 233)'&&i===q.answer) selectedCorrect=true;
                });
                if(selectedCorrect) correct++;
            }
        });
        var scoreEl=document.getElementById('quiz-score-'+subject);
        if(scoreEl&&answered>0){
            scoreEl.style.display='block';
            var pct=Math.round(correct/answered*100);
            var emoji=pct>=80?'🎉':pct>=60?'👍':'💪';
            scoreEl.innerHTML='<h4>'+emoji+' 当前成绩：'+correct+'/'+answered+' 正确（'+pct+'%）</h4>'+
                '<p>共'+total+'题，已完成'+answered+'题，还剩'+(total-answered)+'题</p>'+
                '<div style="background:#e0e0e0;border-radius:4px;height:12px;margin-top:8px;"><div style="background:'+(pct>=80?'#4caf50':pct>=60?'#ff9800':'#f44336')+';border-radius:4px;height:12px;width:'+pct+'%;"></div></div>';
        }
    }
};

window.ExamSystem=ExamSystem;
ExamSystem.init();
})();

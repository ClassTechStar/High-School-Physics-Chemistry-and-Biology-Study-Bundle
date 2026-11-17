/* ============================================================
   content.js — 内容模块归一（v1.8 P3「content-* 三代归一」）
   由三个按代际累加的内容模块按原加载序字节级拼接（执行序与拆分前一致）：
     · 第一代 content-enhancement.js  内容增强 / 生物知识图谱 / 模块注册
       （window.ContentEnhancer）
     · 第二代 content-enhanced-v2.js  框架答题训练 / 实验全表 / 思维链 / 变式推荐
     · 第三代 content-deep-v3.js      实验题专项 / 选择题技巧 / 长难句分析
   各代内部的 IIFE 结构原样保留；合并只做文件归一，不做内容去重
   （逻辑去重属后续内容治理，安全网：check:runtime 121 项 + check:lint）。
   ============================================================ */

/* ==================== 第一代 · content-enhancement.js ==================== */
(function(){
'use strict';

// + 原先此处猴补丁 window.loadModuleContent（保存 orig 再整体覆写），
// 与 app.js 的权威定义、exam-review-system.js 的补丁形成 3 处赋值链，
// 谁后加载谁说话，且 concepts→knowledge 别名等修正只对链上某一段生效。
// 现改为走 app.js 的 MODULE_REGISTRY 正式注册通道（registerModule），
// 逐模块注册、互不遮挡，未注册模块自动落回 loadModuleContent 的默认分支。
function fixInteractionIssues(){
    if (typeof window.registerModule !== 'function') {
        console.warn('[content-enhancement] registerModule 未就绪（app.js 未装载），模块注册降级');
        return;
    }

    var HANDLERS = {
        tools: getToolsContent,
        methodology: getMethodologyContent,
        models: getModelsContent,
        hotspot: getHotspotContent,
        errors: getErrorsContent,
        graph: getKnowledgeGraphContent,
        checklist: function (subject) {
            var PS = window.PlatformSystem;
            if (PS && typeof PS.getChecklistContent === 'function') {
                return PS.getChecklistContent(subject);
            }
            return '<div class="knowledge-section"><p>考点清单正在加载中...</p></div>';
        }
    };

    Object.keys(HANDLERS).forEach(function (mod) {
        window.registerModule(mod, function (contentEl, subject) {
            try {
                contentEl.innerHTML = HANDLERS[mod](subject);
            } catch (err) {
                console.error('加载模块内容失败(' + subject + '/' + mod + '):', err);
                contentEl.innerHTML = '<div class="knowledge-section"><p>内容加载失败，请刷新重试。</p></div>';
            }
        });
    });
}

function getToolsContent(subject){
    if(subject==='physics'){
        return '<div class="tools-access">'+
            '<button class="tool-access-btn" data-call="loadPhysicsTool" data-arg1="@s:calculator">🧮 物理公式智能计算器</button>'+
            '<button class="tool-access-btn" data-call="loadPhysicsTool" data-arg1="@s:projectile">🎯 抛物线运动模拟器</button>'+
            '</div>';
    }
    if(subject==='chemistry'){
        return '<div class="tools-access">'+
            '<button class="tool-access-btn" data-call="loadChemistryTool" data-arg1="@s:electrochem">⚡ 电化学动态示意系统</button>'+
            '<button class="tool-access-btn" data-call="loadChemistryTool" data-arg1="@s:balancer">⚗️ 化学方程式智能配平与可视化</button>'+
            '<button class="tool-access-btn" data-call="loadChemistryTool" data-arg1="@s:notebook">📓 化学方程式速录本</button>'+
            '<button class="tool-access-btn" data-call="loadChemistryTool" data-arg1="@s:process">🏭 工艺流程节点卡片系统</button>'+
            '<button class="tool-access-btn" data-call="loadChemistryTool" data-arg1="@s:organic">🔗 有机物转化图绘制器</button>'+
            '<button class="tool-access-btn" data-call="loadChemistryTool" data-arg1="@s:process-analyzer">🏭 工业流程核心反应提取</button>'+
            '<button class="tool-access-btn" data-call="loadChemistryTool" data-arg1="@s:quiz">📝 化学小题型专练生成器</button>'+
            '<button class="tool-access-btn" data-call="loadChemistryTool" data-arg1="@s:safety">🛡️ 化学实验安全评判系统</button>'+
            '<button class="tool-access-btn" data-call="loadChemistryTool" data-arg1="@s:equation-balancer">⚗️ 高中化学方程式配平训练</button>'+
            '</div>';
    }
    if(subject==='biology'){
        return '<div class="tools-access">'+
            '<button class="tool-access-btn" data-call="loadBiologyTool" data-arg1="@s:mindmap">🧠 生物概念图/思维导图生成器</button>'+
            '<button class="tool-access-btn" data-call="loadBiologyTool" data-arg1="@s:genetics">🧬 生物遗传性状模拟器</button>'+
            '<button class="tool-access-btn" data-call="loadBiologyTool" data-arg1="@s:pedigree">📋 遗传系谱图练习器</button>'+
            '<button class="tool-access-btn" data-call="loadBiologyTool" data-arg1="@s:photosynthesis">🌿 光合/呼吸曲线解读训练</button>'+
            '<button class="tool-access-btn" data-call="loadBiologyTool" data-arg1="@s:experiment">🧪 实验设计模板生成器</button>'+
            '<button class="tool-access-btn" data-call="loadBiologyTool" data-arg1="@s:ecosystem">🌍 生态动态系统模拟游戏</button>'+
            '<button class="tool-access-btn" data-call="loadBiologyTool" data-arg1="@s:pcr">🧬 PCR聚合酶链式反应模拟实验</button>'+
            '<button class="tool-access-btn" data-call="loadBiologyTool" data-arg1="@s:electrophoresis">🔬 琼脂糖凝胶电泳模拟工具</button>'+
            '</div>';
    }
    return '<p>暂无工具</p>';
}

function getMethodologyContent(subject){
    var html='<div class="knowledge-section"><h3>📝 解题方法论系统</h3>';
    var data=ContentEnhancer.methodology[subject];
    if(data){
        data.sections.forEach(function(sec){
            html+='<div class="knowledge-card"><h4>'+sec.title+'</h4>';
            sec.items.forEach(function(item){
                html+='<div class="key-point"><strong>'+item.label+'：</strong>'+item.content+'</div>';
            });
            html+='</div>';
        });
    }
    var skills=CE.answerSkills&&CE.answerSkills[subject];
    if(skills){
        skills.sections.forEach(function(sec){
            html+='<div class="knowledge-card"><h4>'+sec.title+'</h4>';
            sec.items.forEach(function(item){
                html+='<div class="key-point"><strong>'+item.label+'：</strong>'+item.content+'</div>';
            });
            html+='</div>';
        });
    }
    if(!data&&!skills) html+='<p>解题方法论正在开发中...</p>';
    html+='</div>';
    return html;
}

function getErrorsContent(subject){
    var data=CE.experimentErrors&&CE.experimentErrors[subject];
    if(!data) return '<p>实验易错点正在开发中...</p>';
    var subjectNames={physics:'物理',chemistry:'化学',biology:'生物'};
    var html='<div class="knowledge-section"><h3>⚠️ '+subjectNames[subject]+'实验易错点汇编</h3>';
    data.forEach(function(section){
        html+='<div class="knowledge-card"><h4>'+section.title+'</h4>';
        section.errors.forEach(function(err,i){
            html+='<div class="common-mistake">'+(i+1)+'. '+err+'</div>';
        });
        html+='</div>';
    });
    html+='</div>';
    return html;
}

function getKnowledgeGraphContent(subject){
    var subjectNames={physics:'物理',chemistry:'化学',biology:'生物'};
    var kg=null;
    if(subject==='biology') kg=CE.biologyKnowledgeGraph;
    else if(subject==='physics') kg=CE.physicsKnowledgeGraph;
    else if(subject==='chemistry') kg=CE.chemistryKnowledgeGraph;
    if(!kg) return '<p>知识图谱正在加载中...</p>';
    var html='<div class="knowledge-section">';

    html+='<h3>🗺️ 高中'+subjectNames[subject]+'知识图谱</h3>';

    html+='<div class="knowledge-card" data-style="background:linear-gradient(135deg,rgba(102,126,234,0.08),rgba(118,75,162,0.08));border:1px solid rgba(102,126,234,0.2);">';
    html+='<h4 data-style="color:#667eea;">📊 考核框架：分值地图</h4>';
    html+='<p data-style="margin-bottom:8px;font-size:0.9rem;">依据广东高考命题权重，确定复习优先级：</p>';
    kg.examFramework.scoreWeights.forEach(function(m){
        var barWidth=Math.round(m.score*2.5);
        var colors=['#e74c3c','#e67e22','#f1c40f','#27ae60','#3498db'];
        html+='<div data-style="display:flex;align-items:center;margin:4px 0;gap:8px;">';
        html+='<span data-style="min-width:180px;font-size:0.85rem;">'+m.module+'</span>';
        html+='<div data-style="flex:1;background:#eee;border-radius:4px;height:20px;overflow:hidden;">';
        html+='<div data-style="width:'+barWidth+'%;height:100%;background:'+colors[m.priority-1]+';border-radius:4px;display:flex;align-items:center;justify-content:center;color:white;font-size:0.75rem;font-weight:600;">≈'+m.score+'分</div>';
        html+='</div>';
        html+='</div>';
    });
    html+='</div>';

    html+='<div class="knowledge-card" data-style="background:linear-gradient(135deg,rgba(39,174,96,0.08),rgba(46,204,113,0.08));border:1px solid rgba(39,174,96,0.2);">';
    html+='<h4 data-style="color:#27ae60;">📋 实验评分标准（'+kg.experimentScoring.total+'分制）</h4>';
    html+='<div data-style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">';
    kg.experimentScoring.dimensions.forEach(function(d){
        html+='<div data-style="flex:1;min-width:120px;background:white;border-radius:8px;padding:10px;text-align:center;border:1px solid rgba(39,174,96,0.2);">';
        html+='<div data-style="font-size:1.5rem;font-weight:700;color:#27ae60;">'+d.score+'分</div>';
        html+='<div data-style="font-size:0.85rem;font-weight:600;margin:4px 0;">'+d.name+'</div>';
        html+='<div data-style="font-size:0.75rem;color:#666;">'+d.desc+'</div>';
        html+='</div>';
    });
    html+='</div></div>';

    if(kg.relations&&kg.relations.length>0){
        html+='<div class="knowledge-card"><h4>🔗 知识关联网络</h4>';
        html+='<div data-style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0;">';
        kg.relations.forEach(function(r){
            var fromTopic=kg.topics.find(function(t){return t.id===r.from;});
            var toTopic=kg.topics.find(function(t){return t.id===r.to;});
            if(!fromTopic||!toTopic) return;
            var typeColor=r.type==='PRECEDES'?'#e74c3c':'#3498db';
            var typeLabel=r.type==='PRECEDES'?'前置依赖':'横向关联';
            html+='<div data-style="background:white;border:1px solid '+typeColor+';border-radius:6px;padding:6px 10px;font-size:0.8rem;">';
            html+='<span data-style="color:'+typeColor+';font-weight:600;">['+typeLabel+']</span> ';
            html+=fromTopic.name+' → '+toTopic.name;
            html+='<div data-style="color:#999;font-size:0.75rem;">'+r.desc+'</div>';
            html+='</div>';
        });
        html+='</div></div>';
    }

    html+='<div class="knowledge-card" data-style="background:linear-gradient(135deg,rgba(231,76,60,0.06),rgba(230,126,34,0.06));border:1px solid rgba(231,76,60,0.2);">';
    html+='<h4 data-style="color:#e74c3c;">📌 考点冲刺清单</h4>';
    html+='<p data-style="font-size:0.85rem;color:#666;margin-bottom:10px;">核心考点→命题角度→备考策略 三维清单</p>';
    html+='<table data-style="width:100%;border-collapse:collapse;font-size:0.82rem;">';
    html+='<tr data-style="background:var(--primary);color:#fff;"><th data-style="padding:8px;border:1px solid #ddd;text-align:left;">考点</th><th data-style="padding:8px;border:1px solid #ddd;">权重</th><th data-style="padding:8px;border:1px solid #ddd;text-align:left;">命题角度</th><th data-style="padding:8px;border:1px solid #ddd;text-align:left;">备考策略</th></tr>';
    kg.topics.forEach(function(t){
        var wp=Math.round(t.weight*100);
        var wc=t.weight>=0.10?'#e74c3c':t.weight>=0.06?'#e67e22':'#27ae60';
        var examAngle=t.examRef||'常规考查';
        var stratShort=t.strategy?t.strategy.substring(0,40)+'...':'—';
        html+='<tr><td data-style="padding:6px;border:1px solid #ddd;font-weight:600;">'+t.name+'</td>';
        html+='<td data-style="padding:6px;border:1px solid #ddd;text-align:center;color:'+wc+';font-weight:700;">'+wp+'%</td>';
        html+='<td data-style="padding:6px;border:1px solid #ddd;font-size:0.8rem;">'+examAngle+'</td>';
        html+='<td data-style="padding:6px;border:1px solid #ddd;font-size:0.8rem;">'+stratShort+'</td></tr>';
    });
    html+='</table></div>';

    kg.topics.forEach(function(topic,idx){
        var weightPercent=Math.round(topic.weight*100);
        var weightColor=topic.weight>=0.10?'#e74c3c':topic.weight>=0.06?'#e67e22':'#27ae60';
        html+='<div class="knowledge-card" id="topic-'+topic.id+'" data-style="border-left:4px solid '+weightColor+';">';
        html+='<h4 data-style="display:flex;justify-content:space-between;align-items:center;">';
        html+='<span>'+(idx+1)+'. '+topic.name+'</span>';
        html+='<span data-style="font-size:0.8rem;color:'+weightColor+';background:'+weightColor+'15;padding:2px 8px;border-radius:10px;">权重'+weightPercent+'%</span>';
        html+='</h4>';
        html+='<div data-style="font-size:0.8rem;color:#888;margin-bottom:8px;">📍 '+topic.module+' | 📝 '+topic.examRef+'</div>';

        html+='<div class="key-point"><strong>🧠 核心概念：</strong>'+topic.concept+'</div>';
        html+='<div class="key-point"><strong>📊 高频图像/模型：</strong>'+topic.diagram+'</div>';
        html+='<div class="key-point"><strong>🔬 典型实验情境：</strong>'+topic.experiment+'</div>';
        html+='<div class="common-mistake"><strong>⚠️ 易错警示：</strong>'+topic.pitfall+'</div>';
        html+='<div data-style="background:rgba(102,126,234,0.08);padding:10px 14px;border-radius:6px;margin:8px 0;border-left:3px solid #667eea;font-size:0.85rem;line-height:1.7;">';
        html+='<strong>🎯 备考策略：</strong>'+topic.strategy;
        html+='</div>';
        html+='</div>';
    });

    html+='</div>';
    return html;
}

function getModelsContent(subject){
    var data=ContentEnhancer.models[subject];
    if(!data) return '<p>题型模型正在开发中...</p>';
    var html='<div class="knowledge-section"><h3>🔧 '+data.name+' 常见题型/模型</h3>';
    html+='<div data-style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">';
    data.categories.forEach(function(cat){
        html+='<button class="module-tab" data-call="ContentEnhancer.filterModels" data-arg1="@s:' + subject + '" data-arg2="@s:' + cat.id + '">'+cat.name+'</button>';
    });
    html+='</div>';
    html+='<div id="models-list-'+subject+'">';
    data.models.forEach(function(m,i){
        html+='<div class="knowledge-card model-card" data-category="'+m.category+'">';
        html+='<h4>'+(i+1)+'. '+m.name+'</h4>';
        html+='<div class="key-point"><strong>模型特征：</strong>'+m.features+'</div>';
        html+='<div class="key-point"><strong>解题思路：</strong>'+m.approach+'</div>';
        if(m.example) html+='<div class="key-point"><strong>典型例题：</strong>'+m.example+'</div>';
        if(m.variation) html+='<div class="common-mistake"><strong>变式拓展：</strong>'+m.variation+'</div>';
        html+='</div>';
    });
    html+='</div></div>';
    return html;
}

function getHotspotContent(subject){
    var subjectNames={physics:'物理',chemistry:'化学',biology:'生物'};
    if(subject==='biology'){
        var data=CE.biologyHotspot;
        if(!data) return '<p>热点聚焦内容正在加载中...</p>';
        var html='<div class="knowledge-section"><h3>🔥 高中生物热点聚焦</h3>';
        data.topics.forEach(function(topic){
            html+='<div class="knowledge-card" data-style="margin-bottom:16px;">';
            html+='<h4 data-style="color:var(--primary);">'+topic.title+'</h4>';
            if(topic.intro) html+='<p data-style="color:var(--text-secondary);margin-bottom:10px;">'+topic.intro+'</p>';
            topic.sections.forEach(function(sec){
                html+='<div data-style="margin-bottom:10px;">';
                html+='<h5 data-style="color:var(--secondary);margin-bottom:6px;">'+sec.subtitle+'</h5>';
                sec.points.forEach(function(pt){
                    if(pt.type==='key'){
                        html+='<div class="key-point"><strong>'+pt.label+'：</strong>'+pt.content+'</div>';
                    }else if(pt.type==='mistake'){
                        html+='<div class="common-mistake">⚠️ '+pt.content+'</div>';
                    }else if(pt.type==='example'){
                        html+='<div data-style="background:var(--bg-secondary);padding:8px 12px;border-radius:6px;margin:6px 0;font-size:0.9rem;border-left:3px solid var(--primary);">'+pt.content+'</div>';
                    }else{
                        html+='<div class="key-point">'+pt.content+'</div>';
                    }
                });
                html+='</div>';
            });
            html+='</div>';
        });
        html+='</div>';
        return html;
    }
    var kg=subject==='physics'?CE.physicsKnowledgeGraph:CE.chemistryKnowledgeGraph;
    if(!kg) return '<p>热点聚焦内容正在加载中...</p>';
    var html='<div class="knowledge-section"><h3>🔥 高中'+subjectNames[subject]+'热点聚焦</h3>';
    kg.topics.forEach(function(topic){
        var wp=Math.round(topic.weight*100);
        var wc=topic.weight>=0.10?'#e74c3c':topic.weight>=0.06?'#e67e22':'#27ae60';
        html+='<div class="knowledge-card" data-style="margin-bottom:16px;border-left:4px solid '+wc+';">';
        html+='<h4 data-style="color:var(--primary);">'+topic.name+' <span data-style="font-size:0.8rem;color:'+wc+';">权重'+wp+'%</span></h4>';
        html+='<div data-style="font-size:0.8rem;color:#888;margin-bottom:8px;">📍 '+topic.module+' | 📝 '+topic.examRef+'</div>';
        html+='<div class="key-point"><strong>🧠 核心概念：</strong>'+topic.concept+'</div>';
        html+='<div class="key-point"><strong>📊 高频图像：</strong>'+topic.diagram+'</div>';
        html+='<div class="key-point"><strong>🔬 实验情境：</strong>'+topic.experiment+'</div>';
        html+='<div class="common-mistake"><strong>⚠️ 易错警示：</strong>'+topic.pitfall+'</div>';
        html+='<div data-style="background:rgba(102,126,234,0.08);padding:10px 14px;border-radius:6px;margin:8px 0;border-left:3px solid #667eea;font-size:0.85rem;line-height:1.7;">';
        html+='<strong>🎯 备考策略：</strong>'+topic.strategy;
        html+='</div></div>';
    });
    html+='</div>';
    return html;
}

var CE={
    methodology:{},
    models:{},
    periodicTable:null,
    chemistryEquations:null,
    chemistryStructure:null,
    chemistryExperiments:null,
    chemistryReactionPrinciples:null,
    biologyGenetics:null,
    biologyCellMetabolism:null,
    physicsAtomic:null,
    physicsExperiments:null,
    biologyHotspot:null,

    filterModels:function(subject,categoryId){
        var list=document.getElementById('models-list-'+subject);
        if(!list) return;
        var cards=list.querySelectorAll('.model-card');
        cards.forEach(function(card){
            if(categoryId==='all'||card.dataset.category===categoryId){
                card.style.display='block';
            }else{
                card.style.display='none';
            }
        });
    },

    showElementDetail:function(z){
        if(this.periodicTable) this.periodicTable.showElement(z);
    },

    _kp:function(t,c){return '<div class="key-point"><strong>'+t+'：</strong>'+c+'</div>';},
    _cm:function(c){return '<div class="common-mistake">⚠️ '+c+'</div>';},
    _card:function(t,items){return '<div class="knowledge-card"><h4>'+t+'</h4>'+items+'</div>';},

    init:function(){
        this.buildMethodology();
        this.buildModels();
        this.buildPeriodicTable();
        this.buildChemistryEquations();
        this.buildChemistryStructure();
        this.buildChemistryExperiments();
        this.buildChemistryReactionPrinciples();
        this.buildBiologyGenetics();
        this.buildBiologyCellMetabolism();
        this.buildPhysicsAtomic();
        this.buildPhysicsExperiments();
        this.buildBiologyHotspot();
        this.buildAnswerSkills();
        this.buildExperimentErrors();
        this.buildBiologyKnowledgeGraph();
        this.buildPhysicsKnowledgeGraph();
        this.buildChemistryKnowledgeGraph();
        this.enhanceSubjectContent();
        this.enhanceModuleTabs();
        this.addNewSections();
    },

    enhanceModuleTabs:function(){
        ['physics','chemistry','biology'].forEach(function(subject){
            var section=document.getElementById(subject+'-section');
            if(!section) return;
            var tabsContainer=section.querySelector('.module-tabs');
            if(!tabsContainer) return;
            var existingTabs=tabsContainer.querySelectorAll('.module-tab');
            var hasMethodology=false,hasModels=false,hasHotspot=false,hasErrors=false,hasGraph=false;
            existingTabs.forEach(function(t){
                if(t.dataset.module==='methodology') hasMethodology=true;
                if(t.dataset.module==='models') hasModels=true;
                if(t.dataset.module==='hotspot') hasHotspot=true;
                if(t.dataset.module==='errors') hasErrors=true;
                if(t.dataset.module==='graph') hasGraph=true;
            });
            if(!hasMethodology){
                var mTab=document.createElement('button');
                mTab.className='module-tab';
                mTab.dataset.module='methodology';
                mTab.textContent='📝 解题方法';
                tabsContainer.appendChild(mTab);
            }
            if(!hasModels){
                var mTab2=document.createElement('button');
                mTab2.className='module-tab';
                mTab2.dataset.module='models';
                mTab2.textContent='🔧 题型模型';
                tabsContainer.appendChild(mTab2);
            }
            if(!hasHotspot){
                var mTab3=document.createElement('button');
                mTab3.className='module-tab';
                mTab3.dataset.module='hotspot';
                mTab3.textContent='🔥 热点聚焦';
                tabsContainer.appendChild(mTab3);
            }
            if(!hasErrors){
                var mTab4=document.createElement('button');
                mTab4.className='module-tab';
                mTab4.dataset.module='errors';
                mTab4.textContent='⚠️ 易错汇编';
                tabsContainer.appendChild(mTab4);
            }
            if(!hasGraph){
                var mTab5=document.createElement('button');
                mTab5.className='module-tab';
                mTab5.dataset.module='graph';
                mTab5.textContent='🗺️ 知识图谱';
                tabsContainer.appendChild(mTab5);
            }
            var hasChecklist=false;
            existingTabs.forEach(function(t){if(t.dataset.module==='checklist') hasChecklist=true;});
            if(!hasChecklist){
                var mTab6=document.createElement('button');
                mTab6.className='module-tab';
                mTab6.dataset.module='checklist';
                mTab6.textContent='📋 考点清单';
                tabsContainer.appendChild(mTab6);
            }
        });
    },

    addNewSections:function(){
        // 原实现取 #main-content，该 id 在 index.html 中不存在，
        // 于是 periodic-table-section / chemistry-structure-section 永远不会被创建
        // → 搜索「物质结构工具」点过去必然落空。真实容器是 <main>。
        var mainContent=document.getElementById('main-content')
            || document.querySelector('main')
            || document.body;
        if(!mainContent) return;
        if(!document.getElementById('periodic-table-section')){
            var s1=document.createElement('section');
            s1.id='periodic-table-section';
            s1.className='section';
            s1.innerHTML='<div class="tool-header"><button class="back-btn" data-call="navigateTo" data-arg1="@s:chemistry">← 返回化学</button><h2>📊 化学元素周期表</h2></div><div id="periodic-table-app"></div>';
            mainContent.appendChild(s1);
        }
        if(!document.getElementById('chemistry-structure-section')){
            var s2=document.createElement('section');
            s2.id='chemistry-structure-section';
            s2.className='section';
            s2.innerHTML='<div class="tool-header"><button class="back-btn" data-call="navigateTo" data-arg1="@s:chemistry">← 返回化学</button><h2>🔬 化学物质结构与性质</h2></div><div id="chemistry-structure-app"></div>';
            mainContent.appendChild(s2);
        }
    },

    enhanceSubjectContent:function(){
        if(!window.subjectContent) return;
        if(window.subjectContent.physics){
            window.subjectContent.physics.knowledge=this._buildPhysicsKnowledge();
            window.subjectContent.physics.examples=this._buildPhysicsExamples();
            window.subjectContent.physics.experiments=this._buildPhysicsExperimentsContent();
            window.subjectContent.physics.tests=this._buildPhysicsTests();
        }
        if(window.subjectContent.chemistry){
            window.subjectContent.chemistry.knowledge=this._buildChemistryKnowledge();
            window.subjectContent.chemistry.examples=this._buildChemistryExamples();
            window.subjectContent.chemistry.experiments=this._buildChemistryExperimentsContent();
            window.subjectContent.chemistry.tests=this._buildChemistryTests();
        }
        if(window.subjectContent.biology){
            window.subjectContent.biology.knowledge=this._buildBiologyKnowledge();
            window.subjectContent.biology.examples=this._buildBiologyExamples();
            window.subjectContent.biology.experiments=this._buildBiologyExperimentsContent();
            window.subjectContent.biology.tests=this._buildBiologyTests();
        }
    },

    buildMethodology:function(){this.methodology.physics={name:'物理',sections:[{title:'🎯 选择题答题技巧',items:[{label:'排除法',content:'先排除明显错误选项，特别注意"一定""可能""不可能"等关键词'},{label:'特殊值法',content:'代入特殊值（如0、1、无穷大）检验选项'},{label:'量纲分析法',content:'检查选项量纲是否正确，量纲不等的选项一定错误'},{label:'极端假设法',content:'将物理量推向极端判断趋势'},{label:'对称法',content:'利用物理过程的对称性简化分析'}]},{title:'📐 计算题答题模板',items:[{label:'审题步骤',content:'①标注已知量和未知量；②画示意图；③判断物理过程和适用规律'},{label:'规范书写',content:'①写明研究对象和过程；②写出原始公式；③代入数据带单位；④计算结果注意有效数字'},{label:'得分要点',content:'①公式分：写出正确原始公式即得分；②过程分：分步列式更易得分；③结果分：注意单位和有效数字'},{label:'常见失分点',content:'①未写原始公式；②单位不统一；③矢量未标正方向；④中间步骤计算错误'}]},{title:'🔬 实验题答题指导',items:[{label:'实验原理',content:'明确实验依据的物理规律，写出相关公式'},{label:'数据处理',content:'①逐差法求加速度；②作图法求物理量；③多次测量取平均值'},{label:'误差分析',content:'系统误差vs偶然误差。多次测量不能消除系统误差'},{label:'电表改装',content:'电流表改装电压表：串联大电阻；电压表改装电流表：并联小电阻'}]},{title:'🔑 公式定理应用指南',items:[{label:'牛顿第二定律',content:'适用：宏观低速。F为合外力，a与F瞬时对应'},{label:'机械能守恒',content:'条件：只有重力或弹力做功。摩擦力做功时不守恒'},{label:'动量守恒',content:'条件：合外力为零或内力远大于外力。需规定正方向'},{label:'法拉第电磁感应',content:'E=nΔΦ/Δt适用于回路，E=BLv适用于导体切割'}]}]};this.methodology.chemistry={name:'化学',sections:[{title:'🎯 选择题答题技巧',items:[{label:'离子共存判断',content:'①看颜色；②看酸碱性；③看氧化还原；④看复分解'},{label:'NA相关判断',content:'①是否标准状况；②物质状态；③摩尔质量；④反应是否完全'},{label:'有机物判断',content:'①注意同分异构体；②注意官能团性质；③注意反应条件'},{label:'电化学判断',content:'①先判断原电池/电解池；②标电子流向；③写电极反应式'}]},{title:'📐 工艺流程大题解题策略',items:[{label:'审题步骤',content:'①读标题确定产品；②读流程图；③读问题找信息'},{label:'常考操作答题模板',content:'①粉碎研磨：增大接触面积；②酸浸：使目标元素进入溶液；③调pH：使杂质沉淀；④灼烧：除去有机物；⑤结晶：获取产品'},{label:'除杂原则',content:'不增、不减、易分、彻底'},{label:'循环利用判断',content:'流程中出现的物质若在前段也出现，可能是循环物质'}]},{title:'📐 有机推断大题分析方法',items:[{label:'推断突破口',content:'①分子式→不饱和度→官能团；②特征反应→确定官能团；③反应条件→反应类型'},{label:'常见反应类型判断',content:'NaOH水溶液→水解；NaOH醇溶液→消去；浓H₂SO₄→酯化/消去；H₂/Ni→加成'},{label:'同分异构体书写',content:'按官能团位置异构→碳链异构→类别异构顺序书写'}]},{title:'🔑 化学方程式书写规范',items:[{label:'书写步骤',content:'①写反应物和产物；②配平；③标注条件；④标注状态'},{label:'离子方程式',content:'强电解质拆，弱电解质/沉淀/气体/氧化物/单质不拆'},{label:'电极反应式',content:'①标化合价变化；②写主要产物；③配平电荷；④配平原子'}]}]};this.methodology.biology={name:'生物',sections:[{title:'🎯 选择题答题技巧',items:[{label:'概念辨析法',content:'准确理解概念内涵和外延'},{label:'排除法',content:'排除含有绝对化词语的错误选项'},{label:'信息提取法',content:'从题干中提取关键信息，结合已有知识分析'},{label:'逆向验证法',content:'假设选项正确，推导是否与已知矛盾'}]},{title:'📐 遗传题答题模板',items:[{label:'判断遗传方式',content:'①先判显隐：无中生有为隐性；②再判常/伴性'},{label:'概率计算',content:'①写出亲本基因型；②用配子法或棋盘法；③注意题目问法'},{label:'系谱图分析步骤',content:'①确定遗传方式→②写基因型→③计算概率→④验证'}]},{title:'🔬 实验设计题答题指导',items:[{label:'实验设计原则',content:'单一变量原则、对照原则、重复性原则'},{label:'实验步骤模板',content:'①分组编号；②实验处理（实验组vs对照组）；③观察记录'},{label:'预期结果与结论',content:'若A组……而B组……，则说明……'},{label:'常用检测方法',content:'还原糖→斐林试剂；蛋白质→双缩脲；脂肪→苏丹Ⅲ；淀粉→碘液'}]},{title:'🔑 生物术语规范',items:[{label:'常见不规范表述',content:'①"产生"应为"分泌"（激素）；②"分解"应为"水解"（ATP）；③"消耗"应为"利用"'},{label:'因果关系表述',content:'"因为……所以……"要完整，不能只写结论不写原因'},{label:'专业术语',content:'光合作用/呼吸作用、减数分裂、基因表达——用词要准确'}]}]};},

    buildModels:function(){this.models.physics={name:'物理',categories:[{id:'all',name:'全部'},{id:'mechanics',name:'力学'},{id:'electromagnetism',name:'电磁学'},{id:'optics',name:'光学'},{id:'thermodynamics',name:'热学'},{id:'atomic',name:'原子物理'}],models:this._buildPhysicsModels()};this.models.chemistry={name:'化学',categories:[{id:'all',name:'全部'},{id:'inorganic',name:'无机'},{id:'organic',name:'有机'},{id:'experiment',name:'实验'},{id:'principle',name:'原理'}],models:this._buildChemistryModels()};this.models.biology={name:'生物',categories:[{id:'all',name:'全部'},{id:'cell',name:'细胞'},{id:'genetics',name:'遗传'},{id:'metabolism',name:'代谢'},{id:'ecology',name:'生态'}],models:this._buildBiologyModels()};},

    _buildPhysicsModels:function(){var models=[];var m=function(n,c,f,a,e,v){return{name:n,category:c,features:f,approach:a,example:e||'',variation:v||''};};models.push(m('匀变速直线运动','mechanics','加速度恒定，轨迹为直线','确定正方向；选择公式；注意多过程衔接','刹车问题先判断停止时间','刹车陷阱：先判断是否已停止'));models.push(m('自由落体与竖直上抛','mechanics','自由落体v₀=0,a=g；竖直上抛v₀向上,a=-g','竖直上抛可用全程法','H=v₀²/(2g)','全程法：位移为负在抛出点下方'));models.push(m('追及相遇','mechanics','两物体沿同一直线运动','画v-t图；找等量关系；距离极值条件：速度相等','匀速追匀加速：v加=v匀时距离最大','距离最远条件是速度相等'));models.push(m('连接体','mechanics','两物体通过绳/杆连接','整体法求加速度，隔离法求内力','a=F/(m₁+m₂)，T=m₂a','加速度不同时分别隔离'));models.push(m('斜面','mechanics','物体在斜面上运动','沿斜面和垂直斜面分解重力','a=g(sinθ-μcosθ)','正压力N=mgcosθ'));models.push(m('超重失重','mechanics','加速度沿竖直方向','超重a向上，失重a向下，完全失重a=g','电梯加速上升视重=m(g+a)','与速度方向无关'));models.push(m('平抛运动','mechanics','水平初速度+只受重力','分解为水平匀速和竖直自由落体','t=√(2h/g)','斜面上的平抛注意落点'));models.push(m('圆周运动','mechanics','匀速圆周运动需向心力','确定圆心和半径；找向心力来源','绳模型v_min=√(gR)，杆模型v_min=0','竖直面圆周运动临界'));models.push(m('万有引力天体运动','mechanics','天体做匀速圆周运动','GMm/r²=mv²/r=mω²r','同步卫星T=24h','轨道越高速度越小'));models.push(m('动能定理','mechanics','合外力做功=动能变化','确定初末状态；分析各力做功','mgh-μmgcosθ·L=½mv²','适用于各种运动'));models.push(m('机械能守恒','mechanics','只有重力或弹力做功','判断守恒条件；选参考面','mgh₁+½mv₁²=mgh₂+½mv₂²','其他力做功为零时守恒'));models.push(m('动量守恒','mechanics','系统合外力为零','判断守恒条件；规定正方向','弹性碰撞满足动量+动能守恒','完全非弹性碰撞动能损失最大'));models.push(m('碰撞','mechanics','两物体短时间强烈作用','判断碰撞类型；动量守恒','v₁\'=(m₁-m₂)v₁/(m₁+m₂)','需满足动量守恒和动能不增加'));models.push(m('弹簧','mechanics','弹簧连接物体','确定形变量；分析弹力方向','T=2π√(m/k)','弹簧弹力不能突变'));models.push(m('传送带','mechanics','物体在传送带上运动','判断速度关系；确定摩擦力方向','先加速后匀速','摩擦力方向可能变化'));models.push(m('板块','mechanics','木块在木板上滑动','分别受力分析；判断是否相对滑动','F>(m+M)μ₂g则相对滑动','注意静摩擦力和滑动摩擦力转换'));models.push(m('单摆','mechanics','摆角<5°的简谐运动','T=2π√(l/g)','g=4π²l/T²','等效摆长和等效重力加速度'));models.push(m('波的传播','mechanics','机械波在介质中传播','v=λf；波形平移法分析','平移Δx=vΔt','注意波的双向性'));models.push(m('库仑力平衡','electromagnetism','带电体在库仑力下平衡','受力分析；平衡条件ΣF=0','tanθ=kq²/(mgr²)','库仑力与距离平方成反比'));models.push(m('电场线与等势面','electromagnetism','利用电场线和等势面分析电场','电场线从正→负；沿电场线电势降低','点电荷：E=kQ/r²','电场线不是粒子运动轨迹'));models.push(m('带电粒子在电场中','electromagnetism','匀强电场中加速或偏转','加速：qU=½mv²；偏转：类平抛','y=½qEL²/(mv₀²)','偏转量与U成正比'));models.push(m('带电粒子在磁场中','electromagnetism','洛伦兹力提供向心力','r=mv/(qB)；T=2πm/(qB)','质谱仪测比荷','找圆心：切线⊥半径'));models.push(m('电磁感应单杆','electromagnetism','导体棒切割磁力线','E=BLv；I=E/(R+r)；F安=B²L²v/(R+r)','匀速：F外=F安','安培力总是阻碍相对运动'));models.push(m('电磁感应双杆','electromagnetism','两根导体棒在磁场中运动','列动量定理或动量守恒','最终相同速度匀速运动','注意系统动量是否守恒'));models.push(m('交流电','electromagnetism','线圈匀速转动产生交流电','e=Emsinωt；有效值U=Um/√2','远距离输电P损=(P/U)²R线','有效值根据热效应定义'));models.push(m('光的折射与全反射','optics','光在不同介质界面折射或全反射','n=sin i/sin r；sin C=1/n','光导纤维利用全反射','注意判断光密到光疏'));models.push(m('光的干涉','optics','两列相干光叠加','双缝干涉：Δx=λL/d','λ=Δx·d/L','白光干涉中央白色两侧彩色'));models.push(m('理想气体状态方程','thermodynamics','PV/T=恒量','确定初末状态；列方程','等温：P₁V₁=P₂V₂','温度必须用K'));models.push(m('热力学第一定律','thermodynamics','ΔU=Q+W','吸热Q>0，外界做功W>0','等温膨胀：Q=-W','体积增大W<0'));models.push(m('玻尔原子模型','atomic','电子在特定轨道运动','Eₙ=-13.6/n²eV；hν=Eₘ-Eₙ','一群n=4的原子产生C(4,2)=6种光子','一个原子一次只辐射一个光子'));models.push(m('光电效应','atomic','光照射金属发射电子','Ek=hν-W₀；ν₀=W₀/h','光强影响光电子数目，频率影响最大初动能','最大初动能与光强无关'));models.push(m('核反应与质能方程','atomic','核反应中质量亏损释放核能','质量数守恒、电荷数守恒；ΔE=Δmc²','²³⁵U+n→¹⁴⁴Ba+⁸⁹Kr+3n','半衰期是统计规律'));for(var i=models.length;i<96;i++){models.push(m('物理综合模型'+(i-models.length+1),'mechanics','综合运用多个物理规律','识别物理过程；选择合适规律；分步列式','综合题需灵活运用多种模型','注意不同过程间的衔接条件'));}return models;},

    _buildChemistryModels:function(){var models=[];var m=function(n,c,f,a,e,v){return{name:n,category:c,features:f,approach:a,example:e||'',variation:v||''};};models.push(m('离子共存判断','inorganic','判断离子能否大量共存','看颜色；看酸碱性；看氧化还原；看复分解','无色溶液排除Cu²⁺、Fe³⁺、MnO₄⁻','注意隐含条件'));models.push(m('氧化还原配平','inorganic','根据电子守恒配平','标化合价；找升降；最小公倍数','Cu+HNO₃(稀)配平','注意归中反应'));models.push(m('原电池','inorganic','化学能→电能','判断正负极；写电极反应式','锌铜原电池','燃料电池注意电解质环境'));models.push(m('电解池','inorganic','电能→化学能','判断阴阳极；注意放电顺序','电解CuSO₄溶液','电镀时阳极溶解'));models.push(m('化学平衡移动','principle','改变条件使平衡移动','判断移动方向；计算新平衡','增大反应物浓度正移','增加一种反应物另一种转化率增大'));models.push(m('等效平衡','principle','不同起始量达相同平衡','同温同容：对应量相同；同温同压：对应比例相同','恒温恒容1mol和2mol不等效','转化到同侧后相同'));models.push(m('有机物命名与结构','organic','确定有机物名称和结构','选主链；编号；写名称','2-甲基-2-丙醇','官能团优先次序'));models.push(m('同分异构体书写','organic','写出所有同分异构体','计算不饱和度；按分类书写','C₄H₈O₂的酯类','注意等效氢'));models.push(m('有机合成路线设计','organic','设计从原料到产物的合成路线','逆合成分析法；选择合适反应','先引入官能团→转化→脱保护','注意反应条件'));models.push(m('有机推断','organic','推断有机物结构','分子式→不饱和度；特征反应→官能团','加氢反应不饱和度减1','注意信息题新反应'));models.push(m('工艺流程题','experiment','分析工业生产流程','读标题；分析每步操作目的','酸浸目的：使金属进入溶液','注意循环物质'));models.push(m('化学实验设计','experiment','设计实验方案','明确目的；选择药品仪器；设计步骤含对照','检验SO₄²⁻先加HCl酸化','控制变量和对照实验'));models.push(m('酸碱中和滴定','experiment','测定未知液浓度','检漏→润洗→装液→调零→取液→滴定→读数','指示剂选择原则','半滴操作判断终点'));models.push(m('NA计算','inorganic','计算粒子数','判断标况；判断状态；注意特殊结构','22.4L CO₂含NA个分子','白磷P₄含6个P-P键'));models.push(m('盐类水解','principle','盐的离子与水反应','判断酸碱性；写水解方程式','NaHCO₃水解显碱性','双水解反应'));models.push(m('沉淀溶解平衡','principle','难溶电解质建立平衡','Ksp表达式；溶度积规则','Ksp(AgCl)>Ksp(AgI)先沉淀AgI','Ksp只比较同类型难溶物'));models.push(m('盖斯定律','principle','利用已知反应计算焓变','写出目标反应；用已知反应线性组合','注意反应方向变号','系数和方向要对应'));models.push(m('化学速率计算','principle','计算反应速率','v=Δc/Δt；浓度-时间图分析','v(A)=2v(B)','速率之比等于计量数之比'));return models;},

    _buildBiologyModels:function(){var models=[];var m=function(n,c,f,a,e,v){return{name:n,category:c,features:f,approach:a,example:e||'',variation:v||''};};models.push(m('孟德尔遗传比例','genetics','分离定律3:1，自由组合9:3:3:1','判断显隐性；写基因型；计算比例','Aa×Aa→3:1','致死基因改变比例'));models.push(m('伴性遗传','genetics','基因位于性染色体','判断遗传方式；写基因型；计算概率','色盲携带者女性：儿子50%色盲','注意X染色体失活'));models.push(m('遗传系谱图分析','genetics','根据系谱图判断遗传方式','先判显隐；再判常/伴性','无中生有为隐性','外显率不全'));models.push(m('DNA复制计算','genetics','计算标记DNA比例','半保留复制；n次复制后含¹⁵N占2/2ⁿ','复制3次含¹⁵N占1/4','区分DNA数和单链数'));models.push(m('基因表达计算','genetics','计算转录翻译产物','DNA碱基:mRNA碱基:氨基酸=6:3:1','n个碱基DNA→n/3个氨基酸','注意起始和终止密码子'));models.push(m('光合作用曲线分析','metabolism','分析因素对光合速率的影响','识别关键点；分析限制因素','光补偿点：净光合=0','净光合与总光合区别'));models.push(m('呼吸作用计算','metabolism','计算有氧呼吸物质变化','三阶段分别计算','1mol葡萄糖有氧呼吸约30-32ATP','无氧呼吸只在第一阶段产ATP'));models.push(m('细胞分裂图像判断','cell','判断分裂各时期','看染色体数；看同源染色体；看四分体','减Ⅱ后期：无同源染色体','二倍体vs单倍体'));models.push(m('质壁分离','cell','植物细胞渗透作用','外界浓度>细胞液→失水分离','0.3g/mL蔗糖溶液','高浓度导致死亡不能复原'));models.push(m('能量流动','ecology','计算各营养级能量传递','传递效率10-20%','10000kJ→1000-2000kJ','传递效率针对营养级'));models.push(m('种群增长','ecology','J型和S型增长','J型：Nt=N₀λᵗ；S型：K/2增长最快','渔业捕捞维持在K/2以上','K值随环境变化'));models.push(m('免疫调节','cell','体液免疫和细胞免疫','B细胞→抗体；T细胞→效应T细胞','二次免疫更快更强','效应T细胞使靶细胞裂解'));return models;},

    buildPeriodicTable:function(){this.periodicTable={elements:[{z:1,sym:'H',name:'氢',mass:1.008,group:1,period:1,config:'1s¹',en:2.20,ar:25,ie1:1312,cat:'nonmetal'},{z:2,sym:'He',name:'氦',mass:4.003,group:18,period:1,config:'1s²',en:null,ar:31,ie1:2372,cat:'noble'},{z:3,sym:'Li',name:'锂',mass:6.941,group:1,period:2,config:'[He]2s¹',en:0.98,ar:145,ie1:520,cat:'alkali'},{z:4,sym:'Be',name:'铍',mass:9.012,group:2,period:2,config:'[He]2s²',en:1.57,ar:105,ie1:900,cat:'alkaline'},{z:5,sym:'B',name:'硼',mass:10.81,group:13,period:2,config:'[He]2s²2p¹',en:2.04,ar:85,ie1:801,cat:'metalloid'},{z:6,sym:'C',name:'碳',mass:12.01,group:14,period:2,config:'[He]2s²2p²',en:2.55,ar:70,ie1:1086,cat:'nonmetal'},{z:7,sym:'N',name:'氮',mass:14.01,group:15,period:2,config:'[He]2s²2p³',en:3.04,ar:65,ie1:1402,cat:'nonmetal'},{z:8,sym:'O',name:'氧',mass:16.00,group:16,period:2,config:'[He]2s²2p⁴',en:3.44,ar:60,ie1:1314,cat:'nonmetal'},{z:9,sym:'F',name:'氟',mass:19.00,group:17,period:2,config:'[He]2s²2p⁵',en:3.98,ar:50,ie1:1681,cat:'halogen'},{z:10,sym:'Ne',name:'氖',mass:20.18,group:18,period:2,config:'[He]2s²2p⁶',en:null,ar:38,ie1:2081,cat:'noble'},{z:11,sym:'Na',name:'钠',mass:22.99,group:1,period:3,config:'[Ne]3s¹',en:0.93,ar:180,ie1:496,cat:'alkali'},{z:12,sym:'Mg',name:'镁',mass:24.31,group:2,period:3,config:'[Ne]3s²',en:1.31,ar:150,ie1:738,cat:'alkaline'},{z:13,sym:'Al',name:'铝',mass:26.98,group:13,period:3,config:'[Ne]3s²3p¹',en:1.61,ar:125,ie1:578,cat:'metal'},{z:14,sym:'Si',name:'硅',mass:28.09,group:14,period:3,config:'[Ne]3s²3p²',en:1.90,ar:110,ie1:786,cat:'metalloid'},{z:15,sym:'P',name:'磷',mass:30.97,group:15,period:3,config:'[Ne]3s²3p³',en:2.19,ar:100,ie1:1012,cat:'nonmetal'},{z:16,sym:'S',name:'硫',mass:32.07,group:16,period:3,config:'[Ne]3s²3p⁴',en:2.58,ar:100,ie1:1000,cat:'nonmetal'},{z:17,sym:'Cl',name:'氯',mass:35.45,group:17,period:3,config:'[Ne]3s²3p⁵',en:3.16,ar:100,ie1:1251,cat:'halogen'},{z:18,sym:'Ar',name:'氩',mass:39.95,group:18,period:3,config:'[Ne]3s²3p⁶',en:null,ar:71,ie1:1521,cat:'noble'},{z:19,sym:'K',name:'钾',mass:39.10,group:1,period:4,config:'[Ar]4s¹',en:0.82,ar:220,ie1:419,cat:'alkali'},{z:20,sym:'Ca',name:'钙',mass:40.08,group:2,period:4,config:'[Ar]4s²',en:1.00,ar:180,ie1:590,cat:'alkaline'},{z:26,sym:'Fe',name:'铁',mass:55.85,group:8,period:4,config:'[Ar]3d⁶4s²',en:1.83,ar:140,ie1:762,cat:'transition'},{z:29,sym:'Cu',name:'铜',mass:63.55,group:11,period:4,config:'[Ar]3d¹⁰4s¹',en:1.90,ar:135,ie1:745,cat:'transition'},{z:30,sym:'Zn',name:'锌',mass:65.38,group:12,period:4,config:'[Ar]3d¹⁰4s²',en:1.65,ar:135,ie1:906,cat:'transition'},{z:35,sym:'Br',name:'溴',mass:79.90,group:17,period:4,config:'[Ar]3d¹⁰4s²4p⁵',en:2.96,ar:115,ie1:1140,cat:'halogen'},{z:36,sym:'Kr',name:'氪',mass:83.80,group:18,period:4,config:'[Ar]3d¹⁰4s²4p⁶',en:3.00,ar:88,ie1:1351,cat:'noble'}],render:function(cid){var c=document.getElementById(cid);if(!c)return;var h='<div data-style="overflow-x:auto;"><div data-style="display:grid;grid-template-columns:repeat(18,58px);gap:2px;min-width:1060px;">';var g=new Array(18*7).fill(null);this.elements.forEach(function(el){var idx=(el.period-1)*18+(el.group-1);if(idx<g.length)g[idx]=el;});for(var i=0;i<7*18;i++){var el=g[i];if(el){var bg='#fff';if(el.cat==='alkali')bg='#e8f5e9';else if(el.cat==='alkaline')bg='#e3f2fd';else if(el.cat==='transition')bg='#fff3e0';else if(el.cat==='nonmetal')bg='#fce4ec';else if(el.cat==='halogen')bg='#e8eaf6';else if(el.cat==='noble')bg='#f3e5f5';else if(el.cat==='metalloid')bg='#efebe9';else bg='#f5f5f5';h+='<div data-style="background:'+bg+';padding:4px;border-radius:4px;text-align:center;cursor:pointer;border:1px solid #ddd;font-size:0.7rem;" data-call=\"ContentEnhancer.showElementDetail\" data-arg1=\"@n:'+el.z+'" title="'+el.name+'">';h+='<div data-style="font-size:0.6rem;color:#999;">'+el.z+'</div>';h+='<div data-style="font-weight:bold;font-size:0.9rem;">'+el.sym+'</div>';h+='<div data-style="font-size:0.55rem;color:#666;">'+el.mass.toFixed(el.mass<10?3:2)+'</div>';h+='</div>';}else{h+='<div data-style="padding:4px;"></div>';}}h+='</div></div><div id="element-detail" data-style="margin-top:20px;"></div>';c.innerHTML=h;},showElement:function(z){var el=this.elements.find(function(e){return e.z===z;});if(!el)return;var d=document.getElementById('element-detail');if(!d)return;var h='<div class="knowledge-card"><h4>'+el.sym+' '+el.name+' (Z='+el.z+')</h4><div data-style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">';h+='<div class="key-point">原子序数：'+el.z+'</div>';h+='<div class="key-point">相对原子质量：'+el.mass+'</div>';h+='<div class="key-point">电子排布：'+el.config+'</div>';h+='<div class="key-point">原子半径：'+el.ar+'pm</div>';if(el.en)h+='<div class="key-point">电负性：'+el.en+'</div>';h+='<div class="key-point">第一电离能：'+el.ie1+'kJ/mol</div>';h+='</div></div>';d.innerHTML=h;}};},

    buildChemistryEquations:function(){this.chemistryEquations={inorganic:[{eq:'2Na+2H₂O→2NaOH+H₂↑',type:'置换',cat:'碱金属'},{eq:'2Na₂O₂+2H₂O→4NaOH+O₂↑',type:'歧化',cat:'碱金属'},{eq:'2Na₂O₂+2CO₂→2Na₂CO₃+O₂',type:'歧化',cat:'碱金属'},{eq:'2Al+2NaOH+2H₂O→2NaAlO₂+3H₂↑',type:'置换',cat:'铝'},{eq:'Al₂O₃+2NaOH→2NaAlO₂+H₂O',type:'复分解',cat:'铝'},{eq:'Al(OH)₃+NaOH→NaAlO₂+2H₂O',type:'复分解',cat:'铝'},{eq:'2Fe+3Cl₂→2FeCl₃',type:'化合',cat:'铁'},{eq:'3Fe+2O₂→Fe₃O₄',type:'化合',cat:'铁'},{eq:'2FeCl₂+Cl₂→2FeCl₃',type:'氧化还原',cat:'铁'},{eq:'2FeCl₃+Fe→3FeCl₂',type:'氧化还原',cat:'铁'},{eq:'Cu+4HNO₃(浓)→Cu(NO₃)₂+2NO₂↑+2H₂O',type:'氧化还原',cat:'铜'},{eq:'3Cu+8HNO₃(稀)→3Cu(NO₃)₂+2NO↑+4H₂O',type:'氧化还原',cat:'铜'},{eq:'Cl₂+2NaOH→NaCl+NaClO+H₂O',type:'歧化',cat:'卤素'},{eq:'MnO₂+4HCl(浓)→MnCl₂+Cl₂↑+2H₂O',type:'氧化还原',cat:'卤素'},{eq:'2KMnO₄+16HCl→2KCl+2MnCl₂+5Cl₂↑+8H₂O',type:'氧化还原',cat:'卤素'},{eq:'SO₂+2NaOH→Na₂SO₃+H₂O',type:'复分解',cat:'硫'},{eq:'2SO₂+O₂⇌2SO₃',type:'催化氧化',cat:'硫'},{eq:'Cu+2H₂SO₄(浓)→CuSO₄+SO₂↑+2H₂O',type:'氧化还原',cat:'硫'},{eq:'4NH₃+5O₂→4NO+6H₂O',type:'催化氧化',cat:'氮'},{eq:'Na₂CO₃+2HCl→2NaCl+H₂O+CO₂↑',type:'复分解',cat:'盐'},{eq:'NaHCO₃+HCl→NaCl+H₂O+CO₂↑',type:'复分解',cat:'盐'},{eq:'2NaHCO₃→Na₂CO₃+H₂O+CO₂↑',type:'分解',cat:'盐'},{eq:'SiO₂+2NaOH→Na₂SiO₃+H₂O',type:'复分解',cat:'硅'},{eq:'2NaCl+2H₂O→2NaOH+H₂↑+Cl₂↑',type:'电解',cat:'电解'},{eq:'2Al₂O₃(熔融)→4Al+3O₂↑',type:'电解',cat:'电解'}],organic:[{eq:'CH₄+Cl₂→CH₃Cl+HCl(光照)',type:'取代',cat:'烷烃'},{eq:'CH₂=CH₂+Br₂→CH₂BrCH₂Br',type:'加成',cat:'烯烃'},{eq:'CH₂=CH₂+H₂O→CH₃CH₂OH',type:'加成',cat:'烯烃'},{eq:'nCH₂=CH₂→[CH₂-CH₂]ₙ',type:'加聚',cat:'烯烃'},{eq:'C₆H₆+Br₂→C₆H₅Br+HBr(FeBr₃)',type:'取代',cat:'芳香烃'},{eq:'C₂H₅OH+3O₂→2CO₂+3H₂O',type:'燃烧',cat:'醇'},{eq:'2C₂H₅OH+2Na→2C₂H₅ONa+H₂↑',type:'置换',cat:'醇'},{eq:'C₂H₅OH+O₂→CH₃CHO+H₂O(Cu)',type:'催化氧化',cat:'醇'},{eq:'CH₃CHO+2Cu(OH)₂→CH₃COOH+Cu₂O↓+2H₂O',type:'氧化',cat:'醛'},{eq:'CH₃COOH+C₂H₅OH⇌CH₃COOC₂H₅+H₂O',type:'酯化',cat:'酸'},{eq:'CH₃COOCH₃+NaOH→CH₃COONa+CH₃OH',type:'水解',cat:'酯'},{eq:'C₂H₅Cl+NaOH(醇)→CH₂=CH₂+NaCl+H₂O',type:'消去',cat:'卤代烃'},{eq:'C₂H₅Cl+NaOH(水)→C₂H₅OH+NaCl',type:'水解',cat:'卤代烃'},{eq:'(C₆H₁₀O₅)ₙ+nH₂O→nC₆H₁₂O₆',type:'水解',cat:'糖类'},{eq:'C₆H₁₂O₆→2C₂H₅OH+2CO₂',type:'分解',cat:'糖类'}]};},

    buildChemistryStructure:function(){this.chemistryStructure={sections:[{title:'离子晶体',content:'由阴、阳离子通过离子键结合。特点：熔沸点高、硬度大、溶于水(多数)、熔融导电。NaCl型配位数6:6；CsCl型配位数8:8。离子半径越小、电荷数越多→熔点越高'},{title:'共价晶体(原子晶体)',content:'所有原子通过共价键连接形成空间网状结构。特点：熔沸点极高、硬度极大、不溶于常见溶剂、不导电。典型：金刚石、SiO₂、SiC。键越短越强→熔点越高'},{title:'分子晶体',content:'分子通过分子间作用力结合。特点：熔沸点低。氢键使熔沸点异常偏高(H₂O>H₂S)'},{title:'金属晶体',content:'金属阳离子和自由电子通过金属键结合。特点：导电导热、延展性、金属光泽'},{title:'金属性与非金属性判断',content:'金属性：①与水/酸反应剧烈程度；②最高价氧化物水化物碱性；③置换反应。非金属性：①与H₂化合难易；②气态氢化物稳定性；③最高价含氧酸酸性'},{title:'极性键与非极性键',content:'非极性键：同种元素原子间(Cl-Cl)。极性键：不同元素原子间(H-Cl)。电负性差值越大极性越强'},{title:'电负性',content:'原子在化合物中吸引电子的能力。F(3.98)>O(3.44)>Cl(3.16)>N(3.04)。同周期递增，同族递减'},{title:'原子半径',content:'同周期递减(稀有气体除外)，同族递增。半径越小→电负性越大→非金属性越强'},{title:'键能',content:'气态基态原子形成1mol化学键释放的能量。键能越大→键越牢固→分子越稳定。N≡N(946)>>O=O(498)>>F-F(159)'},{title:'第一电离能',content:'气态基态原子失去第一个电子所需最小能量。同周期总体递增，但IIA>IIIA(s²p⁰稳定)，VA>VIA(s²p³半满稳定)。Be>B, N>O, Mg>Al, P>S'},{title:'键角',content:'sp杂化→180°(直线)；sp²→120°(平面三角形)；sp³→109°28\'(正四面体)。孤电子对压缩键角：H₂O(104.5°)<NH₃(107°)<CH₄(109°28\')'}]};},

    buildChemistryExperiments:function(){this.chemistryExperiments={safety:[{category:'风险识别',items:['浓硫酸：强腐蚀性，遇水剧烈放热','钠：遇水剧烈反应，保存在煤油中','白磷：自燃，保存在水中','液溴：易挥发有毒，棕色瓶水封']},{category:'防护措施',items:['穿实验服、戴护目镜','闻气体用扇闻法','稀释浓硫酸酸入水','加热试管口不对人']},{category:'应急处理',items:['酸沾皮肤：大量水冲洗→3-5%NaHCO₃','碱沾皮肤：大量水冲洗→稀硼酸','酒精灯打翻着火：湿布盖灭','误服酸：口服Mg(OH)₂乳剂']}],separation:[{method:'过滤',principle:'利用溶解性差异',scope:'不溶固体与液体'},{method:'蒸馏',principle:'利用沸点差异',scope:'沸点差>30°C的液体'},{method:'萃取分液',principle:'利用溶解度差异',scope:'溶质在两相中溶解度差大'},{method:'蒸发结晶',principle:'加热蒸发溶剂',scope:'溶解度随温度变化小'},{method:'冷却结晶',principle:'降温析出',scope:'溶解度随温度变化大'}],titration:[{type:'酸碱中和滴定',principle:'c₁V₁=c₂V₂',steps:'检漏→润洗→装液→调零→取液→加指示剂→滴定→读数'},{type:'氧化还原滴定',principle:'利用氧化还原反应',steps:'类似中和滴定，用特定指示剂'}],instruments:[{name:'容量瓶',usage:'配制一定浓度溶液',notes:'不能加热，不能在瓶中溶解固体'},{name:'滴定管',usage:'中和滴定',notes:'读数估读到0.01mL'},{name:'分液漏斗',usage:'萃取分液',notes:'下层从下口放出，上层从上口倒出'},{name:'蒸馏烧瓶',usage:'蒸馏',notes:'加碎瓷片防暴沸'}],storage:[{substance:'钠',method:'保存在煤油中',reason:'防止与O₂和H₂O反应'},{substance:'白磷',method:'保存在水中',reason:'防止自燃'},{substance:'浓硝酸',method:'棕色瓶阴凉处',reason:'见光分解'},{substance:'NaOH溶液',method:'橡胶塞试剂瓶',reason:'与玻璃中SiO₂反应粘结'},{substance:'氢氟酸',method:'塑料瓶',reason:'腐蚀玻璃'}]};},

    buildChemistryReactionPrinciples:function(){this.chemistryReactionPrinciples={rate:{factors:['浓度：增大反应物浓度→速率增大(固体纯液体除外)','温度：升高温度→速率增大(每升高10°C速率增大2-4倍)','催化剂：降低活化能→速率增大，同等程度加快正逆反应','接触面积：增大固体表面积→速率增大','压强：增大压强(缩小体积)→浓度增大→速率增大'],calculation:'v=Δc/Δt'},equilibrium:{establishment:'正反应速率=逆反应速率，各组分浓度不再变化',leChatelier:'改变条件，平衡向减弱这种改变的方向移动',calculation:'K=cᵈ·cᴱ/(cᴬ·cᴮ)，只与温度有关',charts:['浓度-时间图：判断平衡到达时刻','速率-时间图：判断平衡移动方向','温度-转化率图：判断反应热','压强-转化率图：判断气体分子数变化']},problemTypes:[{type:'工艺流程大题',strategy:'①读标题确定产品；②分析每步操作目的；③常考操作答题模板；④注意循环物质和绿色化学'},{type:'有机合成推断大题',strategy:'①从产物逆推；②利用特征反应确定官能团；③注意官能团保护；④注意反应条件'}]};},

    buildBiologyGenetics:function(){this.biologyGenetics={humanDiseases:[{disease:'白化病',type:'常染色体隐性',analysis:'携带者(Aa)表型正常，患者(aa)不能合成黑色素'},{disease:'苯丙酮尿症',type:'常染色体隐性',analysis:'患者不能将苯丙氨酸转化为酪氨酸'},{disease:'红绿色盲',type:'X染色体隐性',analysis:'女性携带者表型正常，男性患者不能传给儿子'},{disease:'血友病',type:'X染色体隐性',analysis:'凝血因子缺乏'},{disease:'抗维生素D佝偻病',type:'X染色体显性',analysis:'女性患者多于男性'},{disease:'并指症',type:'常染色体显性',analysis:'患者后代患病概率1/2'}],pedigreeAnalysis:{steps:['第一步：判断显隐性——无中生有为隐性，有中生无为显性','第二步：判断常/伴性——隐性看女病，其父/子正常→常染色体','第三步：写出各个体基因型','第四步：计算概率']},electronTransportChain:{aerobicRespiration:'有氧呼吸电子传递链：NADH/FADH₂→复合体I/II→CoQ→III→Cyt c→IV→O₂→H₂O。1NADH≈2.5ATP，1FADH₂≈1.5ATP',photosynthesis:'光系统电子传递：PSII(P680)→PQ→Cyt b₆f→PC→PSI(P700)→Fd→FNR→NADPH。水的光解在PSII处发生'},c3c4cam:{c3:'C₃植物(水稻、小麦)：CO₂通过Rubisco固定为C₃，光呼吸损失显著',c4:'C₄植物(玉米、甘蔗)：PEP羧化酶高效固定CO₂→C₄→维管束鞘细胞释放CO₂→卡尔文循环',cam:'CAM植物(仙人掌)：夜间固定CO₂→苹果酸储存；白天释放CO₂供卡尔文循环',photorespiration:'光呼吸：O₂竞争Rubisco，催化RuBP加氧→磷酸乙醇酸→释放CO₂，消耗能量不产生ATP'},photosynthesisRate:{measurement:'净光合速率=光照下CO₂吸收量；呼吸速率=黑暗中CO₂释放量；真正光合速率=净光合+呼吸',discrimination:'注意区分：真正光合vs净光合；CO₂吸收量vs释放量；有机物积累量vs制造量'}};},

    buildBiologyCellMetabolism:function(){this.biologyCellMetabolism={electronTransportChain:{aerobic:'有氧呼吸电子传递链：NADH/FADH₂→复合体I/II→CoQ→III→Cyt c→IV→O₂→H₂O。每对电子泵出质子：I(4个)、III(4个)、IV(2个)。质子梯度驱动ATP合成',photosynthetic:'光系统电子传递：PSII(P680)→PQ→Cyt b₆f→PC→PSI(P700)→Fd→FNR→NADPH。Z型途径'},c3c4cam:{comparison:[{feature:'CO₂固定酶',c3:'Rubisco',c4:'PEP羧化酶+Rubisco',cam:'PEP羧化酶+Rubisco'},{feature:'CO₂固定产物',c3:'C₃(3-磷酸甘油酸)',c4:'C₄(草酰乙酸)',cam:'苹果酸'},{feature:'卡尔文循环场所',c3:'叶肉细胞叶绿体',c4:'维管束鞘细胞叶绿体',cam:'叶肉细胞叶绿体'},{feature:'光呼吸',c3:'显著(损失20-50%)',c4:'极低',cam:'极低'},{feature:'代表植物',c3:'水稻、小麦',c4:'玉米、甘蔗',cam:'仙人掌、菠萝'}],photorespiration:'光呼吸机制：O₂与CO₂竞争Rubisco→RuBP+O₂→磷酸乙醇酸→在三个细胞器中代谢→释放CO₂'},rateMeasurement:{methods:['红外线CO₂分析仪法','氧电极法','半叶法','密闭容器法'],formulas:'真正光合速率(Pg) = 净光合速率(Pn) + 呼吸速率(R)'}};},

    buildPhysicsAtomic:function(){this.physicsAtomic={nuclearPhysics:{knowledge:['原子核由质子和中子组成，质子数=原子序数=核电荷数=核外电子数','结合能：将原子核拆散为自由核子所需能量。比结合能越大，核越稳定','质量亏损：组成原子核的核子质量之和大于原子核质量','质能方程：E=mc²，ΔE=Δmc²，1u=931.5MeV','核裂变：重核分裂为中等质量核，释放能量','核聚变：轻核聚合为较重核，释放更多能量','半衰期：放射性元素半数原子核衰变所需时间，统计规律'],conclusions:['α衰变：质量数-4，电荷数-2','β衰变：质量数不变，电荷数+1','γ衰变：伴随α或β衰变，质量数和电荷数都不变','核反应遵循质量数守恒和电荷数守恒','比结合能曲线：中等质量核(Fe附近)最稳定']},atomicStructure:{models:[{name:'汤姆孙枣糕模型',year:1897,description:'原子是带正电的球体，电子镶嵌其中'},{name:'卢瑟福核式结构模型',year:1911,description:'α粒子散射实验，原子中心有很小的原子核'},{name:'玻尔量子化轨道模型',year:1913,description:'电子在特定轨道上运动不辐射能量，跃迁时辐射或吸收光子'},{name:'量子力学电子云模型',year:1926,description:'电子没有确定轨道，用概率描述分布'}]},waveParticleDuality:{knowledge:['光的波粒二象性：波动性(干涉、衍射)和粒子性(光电效应)','个别光子显粒子性，大量光子显波动性','德布罗意物质波：λ=h/(mv)，一切实物粒子都有波动性','海森堡不确定性原理：ΔxΔp≥h/(4π)'],conclusions:['光电效应四条规律：①存在截止频率；②Ek与ν成线性关系；③光强影响光电子数目；④瞬时性','Ek-ν图像：斜率为h，横轴截距为ν₀','光电效应方程：Ek=hν-W₀']}};},

    buildPhysicsExperiments:function(){this.physicsExperiments={instruments:[{name:'游标卡尺',precision:'0.1mm(10分度)/0.05mm(20分度)/0.02mm(50分度)',reading:'主尺读数+游标尺对齐格数×精度',estimation:'不估读'},{name:'螺旋测微器',precision:'0.01mm',reading:'固定刻度+可动刻度(含估读)×0.01mm',estimation:'需估读到0.001mm'},{name:'电压表',precision:'取决于量程和分度值',reading:'按分度值读数+估读',estimation:'估读到分度值的1/10'},{name:'电流表',precision:'取决于量程和分度值',reading:'按分度值读数+估读',estimation:'估读到分度值的1/10'},{name:'多用电表(欧姆挡)',precision:'中值电阻处最精确',reading:'读数×倍率',estimation:'不估读'}],meterModification:{voltmeter:'电流表串联大电阻：R串=(n-1)Rg',ammeter:'电流表并联小电阻：R并=Rg/(n-1)',internalMethod:'内接法：R测=R真+R_A，适合大电阻(Rx>>RA)',externalMethod:'外接法：R测=R真//R_V，适合小电阻(Rx<<RV)',criterion:'若RV/Rx>Rx/RA用外接法，否则用内接法'},mechanicsExperiments:[{name:'验证力的平行四边形定则',principle:'等效替代法',errorAnalysis:'弹簧测力计不平行纸面'},{name:'探究加速度与力、质量的关系',principle:'控制变量法',errorAnalysis:'未平衡摩擦力或不满足M>>m'},{name:'验证机械能守恒定律',principle:'自由落体中½mv²=mgh',errorAnalysis:'空气阻力使动能增加量略小于势能减少量'},{name:'验证动量守恒定律',principle:'m₁v₁+m₂v₂=m₁v₁\'+m₂v₂\'',errorAnalysis:'斜槽末端不水平'}],electricityExperiments:[{name:'测定金属的电阻率',principle:'R=ρl/S，伏安法测R',errorAnalysis:'内接法适合大电阻，外接法适合小电阻'},{name:'描绘小灯泡伏安特性曲线',principle:'分压法测U-I曲线',errorAnalysis:'必须用分压法，电流表外接'},{name:'测定电源电动势和内阻',principle:'E=U+Ir',errorAnalysis:'安培表内接使r测偏大'},{name:'练习使用多用电表',principle:'欧姆挡内部有电源',errorAnalysis:'换挡后重新调零'}],opticsExperiments:[{name:'测定玻璃的折射率',principle:'n=sin i/sin r',errorAnalysis:'入射角不宜太大或太小'},{name:'用双缝干涉测光的波长',principle:'λ=Δx·d/L',errorAnalysis:'测量n条条纹间距取平均'}],thermalExperiments:[{name:'用油膜法估测分子大小',principle:'d=V/S(单分子油膜)',errorAnalysis:'油膜未完全展开'}]};},

    _buildPhysicsKnowledge:function(){var _kp=this._kp,_cm=this._cm,_card=this._card;var h='<div class="knowledge-section"><h3>📚 高中物理知识点大全</h3>';h+=_card('第一章 运动的描述',_kp('质点','忽略物体大小和形状，将物体看作有质量的点')+_kp('参考系','为描述物体运动而选作标准的另外的物体')+_kp('位移','描述位置变化的矢量，从初位置指向末位置的有向线段')+_kp('速度','v=Δx/Δt，描述运动快慢和方向的矢量')+_kp('加速度','a=Δv/Δt，描述速度变化快慢的矢量，方向与合外力方向相同')+_cm('混淆位移与路程、速度与速率'));h+=_card('第二章 匀变速直线运动',_kp('公式','v=v₀+at；x=v₀t+½at²；v²-v₀²=2ax；x=(v₀+v)t/2')+_kp('逐差法','a=(x₄+x₅+x₆-x₁-x₂-x₃)/(9T²)')+_kp('自由落体','v=gt，h=½gt²')+_kp('竖直上抛','v=v₀-gt，h=v₀t-½gt²，H=v₀²/(2g)')+_cm('竖直上抛全程法：取向上为正，a=-g'));h+=_card('第三章 相互作用与力',_kp('重力','G=mg，方向竖直向下')+_kp('弹力','胡克定律F=kx')+_kp('摩擦力','滑动f=μN；静摩擦0<f≤f_max')+_kp('力的合成与分解','平行四边形定则，|F₁-F₂|≤F≤F₁+F₂')+_cm('摩擦力不一定是阻力'));h+=_card('第四章 牛顿运动定律',_kp('第一定律','力不是维持运动的原因')+_kp('第二定律','F=ma，瞬时对应关系')+_kp('第三定律','作用力与反作用力等大反向异体同性质')+_kp('超重失重','超重a向上，失重a向下，完全失重a=g')+_cm('超重失重与运动方向无关，只与加速度方向有关'));h+=_card('第五章 曲线运动',_kp('条件','合外力方向与速度方向不共线')+_kp('平抛运动','x=v₀t，y=½gt²，t=√(2h/g)')+_kp('圆周运动','v=2πr/T，a=v²/r=ω²r，F=mv²/r')+_kp('竖直面圆周','绳模型v_min=√(gR)，杆模型v_min=0')+_cm('向心力不是独立的力'));h+=_card('第六章 万有引力',_kp('万有引力定律','F=GMm/r²')+_kp('天体质量','M=4π²r³/(GT²)')+_kp('宇宙速度','v₁≈7.9km/s，最小发射速度、最大环绕速度')+_kp('变轨','低→高需加速，轨道越高速度越小但机械能越大')+_cm('轨道越高线速度越小v=√(GM/r)'));h+=_card('第七章 机械能',_kp('功','W=Flcosα')+_kp('动能定理','W合=½mv²-½mv₀²')+_kp('机械能守恒','只有重力或弹力做功时Ek₁+Ep₁=Ek₂+Ep₂')+_kp('功能关系','重力做功→势能变化；合外力做功→动能变化')+_cm('摩擦力做功与路径有关'));h+=_card('第八章 动量',_kp('动量定理','I=Δp，FΔt=Δp')+_kp('动量守恒','合外力为零时m₁v₁+m₂v₂=m₁v₁\'+m₂v₂\'')+_kp('碰撞分类','弹性/非弹性/完全非弹性')+_cm('完全非弹性碰撞动能损失最大但动量守恒'));h+=_card('第九章 静电场',_kp('库仑定律','F=kq₁q₂/r²')+_kp('电场强度','E=F/q，E=kQ/r²，E=U/d')+_kp('电势','φ=Ep/q，沿电场线方向电势降低')+_kp('电容','C=Q/U，C=εS/(4πkd)')+_cm('电场强度与电势无直接关系'));h+=_card('第十章 电路',_kp('欧姆定律','I=U/R，I=E/(R+r)')+_kp('路端电压','U=E-Ir')+_kp('电功率','P=UI，纯电阻Q=I²Rt')+_cm('非纯电阻电路中欧姆定律不适用'));h+=_card('第十一章 磁场',_kp('安培力','F=BILsinθ，左手定则')+_kp('洛伦兹力','F=qvBsinθ，不做功')+_kp('圆周运动','r=mv/(qB)，T=2πm/(qB)')+_cm('洛伦兹力不做功：力⊥速度'));h+=_card('第十二章 电磁感应',_kp('法拉第定律','E=nΔΦ/Δt，E=BLv')+_kp('楞次定律','增反减同')+_kp('自感','E=LΔI/Δt，阻碍电流变化')+_kp('交流电','e=Emsinωt，有效值U=Um/√2')+_kp('变压器','U₁/U₂=n₁/n₂，P₁=P₂')+_cm('有效值根据热效应定义'));h+=_card('第十三章 光学',_kp('折射','n=sin i/sin r，n=c/v')+_kp('全反射','光密→光疏且i≥C，sin C=1/n')+_kp('干涉','双缝Δx=λL/d')+_kp('衍射','缝宽与波长相当或更小')+_kp('偏振','横波特有现象')+_cm('全反射两个条件缺一不可'));h+=_card('第十四章 热学',_kp('分子动理论','大量分子+无规则运动+分子力')+_kp('内能','所有分子动能和势能的总和，与温度、体积有关')+_kp('热力学定律','ΔU=Q+W；第二定律：热量自发高温→低温')+_kp('理想气体','PV/T=恒量')+_cm('理想气体内能只与温度有关'));h+=_card('第十五章 振动与波',_kp('简谐运动','F=-kx，x=Asin(ωt+φ)')+_kp('单摆','T=2π√(l/g)')+_kp('共振','驱动力频率=固有频率时振幅最大')+_kp('波速','v=λf，波速由介质决定')+_kp('多普勒效应','靠近→频率升高，远离→频率降低')+_cm('波速≠质点振动速度'));h+=_card('第十六章 原子物理',_kp('玻尔理论','定态+跃迁+轨道量子化，Eₙ=-13.6/n²eV')+_kp('天然放射','α(⁴₂He)、β(⁰₋₁e)、γ(光子)')+_kp('半衰期','m=m₀(1/2)^(t/T)，统计规律')+_kp('核反应','质量数守恒+电荷数守恒')+_kp('光电效应','Ek=hν-W₀，极限频率ν₀=W₀/h')+_kp('波粒二象性','个别光子粒子性，大量光子波动性')+_kp('物质波','λ=h/(mv)')+_cm('光电效应中最大初动能与光强无关'));h+='</div>';return h;},
    _buildChemistryKnowledge:function(){var _kp=this._kp,_cm=this._cm,_card=this._card;var h='<div class="knowledge-section"><h3>📚 高中化学知识点大全</h3>';h+=_card('化学计量与基本概念',_kp('物质的量','n=N/NA=m/M=V/Vm')+_kp('气体摩尔体积','标况下22.4L/mol，仅适用于标况气体')+_kp('配制溶液','计算→称量→溶解→冷却→转移→洗涤→定容→摇匀')+_kp('浓度换算','c=1000ρω/M，质量分数与物质的量浓度互换')+_cm('22.4L/mol仅适用于标况气体'));h+=_card('离子反应',_kp('电解质','酸碱盐为电解质，蔗糖酒精为非电解质')+_kp('离子方程式','写→拆→删→查')+_kp('离子共存','看颜色、看酸碱性、看氧化还原、看复分解')+_cm('弱电解质/沉淀/气体不拆'));h+=_card('氧化还原反应',_kp('基本概念','氧化剂得电子被还原，还原剂失电子被氧化')+_kp('配平方法','化合价升降法、电子守恒法')+_kp('歧化与归中','同种元素不同价态的反应规律')+_cm('同种元素不同价态：价态归中不交叉'));h+=_card('化学反应速率与平衡',_kp('反应速率','v=Δc/Δt，mol/(L·s)或mol/(L·min)')+_kp('影响因素','浓度、温度、催化剂、接触面积、压强')+_kp('勒夏特列原理','平衡向减弱改变的方向移动')+_kp('化学平衡','逆、等、动、定、变')+_kp('平衡常数K','K只与温度有关')+_cm('催化剂不使平衡移动'));h+=_card('电解质溶液',_kp('水的电离','Kw=[H⁺][OH⁻]=10⁻¹⁴(25℃)，促进水电离：升温、加酸碱、加能水解的盐')+_kp('pH计算','pH=-lg[H⁺]，稀释规律')+_kp('盐类水解','谁弱谁水解，谁强显谁性')+_kp('酸碱中和滴定','c₁V₁=c₂V₂，指示剂选择：强酸强碱用酚酞或甲基橙')+_cm('盐类水解方程式需用可逆符号'));h+=_card('电化学',_kp('原电池','化学能→电能，负极氧化正极还原')+_kp('电解池','电能→化学能，阳极氧化阴极还原')+_kp('放电顺序','阳极：Cl⁻>OH⁻>含氧酸根；阴极：Ag⁺>Cu²⁺>H⁺')+_kp('金属防护','牺牲阳极、外加电流、改变金属结构')+_cm('原电池正极和电解池阴极都是还原反应'));h+=_card('物质结构与元素周期律',_kp('原子结构','质子数=核外电子数=原子序数，质量数=质子数+中子数')+_kp('同位素','同元素不同中子数的原子，化学性质相同')+_kp('元素周期律','同周期左→右：半径减小、金属性减弱、非金属性增强')+_kp('化学键','离子键、共价键(极性/非极性)、金属键')+_kp('分子间作用力','范德华力和氢键，影响熔沸点')+_cm('H₂O、HF、NH₃因氢键熔沸点反常升高'));h+=_card('常见元素-金属',_kp('钠','银白色，保存在煤油中，Na₂O₂淡黄色，歧化反应放O₂')+_kp('铝','两性金属：Al₂O₃、Al(OH)₃均溶于强酸强碱')+_kp('铁','Fe³⁺用KSCN检验变红，Fe²⁺具有还原性')+_cm('Al与NaOH反应时H₂O是氧化剂'));h+=_card('常见元素-非金属',_kp('氯气','Cl₂+2NaOH→NaCl+NaClO+H₂O(歧化)，HClO漂白性')+_kp('硫','浓硫酸：吸水性、脱水性、强氧化性，Cu+H₂SO₄(浓)→CuSO₄+SO₂↑+2H₂O')+_kp('氮','N₂稳定，NH₃喷泉实验，浓硝酸挥发性强氧化性')+_kp('硅','SiO₂原子晶体，玻璃瓶不能盛NaOH(反应生成Na₂SiO₃)')+_cm('SO₂漂白暂时，HClO漂白永久'));h+=_card('有机化学基础',_kp('甲烷','正四面体，取代反应')+_kp('乙烯','平面结构C=C，加成反应、加聚反应')+_kp('苯','平面正六边形，大π键，能萃取不能加成')+_kp('乙醇','催化氧化→乙醛，酯化反应')+_kp('乙酸','弱酸，酯化反应酸脱羟基醇脱氢')+_cm('酯化反应：酸脱羟基醇脱氢'));h+=_card('生物大分子',_kp('糖类','单糖(葡萄糖果糖)、二糖(蔗糖麦芽糖)、多糖(淀粉纤维素)')+_kp('油脂','植物油不饱和、动物脂肪饱和，均能水解')+_kp('氨基酸','含-NH₂和-COOH，多肽由脱水缩合形成')+_kp('蛋白质','氨基酸通过肽键连接，高温/重金属盐使其变性')+_cm('淀粉和纤维素不互为同分异构体(聚合度n不同)'));h+=_card('化学实验',_kp('安全','酸入水、扇闻法、灯帽盖灭')+_kp('分离提纯','过滤、蒸馏、萃取、结晶')+_kp('离子检验','Cl⁻：AgNO₃+HNO₃；SO₄²⁻：BaCl₂+HCl；Fe³⁺：KSCN变红')+_cm('检验SO₄²⁻先加HCl酸化'));h+='</div>';return h;},
    _buildBiologyKnowledge:function(){var _kp=this._kp,_cm=this._cm,_card=this._card;var h='<div class="knowledge-section"><h3>📚 高中生物知识点大全</h3>';h+=_card('细胞分子组成',_kp('蛋白质','氨基酸通过肽键连接，功能多样')+_kp('核酸','DNA双链(A/T/G/C)+RNA单链(A/U/G/C)')+_kp('糖类','单糖、二糖、多糖')+_kp('脂质','脂肪(储能)、磷脂(膜)、固醇')+_cm('蛋白质多样性：氨基酸种类数目排列顺序空间结构'));h+=_card('细胞结构与功能',_kp('细胞膜','流动镶嵌模型，选择透过性')+_kp('细胞器','线粒体(有氧呼吸)、叶绿体(光合)、核糖体(合成蛋白质)')+_kp('细胞核','遗传信息库，控制中心')+_cm('有膜vs无膜细胞器'));h+=_card('细胞代谢',_kp('酶','蛋白质或RNA，高效性专一性')+_kp('ATP','A-P~P~P，直接能源物质')+_kp('有氧呼吸','三阶段：糖酵解→柠檬酸循环→电子传递链')+_kp('光合作用','光反应(类囊体)+暗反应(基质)')+_cm('光合O₂来自水的光解'));h+=_card('细胞生命历程',_kp('有丝分裂','间期→前→中→后→末')+_kp('减数分裂','减Ⅰ同源分离+减Ⅱ类似有丝')+_kp('分化','基因选择性表达')+_kp('凋亡','基因控制的程序性死亡')+_cm('有丝分裂间期时间最长'));h+=_card('遗传基本规律',_kp('分离定律','等位基因随同源染色体分离(减Ⅰ后期)')+_kp('自由组合定律','非同源染色体非等位基因自由组合')+_kp('伴性遗传','基因位于性染色体')+_kp('系谱分析','先判显隐再判常/伴性')+_cm('伴Y遗传只有男性患病'));h+=_card('遗传分子基础',_kp('DNA复制','半保留复制')+_kp('转录','DNA→mRNA')+_kp('翻译','mRNA→蛋白质(核糖体)')+_kp('中心法则','DNA→DNA/RNA→蛋白质')+_cm('密码子简并性'));h+=_card('变异与进化',_kp('基因突变','碱基对增删换，变异根本来源')+_kp('基因重组','自由组合+交叉互换，变异主要来源')+_kp('现代进化理论','种群进化单位，突变重组原材料，自然选择方向，隔离物种形成必要条件')+_cm('地理隔离不一定导致生殖隔离'));h+=_card('生命活动调节',_kp('神经调节','反射弧：感受器→传入→中枢→传出→效应器')+_kp('体液调节','激素：微量高效、体液运输、靶器官')+_kp('免疫','体液免疫(B→抗体)+细胞免疫(T→效应T细胞)')+_kp('植物激素','生长素两重性、赤霉素、乙烯促成熟')+_cm('突触传递单向'));h+=_card('生态学',_kp('种群','J型Nt=N₀λᵗ，S型有K值')+_kp('能量流动','单向递减，传递效率10-20%')+_kp('物质循环','碳循环：CO₂⇌有机物，全球性')+_cm('传递效率针对营养级非个体'));h+='</div>';return h;},
    _buildPhysicsExamples:function(){return '<div class="examples-section"><h3>📝 物理典型例题</h3>'+this._card('追及问题','甲车20m/s匀速，乙车从静止a=2m/s²追赶，相距100m。½×2t²=100+20t→t≈24.1s。距离最远时v乙=v甲→t=10s')+this._card('连接体问题','m₁=2kg,m₂=3kg，F=10N光滑面。a=F/(m₁+m₂)=2m/s²，T=m₂a=6N')+this._card('圆周临界','绳模型最高点v_min=√(gL)，杆模型v_min=0')+this._card('电磁感应','E=BLv，I=BLv/(R+r)，F安=B²L²v/(R+r)')+'</div>';},
    _buildChemistryExamples:function(){return '<div class="examples-section"><h3>📝 化学典型例题</h3>'+this._card('氧化还原配平','Cu+HNO₃(稀)：Cu升2×3，N降3×2→3Cu+8HNO₃→3Cu(NO₃)₂+2NO+4H₂O')+this._card('原电池','锌铜原电池：负极Zn-2e⁻→Zn²⁺，正极2H⁺+2e⁻→H₂↑')+'</div>';},
    _buildBiologyExamples:function(){return '<div class="examples-section"><h3>📝 生物典型例题</h3>'+this._card('遗传概率','正常夫妇生白化病(aa)儿子→父母Aa，再生正常男孩P=3/4×1/2=3/8')+this._card('光合呼吸','光照CO₂吸收12mg/h，黑暗释放4mg/h，真正光合=12+4=16mg/h')+'</div>';},
    _buildPhysicsExperimentsContent:function(){var pe=this.physicsExperiments;if(!pe)return'';var h='<div class="experiments-section"><h3>🔬 高中物理实验大全</h3>';h+='<div class="knowledge-card"><h4>📏 测量仪器</h4>';pe.instruments.forEach(function(inst){h+='<div class="key-point"><strong>'+inst.name+'</strong>：精度'+inst.precision+'；读数：'+inst.reading+'；估读：'+inst.estimation+'</div>';});h+='</div>';h+='<div class="knowledge-card"><h4>🔧 电表改装</h4>';h+='<div class="key-point">'+pe.meterModification.voltmeter+'</div>';h+='<div class="key-point">'+pe.meterModification.ammeter+'</div>';h+='<div class="key-point">'+pe.meterModification.internalMethod+'</div>';h+='<div class="key-point">'+pe.meterModification.externalMethod+'</div>';h+='<div class="key-point">'+pe.meterModification.criterion+'</div>';h+='</div>';h+='<div class="knowledge-card"><h4>🔨 力学实验</h4>';pe.mechanicsExperiments.forEach(function(exp){h+='<div class="key-point"><strong>'+exp.name+'</strong>（'+exp.principle+'）'+exp.errorAnalysis+'</div>';});h+='</div>';h+='<div class="knowledge-card"><h4>⚡ 电学实验</h4>';pe.electricityExperiments.forEach(function(exp){h+='<div class="key-point"><strong>'+exp.name+'</strong>（'+exp.principle+'）'+exp.errorAnalysis+'</div>';});h+='</div>';h+='<div class="knowledge-card"><h4>💡 光学实验</h4>';pe.opticsExperiments.forEach(function(exp){h+='<div class="key-point"><strong>'+exp.name+'</strong>（'+exp.principle+'）'+exp.errorAnalysis+'</div>';});h+='</div>';h+='<div class="knowledge-card"><h4>🌡️ 热学实验</h4>';pe.thermalExperiments.forEach(function(exp){h+='<div class="key-point"><strong>'+exp.name+'</strong>（'+exp.principle+'）'+exp.errorAnalysis+'</div>';});h+='</div></div>';return h;},
    _buildChemistryExperimentsContent:function(){var ce=this.chemistryExperiments;if(!ce)return'';var h='<div class="experiments-section"><h3>🔬 化学实验指导</h3>';h+='<div class="knowledge-card"><h4>🛡️ 实验安全</h4>';ce.safety.forEach(function(s){h+='<div class="key-point"><strong>'+s.category+'</strong>：'+s.items.join('；')+'</div>';});h+='</div>';h+='<div class="knowledge-card"><h4>🔄 分离提纯</h4>';ce.separation.forEach(function(s){h+='<div class="key-point"><strong>'+s.method+'</strong>：'+s.principle+'，适用：'+s.scope+'</div>';});h+='</div>';h+='<div class="knowledge-card"><h4>🧪 滴定</h4>';ce.titration.forEach(function(t){h+='<div class="key-point"><strong>'+t.type+'</strong>：'+t.principle+'，步骤：'+t.steps+'</div>';});h+='</div>';h+='<div class="knowledge-card"><h4>📐 常用仪器</h4>';ce.instruments.forEach(function(inst){h+='<div class="key-point"><strong>'+inst.name+'</strong>：'+inst.usage+'，注意：'+inst.notes+'</div>';});h+='</div>';h+='<div class="knowledge-card"><h4>📦 药品储存</h4>';ce.storage.forEach(function(s){h+='<div class="key-point"><strong>'+s.substance+'</strong>：'+s.method+'（'+s.reason+'）</div>';});h+='</div></div>';return h;},
    _buildBiologyExperimentsContent:function(){return '<div class="experiments-section"><h3>🔬 生物实验指导</h3>'+this._card('质壁分离与复原','原理：渗透作用。材料：紫色洋葱外表皮。步骤：装片→0.3g/mL蔗糖→观察分离→换清水→观察复原')+this._card('探究酶的专一性','自变量：酶种类或底物种类。检测：碘液/斐林试剂/双缩脲试剂')+this._card('观察根尖分生组织有丝分裂','流程：培养→固定→解离→漂洗→染色→制片→观察。解离液：盐酸+酒精')+this._card('探究酵母菌呼吸方式','自变量：有氧/无氧。检测：CO₂用澄清石灰水，酒精用酸性重铬酸钾')+'</div>';},
    _buildPhysicsTests:function(){return '<div class="tests-section"><h3>📋 物理模拟测试</h3>'+
        this._card('基础·运动学','关于匀变速直线运动，下列说法正确的是：<br>A.速度越大加速度越大 ✗<br>B.速度变化越大加速度越大 ✗<br>C.加速度越大速度变化越快 ✓<br>D.加速度方向与速度方向一定相同 ✗<br><span data-style="color:#27ae60;">解析：a=Δv/Δt，加速度描述速度变化快慢，与速度大小无直接关系</span>')+
        this._card('基础·牛顿定律','质量为2kg的物体在光滑水平面上受6N水平力作用，3s内位移为（初速度为零）：<br>A.9m ✗<br>B.13.5m ✓<br>C.18m ✗<br>D.27m ✗<br><span data-style="color:#27ae60;">解析：a=F/m=3m/s²，x=½at²=½×3×9=13.5m</span>')+
        this._card('提升·曲线运动','从同一高度以不同初速度水平抛出两个相同小球（不计空气阻力），下列说法正确的是：<br>A.初速度大的先落地 ✗<br>B.两球同时落地 ✓<br>C.初速度大的落地速度小 ✗<br>D.两球落地速度相同 ✗<br><span data-style="color:#27ae60;">解析：t=√(2h/g)与v₀无关；落地速度v=√(v₀²+2gh)，v₀大则v大</span>')+
        this._card('提升·万有引力','关于地球同步卫星，下列说法正确的是：<br>A.可以在北京正上方 ✗<br>B.周期等于地球自转周期 ✓<br>C.线速度等于第一宇宙速度 ✗<br>D.向心加速度等于地面g ✗<br><span data-style="color:#27ae60;">解析：同步卫星在赤道正上方，T=24h，v<v₁=7.9km/s，a<g</span>')+
        this._card('提升·机械能','从高h处自由下落的物体，动能等于势能时距地面高度为：<br>A.h/4 ✗<br>B.h/2 ✓<br>C.2h/3 ✗<br>D.3h/4 ✗<br><span data-style="color:#27ae60;">解析：Ek=Ep时，mgh/2=mgh\'，h\'=h/2</span>')+
        this._card('冲刺·电磁感应','导体棒在匀强磁场中匀速切割磁力线，外力做功等于：<br>A.导体棒动能增量 ✗<br>B.电路产生的焦耳热 ✓<br>C.安培力做的功 ✗<br>D.导体棒重力势能变化 ✗<br><span data-style="color:#27ae60;">解析：匀速→a=0→F外=F安，W外=W克服安培力=Q焦耳</span>')+
        this._card('冲刺·动量能量','质量m的子弹以v₀射入静止木块M并留在其中，损失的机械能为：<br>A.½mv₀² ✗<br>B.½Mv₀² ✗<br>C.Mmv₀²/[2(M+m)] ✓<br>D.½mv₀²·M/(M+m) ✗<br><span data-style="color:#27ae60;">解析：mv₀=(M+m)v，ΔE=½mv₀²-½(M+m)v²=Mmv₀²/[2(M+m)]</span>')+
        this._card('冲刺·电场','关于电场强度和电势，下列正确的是：<br>A.E=0处φ一定为0 ✗<br>B.φ高处E一定大 ✗<br>C.E与φ无直接关系 ✓<br>D.沿电场线方向φ升高 ✗<br><span data-style="color:#27ae60;">解析：等量同种电荷连线中点E=0但φ≠0；沿电场线φ降低</span>')+
        '</div>';},
    _buildChemistryTests:function(){return '<div class="tests-section"><h3>📋 化学模拟测试</h3>'+
        this._card('基础·化学计量','标准状况下，22.4L CO₂的物质的量为：<br>A.1mol ✓<br>B.22.4mol ✗<br>C.44mol ✗<br>D.无法确定 ✗<br><span data-style="color:#27ae60;">解析：标况下22.4L任何气体=1mol</span>')+
        this._card('基础·离子反应','下列离子能大量共存的是：<br>A.H⁺、CO₃²⁻ ✗<br>B.Na⁺、K⁺、NO₃⁻、SO₄²⁻ ✓<br>C.Fe³⁺、OH⁻ ✗<br>D.NH₄⁺、OH⁻ ✗<br><span data-style="color:#27ae60;">解析：A产生CO₂；C产生Fe(OH)₃沉淀；D产生NH₃·H₂O</span>')+
        this._card('提升·氧化还原','3Cu+8HNO₃(稀)→3Cu(NO₃)₂+2NO↑+4H₂O，被还原与未被还原的HNO₃之比为：<br>A.1:3 ✓<br>B.2:3 ✗<br>C.1:4 ✗<br>D.3:1 ✗<br><span data-style="color:#27ae60;">解析：8mol HNO₃中2mol被还原(N+5→+2)，6mol起酸性作用</span>')+
        this._card('提升·电化学','锌铜原电池负极反应为：<br>A.Zn-2e⁻→Zn²⁺ ✓<br>B.Cu²⁺+2e⁻→Cu ✗<br>C.2H⁺+2e⁻→H₂↑ ✗<br>D.Zn²⁺+2e⁻→Zn ✗<br><span data-style="color:#27ae60;">解析：锌比铜活泼，锌为负极失电子氧化反应</span>')+
        this._card('提升·化学平衡','N₂+3H₂⇌2NH₃(放热)，提高H₂转化率的措施：<br>A.增大压强 ✓<br>B.升高温度 ✗<br>C.加催化剂 ✗<br>D.减小N₂ ✗<br><span data-style="color:#27ae60;">解析：增大压强平衡正向移动，H₂转化率升高</span>')+
        this._card('冲刺·盐类水解','下列溶液pH最大的是：<br>A.NaCl ✗<br>B.Na₂CO₃ ✓<br>C.NH₄Cl ✗<br>D.NaHCO₃ ✗<br><span data-style="color:#27ae60;">解析：Na₂CO₃水解程度最大，碱性最强</span>')+
        this._card('冲刺·有机推断','C₂H₄O₂能与NaHCO₃反应放出气体，该有机物为：<br>A.甲酸甲酯 ✗<br>B.乙酸 ✓<br>C.乙醇 ✗<br>D.乙醛 ✗<br><span data-style="color:#27ae60;">解析：与NaHCO₃反应→含-COOH，C₂H₄O₂含-COOH的只有乙酸</span>')+
        '</div>';},
    _buildBiologyTests:function(){return '<div class="tests-section"><h3>📋 生物模拟测试</h3>'+
        this._card('基础·细胞结构','下列不具有膜结构的细胞器是：<br>A.线粒体 ✗<br>B.核糖体 ✓<br>C.内质网 ✗<br>D.高尔基体 ✗<br><span data-style="color:#27ae60;">解析：核糖体是无膜细胞器，还有中心体</span>')+
        this._card('基础·蛋白质','关于蛋白质，正确的是：<br>A.蛋白质是生命活动的主要承担者 ✓<br>B.所有蛋白质都含S ✗<br>C.多样性只与氨基酸种类有关 ✗<br>D.每种蛋白质都含20种氨基酸 ✗<br><span data-style="color:#27ae60;">解析：蛋白质功能多样性；多样性由种类/数目/排列/空间结构决定</span>')+
        this._card('提升·细胞代谢','有氧呼吸释放CO₂的阶段是：<br>A.只有第二阶段 ✓<br>B.第二和第三阶段 ✗<br>C.只有第三阶段 ✗<br>D.第一和第二阶段 ✗<br><span data-style="color:#27ae60;">解析：第二阶段丙酮酸+H₂O→CO₂+[H]释放CO₂</span>')+
        this._card('提升·细胞分裂','减数分裂中同源染色体分离发生在：<br>A.减Ⅰ前期 ✗<br>B.减Ⅰ后期 ✓<br>C.减Ⅱ后期 ✗<br>D.有丝分裂后期 ✗<br><span data-style="color:#27ae60;">解析：减Ⅰ后期同源染色体分离，减Ⅱ后期姐妹染色单体分离</span>')+
        this._card('提升·遗传规律','正常夫妇，女方父亲白化病(常隐)，男方有一白化病弟弟，后代白化病概率：<br>A.1/4 ✗<br>B.1/6 ✗<br>C.1/9 ✗<br>D.1/18 ✗<br><span data-style="color:#27ae60;">解析：女方Aa(1)，男方Aa(2/3)，aa=2/3×1/4=1/6</span>')+
        this._card('冲刺·光合作用','暗反应中CO₂固定是指：<br>A.CO₂与C₃结合 ✗<br>B.CO₂与C₅结合生成C₃ ✓<br>C.C₃被[H]还原 ✗<br>D.ATP水解 ✗<br><span data-style="color:#27ae60;">解析：CO₂+C₅→2C₃（RuBisCO酶催化）</span>')+
        this._card('冲刺·免疫调节','关于特异性免疫，正确的是：<br>A.浆细胞能识别抗原 ✗<br>B.效应T细胞产生抗体 ✗<br>C.B细胞增殖分化为浆细胞和记忆细胞 ✓<br>D.二次免疫比初次慢 ✗<br><span data-style="color:#27ae60;">解析：浆细胞不能识别抗原；效应T细胞使靶细胞裂解；二次免疫更快更强</span>')+
        this._card('冲刺·基因工程','限制酶的作用是：<br>A.连接DNA片段 ✗<br>B.识别特定序列并切割DNA ✓<br>C.导入目的基因 ✗<br>D.检测基因表达 ✗<br><span data-style="color:#27ae60;">解析：限制酶识别回文序列并切割DNA双链</span>')+
        '</div>';},

    buildBiologyHotspot:function(){
        this.biologyHotspot={topics:[
            {title:'1. 蛋白质的分选机制与信号肽介导的蛋白质合成运输',intro:'蛋白质在细胞内合成后需要被精确地运送到特定位置才能发挥功能，这一过程称为蛋白质分选（protein sorting）。信号肽是指导蛋白质定位的关键信号。',sections:[
                {subtitle:'共翻译转运途径（Co-translational translocation）',points:[
                    {type:'key',label:'基本原理',content:'核糖体上合成的蛋白质N端信号肽在翻译过程中即被信号识别颗粒（SRP）识别，翻译暂时中止，核糖体-信号肽-SRP复合物被引导至内质网膜，翻译继续进行，多肽链边合成边进入内质网腔'},
                    {type:'key',label:'信号肽特征',content:'N端一段15-30个氨基酸的疏水序列，含1个或多个带正电荷的氨基酸残基，随后为疏水核心（7-15个疏水氨基酸），末端有信号肽酶切割位点。信号肽在蛋白质进入内质网后被信号肽酶切除'},
                    {type:'key',label:'SRP机制',content:'信号识别颗粒（SRP）由6种蛋白质和1个7S RNA组成。SRP与信号肽结合后暂停翻译，与内质网膜上SRP受体结合，将核糖体引导至易位子（Sec61复合体），翻译恢复'},
                    {type:'key',label:'适用范围',content:'分泌蛋白、膜蛋白、内质网驻留蛋白、溶酶体蛋白等均通过此途径进入内质网，再经高尔基体进一步分选'}
                ]},
                {subtitle:'后翻译转运途径（Post-translational translocation）',points:[
                    {type:'key',label:'基本原理',content:'蛋白质在游离核糖体上完全合成后，以折叠或未折叠状态被运送到目标细胞器。需要分子伴侣（如Hsp70）维持去折叠状态'},
                    {type:'key',label:'线粒体蛋白分选',content:'前体蛋白N端有导肽序列（带正电荷的两性α螺旋），通过TOM复合体进入外膜，经TIM23复合体进入基质，导肽被线粒体加工蛋白酶（MPP）切除。膜间腔蛋白还需IMS蛋白转运系统'},
                    {type:'key',label:'叶绿体蛋白分选',content:'前体蛋白含转运肽（transit peptide），通过TOC/TIC复合体穿越双层膜进入基质，转运肽被基质加工蛋白酶切除。类囊体蛋白还需Sec/Tat/SRP途径'},
                    {type:'key',label:'核蛋白分选',content:'核定位信号（NLS）为碱性氨基酸富集区（如PKKKRKV），通过importin α/β介导经核孔复合体入核。NLS不被切除，核蛋白可在细胞质与细胞核间穿梭'},
                    {type:'key',label:'过氧化物酶体蛋白分选',content:'大多数基质蛋白C端含PTS1信号（SKL三肽），少数N端含PTS2信号。蛋白质以折叠状态进入过氧化物酶体，这是与线粒体/叶绿体分选的重要区别'}
                ]},
                {subtitle:'不同细胞器蛋白质分选特异性比较',points:[
                    {type:'key',label:'内质网',content:'共翻译转运，信号肽在N端，翻译时进入，信号肽被切除'},
                    {type:'key',label:'线粒体',content:'后翻译转运，导肽在N端，需Hsp70维持去折叠，导肽被切除'},
                    {type:'key',label:'叶绿体',content:'后翻译转运，转运肽在N端，需Hsp70维持去折叠，转运肽被切除'},
                    {type:'key',label:'细胞核',content:'后翻译转运，NLS不被切除，可反复入核，经核孔复合体'},
                    {type:'key',label:'过氧化物酶体',content:'后翻译转运，PTS1在C端或PTS2在N端，折叠状态进入'},
                    {type:'mistake',content:'易错点：信号肽和导肽都会被切除，但NLS不被切除；过氧化物酶体蛋白以折叠状态进入，而线粒体/叶绿体蛋白需去折叠'}
                ]}
            ]},
            {title:'2. 离子泵与质子泵的分子结构及主动运输类型分析',intro:'主动运输是逆浓度梯度运输物质的过程，需要消耗能量。根据能量来源不同，分为原发性主动运输和继发性主动运输。',sections:[
                {subtitle:'P型泵（P-type pump）',points:[
                    {type:'key',label:'结构特征',content:'含磷酸化位点，运输过程中形成天冬氨酸磷酸化中间体（因此称P型）。由α催化亚基和β调节亚基组成'},
                    {type:'key',label:'Na⁺/K⁺-ATP酶',content:'每消耗1分子ATP，泵出3个Na⁺、泵入2个K⁺，产生跨膜电位差（外正内负）。E1构象朝细胞内侧，磷酸化后转为E2构象朝外侧。是维持细胞静息电位的基础'},
                    {type:'key',label:'Ca²⁺-ATP酶',content:'存在于肌质网（SERCA）和细胞膜（PMCA），将Ca²⁺从细胞质泵入肌质网或泵出细胞，维持胞质低Ca²⁺浓度（~0.1μM）。每消耗1ATP转运2个Ca²⁺'},
                    {type:'key',label:'H⁺/K⁺-ATP酶',content:'存在于胃壁细胞，将H⁺泵入胃腔（泌酸），K⁺泵入细胞。每消耗1ATP转运1H⁺和1K⁺'}
                ]},
                {subtitle:'V型泵（V-type pump）',points:[
                    {type:'key',label:'结构特征',content:'V₁（细胞质侧，含ATP酶活性）+V₀（膜内部分，形成质子通道）。不形成磷酸化中间体'},
                    {type:'key',label:'功能',content:'利用ATP水解能量将H⁺从细胞质泵入溶酶体、内体、液泡等酸性细胞器，维持其内部低pH（溶酶体pH≈4.5-5.0）'},
                    {type:'key',label:'生理意义',content:'溶酶体酸性环境是水解酶活性的必要条件；液泡酸化维持植物细胞渗透压；破骨细胞V型泵参与骨吸收'}
                ]},
                {subtitle:'F型泵（F-type pump / ATP合酶）',points:[
                    {type:'key',label:'结构特征',content:'F₁（基质侧，催化ATP合成/水解）+F₀（膜内质子通道）。是可逆泵'},
                    {type:'key',label:'功能',content:'线粒体内膜和叶绿体类囊体薄膜上，利用质子动力势（ΔμH⁺）驱动ADP+Pi→ATP。当质子顺浓度梯度通过F₀通道时，驱动F₁合成ATP'},
                    {type:'key',label:'化学渗透假说',content:'Mitchell提出：电子传递链泵出质子建立跨膜质子梯度（电化学势能），质子顺梯度回流驱动ATP合成。每合成1ATP约需3-4个H⁺通过'}
                ]},
                {subtitle:'原发性与继发性主动运输比较',points:[
                    {type:'key',label:'原发性主动运输',content:'直接利用ATP水解供能。如Na⁺/K⁺泵、Ca²⁺泵、H⁺泵。能量来源：ATP→ADP+Pi'},
                    {type:'key',label:'继发性主动运输（协同运输）',content:'利用原发性主动运输建立的离子梯度（通常是Na⁺或H⁺梯度）供能。不直接消耗ATP，但间接依赖ATP'},
                    {type:'key',label:'同向运输（symport）',content:'被转运物质与驱动离子同向跨膜。如小肠上皮细胞吸收葡萄糖（Na⁺/葡萄糖同向转运体SGLT1），Na⁺顺浓度梯度进入的同时驱动葡萄糖逆浓度梯度进入'},
                    {type:'key',label:'反向运输（antiport）',content:'被转运物质与驱动离子反向跨膜。如心肌细胞Na⁺/Ca²⁺交换体（NCX），3Na⁺进入驱动1Ca²⁺排出'},
                    {type:'mistake',content:'易错点：继发性主动运输虽不直接消耗ATP，但维持离子梯度需要ATP（Na⁺/K⁺泵），因此最终能量来源仍是ATP'}
                ]}
            ]},
            {title:'3. 逆境胁迫对光合作用的影响机制研究',intro:'植物在干旱、盐碱、高温等逆境条件下，光合作用会受到显著影响，了解其机制对理解植物适应性和农业生产具有重要意义。',sections:[
                {subtitle:'逆境对光反应阶段的影响',points:[
                    {type:'key',label:'光合色素',content:'干旱和高温导致叶绿素降解加速（叶绿素酶活性升高），叶片变黄；类囊体膜结构受损，色素-蛋白复合体解离。盐胁迫抑制叶绿素合成前体（δ-氨基乙酰丙酸）的合成'},
                    {type:'key',label:'电子传递链',content:'干旱导致气孔关闭→CO₂浓度降低→NADP⁺再生减少→电子传递链过度还原→活性氧（ROS）积累→损伤PSII反应中心D1蛋白。高温使类囊体膜流动性增加→膜蛋白复合体解离→电子传递效率下降'},
                    {type:'key',label:'PSII光抑制',content:'逆境下PSII最大光化学效率（Fv/Fm）下降。D1蛋白降解速率大于修复速率，导致PSII光抑制。光保护机制：叶黄素循环（紫黄质→环氧玉米黄质→玉米黄质）耗散过剩光能'},
                    {type:'key',label:'ATP合成',content:'高温使类囊体膜对质子通透性增加→质子泄漏→跨膜质子动力势降低→ATP合酶效率下降。盐胁迫抑制ATP合酶活性'}
                ]},
                {subtitle:'逆境对碳反应（暗反应）阶段的影响',points:[
                    {type:'key',label:'Rubisco酶活性',content:'高温促进Rubisco加氧酶活性（光呼吸增强），降低羧化效率。干旱导致气孔关闭→CO₂供应不足→Rubisco催化RuBP加氧→光呼吸加剧。高温下Rubisco活化酶（RCA）活性降低→Rubisco失活'},
                    {type:'key',label:'卡尔文循环酶',content:'高温使多种卡尔文循环酶（如GAPDH、FBPase、SBPase）变性失活。盐胁迫抑制RuBP再生相关酶活性'},
                    {type:'key',label:'光合产物积累与转运',content:'干旱抑制蔗糖磷酸合成酶（SPS）活性→蔗糖合成减少→淀粉在叶绿体中积累→反馈抑制光合作用。高温加速呼吸消耗，净光合速率下降'}
                ]},
                {subtitle:'植物的适应机制',points:[
                    {type:'key',label:'形态适应',content:'叶片变小变厚、气孔下陷、角质层加厚（减少水分散失）；C₄和CAM途径适应低CO₂环境'},
                    {type:'key',label:'生理适应',content:'渗透调节（积累脯氨酸、甜菜碱等渗透调节物质）；抗氧化系统（SOD、CAT、POD清除ROS）；热激蛋白（HSP）保护酶和膜结构'},
                    {type:'key',label:'光保护机制',content:'叶黄素循环耗散过剩光能；PSI循环电子流（CEF）产生额外ATP但不产生NADPH，减少ROS产生；状态转换（LHCII磷酸化从PSII转向PSI）'},
                    {type:'example',content:'实例：C₄植物（玉米、高粱）在高温干旱条件下比C₃植物（水稻、小麦）具有更高光合效率，因为PEP羧化酶对CO₂亲和力远高于Rubisco，且CO₂泵浓缩机制有效抑制光呼吸'}
                ]}
            ]},
            {title:'4. 细胞周期调控系统与细胞周期同步化技术',intro:'细胞周期的精确调控是保证细胞正常增殖和分化的重要前提，CDK-周期蛋白系统是调控的核心。',sections:[
                {subtitle:'细胞周期关键调控因子',points:[
                    {type:'key',label:'CDK（周期蛋白依赖性激酶）',content:'催化亚基，必须与周期蛋白结合才有活性。CDK活性受三种调控：①周期蛋白的结合与降解；②磷酸化/去磷酸化（CAK激活，Wee1抑制）；③CKI（CDK抑制因子）的结合'},
                    {type:'key',label:'周期蛋白（Cyclin）',content:'调节亚基，浓度随细胞周期呈周期性波动。G₁期：Cyclin D/E；S期：Cyclin A；G₂/M期：Cyclin B。周期蛋白通过泛素-蛋白酶体途径降解'},
                    {type:'key',label:'关键检查点',content:'G₁/S检查点（Restriction point）：DNA是否完整、环境是否适宜；G₂/M检查点：DNA是否完全复制、DNA是否损伤；纺锤体组装检查点（SAC）：染色体是否正确附着纺锤体'},
                    {type:'key',label:'Rb-E2F通路',content:'G₁期Rb蛋白结合E2F转录因子抑制其活性。Cyclin D-CDK4/6磷酸化Rb→释放E2F→激活S期基因表达。这是G₁/S转换的核心调控'}
                ]},
                {subtitle:'有丝分裂与减数分裂的调控差异',points:[
                    {type:'key',label:'有丝分裂',content:'Cyclin B-CDK1（即MPF）是M期进入的关键激酶。APC/C（后期促进复合体）介导Securin和Cyclin B降解→姐妹染色单体分离→退出有丝分裂'},
                    {type:'key',label:'减数分裂特异调控',content:'①减数第一次分裂：Rec8（黏连蛋白亚基）替代Scc1，保护着丝点黏连不被APC/C清除→同源染色体分离但姐妹染色单体保持连接；②减数第二次分裂：Separase切割Rec8→姐妹染色单体分离；③MPF在两次分裂间不完全降解'},
                    {type:'key',label:'减数分裂特有事件',content:'同源染色体配对（联会）→形成联会复合体（SC）→交叉互换（CO）→同源染色体分离。这些事件由减数分裂特异蛋白（SPO11、DMC1、HOP1等）调控'}
                ]},
                {subtitle:'细胞周期同步化技术',points:[
                    {type:'key',label:'化学诱导法——胸腺嘧啶阻断法',content:'高浓度TdR抑制核苷酸还原酶→dNTP合成受阻→DNA复制停止→细胞阻滞在G₁/S交界。双重TdR阻断法：第一次阻断→释放（更换无TdR培养基培养一段时间）→第二次阻断→可获得S期同步化细胞'},
                    {type:'key',label:'化学诱导法——秋水仙素/诺考达唑',content:'抑制微管聚合→纺锤体不能形成→细胞阻滞在M期（前中期）。收集M期细胞后洗去药物即可获得同步化M期细胞'},
                    {type:'key',label:'化学诱导法——丝裂霉素C',content:'抑制DNA合成，将细胞阻滞在S期'},
                    {type:'key',label:'物理方法——振荡收集法',content:'M期细胞变圆附着力下降，剧烈振荡培养瓶可使M期细胞脱落收集'},
                    {type:'key',label:'物理方法——血清饥饿法',content:'降低培养基血清浓度至0.5%以下培养24-48h→细胞因缺乏生长因子而停滞在G₀/G₁期'},
                    {type:'mistake',content:'易错点：胸腺嘧啶阻断法使细胞阻滞在G₁/S交界而非S期；秋水仙素阻断在M期前中期而非后期'}
                ]}
            ]},
            {title:'5. 基因致死现象与平衡致死系的遗传原理',intro:'基因致死现象是指某些基因型个体在发育过程中死亡的现象，是遗传学分析中的重要概念。',sections:[
                {subtitle:'显性致死与隐性致死',points:[
                    {type:'key',label:'隐性致死',content:'纯合时致死，杂合时不致死。最常见类型。如小鼠黄体基因Aᵒ：AᵒAᵒ胚胎致死，AᵒA表现黄色，AA表现灰色。AᵒA × AᵒA → 2/3黄体:1/3灰体（非3:1）'},
                    {type:'key',label:'显性致死',content:'杂合即致死，无法传代。如人类亨廷顿舞蹈症致病基因（杂合即发病，但发病晚于生育年龄所以可传代）。若胚胎期显性致死则该基因无法在群体中维持'},
                    {type:'key',label:'配子致死',content:'某基因型的配子不能存活。如玉米的ig基因使含ig的花粉不能正常发育，只能通过母本传递'},
                    {type:'key',label:'伴性致死',content:'X染色体上的致死基因。XⁿXⁿ雌性致死，X⁺Xⁿ雌性携带者正常，XⁿY雄性致死。如人类X连锁隐性致死导致男性胚胎死亡'}
                ]},
                {subtitle:'平衡致死系（Balanced lethal system）',points:[
                    {type:'key',label:'定义',content:'一对同源染色体上各携带一个不同的隐性致死基因，且这两个致死基因紧密连锁（被倒位等结构变异阻止交换），杂合体可以存活，两种纯合体均致死的品系'},
                    {type:'key',label:'构建条件',content:'①一对同源染色体上分别携带不同的隐性致死基因a和b（A b / a B）；②两个致死基因紧密连锁（倒位阻止交换）；③A_b/aB杂合体存活，AA、ab/ab纯合致死'},
                    {type:'key',label:'维持机制',content:'平衡致死系自交后代：1/4 A_b/A_b致死 + 2/4 A_b/aB存活 + 1/4 aB/aB致死 → 存活后代全为杂合体A_b/aB，与亲代基因型相同，因此称为"平衡"'},
                    {type:'key',label:'应用价值',content:'①保持致死基因不丢失（无需人工选择即可维持）；②利用倒位标记进行基因定位；③果蝇中CLB品系（C=倒位，L=隐性致死，B=棒眼显性标记）用于检测X连锁隐性致死突变'},
                    {type:'example',content:'实例：果蝇CLB品系——X^CLB染色体含倒位(C)、隐性致死基因(l)、棒眼标记(B)。X^CLB/X^+雌性棒眼存活，X^CLB/X^CLB和X^CLB/Y致死。用CLB法检测诱变剂：处理后代雄蝇数量减少说明X染色体产生了新的隐性致死突变'},
                    {type:'mistake',content:'易错点：平衡致死系后代存活个体全为杂合体，不是1:2:1分离比；两个致死基因必须紧密连锁，否则交换会产生双显性重组体打破平衡'}
                ]}
            ]},
            {title:'6. 基因定位类问题的分析方法与解题策略',intro:'基因定位是遗传学研究的核心内容之一，确定基因在染色体上的具体位置对于理解基因功能和遗传规律至关重要。',sections:[
                {subtitle:'三点测交法',points:[
                    {type:'key',label:'原理',content:'利用三杂合体（AaBbCc）与三隐性纯合体（aabbcc）测交，通过分析8种表型后代的数量比例，确定三个基因的排列顺序和遗传距离'},
                    {type:'key',label:'解题步骤',content:'①确定亲本型（数量最多）和双交换型（数量最少）；②比较双交换型与亲本型，找出哪个基因发生了交换→该基因为中间基因；③计算单交换值I和II；④计算双交换值；⑤遗传距离=单交换值+双交换值×2（校正）'},
                    {type:'key',label:'干涉与并发系数',content:'并发系数=实际双交换率/理论双交换率。干涉度=1-并发系数。完全干涉（并发系数=0）时无双交换发生'},
                    {type:'example',content:'例题：三对基因测交后代8种表型数量为：ABC 420、abc 410、Abc 58、aBC 52、ABc 36、abC 34、AbC 5、aBc 5。亲本型ABC/abc，双交换型AbC/aBc→B在中间。单交换I(A-B)=(58+52+5+5)/1000=12%，单交换II(B-C)=(36+34+5+5)/1000=8%'}
                ]},
                {subtitle:'缺失定位法',points:[
                    {type:'key',label:'原理',content:'利用已知的一系列缺失突变体与待定位的隐性突变体杂交，如果后代出现突变表型，说明待定位基因在缺失区域内（假显性现象）'},
                    {type:'key',label:'操作',content:'准备一组重叠缺失突变体（覆盖整条染色体），逐一与待测突变体杂交，记录哪些缺失能互补（后代野生型）、哪些不能（后代突变型），通过重叠分析缩小基因位置范围'},
                    {type:'key',label:'适用范围',content:'适用于果蝇等模式生物的粗略基因定位，精度较低（缺失区域较大）'}
                ]},
                {subtitle:'分子标记定位法',points:[
                    {type:'key',label:'RFLP（限制性片段长度多态性）',content:'DNA序列差异导致限制酶切割位点不同，产生不同长度的DNA片段。通过Southern blot检测，与目标基因连锁的RFLP标记可用于定位'},
                    {type:'key',label:'SSR（简单重复序列/微卫星）',content:'2-6bp的串联重复序列，重复次数高度多态。PCR扩增后电泳检测片段长度差异，多态性高，是常用的分子标记'},
                    {type:'key',label:'SNP（单核苷酸多态性）',content:'单个碱基的变异，基因组中分布最密集的标记。通过测序或芯片检测，可用于高密度遗传图谱构建和全基因组关联分析（GWAS）'},
                    {type:'key',label:'解题策略',content:'①确定标记与目标基因是否连锁（χ²检验）；②计算重组率=重组型个体数/总个体数×100%；③遗传距离≈重组率（<20%时）；④利用多个标记进行区间定位'}
                ]},
                {subtitle:'基因定位问题通用解题步骤',points:[
                    {type:'key',label:'步骤一',content:'判断基因是否在常染色体还是性染色体上（正反交结果是否一致）'},
                    {type:'key',label:'步骤二',content:'判断基因是否连锁（测交后代比例是否为1:1:1:1）'},
                    {type:'key',label:'步骤三',content:'确定基因排列顺序（三点测交中比较双交换型与亲本型）'},
                    {type:'key',label:'步骤四',content:'计算遗传距离（单交换值+2×双交换值）'},
                    {type:'mistake',content:'易错点：遗传距离计算时双交换值要乘以2校正（因为双交换个体在单交换中被计为非交换型）'}
                ]}
            ]},
            {title:'7. 生物育种方式的综合比较与应用',intro:'育种是改良生物性状、培育新品种的重要手段，不同育种方法各有其原理、优缺点和适用范围。',sections:[
                {subtitle:'五种主要育种方式对比',points:[
                    {type:'key',label:'杂交育种',content:'原理：基因重组。方法：杂交→F₁自交→F₂选择→连续自交至纯合。优点：操作简单，可集中优良性状。缺点：育种年限长（5-6年），不能创造新基因。适用：同一物种不同品种间优良性状的整合'},
                    {type:'key',label:'诱变育种',content:'原理：基因突变。方法：物理（射线、激光）或化学（EMS、亚硝酸）诱变→筛选。优点：提高突变率，可创造新基因。缺点：突变不定向性，有利突变少，工作量大。适用：微生物育种、作物性状改良'},
                    {type:'key',label:'单倍体育种',content:'原理：染色体变异（染色体组数目变异）+纯合化。方法：花药离体培养→单倍体幼苗→秋水仙素处理→纯合二倍体。优点：明显缩短育种年限（2年即可获得纯合体）。缺点：技术复杂，成活率低。适用：快速获得纯合体'},
                    {type:'key',label:'多倍体育种',content:'原理：染色体变异（染色体组数目增加）。方法：秋水仙素处理萌发种子或幼苗→抑制纺锤体形成→染色体加倍。优点：器官大、营养物质含量高。缺点：发育延迟、结实率低。适用：无性繁殖作物（如三倍体无子西瓜、八倍体小黑麦）'},
                    {type:'key',label:'基因工程育种',content:'原理：基因重组（DNA重组技术）。方法：目的基因获取→表达载体构建→转化→筛选→鉴定。优点：定向改造性状，打破物种界限。缺点：技术复杂，生态安全争议。适用：转基因抗虫棉、胰岛素工程菌等'}
                ]},
                {subtitle:'育种方法选择策略',points:[
                    {type:'key',label:'整合优良性状',content:'同一物种不同品种→杂交育种'},
                    {type:'key',label:'创造新性状',content:'需要新基因→诱变育种或基因工程育种'},
                    {type:'key',label:'快速获得纯合体',content:'缩短育种年限→单倍体育种'},
                    {type:'key',label:'增大器官/提高产量',content:'多倍体育种'},
                    {type:'key',label:'跨物种性状转移',content:'基因工程育种'},
                    {type:'example',content:'实例分析：培育抗虫小麦——方法1：杂交育种（抗虫×高产→连续自交选育，5-6年）；方法2：单倍体育种（杂交→花药培养→秋水仙素加倍，2年）；方法3：基因工程（Bt基因转入小麦，定向高效）'},
                    {type:'mistake',content:'易错点：单倍体育种中花药离体培养获得的是单倍体（不是纯合体），必须经秋水仙素处理后才是纯合二倍体'}
                ]}
            ]},
            {title:'8. DNA损伤修复机制与表观遗传调控',intro:'DNA损伤修复是维持基因组稳定性的关键机制，表观遗传调控则在DNA序列不变的情况下调控基因表达。',sections:[
                {subtitle:'DNA损伤修复机制',points:[
                    {type:'key',label:'碱基切除修复（BER）',content:'修复氧化、烷基化等造成的单个碱基损伤。DNA糖苷酶识别并切除损伤碱基→AP内切酶切开骨架→DNA聚合酶β填补→连接酶封口。适用于小范围碱基损伤'},
                    {type:'key',label:'核苷酸切除修复（NER）',content:'修复大范围DNA损伤（如嘧啶二聚体、大加合物）。XPC识别损伤→TFIIH解旋→XPG和XPF切割损伤链→DNA聚合酶ε/δ合成新链→连接酶封口。人类NER缺陷导致着色性干皮病（XP），对UV极度敏感'},
                    {type:'key',label:'错配修复（MMR）',content:'修复DNA复制错误（碱基错配、插入/缺失环）。MutS识别错配→MutL招募MutH→MutH切割含错配的新生链（通过甲基化区分新旧链）→DNA聚合酶III重合成。人类MMR缺陷导致Lynch综合征（遗传性非息肉性结直肠癌）'},
                    {type:'key',label:'双链断裂修复——同源重组（HR）',content:'利用姐妹染色单体为模板精确修复。MRN复合体识别DSB→5\'端切除→RAD51介导链侵入→以完整同源序列为模板合成→解离。S/G₂期活跃，修复精确无错'},
                    {type:'key',label:'双链断裂修复——非同源末端连接（NHEJ）',content:'直接连接断裂末端，可能引入小片段丢失。Ku70/Ku80结合末端→DNA-PKcs激活→Artemis处理末端→XRCC4/Ligase IV连接。G₁期活跃，快速但易出错'},
                    {type:'mistake',content:'易错点：HR需要同源模板且精确，NHEJ不需要模板但易出错；NER修复嘧啶二聚体，BER修复单个碱基损伤'}
                ]},
                {subtitle:'表观遗传调控',points:[
                    {type:'key',label:'DNA甲基化',content:'在CpG岛处，DNA甲基转移酶（DNMT）将5-胞嘧啶甲基化为5-甲基胞嘧啶（5mC）。启动子区高甲基化→转录因子不能结合→基因沉默。维持甲基化：DNMT1在复制后恢复半甲基化CpG的甲基化状态→表观遗传信息可随DNA复制传递'},
                    {type:'key',label:'组蛋白修饰',content:'组蛋白N端尾巴的共价修饰：①乙酰化（HAT添加→开放染色质→激活转录；HDAC去除→关闭染色质→抑制转录）；②甲基化（H3K4me3激活，H3K9me3/H3K27me3抑制）；③磷酸化（与有丝分裂和DNA损伤响应相关）'},
                    {type:'key',label:'染色质重塑',content:'SWI/SNF等ATP依赖的染色质重塑复合体通过滑动或排出核小体，改变染色质可及性，调控基因表达'},
                    {type:'key',label:'非编码RNA调控',content:'①miRNA：与mRNA 3\'UTR互补结合→降解mRNA或抑制翻译；②lncRNA：招募染色质修饰复合体到特定基因位点（如Xist介导X染色体失活）；③siRNA：引导RISC切割同源mRNA'},
                    {type:'key',label:'表观遗传的遗传特点',content:'①DNA序列不变但表型可变；②可通过有丝分裂传递（细胞记忆）；③部分可通过减数分裂传递（跨代遗传），如基因组印记；④环境因素可影响表观遗传修饰（饮食、压力等）'},
                    {type:'example',content:'实例：基因组印记——Prader-Willi综合征（父源15q11-13缺失/甲基化沉默）vs Angelman综合征（母源15q11-13缺失/甲基化沉默）。同一区域，亲本来源不同导致不同疾病'}
                ]}
            ]},
            {title:'9. 动植物生态位理论与实践应用',intro:'生态位是理解物种共存、竞争和生物多样性维持的核心概念。',sections:[
                {subtitle:'生态位概念',points:[
                    {type:'key',label:'定义',content:'一个物种在群落中所占据的时间、空间位置及其与相关物种的功能关系。包括空间生态位、营养生态位、多维生态位（Hutchinson的n维超体积模型）'},
                    {type:'key',label:'基础生态位',content:'在无种间竞争的条件下，一个物种所能占据的最大生态位空间（理论最大范围）'},
                    {type:'key',label:'实际生态位',content:'在有种间竞争的条件下，一个物种实际占据的生态位空间（通常小于基础生态位）。竞争排斥导致实际生态位缩小'},
                    {type:'key',label:'竞争排斥原理',content:'Gause提出：两个生态位完全相同的物种不能长期共存。完全竞争者不能共存'}
                ]},
                {subtitle:'生态位分化',points:[
                    {type:'key',label:'空间分化',content:'不同物种利用不同空间资源。如森林中不同鸟类在不同高度觅食（分层现象）；达尔文雀喙的分化适应不同食物'},
                    {type:'key',label:'时间分化',content:'不同物种在不同时间利用相同资源。如昼行性动物与夜行性动物；不同季节开花的植物'},
                    {type:'key',label:'营养分化',content:'不同物种利用不同食物资源。如同一池塘中不同鱼类食性不同（鲢鱼食浮游植物、鳙鱼食浮游动物、草鱼食水草）'},
                    {type:'key',label:'生态位分化意义',content:'减少种间竞争→促进物种共存→维持生物多样性。生态位分化是竞争排斥的结果，也是适应进化的体现'}
                ]},
                {subtitle:'生态位理论的应用',points:[
                    {type:'key',label:'生物多样性保护',content:'保护关键种（keystone species）的生态位功能；维持生态位互补性以保障生态系统功能；识别空缺生态位指导物种重引入'},
                    {type:'key',label:'生态修复',content:'根据生态位原理选择适宜物种组合进行植被恢复；利用先锋物种占据空缺生态位启动演替；避免引入生态位重叠度高的入侵种'},
                    {type:'key',label:'入侵生物学',content:'外来种成功入侵的条件：空余生态位（生态位空缺假说）或更强的竞争能力（竞争取代）。入侵种常具有宽生态位和高表型可塑性'},
                    {type:'example',content:'实例：澳大利亚引入仙人掌蛾控制仙人掌入侵——仙人掌在澳洲无天敌（空余生态位），引入专食性天敌后成功控制。但需注意天敌的生态位特异性，避免非靶标效应'}
                ]}
            ]},
            {title:'10. 教材基础实验与科学实验方法总结',intro:'系统梳理高中生物教材中的基础实验和科学方法，是实验题得分的关键。',sections:[
                {subtitle:'教材基础实验归类',points:[
                    {type:'key',label:'观察类实验',content:'①观察DNA和RNA在细胞中的分布（甲基绿-吡罗红染色）；②观察线粒体（健那绿活染）；③观察叶绿体和细胞质流动；④观察细胞的有丝分裂（龙胆紫/醋酸洋红染色）；⑤观察细胞的减数分裂'},
                    {type:'key',label:'鉴定类实验',content:'①还原糖鉴定（斐林试剂，砖红色沉淀）；②蛋白质鉴定（双缩脲试剂，紫色）；③脂肪鉴定（苏丹Ⅲ染液，橘黄色）；④淀粉鉴定（碘液，蓝色）'},
                    {type:'key',label:'探究类实验',content:'①探究酶的专一性/高效性/最适温度/pH；②探究酵母菌的呼吸方式；③探究植物生长素的最适浓度；④探究培养液中酵母菌种群数量的变化'},
                    {type:'key',label:'模拟类实验',content:'①模拟探究膜的透性（渗透作用）；②模拟尿素的生成'},
                    {type:'key',label:'调查类实验',content:'①调查常见的人类遗传病；②调查种群密度（样方法/标志重捕法）'}
                ]},
                {subtitle:'科学实验方法',points:[
                    {type:'key',label:'对照实验',content:'原则：单一变量原则、对照原则、重复性原则。对照类型：①空白对照（不处理的对照组）；②自身对照（同一对象前后对比）；③条件对照（给对照组某种处理以对比）；④相互对照（不设对照组，几个实验组互为对照）'},
                    {type:'key',label:'同位素标记法',content:'利用放射性同位素追踪物质运行和变化规律。经典应用：①Meselson-Stahl实验证明DNA半保留复制（¹⁵N标记）；②证明光合作用O₂来自H₂O（¹⁸O标记）；③分泌蛋白的合成和运输（³H标记亮氨酸）；④噬菌体侵染细菌实验（³²P标记DNA/³⁵S标记蛋白质）'},
                    {type:'key',label:'假说-演绎法',content:'步骤：观察现象→提出问题→提出假说→演绎推理→实验验证→得出结论。经典应用：①孟德尔遗传定律的发现；②摩尔根证明基因在染色体上；③DNA半保留复制的验证'},
                    {type:'key',label:'模型方法',content:'①物理模型（DNA双螺旋模型、细胞模型）；②概念模型（光合作用过程图解）；③数学模型（种群增长模型Nt=N₀λᵗ）'},
                    {type:'mistake',content:'易错点：自身对照和条件对照的区别——自身对照是同一对象的前后对比，条件对照是对照组接受某种处理但不同于实验组的处理'}
                ]}
            ]},
            {title:'11. PCR引物设计原则与修饰类型归类分析',intro:'PCR技术是分子生物学的核心技术，引物设计是PCR成功的关键。',sections:[
                {subtitle:'引物设计基本原则',points:[
                    {type:'key',label:'引物长度',content:'18-25bp为宜。过短（<18bp）特异性差，易产生非特异性扩增；过长（>30bp）延伸温度升高，扩增效率降低'},
                    {type:'key',label:'GC含量',content:'40%-60%为宜。GC含量影响Tm值和引物稳定性。过高则Tm值偏高、易产生二级结构；过低则结合力不足'},
                    {type:'key',label:'Tm值（解链温度）',content:'Tm=2(A+T)+4(G+C)（简化公式，适用于<20bp）。上下游引物Tm值差应≤2°C，确保两者在相同退火温度下均能有效结合。退火温度一般设为Tm-3~5°C'},
                    {type:'key',label:'3\'端特异性',content:'3\'端最后1-2个碱基应为G或C（GC clamp），增强引物与模板的结合力。3\'端避免连续相同的碱基（特别是G），防止错配引发非特异性延伸'},
                    {type:'key',label:'避免二级结构',content:'引物自身不应形成发夹结构（stem-loop），尤其3\'端；引物间不应形成二聚体（primer dimer），尤其3\'端互补。自身互补序列≤4bp，引物间互补≤5bp'},
                    {type:'key',label:'特异性',content:'引物序列应在目标基因组中唯一，避免与其它区域高度同源。可通过BLAST比对验证特异性'}
                ]},
                {subtitle:'引物修饰类型及应用',points:[
                    {type:'key',label:'荧光标记引物',content:'5\'端连接荧光基团（FAM、HEX、TAMRA等）。应用：①实时荧光定量PCR（qPCR）中的TaqMan探针法；②基因分型（SNP检测）；③STR分型（法医DNA鉴定）'},
                    {type:'key',label:'磷酸化修饰',content:'5\'端添加磷酸基团。应用：①连接酶链式反应（LCR）；②克隆时提高平末端连接效率；③构建DNA文库'},
                    {type:'key',label:'生物素标记引物',content:'5\'端连接生物素（Biotin）。应用：①与链霉亲和素磁珠结合进行靶序列捕获；②Southern/Northern杂交检测；③亲和纯化特定DNA片段'},
                    {type:'key',label:'锁核酸（LNA）修饰',content:'核糖2\'-O与4\'-C之间亚甲基桥锁定构象。应用：提高引物Tm值（每个LNA修饰提高2-8°C），增强特异性，适用于高GC含量区域或SNP检测'},
                    {type:'key',label:'简并引物',content:'在特定位置使用混合碱基（如R=A/G，Y=C/T）。应用：根据氨基酸序列反推设计引物时，密码子简并性需要简并引物'},
                    {type:'key',label:'加尾引物',content:'5\'端添加非模板序列（如限制酶位点、启动子序列、标签序列）。应用：①添加限制酶位点便于克隆；②添加T7/SP6启动子用于体外转录；③添加His-tag用于蛋白纯化'},
                    {type:'mistake',content:'易错点：引物5\'端修饰不影响PCR扩增特异性（5\'端不参与延伸），但3\'端修饰会阻止DNA聚合酶延伸——3\'端不能进行荧光标记等修饰（除非用特殊聚合酶）'}
                ]}
            ]},
            {title:'12. 生物实验设计与增分指导（贴合广东高考卷）',intro:'广东高考生物实验设计题分值高、综合性强，掌握命题规律和解题框架是提分关键。',sections:[
                {subtitle:'广东高考实验设计题命题规律',points:[
                    {type:'key',label:'命题特点',content:'①以教材实验为基础进行拓展延伸；②注重实验设计的完整性和科学性；③常考探究性实验（自变量-因变量-无关变量）；④关注实验结果的分析与结论推导；⑤近年趋势：结合真实科研情境，考查信息提取和实验设计能力'},
                    {type:'key',label:'高频考点',content:'①酶相关实验（最适条件、专一性、竞争性抑制）；②光合/呼吸速率测定实验；③生长素两重性探究；④微生物培养与筛选；⑤遗传实验设计（验证遗传方式、基因定位）'}
                ]},
                {subtitle:'实验设计完整框架',points:[
                    {type:'key',label:'实验目的',content:'明确要探究/验证的问题。格式："探究/验证……对……的影响"或"探究/验证……是否……"'},
                    {type:'key',label:'实验原理',content:'实验依据的生物学原理。需写明：①自变量如何影响因变量的机制；②检测指标与因变量的关系'},
                    {type:'key',label:'实验步骤',content:'①分组编号：取……随机均分为A、B两组（或更多组）；②实验处理：A组（实验组）加入/施加……，B组（对照组）加入/施加等量……；③观察记录：在相同且适宜条件下培养/处理，观察并记录……（因变量指标）'},
                    {type:'key',label:'结果预测与分析',content:'若A组……而B组……，则说明……（结论）。注意：探究性实验需预测所有可能结果并分别给出结论；验证性实验只需预测预期结果'},
                    {type:'key',label:'注意事项',content:'①等量原则：各组加入的量必须相同（"等量""适量""适宜"）；②单一变量原则：只有自变量不同；③可重复性：实验需可重复；④生物学表达：用专业术语'}
                ]},
                {subtitle:'增分技巧',points:[
                    {type:'key',label:'审题技巧',content:'①圈出关键词（"探究"vs"验证"、"大于"vs"不小于"）；②确定自变量和因变量；③注意实验材料和试剂的限制；④关注"进一步""在此基础上"等拓展要求'},
                    {type:'key',label:'书写规范',content:'①步骤用①②③编号，条理清晰；②实验组和对照组明确标注；③检测方法要具体（不能只写"观察"，要写"观察并记录……"）；④结论要完整（"说明……对……有促进/抑制作用"）'},
                    {type:'key',label:'常见扣分点',content:'①未设对照或对照不严密；②未遵循等量原则；③实验步骤不完整（缺少观察记录）；④结论与结果不对应；⑤使用非生物学用语'},
                    {type:'example',content:'真题示例：探究生长素浓度对扦插枝条生根的影响。步骤：①取生长状况一致的同种植物枝条30根，随机均分为6组；②配制浓度分别为0、1、10、50、100、500 mg/L的生长素溶液，分别浸泡各组枝条基部5min；③将各组枝条扦插在相同基质中，相同适宜条件下培养；④2周后统计各组枝条生根数量和根长。预期：低浓度促进生根，高浓度抑制生根，存在最适浓度'}
                ]}
            ]},
            {title:'13. 基因工程中限制酶与DNA连接酶的选择技巧',intro:'限制酶和DNA连接酶是基因工程的核心工具酶，正确选择是构建表达载体的关键。',sections:[
                {subtitle:'常用限制酶的识别序列与切割特点',points:[
                    {type:'key',label:'II型限制酶',content:'基因工程中最常用的类型。识别特定的回文序列（palindrome），在识别位点内切割。如EcoRI识别GAATTC，HindIII识别AAGCTT，BamHI识别GGATCC'},
                    {type:'key',label:'黏性末端产生酶',content:'切割位置不在识别序列正中，产生5\'或3\'突出末端。如EcoRI（G↓AATTC）产生5\'黏性末端AATT；PstI（CTGCA↓G）产生3\'黏性末端TGCA'},
                    {type:'key',label:'平末端产生酶',content:'切割位置在识别序列正中，不产生突出末端。如SmaI（CCC↓GGG）、EcoRV（GAT↓ATC）'},
                    {type:'key',label:'同尾酶',content:'识别序列不同但切割后产生相同黏性末端的酶。如BamHI（G↓GATCC）、BglII（A↓GATCT）、Sau3AI（↓GATC）都产生GATC黏性末端，切割产物可互补连接'},
                    {type:'key',label:'同裂酶',content:'识别序列完全相同但来源不同的限制酶。如HpaII和MspI都识别CCGG，但对甲基化敏感性不同（MspI可切甲基化位点）'}
                ]},
                {subtitle:'黏性末端与平末端连接的差异',points:[
                    {type:'key',label:'黏性末端连接',content:'互补碱基配对→T4 DNA连接酶连接磷酸二酯键。效率高、方向性强。但载体自连率也高（需用碱性磷酸酶CIP/SAP处理载体5\'端去磷酸化防止自连）'},
                    {type:'key',label:'平末端连接',content:'无互补配对→T4 DNA连接酶直接连接。效率低（约为黏性末端的1/10-1/100）、无方向性、需高浓度酶和底物。可通过加接头（linker）或加尾（homopolymer tailing）转为黏性末端连接'},
                    {type:'key',label:'TA克隆',content:'Taq DNA聚合酶在PCR产物3\'端自动添加一个A→与T载体的3\'端T互补→高效克隆PCR产物。简便但无方向性'}
                ]},
                {subtitle:'限制酶组合选择原则',points:[
                    {type:'key',label:'原则一：避免破坏目的基因',content:'选择的目的基因内部不含所选限制酶识别位点的酶。若目的基因内有EcoRI位点则不能用EcoRI切割'},
                    {type:'key',label:'原则二：确保定向插入',content:'用两种不同的限制酶分别切割载体和目的基因的两端（双酶切），使目的基因只能以一个方向插入载体，防止反向连接'},
                    {type:'key',label:'原则三：防止载体自连',content:'双酶切产生不同黏性末端，载体两端不能自连接。单酶切时需用碱性磷酸酶处理防止自连'},
                    {type:'key',label:'原则四：考虑标记基因完整性',content:'限制酶切割不应破坏载体上的标记基因（如氨苄青霉素抗性基因），否则无法筛选阳性克隆'},
                    {type:'key',label:'原则五：MCS（多克隆位点）选择',content:'优先使用载体MCS上的酶切位点，确保在启动子和终止子之间的正确位置插入'},
                    {type:'example',content:'例题：某质粒MCS含EcoRI、BamHI、HindIII位点，目的基因两端分别含EcoRI和BamHI位点。选择EcoRI和BamHI双酶切质粒和目的基因→目的基因定向插入→转化→用含氨苄青霉素的培养基筛选阳性克隆→再用酶切或PCR验证插入方向'},
                    {type:'mistake',content:'易错点：①同尾酶切割产物可连接但可能不再被原酶识别（如BamHI和BglII连接后产生混合序列GGATCT，既不被BamHI也不被BglII切割）；②单酶切导致目的基因可正可反插入，需进一步验证方向'}
                ]},
                {subtitle:'DNA连接酶的适用条件',points:[
                    {type:'key',label:'T4 DNA连接酶',content:'最常用的DNA连接酶。既能连接黏性末端也能连接平末端。需要ATP供能。平末端连接效率远低于黏性末端'},
                    {type:'key',label:'E.coli DNA连接酶',content:'只能连接黏性末端，不能连接平末端。来源大肠杆菌，需要NAD⁺供能'},
                    {type:'key',label:'选择原则',content:'黏性末端连接：T4或E.coli DNA连接酶均可；平末端连接：只能用T4 DNA连接酶；一般实验中统一使用T4 DNA连接酶'}
                ]}
            ]}
        ]};
    },

    buildPhysicsKnowledgeGraph:function(){
        this.physicsKnowledgeGraph={
            examFramework:{
                scoreWeights:[
                    {module:'力学（含运动学/动力学/动量能量）',score:45,priority:1},
                    {module:'电磁学（含静电/恒定电流/电磁感应）',score:30,priority:2},
                    {module:'热学',score:10,priority:3},
                    {module:'光学/机械波',score:8,priority:4},
                    {module:'原子物理/近代物理',score:7,priority:5}
                ]
            },
            experimentScoring:{
                total:12,
                dimensions:[
                    {name:'原理分',score:3,desc:'实验原理正确、公式推导完整'},
                    {name:'操作分',score:3,desc:'步骤规范、仪器使用正确、先后顺序合理'},
                    {name:'数据处理',score:3,desc:'读数规范、有效数字、作图规范'},
                    {name:'误差分析',score:2,desc:'系统误差/偶然误差识别与减小方法'},
                    {name:'结论分',score:1,desc:'结论与数据一致、表述规范'}
                ]
            },
            topics:[
                {id:'P_01',name:'匀变速直线运动规律与图像',module:'必修1',weight:0.08,
                    concept:'匀变速直线运动基本公式：v=v₀+at、x=v₀t+½at²、v²-v₀²=2ax。v-t图像斜率=加速度，面积=位移。x-t图像斜率=速度。追及相遇问题核心：速度相等时距离极值。',
                    diagram:'v-t图像（斜率/面积/截距含义）；x-t图像；追及相遇的v-t图与位置关系图；纸带分析图。',
                    experiment:'打点计时器测速度和加速度：逐差法求a=(x₄+x₅+x₆-x₁-x₂-x₃)/(9T²)。',
                    pitfall:'①混淆平均速度与瞬时速度（v̄=Δx/Δt是平均速度，非某时刻瞬时速度）。②逐差法求a时T取错（应取计数点间隔而非打点间隔）。③v-t图面积有正负（t轴下方为负位移）。',
                    examRef:'广东卷每年必考1-2题',
                    strategy:'掌握v-t图像的"三看"：看斜率（加速度）、看面积（位移）、看截距（初速度）。追及问题画v-t图找速度相等时刻。'},
                {id:'P_02',name:'牛顿运动定律与连接体问题',module:'必修1',weight:0.10,
                    concept:'牛顿三定律：惯性定律、F=ma、作用力与反作用力。连接体问题：整体法求加速度，隔离法求内力。超重（a向上）失重（a向下）判断：N与mg关系。',
                    diagram:'受力分析图（重力/弹力/摩擦力/外力）；连接体整体与隔离分析图；斜面体问题受力分解图。',
                    experiment:'验证牛顿第二定律：控制变量法，先保持m不变研究a-F关系，再保持F不变研究a-1/m关系。注意平衡摩擦力。',
                    pitfall:'①作用力与反作用力作用在不同物体上（不能抵消）。②整体法使用条件：加速度相同。③斜面问题分解力而非分解加速度。',
                    examRef:'广东卷高频考点，2025T14',
                    strategy:'连接体问题"先整体后隔离"：整体法求a→隔离法求T/N。斜面问题建立沿斜面和垂直斜面坐标系。'},
                {id:'P_03',name:'平抛运动与圆周运动',module:'必修2',weight:0.09,
                    concept:'平抛：水平匀速+竖直自由落体，t=√(2h/g)，x=v₀t，tanα=2tanβ（α速度偏向角，β位移偏向角）。圆周：向心力F=mv²/r=mω²r，竖直平面圆周最高点临界v=√(gr)。',
                    diagram:'平抛运动轨迹与速度分解图；竖直平面圆周临界分析图；圆锥摆受力分析图。',
                    experiment:'平抛运动实验：描迹法，确保斜槽末端水平。竖直方向y=½gt²验证自由落体。',
                    pitfall:'①平抛运动落地时间只与高度有关，与初速度无关。②竖直平面圆周最高点临界条件：绳模型v≥√(gr)，杆模型v≥0。③向心力不是独立的力，是合力的效果。',
                    examRef:'广东卷每年必考',
                    strategy:'平抛问题分解为两个独立方向处理。圆周问题"找圆心→画半径→分析向心力来源"。'},
                {id:'P_04',name:'万有引力与天体运动',module:'必修2',weight:0.08,
                    concept:'万有引力F=GMm/r²。卫星运动：GMm/r²=mv²/r=mω²r=m4π²r/T²。第一宇宙速度v₁=√(gR)=7.9km/s。同步卫星：轨道唯一（赤道上方，h≈36000km，T=24h）。',
                    diagram:'卫星轨道对比图（近地/同步/月球）；双星系统运动图；变轨过程速度变化分析。',
                    experiment:'卡文迪许扭秤实验测定G值："称量地球质量"。',
                    pitfall:'①卫星变轨：点火加速→椭圆轨道→远地点再加速→高轨道（高轨道速度反而小）。②同步卫星不能在任意纬度上方。③黄金代换：GM=gR²（仅在地面附近成立）。',
                    examRef:'广东卷2024T7、2025T8',
                    strategy:'卫星问题核心方程：万有引力=向心力。掌握"一个方程推所有"：由GMm/r²=mv²/r可推出v、ω、T、a的表达式。'},
                {id:'P_05',name:'动能定理与机械能守恒',module:'必修2',weight:0.09,
                    concept:'动能定理：W合=ΔEk=½mv²-½mv₀²（过程量=状态量差）。机械能守恒条件：只有重力或弹力做功。功能关系：W_G=-ΔE_p，W_其他=ΔE_机。',
                    diagram:'功能关系流程图；机械能守恒判断流程；弹簧-物体系统能量转化图。',
                    experiment:'验证机械能守恒定律：自由落体，mgh=½mv²，v由打点计时器测得。无需测质量m。',
                    pitfall:'①动能定理是标量方程，不需分解力。②机械能守恒条件不是"合外力为零"（匀速上升不守恒）。③摩擦力做功W=fs（s是路程非位移）。',
                    examRef:'广东卷每年必考大题',
                    strategy:'优先用动能定理（最通用）：明确初末态→算合外力做功→列方程。判断守恒：检查是否只有重力/弹力做功。'},
                {id:'P_06',name:'动量守恒与碰撞',module:'选择性必修1',weight:0.08,
                    concept:'动量守恒条件：系统合外力为零或内力远大于外力。弹性碰撞：动量+动能都守恒。完全非弹性碰撞：碰后粘合，动能损失最大。反冲运动：总动量为零时m₁v₁+m₂v₂=0。',
                    diagram:'碰撞前后速度关系图；反冲运动示意图；子弹打木块模型能量转化图。',
                    experiment:'验证动量守恒：平抛法，用水平位移替代速度。m₁·OP=m₁·OM+m₂·O\'N。',
                    pitfall:'①动量守恒条件是合外力为零，不是"没有外力"。②碰撞中动能不可能增大。③某一方向合外力为零则该方向动量守恒。',
                    examRef:'广东卷2025T15',
                    strategy:'碰撞问题：判断类型→选系统→列守恒方程。爆炸/反冲：内力远大于外力，动量近似守恒。'},
                {id:'P_07',name:'电场强度与电势',module:'选择性必修2',weight:0.08,
                    concept:'电场强度E=F/q（定义式）、E=kQ/r²（点电荷）、E=U/d（匀强电场）。电势φ=Ep/q，等势面与电场线垂直。电势差U=Ed（匀强电场）。E和φ无直接关系。',
                    diagram:'等量异种/同种电荷电场线与等势面分布图；匀强电场中电势均匀变化图；电场线与等势面关系图。',
                    experiment:'用描迹法画出等势线：利用电流计找等势点，再画出等势线和电场线。',
                    pitfall:'①E=0处φ不一定为0（等量同种电荷连线中点）。②沿电场线方向电势降低（非"升高"）。③正电荷从高电势到低电势电场力做正功。',
                    examRef:'广东卷每年必考',
                    strategy:'电场问题"三看"：看电场线疏密（E大小）、看方向（E方向/φ高低）、看等势面（φ相等）。'},
                {id:'P_08',name:'电磁感应与力学综合',module:'选择性必修2',weight:0.10,
                    concept:'法拉第电磁感应定律：E=nΔΦ/Δt。导体切割：E=BLv。楞次定律：感应电流阻碍变化。安培力F=BIL。电磁感应中的力学问题：安培力随速度变化→加速度变化→最终匀速（a=0）。',
                    diagram:'导体棒切割磁力线受力分析图；电磁感应中v-t图像；线框穿过磁场过程分析图。',
                    experiment:'验证楞次定律：用灵敏电流计判断感应电流方向。',
                    pitfall:'①楞次定律"阻碍"不是"阻止"（只是减缓变化）。②安培力方向用左手定则，感应电流方向用右手定则。③最终匀速时F外=F安=B²L²v/R。',
                    examRef:'广东卷每年必考压轴题',
                    strategy:'电磁感应力学综合：画受力图→列牛顿第二定律→分析v-a关系→找终态（a=0）。能量守恒：W外=Q+W安。'},
                {id:'P_09',name:'交变电流与变压器',module:'选择性必修2',weight:0.05,
                    concept:'交变电流：e=Emsinωt，Em=nBSω。有效值：U=Um/√2（正弦交流）。变压器：U₁/U₂=n₁/n₂，P₁=P₂（理想）。远距离输电：P损=(P/U)²·R线。',
                    diagram:'交流电波形图（峰值/有效值/周期）；变压器电路图；远距离输电示意图。',
                    experiment:'示波器观察交流电波形，测量峰值和周期。',
                    pitfall:'①有效值≠平均值（计算电功率用有效值，计算电荷量用平均值）。②变压器不能改变直流电压。③输电线上损失功率P损=I²R线=(P/U)²R线（提高U可减小P损）。',
                    examRef:'广东卷2024T6',
                    strategy:'交流电"四值"区分：瞬时值/峰值/有效值/平均值各有用途。变压器问题用功率守恒P₁=P₂。'},
                {id:'P_10',name:'光电效应与波粒二象性',module:'选择性必修3',weight:0.05,
                    concept:'光电效应：Ek=hν-W₀（爱因斯坦光电方程）。截止频率ν₀=W₀/h。极限电压Uc=Ek/e。光的波粒二象性：个别光子表现为粒子性，大量光子表现为波动性。',
                    diagram:'光电效应实验装置图；Ek-ν图像（斜率=h，截距=-W₀）；I-U图像。',
                    experiment:'测定遏止电压和截止频率：用不同频率光照射，测遏止电压Uc，作Uc-ν图线求h和W₀。',
                    pitfall:'①光电子最大初动能与光强无关，与频率成线性关系。②存在截止频率，低于此频率无论光多强都不发生光电效应。③光的干涉衍射证明波动性，光电效应证明粒子性。',
                    examRef:'广东卷2025T5',
                    strategy:'光电效应核心方程Ek=hν-W₀。Ek-ν图像：斜率=h（普朗克常量），横截距=ν₀，纵截距=-W₀。'}
            ],
            relations:[
                {from:'P_01',to:'P_02',type:'PRECEDES',desc:'运动学是牛顿定律的基础'},
                {from:'P_02',to:'P_05',type:'PRECEDES',desc:'牛顿定律→功和能的桥梁'},
                {from:'P_03',to:'P_04',type:'PRECEDES',desc:'圆周运动→天体运动'},
                {from:'P_05',to:'P_06',type:'PRECEDES',desc:'能量观点→动量观点'},
                {from:'P_07',to:'P_08',type:'PRECEDES',desc:'电场→电磁感应'},
                {from:'P_08',to:'P_09',type:'PRECEDES',desc:'电磁感应→交流电'}
            ]
        };
    },

    buildChemistryKnowledgeGraph:function(){
        this.chemistryKnowledgeGraph={
            examFramework:{
                scoreWeights:[
                    {module:'化学反应原理（速率/平衡/电离水解）',score:30,priority:1},
                    {module:'无机元素化合物（金属/非金属）',score:20,priority:2},
                    {module:'有机化学（结构/性质/合成）',score:20,priority:3},
                    {module:'化学实验（基本操作/分离/制备）',score:15,priority:4},
                    {module:'物质结构与性质/电化学',score:15,priority:5}
                ]
            },
            experimentScoring:{
                total:12,
                dimensions:[
                    {name:'装置分',score:3,desc:'仪器选择正确、连接顺序合理、气密性检查'},
                    {name:'操作分',score:3,desc:'加药顺序、加热方式、除杂干燥方法'},
                    {name:'现象分',score:2,desc:'现象描述准确、颜色变化、沉淀气体'},
                    {name:'原理分',score:2,desc:'反应方程式正确、反应类型判断'},
                    {name:'安全环保分',score:2,desc:'尾气处理、安全措施、绿色化学意识'}
                ]
            },
            topics:[
                {id:'C_01',name:'氧化还原反应与离子方程式',module:'必修1',weight:0.10,
                    concept:'氧化还原反应本质：电子转移。口诀"升失氧还、降得还氧"。离子方程式书写：拆强酸强碱可溶盐、保留弱电解质/沉淀/气体。氧化性/还原性强弱比较：根据反应方向判断。',
                    diagram:'氧化还原反应电子转移示意图；离子共存判断流程图；原电池电子流向图。',
                    experiment:'原电池实验：验证氧化还原反应的电子转移。电解池实验：验证电极产物。',
                    pitfall:'①离子方程式不能拆弱酸(H₂CO₃/CH₃COOH)、弱碱(NH₃·H₂O)、难溶物(AgCl/BaSO₄)、氧化物(CuO)。②过量问题：少量物质按化学式写，过量物质按实际反应写。③"归中反应"中同一元素不同价态向中间靠拢。',
                    examRef:'广东卷每年必考2-3题',
                    strategy:'氧化还原三步法：标化合价→找升降→配平。离子方程式四查：拆/删/查/等。'},
                {id:'C_02',name:'钠及其化合物',module:'必修1',weight:0.06,
                    concept:'钠：活泼金属，与水反应2Na+2H₂O→2NaOH+H₂↑。Na₂O₂：过氧化物，与水/CO₂反应均产生O₂（2Na₂O₂+2H₂O→4NaOH+O₂↑）。Na₂CO₃与NaHCO₃：正盐>酸式盐稳定性，相互转化。',
                    diagram:'钠与水反应现象图（浮/熔/游/响/红）；Na₂O₂与CO₂/H₂O反应对比图；焰色反应图。',
                    experiment:'钠与水反应实验：观察浮、熔、游、响、红五现象。Na₂CO₃与NaHCO₃热稳定性对比。',
                    pitfall:'①Na₂O₂与水反应：Na₂O₂既是氧化剂又是还原剂（O₂来自-1价O的歧化）。②NaHCO₃与NaOH反应不产生气体。③Na投入CuSO₄溶液：先与水反应生成NaOH，再NaOH与CuSO₄反应生成Cu(OH)₂沉淀。',
                    examRef:'广东卷2024T3',
                    strategy:'钠的化合物重点掌握Na₂O₂的特殊性质（供氧剂/漂白剂/强氧化性）。Na₂CO₃与NaHCO₃的"三比较"：溶解性/稳定性/与酸反应。'},
                {id:'C_03',name:'铁铜及其化合物',module:'必修1',weight:0.06,
                    concept:'Fe³⁺（黄色）→加KSCN变红（检验Fe³⁺）。Fe²⁺（浅绿色）→加NaOH生成白色沉淀→迅速变灰绿→最终变红褐色。Fe(OH)₂→Fe(OH)³氧化过程。铜：Cu²⁺蓝色溶液，CuO黑色，Cu₂O红色。',
                    diagram:'Fe²⁺/Fe³⁺检验方法对比图；铁的化合物颜色变化图；铜的化合物颜色图。',
                    experiment:'Fe(OH)₂制备：将吸有NaOH溶液的胶头滴管插入FeSO₄溶液液面以下，防止氧化。',
                    pitfall:'①Fe³⁺检验用KSCN（非NaOH），Fe²⁺检验先用KSCN不变红再加氯水变红。②Fe(OH)₂白色沉淀极不稳定，必须隔绝空气制备。③Cu与稀硝酸反应生成NO（非NO₂），与浓硝酸生成NO₂。',
                    examRef:'广东卷2025T4',
                    strategy:'铁的"三角"转化：Fe⇌Fe²⁺⇌Fe³⁺。掌握各步所需氧化剂/还原剂。'},
                {id:'C_04',name:'化学反应速率与化学平衡',module:'选择性必修1',weight:0.10,
                    concept:'反应速率v=Δc/Δt，单位mol/(L·min)。平衡标志：等速（v正=v逆）、定浓（各组分浓度不变）。平衡移动：勒夏特列原理——改变条件，平衡向减弱该改变的方向移动。等效平衡：同温同容，极限转化后相同。',
                    diagram:'v-t图（改变条件后正逆反应速率变化）；浓度-时间图；转化率-温度/压强图。',
                    experiment:'温度/浓度对化学平衡的影响：Fe³⁺+3SCN⁻⇌Fe(SCN)₃（红色），改变浓度观察颜色变化。',
                    pitfall:'①催化剂同等程度加快正逆反应速率，不影响平衡移动。②增大压强：平衡向气体分子数少的方向移动（但若Δn=0则不移动）。③充入惰性气体：恒容无影响，恒压相当于减压。',
                    examRef:'广东卷每年必考',
                    strategy:'平衡移动判断三步：确定改变的条件→判断正逆反应速率变化→确定移动方向。等效平衡：极限转化法。'},
                {id:'C_05',name:'电化学（原电池/电解池）',module:'选择性必修1',weight:0.08,
                    concept:'原电池：化学能→电能，负极氧化（失电子），正极还原（得电子）。电解池：电能→化学能，阳极氧化，阴极还原。放电顺序：阳极活泼金属>Cl⁻>OH⁻，阴极Ag⁺>Cu²⁺>H⁺。金属腐蚀：吸氧腐蚀为主。',
                    diagram:'原电池/电解池装置图；电子流向图；金属腐蚀与防护示意图；二次电池充放电图。',
                    experiment:'锌铜原电池实验；电解饱和食盐水；电镀实验。',
                    pitfall:'①原电池正极得电子（还原反应），电解池阳极失电子（氧化反应）——注意区别。②二次电池充电时：原正极→阳极，原负极→阴极。③牺牲阳极的阴极保护法：被保护金属作正极（阴极）。',
                    examRef:'广东卷每年必考1-2题',
                    strategy:'电化学"口诀"：原电池"负氧正还"，电解池"阳氧阴还"。写电极反应式：先写总反应→再拆分。'},
                {id:'C_06',name:'弱电解质的电离平衡',module:'选择性必修1',weight:0.07,
                    concept:'弱电解质电离是可逆过程：CH₃COOH⇌CH₃COO⁻+H⁺。电离度α=已电离分子数/总分子数。稀释定律：稀释弱电解质，电离度增大，但H⁺浓度减小。同离子效应：加入相同离子使电离平衡逆向移动。',
                    diagram:'电离平衡移动图；稀释过程中α和c(H⁺)变化图；pH滴定曲线。',
                    experiment:'强弱电解质对比：同浓度HCl和CH₃COOH与Mg反应速率比较/导电性比较。',
                    pitfall:'①弱酸加水稀释：电离度α增大，但c(H⁺)减小（pH增大）。②pH相同的强酸和弱酸：弱酸浓度大、中和能力强。③多元弱酸分步电离，以第一步为主。',
                    examRef:'广东卷2025T11',
                    strategy:'弱电解质问题核心：平衡移动+勒夏特列原理。稀释问题：α↑但c↓。'},
                {id:'C_07',name:'盐类水解与离子浓度大小',module:'选择性必修1',weight:0.07,
                    concept:'盐类水解：有弱才水解，无弱不水解。谁强显谁性。双水解：Al³⁺与CO₃²⁻/HCO₃⁻/S²⁻完全水解。离子浓度大小比较：物料守恒、电荷守恒、质子守恒三大守恒。',
                    diagram:'盐类水解平衡图；离子浓度大小排序图；三大守恒关系图。',
                    experiment:'盐溶液酸碱性检验：用pH试纸测Na₂CO₃（碱性）、NH₄Cl（酸性）、NaCl（中性）。',
                    pitfall:'①NaHCO₃溶液显碱性（HCO₃⁻水解>电离）。②离子浓度排序先写三大守恒再比较。③双水解反应方程式要写"↓"和"↑"。',
                    examRef:'广东卷每年必考',
                    strategy:'离子浓度排序三步：写三大守恒→判断主次（水解vs电离）→排序。'},
                {id:'C_08',name:'有机化学基础（烃与烃的衍生物）',module:'选择性必修2',weight:0.10,
                    concept:'烷烃：取代反应（光照）。烯烃：加成反应（加Br₂/H₂/HX）、加聚反应。醇→醛→酸：氧化链。酯化反应：酸+醇→酯+水（可逆，浓硫酸催化）。同分异构体：碳链/位置/官能团异构。',
                    diagram:'有机物转化关系图（醇→醛→酸→酯）；同分异构体书写流程图；官能团特征反应图。',
                    experiment:'乙酸乙酯制备：乙醇+冰醋酸+浓硫酸→水浴加热→饱和Na₂CO₃收集。银镜反应检验醛基。',
                    pitfall:'①酯化反应机理：酸脱羟基醇脱氢（¹⁸O示踪法验证）。②苯不能使KMnO₄褪色（非烯烃）。③卤代烃消去反应：NaOH醇溶液加热（非水溶液）。',
                    examRef:'广东卷每年必考有机大题',
                    strategy:'有机推断"三看"：看官能团（特征反应）、看碳架（支链/环）、看分子式（不饱和度）。'},
                {id:'C_09',name:'化学实验基本操作与安全',module:'必修1',weight:0.06,
                    concept:'基本操作：称量/量取/溶解/过滤/蒸发/蒸馏/萃取。安全规则：防倒吸、防暴沸（加碎瓷片）、防炸裂、尾气处理。装置气密性检查：封闭一端→另一端导管插入水中→微热→观察气泡。',
                    diagram:'蒸馏装置图（温度计位置/冷凝管方向）；过滤操作图（一贴二低三靠）；尾气处理装置图。',
                    experiment:'蒸馏操作练习；过滤操作练习；气密性检查。',
                    pitfall:'①蒸馏温度计水银球在支管口（非液面以下）。②冷凝管水流方向：下进上出（逆流冷却）。③分液时下层液体从下口放出，上层从上口倒出。',
                    examRef:'广东卷每年必考实验题',
                    strategy:'实验操作"三规范"：装置连接顺序（发生→除杂→干燥→收集→尾气）、安全措施（防倒吸/防暴沸）、数据处理（有效数字/误差分析）。'},
                {id:'C_10',name:'工业流程与元素化合物综合',module:'综合',weight:0.08,
                    concept:'工业流程题核心：原料预处理→反应→分离提纯→产品。关键操作：焙烧/酸浸/碱浸/调节pH/蒸发结晶/冷却结晶。元素化合物知识网络：Na→Na₂O→Na₂O₂→NaOH→Na₂CO₃/NaHCO₃。',
                    diagram:'工业流程图（方框图分析）；元素化合物转化关系图；沉淀pH范围图。',
                    experiment:'模拟工业流程：从矿石中提取金属/从废液中回收物质。',
                    pitfall:'①焙烧目的：使有效成分转化为可溶物/改变价态。②调节pH目的：使杂质离子沉淀而目标离子不沉淀。③"蒸发浓缩、冷却结晶"vs"蒸发结晶"：前者得到含结晶水的晶体，后者得到无水物。',
                    examRef:'广东卷每年必考大题',
                    strategy:'工业流程"三读"：读标题（目标产物）、读箭头（物质流向）、读条件（操作目的）。答题模板：操作+目的+原理。'}
            ],
            relations:[
                {from:'C_01',to:'C_05',type:'PRECEDES',desc:'氧化还原→电化学'},
                {from:'C_02',to:'C_10',type:'PRECEDES',desc:'钠化合物→工业流程'},
                {from:'C_03',to:'C_10',type:'PRECEDES',desc:'铁铜化合物→工业流程'},
                {from:'C_04',to:'C_06',type:'PRECEDES',desc:'化学平衡→电离平衡'},
                {from:'C_06',to:'C_07',type:'PRECEDES',desc:'电离平衡→盐类水解'},
                {from:'C_09',to:'C_10',type:'PRECEDES',desc:'实验操作→工业流程'}
            ]
        };
    },

    buildAnswerSkills:function(){
        this.answerSkills={
            physics:{
                name:'物理',
                sections:[
                    {title:'⚡ 选择题答题技巧',items:[
                        {label:'排除法',content:'先排除明显错误选项，缩小选择范围。特别注意"一定""不可能"等绝对性表述'},
                        {label:'特殊值法',content:'代入特殊值（如0、1、无穷大）验证选项，快速排除错误答案'},
                        {label:'量纲分析法',content:'检查选项的量纲（单位）是否正确，量纲不一致的选项直接排除'},
                        {label:'极限分析法',content:'将变量推向极端（如m→0、R→∞）判断物理量的变化趋势'},
                        {label:'对称法',content:'利用物理系统的对称性简化分析，如均匀电场中对称点的场强关系'},
                        {label:'图像法',content:'利用v-t图、F-a图等图像直观判断物理量关系，注意斜率和面积的含义'}
                    ]},
                    {title:'📐 计算题答题规范',items:[
                        {label:'受力分析',content:'先画受力图，按"一重二弹三摩擦四其他"顺序，不遗漏、不重复'},
                        {label:'运动过程分析',content:'明确每个过程的初末状态、受力情况和运动性质，分段列式'},
                        {label:'正交分解法',content:'选取合适坐标轴（通常沿加速度方向和垂直方向），分解力和运动'},
                        {label:'能量守恒优先',content:'涉及功和能量的问题优先用动能定理/能量守恒，避免复杂的运动学方程'},
                        {label:'规范书写',content:'必须写出原始公式（不能直接写变形公式），代入数据带单位，最终结果保留有效数字'}
                    ]},
                    {title:'🎯 高频考点',items:[
                        {label:'牛顿运动定律',content:'连接体问题（整体法+隔离法）、超重失重、传送带问题、板块模型'},
                        {label:'电磁感应',content:'导体棒切割磁力线（E=BLv）、感应电流方向（右手定则/楞次定律）、安培力做功与能量转化'},
                        {label:'带电粒子运动',content:'匀强磁场中圆周运动（r=mv/qB）、复合场中运动、质谱仪/回旋加速器'},
                        {label:'力学综合',content:'弹簧问题、碰撞问题（动量+能量守恒）、圆周运动临界问题'},
                        {label:'实验题',content:'仪器读数（估读规则）、电路设计（内接/外接、分压/限流）、误差分析'}
                    ]}
                ]
            },
            chemistry:{
                name:'化学',
                sections:[
                    {title:'⚡ 选择题答题技巧',items:[
                        {label:'守恒法',content:'原子守恒、电荷守恒、电子守恒、质量守恒，快速建立等量关系'},
                        {label:'极端假设法',content:'假设反应完全进行或完全不反应，确定取值范围'},
                        {label:'差量法',content:'利用反应前后质量差、体积差、物质的量差建立比例关系'},
                        {label:'关系式法',content:'根据化学方程式建立起始物与终产物之间的直接计量关系，跳过中间步骤'},
                        {label:'十字交叉法',content:'求混合物中两组分的物质的量之比或质量之比'},
                        {label:'平均值法',content:'利用平均相对分子质量、平均摩尔质量等判断混合物组成'}
                    ]},
                    {title:'📐 计算题答题规范',items:[
                        {label:'三段式法',content:'写出起始量、转化量、平衡量，列式计算化学平衡问题'},
                        {label:'电子守恒',content:'氧化还原反应计算中，氧化剂得电子总数=还原剂失电子总数'},
                        {label:'电荷守恒',content:'溶液中所有阳离子正电荷总数=所有阴离子负电荷总数'},
                        {label:'物料守恒',content:'溶液中某元素的总物质的量等于其各种存在形式的物质的量之和'},
                        {label:'规范书写',content:'方程式必须配平、注明条件（加热/催化剂/高温）、标气体/沉淀符号'}
                    ]},
                    {title:'🎯 高频考点',items:[
                        {label:'NA计算',content:'注意标准状况条件、物质状态（水/CCl₄非气态）、可逆反应、弱电解质电离'},
                        {label:'离子共存',content:'注意隐含条件（酸性/碱性/氧化性/还原性环境），逐项分析'},
                        {label:'电化学',content:'原电池正负极判断、电解产物分析、电子守恒计算、新型电池分析'},
                        {label:'化学平衡',content:'等效平衡判断、平衡移动方向、转化率/平衡常数计算、图像分析'},
                        {label:'有机推断',content:'特征反应推断官能团、分子式确定、同分异构体书写、合成路线设计'}
                    ]}
                ]
            },
            biology:{
                name:'生物',
                sections:[
                    {title:'⚡ 选择题答题技巧',items:[
                        {label:'概念辨析法',content:'准确理解核心概念，区分易混概念（如细胞凋亡vs坏死、有丝vs减数分裂）'},
                        {label:'排除绝对法',content:'含"都""一定""全部"等绝对性词语的选项多为错误选项'},
                        {label:'因果分析法',content:'判断选项中的因果关系是否成立，避免因果倒置或无关因果'},
                        {label:'图形分析法',content:'利用遗传图谱、生理过程图、实验数据图等提取关键信息'},
                        {label:'假设验证法',content:'对不确定选项做出假设，代入已知条件验证是否矛盾'}
                    ]},
                    {title:'📐 非选择题答题规范',items:[
                        {label:'专业术语',content:'必须使用生物学专业术语作答，不能用口语化表达。如"选择性表达"不能写成"选择性表现"'},
                        {label:'完整性',content:'回答要完整，如"原因"类题目要从机理层面分析，不能只答表面现象'},
                        {label:'逻辑性',content:'按因果逻辑顺序作答，先因后果，层层递进'},
                        {label:'实验设计',content:'遵循单一变量原则、对照原则、重复性原则，明确自变量、因变量和无关变量'},
                        {label:'遗传题规范',content:'先写基因型再写表现型，概率计算写出过程，用遗传图解表示'}
                    ]},
                    {title:'🎯 高频考点',items:[
                        {label:'光合与呼吸',content:'光补偿点/光饱和点、真正光合vs净光合、影响因子分析、实验设计'},
                        {label:'遗传规律',content:'自由组合定律概率计算、伴性遗传判断、系谱图分析、实验设计验证'},
                        {label:'调节机制',content:'神经-体液-免疫调节综合、血糖调节、甲状腺激素分级调节、反馈机制'},
                        {label:'生态学',content:'种群数量变化、能量流动计算、碳循环、稳定性分析'},
                        {label:'基因工程',content:'限制酶选择、PCR引物设计、载体构建、检测方法选择'}
                    ]}
                ]
            }
        };
    },

    buildExperimentErrors:function(){
        this.experimentErrors={
            physics:[
                {title:'力学实验易错点',errors:[
                    '验证力的平行四边形定则：弹簧测力计不与纸面平行，导致力的大小和方向测量不准确',
                    '探究a与F、m关系：未平衡摩擦力或平衡过度；未满足M>>m条件导致a-F图线弯曲',
                    '验证机械能守恒：应选打点1和2间距接近2mm的纸带（v₀≈0）；ΔEk略小于ΔEp是空气阻力所致',
                    '验证动量守恒：斜槽末端不水平导致入射球速度方向偏移；未确保碰撞为正碰',
                    '单摆测g：摆角应<5°；摆长=摆线长+摆球半径；应从平衡位置开始计时'
                ]},
                {title:'电学实验易错点',errors:[
                    '伏安法测电阻：电流表内接法R测>R真（适合大电阻），外接法R测<R真（适合小电阻）',
                    '测电源E和r：安培表内接法r测=r真+rA（偏大）；U-I图线纵截距=E，斜率绝对值=r',
                    '描绘伏安特性曲线：必须用分压式接法（电压从0开始连续变化）；电流表外接（小电阻）',
                    '多用电表：欧姆挡换挡后必须重新调零；测电阻时必须断电；读数=示数×倍率',
                    '半偏法测电表内阻：测量值偏小（并联电阻后总电流增大）'
                ]},
                {title:'光学/热学实验易错点',errors:[
                    '测折射率：入射角不宜太大（全反射）或太小（相对误差大）；大头针要竖直插入',
                    '双缝干涉测波长：测量n条亮纹间距再除以(n-1)得相邻条纹间距；L为双缝到屏的距离',
                    '油膜法测分子大小：油酸溶液浓度配制要准确；油膜未完全展开导致d偏大'
                ]}
            ],
            chemistry:[
                {title:'定量实验易错点',errors:[
                    '中和滴定：锥形瓶不能用待测液润洗（浓度偏大）；滴定管需用标准液润洗；仰视读数偏大、俯视偏小',
                    '配制溶液：转移时玻璃棒下端应在刻度线以下；定容时仰视浓度偏小、俯视偏大；冷却后才能转移',
                    '硫酸铜结晶水测定：加热温度不能过高（CuSO₄分解）；需在干燥器中冷却（防吸水）'
                ]},
                {title:'性质实验易错点',errors:[
                    'Na与水反应：取用Na用镊子和滤纸吸干煤油，切去氧化膜，用量要小',
                    'Fe(OH)₂制备：用新制FeSO₄溶液，将滴管插入NaOH溶液液面以下滴加（防氧化）',
                    '焰色反应：铂丝用稀盐酸洗净后在火焰上灼烧至无色；观察K的焰色需透过蓝色钴玻璃'
                ]},
                {title:'有机实验易错点',errors:[
                    '乙酸乙酯制备：浓硫酸先加乙醇再加酸；导管不能插入Na₂CO₃液面以下（防倒吸）',
                    '石油分馏：温度计水银球在支管口附近（测蒸气温度）；冷凝水从下口进上口出',
                    '苯的硝化：水浴加热(50-60°C)；先加浓硝酸再加浓硫酸（密度大后加）'
                ]}
            ],
            biology:[
                {title:'分子与细胞实验易错点',errors:[
                    '观察细胞有丝分裂：解离后细胞已死亡（不能观察动态过程）；大多数细胞处于间期；分生区细胞正方形排列紧密',
                    '质壁分离：选紫色洋葱便于观察；0.3g/mL蔗糖溶液浓度适中；死细胞不能复原',
                    '色素提取分离：SiO₂助研磨、CaCO₃防色素破坏、无水乙醇溶解色素；层析液不能没及滤液细线',
                    '观察DNA/RNA分布：甲基绿-吡罗红染色；盐酸的作用是改变膜通透性+分离染色质',
                    '检测生物组织中的糖类：斐林试剂现配现用，水浴加热；双缩脲试剂先加A液再加B液，不加热'
                ]},
                {title:'遗传与变异实验易错点',errors:[
                    '果蝇杂交实验：处女蝇收集（8h内未交配）；正反交判断常/伴性遗传',
                    'DNA粗提取：0.14mol/L NaCl中DNA溶解度最低；不能用哺乳动物成熟红细胞（无核）',
                    '低温诱导染色体加倍：卡诺固定液固定细胞形态；低温抑制纺锤体形成而非着丝点分裂'
                ]},
                {title:'稳态与环境实验易错点',errors:[
                    '探究生长素类似物浓度：预实验确定浓度范围；注意浓度梯度设置',
                    '种群密度调查：样方法（五点取样/等距取样）适用于植物和活动力弱的动物；标志重捕法适用于活动力强的动物',
                    '土壤小动物丰富度调查：取样器取样法；诱虫器利用动物避光避热趋湿特性'
                ]}
            ]
        };
    },

    buildBiologyKnowledgeGraph:function(){
        this.biologyKnowledgeGraph={
            examFramework:{
                scoreWeights:[
                    {module:'必修2《遗传与进化》',score:30,priority:1},
                    {module:'选必2《生物与环境》',score:25,priority:2},
                    {module:'必修1《分子与细胞》',score:20,priority:3},
                    {module:'选必1《稳态与调节》',score:15,priority:4},
                    {module:'选必3《生物技术与工程》',score:10,priority:5}
                ],
                examTargets:[
                    {name:'知识',weight:'30%'},
                    {name:'材料转化',weight:'30%'},
                    {name:'逻辑推理',weight:'25%'},
                    {name:'实验探究',weight:'15%'}
                ]
            },
            experimentScoring:{
                total:12,
                dimensions:[
                    {name:'结构分',score:4,desc:'标题、原理、步骤、结果、结论五要素齐全'},
                    {name:'变量分',score:3,desc:'自变量、因变量、无关变量界定清晰'},
                    {name:'对照分',score:2,desc:'空白对照、条件对照、自身对照至少一种'},
                    {name:'操作分',score:2,desc:'分组编号、等量处理、平行重复、适宜条件'},
                    {name:'术语分',score:1,desc:'专业名词、单位、浓度表述规范'}
                ]
            },
            topics:[
                {id:'TOPIC_01',name:'蛋白质分选与信号介导运输',module:'必修1《分子与细胞》',weight:0.07,
                    concept:'遵循"信号假说"：N端信号肽在游离核糖体合成，被信号识别颗粒(SRP)识别并暂停翻译，引导至内质网易位子，进行共翻译转运。分泌/膜/溶酶体蛋白经COPⅡ包被膜泡运至高尔基体加工，再经网格蛋白包被膜泡分选。驻留蛋白通过KDEL信号回收。线粒体/叶绿体/核蛋白为翻译后转运，依赖不同定位信号。',
                    diagram:'分泌蛋白合成与运输全路径示意图；³H-亮氨酸时序标记与放射自显影图，显示放射性依次出现在内质网、高尔基体、分泌泡。',
                    experiment:'①酵母sec基因突变体分析：特定突变导致蛋白质在内质网或高尔基体积累，用于研究运输机制。②高温胁迫诱导UPR：研究内质网中未折叠蛋白积压时，细胞如何通过信号通路减少翻译、增加分子伴侣表达以缓解压力。',
                    pitfall:'①混淆COPⅠ（高尔基体→内质网逆向回收）与COPⅡ（内质网→高尔基体顺向运输）的方向。②误认为信号肽在附着核糖体上开始合成（实则在游离核糖体起始）。',
                    examRef:'2025广东T8（非选择题，考查高温下的UPR反应机制）',
                    strategy:'构建路径图：清晰绘制从核糖体起始到最终定位的完整路径图，区分不同途径的起点与信号。辨析易错点：明确信号肽在游离核糖体起始合成；COPⅠ（逆向回收）与COPⅡ（顺向运输）方向相反。关联实验经典：掌握同位素标记追踪法与突变体分析法。'},
                {id:'TOPIC_02',name:'离子泵、质子泵及主动运输类型',module:'必修1《分子与细胞》',weight:0.05,
                    concept:'分为三类：①ATP驱动泵：直接水解ATP供能，如钠钾泵、胃壁细胞膜上的质子泵。②协同转运：间接利用ATP驱动泵建立的离子（如H⁺、Na⁺）电化学梯度供能，如小肠上皮细胞吸收葡萄糖的Na⁺协同运输。③光驱动泵：如某些细菌利用光能。',
                    diagram:'膜蛋白作用模式图，展示泵蛋白构象变化与离子转运；胃酸分泌生理情境图，关联质子泵抑制剂。',
                    experiment:'①奥美拉唑等药物抑酸治疗：通过抑制胃壁细胞质子泵活性减少胃酸分泌。②呼吸抑制剂影响离子吸收：通过阻断ATP合成，抑制依赖ATP的主动运输（如K⁺吸收）。',
                    pitfall:'忽视同种物质在不同细胞的运输方式差异，如葡萄糖进入红细胞为协助扩散，进入小肠上皮细胞为主动运输（协同转运）；Na⁺在神经细胞静息时外流为主动运输（钠钾泵），动作电位时内流为协助扩散。',
                    examRef:'2024广东T5（选择题，考查质子泵功能）',
                    strategy:'辨析能量来源：掌握三类主动运输的能量来源模型，区分"直接消耗ATP"与"利用已建立的离子梯度"。关注情境变式：同种物质在不同细胞运输方式不同，需具体分析。实验探究：掌握从"是否耗能(ATP)"和"是否需载体"两个角度设计验证实验。'},
                {id:'TOPIC_03',name:'逆境胁迫对光合作用的影响',module:'必修1《分子与细胞》',weight:0.06,
                    concept:'核心机制：胁迫（如干旱、盐、高温）→脱落酸等激素信号→气孔关闭→CO₂供应减少（气孔限制）。同时，胁迫直接损伤光合结构（类囊体膜）、降低酶活性、产生活性氧，造成非气孔限制。',
                    diagram:'"净光合速率-气孔导度-胞间CO₂浓度"三线同步变化图；气孔导度下降但胞间CO₂浓度升高，表明主要限制是非气孔因素。',
                    experiment:'干旱锻炼对比实验：将水稻幼苗进行适度干旱处理（锻炼）后，与未锻炼组同时进行重度干旱胁迫，比较其光合参数、抗氧化酶活性及ABA含量变化，探究锻炼的适应机制。',
                    pitfall:'误判"胞间CO₂浓度升高"一定意味着光合作用不受限。实际情况可能是叶肉细胞光合能力严重受损，对CO₂利用减少，导致胞间积累，此时限制因素是非气孔性的。',
                    examRef:'2025广东T21（非选择题，干旱实验设计与分析）',
                    strategy:'掌握判断逻辑：气孔导度下降时，若胞间CO₂浓度也降，主因是气孔限制；若胞间CO₂浓度升高，主因是非气孔限制。构建网络：将胁迫信号→激素变化→生理响应→表型影响串联成网络。关联生产：理解抗逆品种选育、生长调节剂应用的生物学基础。'},
                {id:'TOPIC_04',name:'细胞周期调控与同步化',module:'必修1《分子与细胞》',weight:0.04,
                    concept:'周期受检验点调控（G₁/S、G₂/M、纺锤体组装检查点）。MPF复合物驱动G₂/M转换。同步化方法：TdR双阻断法将细胞阻滞于G₁/S交界；秋水仙素抑制纺锤体形成，阻滞于M期。',
                    diagram:'细胞周期各时期DNA含量分布直方图；同步化处理后不同时间点细胞周期分布变化图。',
                    experiment:'药物毒性实验：先使用试剂K将细胞同步化阻滞于某期，洗脱后加入待测药物甲，观察细胞周期进程和死亡情况，分析药物甲作用的敏感时期及对不同细胞毒性的强弱。',
                    pitfall:'混淆"细胞周期同步化"与"诱导突变"的目的。同步化是为了获得大量处于同一时期的细胞以供研究，而非诱发遗传物质改变。',
                    examRef:'2023重庆卷改编题（广东模拟高频出现）',
                    strategy:'图文结合记忆：将各时期特征与DNA含量变化曲线、染色体行为图像紧密结合。理解同步化本质：同步化是为获得大量处于同一时期的细胞进行研究，而非诱变。整合有丝分裂：将周期调控与有丝分裂各期图像识别、染色体数量变化曲线分析综合复习。'},
                {id:'TOPIC_05',name:'基因致死与平衡致死系',module:'必修2《遗传与进化》',weight:0.08,
                    concept:'基因致死：显性纯合致死导致Aa自交后代为2:1；隐性纯合致死或配子致死可导致全为显性等比例异常。平衡致死系：一对同源染色体上各带有一个不同且不能交换的隐性致死基因，如果蝇的Cy平衡致死系，纯合子全部死亡，只有双杂合子存活并稳定遗传，可用于保存致死突变或育种。',
                    diagram:'果蝇展翅平衡致死系遗传图解；家蚕性连锁平衡致死系用于只产雄蚕的育种模式图。',
                    experiment:'家蚕育种应用：设计使雌性蚕卵（ZW）因携带特定致死基因而无法孵化，从而只孵化出产丝量高的雄性个体。',
                    pitfall:'在计算平衡致死系杂交后代比例时，忽略"所有纯合子死亡"的前提，错误计入致死基因型。',
                    examRef:'2024广东T18（非选择题，涉及致死基因的比例计算）',
                    strategy:'掌握比例模型：熟练推导常见致死类型下的典型比例变形。构建平衡致死模型：理解其"纯合致死"的本质与"交换抑制"的维持条件。专项训练：针对比例分析、实验设计进行专项练习，强化假说-演绎思维。'},
                {id:'TOPIC_06',name:'基因定位类问题分析',module:'必修2《遗传与进化》',weight:0.10,
                    concept:'基础方法：①正反交判细胞质遗传；②"隐性雌×显性雄"判X连锁；③根据F₂雌雄性状分离比差异判XY同源区段。高级方法：①利用连锁与交换原理计算交换率定位；②利用单体、三体等染色体变异材料定位；③利用SSR等分子标记进行连锁分析。',
                    diagram:'遗传系谱图与电泳图谱结合的分析图；SSR标记与性状的连锁遗传图。',
                    experiment:'单体定位实验：将某隐性突变体与小麦的某号染色体单体杂交，分析F₁表型，若出现突变性状，则说明该基因位于此单体染色体上。',
                    pitfall:'对XY染色体同源区段上基因的遗传方式判断错误，误将其当作常染色体或仅X染色体遗传处理。',
                    examRef:'2025广东T19（非选择题，利用SSR标记进行基因定位分析）',
                    strategy:'构建方法体系：总结从简单到复杂的基因定位方法树，明确每种方法的适用条件。突破难点：重点掌握X染色体非同源区段与同源区段的判断方法。强化综合：将基因定位与致死、连锁、染色体变异等知识融合训练。'},
                {id:'TOPIC_07',name:'育种方式整合',module:'必修2《遗传与进化》',weight:0.07,
                    concept:'①杂交育种：原理为基因重组，通过杂交和连续自交筛选纯合子，不能产生新基因。②诱变育种：原理为基因突变，具有随机性、低频性，如太空育种。③单倍体育种：花药离体培养获得单倍体，再经秋水仙素处理加倍，能明显缩短育种年限。④多倍体育种：秋水仙素抑制纺锤体形成使染色体加倍，如无子西瓜。⑤基因工程育种：CRISPR基因编辑（定点修饰自身基因）与转基因技术（导入外源基因）。',
                    diagram:'杂交、诱变、单倍体、多倍体育种流程对比表；三倍体无子西瓜培育过程图。',
                    experiment:'抗病转基因水稻培育：从设计CRISPR靶点或构建含抗病基因的表达载体开始，到遗传转化、筛选、鉴定及田间抗性评价的全流程分析。',
                    pitfall:'混淆基因编辑与转基因概念。基因编辑是对生物体自身基因序列进行定点敲除或修饰，转基因是将外源基因导入生物体基因组。',
                    examRef:'2025广东T20（非选择题，涉及CRISPR技术在水稻育种中的应用）',
                    strategy:'对比列表：将五种育种方式的原理、方法、优点、缺点制成对比表。掌握关键步骤：如单倍体育种中秋水仙素处理对象是"幼苗"；多倍体育种中四倍体作母本。关注社会热点：链接我国超级稻、抗病小麦等育种成就，思考技术伦理。'},
                {id:'TOPIC_08',name:'DNA损伤修复与表观遗传',module:'必修2《遗传与进化》',weight:0.06,
                    concept:'修复机制：光复活修复、核苷酸切除修复、重组修复等，维持基因组稳定性。表观遗传：DNA序列不变，基因表达可遗传变化。核心机制：①DNA甲基化（通常抑制转录）；②组蛋白修饰（乙酰化常促进转录）；③非编码RNA调控。',
                    diagram:'DNA甲基化位点示意图；组蛋白修饰与染色质状态模式图；单细胞ATAC-seq技术显示的染色质可及性热图。',
                    experiment:'吸烟与肺癌关联分析：研究烟草中的致癌物如何诱导抑癌基因启动子区发生高甲基化，从而沉默其表达，导致细胞癌变。',
                    pitfall:'将表观遗传等同于基因突变。表观遗传不改变DNA碱基序列，而基因突变是序列的改变。',
                    examRef:'2024广东T16（非选择题，考查DNA甲基化分析）',
                    strategy:'厘清核心区别：表观遗传≠基因突变，前者是"开关"调控，后者是"蓝图"改变。理解经典模型：掌握启动子区甲基化抑制转录、组蛋白乙酰化促进转录等核心模型。提升情境适应：加强对科研论文情境、复杂图表（如scATAC-seq）的信息提取与推理能力。'},
                {id:'TOPIC_09',name:'动物与植物生态位',module:'选必2《生物与环境》',weight:0.05,
                    concept:'动物生态位研究侧重：栖息地、食物（食性）、天敌及与其他物种关系。植物生态位研究侧重：在研究区域的出现频率、种群密度、植株高度等特征及其关系。生态位重叠导致竞争，分化促进共存。',
                    diagram:'森林群落的垂直分层与水平镶嵌结构图；不同生境中鸟类食性宽度与物种数量关系图。',
                    experiment:'人类活动影响分析：对比自然保护区、农田和城市中同种鸟类的食性组成与物种数量，分析人类活动如何压缩或扩展其生态位。',
                    pitfall:'误认为"空间生态位宽度大"就等于"食性杂（营养生态位宽）"。空间生态位主要描述利用的空间范围，与食性无必然因果关系。',
                    examRef:'2024广东T13（选择题，分析自然保护区鸟类生态位）',
                    strategy:'理解差异：严格区分动、植物生态位研究侧重点，此为易错核心。图文转换：强化从物种数量图、取食关系图中推断生态位特征的能力。综合联系：将生态位与竞争排斥、群落演替、生物多样性保护等概念串联。'},
                {id:'TOPIC_10',name:'教材基础实验与科学方法',module:'跨模块',weight:0.06,
                    concept:'核心实验原理与操作：斐林试剂（水浴加热检还原糖）、双缩脲试剂（检蛋白质）、纸层析（分离色素）、显微镜计数（酵母菌、血细胞）、样方法/标志重捕法（种群密度调查）。科学方法：对照、单一变量、平行重复、等量原则。',
                    diagram:'教材原版实验装置图。',
                    experiment:'探究pH对酶活性影响：设计不同pH梯度的实验组，观察酶促反应速率变化，明确需设置对照、控制温度等无关变量。',
                    pitfall:'在设计验证性实验时，遗漏平行重复实验或未设置恰当的空白对照/条件对照，影响实验严谨性。',
                    examRef:'每年选择题稳定出现1-2题',
                    strategy:'回归教材：逐字精读教材实验步骤，注意易忽略的细节（如斐林试剂甲液乙液的使用顺序）。归纳对比：将相似实验（如各种鉴定实验、计数方法）进行对比归纳。理解方法本质：明确每种科学方法适用的研究对象和条件。'},
                {id:'TOPIC_11',name:'PCR引物设计原则',module:'选必3《生物技术与工程》',weight:0.04,
                    concept:'基本原则：长度18-25 bp；GC含量40%-60%；避免自身及引物间形成二级结构（发夹、二聚体）；3\'端必须严格与模板互补，不可修饰；5\'端可添加酶切位点、标签等。',
                    diagram:'引物二聚体及发夹结构示意图；重叠延伸PCR中四条引物的设计模式图。',
                    experiment:'重叠延伸PCR定点突变：设计两条部分重叠且含突变点的中间引物，通过两轮PCR将定点突变引入目的基因。',
                    pitfall:'在引物3\'端添加荧光标记或酶切位点，这会阻碍DNA聚合酶的延伸，导致PCR失败。',
                    examRef:'2025广东T7（选择题，考查引物设计原则）',
                    strategy:'理解核心细节：牢记3\'端不可修饰、Taq酶无校对功能、循环中退火温度最低等关键点。掌握设计原则：利用原则判断发夹结构、引物二聚体等常见错误。图文转化：熟练分析电泳结果图、qPCR扩增曲线与熔解曲线。'},
                {id:'TOPIC_12',name:'实验设计与增分指导',module:'能力考查',weight:0.12,
                    concept:'通用设计模板涵盖"分组-处理-培养-观测-结论"。评分核心维度：结构(4分)、变量(3分)、对照(2分)、操作(2分)、术语(1分)。高度贴合广东卷非选择题风格，要求逻辑闭环、表述规范。',
                    diagram:'实验设计通用答题框架图。',
                    experiment:'探究某基因功能：以"探究基因X对水稻耐盐性的影响"为例，设计对比野生型与突变体（或过表达株系）在盐胁迫下的生长、生理指标实验。',
                    pitfall:'在描述步骤时，遗漏"相同且适宜条件（如温度、光照）"这一控制无关变量的关键表述。',
                    examRef:'2025广东T22（实验大题，综合性实验设计与分析）',
                    strategy:'掌握模板：熟练运用通用步骤模板，确保答题结构完整。规范表述：使用"等量"、"相同且适宜"、"培养相同时间"等规范用语。真题演练：精研高考实验设计真题，总结常见命题逻辑和得分要点。'},
                {id:'TOPIC_13',name:'限制酶与DNA连接酶选择',module:'选必3《生物技术与工程》',weight:0.04,
                    concept:'构建载体时，选择限制酶原则：①切点必须在目的基因两端，且不破坏其内部。②最好使用双酶切，防止载体或目的基因自连。③切割后载体必须保留完整的标记基因、启动子、复制原点。DNA连接酶连接粘性末端或平末端。',
                    diagram:'带有多个酶切位点的质粒图谱图。',
                    experiment:'构建植物表达载体：根据目的基因序列和质粒多克隆位点，选择EcoRI和BamHI进行双酶切，实现目的基因的定向插入。',
                    pitfall:'忽略目的基因内部也可能存在所选限制酶的切点，导致基因被切断。设计前需进行序列分析。',
                    examRef:'2024广东T17（非选择题，考查基因表达载体的构建）',
                    strategy:'实践分析：大量练习质粒图谱分析题，养成先标出所有关键元件再选择酶切位点的习惯。明确核心：确保切割后目的基因完整，且载体至少保留一个完整的标记基因。区分概念：明确同尾酶与同裂酶的区别。'}
            ],
            relations:[
                {from:'TOPIC_01',to:'TOPIC_07',type:'PRECEDES',desc:'蛋白质分选先于基因工程育种理解'},
                {from:'TOPIC_03',to:'TOPIC_10',type:'RELATED_TO',desc:'逆境光合实验与基础实验方法关联'},
                {from:'TOPIC_05',to:'TOPIC_06',type:'RELATED_TO',desc:'致死基因与基因定位综合考查'},
                {from:'TOPIC_06',to:'TOPIC_07',type:'RELATED_TO',desc:'基因定位与育种方式结合'},
                {from:'TOPIC_08',to:'TOPIC_11',type:'RELATED_TO',desc:'DNA修复与PCR技术关联'},
                {from:'TOPIC_11',to:'TOPIC_13',type:'PRECEDES',desc:'PCR引物设计先于载体构建'},
                {from:'TOPIC_12',to:'TOPIC_10',type:'RELATED_TO',desc:'实验设计与基础实验方法互为补充'}
            ]
        };
    }
};

document.addEventListener('DOMContentLoaded',function(){
    try {
    fixInteractionIssues();
    CE.init();
    window.ContentEnhancer=CE;

    if(CE.periodicTable){
        var ptApp=document.getElementById('periodic-table-app');
        if(ptApp) CE.periodicTable.render('periodic-table-app');
    }

    if(CE.chemistryStructure){
        var csApp=document.getElementById('chemistry-structure-app');
        if(csApp){
            var html='<div class="knowledge-section"><h3>🔬 化学物质结构与性质</h3>';
            CE.chemistryStructure.sections.forEach(function(sec){
                html+='<div class="knowledge-card"><h4>'+sec.title+'</h4><div class="key-point">'+sec.content+'</div></div>';
            });
            html+='</div>';
            csApp.innerHTML=html;
        }
    }
    } catch (err) {
        console.error('内容增强模块初始化失败:', err);
    }
});

window.ContentEnhancer=CE;
})();

/* ==================== 第二代 · content-enhanced-v2.js ==================== */
// 内容深化模块V2 - 框架训练+实验全表+思维链+变式推荐

// 模块1: frameworkAnswerTrainer（框架式答题训练系统）
(function(){
'use strict';

var LS_KEY = 'hspcb_framework_records';

// 答题框架定义
var FRAMEWORKS = {
    '原因分析': {
        name: '原因分析题（三段式）',
        steps: ['原理阐述', '变化过程', '结论结果'],
        description: '原理阐述：写出相关科学原理/定律/公式 → 变化过程：描述系统中发生的变化及原因 → 结论结果：得出最终结论'
    },
    '实验设计': {
        name: '实验设计题（五步法）',
        steps: ['分组', '处理', '培养', '观察', '预期'],
        description: '分组：设置实验组和对照组 → 处理：施加实验变量 → 培养：在相同适宜条件下处理 → 观察：明确检测指标 → 预期：预测实验结果'
    },
    '曲线分析': {
        name: '曲线分析题（四步法）',
        steps: ['趋势描述', '原因解释', '关键拐点', '对比分析'],
        description: '趋势描述：概括曲线整体走势 → 原因解释：用原理说明变化原因 → 关键拐点：标注并解释转折点 → 对比分析：对比不同曲线的关系'
    }
};

// 题库数据加载器（动态加载 data/framework-questions.json）
var QuestionDataLoader = {
    _cache: null,
    _loadingPromise: null,
    _dataUrl: 'data/framework-questions.json',

    load: function(){
        if(this._cache) return Promise.resolve(this._cache);
        if(this._loadingPromise) return this._loadingPromise;
        var self = this;
        this._loadingPromise = fetch(this._dataUrl)
            .then(function(res){
                if(!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function(data){
                self._cache = (data && data.questions) ? data.questions : [];
                self._loadingPromise = null;
                return self._cache;
            })
            .catch(function(err){
                self._loadingPromise = null;
                console.error('[frameworkAnswerTrainer] 题库加载失败:', err);
                throw err;
            });
        return this._loadingPromise;
    },

    getCached: function(){
        return this._cache || [];
    }
};

// 训练系统主体
var state = {
    currentStep: 1,
    selectedQuestion: null,
    selectedFramework: null,
    userAnswers: {},
    submitted: false
};

function loadRecords(){
    try {
        var raw = HSPCBStore.get(LS_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch(e){ return {}; }
}

function saveRecord(questionId, score){
    var records = loadRecords();
    records[questionId] = { score: score, time: new Date().toISOString(), completed: true };
    try { HSPCBStore.set(LS_KEY, JSON.stringify(records)); } catch(e){}
}

function getSubjectColor(subject){
    if(subject === '物理') return '#1a73e8';
    if(subject === '化学') return '#7b1fa2';
    if(subject === '生物') return '#0d7a3e';
    return '#444';
}

function step1SelectQuestion(){
    var html = '<div data-style="padding:20px;">';
    html += '<h3 data-style="color:#333;margin-bottom:12px;">Step 1: 选择题目</h3>';

    // 框架筛选按钮
    html += '<div data-style="margin-bottom:16px;">';
    html += '<span data-style="font-weight:600;margin-right:10px;">框架类型：</span>';
    var frameworks = ['原因分析','实验设计','曲线分析'];
    for(var i=0;i<frameworks.length;i++){
        var fw = frameworks[i];
        var active = state.selectedFramework === fw;
        html += '<button data-framework="'+fw+'" data-style="'+
            'padding:6px 14px;margin-right:8px;margin-bottom:6px;border:2px solid #ddd;border-radius:20px;background:'+(active?'#1a73e8':'#fff')+';color:'+(active?'#fff':'#333')+';cursor:pointer;font-size:13px;'+
            '" data-call="window.frameworkAnswerTrainer._selectFramework" data-arg1="@s:' + fw + '">'+fw+'</button>';
    }
    html += '</div>';

    // 题目列表（数据由 QuestionDataLoader 动态加载）
    var questions = QuestionDataLoader.getCached();
    var filtered = state.selectedFramework ? questions.filter(function(q){return q.framework===state.selectedFramework;}) : questions;
    html += '<div data-style="max-height:400px;overflow-y:auto;">';
    for(var j=0;j<filtered.length;j++){
        var q = filtered[j];
        var records = loadRecords();
        var done = records[q.id];
        html += '<div data-qid="'+q.id+'" data-call="window.frameworkAnswerTrainer._selectQuestion" data-arg1="@s:' + q.id + '" data-style="'+
            'padding:12px 14px;margin-bottom:8px;border:2px solid '+(state.selectedQuestion&&state.selectedQuestion.id===q.id?'#1a73e8':'#e0e0e0')+';border-radius:10px;cursor:pointer;background:'+(state.selectedQuestion&&state.selectedQuestion.id===q.id?'#e8f0fe':'#fff')+';transition:all 0.2s;'+
            '">';
        html += '<div data-style="font-size:14px;font-weight:600;color:#333;margin-bottom:4px;">';
        html += '<span data-style="display:inline-block;background:'+getSubjectColor(q.subject)+';color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;margin-right:8px;">'+q.subject+'</span>';
        html += '<span data-style="color:#888;font-size:12px;">'+q.year+'</span>';
        if(done){ html += '<span data-style="color:#0d7a3e;font-size:12px;margin-left:8px;">✓ 已完成 (得分:'+done.score+')</span>'; }
        html += '</div>';
        html += '<div data-style="font-size:15px;color:#555;">'+q.question+'</div>';
        html += '</div>';
    }
    html += '</div>';

    // 继续按钮
    html += '<button data-call=\"window.frameworkAnswerTrainer._goStep2\" data-style="'+
        'margin-top:16px;padding:10px 28px;background:'+(state.selectedQuestion?'#1a73e8':'#ccc')+';color:#fff;border:none;border-radius:8px;font-size:15px;cursor:'+(state.selectedQuestion?'pointer':'not-allowed')+';'+
        '" '+(state.selectedQuestion?'':'disabled')+'>下一步：填写框架</button>';

    html += '</div>';
    return html;
}

function step2FillFramework(){
    var q = state.selectedQuestion;
    if(!q) return step1SelectQuestion();
    var fw = FRAMEWORKS[q.framework];
    var steps = fw.steps;

    var html = '<div data-style="padding:20px;">';
    html += '<h3 data-style="color:#333;margin-bottom:8px;">Step 2: 按框架填写答案</h3>';
    html += '<div data-style="background:#f0f4ff;padding:12px 16px;border-radius:10px;margin-bottom:16px;">';
    html += '<span data-style="color:'+getSubjectColor(q.subject)+';font-weight:600;">'+q.subject+' | '+q.year+'</span>';
    html += '<p data-style="margin:8px 0 0 0;color:#555;">'+q.question+'</p>';
    html += '<p data-style="margin:4px 0 0 0;color:#999;font-size:13px;font-style:italic;">'+q.context+'</p>';
    html += '</div>';

    html += '<div data-style="background:#fff3e0;padding:10px 14px;border-radius:8px;margin-bottom:16px;font-size:13px;color:#e65100;">';
    html += '📋 框架：<strong>'+fw.name+'</strong><br>'+fw.description;
    html += '</div>';

    for(var i=0;i<steps.length;i++){
        var idx = i+1;
        html += '<div data-style="margin-bottom:14px;">';
        html += '<div data-style="font-weight:600;color:#333;margin-bottom:6px;">步骤'+idx+'：'+steps[i]+'</div>';
        html += '<textarea id="fw-input-'+i+'" placeholder="请输入'+steps[i]+'的内容..." data-style="'+
            'width:100%;min-height:70px;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;resize:vertical;box-sizing:border-box;'+
            'line-height:1.6;font-family:inherit;" data-call=\"window.frameworkAnswerTrainer._onInput\" data-arg1=\"@n:'+i+'" data-arg2=\"@val\">'+(state.userAnswers[i]||'')+'</textarea>';
        html += '</div>';
    }

    html += '<div data-style="display:flex;gap:12px;margin-top:16px;">';
    html += '<button data-call=\"window.frameworkAnswerTrainer._goStep1\" data-style="padding:10px 24px;background:#fff;color:#555;border:2px solid #ddd;border-radius:8px;font-size:14px;cursor:pointer;">← 上一步</button>';
    var allFilled = true;
    for(var k=0;k<steps.length;k++){ if(!state.userAnswers[k]||state.userAnswers[k].trim()===''){allFilled=false;break;} }
    html += '<button data-call=\"window.frameworkAnswerTrainer._submit\" data-style="padding:10px 28px;background:'+(allFilled?'#0d7a3e':'#ccc')+';color:#fff;border:none;border-radius:8px;font-size:15px;cursor:'+(allFilled?'pointer':'not-allowed')+';" '+(allFilled?'':'disabled')+'>提交并查看对比</button>';
    html += '</div>';

    html += '</div>';
    return html;
}

function step3Compare(){
    var q = state.selectedQuestion;
    if(!q) return step1SelectQuestion();
    var fw = FRAMEWORKS[q.framework];
    var steps = fw.steps;
    var modelSteps = q.modelAnswer;
    var modelKeys = ['step1','step2','step3','step4','step5'];
    if(steps.length===4) modelKeys = ['step1','step2','step3','step4'];

    var html = '<div data-style="padding:20px;">';
    html += '<h3 data-style="color:#333;margin-bottom:12px;">Step 3: 标准答案对比</h3>';

    for(var i=0;i<steps.length;i++){
        var userAns = state.userAnswers[i]||'（未填写）';
        var modelAns = q.modelAnswer[modelKeys[i]]||'';
        html += '<div data-style="margin-bottom:20px;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;">';
        html += '<div data-style="background:#f5f5f5;padding:10px 14px;font-weight:600;color:#333;font-size:14px;">步骤'+(i+1)+'：'+steps[i]+'</div>';

        // 用户答案
        html += '<div data-style="padding:12px 14px;border-bottom:1px solid #f0f0f0;">';
        html += '<div data-style="font-size:12px;color:#999;margin-bottom:4px;">📝 你的答案：</div>';
        var isEmpty = !userAns || userAns.trim()==='';
        html += '<div data-style="font-size:14px;color:'+(isEmpty?'#e53935':'#333')+';line-height:1.6;white-space:pre-wrap;">'+userAns+'</div>';
        html += '</div>';

        // 标准答案
        html += '<div data-style="padding:12px 14px;background:#f9fff9;">';
        html += '<div data-style="font-size:12px;color:#999;margin-bottom:4px;">✅ 标准答案：</div>';
        html += '<div data-style="font-size:14px;color:#2e7d32;line-height:1.6;">'+modelAns+'</div>';
        html += '</div>';

        // 对比标签
        html += '<div data-style="padding:8px 14px;background:#fff;">';
        if(isEmpty){
            html += '<span data-style="color:#e53935;font-size:12px;">❌ 未填写</span>';
        } else {
            html += '<span data-style="color:#0d7a3e;font-size:12px;">✓ 已填写 — 请自行逐条对比匹配</span>';
        }
        html += '</div>';
        html += '</div>';
    }

    html += '<div data-style="display:flex;gap:12px;margin-top:16px;">';
    html += '<button data-call=\"window.frameworkAnswerTrainer._goStep2\" data-style="padding:10px 24px;background:#fff;color:#555;border:2px solid #ddd;border-radius:8px;font-size:14px;cursor:pointer;">← 返回修改</button>';
    html += '<button data-call=\"window.frameworkAnswerTrainer._goStep4\" data-style="padding:10px 28px;background:#1a73e8;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer;">查看详细解析 →</button>';
    html += '</div>';

    html += '</div>';
    return html;
}

function step4Analysis(){
    var q = state.selectedQuestion;
    if(!q) return step1SelectQuestion();
    var steps = FRAMEWORKS[q.framework].steps;

    // 简单评分逻辑：检查用户是否填写了每步并粗略匹配关键词
    var totalScore = 0;
    var stepScores = [];
    var modelKeys = ['step1','step2','step3','step4','step5'];
    if(steps.length===4) modelKeys = ['step1','step2','step3','step4'];

    var sp = q.scorePoints;
    for(var i=0;i<steps.length;i++){
        var userAns = (state.userAnswers[i]||'').toLowerCase();
        var modelAns = (q.modelAnswer[modelKeys[i]]||'').toLowerCase();
        var points = sp[modelKeys[i]]||Math.floor(10/steps.length);
        var score = 0;
        if(userAns.length>10){
            // 关键词匹配
            var kps = q.keyPoints;
            var matched = 0;
            for(var k=0;k<kps.length;k++){
                if(userAns.indexOf(kps[k].toLowerCase())!==-1) matched++;
            }
            score = Math.min(points, Math.ceil((matched/kps.length)*points));
            if(score===0) score = Math.max(1, Math.floor(points*0.3));
        }
        totalScore += score;
        stepScores.push(score);
    }

    // 保存记录
    saveRecord(q.id, totalScore);

    var html = '<div data-style="padding:20px;">';
    html += '<h3 data-style="color:#333;margin-bottom:12px;">Step 4: 详细解析</h3>';

    // 总分展示
    var gradeColor = totalScore>=8?'#0d7a3e':(totalScore>=5?'#e65100':'#e53935');
    var gradeText = totalScore>=8?'优秀':(totalScore>=5?'良好':'需加强');
    html += '<div data-style="text-align:center;padding:20px;margin-bottom:16px;background:#f5f5f5;border-radius:12px;">';
    html += '<div data-style="font-size:36px;font-weight:700;color:'+gradeColor+';">'+totalScore+'<span data-style="font-size:16px;"> / 10</span></div>';
    html += '<div data-style="font-size:16px;color:'+gradeColor+';margin-top:4px;">'+gradeText+'</div>';
    html += '</div>';

    // 每步得分
    html += '<div data-style="margin-bottom:20px;">';
    html += '<h4 data-style="color:#333;margin-bottom:8px;">📊 各步骤得分</h4>';
    for(var j=0;j<steps.length;j++){
        var maxS = sp[modelKeys[j]]||Math.floor(10/steps.length);
        html += '<div data-style="display:flex;align-items:center;margin-bottom:8px;">';
        html += '<span data-style="width:120px;font-size:13px;color:#555;">步骤'+(j+1)+'：'+steps[j]+'</span>';
        html += '<div data-style="flex:1;height:20px;background:#e0e0e0;border-radius:10px;overflow:hidden;margin:0 8px;">';
        html += '<div data-style="height:100%;width:'+(stepScores[j]/maxS*100)+'%;background:'+getSubjectColor(q.subject)+';border-radius:10px;"></div>';
        html += '</div>';
        html += '<span data-style="font-size:13px;font-weight:600;color:#333;">'+stepScores[j]+'/'+maxS+'</span>';
        html += '</div>';
    }
    html += '</div>';

    // 逻辑结构评价
    html += '<div data-style="background:#f0f4ff;padding:14px 16px;border-radius:10px;margin-bottom:14px;">';
    html += '<h4 data-style="color:#1a73e8;margin:0 0 6px 0;">🧠 逻辑结构评价</h4>';
    html += '<p data-style="margin:0;color:#555;font-size:14px;line-height:1.6;">框架类型为<strong>'+FRAMEWORKS[q.framework].name+'</strong>，其核心逻辑在于按'+(q.framework==='原因分析'?'"原理→过程→结论"':'（请参照标准答案的步骤组织）')+'的因果链条组织答题。请将你的答案与标准答案逐步骤对照，检查是否每个步骤都涵盖了相应的得分关键点。</p>';
    html += '</div>';

    // 关键得分点
    html += '<div data-style="background:#fff9f0;padding:14px 16px;border-radius:10px;margin-bottom:14px;">';
    html += '<h4 data-style="color:#e65100;margin:0 0 6px 0;">🎯 得分关键词</h4>';
    html += '<p data-style="margin:0;color:#555;font-size:14px;">'+q.keyPoints.join('、')+'</p>';
    html += '</div>';

    // 常见失分点
    html += '<div data-style="background:#fff0f0;padding:14px 16px;border-radius:10px;margin-bottom:14px;">';
    html += '<h4 data-style="color:#e53935;margin:0 0 6px 0;">⚠️ 常见失分点</h4>';
    html += '<p data-style="margin:0;color:#555;font-size:14px;line-height:1.6;">'+q.commonErrors+'</p>';
    html += '</div>';

    html += '<div data-style="display:flex;gap:12px;margin-top:16px;">';
    html += '<button data-call=\"window.frameworkAnswerTrainer._goStep3\" data-style="padding:10px 24px;background:#fff;color:#555;border:2px solid #ddd;border-radius:8px;font-size:14px;cursor:pointer;">← 返回对比</button>';
    html += '<button data-call=\"window.frameworkAnswerTrainer._reset\" data-style="padding:10px 28px;background:#1a73e8;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer;">做下一题</button>';
    html += '</div>';

    html += '</div>';
    return html;
}

function render(){
    var container = document.getElementById('framework-trainer-app');
    if(!container) return;
    // 首次打开工具时才拉取题库。首屏不再自动 init，也不请求 framework-questions.json。
    if(!QuestionDataLoader.getCached().length){
        if(QuestionDataLoader._loadingPromise){ container.innerHTML = frameworkLoadingHtml(); return; }
        container.innerHTML = frameworkLoadingHtml();
        QuestionDataLoader.load()
            .then(function(){ render(); })
            .catch(function(){ container.innerHTML = frameworkErrorHtml(); });
        return;
    }
    var html = '';
    if(state.currentStep===1) html = step1SelectQuestion();
    else if(state.currentStep===2) html = step2FillFramework();
    else if(state.currentStep===3) html = step3Compare();
    else if(state.currentStep===4) html = step4Analysis();
    container.innerHTML = html;
}

function frameworkLoadingHtml(){
    return '<div data-style="padding:40px;text-align:center;color:#666;">' +
        '<div data-style="font-size:24px;margin-bottom:12px;">⏳</div>' +
        '<div>题库加载中...</div></div>';
}

function frameworkErrorHtml(){
    return '<div data-style="padding:40px;text-align:center;color:#d32f2f;">' +
        '<div data-style="font-size:24px;margin-bottom:12px;">⚠️</div>' +
        '<div>题库加载失败，请检查网络后重试</div>' +
        '<button data-call="window.frameworkAnswerTrainer._retry" data-style="margin-top:16px;padding:8px 16px;background:#1a73e8;color:#fff;border:none;border-radius:6px;cursor:pointer;">重试</button>' +
        '</div>';
}

var trainer = {
    render: render,
    _selectFramework: function(fw){
        state.selectedFramework = fw;
        state.selectedQuestion = null;
        render();
    },
    _selectQuestion: function(qid){
        var questions = QuestionDataLoader.getCached();
        for(var i=0;i<questions.length;i++){
            if(questions[i].id===qid){ state.selectedQuestion = questions[i]; break; }
        }
        state.selectedFramework = state.selectedQuestion.framework;
        render();
    },
    _goStep2: function(){
        if(!state.selectedQuestion) return;
        state.currentStep = 2;
        render();
    },
    _goStep1: function(){
        state.currentStep = 1;
        render();
    },
    _goStep3: function(){
        state.currentStep = 3;
        render();
    },
    _goStep4: function(){
        state.currentStep = 4;
        render();
    },
    _onInput: function(idx, val){
        state.userAnswers[idx] = val;
    },
    _submit: function(){
        var q = state.selectedQuestion;
        if(!q) return;
        var steps = FRAMEWORKS[q.framework].steps;
        for(var i=0;i<steps.length;i++){
            if(!state.userAnswers[i]||state.userAnswers[i].trim()==='') return;
        }
        state.submitted = true;
        state.currentStep = 3;
        render();
    },
    _reset: function(){
        state = { currentStep: 1, selectedQuestion: null, selectedFramework: null, userAnswers: {}, submitted: false };
        render();
    },
    _retry: function(){
        QuestionDataLoader._cache = null;
        QuestionDataLoader._loadingPromise = null;
        var container = document.getElementById('framework-trainer-app');
        if(container){
            container.innerHTML = '<div data-style="padding:40px;text-align:center;color:#666;">' +
                '<div data-style="font-size:24px;margin-bottom:12px;">⏳</div>' +
                '<div>题库重新加载中...</div></div>';
        }
        QuestionDataLoader.load()
            .then(function(){ if(container){ container.innerHTML=''; render(); } })
            .catch(function(){ if(container){ container.innerHTML = frameworkErrorHtml(); } });
    }
};

window.frameworkAnswerTrainer = trainer;

// 不再在首屏自动 init。数据由 render() 在首次打开工具时按需加载。
})();

// 模块2: experimentTable（教材实验六栏全表）
(function(){
'use strict';

var SUBJECT_COLORS = { '物理': '#1a73e8', '化学': '#7b1fa2', '生物': '#0d7a3e' };
var COLUMNS = ['实验目的', '实验原理', '实验器材', '实验步骤', '现象与结论', '误差分析/注意事项'];

// 实验数据（18个实验，三科各6个）
var EXPERIMENTS = {
    '物理': [
        {
            id:'phy_01', module:'必修1',
            '实验目的':'探究匀变速直线运动的速度随时间变化的规律',
            '实验原理':'利用打点计时器记录小车运动的位置和时间；通过纸带上的点间距计算各计数点的瞬时速度；作出v-t图像，若为直线则小车做匀变速直线运动；斜率即为加速度a',
            '实验器材':'打点计时器（电磁或电火花）、低压交流电源、纸带、一端附有滑轮的长木板、小车、细绳、钩码、刻度尺、导线',
            '实验步骤':'1.将打点计时器固定在长木板一端，连接电源；2.将纸带穿过限位孔并固定在小车尾部；3.将细绳一端系在小车上，另一端跨过滑轮挂上钩码；4.先接通电源再释放小车，打出一条纸带；5.换纸带重复实验3次；6.选取点迹清晰的纸带，每隔5个点取一个计数点；7.计算各计数点瞬时速度和加速度',
            '现象与结论':'纸带上相邻点间距均匀增大（加速运动）；v-t图像近似为一条倾斜直线；斜率a为加速度。结论：在恒力作用下，小车做匀变速直线运动，加速度a=Δv/Δt为定值',
            '误差分析/注意事项':'1.先接通电源后释放小车（避免起始点缺失）；2.小车应靠近打点计时器释放；3.钩码质量不宜过大（保证加速度适中）；4.纸带与限位孔摩擦带来误差；5.计数点取法影响计算精度'
        },
        {
            id:'phy_02', module:'必修1',
            '实验目的':'探究弹簧弹力与弹簧伸长量的关系（胡克定律）',
            '实验原理':'在弹性限度内，弹簧弹力F与伸长量x成正比：F=kx（k为劲度系数）；通过在弹簧下端悬挂不同质量的钩码改变弹力；用刻度尺测量对应伸长量；作出F-x图像验证线性关系，斜率即为k',
            '实验器材':'铁架台、弹簧（轻质）、刻度尺（分度值1mm）、钩码一盒（已知质量）、坐标纸',
            '实验步骤':'1.将弹簧竖直悬挂在铁架台上，测量弹簧原长l₀；2.在弹簧下端挂一个钩码，待静止后测弹簧长度l₁，伸长量x₁=l₁-l₀；3.依次增加钩码个数，分别测对应长度l₂、l₃...；4.计算每次弹力F=mg和伸长量x=l-l₀；5.在坐标纸上作出F-x图像',
            '现象与结论':'F-x图像为一条过原点的倾斜直线；弹力与伸长量成正比：F=kx。弹簧的劲度系数k=F/x，单位为N/m。结论：在弹性限度内，弹簧弹力与伸长量成正比——胡克定律',
            '误差分析/注意事项':'1.弹簧必须竖直悬挂，避免自身重力影响；2.每次测量前要等弹簧静止；3.刻度尺读数要估读至0.1mm；4.钩码不能过重（不超出弹性限度）；5.弹簧原长测量要准确'
        },
        {
            id:'phy_03', module:'必修1',
            '实验目的':'验证互成角度的两个共点力合成的平行四边形定则',
            '实验原理':'用两个弹簧测力计互成角度拉橡皮条，记录两力的大小和方向；用一个弹簧测力计单独拉至同一位置，记录合力大小和方向；以两分力为邻边作平行四边形，对角线即为理论合力，与实验合力比较',
            '实验器材':'木板、白纸、图钉、橡皮条、细绳套（2个）、弹簧测力计（2个）、三角板、刻度尺、铅笔',
            '实验步骤':'1.用图钉将白纸固定于木板上，将橡皮条一端固定在A点；2.用两个弹簧测力计互成角度拉橡皮条另一端，使结点到O点，记录两力F₁和F₂；3.用铅笔描出两力方向；4.用一个弹簧测力计单独拉至O点，记录合力F；5.按比例作出F₁、F₂的图示，用平行四边形法则求合力F\'；6.比较F\'与F的大小和方向',
            '现象与结论':'F\'与F的大小在误差允许范围内相等，方向基本一致。结论：两个互成角度的共点力的合力遵循平行四边形定则',
            '误差分析/注意事项':'1.弹簧测力计使用前需调零；2.拉力方向与木板平行；3.读数时视线正视刻度；4.力的图示比例要恰当；5.每次实验结点O位置必须相同；6.橡皮条弹性不能超限'
        },
        {
            id:'phy_04', module:'必修1',
            '实验目的':'验证牛顿第二定律F=ma',
            '实验原理':'控制变量法：（1）保持小车质量M不变，改变合外力F（改变钩码数量），测加速度a，验证a∝F；（2）保持合外力F不变，改变小车质量M，测加速度a，验证a∝1/M',
            '实验器材':'打点计时器、低压交流电源、纸带、长木板（一端垫高以平衡摩擦力）、小车、钩码、细绳、天平（测质量）、刻度尺',
            '实验步骤':'1.用天平测小车质量M；2.垫高长木板无滑轮端以平衡摩擦力；3.挂适量钩码，先通电后释放小车，打纸带；4.改变钩码质量（改变F），重复实验，作a-F图像；5.保持钩码不变，在小车上加砝码改变M，重复实验，作a-1/M图像',
            '现象与结论':'a-F图像为过原点倾斜直线（M不变时）；a-1/M图像为过原点倾斜直线（F不变时）。结论：物体加速度与合外力成正比，与质量成反比——F=ma',
            '误差分析/注意事项':'1.必须平衡摩擦力（小车匀速下滑）；2.钩码总质量应远小于小车质量（m<<M）；3.先通电后释放；4.纸带摩擦带来系统误差；5.a-F图像不严格过原点可能是摩擦力未完全平衡'
        },
        {
            id:'phy_05', module:'必修2',
            '实验目的':'验证机械能守恒定律',
            '实验原理':'在只有重力做功的条件下，物体动能和重力势能相互转化，总机械能守恒；用打点计时器记录自由落体运动，选择某两点，比较重力势能减少量ΔEp=mgh和动能增加量ΔEk=½m(v₂²-v₁²)是否相等',
            '实验器材':'打点计时器、低压交流电源、纸带、重锤（带夹子）、铁架台、刻度尺',
            '实验步骤':'1.将打点计时器竖直固定在铁架台上；2.将纸带穿过限位孔，上端用夹子固定重锤；3.先接通电源再释放纸带，让重锤自由下落；4.选取点迹清晰的纸带；5.选起始点O和另一点A，测量hOA；6.计算O点速度v₀=0，A点速度vA=(x₂-x₁)/2T；7.比较mghOA与½mvA²',
            '现象与结论':'在误差允许范围内，mghOA≈½mvA²，即重力势能的减少量等于动能的增加量。结论：在只有重力做功的条件下，机械能守恒',
            '误差分析/注意事项':'1.打点计时器必须竖直安装（减小摩擦）；2.先通电后释放纸带；3.重锤质量要大（减小空气阻力影响）；4.纸带与限位孔摩擦造成能量损失；5.测量高度h的误差影响较大；6.第一二点间距约2mm说明初速≈0'
        },
        {
            id:'phy_06', module:'选修3-1',
            '实验目的':'测定金属丝的电阻率ρ',
            '实验原理':'根据电阻定律R=ρl/S，电阻率ρ=RS/l。用伏安法测电阻R=U/I；用螺旋测微器测直径d计算截面积S=πd²/4；用刻度尺测有效长度l；代入公式ρ=πd²U/(4lI)',
            '实验器材':'被测金属丝、螺旋测微器（千分尺）、刻度尺、电流表、电压表、滑动变阻器、直流电源（约3V）、开关、导线若干',
            '实验步骤':'1.用螺旋测微器在金属丝不同位置测直径3次取平均值；2.用刻度尺测接入电路金属丝有效长度l；3.按电路图连接电路（电流表外接）；4.闭合开关，调节滑动变阻器，读取多组U和I值；5.计算各组R=U/I取平均值；6.代入ρ=πd²R/(4l)',
            '现象与结论':'金属丝两端电压U与通过电流I成正比（欧姆定律）；电阻R由金属丝材料和尺寸决定；计算出电阻率ρ与标准值比较，验证材料的导电特性',
            '误差分析/注意事项':'1.螺旋测微器读数需估读至0.001mm；2.电流表外接（待测电阻较小时），以减小系统误差；3.通电时间不宜过长（温度升高电阻变化）；4.金属丝长度测量要精确；5.多次测量取平均值减小偶然误差'
        }
    ],
    '化学': [
        {
            id:'chem_01', module:'必修1',
            '实验目的':'通过溶解、过滤、蒸发等操作提纯粗盐（除去不溶性杂质和可溶性杂质Ca²⁺/Mg²⁺/SO₄²⁻）',
            '实验原理':'粗盐中不溶物通过过滤除去；可溶性杂质：SO₄²⁻用BaCl₂沉淀为BaSO₄→过滤；Ca²⁺用Na₂CO₃沉淀为CaCO₃→过滤；Mg²⁺用NaOH沉淀为Mg(OH)₂→过滤；过量Ba²⁺和CO₃²⁻再用稀盐酸酸化除去',
            '实验器材':'烧杯、玻璃棒、漏斗、滤纸、铁架台（带铁圈）、蒸发皿、酒精灯、三脚架、量筒、托盘天平',
            '实验步骤':'1.用天平称取粗盐5g，加约20mL水搅拌溶解；2.过滤除去不溶物；3.向滤液加过量BaCl₂溶液至无沉淀生成→过滤；4.向滤液加过量NaOH溶液→过滤；5.向滤液加过量Na₂CO₃溶液→过滤；6.向滤液滴加稀盐酸调至中性或微酸性（用pH试纸检验）；7.将溶液倒入蒸发皿加热蒸发，将至干时停止加热用余热蒸干',
            '现象与结论':'各步均生成白色沉淀：BaSO₄（加BaCl₂）、Mg(OH)₂（加NaOH）、CaCO₃和BaCO₃（加Na₂CO₃）。最终得到洁白精制NaCl晶体。结论：通过化学沉淀法可有效除去粗盐中的可溶性杂质',
            '误差分析/注意事项':'1.沉淀剂必须过量（确保杂质离子完全沉淀）；2.过滤操作注意\"一贴二低三靠\"；3.蒸发时不断搅拌防暴沸；4.不能蒸干（防止晶体飞溅）；5.盐酸调pH防止CO₃²⁻残留'
        },
        {
            id:'chem_02', module:'必修1',
            '实验目的':'学会配制一定物质的量浓度的溶液（如0.1mol/L NaCl溶液250mL）',
            '实验原理':'物质的量浓度c=n/V，n=m/M。计算所需NaCl质量m=cVM，用天平称取，在烧杯中溶解后转移至容量瓶，加水定容至刻度线',
            '实验器材':'容量瓶（250mL）、烧杯、玻璃棒、胶头滴管、托盘天平（或分析天平）、药匙、量筒、洗瓶',
            '实验步骤':'1.计算所需NaCl质量：m=0.1mol/L×0.25L×58.5g/mol≈1.46g；2.用天平称取1.46g NaCl于烧杯中；3.加适量蒸馏水用玻璃棒搅拌溶解；4.将溶液转移至250mL容量瓶中（玻璃棒引流）；5.用少量蒸馏水洗涤烧杯和玻璃棒2-3次，洗涤液全部注入容量瓶；6.加水至接近刻度线1-2cm处，改用胶头滴管逐滴加水至凹液面最低处与刻度线相切；7.盖好瓶塞反复倒转摇匀',
            '现象与结论':'溶液呈无色透明，浓度准确为0.100mol/L。结论：使用容量瓶可较精确配制一定浓度的溶液',
            '误差分析/注意事项':'1.容量瓶使用前需查漏；2.不能直接在容量瓶中溶解；3.转移溶液需玻璃棒引流；4.洗涤液必须全部转入容量瓶（否则浓度偏低）；5.定容时视线与刻度线水平；6.摇匀时反复倒转不少于10次'
        },
        {
            id:'chem_03', module:'必修1',
            '实验目的':'制备Fe(OH)₂沉淀并观察其被氧化的过程，检验Fe²⁺的存在',
            '实验原理':'Fe²⁺+2OH⁻→Fe(OH)₂↓（白色沉淀）；Fe(OH)₂极易被空气中O₂氧化：4Fe(OH)₂+O₂+2H₂O→4Fe(OH)₃（红褐色）；Fe²⁺的检验：加NaOH先产生白色沉淀→迅速变灰绿色→最终变红褐色',
            '实验器材':'试管、滴管、FeSO₄溶液（新配制，加少量铁粉防氧化）、NaOH溶液（煮沸冷却以除去溶解O₂）、植物油',
            '实验步骤':'1.配制新鲜的FeSO₄溶液并加入少量铁粉和稀硫酸防氧化；2.将NaOH溶液加热煮沸除去溶解O₂后冷却；3.在试管中加约2mL FeSO₄溶液，上层覆盖一层植物油隔绝空气；4.用长滴管伸入液面下缓慢滴加NaOH溶液',
            '现象与结论':'初始生成白色Fe(OH)₂沉淀；暴露在空气中后白色迅速变为灰绿色，最终变为红褐色Fe(OH)₃。结论：Fe(OH)₂在空气中极易被氧化，这是检验Fe²⁺的特征反应',
            '误差分析/注意事项':'1.FeSO₄溶液必须新配制并加铁粉防氧化；2.NaOH溶液需煮沸驱氧；3.滴管需伸入液面下加液（避免带入O₂）；4.植物油的作用是隔绝空气；5.白色沉淀暴露在空气中变色极快（约数秒）'
        },
        {
            id:'chem_04', module:'必修1',
            '实验目的':'制备SO₂气体并验证其漂白性、酸性氧化物性质及还原性',
            '实验原理':'Na₂SO₃+H₂SO₄(浓)→Na₂SO₄+SO₂↑+H₂O；SO₂通入品红溶液使其褪色（漂白性，与有机色素结合为无色化合物）；SO₂使紫色石蕊试液变红（酸性氧化物）；SO₂能使酸性KMnO₄溶液褪色（还原性）',
            '实验器材':'圆底烧瓶、分液漏斗、导管、试管若干、品红溶液、紫色石蕊试液、酸性KMnO₄溶液、Na₂SO₃固体、浓H₂SO₄、NaOH溶液（尾气吸收）',
            '实验步骤':'1.在圆底烧瓶中加入Na₂SO₃固体，分液漏斗中加入浓H₂SO₄；2.将导管依次连接品红溶液→石蕊试液→酸性KMnO₄溶液→NaOH尾气吸收；3.打开分液漏斗活塞，滴加浓H₂SO₄；4.观察各试管现象',
            '现象与结论':'品红溶液褪色→SO₂有漂白性；紫色石蕊变红→SO₂与水生成H₂SO₃显酸性；酸性KMnO₄溶液褪色→SO₂有还原性（被氧化为SO₄²⁻）。结论：SO₂是酸性氧化物，兼有漂白性和还原性',
            '误差分析/注意事项':'1.实验在通风橱中进行；2.尾气必须用NaOH溶液吸收；3.控制硫酸滴加速度以控制气流；4.品红褪色实验需加热后才能证明是SO₂漂白（区别于Cl₂）；5.SO₂漂白性可逆（加热恢复红色）'
        },
        {
            id:'chem_05', module:'选修5',
            '实验目的':'通过酯化反应制备乙酸乙酯，掌握酯化反应的条件和操作',
            '实验原理':'CH₃COOH+C₂H₅OH⇌浓H₂SO₄/加热=CH₃COOC₂H₅+H₂O（酯化反应，酸脱羟基醇脱氢）；浓H₂SO₄作催化剂和吸水剂；用饱和Na₂CO₃溶液接收产物（中和乙酸、溶解乙醇、降低酯的溶解度）',
            '实验器材':'试管、酒精灯、铁架台、导管、饱和Na₂CO₃溶液、无水乙醇、冰醋酸、浓H₂SO₄、碎瓷片',
            '实验步骤':'1.在一支试管中依次加入3mL无水乙醇、2mL冰醋酸，边振荡边缓慢滴加2mL浓H₂SO₄；2.加入碎瓷片防暴沸；3.按图连接装置（导管末端接近饱和Na₂CO₃液面但不浸入）；4.用酒精灯小火均匀加热3-5分钟；5.将生成物倒入盛有饱和Na₂CO₃溶液的试管中，振荡静置分层',
            '现象与结论':'在饱和Na₂CO₃溶液液面上浮有一层无色透明有果香味的油状液体（乙酸乙酯）。结论：酸与醇在浓H₂SO₄催化加热条件下发生酯化反应生成酯和水',
            '误差分析/注意事项':'1.加试剂顺序：乙醇→浓H₂SO₄→冰醋酸（先加密度小的再加密度大的）；2.导管末端不能浸入Na₂CO₃液面（防倒吸）；3.小火加热避免副反应；4.饱和Na₂CO₃可减少酯的溶解损失；5.碎瓷片冷凝后收集时取出'
        },
        {
            id:'chem_06', module:'选修4',
            '实验目的':'掌握酸碱中和滴定的操作，测定未知酸（或碱）溶液的浓度',
            '实验原理':'用已知浓度的标准碱（NaOH）溶液滴定未知浓度的酸（HCl）溶液：c酸V酸=c碱V碱。以酚酞为指示剂，终点时溶液由无色变为浅粉红色且半分钟不褪色',
            '实验器材':'酸式滴定管、碱式滴定管、锥形瓶、烧杯、铁架台（带滴定管夹）、酚酞指示剂、标准NaOH溶液（约0.1mol/L）、待测HCl溶液',
            '实验步骤':'1.检漏：检查滴定管是否漏水；2.润洗：用标准液润洗碱式滴定管2-3次，用待测液润洗酸式滴定管2-3次；3.装液：碱式滴定管装标准NaOH溶液，调零；用移液管取25.00mL待测HCl于锥形瓶，加2滴酚酞；4.滴定：左手控制滴定管活塞，右手持锥形瓶不断摇动；先快后慢逐滴加入，接近终点时半滴加入；5.当溶液由无色变为浅粉红色且半分钟不褪色即为终点，记录V碱；6.重复滴定2-3次取平均值',
            '现象与结论':'溶液由无色变为浅粉红色为滴定终点；由c酸V酸=c碱V碱计算待测HCl浓度。结论：酸碱中和滴定可较精确测定未知酸（碱）的浓度',
            '误差分析/注意事项':'1.滴定管和移液管使用前必须润洗（否则浓度被稀释）；2.锥形瓶不能润洗（否则待测物增多）；3.读数时视线与凹液面最低处相平；4.弃去滴定管尖端气泡；5.半滴操作用锥形瓶内壁轻触液滴'
        }
    ],
    '生物': [
        {
            id:'bio_01', module:'必修1',
            '实验目的':'检测生物组织中的还原糖、脂肪和蛋白质，掌握物质鉴定的基本原理',
            '实验原理':'还原糖（葡萄糖/果糖）与斐林试剂（甲液NaOH+乙液CuSO₄）水浴加热生成砖红色Cu₂O沉淀；脂肪可被苏丹Ⅲ（或苏丹Ⅳ）染成橘黄色（或红色）；蛋白质与双缩脲试剂（NaOH+CuSO₄）反应生成紫色络合物',
            '实验器材':'试管、试管夹、酒精灯、水浴锅、显微镜、载玻片、盖玻片、滴管、斐林试剂（甲液+乙液）、苏丹Ⅲ染液、双缩脲试剂（A液NaOH+B液CuSO₄）、苹果匀浆、花生种子、豆浆',
            '实验步骤':'1.还原糖检测：取2mL苹果匀浆加1mL斐林试剂（甲液+乙液等量混合），水浴加热2分钟，观察颜色变化；2.脂肪检测：取花生子叶切片，加2-3滴苏丹Ⅲ染液染色3分钟，用50%酒精洗去浮色，显微镜下观察；3.蛋白质检测：取2mL豆浆加2mL双缩脲试剂A液摇匀，再加3-4滴B液摇匀，观察颜色变化',
            '现象与结论':'苹果匀浆→砖红色沉淀（含还原糖）；花生子叶→橘黄色脂肪滴（含脂肪）；豆浆→紫色（含蛋白质）。结论：生物组织中通常含有有机物，可通过特定颜色反应鉴定',
            '误差分析/注意事项':'1.斐林试剂必须现配现用（甲液+乙液等量混合使用）；2.双缩脲试剂先加A液后加B液（顺序不能颠倒）；3.脂肪检测需用50%酒精洗去浮色；4.还原糖检测需水浴加热；5.双缩脲CuSO₄只需3-4滴（过量蓝色遮盖紫色）'
        },
        {
            id:'bio_02', module:'必修1',
            '实验目的':'观察DNA和RNA在细胞中的分布，验证DNA主要分布在细胞核、RNA主要在细胞质',
            '实验原理':'甲基绿使DNA呈绿色，吡罗红使RNA呈红色；盐酸可改变细胞膜通透性，使染色剂进入细胞，同时使DNA与蛋白质分离利于染色',
            '实验器材':'显微镜、载玻片、盖玻片、滴管、吸水纸、消毒牙签（取口腔上皮细胞）、生理盐水（0.9%NaCl）、8%盐酸、吡罗红甲基绿混合染色剂',
            '实验步骤':'1.在洁净载玻片上滴一滴生理盐水；2.用牙签刮取口腔上皮细胞，在盐水中涂抹均匀；3.将涂片在酒精灯火焰上烘干固定；4.将涂片浸入8%盐酸中5分钟（30℃水浴）；5.用蒸馏水冲洗10秒去除盐酸；6.滴加吡罗红-甲基绿混合染色剂染色5分钟；7.盖上盖玻片，显微镜下观察',
            '现象与结论':'细胞核区域呈绿色（含DNA），细胞质区域呈红色（含RNA）。结论：DNA主要分布在细胞核中，RNA主要分布在细胞质中',
            '误差分析/注意事项':'1.盐酸处理时间不能过长（破坏细胞结构）；2.涂片要均匀薄层；3.蒸馏水冲洗要彻底（残留盐酸影响染色）；4.染色时间不宜过长或过短；5.口腔上皮细胞较人表皮细胞更易获取'
        },
        {
            id:'bio_03', module:'必修1',
            '实验目的':'观察植物细胞质壁分离与复原，验证成熟植物细胞是一个渗透系统',
            '实验原理':'当细胞液浓度<外界溶液浓度时，细胞失水质壁分离（原生质层与细胞壁分离）；当细胞液浓度>外界溶液浓度时，细胞吸水复原；原生质层相当于半透膜，细胞壁是全透性的',
            '实验器材':'显微镜、载玻片、盖玻片、滴管、镊子、吸水纸、紫色洋葱鳞片叶（外表皮）、质量分数0.3g/mL蔗糖溶液、清水',
            '实验步骤':'1.撕取紫色洋葱外表皮（单层细胞）制成临时装片；2.显微镜先低倍后高倍观察正常细胞形态（大液泡充满细胞，紫色均匀）；3.从盖玻片一侧滴加蔗糖溶液，另一侧用吸水纸吸引，重复2-3次使蔗糖溶液充分置换；4.显微镜观察质壁分离过程（原生质层逐渐与细胞壁分离）；5.从盖玻片一侧滴加清水，另一侧用吸水纸吸引重复置换；6.显微镜观察质壁分离复原',
            '现象与结论':'加蔗糖后细胞失水→原生质层缩小与细胞壁分离（质壁分离）→紫色区域缩小变深；加清水后细胞吸水→原生质层膨胀恢复原位（质壁分离复原）→紫色区域恢复原状。结论：成熟植物细胞是一个渗透系统，原生质层具有选择透过性',
            '误差分析/注意事项':'1.必须选用紫色洋葱外表皮（有颜色便于观察）；2.蔗糖浓度要适中（0.3g/mL，过浓导致细胞死亡）；3.引流要充分（至少3次）；4.观察时间不能太久（细胞可能死亡）；5.临时装片不能干涸'
        },
        {
            id:'bio_04', module:'必修1',
            '实验目的':'探究酶的高效性与专一性',
            '实验原理':'高效性：比较H₂O₂在FeCl₃（无机催化剂）和过氧化氢酶（生物催化剂）催化下分解速率，通过气泡生成速率和卫生香复燃判断；专一性：淀粉酶只能催化淀粉水解为麦芽糖，不能催化蔗糖水解，用斐林试剂检测还原糖的生成',
            '实验器材':'试管、量筒、滴管、恒温水浴锅、卫生香、火柴、新鲜肝脏研磨液（含过氧化氢酶）、3%H₂O₂溶液、3.5%FeCl₃溶液、淀粉酶溶液、1%淀粉溶液、1%蔗糖溶液、斐林试剂',
            '实验步骤':'1.高效性：A管加2mL H₂O₂+2滴FeCl₃，B管加2mL H₂O₂+2滴肝脏研磨液；观察气泡生成速率，用带火星的卫生香检验；2.专一性：C管加2mL淀粉溶液+2mL淀粉酶，D管加2mL蔗糖溶液+2mL淀粉酶；均在60℃水浴5分钟，取出各加斐林试剂水浴加热，观察颜色变化',
            '现象与结论':'高效性：B管气泡剧烈产生，卫生香迅速复燃（剧烈燃烧）；A管气泡缓慢，卫生香复燃微弱。FeCl₃和过氧化氢酶均催化H₂O₂分解，但酶催化效率远高于无机催化剂。专一性：C管出现砖红色沉淀（淀粉被水解为麦芽糖），D管无砖红色（蔗糖未被水解）。结论：酶具有高效性和专一性',
            '误差分析/注意事项':'1.肝脏研磨液需新鲜制备（酶易失活）；2.高效性实验中H₂O₂需新鲜配制；3.专一性需确保淀粉酶纯度（不能含蔗糖酶）；4.专一性实验要控制相同温度和时间；5.斐林试剂需现配现用且需水浴加热'
        },
        {
            id:'bio_05', module:'必修1',
            '实验目的':'提取和分离叶绿体中的光合色素',
            '实验原理':'提取：用无水乙醇（或丙酮）溶解脂溶性光合色素；分离：纸层析法，利用不同色素在层析液中溶解度不同，随层析液在滤纸条上扩散速度不同而分离（胡萝卜素最快，叶绿素b最慢）',
            '实验器材':'研钵、漏斗、滤纸、尼龙布、试管、毛细管、剪刀、层析缸、天平、天平、无水乙醇、层析液（石油醚:丙酮:苯=20:2:1）、石英砂（助研磨）、CaCO₃（防色素破坏）、新鲜菠菜叶',
            '实验步骤':'1.称取5g菠菜叶，剪碎放入研钵；2.加少许石英砂、CaCO₃和10mL无水乙醇，迅速充分研磨至糊状；3.用漏斗和尼龙布过滤，收集墨绿色滤液（色素提取液）；4.准备滤纸条（一端剪去两角），在距一端1cm处用铅笔画横线；5.用毛细管蘸色素提取液在横线上画细线（重复3-4次）；6.将滤纸条放入层析缸（有适量层析液），不让色素线浸入层析液；7.盖上缸盖，观察色素分离，取出晾干',
            '现象与结论':'滤纸条上从下至上出现四条色素带：叶绿素b（黄绿色，最慢）、叶绿素a（蓝绿色）、叶黄素（黄色）、胡萝卜素（橙黄色，最快）。结论：叶绿体含4种光合色素，可利用纸层析法分离',
            '误差分析/注意事项':'1.研磨要迅速（防止色素被氧化）；2.加CaCO₃保护叶绿素不被破坏；3.色素线要细、直、浓；4.色素线不能浸入层析液（否则色素溶解）；5.滤纸条一端剪去两角使层析液同步上升'
        },
        {
            id:'bio_06', module:'必修1',
            '实验目的':'观察植物细胞有丝分裂，识别各分裂时期的主要特征',
            '实验原理':'根尖分生区细胞分裂旺盛；盐酸解离使细胞相互分离；龙胆紫（或醋酸洋红）使染色体着色，便于观察各分裂时期（间期+前中后末四个时期）',
            '实验器材':'显微镜、载玻片、盖玻片、镊子、剪刀、滴管、培养皿、洋葱根尖（已培养至根长约5cm）、质量分数15%盐酸+体积分数95%酒精（1:1混合解离液）、龙胆紫染液（或醋酸洋红）、清水',
            '实验步骤':'1.培养：洋葱底部接触水面，待根长至约5cm；2.取材：剪取根尖2-3mm（上午10时至下午2时最佳）；3.解离：将根尖浸入解离液（15%HCl+95%酒精1:1）中3-5分钟至酥软；4.漂洗：用清水漂洗约10分钟（洗去解离液）；5.染色：将根尖放入龙胆紫染液中染色3-5分钟；6.制片：将根尖置于载玻片，加一滴清水，盖上盖玻片，用拇指轻压（再加一片载玻片后再压）使细胞分散；7.显微镜先低倍后高倍观察',
            '现象与结论':'可观察到间期（核膜核仁完整，染色质细丝状）→前期（染色质浓缩为染色体，核膜核仁消失）→中期（染色体排列在赤道板，形态最清晰）→后期（着丝点分裂，姐妹染色单体分开移向两极）→末期（染色体解旋，核膜核仁重新出现）。结论：植物细胞有丝分裂是连续过程，分为间期和分裂期（前中后末），实现了遗传物质的复制和均等分配',
            '误差分析/注意事项':'1.根尖取材时机（分裂旺盛时段）；2.解离时间不能过长或过短；3.漂洗必须彻底（防染色不佳）；4.压片力度适中（既要分散又不能压碎）；5.观察时先用低倍镜找分生区细胞再用高倍镜'
        }
    ]
};

// 状态管理
var etState = {
    currentSubject: '物理',
    selectedExperiment: null,
    collapsedColumns: {},
    expandedAll: true,
    filterModule: 'all'
};

function getModulesForSubject(subject){
    var exps = EXPERIMENTS[subject];
    var modules = [];
    for(var i=0;i<exps.length;i++){
        if(modules.indexOf(exps[i].module)===-1) modules.push(exps[i].module);
    }
    return modules;
}

function renderExperimentTable(){
    var container = document.getElementById('experiment-table-app');
    if(!container) return;
    var color = SUBJECT_COLORS[etState.currentSubject]||'#333';
    var exps = EXPERIMENTS[etState.currentSubject];

    var html = '<div data-style="font-family:sans-serif;">';

    // 顶部：tab切换
    html += '<div data-style="display:flex;border-bottom:3px solid '+color+';margin-bottom:12px;">';
    var subjects = ['物理','化学','生物'];
    for(var i=0;i<subjects.length;i++){
        var s = subjects[i];
        var active = etState.currentSubject===s;
        html += '<div data-call="window.experimentTable._switchSubject" data-arg1="@s:' + s + '" data-style="'+
            'flex:1;text-align:center;padding:12px 8px;cursor:pointer;font-weight:'+(active?'700':'400')+';'+
            'color:'+(active?SUBJECT_COLORS[s]:'#999')+';border-bottom:'+(active?'3px solid '+SUBJECT_COLORS[s]:'3px solid transparent')+';'+
            'margin-bottom:-3px;transition:all 0.2s;font-size:15px;">'+s+'实验 ('+EXPERIMENTS[s].length+'个)</div>';
    }
    html += '</div>';

    // 工具栏
    html += '<div data-style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:14px;">';
    // 筛选
    html += '<select data-call=\"window.experimentTable._filterModule\" data-arg1=\"@val\" data-style="padding:6px 12px;border:2px solid #ddd;border-radius:8px;font-size:13px;cursor:pointer;">';
    html += '<option value="all">全部实验</option>';
    var mods = getModulesForSubject(etState.currentSubject);
    for(var m=0;m<mods.length;m++){
        html += '<option value="'+mods[m]+'"'+(etState.filterModule===mods[m]?' selected':'')+'>'+mods[m]+'</option>';
    }
    html += '</select>';
    // 全覆盖按钮
    html += '<button data-call=\"window.experimentTable._toggleAll\" data-style="padding:6px 16px;border:2px solid '+color+';border-radius:8px;background:#fff;color:'+color+';cursor:pointer;font-size:13px;">'+(etState.expandedAll?'全部收起':'全部展开')+'</button>';
    // 导出按钮
    html += '<button data-call=\"window.experimentTable._exportAll\" data-style="padding:6px 16px;border:2px solid #28a745;border-radius:8px;background:#fff;color:#28a745;cursor:pointer;font-size:13px;">📋 导出纯文本</button>';
    html += '</div>';

    // 实验列表
    html += '<div data-style="max-height:500px;overflow-y:auto;">';
    for(var j=0;j<exps.length;j++){
        var exp = exps[j];
        if(etState.filterModule!=='all' && exp.module!==etState.filterModule) continue;
        var isOpen = etState.expandedAll;
        html += '<div data-style="margin-bottom:8px;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;">';
        // 标题栏
        html += '<div data-call="window.experimentTable._toggleExperiment" data-arg1="@s:' + exp.id + '" data-style="'+
            'padding:10px 14px;background:'+color+';color:#fff;cursor:pointer;display:flex;justify-content:space-between;align-items:center;">';
        html += '<span data-style="font-weight:600;font-size:14px;">'+(j+1)+'. '+exp['实验目的']+'</span>';
        html += '<span data-style="font-size:12px;opacity:0.9;">'+exp.module+' '+(isOpen?'▲':'▼')+'</span>';
        html += '</div>';
        // 表格内容
        html += '<div data-style="display:'+(isOpen?'block':'none')+';" id="exp-body-'+exp.id+'">';
        html += '<table data-style="width:100%;border-collapse:collapse;font-size:13px;">';
        for(var c=0;c<COLUMNS.length;c++){
            var col = COLUMNS[c];
            var colContent = exp[col]||'';
            html += '<tr data-style="border-bottom:1px solid #f0f0f0;">';
            html += '<td data-style="padding:8px 12px;background:#f9f9f9;font-weight:600;color:'+color+';width:120px;vertical-align:top;font-size:12px;">'+col+'</td>';
            html += '<td data-style="padding:8px 12px;line-height:1.7;color:#444;">'+colContent+'</td>';
            html += '</tr>';
        }
        html += '</table>';
        html += '</div>';
        html += '</div>';
    }
    html += '</div>';

    html += '</div>';
    container.innerHTML = html;
}

// 导出纯文本
function exportAllText(){
    var exps = EXPERIMENTS[etState.currentSubject];
    var text = '【'+etState.currentSubject+'教材实验汇总】\n' + new Array(50).join('=') + '\n\n';
    for(var i=0;i<exps.length;i++){
        var exp = exps[i];
        if(etState.filterModule!=='all' && exp.module!==etState.filterModule) continue;
        text += (i+1)+'. '+exp['实验目的']+' ['+exp.module+']\n';
        for(var c=0;c<COLUMNS.length;c++){
            text += '  '+COLUMNS[c]+'：'+exp[COLUMNS[c]]+'\n';
        }
        text += '\n';
    }
    // 复制到剪贴板
    if(navigator.clipboard){
        navigator.clipboard.writeText(text).then(function(){
            alert('已复制到剪贴板！');
        });
    } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('已复制到剪贴板！');
    }
}

var expTable = {
    render: renderExperimentTable,
    _switchSubject: function(sub){
        etState.currentSubject = sub;
        etState.filterModule = 'all';
        etState.expandedAll = true;
        renderExperimentTable();
    },
    _filterModule: function(mod){
        etState.filterModule = mod;
        renderExperimentTable();
    },
    _toggleAll: function(){
        etState.expandedAll = !etState.expandedAll;
        renderExperimentTable();
    },
    _toggleExperiment: function(eid){
        var body = document.getElementById('exp-body-'+eid);
        if(body) body.style.display = body.style.display==='none'?'block':'none';
    },
    _exportAll: exportAllText
};

window.experimentTable = expTable;

})();

// 模块3: thinkingChain（大题解题思维链）
(function(){
'use strict';

// 思维链题库（10道广东高考大题）
var THINKING_QUESTIONS = [
    // ---- 物理3道 ----
    {
        id:'phy_tc_01', subject:'物理', year:'2024广东高考', type:'综合力学',
        title:'斜面+圆弧+弹簧综合题',
        question:'如图所示，倾角θ=30°的斜面底端与半径R=0.5m的光滑圆弧轨道相切连接，圆弧末端连接一根劲度系数k=100N/m的轻弹簧。质量m=0.2kg的小物块从斜面高h=1.2m处由静止释放，滑过斜面后进入圆弧轨道，压缩弹簧。斜面动摩擦因数μ=0.2，重力加速度g=10m/s²。求：(1)物块到达斜面底端的速度；(2)物块在圆弧轨道最低点对轨道的压力；(3)弹簧的最大压缩量。',
        thinkingSteps:[
            { condition:'物块从h=1.2m斜面顶端由静止释放', think:'想到用机械能守恒或动能定理计算末速度', why:'因为涉及高度变化，重力做功转化为动能，但斜面有摩擦，需用动能定理：WG+Wf=ΔEk', next:'计算斜面长度L=h/sin30°=2.4m，重力功WG=mgh=2.4J，摩擦力功Wf=-μmgcosθ·L', pitfall:'不要直接用机械能守恒——因为有摩擦，机械能不守恒！' },
            { condition:'斜面底端与圆弧轨道相切', think:'速度方向与圆弧切线一致，速度大小不变进入圆弧', why:'相切意味着平滑过渡，速度大小在进入瞬间没有突变（无碰撞），只需分析圆弧内运动', next:'进入圆弧后，只有重力做功（光滑），可用能量守恒或牛顿第二定律分析', pitfall:'注意区分斜面速度与圆弧速度的矢量方向——相切保证过渡平滑' },
            { condition:'求圆弧轨道最低点对轨道的压力', think:'想到向心力公式：N-mg=mv²/R，需要先求最低点速度', why:'圆周运动最低点处，合外力提供向心力，合力=N向上-mg向下，指向圆心', next:'用能量守恒求最低点速度：mgh(总)=½mv² → v；代入N=mg+mv²/R', pitfall:'不要混淆"轨道对物块的力"和"物块对轨道的压力"——它们是作用力与反作用力' },
            { condition:'压缩弹簧至最大压缩量', think:'从圆弧末端到弹簧最大压缩，水平面无摩擦，机械能守恒', why:'圆弧出来后所有动能转化为弹簧弹性势能Ep=½kx²，mgh(有效)=½kx²', next:'计算总有效重力势能（考虑摩擦损失），令其=½kx²解出x', pitfall:'注意斜面摩擦消耗了部分能量，不要用初始总机械能直接计算' },
            { condition:'综合求解', think:'三步能量分析：斜面动能定理→圆弧能量守恒→弹簧能量守恒', why:'斜面有摩擦用动能定理；圆弧和弹簧阶段分别用机械能守恒', next:'依次求出v底、N、x完成解答', pitfall:'每个阶段的能量分析切换要清晰，不能混淆' }
        ],
        finalAnswer:'(1)物块到达斜面底端速度v₁=√(2gh-2μgLcosθ)≈4.0m/s；(2)圆弧最低点速度v₂=√(v₁²+2gR)≈5.0m/s，压力N=mg+mv₂²/R≈12N，方向竖直向下；(3)弹簧最大压缩量x=v₂√(m/k)≈0.22m'
    },
    {
        id:'phy_tc_02', subject:'物理', year:'2023广东高考', type:'复合场',
        title:'带电粒子在复合场中运动',
        question:'在xOy平面第一象限内存在垂直纸面向里的匀强磁场B=0.5T和沿y轴正方向的匀强电场E=10³V/m。一带正电粒子(m=1.6×10⁻²⁷kg,q=3.2×10⁻¹⁹C)以v₀=2×10⁴m/s沿x轴正方向从O点射入。求：(1)粒子在磁场中的轨道半径和周期；(2)电场力与洛伦兹力平衡时的速度条件；(3)粒子第一次回到x轴的时间。',
        thinkingSteps:[
            { condition:'粒子以v₀沿x轴射入，B垂直纸面向里', think:'洛伦兹力方向用左手定则判断：四指指向+v₀方向(x轴正向)，磁感线穿入手心', why:'正电荷受力F=qv₀B，方向垂直于v₀向上(y轴)，粒子做匀速圆周运动', next:'计算半径R=mv₀/(qB)和周期T=2πm/(qB)', pitfall:'注意区分正负电荷的受力方向；若为负电荷洛伦兹力方向相反' },
            { condition:'同时存在电场E沿y轴正方向', think:'电场力F=qE沿y轴正向，与初始洛伦兹力同向', why:'两个力方向相同，粒子不做匀速圆周运动，而是类平抛+圆周的复合运动', next:'判断是否需要速度选择器条件：qvB=qE时粒子直线运动，即v=E/B', pitfall:'不要误以为粒子做简单圆周运动——电场力持续作用改变了运动性质' },
            { condition:'求速度条件使电场力与洛伦兹力平衡', think:'qvB=qE → v=E/B=2×10⁴m/s恰好等于v₀', why:'当v=E/B时电场力与洛伦兹力等大反向才能平衡，此时粒子做匀速直线运动', next:'验证v₀=E/B=2000/0.5=2×10⁴m/s，正好等于给定v₀', pitfall:'平衡条件是qvB=qE，但方向必须相反才平衡，初始时两者同向并不平衡！' },
            { condition:'粒子第一次回到x轴的时间', think:'粒子做摆线运动，需用运动的分解：匀速+匀速圆周的叠加', why:'x方向不受力→匀速运动x=v₀t；y方向受电场力+洛伦兹力→类似简谐运动', next:'粒子回到x轴即y=0，由摆线运动方程y=R(1-cosωt)得cosωt=1时y=0，即t=T=2πm/(qB)', pitfall:'这是典型的配速法问题，需要将速度分解为"漂移速度+转动速度"来分析' }
        ],
        finalAnswer:'(1)R=mv₀/(qB)≈0.20m，T=2πm/(qB)≈6.28×10⁻⁸s；(2)v=E/B=2×10⁴m/s与v₀相等；(3)粒子第一次回到x轴时间t=T≈6.28×10⁻⁸s'
    },
    {
        id:'phy_tc_03', subject:'物理', year:'2022广东高考', type:'板块模型',
        title:'滑块+木板模型',
        question:'质量M=2kg的长木板静止在光滑水平面上，质量m=1kg的小滑块以v₀=6m/s的初速度从左端滑上木板。已知滑块与木板间μ=0.4，木板长度L=2m，g=10m/s²。问：(1)滑块和木板的加速度；(2)滑块在木板上滑行的时间；(3)滑块是否会从木板右端滑出？',
        thinkingSteps:[
            { condition:'滑块以v₀=6m/s滑上静止木板', think:'滑块相对木板向前运动，摩擦力向后；木板受摩擦力向前', why:'滑块受到木板对它的滑动摩擦力f=μmg向后，木板受到滑块对它的摩擦反作用力向前', next:'分别用牛顿第二定律求a块和a板', pitfall:'摩擦力方向是关键——滑块减速(f向后)，木板加速(f向前)' },
            { condition:'木板静止在光滑水平面上', think:'水平面光滑→木板不受地面摩擦，仅在滑块摩擦力作用下加速', why:'如果水平面粗糙，木板受地面摩擦力，需考虑是否会动', next:'a板=f/M=μmg/M=0.4×1×10/2=2m/s²', pitfall:'地面光滑意味着木板没有其他外力约束，一定会被滑块带动作加速运动' },
            { condition:'求滑块在木板上滑行时间', think:'用相对运动：相对初速度v₀\'=v₀，相对加速度a\'=a块-a板', why:'滑块相对于木板的加速度a\'=a块(向后)+a板(向前)=μg+μg·m/M', next:'若滑块未滑出木板，当v块=v板时相对速度为零，用v₀\'=a\'t求t', pitfall:'注意加速度的矢量方向——将滑块和木板加速度视为一维坐标系中的量' },
            { condition:'判断是否会滑出', think:'计算共速前滑块的相对位移Δx与木板长度L比较', why:'以木板为参考系，相对位移=相对初速度²/(2×相对加速度)，若Δx>L则滑出', next:'计算Δx并判断', pitfall:'不要忘记比较共速时刻是否发生在滑块到达右端之前' },
            { condition:'关键判断', think:'滑块在木板上相对滑动的距离是否小于L', why:'若Δx(相)<L，滑块不会滑出；若Δx(相)>L，滑块将从右端滑出', next:'Δx≈2.25m>L=2m → 滑块会滑出', pitfall:'如果滑块滑出木板，后续运动还需分析滑块和木板各自做什么运动' }
        ],
        finalAnswer:'(1)a块=μg=4m/s²向左，a板=μmg/M=2m/s²向右；(2)共速时间t=v₀/(a块+a板)=1s，此时v=2m/s；(3)相对位移Δx=v₀²/[2(a块+a板)]=3m>2m，滑块会从木板右端滑出'
    },
    // ---- 化学3道 ----
    {
        id:'chem_tc_01', subject:'化学', year:'2024广东高考', type:'工业流程',
        title:'镁的提取-沉淀-煅烧-电解工业流程',
        question:'海水中含Mg²⁺约0.13%。工业上从海水中提取镁的流程：海水→加石灰乳Ca(OH)₂→过滤→Mg(OH)₂沉淀→加盐酸溶解→MgCl₂溶液→蒸发浓缩→MgCl₂·6H₂O→在HCl气流中加热→无水MgCl₂→电解熔融MgCl₂→Mg。请分析各步骤的化学原理。',
        thinkingSteps:[
            { condition:'海水中加石灰乳Ca(OH)₂', think:'Mg²⁺+2OH⁻→Mg(OH)₂↓沉淀富集Mg²⁺', why:'利用Mg(OH)₂的溶度积小(Ksp≈1.8×10⁻¹¹)实现沉淀分离，将稀溶液中的Mg²⁺转化为沉淀达到富集目的', next:'计算Ca(OH)₂用量及海水pH调节范围', pitfall:'不能用NaOH（成本高），工业上用石灰乳（廉价且Ca²⁺后续步骤可除去）' },
            { condition:'Mg(OH)₂沉淀加盐酸溶解', think:'Mg(OH)₂+2HCl→MgCl₂+2H₂O', why:'将沉淀再转化为可溶性MgCl₂溶液，便于后续浓缩结晶', next:'控制盐酸用量使Mg(OH)₂恰好完全溶解，避免过量HCl影响后续步骤', pitfall:'盐酸过量会带入Cl⁻杂质并造成浪费，但不足会残留Mg(OH)₂影响收率' },
            { condition:'MgCl₂·6H₂O在HCl气流中加热失水', think:'MgCl₂·6H₂O加热生成无水MgCl₂；必须在HCl气流中加热', why:'MgCl₂+2H₂O⇌加热=Mg(OH)₂+2HCl↑（水解反应）。若在空气中直接加热，MgCl₂会水解成Mg(OH)Cl或MgO，得不到无水MgCl₂。通HCl气流可抑制水解（平衡逆向）。', next:'写出水解方程式，分析勒夏特列原理的应用', pitfall:'这是本流程最关键的操作点——不理解为什么要通HCl气流就丢大分' },
            { condition:'电解熔融MgCl₂制金属镁', think:'MgCl₂(熔融)→电解→Mg(阴极)+Cl₂↑(阳极)', why:'镁是活泼金属，不能用电解水溶液法制备（H⁺优先放电）。必须用熔融盐电解法。', next:'写出电极反应式：阴极Mg²⁺+2e⁻→Mg，阳极2Cl⁻-2e⁻→Cl₂↑', pitfall:'注意电解MgCl₂水溶液得到的是H₂+Cl₂+Mg(OH)₂而非Mg——必须强调熔融！' },
            { condition:'流程中的副产物循环', think:'Cl₂可制盐酸再利用，Ca²⁺来自石灰乳可经沉淀去除', why:'工业流程考虑经济性和环保性——Cl₂可进一步用于合成盐酸循环使用', next:'分析Ca²⁺的去除方式：加Na₂CO₃→CaCO₃↓', pitfall:'流程中的"闭路循环"概念是关键得分点，体现绿色化学思想' }
        ],
        finalAnswer:'(1)Mg²⁺+Ca(OH)₂→Mg(OH)₂↓+Ca²⁺，利用Ksp差异沉淀富集；(2)Mg(OH)₂+2HCl→MgCl₂+2H₂O；(3)HCl气流中加热抑制MgCl₂水解：MgCl₂+2H₂O⇌Mg(OH)₂+2HCl；(4)电解熔融MgCl₂：阴极Mg²⁺+2e⁻→Mg，阳极2Cl⁻-2e⁻→Cl₂↑；(5)Cl₂循环制HCl'
    },
    {
        id:'chem_tc_02', subject:'化学', year:'2023广东高考', type:'化学平衡',
        title:'多平衡体系-Kp计算',
        question:'在恒温恒容密闭容器中发生反应：(I)N₂+O₂⇌2NO ΔH₁>0；(II)2NO+O₂⇌2NO₂ ΔH₂<0。初始充入N₂和O₂各1mol，达平衡时体系总压p总，测出NO的平衡分压为pNO。请：(1)推导反应(I)的Kp表达式；(2)分析温度升高对NO₂产率的影响；(3)给出Kp的计算思路。',
        thinkingSteps:[
            { condition:'两个连续反应在恒温恒容条件下进行', think:'这是连串反应体系，NO是中间产物，平衡时各组分浓度同时满足两个反应的平衡常数', why:'两个反应同时达到平衡，NO既作为反应(I)的产物又作为反应(II)的反应物', next:'分别列出反应(I)和(II)的平衡常数表达式Kp₁和Kp₂', pitfall:'不能单独处理每个反应——它们是耦合的，NO的浓度同时满足两个K' },
            { condition:'反应(I)N₂+O₂⇌2NO ΔH₁>0（吸热）', think:'ΔH₁>0，升温使Kp₁增大，更多NO生成', why:'吸热反应升温平衡常数增大（范特霍夫方程），有利于NO生成', next:'Kp₁=(pNO)²/(pN₂·pO₂)，各分压由物料守恒和总压关系确定', pitfall:'Kp计算中分压要用平衡时的分压而非初始分压' },
            { condition:'反应(II)2NO+O₂⇌2NO₂ ΔH₂<0（放热）', think:'ΔH₂<0，升温使Kp₂减小，NO₂分解', why:'第二步是放热反应，升温不利于NO₂生成，部分已生成的NO₂会分解', next:'Kp₂=(pNO₂)²/(pNO²·pO₂)\'，此处pO₂\'是反应(II)中O₂的分压', pitfall:'反应(I)消耗O₂后剩余的O₂才是反应(II)的初始O₂，要分清转换率关系' },
            { condition:'温度升高对NO₂产率的影响', think:'升温同时影响两个反应——反应(I)促进NO生成，反应(II)抑制NO₂生成', why:'净效果取决于两个反应的ΔH大小和温度变化范围——需要定量分析', next:'可以用盖斯定律将两反应合并：N₂+2O₂→2NO₂ ΔH总，分析总反应的热效应', pitfall:'不能单方面说升温增加或减少NO₂——这是竞争效应，需要严谨分析' },
            { condition:'Kp的计算思路', think:'三步法：设转化量→列平衡表→解方程求分压', why:'设N₂转化了x，则各组分平衡物质的量可用x表示，代入总压关系求出分压，再计算Kp', next:'列物料守恒方程和总压方程，联立求解', pitfall:'注意反应(II)消耗O₂，所以反应(II)的O₂初始量是反应(I)剩余的量' }
        ],
        finalAnswer:'(1)Kp₁=(pNO)²/(pN₂·pO₂)；(2)升温使反应(I)正向、反应(II)逆向，NO₂产率变化取决于两者相对幅度，总体可能降低（ΔH总<0）或升高（高温段ΔH总>0效应）；(3)设N₂转化量x代入物料守恒求各分压后计算Kp'
    },
    {
        id:'chem_tc_03', subject:'化学', year:'2022广东高考', type:'有机推断',
        title:'酯化+加成+消去反应链条',
        question:'某有机物A(C₄H₈O₂)在稀硫酸加热条件下水解得到B和C，B能与NaHCO₃反应产生气体；C催化氧化得到D，D不能发生银镜反应但可与H₂加成得E；E在浓H₂SO₄加热条件下发生消去反应得CH₂=CH₂。推断A~E的结构简式。',
        thinkingSteps:[
            { condition:'A分子式C₄H₈O₂，稀硫酸加热水解', think:'这是酯的水解条件——C₄H₈O₂恰为分子量88的饱和酯', why:'酯在酸性条件下水解生成羧酸和醇；C₄H₈O₂可能是CH₃COOC₂H₅或C₂H₅COOCH₃或HCOOC₃H₇等', next:'列出C₄H₈O₂的所有酯异构体', pitfall:'不要忘记甲酸酯（HCOOR）也可能符合分子式' },
            { condition:'B能与NaHCO₃反应产生气体', think:'B是羧酸（R-COOH），与NaHCO₃反应生成CO₂', why:'只有羧酸的酸性强到能与NaHCO₃反应（酚不能），B含有-COOH', next:'根据C₄H₈O₂水解，B可能是CH₃COOH（含2个C）或HCOOH（含1个C）或C₂H₅COOH（含3个C）', pitfall:'NaHCO₃与羧酸反应是鉴定羧基的特征反应，也是确定B含-COOH的关键' },
            { condition:'C催化氧化得D，D不发生银镜反应', think:'C是醇→氧化→D。D非醛（无银镜），说明D是酮，C是二级醇', why:'一级醇氧化得醛（有银镜），二级醇氧化得酮（无银镜），三级醇不能氧化', next:'C必须是二级醇R₁-CHOH-R₂ → 氧化得酮R₁-CO-R₂', pitfall:'D不能发生银镜是排除了醛的可能性，确定C是二级醇而非一级醇' },
            { condition:'D加H₂得E，E消去得CH₂=CH₂', think:'E消去产物是乙烯（2个C）→ E至少含2个C且连接-OH的相邻C上有H', why:'E→CH₂=CH₂是乙醇消去生成乙烯（C₂H₅OH→浓H₂SO₄/170℃→CH₂=CH₂+H₂O）', next:'E=C₂H₅OH，D=CH₃CHO（乙醛），C=CH₃CH(OH)CH₃→这是错误的！乙醛有银镜反应', pitfall:'这里出现矛盾——D不能发生银镜但E消去得乙烯→需要重新检验推理链条' },
            { condition:'重新分析矛盾：E消去得C₂H₄', think:'E=C₂H₅OH→醇消去得C₂H₄；D加H₂得E，D比E少2个H→D=CH₃CHO', why:'乙醛加H₂→乙醇；乙醛含-CHO→能发生银镜。但题目说D不能发生银镜——矛盾！', next:'唯一可能：E不是乙醇→E消去产物是CH₂=CH₂说明E是乙醇，则D必须是乙醛→但乙醛有银镜', pitfall:'此题存在矛盾需注意！可能D是丙酮(CH₃COCH₃)加H₂得异丙醇，但异丙醇消去得丙烯而非乙烯' }
        ],
        finalAnswer:'A=CH₃COOC₂H₅（乙酸乙酯）；B=CH₃COOH（乙酸）；C=CH₃CH₂OH（乙醇，一级醇）；D=CH₃CHO（乙醛）；E=CH₃CH₂OH。注：D为乙醛可发生银镜反应，题目条件"不能发生银镜"存疑——按此推断链，D为乙醛是最合理答案'
    },
    // ---- 生物4道 ----
    {
        id:'bio_tc_01', subject:'生物', year:'2024广东高考', type:'光合呼吸综合',
        title:'光合作用+呼吸作用综合题',
        question:'某植物在25℃、适宜光照条件下进行实验：CO₂浓度为0.03%时，光合速率为10mgCO₂/(dm²·h)；CO₂浓度升至0.1%时，光合速率升至25mgCO₂/(dm²·h)。黑暗条件下呼吸速率为5mgCO₂/(dm²·h)。(1)计算两种CO₂浓度下的净光合速率和总光合速率；(2)分析CO₂浓度从0.03%升至0.1%时光合速率提高的原因；(3)若温度升至35℃而其他条件不变，预测光合速率变化并解释。',
        thinkingSteps:[
            { condition:'给出两种CO₂浓度下的光合速率和呼吸速率', think:'先区分"光合速率"是净光合还是总光合——题中"光合速率"通常指净光合速率（表观光合）', why:'净光合速率=总光合速率-呼吸速率，是实际测得的CO₂吸收量（或O₂释放量）', next:'计算：CO₂=0.03%时总光合=10+5=15；CO₂=0.1%时总光合=25+5=30', pitfall:'务必明确是净光合还是总光合——混淆两者导致计算错误' },
            { condition:'CO₂浓度从0.03%升至0.1%', think:'CO₂是光合作用暗反应的原料——浓度升高促进CO₂固定', why:'正常大气CO₂浓度约0.03%~0.04%，此时CO₂是光合作用的限制因子；升至0.1%后CO₂供应充足→暗反应加速→光合速率提高', next:'从暗反应机理分析：CO₂+RuBP→2PGA→C₃还原，CO₂浓度影响Rubisco的底物浓度', pitfall:'注意0.1%已远超大气正常浓度，继续升高CO₂效果可能递减（其他因子成为限制）' },
            { condition:'温度从25℃升至35℃', think:'温度影响酶活性——光合作用相关酶的最适温度通常25-30℃', why:'温度升高一方面增加酶活性（到最适温度前），另一方面增加光呼吸和呼吸作用；超过最适温度酶活性下降', next:'35℃已超过RuBisCO最适温度→光合速率可能下降；同时呼吸速率增加→净光合下降更明显', pitfall:'C₃植物在高温下光呼吸增强，净光合下降幅度可能比总光合更大' }
        ],
        finalAnswer:'(1)CO₂0.03%时：净光合=10，总光合=15；CO₂0.1%时：净光合=25，总光合=30（单位：mgCO₂/(dm²·h)）；(2)CO₂浓度升高→暗反应底物增加→CO₂固定速率加快→光合速率提高；(3)35℃时净光合可能下降，因温度超过最适温度导致酶活性降低且呼吸作用增强'
    },
    {
        id:'bio_tc_02', subject:'生物', year:'2023广东高考', type:'遗传大题',
        title:'两对基因+伴性+致死',
        question:'果蝇红眼(B)对白眼(b)为显性，基因位于X染色体上；长翅(V)对残翅(v)为显性，基因位于常染色体上。纯合红眼长翅雌蝇与白眼残翅雄蝇杂交得F₁，F₁雌雄果蝇自由交配得F₂。(1)写出亲本和F₁基因型；(2)F₂表现型及比例；(3)若B基因纯合致死（X^BX^B和X^BY致死），F₂的表现型及比例有何变化？',
        thinkingSteps:[
            { condition:'红眼B白眼b位于X染色体，长翅V残翅v位于常染色体', think:'两对基因独立遗传（非同源染色体），需分别分析常染色体和性染色体，再组合', why:'常染色体基因雌雄相同，X染色体基因雌雄不同——雌蝇XX两条，雄蝇XY一条', next:'纯合红眼长翅雌=X^BX^BVV，白眼残翅雄=X^bYvv → F₁雌=X^BX^bVv，F₁雄=X^BYVv', pitfall:'注意性染色体基因在雌雄中的写法不同——雌蝇两个X等位基因，雄蝇一个X一个Y' },
            { condition:'F₁自由交配得F₂', think:'用棋盘法分别分析两对基因的遗传，然后组合', why:'自由组合定律：常染色体长/残翅遵循3:1，X染色体红/白眼在雌雄中比例不同', next:'常染色体：Vv×Vv→3/4长翅:1/4残翅（雌雄相同）；X染色体：X^BX^b×X^BY→雌全红，雄红:白=1:1', pitfall:'X染色体上的基因，父本X只传给女儿，母本X随机传给儿子和女儿' },
            { condition:'B基因纯合致死', think:'X^BX^B和X^BY个体死亡，导致F₂中基因型比例改变', why:'纯合致死改变F₂的基因型频率和表现型比例，需要剔除致死个体后重新计算', next:'列出F₂所有基因型→删除X^BX^B和X^BY→重新计算各类别的比例', pitfall:'致死效应使得表现型比例不能直接套用孟德尔比例，必须逐项计算并归一化' }
        ],
        finalAnswer:'(1)亲本：♀X^BX^BVV×♂X^bYvv；F₁：♀X^BX^bVv、♂X^BYVv；(2)F₂：♀全红眼（长:残=3:1）、♂红:白=1:1（长:残=3:1）；(3)纯合致死后F₂♀X^BX^b:♀X^bX^b=2:1（均长:残=3:1），♂全部为X^bY（白眼，长:残=3:1）'
    },
    {
        id:'bio_tc_03', subject:'生物', year:'2025广东高考', type:'神经体液调节',
        title:'神经-体液调节综合题',
        question:'人体血糖浓度升高时，胰岛B细胞分泌胰岛素增多，促进组织细胞摄取、利用和储存葡萄糖，降低血糖。当血糖浓度过低时，胰岛A细胞分泌胰高血糖素促进肝糖原分解。(1)分析血糖调节中神经调节和体液调节的关系；(2)说明胰岛素降低血糖的分子机制；(3)解释为什么糖尿病患者"三多一少"（多饮多食多尿体重减少）。',
        thinkingSteps:[
            { condition:'血糖升高→胰岛B细胞→胰岛素分泌', think:'这是体液调节（激素调节）的核心环节——化学信号', why:'血糖浓度直接刺激胰岛B细胞，引起胰岛素分泌增加——这是体液调节的化学刺激途径', next:'同时下丘脑的某个区域可通过交感/副交感神经调节胰岛素分泌——这是神经调节途径', pitfall:'注意血糖调节是神经-体液双重调节，不是单纯的体液调节' },
            { condition:'胰岛素降低血糖的分子机制', think:'胰岛素与靶细胞膜上受体结合→信号转导→GLUT4转运蛋白移至细胞膜→葡萄糖进入加速', why:'胰岛素通过促进葡萄糖转运蛋白GLUT4向细胞膜转位，增加细胞对葡萄糖的摄取', next:'同时胰岛素激活糖原合成酶促进糖原合成，抑制糖原磷酸化酶减少糖原分解', pitfall:'区分胰岛素通过受体介导的信号转导（胞内）和直接作用于膜转运蛋白（膜上）' },
            { condition:'糖尿病患者"三多一少"', think:'血糖高→超过肾糖阈→尿中有葡萄糖→渗透性利尿→多尿', why:'血糖>肾糖阈(约180mg/dL)→肾小管不能完全重吸收葡萄糖→尿糖→小管液渗透压升高→水重吸收减少→尿量增多→脱水→口渴多饮→能量流失→多食→体重减少', next:'逐个分析三多一少的病理生理学原因', pitfall:'多食的原因是细胞内缺糖（胰岛素不足→葡萄糖不能进入细胞→细胞"饥饿"信号）而非血糖高' }
        ],
        finalAnswer:'(1)血糖调节是神经-体液双重调节：下丘脑通过交感/副交感神经控制胰岛分泌（神经调节），同时血糖浓度直接刺激胰岛分泌（体液调节）；(2)胰岛素→受体结合→GLUT4转位→葡萄糖摄取↑；激活糖原合成酶→糖原合成↑；抑制糖异生；(3)高血糖→超过肾糖阈→糖尿→渗透性利尿→多尿→脱水→多饮；细胞内缺糖→饥饿→多食；糖利用障碍→蛋白质和脂肪分解→消瘦'
    },
    {
        id:'bio_tc_04', subject:'生物', year:'2022广东高考', type:'生态系统能量流动',
        title:'生态系统能量流动计算题',
        question:'某生态系统食物链：草→兔→狐。草固定的太阳能为1000kJ/(m²·a)，兔同化的能量为120kJ，狐同化的能量为15kJ。(1)计算兔与草之间的能量传递效率；(2)分析能量逐级递减的原因；(3)绘制该食物链的能量金字塔。',
        thinkingSteps:[
            { condition:'草固定1000kJ，兔同化120kJ，狐同化15kJ', think:'能量传递效率=下一营养级同化量/上一营养级同化量×100%', why:'林德曼效率通常约10%~20%，此处兔/草=12%，狐/兔=12.5%符合规律', next:'计算传递效率并判断是否在合理范围', pitfall:'注意是"同化量"之比而非"摄入量"之比——摄入=同化+粪便（未被同化）' },
            { condition:'分析能量逐级递减原因', think:'每个营养级的能量去路：呼吸消耗+未被利用+流入下一营养级+分解者分解', why:'大部分能量通过呼吸作用以热能形式散失（约50%~70%），只有少部分转化为生物量供下一营养级利用', next:'列出能量分配的四个去路，解释各自的比例', pitfall:'能量"递减"不是能量"消失"——符合热力学第一定律，只是转化为不可利用的热能形式' },
            { condition:'绘制能量金字塔', think:'能量金字塔总是正金字塔形（底层最宽），因为能量沿食物链递减', why:'能量沿食物链逐级递减，所以越往上能量越少——能量金字塔总是正金字塔', next:'按比例绘制：草:兔:狐≈100:12:1.5', pitfall:'与数量金字塔和生物量金字塔区分——后两者有时是倒金字塔（如一棵树上的昆虫）' }
        ],
        finalAnswer:'(1)兔/草=120/1000=12%，狐/兔=15/120=12.5%；(2)能量逐级递减原因：呼吸作用以热能形式消耗大部分能量（50%~70%），未被利用的能量（枯枝落叶、骨骼等），粪便中的能量（未被同化）进入分解者；(3)能量金字塔为正金字塔形，各营养级能量比≈100:12:1.5'
    }
];

// 状态管理
var tcState = {
    currentQuestion: null,
    currentStepIndex: 0,
    selectedSubject: 'all',
    autoPlayInterval: null,
    autoPlaying: false
};

function renderThinkingChain(){
    var container = document.getElementById('thinking-chain-app');
    if(!container) return;

    var html = '<div data-style="display:flex;height:600px;font-family:sans-serif;gap:0;">';

    // 左侧：题目列表
    html += '<div data-style="width:280px;min-width:280px;border-right:1px solid #e0e0e0;overflow-y:auto;background:#fafafa;">';
    html += '<div data-style="padding:12px;background:#333;color:#fff;font-weight:600;font-size:14px;">📋 题目列表</div>';
    // 科目过滤
    html += '<div data-style="padding:8px 12px;display:flex;gap:6px;flex-wrap:wrap;">';
    var subFilters = ['all','物理','化学','生物'];
    for(var i=0;i<subFilters.length;i++){
        var sf = subFilters[i];
        var active = tcState.selectedSubject===sf;
        html += '<button data-call="window.thinkingChain._filterSubject" data-arg1="@s:' + sf + '" data-style="'+
            'padding:3px 10px;border:1px solid '+(active?'#1a73e8':'#ddd')+';border-radius:14px;font-size:11px;'+
            'background:'+(active?'#1a73e8':'#fff')+';color:'+(active?'#fff':'#555')+';cursor:pointer;">'+(sf==='all'?'全部':sf)+'</button>';
    }
    html += '</div>';
    for(var j=0;j<THINKING_QUESTIONS.length;j++){
        var q = THINKING_QUESTIONS[j];
        if(tcState.selectedSubject!=='all' && q.subject!==tcState.selectedSubject) continue;
        var isSelected = tcState.currentQuestion && tcState.currentQuestion.id===q.id;
        html += '<div data-call="window.thinkingChain._selectQuestion" data-arg1="@s:' + q.id + '" data-style="'+
            'padding:10px 12px;border-bottom:1px solid #eee;cursor:pointer;'+
            'background:'+(isSelected?'#e8f0fe':'#fff')+';border-left:'+(isSelected?'4px solid #1a73e8':'4px solid transparent')+';">';
        html += '<div data-style="font-size:11px;color:#888;">'+q.subject+' · '+q.year+'</div>';
        html += '<div data-style="font-size:13px;font-weight:600;color:#333;">'+q.title+'</div>';
        html += '</div>';
    }
    html += '</div>';

    // 中间：思维链SVG可视化
    html += '<div data-style="flex:1;overflow-y:auto;padding:16px;background:#fff;">';
    if(tcState.currentQuestion){
        html += '<h3 data-style="color:#333;margin:0 0 16px 0;font-size:16px;">'+tcState.currentQuestion.title+'</h3>';
        html += renderSVGChain(tcState.currentQuestion);
    } else {
        html += '<div data-style="text-align:center;color:#999;padding-top:200px;">👈 请从左侧选择一道题目开始分析</div>';
    }
    html += '</div>';

    // 右侧：详情面板
    html += '<div data-style="width:300px;min-width:300px;border-left:1px solid #e0e0e0;overflow-y:auto;background:#fafafa;padding:16px;">';
    if(tcState.currentQuestion && tcState.currentQuestion.thinkingSteps[tcState.currentStepIndex]){
        var step = tcState.currentQuestion.thinkingSteps[tcState.currentStepIndex];
        html += '<h4 data-style="color:#1a73e8;margin:0 0 12px 0;">步骤 '+(tcState.currentStepIndex+1)+'/'+tcState.currentQuestion.thinkingSteps.length+'</h4>';
        html += '<div data-style="background:#fff;padding:12px;border-radius:8px;margin-bottom:10px;border:1px solid #e0e0e0;">';
        html += '<div data-style="font-size:12px;color:#888;margin-bottom:4px;">📌 看到条件</div>';
        html += '<div data-style="font-size:13px;color:#333;">'+step.condition+'</div>';
        html += '</div>';
        html += '<div data-style="background:#e8f5e9;padding:12px;border-radius:8px;margin-bottom:10px;border:1px solid #c8e6c9;">';
        html += '<div data-style="font-size:12px;color:#2e7d32;margin-bottom:4px;">💡 应该想到</div>';
        html += '<div data-style="font-size:13px;color:#333;">'+step.think+'</div>';
        html += '</div>';
        html += '<div data-style="background:#fff3e0;padding:12px;border-radius:8px;margin-bottom:10px;border:1px solid #ffe0b2;">';
        html += '<div data-style="font-size:12px;color:#e65100;margin-bottom:4px;">🤔 为什么这样想</div>';
        html += '<div data-style="font-size:13px;color:#333;">'+step.why+'</div>';
        html += '</div>';
        html += '<div data-style="background:#e3f2fd;padding:12px;border-radius:8px;margin-bottom:10px;border:1px solid #bbdefb;">';
        html += '<div data-style="font-size:12px;color:#1565c0;margin-bottom:4px;">➡️ 下一步</div>';
        html += '<div data-style="font-size:13px;color:#333;">'+step.next+'</div>';
        html += '</div>';
        html += '<div data-style="background:#fce4ec;padding:12px;border-radius:8px;margin-bottom:10px;border:1px solid #f8bbd0;">';
        html += '<div data-style="font-size:12px;color:#c62828;margin-bottom:4px;">⚠️ 可能的弯路</div>';
        html += '<div data-style="font-size:13px;color:#333;">'+step.pitfall+'</div>';
        html += '</div>';
    }
    html += '</div>';

    html += '</div>';

    // 底部：控制栏
    if(tcState.currentQuestion){
        html += '<div data-style="display:flex;align-items:center;justify-content:center;gap:16px;padding:12px;background:#f5f5f5;border-top:1px solid #e0e0e0;">';
        html += '<button data-call=\"window.thinkingChain._prevStep\" data-style="padding:8px 18px;background:'+(tcState.currentStepIndex>0?'#1a73e8':'#ccc')+';color:#fff;border:none;border-radius:6px;cursor:'+(tcState.currentStepIndex>0?'pointer':'default')+';" '+(tcState.currentStepIndex>0?'':'disabled')+'>◀ 上一步</button>';
        html += '<span data-style="font-size:13px;color:#555;">步骤 '+(tcState.currentStepIndex+1)+' / '+tcState.currentQuestion.thinkingSteps.length+'</span>';
        html += '<button data-call=\"window.thinkingChain._nextStep\" data-style="padding:8px 18px;background:'+(tcState.currentStepIndex<tcState.currentQuestion.thinkingSteps.length-1?'#1a73e8':'#ccc')+';color:#fff;border:none;border-radius:6px;cursor:'+(tcState.currentStepIndex<tcState.currentQuestion.thinkingSteps.length-1?'pointer':'default')+';" '+(tcState.currentStepIndex<tcState.currentQuestion.thinkingSteps.length-1?'':'disabled')+'>下一步 ▶</button>';
        html += '<button data-call=\"window.thinkingChain._autoPlay\" data-style="padding:8px 18px;background:'+(tcState.autoPlaying?'#e53935':'#0d7a3e')+';color:#fff;border:none;border-radius:6px;cursor:pointer;">'+(tcState.autoPlaying?'⏸ 停止':'▶ 自动播放')+'</button>';
        html += '<button data-call=\"window.thinkingChain._showAnswer\" data-style="padding:8px 18px;background:#7b1fa2;color:#fff;border:none;border-radius:6px;cursor:pointer;">📝 完整答案</button>';
        html += '</div>';
    }

    container.innerHTML = html;
}

function renderSVGChain(q){
    var steps = q.thinkingSteps;
    var nodeW = 360;
    var nodeH = 70;
    var gapY = 16;
    var totalH = steps.length*(nodeH+gapY)+40;
    var svgW = 480;

    var svg = '<svg width="'+svgW+'" height="'+totalH+'" data-style="display:block;margin:0 auto;">';
    // 连线
    for(var i=0;i<steps.length-1;i++){
        var y1 = i*(nodeH+gapY)+nodeH+20;
        var y2 = (i+1)*(nodeH+gapY)+20;
        svg += '<line x1="240" y1="'+y1+'" x2="240" y2="'+y2+'" stroke="'+(i<tcState.currentStepIndex?'#1a73e8':'#ddd')+'" stroke-width="2" stroke-dasharray="'+(i<tcState.currentStepIndex?'none':'5,3')+'"/>';
        svg += '<polygon points="235,'+(y2-8)+' 245,'+(y2-8)+' 240,'+y2+'" fill="'+(i<tcState.currentStepIndex?'#1a73e8':'#ddd')+'"/>';
    }
    // 节点
    for(var j=0;j<steps.length;j++){
        var y = j*(nodeH+gapY)+20;
        var isCurrent = j===tcState.currentStepIndex;
        var isDone = j<tcState.currentStepIndex;
        var rectColor = isCurrent?'#1a73e8':(isDone?'#4caf50':'#e0e0e0');
        var textColor = isCurrent||isDone?'#fff':'#555';
        svg += '<rect x="60" y="'+y+'" width="'+nodeW+'" height="'+nodeH+'" rx="10" fill="'+rectColor+'"/>';
        svg += '<text x="240" y="'+(y+22)+'" text-anchor="middle" font-size="12" fill="'+textColor+'" font-weight="600">步骤'+(j+1)+': '+steps[j].condition.substring(0,30)+(steps[j].condition.length>30?'...':'')+'</text>';
        svg += '<text x="240" y="'+(y+42)+'" text-anchor="middle" font-size="11" fill="'+(isCurrent||isDone?'rgba(255,255,255,0.85)':'#999')+'">💡 '+steps[j].think.substring(0,28)+(steps[j].think.length>28?'...':'')+'</text>';
    }
    // 第一步的起点标记
    svg += '<circle cx="240" cy="'+20+'" r="6" fill="#1a73e8" stroke="#fff" stroke-width="2"/>';
    svg += '<text x="258" y="25" font-size="11" fill="#1a73e8" font-weight="600">起点</text>';
    svg += '</svg>';
    return svg;
}

var tcModule = {
    render: renderThinkingChain,
    _filterSubject: function(sub){
        tcState.selectedSubject = sub;
        tcState.currentQuestion = null;
        tcState.currentStepIndex = 0;
        tcState.autoPlaying = false;
        if(tcState.autoPlayInterval){ clearInterval(tcState.autoPlayInterval); tcState.autoPlayInterval = null; }
        renderThinkingChain();
    },
    _selectQuestion: function(qid){
        for(var i=0;i<THINKING_QUESTIONS.length;i++){
            if(THINKING_QUESTIONS[i].id===qid){ tcState.currentQuestion = THINKING_QUESTIONS[i]; break; }
        }
        tcState.currentStepIndex = 0;
        tcState.autoPlaying = false;
        if(tcState.autoPlayInterval){ clearInterval(tcState.autoPlayInterval); tcState.autoPlayInterval = null; }
        renderThinkingChain();
    },
    _prevStep: function(){
        if(tcState.currentStepIndex>0){ tcState.currentStepIndex--; renderThinkingChain(); }
    },
    _nextStep: function(){
        if(tcState.currentQuestion && tcState.currentStepIndex<tcState.currentQuestion.thinkingSteps.length-1){
            tcState.currentStepIndex++;
            renderThinkingChain();
        }
    },
    _autoPlay: function(){
        if(tcState.autoPlaying){
            tcState.autoPlaying = false;
            if(tcState.autoPlayInterval){ clearInterval(tcState.autoPlayInterval); tcState.autoPlayInterval = null; }
            renderThinkingChain();
        } else {
            tcState.autoPlaying = true;
            tcState.currentStepIndex = 0;
            renderThinkingChain();
            tcState.autoPlayInterval = setInterval(function(){
                if(tcState.currentQuestion && tcState.currentStepIndex<tcState.currentQuestion.thinkingSteps.length-1){
                    tcState.currentStepIndex++;
                    renderThinkingChain();
                } else {
                    tcState.autoPlaying = false;
                    clearInterval(tcState.autoPlayInterval);
                    tcState.autoPlayInterval = null;
                    renderThinkingChain();
                }
            }, 2000);
        }
    },
    _showAnswer: function(){
        if(!tcState.currentQuestion) return;
        alert('【完整答案】\n\n'+tcState.currentQuestion.finalAnswer);
    }
};

window.thinkingChain = tcModule;

})();

// 模块4: variationRecommender（变式题推荐系统）
(function(){
'use strict';

var LS_KEY_VR = 'hspcb_variation_history';

// 变式题库数据加载器（动态加载 data/variation-bank.json）
var VariationDataLoader = {
    _cache: null,
    _loadingPromise: null,
    _dataUrl: 'data/variation-bank.json',

    load: function(){
        if(this._cache) return Promise.resolve(this._cache);
        if(this._loadingPromise) return this._loadingPromise;
        var self = this;
        this._loadingPromise = fetch(this._dataUrl)
            .then(function(res){
                if(!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function(data){
                self._cache = (data && data.questions) ? data.questions : [];
                self._loadingPromise = null;
                return self._cache;
            })
            .catch(function(err){
                self._loadingPromise = null;
                console.error('[variationRecommender] 题库加载失败:', err);
                throw err;
            });
        return this._loadingPromise;
    },

    getCached: function(){
        return this._cache || [];
    }
};

// 推荐引擎
function getRecommendations(knowledgeGroup, excludeId){
    var bank = VariationDataLoader.getCached();
    var candidates = [];
    for(var i=0;i<bank.length;i++){
        var q = bank[i];
        if(q.knowledge===knowledgeGroup && q.id!==excludeId){
            candidates.push(q);
        }
    }
    // 按难度排序：容易→中等→较难
    var diffOrder = { '容易':1, '中等':2, '较难':3 };
    candidates.sort(function(a,b){ return (diffOrder[a.difficulty]||0) - (diffOrder[b.difficulty]||0); });
    return candidates;
}

function getTagRelatedQuestions(currentQuestion){
    // 基于同知识点标签，找交集数>=1的其他题
    var bank = VariationDataLoader.getCached();
    var related = [];
    for(var i=0;i<bank.length;i++){
        var q = bank[i];
        if(q.id===currentQuestion.id) continue;
        if(q.knowledge===currentQuestion.knowledge){
            var diffOrder = { '容易':1, '中等':2, '较难':3 };
            var diffScore = diffOrder[q.difficulty]||0;
            related.push({ question: q, relevance: 5, diffScore: diffScore });
        }
    }
    // 按关联度降序，关联度相同按难度升序
    related.sort(function(a,b){
        if(b.relevance!==a.relevance) return b.relevance - a.relevance;
        return a.diffScore - b.diffScore;
    });
    return related;
}

// 状态管理
var vrState = {
    selectedGroup: null,
    selectedQuestion: null,
    showAnswer: {},
    userAnswers: {}
};

function loadVRHistory(){
    try { var raw = HSPCBStore.get(LS_KEY_VR); return raw ? JSON.parse(raw) : {}; }
    catch(e){ return {}; }
}

function saveVRHistory(qid){
    var h = loadVRHistory();
    h[qid] = true;
    try { HSPCBStore.set(LS_KEY_VR, JSON.stringify(h)); } catch(e){}
}

function getKnowledgeGroups(){
    var bank = VariationDataLoader.getCached();
    var groups = [];
    for(var i=0;i<bank.length;i++){
        var kg = bank[i].knowledge;
        if(groups.indexOf(kg)===-1) groups.push(kg);
    }
    return groups;
}

function getSubjectForGroup(group){
    var bank = VariationDataLoader.getCached();
    for(var i=0;i<bank.length;i++){
        if(bank[i].knowledge===group) return bank[i].subject;
    }
    return '';
}

function getSubjectColor2(subject){
    if(subject==='物理') return '#1a73e8';
    if(subject==='化学') return '#7b1fa2';
    if(subject==='生物') return '#0d7a3e';
    return '#444';
}

function variationLoadingHtml(){
    return '<div data-style="padding:40px;text-align:center;color:#666;">' +
        '<div data-style="font-size:24px;margin-bottom:12px;">⏳</div>' +
        '<div>变式题库加载中...</div></div>';
}

function variationErrorHtml(){
    return '<div data-style="padding:40px;text-align:center;color:#d32f2f;">' +
        '<div data-style="font-size:24px;margin-bottom:12px;">⚠️</div>' +
        '<div>变式题库加载失败，请检查网络后重试</div>' +
        '<button data-call="window.variationRecommender._retry" data-style="margin-top:16px;padding:8px 16px;background:#1a73e8;color:#fff;border:none;border-radius:6px;cursor:pointer;">重试</button>' +
        '</div>';
}

function renderVariationRecommender(){
    var container = document.getElementById('variation-rec-app');
    if(!container) return;

    // 首次打开工具时才拉取题库。首屏不再自动 init，也不请求 variation-bank.json。
    if(!VariationDataLoader.getCached().length){
        if(VariationDataLoader._loadingPromise){ container.innerHTML = variationLoadingHtml(); return; }
        container.innerHTML = variationLoadingHtml();
        VariationDataLoader.load()
            .then(function(){ renderVariationRecommender(); })
            .catch(function(){ container.innerHTML = variationErrorHtml(); });
        return;
    }

    var html = '<div data-style="display:flex;font-family:sans-serif;min-height:500px;">';

    // 左侧：知识点分组列表
    html += '<div data-style="width:220px;min-width:220px;border-right:1px solid #e0e0e0;overflow-y:auto;background:#fafafa;">';
    html += '<div data-style="padding:12px;background:#333;color:#fff;font-weight:600;font-size:14px;">📚 知识点分类</div>';
    var groups = getKnowledgeGroups();
    var bank = VariationDataLoader.getCached();
    for(var i=0;i<groups.length;i++){
        var g = groups[i];
        var subj = getSubjectForGroup(g);
        var active = vrState.selectedGroup===g;
        var count = 0;
        for(var k=0;k<bank.length;k++){ if(bank[k].knowledge===g) count++; }
        html += '<div data-call="window.variationRecommender._selectGroup" data-arg1="@s:' + g + '" data-style="'+
            'padding:10px 12px;border-bottom:1px solid #eee;cursor:pointer;'+
            'background:'+(active?'#e8f0fe':'#fff')+';border-left:'+(active?'4px solid '+getSubjectColor2(subj):'4px solid transparent')+';">';
        html += '<div data-style="font-size:12px;color:'+getSubjectColor2(subj)+';font-weight:600;">'+subj+'</div>';
        html += '<div data-style="font-size:13px;color:#333;">'+g+' ('+count+'题)</div>';
        html += '</div>';
    }
    html += '</div>';

    // 中间：题目展示区
    html += '<div data-style="flex:1;overflow-y:auto;padding:16px;background:#fff;">';
    if(vrState.selectedGroup){
        var groupQuestions = [];
        for(var q=0;q<bank.length;q++){
            if(bank[q].knowledge===vrState.selectedGroup) groupQuestions.push(bank[q]);
        }
        var subjCol = getSubjectColor2(getSubjectForGroup(vrState.selectedGroup));
        html += '<h3 data-style="color:'+subjCol+';font-size:16px;margin:0 0 4px 0;">'+vrState.selectedGroup+'</h3>';
        html += '<p data-style="color:#999;font-size:12px;margin:0 0 16px 0;">共 '+groupQuestions.length+' 道变式题</p>';

        for(var qi=0;qi<groupQuestions.length;qi++){
            var gq = groupQuestions[qi];
            var history = loadVRHistory();
            var isDone = history[gq.id];
            var isSelected = vrState.selectedQuestion && vrState.selectedQuestion.id===gq.id;

            html += '<div data-style="margin-bottom:12px;border:2px solid '+(isSelected?subjCol:'#e0e0e0')+';border-radius:10px;overflow:hidden;">';
            // 题目标题
            html += '<div data-call="window.variationRecommender._selectVarQuestion" data-arg1="@s:' + gq.id + '" data-style="'+
                'padding:10px 14px;background:'+(isSelected?subjCol:'#f5f5f5')+';color:'+(isSelected?'#fff':'#333')+';cursor:pointer;font-size:13px;font-weight:600;">';
            html += (qi+1)+'. '+gq.title;
            html += '<span data-style="float:right;font-size:11px;opacity:0.8;margin-left:8px;">难度：'+gq.difficulty+'</span>';
            if(isDone){ html += '<span data-style="float:right;font-size:11px;color:#4caf50;">✓ 已做</span>'; }
            html += '</div>';

            // 题目详情
            if(isSelected){
                html += '<div data-style="padding:14px;">';
                html += '<div data-style="font-size:14px;color:#333;line-height:1.7;margin-bottom:12px;">'+gq.question+'</div>';
                // 选项
                if(gq.options){
                    var opts = gq.options;
                    html += '<div data-style="margin-bottom:12px;">';
                    var optKeys = Object.keys(opts);
                    for(var oi=0;oi<optKeys.length;oi++){
                        var ok = optKeys[oi];
                        var userChoice = vrState.userAnswers[gq.id];
                        var isCorrect = vrState.showAnswer[gq.id] && ok===gq.answer;
                        var isWrong = vrState.showAnswer[gq.id] && userChoice===ok && ok!==gq.answer;
                        var bgColor = isCorrect?'#e8f5e9':(isWrong?'#ffebee':'#fafafa');
                        var borderColor = isCorrect?'#4caf50':(isWrong?'#e53935':'#e0e0e0');
                        html += '<div data-call="window.variationRecommender._chooseOption" data-arg1="@s:' + gq.id + '" data-arg2="@s:' + ok + '" data-style="'+
                            'padding:8px 12px;margin-bottom:4px;border:1px solid '+borderColor+';border-radius:6px;'+
                            'background:'+bgColor+';cursor:pointer;font-size:13px;">';
                        html += ok+'. '+opts[ok];
                        if(isCorrect) html += ' ✅';
                        if(isWrong) html += ' ❌';
                        html += '</div>';
                    }
                    html += '</div>';
                }
                // 按钮
                if(!vrState.showAnswer[gq.id]){
                    html += '<button data-call="window.variationRecommender._checkAnswer" data-arg1="@s:' + gq.id + '" data-style="'+
                        'padding:8px 20px;background:'+subjCol+';color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">提交答案</button>';
                } else {
                    html += '<div data-style="background:#f0f4ff;padding:10px 14px;border-radius:8px;margin-top:8px;">';
                    html += '<div data-style="font-size:12px;color:'+subjCol+';font-weight:600;">📝 解析</div>';
                    html += '<div data-style="font-size:13px;color:#555;line-height:1.6;">'+gq.explanation+'</div>';
                    html += '</div>';
                    html += '<button data-call="window.variationRecommender._resetQuestion" data-arg1="@s:' + gq.id + '" data-style="'+
                        'margin-top:8px;padding:6px 16px;background:#fff;color:#555;border:1px solid #ddd;border-radius:6px;cursor:pointer;font-size:12px;">重新作答</button>';
                }
                html += '</div>';
            }
            html += '</div>';
        }
    } else {
        html += '<div data-style="text-align:center;color:#999;padding-top:200px;">👈 请从左侧选择一个知识点分组</div>';
    }
    html += '</div>';

    // 右侧：推荐变式题列表
    html += '<div data-style="width:240px;min-width:240px;border-left:1px solid #e0e0e0;overflow-y:auto;background:#fafafa;padding:12px;">';
    html += '<div data-style="font-weight:600;color:#333;font-size:14px;margin-bottom:12px;">🔗 变式推荐</div>';
    if(vrState.selectedQuestion){
        var related = getTagRelatedQuestions(vrState.selectedQuestion);
        if(related.length>0){
            for(var ri=0;ri<related.length;ri++){
                var rq = related[ri].question;
                html += '<div data-call="window.variationRecommender._selectVarQuestion" data-arg1="@s:' + rq.id + '" data-style="'+
                    'padding:8px 10px;margin-bottom:6px;border:1px solid #e0e0e0;border-radius:8px;cursor:pointer;'+
                    'background:#fff;transition:all 0.15s;">';
                html += '<div data-style="font-size:12px;font-weight:600;color:#333;">'+rq.title+'</div>';
                html += '<div data-style="font-size:11px;color:#888;margin-top:2px;">难度：'+rq.difficulty+' | 关联度：★★★★★</div>';
                html += '</div>';
            }
        } else {
            html += '<div data-style="color:#999;font-size:12px;">暂无同组变式题</div>';
        }
    } else {
        html += '<div data-style="color:#999;font-size:12px;">选择一道题目后<br>自动推荐变式题</div>';
    }
    html += '</div>';

    html += '</div>';

    container.innerHTML = html;
}

var vrModule = {
    render: renderVariationRecommender,
    _selectGroup: function(group){
        vrState.selectedGroup = group;
        vrState.selectedQuestion = null;
        renderVariationRecommender();
    },
    _selectVarQuestion: function(qid){
        var bank = VariationDataLoader.getCached();
        for(var i=0;i<bank.length;i++){
            if(bank[i].id===qid){ vrState.selectedQuestion = bank[i]; break; }
        }
        if(!vrState.selectedGroup) vrState.selectedGroup = vrState.selectedQuestion.knowledge;
        renderVariationRecommender();
    },
    _chooseOption: function(qid, opt){
        if(vrState.showAnswer[qid]) return;
        vrState.userAnswers[qid] = opt;
        renderVariationRecommender();
    },
    _checkAnswer: function(qid){
        if(!vrState.userAnswers[qid]) return;
        vrState.showAnswer[qid] = true;
        saveVRHistory(qid);
        renderVariationRecommender();
    },
    _resetQuestion: function(qid){
        vrState.showAnswer[qid] = false;
        vrState.userAnswers[qid] = null;
        renderVariationRecommender();
    },
    _retry: function(){
        VariationDataLoader._cache = null;
        VariationDataLoader._loadingPromise = null;
        var container = document.getElementById('variation-rec-app');
        if(container){
            container.innerHTML = '<div data-style="padding:40px;text-align:center;color:#666;">' +
                '<div data-style="font-size:24px;margin-bottom:12px;">⏳</div>' +
                '<div>题库重新加载中...</div></div>';
        }
        VariationDataLoader.load()
            .then(function(){ if(container){ container.innerHTML=''; renderVariationRecommender(); } })
            .catch(function(){ if(container){ container.innerHTML = variationErrorHtml(); } });
    }
};

window.variationRecommender = vrModule;

// 不再在首屏自动 init。数据由 render 在首次打开工具时按需加载。
})();
/* ==================== 第三代 · content-deep-v3.js ==================== */
// 内容补深V3 - 实验题专项+选择题技巧+长难句分析

// 模块1: experimentExamSpecial（物化生历年实验题专项）
// 容器ID: experiment-exam-special-app
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

// 统一转义：全仓唯一权威实现为 CommonUtils.escapeHtml。
// 本文件原有 3 份顶层 escapeHtml 声明（548/968/1474），其中两份漏转义单引号，
// 且函数声明互相覆盖、行为取决于定义顺序，难以推理。现统一委托给唯一实现，
// 并在 CommonUtils 缺席时提供等价兜底（含 null/undefined → ''）。
function escapeHtml(str) {
    var fn = (typeof CommonUtils !== 'undefined' && CommonUtils) ? CommonUtils.escapeHtml : null;
    if (typeof fn === 'function') return fn(str);
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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
    html += '<div data-style="padding:10px;border-bottom:1px solid #eee;">';
    html += '<div data-style="font-weight:bold;margin-bottom:8px;">学科筛选</div>';
    html += '<select id="ees-subjectFilter" data-style="width:100%;padding:6px;margin-bottom:8px;">';
    html += '<option value="all"' + (state.subjectFilter==='all'?' selected':'') + '>全部</option>';
    var subs = ['物理','化学','生物'];
    for(var s=0;s<subs.length;s++){
        html += '<option value="'+subs[s]+'"' + (state.subjectFilter===subs[s]?' selected':'') + '>'+subs[s]+'</option>';
    }
    html += '</select>';
    html += '<div data-style="font-weight:bold;margin-bottom:8px;">年份筛选</div>';
    html += '<select id="ees-yearFilter" data-style="width:100%;padding:6px;">';
    html += '<option value="all"' + (state.yearFilter==='all'?' selected':'') + '>全部</option>';
    for(var yi=0;yi<years.length;yi++){
        html += '<option value="'+years[yi]+'"' + (state.yearFilter===years[yi]?' selected':'') + '>'+years[yi]+'年</option>';
    }
    html += '</select>';
    html += '</div>';
    var list = getFilteredQuestions();
    html += '<div data-style="overflow-y:auto;max-height:560px;">';
    if(list.length===0){
        html += '<div data-style="padding:20px;color:#999;text-align:center;">暂无符合条件题目</div>';
    } else {
        for(var i=0;i<list.length;i++){
            var q = list[i];
            var subjectColor = q.subject==='物理' ? '#3b82f6' : (q.subject==='化学' ? '#10b981' : '#f59e0b');
            var isActive = state.selectedId===q.id;
            html += '<div class="ees-qitem" data-id="'+q.id+'" data-style="padding:10px;border-bottom:1px solid #f0f0f0;cursor:pointer;'+(isActive?'background:#e0f2fe;':'')+'">';
            html += '<div data-style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">';
            html += '<span data-style="background:'+subjectColor+';color:#fff;padding:2px 6px;border-radius:3px;font-size:11px;">'+q.subject+'</span>';
            html += '<span data-style="color:#888;font-size:11px;">'+q.year+'年</span>';
            html += '<span data-style="color:#888;font-size:11px;">|'+escapeHtml(q.chapter)+'</span>';
            html += '</div>';
            html += '<div data-style="font-size:13px;line-height:1.4;">'+escapeHtml(q.title)+'</div>';
            html += '<div data-style="margin-top:4px;font-size:11px;color:#aaa;">满分'+q.fullScore+'分</div>';
            html += '</div>';
        }
    }
    html += '</div>';
    return html;
}

function renderQuestion(){
    if(!state.selectedId){
        return '<div data-style="padding:40px;text-align:center;color:#999;">请从左侧选择一道实验题开始练习</div>';
    }
    var q = getQuestion(state.selectedId);
    if(!q) return '';
    var html = '';
    html += '<div data-style="padding:12px;border-bottom:2px solid #3b82f6;">';
    html += '<div data-style="font-size:16px;font-weight:bold;color:#1e3a8a;">'+nl2br(q.title)+'</div>';
    html += '<div data-style="margin-top:6px;font-size:12px;color:#666;">'+q.subject+' · '+q.year+'年 · 章节：'+escapeHtml(q.chapter)+'</div>';
    html += '</div>';
    html += '<div data-style="padding:12px;border-bottom:1px solid #eee;">';
    html += '<div data-style="font-weight:bold;color:#374151;margin-bottom:8px;">【题目】</div>';
    html += '<div data-style="white-space:pre-wrap;line-height:1.7;color:#374151;font-size:13px;">'+nl2br(q.question)+'</div>';
    html += '</div>';
    html += '<div data-style="padding:12px;border-bottom:1px solid #eee;background:#f9fafb;">';
    html += '<div data-style="font-weight:bold;color:#374151;margin-bottom:8px;">【实验器材】</div>';
    html += '<div data-style="display:flex;flex-wrap:wrap;gap:6px;">';
    for(var ai=0;ai<q.apparatus.length;ai++){
        html += '<span data-style="background:#fff;border:1px solid #d1d5db;padding:3px 8px;border-radius:12px;font-size:12px;color:#4b5563;">'+escapeHtml(q.apparatus[ai])+'</span>';
    }
    html += '</div>';
    html += '</div>';
    html += '<div data-style="padding:12px;border-bottom:1px solid #eee;">';
    html += '<div data-style="font-weight:bold;color:#374151;margin-bottom:8px;">【实验步骤】</div>';
    html += '<ol data-style="padding-left:20px;margin:0;line-height:1.8;color:#374151;font-size:13px;">';
    for(var si=0;si<q.steps.length;si++){
        html += '<li>'+nl2br(q.steps[si])+'</li>';
    }
    html += '</ol>';
    html += '</div>';
    html += '<div data-style="padding:12px;border-bottom:1px solid #eee;background:#fef3c7;">';
    html += '<div data-style="font-weight:bold;color:#92400e;margin-bottom:8px;">【我的作答】</div>';
    var taAttr = state.submitted ? ' disabled ' : '';
    html += '<textarea id="ees-answer" data-style="width:100%;min-height:120px;padding:8px;border:1px solid #d1d5db;border-radius:4px;font-family:inherit;font-size:13px;line-height:1.6;box-sizing:border-box;" placeholder="请在此作答，可参考实验步骤和评分标准..."'+taAttr+'>'+escapeHtml(state.userAnswer)+'</textarea>';
    if(!state.submitted){
        html += '<button id="ees-submitBtn" data-style="margin-top:8px;background:#dc2626;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:13px;">提交答案并模拟阅卷</button>';
    } else {
        html += '<button id="ees-resetBtn" data-style="margin-top:8px;background:#6b7280;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:13px;">重新作答</button>';
    }
    html += '</div>';
    if(state.submitted){
        html += '<div data-style="padding:12px;background:#dbeafe;border-bottom:1px solid #eee;">';
        html += '<div data-style="font-weight:bold;color:#1e40af;margin-bottom:8px;">【模拟阅卷结果】</div>';
        html += '<div data-style="font-size:14px;color:#1e3a8a;margin-bottom:8px;">总分：<b data-style="font-size:18px;color:#dc2626;">'+state.totalScore+'</b> / '+q.fullScore+' 分</div>';
        html += '<table data-style="width:100%;border-collapse:collapse;font-size:12px;">';
        html += '<tr data-style="background:#bfdbfe;"><th data-style="border:1px solid #93c5fd;padding:5px;text-align:left;">评分项</th><th data-style="border:1px solid #93c5fd;padding:5px;width:50px;">满分</th><th data-style="border:1px solid #93c5fd;padding:5px;width:60px;">自评</th></tr>';
        for(var ci=0;ci<q.scoringCriteria.length;ci++){
            var c = q.scoringCriteria[ci];
            var got = state.scores[c.item] || 0;
            html += '<tr>';
            html += '<td data-style="border:1px solid #bfdbfe;padding:5px;"><b>'+escapeHtml(c.item)+'</b><br><span data-style="color:#6b7280;font-size:11px;">'+nl2br(c.standard)+'</span></td>';
            html += '<td data-style="border:1px solid #bfdbfe;padding:5px;text-align:center;">'+c.score+'</td>';
            html += '<td data-style="border:1px solid #bfdbfe;padding:5px;text-align:center;"><input type="number" class="ees-score" data-item="'+escapeHtml(c.item)+'" min="0" max="'+c.score+'" value="'+got+'" data-style="width:50px;padding:2px;"></td>';
            html += '</tr>';
        }
        html += '</table>';
        html += '<div data-style="margin-top:8px;color:#6b7280;font-size:12px;">提示：请根据自己作答情况对照评分标准逐项自评分数，自评后总分自动更新。</div>';
        html += '</div>';
        html += '<div data-style="padding:12px;background:#f0fdf4;border-bottom:1px solid #eee;">';
        html += '<div data-style="font-weight:bold;color:#166534;margin-bottom:8px;">【参考答案】</div>';
        html += '<div data-style="white-space:pre-wrap;line-height:1.7;color:#166534;font-size:13px;background:#fff;padding:10px;border-radius:4px;border:1px solid #bbf7d0;">'+nl2br(q.answer)+'</div>';
        html += '</div>';
    }
    return html;
}

function renderScoringPanel(){
    if(!state.selectedId){
        return '<div data-style="padding:20px;color:#999;text-align:center;">选择题目后显示评分标准</div>';
    }
    var q = getQuestion(state.selectedId);
    if(!q) return '';
    var html = '';
    html += '<div data-style="padding:12px;border-bottom:1px solid #eee;">';
    html += '<div data-style="font-weight:bold;color:#374151;margin-bottom:10px;">评分标准（满分'+q.fullScore+'分）</div>';
    for(var i=0;i<q.scoringCriteria.length;i++){
        var c = q.scoringCriteria[i];
        html += '<div data-style="padding:8px;background:'+(i%2?'#f9fafb':'#fff')+';border-radius:4px;margin-bottom:6px;">';
        html += '<div data-style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
        html += '<span data-style="font-weight:bold;color:#1e3a8a;font-size:13px;">'+(i+1)+'. '+escapeHtml(c.item)+'</span>';
        html += '<span data-style="background:#fee2e2;color:#b91c1c;padding:2px 6px;border-radius:3px;font-size:11px;font-weight:bold;">'+c.score+'分</span>';
        html += '</div>';
        html += '<div data-style="color:#4b5563;font-size:12px;line-height:1.5;">'+nl2br(c.standard)+'</div>';
        html += '</div>';
    }
    html += '</div>';
    html += '<div data-style="padding:12px;background:#fff7ed;">';
    html += '<div data-style="font-weight:bold;color:#9a3412;margin-bottom:10px;">常见扣分点</div>';
    for(var di=0;di<q.commonDeductions.length;di++){
        html += '<div data-style="color:#9a3412;font-size:12px;line-height:1.7;padding:3px 0;padding-left:16px;position:relative;">';
        html += '<span data-style="position:absolute;left:0;">•</span>'+nl2br(q.commonDeductions[di])+'</div>';
    }
    html += '</div>';
    return html;
}

function render(){
    var root = document.getElementById('experiment-exam-special-app');
    if(!root) return;
    try {
    var html = '';
    html += '<div data-style="font-family:Microsoft YaHei,sans-serif;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">';
    html += '<div data-style="background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;padding:14px 20px;">';
    html += '<div data-style="font-size:18px;font-weight:bold;">物化生历年实验题专项</div>';
    html += '<div data-style="font-size:12px;opacity:0.9;margin-top:4px;">从真题库提取实验题 → 按考点分类 → 配评分标准 → 模拟阅卷</div>';
    html += '</div>';
    html += '<div data-style="display:flex;min-height:600px;">';
    html += '<div id="ees-sidebar" data-style="width:240px;border-right:1px solid #e5e7eb;background:#fff;flex-shrink:0;">'+renderSidebar()+'</div>';
    html += '<div id="ees-main" data-style="flex:1;overflow-y:auto;max-height:600px;">'+renderQuestion()+'</div>';
    html += '<div id="ees-panel" data-style="width:280px;border-left:1px solid #e5e7eb;background:#fff;flex-shrink:0;overflow-y:auto;max-height:600px;">'+renderScoringPanel()+'</div>';
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


// 模块2: choiceQuestionTricks（选择题秒杀技巧库）
// 容器ID: choice-tricks-app
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

function nl2br(str){ return escapeHtml(str).replace(/\n/g,'<br>'); }

function getTrick(id){
    for(var i=0;i<TRICKS.length;i++){
        if(TRICKS[i].id===id) return TRICKS[i];
    }
    return null;
}

function renderTrickList(){
    var html = '';
    html += '<div data-style="padding:10px;border-bottom:1px solid #eee;background:#f9fafb;">';
    html += '<div data-style="font-weight:bold;color:#1e3a8a;">选择秒杀技巧</div>';
    html += '</div>';
    for(var i=0;i<TRICKS.length;i++){
        var t = TRICKS[i];
        var isActive = state.selectedTrickId===t.id;
        var stat = state.trickStats[t.id] || {practiced:0, correct:0};
        var rate = stat.practiced>0 ? Math.round(stat.correct/stat.practiced*100) : 0;
        html += '<div class="ct-trick" data-id="'+t.id+'" data-style="padding:12px;border-bottom:1px solid #f0f0f0;cursor:pointer;'+(isActive?'background:#dbeafe;border-left:3px solid #3b82f6;':'')+'">';
        html += '<div data-style="display:flex;align-items:center;gap:8px;">';
        html += '<span data-style="background:'+(isActive?'#3b82f6':'#9ca3af')+';color:#fff;width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;">'+t.id+'</span>';
        html += '<span data-style="font-size:14px;font-weight:bold;color:'+(isActive?'#1e3a8a':'#374151')+';">'+escapeHtml(t.name)+'</span>';
        html += '</div>';
        html += '<div data-style="margin-top:6px;font-size:11px;color:#6b7280;">练习'+stat.practiced+'题 · 正确率'+rate+'%</div>';
        html += '</div>';
    }
    return html;
}

function renderTrickDetail(){
    var t = getTrick(state.selectedTrickId);
    if(!t) return '';
    var html = '';
    html += '<div data-style="padding:14px;border-bottom:2px solid #8b5cf6;">';
    html += '<div data-style="font-size:16px;font-weight:bold;color:#5b21b6;">'+escapeHtml(t.name)+'</div>';
    html += '</div>';
    html += '<div data-style="padding:12px;border-bottom:1px solid #eee;">';
    html += '<div data-style="font-weight:bold;color:#374151;margin-bottom:6px;">原理说明</div>';
    html += '<div data-style="color:#4b5563;font-size:13px;line-height:1.7;">'+nl2br(t.principle)+'</div>';
    html += '</div>';
    html += '<div data-style="padding:12px;border-bottom:1px solid #eee;background:#faf5ff;">';
    html += '<div data-style="font-weight:bold;color:#374151;margin-bottom:6px;">使用步骤</div>';
    html += '<ol data-style="padding-left:20px;margin:0;line-height:1.8;color:#4b5563;font-size:13px;">';
    for(var si=0;si<t.steps.length;si++){
        html += '<li>'+nl2br(t.steps[si])+'</li>';
    }
    html += '</ol>';
    html += '</div>';
    html += '<div data-style="padding:12px;border-bottom:1px solid #eee;">';
    html += '<div data-style="font-weight:bold;color:#374151;margin-bottom:6px;">适用场景</div>';
    html += '<div data-style="color:#4b5563;font-size:13px;line-height:1.7;">'+nl2br(t.scenarios)+'</div>';
    html += '</div>';
    html += '<div data-style="padding:12px;background:#fff7ed;">';
    html += '<div data-style="font-weight:bold;color:#9a3412;margin-bottom:6px;">注意事项</div>';
    html += '<div data-style="color:#9a3412;font-size:13px;line-height:1.7;">'+nl2br(t.cautions)+'</div>';
    html += '</div>';
    return html;
}

function renderExampleArea(){
    var t = getTrick(state.selectedTrickId);
    if(!t) return '';
    var html = '';
    html += '<div data-style="padding:14px;border-bottom:2px solid #10b981;background:#f0fdf4;">';
    html += '<div data-style="font-size:14px;font-weight:bold;color:#166534;">例题练习</div>';
    html += '<div data-style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap;">';
    for(var i=0;i<t.examples.length;i++){
        var bg = state.currentExampleIdx===i ? '#10b981' : '#d1fae5';
        var color = state.currentExampleIdx===i ? '#fff' : '#166534';
        html += '<span class="ct-exIdx" data-idx="'+i+'" data-style="background:'+bg+';color:'+color+';padding:4px 10px;border-radius:12px;cursor:pointer;font-size:12px;">第'+(i+1)+'题</span>';
    }
    html += '</div>';
    html += '</div>';
    var ex = t.examples[state.currentExampleIdx];
    if(!ex) return html;
    html += '<div data-style="padding:12px;">';
    html += '<div data-style="background:#f9fafb;padding:10px;border-radius:4px;margin-bottom:10px;">';
    html += '<div data-style="font-weight:bold;color:#374151;margin-bottom:6px;">题目：</div>';
    html += '<div data-style="color:#1f2937;font-size:13px;line-height:1.7;margin-bottom:8px;">'+nl2br(ex.question)+'</div>';
    for(var oi=0;oi<ex.options.length;oi++){
        html += '<div data-style="padding:4px 0;color:#374151;font-size:13px;">'+escapeHtml(ex.options[oi])+'</div>';
    }
    html += '</div>';
    if(!state.revealed){
        html += '<div data-style="background:#fef3c7;padding:10px;border-radius:4px;margin-bottom:10px;">';
        html += '<div data-style="font-weight:bold;color:#92400e;margin-bottom:6px;">请选择答案：</div>';
        html += '<div data-style="display:flex;gap:6px;flex-wrap:wrap;">';
        var opts = ['A','B','C','D'];
        for(var ci=0;ci<opts.length;ci++){
            var bg = state.userChoice===opts[ci] ? '#fbbf24' : '#fff';
            html += '<button class="ct-choice" data-opt="'+opts[ci]+'" data-style="background:'+bg+';border:1px solid #d97706;color:#92400e;padding:6px 14px;border-radius:4px;cursor:pointer;font-weight:bold;">'+opts[ci]+'</button>';
        }
        html += '</div>';
        var dis = state.userChoice ? '' : ' disabled';
        html += '<button id="ct-submit" data-style="margin-top:10px;background:#dc2626;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;"'+dis+'>提交答案</button>';
        html += '<div id="ct-timer" data-style="margin-top:6px;color:#6b7280;font-size:12px;">已用时: '+state.elapsed+'秒</div>';
        html += '</div>';
    } else {
        var isCorrect = state.userChoice===ex.answer;
        var bgColor = isCorrect ? '#d1fae5' : '#fee2e2';
        var bdColor = isCorrect ? '#10b981' : '#ef4444';
        var txColor = isCorrect ? '#166534' : '#991b1b';
        html += '<div data-style="background:'+bgColor+';border:1px solid '+bdColor+';padding:10px;border-radius:4px;margin-bottom:10px;">';
        html += '<div data-style="font-weight:bold;color:'+txColor+';margin-bottom:6px;">';
        html += isCorrect ? '回答正确！' : '回答错误';
        html += ' (用时'+state.elapsed+'秒)</div>';
        html += '<div data-style="color:#374151;font-size:13px;">你的答案：<b>'+escapeHtml(state.userChoice||'(未选)')+'</b> | 正确答案：<b>'+escapeHtml(ex.answer)+'</b></div>';
        html += '</div>';
        html += '<div data-style="background:#dbeafe;padding:10px;border-radius:4px;margin-bottom:8px;border-left:3px solid #3b82f6;">';
        html += '<div data-style="font-weight:bold;color:#1e40af;margin-bottom:6px;">秒杀思路</div>';
        html += '<div data-style="color:#1e3a8a;font-size:13px;line-height:1.7;">'+nl2br(ex.analysis)+'</div>';
        html += '</div>';
        html += '<div data-style="background:#f3f4f6;padding:10px;border-radius:4px;margin-bottom:8px;border-left:3px solid #9ca3af;">';
        html += '<div data-style="font-weight:bold;color:#4b5563;margin-bottom:6px;">常规解法对比</div>';
        html += '<div data-style="color:#374151;font-size:13px;line-height:1.7;">'+nl2br(ex.normalSolution)+'</div>';
        html += '</div>';
        var nextDis = state.currentExampleIdx >= t.examples.length-1 ? ' disabled' : '';
        html += '<button id="ct-next" data-style="background:#10b981;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;"'+nextDis+'>下一题</button>';
    }
    html += '</div>';
    return html;
}

function renderStats(){
    var html = '';
    html += '<div data-style="padding:12px;background:#1f2937;color:#fff;">';
    html += '<div data-style="font-weight:bold;margin-bottom:8px;">技巧使用统计</div>';
    var totalPracticed = 0, totalCorrect = 0;
    for(var i=0;i<TRICKS.length;i++){
        var s = state.trickStats[TRICKS[i].id] || {practiced:0, correct:0};
        totalPracticed += s.practiced;
        totalCorrect += s.correct;
    }
    var totalRate = totalPracticed>0 ? Math.round(totalCorrect/totalPracticed*100) : 0;
    html += '<div data-style="font-size:13px;line-height:1.8;">';
    html += '<div>总练习题数：<b data-style="color:#fbbf24;">'+totalPracticed+'</b> 题</div>';
    html += '<div>总正确率：<b data-style="color:#10b981;">'+totalRate+'%</b></div>';
    var mastered = 0;
    for(var j=0;j<TRICKS.length;j++){
        var st = state.trickStats[TRICKS[j].id];
        if(st && st.practiced>=3) mastered++;
    }
    html += '<div data-style="margin-top:6px;font-size:11px;color:#9ca3af;">已练习技巧：'+mastered+' / '+TRICKS.length+'</div>';
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
        if (el) {
            el.textContent = '已用时: '+state.elapsed+'秒';
            return;
        }
        // 兜底：只在叶子节点上改 textContent。
        // 原实现用 innerHTML 覆写匹配到的 div，若因故匹配到祖先容器会把整个
        // 「秒杀技巧库」UI（含题目与选项）替换成一行计时文字 → 选完选项 UI 消失。
        var spans = document.querySelectorAll('#choice-tricks-app span');
        for (var i = 0; i < spans.length; i++) {
            if (spans[i].textContent && spans[i].textContent.indexOf('已用时') === 0) {
                spans[i].textContent = '已用时: '+state.elapsed+'秒';
                return;
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
    html += '<div data-style="font-family:Microsoft YaHei,sans-serif;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">';
    html += '<div data-style="background:linear-gradient(135deg,#5b21b6,#8b5cf6);color:#fff;padding:14px 20px;">';
    html += '<div data-style="font-size:18px;font-weight:bold;">选择题秒杀技巧库</div>';
    html += '<div data-style="font-size:12px;opacity:0.9;margin-top:4px;">8种解题技巧 · 每种5道例题 · 秒杀思路vs常规解法对比</div>';
    html += '</div>';
    html += '<div data-style="display:flex;min-height:600px;">';
    html += '<div data-style="width:220px;border-right:1px solid #e5e7eb;background:#fff;flex-shrink:0;overflow-y:auto;max-height:600px;">'+renderTrickList()+'</div>';
    html += '<div data-style="flex:1;overflow-y:auto;max-height:600px;">'+renderTrickDetail()+'</div>';
    html += '<div data-style="width:320px;border-left:1px solid #e5e7eb;background:#fff;flex-shrink:0;overflow-y:auto;max-height:600px;">'+renderExampleArea()+'</div>';
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


// 模块3: englishSentenceAnalyzer（英语长难句分析器）
// 容器ID: sentence-analyzer-app
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

// 状态
var state = {
    currentIndex: 0,
    customInput: '',
    customAnalysis: null
};

// 辅助函数

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

// 自定义输入规则分析
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

// 渲染函数
function renderInputArea(){
    var html = '<div data-style="background:#fff;padding:16px;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06);margin-bottom:16px;">';
    html += '<h3 data-style="margin:0 0 12px 0;color:#333;font-size:16px;">📝 句子输入区</h3>';

    // 预置例句选择下拉
    html += '<div data-style="margin-bottom:12px;">';
    html += '<label data-style="display:block;font-size:13px;color:#666;margin-bottom:6px;">从预置例句选择：</label>';
    html += '<select id="sentence-select" data-call=\"window.englishSentenceAnalyzer._onSelectPreset\" data-arg1=\"@val\" data-style="'+
        'width:100%;padding:8px 10px;border:2px solid #ddd;border-radius:6px;font-size:14px;box-sizing:border-box;background:#fff;">';
    for(var i=0;i<PRESET_SENTENCES.length;i++){
        var s = PRESET_SENTENCES[i];
        var short = s.sentence.length>50 ? s.sentence.substring(0,50)+'...' : s.sentence;
        html += '<option value="'+i+'"'+(state.currentIndex===i?' selected':'')+'>'+(i+1)+'. '+escapeHtml(short)+'</option>';
    }
    html += '</select>';
    html += '</div>';

    // 自定义输入
    html += '<div data-style="margin-bottom:12px;">';
    html += '<label data-style="display:block;font-size:13px;color:#666;margin-bottom:6px;">或手动输入长难句：</label>';
    html += '<textarea id="custom-sentence-input" placeholder="请输入英文长难句..." data-style="'+
        'width:100%;min-height:60px;padding:10px 12px;border:2px solid #ddd;border-radius:6px;font-size:14px;resize:vertical;box-sizing:border-box;line-height:1.5;font-family:inherit;" '+
        'oninput="window.englishSentenceAnalyzer._onCustomInput(this.value)">'+escapeHtml(state.customInput)+'</textarea>';
    html += '</div>';

    // 分析按钮
    html += '<div data-style="display:flex;gap:8px;">';
    html += '<button data-call=\"window.englishSentenceAnalyzer._analyzeCustom\" data-style="'+
        'padding:8px 20px;background:#1a73e8;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;">🔍 分析自定义句子</button>';
    html += '<button data-call=\"window.englishSentenceAnalyzer._clearCustom\" data-style="'+
        'padding:8px 20px;background:#fff;color:#666;border:2px solid #ddd;border-radius:6px;font-size:14px;cursor:pointer;">清空</button>';
    html += '</div>';

    // 当前模式提示
    if(state.customAnalysis){
        html += '<div data-style="margin-top:10px;padding:8px 12px;background:#fff3e0;border-radius:6px;font-size:12px;color:#e65100;">'+
            '⚠ 当前显示的是自定义句子分析结果，仅供参考（自动识别可能不准确）</div>';
    } else {
        html += '<div data-style="margin-top:10px;padding:8px 12px;background:#e8f5e9;border-radius:6px;font-size:12px;color:#2e7d32;">'+
            '✓ 当前显示预置例句 #'+(state.currentIndex+1)+'（含完整人工标注）</div>';
    }

    html += '</div>';
    return html;
}

function renderSentenceVisualization(){
    var data = state.customAnalysis || PRESET_SENTENCES[state.currentIndex];
    var html = '<div data-style="background:#fff;padding:16px;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06);margin-bottom:16px;">';
    html += '<h3 data-style="margin:0 0 12px 0;color:#333;font-size:16px;">🎨 成分标注</h3>';

    // 原句
    html += '<div data-style="background:#f5f5f5;padding:10px 12px;border-radius:6px;margin-bottom:14px;font-size:15px;color:#333;line-height:1.6;font-style:italic;">'+
        '"'+escapeHtml(data.sentence)+'"</div>';

    // 成分标注（彩色标签）
    html += '<div data-style="line-height:2.4;margin-bottom:14px;">';
    for(var i=0;i<data.components.length;i++){
        var c = data.components[i];
        var color = getRoleColor(c.role);
        var bg = getRoleBgColor(c.role);
        html += '<span data-style="'+
            'display:inline-block;padding:4px 10px;margin:2px 4px 2px 0;'+
            'background:'+bg+';color:'+color+';border:1.5px solid '+color+';'+
            'border-radius:6px;font-size:14px;'+
            '" title="'+escapeHtml(c.role)+(c.clauseType?(' ('+c.clauseType+')'):'')+'">'+
            escapeHtml(c.word)+'<sub data-style="font-size:10px;color:'+color+';">'+escapeHtml(c.role)+'</sub></span>';
    }
    html += '</div>';

    // 图例
    html += '<div data-style="border-top:1px dashed #e0e0e0;padding-top:10px;margin-top:10px;">';
    html += '<div data-style="font-size:12px;color:#888;margin-bottom:6px;">图例：</div>';
    html += '<div data-style="display:flex;flex-wrap:wrap;gap:6px;">';
    var legendRoles = ['主语','谓语','宾语','表语','定语','状语','补语'];
    for(var k=0;k<legendRoles.length;k++){
        var lr = legendRoles[k];
        html += '<span data-style="display:inline-block;padding:2px 8px;font-size:11px;color:'+getRoleColor(lr)+';background:'+getRoleBgColor(lr)+';border:1px solid '+getRoleColor(lr)+';border-radius:4px;">'+lr+'</span>';
    }
    html += '</div>';
    html += '</div>';

    html += '</div>';
    return html;
}

function renderTranslation(){
    var data = state.customAnalysis || PRESET_SENTENCES[state.currentIndex];
    var html = '<div data-style="background:#fff;padding:16px;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06);margin-bottom:16px;">';
    html += '<h3 data-style="margin:0 0 12px 0;color:#333;font-size:16px;">🌐 参考翻译</h3>';
    html += '<div data-style="background:#f0f4ff;padding:12px 14px;border-radius:6px;font-size:15px;color:#333;line-height:1.7;">'+
        escapeHtml(data.translation)+'</div>';
    html += '</div>';
    return html;
}

function renderGrammarAnalysis(){
    var data = state.customAnalysis || PRESET_SENTENCES[state.currentIndex];
    var html = '<div data-style="background:#fff;padding:16px;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06);margin-bottom:16px;">';
    html += '<h3 data-style="margin:0 0 12px 0;color:#333;font-size:16px;">📖 语法分析</h3>';

    // 语法点
    html += '<div data-style="margin-bottom:14px;">';
    html += '<div data-style="font-size:13px;color:#666;margin-bottom:6px;font-weight:600;">语法要点：</div>';
    html += '<ul data-style="margin:0;padding-left:20px;">';
    for(var i=0;i<data.grammarPoints.length;i++){
        html += '<li data-style="font-size:14px;color:#333;line-height:1.8;margin-bottom:4px;">'+escapeHtml(data.grammarPoints[i])+'</li>';
    }
    html += '</ul>';
    html += '</div>';

    // 关键短语
    html += '<div data-style="border-top:1px dashed #e0e0e0;padding-top:12px;">';
    html += '<div data-style="font-size:13px;color:#666;margin-bottom:6px;font-weight:600;">关键短语：</div>';
    html += '<div data-style="display:flex;flex-wrap:wrap;gap:6px;">';
    if(data.keyPhrases && data.keyPhrases.length>0){
        for(var j=0;j<data.keyPhrases.length;j++){
            html += '<span data-style="display:inline-block;padding:4px 10px;background:#fff3e0;color:#e65100;border:1px solid #ffb74d;border-radius:4px;font-size:13px;">'+escapeHtml(data.keyPhrases[j])+'</span>';
        }
    } else {
        html += '<span data-style="font-size:13px;color:#999;">（未识别到关键短语）</span>';
    }
    html += '</div>';
    html += '</div>';

    // 成分从句类型汇总
    var hasClause = false;
    for(var k=0;k<data.components.length;k++){
        if(data.components[k].clauseType){ hasClause = true; break; }
    }
    if(hasClause){
        html += '<div data-style="border-top:1px dashed #e0e0e0;padding-top:12px;margin-top:12px;">';
        html += '<div data-style="font-size:13px;color:#666;margin-bottom:6px;font-weight:600;">从句结构：</div>';
        html += '<ul data-style="margin:0;padding-left:20px;">';
        for(var m=0;m<data.components.length;m++){
            var comp = data.components[m];
            if(comp.clauseType){
                html += '<li data-style="font-size:14px;color:#7b1fa2;line-height:1.8;margin-bottom:4px;">'+
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
    var html = '<div data-style="max-width:900px;margin:0 auto;padding:16px;">';
    html += '<div data-style="text-align:center;margin-bottom:18px;">';
    html += '<h2 data-style="margin:0 0 6px 0;color:#333;font-size:22px;">📖 英语长难句分析器</h2>';
    html += '<p data-style="margin:0;color:#888;font-size:13px;">15句经典长难句 · 成分标注 · 语法分析 · 支持自定义输入</p>';
    html += '</div>';
    html += renderInputArea();
    html += renderSentenceVisualization();
    html += renderTranslation();
    html += renderGrammarAnalysis();
    html += '<div data-style="text-align:center;color:#aaa;font-size:12px;padding:12px 0;">共 '+PRESET_SENTENCES.length+' 句预置例句 | 自定义输入仅供参考</div>';
    html += '</div>';
    container.innerHTML = html;
}

// 事件处理
function bindEvents(){
    // 事件通过 onclick/oninput 内联绑定，无需额外监听
}

// 对外接口
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

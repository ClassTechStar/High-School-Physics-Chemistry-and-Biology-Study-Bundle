(function(){
'use strict';

function fixInteractionIssues(){
    var origLoadModule=window.loadModuleContent;
    window.loadModuleContent=function(subject,module){
        var contentId=subject+'-content';
        var contentEl=document.getElementById(contentId);
        if(!contentEl) return;
        try {
        if(module==='tools'){
            contentEl.innerHTML=getToolsContent(subject);
            return;
        }
        if(module==='methodology'){
            contentEl.innerHTML=getMethodologyContent(subject);
            return;
        }
        if(module==='models'){
            contentEl.innerHTML=getModelsContent(subject);
            return;
        }
        if(module==='hotspot'){
            contentEl.innerHTML=getHotspotContent(subject);
            return;
        }
        if(module==='errors'){
            contentEl.innerHTML=getErrorsContent(subject);
            return;
        }
        if(module==='graph'){
            contentEl.innerHTML=getKnowledgeGraphContent(subject);
            return;
        }
        if(module==='checklist'){
            if(window.PlatformSystem&&typeof PlatformSystem.getChecklistContent==='function'){
                contentEl.innerHTML=PlatformSystem.getChecklistContent(subject);
            }else{
                contentEl.innerHTML='<div class="knowledge-section"><p>考点清单正在加载中...</p></div>';
            }
            return;
        }
        if(origLoadModule){
            origLoadModule(subject,module);
        }else if(window.subjectContent&&window.subjectContent[subject]){
            var content=window.subjectContent[subject][module]||'<p>该模块内容正在开发中...</p>';
            contentEl.innerHTML=content;
        }
        } catch (err) {
            console.error('加载模块内容失败('+subject+'/'+module+'):', err);
            contentEl.innerHTML='<div class="knowledge-section"><p>内容加载失败，请刷新重试。</p></div>';
        }
    };

    }

function getToolsContent(subject){
    if(subject==='physics'){
        return '<div class="tools-access">'+
            '<button class="tool-access-btn" onclick="loadPhysicsTool(\'calculator\')">🧮 物理公式智能计算器</button>'+
            '<button class="tool-access-btn" onclick="loadPhysicsTool(\'projectile\')">🎯 抛物线运动模拟器</button>'+
            '</div>';
    }
    if(subject==='chemistry'){
        return '<div class="tools-access">'+
            '<button class="tool-access-btn" onclick="loadChemistryTool(\'electrochem\')">⚡ 电化学动态示意系统</button>'+
            '<button class="tool-access-btn" onclick="loadChemistryTool(\'balancer\')">⚗️ 化学方程式智能配平与可视化</button>'+
            '<button class="tool-access-btn" onclick="loadChemistryTool(\'notebook\')">📓 化学方程式速录本</button>'+
            '<button class="tool-access-btn" onclick="loadChemistryTool(\'process\')">🏭 工艺流程节点卡片系统</button>'+
            '<button class="tool-access-btn" onclick="loadChemistryTool(\'organic\')">🔗 有机物转化图绘制器</button>'+
            '<button class="tool-access-btn" onclick="loadChemistryTool(\'process-analyzer\')">🏭 工业流程核心反应提取</button>'+
            '<button class="tool-access-btn" onclick="loadChemistryTool(\'quiz\')">📝 化学小题型专练生成器</button>'+
            '<button class="tool-access-btn" onclick="loadChemistryTool(\'safety\')">🛡️ 化学实验安全评判系统</button>'+
            '<button class="tool-access-btn" onclick="loadChemistryTool(\'equation-balancer\')">⚗️ 高中化学方程式配平训练</button>'+
            '</div>';
    }
    if(subject==='biology'){
        return '<div class="tools-access">'+
            '<button class="tool-access-btn" onclick="loadBiologyTool(\'mindmap\')">🧠 生物概念图/思维导图生成器</button>'+
            '<button class="tool-access-btn" onclick="loadBiologyTool(\'genetics\')">🧬 生物遗传性状模拟器</button>'+
            '<button class="tool-access-btn" onclick="loadBiologyTool(\'pedigree\')">📋 遗传系谱图练习器</button>'+
            '<button class="tool-access-btn" onclick="loadBiologyTool(\'photosynthesis\')">🌿 光合/呼吸曲线解读训练</button>'+
            '<button class="tool-access-btn" onclick="loadBiologyTool(\'experiment\')">🧪 实验设计模板生成器</button>'+
            '<button class="tool-access-btn" onclick="loadBiologyTool(\'ecosystem\')">🌍 生态动态系统模拟游戏</button>'+
            '<button class="tool-access-btn" onclick="loadBiologyTool(\'pcr\')">🧬 PCR聚合酶链式反应模拟实验</button>'+
            '<button class="tool-access-btn" onclick="loadBiologyTool(\'electrophoresis\')">🔬 琼脂糖凝胶电泳模拟工具</button>'+
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

    html+='<h3>🗺️ 高中'+subjectNames[subject]+'智能备考知识图谱</h3>';

    html+='<div class="knowledge-card" style="background:linear-gradient(135deg,rgba(102,126,234,0.08),rgba(118,75,162,0.08));border:1px solid rgba(102,126,234,0.2);">';
    html+='<h4 style="color:#667eea;">📊 考核框架：分值地图</h4>';
    html+='<p style="margin-bottom:8px;font-size:0.9rem;">依据广东高考命题权重，确定复习优先级：</p>';
    kg.examFramework.scoreWeights.forEach(function(m){
        var barWidth=Math.round(m.score*2.5);
        var colors=['#e74c3c','#e67e22','#f1c40f','#27ae60','#3498db'];
        html+='<div style="display:flex;align-items:center;margin:4px 0;gap:8px;">';
        html+='<span style="min-width:180px;font-size:0.85rem;">'+m.module+'</span>';
        html+='<div style="flex:1;background:#eee;border-radius:4px;height:20px;overflow:hidden;">';
        html+='<div style="width:'+barWidth+'%;height:100%;background:'+colors[m.priority-1]+';border-radius:4px;display:flex;align-items:center;justify-content:center;color:white;font-size:0.75rem;font-weight:600;">≈'+m.score+'分</div>';
        html+='</div>';
        html+='</div>';
    });
    html+='</div>';

    html+='<div class="knowledge-card" style="background:linear-gradient(135deg,rgba(39,174,96,0.08),rgba(46,204,113,0.08));border:1px solid rgba(39,174,96,0.2);">';
    html+='<h4 style="color:#27ae60;">📋 实验评分标准（'+kg.experimentScoring.total+'分制）</h4>';
    html+='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">';
    kg.experimentScoring.dimensions.forEach(function(d){
        html+='<div style="flex:1;min-width:120px;background:white;border-radius:8px;padding:10px;text-align:center;border:1px solid rgba(39,174,96,0.2);">';
        html+='<div style="font-size:1.5rem;font-weight:700;color:#27ae60;">'+d.score+'分</div>';
        html+='<div style="font-size:0.85rem;font-weight:600;margin:4px 0;">'+d.name+'</div>';
        html+='<div style="font-size:0.75rem;color:#666;">'+d.desc+'</div>';
        html+='</div>';
    });
    html+='</div></div>';

    if(kg.relations&&kg.relations.length>0){
        html+='<div class="knowledge-card"><h4>🔗 知识关联网络</h4>';
        html+='<div style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0;">';
        kg.relations.forEach(function(r){
            var fromTopic=kg.topics.find(function(t){return t.id===r.from;});
            var toTopic=kg.topics.find(function(t){return t.id===r.to;});
            if(!fromTopic||!toTopic) return;
            var typeColor=r.type==='PRECEDES'?'#e74c3c':'#3498db';
            var typeLabel=r.type==='PRECEDES'?'前置依赖':'横向关联';
            html+='<div style="background:white;border:1px solid '+typeColor+';border-radius:6px;padding:6px 10px;font-size:0.8rem;">';
            html+='<span style="color:'+typeColor+';font-weight:600;">['+typeLabel+']</span> ';
            html+=fromTopic.name+' → '+toTopic.name;
            html+='<div style="color:#999;font-size:0.75rem;">'+r.desc+'</div>';
            html+='</div>';
        });
        html+='</div></div>';
    }

    html+='<div class="knowledge-card" style="background:linear-gradient(135deg,rgba(231,76,60,0.06),rgba(230,126,34,0.06));border:1px solid rgba(231,76,60,0.2);">';
    html+='<h4 style="color:#e74c3c;">📌 考点冲刺清单</h4>';
    html+='<p style="font-size:0.85rem;color:#666;margin-bottom:10px;">核心考点→命题角度→备考策略 三维清单</p>';
    html+='<table style="width:100%;border-collapse:collapse;font-size:0.82rem;">';
    html+='<tr style="background:var(--primary);color:#fff;"><th style="padding:8px;border:1px solid #ddd;text-align:left;">考点</th><th style="padding:8px;border:1px solid #ddd;">权重</th><th style="padding:8px;border:1px solid #ddd;text-align:left;">命题角度</th><th style="padding:8px;border:1px solid #ddd;text-align:left;">备考策略</th></tr>';
    kg.topics.forEach(function(t){
        var wp=Math.round(t.weight*100);
        var wc=t.weight>=0.10?'#e74c3c':t.weight>=0.06?'#e67e22':'#27ae60';
        var examAngle=t.examRef||'常规考查';
        var stratShort=t.strategy?t.strategy.substring(0,40)+'...':'—';
        html+='<tr><td style="padding:6px;border:1px solid #ddd;font-weight:600;">'+t.name+'</td>';
        html+='<td style="padding:6px;border:1px solid #ddd;text-align:center;color:'+wc+';font-weight:700;">'+wp+'%</td>';
        html+='<td style="padding:6px;border:1px solid #ddd;font-size:0.8rem;">'+examAngle+'</td>';
        html+='<td style="padding:6px;border:1px solid #ddd;font-size:0.8rem;">'+stratShort+'</td></tr>';
    });
    html+='</table></div>';

    kg.topics.forEach(function(topic,idx){
        var weightPercent=Math.round(topic.weight*100);
        var weightColor=topic.weight>=0.10?'#e74c3c':topic.weight>=0.06?'#e67e22':'#27ae60';
        html+='<div class="knowledge-card" id="topic-'+topic.id+'" style="border-left:4px solid '+weightColor+';">';
        html+='<h4 style="display:flex;justify-content:space-between;align-items:center;">';
        html+='<span>'+(idx+1)+'. '+topic.name+'</span>';
        html+='<span style="font-size:0.8rem;color:'+weightColor+';background:'+weightColor+'15;padding:2px 8px;border-radius:10px;">权重'+weightPercent+'%</span>';
        html+='</h4>';
        html+='<div style="font-size:0.8rem;color:#888;margin-bottom:8px;">📍 '+topic.module+' | 📝 '+topic.examRef+'</div>';

        html+='<div class="key-point"><strong>🧠 核心概念：</strong>'+topic.concept+'</div>';
        html+='<div class="key-point"><strong>📊 高频图像/模型：</strong>'+topic.diagram+'</div>';
        html+='<div class="key-point"><strong>🔬 典型实验情境：</strong>'+topic.experiment+'</div>';
        html+='<div class="common-mistake"><strong>⚠️ 易错警示：</strong>'+topic.pitfall+'</div>';
        html+='<div style="background:rgba(102,126,234,0.08);padding:10px 14px;border-radius:6px;margin:8px 0;border-left:3px solid #667eea;font-size:0.85rem;line-height:1.7;">';
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
    html+='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">';
    data.categories.forEach(function(cat){
        html+='<button class="module-tab" onclick="ContentEnhancer.filterModels(\''+subject+'\',\''+cat.id+'\')">'+cat.name+'</button>';
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
            html+='<div class="knowledge-card" style="margin-bottom:16px;">';
            html+='<h4 style="color:var(--primary);">'+topic.title+'</h4>';
            if(topic.intro) html+='<p style="color:var(--text-secondary);margin-bottom:10px;">'+topic.intro+'</p>';
            topic.sections.forEach(function(sec){
                html+='<div style="margin-bottom:10px;">';
                html+='<h5 style="color:var(--secondary);margin-bottom:6px;">'+sec.subtitle+'</h5>';
                sec.points.forEach(function(pt){
                    if(pt.type==='key'){
                        html+='<div class="key-point"><strong>'+pt.label+'：</strong>'+pt.content+'</div>';
                    }else if(pt.type==='mistake'){
                        html+='<div class="common-mistake">⚠️ '+pt.content+'</div>';
                    }else if(pt.type==='example'){
                        html+='<div style="background:var(--bg-secondary);padding:8px 12px;border-radius:6px;margin:6px 0;font-size:0.9rem;border-left:3px solid var(--primary);">'+pt.content+'</div>';
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
        html+='<div class="knowledge-card" style="margin-bottom:16px;border-left:4px solid '+wc+';">';
        html+='<h4 style="color:var(--primary);">'+topic.name+' <span style="font-size:0.8rem;color:'+wc+';">权重'+wp+'%</span></h4>';
        html+='<div style="font-size:0.8rem;color:#888;margin-bottom:8px;">📍 '+topic.module+' | 📝 '+topic.examRef+'</div>';
        html+='<div class="key-point"><strong>🧠 核心概念：</strong>'+topic.concept+'</div>';
        html+='<div class="key-point"><strong>📊 高频图像：</strong>'+topic.diagram+'</div>';
        html+='<div class="key-point"><strong>🔬 实验情境：</strong>'+topic.experiment+'</div>';
        html+='<div class="common-mistake"><strong>⚠️ 易错警示：</strong>'+topic.pitfall+'</div>';
        html+='<div style="background:rgba(102,126,234,0.08);padding:10px 14px;border-radius:6px;margin:8px 0;border-left:3px solid #667eea;font-size:0.85rem;line-height:1.7;">';
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
        var mainContent=document.getElementById('main-content');
        if(!mainContent) return;
        if(!document.getElementById('periodic-table-section')){
            var s1=document.createElement('section');
            s1.id='periodic-table-section';
            s1.className='section';
            s1.innerHTML='<div class="tool-header"><button class="back-btn" onclick="navigateTo(\'chemistry\')">← 返回化学</button><h2>📊 化学元素周期表</h2></div><div id="periodic-table-app"></div>';
            mainContent.appendChild(s1);
        }
        if(!document.getElementById('chemistry-structure-section')){
            var s2=document.createElement('section');
            s2.id='chemistry-structure-section';
            s2.className='section';
            s2.innerHTML='<div class="tool-header"><button class="back-btn" onclick="navigateTo(\'chemistry\')">← 返回化学</button><h2>🔬 化学物质结构与性质</h2></div><div id="chemistry-structure-app"></div>';
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

    buildPeriodicTable:function(){this.periodicTable={elements:[{z:1,sym:'H',name:'氢',mass:1.008,group:1,period:1,config:'1s¹',en:2.20,ar:25,ie1:1312,cat:'nonmetal'},{z:2,sym:'He',name:'氦',mass:4.003,group:18,period:1,config:'1s²',en:null,ar:31,ie1:2372,cat:'noble'},{z:3,sym:'Li',name:'锂',mass:6.941,group:1,period:2,config:'[He]2s¹',en:0.98,ar:145,ie1:520,cat:'alkali'},{z:4,sym:'Be',name:'铍',mass:9.012,group:2,period:2,config:'[He]2s²',en:1.57,ar:105,ie1:900,cat:'alkaline'},{z:5,sym:'B',name:'硼',mass:10.81,group:13,period:2,config:'[He]2s²2p¹',en:2.04,ar:85,ie1:801,cat:'metalloid'},{z:6,sym:'C',name:'碳',mass:12.01,group:14,period:2,config:'[He]2s²2p²',en:2.55,ar:70,ie1:1086,cat:'nonmetal'},{z:7,sym:'N',name:'氮',mass:14.01,group:15,period:2,config:'[He]2s²2p³',en:3.04,ar:65,ie1:1402,cat:'nonmetal'},{z:8,sym:'O',name:'氧',mass:16.00,group:16,period:2,config:'[He]2s²2p⁴',en:3.44,ar:60,ie1:1314,cat:'nonmetal'},{z:9,sym:'F',name:'氟',mass:19.00,group:17,period:2,config:'[He]2s²2p⁵',en:3.98,ar:50,ie1:1681,cat:'halogen'},{z:10,sym:'Ne',name:'氖',mass:20.18,group:18,period:2,config:'[He]2s²2p⁶',en:null,ar:38,ie1:2081,cat:'noble'},{z:11,sym:'Na',name:'钠',mass:22.99,group:1,period:3,config:'[Ne]3s¹',en:0.93,ar:180,ie1:496,cat:'alkali'},{z:12,sym:'Mg',name:'镁',mass:24.31,group:2,period:3,config:'[Ne]3s²',en:1.31,ar:150,ie1:738,cat:'alkaline'},{z:13,sym:'Al',name:'铝',mass:26.98,group:13,period:3,config:'[Ne]3s²3p¹',en:1.61,ar:125,ie1:578,cat:'metal'},{z:14,sym:'Si',name:'硅',mass:28.09,group:14,period:3,config:'[Ne]3s²3p²',en:1.90,ar:110,ie1:786,cat:'metalloid'},{z:15,sym:'P',name:'磷',mass:30.97,group:15,period:3,config:'[Ne]3s²3p³',en:2.19,ar:100,ie1:1012,cat:'nonmetal'},{z:16,sym:'S',name:'硫',mass:32.07,group:16,period:3,config:'[Ne]3s²3p⁴',en:2.58,ar:100,ie1:1000,cat:'nonmetal'},{z:17,sym:'Cl',name:'氯',mass:35.45,group:17,period:3,config:'[Ne]3s²3p⁵',en:3.16,ar:100,ie1:1251,cat:'halogen'},{z:18,sym:'Ar',name:'氩',mass:39.95,group:18,period:3,config:'[Ne]3s²3p⁶',en:null,ar:71,ie1:1521,cat:'noble'},{z:19,sym:'K',name:'钾',mass:39.10,group:1,period:4,config:'[Ar]4s¹',en:0.82,ar:220,ie1:419,cat:'alkali'},{z:20,sym:'Ca',name:'钙',mass:40.08,group:2,period:4,config:'[Ar]4s²',en:1.00,ar:180,ie1:590,cat:'alkaline'},{z:26,sym:'Fe',name:'铁',mass:55.85,group:8,period:4,config:'[Ar]3d⁶4s²',en:1.83,ar:140,ie1:762,cat:'transition'},{z:29,sym:'Cu',name:'铜',mass:63.55,group:11,period:4,config:'[Ar]3d¹⁰4s¹',en:1.90,ar:135,ie1:745,cat:'transition'},{z:30,sym:'Zn',name:'锌',mass:65.38,group:12,period:4,config:'[Ar]3d¹⁰4s²',en:1.65,ar:135,ie1:906,cat:'transition'},{z:35,sym:'Br',name:'溴',mass:79.90,group:17,period:4,config:'[Ar]3d¹⁰4s²4p⁵',en:2.96,ar:115,ie1:1140,cat:'halogen'},{z:36,sym:'Kr',name:'氪',mass:83.80,group:18,period:4,config:'[Ar]3d¹⁰4s²4p⁶',en:3.00,ar:88,ie1:1351,cat:'noble'}],render:function(cid){var c=document.getElementById(cid);if(!c)return;var h='<div style="overflow-x:auto;"><div style="display:grid;grid-template-columns:repeat(18,58px);gap:2px;min-width:1060px;">';var g=new Array(18*7).fill(null);this.elements.forEach(function(el){var idx=(el.period-1)*18+(el.group-1);if(idx<g.length)g[idx]=el;});for(var i=0;i<7*18;i++){var el=g[i];if(el){var bg='#fff';if(el.cat==='alkali')bg='#e8f5e9';else if(el.cat==='alkaline')bg='#e3f2fd';else if(el.cat==='transition')bg='#fff3e0';else if(el.cat==='nonmetal')bg='#fce4ec';else if(el.cat==='halogen')bg='#e8eaf6';else if(el.cat==='noble')bg='#f3e5f5';else if(el.cat==='metalloid')bg='#efebe9';else bg='#f5f5f5';h+='<div style="background:'+bg+';padding:4px;border-radius:4px;text-align:center;cursor:pointer;border:1px solid #ddd;font-size:0.7rem;" onclick="ContentEnhancer.showElementDetail('+el.z+')" title="'+el.name+'">';h+='<div style="font-size:0.6rem;color:#999;">'+el.z+'</div>';h+='<div style="font-weight:bold;font-size:0.9rem;">'+el.sym+'</div>';h+='<div style="font-size:0.55rem;color:#666;">'+el.mass.toFixed(el.mass<10?3:2)+'</div>';h+='</div>';}else{h+='<div style="padding:4px;"></div>';}}h+='</div></div><div id="element-detail" style="margin-top:20px;"></div>';c.innerHTML=h;},showElement:function(z){var el=this.elements.find(function(e){return e.z===z;});if(!el)return;var d=document.getElementById('element-detail');if(!d)return;var h='<div class="knowledge-card"><h4>'+el.sym+' '+el.name+' (Z='+el.z+')</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">';h+='<div class="key-point">原子序数：'+el.z+'</div>';h+='<div class="key-point">相对原子质量：'+el.mass+'</div>';h+='<div class="key-point">电子排布：'+el.config+'</div>';h+='<div class="key-point">原子半径：'+el.ar+'pm</div>';if(el.en)h+='<div class="key-point">电负性：'+el.en+'</div>';h+='<div class="key-point">第一电离能：'+el.ie1+'kJ/mol</div>';h+='</div></div>';d.innerHTML=h;}};},

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
        this._card('基础·运动学','关于匀变速直线运动，下列说法正确的是：<br>A.速度越大加速度越大 ✗<br>B.速度变化越大加速度越大 ✗<br>C.加速度越大速度变化越快 ✓<br>D.加速度方向与速度方向一定相同 ✗<br><span style="color:#27ae60;">解析：a=Δv/Δt，加速度描述速度变化快慢，与速度大小无直接关系</span>')+
        this._card('基础·牛顿定律','质量为2kg的物体在光滑水平面上受6N水平力作用，3s内位移为（初速度为零）：<br>A.9m ✗<br>B.13.5m ✓<br>C.18m ✗<br>D.27m ✗<br><span style="color:#27ae60;">解析：a=F/m=3m/s²，x=½at²=½×3×9=13.5m</span>')+
        this._card('提升·曲线运动','从同一高度以不同初速度水平抛出两个相同小球（不计空气阻力），下列说法正确的是：<br>A.初速度大的先落地 ✗<br>B.两球同时落地 ✓<br>C.初速度大的落地速度小 ✗<br>D.两球落地速度相同 ✗<br><span style="color:#27ae60;">解析：t=√(2h/g)与v₀无关；落地速度v=√(v₀²+2gh)，v₀大则v大</span>')+
        this._card('提升·万有引力','关于地球同步卫星，下列说法正确的是：<br>A.可以在北京正上方 ✗<br>B.周期等于地球自转周期 ✓<br>C.线速度等于第一宇宙速度 ✗<br>D.向心加速度等于地面g ✗<br><span style="color:#27ae60;">解析：同步卫星在赤道正上方，T=24h，v<v₁=7.9km/s，a<g</span>')+
        this._card('提升·机械能','从高h处自由下落的物体，动能等于势能时距地面高度为：<br>A.h/4 ✗<br>B.h/2 ✓<br>C.2h/3 ✗<br>D.3h/4 ✗<br><span style="color:#27ae60;">解析：Ek=Ep时，mgh/2=mgh\'，h\'=h/2</span>')+
        this._card('冲刺·电磁感应','导体棒在匀强磁场中匀速切割磁力线，外力做功等于：<br>A.导体棒动能增量 ✗<br>B.电路产生的焦耳热 ✓<br>C.安培力做的功 ✗<br>D.导体棒重力势能变化 ✗<br><span style="color:#27ae60;">解析：匀速→a=0→F外=F安，W外=W克服安培力=Q焦耳</span>')+
        this._card('冲刺·动量能量','质量m的子弹以v₀射入静止木块M并留在其中，损失的机械能为：<br>A.½mv₀² ✗<br>B.½Mv₀² ✗<br>C.Mmv₀²/[2(M+m)] ✓<br>D.½mv₀²·M/(M+m) ✗<br><span style="color:#27ae60;">解析：mv₀=(M+m)v，ΔE=½mv₀²-½(M+m)v²=Mmv₀²/[2(M+m)]</span>')+
        this._card('冲刺·电场','关于电场强度和电势，下列正确的是：<br>A.E=0处φ一定为0 ✗<br>B.φ高处E一定大 ✗<br>C.E与φ无直接关系 ✓<br>D.沿电场线方向φ升高 ✗<br><span style="color:#27ae60;">解析：等量同种电荷连线中点E=0但φ≠0；沿电场线φ降低</span>')+
        '</div>';},
    _buildChemistryTests:function(){return '<div class="tests-section"><h3>📋 化学模拟测试</h3>'+
        this._card('基础·化学计量','标准状况下，22.4L CO₂的物质的量为：<br>A.1mol ✓<br>B.22.4mol ✗<br>C.44mol ✗<br>D.无法确定 ✗<br><span style="color:#27ae60;">解析：标况下22.4L任何气体=1mol</span>')+
        this._card('基础·离子反应','下列离子能大量共存的是：<br>A.H⁺、CO₃²⁻ ✗<br>B.Na⁺、K⁺、NO₃⁻、SO₄²⁻ ✓<br>C.Fe³⁺、OH⁻ ✗<br>D.NH₄⁺、OH⁻ ✗<br><span style="color:#27ae60;">解析：A产生CO₂；C产生Fe(OH)₃沉淀；D产生NH₃·H₂O</span>')+
        this._card('提升·氧化还原','3Cu+8HNO₃(稀)→3Cu(NO₃)₂+2NO↑+4H₂O，被还原与未被还原的HNO₃之比为：<br>A.1:3 ✓<br>B.2:3 ✗<br>C.1:4 ✗<br>D.3:1 ✗<br><span style="color:#27ae60;">解析：8mol HNO₃中2mol被还原(N+5→+2)，6mol起酸性作用</span>')+
        this._card('提升·电化学','锌铜原电池负极反应为：<br>A.Zn-2e⁻→Zn²⁺ ✓<br>B.Cu²⁺+2e⁻→Cu ✗<br>C.2H⁺+2e⁻→H₂↑ ✗<br>D.Zn²⁺+2e⁻→Zn ✗<br><span style="color:#27ae60;">解析：锌比铜活泼，锌为负极失电子氧化反应</span>')+
        this._card('提升·化学平衡','N₂+3H₂⇌2NH₃(放热)，提高H₂转化率的措施：<br>A.增大压强 ✓<br>B.升高温度 ✗<br>C.加催化剂 ✗<br>D.减小N₂ ✗<br><span style="color:#27ae60;">解析：增大压强平衡正向移动，H₂转化率升高</span>')+
        this._card('冲刺·盐类水解','下列溶液pH最大的是：<br>A.NaCl ✗<br>B.Na₂CO₃ ✓<br>C.NH₄Cl ✗<br>D.NaHCO₃ ✗<br><span style="color:#27ae60;">解析：Na₂CO₃水解程度最大，碱性最强</span>')+
        this._card('冲刺·有机推断','C₂H₄O₂能与NaHCO₃反应放出气体，该有机物为：<br>A.甲酸甲酯 ✗<br>B.乙酸 ✓<br>C.乙醇 ✗<br>D.乙醛 ✗<br><span style="color:#27ae60;">解析：与NaHCO₃反应→含-COOH，C₂H₄O₂含-COOH的只有乙酸</span>')+
        '</div>';},
    _buildBiologyTests:function(){return '<div class="tests-section"><h3>📋 生物模拟测试</h3>'+
        this._card('基础·细胞结构','下列不具有膜结构的细胞器是：<br>A.线粒体 ✗<br>B.核糖体 ✓<br>C.内质网 ✗<br>D.高尔基体 ✗<br><span style="color:#27ae60;">解析：核糖体是无膜细胞器，还有中心体</span>')+
        this._card('基础·蛋白质','关于蛋白质，正确的是：<br>A.蛋白质是生命活动的主要承担者 ✓<br>B.所有蛋白质都含S ✗<br>C.多样性只与氨基酸种类有关 ✗<br>D.每种蛋白质都含20种氨基酸 ✗<br><span style="color:#27ae60;">解析：蛋白质功能多样性；多样性由种类/数目/排列/空间结构决定</span>')+
        this._card('提升·细胞代谢','有氧呼吸释放CO₂的阶段是：<br>A.只有第二阶段 ✓<br>B.第二和第三阶段 ✗<br>C.只有第三阶段 ✗<br>D.第一和第二阶段 ✗<br><span style="color:#27ae60;">解析：第二阶段丙酮酸+H₂O→CO₂+[H]释放CO₂</span>')+
        this._card('提升·细胞分裂','减数分裂中同源染色体分离发生在：<br>A.减Ⅰ前期 ✗<br>B.减Ⅰ后期 ✓<br>C.减Ⅱ后期 ✗<br>D.有丝分裂后期 ✗<br><span style="color:#27ae60;">解析：减Ⅰ后期同源染色体分离，减Ⅱ后期姐妹染色单体分离</span>')+
        this._card('提升·遗传规律','正常夫妇，女方父亲白化病(常隐)，男方有一白化病弟弟，后代白化病概率：<br>A.1/4 ✗<br>B.1/6 ✗<br>C.1/9 ✗<br>D.1/18 ✗<br><span style="color:#27ae60;">解析：女方Aa(1)，男方Aa(2/3)，aa=2/3×1/4=1/6</span>')+
        this._card('冲刺·光合作用','暗反应中CO₂固定是指：<br>A.CO₂与C₃结合 ✗<br>B.CO₂与C₅结合生成C₃ ✓<br>C.C₃被[H]还原 ✗<br>D.ATP水解 ✗<br><span style="color:#27ae60;">解析：CO₂+C₅→2C₃（RuBisCO酶催化）</span>')+
        this._card('冲刺·免疫调节','关于特异性免疫，正确的是：<br>A.浆细胞能识别抗原 ✗<br>B.效应T细胞产生抗体 ✗<br>C.B细胞增殖分化为浆细胞和记忆细胞 ✓<br>D.二次免疫比初次慢 ✗<br><span style="color:#27ae60;">解析：浆细胞不能识别抗原；效应T细胞使靶细胞裂解；二次免疫更快更强</span>')+
        this._card('冲刺·基因工程','限制酶的作用是：<br>A.连接DNA片段 ✗<br>B.识别特定序列并切割DNA ✓<br>C.导入目的基因 ✗<br>D.检测基因表达 ✗<br><span style="color:#27ae60;">解析：限制酶识别回文序列并切割DNA双链</span>')+
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

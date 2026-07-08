// 内容深化模块V2 - 框架训练+实验全表+思维链+变式推荐

// ============================================================
// 模块1: frameworkAnswerTrainer（框架式答题训练系统）
// ============================================================
(function(){
'use strict';

var LS_KEY = 'hspcb_framework_records';

// ==================== 答题框架定义 ====================
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

// ==================== 题库数据加载器（动态加载 data/framework-questions.json） ====================
var QuestionDataLoader = {
    _cache: null,
    _loadingPromise: null,
    _dataUrl: '../data/framework-questions.json',

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

// ==================== 训练系统主体 ====================
var state = {
    currentStep: 1,
    selectedQuestion: null,
    selectedFramework: null,
    userAnswers: {},
    submitted: false
};

function loadRecords(){
    try {
        var raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch(e){ return {}; }
}

function saveRecord(questionId, score){
    var records = loadRecords();
    records[questionId] = { score: score, time: new Date().toISOString(), completed: true };
    try { localStorage.setItem(LS_KEY, JSON.stringify(records)); } catch(e){}
}

function getSubjectColor(subject){
    if(subject === '物理') return '#1a73e8';
    if(subject === '化学') return '#7b1fa2';
    if(subject === '生物') return '#0d7a3e';
    return '#444';
}

function step1SelectQuestion(){
    var html = '<div style="padding:20px;">';
    html += '<h3 style="color:#333;margin-bottom:12px;">Step 1: 选择题目</h3>';

    // 框架筛选按钮
    html += '<div style="margin-bottom:16px;">';
    html += '<span style="font-weight:600;margin-right:10px;">框架类型：</span>';
    var frameworks = ['原因分析','实验设计','曲线分析'];
    for(var i=0;i<frameworks.length;i++){
        var fw = frameworks[i];
        var active = state.selectedFramework === fw;
        html += '<button data-framework="'+fw+'" style="'+
            'padding:6px 14px;margin-right:8px;margin-bottom:6px;border:2px solid #ddd;border-radius:20px;background:'+(active?'#1a73e8':'#fff')+';color:'+(active?'#fff':'#333')+';cursor:pointer;font-size:13px;'+
            '" onclick="window.frameworkAnswerTrainer._selectFramework(\''+fw+'\')">'+fw+'</button>';
    }
    html += '</div>';

    // 题目列表（数据由 QuestionDataLoader 动态加载）
    var questions = QuestionDataLoader.getCached();
    var filtered = state.selectedFramework ? questions.filter(function(q){return q.framework===state.selectedFramework;}) : questions;
    html += '<div style="max-height:400px;overflow-y:auto;">';
    for(var j=0;j<filtered.length;j++){
        var q = filtered[j];
        var records = loadRecords();
        var done = records[q.id];
        html += '<div data-qid="'+q.id+'" onclick="window.frameworkAnswerTrainer._selectQuestion(\''+q.id+'\')" style="'+
            'padding:12px 14px;margin-bottom:8px;border:2px solid '+(state.selectedQuestion&&state.selectedQuestion.id===q.id?'#1a73e8':'#e0e0e0')+';border-radius:10px;cursor:pointer;background:'+(state.selectedQuestion&&state.selectedQuestion.id===q.id?'#e8f0fe':'#fff')+';transition:all 0.2s;'+
            '">';
        html += '<div style="font-size:14px;font-weight:600;color:#333;margin-bottom:4px;">';
        html += '<span style="display:inline-block;background:'+getSubjectColor(q.subject)+';color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;margin-right:8px;">'+q.subject+'</span>';
        html += '<span style="color:#888;font-size:12px;">'+q.year+'</span>';
        if(done){ html += '<span style="color:#0d7a3e;font-size:12px;margin-left:8px;">✓ 已完成 (得分:'+done.score+')</span>'; }
        html += '</div>';
        html += '<div style="font-size:15px;color:#555;">'+q.question+'</div>';
        html += '</div>';
    }
    html += '</div>';

    // 继续按钮
    html += '<button onclick="window.frameworkAnswerTrainer._goStep2()" style="'+
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

    var html = '<div style="padding:20px;">';
    html += '<h3 style="color:#333;margin-bottom:8px;">Step 2: 按框架填写答案</h3>';
    html += '<div style="background:#f0f4ff;padding:12px 16px;border-radius:10px;margin-bottom:16px;">';
    html += '<span style="color:'+getSubjectColor(q.subject)+';font-weight:600;">'+q.subject+' | '+q.year+'</span>';
    html += '<p style="margin:8px 0 0 0;color:#555;">'+q.question+'</p>';
    html += '<p style="margin:4px 0 0 0;color:#999;font-size:13px;font-style:italic;">'+q.context+'</p>';
    html += '</div>';

    html += '<div style="background:#fff3e0;padding:10px 14px;border-radius:8px;margin-bottom:16px;font-size:13px;color:#e65100;">';
    html += '📋 框架：<strong>'+fw.name+'</strong><br>'+fw.description;
    html += '</div>';

    for(var i=0;i<steps.length;i++){
        var idx = i+1;
        html += '<div style="margin-bottom:14px;">';
        html += '<div style="font-weight:600;color:#333;margin-bottom:6px;">步骤'+idx+'：'+steps[i]+'</div>';
        html += '<textarea id="fw-input-'+i+'" placeholder="请输入'+steps[i]+'的内容..." style="'+
            'width:100%;min-height:70px;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;resize:vertical;box-sizing:border-box;'+
            'line-height:1.6;font-family:inherit;" oninput="window.frameworkAnswerTrainer._onInput('+i+',this.value)">'+(state.userAnswers[i]||'')+'</textarea>';
        html += '</div>';
    }

    html += '<div style="display:flex;gap:12px;margin-top:16px;">';
    html += '<button onclick="window.frameworkAnswerTrainer._goStep1()" style="padding:10px 24px;background:#fff;color:#555;border:2px solid #ddd;border-radius:8px;font-size:14px;cursor:pointer;">← 上一步</button>';
    var allFilled = true;
    for(var k=0;k<steps.length;k++){ if(!state.userAnswers[k]||state.userAnswers[k].trim()===''){allFilled=false;break;} }
    html += '<button onclick="window.frameworkAnswerTrainer._submit()" style="padding:10px 28px;background:'+(allFilled?'#0d7a3e':'#ccc')+';color:#fff;border:none;border-radius:8px;font-size:15px;cursor:'+(allFilled?'pointer':'not-allowed')+';" '+(allFilled?'':'disabled')+'>提交并查看对比</button>';
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

    var html = '<div style="padding:20px;">';
    html += '<h3 style="color:#333;margin-bottom:12px;">Step 3: 标准答案对比</h3>';

    for(var i=0;i<steps.length;i++){
        var userAns = state.userAnswers[i]||'（未填写）';
        var modelAns = q.modelAnswer[modelKeys[i]]||'';
        html += '<div style="margin-bottom:20px;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;">';
        html += '<div style="background:#f5f5f5;padding:10px 14px;font-weight:600;color:#333;font-size:14px;">步骤'+(i+1)+'：'+steps[i]+'</div>';

        // 用户答案
        html += '<div style="padding:12px 14px;border-bottom:1px solid #f0f0f0;">';
        html += '<div style="font-size:12px;color:#999;margin-bottom:4px;">📝 你的答案：</div>';
        var isEmpty = !userAns || userAns.trim()==='';
        html += '<div style="font-size:14px;color:'+(isEmpty?'#e53935':'#333')+';line-height:1.6;white-space:pre-wrap;">'+userAns+'</div>';
        html += '</div>';

        // 标准答案
        html += '<div style="padding:12px 14px;background:#f9fff9;">';
        html += '<div style="font-size:12px;color:#999;margin-bottom:4px;">✅ 标准答案：</div>';
        html += '<div style="font-size:14px;color:#2e7d32;line-height:1.6;">'+modelAns+'</div>';
        html += '</div>';

        // 对比标签
        html += '<div style="padding:8px 14px;background:#fff;">';
        if(isEmpty){
            html += '<span style="color:#e53935;font-size:12px;">❌ 未填写</span>';
        } else {
            html += '<span style="color:#0d7a3e;font-size:12px;">✓ 已填写 — 请自行逐条对比匹配</span>';
        }
        html += '</div>';
        html += '</div>';
    }

    html += '<div style="display:flex;gap:12px;margin-top:16px;">';
    html += '<button onclick="window.frameworkAnswerTrainer._goStep2()" style="padding:10px 24px;background:#fff;color:#555;border:2px solid #ddd;border-radius:8px;font-size:14px;cursor:pointer;">← 返回修改</button>';
    html += '<button onclick="window.frameworkAnswerTrainer._goStep4()" style="padding:10px 28px;background:#1a73e8;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer;">查看详细解析 →</button>';
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

    var html = '<div style="padding:20px;">';
    html += '<h3 style="color:#333;margin-bottom:12px;">Step 4: 详细解析</h3>';

    // 总分展示
    var gradeColor = totalScore>=8?'#0d7a3e':(totalScore>=5?'#e65100':'#e53935');
    var gradeText = totalScore>=8?'优秀':(totalScore>=5?'良好':'需加强');
    html += '<div style="text-align:center;padding:20px;margin-bottom:16px;background:#f5f5f5;border-radius:12px;">';
    html += '<div style="font-size:36px;font-weight:700;color:'+gradeColor+';">'+totalScore+'<span style="font-size:16px;"> / 10</span></div>';
    html += '<div style="font-size:16px;color:'+gradeColor+';margin-top:4px;">'+gradeText+'</div>';
    html += '</div>';

    // 每步得分
    html += '<div style="margin-bottom:20px;">';
    html += '<h4 style="color:#333;margin-bottom:8px;">📊 各步骤得分</h4>';
    for(var j=0;j<steps.length;j++){
        var maxS = sp[modelKeys[j]]||Math.floor(10/steps.length);
        html += '<div style="display:flex;align-items:center;margin-bottom:8px;">';
        html += '<span style="width:120px;font-size:13px;color:#555;">步骤'+(j+1)+'：'+steps[j]+'</span>';
        html += '<div style="flex:1;height:20px;background:#e0e0e0;border-radius:10px;overflow:hidden;margin:0 8px;">';
        html += '<div style="height:100%;width:'+(stepScores[j]/maxS*100)+'%;background:'+getSubjectColor(q.subject)+';border-radius:10px;"></div>';
        html += '</div>';
        html += '<span style="font-size:13px;font-weight:600;color:#333;">'+stepScores[j]+'/'+maxS+'</span>';
        html += '</div>';
    }
    html += '</div>';

    // 逻辑结构评价
    html += '<div style="background:#f0f4ff;padding:14px 16px;border-radius:10px;margin-bottom:14px;">';
    html += '<h4 style="color:#1a73e8;margin:0 0 6px 0;">🧠 逻辑结构评价</h4>';
    html += '<p style="margin:0;color:#555;font-size:14px;line-height:1.6;">框架类型为<strong>'+FRAMEWORKS[q.framework].name+'</strong>，其核心逻辑在于按'+(q.framework==='原因分析'?'"原理→过程→结论"':'（请参照标准答案的步骤组织）')+'的因果链条组织答题。请将你的答案与标准答案逐步骤对照，检查是否每个步骤都涵盖了相应的得分关键点。</p>';
    html += '</div>';

    // 关键得分点
    html += '<div style="background:#fff9f0;padding:14px 16px;border-radius:10px;margin-bottom:14px;">';
    html += '<h4 style="color:#e65100;margin:0 0 6px 0;">🎯 得分关键词</h4>';
    html += '<p style="margin:0;color:#555;font-size:14px;">'+q.keyPoints.join('、')+'</p>';
    html += '</div>';

    // 常见失分点
    html += '<div style="background:#fff0f0;padding:14px 16px;border-radius:10px;margin-bottom:14px;">';
    html += '<h4 style="color:#e53935;margin:0 0 6px 0;">⚠️ 常见失分点</h4>';
    html += '<p style="margin:0;color:#555;font-size:14px;line-height:1.6;">'+q.commonErrors+'</p>';
    html += '</div>';

    html += '<div style="display:flex;gap:12px;margin-top:16px;">';
    html += '<button onclick="window.frameworkAnswerTrainer._goStep3()" style="padding:10px 24px;background:#fff;color:#555;border:2px solid #ddd;border-radius:8px;font-size:14px;cursor:pointer;">← 返回对比</button>';
    html += '<button onclick="window.frameworkAnswerTrainer._reset()" style="padding:10px 28px;background:#1a73e8;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer;">做下一题</button>';
    html += '</div>';

    html += '</div>';
    return html;
}

function render(){
    var container = document.getElementById('framework-trainer-app');
    if(!container) return;
    var html = '';
    if(state.currentStep===1) html = step1SelectQuestion();
    else if(state.currentStep===2) html = step2FillFramework();
    else if(state.currentStep===3) html = step3Compare();
    else if(state.currentStep===4) html = step4Analysis();
    container.innerHTML = html;
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
            container.innerHTML = '<div style="padding:40px;text-align:center;color:#666;">' +
                '<div style="font-size:24px;margin-bottom:12px;">⏳</div>' +
                '<div>题库重新加载中...</div></div>';
        }
        QuestionDataLoader.load()
            .then(function(){ if(container){ container.innerHTML=''; render(); } })
            .catch(function(){ /* 错误已由 init 处理 */ });
    }
};

window.frameworkAnswerTrainer = trainer;

// 初始化：加载题库后渲染
(function init(){
    var container = document.getElementById('framework-trainer-app');
    if(!container){
        // 容器未挂载，稍后重试
        setTimeout(init, 50);
        return;
    }
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#666;">' +
        '<div style="font-size:24px;margin-bottom:12px;">⏳</div>' +
        '<div>题库加载中...</div></div>';

    QuestionDataLoader.load()
        .then(function(){
            container.innerHTML = '';
            render();
        })
        .catch(function(){
            container.innerHTML = '<div style="padding:40px;text-align:center;color:#d32f2f;">' +
                '<div style="font-size:24px;margin-bottom:12px;">⚠️</div>' +
                '<div>题库加载失败，请检查网络后重试</div>' +
                '<button onclick="window.frameworkAnswerTrainer._retry()" style="margin-top:16px;padding:8px 16px;background:#1a73e8;color:#fff;border:none;border-radius:6px;cursor:pointer;">重试</button>' +
                '</div>';
        });
})();

})();

// ============================================================
// 模块2: experimentTable（教材实验六栏全表）
// ============================================================
(function(){
'use strict';

var SUBJECT_COLORS = { '物理': '#1a73e8', '化学': '#7b1fa2', '生物': '#0d7a3e' };
var COLUMNS = ['实验目的', '实验原理', '实验器材', '实验步骤', '现象与结论', '误差分析/注意事项'];

// ==================== 实验数据（18个实验，三科各6个） ====================
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

// ==================== 状态管理 ====================
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

    var html = '<div style="font-family:sans-serif;">';

    // 顶部：tab切换
    html += '<div style="display:flex;border-bottom:3px solid '+color+';margin-bottom:12px;">';
    var subjects = ['物理','化学','生物'];
    for(var i=0;i<subjects.length;i++){
        var s = subjects[i];
        var active = etState.currentSubject===s;
        html += '<div onclick="window.experimentTable._switchSubject(\''+s+'\')" style="'+
            'flex:1;text-align:center;padding:12px 8px;cursor:pointer;font-weight:'+(active?'700':'400')+';'+
            'color:'+(active?SUBJECT_COLORS[s]:'#999')+';border-bottom:'+(active?'3px solid '+SUBJECT_COLORS[s]:'3px solid transparent')+';'+
            'margin-bottom:-3px;transition:all 0.2s;font-size:15px;">'+s+'实验 ('+EXPERIMENTS[s].length+'个)</div>';
    }
    html += '</div>';

    // 工具栏
    html += '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:14px;">';
    // 筛选
    html += '<select onchange="window.experimentTable._filterModule(this.value)" style="padding:6px 12px;border:2px solid #ddd;border-radius:8px;font-size:13px;cursor:pointer;">';
    html += '<option value="all">全部实验</option>';
    var mods = getModulesForSubject(etState.currentSubject);
    for(var m=0;m<mods.length;m++){
        html += '<option value="'+mods[m]+'"'+(etState.filterModule===mods[m]?' selected':'')+'>'+mods[m]+'</option>';
    }
    html += '</select>';
    // 全覆盖按钮
    html += '<button onclick="window.experimentTable._toggleAll()" style="padding:6px 16px;border:2px solid '+color+';border-radius:8px;background:#fff;color:'+color+';cursor:pointer;font-size:13px;">'+(etState.expandedAll?'全部收起':'全部展开')+'</button>';
    // 导出按钮
    html += '<button onclick="window.experimentTable._exportAll()" style="padding:6px 16px;border:2px solid #28a745;border-radius:8px;background:#fff;color:#28a745;cursor:pointer;font-size:13px;">📋 导出纯文本</button>';
    html += '</div>';

    // 实验列表
    html += '<div style="max-height:500px;overflow-y:auto;">';
    for(var j=0;j<exps.length;j++){
        var exp = exps[j];
        if(etState.filterModule!=='all' && exp.module!==etState.filterModule) continue;
        var isOpen = etState.expandedAll;
        html += '<div style="margin-bottom:8px;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;">';
        // 标题栏
        html += '<div onclick="window.experimentTable._toggleExperiment(\''+exp.id+'\')" style="'+
            'padding:10px 14px;background:'+color+';color:#fff;cursor:pointer;display:flex;justify-content:space-between;align-items:center;">';
        html += '<span style="font-weight:600;font-size:14px;">'+(j+1)+'. '+exp['实验目的']+'</span>';
        html += '<span style="font-size:12px;opacity:0.9;">'+exp.module+' '+(isOpen?'▲':'▼')+'</span>';
        html += '</div>';
        // 表格内容
        html += '<div style="display:'+(isOpen?'block':'none')+';" id="exp-body-'+exp.id+'">';
        html += '<table style="width:100%;border-collapse:collapse;font-size:13px;">';
        for(var c=0;c<COLUMNS.length;c++){
            var col = COLUMNS[c];
            var colContent = exp[col]||'';
            html += '<tr style="border-bottom:1px solid #f0f0f0;">';
            html += '<td style="padding:8px 12px;background:#f9f9f9;font-weight:600;color:'+color+';width:120px;vertical-align:top;font-size:12px;">'+col+'</td>';
            html += '<td style="padding:8px 12px;line-height:1.7;color:#444;">'+colContent+'</td>';
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

// ============================================================
// 模块3: thinkingChain（大题解题思维链）
// ============================================================
(function(){
'use strict';

// ==================== 思维链题库（10道广东高考大题） ====================
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

// ==================== 状态管理 ====================
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

    var html = '<div style="display:flex;height:600px;font-family:sans-serif;gap:0;">';

    // 左侧：题目列表
    html += '<div style="width:280px;min-width:280px;border-right:1px solid #e0e0e0;overflow-y:auto;background:#fafafa;">';
    html += '<div style="padding:12px;background:#333;color:#fff;font-weight:600;font-size:14px;">📋 题目列表</div>';
    // 科目过滤
    html += '<div style="padding:8px 12px;display:flex;gap:6px;flex-wrap:wrap;">';
    var subFilters = ['all','物理','化学','生物'];
    for(var i=0;i<subFilters.length;i++){
        var sf = subFilters[i];
        var active = tcState.selectedSubject===sf;
        html += '<button onclick="window.thinkingChain._filterSubject(\''+sf+'\')" style="'+
            'padding:3px 10px;border:1px solid '+(active?'#1a73e8':'#ddd')+';border-radius:14px;font-size:11px;'+
            'background:'+(active?'#1a73e8':'#fff')+';color:'+(active?'#fff':'#555')+';cursor:pointer;">'+(sf==='all'?'全部':sf)+'</button>';
    }
    html += '</div>';
    for(var j=0;j<THINKING_QUESTIONS.length;j++){
        var q = THINKING_QUESTIONS[j];
        if(tcState.selectedSubject!=='all' && q.subject!==tcState.selectedSubject) continue;
        var isSelected = tcState.currentQuestion && tcState.currentQuestion.id===q.id;
        html += '<div onclick="window.thinkingChain._selectQuestion(\''+q.id+'\')" style="'+
            'padding:10px 12px;border-bottom:1px solid #eee;cursor:pointer;'+
            'background:'+(isSelected?'#e8f0fe':'#fff')+';border-left:'+(isSelected?'4px solid #1a73e8':'4px solid transparent')+';">';
        html += '<div style="font-size:11px;color:#888;">'+q.subject+' · '+q.year+'</div>';
        html += '<div style="font-size:13px;font-weight:600;color:#333;">'+q.title+'</div>';
        html += '</div>';
    }
    html += '</div>';

    // 中间：思维链SVG可视化
    html += '<div style="flex:1;overflow-y:auto;padding:16px;background:#fff;">';
    if(tcState.currentQuestion){
        html += '<h3 style="color:#333;margin:0 0 16px 0;font-size:16px;">'+tcState.currentQuestion.title+'</h3>';
        html += renderSVGChain(tcState.currentQuestion);
    } else {
        html += '<div style="text-align:center;color:#999;padding-top:200px;">👈 请从左侧选择一道题目开始分析</div>';
    }
    html += '</div>';

    // 右侧：详情面板
    html += '<div style="width:300px;min-width:300px;border-left:1px solid #e0e0e0;overflow-y:auto;background:#fafafa;padding:16px;">';
    if(tcState.currentQuestion && tcState.currentQuestion.thinkingSteps[tcState.currentStepIndex]){
        var step = tcState.currentQuestion.thinkingSteps[tcState.currentStepIndex];
        html += '<h4 style="color:#1a73e8;margin:0 0 12px 0;">步骤 '+(tcState.currentStepIndex+1)+'/'+tcState.currentQuestion.thinkingSteps.length+'</h4>';
        html += '<div style="background:#fff;padding:12px;border-radius:8px;margin-bottom:10px;border:1px solid #e0e0e0;">';
        html += '<div style="font-size:12px;color:#888;margin-bottom:4px;">📌 看到条件</div>';
        html += '<div style="font-size:13px;color:#333;">'+step.condition+'</div>';
        html += '</div>';
        html += '<div style="background:#e8f5e9;padding:12px;border-radius:8px;margin-bottom:10px;border:1px solid #c8e6c9;">';
        html += '<div style="font-size:12px;color:#2e7d32;margin-bottom:4px;">💡 应该想到</div>';
        html += '<div style="font-size:13px;color:#333;">'+step.think+'</div>';
        html += '</div>';
        html += '<div style="background:#fff3e0;padding:12px;border-radius:8px;margin-bottom:10px;border:1px solid #ffe0b2;">';
        html += '<div style="font-size:12px;color:#e65100;margin-bottom:4px;">🤔 为什么这样想</div>';
        html += '<div style="font-size:13px;color:#333;">'+step.why+'</div>';
        html += '</div>';
        html += '<div style="background:#e3f2fd;padding:12px;border-radius:8px;margin-bottom:10px;border:1px solid #bbdefb;">';
        html += '<div style="font-size:12px;color:#1565c0;margin-bottom:4px;">➡️ 下一步</div>';
        html += '<div style="font-size:13px;color:#333;">'+step.next+'</div>';
        html += '</div>';
        html += '<div style="background:#fce4ec;padding:12px;border-radius:8px;margin-bottom:10px;border:1px solid #f8bbd0;">';
        html += '<div style="font-size:12px;color:#c62828;margin-bottom:4px;">⚠️ 可能的弯路</div>';
        html += '<div style="font-size:13px;color:#333;">'+step.pitfall+'</div>';
        html += '</div>';
    }
    html += '</div>';

    html += '</div>';

    // 底部：控制栏
    if(tcState.currentQuestion){
        html += '<div style="display:flex;align-items:center;justify-content:center;gap:16px;padding:12px;background:#f5f5f5;border-top:1px solid #e0e0e0;">';
        html += '<button onclick="window.thinkingChain._prevStep()" style="padding:8px 18px;background:'+(tcState.currentStepIndex>0?'#1a73e8':'#ccc')+';color:#fff;border:none;border-radius:6px;cursor:'+(tcState.currentStepIndex>0?'pointer':'default')+';" '+(tcState.currentStepIndex>0?'':'disabled')+'>◀ 上一步</button>';
        html += '<span style="font-size:13px;color:#555;">步骤 '+(tcState.currentStepIndex+1)+' / '+tcState.currentQuestion.thinkingSteps.length+'</span>';
        html += '<button onclick="window.thinkingChain._nextStep()" style="padding:8px 18px;background:'+(tcState.currentStepIndex<tcState.currentQuestion.thinkingSteps.length-1?'#1a73e8':'#ccc')+';color:#fff;border:none;border-radius:6px;cursor:'+(tcState.currentStepIndex<tcState.currentQuestion.thinkingSteps.length-1?'pointer':'default')+';" '+(tcState.currentStepIndex<tcState.currentQuestion.thinkingSteps.length-1?'':'disabled')+'>下一步 ▶</button>';
        html += '<button onclick="window.thinkingChain._autoPlay()" style="padding:8px 18px;background:'+(tcState.autoPlaying?'#e53935':'#0d7a3e')+';color:#fff;border:none;border-radius:6px;cursor:pointer;">'+(tcState.autoPlaying?'⏸ 停止':'▶ 自动播放')+'</button>';
        html += '<button onclick="window.thinkingChain._showAnswer()" style="padding:8px 18px;background:#7b1fa2;color:#fff;border:none;border-radius:6px;cursor:pointer;">📝 完整答案</button>';
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

    var svg = '<svg width="'+svgW+'" height="'+totalH+'" style="display:block;margin:0 auto;">';
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

// ============================================================
// 模块4: variationRecommender（变式题推荐系统）
// ============================================================
(function(){
'use strict';

var LS_KEY_VR = 'hspcb_variation_history';

// ==================== 变式题库数据加载器（动态加载 data/variation-bank.json） ====================
var VariationDataLoader = {
    _cache: null,
    _loadingPromise: null,
    _dataUrl: '../data/variation-bank.json',

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

// ==================== 推荐引擎 ====================
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

// ==================== 状态管理 ====================
var vrState = {
    selectedGroup: null,
    selectedQuestion: null,
    showAnswer: {},
    userAnswers: {}
};

function loadVRHistory(){
    try { var raw = localStorage.getItem(LS_KEY_VR); return raw ? JSON.parse(raw) : {}; }
    catch(e){ return {}; }
}

function saveVRHistory(qid){
    var h = loadVRHistory();
    h[qid] = true;
    try { localStorage.setItem(LS_KEY_VR, JSON.stringify(h)); } catch(e){}
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

function renderVariationRecommender(){
    var container = document.getElementById('variation-rec-app');
    if(!container) return;

    var html = '<div style="display:flex;font-family:sans-serif;min-height:500px;">';

    // 左侧：知识点分组列表
    html += '<div style="width:220px;min-width:220px;border-right:1px solid #e0e0e0;overflow-y:auto;background:#fafafa;">';
    html += '<div style="padding:12px;background:#333;color:#fff;font-weight:600;font-size:14px;">📚 知识点分类</div>';
    var groups = getKnowledgeGroups();
    var bank = VariationDataLoader.getCached();
    for(var i=0;i<groups.length;i++){
        var g = groups[i];
        var subj = getSubjectForGroup(g);
        var active = vrState.selectedGroup===g;
        var count = 0;
        for(var k=0;k<bank.length;k++){ if(bank[k].knowledge===g) count++; }
        html += '<div onclick="window.variationRecommender._selectGroup(\''+g+'\')" style="'+
            'padding:10px 12px;border-bottom:1px solid #eee;cursor:pointer;'+
            'background:'+(active?'#e8f0fe':'#fff')+';border-left:'+(active?'4px solid '+getSubjectColor2(subj):'4px solid transparent')+';">';
        html += '<div style="font-size:12px;color:'+getSubjectColor2(subj)+';font-weight:600;">'+subj+'</div>';
        html += '<div style="font-size:13px;color:#333;">'+g+' ('+count+'题)</div>';
        html += '</div>';
    }
    html += '</div>';

    // 中间：题目展示区
    html += '<div style="flex:1;overflow-y:auto;padding:16px;background:#fff;">';
    if(vrState.selectedGroup){
        var groupQuestions = [];
        for(var q=0;q<bank.length;q++){
            if(bank[q].knowledge===vrState.selectedGroup) groupQuestions.push(bank[q]);
        }
        var subjCol = getSubjectColor2(getSubjectForGroup(vrState.selectedGroup));
        html += '<h3 style="color:'+subjCol+';font-size:16px;margin:0 0 4px 0;">'+vrState.selectedGroup+'</h3>';
        html += '<p style="color:#999;font-size:12px;margin:0 0 16px 0;">共 '+groupQuestions.length+' 道变式题</p>';

        for(var qi=0;qi<groupQuestions.length;qi++){
            var gq = groupQuestions[qi];
            var history = loadVRHistory();
            var isDone = history[gq.id];
            var isSelected = vrState.selectedQuestion && vrState.selectedQuestion.id===gq.id;

            html += '<div style="margin-bottom:12px;border:2px solid '+(isSelected?subjCol:'#e0e0e0')+';border-radius:10px;overflow:hidden;">';
            // 题目标题
            html += '<div onclick="window.variationRecommender._selectVarQuestion(\''+gq.id+'\')" style="'+
                'padding:10px 14px;background:'+(isSelected?subjCol:'#f5f5f5')+';color:'+(isSelected?'#fff':'#333')+';cursor:pointer;font-size:13px;font-weight:600;">';
            html += (qi+1)+'. '+gq.title;
            html += '<span style="float:right;font-size:11px;opacity:0.8;margin-left:8px;">难度：'+gq.difficulty+'</span>';
            if(isDone){ html += '<span style="float:right;font-size:11px;color:#4caf50;">✓ 已做</span>'; }
            html += '</div>';

            // 题目详情
            if(isSelected){
                html += '<div style="padding:14px;">';
                html += '<div style="font-size:14px;color:#333;line-height:1.7;margin-bottom:12px;">'+gq.question+'</div>';
                // 选项
                if(gq.options){
                    var opts = gq.options;
                    html += '<div style="margin-bottom:12px;">';
                    var optKeys = Object.keys(opts);
                    for(var oi=0;oi<optKeys.length;oi++){
                        var ok = optKeys[oi];
                        var userChoice = vrState.userAnswers[gq.id];
                        var isCorrect = vrState.showAnswer[gq.id] && ok===gq.answer;
                        var isWrong = vrState.showAnswer[gq.id] && userChoice===ok && ok!==gq.answer;
                        var bgColor = isCorrect?'#e8f5e9':(isWrong?'#ffebee':'#fafafa');
                        var borderColor = isCorrect?'#4caf50':(isWrong?'#e53935':'#e0e0e0');
                        html += '<div onclick="window.variationRecommender._chooseOption(\''+gq.id+'\',\''+ok+'\')" style="'+
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
                    html += '<button onclick="window.variationRecommender._checkAnswer(\''+gq.id+'\')" style="'+
                        'padding:8px 20px;background:'+subjCol+';color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">提交答案</button>';
                } else {
                    html += '<div style="background:#f0f4ff;padding:10px 14px;border-radius:8px;margin-top:8px;">';
                    html += '<div style="font-size:12px;color:'+subjCol+';font-weight:600;">📝 解析</div>';
                    html += '<div style="font-size:13px;color:#555;line-height:1.6;">'+gq.explanation+'</div>';
                    html += '</div>';
                    html += '<button onclick="window.variationRecommender._resetQuestion(\''+gq.id+'\')" style="'+
                        'margin-top:8px;padding:6px 16px;background:#fff;color:#555;border:1px solid #ddd;border-radius:6px;cursor:pointer;font-size:12px;">重新作答</button>';
                }
                html += '</div>';
            }
            html += '</div>';
        }
    } else {
        html += '<div style="text-align:center;color:#999;padding-top:200px;">👈 请从左侧选择一个知识点分组</div>';
    }
    html += '</div>';

    // 右侧：推荐变式题列表
    html += '<div style="width:240px;min-width:240px;border-left:1px solid #e0e0e0;overflow-y:auto;background:#fafafa;padding:12px;">';
    html += '<div style="font-weight:600;color:#333;font-size:14px;margin-bottom:12px;">🔗 变式推荐</div>';
    if(vrState.selectedQuestion){
        var related = getTagRelatedQuestions(vrState.selectedQuestion);
        if(related.length>0){
            for(var ri=0;ri<related.length;ri++){
                var rq = related[ri].question;
                html += '<div onclick="window.variationRecommender._selectVarQuestion(\''+rq.id+'\')" style="'+
                    'padding:8px 10px;margin-bottom:6px;border:1px solid #e0e0e0;border-radius:8px;cursor:pointer;'+
                    'background:#fff;transition:all 0.15s;">';
                html += '<div style="font-size:12px;font-weight:600;color:#333;">'+rq.title+'</div>';
                html += '<div style="font-size:11px;color:#888;margin-top:2px;">难度：'+rq.difficulty+' | 关联度：★★★★★</div>';
                html += '</div>';
            }
        } else {
            html += '<div style="color:#999;font-size:12px;">暂无同组变式题</div>';
        }
    } else {
        html += '<div style="color:#999;font-size:12px;">选择一道题目后<br>自动推荐变式题</div>';
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
            container.innerHTML = '<div style="padding:40px;text-align:center;color:#666;">' +
                '<div style="font-size:24px;margin-bottom:12px;">⏳</div>' +
                '<div>题库重新加载中...</div></div>';
        }
        VariationDataLoader.load()
            .then(function(){ if(container){ container.innerHTML=''; renderVariationRecommender(); } })
            .catch(function(){ /* 错误已由 init 处理 */ });
    }
};

window.variationRecommender = vrModule;

// 初始化：加载题库后渲染
(function init(){
    var container = document.getElementById('variation-rec-app');
    if(!container){
        setTimeout(init, 50);
        return;
    }
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#666;">' +
        '<div style="font-size:24px;margin-bottom:12px;">⏳</div>' +
        '<div>变式题库加载中...</div></div>';

    VariationDataLoader.load()
        .then(function(){
            container.innerHTML = '';
            renderVariationRecommender();
        })
        .catch(function(){
            container.innerHTML = '<div style="padding:40px;text-align:center;color:#d32f2f;">' +
                '<div style="font-size:24px;margin-bottom:12px;">⚠️</div>' +
                '<div>变式题库加载失败，请检查网络后重试</div>' +
                '<button onclick="window.variationRecommender._retry()" style="margin-top:16px;padding:8px 16px;background:#1a73e8;color:#fff;border:none;border-radius:6px;cursor:pointer;">重试</button>' +
                '</div>';
        });
})();

})();
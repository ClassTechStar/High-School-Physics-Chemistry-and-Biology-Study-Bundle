// 学习工具模块 - 热力图+术语速查+倒计时+学习报告

// ============================================================
// 模块1: examHeatmap（考点热力图可视化）
// ============================================================
var examHeatmap = {
    // 物理数据：10个考点 × 5年分值
    physicsData: [
        { name: '力与运动', scores: [14, 16, 14, 15, 16] },
        { name: '电磁感应', scores: [12, 14, 14, 16, 15] },
        { name: '带电粒子场中运动', scores: [12, 14, 16, 14, 14] },
        { name: '能量与动量', scores: [10, 12, 12, 14, 14] },
        { name: '电路实验', scores: [10, 10, 12, 12, 14] },
        { name: '热学', scores: [8, 10, 10, 10, 12] },
        { name: '光学', scores: [8, 8, 10, 10, 10] },
        { name: '原子物理', scores: [8, 10, 8, 10, 10] },
        { name: '实验设计', scores: [6, 8, 10, 12, 12] },
        { name: '振动与波', scores: [6, 8, 8, 8, 10] }
    ],
    // 化学数据
    chemistryData: [
        { name: '物质的量', scores: [12, 14, 14, 16, 16] },
        { name: '离子反应', scores: [10, 12, 12, 14, 14] },
        { name: '氧化还原', scores: [10, 12, 14, 12, 14] },
        { name: '元素化合物', scores: [14, 14, 16, 16, 14] },
        { name: '化学平衡', scores: [12, 14, 14, 16, 16] },
        { name: '电化学', scores: [8, 10, 12, 12, 14] },
        { name: '有机化学', scores: [6, 10, 12, 14, 16] },
        { name: '化学实验', scores: [10, 12, 12, 14, 14] },
        { name: '物质结构', scores: [8, 10, 10, 12, 12] },
        { name: '工业流程', scores: [8, 10, 12, 12, 14] }
    ],
    // 生物数据
    biologyData: [
        { name: '细胞结构与功能', scores: [10, 12, 12, 14, 14] },
        { name: '光合与呼吸', scores: [14, 16, 14, 16, 16] },
        { name: '遗传定律', scores: [12, 14, 16, 12, 14] },
        { name: '变异与进化', scores: [8, 10, 12, 10, 12] },
        { name: '神经体液调节', scores: [10, 12, 14, 12, 14] },
        { name: '免疫', scores: [6, 8, 10, 12, 12] },
        { name: '生态学', scores: [8, 10, 10, 12, 12] },
        { name: '基因工程', scores: [8, 10, 12, 14, 14] },
        { name: '实验设计', scores: [10, 12, 12, 14, 14] },
        { name: '图表分析', scores: [6, 8, 10, 12, 12] }
    ],
    activeTab: 'physics',
    highlightedRow: -1,
    hoveredCell: null,

    render: function() {
        var app = document.getElementById('exam-heatmap-app');
        if (!app) return;
        this._renderUI(app);
    },

    _renderUI: function(app) {
        var self = this;
        var tabs = [
            { key: 'physics', label: '🔵 物理' },
            { key: 'chemistry', label: '🟢 化学' },
            { key: 'biology', label: '🟠 生物' }
        ];

        var tabHTML = '';
        for (var i = 0; i < tabs.length; i++) {
            var t = tabs[i];
            var active = t.key === self.activeTab ? 'background:#3b82f6;color:#fff;' : 'background:#f1f5f9;color:#475569;';
            tabHTML += '<button data-tab="' + t.key + '" style="padding:8px 18px;border:0;border-radius:6px;cursor:pointer;margin-right:8px;font-size:14px;font-weight:600;' + active + '">' + t.label + '</button>';
        }

        var svgHTML = this._buildHeatmapSVG();

        app.innerHTML =
            '<div style="max-width:900px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;">' +
            '<h3 style="margin:0 0 4px;color:#0f172a;">📊 高考考点频次热力图</h3>' +
            '<p style="margin:0 0 16px;color:#64748b;font-size:13px;">横轴：年份 &nbsp;|&nbsp; 纵轴：考点 &nbsp;|&nbsp; 颜色越深分值越高 &nbsp;|&nbsp; 点击行高亮查看趋势</p>' +
            '<div style="margin-bottom:16px;">' + tabHTML + '</div>' +
            '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;overflow-x:auto;">' +
            svgHTML + '</div>' +
            this._buildLegend() +
            '<div style="margin-top:14px;padding:12px 16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;font-size:13px;color:#334155;line-height:1.8;">' +
            '<strong>📈 趋势分析：</strong><br>' + this._generateTrendText() + '</div>' +
            '</div>';

        this._bindTabEvents(app);
    },

    _buildHeatmapSVG: function() {
        var self = this;
        var data = self.activeTab === 'physics' ? self.physicsData :
                   self.activeTab === 'chemistry' ? self.chemistryData : self.biologyData;
        var years = ['2022', '2023', '2024', '2025', '2026'];
        var cellW = 80, cellH = 36;
        var leftPad = 140, topPad = 40, rightPad = 20, bottomPad = 10;
        var svgW = leftPad + cellW * 5 + rightPad;
        var svgH = topPad + cellH * 10 + bottomPad;

        var svg = '<svg width="' + svgW + '" height="' + svgH + '" viewBox="0 0 ' + svgW + ' ' + svgH + '" style="font-family:Arial,sans-serif;">';

        // 年份标签
        for (var y = 0; y < 5; y++) {
            svg += '<text x="' + (leftPad + y * cellW + cellW/2) + '" y="' + (topPad - 10) + '" text-anchor="middle" font-size="12" fill="#64748b" font-weight="600">' + years[y] + '</text>';
        }

        // 每个格子
        for (var r = 0; r < data.length; r++) {
            var row = data[r];
            // 考点名（左侧）
            var rowHL = self.highlightedRow === r;
            svg += '<text x="' + (leftPad - 10) + '" y="' + (topPad + r * cellH + cellH/2 + 4) + '" text-anchor="end" font-size="12" fill="' + (rowHL ? '#1e40af' : '#334155') + '" font-weight="' + (rowHL ? '700' : '500') + '" style="cursor:pointer;" data-row="' + r + '">' + row.name + '</text>';

            for (var c = 0; c < 5; c++) {
                var score = row.scores[c];
                var color = self._getColor(score);
                var x = leftPad + c * cellW;
                var y = topPad + r * cellH;
                var rx = 4;
                var cellHL = self.highlightedRow === r;
                svg += '<rect x="' + x + '" y="' + y + '" width="' + (cellW - 4) + '" height="' + (cellH - 4) + '" rx="' + rx + '" fill="' + color + '" stroke="' + (cellHL ? '#1e40af' : '#e2e8f0') + '" stroke-width="' + (cellHL ? '2' : '1') + '" style="cursor:pointer;" data-row="' + r + '" data-col="' + c + '" data-name="' + row.name + '" data-year="' + years[c] + '" data-score="' + score + '"/>';
                svg += '<text x="' + (x + (cellW - 4)/2) + '" y="' + (y + (cellH - 4)/2 + 4) + '" text-anchor="middle" font-size="13" font-weight="700" fill="' + (score >= 12 ? '#fff' : '#1e293b') + '" style="pointer-events:none;">' + score + '</text>';
            }
        }
        svg += '</svg>';
        return svg;
    },

    _getColor: function(score) {
        if (score >= 15) return '#ef4444'; // 红色
        if (score >= 12) return '#1e40af'; // 深蓝
        if (score >= 8) return '#3b82f6';  // 中蓝
        if (score >= 4) return '#93c5fd';  // 浅蓝
        return '#f8fafc';                   // 白色
    },

    _buildLegend: function() {
        return '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;font-size:12px;color:#475569;align-items:center;">' +
            '<span style="font-weight:600;">图例：</span>' +
            '<span style="display:inline-block;width:18px;height:18px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:3px;vertical-align:middle;"></span> 0-3分' +
            '<span style="display:inline-block;width:18px;height:18px;background:#93c5fd;border:1px solid #cbd5e1;border-radius:3px;vertical-align:middle;"></span> 4-7分' +
            '<span style="display:inline-block;width:18px;height:18px;background:#3b82f6;border:1px solid #cbd5e1;border-radius:3px;vertical-align:middle;"></span> 8-11分' +
            '<span style="display:inline-block;width:18px;height:18px;background:#1e40af;border:1px solid #cbd5e1;border-radius:3px;vertical-align:middle;"></span> 12-14分' +
            '<span style="display:inline-block;width:18px;height:18px;background:#ef4444;border:1px solid #cbd5e1;border-radius:3px;vertical-align:middle;"></span> 15+分' +
            '</div>';
    },

    _generateTrendText: function() {
        var data = this.activeTab === 'physics' ? this.physicsData :
                   this.activeTab === 'chemistry' ? this.chemistryData : this.biologyData;
        var lines = [];

        for (var i = 0; i < data.length; i++) {
            var scores = data[i].scores;
            var name = data[i].name;
            var allHigh = true;
            var increasing = true;
            for (var j = 0; j < scores.length; j++) {
                if (scores[j] < 10) allHigh = false;
                if (j > 0 && scores[j] < scores[j-1]) increasing = false;
            }
            if (allHigh) {
                lines.push('🔥 <strong>' + name + '</strong>：年年考10+分，是绝对核心考点');
            }
            if (increasing && scores[scores.length-1] >= 14) {
                lines.push('📈 <strong>' + name + '</strong>：分值逐年上升，趋势增强');
            }
            // 检查波动
            var maxV = Math.max.apply(null, scores);
            var minV = Math.min.apply(null, scores);
            if (maxV - minV >= 4) {
                lines.push('📊 <strong>' + name + '</strong>：分值波动较大(' + minV + '-' + maxV + '分)，需保持关注');
            }
        }
        if (lines.length === 0) {
            lines.push('各考点分值分布较为均匀，建议全面复习。');
        }
        return lines.slice(0, 8).join('<br>');
    },

    _bindTabEvents: function(app) {
        var self = this;
        var tabs = app.querySelectorAll('[data-tab]');
        for (var i = 0; i < tabs.length; i++) {
            (function(tab) {
                tab.addEventListener('click', function() {
                    self.activeTab = this.getAttribute('data-tab');
                    self.highlightedRow = -1;
                    self._renderUI(app);
                });
            })(tabs[i]);
        }

        // Click cells to highlight row
        var rects = app.querySelectorAll('rect[data-row]');
        for (var j = 0; j < rects.length; j++) {
            (function(rect) {
                rect.addEventListener('click', function() {
                    var row = parseInt(this.getAttribute('data-row'));
                    self.highlightedRow = (self.highlightedRow === row) ? -1 : row;
                    self._renderUI(app);
                });
            })(rects[j]);
        }

        // Click text labels to highlight row
        var texts = app.querySelectorAll('text[data-row]');
        for (var k = 0; k < texts.length; k++) {
            (function(text) {
                text.addEventListener('click', function() {
                    var row = parseInt(this.getAttribute('data-row'));
                    self.highlightedRow = (self.highlightedRow === row) ? -1 : row;
                    self._renderUI(app);
                });
            })(texts[k]);
        }

        // Hover tooltip
        for (var m = 0; m < rects.length; m++) {
            (function(rect) {
                rect.addEventListener('mouseenter', function(e) {
                    var name = this.getAttribute('data-name');
                    var year = this.getAttribute('data-year');
                    var score = this.getAttribute('data-score');
                    var tooltip = document.getElementById('heatmap-tooltip');
                    if (!tooltip) {
                        tooltip = document.createElement('div');
                        tooltip.id = 'heatmap-tooltip';
                        tooltip.style.cssText = 'position:fixed;background:#1e293b;color:#fff;padding:8px 14px;border-radius:6px;font-size:13px;pointer-events:none;z-index:9999;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
                        document.body.appendChild(tooltip);
                    }
                    tooltip.innerHTML = '<strong>' + name + '</strong><br>' + year + '年考分：<strong style="color:#60a5fa;">' + score + '分</strong>';
                    tooltip.style.display = 'block';
                });
                rect.addEventListener('mousemove', function(e) {
                    var tooltip = document.getElementById('heatmap-tooltip');
                    if (tooltip) {
                        tooltip.style.left = (e.clientX + 15) + 'px';
                        tooltip.style.top = (e.clientY - 40) + 'px';
                    }
                });
                rect.addEventListener('mouseleave', function() {
                    var tooltip = document.getElementById('heatmap-tooltip');
                    if (tooltip) tooltip.style.display = 'none';
                });
            })(rects[m]);
        }
    }
};

// ============================================================
// 模块2: terminologyChecker（高考专业术语/易错字速查系统）
// ============================================================
var terminologyChecker = {
    mode: 'search', // 'search' | 'practice' | 'quiz'

    bioTerms: [
        { correct: '类囊体', wrong: '内囊体', explain: '叶绿体内膜折叠形成的扁平囊状结构，\"类\"意为类似' },
        { correct: '突触', wrong: '突柚', explain: '神经元之间的连接部位，\"触\"表示接触' },
        { correct: '噬菌体', wrong: '噬菌休', explain: '侵染细菌的病毒，\"体\"表示生命体的形态' },
        { correct: '双缩脲', wrong: '双缩尿', explain: '蛋白质检测试剂，\"脲\"为urea音译，不是\"尿\"' },
        { correct: '纺锤体', wrong: '纺垂', explain: '细胞分裂时出现的纺锤状结构，\"锤\"指形状像锤子' },
        { correct: '液泡', wrong: '液胞', explain: '植物细胞中的液态细胞器，\"泡\"表示囊泡状' },
        { correct: '嘌呤', wrong: '嘌吟', explain: '核酸碱基之一，呤(líng)字注意读音' },
        { correct: '嘧啶', wrong: '嘧定', explain: '核酸碱基之一，啶(dìng)字注意写法' },
        { correct: '肽键', wrong: '钛键', explain: '氨基酸间的化学键，\"肽\"从月肉旁，与蛋白质相关' },
        { correct: '羧基', wrong: '梭基', explain: '-COOH，\"羧\"suō，有机酸官能团' },
        { correct: '斐林试剂', wrong: '菲林试剂', explain: 'Fehling试剂音译，检测还原糖' },
        { correct: '丙酮酸', wrong: '丙铜酸', explain: '糖代谢中间产物，\"酮\"tóng，含羰基' }
    ],

    chemTerms: [
        { correct: '坩埚', wrong: '坩锅', explain: '高温加热容器，\"埚\"从土旁，与陶土相关' },
        { correct: '酯化', wrong: '脂化', explain: '酸与醇生成酯的反应，\"酯\"是有机化合物类别' },
        { correct: '氨/铵/胺', wrong: '', explain: '氨(NH₃气体)、铵(NH₄⁺离子)、胺(R-NH₂有机物)，三字不可混用' },
        { correct: '过滤', wrong: '过泸', explain: '分离固液的操作，\"滤\"从水旁，与水有关' },
        { correct: '萃取', wrong: '翠取', explain: '利用溶解度差异分离物质，\"萃\"意为聚集' },
        { correct: '蒸馏', wrong: '蒸溜', explain: '利用沸点差异分离液体，\"馏\"表示分馏' },
        { correct: '滴定', wrong: '滴淀', explain: '定量分析操作，\"定\"表示确定浓度' },
        { correct: '灼烧', wrong: '酌烧', explain: '高温加热操作，\"灼\"zhuó，表示火烤' },
        { correct: '量筒', wrong: '', explain: '量筒用于量取液体体积，容量瓶用于配制溶液，不可混用' },
        { correct: '研钵', wrong: '研体', explain: '研磨固体的工具，\"钵\"bō，容器类' },
        { correct: '褪色', wrong: '退色', explain: '颜色褪去，\"褪\"tuì，衣字旁，与颜色变化相关' },
        { correct: '中和', wrong: '中合', explain: '酸与碱反应，\"和\"hé，表示调和' }
    ],

    physTerms: [
        { correct: '向心力', wrong: '向新力', explain: '指向圆心的力，\"心\"表示圆心方向' },
        { correct: '匀速圆周', wrong: '匀速周围', explain: '速度大小不变的圆周运动，\"周\"指圆周' },
        { correct: '电磁感应', wrong: '电磁感映', explain: '磁通量变化产生电动势，\"应\"yìng，响应之意' },
        { correct: '简谐运动', wrong: '简协运动', explain: '最简单的振动形式，\"谐\"xié，和谐之意' },
        { correct: '偏振', wrong: '偏震', explain: '波振动方向偏向一侧，\"振\"zhèn，振动相关' },
        { correct: '衍射', wrong: '衍涉', explain: '波绕过障碍物的现象，\"射\"表示发散' },
        { correct: '干涉', wrong: '干涉', explain: '波叠加产生明暗条纹，\"涉\"表示相互影响' },
        { correct: '摩擦因数', wrong: '摩擦系数', explain: '教材规范用语为\"动摩擦因数\"，非\"摩擦系数\"' }
    ],

    quizQuestions: [
        {
            sentence: '叶绿体中的__体是光合作用光反应的场所',
            wrongOption: '内囊',
            correctOption: '类囊',
            tip: '类囊体：\"类\"意为类似囊状的膜结构，记住\"类似囊状体\"'
        },
        {
            sentence: '蛋白质检测用__试剂，反应后呈紫色',
            wrongOption: '双缩尿',
            correctOption: '双缩脲',
            tip: '双缩脲：\"脲\"为urea音译字，含氮有机化合物，非\"尿\"'
        },
        {
            sentence: '加热固体药品应使用__，不可用烧杯',
            wrongOption: '坩锅',
            correctOption: '坩埚',
            tip: '坩埚：从\"土\"旁，陶土烧制而成，高温容器'
        },
        {
            sentence: '酸与醇反应生成__的反应称为__化反应',
            wrongOption: '脂',
            correctOption: '酯',
            tip: '酯化反应：酯(R-COO-R\')是有机物类别，脂是脂肪的简称，两者不同'
        },
        {
            sentence: '做__运动时，物体所受合力指向圆心',
            wrongOption: '匀速周围',
            correctOption: '匀速圆周',
            tip: '匀速圆周运动：\"圆周\"表示运动轨迹是圆形'
        },
        {
            sentence: 'DNA分子中，__与嘧啶通过氢键配对',
            wrongOption: '嘌吟',
            correctOption: '嘌呤',
            tip: '嘌呤(líng)：注意右边不是\"令\"而是\"令\"，嘧啶也是口字旁'
        },
        {
            sentence: '分离液体混合物常用__方法',
            wrongOption: '蒸溜',
            correctOption: '蒸馏',
            tip: '蒸馏：\"馏\"表示分馏过程，酒字旁与水/液体相关'
        },
        {
            sentence: '氨基酸之间通过__连接形成多肽链',
            wrongOption: '钛键',
            correctOption: '肽键',
            tip: '肽键：\"肽\"从月(肉)旁，表示与蛋白质/氨基酸相关'
        },
        {
            sentence: '光通过狭缝发生__现象，形成明暗条纹',
            wrongOption: '衍涉',
            correctOption: '衍射',
            tip: '衍射：波绕过障碍物边缘的现象，\"射\"表示波向四周发散'
        },
        {
            sentence: '溴水__后变为无色，说明发生了加成反应',
            wrongOption: '退色',
            correctOption: '褪色',
            tip: '褪色：\"褪\"tuì，衣物褪色之意，化学中描述颜色消褪'
        }
    ],

    quizState: { current: 0, score: 0, answered: false, results: [] },

    render: function() {
        var app = document.getElementById('terminology-app');
        if (!app) return;
        var self = this;

        var modeBtns = [
            { key: 'search', label: '📖 术语速查' },
            { key: 'practice', label: '✏️ 错字修改' },
            { key: 'quiz', label: '🧪 填空选择' }
        ];

        var mbHTML = '';
        for (var i = 0; i < modeBtns.length; i++) {
            var m = modeBtns[i];
            var active = m.key === self.mode ? 'background:#3b82f6;color:#fff;' : 'background:#f1f5f9;color:#475569;';
            mbHTML += '<button data-mode="' + m.key + '" style="padding:8px 16px;border:0;border-radius:6px;cursor:pointer;margin-right:8px;font-size:13px;font-weight:600;' + active + '">' + m.label + '</button>';
        }

        var contentHTML = '';
        if (self.mode === 'search') {
            contentHTML = self._renderSearch();
        } else if (self.mode === 'practice') {
            contentHTML = self._renderPractice();
        } else {
            contentHTML = self._renderQuiz();
        }

        app.innerHTML = '<div style="max-width:850px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;">' +
            '<h3 style="margin:0 0 4px;color:#0f172a;">📝 高考专业术语/易错字速查</h3>' +
            '<p style="margin:0 0 14px;color:#64748b;font-size:13px;">收录三科高频易错术语，避免因字写错而丢分</p>' +
            '<div style="margin-bottom:16px;">' + mbHTML + '</div>' +
            contentHTML + '</div>';

        var btns = app.querySelectorAll('[data-mode]');
        for (var j = 0; j < btns.length; j++) {
            (function(btn) {
                btn.addEventListener('click', function() {
                    self.mode = this.getAttribute('data-mode');
                    if (self.mode === 'quiz') {
                        self.quizState = { current: 0, score: 0, answered: false, results: [] };
                    }
                    self.render();
                });
            })(btns[j]);
        }

        if (self.mode === 'search') {
            self._bindSearch(app);
        } else if (self.mode === 'practice') {
            self._bindPractice(app);
        } else {
            self._bindQuiz(app);
        }
    },

    _renderSearch: function() {
        var allTerms = this.bioTerms.concat(this.chemTerms).concat(this.physTerms);
        var html = '<input type="text" id="term-search-input" placeholder="🔍 搜索术语（如：类囊体、坩埚、向心力...）" style="width:100%;max-width:400px;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;margin-bottom:16px;outline:none;">' +
            '<div id="term-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">';

        for (var i = 0; i < allTerms.length; i++) {
            var t = allTerms[i];
            var subjectLabel = '';
            var subjectColor = '';
            if (i < 12) { subjectLabel = '生物'; subjectColor = '#059669'; }
            else if (i < 24) { subjectLabel = '化学'; subjectColor = '#2563eb'; }
            else { subjectLabel = '物理'; subjectColor = '#7c3aed'; }

            html += '<div class="term-card" data-term="' + t.correct + '" data-wrong="' + (t.wrong || '') + '" data-explain="' + t.explain.replace(/"/g, '&quot;') + '" style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;transition:all 0.2s;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                '<span style="font-weight:700;font-size:15px;color:#0f172a;">' + t.correct + '</span>' +
                '<span style="background:' + subjectColor + ';color:#fff;font-size:11px;padding:2px 8px;border-radius:10px;">' + subjectLabel + '</span></div>' +
                (t.wrong ? '<div style="font-size:12px;color:#ef4444;">⚠ 常见错误：<strong>' + t.wrong + '</strong></div>' : '') +
                '<div style="font-size:12px;color:#64748b;margin-top:4px;">' + t.explain + '</div></div>';
        }
        html += '</div>';
        return html;
    },

    _bindSearch: function(app) {
        var self = this;
        var input = document.getElementById('term-search-input');
        if (!input) return;
        input.addEventListener('input', function() {
            var query = this.value.toLowerCase();
            var cards = app.querySelectorAll('.term-card');
            for (var i = 0; i < cards.length; i++) {
                var term = (cards[i].getAttribute('data-term') || '').toLowerCase();
                var wrong = (cards[i].getAttribute('data-wrong') || '').toLowerCase();
                var explain = (cards[i].getAttribute('data-explain') || '').toLowerCase();
                if (term.indexOf(query) >= 0 || wrong.indexOf(query) >= 0 || explain.indexOf(query) >= 0) {
                    cards[i].style.display = '';
                } else {
                    cards[i].style.display = 'none';
                }
            }
        });
    },

    _renderPractice: function() {
        var self = this;
        var allTerms = this.bioTerms.concat(this.chemTerms).concat(this.physTerms);
        // Pick 8 random terms for practice
        var shuffled = [];
        var used = {};
        while (shuffled.length < 8 && shuffled.length < allTerms.length) {
            var idx = Math.floor(Math.random() * allTerms.length);
            if (!used[idx]) {
                used[idx] = true;
                shuffled.push(allTerms[idx]);
            }
        }

        var html = '<div style="margin-bottom:12px;font-size:13px;color:#475569;">📋 以下句子中可能含有错别字，请找出并说出正确写法（点击查看答案）</div>';
        for (var i = 0; i < shuffled.length; i++) {
            var t = shuffled[i];
            var practiceSentence = '';
            if (t.wrong) {
                practiceSentence = '在实验中，我们使用' + t.wrong + '来...（请找出错误）';
            } else {
                practiceSentence = '请写出\"' + t.correct + '\"在实验中的正确使用场景...';
            }
            html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:10px;">' +
                '<div style="font-size:14px;color:#1e293b;margin-bottom:8px;">' + (i+1) + '. ' + practiceSentence + '</div>' +
                '<button class="show-answer-btn" style="background:#fef3c7;color:#92400e;border:1px solid #fcd34d;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">💡 点我看答案</button>' +
                '<div class="practice-answer" style="display:none;margin-top:8px;padding:8px 12px;background:#f0fdf4;border-left:3px solid #22c55e;border-radius:4px;font-size:13px;">' +
                '<span style="color:#ef4444;text-decoration:line-through;">' + (t.wrong || '—') + '</span> → <strong style="color:#16a34a;">' + t.correct + '</strong><br>' +
                '<span style="color:#64748b;">' + t.explain + '</span></div></div>';
        }
        return html;
    },

    _bindPractice: function(app) {
        var btns = app.querySelectorAll('.show-answer-btn');
        for (var i = 0; i < btns.length; i++) {
            (function(btn) {
                btn.addEventListener('click', function() {
                    var answer = this.parentElement.querySelector('.practice-answer');
                    if (answer) answer.style.display = 'block';
                    this.style.display = 'none';
                });
            })(btns[i]);
        }
    },

    _renderQuiz: function() {
        var self = this;
        var qs = self.quizState;
        if (qs.current >= self.quizQuestions.length) {
            return self._renderQuizResult();
        }
        var q = self.quizQuestions[qs.current];
        var progress = '第 ' + (qs.current + 1) + '/' + self.quizQuestions.length + ' 题';

        var html = '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
            '<span style="font-weight:600;color:#3b82f6;">' + progress + '</span>' +
            '<span style="font-size:12px;color:#64748b;">已答对：' + qs.score + ' 题</span></div>' +
            '<div style="background:#f8fafc;padding:20px;border-radius:8px;margin-bottom:20px;font-size:16px;line-height:2;">' +
            q.sentence.replace('__', '<span style="background:#fef3c7;padding:2px 8px;border-radius:4px;font-weight:700;">____</span>') + '</div>' +
            '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">' +
            '<button class="quiz-opt" data-choice="correct" style="background:#f0fdf4;color:#16a34a;border:2px solid #86efac;padding:12px 28px;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;">' + q.correctOption + '</button>' +
            '<button class="quiz-opt" data-choice="wrong" style="background:#fef2f2;color:#dc2626;border:2px solid #fca5a5;padding:12px 28px;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;">' + q.wrongOption + '</button></div>' +
            '<div id="quiz-feedback" style="margin-top:16px;text-align:center;"></div>' +
            '<div style="margin-top:16px;text-align:center;"><button id="quiz-next" style="display:none;background:#3b82f6;color:#fff;border:0;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:14px;">' +
            (qs.current < self.quizQuestions.length - 1 ? '下一题 →' : '查看结果 🎉') + '</button></div></div>';

        return html;
    },

    _bindQuiz: function(app) {
        var self = this;
        var opts = app.querySelectorAll('.quiz-opt');
        for (var i = 0; i < opts.length; i++) {
            (function(opt) {
                opt.addEventListener('click', function() {
                    if (self.quizState.answered) return;
                    self.quizState.answered = true;
                    var choice = this.getAttribute('data-choice');
                    var q = self.quizQuestions[self.quizState.current];
                    var fb = document.getElementById('quiz-feedback');
                    var nextBtn = document.getElementById('quiz-next');
                    var isCorrect = (choice === 'correct');

                    if (isCorrect) {
                        self.quizState.score++;
                        fb.innerHTML = '<div style="color:#16a34a;font-size:32px;">✓</div><div style="color:#16a34a;font-weight:600;">回答正确！</div>';
                    } else {
                        fb.innerHTML = '<div style="color:#dc2626;font-size:32px;">✗</div><div style="color:#dc2626;">正确答案是：<strong>' + q.correctOption + '</strong></div><div style="color:#64748b;font-size:13px;margin-top:4px;">💡 ' + q.tip + '</div>';
                    }
                    self.quizState.results.push({ question: self.quizState.current, correct: isCorrect });
                    nextBtn.style.display = 'inline-block';

                    // Disable buttons
                    var allOpts = app.querySelectorAll('.quiz-opt');
                    for (var j = 0; j < allOpts.length; j++) {
                        allOpts[j].style.opacity = '0.5';
                        allOpts[j].style.cursor = 'default';
                    }
                    // Highlight the correct one
                    if (!isCorrect) {
                        var correctBtn = app.querySelector('.quiz-opt[data-choice="correct"]');
                        if (correctBtn) correctBtn.style.border = '3px solid #16a34a';
                    }
                });
            })(opts[i]);
        }

        var nextBtn = document.getElementById('quiz-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                self.quizState.current++;
                self.quizState.answered = false;
                self.render();
            });
        }
    },

    _renderQuizResult: function() {
        var qs = this.quizState;
        var total = this.quizQuestions.length;
        var pct = Math.round(qs.score / total * 100);
        var emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';

        var html = '<div style="text-align:center;padding:30px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;">' +
            '<div style="font-size:60px;margin-bottom:10px;">' + emoji + '</div>' +
            '<div style="font-size:24px;font-weight:700;color:#0f172a;">测试完成！</div>' +
            '<div style="font-size:48px;font-weight:700;color:#3b82f6;margin:12px 0;">' + qs.score + ' / ' + total + '</div>' +
            '<div style="font-size:16px;color:#64748b;">正确率 ' + pct + '%</div>' +
            '<div style="margin-top:16px;">' +
            (pct === 100 ? '<span style="color:#16a34a;">全部正确！你是术语大师！🏆</span>' :
             pct >= 80 ? '<span style="color:#16a34a;">非常棒！只有少量需要复习</span>' :
             pct >= 60 ? '<span style="color:#d97706;">不错！建议回顾上面的错误术语</span>' :
             '<span style="color:#dc2626;">需要多多练习哦！对照术语速查表学习吧</span>') +
            '</div>' +
            '<button id="quiz-retry" style="margin-top:20px;background:#3b82f6;color:#fff;border:0;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:14px;">🔄 重新测试</button></div>';

        // Bind retry after render
        setTimeout(function() {
            var retryBtn = document.getElementById('quiz-retry');
            if (retryBtn) {
                retryBtn.addEventListener('click', function() {
                    terminologyChecker.quizState = { current: 0, score: 0, answered: false, results: [] };
                    terminologyChecker.render();
                });
            }
        }, 50);

        return html;
    }
};

// ============================================================
// 模块3: countdownTaskSystem（高考倒计时+今日任务）
// ============================================================
var countdownTaskSystem = {
    targetDate: null,
    timerInterval: null,
    checkinData: {},

    render: function() {
        var app = document.getElementById('countdown-task-app');
        if (!app) return;
        var self = this;

        // 默认目标日期 2027-06-07
        if (!self.targetDate) {
            self.targetDate = new Date(2027, 5, 7); // June = 5 (0-indexed)
        }

        // Load checkin data
        var raw = localStorage.getItem('hspcb_daily_checkin');
        if (raw) {
            try { self.checkinData = JSON.parse(raw); } catch(e) { self.checkinData = {}; }
        }

        var now = new Date();
        var diffMs = self.targetDate.getTime() - now.getTime();
        var diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        diffDays = diffDays > 0 ? diffDays : 0;

        var reviewPhase = self._getReviewPhase(now);

        var html = '<div style="max-width:700px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;">' +
            // 倒计时
            '<div style="text-align:center;padding:30px 20px;background:linear-gradient(135deg,#1e40af,#3b82f6);border-radius:16px;color:#fff;margin-bottom:20px;">' +
            '<div style="font-size:14px;opacity:0.8;margin-bottom:8px;">距离2027年高考还有</div>' +
            '<div id="countdown-days" style="font-size:72px;font-weight:800;line-height:1;">' + diffDays + '</div>' +
            '<div style="font-size:20px;margin-top:4px;">天</div>' +
            '<div id="countdown-time" style="font-size:14px;opacity:0.8;margin-top:8px;"></div>' +
            '<div style="margin-top:12px;font-size:12px;opacity:0.7;">目标：2027年6月7日</div></div>' +

            // 复习阶段
            '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin-bottom:16px;">' +
            '<div style="font-weight:700;color:#0f172a;margin-bottom:4px;">📅 当前复习阶段：<span style="color:#3b82f6;">' + reviewPhase.name + '</span></div>' +
            '<div style="font-size:13px;color:#64748b;">' + reviewPhase.desc + '</div></div>' +

            // 今日任务
            '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin-bottom:16px;">' +
            '<div style="font-weight:700;color:#0f172a;margin-bottom:12px;">📋 今日任务推荐</div>' +
            self._renderTodayTasks(now) + '</div>' +

            // 打卡
            '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin-bottom:16px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">' +
            '<div style="font-weight:700;color:#0f172a;">✅ 今日打卡</div>' +
            self._renderCheckinButton() + '</div>' +
            self._renderCheckinStats() + '</div>' +

            // 打卡日历
            '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:18px;">' +
            '<div style="font-weight:700;color:#0f172a;margin-bottom:12px;">📆 本月打卡日历</div>' +
            self._renderMonthCalendar() + '</div></div>';

        app.innerHTML = html;

        // 启动计时器
        self._startTimer();
        self._bindCheckin();
    },

    _getReviewPhase: function(now) {
        var month = now.getMonth() + 1; // 1-12
        if (month >= 9 || month <= 12) return { name: '一轮复习', desc: '基础知识全覆盖，每天1个章节，打牢基础是关键' };
        if (month >= 1 && month <= 3) return { name: '二轮复习', desc: '专题突破阶段，每天1个专题，重点攻克薄弱环节' };
        if (month >= 4 && month <= 5) return { name: '三轮复习', desc: '模拟训练冲刺，每天1套卷，查漏补缺调整状态' };
        return { name: '自主复习', desc: '考前调整阶段，回顾错题，保持手感，调整心态' };
    },

    _renderTodayTasks: function(now) {
        var phase = this._getReviewPhase(now).name;
        var weekDay = now.getDay(); // 0=周日
        var tasks = [];
        var chapters = ['力学基础', '电磁学', '热学光学原子', '实验专题', '综合训练', '曲线运动', '动量能量'];
        var chemChapters = ['物质的量', '离子反应与氧化还原', '元素化合物', '化学平衡', '电化学', '有机化学', '化学实验'];
        var bioChapters = ['细胞代谢', '遗传与变异', '稳态与调节', '生态与进化', '基因工程', '实验设计', '图表分析'];

        var idx = Math.floor((now.getDate() - 1) / 4) % chapters.length;

        tasks.push('🔵 <strong>物理：</strong>' + (phase.indexOf('一轮') >= 0 ? '复习' + chapters[idx] : (phase.indexOf('二轮') >= 0 ? '专题突破' + chapters[idx] : '完成1套物理模拟卷')) + ' + 做3道综合题');
        tasks.push('🟢 <strong>化学：</strong>' + (phase.indexOf('一轮') >= 0 ? '复习' + chemChapters[idx] : (phase.indexOf('二轮') >= 0 ? '专题突破' + chemChapters[idx] : '完成1套化学模拟卷')) + ' + 做3道综合题');
        tasks.push('🟠 <strong>生物：</strong>' + (phase.indexOf('一轮') >= 0 ? '复习' + bioChapters[idx] : (phase.indexOf('二轮') >= 0 ? '专题突破' + bioChapters[idx] : '完成1套生物模拟卷')) + ' + 做3道综合题');
        tasks.push('📝 <strong>综合：</strong>整理今天所有错题到错题本，分析错因');
        if (weekDay === 6 || weekDay === 0) {
            tasks.push('📊 <strong>周末任务：</strong>回顾本周所有错题，做一次综合限时训练');
        }

        var html = '';
        for (var i = 0; i < tasks.length; i++) {
            html += '<div style="padding:8px 12px;background:#f8fafc;border-radius:6px;margin-bottom:6px;font-size:14px;border-left:3px solid #3b82f6;">' + tasks[i] + '</div>';
        }
        return html;
    },

    _renderCheckinButton: function() {
        var today = this._getDateKey(new Date());
        var checked = this.checkinData[today] === true;
        if (checked) {
            return '<button style="background:#86efac;color:#166534;border:0;padding:10px 24px;border-radius:8px;font-size:15px;font-weight:700;cursor:default;">✓ 今日已打卡</button>';
        }
        return '<button id="checkin-btn" style="background:#3b82f6;color:#fff;border:0;padding:10px 24px;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;">📌 今日打卡</button>';
    },

    _renderCheckinStats: function() {
        var self = this;
        var totalDays = Object.keys(self.checkinData).filter(function(k) { return self.checkinData[k] === true; }).length;
        var streak = self._calcStreak();

        // 最近7天
        var recentHTML = '<div style="display:flex;gap:6px;margin-top:4px;">';
        for (var i = 6; i >= 0; i--) {
            var d = new Date();
            d.setDate(d.getDate() - i);
            var key = self._getDateKey(d);
            var checked = self.checkinData[key] === true;
            recentHTML += '<span style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;' +
                (checked ? 'background:#16a34a;color:#fff;' : 'background:#f1f5f9;color:#cbd5e1;') + '">' +
                (checked ? '✓' : '·') + '</span>';
        }
        recentHTML += '</div>';

        return '<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:16px;align-items:center;">' +
            '<div style="text-align:center;padding:10px 16px;background:#fff7ed;border-radius:8px;border:1px solid #fed7aa;">' +
            '<div style="font-size:24px;">🔥</div>' +
            '<div style="font-size:22px;font-weight:700;color:#ea580c;">' + streak + '</div>' +
            '<div style="font-size:11px;color:#9a3412;">连续打卡(天)</div></div>' +
            '<div style="text-align:center;padding:10px 16px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">' +
            '<div style="font-size:22px;font-weight:700;color:#16a34a;">' + totalDays + '</div>' +
            '<div style="font-size:11px;color:#166534;">总打卡天数</div></div>' +
            '<div style="flex:1;min-width:180px;">' +
            '<div style="font-size:12px;color:#64748b;margin-bottom:4px;">最近7天</div>' + recentHTML + '</div></div>';
    },

    _renderMonthCalendar: function() {
        var self = this;
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth();
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var firstDay = new Date(year, month, 1).getDay(); // 0=周日

        var weekDayNames = ['日', '一', '二', '三', '四', '五', '六'];

        var html = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;">';
        for (var w = 0; w < 7; w++) {
            html += '<div style="font-size:12px;color:#94a3b8;font-weight:600;padding:4px;">' + weekDayNames[w] + '</div>';
        }
        // 空白格子
        for (var e = 0; e < firstDay; e++) {
            html += '<div style="padding:6px;"></div>';
        }
        // 日期格子
        for (var d = 1; d <= daysInMonth; d++) {
            var dateKey = year + '-' + self._pad(month + 1) + '-' + self._pad(d);
            var checked = self.checkinData[dateKey] === true;
            var isToday = (d === now.getDate());
            var bg = isToday ? '#3b82f6' : (checked ? '#16a34a' : '#f8fafc');
            var color = isToday ? '#fff' : (checked ? '#fff' : '#64748b');
            var weight = isToday ? '700' : '500';
            html += '<div style="padding:6px;font-size:12px;background:' + bg + ';color:' + color + ';font-weight:' + weight + ';border-radius:4px;">' +
                (checked ? '✓ ' + d : '' + d) + '</div>';
        }
        html += '</div>';
        return html;
    },

    _startTimer: function() {
        var self = this;
        if (self.timerInterval) clearInterval(self.timerInterval);
        self.timerInterval = setInterval(function() {
            var now = new Date();
            var diffMs = self.targetDate.getTime() - now.getTime();
            var diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            diffDays = diffDays > 0 ? diffDays : 0;
            var daysEl = document.getElementById('countdown-days');
            var timeEl = document.getElementById('countdown-time');
            if (daysEl) daysEl.textContent = diffDays;
            if (timeEl) {
                var hours = now.getHours();
                var mins = now.getMinutes();
                var secs = now.getSeconds();
                var remainingH = 23 - hours;
                var remainingM = 59 - mins;
                var remainingS = 59 - secs;
                timeEl.textContent = '今日剩余 ' + self._pad(remainingH) + ':' + self._pad(remainingM) + ':' + self._pad(remainingS);
            }
        }, 1000);
    },

    _bindCheckin: function() {
        var self = this;
        var btn = document.getElementById('checkin-btn');
        if (!btn) return;
        btn.addEventListener('click', function() {
            var today = self._getDateKey(new Date());
            self.checkinData[today] = true;
            localStorage.setItem('hspcb_daily_checkin', JSON.stringify(self.checkinData));
            self.render();
        });
    },

    _getDateKey: function(date) {
        return date.getFullYear() + '-' + this._pad(date.getMonth() + 1) + '-' + this._pad(date.getDate());
    },

    _pad: function(n) {
        return n < 10 ? '0' + n : '' + n;
    },

    _calcStreak: function() {
        var self = this;
        var streak = 0;
        var d = new Date();
        while (true) {
            var key = self._getDateKey(d);
            if (self.checkinData[key] === true) {
                streak++;
                d.setDate(d.getDate() - 1);
            } else {
                // 允许今天还没打卡的情况
                var today = self._getDateKey(new Date());
                if (key === today && self.checkinData[today] !== true && streak === 0) {
                    d.setDate(d.getDate() - 1);
                    continue;
                }
                break;
            }
        }
        return streak;
    }
};

// ============================================================
// 模块4: studyReport（学习报告生成器）
// ============================================================
var studyReport = {
    reportData: null,

    render: function() {
        var app = document.getElementById('study-report-app');
        if (!app) return;
        var self = this;

        var html = '<div style="max-width:800px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;">' +
            '<h3 style="margin:0 0 4px;color:#0f172a;">📊 学习报告生成器</h3>' +
            '<p style="margin:0 0 16px;color:#64748b;font-size:13px;">综合分析你的学习数据，生成个性化诊断报告</p>' +
            '<div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">' +
            '<button id="gen-report-btn" style="background:#3b82f6;color:#fff;border:0;padding:12px 28px;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;">📋 生成本周报告</button>' +
            '<button id="print-report-btn" style="background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;padding:12px 24px;border-radius:8px;cursor:pointer;display:none;font-size:14px;">🖨 打印报告</button>' +
            '<button id="clear-data-btn" style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;padding:12px 24px;border-radius:8px;cursor:pointer;font-size:14px;">🗑 清除数据</button></div>' +
            '<div id="report-content"></div></div>';

        app.innerHTML = html;

        document.getElementById('gen-report-btn').addEventListener('click', function() {
            self.generateReport();
        });
        document.getElementById('print-report-btn').addEventListener('click', function() {
            window.print();
        });
        document.getElementById('clear-data-btn').addEventListener('click', function() {
            if (confirm('确定要清除所有学习数据吗？此操作不可恢复！')) {
                localStorage.removeItem('hspcb_wrong_records');
                localStorage.removeItem('hspcb_quiz_records');
                localStorage.removeItem('hspcb_manual_mastery');
                localStorage.removeItem('hspcb_daily_checkin');
                self.reportData = null;
                document.getElementById('report-content').innerHTML = '';
                document.getElementById('print-report-btn').style.display = 'none';
                alert('数据已清除');
            }
        });
    },

    generateReport: function() {
        var self = this;
        var wrongRecords = self._loadJSON('hspcb_wrong_records', []);
        var quizRecords = self._loadJSON('hspcb_quiz_records', []);
        var masteryData = self._loadJSON('hspcb_manual_mastery', {});
        var checkinData = self._loadJSON('hspcb_daily_checkin', {});

        // 如果没有任何数据
        if (wrongRecords.length === 0 && quizRecords.length === 0 && Object.keys(masteryData).length === 0) {
            document.getElementById('report-content').innerHTML =
                '<div style="text-align:center;padding:40px;background:#fffbeb;border:2px dashed #fcd34d;border-radius:12px;">' +
                '<div style="font-size:48px;margin-bottom:12px;">📭</div>' +
                '<div style="font-size:18px;color:#92400e;font-weight:600;">继续做题来生成报告吧</div>' +
                '<div style="font-size:14px;color:#a16207;margin-top:8px;">还没有足够的学习数据，先去刷题吧！💪</div></div>';
            document.getElementById('print-report-btn').style.display = 'none';
            return;
        }

        var now = new Date();
        var weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        var lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        // 本周数据
        var thisWeekQuiz = self._filterByDate(quizRecords, weekStart, now);
        var thisWeekWrong = self._filterByDate(wrongRecords, weekStart, now);
        var lastWeekQuiz = self._filterByDate(quizRecords, lastWeekStart, weekStart);
        var lastWeekWrong = self._filterByDate(wrongRecords, lastWeekStart, weekStart);

        // 统计
        var thisWeekTotal = thisWeekQuiz.length;
        var thisWeekCorrect = 0;
        for (var i = 0; i < thisWeekQuiz.length; i++) {
            if (thisWeekQuiz[i].correct === true || thisWeekQuiz[i].isCorrect === true) thisWeekCorrect++;
        }
        var thisWeekAccuracy = thisWeekTotal > 0 ? Math.round(thisWeekCorrect / thisWeekTotal * 100) : 0;

        var lastWeekTotal = lastWeekQuiz.length;
        var lastWeekCorrect = 0;
        for (var j = 0; j < lastWeekQuiz.length; j++) {
            if (lastWeekQuiz[j].correct === true || lastWeekQuiz[j].isCorrect === true) lastWeekCorrect++;
        }
        var lastWeekAccuracy = lastWeekTotal > 0 ? Math.round(lastWeekCorrect / lastWeekTotal * 100) : 0;
        var accuracyChange = thisWeekAccuracy - lastWeekAccuracy;
        var totalCheckins = Object.keys(checkinData).filter(function(k) { return checkinData[k] === true; }).length;

        // 知识点掌握度
        var knowledgeMap = self._buildKnowledgeMap(quizRecords, masteryData);

        // 分科统计
        var subjectStats = self._calcSubjectStats(quizRecords, wrongRecords);

        // 最薄弱知识点TOP5
        var weakPoints = self._getWeakPoints(knowledgeMap);

        // 进步最大考点
        var improved = self._getImprovedPoints(quizRecords, lastWeekStart);

        var contentHTML = self._buildReportHTML({
            thisWeekTotal: thisWeekTotal,
            thisWeekAccuracy: thisWeekAccuracy,
            lastWeekAccuracy: lastWeekAccuracy,
            accuracyChange: accuracyChange,
            totalCheckins: totalCheckins,
            knowledgeMap: knowledgeMap,
            subjectStats: subjectStats,
            weakPoints: weakPoints,
            improved: improved,
            weekStart: weekStart
        });

        document.getElementById('report-content').innerHTML = contentHTML;
        document.getElementById('print-report-btn').style.display = 'inline-block';
        self.reportData = arguments;
    },

    _buildReportHTML: function(d) {
        var html = '';

        // 1. 概览卡片
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px;">';
        html += '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;text-align:center;">' +
            '<div style="font-size:12px;color:#64748b;">本周做题总数</div>' +
            '<div style="font-size:32px;font-weight:700;color:#1e40af;">' + d.thisWeekTotal + '</div></div>';
        html += '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;text-align:center;">' +
            '<div style="font-size:12px;color:#64748b;">正确率</div>' +
            '<div style="font-size:32px;font-weight:700;color:#16a34a;">' + d.thisWeekAccuracy + '%</div></div>';
        html += '<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px;text-align:center;">' +
            '<div style="font-size:12px;color:#64748b;">累计打卡</div>' +
            '<div style="font-size:32px;font-weight:700;color:#ea580c;">' + d.totalCheckins + '天</div></div>';
        var changeColor = d.accuracyChange >= 0 ? '#16a34a' : '#dc2626';
        var changeSign = d.accuracyChange >= 0 ? '+' : '';
        html += '<div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:16px;text-align:center;">' +
            '<div style="font-size:12px;color:#64748b;">vs 上周</div>' +
            '<div style="font-size:32px;font-weight:700;color:' + changeColor + ';">' + changeSign + d.accuracyChange + '%</div></div>';
        html += '</div>';

        // 各科分布
        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:20px;">';
        html += '<div style="font-weight:700;color:#0f172a;margin-bottom:10px;">📊 各科得分率预估</div>';
        var subjects = ['物理', '化学', '生物'];
        var colors = ['#3b82f6', '#16a34a', '#f59e0b'];
        for (var s = 0; s < subjects.length; s++) {
            var subj = subjects[s];
            var stat = d.subjectStats[subj] || { total: 0, correct: 0 };
            var pct = stat.total > 0 ? Math.round(stat.correct / stat.total * 100) : 0;
            html += '<div style="display:flex;align-items:center;margin-bottom:8px;">' +
                '<span style="width:50px;font-weight:600;font-size:14px;">' + subj + '</span>' +
                '<div style="flex:1;height:20px;background:#f1f5f9;border-radius:10px;overflow:hidden;margin:0 10px;">' +
                '<div style="height:100%;width:' + pct + '%;background:' + colors[s] + ';border-radius:10px;"></div></div>' +
                '<span style="font-weight:700;font-size:14px;color:' + colors[s] + ';">' + pct + '%</span>' +
                '<span style="font-size:11px;color:#94a3b8;margin-left:6px;">(' + stat.correct + '/' + stat.total + ')</span></div>';
        }
        html += '</div>';

        // 2. 知识点掌握度
        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:20px;">';
        html += '<div style="font-weight:700;color:#0f172a;margin-bottom:10px;">🎯 知识点掌握度 TOP5</div>';
        var sortedKnowledge = [];
        for (var kn in d.knowledgeMap) {
            if (d.knowledgeMap.hasOwnProperty(kn)) {
                sortedKnowledge.push({ name: kn, score: d.knowledgeMap[kn] });
            }
        }
        sortedKnowledge.sort(function(a, b) { return b.score - a.score; });
        var top5 = sortedKnowledge.slice(0, 5);
        if (top5.length === 0) {
            html += '<div style="color:#94a3b8;font-size:13px;">暂无知识点数据</div>';
        } else {
            for (var t = 0; t < top5.length; t++) {
                var score = top5[t].score;
                var barColor = score >= 80 ? '#16a34a' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#dc2626';
                html += '<div style="display:flex;align-items:center;margin-bottom:8px;">' +
                    '<span style="width:120px;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + top5[t].name + '">' + top5[t].name + '</span>' +
                    '<div style="flex:1;height:14px;background:#f1f5f9;border-radius:7px;overflow:hidden;margin:0 8px;">' +
                    '<div style="height:100%;width:' + score + '%;background:' + barColor + ';border-radius:7px;"></div></div>' +
                    '<span style="font-weight:700;font-size:13px;color:' + barColor + ';">' + score + '%</span></div>';
            }
        }
        html += '</div>';

        // 3. 最薄弱知识点TOP5
        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:20px;">';
        html += '<div style="font-weight:700;color:#0f172a;margin-bottom:10px;">⚠️ 最薄弱知识点 TOP5</div>';
        var weakList = d.weakPoints;
        if (weakList.length === 0) {
            html += '<div style="color:#94a3b8;font-size:13px;">数据不足，多做些题来看看薄弱环节吧</div>';
        } else {
            for (var w = 0; w < weakList.length; w++) {
                var wp = weakList[w];
                var suggestTip = wp.score < 30 ? '急需重点突破，建议回归课本基础知识' :
                                 wp.score < 50 ? '需要加强练习，多刷对应章节的题目' :
                                 '还需巩固提升，重点理解错题思路';
                html += '<div style="padding:10px 14px;background:#fef2f2;border-left:3px solid #ef4444;border-radius:4px;margin-bottom:8px;">' +
                    '<span style="font-weight:600;color:#dc2626;">' + (w+1) + '. ' + wp.name + '</span>' +
                    '<span style="margin-left:8px;font-size:12px;color:#64748b;">掌握度 ' + wp.score + '%</span>' +
                    '<span style="margin-left:8px;font-size:12px;color:#b45309;">→ ' + suggestTip + '</span></div>';
            }
        }
        html += '</div>';

        // 4. 进步追踪
        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:20px;">';
        html += '<div style="font-weight:700;color:#0f172a;margin-bottom:10px;">📈 进步追踪</div>';
        html += '<div style="font-size:14px;margin-bottom:8px;">本周正确率 ' + d.thisWeekAccuracy + '%' +
            (d.accuracyChange >= 0 ? ' <span style="color:#16a34a;">↑' + d.accuracyChange + '%</span>' : ' <span style="color:#dc2626;">↓' + Math.abs(d.accuracyChange) + '%</span>') +
            '（上周 ' + d.lastWeekAccuracy + '%）</div>';
        var imp = d.improved;
        if (imp && imp.length > 0) {
            html += '<div style="font-size:13px;color:#16a34a;margin-top:4px;">🌟 进步最大考点：<strong>' + imp.join('、') + '</strong></div>';
        } else {
            html += '<div style="font-size:13px;color:#94a3b8;">继续积累数据以追踪进步趋势</div>';
        }
        html += '</div>';

        // 5. 下周建议
        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:20px;">';
        html += '<div style="font-weight:700;color:#0f172a;margin-bottom:10px;">💡 下周学习建议</div>';
        var suggestions = [];
        if (weakList.length > 0) {
            suggestions.push('重点攻克「' + weakList[0].name + '」，每天安排30分钟专项练习');
            if (weakList.length > 1) suggestions.push('兼顾「' + weakList[1].name + '」，每周至少3道相关题目');
        }
        var weakestSubject = '';
        var weakestPct = 100;
        for (var sk in d.subjectStats) {
            if (d.subjectStats.hasOwnProperty(sk)) {
                var sp = d.subjectStats[sk];
                var spct = sp.total > 0 ? Math.round(sp.correct/sp.total*100) : 0;
                if (spct < weakestPct) { weakestPct = spct; weakestSubject = sk; }
            }
        }
        if (weakestSubject && weakestPct < 70) {
            suggestions.push('「' + weakestSubject + '」得分率偏低(' + weakestPct + '%)，建议增加该科学习时间配比');
        }
        if (d.thisWeekTotal < 10) {
            suggestions.push('本周做题量偏少，下周目标：每天至少完成5道题');
        }
        suggestions.push('每周日做一次错题回顾，整理错题本中的高频错误');
        suggestions.push('保持每天打卡习惯，连续打卡能有效提升自律性');
        for (var sg = 0; sg < suggestions.length; sg++) {
            html += '<div style="padding:8px 12px;background:#f0fdf4;border-radius:6px;margin-bottom:6px;font-size:13px;border-left:3px solid #22c55e;">' +
                (sg+1) + '. ' + suggestions[sg] + '</div>';
        }
        html += '</div>';

        // 生成时间
        html += '<div style="text-align:center;font-size:12px;color:#94a3b8;margin-top:10px;">报告生成时间：' + new Date().toLocaleString() + '</div>';

        return html;
    },

    _filterByDate: function(records, start, end) {
        var result = [];
        for (var i = 0; i < records.length; i++) {
            var r = records[i];
            var ts = r.timestamp || r.date || r.time || r.ts;
            if (!ts) continue;
            var d = new Date(ts);
            if (d >= start && d <= end) {
                result.push(r);
            }
        }
        return result;
    },

    _loadJSON: function(key, defaultVal) {
        try {
            var raw = localStorage.getItem(key);
            if (raw) return JSON.parse(raw);
        } catch(e) {}
        return defaultVal;
    },

    _buildKnowledgeMap: function(quizRecords, masteryData) {
        var map = {};
        // From quiz records
        for (var i = 0; i < quizRecords.length; i++) {
            var r = quizRecords[i];
            var topic = r.topic || r.knowledge || r.knowledgePoint || r.chapter;
            if (!topic) continue;
            if (!map[topic]) map[topic] = { correct: 0, total: 0 };
            map[topic].total++;
            if (r.correct === true || r.isCorrect === true) map[topic].correct++;
        }
        // Build result
        var result = {};
        for (var k in map) {
            if (map.hasOwnProperty(k)) {
                result[k] = map[k].total > 0 ? Math.round(map[k].correct / map[k].total * 100) : 50;
            }
        }
        // Merge manual mastery data
        for (var mk in masteryData) {
            if (masteryData.hasOwnProperty(mk)) {
                var mv = masteryData[mk];
                if (typeof mv === 'number') {
                    if (!result[mk]) result[mk] = mv;
                } else if (mv && typeof mv.score === 'number') {
                    if (!result[mk]) result[mk] = mv.score;
                }
            }
        }
        return result;
    },

    _calcSubjectStats: function(quizRecords, wrongRecords) {
        var stats = { '物理': { total: 0, correct: 0 }, '化学': { total: 0, correct: 0 }, '生物': { total: 0, correct: 0 } };
        for (var i = 0; i < quizRecords.length; i++) {
            var r = quizRecords[i];
            var subj = r.subject || r.subj || '';
            if (!subj) continue;
            if (!stats[subj]) stats[subj] = { total: 0, correct: 0 };
            stats[subj].total++;
            if (r.correct === true || r.isCorrect === true) stats[subj].correct++;
        }
        return stats;
    },

    _getWeakPoints: function(knowledgeMap) {
        var list = [];
        for (var k in knowledgeMap) {
            if (knowledgeMap.hasOwnProperty(k)) {
                list.push({ name: k, score: knowledgeMap[k] });
            }
        }
        list.sort(function(a, b) { return a.score - b.score; });
        return list.slice(0, 5);
    },

    _getImprovedPoints: function(quizRecords, lastWeekStart) {
        var now = new Date();
        var weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        var thisWeek = {};
        var lastWeek = {};

        for (var i = 0; i < quizRecords.length; i++) {
            var r = quizRecords[i];
            var ts = r.timestamp || r.date || r.time || r.ts;
            if (!ts) continue;
            var d = new Date(ts);
            var topic = r.topic || r.knowledge || r.knowledgePoint || r.chapter;
            if (!topic) continue;

            if (d >= weekStart && d <= now) {
                if (!thisWeek[topic]) thisWeek[topic] = { correct: 0, total: 0 };
                thisWeek[topic].total++;
                if (r.correct === true || r.isCorrect === true) thisWeek[topic].correct++;
            } else if (d >= lastWeekStart && d < weekStart) {
                if (!lastWeek[topic]) lastWeek[topic] = { correct: 0, total: 0 };
                lastWeek[topic].total++;
                if (r.correct === true || r.isCorrect === true) lastWeek[topic].correct++;
            }
        }

        var improved = [];
        for (var k in thisWeek) {
            if (thisWeek.hasOwnProperty(k) && lastWeek[k]) {
                var thisAcc = thisWeek[k].total > 0 ? thisWeek[k].correct / thisWeek[k].total * 100 : 0;
                var lastAcc = lastWeek[k].total > 0 ? lastWeek[k].correct / lastWeek[k].total * 100 : 0;
                if (thisAcc - lastAcc > 10) {
                    improved.push(k);
                }
            }
        }
        return improved.length > 0 ? improved.slice(0, 3) : [];
    }
};

// ============================================================
// 暴露到全局
// ============================================================
window.examHeatmap = examHeatmap;
window.terminologyChecker = terminologyChecker;
window.countdownTaskSystem = countdownTaskSystem;
window.studyReport = studyReport;

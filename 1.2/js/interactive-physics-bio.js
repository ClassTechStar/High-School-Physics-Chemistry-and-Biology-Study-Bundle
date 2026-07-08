// 物理图像实验室 + 遗传棋盘计算器
// 交互式学科工具模块
// ES5兼容，零依赖，数据内嵌

// ============================================================
// 模块1: physicsGraphLab（物理图像实时实验室）
// ============================================================
window.physicsGraphLab = (function () {
    var state = {
        mode: 'kinematics',    // kinematics | electrical | mechanics
        graphType: 'vt',       // vt | st | at | fx | ui | pt
        scenario: 'accel-cruise-decel',
        params: {
            v0: 0,              // 初速度 m/s
            a: [2, 0, -3],      // 每阶段加速度 m/s²
            t: [3, 2, 3],       // 每阶段持续时间 s
            E: 6,               // 电动势 V
            r: 1,               // 内阻 Ω
            R: 10,              // 外电阻 Ω
            k: 100,             // 劲度系数 N/m
            m: 2,               // 质量 kg
            mu: 0.3,            // 动摩擦因数
            xMax: 5,            // 最大形变量 m
            P0: 100,            // 额定功率 W
            Umax: 12            // 最大电压 V
        },
        hoverPoint: null,
        animTime: 0
    };

    var SCENARIOS = {
        kinematics: [
            { id: 'accel-cruise-decel', name: '先匀加速再匀速再匀减速', v0: 0, a: [2, 0, -3], t: [3, 2, 3] },
            { id: 'freefall-rebound', name: '自由落体→反弹（弹性碰撞）', v0: 0, a: [9.8, -9.8], t: [1, 0.5] },
            { id: 'vertical-up', name: '竖直上抛运动', v0: 20, a: [-9.8], t: [4.1] },
            { id: 'pursuit', name: '追击相遇问题', v0: 0, a: [3, -2], t: [4, 3] }
        ],
        electrical: [
            { id: 'power-ext', name: '电源外特性曲线 U=E-Ir', E: 6, r: 1 },
            { id: 'bulb-vi', name: '小灯泡伏安特性曲线', E: 6, r: 0.5, R: 10 },
            { id: 'resistor-pt', name: '纯电阻功率-时间曲线', P0: 100 }
        ],
        mechanics: [
            { id: 'spring-fx', name: '弹簧弹力-形变量 F=kx', k: 100 },
            { id: 'friction-ff', name: '摩擦力-外力 F_f-F', m: 2, mu: 0.3 },
            { id: 'accel-af', name: '加速度-合外力 a-F合', k: 0, m: 2 }
        ]
    };

    function render(containerId) {
        var cid = containerId || 'physics-graph-lab-app';
        var root = document.getElementById(cid);
        if (!root) return;
        try {
            root.innerHTML = buildHTML();
            bindEvents(root);
            drawGraph(root);
        } catch (err) {
            console.error('物理图像实验室渲染失败:', err);
        }
    }

    function buildHTML() {
        return '<div style="font-family:Arial,Helvetica,sans-serif;max-width:820px;margin:0 auto;">' +
            // 顶部：图像类型选择按钮
            buildGraphTypeBar() +
            '<div style="display:flex;gap:12px;margin-top:10px;">' +
                // 左侧：场景选择 + 参数面板
                buildLeftPanel() +
                // 中间：SVG 画布
                buildSvgPanel() +
                // 右侧：物理意义解释
                buildRightPanel() +
            '</div>' +
            // 底部：关键特征列表
            buildBottomPanel() +
            // 隐藏的tooltip
            '<div id="phys-tooltip" style="position:absolute;display:none;background:rgba(0,0,0,0.8);color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;pointer-events:none;z-index:10;"></div>' +
        '</div>';
    }

    function buildGraphTypeBar() {
        var types = [
            { id: 'vt', label: 'v-t 速度-时间' },
            { id: 'st', label: 's-t 位移-时间' },
            { id: 'at', label: 'a-t 加速度-时间' },
            { id: 'fx', label: 'F-x 力-位移' },
            { id: 'ui', label: 'U-I 电压-电流' },
            { id: 'pt', label: 'P-t 功率-时间' }
        ];
        var active = state.graphType;
        var html = '<div style="display:flex;flex-wrap:wrap;gap:6px;padding:8px 0;">';
        for (var i = 0; i < types.length; i++) {
            var t = types[i];
            var bg = (t.id === active) ? '#1a73e8' : '#e0e0e0';
            var color = (t.id === active) ? '#fff' : '#333';
            html += '<button class="phys-graph-btn" data-gtype="' + t.id + '" style="padding:6px 12px;border:none;border-radius:6px;cursor:pointer;font-size:13px;background:' + bg + ';color:' + color + ';transition:all 0.2s;">' + t.label + '</button>';
        }
        html += '</div>';
        return html;
    }

    function buildLeftPanel() {
        var html = '<div style="width:200px;flex-shrink:0;background:#f8f9fa;border-radius:8px;padding:10px;">';

        // 场景选择
        html += '<div style="margin-bottom:10px;">';
        html += '<label style="font-size:12px;font-weight:bold;color:#555;">场景选择</label>';
        html += '<select id="phys-scenario-select" style="width:100%;margin-top:4px;padding:4px;font-size:12px;border:1px solid #ccc;border-radius:4px;">';

        var graphType = state.graphType;
        var modeKey;
        if (graphType === 'vt' || graphType === 'st' || graphType === 'at') {
            modeKey = 'kinematics';
        } else if (graphType === 'ui' || graphType === 'pt') {
            modeKey = 'electrical';
        } else {
            modeKey = 'mechanics';
        }
        var scenarios = SCENARIOS[modeKey] || [];
        for (var i = 0; i < scenarios.length; i++) {
            var sel = (scenarios[i].id === state.scenario) ? ' selected' : '';
            html += '<option value="' + scenarios[i].id + '"' + sel + '>' + scenarios[i].name + '</option>';
        }
        html += '</select></div>';

        // 参数滑块
        html += '<div style="font-size:11px;font-weight:bold;color:#555;margin-bottom:4px;">参数调节</div>';
        html += buildSliders();

        html += '</div>';
        return html;
    }

    function buildSliders() {
        var html = '';
        if (state.graphType === 'vt' || state.graphType === 'st' || state.graphType === 'at') {
            html += sliderHTML('v0', '初速度 v₀ (m/s)', state.params.v0, 0, 50, 1);
            html += sliderHTML('a0', '阶段1加速度 a₁ (m/s²)', state.params.a[0] || 0, -20, 20, 0.5);
            html += sliderHTML('t0', '阶段1时间 t₁ (s)', state.params.t[0] || 0, 0, 10, 0.5);
            if (state.params.a.length > 1) {
                html += sliderHTML('a1', '阶段2加速度 a₂ (m/s²)', state.params.a[1] || 0, -20, 20, 0.5);
                html += sliderHTML('t1', '阶段2时间 t₂ (s)', state.params.t[1] || 0, 0, 10, 0.5);
            }
            if (state.params.a.length > 2) {
                html += sliderHTML('a2', '阶段3加速度 a₃ (m/s²)', state.params.a[2] || 0, -20, 20, 0.5);
                html += sliderHTML('t2', '阶段3时间 t₃ (s)', state.params.t[2] || 0, 0, 10, 0.5);
            }
        } else if (state.graphType === 'ui') {
            html += sliderHTML('E', '电动势 E (V)', state.params.E, 0, 12, 0.5);
            html += sliderHTML('r', '内阻 r (Ω)', state.params.r, 0, 5, 0.1);
            html += sliderHTML('R', '外电阻 R (Ω)', state.params.R, 0, 50, 1);
        } else if (state.graphType === 'pt') {
            html += sliderHTML('P0', '额定功率 P (W)', state.params.P0, 0, 200, 5);
            html += sliderHTML('R', '电阻 R (Ω)', state.params.R, 1, 50, 1);
        } else if (state.graphType === 'fx') {
            html += sliderHTML('k', '劲度系数 k (N/m)', state.params.k, 0, 500, 10);
            html += sliderHTML('m', '质量 m (kg)', state.params.m, 0.5, 20, 0.5);
            html += sliderHTML('xMax', '最大形变 x (m)', state.params.xMax, 1, 10, 0.5);
        }
        return html;
    }

    function sliderHTML(id, label, value, min, max, step) {
        return '<div style="margin-bottom:6px;">' +
            '<label style="font-size:10px;color:#666;">' + label + ': <span id="phys-val-' + id + '">' + value + '</span></label>' +
            '<input type="range" class="phys-slider" data-param="' + id + '" value="' + value + '" min="' + min + '" max="' + max + '" step="' + step + '" style="width:100%;">' +
        '</div>';
    }

    function buildSvgPanel() {
        return '<div style="flex:1;position:relative;background:#fff;border:1px solid #ddd;border-radius:8px;overflow:hidden;">' +
            '<div style="position:relative;">' +
                '<svg id="phys-svg" width="500" height="350" style="display:block;cursor:crosshair;"></svg>' +
            '</div>' +
        '</div>';
    }

    function buildRightPanel() {
        var graphType = state.graphType;
        var info = getPhysicalMeaning(graphType);
        var html = '<div style="width:160px;flex-shrink:0;background:#f8f9fa;border-radius:8px;padding:10px;font-size:11px;">';
        html += '<div style="font-weight:bold;color:#1a73e8;margin-bottom:6px;">物理意义</div>';
        html += '<div style="line-height:1.8;">';
        for (var i = 0; i < info.length; i++) {
            html += '<div style="padding:3px 0;border-bottom:1px dotted #ddd;">' + info[i] + '</div>';
        }
        html += '</div></div>';
        return html;
    }

    function getPhysicalMeaning(graphType) {
        var meanings = {
            'vt': ['斜率 k = 加速度 a', '面积 S = 位移 Δx', 'v>0 正向运动', 'v<0 反向运动', '转折点=加速度变号', '截距 = 初速度 v₀'],
            'st': ['斜率 k = 速度 v', '水平段 = 静止', '二次曲线=匀变速', 's>0 正方向位移', '拐点=速度方向改变'],
            'at': ['面积 S = 速度变化 Δv', 'a>0 加速运动', 'a<0 减速运动', 'a=0 匀速运动', '截距=初始加速度'],
            'fx': ['斜率 k = 劲度系数 k', '面积 S = 弹性势能', 'ΔEp = ½kx²', '线性范围内成立', '截距=0(过原点)'],
            'ui': ['斜率绝对值 = 内阻 r', 'U轴截距 = 电动势 E', 'I轴截距 = 短路电流', '工作点=U×I=输出功率', 'R增大→电流减小'],
            'pt': ['面积 = 消耗的电能', 'P = U²/R = I²R', 'P_max = U²/(4r)', '额定功率=安全上限']
        };
        return meanings[graphType] || meanings['vt'];
    }

    function buildBottomPanel() {
        var graphType = state.graphType;
        var features = calcFeatures(graphType);
        var html = '<div id="phys-bottom" style="margin-top:8px;padding:8px 12px;background:#f0f7ff;border-radius:8px;font-size:12px;">';
        html += '<strong style="color:#1a73e8;">关键特征：</strong> ';
        for (var i = 0; i < features.length; i++) {
            html += '<span style="display:inline-block;margin-right:16px;padding:2px 8px;background:#fff;border-radius:4px;border:1px solid #d0e4ff;">' + features[i] + '</span>';
        }
        html += '</div>';
        return html;
    }

    function calcFeatures(graphType) {
        var p = state.params;
        if (graphType === 'vt') {
            var tTotal = 0;
            for (var i = 0; i < p.t.length; i++) tTotal += p.t[i];
            var v = p.v0;
            var sTotal = 0;
            for (var j = 0; j < p.a.length; j++) {
                var vNext = v + p.a[j] * p.t[j];
                sTotal += v * p.t[j] + 0.5 * p.a[j] * p.t[j] * p.t[j];
                v = vNext;
            }
            return ['斜率=加速度 a₁=' + (p.a[0] || 0) + ' m/s²', '总面积=位移=' + sTotal.toFixed(1) + ' m', '末速度=' + v.toFixed(1) + ' m/s', '总时间=' + tTotal + ' s'];
        }
        if (graphType === 'st') {
            var t2 = 0;
            for (var k = 0; k < p.t.length; k++) t2 += p.t[k];
            return ['斜率=速度', '抛物线段=匀变速', '总时间=' + t2 + ' s'];
        }
        if (graphType === 'at') {
            return ['面积=速度变化量 Δv', 'a₁=' + (p.a[0] || 0) + ' m/s²'];
        }
        if (graphType === 'ui') {
            var Isc = p.E / p.r;
            var Pmax = p.E * p.E / (4 * p.r);
            return ['E=' + p.E + ' V', 'r=' + p.r + ' Ω', 'I_短=' + Isc.toFixed(2) + ' A', 'P_max=' + Pmax.toFixed(1) + ' W'];
        }
        if (graphType === 'pt') {
            return ['P_max=' + p.P0 + ' W', 'W=P·t 面积=电能'];
        }
        if (graphType === 'fx') {
            var Ep = 0.5 * p.k * p.xMax * p.xMax;
            return ['k=' + p.k + ' N/m', 'Ep_max=½kx²=' + Ep.toFixed(1) + ' J', 'F_max=' + (p.k * p.xMax).toFixed(0) + ' N'];
        }
        return [];
    }

    function drawGraph(root) {
        var svgEl = root.querySelector('#phys-svg');
        if (!svgEl) return;

        var svgNS = 'http://www.w3.org/2000/svg';
        svgEl.innerHTML = '';

        var W = 500, H = 350;
        var margin = { top: 30, right: 40, bottom: 40, left: 55 };
        var pw = W - margin.left - margin.right;
        var ph = H - margin.top - margin.bottom;

        // 绘制坐标轴
        var g = createSVGElement('g', { transform: 'translate(' + margin.left + ',' + margin.top + ')' });
        svgEl.appendChild(g);

        var xLabel = 't / s';
        var yLabel = 'v / (m/s)';
        if (state.graphType === 'st') { xLabel = 't / s'; yLabel = 's / m'; }
        if (state.graphType === 'at') { xLabel = 't / s'; yLabel = 'a / (m/s²)'; }
        if (state.graphType === 'fx') { xLabel = 'x / m'; yLabel = 'F / N'; }
        if (state.graphType === 'ui') { xLabel = 'I / A'; yLabel = 'U / V'; }
        if (state.graphType === 'pt') { xLabel = 't / s'; yLabel = 'P / W'; }

        // 计算数据范围
        var xRange = getXRange(state.graphType);
        var yRange = getYRange(state.graphType);
        var xMin = xRange[0], xMax = xRange[1];
        var yMin = yRange[0], yMax = yRange[1];

        function toX(v) { return (v - xMin) / (xMax - xMin) * pw; }
        function toY(v) { return ph - (v - yMin) / (yMax - yMin) * ph; }

        // 网格线
        drawGrid(g, xMin, xMax, yMin, yMax, toX, toY, pw, ph);

        // 坐标轴
        var xAxis = createSVGElement('line', { x1: 0, y1: toY(0), x2: pw, y2: toY(0), stroke: '#333', 'stroke-width': 1.5 });
        var yAxis = createSVGElement('line', { x1: toX(0), y1: 0, x2: toX(0), y2: ph, stroke: '#333', 'stroke-width': 1.5 });
        g.appendChild(xAxis);
        g.appendChild(yAxis);

        // 轴标签
        var xLabelEl = createSVGElement('text', { x: pw / 2, y: ph + 28, 'text-anchor': 'middle', fill: '#333', 'font-size': 13, 'font-weight': 'bold' });
        xLabelEl.textContent = xLabel;
        g.appendChild(xLabelEl);
        var yLabelEl = createSVGElement('text', { x: -40, y: -12, 'text-anchor': 'middle', fill: '#333', 'font-size': 13, 'font-weight': 'bold', transform: 'rotate(-90)' });
        yLabelEl.textContent = yLabel;
        g.appendChild(yLabelEl);

        // 刻度
        drawTicks(g, xMin, xMax, toX, toY, pw, ph, 5, ph, true);
        drawTicks(g, yMin, yMax, toX, toY, pw, ph, 5, 0, false);

        // 箭头
        var arrowX = createSVGElement('polygon', { points: pw + ',0 ' + (pw - 6) + ',-4 ' + (pw - 6) + ',4', fill: '#333' });
        var arrowY = createSVGElement('polygon', { points: '0,-6 -4,0 4,0', fill: '#333' });
        g.appendChild(arrowX);
        var arrowAtTop = createSVGElement('g', { transform: 'translate(0,0)' });
        arrowAtTop.appendChild(arrowY);
        g.appendChild(arrowAtTop);

        // 绘制曲线
        var curveGroup = createSVGElement('g');
        g.appendChild(curveGroup);

        drawCurve(curveGroup, toX, toY, xMin, xMax, yMin, yMax, pw, ph);

        // 标注关键点
        annotateKeyPoints(g, toX, toY, xMin, xMax, yMin, yMax, pw, ph);

        // 运动物体动画
        drawAnimObject(g, toX, toY, xMin, xMax, yMin, yMax, pw, ph);

        // 鼠标交互层
        var overlay = createSVGElement('rect', { x: 0, y: 0, width: pw, height: ph, fill: 'transparent', style: 'pointer-events:all;' });
        g.appendChild(overlay);

        // 存储数据以便交互
        svgEl._physData = {
            toX: toX, toY: toY, xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax,
            pw: pw, ph: ph, margin: margin, graphType: state.graphType
        };
    }

    function createSVGElement(tag, attrs) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs) {
            if (attrs.hasOwnProperty(k)) {
                el.setAttribute(k, attrs[k]);
            }
        }
        return el;
    }

    function getXRange(graphType) {
        if (graphType === 'vt' || graphType === 'st' || graphType === 'at') {
            var tSum = 0;
            for (var i = 0; i < state.params.t.length; i++) tSum += state.params.t[i];
            return [0, Math.max(tSum + 1, 8)];
        }
        if (graphType === 'ui') return [0, state.params.E / state.params.r * 1.2 + 1];
        if (graphType === 'pt') return [0, 10];
        if (graphType === 'fx') return [0, Math.max(state.params.xMax + 1, 6)];
        return [0, 10];
    }

    function getYRange(graphType) {
        var p = state.params;
        if (graphType === 'vt') {
            var v = p.v0, vMax = Math.abs(p.v0), vMin = p.v0;
            for (var i = 0; i < p.a.length; i++) {
                v += p.a[i] * p.t[i];
                vMax = Math.max(vMax, Math.abs(v));
                vMin = Math.min(vMin, v);
            }
            vMax = Math.max(vMax + 5, 10);
            return [vMin - 5, vMax + 5];
        }
        if (graphType === 'st') {
            var s = 0, vv = p.v0, sMax = 0;
            for (var j = 0; j < p.a.length; j++) {
                s += vv * p.t[j] + 0.5 * p.a[j] * p.t[j] * p.t[j];
                vv += p.a[j] * p.t[j];
                sMax = Math.max(sMax, s);
            }
            return [0, Math.max(sMax + 10, 30)];
        }
        if (graphType === 'at') return [-22, 22];
        if (graphType === 'ui') return [0, p.E * 1.2 + 1];
        if (graphType === 'pt') return [0, p.P0 * 1.2 + 10];
        if (graphType === 'fx') return [0, p.k * p.xMax * 1.2 + 10];
        return [0, 50];
    }

    function drawGrid(g, xMin, xMax, yMin, yMax, toX, toY, pw, ph) {
        var dx = (xMax - xMin) / 10;
        var dy = (yMax - yMin) / 7;
        for (var i = 0; i <= 10; i++) {
            var xv = xMin + i * dx;
            var x = toX(xv);
            var line = createSVGElement('line', { x1: x, y1: 0, x2: x, y2: ph, stroke: '#eee', 'stroke-width': 0.5 });
            g.appendChild(line);
        }
        for (var j = 0; j <= 7; j++) {
            var yv = yMin + j * dy;
            var y = toY(yv);
            var line2 = createSVGElement('line', { x1: 0, y1: y, x2: pw, y2: y, stroke: '#eee', 'stroke-width': 0.5 });
            g.appendChild(line2);
        }
    }

    function drawTicks(g, vmin, vmax, toX, toY, pw, ph, n, offsetY, isX) {
        var step = (vmax - vmin) / n;
        for (var i = 0; i <= n; i++) {
            var v = vmin + i * step;
            var tickVal = parseFloat(v.toFixed(1));
            if (isX) {
                var x = toX(tickVal);
                var tickLine = createSVGElement('line', { x1: x, y1: offsetY - 4, x2: x, y2: offsetY + 4, stroke: '#555', 'stroke-width': 1 });
                g.appendChild(tickLine);
                var tickText = createSVGElement('text', { x: x, y: offsetY + 16, 'text-anchor': 'middle', fill: '#555', 'font-size': 10 });
                tickText.textContent = tickVal;
                g.appendChild(tickText);
            } else {
                var y = toY(tickVal);
                var tickL = createSVGElement('line', { x1: -4, y1: y, x2: 4, y2: y, stroke: '#555', 'stroke-width': 1 });
                g.appendChild(tickL);
                var tickT = createSVGElement('text', { x: -8, y: y + 4, 'text-anchor': 'end', fill: '#555', 'font-size': 10 });
                tickT.textContent = tickVal;
                g.appendChild(tickT);
            }
        }
    }

    function drawCurve(group, toX, toY, xMin, xMax, yMin, yMax, pw, ph) {
        var graphType = state.graphType;
        var p = state.params;

        if (graphType === 'vt') {
            drawVTCurve(group, toX, toY, p);
        } else if (graphType === 'st') {
            drawSTCurve(group, toX, toY, p);
        } else if (graphType === 'at') {
            drawATCurve(group, toX, toY, p);
        } else if (graphType === 'ui') {
            drawUICurve(group, toX, toY, p);
        } else if (graphType === 'pt') {
            drawPTCurve(group, toX, toY, p);
        } else if (graphType === 'fx') {
            drawFXCurve(group, toX, toY, p);
        }

        // 零点高亮
        var zeroDot = createSVGElement('circle', { cx: toX(0), cy: toY(0), r: 3, fill: '#333' });
        group.appendChild(zeroDot);
    }

    function drawVTCurve(group, toX, toY, p) {
        var t = 0, v = p.v0;
        var pathD = 'M ' + toX(0) + ' ' + toY(p.v0);
        for (var i = 0; i < p.a.length; i++) {
            var dt = p.t[i];
            if (dt <= 0) continue;
            var vEnd = v + p.a[i] * dt;
            // 判断斜率正负用不同颜色
            var color = p.a[i] > 0 ? '#e74c3c' : (p.a[i] < 0 ? '#3498db' : '#2ecc71');
            var line = createSVGElement('line', {
                x1: toX(t), y1: toY(v), x2: toX(t + dt), y2: toY(vEnd),
                stroke: color, 'stroke-width': 2.5
            });
            group.appendChild(line);
            pathD += ' L ' + toX(t + dt) + ' ' + toY(vEnd);
            t += dt;
            v = vEnd;

            // 拐点标记圆
            var dot = createSVGElement('circle', { cx: toX(t), cy: toY(v), r: 4, fill: '#1a73e8', stroke: '#fff', 'stroke-width': 1.5 });
            group.appendChild(dot);
        }
        // 存储路径数据
        group.setAttribute('data-path', pathD);
        group.setAttribute('data-p0v', p.v0);
    }

    function drawSTCurve(group, toX, toY, p) {
        var t = 0, v = p.v0, s = 0;
        var pathD = 'M ' + toX(0) + ' ' + toY(0);
        var color = '#e67e22';
        var nPoints = 200;
        var tTotal = 0;
        for (var i = 0; i < p.t.length; i++) tTotal += p.t[i];
        if (tTotal <= 0) return;
        var dt = tTotal / nPoints;
        var ss = 0, vv = p.v0, tt = 0;
        var segIdx = 0, segRemain = p.t[0];
        for (var k = 0; k <= nPoints; k++) {
            var step = Math.min(dt, segRemain);
            var a = p.a[segIdx] || 0;
            ss += vv * step + 0.5 * a * step * step;
            vv += a * step;
            tt += step;
            segRemain -= step;
            if (segRemain <= 0 && segIdx < p.a.length - 1) {
                segIdx++;
                segRemain = p.t[segIdx] || 0;
            }
            if (tt <= tTotal) {
                pathD += ' L ' + toX(tt) + ' ' + toY(ss);
            }
        }
        var polyline = createSVGElement('polyline', { points: pathD.replace(/[ML]/g, '').trim().split(' ').join(' '), fill: 'none', stroke: color, 'stroke-width': 2.5 });
        // polyline via points attribute not ideal... let me use path instead
        group.innerHTML = '';
        var path = createSVGElement('path', { d: pathD, fill: 'none', stroke: color, 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
        group.appendChild(path);

        // 标记各阶段结束点
        var t2 = 0, v2 = p.v0, s2 = 0;
        for (var j = 0; j < p.a.length; j++) {
            s2 += v2 * p.t[j] + 0.5 * p.a[j] * p.t[j] * p.t[j];
            v2 += p.a[j] * p.t[j];
            t2 += p.t[j];
            var dot2 = createSVGElement('circle', { cx: toX(t2), cy: toY(s2), r: 4, fill: '#1a73e8', stroke: '#fff', 'stroke-width': 1.5 });
            group.appendChild(dot2);
        }
    }

    function drawATCurve(group, toX, toY, p) {
        var t = 0;
        for (var i = 0; i < p.a.length; i++) {
            var dt = p.t[i];
            if (dt <= 0) continue;
            var aVal = p.a[i];
            var color = aVal > 0 ? '#e74c3c' : (aVal < 0 ? '#3498db' : '#95a5a6');
            var line = createSVGElement('line', {
                x1: toX(t), y1: toY(aVal), x2: toX(t + dt), y2: toY(aVal),
                stroke: color, 'stroke-width': 2.5
            });
            group.appendChild(line);
            // 竖直虚线段（突变）
            if (i < p.a.length - 1 && p.a[i] !== p.a[i + 1]) {
                var dash = createSVGElement('line', {
                    x1: toX(t + dt), y1: toY(aVal), x2: toX(t + dt), y2: toY(p.a[i + 1]),
                    stroke: '#999', 'stroke-width': 1, 'stroke-dasharray': '4,3'
                });
                group.appendChild(dash);
            }
            t += dt;
        }
        group.setAttribute('data-p0v', p.v0);
    }

    function drawUICurve(group, toX, toY, p) {
        // U = E - Ir: 直线
        var Imax = p.E / p.r;
        var line = createSVGElement('line', {
            x1: toX(0), y1: toY(p.E),
            x2: toX(Imax), y2: toY(0),
            stroke: '#8e44ad', 'stroke-width': 2.5
        });
        group.appendChild(line);

        // 工作点：外电阻R对应的工作点
        var Iwork = p.E / (p.R + p.r);
        var Uwork = p.E - Iwork * p.r;
        var workDot = createSVGElement('circle', {
            cx: toX(Iwork), cy: toY(Uwork), r: 5, fill: '#e74c3c', stroke: '#fff', 'stroke-width': 2
        });
        group.appendChild(workDot);

        // 最大功率点
        var ImaxP = p.E / (2 * p.r);
        var UmaxP = p.E / 2;
        var maxPDot = createSVGElement('circle', {
            cx: toX(ImaxP), cy: toY(UmaxP), r: 5, fill: '#f39c12', stroke: '#fff', 'stroke-width': 2
        });
        group.appendChild(maxPDot);
    }

    function drawPTCurve(group, toX, toY, p) {
        // P = U²/R * (e^{-t/τ}类型或恒定功率)
        // 简化：恒定功率水平线
        var line = createSVGElement('line', {
            x1: toX(0), y1: toY(p.P0),
            x2: toX(10), y2: toY(p.P0),
            stroke: '#16a085', 'stroke-width': 2.5
        });
        group.appendChild(line);

        // 标注面积
        var rect = createSVGElement('rect', {
            x: toX(1), y: toY(p.P0),
            width: toX(8) - toX(1), height: toY(0) - toY(p.P0),
            fill: 'rgba(22,160,133,0.15)', stroke: 'none'
        });
        group.appendChild(rect);
    }

    function drawFXCurve(group, toX, toY, p) {
        // F = kx 直线过原点
        var xMax = p.xMax;
        var Fmax = p.k * xMax;
        var line = createSVGElement('line', {
            x1: toX(0), y1: toY(0),
            x2: toX(xMax), y2: toY(Fmax),
            stroke: '#c0392b', 'stroke-width': 2.5
        });
        group.appendChild(line);

        // 面积（三角形）半透明标记
        var triangle = createSVGElement('polygon', {
            points: toX(0) + ',' + toY(0) + ' ' + toX(xMax) + ',' + toY(0) + ' ' + toX(xMax) + ',' + toY(Fmax),
            fill: 'rgba(192,57,43,0.1)', stroke: 'none'
        });
        group.appendChild(triangle);
    }

    function annotateKeyPoints(g, toX, toY, xMin, xMax, yMin, yMax, pw, ph) {
        var graphType = state.graphType;
        var p = state.params;

        if (graphType === 'vt') {
            // 标注斜率和面积
            var t = 0, v = p.v0;
            for (var i = 0; i < p.a.length; i++) {
                var dt = p.t[i];
                if (dt <= 0) continue;
                var vEnd = v + p.a[i] * dt;
                var midX = toX(t + dt / 2);
                var midY = toY((v + vEnd) / 2);
                var aVal = p.a[i];
                if (Math.abs(aVal) > 0.01) {
                    var slopeText = createSVGElement('text', {
                        x: midX, y: midY - 8, 'text-anchor': 'middle', fill: '#e74c3c', 'font-size': 10, 'font-weight': 'bold'
                    });
                    slopeText.textContent = 'k=' + Number(aVal).toFixed(1);
                    g.appendChild(slopeText);
                }
                // 面积标注
                if (Math.abs(v + vEnd) > 0.1 && Math.abs(vEnd) > 0.1) {
                    var area = v * dt + 0.5 * aVal * dt * dt;
                    var areaText = createSVGElement('text', {
                        x: midX, y: (v > 0 || vEnd > 0) ? Math.min(toY(v), toY(vEnd)) + 20 : Math.min(toY(v), toY(vEnd)) - 5,
                        'text-anchor': 'middle', fill: '#3498db', 'font-size': 10, 'font-weight': 'bold'
                    });
                    areaText.textContent = 'S=' + Math.abs(area).toFixed(1) + 'm';
                    g.appendChild(areaText);
                }
                t += dt;
                v = vEnd;
            }
        }

        if (graphType === 'ui') {
            // E标注
            var eText = createSVGElement('text', { x: toX(0) - 5, y: toY(p.E) - 6, 'text-anchor': 'end', fill: '#8e44ad', 'font-size': 11, 'font-weight': 'bold' });
            eText.textContent = 'E=' + Number(p.E).toFixed(1) + 'V';
            g.appendChild(eText);

            // 短路电流
            var iscText = createSVGElement('text', { x: toX(p.E / p.r), y: toY(0) + 15, 'text-anchor': 'middle', fill: '#8e44ad', 'font-size': 10 });
            iscText.textContent = 'I短=' + (p.E / p.r).toFixed(2) + 'A';
            g.appendChild(iscText);

            // 工作点
            var Iw = p.E / (p.R + p.r);
            var Uw = p.E - Iw * p.r;
            var workText = createSVGElement('text', { x: toX(Iw) + 8, y: toY(Uw) - 8, fill: '#e74c3c', 'font-size': 10, 'font-weight': 'bold' });
            workText.textContent = '工作点(' + Iw.toFixed(2) + ',' + Uw.toFixed(1) + ')';
            g.appendChild(workText);
        }

        if (graphType === 'fx') {
            // k标注
            var kText = createSVGElement('text', {
                x: toX(p.xMax / 2), y: toY(p.k * p.xMax / 2) - 8,
                'text-anchor': 'middle', fill: '#c0392b', 'font-size': 10, 'font-weight': 'bold'
            });
            kText.textContent = 'k=' + Number(p.k).toFixed(0) + 'N/m';
            g.appendChild(kText);

            // 弹性势能
            var epText = createSVGElement('text', {
                x: toX(p.xMax) - 20, y: toY(p.k * p.xMax * 0.3),
                'text-anchor': 'end', fill: '#e67e22', 'font-size': 10
            });
            var ep = 0.5 * p.k * p.xMax * p.xMax;
            epText.textContent = 'Ep=½kx²=' + ep.toFixed(1) + 'J';
            g.appendChild(epText);
        }
    }

    function drawAnimObject(g, toX, toY, xMin, xMax, yMin, yMax, pw, ph) {
        if (state.graphType !== 'vt' && state.graphType !== 'st' && state.graphType !== 'at') return;

        // 底部轨道
        var trackY = ph - 10;
        var tTotal = 0;
        for (var i = 0; i < state.params.t.length; i++) tTotal += state.params.t[i];

        // 轨道线
        var trackLine = createSVGElement('line', {
            x1: toX(0), y1: trackY, x2: toX(tTotal), y2: trackY,
            stroke: '#ccc', 'stroke-width': 2
        });
        g.appendChild(trackLine);

        // 根据当前动画时间定位小球
        var animT = (state.animTime || 0) % tTotal;
        var ct = 0, cv = state.params.v0, cs = 0, animV = state.params.v0;
        for (var j = 0; j < state.params.a.length; j++) {
            if (animT <= ct + state.params.t[j]) {
                var dt = animT - ct;
                animV = cv + state.params.a[j] * dt;
                cs = cs + cv * dt + 0.5 * state.params.a[j] * dt * dt;
                break;
            }
            cs += cv * state.params.t[j] + 0.5 * state.params.a[j] * state.params.t[j] * state.params.t[j];
            cv += state.params.a[j] * state.params.t[j];
            ct += state.params.t[j];
            animV = cv;
        }

        // 小球
        var ball = createSVGElement('circle', {
            cx: toX(animT), cy: trackY - 12, r: 8,
            fill: '#e74c3c', stroke: '#c0392b', 'stroke-width': 2
        });
        ball.setAttribute('id', 'phys-anim-ball');
        g.appendChild(ball);

        // 速度矢量箭头
        if (Math.abs(animV) > 0.2) {
            var arrowLen = Math.min(Math.abs(animV) * 2, 80);
            var arrowDir = animV > 0 ? 1 : -1;
            var arrX1 = toX(animT);
            var arrX2 = arrX1 + arrowLen * arrowDir;
            var arrowColor = animV > 0 ? '#e74c3c' : '#3498db';
            var velocityArrow = createSVGElement('line', {
                x1: arrX1, y1: trackY - 22,
                x2: arrX2, y2: trackY - 22,
                stroke: arrowColor, 'stroke-width': 2, 'marker-end': 'url(#arrowhead-' + (animV > 0 ? 'red' : 'blue') + ')'
            });
            velocityArrow.setAttribute('id', 'phys-arrow');
            g.appendChild(velocityArrow);

            // arrowhead marker (define once)
            var defs = g.parentNode.querySelector('defs');
            if (!defs) {
                defs = createSVGElement('defs');
                g.parentNode.insertBefore(defs, g.parentNode.firstChild);
            }
            if (!defs.querySelector('#arrowhead-red')) {
                var markerR = createSVGElement('marker', { id: 'arrowhead-red', markerWidth: '8', markerHeight: '6', refX: '8', refY: '3', orient: 'auto' });
                var polyR = createSVGElement('polygon', { points: '0 0, 8 3, 0 6', fill: '#e74c3c' });
                markerR.appendChild(polyR);
                defs.appendChild(markerR);
            }
            if (!defs.querySelector('#arrowhead-blue')) {
                var markerB = createSVGElement('marker', { id: 'arrowhead-blue', markerWidth: '8', markerHeight: '6', refX: '0', refY: '3', orient: 'auto' });
                var polyB = createSVGElement('polygon', { points: '8 0, 0 3, 8 6', fill: '#3498db' });
                markerB.appendChild(polyB);
                defs.appendChild(markerB);
            }
            velocityArrow.setAttribute('marker-end', 'url(#arrowhead-' + (animV > 0 ? 'red' : 'blue') + ')');
        }

        var vLabel = createSVGElement('text', {
            x: toX(animT), y: trackY - 28,
            'text-anchor': 'middle', fill: '#333', 'font-size': 11, 'font-weight': 'bold'
        });
        vLabel.textContent = 'v=' + animV.toFixed(1);
        g.appendChild(vLabel);
    }

    function bindEvents(root) {
        // 图类型切换按钮
        var btns = root.querySelectorAll('.phys-graph-btn');
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', function () {
                state.graphType = this.getAttribute('data-gtype');
                // 更新对应模式
                if (state.graphType === 'vt' || state.graphType === 'st' || state.graphType === 'at') {
                    state.mode = 'kinematics';
                    state.scenario = 'accel-cruise-decel';
                    applyScenario(SCENARIOS.kinematics[0]);
                } else if (state.graphType === 'ui' || state.graphType === 'pt') {
                    state.mode = 'electrical';
                    state.scenario = 'power-ext';
                    var es = SCENARIOS.electrical[0];
                    state.params.E = es.E;
                    state.params.r = es.r;
                } else {
                    state.mode = 'mechanics';
                    state.scenario = 'spring-fx';
                    var ms = SCENARIOS.mechanics[0];
                    state.params.k = ms.k;
                }
                render();
            });
        }

        // 场景选择
        var sel = root.querySelector('#phys-scenario-select');
        if (sel) {
            sel.addEventListener('change', function () {
                state.scenario = this.value;
                applyCurrentScenario();
                render();
            });
        }

        // 滑块变化
        var sliders = root.querySelectorAll('.phys-slider');
        for (var j = 0; j < sliders.length; j++) {
            sliders[j].addEventListener('input', function () {
                var paramName = this.getAttribute('data-param');
                var val = parseFloat(this.value);
                updateParam(paramName, val);
                // 更新显示值
                var valSpan = root.querySelector('#phys-val-' + paramName);
                if (valSpan) valSpan.textContent = val;
                drawGraph(root);
                updateBottomPanel(root);
            });
        }

        // SVG鼠标交互
        var svgEl = root.querySelector('#phys-svg');
        if (svgEl) {
            svgEl.addEventListener('mousemove', function (e) {
                handleSVGHover(e, root);
            });
            svgEl.addEventListener('mouseleave', function () {
                var tip = root.querySelector('#phys-tooltip');
                if (tip) tip.style.display = 'none';
            });
        }

        // 动画循环
        startAnimation(root);
    }

    function applyCurrentScenario() {
        var modeKey;
        var graphType = state.graphType;
        if (graphType === 'vt' || graphType === 'st' || graphType === 'at') {
            modeKey = 'kinematics';
        } else if (graphType === 'ui' || graphType === 'pt') {
            modeKey = 'electrical';
        } else {
            modeKey = 'mechanics';
        }
        var scenarios = SCENARIOS[modeKey];
        for (var i = 0; i < scenarios.length; i++) {
            if (scenarios[i].id === state.scenario) {
                applyScenario(scenarios[i]);
                return;
            }
        }
    }

    function applyScenario(sc) {
        if (sc.v0 !== undefined) state.params.v0 = sc.v0;
        if (sc.a !== undefined) state.params.a = sc.a.slice();
        if (sc.t !== undefined) state.params.t = sc.t.slice();
        if (sc.E !== undefined) state.params.E = sc.E;
        if (sc.r !== undefined) state.params.r = sc.r;
        if (sc.R !== undefined) state.params.R = sc.R;
        if (sc.k !== undefined) state.params.k = sc.k;
        if (sc.m !== undefined) state.params.m = sc.m;
        if (sc.mu !== undefined) state.params.mu = sc.mu;
        if (sc.P0 !== undefined) state.params.P0 = sc.P0;
    }

    function updateParam(name, val) {
        if (name === 'v0') state.params.v0 = val;
        if (name === 'a0') state.params.a[0] = val;
        if (name === 'a1') state.params.a[1] = val;
        if (name === 'a2') state.params.a[2] = val;
        if (name === 't0') state.params.t[0] = val;
        if (name === 't1') state.params.t[1] = val;
        if (name === 't2') state.params.t[2] = val;
        if (name === 'E') state.params.E = val;
        if (name === 'r') state.params.r = val;
        if (name === 'R') state.params.R = val;
        if (name === 'P0') state.params.P0 = val;
        if (name === 'k') state.params.k = val;
        if (name === 'm') state.params.m = val;
        if (name === 'xMax') state.params.xMax = val;
    }

    function handleSVGHover(e, root) {
        var svgEl = root.querySelector('#phys-svg');
        var tip = root.querySelector('#phys-tooltip');
        if (!svgEl || !tip) return;

        var data = svgEl._physData;
        if (!data) return;

        var rect = svgEl.getBoundingClientRect();
        var mx = e.clientX - rect.left - data.margin.left;
        var my = e.clientY - rect.top - data.margin.top;

        if (mx < 0 || mx > data.pw || my < 0 || my > data.ph) {
            tip.style.display = 'none';
            return;
        }

        // 逆映射
        var xVal = data.xMin + mx / data.pw * (data.xMax - data.xMin);
        var yVal = data.yMax - my / data.ph * (data.yMax - data.yMin);

        var xName = 't';
        var yName = 'v';
        if (data.graphType === 'st') { xName = 't'; yName = 's'; }
        if (data.graphType === 'at') { xName = 't'; yName = 'a'; }
        if (data.graphType === 'fx') { xName = 'x'; yName = 'F'; }
        if (data.graphType === 'ui') { xName = 'I'; yName = 'U'; }
        if (data.graphType === 'pt') { xName = 't'; yName = 'P'; }

        tip.style.display = 'block';
        tip.style.left = (e.clientX + 15) + 'px';
        tip.style.top = (e.clientY - 30) + 'px';
        tip.innerHTML = '(' + xName + '=' + xVal.toFixed(2) + ', ' + yName + '=' + yVal.toFixed(2) + ')';
    }

    function updateBottomPanel(root) {
        var bottom = root.querySelector('#phys-bottom');
        if (!bottom) return;
        var features = calcFeatures(state.graphType);
        var html = '<strong style="color:#1a73e8;">关键特征：</strong> ';
        for (var i = 0; i < features.length; i++) {
            html += '<span style="display:inline-block;margin-right:12px;padding:2px 8px;background:#fff;border-radius:4px;border:1px solid #d0e4ff;">' + features[i] + '</span>';
        }
        bottom.innerHTML = html;
    }

    var animationId = null;
    function startAnimation(root) {
        if (animationId) cancelAnimationFrame(animationId);
        function loop() {
            state.animTime += 0.05;
            var svgEl = root.querySelector('#phys-svg');
            if (svgEl && (state.graphType === 'vt' || state.graphType === 'st' || state.graphType === 'at')) {
                // 更新小球位置（简单重绘）
                drawGraph(root);
            }
            animationId = requestAnimationFrame(loop);
        }
        loop();
    }

    return {
        render: render,
        state: state,
        SCENARIOS: SCENARIOS
    };
})();

// ============================================================
// 模块2: punnettSquareCalc（遗传棋盘法智能计算器）
// ============================================================
window.punnettSquareCalc = (function () {
    var state = {
        parent1: 'AaBb',
        parent2: 'AaBb',
        geneticType: 'autosomal',   // autosomal | x-linked | y-linked
        lethalGenotypes: [],          // 致死基因型列表
        showBloodType: false
    };

    var PRESETS = [
        { name: '豌豆杂交 AaBb×AaBb', p1: 'AaBb', p2: 'AaBb', type: 'autosomal', lethal: [] },
        { name: '果蝇眼色 X^W X^w × X^W Y', p1: 'X^W X^w', p2: 'X^W Y', type: 'x-linked', lethal: [] },
        { name: 'ABO血型 I^A i × I^B i', p1: 'I^A i', p2: 'I^B i', type: 'autosomal', lethal: [] },
        { name: '致死基因 Aa × Aa (AA致死)', p1: 'Aa', p2: 'Aa', type: 'autosomal', lethal: ['AA'] },
        { name: '三对等位基因 AaBbCc × AaBbCc', p1: 'AaBbCc', p2: 'AaBbCc', type: 'autosomal', lethal: [] },
        { name: '伴X隐性遗传 X^A X^a × X^A Y', p1: 'X^A X^a', p2: 'X^A Y', type: 'x-linked', lethal: [] }
    ];

    function parseGenotype(geno, geneticType) {
        // 解析基因型字符串，返回等位基因对数组
        // 格式：AaBb 或 X^AX^a 或 I^Ai
        geno = geno.replace(/\s+/g, '');
        var pairs = [];

        if (geneticType === 'x-linked') {
            // 伴X遗传：X^A X^a 或 X^A Y
            var parts = geno.match(/X\^?\w*/g) || [];
            // 处理 X^A 格式
            var alleles = [];
            var re = /X(?:\^(\w+))?/g;
            var match;
            while ((match = re.exec(geno)) !== null) {
                alleles.push(match[1] || match[0].replace('X', ''));
            }
            // 检查是否包含Y
            var hasY = geno.indexOf('Y') >= 0;
            if (alleles.length === 0 && hasY) {
                // X^A Y 格式，用另一种匹配
                var xPart = geno.split(/[Y\s]/)[0].replace('X', '').replace('^', '');
                alleles = xPart ? [xPart] : [];
            }
            pairs = [{ alleles: alleles, hasY: hasY }];
        } else {
            // 常染色体：AaBb -> [['A','a'], ['B','b']]
            // 复等位基因：I^Ai -> [['I^A','i']]
            var re2 = /([A-Z]\^?\w*)([a-z]\^?\w*|[A-Z]\^?\w*)/g;
            while ((match = re2.exec(geno)) !== null) {
                pairs.push([match[1], match[2]]);
            }
            // 如果上面的正则不匹配，尝试简单的逐对拆分
            if (pairs.length === 0 && geno.length >= 2) {
                // 尝试AaBb格式
                var re3 = /([A-Z][a-z]?)/g;
                var chunks = geno.match(re3) || [];
                for (var i = 0; i < chunks.length; i += 2) {
                    if (i + 1 < chunks.length) {
                        pairs.push([chunks[i], chunks[i + 1]]);
                    }
                }
            }
        }
        return pairs;
    }

    function generateGametes(pairs, geneticType) {
        // 根据等位基因对生成所有可能的配子
        if (geneticType === 'x-linked') {
            var pair = pairs[0];
            var gametes = [];
            if (pair && pair.alleles) {
                for (var i = 0; i < pair.alleles.length; i++) {
                    gametes.push('X^' + pair.alleles[i]);
                }
                if (pair.hasY) {
                    gametes.push('Y');
                } else {
                    // 女性有两个X等位基因
                }
            }
            // 如果没有解析到alleles，尝试直接拆分
            if (gametes.length === 0 && pair) {
                // 针对X^A X^a格式
                var raw = JSON.stringify(pair);
            }
            return gametes.length > 0 ? gametes : ['X^A'];
        }

        // 常染色体
        if (pairs.length === 0) return [''];
        var combos = [''];
        for (var i = 0; i < pairs.length; i++) {
            var newCombos = [];
            for (var j = 0; j < combos.length; j++) {
                newCombos.push(combos[j] + pairs[i][0]);
                newCombos.push(combos[j] + pairs[i][1]);
            }
            combos = newCombos;
        }
        return combos;
    }

    function buildPunnettSquare(gametes1, gametes2) {
        var rows = gametes2.length;
        var cols = gametes1.length;
        var grid = [];
        for (var r = 0; r < rows; r++) {
            grid[r] = [];
            for (var c = 0; c < cols; c++) {
                var geno = combineGenes(gametes2[r], gametes1[c]);
                grid[r][c] = geno;
            }
        }
        return grid;
    }

    function combineGenes(g1, g2) {
        // 将两个配子的基因组合成合子基因型
        if (!g1 || !g2) return g1 + g2;
        // 常染色体: g1='AB', g2='Ab' -> 'AABb'
        if (g1.indexOf('X') >= 0 || g2.indexOf('X') >= 0 || g1 === 'Y' || g2 === 'Y') {
            // 伴性：X^A + X^a -> X^A X^a, X^A + Y -> X^A Y
            if (g1 === 'Y' && g2 === 'Y') return 'YY (致死)';
            if (g1 === 'Y') return g2 + ' Y';
            if (g2 === 'Y') return g1 + ' Y';
            return g1 + ' ' + g2;
        }

        // 按基因对重组，如 AB + Ab = AABb
        var result = '';
        var len = Math.min(g1.length, g2.length);
        for (var i = 0; i < len; i += 2) {
            var a1 = g1.charAt(i);
            var a2 = g1.charAt(i + 1) || '';
            var b1 = g2.charAt(i);
            var b2 = g2.charAt(i + 1) || '';
            // 按字母顺序排列显性在前
            var pair = [a1, b1];
            pair.sort(function (x, y) {
                if (x === x.toUpperCase() && y === y.toLowerCase()) return -1;
                if (x === x.toLowerCase() && y === y.toUpperCase()) return 1;
                return x < y ? -1 : 1;
            });
            result += pair[0] + pair[1];
        }
        return result;
    }

    function isParentalGenotype(genotype, parent1, parent2) {
        // 判断是否为亲本型（与父母基因型相同）
        return genotype === parent1 || genotype === parent2;
    }

    function isHomozygous(genotype, geneticType) {
        if (geneticType === 'x-linked') return false;
        // 纯合子判断：每个基因对是否两个等位基因相同
        if (!genotype || genotype.indexOf('Y') >= 0) return false;
        for (var i = 0; i < genotype.length; i += 2) {
            if (i + 1 < genotype.length && genotype[i] !== genotype[i + 1]) {
                return false;
            }
        }
        return true;
    }

    function isLethal(genotype, lethalList) {
        for (var i = 0; i < lethalList.length; i++) {
            if (genotype.indexOf(lethalList[i]) >= 0) {
                // 简化：如果基因型包含致死基因型字符串
                return true;
            }
        }
        // 更严格的检查：重组后基因型与致死基因型匹配
        for (var j = 0; j < lethalList.length; j++) {
            var lethal = lethalList[j];
            if (lethal.length === 2 && genotype.length >= 2) {
                // 检查每对等位基因
                for (var k = 0; k < genotype.length; k += 2) {
                    if (genotype.substr(k, 2) === lethal) return true;
                }
            }
            if (genotype === lethal) return true;
        }
        return false;
    }

    function classifyGenotype(genotype, parent1, parent2, lethalList, geneticType) {
        var classes = [];
        if (isLethal(genotype, lethalList)) {
            classes.push('lethal');
        }
        if (isParentalGenotype(genotype, parent1, parent2)) {
            classes.push('parental');
        } else if (classes.indexOf('lethal') < 0) {
            classes.push('recombinant');
        }
        if (isHomozygous(genotype, geneticType)) {
            classes.push('homozygous');
        } else {
            classes.push('heterozygous');
        }
        return classes;
    }

    function getCellStyle(genotype, parent1, parent2, lethalList, geneticType) {
        var classes = classifyGenotype(genotype, parent1, parent2, lethalList, geneticType);
        var bg = '#fff';
        var border = '1px solid #ddd';

        if (classes.indexOf('lethal') >= 0) {
            bg = '#e0e0e0';
            border = '1px solid #999';
        } else if (classes.indexOf('parental') >= 0) {
            bg = '#dbe9ff';
            border = '1px solid #90b4e0';
        } else if (classes.indexOf('recombinant') >= 0) {
            bg = '#ffe8d6';
            border = '1px solid #e0b090';
        }

        if (classes.indexOf('homozygous') >= 0 && classes.indexOf('lethal') < 0) {
            border = '2px solid #333';
        }
        if (classes.indexOf('heterozygous') >= 0 && classes.indexOf('lethal') < 0 && classes.indexOf('parental') < 0 && classes.indexOf('recombinant') < 0) {
            bg = '#f9f9f9';
        }

        return 'background:' + bg + ';border:' + border + ';padding:4px 6px;text-align:center;font-size:12px;min-width:60px;white-space:nowrap;';
    }

    function getCellColorClass(genotype, parent1, parent2, lethalList) {
        if (isLethal(genotype, lethalList)) return 'lethal';
        if (isParentalGenotype(genotype, parent1, parent2)) return 'parental';
        return 'recombinant';
    }

    function getPhenotype(genotype, geneticType) {
        // 简化表现型判断
        if (!genotype || genotype.indexOf('致死') >= 0) return '致死';
        if (geneticType === 'x-linked') {
            // 伴X：显性等位基因决定表现型
            if (genotype.indexOf('Y') >= 0 && genotype.indexOf('X^') >= 0) {
                // 男性：X等位基因决定
                var xMatch = genotype.match(/X\^(\w+)/);
                if (xMatch) return 'X^' + xMatch[1] + '型(♂)';
                return genotype + '(♂)';
            }
            if (genotype.indexOf('Y') < 0) {
                // 女性
                var xMatches = genotype.match(/X\^(\w+)/g);
                if (xMatches && xMatches.length === 2) {
                    var a1 = xMatches[0].replace('X^', '');
                    var a2 = xMatches[1].replace('X^', '');
                    if (a1 === a1.toUpperCase() || a2 === a2.toUpperCase()) return '显性型(♀)';
                    return '隐性型(♀)';
                }
            }
            return genotype;
        }
        // 常染色体：提取大写字母判断显性
        if (genotype === 'YY') return '致死';
        var phenotype = '';
        for (var i = 0; i < genotype.length; i += 2) {
            if (i + 1 < genotype.length) {
                var a = genotype[i];
                var b = genotype[i + 1];
                if (a === a.toUpperCase()) {
                    phenotype += a + '_';
                } else if (b === b.toUpperCase()) {
                    phenotype += b + '_';
                } else {
                    phenotype += a + b;
                }
            } else {
                phenotype += genotype[i];
            }
        }
        return phenotype.replace(/_$/g, '') || genotype;
    }

    function analyzeResults(grid, gametes1, gametes2, parent1, parent2, lethalList, geneticType) {
        var total = 0;
        var viable = 0;
        var phenotypeCount = {};
        var genotypeCount = {};
        var rows = grid.length;
        var cols = grid[0] ? grid[0].length : 0;

        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                var geno = grid[r][c];
                total++;
                if (isLethal(geno, lethalList)) continue;
                viable++;

                // 基因型计数
                genotypeCount[geno] = (genotypeCount[geno] || 0) + 1;

                // 表现型计数
                var pheno = getPhenotype(geno, geneticType);
                phenotypeCount[pheno] = (phenotypeCount[pheno] || 0) + 1;
            }
        }

        // 排序
        var phenoList = [];
        for (var key in phenotypeCount) {
            if (phenotypeCount.hasOwnProperty(key)) {
                phenoList.push({ phenotype: key, count: phenotypeCount[key], ratio: viable > 0 ? (phenotypeCount[key] / viable) : 0 });
            }
        }
        phenoList.sort(function (a, b) { return b.count - a.count; });

        var genoList = [];
        for (var key2 in genotypeCount) {
            if (genotypeCount.hasOwnProperty(key2)) {
                genoList.push({ genotype: key2, count: genotypeCount[key2], ratio: viable > 0 ? (genotypeCount[key2] / viable) : 0 });
            }
        }
        genoList.sort(function (a, b) { return b.count - a.count; });

        return {
            total: total,
            viable: viable,
            lethalCount: total - viable,
            phenotypeList: phenoList,
            genotypeList: genoList
        };
    }

    function render(containerId) {
        var cid = containerId || 'punnett-square-app';
        var root = document.getElementById(cid);
        if (!root) return;
        try {
            root.innerHTML = buildHTML();
            bindEvents(root);
            updateDisplay(root);
        } catch (err) {
            console.error('遗传棋盘计算器渲染失败:', err);
        }
    }

    function buildHTML() {
        var html = '<div style="font-family:Arial,Helvetica,sans-serif;max-width:860px;margin:0 auto;">';
        // 标题
        html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;">';
        html += '<span style="font-size:18px;font-weight:bold;color:#2c3e50;">Punnett Square 遗传棋盘计算器</span>';
        html += '<button id="ps-reset-btn" style="padding:6px 14px;background:#1a73e8;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">重置</button>';
        html += '</div>';

        // 输入面板
        html += '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:10px;">';
        html += buildInputPanel();
        html += '</div>';

        // 棋盘格
        html += '<div id="ps-grid-container" style="overflow-x:auto;margin-bottom:10px;"></div>';

        // 汇总区
        html += '<div id="ps-summary-container"></div>';

        // 图例
        html += '<div style="display:flex;flex-wrap:wrap;gap:16px;padding:8px 12px;background:#f8f9fa;border-radius:8px;font-size:11px;margin-top:8px;">';
        html += '<span><span style="display:inline-block;width:16px;height:16px;background:#dbe9ff;border:1px solid #90b4e0;vertical-align:middle;margin-right:4px;"></span>亲本型（蓝色）</span>';
        html += '<span><span style="display:inline-block;width:16px;height:16px;background:#ffe8d6;border:1px solid #e0b090;vertical-align:middle;margin-right:4px;"></span>重组型（橙色）</span>';
        html += '<span><span style="display:inline-block;width:16px;height:16px;background:#e0e0e0;border:1px solid #999;vertical-align:middle;margin-right:4px;"></span>胚胎致死（灰色）</span>';
        html += '<span><span style="display:inline-block;width:16px;height:16px;background:#fff;border:2px solid #333;vertical-align:middle;margin-right:4px;"></span>纯合子（粗边框）</span>';
        html += '</div>';

        html += '</div>';
        return html;
    }

    function buildInputPanel() {
        var html = '';

        // 预置经典题
        html += '<div style="width:100%;">';
        html += '<label style="font-size:12px;font-weight:bold;color:#555;">预置经典题：</label>';
        html += '<select id="ps-preset-select" style="margin-left:8px;padding:4px 8px;font-size:12px;border:1px solid #ccc;border-radius:4px;">';
        html += '<option value="">-- 选择预置 --</option>';
        for (var i = 0; i < PRESETS.length; i++) {
            html += '<option value="' + i + '">' + PRESETS[i].name + '</option>';
        }
        html += '</select></div>';

        // 亲本输入行
        html += '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:8px;">';

        html += '<div>';
        html += '<label style="font-size:11px;color:#666;">亲本1基因型</label><br>';
        html += '<input id="ps-p1-input" type="text" value="' + state.parent1 + '" style="width:140px;padding:4px 8px;border:1px solid #ccc;border-radius:4px;font-size:13px;">';
        html += '</div>';

        html += '<span style="font-size:18px;font-weight:bold;color:#e74c3c;">×</span>';

        html += '<div>';
        html += '<label style="font-size:11px;color:#666;">亲本2基因型</label><br>';
        html += '<input id="ps-p2-input" type="text" value="' + state.parent2 + '" style="width:140px;padding:4px 8px;border:1px solid #ccc;border-radius:4px;font-size:13px;">';
        html += '</div>';

        // 遗传类型
        html += '<div>';
        html += '<label style="font-size:11px;color:#666;">遗传类型</label><br>';
        html += '<select id="ps-type-select" style="padding:4px 8px;font-size:12px;border:1px solid #ccc;border-radius:4px;">';
        html += '<option value="autosomal"' + (state.geneticType === 'autosomal' ? ' selected' : '') + '>常染色体遗传</option>';
        html += '<option value="x-linked"' + (state.geneticType === 'x-linked' ? ' selected' : '') + '>伴X遗传</option>';
        html += '<option value="y-linked"' + (state.geneticType === 'y-linked' ? ' selected' : '') + '>伴Y遗传</option>';
        html += '</select></div>';

        // 致死基因
        html += '<div>';
        html += '<label style="font-size:11px;color:#666;">胚胎致死基因型</label><br>';
        html += '<input id="ps-lethal-input" type="text" value="' + state.lethalGenotypes.join(', ') + '" placeholder="如: AA" style="width:120px;padding:4px 8px;border:1px solid #ccc;border-radius:4px;font-size:12px;">';
        html += '</div>';

        // 计算按钮
        html += '<button id="ps-calc-btn" style="padding:6px 16px;background:#27ae60;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;align-self:flex-end;">计算</button>';

        html += '</div>';

        return html;
    }

    function updateDisplay(root) {
        var gridContainer = root.querySelector('#ps-grid-container');
        var summaryContainer = root.querySelector('#ps-summary-container');
        if (!gridContainer || !summaryContainer) return;

        var pairs1 = parseGenotype(state.parent1, state.geneticType);
        var pairs2 = parseGenotype(state.parent2, state.geneticType);
        var gametes1 = generateGametes(pairs1, state.geneticType);
        var gametes2 = generateGametes(pairs2, state.geneticType);
        var grid = buildPunnettSquare(gametes1, gametes2);
        var analysis = analyzeResults(grid, gametes1, gametes2, state.parent1, state.parent2, state.lethalGenotypes, state.geneticType);

        gridContainer.innerHTML = buildGridHTML(grid, gametes1, gametes2, analysis);
        summaryContainer.innerHTML = buildSummaryHTML(analysis, gametes1, gametes2, grid);
    }

    function buildGridHTML(grid, gametes1, gametes2, analysis) {
        var rows = gametes2.length;
        var cols = gametes1.length;
        if (rows === 0 || cols === 0) return '<div style="padding:20px;color:#999;">请输入有效的基因型</div>';

        var html = '<table style="border-collapse:collapse;margin:0 auto;font-size:12px;">';

        // 表头行
        html += '<tr>';
        html += '<td style="background:#ecf0f1;border:1px solid #bdc3c7;padding:4px 8px;text-align:center;font-weight:bold;color:#7f8c8d;min-width:50px;"></td>';
        html += '<td style="background:#ecf0f1;border:1px solid #bdc3c7;padding:4px 8px;text-align:center;font-weight:bold;color:#7f8c8d;" colspan="' + cols + '">亲本1配子 →</td>';
        html += '</tr>';

        html += '<tr>';
        html += '<td style="background:#ecf0f1;border:1px solid #bdc3c7;padding:4px 8px;text-align:center;font-weight:bold;color:#7f8c8d;">亲本2配子 ↓</td>';
        for (var c = 0; c < cols; c++) {
            html += '<td style="background:#f0f3f5;border:1px solid #bdc3c7;padding:4px 10px;text-align:center;font-weight:bold;color:#2c3e50;">' + gametes1[c] + '</td>';
        }
        html += '</tr>';

        // 数据行
        for (var r = 0; r < rows; r++) {
            html += '<tr>';
            html += '<td style="background:#f0f3f5;border:1px solid #bdc3c7;padding:4px 10px;text-align:center;font-weight:bold;color:#2c3e50;">' + gametes2[r] + '</td>';
            for (var c2 = 0; c2 < cols; c2++) {
                var geno = grid[r][c2];
                var isL = isLethal(geno, state.lethalGenotypes);
                var cellStyle = getCellStyle(geno, state.parent1, state.parent2, state.lethalGenotypes, state.geneticType);
                var prob = '1/' + (rows * cols);
                if (isL) {
                    prob = '致死';
                }
                html += '<td style="' + cellStyle + '">' + (isL ? '<s>' + geno + '</s>' : '<b>' + geno + '</b>') + '<br><span style="font-size:10px;color:#888;">' + prob + '</span></td>';
            }
            html += '</tr>';
        }

        html += '</table>';

        // 汇总概率
        html += '<div style="text-align:center;margin-top:8px;font-size:12px;color:#555;">';
        html += '总组合数：' + (rows * cols) + ' | ';
        html += '存活：' + analysis.viable + ' | ';
        html += '致死：' + analysis.lethalCount;
        html += '</div>';

        return html;
    }

    function buildSummaryHTML(analysis, gametes1, gametes2, grid) {
        var html = '';

        // 表现型比例
        html += '<div style="display:flex;flex-wrap:wrap;gap:12px;">';

        html += '<div style="flex:1;min-width:280px;background:#f8f9fa;border-radius:8px;padding:12px;">';
        html += '<div style="font-weight:bold;color:#2c3e50;margin-bottom:8px;font-size:14px;">表现型及比例</div>';
        if (analysis.phenotypeList.length === 0) {
            html += '<span style="color:#999;">无存活后代</span>';
        } else {
            html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
            for (var i = 0; i < analysis.phenotypeList.length; i++) {
                var p = analysis.phenotypeList[i];
                var pct = (p.ratio * 100).toFixed(1);
                var ratioStr = simplifyRatio(p.count, analysis.viable);
                html += '<div style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:6px 10px;text-align:center;">';
                html += '<div style="font-weight:bold;color:#1a73e8;">' + p.phenotype + '</div>';
                html += '<div style="font-size:11px;color:#555;">' + ratioStr + ' (' + pct + '%)</div>';
                html += '</div>';
            }
            html += '</div>';
        }
        html += '</div>';

        // 基因型比例
        html += '<div style="flex:1;min-width:280px;background:#f8f9fa;border-radius:8px;padding:12px;">';
        html += '<div style="font-weight:bold;color:#2c3e50;margin-bottom:8px;font-size:14px;">基因型及比例</div>';
        if (analysis.genotypeList.length === 0) {
            html += '<span style="color:#999;">无存活后代</span>';
        } else {
            html += '<div style="max-height:200px;overflow-y:auto;">';
            html += '<table style="width:100%;border-collapse:collapse;font-size:12px;">';
            for (var j = 0; j < analysis.genotypeList.length; j++) {
                var g = analysis.genotypeList[j];
                var gpct = (g.ratio * 100).toFixed(1);
                var isH = isHomozygous(g.genotype, state.geneticType);
                html += '<tr style="border-bottom:1px solid #eee;">';
                html += '<td style="padding:3px 0;' + (isH ? 'font-weight:bold;' : '') + '">' + (isH ? '⊕ ' : '') + g.genotype + '</td>';
                html += '<td style="text-align:right;color:#888;">' + simplifyRatio(g.count, analysis.viable) + '</td>';
                html += '<td style="text-align:right;color:#888;">' + gpct + '%</td>';
                html += '</tr>';
            }
            html += '</table></div>';
        }
        html += '</div>';

        html += '</div>';

        // 重组率
        var recomCount = 0;
        var rows = grid.length;
        var cols = grid[0] ? grid[0].length : 0;
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                var gns = grid[r][c];
                if (!isLethal(gns, state.lethalGenotypes) && !isParentalGenotype(gns, state.parent1, state.parent2)) {
                    recomCount++;
                }
            }
        }
        if (analysis.viable > 0) {
            var recomRate = (recomCount / analysis.viable * 100).toFixed(1);
            html += '<div style="margin-top:8px;padding:6px 12px;background:#fef9e7;border-radius:6px;font-size:12px;color:#7d6608;">';
            html += '重组率：' + recomRate + '% （重组型 ' + recomCount + '/' + analysis.viable + '）';
            html += '</div>';
        }

        return html;
    }

    function simplifyRatio(num, denom) {
        if (denom === 0) return num + '/0';
        function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
        var g = gcd(num, denom);
        return (num / g) + ':' + (denom / g);
    }

    function bindEvents(root) {
        var calcBtn = root.querySelector('#ps-calc-btn');
        if (calcBtn) {
            calcBtn.addEventListener('click', function () {
                readInputs(root);
                updateDisplay(root);
            });
        }

        var resetBtn = root.querySelector('#ps-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function () {
                state.parent1 = 'AaBb';
                state.parent2 = 'AaBb';
                state.geneticType = 'autosomal';
                state.lethalGenotypes = [];
                render();
            });
        }

        var presetSel = root.querySelector('#ps-preset-select');
        if (presetSel) {
            presetSel.addEventListener('change', function () {
                var idx = parseInt(this.value);
                if (idx >= 0 && idx < PRESETS.length) {
                    applyPreset(PRESETS[idx]);
                    render();
                }
            });
        }

        // 输入框回车触发
        var p1Input = root.querySelector('#ps-p1-input');
        var p2Input = root.querySelector('#ps-p2-input');
        if (p1Input) {
            p1Input.addEventListener('keypress', function (e) {
                if (e.keyCode === 13) { readInputs(root); updateDisplay(root); }
            });
        }
        if (p2Input) {
            p2Input.addEventListener('keypress', function (e) {
                if (e.keyCode === 13) { readInputs(root); updateDisplay(root); }
            });
        }
    }

    function readInputs(root) {
        var p1Input = root.querySelector('#ps-p1-input');
        var p2Input = root.querySelector('#ps-p2-input');
        var typeSel = root.querySelector('#ps-type-select');
        var lethalInput = root.querySelector('#ps-lethal-input');

        if (p1Input) state.parent1 = p1Input.value.trim();
        if (p2Input) state.parent2 = p2Input.value.trim();
        if (typeSel) state.geneticType = typeSel.value;
        if (lethalInput) {
            var raw = lethalInput.value.trim();
            state.lethalGenotypes = raw ? raw.split(/[,，\s]+/) : [];
        }
    }

    function applyPreset(preset) {
        state.parent1 = preset.p1;
        state.parent2 = preset.p2;
        state.geneticType = preset.type;
        state.lethalGenotypes = preset.lethal ? preset.lethal.slice() : [];
    }

    return {
        render: render,
        state: state,
        PRESETS: PRESETS,
        parseGenotype: parseGenotype,
        generateGametes: generateGametes,
        buildPunnettSquare: buildPunnettSquare,
        analyzeResults: analyzeResults
    };
})();

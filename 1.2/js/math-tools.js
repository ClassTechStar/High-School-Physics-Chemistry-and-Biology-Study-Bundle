// ============================================================
// js/math-tools.js — 数学交互式工具模块(6个工具)
// ============================================================

// 安全的数学表达式求值器（替代 eval，防止 XSS 代码注入）
// 仅允许数字、小数点、运算符(+ - * / ^)、括号、字母变量与 Math.* 调用
function safeMathEval(expr) {
    // 严格字符校验：只允许数字、小数点、运算符、括号、字母变量
    if (!/^[\d\s+\-*/^().a-zA-Z]+$/.test(expr)) {
        throw new Error('表达式包含非法字符');
    }
    // 禁止 JavaScript 关键字及危险全局标识符（含子串匹配）
    var forbidden = ['function', 'return', 'var', 'let', 'const', 'window', 'document', 'eval', 'this', 'new',
        'fetch', 'XMLHttpRequest', 'location', 'navigator', 'cookie', 'localStorage', 'sessionStorage',
        'Function', 'constructor', 'prototype', '__proto__', 'globalThis', 'import', 'require',
        'alert', 'confirm', 'prompt', 'open', 'write', 'innerHTML', 'outerHTML', 'srcdoc',
        'setTimeout', 'setInterval', 'requestAnimationFrame', 'postMessage', 'importScripts'];
    for (var i = 0; i < forbidden.length; i++) {
        if (expr.indexOf(forbidden[i]) !== -1) {
            throw new Error('表达式包含禁用关键字: ' + forbidden[i]);
        }
    }
    // 将 ^ 替换为 **（幂运算），调用方已将字母变量替换为数字
    var safeExpr = expr.replace(/\^/g, '**');
    // 使用 Function 构造器（比 eval 安全，作用域隔离，无法访问局部作用域链）
    return Function('"use strict"; return (' + safeExpr + ')')();
}

window.mathGrapher = (function() {
    'use strict';
    var state = { functions: [], xMin: -10, xMax: 10, zoom: 1 };

    function parseAndEval(expr, x) {
        try {
            var s = expr.replace(/\^/g, '**').replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos').replace(/tan/g, 'Math.tan').replace(/exp/g, 'Math.exp').replace(/log/g, 'Math.log').replace(/sqrt/g, 'Math.sqrt').replace(/abs/g, 'Math.abs').replace(/pi/gi, 'Math.PI').replace(/e(?!xp)/gi, 'Math.E').replace(/(\d)(x)/g, '$1*$2').replace(/\)\(/g, ')*(').replace(/(\d)\(/g, '$1*(').replace(/\)(\d)/g, ')*$1').replace(/\)x/g, ')*x');
            var result = safeMathEval(s.replace(/x/g, '(' + x + ')'));
            return isFinite(result) ? result : NaN;
        } catch(e) {
            console.error('数学计算错误:', e.message, '表达式:', expr);
            return NaN;
        }
    }

    function drawCanvas() {
        var canvas = document.getElementById('grapher-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        var xRange = (state.xMax - state.xMin) / state.zoom;
        var yRange = 20 / state.zoom;
        var xScale = w / xRange, yScale = h / yRange;
        var x0 = -state.xMin * xScale, y0 = 10 * yScale;
        ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1;
        for (var i = Math.floor(state.xMin / state.zoom); i <= Math.ceil(state.xMax / state.zoom); i++) {
            var px = x0 + i * xScale * state.zoom;
            ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
        }
        for (var j = -10; j <= 10; j++) {
            var py = y0 - j * yScale * state.zoom;
            ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w, py); ctx.stroke();
        }
        ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(w, y0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, h); ctx.stroke();
        ctx.fillStyle = '#333'; ctx.font = '11px sans-serif';
        for (var i2 = Math.floor(state.xMin / state.zoom); i2 <= Math.ceil(state.xMax / state.zoom); i2++) {
            if (i2 === 0) continue;
            ctx.fillText(i2, x0 + i2 * xScale * state.zoom + 3, y0 + 14);
        }
        for (var j2 = -10; j2 <= 10; j2++) {
            if (j2 === 0) continue;
            ctx.fillText(j2, x0 + 4, y0 - j2 * yScale * state.zoom - 3);
        }
        for (var k = 0; k < state.functions.length; k++) {
            var f = state.functions[k];
            ctx.strokeStyle = f.color; ctx.lineWidth = 2.5;
            ctx.beginPath();
            var first = true;
            var steps = w * 2;
            for (var si = 0; si <= steps; si++) {
                var xv = state.xMin / state.zoom + (si / steps) * xRange;
                var yv = parseAndEval(f.expr, xv);
                var px3 = x0 + xv * xScale, py3 = y0 - yv * yScale;
                if (isNaN(yv) || py3 < -100 || py3 > h + 100) { first = true; continue; }
                if (first) { ctx.moveTo(px3, py3); first = false; }
                else { ctx.lineTo(px3, py3); }
            }
            ctx.stroke();
        }
    }

    function renderGrapher() {
        var container = document.getElementById('math-grapher-app');
        if (!container) return;
        container.innerHTML = '<div class="tool-app-container" style="padding:16px;">' +
            '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;align-items:end;">' +
            '<div><label style="font-size:13px;color:#666;">f(x)=</label><br><input id="grapher-input" style="width:220px;padding:6px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;" placeholder="如: sin(x), x^2, 2*x+1"></div>' +
            '<div><label style="font-size:13px;color:#666;">颜色</label><br><select id="grapher-color" style="padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;"><option value="#ef4444">红</option><option value="#3b82f6">蓝</option><option value="#10b981">绿</option></select></div>' +
            '<button id="grapher-add" style="padding:7px 16px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">添加</button>' +
            '<button id="grapher-clear" style="padding:7px 16px;background:#ef4444;color:#fff;border:none;border-radius:6px;cursor:pointer;">清空</button>' +
            '<div><label style="font-size:13px;color:#666;">X范围</label><br><input id="grapher-xmin" type="number" value="-10" style="width:60px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"> ~ <input id="grapher-xmax" type="number" value="10" style="width:60px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div>' +
            '<button id="grapher-update" style="padding:7px 14px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;">更新</button>' +
            '</div>' +
            '<div id="grapher-funcs" style="margin-bottom:8px;font-size:13px;color:#555;"></div>' +
            '<canvas id="grapher-canvas" width="700" height="450" style="border:1px solid #e5e7eb;border-radius:8px;background:#fafbfc;width:100%;max-width:700px;"></canvas>' +
            '<div style="margin-top:8px;font-size:12px;color:#999;">支持: sin cos tan exp log sqrt abs ^ + - * / () | 如: sin(x), x^2-3*x+2, 2^x, sqrt(x)</div>' +
            '</div>';

        function updateFuncs() {
            var el = document.getElementById('grapher-funcs');
            var html = '';
            for (var i = 0; i < state.functions.length; i++) {
                html += '<span style="display:inline-block;margin-right:12px;color:' + state.functions[i].color + ';">f(x)=' + state.functions[i].expr + ' <a href="#" style="color:#999;font-size:11px;" data-idx="' + i + '">x</a></span>';
            }
            el.innerHTML = html;
            var links = el.querySelectorAll('a');
            for (var j = 0; j < links.length; j++) {
                links[j].onclick = function(e) { e.preventDefault(); var idx = parseInt(this.getAttribute('data-idx')); state.functions.splice(idx, 1); updateFuncs(); drawCanvas(); };
            }
        }
        document.getElementById('grapher-add').onclick = function() {
            var expr = document.getElementById('grapher-input').value.trim();
            var color = document.getElementById('grapher-color').value;
            if (!expr) return;
            state.functions.push({ expr: expr, color: color });
            updateFuncs(); drawCanvas();
        };
        document.getElementById('grapher-clear').onclick = function() { state.functions = []; updateFuncs(); drawCanvas(); };
        document.getElementById('grapher-update').onclick = function() {
            state.xMin = parseFloat(document.getElementById('grapher-xmin').value) || -10;
            state.xMax = parseFloat(document.getElementById('grapher-xmax').value) || 10;
            drawCanvas();
        };
        drawCanvas();
    }
    return { renderGrapher: renderGrapher };
})();

// ============================================================
// 模块2：mathDerivative - 导数计算器
// ============================================================
window.mathDerivative = (function() {
    'use strict';
    var derivativeRules = [
        { name: '常数', rule: 'C', derivative: '0', example: 'f(x)=5, f\'(x)=0' },
        { name: '幂函数', rule: 'x^n', derivative: 'n*x^(n-1)', example: 'f(x)=x^3, f\'(x)=3x^2' },
        { name: '正弦', rule: 'sin(x)', derivative: 'cos(x)', example: 'f(x)=sin(x), f\'(x)=cos(x)' },
        { name: '余弦', rule: 'cos(x)', derivative: '-sin(x)', example: 'f(x)=cos(x), f\'(x)=-sin(x)' },
        { name: '正切', rule: 'tan(x)', derivative: 'sec^2(x)', example: 'f(x)=tan(x), f\'(x)=sec^2(x)' },
        { name: '指数函数', rule: 'e^x', derivative: 'e^x', example: 'f(x)=e^x, f\'(x)=e^x' },
        { name: '指数函数底', rule: 'a^x', derivative: 'a^x*ln(a)', example: 'f(x)=2^x, f\'(x)=2^x*ln2' },
        { name: '自然对数', rule: 'ln(x)', derivative: '1/x', example: 'f(x)=ln(x), f\'(x)=1/x' },
        { name: '平方根', rule: 'sqrt(x)', derivative: '1/(2*sqrt(x))', example: 'f(x)=sqrt(x), f\'(x)=1/(2*sqrt(x))' },
        { name: '和差法则', rule: 'f±g', derivative: 'f\'±g\'', example: '(x^2+sin(x))\' = 2x+cos(x)' },
        { name: '积法则', rule: 'f*g', derivative: 'f\'g+f*g\'', example: '(x*sin(x))\' = sin(x)+x*cos(x)' },
        { name: '商法则', rule: 'f/g', derivative: '(f\'g-f*g\')/g^2', example: '(x/sin(x))\' = (sin(x)-x*cos(x))/sin^2(x)' },
        { name: '链式法则', rule: 'f(g(x))', derivative: 'f\'(g(x))*g\'(x)', example: '(sin(x^2))\' = cos(x^2)*2x' }
    ];

    function derivativeOf(expr) {
        expr = expr.replace(/\s/g, '');
        if (expr === 'x') return '1';
        if (/^-?\d+(\.\d+)?$/.test(expr)) return '0';
        if (expr === 'sin(x)') return 'cos(x)';
        if (expr === 'cos(x)') return '-sin(x)';
        if (expr === 'tan(x)') return 'sec^2(x)';
        if (expr === 'e^x') return 'e^x';
        if (expr === 'ln(x)') return '1/x';
        if (expr === 'sqrt(x)') return '1/(2*sqrt(x))';
        if (/^x\^(\d+)$/.test(expr)) return expr.replace(/x\^(\d+)/, function(m, n) { return n + 'x^' + (parseInt(n) - 1); });
        if (/^(\d+)\*x\^(\d+)$/.test(expr)) return expr.replace(/(\d+)\*x\^(\d+)/, function(m, a, n) { return (parseInt(a) * parseInt(n)) + 'x^' + (parseInt(n) - 1); });
        if (/^(\d+)\*x$/.test(expr)) return expr.replace(/(\d+)\*x/, '$1');
        return '? (请手动计算)';
    }

    function parseExpr(expr, x) {
        try {
            var s = expr.replace(/\^/g, '**').replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos').replace(/tan/g, 'Math.tan').replace(/exp/g, 'Math.exp').replace(/log/g, 'Math.log').replace(/sqrt/g, 'Math.sqrt').replace(/abs/g, 'Math.abs').replace(/(\d)(x)/g, '$1*$2').replace(/\)\(/g, ')*(').replace(/(\d)\(/g, '$1*(');
            return safeMathEval(s.replace(/x/g, '(' + x + ')'));
        } catch(e) {
            console.error('数学计算错误:', e.message, '表达式:', expr);
            return NaN;
        }
    }

    function drawDerivativeCanvas() {
        var canvas = document.getElementById('derivative-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        var xMin = -5, xMax = 5, yMin = -5, yMax = 5;
        var xScale = w / (xMax - xMin), yScale = h / (yMax - yMin);
        var x0 = -xMin * xScale, y0 = yMax * yScale;
        ctx.strokeStyle = '#eee'; ctx.lineWidth = 1;
        for (var i = xMin; i <= xMax; i++) { ctx.beginPath(); ctx.moveTo(i * xScale + x0, 0); ctx.lineTo(i * xScale + x0, h); ctx.stroke(); }
        for (var j = yMin; j <= yMax; j++) { ctx.beginPath(); ctx.moveTo(0, y0 - j * yScale); ctx.lineTo(w, y0 - j * yScale); ctx.stroke(); }
        ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(w, y0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, h); ctx.stroke();
        var expr = document.getElementById('derivative-input').value.trim();
        if (!expr) return;
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.5;
        ctx.beginPath(); var first = true;
        for (var si = 0; si <= w * 2; si++) {
            var xv = xMin + (si / (w * 2)) * (xMax - xMin);
            var yv = parseExpr(expr, xv);
            var px = xv * xScale + x0, py = y0 - yv * yScale;
            if (isNaN(yv) || py < -200 || py > h + 200) { first = true; continue; }
            if (first) { ctx.moveTo(px, py); first = false; } else { ctx.lineTo(px, py); }
        }
        ctx.stroke();
        ctx.fillStyle = '#3b82f6'; ctx.fillText('f(x)', w - 30, y0 - 8);
        var derivExpr = derivativeOf(expr);
        if (derivExpr && derivExpr !== '?' && derivExpr.indexOf('?') === -1) {
            ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5;
            ctx.beginPath(); first = true;
            for (var si2 = 0; si2 <= w * 2; si2++) {
                var xv2 = xMin + (si2 / (w * 2)) * (xMax - xMin);
                var yv2 = parseExpr(derivExpr, xv2);
                var px2 = xv2 * xScale + x0, py2 = y0 - yv2 * yScale;
                if (isNaN(yv2) || py2 < -200 || py2 > h + 200) { first = true; continue; }
                if (first) { ctx.moveTo(px2, py2); first = false; } else { ctx.lineTo(px2, py2); }
            }
            ctx.stroke();
            ctx.fillStyle = '#ef4444'; ctx.fillText('f\'(x)', w - 50, y0 - 20);
        }
    }

    function renderDerivative() {
        var container = document.getElementById('math-derivative-app');
        if (!container) return;
        container.innerHTML = '<div class="tool-app-container" style="padding:16px;">' +
            '<div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;align-items:end;">' +
            '<div><label style="font-size:13px;color:#666;">f(x)=</label><br><input id="derivative-input" style="width:240px;padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;" placeholder="如: x^3, sin(x), 3*x^2+2*x"></div>' +
            '<button id="derivative-calc" style="padding:8px 18px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">计算导数</button>' +
            '<div><label style="font-size:13px;color:#666;">在x=</label><input id="derivative-point" type="number" value="1" style="width:60px;padding:6px;border:1px solid #d1d5db;border-radius:6px;"></div>' +
            '<button id="derivative-eval" style="padding:7px 14px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;">求值</button>' +
            '</div>' +
            '<div id="derivative-result" style="margin-bottom:12px;font-size:14px;padding:10px 14px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;min-height:24px;color:#1e40af;"></div>' +
            '<canvas id="derivative-canvas" width="700" height="350" style="border:1px solid #e5e7eb;border-radius:8px;background:#fafbfc;width:100%;max-width:700px;margin-bottom:16px;"></canvas>' +
            '<div style="margin-bottom:6px;font-size:13px;color:#666;">常用导数公式表</div>' +
            '<table style="width:100%;border-collapse:collapse;font-size:12px;"><tr style="background:#f3f4f6;"><th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">名称</th><th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">原函数</th><th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">导函数</th><th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">示例</th></tr></table></div>';
        var table = container.querySelector('table');
        for (var i = 0; i < derivativeRules.length; i++) {
            var r = derivativeRules[i];
            var row = table.insertRow(-1);
            row.innerHTML = '<td style="padding:6px 8px;border:1px solid #e5e7eb;">' + r.name + '</td><td style="padding:6px 8px;border:1px solid #e5e7eb;font-family:monospace;">' + r.rule + '</td><td style="padding:6px 8px;border:1px solid #e5e7eb;font-family:monospace;">' + r.derivative + '</td><td style="padding:6px 8px;border:1px solid #e5e7eb;font-size:11px;">' + r.example + '</td>';
        }
        document.getElementById('derivative-calc').onclick = function() {
            var expr = document.getElementById('derivative-input').value.trim();
            if (!expr) return;
            var deriv = derivativeOf(expr);
            document.getElementById('derivative-result').innerHTML = '<strong>f(x) = ' + expr + '</strong><br><strong>f\'(x) = ' + deriv + '</strong>';
            drawDerivativeCanvas();
        };
        document.getElementById('derivative-eval').onclick = function() {
            var expr = document.getElementById('derivative-input').value.trim();
            var pt = parseFloat(document.getElementById('derivative-point').value) || 0;
            var deriv = derivativeOf(expr);
            var val = parseExpr(deriv, pt);
            var fval = parseExpr(expr, pt);
            document.getElementById('derivative-result').innerHTML = '<strong>f(' + pt + ') = ' + (isNaN(fval) ? '?' : fval.toFixed(4)) + '</strong><br><strong>f\'(' + pt + ') = ' + (isNaN(val) ? '?' : val.toFixed(4)) + '</strong>';
        };
        drawDerivativeCanvas();
    }
    return { renderDerivative: renderDerivative };
})();

// ============================================================
// 模块3：mathGeometry - 几何画板
// ============================================================
window.mathGeometry = (function() {
    'use strict';
    var currentTab = 'line';
    var params = { line: { k: 1, b: 0 }, circle: { h: 0, k: 0, r: 3 }, ellipse: { a: 4, b: 2 }, hyperbola: { a: 2, b: 1.5 }, parabola: { a: 1, b: 0, c: 0 } };

    function drawGeoCanvas() {
        var canvas = document.getElementById('geo-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        var xMin = -8, xMax = 8, yMin = -6, yMax = 6;
        var xScale = w / (xMax - xMin), yScale = h / (yMax - yMin);
        var x0 = -xMin * xScale, y0 = yMax * yScale;
        ctx.strokeStyle = '#eee'; ctx.lineWidth = 1;
        for (var i = xMin; i <= xMax; i++) { ctx.beginPath(); ctx.moveTo(i * xScale + x0, 0); ctx.lineTo(i * xScale + x0, h); ctx.stroke(); }
        for (var j = yMin; j <= yMax; j++) { ctx.beginPath(); ctx.moveTo(0, y0 - j * yScale); ctx.lineTo(w, y0 - j * yScale); ctx.stroke(); }
        ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(w, y0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, h); ctx.stroke();
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.5;

        if (currentTab === 'line') {
            var k = params.line.k, b = params.line.b;
            ctx.beginPath();
            ctx.moveTo(xMin * xScale + x0, y0 - (k * xMin + b) * yScale);
            ctx.lineTo(xMax * xScale + x0, y0 - (k * xMax + b) * yScale);
            ctx.stroke();
            ctx.fillStyle = '#333'; ctx.font = '12px sans-serif';
            ctx.fillText('y = ' + k + 'x + ' + (b >= 0 ? '+' : '') + b, 20, 20);
        } else if (currentTab === 'circle') {
            var hr = params.circle.h, kr = params.circle.k, r = params.circle.r;
            ctx.beginPath();
            ctx.arc(x0 + hr * xScale, y0 - kr * yScale, r * xScale, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath(); ctx.arc(x0 + hr * xScale, y0 - kr * yScale, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#333';
            ctx.fillText('(x' + (hr >= 0 ? '-' : '+') + Math.abs(hr) + ')^2 + (y' + (kr >= 0 ? '-' : '+') + Math.abs(kr) + ')^2 = ' + (r * r), 20, 20);
        } else if (currentTab === 'ellipse') {
            var a = params.ellipse.a, bv = params.ellipse.b;
            ctx.beginPath();
            var cx = x0, cy = y0;
            for (var t = 0; t <= Math.PI * 2; t += 0.02) {
                var px = cx + a * Math.cos(t) * xScale, py = cy - bv * Math.sin(t) * yScale;
                if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.fillStyle = '#ef4444';
            var cVal = Math.sqrt(a * a - bv * bv);
            ctx.beginPath(); ctx.arc(cx + cVal * xScale, cy, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx - cVal * xScale, cy, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#333';
            ctx.fillText('x^2/' + (a * a) + ' + y^2/' + (bv * bv) + ' = 1', 20, 20);
        } else if (currentTab === 'hyperbola') {
            var ah = params.hyperbola.a, bh = params.hyperbola.b;
            ctx.beginPath(); var first = true;
            for (var t2 = -3; t2 <= 3; t2 += 0.01) {
                var px2 = x0 + ah * Math.cosh(t2) * xScale, py2 = y0 - bh * Math.sinh(t2) * yScale;
                if (first) { ctx.moveTo(px2, py2); first = false; } else ctx.lineTo(px2, py2);
            }
            ctx.stroke();
            ctx.beginPath(); first = true;
            for (var t3 = -3; t3 <= 3; t3 += 0.01) {
                var px3 = x0 - ah * Math.cosh(t3) * xScale, py3 = y0 - bh * Math.sinh(t3) * yScale;
                if (first) { ctx.moveTo(px3, py3); first = false; } else ctx.lineTo(px3, py3);
            }
            ctx.stroke();
            ctx.fillStyle = '#333';
            ctx.fillText('x^2/' + (ah * ah) + ' - y^2/' + (bh * bh) + ' = 1', 20, 20);
        } else if (currentTab === 'parabola') {
            var pa = params.parabola.a, pb = params.parabola.b, pc = params.parabola.c;
            ctx.beginPath(); var first2 = true;
            for (var xi = xMin; xi <= xMax; xi += 0.05) {
                var yi = pa * xi * xi + pb * xi + pc;
                var px4 = xi * xScale + x0, py4 = y0 - yi * yScale;
                if (py4 < -200 || py4 > h + 200) { first2 = true; continue; }
                if (first2) { ctx.moveTo(px4, py4); first2 = false; } else ctx.lineTo(px4, py4);
            }
            ctx.stroke();
            ctx.fillStyle = '#333';
            ctx.fillText('y = ' + pa + 'x^2 + ' + pb + 'x + ' + pc, 20, 20);
        }
    }

    function renderGeometry() {
        var container = document.getElementById('math-geometry-app');
        if (!container) return;
        container.innerHTML = '<div class="tool-app-container" style="padding:16px;">' +
            '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">' +
            '<button class="geo-tab" data-tab="line" style="padding:7px 14px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:#3b82f6;color:#fff;">直线</button>' +
            '<button class="geo-tab" data-tab="circle" style="padding:7px 14px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:#fff;color:#333;">圆</button>' +
            '<button class="geo-tab" data-tab="ellipse" style="padding:7px 14px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:#fff;color:#333;">椭圆</button>' +
            '<button class="geo-tab" data-tab="hyperbola" style="padding:7px 14px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:#fff;color:#333;">双曲线</button>' +
            '<button class="geo-tab" data-tab="parabola" style="padding:7px 14px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:#fff;color:#333;">抛物线</button>' +
            '</div>' +
            '<div id="geo-params" style="margin-bottom:12px;display:flex;gap:12px;flex-wrap:wrap;align-items:end;"></div>' +
            '<canvas id="geo-canvas" width="700" height="500" style="border:1px solid #e5e7eb;border-radius:8px;background:#fafbfc;width:100%;max-width:700px;"></canvas>' +
            '</div>';

        function updateParams() {
            var d = document.getElementById('geo-params');
            if (currentTab === 'line') {
                d.innerHTML = '<div><label>斜率k</label><br><input id="geo-k" type="number" value="' + params.line.k + '" step="0.1" style="width:70px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div><div><label>截距b</label><br><input id="geo-b" type="number" value="' + params.line.b + '" step="0.1" style="width:70px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div><button id="geo-draw" style="padding:7px 14px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">绘制</button>';
                document.getElementById('geo-draw').onclick = function() { params.line.k = parseFloat(document.getElementById('geo-k').value) || 1; params.line.b = parseFloat(document.getElementById('geo-b').value) || 0; drawGeoCanvas(); };
            } else if (currentTab === 'circle') {
                d.innerHTML = '<div><label>圆心(h,k)</label><br><input id="geo-h" type="number" value="' + params.circle.h + '" step="0.5" style="width:60px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"> <input id="geo-kc" type="number" value="' + params.circle.k + '" step="0.5" style="width:60px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div><div><label>半径r</label><br><input id="geo-r" type="number" value="' + params.circle.r + '" step="0.5" min="0.5" style="width:70px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div><button id="geo-draw" style="padding:7px 14px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">绘制</button>';
                document.getElementById('geo-draw').onclick = function() { params.circle.h = parseFloat(document.getElementById('geo-h').value) || 0; params.circle.k = parseFloat(document.getElementById('geo-kc').value) || 0; params.circle.r = parseFloat(document.getElementById('geo-r').value) || 3; drawGeoCanvas(); };
            } else if (currentTab === 'ellipse') {
                d.innerHTML = '<div><label>长半轴a</label><br><input id="geo-a" type="number" value="' + params.ellipse.a + '" step="0.5" min="0.5" style="width:70px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div><div><label>短半轴b</label><br><input id="geo-bv" type="number" value="' + params.ellipse.b + '" step="0.5" min="0.5" style="width:70px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div><button id="geo-draw" style="padding:7px 14px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">绘制</button>';
                document.getElementById('geo-draw').onclick = function() { params.ellipse.a = parseFloat(document.getElementById('geo-a').value) || 4; params.ellipse.b = parseFloat(document.getElementById('geo-bv').value) || 2; drawGeoCanvas(); };
            } else if (currentTab === 'hyperbola') {
                d.innerHTML = '<div><label>实半轴a</label><br><input id="geo-ah" type="number" value="' + params.hyperbola.a + '" step="0.5" min="0.5" style="width:70px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div><div><label>虚半轴b</label><br><input id="geo-bh" type="number" value="' + params.hyperbola.b + '" step="0.5" min="0.5" style="width:70px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div><button id="geo-draw" style="padding:7px 14px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">绘制</button>';
                document.getElementById('geo-draw').onclick = function() { params.hyperbola.a = parseFloat(document.getElementById('geo-ah').value) || 2; params.hyperbola.b = parseFloat(document.getElementById('geo-bh').value) || 1.5; drawGeoCanvas(); };
            } else if (currentTab === 'parabola') {
                d.innerHTML = '<div><label>a</label><br><input id="geo-pa" type="number" value="' + params.parabola.a + '" step="0.1" style="width:60px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div><div><label>b</label><br><input id="geo-pb" type="number" value="' + params.parabola.b + '" step="0.1" style="width:60px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div><div><label>c</label><br><input id="geo-pc" type="number" value="' + params.parabola.c + '" step="0.1" style="width:60px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div><button id="geo-draw" style="padding:7px 14px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">绘制</button>';
                document.getElementById('geo-draw').onclick = function() { params.parabola.a = parseFloat(document.getElementById('geo-pa').value) || 1; params.parabola.b = parseFloat(document.getElementById('geo-pb').value) || 0; params.parabola.c = parseFloat(document.getElementById('geo-pc').value) || 0; drawGeoCanvas(); };
            }
        }

        var tabs = container.querySelectorAll('.geo-tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].onclick = function() {
                currentTab = this.getAttribute('data-tab');
                var all = container.querySelectorAll('.geo-tab');
                for (var j = 0; j < all.length; j++) { all[j].style.background = '#fff'; all[j].style.color = '#333'; }
                this.style.background = '#3b82f6'; this.style.color = '#fff';
                updateParams(); drawGeoCanvas();
            };
        }
        updateParams(); drawGeoCanvas();
    }
    return { renderGeometry: renderGeometry };
})();

// ============================================================
// 模块4：mathSequence - 数列可视化
// ============================================================
window.mathSequence = (function() {
    'use strict';
    var currentSeqTab = 'arithmetic';

    function drawSeqCanvas() {
        var canvas = document.getElementById('sequence-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        var a1 = parseFloat(document.getElementById('seq-a1').value) || 1;
        var d = parseFloat(document.getElementById('seq-d').value) || 1;
        var n = parseInt(document.getElementById('seq-n').value) || 10;
        if (n > 50) n = 50;
        var terms = [];
        var maxVal = 0;
        for (var i = 0; i < n; i++) {
            var val = currentSeqTab === 'arithmetic' ? a1 + i * d : a1 * Math.pow(d, i);
            terms.push(val);
            if (Math.abs(val) > maxVal) maxVal = Math.abs(val);
        }
        if (maxVal === 0) maxVal = 1;
        var margin = { top: 30, right: 30, bottom: 50, left: 60 };
        var plotW = w - margin.left - margin.right, plotH = h - margin.top - margin.bottom;
        var barW = Math.max(8, plotW / n - 4);
        var yScale = plotH / (maxVal * 1.2);
        ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(margin.left, margin.top); ctx.lineTo(margin.left, h - margin.bottom); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(margin.left, h - margin.bottom); ctx.lineTo(w - margin.right, h - margin.bottom); ctx.stroke();
        ctx.fillStyle = '#999'; ctx.font = '10px sans-serif';
        for (var i2 = 0; i2 < n; i2++) {
            var x = margin.left + i2 * (plotW / n) + plotW / (2 * n);
            ctx.fillText(i2 + 1, x - 4, h - margin.bottom + 14);
        }
        for (var j = 0; j < n; j++) {
            var val2 = terms[j];
            var x2 = margin.left + j * (plotW / n) + 2;
            var barH = Math.abs(val2) * yScale;
            var y2 = h - margin.bottom - (val2 >= 0 ? barH : 0);
            ctx.fillStyle = val2 >= 0 ? '#3b82f6' : '#ef4444';
            ctx.fillRect(x2, y2, barW, barH || 1);
            if (n <= 20) { ctx.fillStyle = '#333'; ctx.font = '9px sans-serif'; ctx.fillText(val2.toFixed(1), x2, (val2 >= 0 ? y2 - 4 : y2 + barH + 12)); }
        }
        var sum = currentSeqTab === 'arithmetic' ? (n * (a1 + terms[n - 1]) / 2) : (d === 1 ? n * a1 : a1 * (1 - Math.pow(d, n)) / (1 - d));
        ctx.fillStyle = '#333'; ctx.font = '12px sans-serif';
        ctx.fillText('前' + n + '项和 S_n = ' + sum.toFixed(2), margin.left, margin.top - 10);
    }

    function renderSequence() {
        var container = document.getElementById('math-sequence-app');
        if (!container) return;
        container.innerHTML = '<div class="tool-app-container" style="padding:16px;">' +
            '<div style="display:flex;gap:8px;margin-bottom:12px;">' +
            '<button class="seq-tab" data-tab="arithmetic" style="padding:7px 14px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:#3b82f6;color:#fff;">等差数列</button>' +
            '<button class="seq-tab" data-tab="geometric" style="padding:7px 14px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:#fff;color:#333;">等比数列</button>' +
            '</div>' +
            '<div style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap;align-items:end;">' +
            '<div><label style="font-size:13px;color:#666;">首项a1</label><br><input id="seq-a1" type="number" value="1" style="width:70px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div>' +
            '<div><label style="font-size:13px;color:#666;" id="seq-d-label">公差d</label><br><input id="seq-d" type="number" value="2" style="width:70px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div>' +
            '<div><label style="font-size:13px;color:#666;">项数n</label><br><input id="seq-n" type="number" value="10" min="1" max="50" style="width:70px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div>' +
            '<button id="seq-draw" style="padding:7px 14px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">绘制</button>' +
            '</div>' +
            '<div id="seq-formula" style="margin-bottom:12px;padding:10px 14px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;font-size:13px;color:#1e40af;"></div>' +
            '<canvas id="sequence-canvas" width="700" height="400" style="border:1px solid #e5e7eb;border-radius:8px;background:#fafbfc;width:100%;max-width:700px;"></canvas>' +
            '</div>';

        function updateFormula() {
            var a1 = parseFloat(document.getElementById('seq-a1').value) || 1;
            var d = parseFloat(document.getElementById('seq-d').value) || 1;
            var n = parseInt(document.getElementById('seq-n').value) || 10;
            var el = document.getElementById('seq-formula');
            if (currentSeqTab === 'arithmetic') {
                el.innerHTML = '通项公式: a_n = ' + a1 + ' + (n-1) * ' + d + '<br>前n项和: S_n = n(a1 + a_n)/2';
            } else {
                el.innerHTML = '通项公式: a_n = ' + a1 + ' * ' + d + '^(n-1)<br>前n项和: S_n = a1(1-' + d + '^n)/(1-' + d + ') (d≠1)';
            }
        }

        var tabs = container.querySelectorAll('.seq-tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].onclick = function() {
                currentSeqTab = this.getAttribute('data-tab');
                var all = container.querySelectorAll('.seq-tab');
                for (var j = 0; j < all.length; j++) { all[j].style.background = '#fff'; all[j].style.color = '#333'; }
                this.style.background = '#3b82f6'; this.style.color = '#fff';
                document.getElementById('seq-d-label').textContent = currentSeqTab === 'arithmetic' ? '公差d' : '公比q';
                updateFormula(); drawSeqCanvas();
            };
        }
        document.getElementById('seq-draw').onclick = function() { updateFormula(); drawSeqCanvas(); };
        updateFormula(); drawSeqCanvas();
    }
    return { renderSequence: renderSequence };
})();

// ============================================================
// 模块5：mathProbability - 概率模拟器
// ============================================================
window.mathProbability = (function() {
    'use strict';
    var currentProbTab = 'classical';

    function drawProbCanvas() {
        var canvas = document.getElementById('prob-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        var margin = { top: 30, right: 30, bottom: 50, left: 60 };
        var plotW = w - margin.left - margin.right, plotH = h - margin.top - margin.bottom;

        if (currentProbTab === 'classical') {
            var n = parseInt(document.getElementById('prob-n').value) || 100;
            var type = document.getElementById('prob-type').value;
            var results = [];
            if (type === 'coin') {
                var heads = 0;
                for (var i = 0; i < n; i++) { if (Math.random() < 0.5) heads++; }
                results = [{ label: '正面', count: heads, color: '#3b82f6', theo: n * 0.5 }, { label: '反面', count: n - heads, color: '#ef4444', theo: n * 0.5 }];
            } else {
                var counts = [0, 0, 0, 0, 0, 0];
                for (var i2 = 0; i2 < n; i2++) { counts[Math.floor(Math.random() * 6)]++; }
                for (var j = 0; j < 6; j++) results.push({ label: (j + 1) + '点', count: counts[j], color: '#3b82f6', theo: n / 6 });
            }
            var barW = Math.min(80, plotW / results.length - 8);
            var maxCount = 0;
            for (var k = 0; k < results.length; k++) { if (results[k].count > maxCount) maxCount = results[k].count; if (results[k].theo > maxCount) maxCount = results[k].theo; }
            var yScale = plotH / (maxCount * 1.15);
            ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(margin.left, margin.top); ctx.lineTo(margin.left, h - margin.bottom); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(margin.left, h - margin.bottom); ctx.lineTo(w - margin.right, h - margin.bottom); ctx.stroke();
            for (var m = 0; m < results.length; m++) {
                var r = results[m];
                var x = margin.left + m * (plotW / results.length) + 4;
                var barH2 = r.count * yScale;
                var y = h - margin.bottom - barH2;
                ctx.fillStyle = r.color; ctx.fillRect(x, y, barW, barH2);
                ctx.fillStyle = '#333'; ctx.font = '10px sans-serif';
                ctx.fillText(r.label, x + barW / 2 - 8, h - margin.bottom + 14);
                ctx.fillText(r.count, x + barW / 2 - 6, y - 4);
                ctx.setLineDash([4, 4]); ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(x, h - margin.bottom - r.theo * yScale); ctx.lineTo(x + barW, h - margin.bottom - r.theo * yScale); ctx.stroke();
                ctx.setLineDash([]);
            }
            ctx.fillStyle = '#333'; ctx.font = '12px sans-serif';
            ctx.fillText('模拟' + n + '次 | ' + (type === 'coin' ? '硬币' : '骰子'), margin.left, margin.top - 10);
        } else if (currentProbTab === 'binomial') {
            var bn = parseInt(document.getElementById('binom-n').value) || 20;
            var bp = parseFloat(document.getElementById('binom-p').value) || 0.5;
            var trials = parseInt(document.getElementById('binom-trials').value) || 1000;
            var simCounts = [];
            for (var i3 = 0; i3 <= bn; i3++) simCounts.push(0);
            for (var t = 0; t < trials; t++) {
                var successes = 0;
                for (var s = 0; s < bn; s++) { if (Math.random() < bp) successes++; }
                simCounts[successes]++;
            }
            var maxSim = 0;
            for (var i4 = 0; i4 <= bn; i4++) { if (simCounts[i4] > maxSim) maxSim = simCounts[i4]; }
            var yScale2 = plotH / (maxSim * 1.15);
            var barW2 = Math.max(4, plotW / (bn + 1) - 2);
            ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(margin.left, margin.top); ctx.lineTo(margin.left, h - margin.bottom); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(margin.left, h - margin.bottom); ctx.lineTo(w - margin.right, h - margin.bottom); ctx.stroke();
            for (var i5 = 0; i5 <= bn; i5++) {
                var x3 = margin.left + i5 * (plotW / (bn + 1)) + 1;
                var barH3 = simCounts[i5] * yScale2;
                ctx.fillStyle = '#3b82f6'; ctx.fillRect(x3, h - margin.bottom - barH3, barW2, barH3);
                if (bn <= 20) { ctx.fillStyle = '#333'; ctx.font = '9px sans-serif'; ctx.fillText(i5, x3 + 1, h - margin.bottom + 12); }
            }
            ctx.fillStyle = '#333'; ctx.font = '12px sans-serif';
            ctx.fillText('B(' + bn + ', ' + bp + ') 模拟' + trials + '次', margin.left, margin.top - 10);
        }
    }

    function renderProbability() {
        var container = document.getElementById('math-probability-app');
        if (!container) return;
        container.innerHTML = '<div class="tool-app-container" style="padding:16px;">' +
            '<div style="display:flex;gap:8px;margin-bottom:12px;">' +
            '<button class="prob-tab" data-tab="classical" style="padding:7px 14px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:#3b82f6;color:#fff;">古典概型</button>' +
            '<button class="prob-tab" data-tab="binomial" style="padding:7px 14px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:#fff;color:#333;">二项分布</button>' +
            '</div>' +
            '<div id="prob-params" style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap;align-items:end;"></div>' +
            '<canvas id="prob-canvas" width="700" height="400" style="border:1px solid #e5e7eb;border-radius:8px;background:#fafbfc;width:100%;max-width:700px;"></canvas>' +
            '</div>';

        function updateProbParams() {
            var d = document.getElementById('prob-params');
            if (currentProbTab === 'classical') {
                d.innerHTML = '<div><label style="font-size:13px;">类型</label><br><select id="prob-type" style="padding:6px;border:1px solid #d1d5db;border-radius:6px;"><option value="coin">硬币</option><option value="dice">骰子</option></select></div><div><label style="font-size:13px;">次数</label><br><input id="prob-n" type="number" value="100" min="10" max="10000" style="width:80px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div><button id="prob-run" style="padding:7px 14px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">模拟</button>';
            } else {
                d.innerHTML = '<div><label style="font-size:13px;">n</label><br><input id="binom-n" type="number" value="20" min="5" max="50" style="width:70px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div><div><label style="font-size:13px;">p</label><br><input id="binom-p" type="number" value="0.5" step="0.1" min="0.1" max="0.9" style="width:70px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div><div><label style="font-size:13px;">轮数</label><br><input id="binom-trials" type="number" value="1000" min="100" max="10000" style="width:80px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div><button id="prob-run" style="padding:7px 14px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">模拟</button>';
            }
            document.getElementById('prob-run').onclick = function() { drawProbCanvas(); };
        }

        var tabs = container.querySelectorAll('.prob-tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].onclick = function() {
                currentProbTab = this.getAttribute('data-tab');
                var all = container.querySelectorAll('.prob-tab');
                for (var j = 0; j < all.length; j++) { all[j].style.background = '#fff'; all[j].style.color = '#333'; }
                this.style.background = '#3b82f6'; this.style.color = '#fff';
                updateProbParams(); drawProbCanvas();
            };
        }
        updateProbParams(); drawProbCanvas();
    }
    return { renderProbability: renderProbability };
})();

// ============================================================
// 模块6：mathHandbook - 数学公式手册
// ============================================================
window.mathHandbook = (function() {
    'use strict';
    var formulas = [
        { cat: '代数与函数', name: '二次函数顶点式', formula: 'y = a(x-h)^2 + k', desc: '顶点(h,k)，对称轴x=h', example: 'y=2(x-1)^2+3，顶点(1,3)' },
        { cat: '代数与函数', name: '二次方程求根公式', formula: 'x = (-b±√(b^2-4ac))/(2a)', desc: '判别式Δ=b^2-4ac', example: 'x^2-5x+6=0, x=2或x=3' },
        { cat: '代数与函数', name: '韦达定理', formula: 'x1+x2=-b/a, x1*x2=c/a', desc: '二次方程两根关系', example: 'x^2-3x+2=0, 和=3, 积=2' },
        { cat: '代数与函数', name: '对数换底公式', formula: 'log_a(b) = log_c(b)/log_c(a)', desc: '任意底数对数转换', example: 'log_2(8)=ln8/ln2=3' },
        { cat: '代数与函数', name: '指数运算法则', formula: 'a^m * a^n = a^(m+n)', desc: '同底数幂相乘指数相加', example: '2^3*2^4=2^7=128' },
        { cat: '三角函数', name: '正弦定理', formula: 'a/sinA = b/sinB = c/sinC = 2R', desc: '边长与对角正弦比=外接圆直径', example: 'a=10,A=30°,2R=20' },
        { cat: '三角函数', name: '余弦定理', formula: 'a^2 = b^2 + c^2 - 2bc*cosA', desc: '已知两边夹角求第三边', example: 'b=3,c=4,A=60°,a=√13' },
        { cat: '三角函数', name: '二倍角公式', formula: 'sin(2α) = 2sinα*cosα', desc: '正弦的二倍角', example: 'sin60°=2sin30°cos30°=√3/2' },
        { cat: '三角函数', name: '和差化积', formula: 'sinα+sinβ=2sin((α+β)/2)cos((α-β)/2)', desc: '正弦和化积', example: 'sin75°+sin15°=√6/2' },
        { cat: '三角函数', name: '同角关系', formula: 'sin^2α + cos^2α = 1', desc: '基本恒等式', example: 'sin^2(30°)+cos^2(30°)=1' },
        { cat: '数列', name: '等差数列通项', formula: 'a_n = a1 + (n-1)d', desc: '第n项=首项+(n-1)公差', example: 'a1=3,d=2,a5=11' },
        { cat: '数列', name: '等差数列求和', formula: 'S_n = n(a1+a_n)/2', desc: '前n项和=项数*(首+末)/2', example: '1+2+...+100=5050' },
        { cat: '数列', name: '等比数列通项', formula: 'a_n = a1 * q^(n-1)', desc: '第n项=首项*公比^(n-1)', example: 'a1=2,q=3,a4=54' },
        { cat: '数列', name: '等比数列求和', formula: 'S_n = a1(1-q^n)/(1-q)', desc: '前n项和(q≠1)', example: '1+2+4+8+16=31' },
        { cat: '立体几何', name: '柱体体积', formula: 'V = S*h', desc: '体积=底面积*高', example: '圆柱V=πr^2*h' },
        { cat: '立体几何', name: '锥体体积', formula: 'V = S*h/3', desc: '体积=底面积*高/3', example: '圆锥V=πr^2*h/3' },
        { cat: '立体几何', name: '球体体积', formula: 'V = 4πr^3/3', desc: '球体体积', example: 'r=3,V=36π' },
        { cat: '立体几何', name: '球体表面积', formula: 'S = 4πr^2', desc: '球体表面积', example: 'r=3,S=36π' },
        { cat: '解析几何', name: '两点距离', formula: 'd = √((x2-x1)^2+(y2-y1)^2)', desc: '平面直角坐标系两点距离', example: '(0,0)到(3,4): d=5' },
        { cat: '解析几何', name: '点到直线距离', formula: 'd = |Ax0+By0+C|/√(A^2+B^2)', desc: '点(x0,y0)到Ax+By+C=0距离', example: '(1,1)到3x+4y-5=0: d=0.4' },
        { cat: '解析几何', name: '圆的标准方程', formula: '(x-a)^2+(y-b)^2=r^2', desc: '圆心(a,b)半径r', example: '圆心(2,-1),r=3' },
        { cat: '解析几何', name: '椭圆标准方程', formula: 'x^2/a^2+y^2/b^2=1', desc: '长半轴a短半轴b,c^2=a^2-b^2', example: 'x^2/25+y^2/9=1,c=4' },
        { cat: '解析几何', name: '双曲线标准方程', formula: 'x^2/a^2-y^2/b^2=1', desc: '实半轴a虚半轴b,c^2=a^2+b^2', example: 'x^2/9-y^2/16=1,c=5' },
        { cat: '解析几何', name: '抛物线标准方程', formula: 'y^2=2px', desc: '焦点(p/2,0)准线x=-p/2', example: 'y^2=4x,焦点(1,0)' },
        { cat: '概率统计', name: '古典概型', formula: 'P(A) = m/n', desc: '事件A包含基本事件数/总数', example: '掷骰子偶数: P=3/6=0.5' },
        { cat: '概率统计', name: '二项分布', formula: 'P(X=k)=C(n,k)*p^k*(1-p)^(n-k)', desc: 'n次独立试验成功k次概率', example: 'n=10,p=0.3,k=3' },
        { cat: '概率统计', name: '期望公式', formula: 'E(X)=Σx_i*p_i', desc: '随机变量数学期望', example: '掷骰子期望=3.5' },
        { cat: '概率统计', name: '方差公式', formula: 'D(X)=E(X^2)-[E(X)]^2', desc: '方差=平方期望-期望平方', example: '二项分布D=np(1-p)' },
        { cat: '导数', name: '幂函数导数', formula: '(x^n)\' = n*x^(n-1)', desc: '幂函数导数', example: '(x^3)\'=3x^2' },
        { cat: '导数', name: '指数函数导数', formula: '(e^x)\' = e^x', desc: 'e^x导数等于自身', example: '(2e^x)\'=2e^x' },
        { cat: '导数', name: '对数函数导数', formula: '(ln x)\' = 1/x', desc: '自然对数导数', example: '(ln(2x))\'=1/x' },
        { cat: '导数', name: '三角函数导数', formula: '(sin x)\'=cos x, (cos x)\'=-sin x', desc: '正余弦导数', example: '(sin2x)\'=2cos2x' },
        { cat: '导数', name: '切线方程', formula: 'y-f(x0)=f\'(x0)(x-x0)', desc: '曲线在(x0,f(x0))处切线', example: 'y=x^2在x=1: y=2x-1' },
        { cat: '导数', name: '极值判定', formula: 'f\'(x)=0且f\'\'(x)≠0', desc: '一阶导零二阶导非零为极值', example: 'f=x^3-3x极值点x=±1' }
    ];

    function renderHandbook() {
        var container = document.getElementById('math-handbook-app');
        if (!container) return;
        container.innerHTML = '<div class="tool-app-container" style="padding:16px;">' +
            '<div style="margin-bottom:12px;"><input id="handbook-search" placeholder="搜索公式..." style="width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;max-width:400px;"></div>' +
            '<div id="handbook-cats" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;"></div>' +
            '<div id="handbook-list"></div></div>';

        var cats = ['全部', '代数与函数', '三角函数', '数列', '立体几何', '解析几何', '概率统计', '导数'];
        var catDiv = document.getElementById('handbook-cats');
        var currentCat = '全部';
        var searchTerm = '';

        function render() {
            var list = document.getElementById('handbook-list');
            var html = '';
            var catMap = {};
            for (var i = 0; i < formulas.length; i++) {
                var f = formulas[i];
                if (currentCat !== '全部' && f.cat !== currentCat) continue;
                if (searchTerm && f.name.indexOf(searchTerm) === -1 && f.formula.indexOf(searchTerm) === -1 && f.desc.indexOf(searchTerm) === -1) continue;
                if (!catMap[f.cat]) catMap[f.cat] = [];
                catMap[f.cat].push(f);
            }
            var catKeys = Object.keys(catMap);
            for (var c = 0; c < catKeys.length; c++) {
                var cat = catKeys[c];
                html += '<div style="margin-bottom:8px;font-weight:bold;font-size:14px;color:#3b82f6;padding:8px;background:#eff6ff;border-radius:6px;cursor:pointer;" onclick="var n=this.nextElementSibling;n.style.display=n.style.display===\'none\'?\'block\':\'none\';">' + cat + ' (' + catMap[cat].length + '个)</div>';
                html += '<div style="display:block;">';
                for (var k = 0; k < catMap[cat].length; k++) {
                    var f2 = catMap[cat][k];
                    html += '<div style="border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;margin-bottom:8px;background:#fff;">' +
                        '<div style="font-weight:bold;font-size:14px;color:#333;">' + f2.name + '</div>' +
                        '<div style="font-family:monospace;font-size:14px;color:#1e40af;margin:6px 0;">' + f2.formula + '</div>' +
                        '<div style="font-size:12px;color:#666;">' + f2.desc + '</div>' +
                        '<div style="font-size:11px;color:#999;margin-top:4px;">示例: ' + f2.example + '</div></div>';
                }
                html += '</div>';
            }
            if (!html) html = '<div style="padding:20px;text-align:center;color:#999;">没有找到匹配的公式</div>';
            list.innerHTML = html;
        }

        for (var i = 0; i < cats.length; i++) {
            var btn = document.createElement('button');
            btn.textContent = cats[i];
            btn.style.cssText = 'padding:5px 10px;font-size:12px;border:1px solid #d1d5db;border-radius:16px;cursor:pointer;background:' + (cats[i] === '全部' ? '#3b82f6' : '#fff') + ';color:' + (cats[i] === '全部' ? '#fff' : '#333') + ';';
            btn.setAttribute('data-cat', cats[i]);
            btn.onclick = function() {
                currentCat = this.getAttribute('data-cat');
                var allBtns = catDiv.querySelectorAll('button');
                for (var j = 0; j < allBtns.length; j++) { allBtns[j].style.background = '#fff'; allBtns[j].style.color = '#333'; }
                this.style.background = '#3b82f6'; this.style.color = '#fff';
                render();
            };
            catDiv.appendChild(btn);
        }
        document.getElementById('handbook-search').oninput = function() { searchTerm = this.value.trim(); render(); };
        render();
    }
    return { renderHandbook: renderHandbook };
})();

// ============================================================
// 模块7：mathIntegral - 积分计算器
// ============================================================
window.mathIntegral = (function() {
    'use strict';

    var integralRules = [
        { name: '常数', rule: 'k', integral: 'kx + C', example: '∫5dx = 5x + C' },
        { name: '幂函数', rule: 'x^n (n≠-1)', integral: 'x^(n+1)/(n+1) + C', example: '∫x^3dx = x^4/4 + C' },
        { name: 'x分之一', rule: '1/x', integral: 'ln|x| + C', example: '∫(1/x)dx = ln|x| + C' },
        { name: '正弦', rule: 'sin(x)', integral: '-cos(x) + C', example: '∫sin(x)dx = -cos(x) + C' },
        { name: '余弦', rule: 'cos(x)', integral: 'sin(x) + C', example: '∫cos(x)dx = sin(x) + C' },
        { name: '正切', rule: 'tan(x)', integral: '-ln|cos(x)| + C', example: '∫tan(x)dx = -ln|cos(x)| + C' },
        { name: '指数函数', rule: 'e^x', integral: 'e^x + C', example: '∫e^xdx = e^x + C' },
        { name: '指数函数底', rule: 'a^x', integral: 'a^x/ln(a) + C', example: '∫2^xdx = 2^x/ln2 + C' },
        { name: '自然对数', rule: 'ln(x)', integral: 'x*ln(x) - x + C', example: '∫ln(x)dx = x*ln(x) - x + C' },
        { name: '平方根', rule: '√x', integral: '(2/3)x^(3/2) + C', example: '∫√x dx = (2/3)x^(3/2) + C' },
        { name: '和差法则', rule: 'f(x)±g(x)', integral: '∫f ± ∫g', example: '∫(x^2+sin(x))dx = x^3/3 - cos(x) + C' },
        { name: '倍乘法则', rule: 'k*f(x)', integral: 'k*∫f(x)dx', example: '∫3x^2dx = x^3 + C' }
    ];

    function parseExpr(expr, x) {
        try {
            var s = expr.replace(/\^/g, '**').replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos').replace(/tan/g, 'Math.tan').replace(/exp/g, 'Math.exp').replace(/log/g, 'Math.log').replace(/sqrt/g, 'Math.sqrt').replace(/abs/g, 'Math.abs').replace(/pi/gi, 'Math.PI').replace(/e(?!xp)/gi, 'Math.E').replace(/(\d)(x)/g, '$1*$2').replace(/\)\(/g, ')*(').replace(/(\d)\(/g, '$1*(').replace(/\)(\d)/g, ')*$1').replace(/\)x/g, ')*x');
            return safeMathEval(s.replace(/x/g, '(' + x + ')'));
        } catch(e) {
            console.error('数学计算错误:', e.message, '表达式:', expr);
            return NaN;
        }
    }

    function computeIntegral(expr, a, b, n) {
        n = n || 1000;
        var dx = (b - a) / n;
        var sum = 0;
        for (var i = 0; i < n; i++) {
            var x = a + (i + 0.5) * dx;
            var y = parseExpr(expr, x);
            if (isNaN(y)) return NaN;
            sum += y * dx;
        }
        return sum;
    }

    function drawIntegralCanvas() {
        var canvas = document.getElementById('integral-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        var expr = document.getElementById('integral-input').value.trim();
        var a = parseFloat(document.getElementById('integral-a').value);
        var b = parseFloat(document.getElementById('integral-b').value);
        if (isNaN(a) || isNaN(b) || !expr) return;
        if (a >= b) return;

        var xMin = a - (b - a) * 0.3;
        var xMax = b + (b - a) * 0.3;
        if (xMin === xMax) return;
        var yMin = Infinity, yMax = -Infinity;
        for (var si = 0; si <= 200; si++) {
            var xv = xMin + (si / 200) * (xMax - xMin);
            var yv = parseExpr(expr, xv);
            if (!isNaN(yv) && isFinite(yv)) {
                if (yv < yMin) yMin = yv;
                if (yv > yMax) yMax = yv;
            }
        }
        if (!isFinite(yMin)) { yMin = -5; yMax = 5; }
        if (yMin === yMax) { yMin -= 1; yMax += 1; }
        var yRange = yMax - yMin;
        yMin -= yRange * 0.15;
        yMax += yRange * 0.15;

        var margin = { top: 20, right: 20, bottom: 40, left: 60 };
        var plotW = w - margin.left - margin.right;
        var plotH = h - margin.top - margin.bottom;
        var xScale = plotW / (xMax - xMin);
        var yScale = plotH / (yMax - yMin);
        var x0 = margin.left - xMin * xScale;
        var y0 = margin.top + yMax * yScale;

        ctx.strokeStyle = '#eee'; ctx.lineWidth = 1;
        var yStep = Math.pow(10, Math.floor(Math.log10(yRange))) || 1;
        for (var gy = Math.floor(yMin / yStep) * yStep; gy <= yMax; gy += yStep) {
            var py = y0 - gy * yScale;
            ctx.beginPath(); ctx.moveTo(margin.left, py); ctx.lineTo(margin.left + plotW, py); ctx.stroke();
        }
        var xStep = Math.pow(10, Math.floor(Math.log10(b - a))) || 1;
        if (xStep < 1) xStep = 1;
        for (var gx = Math.floor(xMin / xStep) * xStep; gx <= Math.ceil(xMax / xStep) * xStep; gx += xStep) {
            var px = x0 + gx * xScale;
            if (px >= margin.left && px <= margin.left + plotW) {
                ctx.beginPath(); ctx.moveTo(px, margin.top); ctx.lineTo(px, margin.top + plotH); ctx.stroke();
            }
        }

        ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
        var xAxisY = y0 - 0 * yScale;
        if (xAxisY >= margin.top && xAxisY <= margin.top + plotH) {
            ctx.beginPath(); ctx.moveTo(margin.left, xAxisY); ctx.lineTo(margin.left + plotW, xAxisY); ctx.stroke();
        }
        var yAxisX = x0 + 0 * xScale;
        if (yAxisX >= margin.left && yAxisX <= margin.left + plotW) {
            ctx.beginPath(); ctx.moveTo(yAxisX, margin.top); ctx.lineTo(yAxisX, margin.top + plotH); ctx.stroke();
        }

        ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
        ctx.beginPath();
        var shadeSteps = 300;
        var zeroY = y0 - 0 * yScale;
        if (zeroY < margin.top) zeroY = margin.top;
        if (zeroY > margin.top + plotH) zeroY = margin.top + plotH;
        for (var i = 0; i <= shadeSteps; i++) {
            var xv2 = a + (i / shadeSteps) * (b - a);
            var yv2 = parseExpr(expr, xv2);
            if (isNaN(yv2)) { break; }
            var px2 = x0 + xv2 * xScale;
            var py2 = y0 - yv2 * yScale;
            if (py2 < margin.top) py2 = margin.top;
            if (py2 > margin.top + plotH) py2 = margin.top + plotH;
            if (i === 0) ctx.moveTo(px2, zeroY);
            else ctx.lineTo(px2, py2);
        }
        for (var i2 = shadeSteps; i2 >= 0; i2--) {
            var xv3 = a + (i2 / shadeSteps) * (b - a);
            var px3 = x0 + xv3 * xScale;
            ctx.lineTo(px3, zeroY);
        }
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2.5;
        ctx.beginPath();
        var first = true;
        for (var si2 = 0; si2 <= plotW * 2; si2++) {
            var xv4 = xMin + (si2 / (plotW * 2)) * (xMax - xMin);
            var yv4 = parseExpr(expr, xv4);
            var px4 = x0 + xv4 * xScale;
            var py4 = y0 - yv4 * yScale;
            if (isNaN(yv4) || py4 < margin.top - 200 || py4 > margin.top + plotH + 200) { first = true; continue; }
            if (first) { ctx.moveTo(px4, py4); first = false; }
            else { ctx.lineTo(px4, py4); }
        }
        ctx.stroke();

        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        var ax = x0 + a * xScale;
        if (ax >= margin.left && ax <= margin.left + plotW) {
            ctx.beginPath(); ctx.moveTo(ax, margin.top); ctx.lineTo(ax, margin.top + plotH); ctx.stroke();
        }
        var bx = x0 + b * xScale;
        if (bx >= margin.left && bx <= margin.left + plotW) {
            ctx.beginPath(); ctx.moveTo(bx, margin.top); ctx.lineTo(bx, margin.top + plotH); ctx.stroke();
        }
        ctx.setLineDash([]);

        ctx.fillStyle = '#ef4444'; ctx.font = 'bold 11px sans-serif';
        ctx.fillText('a=' + a.toFixed(2), ax + 3, margin.top + 14);
        ctx.fillText('b=' + b.toFixed(2), bx + 3, margin.top + 14);

        ctx.fillStyle = '#666'; ctx.font = '10px sans-serif';
        for (var gl = Math.floor(xMin / xStep) * xStep; gl <= Math.ceil(xMax / xStep) * xStep; gl += xStep) {
            if (gl === 0) continue;
            var gpx = x0 + gl * xScale;
            if (gpx > margin.left && gpx < margin.left + plotW) {
                ctx.fillText(gl, gpx + 2, margin.top + plotH + 14);
            }
        }
        for (var gy2 = Math.floor(yMin / yStep) * yStep; gy2 <= Math.ceil(yMax / yStep) * yStep; gy2 += yStep) {
            if (gy2 === 0) continue;
            var gpy2 = y0 - gy2 * yScale;
            if (gpy2 > margin.top && gpy2 < margin.top + plotH) {
                ctx.fillText(gy2, margin.left + 4, gpy2 - 3);
            }
        }
    }

    function renderIntegral() {
        var container = document.getElementById('math-integral-app');
        if (!container) return;
        container.innerHTML = '<div class="tool-app-container" style="padding:16px;">' +
            '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;align-items:end;">' +
            '<div><label style="font-size:13px;color:#666;">f(x)=</label><br><input id="integral-input" style="width:240px;padding:7px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;" placeholder="如: x^2, sin(x), 2*x+1"></div>' +
            '<div><label style="font-size:13px;color:#666;">下限 a</label><br><input id="integral-a" type="number" value="0" step="0.1" style="width:70px;padding:6px;border:1px solid #d1d5db;border-radius:6px;"></div>' +
            '<div><label style="font-size:13px;color:#666;">上限 b</label><br><input id="integral-b" type="number" value="2" step="0.1" style="width:70px;padding:6px;border:1px solid #d1d5db;border-radius:6px;"></div>' +
            '<div><label style="font-size:13px;color:#666;">区间数</label><br><input id="integral-n" type="number" value="1000" min="100" max="100000" style="width:80px;padding:6px;border:1px solid #d1d5db;border-radius:6px;"></div>' +
            '<button id="integral-calc" style="padding:8px 18px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">计算积分</button>' +
            '</div>' +
            '<div id="integral-result" style="margin-bottom:12px;padding:12px 16px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;font-size:15px;color:#166534;min-height:28px;"></div>' +
            '<canvas id="integral-canvas" width="700" height="420" style="border:1px solid #e5e7eb;border-radius:8px;background:#fafbfc;width:100%;max-width:700px;margin-bottom:16px;"></canvas>' +
            '<div style="margin-bottom:6px;font-size:13px;color:#666;">常用积分公式表</div>' +
            '<table style="width:100%;border-collapse:collapse;font-size:12px;"><tr style="background:#f3f4f6;"><th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">名称</th><th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">被积函数</th><th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">原函数（不定积分）</th><th style="padding:6px 8px;border:1px solid #e5e7eb;text-align:left;">示例</th></tr></table></div>';

        var table = container.querySelector('table');
        for (var i = 0; i < integralRules.length; i++) {
            var r = integralRules[i];
            var row = table.insertRow(-1);
            row.innerHTML = '<td style="padding:6px 8px;border:1px solid #e5e7eb;">' + r.name + '</td><td style="padding:6px 8px;border:1px solid #e5e7eb;font-family:monospace;">' + r.rule + '</td><td style="padding:6px 8px;border:1px solid #e5e7eb;font-family:monospace;">' + r.integral + '</td><td style="padding:6px 8px;border:1px solid #e5e7eb;font-size:11px;">' + r.example + '</td>';
        }

        function updateResult() {
            var expr = document.getElementById('integral-input').value.trim();
            var a = parseFloat(document.getElementById('integral-a').value);
            var b = parseFloat(document.getElementById('integral-b').value);
            var n = parseInt(document.getElementById('integral-n').value) || 1000;
            if (!expr || isNaN(a) || isNaN(b)) return;
            var result = computeIntegral(expr, a, b, n);
            var resultEl = document.getElementById('integral-result');
            if (isNaN(result)) {
                resultEl.innerHTML = '无法计算该积分，请检查表达式是否有效或区间内是否存在奇点。';
            } else {
                resultEl.innerHTML = '<div style="font-size:18px;font-family:serif;">∫<sub>' + a.toFixed(2) + '</sub><sup>' + b.toFixed(2) + '</sup> ' + expr + ' dx = <strong>' + result.toFixed(6) + '</strong></div><div style="font-size:12px;margin-top:4px;color:#999;">使用' + n + '个区间的黎曼中点法计算</div>';
            }
            drawIntegralCanvas();
        }

        document.getElementById('integral-calc').onclick = updateResult;
        updateResult();
    }

    return { renderIntegral: renderIntegral };
})();
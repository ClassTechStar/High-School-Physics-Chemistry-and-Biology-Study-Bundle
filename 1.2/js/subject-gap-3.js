// ============================================================
// js/subject-gap-3.js — 学科内容缺口补全 - 物理天体+化学晶体+生物DNA
// 包含三个模块：celestialMotionSim / crystalStructure3D / dnaCentralDogma
// 纯前端、零依赖、ES5兼容、innerHTML+内联style+Canvas/SVG
// ============================================================

// ============================================================
// 模块1: celestialMotionSim —— 物理天体运动模拟器（开普勒三定律）
// ============================================================
window.celestialMotionSim = (function () {
    'use strict';

    var planets = [
        { name: '水星', a: 0.39, e: 0.21, T: 88,  color: '#b8b8b8', rad: 4 },
        { name: '金星', a: 0.72, e: 0.01, T: 225, color: '#e8c878', rad: 6 },
        { name: '地球', a: 1.00, e: 0.02, T: 365, color: '#4a90d9', rad: 6 },
        { name: '火星', a: 1.52, e: 0.09, T: 687, color: '#d9534a', rad: 5 }
    ];

    var state = {
        playing: true, speed: 20, view: 'top', time: 0,
        selected: 2, law: 1, trails: [[], [], [], []],
        screenPos: [], animId: null
    };

    var SCALE = 108;
    var GM = 4 * Math.PI * Math.PI;
    var AUperYR_to_kms = 4.74;

    function solveKepler(M, e) {
        var E = M;
        for (var i = 0; i < 6; i++) {
            E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
        }
        return E;
    }

    function planetXY(p, t) {
        var n = 2 * Math.PI / p.T;
        var M = n * t;
        var E = solveKepler(M, p.e);
        var b = p.a * Math.sqrt(1 - p.e * p.e);
        return { x: p.a * (Math.cos(E) - p.e), y: b * Math.sin(E) };
    }

    function planetSpeedKms(p, t) {
        var pos = planetXY(p, t);
        var r = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
        var v = Math.sqrt(GM * (2 / r - 1 / p.a));
        return v * AUperYR_to_kms;
    }

    function sectorPoints(p, Mstart, Mend) {
        var pts = [{ x: 0, y: 0 }];
        var steps = 24;
        for (var i = 0; i <= steps; i++) {
            var M = Mstart + (Mend - Mstart) * i / steps;
            var E = solveKepler(M, p.e);
            var b = p.a * Math.sqrt(1 - p.e * p.e);
            pts.push({ x: p.a * (Math.cos(E) - p.e), y: b * Math.sin(E) });
        }
        return pts;
    }

    function toScreen(x, y, cx, cy) {
        var yy = (state.view === 'side') ? y * 0.32 : y;
        return { x: cx + x * SCALE, y: cy + yy * SCALE };
    }

    function draw() {
        var canvas = document.getElementById('cm-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) { console.error('无法获取Canvas 2D上下文'); return; }
        var w = canvas.width, h = canvas.height;
        var cx = w / 2, cy = h / 2;
        try {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0b1026';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#ffffff';
        for (var s = 0; s < 60; s++) {
            var sx = (s * 97) % w, sy = (s * 53) % h;
            ctx.globalAlpha = 0.3 + (s % 5) * 0.12;
            ctx.fillRect(sx, sy, 1.4, 1.4);
        }
        ctx.globalAlpha = 1;

        for (var i = 0; i < planets.length; i++) {
            var p = planets[i];
            var b = p.a * Math.sqrt(1 - p.e * p.e);
            var c = p.a * p.e;
            var ocx = cx - c * SCALE;
            var ocy = cy;
            var ry = (state.view === 'side') ? b * SCALE * 0.32 : b * SCALE;
            ctx.strokeStyle = (i === state.selected) ? 'rgba(255,255,255,0.55)' : 'rgba(150,170,220,0.35)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.ellipse(ocx, ocy, p.a * SCALE, ry, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        var sel = planets[state.selected];

        if (state.law === 1) {
            var c1 = sel.a * sel.e;
            var ocx2 = cx - c1 * SCALE;
            ctx.fillStyle = '#888';
            ctx.beginPath(); ctx.arc(ocx2, cy, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.font = '10px sans-serif'; ctx.fillStyle = '#aaa';
            ctx.fillText('椭圆中心', ocx2 - 22, cy + 14);
            var peri = toScreen(sel.a * (1 - sel.e), 0, cx, cy);
            var apo = toScreen(-sel.a * (1 + sel.e), 0, cx, cy);
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath(); ctx.arc(peri.x, peri.y, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillText('近日点 a(1-e)', peri.x + 6, peri.y - 6);
            ctx.fillStyle = '#80deea';
            ctx.beginPath(); ctx.arc(apo.x, apo.y, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillText('远日点 a(1+e)', apo.x - 86, apo.y - 6);
            ctx.strokeStyle = 'rgba(255,235,59,0.4)';
            ctx.setLineDash([2, 3]);
            ctx.beginPath(); ctx.moveTo(ocx2, cy); ctx.lineTo(cx, cy); ctx.stroke();
            ctx.setLineDash([]);
        }

        if (state.law === 2) {
            var dM = 0.5;
            var secA = sectorPoints(sel, -dM, dM);
            var secB = sectorPoints(sel, Math.PI - dM, Math.PI + dM);
            function fillSec(pts, col) {
                ctx.fillStyle = col;
                ctx.beginPath();
                var sp0 = toScreen(pts[0].x, pts[0].y, cx, cy);
                ctx.moveTo(sp0.x, sp0.y);
                for (var k = 1; k < pts.length; k++) {
                    var sp = toScreen(pts[k].x, pts[k].y, cx, cy);
                    ctx.lineTo(sp.x, sp.y);
                }
                ctx.closePath();
                ctx.fill();
            }
            fillSec(secA, 'rgba(255,235,59,0.35)');
            fillSec(secB, 'rgba(128,222,234,0.35)');
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = '#ffeb3b';
            var aP = toScreen(secA[12].x, secA[12].y, cx, cy);
            ctx.fillText('扇形A(近日点)', aP.x + 6, aP.y - 6);
            ctx.fillStyle = '#80deea';
            var bP = toScreen(secB[12].x, secB[12].y, cx, cy);
            ctx.fillText('扇形B(远日点)', bP.x - 92, bP.y - 6);
        }

        var sunR = 12;
        var grd = ctx.createRadialGradient(cx, cy, 2, cx, cy, sunR * 2.2);
        grd.addColorStop(0, '#fff7c2');
        grd.addColorStop(0.4, '#ffd54f');
        grd.addColorStop(1, 'rgba(255,160,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(cx, cy, sunR * 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffce3a';
        ctx.beginPath(); ctx.arc(cx, cy, sunR, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('太阳(焦点)', cx - 22, cy + sunR + 12);

        state.screenPos = [];
        for (var j = 0; j < planets.length; j++) {
            var pl = planets[j];
            var pos = planetXY(pl, state.time);
            if (state.playing) {
                state.trails[j].push({ x: pos.x, y: pos.y });
                if (state.trails[j].length > 180) state.trails[j].shift();
            }
            var tr = state.trails[j];
            for (var t = 1; t < tr.length; t++) {
                var a0 = toScreen(tr[t - 1].x, tr[t - 1].y, cx, cy);
                var a1 = toScreen(tr[t].x, tr[t].y, cx, cy);
                ctx.strokeStyle = pl.color;
                ctx.globalAlpha = (t / tr.length) * 0.6;
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke();
            }
            ctx.globalAlpha = 1;
            var sp = toScreen(pos.x, pos.y, cx, cy);
            state.screenPos.push({ x: sp.x, y: sp.y, r: pl.rad + 3, i: j });
            if (j === state.selected) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(sp.x, sp.y, pl.rad + 4, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.fillStyle = pl.color;
            ctx.beginPath(); ctx.arc(sp.x, sp.y, pl.rad, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '10px sans-serif';
            ctx.fillText(pl.name, sp.x + pl.rad + 2, sp.y - pl.rad - 1);
        }

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '10px sans-serif';
        ctx.fillText(state.view === 'top' ? '视角：俯视' : '视角：侧视(倾角)', 8, h - 8);
        } catch (err) {
            console.error('绘制行星运动失败:', err);
        }
    }

    function updateSidePanel() {
        var p = planets[state.selected];
        var spd = planetSpeedKms(p, state.time);
        var pos = planetXY(p, state.time);
        var r = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
        var el = document.getElementById('cm-planet-data');
        if (el) {
            el.innerHTML =
                '<div style="color:#4a90d9;font-weight:bold;margin-bottom:6px;">' + p.name + ' 数据</div>' +
                '<div>轨道半长轴 a = <b>' + p.a + ' AU</b></div>' +
                '<div>偏心率 e = <b>' + p.e + '</b></div>' +
                '<div>公转周期 T = <b>' + p.T + ' 天</b></div>' +
                '<div>半短轴 b = <b>' + (p.a * Math.sqrt(1 - p.e * p.e)).toFixed(3) + ' AU</b></div>' +
                '<div>当前日心距 r = <b>' + r.toFixed(3) + ' AU</b></div>' +
                '<div>当前速度 v = <b>' + spd.toFixed(2) + ' km/s</b></div>' +
                '<div style="color:#888;margin-top:4px;font-size:11px;">点击Canvas中其它行星可切换</div>';
        }
    }

    function updateLawPanel() {
        var el = document.getElementById('cm-law-panel');
        if (!el) return;
        var lawText = {
            1: '<b style="color:#ffeb3b">第一定律(椭圆定律)</b>：行星绕太阳运动轨道为椭圆，太阳处于椭圆的一个<b>焦点</b>上(非椭圆中心)。图中标注近日点与远日点。',
            2: '<b style="color:#80deea">第二定律(面积定律)</b>：行星与太阳连线在<b>相等时间内扫过相等面积</b>。黄色扇形A(近日点)与青色扇形B(远日点)时间相等面积相等，故近日点速度大、远日点速度小。',
            3: '<b style="color:#a5d6a7">第三定律(周期定律)</b>：所有行星 <b>T²/a³ = 常量</b>。下表各行星该比值近似相等。'
        };
        var table = '<table style="width:100%;border-collapse:collapse;margin-top:6px;font-size:11px;">' +
            '<tr style="background:#1e293b;color:#fff;"><th style="padding:3px;border:1px solid #334">行星</th><th style="padding:3px;border:1px solid #334">a(AU)</th><th style="padding:3px;border:1px solid #334">T(天)</th><th style="padding:3px;border:1px solid #334">T²/a³</th></tr>';
        for (var i = 0; i < planets.length; i++) {
            var pp = planets[i];
            var ratio = (pp.T * pp.T) / Math.pow(pp.a, 3);
            table += '<tr style="text-align:center;' + (i === state.selected ? 'background:#374151;' : '') + '">' +
                '<td style="padding:2px;border:1px solid #334">' + pp.name + '</td>' +
                '<td style="padding:2px;border:1px solid #334">' + pp.a + '</td>' +
                '<td style="padding:2px;border:1px solid #334">' + pp.T + '</td>' +
                '<td style="padding:2px;border:1px solid #334">' + ratio.toFixed(0) + '</td></tr>';
        }
        table += '</table>';
        el.innerHTML = '<div style="background:#0f172a;padding:8px;border-radius:6px;color:#cbd5e1;">' + lawText[state.law] + '</div>' +
            '<div style="margin-top:8px;color:#94a3b8;font-size:12px;">T²/a³ 比值表(第三定律验证)：</div>' + table;
    }

    function animate() {
        if (state.playing) state.time += state.speed * 0.4;
        draw();
        updateSidePanel();
        state.animId = requestAnimationFrame(animate);
    }

    function render() {
        var box = document.getElementById('celestial-motion-app');
        if (!box) return;
        box.innerHTML =
            '<div style="font-family:sans-serif;background:#0b1026;color:#e2e8f0;padding:10px;border-radius:8px;">' +
            '<div style="font-size:16px;font-weight:bold;margin-bottom:8px;color:#ffd54f;">行星椭圆轨道运动 + 开普勒三定律可视化</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;background:#1e293b;padding:8px;border-radius:6px;margin-bottom:8px;">' +
                '<button id="cm-play" style="padding:5px 12px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer;">暂停</button>' +
                '<label style="font-size:12px;">时间倍率 <span id="cm-speed-val">20</span>x' +
                    '<input id="cm-speed" type="range" min="1" max="100" value="20" style="vertical-align:middle;width:160px;"></label>' +
                '<label style="font-size:12px;">视角 <select id="cm-view" style="padding:3px;background:#334155;color:#fff;border:1px solid #475569;border-radius:3px;">' +
                    '<option value="top">俯视</option><option value="side">侧视</option></select></label>' +
                '<label style="font-size:12px;">演示定律 <select id="cm-law" style="padding:3px;background:#334155;color:#fff;border:1px solid #475569;border-radius:3px;">' +
                    '<option value="1">第一定律 椭圆</option><option value="2">第二定律 面积</option><option value="3">第三定律 周期</option></select></label>' +
            '</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
                '<canvas id="cm-canvas" width="640" height="460" style="background:#0b1026;border:1px solid #334155;border-radius:6px;cursor:pointer;"></canvas>' +
                '<div style="flex:1;min-width:230px;display:flex;flex-direction:column;gap:8px;">' +
                    '<div id="cm-planet-data" style="background:#1e293b;padding:8px;border-radius:6px;font-size:12px;min-height:120px;"></div>' +
                    '<div id="cm-law-panel" style="background:#1e293b;padding:8px;border-radius:6px;font-size:12px;"></div>' +
                '</div>' +
            '</div>' +
            '<div style="background:#1e293b;padding:8px;border-radius:6px;margin-top:8px;font-size:12px;color:#cbd5e1;">' +
                '<b style="color:#f59e0b;">高考考点：</b>万有引力提供向心力(GMm/r²=mv²/r=mω²r)；' +
                '三个宇宙速度——第一7.9km/s(环绕)、第二11.2km/s(脱离)、第三16.7km/s(逃逸太阳系)；' +
                '同步卫星(赤道上空、周期=自转周期24h、高度约36000km)；卫星变轨、双星问题(角速度相同、r与质量成反比)。' +
            '</div></div>';

        document.getElementById('cm-play').onclick = function () {
            state.playing = !state.playing;
            this.textContent = state.playing ? '暂停' : '播放';
        };
        document.getElementById('cm-speed').oninput = function () {
            state.speed = +this.value;
            document.getElementById('cm-speed-val').textContent = this.value;
        };
        document.getElementById('cm-view').onchange = function () { state.view = this.value; };
        document.getElementById('cm-law').onchange = function () { state.law = +this.value; updateLawPanel(); };
        var canvas = document.getElementById('cm-canvas');
        canvas.onclick = function (ev) {
            var rect = canvas.getBoundingClientRect();
            var mx = (ev.clientX - rect.left) * (canvas.width / rect.width);
            var my = (ev.clientY - rect.top) * (canvas.height / rect.height);
            var best = -1, bd = 999;
            for (var i = 0; i < state.screenPos.length; i++) {
                var sp = state.screenPos[i];
                var d = Math.hypot(sp.x - mx, sp.y - my);
                if (d < sp.r + 6 && d < bd) { bd = d; best = sp.i; }
            }
            if (best >= 0) { state.selected = best; updateLawPanel(); }
        };
        updateLawPanel();
        if (state.animId) cancelAnimationFrame(state.animId);
        animate();
    }

    return { render: render };
})();
// ============================================================
// 模块2: crystalStructure3D —— 化学晶体结构3D查看器
// ============================================================
window.crystalStructure3D = (function () {
    'use strict';

    var TYPES = {
        Na: { color: '#a855f7', r: 0.10, label: 'Na⁺' },
        Cl: { color: '#22c55e', r: 0.12, label: 'Cl⁻' },
        C:  { color: '#9ca3af', r: 0.09, label: 'C' },
        O:  { color: '#ef4444', r: 0.085, label: 'O' },
        Cu: { color: '#f59e0b', r: 0.11, label: 'Cu' },
        Cs: { color: '#fbbf24', r: 0.13, label: 'Cs⁺' }
    };

    var CUBE_CORNERS = [[0,0,0],[1,0,0],[0,1,0],[0,0,1],[1,1,0],[1,0,1],[0,1,1],[1,1,1]];
    var CUBE_EDGES = [[0,1],[0,2],[0,3],[1,4],[1,5],[2,4],[2,6],[3,5],[3,6],[4,7],[5,7],[6,7]];

    function atoms(spec) {
        var out = [];
        for (var i = 0; i < spec.length; i++) {
            out.push({ x: spec[i][0], y: spec[i][1], z: spec[i][2], type: spec[i][3] });
        }
        return out;
    }
    function dist(a, b) {
        var dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    function computeBonds(ats, threshold, typeFilter) {
        var bonds = [];
        for (var i = 0; i < ats.length; i++) {
            for (var j = i + 1; j < ats.length; j++) {
                if (typeFilter && !typeFilter(ats[i].type, ats[j].type)) continue;
                if (dist(ats[i], ats[j]) < threshold) bonds.push([i, j]);
            }
        }
        return bonds;
    }

    function buildCrystals() {
        var list = {};
        var naclA = atoms([
            [0,0,0,'Cl'],[0.5,0.5,0,'Cl'],[0.5,0,0.5,'Cl'],[0,0.5,0.5,'Cl'],
            [0.5,0,0,'Na'],[0,0.5,0,'Na'],[0,0,0.5,'Na'],[0.5,0.5,0.5,'Na']
        ]);
        list['NaCl'] = { atoms: naclA, bonds: computeBonds(naclA, 0.55, function (a, b) { return a !== b; }),
            props: { type: '离子晶体', particle: 'Na⁺ 和 Cl⁻', force: '离子键', melt: '熔点801°C，较高', coord: '6', struct: '面心立方(两套fcc互穿)' } };

        var diaRaw = [
            [0,0,0,'C'],[1,0,0,'C'],[0,1,0,'C'],[0,0,1,'C'],
            [1,1,0,'C'],[1,0,1,'C'],[0,1,1,'C'],[1,1,1,'C'],
            [0.5,0.5,0,'C'],[0.5,0,0.5,'C'],[0,0.5,0.5,'C'],
            [0.5,0.5,1,'C'],[0.5,1,0.5,'C'],[1,0.5,0.5,'C'],
            [0.25,0.25,0.25,'C'],[0.75,0.75,0.25,'C'],[0.75,0.25,0.75,'C'],[0.25,0.75,0.75,'C']
        ];
        var diaA = atoms(diaRaw);
        list['金刚石'] = { atoms: diaA, bonds: computeBonds(diaA, 0.45, null),
            props: { type: '原子晶体', particle: 'C 原子', force: '共价键', melt: '熔点>3550°C，极高', coord: '4', struct: '正四面体空间网状，键角109°28′' } };

        var graRaw = [];
        var layerZ = [0.25, 0.75];
        for (var L = 0; L < 2; L++) {
            var z = layerZ[L];
            for (var k = 0; k < 6; k++) {
                var ang = k * Math.PI / 3;
                graRaw.push([0.5 + 0.28 * Math.cos(ang), 0.5 + 0.28 * Math.sin(ang), z, 'C']);
            }
        }
        var graA = atoms(graRaw);
        var graBonds = [];
        for (var i = 0; i < graA.length; i++) {
            for (var j = i + 1; j < graA.length; j++) {
                if (Math.abs(graA[i].z - graA[j].z) < 0.01 && dist(graA[i], graA[j]) < 0.32) graBonds.push([i, j]);
            }
        }
        list['石墨'] = { atoms: graA, bonds: graBonds,
            props: { type: '混合型晶体', particle: 'C 原子', force: '层内共价键，层间范德华力', melt: '熔点高(层内共价键强)', coord: '3', struct: '层状平面六边形，sp²杂化' } };

        var co2Raw = [
            [0.25,0.25,0.25,'C'],[0.25,0.13,0.25,'O'],[0.25,0.37,0.25,'O'],
            [0.75,0.75,0.75,'C'],[0.75,0.63,0.75,'O'],[0.75,0.87,0.75,'O'],
            [0.75,0.25,0.75,'C'],[0.75,0.25,0.63,'O'],[0.75,0.25,0.87,'O']
        ];
        var co2A = atoms(co2Raw);
        list['干冰'] = { atoms: co2A, bonds: computeBonds(co2A, 0.15, null),
            props: { type: '分子晶体', particle: 'CO₂ 分子', force: '范德华力(分子间)', melt: '升华-78.5°C，熔沸点很低', coord: '—', struct: 'CO₂分子面心立方排列' } };

        var cuRaw = [
            [0,0,0,'Cu'],[1,0,0,'Cu'],[0,1,0,'Cu'],[0,0,1,'Cu'],
            [1,1,0,'Cu'],[1,0,1,'Cu'],[0,1,1,'Cu'],[1,1,1,'Cu'],
            [0.5,0.5,0,'Cu'],[0.5,0,0.5,'Cu'],[0,0.5,0.5,'Cu'],
            [0.5,0.5,1,'Cu'],[0.5,1,0.5,'Cu'],[1,0.5,0.5,'Cu']
        ];
        var cuA = atoms(cuRaw);
        list['金属铜'] = { atoms: cuA, bonds: computeBonds(cuA, 0.74, null),
            props: { type: '金属晶体', particle: 'Cu原子/阳离子与自由电子', force: '金属键', melt: '熔点1083°C，较高', coord: '12', struct: '面心立方最密堆积' } };

        var csRaw = [
            [0.5,0.5,0.5,'Cs'],
            [0,0,0,'Cl'],[1,0,0,'Cl'],[0,1,0,'Cl'],[0,0,1,'Cl'],
            [1,1,0,'Cl'],[1,0,1,'Cl'],[0,1,1,'Cl'],[1,1,1,'Cl']
        ];
        var csA = atoms(csRaw);
        list['CsCl'] = { atoms: csA, bonds: computeBonds(csA, 0.9, function (a, b) { return a !== b; }),
            props: { type: '离子晶体', particle: 'Cs⁺ 和 Cl⁻', force: '离子键', melt: '熔点645°C，较高', coord: '8', struct: '体心立方(简单立方互穿)' } };

        return list;
    }

    var CRYSTALS = buildCrystals();
    var ORDER = ['NaCl', '金刚石', '石墨', '干冰', '金属铜', 'CsCl'];

    var view = { rotX: -0.5, rotY: 0.6, zoom: 1, current: 'NaCl', drag: false, lastX: 0, lastY: 0 };

    function rotatePt(p, ax, ay) {
        var cy = Math.cos(ay), sy = Math.sin(ay);
        var x1 = p.x * cy - p.z * sy;
        var z1 = p.x * sy + p.z * cy;
        var cx = Math.cos(ax), sx = Math.sin(ax);
        var y1 = p.y * cx - z1 * sx;
        var z2 = p.y * sx + z1 * cx;
        return { x: x1, y: y1, z: z2 };
    }
    function project(p, w, h, scale, dist) {
        var f = dist / (dist + p.z);
        return { x: w / 2 + p.x * scale * f, y: h / 2 - p.y * scale * f, z: p.z, f: f };
    }

    function draw() {
        var canvas = document.getElementById('cs-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) { console.error('无法获取Canvas 2D上下文'); return; }
        var w = canvas.width, h = canvas.height;
        try {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0b1026';
        ctx.fillRect(0, 0, w, h);
        var cr = CRYSTALS[view.current];
        if (!cr) return;
        var scale = 180 * view.zoom;
        var dist = 3.2;
        function rt(a) { return rotatePt({ x: a.x - 0.5, y: a.y - 0.5, z: a.z - 0.5 }, view.rotX, view.rotY); }

        var corners = [];
        for (var i = 0; i < CUBE_CORNERS.length; i++) {
            corners.push(project(rt({ x: CUBE_CORNERS[i][0], y: CUBE_CORNERS[i][1], z: CUBE_CORNERS[i][2] }), w, h, scale, dist));
        }
        ctx.strokeStyle = 'rgba(200,210,240,0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        for (var e = 0; e < CUBE_EDGES.length; e++) {
            var a0 = corners[CUBE_EDGES[e][0]], a1 = corners[CUBE_EDGES[e][1]];
            ctx.beginPath(); ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y); ctx.stroke();
        }
        ctx.setLineDash([]);

        var projAtoms = [];
        for (var k = 0; k < cr.atoms.length; k++) {
            var r = rt(cr.atoms[k]);
            var pp = project(r, w, h, scale, dist);
            pp.type = cr.atoms[k].type;
            projAtoms.push(pp);
        }
        var drawables = [];
        for (var b = 0; b < cr.bonds.length; b++) {
            var p1 = projAtoms[cr.bonds[b][0]], p2 = projAtoms[cr.bonds[b][1]];
            drawables.push({ z: (p1.z + p2.z) / 2, kind: 'bond', p1: p1, p2: p2 });
        }
        for (var n = 0; n < projAtoms.length; n++) {
            drawables.push({ z: projAtoms[n].z, kind: 'atom', p: projAtoms[n] });
        }
        drawables.sort(function (a, b) { return b.z - a.z; });

        for (var d = 0; d < drawables.length; d++) {
            var it = drawables[d];
            if (it.kind === 'bond') {
                ctx.strokeStyle = 'rgba(220,225,240,0.7)';
                ctx.lineWidth = 2 * Math.max(0.4, (it.p1.f + it.p2.f) / 2);
                ctx.beginPath(); ctx.moveTo(it.p1.x, it.p1.y); ctx.lineTo(it.p2.x, it.p2.y); ctx.stroke();
            } else {
                var T = TYPES[it.p.type];
                var rad = T.r * scale * it.p.f;
                var g = ctx.createRadialGradient(it.p.x - rad * 0.3, it.p.y - rad * 0.3, rad * 0.1, it.p.x, it.p.y, rad);
                g.addColorStop(0, '#ffffff');
                g.addColorStop(0.25, T.color);
                g.addColorStop(1, '#1a1a2e');
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(it.p.x, it.p.y, rad, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = 'rgba(0,0,0,0.4)';
                ctx.lineWidth = 0.8; ctx.stroke();
                if (rad > 9) {
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 9px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(T.label, it.p.x, it.p.y + 3);
                }
            }
        }
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(view.current + ' 晶胞', 10, 20);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('拖拽旋转 / 滚轮缩放', 10, h - 10);
        } catch (err) {
            console.error('绘制晶体结构失败:', err);
        }
    }

    function updateProps() {
        var cr = CRYSTALS[view.current];
        var el = document.getElementById('cs-props');
        if (!el || !cr) return;
        var p = cr.props;
        el.innerHTML =
            '<div style="color:#f59e0b;font-weight:bold;margin-bottom:6px;">' + view.current + ' 性质</div>' +
            '<div><b>晶体类型：</b>' + p.type + '</div>' +
            '<div><b>构成微粒：</b>' + p.particle + '</div>' +
            '<div><b>微粒间作用力：</b>' + p.force + '</div>' +
            '<div><b>熔沸点特征：</b>' + p.melt + '</div>' +
            '<div><b>配位数：</b>' + p.coord + '</div>' +
            '<div><b>空间构型：</b>' + p.struct + '</div>' +
            '<div style="margin-top:6px;color:#888;font-size:11px;">原子色标：Na⁺紫 Cl⁻绿 C灰 O红 Cu橙 Cs⁺金</div>';
    }

    function render() {
        var box = document.getElementById('crystal-structure-3d-app');
        if (!box) return;
        var listHtml = '';
        for (var i = 0; i < ORDER.length; i++) {
            listHtml += '<div class="cs-item" data-name="' + ORDER[i] + '" style="padding:8px 10px;margin:4px 0;background:' +
                (ORDER[i] === view.current ? '#2563eb' : '#334155') + ';color:#fff;border-radius:5px;cursor:pointer;font-size:13px;">' + ORDER[i] + '</div>';
        }
        box.innerHTML =
            '<div style="font-family:sans-serif;background:#0b1026;color:#e2e8f0;padding:10px;border-radius:8px;">' +
            '<div style="font-size:16px;font-weight:bold;margin-bottom:8px;color:#f59e0b;">化学晶体结构 3D 查看器</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
                '<div id="cs-list" style="width:130px;">' + listHtml + '</div>' +
                '<canvas id="cs-canvas" width="460" height="420" style="background:#0b1026;border:1px solid #334155;border-radius:6px;cursor:grab;"></canvas>' +
                '<div id="cs-props" style="flex:1;min-width:220px;background:#1e293b;padding:10px;border-radius:6px;font-size:12px;"></div>' +
            '</div>' +
            '<div style="background:#1e293b;padding:8px;border-radius:6px;margin-top:8px;font-size:12px;color:#cbd5e1;">' +
                '<b style="color:#f59e0b;">高考考点：</b>晶体类型判断(看构成微粒与作用力)；' +
                '熔沸点比较：原子晶体>离子晶体>分子晶体(金属晶体差异大，看价电子数与半径)；' +
                '晶胞计算(均摊法：顶点1/8、棱1/4、面1/2、体心1)；配位数与空间构型判断；常见晶体：NaCl/金刚石/石墨/干冰/SiO₂。' +
            '</div></div>';

        var list = document.getElementById('cs-list');
        var items = list.getElementsByClassName('cs-item');
        for (var k = 0; k < items.length; k++) {
            (function (it) {
                it.onclick = function () {
                    view.current = it.getAttribute('data-name');
                    for (var m = 0; m < items.length; m++) items[m].style.background = '#334155';
                    it.style.background = '#2563eb';
                    updateProps();
                    draw();
                };
            })(items[k]);
        }
        var canvas = document.getElementById('cs-canvas');
        canvas.onmousedown = function (ev) {
            view.drag = true; view.lastX = ev.clientX; view.lastY = ev.clientY;
            canvas.style.cursor = 'grabbing';
        };
        window.document.onmousemove = function (ev) {
            if (!view.drag) return;
            view.rotY += (ev.clientX - view.lastX) * 0.01;
            view.rotX += (ev.clientY - view.lastY) * 0.01;
            view.rotX = Math.max(-1.4, Math.min(1.4, view.rotX));
            view.lastX = ev.clientX; view.lastY = ev.clientY;
            draw();
        };
        window.document.onmouseup = function () { view.drag = false; canvas.style.cursor = 'grab'; };
        canvas.onwheel = function (ev) {
            ev.preventDefault();
            view.zoom *= (ev.deltaY < 0 ? 1.1 : 0.9);
            view.zoom = Math.max(0.4, Math.min(3, view.zoom));
            draw();
        };
        updateProps();
        draw();
    }

    return { render: render };
})();
// ============================================================
// 模块3: dnaCentralDogma —— 生物DNA复制转录翻译动画
// ============================================================
window.dnaCentralDogma = (function () {
    'use strict';

    var BCOLOR = { A: '#ef4444', T: '#3b82f6', G: '#22c55e', C: '#eab308', U: '#a855f7' };
    function bcol(l) { return BCOLOR[l] || '#888'; }

    var CODON = {
        UUU:'Phe',UUC:'Phe',UUA:'Leu',UUG:'Leu',UCU:'Ser',UCC:'Ser',UCA:'Ser',UCG:'Ser',
        UAU:'Tyr',UAC:'Tyr',UAA:'Stop',UAG:'Stop',UGU:'Cys',UGC:'Cys',UGA:'Stop',UGG:'Trp',
        CUU:'Leu',CUC:'Leu',CUA:'Leu',CUG:'Leu',CCU:'Pro',CCC:'Pro',CCA:'Pro',CCG:'Pro',
        CAU:'His',CAC:'His',CAA:'Gln',CAG:'Gln',CGU:'Arg',CGC:'Arg',CGA:'Arg',CGG:'Arg',
        AUU:'Ile',AUC:'Ile',AUA:'Ile',AUG:'Met(起)',ACU:'Thr',ACC:'Thr',ACA:'Thr',ACG:'Thr',
        AAU:'Asn',AAC:'Asn',AAA:'Lys',AAG:'Lys',AGU:'Ser',AGC:'Ser',AGA:'Arg',AGG:'Arg',
        GUU:'Val',GUC:'Val',GUA:'Val',GUG:'Val',GCU:'Ala',GCC:'Ala',GCA:'Ala',GCG:'Ala',
        GAU:'Asp',GAC:'Asp',GAA:'Glu',GAG:'Glu',GGU:'Gly',GGC:'Gly',GGA:'Gly',GGG:'Gly'
    };

    function baseBox(l, x, y, s, op) {
        op = (op == null) ? 1 : op;
        return '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" rx="3" fill="' + bcol(l) + '" opacity="' + op + '"/>' +
            '<text x="' + (x + s / 2) + '" y="' + (y + s / 2 + 4) + '" font-size="11" fill="#fff" text-anchor="middle" font-weight="bold" opacity="' + op + '">' + l + '</text>';
    }
    function strandRow(bases, x0, y, s, gap, op) {
        var out = '';
        for (var i = 0; i < bases.length; i++) out += baseBox(bases.charAt(i), x0 + i * (s + gap), y, s, op);
        return out;
    }
    function rungs(topB, botB, x0, yTop, yBot, s, gap) {
        var out = '';
        for (var i = 0; i < topB.length; i++) {
            var x = x0 + i * (s + gap) + s / 2;
            out += '<line x1="' + x + '" y1="' + (yTop + s) + '" x2="' + x + '" y2="' + yBot + '" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/>';
        }
        return out;
    }
    function label(x, y, txt, col) {
        return '<text x="' + x + '" y="' + y + '" font-size="11" fill="' + (col || '#cbd5e1') + '">' + txt + '</text>';
    }
    function comp(b) { return { A:'T', T:'A', G:'C', C:'G' }[b] || '?'; }
    function compRNA(b) { return { A:'U', T:'A', G:'C', C:'G' }[b] || '?'; }

    var PROC = [];
    var replTop = 'ATGCAATCG';
    var replBot = ''; for (var i = 0; i < replTop.length; i++) replBot += comp(replTop.charAt(i));

    PROC.push([
        { title: '亲代DNA双螺旋', text: 'DNA由两条反向平行链通过碱基对(A-T、G-C)氢键连接，形成双螺旋。',
          render: function (p) {
              var s=22, gap=4, x0=150, yTop=150, yBot=188;
              return rungs(replTop, replBot, x0, yTop, yBot, s, gap) +
                  strandRow(replTop, x0, yTop, s, gap) + strandRow(replBot, x0, yBot, s, gap) +
                  label(x0, yTop - 8, '母链1(5′→3′)') + label(x0, yBot + s + 14, '母链2(3′→5′)');
          } },
        { title: '解旋酶解开双链', text: '解旋酶断裂氢键，DNA双链局部解开形成复制叉，每条母链作模板。',
          render: function (p) {
              var s=20, gap=4, x0=130, mid=4;
              var yTop=150-p*22, yBot=188+p*22;
              var svg='<circle cx="'+(x0+mid*(s+gap))+'" cy="169" r="14" fill="rgba(245,158,11,0.7)"/>'+label(x0+mid*(s+gap)-18,174,'解旋酶','#fff');
              for (var i=0;i<mid;i++){var x=x0+i*(s+gap)+s/2;svg+='<line x1="'+x+'" y1="'+(150+s)+'" x2="'+x+'" y2="188" stroke="rgba(255,255,255,0.4)"/>';}
              svg+=strandRow(replTop.substring(0,mid),x0,150,s,gap)+strandRow(replBot.substring(0,mid),x0,188,s,gap);
              svg+=strandRow(replTop.substring(mid),x0+mid*(s+gap),yTop,s,gap)+strandRow(replBot.substring(mid),x0+mid*(s+gap),yBot,s,gap);
              return svg;
          } },
        { title: 'DNA聚合酶合成子链', text: 'DNA聚合酶以母链为模板，按碱基互补配对(A-T、G-C)合成新子链。',
          render: function (p) {
              var s=18, gap=3, x0=90;
              var t1=replTop, b1='', n=Math.floor(t1.length*p);
              for (var i=0;i<n;i++) b1+=comp(t1.charAt(i));
              var t2=replBot, b2='', n2=Math.floor(t2.length*p);
              for (var j=0;j<n2;j++) b2+=comp(t2.charAt(j));
              return label(x0,102,'母链1(模板)')+label(x0,156,'新子链')+label(x0,192,'新子链')+label(x0,246,'母链2(模板)')+
                  strandRow(t1,x0,110,s,gap,0.85)+strandRow(b1,x0,138,s,gap)+
                  strandRow(b2,x0,200,s,gap)+strandRow(t2,x0,228,s,gap,0.85)+
                  label(360,170,'DNA聚合酶','#f59e0b');
          } },
        { title: '半保留复制完成', text: '形成两个相同子代DNA，每个含一条母链(深色)和一条新子链(浅色)，即半保留复制。',
          render: function (p) {
              var s=16, gap=3, x0=70, x1=320, yT=120, yB=150;
              function pair(top,bot,x,opT,opB){return rungs(top,bot,x,yT,yB,s,gap)+strandRow(top,x,yT,s,gap,opT)+strandRow(bot,x,yB,s,gap,opB);}
              return label(x0,yT-8,'子代DNA①')+pair(replTop,replBot,x0,0.55,1)+
                  label(x1,yT-8,'子代DNA②')+pair(replTop,replBot,x1,1,0.55)+
                  label(x0,yB+s+30,'深色=母链 浅色=子链');
          } }
    ]);

    var trTemp='TACGGATC';
    var trCode=''; for (var i=0;i<trTemp.length;i++) trCode+=comp(trTemp.charAt(i));
    var trMRNA=''; for (var i=0;i<trTemp.length;i++) trMRNA+=compRNA(trTemp.charAt(i));

    PROC.push([
        { title:'DNA片段', text:'DNA双链中，作为转录模板的链称模板链，另一条称编码链。',
          render:function(p){var s=22,gap=4,x0=150,yTop=150,yBot=188;
              return rungs(trCode,trTemp,x0,yTop,yBot,s,gap)+strandRow(trCode,x0,yTop,s,gap)+strandRow(trTemp,x0,yBot,s,gap)+
                  label(x0,yTop-8,'编码链')+label(x0,yBot+s+14,'模板链');}},
        { title:'RNA聚合酶结合，DNA解开', text:'RNA聚合酶结合模板链，将DNA局部解开形成转录泡。',
          render:function(p){var s=20,gap=4,x0=130,mid=4,yTop=150-p*20,yBot=188+p*20;
              var svg='<rect x="'+(x0+mid*(s+gap)-8)+'" y="155" width="40" height="28" rx="6" fill="rgba(168,85,247,0.7)"/>'+label(x0+mid*(s+gap)-6,173,'RNApol','#fff');
              for(var i=0;i<mid;i++){var x=x0+i*(s+gap)+s/2;svg+='<line x1="'+x+'" y1="'+(150+s)+'" x2="'+x+'" y2="188" stroke="rgba(255,255,255,0.4)"/>';}
              svg+=strandRow(trCode.substring(0,mid),x0,150,s,gap)+strandRow(trTemp.substring(0,mid),x0,188,s,gap);
              svg+=strandRow(trCode.substring(mid),x0+mid*(s+gap),yTop,s,gap)+strandRow(trTemp.substring(mid),x0+mid*(s+gap),yBot,s,gap);
              return svg;}},
        { title:'以模板链合成mRNA', text:'以模板链为模板，按A-U、T-A、G-C、C-G配对合成mRNA(尿嘧啶U替代T)。',
          render:function(p){var s=20,gap=3,x0=120,n=Math.floor(trTemp.length*p),grown=trMRNA.substring(0,n);
              return label(x0,112,'编码链')+strandRow(trCode,x0,120,s,gap,0.6)+
                  label(x0,150,'mRNA(新合成)')+strandRow(grown,x0,158,s,gap)+
                  label(x0,192,'模板链')+strandRow(trTemp,x0,200,s,gap)+
                  label(360,170,'A-U T-A G-C C-G','#a5d6a7');}},
        { title:'mRNA脱离，DNA恢复', text:'mRNA合成完毕脱离DNA，DNA双链重新结合恢复，mRNA进入细胞质。',
          render:function(p){var s=20,gap=3,x0=120,yM=80+p*20,yTop=150,yBot=188;
              return label(x0,yM-8,'mRNA → 细胞质')+strandRow(trMRNA,x0,yM,s,gap)+
                  rungs(trCode,trTemp,x0,yTop,yBot,s,gap)+strandRow(trCode,x0,yTop,s,gap)+strandRow(trTemp,x0,yBot,s,gap)+
                  label(x0,yTop-8,'DNA(恢复双链)');}}
    ]);

    var tlMRNA='AUGGCAUUCUAA';
    var tlAA=['Met','Ala','Phe'];
    var tlAnti=['UAC','CGU','AAG'];

    PROC.push([
        { title:'mRNA进入细胞质', text:'mRNA从细胞核进入细胞质，准备在核糖体上进行翻译。',
          render:function(p){var s=18,gap=3,x0=120,y=180;
              return label(x0,y-10,'mRNA')+strandRow(tlMRNA,x0,y,s,gap)+label(x0,y+s+16,'5′——————————3′','#94a3b8');}},
        { title:'核糖体结合起始密码子', text:'核糖体结合mRNA，识别起始密码子AUG(编码甲硫氨酸Met)。',
          render:function(p){var s=18,gap=3,x0=120,y=200,ribX=x0+3*(s+gap)-6;
              return strandRow(tlMRNA,x0,y,s,gap)+'<ellipse cx="'+ribX+'" cy="'+(y-6)+'" rx="34" ry="20" fill="rgba(245,158,11,0.5)" stroke="#f59e0b"/>'+
                  label(ribX-16,y-8,'核糖体','#f59e0b')+label(x0,y+s+16,'起始密码子AUG','#fbbf24');}},
        { title:'tRNA转运氨基酸', text:'tRNA一端携带特定氨基酸，另一端反密码子与mRNA密码子互补配对。',
          render:function(p){var s=18,gap=3,x0=120,y=200,ribX=x0+3*(s+gap)-6;
              var svg=strandRow(tlMRNA,x0,y,s,gap)+'<ellipse cx="'+ribX+'" cy="'+(y-6)+'" rx="34" ry="20" fill="rgba(245,158,11,0.4)" stroke="#f59e0b"/>';
              var tX=x0+1.5*(s+gap);
              svg+='<line x1="'+tX+'" y1="'+(y-26)+'" x2="'+tX+'" y2="'+(y-2)+'" stroke="#a855f7" stroke-width="2"/>'+
                  '<rect x="'+(tX-24)+'" y="'+(y-52)+'" width="48" height="14" rx="4" fill="#a855f7"/>'+
                  label(tX-10,y-42,'tRNA','#fff')+strandRow(tlAnti[0],tX-18,y-26,12,1)+
                  '<circle cx="'+tX+'" cy="'+(y-64)+'" r="8" fill="#22c55e"/>'+label(tX-8,y-60,'Met','#fff');
              return svg+label(x0,y+s+16,'反密码子UAC ↔ 密码子AUG','#a5d6a7');}},
        { title:'肽链延伸', text:'核糖体沿mRNA移动，tRNA依次进入，肽键形成，肽链逐步延伸。',
          render:function(p){var s=18,gap=3,x0=110,y=210,n=Math.min(tlAA.length,Math.floor(p*tlAA.length+0.001));
              if(n<1)n=1;var ribX=x0+(n-1)*3*(s+gap)+3*(s+gap)/2;
              var svg=strandRow(tlMRNA,x0,y,s,gap)+'<ellipse cx="'+ribX+'" cy="'+(y-6)+'" rx="34" ry="20" fill="rgba(245,158,11,0.35)" stroke="#f59e0b"/>';
              for(var k=0;k<n;k++){var cx=x0+k*3*(s+gap)+3*(s+gap)/2,cy=y-40;
                  if(k>0){var px=x0+(k-1)*3*(s+gap)+3*(s+gap)/2;svg+='<line x1="'+px+'" y1="'+cy+'" x2="'+cx+'" y2="'+cy+'" stroke="#fff" stroke-width="2"/>';}
                  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="9" fill="#22c55e"/>'+label(cx-7,cy+3,tlAA[k],'#fff');}
              return svg+label(x0,y+s+16,'肽键(—CO—NH—)连接氨基酸','#cbd5e1');}},
        { title:'翻译终止', text:'核糖体遇终止密码子(UAA/UAG/UGA)，肽链释放形成具特定氨基酸序列的蛋白质。',
          render:function(p){var s=18,gap=3,x0=110,y=220;
              var svg=strandRow(tlMRNA,x0,y,s,gap)+label(x0,y+s+16,'终止密码子UAA','#f87171');
              var cx0=130,cy=120;
              for(var k=0;k<tlAA.length;k++){var cx=cx0+k*70;
                  if(k>0)svg+='<line x1="'+(cx-70+12)+'" y1="'+cy+'" x2="'+(cx-12)+'" y2="'+cy+'" stroke="#fff" stroke-width="2.5"/>';
                  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="14" fill="#22c55e"/>'+label(cx-9,cy+4,tlAA[k],'#fff');}
              svg+=label(cx0-20,cy-28,'蛋白质(多肽链)','#86efac');
              return svg;}}
    ]);

    var KNOW = [
        { title:'DNA复制', rule:'A-T、G-C（DNA-DNA）',
          points:'半保留复制(Meselson-Stahl ¹⁵N实验)；场所：细胞核(主要)、线粒体/叶绿体；时间：有丝分裂间期/减数第一次分裂间期；条件：模板、酶(解旋酶/DNA聚合酶)、原料(dNTP)、能量；特点：边解旋边复制、多起点。' },
        { title:'转录', rule:'A-U、T-A、G-C、C-G（DNA-RNA）',
          points:'场所：细胞核(主要)；模板：DNA一条链(模板链)；酶：RNA聚合酶；原料：核糖核苷酸；产物：mRNA；转录后mRNA进入细胞质。复制全DNA，转录局部基因。' },
        { title:'翻译', rule:'A-U、U-A、G-C、C-G（mRNA-tRNA）',
          points:'场所：核糖体；模板：mRNA；搬运工具：tRNA(反密码子-氨基酸)；密码子：每3个相邻碱基决定1个氨基酸(64个密码子，61个编码氨基酸，3个终止)；起始AUG、终止UAA/UAG/UGA；方向mRNA 5′→3′。' }
    ];

    var state = { proc:0, step:0, progress:0, playing:false, speed:1, raf:null };

    function currentStep(){return PROC[state.proc][state.step];}
    function renderSVG(){
        var st=currentStep();
        var el=document.getElementById('dc-svg');
        if(el)el.innerHTML='<svg width="600" height="320" viewBox="0 0 600 320" style="background:#0b1026;border-radius:6px;">'+st.render(state.progress)+'</svg>';
        var ti=document.getElementById('dc-title');if(ti)ti.textContent=(state.proc+1)+'.'+(state.step+1)+' '+st.title;
        var tx=document.getElementById('dc-text');if(tx)tx.textContent=st.text;
    }
    function renderKnow(){
        var k=KNOW[state.proc],el=document.getElementById('dc-know');if(!el)return;
        var keys=['AUG','UUU','UUC','GCA','UAA','UAG','UGA','GAA','CCC','CGU','GGC'];
        var tbl='<div style="margin-top:6px;font-size:11px;color:#94a3b8;">密码子简表(节选)：</div><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">';
        for(var i=0;i<keys.length;i++)tbl+='<span style="background:#334155;padding:2px 5px;border-radius:3px;font-size:10px;">'+keys[i]+'→'+CODON[keys[i]]+'</span>';
        tbl+='<span style="background:#334155;padding:2px 5px;border-radius:3px;font-size:10px;">共64密码子→20氨基酸</span></div>';
        el.innerHTML='<div style="color:#a5d6a7;font-weight:bold;margin-bottom:4px;">'+k.title+' 知识点</div>'+
            '<div style="color:#fbbf24;font-size:12px;">配对规则：'+k.rule+'</div>'+
            '<div style="margin-top:6px;font-size:12px;color:#cbd5e1;">'+k.points+'</div>'+tbl;
    }
    function loop(){
        if(state.playing){
            state.progress+=0.012*state.speed;
            if(state.progress>=1){
                state.progress=0;
                if(state.step<PROC[state.proc].length-1)state.step++;
                else{state.playing=false;var btn=document.getElementById('dc-play');if(btn)btn.textContent='播放动画';}
            }
            renderSVG();
        }
        state.raf=requestAnimationFrame(loop);
    }
    function selectProc(idx){
        state.proc=idx;state.step=0;state.progress=0;state.playing=false;
        var btn=document.getElementById('dc-play');if(btn)btn.textContent='播放动画';
        var tabs=document.getElementsByClassName('dc-tab');
        for(var i=0;i<tabs.length;i++)tabs[i].style.background=(i===idx)?'#2563eb':'#334155';
        renderKnow();renderSVG();
    }

    function render(){
        var box=document.getElementById('dna-central-dogma-app');
        if(!box)return;
        box.innerHTML=
            '<div style="font-family:sans-serif;background:#0b1026;color:#e2e8f0;padding:10px;border-radius:8px;">'+
            '<div style="font-size:16px;font-weight:bold;margin-bottom:8px;color:#a5d6a7;">中心法则：DNA复制 → 转录 → 翻译</div>'+
            '<div style="display:flex;gap:6px;margin-bottom:8px;">'+
                '<button class="dc-tab" data-p="0" style="flex:1;padding:8px;background:#2563eb;color:#fff;border:none;border-radius:5px;cursor:pointer;">① DNA复制</button>'+
                '<button class="dc-tab" data-p="1" style="flex:1;padding:8px;background:#334155;color:#fff;border:none;border-radius:5px;cursor:pointer;">② 转录</button>'+
                '<button class="dc-tab" data-p="2" style="flex:1;padding:8px;background:#334155;color:#fff;border:none;border-radius:5px;cursor:pointer;">③ 翻译</button>'+
            '</div>'+
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">'+
                '<div style="flex:1;min-width:620px;">'+
                    '<div id="dc-svg" style="text-align:center;"></div>'+
                    '<div style="display:flex;gap:6px;align-items:center;margin-top:8px;flex-wrap:wrap;">'+
                        '<button id="dc-play" style="padding:6px 14px;background:#16a34a;color:#fff;border:none;border-radius:4px;cursor:pointer;">播放动画</button>'+
                        '<button id="dc-prev" style="padding:6px 12px;background:#475569;color:#fff;border:none;border-radius:4px;cursor:pointer;">上一步</button>'+
                        '<button id="dc-next" style="padding:6px 12px;background:#475569;color:#fff;border:none;border-radius:4px;cursor:pointer;">下一步</button>'+
                        '<label style="font-size:12px;">速度 <span id="dc-speed-val">1.0</span>x<input id="dc-speed" type="range" min="0.3" max="3" step="0.1" value="1" style="vertical-align:middle;width:120px;"></label>'+
                        '<span id="dc-title" style="font-weight:bold;color:#fbbf24;margin-left:8px;"></span>'+
                    '</div>'+
                    '<div id="dc-text" style="background:#1e293b;padding:8px;border-radius:6px;margin-top:6px;font-size:12px;color:#cbd5e1;min-height:40px;"></div>'+
                '</div>'+
                '<div id="dc-know" style="width:260px;background:#1e293b;padding:10px;border-radius:6px;font-size:12px;"></div>'+
            '</div>'+
            '<div style="background:#1e293b;padding:8px;border-radius:6px;margin-top:8px;font-size:12px;color:#cbd5e1;">'+
                '<b style="color:#a5d6a7;">相关高考真题/考点：</b>半保留复制实验(Meselson-Stahl,¹⁵N标记)；复制/转录/翻译场所区别(复制转录主要在细胞核，翻译在核糖体)；'+
                '碱基配对规则三种场景；密码子简并性(多种密码子→1种氨基酸)与通用性；基因表达选择性(导致细胞分化)；tRNA种类(61种带氨基酸)。'+
            '</div></div>';

        var tabs=box.getElementsByClassName('dc-tab');
        for(var i=0;i<tabs.length;i++){(function(t){t.onclick=function(){selectProc(+t.getAttribute('data-p'));};})(tabs[i]);}
        document.getElementById('dc-play').onclick=function(){
            if(state.step>=PROC[state.proc].length-1&&state.progress===0)state.step=0;
            state.playing=!state.playing;this.textContent=state.playing?'暂停':'播放动画';
        };
        document.getElementById('dc-prev').onclick=function(){state.playing=false;document.getElementById('dc-play').textContent='播放动画';if(state.step>0){state.step--;state.progress=0;renderSVG();}};
        document.getElementById('dc-next').onclick=function(){state.playing=false;document.getElementById('dc-play').textContent='播放动画';if(state.step<PROC[state.proc].length-1){state.step++;state.progress=0;renderSVG();}};
        document.getElementById('dc-speed').oninput=function(){state.speed=+this.value;document.getElementById('dc-speed-val').textContent=(+this.value).toFixed(1);};
        renderKnow();renderSVG();
        if(state.raf)cancelAnimationFrame(state.raf);
        loop();
    }

    return { render: render };
})();

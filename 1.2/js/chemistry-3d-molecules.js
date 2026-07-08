// ============================================================
// js/chemistry-3d-molecules.js — 3D分子模型查看器
// ============================================================
window.chemistry3DMolecules = (function() {
    'use strict';

    var molecules = {
        'H2O': {
            name: '\u6C34 (H\u2082O)',
            geometry: '\u5F2F\u66F2\u578B (Bent), \u952E\u89D2 ~104.5\u00B0',
            info: '\u6C27\u539F\u5B50\u91C7\u7528sp\u00B3\u6742\u5316\uFF0C\u4E24\u5BF9\u5B64\u7535\u5B50\u5BF9\u538B\u7F29\u952E\u89D2\u81F3104.5\u00B0\u3002\u5206\u5B50\u5177\u6709\u5F3A\u6781\u6027\u3002',
            atoms: [
                { elem: 'O', x: 0, y: 0, z: 0 },
                { elem: 'H', x: 0.757, y: 0.586, z: 0 },
                { elem: 'H', x: -0.757, y: 0.586, z: 0 }
            ],
            bonds: [[0,1], [0,2]]
        },
        'CH4': {
            name: '\u7532\u70F7 (CH\u2084)',
            geometry: '\u6B63\u56DB\u9762\u4F53\u578B (Tetrahedral), \u952E\u89D2 ~109.5\u00B0',
            info: '\u78B3\u539F\u5B50sp\u00B3\u6742\u5316\uFF0C\u56DB\u4E2AC-H\u952E\u7B49\u4EF7\uFF0C\u7A7A\u95F4\u5448\u6B63\u56DB\u9762\u4F53\u5206\u5E03\u3002\u975E\u6781\u6027\u5206\u5B50\u3002',
            atoms: [
                { elem: 'C', x: 0, y: 0, z: 0 },
                { elem: 'H', x: 0.629, y: 0.629, z: 0.629 },
                { elem: 'H', x: -0.629, y: -0.629, z: 0.629 },
                { elem: 'H', x: 0.629, y: -0.629, z: -0.629 },
                { elem: 'H', x: -0.629, y: 0.629, z: -0.629 }
            ],
            bonds: [[0,1], [0,2], [0,3], [0,4]]
        },
        'NH3': {
            name: '\u6C28 (NH\u2083)',
            geometry: '\u4E09\u89D2\u9525\u5F62 (Trigonal Pyramidal), \u952E\u89D2 ~107\u00B0',
            info: '\u6C2E\u539F\u5B50sp\u00B3\u6742\u5316\uFF0C\u4E00\u5BF9\u5B64\u7535\u5B50\u5BF9\u538B\u7F29\u952E\u89D2\u81F3107\u00B0\u3002\u5206\u5B50\u5177\u6709\u6781\u6027\u3002',
            atoms: [
                { elem: 'N', x: 0, y: 0.1, z: 0 },
                { elem: 'H', x: 0.64, y: 0.6, z: -0.37 },
                { elem: 'H', x: -0.64, y: 0.6, z: -0.37 },
                { elem: 'H', x: 0, y: 0.6, z: 0.74 }
            ],
            bonds: [[0,1], [0,2], [0,3]]
        },
        'CO2': {
            name: '\u4E8C\u6C27\u5316\u78B3 (CO\u2082)',
            geometry: '\u76F4\u7EBF\u578B (Linear), \u952E\u89D2 180\u00B0',
            info: '\u78B3\u539F\u5B50sp\u6742\u5316\uFF0C\u4E24\u4E2AC=O\u53CC\u952E\u5448\u76F4\u7EBF\u6392\u5217\u3002\u975E\u6781\u6027\u5206\u5B50\uFF0C\u6E29\u5BA4\u6C14\u4F53\u3002',
            atoms: [
                { elem: 'O', x: -1.16, y: 0, z: 0 },
                { elem: 'C', x: 0, y: 0, z: 0 },
                { elem: 'O', x: 1.16, y: 0, z: 0 }
            ],
            bonds: [[0,1], [1,2]]
        },
        'C6H6': {
            name: '\u82EF (C\u2086H\u2086)',
            geometry: '\u5E73\u9762\u516D\u8FB9\u5F62 (Planar Hexagon), \u952E\u89D2 120\u00B0',
            info: '\u516D\u4E2A\u78B3\u539F\u5B50sp\u00B2\u6742\u5316\uFF0C\u5F62\u6210\u5171\u8F6D\u03C0\u952E\u4F53\u7CFB\u3002\u6240\u6709\u539F\u5B50\u5728\u540C\u4E00\u5E73\u9762\uFF0C\u952E\u89D2\u5747\u4E3A120\u00B0\u3002',
            atoms: [
                { elem: 'C', x: 0.7, y: 1.212, z: 0 },
                { elem: 'C', x: 1.4, y: 0, z: 0 },
                { elem: 'C', x: 0.7, y: -1.212, z: 0 },
                { elem: 'C', x: -0.7, y: -1.212, z: 0 },
                { elem: 'C', x: -1.4, y: 0, z: 0 },
                { elem: 'C', x: -0.7, y: 1.212, z: 0 },
                { elem: 'H', x: 1.245, y: 2.157, z: 0 },
                { elem: 'H', x: 2.491, y: 0, z: 0 },
                { elem: 'H', x: 1.245, y: -2.157, z: 0 },
                { elem: 'H', x: -1.245, y: -2.157, z: 0 },
                { elem: 'H', x: -2.491, y: 0, z: 0 },
                { elem: 'H', x: -1.245, y: 2.157, z: 0 }
            ],
            bonds: [[0,1], [1,2], [2,3], [3,4], [4,5], [5,0], [0,6], [1,7], [2,8], [3,9], [4,10], [5,11]]
        }
    };

    var currentMol = 'H2O';
    var rotation = { x: 0.4, y: 0.5, z: 0 };
    var autoRotate = true;
    var animId = null;
    var dragging = false;
    var lastMouse = { x: 0, y: 0 };

    var atomColors = { H: '#ffffff', C: '#333333', O: '#ef4444', N: '#3b82f6' };
    var atomRadii = { H: 0.25, C: 0.4, O: 0.35, N: 0.38 };

    function project(x, y, z, w, h) {
        var distance = 5;
        // Rotate around Y axis
        var cosY = Math.cos(rotation.y), sinY = Math.sin(rotation.y);
        var x1 = x * cosY - z * sinY;
        var z1 = x * sinY + z * cosY;
        // Rotate around X axis
        var cosX = Math.cos(rotation.x), sinX = Math.sin(rotation.x);
        var y2 = y * cosX - z1 * sinX;
        var z2 = y * sinX + z1 * cosX;
        // Perspective projection
        var scale = distance / (distance + z2);
        var px = w / 2 + x1 * scale * w / 3;
        var py = h / 2 - y2 * scale * h / 3;
        return { x: px, y: py, z: z2, scale: scale };
    }

    function drawMolecule() {
        var canvas = document.getElementById('molecule-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) { console.error('无法获取Canvas 2D上下文'); return; }
        var w = canvas.width, h = canvas.height;
        try {
            ctx.clearRect(0, 0, w, h);

            var mol = molecules[currentMol];
            if (!mol) return;

        // Sort atoms and bonds by depth for z-ordering
        var projected = [];
        for (var i = 0; i < mol.atoms.length; i++) {
            var a = mol.atoms[i];
            var p = project(a.x, a.y, a.z, w, h);
            p.idx = i;
            p.elem = a.elem;
            projected.push(p);
        }

        // Draw bonds
        for (var j = 0; j < mol.bonds.length; j++) {
            var b = mol.bonds[j];
            var p1 = projected[b[0]];
            var p2 = projected[b[1]];
            var avgZ = (p1.z + p2.z) / 2;

            ctx.strokeStyle = '#999';
            ctx.lineWidth = Math.max(1, (p1.scale + p2.scale) / 2 * 5);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }

        // Sort atoms by z (far to near) and draw
        projected.sort(function(a, b) { return a.z - b.z; });

        for (var k = 0; k < projected.length; k++) {
            var p = projected[k];
            var color = atomColors[p.elem] || '#888';
            var radius = (atomRadii[p.elem] || 0.3) * p.scale * w / 6;
            if (radius < 3) radius = 3;

            // Sphere with gradient
            var gradient = ctx.createRadialGradient(p.x - radius * 0.3, p.y - radius * 0.3, radius * 0.1, p.x, p.y, radius);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.4, color);
            gradient.addColorStop(1, '#000000');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fill();

            // Border
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Label
            if (radius > 8) {
                ctx.fillStyle = p.elem === 'H' || p.elem === 'C' ? '#fff' : '#fff';
                ctx.font = 'bold ' + Math.max(9, Math.floor(radius * 0.7)) + 'px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.elem, p.x, p.y);
            }
        }
        } catch (err) {
            console.error('绘制3D分子模型失败:', err);
        }
    }

    function startAnimation() {
        if (animId) cancelAnimationFrame(animId);
        function animate() {
            if (autoRotate && !dragging) {
                rotation.y += 0.008;
                rotation.x += 0.003;
            }
            drawMolecule();
            animId = requestAnimationFrame(animate);
        }
        animate();
    }

    function stopAnimation() {
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
    }

    function render() {
        var container = document.getElementById('chemistry-3d-molecules-app');
        if (!container) return;

        container.innerHTML = '<div class="tool-app-container" style="padding:16px;">' +
            '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">' +
            '<select id="mol-select" style="padding:7px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;">' +
            '<option value="H2O">H\u2082O \u2014 \u6C34</option>' +
            '<option value="CH4">CH\u2084 \u2014 \u7532\u70F7</option>' +
            '<option value="NH3">NH\u2083 \u2014 \u6C28</option>' +
            '<option value="CO2">CO\u2082 \u2014 \u4E8C\u6C27\u5316\u78B3</option>' +
            '<option value="C6H6">C\u2086H\u2086 \u2014 \u82EF</option>' +
            '</select>' +
            '<button id="mol-autorot" style="padding:7px 14px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">\u6682\u505C\u65CB\u8F6C</button>' +
            '<button id="mol-reset" style="padding:7px 14px;background:#6b7280;color:#fff;border:none;border-radius:6px;cursor:pointer;">\u590D\u4F4D</button>' +
            '</div>' +
            '<canvas id="molecule-canvas" width="600" height="500" style="border:1px solid #e5e7eb;border-radius:8px;background:linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);width:100%;max-width:600px;cursor:grab;"></canvas>' +
            '<div id="mol-info" style="margin-top:12px;padding:12px 16px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;"></div>' +
            '</div>';

        function updateInfo() {
            var mol = molecules[currentMol];
            if (!mol) { console.error('未找到分子数据:', currentMol); return; }
            var el = document.getElementById('mol-info');
            if (!el) return;
            el.innerHTML = '<div style="font-size:15px;font-weight:bold;color:#1e40af;margin-bottom:4px;">' + mol.name + '</div>' +
                '<div style="font-size:13px;color:#333;margin-bottom:4px;"><strong>\u5206\u5B50\u6784\u578B\uFF1A</strong>' + mol.geometry + '</div>' +
                '<div style="font-size:12px;color:#666;">' + mol.info + '</div>' +
                '<div style="font-size:11px;color:#999;margin-top:6px;">\u539F\u5B50\u989C\u8272\uFF1A<span style="color:#ef4444;">\u25CF</span> \u6C27(O) \u00A0 ' +
                '<span style="color:#333;">\u25CF</span> \u78B3(C) \u00A0 ' +
                '<span style="color:#3b82f6;">\u25CF</span> \u6C2E(N) \u00A0 ' +
                '<span style="color:#ccc;">\u25CF</span> \u6C22(H)</div>';
        }

        document.getElementById('mol-select').onchange = function() {
            currentMol = this.value;
            updateInfo();
            drawMolecule();
        };

        var autoRunning = true;
        document.getElementById('mol-autorot').onclick = function() {
            autoRunning = !autoRunning;
            autoRotate = autoRunning;
            this.textContent = autoRunning ? '\u6682\u505C\u65CB\u8F6C' : '\u81EA\u52A8\u65CB\u8F6C';
            this.style.background = autoRunning ? '#3b82f6' : '#10b981';
        };

        document.getElementById('mol-reset').onclick = function() {
            rotation.x = 0.4;
            rotation.y = 0.5;
            rotation.z = 0;
            drawMolecule();
        };

        // Mouse drag rotation
        var canvas = document.getElementById('molecule-canvas');
        canvas.onmousedown = function(e) {
            dragging = true;
            lastMouse.x = e.clientX;
            lastMouse.y = e.clientY;
            canvas.style.cursor = 'grabbing';
        };
        canvas.onmousemove = function(e) {
            if (!dragging) return;
            var dx = e.clientX - lastMouse.x;
            var dy = e.clientY - lastMouse.y;
            rotation.y += dx * 0.01;
            rotation.x += dy * 0.01;
            lastMouse.x = e.clientX;
            lastMouse.y = e.clientY;
            drawMolecule();
        };
        canvas.onmouseup = function() {
            dragging = false;
            canvas.style.cursor = 'grab';
        };
        canvas.onmouseleave = function() {
            dragging = false;
            canvas.style.cursor = 'grab';
        };

        // Touch drag
        canvas.ontouchstart = function(e) {
            dragging = true;
            lastMouse.x = e.touches[0].clientX;
            lastMouse.y = e.touches[0].clientY;
        };
        canvas.ontouchmove = function(e) {
            if (!dragging) return;
            e.preventDefault();
            var dx = e.touches[0].clientX - lastMouse.x;
            var dy = e.touches[0].clientY - lastMouse.y;
            rotation.y += dx * 0.01;
            rotation.x += dy * 0.01;
            lastMouse.x = e.touches[0].clientX;
            lastMouse.y = e.touches[0].clientY;
            drawMolecule();
        };
        canvas.ontouchend = function() { dragging = false; };

        updateInfo();
        startAnimation();
    }

    return { render: render };
})();

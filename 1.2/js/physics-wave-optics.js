// ============================================================
// js/physics-wave-optics.js — 波的干涉与光的折射模拟
// ============================================================
window.physicsWaveOptics = (function() {
    'use strict';

    var currentTab = 'wave';
    var waveParams = { wavelength: 40, distance: 120, animId: null, time: 0 };
    var opticsParams = { angle: 45, n1: 1.0, n2: 1.33, n3: 1.5 };

    // ===================== Wave Interference Tab =====================
    function drawWaveCanvas() {
        var canvas = document.getElementById('wave-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) { console.error('无法获取Canvas 2D上下文'); return; }
        var w = canvas.width, h = canvas.height;
        try {
        ctx.clearRect(0, 0, w, h);

        var lambda = waveParams.wavelength;
        var d = waveParams.distance;
        var cx1 = w / 2 - d / 2;
        var cy1 = h / 2;
        var cx2 = w / 2 + d / 2;
        var cy2 = h / 2;

        // Performance: 2x downsample when canvas width > 400px (compute 1 pixel per 2x2 block)
        var step = (w > 400) ? 2 : 1;
        var imageData = ctx.createImageData(w, h);
        var data = imageData.data;
        for (var y = 0; y < h; y += step) {
            for (var x = 0; x < w; x += step) {
                var dx1 = x - cx1, dy1 = y - cy1;
                var dx2 = x - cx2, dy2 = y - cy2;
                var r1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
                var r2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                var phase1 = (2 * Math.PI * r1 / lambda) - waveParams.time;
                var phase2 = (2 * Math.PI * r2 / lambda) - waveParams.time;
                var amplitude = Math.cos(phase1) + Math.cos(phase2);
                var intensity = (amplitude + 2) / 4;
                intensity = Math.max(0, Math.min(1, intensity));
                var r = Math.floor(intensity * 255);
                var g = Math.floor(intensity * 180);
                var b = Math.floor(intensity * 255);
                if (step === 1) {
                    var idx = (y * w + x) * 4;
                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                    data[idx + 3] = 255;
                } else {
                    // Replicate the sampled value across the step x step block (clamped to bounds)
                    var yMax = y + step; if (yMax > h) yMax = h;
                    var xMax = x + step; if (xMax > w) xMax = w;
                    for (var yy = y; yy < yMax; yy++) {
                        for (var xx = x; xx < xMax; xx++) {
                            var idx2 = (yy * w + xx) * 4;
                            data[idx2] = r;
                            data[idx2 + 1] = g;
                            data[idx2 + 2] = b;
                            data[idx2 + 3] = 255;
                        }
                    }
                }
            }
        }
        ctx.putImageData(imageData, 0, 0);

        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(cx1, cy1, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx2, cy2, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('S1', cx1 - 14, cy1 - 10);
        ctx.fillText('S2', cx2 + 4, cy2 - 10);

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(8, 8, 210, 55);
        ctx.fillStyle = '#fff';
        ctx.font = '11px sans-serif';
        ctx.fillText('\u03BB = ' + lambda + 'px', 14, 24);
        ctx.fillText('d = ' + d + 'px', 14, 40);
        ctx.fillText('\u0394x = \u03BBL/d (L\u4E3A\u89C2\u5BDF\u8DDD\u79BB)', 14, 56);
        } catch (err) {
            console.error('绘制波的干涉失败:', err);
        }
    }

    function startWaveAnimation() {
        if (waveParams.animId) cancelAnimationFrame(waveParams.animId);
        function animate() {
            waveParams.time += 0.05;
            drawWaveCanvas();
            waveParams.animId = requestAnimationFrame(animate);
        }
        animate();
    }

    function stopWaveAnimation() {
        if (waveParams.animId) {
            cancelAnimationFrame(waveParams.animId);
            waveParams.animId = null;
        }
    }

    function renderWaveTab(container) {
        container.innerHTML = '<div class="tool-app-container" style="padding:16px;">' +
            '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;align-items:end;">' +
            '<div><label style="font-size:13px;color:#666;">\u6CE2\u957F \u03BB (px)</label><br><input id="wave-wl" type="range" min="10" max="80" value="' + waveParams.wavelength + '" style="width:150px;"></div>' +
            '<div><label style="font-size:13px;color:#666;">\u6E90\u95F4\u8DDD d (px)</label><br><input id="wave-dist" type="range" min="40" max="250" value="' + waveParams.distance + '" style="width:150px;"></div>' +
            '<button id="wave-toggle" style="padding:7px 16px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">\u6682\u505C\u52A8\u753B</button>' +
            '</div>' +
            '<canvas id="wave-canvas" width="600" height="450" style="border:1px solid #e5e7eb;border-radius:8px;background:#0a0a2e;width:100%;max-width:600px;"></canvas>' +
            '<div style="margin-top:8px;font-size:12px;color:#666;line-height:1.6;">' +
            '<strong>\u6768\u6C0F\u53CC\u7F1D\u5E72\u6D89\u539F\u7406\uFF1A</strong>\u4E24\u4E2A\u76F8\u5E72\u70B9\u6E90\u53D1\u51FA\u7684\u6CE2\u5728\u7A7A\u95F4\u4E2D\u53E0\u52A0\u3002\u4EAE\u7EB9\u6761\u4EF6\uFF1Ad\u00B7sin\u03B8 = k\u03BB (k=0,\u00B11,\u00B12,...)\uFF0C\u6697\u7EB9\u6761\u4EF6\uFF1Ad\u00B7sin\u03B8 = (2k+1)\u03BB/2\u3002<br>' +
            '\u6761\u7EB9\u95F4\u8DDD\uFF1A\u0394x = \u03BBL / d\uFF0C\u5176\u4E2DL\u4E3A\u89C2\u5BDF\u5C4F\u5230\u53CC\u7F1D\u7684\u8DDD\u79BB\u3002</div>' +
            '</div>';

        var running = true;
        document.getElementById('wave-wl').oninput = function() {
            waveParams.wavelength = parseInt(this.value);
            drawWaveCanvas();
        };
        document.getElementById('wave-dist').oninput = function() {
            waveParams.distance = parseInt(this.value);
            drawWaveCanvas();
        };
        document.getElementById('wave-toggle').onclick = function() {
            if (running) {
                stopWaveAnimation();
                this.textContent = '\u64AD\u653E\u52A8\u753B';
                this.style.background = '#10b981';
            } else {
                startWaveAnimation();
                this.textContent = '\u6682\u505C\u52A8\u753B';
                this.style.background = '#3b82f6';
            }
            running = !running;
        };
        startWaveAnimation();
    }

    // ===================== Optics Tab =====================
    function drawOpticsCanvas() {
        var canvas = document.getElementById('optics-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) { console.error('无法获取Canvas 2D上下文'); return; }
        var w = canvas.width, h = canvas.height;
        try {
        ctx.clearRect(0, 0, w, h);

        var angleDeg = opticsParams.angle;
        var n1 = opticsParams.n1;
        var n2 = opticsParams.n2;
        var n3 = opticsParams.n3;

        var theta1 = angleDeg * Math.PI / 180;
        if (theta1 >= Math.PI / 2) theta1 = Math.PI / 2 - 0.01;

        var sinTheta2 = n1 * Math.sin(theta1) / n2;
        var theta2 = (Math.abs(sinTheta2) <= 1) ? Math.asin(sinTheta2) : Math.PI / 2;
        var sinTheta3 = n2 * Math.sin(theta2) / n3;
        var theta3 = (Math.abs(sinTheta3) <= 1) ? Math.asin(sinTheta3) : Math.PI / 2;

        var margin = 30;
        var boundary1Y = h * 0.28;
        var boundary2Y = h * 0.62;
        var srcX = margin + 20;
        var srcY = h * 0.5;
        var hit1X = w * 0.4;
        var hit1Y = boundary1Y;

        // Compute the second hit point
        var rayLen2 = 200; // large enough to reach boundary2
        var dx2 = rayLen2 * Math.sin(theta2);
        var dy2 = rayLen2 * Math.cos(theta2);
        var endX2 = hit1X + dx2;
        var endY2 = hit1Y + dy2;
        var frac = (boundary2Y - hit1Y) / dy2;
        var hit2X = hit1X + dx2 * frac;
        var hit2Y = boundary2Y;

        // Media backgrounds
        ctx.fillStyle = 'rgba(173, 216, 230, 0.3)';
        ctx.fillRect(0, 0, w, boundary1Y);
        ctx.fillStyle = 'rgba(30, 144, 255, 0.25)';
        ctx.fillRect(0, boundary1Y, w, boundary2Y - boundary1Y);
        ctx.fillStyle = 'rgba(100, 149, 237, 0.3)';
        ctx.fillRect(0, boundary2Y, w, h - boundary2Y);

        // Labels
        ctx.fillStyle = '#333'; ctx.font = 'bold 13px sans-serif';
        ctx.fillText('\u7A7A\u6C14 n=' + n1.toFixed(2), 10, boundary1Y - 8);
        ctx.fillText('\u6C34 n=' + n2.toFixed(2), 10, boundary2Y - 8);
        ctx.fillText('\u73BB\u7483 n=' + n3.toFixed(2), 10, h - 10);

        // Boundaries
        ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, boundary1Y); ctx.lineTo(w, boundary1Y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, boundary2Y); ctx.lineTo(w, boundary2Y); ctx.stroke();

        // Normal lines
        ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(hit1X, boundary1Y - 60); ctx.lineTo(hit1X, boundary2Y + 40); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(hit2X, boundary1Y + 10); ctx.lineTo(hit2X, h); ctx.stroke();
        ctx.setLineDash([]);

        // Incident ray
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(srcX, srcY); ctx.lineTo(hit1X, hit1Y); ctx.stroke();

        // Refracted ray in water
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(hit1X, hit1Y); ctx.lineTo(hit2X, hit2Y); ctx.stroke();

        // Refracted ray in glass
        var rayLen3 = 80;
        var dx3 = rayLen3 * Math.sin(theta3);
        var dy3 = rayLen3 * Math.cos(theta3);
        ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(hit2X, hit2Y); ctx.lineTo(hit2X + dx3, hit2Y + dy3); ctx.stroke();

        // Angle arcs
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(hit1X, hit1Y, 25, -Math.PI / 2, -Math.PI / 2 + theta1, false);
        ctx.stroke();
        ctx.fillStyle = '#ef4444'; ctx.font = '11px sans-serif';
        ctx.fillText('\u03B8\u2081=' + angleDeg.toFixed(0) + '\u00B0', hit1X + 18, hit1Y - 22);

        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(hit1X, hit1Y, 30, Math.PI / 2, Math.PI / 2 - theta2, true);
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('\u03B8\u2082=' + (theta2 * 180 / Math.PI).toFixed(1) + '\u00B0', hit1X + 24, hit1Y + 34);

        if (theta3 < Math.PI / 2) {
            ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(hit2X, hit2Y, 20, Math.PI / 2, Math.PI / 2 - theta3, true);
            ctx.stroke();
            ctx.fillStyle = '#8b5cf6';
            ctx.fillText('\u03B8\u2083=' + (theta3 * 180 / Math.PI).toFixed(1) + '\u00B0', hit2X + 16, hit2Y + 26);
        }

        // Source marker
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(srcX, srcY, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillText('\u5149\u6E90', srcX - 16, srcY + 16);
        } catch (err) {
            console.error('绘制光的折射失败:', err);
        }
    }

    function renderOpticsTab(container) {
        container.innerHTML = '<div class="tool-app-container" style="padding:16px;">' +
            '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;align-items:end;">' +
            '<div><label style="font-size:13px;color:#666;">\u5165\u5C04\u89D2 (\u00B0)</label><br><input id="optics-angle" type="range" min="1" max="85" value="' + opticsParams.angle + '" style="width:180px;"><span id="optics-angle-val" style="margin-left:8px;font-weight:bold;">' + opticsParams.angle + '\u00B0</span></div>' +
            '<div><label style="font-size:13px;color:#666;">\u4ECB\u8D281\u6298\u5C04\u7387</label><br><input id="optics-n1" type="number" value="' + opticsParams.n1 + '" step="0.1" style="width:70px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div>' +
            '<div><label style="font-size:13px;color:#666;">\u4ECB\u8D282\u6298\u5C04\u7387</label><br><input id="optics-n2" type="number" value="' + opticsParams.n2 + '" step="0.01" style="width:70px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div>' +
            '<div><label style="font-size:13px;color:#666;">\u4ECB\u8D283\u6298\u5C04\u7387</label><br><input id="optics-n3" type="number" value="' + opticsParams.n3 + '" step="0.01" style="width:70px;padding:5px;border:1px solid #d1d5db;border-radius:6px;"></div>' +
            '<button id="optics-update" style="padding:7px 14px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">\u66F4\u65B0</button>' +
            '</div>' +
            '<canvas id="optics-canvas" width="650" height="420" style="border:1px solid #e5e7eb;border-radius:8px;background:#fff;width:100%;max-width:650px;margin-bottom:12px;"></canvas>' +
            '<div id="optics-info" style="padding:10px 14px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;font-size:13px;color:#1e40af;"></div>' +
            '</div>';

        function updateOpticsInfo() {
            var angleDeg = opticsParams.angle;
            var theta1 = angleDeg * Math.PI / 180;
            if (theta1 >= Math.PI / 2) theta1 = Math.PI / 2 - 0.01;
            var sinTheta2 = opticsParams.n1 * Math.sin(theta1) / opticsParams.n2;
            var el = document.getElementById('optics-info');
            var html = '<strong>\u65AF\u6D85\u5C14\u5B9A\u5F8B (Snell\'s Law):</strong> n\u2081\u00B7sin\u03B8\u2081 = n\u2082\u00B7sin\u03B8\u2082 = n\u2083\u00B7sin\u03B8\u2083<br>';
            html += 'n\u2081\u00B7sin\u03B8\u2081 = ' + opticsParams.n1.toFixed(2) + ' \u00D7 sin(' + angleDeg + '\u00B0) = ' + (opticsParams.n1 * Math.sin(theta1)).toFixed(4) + '<br>';
            html += 'n\u2082\u00B7sin\u03B8\u2082 = ' + opticsParams.n2.toFixed(2) + ' \u00D7 sin(\u03B8\u2082) <br>';
            if (Math.abs(sinTheta2) > 1) {
                html += '<span style="color:#ef4444;font-weight:bold;">\u53D1\u751F\u5168\u53CD\u5C04\uFF01\u4E34\u754C\u89D2 = ' + (Math.asin(opticsParams.n2 / opticsParams.n1) * 180 / Math.PI).toFixed(1) + '\u00B0</span>';
            } else {
                html += '\u6298\u5C04\u89D2 \u03B8\u2082 = arcsin(' + sinTheta2.toFixed(4) + ') = ' + (Math.asin(sinTheta2) * 180 / Math.PI).toFixed(2) + '\u00B0';
                var sinTheta3 = opticsParams.n2 * Math.sin(Math.asin(Math.min(1, Math.abs(sinTheta2)))) / opticsParams.n3;
                if (Math.abs(sinTheta3) <= 1) {
                    html += '<br>\u6298\u5C04\u89D2 \u03B8\u2083 = arcsin(' + sinTheta3.toFixed(4) + ') = ' + (Math.asin(sinTheta3) * 180 / Math.PI).toFixed(2) + '\u00B0';
                }
            }
            el.innerHTML = html;
        }

        document.getElementById('optics-angle').oninput = function() {
            opticsParams.angle = parseInt(this.value);
            document.getElementById('optics-angle-val').textContent = opticsParams.angle + '\u00B0';
            drawOpticsCanvas();
            updateOpticsInfo();
        };
        document.getElementById('optics-update').onclick = function() {
            opticsParams.n1 = parseFloat(document.getElementById('optics-n1').value) || 1.0;
            opticsParams.n2 = parseFloat(document.getElementById('optics-n2').value) || 1.33;
            opticsParams.n3 = parseFloat(document.getElementById('optics-n3').value) || 1.5;
            drawOpticsCanvas();
            updateOpticsInfo();
        };
        drawOpticsCanvas();
        updateOpticsInfo();
    }

    // ===================== Main Render =====================
    function render() {
        var container = document.getElementById('physics-wave-optics-app');
        if (!container) return;
        container.innerHTML = '<div class="tool-app-container" style="padding:8px;">' +
            '<div style="display:flex;gap:8px;margin-bottom:12px;">' +
            '<button class="pw-tab" data-tab="wave" style="padding:8px 18px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:#3b82f6;color:#fff;font-size:14px;">\u6CE2\u7684\u5E72\u6D89</button>' +
            '<button class="pw-tab" data-tab="optics" style="padding:8px 18px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:#fff;color:#333;font-size:14px;">\u5149\u7684\u6298\u5C04</button>' +
            '</div>' +
            '<div id="pw-tab-content"></div>' +
            '</div>';

        var contentDiv = document.getElementById('pw-tab-content');

        function switchTab(tab) {
            currentTab = tab;
            stopWaveAnimation();
            var allBtns = container.querySelectorAll('.pw-tab');
            for (var i = 0; i < allBtns.length; i++) {
                allBtns[i].style.background = allBtns[i].getAttribute('data-tab') === tab ? '#3b82f6' : '#fff';
                allBtns[i].style.color = allBtns[i].getAttribute('data-tab') === tab ? '#fff' : '#333';
            }
            if (tab === 'wave') {
                renderWaveTab(contentDiv);
            } else {
                renderOpticsTab(contentDiv);
            }
        }

        var tabs = container.querySelectorAll('.pw-tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].onclick = function() {
                switchTab(this.getAttribute('data-tab'));
            };
        }
        renderWaveTab(contentDiv);
    }

    return { render: render };
})();

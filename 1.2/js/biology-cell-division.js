// ============================================================
// js/biology-cell-division.js — 细胞分裂动画
// ============================================================
window.biologyCellDivision = (function() {
    'use strict';

    var currentTab = 'mitosis';
    var currentStep = 0;
    var animId = null;
    var animProgress = 0;
    var playing = false;

    var mitosisSteps = [
        {
            name: '\u95F4\u671F (Interphase)',
            desc: '\u7EC6\u80DE\u751F\u957F\uFF0CDNA\u590D\u5236\uFF0C\u67D3\u8272\u4F53\u5448\u7EC6\u957F\u4E1D\u72B6\u67D3\u8272\u8D28\uFF0C\u6838\u819C\u5B8C\u6574\uFF0C\u6838\u4EC1\u6E05\u6670\u3002\u6B64\u65F6\u671F\u5360\u7EC6\u80DE\u5468\u671F\u7EA690%\u65F6\u95F4\u3002',
            draw: function(ctx, w, h, t) {
                drawCellBase(ctx, w, h, true, true);
                drawNucleolus(ctx, w, h, true);
                drawChromatin(ctx, w, h, t);
                ctx.fillStyle = '#666'; ctx.font = '12px sans-serif';
                ctx.fillText('DNA\u590D\u5236\u4E2D...', w/2 - 30, h - 15);
            }
        },
        {
            name: '\u524D\u671F (Prophase)',
            desc: '\u67D3\u8272\u8D28\u87BA\u65CB\u5316\u53D8\u77ED\u53D8\u7C97\uFF0C\u6210\u4E3A\u53EF\u89C1\u67D3\u8272\u4F53\uFF08\u6BCF\u6761\u542B\u4E24\u4E2A\u59D0\u59B9\u67D3\u8272\u5355\u4F53\uFF09\u3002\u6838\u819C\u5D29\u89E3\uFF0C\u6838\u4EC1\u6D88\u5931\uFF0C\u7EBF\u7C92\u4F53\u53D1\u51FA\u661F\u5C04\u72B6\u7EBF\u4F53\u3002',
            draw: function(ctx, w, h, t) {
                drawCellBase(ctx, w, h, false, false);
                drawCondensingChromosomes(ctx, w, h, t, 4);
                drawNucleolus(ctx, w, h, t < 0.5);
                drawNucleusMembrane(ctx, w, h, t < 0.7);
                drawSpindlePoles(ctx, w, h, t);
                if (t > 0.3) drawSpindleFibers(ctx, w, h, t * 0.5);
                ctx.fillStyle = '#666'; ctx.font = '12px sans-serif';
                ctx.fillText('\u6838\u819C\u5D29\u89E3\uFF0C\u7EBF\u7C92\u4F53\u53D1\u51FA\u661F\u5C04\u7EBF\u4F53', w/2 - 70, h - 15);
            }
        },
        {
            name: '\u4E2D\u671F (Metaphase)',
            desc: '\u67D3\u8272\u4F53\u7684\u7740\u4E1D\u70B9\u6392\u5217\u5728\u8D64\u9053\u677F\u4E0A\uFF0C\u7EBF\u7C92\u4F53\u7F29\u56DE\u5230\u4E24\u6781\uFF0C\u661F\u5C04\u72B6\u7EBF\u4F53\u8FDE\u63A5\u7740\u4E1D\u70B9\u4E0E\u7EBF\u7C92\u4F53\u3002\u6B64\u65F6\u67D3\u8272\u4F53\u5F62\u6001\u6700\u6E05\u6670\uFF0C\u662F\u89C2\u5BDF\u67D3\u8272\u4F53\u7684\u6700\u4F73\u65F6\u671F\u3002',
            draw: function(ctx, w, h, t) {
                drawCellBase(ctx, w, h, false, false);
                drawSpindleFull(ctx, w, h, 1);
                drawMetaphaseChromosomes(ctx, w, h, t);
                ctx.fillStyle = '#666'; ctx.font = '12px sans-serif';
                ctx.fillText('\u67D3\u8272\u4F53\u6392\u5217\u5728\u8D64\u9053\u677F(\u7B49\u677F)\u4E0A', w/2 - 70, h - 15);
            }
        },
        {
            name: '\u540E\u671F (Anaphase)',
            desc: '\u7740\u4E1D\u70B9\u5206\u88C2\uFF0C\u59D0\u59B9\u67D3\u8272\u5355\u4F53\u5206\u79BB\u5E76\u88AB\u7EBF\u7C92\u4F53\u4E1D\u62C9\u5411\u7EC6\u80DE\u4E24\u6781\u3002\u6BCF\u6781\u83B7\u5F97\u4E00\u5957\u5B8C\u6574\u7684\u67D3\u8272\u4F53\u3002',
            draw: function(ctx, w, h, t) {
                drawCellBase(ctx, w, h, false, false);
                drawSpindleFull(ctx, w, h, 1);
                drawAnaphaseChromosomes(ctx, w, h, t);
                ctx.fillStyle = '#666'; ctx.font = '12px sans-serif';
                ctx.fillText('\u59D0\u59B9\u67D3\u8272\u5355\u4F53\u5206\u79BB\u5411\u4E24\u6781', w/2 - 60, h - 15);
            }
        },
        {
            name: '\u672B\u671F (Telophase)',
            desc: '\u67D3\u8272\u4F53\u89E3\u87BA\u65CB\u5316\u56DE\u67D3\u8272\u8D28\uFF0C\u6838\u819C\u91CD\u5EFA\uFF0C\u6838\u4EC1\u91CD\u73B0\u3002\u7EC6\u80DE\u8D28\u5206\u88C2\uFF0C\u5F62\u6210\u4E24\u4E2A\u5B50\u7EC6\u80DE\u3002\u6709\u4E1D\u5206\u88C2\u5B8C\u6210\u3002',
            draw: function(ctx, w, h, t) {
                drawTelophaseBase(ctx, w, h, t);
            }
        }
    ];

    var meiosisSteps = [
        // Meiosis I
        {
            name: '\u51CF\u6570I\u524D\u671F (Prophase I)',
            desc: '\u540C\u6E90\u67D3\u8272\u4F53\u8054\u4F1A\u914D\u5BF9\uFF0C\u5F62\u6210\u56DB\u5206\u4F53\uFF0C\u53D1\u751F\u4EA4\u53C9\u4E92\u6362\u3002\u8FD9\u662F\u51CF\u6570\u5206\u88C2\u7279\u6709\u7684\u8FC7\u7A0B\uFF0C\u589E\u52A0\u4E86\u9057\u4F20\u53D8\u5F02\u6027\u3002',
            draw: function(ctx, w, h, t) {
                drawCellBase(ctx, w, h, true, t < 0.5);
                drawNucleusMembrane(ctx, w, h, t < 0.6);
                drawTetrad(ctx, w, h, t);
                document.getElementById('cell-desc-detail').textContent = '\u540C\u6E90\u67D3\u8272\u4F53\u8054\u4F1A\u2192\u56DB\u5206\u4F53\u2192\u4EA4\u53C9\u4E92\u6362';
            }
        },
        {
            name: '\u51CF\u6570I\u4E2D\u671F (Metaphase I)',
            desc: '\u540C\u6E90\u67D3\u8272\u4F53\u5BF9\u6392\u5217\u5728\u8D64\u9053\u677F\u4E0A\uFF0C\u6BCF\u5BF9\u540C\u6E90\u67D3\u8272\u4F53\u7684\u7740\u4E1D\u70B9\u5206\u522B\u4E0E\u4E24\u6781\u7684\u7EBF\u7C92\u4F53\u4E1D\u8FDE\u63A5\u3002',
            draw: function(ctx, w, h, t) {
                drawCellBase(ctx, w, h, false, false);
                drawSpindleFull(ctx, w, h, 1);
                drawMeiosisMetaphaseI(ctx, w, h, t);
                document.getElementById('cell-desc-detail').textContent = '\u540C\u6E90\u67D3\u8272\u4F53\u6210\u5BF9\u6392\u5217\u5728\u8D64\u9053\u677F\u4E0A';
            }
        },
        {
            name: '\u51CF\u6570I\u540E\u671F (Anaphase I)',
            desc: '\u540C\u6E90\u67D3\u8272\u4F53\u5206\u79BB\uFF0C\u5206\u522B\u5411\u4E24\u6781\u79FB\u52A8\u3002\u6BCF\u4E2A\u67D3\u8272\u4F53\u4ECD\u542B\u4E24\u4E2A\u59D0\u59B9\u67D3\u8272\u5355\u4F53\uFF08\u7740\u4E1D\u70B9\u672A\u5206\u88C2\uFF09\u3002',
            draw: function(ctx, w, h, t) {
                drawCellBase(ctx, w, h, false, false);
                drawSpindleFull(ctx, w, h, 1);
                drawMeiosisAnaphaseI(ctx, w, h, t);
                document.getElementById('cell-desc-detail').textContent = '\u540C\u6E90\u67D3\u8272\u4F53\u5206\u79BB\u2192\u4E24\u6781';
            }
        },
        {
            name: '\u51CF\u6570I\u672B\u671F (Telophase I)',
            desc: '\u7EC6\u80DE\u8D28\u5206\u88C2\uFF0C\u5F62\u6210\u4E24\u4E2A\u5B50\u7EC6\u80DE\u3002\u6BCF\u4E2A\u5B50\u7EC6\u80DE\u542B\u4E00\u5957\u590D\u5236\u540E\u7684\u540C\u6E90\u67D3\u8272\u4F53\uFF08\u67D3\u8272\u4F53\u6570\u51CF\u534A\uFF09\u3002',
            draw: function(ctx, w, h, t) {
                drawTwoCellsBase(ctx, w, h, t, true);
                document.getElementById('cell-desc-detail').textContent = '\u7EC6\u80DE\u8D28\u5206\u88C2\u2192\u4E24\u4E2A\u5B50\u7EC6\u80DE(\u67D3\u8272\u4F53\u6570\u51CF\u534A)';
            }
        },
        // Meiosis II
        {
            name: '\u51CF\u6570II\u524D\u671F (Prophase II)',
            desc: '\u67D3\u8272\u4F53\u518D\u6B21\u87BA\u65CB\u5316\uFF0C\u6838\u819C\u5D29\u89E3\uFF0C\u7EBF\u7C92\u4F53\u53D1\u51FA\u661F\u5C04\u4F53\u3002\u6B64\u65F6\u6BCF\u4E2A\u7EC6\u80DE\u542B\u4E24\u4E2A\u67D3\u8272\u4F53\uFF08\u590D\u5236\u540E\u7684\u540C\u6E90\u67D3\u8272\u4F53\uFF09\u3002',
            draw: function(ctx, w, h, t) {
                drawTwoCellsBase(ctx, w, h, t, false);
                document.getElementById('cell-desc-detail').textContent = '\u4E24\u4E2A\u5B50\u7EC6\u80DE\u540C\u65F6\u8FDB\u884C\u7B2C\u4E8C\u6B21\u5206\u88C2';
            }
        },
        {
            name: '\u51CF\u6570II\u4E2D\u671F (Metaphase II)',
            desc: '\u67D3\u8272\u4F53\u7684\u7740\u4E1D\u70B9\u6392\u5217\u5728\u8D64\u9053\u677F\u4E0A\uFF0C\u7EBF\u7C92\u4F53\u4E1D\u8FDE\u63A5\u7740\u4E1D\u70B9\u3002\u6B64\u65F6\u6BCF\u4E2A\u7EC6\u80DE\u4E2D\u67D3\u8272\u4F53\u6570\u4E3A2\u3002',
            draw: function(ctx, w, h, t) {
                drawTwoCellsSpindle(ctx, w, h, t, 'meta');
                document.getElementById('cell-desc-detail').textContent = '\u7740\u4E1D\u70B9\u6392\u5217\u5728\u8D64\u9053\u677F\u4E0A';
            }
        },
        {
            name: '\u51CF\u6570II\u540E\u671F (Anaphase II)',
            desc: '\u7740\u4E1D\u70B9\u5206\u88C2\uFF0C\u59D0\u59B9\u67D3\u8272\u5355\u4F53\u5206\u79BB\u5411\u4E24\u6781\u3002\u6BCF\u4E2A\u7EC6\u80DE\u4EA7\u751F2\u4E2A\u5355\u4F53\u3002',
            draw: function(ctx, w, h, t) {
                drawTwoCellsSpindle(ctx, w, h, t, 'ana');
                document.getElementById('cell-desc-detail').textContent = '\u7740\u4E1D\u70B9\u5206\u88C2\u2192\u59D0\u59B9\u5355\u4F53\u5206\u79BB';
            }
        },
        {
            name: '\u51CF\u6570II\u672B\u671F (Telophase II)',
            desc: '\u6838\u819C\u91CD\u5EFA\uFF0C\u7EC6\u80DE\u8D28\u5206\u88C2\uFF0C\u6700\u7EC8\u5F62\u6210\u56DB\u4E2A\u542B\u5355\u500D\u67D3\u8272\u4F53\u7684\u5B50\u7EC6\u80DE\uFF08\u914D\u5B50\uFF09\u3002\u6BCF\u4E2A\u5B50\u7EC6\u80DE\u542B2\u4E2A\u67D3\u8272\u4F53\u3002',
            draw: function(ctx, w, h, t) {
                drawFourCellsBase(ctx, w, h, t);
                document.getElementById('cell-desc-detail').textContent = '\u56DB\u4E2A\u5355\u500D\u4F53\u5B50\u7EC6\u80DE(\u914D\u5B50)\u5F62\u6210';
            }
        }
    ];

    // ===================== Drawing Helpers =====================
    function drawCellBase(ctx, w, h, hasNucleus, hasNucleolus) {
        // Cell membrane
        ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w * 0.35, h * 0.38, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(34, 197, 94, 0.05)'; ctx.fill();

        if (hasNucleus) drawNucleus(ctx, w, h);
        if (hasNucleolus && hasNucleus) drawNucleolus(ctx, w, h, true);
    }

    function drawNucleus(ctx, w, h) {
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w * 0.15, h * 0.16, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(59, 130, 246, 0.05)'; ctx.fill();
    }

    function drawNucleolus(ctx, w, h, visible) {
        if (!visible) return;
        ctx.fillStyle = '#1e40af';
        ctx.beginPath(); ctx.arc(w / 2, h / 2, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '8px sans-serif';
        ctx.textAlign = 'center'; ctx.fillText('\u6838\u4EC1', w / 2, h / 2 + 3);
    }

    function drawNucleusMembrane(ctx, w, h, visible) {
        if (!visible) return;
        drawNucleus(ctx, w, h);
    }

    function drawChromatin(ctx, w, h, t) {
        ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 3]);
        for (var i = 0; i < 4; i++) {
            ctx.beginPath();
            var cy = h / 2 - 15 + i * 10;
            ctx.moveTo(w / 2 - 40, cy + Math.sin(t * 2 + i) * 3);
            ctx.bezierCurveTo(w / 2 - 20, cy - 8, w / 2 + 20, cy + 8, w / 2 + 40, cy + Math.cos(t * 2 + i) * 3);
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }

    function drawCondensingChromosomes(ctx, w, h, t, count) {
        var thickness = 1 + t * 5;
        for (var i = 0; i < count; i++) {
            var angle = (i / count) * Math.PI * 2 + t * 0.5;
            var rx = Math.cos(angle) * 20 * (1 - t);
            var ry = Math.sin(angle) * 15 * (1 - t);
            ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = thickness;
            ctx.beginPath();
            ctx.moveTo(w / 2 + rx - 8, h / 2 + ry - 5);
            ctx.lineTo(w / 2 + rx + 8, h / 2 + ry + 5);
            ctx.stroke();
            ctx.strokeStyle = '#ef4444'; ctx.lineWidth = thickness;
            ctx.beginPath();
            ctx.moveTo(w / 2 + rx + 2, h / 2 + ry - 8);
            ctx.lineTo(w / 2 + rx + 12, h / 2 + ry + 6);
            ctx.stroke();
        }
    }

    function drawSpindlePoles(ctx, w, h, t) {
        if (t < 0.1) return;
        ctx.fillStyle = '#fbbf24';
        var poleY = h / 2;
        var poleDist = w * 0.28 * Math.min(1, t * 2);
        ctx.beginPath(); ctx.arc(w / 2 - poleDist, poleY, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w / 2 + poleDist, poleY, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#333'; ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('\u7EBF\u7C92\u4F53', w / 2 - poleDist, poleY - 12);
        ctx.fillText('\u7EBF\u7C92\u4F53', w / 2 + poleDist, poleY - 12);
    }

    function drawSpindleFibers(ctx, w, h, t) {
        var poleDist = w * 0.28;
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)'; ctx.lineWidth = 1;
        for (var i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(w / 2 - poleDist, h / 2);
            ctx.lineTo(w / 2 + i * 8, h / 2 - 25);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(w / 2 + poleDist, h / 2);
            ctx.lineTo(w / 2 + i * 8, h / 2 + 25);
            ctx.stroke();
        }
    }

    function drawSpindleFull(ctx, w, h, t) {
        var poleDist = w * 0.28;
        var poleY = h / 2;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(w / 2 - poleDist, poleY, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w / 2 + poleDist, poleY, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#333'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('\u7EBF\u7C92\u4F53', w / 2 - poleDist, poleY - 12);
        ctx.fillText('\u7EBF\u7C92\u4F53', w / 2 + poleDist, poleY - 12);

        ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)'; ctx.lineWidth = 1;
        for (var i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(w / 2 - poleDist, poleY);
            ctx.quadraticCurveTo(w / 2 + i * 10, poleY - 20, w / 2 + i * 15, poleY - 8);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(w / 2 + poleDist, poleY);
            ctx.quadraticCurveTo(w / 2 + i * 10, poleY + 20, w / 2 + i * 15, poleY + 8);
            ctx.stroke();
        }
    }

    function drawMetaphaseChromosomes(ctx, w, h, t) {
        // Chromosomes aligned at equator
        for (var i = -1; i <= 1; i++) {
            var cx = w / 2 + i * 20;
            var cy = h / 2;
            // chromosome X shape
            ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(cx - 8, cy - 10); ctx.lineTo(cx + 8, cy + 10); ctx.stroke();
            ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(cx - 8, cy + 10); ctx.lineTo(cx + 8, cy - 10); ctx.stroke();
            // Centromere
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
        }
        // Equator line
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(w / 2, h / 2 - 60); ctx.lineTo(w / 2, h / 2 + 60); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ef4444'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('\u8D64\u9053\u677F', w / 2 + 4, h / 2 + 60);
    }

    function drawAnaphaseChromosomes(ctx, w, h, t) {
        var sep = t * 50;
        for (var i = -1; i <= 1; i++) {
            var cy = h / 2 + i * 10;
            // Left-moving chromosome
            var lx = w / 2 - 15 - sep + i * 5;
            ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(lx - 5, cy - 8); ctx.lineTo(lx + 5, cy + 8); ctx.stroke();
            // Right-moving chromosome
            var rx = w / 2 + 15 + sep + i * 5;
            ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(rx - 5, cy - 8); ctx.lineTo(rx + 5, cy + 8); ctx.stroke();
        }
    }

    function drawTelophaseBase(ctx, w, h, t) {
        var sep = t * w * 0.2;
        // Cell membrane constricting
        ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3;
        ctx.beginPath();
        var pinch = Math.sin(t * Math.PI) * 20;
        ctx.moveTo(w / 2 - sep - w * 0.3, h / 2 - h * 0.35);
        ctx.bezierCurveTo(w / 2 - sep - w * 0.3, h / 2 - pinch, w / 2 + sep + w * 0.3, h / 2 - pinch, w / 2 + sep + w * 0.3, h / 2 - h * 0.35);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(w / 2 - sep - w * 0.3, h / 2 + h * 0.35);
        ctx.bezierCurveTo(w / 2 - sep - w * 0.3, h / 2 + pinch, w / 2 + sep + w * 0.3, h / 2 + pinch, w / 2 + sep + w * 0.3, h / 2 + h * 0.35);
        ctx.stroke();

        // Full ellipse for each side
        ctx.beginPath(); ctx.ellipse(w / 2 - sep, h / 2, w * 0.25, h * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(w / 2 + sep, h / 2, w * 0.25, h * 0.3, 0, 0, Math.PI * 2); ctx.stroke();

        // New nuclei
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(w / 2 - sep, h / 2, w * 0.08, h * 0.09, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'; ctx.fill();
        ctx.beginPath(); ctx.ellipse(w / 2 + sep, h / 2, w * 0.08, h * 0.09, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fill();

        // Chromosomes inside nuclei
        for (var i = -1; i <= 1; i++) {
            ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(w / 2 - sep + i * 6 - 3, h / 2 - 3);
            ctx.lineTo(w / 2 - sep + i * 6 + 3, h / 2 + 3);
            ctx.stroke();
            ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(w / 2 + sep + i * 6 - 3, h / 2 - 3);
            ctx.lineTo(w / 2 + sep + i * 6 + 3, h / 2 + 3);
            ctx.stroke();
        }

        ctx.fillStyle = '#666'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('\u7EC6\u80DE\u8D28\u5206\u88C2\u2192\u4E24\u4E2A\u5B50\u7EC6\u80DE', w / 2, h - 15);
    }

    // ===================== Meiosis Drawing Helpers =====================
    function drawTetrad(ctx, w, h, t) {
        var cy = h / 2;
        for (var i = -1; i <= 1; i += 2) {
            var cx = w / 2 + i * 12;
            ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(cx - 6, cy - 8); ctx.lineTo(cx + 6, cy + 8); ctx.stroke();
            ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(cx - 6, cy + 8); ctx.lineTo(cx + 6, cy - 8); ctx.stroke();
        }
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(w / 2 - 12, cy); ctx.lineTo(w / 2 + 12, cy); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#fbbf24'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('\u56DB\u5206\u4F53', w / 2, cy - 16);
    }

    function drawMeiosisMetaphaseI(ctx, w, h, t) {
        for (var i = -1; i <= 1; i++) {
            var cx = w / 2 + i * 22;
            var cy = h / 2;
            // Homologous pair
            ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(cx - 10, cy); ctx.lineTo(cx - 2, cy); ctx.stroke();
            ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(cx + 2, cy); ctx.lineTo(cx + 10, cy); ctx.stroke();
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath(); ctx.arc(cx - 2, cy, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + 2, cy, 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(w / 2, h / 2 - 50); ctx.lineTo(w / 2, h / 2 + 50); ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawMeiosisAnaphaseI(ctx, w, h, t) {
        var sep = t * 40;
        for (var i = -1; i <= 1; i++) {
            var yOff = i * 8;
            // Left
            ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(w / 2 - 15 - sep + yOff, h / 2 - 8); ctx.lineTo(w / 2 - 15 - sep + yOff + 8, h / 2 + 8); ctx.stroke();
            // Right
            ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(w / 2 + 15 + sep + yOff, h / 2 - 8); ctx.lineTo(w / 2 + 15 + sep + yOff + 8, h / 2 + 8); ctx.stroke();
        }
    }

    function drawTwoCellsBase(ctx, w, h, t, hasNuclei) {
        var cy1 = h / 3;
        var cy2 = 2 * h / 3;
        ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.ellipse(w / 2, cy1, w * 0.22, h * 0.18, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(w / 2, cy2, w * 0.22, h * 0.18, 0, 0, Math.PI * 2); ctx.stroke();

        if (hasNuclei) {
            ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.ellipse(w / 2, cy1, w * 0.06, h * 0.06, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(w / 2, cy2, w * 0.06, h * 0.06, 0, 0, Math.PI * 2); ctx.stroke();
        }

        // Chromosomes
        for (var i = -1; i <= 1; i += 2) {
            ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(w / 2 + i * 5 - 3, cy1 - 3); ctx.lineTo(w / 2 + i * 5 + 3, cy1 + 3); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(w / 2 + i * 5 - 3, cy2 - 3); ctx.lineTo(w / 2 + i * 5 + 3, cy2 + 3); ctx.stroke();
        }
    }

    function drawTwoCellsSpindle(ctx, w, h, t, phase) {
        var cells = [h / 3, 2 * h / 3];
        for (var c = 0; c < cells.length; c++) {
            var cy = cells[c];
            ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.ellipse(w / 2, cy, w * 0.22, h * 0.18, 0, 0, Math.PI * 2); ctx.stroke();

            // Poles
            var poleDist = w * 0.18;
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath(); ctx.arc(w / 2 - poleDist, cy, 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(w / 2 + poleDist, cy, 4, 0, Math.PI * 2); ctx.fill();

            // Fibers
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)'; ctx.lineWidth = 0.5;
            for (var f = -2; f <= 2; f++) {
                ctx.beginPath();
                ctx.moveTo(w / 2 - poleDist, cy);
                ctx.lineTo(w / 2 + f * 6, cy - 5);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(w / 2 + poleDist, cy);
                ctx.lineTo(w / 2 + f * 6, cy + 5);
                ctx.stroke();
            }

            if (phase === 'meta') {
                for (var i = -1; i <= 1; i += 2) {
                    ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(w / 2 + i * 6 - 4, cy - 4); ctx.lineTo(w / 2 + i * 6 + 4, cy + 4); ctx.stroke();
                }
            } else {
                var sep = t * 25;
                ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(w / 2 - 10 - sep, cy - 4); ctx.lineTo(w / 2 - 10 - sep + 6, cy + 4); ctx.stroke();
                ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(w / 2 + 10 + sep, cy - 4); ctx.lineTo(w / 2 + 10 + sep + 6, cy + 4); ctx.stroke();
            }
        }
    }

    function drawFourCellsBase(ctx, w, h, t) {
        var positions = [{ x: w / 4, y: h / 4 }, { x: 3 * w / 4, y: h / 4 }, { x: w / 4, y: 3 * h / 4 }, { x: 3 * w / 4, y: 3 * h / 4 }];
        for (var i = 0; i < positions.length; i++) {
            var px = positions[i].x, py = positions[i].y;
            ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.ellipse(px, py, w * 0.1, h * 0.1, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.ellipse(px, py, w * 0.03, h * 0.03, 0, 0, Math.PI * 2); ctx.stroke();
            // Small chromosome inside
            ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(px - 3, py - 2); ctx.lineTo(px + 3, py + 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(px - 3, py + 2); ctx.lineTo(px + 3, py - 2); ctx.stroke();
        }
        ctx.fillStyle = '#666'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('\u56DB\u4E2A\u5355\u500D\u4F53\u914D\u5B50\u7EC6\u80DE', w / 2, h - 10);
    }

    // ===================== Main Render =====================
    function getSteps() {
        return currentTab === 'mitosis' ? mitosisSteps : meiosisSteps;
    }

    function drawCurrentStep() {
        var canvas = document.getElementById('cell-division-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) { console.error('无法获取Canvas 2D上下文'); return; }
        var w = canvas.width, h = canvas.height;
        try {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#fafbfc'; ctx.fillRect(0, 0, w, h);

            var steps = getSteps();
            var step = steps[currentStep];
            if (step && step.draw) {
                step.draw(ctx, w, h, animProgress);
            }
        } catch (err) {
            console.error('绘制细胞分裂步骤失败:', err);
        }
    }

    function updateUI() {
        var steps = getSteps();
        var step = steps[currentStep];
        // Update description
        var descEl = document.getElementById('cell-desc');
        if (descEl) descEl.innerHTML = '<strong>' + (currentStep + 1) + '/' + steps.length + ' ' + step.name + '</strong><br>' + step.desc;
        // Update detail
        if (document.getElementById('cell-desc-detail')) {
            document.getElementById('cell-desc-detail').textContent = '';
        }
        // Update step indicator
        var indEl = document.getElementById('cell-step-indicator');
        if (indEl) indEl.textContent = (currentStep + 1) + ' / ' + steps.length;
        // Update button states
        var prevBtn = document.getElementById('cell-prev');
        var nextBtn = document.getElementById('cell-next');
        if (prevBtn) prevBtn.disabled = (currentStep === 0);
        if (nextBtn) nextBtn.disabled = (currentStep === steps.length - 1);
        drawCurrentStep();
    }

    function startStepAnimation() {
        if (animId) cancelAnimationFrame(animId);
        animProgress = 0;
        playing = true;
        var playBtn = document.getElementById('cell-play');
        if (playBtn) { playBtn.textContent = '\u6682\u505C'; playBtn.style.background = '#ef4444'; }
        function animate() {
            animProgress += 0.006;
            if (animProgress > 1) {
                animProgress = 1;
                playing = false;
                if (playBtn) { playBtn.textContent = '\u64AD\u653E'; playBtn.style.background = '#3b82f6'; }
            }
            drawCurrentStep();
            if (animProgress < 1) {
                animId = requestAnimationFrame(animate);
            } else {
                animId = null;
            }
        }
        animate();
    }

    function render() {
        var container = document.getElementById('biology-cell-division-app');
        if (!container) return;

        container.innerHTML = '<div class="tool-app-container" style="padding:16px;">' +
            '<div style="display:flex;gap:8px;margin-bottom:8px;">' +
            '<button class="cd-tab" data-tab="mitosis" style="padding:8px 18px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:#3b82f6;color:#fff;font-size:14px;">\u6709\u4E1D\u5206\u88C2</button>' +
            '<button class="cd-tab" data-tab="meiosis" style="padding:8px 18px;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;background:#fff;color:#333;font-size:14px;">\u51CF\u6570\u5206\u88C2</button>' +
            '</div>' +
            '<div style="display:flex;gap:8px;margin-bottom:10px;align-items:center;flex-wrap:wrap;">' +
            '<button id="cell-prev" style="padding:6px 12px;background:#6b7280;color:#fff;border:none;border-radius:6px;cursor:pointer;" disabled>\u25C0 \u4E0A\u4E00\u6B65</button>' +
            '<button id="cell-play" style="padding:6px 14px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">\u25B6 \u64AD\u653E</button>' +
            '<button id="cell-next" style="padding:6px 12px;background:#6b7280;color:#fff;border:none;border-radius:6px;cursor:pointer;">\u4E0B\u4E00\u6B65 \u25B6</button>' +
            '<span id="cell-step-indicator" style="font-size:14px;color:#666;margin-left:8px;">1/' + (currentTab === 'mitosis' ? 5 : 8) + '</span>' +
            '<span id="cell-desc-detail" style="font-size:12px;color:#999;margin-left:8px;"></span>' +
            '</div>' +
            '<canvas id="cell-division-canvas" width="650" height="420" style="border:1px solid #e5e7eb;border-radius:8px;background:#fafbfc;width:100%;max-width:650px;margin-bottom:10px;"></canvas>' +
            '<div id="cell-desc" style="padding:10px 14px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;font-size:13px;color:#1e40af;line-height:1.6;"></div>' +
            '</div>';

        function switchTab(tab) {
            stopAllAnim();
            currentTab = tab;
            currentStep = 0;
            animProgress = 0;
            var allBtns = container.querySelectorAll('.cd-tab');
            for (var i = 0; i < allBtns.length; i++) {
                allBtns[i].style.background = allBtns[i].getAttribute('data-tab') === tab ? '#3b82f6' : '#fff';
                allBtns[i].style.color = allBtns[i].getAttribute('data-tab') === tab ? '#fff' : '#333';
            }
            updateUI();
        }

        function stopAllAnim() {
            if (animId) { cancelAnimationFrame(animId); animId = null; }
            playing = false;
            var playBtn = document.getElementById('cell-play');
            if (playBtn) { playBtn.textContent = '\u25B6 \u64AD\u653E'; playBtn.style.background = '#3b82f6'; }
        }

        var tabs = container.querySelectorAll('.cd-tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].onclick = function() {
                switchTab(this.getAttribute('data-tab'));
            };
        }

        document.getElementById('cell-prev').onclick = function() {
            if (currentStep > 0) {
                stopAllAnim();
                currentStep--;
                animProgress = 1;
                updateUI();
            }
        };
        document.getElementById('cell-next').onclick = function() {
            var steps = getSteps();
            if (currentStep < steps.length - 1) {
                stopAllAnim();
                currentStep++;
                animProgress = 0;
                updateUI();
            }
        };
        document.getElementById('cell-play').onclick = function() {
            if (playing) {
                stopAllAnim();
            } else {
                animProgress = 0;
                startStepAnimation();
            }
        };

        updateUI();
    }

    return { render: render };
})();

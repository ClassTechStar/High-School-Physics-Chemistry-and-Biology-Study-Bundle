// ============================================================
// liquid-glass.js — 液态玻璃主题包的运行时配套（v1.5.2）
// 参考 liquid-glass-js / AndroidLiquidGlass / liquid-glass 的材质思想，
// 用 Web 原生能力等价实现「液态折射」：
//   - 磨砂底座由 css/themes/liquid-glass.css 的 backdrop-filter 承担（全平台）
//   - 本文件负责 Chromium 专属增强：注入 feTurbulence + feDisplacementMap
//     SVG 折射滤镜，并给 <html> 加 .lg-displace 类启用 backdrop-filter: url()
//   - 非 Chromium（Firefox/Safari）、prefers-reduced-transparency、
//     低内存/省流设备自动回退纯磨砂（CSS 侧另有实底兜底）
// 激活方式：设置 → 通用 → 外观主题包 →「液态玻璃」（theme-loader 切 CSS）；
// 本模块经 tick 轮询感知主题变化，≤1s 内注入/移除滤镜，与 loader 零耦合。
// ============================================================
window.HSPCBLiquidGlass = (function () {
    'use strict';

    var FILTER_ID = 'hspcb-lg-displace';
    var svgEl = null;
    var lastActive = null;

    function themeActive() {
        try {
            return window.HSPCBTheme && HSPCBTheme.current() === 'liquid-glass';
        } catch (e) { return false; }
    }

    /** 折射增强的能力门控：仅 Chromium 内核 + 允许透明度 + 设备性能允许 */
    function displacementAllowed() {
        try {
            if (!window.chrome) return false; // Firefox / Safari 无 chrome 命名空间
            if (typeof matchMedia !== 'function') return false;
            if (matchMedia('(prefers-reduced-transparency: reduce)').matches) return false;
            var nav = window.navigator || {};
            if (nav.deviceMemory != null && nav.deviceMemory < 4) return false;
            if (nav.connection && (nav.connection.saveData || /2g$/i.test(nav.connection.effectiveType || ''))) return false;
            if (typeof CSS !== 'undefined' && CSS.supports && !CSS.supports('backdrop-filter', 'blur(1px)')) return false;
            return true;
        } catch (e) { return false; }
    }

    function buildSvg() {
        var NS = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('width', '0');
        svg.setAttribute('height', '0');
        svg.setAttribute('aria-hidden', 'true');
        svg.style.position = 'absolute'; // CSSOM 写入，不受 style-src 管辖

        var filter = document.createElementNS(NS, 'filter');
        filter.setAttribute('id', FILTER_ID);
        filter.setAttribute('x', '-20%');
        filter.setAttribute('y', '-20%');
        filter.setAttribute('width', '140%');
        filter.setAttribute('height', '140%');
        filter.setAttribute('color-interpolation-filters', 'sRGB');

        // 折射介质：低频分形噪声 → 高斯柔化 → RGB 通道位移
        var turb = document.createElementNS(NS, 'feTurbulence');
        turb.setAttribute('type', 'fractalNoise');
        turb.setAttribute('baseFrequency', '0.008 0.012');
        turb.setAttribute('numOctaves', '2');
        turb.setAttribute('seed', '7');
        turb.setAttribute('result', 'noise');

        var soft = document.createElementNS(NS, 'feGaussianBlur');
        soft.setAttribute('in', 'noise');
        soft.setAttribute('stdDeviation', '3');
        soft.setAttribute('result', 'soft');

        var displace = document.createElementNS(NS, 'feDisplacementMap');
        displace.setAttribute('in', 'SourceGraphic');
        displace.setAttribute('in2', 'soft');
        displace.setAttribute('scale', '64');
        displace.setAttribute('xChannelSelector', 'R');
        displace.setAttribute('yChannelSelector', 'G');

        filter.appendChild(turb);
        filter.appendChild(soft);
        filter.appendChild(displace);
        svg.appendChild(filter);
        return svg;
    }

    function activate() {
        if (typeof document === 'undefined') return;
        lastActive = true;
        if (displacementAllowed()) {
            if (!svgEl || !svgEl.parentNode) {
                svgEl = buildSvg();
                (document.body || document.documentElement).appendChild(svgEl);
            }
            document.documentElement.classList.add('lg-displace');
        } else {
            // 不满足增强条件：仅磨砂（CSS 已有实底/透明度降级）
            document.documentElement.classList.remove('lg-displace');
        }
    }

    function deactivate() {
        if (typeof document === 'undefined') return;
        lastActive = false;
        document.documentElement.classList.remove('lg-displace');
        if (svgEl && svgEl.parentNode) svgEl.parentNode.removeChild(svgEl);
        svgEl = null;
    }

    // tick 轮询主题状态（变化生效延迟 ≤1s；代价一次函数调用）
    function poll() {
        try {
            var active = themeActive();
            if (active === lastActive) return;
            lastActive = active;
            if (active) activate(); else deactivate();
        } catch (e) { /* 自身不抛错 */ }
    }

    if (window.HSPCBTick) HSPCBTick.on(poll);
    if (typeof document !== 'undefined') {
        if (document.readyState === 'complete') poll();
        else document.addEventListener('DOMContentLoaded', poll);
    }

    return {
        isActive: function () { return lastActive === true; },
        /** 供设置页展示能力状态（增强折射是否可用） */
        enhancementAvailable: displacementAllowed,
        _forceActivate: activate,
        _forceDeactivate: deactivate
    };
})();

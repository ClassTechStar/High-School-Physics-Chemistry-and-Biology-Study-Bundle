// 学科内容缺口补全 - 数学三角函数+英语听力+完形填空
// 纯前端 | 零依赖 | ES5兼容(var/function) | innerHTML+内联style+SVG | window暴露
(function () {
  'use strict';

  // ===================== 公共工具 =====================
  function escapeHtml(s) {
    s = String(s);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function splitSentences(p) {
    var res = [], cur = '';
    for (var i = 0; i < p.length; i++) {
      cur += p[i];
      if (p[i] === '.' || p[i] === '!' || p[i] === '?') {
        while (i + 1 < p.length && p[i + 1] === ' ') { cur += ' '; i++; }
        res.push(cur);
        cur = '';
      }
    }
    if (cur.replace(/\s/g, '').length) res.push(cur);
    return res;
  }
  function stars(n) {
    var s = '';
    for (var i = 0; i < 3; i++) s += (i < n ? '★' : '☆');
    return s;
  }

  // ============================================================
  // 模块1: trigUnitCircle 三角函数单位圆动画
  // ============================================================
  var trigUnitCircle = {
    containerId: 'trig-unit-circle-app',
    W: 460, H: 460,
    cx: 230, cy: 230, R: 180,
    plotW: 340, plotH: 220, padL: 34, padR: 16, padT: 16, padB: 28,
    xMax: 2 * Math.PI, yMin: -1.6, yMax: 1.6,
    specialAngles: [0, 30, 45, 60, 90, 120, 135, 150, 180, 270, 360],
    state: { angle: 45, playing: false, timer: null, acc: 0 },
    refs: {},
    el: null,

    render: function () {
      var box = document.getElementById(this.containerId);
      if (!box) return;
      try {
        this.el = box;
        box.innerHTML = this.build();
        this.cache();
        this.bind();
        this.update();
      } catch (err) {
        console.error('三角函数单位圆渲染失败:', err);
      }
    },

    build: function () {
      var s = this, cx = s.cx, cy = s.cy, R = s.R, W = s.W, H = s.H;
      var sa = s.specialAngles;
      var dots = '';
      for (var i = 0; i < sa.length; i++) {
        var a = sa[i] * Math.PI / 180;
        var x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);
        dots += "<circle cx='" + x.toFixed(1) + "' cy='" + y.toFixed(1) + "' r='3.5' fill='#888'/>";
        var lx = cx + (R + 14) * Math.cos(a), ly = cy - (R + 14) * Math.sin(a);
        dots += "<text x='" + lx.toFixed(1) + "' y='" + ly.toFixed(1) + "' font-size='11' fill='#777' text-anchor='middle' dominant-baseline='middle'>" + sa[i] + "°</text>";
      }
      var quads = [
        { a: 45, t: 'I\nsin+ cos+ tan+' },
        { a: 135, t: 'II\nsin+ cos− tan−' },
        { a: 225, t: 'III\nsin− cos− tan+' },
        { a: 315, t: 'IV\nsin− cos+ tan−' }
      ];
      var ql = '';
      for (var j = 0; j < quads.length; j++) {
        var aa = quads[j].a * Math.PI / 180;
        var qx = cx + (R * 0.55) * Math.cos(aa), qy = cy - (R * 0.55) * Math.sin(aa);
        var lines = quads[j].t.split('\n');
        ql += "<text x='" + qx.toFixed(1) + "' y='" + (qy - 6).toFixed(1) + "' font-size='13' font-weight='bold' fill='#bbb' text-anchor='middle'>第" + lines[0] + "象限</text>";
        ql += "<text x='" + qx.toFixed(1) + "' y='" + (qy + 10).toFixed(1) + "' font-size='10' fill='#bbb' text-anchor='middle'>" + lines[1] + "</text>";
      }
      var sinPath = s.genCurve(function (x) { return Math.sin(x); }, false);
      var cosPath = s.genCurve(function (x) { return Math.cos(x); }, false);
      var tanPath = s.genCurve(function (x) { return Math.tan(x); }, true);
      var xticks = '';
      var pivals = [[0, '0'], [Math.PI / 2, 'π/2'], [Math.PI, 'π'], [3 * Math.PI / 2, '3π/2'], [2 * Math.PI, '2π']];
      for (var k = 0; k < pivals.length; k++) {
        var X = s.padL + (pivals[k][0] / s.xMax) * (s.plotW - s.padL - s.padR);
        xticks += "<line x1='" + X.toFixed(1) + "' y1='" + (s.plotH - s.padB) + "' x2='" + X.toFixed(1) + "' y2='" + (s.plotH - s.padB + 4) + "' stroke='#999'/>";
        xticks += "<text x='" + X.toFixed(1) + "' y='" + (s.plotH - s.padB + 16) + "' font-size='10' fill='#777' text-anchor='middle'>" + pivals[k][1] + "</text>";
      }
      var y0 = s.plotH - s.padB - (0 - s.yMin) / (s.yMax - s.yMin) * (s.plotH - s.padT - s.padB);

      var html = "<div style='font-family:sans-serif;color:#222;'>" +
        "<h3 style='margin:0 0 8px;color:#2b6ce2;'>📐 三角函数单位圆交互</h3>" +
        "<p style='font-size:12px;color:#666;margin:0 0 10px;'>拖动圆上点P（或点击圆面）观察 sin / cos / tan 的实时变化</p>" +
        "<div style='display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start;'>" +
          "<div style='background:#fafafa;border:1px solid #eee;border-radius:8px;padding:6px;'>" +
            "<svg id='tuc-svg' width='" + W + "' height='" + H + "' style='touch-action:none;display:block;'>" +
              "<line x1='0' y1='" + cy + "' x2='" + W + "' y2='" + cy + "' stroke='#ddd' stroke-width='1'/>" +
              "<line x1='" + cx + "' y1='0' x2='" + cx + "' y2='" + H + "' stroke='#ddd' stroke-width='1'/>" +
              "<line x1='" + (cx + R) + "' y1='0' x2='" + (cx + R) + "' y2='" + H + "' stroke='#9bc' stroke-width='1' stroke-dasharray='4 4'/>" +
              "<text x='" + (W - 10) + "' y='" + (cy - 6) + "' font-size='11' fill='#999' text-anchor='end'>x</text>" +
              "<text x='" + (cx + 6) + "' y='12' font-size='11' fill='#999'>y</text>" +
              "<circle cx='" + cx + "' cy='" + cy + "' r='" + R + "' fill='none' stroke='#333' stroke-width='2'/>" +
              "<circle cx='" + cx + "' cy='" + cy + "' r='3' fill='#333'/>" +
              "<text x='" + (cx - 12) + "' y='" + (cy + 14) + "' font-size='11' fill='#333'>O</text>" +
              dots + ql +
              "<path id='tuc-arc' fill='rgba(255,200,0,0.25)' stroke='#e8a900' stroke-width='1'/>" +
              "<line id='tuc-radius' stroke='#555' stroke-width='1.5'/>" +
              "<line id='tuc-cos' stroke='#e23b3b' stroke-width='3'/>" +
              "<line id='tuc-sin' stroke='#2b6ce2' stroke-width='3'/>" +
              "<line id='tuc-tan' stroke='#1aa84a' stroke-width='3'/>" +
              "<text id='tuc-cosLabel' font-size='12' fill='#e23b3b' font-weight='bold'></text>" +
              "<text id='tuc-sinLabel' font-size='12' fill='#2b6ce2' font-weight='bold'></text>" +
              "<text id='tuc-tanLabel' font-size='12' fill='#1aa84a' font-weight='bold'></text>" +
              "<text id='tuc-pLabel' font-size='13' fill='#222' font-weight='bold'>P</text>" +
              "<circle id='tuc-point' r='7' fill='#fff' stroke='#222' stroke-width='2' style='cursor:grab;'/>" +
            "</svg>" +
          "</div>" +
          "<div style='display:flex;flex-direction:column;gap:10px;'>" +
            "<div style='background:#fafafa;border:1px solid #eee;border-radius:8px;padding:6px;'>" +
              "<div style='font-size:12px;color:#666;margin-bottom:4px;'>函数图像（当前角度竖线标注）</div>" +
              "<svg width='" + s.plotW + "' height='" + s.plotH + "' style='display:block;'>" +
                "<line x1='" + s.padL + "' y1='" + y0.toFixed(1) + "' x2='" + (s.plotW - s.padR) + "' y2='" + y0.toFixed(1) + "' stroke='#ccc'/>" +
                "<line x1='" + s.padL + "' y1='" + s.padT + "' x2='" + s.padL + "' y2='" + (s.plotH - s.padB) + "' stroke='#ccc'/>" +
                xticks +
                "<path d='" + tanPath + "' fill='none' stroke='#1aa84a' stroke-width='1.5' opacity='0.6'/>" +
                "<path d='" + cosPath + "' fill='none' stroke='#e23b3b' stroke-width='2'/>" +
                "<path d='" + sinPath + "' fill='none' stroke='#2b6ce2' stroke-width='2'/>" +
                "<line id='tuc-plotLine' stroke='#888' stroke-width='1' stroke-dasharray='3 3'/>" +
                "<circle id='tuc-dotSin' r='4' fill='#2b6ce2'/>" +
                "<circle id='tuc-dotCos' r='4' fill='#e23b3b'/>" +
                "<circle id='tuc-dotTan' r='4' fill='#1aa84a'/>" +
                "<text x='" + (s.plotW - s.padR - 4) + "' y='" + (s.padT + 10) + "' font-size='10' fill='#2b6ce2' text-anchor='end'>sin</text>" +
                "<text x='" + (s.plotW - s.padR - 4) + "' y='" + (s.padT + 22) + "' font-size='10' fill='#e23b3b' text-anchor='end'>cos</text>" +
                "<text x='" + (s.plotW - s.padR - 4) + "' y='" + (s.padT + 34) + "' font-size='10' fill='#1aa84a' text-anchor='end'>tan</text>" +
              "</svg>" +
            "</div>" +
            "<div style='background:#f4f7ff;border:1px solid #dde6ff;border-radius:8px;padding:10px;font-size:13px;'>" +
              "<div style='font-weight:bold;margin-bottom:6px;color:#2b6ce2;'>实时数值</div>" +
              "<div>角度 θ = <b id='tuc-valDeg'>—</b> （弧度 <b id='tuc-valRad'>—</b>）</div>" +
              "<div style='color:#2b6ce2;'>sinθ = <b id='tuc-valSin'>—</b></div>" +
              "<div style='color:#e23b3b;'>cosθ = <b id='tuc-valCos'>—</b></div>" +
              "<div style='color:#1aa84a;'>tanθ = <b id='tuc-valTan'>—</b></div>" +
              "<div style='color:#888;'>位置：<span id='tuc-valQuad'>—</span></div>" +
            "</div>" +
          "</div>" +
        "</div>" +
        "<div style='margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;'>" +
          "<button id='tuc-play' style='padding:6px 14px;background:#2b6ce2;color:#fff;border:none;border-radius:6px;cursor:pointer;'>▶ 播放动画</button>" +
          "<button id='tuc-reset' style='padding:6px 14px;background:#888;color:#fff;border:none;border-radius:6px;cursor:pointer;'>↺ 重置0°</button>" +
          "<span style='font-size:12px;color:#666;'>跳转特殊角：</span>" +
          s.jumpButtons() +
        "</div>" +
        "<div style='display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;'>" +
          "<div style='flex:1;min-width:260px;background:#fffaf0;border:1px solid #f0e0c0;border-radius:8px;padding:10px;font-size:13px;'>" +
            "<div style='font-weight:bold;margin-bottom:6px;color:#b8860b;'>📋 公式参考</div>" +
            "<div>同角关系：<b>sin²θ + cos²θ = 1</b>；tanθ = sinθ / cosθ</div>" +
            "<div>诱导公式：sin(π−θ)=sinθ；cos(π−θ)=−cosθ；sin(−θ)=−sinθ；cos(−θ)=cosθ</div>" +
            "<div>二倍角：sin2θ=2sinθcosθ；cos2θ=cos²θ−sin²θ</div>" +
            "<div>特殊值：sin30°=1/2，cos30°=√3/2，sin45°=cos45°=√2/2，tan45°=1</div>" +
          "</div>" +
          "<div style='flex:1;min-width:260px;background:#f5fff5;border:1px solid #c0e8c0;border-radius:8px;padding:10px;font-size:13px;'>" +
            "<div style='font-weight:bold;margin-bottom:6px;color:#1aa84a;'>🎯 广东卷考点提示</div>" +
            "<div>· 三角函数的图象与性质（周期、单调、最值）是高频考点</div>" +
            "<div>· 诱导公式与同角关系常在化简求值中考查</div>" +
            "<div>· 结合单位圆理解象限符号与定义域限制</div>" +
            "<div>· y=Asin(ωx+φ) 的图象变换为压轴热点</div>" +
          "</div>" +
        "</div>" +
      "</div>";
      return html;
    },

    jumpButtons: function () {
      var arr = [0, 30, 45, 60, 90, 120, 135, 150, 180, 270, 360];
      var h = '';
      for (var i = 0; i < arr.length; i++) {
        h += "<button class='tuc-jump' data-a='" + arr[i] + "' style='padding:4px 10px;background:#eef3ff;border:1px solid #cdd9f5;border-radius:5px;cursor:pointer;font-size:12px;'>" + arr[i] + "°</button>";
      }
      return h;
    },

    genCurve: function (fn, clip) {
      var s = this, steps = 140, d = '', pen = false;
      for (var i = 0; i <= steps; i++) {
        var x = (s.xMax) * i / steps;
        var y = fn(x);
        if (clip && (!isFinite(y) || y > s.yMax || y < s.yMin)) { pen = false; continue; }
        var X = s.padL + (x / s.xMax) * (s.plotW - s.padL - s.padR);
        var Y = s.plotH - s.padB - (y - s.yMin) / (s.yMax - s.yMin) * (s.plotH - s.padT - s.padB);
        d += (pen ? ' L ' : ' M ') + X.toFixed(1) + ' ' + Y.toFixed(1);
        pen = true;
      }
      return d;
    },

    cache: function () {
      var r = this.refs, el = this.el;
      r.svg = el.querySelector('#tuc-svg');
      r.point = el.querySelector('#tuc-point');
      r.arc = el.querySelector('#tuc-arc');
      r.radius = el.querySelector('#tuc-radius');
      r.cos = el.querySelector('#tuc-cos');
      r.sin = el.querySelector('#tuc-sin');
      r.tan = el.querySelector('#tuc-tan');
      r.cosLabel = el.querySelector('#tuc-cosLabel');
      r.sinLabel = el.querySelector('#tuc-sinLabel');
      r.tanLabel = el.querySelector('#tuc-tanLabel');
      r.pLabel = el.querySelector('#tuc-pLabel');
      r.valDeg = el.querySelector('#tuc-valDeg');
      r.valRad = el.querySelector('#tuc-valRad');
      r.valSin = el.querySelector('#tuc-valSin');
      r.valCos = el.querySelector('#tuc-valCos');
      r.valTan = el.querySelector('#tuc-valTan');
      r.valQuad = el.querySelector('#tuc-valQuad');
      r.plotLine = el.querySelector('#tuc-plotLine');
      r.dotSin = el.querySelector('#tuc-dotSin');
      r.dotCos = el.querySelector('#tuc-dotCos');
      r.dotTan = el.querySelector('#tuc-dotTan');
      r.play = el.querySelector('#tuc-play');
      r.reset = el.querySelector('#tuc-reset');
    },

    bind: function () {
      var s = this, r = s.refs, dragging = false;
      function svgPoint(e) {
        var rect = r.svg.getBoundingClientRect();
        var cx = (e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0));
        var cy = (e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0));
        return { x: (cx - rect.left) * s.W / rect.width, y: (cy - rect.top) * s.H / rect.height };
      }
      function setFromEvent(e) {
        var pt = svgPoint(e);
        var dx = pt.x - s.cx, dy = s.cy - pt.y;
        var a = Math.atan2(dy, dx) * 180 / Math.PI;
        if (a < 0) a += 360;
        s.state.angle = a;
        s.update();
      }
      function down(e) { dragging = true; s.stop(); setFromEvent(e); if (e.preventDefault) e.preventDefault(); }
      function move(e) { if (dragging) { setFromEvent(e); if (e.preventDefault) e.preventDefault(); } }
      function up() { dragging = false; }
      r.svg.addEventListener('mousedown', down);
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
      r.svg.addEventListener('touchstart', down, { passive: false });
      document.addEventListener('touchmove', move, { passive: false });
      document.addEventListener('touchend', up);
      r.play.onclick = function () { if (s.state.playing) s.stop(); else s.play(); };
      r.reset.onclick = function () { s.stop(); s.state.angle = 0; s.update(); };
      var jumps = s.el.querySelectorAll('.tuc-jump');
      for (var i = 0; i < jumps.length; i++) {
        jumps[i].onclick = function () { s.stop(); s.state.angle = parseFloat(this.getAttribute('data-a')) % 360; s.update(); };
      }
    },

    arcPath: function (ang) {
      if (ang <= 0.01) return '';
      var s = this, cx = s.cx, cy = s.cy, R = s.R;
      var d = 'M ' + cx + ' ' + cy + ' L ' + (cx + R) + ' ' + cy;
      var steps = Math.ceil(ang);
      for (var i = 1; i <= steps; i++) {
        var a = Math.min(i, ang) * Math.PI / 180;
        d += ' L ' + (cx + R * Math.cos(a)).toFixed(2) + ' ' + (cy - R * Math.sin(a)).toFixed(2);
      }
      return d + ' Z';
    },

    quadrant: function (ang) {
      if (ang === 0 || ang === 360) return 'x轴正半轴';
      if (ang === 90) return 'y轴正半轴';
      if (ang === 180) return 'x轴负半轴';
      if (ang === 270) return 'y轴负半轴';
      if (ang > 0 && ang < 90) return '第I象限 (sin+ cos+ tan+)';
      if (ang > 90 && ang < 180) return '第II象限 (sin+ cos− tan−)';
      if (ang > 180 && ang < 270) return '第III象限 (sin− cos− tan+)';
      return '第IV象限 (sin− cos+ tan−)';
    },

    update: function () {
      var s = this, r = s.refs, st = s.state;
      var ang = st.angle, rad = ang * Math.PI / 180;
      var px = s.cx + s.R * Math.cos(rad), py = s.cy - s.R * Math.sin(rad);
      var sinv = Math.sin(rad), cosv = Math.cos(rad);
      var tanv = (Math.abs(cosv) < 1e-6) ? null : Math.tan(rad);
      r.point.setAttribute('cx', px.toFixed(2));
      r.point.setAttribute('cy', py.toFixed(2));
      r.pLabel.setAttribute('x', (px + 10));
      r.pLabel.setAttribute('y', (py - 8));
      r.radius.setAttribute('x1', s.cx); r.radius.setAttribute('y1', s.cy);
      r.radius.setAttribute('x2', px.toFixed(2)); r.radius.setAttribute('y2', py.toFixed(2));
      r.cos.setAttribute('x1', s.cx); r.cos.setAttribute('y1', s.cy);
      r.cos.setAttribute('x2', px.toFixed(2)); r.cos.setAttribute('y2', s.cy);
      r.sin.setAttribute('x1', px.toFixed(2)); r.sin.setAttribute('y1', s.cy);
      r.sin.setAttribute('x2', px.toFixed(2)); r.sin.setAttribute('y2', py.toFixed(2));
      if (tanv !== null && Math.abs(tanv) < 8) {
        var tx = s.cx + s.R, ty = s.cy - s.R * tanv;
        r.tan.setAttribute('x1', px.toFixed(2)); r.tan.setAttribute('y1', py.toFixed(2));
        r.tan.setAttribute('x2', tx.toFixed(2)); r.tan.setAttribute('y2', ty.toFixed(2));
        r.tan.setAttribute('opacity', 1);
        r.tanLabel.setAttribute('x', tx + 6);
        r.tanLabel.setAttribute('y', ty < s.cy ? ty - 4 : ty + 14);
        r.tanLabel.textContent = 'tan=' + tanv.toFixed(2);
        r.tanLabel.setAttribute('opacity', 1);
      } else {
        r.tan.setAttribute('opacity', 0);
        r.tanLabel.setAttribute('opacity', 0);
      }
      r.sinLabel.setAttribute('x', px + 6);
      r.sinLabel.setAttribute('y', (py + s.cy) / 2);
      r.sinLabel.textContent = 'sin=' + sinv.toFixed(2);
      r.cosLabel.setAttribute('x', (px + s.cx) / 2);
      r.cosLabel.setAttribute('y', s.cy + 16);
      r.cosLabel.textContent = 'cos=' + cosv.toFixed(2);
      r.arc.setAttribute('d', s.arcPath(ang));
      r.valDeg.textContent = ang.toFixed(1) + '°';
      r.valRad.textContent = rad.toFixed(3);
      r.valSin.textContent = sinv.toFixed(3);
      r.valCos.textContent = cosv.toFixed(3);
      r.valTan.textContent = (tanv === null ? '∞ (未定义)' : tanv.toFixed(3));
      r.valQuad.textContent = s.quadrant(ang);
      s.updatePlot(rad);
    },

    updatePlot: function (rad) {
      var s = this, r = s.refs;
      var X = s.padL + (rad / s.xMax) * (s.plotW - s.padL - s.padR);
      r.plotLine.setAttribute('x1', X.toFixed(1)); r.plotLine.setAttribute('x2', X.toFixed(1));
      r.plotLine.setAttribute('y1', s.padT); r.plotLine.setAttribute('y2', s.plotH - s.padB);
      setDot(r.dotSin, X, s, Math.sin(rad));
      setDot(r.dotCos, X, s, Math.cos(rad));
      var tv = Math.tan(rad);
      if (isFinite(tv) && Math.abs(tv) <= 1.6) { setDot(r.dotTan, X, s, tv, 1); } else { setDot(r.dotTan, X, s, 0, 0); }
      function setDot(el, X, self, y, op) {
        var Y = self.plotH - self.padB - (y - self.yMin) / (self.yMax - self.yMin) * (self.plotH - self.padT - self.padB);
        el.setAttribute('cx', X.toFixed(1)); el.setAttribute('cy', Y.toFixed(1));
        el.setAttribute('opacity', op === undefined ? 1 : op);
      }
    },

    play: function () {
      var s = this, st = s.state;
      if (st.playing) return;
      st.playing = true;
      st.acc = 0;
      s.refs.play.textContent = '⏸ 停止';
      st.timer = setInterval(function () {
        s.state.angle += 1.2;
        s.state.acc += 1.2;
        if (s.state.angle >= 360) s.state.angle -= 360;
        s.update();
        if (s.state.acc >= 360) s.stop();
      }, 16);
    },

    stop: function () {
      var s = this, st = s.state;
      st.playing = false;
      if (st.timer) { clearInterval(st.timer); st.timer = null; }
      if (s.refs.play) s.refs.play.textContent = '▶ 播放动画';
    }
  };

  // ============================================================
  // 模块2: englishListening 英语听力训练
  // ============================================================
  var englishListening = {
    containerId: 'english-listening-app',
    rateMap: { slow: 0.7, normal: 1.0, fast: 1.3 },
    state: { idx: 0, speed: 'normal', cur: 0, mode: 'all', supported: true },
    sentences: [],
    el: null,
    refs: {},
    data: [
      {
        id: 1, title: 'School Life 校园生活', level: '容易', speed: 'normal',
        passage: "Every morning, Li Hua wakes up at six thirty and walks to school with his classmates. His favorite subject is physics because he enjoys doing experiments in the laboratory. During the lunch break, he usually plays basketball on the playground with his friends. After school, he attends an English club where students practice speaking in pairs. His teacher, Mr. Wang, always encourages them to be confident and not to be afraid of making mistakes. Li Hua believes that school life is busy but meaningful.",
        questions: [
          { q: "What time does Li Hua wake up?", options: ["6:00", "6:30", "7:00", "7:30"], answer: 1, script: "Li Hua wakes up at six thirty" },
          { q: "What is Li Hua's favorite subject?", options: ["Math", "Physics", "English", "Chemistry"], answer: 1, script: "His favorite subject is physics" },
          { q: "What does he do during the lunch break?", options: ["Reads books", "Plays basketball", "Does homework", "Sleeps"], answer: 1, script: "he usually plays basketball on the playground" },
          { q: "Where do students practice speaking?", options: ["In the lab", "On the playground", "In the English club", "At home"], answer: 2, script: "he attends an English club where students practice speaking in pairs" }
        ],
        vocab: [
          { word: "classmate", phonetic: "/ˈklɑːsmeɪt/", meaning: "n. 同学" },
          { word: "physics", phonetic: "/ˈfɪzɪks/", meaning: "n. 物理学" },
          { word: "experiment", phonetic: "/ɪkˈsperɪmənt/", meaning: "n. 实验" },
          { word: "laboratory", phonetic: "/ləˈbɒrətri/", meaning: "n. 实验室" },
          { word: "playground", phonetic: "/ˈpleɪɡraʊnd/", meaning: "n. 操场" },
          { word: "encourage", phonetic: "/ɪnˈkʌrɪdʒ/", meaning: "v. 鼓励" },
          { word: "confident", phonetic: "/ˈkɒnfɪdənt/", meaning: "adj. 自信的" },
          { word: "meaningful", phonetic: "/ˈmiːnɪŋfl/", meaning: "adj. 有意义的" }
        ]
      },
      {
        id: 2, title: 'Travel Adventure 旅行经历', level: '中等', speed: 'normal',
        passage: "Last summer, Maria traveled to Yunnan with her family. They visited Lijiang Old Town and were amazed by the ancient buildings and clear streams. On the second day, they climbed Jade Dragon Snow Mountain, which was 4680 meters high. Maria felt a bit sick from the altitude, but her father gave her some medicine and she soon felt better. They also tasted local food like crossing-the-bridge noodles and flower cakes. Maria said it was the most unforgettable trip she had ever taken.",
        questions: [
          { q: "Where did Maria travel last summer?", options: ["Lijiang", "Beijing", "Shanghai", "Tibet"], answer: 0, script: "Maria traveled to Yunnan" },
          { q: "How high is Jade Dragon Snow Mountain?", options: ["3680m", "4680m", "5680m", "4000m"], answer: 1, script: "which was 4680 meters high" },
          { q: "Why did Maria feel sick?", options: ["Ate too much", "Altitude sickness", "Caught a cold", "Was tired"], answer: 1, script: "Maria felt a bit sick from the altitude" },
          { q: "What local food did they taste?", options: ["Dumplings", "Hot pot", "Crossing-the-bridge noodles", "Roast duck"], answer: 2, script: "tasted local food like crossing-the-bridge noodles" }
        ],
        vocab: [
          { word: "travel", phonetic: "/ˈtrævl/", meaning: "v. 旅行" },
          { word: "ancient", phonetic: "/ˈeɪnʃənt/", meaning: "adj. 古老的" },
          { word: "stream", phonetic: "/striːm/", meaning: "n. 溪流" },
          { word: "altitude", phonetic: "/ˈæltɪtjuːd/", meaning: "n. 海拔" },
          { word: "medicine", phonetic: "/ˈmedsn/", meaning: "n. 药" },
          { word: "unforgettable", phonetic: "/ˌʌnfəˈɡetəbl/", meaning: "adj. 难忘的" },
          { word: "amazed", phonetic: "/əˈmeɪzd/", meaning: "adj. 惊讶的" }
        ]
      },
      {
        id: 3, title: 'Environmental Protection 环保主题', level: '中等', speed: 'normal',
        passage: "Our planet is facing serious environmental problems. Every day, millions of plastic bottles are thrown away and end up in the ocean, harming sea animals. To protect the earth, we should reduce, reuse, and recycle. For example, we can bring our own cloth bags when shopping instead of using plastic ones. We can also save water by turning off the tap while brushing our teeth. Planting more trees is another effective way to clean the air. If everyone takes small actions, we can make a big difference.",
        questions: [
          { q: "What ends up in the ocean?", options: ["Paper", "Plastic bottles", "Glass", "Metal"], answer: 1, script: "millions of plastic bottles are thrown away and end up in the ocean" },
          { q: "What are the three Rs?", options: ["reduce reuse recycle", "read write run", "red right round", "repair reuse return"], answer: 0, script: "we should reduce, reuse, and recycle" },
          { q: "What should we bring when shopping?", options: ["Plastic bags", "Cloth bags", "Paper cups", "Money"], answer: 1, script: "we can bring our own cloth bags when shopping" },
          { q: "What can clean the air?", options: ["Planting trees", "Driving cars", "Burning coal", "Cutting trees"], answer: 0, script: "Planting more trees is another effective way to clean the air" }
        ],
        vocab: [
          { word: "planet", phonetic: "/ˈplænɪt/", meaning: "n. 行星" },
          { word: "plastic", phonetic: "/ˈplæstɪk/", meaning: "n. 塑料" },
          { word: "ocean", phonetic: "/ˈəʊʃn/", meaning: "n. 海洋" },
          { word: "reduce", phonetic: "/rɪˈdjuːs/", meaning: "v. 减少" },
          { word: "recycle", phonetic: "/ˌriːˈsaɪkl/", meaning: "v. 回收" },
          { word: "effective", phonetic: "/ɪˈfektɪv/", meaning: "adj. 有效的" },
          { word: "harm", phonetic: "/hɑːm/", meaning: "v. 伤害" }
        ]
      },
      {
        id: 4, title: 'Technology and Life 科技生活', level: '较难', speed: 'normal',
        passage: "Smartphones have changed our lives in many ways. With a smartphone, we can chat with friends, watch videos, and even take online classes anywhere. However, spending too much time on phones may cause eye problems and affect our sleep. Doctors suggest that teenagers should not use phones for more than two hours a day. Besides, we should keep a proper distance from the screen and take a break every twenty minutes. Technology is useful, but we must use it wisely.",
        questions: [
          { q: "What can we do with smartphones?", options: ["Only call", "Chat and take classes", "Cook food", "Drive cars"], answer: 1, script: "we can chat with friends, watch videos, and even take online classes" },
          { q: "What problems may too much phone use cause?", options: ["Ear problems", "Eye problems", "Back problems", "Foot problems"], answer: 1, script: "spending too much time on phones may cause eye problems" },
          { q: "How long should teenagers use phones a day at most?", options: ["1 hour", "2 hours", "3 hours", "4 hours"], answer: 1, script: "teenagers should not use phones for more than two hours a day" },
          { q: "How often should we take a break?", options: ["Every 10 min", "Every 20 min", "Every 30 min", "Every hour"], answer: 1, script: "take a break every twenty minutes" }
        ],
        vocab: [
          { word: "smartphone", phonetic: "/ˈsmɑːtfəʊn/", meaning: "n. 智能手机" },
          { word: "online", phonetic: "/ˌɒnˈlaɪn/", meaning: "adj. 在线的" },
          { word: "affect", phonetic: "/əˈfekt/", meaning: "v. 影响" },
          { word: "teenager", phonetic: "/ˈtiːneɪdʒə/", meaning: "n. 青少年" },
          { word: "distance", phonetic: "/ˈdɪstəns/", meaning: "n. 距离" },
          { word: "wisely", phonetic: "/ˈwaɪzli/", meaning: "adv. 明智地" },
          { word: "suggest", phonetic: "/səˈdʒest/", meaning: "v. 建议" }
        ]
      },
      {
        id: 5, title: 'Health and Diet 健康饮食', level: '中等', speed: 'normal',
        passage: "A healthy diet is very important for teenagers who are growing fast. We should eat more vegetables and fruits because they are rich in vitamins. Fish and eggs provide protein that helps build our muscles. It is also necessary to drink enough water, about eight glasses a day. We should avoid eating too much junk food like chips and fried chicken, because they contain too much fat and sugar. Besides, doing exercise for at least thirty minutes every day keeps our body strong. Good habits lead to a healthy life.",
        questions: [
          { q: "Why should we eat vegetables and fruits?", options: ["Rich in vitamins", "Rich in fat", "Rich in sugar", "They are tasty"], answer: 0, script: "they are rich in vitamins" },
          { q: "What helps build muscles?", options: ["Vitamins", "Protein", "Sugar", "Water"], answer: 1, script: "Fish and eggs provide protein that helps build our muscles" },
          { q: "How much water should we drink a day?", options: ["5 glasses", "8 glasses", "10 glasses", "3 glasses"], answer: 1, script: "about eight glasses a day" },
          { q: "What should we avoid?", options: ["Vegetables", "Junk food", "Water", "Fish"], answer: 1, script: "We should avoid eating too much junk food" }
        ],
        vocab: [
          { word: "diet", phonetic: "/ˈdaɪət/", meaning: "n. 饮食" },
          { word: "vitamin", phonetic: "/ˈvɪtəmɪn/", meaning: "n. 维生素" },
          { word: "protein", phonetic: "/ˈprəʊtiːn/", meaning: "n. 蛋白质" },
          { word: "muscle", phonetic: "/ˈmʌsl/", meaning: "n. 肌肉" },
          { word: "avoid", phonetic: "/əˈvɔɪd/", meaning: "v. 避免" },
          { word: "junk food", phonetic: "/dʒʌŋk fuːd/", meaning: "n. 垃圾食品" },
          { word: "habit", phonetic: "/ˈhæbɪt/", meaning: "n. 习惯" }
        ]
      },
      {
        id: 6, title: 'Career Planning 职业规划', level: '较难', speed: 'normal',
        passage: "When thinking about future careers, many students feel confused. The most important thing is to find out what you are really interested in. For example, if you love helping others, you might become a doctor or a teacher. If you are good at math and logic, engineering could be a good choice. It is also helpful to talk to people who work in different fields to learn about their daily work. Remember, no job is perfect, but if you keep learning and work hard, you will find a career that suits you. Never give up your dreams easily.",
        questions: [
          { q: "What is the most important thing in career planning?", options: ["Salary", "Interest", "Location", "Friends"], answer: 1, script: "The most important thing is to find out what you are really interested in" },
          { q: "What career suits someone who loves helping others?", options: ["Engineer", "Doctor", "Accountant", "Programmer"], answer: 1, script: "if you love helping others, you might become a doctor or a teacher" },
          { q: "What should you do to learn about jobs?", options: ["Stay home", "Talk to people in the field", "Read novels", "Watch TV"], answer: 1, script: "talk to people who work in different fields" },
          { q: "What should you never do?", options: ["Give up dreams", "Work hard", "Keep learning", "Ask questions"], answer: 0, script: "Never give up your dreams easily" }
        ],
        vocab: [
          { word: "career", phonetic: "/kəˈrɪə/", meaning: "n. 职业" },
          { word: "confused", phonetic: "/kənˈfjuːzd/", meaning: "adj. 困惑的" },
          { word: "logic", phonetic: "/ˈlɒdʒɪk/", meaning: "n. 逻辑" },
          { word: "engineering", phonetic: "/ˌendʒɪˈnɪərɪŋ/", meaning: "n. 工程" },
          { word: "field", phonetic: "/fiːld/", meaning: "n. 领域" },
          { word: "suit", phonetic: "/suːt/", meaning: "v. 适合" },
          { word: "dream", phonetic: "/driːm/", meaning: "n. 梦想" }
        ]
      }
    ],

    render: function () {
      var box = document.getElementById(this.containerId);
      if (!box) return;
      this.el = box;
      this.state.supported = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
      box.innerHTML = this.buildShell();
      this.cache();
      this.bindShell();
      this.renderMaterial();
    },

    buildShell: function () {
      var s = this, d = s.data;
      var opts = '';
      for (var i = 0; i < d.length; i++) {
        opts += "<option value='" + i + "'>" + (i + 1) + ". " + d[i].title + " [" + d[i].level + "]</option>";
      }
      return "<div style='font-family:sans-serif;color:#222;'>" +
        "<h3 style='margin:0 0 8px;color:#1aa84a;'>🎧 英语听力训练（Web Speech API 朗读）</h3>" +
        (s.state.supported ? '' : "<div style='color:#c00;background:#fff0f0;border:1px solid #f0c0c0;padding:6px;border-radius:6px;margin-bottom:8px;'>⚠ 当前浏览器不支持 speechSynthesis，朗读功能不可用。</div>") +
        "<div style='display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px;'>" +
          "<label>材料：<select id='el-mat' style='padding:4px;border-radius:5px;'>" + opts + "</select></label>" +
          "<label>语速：<select id='el-spd' style='padding:4px;border-radius:5px;'>" +
            "<option value='slow'>慢速 0.7x</option><option value='normal' selected>正常 1.0x</option><option value='fast'>快速 1.3x</option>" +
          "</select></label>" +
        "</div>" +
        "<div style='background:#f6fbf6;border:1px solid #d6ead6;border-radius:8px;padding:10px;margin-bottom:10px;'>" +
          "<div id='el-title' style='font-weight:bold;font-size:15px;color:#1aa84a;margin-bottom:6px;'></div>" +
          "<div style='display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;'>" +
            "<button id='el-play' style='padding:6px 14px;background:#1aa84a;color:#fff;border:none;border-radius:6px;cursor:pointer;'>▶ 播放全文</button>" +
            "<button id='el-pause' style='padding:6px 14px;background:#e8a900;color:#fff;border:none;border-radius:6px;cursor:pointer;'>⏸ 暂停/继续</button>" +
            "<button id='el-replay' style='padding:6px 14px;background:#2b6ce2;color:#fff;border:none;border-radius:6px;cursor:pointer;'>↺ 重播</button>" +
            "<button id='el-one' style='padding:6px 14px;background:#7c5cff;color:#fff;border:none;border-radius:6px;cursor:pointer;'>🔊 逐句播放</button>" +
            "<button id='el-prev' style='padding:6px 12px;background:#eee;border:1px solid #ccc;border-radius:6px;cursor:pointer;'>◀ 上一句</button>" +
            "<button id='el-next' style='padding:6px 12px;background:#eee;border:1px solid #ccc;border-radius:6px;cursor:pointer;'>下一句 ▶</button>" +
          "</div>" +
          "<div style='background:#fff;border:1px solid #e0e0e0;border-radius:5px;height:14px;overflow:hidden;'><div id='el-prog' style='width:0%;height:100%;background:linear-gradient(90deg,#1aa84a,#7c5cff);transition:width .2s;'></div></div>" +
          "<div id='el-cur' style='margin-top:6px;font-size:13px;color:#555;min-height:20px;'></div>" +
        "</div>" +
        "<div id='el-questions'></div>" +
        "<div style='margin:10px 0;'><button id='el-showorig' style='padding:6px 14px;background:#888;color:#fff;border:none;border-radius:6px;cursor:pointer;'>📜 显示原文</button></div>" +
        "<div id='el-orig' style='display:none;background:#fafafa;border:1px solid #eee;border-radius:8px;padding:12px;font-size:14px;line-height:1.9;'></div>" +
        "<div id='el-vocab'></div>" +
        "<div id='el-result' style='margin-top:10px;'></div>" +
      "</div>";
    },

    cache: function () {
      var r = this.refs, el = this.el;
      r.mat = el.querySelector('#el-mat');
      r.spd = el.querySelector('#el-spd');
      r.play = el.querySelector('#el-play');
      r.pause = el.querySelector('#el-pause');
      r.replay = el.querySelector('#el-replay');
      r.one = el.querySelector('#el-one');
      r.prev = el.querySelector('#el-prev');
      r.next = el.querySelector('#el-next');
      r.prog = el.querySelector('#el-prog');
      r.cur = el.querySelector('#el-cur');
      r.title = el.querySelector('#el-title');
      r.questions = el.querySelector('#el-questions');
      r.showorig = el.querySelector('#el-showorig');
      r.orig = el.querySelector('#el-orig');
      r.vocab = el.querySelector('#el-vocab');
      r.result = el.querySelector('#el-result');
    },

    bindShell: function () {
      var s = this, r = s.refs;
      r.mat.onchange = function () { s.cancel(); s.state.idx = parseInt(r.mat.value, 10); s.renderMaterial(); };
      r.spd.onchange = function () { s.state.speed = r.spd.value; };
      r.play.onclick = function () { s.playAll(); };
      r.pause.onclick = function () { s.togglePause(); };
      r.replay.onclick = function () { s.replay(); };
      r.one.onclick = function () { s.playOne(); };
      r.prev.onclick = function () { s.step(-1); };
      r.next.onclick = function () { s.step(1); };
      r.showorig.onclick = function () {
        if (r.orig.style.display === 'none') { r.orig.style.display = 'block'; r.showorig.textContent = '🙈 隐藏原文'; }
        else { r.orig.style.display = 'none'; r.showorig.textContent = '📜 显示原文'; }
      };
    },

    renderMaterial: function () {
      var s = this, m = s.data[s.state.idx];
      s.sentences = splitSentences(m.passage);
      s.state.cur = 0;
      s.refs.title.textContent = m.title + "  ·  难度：" + m.level;
      s.refs.cur.textContent = '准备就绪，点击「播放全文」开始。';
      s.refs.prog.style.width = '0%';
      var oh = '';
      for (var i = 0; i < s.sentences.length; i++) {
        oh += "<span id='el-s-" + i + "' style='display:inline;'>" + escapeHtml(s.sentences[i]) + " </span>";
      }
      s.refs.orig.innerHTML = oh;
      s.refs.orig.style.display = 'none';
      s.refs.showorig.textContent = '📜 显示原文';
      var qh = "<div style='background:#f4f7ff;border:1px solid #dde6ff;border-radius:8px;padding:12px;'>";
      qh += "<div style='font-weight:bold;margin-bottom:8px;color:#2b6ce2;'>📝 听力理解题</div>";
      for (var j = 0; j < m.questions.length; j++) {
        var q = m.questions[j];
        qh += "<div style='margin-bottom:10px;'><div style='font-size:13px;margin-bottom:4px;'>" + (j + 1) + ". " + escapeHtml(q.q) + "</div>";
        for (var k = 0; k < q.options.length; k++) {
          qh += "<label style='display:block;font-size:13px;margin-left:14px;cursor:pointer;'><input type='radio' name='elq-" + j + "' value='" + k + "' style='margin-right:4px;'>" + escapeHtml(q.options[k]) + "</label>";
        }
        qh += "</div>";
      }
      qh += "<button id='el-submit' style='padding:6px 16px;background:#2b6ce2;color:#fff;border:none;border-radius:6px;cursor:pointer;'>提交答案</button>";
      qh += "<span id='el-feedback' style='margin-left:10px;font-size:13px;'></span>";
      qh += "</div>";
      s.refs.questions.innerHTML = qh;
      s.refs.questions.querySelector('#el-submit').onclick = function () { s.submit(); };
      s.refs.result.innerHTML = '';
      var vh = "<div style='background:#fffaf0;border:1px solid #f0e0c0;border-radius:8px;padding:12px;margin-top:10px;'>";
      vh += "<div style='font-weight:bold;margin-bottom:6px;color:#b8860b;'>📖 生词表（点击单词朗读）</div>";
      for (var v = 0; v < m.vocab.length; v++) {
        var w = m.vocab[v];
        vh += "<div class='el-word' data-w='" + escapeHtml(w.word) + "' style='display:inline-block;margin:3px 8px 3px 0;padding:4px 10px;background:#fff;border:1px solid #e6d8b8;border-radius:14px;cursor:pointer;font-size:13px;'>" +
          "<b style='color:#b8860b;'>" + escapeHtml(w.word) + "</b> <span style='color:#999;'>" + w.phonetic + "</span> <span style='color:#555;'>" + escapeHtml(w.meaning) + "</span></div>";
      }
      vh += "</div>";
      s.refs.vocab.innerHTML = vh;
      var ws = s.refs.vocab.querySelectorAll('.el-word');
      for (var x = 0; x < ws.length; x++) {
        ws[x].onclick = function () { s.speak(this.getAttribute('data-w')); };
      }
    },

    speak: function (text, onend) {
      if (!this.state.supported) return;
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = this.rateMap[this.state.speed] || 1.0;
        if (onend) u.onend = onend;
        window.speechSynthesis.speak(u);
      } catch (err) {
        console.error('语音合成失败:', err);
      }
    },

    highlight: function (i) {
      var s = this;
      for (var k = 0; k < s.sentences.length; k++) {
        var sp = s.el.querySelector('#el-s-' + k);
        if (sp) { sp.style.background = ''; sp.style.borderRadius = ''; }
      }
      var cur = s.el.querySelector('#el-s-' + i);
      if (cur) { cur.style.background = '#fff3a0'; cur.style.borderRadius = '3px'; }
      s.state.cur = i;
      s.refs.cur.textContent = '▶ ' + s.sentences[i];
      s.refs.prog.style.width = (i / s.sentences.length * 100) + '%';
    },

    playAll: function () {
      var s = this;
      s.cancel();
      s.state.mode = 'all';
      s.speakIdx(0, true);
    },

    playOne: function () {
      var s = this;
      s.cancel();
      s.state.mode = 'one';
      s.speakIdx(s.state.cur, false);
    },

    speakIdx: function (i, chain) {
      var s = this;
      if (i < 0 || i >= s.sentences.length) return;
      s.highlight(i);
      s.speak(s.sentences[i], function () {
        if (chain && i + 1 < s.sentences.length) {
          s.speakIdx(i + 1, true);
        } else {
          s.refs.prog.style.width = '100%';
          s.refs.cur.textContent = '✓ 播放完毕';
        }
      });
    },

    step: function (dir) {
      var s = this;
      s.cancel();
      var n = s.state.cur + dir;
      if (n < 0) n = 0;
      if (n >= s.sentences.length) n = s.sentences.length - 1;
      s.speakIdx(n, false);
    },

    togglePause: function () {
      if (!this.state.supported) return;
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) window.speechSynthesis.pause();
      else if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    },

    replay: function () {
      this.cancel();
      this.state.cur = 0;
      this.playAll();
    },

    cancel: function () {
      if (this.state.supported) window.speechSynthesis.cancel();
    },

    submit: function () {
      var s = this, m = s.data[s.state.idx], correct = 0;
      for (var k = 0; k < s.sentences.length; k++) {
        var sp = s.el.querySelector('#el-s-' + k);
        if (sp && sp.style.background !== '#fff3a0') { sp.style.background = ''; }
      }
      var html = "<div style='margin-top:8px;'>";
      for (var j = 0; j < m.questions.length; j++) {
        var q = m.questions[j];
        var chosen = null;
        var radios = s.refs.questions.querySelectorAll("input[name='elq-" + j + "']");
        for (var r = 0; r < radios.length; r++) if (radios[r].checked) chosen = parseInt(radios[r].value, 10);
        if (chosen === q.answer) {
          correct++;
          html += "<div style='color:#1aa84a;'>第" + (j + 1) + "题 ✓ 正确</div>";
        } else {
          html += "<div style='color:#e23b3b;'>第" + (j + 1) + "题 ✗ 正确答案：" + q.options[q.answer] + " ｜你选：" + (chosen === null ? '未答' : q.options[chosen]) + "</div>";
          var si = s.findSentence(q.script);
          if (si >= 0) {
            var span = s.el.querySelector('#el-s-' + si);
            if (span) { span.style.background = '#ffd0d0'; span.style.borderRadius = '3px'; }
          }
        }
      }
      var rate = Math.round(correct / m.questions.length * 100);
      html = "<div style='font-weight:bold;color:" + (rate >= 80 ? '#1aa84a' : (rate >= 60 ? '#e8a900' : '#e23b3b')) + ";'>正确率：" + correct + "/" + m.questions.length + "（" + rate + "%）</div>" + html;
      html += "</div>";
      s.refs.result.innerHTML = html;
      s.refs.orig.style.display = 'block';
      s.refs.showorig.textContent = '🙈 隐藏原文';
      s.el.querySelector('#el-feedback').textContent = '';
    },

    findSentence: function (script) {
      var s = this, t = script.toLowerCase().replace(/[^a-z0-9 ]/g, '');
      for (var i = 0; i < s.sentences.length; i++) {
        var ss = s.sentences[i].toLowerCase().replace(/[^a-z0-9 ]/g, '');
        if (ss.indexOf(t) >= 0 || t.indexOf(ss) >= 0) return i;
      }
      return -1;
    }
  };

  // ============================================================
  // 模块3: englishCloze 英语完形填空训练
  // ============================================================
  var englishCloze = {
    containerId: 'english-cloze-app',
    state: { current: 0, answers: {} },
    el: null,
    refs: {},
    data: [
      {
        id: 1, title: 'A Story of Perseverance', topic: '坚持的故事', difficulty: 2, focus: '动词辨析',
        text: "Tom dreamed of becoming a great runner. One day, he ___1___ to join the school running team. Every morning, he ___2___ at five and ran along the river. Sometimes his legs hurt badly, but he ___3___ running. His coach often ___4___ him, 'Never give up.' On the sports day, Tom ___5___ his best and won the race. He finally ___6___ that perseverance brings success.",
        blanks: [
          { index: 1, options: ["decided", "refused", "forgot", "pretended"], answer: 0, analysis: "decided to do sth 决定做某事，符合他想加入校队、积极努力的语境。", wrongAnalysis: "refused（拒绝）、forgot（忘记）、pretended（假装）均与上下文积极向上的语境相悖。" },
          { index: 2, options: ["got up", "gave up", "took up", "put up"], answer: 0, analysis: "got up 起床，与 every morning at five 呼应。", wrongAnalysis: "gave up 放弃；took up 开始从事；put up 张贴/举起，均不合清晨跑步语境。" },
          { index: 3, options: ["continued", "stopped", "avoided", "enjoyed"], answer: 0, analysis: "continued running 继续跑，体现转折后仍坚持。", wrongAnalysis: "stopped 停止、avoided 避免与转折语境矛盾；enjoyed 虽可，但与 legs hurt 的转折关系不符。" },
          { index: 4, options: ["encouraged", "warned", "punished", "blamed"], answer: 0, analysis: "encouraged 鼓励，与引语 'Never give up.' 呼应。", wrongAnalysis: "warned 警告、punished 惩罚、blamed 责备，均与教练正面形象不符。" },
          { index: 5, options: ["did", "made", "took", "had"], answer: 0, analysis: "do one's best 尽某人最大努力，固定搭配。", wrongAnalysis: "make/take/have 均不与 one's best 搭配表'尽力'。" },
          { index: 6, options: ["realized", "doubted", "denied", "wondered"], answer: 0, analysis: "realized 意识到/领悟到道理。", wrongAnalysis: "doubted 怀疑、denied 否认、wondered 想知道，均与'最终领悟成功'的语境不符。" }
        ]
      },
      {
        id: 2, title: 'The Power of Kindness', topic: '善良的力量', difficulty: 1, focus: '名词辨析',
        text: "One rainy afternoon, an old man was walking slowly on the street. A young girl saw him and offered her ___1___. The old man felt warm in his ___2___. In fact, a small act of ___3___ can change someone's day. The girl didn't ask for any ___4___. She just believed that ___5___ is the most beautiful language in the world. Years later, the old man still remembered that ___6___ with a smile.",
        blanks: [
          { index: 1, options: ["umbrella", "book", "phone", "money"], answer: 0, analysis: "rainy afternoon 雨天语境，offer umbrella 递雨伞最合理。", wrongAnalysis: "book 书、phone 手机、money 钱都与雨天帮助语境无关。" },
          { index: 2, options: ["heart", "pocket", "hand", "car"], answer: 0, analysis: "felt warm in his heart 内心感到温暖，固定表达。", wrongAnalysis: "pocket 口袋、hand 手、car 车不合此处情感表达。" },
          { index: 3, options: ["kindness", "sadness", "darkness", "illness"], answer: 0, analysis: "act of kindness 善举，点题。", wrongAnalysis: "sadness 悲伤、darkness 黑暗、illness 疾病，均与善举主题相反。" },
          { index: 4, options: ["reward", "advice", "reason", "price"], answer: 0, analysis: "ask for reward 索要回报，与不求回报呼应。", wrongAnalysis: "advice 建议、reason 理由、price 价格，均不合'不计回报'语境。" },
          { index: 5, options: ["love", "anger", "fear", "pride"], answer: 0, analysis: "love is the most beautiful language 爱是最美的语言。", wrongAnalysis: "anger 愤怒、fear 恐惧、pride 骄傲，与美好语言意境不符。" },
          { index: 6, options: ["moment", "problem", "danger", "mistake"], answer: 0, analysis: "remembered that moment 记得那个时刻。", wrongAnalysis: "problem 问题、danger 危险、mistake 错误，与微笑回忆意境矛盾。" }
        ]
      },
      {
        id: 3, title: 'A Journey to Self-Discovery', topic: '自我发现', difficulty: 2, focus: '形容词辨析',
        text: "When Lucy was young, she was very ___1___ and afraid to speak in public. Her mother told her to be ___2___ and believe in herself. Lucy started to join clubs and became more ___3___. She found that she was ___4___ at telling stories. Her teacher said she was a ___5___ student. Now Lucy is ___6___ enough to give speeches to hundreds of people.",
        blanks: [
          { index: 1, options: ["shy", "brave", "calm", "proud"], answer: 0, analysis: "shy 害羞，与 afraid to speak 呼应。", wrongAnalysis: "brave 勇敢、calm 冷静、proud 骄傲，与'怕当众说话'矛盾。" },
          { index: 2, options: ["confident", "careless", "nervous", "lazy"], answer: 0, analysis: "confident 自信，与 believe in herself 呼应。", wrongAnalysis: "careless 粗心、nervous 紧张、lazy 懒惰，均与鼓励语境不符。" },
          { index: 3, options: ["active", "silent", "afraid", "sleepy"], answer: 0, analysis: "active 活跃，加入社团后变得活跃。", wrongAnalysis: "silent 沉默、afraid 害怕、sleepy 困倦，与成长变化方向相反。" },
          { index: 4, options: ["good", "bad", "poor", "slow"], answer: 0, analysis: "be good at 擅长，固定搭配。", wrongAnalysis: "bad/poor/slow at 均表不擅长，与发现特长矛盾。" },
          { index: 5, options: ["gifted", "weak", "common", "dull"], answer: 0, analysis: "gifted 有天赋的，老师夸奖学生。", wrongAnalysis: "weak 弱、common 普通、dull 迟钝，与夸奖语境矛盾。" },
          { index: 6, options: ["brave", "weak", "shy", "tired"], answer: 0, analysis: "brave enough 足够勇敢，能做演讲。", wrongAnalysis: "weak 弱、shy 害羞、tired 累，均与'对数百人演讲'矛盾。" }
        ]
      },
      {
        id: 4, title: 'Technology Changes Life', topic: '科技改变生活', difficulty: 2, focus: '连词/介词',
        text: "Smart phones have changed our life a lot. ___1___ the help of them, we can do many things easily. We can chat with friends ___2___ the Internet. However, spending too much time on phones is bad ___3___ our eyes. We should put down our phones ___4___ we are having meals. ___5___ playing outside is healthier than playing games on the phone. Let's use technology wisely ___6___ a better life.",
        blanks: [
          { index: 1, options: ["With", "By", "In", "For"], answer: 0, analysis: "with the help of 在……帮助下，固定搭配。", wrongAnalysis: "by/in/for 均不与 the help of 搭配表此意。" },
          { index: 2, options: ["on", "in", "at", "of"], answer: 0, analysis: "on the Internet 在网上，固定搭配。", wrongAnalysis: "in/at/of 均不与 Internet 搭配。" },
          { index: 3, options: ["for", "to", "with", "at"], answer: 0, analysis: "be bad for 对……有害，固定搭配。", wrongAnalysis: "to/with/at 不与 bad 搭配表'对……有害'。" },
          { index: 4, options: ["when", "unless", "although", "because"], answer: 0, analysis: "when 当……时，吃饭时应放下手机。", wrongAnalysis: "unless 除非、although 虽然、because 因为，逻辑不通。" },
          { index: 5, options: ["Besides", "However", "Although", "Because"], answer: 0, analysis: "Besides 此外（递进），补充说明户外更健康。", wrongAnalysis: "However 然而（转折）、Although 虽然、Because 因为，逻辑不符。" },
          { index: 6, options: ["for", "of", "to", "with"], answer: 0, analysis: "for a better life 为了更好的生活，表目的。", wrongAnalysis: "of/to/with 不表此处目的。" }
        ]
      },
      {
        id: 5, title: 'The Meaning of Friendship', topic: '友谊的意义', difficulty: 3, focus: '动词短语',
        text: "True friends are hard to find. When you are in trouble, a real friend will ___1___ you. They never ___2___ you when you make mistakes. Instead, they help you ___3___ the problems. A good friend can ___4___ your secrets and never tells others. Sometimes friends may ___5___, but they will soon make up. Remember to ___6___ your friends when they need you.",
        blanks: [
          { index: 1, options: ["stand by", "stand up", "stand for", "stand out"], answer: 0, analysis: "stand by 支持/站在身边，朋友支持你。", wrongAnalysis: "stand up 起立、stand for 代表、stand out 突出，均不合'困境中支持'。" },
          { index: 2, options: ["laugh at", "look at", "shout at", "point at"], answer: 0, analysis: "laugh at 嘲笑，朋友不会嘲笑你的错误。", wrongAnalysis: "look at 看、shout at 吼、point at 指，均非'嘲笑'含义。" },
          { index: 3, options: ["work out", "give out", "run out", "find out"], answer: 0, analysis: "work out 解决（问题），固定搭配。", wrongAnalysis: "give out 分发、run out 用完、find out 查出，不合'解决问题'。" },
          { index: 4, options: ["keep", "tell", "spread", "hide"], answer: 0, analysis: "keep secrets 保守秘密，固定搭配。", wrongAnalysis: "tell 告诉、spread 散布、hide 隐藏，与'不告诉他人'矛盾或不当。" },
          { index: 5, options: ["argue", "agree", "smile", "nod"], answer: 0, analysis: "argue 争吵，与 but make up 转折呼应。", wrongAnalysis: "agree 同意、smile 微笑、nod 点头，无需 make up 和好。" },
          { index: 6, options: ["look after", "look like", "look for", "look at"], answer: 0, analysis: "look after 照顾，朋友需要时照顾他们。", wrongAnalysis: "look like 看起来像、look for 寻找、look at 看，不合'照顾'。" }
        ]
      },
      {
        id: 6, title: 'Overcoming Challenges', topic: '克服挑战', difficulty: 2, focus: '综合',
        text: "Life is full of ___1___. When we face difficulties, we should not run away. Instead, we should face them ___2___. Last year, I failed an important exam. I felt very ___3___. But my mother told me that failure is the mother of ___4___. I ___5___ hard and tried again. Finally, I ___6___ the exam. I learned that we grow stronger ___7___ we overcome challenges.",
        blanks: [
          { index: 1, options: ["challenges", "chances", "choices", "changes"], answer: 0, analysis: "full of challenges 充满挑战，点题。", wrongAnalysis: "chances 机会、choices 选择、changes 变化，与下文'面对困难'不符。" },
          { index: 2, options: ["bravely", "shyly", "sadly", "lazily"], answer: 0, analysis: "bravely 勇敢地面对困难。", wrongAnalysis: "shyly 害羞、sadly 悲伤、lazily 懒惰，均与'不应逃避'矛盾。" },
          { index: 3, options: ["sad", "glad", "proud", "calm"], answer: 0, analysis: "failed exam 所以感到悲伤。", wrongAnalysis: "glad 高兴、proud 骄傲、calm 冷静，与失败语境矛盾。" },
          { index: 4, options: ["success", "failure", "luck", "money"], answer: 0, analysis: "failure is the mother of success 失败乃成功之母，谚语。", wrongAnalysis: "failure 本身、luck 运气、money 钱，不合谚语。" },
          { index: 5, options: ["studied", "played", "slept", "cried"], answer: 0, analysis: "studied hard 努力学习。", wrongAnalysis: "played 玩、slept 睡、cried 哭，与'再试一次'矛盾。" },
          { index: 6, options: ["passed", "failed", "missed", "left"], answer: 0, analysis: "passed the exam 通过考试。", wrongAnalysis: "failed 失败、missed 错过、left 离开，与 finally 呼应矛盾。" },
          { index: 7, options: ["when", "unless", "because", "although"], answer: 0, analysis: "when 当……时，克服挑战时变得更强。", wrongAnalysis: "unless 除非、because 因为、although 虽然，逻辑不通。" }
        ]
      },
      {
        id: 7, title: 'A Lesson from Nature', topic: '自然的启示', difficulty: 1, focus: '词义辨析',
        text: "Nature is a great ___1___. We can learn a lot from it. For example, ants work together to ___2___ food for winter. They teach us the importance of ___3___. Bamboo grows slowly but it is very ___4___. It teaches us to be strong in ___5___. A small seed can grow into a big tree ___6___. This tells us that small things can make a big ___7___.",
        blanks: [
          { index: 1, options: ["teacher", "student", "enemy", "stranger"], answer: 0, analysis: "nature is a great teacher 自然是伟大的老师。", wrongAnalysis: "student 学生、enemy 敌人、stranger 陌生人，与'向我们学习'矛盾。" },
          { index: 2, options: ["collect", "waste", "refuse", "drop"], answer: 0, analysis: "collect food 收集食物过冬。", wrongAnalysis: "waste 浪费、refuse 拒绝、drop 丢弃，与蚂蚁储备矛盾。" },
          { index: 3, options: ["teamwork", "loneliness", "laziness", "selfishness"], answer: 0, analysis: "ants work together → teamwork 合作。", wrongAnalysis: "loneliness 孤独、laziness 懒惰、selfishness 自私，与协作相反。" },
          { index: 4, options: ["strong", "weak", "soft", "empty"], answer: 0, analysis: "bamboo strong 竹子坚韧。", wrongAnalysis: "weak 弱、soft 软、empty 空，与'坚韧启示'矛盾。" },
          { index: 5, options: ["difficulty", "happiness", "peace", "silence"], answer: 0, analysis: "be strong in difficulty 困难中坚强。", wrongAnalysis: "happiness 快乐、peace 和平、silence 沉默，与'坚强面对'不符。" },
          { index: 6, options: ["finally", "never", "suddenly", "hardly"], answer: 0, analysis: "finally 最终长成大树。", wrongAnalysis: "never 从不、suddenly 突然、hardly 几乎不，与成长规律矛盾。" },
          { index: 7, options: ["difference", "mistake", "problem", "noise"], answer: 0, analysis: "make a big difference 产生重大影响，固定搭配。", wrongAnalysis: "mistake 错误、problem 问题、noise 噪音，不合'积极影响'。" }
        ]
      },
      {
        id: 8, title: 'The Gift of Giving', topic: '给予的礼物', difficulty: 2, focus: '综合',
        text: "On her birthday, Emma didn't ask for ___1___. Instead, she decided to give something to others. She ___2___ her old books to a poor village. She also ___3___ some cookies for her classmates. Her friends were ___4___ and thanked her. Emma felt much ___5___ than before. She ___6___ that giving brings more happiness than receiving. From then on, she ___7___ to help others every month.",
        blanks: [
          { index: 1, options: ["gifts", "money", "food", "advice"], answer: 0, analysis: "ask for gifts 要礼物，生日语境。", wrongAnalysis: "money 钱、food 食物、advice 建议，与生日要礼物语境不符。" },
          { index: 2, options: ["gave", "sold", "threw", "hid"], answer: 0, analysis: "gave books to 捐赠，体现给予。", wrongAnalysis: "sold 卖、threw 扔、hid 藏，与'给予'主题矛盾。" },
          { index: 3, options: ["baked", "fried", "boiled", "burned"], answer: 0, analysis: "baked cookies 烤饼干，固定搭配。", wrongAnalysis: "fried 炸、boiled 煮、burned 烧焦，不合饼干制作。" },
          { index: 4, options: ["surprised", "bored", "angry", "tired"], answer: 0, analysis: "surprised 惊喜，收到饼干感谢。", wrongAnalysis: "bored 无聊、angry 生气、tired 累，与感谢矛盾。" },
          { index: 5, options: ["happier", "sadder", "busier", "weaker"], answer: 0, analysis: "happier 更快乐，给予带来快乐。", wrongAnalysis: "sadder 更悲伤、busier 更忙、weaker 更弱，与快乐主题矛盾。" },
          { index: 6, options: ["realized", "forgot", "doubted", "imagined"], answer: 0, analysis: "realized 意识到，领悟道理。", wrongAnalysis: "forgot 忘记、doubted 怀疑、imagined 想象，与领悟矛盾。" },
          { index: 7, options: ["planned", "refused", "stopped", "hated"], answer: 0, analysis: "planned to 计划做，固定搭配。", wrongAnalysis: "refused 拒绝、stopped 停止、hated 讨厌，与'每月帮助'矛盾。" }
        ]
      }
    ],

    render: function () {
      var box = document.getElementById(this.containerId);
      if (!box) return;
      this.el = box;
      box.innerHTML = this.build();
      this.cache();
      this.bind();
      this.renderPassage();
      this.updateStats();
    },

    build: function () {
      var s = this, d = s.data;
      var list = '';
      for (var i = 0; i < d.length; i++) {
        list += "<div class='clz-item' data-i='" + i + "' style='padding:8px 10px;margin-bottom:6px;background:#f7f9fc;border:1px solid #e3e8f0;border-radius:6px;cursor:pointer;font-size:13px;'>" +
          "<div style='font-weight:bold;color:#333;'>" + (i + 1) + ". " + escapeHtml(d[i].title) + "</div>" +
          "<div style='color:#e8a900;font-size:12px;'>" + stars(d[i].difficulty) + "</div>" +
          "<div style='color:#888;font-size:12px;'>" + escapeHtml(d[i].topic) + " · " + escapeHtml(d[i].focus) + "</div>" +
        "</div>";
      }
      return "<div style='font-family:sans-serif;color:#222;'>" +
        "<h3 style='margin:0 0 8px;color:#7c5cff;'>✏️ 英语完形填空训练</h3>" +
        "<div style='display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;'>" +
          "<div style='width:230px;flex-shrink:0;'>" +
            "<div style='font-weight:bold;margin-bottom:8px;color:#555;'>篇目列表</div>" + list +
          "</div>" +
          "<div style='flex:1;min-width:320px;'>" +
            "<div id='clz-title' style='font-weight:bold;font-size:15px;color:#7c5cff;margin-bottom:6px;'></div>" +
            "<div id='clz-text' style='background:#fafafa;border:1px solid #eee;border-radius:8px;padding:14px;font-size:14px;line-height:2;'></div>" +
            "<div id='clz-score' style='margin-top:8px;font-size:13px;'></div>" +
          "</div>" +
          "<div style='width:280px;flex-shrink:0;'>" +
            "<div style='font-weight:bold;margin-bottom:8px;color:#555;'>解析面板</div>" +
            "<div id='clz-analysis' style='background:#fffaf0;border:1px solid #f0e0c0;border-radius:8px;padding:12px;font-size:13px;line-height:1.7;min-height:120px;'>选择选项后查看当前空格的解析。</div>" +
          "</div>" +
        "</div>" +
        "<div id='clz-stats' style='margin-top:12px;padding:10px;background:#f4f7ff;border:1px solid #dde6ff;border-radius:8px;font-size:13px;'></div>" +
      "</div>";
    },

    cache: function () {
      var r = this.refs, el = this.el;
      r.title = el.querySelector('#clz-title');
      r.text = el.querySelector('#clz-text');
      r.score = el.querySelector('#clz-score');
      r.analysis = el.querySelector('#clz-analysis');
      r.stats = el.querySelector('#clz-stats');
    },

    bind: function () {
      var s = this;
      var items = s.el.querySelectorAll('.clz-item');
      for (var i = 0; i < items.length; i++) {
        items[i].onclick = function () {
          s.state.current = parseInt(this.getAttribute('data-i'), 10);
          s.renderPassage();
        };
      }
    },

    parseText: function (text) {
      var parts = [], re = /___(\d+)___/g, last = 0, m;
      while ((m = re.exec(text))) {
        if (m.index > last) parts.push({ t: 'text', v: text.slice(last, m.index) });
        parts.push({ t: 'blank', i: parseInt(m[1], 10) });
        last = m.index + m[0].length;
      }
      if (last < text.length) parts.push({ t: 'text', v: text.slice(last) });
      return parts;
    },

    renderPassage: function () {
      var s = this, p = s.data[s.state.current];
      var blanks = {};
      for (var b = 0; b < p.blanks.length; b++) blanks[p.blanks[b].index] = p.blanks[b];
      s.refs.title.textContent = p.title + "  ·  " + p.topic + "  ·  " + p.focus + "  ·  " + stars(p.difficulty);
      var parts = s.parseText(p.text);
      var html = '';
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (part.t === 'text') {
          html += escapeHtml(part.v);
        } else {
          var bl = blanks[part.i];
          var saved = s.state.answers[p.id] && s.state.answers[p.id][part.i];
          var opts = "<option value=''>＿" + part.i + "＿</option>";
          for (var k = 0; k < bl.options.length; k++) opts += "<option value='" + k + "'>" + escapeHtml(bl.options[k]) + "</option>";
          var style = "padding:2px 6px;border-radius:5px;border:1px solid #bbb;font-size:13px;";
          var mark = '';
          if (saved) {
            if (saved.correct) { style += "border-color:#1aa84a;background:#eafbea;color:#1aa84a;font-weight:bold;"; mark = " ✓"; }
            else { style += "border-color:#e23b3b;background:#fdeaea;color:#e23b3b;font-weight:bold;"; mark = " ✗"; }
          }
          html += "<select class='clz-sel' data-blank='" + part.i + "' style='" + style + "'>" + opts + "</select>" +
            "<span class='clz-mark' data-blank='" + part.i + "' style='font-weight:bold;'>" + mark + "</span>";
        }
      }
      s.refs.text.innerHTML = html;
      var sels = s.refs.text.querySelectorAll('.clz-sel');
      for (var j = 0; j < sels.length; j++) {
        var bi = parseInt(sels[j].getAttribute('data-blank'), 10);
        var sv = s.state.answers[p.id] && s.state.answers[p.id][bi];
        if (sv) sels[j].value = sv.value;
        sels[j].onchange = (function (sel, idx) {
          return function () { s.onSelect(idx, parseInt(sel.value, 10)); };
        })(sels[j], bi);
      }
      s.updateScore();
      s.refs.analysis.innerHTML = "选择选项后查看当前空格的解析。";
    },

    onSelect: function (blankIdx, val) {
      var s = this, p = s.data[s.state.current], bl = null;
      for (var i = 0; i < p.blanks.length; i++) { if (p.blanks[i].index === blankIdx) { bl = p.blanks[i]; break; } }
      if (!bl || val === '' || isNaN(val)) return;
      var correct = (val === bl.answer);
      if (!s.state.answers[p.id]) s.state.answers[p.id] = {};
      s.state.answers[p.id][blankIdx] = { value: val, correct: correct };
      var sel = s.refs.text.querySelector("select.clz-sel[data-blank='" + blankIdx + "']");
      var mark = s.refs.text.querySelector("span.clz-mark[data-blank='" + blankIdx + "']");
      if (sel) {
        sel.style.borderColor = correct ? '#1aa84a' : '#e23b3b';
        sel.style.background = correct ? '#eafbea' : '#fdeaea';
        sel.style.color = correct ? '#1aa84a' : '#e23b3b';
        sel.style.fontWeight = 'bold';
      }
      if (mark) mark.innerHTML = correct ? "<span style='color:#1aa84a;'> ✓</span>" : "<span style='color:#e23b3b;'> ✗</span>";
      var chosenText = bl.options[val];
      var ansText = bl.options[bl.answer];
      s.refs.analysis.innerHTML =
        "<div style='margin-bottom:6px;'><b>第" + blankIdx + "空</b></div>" +
        "<div style='margin-bottom:6px;'>" + (correct ? "<span style='color:#1aa84a;'>✓ 回答正确</span>" : "<span style='color:#e23b3b;'>✗ 回答错误</span>") + "</div>" +
        "<div style='margin-bottom:6px;'>正确答案：<b style='color:#1aa84a;'>" + escapeHtml(ansText) + "</b>" + (correct ? "" : "（你选：" + escapeHtml(chosenText) + "）") + "</div>" +
        "<div style='margin-bottom:6px;'><b>选择理由：</b>" + escapeHtml(bl.analysis) + "</div>" +
        "<div><b>错误选项分析：</b>" + escapeHtml(bl.wrongAnalysis) + "</div>";
      s.updateScore();
      s.updateStats();
    },

    updateScore: function () {
      var s = this, p = s.data[s.state.current], ans = s.state.answers[p.id] || {};
      var done = 0, correct = 0;
      for (var i = 0; i < p.blanks.length; i++) {
        var a = ans[p.blanks[i].index];
        if (a) { done++; if (a.correct) correct++; }
      }
      if (done === p.blanks.length) {
        var rate = Math.round(correct / p.blanks.length * 100);
        s.refs.score.innerHTML = "<span style='color:" + (rate >= 80 ? '#1aa84a' : (rate >= 60 ? '#e8a900' : '#e23b3b')) + ";font-weight:bold;'>本篇完成！得分：" + correct + "/" + p.blanks.length + "（" + rate + "%）</span>";
      } else {
        s.refs.score.innerHTML = "进度：" + done + "/" + p.blanks.length + " 已作答";
      }
    },

    updateStats: function () {
      var s = this, d = s.data, completed = 0, totalCorrect = 0, totalBlanks = 0;
      for (var i = 0; i < d.length; i++) {
        var ans = s.state.answers[d[i].id] || {};
        var allDone = true, corr = 0;
        for (var j = 0; j < d[i].blanks.length; j++) {
          var a = ans[d[i].blanks[j].index];
          if (!a) allDone = false;
          else if (a.correct) corr++;
        }
        if (allDone && d[i].blanks.length > 0) {
          completed++;
          totalCorrect += corr;
          totalBlanks += d[i].blanks.length;
        }
      }
      var avg = totalBlanks ? Math.round(totalCorrect / totalBlanks * 100) : 0;
      s.refs.stats.innerHTML = "📊 进度统计：已完成篇目 <b>" + completed + "/" + d.length + "</b>　|　平均正确率 <b style='color:" + (avg >= 80 ? '#1aa84a' : (avg >= 60 ? '#e8a900' : '#e23b3b')) + ";'>" + avg + "%</b>" +
        (completed === d.length ? "　🎉 全部完成！" : "");
    }
  };

  // ===================== 暴露到 window =====================
  window.trigUnitCircle = trigUnitCircle;
  window.englishListening = englishListening;
  window.englishCloze = englishCloze;
})();

// 数据分析增强 - 错题报告+时间管理+分数线可视化
(function (global) {

  // ============ 通用工具 ============
  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function getStore(key, def) {
    try {
      var v = localStorage.getItem(key);
      if (!v) return def;
      return JSON.parse(v);
    } catch (e) { return def; }
  }
  function pad2(n) { return ('0' + n).slice(-2); }
  function fmtDate(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function parseDate(s) {
    if (!s) return null;
    if (s instanceof Date) return s;
    if (typeof s === 'number') return new Date(s);
    var str = String(s);
    var m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
    var d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }
  function daysAgo(n) {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return d;
  }
  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function fmtDuration(sec) {
    sec = sec || 0;
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    if (h > 0) return h + '时' + m + '分';
    return m + '分';
  }
  function heatColor(rate) {
    if (rate < 30) return '#4caf50';
    if (rate < 50) return '#ffeb3b';
    if (rate < 70) return '#ff9800';
    return '#f44336';
  }
  function pieSVG(data, size, r) {
    var cx = size / 2, cy = size / 2, total = 0, i;
    for (i = 0; i < data.length; i++) total += data[i].value;
    if (total <= 0) return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#eee" stroke="#ccc"/>';
    var start = -Math.PI / 2, html = '';
    for (i = 0; i < data.length; i++) {
      var val = data[i].value;
      if (val <= 0) continue;
      var angle = (val / total) * Math.PI * 2;
      var end = start + angle;
      var x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
      var x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
      var large = angle > Math.PI ? 1 : 0;
      html += '<path d="M' + cx + ',' + cy + ' L' + x1.toFixed(2) + ',' + y1.toFixed(2) +
        ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' + x2.toFixed(2) + ',' + y2.toFixed(2) +
        ' Z" fill="' + data[i].color + '" stroke="#fff" stroke-width="1.5">' +
        '<title>' + esc(data[i].label) + ': ' + val + ' (' + (val / total * 100).toFixed(1) + '%)</title></path>';
      start = end;
    }
    return html;
  }
  function printHTML(html) {
    var w = window.open('', '_blank');
    if (!w) { alert('请允许弹出窗口以打印报告'); return; }
    w.document.write('<html><head><meta charset="utf-8"><title>分析报告</title><style>' +
      'body{font-family:"Microsoft YaHei",sans-serif;padding:24px;color:#222;line-height:1.6}' +
      'h2{color:#2c3e50;border-bottom:2px solid #3498db;padding-bottom:8px}h4{color:#34495e;margin-top:18px}' +
      'svg{max-width:100%}</style></head><body>' + html + '</body></html>');
    w.document.close();
    w.focus();
    setTimeout(function () { w.print(); }, 300);
  }

  var SUBJECTS = [
    { key: 'chinese', name: '语文', chapters: ['现代文阅读', '文言文', '古诗鉴赏', '语言运用', '作文'] },
    { key: 'math', name: '数学', chapters: ['函数', '导数', '数列', '三角函数', '立体几何', '解析几何', '概率统计'] },
    { key: 'english', name: '英语', chapters: ['听力', '阅读', '完形填空', '语法填空', '写作'] },
    { key: 'physics', name: '物理', chapters: ['力学', '电磁学', '热学', '光学', '近代物理'] },
    { key: 'chemistry', name: '化学', chapters: ['化学原理', '物质结构', '化学反应', '有机化学', '实验'] },
    { key: 'biology', name: '生物', chapters: ['细胞', '遗传', '进化', '生态', '稳态'] }
  ];
  function subjectName(key) {
    for (var i = 0; i < SUBJECTS.length; i++) if (SUBJECTS[i].key === key) return SUBJECTS[i].name;
    return key || '未知';
  }
  function inferErrorType(rec) {
    var t = rec.errorType || rec.type || rec.reason || '';
    if (t) {
      if (t.indexOf('粗心') >= 0 || t.indexOf('失误') >= 0) return '粗心失误';
      if (t.indexOf('盲') >= 0 || t.indexOf('不会') >= 0) return '知识盲区';
      if (t.indexOf('审题') >= 0 || t.indexOf('看错') >= 0) return '审题失误';
      if (t.indexOf('计算') >= 0) return '计算错误';
    }
    var diff = rec.difficulty;
    if (diff === 'easy' || diff === 1 || diff === '简单') return '粗心失误';
    if (diff === 'hard' || diff === 3 || diff === '难') return '知识盲区';
    if (rec.subject === 'math' || rec.subject === 'physics') return '计算错误';
    if (rec.subject === 'chinese' || rec.subject === 'english') return '审题失误';
    return '粗心失误';
  }

  // ============ 模块1: errorAnalysisReport ============
  var errorAnalysisReport = {
    containerId: 'error-analysis-report-app',
    timeRange: '30',
    data: null,
    render: function () {
      var el = document.getElementById(this.containerId);
      if (!el) return;
      el.innerHTML = this._shell();
      var self = this;
      var sel = el.querySelector('#ear-range');
      if (sel) { sel.value = this.timeRange; sel.onchange = function () { self.timeRange = this.value; }; }
      var btn = el.querySelector('#ear-gen');
      if (btn) btn.onclick = function () { self._generate(); };
      var printBtn = el.querySelector('#ear-print');
      if (printBtn) printBtn.onclick = function () { self._print(); };
      this._generate();
    },
    _shell: function () {
      var s = '<div style="font-family:sans-serif;background:#f5f7fa;border-radius:10px;padding:16px;color:#222;">';
      s += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">';
      s += '<h3 style="margin:0;color:#2c3e50;font-size:18px;">错题智能分析报告</h3>';
      s += '<div style="display:flex;gap:8px;align-items:center;">';
      s += '<select id="ear-range" style="padding:6px 10px;border:1px solid #ccc;border-radius:6px;background:#fff;">';
      s += '<option value="7">近7天</option><option value="30">近30天</option><option value="all">全部</option></select>';
      s += '<button id="ear-gen" style="padding:6px 14px;background:#3498db;color:#fff;border:none;border-radius:6px;cursor:pointer;">生成报告</button>';
      s += '</div></div>';
      s += '<div id="ear-body">正在生成分析报告...</div>';
      s += '<div style="margin-top:14px;text-align:right;">';
      s += '<button id="ear-print" style="padding:8px 18px;background:#27ae60;color:#fff;border:none;border-radius:6px;cursor:pointer;">打印报告</button>';
      s += '</div></div>';
      return s;
    },
    _load: function () {
      var wrong = getStore('hspcb_wrong_records', []);
      var quiz = getStore('hspcb_quiz_records', []);
      if (!wrong || !wrong.length) wrong = [];
      if (!quiz || !quiz.length) quiz = [];
      return { wrong: wrong, quiz: quiz };
    },
    _filterByRange: function (arr) {
      if (this.timeRange === 'all') return arr.slice(0);
      var n = parseInt(this.timeRange, 10);
      var cutoff = daysAgo(n);
      var out = [];
      for (var i = 0; i < arr.length; i++) {
        var d = parseDate(arr[i].date || arr[i].time || arr[i].createTime || arr[i].createdAt);
        if (!d) continue;
        if (d.getTime() >= cutoff.getTime()) out.push(arr[i]);
      }
      return out;
    },
    _generate: function () {
      var body = document.getElementById('ear-body');
      if (!body) return;
      var loaded = this._load();
      var wrong = this._filterByRange(loaded.wrong);
      var quiz = this._filterByRange(loaded.quiz);
      this.data = this._analyze(wrong, quiz);
      body.innerHTML = this._renderReport();
    },
    _analyze: function (wrong, quiz) {
      var i, j;
      var chapMap = {};
      for (i = 0; i < quiz.length; i++) {
        var q = quiz[i];
        var subj = q.subject || q.subj || '';
        var chap = q.chapter || q.topic || q.unit || '其他';
        var key = subj + '|' + chap;
        if (!chapMap[key]) chapMap[key] = { subject: subj, chapter: chap, wrong: 0, total: 0 };
        var total = q.total || 0;
        var wrongN = q.wrong != null ? q.wrong : (total - (q.correct || 0));
        chapMap[key].total += total;
        chapMap[key].wrong += wrongN > 0 ? wrongN : 0;
      }
      for (i = 0; i < wrong.length; i++) {
        var w = wrong[i];
        var subj2 = w.subject || w.subj || '';
        var chap2 = w.chapter || w.topic || w.unit || '其他';
        var key2 = subj2 + '|' + chap2;
        if (!chapMap[key2]) chapMap[key2] = { subject: subj2, chapter: chap2, wrong: 0, total: 0 };
        chapMap[key2].wrong += 1;
      }
      var chapList = [];
      for (var k in chapMap) {
        if (!chapMap.hasOwnProperty(k)) continue;
        var c = chapMap[k];
        c.rate = c.total > 0 ? (c.wrong / c.total * 100) : Math.min(100, c.wrong * 20);
        chapList.push(c);
      }
      chapList.sort(function (a, b) { return b.rate - a.rate; });
      var typeMap = { '粗心失误': 0, '知识盲区': 0, '审题失误': 0, '计算错误': 0 };
      for (i = 0; i < wrong.length; i++) {
        var t = inferErrorType(wrong[i]);
        typeMap[t] = (typeMap[t] || 0) + 1;
      }
      var typeTotal = 0;
      for (var tt in typeMap) typeTotal += typeMap[tt];
      var days = this.timeRange === 'all' ? 30 : parseInt(this.timeRange, 10);
      if (days > 30) days = 30;
      var trend = [];
      for (i = days - 1; i >= 0; i--) {
        var day = daysAgo(i);
        var dw = 0, dt = 0;
        for (j = 0; j < quiz.length; j++) {
          var qd = parseDate(quiz[j].date || quiz[j].time || quiz[j].createTime);
          if (qd && sameDay(qd, day)) {
            dt += quiz[j].total || 0;
            dw += (quiz[j].wrong != null ? quiz[j].wrong : 0);
          }
        }
        trend.push({ date: fmtDate(day), rate: dt > 0 ? (dw / dt * 100) : 0, total: dt, wrong: dw });
      }
      var top3 = chapList.slice(0, 3);
      var topType = null, topTypeCount = 0;
      for (var t2 in typeMap) { if (typeMap[t2] > topTypeCount) { topTypeCount = typeMap[t2]; topType = t2; } }
      return {
        wrongCount: wrong.length, quizCount: quiz.length,
        chapList: chapList, typeMap: typeMap, typeTotal: typeTotal,
        trend: trend, top3: top3, topType: topType
      };
    },
    _renderReport: function () {
      var d = this.data;
      if (!d) return '';
      if (d.wrongCount === 0 && d.quizCount === 0) {
        var s = '<div style="text-align:center;padding:40px;color:#888;">';
        s += '<div style="font-size:40px;margin-bottom:10px;">📊</div>';
        s += '<p>当前时间范围内暂无错题/做题记录。</p>';
        s += '<p style="font-size:13px;color:#aaa;">请先在错题本或模拟练习中产生记录，再生成分析报告。</p></div>';
        return s;
      }
      return this._heatCard() + this._typeCard() + this._trendCard() + this._suggestCard();
    },
    _heatCard: function () {
      var d = this.data, i, j;
      var bySubj = {};
      for (i = 0; i < d.chapList.length; i++) {
        var c = d.chapList[i];
        var sk = c.subject || 'unknown';
        if (!bySubj[sk]) bySubj[sk] = [];
        bySubj[sk].push(c);
      }
      var maxChap = 0;
      for (i = 0; i < SUBJECTS.length; i++) {
        var list = bySubj[SUBJECTS[i].key] || [];
        if (list.length > maxChap) maxChap = list.length;
      }
      var cellW = 80, cellH = 42, padL = 56, padT = 24, gap = 4;
      var W = padL + Math.max(maxChap, 1) * (cellW + gap) + 10;
      var H = padT + SUBJECTS.length * (cellH + gap) + 10;
      var svg = '<svg width="' + W + '" height="' + H + '" style="max-width:100%;">';
      for (i = 0; i < SUBJECTS.length; i++) {
        var subj = SUBJECTS[i];
        var y = padT + i * (cellH + gap);
        svg += '<text x="0" y="' + (y + cellH / 2 + 4) + '" font-size="12" fill="#555">' + esc(subj.name) + '</text>';
        var list2 = bySubj[subj.key] || [];
        for (j = 0; j < list2.length; j++) {
          var cc = list2[j];
          var col = heatColor(cc.rate);
          var x = padL + j * (cellW + gap);
          svg += '<rect x="' + x + '" y="' + y + '" width="' + cellW + '" height="' + cellH + '" rx="4" fill="' + col + '" stroke="#fff" stroke-width="1">';
          svg += '<title>' + esc(subj.name + ' - ' + cc.chapter) + ': 错误率 ' + cc.rate.toFixed(1) + '% (错' + cc.wrong + ' / 总' + cc.total + ')</title></rect>';
          var txtCol = cc.rate < 50 ? '#333' : '#fff';
          var nm = cc.chapter; if (nm.length > 5) nm = nm.slice(0, 5);
          svg += '<text x="' + (x + cellW / 2) + '" y="' + (y + 17) + '" font-size="10" text-anchor="middle" fill="' + txtCol + '">' + esc(nm) + '</text>';
          svg += '<text x="' + (x + cellW / 2) + '" y="' + (y + 33) + '" font-size="12" font-weight="bold" text-anchor="middle" fill="' + txtCol + '">' + cc.rate.toFixed(0) + '%</text>';
        }
        if (list2.length === 0) svg += '<text x="' + padL + '" y="' + (y + cellH / 2 + 4) + '" font-size="11" fill="#ccc">无数据</text>';
      }
      svg += '</svg>';
      var s = '<div style="background:#fff;border-radius:8px;padding:14px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">';
      s += '<h4 style="margin:0 0 10px;color:#34495e;font-size:15px;">① 章节错误率热力图</h4>';
      s += '<div style="display:flex;gap:12px;font-size:11px;margin-bottom:10px;align-items:center;flex-wrap:wrap;"><span>错误率：</span>';
      s += '<span><span style="display:inline-block;width:12px;height:12px;background:#4caf50;vertical-align:middle;margin-right:3px;"></span>0-30%</span>';
      s += '<span><span style="display:inline-block;width:12px;height:12px;background:#ffeb3b;vertical-align:middle;margin-right:3px;"></span>30-50%</span>';
      s += '<span><span style="display:inline-block;width:12px;height:12px;background:#ff9800;vertical-align:middle;margin-right:3px;"></span>50-70%</span>';
      s += '<span><span style="display:inline-block;width:12px;height:12px;background:#f44336;vertical-align:middle;margin-right:3px;"></span>70-100%</span></div>';
      s += '<div style="overflow-x:auto;">' + svg + '</div></div>';
      return s;
    },
    _typeCard: function () {
      var d = this.data;
      var colors = { '粗心失误': '#3498db', '知识盲区': '#e74c3c', '审题失误': '#f39c12', '计算错误': '#9b59b6' };
      var data = [];
      for (var t in d.typeMap) if (d.typeMap[t] > 0) data.push({ value: d.typeMap[t], color: colors[t], label: t });
      var s = '<div style="background:#fff;border-radius:8px;padding:14px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">';
      s += '<h4 style="margin:0 0 10px;color:#34495e;font-size:15px;">② 错误类型分类</h4>';
      if (data.length === 0) { s += '<p style="color:#aaa;">暂无错题数据用于分类。</p></div>'; return s; }
      s += '<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">';
      s += '<svg width="180" height="180" style="flex-shrink:0;">' + pieSVG(data, 180, 75) + '</svg><div>';
      for (var i = 0; i < data.length; i++) {
        var pct = d.typeTotal > 0 ? (data[i].value / d.typeTotal * 100).toFixed(1) : '0';
        s += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px;">';
        s += '<span style="display:inline-block;width:12px;height:12px;background:' + data[i].color + ';border-radius:2px;"></span>';
        s += '<span>' + esc(data[i].label) + '：<b>' + data[i].value + '</b> 题 (' + pct + '%)</span></div>';
      }
      s += '</div></div>';
      var hints = {
        '粗心失误': '建议：加强审题训练，做题时圈出关键条件，做完复查计算步骤。',
        '知识盲区': '建议：回归课本重学薄弱知识点，配合基础例题逐个突破。',
        '审题失误': '建议：放慢读题速度，标注题目要求（正确/错误、单位等），养成划题干习惯。',
        '计算错误': '建议：每天10道计算专项训练，草稿纸分区书写，逐步验算。'
      };
      if (d.topType) {
        s += '<div style="margin-top:10px;padding:8px 12px;background:#fff8e1;border-left:3px solid #f39c12;font-size:12px;color:#6d6012;">';
        s += '主要错误类型：<b>' + esc(d.topType) + '</b>。' + esc(hints[d.topType] || '') + '</div>';
      }
      s += '</div>';
      return s;
    },
    _trendCard: function () {
      var d = this.data, trend = d.trend;
      var s = '<div style="background:#fff;border-radius:8px;padding:14px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">';
      s += '<h4 style="margin:0 0 10px;color:#34495e;font-size:15px;">③ 错误率时间趋势（近' + trend.length + '天）</h4>';
      if (trend.length === 0) { s += '<p style="color:#aaa;">无趋势数据。</p></div>'; return s; }
      var W = 600, H = 200, padL = 36, padB = 30, padT = 16, padR = 16;
      var n = trend.length, maxX = W - padL - padR, maxY = H - padT - padB;
      var svg = '<svg width="' + W + '" height="' + H + '" style="max-width:100%;">';
      for (var r = 0; r <= 100; r += 25) {
        var y = padT + maxY - (r / 100) * maxY;
        svg += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="#eee"/>';
        svg += '<text x="' + (padL - 4) + '" y="' + (y + 3) + '" font-size="9" text-anchor="end" fill="#999">' + r + '%</text>';
      }
      svg += '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (padT + maxY) + '" stroke="#ccc"/>';
      svg += '<line x1="' + padL + '" y1="' + (padT + maxY) + '" x2="' + (W - padR) + '" y2="' + (padT + maxY) + '" stroke="#ccc"/>';
      var pts = '', dots = '', i;
      for (i = 0; i < n; i++) {
        var x = padL + (n === 1 ? maxX / 2 : (i / (n - 1)) * maxX);
        var yy = padT + maxY - (trend[i].rate / 100) * maxY;
        pts += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + yy.toFixed(1) + ' ';
        dots += '<circle cx="' + x.toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="3" fill="#e74c3c"><title>' + trend[i].date + ' : ' + trend[i].rate.toFixed(1) + '% (错' + trend[i].wrong + '/总' + trend[i].total + ')</title></circle>';
      }
      svg += '<path d="' + pts + '" fill="none" stroke="#e74c3c" stroke-width="2"/>';
      svg += dots;
      var labelIdx = [0, Math.floor(n / 2), n - 1];
      for (var k = 0; k < labelIdx.length; k++) {
        i = labelIdx[k];
        var xx = padL + (n === 1 ? maxX / 2 : (i / (n - 1)) * maxX);
        svg += '<text x="' + xx.toFixed(1) + '" y="' + (padT + maxY + 14) + '" font-size="9" text-anchor="middle" fill="#999">' + trend[i].date.slice(5) + '</text>';
      }
      svg += '</svg>';
      s += '<div style="overflow-x:auto;">' + svg + '</div>';
      var half = Math.floor(n / 2), fa = 0, fc = 0, la = 0, lc = 0;
      for (i = 0; i < half; i++) { fa += trend[i].rate; fc++; }
      for (i = half; i < n; i++) { la += trend[i].rate; lc++; }
      var fAvg = fc ? fa / fc : 0, lAvg = lc ? la / lc : 0, diff = lAvg - fAvg, trendText;
      if (Math.abs(diff) < 2) trendText = '错误率基本持平，保持稳定。';
      else if (diff < 0) trendText = '错误率下降 <b style="color:#27ae60;">' + Math.abs(diff).toFixed(1) + '%</b>，进步明显，继续保持！';
      else trendText = '错误率上升 <b style="color:#e74c3c;">' + diff.toFixed(1) + '%</b>，需注意调整学习方法。';
      s += '<div style="margin-top:8px;padding:8px 12px;background:#f0f7ff;border-left:3px solid #3498db;font-size:12px;color:#2c5d8f;">趋势分析：' + trendText + '</div></div>';
      return s;
    },
    _suggestCard: function () {
      var d = this.data;
      var s = '<div style="background:#fff;border-radius:8px;padding:14px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">';
      s += '<h4 style="margin:0 0 10px;color:#34495e;font-size:15px;">④ 改善建议</h4>';
      s += '<div style="margin-bottom:12px;"><div style="font-weight:bold;color:#34495e;margin-bottom:6px;">最薄弱 TOP3 章节：</div>';
      if (d.top3.length === 0) { s += '<div style="font-size:13px;color:#aaa;">暂无足够数据。</div>'; }
      else {
        s += '<ol style="margin:0;padding-left:20px;font-size:13px;color:#444;line-height:1.7;">';
        for (var i = 0; i < d.top3.length; i++) {
          var c = d.top3[i];
          s += '<li><b>' + esc(subjectName(c.subject)) + ' · ' + esc(c.chapter) + '</b>（错误率 ' + c.rate.toFixed(0) + '%）';
          s += '<div style="color:#888;font-size:12px;">建议：针对该章节重做错题、做3-5道同类题巩固，并梳理知识脉络。</div></li>';
        }
        s += '</ol>';
      }
      s += '</div>';
      s += '<div style="margin-bottom:12px;"><div style="font-weight:bold;color:#34495e;margin-bottom:6px;">错误类型应对策略：</div>';
      var strategies = {
        '粗心失误': '每日限时训练，强制复查；建立"易错点便签"提醒自己。',
        '知识盲区': '本周回归教材，结合知识图谱逐个补盲；优先攻破高频考点。',
        '审题失误': '训练"读两遍再动笔"习惯，圈出否定词、单位、条件限定。',
        '计算错误': '每天15分钟计算专项，规范草稿纸书写，分步验算。'
      };
      if (d.topType) s += '<div style="font-size:13px;color:#444;line-height:1.7;">主要类型 <b>' + esc(d.topType) + '</b>：' + esc(strategies[d.topType] || '') + '</div>';
      else s += '<div style="font-size:13px;color:#aaa;">暂无错误类型数据。</div>';
      s += '</div>';
      s += '<div style="padding:10px 12px;background:#eafaf1;border-left:3px solid #27ae60;border-radius:0 6px 6px 0;">';
      s += '<div style="font-weight:bold;color:#1e7e45;margin-bottom:4px;">📌 下周重点攻克方向：</div>';
      if (d.top3.length > 0) {
        var focus = d.top3[0];
        s += '<div style="font-size:13px;color:#225e3b;">1. 重点突破 <b>' + esc(subjectName(focus.subject)) + '·' + esc(focus.chapter) + '</b>，每天30分钟专项。</div>';
      }
      if (d.top3.length > 1) {
        var f2 = d.top3[1];
        s += '<div style="font-size:13px;color:#225e3b;">2. 巩固 <b>' + esc(subjectName(f2.subject)) + '·' + esc(f2.chapter) + '</b>，做2套小测验证。</div>';
      }
      if (d.topType) s += '<div style="font-size:13px;color:#225e3b;">3. 针对"' + esc(d.topType) + '"做针对性训练，降低该类错误。</div>';
      s += '</div></div>';
      return s;
    },
    _print: function () {
      var el = document.getElementById(this.containerId);
      if (!el) return;
      var body = el.querySelector('#ear-body');
      var html = '<h2>错题智能分析报告</h2>';
      html += '<p style="color:#666;font-size:13px;">生成时间：' + fmtDate(new Date()) + '　时间范围：' + (this.timeRange === 'all' ? '全部' : '近' + this.timeRange + '天') + '</p>';
      html += body ? body.innerHTML : '';
      printHTML(html);
    }
  };

  // ============ 模块2: timeManagementAnalyzer ============
  var timeManagementAnalyzer = {
    containerId: 'time-management-app',
    timeRange: '30',
    data: null,
    render: function () {
      var el = document.getElementById(this.containerId);
      if (!el) return;
      el.innerHTML = this._shell();
      var self = this;
      var sel = el.querySelector('#tma-range');
      if (sel) { sel.value = this.timeRange; sel.onchange = function () { self.timeRange = this.value; }; }
      var gen = el.querySelector('#tma-gen');
      if (gen) gen.onclick = function () { self._generate(); };
      var manual = el.querySelector('#tma-manual');
      if (manual) manual.onclick = function () { self._showManual(); };
      this._generate();
    },
    _shell: function () {
      var s = '<div style="font-family:sans-serif;background:#f5f7fa;border-radius:10px;padding:16px;color:#222;">';
      s += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">';
      s += '<h3 style="margin:0;color:#2c3e50;font-size:18px;">时间管理分析器</h3>';
      s += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">';
      s += '<select id="tma-range" style="padding:6px 10px;border:1px solid #ccc;border-radius:6px;background:#fff;">';
      s += '<option value="7">近7天</option><option value="30">近30天</option><option value="all">全部</option></select>';
      s += '<button id="tma-gen" style="padding:6px 14px;background:#3498db;color:#fff;border:none;border-radius:6px;cursor:pointer;">分析</button>';
      s += '<button id="tma-manual" style="padding:6px 14px;background:#9b59b6;color:#fff;border:none;border-radius:6px;cursor:pointer;">手动输入</button>';
      s += '</div></div><div id="tma-body">正在分析...</div></div>';
      return s;
    },
    _load: function () { return getStore('hspcb_study_time', []); },
    _filter: function (arr) {
      if (this.timeRange === 'all') return arr.slice(0);
      var n = parseInt(this.timeRange, 10);
      var cutoff = daysAgo(n);
      var out = [];
      for (var i = 0; i < arr.length; i++) {
        var d = parseDate(arr[i].date);
        if (!d) continue;
        if (d.getTime() >= cutoff.getTime()) out.push(arr[i]);
      }
      return out;
    },
    _generate: function () {
      var body = document.getElementById('tma-body');
      if (!body) return;
      var arr = this._filter(this._load());
      this.data = this._analyze(arr);
      body.innerHTML = this._render();
    },
    _showManual: function () {
      var body = document.getElementById('tma-body');
      if (!body) return;
      var s = '<div style="background:#fff;border-radius:8px;padding:14px;">';
      s += '<h4 style="margin:0 0 10px;color:#34495e;">手动输入各科学习时长（分钟）</h4>';
      s += '<div id="tma-manual-msg"></div>';
      s += '<table style="width:100%;border-collapse:collapse;font-size:13px;">';
      for (var i = 0; i < SUBJECTS.length; i++) {
        s += '<tr><td style="padding:6px;border:1px solid #eee;width:80px;">' + esc(SUBJECTS[i].name) + '</td>';
        s += '<td style="padding:6px;border:1px solid #eee;"><input data-subj="' + SUBJECTS[i].key + '" type="number" min="0" value="0" style="width:100px;padding:4px;border:1px solid #ccc;border-radius:4px;" /> 分钟</td></tr>';
      }
      s += '</table>';
      s += '<div style="margin-top:10px;"><label style="font-size:13px;">日期：</label><input id="tma-manual-date" type="date" value="' + fmtDate(new Date()) + '" style="padding:4px;border:1px solid #ccc;border-radius:4px;" /></div>';
      s += '<button id="tma-manual-save" style="margin-top:10px;padding:8px 18px;background:#27ae60;color:#fff;border:none;border-radius:6px;cursor:pointer;">保存并分析</button>';
      s += '</div>';
      body.innerHTML = s;
      var selfObj = this;
      var saveBtn = body.querySelector('#tma-manual-save');
      if (saveBtn) saveBtn.onclick = function () { selfObj._saveManual(); };
    },
    _saveManual: function () {
      var bodyEl = document.getElementById('tma-body');
      var inputs = bodyEl.querySelectorAll('input[data-subj]');
      var dateVal = bodyEl.querySelector('#tma-manual-date').value || fmtDate(new Date());
      var arr = this._load();
      var added = 0, i;
      for (i = 0; i < inputs.length; i++) {
        var subj = inputs[i].getAttribute('data-subj');
        var mins = parseFloat(inputs[i].value) || 0;
        if (mins <= 0) continue;
        arr.push({ date: dateVal, subject: subj, seconds: mins * 60 });
        added++;
      }
      try { localStorage.setItem('hspcb_study_time', JSON.stringify(arr)); } catch (e) {}
      var msg = bodyEl.querySelector('#tma-manual-msg');
      if (msg) msg.innerHTML = '<div style="color:#27ae60;font-size:12px;margin-bottom:8px;">已保存 ' + added + ' 条记录。</div>';
      var selfObj = this;
      setTimeout(function () { selfObj._generate(); }, 600);
    },
    _analyze: function (arr) {
      var i;
      var subjTime = {}, dailyTime = {}, total = 0;
      for (i = 0; i < SUBJECTS.length; i++) subjTime[SUBJECTS[i].key] = 0;
      for (i = 0; i < arr.length; i++) {
        var r = arr[i];
        var subj = r.subject || r.subj || '';
        var sec = r.seconds || r.duration || 0;
        if (!subjTime.hasOwnProperty(subj)) subjTime[subj] = 0;
        subjTime[subj] += sec;
        total += sec;
        var d = parseDate(r.date);
        if (d) { var dk = fmtDate(d); dailyTime[dk] = (dailyTime[dk] || 0) + sec; }
      }
      var days = this.timeRange === 'all' ? 30 : parseInt(this.timeRange, 10);
      if (days > 30) days = 30;
      var trend = [];
      for (i = days - 1; i >= 0; i--) {
        var day = daysAgo(i);
        var dk2 = fmtDate(day);
        trend.push({ date: dk2, seconds: dailyTime[dk2] || 0 });
      }
      var recommended = { chinese: 0.15, math: 0.20, english: 0.15, physics: 0.18, chemistry: 0.17, biology: 0.15 };
      var maxSubj = null, maxVal = -1, minSubj = null, minVal = Infinity;
      for (var k in subjTime) {
        if (subjTime[k] > maxVal) { maxVal = subjTime[k]; maxSubj = k; }
        if (subjTime[k] < minVal) { minVal = subjTime[k]; minSubj = k; }
      }
      var avgPerDay = trend.length > 0 ? (total / trend.length) : 0;
      return {
        subjTime: subjTime, total: total, trend: trend, recommended: recommended,
        maxSubj: maxSubj, maxVal: maxVal, minSubj: minSubj, minVal: minVal,
        avgPerDay: avgPerDay, dayCount: trend.length
      };
    },
    _render: function () {
      var d = this.data;
      if (d.total === 0) {
        var s = '<div style="text-align:center;padding:30px;color:#888;">';
        s += '<div style="font-size:36px;margin-bottom:8px;">⏱️</div>';
        s += '<p>暂无学习时长记录。</p>';
        s += '<p style="font-size:13px;color:#aaa;">点击右上角"手动输入"录入各科学习时长后即可分析。</p></div>';
        return s;
      }
      var out = '';
      out += '<div style="display:flex;gap:14px;flex-wrap:wrap;">';
      out += '<div style="flex:1;min-width:300px;">' + this._pieCard() + this._dataTableCard() + '</div>';
      out += '<div style="flex:1;min-width:300px;">' + this._compareCard() + this._suggestCardTMA() + '</div>';
      out += '</div>';
      out += this._trendCardTMA();
      return out;
    },
    _pieCard: function () {
      var d = this.data;
      var colors = { chinese: '#e67e22', math: '#3498db', english: '#2ecc71', physics: '#9b59b6', chemistry: '#e74c3c', biology: '#1abc9c' };
      var data = [];
      for (var i = 0; i < SUBJECTS.length; i++) {
        var sk = SUBJECTS[i].key;
        if (d.subjTime[sk] > 0) data.push({ value: d.subjTime[sk], color: colors[sk] || '#888', label: SUBJECTS[i].name });
      }
      var s = '<div style="background:#fff;border-radius:8px;padding:14px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">';
      s += '<h4 style="margin:0 0 10px;color:#34495e;font-size:15px;">各科学习时长占比</h4>';
      s += '<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">';
      s += '<svg width="180" height="180" style="flex-shrink:0;">' + pieSVG(data, 180, 75) + '</svg>';
      s += '<div style="font-size:12px;"><div style="margin-bottom:4px;color:#666;">总时长：<b>' + fmtDuration(d.total) + '</b></div>';
      for (var i2 = 0; i2 < data.length; i2++) {
        var pct = d.total > 0 ? (data[i2].value / d.total * 100).toFixed(1) : '0';
        s += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">';
        s += '<span style="display:inline-block;width:10px;height:10px;background:' + data[i2].color + ';"></span>';
        s += '<span>' + esc(data[i2].label) + ' ' + pct + '%</span></div>';
      }
      s += '</div></div></div>';
      return s;
    },
    _dataTableCard: function () {
      var d = this.data;
      var s = '<div style="background:#fff;border-radius:8px;padding:14px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">';
      s += '<h4 style="margin:0 0 10px;color:#34495e;font-size:15px;">各科时长数据</h4>';
      s += '<table style="width:100%;border-collapse:collapse;font-size:12px;">';
      s += '<tr style="background:#f5f5f5;"><th style="padding:6px;border:1px solid #eee;text-align:left;">科目</th><th style="padding:6px;border:1px solid #eee;">时长</th><th style="padding:6px;border:1px solid #eee;">占比</th><th style="padding:6px;border:1px solid #eee;">建议</th></tr>';
      for (var i = 0; i < SUBJECTS.length; i++) {
        var sk = SUBJECTS[i].key;
        var t = d.subjTime[sk] || 0;
        var pct = d.total > 0 ? (t / d.total * 100).toFixed(1) : '0';
        var rec = ((d.recommended[sk] || 0) * 100).toFixed(0) + '%';
        s += '<tr><td style="padding:6px;border:1px solid #eee;">' + SUBJECTS[i].name + '</td>';
        s += '<td style="padding:6px;border:1px solid #eee;text-align:center;">' + fmtDuration(t) + '</td>';
        s += '<td style="padding:6px;border:1px solid #eee;text-align:center;">' + pct + '%</td>';
        s += '<td style="padding:6px;border:1px solid #eee;text-align:center;">' + rec + '</td></tr>';
      }
      s += '</table></div>';
      return s;
    },
    _compareCard: function () {
      var d = this.data;
      var W = 480, H = 220, padL = 50, padB = 30, padT = 16, padR = 16, i;
      var n = SUBJECTS.length, groupW = (W - padL - padR) / n, barW = 14;
      var maxY = H - padT - padB;
      var svg = '<svg width="' + W + '" height="' + H + '" style="max-width:100%;">';
      for (var p = 0; p <= 100; p += 25) {
        var y = padT + maxY - (p / 100) * maxY;
        svg += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="#eee"/>';
        svg += '<text x="' + (padL - 4) + '" y="' + (y + 3) + '" font-size="9" text-anchor="end" fill="#999">' + p + '%</text>';
      }
      for (i = 0; i < n; i++) {
        var sk = SUBJECTS[i].key;
        var actualPct = d.total > 0 ? (d.subjTime[sk] || 0) / d.total * 100 : 0;
        var recPct = (d.recommended[sk] || 0) * 100;
        var cx = padL + i * groupW + groupW / 2;
        var ah = (actualPct / 100) * maxY;
        var rh = (recPct / 100) * maxY;
        svg += '<rect x="' + (cx - barW - 2) + '" y="' + (padT + maxY - ah) + '" width="' + barW + '" height="' + ah + '" fill="#3498db"><title>' + SUBJECTS[i].name + ' 实际 ' + actualPct.toFixed(1) + '%</title></rect>';
        svg += '<rect x="' + (cx + 2) + '" y="' + (padT + maxY - rh) + '" width="' + barW + '" height="' + rh + '" fill="#bdc3c7"><title>' + SUBJECTS[i].name + ' 建议 ' + recPct.toFixed(0) + '%</title></rect>';
        svg += '<text x="' + cx + '" y="' + (padT + maxY + 14) + '" font-size="9" text-anchor="middle" fill="#666">' + SUBJECTS[i].name + '</text>';
      }
      svg += '</svg>';
      var s = '<div style="background:#fff;border-radius:8px;padding:14px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">';
      s += '<h4 style="margin:0 0 10px;color:#34495e;font-size:15px;">实际 vs 建议时间分配</h4>';
      s += '<div style="overflow-x:auto;">' + svg + '</div>';
      s += '<div style="font-size:11px;color:#888;margin-top:6px;"><span style="display:inline-block;width:10px;height:10px;background:#3498db;vertical-align:middle;margin-right:3px;"></span>实际　<span style="display:inline-block;width:10px;height:10px;background:#bdc3c7;vertical-align:middle;margin-right:3px;"></span>建议</div></div>';
      return s;
    },
    _suggestCardTMA: function () {
      var d = this.data;
      var s = '<div style="background:#fff;border-radius:8px;padding:14px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">';
      s += '<h4 style="margin:0 0 10px;color:#34495e;font-size:15px;">效率分析与建议</h4>';
      s += '<div style="font-size:13px;line-height:1.8;color:#444;">';
      s += '<div>📊 平均每日学习：<b>' + fmtDuration(d.avgPerDay) + '</b>（' + d.dayCount + '天）</div>';
      s += '<div>🏆 学习最多：<b>' + esc(subjectName(d.maxSubj)) + '</b>（' + fmtDuration(d.maxVal) + '）</div>';
      s += '<div>⚠️ 学习最少：<b>' + esc(subjectName(d.minSubj)) + '</b>（' + fmtDuration(d.minVal) + '）— 可能被忽视</div>';
      s += '</div>';
      var needMore = [];
      for (var i = 0; i < SUBJECTS.length; i++) {
        var sk = SUBJECTS[i].key;
        var actualPct = d.total > 0 ? (d.subjTime[sk] || 0) / d.total : 0;
        var recPct = d.recommended[sk] || 0;
        if (actualPct < recPct - 0.03) needMore.push({ name: SUBJECTS[i].name, gap: (recPct - actualPct) });
      }
      needMore.sort(function (a, b) { return b.gap - a.gap; });
      s += '<div style="margin-top:10px;padding:10px 12px;background:#fff3e0;border-left:3px solid #ff9800;font-size:12px;color:#8a5a00;">';
      if (needMore.length > 0) {
        s += '<b>💡 建议加强：</b>下阶段增加 <b>' + esc(needMore[0].name);
        if (needMore[1]) s += '、' + esc(needMore[1].name);
        s += '</b> 的学习时长，向建议比例靠拢。';
      } else {
        s += '各科时间分配较均衡，继续保持。';
      }
      s += '</div></div>';
      return s;
    },
    _trendCardTMA: function () {
      var d = this.data, trend = d.trend;
      var s = '<div style="background:#fff;border-radius:8px;padding:14px;margin-top:14px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">';
      s += '<h4 style="margin:0 0 10px;color:#34495e;font-size:15px;">每日学习时长趋势（近' + trend.length + '天）</h4>';
      var W = 600, H = 200, padL = 50, padB = 30, padT = 16, padR = 16;
      var n = trend.length, maxX = W - padL - padR, maxY = H - padT - padB;
      var maxSec = 0, i;
      for (i = 0; i < n; i++) if (trend[i].seconds > maxSec) maxSec = trend[i].seconds;
      if (maxSec === 0) maxSec = 3600;
      var svg = '<svg width="' + W + '" height="' + H + '" style="max-width:100%;">';
      for (var g = 0; g <= 4; g++) {
        var y = padT + maxY - (g / 4) * maxY;
        svg += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="#eee"/>';
        var v = Math.round(maxSec * g / 4);
        svg += '<text x="' + (padL - 4) + '" y="' + (y + 3) + '" font-size="9" text-anchor="end" fill="#999">' + fmtDuration(v) + '</text>';
      }
      svg += '<line x1="' + padL + '" y1="' + (padT + maxY) + '" x2="' + (W - padR) + '" y2="' + (padT + maxY) + '" stroke="#ccc"/>';
      var pts = '', dots = '';
      for (i = 0; i < n; i++) {
        var x = padL + (n === 1 ? maxX / 2 : (i / (n - 1)) * maxX);
        var yy = padT + maxY - (trend[i].seconds / maxSec) * maxY;
        pts += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + yy.toFixed(1) + ' ';
        dots += '<circle cx="' + x.toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="3" fill="#9b59b6"><title>' + trend[i].date + ' : ' + fmtDuration(trend[i].seconds) + '</title></circle>';
      }
      svg += '<path d="' + pts + '" fill="none" stroke="#9b59b6" stroke-width="2"/>';
      svg += dots;
      var labelIdx = [0, Math.floor(n / 2), n - 1];
      for (var k = 0; k < labelIdx.length; k++) {
        i = labelIdx[k];
        var xx = padL + (n === 1 ? maxX / 2 : (i / (n - 1)) * maxX);
        svg += '<text x="' + xx.toFixed(1) + '" y="' + (padT + maxY + 14) + '" font-size="9" text-anchor="middle" fill="#999">' + trend[i].date.slice(5) + '</text>';
      }
      svg += '</svg>';
      s += '<div style="overflow-x:auto;">' + svg + '</div></div>';
      return s;
    }
  };

  // ============ 模块3: scoreLineVisualization ============
  var scoreLineVisualization = {
    containerId: 'score-line-app',
    category: 'physics',
    myScore: '',
    data: [
      { year: 2020, phyBench: 410, phySpecial: 524, hisBench: 430, hisSpecial: 536 },
      { year: 2021, phyBench: 432, phySpecial: 539, hisBench: 448, hisSpecial: 548 },
      { year: 2022, phyBench: 445, phySpecial: 538, hisBench: 437, hisSpecial: 532 },
      { year: 2023, phyBench: 439, phySpecial: 539, hisBench: 433, hisSpecial: 540 },
      { year: 2024, phyBench: 442, phySpecial: 544, hisBench: 428, hisSpecial: 540 },
      { year: 2025, phyBench: 445, phySpecial: 545, hisBench: 430, hisSpecial: 542 },
      { year: 2026, phyBench: 448, phySpecial: 548, hisBench: 432, hisSpecial: 544 }
    ],
    rankTable: [
      { score: 600, physicsRank: 8000, historyRank: 2000 },
      { score: 580, physicsRank: 14000, historyRank: 3500 },
      { score: 560, physicsRank: 22000, historyRank: 5500 },
      { score: 550, physicsRank: 30000, historyRank: 7500 },
      { score: 540, physicsRank: 42000, historyRank: 10000 },
      { score: 520, physicsRank: 70000, historyRank: 16000 },
      { score: 500, physicsRank: 110000, historyRank: 25000 },
      { score: 480, physicsRank: 165000, historyRank: 38000 },
      { score: 460, physicsRank: 230000, historyRank: 55000 },
      { score: 440, physicsRank: 310000, historyRank: 78000 }
    ],
    render: function () {
      var el = document.getElementById(this.containerId);
      if (!el) return;
      el.innerHTML = '<div style="font-family:sans-serif;background:#f5f7fa;border-radius:10px;padding:16px;color:#222;">' + this._header() + this._body() + '</div>';
      var self = this;
      var phyBtn = el.querySelector('#slv-phy');
      var hisBtn = el.querySelector('#slv-his');
      if (phyBtn) phyBtn.onclick = function () { self.category = 'physics'; self.render(); };
      if (hisBtn) hisBtn.onclick = function () { self.category = 'history'; self.render(); };
      var scoreInput = el.querySelector('#slv-score');
      if (scoreInput) {
        scoreInput.value = this.myScore;
        scoreInput.oninput = function () { self.myScore = this.value; self._updatePosition(); };
      }
      this._updatePosition();
    },
    _header: function () {
      var isPhy = this.category === 'physics';
      var s = '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">';
      s += '<h3 style="margin:0;color:#2c3e50;font-size:18px;">广东历年分数线可视化（2020-2026）</h3>';
      s += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">';
      s += '<button id="slv-phy" style="padding:6px 14px;border:none;border-radius:6px;cursor:pointer;background:' + (isPhy ? '#1a5276' : '#bdc3c7') + ';color:#fff;">物理类</button>';
      s += '<button id="slv-his" style="padding:6px 14px;border:none;border-radius:6px;cursor:pointer;background:' + (!isPhy ? '#935116' : '#bdc3c7') + ';color:#fff;">历史类</button>';
      s += '<label style="font-size:13px;margin-left:8px;">我的预估分：</label>';
      s += '<input id="slv-score" type="number" min="0" max="750" placeholder="如 550" style="width:90px;padding:5px 8px;border:1px solid #ccc;border-radius:6px;" />';
      s += '</div></div>';
      return s;
    },
    _body: function () {
      var s = '<div style="display:flex;gap:14px;flex-wrap:wrap;">';
      s += '<div style="flex:2;min-width:400px;">';
      s += '<div style="background:#fff;border-radius:8px;padding:14px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">';
      s += '<h4 style="margin:0 0 10px;color:#34495e;font-size:15px;">分数线折线图</h4>';
      s += '<div id="slv-chart" style="overflow-x:auto;">' + this._chart() + '</div>';
      s += '<div id="slv-pred"></div>';
      s += '<div style="display:flex;gap:14px;font-size:11px;margin-top:8px;flex-wrap:wrap;">';
      s += '<span><span style="display:inline-block;width:14px;height:3px;background:#3498db;vertical-align:middle;margin-right:3px;"></span>物理本科</span>';
      s += '<span><span style="display:inline-block;width:14px;height:3px;background:#1a5276;vertical-align:middle;margin-right:3px;"></span>物理特招</span>';
      s += '<span><span style="display:inline-block;width:14px;height:3px;background:#e67e22;vertical-align:middle;margin-right:3px;"></span>历史本科</span>';
      s += '<span><span style="display:inline-block;width:14px;height:3px;background:#935116;vertical-align:middle;margin-right:3px;"></span>历史特招</span>';
      s += '</div></div></div>';
      s += '<div style="flex:1;min-width:260px;">' + this._trendText() + '</div>';
      s += '</div>';
      s += this._rankTable();
      return s;
    },
    _chart: function () {
      var data = this.data, isPhy = this.category === 'physics', i, li;
      var W = 720, H = 360, padL = 50, padB = 40, padT = 20, padR = 20;
      var minX = padL, maxX = W - padR, minY = padT, maxY = H - padB;
      var yMin = 400, yMax = 560, n = data.length;
      var xAt = function (i) { return padL + (n === 1 ? (maxX - minX) / 2 : (i / (n - 1)) * (maxX - minX)); };
      var yAt = function (v) { return padT + (maxY - minY) - ((v - yMin) / (yMax - yMin)) * (maxY - minY); };
      var lines = [
        { key: 'phyBench', name: '物理类本科', color: '#3498db' },
        { key: 'phySpecial', name: '物理类特招', color: '#1a5276' },
        { key: 'hisBench', name: '历史类本科', color: '#e67e22' },
        { key: 'hisSpecial', name: '历史类特招', color: '#935116' }
      ];
      var svg = '<svg width="' + W + '" height="' + H + '" style="max-width:100%;background:#fff;">';
      for (var v = 400; v <= 560; v += 20) {
        var y = yAt(v);
        svg += '<line x1="' + padL + '" y1="' + y + '" x2="' + maxX + '" y2="' + y + '" stroke="#f0f0f0"/>';
        svg += '<text x="' + (padL - 6) + '" y="' + (y + 3) + '" font-size="10" text-anchor="end" fill="#999">' + v + '</text>';
      }
      svg += '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + maxY + '" stroke="#ccc"/>';
      svg += '<line x1="' + padL + '" y1="' + maxY + '" x2="' + maxX + '" y2="' + maxY + '" stroke="#ccc"/>';
      for (i = 0; i < n; i++) {
        var x = xAt(i);
        svg += '<text x="' + x + '" y="' + (maxY + 16) + '" font-size="10" text-anchor="middle" fill="#666">' + data[i].year + '</text>';
      }
      for (li = 0; li < lines.length; li++) {
        var L = lines[li];
        var dim = (isPhy && L.key.indexOf('his') === 0) || (!isPhy && L.key.indexOf('phy') === 0);
        var opacity = dim ? '0.25' : '1';
        var pts = '', dots = '';
        for (i = 0; i < n; i++) {
          var xx = xAt(i), yy = yAt(data[i][L.key]);
          pts += (i === 0 ? 'M' : 'L') + xx.toFixed(1) + ',' + yy.toFixed(1) + ' ';
          dots += '<circle cx="' + xx.toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="' + (dim ? 3 : 4) + '" fill="' + L.color + '" opacity="' + opacity + '"><title>' + data[i].year + ' ' + L.name + '：' + data[i][L.key] + '分</title></circle>';
        }
        svg += '<path d="' + pts + '" fill="none" stroke="' + L.color + '" stroke-width="' + (dim ? 1.5 : 2.5) + '" opacity="' + opacity + '"/>';
        svg += dots;
      }
      var ms = parseFloat(this.myScore);
      if (!isNaN(ms) && ms >= yMin && ms <= yMax) {
        var py = yAt(ms);
        svg += '<line x1="' + padL + '" y1="' + py + '" x2="' + maxX + '" y2="' + py + '" stroke="#e74c3c" stroke-width="1.5" stroke-dasharray="5,3"/>';
        svg += '<text x="' + (maxX - 4) + '" y="' + (py - 4) + '" font-size="11" text-anchor="end" fill="#e74c3c">我的预估：' + ms + '分</text>';
      }
      svg += '</svg>';
      return svg;
    },
    _trendText: function () {
      var s = '<div style="background:#fff;border-radius:8px;padding:14px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">';
      s += '<h4 style="margin:0 0 10px;color:#34495e;font-size:15px;">趋势分析</h4>';
      s += '<div style="font-size:13px;line-height:1.8;color:#444;">';
      s += '<div>📈 <b>物理类本科线</b>：2020年410分 → 2026年448分，整体上升 <b style="color:#e74c3c;">+38分</b>。</div>';
      s += '<div>📊 <b>历史类本科线</b>：428-448间波动，相对稳定。</div>';
      s += '<div>🚀 <b>特招线</b>：物理类524→548（+24），历史类536→544（+8），逐年上升。</div>';
      s += '<div style="margin-top:6px;color:#888;font-size:12px;">注：分数线受当年试题难度、招生计划、报考人数等影响，趋势仅供参考。</div>';
      s += '</div></div>';
      return s;
    },
    _rankTable: function () {
      var isPhy = this.category === 'physics';
      var last = this.data[this.data.length - 1];
      var bench = isPhy ? last.phyBench : last.hisBench;
      var special = isPhy ? last.phySpecial : last.hisSpecial;
      var s = '<div style="background:#fff;border-radius:8px;padding:14px;margin-top:14px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">';
      s += '<h4 style="margin:0 0 10px;color:#34495e;font-size:15px;">位次参考表（' + (isPhy ? '物理类' : '历史类') + '）</h4>';
      s += '<table style="width:100%;border-collapse:collapse;font-size:12px;">';
      s += '<tr style="background:#f5f5f5;"><th style="padding:6px;border:1px solid #eee;">分数段</th><th style="padding:6px;border:1px solid #eee;">约省排名</th><th style="padding:6px;border:1px solid #eee;">批次参考</th></tr>';
      for (var i = 0; i < this.rankTable.length; i++) {
        var r = this.rankTable[i];
        var rank = isPhy ? r.physicsRank : r.historyRank;
        var batch;
        if (r.score >= special) batch = '特招线以上';
        else if (r.score >= bench) batch = '本科线以上';
        else batch = '本科线附近';
        s += '<tr><td style="padding:6px;border:1px solid #eee;text-align:center;">' + r.score + '</td>';
        s += '<td style="padding:6px;border:1px solid #eee;text-align:center;">约 ' + rank.toLocaleString() + ' 名</td>';
        s += '<td style="padding:6px;border:1px solid #eee;text-align:center;">' + batch + '</td></tr>';
      }
      s += '</table>';
      s += '<div style="font-size:11px;color:#aaa;margin-top:6px;">* 位次为估算值，实际以广东省教育考试院公布为准。</div></div>';
      return s;
    },
    _updatePosition: function () {
      var chartEl = document.getElementById('slv-chart');
      if (chartEl) chartEl.innerHTML = this._chart();
      var pred = document.getElementById('slv-pred');
      if (!pred) return;
      var ms = parseFloat(this.myScore);
      if (isNaN(ms)) { pred.innerHTML = ''; return; }
      var isPhy = this.category === 'physics';
      var last = this.data[this.data.length - 1];
      var bench = isPhy ? last.phyBench : last.hisBench;
      var special = isPhy ? last.phySpecial : last.hisSpecial;
      var msg;
      if (ms >= special) msg = '🟢 预估达特招线以上，可冲击重点院校（位次约前' + this._estimateRank(ms) + '名）。';
      else if (ms >= bench) msg = '🟡 预估达本科线，可报考本科院校。';
      else msg = '🔴 预估低于本科线（' + bench + '），需加强提升 ' + (bench - ms) + ' 分以达本科。';
      pred.innerHTML = '<div style="margin-top:10px;padding:10px 12px;background:#eaf6ff;border-left:3px solid #3498db;font-size:13px;color:#1a5276;">' + msg + '</div>';
    },
    _estimateRank: function (score) {
      var isPhy = this.category === 'physics';
      var table = this.rankTable;
      for (var i = 0; i < table.length; i++) {
        if (score >= table[i].score) {
          return (isPhy ? table[i].physicsRank : table[i].historyRank).toLocaleString();
        }
      }
      return '—';
    }
  };

  // ============ 暴露到 window ============
  global.errorAnalysisReport = errorAnalysisReport;
  global.timeManagementAnalyzer = timeManagementAnalyzer;
  global.scoreLineVisualization = scoreLineVisualization;

})(window);

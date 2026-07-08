// 化学交互可视化模块
// ES5兼容，零依赖，数据内嵌
// 三个模块：chemistryLabBuilder, chemEquilibriumSim, periodicTableInteractive

(function() {
  'use strict';

  // ============================================================================
  // 模块1: chemistryLabBuilder - 化学实验装置拖拽拼装系统
  // ============================================================================
  var LabBuilder = function() {};

  LabBuilder.prototype._apparatusList = [
    { id: 'flask', name: '圆底烧瓶', category: 'container', w: 60, h: 80,
      svg: '<ellipse cx="30" cy="45" rx="18" ry="22" fill="none" stroke="#333" stroke-width="2"/><rect x="25" y="20" width="10" height="20" fill="none" stroke="#333" stroke-width="2"/>' },
    { id: 'erlenmeyer', name: '锥形瓶', category: 'container', w: 70, h: 80,
      svg: '<polygon points="5,25 65,25 55,70 15,70" fill="none" stroke="#333" stroke-width="2"/><rect x="30" y="15" width="10" height="15" fill="none" stroke="#333" stroke-width="2"/>' },
    { id: 'tube', name: '试管', category: 'container', w: 25, h: 90,
      svg: '<rect x="5" y="5" width="15" height="70" rx="7" fill="none" stroke="#333" stroke-width="2"/>' },
    { id: 'burner', name: '酒精灯', category: 'heating', w: 50, h: 60,
      svg: '<ellipse cx="25" cy="45" rx="18" ry="12" fill="none" stroke="#333" stroke-width="2"/><rect x="20" y="20" width="10" height="25" fill="none" stroke="#333" stroke-width="2"/><ellipse cx="25" cy="20" rx="10" ry="3" fill="#ff9900" stroke="#333" stroke-width="1"/>' },
    { id: 'pipe-straight', name: '直导管', category: 'connector', w: 80, h: 15,
      svg: '<line x1="2" y1="7" x2="78" y2="7" stroke="#555" stroke-width="4"/><line x1="2" y1="13" x2="78" y2="13" stroke="#555" stroke-width="4"/>' },
    { id: 'pipe-bent', name: '弯导管', category: 'connector', w: 60, h: 60,
      svg: '<polyline points="5,55 5,25 55,5" fill="none" stroke="#555" stroke-width="4"/>' },
    { id: 'collecting-bottle', name: '集气瓶', category: 'container', w: 60, h: 80,
      svg: '<rect x="5" y="10" width="50" height="55" fill="none" stroke="#333" stroke-width="2"/><rect x="20" y="5" width="20" height="8" fill="none" stroke="#333" stroke-width="2"/>' },
    { id: 'stand', name: '铁架台', category: 'support', w: 70, h: 100,
      svg: '<rect x="2" y="5" width="66" height="10" fill="none" stroke="#333" stroke-width="2"/><rect x="30" y="10" width="10" height="85" fill="none" stroke="#333" stroke-width="2"/><rect x="5" y="90" width="60" height="8" fill="none" stroke="#333" stroke-width="2"/>' },
    { id: 'funnel', name: '分液漏斗', category: 'container', w: 40, h: 90,
      svg: '<ellipse cx="20" cy="60" rx="15" ry="20" fill="none" stroke="#333" stroke-width="2"/><line x1="20" y1="40" x2="20" y2="15" stroke="#333" stroke-width="2"/><polygon points="10,15 30,15 20,8" fill="none" stroke="#333" stroke-width="2"/>' },
    { id: 'wash-bottle', name: '洗气瓶', category: 'container', w: 55, h: 75,
      svg: '<rect x="5" y="10" width="45" height="55" fill="none" stroke="#333" stroke-width="2"/><rect x="18" y="5" width="18" height="8" fill="none" stroke="#333" stroke-width="2"/>' },
    { id: 'absorb-bottle', name: '吸收瓶', category: 'container', w: 55, h: 75,
      svg: '<rect x="5" y="12" width="45" height="50" rx="5" fill="none" stroke="#333" stroke-width="2"/><rect x="18" y="5" width="18" height="10" fill="none" stroke="#333" stroke-width="2"/>' },
    { id: 'stopper', name: '双孔橡皮塞', category: 'connector', w: 35, h: 20,
      svg: '<rect x="5" y="5" width="25" height="12" rx="3" fill="#8B4513" stroke="#333" stroke-width="1"/><circle cx="12" cy="3" r="3" fill="#444"/><circle cx="23" cy="3" r="3" fill="#444"/>' }
  ];

  LabBuilder.prototype._templates = [
    {
      name: '制氯气→除杂→收集→尾气处理',
      description: 'MnO₂+浓HCl → 饱和食盐水除HCl → 浓硫酸干燥 → 向上排空气收集 → NaOH尾气吸收',
      items: [
        { type: 'flask', x: 50, y: 300, rotation: 0 },
        { type: 'burner', x: 55, y: 370, rotation: 0 },
        { type: 'stand', x: 20, y: 220, rotation: 0 },
        { type: 'funnel', x: 75, y: 240, rotation: 0 },
        { type: 'pipe-bent', x: 120, y: 300, rotation: 0 },
        { type: 'wash-bottle', x: 180, y: 280, rotation: 0 },
        { type: 'pipe-straight', x: 240, y: 310, rotation: 0 },
        { type: 'wash-bottle', x: 300, y: 280, rotation: 0 },
        { type: 'pipe-straight', x: 358, y: 310, rotation: 0 },
        { type: 'collecting-bottle', x: 420, y: 300, rotation: 0 },
        { type: 'pipe-straight', x: 485, y: 310, rotation: 0 },
        { type: 'absorb-bottle', x: 530, y: 280, rotation: 0 }
      ]
    },
    {
      name: '制氧气→收集',
      description: 'KMnO₄加热 → 排水法收集O₂',
      items: [
        { type: 'tube', x: 80, y: 300, rotation: 0 },
        { type: 'burner', x: 80, y: 380, rotation: 0 },
        { type: 'stand', x: 50, y: 220, rotation: 0 },
        { type: 'pipe-bent', x: 115, y: 300, rotation: 0 },
        { type: 'collecting-bottle', x: 200, y: 300, rotation: 0 }
      ]
    },
    {
      name: '制CO₂→除杂→收集',
      description: 'CaCO₃+稀HCl → 饱和NaHCO₃除HCl → 向上排空气收集',
      items: [
        { type: 'flask', x: 50, y: 320, rotation: 0 },
        { type: 'funnel', x: 75, y: 260, rotation: 0 },
        { type: 'stand', x: 20, y: 240, rotation: 0 },
        { type: 'pipe-bent', x: 120, y: 320, rotation: 0 },
        { type: 'wash-bottle', x: 180, y: 300, rotation: 0 },
        { type: 'pipe-straight', x: 240, y: 325, rotation: 0 },
        { type: 'collecting-bottle', x: 300, y: 310, rotation: 0 }
      ]
    }
  ];

  LabBuilder.prototype._state = null;

  LabBuilder.prototype._resetState = function() {
    var self = this;
    self._state = {
      placedItems: [],
      dragItem: null,
      dragStartX: 0,
      dragStartY: 0,
      dragOrigX: 0,
      dragOrigY: 0,
      isDragging: false,
      connections: [],
      errorMessages: [],
      selectedTemplate: -1,
      showStandard: false
    };
  };

  LabBuilder.prototype._getApparatusDef = function(type) {
    for (var i = 0; i < this._apparatusList.length; i++) {
      if (this._apparatusList[i].id === type) return this._apparatusList[i];
    }
    return null;
  };

  LabBuilder.prototype._connectionPoints = function(item) {
    var def = this._getApparatusDef(item.type);
    if (!def) return [];
    var cx = item.x, cy = item.y, rot = item.rotation || 0;
    var w = def.w, h = def.h;
    var pts = [];
    if (def.category === 'container') {
      var topX = cx + w/2 - 5; var topY = cy;
      pts.push({ x: topX, y: topY, side: 'top' });
      var rightX = cx + w; var rightY = cy + h/2;
      pts.push({ x: rightX, y: rightY, side: 'right' });
      var leftX = cx; var leftY = cy + h/2;
      pts.push({ x: leftX, y: leftY, side: 'left' });
    } else if (def.category === 'connector') {
      pts.push({ x: cx, y: cy + h/2, side: 'left' });
      pts.push({ x: cx + w, y: cy + h/2, side: 'right' });
    } else if (def.category === 'heating' || def.category === 'support') {
      return [];
    }
    return pts;
  };

  LabBuilder.prototype._distance = function(x1, y1, x2, y2) {
    return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
  };

  LabBuilder.prototype._autoConnect = function() {
    var items = this._state.placedItems;
    var threshold = 15;
    var newConns = [];
    for (var i = 0; i < items.length; i++) {
      var ptsA = this._connectionPoints(items[i]);
      for (var j = i + 1; j < items.length; j++) {
        var ptsB = this._connectionPoints(items[j]);
        for (var pi = 0; pi < ptsA.length; pi++) {
          for (var pj = 0; pj < ptsB.length; pj++) {
            if (this._distance(ptsA[pi].x, ptsA[pi].y, ptsB[pj].x, ptsB[pj].y) < threshold) {
              newConns.push({ from: i, to: j });
            }
          }
        }
      }
    }
    this._state.connections = newConns;
  };

  LabBuilder.prototype._renderToolbar = function() {
    var html = '<div style="padding:10px;border-bottom:1px solid #ddd;background:#f0f4f8;">';
    html += '<select id="lab-template-select" style="padding:5px 10px;margin-right:10px;font-size:13px;">';
    html += '<option value="-1">自由搭建</option>';
    for (var i = 0; i < this._templates.length; i++) {
      html += '<option value="' + i + '">' + this._templates[i].name + '</option>';
    }
    html += '</select>';
    html += '<button id="lab-check-btn" style="padding:5px 12px;margin-right:6px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer;">检查装置</button>';
    html += '<button id="lab-show-standard-btn" style="padding:5px 12px;margin-right:6px;background:#059669;color:#fff;border:none;border-radius:4px;cursor:pointer;">显示标准装置</button>';
    html += '<button id="lab-clear-btn" style="padding:5px 12px;background:#dc2626;color:#fff;border:none;border-radius:4px;cursor:pointer;">清空</button>';
    html += '</div>';
    return html;
  };

  LabBuilder.prototype._renderApparatusPanel = function() {
    var html = '<div style="width:180px;background:#fafafa;border-right:1px solid #ddd;padding:8px;overflow-y:auto;max-height:400px;">';
    html += '<h4 style="margin:4px 0 8px 0;font-size:13px;color:#666;">器材面板</h4>';
    for (var i = 0; i < this._apparatusList.length; i++) {
      var item = this._apparatusList[i];
      html += '<div class="lab-apparatus-item" data-type="' + item.id + '" ';
      html += 'style="display:inline-block;margin:4px;padding:6px;border:1px solid #ccc;border-radius:6px;cursor:grab;text-align:center;background:#fff;width:75px;vertical-align:top;" ';
      html += 'title="' + item.name + '（双击旋转）">';
      html += '<svg width="' + Math.min(item.w, 50) + '" height="' + Math.min(item.h, 40) + '" viewBox="0 0 ' + item.w + ' ' + item.h + '">' + item.svg + '</svg>';
      html += '<div style="font-size:9px;color:#555;margin-top:2px;">' + item.name + '</div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  };

  LabBuilder.prototype._renderCanvas = function() {
    var self = this;
    var items = self._state.placedItems;
    var conns = self._state.connections;
    var svgContent = '';

    // Draw grid
    for (var gx = 0; gx < 600; gx += 20) {
      svgContent += '<line x1="' + gx + '" y1="0" x2="' + gx + '" y2="400" stroke="#eee" stroke-width="0.5"/>';
    }
    for (var gy = 0; gy < 400; gy += 20) {
      svgContent += '<line x1="0" y1="' + gy + '" x2="600" y2="' + gy + '" stroke="#eee" stroke-width="0.5"/>';
    }

    // Draw connections
    for (var ci = 0; ci < conns.length; ci++) {
      var conn = conns[ci];
      var fromItem = items[conn.from];
      var toItem = items[conn.to];
      if (fromItem && toItem) {
        var fromDef = self._getApparatusDef(fromItem.type);
        var toDef = self._getApparatusDef(toItem.type);
        if (fromDef && toDef) {
          var fx = fromItem.x + fromDef.w / 2;
          var fy = fromItem.y + fromDef.h / 2;
          var tx = toItem.x + toDef.w / 2;
          var ty = toItem.y + toDef.h / 2;
          svgContent += '<line x1="' + fx + '" y1="' + fy + '" x2="' + tx + '" y2="' + ty + '" stroke="#3b82f6" stroke-width="2" stroke-dasharray="5,3"/>';
        }
      }
    }

    // Draw placed items
    for (var ii = 0; ii < items.length; ii++) {
      var it = items[ii];
      var def = self._getApparatusDef(it.type);
      if (def) {
        var rot = it.rotation || 0;
        svgContent += '<g transform="translate(' + it.x + ',' + it.y + ') rotate(' + rot + ',' + def.w/2 + ',' + def.h/2 + ')" class="lab-canvas-item" data-index="' + ii + '" style="cursor:move;">';
        svgContent += def.svg;
        if (def.category === 'container' || def.category === 'connector') {
          svgContent += '<circle cx="' + (def.w/2 - 5) + '" cy="0" r="4" fill="#3b82f6" opacity="0.5"/>';
          svgContent += '<circle cx="' + (def.w) + '" cy="' + (def.h/2) + '" r="4" fill="#3b82f6" opacity="0.5"/>';
        }
        svgContent += '<text x="' + (def.w/2) + '" y="' + (def.h + 12) + '" text-anchor="middle" font-size="8" fill="#888">' + def.name + '</text>';
        svgContent += '</g>';
      }
    }

    return svgContent;
  };

  LabBuilder.prototype._renderPropertyPanel = function() {
    var html = '<div style="width:200px;background:#fafafa;border-left:1px solid #ddd;padding:10px;overflow-y:auto;max-height:400px;">';
    html += '<h4 style="margin:0 0 8px 0;font-size:13px;color:#666;">属性 / 检测结果</h4>';

    if (this._state.errorMessages.length > 0) {
      for (var i = 0; i < this._state.errorMessages.length; i++) {
        var err = this._state.errorMessages[i];
        html += '<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:4px;padding:6px 8px;margin-bottom:6px;font-size:11px;color:#991b1b;">' + err + '</div>';
      }
    } else {
      html += '<div style="font-size:11px;color:#888;">暂无检测结果，点击"检查装置"开始。</div>';
    }

    if (this._state.placedItems.length > 0) {
      html += '<div style="margin-top:10px;font-size:11px;color:#555;">已放置器材：' + this._state.placedItems.length + ' 个</div>';
      html += '<div style="font-size:11px;color:#555;">已连接：' + this._state.connections.length + ' 组</div>';
    }

    html += '<div style="margin-top:12px;font-size:10px;color:#999;">提示：双击器材旋转90°</div>';
    html += '</div>';
    return html;
  };

  LabBuilder.prototype._checkApparatus = function() {
    var errors = [];
    var items = this._state.placedItems;
    var hasFlask = false, hasBurner = false, hasCollect = false, hasAbsorb = false;
    var hasWash = false, hasFunnel = false, hasTube = false;

    for (var i = 0; i < items.length; i++) {
      var t = items[i].type;
      if (t === 'flask' || t === 'erlenmeyer' || t === 'tube') { if (t === 'flask') hasFlask = true; if (t === 'tube') hasTube = true; }
      if (t === 'burner') hasBurner = true;
      if (t === 'collecting-bottle') hasCollect = true;
      if (t === 'absorb-bottle') hasAbsorb = true;
      if (t === 'wash-bottle') hasWash = true;
      if (t === 'funnel') hasFunnel = true;
    }

    // Check heater position
    for (var j = 0; j < items.length; j++) {
      if (items[j].type === 'burner') {
        var burnerY = items[j].y;
        var hasAbove = false;
        for (var k = 0; k < items.length; k++) {
          if (k !== j && (items[k].type === 'flask' || items[k].type === 'tube' || items[k].type === 'erlenmeyer')) {
            if (items[k].y + 30 < burnerY) {
              hasAbove = true;
            }
          }
        }
        if (!hasAbove) {
          errors.push('✗ 酒精灯必须放在反应容器下方进行加热（高考扣2分）');
        }
      }
    }

    // Check pipe connection direction (long in, short out for wash/collecting bottles)
    if (hasWash || hasCollect) {
      errors.push('⚠ 请检查洗气瓶/集气瓶导管是否长进短出（高考扣2分）');
    }

    // Check tail gas treatment
    if (hasFlask && hasBurner) {
      if (!hasAbsorb && !hasWash) {
        errors.push('✗ 有加热反应可能产生有毒气体，需添加尾气处理装置（高考扣2分）');
      }
    }

    // Check solid+liquid no-heat vs solid heat
    if (hasFlask && hasFunnel && !hasBurner) {
      // This is a valid solid+liquid no-heat setup
    }
    if (hasTube && hasBurner) {
      // Solid heating setup
    }

    if (errors.length === 0) {
      errors.push('✓ 装置基本配置检测通过！');
    }

    this._state.errorMessages = errors;
  };

  LabBuilder.prototype._applyTemplate = function(templateIndex) {
    this._state.placedItems = [];
    this._state.connections = [];
    this._state.errorMessages = [];
    this._state.selectedTemplate = templateIndex;
    if (templateIndex >= 0 && templateIndex < this._templates.length) {
      var tpl = this._templates[templateIndex];
      for (var i = 0; i < tpl.items.length; i++) {
        this._state.placedItems.push({
          type: tpl.items[i].type,
          x: tpl.items[i].x,
          y: tpl.items[i].y,
          rotation: tpl.items[i].rotation || 0
        });
      }
    }
    this._autoConnect();
  };

  LabBuilder.prototype._bindEvents = function() {
    var self = this;
    var container = document.getElementById('chem-lab-builder-app');
    if (!container) return;

    // Template select
    var selectEl = container.querySelector('#lab-template-select');
    if (selectEl) {
      selectEl.onchange = function() {
        self._applyTemplate(parseInt(this.value));
        self.render();
      };
    }

    // Check button
    var checkBtn = container.querySelector('#lab-check-btn');
    if (checkBtn) {
      checkBtn.onclick = function() {
        self._checkApparatus();
        self.render();
      };
    }

    // Show standard button
    var stdBtn = container.querySelector('#lab-show-standard-btn');
    if (stdBtn) {
      stdBtn.onclick = function() {
        self._state.showStandard = !self._state.showStandard;
        self.render();
      };
    }

    // Clear button
    var clrBtn = container.querySelector('#lab-clear-btn');
    if (clrBtn) {
      clrBtn.onclick = function() {
        self._resetState();
        if (selectEl) selectEl.value = '-1';
        self.render();
      };
    }

    // Apparatus panel drag start
    var items = container.querySelectorAll('.lab-apparatus-item');
    for (var i = 0; i < items.length; i++) {
      (function(idx) {
        items[idx].onmousedown = function(e) {
          e.preventDefault();
          var type = this.getAttribute('data-type');
          var def = self._getApparatusDef(type);
          if (!def) return;
          var newItem = { type: type, x: 300 - def.w/2, y: 200 - def.h/2, rotation: 0 };
          self._state.placedItems.push(newItem);
          self._state.isDragging = true;
          self._state.dragItem = self._state.placedItems.length - 1;
          self._state.dragStartX = e.clientX;
          self._state.dragStartY = e.clientY;
          self._state.dragOrigX = newItem.x;
          self._state.dragOrigY = newItem.y;
          self._autoConnect();
          self.render();
        };
      })(i);
    }

    // Canvas mouse events
    var svgEl = container.querySelector('#lab-canvas-svg');
    if (svgEl) {
      svgEl.onmousedown = function(e) {
        var targetItem = e.target.closest('.lab-canvas-item');
        if (targetItem) {
          var idx = parseInt(targetItem.getAttribute('data-index'));
          if (!isNaN(idx) && self._state.placedItems[idx]) {
            self._state.isDragging = true;
            self._state.dragItem = idx;
            self._state.dragStartX = e.clientX;
            self._state.dragStartY = e.clientY;
            self._state.dragOrigX = self._state.placedItems[idx].x;
            self._state.dragOrigY = self._state.placedItems[idx].y;
          }
        }
      };

      svgEl.ondblclick = function(e) {
        var targetItem = e.target.closest('.lab-canvas-item');
        if (targetItem) {
          var idx = parseInt(targetItem.getAttribute('data-index'));
          if (!isNaN(idx) && self._state.placedItems[idx]) {
            self._state.placedItems[idx].rotation = ((self._state.placedItems[idx].rotation || 0) + 90) % 360;
            self._autoConnect();
            self.render();
          }
        }
      };

      document.addEventListener('mousemove', function(e) {
        if (!self._state.isDragging || self._state.dragItem === null) return;
        var dx = e.clientX - self._state.dragStartX;
        var dy = e.clientY - self._state.dragStartY;
        self._state.placedItems[self._state.dragItem].x = self._state.dragOrigX + dx;
        self._state.placedItems[self._state.dragItem].y = self._state.dragOrigY + dy;
        self.render();
      });

      document.addEventListener('mouseup', function() {
        if (self._state.isDragging) {
          self._state.isDragging = false;
          self._state.dragItem = null;
          self._autoConnect();
          self.render();
        }
      });
    }
  };

  LabBuilder.prototype.render = function() {
    if (!this._state) this._resetState();
    var container = document.getElementById('chem-lab-builder-app');
    if (!container) return;
    try {
    var html = '';
    html += '<div style="font-family:Arial,sans-serif;max-width:1000px;border:1px solid #ddd;border-radius:8px;overflow:hidden;">';
    html += '<div style="background:#1e40af;color:#fff;padding:10px 16px;font-size:16px;font-weight:bold;">化学实验装置拼装系统</div>';
    html += this._renderToolbar();

    if (this._state.showStandard && this._state.selectedTemplate >= 0) {
      var tpl = this._templates[this._state.selectedTemplate];
      html += '<div style="background:#ecfdf5;border:1px solid #a7f3d0;padding:8px 12px;font-size:12px;color:#065f46;">';
      html += '<strong>标准装置流程：</strong>' + tpl.description;
      html += '</div>';
    }

    html += '<div style="display:flex;">';
    html += this._renderApparatusPanel();

    html += '<div style="flex:1;background:#fff;position:relative;" id="lab-canvas-area">';
    html += '<svg id="lab-canvas-svg" width="600" height="400" viewBox="0 0 600 400" style="display:block;">';
    html += this._renderCanvas();
    html += '</svg>';
    html += '</div>';

    html += this._renderPropertyPanel();
    html += '</div>';

    html += '<div style="background:#f8fafc;border-top:1px solid #ddd;padding:6px 12px;font-size:10px;color:#999;">';
    html += '操作：从左侧器材面板拖入画布 | 画布上拖拽移动 | 双击旋转 | 接近时自动吸附连接 | 高考重点：导管长进短出、尾气处理、加热顺序';
    html += '</div>';

    html += '</div>';

    container.innerHTML = html;
    var self = this;
    setTimeout(function() {
      self._bindEvents();
    }, 50);
    } catch (err) {
      console.error('实验装置拼装系统渲染失败:', err);
    }
  };

  window.chemistryLabBuilder = new LabBuilder();

  // ============================================================================
  // 模块2: chemEquilibriumSim - 化学平衡移动动态模拟器
  // ============================================================================
  var EquilibriumSim = function() {};

  EquilibriumSim.prototype._reactions = [
    { id: 'ammonia', name: 'N₂+3H₂⇌2NH₃（合成氨）', eq: 'N₂+3H₂⇌2NH₃', deltaH: -92.4, deltaHStr: 'ΔH=-92.4 kJ/mol（放热）',
      reactants: [{ name: 'N₂', color: '#3b82f6', coeff: 1 }, { name: 'H₂', color: '#22c55e', coeff: 3 }],
      products: [{ name: 'NH₃', color: '#f59e0b', coeff: 2 }],
      gasDiff: -2 },
    { id: 'so3', name: '2SO₂+O₂⇌2SO₃', eq: '2SO₂+O₂⇌2SO₃', deltaH: -197.8, deltaHStr: 'ΔH=-197.8 kJ/mol（放热）',
      reactants: [{ name: 'SO₂', color: '#8b5cf6', coeff: 2 }, { name: 'O₂', color: '#ef4444', coeff: 1 }],
      products: [{ name: 'SO₃', color: '#f97316', coeff: 2 }],
      gasDiff: -1 },
    { id: 'no2', name: '2NO₂⇌N₂O₄', eq: '2NO₂⇌N₂O₄', deltaH: -57.2, deltaHStr: 'ΔH=-57.2 kJ/mol（放热）',
      reactants: [{ name: 'NO₂', color: '#dc2626', coeff: 2 }],
      products: [{ name: 'N₂O₄', color: '#7c3aed', coeff: 1 }],
      gasDiff: -1 }
  ];

  EquilibriumSim.prototype._state = null;

  EquilibriumSim.prototype._resetState = function() {
    this._state = {
      reactionIdx: 0,
      concentrations: { reactants: [1.0, 3.0], products: [2.0] },
      temperature: 25,
      pressure: 1,
      catalyst: false,
      K: 1.0,
      Q: 1.0,
      shiftDirection: '',
      timeSteps: [],
      simRunning: false,
      simTimer: null
    };
    this._calcK();
    this._calcQ();
  };

  EquilibriumSim.prototype._calcK = function() {
    var rx = this._reactions[this._state.reactionIdx];
    var T = this._state.temperature + 273.15;
    var T0 = 298.15;
    var dH = rx.deltaH * 1000;
    var R = 8.314;
    var K0 = 1.0;
    if (rx.id === 'ammonia') K0 = 600;
    else if (rx.id === 'so3') K0 = 450;
    else if (rx.id === 'no2') K0 = 180;
    var lnK = Math.log(K0) - (dH / R) * (1/T - 1/T0);
    this._state.K = Math.exp(lnK);
    // Pressure effect
    if (rx.gasDiff !== 0) {
      this._state.K = this._state.K * Math.pow(this._state.pressure, rx.gasDiff);
    }
    if (this._state.K < 0.001) this._state.K = 0.001;
    if (this._state.K > 100000) this._state.K = 100000;
  };

  EquilibriumSim.prototype._calcQ = function() {
    var rx = this._reactions[this._state.reactionIdx];
    var Q = 1.0;
    var prodConcs = this._state.concentrations.products;
    var reactConcs = this._state.concentrations.reactants;
    for (var i = 0; i < rx.products.length; i++) {
      Q *= Math.pow(Math.max(prodConcs[i], 0.01), rx.products[i].coeff);
    }
    for (var j = 0; j < rx.reactants.length; j++) {
      Q /= Math.pow(Math.max(reactConcs[j], 0.01), rx.reactants[j].coeff);
    }
    this._state.Q = Q;
    if (Q < this._state.K * 0.95) this._state.shiftDirection = '正向移动 →';
    else if (Q > this._state.K * 1.05) this._state.shiftDirection = '逆向移动 ←';
    else this._state.shiftDirection = '平衡状态';
  };

  EquilibriumSim.prototype._renderControls = function() {
    var s = this._state;
    var rx = this._reactions[s.reactionIdx];
    var html = '<div style="width:220px;background:#fafafa;border-right:1px solid #ddd;padding:10px;overflow-y:auto;max-height:550px;">';
    html += '<h4 style="margin:0 0 8px 0;font-size:13px;">参数调节</h4>';

    // Reaction select
    html += '<div style="margin-bottom:10px;">';
    html += '<label style="font-size:11px;color:#555;">选择反应</label>';
    html += '<select id="eq-reaction-select" style="width:100%;padding:4px;font-size:11px;">';
    for (var i = 0; i < this._reactions.length; i++) {
      html += '<option value="' + i + '"' + (i === s.reactionIdx ? ' selected' : '') + '>' + this._reactions[i].name.substring(0,12) + '...</option>';
    }
    html += '</select>';
    html += '</div>';

    // Concentration sliders for reactants
    html += '<div style="margin-bottom:8px;font-size:11px;font-weight:bold;color:#333;">反应物浓度</div>';
    for (var ri = 0; ri < rx.reactants.length; ri++) {
      html += '<div style="margin-bottom:6px;">';
      html += '<span style="font-size:10px;color:' + rx.reactants[ri].color + ';">' + rx.reactants[ri].name + ': </span>';
      html += '<span id="eq-react-val-' + ri + '" style="font-size:10px;">' + s.concentrations.reactants[ri].toFixed(2) + '</span> mol/L';
      html += '<input type="range" min="0" max="5" step="0.1" value="' + s.concentrations.reactants[ri] + '" data-rx-idx="' + ri + '" class="eq-react-slider" style="width:100%;">';
      html += '</div>';
    }

    html += '<div style="margin-bottom:8px;font-size:11px;font-weight:bold;color:#333;">生成物浓度</div>';
    for (var pi = 0; pi < rx.products.length; pi++) {
      html += '<div style="margin-bottom:6px;">';
      html += '<span style="font-size:10px;color:' + rx.products[pi].color + ';">' + rx.products[pi].name + ': </span>';
      html += '<span id="eq-prod-val-' + pi + '" style="font-size:10px;">' + s.concentrations.products[pi].toFixed(2) + '</span> mol/L';
      html += '<input type="range" min="0" max="5" step="0.1" value="' + s.concentrations.products[pi] + '" data-prod-idx="' + pi + '" class="eq-prod-slider" style="width:100%;">';
      html += '</div>';
    }

    html += '<div style="margin-bottom:6px;">';
    html += '<span style="font-size:10px;">温度: </span><span id="eq-temp-val" style="font-size:10px;">' + s.temperature + '</span> °C';
    html += '<input type="range" min="-50" max="200" step="1" value="' + s.temperature + '" id="eq-temp-slider" style="width:100%;">';
    html += '<div style="font-size:9px;color:#888;">' + rx.deltaHStr + '</div>';
    html += '</div>';

    html += '<div style="margin-bottom:6px;">';
    html += '<span style="font-size:10px;">压强: </span><span id="eq-press-val" style="font-size:10px;">' + s.pressure + '</span> atm';
    html += '<input type="range" min="0.1" max="10" step="0.1" value="' + s.pressure + '" id="eq-press-slider" style="width:100%;">';
    html += '</div>';

    html += '<div style="margin-bottom:10px;">';
    html += '<label style="font-size:11px;">';
    html += '<input type="checkbox" id="eq-catalyst-cb"' + (s.catalyst ? ' checked' : '') + '> 催化剂';
    html += '</label>';
    html += '</div>';

    html += '<button id="eq-reset-btn" style="padding:4px 10px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:11px;">重置平衡</button>';

    html += '</div>';
    return html;
  };

  EquilibriumSim.prototype._renderVisualization = function() {
    var s = this._state;
    var rx = this._reactions[s.reactionIdx];
    var html = '<div style="flex:1;background:#fff;padding:8px;position:relative;">';

    // SVG visualization area
    html += '<svg width="400" height="200" viewBox="0 0 400 200" style="display:block;margin:0 auto;border:1px solid #eee;">';
    html += '<rect width="400" height="200" fill="#f8fafc"/>';

    // Reaction arrow area
    html += '<line x1="80" y1="60" x2="130" y2="60" stroke="#333" stroke-width="2"/>';
    html += '<text x="105" y="55" text-anchor="middle" font-size="10" fill="#333">v正</text>';
    html += '<line x1="270" y1="60" x2="320" y2="60" stroke="#333" stroke-width="2"/>';
    html += '<text x="295" y="55" text-anchor="middle" font-size="10" fill="#333">v逆</text>';

    // Dynamic molecule balls
    for (var ri = 0; ri < rx.reactants.length; ri++) {
      var count = Math.round(s.concentrations.reactants[ri] * 4);
      for (var c = 0; c < Math.min(count, 15); c++) {
        var bx = 50 + c * 8 + (ri * 15);
        var by = 80 + (c % 3) * 10;
        html += '<circle cx="' + bx + '" cy="' + by + '" r="4" fill="' + rx.reactants[ri].color + '" opacity="0.7">';
        html += '<animate attributeName="cx" values="' + bx + ';' + (bx + 200) + ';' + bx + '" dur="3s" repeatCount="indefinite"/>';
        html += '</circle>';
      }
    }

    for (var pi = 0; pi < rx.products.length; pi++) {
      var pcount = Math.round(s.concentrations.products[pi] * 4);
      for (var pc = 0; pc < Math.min(pcount, 15); pc++) {
        var px = 250 + pc * 8 + (pi * 15);
        var py = 80 + (pc % 3) * 10;
        html += '<circle cx="' + px + '" cy="' + py + '" r="4" fill="' + rx.products[pi].color + '" opacity="0.7">';
        html += '<animate attributeName="cx" values="' + px + ';' + (px - 200) + ';' + px + '" dur="3s" repeatCount="indefinite"/>';
        html += '</circle>';
      }
    }

    // Equilibrium indicator
    var shiftText = s.shiftDirection;
    var shiftColor = shiftText === '平衡状态' ? '#22c55e' : '#ef4444';
    html += '<text x="200" y="170" text-anchor="middle" font-size="14" fill="' + shiftColor + '" font-weight="bold">' + shiftText + '</text>';

    html += '</svg>';

    // Bar chart for concentrations
    html += '<div style="margin-top:8px;"><strong style="font-size:11px;">浓度柱状图</strong></div>';
    html += '<svg width="400" height="120" viewBox="0 0 400 120" style="display:block;margin:0 auto;">';
    var allSpecies = [];
    for (var ai = 0; ai < rx.reactants.length; ai++) {
      allSpecies.push({ name: rx.reactants[ai].name, conc: s.concentrations.reactants[ai], color: rx.reactants[ai].color, isReactant: true });
    }
    for (var bi = 0; bi < rx.products.length; bi++) {
      allSpecies.push({ name: rx.products[bi].name, conc: s.concentrations.products[bi], color: rx.products[bi].color, isReactant: false });
    }
    var barW = Math.min(60, 350 / allSpecies.length);
    var maxH = 100;
    var maxConc = 0;
    for (var mi = 0; mi < allSpecies.length; mi++) {
      if (allSpecies[mi].conc > maxConc) maxConc = allSpecies[mi].conc;
    }
    if (maxConc < 0.5) maxConc = 5;
    for (var di = 0; di < allSpecies.length; di++) {
      var barH = (allSpecies[di].conc / maxConc) * maxH;
      var bx2 = 10 + di * (barW + 5);
      html += '<rect x="' + bx2 + '" y="' + (110 - barH) + '" width="' + barW + '" height="' + barH + '" fill="' + allSpecies[di].color + '" opacity="0.8"/>';
      html += '<text x="' + (bx2 + barW/2) + '" y="' + (110 - barH - 3) + '" text-anchor="middle" font-size="8" fill="#333">' + allSpecies[di].conc.toFixed(2) + '</text>';
      html += '<text x="' + (bx2 + barW/2) + '" y="118" text-anchor="middle" font-size="8" fill="#555">' + allSpecies[di].name + '</text>';
    }
    html += '</svg>';

    // Rate curves
    html += '<div style="margin-top:8px;"><strong style="font-size:11px;">速率曲线 v正 / v逆</strong></div>';
    html += '<svg width="400" height="80" viewBox="0 0 400 80" style="display:block;margin:0 auto;">';
    html += '<line x1="30" y1="10" x2="30" y2="70" stroke="#ccc" stroke-width="1"/>';
    html += '<line x1="30" y1="60" x2="380" y2="60" stroke="#ccc" stroke-width="1"/>';
    // v正 curve (approaching equilibrium)
    var vForward = 0.8 * Math.exp(-0.02 * (Math.abs(s.Q - s.K) / Math.max(s.K, 0.01)));
    var vReverse = 0.3 * Math.exp(0.01 * Math.min(s.Q, s.K * 3) / Math.max(s.K, 0.01));
    html += '<polyline points="30,55 ' + (30 + 350 * vForward) + ',20" stroke="#3b82f6" stroke-width="2" fill="none"/>';
    html += '<polyline points="30,20 ' + (30 + 350 * vReverse) + ',55" stroke="#ef4444" stroke-width="2" fill="none"/>';
    html += '<text x="380" y="25" font-size="8" fill="#3b82f6">v正</text>';
    html += '<text x="380" y="50" font-size="8" fill="#ef4444">v逆</text>';
    html += '</svg>';

    html += '</div>';
    return html;
  };

  EquilibriumSim.prototype._renderDataPanel = function() {
    var s = this._state;
    var rx = this._reactions[s.reactionIdx];
    var html = '<div style="width:200px;background:#fafafa;border-left:1px solid #ddd;padding:10px;overflow-y:auto;max-height:550px;">';
    html += '<h4 style="margin:0 0 8px 0;font-size:13px;">数据面板</h4>';

    html += '<div style="background:#eff6ff;border-radius:4px;padding:8px;margin-bottom:8px;">';
    html += '<div style="font-size:11px;color:#1e40af;">平衡常数 K</div>';
    html += '<div style="font-size:18px;font-weight:bold;color:#1e3a5f;">' + s.K.toFixed(2) + '</div>';
    html += '</div>';

    html += '<div style="background:#fefce8;border-radius:4px;padding:8px;margin-bottom:8px;">';
    html += '<div style="font-size:11px;color:#854d0e;">反应商 Q</div>';
    html += '<div style="font-size:18px;font-weight:bold;color:#713f12;">' + s.Q.toFixed(2) + '</div>';
    html += '</div>';

    html += '<div style="margin-bottom:8px;">';
    html += '<div style="font-size:11px;color:#555;">Q vs K 判断</div>';
    var cmpText = '';
    if (s.Q < s.K * 0.95) cmpText = 'Q < K，正向移动';
    else if (s.Q > s.K * 1.05) cmpText = 'Q > K，逆向移动';
    else cmpText = 'Q ≈ K，平衡状态';
    html += '<div style="font-size:12px;font-weight:bold;color:#333;">' + cmpText + '</div>';
    html += '</div>';

    html += '<div style="background:#f0fdf4;border-radius:4px;padding:8px;margin-bottom:8px;">';
    html += '<div style="font-size:11px;color:#166534;">平衡移动方向</div>';
    html += '<div style="font-size:14px;font-weight:bold;color:#14532d;">' + s.shiftDirection + '</div>';
    html += '</div>';

    // Le Chatelier's explanation
    html += '<div style="margin-top:10px;font-size:10px;color:#666;line-height:1.5;">';
    html += '<strong>勒夏特列原理：</strong><br>';
    if (s.temperature > 25 && rx.deltaH < 0) {
      html += '升温使平衡向吸热方向（逆向）移动。';
    } else if (s.temperature < 25 && rx.deltaH < 0) {
      html += '降温使平衡向放热方向（正向）移动。';
    } else {
      html += '当前温度下平衡位置稳定。';
    }
    html += '<br>';
    if (s.pressure > 1.5 && rx.gasDiff < 0) {
      html += '加压使平衡向气体分子数减少方向（正向）移动。';
    } else if (s.pressure < 0.5 && rx.gasDiff < 0) {
      html += '减压使平衡向气体分子数增加方向（逆向）移动。';
    }
    if (s.catalyst) {
      html += '<br>催化剂同等程度加快正逆反应速率，不改变平衡位置。';
    }
    html += '</div>';

    html += '</div>';
    return html;
  };

  EquilibriumSim.prototype._bindEvents = function() {
    var self = this;
    var container = document.getElementById('chem-equilibrium-app');
    if (!container) return;

    // Reaction select
    var rxSelect = container.querySelector('#eq-reaction-select');
    if (rxSelect) {
      rxSelect.onchange = function() {
        self._state.reactionIdx = parseInt(this.value);
        self._state.concentrations = { reactants: [1.0, 3.0], products: [2.0] };
        self._calcK();
        self._calcQ();
        self.render();
      };
    }

    // Reactant sliders
    var reactSliders = container.querySelectorAll('.eq-react-slider');
    for (var i = 0; i < reactSliders.length; i++) {
      (function(idx) {
        reactSliders[idx].oninput = function() {
          var ri = parseInt(this.getAttribute('data-rx-idx'));
          self._state.concentrations.reactants[ri] = parseFloat(this.value);
          self._calcQ();
          self.render();
        };
      })(i);
    }

    // Product sliders
    var prodSliders = container.querySelectorAll('.eq-prod-slider');
    for (var j = 0; j < prodSliders.length; j++) {
      (function(idx) {
        prodSliders[idx].oninput = function() {
          var pi = parseInt(this.getAttribute('data-prod-idx'));
          self._state.concentrations.products[pi] = parseFloat(this.value);
          self._calcQ();
          self.render();
        };
      })(j);
    }

    // Temperature slider
    var tempSlider = container.querySelector('#eq-temp-slider');
    if (tempSlider) {
      tempSlider.oninput = function() {
        self._state.temperature = parseInt(this.value);
        self._calcK();
        self._calcQ();
        self.render();
      };
    }

    // Pressure slider
    var pressSlider = container.querySelector('#eq-press-slider');
    if (pressSlider) {
      pressSlider.oninput = function() {
        self._state.pressure = parseFloat(this.value);
        self._calcK();
        self._calcQ();
        self.render();
      };
    }

    // Catalyst checkbox
    var catCb = container.querySelector('#eq-catalyst-cb');
    if (catCb) {
      catCb.onchange = function() {
        self._state.catalyst = this.checked;
        self.render();
      };
    }

    // Reset button
    var resetBtn = container.querySelector('#eq-reset-btn');
    if (resetBtn) {
      resetBtn.onclick = function() {
        self._resetState();
        self.render();
      };
    }
  };

  EquilibriumSim.prototype.render = function() {
    if (!this._state) this._resetState();
    var container = document.getElementById('chem-equilibrium-app');
    if (!container) return;

    var rx = this._reactions[this._state.reactionIdx];

    var html = '';
    html += '<div style="font-family:Arial,sans-serif;max-width:1000px;border:1px solid #ddd;border-radius:8px;overflow:hidden;">';
    html += '<div style="background:#7c3aed;color:#fff;padding:10px 16px;font-size:16px;font-weight:bold;">化学平衡移动动态模拟器</div>';

    html += '<div style="background:#f5f3ff;border-bottom:1px solid #ddd;padding:8px 12px;font-size:13px;color:#5b21b6;">';
    html += '<strong>当前反应：</strong>' + rx.eq + '  ' + rx.deltaHStr;
    html += '</div>';

    html += '<div style="display:flex;">';
    html += this._renderControls();
    html += this._renderVisualization();
    html += this._renderDataPanel();
    html += '</div>';

    html += '<div style="background:#f8fafc;border-top:1px solid #ddd;padding:6px 12px;font-size:10px;color:#999;">';
    html += '操作：调节浓度/温度/压强滑块 → 实时观察平衡移动 | 勒夏特列原理：改变条件，平衡向减弱改变的方向移动';
    html += '</div>';

    html += '</div>';

    container.innerHTML = html;
    var self = this;
    setTimeout(function() {
      self._bindEvents();
    }, 50);
  };

  window.chemEquilibriumSim = new EquilibriumSim();

  // ============================================================================
  // 模块3: periodicTableInteractive - 高考化学交互式元素周期表
  // ============================================================================
  var PeriodicTable = function() {};

  // Complete element data (1-7周期, focus on Gaokao elements)
  PeriodicTable.prototype._elements = [
    // Period 1
    { sym:'H',  cn:'氢',   no:1,  period:1, group:'IA',  mass:'1.008',   config:'1s¹',       en:2.20, valence:'+1,-1', freq:'high',   color:'#ef4444',
      compounds:'H₂O, H₂O₂, HCl, H₂SO₄, NH₃, CH₄', exam:'H₂O₂分解催化、氢键与沸点、同位素氘氚' },
    { sym:'He', cn:'氦',   no:2,  period:1, group:'VIIIA',mass:'4.0026', config:'1s²',       en:0,    valence:'0',  freq:'low',    color:'#94a3b8',
      compounds:'无常见化合物', exam:'稀有气体结构稳定性' },

    // Period 2
    { sym:'Li', cn:'锂',   no:3,  period:2, group:'IA',  mass:'6.941',  config:'[He]2s¹',    en:0.98, valence:'+1',  freq:'medium', color:'#eab308',
      compounds:'Li₂O, LiOH, Li₂CO₃', exam:'碱金属通性、Li的特殊性' },
    { sym:'Be', cn:'铍',   no:4,  period:2, group:'IIA', mass:'9.012',  config:'[He]2s²',    en:1.57, valence:'+2',  freq:'low',    color:'#94a3b8',
      compounds:'BeO, Be(OH)₂', exam:'对角线规则(Be与Al相似)' },
    { sym:'B',  cn:'硼',   no:5,  period:2, group:'IIIA',mass:'10.81',  config:'[He]2s²2p¹', en:2.04, valence:'+3',  freq:'low',    color:'#94a3b8',
      compounds:'B₂O₃, H₃BO₃, NaBH₄', exam:'缺电子化合物、硼酸弱酸性' },
    { sym:'C',  cn:'碳',   no:6,  period:2, group:'IVA', mass:'12.011', config:'[He]2s²2p²', en:2.55, valence:'+2,+4,-4', freq:'high', color:'#ef4444',
      compounds:'CO, CO₂, CH₄, CaCO₃, Na₂CO₃, NaHCO₃', exam:'同素异形体、CO₂与NaOH反应、碳酸盐热稳定性、有机化学基础、碳链异构' },
    { sym:'N',  cn:'氮',   no:7,  period:2, group:'VA',  mass:'14.007', config:'[He]2s²2p³', en:3.04, valence:'-3,+1~+5', freq:'high', color:'#ef4444',
      compounds:'NH₃, NO, NO₂, HNO₃, NH₄Cl', exam:'氨气实验室制法、硝酸强氧化性、铵盐热分解、氮的固定、合成氨条件选择' },
    { sym:'O',  cn:'氧',   no:8,  period:2, group:'VIA', mass:'16.00',  config:'[He]2s²2p⁴', en:3.44, valence:'-2,-1', freq:'high', color:'#ef4444',
      compounds:'H₂O, H₂O₂, O₃, 氧化物', exam:'O₂氧化性、H₂O₂氧化还原双重性、O₃的氧化性与漂白、氧化物分类' },
    { sym:'F',  cn:'氟',   no:9,  period:2, group:'VIIA',mass:'19.00',  config:'[He]2s²2p⁵', en:3.98, valence:'-1',  freq:'medium', color:'#eab308',
      compounds:'HF, CaF₂, NaF', exam:'电负性最大、F₂强氧化性、HF弱酸性与腐蚀玻璃' },
    { sym:'Ne', cn:'氖',   no:10, period:2, group:'VIIIA',mass:'20.180',config:'[He]2s²2p⁶', en:0,    valence:'0',  freq:'low',    color:'#94a3b8',
      compounds:'无常见化合物', exam:'稀有气体惰性' },

    // Period 3
    { sym:'Na', cn:'钠',   no:11, period:3, group:'IA',  mass:'22.990', config:'[Ne]3s¹',   en:0.93, valence:'+1',  freq:'high',   color:'#ef4444',
      compounds:'Na₂O, Na₂O₂, NaOH, NaCl, Na₂CO₃, NaHCO₃', exam:'Na₂O₂与H₂O/CO₂反应（电子转移数）、NaHCO₃热稳定性鉴别、焰色反应（黄色）、侯氏制碱法、钠与水反应现象' },
    { sym:'Mg', cn:'镁',   no:12, period:3, group:'IIA', mass:'24.305', config:'[Ne]3s²',   en:1.31, valence:'+2',  freq:'high',   color:'#f59e0b',
      compounds:'MgO, Mg(OH)₂, MgCl₂, Mg₃N₂', exam:'Mg在CO₂中燃烧、Mg₃N₂与水反应、硬水软化' },
    { sym:'Al', cn:'铝',   no:13, period:3, group:'IIIA',mass:'26.982', config:'[Ne]3s²3p¹',en:1.61, valence:'+3',  freq:'high',   color:'#ef4444',
      compounds:'Al₂O₃, Al(OH)₃, NaAlO₂, AlCl₃, KAl(SO₄)₂·12H₂O', exam:'铝热反应、两性（Al/Al₂O₃/Al(OH)₃与酸和碱）、电解铝、明矾净水、铝钝化' },
    { sym:'Si', cn:'硅',   no:14, period:3, group:'IVA', mass:'28.086', config:'[Ne]3s²3p²',en:1.90, valence:'+4,-4', freq:'high', color:'#f59e0b',
      compounds:'SiO₂, Na₂SiO₃, H₂SiO₃, SiCl₄', exam:'SiO₂与HF反应、硅酸制备、半导体材料、光导纤维' },
    { sym:'P',  cn:'磷',   no:15, period:3, group:'VA',  mass:'30.974', config:'[Ne]3s²3p³',en:2.19, valence:'-3,+3,+5',freq:'high', color:'#f59e0b',
      compounds:'P₂O₅, H₃PO₄, Ca₃(PO₄)₂', exam:'白磷与红磷、P₂O₅作干燥剂、磷酸的酸性' },
    { sym:'S',  cn:'硫',   no:16, period:3, group:'VIA', mass:'32.065', config:'[Ne]3s²3p⁴',en:2.58, valence:'-2,+4,+6',freq:'high', color:'#ef4444',
      compounds:'SO₂, SO₃, H₂SO₄, FeS, CuSO₄, BaSO₄', exam:'SO₂漂白性与还原性、浓硫酸脱水性与强氧化性、SO₄²⁻检验（BaCl₂+稀HCl）、硫的多种价态转化' },
    { sym:'Cl', cn:'氯',   no:17, period:3, group:'VIIA',mass:'35.453', config:'[Ne]3s²3p⁵',en:3.16, valence:'-1,+1~+7',freq:'high', color:'#ef4444',
      compounds:'HCl, Cl₂, NaClO, Ca(ClO)₂, FeCl₃, AlCl₃', exam:'Cl₂实验室制备（MnO₂+浓HCl）、氯水成分与性质、漂白粉原理、Cl⁻检验（AgNO₃+稀HNO₃）、卤素递变规律' },
    { sym:'Ar', cn:'氩',   no:18, period:3, group:'VIIIA',mass:'39.948',config:'[Ne]3s²3p⁶',en:0,    valence:'0',  freq:'low',    color:'#94a3b8',
      compounds:'无常见化合物', exam:'惰性气体保护' },

    // Period 4
    { sym:'K',  cn:'钾',   no:19, period:4, group:'IA',  mass:'39.098', config:'[Ar]4s¹',   en:0.82, valence:'+1',  freq:'high', color:'#f59e0b',
      compounds:'K₂O, KOH, KCl, KMnO₄, K₂Cr₂O₇', exam:'焰色反应（紫色）、KMnO₄强氧化性、碱金属活泼性对比' },
    { sym:'Ca', cn:'钙',   no:20, period:4, group:'IIA', mass:'40.078', config:'[Ar]4s²',   en:1.00, valence:'+2',  freq:'high', color:'#f59e0b',
      compounds:'CaO, Ca(OH)₂, CaCO₃, Ca(HCO₃)₂, CaCl₂', exam:'生石灰熟石灰转化、CaCO₃与Ca(HCO₃)₂互变（溶洞形成）、硬水软化、CaO干燥剂' },
    { sym:'Sc', cn:'钪',   no:21, period:4, group:'IIIB',mass:'44.956', config:'[Ar]3d¹4s²',en:1.36, valence:'+3',  freq:'low',    color:'#94a3b8',
      compounds:'Sc₂O₃', exam:'过渡金属通性' },
    { sym:'Ti', cn:'钛',   no:22, period:4, group:'IVB', mass:'47.867', config:'[Ar]3d²4s²',en:1.54, valence:'+3,+4',freq:'low',   color:'#94a3b8',
      compounds:'TiO₂, TiCl₄', exam:'钛合金、TiO₂白色颜料' },
    { sym:'V',  cn:'钒',   no:23, period:4, group:'VB',  mass:'50.942', config:'[Ar]3d³4s²',en:1.63, valence:'+2~+5',freq:'low',   color:'#94a3b8',
      compounds:'V₂O₅', exam:'V₂O₅催化SO₂→SO₃' },
    { sym:'Cr', cn:'铬',   no:24, period:4, group:'VIB', mass:'52.00',  config:'[Ar]3d⁵4s¹',en:1.66, valence:'+2,+3,+6',freq:'medium',color:'#eab308',
      compounds:'Cr₂O₃, K₂Cr₂O₇, Cr(OH)₃, NaCrO₂', exam:'Cr(OH)₃两性、重铬酸钾氧化性（检验酒驾）、铬酸根与重铬酸根互变（酸碱平衡）' },
    { sym:'Mn', cn:'锰',   no:25, period:4, group:'VIIB',mass:'54.938', config:'[Ar]3d⁵4s²',en:1.55, valence:'+2,+4,+6,+7',freq:'high',color:'#f59e0b',
      compounds:'MnO₂, KMnO₄, MnSO₄, MnO₄⁻', exam:'KMnO₄强氧化性（酸性条件更强）、MnO₂催化H₂O₂分解、Mn²⁺检验（铋酸钠氧化变紫）、不同介质下还原产物' },
    { sym:'Fe', cn:'铁',   no:26, period:4, group:'VIII',mass:'55.845', config:'[Ar]3d⁶4s²',en:1.83, valence:'+2,+3',freq:'high', color:'#ef4444',
      compounds:'FeO, Fe₂O₃, Fe₃O₄, Fe(OH)₂, Fe(OH)₃, FeCl₃, FeSO₄', exam:'铁三角转化（Fe-Fe²⁺-Fe³⁺）、Fe²⁺与Fe³⁺检验（KSCN显红色、苯酚显紫色）、Fe(OH)₂白色沉淀易氧化、钢铁腐蚀（吸氧腐蚀vs析氢腐蚀）、铝热反应' },
    { sym:'Co', cn:'钴',   no:27, period:4, group:'VIII',mass:'58.933', config:'[Ar]3d⁷4s²',en:1.88, valence:'+2,+3',freq:'low',   color:'#94a3b8',
      compounds:'CoO, CoCl₂', exam:'过渡金属，配合物形成' },
    { sym:'Ni', cn:'镍',   no:28, period:4, group:'VIII',mass:'58.693', config:'[Ar]3d⁸4s²',en:1.91, valence:'+2,+3',freq:'low',   color:'#94a3b8',
      compounds:'NiO, Ni(OH)₂, [Ni(NH₃)₆]²⁺', exam:'过渡金属离子鉴定、催化剂（雷尼镍）' },
    { sym:'Cu', cn:'铜',   no:29, period:4, group:'IB',  mass:'63.546', config:'[Ar]3d¹⁰4s¹',en:1.90, valence:'+1,+2',freq:'high', color:'#f59e0b',
      compounds:'CuO, Cu₂O, CuSO₄·5H₂O, Cu(OH)₂, [Cu(NH₃)₄]²⁺', exam:'Cu与浓/稀HNO₃反应、Cu²⁺蓝色溶液和配合物、CuSO₄·5H₂O热分解（蓝色→白色）、铜的冶炼（湿法炼铜）、电解精炼铜、焰色反应（绿色）' },
    { sym:'Zn', cn:'锌',   no:30, period:4, group:'IIB', mass:'65.38',  config:'[Ar]3d¹⁰4s²',en:1.65, valence:'+2',  freq:'medium',color:'#eab308',
      compounds:'ZnO, Zn(OH)₂, ZnO₂²⁻, ZnSO₄', exam:'Zn及ZnO两性、原电池（Cu-Zn）' },
    { sym:'Ga', cn:'镓',   no:31, period:4, group:'IIIA',mass:'69.723', config:'[Ar]3d¹⁰4s²4p¹',en:1.81, valence:'+3',freq:'low',  color:'#94a3b8',
      compounds:'Ga₂O₃, GaAs', exam:'半导体材料' },
    { sym:'Ge', cn:'锗',   no:32, period:4, group:'IVA', mass:'72.630', config:'[Ar]3d¹⁰4s²4p²',en:2.01, valence:'+4',freq:'low',  color:'#94a3b8',
      compounds:'GeO₂', exam:'半导体材料' },
    { sym:'As', cn:'砷',   no:33, period:4, group:'VA',  mass:'74.922', config:'[Ar]3d¹⁰4s²4p³',en:2.18, valence:'-3,+3,+5',freq:'low',color:'#94a3b8',
      compounds:'As₂O₃, AsH₃', exam:'As₂O₃（砒霜）毒性' },
    { sym:'Se', cn:'硒',   no:34, period:4, group:'VIA', mass:'78.971', config:'[Ar]3d¹⁰4s²4p⁴',en:2.55, valence:'-2,+4,+6',freq:'low',color:'#94a3b8',
      compounds:'SeO₂, H₂Se', exam:'氧族元素递变' },
    { sym:'Br', cn:'溴',   no:35, period:4, group:'VIIA',mass:'79.904', config:'[Ar]3d¹⁰4s²4p⁵',en:2.96, valence:'-1,+1~+7',freq:'high',color:'#f59e0b',
      compounds:'HBr, Br₂, AgBr, NaBr', exam:'Br₂萃取（CCl₄呈橙红色）、卤素活泼性Cl₂>Br₂>I₂、AgBr光敏性（照相）、Br⁻检验' },
    { sym:'Kr', cn:'氪',   no:36, period:4, group:'VIIIA',mass:'83.798',config:'[Ar]3d¹⁰4s²4p⁶',en:0,   valence:'0',  freq:'low',   color:'#94a3b8',
      compounds:'无常见化合物', exam:'稀有气体' },

    // Period 5
    { sym:'Rb', cn:'铷',   no:37, period:5, group:'IA',  mass:'85.468', config:'[Kr]5s¹',   en:0.82, valence:'+1',  freq:'low',    color:'#94a3b8',
      compounds:'Rb₂O, RbOH', exam:'碱金属活泼性' },
    { sym:'Sr', cn:'锶',   no:38, period:5, group:'IIA', mass:'87.62',  config:'[Kr]5s²',   en:0.95, valence:'+2',  freq:'low',    color:'#94a3b8',
      compounds:'SrO, Sr(OH)₂, SrCO₃', exam:'焰色反应（红色）' },
    { sym:'Ag', cn:'银',   no:47, period:5, group:'IB',  mass:'107.87', config:'[Kr]4d¹⁰5s¹',en:1.93, valence:'+1',  freq:'medium', color:'#eab308',
      compounds:'AgNO₃, AgCl, AgBr, AgI, [Ag(NH₃)₂]⁺', exam:'银镜反应、Ag⁺检验（Cl⁻沉淀法）、AgX颜色与溶解性（AgF可溶）、硝酸银保存（棕色瓶）' },
    { sym:'Cd', cn:'镉',   no:48, period:5, group:'IIB', mass:'112.41', config:'[Kr]4d¹⁰5s²',en:1.69, valence:'+2', freq:'low',    color:'#94a3b8',
      compounds:'CdO, CdS', exam:'重金属污染' },
    { sym:'In', cn:'铟',   no:49, period:5, group:'IIIA',mass:'114.82', config:'[Kr]4d¹⁰5s²5p¹',en:1.78, valence:'+3',freq:'low',    color:'#94a3b8',
      compounds:'In₂O₃', exam:'稀有金属' },
    { sym:'Sn', cn:'锡',   no:50, period:5, group:'IVA', mass:'118.71', config:'[Kr]4d¹⁰5s²5p²',en:1.96, valence:'+2,+4',freq:'low',   color:'#94a3b8',
      compounds:'SnO₂, SnCl₂, SnCl₄', exam:'SnCl₂还原性' },
    { sym:'Sb', cn:'锑',   no:51, period:5, group:'VA',  mass:'121.76', config:'[Kr]4d¹⁰5s²5p³',en:2.05, valence:'+3,+5',freq:'low',   color:'#94a3b8',
      compounds:'Sb₂O₃, SbCl₃', exam:'氮族元素' },
    { sym:'Te', cn:'碲',   no:52, period:5, group:'VIA', mass:'127.60', config:'[Kr]4d¹⁰5s²5p⁴',en:2.10, valence:'-2,+4,+6',freq:'low',   color:'#94a3b8',
      compounds:'TeO₂, H₂Te', exam:'氧族元素' },
    { sym:'I',  cn:'碘',   no:53, period:5, group:'VIIA',mass:'126.90', config:'[Kr]4d¹⁰5s²5p⁵',en:2.66, valence:'-1,+1~+7',freq:'high',color:'#f59e0b',
      compounds:'HI, I₂, KI, AgI, KIO₃', exam:'I₂的升华与萃取（紫色）、淀粉遇I₂变蓝、卤素氧化性Cl₂>Br₂>I₂、加碘食盐（KIO₃）、I⁻被氧化为I₂' },
    { sym:'Xe', cn:'氙',   no:54, period:5, group:'VIIIA',mass:'131.29',config:'[Kr]4d¹⁰5s²5p⁶',en:2.60,valence:'0',  freq:'low',    color:'#94a3b8',
      compounds:'XeF₂', exam:'稀有气体化合物' },

    // Period 6
    { sym:'Cs', cn:'铯',   no:55, period:6, group:'IA',  mass:'132.91', config:'[Xe]6s¹',   en:0.79, valence:'+1',  freq:'low',    color:'#94a3b8',
      compounds:'Cs₂O', exam:'最活泼金属' },
    { sym:'Ba', cn:'钡',   no:56, period:6, group:'IIA', mass:'137.33', config:'[Xe]6s²',   en:0.89, valence:'+2',  freq:'medium', color:'#eab308',
      compounds:'BaO, Ba(OH)₂, BaSO₄, BaCO₃, BaCl₂', exam:'BaSO₄不溶于酸（钡餐）、焰色反应（黄绿色）、SO₄²⁻检验、BaCO₃溶于酸' },
    { sym:'La', cn:'镧',   no:57, period:6, group:'IIIB',mass:'138.91', config:'[Xe]5d¹6s²',en:1.10, valence:'+3',  freq:'low',    color:'#94a3b8',
      compounds:'La₂O₃', exam:'镧系元素代表' },
    { sym:'Hf', cn:'铪',   no:72, period:6, group:'IVB', mass:'178.49', config:'[Xe]4f¹⁴5d²6s²',en:1.30, valence:'+4',freq:'low',    color:'#94a3b8',
      compounds:'HfO₂', exam:'难分离Zr/Hf' },
    { sym:'Ta', cn:'钽',   no:73, period:6, group:'VB',  mass:'180.95', config:'[Xe]4f¹⁴5d³6s²',en:1.50, valence:'+5',freq:'low',    color:'#94a3b8',
      compounds:'Ta₂O₅', exam:'耐腐蚀金属' },
    { sym:'W',  cn:'钨',   no:74, period:6, group:'VIB', mass:'183.84', config:'[Xe]4f¹⁴5d⁴6s²',en:2.36, valence:'+6',freq:'low',    color:'#94a3b8',
      compounds:'WO₃', exam:'高熔点（灯丝）' },
    { sym:'Pt', cn:'铂',   no:78, period:6, group:'VIII',mass:'195.08', config:'[Xe]4f¹⁴5d⁹6s¹',en:2.28, valence:'+2,+4',freq:'low',    color:'#94a3b8',
      compounds:'PtCl₂, H₂PtCl₆', exam:'催化剂、惰性电极' },
    { sym:'Au', cn:'金',   no:79, period:6, group:'IB',  mass:'196.97', config:'[Xe]4f¹⁴5d¹⁰6s¹',en:2.54, valence:'+1,+3',freq:'low',   color:'#94a3b8',
      compounds:'AuCl₃, HAuCl₄', exam:'王水溶金' },
    { sym:'Hg', cn:'汞',   no:80, period:6, group:'IIB', mass:'200.59', config:'[Xe]4f¹⁴5d¹⁰6s²',en:2.00, valence:'+1,+2',freq:'low',   color:'#94a3b8',
      compounds:'HgO, HgCl₂, Hg₂Cl₂', exam:'唯一液态金属、Hg²⁺毒性' },
    { sym:'Pb', cn:'铅',   no:82, period:6, group:'IVA', mass:'207.2',  config:'[Xe]4f¹⁴5d¹⁰6s²6p²',en:2.33, valence:'+2,+4',freq:'medium',color:'#eab308',
      compounds:'PbO, PbO₂, Pb₃O₄, PbSO₄, Pb(CH₃COO)₂', exam:'铅蓄电池（Pb+PbO₂+2H₂SO₄）、PbSO₄难溶、Pb²⁺检验（CrO₄²⁻黄色沉淀）' },
    { sym:'Bi', cn:'铋',   no:83, period:6, group:'VA',  mass:'208.98', config:'[Xe]4f¹⁴5d¹⁰6s²6p³',en:2.02, valence:'+3,+5',freq:'low',   color:'#94a3b8',
      compounds:'Bi₂O₃', exam:'氮族元素' },

    // Period 7 (simplified)
    { sym:'Fr', cn:'钫',   no:87, period:7, group:'IA',  mass:'223',    config:'[Rn]7s¹',   en:0.70, valence:'+1',  freq:'low',    color:'#94a3b8',
      compounds:'Fr₂O', exam:'放射性元素，极不稳定' },
    { sym:'Ra', cn:'镭',   no:88, period:7, group:'IIA', mass:'226',    config:'[Rn]7s²',   en:0.90, valence:'+2',  freq:'low',    color:'#94a3b8',
      compounds:'RaO', exam:'放射性元素' }
  ];

  // Group labels for the table
  PeriodicTable.prototype._groups = ['IA','IIA','IIIB','IVB','VB','VIB','VIIB','VIII','VIII','VIII','IB','IIB','IIIA','IVA','VA','VIA','VIIA','VIIIA'];

  PeriodicTable.prototype._gridMap = null;
  PeriodicTable.prototype._state = null;

  PeriodicTable.prototype._resetState = function() {
    this._state = {
      filterGroup: '',
      filterPeriod: 0,
      filterFreq: '',
      selectedElement: null,
      showDetail: false
    };
  };

  PeriodicTable.prototype._buildGridMap = function() {
    // Map element symbol -> grid position (col, row)
    // Standard periodic table layout
    var map = {};
    // Period 1: H (col1,row1) ... He (col18,row1)
    map['H']  = { col:1,  row:1 }; map['He'] = { col:18, row:1 };
    // Period 2
    map['Li'] = { col:1,  row:2 }; map['Be'] = { col:2,  row:2 };
    map['B']  = { col:13, row:2 }; map['C']  = { col:14, row:2 };
    map['N']  = { col:15, row:2 }; map['O']  = { col:16, row:2 };
    map['F']  = { col:17, row:2 }; map['Ne'] = { col:18, row:2 };
    // Period 3
    map['Na'] = { col:1,  row:3 }; map['Mg'] = { col:2,  row:3 };
    map['Al'] = { col:13, row:3 }; map['Si'] = { col:14, row:3 };
    map['P']  = { col:15, row:3 }; map['S']  = { col:16, row:3 };
    map['Cl'] = { col:17, row:3 }; map['Ar'] = { col:18, row:3 };
    // Period 4
    map['K']  = { col:1,  row:4 }; map['Ca'] = { col:2,  row:4 };
    map['Sc'] = { col:3,  row:4 }; map['Ti'] = { col:4,  row:4 };
    map['V']  = { col:5,  row:4 }; map['Cr'] = { col:6,  row:4 };
    map['Mn'] = { col:7,  row:4 }; map['Fe'] = { col:8,  row:4 };
    map['Co'] = { col:9,  row:4 }; map['Ni'] = { col:10, row:4 };
    map['Cu'] = { col:11, row:4 }; map['Zn'] = { col:12, row:4 };
    map['Ga'] = { col:13, row:4 }; map['Ge'] = { col:14, row:4 };
    map['As'] = { col:15, row:4 }; map['Se'] = { col:16, row:4 };
    map['Br'] = { col:17, row:4 }; map['Kr'] = { col:18, row:4 };
    // Period 5
    map['Rb'] = { col:1,  row:5 }; map['Sr'] = { col:2,  row:5 };
    map['Ag'] = { col:11, row:5 }; map['Cd'] = { col:12, row:5 };
    map['In'] = { col:13, row:5 }; map['Sn'] = { col:14, row:5 };
    map['Sb'] = { col:15, row:5 }; map['Te'] = { col:16, row:5 };
    map['I']  = { col:17, row:5 }; map['Xe'] = { col:18, row:5 };
    // Period 6
    map['Cs'] = { col:1,  row:6 }; map['Ba'] = { col:2,  row:6 };
    map['La'] = { col:3,  row:6 }; map['Hf'] = { col:4,  row:6 };
    map['Ta'] = { col:5,  row:6 }; map['W']  = { col:6,  row:6 };
    map['Pt'] = { col:10, row:6 }; map['Au'] = { col:11, row:6 };
    map['Hg'] = { col:12, row:6 }; map['Pb'] = { col:14, row:6 };
    map['Bi'] = { col:15, row:6 };
    // Period 7
    map['Fr'] = { col:1,  row:7 }; map['Ra'] = { col:2,  row:7 };

    this._gridMap = map;
  };

  PeriodicTable.prototype._findElement = function(sym) {
    for (var i = 0; i < this._elements.length; i++) {
      if (this._elements[i].sym === sym) return this._elements[i];
    }
    return null;
  };

  PeriodicTable.prototype._getCellColor = function(el) {
    var s = this._state;
    if (s.filterFreq === 'high' && el.freq !== 'high') return '#e5e7eb';
    if (s.filterFreq === 'high_medium' && el.freq !== 'high' && el.freq !== 'medium') return '#e5e7eb';
    if (s.filterGroup && el.group !== s.filterGroup) return '#e5e7eb';
    if (s.filterPeriod && el.period !== s.filterPeriod) return '#e5e7eb';
    return el.color;
  };

  PeriodicTable.prototype._isDimmed = function(el) {
    var s = this._state;
    if (s.filterFreq === 'high' && el.freq !== 'high') return true;
    if (s.filterFreq === 'high_medium' && el.freq !== 'high' && el.freq !== 'medium') return true;
    if (s.filterGroup && el.group !== s.filterGroup) return true;
    if (s.filterPeriod && el.period !== s.filterPeriod) return true;
    return false;
  };

  PeriodicTable.prototype._renderLegend = function() {
    var html = '<div style="padding:8px 10px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:10px;">';
    html += '<span style="font-weight:bold;">图例：</span>';
    html += '<span style="display:inline-flex;align-items:center;gap:3px;"><span style="width:12px;height:12px;display:inline-block;background:#ef4444;border-radius:2px;"></span>超高频（≥8次/年）</span>';
    html += '<span style="display:inline-flex;align-items:center;gap:3px;"><span style="width:12px;height:12px;display:inline-block;background:#f59e0b;border-radius:2px;"></span>高频（4-7次/年）</span>';
    html += '<span style="display:inline-flex;align-items:center;gap:3px;"><span style="width:12px;height:12px;display:inline-block;background:#eab308;border-radius:2px;"></span>中频（2-3次/年）</span>';
    html += '<span style="display:inline-flex;align-items:center;gap:3px;"><span style="width:12px;height:12px;display:inline-block;background:#94a3b8;border-radius:2px;"></span>低频</span>';
    html += '</div>';
    return html;
  };

  PeriodicTable.prototype._renderDetailPanel = function() {
    var el = this._state.selectedElement;
    if (!el) return '';
    var freqLabels = { high: '超高频', medium: '中频', high2: '高频', low: '低频' };
    var freqCN = '';
    if (el.freq === 'high') freqCN = '超高频（考查≥8次/年）';
    else if (el.freq === 'medium') freqCN = '中频（考查2-3次/年）';
    else freqCN = '低频';

    var html = '<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:9999;display:flex;align-items:center;justify-content:center;" id="pt-detail-overlay">';
    html += '<div style="background:#fff;border-radius:8px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 30px rgba(0,0,0,0.3);">';
    html += '<div style="background:' + el.color + ';color:#fff;padding:12px 16px;border-radius:8px 8px 0 0;display:flex;justify-content:space-between;align-items:center;">';
    html += '<div><span style="font-size:22px;font-weight:bold;">' + el.sym + '</span> <span style="font-size:14px;">' + el.cn + '</span></div>';
    html += '<button id="pt-detail-close" style="background:rgba(255,255,255,0.3);border:none;color:#fff;font-size:18px;padding:4px 10px;border-radius:4px;cursor:pointer;">×</button>';
    html += '</div>';

    html += '<div style="padding:16px;">';
    // Basic info
    html += '<table style="width:100%;font-size:12px;border-collapse:collapse;margin-bottom:12px;">';
    html += '<tr><td style="padding:4px 8px;color:#888;width:80px;">原子序数</td><td style="padding:4px 8px;">' + el.no + '</td></tr>';
    html += '<tr><td style="padding:4px 8px;color:#888;">相对原子质量</td><td style="padding:4px 8px;">' + el.mass + '</td></tr>';
    html += '<tr><td style="padding:4px 8px;color:#888;">电子排布</td><td style="padding:4px 8px;">' + el.config + '</td></tr>';
    html += '<tr><td style="padding:4px 8px;color:#888;">电负性</td><td style="padding:4px 8px;">' + el.en + '</td></tr>';
    html += '<tr><td style="padding:4px 8px;color:#888;">常见价态</td><td style="padding:4px 8px;">' + el.valence + '</td></tr>';
    html += '<tr><td style="padding:4px 8px;color:#888;">所属族</td><td style="padding:4px 8px;">' + el.group + '</td></tr>';
    html += '<tr><td style="padding:4px 8px;color:#888;">周期</td><td style="padding:4px 8px;">第' + el.period + '周期</td></tr>';
    html += '<tr><td style="padding:4px 8px;color:#888;">考频</td><td style="padding:4px 8px;">' + freqCN + '</td></tr>';
    html += '</table>';

    // Important compounds
    html += '<div style="margin-bottom:10px;">';
    html += '<div style="font-size:13px;font-weight:bold;color:#333;margin-bottom:4px;">重要化合物</div>';
    html += '<div style="font-size:11px;color:#555;background:#f8fafc;padding:8px;border-radius:4px;">' + el.compounds + '</div>';
    html += '</div>';

    // Exam focus
    html += '<div style="margin-bottom:10px;">';
    html += '<div style="font-size:13px;font-weight:bold;color:#991b1b;margin-bottom:4px;">高考常见考法</div>';
    html += '<div style="font-size:11px;color:#7f1d1d;background:#fef2f2;padding:8px;border-radius:4px;">' + el.exam + '</div>';
    html += '</div>';

    html += '</div>';
    html += '</div>';
    html += '</div>';
    return html;
  };

  PeriodicTable.prototype._renderFilters = function() {
    var s = this._state;
    var html = '<div style="padding:8px 12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:#f8fafc;border-bottom:1px solid #ddd;">';
    html += '<span style="font-size:11px;font-weight:bold;color:#555;">筛选：</span>';

    // Group filter
    html += '<select id="pt-filter-group" style="padding:3px 6px;font-size:11px;">';
    html += '<option value="">按族</option>';
    var allGroups = ['IA','IIA','IIIB','IVB','VB','VIB','VIIB','VIII','IB','IIB','IIIA','IVA','VA','VIA','VIIA','VIIIA'];
    for (var gi = 0; gi < allGroups.length; gi++) {
      html += '<option value="' + allGroups[gi] + '">' + allGroups[gi] + '</option>';
    }
    html += '</select>';

    // Period filter
    html += '<select id="pt-filter-period" style="padding:3px 6px;font-size:11px;">';
    html += '<option value="0">按周期</option>';
    for (var p = 1; p <= 7; p++) {
      html += '<option value="' + p + '">第' + p + '周期</option>';
    }
    html += '</select>';

    // Frequency filter
    html += '<select id="pt-filter-freq" style="padding:3px 6px;font-size:11px;">';
    html += '<option value="">按频率</option>';
    html += '<option value="high">仅超高频</option>';
    html += '<option value="high_medium">高频+中频</option>';
    html += '</select>';

    html += '<button id="pt-filter-clear" style="padding:3px 8px;font-size:11px;background:#94a3b8;color:#fff;border:none;border-radius:4px;cursor:pointer;">清除筛选</button>';

    html += '</div>';
    return html;
  };

  PeriodicTable.prototype._renderPeriodicSVG = function() {
    var self = this;
    if (!self._gridMap) self._buildGridMap();
    var cellW = 48, cellH = 52, gapX = 2, gapY = 2;
    var startX = 20, startY = 50;
    var totalW = 18 * (cellW + gapX) + 40;
    var totalH = 8 * (cellH + gapY) + 20;

    var svgContent = '<svg width="' + totalW + '" height="' + totalH + '" viewBox="0 0 ' + totalW + ' ' + totalH + '" style="display:block;margin:0 auto;">';

    // Draw group headers
    for (var gi = 0; gi < this._groups.length; gi++) {
      var gx = startX + gi * (cellW + gapX) + cellW / 2;
      svgContent += '<text x="' + gx + '" y="18" text-anchor="middle" font-size="9" fill="#888">' + this._groups[gi] + '</text>';
    }

    // Draw cell for each element
    for (var ei = 0; ei < this._elements.length; ei++) {
      var el = this._elements[ei];
      var pos = self._gridMap[el.sym];
      if (!pos) continue;

      var cx = startX + (pos.col - 1) * (cellW + gapX);
      var cy = startY + (pos.row - 1) * (cellH + gapY);
      var dimmed = self._isDimmed(el);
      var bgColor = self._getCellColor(el);
      var textColor = (el.freq === 'high') ? '#fff' : (el.freq === 'medium' ? '#333' : '#666');

      svgContent += '<g class="pt-element-cell" data-sym="' + el.sym + '" style="cursor:pointer;">';
      svgContent += '<rect x="' + cx + '" y="' + cy + '" width="' + cellW + '" height="' + cellH + '" rx="3" fill="' + bgColor + '" stroke="' + (dimmed ? '#ddd' : '#999') + '" stroke-width="1" opacity="' + (dimmed ? '0.4' : '1') + '"/>';
      svgContent += '<text x="' + (cx + 4) + '" y="' + (cy + 14) + '" font-size="9" fill="' + textColor + '" font-weight="bold">' + el.sym + '</text>';
      svgContent += '<text x="' + (cx + cellW - 4) + '" y="' + (cy + 14) + '" text-anchor="end" font-size="7" fill="' + textColor + '">' + el.no + '</text>';
      svgContent += '<text x="' + (cx + cellW/2) + '" y="' + (cy + 32) + '" text-anchor="middle" font-size="7" fill="' + textColor + '">' + el.cn + '</text>';
      svgContent += '</g>';
    }

    svgContent += '</svg>';
    return svgContent;
  };

  PeriodicTable.prototype._bindEvents = function() {
    var self = this;
    var container = document.getElementById('periodic-table-app');
    if (!container) return;

    var overlay = container.querySelector('#pt-detail-overlay');
    if (overlay) {
      overlay.onclick = function(e) {
        if (e.target === overlay) {
          self._state.showDetail = false;
          self._state.selectedElement = null;
          self.render();
        }
      };
    }

    var closeBtn = container.querySelector('#pt-detail-close');
    if (closeBtn) {
      closeBtn.onclick = function() {
        self._state.showDetail = false;
        self._state.selectedElement = null;
        self.render();
      };
    }

    var cells = container.querySelectorAll('.pt-element-cell');
    for (var i = 0; i < cells.length; i++) {
      (function(idx) {
        cells[idx].onclick = function() {
          var sym = this.getAttribute('data-sym');
          self._state.selectedElement = self._findElement(sym);
          self._state.showDetail = true;
          self.render();
        };
      })(i);
    }

    var groupFilter = container.querySelector('#pt-filter-group');
    if (groupFilter) {
      groupFilter.onchange = function() {
        self._state.filterGroup = this.value;
        self.render();
      };
    }

    var periodFilter = container.querySelector('#pt-filter-period');
    if (periodFilter) {
      periodFilter.onchange = function() {
        self._state.filterPeriod = parseInt(this.value) || 0;
        self.render();
      };
    }

    var freqFilter = container.querySelector('#pt-filter-freq');
    if (freqFilter) {
      freqFilter.onchange = function() {
        self._state.filterFreq = this.value;
        self.render();
      };
    }

    var clearBtn = container.querySelector('#pt-filter-clear');
    if (clearBtn) {
      clearBtn.onclick = function() {
        self._state.filterGroup = '';
        self._state.filterPeriod = 0;
        self._state.filterFreq = '';
        self.render();
      };
    }
  };

  PeriodicTable.prototype.render = function() {
    if (!this._state) this._resetState();
    if (!this._gridMap) this._buildGridMap();

    var container = document.getElementById('periodic-table-app');
    if (!container) return;
    try {
    var html = '';
    html += '<div style="font-family:Arial,sans-serif;max-width:1000px;border:1px solid #ddd;border-radius:8px;overflow:hidden;position:relative;">';
    html += '<div style="background:#dc2626;color:#fff;padding:10px 16px;font-size:16px;font-weight:bold;">高考化学交互式元素周期表</div>';
    html += this._renderLegend();
    html += this._renderFilters();
    html += '<div style="padding:10px;overflow-x:auto;">';
    html += this._renderPeriodicSVG();
    html += '</div>';

    if (this._state.showDetail && this._state.selectedElement) {
      html += this._renderDetailPanel();
    }

    html += '<div style="background:#f8fafc;border-top:1px solid #ddd;padding:6px 12px;font-size:10px;color:#999;">';
    html += '点击元素查看详情 | 按颜色区分高考考查频率 | 筛选按钮可按族/周期/频率过滤 | 内嵌20+元素高考考法数据';
    html += '</div>';
    html += '</div>';

    container.innerHTML = html;
    var self = this;
    setTimeout(function() {
      self._bindEvents();
    }, 50);
    } catch (err) {
      console.error('元素周期表渲染失败:', err);
    }
  };

  window.periodicTableInteractive = new PeriodicTable();

})();
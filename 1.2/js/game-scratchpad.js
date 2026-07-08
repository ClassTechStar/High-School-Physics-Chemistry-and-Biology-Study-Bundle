// 游戏化学习工具 - 概念连连看+内置草稿画板

// ============================================================
// 模块1：conceptMatchGame - 概念辨析对对碰
// ============================================================
var conceptMatchGame = (function() {
  'use strict';

  // ---------- 题目数据（21组，按学科分类） ----------
  var allQuestions = [
    // 物理概念混淆（7组）
    { question: '速度的变化率是？', correctAnswer: '加速度', distractors: ['速度', '位移', '速率'], subject: '物理' },
    { question: '物体的惯性由什么决定？', correctAnswer: '质量', distractors: ['速度', '加速度', '位置'], subject: '物理' },
    { question: '静摩擦力方向？', correctAnswer: '与相对运动趋势相反', distractors: ['与运动相反', '与运动相同', '竖直向上'], subject: '物理' },
    { question: '动能与什么成正比？', correctAnswer: '速度的平方', distractors: ['速度', '位移', '质量的平方'], subject: '物理' },
    { question: '开尔文温度单位？', correctAnswer: 'K', distractors: ['\u2103', '\u2109', '\u212A'], subject: '物理' },
    { question: '电容单位？', correctAnswer: 'F（法拉）', distractors: ['C（库仑）', 'V（伏特）', 'A（安培）'], subject: '物理' },
    { question: '等势面上电场力做功？', correctAnswer: '0', distractors: ['正功', '负功', '不确定'], subject: '物理' },
    // 化学概念混淆（7组）
    { question: '电解质导电的条件？', correctAnswer: '溶于水或熔融', distractors: ['只要有离子', '固体状态', '任何状态'], subject: '化学' },
    { question: '化学平衡常数K只与什么有关？', correctAnswer: '温度', distractors: ['浓度', '压强', '催化剂'], subject: '化学' },
    { question: '原电池负极发生？', correctAnswer: '氧化反应', distractors: ['还原反应', '中和反应', '置换反应'], subject: '化学' },
    { question: '同位素的定义？', correctAnswer: '质子数相同中子数不同', distractors: ['质子数不同', '电子数不同', '质量相同'], subject: '化学' },
    { question: 'pH=7的溶液一定中性？', correctAnswer: '不一定', distractors: ['一定', '只有25\u2103时', '否，25\u2103也不一定'], subject: '化学' },
    { question: '胶体的本质特征？', correctAnswer: '粒子直径1-100nm', distractors: ['丁达尔效应', '电泳', '聚沉'], subject: '化学' },
    { question: '催化剂的作用？', correctAnswer: '降低活化能', distractors: ['提高能量', '增加分子数', '改变化学平衡'], subject: '化学' },
    // 生物概念混淆（7组）
    { question: '光反应场所？', correctAnswer: '类囊体薄膜', distractors: ['叶绿体基质', '线粒体内膜', '细胞质'], subject: '生物' },
    { question: '有氧呼吸产CO\u2082阶段？', correctAnswer: '线粒体基质（第二阶段）', distractors: ['细胞质基质', '线粒体内膜', '第一阶段'], subject: '生物' },
    { question: '有丝分裂着丝点分裂时期？', correctAnswer: '后期', distractors: ['前期', '中期', '末期'], subject: '生物' },
    { question: '减数分裂染色体减半发生在？', correctAnswer: '减I末期', distractors: ['减II末期', '减I前期', '减II后期'], subject: '生物' },
    { question: '基因重组发生在？', correctAnswer: '减I前期/后期', distractors: ['有丝分裂', '减II', '受精'], subject: '生物' },
    { question: '转录的模板链是？', correctAnswer: 'DNA一条链', distractors: ['DNA两条链', 'mRNA', 'tRNA'], subject: '生物' },
    { question: '密码子位于？', correctAnswer: 'mRNA', distractors: ['tRNA', 'rRNA', 'DNA'], subject: '生物' }
  ];

  // ---------- 游戏状态 ----------
  var state = {
    mode: 'timed',           // 'timed' | 'unlimited' | 'level'
    level: 1,                // 闯关模式当前关卡
    roundQuestions: [],      // 本轮题目
    answers: [],             // 右侧答案池（打乱后）
    selectedLeftIdx: -1,     // 当前选中的左侧题目索引
    matchedPairs: [],        // 已配对 [{leftIdx, rightIdx, answerText, correct}]
    leftMatched: {},         // 左侧已匹配标记
    rightMatched: {},        // 右侧已匹配标记
    score: 0,
    combo: 0,               // 连击计数
    maxCombo: 0,
    correctCount: 0,
    wrongCount: 0,
    timeLeft: 60,
    totalTime: 60,
    timerInterval: null,
    gameActive: false,
    gameOver: false,
    totalPairs: 0,
    pairsMatched: 0,
    bestScore: 0,
    startTime: 0
  };

  // ---------- 工具函数 ----------
  function shuffle(arr) {
    var a = arr.slice();
    var i, j, tmp;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function pickRandom(arr, n) {
    var shuffled = shuffle(arr);
    return shuffled.slice(0, Math.min(n, shuffled.length));
  }

  function loadBestScore() {
    try {
      var saved = localStorage.getItem('hspcb_concept_game_best');
      if (saved) {
        var data = JSON.parse(saved);
        state.bestScore = data.bestScore || 0;
      }
    } catch (e) { state.bestScore = 0; }
  }

  function saveBestScore() {
    try {
      localStorage.setItem('hspcb_concept_game_best', JSON.stringify({ bestScore: state.bestScore }));
    } catch (e) {}
  }

  // ---------- 游戏逻辑 ----------
  function startGame(mode) {
    // 清理旧状态
    stopTimer();
    state.mode = mode;
    state.level = 1;
    state.score = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.correctCount = 0;
    state.wrongCount = 0;
    state.matchedPairs = [];
    state.leftMatched = {};
    state.rightMatched = {};
    state.selectedLeftIdx = -1;
    state.gameOver = false;
    state.gameActive = true;

    if (mode === 'level') {
      state.totalPairs = 5;
      state.pairsMatched = 0;
      state.timeLeft = 9999;
      state.totalTime = 9999;
      state.level = 1;
    } else if (mode === 'timed') {
      state.totalPairs = 0;
      state.pairsMatched = 0;
      state.timeLeft = 60;
      state.totalTime = 60;
    } else {
      state.totalPairs = 0;
      state.pairsMatched = 0;
      state.timeLeft = 9999;
      state.totalTime = 9999;
    }

    loadBestScore();
    generateRound();
    state.startTime = Date.now();
    if (mode === 'timed') {
      startTimer();
    }
    renderAll();
  }

  function generateRound() {
    var numQ;
    if (state.mode === 'level') {
      numQ = 5; // 每关固定5组
    } else {
      numQ = 5 + Math.floor(Math.random() * 4); // 5-8组
    }
    state.roundQuestions = pickRandom(allQuestions, numQ);
    state.totalPairs = state.roundQuestions.length;
    state.pairsMatched = 0;
    state.leftMatched = {};
    state.rightMatched = {};
    state.matchedPairs = [];
    state.selectedLeftIdx = -1;
    state.combo = 0;

    // 构建右侧答案池：所有正确答案 + 若干干扰项
    var correctAnswers = [];
    var allDistractors = [];
    var i, j;
    for (i = 0; i < state.roundQuestions.length; i++) {
      correctAnswers.push(state.roundQuestions[i].correctAnswer);
      var d = state.roundQuestions[i].distractors;
      for (j = 0; j < d.length; j++) {
        allDistractors.push(d[j]);
      }
    }
    // 选取干扰项：数量约等于题目数
    var extraCount = state.roundQuestions.length;
    if (state.mode === 'level') {
      extraCount = state.level * 2 + 1; // 关卡越高干扰项越多
    }
    var extraDistractors = pickRandom(allDistractors, extraCount);
    // 合并并去重（干扰项可能与某题正确答案相同）
    var answerPool = correctAnswers.concat(extraDistractors);
    // 简单去重
    var seen = {};
    var uniquePool = [];
    for (i = 0; i < answerPool.length; i++) {
      if (!seen[answerPool[i]]) {
        seen[answerPool[i]] = true;
        uniquePool.push(answerPool[i]);
      }
    }
    state.answers = shuffle(uniquePool);
  }

  function startTimer() {
    stopTimer();
    state.timerInterval = setInterval(function() {
      state.timeLeft--;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        endGame();
      }
      updateInfoBar();
    }, 1000);
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function selectLeft(idx) {
    if (!state.gameActive || state.gameOver) return;
    if (state.leftMatched[idx]) return; // 已配对
    state.selectedLeftIdx = idx;
    renderAll();
  }

  function selectRight(idx) {
    if (!state.gameActive || state.gameOver) return;
    if (state.rightMatched[idx]) return; // 已被配对
    if (state.selectedLeftIdx < 0) return; // 未选左侧

    var leftIdx = state.selectedLeftIdx;
    var question = state.roundQuestions[leftIdx];
    var chosenAnswer = state.answers[idx];
    var isCorrect = (chosenAnswer === question.correctAnswer);

    // 标记已配对
    state.leftMatched[leftIdx] = true;
    state.rightMatched[idx] = true;

    if (isCorrect) {
      state.correctCount++;
      state.combo++;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;
      var bonus = 0;
      if (state.combo >= 3) {
        bonus = (state.combo - 2) * 2; // 连击奖励
        state.score += 10 + bonus;
      } else {
        state.score += 10;
      }
    } else {
      state.wrongCount++;
      state.combo = 0;
      state.score = Math.max(0, state.score - 3);
    }

    state.pairsMatched++;
    state.matchedPairs.push({
      leftIdx: leftIdx,
      rightIdx: idx,
      answerText: chosenAnswer,
      correct: isCorrect
    });

    state.selectedLeftIdx = -1;

    // 更新最高分
    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      saveBestScore();
    }

    // 显示反馈
    showFeedback(isCorrect);
    renderAll();

    // 检查是否全部完成
    if (state.pairsMatched >= state.totalPairs) {
      if (state.mode === 'level') {
        if (state.level < 3) {
          // 进入下一关
          setTimeout(function() {
            state.level++;
            state.pairsMatched = 0;
            state.combo = 0;
            generateRound();
            renderAll();
          }, 1500);
        } else {
          // 通关
          setTimeout(function() { endGame(); }, 800);
        }
      } else {
        setTimeout(function() { endGame(); }, 800);
      }
    }
  }

  function showFeedback(isCorrect) {
    var fb = document.getElementById('concept-feedback');
    if (!fb) return;
    fb.style.display = 'block';
    fb.style.opacity = '1';
    if (isCorrect) {
      fb.innerHTML = '<span style="color:#2e7d32;font-size:20px;font-weight:bold;">\u2713 正确！</span>';
      fb.style.backgroundColor = '#e8f5e9';
    } else {
      fb.innerHTML = '<span style="color:#c62828;font-size:20px;font-weight:bold;">\u2717 再想想！</span>';
      fb.style.backgroundColor = '#ffebee';
    }
    setTimeout(function() {
      if (fb) {
        fb.style.opacity = '0';
        setTimeout(function() {
          if (fb) fb.style.display = 'none';
        }, 300);
      }
    }, 1000);
  }

  function endGame() {
    stopTimer();
    state.gameActive = false;
    state.gameOver = true;
    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      saveBestScore();
    }
    renderAll();
  }

  // ---------- 星级评价 ----------
  function getStars() {
    var maxScore = state.totalPairs * 10;
    // 考虑通关模式可能有多个level
    if (state.mode === 'level') maxScore = state.totalPairs * 3 * 10;
    if (maxScore <= 0) return 1;
    var ratio = state.score / maxScore;
    // 限时模式考虑速度加成
    if (state.mode === 'timed' && state.timeLeft > 0) {
      ratio = Math.min(1, ratio + (state.timeLeft / state.totalTime) * 0.3);
    }
    if (ratio >= 0.85) return 3;
    if (ratio >= 0.5) return 2;
    return 1;
  }

  // ---------- 渲染 ----------
  function renderAll() {
    var container = document.getElementById('concept-match-app');
    if (!container) return;

    var html = '';
    // 模式切换按钮
    html += '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">';
    html += buildModeBtn('timed', '\u23f1 限时模式（60秒）');
    html += buildModeBtn('unlimited', '\u221e 无限模式');
    html += buildModeBtn('level', '\U0001f3af 闯关模式');
    html += '</div>';

    // 信息栏
    html += '<div id="concept-info-bar" style="display:flex;gap:20px;align-items:center;padding:10px 16px;background:#f5f5f5;border-radius:8px;margin-bottom:12px;font-size:14px;flex-wrap:wrap;">';
    html += '<span style="font-weight:bold;">\u2b50 得分：<span id="concept-score">' + state.score + '</span></span>';
    if (state.mode === 'timed') {
      html += '<span style="color:' + (state.timeLeft <= 10 ? '#c62828' : '#1565c0') + ';font-weight:bold;">\u23f1 时间：<span id="concept-timer">' + state.timeLeft + 's</span></span>';
    } else if (state.mode === 'level') {
      html += '<span style="font-weight:bold;color:#6a1b9a;">\U0001f3af 第 <span id="concept-level">' + state.level + '</span> / 3 关</span>';
    }
    html += '<span>\U0001f525 连击：<span id="concept-combo">' + state.combo + '</span></span>';
    html += '<span>\U0001f4cb 剩余：<span id="concept-remain">' + (state.totalPairs - state.pairsMatched) + '</span> 组</span>';
    html += '<span style="font-size:12px;color:#888;">\U0001f3c6 最高分：' + state.bestScore + '</span>';
    if (state.mode === 'level') {
      html += '<span style="font-size:12px;color:#666;">正确：' + state.correctCount + ' | 错误：' + state.wrongCount + '</span>';
    }
    html += '</div>';

    // 游戏区域
    html += '<div id="concept-game-area" style="display:flex;position:relative;min-height:300px;gap:20px;">';
    // 左侧列
    html += '<div id="concept-left-col" style="flex:1;display:flex;flex-direction:column;gap:8px;">';
    html += '<div style="font-weight:bold;color:#1565c0;margin-bottom:4px;font-size:15px;">\u2753 概念 / 问题</div>';
    for (var i = 0; i < state.roundQuestions.length; i++) {
      var q = state.roundQuestions[i];
      var isSelected = (i === state.selectedLeftIdx);
      var isMatched = state.leftMatched[i];
      var bg = isSelected ? '#e3f2fd' : (isMatched ? '#f1f8e9' : '#fff');
      var border = isSelected ? '2px solid #1565c0' : (isMatched ? '2px solid #4caf50' : '1px solid #ddd');
      var cursor = isMatched ? 'default' : 'pointer';
      var opacity = isMatched ? '0.7' : '1';
      html += '<div class="concept-left-item" data-idx="' + i + '" style="padding:10px 14px;background:' + bg + ';border:' + border + ';border-radius:6px;cursor:' + cursor + ';opacity:' + opacity + ';transition:all 0.2s;font-size:14px;">';
      html += (isMatched ? '\u2705 ' : '') + q.question;
      html += '</div>';
    }
    html += '</div>';

    // 右侧列
    html += '<div id="concept-right-col" style="flex:1;display:flex;flex-direction:column;gap:8px;">';
    html += '<div style="font-weight:bold;color:#c62828;margin-bottom:4px;font-size:15px;">\u2757 答案 / 混淆项</div>';
    for (var j = 0; j < state.answers.length; j++) {
      var ans = state.answers[j];
      var isRightMatched = state.rightMatched[j];
      var rBg = isRightMatched ? '#f1f8e9' : '#fff';
      var rBorder = isRightMatched ? '2px solid #4caf50' : '1px solid #ddd';
      var rCursor = isRightMatched ? 'default' : 'pointer';
      var rOpacity = isRightMatched ? '0.7' : '1';
      html += '<div class="concept-right-item" data-idx="' + j + '" style="padding:10px 14px;background:' + rBg + ';border:' + rBorder + ';border-radius:6px;cursor:' + rCursor + ';opacity:' + rOpacity + ';transition:all 0.2s;font-size:14px;">';
      html += (isRightMatched ? '\u2705 ' : '') + ans;
      html += '</div>';
    }
    html += '</div>';

    // SVG 连线层
    html += '<svg id="concept-svg" style="position:absolute;top:30px;left:0;width:100%;height:calc(100% - 30px);pointer-events:none;z-index:10;"></svg>';
    html += '</div>';

    // 反馈文字
    html += '<div id="concept-feedback" style="display:none;text-align:center;padding:10px;margin-top:10px;border-radius:8px;transition:opacity 0.3s;"></div>';

    // 结果面板
    if (state.gameOver) {
      html += buildResultHTML();
    }

    container.innerHTML = html;

    // 绑定事件
    bindEvents();
    // 绘制已有连线
    drawAllLines();
  }

  function buildModeBtn(mode, label) {
    var active = (state.mode === mode && state.gameActive) || (state.mode === mode && !state.gameActive && !state.gameOver);
    var bg = active ? '#1565c0' : '#e0e0e0';
    var color = active ? '#fff' : '#333';
    return '<button data-mode="' + mode + '" style="padding:8px 16px;background:' + bg + ';color:' + color + ';border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:bold;">' + label + '</button>';
  }

  function buildResultHTML() {
    var stars = getStars();
    var starStr = '';
    for (var s = 0; s < 3; s++) {
      starStr += (s < stars) ? '\u2605' : '\u2606';
    }
    var elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    var msg = '';
    if (state.mode === 'level') {
      msg = state.level >= 3 && state.pairsMatched >= state.totalPairs ? '\U0001f389 恭喜通关！' : '挑战结束！';
    } else if (state.mode === 'timed' && state.timeLeft <= 0) {
      msg = '\u23f0 时间到！';
    } else {
      msg = '\U0001f389 全部完成！';
    }
    var html = '';
    html += '<div id="concept-result-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;">';
    html += '<div style="background:#fff;border-radius:16px;padding:30px 40px;text-align:center;min-width:300px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">';
    html += '<div style="font-size:36px;margin-bottom:10px;">' + msg + '</div>';
    html += '<div style="font-size:48px;color:#f9a825;margin:10px 0;">' + starStr + '</div>';
    html += '<div style="font-size:16px;margin:6px 0;">得分：<b style="font-size:24px;color:#1565c0;">' + state.score + '</b></div>';
    html += '<div style="font-size:14px;color:#666;">\u2705 正确：' + state.correctCount + '  |  \u274c 错误：' + state.wrongCount + '</div>';
    html += '<div style="font-size:14px;color:#666;">\u23f1 用时：' + elapsed + ' 秒</div>';
    html += '<div style="font-size:14px;color:#666;">\U0001f525 最大连击：' + state.maxCombo + '</div>';
    html += '<div style="font-size:14px;color:#888;margin-top:6px;">\U0001f3c6 历史最高分：' + state.bestScore + '</div>';
    html += '<button id="concept-restart-btn" style="margin-top:18px;padding:10px 30px;background:#1565c0;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:bold;">\U0001f504 再来一局</button>';
    html += '<button id="concept-close-result" style="margin-top:18px;margin-left:10px;padding:10px 20px;background:#e0e0e0;color:#333;border:none;border-radius:8px;cursor:pointer;font-size:14px;">关闭</button>';
    html += '</div></div>';
    return html;
  }

  function updateInfoBar() {
    var scoreEl = document.getElementById('concept-score');
    if (scoreEl) scoreEl.textContent = state.score;
    var timerEl = document.getElementById('concept-timer');
    if (timerEl) timerEl.textContent = state.timeLeft + 's';
    var comboEl = document.getElementById('concept-combo');
    if (comboEl) comboEl.textContent = state.combo;
    var remainEl = document.getElementById('concept-remain');
    if (remainEl) remainEl.textContent = (state.totalPairs - state.pairsMatched);
    var levelEl = document.getElementById('concept-level');
    if (levelEl) levelEl.textContent = state.level;
  }

  function bindEvents() {
    // 模式按钮
    var modeBtns = document.querySelectorAll('#concept-match-app [data-mode]');
    for (var i = 0; i < modeBtns.length; i++) {
      (function(btn) {
        btn.addEventListener('click', function() {
          var m = btn.getAttribute('data-mode');
          if (state.gameActive && m !== state.mode) {
            if (confirm('切换模式将重新开始，确定吗？')) {
              startGame(m);
            }
          } else if (!state.gameActive) {
            startGame(m);
          }
        });
      })(modeBtns[i]);
    }

    // 左侧题目点击
    var leftItems = document.querySelectorAll('#concept-left-col .concept-left-item');
    for (var j = 0; j < leftItems.length; j++) {
      (function(item) {
        item.addEventListener('click', function() {
          var idx = parseInt(item.getAttribute('data-idx'), 10);
          selectLeft(idx);
        });
      })(leftItems[j]);
    }

    // 右侧答案点击
    var rightItems = document.querySelectorAll('#concept-right-col .concept-right-item');
    for (var k = 0; k < rightItems.length; k++) {
      (function(item) {
        item.addEventListener('click', function() {
          var idx = parseInt(item.getAttribute('data-idx'), 10);
          selectRight(idx);
        });
        // hover 预览线
        item.addEventListener('mouseenter', function() {
          if (state.selectedLeftIdx >= 0 && !state.rightMatched[parseInt(item.getAttribute('data-idx'), 10)]) {
            drawPreviewLine(state.selectedLeftIdx, parseInt(item.getAttribute('data-idx'), 10));
          }
        });
        item.addEventListener('mouseleave', function() {
          clearPreviewLine();
        });
      })(rightItems[k]);
    }

    // 再来一局
    var restartBtn = document.getElementById('concept-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', function() {
        var m = state.mode || 'timed';
        startGame(m);
      });
    }

    // 关闭结果
    var closeBtn = document.getElementById('concept-close-result');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        var overlay = document.getElementById('concept-result-overlay');
        if (overlay) overlay.style.display = 'none';
      });
    }
  }

  // ---------- SVG 连线 ----------
  function getAnchor(el, side) {
    if (!el) return { x: 0, y: 0 };
    var rect = el.getBoundingClientRect();
    var svg = document.getElementById('concept-svg');
    if (!svg) return { x: 0, y: 0 };
    var svgRect = svg.getBoundingClientRect();
    return {
      x: (side === 'right') ? (rect.left - svgRect.left) : (rect.right - svgRect.left),
      y: rect.top - svgRect.top + rect.height / 2
    };
  }

  function drawAllLines() {
    clearAllLines();
    var svg = document.getElementById('concept-svg');
    if (!svg) return;
    for (var i = 0; i < state.matchedPairs.length; i++) {
      var pair = state.matchedPairs[i];
      var leftEl = document.querySelector('#concept-left-col .concept-left-item[data-idx="' + pair.leftIdx + '"]');
      var rightEl = document.querySelector('#concept-right-col .concept-right-item[data-idx="' + pair.rightIdx + '"]');
      if (leftEl && rightEl) {
        var p1 = getAnchor(leftEl, 'right');
        var p2 = getAnchor(rightEl, 'left');
        var color = pair.correct ? '#4caf50' : '#f44336';
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', p1.x);
        line.setAttribute('y1', p1.y);
        line.setAttribute('x2', p2.x);
        line.setAttribute('y2', p2.y);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '2.5');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('opacity', '0.8');
        svg.appendChild(line);
      }
    }
  }

  function drawPreviewLine(leftIdx, rightIdx) {
    clearPreviewLine();
    var svg = document.getElementById('concept-svg');
    if (!svg) return;
    var leftEl = document.querySelector('#concept-left-col .concept-left-item[data-idx="' + leftIdx + '"]');
    var rightEl = document.querySelector('#concept-right-col .concept-right-item[data-idx="' + rightIdx + '"]');
    if (leftEl && rightEl) {
      var p1 = getAnchor(leftEl, 'right');
      var p2 = getAnchor(rightEl, 'left');
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      line.setAttribute('stroke', '#ff9800');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-dasharray', '6,3');
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('opacity', '0.7');
      line.setAttribute('id', 'concept-preview-line');
      svg.appendChild(line);
    }
  }

  function clearPreviewLine() {
    var svg = document.getElementById('concept-svg');
    if (!svg) return;
    var preview = svg.querySelector('#concept-preview-line');
    if (preview) preview.parentNode.removeChild(preview);
  }

  function clearAllLines() {
    var svg = document.getElementById('concept-svg');
    if (!svg) return;
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
  }

  // ---------- 公开接口 ----------
  function init() {
    loadBestScore();
    // 初始化为限时模式但未开始
    state.mode = 'timed';
    state.gameActive = false;
    state.gameOver = false;
    state.score = 0;
    state.timeLeft = 60;
    state.roundQuestions = [];
    state.answers = [];
    state.matchedPairs = [];
    state.leftMatched = {};
    state.rightMatched = {};
    state.selectedLeftIdx = -1;
    state.combo = 0;
    state.pairsMatched = 0;
    state.totalPairs = 0;
    renderAll();
  }

  return {
    render: function() {
      init();
    }
  };
})();
window.conceptMatchGame = conceptMatchGame;


// ============================================================
// 模块2：scratchpad - 内置草稿纸/画板
// ============================================================
var scratchpad = (function() {
  'use strict';

  // ---------- 画布状态 ----------
  var canvas = null;
  var ctx = null;
  var previewCanvas = null;
  var previewCtx = null;

  var state = {
    tool: 'pen',          // 'pen' | 'line' | 'circle' | 'rect' | 'eraser' | 'text'
    color: '#000000',
    brushSize: 2,
    showGrid: false,
    showAxes: false,
    isDrawing: false,
    startX: 0,
    startY: 0,
    undoStack: [],
    redoStack: [],
    maxUndo: 20,
    autoSaveInterval: null,
    hasContent: false
  };

  // ---------- 画布操作 ----------
  function getPos(e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function saveState() {
    if (!ctx) return;
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    state.undoStack.push(imageData);
    if (state.undoStack.length > state.maxUndo) {
      state.undoStack.shift();
    }
    state.redoStack = [];
    state.hasContent = true;
  }

  function restoreState(imageData) {
    if (!ctx || !imageData) return;
    ctx.putImageData(imageData, 0, 0);
  }

  function undo() {
    if (state.undoStack.length === 0) return;
    var current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    state.redoStack.push(current);
    var prev = state.undoStack.pop();
    restoreState(prev);
  }

  function redo() {
    if (state.redoStack.length === 0) return;
    var current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    state.undoStack.push(current);
    var next = state.redoStack.pop();
    restoreState(next);
  }

  function clearCanvas() {
    if (state.hasContent && !confirm('确定要清空画布吗？此操作可撤销但不可恢复。')) return;
    saveState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackgroundDecorations();
    state.hasContent = false;
    updateStatusBar();
  }

  function drawBackgroundDecorations() {
    // 网格
    if (state.showGrid) {
      ctx.save();
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 0.5;
      var i;
      for (i = 0; i <= canvas.width; i += 10) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (i = 0; i <= canvas.height; i += 10) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
      ctx.restore();
    }
    // 坐标轴
    if (state.showAxes) {
      ctx.save();
      ctx.strokeStyle = '#90a4ae';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      var cx = canvas.width / 2;
      var cy = canvas.height / 2;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(canvas.width, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      // 箭头标记
      ctx.fillStyle = '#90a4ae';
      ctx.beginPath();
      ctx.moveTo(canvas.width - 5, cy);
      ctx.lineTo(canvas.width - 12, cy - 5);
      ctx.lineTo(canvas.width - 12, cy + 5);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx, 5);
      ctx.lineTo(cx - 5, 12);
      ctx.lineTo(cx + 5, 12);
      ctx.fill();
      ctx.restore();
    }
  }

  function download() {
    if (!canvas) return;
    var link = document.createElement('a');
    link.download = 'scratchpad_' + new Date().toISOString().slice(0, 10) + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function toggleGrid() {
    state.showGrid = !state.showGrid;
    redrawAll();
    updateStatusBar();
  }

  function toggleAxes() {
    state.showAxes = !state.showAxes;
    redrawAll();
    updateStatusBar();
  }

  function redrawAll() {
    if (!ctx) return;
    // 保存当前内容
    var imageData = null;
    if (state.hasContent) {
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackgroundDecorations();
    if (imageData) {
      ctx.putImageData(imageData, 0, 0);
    }
  }

  function autoSave() {
    if (!canvas || !state.hasContent) return;
    try {
      var data = canvas.toDataURL('image/png');
      var saveObj = {
        image: data,
        showGrid: state.showGrid,
        showAxes: state.showAxes,
        time: Date.now()
      };
      localStorage.setItem('hspcb_scratchpad_data', JSON.stringify(saveObj));
    } catch (e) {}
  }

  function autoLoad() {
    try {
      var saved = localStorage.getItem('hspcb_scratchpad_data');
      if (!saved) return;
      var data = JSON.parse(saved);
      if (data.image && ctx) {
        var img = new Image();
        img.onload = function() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          state.hasContent = true;
          state.showGrid = data.showGrid || false;
          state.showAxes = data.showAxes || false;
          drawBackgroundDecorations();
          updateStatusBar();
          // 重新绘制装饰
          if (state.showGrid || state.showAxes) {
            redrawAll();
          }
        };
        img.src = data.image;
      }
      if (data.showGrid !== undefined) state.showGrid = data.showGrid;
      if (data.showAxes !== undefined) state.showAxes = data.showAxes;
    } catch (e) {}
  }

  function updateStatusBar() {
    var sb = document.getElementById('scratchpad-status');
    if (!sb) return;
    var toolNames = { pen: '自由画笔', line: '直线', circle: '圆/椭圆', rect: '矩形', eraser: '橡皮擦', text: '文字' };
    sb.innerHTML = '\U0001f58c 工具：' + (toolNames[state.tool] || state.tool) +
      '  |  \u25cf 颜色：<span style="display:inline-block;width:14px;height:14px;background:' + state.color + ';border:1px solid #999;border-radius:2px;vertical-align:middle;"></span>' +
      '  |  \u2194 笔触：' + state.brushSize + 'px' +
      '  |  \U0001f4e6 网格：' + (state.showGrid ? '开' : '关') +
      '  |  \u2795 坐标轴：' + (state.showAxes ? '开' : '关');
  }

  // ---------- 鼠标事件 ----------
  function onMouseDown(e) {
    if (!canvas) return;
    e.preventDefault();
    var pos = getPos(e);
    state.startX = pos.x;
    state.startY = pos.y;
    state.isDrawing = true;

    if (state.tool === 'text') {
      var text = prompt('请输入标注文字：', '');
      if (text) {
        saveState();
        ctx.font = (state.brushSize * 7) + 'px sans-serif';
        ctx.fillStyle = state.color;
        ctx.fillText(text, pos.x, pos.y);
        state.hasContent = true;
      }
      state.isDrawing = false;
      updateStatusBar();
      return;
    }

    if (state.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, state.brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (state.tool === 'pen') {
      saveState();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      return;
    }

    // 图形工具：先保存状态用于预览
    if (state.tool === 'line' || state.tool === 'circle' || state.tool === 'rect') {
      saveState();
    }
  }

  function onMouseMove(e) {
    if (!canvas || !state.isDrawing) return;
    var pos = getPos(e);

    if (state.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, state.brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (state.tool === 'pen') {
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = state.color;
      ctx.lineWidth = state.brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      return;
    }

    // 图形预览：恢复到保存的状态再绘制预览
    if (state.tool === 'line' || state.tool === 'circle' || state.tool === 'rect') {
      if (state.undoStack.length > 0) {
        restoreState(state.undoStack[state.undoStack.length - 1]);
        drawBackgroundDecorations();
      }
      drawShapePreview(pos);
    }
  }

  function onMouseUp(e) {
    if (!canvas || !state.isDrawing) return;
    state.isDrawing = false;

    if (state.tool === 'eraser') {
      ctx.globalCompositeOperation = 'source-over';
      state.hasContent = true;
      updateStatusBar();
      return;
    }

    if (state.tool === 'pen') {
      ctx.closePath();
      state.hasContent = true;
      updateStatusBar();
      return;
    }

    // 图形工具：最终绘制
    if (state.tool === 'line' || state.tool === 'circle' || state.tool === 'rect') {
      var pos = getPos(e);
      if (state.undoStack.length > 0) {
        restoreState(state.undoStack[state.undoStack.length - 1]);
        drawBackgroundDecorations();
      }
      drawFinalShape(pos);
      state.hasContent = true;
      updateStatusBar();
    }
  }

  function drawShapePreview(pos) {
    ctx.save();
    ctx.strokeStyle = state.color;
    ctx.lineWidth = state.brushSize;
    ctx.setLineDash([4, 4]);
    ctx.fillStyle = 'transparent';

    if (state.tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(state.startX, state.startY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (state.tool === 'circle') {
      var rx = Math.abs(pos.x - state.startX) / 2;
      var ry = Math.abs(pos.y - state.startY) / 2;
      var cx = (pos.x + state.startX) / 2;
      var cy = (pos.y + state.startY) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (state.tool === 'rect') {
      var w = pos.x - state.startX;
      var h = pos.y - state.startY;
      ctx.beginPath();
      ctx.rect(state.startX, state.startY, w, h);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawFinalShape(pos) {
    ctx.strokeStyle = state.color;
    ctx.lineWidth = state.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (state.tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(state.startX, state.startY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (state.tool === 'circle') {
      var rx = Math.abs(pos.x - state.startX) / 2;
      var ry = Math.abs(pos.y - state.startY) / 2;
      var cx = (pos.x + state.startX) / 2;
      var cy = (pos.y + state.startY) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (state.tool === 'rect') {
      var w = pos.x - state.startX;
      var h = pos.y - state.startY;
      ctx.beginPath();
      ctx.rect(state.startX, state.startY, w, h);
      ctx.stroke();
    }
  }

  // ---------- 工具切换 ----------
  function setTool(tool) {
    state.tool = tool;
    // 更新按钮样式
    var btns = document.querySelectorAll('#scratchpad-app .scratchpad-tool-btn');
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var btnTool = btn.getAttribute('data-tool');
      if (btnTool === tool) {
        btn.style.background = '#1565c0';
        btn.style.color = '#fff';
      } else {
        btn.style.background = '#e0e0e0';
        btn.style.color = '#333';
      }
    }
    // 更新光标
    if (canvas) {
      if (tool === 'text') {
        canvas.style.cursor = 'text';
      } else if (tool === 'eraser') {
        canvas.style.cursor = 'cell';
      } else if (tool === 'line' || tool === 'circle' || tool === 'rect') {
        canvas.style.cursor = 'crosshair';
      } else {
        canvas.style.cursor = 'default';
      }
    }
    updateStatusBar();
  }

  function setColor(color) {
    state.color = color;
    // 更新颜色按钮样式
    var presetBtns = document.querySelectorAll('#scratchpad-app .scratchpad-color-btn');
    for (var i = 0; i < presetBtns.length; i++) {
      var btn = presetBtns[i];
      var btnColor = btn.getAttribute('data-color');
      if (btnColor === color) {
        btn.style.border = '3px solid #1565c0';
        btn.style.outline = '2px solid #fff';
      } else {
        btn.style.border = '2px solid #ccc';
        btn.style.outline = 'none';
      }
    }
    var customInput = document.getElementById('scratchpad-custom-color');
    if (customInput) customInput.value = color;
    updateStatusBar();
  }

  function setBrushSize(size) {
    state.brushSize = size;
    var sizeBtns = document.querySelectorAll('#scratchpad-app .scratchpad-size-btn');
    for (var i = 0; i < sizeBtns.length; i++) {
      var btn = sizeBtns[i];
      var btnSize = parseInt(btn.getAttribute('data-size'), 10);
      if (btnSize === size) {
        btn.style.background = '#1565c0';
        btn.style.color = '#fff';
      } else {
        btn.style.background = '#e0e0e0';
        btn.style.color = '#333';
      }
    }
    updateStatusBar();
  }

  // ---------- 渲染 ----------
  function renderUI() {
    var container = document.getElementById('scratchpad-app');
    if (!container) return;

    var html = '';

    // 工具栏
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px;background:#fafafa;border:1px solid #e0e0e0;border-radius:8px 8px 0 0;">';

    // 颜色选择
    html += '<span style="font-size:12px;color:#666;margin-right:4px;">颜色：</span>';
    var colors = ['#000000', '#c62828', '#1565c0', '#2e7d32'];
    var colorNames = ['黑', '红', '蓝', '绿'];
    for (var ci = 0; ci < colors.length; ci++) {
      var isActive = (state.color === colors[ci]);
      html += '<button class="scratchpad-color-btn" data-color="' + colors[ci] + '" title="' + colorNames[ci] + '" style="width:26px;height:26px;border-radius:50%;background:' + colors[ci] + ';border:' + (isActive ? '3px solid #1565c0' : '2px solid #ccc') + ';outline:' + (isActive ? '2px solid #fff' : 'none') + ';cursor:pointer;"></button>';
    }
    html += '<input id="scratchpad-custom-color" type="color" value="' + state.color + '" style="width:28px;height:26px;border:none;cursor:pointer;padding:0;" title="自定义颜色">';

    html += '<span style="color:#e0e0e0;margin:0 4px;">|</span>';

    // 笔触粗细
    html += '<span style="font-size:12px;color:#666;margin-right:4px;">笔触：</span>';
    var sizes = [1, 2, 3, 5];
    for (var si = 0; si < sizes.length; si++) {
      var sActive = (state.brushSize === sizes[si]);
      html += '<button class="scratchpad-size-btn" data-size="' + sizes[si] + '" style="padding:4px 10px;background:' + (sActive ? '#1565c0' : '#e0e0e0') + ';color:' + (sActive ? '#fff' : '#333') + ';border:none;border-radius:4px;cursor:pointer;font-size:12px;">' + sizes[si] + 'px</button>';
    }

    html += '<span style="color:#e0e0e0;margin:0 4px;">|</span>';

    // 图形工具
    html += '<span style="font-size:12px;color:#666;margin-right:4px;">工具：</span>';
    var tools = [
      { id: 'pen', label: '\u270f 画笔' },
      { id: 'eraser', label: '\u274e 橡皮' },
      { id: 'line', label: '\u2571 直线' },
      { id: 'circle', label: '\u25cb 圆' },
      { id: 'rect', label: '\u25a1 矩形' },
      { id: 'text', label: '\U0001f524 文字' }
    ];
    for (var ti = 0; ti < tools.length; ti++) {
      var tActive = (state.tool === tools[ti].id);
      html += '<button class="scratchpad-tool-btn" data-tool="' + tools[ti].id + '" style="padding:5px 10px;background:' + (tActive ? '#1565c0' : '#e0e0e0') + ';color:' + (tActive ? '#fff' : '#333') + ';border:none;border-radius:4px;cursor:pointer;font-size:12px;">' + tools[ti].label + '</button>';
    }

    html += '<span style="color:#e0e0e0;margin:0 4px;">|</span>';

    // 操作按钮
    html += '<button id="scratchpad-undo" style="padding:5px 10px;background:#fff3e0;color:#e65100;border:1px solid #ffcc80;border-radius:4px;cursor:pointer;font-size:12px;" title="撤销（最近20步）">\u21a9 撤销</button>';
    html += '<button id="scratchpad-redo" style="padding:5px 10px;background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;border-radius:4px;cursor:pointer;font-size:12px;" title="重做">\u21aa 重做</button>';
    html += '<button id="scratchpad-grid" style="padding:5px 10px;background:' + (state.showGrid ? '#1565c0' : '#e0e0e0') + ';color:' + (state.showGrid ? '#fff' : '#333') + ';border:none;border-radius:4px;cursor:pointer;font-size:12px;" title="切换网格背景">\u2394 网格</button>';
    html += '<button id="scratchpad-axes" style="padding:5px 10px;background:' + (state.showAxes ? '#1565c0' : '#e0e0e0') + ';color:' + (state.showAxes ? '#fff' : '#333') + ';border:none;border-radius:4px;cursor:pointer;font-size:12px;" title="坐标轴">\u2795 坐标轴</button>';
    html += '<button id="scratchpad-clear" style="padding:5px 10px;background:#ffebee;color:#c62828;border:1px solid #ef9a9a;border-radius:4px;cursor:pointer;font-size:12px;">\U0001f5d1 清空</button>';
    html += '<button id="scratchpad-download" style="padding:5px 10px;background:#e3f2fd;color:#1565c0;border:1px solid #90caf9;border-radius:4px;cursor:pointer;font-size:12px;">\u2b07 下载PNG</button>';

    html += '</div>';

    // 画布区域
    html += '<div style="position:relative;border:1px solid #e0e0e0;border-top:none;background:#fff;line-height:0;">';
    html += '<canvas id="scratchpad-canvas" width="600" height="400" style="display:block;cursor:default;width:100%;max-width:600px;height:auto;" title="在此绘画"></canvas>';
    html += '</div>';

    // 状态栏
    html += '<div id="scratchpad-status" style="padding:6px 12px;background:#f5f5f5;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px;font-size:12px;color:#666;"></div>';

    container.innerHTML = html;

    // 初始化 canvas
    initCanvas();
    // 加载保存数据
    setTimeout(function() { autoLoad(); }, 100);
    // 绘制初始装饰
    drawBackgroundDecorations();
    updateStatusBar();

    // 绑定事件
    bindScratchpadEvents();
    // 启动自动保存
    startAutoSave();
  }

  function initCanvas() {
    canvas = document.getElementById('scratchpad-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', function() {
      if (state.isDrawing) {
        onMouseUp({ clientX: 0, clientY: 0 });
      }
    });
  }

  function bindScratchpadEvents() {
    // 颜色预设按钮
    var colorBtns = document.querySelectorAll('#scratchpad-app .scratchpad-color-btn');
    for (var i = 0; i < colorBtns.length; i++) {
      (function(btn) {
        btn.addEventListener('click', function() {
          setColor(btn.getAttribute('data-color'));
        });
      })(colorBtns[i]);
    }

    // 自定义颜色
    var customInput = document.getElementById('scratchpad-custom-color');
    if (customInput) {
      customInput.addEventListener('input', function() {
        state.color = customInput.value;
        updateStatusBar();
      });
      customInput.addEventListener('change', function() {
        state.color = customInput.value;
        setColor(state.color);
      });
    }

    // 笔触大小按钮
    var sizeBtns = document.querySelectorAll('#scratchpad-app .scratchpad-size-btn');
    for (var j = 0; j < sizeBtns.length; j++) {
      (function(btn) {
        btn.addEventListener('click', function() {
          setBrushSize(parseInt(btn.getAttribute('data-size'), 10));
        });
      })(sizeBtns[j]);
    }

    // 工具按钮
    var toolBtns = document.querySelectorAll('#scratchpad-app .scratchpad-tool-btn');
    for (var k = 0; k < toolBtns.length; k++) {
      (function(btn) {
        btn.addEventListener('click', function() {
          setTool(btn.getAttribute('data-tool'));
        });
      })(toolBtns[k]);
    }

    // 操作按钮
    var undoBtn = document.getElementById('scratchpad-undo');
    if (undoBtn) undoBtn.addEventListener('click', function() { undo(); });

    var redoBtn = document.getElementById('scratchpad-redo');
    if (redoBtn) redoBtn.addEventListener('click', function() { redo(); });

    var gridBtn = document.getElementById('scratchpad-grid');
    if (gridBtn) gridBtn.addEventListener('click', function() { toggleGrid(); renderUI(); });

    var axesBtn = document.getElementById('scratchpad-axes');
    if (axesBtn) axesBtn.addEventListener('click', function() { toggleAxes(); renderUI(); });

    var clearBtn = document.getElementById('scratchpad-clear');
    if (clearBtn) clearBtn.addEventListener('click', function() { clearCanvas(); });

    var downloadBtn = document.getElementById('scratchpad-download');
    if (downloadBtn) downloadBtn.addEventListener('click', function() { download(); });
  }

  function startAutoSave() {
    if (state.autoSaveInterval) clearInterval(state.autoSaveInterval);
    state.autoSaveInterval = setInterval(function() {
      autoSave();
    }, 10000);
  }

  // 页面离开前保存
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', function() {
      autoSave();
    });
  }

  // ---------- 公开接口 ----------
  return {
    render: function() {
      renderUI();
    }
  };
})();
window.scratchpad = scratchpad;


// ============================================================
// 模块3：cardMatchGame - 诗词配对+公式配对翻牌游戏
// ============================================================
var cardMatchGame = (function() {
  'use strict';

  // ---------- 题目数据 ----------
  // 诗词配对：诗题 <-> 首句（选自高考必背60篇）
  var poetryPairs = [
    { front: '静夜思', back: '床前明月光' },
    { front: '春望', back: '国破山河在' },
    { front: '望岳', back: '岱宗夫如何' },
    { front: '登高', back: '风急天高猿啸哀' },
    { front: '蜀相', back: '丞相祠堂何处寻' },
    { front: '锦瑟', back: '锦瑟无端五十弦' },
    { front: '行路难', back: '金樽清酒斗十千' },
    { front: '将进酒', back: '君不见黄河之水天上来' },
    { front: '水调歌头', back: '明月几时有' },
    { front: '念奴娇·赤壁怀古', back: '大江东去' },
    { front: '声声慢', back: '寻寻觅觅' },
    { front: '雨霖铃', back: '寒蝉凄切' },
    { front: '永遇乐·京口北固亭怀古', back: '千古江山' },
    { front: '琵琶行', back: '浔阳江头夜送客' },
    { front: '钗头凤', back: '红酥手' },
    { front: '江城子·密州出猎', back: '老夫聊发少年狂' },
    { front: '破阵子', back: '醉里挑灯看剑' }
  ];

  // 公式配对：公式名 <-> 公式表达式（数学+物理）
  var formulaPairs = [
    { front: '勾股定理', back: 'a\u00b2+b\u00b2=c\u00b2' },
    { front: '牛顿第二定律', back: 'F=ma' },
    { front: '等差数列通项', back: 'a\u2099=a\u2081+(n-1)d' },
    { front: '等比数列通项', back: 'a\u2099=a\u2081\u00b7q^(n-1)' },
    { front: '万有引力定律', back: 'F=Gm\u2081m\u2082/r\u00b2' },
    { front: '动能定理', back: 'W=\u0394Ek' },
    { front: '欧姆定律', back: 'I=U/R' },
    { front: '法拉第电磁感应', back: 'E=n\u00b7\u0394\u03a6/\u0394t' },
    { front: '理想气体状态方程', back: 'PV=nRT' },
    { front: '质能方程', back: 'E=mc\u00b2' },
    { front: '正弦定理', back: 'a/sinA=b/sinB=c/sinC' },
    { front: '余弦定理', back: 'c\u00b2=a\u00b2+b\u00b2-2ab\u00b7cosC' },
    { front: '韦达定理', back: 'x\u2081+x\u2082=-b/a' },
    { front: '基本不等式', back: 'a+b\u22652\u221a(ab)' },
    { front: '焦耳定律', back: 'Q=I\u00b2Rt' },
    { front: '浮力公式', back: 'F=\u03c1gV' },
    { front: '动量守恒', back: 'm\u2081v\u2081+m\u2082v\u2082=m\u2081v\u2081\u2032+m\u2082v\u2082\u2032' }
  ];

  var dataSets = {
    poetry: { name: '\u8bd7\u8bcd\u914d\u5bf9', pairs: poetryPairs, color: '#6a1b9a' },
    formula: { name: '\u516c\u5f0f\u914d\u5bf9', pairs: formulaPairs, color: '#1565c0' }
  };

  // ---------- 游戏状态 ----------
  var state = {
    dataSet: 'poetry',
    cards: [],
    firstFlipped: -1,
    secondFlipped: -1,
    moves: 0,
    matchedCount: 0,
    totalPairs: 0,
    score: 0,
    timeLeft: 60,
    totalTime: 60,
    timerInterval: null,
    gameActive: false,
    gameOver: false,
    bestScore: 0,
    startTime: 0,
    lockBoard: false
  };

  // ---------- 工具函数 ----------
  function shuffle(arr) {
    var a = arr.slice();
    var i, j, tmp;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function loadBestScore() {
    try {
      var saved = localStorage.getItem('hspcb_card_game_best');
      if (saved) {
        var data = JSON.parse(saved);
        state.bestScore = data.bestScore || 0;
      }
    } catch (e) { state.bestScore = 0; }
  }

  function saveBestScore() {
    try {
      localStorage.setItem('hspcb_card_game_best', JSON.stringify({ bestScore: state.bestScore }));
    } catch (e) {}
  }

  // ---------- 游戏逻辑 ----------
  function startGame() {
    stopTimer();
    state.moves = 0;
    state.matchedCount = 0;
    state.score = 0;
    state.firstFlipped = -1;
    state.secondFlipped = -1;
    state.gameOver = false;
    state.gameActive = true;
    state.lockBoard = false;
    state.timeLeft = 60;
    state.totalTime = 60;

    generateCards();
    state.startTime = Date.now();
    startTimer();
    renderAll();
  }

  function generateCards() {
    var pairs = dataSets[state.dataSet].pairs;
    var selected = shuffle(pairs).slice(0, Math.min(8, pairs.length));
    state.totalPairs = selected.length;
    var cards = [];
    var i;
    for (i = 0; i < selected.length; i++) {
      cards.push({ pairId: i, text: selected[i].front, flipped: false, matched: false });
      cards.push({ pairId: i, text: selected[i].back, flipped: false, matched: false });
    }
    state.cards = shuffle(cards);
  }

  function startTimer() {
    stopTimer();
    state.timerInterval = setInterval(function() {
      state.timeLeft--;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        endGame();
      }
      updateInfoBar();
    }, 1000);
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function flipCard(idx) {
    if (!state.gameActive || state.gameOver || state.lockBoard) return;
    if (state.cards[idx].flipped || state.cards[idx].matched) return;

    state.cards[idx].flipped = true;

    if (state.firstFlipped < 0) {
      state.firstFlipped = idx;
      renderAll();
      return;
    }

    state.secondFlipped = idx;
    state.moves++;
    renderAll();

    var card1 = state.cards[state.firstFlipped];
    var card2 = state.cards[state.secondFlipped];

    if (card1.pairId === card2.pairId) {
      card1.matched = true;
      card2.matched = true;
      state.matchedCount++;
      state.score += 10;
      if (state.matchedCount >= state.totalPairs) {
        state.score += state.timeLeft * 2;
        if (state.score > state.bestScore) {
          state.bestScore = state.score;
          saveBestScore();
        }
        setTimeout(function() { endGame(); }, 500);
      }
      state.firstFlipped = -1;
      state.secondFlipped = -1;
      setTimeout(function() { renderAll(); }, 300);
    } else {
      state.lockBoard = true;
      var f1 = state.firstFlipped;
      var f2 = state.secondFlipped;
      setTimeout(function() {
        state.cards[f1].flipped = false;
        state.cards[f2].flipped = false;
        state.firstFlipped = -1;
        state.secondFlipped = -1;
        state.lockBoard = false;
        renderAll();
      }, 1000);
    }

    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      saveBestScore();
    }
  }

  function endGame() {
    stopTimer();
    state.gameActive = false;
    state.gameOver = true;
    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      saveBestScore();
    }
    renderAll();
  }

  // ---------- 星级评价 ----------
  function getStars() {
    var maxScore = state.totalPairs * 10;
    if (maxScore <= 0) return 1;
    var ratio = state.matchedCount / state.totalPairs;
    if (state.gameOver && state.timeLeft > 0 && state.matchedCount >= state.totalPairs) {
      ratio = Math.min(1, ratio + (state.timeLeft / state.totalTime) * 0.3);
    }
    if (ratio >= 0.85) return 3;
    if (ratio >= 0.5) return 2;
    return 1;
  }

  // ---------- 渲染 ----------
  function renderAll() {
    var container = document.getElementById('card-match-app');
    if (!container) return;

    var html = '';
    var ds = dataSets[state.dataSet];

    // 游戏选择器
    html += '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center;">';
    html += '<span style="font-weight:bold;font-size:14px;">\u6e38\u620f\u9009\u62e9\uff1a</span>';
    var dsKeys = ['poetry', 'formula'];
    var d;
    for (d = 0; d < dsKeys.length; d++) {
      var key = dsKeys[d];
      var active = (state.dataSet === key);
      var bg = active ? dataSets[key].color : '#e0e0e0';
      var color = active ? '#fff' : '#333';
      html += '<button class="card-dataset-btn" data-dataset="' + key + '" style="padding:8px 16px;background:' + bg + ';color:' + color + ';border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:bold;">' + dataSets[key].name + '</button>';
    }
    html += '</div>';

    // 信息栏
    html += '<div id="card-info-bar" style="display:flex;gap:20px;align-items:center;padding:10px 16px;background:#f5f5f5;border-radius:8px;margin-bottom:12px;font-size:14px;flex-wrap:wrap;">';
    html += '<span style="font-weight:bold;">\u2b50 \u5f97\u5206\uff1a<span id="card-score">' + state.score + '</span></span>';
    html += '<span style="color:' + (state.timeLeft <= 10 ? '#c62828' : '#1565c0') + ';font-weight:bold;">\u23f1 \u65f6\u95f4\uff1a<span id="card-timer">' + state.timeLeft + 's</span></span>';
    html += '<span>\U0001f4cb \u7ffb\u724c\u6b21\u6570\uff1a<span id="card-moves">' + state.moves + '</span></span>';
    html += '<span>\u2705 \u5df2\u914d\u5bf9\uff1a<span id="card-matched">' + state.matchedCount + '</span>/' + state.totalPairs + '</span>';
    html += '<span style="font-size:12px;color:#888;">\U0001f3c6 \u6700\u9ad8\u5206\uff1a' + state.bestScore + '</span>';
    html += '</div>';

    // 游戏区域
    if (!state.gameActive && !state.gameOver) {
      html += '<div style="text-align:center;padding:40px;background:#f5f5f5;border-radius:8px;">';
      html += '<div style="font-size:18px;margin-bottom:20px;">\U0001f3af ' + ds.name + '</div>';
      html += '<p style="color:#666;margin-bottom:20px;">\u70b9\u51fb\u5361\u7247\u7ffb\u9762\uff0c\u627e\u51fa\u6240\u6709\u914d\u5bf9\uff01\u9650\u65f660\u79d2\uff0c\u914d\u5bf9\u6210\u529f\u5f9710\u5206\uff0c\u5b8c\u6210\u65f6\u5269\u4f59\u6bcf\u79d2\u989d\u5916\u52a02\u5206\u3002</p>';
      html += '<button id="card-start-btn" style="padding:12px 40px;background:' + ds.color + ';color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:bold;">\U0001f3ae \u5f00\u59cb\u6e38\u620f</button>';
      html += '</div>';
    } else {
      // \u5361\u7247\u7f51\u683c
      html += '<div id="card-grid" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">';
      var i;
      for (i = 0; i < state.cards.length; i++) {
        var card = state.cards[i];
        var isFlipped = card.flipped || card.matched;
        var cardBg = card.matched ? '#e8f5e9' : (isFlipped ? '#e3f2fd' : ds.color);
        var cardColor = card.matched ? '#2e7d32' : (isFlipped ? '#1565c0' : '#fff');
        var cardBorder = card.matched ? '2px solid #4caf50' : (isFlipped ? '2px solid #1565c0' : '2px solid ' + ds.color);
        var cursor = (isFlipped || state.lockBoard) ? 'default' : 'pointer';
        var displayText = isFlipped ? card.text : '\uff1f';
        var fontSize = isFlipped ? (card.text.length > 6 ? '12px' : '14px') : '28px';
        html += '<div class="card-item" data-idx="' + i + '" style="width:110px;height:110px;display:flex;align-items:center;justify-content:center;background:' + cardBg + ';color:' + cardColor + ';border:' + cardBorder + ';border-radius:8px;cursor:' + cursor + ';font-size:' + fontSize + ';font-weight:bold;text-align:center;padding:4px;transition:all 0.3s;user-select:none;word-break:break-all;box-shadow:0 2px 4px rgba(0,0,0,0.1);">';
        html += displayText;
        html += '</div>';
      }
      html += '</div>';
    }

    // \u7ed3\u679c\u9762\u677f
    if (state.gameOver) {
      html += buildResultHTML();
    }

    container.innerHTML = html;
    bindEvents();
  }

  function buildResultHTML() {
    var stars = getStars();
    var starStr = '';
    var s;
    for (s = 0; s < 3; s++) {
      starStr += (s < stars) ? '\u2605' : '\u2606';
    }
    var elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    var allMatched = (state.matchedCount >= state.totalPairs);
    var msg = allMatched ? '\U0001f389 \u5168\u90e8\u914d\u5bf9\u6210\u529f\uff01' : (state.timeLeft <= 0 ? '\u23f0 \u65f6\u95f4\u5230\uff01' : '\u6e38\u620f\u7ed3\u675f\uff01');
    var ds = dataSets[state.dataSet];
    var html = '';
    html += '<div id="card-result-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;">';
    html += '<div style="background:#fff;border-radius:16px;padding:30px 40px;text-align:center;min-width:300px;box-shadow:0 8px 32px rgba(0,0,0,0.3);">';
    html += '<div style="font-size:36px;margin-bottom:10px;">' + msg + '</div>';
    html += '<div style="font-size:48px;color:#f9a825;margin:10px 0;">' + starStr + '</div>';
    html += '<div style="font-size:16px;margin:6px 0;">\u5f97\u5206\uff1a<b style="font-size:24px;color:' + ds.color + ';">' + state.score + '</b></div>';
    html += '<div style="font-size:14px;color:#666;">\u2705 \u914d\u5bf9\uff1a' + state.matchedCount + '/' + state.totalPairs + '</div>';
    html += '<div style="font-size:14px;color:#666;">\U0001f4cb \u7ffb\u724c\u6b21\u6570\uff1a' + state.moves + '</div>';
    html += '<div style="font-size:14px;color:#666;">\u23f1 \u7528\u65f6\uff1a' + elapsed + ' \u79d2</div>';
    html += '<div style="font-size:14px;color:#888;margin-top:6px;">\U0001f3c6 \u5386\u53f2\u6700\u9ad8\u5206\uff1a' + state.bestScore + '</div>';
    html += '<button id="card-restart-btn" style="margin-top:18px;padding:10px 30px;background:' + ds.color + ';color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:16px;font-weight:bold;">\U0001f504 \u518d\u6765\u4e00\u5c40</button>';
    html += '<button id="card-close-result" style="margin-top:18px;margin-left:10px;padding:10px 20px;background:#e0e0e0;color:#333;border:none;border-radius:8px;cursor:pointer;font-size:14px;">\u5173\u95ed</button>';
    html += '</div></div>';
    return html;
  }

  function updateInfoBar() {
    var scoreEl = document.getElementById('card-score');
    if (scoreEl) scoreEl.textContent = state.score;
    var timerEl = document.getElementById('card-timer');
    if (timerEl) timerEl.textContent = state.timeLeft + 's';
    var movesEl = document.getElementById('card-moves');
    if (movesEl) movesEl.textContent = state.moves;
    var matchedEl = document.getElementById('card-matched');
    if (matchedEl) matchedEl.textContent = state.matchedCount;
  }

  function bindEvents() {
    // \u6570\u636e\u96c6\u6309\u94ae
    var dsBtns = document.querySelectorAll('#card-match-app .card-dataset-btn');
    var i;
    for (i = 0; i < dsBtns.length; i++) {
      (function(btn) {
        btn.addEventListener('click', function() {
          var key = btn.getAttribute('data-dataset');
          if (key !== state.dataSet) {
            if (state.gameActive) {
              if (confirm('\u5207\u6362\u6e38\u620f\u5c06\u91cd\u65b0\u5f00\u59cb\uff0c\u786e\u5b9a\u5417\uff1f')) {
                state.dataSet = key;
                startGame();
              }
            } else {
              state.dataSet = key;
              init();
            }
          }
        });
      })(dsBtns[i]);
    }

    // \u5f00\u59cb\u6309\u94ae
    var startBtn = document.getElementById('card-start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', function() {
        startGame();
      });
    }

    // \u5361\u7247\u70b9\u51fb
    var cardItems = document.querySelectorAll('#card-grid .card-item');
    var j;
    for (j = 0; j < cardItems.length; j++) {
      (function(item) {
        item.addEventListener('click', function() {
          var idx = parseInt(item.getAttribute('data-idx'), 10);
          flipCard(idx);
        });
      })(cardItems[j]);
    }

    // \u518d\u6765\u4e00\u5c40
    var restartBtn = document.getElementById('card-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', function() {
        startGame();
      });
    }

    // \u5173\u95ed\u7ed3\u679c
    var closeBtn = document.getElementById('card-close-result');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        var overlay = document.getElementById('card-result-overlay');
        if (overlay) overlay.style.display = 'none';
      });
    }
  }

  // ---------- \u516c\u5f00\u63a5\u53e3 ----------
  function init() {
    loadBestScore();
    state.gameActive = false;
    state.gameOver = false;
    state.score = 0;
    state.moves = 0;
    state.matchedCount = 0;
    state.totalPairs = 0;
    state.cards = [];
    state.firstFlipped = -1;
    state.secondFlipped = -1;
    state.timeLeft = 60;
    renderAll();
  }

  return {
    render: function() {
      init();
    }
  };
})();
window.cardMatchGame = cardMatchGame;

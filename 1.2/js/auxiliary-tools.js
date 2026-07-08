// 辅助学习工具模块
// 包含：examVariation(真题变式生成器)、wrongVariationGen(错题变式生成)、
//       studyCalendar(学习日历)、examStrategy(考前策略)、interactiveMistakes(交互式易错点)
// 兼容 ES5，零依赖，数据内嵌

// ============================================================
// 1. 真题变式生成器 examVariation
// ============================================================
var examVariation = (function () {
    var state = {
        subject: '',
        year: '',
        qid: '',
        variationType: '' // data | context | questioning
    };

    // 内嵌10道可变式真题模板
    var bank = [
        { id: 'p-2023-1', subject: '物理', year: '2023', title: '匀变速直线运动',
          stem: '一辆汽车以初速度 v₀=10 m/s 在水平路面上做匀加速直线运动，加速度 a=2 m/s²，求 5 s 末的速度和 5 s 内的位移。',
          answer: 'v = v₀ + at = 10 + 2×5 = 20 m/s；x = v₀t + ½at² = 10×5 + ½×2×25 = 75 m',
          kp: '匀变速直线运动公式' },
        { id: 'p-2023-2', subject: '物理', year: '2023', title: '平抛运动',
          stem: '从高 h=20 m 处水平抛出一小球，初速度 v₀=5 m/s，g取10 m/s²，求小球落地时间和水平射程。',
          answer: 't = √(2h/g) = √(2×20/10) = 2 s；x = v₀t = 5×2 = 10 m',
          kp: '平抛运动分解' },
        { id: 'p-2022-1', subject: '物理', year: '2022', title: '牛顿第二定律',
          stem: '质量 m=2 kg 的物体在水平拉力 F=10 N 作用下沿水平面匀加速运动，动摩擦因数 μ=0.2，g取10 m/s²，求加速度。',
          answer: 'F - μmg = ma → 10 - 0.2×2×10 = 2a → a = 3 m/s²',
          kp: '牛顿第二定律应用' },
        { id: 'p-2022-2', subject: '物理', year: '2022', title: '动能定理',
          stem: '质量 m=1 kg 的物体从高 h=5 m 处自由下落，g取10 m/s²，求落地时动能和速度。',
          answer: 'Ek = mgh = 1×10×5 = 50 J；v = √(2gh) = √100 = 10 m/s',
          kp: '动能定理' },
        { id: 'c-2023-1', subject: '化学', year: '2023', title: '氧化还原反应',
          stem: '将铜片加入 100 mL 6 mol/L 的浓硝酸中，反应生成 NO₂ 气体。写出反应方程式并标出电子转移方向。',
          answer: 'Cu + 4HNO₃(浓) → Cu(NO₃)₂ + 2NO₂↑ + 2H₂O；Cu 失 2e⁻，N 得 1e⁻×2',
          kp: '氧化还原方程式配平' },
        { id: 'c-2023-2', subject: '化学', year: '2023', title: '化学平衡',
          stem: '在密闭容器中发生反应 N₂ + 3H₂ ⇌ 2NH₃（放热），达到平衡后，升高温度平衡如何移动？',
          answer: '正反应放热，升高温度平衡逆向移动（向左），NH₃ 浓度减小',
          kp: '化学平衡移动原理' },
        { id: 'c-2022-1', subject: '化学', year: '2022', title: '电解池',
          stem: '用惰性电极电解 200 mL CuSO₄ 溶液，通电一段时间后阴极析出 6.4 g 铜，求通过电量。',
          answer: 'n(Cu) = 6.4/64 = 0.1 mol；Q = 2×0.1×96500 = 19300 C',
          kp: '电解池计算' },
        { id: 'b-2023-1', subject: '生物', year: '2023', title: '光合作用',
          stem: '在适宜条件下，某植物叶片在光照强度为 800 μmol/(m²·s) 时，CO₂ 吸收速率为 20 mg/(dm²·h)，求净光合速率。',
          answer: '净光合速率 = CO₂ 吸收速率 = 20 mg/(dm²·h)',
          kp: '光合速率测定' },
        { id: 'b-2023-2', subject: '生物', year: '2023', title: '遗传定律',
          stem: '豌豆高茎(D)对矮茎(d)为显性，Dd × Dd 杂交后代中矮茎所占比例为多少？',
          answer: 'Dd × Dd → 1DD:2Dd:1dd，矮茎 dd 占 1/4 = 25%',
          kp: '分离定律' },
        { id: 'b-2022-1', subject: '生物', year: '2022', title: '细胞呼吸',
          stem: '酵母菌在无氧条件下分解 1 mol 葡萄糖，生成酒精和 CO₂，求产生 ATP 数量。',
          answer: '无氧呼吸第一阶段 2 ATP + 第二阶段 0 ATP = 共 2 ATP',
          kp: '细胞呼吸产能' }
    ];

    function getSubjects() {
        var s = [];
        bank.forEach(function (q) { if (s.indexOf(q.subject) < 0) s.push(q.subject); });
        return s;
    }
    function getYears(subj) {
        var y = [];
        bank.filter(function (q) { return q.subject === subj; }).forEach(function (q) {
            if (y.indexOf(q.year) < 0) y.push(q.year);
        });
        return y.sort().reverse();
    }
    function getQuestions(subj, year) {
        return bank.filter(function (q) { return q.subject === subj && q.year === year; });
    }

    // 改数据：对题干中数字 ±20%
    function varyData(stem, answer) {
        function shift(text) {
            return text.replace(/(\d+(?:\.\d+)?)/g, function (m) {
                var n = parseFloat(m);
                var delta = (Math.random() * 0.4 - 0.2); // -20% ~ +20%
                var v = n * (1 + delta);
                return (Math.round(v * 100) / 100).toString();
            });
        }
        return { stem: shift(stem), answer: shift(answer) };
    }

    // 改情境：替换背景描述
    var contextMap = {
        '汽车': '电动车', '小球': '小石块', '铜片': '铜粉',
        '豌豆': '番茄', '酵母菌': '乳酸菌', '植物叶片': '菠菜叶片',
        '水平路面': '倾斜坡面', '密闭容器': '高压反应釜'
    };
    function varyContext(stem) {
        var s = stem;
        for (var k in contextMap) {
            if (contextMap.hasOwnProperty(k) && s.indexOf(k) >= 0) {
                s = s.split(k).join(contextMap[k]);
            }
        }
        if (s === stem) s = '【新情境】' + stem;
        return s;
    }

    // 改问法：正问反问互换
    function varyQuestioning(stem, answer) {
        // 简单规则：把"求X"改为"已知X，求Y"
        var m = stem.match(/求(.+?)[。.？?]/);
        if (m) {
            var target = m[1];
            return {
                stem: stem.replace(/求.+?[。.？?]/, '已知 ' + target + ' 为 ' + (answer.split('=')[1] || '某值') + '，反推题目中其他未知量。'),
                answer: '反向求解：依据原方程逆向运算可得原题给定的初值。'
            };
        }
        return { stem: '【反向提问】若已知结果：' + answer + '，请反推题目应给出的条件。', answer: '反推条件即为原题干中给定的数值。' };
    }

    function generate() {
        var q = bank.filter(function (x) { return x.id === state.qid; })[0];
        if (!q) return;
        var v;
        if (state.variationType === 'data') {
            var r = varyData(q.stem, q.answer);
            v = { stem: r.stem, answer: r.answer, type: '改数据(±20%)' };
        } else if (state.variationType === 'context') {
            v = { stem: varyContext(q.stem), answer: q.answer, type: '改情境(换背景)' };
        } else if (state.variationType === 'questioning') {
            var r2 = varyQuestioning(q.stem, q.answer);
            v = { stem: r2.stem, answer: r2.answer, type: '改问法(正反互换)' };
        } else {
            v = { stem: q.stem, answer: q.answer, type: '原题' };
        }
        state.variation = v;
        render();
    }

    function render() {
        var app = document.getElementById('exam-variation-app');
        if (!app) return;
        var html = '<div style="padding:16px;font-family:Microsoft YaHei,Segoe UI,sans-serif;">';
        html += '<h3 style="margin:0 0 12px;color:#0f172a;">🔄 真题变式生成器</h3>';
        html += '<p style="color:#64748b;font-size:13px;margin:0 0 12px;">对历年真题进行改数据/改情境/改问法，生成同源变式题强化训练。</p>';

        // 步骤1：科目
        var subs = getSubjects();
        html += '<div style="margin-bottom:10px;"><strong style="color:#1e40af;">① 选择科目：</strong> ';
        subs.forEach(function (s) {
            var sel = state.subject === s ? '#3b82f6;color:#fff;' : '#f1f5f9;color:#475569;';
            html += '<button data-ev="subj" data-v="' + s + '" style="margin:0 4px 4px 0;padding:5px 12px;border:0;border-radius:6px;cursor:pointer;background:' + sel + '">' + s + '</button>';
        });
        html += '</div>';

        if (state.subject) {
            var years = getYears(state.subject);
            html += '<div style="margin-bottom:10px;"><strong style="color:#1e40af;">② 选择年份：</strong> ';
            years.forEach(function (y) {
                var sel = state.year === y ? '#3b82f6;color:#fff;' : '#f1f5f9;color:#475569;';
                html += '<button data-ev="year" data-v="' + y + '" style="margin:0 4px 4px 0;padding:5px 12px;border:0;border-radius:6px;cursor:pointer;background:' + sel + '">' + y + '</button>';
            });
            html += '</div>';
        }

        if (state.subject && state.year) {
            var qs = getQuestions(state.subject, state.year);
            html += '<div style="margin-bottom:10px;"><strong style="color:#1e40af;">③ 选择真题：</strong></div>';
            html += '<div style="display:flex;flex-direction:column;gap:8px;">';
            qs.forEach(function (q) {
                var sel = state.qid === q.id;
                var bg = sel ? '#eff6ff;border:1px solid #3b82f6;' : '#fff;border:1px solid #e2e8f0;';
                html += '<div data-ev="q" data-v="' + q.id + '" style="padding:10px;border-radius:8px;cursor:pointer;background:' + bg + '">';
                html += '<div style="font-weight:600;color:#0f172a;">' + q.title + ' <span style="color:#94a3b8;font-weight:400;font-size:12px;">[' + q.kp + ']</span></div>';
                html += '<div style="color:#475569;font-size:13px;margin-top:4px;">' + q.stem.substring(0, 60) + (q.stem.length > 60 ? '...' : '') + '</div>';
                html += '</div>';
            });
            html += '</div>';
        }

        if (state.qid) {
            var q = bank.filter(function (x) { return x.id === state.qid; })[0];
            html += '<div style="margin-top:14px;"><strong style="color:#1e40af;">④ 选择变式类型：</strong></div>';
            html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">';
            var types = [
                { k: 'data', t: '📊 改数据(±20%)' },
                { k: 'context', t: '🌐 改情境(换背景)' },
                { k: 'questioning', t: '🔁 改问法(正反互换)' }
            ];
            types.forEach(function (t) {
                var sel = state.variationType === t.k ? '#3b82f6;color:#fff;' : '#f1f5f9;color:#475569;';
                html += '<button data-ev="vtype" data-v="' + t.k + '" style="padding:6px 14px;border:0;border-radius:6px;cursor:pointer;background:' + sel + '">' + t.t + '</button>';
            });
            html += '<button data-ev="gen" style="padding:6px 14px;border:0;border-radius:6px;cursor:pointer;background:#10b981;color:#fff;">✨ 生成变式</button>';
            html += '</div>';
        }

        if (state.variation) {
            var v = state.variation;
            html += '<div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:12px;">';
            // 原题
            html += '<div style="flex:1;min-width:280px;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px;">';
            html += '<div style="font-weight:700;color:#b45309;margin-bottom:6px;">📋 原题</div>';
            html += '<div style="color:#475569;font-size:13px;line-height:1.6;">' + q.stem + '</div>';
            html += '<div style="margin-top:8px;padding:8px;background:#fef3c7;border-radius:6px;font-size:13px;color:#92400e;"><strong>答案：</strong>' + q.answer + '</div>';
            html += '</div>';
            // 变式
            html += '<div style="flex:1;min-width:280px;background:#eff6ff;border:1px solid #3b82f6;border-radius:8px;padding:12px;">';
            html += '<div style="font-weight:700;color:#1e40af;margin-bottom:6px;">✨ 变式题 <span style="font-size:12px;font-weight:400;color:#64748b;">[' + v.type + ']</span></div>';
            html += '<div style="color:#1e293b;font-size:13px;line-height:1.6;">' + v.stem + '</div>';
            html += '<div style="margin-top:8px;padding:8px;background:#dbeafe;border-radius:6px;font-size:13px;color:#1e3a8a;"><strong>答案：</strong>' + v.answer + '</div>';
            html += '</div>';
            html += '</div>';
        }

        html += '</div>';
        app.innerHTML = html;
        bind();
    }

    function bind() {
        var app = document.getElementById('exam-variation-app');
        if (!app) return;
        var btns = app.querySelectorAll('[data-ev]');
        for (var i = 0; i < btns.length; i++) {
            (function (el) {
                el.addEventListener('click', function () {
                    var ev = el.getAttribute('data-ev');
                    var v = el.getAttribute('data-v');
                    if (ev === 'subj') {
                        state.subject = v; state.year = ''; state.qid = ''; state.variation = null;
                    } else if (ev === 'year') {
                        state.year = v; state.qid = ''; state.variation = null;
                    } else if (ev === 'q') {
                        state.qid = v; state.variation = null;
                    } else if (ev === 'vtype') {
                        state.variationType = v;
                    } else if (ev === 'gen') {
                        if (!state.qid || !state.variationType) { alert('请先选择真题和变式类型'); return; }
                        generate();
                        return;
                    }
                    render();
                });
            })(btns[i]);
        }
    }

    return {
        state: state,
        render: function () { render(); },
        generate: generate
    };
})();

// ============================================================
// 2. 错题变式生成 wrongVariationGen
// ============================================================
var wrongVariationGen = (function () {
    var state = {
        group: '',
        wid: '',
        variation: null,
        userAnswer: '',
        checked: false
    };

    var STORAGE_KEY = 'hspcb_wrong_records';

    function readWrong() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            var arr = JSON.parse(raw);
            return arr instanceof Array ? arr : [];
        } catch (e) { return []; }
    }

    function getGroups(records) {
        var g = {};
        records.forEach(function (r) {
            var k = r.kp || r.knowledgePoint || '未分类';
            if (!g[k]) g[k] = [];
            g[k].push(r);
        });
        return g;
    }

    // 改变数据
    function varyData(text) {
        return text.replace(/(\d+(?:\.\d+)?)/g, function (m) {
            var n = parseFloat(m);
            if (n === 0) return m;
            var delta = (Math.random() * 0.4 - 0.2);
            var v = n * (1 + delta);
            return (Math.round(v * 100) / 100).toString();
        });
    }
    // 选项顺序打乱
    function shuffleOptions(opts) {
        if (!opts || !opts.length) return opts;
        var arr = opts.slice();
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    }
    // 改问法
    function varyQuestion(stem) {
        return '【反向提问】若已知结果，请反推题目条件：' + stem;
    }

    function generateVariation(rec) {
        var v = { stem: '', options: null, answer: '', type: '' };
        var r = Math.random();
        if (r < 0.4 && rec.stem) {
            v.stem = varyData(rec.stem);
            v.answer = rec.answer ? varyData(rec.answer) : '见原题思路';
            v.type = '改变数据';
        } else if (r < 0.7 && rec.options && rec.options.length) {
            v.stem = rec.stem || '';
            v.options = shuffleOptions(rec.options);
            v.answer = rec.answer || '';
            v.type = '选项顺序打乱';
        } else {
            v.stem = varyQuestion(rec.stem || '');
            v.answer = '反推条件即为原题干数据';
            v.type = '改变问法';
        }
        state.variation = v;
        state.userAnswer = '';
        state.checked = false;
        render();
    }

    function check() {
        state.checked = true;
        render();
    }

    function render() {
        var app = document.getElementById('wrong-variation-app');
        if (!app) return;
        var records = readWrong();
        var html = '<div style="padding:16px;font-family:Microsoft YaHei,Segoe UI,sans-serif;">';
        html += '<h3 style="margin:0 0 12px;color:#0f172a;">♻️ 错题变式生成</h3>';
        html += '<p style="color:#64748b;font-size:13px;margin:0 0 12px;">从 localStorage 读取错题记录(key:<code>hspcb_wrong_records</code>)，按知识点分组，自动生成同类变式题。</p>';

        if (records.length === 0) {
            html += '<div style="padding:30px;text-align:center;color:#94a3b8;background:#f8fafc;border-radius:8px;border:1px dashed #cbd5e1;">';
            html += '<div style="font-size:36px;margin-bottom:8px;">📭</div>';
            html += '<div>暂无错题记录</div>';
            html += '<div style="font-size:12px;margin-top:6px;">请先在其他练习模块中产生错题，或手动写入 localStorage。</div>';
            html += '<button data-ev="demo" style="margin-top:12px;padding:6px 14px;border:0;border-radius:6px;cursor:pointer;background:#3b82f6;color:#fff;">载入示例错题</button>';
            html += '</div>';
            html += '</div>';
            app.innerHTML = html;
            bind();
            return;
        }

        var groups = getGroups(records);
        html += '<div style="margin-bottom:10px;"><strong style="color:#1e40af;">按知识点分组：</strong></div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">';
        for (var k in groups) {
            if (!groups.hasOwnProperty(k)) continue;
            var sel = state.group === k;
            var bg = sel ? '#3b82f6;color:#fff;' : '#f1f5f9;color:#475569;';
            html += '<button data-ev="group" data-v="' + k + '" style="padding:5px 12px;border:0;border-radius:6px;cursor:pointer;background:' + bg + '">' + k + ' (' + groups[k].length + ')</button>';
        }
        html += '</div>';

        if (state.group && groups[state.group]) {
            html += '<div style="display:flex;flex-direction:column;gap:8px;">';
            groups[state.group].forEach(function (r, idx) {
                var id = r.id || (state.group + '-' + idx);
                var sel = state.wid === id;
                var bg = sel ? '#eff6ff;border:1px solid #3b82f6;' : '#fff;border:1px solid #e2e8f0;';
                html += '<div data-ev="wrong" data-v="' + id + '" data-idx="' + idx + '" style="padding:10px;border-radius:8px;cursor:pointer;background:' + bg + '">';
                html += '<div style="font-weight:600;color:#0f172a;">' + (r.title || r.stem.substring(0, 30)) + '</div>';
                if (r.stem) html += '<div style="color:#475569;font-size:13px;margin-top:4px;">' + r.stem.substring(0, 80) + (r.stem.length > 80 ? '...' : '') + '</div>';
                if (r.answer) html += '<div style="color:#10b981;font-size:12px;margin-top:4px;">✓ 原答案：' + r.answer + '</div>';
                html += '</div>';
            });
            html += '</div>';
        }

        if (state.wid) {
            var cur = null;
            for (var kk in groups) {
                if (groups.hasOwnProperty(kk) && kk === state.group) {
                    groups[kk].forEach(function (r, idx) {
                        var id = r.id || (state.group + '-' + idx);
                        if (id === state.wid) cur = r;
                    });
                }
            }
            if (cur) {
                html += '<div style="margin-top:12px;"><button data-ev="gen" style="padding:8px 18px;border:0;border-radius:6px;cursor:pointer;background:#10b981;color:#fff;font-weight:600;">✨ 生成变式</button></div>';
            }
        }

        if (state.variation) {
            var v = state.variation;
            html += '<div style="margin-top:16px;background:#f0fdf4;border:1px solid #10b981;border-radius:8px;padding:14px;">';
            html += '<div style="font-weight:700;color:#047857;margin-bottom:8px;">✨ 变式题 <span style="font-size:12px;font-weight:400;color:#64748b;">[' + v.type + ']</span></div>';
            html += '<div style="color:#1e293b;font-size:14px;line-height:1.7;margin-bottom:10px;">' + v.stem + '</div>';
            if (v.options && v.options.length) {
                v.options.forEach(function (opt, i) {
                    var letter = String.fromCharCode(65 + i);
                    var ck = state.userAnswer === letter ? '#10b981;color:#fff;border-color:#10b981;' : '#fff;color:#475569;border-color:#e2e8f0;';
                    html += '<label style="display:block;margin:4px 0;padding:8px 10px;border:1px solid;border-radius:6px;cursor:pointer;background:' + ck + '">';
                    html += '<input type="radio" name="wv-opt" value="' + letter + '" ' + (state.userAnswer === letter ? 'checked' : '') + ' style="margin-right:6px;">';
                    html += letter + '. ' + opt + '</label>';
                });
            } else {
                html += '<textarea data-ev="ans" placeholder="请输入你的答案..." style="width:100%;min-height:80px;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-family:inherit;font-size:13px;">' + (state.userAnswer || '') + '</textarea>';
            }
            html += '<div style="margin-top:10px;"><button data-ev="check" style="padding:6px 16px;border:0;border-radius:6px;cursor:pointer;background:#3b82f6;color:#fff;">✓ 检查答案</button></div>';
            if (state.checked) {
                var correct = state.userAnswer && v.answer && v.answer.indexOf(state.userAnswer) >= 0;
                if (!v.options) correct = !!state.userAnswer;
                var bg = correct ? '#d1fae5' : '#fee2e2';
                var col = correct ? '#065f46' : '#991b1b';
                var icon = correct ? '✅' : '❌';
                html += '<div style="margin-top:10px;padding:10px;background:' + bg + ';border-radius:6px;color:' + col + ';">';
                html += icon + ' ' + (correct ? '回答正确！' : '回答错误，请参考解析。');
                html += '<div style="margin-top:6px;font-size:13px;"><strong>参考答案：</strong>' + v.answer + '</div>';
                html += '</div>';
            }
            html += '</div>';
        }

        html += '</div>';
        app.innerHTML = html;
        bind();
    }

    function bind() {
        var app = document.getElementById('wrong-variation-app');
        if (!app) return;
        var nodes = app.querySelectorAll('[data-ev]');
        for (var i = 0; i < nodes.length; i++) {
            (function (el) {
                var ev = el.getAttribute('data-ev');
                if (ev === 'ans') {
                    el.addEventListener('input', function () {
                        state.userAnswer = el.value;
                    });
                    return;
                }
                el.addEventListener('click', function () {
                    var v = el.getAttribute('data-v');
                    if (ev === 'demo') {
                        var demo = [
                            { id: 'd1', kp: '牛顿运动定律', title: '斜面滑块', stem: '质量 m=2 kg 的滑块沿倾角 30° 斜面下滑，动摩擦因数 μ=0.2，求加速度。', answer: 'a = g(sinθ - μcosθ) = 10×(0.5 - 0.2×0.866) ≈ 3.27 m/s²', options: null },
                            { id: 'd2', kp: '化学平衡', title: '平衡移动判断', stem: '反应 2SO₂ + O₂ ⇌ 2SO₃（放热），增大压强平衡如何移动？', answer: 'C', options: ['向左移动', '向右移动', '不移动', '无法判断'] },
                            { id: 'd3', kp: '遗传定律', title: '基因自由组合', stem: 'AaBb × aabb 测交后代中 AaBb 占多少？', answer: 'B', options: ['1/2', '1/4', '1/8', '1/16'] }
                        ];
                        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(demo)); } catch (e) {}
                        render();
                        return;
                    }
                    if (ev === 'group') {
                        state.group = v; state.wid = ''; state.variation = null;
                    } else if (ev === 'wrong') {
                        state.wid = v;
                    } else if (ev === 'gen') {
                        var records = readWrong();
                        var groups = getGroups(records);
                        var cur = null;
                        (groups[state.group] || []).forEach(function (r, idx) {
                            var id = r.id || (state.group + '-' + idx);
                            if (id === state.wid) cur = r;
                        });
                        if (cur) generateVariation(cur);
                        return;
                    } else if (ev === 'check') {
                        check();
                        return;
                    }
                    render();
                });
            })(nodes[i]);
        }
        // 单选按钮
        var radios = app.querySelectorAll('input[name="wv-opt"]');
        for (var j = 0; j < radios.length; j++) {
            radios[j].addEventListener('change', function () {
                state.userAnswer = this.value;
            });
        }
    }

    return {
        state: state,
        render: function () { render(); },
        refresh: function () { render(); }
    };
})();

// ============================================================
// 3. 学习日历 studyCalendar
// ============================================================
var studyCalendar = (function () {
    var state = {
        viewDate: new Date(),
        selectedDate: ''
    };
    var STORAGE_KEY = 'hspcb_study_tasks';

    function getGaokaoDate() {
        var now = new Date();
        var y = now.getFullYear();
        var d = new Date(y, 5, 7); // 6月7日
        if (d.getTime() < now.getTime()) d = new Date(y + 1, 5, 7);
        return d;
    }

    function daysToGaokao() {
        var g = getGaokaoDate();
        var now = new Date();
        var ms = g.getTime() - now.getTime();
        return Math.ceil(ms / (1000 * 60 * 60 * 24));
    }

    function dateKey(d) {
        return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    }

    function readTasks() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return {};
            return JSON.parse(raw) || {};
        } catch (e) { return {}; }
    }
    function saveTasks(data) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
    }

    function getDailyTasks(dateStr) {
        // 3道题(物化生各1)+1个知识点复习
        return [
            { id: 'p', type: '题', subject: '物理', content: '完成 1 道物理选择题（力学/电磁学）' },
            { id: 'c', type: '题', subject: '化学', content: '完成 1 道化学选择题（氧化还原/化学平衡）' },
            { id: 'b', type: '题', subject: '生物', content: '完成 1 道生物选择题（细胞/遗传）' },
            { id: 'k', type: '复习', subject: '综合', content: '复习 1 个核心知识点（错题本对应知识点）' }
        ];
    }

    function getTaskStatus(dateStr) {
        var data = readTasks();
        return data[dateStr] || {};
    }
    function setTaskStatus(dateStr, taskId, done) {
        var data = readTasks();
        if (!data[dateStr]) data[dateStr] = {};
        data[dateStr][taskId] = done;
        saveTasks(data);
    }

    function calcStreak() {
        var data = readTasks();
        var streak = 0;
        var d = new Date();
        while (true) {
            var key = dateKey(d);
            var st = data[key];
            if (st) {
                var anyDone = false;
                for (var k in st) { if (st.hasOwnProperty(k) && st[k]) { anyDone = true; break; } }
                if (anyDone) { streak++; d.setDate(d.getDate() - 1); continue; }
            }
            break;
        }
        return streak;
    }

    function isToday(dateStr) {
        return dateStr === dateKey(new Date());
    }

    function render() {
        var app = document.getElementById('study-calendar-app');
        if (!app) return;
        var days = daysToGaokao();
        var g = getGaokaoDate();
        var streak = calcStreak();
        var data = readTasks();

        var html = '<div style="padding:16px;font-family:Microsoft YaHei,Segoe UI,sans-serif;">';
        html += '<h3 style="margin:0 0 12px;color:#0f172a;">📅 学习日历</h3>';

        // 倒计时卡片
        html += '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:14px;">';
        html += '<div style="flex:1;min-width:160px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;padding:14px;border-radius:10px;text-align:center;">';
        html += '<div style="font-size:13px;opacity:0.9;">距离高考还有</div>';
        html += '<div style="font-size:32px;font-weight:700;margin:4px 0;">' + days + '</div>';
        html += '<div style="font-size:12px;opacity:0.9;">天 (' + g.getFullYear() + '年6月7日)</div></div>';
        html += '<div style="flex:1;min-width:160px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:14px;border-radius:10px;text-align:center;">';
        html += '<div style="font-size:13px;opacity:0.9;">连续学习</div>';
        html += '<div style="font-size:32px;font-weight:700;margin:4px 0;">' + streak + '</div>';
        html += '<div style="font-size:12px;opacity:0.9;">天 🔥</div></div>';
        html += '</div>';

        // 日历视图
        var vd = state.viewDate;
        var y = vd.getFullYear(), m = vd.getMonth();
        var firstDay = new Date(y, m, 1).getDay();
        var daysInMonth = new Date(y, m + 1, 0).getDate();
        var todayKey = dateKey(new Date());

        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
        html += '<button data-ev="prev" style="background:#f1f5f9;border:0;padding:6px 12px;border-radius:6px;cursor:pointer;color:#475569;">‹</button>';
        html += '<strong style="color:#0f172a;font-size:16px;">' + y + '年' + (m + 1) + '月</strong>';
        html += '<button data-ev="next" style="background:#f1f5f9;border:0;padding:6px 12px;border-radius:6px;cursor:pointer;color:#475569;">›</button>';
        html += '</div>';

        html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-size:12px;color:#64748b;">';
        var weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        weekDays.forEach(function (w) { html += '<div style="padding:4px;font-weight:600;">' + w + '</div>'; });

        for (var i = 0; i < firstDay; i++) html += '<div></div>';
        for (var d = 1; d <= daysInMonth; d++) {
            var dateStr = y + '-' + ('0' + (m + 1)).slice(-2) + '-' + ('0' + d).slice(-2);
            var st = data[dateStr] || {};
            var doneCount = 0, total = 4;
            for (var tk in st) { if (st.hasOwnProperty(tk) && st[tk]) doneCount++; }
            var isToday = dateStr === todayKey;
            var isSel = dateStr === state.selectedDate;
            var bg = isSel ? '#3b82f6;color:#fff;' : (isToday ? '#eff6ff;border:1px solid #3b82f6;' : '#f8fafc;color:#475569;');
            var mark = doneCount === total ? '✅' : (doneCount > 0 ? '·' : '');
            html += '<div data-ev="date" data-v="' + dateStr + '" style="padding:6px 2px;border-radius:6px;cursor:pointer;background:' + bg + ';position:relative;">';
            html += '<div>' + d + '</div>';
            html += '<div style="font-size:10px;height:10px;">' + mark + '</div>';
            html += '</div>';
        }
        html += '</div>';
        html += '<div style="margin-top:8px;font-size:12px;color:#64748b;">✅ 全部完成 · 半圆点表示部分完成</div>';
        html += '</div>';

        // 每日任务
        var selDate = state.selectedDate || todayKey;
        var tasks = getDailyTasks(selDate);
        var status = getTaskStatus(selDate);
        html += '<div style="margin-top:14px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
        html += '<strong style="color:#0f172a;">📝 ' + selDate + ' 每日任务</strong>';
        html += '<span style="font-size:12px;color:#64748b;">' + Object.keys(status).filter(function (k) { return status[k]; }).length + '/' + tasks.length + ' 已完成</span>';
        html += '</div>';
        tasks.forEach(function (t) {
            var done = !!status[t.id];
            var bg = done ? '#f0fdf4;' : '#f8fafc;';
            var col = done ? '#065f46;' : '#475569;';
            html += '<div style="display:flex;align-items:center;padding:8px 10px;margin-bottom:6px;background:' + bg + 'border-radius:6px;border:1px solid #e2e8f0;">';
            html += '<label style="display:flex;align-items:center;cursor:pointer;width:100%;color:' + col + '">';
            html += '<input type="checkbox" data-ev="task" data-date="' + selDate + '" data-tid="' + t.id + '" ' + (done ? 'checked' : '') + ' style="margin-right:10px;transform:scale(1.2);">';
            html += '<span style="flex:1;"><strong>[' + t.subject + '·' + t.type + ']</strong> ' + t.content + '</span>';
            if (done) html += '<span style="color:#10b981;">✓</span>';
            html += '</label></div>';
        });
        html += '</div>';

        html += '</div>';
        app.innerHTML = html;
        bind();
    }

    function bind() {
        var app = document.getElementById('study-calendar-app');
        if (!app) return;
        var nodes = app.querySelectorAll('[data-ev]');
        for (var i = 0; i < nodes.length; i++) {
            (function (el) {
                var ev = el.getAttribute('data-ev');
                if (ev === 'task') {
                    el.addEventListener('change', function () {
                        var date = el.getAttribute('data-date');
                        var tid = el.getAttribute('data-tid');
                        setTaskStatus(date, tid, el.checked);
                        render();
                    });
                    return;
                }
                el.addEventListener('click', function () {
                    var v = el.getAttribute('data-v');
                    if (ev === 'prev') {
                        state.viewDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() - 1, 1);
                    } else if (ev === 'next') {
                        state.viewDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() + 1, 1);
                    } else if (ev === 'date') {
                        state.selectedDate = v;
                    }
                    render();
                });
            })(nodes[i]);
        }
    }

    return {
        state: state,
        render: function () { render(); },
        daysToGaokao: daysToGaokao,
        calcStreak: calcStreak
    };
})();

// ============================================================
// 4. 考前策略 examStrategy
// ============================================================
var examStrategy = (function () {
    var state = { subject: '物理', tab: 'time' };

    var data = {
        物理: {
            totalTime: 75, // 分钟
            pie: [
                { label: '选择题(1-7)', value: 25, color: '#3b82f6' },
                { label: '实验题(8-9)', value: 20, color: '#10b981' },
                { label: '计算题(10-12)', value: 30, color: '#f59e0b' }
            ],
            order: [
                '① 先做选择题（前7题），每题控制在 3-4 分钟内',
                '② 实验题（8-9题）注意有效数字和单位',
                '③ 计算题先做最有把握的，难题最后攻',
                '④ 留 5-10 分钟检查答题卡填涂和计算过程'
            ],
            timeControl: [
                { type: '单选题', time: '3-4 分钟/题', tip: '不要纠结，超过 4 分钟先跳过' },
                { type: '多选题', time: '5-6 分钟/题', tip: '不确定的选项宁可不选' },
                { type: '实验题', time: '10 分钟/题', tip: '先写原理公式再代入数据' },
                { type: '计算题', time: '15 分钟/题', tip: '分步写过程，每步都有分' }
            ],
            mistakes: [
                '⚠️ 计算过程漏写单位导致扣分',
                '⚠️ 矢量方向未标明（正负号、方向箭头）',
                '⚠️ 多选题贪多选错，宁缺毋滥',
                '⚠️ 实验题未按有效数字规则记录',
                '⚠️ 计算题直接写答案，缺少必要步骤'
            ]
        },
        化学: {
            totalTime: 75,
            pie: [
                { label: '选择题(1-10)', value: 25, color: '#3b82f6' },
                { label: '必做题(11-13)', value: 25, color: '#10b981' },
                { label: '选做题(14)', value: 10, color: '#f59e0b' },
                { label: '工艺流程/反应原理', value: 15, color: '#ef4444' }
            ],
            order: [
                '① 选择题快速完成，注意 I 卷不倒扣分',
                '② 必做主观题按顺序作答',
                '③ 选做题先看两道选哪道更顺手',
                '④ 工艺流程题留足时间分析流程图'
            ],
            timeControl: [
                { type: '选择题', time: '2-3 分钟/题', tip: '化学选择题信息量大，仔细审题' },
                { type: '必做主观题', time: '12-15 分钟/题', tip: '方程式配平要检查' },
                { type: '选做题', time: '10 分钟', tip: '选有机或结构看个人擅长' },
                { type: '工艺流程', time: '15 分钟', tip: '先看问题再读流程图' }
            ],
            mistakes: [
                '⚠️ 化学方程式未配平或漏写条件',
                '⚠️ 沉淀、气体符号漏标',
                '⚠️ 有机物结构简式书写不规范',
                '⚠️ 摩尔质量计算单位错误',
                '⚠️ 氧化还原反应电子转移数目错误'
            ]
        },
        生物: {
            totalTime: 45,
            pie: [
                { label: '选择题(1-12)', value: 20, color: '#3b82f6' },
                { label: '非选择题(13-17)', value: 25, color: '#10b981' }
            ],
            order: [
                '① 选择题先做，注意题干关键词',
                '② 非选择题按顺序作答',
                '③ 遗传题留足时间分析系谱',
                '④ 实验设计题注意对照原则'
            ],
            timeControl: [
                { type: '选择题', time: '1.5 分钟/题', tip: '生物选择题要快但准' },
                { type: '非选择题', time: '5-6 分钟/题', tip: '答题要规范，术语要准确' },
                { type: '遗传题', time: '8-10 分钟', tip: '先写基因型再写比例' },
                { type: '实验题', time: '6-8 分钟', tip: '明确自变量、因变量、对照' }
            ],
            mistakes: [
                '⚠️ 专业术语书写错误（如"光合作用"写成"光和作用"）',
                '⚠️ 遗传图解不规范，缺少 P/F₁/F₂ 标注',
                '⚠️ 实验设计缺少对照或重复',
                '⚠️ 答题语言口语化，未使用规范术语',
                '⚠️ 基因型与表现型对应关系混乱'
            ]
        }
    };

    var psych = {
        breath: '【呼吸放松法】4-7-8 呼吸法：吸气 4 秒 → 屏息 7 秒 → 呼气 8 秒，循环 3-5 次，可快速降低焦虑水平，激活副交感神经。',
        suggestion: '【积极暗示】默念："我已系统复习，知识储备充分；遇到难题是正常的，我会冷静分析；每做一题就多拿一分。"',
        anxiety: '【焦虑应对】① 接纳焦虑情绪，适度紧张有助于发挥；② 转移注意力到具体题目；③ 暂停 30 秒做深呼吸；④ 回忆成功经验增强信心。'
    };

    var checklist = [
        { stage: '考前一周', items: ['回归基础，重温教材核心概念', '整理错题本，重点复习高频错题', '保持作息规律，不熬夜', '熟悉考场路线和考试规则', '准备考试用品（身份证、准考证、文具）'] },
        { stage: '考前三天', items: ['停止做新题，复习已掌握内容', '看真题标准答案，学习答题规范', '调整生物钟，按考试时间作息', '清淡饮食，避免肠胃不适', '确认考试用品齐全'] },
        { stage: '考前一天', items: ['浏览知识点框架，不钻难题', '检查文具、证件、备用物品', '晚上 10 点前休息，不熬夜', '规划赴考路线和时间', '放松心情，做轻度运动'] },
        { stage: '考试当天', items: ['提前 30 分钟到达考场', '进场前深呼吸 3 次稳定情绪', '通览试卷，先易后难', '合理分配时间，不恋战', '答题卡及时填涂，留 5 分钟检查'] }
    ];

    function renderPie(pie) {
        var total = 0;
        pie.forEach(function (p) { total += p.value; });
        var r = 60, cx = 70, cy = 70;
        var startAngle = -Math.PI / 2;
        var paths = '';
        pie.forEach(function (p) {
            var angle = (p.value / total) * 2 * Math.PI;
            var endAngle = startAngle + angle;
            var x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
            var x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
            var large = angle > Math.PI ? 1 : 0;
            paths += '<path d="M' + cx + ',' + cy + ' L' + x1 + ',' + y1 + ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' + x2 + ',' + y2 + ' Z" fill="' + p.color + '" stroke="#fff" stroke-width="2"/>';
            startAngle = endAngle;
        });
        var legend = '';
        pie.forEach(function (p) {
            legend += '<div style="display:flex;align-items:center;margin:3px 0;font-size:12px;color:#475569;">';
            legend += '<span style="display:inline-block;width:12px;height:12px;background:' + p.color + ';margin-right:6px;border-radius:2px;"></span>';
            legend += p.label + ' (' + p.value + '分钟)</div>';
        });
        return '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:14px;">' +
            '<svg width="140" height="140" viewBox="0 0 140 140">' + paths + '<text x="70" y="74" text-anchor="middle" font-size="13" fill="#0f172a" font-weight="600">' + total + '分钟</text></svg>' +
            '<div>' + legend + '</div></div>';
    }

    function render() {
        var app = document.getElementById('exam-strategy-app');
        if (!app) return;
        var d = data[state.subject];

        var html = '<div style="padding:16px;font-family:Microsoft YaHei,Segoe UI,sans-serif;">';
        html += '<h3 style="margin:0 0 12px;color:#0f172a;">🎯 考前策略</h3>';
        html += '<p style="color:#64748b;font-size:13px;margin:0 0 12px;">考试时间分配、答题顺序、心态调整与考前 checklist。</p>';

        // 科目tab
        html += '<div style="display:flex;gap:6px;margin-bottom:14px;border-bottom:2px solid #e2e8f0;">';
        Object.keys(data).forEach(function (s) {
            var sel = state.subject === s;
            var bg = sel ? '#3b82f6;color:#fff;' : '#f1f5f9;color:#475569;';
            var border = sel ? 'border-bottom:3px solid #3b82f6;margin-bottom:-2px;' : '';
            html += '<button data-ev="subj" data-v="' + s + '" style="padding:8px 18px;border:0;border-radius:6px 6px 0 0;cursor:pointer;background:' + bg + border + '">' + s + '</button>';
        });
        html += '</div>';

        // 内容tab
        html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;">';
        var tabs = [
            { k: 'time', t: '⏱ 时间分配' },
            { k: 'order', t: '📋 答题顺序' },
            { k: 'control', t: '⏳ 题型时间' },
            { k: 'mistakes', t: '⚠️ 失误规避' },
            { k: 'psych', t: '🧠 心理调节' },
            { k: 'checklist', t: '✅ 考前清单' }
        ];
        tabs.forEach(function (t) {
            var sel = state.tab === t.k;
            var bg = sel ? '#1e40af;color:#fff;' : '#f1f5f9;color:#475569;';
            html += '<button data-ev="tab" data-v="' + t.k + '" style="padding:5px 12px;border:0;border-radius:6px;cursor:pointer;background:' + bg + ';font-size:13px;">' + t.t + '</button>';
        });
        html += '</div>';

        // 内容区
        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;">';
        if (state.tab === 'time') {
            html += '<h4 style="margin:0 0 10px;color:#1e40af;">' + state.subject + ' 科目时间分配建议（总 ' + d.totalTime + ' 分钟）</h4>';
            html += renderPie(d.pie);
        } else if (state.tab === 'order') {
            html += '<h4 style="margin:0 0 10px;color:#1e40af;">答题顺序策略</h4>';
            d.order.forEach(function (o) {
                html += '<div style="padding:8px 10px;margin-bottom:6px;background:#f0f9ff;border-left:3px solid #3b82f6;border-radius:4px;color:#1e293b;font-size:13px;">' + o + '</div>';
            });
        } else if (state.tab === 'control') {
            html += '<h4 style="margin:0 0 10px;color:#1e40af;">各题型时间控制</h4>';
            d.timeControl.forEach(function (t) {
                html += '<div style="padding:10px;margin-bottom:8px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;">';
                html += '<div style="display:flex;justify-content:space-between;font-weight:600;color:#0f172a;font-size:14px;"><span>' + t.type + '</span><span style="color:#3b82f6;">' + t.time + '</span></div>';
                html += '<div style="color:#64748b;font-size:12px;margin-top:4px;">💡 ' + t.tip + '</div>';
                html += '</div>';
            });
        } else if (state.tab === 'mistakes') {
            html += '<h4 style="margin:0 0 10px;color:#dc2626;">常见失误规避</h4>';
            d.mistakes.forEach(function (m) {
                html += '<div style="padding:8px 10px;margin-bottom:6px;background:#fef2f2;border-left:3px solid #ef4444;border-radius:4px;color:#991b1b;font-size:13px;">' + m + '</div>';
            });
        } else if (state.tab === 'psych') {
            html += '<h4 style="margin:0 0 10px;color:#7c3aed;">考前心理调节</h4>';
            html += '<div style="padding:12px;margin-bottom:10px;background:#f5f3ff;border-radius:8px;border-left:4px solid #8b5cf6;">';
            html += '<div style="font-weight:600;color:#6d28d9;margin-bottom:6px;">🌬️ 呼吸放松法</div>';
            html += '<div style="color:#475569;font-size:13px;line-height:1.7;">' + psych.breath + '</div></div>';
            html += '<div style="padding:12px;margin-bottom:10px;background:#ecfdf5;border-radius:8px;border-left:4px solid #10b981;">';
            html += '<div style="font-weight:600;color:#047857;margin-bottom:6px;">💪 积极暗示</div>';
            html += '<div style="color:#475569;font-size:13px;line-height:1.7;">' + psych.suggestion + '</div></div>';
            html += '<div style="padding:12px;background:#fffbeb;border-radius:8px;border-left:4px solid #f59e0b;">';
            html += '<div style="font-weight:600;color:#b45309;margin-bottom:6px;">😰 焦虑应对</div>';
            html += '<div style="color:#475569;font-size:13px;line-height:1.7;">' + psych.anxiety + '</div></div>';
        } else if (state.tab === 'checklist') {
            html += '<h4 style="margin:0 0 10px;color:#1e40af;">考前 Checklist</h4>';
            checklist.forEach(function (c) {
                html += '<div style="margin-bottom:12px;background:#f8fafc;border-radius:8px;padding:10px;border:1px solid #e2e8f0;">';
                html += '<div style="font-weight:700;color:#0f172a;margin-bottom:6px;">📌 ' + c.stage + '</div>';
                c.items.forEach(function (it) {
                    html += '<div style="padding:4px 0 4px 18px;color:#475569;font-size:13px;position:relative;">';
                    html += '<span style="position:absolute;left:0;color:#10b981;">☐</span>' + it + '</div>';
                });
                html += '</div>';
            });
        }
        html += '</div>';

        html += '</div>';
        app.innerHTML = html;
        bind();
    }

    function bind() {
        var app = document.getElementById('exam-strategy-app');
        if (!app) return;
        var nodes = app.querySelectorAll('[data-ev]');
        for (var i = 0; i < nodes.length; i++) {
            (function (el) {
                el.addEventListener('click', function () {
                    var ev = el.getAttribute('data-ev');
                    var v = el.getAttribute('data-v');
                    if (ev === 'subj') state.subject = v;
                    else if (ev === 'tab') state.tab = v;
                    render();
                });
            })(nodes[i]);
        }
    }

    return {
        state: state,
        render: function () { render(); }
    };
})();

// ============================================================
// 5. 交互式易错点 interactiveMistakes
// ============================================================
var interactiveMistakes = (function () {
    var state = { subject: '物理', idx: 0, selected: '', revealed: false };

    // 内嵌30个易错点（三科各10个）
    var bank = {
        物理: [
            { wrong: '加速度方向就是速度方向。', correct: false, trap: '加速度方向与速度变化方向一致，与速度方向可以相同、相反或垂直。', right: '加速度方向是速度变化的方向，不一定与速度方向相同。' },
            { wrong: '物体速度越大，加速度也越大。', correct: false, trap: '速度大不代表速度变化快，加速度是速度变化率。', right: '加速度 a = Δv/Δt，与速度大小无直接关系。' },
            { wrong: '合外力为零时物体一定静止。', correct: false, trap: '合外力为零时物体处于平衡状态，可能是静止或匀速直线运动。', right: '合外力为零时物体静止或做匀速直线运动。' },
            { wrong: '做匀速圆周运动的物体所受合外力为零。', correct: false, trap: '匀速圆周运动需要向心力，合外力不为零。', right: '匀速圆周运动的合外力提供向心力，方向指向圆心。' },
            { wrong: '摩擦力方向总是与运动方向相反。', correct: false, trap: '摩擦力方向与相对运动或相对运动趋势方向相反，可以与运动方向相同。', right: '摩擦力可以与运动方向相同（如传送带上加速的物体）。' },
            { wrong: '作用力与反作用力可以相互抵消。', correct: false, trap: '作用力与反作用力作用在不同物体上，不能抵消。', right: '作用力与反作用力作用在不同物体上，不能求合力。' },
            { wrong: '机械能守恒时动能一定不变。', correct: false, trap: '机械能守恒指动能与势能之和不变，动能和势能可以相互转化。', right: '机械能守恒时动能与势能相互转化，总量不变。' },
            { wrong: '电场线是带电粒子在电场中的运动轨迹。', correct: false, trap: '电场线表示场强方向，不一定是粒子运动轨迹。', right: '电场线只在特定条件下（初速度为零、仅受电场力、电场线为直线）与运动轨迹重合。' },
            { wrong: '磁感线从 N 极出发到 S 极终止。', correct: false, trap: '磁感线是闭合曲线，没有起点和终点。', right: '磁感线是闭合曲线，在磁体外部从 N 到 S，内部从 S 到 N。' },
            { wrong: '感应电动势的大小与磁通量成正比。', correct: false, trap: '感应电动势与磁通量的变化率成正比，不是与磁通量成正比。', right: 'E = ΔΦ/Δt，感应电动势与磁通量变化率成正比。' }
        ],
        化学: [
            { wrong: '同位素的化学性质不同。', correct: false, trap: '同位素质子数相同，电子排布相同，化学性质几乎相同。', right: '同位素化学性质相同，物理性质略有差异。' },
            { wrong: '摩尔是表示物质质量的单位。', correct: false, trap: '摩尔是物质的量的单位，不是质量单位。', right: '摩尔(mol)是物质的量的单位，质量单位是克(g)。' },
            { wrong: '氧化剂发生氧化反应。', correct: false, trap: '氧化剂得到电子，发生还原反应。', right: '氧化剂得电子被还原，发生还原反应；还原剂失电子被氧化。' },
            { wrong: '化学平衡时反应物浓度等于生成物浓度。', correct: false, trap: '平衡时正逆反应速率相等，浓度不再变化，但反应物和生成物浓度不一定相等。', right: '平衡时 v正 = v逆，各组分浓度保持不变但不一定相等。' },
            { wrong: '升高温度一定加快反应速率。', correct: false, trap: '一般情况升高温度加快反应速率，但对于多步复杂反应，某一步可能减慢。', right: '通常升高温度加快反应速率，但需注意复杂反应的特殊情况。' },
            { wrong: '弱酸的电离度越大，酸性越强。', correct: false, trap: '酸性强弱取决于 Ka 或 [H⁺]，电离度还与浓度有关。', right: '比较酸性强弱看 Ka（或 pKa），同浓度下电离度大则酸性强。' },
            { wrong: '盐的水溶液一定呈中性。', correct: false, trap: '强酸弱碱盐水解呈酸性，强碱弱酸盐水解呈碱性。', right: '盐的水溶液酸碱性取决于盐的组成，可能呈酸性、碱性或中性。' },
            { wrong: '原电池正极发生氧化反应。', correct: false, trap: '原电池正极得电子，发生还原反应。', right: '原电池负极失电子发生氧化反应，正极得电子发生还原反应。' },
            { wrong: '电解池阳极接电源负极。', correct: false, trap: '电解池阳极接电源正极，阴极接电源负极。', right: '电解池阳极接电源正极，阴极接电源负极。' },
            { wrong: '有机物都能燃烧。', correct: false, trap: '大多数有机物可燃，但如 CCl₄ 等卤代烃不可燃，可作灭火剂。', right: '并非所有有机物都可燃，如四氯化碳不可燃。' }
        ],
        生物: [
            { wrong: '病毒属于原核生物。', correct: false, trap: '病毒没有细胞结构，既不是原核也不是真核生物。', right: '病毒无细胞结构，不属于原核生物；原核生物如细菌、蓝藻。' },
            { wrong: '细胞膜是脂质双层，没有蛋白质。', correct: false, trap: '细胞膜由磷脂双分子层和蛋白质组成，还有糖类。', right: '细胞膜由磷脂双分子层构成基本骨架，其上镶嵌蛋白质。' },
            { wrong: '酶的催化作用只能在细胞内进行。', correct: false, trap: '酶在细胞内外都可发挥作用，只要条件适宜。', right: '酶在细胞内或细胞外都可催化，只要条件适宜。' },
            { wrong: '光合作用只在白天进行，呼吸作用只在夜间进行。', correct: false, trap: '呼吸作用时刻进行，光合作用只在有光时进行。', right: '呼吸作用全天进行，光合作用需要光才能进行。' },
            { wrong: 'DNA 复制只发生在减数分裂时。', correct: false, trap: 'DNA 复制发生在有丝分裂和减数分裂前的间期。', right: 'DNA 复制发生在有丝分裂间期和减数第一次分裂前的间期。' },
            { wrong: '基因突变都能遗传给后代。', correct: false, trap: '只有生殖细胞中的基因突变才能遗传，体细胞突变不遗传。', right: '生殖细胞的基因突变可遗传，体细胞突变一般不遗传。' },
            { wrong: '一个密码子决定一个氨基酸，一个氨基酸只有一个密码子。', correct: false, trap: '一个密码子决定一个氨基酸，但一个氨基酸可有多个密码子（简并性）。', right: '密码子具有简并性，多数氨基酸有多个密码子。' },
            { wrong: '生态系统的能量流动是循环的。', correct: false, trap: '能量流动是单向的、逐级递减的，物质循环是循环的。', right: '能量流动单向流动、逐级递减；物质循环具有全球性、循环性。' },
            { wrong: '生长素浓度越高，促进生长作用越强。', correct: false, trap: '生长素作用具有两重性，低浓度促进，高浓度抑制。', right: '生长素作用具有两重性：低浓度促进生长，高浓度抑制生长。' },
            { wrong: '体液免疫和细胞免疫是独立的，互不影响。', correct: false, trap: '两者相互协作，共同维持机体稳态。', right: '体液免疫和细胞免疫相互配合，共同发挥免疫作用。' }
        ]
    };

    function render() {
        var app = document.getElementById('interactive-mistakes-app');
        if (!app) return;
        var list = bank[state.subject];
        var cur = list[state.idx];

        var html = '<div style="padding:16px;font-family:Microsoft YaHei,Segoe UI,sans-serif;">';
        html += '<h3 style="margin:0 0 12px;color:#0f172a;">⚠️ 交互式易错点</h3>';
        html += '<p style="color:#64748b;font-size:13px;margin:0 0 12px;">判断易错表述对错，揭示陷阱，掌握正确做法。共 30 个易错点（三科各 10 个）。</p>';

        // 科目tab
        html += '<div style="display:flex;gap:6px;margin-bottom:14px;">';
        Object.keys(bank).forEach(function (s) {
            var sel = state.subject === s;
            var bg = sel ? '#3b82f6;color:#fff;' : '#f1f5f9;color:#475569;';
            html += '<button data-ev="subj" data-v="' + s + '" style="padding:6px 16px;border:0;border-radius:6px;cursor:pointer;background:' + bg + ';">' + s + '</button>';
        });
        html += '</div>';

        // 进度
        html += '<div style="margin-bottom:10px;color:#64748b;font-size:13px;">第 ' + (state.idx + 1) + ' / ' + list.length + ' 题</div>';
        html += '<div style="background:#e2e8f0;border-radius:6px;height:6px;margin-bottom:14px;overflow:hidden;">';
        html += '<div style="width:' + ((state.idx + 1) / list.length * 100) + '%;background:#3b82f6;height:100%;"></div></div>';

        // 题目卡片
        html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">';
        html += '<div style="color:#64748b;font-size:13px;margin-bottom:8px;">📌 判断下列说法是否正确：</div>';
        html += '<div style="padding:14px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:6px;color:#92400e;font-size:15px;line-height:1.6;margin-bottom:14px;">';
        html += '"' + cur.wrong + '"';
        html += '<div style="margin-top:8px;font-size:13px;color:#b45309;font-weight:600;">这个说法对吗？</div>';
        html += '</div>';

        // 选项
        var opts = [
            { v: 'true', t: '✓ 正确' },
            { v: 'false', t: '✗ 错误' }
        ];
        opts.forEach(function (o) {
            var sel = state.selected === o.v;
            var bg = '#fff;color:#475569;border:1px solid #e2e8f0;';
            if (state.revealed) {
                var isCorrect = (o.v === 'true' && cur.correct) || (o.v === 'false' && !cur.correct);
                bg = isCorrect ? '#d1fae5;color:#065f46;border:1px solid #10b981;' : (sel ? '#fee2e2;color:#991b1b;border:1px solid #ef4444;' : '#fff;color:#475569;border:1px solid #e2e8f0;');
            } else if (sel) {
                bg = '#eff6ff;color:#1e40af;border:1px solid #3b82f6;';
            }
            html += '<button data-ev="opt" data-v="' + o.v + '" style="display:block;width:100%;text-align:left;padding:10px 14px;margin-bottom:8px;border-radius:6px;cursor:pointer;background:' + bg + ';font-size:14px;">' + o.t + '</button>';
        });

        // 揭示
        if (state.revealed) {
            var userCorrect = (state.selected === 'true' && cur.correct) || (state.selected === 'false' && !cur.correct);
            var bg = userCorrect ? '#d1fae5' : '#fee2e2';
            var col = userCorrect ? '#065f46' : '#991b1b';
            var icon = userCorrect ? '✅' : '❌';
            html += '<div style="margin-top:14px;padding:12px;background:' + bg + ';border-radius:8px;color:' + col + ';">';
            html += '<div style="font-weight:700;margin-bottom:8px;">' + icon + ' ' + (userCorrect ? '判断正确！' : '判断错误') + '</div>';
            html += '<div style="margin-bottom:8px;"><strong>⚠️ 陷阱分析：</strong>' + cur.trap + '</div>';
            html += '<div><strong>✓ 正确做法：</strong>' + cur.right + '</div>';
            html += '</div>';

            html += '<div style="display:flex;gap:8px;margin-top:14px;">';
            if (state.idx > 0) html += '<button data-ev="prev" style="padding:8px 16px;border:0;border-radius:6px;cursor:pointer;background:#f1f5f9;color:#475569;">‹ 上一题</button>';
            if (state.idx < list.length - 1) html += '<button data-ev="next" style="padding:8px 16px;border:0;border-radius:6px;cursor:pointer;background:#3b82f6;color:#fff;">下一题 ›</button>';
            html += '</div>';
        } else if (state.selected) {
            html += '<button data-ev="reveal" style="margin-top:10px;padding:8px 18px;border:0;border-radius:6px;cursor:pointer;background:#10b981;color:#fff;font-weight:600;">🔍 揭示答案</button>';
        }

        html += '</div>';

        // 题目导航
        html += '<div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:4px;">';
        list.forEach(function (_, i) {
            var bg = i === state.idx ? '#3b82f6;color:#fff;' : '#f1f5f9;color:#475569;';
            html += '<button data-ev="goto" data-v="' + i + '" style="width:30px;height:30px;border:0;border-radius:6px;cursor:pointer;background:' + bg + ';font-size:12px;">' + (i + 1) + '</button>';
        });
        html += '</div>';

        html += '</div>';
        app.innerHTML = html;
        bind();
    }

    function bind() {
        var app = document.getElementById('interactive-mistakes-app');
        if (!app) return;
        var nodes = app.querySelectorAll('[data-ev]');
        for (var i = 0; i < nodes.length; i++) {
            (function (el) {
                el.addEventListener('click', function () {
                    var ev = el.getAttribute('data-ev');
                    var v = el.getAttribute('data-v');
                    if (ev === 'subj') {
                        state.subject = v; state.idx = 0; state.selected = ''; state.revealed = false;
                    } else if (ev === 'opt') {
                        if (!state.revealed) state.selected = v;
                    } else if (ev === 'reveal') {
                        if (state.selected) state.revealed = true;
                    } else if (ev === 'prev') {
                        if (state.idx > 0) { state.idx--; state.selected = ''; state.revealed = false; }
                    } else if (ev === 'next') {
                        if (state.idx < bank[state.subject].length - 1) { state.idx++; state.selected = ''; state.revealed = false; }
                    } else if (ev === 'goto') {
                        state.idx = parseInt(v, 10); state.selected = ''; state.revealed = false;
                    }
                    render();
                });
            })(nodes[i]);
        }
    }

    return {
        state: state,
        render: function () { render(); }
    };
})();

// ============================================================
// 暴露到 window
// ============================================================
window.examVariation = examVariation;
window.wrongVariationGen = wrongVariationGen;
window.studyCalendar = studyCalendar;
window.examStrategy = examStrategy;
window.interactiveMistakes = interactiveMistakes;

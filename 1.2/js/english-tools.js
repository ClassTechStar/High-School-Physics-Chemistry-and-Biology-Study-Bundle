/**
 * English Interactive Tools for Gaokao Preparation
 * Module 1: englishGrammarQuiz - Grammar multiple choice quiz
 * Module 2: englishReadingTrainer - Reading comprehension trainer
 * Module 3: englishCompositionTemplates - Writing templates and patterns
 *
 * ES5 compatible, IIFE pattern, all data embedded, inline styles.
 */
(function () {
'use strict';

/* ================================================================
 * SHARED STYLES & HELPERS
 * ================================================================ */
var ST = {
  wrap: 'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;max-width:900px;margin:0 auto;padding:20px;color:#333;line-height:1.6;',
  card: 'background:#fff;border-radius:12px;padding:24px;margin-bottom:16px;box-shadow:0 2px 12px rgba(0,0,0,0.08);',
  h2: 'font-size:22px;font-weight:700;color:#2c3e50;margin:0 0 20px 0;',
  h3: 'font-size:18px;font-weight:700;color:#2c3e50;margin:0 0 12px 0;',
  btn: 'padding:10px 24px;border:none;border-radius:8px;cursor:pointer;font-size:14px;background:#4a90d9;color:#fff;margin:4px;display:inline-block;',
  btnOn: 'padding:10px 24px;border:none;border-radius:8px;cursor:pointer;font-size:14px;background:#2c3e50;color:#fff;margin:4px;display:inline-block;',
  btnGy: 'padding:10px 24px;border:none;border-radius:8px;cursor:pointer;font-size:14px;background:#ecf0f1;color:#333;margin:4px;display:inline-block;',
  btnGn: 'padding:10px 24px;border:none;border-radius:8px;cursor:pointer;font-size:14px;background:#27ae60;color:#fff;margin:4px;display:inline-block;',
  btnSm: 'padding:6px 16px;border:none;border-radius:6px;cursor:pointer;font-size:13px;background:#4a90d9;color:#fff;margin:2px;display:inline-block;',
  opt: 'display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;border:2px solid #e0e0e0;border-radius:8px;background:#fff;cursor:pointer;font-size:15px;color:#333;',
  optOk: 'display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;border:2px solid #27ae60;border-radius:8px;background:#d4edda;cursor:default;font-size:15px;color:#155724;',
  optNo: 'display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;border:2px solid #e74c3c;border-radius:8px;background:#f8d7da;cursor:default;font-size:15px;color:#721c24;',
  optDis: 'display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;border:2px solid #e0e0e0;border-radius:8px;background:#f9f9f9;cursor:default;font-size:15px;color:#666;',
  fb: 'padding:16px;border-radius:8px;margin-top:16px;font-size:14px;line-height:1.8;',
  fbOk: 'padding:16px;border-radius:8px;margin-top:16px;font-size:14px;line-height:1.8;background:#d4edda;border-left:4px solid #27ae60;color:#155724;',
  fbNo: 'padding:16px;border-radius:8px;margin-top:16px;font-size:14px;line-height:1.8;background:#f8d7da;border-left:4px solid #e74c3c;color:#721c24;',
  fbInfo: 'padding:16px;border-radius:8px;margin-top:16px;font-size:14px;line-height:1.8;background:#e8f4fd;border-left:4px solid #4a90d9;color:#2c3e50;',
  bar: 'display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#f5f7fa;border-radius:8px;margin-bottom:16px;font-size:14px;flex-wrap:wrap;gap:8px;',
  badge: 'display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;margin-left:8px;background:#e8f4fd;color:#4a90d9;',
  badgeGn: 'display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;margin-left:8px;background:#d4edda;color:#155724;',
  timer: 'font-size:28px;font-weight:700;color:#e74c3c;text-align:center;padding:16px;background:#fff5f5;border-radius:8px;margin-bottom:16px;font-family:monospace;',
  input: 'width:100%;padding:10px 16px;border:2px solid #e0e0e0;border-radius:8px;font-size:14px;margin-bottom:16px;box-sizing:border-box;',
  tag: 'display:inline-block;padding:4px 10px;background:#e8f4fd;color:#4a90d9;border-radius:4px;font-size:12px;margin:2px;',
  passage: 'font-size:15px;line-height:1.9;color:#444;margin-bottom:20px;padding:20px;background:#fafbfc;border-radius:8px;border-left:4px solid #4a90d9;',
  qtext: 'font-size:16px;line-height:1.7;margin-bottom:16px;color:#2c3e50;font-weight:500;',
  desc: 'font-size:14px;color:#666;margin-bottom:16px;line-height:1.6;',
  row: 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;',
  grid2: 'display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;',
  box: 'padding:16px;border:1px solid #e0e0e0;border-radius:8px;margin-bottom:12px;background:#fff;',
  boxHi: 'padding:16px;border:1px solid #4a90d9;border-radius:8px;margin-bottom:12px;background:#f8fbff;',
  copyBtn: 'padding:6px 16px;border:none;border-radius:6px;cursor:pointer;font-size:13px;background:#27ae60;color:#fff;margin-top:8px;display:inline-block;',
  pill: 'padding:6px 14px;border-radius:20px;font-size:13px;cursor:pointer;border:2px solid #e0e0e0;background:#fff;color:#333;display:inline-block;margin:3px;',
  pillOn: 'padding:6px 14px;border-radius:20px;font-size:13px;cursor:pointer;border:2px solid #4a90d9;background:#4a90d9;color:#fff;display:inline-block;margin:3px;',
  note: 'font-size:13px;color:#999;margin-top:8px;',
  empty: 'text-align:center;padding:40px;color:#999;font-size:15px;',
  patBox: 'padding:14px;border:1px solid #e0e0e0;border-radius:8px;margin-bottom:10px;background:#fafbfc;',
  trBox: 'padding:14px;border:1px solid #e0e0e0;border-radius:8px;margin-bottom:12px;background:#fff;',
  trWord: 'display:inline-block;padding:4px 12px;background:#e8f4fd;color:#4a90d9;border-radius:4px;font-size:13px;margin:3px;',
  modal: 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;',
  modalCt: 'background:#fff;border-radius:12px;padding:32px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;',
  scoreBig: 'font-size:48px;font-weight:700;text-align:center;margin:20px 0;color:#4a90d9;',
  scoreLbl: 'font-size:16px;text-align:center;color:#666;margin-bottom:20px;',
  progBar: 'height:8px;background:#e0e0e0;border-radius:4px;overflow:hidden;margin-bottom:16px;',
  progFill: 'height:100%;background:#4a90d9;border-radius:4px;transition:width 0.3s;'
};

function esc(t) {
  var d = document.createElement('div');
  d.appendChild(document.createTextNode(t));
  return d.innerHTML;
}
function br(t) { return esc(t).replace(/\n/g, '<br>'); }
function paras(t) {
  var ps = t.split('\n\n');
  var h = '';
  for (var i = 0; i < ps.length; i++) {
    h += '<p style="margin:0 0 12px 0;line-height:1.9;font-size:15px;">' + esc(ps[i]).replace(/\n/g, '<br>') + '</p>';
  }
  return h;
}
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function safeParse(s, def) { try { return JSON.parse(s); } catch (e) { return def; } }
function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

/* ================================================================
 * MODULE 1: englishGrammarQuiz
 * ================================================================ */
window.englishGrammarQuiz = (function () {
  var SK = 'hspcb_eng_grammar_v1';
  var LEVELS = ['基础', '进阶', '冲刺'];

  var Q = [
    /* ---- 基础 1-10 ---- */
    { lv:'基础', tp:'时态', q:'By the time he arrived at the station, the train ______.', o:['has left','had left','left','was leaving'], a:1, e:'过去完成时表示在过去某个时间或动作之前已经完成的动作。"到达"是过去时，"离开"在其之前发生，用had left。' },
    { lv:'基础', tp:'时态', q:'I ______ in Beijing for five years, but I have never visited the Great Wall.', o:['have lived','lived','had lived','was living'], a:0, e:'现在完成时表示从过去持续到现在的动作或状态。"for five years"表示持续到现在的时段，用have lived。' },
    { lv:'基础', tp:'时态', q:'When I got home, my mother ______ dinner in the kitchen.', o:['cooks','is cooking','was cooking','has cooked'], a:2, e:'过去进行时表示过去某时刻正在进行的动作。"当我到家时"是过去的具体时间点，"做饭"正在进行，用was cooking。' },
    { lv:'基础', tp:'时态', q:'Look at those dark clouds! It ______ rain.', o:['will','is going to','shall','would'], a:1, e:'"be going to"表示根据当前迹象判断即将发生的事。乌云密布是下雨的迹象，用is going to。' },
    { lv:'基础', tp:'情态动词', q:'You ______ smoke in the hospital. It is strictly forbidden.', o:['need not','do not have to','must not','should not'], a:2, e:'"must not"表示禁止，语气最强。"禁止吸烟"是规定，用must not。' },
    { lv:'基础', tp:'情态动词', q:'You ______ have seen the film; it is really wonderful.', o:['should','must','can','may'], a:0, e:'"should have done"表示本应该做某事（但实际未做），带有建议意味。此处建议对方去看这部电影。' },
    { lv:'基础', tp:'定语从句', q:'The book ______ I bought yesterday is very interesting.', o:['that','who','what','where'], a:0, e:'先行词是book（物），关系代词用that或which。who用于人，what不引导定语从句，where是关系副词。' },
    { lv:'基础', tp:'定语从句', q:'The man ______ is standing under the tree is our English teacher.', o:['who','which','whom','whose'], a:0, e:'先行词是man（人），且在从句中作主语，关系代词用who。which用于物，whom作宾语，whose表所属。' },
    { lv:'基础', tp:'状语从句', q:'______ I was reading a book, the phone suddenly rang.', o:['When','While','As','Since'], a:1, e:'"while"引导的时间状语从句通常表示主句动作发生在从句动作进行期间。"正在阅读"是延续性动作，用while。' },
    { lv:'基础', tp:'时态', q:'She ______ English since she was ten years old.', o:['studies','studied','has been studying','is studying'], a:2, e:'现在完成进行时强调从过去某时开始一直持续到现在的动作。"since she was ten"表示持续到现在，用has been studying。' },

    /* ---- 进阶 11-20 ---- */
    { lv:'进阶', tp:'非谓语动词', q:'I remember ______ the door before I left the office yesterday.', o:['to lock','locking','lock','locked'], a:1, e:'"remember doing sth"表示记得做过某事；"remember to do sth"表示记得要做某事。此处"锁门"已做，用locking。' },
    { lv:'进阶', tp:'非谓语动词', q:'______ from the top of the hill, the city looks extremely beautiful.', o:['Seeing','Seen','To see','See'], a:1, e:'过去分词作状语表被动。"城市"与"看"是被动关系（被看），用Seen。' },
    { lv:'进阶', tp:'虚拟语气', q:'If I ______ you, I would accept the offer without hesitation.', o:['am','was','were','had been'], a:2, e:'与现在事实相反的虚拟语气，if从句用一般过去时，be动词一律用were。' },
    { lv:'进阶', tp:'虚拟语气', q:'I wish I ______ more time to prepare for the coming exam.', o:['have','had','will have','would have'], a:1, e:'"wish"后的宾语从句用虚拟语气。与现在事实相反，用一般过去时had。' },
    { lv:'进阶', tp:'名词性从句', q:'______ he will come to the meeting is still uncertain.', o:['That','Whether','What','Which'], a:1, e:'"whether"引导主语从句，表示"是否"，含有不确定性。"that"无实际意义，不表疑问。' },
    { lv:'进阶', tp:'定语从句', q:'Do you know the girl ______ father is a famous scientist?', o:['who','whom','whose','which'], a:2, e:'"whose"引导定语从句，表所属关系，在从句中作定语。"女孩的"父亲，用whose。' },
    { lv:'进阶', tp:'非谓语动词', q:'The ______ boy looked at the broken window with great fear.', o:['frightening','frightened','frighten','to frighten'], a:1, e:'过去分词作形容词表示"感到害怕的"（修饰人）；现在分词表示"令人害怕的"（修饰物）。男孩感到害怕，用frightened。' },
    { lv:'进阶', tp:'情态动词', q:'You ______ told me about the change earlier. I have already made plans.', o:['should have','must have','could','might'], a:0, e:'"should have done"表示本应该做某事（但实际未做），含责备意味。你本该早点告诉我。' },
    { lv:'进阶', tp:'时态', q:'He said he ______ finish the project the next day.', o:['will','would','has','had'], a:1, e:'过去将来时表示从过去某时看将要发生的事。主句谓语"said"是过去时，从句用would表示"将要"。' },
    { lv:'进阶', tp:'状语从句', q:'______ he is very old, he still works hard every day.', o:['Because','Although','Since','As'], a:1, e:'"although"引导让步状语从句，表示"虽然"。句意：虽然他很老了，但仍然每天努力工作。' },

    /* ---- 冲刺 21-30 ---- */
    { lv:'冲刺', tp:'倒装', q:'Not only ______ English well, but also he speaks French fluently.', o:['he speaks','does he speak','he does speak','speaks he'], a:1, e:'"Not only...but also"置于句首时，前半句部分倒装。助动词does提前，用"does he speak"。' },
    { lv:'冲刺', tp:'倒装', q:'Only when you have tried hard ______ the importance of perseverance.', o:['you will understand','will you understand','you understand','do you understand'], a:1, e:'"Only + 状语从句"置于句首时，主句部分倒装。用"will you understand"。' },
    { lv:'冲刺', tp:'虚拟语气', q:'______ he known the truth, he would have told us immediately.', o:['If','Had','Were','Should'], a:1, e:'虚拟语气的倒装形式：省略if，将had提前。与过去事实相反，从句用had + 过去分词。' },
    { lv:'冲刺', tp:'虚拟语气', q:'If it ______ to rain tomorrow, the sports meet would be postponed.', o:['is','was','were','had been'], a:2, e:'与将来事实相反的虚拟语气，if从句可用"were to + 动词原形"，be动词用were。' },
    { lv:'冲刺', tp:'非谓语动词', q:'______ to have been selected as the representative, she felt extremely proud.', o:['Being','Having been','To be','Been'], a:1, e:'完成式动名词的被动形式"having been done"表示被动的完成动作。已被选中的动作在felt之前完成。' },
    { lv:'冲刺', tp:'省略句', q:'______ necessary, I will come to help you personally.', o:['If','When','If being','If it is'], a:0, e:'在条件状语从句中，若主语是it且谓语含be动词，可省略"it is"。完整形式为"If (it is) necessary"。' },
    { lv:'冲刺', tp:'倒装', q:'"I do not like coffee." "______."', o:['Neither do I','Neither I do','So do I','So I do'], a:0, e:'"neither + 助动词/be动词 + 主语"表示"也不"。否定句的倒装用neither。' },
    { lv:'冲刺', tp:'虚拟语气', q:'The teacher demanded that the exam ______ before Friday.', o:['finished','be finished','was finished','would finish'], a:1, e:'"demand"后的宾语从句用虚拟语气：(should) + 动词原形。被动语态用be finished。' },
    { lv:'冲刺', tp:'虚拟语气', q:'If he had followed the doctor\'s advice, he ______ all right now.', o:['would be','would have been','had been','were'], a:0, e:'混合条件句：条件从句与过去事实相反（had followed），主句与现在事实相反，用would be。' },
    { lv:'冲刺', tp:'情态动词', q:'It is strange that he ______ so rude to his mother yesterday.', o:['is','was','should be','would be'], a:2, e:'"It is strange/important/necessary that..."结构中，从句用虚拟语气"(should) + 动词原形"。' }
  ];

  var state = { lv: '基础', idx: 0, ans: {}, done: {} };

  function load() {
    var d = safeParse(safeGet(SK), null);
    if (d) { state.ans = d.ans || {}; state.done = d.done || {}; }
  }
  function save() {
    safeSet(SK, JSON.stringify({ ans: state.ans, done: state.done }));
  }
  function lvlQs(lv) {
    var r = [];
    for (var i = 0; i < Q.length; i++) { if (Q[i].lv === lv) r.push(i); }
    return r;
  }
  function lvlScore(lv) {
    var ids = lvlQs(lv); var s = 0;
    for (var i = 0; i < ids.length; i++) {
      var qi = ids[i];
      if (state.ans[qi] !== undefined && state.ans[qi] === Q[qi].a) s++;
    }
    return s;
  }
  function lvlAnswered(lv) {
    var ids = lvlQs(lv); var n = 0;
    for (var i = 0; i < ids.length; i++) {
      if (state.ans[ids[i]] !== undefined) n++;
    }
    return n;
  }

  function buildHTML() {
    var h = '<div style="' + ST.wrap + '">';
    h += '<h2 style="' + ST.h2 + '">英语语法专练</h2>';
    h += '<div style="' + ST.desc + '">涵盖时态、非谓语动词、从句、虚拟语气、倒装、情态动词等高考核心语法点。每级10题，即时反馈附语法规则解析。</div>';

    /* level buttons */
    h += '<div style="' + ST.row + '">';
    for (var i = 0; i < LEVELS.length; i++) {
      var on = state.lv === LEVELS[i];
      var sc = lvlScore(LEVELS[i]);
      var an = lvlAnswered(LEVELS[i]);
      h += '<button data-action="sel-level" data-lv="' + LEVELS[i] + '" style="' + (on ? ST.btnOn : ST.btn) + '">' + LEVELS[i] + ' (' + sc + '/' + lvlQs(LEVELS[i]).length + ')</button>';
    }
    h += '</div>';

    /* progress bar */
    var ids = lvlQs(state.lv);
    var an = lvlAnswered(state.lv);
    var pct = Math.round((an / ids.length) * 100);
    h += '<div style="' + ST.bar + '">';
    h += '<span>进度: ' + an + '/' + ids.length + ' &nbsp; 得分: ' + lvlScore(state.lv) + '/' + ids.length + '</span>';
    h += '<span style="' + ST.badge + '">当前: ' + state.lv + '</span>';
    h += '</div>';
    h += '<div style="' + ST.progBar + '"><div style="' + ST.progFill + ';width:' + pct + '%;"></div></div>';

    /* question */
    var qi = ids[state.idx];
    var item = Q[qi];
    h += '<div style="' + ST.card + '">';
    h += '<div style="margin-bottom:8px;"><span style="' + ST.badge + '">' + item.tp + '</span><span style="' + ST.badgeGn + '">' + (state.idx + 1) + '/' + ids.length + '</span></div>';
    h += '<div style="' + ST.qtext + '">' + esc(item.q) + '</div>';

    var answered = state.ans[qi] !== undefined;
    for (var j = 0; j < 4; j++) {
      var sty = ST.opt;
      var dis = '';
      if (answered) {
        dis = ' disabled';
        if (j === item.a) sty = ST.optOk;
        else if (j === state.ans[qi]) sty = ST.optNo;
        else sty = ST.optDis;
      }
      h += '<button data-action="sel-opt" data-qi="' + qi + '" data-opt="' + j + '" style="' + sty + '"' + dis + '>' + esc(item.o[j]) + '</button>';
    }

    if (answered) {
      var correct = state.ans[qi] === item.a;
      h += '<div style="' + (correct ? ST.fbOk : ST.fbNo) + '">';
      h += '<strong>' + (correct ? '回答正确!' : '回答错误') + '</strong><br>';
      h += '正确答案: ' + item.o[item.a] + '<br>';
      h += '<strong>语法解析:</strong> ' + esc(item.e);
      h += '</div>';
    }
    h += '</div>';

    /* nav */
    h += '<div style="text-align:center;margin-bottom:16px;">';
    if (state.idx > 0) h += '<button data-action="prev" style="' + ST.btnGy + '">上一题</button>';
    if (state.idx < ids.length - 1) h += '<button data-action="next" style="' + ST.btn + '">下一题</button>';
    if (an === ids.length) h += '<button data-action="results" style="' + ST.btnGn + '">查看结果</button>';
    h += '</div>';

    /* all-level summary */
    h += '<div style="' + ST.card + '">';
    h += '<h3 style="' + ST.h3 + '">各级别总览</h3>';
    for (var k = 0; k < LEVELS.length; k++) {
      var lsc = lvlScore(LEVELS[k]);
      var lan = lvlAnswered(LEVELS[k]);
      var ltotal = lvlQs(LEVELS[k]).length;
      var lpct = Math.round((lsc / ltotal) * 100);
      h += '<div style="margin-bottom:8px;"><span style="display:inline-block;width:60px;font-weight:600;">' + LEVELS[k] + '</span>';
      h += '<span style="display:inline-block;width:280px;height:10px;background:#e0e0e0;border-radius:5px;vertical-align:middle;margin:0 8px;">';
      h += '<span style="display:inline-block;height:100%;width:' + lpct + '%;background:#4a90d9;border-radius:5px;"></span></span>';
      h += '<span>' + lsc + '/' + ltotal + (lan === ltotal ? ' (已完成)' : '') + '</span></div>';
    }
    h += '</div>';
    h += '</div>';
    return h;
  }

  function showResults() {
    var ids = lvlQs(state.lv);
    var sc = lvlScore(state.lv);
    var total = ids.length;
    var pct = Math.round((sc / total) * 100);
    var msg = pct >= 90 ? '优秀! 语法掌握扎实,继续保持!' : pct >= 70 ? '良好! 还有提升空间,复习错题解析。' : pct >= 50 ? '及格。建议重新学习本级别语法点。' : '需要加强。请仔细阅读每题解析后重做。';

    var h = '<div style="' + ST.wrap + '">';
    h += '<h2 style="' + ST.h2 + '">测试结果 - ' + state.lv + '级</h2>';
    h += '<div style="' + ST.card + '">';
    h += '<div style="' + ST.scoreBig + '">' + sc + '/' + total + '</div>';
    h += '<div style="' + ST.scoreLbl + '">正确率: ' + pct + '%</div>';
    h += '<div style="' + ST.fbInfo + '">' + msg + '</div>';

    h += '<h3 style="' + ST.h3 + ';margin-top:20px;">错题回顾</h3>';
    var hasWrong = false;
    for (var i = 0; i < ids.length; i++) {
      var qi = ids[i];
      if (state.ans[qi] !== undefined && state.ans[qi] !== Q[qi].a) {
        hasWrong = true;
        h += '<div style="' + ST.box + '">';
        h += '<div style="' + ST.qtext + '">' + esc(Q[qi].q) + '</div>';
        h += '<div style="color:#e74c3c;margin-bottom:4px;">你的答案: ' + esc(Q[qi].o[state.ans[qi]]) + '</div>';
        h += '<div style="color:#27ae60;margin-bottom:8px;">正确答案: ' + esc(Q[qi].o[Q[qi].a]) + '</div>';
        h += '<div style="font-size:13px;color:#666;">' + esc(Q[qi].e) + '</div>';
        h += '</div>';
      }
    }
    if (!hasWrong) h += '<div style="' + ST.empty + '">全部正确,无错题!</div>';
    h += '</div>';
    h += '<div style="text-align:center;">';
    h += '<button data-action="back" style="' + ST.btnGy + '">返回答题</button>';
    h += '<button data-action="retry" style="' + ST.btn + '">重做本级</button>';
    h += '</div>';
    h += '</div>';

    var c = document.getElementById('english-grammar-quiz-app');
    if (c) {
      c.innerHTML = h;
      attach(c);
    }
  }

  function attach(c) {
    c.onclick = function (e) {
      e = e || window.event;
      var t = e.target || e.srcElement;
      while (t && t !== c) {
        var act = t.getAttribute('data-action');
        if (act) {
          handle(act, t);
          if (e.preventDefault) e.preventDefault();
          return false;
        }
        t = t.parentNode;
      }
    };
  }

  function handle(act, el) {
    if (act === 'sel-level') {
      state.lv = el.getAttribute('data-lv');
      state.idx = 0;
      render();
    } else if (act === 'sel-opt') {
      var qi = parseInt(el.getAttribute('data-qi'), 10);
      var opt = parseInt(el.getAttribute('data-opt'), 10);
      if (state.ans[qi] === undefined) {
        state.ans[qi] = opt;
        var ids = lvlQs(state.lv);
        if (lvlAnswered(state.lv) === ids.length) state.done[state.lv] = true;
        save();
      }
      render();
    } else if (act === 'next') {
      var ids2 = lvlQs(state.lv);
      if (state.idx < ids2.length - 1) { state.idx++; render(); }
    } else if (act === 'prev') {
      if (state.idx > 0) { state.idx--; render(); }
    } else if (act === 'results') {
      showResults();
    } else if (act === 'back') {
      render();
    } else if (act === 'retry') {
      var ids3 = lvlQs(state.lv);
      for (var i = 0; i < ids3.length; i++) { delete state.ans[ids3[i]]; }
      state.done[state.lv] = false;
      state.idx = 0;
      save();
      render();
    }
  }

  function render() {
    load();
    var c = document.getElementById('english-grammar-quiz-app');
    if (!c) return;
    c.innerHTML = buildHTML();
    attach(c);
  }

  return { render: render };
})();

/* ================================================================
 * MODULE 2: englishReadingTrainer
 * ================================================================ */
window.englishReadingTrainer = (function () {
  var SK = 'hspcb_eng_reading_v1';

  var P = [
    {
      topic: '科学', title: 'The Quest for Clean Energy',
      text: 'As the world faces the growing threat of climate change, scientists are racing to find clean and renewable energy sources. Solar power, wind energy, and hydroelectric power have been at the forefront of this movement for decades. However, recent breakthroughs in nuclear fusion technology have sparked new hope among researchers.\n\nUnlike nuclear fission, which splits atoms and produces radioactive waste, fusion combines atoms to release vast amounts of energy -- the same process that powers the sun. Scientists have been working on achieving controlled fusion for over seventy years, but the extreme temperatures and pressures required make it incredibly difficult.\n\nIn December 2022, a major milestone was reached at a national laboratory in the United States. For the first time, a fusion experiment produced more energy than it consumed. While the achievement was modest in scale, it proved that fusion could eventually become a viable energy source.\n\nMeanwhile, solar and wind technologies continue to improve. The cost of solar panels has dropped by more than eighty percent over the past decade, making them accessible to households around the world. Floating wind farms, built far offshore where winds are stronger and more consistent, are another promising development.\n\nDespite these advances, challenges remain. Energy storage is perhaps the biggest obstacle. Solar and wind power are intermittent -- they only generate electricity when the sun shines or the wind blows. Developing better batteries is essential for a future powered by clean energy.\n\nExperts believe that with continued investment and innovation, the world could transition to mostly renewable energy within the next thirty years. The quest for clean energy is not just about technology; it is about ensuring a sustainable future for generations to come.',
      qs: [
        { tp:'细节题', q:'According to the passage, what makes nuclear fusion different from nuclear fission?', o:['Fusion produces more radioactive waste','Fusion splits atoms while fission combines them','Fusion combines atoms while fission splits them','Fusion is less powerful than fission'], a:2, e:'文中明确指出"fusion combines atoms to release vast amounts of energy"而"fission splits atoms and produces radioactive waste"。' },
        { tp:'主旨题', q:'What is the main idea of this passage?', o:['Nuclear fusion is the only solution to climate change','Scientists are exploring multiple clean energy sources','Solar power is the cheapest form of energy','Energy storage is impossible to achieve'], a:1, e:'文章讨论了多种清洁能源（核聚变、太阳能、风能）及其进展和挑战，主旨是科学家正在探索多种清洁能源。' },
        { tp:'推理题', q:'What can be inferred about the future of clean energy?', o:['It will replace fossil fuels within ten years','It faces no obstacles despite current challenges','Better battery technology is crucial for success','Nuclear fusion will be commercially available soon'], a:2, e:'文中提到"Developing better batteries is essential for a future powered by clean energy"，可推断更好的电池技术对成功至关重要。' },
        { tp:'词义题', q:'The word "intermittent" in paragraph 5 most likely means ______.', o:['continuous','occasional','powerful','expensive'], a:1, e:'后文解释"they only generate electricity when the sun shines or the wind blows"，说明是断断续续的，intermittent意为"间歇性的"。' }
      ]
    },
    {
      topic: '文化', title: 'The Art of the Tea Ceremony',
      text: 'The tea ceremony is one of the most cherished cultural traditions in East Asia, particularly in China and Japan. More than just a way to prepare a beverage, it is a ritual that embodies philosophy, aesthetics, and social harmony. The ceremony has been practiced for centuries, evolving from simple tea drinking into a sophisticated art form.\n\nIn China, the tea ceremony traces its origins back to the Tang Dynasty (618-907 AD), when tea became a popular drink among scholars and nobles. The Chinese approach emphasizes the natural flavor of the tea leaves and the skill of the host. Each step -- from selecting the leaves to pouring the water at the right temperature -- is performed with careful attention. The most famous Chinese tea ceremony is the Gongfu ceremony, which uses small clay pots and multiple short infusions to extract the fullest flavor.\n\nThe Japanese tea ceremony, known as Chanoyu, developed later and was deeply influenced by Zen Buddhism. It places greater emphasis on the spiritual aspect and the relationship between host and guest. The ceremony follows a precise sequence of movements, and every gesture carries symbolic meaning. The tea room is deliberately simple, reflecting the Zen principle of wabi-sabi -- an appreciation of simplicity and imperfection.\n\nBoth traditions share a common philosophy: hospitality, respect, and mindfulness. The host prepares the tea with full concentration, and the guests receive it with gratitude. In a fast-paced world, the tea ceremony offers a rare moment of stillness and connection.\n\nToday, tea ceremonies are enjoying a revival among young people. Many see them as a way to reconnect with their cultural roots and find balance in an increasingly digital world. Workshops and tea houses are flourishing, proving that this ancient tradition still resonates.',
      qs: [
        { tp:'细节题', q:'When did the Chinese tea ceremony originate?', o:['During the Song Dynasty','During the Tang Dynasty','During the Ming Dynasty','During the Han Dynasty'], a:1, e:'文中明确提到"The tea ceremony traces its origins back to the Tang Dynasty (618-907 AD)"。' },
        { tp:'主旨题', q:'What is the main idea of the passage?', o:['Japanese tea ceremonies are better than Chinese ones','The tea ceremony is a cultural tradition with deep philosophical roots','Tea ceremonies are no longer popular among young people','The Gongfu ceremony is the only true tea ceremony'], a:1, e:'文章介绍了中、日茶道的历史、哲学和现代复兴，主旨是茶道是一项具有深厚哲学根基的文化传统。' },
        { tp:'推理题', q:'What can be inferred about young people\'s interest in tea ceremonies?', o:['They find it boring and outdated','They see it as a way to connect with their heritage and find balance','They only participate for social media photos','They prefer modern coffee shops over tea houses'], a:1, e:'文中提到"Many see them as a way to reconnect with their cultural roots and find balance in an increasingly digital world"。' },
        { tp:'词义题', q:'The word "stillness" in paragraph 4 is closest in meaning to ______.', o:['movement','calm','noise','speed'], a:1, e:'"stillness"意为"静止、宁静"，与前文"fast-paced world"形成对比，与calm同义。' }
      ]
    },
    {
      topic: '社会', title: 'The Aging Population Challenge',
      text: 'One of the most significant demographic shifts of the twenty-first century is the aging of the global population. Thanks to advances in medicine, nutrition, and living standards, people are living longer than ever before. While this is a remarkable achievement, it also presents serious challenges for societies around the world.\n\nBy 2050, it is estimated that one in six people globally will be over the age of sixty-five, up from one in eleven in 2019. In some countries, such as Japan and Italy, this shift is already well underway. Japan, for instance, has the world\'s oldest population, with nearly thirty percent of its citizens aged sixty-five or older.\n\nThe economic implications are profound. A shrinking workforce means fewer people paying taxes and contributing to pension systems, while more people rely on retirement benefits and healthcare services. This puts enormous strain on government budgets. In response, some countries have raised the retirement age or encouraged immigration to fill labor gaps.\n\nSocial challenges are equally pressing. Many elderly people live alone, suffering from loneliness and isolation. The traditional family structure, where multiple generations lived under one roof, is becoming less common in urbanized societies. Community programs and volunteer organizations are trying to fill the gap, but their resources are limited.\n\nOn the positive side, many older adults are redefining what retirement looks like. Rather than withdrawing from society, they are starting businesses, learning new skills, and contributing their experience to their communities. The concept of "active aging" encourages older people to stay physically, socially, and economically engaged.\n\nFinding solutions to the aging population challenge will require creativity and cooperation. Governments, businesses, and individuals all have roles to play in building societies that value and support people at every stage of life.',
      qs: [
        { tp:'细节题', q:'What percentage of Japan\'s population is aged 65 or older?', o:['20%','25%','30%','35%'], a:2, e:'文中提到"nearly thirty percent of its citizens aged sixty-five or older"。' },
        { tp:'主旨题', q:'What is the main idea of the passage?', o:['Japan has the oldest population in the world','The aging population creates both challenges and opportunities','Older people should continue working after retirement','Governments cannot solve the aging problem'], a:1, e:'文章讨论了人口老龄化带来的经济和社会挑战，也提到了积极老龄化等机遇，主旨是老龄化既带来挑战也带来机遇。' },
        { tp:'推理题', q:'What can be inferred about the traditional family structure?', o:['It is becoming more common in cities','It helped provide care for elderly family members','It was only practiced in Japan','It is no longer needed in modern society'], a:1, e:'文中提到传统家庭结构（多代同堂）正在变得少见，暗示这种结构曾为老人提供照顾。' },
        { tp:'词义题', q:'The word "profound" in paragraph 3 is closest in meaning to ______.', o:['small','deep','simple','temporary'], a:1, e:'"profound"意为"深刻的、深远的"，与deep同义。后文列举了深远的经济影响来支撑这个词。' }
      ]
    },
    {
      topic: '环境', title: 'Plastic Pollution in Our Oceans',
      text: 'Every year, approximately eight million tons of plastic waste enters the world\'s oceans. That is equivalent to dumping a garbage truck full of plastic into the sea every minute. The scale of this pollution is staggering, and its effects on marine ecosystems are devastating.\n\nPlastic was once celebrated as a miracle material -- lightweight, durable, and cheap to produce. Today, those same qualities have made it one of the planet\'s biggest environmental threats. Unlike organic materials, plastic does not biodegrade. Instead, it breaks down into smaller pieces known as microplastics, which persist in the environment for hundreds of years.\n\nMarine life is particularly vulnerable. Sea turtles mistake plastic bags for jellyfish, seabirds feed plastic bits to their chicks, and whales wash ashore with stomachs full of plastic waste. Scientists estimate that over half of all sea turtles and nearly ninety percent of seabirds have ingested plastic. The ingestion can cause starvation, internal injuries, and death.\n\nMicroplastics have also entered the human food chain. These tiny particles have been found in fish, shellfish, and even table salt. While the health effects are still being studied, early research suggests that microplastics may cause inflammation and carry harmful chemicals.\n\nEfforts to address the crisis are growing. The United Nations has adopted resolutions to reduce marine plastic pollution, and many countries have banned single-use plastics like straws and bags. Innovative technologies, such as ocean cleanup systems that collect floating plastic, are being deployed in the Great Pacific Garbage Patch.\n\nHowever, the most effective solution is reducing plastic use at the source. Recycling alone is not enough -- only nine percent of all plastic ever produced has been recycled. Experts call for a shift toward reusable packaging, better waste management, and greater individual responsibility. Every person can make a difference by choosing sustainable alternatives.',
      qs: [
        { tp:'细节题', q:'How much plastic enters the oceans each year?', o:['8 million tons','8 thousand tons','80 million tons','800 thousand tons'], a:0, e:'文中第一句提到"approximately eight million tons of plastic waste enters the world\'s oceans"。' },
        { tp:'主旨题', q:'What is the main idea of the passage?', o:['Recycling is the best solution to plastic pollution','Plastic pollution is a severe environmental crisis requiring multiple solutions','Marine animals are the only victims of plastic pollution','Plastic should be completely banned worldwide'], a:1, e:'文章讨论了塑料污染的严重性及其对海洋和人类的影响，以及多种解决途径，主旨是塑料污染是严峻的环境危机，需要多种解决方案。' },
        { tp:'推理题', q:'What can be inferred about microplastics?', o:['They are harmless to humans','They may pose health risks to humans','They only affect marine animals','They can be easily removed from the ocean'], a:1, e:'文中提到"early research suggests that microplastics may cause inflammation and carry harmful chemicals"，可推断可能对人类有健康风险。' },
        { tp:'词义题', q:'The word "vulnerable" in paragraph 3 means ______.', o:['strong','easily harmed','resistant','invisible'], a:1, e:'"vulnerable"意为"易受伤害的"。后文举例说明海洋生物如何受害，与easily harmed同义。' }
      ]
    },
    {
      topic: '科技', title: 'The Double-Edged Sword of Social Media',
      text: 'Social media has transformed the way we communicate, share information, and view the world. Platforms connect billions of people across the globe, breaking down geographical barriers and creating virtual communities. Yet, as social media\'s influence has grown, so have concerns about its impact on mental health, privacy, and society at large.\n\nThe benefits are undeniable. Social media allows people to maintain relationships across distances, access information instantly, and express themselves creatively. For businesses, it provides a powerful marketing tool that reaches targeted audiences at low cost. During crises, social media has proven invaluable for spreading emergency information and organizing relief efforts.\n\nHowever, the dark side of social media is increasingly apparent. Studies have linked excessive social media use to anxiety, depression, and low self-esteem, particularly among teenagers. The constant comparison with others\' carefully curated lives can create feelings of inadequacy. Cyberbullying has become a serious problem, with devastating consequences in some cases.\n\nPrivacy is another major concern. Social media companies collect vast amounts of personal data, which can be used for targeted advertising or, more troublingly, sold to third parties. A major data scandal revealed how personal data could be weaponized to influence elections and manipulate public opinion.\n\nThe spread of misinformation has further eroded trust in social media. False stories, conspiracy theories, and deepfake videos can go viral within hours, making it difficult for users to distinguish fact from fiction. This has serious implications for democratic societies, where informed citizens are essential.\n\nFinding the right balance is crucial. Social media is not inherently good or evil -- it is a tool whose impact depends on how we use it. Parents, educators, and policymakers all have roles to play in promoting digital literacy and healthy online habits. As individuals, we must learn to use social media mindfully, recognizing both its power and its pitfalls.',
      qs: [
        { tp:'细节题', q:'What problem is particularly serious among teenagers according to the passage?', o:['Marketing problems','Mental health issues from excessive use','Privacy laws','Emergency information'], a:1, e:'文中提到"Studies have linked excessive social media use to anxiety, depression, and low self-esteem, particularly among teenagers"。' },
        { tp:'主旨题', q:'What is the main idea of the passage?', o:['Social media should be banned for teenagers','Social media has both positive and negative effects on society','Social media companies should be regulated by the government','Social media is the greatest invention of the 21st century'], a:1, e:'文章讨论了社交媒体的好处和坏处，主旨是社交媒体对社会既有积极也有消极影响。' },
        { tp:'推理题', q:'What can be inferred about the data scandal mentioned in the passage?', o:['It had no real impact on society','It showed how personal data could be misused to influence elections','It only affected social media companies','It led to the complete shutdown of major platforms'], a:1, e:'文中提到"personal data could be weaponized to influence elections and manipulate public opinion"。' },
        { tp:'词义题', q:'The word "curated" in paragraph 3 is closest in meaning to ______.', o:['random','carefully selected','deleted','shared publicly'], a:1, e:'"curated"意为"精心挑选的、筛选展示的"。指人们在社交媒体上精心挑选展示的内容，与carefully selected同义。' }
      ]
    },
    {
      topic: '教育', title: 'The Rise of Online Learning',
      text: 'The pandemic forced an unprecedented shift in education worldwide. Almost overnight, schools and universities closed their doors, and billions of students began learning from home. What began as an emergency response has evolved into a lasting transformation of how education is delivered and received.\n\nOnline learning is not entirely new. Universities have offered distance learning programs for decades, and educational platforms were already popular before the pandemic. However, the scale and speed of the shift were remarkable. Within months, nearly every educational institution adopted some form of online instruction.\n\nThe advantages of online learning are clear. It offers flexibility -- students can learn at their own pace and schedule. It eliminates geographical barriers, allowing students in remote areas to access quality education. Recorded lectures can be replayed, and digital resources are often more abundant than physical library collections.\n\nYet, the challenges are equally significant. Not all students have reliable internet access or suitable devices, creating a "digital divide" that widens existing inequalities. Younger children, in particular, struggle with self-directed learning and miss the social interaction that classrooms provide. Teachers, many of whom were untrained in online instruction, faced steep learning curves.\n\nResearch suggests that learning outcomes in fully online settings are generally lower than in traditional classrooms, especially for disadvantaged students. Hybrid models that combine in-person and online instruction appear to be the most effective approach. They offer the flexibility of digital learning while preserving the benefits of face-to-face interaction.\n\nAs we move beyond the pandemic, online learning will remain an important part of education. The key is not to replace traditional classrooms but to use technology thoughtfully to enhance them. The future of education is likely to be blended, personal, and lifelong -- powered by both human teachers and digital tools.',
      qs: [
        { tp:'细节题', q:'What caused the sudden shift to online learning?', o:['New technology developments','The COVID-19 pandemic','Government policies','Student preferences'], a:1, e:'文中开头提到"The pandemic forced an unprecedented shift in education worldwide"。' },
        { tp:'主旨题', q:'What is the main idea of the passage?', o:['Online learning is superior to traditional education','Online learning has both advantages and challenges, and hybrid models are best','The pandemic destroyed the education system permanently','Technology should replace human teachers entirely'], a:1, e:'文章讨论了在线学习的优势和挑战，提出混合模式最有效，主旨是在线学习有利有弊，混合模式最佳。' },
        { tp:'推理题', q:'What can be inferred about the "digital divide"?', o:['It has been completely resolved','It disproportionately affects disadvantaged students','It only affects rural areas','It improves learning outcomes'], a:1, e:'文中提到"digital divide"加剧了现有的不平等，后文又提到完全在线环境中弱势学生的学习效果更差，可推断数字鸿沟对弱势学生影响更大。' },
        { tp:'词义题', q:'The word "unprecedented" in paragraph 1 means ______.', o:['expected','never done before','small in scale','temporary'], a:1, e:'"unprecedented"意为"前所未有的"。后文描述了几乎一夜之间全球教育转型的规模和速度，说明是前所未有的。' }
      ]
    },
    {
      topic: '健康', title: 'The Science of Sleep',
      text: 'Sleep is one of the most fundamental biological processes, yet it remains one of the least understood. Humans spend roughly one-third of their lives asleep, but only in recent decades have scientists begun to uncover the complex mechanisms that govern this essential function.\n\nDuring sleep, the brain is far from idle. Research has shown that sleep plays a critical role in memory consolidation -- the process by which short-term memories are transformed into long-term ones. Studies at universities found that students who slept after learning a new task performed significantly better than those who stayed awake. The brain also uses sleep to clear out toxins that accumulate during waking hours, including proteins associated with certain diseases.\n\nThe physical benefits of sleep are equally important. During deep sleep, the body releases hormones that promote tissue repair, muscle growth, and immune system strengthening. Chronic sleep deprivation has been linked to a higher risk of heart disease, obesity, diabetes, and weakened immunity. One landmark study found that adults who regularly slept less than six hours per night had a significantly higher mortality rate than those who slept seven to eight hours.\n\nDespite these findings, sleep is often undervalued in modern society. The spread of smartphones and other devices has led to a decline in sleep quality, as the blue light emitted by screens suppresses melatonin production. Work demands, social pressures, and the cultural glorification of busyness further contribute to widespread sleep deficiency.\n\nExperts recommend that adults aim for seven to nine hours of sleep per night. Establishing a consistent sleep schedule, creating a dark and quiet sleeping environment, and avoiding screens before bedtime can significantly improve sleep quality. For students preparing for exams, getting adequate sleep is actually more beneficial than staying up late to study -- a well-rested brain learns and remembers far more effectively than a tired one.',
      qs: [
        { tp:'细节题', q:'What happens during memory consolidation?', o:['Short-term memories are lost','Short-term memories become long-term ones','The brain stops working','New memories are created'], a:1, e:'文中提到"memory consolidation -- the process by which short-term memories are transformed into long-term ones"。' },
        { tp:'主旨题', q:'What is the main idea of the passage?', o:['Sleep is a waste of time that could be used for studying','Sleep is essential for both brain function and physical health, but is often undervalued','Technology has improved sleep quality in modern society','Only older adults need to worry about getting enough sleep'], a:1, e:'文章讨论了睡眠对大脑和身体健康的重要性，以及现代社会对睡眠的忽视，主旨是睡眠对身心健康至关重要但常被低估。' },
        { tp:'推理题', q:'What can be inferred about students who stay up late to study?', o:['They perform better than well-rested students','They would likely perform better with adequate sleep','They have stronger immune systems','They remember more information'], a:1, e:'文中最后一句提到"a well-rested brain learns and remembers far more effectively than a tired one"，可推断熬夜学习的学生如果睡眠充足会表现更好。' },
        { tp:'词义题', q:'The word "proliferation" in paragraph 4 (the spread of smartphones) means ______.', o:['disappearance','rapid increase','improvement','reduction'], a:1, e:'"proliferation"意为"激增、扩散"。后文提到设备使用导致睡眠质量下降，说明设备大量增加，与rapid increase同义。' }
      ]
    },
    {
      topic: '旅行', title: 'The Rise of Sustainable Tourism',
      text: 'Tourism is one of the world\'s largest industries, generating trillions of dollars in revenue and supporting hundreds of millions of jobs. However, the rapid growth of international travel has taken a toll on popular destinations. Overcrowding, environmental degradation, and cultural erosion have prompted a growing movement toward sustainable tourism.\n\nSustainable tourism aims to minimize the negative impacts of travel while maximizing its benefits for local communities and environments. The concept encompasses three main pillars: environmental sustainability, economic sustainability, and social-cultural sustainability. Together, they ensure that tourism can be enjoyed by future generations.\n\nEnvironmentally, sustainable tourism encourages practices that reduce carbon footprints, protect wildlife, and preserve natural habitats. Eco-lodges built with local materials, solar-powered resorts, and wildlife tours that respect animal habitats are all examples of sustainable travel options. Some destinations have implemented visitor caps to prevent overtourism from damaging fragile ecosystems.\n\nEconomically, sustainable tourism seeks to ensure that tourism revenue benefits local communities rather than leaking out to international corporations. This means supporting locally owned hotels, restaurants, and tour operators. When tourists buy local crafts, eat at family-run establishments, and hire local guides, their money stays within the community, creating jobs and supporting local traditions.\n\nSocial-cultural sustainability involves respecting and preserving local traditions. Tourists are encouraged to learn about local customs, dress appropriately, and participate in cultural activities rather than merely observing from a distance. This fosters mutual understanding and helps communities maintain their identity in the face of globalization.\n\nTravelers themselves play a crucial role. By choosing sustainable operators, reducing plastic waste, respecting local cultures, and traveling off-season to ease congestion, individual tourists can make a significant difference. The goal is not to stop traveling but to travel more thoughtfully -- leaving only footprints and taking only memories.',
      qs: [
        { tp:'细节题', q:'What are the three pillars of sustainable tourism?', o:['Environmental, economic, and social-cultural sustainability','Environmental, political, and technological sustainability','Economic, educational, and environmental sustainability','Social, technological, and cultural sustainability'], a:0, e:'文中明确提到"The concept encompasses three main pillars: environmental sustainability, economic sustainability, and social-cultural sustainability"。' },
        { tp:'主旨题', q:'What is the main idea of the passage?', o:['Tourism should be completely stopped to protect the environment','Sustainable tourism aims to balance travel\'s impacts with benefits for communities and environments','Only governments can solve tourism\'s problems','Sustainable tourism is too expensive for most travelers'], a:1, e:'文章讨论了可持续旅游的概念和三大支柱，主旨是可持续旅游旨在平衡旅游的影响和社区环境的收益。' },
        { tp:'推理题', q:'What can be inferred about overtourism?', o:['It has no negative effects on destinations','It can damage fragile ecosystems, which is why visitor caps are needed','It only affects local economies positively','It is not a real concern for most destinations'], a:1, e:'文中提到"Some destinations have implemented visitor caps to prevent overtourism from damaging fragile ecosystems"，可推断过度旅游会损害脆弱的生态系统。' },
        { tp:'词义题', q:'The word "congestion" in the last paragraph means ______.', o:['pollution','overcrowding','development','improvement'], a:1, e:'"congestion"意为"拥挤"。前文提到overcrowding问题，旅行淡季出行可缓解拥挤，与overcrowding同义。' }
      ]
    }
  ];

  var state = { cur: -1, ans: {}, sub: {}, timerId: null, remain: 480 };

  function load() {
    var d = safeParse(safeGet(SK), null);
    if (d) { state.ans = d.ans || {}; state.sub = d.sub || {}; }
  }
  function save() {
    safeSet(SK, JSON.stringify({ ans: state.ans, sub: state.sub }));
  }
  function clearTimer() {
    if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
  }
  function startTimer() {
    clearTimer();
    state.remain = 480;
    state.timerId = setInterval(function () {
      state.remain--;
      updateTimer();
      if (state.remain <= 0) {
        clearTimer();
        submitAns();
      }
    }, 1000);
  }
  function updateTimer() {
    var el = document.getElementById('reading-timer');
    if (!el) return;
    var m = Math.floor(state.remain / 60);
    var s = state.remain % 60;
    el.textContent = pad2(m) + ':' + pad2(s);
    if (state.remain < 60) el.style.color = '#e74c3c';
    else if (state.remain < 120) el.style.color = '#f39c12';
  }
  function passageScore(pi) {
    var sc = 0;
    for (var i = 0; i < P[pi].qs.length; i++) {
      var k = pi + '_' + i;
      if (state.ans[k] !== undefined && state.ans[k] === P[pi].qs[i].a) sc++;
    }
    return sc;
  }

  function buildListHTML() {
    var h = '<div style="' + ST.wrap + '">';
    h += '<h2 style="' + ST.h2 + '">英语阅读训练</h2>';
    h += '<div style="' + ST.desc + '">8篇高考难度阅读理解，涵盖科学、文化、社会、环境、科技、教育、健康、旅行主题。每篇4题（细节、主旨、推理、词义），建议8分钟完成。</div>';

    var totalDone = 0, totalScore = 0, totalQ = 0;
    for (var i = 0; i < P.length; i++) {
      totalQ += P[i].qs.length;
      if (state.sub[i]) { totalDone++; totalScore += passageScore(i); }
    }
    h += '<div style="' + ST.bar + '">';
    h += '<span>已完成: ' + totalDone + '/' + P.length + ' 篇 &nbsp; 总得分: ' + totalScore + '/' + totalQ + '</span>';
    h += '</div>';
    h += '<div style="' + ST.progBar + '"><div style="' + ST.progFill + ';width:' + Math.round((totalDone / P.length) * 100) + '%;"></div></div>';

    for (var j = 0; j < P.length; j++) {
      var done = state.sub[j];
      var sc = passageScore(j);
      h += '<div style="' + ST.card + ';cursor:pointer;" data-action="sel-passage" data-idx="' + j + '">';
      h += '<div style="display:flex;justify-content:space-between;align-items:center;">';
      h += '<div><span style="' + ST.badge + '">' + P[j].topic + '</span>';
      h += '<span style="font-size:16px;font-weight:600;margin-left:8px;">Passage ' + (j + 1) + ': ' + esc(P[j].title) + '</span></div>';
      if (done) h += '<span style="' + ST.badgeGn + '">' + sc + '/' + P[j].qs.length + '</span>';
      else h += '<span style="' + ST.badge + '">未做</span>';
      h += '</div></div>';
    }
    h += '</div>';
    return h;
  }

  function buildPassageHTML(pi) {
    var p = P[pi];
    var submitted = state.sub[pi];
    var h = '<div style="' + ST.wrap + '">';
    h += '<button data-action="back" style="' + ST.btnGy + ';margin-bottom:12px;">返回列表</button>';
    h += '<h2 style="' + ST.h2 + '">Passage ' + (pi + 1) + ': ' + esc(p.title) + '</h2>';
    h += '<div style="' + ST.bar + '"><span style="' + ST.badge + '">' + p.topic + '</span>';
    h += '<span>共 ' + p.qs.length + ' 题 | 建议时间: 8分钟</span></div>';

    if (!submitted) {
      h += '<div id="reading-timer" style="' + ST.timer + '">08:00</div>';
    }

    h += '<div style="' + ST.passage + '">' + paras(p.text) + '</div>';

    for (var i = 0; i < p.qs.length; i++) {
      var q = p.qs[i];
      var k = pi + '_' + i;
      var answered = state.ans[k] !== undefined;
      h += '<div style="' + ST.card + '">';
      h += '<div style="margin-bottom:8px;"><span style="' + ST.badge + '">' + q.tp + '</span><span style="' + ST.badgeGn + '">第' + (i + 1) + '题</span></div>';
      h += '<div style="' + ST.qtext + '">' + (i + 1) + '. ' + esc(q.q) + '</div>';
      for (var j = 0; j < 4; j++) {
        var sty = ST.opt;
        var dis = '';
        if (submitted) {
          dis = ' disabled';
          if (j === q.a) sty = ST.optOk;
          else if (answered && j === state.ans[k]) sty = ST.optNo;
          else sty = ST.optDis;
        }
        h += '<button data-action="sel-ans" data-k="' + k + '" data-opt="' + j + '" style="' + sty + '"' + dis + '>' + esc(q.o[j]) + '</button>';
      }
      if (submitted) {
        var correct = answered && state.ans[k] === q.a;
        h += '<div style="' + (correct ? ST.fbOk : ST.fbNo) + '">';
        h += '<strong>' + (correct ? '正确!' : (answered ? '错误' : '未作答')) + '</strong><br>';
        h += '正确答案: ' + esc(q.o[q.a]) + '<br>';
        h += '<strong>解析:</strong> ' + esc(q.e);
        h += '</div>';
      }
      h += '</div>';
    }

    if (!submitted) {
      h += '<div style="text-align:center;margin-bottom:16px;">';
      h += '<button data-action="submit" style="' + ST.btnGn + '">提交答案</button>';
      h += '</div>';
    } else {
      var sc = passageScore(pi);
      h += '<div style="' + ST.fbInfo + ';text-align:center;">';
      h += '<strong>本篇得分: ' + sc + '/' + p.qs.length + '</strong>';
      h += '</div>';
      h += '<div style="text-align:center;margin-bottom:16px;">';
      h += '<button data-action="retry" data-idx="' + pi + '" style="' + ST.btn + '">重做本篇</button>';
      h += '</div>';
    }
    h += '</div>';
    return h;
  }

  function attach(c) {
    c.onclick = function (e) {
      e = e || window.event;
      var t = e.target || e.srcElement;
      while (t && t !== c) {
        var act = t.getAttribute('data-action');
        if (act) {
          handle(act, t);
          if (e.preventDefault) e.preventDefault();
          return false;
        }
        t = t.parentNode;
      }
    };
  }

  function handle(act, el) {
    if (act === 'sel-passage') {
      state.cur = parseInt(el.getAttribute('data-idx'), 10);
      render();
      if (!state.sub[state.cur]) {
        startTimer();
      }
    } else if (act === 'back') {
      clearTimer();
      state.cur = -1;
      render();
    } else if (act === 'sel-ans') {
      var k = el.getAttribute('data-k');
      var opt = parseInt(el.getAttribute('data-opt'), 10);
      if (!state.sub[state.cur]) {
        state.ans[k] = opt;
        save();
        render();
      }
    } else if (act === 'submit') {
      submitAns();
    } else if (act === 'retry') {
      var pi = parseInt(el.getAttribute('data-idx'), 10);
      for (var i = 0; i < P[pi].qs.length; i++) {
        delete state.ans[pi + '_' + i];
      }
      delete state.sub[pi];
      save();
      state.cur = pi;
      render();
      startTimer();
    }
  }

  function submitAns() {
    clearTimer();
    if (state.cur < 0) return;
    state.sub[state.cur] = true;
    save();
    render();
    var c = document.getElementById('english-reading-trainer-app');
    if (c) c.scrollTop = 0;
  }

  function render() {
    load();
    var c = document.getElementById('english-reading-trainer-app');
    if (!c) return;
    if (state.cur < 0) {
      c.innerHTML = buildListHTML();
    } else {
      c.innerHTML = buildPassageHTML(state.cur);
    }
    attach(c);
  }

  return { render: render };
})();

/* ================================================================
 * MODULE 3: englishCompositionTemplates
 * ================================================================ */
window.englishCompositionTemplates = (function () {
  var CATS = [
    {
      name: '书信作文',
      tpl: [
        {
          title: 'Application Letter (求职信)',
          content: 'Dear Sir/Madam,\n\nI am writing to apply for the position of [position] advertised in [source]. I believe I am well-qualified for this position.\n\nI am a [grade/major] student at [school]. I have a good command of English, both written and spoken. In addition, I have gained relevant experience through [experience]. I am hardworking, responsible, and easy to get along with.\n\nI would appreciate it if you could give me an opportunity for an interview. I am looking forward to your reply.\n\nYours sincerely,\n[Your Name]',
          phrases: ['I am writing to apply for...', 'I believe I am well-qualified for...', 'I have a good command of...', 'I would appreciate it if...', 'I am looking forward to your reply.'],
          transitions: ['in addition', 'furthermore', 'what is more']
        },
        {
          title: 'Advice Letter (建议信)',
          content: 'Dear [Name],\n\nI am sorry to learn that you are having trouble with [problem]. I would like to offer you some advice.\n\nFirst of all, it would be a good idea to [suggestion 1]. In addition, you had better [suggestion 2]. Last but not least, remember to [suggestion 3].\n\nI hope you will find these suggestions helpful. I am sure you will overcome the difficulty soon.\n\nYours,\n[Your Name]',
          phrases: ['I am sorry to learn that...', 'I would like to offer you some advice.', 'it would be a good idea to...', 'you had better...', 'I hope you will find these suggestions helpful.'],
          transitions: ['first of all', 'in addition', 'last but not least']
        },
        {
          title: 'Invitation Letter (邀请信)',
          content: 'Dear [Name],\n\nI am writing to invite you to attend [event], which will be held at [location] on [date] at [time].\n\nThe event will include [activities]. It would be our great honor if you could join us. We have also invited [other guests], and I am sure it will be a wonderful occasion.\n\nPlease let me know if you can come. I am looking forward to seeing you.\n\nYours sincerely,\n[Your Name]',
          phrases: ['I am writing to invite you to...', 'It would be our great honor if...', 'Please let me know if...', 'I am looking forward to seeing you.'],
          transitions: ['in addition', 'what is more', 'meanwhile']
        },
        {
          title: 'Thank-You Letter (感谢信)',
          content: 'Dear [Name],\n\nI am writing to express my sincere gratitude for [what they did]. Your [quality] meant a great deal to me.\n\nThanks to your help, I was able to [result]. I truly appreciate your kindness and generosity. I will never forget what you have done for me.\n\nI hope I can have the opportunity to return your favor in the future. Thank you again from the bottom of my heart.\n\nYours sincerely,\n[Your Name]',
          phrases: ['I am writing to express my sincere gratitude for...', 'Thanks to your help, I was able to...', 'I truly appreciate your kindness.', 'Thank you again from the bottom of my heart.'],
          transitions: ['thanks to', 'in addition', 'furthermore']
        },
        {
          title: 'Apology Letter (道歉信)',
          content: 'Dear [Name],\n\nI am writing to apologize to you for [what happened]. I feel terribly sorry about this.\n\nThe reason for [what happened] was that [explanation]. I understand this has caused you inconvenience, and I deeply regret it. To make up for it, I would like to [solution].\n\nPlease accept my sincere apologies. I assure you that this will not happen again. I hope you can understand and forgive me.\n\nYours sincerely,\n[Your Name]',
          phrases: ['I am writing to apologize to you for...', 'I feel terribly sorry about...', 'The reason for... was that...', 'Please accept my sincere apologies.', 'I assure you that this will not happen again.'],
          transitions: ['the reason for', 'to make up for it', 'in addition']
        },
        {
          title: 'Complaint Letter (投诉信)',
          content: 'Dear Sir/Madam,\n\nI am writing to express my dissatisfaction with [product/service]. I [purchased/used] it on [date], but [problem description].\n\nI have already [actions taken], but the problem remains unresolved. I would like to request [desired solution]. I believe this is a reasonable request given the circumstances.\n\nI hope to receive a satisfactory response soon. Thank you for your attention to this matter.\n\nYours sincerely,\n[Your Name]',
          phrases: ['I am writing to express my dissatisfaction with...', 'I would like to request...', 'I believe this is a reasonable request.', 'I hope to receive a satisfactory response soon.'],
          transitions: ['but', 'however', 'in addition']
        }
      ]
    },
    {
      name: '议论文',
      tpl: [
        {
          title: 'On the Importance of Reading (论阅读的重要性)',
          content: 'Reading is to the mind what exercise is to the body. In today\'s fast-paced world, the importance of reading cannot be overstated.\n\nTo begin with, reading broadens our horizons and enriches our knowledge. Through books, we can explore different cultures, learn from great thinkers, and gain insights into life. Furthermore, reading improves our thinking ability and language skills. As Francis Bacon once said, "Reading makes a full man." Last but not least, reading provides us with spiritual nourishment, helping us find peace in a noisy world.\n\nIn conclusion, reading is an invaluable habit that benefits us throughout our lives. Let us put down our phones and pick up a book. The more we read, the more we grow.',
          phrases: ['Reading is to the mind what exercise is to the body.', 'the importance of reading cannot be overstated', 'reading broadens our horizons', 'Reading makes a full man.', 'The more we read, the more we grow.'],
          transitions: ['to begin with', 'furthermore', 'last but not least', 'in conclusion']
        },
        {
          title: 'On Perseverance (论坚持)',
          content: '"Where there is a will, there is a way." This famous proverb highlights the importance of perseverance -- the quality of continuing to try despite difficulties.\n\nHistory is full of examples of perseverance leading to success. Thomas Edison failed thousands of times before inventing the light bulb. Abraham Lincoln lost numerous elections before becoming one of America\'s greatest presidents. Their stories teach us that setbacks are not failures but stepping stones to success.\n\nIn our daily lives, perseverance is equally important. Whether we are learning a new skill, preparing for exams, or pursuing a dream, we will inevitably face obstacles. It is perseverance that keeps us going when the going gets tough.\n\nIn a word, perseverance is the key to success. No great achievement was ever accomplished without it. Let us hold on to our dreams and never give up, for success belongs to those who persist.',
          phrases: ['Where there is a will, there is a way.', 'the quality of continuing to try despite difficulties', 'setbacks are not failures but stepping stones to success', 'It is perseverance that keeps us going.', 'success belongs to those who persist.'],
          transitions: ['in addition', 'whether...or...', 'in a word', 'for']
        },
        {
          title: 'On Cooperation (论合作)',
          content: 'In an increasingly interconnected world, cooperation has become more important than ever. No individual or organization can succeed alone in today\'s complex society.\n\nCooperation brings mutual benefits. When people work together, they can combine their strengths, share resources, and achieve goals that would be impossible to reach individually. As the saying goes, "Alone we can go fast, but together we can go far." In the business world, partnerships drive innovation. In scientific research, international collaboration leads to breakthroughs. In sports, teamwork determines victory.\n\nHowever, effective cooperation requires certain qualities. We need to be good listeners, patient communicators, and willing to compromise. We must respect different opinions and value each member\'s contribution.\n\nTo sum up, cooperation is not just a skill but a necessity in the modern world. By working together, we can overcome challenges that no one can face alone.',
          phrases: ['cooperation has become more important than ever', 'No individual or organization can succeed alone', 'Alone we can go fast, but together we can go far.', 'cooperation is not just a skill but a necessity', 'By working together, we can overcome challenges.'],
          transitions: ['when', 'however', 'to sum up', 'by']
        },
        {
          title: 'On Environmental Protection (论环境保护)',
          content: 'With the rapid development of industry and economy, environmental problems have become increasingly severe. It is high time that we took action to protect our planet.\n\nThe consequences of environmental destruction are alarming. Air pollution causes respiratory diseases, water contamination threatens food safety, and climate change leads to extreme weather events. If we continue to ignore these problems, the consequences will be catastrophic.\n\nTo protect the environment, everyone must take responsibility. Governments should enact stricter laws to reduce pollution. Businesses should adopt green technologies and sustainable practices. As individuals, we can start with small things: reducing waste, recycling, using public transportation, and conserving energy.\n\nIn conclusion, protecting the environment is not a choice but a duty. The Earth is our only home, and we must preserve it for future generations. Remember: every small action counts.',
          phrases: ['It is high time that we took action', 'The consequences of... are alarming.', 'everyone must take responsibility', 'protecting the environment is not a choice but a duty', 'every small action counts.'],
          transitions: ['with', 'if', 'to protect', 'in conclusion']
        },
        {
          title: 'On the Impact of Smartphones (论智能手机的影响)',
          content: 'Smartphones have become an indispensable part of our lives. While they bring convenience, their impact is a double-edged sword.\n\nOn the positive side, smartphones have revolutionized communication. We can stay connected with friends and family anywhere, anytime. They also provide instant access to information, entertainment, and various services. For students, smartphones offer valuable learning tools and educational apps.\n\nHowever, the negative effects cannot be ignored. Excessive smartphone use has been linked to addiction, sleep problems, and poor academic performance. Face-to-face communication is declining, and many people feel more isolated despite being "connected" online. Moreover, constant distractions from notifications make it difficult to concentrate.\n\nIn my opinion, smartphones are neither good nor bad -- it depends on how we use them. We should develop healthy digital habits, such as setting screen-time limits and putting phones away during meals and study sessions. Technology should serve us, not control us.',
          phrases: ['an indispensable part of our lives', 'their impact is a double-edged sword', 'the negative effects cannot be ignored', 'smartphones are neither good nor bad', 'Technology should serve us, not control us.'],
          transitions: ['while', 'on the positive side', 'however', 'moreover', 'in my opinion']
        },
        {
          title: 'On the Value of Time (论时间的价值)',
          content: '"Time is money," as the saying goes. But in fact, time is far more precious than money, for money lost can be regained, but time lost is gone forever.\n\nUnfortunately, many people fail to realize the value of time. They waste hours scrolling through social media, playing video games, or simply doing nothing. Procrastination has become a widespread habit, especially among students. They put off until tomorrow what should be done today, only to regret it later.\n\nTo make the most of our time, we should learn to prioritize. Make a daily plan and stick to it. Focus on what is important rather than what is urgent. Most importantly, take action now. As the Chinese proverb says, "The best time to plant a tree was twenty years ago. The second best time is now."\n\nIn conclusion, time is the most valuable resource we have. Let us cherish every moment and make every second count, for lost time is never found again.',
          phrases: ['time is far more precious than money', 'time lost is gone forever', 'many people fail to realize the value of time', 'make the most of our time', 'lost time is never found again.'],
          transitions: ['but', 'unfortunately', 'to make the most of', 'most importantly', 'in conclusion']
        }
      ]
    },
    {
      name: '读后续写',
      tpl: [
        {
          title: 'Overcoming Fear (克服恐惧)',
          content: 'Paragraph 1 (Rising Action):\nLooking around, [character] felt a wave of [emotion] washing over [him/her]. [Description of the scary situation]. For a moment, [he/she] wanted to turn back. But then, [he/she] remembered [motivation]. Taking a deep breath, [he/she] [action that shows courage].\n\nParagraph 2 (Resolution):\nEventually, [character] [achieved the goal/overcame the obstacle]. Looking back at what [he/she] had accomplished, a sense of pride filled [his/her] heart. [He/She] realized that fear was just an illusion, and courage was not the absence of fear, but the triumph over it. From that day on, [character] was never the same again.',
          phrases: ['felt a wave of... washing over', 'Taking a deep breath', 'a sense of pride filled his/her heart', 'courage was not the absence of fear, but the triumph over it', 'was never the same again'],
          transitions: ['but then', 'eventually', 'looking back', 'from that day on']
        },
        {
          title: 'A Helping Hand (伸出援手)',
          content: 'Paragraph 1 (Situation):\nWithout hesitation, [character] rushed forward to help. [Description of the helping action]. It was not easy -- [obstacle/difficulty]. But [character] refused to give up. With [effort/determination], [he/she] managed to [result of helping].\n\nParagraph 2 (Reflection):\nSeeing the grateful smile on [person]\'s face, [character] felt a warmth spreading through [his/her] chest. [He/She] understood that helping others was not about expecting something in return, but about the joy of making a difference. As [he/she] walked away, [character] knew that this small act of kindness had changed not just one life, but two.',
          phrases: ['Without hesitation', 'rushed forward to help', 'refused to give up', 'felt a warmth spreading through', 'the joy of making a difference', 'had changed not just one life, but two'],
          transitions: ['but', 'with', 'seeing', 'as']
        },
        {
          title: 'The Unexpected Gift (意外的礼物)',
          content: 'Paragraph 1 (Discovery):\nTo [character]\'s astonishment, [he/she] found [description of the gift/surprise]. [His/Her] heart raced as [he/she] [action]. Could this really be for [him/her]? [Description of emotions -- disbelief, joy, gratitude]. [He/She] could hardly believe [his/her] eyes.\n\nParagraph 2 (Meaning):\nAs [character] held the [gift] in [his/her] hands, [he/she] thought about [who gave it and why]. Tears of gratitude welled up in [his/her] eyes. It was not the material value that mattered, but the love and thought behind it. [Character] promised [himself/herself] to cherish this gift forever, for it was a reminder that [life lesson].',
          phrases: ['To his/her astonishment', 'heart raced', 'could hardly believe his/her eyes', 'Tears of gratitude welled up', 'It was not the material value that mattered', 'a reminder that'],
          transitions: ['as', 'but', 'for']
        },
        {
          title: 'A Lesson Learned (一堂难忘的课)',
          content: 'Paragraph 1 (The Mistake):\n[Character] stood there, [emotion], as the consequences of [his/her] actions sank in. [Description of what went wrong]. If only [he/she] had listened to [advice]. If only [he/she] had thought twice before acting. But it was too late for regrets now.\n\nParagraph 2 (The Lesson):\nThat day, [character] learned a lesson [he/she] would never forget. [He/She] realized that [the lesson -- e.g., honesty is the best policy / actions have consequences / pride comes before a fall]. From then on, [character] [changed behavior]. Sometimes, the most important lessons in life come not from books, but from experience.',
          phrases: ['as the consequences of... sank in', 'If only... had listened to', 'it was too late for regrets', 'learned a lesson he/she would never forget', 'the most important lessons come not from books, but from experience'],
          transitions: ['as', 'if only', 'but', 'that day', 'from then on']
        },
        {
          title: 'The Power of Friendship (友谊的力量)',
          content: 'Paragraph 1 (Conflict/Crisis):\n[Character] felt [alone/abandoned/lost]. [Description of the difficult situation]. Just when [he/she] was about to [give up/lose hope], a familiar voice called out. It was [friend\'s name]. Without a word, [friend] [action showing support -- put an arm around him/her, handed him/her something, stood by his/her side].\n\nParagraph 2 (Resolution):\nTogether, they [action -- faced the challenge, solved the problem, walked through the difficulty]. [Character] realized that true friendship is not about being there when times are good, but about standing by each other when times are hard. As they walked side by side, [character] knew that with a friend like [friend\'s name], [he/she] could face anything.',
          phrases: ['Just when... was about to', 'a familiar voice called out', 'Without a word', 'true friendship is not about... but about...', 'standing by each other when times are hard', 'with a friend like..., he/she could face anything'],
          transitions: ['just when', 'without', 'together', 'as']
        },
        {
          title: 'A Turning Point (转折点)',
          content: 'Paragraph 1 (The Moment):\nEverything changed in that single moment. [Description of the turning point event]. [Character]\'s eyes widened as [he/she] [realized/discovered/witnessed something]. The world seemed to stop, and in that silence, [he/she] saw everything differently.\n\nParagraph 2 (Transformation):\nFrom that day forward, [character] was a different person. [Description of how they changed -- more confident, more compassionate, more determined]. [He/She] had discovered something that no textbook could teach: that life\'s most important moments often come disguised as ordinary ones. And sometimes, it takes a single moment to change the direction of an entire life.',
          phrases: ['Everything changed in that single moment', 'eyes widened', 'The world seemed to stop', 'was a different person', 'no textbook could teach', 'life\'s most important moments often come disguised as ordinary ones', 'it takes a single moment to change the direction of an entire life'],
          transitions: ['as', 'and in that silence', 'from that day forward', 'that', 'and sometimes']
        }
      ]
    }
  ];

  var SP = [
    { p: 'It is widely acknowledged that...', t: '人们普遍认为……', u: '议论文开篇引出普遍观点' },
    { p: 'There is no denying that...', t: '不可否认……', u: '强调不可辩驳的事实' },
    { p: 'It goes without saying that...', t: '不言而喻……', u: '引出显而易见的道理' },
    { p: 'As is known to all,...', t: '众所周知……', u: '引出常识性信息' },
    { p: 'It is universally accepted that...', t: '人们普遍接受……', u: '引出被广泛认可的观点' },
    { p: 'Recent years have witnessed...', t: '近年来见证了……', u: '描述时代趋势或变化' },
    { p: 'With the development of..., ...', t: '随着……的发展，……', u: '引出背景和趋势' },
    { p: 'There is a growing concern over...', t: '人们对……越来越关注', u: '引出社会关注的话题' },
    { p: 'It is high time that we...', t: '是我们……的时候了', u: '呼吁采取行动（从句用过去时）' },
    { p: 'Only in this way can we...', t: '只有这样我们才能……', u: '倒装句强调方法（部分倒装）' },
    { p: 'On no account can we...', t: '我们决不能……', u: '倒装句强调禁止（部分倒装）' },
    { p: 'By no means should we...', t: '我们绝不应当……', u: '倒装句强调不应该' },
    { p: 'So... that...', t: '如此……以至于……', u: '描述程度和结果' },
    { p: 'Not only... but also...', t: '不仅……而且……', u: '并列递进（句首时部分倒装）' },
    { p: 'The + 比较级..., the + 比较级...', t: '越……，越……', u: '描述两个成比例变化的事物' },
    { p: 'It is + adj + for sb to do sth', t: '做某事对某人来说是……的', u: '形式主语评价行为' },
    { p: 'What matters most is...', t: '最重要的是……', u: '强调核心要素' },
    { p: 'There is no doubt that...', t: '毫无疑问……', u: '表达确定无疑的判断' },
    { p: 'Taking all these factors into consideration, we may safely arrive at the conclusion that...', t: '综合考虑所有因素，我们可以得出结论……', u: '议论文结尾总结全文' },
    { p: 'As the proverb goes,...', t: '正如谚语所说……', u: '引用谚语增强说服力' },
    { p: 'Where there is a will, there is a way.', t: '有志者事竟成。', u: '强调意志和坚持的重要性' },
    { p: 'It is + 被强调部分 + that/who...', t: '正是……（强调句型）', u: '强调句中某一成分' }
  ];

  var TW = [
    { name: '递进 (Addition)', words: ['furthermore', 'moreover', 'in addition', 'what is more', 'besides', 'additionally', 'also', 'not only...but also'] },
    { name: '转折 (Contrast)', words: ['however', 'nevertheless', 'on the contrary', 'in contrast', 'whereas', 'while', 'despite', 'in spite of'] },
    { name: '因果 (Cause & Effect)', words: ['therefore', 'consequently', 'as a result', 'thus', 'hence', 'because of', 'due to', 'owing to'] },
    { name: '举例 (Example)', words: ['for example', 'for instance', 'such as', 'namely', 'take...for example', 'to illustrate'] },
    { name: '总结 (Conclusion)', words: ['in conclusion', 'to sum up', 'in a word', 'all in all', 'in short', 'briefly speaking', 'on the whole'] },
    { name: '条件 (Condition)', words: ['provided that', 'as long as', 'on condition that', 'unless', 'if only', 'suppose'] },
    { name: '强调 (Emphasis)', words: ['indeed', 'obviously', 'undoubtedly', 'without doubt', 'truly', 'certainly', 'above all'] },
    { name: '顺序 (Sequence)', words: ['first of all', 'to begin with', 'next', 'then', 'finally', 'eventually', 'meanwhile', 'in the meantime'] }
  ];

  var state = { tab: 'templates', cat: 'all', search: '' };

  function copyTxt(text, btn) {
    var ok = false;
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        if (btn) { btn.textContent = '已复制!'; setTimeout(function () { btn.textContent = '复制全文'; }, 2000); }
      });
      ok = true;
    }
    if (!ok) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        if (btn) { btn.textContent = '已复制!'; setTimeout(function () { btn.textContent = '复制全文'; }, 2000); }
      } catch (e) {}
    }
  }

  function buildTemplatesHTML() {
    var h = '<div style="' + ST.row + '">';
    h += '<button data-action="filter" data-cat="all" style="' + (state.cat === 'all' ? ST.pillOn : ST.pill) + '">全部</button>';
    for (var i = 0; i < CATS.length; i++) {
      h += '<button data-action="filter" data-cat="' + i + '" style="' + (state.cat === '' + i ? ST.pillOn : ST.pill) + '">' + CATS[i].name + '</button>';
    }
    h += '</div>';

    h += '<input type="text" data-action="search" placeholder="搜索模板标题或关键词..." value="' + esc(state.search) + '" style="' + ST.input + '">';

    var q = state.search.toLowerCase();
    var count = 0;
    for (var ci = 0; ci < CATS.length; ci++) {
      if (state.cat !== 'all' && state.cat !== '' + ci) continue;
      for (var ti = 0; ti < CATS[ci].tpl.length; ti++) {
        var tpl = CATS[ci].tpl[ti];
        var searchText = (tpl.title + ' ' + tpl.content + ' ' + tpl.phrases.join(' ')).toLowerCase();
        if (q && searchText.indexOf(q) < 0) continue;
        count++;
        h += '<div style="' + ST.boxHi + '">';
        h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;">';
        h += '<div><span style="' + ST.badge + '">' + CATS[ci].name + '</span>';
        h += '<span style="font-size:17px;font-weight:700;margin-left:8px;color:#2c3e50;">' + esc(tpl.title) + '</span></div>';
        h += '<button data-action="copy" data-ci="' + ci + '" data-ti="' + ti + '" style="' + ST.copyBtn + '">复制全文</button>';
        h += '</div>';

        h += '<div style="margin-top:12px;padding:14px;background:#fff;border-radius:8px;border:1px solid #e8e8e8;font-size:14px;line-height:1.9;white-space:pre-wrap;color:#444;">' + br(tpl.content) + '</div>';

        h += '<div style="margin-top:10px;"><strong style="font-size:13px;color:#2c3e50;">核心句型:</strong> ';
        for (var pi = 0; pi < tpl.phrases.length; pi++) {
          h += '<span style="' + ST.tag + '">' + esc(tpl.phrases[pi]) + '</span>';
        }
        h += '</div>';

        h += '<div style="margin-top:6px;"><strong style="font-size:13px;color:#2c3e50;">过渡词:</strong> ';
        for (var tr = 0; tr < tpl.transitions.length; tr++) {
          h += '<span style="' + ST.tag + '">' + esc(tpl.transitions[tr]) + '</span>';
        }
        h += '</div>';

        h += '</div>';
      }
    }
    if (count === 0) h += '<div style="' + ST.empty + '">未找到匹配的模板</div>';
    return h;
  }

  function buildPatternsHTML() {
    var h = '<div style="' + ST.desc + '">高考英语高分句型库，共 ' + SP.length + ' 个句型。点击可复制完整句型。掌握这些句型可显著提升作文档次。</div>';
    for (var i = 0; i < SP.length; i++) {
      h += '<div style="' + ST.patBox + '">';
      h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;">';
      h += '<div style="flex:1;">';
      h += '<div style="font-size:15px;font-weight:600;color:#2c3e50;margin-bottom:4px;">' + (i + 1) + '. ' + esc(SP[i].p) + '</div>';
      h += '<div style="font-size:13px;color:#27ae60;margin-bottom:4px;">' + esc(SP[i].t) + '</div>';
      h += '<div style="font-size:12px;color:#999;">用途: ' + esc(SP[i].u) + '</div>';
      h += '</div>';
      h += '<button data-action="copy-sp" data-idx="' + i + '" style="' + ST.copyBtn + ';flex-shrink:0;">复制</button>';
      h += '</div>';
      h += '</div>';
    }
    return h;
  }

  function buildTransitionsHTML() {
    var h = '<div style="' + ST.desc + '">过渡词库，按功能分类。合理使用过渡词可使文章逻辑清晰、连贯自然。点击单词可复制。</div>';
    for (var i = 0; i < TW.length; i++) {
      h += '<div style="' + ST.trBox + '">';
      h += '<div style="font-size:15px;font-weight:700;color:#2c3e50;margin-bottom:8px;">' + TW[i].name + '</div>';
      for (var j = 0; j < TW[i].words.length; j++) {
        h += '<span data-action="copy-word" data-word="' + esc(TW[i].words[j]) + '" style="' + ST.trWord + ';cursor:pointer;" title="点击复制">' + esc(TW[i].words[j]) + '</span>';
      }
      h += '</div>';
    }
    return h;
  }

  function buildHTML() {
    var h = '<div style="' + ST.wrap + '">';
    h += '<h2 style="' + ST.h2 + '">英语作文模板</h2>';

    /* tabs */
    h += '<div style="' + ST.row + '">';
    h += '<button data-action="tab" data-tab="templates" style="' + (state.tab === 'templates' ? ST.btnOn : ST.btn) + '">作文模板</button>';
    h += '<button data-action="tab" data-tab="patterns" style="' + (state.tab === 'patterns' ? ST.btnOn : ST.btn) + '">高分句型</button>';
    h += '<button data-action="tab" data-tab="transitions" style="' + (state.tab === 'transitions' ? ST.btnOn : ST.btn) + '">过渡词库</button>';
    h += '</div>';

    if (state.tab === 'templates') h += buildTemplatesHTML();
    else if (state.tab === 'patterns') h += buildPatternsHTML();
    else h += buildTransitionsHTML();

    h += '</div>';
    return h;
  }

  function attach(c) {
    c.onclick = function (e) {
      e = e || window.event;
      var t = e.target || e.srcElement;
      while (t && t !== c) {
        var act = t.getAttribute('data-action');
        if (act) {
          handle(act, t);
          if (e.preventDefault) e.preventDefault();
          return false;
        }
        t = t.parentNode;
      }
    };
    c.oninput = function (e) {
      e = e || window.event;
      var t = e.target || e.srcElement;
      if (t.getAttribute('data-action') === 'search') {
        state.search = t.value;
        c.innerHTML = buildHTML();
        attach(c);
        var inp = c.querySelector('[data-action="search"]');
        if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
      }
    };
  }

  function handle(act, el) {
    if (act === 'tab') {
      state.tab = el.getAttribute('data-tab');
      render();
    } else if (act === 'filter') {
      state.cat = el.getAttribute('data-cat');
      render();
    } else if (act === 'copy') {
      var ci = parseInt(el.getAttribute('data-ci'), 10);
      var ti = parseInt(el.getAttribute('data-ti'), 10);
      copyTxt(CATS[ci].tpl[ti].content, el);
    } else if (act === 'copy-sp') {
      var si = parseInt(el.getAttribute('data-idx'), 10);
      copyTxt(SP[si].p, el);
    } else if (act === 'copy-word') {
      var w = el.getAttribute('data-word');
      copyTxt(w, el);
    }
  }

  function render() {
    var c = document.getElementById('english-composition-templates-app');
    if (!c) return;
    c.innerHTML = buildHTML();
    attach(c);
  }

  return { render: render };
})();

})();

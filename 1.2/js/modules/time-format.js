// time-format.js — 首个 ES Module（v1.9 §3.2-B 渐进模块化的样板）
//
// 约定：js/modules/ 下的新代码一律使用 ES Module 语法（export / import），
// 裸说明符统一走 importmap 前缀：
//     <script type="importmap" src="js/importmap.json"></script>
//     const { formatStamp } = await import('@hspcb/time-format.js');
// 存量 IIFE 脚本继续用 window.* 通信，与本模块互不影响
// （ESM 顶层作用域不污染 window）。
//
// 兼容降级：本站 CSP 为 script-src 'self'（禁内联脚本），故 importmap 只能以
// 外部文件方式引入；不支持外部 importmap 的浏览器会忽略该标签。此类环境请像
// settings-center.js 一样用相对路径动态 import（功能不受影响）。

/**
 * 把 ISO 时间串格式化为「YYYY-MM-DD HH:mm」（本地时区）。
 * 非法/空输入原样返回空串或原串，绝不抛错 —— 调用方常把它直接拼进界面文案。
 * @param {string|Date} iso
 * @returns {string}
 */
export function formatStamp(iso) {
  if (!iso) return '';
  var d = iso instanceof Date ? iso : new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  function p(n) { return (n < 10 ? '0' : '') + n; }
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
    ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

// text.js — 文本/工具纯函数（v1.10 T19，ESM 单一来源）
//
// 这些函数原先内联在 js/common-utils.js（IIFE）。为让新代码可 import，
// 同时不破坏解析期同步调用，采用「IIFE 保留同实现 + 模块加载后覆盖」的过渡策略：
//   · common-utils.js 在文件末尾动态 import 本模块，同名函数以本模块为准；
//   · 不支持 ESM 的旧浏览器 import 失败，继续用 IIFE 内置实现（行为一致）。
// 两份实现由 scripts/test-esm-batch2.mjs 对拍，禁止单方面改动。

export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function genId(prefix) {
  return (prefix || 'id') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
}

export function todayStr() {
  var d = new Date();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}

export function safeJsonParse(raw, fallback) {
  try {
    var v = JSON.parse(raw);
    return v == null ? fallback : v;
  } catch (e) {
    return fallback;
  }
}

export function debounce(fn, delay) {
  var timer = null;
  return function () {
    var ctx = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () { fn.apply(ctx, args); }, delay || 200);
  };
}

export function throttle(fn, interval) {
  var last = 0;
  return function () {
    var now = Date.now();
    if (now - last >= (interval || 200)) {
      last = now;
      fn.apply(this, arguments);
    }
  };
}

export function deepClone(obj) {
  if (obj == null || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
}

export function formatDateCN(date) {
  var d = date instanceof Date ? date : new Date(date);
  return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
}

export function daysBetween(date1, date2) {
  var d1 = date1 instanceof Date ? date1 : new Date(date1);
  var d2 = date2 instanceof Date ? date2 : new Date(date2);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

// ============================================================
// common-utils.js — HSPCB 公共工具函数库
// 统一各模块重复实现的 escapeHtml/genId/todayStr/loadJson/saveJson 等工具函数
// 使用方法: window.CommonUtils.escapeHtml(str) 或解构使用
// ES5 兼容, 零依赖
// ============================================================

window.CommonUtils = (function () {
    'use strict';

    // HTML特殊字符转义（防止XSS）
    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // 生成唯一ID（带可选前缀）
    function genId(prefix) {
        return (prefix || 'id') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    }

    // 获取今日日期字符串 YYYY-MM-DD
    function todayStr() {
        var d = new Date();
        var m = String(d.getMonth() + 1).padStart(2, '0');
        var day = String(d.getDate()).padStart(2, '0');
        return d.getFullYear() + '-' + m + '-' + day;
    }

    // 安全解析JSON字符串
    function safeJsonParse(raw, fallback) {
        try {
            var v = JSON.parse(raw);
            return v == null ? fallback : v;
        } catch (e) {
            return fallback;
        }
    }

    // 安全读取localStorage
    function loadStorage(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            if (!raw) return fallback;
            return JSON.parse(raw);
        } catch (e) {
            console.error('CommonUtils.loadStorage 读取失败:', key, e);
            return fallback;
        }
    }

    // 安全写入localStorage
    function saveStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('CommonUtils.saveStorage 写入失败:', key, e);
            return false;
        }
    }

    // 加载JSON文件（fetch封装）
    function loadJson(url, callback) {
        fetch(url).then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        }).then(function (data) {
            callback(data);
        }).catch(function (err) {
            console.error('CommonUtils.loadJson 加载失败:', url, err);
            callback(null);
        });
    }

    // 防抖函数
    function debounce(fn, delay) {
        var timer = null;
        return function () {
            var ctx = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () { fn.apply(ctx, args); }, delay || 200);
        };
    }

    // 节流函数
    function throttle(fn, interval) {
        var last = 0;
        return function () {
            var now = Date.now();
            if (now - last >= (interval || 200)) {
                last = now;
                fn.apply(this, arguments);
            }
        };
    }

    // 深拷贝（简单版，适用于JSON安全数据）
    function deepClone(obj) {
        if (obj == null || typeof obj !== 'object') return obj;
        return JSON.parse(JSON.stringify(obj));
    }

    // 数组去重
    function unique(arr) {
        var seen = {};
        return arr.filter(function (item) {
            if (seen[item]) return false;
            seen[item] = true;
            return true;
        });
    }

    // 格式化日期为中文
    function formatDateCN(date) {
        var d = date instanceof Date ? date : new Date(date);
        return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
    }

    // 计算天数差
    function daysBetween(date1, date2) {
        var d1 = date1 instanceof Date ? date1 : new Date(date1);
        var d2 = date2 instanceof Date ? date2 : new Date(date2);
        return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
    }

    return {
        escapeHtml: escapeHtml,
        genId: genId,
        todayStr: todayStr,
        safeJsonParse: safeJsonParse,
        loadStorage: loadStorage,
        saveStorage: saveStorage,
        loadJson: loadJson,
        debounce: debounce,
        throttle: throttle,
        deepClone: deepClone,
        unique: unique,
        formatDateCN: formatDateCN,
        daysBetween: daysBetween
    };
})();

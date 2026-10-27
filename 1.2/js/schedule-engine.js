// ============================================================
// schedule-engine.js — 学习作息时间轴引擎（v1.5 / T6）
// 借鉴 Class-Widgets-2 ScheduleServices（EntryType 状态机 / 周规则 / 调休映射）
// 与 ClassIsland LessonsService（仅状态跃迁发事件）的最小纯计算子集。
//
// 数据模型：
// { meta:{name, schemaVersion, startDate?}, days:[{dayOfWeek:1-7, weeks, entries:[{type,start,end,title}]}],
//   overrides:{ "YYYY-MM-DD": {entries:[...]} | {dayOfWeek:1-7} } }
//   weeks: "all" | "odd" | "even" | {cycle:n, week:k} | [周序号数组]（绝对周）
//   entry.type: "study" | "break" | "activity"
// 约束：不支持跨午夜时段（start < end 同日内）。
// 数据来源（settings.schedule.file）：null=停用；"data/...json"=fetch；
// "store:<key>"=HSPCBStore 本地编辑数据。
// 纯计算函数在 _pure 下导出，供 Node 单测直接调用。
// ============================================================
window.HSPCBSchedule = (function () {
    'use strict';

    var data = null;
    var loading = false;
    var lastFile = null;

    /* ---------------- 纯计算 ---------------- */

    function parseHM(s) {
        var m = /^(\d{1,2}):(\d{2})$/.exec(String(s || ''));
        if (!m) return NaN;
        var v = Number(m[1]) * 60 + Number(m[2]);
        return (m[1] > 23 || Number(m[2]) > 59) ? NaN : v;
    }

    function mondayOf(d) {
        var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        var day = x.getDay() === 0 ? 7 : x.getDay();
        x.setDate(x.getDate() - (day - 1));
        return x;
    }

    /** 学期周序号：开学周为第 1 周，开学前为负数 */
    function weekNumber(startDateISO, date) {
        if (!startDateISO) return 1;
        var s = mondayOf(new Date(startDateISO + 'T00:00:00'));
        var w = mondayOf(date);
        return Math.round((w - s) / (7 * 86400000)) + 1;
    }

    function weekRuleMatches(rule, week) {
        if (rule === 'all' || rule == null) return true;
        if (rule === 'odd') return week > 0 && week % 2 === 1;
        if (rule === 'even') return week > 0 && week % 2 === 0;
        if (typeof rule === 'number') return rule === week;
        if (Array.isArray(rule)) return rule.indexOf(week) >= 0;
        if (rule && typeof rule === 'object' && rule.cycle) {
            if (week <= 0) return false;
            var pos = ((week - 1) % rule.cycle) + 1;
            return rule.week ? pos === rule.week : true;
        }
        return false;
    }

    function specificity(weeks) {
        if (weeks === 'all' || weeks == null) return 0;
        if (weeks === 'odd' || weeks === 'even') return 1;
        if (Array.isArray(weeks)) return 3;
        if (weeks && weeks.cycle) return 2;
        return 1;
    }

    /** 多条命中规则按特异性升序应用，同槽位后者覆盖（特异者胜出） */
    function mergeRules(rules) {
        var sorted = rules.slice().sort(function (a, b) { return specificity(a.weeks) - specificity(b.weeks); });
        var byStart = {};
        var order = [];
        sorted.forEach(function (r) {
            (r.entries || []).forEach(function (e) {
                if (byStart[e.start] == null) { order.push(e.start); }
                byStart[e.start] = e;
            });
        });
        return order.map(function (k) { return byStart[k]; });
    }

    function dateKey(d) {
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function buildDayEntries(data, date) {
        var key = dateKey(date);
        var ov = data.overrides && data.overrides[key];
        if (ov) {
            if (Array.isArray(ov.entries)) return { entries: ov.entries.slice(), fromOverride: true };
            if (ov.dayOfWeek) { date = shiftToDate(date, ov.dayOfWeek); }
        }
        var weekday = date.getDay() === 0 ? 7 : date.getDay();
        var week = weekNumber(data.meta && data.meta.startDate, date);
        var hits = (data.days || []).filter(function (r) {
            return r.dayOfWeek === weekday && weekRuleMatches(r.weeks, week);
        });
        return { entries: mergeRules(hits), week: week, weekday: weekday, fromOverride: false };
    }

    function shiftToDate(date, targetWeekday) {
        var cur = date.getDay() === 0 ? 7 : date.getDay();
        var x = new Date(date.getTime());
        x.setDate(x.getDate() + (targetWeekday - cur));
        return x;
    }

    /** 当前状态机：study/break/activity 进行中 → preparation（下节前 N 分钟）→ free */
    function computeStatus(entries, nowMinutes, prepMinutes) {
        var current = null, next = null;
        for (var i = 0; i < entries.length; i++) {
            var s = parseHM(entries[i].start), e = parseHM(entries[i].end);
            if (isNaN(s) || isNaN(e)) continue;
            if (s <= nowMinutes && nowMinutes < e && !current) current = entries[i];
            if (s > nowMinutes && !next) next = entries[i];
        }
        if (current) {
            return { state: current.type, current: current, next: next, remainingMinutes: parseHM(current.end) - nowMinutes };
        }
        prepMinutes = prepMinutes == null ? 10 : prepMinutes;
        if (next && parseHM(next.start) - nowMinutes <= prepMinutes && parseHM(next.start) - nowMinutes > 0) {
            return { state: 'preparation', current: null, next: next, remainingMinutes: parseHM(next.start) - nowMinutes };
        }
        return { state: 'free', current: null, next: next, remainingMinutes: null };
    }

    /** 形状校验：返回 null（合法）或错误信息字符串 */
    function validate(data) {
        if (!data || typeof data !== 'object') return '不是对象';
        if (!data.meta || typeof data.meta.name !== 'string') return 'meta.name 缺失';
        if (!Array.isArray(data.days)) return 'days 必须是数组';
        var TYPES = { study: 1, break: 1, activity: 1 };
        for (var i = 0; i < data.days.length; i++) {
            var r = data.days[i];
            if (!(r.dayOfWeek >= 1 && r.dayOfWeek <= 7)) return 'days[' + i + '].dayOfWeek 越界';
            if (r.weeks != null && !weekRuleMatches(r.weeks, 1) && r.weeks !== 'odd' && r.weeks !== 'even'
                && !(Array.isArray(r.weeks)) && !(r.weeks && r.weeks.cycle)) return 'days[' + i + '].weeks 不合法';
            for (var j = 0; j < (r.entries || []).length; j++) {
                var e = r.entries[j];
                if (!TYPES[e.type]) return 'days[' + i + '] entries[' + j + '].type 不合法';
                var s = parseHM(e.start), en = parseHM(e.end);
                if (isNaN(s) || isNaN(en)) return 'days[' + i + '] entries[' + j + '] 时间格式错误';
                if (s >= en) return 'days[' + i + '] entries[' + j + '] start 必须早于 end';
            }
        }
        if (data.overrides) {
            for (var k in data.overrides) {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) return 'overrides 键必须是 YYYY-MM-DD：' + k;
                var o = data.overrides[k];
                if (!o || (!Array.isArray(o.entries) && !o.dayOfWeek)) return 'overrides[' + k + '] 需含 entries 或 dayOfWeek';
            }
        }
        return null;
    }

    /* ---------------- 数据装载 ---------------- */

    function resolveSource() {
        try {
            if (window.HSPCBProgress && typeof HSPCBProgress.getSettings === 'function') {
                return (HSPCBProgress.getSettings().schedule || {}).file || null;
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    function ensureLoaded(cb) {
        var file = lastFile != null ? lastFile : resolveSource();
        lastFile = file;
        if (!file) { data = null; cb(null); return; }
        if (file.indexOf('store:') === 0) {
            var raw = window.HSPCBStore ? HSPCBStore.get(file.slice(6)) : null;
            var parsed = null;
            try { parsed = raw ? JSON.parse(raw) : null; } catch (e) { parsed = null; }
            data = (parsed && validate(parsed) === null) ? parsed : null;
            cb(data);
            return;
        }
        if (data && data.__file === file) { cb(data); return; }
        if (loading) { setTimeout(function () { ensureLoaded(cb); }, 120); return; }
        if (typeof fetch !== 'function') { cb(null); return; }
        loading = true;
        fetch(file).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
            data = (j && validate(j) === null) ? j : null;
            if (data) data.__file = file;
            if (!data) console.warn('[HSPCBSchedule] 作息数据无效或加载失败:', file);
        }).catch(function () {
            data = null;
            console.warn('[HSPCBSchedule] 作息数据加载失败:', file);
        }).then(function () { loading = false; cb(data); });
    }

    /** 使缓存失效（设置更换数据源后调用） */
    function configure(file) {
        lastFile = file === undefined ? null : file;
        data = null;
        loading = false;
    }

    function getDayEntries(date, cb) {
        ensureLoaded(function (d) {
            if (!d) { cb(null); return; }
            var built = buildDayEntries(d, date || new Date());
            cb(built);
        });
    }

    function getStatus(cb, now) {
        var nowDate = now || new Date();
        ensureLoaded(function (d) {
            if (!d) { cb({ enabled: false, state: 'off' }); return; }
            var built = buildDayEntries(d, nowDate);
            var nowMin = nowDate.getHours() * 60 + nowDate.getMinutes();
            var st = computeStatus(built.entries, nowMin, (HSPCBProgress.getSettings().schedule || {}).prepMinutes);
            st.enabled = true;
            st.week = built.week;
            st.scheduleName = d.meta && d.meta.name;
            cb(st);
        });
    }

    return {
        configure: configure,
        getDayEntries: getDayEntries,
        getStatus: getStatus,
        validate: validate,
        _pure: {
            parseHM: parseHM,
            weekNumber: weekNumber,
            weekRuleMatches: weekRuleMatches,
            mergeRules: mergeRules,
            buildDayEntries: buildDayEntries,
            computeStatus: computeStatus,
            dateKey: dateKey
        }
    };
})();

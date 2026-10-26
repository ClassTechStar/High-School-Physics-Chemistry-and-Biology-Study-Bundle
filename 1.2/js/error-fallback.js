/* 全局错误兜底 · 外置自 index.html head 内联脚本（e）；非 defer 同步加载，须先于其它脚本执行 */
/* ---- 全局错误兜底（必须最先执行）：捕获未处理错误并轻提示，不再静默失败 ---- */
(function () {
    'use strict';
    var shown = {}, lastShow = 0;
    function toast(msg) {
        var now = Date.now();
        if (now - lastShow < 2000) return; // 节流，避免错误风暴刷屏
        lastShow = now;
        try {
            var box = document.getElementById('hspcb-error-toast');
            if (!box) {
                box = document.createElement('div');
                box.id = 'hspcb-error-toast';
                box.setAttribute('role', 'alert');
                box.setAttribute('aria-live', 'assertive');
                box.style.cssText = 'position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:99999;'
                    + 'max-width:86%;padding:10px 16px;border-radius:10px;background:rgba(220,38,38,.94);color:#fff;'
                    + 'font-size:13px;line-height:1.5;box-shadow:0 6px 24px rgba(0,0,0,.35);display:none;';
                (document.body || document.documentElement).appendChild(box);
            }
            box.textContent = msg;
            box.style.display = 'block';
            clearTimeout(box._t);
            box._t = setTimeout(function () { box.style.display = 'none'; }, 6000);
        } catch (e) { /* 兜底自身不能再抛错 */ }
    }
    function short(msg) {
        msg = String(msg == null ? '' : msg);
        return msg.length > 160 ? msg.slice(0, 160) + '…' : msg;
    }
    window.addEventListener('error', function (ev) {
        var key = (ev && (ev.message || '')).slice(0, 80);
        if (key && shown[key]) return; // 同一错误只提示一次
        shown[key] = true;
        console.error('[HSPCB] 脚本错误:', ev && ev.message, ev && ev.filename, 'line', ev && ev.lineno);
        toast('⚠️ 页面脚本出现异常：' + short(ev && ev.message) + '（功能可能受影响，建议刷新页面）');
    });
    window.addEventListener('unhandledrejection', function (ev) {
        console.error('[HSPCB] 未处理的 Promise 拒绝:', ev && ev.reason);
        toast('⚠️ 数据加载出现异常：' + short(ev && ev.reason && ev.reason.message || ev && ev.reason) + '（请检查本地服务器后刷新）');
    });
})();

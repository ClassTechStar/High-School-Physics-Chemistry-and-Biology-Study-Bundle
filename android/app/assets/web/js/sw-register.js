/* ServiceWorker 注册 · 外置自 index.html 内联脚本（e）；defer */
/* 安装只预缓存应用壳；页面空闲且网络允许时通知 SW 后台补齐工具脚本。 */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").then(function (reg) {
        console.log("SW registered:", reg.scope);

        var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn && (conn.saveData || /^(slow-2g|2g|3g)$/.test(String(conn.effectiveType || "")))) return;
        if (typeof navigator.deviceMemory === "number" && navigator.deviceMemory < 2) return;

        function warm() {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ action: "warm" });
            }
        }

        function scheduleWarm() {
            navigator.serviceWorker.ready.then(function () {
                warm();
                // 首次安装时 controller 可能刚就绪，补发一次（SW 侧幂等：已缓存跳过）
                setTimeout(warm, 1000);
            });
        }

        if (typeof requestIdleCallback === "function") requestIdleCallback(scheduleWarm, { timeout: 8000 });
        else setTimeout(scheduleWarm, 5000);
    }).catch(function (e) { console.log("SW failed:", e); });
}

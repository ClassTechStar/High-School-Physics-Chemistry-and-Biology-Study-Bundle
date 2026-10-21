/* ServiceWorker 注册 · 外置自 index.html 内联脚本（T3-4e）；defer */
if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js").then(function(r){console.log("SW registered:",r.scope)}).catch(function(e){console.log("SW failed:",e)});}

// sw.js — HSPCB Service Worker
// 版本: hspcb-v19（发布时必须递增，旧缓存随 CACHE_NAME 变更自动清理）
// 策略: 预缓存核心资源 + 运行时缓存数据文件 + 旧缓存自动清理

var CACHE_NAME = 'hspcb-v19';

// 预缓存的核心资源（HTML/CSS/核心JS）
// icons/ 下 4 个真实图标文件纳入预缓存（PWA 安装与离线启动需要，
// 且 manifest.json 的图标已从 data: URI 改为真实文件）。
// e: index.html 原 6 个内联脚本外置为 js/ 外部脚本（error-fallback /
// theme-bootstrap / csp-delegation / main-inline 为解析期非 defer，
// home-collapse / theme-toggle / sw-register 为 defer），全部纳入预缓存；
// 另补入 v14 遗漏的 js/csp-delegation.js（d 新增的委托中枢）。
// f: index.html 原 2 个内联 <style> 块外置为 css/responsive.css 与
// css/chinese-knowledge.css，纳入预缓存。
// 预缓存分层。安装阶段只缓存「应用壳」（HTML/CSS/核心 JS/图标），
// 其余工具脚本与演示页由页面空闲时 postMessage('warm') 后台补齐；
// 数据文件不预缓存，按 A 方案在首次使用时由运行时缓存接管。
var CORE_ASSETS = [
    'index.html',
    'manifest.json',
    'icons/icon.svg',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-maskable-512.png',
    'css/tokens.css',
    'css/style.css',
    'css/theme-dark.css',
    'css/responsive.css',
    'css/chinese-knowledge.css',
    'js/cssom-style-bridge.js',
    'js/error-fallback.js',
    'js/theme-bootstrap.js',
    'js/common-utils.js',
    'js/progress.js',
    'js/csp-delegation.js',
    'js/tick-bus.js',
    'js/boot-guard.js',
    'js/notification-center.js',
    'js/schedule-engine.js',
    'js/speech-service.js',
    'js/theme-loader.js',
    'js/deep-link.js',
    'js/dashboard-widgets.js',
    'js/settings-center.js',
    'js/automation.js',
    'js/plugin-loader.js',
    'css/platform.css',
    'css/themes/sepia.css',
    'plugins/index.json',
    'plugins/example/hspcb-plugin.json',
    'plugins/example/example.js',
    'js/main-inline.js',
    'js/home-collapse.js',
    'js/theme-toggle.js',
    'js/sw-register.js',
    'js/app.js'
];

// 后台补齐（idle 时由 sw-register.js 发 warm 消息）：工具脚本、演示页与打印样式。
// 不包含 DATA_ASSETS —— 数据按需加载，避免「没打开工具也下载全部题库」。
var DEFERRED_ASSETS = [
    'presentation.html',
    'promo.html',
    'presentation.css',
    'promo.css',
    'css/print-report.css',
    'css/study-plan-print.css',
    'css/knowledge-card-print.css',
    'js/app-chemistry.js',
    'js/app-physics.js',
    'js/app-biology.js',
    'js/app-exam.js',
    'js/enhanced-tools.js',
    'js/content-enhancement.js',
    'js/comprehensive-data.js',
    'js/exam-review-system.js',
    'js/platform-system.js',
    'js/missing-tools-part2.js',
    'js/guangdong-features.js',
    'js/study-enhanced.js',
    'js/visual-enhanced.js',
    'js/auxiliary-tools.js',
    'js/math-tools.js',
    'js/chinese-tools.js',
    'js/error-notebook.js',
    'js/mock-exam.js',
    'js/global-search.js',
    'js/chinese-sentence-correction.js',
    'js/physics-wave-optics.js',
    'js/chemistry-3d-molecules.js',
    'js/biology-cell-division.js',
    'js/study-dashboard.js',
    'js/onboarding.js',
    'js/english-vocabulary.js',
    'js/game-scratchpad.js',
    'js/learning-tools.js',
    'js/open-answer-trainer.js',
    'js/english-tools.js',
    'js/study-tools-v2.js',
    'js/study-tools-enhanced.js',
    'js/interactive-physics-bio.js',
    'js/interactive-chemistry.js',
    'js/content-enhanced-v2.js',
    'js/subject-gap-1.js',
    'js/subject-gap-2.js',
    'js/subject-gap-3.js',
    'js/gamification-system.js',
    'js/data-analysis-enhanced.js',
    'js/content-deep-v3.js',
    'js/utility-tools-v2.js',
    'js/learning-path-recommender.js'
];

// 数据文件（运行时按需缓存）
// situational.json 与 tech-frontiers.json 经全仓核查无任何运行时
// 消费方（对应功能跑的是 js/ 内硬编码数据），已归档至 data/_archive/ 并从本清单移除；
// knowledgePoints-thesaurus.json 已由 learning-path-recommender.js 接线（），保留。
var DATA_ASSETS = [
    'data/exam-bank.json',
    'data/framework-questions.json',
    'data/answer-templates.json',
    'data/cross-subject.json',
    'data/variation-bank.json',
    'data/knowledgePoints-thesaurus.json',
    'data/physics/knowledge.json',
    'data/chemistry/knowledge.json',
    'data/biology/knowledge.json',
    'data/math/knowledge.json',
    'data/chinese/knowledge.json',
    'data/english/knowledge.json',
    'data/schedules/study-example.json'
];

// 安装：预缓存核心资源
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            // 使用 addAll 但容错：单个文件失败不影响整体
            return Promise.all(
                CORE_ASSETS.map(function (url) {
                    return cache.add(url).catch(function (err) {
                        console.warn('SW: 缓存失败 ' + url, err);
                    });
                })
            );
        }).then(function () {
            // 跳过等待，立即激活
            return self.skipWaiting();
        })
    );
});

// 激活：清理旧缓存
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('SW: 清理旧缓存 ' + cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function () {
            // 立即控制所有客户端
            return self.clients.claim();
        })
    );
});

// 请求拦截：导航请求网络优先，静态资源缓存优先
self.addEventListener('fetch', function (event) {
    var request = event.request;

    // 只处理 GET 请求
    if (request.method !== 'GET') return;

    var url = new URL(request.url);

    // 同源请求才处理
    if (url.origin !== self.location.origin) return;

    // 导航请求（HTML页面）：网络优先，确保 index.html 变更立即生效
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).then(function (response) {
                if (response && response.status === 200) {
                    var responseClone = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            }).catch(function () {
                return caches.match(request).then(function (cached) {
                    return cached || caches.match('index.html');
                });
            })
        );
        return;
    }

    // 数据文件 与 CSS：网络优先（保证数据/样式最新），失败回退缓存
    var isDataFile = DATA_ASSETS.some(function (dataUrl) {
        return url.pathname.indexOf(dataUrl) !== -1;
    });

    if (isDataFile || /\.css(\?|$)/.test(url.pathname)) {
        event.respondWith(
            fetch(request).then(function (response) {
                if (response && response.status === 200) {
                    var responseClone = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            }).catch(function () {
                return caches.match(request).then(function (cached) {
                    if (cached) return cached;
                    if (isDataFile) {
                        return new Response('{"error":"离线且无缓存"}', {
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    return new Response('', { status: 504, statusText: 'offline' });
                });
            })
        );
        return;
    }

    // 静态资源：缓存优先，网络回退
    event.respondWith(
        caches.match(request).then(function (cached) {
            if (cached) return cached;
            return fetch(request).then(function (response) {
                if (response && response.status === 200 && response.type === 'basic') {
                    var responseClone = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            });
        })
    );
});

// 后台补齐 DEFERRED_ASSETS。页面 idle 时发 warm 消息触发；
// 分批缓存（每批 6 个）避免一次性打满网络/长任务；已缓存则跳过（幂等）。
function warmDeferred() {
    return caches.open(CACHE_NAME).then(function (cache) {
        var queue = DEFERRED_ASSETS.slice();
        function next() {
            if (!queue.length) return Promise.resolve();
            var batch = queue.splice(0, 6);
            return Promise.all(batch.map(function (url) {
                return cache.match(url).then(function (hit) {
                    if (hit) return null;
                    return cache.add(url).catch(function (err) {
                        console.warn('SW: 后台补齐失败 ' + url, err);
                    });
                });
            })).then(next);
        }
        return next();
    });
}

// 消息监听：支持手动更新 + 后台补齐
self.addEventListener('message', function (event) {
    if (event.data && event.data.action === 'warm') {
        event.waitUntil(warmDeferred());
        return;
    }
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});

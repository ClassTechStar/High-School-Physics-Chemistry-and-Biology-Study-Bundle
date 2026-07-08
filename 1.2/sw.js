// ============================================================
// sw.js — HSPCB Service Worker
// 版本: hspcb-v7
// 策略: 预缓存核心资源 + 运行时缓存数据文件 + 旧缓存自动清理
// ============================================================

var CACHE_NAME = 'hspcb-v7';

// 预缓存的核心资源（HTML/CSS/核心JS）
var CORE_ASSETS = [
    'index.html',
    'presentation.html',
    'promo.html',
    'manifest.json',
    'css/tokens.css',
    'css/style.css',
    'css/presentation.css',
    'css/promo.css',
    'js/common-utils.js',
    'js/app.js',
    'js/app-chemistry.js',
    'js/app-physics.js',
    'js/app-biology.js',
    'js/app-exam.js',
    'js/onboarding.js',
    'js/guangdong-features.js',
    'js/platform-system.js',
    'js/study-dashboard.js',
    'js/visual-enhanced.js',
    'js/enhanced-tools.js',
    'js/missing-tools.js',
    'js/missing-tools-part2.js',
    'js/study-tools-v2.js',
    'js/study-tools-enhanced.js',
    'js/study-enhanced.js',
    'js/auxiliary-tools.js',
    'js/content-enhancement.js',
    'js/learning-tools.js',
    'js/game-scratchpad.js',
    'js/content-enhanced-v2.js',
    'js/interactive-chemistry.js',
    'js/interactive-physics-bio.js',
    'js/open-answer-trainer.js',
    'js/subject-gap-1.js',
    'js/subject-gap-2.js',
    'js/subject-gap-3.js',
    'js/gamification-system.js',
    'js/data-analysis-enhanced.js',
    'js/content-deep-v3.js',
    'js/utility-tools-v2.js',
    'js/learning-path-recommender.js',
    'js/math-tools.js',
    'js/chinese-tools.js',
    'js/chinese-sentence-correction.js',
    'js/english-tools.js',
    'js/english-vocabulary.js',
    'js/physics-wave-optics.js',
    'js/chemistry-3d-molecules.js',
    'js/biology-cell-division.js',
    'js/mock-exam.js',
    'js/exam-review-system.js',
    'js/error-notebook.js',
    'js/global-search.js',
    'js/comprehensive-data.js'
];

// 数据文件（运行时按需缓存）
var DATA_ASSETS = [
    'data/exam-bank.json',
    'data/situational.json',
    'data/framework-questions.json',
    'data/answer-templates.json',
    'data/cross-subject.json',
    'data/tech-frontiers.json',
    'data/physics/knowledge.json',
    'data/chemistry/knowledge.json',
    'data/biology/knowledge.json',
    'data/math/knowledge.json',
    'data/chinese/knowledge.json',
    'data/english/knowledge.json'
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

    // 数据文件：网络优先（保证数据最新），失败回退缓存
    var isDataFile = DATA_ASSETS.some(function (dataUrl) {
        return url.pathname.indexOf(dataUrl) !== -1;
    });

    if (isDataFile) {
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
                    return cached || new Response('{"error":"离线且无缓存"}', {
                        headers: { 'Content-Type': 'application/json' }
                    });
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

// 消息监听：支持手动更新
self.addEventListener('message', function (event) {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});

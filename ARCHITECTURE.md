# 架构说明（ARCHITECTURE）

> 面向维护者：读懂这张图再改代码，能避开本仓 90% 的历史坑。
> 版本基线 v1.9.0。安全相关结论见 [SECURITY.md](SECURITY.md)。

## 1. 定位与技术约束

| 约束 | 取值 | 原因 |
|---|---|---|
| 构建 | **零构建**：源码即产物 | 双击/静态托管即可运行；`npm run build:pages` 只做可选压缩 |
| 运行时 | 原生 HTML/CSS/JS（IIFE） | 兼容老旧教室机房浏览器 |
| CSP | `script-src 'self'; style-src 'self'`（禁内联） | 见 §6，任何改动不得引入内联脚本/样式 |
| 数据 | 全量本地 `localStorage`，零后端 | 隐私卖点；同步靠快照文件 / 用户自备 WebDAV |
| 离线 | Service Worker 预缓存应用壳 + 运行时缓存 | 弱网机房可用 |
| 安卓 | 原生 WebView 壳，`appassets.local` 拦截式资产域 | 免 Gradle 打包，见 `android/` |

## 2. 目录与角色

```
1.2/                      站点根（部署产物）
├── index.html            唯一入口，129 个 section
├── css/                  tokens(令牌) → style(基础) → theme-dark → responsive → 各功能页样式
├── js/                   见 §3 三层加载
│   ├── modules/          ES Module（v1.9 起新代码的默认形态）
│   └── importmap.json    @hspcb/ → ./js/modules/
├── data/                 知识点 + 题库（ODbL，见 data/DATA-LICENSE）
│   └── exam/             index.json 清单 + {subject}.json 六科分文件
├── plugins/              轻插件（清单 + 脚本）
├── fonts/                MiSans 子集 woff2（0.87MB，scripts/build-font.py 生成）
├── update-manifest.json  更新清单（版本/APK 名/发布页）
└── sw.js                 离线缓存（CACHE_NAME 发布期自动生成）
android/                  原生壳（Java，UpdateManager 负责带校验的自动更新）
contrib/                  题库投稿（JSON Schema + 示例）
scripts/                  14 道门禁 + 单测 + 构建/发布工具
e2e/                      Playwright 端到端测试
```

`1.1/` 已移出主仓（§7.1），需要时从 tag `v1.1` 取回。

## 3. 脚本加载三层（改这里最容易翻车）

`index.html` 的脚本严格分三层，**顺序即契约**（顶层 `window.*` 挂载有先后依赖）：

| 层 | 数量 | 位置 | 内容 |
|---|---|---|---|
| 解析期（无 defer） | 4 + 8 | head 4 个；body 中部 8 个 | 样式桥、错误兜底、主题引导、图标；`common-utils`/`progress`/`csp-delegation`/`main-*`/`lazy-loader` |
| `defer` | 20 | body 尾部 | 应用壳：存储、通知、作息、设置、更新、演示、PWA、SW 注册等 |
| 按需加载 | 42 | `js/lazy-loader.js` 的 `LIST` | 各学科/工具脚本，空闲分片或首次点击时按原序注入 |

规则：

1. **新增工具脚本** → 只改两处：`js/lazy-loader.js` 的 `LIST` + `scripts/runtime-defer-check.mjs` 的双清单断言（清单顺序 = 原文档顺序）。
2. **新增应用壳脚本**（导航/存储/全局 UI）→ 放进 `index.html` 的 defer 区，并同步 `sw.js` 的 `CORE_ASSETS`。
3. `lazy-loader.js` 会包裹 `window.navigateToolPage` / `showSection`：点击 `[data-tool]`/`[data-subject]`/`[data-module]`/`[data-back]` 时先保证脚本就绪再重放点击。**不要在 capture 阶段再拦截这些属性**。
4. 加载器降级策略：单个脚本 404/超时只告警；加载器自身异常时 `ensureAll` 立即 resolve —— 最坏是「点击后功能不可用」，不是整页卡死。

## 4. 全局命名空间（IIFE 之间唯一的通信面）

| 命名空间 | 文件 | 职责 / 关键 API |
|---|---|---|
| `HSPCBStore` | progress.js | 存储抽象：`setBackend/useDefaultBackend/listKeys/dump/restore` |
| `HSPCBProgress` | progress.js | 学习进度、错误记录、快照（`restoreSnapshot`） |
| `HSPCBDatasync` | data-sync.js | 快照打包/导入导出/WebDAV（`buildBundle/applyBundle/webdavPut/webdavGet`） |
| `HSPCBSchedule` | schedule-engine.js | 作息时段、单双周、假期覆写 |
| `HSPCBSpacedRepetition` | spaced-repetition.js | SM-2：`initCard/schedule/isDue/dueLabel` |
| `HSPCBUpdate` | update-check.js | 更新链：GitHub → raw → jsDelivr（Gitee 默认关闭）、SHA-256 透传 |
| `HSPCBNotify` | notification-center.js | 应用内通知 |
| `HSPCBSettingsUI` | settings-center.js | 设置中心（含数据同步卡） |
| `HSPCBEV` | csp-delegation.js | 事件委托中枢（`data-call`/`data-hook`） |
| `HSPCBStyles` | cssom-style-bridge.js | `data-style` → CSSOM 写入（绕开 style-src） |
| `HSPCBIcon` | ui-icons.js | SVG 图标：`svg(name)` / `hydrate()` |
| `HSPCBLazy` | lazy-loader.js | 按需加载：`ensureAll/allDone/loadedCount` |
| `HSPCBMain` | main-init.js | 启动编排、section 注册表 |
| `HSPCBBus` / `HSPCBTick` | common-utils.js / tick-bus.js | 事件总线 / 秒级心跳 |
| `HSPCBPlugin(s)` | plugin-loader.js | 插件加载与 API |
| `HSPCBDemo` | demo-mode.js | `?demo=1` 演示数据注入（注入后去掉 URL 参数） |

新代码优先用 ES Module（§8）；确实需要全局时，命名一律 `HSPCB` 前缀，否则 `check:collisions` 会红。

## 5. 数据层

- **题库分科懒加载**（`app-exam.js`）：`ensureIndex()` → `ensureSubject(s)` → `ensureLoaded()`；`_hasAllQuestions()` 供演示/统计判定。题量变化必须同步该科 `total` 与 `index.json` 的 `meta.totalQuestions`（`check:data` 门禁）。
- **存储**：所有学习数据走 `HSPCBStore`（默认 localStorage 后端），不要直接 `localStorage.setItem`（历史例外在 `check-lint` 登记白名单）。
- **快照**：bundle 结构 `{app:'hspcb-datasync',version:1,exportedAt,store}`；`applyBundle` 支持 `merge` / `replace`。
- **投稿**：`contrib/submissions/*.json` 经 `check:contrib` 校验后由 `scripts/merge-contrib.mjs` 合入，投稿移入 `contrib/merged/`。

## 6. 事件与样式契约（CSP 决定）

- **事件**：HTML/模板里禁止 `onclick=`。静态节点用 `data-call="fnName"`（委托中枢）或 `data-action`；模块内用 `addEventListener`。
- **样式**：HTML 里禁止 `style="..."`；模板用 `data-style="..."`，由 `cssom-style-bridge.js` 在插入后写入 CSSOM（style-src 不管辖 CSSOM）。`cssom-style-bridge.js` 必须最先加载。
- **样式文件**：颜色/间距一律用 `tokens.css` 令牌；暗色覆盖写进 `theme-dark.css`，不许在业务 CSS 里加 `!important` 硬顶。

## 7. 构建与发布

- `npm run build:pages`：esbuild 压缩到 `dist-pages/`（JS/CSS 各 −30% 左右），并用 `CORE_ASSETS` 内容哈希生成 `CACHE_NAME = hspcb-<12hex>`（发布期版本自动递增）。
- APK：`.github/workflows/apk-release.yml` 构建 → `sha256sum *.apk > checksums.sha256` → 同时上传 APK 与校验清单。
- 发布脚本：`scripts/publish-release.py publish --tag ... --apk ...`（create → upload → 上传 checksums）。

## 8. ES Module 渐进迁移（v1.9 §3.2-B）

- **新代码默认 ESM**：放 `1.2/js/modules/`，用 `export`；引用其他模块用相对路径或 `@hspcb/` 前缀。
- **importmap 以外部文件引入**：`<script type="importmap" src="js/importmap.json">`。原因是 CSP `script-src 'self'` 会拦内联 importmap；外部 importmap 在 Chrome 128+ 生效，旧浏览器忽略它。
- **因此新模块自身不得依赖裸说明符**：不支持外部 importmap 的环境里，`@hspcb/` 解析会失败；调用方一律用相对路径动态 `import()`（参考 `js/settings-center.js` 对 `modules/time-format.js` 的用法），失败时回退旧逻辑。
- **旧 IIFE 维持现状**：ESM 顶层作用域不污染 `window`，与 IIFE 双向无干扰。`check:collisions` 继续只扫存量 IIFE。
- 单测：`scripts/test-esm-module.mjs`（Node `type: module` 直接导入）。

## 9. 门禁与测试地图

| 命令 | 覆盖 |
|---|---|
| `check:version` | 版本号五处一致（package/manifest/update-manifest/index.html/安卓） |
| `check:data` | 题库结构、题量、答案域 |
| `check:collisions` | 全局声明碰撞 |
| `check:theme` / `check:md3` | 令牌一致性 / MD3 迁移页 |
| `check:csp` | 内联事件/脚本/样式清零 |
| `check:schedule` / `check:content` / `check:lint` | 作息数据 / 内容完整性 / 编码约定 |
| `check:anchors` | 页面锚点与 manifest 消费方 |
| `check:update-security` | 更新链 17 项断言（校验、常量时间、Gitee 默认关闭等） |
| `check:contrib` | 投稿 Schema + 去重 |
| `check:runtime` | 浏览器语义复现脚本执行顺序（117 项） |
| `check:asset-sync` | 安卓资产与站点一致 |
| `test` | 9 组单测（进度/跨科/作息/SM-2/更新链/导入事务/数据同步/配平器/ESM） |
| `test:smoke` | 假 DOM 冒烟 |
| `test:e2e` | Playwright 17 用例 / 102+ 断言（六科判分、错题本、搜索、键盘、模考计时） |

门禁自举：`verify-gate-tamper.mjs` 会故意注入缺陷，证明门禁真的会红。

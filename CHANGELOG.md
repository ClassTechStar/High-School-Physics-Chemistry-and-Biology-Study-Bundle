# 更新日志

## Unreleased

### 安全（CSP 收紧 T12，DEV-PLAN T3-4）
- **A 类清零**（T3-4c）：`index.html` 静态内联事件属性（`onclick="toggleTheme()"` / `onkeyup="chineseSearch()"`）改为 `data-action` 委托，标签上不再有任何 `on*` 属性；`window.toggleTheme` 保留导出。
- **C 类清零**（T3-4d）：`js/*.js` 371 处 + `index.html` 内联脚本内 25 处 JS 生成的内联事件属性全部改为 `data-call` / `data-hook` 声明式委托，新增委托中枢 `1.2/js/csp-delegation.js`（参数编码集 `@el`/`@ev`/`@val`/`@s:`/`@n:` 等）。
- **B 类清零**（T3-4e）：6 个内联 `<script>` 块（2512 行）全部外置为外部脚本——`js/error-fallback.js` / `js/theme-bootstrap.js`（head，非 defer）/ `js/main-inline.js`（body 原位，非 defer，2290 行主逻辑）/ `js/home-collapse.js` / `js/theme-toggle.js` / `js/sw-register.js`（defer，置于 `app.js` 之前），内容字节级保真，执行序经 `check:runtime` 复验与外置前一致。
- **meta CSP 收紧**：`script-src` 移除 `'unsafe-inline'`（现为 `'self'`）；`style-src` 的 `'unsafe-inline'` 保留（D 类内联样式未清，另行排期）。
- **门禁加严**：`check:csp`（`scripts/check-csp-inline.mjs`）由 3 条断言增至 7 条（A1/A2/A3/B1/B2/C1/C2），A/B/C 三类任一残留或 `script-src` 回退 `unsafe-inline` 即失败；7 项注入熔断自检全部按预期触发。
- **外置暴露并修复的存量缺陷**：`runtime-defer-check` T2-4 正则把 `typeof window.loadModuleContent === 'function'` 误判为赋值（`(?!=)` 修复）；其第 2 节静态检查面扩展至全部解析期脚本；`smoke-app` 三条接线断言改为「html 引用外链 + 外链含符号」双重断言；`sw.js` 补入遗漏的 `csp-delegation.js` 与 6 个新外置文件，CACHE_NAME `hspcb-v14` → `hspcb-v15`（53 个引用 js 全部预缓存）；`theme-bootstrap.js` / `theme-toggle.js` 的裸 `localStorage`（v1.3 T4 既有白名单例外）登记进 lint 基线。
- **顺带修复透镜计算器两个存量缺陷**（ERRATA P0-20）：5 个三元字符串缺 opening quote，浏览器模拟实证该按钮自上线起编译失败、从未可用；`m=v/u` 缺负号，实像/虚像场景正倒立输出与页面自有参考文本相反。
- `npm run verify` 九阶段全绿（data PASS / collisions OK / theme 6 / csp 7/7 / lint 9+2 基线 / content 13+6 基线 / runtime 121 / test 39+14 / smoke 46）。

## v1.3 (2026-09-30)

工程化与体验优化版本。全部改动基于 [docs/OPTIMIZATION-TASKLIST.md](docs/OPTIMIZATION-TASKLIST.md) 的深度优化任务清单（T1–T14）。

### 性能
- **T2**：45 个模块脚本 `defer` 加载（common-utils/progress 保持同步）；1.4MB 题库首屏不再拉取，改为浏览器空闲预热 + 进入题库模块按需加载；learning-path 复用已加载题库，避免二次 fetch；mock-exam 修复 `window.examBank` 从未挂载的问题（此前永远只使用内置 20 题）。
- **T6**：theme-dark.css 高频硬编码色值收敛为 `--dm-*` 令牌引用（39 处，外观零变化）。
- **T10**：SW 版本注释同步（v7→v13），CACHE_NAME 递增至 `hspcb-v13`。

### 健壮性
- **T3**：head 内联错误兜底（`window error` / `unhandledrejection` 捕获 + 节流 toast）；app-exam 渲染路径统一 `escapeHtml`；`subjectStats` 补齐六科。
- **修复 3 个 v1.2 静默失效 bug**（由新错误兜底首次暴露）：
  1. `missing-tools.js` 与 `app-chemistry.js` 三处顶层 `const` 重名（chemistrySafetySystem / electrochemistryViewer / organicConverter），导致 missing-tools.js 整文件解析失败、自 v1.2 从未执行——重命名为 `chemistrySafetyQuiz` / `electrochemistryViewerLite` / `organicConverterLite` 并暴露到 window；
  2. `showSection` / `setActiveNav` 困于 IIFE，3 个首页快捷按钮 onclick 必抛 ReferenceError——已暴露到 window；
  3. 新增 `scripts/check-global-collisions.mjs` 扫描同类问题并纳入 `npm run verify`。
- **T1**：70 道无选项的英语听力/阅读/完形题补齐 options（此前点击作答直接 TypeError）。
- **T4**：新增 `HSPCBStore` 门面（`hspcb.st.*` 命名空间、旧 key 透明搬迁、统一 try/catch）；27 个模块的 `localStorage` 调用全部收敛（主题引导/主题应用/数据导出枚举按白名单保留原生读写）。

### 题库与数据
- **T5**：exam-bank schema v2——各科 `exams` 字段更名为 `questions`，全部消费方同步并保留旧字段兼容读取。
- **T8**：选择题答案分布由 A502/B434/C285/D249 均衡至 **368/368/366/368**（200 道题在安全规则下整体互换选项位置，正确性不变）。
- **T13（部分）**：真题练习系统修复为六科全部可见可选（此前数学/语文/英语的题不进列表、筛选器缺失三科选项）；年份筛选扩展至 2018–2026。

### 安全与可访问性
- **T12**：CSP meta（`object-src 'none'`、`base-uri 'self'`、`form-action 'self'` 等；因大量 innerHTML 生成的内联事件处理器暂保留 `unsafe-inline`，后续结合事件委托逐步收紧）+ `referrer` 策略。
- **T7**：导航/目录 landmark `aria-label`，主题切换按钮静态 `aria-label`/`aria-pressed`。

### 工程化
- **T14**：GitHub Actions `verify` 工作流（push/PR 自动跑数据质检 + 声明碰撞扫描 + 单测 + 冒烟）。
- **T9**：删除死文件 `1.2/check-syntax.js`（硬编码仓库外路径）与 `1.2/expand-exam-bank-unified.py`（2 字节空文件）；修正 `handler-integrity.mjs` 误报（补扫内联脚本、更新 critical 清单）。
- **T11（审计结论）**：47 个 JS 文件全部被 index.html 引用（无死文件），冗余为同族多版本并行；实际合并需要逐模块回归，列为后续迭代项。

### 已知遗留（后续版本）
- T11 同族模块合并与按需拆包（需逐模块回归测试）。
- T13 数学/语文题量扩充（200 → 约 340，需内容贡献）。
- CSP 收紧（需先把 innerHTML 生成的内联 onclick 改为事件委托）。
- 新增题请遵循 schema v2 与「无内部备注」规则，`npm run verify` 全绿后提交。

## v1.2 (2026-09-12)

- 六科全覆盖 + PWA + 游戏化学习平台（新增数语英三科 / 3D 分子 / 互动模拟 / 全局搜索 / 学习路径 / 暗色模式 / 扩展题库）。
- Phase A 稳定化：语法错误修复、首页卡片嵌套修复、165 个重复题 id 去重、`progress.js` 统一进度存储（v1 迁移）、validate-data / smoke / progress 三套门禁、统一暗色主题。
- 内容补全：256 条短解析扩写、312 条占位解析清零。

## v1.1

- 物化生三科初版（只读归档于 `1.1/`）。

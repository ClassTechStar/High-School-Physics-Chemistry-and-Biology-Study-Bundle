# 更新日志

## 未发布

### 数据（P1-6 数据层去重）
- **题库二轮内容去重**：1301 → **1198**（本轮归档 103 条，累计 520/1718 = 30.3%）。`exam-bank.json` 1,090,210 → 1,000,678 B（gzip 256,399 → 234,210 B）；归档写入 `1.2/data/_archive/duplicates-2026-10-25.json`（含补删的 `chemistry_2021_103` 与 2026-10-25 前一轮 102 条）。
- **内容去重门禁**：`validate-data.mjs` 新增「题干 + 选项集合 + 正确选项内容」指纹（选项按内容排序，识别仅选项顺序不同的副本；无选项英语填空题排除），命中即失败。当前内容重复 0；重复题反向注入按预期熔断。
- **分科答案均衡**：去重后物理 D 占比 34.8% 触发 C3 红线，按 T1-3 流程重跑 `balance-answers.mjs`（7 题换位，内容守恒、解析字母同步），六科最大字母占比回到 25.0%–31.5%。
- **文案计数同步**：README / `index.html` / `promo.html` / `presentation.html` 的 1301 → 1198；README 答案分布更新为 A236 / B224 / C225 / D265（950 道四选项单选题）。
- 新增 [P1-6 数据层去重量化 + 懒加载评估](P1-6-DATA-DEDUP-AND-LAZY-LOADING-AUDIT.md)：剩余重复 0；首访 54 脚本 / 3.47 MiB JS、约 1.29 MB 数据请求、SW 预缓存 5.68 MiB（141 次请求 / 9.12 MB）；建议先做隐藏容器数据按需 + 题库预热分级，JS 逐模块懒加载暂缓。

## v1.4 (2026-10-25)

「开前门」版本：分发可访问、安全边界闭环、工程债务继续清偿。

### 分发（P0）
- **GitHub Pages 上线**：`.github/workflows/pages.yml` 在 push 到 `main` 时自动把 `1.2/` 目录发布为静态站点（`actions/upload-pages-artifact` + `deploy-pages`），纯静态仓库无构建步骤；README 顶部加入在线使用入口。
- **仓库清污**：`.uploads/`（372 KB）与 `.trae-html-share-packages/`（5.6 MB）移出工作区并写入 `.gitignore`（连同 `*.zip`），阻断后续误提交；README 指向已删除 `docs/` 的悬空引用同步清理。

### 安全（P0/P2）
- **备份导入 schema 校验**：进度导入不再直接信任外部 JSON，按白名单重建对象（键名/类型/长度逐项校验），非法字段丢弃而非合并；配套 12 项单测覆盖原型污染、超长字段、类型错位等用例。
- **SECURITY.md**：新增漏洞报告渠道与响应预期。
- **CSP 闭环**（见下）：`script-src` 与 `style-src` 双双收紧为 `'self'`。

### 安全（CSP 收紧 T12，DEV-PLAN T3-4）
- **A 类清零**（T3-4c）：`index.html` 静态内联事件属性（`onclick="toggleTheme()"` / `onkeyup="chineseSearch()"`）改为 `data-action` 委托，标签上不再有任何 `on*` 属性；`window.toggleTheme` 保留导出。
- **C 类清零**（T3-4d）：`js/*.js` 371 处 + `index.html` 内联脚本内 25 处 JS 生成的内联事件属性全部改为 `data-call` / `data-hook` 声明式委托，新增委托中枢 `1.2/js/csp-delegation.js`（参数编码集 `@el`/`@ev`/`@val`/`@s:`/`@n:` 等）。
- **B 类清零**（T3-4e）：6 个内联 `<script>` 块（2512 行）全部外置为外部脚本——`js/error-fallback.js` / `js/theme-bootstrap.js`（head，非 defer）/ `js/main-inline.js`（body 原位，非 defer，2290 行主逻辑）/ `js/home-collapse.js` / `js/theme-toggle.js` / `js/sw-register.js`（defer，置于 `app.js` 之前），内容字节级保真，执行序经 `check:runtime` 复验与外置前一致。
- **meta CSP 收紧**：`script-src` 移除 `'unsafe-inline'`（现为 `'self'`）；`style-src` 的 `'unsafe-inline'` 已于 D3 完成后一并移除（见下条）。
- **D3 模板内联样式清零 + `style-src` 去 `unsafe-inline`**：js/ 侧 **3620 处**模板 `style` 属性改写为 `data-style`，由新增 `js/cssom-style-bridge.js`（MutationObserver 监听新增节点后 `el.style.setProperty` 写入）落地；`theme-dark.css` 第 6 节 **344 条** `[style*="..."]` 覆盖选择器同步改写为 `[data-style*="..."]`（data-* 保留模板原文、不参与 CSSOM 序列化归一，暗色匹配语义不变）。**弹窗样式外置**（D4）：分析报告 / 复习计划表 / 知识点卡片打印三个 `window.open` 文档的内联 `<style>` 抽为 `css/print-report.css`、`css/study-plan-print.css`、`css/knowledge-card-print.css`，加载指示器 `@keyframes ll-spin` 迁入 `css/style.css`。门禁 9 → 12 条断言（新增 B3 `style-src` 无 `unsafe-inline` / D3 模板 `style` 属性 = 0 / D4 模板内联 `<style>` = 0），反向注入验证按预期熔断。**`computed-style` 回归 18/18 组合零差异在 `style-src 'self'` 下取得。**
  > 一并否决的方案：`style="..." → data-st="st-<hash>"` + 生成 `[data-st][data-st]` 属性选择器规则。因内联样式击败一切非 `!important` 选择器，(0,2,0) 的属性选择器无法等价复现优先级，实测光态每科 186 处、暗态每科 338 处回归（共 4716 处），已回滚。
- **D 类静态侧清零**（T3-4f）：2 个 `<style>` 块外置为 `css/responsive.css`（1159 B）与 `css/chinese-knowledge.css`（8894 B，逐字节保真，层叠地位不变）；37 处静态 `style` 属性类化——工具徽标 ×16 → `.tool-tag.math/.chinese/.english`、区块间距 ×11 → `.tools-section.mt-16/20/24`、知识面板 ×4 → `.knowledge-panel--math/--english`、tab-pane ×6 → `.tab-pane/.is-hidden`，令牌补入 `tokens.css`；`theme-dark.css` 原「属性内容匹配」型暗色专则（`[style*="..."]` + `!important`）随 style 属性移除而静默失效，已按类选择器重建 7 条对等规则（不加 `!important`，靠特异性 (0,2,0)/(0,3,0) 胜出，补丁层 `!important` 158 → 21）。**computed-style 回归 harness**（Edge headless，9 学科 × light/dark = 18 组合逐元素逐属性比对）验证外观零变化。
- **style-src 口径精确化**（T3-4f）：`style-src 'unsafe-inline'` 只管辖产生 `style="..."` 属性字符串的三种来源（静态属性 / `<style>` 块 / JS 字符串模板）；`el.style.prop=` / `el.style.cssText=` 属 CSSOM 写入，**不受管辖**。据此纠正旧口径把 3624（模板属性，受管辖）+ 328（CSSOM，不受管辖）= 3952 混计为「JS 样式写入」的错误；`ctx.fillStyle`/`ctx.strokeStyle` 等 Canvas API 亦不算样式写入（曾致 3929 之误）。实测 **js/ 侧模板 style 属性 3624 处 / 42 文件 = 20 动态（`${}` 插值）+ 3604 静态**，为 D3 立项的准确基数。
- **门禁加严**：`check:csp`（`scripts/check-csp-inline.mjs`）由 3 条断言增至 7 条（A1/A2/A3/B1/B2/C1/C2），A/B/C 三类任一残留或 `script-src` 回退 `unsafe-inline` 即失败；7 项注入熔断自检全部按预期触发。
- **门禁再加严**（T3-4f）：`check:csp` 7 → 9 条断言（新增 D1 `<style>` 块 = 0 / D2 静态 `style` 属性 = 0），D 类计数拆分为受管辖/不受管辖两项；9 项注入熔断自检（含 D1/D2 临时注入）全部按预期失败后复原（备份还原，SHA-256 字节一致）。
- **修复 CSS 注释 `*/` 陷阱导致的规则静默丢失**（T3-4f）：`css/style.css` 注释中 `--tag-*/--panel-*` 的 `*/` 提前闭合注释，后续文字连同 `.tools-section.mt-16` 规则被吞成非法选择器遭解析器整体丢弃（CSSOM 584 条中 mt-16 缺失而 mt-20/24 均在），该类化区块实算值一度偏离 16px；改为 `--tag-* 与 --panel-*` 后恢复。
- **外置暴露并修复的存量缺陷**：`runtime-defer-check` T2-4 正则把 `typeof window.loadModuleContent === 'function'` 误判为赋值（`(?!=)` 修复）；其第 2 节静态检查面扩展至全部解析期脚本；`smoke-app` 三条接线断言改为「html 引用外链 + 外链含符号」双重断言；`sw.js` 补入遗漏的 `csp-delegation.js` 与 6 个新外置文件，CACHE_NAME `hspcb-v14` → `hspcb-v15`（53 个引用 js 全部预缓存）；`theme-bootstrap.js` / `theme-toggle.js` 的裸 `localStorage`（v1.3 T4 既有白名单例外）登记进 lint 基线。
- **顺带修复透镜计算器两个存量缺陷**（ERRATA P0-20）：5 个三元字符串缺 opening quote，浏览器模拟实证该按钮自上线起编译失败、从未可用；`m=v/u` 缺负号，实像/虚像场景正倒立输出与页面自有参考文本相反。
- `npm run verify` 九阶段全绿（data PASS / collisions OK / theme 6（T2 补丁层 `!important` 158 → 21、T3 承重墙 99 完整）/ **csp 12/12** / lint 9+1 基线 / content 13+6 基线 / runtime 121 / **test 49+14** / smoke 46）；computed-style 回归 18/18 组合零差异（`style-src 'self'` 下）。
- `sw.js` CACHE_NAME `hspcb-v16` → `hspcb-v17`，`cssom-style-bridge.js` 与 3 个弹窗样式表纳入预缓存。

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

# 深度优化任务清单（v1.2 后续迭代）

> 生成日期：2026-09-30 · 基线：main @ 816bf4c · 活跃目录：`1.2/`（1.1 只读归档）
> 门禁快照：`check:data` PASS（1 warning）· `test` 12/12 · `test:smoke` 43/43 · `static-bug-scan` 0 err / 0 warn

---

## 一、现状基线（已完成，作为后续工作的起点）

| 里程碑 | 内容 | 状态 |
| --- | --- | --- |
| v1.2 主体 | 六科全覆盖 + PWA + 游戏化，合并 main（4700049） | ✅ 完成 |
| Phase A 稳定化（2b7786e） | enhanced-tools 语法错误、首页卡片嵌套、165 个重复题 id、`progress.js` 统一进度存储（v1→v2 迁移）、validate-data / smoke / progress 三套门禁、暗色主题统一（theme-dark.css + data-theme）、SW v10 清单修正 | ✅ 完成 |
| 内容补全（3bf9802 / 816bf4c） | 256 条短解析扩写为【考点/题干/概念/判断/结论】结构；312 条「答案应选」占位解析清零；analysis 最短 20 字 | ✅ 完成 |
| 数据基线 | 1718 题（物 344 / 化 341 / 生 413 / 数 200 / 语 200 / 英 220），id 全唯一，内部备注 0，SW 清单 70 资源 0 缺失 | ✅ 达标 |

**结论**：稳定性与内容合格线已达标，下一阶段的重点从「修复致命缺陷」转向「性能、健壮性、质量债收敛」。

---

## 二、任务清单

优先级定义：**P0** = 影响功能正确性/核心体验，建议立即做；**P1** = 明确质量债，1–2 个迭代内做；**P2** = 增强与长期治理。

### P0-1 · T1 修复 70 道无选项的字母答案题 【未开始】

- **目标**：听力（20）/ 阅读理解（30）/ 完形填空（20）共 70 题 `answer` 为字母但**没有 `options` 字段**，在交互界面无法作答。补齐 options，或将这类题型改为「原文 + 按小题分组」的渲染。
- **现状**：题目存在且 id/解析正常，仅 options 缺失；validate-data 目前不检查该组合。
- **待完成**：① 写脚本按题组批量补 options（同组共享原文/选项）；② `validate-data.mjs` 新增规则「answer 为字母则 options 必须存在且 answer 在其范围内」；③ smoke 增加抽样作断言。
- **验收**：`check:data` PASS 且无该类告警；页面可正常作答英语听力/阅读/完形题。
- **依赖**：无（可立即开始）。建议先做校验规则，让问题可见，再批量修数据。
- **风险**：中。70 题补选项工作量集中在英语科，脚本批量 + 人工抽查原文对应关系，防止选项与原文错位。

### P0-2 · T3 全局错误兜底 + 渲染转义统一 【未开始】

- **目标**：全仓库 **0 处** `window.onerror` / `unhandledrejection`，任一模块抛错即静默失败；467 处 `innerHTML`，`escapeHtml` 仅 6 个文件实现、app.js / app-exam.js 等 5 个主 app 文件 **0 次调用**（如 `app-exam.js:471` 题干裸拼）。
- **待完成**：① `common-utils.js` 增加统一 `escapeHtml` 并在主渲染路径接入；② `app.js` 最早处注册全局 error / unhandledrejection 钩子，至少 console + 面板提示（不影响零依赖原则，可做一个轻量 toast）。
- **验收**：任一模块初始化抛错时用户可见提示且不阻断其他模块；题干含 `<` `>` 时正确显示。
- **依赖**：无。**建议第一个动手**——改动小、为后续所有任务提供安全网。
- **风险**：低。转义接入需逐渲染点核对，防止把合法 HTML（如 `<sub>` 类格式）转义掉。

### P0-3 · T2 首屏加载优化：47 个同步 script 【未开始】

- **目标**：`index.html` 47 个外部 `<script>` **全部同步加载**（0 defer/async，已核实），约 3.4MB JS 阻塞首屏；另 `DOMContentLoaded` 时 `app-exam.js:684` 立即 fetch 1.4MB exam-bank.json。
- **待完成**：① 第一步：全部 script 加 `defer`（保持执行顺序，改动最小）；② 第二步：题库 fetch 惰性化（首次进入题库/考试模块再拉取，或至少 `requestIdleCallback` 预取）；③ 长期：按模块 dynamic import 拆包。
- **验收**：Lighthouse 首屏阻塞时间显著下降；smoke 43 项仍全过。
- **依赖**：依赖模块初始化时序梳理——12 个文件 15 处 `DOMContentLoaded` 注册、IIFE 顺序依赖脚本加载顺序。**先做 T3 的错误兜底，回归时有可见信号。**
- **风险**：高（若直接拆包）/ 低（仅加 defer）。建议分两步走，defer 先行验证。

### P1-4 · T4 localStorage 双轨收敛 【未开始】

- **目标**：`progress.js`（`hspcb.v2.*`）之外仍有 **28 个文件**直接写裸 `localStorage`；其中 7 个 key 完全无前缀（`wrongPhotosynthesis`、`mockExamHistory`、`genetics_score` 等，见 app-biology.js:1661、mock-exam.js:776、enhanced-tools.js:642-668 等），index.html 内联脚本另有 3 个（`hspcb_theme` / `hspcb_dark_mode` / `hspcb_tool_collapse`）。
- **现状**：`progress.js` 已有 v1→v2 迁移、导出/导入机制，可复用。
- **待完成**：① progress.js 扩展 namespace 化 API（`Progress.get/set(ns,key)`）；② 按「无前缀 key 优先」顺序迁移 28 个文件；③ validate-data 增加静态规则：js/ 中出现裸 `localStorage.` 即告警（白名单 progress.js）。
- **依赖**：无硬依赖；与 T2 同批做可减少文件重复打开。
- **风险**：中。迁移不当会丢用户学习记录——必须保留旧 key 读取兼容（复用现有迁移机制），并加单测。

### P1-5 · T5 exam-bank schema v2：`exams` → `questions` 【未开始，半天级】

- **目标**：消除唯一 warning——`exams` 字段实际存放题目列表。校验器已双兼容，改名后同步改校验器与消费方（app-exam.js 等）。
- **依赖**：建议在 T1 之前做（T1 修数据时直接落在 v2 schema 上，避免二次全量改写）。
- **风险**：低。需 grep 全部 `exams` 消费点（含 scripts/*.mjs、sw.js 无关）。

### P1-6 · T6 暗色主题令牌化 【未开始，长期】

- **目标**：README 称「tokens.css 驱动主题」，但 `theme-dark.css`（40KB）实际是 461 个硬编码 hex 的补丁层，仅 55 处 `var(--)`，且显式覆写 tokens 的文本/学科色。目标：把高频 hex 收敛为 `--dm-*` 语义令牌引用 tokens 体系。
- **依赖**：独立；建议在 T2/T4 稳定后做。
- **风险**：中高。回归面大（六科页面 × 明暗两态），必须配合视觉走查（可渲染各模块截图逐页核对）。

### P1-7 · T7 可访问性基线 【未开始】

- **目标**：全文 aria 仅 3 处、0 alt、0 role；语言与 viewport 已达标。补齐：导航 landmark（nav/main/aside）、按钮语义、主题切换钮 aria-label、对比度抽查。
- **依赖**：与 T6 同批（都要动结构/样式）。风险：低。

### P1-8 · T8 选择题答案分布均衡化 【未开始，低收益可延后】

- **目标**：答案分布 A 504 / B 435 / C 285 / D 249（A+B 占 64%），学生可利用「猜 C/D」策略。改答案需同时重排选项，工作量大、收益中等。
- **依赖**：应在 T1（补 options）与 T5（schema v2）之后做，避免三次触碰同一批题目。风险：中（改动即引入错题风险，需校验器覆盖）。

### P1-9 · T9 工具脚本治理 【未开始，半天级】

- **目标**：① `1.2/check-syntax.js:2` 硬编码仓库外路径（`C:/Users/18948/Documents/high-school-science-kit/`）必失效——删除或改为相对路径；② `1.2/expand-exam-bank-unified.py` 实际只有 2 字节（空文件），README 仍在引用——删除死文件并更新 README；③ `scripts/handler-integrity.mjs` 存在误报（`toggleTheme` 在 index.html:4322 有定义仍报 MISSING）——补扫 index.html 内联脚本。
- **依赖**：无。风险：低。

### P1-10 · T14 CI 门禁 【未开始】

- **目标**：目前全部质量门禁只在本地跑。加 GitHub Actions：push/PR 跑 `npm run verify`（check:data + test + smoke）。
- **依赖**：建议在 T1/T5 之后接入（校验规则定型后再固化到 CI，避免频繁改 workflow）。风险：低。

### P2（长期池）

| 编号 | 任务 | 说明 | 依赖 |
| --- | --- | --- | --- |
| T10 | SW 策略优化 | 注释 v7 与 `CACHE_NAME='hspcb-v10'` 不同步；JS cache-first 导致更新必须手动 bump 版本；预缓存 ~4MB 首装偏重（可拆核心包 + 惰性缓存数据） | T2 之后 |
| T11 | 同族模块合并 | 47 个 JS 全被引用（无死文件），但功能重复：两套热力图（study-enhanced.js:1192 vs learning-tools.js）、三套 study-tools、missing-tools/-part2、subject-gap-1/2/3 等。合并可显著减重 | T2 拆包方案定型后 |
| T12 | CSP 加固 | index.html 32 处内联 onclick + 5 个内联 script，当前无法上 CSP。先由 T3 转义铺底，再逐批改事件委托 | T3 完成后 |
| T13 | 六科题量均衡 | 数学/语文各 200 题明显低于生物 413 题，按考纲补齐 | 持续性内容工作 |

---

## 三、优先级总览

| 优先级 | 任务 | 类型 | 工作量 | 建议批次 |
| --- | --- | --- | --- | --- |
| P0 | T3 错误兜底 + 转义 | 健壮性 | 小 | Sprint 1 第 1 项 |
| P0 | T5 schema v2 改名 | 数据 | 半天 | Sprint 1 第 2 项 |
| P0 | T1 无选项题修复 | 数据 | 中 | Sprint 1 第 3 项 |
| P0 | T2 script defer + 题库惰性加载 | 性能 | 中 | Sprint 2 第 1 项 |
| P1 | T4 localStorage 收敛 | 健壮性 | 中 | Sprint 2 第 2 项 |
| P1 | T9 脚本治理 | 工程卫生 | 半天 | Sprint 2 第 3 项 |
| P1 | T14 CI 门禁 | 工程化 | 小 | Sprint 2 末 |
| P1 | T6 暗色主题令牌化 | 样式 | 大 | Sprint 3 |
| P1 | T7 可访问性 | a11y | 中 | Sprint 3（与 T6 同批） |
| P2 | T8 / T10 / T11 / T12 / T13 | 长期池 | — | 按需排期 |

## 四、依赖关系

```
T3(错误兜底+转义) ──┬──→ T2(加载优化/拆包，回归需错误信号) ──→ T11(模块合并) ──→ T10(SW)
                    └──────────────→ T12(CSP，需转义铺底)
T5(schema v2) ──→ T1(补 options，落在 v2 上) ──→ T8(答案均衡化)
T1 + T5 ──→ T14(CI 固化校验规则)
T6(暗色令牌化) ──→ T7(a11y，同批动结构)
T4(localStorage)  独立（复用 progress.js 迁移机制）
T9(脚本治理)      独立，随时可做
```

## 五、潜在风险汇总

1. **T2 回归风险（高）**：47 个模块的 IIFE 初始化存在隐式时序依赖，直接拆包可能引发连锁初始化失败。缓解：先只加 `defer`（保持相对顺序），跑通 43 项 smoke 再评估拆包。
2. **T4 数据丢失风险（中）**：收敛 localStorage 若不做旧 key 兼容读取，会清空老用户的错题本/进度。缓解：复用 progress.js 的 v1→v2 迁移器模式，逐 key 迁移 + 单测。
3. **T1 内容错位风险（中）**：批量补 options 可能出现选项与题干/原文不匹配。缓解：校验器加强规则 + 英语科逐组人工抽查。
4. **T6 视觉回归面大（中高）**：461 个硬编码色值替换令牌时容易漏改。缓解：明暗双态逐模块截图走查后再合入。
5. **改答案/改 schema 的外部兼容（低）**：若有第三方已消费 `exams` 字段，v2 改名需保留一段读取兼容。

## 六、建议执行顺序（三个 Sprint）

- **Sprint 1（止血 + 打地基）**：T3 → T5 → T1。全部是小-中工作量、可独立验证，完成后数据层与安全网均达标，且 CI（T14）的校验规则就位。
- **Sprint 2（性能与质量债）**：T2（先 defer，后惰性加载）→ T4 → T9 → T14 上线。
- **Sprint 3（体验与长期）**：T6 + T7（同批，含视觉走查）→ 按需启动 T8 / T10 / T11 / T12 / T13。

> 每项任务的通用验收线：`npm run verify`（check:data + test + smoke）PASS，且在分支上完成后再合入 main（README 已定的协作策略）。

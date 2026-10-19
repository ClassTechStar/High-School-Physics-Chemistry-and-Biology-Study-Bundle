# 项目开发方案 — v1.4 质量与正确性收敛计划

> 制定日期：2026-10-19 · 基线：`a37369e`（v1.3） · 依据：`docs/ERRATA-REPORT.md`
> 目标版本：**v1.4「正确性优先」** — 先把"内容对不对"和"门禁靠不靠谱"解决，再谈性能与体验。
> 核心判断：**当前最大风险不是性能、不是功能缺失，而是"门禁全绿"掩盖了 8 项 P0 正确性缺陷。** 本方案的第一优先级是让门禁重新具备发现能力。

---

## 0. 现状基线（实测，非文档转述）

| 指标 | 实测值 | 说明 |
| --- | --- | --- |
| 门禁状态 | `npm run verify` **全绿** | 但漏检本次发现的全部 18 项未修复 P0 |
| 题库声明量 / 真实唯一 | 1718 / **1166** | 32.1% 是纯副本（164 道逐字节相同） |
| 解析/答案一致性 | 修复前 **161 处矛盾** → 修复后 0 | 已就地修复并加门禁 |
| 考点→知识点解析率 | **20.7%** | 错题归因/学习路径对多数题失效（化学 89% 题目无法归因） |
| 分科答案偏斜 | 物理 D 39% / 数学 D 10% | 全局均衡 ≠ 分科均衡 |
| 选项渲染未转义路径 | **13/14** | 55 道含 `<`/`>` 的题会显示错乱 |
| 选项缺失 / 为空的题目 | **74 / 171** | 英语 74 题详情页必崩；数语 171 题作答区为空 |
| 恒空的数据源 | **6 个 key 无写入方** | 仪表盘 4 模块 + 成就 3 项 + 热力图恒空 |
| 冒烟覆盖的脚本 | **13/47** | 34 个模块从未被加载过 |
| 死数据（无人消费却预缓存） | **~158KB** | 4 个 JSON |
| 死代码（引用数 0） | **40KB** | `missing-tools.js` 整文件 |
| 活跃目录体积 | 1.2/ 共 ~5.7MB（js 3.3MB + data 2.1MB + index 351KB） | |

---

## 1. 总体路线

```
Sprint 0（立即，1 天）  ──► 止血：让门禁重新具备发现能力
   │                        ① 碰撞扫描真的会失败  ② 冒烟覆盖 47/47
   │                        ③ 语义校验规则集       ④ 一次性脚本加熔断
   ▼
Sprint 0.5（2-3 天）     ──► 起效性：让"已存在"的功能真的跑起来【最高优先】
   │                        T0-6  解析期捕获 CD/PS/CE → 平台区 8 tab 全废
   │                        T0-7  concepts→knowledge 映射在死代码 → 核心概念 tab 全废
   │                        T0-8  74 题崩溃 + 171 题空作答区 + 144 题缺材料
   │                        T0-9  14 处 navigateTo 目标漂移 → 整页空白
   │                        T0-10 toggleNav / chineseSearch 未定义
   │                        T0-11 化学式括号不解析 → 配平给错答案
   │                        T0-12 defer 时序类缺陷的静态检查
   │                        T0-13 工具模块 3 个 P0（计时器摧毁 UI / .bind 崩溃）
   │                        T0-14 工具模块 4 个静默失败（../data 404 / 打卡契约冲突 …）
   │                        T0-15 下线 100% 死代码 missing-tools.js（40KB）
   │                        T0-16 互动练习成绩恒 100%（读背景色而非用户选择）
   │                        T0-17 统一存储 key 的 schema（5 个 key 恒空）
   │                        T0-18 模拟考题/搜索路由修复
   │                        T0-19 数学/语文 4 个动态 tab 死按钮
   ▼
Sprint 1（1 周）        ──► 正确性：让学生看到的内容是对的
   │                        P0-1 解析一致 ✅已完成
   │                        P0-4 内容去重    P0-2 分科均衡
   │                        P0-3 考点映射    P0-5 统一转义
   ▼
Sprint 2（1-2 周）      ──► 功能恢复：让"已存在"的功能真的能用
   │                        P0-7 仪表盘空模块  P0-8 清除数据复活
   │                        P1-4 存储三轨收敛  P1-3 registerModule 架构
   │                        P1-2 死数据下线/接线
   ▼
Sprint 3（2 周，续接 v1.3 原计划）
                            P1-11/12 令牌体系  P1-13 PWA  manifest
                            P1-15 暗色令牌化  T11 模块合并  T12 CSP
```

**依赖原则**：Sprint 0 必须在 Sprint 1 之前 —— 否则修完 161 道题，下一次均衡化又会静默回归。
**Sprint 0.5 独立插在中间**：它是"用户第一屏"的修复，改动小、收益最大，且不依赖任何数据治理工作，可以与 Sprint 0 并行启动。

---

## Sprint 0 · 止血：修复门禁（1 天）

> 目标：让 `npm run verify` 具备真实的失败能力。**这是整个方案的地基。**

### T0-1 · 碰撞扫描必须能失败

**改动**：`scripts/check-global-collisions.mjs`
- `:35` `process.exit(0)` → `process.exit(bad ? 1 : 0)`
- `:15` 正则扩展为 `^(?:const|let|var|function|class)\s+`，并按花括号深度=0 判定真正的顶层（排除缩进声明与块内声明）
- **新增**：`window.X =` / `window.X.y =` 赋值冲突检测（这是 1.1 归档 `loadModuleContent` 三处覆写的真实成因，当前规则完全查不到）
- 报告分级：`const/let/class` 重名 = error；`var/function` 重名 = error（同样会触发 SyntaxError）；`window.X` 覆写 = warn（合法但需显式登记）

**验收**：临时在两文件加同名 `const` → 脚本 exit 1；CI 在 PR 上变红。
**风险**：低。纯脚本改动，不触碰运行时。

### T0-2 · 冒烟覆盖 13/47 → 47/47

**改动**：`scripts/smoke-app.mjs`
- `:141-155` 的 `loadOrder` 硬编码 13 个 → 改为**从 `index.html` 解析 `<script src>` 顺序动态生成**
- 加载前先执行 `node --check`（已有），再在假 DOM 中执行；执行失败即计入 fail
- 补齐假 DOM 能力：当前 `querySelector` 恒返回 `null`、`getElementById` 恒返回 `null` —— 这会掩盖大量「DOM id 不存在」类缺陷。改为维护一个**从 `index.html` 解析出的 id 注册表**，`getElementById` 命中则返回 stub，未命中返回 `null`（并记录未命中）
- `:202` 硬编码 `n === 1718` → 改为「与 `meta.totalQuestions` 及实际统计一致」的动态断言

**验收**：`npm run test:smoke` 覆盖全部 47 个脚本，新增断言 ≥ 20 条。
**风险**：中。47 个脚本首次在假 DOM 里跑，会暴露一批此前未见的初始化错误 —— **这正是目的**，但需逐个判定是真 bug 还是 stub 不足。

### T0-3 · 语义校验规则集

**改动**：`scripts/validate-data.mjs` 新增规则（按勘误报告逐条对应）：

| 规则 | 级别 | 对应缺陷 |
| --- | --- | --- |
| 解析声明的答案字母 == `answer` | error ✅**已实现** | P0-1 |
| 同一学科内题干不得重复（允许显式白名单） | error | P0-4 |
| `knowledgePoints` 字段名必须存在且为数组 | error | P1-5 |
| 题目 `knowledgePoints` 至少一个能解析到 knowledge topic | warn（按学科比例超阈值转 error） | P0-3 |
| 分科答案分布任一字母占比 > 35% | warn | P0-2 |
| 题干/选项含 `<` `>` 的题必须有转义渲染路径 | warn | P0-5 |
| 不得出现非 `id/type/year/...` 的非常规字段 | warn | P1-6 |
| `meta.totalQuestions` 与实际一致 | error | 文档漂移 |

**验收**：把勘误报告里的 P0-3/P0-4/P0-6 现状喂进校验器，能报出对应条目。
**风险**：低。

### T0-4 · 一次性脚本熔断

**改动**：`scripts/`
- 所有写 `exam-bank.json` 的脚本统一加 `--apply` 开关（默认 dry-run），`fix-phase-a-data.mjs` 已有 `--apply` 需改造对齐
- `fix-phase-a-data.mjs` 整体移入 `scripts/legacy/`，文件头加显著警告："**重跑会覆写已修复数据，禁止在 main 执行**"
- `enrich-short-analyses.mjs` / `polish-analyses.mjs` / `fix-no-options.mjs` 统一 `exams \|\| questions` → `questions \|\| exams`，与 `validate-data.mjs` 对齐（消除 P1-10 的顺序不一致）
- 在 `package.json` 增加 `"lint:data": "node scripts/validate-data.mjs"` 等脚本，让**全部**诊断脚本都有入口（当前 16 个脚本只有 4 个接入 npm）

**验收**：`node scripts/fix-phase-a-data.mjs` 不带 `--apply` 时不写文件；CI 不受污染。
**风险**：低。

### T0-5 · 门禁自举（CI 强制）

**改动**：`.github/workflows/verify.yml`
- 增加一步 `node scripts/check-global-collisions.mjs` **并检查退出码**（T0-1 修好后才有效）
- 增加 `node scripts/static-bug-scan.mjs` 与 `node scripts/deep-bug-scan.mjs`（两者当前从不让 CI 失败，修好退出码后接入）
- 增加矩阵：Node 18 / 20 / 22

**验收**：本地故意制造一个错误 → CI 红。
**风险**：低。

---

## Sprint 0.5 · 起效性修复：让"已存在"的功能真的跑起来（2–3 天）

> **本 Sprint 优先级高于 Sprint 1**。原因：P0-10 / P0-11 是**用户第一屏就能看到**的失效（"核心概念"tab 显示"该模块内容正在开发中"），而改动量极小、风险极低。**先让应用能用，再谈数据正确性。**

### T0-6 · 解析期捕获 `CD` / `PS` / `CE`（P0-10）

**改动**：`1.2/index.html:2026-2028`

```js
// 现状（解析期捕获 defer 模块 → 永久 undefined）
var CD = window.ComprehensiveData;
var PS = window.PlatformSystem;
var CE = window.ContentEnhancer;
```

改为**函数内实时读取**：

```js
function getCD() { return window.ComprehensiveData; }
function getPS() { return window.PlatformSystem; }
function getCE() { return window.ContentEnhancer; }
```

并把全部 `CD` / `PS` / `CE` 引用点改为调用这些 getter（或在 `DOMContentLoaded` 里重新赋值 `var CD = window.ComprehensiveData;` —— 注意用 `var` 重新赋值是可行的，因为 `DOMContentLoaded` 在所有 defer 脚本之后触发）。

**顺带删除** `index.html:3903-3904` 的 `window.ComprehensiveData = CD; window.PlatformSystem = PS;`（用失效捕获值覆盖全局，是定时炸弹）。

**验收**：
- 平台区 8 个 tab（overview/round1/round2/bank/experiment-center/learning-path/teaching-apps/competition）**全部**有真实内容，不再出现「平台模块加载中…」
- 三科 checklist tab 显示真实清单，不再「内容加载失败，请刷新重试。」
- 物理测量仪器 / 化学器材容器**非空**
- 生物答题技巧 / 生物知识图谱**不再**显示「综合数据文件未正确加载」

### T0-7 · `concepts → knowledge` 映射移出死代码块（P0-11）

**改动**：把 `index.html:3814` 的 `if (module === 'concepts') module = 'knowledge';` 移入 `app.js:1232` 的 `loadModuleContent` 内（`app.js` 是 `defer`，但 `loadModuleContent` 是在 DOMContentLoaded 之后被调用的，不存在时序问题）。

**同时**把死块里独占的三样东西搬进 `app.js`：
- `renderPhysicsExperiments` / `renderChemistryExperiments` / `renderBiologyExperiments`（`index.html:3405/3527/3633`，约 360 行）
- `handleModuleTabClick`（`index.html:3765`）
- `['round1','round2','bank','experiment-center']` 与 `['methodology','errors','graph','hotspot','tools','models']` 的分流

**做法**：把这些函数从 `index.html` 内联脚本**移到 `app.js`**（或独立 `js/module-renderer.js`），用 `MODULE_REGISTRY` 注册 —— 这正好让闲置的 `registerModule` 架构（见 T2-4）**派上用场**，一次性解决两个问题。

**验收**：
- 物理/化学/生物「📖 核心概念」显示 `app.js` 里那 500+ 行的真实内容，**不再是**「该模块内容正在开发中…」
- 三科「🔬 实验」tab 显示精细实验卡（可展开的 `exp-open` 折叠），而非粗版静态内容
- `index.html:3810-3831` 的死块**被删除**（`typeof loadModuleContent !== 'undefined'` 恒假）

### T0-8 · 英语 74 题详情页崩溃 + 171 题作答区为空（P0-12）

**改动**：
- `app-exam.js:547` → `(exam.options || []).map(...)`
- **新增非选择题作答分支**：`options` 为空或缺 `options` 时，渲染一个文本输入框（填空/简答/作文）+ 参考答案对照
- **新增 `passage` 渲染**：144 道带 `passage` 的英语题（阅读理解 65 / 完形填空 29 / 语法填空 27 / 短文改错 23）必须先渲染材料，选项紧随其后
- `app-exam.js:226` 的判分逻辑按 `type` 分流：选择题比字母，非选择题走"参考答案文本对照 + 自评"

**验收**：74 道英语题可正常打开详情页并作答；171 道主观题有输入框而非空 radio 区；144 道阅读题显示原文材料。
**风险**：中。这是新增 UI 分支，需要按题型逐一核对。

### T0-9 · 14 处 `navigateTo` 目标 id 修正（P0-14）

**改动**：`app-physics.js:14,17`；`app-chemistry.js:562,565,568,571,574,581`；`app-biology.js:198,208,215,222,229,232` 的目标 id 改为 index.html 中的真实值：

| 旧目标 | 正确 id |
| --- | --- |
| `electrochem` | `chemistry-electrochem` |
| `process-flow` | `chemistry-process` |
| `equation-notebook` | `chemistry-notebook` |
| `organic` | `chemistry-organic` |
| `ecosystem-sim` | `biology-ecosystem` |
| `pcr-simulator` | `biology-pcr-sim` |
| `physics-calculator` | `physics-formula` |
| `physics-projectile` | `physics-projectile` |
| `biology-photosynthesis` / `biology-experiment` / `biology-electrophoresis` | 同名（需核对） |

**同时**给 `app.js:1199-1201` 的 `navigateTo` 加 `console.warn` + 早退，避免"整页空白"无声发生。

**验收**：从全局搜索进入任一工具，页面正常切换且不空白。

### T0-10 · `toggleNav` 与 `chineseSearch`（P0-13）

- 删除 `index.html:973,983,995,1012,1027,1039,1053,1066` 的 8 个 `onclick="toggleNav(this)"`（事件已由 `initChineseSidebar` 绑定，删掉即可消除 8 处 ReferenceError 与红色错误 toast）
- `index.html:4185` 的 `chineseSearch` 导出到 window：`window.chineseSearch = chineseSearch;`（如同 `index.html:4251-4252` 对 `showSection` 的处理）

**验收**：语文搜索框可用；控制台无 `ReferenceError`。

### T0-11 · 化学方程式配平支持括号（P0-15）

**改动**：`app-chemistry.js:21-33` 的 `parseFormula` 实现括号/方括号递归计数。
**验收**：`Ca(OH)2 + HCl → CaCl2 + H2O` 配平系数为 `[1,2,1,2]`；`(NH4)2SO4`、`Al2(SO4)3` 计数正确。
**风险**：中。化学式解析需覆盖嵌套括号、方括号、系数前置、结晶水（·）。

### T0-12 · 让 `defer` 时序问题**不再复发**

**改动**：
- 新增 `scripts/check-defer-capture.mjs`：静态扫描 `index.html` 中所有 `<script>`（无 `src` 的内联块），若其顶层出现 `var X = window.Y` 且 `Y` 对应的模块脚本带 `defer` → 报错
- 同样扫描 `if (typeof <defer 模块的导出> !== 'undefined')` 这类**依赖解析期时序的守卫** → 报错
- 接入 `npm run verify`

**验收**：把 `var PS = window.PlatformSystem;` 写回 index.html，CI 变红。
**风险**：低。

### T0-13 · 工具模块的 3 个 P0（P0-16 / P0-17 / P0-18）

| 缺陷 | 位置 | 修复 |
| --- | --- | --- |
| 计时器兜底摧毁「秒杀技巧库」UI | `content-deep-v3.js:1126-1137` | 给计时器容器加 `id="ct-timer"`；或改用 `querySelector` 精确定位叶子节点，**禁止 `innerHTML` 整体覆写祖先** |
| 计时训练默认路径必崩 | `missing-tools-part2.js:396` | 去掉 `.bind(this)`（`map` 回调内用闭包 `k`） |
| 「再来一组」在结果页必崩 | `missing-tools-part2.js:391-393, 466-467` | `_retry()` 用 `this.state` 记忆的 subject/time/count 重建题池 |

**验收**：「选择题秒杀技巧库」点选项后 1 秒 UI 不消失；「计时训练」默认「全科综合」能开始；结果页「再来一组」不报错。
**风险**：低。

### T0-14 · 工具模块的 4 个静默失败（P1-31 / P1-32 / P1-35 / P1-36）

| 缺陷 | 修复 |
| --- | --- |
| `content-enhanced-v2.js:34/1086` 用 `../data/`，永远 404 | 改为 `'data/framework-questions.json'` / `'data/variation-bank.json'`（与仓库其余 4 处一致） |
| `hspcb_daily_checkin` 对象/数组契约冲突 → 连续打卡恒 0 | 统一为数组 `[{date:'YYYY-MM-DD'}]`，或消费方兼容对象 |
| 3 处读 `hspcb_wrong_records`（无写入方） | 改读 `HSPCBProgress.get('wrongQuestions')` |
| `content-enhancement.js:428` 的 `#main-content` 不存在 | 改用真实容器 id；同时从 `global-search.js` 移除「物质结构工具」条目（或补出该 section） |

**验收**：「框架答题训练器」「变式推荐」不再停在「题库加载中…」；打卡后「连续打卡天数」> 0；有错题时热力图/报告不再空。
**风险**：低。

### T0-15 · 下线 `missing-tools.js`（P1-33）

整文件 40KB、3 个工具全部被 `app-chemistry.js` 同名实现遮蔽且共用同一容器 id，导出符号**全仓引用数 0**。

**做法**：删除 `1.2/js/missing-tools.js` + `index.html:1986` 的 `<script>` 标签；同时把 `sw.js` 的 `CORE_ASSETS` 中对应项移除。
**注意**：这是 v1.3「const 重名修复」的对象 —— 该修复只让它**能解析**，没恢复任何功能。删除前先在 `index.html` grep 确认无按名引用。
**风险**：低。**但需跑一遍冒烟 + 人工点一遍化学三个工具。**

### T0-16 · 「互动练习」计分改为读用户实际选择（P0-19）

**改动**：`1.2/js/exam-review-system.js`
- `:602-610` 判卷时记录 `container.dataset.picked = oidx`
- `:635-640` 计分改为 `if (+container.dataset.picked === q.answer) correct++`（不再读 `style.background`）

**验收**：故意答错 → 成绩不再是 100%；五科互动练习分数与实际作答一致。
**风险**：低。

### T0-17 · 统一存储 key 的 schema（P1-32 / P1-41 / P1-35 / P0-7）

**这是全仓最集中的技术债**：同一个 key 被不同模块按不同结构读写，导致大量"恒空"。

| key | 写方 | 读方期望 | 现状 |
| --- | --- | --- | --- |
| `hspcb_error_notebook` | `error-notebook.js:16` 存**对象** `{errors, redoStats}` | 3 处按**数组**读 | 恒空 |
| `hspcb_daily_checkin` | `learning-tools.js:816` 存**对象** `{日期:true}` | `gamification-system.js:124` 按**数组**读 | 连续打卡恒 0 |
| `hspcb_wrong_records` | **无写入方** | 3 处读 | 恒空 |
| `hspcb_exam_history` | **无写入方** | 2 处读 | 恒空 |
| `hspcb_game_scores` / `hspcb_recitation_scores` | **无写入方** | 仪表盘读 | 恒空 |

**做法（推荐：彻底收敛到 `HSPCBProgress`）**：
1. 定一份**唯一 schema**（`progress.js` 的 `DEFAULTS` 已有 `wrongQuestions` / `quizRecords` / `dailyCheckin` / `examHistory` / `gameScores` / `moduleStats`）
2. 所有读写方改为 `HSPCBProgress.get/set` —— 顺带激活那套已有但**零业务采用**的 v1→v2 迁移
3. `HSPCBStore` 仅保留给"散装工具数据"，并在 `progress.js` 里登记其 key 白名单
4. 加静态门禁：新代码出现 `HSPCBStore.set('<已登记的 v1 key>')` 或 `HSPCBStore.get('<无写入方 key>')` 即告警

**验收**：学习仪表盘 4 个模块非空；打卡后「连续打卡天数」> 0；有错题时热力图/报告/学习路径都有内容；导出备份能恢复全部数据。
**风险**：中（可能丢历史数据）。**必须逐 key 迁移 + 补单测 + 先上只读兼容版本**。

### T0-18 · 模拟考试与搜索的路由修复（P1-39 / P1-40 / P1-43）

| 缺陷 | 修复 |
| --- | --- |
| `mock-exam.js:666` 题型槽位与题库 `type` 零交集 | 建 `BANK_TYPE → SLOT` 映射；找不到候选时**不静默放宽为随机**，而是提示"该题型暂无可用题" |
| `mock-exam.js:1108` 主观题精确串比对恒判错 | 改「关键词命中」给分，或标记「需人工判分」 |
| `global-search.js:709` 回退只切 section 不渲染 | 改 `window.navigateToolPage ? navigateToolPage(toolId) : navigateTo(toolId)`；或补统一 `loadTool(toolId)` |

**验收**：模考按题型抽题能抽到题；主观题不再恒 0 分；全局搜索点任一工具都能看到内容。

### T0-19 · 数学/语文的 4 个动态 tab（P1-42）

**改动**：`index.html:3858` 白名单补 `math`/`chinese`；`app.js:1258` 改用 document 级事件委托；或 `exam-review-system.js` 追加按钮后自行 bind。
**验收**：点数学「✍️ 互动练习」能渲染出 `#quiz-container-math`。

---

## Sprint 1 · 正确性：内容必须是对的（1 周）

### T1-1 ✅已完成 · P0-1 解析与答案键一致

- 交付：`scripts/fix-answer-analysis-mismatch.mjs`（已跑，161 题修复，0 需人工）
- 门禁：`validate-data.mjs` 新规则（已加）
- **遗留**：`MATH_2025_15` 答案键订正为 B（已随脚本 `MANUAL_OVERRIDES` 一并处理）
- **待办**：`balance-answers.mjs` 必须补「答案字母引用」规则后再允许重跑；否则重跑会再次制造矛盾

### T1-2 · P0-4 内容去重（真实题量 1166 → 明确基线）

**改动**
- 新增 `scripts/dedupe-by-content.mjs`（dry-run 默认）：按 `学科 + 规范化题干` 分组，保留**最早出现**且**解析质量最高**的一份，其余移入 `1.2/data/_archive/duplicates-<date>.json`（**归档而非直接删**，保留可追溯）
- 同步修正 `meta.totalQuestions` 与各科 `total` 字段
- 门禁：T0-3 的"同题干不得重复"规则

**决策点**：真实题量降到 ~1166 后，README 宣称的"1718 题"必须改写。
**建议**：诚实标注为"1166 道原创题（+552 条历史副本已归档）"，并把扩题作为内容贡献任务（见 T3-4）。
**验收**：`validate-data.mjs` 无重复告警；题量口径在 README / CHANGELOG / manifest 三处一致。
**风险**：中。归档策略需与内容贡献者确认。

### T1-3 ✅已完成 · P0-2 分科答案分布均衡

> **执行结果**（见 3.6 节）：`balance-answers.mjs` 改为按学科分桶，并采纳了
> DEV-PLAN 标注"复杂度高"的**后者方案**——换位时同步改写解析中的字母引用，
> 配合 T0-3 已有的 C10 冲突规则兜底。六科最大占比 36.7%~45.2% → **25.0%~25.3%**。

**改动**
- `balance-answers.mjs` 的配额改为**按学科分桶**（`target_subject = round(该科选择题数 / 4)`），而非全库
- **新增安全规则**：解析中出现答案字母引用时，该题**不参与换位**（或换位时同步改写解析 —— 二选一，建议后者但复杂度高，前者更安全）
- 新增英文位置引用词：`all of the above` / `both A and B` / `none of the above`（当前英文题库命中 0，但扩题后必然出现）
- 接入 `npm run verify`

**验收**：各科任一字母占比 ≤ 32%；`balance-answers.mjs --apply` 后 `validate-data.mjs` 的"解析/答案冲突"仍为 0。
**风险**：中高。换位 = 内容正确性风险，**必须先有 T0-3 的冲突规则兜底**。

### T1-4 · P0-3 考点映射修复（错题归因打通）

**改动**
- 把 `learning-path-recommender.js:30-119` 的 `TOPIC_ALIAS_MAP` **从代码里抽到 `1.2/data/knowledgePoints-thesaurus.json`**（该文件已存在却无人消费，见 P1-2）—— 别名表本就该是数据
- 扩表：数学/语文/英语从各 ~20 条扩到覆盖 80%+ 考点（当前命中率 19%/9%/15%）
- **更好的路径**：优先修正**题库侧**的 `knowledgePoints` 命名，使其与 `knowledge.json` 的 topic 名直接对齐；别名表只作为过渡兜底
- 门禁：T0-3 的"考点可解析率"规则，阈值按学科设定（物理 ≥85%，数学/语文/英语 ≥70%）

**验收**：六科"无法归因题目"比例均 < 25%；学习路径推荐能对任一错题给出具体复习条目。
**风险**：中高。952 个考点需要逐个对齐，是**内容工作**而非代码工作，需排人力。

**执行结论（重要）**：经实测，P0-3 的**根因不是别名表不全**。题库 `knowledgePoints`
填的是「学科模块名 + 频次标签」（如 `光学与原子物理` / `综合应用` / `高频考点` / `基础概念`），
本就不是知识点。任何别名表都无法把「光学与原子物理」安全归到「几何光学」还是「波动光学」——
强行映射会**制造错误归因**，比不映射更糟。数学/语文/英语尤其明显：
240 个唯一考点 / 200 道题，是自由文本考点，只能由内容侧重新标注。

### T1-5 ✅已完成 · P0-5 统一转义

> 已收敛为「1 份权威实现 + 4 处转发委托」。实测是 **7 份**实现（报告记为 6 份），
> 且语义**并不等价**：其中 4 份漏转义单引号，1 份会把 null 渲染成字符串 "null"。

**改动**
- 引入单一权威：`CommonUtils.escapeHtml`（`common-utils.js:12`）
- 收敛 6 份重复实现：删除 `content-deep-v3.js:548,968,1469`（3 份顶层同声明，前 2 份本就死）、`global-search.js:1181`、`study-tools-v2.js:42`、`subject-gap-2.js:7`，统一改用 `CommonUtils.escapeHtml`（**注意**：`study-tools-v2.js:42` 的实现是对象属性形式，需评估其语义是否等价）
- 接入 13 条渲染路径（勘误报告 P0-5 表格逐条列出）
- 兜底：给 `index.html` 的 120 处内联 `innerHTML` 加一层全局 `safeHtml()` 包装或逐处转义
- 门禁：T0-3 的"含尖括号题目必须有转义路径"规则

**验收**：55 道受影响题目在全部 14 条渲染路径下显示正常；全仓 `escapeHtml` 实现收敛为 1 份。
**风险**：中。注意不要把合法 HTML（如 `<sub>`、`<br>`）误转义 —— 参照 `app-exam.js:542` 的正确写法（**先转义后插标签**）。

### T1-6 · P1-7 模板化解析治理

**改动**：105 道"复述题干 + 报答案"解析需重写为真正的讲解。校验器新增规则：解析不得以 `分析：{题干}。` 开头（题干复述）。
**验收**：模板解析数 = 0。
**风险**：中。属内容工作。

---

## 3.6 Sprint 1 执行结果（代码层已完成，内容工作待排人力）

**结论**：T1-1 ~ T1-5 全部完成。T1-6 为纯内容工作，已产出待办清单。

### 已完成

| 任务 | 交付 |
| --- | --- |
| T1-1 | ✅ 161 题解析/答案键一致化 + `validate-data.mjs` 规则 |
| T1-2 ✅ | 新增 `scripts/dedupe-by-content.mjs`：1718 → **1301 唯一题**，417 条副本**归档**至 `1.2/data/_archive/` |
| T1-3 ✅ | `balance-answers.mjs` 改**按学科分桶** + 换位时同步改写解析字母引用；六科最大占比 **25.0%~25.3%** |
| T1-4 ✅ | 别名表外部化：`loadThesaurus()` 从 `knowledgePoints-thesaurus.json` 加载合并；新增 `build-kp-thesaurus.mjs`（含目标存在性校验）、`export-unmapped-kp.mjs` |
| T1-5 ✅ | `escapeHtml` 由 7 份收敛为「1 权威 + 4 委托」 |

### 三处与原报告/DEV-PLAN 判断不同（以实测为准）

1. **去重口径必须含 passage**。只按「学科+题干」会把 135 道「同题干不同材料」的
   合法独立题误判为副本。英语语法填空/短文改错题的 `question` 是**完全相同的模板句**，
   真内容在 `passage` 里。
2. **P0-2 的偏斜是真的**，且比报告描述的更严重：英语 B 曾占 45.2%。
   原判断"偏斜主要由副本放大"只对了一半——去重后各科内部仍显著偏斜。
3. **P0-3 的根因是考点字段填了模块名和标签**，不是别名表不全（详见 T1-4 执行结论）。
4. **P1-3「registerModule 定义后零调用」在 Sprint 0 后已不成立**（T2-4 结项时发现）。
   P0-11 修复已让 `registerBuiltinModules()` 注册 5 个真实模块，注册表是活的；
   T2-4 方案 A（删除 `MODULE_REGISTRY`）的前提失效，改为消除 3 处
   `loadModuleContent` 猴补丁链（P1-1）。
5. **P0-8 有两层根因**（T2-2 结项时发现）。报告只指出 `remove` 不清旧裸 key
   （T0-17 已修）；实际还有第二层——「清除数据」只覆盖 4 个散装 key，
   权威轨 `hspcb.v2.progress` 里的 examHistory/wrongQuestions/gameScores 等
   完全没被清，且英文版清除按钮（`study-tools-enhanced.js`）只删 `hspcb_` 前缀 key，
   连 `hspcb.v2.*` 与 `hspcb.st.*` 都漏掉。

### 门禁自检（本轮新增，均经注入缺陷验证会 exit 1）

| 注入缺陷 | 拦截门禁 |
| --- | --- |
| 全局符号重名 | check-global-collisions |
| 解析声明答案字母 ≠ answer | validate-data / check-content C10 |
| 解析期捕获 defer 模块 | runtime-defer-check |
| 组卷题型映射回退 | runtime-defer-check T0-18 |
| 打卡 remove 不清旧裸 key | runtime-defer-check T0-17 |
| `_retry` 崩溃 | runtime-defer-check T0-13 |

`lint-baseline.json` 同步更新为实测值：`C1=0`、`C2=892`、`C3=0`。

### 剩余工作（内容侧，非代码）

- **T1-6 模板化解析治理**：105 道"复述题干 + 报答案"解析需人工重写
- **考点重标注**：数学/语文/英语的 `knowledgePoints` 需改为与 `knowledge.json`
  topic 对齐的具体知识点，清单见 `docs/TODO-knowledge-points.md`

---

## Sprint 2 · 功能恢复（1-2 周）

### T2-1 · P0-7 学习仪表盘空模块

**改动**：`study-dashboard.js:27,32` 读的 `hspcb_game_scores` / `hspcb_recitation_scores` **没有写入方**。
- 二选一：① 让写入方改用这两个 key；② 让读取方改读实际写入的 key（`hspcb.v2.gameScores` / `hspcb.v2.moduleStats.recitation`）
- 建议 ② —— 统一到 v2 命名空间
- 顺带修 `study-dashboard.js:15-37`：把 4 次 `JSON.parse` 拆成**各自独立**的 try/catch，并补 `console.warn`

**验收**：完成一次游戏 + 一次背诵后，仪表盘对应模块显示非零数据。
**风险**：低。

### T2-2 · P0-8 「清除学习数据」真正清除

**改动**
- `learning-tools.js:883-886`：清除时**同时**删除 v1 裸 key 与 `hspcb.st.*`（否则下次 `HSPCBStore.get` 的透明搬迁会把数据搬回来）
- 或更彻底：`HSPCBStore.remove` 增加 `removeLegacy` 语义 / 提供 `HSPCBStore.purge(key)` 一次性删除两者
- `progress.js:489-499` 的搬迁逻辑加"搬迁后删除旧 key"选项（当前保留旧 key 便于回滚，与"清除"语义冲突）

**验收**：点清除 → 刷新 → 数据不复活；`localStorage` 中相关 key 全部消失。
**风险**：低。**但必须补一条单测**，锁死这个行为。

### T2-3 · P1-4 存储三轨收敛

**改动**
- 明确三轨职责：`hspcb.v2.*` = 学习进度（权威，`HSPCBProgress`）；`hspcb.st.*` = 散装工具数据（`HSPCBStore`）；v1 裸 key = **只读迁移源，迁移完成后应清理**
- `learning-tools.js` 的 `HSPCBStore.set('hspcb_daily_checkin', …)` → 改为语义化 key（如 `HSPCBStore.set('dailyCheckin', …)`），消除 `hspcb.st.hspcb_daily_checkin` 双层前缀
- `data-analysis-enhanced.js:498` 的 `hspcb_study_time` → 改走 `HSPCBProgress.set('studyTime', …)`，与 v2 侧对齐
- 加门禁：静态扫描"js/ 中出现裸 `localStorage.` 即告警（白名单 3 类）"（任务清单 T4 的原始设想，从未实现）

**验收**：全仓 `localStorage` 裸调用仅剩白名单 3 处；导出备份能包含全部学习数据。
**风险**：中。迁移不当会丢用户数据 → 必须逐 key 迁移 + 单测。

### T2-4 · P1-3 `registerModule` 架构空壳

> **v1.4 修正结论**：原计划方案 A（删除 `MODULE_REGISTRY` 死代码）的前提**已失效**。
> ERRATA-REPORT  P1-3 写于 Sprint 0 之前；Sprint 0 的 P0-11 修复已在 `app.js` 增加
> `registerBuiltinModules()` IIFE，正式注册 experiments/round1/round2/bank/experiment-center
> 共 5 项，`loadModuleContent` 亦改为优先查注册表。**注册表是活的且承重，不能删。**

**实际执行（v1.4）**：消除真正的架构债——`window.loadModuleContent` 的 3 处赋值链（P1-1）：
- `app.js:1377` 权威定义（保留，唯一赋值点）
- `content-enhancement.js` 猴补丁 → 改为 `registerModule` 注册 7 项
  （tools/methodology/models/hotspot/errors/graph/checklist）
- `exam-review-system.js` 猴补丁 → 改为 `registerModule` 注册 4 项
  （exam/round1/round2/quiz；round1/round2 依原语义覆盖内置注册项——
  考试系统渲染器优先，与改造前「最后加载的补丁说话」行为一致）

**验收（均已满足）**：
- runtime 门禁 +5 断言：注册表 ≥10 项、14 个关键模块全部注册、
  `window.loadModuleContent` 仅 app.js 一处赋值、14 个注册模块全部可经
  `loadModuleContent` 命中；注入猴补丁 → 门禁 FAIL（已验证）
- 文档不再声称存在「零调用空壳」；ERRATA-REPORT P1-1/P1-3 已标注结项状态

**T11「模块合并」工作量重估**：合并成本**低于**原估计。原因：注册表现已提供统一
注册点（14 项），模块渲染入口收敛为 `loadModuleContent` 单函数 + 注册表单文件。
剩余风险是 47 个自渲染模块的内容回归，需 `smoke-app.mjs` 覆盖 47/47 后逐模块走查。

### T2-5 · P1-2 死数据处置

> **v1.4 修正结论**：原报告「4 个文件都无运行时消费方」的名单已变化。
> `knowledgePoints-thesaurus.json` 在 T1-4 已接线（`learning-path-recommender.js`
> 的 `loadThesaurus()`），不再是死数据，**保留**。

**实际执行（v1.4）**：

| 文件 | 处置 | 依据 |
| --- | --- | --- |
| `cross-subject.json` | **接线** | 功能原跑 `visual-enhanced.js` 内 8 条硬编码数据；改为运行时 fetch（22 条）+ 适配器（examTrend→trend、学科码→中文、答案字母→索引），失败回退内置。新增 `scripts/test-cross-subject.mjs` 14 断言 |
| `situational.json` | **下线归档** | 全仓核查无运行时消费方（`guangdong-features.js` 的 situationalQuiz 用硬编码数据，该文件 fetch 调用数 0） |
| `tech-frontiers.json` | **下线归档** | 同上（`visual-enhanced.js` 的 techFrontiers 用硬编码数据） |
| `knowledgePoints-thesaurus.json` | **保留（已活）** | T1-4 接线 |

归档位置：`1.2/data/_archive/`（与 T1-2 去重副本同一约定）。
同步移除：`sw.js` 的 `DATA_ASSETS`、`validate-data.mjs` 的 EXTENDED 清单、README 特性表。

**验收（均已满足）**：`sw.js` 预缓存清单不含死数据；README 特性表与实现一一对应；
`npm test` 含 cross-subject 接线回归（39 + 14 = 53 项断言）。
**风险**：低。cross-subject 接线有内置回退，`file://` 直开或网络异常时功能不退场。

### T2-6 ✅已完成 · 1.1 归档处置（消除误导，不做功能修复）

**原则**：`1.1/` 是只读归档，**不在归档内做功能修复**（修了反而制造"1.1 也是可用版本"的错觉），但**必须消除误导**。

按优先级：

1. **加归档横幅**（`1.1/index.html` `<head>`）——
   「⚠️ 本目录为 v1.1 只读归档，已被 `/1.2/` 完全取代。当前开发目录为 `/1.2/`，请勿基于本目录开发或提 issue。」
   同时把 `1.1/index.html:226` 页脚的 **v3.0** 改为 **v1.1（只读归档）**（P1-17）。
2. **删除 `1.1/check-syntax.js`**（P1-27）——硬编码仓库外路径 + ESM 下 `require` 不可用 + 泄露本机用户名目录结构。删除与 CHANGELOG:32 对 `1.2/check-syntax.js` 的处置一致。
3. **新增 `1.1/README.md` 已知问题清单**（不改动任何功能代码），登记：
   - `js/enhanced-tools.js` 语法错误 → 整个 140KB 文件从未执行，5 个增强模块全不可用（P0-9）
   - 三个 `data/*/knowledge.json` 从未加载（45KB 死文件）
   - `pcrSimulator` / `gelElectrophoresisSimulator` / `equationBalancerPro` 因容器 id 不匹配而永不渲染（≈955 行）
   - 「元素周期表」「化学物质结构」因 `main-content` id 缺失而不可见
   - `exam-bank.json` 元数据题量 120 vs 实际 21；`PHY_2018_01` 答案与解析矛盾
   - `showSection` / `setActiveNav` 困于 IIFE（当前不可达）
4. **修正 `promo.html` / `presentation.html` 的工具数量矛盾**（18 vs 27 vs 实际 32，P1-28），统一为 32。
5. 统一 `exams \|\| questions` 顺序（已在 T0-4 覆盖）。

> **不建议**删除整个 `1.1/` 目录 —— `presentation.html` / `promo.html` 是对外展示页，删除会破坏 GitHub Pages 路径。**保留 + 标注**优于删除。

> **v1.4 执行结果（第 4 项，2026-10-19 结项）**：
> 以 `1.1/index.html` 的 `data-tool` 注册表为唯一事实源（32 个唯一工具）修正两页：
> - **总量**：promo 三处（hero 副标题 / hero 数字 / 统计卡）+ presentation 六处（副标题 /
>   `data-count` 计数动画 / 项目简介 / 价值卡 / 结尾口号 / 尾页 `fs-num`）全部统一为 **32**
> - **分科**（按主标签归类，`secondary-conclusions` 物化共用、按其 `tool-tag=physics` 只计一次）：
>   物理 **7** / 化学 **10** / 生物 **13** / 平台 **2**，合计 32 自洽；promo 统计卡相应新增「平台工具」行
> - **历史口径保留但消歧**：路线图 slide 的「18款核心工具开发完成」是 v1.0 里程碑事实，
>   改为「**首期**18款」，门禁放行该短语、其余任何「18款/27款」一律 FAIL
> - **门禁**：`runtime-defer-check.mjs` 新增 9 项断言（80 → 89），期望值从注册表实时推导；
>   四类注入（总量回退 / 分科改数 / 恢复原始缺陷态 / 注册表删工具）全部验证会 FAIL

---

## 3.7 Sprint 2 执行结果（已完成）

**结论：T2-1 ~ T2-6 全部完成，Sprint 2 关闭。** 提交：`7e3f76e` / `cd86e91` / `4167b86` / 本轮 T2-6 收尾。

| 任务 | 结论 |
| --- | --- |
| T2-1 | 仪表盘改读真实写入方（`hspcb_game_scores` 等无写入方裸 key 全部下线）；runtime +3 断言 |
| T2-2 | P0-8 **两层根因**：① remove 不清旧裸 key（T0-17 已修一层）② 清除面只有 4 个散装 key，权威轨 `hspcb.v2.*` 完全没清，且英文版清除按钮漏 `hspcb.st.*`。现三轨全清 + 39 项单测锁死 |
| T2-3 | 三轨职责写入文档与代码注释；`resetAll()` 公开化供清除按钮调用 |
| T2-4 | **原报告前提失效**：`MODULE_REGISTRY` 不是死代码（P0-11 修复后已注册 5 项真实模块），不能删。真正债务是 P1-1 的 `loadModuleContent` 赋值链（3 处猴补丁 → `registerModule` 注册 11 项），收敛为 1 处权威定义 |
| T2-5 | **原报告名单已变**：`knowledgePoints-thesaurus.json` 在 T1-4 已活；`cross-subject.json` 接线（8 条硬编码 → 22 条 JSON + 适配器）；另两个确认死数据后归档至 `1.2/data/_archive/` |
| T2-6 | 横幅、页脚版本号、删 check-syntax.js、归档 README、工具数量统一为 32（分科 7/10/13/2 自洽）均已完成 |

**两处与原报告判断不同**（以实测为准，已同步 ERRATA-REPORT）：
1. P1-3「registerModule 定义后零调用」在 Sprint 0 后已不成立（T2-4 发现）
2. P0-8 有两层根因，仅修存储 schema 不能使用户的「清除数据」生效（T2-2 发现）

**门禁现状**：verify 全链 PASS（data / lint 9+2 基线 / content 11+7 基线 / runtime 89 / test 39 / cross-subject 14 / smoke 46）；本轮新增断言全部经缺陷注入验证会 FAIL。

---

## Sprint 3 · 体系与体验（2 周，续接 v1.3 原计划）

### T3-1 ✅已完成 · P1-11/12 设计令牌闭环

- 首页 6 张卡片全部改用令牌类（`subject-card math` / `.chinese` / `.english`），删除内联 `style="border-left:…"`（`index.html:173,182,189`）
- 新增 `--english` 令牌（`tokens.css`），并为 `--math` 换成与 `--physics` 不同的色相（当前两者同为 `#3b82f6`）
- `style.css` / `theme-dark.css` 补齐 `.english` 规则
- 补 `tokens.css` 头部声称的 `@import` 约定，或修正注释

**验收**：6 科卡片色相互不相同；暗色模式下无内联色残留（grep 断言 `index.html` 中 `border-left:4px solid #` 为 0）。

> **v1.4 执行结果**：
> - **令牌**（浅色）：物理 `#3b82f6` / 化学 `#10b981` / 生物 `#f59e0b` / 语文 `#0ea5e9` /
>   数学 `#ec4899` / 英语 `#8b5cf6`（新增）。`--math` 由与 `--physics` 撞色改为品红；
>   `--chinese` 由 `#ec4899`（粉）修正为 `#0ea5e9`（天蓝）——原值与其导航按钮阴影
>   `rgba(14,165,233)`、暗色令牌 `#38bdf8`、语文知识页标题色均不符，属令牌文件笔误
> - **暗色令牌**同步六色互异；`--math` 由与暗色 `--chemistry` 撞色（同为 `#60a5fa`）
>   改为 `#f9a8d4`，新增 `--english: #fca5a5`
> - **顺手修复的连带缺陷**：① `.nav-btn-english` 在 HTML 存在但**无任何 CSS 规则**，
>   英语导航按钮从未能高亮 → 补 `.nav-btn-english.active`；② 物/化/生三张卡的
>   渐变底色与各自 border-left 令牌**错位一格**（物理卡渐变是平台紫、化学卡是物理蓝、
>   生物卡是化学绿）→ 全部改为与本卡令牌同色相；③ 暗色通用补丁的
>   `border-color !important` 会把六科学科色条**拍平**成 slate → 补 6 条
>   `[data-theme="dark"] .subject-card.X { border-left-color: var(--X) !important; }`
> - **`tokens.css` 头注释**：实际加载方式是 index.html 的 `<link>` 顺序
>   （tokens → style → theme-dark），文件内并无 `@import`，注释已按事实修正
> - **门禁**：`runtime-defer-check.mjs` 新增 14 项断言（89 → 103）：明暗两套色板
>   各六令牌齐全且互异、静态 HTML 学科卡零内联样式、六张卡片类名在位、
>   `.subject-card.english` / `.nav-btn-english.active` 规则在位、暗色色条六科全保留；
>   四类注入（恢复内联样式 / 令牌撞色 / 删暗色色条规则 / 删英语导航规则）全部验证会 FAIL
> - **视觉走查**：Edge 无头截图明暗双态，六卡色条在两种模式下均正确呈色
>
> **与验收标准的偏差（记录在案）**：验收写的「`index.html` 中 `border-left:4px solid #` 为 0」
> 按**静态 HTML** 执行。JS 字符串里约 15 处 `knowledge-card` 内联色属**内容级装饰色**
> （按知识点各异），且已被暗色通用补丁的 `border-color !important` 中和，不属于学科卡缺陷；
> 其批量提取属 T3-3（hex 552 → <100）的范畴，未在本任务扩大改动面。

### T3-2 ✅已完成 · P1-13 PWA manifest 修正

- `name` 补「英」：「高中物化生语数英学习大礼包」
- `short_name` 改「高考备考」而非内部代号 `HSPCB`
- 图标改为**真实 PNG/SVG 文件**（`icons/icon-192.png` / `icon-512.png` / `icon-maskable-512.png`），**不能用 data: URI**（Chrome 不支持）
- `shortcuts` 补语文/英语

**验收**：Chrome DevTools → Application → Manifest 无告警；可安装。
**风险**：低。

> **v1.4 执行结果**（提交 `7cc91bc`）：
> - **图标**：新建 `1.2/icons/`，4 个真实文件——`icon.svg`（品牌渐变 `#4f6ef6→#7b93fa`
>   + 白色「物化生」）、`icon-192.png`、`icon-512.png`、`icon-maskable-512.png`
>   （全幅出血 + 文字收进 80% 安全区）；尺寸均经 PNG IHDR 校验
> - **`manifest.json`**：name 补「英」（与 index.html `<title>` 口径一致）；
>   short_name `HSPCB` → 「高考备考」；4 个 data: URI 全部换真实文件；
>   shortcuts 补语文/英语，六科全覆盖
> - **新发现并修复的连带缺陷——shortcuts 深链是坏的**：manifest 早已声明
>   `index.html?subject=physics` 等 URL，但全仓**没有任何 `URLSearchParams` /
>   `location.search` 消费方**，点击 shortcut 只会打开首页。已在 `app.js`
>   DOMContentLoaded 补最小实现：白名单从 `.nav-btn[data-subject]` 实时推导
>   （不写死集合）+ 复用 `navigateTo`；非法参数警告并停留首页
> - **`sw.js`**：`CACHE_NAME` v13 → v14；`CORE_ASSETS` 预缓存 4 个图标文件
>   （PWA 安装与离线启动需要）
> - **`index.html`**：补 `rel="icon"`（icon.svg）与 `apple-touch-icon`（icon-192.png）
> - **门禁**：`runtime-defer-check.mjs` 新增 18 项断言（103 → 121）——静态 15 项
>   （name/short_name/无 data: URI/图标文件存在/尺寸与 purpose/shortcuts 六科/
>   URL 形态/sw 预缓存/favicon 链接/深链消费方/白名单推导/复用 navigateTo）
>   + 行为级 3 项。行为级断言为此扩展了沙箱：补 `URLSearchParams` 全局、
>   令假 DOM 的 `querySelectorAll` 识别 `.nav-btn[data-subject]`（从 index.html
>   静态 HTML 抽取），重放 DOMContentLoaded 验证 `?subject=english` 激活
>   english-section、非法参数被白名单拦截
> - **注入验证**：六类缺陷全部正确 FAIL 后经 cp 备份恢复（未用 git checkout）：
>   name 去「英」/ 图标回 data: URI / shortcuts 删英语 / sw 删图标预缓存 /
>   app.js 深链致盲（静态+行为双杀）/ index.html 删 favicon
> - **真实浏览器验证**：Edge 无头打开 `index.html?subject=english`，截图确认
>   直达英语科且导航按钮高亮（基线页为首页）；4 个图标与 manifest 经 HTTP
>   200 + 正确 Content-Type 验证
>
> **与验收标准的偏差（记录在案）**：验收写的「Chrome DevTools → Application →
> Manifest 无告警；可安装」以**静态等价断言**执行（manifest 可解析、图标真实
> 且存在、六科 shortcuts、sw 预缓存齐全 + Edge 无头深链实测）。Chrome 的
> 「可安装」判定依赖 beforeinstallprompt 事件与参与度启发式，无头环境无法
> 完整复现，留待人工在 Chrome 中点击安装按钮确认。

### T3-3 ✅已完成 · P1-15 暗色主题令牌化（v1.3 T6 第二阶段）

- `theme-dark.css` 当前 552 hex + 253 `!important` → 目标：降到 < 100 hex、< 30 `!important`
- 必须配合**明暗双态逐模块视觉走查**（v1.3 任务清单已正确指出这个风险）

> **v1.4 执行结果**（T3-3a 令牌化 + T3-3b `!important` 削减，两轮均经
> computed-style 回归 harness 实证）：
>
> **T3-3a 令牌化（外观零变化已实证）**
> - 口径修正：验收原文「552 hex」是**全文 hex 出现次数**（含令牌定义与
>   `[style*=]` 选择器匹配串）。按「声明值 hex、排除令牌定义」计为 **199 处 /
>   81 个唯一值**；另有 333 处 hex 位于 `[style*=]` 属性选择器字符串中——
>   那是匹配条件不是颜色，属性选择器无法含 `var()`，不可令牌化
> - 199 处声明 hex 全部收拢为 **91 个语义令牌**（`--dm-*` 79 + 学科/强调 12），
>   声明体现为 0；`--dm-body-bg` 把 body 五段渐变中的三个中间色收拢为渐变 stops
> - **回归方法**：Edge 无头 + 注入式 dumper，遍历全部元素 × 17 个颜色 longhand ×
>   6 个伪元素态，序列化 JSON 逐元素比对；明暗双态 × 九科 section 共 18 组
>   （4210–4473 元素/组）**全部字节级一致**；同一构建跑两次自证确定性
>
> **T3-3b `!important` 削减（harness 实证决定保留集）**
> - 结构盘点：259 个 `!important` = 99 重映射层（`[style*=]` 规则，压过 JS 生成的
>   内联样式，**承重墙**）+ 158 补丁层 + 2 注释。补丁层经 static 级联分析初判
>   59 危险 / 46 安全后，改用「harness 实证」：非状态规则逐一剥离后比对，
>   状态规则保守保留
> - **补丁层 158 → 21**（< 30 目标达成）。保留的 8 条规则全部有 harness 证据：
>   ① `.quiz-option.correct/.wrong`（style.css:2184-2185 自带 `!important` 竞争）；
>   ② 通用 `input/textarea/select` 与 `code/pre/kbd`（JS 内联样式竞争——
>   input#cs-input/#tb-input 的 `border:1px solid #cbd5e1`、8 处 kbd 的
>   内联 background/border/color）；③ `.knowledge-card` 专则（见下拆分）；
>   ④ `.chinese-knowledge .nav-item`（`:last-child` 的 `border-bottom:none` 竞争，
>   颜色差不可见但按严格 parity 保留）；⑤ `.chinese-knowledge .search-box input`
>   及其 `:focus`（通用 input 规则保留 important 后须同带 important 才压得过）
> - **结构性拆分**：原 27 选器通用规则（`.exp-card/.knowledge-card/.info-box/…`）
>   整条 `!important`，其中只有 `.knowledge-card` 与 JS 生成的内联样式正面竞争
>   （platform-system.js / content-enhancement.js / exam-review-system.js 的卡片
>   自带内联 `background:linear-gradient+border`）→ 拆为独立专则保留 `!important`；
>   其余 26 个选择器去掉后由特异性裁决（如 `.chinese-knowledge .info-box.red`
>   (0,4,0) 胜过通用规则 (0,2,0)），**拆分前后级联结果不变**
> - **最终回归**：暗态九科 × 双模式（常规 + force-states 状态强制：剥状态伪类让
>   状态规则无条件生效 + 动态类元素补类 + 真实 focus）共 18 次快照比对，
>   **4210–4473 元素/组全部逐元素一致，零差异**。亮态不受影响（theme-dark.css
>   全部规则均为 `[data-theme="dark"]` 作用域，T3-3a 已全量验证）
>
> **门禁（`npm run check:theme`，已接入 verify 链第三环）**
> - `check-theme-tokens.mjs` 六项断言：T1 声明体 hex = 0；T2 补丁层 `!important`
>   < 30；T3 重映射层 = 99（承重墙防侵蚀）；T4 令牌定义 ≥ 91、var 引用 ≥ 266；
>   T5 无令牌自引用；T6 无悬空 var() 引用。**当前 6/6 通过**
> - **反向篡改验证**（`scripts/verify-gate-tamper.mjs`，一次性执行）：六类回退
>   （注入声明 hex / 补丁层越过 30 / 重映射层侵蚀 / 删令牌定义 / 令牌自引用 /
>   悬空 var()）各造一个篡改副本，**全部被门禁抓住**（退出码非 0 + 命中目标断言）
>
> **与验收标准的偏差（记录在案）**：
> 1. 「< 100 hex」按**声明值口径**执行（199 → 0，严于目标）；全文 hex 计数含
>    91 个令牌定义与 333 处选择器匹配串，均不属可削减范围
> 2. 「< 30 `!important`」按**补丁层口径**执行（158 → 21）。重映射层 99 个
>    `!important` 是压过 JS 生成内联样式的架构性承重墙——批量移除会造成
>    117+ 处真实回退（harness 实证），其根治须从 JS 内联色源头解决
>    （内联样式改类名 + 令牌），移交 T3-5 评估
> 3. 「明暗双态逐模块视觉走查」以** computed-style 逐元素回归**执行
>    （比截图走查更严：覆盖 17 个颜色 longhand × 6 个伪元素态 × 全部元素），
>    截图走查留待人工抽检

### T3-4 · T11 模块合并 / T12 CSP 收紧 — 🟡 部分完成（T11 评估完成 / T12 静态部分完成）

- T11：按 T2-4 的结论重估工作量；合并必须有逐模块回归（`smoke-app.mjs` 覆盖 47/47 是前提）
- T12：先把 `index.html` 的 32 处内联 `onclick` 改为事件委托，才能移除 `unsafe-inline`

#### T11 评估结论（v1.4，实测口径）

> **措辞修正**：T2-4 的「47 个自渲染模块」措辞不准确——47 是**脚本数**
> （46 个 `js/*.js` + `sw.js`），而非自渲染模块数。

| 维度 | 实测值 | 证据 |
| --- | --- | --- |
| 脚本总数 | 46 `js/*.js` + `sw.js` = 47 | `index.html` 53 个 `<script>`（48 处带 `defer`） |
| 代码规模 | 54305行 / 46 文件，均 1181 行 | 最大 `app-chemistry.js` 4931 行 |
| 自渲染强度 | 332 处 `innerHTML` 写入 | top：math-tools 25 / study-tools-v2 18 / subject-gap-1 17 / error-notebook 16 / subject-gap-2 16 |
| 全局符号 | 151 个 `window.X` | `app-chemistry.js` 导出 17 个（最多） |
| 注册点 | **已统一** | `window.MODULE_REGISTRY` + `registerModule()`（app.js:1266-1269） |
| 渲染入口 | **已收敛为单函数** | `loadModuleContent(subject, module)`（app.js:1287），优先级 `MODULE_ALIAS → MODULE_REGISTRY → subjectContent` |
| escapeHtml | 已收敛 | 5 个文件仍有定义，但均为「委托 `CommonUtils` + 内联兜底」薄壳，非独立实现，无重复债务 |

**结论：合并成本低于原估计，但收益有限，不建议在v1.4 做。**
理由：注册表与渲染入口**已经存在**，说明 T2-4 想解决的「无统一装载路径」问题实际已解决；
真正剩下的是 54305 行的内容回归风险，而收益（减少几个文件）远小于风险。
若未来仍要合并，前置条件是 `smoke-app.mjs` 覆盖到 47/47 全部脚本的**真实 DOM 装载**，
而非当前的「13 个关键脚本实装+ 47 个 `node --check` 语法检查」。

#### T12 勘察结论（v1.4，三分类实测）

> **数字修正**：DEV-PLAN 原文「32 处内联 `onclick`」与实测不符。
> 关键在于必须区分「静态HTML 属性」与「JS 字符串模板」——后者常被误计入。

| 分类 | 管辖指令 | 实测| 说明 |
| --- | --- | --- | --- |
| **A. 静态 HTML 内联事件属性** | `script-src` | **2 → 0** ✅ | `onclick="toggleTheme()"`（主题按钮）+ `onkeyup="chineseSearch()"`（语文搜索框）。前次勘察只搜 `onclick` 漏掉 `onkeyup`，且未剥离 6 个内联 `<script>` 块内的字符串模板 |
| **B. 内联 `<script>` 块** | `script-src` | **6 块 / 2481 行** | #1 全局错误兜底 44 · #2 主题引导 32（**须 body 渲染前同步执行，否则首屏闪白**）· #3 主逻辑 2261（最大障碍）· #4 首页折叠 92 · #5 统一主题切换 49 · #6 SW 注册 3 |
| **C. JS 生成的内联事件属性** | `script-src` | **js/ 371 处 + index.html 内联脚本内 25 处** | `js/*.js` 分布：click 307 / change 29 / input 18 / mouseover 6 / mouseout 7 / keypress 3 / mousedown 1。**这部分才是移除 `unsafe-inline` 的真实主体工作量**，DEV-PLAN 的「32 处」严重低估 |
| **D. 内联样式** | `style-src` |静态 `style` 属性 37 + `<style>` 块 2（15+289 行）+ JS 样式写入 3684 + `cssText` 41 | 依赖 T3-3推迟的「JS 内联色改类名 + 令牌」，是 `style-src` 去除 `unsafe-inline` 的根因 |

**分步路线（script-src 去 `unsafe-inline`）**：

1. ✅ **A 类清零**（本次已完成）——静态 HTML 标签上不再有任何 `on*` 属性
2. ⬜ **C 类改造**（主体工作量，371 + 25 处）——按 `data-action` 约定改委托；
   `js/*.js` 已有的 `data-action` 机制（english-tools 26 处 / english-vocabulary 17 处 /
   global-search 1 处）可直接复用模式
3. ⬜ **B 块外置**（2481 行）——#3 主逻辑 2261 行需抽为 `js/main-inline.js`；
   #2 主题引导（32 行）**不能简单外置**，它必须在 `<body>` 渲染前同步执行以防闪白，
   须改为「外部脚本 + 阻塞 `<script>`（无defer）或 CSS 预置dark 兜底」
4. ⬜ 门禁加严：`check:csp` 的 A1 断言已是硬门禁；待C/B 完成后追加断言并收紧 meta CSP

**已落地的改造（T3-4c）**：

- `onclick="toggleTheme()"` → `data-action="toggle-theme"` + 文档级委托
  （注册在「统一主题切换」IIFE 内，因 `apply`/`current` 只在该作用域可见）
- `onkeyup="chineseSearch()"` → `data-action="chinese-search"` + `keyup` 委托
  （注册在主 IIFE 内 `chineseSearch` 定义之后）
- **委托必须挂在对应 IIFE 内而非 `app.js` 的 `DOMContentLoaded`**——两个触发元素都位于
  该 IIFE 所在 `<script>` 之前，等 `DOMContentLoaded` 会导致首屏交互无响应
- `window.toggleTheme` **保留导出**（`js/*.js` 的 371 处事件属性仍引用它）
- 新增门禁 `scripts/check-csp-inline.mjs`（`check:csp`）——3 条断言：
  A1 静态内联事件属性 = 0 / A2 两个 `data-action` 标记各1 处 / A3 `window.toggleTheme` 仍导出。
  该脚本同时输出 A/B/C/D 四类完整清点，供后续改造跟踪基线

### T3-5 · 内容扩充（需人力，非代码） — ✅ 代码侧结项（缺口量化 + 规范 + 门禁；**题目内容待人力**）

- 建议目标：每科 ≥ 260 道**原创**题（对比 2018-2026 真实学情）
- 提交规范：**禁止**用 `fix-*.mjs` 批量生成，统一按 T1-6 的解析质量标准人工撰写

#### 缺口量化（v1.4 实测，权威口径）

> **数字修正**：本节原文记载的「1166 道/ 184·179·211·200·189·203」是 **T1-2 去重前**的
> 旧口径，已随v1.4 实际数据失效。实测 `data/exam-bank.json`：去重后**唯一真实题量
> 1301 道**，417 条历史重复已归档至 `data/_archive/duplicates-2026-10-19.json`。
> 门禁 `check:data` 实时校验「各科 `total` 之和 = `meta.totalQuestions` = 实际题量
> = 唯一 id 数」，故下表与仓库状态始终一致，不依赖人工同步。

| 学科 | 唯一题量 | `meta.total` | 目标 ≥260 | 缺口 | 完成度 |
| --- | --- | --- | --- | --- | --- |
| 物理 | 248 | 248 | 260 | **-12** | 95.4% |
| 化学 | 217 | 217 | 260 | **-43** | 83.5% |
| 生物 | 216 | 216 | 260 | **-44** | 83.1% |
| 数学 | 200 | 200 | 260 | **-60** | 76.9% |
| 语文 | 200 | 200 | 260 | **-60** | 76.9% |
| 英语 | 220 | 220 | 260 | **-40** | 84.6% |
| **合计** | **1301** | **1301** | **1560** | **-259** | 83.4% |

**结论修正**：去重后进度比原估乐观得多——物理仅差 12 道即达标，
**真正的缺口集中在数学 / 语文（各 -60）与生物 / 化学（各 -43/-44）**，
而非原文暗示的「数学语文英语仍偏薄」的均匀分布。建议排期按此缺口表重排。

**仍需注意的质量型缺口**（比数量更值得关注，来自 `check:content` 基线债务）：

| 项 | 数量 | 说明 |
| --- | --- | --- |
| 解析缺失 | 74 | 以英语为主 |
| 解析为空 | 171 | 以主观题为主 |
| 其他 C1-C10 基线债务 | 7 项 | `check:content` 当前 11 passed / 7 基线内 |

> 这 245 条解析缺口无法靠「批量生成」填补（正是 T1-6 红线所禁止的），
> 需人工逐条撰写——建议与题量扩充合并为同一批内容贡献任务。

#### 撰写规范（依据 T1-6 解析质量标准）

**硬性红线**（违反即门禁失败）：

1. **禁止**模板解析：解析不得以 `分析：{题干}。` 开头——这是 T0-5 修复的批量生成残留特征
2. **禁止**答案与解析冲突（`check:data` P0-1 规则已覆盖）
3. **禁止**内部备注泄漏：`PHY_2018_01` 类内部标记不得出现在题干 / 解析中
4. **禁止**用 `fix-*.mjs` 批量生成题目——`scripts/fix-*.mjs` 仅允许做格式归一，
   不得凭空构造题目内容

**解析质量正反例**：

| 反例（禁止） | 正例（要求） |
| --- | --- |
| `分析：A。` / `分析：该题选B。` | `分析：牛顿第二定律 F=ma，合力 5 N、质量 2 kg，故 a=2.5 m/s²。` |
| `解析：正确答案是 A` | `解析：斜面光滑时机械能守恒，mgh 全部转化为动能，求得 v=√(2gh)=14 m/s。` |
| 解析与题干无关（张冠李戴） | 解析必须引用题干中的**具体条件与数值**，逐步推导到答案 |

**提交前自查清单**：

- [ ] 该题 id 在学科内唯一；`check:data` 的 `total` 之和校验通过
- [ ] 四个选项文本互异、无「以上都对」类空泛选项；单选题只有一个正确答案
- [ ] 解析含**具体推导过程**（公式 / 数值代入 / 排除法），非模板句
- [ ] 解析不以 `分析：` + 题干原文 的形式开头
- [ ] 主观题已给`passage` 材料（T0-8 规则：144 道带 passage 的题须先渲染材料）
- [ ] 新增题同步更新该科 `meta.total`（`check:data` 会拦截遗漏）
- [ ] `npm run verify` 全绿后提交

> **本阶段不生成任何题目内容**——T3-5 明确「需人力，非代码」，代码侧只负责
> 缺口量化、撰写规范与门禁兜底。

---

## 2. 门禁升级总表（一次性建立，长期收益）

| 门禁 | 现状 | 目标 | 覆盖缺陷 |
| --- | --- | --- | --- |
| `check:data` | 结构校验 | + 语义规则 8 条 | P0-1 ✅ P0-3 P0-4 P1-5 P1-6 P1-7 P0-2 |
| `check:collisions` | 检出但不失败 | exit 1 + 规则扩面 | P1-1 未来同类 |
| `test` | progress 单测 12 项 | + 存储清除/迁移单测 | P0-8 P1-4 |
| `test:smoke` | 13/47 脚本 | 47/47 + DOM id 断言 | P0-5 P0-7 大量未测模块 |
| `check:lint` | **不存在** | 裸 localStorage / 重复实现 / 内联色扫描 | P1-4 P1-11 P2-1 |
| `check:content` | **不存在** | 解析质量 / 模板解析 / 分科分布 | P1-7 P0-2 |

**建议 `npm run verify` 目标形态**：

```json
"verify": "npm run check:data && npm run check:collisions && npm run check:theme && npm run check:csp && npm run check:lint && npm run check:content && npm run check:runtime && npm run test && npm run test:smoke"
```

> **v1.4 已落地**：上述形态含 `check:theme`（T3-3 新增，第三环）、`check:csp`
> （T3-4c 新增，第四环）与 `check:runtime`（T3-1/T3-2 新增，第七环）；
> `check:lint` / `check:content` 按「基线内技术债只提示不失败」策略运行
> （当前 2 / 7 项基线债务）。

---

## 3. 风险登记

| # | 风险 | 等级 | 缓解 |
| --- | --- | --- | --- |
| R1 | **T1-3 换位再次制造内容错误** | 高 | 换位前先落地 T0-3 的"解析/答案冲突"规则；`balance-answers.mjs` 默认 dry-run + 必须跑 `--apply` 后再 `validate-data` |
| R2 | **T1-2 去重导致用户已有的错题引用失效**（按 id 索引的错题本） | 中 | 归档而非删除；`error-notebook` 的 id 引用加映射表；迁移前导出备份 |
| R3 | **T1-4 考点对齐是内容工作，工期不可控** | 中高 | 拆成"代码抽离别名表到 JSON"（1 天）+ "内容补全"（按学科排期）两件事分别跟踪 |
| R4 | **T0-2 冒烟扩到 47/47 后暴露大量新失败** | 中 | 允许一次性"标注已知失败"白名单，但**每条必须带 issue 号**，防止白名单变成垃圾桶 |
| R5 | **T2-3 存储收敛丢用户学习记录** | 中 | 逐 key 迁移 + 单测；先上线"只读兼容"版本一个迭代，再切写入 |
| R6 | **T3-3 暗色令牌化视觉回归面大** | 中高 | ✅已缓解：computed-style 逐元素回归（明暗双态 × 九科 × 双模式）零差异；`check:theme` 门禁防回退 |
| R7 | **文档持续失真**（本次 10 处不一致） | 中 | 新增 `docs/CLAIMS.md`：列出所有对外宣称的能力 + 对应实现位置 + 一键核验脚本；CI 跑该核验 |

---

## 4. 里程碑与验收线

| 里程碑 | 包含任务 | 验收线 |
| --- | --- | --- |
| **M0 · 门禁可信** | T0-1 ~ T0-5 | 故意制造 3 类缺陷，CI 全部变红；`verify` 覆盖 47/47 脚本 |
| **M1 · 内容正确** | T1-1 ~ T1-6 | 解析/答案冲突 = 0；同题干重复 = 0；分科字母占比 ≤ 32%；考点解析率 ≥ 70%（物理 ≥ 85%）；55 道尖括号题显示正常 |
| **M2 · 功能可用** | T2-1 ~ T2-6 | 仪表盘 4 个模块均非空；清除数据后刷新不复活；导出备份含全部数据；README 特性表与实现一一对应 |
| **M3 · 体系与体验** | T3-1 ~ T3-5 | 6 科色相互异；PWA manifest 零告警；`theme-dark.css` hex < 100（按声明值口径实测 = 0，T3-3） |

**每项任务的通用验收线**：`npm run verify` PASS，且在分支上完成后再合入 `main`（沿用 README 既有协作策略）。

---

## 3.5 Sprint 0 / 0.5 执行结果（已完成）

**结论：T0-1 ~ T0-19 全部完成，Sprint 0 与 Sprint 0.5 关闭。** 三个提交：`cf43791` / `eb3582b` / `b0566c1` / `1a5e6f4`。

| 任务 | 状态 | 落地方式 |
| --- | --- | --- |
| T0-1 | ✅ | 碰撞扫描覆盖 `var/function/window.X=`，`exit(errors>0?1:0)`；顶层判定用「列 0 缩进」 |
| T0-2 | ✅ | 由 `runtime-defer-check.mjs` 承担：52 个脚本全执行 + 73 项断言 |
| T0-3 | ✅ | `check-content.mjs` C1~C10，指标在**去重视图**（1166 唯一题）上计算 |
| T0-4/5 | ✅ | 5 个脚本移入 `scripts/legacy/` 并加熔断；CI 含 3 项门禁自检 |
| T0-6 | ✅ | `syncModules()` 在 7 个调用点实时回填，删除失效捕获值覆写 |
| T0-7 | ✅ | `MODULE_KEY_ALIAS = { concepts: 'knowledge' }` |
| T0-8 | ✅ | **实测 245 道**无选项题（原报告 171），全部有作答区；passage 先渲染 |
| T0-9 | ✅ | `SECTION_ID_ALIAS` 14 条 + 目标存在性校验后再清 active |
| T0-10 | ✅ | 8 处 `toggleNav` 清零；`window.chineseSearch` 导出 |
| T0-11 | ✅ | `parseFormula` 改递归下降（8 用例），括号/嵌套/结晶水全对 |
| T0-12 | ✅ | 事件委托白名单补 `math/chinese/english` |
| T0-13 | ✅ | `ct-timer` id + 叶子节点 textContent；`.bind(this)` 移除；`_retry` 记忆配置 |
| T0-14 | ✅ | `../data/` → `data/`；`#main-content` → `<main>`；打卡契约并入 T0-17 |
| T0-15 | ✅ | 删除 `missing-tools.js`（40KB，3 个导出全仓引用 0） |
| T0-16 | ✅ | `container.dataset.picked` 记录用户选择，计分不再读背景色 |
| T0-17 | ✅ | `HSPCBStore` 归一化 API；**顺带修 P0-8「清除数据复活」** |
| T0-18 | ✅ | `TYPE_MAP` 题型映射 **0/19 → 19/19 命中**；`TAB_ROUTES` 搜索路由 |
| T0-19 | ✅ | 数学/语文 4 个动态 tab 接线 |

### 关键发现（与原报告有出入，已按实测修正）

1. **无选项题是 245 道不是 171 道** —— 报告漏统计了数学 83 + 语文 88 的一部分。
2. **`hspcb_wrong_records` 有写入方**（`auxiliary-tools.js:268`、`study-enhanced.js:739`），报告"无写入方"结论有误。
3. **P0-2 的"分科偏斜"主要由 552 条题干冗余副本放大** —— 去重后物理 D 39% → C 29.3%，实际已均衡。
4. **`#main-content` 不存在**，真实容器是 `<main>`（index.html:129）。

### 门禁自检（每项都经注入缺陷验证会 exit 1）

碰撞重名 / 解析答案矛盾 / 解析期捕获 / 组卷映射回退 / 打卡 remove 不清旧 key / `_retry` 崩溃 —— 6 类注入均正确变红，还原后全绿。

**当前 `npm run verify`**：runtime 73 + lint 12 + content 11 + smoke 43 = **139 项断言全绿**，另有 11 项基线内技术债仅提示不失败。

---

## 5. 立即可执行清单（本周）

按"改动小、收益大、风险低"排序，建议照此顺序动手：

| 序 | 动作 | 预计 | 收益 |
| --- | --- | --- | --- |
| 1 | `check-global-collisions.mjs` 的 `process.exit(0)` → `process.exit(bad ? 1 : 0)` | 1 行 | **最高杠杆**：让门禁重新具备失败能力 |
| 2 | `index.html:2026-2028` 的 `CD/PS/CE` 改为函数内实时读 `window.*` | 30 分钟 | **平台区 8 个 tab + 3 科 checklist + 2 个工具 + 2 处假错误页**同时恢复 |
| 3 | `concepts → knowledge` 映射从 `index.html:3814` 死块移入 `app.js:1232` | 30 分钟 | **三科默认 tab「核心概念」从"开发中"变成 500+ 行真实内容** |
| 4 | `app-exam.js:547` → `(exam.options \|\| []).map(...)` + 补主观题/材料分支 | 2 小时 | 74 题不再崩溃、171 题可作答、144 题有材料 |
| 5 | 14 处 `navigateTo` 目标 id 修正 + `app.js:1199` 加 warn | 1 小时 | 消除"整页空白" |
| 6 | 删 8 个 `toggleNav` 属性 + `window.chineseSearch` 导出 | 10 分钟 | 消除 8 处 ReferenceError + 语文搜索可用 |
| 7 | `content-deep-v3.js:1126` 计时器兜底 + `missing-tools-part2.js:396` 去掉 `.bind` | 1 小时 | 秒杀技巧库 UI 不再被清空、计时训练可用 |
| 8 | `content-enhanced-v2.js:34/1086` 的 `../data/` → `data/` | 5 分钟 | 两个训练器不再永远"加载中" |
| 9 | `smoke-app.mjs` 的 `loadOrder` 改为从 `index.html` 动态解析 | 1 小时 | 覆盖率 13/47 → 47/47 |
| 10 | `balance-answers.mjs` 补「解析含答案字母引用则不换位」规则并接入 verify | 1 小时 | 防止 P0-1 再次回归 |
| 11 | `parseFormula` 支持括号（`app-chemistry.js:21-33`） | 2 小时 | 化学配平不再给错答案 |
| 12 | `dedupe-by-content.mjs`（新脚本，先 dry-run 出归档清单） | 2 小时 | 题量口径回归真实 |
| 13 | `learning-tools.js:883-886` 清除逻辑补删 v1 裸 key + 补单测 | 30 分钟 | "清除数据"真正生效 |
| 14 | `study-dashboard.js` 拆 try/catch + 改读实际写入的 key | 1 小时 | 仪表盘 4 个模块不再恒空 |
| 15 | 统一 `hspcb_daily_checkin` 结构（对象 vs 数组） | 30 分钟 | 连续打卡天数不再恒为 0 |
| 16 | `index.html` 3 张内联色卡片改令牌类 + `tokens.css` 补 `--english` | 1 小时 | 6 科色相互异 |
| 17 | `manifest.json` 名称/图标/shortcuts 修正 | 1 小时 | PWA 可安装 |
| 18 | `fix-phase-a-data.mjs` 移入 `scripts/legacy/` 并加熔断 | 15 分钟 | 防止重跑覆盖已修数据 |
| 19 | 删 `missing-tools.js`（40KB 死代码）+ `index.html` script 标签 | 30 分钟 | 减重 40KB、消除维护陷阱 |
| 20 | 抽 `TOPIC_ALIAS_MAP` 到 `knowledgePoints-thesaurus.json` 并扩表 | 3 小时 | 错题归因可用 |

> **第 1–8 项合计不超过半天，却能让应用从"大面积静默失效"变成"基本可用"。强烈建议先做这 8 项** —— 它们不依赖任何数据治理工作，回报最直接。
> 第 9 项（冒烟扩面）必须紧随其后，否则下一次改版还会踩同样的时序坑。

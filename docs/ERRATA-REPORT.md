# 深度勘误报告 — High-School-Physics-Chemistry-and-Biology-Study-Bundle

> 审阅日期：2026-10-19 · 审阅范围：全仓 110 个文件（`1.1/` 归档 17 · `1.2/` 活跃 88 · `scripts/` 16 · 文档/CI 4）
> 方法：全量通读 + 机械实证（`node` 脚本逐项复算，非目视抽查）· 基线提交 `a37369e`（v1.3）
> 结论一句话：**现有门禁"全绿"是假绿** —— `npm run verify` 覆盖不到本次发现的 8 项 P0 中的任何一项。
> 增补（2026-10-21，T3-4d CSP 改造期）：新发现 2 项（P0-20 / P1-46），均已随改造修复，见 §1.9。

---

## 0. 阅读指引

| 严重度 | 含义 | 本次数量 |
| --- | --- | --- |
| **P0** | 内容/功能正确性错误，学生端直接可见 | **20**（P0-1、P0-20 已修复，其余 18 项待处理） |
| **P1** | 功能降级、架构失效、一致性缺陷 | **63** |
| **P2** | 卫生问题、文档漂移、优化项 | **35** |

> 所有条目均给出 `文件:行` 与可复现命令。**已修复项**标注 ✅ 并附复验结果；**未修复项**在 `docs/DEV-PLAN.md` 中有对应任务号。

---

## 1. P0 级缺陷

### P0-1 ✅已修复 · 161 道题的解析与答案键自相矛盾

**位置**：`1.2/data/exam-bank.json`（1718 题中 161 题）· 根因 `scripts/balance-answers.mjs`

T8「答案分布均衡化」把正确选项的**内容**在 A/B/C/D 之间整体互换，并同步修改了 `q.answer`，**但没有同步改写解析正文里以自然语言写死的字母**。

**铁证**（`git show` 对比 `ee3b550^` 与 `ee3b550`）：

```
变更前 (ee3b550^)  answer : A
                  options: ["a = 3 m/s²，t = 6 s", "a = 4 m/s²，t = 2 s", ...]
                  analysis: ...故 a = 3 m/s²，t = 6 s，选 A。      ← 一致

变更后 (ee3b550)   answer : D
                  options: ["a = 3 m/s²，t = 2 s", "a = 4 m/s²，t = 2 s", ..., "a = 3 m/s²，t = 6 s"]
                  analysis: ...故 a = 3 m/s²，t = 6 s，选 A。      ← ❌ 矛盾
```

学生作答 D（内容 `a=3 m/s², t=6s`）判为正确，展开解析却写「选 A」（A 现为 `a=3 m/s², t=2s`，错误值）。**解析在自我否定。**

- 冲突分布：物理 110 / 化学 50 / 数学 1
- 冲突题中解析显式引用答案字母的有 1040 道，即 **16.5% 的引用字母题是错的**
- 根因：`balance-answers.mjs:18-20` 的 `POSITION_REF` 只防"位置引用词"（以上/同上），**没有任何规则处理"答案字母引用"**

**修复**：新增 `scripts/fix-answer-analysis-mismatch.mjs`，用 git 还原换位前布局，建立 `旧字母 → 旧内容 → 新字母` 映射后重写解析。

```
已修复（解析字母重映射）: 161    需人工复核: 0
复验：解析/答案冲突 161 → 0
```

**防回归**：`scripts/validate-data.mjs` 新增硬错误规则「解析声明的答案字母必须与 `answer` 一致」，并在校验摘要中输出 `解析/答案冲突 N`。规则在三个历史版本上的表现（证明可拦截回归）：

| 版本 | 冲突题数 |
| --- | --- |
| `ee3b550^`（T8 之前） | 1 |
| `ee3b550`（T8 之后） | **161** |
| 修复后 HEAD | **0** |

---

### P0-2 · 答案分布均衡只做了全局，分科仍严重偏斜

**位置**：`1.2/data/exam-bank.json`

README 与 CHANGELOG 声称「选择题答案分布均衡至 **368/368/366/368**」。该数字在**全局聚合**上成立，但学生是**按学科筛选后刷题**的，分科分布才是实际体验：

| 学科 | A | B | C | D | 偏斜 |
| --- | --- | --- | --- | --- | --- |
| 物理 | 56 | 34 | 120 | **134** | D 占 39% |
| 化学 | 57 | 91 | 95 | 98 | 尚可 |
| 生物 | 147 | 113 | 70 | 83 | A 占 36% |
| 数学 | 43 | 37 | 25 | **12** | D 占 10% |
| 语文 | 33 | 28 | 25 | 26 | 尚可 |
| 英语 | 34 | 66 | 31 | **15** | D 占 7% |

**做物理题，"D" 是 39% 的正确答案；做数学题，"D" 只有 10%。** T8 的目标（防止学生用「猜 C/D」策略）在学生真正使用的分科视角下并未达成。

**根因**：`balance-answers.mjs:43-54` 的配额 `target = Math.round(total / 4)` 是**全库**目标，没有按学科分桶。`scripts/balance-answers.mjs` 也未接入 `npm run verify`。

---

### P0-3 · 「错题归因」旗舰功能的数据链断裂

**位置**：`1.2/data/exam-bank.json` ↔ `1.2/data/<subject>/knowledge.json` ↔ `1.2/js/learning-path-recommender.js:142-157`

README 头条功能是「标记错题，**自动归类到对应知识点**，生成个性化复习计划」。实现链路是：题目的 `knowledgePoints` → `resolveTopicName()`（别名表 → 双向包含 → 原值）→ 匹配 `knowledge.json` 的 topic 名。

**实测解析率**（用 `learning-path-recommender.js` 里的**原样** `TOPIC_ALIAS_MAP` 与 `resolveTopicName` 复算全部 1718 题）：

| 学科 | 题目考点数 | 命中 knowledge topic | 命中率 | **无法归因的题目** |
| --- | --- | --- | --- | --- |
| 物理 | 70 | 41 | 59% | 119/344（35%） |
| 化学 | 76 | 22 | 29% | **305/341（89%）** |
| 生物 | 79 | 30 | 38% | 249/413（60%） |
| 数学 | 239 | 46 | 19% | 116/200（58%） |
| 语文 | 255 | 22 | **9%** | 126/200（63%） |
| 英语 | 233 | 36 | 15% | 84/220（38%） |
| **合计** | **952** | **197** | **20.7%** | — |

别名表（`learning-path-recommender.js:30-119`）为物理做了较好的覆盖，但**数学/语文/英语几乎未覆盖**（各约 20 条别名，对应 233–255 个考点）。未命中示例：语文 `成语辨析`/`病句辨析`/`劝学名句`，英语 `过去完成时`/`if only用法`/`情态动词表推测`，化学 `化学平衡`/`化学计算`/`硫酸工业制法`。

**后果**：对约 60% 的题目，"错题 → 知识点 → 复习计划"这条链走不通；学习路径推荐会给不出针对性的复习建议。

---

### P0-4 · 164 道纯副本题仍在题库里，题量虚高 32%

**位置**：`1.2/data/exam-bank.json`

CHANGELOG 写「165 个重复题 id 去重」。实际做法是**改名而非删除**：`scripts/fix-duplicate-question-ids.mjs:26-38` 遇到重复 id 时追加 `_dup2` 后缀。

- 165 道题带 `_dup2` 后缀，其中 **164 道是逐字节完全副本**（题干/选项/答案/解析全同）
- 唯一有差异的 1 道：`chemistry/CHEM_2019_09_dup2`（选项与答案不同）
- 按「学科 + 题干」去重后的**真实唯一题量**：

| 学科 | 声明 | 实际唯一 | 冗余 |
| --- | --- | --- | --- |
| 物理 | 344 | 184 | **160** |
| 化学 | 341 | 179 | **162** |
| 生物 | 413 | 211 | **202** |
| 数学 | 200 | 200 | 0 |
| 语文 | 200 | 189 | 11 |
| 英语 | 220 | 203 | 17 |
| **合计** | **1718** | **1166** | **552（32.1%）** |

**后果**：README/CHANGELOG 宣称的"1718 题"实际只有 **1166 道不同题目**；学生会在练习中反复遇到同一题；"去重 165 个 id"的成果是假的。

`validate-data.mjs:287-291` 只查 id 唯一性，**查不出内容重复**。

---

### P0-5 · 14 条选项渲染路径中 13 条不转义，55 道含 `<` `>` 的题目会显示错乱

**位置**：渲染点分布如下（`innerHTML` 拼接）：

| 文件:行 | 是否转义 |
| --- | --- |
| `js/app-exam.js:547` | ✅ `this._esc(opt)` |
| `js/app-biology.js:1407, 1625, 2146` | ❌ |
| `js/app-chemistry.js:519` | ❌ |
| `js/enhanced-tools.js:746, 2057` | ❌ |
| `js/auxiliary-tools.js:410` | ❌ |
| `js/guangdong-features.js:462` | ❌ |
| `js/missing-tools.js:91` | ❌ |
| `js/missing-tools-part2.js:288` | ❌ |
| `js/study-enhanced.js:642` | ❌ |
| `js/exam-review-system.js:546` | ❌ |

**受影响数据**：55 道题的题干/选项/解析含 `<` 或 `>`，其中 **12 道的选项文本**含尖括号（点开答题即错乱）：

- `chemistry/CHEM_2018_01` 题干含 `填"<"或">"`，**4 个选项全部含 `<`**
- `chemistry/CHEM_2021_42` options[1]=`<7`、options[2]=`>7`
- `physics/PHY_2021_42` options[0]=`u<f`、options[2]=`u>f`
- 数学 45 道题受影响（`MATH_2023_08` / `MATH_2020_46` / `MATH_2026_99` 等）

浏览器会把 `<7`、`<f` 当作标签起始符解析，**文本被吞掉、DOM 结构被破坏**。这既是显示缺陷，也是 XSS 入口。

`CommonUtils.escapeHtml`（`js/common-utils.js:12`）实现正确，但**全仓仅 `app-exam.js` 一个调用方**。

> **文档失真**：CHANGELOG 称「T3：app-exam 渲染路径统一 `escapeHtml`」——该说法对 `app-exam.js` 成立，但 OPTIMIZATION-TASKLIST 的 P0-2 问题描述「app.js / app-exam.js 等 5 个主 app 文件 **0 次调用**」已被标为 ✅ 完成，**实际全仓 44 个文件有 `innerHTML` 赋值、仅 4 个文件调用转义**（`index.html` 自身就有 120 处 `innerHTML`）。

---

### P0-6 · 质量门禁形同虚设

**位置**：`scripts/` · `.github/workflows/verify.yml`

`npm run verify` 全绿，但存在 6 处结构性漏洞：

| # | 缺陷 | 位置 | 后果 |
| --- | --- | --- | --- |
| 1 | **碰撞扫描永远不失败** | `scripts/check-global-collisions.mjs:35` `process.exit(0)` | 检出 DUP 也只打印，CI 步骤「全局声明碰撞扫描」是空门禁 |
| 2 | **碰撞规则过窄** | 同上 `:15` `^(?:const\|let\|class)\s+` | 漏 `var` / `function` / 缩进声明；**漏 `window.X =` 覆盖式冲突**（见 P1-1） |
| 3 | **冒烟只覆盖 13/47 脚本** | `scripts/smoke-app.mjs:141-155` | 34 个模块从未在假 DOM 里加载过 |
| 4 | **硬编码题量** | `scripts/smoke-app.mjs:202` `n === 1718` | 题量一变即误报失败 |
| 5 | **3 个诊断脚本未接入 npm** | `static-bug-scan.mjs` / `deep-bug-scan.mjs` / `handler-integrity.mjs` | `package.json:7-15` 只有 4 个脚本；`handler-integrity` 每次报 79 条"potentially missing exports"但从不影响退出码 |
| 6 | **校验器只查结构不查语义** | `scripts/validate-data.mjs` | P0-1/P0-3/P0-4 全部漏检 |

`handler-integrity.mjs` 实际输出（供参考，含大量正则误报，但**从未被门禁消费**）：

```
onclick root symbols checked: 247
potentially missing exports: 79
  window.frameworkAnswerTrainer._selectFramework
  window.experimentTable._switchSubject
  window.englishSentenceAnalyzer._analyzeCustom  ...
```

---

### P0-7 · 学习仪表盘与游戏化系统读的是**无写入方**的 key

**位置**：`js/study-dashboard.js:17, 22, 27, 32` ↔ `js/gamification-system.js:97, 116, 124, 134, 135, 450, 470`

对 `1.2/js/` 全量做「写点（`setItem` / `HSPCBStore.set` / `HSPCBProgress.set|append`）」与「读点（`getItem` / `HSPCBStore.get` / `HSPCBProgress.get`）」的机械比对：

| key | 写入方 | 读取方 | 结果 |
| --- | --- | --- | --- |
| `hspcb_exam_history` | **无** | `gamification-system.js:116`、`study-dashboard.js:17` | ❌ 读到空 |
| `hspcb_error_notebook` | **无** | `gamification-system.js:135`、`study-dashboard.js:22` | ❌ 读到空 |
| `hspcb_game_scores` | **无** | `study-dashboard.js:27` | ❌ 读到空 |
| `hspcb_recitation_scores` | **无** | `study-dashboard.js:32` | ❌ 读到空 |
| `hspcb_wrong_records` | **无** | `gamification-system.js:134` | ❌ 读到空 |
| `hspcb_quiz_records` | **无** | `gamification-system.js:97, 450` | ❌ 读到空 |
| `hspcb_study_time` | `data-analysis-enhanced.js:498` | **无** | ⚠️ 写了但没人读 |
| `mockExamHistory` | `mock-exam.js:791` | `mock-exam.js:777` | ✅ 自洽（但与 v2 侧不通） |
| `hspcb_daily_checkin` | `learning-tools.js:817` | `gamification-system.js:124, 470`、`learning-tools.js:632` | ✅ 自洽 |

**后果**：学习仪表盘 4 个模块（考试历史 / 错题本 / 游戏成绩 / 背诵成绩）**全部恒为空**；游戏化系统读到的错题数、刷题数、模拟考次数**恒为 0**（`stats.mockCount`、`stats.wrongCount` 等永远取不到值）。而这些数据**其实被写进了别处**（`HSPCBProgress` 的 `hspcb.v2.wrongQuestions` / `hspcb.v2.quizRecords` / `hspcb.v2.examHistory`），只是**两套命名空间之间没有桥**。

**附带缺陷**：`study-dashboard.js:15-37` 把 4 次 `JSON.parse` 包在**同一个 try/catch** 里，任一 key 数据损坏则 catch 静默吞掉异常，4 个数组全部退化为空数组，无任何日志。

---

### P0-8 · 「清除所有学习数据」无法真正清除，重启后数据复活

**位置**：`js/learning-tools.js:881-892` ↔ `js/progress.js:489-509`

```js
// learning-tools.js:883
(window.HSPCBStore ? HSPCBStore.remove('hspcb_wrong_records') : localStorage.removeItem('hspcb_wrong_records'));
```

`HSPCBStore.remove`（`progress.js:506-509`）**只删 `hspcb.st.<key>`**，不删 v1 裸 key `hspcb_wrong_records`。而 `HSPCBStore.get`（`progress.js:489-499`）在首次访问某个 key 时：

```js
if (!migratedKeys[key]) {
    migratedKeys[key] = true;              // 内存缓存，每次页面加载重置
    var legacy = raw(key);                 // 旧 v1 key 仍在！
    if (legacy != null && raw(NS + key) == null) {
        localStorage.setItem(NS + key, legacy);   // ← 又搬回来了
    }
}
```

**完整链条**：用户点「清除所有学习数据」→ 只删了 `hspcb.st.*` → 旧 v1 key 仍在 → 刷新页面 → `migratedKeys` 是新页面上的新空对象 → 旧数据被自动搬回 `hspcb.st.*` → **数据复活**。

用户看到提示「数据已清除」，实际数据纹丝不动。

---

## 1.5 核心模块：大面积静默失效（`defer` + 解析期捕获）

> 这一组缺陷**互相放大**，是本次审计中影响面最大的部分。取证方式：按浏览器真实语义（无 `defer` 的在解析期执行、`defer` 的在解析完成后按 DOM 顺序执行）把 `index.html` 的 53 个脚本单元放进同一个 `vm.Context` 顺序执行，再用 headless Edge + CDP 驱动真实 DOM 复核。

### P0-10 · 解析期捕获 `CD` / `PS` / `CE`，三者永久为 `undefined`

**位置**：`1.2/index.html:2026-2028`

```js
// index.html:2023 起的内联脚本，解析期执行
var CD = window.ComprehensiveData;   // :2026
var PS = window.PlatformSystem;       // :2027
var CE = window.ContentEnhancer;       // :2028
```

但 `comprehensive-data.js` / `platform-system.js` / `content-enhancement.js` 都是 **`<script defer>`**（`index.html:2011/2013/2017`），**解析完成之后才执行**。因此这三个 `var` 在解析期捕获到的永远是 `undefined`，且**后续不会自动更新**（`var` 绑定已经定型）。

`index.html:2030` 的注释甚至写着「外部模块脚本带 defer，解析期尚未就绪 —— 平台初始化延后到 DOMContentLoaded」—— 作者意识到时序问题并把**初始化调用**推迟了，但**没有修捕获的变量本身**。

**连锁后果（runtime 实测）**：

| 位置 | 现象 |
| --- | --- |
| `index.html:3312` | 平台区 8 个 tab（`overview` / `round1` / `round2` / `bank` / `experiment-center` / `learning-path` / `teaching-apps` / `competition`）**全部**输出占位串「…平台模块加载中…」 |
| `index.html:2032` | `if (PS) { PS.init(); }` 永不执行 → `PlatformSystem.checklistData` 为 `undefined` → `platform-system.js:398` `this.checklistData[subject]` 抛 TypeError → 三科 checklist tab 显示「内容加载失败，请刷新重试。」 |
| `platform-system.js:248` | `getRound1Content` 读未初始化的 `this.round1Data[subject]` → runtime 实测 `TypeError: Cannot read properties of undefined (reading 'physics')` |
| `index.html:2087, 2111` | `if (!app || !CD || !CD.physicsInstruments) return;` → 物理测量仪器 / 化学器材容器**静默渲染空白**（runtime 实测 `len 0`，无任何提示） |
| `index.html:2134-2136, 2224-2226` | 渲染**假错误页**「综合数据文件 (comprehensive-data.js) 未正确加载」——而文件**确实已加载**，属于误导性报错 |

**修复**：在函数体内实时读取 `window.PlatformSystem` 等，或去掉这些模块的 `defer`。

---

### P0-11 · 「📖 核心概念」默认 tab 显示"该模块内容正在开发中…"

**位置**：`1.2/js/app.js:1232-1248` + `1.2/index.html:3810-3831`

UI 的 `data-module` 取值是 `concepts`（`index.html` 的 tab 列表），而 `app.js` 的 `subjectContent` 键是 `knowledge`（`app.js:13, 499, 834`）。**两者的映射 `concepts → knowledge` 只存在于 `index.html:3814`**，而它在一个**永不执行**的块里：

```js
// index.html:3810 —— 解析期 loadModuleContent 尚未定义（它在 defer 的 app.js 里）
if (typeof loadModuleContent !== 'undefined') {     // ← 恒为 false
    var origLoadModuleContent = loadModuleContent;
    window.loadModuleContent = function(subject, module) {
        var contentEl = document.getElementById(subject + '-content');
        if (module === 'concepts') module = 'knowledge';   // ← :3814 唯一映射点
        ...
        if (module === 'experiments') { renderPhysicsExperiments(...); ... }  // :3817-3819
        if (['round1','round2','bank','experiment-center'].indexOf(module) >= 0) {
            handleModuleTabClick(subject, module, contentEl);              // :3822
        }
    };
}
```

而真正生效的 `app.js:1232-1248` **没有任何映射**：

```js
if (subjectContent[subject]) {
    const content = subjectContent[subject][module] || '<p>该模块内容正在开发中...</p>';  // :1245
    contentEl.innerHTML = content;
}
```

**后果**（runtime 实测）：

- 物理 / 化学 / 生物的**默认 tab「📖 核心概念」** 全部显示「该模块内容正在开发中...」（`#physics-content` 的 innerHTML 长度实测 **20**，正是该占位串）
- `app.js` 中精心编写的 **500+ 行** `subjectContent.physics.knowledge` / `.chemistry.knowledge` / `.biology.knowledge` **完全取不到**
- 同一死块还独占 `renderPhysicsExperiments` / `renderChemistryExperiments` / `renderBiologyExperiments`（`index.html:3405/3527/3633`，约 **360 行**精细实验卡 HTML）与 `handleModuleTabClick`（`index.html:3765`）—— **全部永不可达**；三科「🔬 实验」tab 只能拿到 `app.js` 的粗版静态内容

**这是整个应用被用户看到的第一屏。**

**修复**：把 `concepts → knowledge` 映射移入 `app.js:1232` 的 `loadModuleContent` 内（或用 `MODULE_REGISTRY` 注册），不要放在依赖解析期时序的内联块里。

---

### P0-12 · 74 道英语题在详情页必崩，171 道题作答区为空

**位置**：`1.2/js/app-exam.js:547`

```js
${exam.options.map((opt, i) => ` ... `)}     // exam.options 为 undefined 时 TypeError
```

**实测数据**（`1.2/data/exam-bank.json`）：

| 情况 | 题数 | 题型分布 |
| --- | --- | --- |
| `options` 字段**完全缺失** | **74** | 语法填空 27 / 短文改错 23 / 书面表达 24（全部英语） |
| `options` 为**空数组** | **171** | 解答题 45 / 填空题 38 / 简答题 55 / 作文题 10 / 翻译题 9 / 默写题 14 |
| `options` 正常 | 1473 | — |

**后果**：
- 74 道英语题点「开始答题」→ runtime 实测 `showExamDetail('ENG_2018_26')` 抛 `TypeError: Cannot read properties of undefined (reading 'map')`，`#exam-detail` 保持 len=0 → **详情页空白**
- 171 道数学/语文主观题渲染出 **0 个 radio** 的空选项框 → **永久无法作答**
- 另有 **144 道**英语题带 `passage`（阅读理解 65 / 完形填空 29 / 语法填空 27 / 短文改错 23），`app-exam.js` **完全不渲染** → 阅读理解类题目**缺材料，无法作答**

**好消息**：字母答案与 `options` 的对应关系是干净的 —— 实测「字母答案但无有效 options」为 **0 题**，`answer` 索引越界 0 例。

**修复**：`app-exam.js:547` 改 `(exam.options || []).map(...)`，并为主观题/阅读题补填空与材料渲染分支。

---

### P0-13 · 8 处 `toggleNav` 从未定义 + 语文搜索框函数困于 IIFE

**位置**：`1.2/index.html:973, 983, 995, 1012, 1027, 1039, 1053, 1066` / `1.2/index.html:963, 4185`

| 处理器 | 定义情况 | runtime 实测 |
| --- | --- | --- |
| `onclick="toggleNav(this)"`（**8 处**） | **全仓库从未定义** —— grep 命中**仅这 8 个调用点** | 每次点击抛 `Uncaught ReferenceError: toggleNav is not defined`，并触发 `index.html:15` 的全局红色错误 toast。功能由 `initChineseSidebar` 的 `addEventListener` 兜住，但**每次点击都产生未捕获异常** |
| `onkeyup="chineseSearch()"`（`index.html:963`） | `chineseSearch` 定义在 `index.html:4185`，**位于 inline 脚本的 IIFE（2023–4254）内部**，未挂 `window` | `chineseSearch is not defined` → **语文搜索框完全失效**（无任何兜底） |

**修复**：删除 8 个 `toggleNav` 属性（事件已由 `initChineseSidebar` 绑定）；`window.chineseSearch = chineseSearch;`（如同 `index.html:4251-4252` 对 `showSection` 的处理）。

---

### P0-14 · 14 处 `navigateTo()` 目标 section id 不存在 → 整页空白

**位置**：`app-physics.js:14, 17`；`app-chemistry.js:562, 565, 568, 571, 574, 581`；`app-biology.js:198, 208, 215, 222, 229, 232`

`index.html` 重命名过 section（如 `electrochem-section` → `chemistry-electrochem-section`），JS 里的 `navigateTo()` 目标**没有同步**。

**后果**：`navigateTo` 先移除**所有** `.section.active`，再找不到目标 → **整页空白**。runtime 实测 `loadChemistryTool('electrochem')` 后 `active=[]`。用户可达路径：全局搜索 → `global-search.js:648/672/698` → `load*Tool()`。

`app.js:1199-1201` 在找不到目标时**不报警、不 return**，继续执行后续逻辑，进一步放大问题。

---

### P0-15 · 化学方程式配平给出**错误答案**（括号不解析）

**位置**：`1.2/js/app-chemistry.js:21-33`

`parseFormula` 的正则 `/([A-Z][a-z]?)(\d*)/g` **不处理括号**：

| 输入 | 实际解析结果 | 正确结果 |
| --- | --- | --- |
| `Ca(OH)2` | `{Ca:1, O:1, H:1}` | `{Ca:1, O:2, H:2}` |
| `(NH4)2SO4` | `{N:1, H:4, S:1, O:4}` | `{N:2, H:8, S:1, O:4}` |
| `Al2(SO4)3` | `{Al:2, S:1, O:4}` | `{Al:2, S:3, O:12}` |

**runtime 实测**：`tryBalance('Ca(OH)2 + HCl')` 输出「配平结果」`Ca(OH)2 + HCl → CaCl2 + H2O`，系数 `[1,1,1,1]`，左右原子数不等（Ca1O2H3Cl1 vs Ca1Cl2H2O1）—— **核心化学工具输出错误答案**。

**修复**：实现括号/方括号的递归计数。

---

## 1.6 其他核心模块缺陷

| 严重度 | 位置 | 缺陷 |
| --- | --- | --- |
| **P1** | `app-exam.js:710-711` | `d.maxTotal` **不存在**（`getProgressChart()` 只返回 `{year,total,correct,rate}`）→ `undefined` → `NaN` → `\|\| 0`；runtime 实测 **4 根柱高度全为 `height:0%`**，做题进度趋势图**永远空白**。应改用外层已算好的 `maxTotal`（`app-exam.js:702`） |
| **P1** | `app-biology.js:61-67` | `isEquilibrium` 用 `hardyWeinberg(p,q)` 与**由同一 p/q 算出的**期望值比较，是恒等式 → 即使 `selectionPressure=100`、`mutationRate=50` 仍恒为 `true` → 「⚠ 未达平衡状态」分支**不可达**，徽章恒为「✓ 接近 Hardy-Weinberg 平衡」。应与第 0 代（初始 p/q）比较 |
| **P1** | `index.html:4203-4215, 4242-4248` | `showSection('chinese-section')` 每次都重新 `initChineseSidebar()`，对同一批 `.nav-item-title` **重复 addEventListener** → runtime 实测**第 2 次进入语文区后点 1 次，title 仍是 `nav-item-title active`、child 仍是 `nav-children show`**（toggle 两次 = 净无变化）→ **语文侧边栏目录彻底失灵** |
| **P1** | `app-biology.js:1661` | `JSON.parse(HSPCBStore.getItem('wrongPhotosynthesis') \|\| '[]')` **无 try/catch**，且位于**对象字面量初始化位置** → 存储值损坏时**整个 `app-biology.js` 求值失败**，后续所有定义消失 |
| **P1** | `app-exam.js:849, 1164`；`app-chemistry.js:4656` | 渲染容器 id 与 index.html 不符：`pcr-simulator-app`（实际 `biology-pcr-sim-app`）、`gel-electrophoresis-app`（实际 `biology-electrophoresis-app`）、`equation-balancer-app`（无此容器）→ runtime 实测三者渲染后容器仍 len=0 → **PCR 模拟器 / 电泳模拟器 / 方程式配平Pro 完全空白** |
| **P1** | `index.html:3903-3904` | `window.ComprehensiveData = CD; window.PlatformSystem = PS;` 用**已失效的捕获值**覆盖全局。当前被后续 defer 脚本"抢救"回来，但这是**定时炸弹**：任一 defer 脚本被移除或后移即把真实模块置为 `undefined` |
| **P2** | `app-exam.js:226` | `selectedOption === exam.answer` 对非选择题恒 false → runtime 实测 `submitAnswer('MATH_2025_16','A')` → `isCorrect=false`、`correctAnswer="(1) a=1/2；(2) a≥1/2"` → **171 道非选择题永远判错**。应按 `type` 分流 |
| **P2** | `app-exam.js:369-471` | `renderExamDashboard` 一次性把 **1718 题**渲染进 innerHTML → runtime 实测 `#exam-content` innerHTML **1,163,471 字节（1.1MB DOM）**，进入考试区即产生巨量 DOM。应分页 / 虚拟列表 |
| **P2** | `app-exam.js:27-28` | `await fetch('data/exam-bank.json')` 未检查 `res.ok` → 404 时静默降级为内置 7 题 fallback 而非报错 |
| **P2** | `app-exam.js:274, 280` | `getOverallScore()` 返回字符串 `"0.0"`，`getSubjectScore()` 无作答时返回**数字 `0`** → 返回类型不一致 |
| **P2** | `app-exam.js:698, 704, 657-658` | `chartEl` / `querySelectorAll('.qs-item')[0]` 无 null 守卫 → runtime 实测未渲染考试面板时调用 `renderProgressChart()` 抛 `TypeError: Cannot set properties of null` |
| **P2** | `app-biology.js:1547-1555` | `submitAll()` 每次点击都 push 错题，**无去重、无已提交禁用** → 重复点击累积重复错题记录 |
| **P2** | `app.js:1199-1201` | `navigateTo` 找不到目标时**不报警、不 return** → 放大 P0-14 的"整页空白"，且无任何日志 |
| **P2** | `1.2/js/comprehensive-data.js` | 24KB 数据因 `CD` 捕获失效而**运行时 100% 死代码**（仅 `global-search.js:292` 仍在读 `window.ComprehensiveData`） |
| **P2** | `1.2/data/<subject>/knowledge.json` | `testPapers` 是对象 `{basic,intermediate,advanced}`（非数组）且**无任何 JS 读取**；`experiments` 物/化/生各 6 条、数/语/英各 0 条，且**无任何 JS 读取**；各科 `categories[]` 亦无消费者 |
| **P2** | `1.2/js/progress.js` | `HSPCBProgress`（`hspcb.v2.*` + v1→v2 迁移）**全仓库零业务采用** —— grep 显示整个 `1.2/js` 中 `HSPCBProgress` 仅出现在 `progress.js` 自身。迁移产物无人消费，所有模块走 `HSPCBStore`（`hspcb.st.*`）→ **v1 用户进度对业务模块实际不生效**，「统一存储层」名存实亡 |

---

## 1.7 工具模块（`1.2/js/` 12 个工具文件）

> 这一组的共同特征：**全部 12 个文件都不在 `smoke-app.mjs` 的 13 文件装载名单内**，因此门禁从未覆盖过它们。

### P0-16 · 「选择题秒杀技巧库」的计时器兜底会摧毁整个模块 UI

**位置**：`1.2/js/content-deep-v3.js:1126-1137`（渲染在 `:1068`）

```js
// :1128
var el = document.getElementById('ct-timer');
if(!el){
    var divs = document.querySelectorAll('#choice-tricks-app div');
    for(var i=0;i<divs.length;i++){
        if(divs[i].innerHTML && divs[i].innerHTML.indexOf('已用时')>=0){
            divs[i].innerHTML = '已用时: '+state.elapsed+'秒';   // ← 整体覆写
            break;
        }
    }
}
```

**`ct-timer` 全仓从未被创建**（唯一引用就是 `:1128` 这一处读取），所以兜底分支**必然执行**。而 `#choice-tricks-app` 的渲染是一次性拼出的大段嵌套 HTML（实测 68 个 div），`divs[0]` 就是最外层容器，其 `innerHTML` 必然包含 '已用时' → **被整体替换成一行「已用时: N秒」**。

**后果**：用户在"秒杀技巧库"点任一选项后 1 秒，整个模块（含技巧使用统计、秒杀技巧、提交按钮）被清空，**模块不可恢复**。

**修复**：给计时器容器加 `id="ct-timer"`；或改用 `querySelector` 精确定位叶子节点，**禁止用 `innerHTML` 整体覆写祖先**。

---

### P0-17 · 「计时训练」默认路径必崩（对数组调用 `.bind()`）

**位置**：`1.2/js/missing-tools-part2.js:396`

```js
if (sub === 'all') {
    Object.keys(this.bank).forEach(function(k) {
        pool = pool.concat(this.bank[k].map(function(q){ q.subject = k; return q; }).bind(this));  // ← .bind on Array
    }.bind(this));
}
```

`Array.prototype` 没有 `bind` → runtime 实测 `TypeError: this.bank[k].map(...).bind is not a function`。而 `tq-subject` 的默认值就是「🌐 全科综合」（value=`all`）→ **「🚀 开始计时训练」按钮在默认路径必崩，模块完全不可用**。

同文件 `:391` `document.getElementById('tq-subject').value` 亦无空值守卫。

**修复**：去掉 `.bind(this)`（`map` 回调内改用闭包 `k`）。

---

### P0-18 · 「再来一组」在结果页必崩（DOM 中已无 `#tq-*`）

**位置**：`1.2/js/missing-tools-part2.js:391-393, 466-467`

`_retry()` → `_start()` → `document.getElementById('tq-subject').value`，但结果页（`:358-387`）只含「再来一组 / 返回设置」两个按钮，**不含任何 `#tq-*`** → `TypeError: Cannot read properties of null (reading 'value')`。

**修复**：`_retry()` 改用 `this.state` 记忆的 subject/time/count 重建题池；`_start()` 内加空值兜底。

---

### P1-31 · 两个模块的数据文件路径多了一级 `../`，永远 404

**位置**：`1.2/js/content-enhanced-v2.js:34, 1086`

```js
_dataUrl: '../data/framework-questions.json',
_dataUrl: '../data/variation-bank.json',
```

页面在 `/1.2/`，`../data/` → `/data/`，**仓库根无 `data/` 目录**（实测 `Test-Path repo/data = False`）。仓库其余 4 处一律用 `'data/xxx.json'`（`app-exam.js:27`、`learning-path-recommender.js:190/805`）。

**后果**：`framework-questions.json` / `variation-bank.json` 404 → **框架答题训练器、变式推荐永远停在「题库加载中…」**（调用点 `:386-388` / `:406` 有 catch，故为静默失败）。

---

### P1-32 · 同一 localStorage key 的**结构契约冲突**（对象 vs 数组）→ 连续打卡恒为 0

**位置**：写 `1.2/js/learning-tools.js:816-817` ↔ 读 `1.2/js/gamification-system.js:124-125`

```js
// 写（对象 {日期: true}）
self.checkinData[today] = true;
HSPCBStore.set('hspcb_daily_checkin', JSON.stringify(self.checkinData));

// 读（按数组处理，对象被直接丢弃）
var checkin = safeParse(HSPCBStore.getItem('hspcb_daily_checkin'), []);
if (!Array.isArray(checkin)) checkin = [];     // ← 对象在此被丢掉
```

**后果**：打卡成功后，游戏化系统的 `stats.streakDays` **恒为 0**、`data.checkinDays` 恒为 `undefined` → **「连续打卡天数」永远是 0**。且 `learning-tools.js:726` 用 `Object.keys(...).length` 计数，与数组口径还差 1。

---

### P1-33 · `missing-tools.js` 整文件 100% 死代码

**位置**：`1.2/js/missing-tools.js`（40KB）

三个工具全部被 `app-chemistry.js` 的同名实现遮蔽，且**共用同一容器 id**：

| 工具 | 活实现 | 死实现（missing-tools.js） |
| --- | --- | --- |
| 化学实验室安全 | `app-chemistry.js:864` `chemistrySafetySystem`（容器 `chemistry-safety-app` @1227） | `:7` `chemistrySafetyQuiz`（同容器 @42） |
| 电化学可视化 | `app-chemistry.js:1477` `electrochemistryViewer`（`electrochem-app` @2072） | `:164` `electrochemistryViewerLite`（同容器 @179） |
| 有机物转化 | `app-chemistry.js:3322` `organicConverter`（`organic-converter-app` @3752） | `:305` `organicConverterLite`（同容器 @343） |

`index.html:2963/2968/2978` 调用的是 **app-chemistry.js 版**，死实现的导出符号**全仓引用数 0**。

> v1.3 的"const 重名"修复只是让 `missing-tools.js` **能解析**，**并未恢复任何功能** —— 这是一个"修了语法但功能仍然全死"的典型案例。

---

### P1-34 · 变式生成对**所有数字**做 ±20% 扰动，破坏化学方程式与答案自洽

**位置**：`1.2/js/auxiliary-tools.js:78-88`

```js
text.replace(/(\d+(?:\.\d+)?)/g, …)     // 作用于 stem 与 answer
```

方程式系数被独立随机化（`Cu+4HNO₃→Cu(NO₃)₂+2NO₂↑+2H₂O` → 系数不成比例、不配平）；`96500`（法拉第常数）、`6.4/64` 同步被扰动 → **答案与题干数值不自洽，学生无法验算**。

**修复**：只扰动"可解变量"，系数/常数需按方程式比例联动或列入白名单。

---

### P1-35 · 三个模块读 `hspcb_wrong_records`（无写入方），对新用户永远显示"暂无错题记录"

**位置**：`1.2/js/auxiliary-tools.js:272`、`1.2/js/study-enhanced.js:859`、`1.2/js/learning-tools.js:897`

规范写入方是 `HSPCBProgress.append('wrongQuestions', …)`（写到 `hspcb.v2.*`），而这三处读的是 `hspcb_wrong_records`（**全仓无写入方**）→ 错题变式生成 / 知识盲区热力图 / 学习报告对新用户恒空。

---

### P1-36 · `#main-content` 不存在 → `addNewSections()` 整段死代码，物质结构工具永不可见

**位置**：`1.2/js/content-enhancement.js:428`（连带 `:437-443`、`:1308`）

`index.html` 的 339 个静态 id 中**无 `main-content`** → `chemistry-structure-section` / `chemistry-structure-app` 永不创建；而 `global-search.js:53` 仍收录「物质结构工具」、`:642` 映射 `'chemistry-structure':'structure'` → **搜索可达、落地页不存在**。

---

### P1-37 · 错题内容未转义注入 innerHTML（存储型 XSS 面）

**位置**：`1.2/js/study-enhanced.js:1095, 396`；`1.2/js/missing-tools-part2.js:144`；`1.2/js/auxiliary-tools.js:381`

`e = r.error || r.userAnswer`（来自 localStorage / **导入的备份 JSON**）原样进 DOM；`value="' + (this.state.userAnswer || '') + '"` 属性未转义 → 可闭合属性注入。导入备份是**外部可控输入**。

---

### P1-38 · 工具模块内的其他确定缺陷

| 位置 | 缺陷 |
| --- | --- |
| `missing-tools-part2.js:235` | 答案索引与解析矛盾：`options:['=7','<7','>7','无法确定'], answer:1`（指向 B=<7），但正确答案应为 A(=7)（pH3 盐酸 + pH11 NaOH 等体积恰好中和），解析还写"故选A" → **答对被判错** |
| `missing-tools.js:339, 326` | 反应表产物错误：`{from:'benzene', to:'bromoethane', equation:'C₆H₆+Br₂→C₆H₅Br+HBr'}` —— 苯+溴的产物是**溴苯**不是溴乙烷；乙烯+溴的产物是 **1,2-二溴乙烷**不是溴乙烷 → 化学结论错误 |
| `utility-tools-v2.js:110-115` | 暂停期间倒计时继续走表（`pause()` 只累加 elapsed、不更新 `startTs`）→ 剩余时间被凭空吃掉 |
| `utility-tools-v2.js:65, 253-264` | 结束提醒节点 `{at:0.999}` 在剩余 59.94 秒就触发「时间到」并 `stop(false)` → 提前约 1 分钟结束且**不保存历史** |
| `missing-tools-part2.js:528-534` | 30 天计划里 `topics` 定义了 physics，但 `var subjects=['chemistry','biology']` → **物理学生被系统性排除** |
| `missing-tools-part2.js:405-406` | 题数静默截断：题库容量（物理 8 / 化学 7 / 生物 7 / 全科 22）小于界面提供的 5/10/15/20 → 选「物理+20题」实测只得 8 题，但 `answers` 数组长度仍为 20 |
| `learning-tools.js:292` | 术语条目正确词=错误词：`{correct:'干涉', wrong:'干涉'}` → 该题永远无法答对 |
| `learning-tools.js:331` | 提示文本自相矛盾：「嘌呤(líng)：注意右边不是"令"而是"令"」 |
| `learning-tools.js:337` | 偏旁标注错误：「馏」是**饣（食字旁）**，非酒字旁 |
| `learning-tools.js:970` | `self.reportData = arguments;`（`generateReport()` 无形参）→ 报告数据永远不可用 |
| `study-tools-v2.js:320, 419` | 番茄钟 `setInterval` 无卸载清理 → 离开模块后持续 `render()` 写已隐藏容器 |
| `content-enhancement.js:428` | 另：`index.html:2026-2028` 的 `CD/CE` 捕获失效使 24KB `comprehensive-data.js` 运行时 100% 死代码 |

---

## 1.8 互动练习 / 模拟考试 / 错题本（组 B 审计）

### P0-19 · 「互动练习」成绩**恒为 100%**

**位置**：`1.2/js/exam-review-system.js:602-610` ↔ `:635-640`

```js
// :602-606  判卷时无条件把正确项染绿
var correct = q.answer;
options.forEach(function(opt, i){
    if(i === correct){ opt.style.background = '#e8f5e9'; ... }   // ← 正确项永远绿
    else if(i === oidx && i !== correct){ opt.style.background = '#fce4ec'; ... }
});

// :635-640  计分时读回背景色来判断"用户选了哪个"
options.forEach(function(opt, i){
    if(opt.style.background === 'rgb(232, 245, 233)' && i === q.answer) selectedCorrect = true;
});
if(selectedCorrect) correct++;
```

计分读的��**背景色**，而不是用户的实际选择；而正确项无论用户选什么都会被染成 `#e8f5e9` → `selectedCorrect` **恒为 true**。

**runtime 实测**：故意选错（picked=2, correct=1）→ 反馈显示「❌ 回答错误，正确答案是B」，但成绩区显示「🎉 当前成绩：1/1 正确（100%）」。

**后果**：五科「✍️ 互动练习」的分数、进度条、错题本**全部失真** —— 学习者会看到"我答错了但成绩 100%"。

**修复**：在 `checkAnswer` 中记录 `container.dataset.picked = oidx`，`updateScore` 读 `+container.dataset.picked === q.answer`。

---

### P1-39 · 模拟考试「按题型抽题」永远落空（分组键与题库 `type` 词表零交集）

**位置**：`1.2/js/mock-exam.js:638, 666`

题库实际 `type` 词表（实测）：`选择题 / 实验题 / 计算题 / 解答题 / 填空题 / 默写题 / 简答题 / 作文题 / 翻译题 / 阅读理解 / 听力 / 完形填空 / 语法填空 / 短文改错 / 书面表达 / 工业流程 / 实验探究 / 有机化学 / 原理综合 / 遗传计算 / 曲线分析 / 实验设计 / 系谱图分析 / 生态分析 / 实验分析 / 综合分析`。

而 `mock-exam.js:666` 的槽位词表是 `单选 / 多选 / 填空 / 解答 / 实验 / 计算 / 现代文 / 文言文 / 诗词 / 语言运用 / 作文` → **与题库零交集**。

**后果**：`groups[lookupType] || []` 恒为空 → 静默退化为全池随机，「按题型抽题」是纯装饰。runtime 实测：数学模考 8 道「单选」中 **3 道无选项**（渲染成文本填空框）；物理「多选」槽拿到的是单选题却渲染成复选框。

**修复**：建立 `BANK_TYPE → SLOT` 映射表；找不到候选时**不要**静默放宽为随机。

---

### P1-40 · 主观题按精确字符串比对，**恒判错**

**位置**：`1.2/js/mock-exam.js:1108-1113`

```js
} else if (q.type === '解答') {
    isCorrect = (userAns === correctAns);      // ← 精确串比对
    ... Math.round(q.points * 0.3)             // 最多 30% 过程分
```

题库数学解答题的 `answer` 形如 `"(1) 0.243；(2) 0.960"`、`"(1) 1/8；(2) 3+2√2"` → 学生输入的内容几乎不可能与答案串完全相同 → **恒判错**，总分系统性偏低。

**修复**：改为「关键词命中」给分，或标记为「需人工判分」。

---

### P1-41 · `hspcb_error_notebook` **同 key 两种 schema** → 三个消费方恒空

**位置**：写 `1.2/js/error-notebook.js:16-19`（存**对象**）↔ 读 `study-dashboard.js:23-24`、`learning-path-recommender.js:233-235`、`gamification-system.js:135-136`（按**数组**读）

```js
// 写
var data = JSON.parse(raw);
if (!data.errors) data.errors = [];
if (!data.redoStats) data.redoStats = { totalAttempts: 0, totalCorrect: 0, sessions: [] };
return data;                                   // → {"errors":[…],"redoStats":{…}}

// 读
var data = safeParse(raw, []);
if (!Array.isArray(data)) return [];           // ← 对象在此被丢弃
```

**后果**：①「学习路径推荐」的薄弱知识点分析恒为空；②仪表盘错题数恒为 0；③成就「错题重做正确率」恒为 0。

---

### P1-42 · 数学 / 语文的 4 个动态 tab 是**死按钮**

**位置**：`1.2/js/exam-review-system.js:20, 35-53` ↔ `1.2/index.html:3858` ↔ `1.2/js/app.js:1258`

tab 在 `DOMContentLoaded` 的**后注册**监听器里才被追加（`exam-review-system.js:35-53` `tabsContainer.appendChild(b1..b4)`），而 `app.js:1258` 的逐 tab 监听在同一事件中**先注册**、已扫过 DOM；`index.html:3858` 的白名单 `['physics','chemistry','biology','platform']` 又排除 math/chinese。

**runtime 实测**：点 `#math-section` 的「✍️ 互动练习」→ `#math-content` 长度 `1114 → 1114` 不变，`#quiz-container-math` 不存在；同操作在 `#physics-section` 正常（`physLen=31149`）。

**后果**：数学/语文的「考情分析 / 一轮复习 / 二轮专题 / 互动练习」4 个 tab 全是死按钮。

---

### P1-43 · 全局搜索回退路径只切 section、**不渲染工具**

**位置**：`1.2/js/global-search.js:708-709` ↔ `1.2/js/app.js:1193-1217`

```js
if (typeof window.navigateTo === 'function') { window.navigateTo(toolId); }
```

`navigateTo()` 只做 `classList.add('active')`，不调用任何 `render()`。
**runtime 实测**：`navigateTo('math-grapher')` → `#math-grapher-app` innerHTML 长度 **0**；而 `navigateToolPage('math-grapher')` → **399**。

**后果**：搜索命中数/语/英/平台类工具（`data-tool` 共 122 个，物理/化/生仅 3 个有映射表覆盖）→ **目标页空白**。

---

### P1-44 · 英语完形填空 51 个空的正确选项**恒为 A**

**位置**：`1.2/js/subject-gap-2.js:759-825`

正则统计 51/51 个 `{ index: N, options: [...], answer: 0 }` —— 全部 `answer: 0`。**可被无脑通关**，「完形填空训练」失去训练价值。

---

### P1-45 · 遗传题答案键与解析矛盾

**位置**：`1.2/js/exam-review-system.js:421`

```js
options:['1/4','1/6','1/9','1/18'], answer:2, explanation:'…后代aa概率=2/3×1/4=1/6…'
```

`answer:2` 指向 `'1/9'`，但解析算出的是 **1/6**（index 1）→ **该题判分错误**。

---

### P2（组 B 补充）

| 位置 | 缺陷 |
| --- | --- |
| `exam-review-system.js:569` | `filterQuiz` 用**全局** `document.querySelectorAll('.quiz-filter-btn')` 选按钮，不按学科限定 → 同时打开两科练习面板时，点 A 科筛选会高亮 B 科按钮 |
| `exam-review-system.js:21` | 学科列表 `['physics','chemistry','biology','chinese','math']` **漏 `english`** → 英语无考情分析/互动练习（`:457` 的 `examAnalysis` 也无 `english` 键） |
| `subject-gap-2.js:247-251` | `document` 级 `mousemove/mouseup/touchmove/touchend` 监听器**永不摘除**，每次 `render()` 叠加 → 处理器线性增长 |
| `subject-gap-3.js:584, 592` | 直接占用 `document.onmousemove/onmouseup` **全局槽位**（赋值而非 addEventListener），且离开工具不摘除 |
| `subject-gap-1.js:505-512` | `document.onclick` 槽位占用 + `setTimeout(…,10)` 竞态 → 气泡闪现即消失 |
| `visual-enhanced.js`（1801 行） | **全文无任何转义函数**，13 处 `innerHTML` 裸拼（`:1542` 等）→ 一旦改为数据驱动即成 XSS 入口 |
| `data-analysis-enhanced.js:5-8` | `esc()` **不转义单引号**（其余模块的 `esc` 均转义 `'`）→ 单引号属性上下文存在注入面 |
| `subject-gap-2.js:613` | 生词表 `phonetic` 未转义（同行的 `word`/`meaning` 已转义） |
| `subject-gap-2.js:751, 973` | 完形填空答题状态仅存内存（`state.answers`），刷新即丢进度 |
| `learning-path-recommender.js:808` | `window.answerTemplatesData` 导出后**全仓无引用**（死导出） |
| `subject-gap-2.js`（完形填空数据） | 51 题答案恒为 A（同 P1-44） |

---

## 1.9 T3-4d CSP 改造期新发现（2026-10-21）

### P0-20 ✅已修复 · 透镜成像计算器「自上线起编译失败」，且正倒立输出与页面自有参考文本相反

**位置**：`1.2/index.html` 主 IIFE 内透镜计算器按钮的 `onclick` 字符串（原 2734 行附近）

该 `onclick` 内含**两个相互独立的缺陷**，在 T3-4d 抽取函数体时经「文件层 eval → onclick 属性值 → `new Function` 编译」三段式浏览器行为模拟实证：

**① 语法缺陷（5 处）**——三元表达式首字符串缺 opening quote：

```js
var imgType=v>0?'\u5b9e\u50cf':'\u865a\u50cf';   // 实际存量代码：v>0?\u5b9e\u50cf':'\u865a\u50cf';（? 后缺 '）
```

编译实测：整个 `onclick` 属性值 `SyntaxError: Unexpected identifier` → **该按钮自上线起从未可用**（点死）。

**② 物理缺陷（1 处）**——`var m=v/u` 缺负号：

| 场景 | 存量代码输出 | 页面自有参考文本（同页 2730/2742 行） |
| --- | --- | --- |
| u>2f（实像） | 正立 | `m = -v/u（负号表示倒立）` / `u>2f→倒立缩小实像` |
| f<u<2f（实像） | 正立 | 倒立放大实像 |
| u<f（虚像） | 倒立 | 正立放大虚像 |

实像/虚像场景的正倒立判断**整体颠倒**，且 `m` 的符号（页面向学生展示的放大率）也整体反号。

**修复**（T3-4d，随委托改造一并落地）：正则 `/([?:])(\\u)/g` 补 5 个 opening quote；`m=v/u` → `m=-v/u`（三元字符串不动）。

**复验**：4 个透镜场景（u>2f / f<u<2f / u<f / u=2f）物理全对；斜面、电路计算器回归无恙；转换脚本新增 `new Function(body)` 编译断言防再发。

---

### P1-46 ✅已修复 · CSP 委托转换的插值未外移，13 处 `data-arg` 运行时传字面量

**位置**：7 个文件共 13 处——`app-chemistry.js:1395` · `content-enhanced-v2.js:163` · `content-enhancement.js:469` · `missing-tools-part2.js:293,307,677,895` · `open-answer-trainer.js:653` · `utility-tools-v2.js:621` · `visual-enhanced.js:434,739,1396,1637`

缺陷形态（转换器把插值关进属性引号内）：

```js
// 生成： data-arg1="@s:+i+"   ← 运行时传字面量 "+i+"，而非数字
// 正确： data-arg1="@n:'+i+'" ← 插值外移，@n: 编码使 decodeArg 转 Number
```

HEAD 原文均为裸数字参数，故统一改 `@n:` 编码。全库扫描定位（曾漏判 `app-chemistry.js:1395` 同行另一处模板字面量形态——`${idx}` 在 backtick 内会正常插值，属正确形态，后以 Node 全量扫描补全）。

**复验**：缺陷形态复扫 0；13/13 桩实跑（`with` + Proxy DOM 桩）生成 `data-argN="@n:<数字>"`；7 个文件 `node --check` 全过、纯 CRLF 行尾未被破坏；`npm run verify` 九阶段全绿。

---

## 2. P1 级缺陷

### 2.1 `1.1/` 归档目录（只读，但存在会误导开发者的内容）

### 1.1 归档目录（只读，但存在会误导开发者的内容）

> 1.1 声明为"只读归档"，因此以下缺陷**不建议在归档内修复**，正确处置是"加归档横幅 + 登记已知问题 + 删除死文件"（见 `docs/DEV-PLAN.md` T2-6）。但其中一条是 **P0**，因为它让整个 140KB 文件从未执行。

#### P0-9 · `1.1/js/enhanced-tools.js` 语法错误，整个文件从未执行

**位置**：`1.1/js/enhanced-tools.js:2113, 2120`

```
$ node --check 1.1/js/enhanced-tools.js
1.1/js/enhanced-tools.js:2120
        </div>`;
               ^
SyntaxError: Unexpected token ';'
```

模板字符串的收尾行缺失（2113 行是空行，本应是 `` ` : ''}``），导致 2120 行的模板未闭合，**整个 2122 行 / 140KB 文件解析失败**。

**后果**：
- 该文件内的 5 个增强模块（化学流程分析器 / 生物思维导图 / 系谱训练 / 实验设计 / 光合训练）**一个都不会执行**
- 1.1 首页 `enhanced-tools.js:2115` 的按钮 `onclick="photosynthesisTrainerEnhanced.exportWrongPDF()"` 必然抛 `ReferenceError: photosynthesisTrainerEnhanced is not defined`
- **这是 1.1 与 1.2 的分叉证据**：1.2 的同名文件尾部有 5 条 `window.*` 导出（`1.2/js/enhanced-tools.js` 末 5 行），1.1 全部缺失 —— 1.1 的副本是被破坏的截断版
- 仓库自带的 `scripts/static-bug-scan.mjs` 指向 1.1 时同样报 `[error] 语法错误`，但该脚本**未接入 CI**，无人发现

#### P1 级（1.1）

| # | 缺陷 | 位置 | 影响 |
| --- | --- | --- | --- |
| **P1-17** | 页脚自述版本 **v3.0**，与目录标识 `1.1/`、README「1.1 = 物化生三科初版」直接矛盾 | `1.1/index.html:226` | 打开归档的开发者会误以为是现役版本（当前为 1.3）——**本项最需防范的误导点** |
| **P1-18** | `window.loadModuleContent` 被 **4 层猴补丁**依次覆盖：`app.js:9580` → `content-enhancement.js:6` → `exam-review-system.js:57` → `index.html:1765` | 1.1 | `window.X =` 不触发 SyntaxError，碰撞扫描器完全查不到；最终生效者决定全站渲染行为 |
| **P1-19** | `showSection` / `setActiveNav` 定义在 `index.html` 的内联 IIFE **内部**（IIFE 范围 239–2136，函数在 264 / 286），却被 `index.html:1754-1756` 的内联 `onclick` 直接调用 | `1.1/index.html:264, 286, 1754-1756` | 必然 `ReferenceError: showSection is not defined`。**当前不可达**（1.1 的 `data-module` 取值集合为 `bank, competition, concepts, examples, experiment-center, experiments, learning-path, overview, round1, round2, teaching-apps, tests`，**不含 `tools`**；且 `content-enhancement.js:10` 拦截 `module==='tools'`）——属潜在缺陷，非线上故障。**这正是 v1.3 声称在 1.2 修掉的同款 bug，在 1.1 原样存在** |
| **P1-20** | `meta.totalQuestions=120`、`physics.total=40`/`chemistry.total=45`/`biology.total=35`，**实际各 7 题、合计 21 题** | `1.1/data/exam-bank.json` | 元数据造假 5.7 倍；`1.1/js/app.js:9618` 直接打印「真题库加载成功: 120道题目」 |
| **P1-21** | `PHY_2018_01` 的 `analysis` 残留内部备注「（此处原题数据需调整）…正确答案为D选项修正后结果」，且与 `"answer": "A"` 自相矛盾（推导 t′=6s，四个选项 1.5/2/2.5/2s 无一是 6s） | `1.1/data/exam-bank.json` | 直接违反 README:220 / CHANGELOG:39 明令禁止的"内部备注"规则 |
| **P1-22** | 三个 `data/*/knowledge.json`（共 45KB）**从未被加载** —— 1.1 全仓只有一处 `fetch`（`app.js:9615`，目标是 exam-bank.json） | `1.1/data/` | 死文件；但 `1.1/promo.html:498-502` 仍把它们当卖点展示 |
| **P1-23** | 三个模块的渲染容器 id 在 1.1 中**从未创建**：`equation-balancer-app`(`app.js:11063`)、`pcr-simulator-app`(`app.js:10388`)、`gel-electrophoresis-app`(`app.js:10698`) | `1.1/js/app.js` | 约 **955 行**代码永远 `if(!app) return;` → 三个功能完全不可用且**无任何报错** |
| **P1-24** | 考点清单复选框 `id` 在每个 category 内重新计数（`platform-system.js:406-409`） | `1.1/js/platform-system.js` | 每科 20 个复选框只有 5 个唯一 id，`<label for>` 错指，完成度统计最多 5/20 |
| **P1-25** | `getElementById('main-content')` 恒为 null（`index.html:25` 的 `<main>` 无 id）→ `addNewSections()` 提前返回 | `1.1/js/content-enhancement.js:423-424` | 「元素周期表」「化学物质结构」两个 section **从未创建**，功能完全不可见 |
| **P1-26** | DOM XSS：方程式配平器把用户输入原样插入 `innerHTML`（`app.js:2136-2157`）；真题渲染全段无转义（`app.js:10048-10118`，全 1.1 无 `escapeHtml`） | `1.1/js/app.js` | 自伤型（需诱导用户粘贴内容），但属真实 XSS 面 |
| **P1-27** | `1.1/check-syntax.js` 双重失效：① `require` 在 `"type":"module"` 仓库下不可用 ② 硬编码路径 `C:/Users/18948/Documents/high-school-science-kit/index.html` 在本机不存在 | `1.1/check-syntax.js:1-2` | 且**泄露作者本机用户名与目录结构**；它从不引用本仓库任何文件 |
| **P1-28** | 同一页面内工具数量自相矛盾：`promo.html:29`「18款」vs `:71`/`:101`「27款」；`presentation.html:17/72/962`「27款」vs `:1146`「18款」；而实际 `data-tool` 有 **32** 个 | `1.1/promo.html`、`1.1/presentation.html` | 归档宣传页给出互相打架且都错误的产品规格 |

> **状态更新（v1.4 / T2-6 结项）**：已按 `data-tool` 注册表（32 个唯一工具）统一修正。
> 总量：promo 3 处 + presentation 6 处全部为 32；分科按主标签归类为物理 7 / 化学 10 /
> 生物 13 / 平台 2（`secondary-conclusions` 物化共用，按 `tool-tag=physics` 只计一次），
> 页面内部自洽。路线图 slide 的「18款」为 v1.0 里程碑事实，加「首期」消歧后保留。
> `runtime-defer-check.mjs` 新增 9 项断言从注册表实时推导期望值，注入缺陷验证会 FAIL。
| **P1-29** | `presentation.html` 中 **25 个 class 在 `presentation.css` 无定义**（含末页两个主 CTA `btn-primary` / `btn-secondary`、6 张 SVG 插图） | `1.1/presentation.html` | 两个主 CTA 渲染成无样式默认链接；PPT 视觉明显劣化 |
| **P1-30** | 1.1 内部同样存在"同族多版本并行"：PCR 模拟器 3 套（`app.js:10275` / `index.html:463` / `platform-system.js:441`）、电泳模拟器 3 套、学科内容 2 套（`app.js:722` 手写 vs `content-enhancement.js:444` 生成器） | `1.1/` | CHANGELOG:33「T11：47 个 JS 文件全部被引用（无死文件）」的结论**只对 1.2 成立**，对 1.1 完全相反 |

### 2.2 `1.2/` 活跃目录

| # | 缺陷 | 位置 | 影响 |
| --- | --- | --- | --- |
| **P1-1** | `window.loadModuleContent` 在 **4 处**被赋值（1.1 场景，见 P1-18）；1.2 中 `app.js:1220-1239` 的 `MODULE_REGISTRY` / `registerModule` **定义后零调用** | `1.2/js/app.js:1220-1239` | 「模块化渲染」是空壳，详见 P1-3 |
| **P1-2** | 4 个数据文件**无任何运行时消费方**，却被 Service Worker 预缓存：`cross-subject.json`(62KB)、`situational.json`(56KB)、`tech-frontiers.json`(23.5KB)、`knowledgePoints-thesaurus.json`(16.2KB)。全仓 grep 命中方只有 `sw.js`(预缓存)、`README.md`(声称)、`validate-data.mjs`(只查文件存在) | `1.2/sw.js:70-85` | ~158KB 死数据，每次安装 PWA 白下载；README 的「跨学科专题/情境题/科技前沿/考点词典」四项特性**用户看不到** |

> **状态更新（v1.4 / T2-5 结项）**：
> - `knowledgePoints-thesaurus.json` **已接线**（Sprint 1 / T1-4）：`learning-path-recommender.js` 的 `loadThesaurus()` 运行时加载，错题归因别名表不再是死数据。
> - `cross-subject.json` **已接线**（v1.4 / T2-5）：`visual-enhanced.js` 的 `crossSubjectTopics` 原跑 8 条内置硬编码数据，现改为运行时 fetch JSON（22 条）并适配为同构结构（`examTrend→trend`、学科码→中文、答案字母→索引），加载失败回退内置数据。新增 `scripts/test-cross-subject.mjs`（14 断言）锁死适配正确性。
> - `situational.json` / `tech-frontiers.json` **确认无任何运行时消费方**（对应功能跑的是 `guangdong-features.js` / `visual-enhanced.js` 内的硬编码数据，两文件 fetch 调用数分别为 0 和 1——唯一 1 个是本次新增的 cross-subject 接线），已**归档**至 `1.2/data/_archive/`，并从 `sw.js` 的 `DATA_ASSETS`、`validate-data.mjs` 的 EXTENDED 清单、README 特性表中移除。
| **P1-3** | `registerModule` / `MODULE_REGISTRY` 架构**定义后零调用**。全仓 `registerModule(` 仅出现在 `app.js:1223` 的定义处，无任何模块注册 | `1.2/js/app.js:1220-1239` | 「模块化渲染」架构是空壳；`loadModuleContent` 永远走默认分支，T11「模块合并」的复杂度被低估 |

> **状态更新（v1.4 / T2-4 结项）**：
> - **P1-1（1.2 部分）已修复**：`window.loadModuleContent` 的赋值点从 3 处（app.js 权威定义 + content-enhancement.js 猴补丁 + exam-review-system.js 猴补丁）收敛为 **1 处**。两个补丁改为经 `registerModule` 正式注册（content-enhancement 注册 tools/methodology/models/hotspot/errors/graph/checklist 共 7 项；exam-review 注册 exam/round1/round2/quiz 共 4 项，其中 round1/round2 依原语义覆盖内置注册项）。runtime 门禁新增 5 项断言锁死：注册表须有 ≥10 个真实注册项、14 个关键模块全部注册、`window.loadModuleContent` 仅 app.js 一处赋值、14 个注册模块全部可经 `loadModuleContent` 命中。已做缺陷注入验证（恢复猴补丁 → 门禁 FAIL）。
> - **P1-3 已随 Sprint 0 的 P0-11 修复而消解，无需删除 `MODULE_REGISTRY`**：原报告「定义后零调用」的判断在 P0-11 修复后已不成立——`app.js` 的 `registerBuiltinModules()` IIFE 注册了 experiments/round1/round2/bank/experiment-center 共 5 项，`loadModuleContent` 亦改为优先查注册表。该架构是**活的且承重**，DEV-PLAN T2-4 方案 A（删除死代码）的前提已失效，实际执行的是「消除猴补丁链 + 文档更正 + 门禁锁死」。
| **P1-4** | 存储三轨并存且互不连通：v1 裸 key（`hspcb_wrong_records` 等）、`hspcb.v2.*`（`HSPCBProgress`）、`hspcb.st.*`（`HSPCBStore`）。`learning-tools.js` 写 `HSPCBStore.set('hspcb_daily_checkin', …)` → 实际落到 `hspcb.st.hspcb_daily_checkin`（双层命名）；而 `progress.js` 的 v2 侧是 `hspcb.v2.dailyCheckin` | `js/learning-tools.js:632,817,883-886`、`js/data-analysis-enhanced.js:498` | 同一份「打卡数据」在两套命名空间里各存一份，互不同步；导出/导入备份（只导 v2）会漏掉 v2 侧从未更新 |
| **P1-5** | `knowledgePoints` 字段名不一致：`BIO_2024_07` 用中文键 `知识要点` | `1.2/data/exam-bank.json` | 1718 题中唯一一道取不到 `knowledgePoints`，错题归因/学习路径对该题直接失效；`validate-data.mjs` 不检查字段名 |
| **P1-6** | 残留内部字段 `解析_ignored`（与 `analysis` 并存） | `1.2/data/exam-bank.json`（`ENG_2022_08`） | 调试遗留物随生产数据发布；校验器的 `INTERNAL_NOTE_PATTERNS` 只扫 `q.analysis`，扫不到 |
| **P1-7** | 105 道题为模板化解析：复述题干 + 报答案字母 + 套话，无实质讲解 | 如 `PHY_2018_30`：「分析：匀速直线运动的速度-时间图像是？。正确答案为A，相关知识点涉及力学。」 | v1.2「312 条占位解析清零」只是换了一种更长的占位形式；`validate-data.mjs` 的「analysis ≥20 字」规则形同虚设 |
| **P1-8** | `MATH_2025_15` 答案键本身错误：X~B(10,0.4) 时 E(X)+D(X)=4+2.4=**6.4**（选项 B），答案键却是 D(2.4)。**解析正文自己已指出矛盾并写明「选B」** | `1.2/data/exam-bank.json` | ✅ 已随 P0-1 一并订正为 B |
| **P1-9** | 一次性脚本留在仓库且无 `--apply` 保护，会**重写 1MB 题库**：`fix-phase-a-data.mjs`（注释已写明 "one-shot"）、`fix-no-options.mjs`、`fix-duplicate-question-ids.mjs`、`enrich-short-analyses.mjs`、`polish-analyses.mjs`。其中 `fix-phase-a-data.mjs:19-33` **硬编码覆写 PHY_2018_01 的 options/answer/analysis**——若被重跑，会把刚修好的 D 改回 A 并还原旧选项顺序 | `scripts/` | 任何人执行 `node scripts/fix-phase-a-data.mjs` 都会重新引入 P0-1 并破坏已修复数据 |
| **P1-10** | `exams` / `questions` 读取顺序在各脚本间不一致：`validate-data.mjs:272` 与 `fix-duplicate-question-ids.mjs:17` 用 `questions \|\| exams`，而 `deep-bug-scan.mjs:23` 与 `enrich-short-analyses.mjs:176` 用 `exams \|\| questions` | `scripts/` | 当前数据只有 `questions` 故未爆；一旦有人补回 `exams`，修复脚本会写到错误的数据集 |
| **P1-11** | 首页 6 张学科卡中 3 张用**内联硬编码色值**绕过设计令牌：语文 `#0ea5e9`（令牌是 `--chinese:#ec4899`）、数学 `#3b82f6`、英语 `#8b5cf6` | `1.2/index.html:173, 182, 189` | ① **数学与物理卡片同色**（`--physics:#3b82f6`，物理走 class、数学走内联）；② 语文实际色与令牌不符；③ 内联样式无法被 `theme-dark.css` 覆盖 |
| **P1-12** | `--english` 令牌**全仓不存在**；`style.css` / `theme-dark.css` 中 `english` 关键字出现 **0 次** | `1.2/css/tokens.css` | 六科中英语无主题色，与「六科全覆盖」的视觉承诺不符 |
| **P1-13** | `manifest.json` 应用名漏「英」：`"高中物化生语数学习大礼包"`（缺英语）；`short_name: "HSPCB"` 内部代号泄露给终端用户；图标全部用 `data:image/svg+xml,…` 内联 URI，**Chrome/Edge 不接受 data: URI 作为 manifest 图标**，PWA 可安装性存疑；`shortcuts` 只列 4 科，缺语文/英语 | `1.2/manifest.json` | 安装后的应用名与仓库标题不一致；PWA 安装可能失败或显示为默认图标 |

> **状态更新（v1.4 / T3-2 结项）**：四项问题全部修正——name 补「英」（与 index.html
> `<title>` 口径一致）；short_name `HSPCB` → 「高考备考」；4 个 data: URI 图标换成
> `1.2/icons/` 下真实文件（`icon.svg` / `icon-192.png` / `icon-512.png` /
> `icon-maskable-512.png`，尺寸经 PNG IHDR 校验）；shortcuts 补语文/英语成六科。
> **连带发现并修复**：shortcuts 声明的 `index.html?subject=X` 此前**全仓无任何
> 消费方**（无 `URLSearchParams` / `location.search` 使用），点击 shortcut 只会
> 打开首页——已在 `app.js` 补最小深链实现（白名单从 `.nav-btn[data-subject]`
> 实时推导 + 复用 `navigateTo`，非法参数警告并停留首页）。另补 `sw.js` 预缓存
> 4 个图标（`CACHE_NAME` v13→v14）与 index.html 的 favicon / apple-touch-icon 链接。
> `runtime-defer-check.mjs` 新增 18 项断言（103 → 121，含 3 项行为级深链验证），
> 六类注入缺陷全部验证会 FAIL；Edge 无头实测 `index.html?subject=english`
> 直达英语科且导航按钮高亮。
| **P1-14** | `1.1/check-syntax.js:2` 硬编码仓库外路径 `C:/Users/18948/Documents/high-school-science-kit/index.html`，且用 CommonJS `require`，在本仓必然失效 | `1.1/check-syntax.js` | 死文件；T9 只删了 `1.2/` 下的同名文件，1.1 归档未同步 |
| **P1-15** | `theme-dark.css` 仍是**补丁式覆写层**：552 处硬编码 hex + **253 处 `!important`**，仅 8 个 `--dm-*` 令牌定义支撑 99 处引用 | `1.2/css/theme-dark.css` | T6 只完成第一阶段；任务清单自己诊断的「461 个硬编码 hex 的补丁层」问题基本未解 |
| **P1-16** | 残留空元素 `<div class="quick-access"></div>`（紧邻另一个同名真容器），是 v1.2「首页卡片嵌套修复」的遗留 | `1.2/index.html:200` | 无功能影响，但属未清理的 DOM 残渣 |

> **状态更新（v1.4 / T3-3 结项）**：**P1-15 已修复**（T3-3a 令牌化 + T3-3b
> `!important` 削减，提交见 DEV-PLAN T3-3）。声明值 hex 199 处 → **0**（收拢为
> 91 个语义令牌，`--dm-*` 定义 8 → 91）；补丁层 `!important` 158 → **21**
> （原报告 253 = 158 补丁 + 99 重映射层 `[style*=]` 承重墙 + 2 注释；重映射层压过
> JS 生成内联样式，属架构性必要，批量移除经 harness 实证会造成 117+ 处真实回退，
> 其根治——内联样式改类名+令牌——移交 T3-5 评估）。原「552 处 hex」为全文计数
> （含令牌定义与选择器匹配串），按声明值口径为 199 处。外观经 computed-style
> 逐元素回归（明暗双态 × 九科 × 双模式，4210–4473 元素/组）验证**零变化**；
> `npm run check:theme` 六项门禁接入 verify 链防回退，反向篡改 6/6 全部被抓。

> **状态更新（v1.4 / T3-4 结项）**：**T11评估完成、T12 部分完成**。
>
> **T11（模块合并）—— 评估结论：不建议在 v1.4 做**。T2-4 原文「47 个自渲染模块」
> 措辞不准确，47 实为**脚本数**（46 个 `js/*.js` + `sw.js`）。实测关键事实：
> `window.MODULE_REGISTRY` + `registerModule()`（app.js:1266-1269）提供了统一注册点，
> 渲染入口已收敛为 `loadModuleContent(subject, module)` 单函数（app.js:1287）——
> **T2-4 想解决的「无统一装载路径」问题实际已解决**，剩下的是 54305 行的内容回归风险，
> 而收益（减少几个文件）远小于风险。若未来仍要合并，前置条件是 smoke 覆盖到
> 47/47 全部脚本的**真实 DOM 装载**（当前为「13 个关键脚本实装 + 47 个 `node --check`」）。
> `escapeHtml` 亦已收敛（5 个文件仍有定义，但均为「委托 `CommonUtils` + 内联兜底」薄壳，
> 非独立实现，无重复债务）——原P2-1 所述「6 份独立实现」已过时。
>
> **T12（CSP 收紧）—— A/C 两类已清零（2026-10-21，T3-4d），B 块外置待办**。
> DEV-PLAN 原文「32 处内联 `onclick`」与实测不符，必须区分三类：
> - **A 静态 HTML 内联事件属性：2 → 0**（T3-4c 修复）。实为 `onclick="toggleTheme()"`
>   （主题按钮）+ `onkeyup="chineseSearch()"`（语文搜索框）——前次勘察只搜 `onclick`
>   漏掉 `onkeyup`，且未剥离内联 `<script>` 块内的字符串模板，导致口径混乱。
>   已改为 `data-action="toggle-theme"` / `data-action="chinese-search"` + 文档级委托
>   （注册在对应 IIFE 内而非 `DOMContentLoaded`，因触发元素位于该 script 之前）。
>   `window.toggleTheme` 保留导出（`data-action` 委托与外部调用方仍引用）。
> - **B 内联 `<script>` 块：6 块 / 2512 行** —— #3 主逻辑 2292 行（含 T3-4d 插入的
>   3 个计算器函数与 quickTool）是最大障碍；
>   #2 主题引导 32 行**不能简单外置**（须 body 渲染前同步执行以防首屏闪白）。
> - **C JS 生成的内联事件属性：`js/*.js` 371 处 + index.html 内联脚本内 25 处 → 0** ✅
>   （T3-4d，委托中枢 `1.2/js/csp-delegation.js`）—— 这部分曾是移除
>   `script-src 'unsafe-inline'` 的真实主体工作量（原分布：click 307 /
>   change 29 / input 18 / mouseover 6 / mouseout 7 / keypress 3 / mousedown 1）。
> - **D 内联样式（`style-src`）**：静态 `style` 属性 37 + `<style>` 块 2（15+289 行）
>   + JS 样式写入 3672 + `cssText` 41 —— 根治须改 JS 内联色源头（与 P1-15 推迟项同源）。
>
> 新增门禁 `scripts/check-csp-inline.mjs`（`check:csp`，现行 5 条断言）接入 verify 链，
> 同时输出 A/B/C/D 四类清点作为后续改造的跟踪基线。**meta CSP 本次未收紧**
> （`unsafe-inline` 仍保留），因为 B 类未完成前收紧会直接白屏。

> **状态更新（v1.4 / T3-5 结项）**：题量口径修正。DEV-PLAN 原文与本报告 P0-4
> 均记载「真实唯一题量 1166」，该数字是 **T1-2 去重前**的旧口径，已随 v1.4 数据失效。
> 实测 `data/exam-bank.json`：**唯一真实题量 1301 道**（= 各科 `total` 之和
> = `meta.totalQuestions` = 唯一 id 数，四者由 `check:data` 强制一致），
> 417 条历史重复已归档至 `1.2/data/_archive/duplicates-2026-10-19.json`。
> 分科：物理 248 / 英语 220 / 化学 217 / 生物 216 / 数学 200 / 语文 200。
> 距「每科 ≥260」目标共缺 **259 道**，且缺口高度集中于数学/语文（各 -60）
> 与生物/化学（-44/-43），物理仅差 12 道 —— 与原文「数学语文英语仍偏薄」的
> 均匀分布判断不符，排期应按新缺口表重排。本阶段**未生成任何题目内容**
> （T3-5 明确「需人力，非代码」），代码侧只产出缺口量化 + 撰写规范 + 门禁兜底。
> 另记245 条**质量型缺口**（解析缺失 74 以英语为主、解析为空 171 以主观题为主，
> 来自 `check:content` 基线债务）——其价值高于纯数量缺口，且无法批量生成。

---

## 3. P2 级缺陷

| # | 缺陷 | 位置 |
| --- | --- | --- |
| P2-1 | ~~`escapeHtml` 有 **6 份独立实现**~~ **→ v1.4 实测已收敛**：仍有 5 个文件定义 `escapeHtml`，但均为「委托 `common-utils.js` 权威实现 + 内联兜底」的薄壳，非独立实现，无逻辑重复债务。`content-deep-v3.js` 的 3 处为同文件顶层 `function` 声明（后两处覆盖前一处），仍属代码冗余但无正确性风险 | 5 个文件（T3-4 实测） |
| P2-2 | `app-exam.js:510` 先转义再截断：``${this._esc(exam.question).substring(0, 60)}`` —— 截断可能切碎 HTML 实体（如 `&lt;` → `&l`），产生破损实体 | `1.2/js/app-exam.js:510` |
| P2-3 | `app-exam.js:495-497` 对 `exam-subject-filter` / `exam-year-filter` / `exam-difficulty-filter` 的 `getElementById(...).value` **无空值检查**，DOM 缺失即抛 TypeError | `1.2/js/app-exam.js:495` |
| P2-4 | `app-biology.js:1661`、`app-chemistry.js:3120` 对 `HSPCBStore.getItem(...)` 结果直接 `JSON.parse`，**无 try/catch**；`study-dashboard.js:18,23,28,33` 同理 | 4 处 |
| P2-5 | `study-tools-enhanced.js:524-540, 599, 640, 649-656, 764` 裸用 `localStorage`（无 HSPCBStore 兜底）。**此为 progress.js:476-478 明确登记的白名单**，此处为合规，仅作登记 | `1.2/js/study-tools-enhanced.js` |
| P2-6 | `index.html:1` 附近的 5 个主 app 文件带 UTF-8 BOM（`app.js`/`app-biology.js`/`app-chemistry.js`/`app-exam.js`/`app-physics.js`） | 5 个文件 |
| P2-7 | 文档称"1.4MB 题库"，`exam-bank.json` 实际 1,031,138 B ≈ **1.03MB**（JSON 重序列化后已缩水） | `README.md:81`、`CHANGELOG.md:8` |
| P2-8 | 文档称"选择题答案分布 368/368/366/368"，该数字统计的是**所有 4 选项 A-D 题**（1473 道），而"选择题"题型实为 1323 道 —— 口径不一致 | `README.md:153` |
| P2-9 | `1.2/data/exam-bank.json` 中 id 命名有 4 种规范并存：标准 `SUBJ_YYYY_NN`(1188) / 小写 `physics_2023_114`(345) / `_dupN`(165) / `ENG_RC_YYYY_NN`(20) | 题库全局 |
| P2-10 | `sw.js:7` 注释「发布时必须递增」——JS 资源采用 cache-first，**不 bump `CACHE_NAME` 就永远拿旧版**；`activate` 还会删掉同源下**其他应用的全部缓存** | `1.2/sw.js:7, 107-123` |

---

## 4. 文档与实现不一致清单

| 文档声称 | 实际情况 | 证据 |
| --- | --- | --- |
| 「T8：200 道题在安全规则下整体互换选项位置，**正确性不变**」 | 正确性变了 —— 160 道题的解析字母与新答案键矛盾 | `git show ee3b550^:…` vs `ee3b550:…`（P0-1） |
| 「v1.2：165 个重复题 id 去重」 | 是改名不是删除，164 道纯副本仍在 ~~，真实唯一题 1166 而非 1718~~ **→ v1.4 已修正：T1-2 归档后真实唯一题 1301** | P0-4 / T3-5 |
| 「T3：app-exam 渲染路径统一 escapeHtml」 | app-exam 属实，但全仓 44 文件有 innerHTML、仅 4 文件调用转义 | P0-5 |
| 「T4：27 个模块的 localStorage 调用全部收敛」 | 仍有 29 处裸调用分布在 9 个文件 | P0-4 / P1-4 上下文 |
| 「P0-2 T3 完成：escapeHtml 接入主渲染路径」 | 未接入；`app.js` 自身 1 处 innerHTML、0 次转义 | P0-5 |
| 「📊 扩展题库：跨学科、情境题、变式题、科技前沿、答题模板」 | 其中 4 项（跨学科/情境题/科技前沿/考点词典）**无任何运行时消费方** | P1-2 |
| 「PWA 可安装到桌面」 | ✅ 已随 T3-2 修复：manifest 图标改为真实文件，`?subject=` 深链闭环 | P1-13 |
| 「T13 数学/语文题量扩充（200 → 约 340）」 | 未启动，数学/语文仍各 200 题，且 11 题重复 | P0-4 |
| 「当前数据基线：1718 题」 | ~~真实唯一 1166 题~~ **→ v1.4 实测真实唯一 1301 题**（T1-2 去重后） | P0-4 / T3-5 |
| 「npm run verify 期望全绿」 | 全绿但漏检本次全部 8 项 P0 | P0-6 |
| 「T11（审计结论）：47 个 JS 文件全部被 index.html 引用（无死文件）」 | 该结论**只对 1.2 成立**；1.1 内有 45KB 从不加载的数据、约 955 行因容器 id 缺失而永不渲染的代码、PCR/电泳各 3 套并行实现 | P1-30 |
| 「T9：删除死文件 `1.2/check-syntax.js`（硬编码仓库外路径）」 | 仓库中唯一存在的硬编码路径文件是 **`1.1/check-syntax.js`**（`1.2` 下已不存在），至今仍在，且泄露本机用户名路径 | P1-27 |
| 「`1.1/` ← js/ 7 个核心模块」 | `1.1/js/` 实际只有 **6** 个 `.js`；第 7 个 `check-syntax.js` 在 1.1 根目录且是死脚本 | P1-27 |
| 「`1.1/` 只读归档」（README:161） | 归档内部**零提示**：`1.1/index.html:226` 页脚自称 v3.0，`promo.html`/`presentation.html` 通篇现役口吻 | P1-17 P1-28 |
| README:220 / CHANGELOG:39 禁止 analysis 留内部备注 | `1.1/data/exam-bank.json` 的 `PHY_2018_01` 正是该违规样本（「此处原题数据需调整…正确答案为D选项修正后结果」），1.1 未被门禁覆盖 | P1-21 |
| 「`1.2/js` ← 46 个功能模块」 | ~~实际 **47** 个 `.js`~~ **→ v1.4 实测：`1.2/js/` 为 46 个 `.js`；47 是 `js/*.js`(46) + `sw.js`(1) 的脚本总数**。DEV-PLAN T3-4 沿用的「47 个自渲染模块」措辞不准确——47 是脚本数，不是自渲染模块数 | P1-30 / T3-4 |

---

## 5. 已核查确认无问题的项

以下为已实际检查并确认健康的项，避免后续重复排查：

- **全局符号冲突**：用比仓库更严格的规则（`const|let|var|function|class` + 花括号深度=0 判定 + `index.html` 内联脚本）重扫 `1.2/` 47 个 JS，**跨文件顶层重名 0 处** —— v1.3 声称修复的 3 处 `const` 冲突确为真修复
- **`index.html` 内联事件处理器**：`handler-integrity.mjs` 报的 79 条"缺失"里，绝大多数是正则误报（`Math.sin`、`toFixed`、`if` 等被误识别为函数名）。**1.2 侧**：所有内联 `onclick` 指向的符号均可解析。**1.1 侧**：`showSection` / `setActiveNav` 虽然定义在 `index.html:264,286`，但**位于内联 IIFE（239–2136）内部**，未导出到 `window`，因此 `index.html:1754-1756` 的内联 `onclick` 必然 `ReferenceError`（当前因 `tools` 模块不存在而不可达，详见 P1-19）
- **`app-exam.js` 的转义**：`app-exam.js:486-489` 的 `_esc()` + `:542/:551/:564/:568` 调用顺序正确（先转义后插 `<br>`）
- **`common-utils.js`**：`escapeHtml` / `safeJsonParse` / `loadStorage` / `saveStorage` / `loadJson` 实现均正确，带 try/catch，`loadJson` 检查了 `res.ok`
- **`progress.js`**：v1→v2 迁移表 30 条、`uniqueById` 合并、导出/导入幂等性、`_resetForTest` 均正确；`test-progress.mjs` 12/12 通过
- **Service Worker 资源清单**：`sw.js` 引用的 71 个资源全部存在，`index.html` 引用的所有 css/js 均在 `CORE_ASSETS` 中
- **6 科 knowledge.json**：topic id 全局唯一、`keyPoints`/`commonMistakes` 无空数组
- **`promo.css` / `presentation.css` 的 CSS 变量**：`promo.css` 自带 `--dark-bg`/`--card-bg` 定义（`promo.css:13-14`），**不存在未定义变量问题**
- **JSON 可解析性**：14 个数据文件全部可解析，无语法错误
- **英语题位置引用词**：`balance-answers.mjs` 的 `POSITION_REF` 只含中文，理论上漏英文 `all of the above`；实测英文题库**命中 0 处**，当前无风险
- **中文位置引用词**：130 道题的选项含「以上」等词，但均因其他条件（选项数≠4/答案非 A-D/选项重复）被均衡脚本正确跳过，无冲突

---

## 6. 复现命令

```bash
# P0-1 解析/答案冲突（修复后应为 0）
node scripts/validate-data.mjs | grep '解析/答案冲突'

# P0-1 修复脚本（dry-run / 生效）
node scripts/fix-answer-analysis-mismatch.mjs
node scripts/fix-answer-analysis-mismatch.mjs --apply

# P0-4 真实唯一题量
node -e "const e=require('./1.2/data/exam-bank.json');let n=0,u=new Set();
for(const s of Object.keys(e)){if(s==='meta')continue;
for(const q of e[s].questions||e[s].exams||[]){n++;u.add(s+'||'+String(q.question).trim().slice(0,200));}}
console.log('声明',n,'唯一',u.size)"

# P0-2 分科答案分布
node -e "const e=require('./1.2/data/exam-bank.json');
for(const s of Object.keys(e)){if(s==='meta')continue;const d={};
for(const q of e[s].questions||e[s].exams||[]){const a=String(q.answer).toUpperCase();
if(/^[A-D]\$/.test(a)&&Array.isArray(q.options)&&q.options.length===4)d[a]=(d[a]||0)+1;}
console.log(s,JSON.stringify(d));}"

# P0-3 考点解析率（需 learning-path-recommender.js 的 TOPIC_ALIAS_MAP）
# 见本报告 P0-3 表格，脚本化版本见 docs/DEV-PLAN.md T3-2

# P0-6 门禁自检
node scripts/check-global-collisions.mjs; echo "exit=$?"   # 永远是 0
```

---

## 7. 交付物

| 文件 | 说明 |
| --- | --- |
| `docs/ERRATA-REPORT.md` | 本报告 |
| `docs/DEV-PLAN.md` | 项目开发方案（4 个 Sprint，含验收标准与门禁升级） |
| `scripts/fix-answer-analysis-mismatch.mjs` | P0-1 可执行修复脚本（dry-run 默认，支持 `--apply` / `--base` / `--report`） |
| `scripts/validate-data.mjs` | 新增「解析声明字母必须与 answer 一致」硬错误规则 + 摘要字段 |

> 本次改动已就地应用：161 道题修复 + 校验规则加固，`npm run verify` 仍全绿且新增规则生效。

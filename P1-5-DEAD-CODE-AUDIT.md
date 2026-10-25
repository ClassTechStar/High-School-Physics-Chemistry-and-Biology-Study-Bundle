# P1-5 删除执行：死代码审计（结论：删除路线不可行）

> 清单原文：*「删除执行：合并三套 study-tools 族系，归档 subject-gap 系列（v1.2 静默失效事件已证明这些"保险"从没工作过），目标 JS 体积砍 30%。」*
>
> **本审计用四项代码证据否定了上述前提。结论：不要按原方案删除。**
> 审计日期：2026-10-25 · 基线：`v1.4`（`e7af0e5`）

---

## 证据一：subject-gap 三模块实际渲染成功（不是死代码）

`render()` 开头是 `var c = document.getElementById(...) ; if (!c) return;`——容器缺失时会**静默返回**，这正是「静默失效」的形态，因此需要实测而非静态推断。

浏览器实测（Edge headless，点击 `data-tool` 入口后测量容器内字符数）：

| 模块 | 容器 | 入口 | 点击前 | 点击后 |
|---|---|---|---|---|
| 古诗文鉴赏交互器 | `#poem-appreciation-app` | `data-tool="poem-appreciation"` | 0 | **11,399** |
| 文言文翻译对照器 | `#classical-translation-app` | `data-tool="classical-translation"` | 0 | **13,540** |
| 立体几何 3D 查看器 | `#solid-geometry-3d-app` | `data-tool="solid-geometry-3d"` | 0 | **10,358** |

三者 `btnFound` / `appExists` 均为 `true`，内容真实产出（含诗词数据、注释、SVG 意境图等）。
**它们是可达且可用的功能模块，205 KB 不是可以「归档」的死代码。**

## 证据二：study-tools 族系无重复实现

四个文件（合 287 KB）的 `window.*` 导出**两两不重叠**：

| 文件 | 导出 |
|---|---|
| `study-tools-v2.js` | `errorVariation` / `masteryRadar` / `noteSystem` / `pomodoroTimer` / `studyPlanGenerator` |
| `study-tools-enhanced.js` | `accessibilityEnhancer` / `dataExporter` / `keyboardShortcuts` / `lazyLoader` / `navigateToolPage` |
| `study-enhanced.js` | `adaptiveDiagnosis` / `knowledgeHeatmap` / `spacedRepetition` / `textbookFillBlank` |
| `learning-tools.js` | `countdownTaskSystem` / `examHeatmap` / `studyReport` / `terminologyChecker` |

它们只是**命名相近**，职责完全不同。合并只会把无关代码塞进同一文件，不减体积、反增耦合。

## 证据三：54 个 js 文件全部被 index.html 加载

逐一比对 `js/*.js` 是否在 `index.html` 出现：

```
54 加载 / 0 未加载
```

不存在「文件留着没人引用」这种情况，删文件必然砍到功能。

## 证据四：162 个 `window.*` 导出零死代码

扫描全部 `window.X = ...` 导出，在 `index.html` 与所有 js 中统计引用（排除定义语句本身）：

```
window.* 导出符号总数: 162
有引用: 162   零引用（疑似死代码）: 0
```

---

## 综合结论

「JS 体积砍 30%」（约 1.08 MB / 3.6 MB）**无法通过删除达成**：

1. 没有未加载的文件（54/54 在用）
2. 没有零引用的导出（162/162 在用）
3. subject-gap 实证可用，study-tools 族系无重复

按原方案执行 = 删除正常功能换取体积数字，得不偿失。

## 修订建议：体积优化的可行路径

| 路径 | 预估收益 | 代价 | 建议 |
|---|---|---|---|
| **数据层去重** | 题库/知识点 JSON 内部是否仍有重复题（T1-2 已做一轮 1718→1166） | 低 | 先量化再定，收益最实在 |
| **按需懒加载** | 首屏只加载当前学科模块，其余进入时再取 | 中（需改加载编排） | 收益大，但 `check:runtime` 的 defer 保序断言需同步调整 |
| **发布时压缩** | minify 通常可减 40–60% | 引入构建步骤，与「无构建」定位冲突 | 可做成 `scripts/minify.mjs` 产出 `1.2/dist/` 供 Pages 用，源码保持可读 |
| **删除代码** | ≈ 0（已证明） | 砍功能 | ❌ 不建议 |

**建议顺序**：先做数据层去重的量化（若仍有重复，这是纯收益）；再评估懒加载。压缩作为最后手段，且必须保留未压缩源码。

## 附带说明

「v1.2 静默失效事件」所指的失效，更可能落在**入口可达但 render 静默返回**这一类（如本轮已标记的 math/english 静态页 `#math-m1` / `#math-m2` / `#english-eng-*` 疑死按钮）。
**这类问题的正确处置是修复接线，而不是删除模块。** 建议单独立项逐个验证。

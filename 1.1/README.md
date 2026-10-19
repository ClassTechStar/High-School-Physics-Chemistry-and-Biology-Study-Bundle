# 1.1 — 只读归档（Read-only Archive）

> ⚠️ **本目录是 v1.1 历史归档，已被 [`/1.2/`](../1.2/) 完全取代。**
> 当前开发目录为 `/1.2/`。请勿基于本目录开发、修 bug 或提 issue——
> 修复只会制造「1.1 也是可用版本」的错觉。所有问题已在 1.2 侧处置
> （见仓库根目录 `docs/ERRATA-REPORT.md` 与 `docs/DEV-PLAN.md`）。

保留本目录的原因：`presentation.html` / `promo.html` 是对外展示页，
删除会破坏 GitHub Pages 路径。**保留 + 标注** 优于删除。

---

## 已知问题清单（实测记录，未修复）

以下问题在归档导出时逐条实测复核过（复核方式：`node --check` / 数据统计 /
DOM id 比对），**均不在本目录内修复**：

### 1. `js/enhanced-tools.js` 语法错误 → 整个文件从未执行

`node --check` 报错于第 2120 行（模板字符串未正确闭合）。该文件约 140KB，
因语法错误**整个文件不会执行**，其中 5 个增强模块全部不可用。

### 2. 三个 `data/*/knowledge.json` 从未加载

全仓（`js/`、`index.html`）对 `knowledge.json` 的引用数为 **0**，
约 45KB 死文件。

### 3. 三个模块因容器 id 不匹配而永不渲染

`pcrSimulator` / `gelElectrophoresisSimulator` / `equationBalancerPro`
寻找的容器 id（`pcr-simulator-app` / `gel-electrophoresis-app` /
`equation-balancer-pro-app`）在 `index.html` 中**均不存在**，
约 955 行渲染逻辑永远不会执行。

### 4. 「元素周期表」「化学物质结构」不可见

渲染目标 `#main-content` 在 `index.html` 中不存在（全文 0 次出现），
渲染函数静默 return。（此即 1.2 侧 P0-14 的同一根因。）

### 5. `exam-bank.json` 元数据与实际不符 + 答案与解析矛盾

- `meta.totalQuestions = 120`，三科实际题数合计 **21**
- `PHY_2018_01`：`answer` 为 `"A"`，但解析正文结尾写着
  「正确答案为D选项修正后结果」——答案键与解析自相矛盾。
  （1.2 侧已随 P0-1 订正为 D。）

### 6. `showSection` / `setActiveNav` 困于 IIFE，内联事件够不着

二者定义在 `index.html` 第 248 行开始的 IIFE 内且**未导出到 window**。
IIFE 内部的调用（如导航按钮委托）正常；但 3 处**内联 `onclick`**
（首页「快速入口」的物理公式计算器 / 化学方程配平 / 遗传模拟器按钮，
约第 1763-1765 行）在全局作用域找不到这两个函数，点击会抛
`showSection is not defined`。

---

*本清单由 v1.4（T2-6）导出时实测生成。归档内容此后不再变动。*

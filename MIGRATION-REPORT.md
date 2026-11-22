# 跨项目优秀实践迁移报告

> 执行日期：2026-11-22
> 源项目：`high-school-chemical-notes`、`cn-math-taxonomy`、`whk-wiki`
> 目标项目：`High-School-Physics-Chemistry-and-Biology-Study-Bundle`
> 约束：保留现有功能与设计风格、不引第三方依赖、不产生回归

---

## 一、扫描方法与范围

| 项目 | 规模 | 技术栈 | 扫描方式 |
| --- | --- | --- | --- |
| high-school-chemical-notes | 354 文件 / 55 MB | Obsidian 知识库（319 md + 3 个第三方插件，无自研代码） | 目录/笔记结构、双链密度、插件清单、模板提取 |
| cn-math-taxonomy | 521 文件 / 91 MB | Python 数据管线 + 静态站 + 24 步 CI | README/CHANGELOG/docs 全读、scripts/*.py、tests/ 21 个、CI、前端 js/css |
| whk-wiki | 319 文件 / 88 MB | Docusaurus v3 + KaTeX | 配置、src 组件、CI、45 个 `_category_.json`、正文抽样 |
| 目标项目 | 636 文件 / 143 MB | 纯静态 HTML/JS/CSS + 安卓壳 + 13 道门禁 | README/CHANGELOG、60+ JS 模块、data 契约、全部门禁脚本、E2E |

**关键前提**：目标项目工程成熟度**高于**两个代码型源项目（13 道门禁、门禁自举、Playwright E2E、SW 缓存、版本单一事实源）。
因此本次迁移的重点不是"补工程基础设施"，而是**找它真正缺的那几块**——先核对、再落地，避免为迁移而迁移。

---

## 二、采纳并落地的优秀实践（7 项）

### 1. 备份/导入的事务安全（来源：cn-math-taxonomy · 维度 6 安全 · 高价值）

**源实践**：`assets/children.js:334-351` 备份导入采用两步写入 + 失败回滚原记录原始字节；`tests/test_children.js:312-366` 覆盖"两步失败回滚/回滚失败提示/过期预览"。

**目标项目缺陷（实测）**：
- `1.2/js/progress.js` 的 `importData()` 对 `saveAll()` 的返回值**完全忽略**——本地存储配额满时写入失败，函数仍返回 `{ok:true}`。
- 后果：用户点"恢复快照"看到"成功"，实际数据一个字没写；`replace` 模式还会把内存态覆盖成新数据，与磁盘旧数据不一致。
- `1.2/js/settings-center.js:362` 在 `res.ok === false` 时**什么都不做**——点了没反应，也不知道失败原因。

**落地改动**：
- `1.2/js/progress.js`：`importData` 进入时先 `clone(_cache)` 做事务快照；`replace` 与 `merge` 两条路径写入失败均回滚 `_cache` 并返回 `{ok:false, error:'storage-full'}`。
- `1.2/js/settings-center.js`：恢复失败时按错误类型（storage-full / corrupt / 其他）弹出通知，明确"原记录未被改动"。
- 新增 `scripts/test-import-transaction.mjs`（**17 项**）：正常路径 + 精确故障注入（只让 `hspcb.v2.progress` 写入抛 QuotaExceeded，`__probe` 探测保持正常）+ 损坏快照 + 空槽位。
- 接入 `npm test` 链。

**为什么是适配而非复制**：cn-math 用"两步写入"（因为它逐 key 存多份），目标项目是单 key 原子写（`setItem` 本身原子），所以只需"检查返回值 + 回滚内存态"，比原方案更轻。

---

### 2. 链接完整性门禁（来源：whk-wiki · 维度 4 代码质量 · 高价值）

**源实践**：`docusaurus.config.js:32` `onBrokenLinks: 'throw'`——把断链从"上线后用户点空"变成"构建即失败"。

**目标项目缺陷（门禁首次运行即抓到 5 处）**：
- `1.2/index.html` 导航 `#m1-s3`（1.3 文学类文本）、`#m4-s4`（应试策略）指向不存在的 section——内容早已合并成 2 节（m1）和 3 节（m4），导航还是旧的 3 项/4 项。
- `1.2/promo.html` 导航 `#english`、`#math`、`#chinese` 三个锚点在该页根本不存在对应 section（宣传页只做了物化生三科）。

**落地改动**：
- 按实际内容修正导航：m1 改为"1.1 信息类文本 / 1.2 文学类文本"（2 项），m4 改为"议论文结构 / 审题立意 / 备考建议"（3 项）。
- promo 的三项改为跨页深链 `index.html?goto=english|math|chinese`（目标项目的深链路由只认 `?goto=`，不认 hash，所以不能用 `#`）。
- 新增 `scripts/check-anchors.mjs`：校验 ① 页内 `href="#x"` 有对应 id；② 跨页 `?goto=x` 的值在 `js/deep-link.js` 的 `SECTIONS` 路由表内（**直接读源码解析路由表**，避免门禁自己维护副本而漂移）。
- 接入 `npm run verify` 与 `.github/workflows/verify.yml`（新增步骤 ④-b）。
- 按项目现有"门禁自举"传统，在 CI 增加**自检 D**：注入一个不存在的锚点，断言 `check:anchors` 必须失败（先断言 probe 落盘，防注入锚点漂移造成假阴性）。

**反向验证**：临时注入 `#this-id-does-not-exist` 和 `?goto=nosuchsubject`，门禁两类都报错退出 1；恢复后 exit 0。

---

### 3. 数据字段严格契约 + 未知字段守卫（来源：cn-math-taxonomy · 维度 4 · 高价值）

**源实践**：`scripts/validate.py:1558-1689` 逐字段校验 + `README.md:149-186` 字段表，文档与校验双写一致；`scripts/verify_questions.py:83-101` 枚举/白名单集中定义。

**目标项目缺陷（实测）**：
- `biology.json` 的 `BIO_2024_07` 把字段写成中文键 `知识要点`，导致 `knowledgePoints` 缺失（1198 题里 1197 有、它没有）——该题的考点关联、错题归因、搜索索引**全部落空**，旧校验器一句都不报。
- `english.json` 的 `ENG_2022_08` 残留空废弃字段 `解析_ignored: ""`。

**落地改动**：
- 数据修复：`知识要点` → `knowledgePoints`（恢复该题考点关联）；删除空废弃字段。
- `scripts/validate-data.mjs`：新增 `QUESTION_FIELDS` 白名单 + `validateQuestion` 未知字段 `warn`（12 个合法字段：id/year/type/difficulty/points/category/question/answer/analysis/knowledgePoints/options/passage）。
- 用 `warn` 而非 `error`：不阻断合法扩展，但要让人看见。

**反向验证**：注入 `知识要点测试` 字段 → 输出 `未知字段 ... （拼写错误会让该字段静默失效）`；恢复后 `PASS (0 warnings)`。

---

### 4. 数据契约文档（来源：cn-math-taxonomy 维度 10 + whk-wiki 维度 4）

**源实践**：cn-math `docs/questions.md:7-29`、`README.md:149-186` 字段表；whk `docs/intro/format.md:8-25` 成文的格式契约。

**目标项目缺口**：`data/*.json` 有校验器但**没有字段文档**，新人改数据只能靠读校验器反推。

**落地改动**：新增 `DATA-SCHEMA.md`（根目录，与 COMPETITION.md / ITERATION-PLAN.md 同级）：
- 数据文件地图（6 类）
- 题库 12 字段契约表（必填/类型/说明）
- 知识点结构
- 改完必须跑的校验 + 两条硬规矩（CACHE_NAME 递增、安卓资产同步）
- 已知陷阱表（6 条，每条对应一道门禁）

**特点**：文档里的每条陷阱都标注了实际拦截它的门禁，不是空泛建议。

---

### 5. PWA 安装入口（来源：cn-math-taxonomy · 维度 3 交互 · 中高价值）

**源实践**：`assets/pwa.js:23-30,120-190` 平台差异化——Chromium 走 `beforeinstallprompt`，iOS 走图文引导，standalone 不提示，关闭后记住。

**目标项目缺陷**：有 `manifest.json` + SW + README 提示"可添加到主屏幕"，但**代码里没有任何安装引导**（全库无 `beforeinstallprompt`），用户不知道能装。

**落地改动**：
- 新增 `1.2/js/pwa-install.js`（ES5 IIFE，零依赖）：监听 `beforeinstallprompt` 缓存事件、`appinstalled` 置位、`isStandalone()` 判已装（含 iOS 的 `navigator.standalone` 与 iPadOS 的 UA 伪装补判）、`available()/canPrompt()/hint()/prompt()` 四个 API。
- `settings-center.js` 通用页新增"安装到桌面"卡片：**复用现有的 `hspcb-card` / `hspcb-btn` / `el()`**，零新增样式；条件不满足时整卡不渲染，设置页与改动前完全一致。
- 引入顺序放在 `notification-center.js` 之前（尽早捕获事件）；加入 `sw.js` 预缓存清单；`CACHE_NAME` 递增至 `hspcb-v24`。

**为什么不做 cn-math 的 iOS 图文引导**：那需要新增浮层 UI 与样式，与"保留原生设计风格"冲突；改为在设置页给一行文字提示（`hint()`），体验损失很小。

**真实浏览器验证**：`hasModule: true` / `settingsOpened: true` / 打开设置前后 CSP 违规数均为 2（**未新增**）。

---

### 6. CI 最小权限（来源：whk-wiki · 维度 6 安全 · 高价值低成本）

**源实践**：`.github/workflows/deploy.yml:8-9` 仅 `contents: write`；`tests/test_ci_workflow.js` 元测试守护权限不被放宽。

**目标项目缺陷**：`verify.yml` 与 `e2e.yml` **均未声明 `permissions`**，使用仓库默认权限——若仓库设置放宽，第三方 action 可借 `GITHUB_TOKEN` 获得多余写权限。

**落地改动**：两个 workflow 顶层各加 `permissions: contents: read`（均只读代码跑测试，不需要写）。
`apk-release.yml` 保持 `contents: write`（发布 Release 必需，合理保留）。

**验证**：`yaml.safe_load` 解析两个文件，`permissions = {'contents': 'read'}`，步骤数 19 / 6 正常。
（注：`upload-artifact` 使用 runtime token，不受 `contents: read` 影响，已确认。）

---

### 7. 编辑器配置统一（来源：whk-wiki · 维度 4 · 低成本）

**源实践**：`.editorconfig:1-11`（LF、final newline、tab 缩进、去尾空格、yml 用 2 空格）。

**目标项目缺口**：无 `.editorconfig`，且 `core.autocrlf=true`（仓库 LF / 工作区 CRLF），多人协作易产生纯空白 diff。

**落地改动**：新增 `.editorconfig`：
- 统一 charset / final newline / trim trailing whitespace / space 缩进
- JS/CSS/HTML 4 空格、JSON/YAML 2 空格（**与项目现状一致**，不是强加新风格）
- `*.md` 关闭尾空格裁剪（Markdown 行尾两空格是硬换行，有语义）
- **刻意不声明 `end_of_line`**：行尾交给 git 的 autocrlf 管，避免编辑器与 git 互相覆盖

---

## 三、未采纳的优点及具体原因

### A 类：目标项目**已经具备**，无需迁移（核对后确认）

| 源优点 | 证据（源） | 目标项目现状（已具备） |
| --- | --- | --- |
| CI 元测试 / 门禁自校验 | cn-math `tests/test_ci_workflow.js:29-213` | `verify.yml` 已有"自检 A/B/C"注入缺陷验证门禁能失败；`scripts/verify-gate-tamper.mjs` 做门禁反向验证（6/6 抓住）。**已达标，本次只是把新门禁并入同标准（自检 D）** |
| fetch 去重 + 竞态 token | cn-math `assets/home.js:245-285` | `app-exam.js:40-76` 已有 `_bankPromise` / `_subjectPromises` 做同资源 Promise 去重；`demo-mode.js` 有 `injecting` 单次标志 |
| 受限表达式求值（AST 白名单 + 超时） | cn-math `scripts/verify_questions.py:95-161` | 目标项目**全库无 `eval` / `new Function`**（已 grep 确认），没有需要受限求值的场景。这条是为"配置化表达式"设计的，迁移过来没有落点 |
| 版本/缓存联动纪律 | cn-math `CHANGELOG.md:1-9` | `check:version` 已把 package.json / manifest / AndroidManifest / Gradle / CACHE_NAME / CHANGELOG 六处锁死，比源项目更严格 |
| SW 混合缓存策略 | cn-math `sw.js:100-139` | 目标项目 `sw.js` 已有 CACHE_NAME 版本化 + 安装期缓存 + 激活期清旧 |
| 无外网依赖验证 | cn-math `scripts/screenshot.js:1024-1025` | 目标项目 CSP `connect-src` 只放行四个更新源域，`check:csp` 门禁守内联；架构上已不可能引外源 |

### B 类：技术栈不兼容，**不适用**

| 源优点 | 原因 |
| --- | --- |
| whk `copy-tex.mjs` 复制公式转 TeX | 目标项目无 LaTeX/KaTeX 渲染管线，公式是纯文本或 canvas 绘制，无 TeX 源可复制 |
| whk 声明式目录 + autogenerated sidebar | 目标项目是单页应用（section 切换），无多页文档树，侧边栏概念不存在 |
| whk `_category_.json` + `displayed_sidebar` | 同上，Docusaurus 特有机制 |
| whk Yarn patch 注入 mhchem | 无 KaTeX，无化学式渲染 |
| whk `experimental_faster` / SWC 构建 | 目标项目无打包构建（源码直出 + esbuild 仅压缩产物） |
| 化学笔记的 Waypoint 插件（文件夹即节点） | Obsidian 插件生态，无法迁移到 Web 应用 |
| 化学笔记的 Excalidraw / Canvas 白板 | 目标项目已有自研 canvas 工具（生物绘图、涂鸦板），再引入 Excalidraw 违反"零依赖"约束 |

### C 类：需第三方依赖或重 UI，**违反本次约束**

| 源优点 | 不采纳原因 |
| --- | --- |
| whk GeoGebra 交互组件 | 需远程加载 `deployggb.js`，违反 CSP `script-src 'self'` 与"零外源"架构 |
| whk Giscus 评论 | 需 GitHub Discussions + 第三方 iframe，社交功能非本项目定位 |
| cn-math 诊断结果分享图（canvas 1080×1920） | 目标项目无"诊断测评"流程，没有可分享的结果对象。自研 canvas 工具已有，但用途不同（绘图而非分享卡） |
| cn-math 的 iOS 图文安装引导浮层 | 需新增浮层 UI + 样式，与"保留原生设计风格"冲突；已用设置页文字提示替代（见落地项 5） |

### D 类：内容层资产，**超出代码迁移范围 / 风险过高**

| 源优点 | 不采纳原因 |
| --- | --- |
| 化学笔记的双链网状知识关联（392 条 wiki-link） | 这是 318 篇笔记的组织方式，迁移意味着重构 168 个考点的数据结构与全部正文，属于内容重写而非代码迁移，且极易破坏现有知识图谱 |
| 化学笔记的"归纳式记忆锚点"（Na=活泼金属） | 同上，需为 168 个考点逐条撰写新内容，属于教研产出而非工程迁移；且无教师审核的 AI 生成内容会损害可信度 |
| cn-math 的学科可插拔前缀路由 | 目标项目六科已用 `data-subject` + `#xxx-section` 固定路由，改为前缀+动态注册需重构整个导航与渲染层，收益不抵风险 |

---

## 四、验证执行结果

### 4.1 目标项目现有自动化测试（全部执行）

```
npm run verify          → exit 0（13 道门禁 + 全部单测 + 冒烟，全绿）
  check:version         → ✓ 版本一致 v1.8.1（CACHE_NAME=hspcb-v24）
  check:data            → PASS (0 warnings)
  check:collisions      → 6 通过, 0 失败
  check:theme           → 全部通过（12/12）
  check:csp             → L1-L4 9 passed, C1-C12 13 passed, 0 failed
  check:schedule        → 9 passed, 0 failed
  check:lint            → 121 passed, 0 failed
  check:content         → 61 passed, 0 failed
  check:anchors（新增）  → ✓ 4 页面 · 37 锚点 · 3 深链，0 失效
  check:runtime         → 14 passed, 0 failed
  check:asset-sync      → 124 文件字节一致
  test:progress         → 29 passed
  test:cross-subject    → 14 passed
  test:schedule / sm2   → 15 passed
  test:update-check     → 14 passed
  test-import-transaction（新增）→ 17 passed
  冒烟                  → 77 passed
```

```
npm run test:e2e        → 5 passed (8.5s)
  error-notebook / exam-practice / global-search / mock-exam / subject-switch
```

### 4.2 构建校验

```
npm run build:pages     → ✓ JS 压缩 72 个 3.82 MB → 2.67 MB (−30.1%)
                          ✓ CSS 压缩 15 个 251 KB → 179 KB (−28.8%)
                          ✓ 产物 123 文件
```

### 4.3 反向验证（证明新门禁不是摆设）

| 门禁 | 注入的缺陷 | 结果 |
| --- | --- | --- |
| `check:anchors` | `<a href="#this-id-does-not-exist">` + `?goto=nosuchsubject` | 两类均报错，exit 1 ✓ |
| `check:data` 未知字段 | `"知识要点测试": []` | 报 `未知字段 ... 静默失效` ✓ |
| `test-import-transaction` | 只让主 key 写入抛 QuotaExceeded | 7 项失败路径断言全部成立 ✓ |

### 4.4 浏览器实测

- 页面正常渲染、无布局错位（截图确认首页/工具区/500px 窄屏）
- `window.HSPCBPwaInstall` 存在，设置中心可打开
- 打开设置中心**前后 CSP 违规数均为 2**（未新增）

---

## 五、剩余风险点

| 风险 | 说明 | 建议 |
| --- | --- | --- |
| **2 处既有 CSP 内联样式违规** | `style-src-elem` 阻止了 2 个由 JS 创建的 `<style>` 元素（多个模块用 `document.createElement('style')` 注入样式：global-search / onboarding / error-notebook / gamification 等）。这是**改动前就有**的问题，本次未新增，但也未修复——被阻止的样式会让对应模块（如搜索高亮、引导浮层）视觉退化 | 后续把这些内联 CSS 移到 `1.2/css/` 或用项目已有的 `cssom-style-bridge.js` 走 CSSOM 插入规则 |
| **PWA 安装入口只在 Chromium 生效** | `beforeinstallprompt` 仅 Chromium 系支持；Firefox/Safari 只会看到文字提示。iOS 的"Safari 分享→添加到主屏幕"是真机操作路径，headless 无法自动化验证 | 真机手动验一次 iOS Safari 与 Android Chrome |
| **`check:anchors` 不覆盖 JS 动态生成的 id** | 若将来某 section 改为渲染期注入 id，门禁会误报断链 | 届时在 `check-anchors.mjs` 加显式白名单（当前 0 断链，无需处理） |
| **深链 `?goto=tool:<id>` 未校验** | 门禁跳过 `tool:` 前缀（工具 id 由工具注册表管理，另有 `handler-integrity` 门禁覆盖） | 若出现工具改名，靠 `runtime-defer-check` 兜底 |
| **`BIO_2024_07` 的 `knowledgePoints` 是修复后首次生效** | 该题此前一直没有考点关联，错题归因/搜索索引此前对它无效；现在补上了，但它从未进入过归因统计 | 无需处理，仅说明数据口径有微小变化 |
| **题库字段白名单是"当前全集"** | 若将来新增合法字段（如 `source`、`tags`），`check:data` 会报未知字段警告 | 新增字段时同步更新 `scripts/validate-data.mjs` 的 `QUESTION_FIELDS` 与 `DATA-SCHEMA.md` |
| **安卓资产副本仍为构建产物** | 本次已同步 124 文件，但副本不入库，CI 靠 `check:asset-sync` 演练比对 | 保持现状（这是 v1.8 的既定架构，比入库副本更可靠） |
| **未迁移的内容层实践** | 化学笔记的双链组织、记忆锚点等属于教研产出 | 如需引入，应作为独立的内容治理任务，配教师审核 |

---

## 六、改动清单

**新增（5）**
- `scripts/check-anchors.mjs` — 链接完整性门禁
- `scripts/test-import-transaction.mjs` — 17 项事务安全测试
- `1.2/js/pwa-install.js` — PWA 安装能力探测
- `.editorconfig`
- `DATA-SCHEMA.md`

**修改（12）**
- `1.2/js/progress.js` — importData 事务回滚
- `1.2/js/settings-center.js` — 恢复失败提示 + PWA 安装卡片
- `1.2/js/index.html` — 引入 pwa-install.js；修正 m1/m4 导航断链
- `1.2/promo.html` — 三项锚点改跨页深链
- `1.2/sw.js` — 清单加 pwa-install.js；CACHE_NAME v23→v24
- `1.2/data/exam/biology.json` — 修正 `知识要点` → `knowledgePoints`
- `1.2/data/exam/english.json` — 删空废弃字段
- `scripts/validate-data.mjs` — 未知字段守卫
- `package.json` — 接入 check:anchors 与 test-import-transaction
- `.github/workflows/verify.yml` — ④-b 步骤 + 自检 D + permissions
- `.github/workflows/e2e.yml` — permissions
- `android/app/assets/web/**` — 资产同步（构建产物）

**未改**：任何现有功能逻辑、视觉样式、第三方依赖（devDependencies 仍只有 playwright + esbuild）。

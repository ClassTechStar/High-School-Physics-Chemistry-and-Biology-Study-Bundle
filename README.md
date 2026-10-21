# 高中物化生语数英学习大礼包

> 版本 1.3 · 六科（物理 / 化学 / 生物 / 数学 / 语文 / 英语）· 纯静态前端

面向广东高考的网页端学习工具，覆盖六科的知识点体系、题库、错题本与模拟考试。
全部内容为静态资源，无后端、无构建步骤、无运行时依赖，打开 `1.2/index.html` 即可使用，支持 PWA 离线安装。

---

## 仓库结构

```
High-School-Physics-Chemistry-and-Biology-Study-Bundle/
├── README.md
├── .gitignore
├── docs/               开发文档（勘误报告、开发方案、优化任务清单）
├── scripts/            校验与修复工具（Node ≥ 18，无三方依赖）
├── .github/workflows/  CI：push/PR 自动跑 verify 门禁
├── 1.1/                版本 1.1 归档（物化生三科，只读）
│   ├── index.html
│   ├── presentation.html / promo.html
│   ├── css/style.css
│   ├── js/             6 个功能模块
│   └── data/           物化生三科知识点 + 题库
└── 1.2/                当前开发目录（六科 + PWA + 游戏化）
    ├── index.html              主入口
    ├── manifest.json           PWA 应用清单
    ├── sw.js                   Service Worker（离线缓存）
    ├── presentation.html       项目介绍页
    ├── promo.html              宣传页
    ├── presentation.css / promo.css
    ├── css/
    │   ├── style.css           主样式
    │   ├── theme-dark.css      暗色主题
    │   ├── tokens.css          设计令牌
    │   ├── responsive.css      响应式补充（原 index.html 内联 <style> 块，T3-4f 外置）
    │   └── chinese-knowledge.css 语文知识面板样式（同上）
    ├── js/                     46 个功能模块
    │   ├── app.js / app-physics.js / app-chemistry.js / app-biology.js / app-exam.js
    │   ├── math-tools.js               数学工具
    │   ├── chinese-tools.js            语文工具（病句修改等）
    │   ├── english-tools.js            英语工具
    │   ├── english-vocabulary.js       英语词汇
    │   ├── gamification-system.js      游戏化系统（积分 / 成就 / 关卡）
    │   ├── game-scratchpad.js          游戏记事本
    │   ├── chemistry-3d-molecules.js   3D 分子可视化
    │   ├── biology-cell-division.js    细胞分裂互动模拟
    │   ├── physics-wave-optics.js      波动光学模拟
    │   ├── interactive-chemistry.js    化学互动实验
    │   ├── interactive-physics-bio.js  物理 / 生物互动实验
    │   ├── global-search.js            全局搜索
    │   ├── learning-path-recommender.js 学习路径推荐
    │   ├── error-notebook.js           错题本
    │   ├── mock-exam.js                模拟考试
    │   ├── open-answer-trainer.js      开放性答题训练
    │   ├── onboarding.js               新手引导
    │   ├── guangdong-features.js       广东高考特色功能
    │   ├── data-analysis-enhanced.js   数据分析
    │   ├── study-dashboard.js          学习仪表盘
    │   └── ...                        其余工具模块
    └── data/                   六科知识点 + 扩展题库
        ├── exam-bank.json              综合题库（1301 题）
        ├── cross-subject.json          跨学科专题（运行时加载）
        ├── variation-bank.json         变式题库
        ├── answer-templates.json       答题模板
        ├── framework-questions.json    框架题
        ├── knowledgePoints-thesaurus.json 考点别名表（错题归因）
        ├── _archive/                   已归档的历史副本，不再预缓存
        ├── physics/knowledge.json
        ├── chemistry/knowledge.json
        ├── biology/knowledge.json
        ├── math/knowledge.json
        ├── chinese/knowledge.json
        └── english/knowledge.json
```

---

## 快速开始

### 用本地服务器打开（功能完整）

题库 JSON 通过 `fetch` 加载，必须用 HTTP 协议访问，直接双击 HTML 会被浏览器的 `file://` 策略拦截。

```bash
# 方式 1：Python
cd 1.2
python -m http.server 8000
# 浏览器访问 http://localhost:8000

# 方式 2：仓库根目录（需 Node ≥ 18）
npm run serve
```

也可用 `npx serve 1.2` 或 `npx http-server 1.2 -p 8000`。

### 直接打开 `1.2/index.html`（降级）

`file://` 下 `fetch` 被拦截，知识点页可能可见，但题库与扩展数据加载会失败。仅用于预览界面。

### 安装为 PWA

用 Chrome / Edge 通过 http(s) 或本地服务器打开 `1.2/index.html`，在地址栏点击「安装」。Service Worker 在 `file://` 下不可用。

---

## 功能

| 模块 | 说明 |
| --- | --- |
| 首页导航 | 在物理 / 化学 / 生物 / 数学 / 语文 / 英语之间切换 |
| 物理 | 力学、电磁学、光学、热学、近代物理知识点与易错点，抛体与波动光学模拟 |
| 化学 | 化学计量、元素化合物、有机化学、反应原理、实验，3D 分子可视化与配平器 |
| 生物 | 细胞、遗传、代谢、生态、调节、现代生物技术，细胞分裂模拟 |
| 数学 | 函数、几何、代数、统计类知识点与工具 |
| 语文 | 现代文阅读、文言文、古诗词鉴赏、作文、病句修改 |
| 英语 | 词汇、语法、阅读、写作工具 |
| 题库 | 1301 道题，按学科、章节、难度、年级筛选；错题可加入错题本 |
| 错题归因 | 错题按知识点归类，结合考点别名表生成复习路径 |
| 提分工具 | 学习仪表盘、考试回顾、模拟考试、开放性答题训练 |
| 游戏化 | 积分、成就、等级 |
| 全局搜索 | 跨学科知识点与题目检索 |

---

## 开发与质量门禁

从仓库根目录执行：

```bash
npm run verify            # 全量：数据质检 + 碰撞扫描 + 主题/CSP/静态/内容/运行时检查 + 单测 + 冒烟
npm run check:data        # 数据 schema、题库质检、SW 资源清单、首页卡片结构
npm run check:collisions  # 跨文件顶层声明重名扫描
npm run check:lint        # 静态规则：裸 localStorage、重复实现、内联色值等
npm run check:content     # 内容规则：解析质量、模板化解析、答案分布等
npm run check:runtime     # 运行时：defer 时序导致的静默失效
npm run check:csp         # CSP 收紧：内联事件属性 / 内联 script 块 / 静态 style 属性 / <style> 块残留检查 + meta CSP 断言
npm run check:theme       # 暗色主题令牌化检查
npm run test              # 进度存储单测
npm run test:smoke        # 功能冒烟
node scripts/nocache-server.mjs 1.2 8902   # 禁用缓存的本地调试服务器
```

各脚本职责：

- `scripts/validate-data.mjs`：校验六科 `knowledge.json`、`exam-bank.json`（schema v2 `questions` 字段、字母答案必须有 options 且不越界、解析声明的答案字母必须与 `answer` 一致、内部备注黑名单）、扩展题库、SW 资源清单、首页 `subject-cards` 嵌套。
- `1.2/js/progress.js`：统一进度存储 `hspcb.v2.*`，启动时自动从 v1 裸 key 迁移，支持导出 / 导入备份。

当前数据基线：六科 **1301** 道题（另有 417 条历史副本已归档至 `1.2/data/_archive/`，可追溯回滚）。四选项单选题共 1053 道，全局答案分布 A262 / B250 / C251 / D290，各学科单字母占比均在 22%–31% 之间。

---

## 版本与目录策略

| 版本 | 内容 | 位置 |
| --- | --- | --- |
| 1.1 | 物化生三科初版 | `1.1/`（只读归档，不再接受功能 PR） |
| 1.2 | 六科 + PWA + 游戏化 | `1.2/` |
| 1.3 | 性能、健壮性、题库修复、存储收敛、CI | `1.2/`（当前唯一活跃开发目录） |

- 历史版本用 Git tag 对照，不在仓库里再开并排的 `1.3/` 目录。
- 修复与新功能只改 `1.2/` 和根目录的脚本与文档。
- 大改动建议开分支（如 `phase/a-stabilize`），跑通 `npm run check:data` 后再合入 `main`。
- 逐版本改动记录见 [CHANGELOG.md](CHANGELOG.md)。

---

## 使用说明

1. 首次进入默认展示总览，点顶部学科按钮切换；首次使用有新手引导。
2. 浏览知识点时按章节与考点组织，每个考点包含 `keyPoints`（核心要点）与 `commonMistakes`（常见错误）。
3. 做题后错题可加入错题本，在「提分工具 → 错题回顾」按知识点归类。
4. 互动实验包括 3D 分子、细胞分裂、波动光学等。
5. 学习记录（错题、收藏、进度）保存在浏览器 `localStorage`，清除浏览器数据会重置；可在设置里导出备份。

---

## 技术栈

- HTML5 + CSS3 + 原生 JavaScript（ES6+），无构建、无打包步骤
- 零运行时依赖，不需要 `npm install`
- PWA：`manifest.json` + Service Worker，可离线安装
- 数据驱动：题库与知识点均为 JSON，便于扩展
- 设计令牌：`css/tokens.css` 驱动明暗主题
- 响应式布局，桌面 / 平板 / 手机可用
- Canvas / SVG 用于 3D 分子、细胞分裂、波动光学等可视化

---

## 贡献

可改动的部分：

- `1.2/data/<subject>/knowledge.json`：补充或修正知识点
- `1.2/data/exam-bank.json`：新增题目。schema v2 为每科 `questions` 数组；`analysis` 中不得留下「修正后 / TODO / 占位」等内部备注，也不得写「正确答案为 X」之外无实质内容的套话
- `1.2/js/`：工具模块
- `1.2/css/`：样式

提交前先跑通：

```bash
npm run verify
```

写学习进度用 `HSPCBProgress`（`1.2/js/progress.js`），散装工具数据用 `HSPCBStore`（同文件），不要再新增裸 `localStorage` 调用（主题引导、主题应用、数据导出枚举三处白名单除外）。

---

## 许可

仅供学习交流使用。题目与知识点整理自公开教材与考纲，版权归原作者所有。
代码与结构设计遵循仓库根目录 `LICENSE`（CC BY-NC-SA 4.0）；真题内容版权归原作者 / 出版方，本项目仅作学习整理。

---

## 相关链接

- 仓库主页：<https://github.com/ClassTechStar/High-School-Physics-Chemistry-and-Biology-Study-Bundle>
- 当前开发目录：`/1.2/`；历史归档：`/1.1/`（只读）
- 问题反馈：在 GitHub 提交 Issue

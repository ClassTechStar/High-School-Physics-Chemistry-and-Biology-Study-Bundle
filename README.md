# 高中物化生语数英学习大礼包 — High School Study Bundle

> 版本 1.2 / Version 1.2 · 广东高考智能备考平台 / Guangdong Gaokao Smart Prep Platform
> "一体两翼"架构 · 数据驱动精准提分 · 六科全覆盖

一个面向广东高考的网页端学习大礼包,涵盖 **物理 / 化学 / 生物 / 数学 / 语文 / 英语** 六大学科,提供知识体系、常考题型、错题归因、游戏化激励与综合提分工具。所有内容均为 **纯前端静态资源** —— 打开 `1.2/index.html` 即可使用,无需任何后端或网络连接,支持 PWA 离线安装。

---

## 📂 仓库结构

```
High-School-Physics-Chemistry-and-Biology-Study-Bundle/
├── README.md           ← 本文件(使用指南)
├── .gitignore
├── 1.1/                ← 版本 1.1 的全部学习资料(物化生三科)
│   ├── index.html
│   ├── presentation.html / promo.html
│   ├── css/style.css
│   ├── js/             ← 7 个核心模块
│   └── data/           ← 物化生三科知识体系 + 综合题库
└── 1.2/                ← 版本 1.2 的全部学习资料(六科 + PWA + 游戏化)
    ├── index.html              ← 主入口(打开它即可使用)
    ├── manifest.json           ← PWA 应用清单(可安装到桌面)
    ├── sw.js                   ← Service Worker(离线缓存)
    ├── presentation.html       ← 项目介绍页
    ├── promo.html              ← 宣传页
    ├── presentation.css / promo.css
    ├── check-syntax.js         ← 语法检查工具
    ├── expand-exam-bank-unified.py  ← 题库扩展脚本(Python)
    ├── css/
    │   ├── style.css           ← 主样式
    │   └── tokens.css          ← 设计令牌(主题/暗色模式)
    ├── js/                     ← 46 个功能模块
    │   ├── app.js / app-physics.js / app-chemistry.js / app-biology.js / app-exam.js
    │   ├── math-tools.js               ← 数学工具
    │   ├── chinese-tools.js            ← 语文工具(病句修改等)
    │   ├── english-tools.js            ← 英语工具
    │   ├── english-vocabulary.js       ← 英语词汇
    │   ├── gamification-system.js      ← 游戏化系统(积分/成就/关卡)
    │   ├── game-scratchpad.js          ← 游戏记事本
    │   ├── chemistry-3d-molecules.js   ← 3D 分子可视化
    │   ├── biology-cell-division.js    ← 细胞分裂互动模拟
    │   ├── physics-wave-optics.js      ← 波动光学模拟
    │   ├── interactive-chemistry.js    ← 化学互动实验
    │   ├── interactive-physics-bio.js  ← 物理/生物互动实验
    │   ├── global-search.js            ← 全局搜索
    │   ├── learning-path-recommender.js ← 学习路径推荐
    │   ├── error-notebook.js           ← 错题本
    │   ├── mock-exam.js                ← 模拟考试
    │   ├── open-answer-trainer.js      ← 开放性答题训练
    │   ├── onboarding.js               ← 新手引导
    │   ├── guangdong-features.js       ← 广东高考特色功能
    │   ├── data-analysis-enhanced.js   ← 数据分析增强
    │   ├── study-dashboard.js          ← 学习仪表盘
    │   └── ...                        ← 更多工具模块
    └── data/                   ← 六科知识体系 + 扩展题库
        ├── exam-bank.json              ← 综合题库
        ├── cross-subject.json          ← 跨学科专题
        ├── situational.json            ← 情境题
        ├── variation-bank.json         ← 变式题库
        ├── tech-frontiers.json         ← 科技前沿
        ├── answer-templates.json       ← 答题模板
        ├── framework-questions.json    ← 框架题
        ├── knowledgePoints-thesaurus.json ← 考点词典
        ├── physics/knowledge.json
        ├── chemistry/knowledge.json
        ├── biology/knowledge.json
        ├── math/knowledge.json
        ├── chinese/knowledge.json
        └── english/knowledge.json
```

---

## 🆕 V1.2 新特性

| 类别 | 新增内容 |
| --- | --- |
| 📚 **六科全覆盖** | 新增 数学 / 语文 / 英语 三科,从三科扩展到六科 |
| 📱 **PWA 支持** | 可安装到桌面/主屏幕,支持离线使用(Service Worker 缓存) |
| 🎮 **游戏化系统** | 积分、成就、等级、关卡,让学习更有动力 |
| 🧬 **3D 分子可视化** | 化学分子三维渲染与互动旋转 |
| 🔬 **互动模拟实验** | 细胞分裂、波动光学、化学实验等互动模拟 |
| 🔍 **全局搜索** | 跨学科知识点 / 题目一键检索 |
| 🧭 **学习路径推荐** | 基于薄弱点的智能学习路径推荐 |
| 🌙 **暗色模式** | 设计令牌驱动的主题切换(明/暗) |
| 🏁 **新手引导** | 首次使用引导流程 |
| 📊 **扩展题库** | 跨学科、情境题、变式题、科技前沿、答题模板等 |
| 🎯 **广东特色** | 2022-2026 广东真题分析、地市模拟卷 |

---

## 🚀 快速开始

### 方式 A:直接打开(最简单)

1. 克隆或下载本仓库
   ```bash
   git clone https://github.com/ClassTechStar/High-School-Physics-Chemistry-and-Biology-Study-Bundle.git
   ```
2. 双击 `1.2/index.html`,使用默认浏览器打开即可

> ⚠️ 提示:由于浏览器对本地 `file://` 协议下的 `fetch()` 存在限制,**强烈建议使用方式 B 或 C**,否则部分题库加载可能失败。

### 方式 B:用 Python 启动本地服务器(推荐)

```bash
cd 1.2
python -m http.server 8000
```

然后在浏览器访问 <http://localhost:8000>。

### 方式 C:用 Node.js 启动本地服务器

```bash
cd 1.2
npx serve .   # 或 npx http-server -p 8000
```

### 方式 D:安装为 PWA 应用

使用 Chrome / Edge 打开 `1.2/index.html`(需通过本地服务器),点击地址栏右侧的"安装"按钮即可安装为桌面应用,支持离线使用。

---

## 🎯 核心功能

| 模块 | 说明 |
| --- | --- |
| 🏠 **首页导航** | 一键切换 物理 / 化学 / 生物 / 数学 / 语文 / 英语 六大模块 |
| ⚡ **物理** | 力学、电磁学、光学、热学、近代物理知识点 + 易错点 + 互动模拟 |
| 🧪 **化学** | 化学计量、元素化合物、有机化学、反应原理、实验、3D 分子可视化 |
| 🧬 **生物** | 细胞、遗传、代谢、生态、调节、现代生物技术 + 细胞分裂模拟 |
| 📐 **数学** | 函数、几何、代数、统计等知识点与工具 |
| 📚 **语文** | 现代文阅读、文言文、古诗词鉴赏、作文、病句修改 |
| 🇬🇧 **英语** | 词汇、语法、阅读、写作工具 |
| 📝 **题库** | 综合题库 + 跨学科 + 情境题 + 变式题,支持按学科、章节、难度筛选 |
| 📊 **错题归因** | 标记错题,自动归类到对应知识点,生成个性化复习计划 |
| 📈 **提分工具** | 学习仪表盘、考试回顾系统、模拟考试、智能刷题 |
| 🎮 **游戏化** | 积分、成就、等级系统,激励持续学习 |
| 🔍 **全局搜索** | 跨学科知识点 / 题目一键检索 |
| 🧭 **学习路径** | 基于薄弱点的智能学习路径推荐 |

---

## 🔧 使用指南

1. **首次进入** — 默认展示"首页/总览",可点击顶部学科按钮切换;首次使用有新手引导
2. **浏览知识点** — 进入学科后,按章节与考点组织;每个考点包含
   - `keyPoints`:核心要点
   - `commonMistakes`:常见错误
3. **刷题与错题** — 在题库中做题,错题可加入"错题本";系统在"提分工具 → 错题回顾"自动按知识点归类
4. **互动实验** — 化学 3D 分子、细胞分裂、波动光学等互动模拟,加深理解
5. **游戏化激励** — 完成任务、做题、复习均可获得积分与成就
6. **数据本地化** — 所有学习记录(错题、收藏、进度)保存在浏览器 `localStorage`,清除浏览器数据会重置

---

## 🛠 技术栈

- **纯 HTML5 + CSS3 + 原生 JavaScript(ES6+)** — 无任何构建/打包步骤
- **零依赖** — 不需要 npm install、不需要任何运行时
- **PWA** — manifest.json + Service Worker,可离线安装
- **数据驱动** — 全部题库 / 知识点以 JSON 形式存放,易于扩展和二次开发
- **设计令牌** — tokens.css 驱动主题系统,支持明暗模式切换
- **响应式布局** — 桌面、平板、手机均可使用
- **Canvas / SVG** — 用于 3D 分子、细胞分裂、波动光学等可视化

---

## 📌 版本说明

| 版本 | 内容 | 备注 |
| --- | --- | --- |
| **1.1** | 完整学习平台初版 | 包含物理 / 化学 / 生物三科知识体系、综合题库、错题归因、提分工具 |
| **1.2** | 六科全覆盖 + PWA + 游戏化 | 新增数学 / 语文 / 英语三科、PWA 离线支持、游戏化系统、3D 分子可视化、互动模拟实验、全局搜索、学习路径推荐、暗色模式、扩展题库(跨学科 / 情境题 / 变式题 / 科技前沿) |

后续版本(如 2.0)将在 `2.0/` 之类的版本号目录中提供,各版本内容相对独立,互不覆盖。

---

## 🤝 贡献与二次开发

欢迎:
- 在 `data/<subject>/knowledge.json` 中补充 / 修正知识点
- 在 `data/exam-bank.json` 中添加新题
- 优化 `js/` 中的工具模块
- 改进 `css/style.css` 的样式
- 运行 `expand-exam-bank-unified.py` 扩展题库

修改后直接 `git commit` + `git push` 即可。

---

## 📄 许可

仅供学习交流使用。题目与知识点整理自公开教材与考纲,版权归原作者所有。

---

## 🔗 相关链接

- 仓库主页:<https://github.com/ClassTechStar/High-School-Physics-Chemistry-and-Biology-Study-Bundle>
- 版本目录:`/1.1/`(V1.1)、`/1.2/`(V1.2,最新)
- 问题反馈:在 GitHub 上提交 Issue

> Made with ❤️ for Guangdong Gaokao 高考备考

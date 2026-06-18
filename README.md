# 高中物化生学习大礼包 — High School Physics, Chemistry, and Biology Study Bundle

> 版本 1.1 / Version 1.1 · 广东高考智能备考平台 / Guangdong Gaokao Smart Prep Platform
> "一体两翼"架构 · 数据驱动精准提分

一个面向广东高考(物理 / 化学 / 生物)的网页端学习大礼包,涵盖知识体系、常考题型、错题归因与综合提分工具。所有内容均为 **纯前端静态资源** —— 打开 `1.1/index.html` 即可使用,无需任何后端或网络连接。

---

## 📂 仓库结构

```
High-School-Physics-Chemistry-and-Biology-Study-Bundle/
├── README.md           ← 本文件(使用指南)
├── .gitignore
└── 1.1/                ← 版本 1.1 的全部学习资料
    ├── index.html              ← 主入口(打开它即可使用)
    ├── presentation.html       ← 项目介绍页
    ├── promo.html              ← 宣传页
    ├── presentation.css
    ├── promo.css
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── app.js              ← 主应用逻辑
    │   ├── comprehensive-data.js
    │   ├── content-enhancement.js
    │   ├── enhanced-tools.js
    │   ├── exam-review-system.js
    │   ├── platform-system.js
    │   └── check-syntax.js
    └── data/
        ├── exam-bank.json          ← 综合题库
        ├── biology/
        │   └── knowledge.json      ← 生物知识体系
        ├── chemistry/
        │   └── knowledge.json      ← 化学知识体系
        └── physics/
            └── knowledge.json      ← 物理知识体系
```

---

## 🚀 快速开始

### 方式 A:直接打开(最简单)

1. 克隆或下载本仓库
   ```bash
   git clone https://github.com/Yihggh/High-School-Physics-Chemistry-and-Biology-Study-Bundle.git
   ```
2. 双击 `1.1/index.html`,使用默认浏览器打开即可

> ⚠️ 提示:由于浏览器对本地 `file://` 协议下的 `fetch()` 存在限制,**强烈建议使用方式 B 或 C**,否则部分题库加载可能失败。

### 方式 B:用 Python 启动本地服务器(推荐)

```bash
cd 1.1
python -m http.server 8000
```

然后在浏览器访问 <http://localhost:8000>。

### 方式 C:用 Node.js 启动本地服务器

```bash
cd 1.1
npx serve .   # 或 npx http-server -p 8000
```

---

## 🎯 核心功能

| 模块 | 说明 |
| --- | --- |
| 🏠 **首页导航** | 一键切换 物理 / 化学 / 生物 三大模块 |
| ⚡ **物理** | 力学、电磁学、光学、热学、近代物理知识点 + 易错点 |
| 🧪 **化学** | 化学计量、元素化合物、有机化学、反应原理、实验、化学用语 |
| 🧬 **生物** | 细胞、遗传、代谢、生态、调节、现代生物技术 |
| 📝 **题库** | `data/exam-bank.json` 收录综合题目,支持按学科、章节、难度筛选 |
| 📊 **错题归因** | 标记错题,自动归类到对应知识点,生成个性化复习计划 |
| 📈 **提分工具** | 综合数据看板、考试回顾系统、智能刷题 |

---

## 🔧 使用指南

1. **首次进入** — 默认展示"首页/总览",可点击顶部学科按钮切换
2. **浏览知识点** — 进入学科后,按章节与考点组织;每个考点包含
   - `keyPoints`:核心要点
   - `commonMistakes`:常见错误
3. **刷题与错题** — 在题库中做题,错题可加入"错题本";系统在"提分工具 → 错题回顾"自动按知识点归类
4. **数据本地化** — 所有学习记录(错题、收藏、进度)保存在浏览器 `localStorage`,清除浏览器数据会重置

---

## 🛠 技术栈

- **纯 HTML5 + CSS3 + 原生 JavaScript(ES6+)** — 无任何构建/打包步骤
- **零依赖** — 不需要 npm install、不需要任何运行时
- **数据驱动** — 全部题库 / 知识点以 JSON 形式存放,易于扩展和二次开发
- **响应式布局** — 桌面、平板、手机均可使用

---

## 📌 版本说明

| 版本 | 内容 | 备注 |
| --- | --- | --- |
| **1.1** | 完整学习平台初版 | 包含物理 / 化学 / 生物三科知识体系、综合题库、错题归因、提分工具 |

后续版本(如 1.2 / 2.0)将在 `1.2/`、`2.0/` 之类的版本号目录中提供,各版本内容相对独立,互不覆盖。

---

## 🤝 贡献与二次开发

欢迎:
- 在 `data/<subject>/knowledge.json` 中补充 / 修正知识点
- 在 `data/exam-bank.json` 中添加新题
- 优化 `js/` 中的工具模块
- 改进 `css/style.css` 的样式

修改后直接 `git commit` + `git push` 即可。

---

## 📄 许可

仅供学习交流使用。题目与知识点整理自公开教材与考纲,版权归原作者所有。

---

## 🔗 相关链接

- 仓库主页:<https://github.com/Yihggh/High-School-Physics-Chemistry-and-Biology-Study-Bundle>
- 版本目录:`/1.1/`
- 问题反馈:在 GitHub 上提交 Issue

> Made with ❤️ for Guangdong Gaokao 高考备考

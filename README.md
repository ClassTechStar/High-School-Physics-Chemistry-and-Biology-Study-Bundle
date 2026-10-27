# 高中物化生语数英学习大礼包

一个网页版的高中学习工具，覆盖物理、化学、生物、数学、语文、英语六科。
知识点、题库、错题本、模拟考试都在一个页面里，纯静态实现，不依赖后端。

在线版：<https://classtechstar.github.io/High-School-Physics-Chemistry-and-Biology-Study-Bundle/>

## 怎么用

**直接用在线版**，浏览器打开就能用。Chrome / Edge 可以「添加到主屏幕」装成 PWA，
离线也能继续看已缓存的部分。

**想在本地跑**，题库是 JSON 文件，浏览器不允许 `file://` 直接读取，所以得用本地服务器：

```bash
cd 1.2
python -m http.server 8000     # 然后打开 http://localhost:8000
```

或者在仓库根目录跑 `npm run serve`（需要 Node 18 以上）。
直接双击 `1.2/index.html` 也能看界面，但题目和部分数据加载不出来。

## 里面有什么

| 科目 | 内容 |
| --- | --- |
| 物理 | 力学、电磁学、光学、热学、近代物理；抛体与波动光学模拟 |
| 化学 | 计量、元素化合物、有机、反应原理、实验；3D 分子模型和方程式配平 |
| 生物 | 细胞、遗传、代谢、生态、调节、生物技术；细胞分裂演示 |
| 数学 | 函数、几何、代数、统计知识点与计算器 |
| 语文 | 现代文、文言文、古诗词、作文、病句修改 |
| 英语 | 词汇、语法、阅读、写作工具 |

另外还有题库练习（1198 题，可按学科、章节、难度筛选，分页加载）、错题本、模拟考试、
学习仪表盘和全局搜索。做错的题会按知识点归类，方便回头补漏。

### 平台能力（右下角 ⚙️ 设置中心）

- **通知中心**：应用内提醒（打卡、错题积压、作息时段），可按类型开关，PWA 装好后可申请系统通知。
- **作息表**：定义每天的学习时段（支持单双周、假期覆写），驱动「当前时段」卡片和到点提醒；可在设置里可视化编辑。
- **迷你组件**：仪表盘底部的时钟 / 当前时段 / 错题概览 / 打卡连击卡片，可增删排序。
- **备份快照**：每日自动快照最近 3 份，设置里可一键恢复。
- **朗读**：英语题目和单词卡可点击朗读（Web Speech API）。
- **主题包**：内置「护眼纸色」外观包，加载失败自动回退。
- **锁定模式**：机房共用电脑可设 PIN 隐藏「清除数据」入口（防误触，非加密）。
- **轻插件**：见下方「写一个插件」。

## 目录说明

```
1.1/    早期版本（物化生三科），只读归档，不再改
1.2/    当前版本，所有功能在这里
        ├── index.html     入口
        ├── css/           样式
        ├── js/            功能脚本
        ├── data/          知识点、题库与作息表
        ├── plugins/       轻插件（清单 + 入口脚本）
        └── sw.js          离线缓存
scripts/                    数据校验等开发工具
```

## 改代码前

跑一下校验，能拦住大部分低级错误：

```bash
npm run verify
```

几条约定：

- 进度、错题这些存在浏览器 `localStorage` 里，用 `HSPCBProgress` 或 `HSPCBStore`
  读写，别直接操作 `localStorage`（三处历史例外在 `scripts/check-lint.mjs` 里登记过）。
- 加题目写进 `1.2/data/exam-bank.json`，每科一个 `questions` 数组。
  `analysis` 字段写解析本身，别放「修正后」「TODO」这类草稿标记。
- 样式改动如果涉及颜色，尽量用 `css/tokens.css` 里已有的变量，明暗主题会一起生效。
- 模板里不要写 `onclick=` 和 `style=`（CSP 禁止），用 `data-call` / `data-hook` 事件委托
  和 `data-style` 声明式样式（`csp-delegation.js` / `cssom-style-bridge.js` 会接管）。

## 写一个插件

一个插件 = 一份清单 + 一个入口脚本，零构建：

```
1.2/plugins/my-plugin/hspcb-plugin.json
{
  "id": "my-plugin", "name": "我的插件", "version": "1.0.0",
  "apiVersion": "1.0.0", "entry": "my-plugin.js"
}
1.2/plugins/my-plugin/my-plugin.js
if (window.HSPCBPlugin) {
  window.HSPCBPlugin.register({
    id: 'my-plugin', name: '我的插件', version: '1.0.0', apiVersion: '1.0.0',
    setup: function (ctx) {
      // ctx.notify({title, message, level})     发通知（设置里可关）
      // ctx.bus.on('exam:answered', fn)         订阅答题/打卡等事件
      // ctx.widgets.register({id,name,render})  加一张仪表盘卡片
      // ctx.store.get/set(key, value)           插件私有存储
    }
  });
}
```

然后在 `1.2/plugins/index.json` 里加上清单路径即可。`apiVersion` 主版本与运行时不符、
入口加载超时或脚本报错的插件会被自动隔离（连续 2 次失败停载）；
地址栏加 `?safe=1` 可临时跳过全部插件。参考实现：`1.2/plugins/example/`。

## 许可

仅供学习交流。题目和知识点整理自公开教材与考纲，版权归原作者所有。
代码部分遵循仓库根目录的 `LICENSE`（CC BY-NC-SA 4.0）。

问题和建议在 GitHub 提 Issue。

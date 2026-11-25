# 高中物化生语数英学习大礼包

一个网页版的高中学习工具，覆盖物理、化学、生物、数学、语文、英语六科。
知识点、题库、错题本、模拟考试都在一个页面里，纯静态实现，不依赖后端。

> v1.9：首屏脚本约 0.45MB（工具按需加载）、字体 0.87MB；安卓更新包强制 SHA-256 校验；
> 支持快照文件 / WebDAV 数据同步（实验）。详见 [CHANGELOG.md](CHANGELOG.md)。

在线版：<https://classtechstar.github.io/High-School-Physics-Chemistry-and-Biology-Study-Bundle/>

参赛与答辩：见 [COMPETITION.md](COMPETITION.md)（评审维度映射、三分钟演示脚本、答辩 Q&A）；作品展示页：[showcase.html](1.2/showcase.html)。
安卓端：原生 APK；**检查更新**内置：启动静默检查（24h 频控）+ 设置 → 通用「检查更新」按钮，更新源默认 GitHub Release（Gitee 回退），安卓端应用内下载 APK 并唤起系统安装器（工具：`scripts/publish-release.py`）（源码在 [`android/`](android/)，构建说明见 [`android/README.md`](android/README.md)）；
APK 从 [GitHub Releases](https://github.com/ClassTechStar/High-School-Physics-Chemistry-and-Biology-Study-Bundle/releases) 下载（二进制不入库，发布时 CI 自动构建）。

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

另外还有题库练习（1218 题，可按学科、章节、难度筛选，分页加载）、错题本、模拟考试、
学习仪表盘和全局搜索。做错的题会按知识点归类，方便回头补漏。

### 平台能力（右下角 ⚙️ 设置中心）

- **通知中心**：应用内提醒（打卡、错题积压、作息时段），可按类型开关，PWA 装好后可申请系统通知。
- **作息表**：定义每天的学习时段（支持单双周、假期覆写），驱动「当前时段」卡片和到点提醒；可在设置里可视化编辑。
- **迷你组件**：仪表盘底部的时钟 / 当前时段 / 错题概览 / 打卡连击 / 复习队列（SM-2 到期 + 薄弱知识点，含近 30 天掌握度曲线）卡片，可增删排序。
- **备份快照**：每日自动快照最近 3 份，设置里可一键恢复。
- **数据同步（实验）**：错题本、进度、设置打包为一份 JSON 快照——可导出文件换设备导入，
  也可填自己的 WebDAV（坚果云 / Nextcloud 等）一键上传/下载。恢复与导入按更新时间合并，
  本机较新的数据不会被旧快照覆盖；两端都改过的键会列为冲突，可一键选用远端。
  密码为本地明文存储，建议使用应用专用密码。
- **朗读**：英语题目和单词卡可点击朗读（Web Speech API）。
- **主题包**：内置「护眼纸色」与「液态玻璃」外观包（后者含背景折射增强，非 Chromium 浏览器自动回退纯磨砂），加载失败自动回退默认外观。
- **锁定模式**：机房共用电脑可设 PIN 隐藏「清除数据」入口（防误触，非加密）。
- **轻插件**：见下方「写一个插件」。

## 目录说明

```
1.2/                当前版本（站点根），所有功能在这里
        ├── index.html     入口
        ├── css/           样式（含 css/responsive.css 移动端断点）
        ├── js/            功能脚本（js/modules/ 为新代码的 ES Module 目录）
        ├── data/          知识点、作息表（ODbL，见 data/DATA-LICENSE）
        │   └── exam/      题库：index.json 清单 + {subject}.json 六科分文件
        ├── plugins/       轻插件（清单 + 入口脚本）
        ├── fonts/         MiSans 子集 woff2（由 scripts/build-font.py 生成）
        └── sw.js          离线缓存
android/                    原生安卓壳（Kotlin/Java，build-apk.sh 免 Gradle 构建）
contrib/                    题库投稿（JSON Schema + 示例 + 合入脚本）
e2e/                        Playwright 端到端测试
scripts/                    数据校验等开发工具（npm run verify 的 15 道门禁）
ARCHITECTURE.md             脚本分层、全局命名空间、数据流与迁移约定
SECURITY.md                 威胁模型：更新链、签名、CSP、WebDAV、插件
COMPETITION.md              参赛评审维度映射、演示脚本与答辩 Q&A
DESIGN-MD3.md               MD3 设计规范（令牌来源、组件清单、校验规则）
ITERATION-PLAN.md           历次迭代计划与验收记录
CHANGELOG.md                更新日志
```

> `1.1/` 旧版（物化生三科）已移出主仓，需要时从 tag `v1.1` 取回。

## 改代码前

跑一下校验，能拦住大部分低级错误：

```bash
npm run verify
```

浏览器端主路径（六科切换 / 判分 / 错题本 / 搜索 / 模考）另有一套 Playwright E2E：
`npm install` 后 `npx playwright install chromium`，再 `npm run test:e2e`（CI 每次 push 自动跑）。

几条约定：

- 进度、错题这些存在浏览器 `localStorage` 里，用 `HSPCBProgress` 或 `HSPCBStore`
  读写，别直接操作 `localStorage`（三处历史例外在 `scripts/check-lint.mjs` 里登记过）。
- 加题目写进 `1.2/data/exam/{subject}.json`（每科一个 `questions` 数组），
  题量变化记得同步该科 `total` 与 `1.2/data/exam/index.json` 的 `meta.totalQuestions`
  （`npm run check:data` 会交叉核对这三处）。
  `analysis` 字段写解析本身，别放「修正后」「TODO」这类草稿标记。
- 样式改动如果涉及颜色，尽量用 `css/tokens.css` 里已有的变量，明暗主题会一起生效。
- 模板里不要写 `onclick=` 和 `style=`（CSP 禁止），用 `data-call` / `data-hook` 事件委托
  和 `data-style` 声明式样式（`csp-delegation.js` / `cssom-style-bridge.js` 会接管）。
- **新代码走 ES Module**：放 `1.2/js/modules/`，用 `export`；调用方用相对路径动态
  `import()`（参考 `settings-center.js` 引入 `modules/time-format.js` 的写法）。
  存量 IIFE 维持现状，不需要也无需要求一次性迁移；详见 [ARCHITECTURE.md](ARCHITECTURE.md)。
- 脚本分层、全局命名空间与门禁地图见 [ARCHITECTURE.md](ARCHITECTURE.md)；
  更新链、CSP、WebDAV、插件等安全边界与已知风险见 [SECURITY.md](SECURITY.md)。
- **用户数据一律走 `createElement` + `textContent`**：`check:render-safety` 会拦下
  「用户字段拼接 innerHTML」；确需豁免时在行尾写 `render-safety:ok` 并注明理由。
- 题库覆盖度：`npm run coverage` 查看每科未覆盖/薄弱主题；投稿合入见 `contrib/README.md`。
- 无障碍基线：e2e 用 axe-core 锁 critical=0，支持系统「减少动效」偏好与 200% 字体缩放。

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

仅供学习交流。题目和知识点整理自公开教材与考纲，题目原文版权归原命题机构所有。

- **代码与文档**：仓库根目录 `LICENSE`（CC BY-NC-SA 4.0）。
- **数据库与汇编（`1.2/data/`）**：单独采用 **ODbL 1.0**，见
  [`1.2/data/DATA-LICENSE`](1.2/data/DATA-LICENSE)。教师与公益学习组织可自由复用
  这份题库编排，衍生数据库需以同协议开放。

贡献题目见 [`contrib/README.md`](contrib/README.md)（JSON Schema 校验 + 评测脚本）。

## 安卓端安全提示（重要）

**请卸载 v1.7.x 及更早的旧 debug 签名版本后再安装 v1.8+**。
这些历史版本曾使用一份已公开入库的 `debug.keystore` 签名——任何拿到该密钥的人都能
签发「同签名覆盖升级」的恶意 APK。新版本已改为：

- 签名密钥不入库（CI 经 Secrets 注入，本地构建密钥 gitignored）；
- 应用内自动更新**下载后强制校验 SHA-256**（期望值来自 Release 附件
  `checksums.sha256`），校验失败或缺少校验值一律删除文件、拒绝安装；
- Gitee 镜像回退改为设置里显式开启的实验项，默认只走 GitHub（含 jsDelivr 镜像）。

正式对外分发请使用独立 release keystore；风险详情见
[`android/README.md`](android/README.md) 的「签名与分发」。

问题和建议在 GitHub 提 Issue。

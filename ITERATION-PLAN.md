# 渐进式迭代开发方案 —— 借鉴 ClassIsland / Class-Widgets-2

> 基线：main @ 8ff4a9e（tag v1.4 已发布）· SW v18 · 题库 1198 题（物184/化183/生214/数197/语200/英220）· `npm run verify` 九道门禁 · 纯静态零构建
> 参考：`C:\Users\18948\Documents\GitHub\ClassIsland`（.NET 8 + Avalonia 11，28 项目解决方案）、`C:\Users\18948\Documents\GitHub\Class-Widgets-2`（Python 3.12 + PySide6/QML + RinUI）
> 约束：保持 HSPCB 现有技术栈（原生 HTML/CSS/JS，无框架无打包）、目录结构与整体架构不变，模块级渐进改造。
> 说明：v1.4 批次未完成项（D3 内联样式收尾等）按指示搁置并视作已并入基线，本方案不依赖、不改动其内容。

---

## 一、架构梳理

### 1.1 ClassIsland（.NET 8 + Avalonia 11，教室大屏课程表工具）

| 维度 | 结论（证据为核心类型/文件） |
| --- | --- |
| 目录与分层 | `ClassIsland.sln` 28 项目：主程序 / `ClassIsland.Core`（共享 UI+服务核心）/ `Desktop`（入口）/ `PluginSdk` / `ExamplePlugin` / `Platforms.{Windows,Linux,MacOs}` / `Shared`（跨进程数据契约，net8+net472 双目标）。主程序内 Views/ViewModels/Models/Services/Controls 文件夹分层；平台差异经 `Platforms.Abstractions` 接口 + 条件编译注入（`Desktop/Program.cs:150-190`）。 |
| 技术栈与构建 | net8.0 + Avalonia 11.3 + FluentAvaloniaUI；CommunityToolkit.Mvvm + ReactiveUI + DynamicData；Generic Host DI（`App.axaml.cs:629`）；NUKE 构建（`build/`），CI 矩阵 full/selfContained × folder/deb/pkg × 三架构（`build_release.yml`）；MSIX/deb/pkg 打包。 |
| 插件机制 | `manifest.yml`（id/apiVersion/entranceAssembly 等，`PluginService.cs:119-139`）→ `.cipx` 包（zip+MD5）→ 每插件独立 `PluginLoadContext : AssemblyLoadContext` 加载（`PluginLoadContext.cs`）；入口查找 `PluginBase` 派生（`PluginService.cs:193-205`）；依赖拓扑排序 + 循环检测（`ResolveLoadOrder`）；apiVersion 低于 2.0 拒载。扩展点=DI 注册表：AddComponent / AddSettingsPage / AddNotificationProvider / AddSpeechProvider / AddTrigger / AddAction / AddRule / AddXamlTheme 等（`App.Services.xaml.cs:155-322`）。 |
| 配置与持久化 | `Settings.json` + Profile 课表档案 + 组件布局 + 插件配置目录；统一封装 `ConfigureFileHelper`（LoadConfig/SaveConfig/WriteAllTextSafe 原子写，`Shared/Helpers/ConfigureFileHelper.cs:126-188`）。备份三层：单文件 `.bak` 侧载 + 每日自动 zip 轮转（`FileFolderService.cs:83-112`）+ 连续 5 次启动失败进「恢复模式」（`App.axaml.cs:569-609`）。版本迁移：`SettingsService.MigrateSettings` 按 LastAppVersion 阈值分级迁移（`SettingsService.cs:134-168`）+ 组件 `[MigrateFrom]` 特性迁移。 |
| UI 组件与渲染 | 主界面「组件」系统：Text/Schedule/Clock/CountDown/Group/Stack 等控件，`[ComponentInfo]` 特性 + `AddComponent<TComponent,TSettings>` 成对注册（控件+设置页），`ComponentPresenter` 运行时实例化；课表编辑有专用 DataGrid/TimeLine 控件族；亮暗主题 + XAML 主题包（Classic/Fluent）经 `AddXamlTheme` 注册；动画分级 `IThemeService.AnimationLevel`（0=关闭过渡动画）。 |
| 消息与通知 | 无全局消息总线：服务级 C# 事件 + IPC 广播（`LessonsService` 的 OnClass/OnBreakingTime/OnAfterSchool）。通知三层：Provider（`NotificationProviderBase`）→ Host（`NotificationHostService`，`PriorityQueue<NotificationRequest,NotificationPriority>` 优先级队列、失败重排队、链式通知）→ Worker（Mask/Overlay 两段会话计时）。TTS：`ISpeechService.EnqueueSpeechQueue` → Keyed DI 选 SystemSpeech/EdgeTts/GPT-SoVITS，失败回退 Blank。 |
| 日程与时间轴 | 模型：Profile 聚合 ClassPlan/TimeLayout/Subject；`TimeLayoutItem`（上课/课间/离校）；`TimeRule{WeekDay,WeekCountDiv,WeekCountDivTotal}`。状态机 `LessonsService.ProcessLessons`（`LessonsService.cs:390-527`）：单 50ms 主计时器预计算当前/下节课+剩余时间，仅状态跃迁时发事件。课表选择优先级：预定临时课表 > 临时课表 > 周规则匹配（`GetClassPlanByDate`）；单双周/2~N 周轮换按 `(总周数+偏移)%周期`（`GetCyclePositionsByDate`）。 |
| 托盘与多屏 | Avalonia TrayIcon + NativeMenu（`TaskBarIconService`）；四档置顶复查（高频计时器/前台切换/WinEvent 钩子）+ TopmostLocks 引用计数；全屏检测规则引擎控制主窗显隐（`WindowRuleService`）；按显示器索引选屏 + DPI 换算（`MainWindow.GetSelectedScreenSafe/GetCurrentDpi`）；单实例 Mutex + 二次启动 IPC 交棒。 |
| 性能优化 | 内存看门狗（60s 检查，>1.5GB 静默重启带标记，`MemoryWatchDogService.cs:18-52`）；动画分级/软件渲染降级；`ClassPlan.ValidTimeLayoutItems` 脏标记缓存；Sentry 分段启动 span + 延后 WMI；崩溃栈定位异常插件并自动禁用（`DiagnosticService`）。 |

### 1.2 Class-Widgets-2（Python 3.12 + PySide6/QML 6.10 + RinUI，桌面小组件课堂工具）

| 维度 | 结论（证据为核心类型/文件） |
| --- | --- |
| 目录与分层 | `src/core/` 按领域分包（config/schedule/notification/plugin/themes/widgets/windows/automations/converter/plaza/storage/timer…）；`src/qml/` UI 层（Components/Windows/pages + `widgets/` 内置小组件）；组合根 `AppCentral`（`core/central.py:72`）装配全部 Manager 并作为信号中枢；后端 QObject 以 context property 注入 QML（`central.py:442-459`）。 |
| 技术栈与构建 | Python 3.12、PySide6 6.10、RinUI、pydantic v2、loguru；uv 管依赖 + PyInstaller 打包（`ClassWidgets-2.spec`）；CI 矩阵 win/macOS + SignPath 签名 + Inno Setup + git-cliff CHANGELOG + Release 上传。 |
| 插件机制 | 外部插件 = `plugins/<dir>/cwplugin.json` + Python 入口（必填 id/name/version/api_version/entry，`loader.py:268-276`）；`SpecifierSet` 做 API 版本兼容检查；`importlib` 加载后注入伪模块 `ClassWidgets.SDK` 提供全量 API（`loader.py:57-124`）；`CW2Plugin` 基类 on_load/on_unload；API 面：注册小组件/设置页/托盘快捷方式/通知提供者/读写课表/插件 pydantic 配置/自动化任务/全局命名信号（`plugin/components.py`）；安装卸载延迟到下次启动（pending_operations）；`--safe-mode` 跳过外部代码。 |
| 配置与持久化 | 唯一 `configs/configs.json`（RootConfig 八段 pydantic 模型）；`ConfigManager` 60 秒定时自动保存 + 属性变更即发信号；**locked keys 配置锁**；课表独立 `configs/schedules/<name>.json`（加载失败自动备份）；版本迁移 `storage/migration.py` 不覆盖式搬移旧版目录 + 路径重写；多格式导入导出转换器注册表（cw1/cw2/cses/ics，`converter/converter.py:10-70`）。 |
| UI 组件与渲染 | 核心：小组件三级模型 —— 定义 `WidgetDefinition`（id/qml/backend/settings_qml/default_settings）→ 实例 `WidgetInstance`（instance_id+settings 覆盖）→ 预设 `widgets_presets`（`widgets/model.py:18-31,157-182`）；渲染 = 单全屏透明置顶窗 + 水平 ListView + 异步 Loader（失败占位可重试）；六锚点+偏移+Z 序布局；点击穿透 = 各组件矩形并集 QRegion + `WindowTransparentForInput`；主题 = QML 组件覆盖包 + URL 拦截重写 + 缓存破坏 nonce + 失败回滚默认主题（`themes/interceptor.py`）；动画统一 Behavior（400ms liquidBack / 350ms ColorAnimation）。 |
| 消息与通知 | 无全局总线：Qt Signal 直连；插件解耦用 `ActionsAPI` 命名信号注册表。通知链路：1Hz tick → `ScheduleRuntime` 检测时段跃迁 → 按 EntryType 选 Provider → `NotificationManager.dispatch` 三路分发（系统托盘通知 + 应用内信号 + **内嵌 dynamicNotification 小组件渲染**）；payload 规范 `{provider_id, level, title, message, duration, closable, silent}`；QML 未就绪先排队后 flush（`manager.py:28-86`）；级别→铃声映射 + 自定义音频。 |
| 日程与时间轴 | pydantic 模型 `ScheduleData{meta, subjects, days, overrides}`；`Entry{type, startTime, endTime, subjectId}`；`EntryType` 五态 CLASS/BREAK/ACTIVITY/FREE/PREPARATION；周规则统一 `all|odd|even|cycle(n)|list[int]`（`model.py:41-169`）；当天时间线合成优先级：指定日 > 调休映射 > 临时换课 > 周规则（合并多条命中）；「下节课前 N 分钟进入 PREPARATION」判定（`service.py:188-196`）；`UnionUpdateTimer` 50ms 轮询只发 1Hz tick 总线。 |
| 托盘与多屏 | QSystemTrayIcon + 托盘按钮=快捷方式注册表；窗口工厂懒创建 11 种窗口、可整体释放（`ReleasableWindow.release`）；贴边隐藏=锚点滑出留边；显示器按名称匹配定位（仅单屏一排组件，待确认多屏计划）；自启写注册表；QLockFile 单实例。 |
| 性能优化 | 最大化/全屏自动隐藏 = 一个每秒 `AutomationTask`（`AutoHideTask`）；mask 重算合并进事件循环；QML 几何变化每帧最多通知一次；主题切换先 `clearComponentCache`、避免 Loader 回调 GC；窗口可释放回收内存；1Hz 单 tick 总线替代多处 Timer；配置写盘 60s 批量；安全模式跳过外部代码。 |

### 1.3 两参考项目共性（对迁移最有价值）

1. 「Provider 注册表 + 队列 + payload 规范」的通知体系（两家的 NotificationProvider 几乎同构）。
2. 「单 tick 总线驱动全部时间敏感逻辑」+「仅状态跃迁发事件」的时间轴状态机。
3. 插件 = manifest（含 apiVersion 门槛）+ 显式注册表扩展点 + 安全模式/自动禁用自愈。
4. 配置 = schema 化 + 版本迁移 + 原子写/自动备份/恢复模式。
5. 组件 = 「定义 + 实例 + 设置合并 + 预设」三层模型（CW2 最完整）。

---

## 二、可迁移点筛选

适用性判断基于 HSPCB 现状：54 个 JS 模块（IIFE + `window.*` 命名空间）、`MODULE_REGISTRY`（`1.2/js/app.js:1269`）、`HSPCBProgress/HSPCBStore` 统一存储（`1.2/js/progress.js:12,594`）、`HSPCBEV` 事件委托（`1.2/js/csp-delegation.js`）、全量 `setInterval` 17 处、无任何通知机制（Web Notification 0 处）、题库列表一次性全量渲染、番茄钟与间隔重复逻辑散落在 `auxiliary-tools.js`/`study-enhanced.js`/`main-inline.js`。

| # | 借鉴点 | 来源 | 适用模块与场景 | 预期收益 | 与现有实现的差异及改造成本 | 优先级 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1Hz tick 总线 + 订阅者框架 | CW2 `UnionUpdateTimer` | 全局：番茄钟/考试计时/仪表盘时钟/倒计时（现 17 处 `setInterval` 各自为政） | 计时器归一，后台标签页唤醒后状态一致；为时间轴与自动化提供唯一心跳 | 新增 `tick-bus.js`（约 60 行），旧计时器逐个改订阅；成本**低** | **P0** |
| 2 | 通知 payload 规范 + Provider 注册表 + 排队 flush | 两家通知体系（`NotificationHostService` / `NotificationManager`） | 新增通知中心：复习到期、连续打卡、错题积压、考试提醒 | 当前 0 通知能力；建立后所有「提醒类」功能有了统一出口；为 PWA Notification 铺路 | 新增 `notification-center.js`（注册表+队列+toast UI），复用错误兜底 toast 的样式语言；成本**中** | **P0** |
| 3 | 题库列表窗口化渲染 | CW2 ListView 视口纪律（间接） | `app-exam.js updateExamList()`（现一次 innerHTML 渲染全部 1198 条） | 大幅降低筛选/首屏 DOM 开销（约 40-60% 渲染耗时） | 改为分页（50/页）+「加载更多」，筛选逻辑不变；成本**低** | **P0** |
| 4 | 设置 schema 化 + 版本阈值迁移 | ClassIsland `SettingsService.MigrateSettings` | `HSPCBProgress` 增加 `settings` 段（主题、动画等级、默认学科、仪表盘布局、通知开关） | 告别散装 key；后续所有功能开关有了家；跨版本升级可编程 | `progress.js` DEFAULTS 已有 schemaVersion 基建，补 `settings` 对象 + migrate 数组；成本**中低** | **P0** |
| 5 | 安全模式 + 启动失败自愈 | CW2 `--safe-mode` / ClassIsland 恢复模式 + 自动禁用异常插件 | 启动链：54 个模块任一抛错不再拖垮全局 | 单模块故障可跳过并提示；连续崩溃自动降载（配合 v1.4 错误兜底 toast） | `main-inline.js` 启动序 try/catch 化 + `?safe=1` 跳过非核心模块 + 失败计数存 `HSPCBStore`；成本**中低** | **P0** |
| 6 | 时间轴五态状态机 + 周规则 + 调休映射 | CW2 `ScheduleServices` / ClassIsland `LessonsService`（简化版） | 新增「作息表」：自习安排/复习时段驱动提醒与仪表盘「当前时段」卡 | 把「该学什么」升级为「现在该学什么」；番茄钟/计划有了时间轴骨架 | 新增 `schedule-engine.js` + `data/schedule-example.json`；纯计算无 UI 依赖，先接通知中心与仪表盘；成本**中** | **P1** |
| 7 | 小组件三层模型（定义/实例/预设 + settings 浅合并） | CW2 `WidgetListModel` | 仪表盘可配置卡片：时钟/今日任务/错题数/番茄钟/倒计时 | 仪表盘从固定布局变可自定义；与 `MODULE_REGISTRY` 心智一致 | 新增 `dashboard-widgets.js` 注册表 + 实例列表存 `settings`；内置 4 个 widget 改造自现有面板；成本**中高** | **P1** |
| 8 | 自动备份多槽轮转 + `.bak` 回滚语义 | ClassIsland `FileFolderService` / `ConfigureFileHelper` | `HSPCBProgress` 每日快照 3 槽位轮转（存 `HSPCBStore`） | 学习记录防丢（清浏览器数据/误清空可回滚） | 在 `progress.js` 加 snapshot/dailyRotate（约 80 行）+ 设置页「恢复」入口；成本**低** | **P1** |
| 9 | TTS Provider 模式 | ClassIsland `ISpeechService` | 英语单词/听力原文朗读、语文古诗词朗读 | 听读结合，题库英语听力题有了音频出口（Web Speech API，零依赖） | 新增 `speech-service.js`（`speechSynthesis` 封装 + 队列）；成本**低** | **P1** |
| 10 | 命名信号事件总线 | CW2 `ActionsAPI` | 游戏化系统与题库/打卡/番茄钟解耦（现靠直接函数调用与 `window.*`） | 跨模块耦合显式化；给未来轻插件提供挂点 | 新增 `HSPCBBus`（on/emit，约 40 行）进 `common-utils.js`；先迁游戏化积分源事件；成本**中** | **P1** |
| 11 | 轻插件规范：manifest + apiVersion 门槛 + 注册 API | 两家插件体系（最小子集） | 二次开发：一个 JSON + 一个 JS 即可注册工具页/通知提供者/仪表盘组件 | 把「欢迎贡献 JS 模块」升级为有版本契约的扩展协议；apiVersion 不符拒载防坏插件 | 新增 `plugin-loader.js` + `docs`（README 章节）；复用 `MODULE_REGISTRY`/通知/仪表盘注册表为扩展点；成本**中高** | **P2** |
| 12 | 周计划编辑器（课表网格控件思路） | ClassIsland ScheduleDataGrid / CW2 课表编辑器 | 作息表可视化编辑（配合 #6） | 用户可自定义自己的复习时间轴 | 纯前端网格编辑 UI + 写回 schedule JSON；成本**高**（UI 量大） | **P2** |
| 13 | 自动化任务框架（每秒 update + 触发器/行动注册表） | CW2 `AutomationTask` / ClassIsland Trigger+Action | 规则如「连续 3 天未打卡→通知」「错题 ≥50→推荐复习路径」 | 从被动功能到主动教练；全部本地计算 | 依赖 #1/#2/#6；新增 `automation.js` + 3 条内置规则；成本**中** | **P2** |
| 14 | 主题覆盖包 + 失败回滚 / URI 深链路由 / 配置锁 | CW2 主题拦截器、ClassIsland `UriNavigationService`、CW2 locked keys | 主题包（CSS 变量覆盖文件）、`?goto=` 统一路由、机房共用机「锁定清理入口」 | 生态皮肤、深链分享、校园公共设备场景 | 渐进可选；成本各**低-中** | **P2** |

**明确不移植**（桌面原生专属或与零依赖原则冲突）：系统托盘/点击穿透/贴边/多屏窗口管理（无窗口系统）、全屏遮挡检测、MSIX/Inno/PyInstaller 打包（已有 PWA）、MQTT/IPC/Grpc、Sentry 遥测（保持零上报，隐私是卖点）、天气/定位、Lua/Python 脚本插件运行时（只做声明式 JS 轻插件）、内存看门狗（浏览器接管）。

---

## 三、迭代方案（P0 / P1 / P2）

统一工程约定（适用全部任务）：新模块一律 IIFE + `window.*` 命名空间；在 `1.2/index.html` 按依赖序登记 `<script defer>`；同步登记 `1.2/sw.js` CORE_ASSETS 并 bump `CACHE_NAME`；新增 JSON 数据纳入 `scripts/validate-data.mjs` 校验；`scripts/smoke-app.mjs` 增加装载与核心 API 断言；`scripts/check-global-collisions.mjs` 自动把关命名冲突；每任务独立分支 + `npm run verify` 全绿后合入；涉及 UI 的任务用 `scripts/nocache-server.mjs` + 浏览器截图对比验收。回滚 = settings 功能开关（默认渐进开启）+ git revert + SW 版本递增。

### P0（目标版本 v1.5，合计约 6.5 人天）

| 任务 | 目标与改动 | 关键文件 | 难点/风险与应对 | 工作量 | 验证与回滚 |
| --- | --- | --- | --- | --- | --- |
| T1 全局 tick 总线 | 新增 `window.HSPCBBus.tick`（1Hz，页面隐藏时自动降频到 60s）；迁移番茄钟/考试计时/仪表盘时钟等高价值计时器（可分两批，首批 3 处） | 新增 `1.2/js/tick-bus.js`；改 `auxiliary-tools.js`、`study-enhanced.js`、`study-dashboard.js` 中的 `setInterval` | 旧计时器Drift 语义差异：以「秒变化」为触发而非固定 1000ms（借鉴 CW2 轮询秒变化）；保留旧 interval 兜底一版 | 1 人天 | smoke 断言 tick 总线存在与订阅触发；对比迁移前后计时误差 <1s；开关 `settings.useTickBus` |
| T2 通知中心 | payload 规范 `{id,level,title,message,duration,closable,silent}`；Provider 注册表 + 队列（页面未就绪 flush、同 id 去重、最多同时 3 条）；应用内 toast UI（暗色令牌适配）；可选桥接 Web Notification（PWA 安装态） | 新增 `1.2/js/notification-center.js`；`1.2/css/` 增通知样式（tokens 令牌）；接入 `main-inline.js` 启动序 | 不做系统级 Mask/Overlay（无场景）；避免通知风暴：全局限流 1 条/10s + 每类 Provider 独立开关；`requestPermission` 必须由用户点击触发 | 2 人天 | smoke：注册 fake provider 断言出队与去重；浏览器手测明暗两态；关闭开关即整体静默（回滚开关） |
| T3 题库列表分页 | `updateExamList` 改 50/页 + 「加载更多」按钮 + 结果计数；筛选逻辑/排序不变 | `1.2/js/app-exam.js`（`updateExamList`、`showExamDetail` 入口不变） | 「加载更多」需保持已选答案/滚动位置：仅追加渲染，不重建已有 DOM | 1 人天 | smoke：渲染 DOM 数 ≤50 断言；浏览器实测 1198 题筛选流畅度对比 |
| T4 设置中心 | `HSPCBProgress` 增 `settings` 段（含 theme/animationLevel/defaultSubject/notification/dashboard 布局占位）+ `migrateSettings()` 阈值迁移 + 设置页 UI（读迁移自散装 key：`hspcb_theme` 等） | `1.2/js/progress.js`、`1.2/js/main-inline.js`（设置页入口）、`theme-toggle.js` 读改为走 settings | 迁移必须幂等（旧 key 保留不删，同 v1 迁移策略）；旧版备份文件导入经既有 sanitize 后合并 settings | 1.5 人天 | `test-progress.mjs` 增 6 组迁移用例；从 v1.4 存档导入回归 |
| T5 安全模式 + 启动自愈 | 模块装载 try/catch 包裹 + 失败计数（`HSPCBStore`）；连续 2 次启动同一模块失败 → 默认跳过并通知；`?safe=1` 仅加载核心 8 模块 | `1.2/js/main-inline.js`（启动序）、`1.2/js/error-fallback.js`、`1.2/js/sw-register.js` 不动 | 误判「失败」：以「DOMContentLoaded 后 5s 内未挂载 window.*」为准而非仅 try/catch（捕获运行时晚期错误）；跳过名单可被 settings 覆盖 | 1 人天 | smoke 增 `?safe=1` 装载断言；人为注入坏脚本验证跳过 + toast；`?safe=0` 强制全载开关 |

**M1（v1.5）结束后应具备的能力**：页内有统一提醒中心（复习到期等首批 2 个 Provider 上线）；题库浏览不再整页卡顿；散装设置全部收纳且可编程迁移；任意单个模块崩溃不再白屏，用户可一键进入安全模式定位。

### P1（目标版本 v1.6，合计约 10 人天）

| 任务 | 目标与改动 | 关键文件 | 难点/风险与应对 | 工作量 | 验证与回滚 |
| --- | --- | --- | --- | --- | --- |
| T6 作息时间轴引擎 | 数据模型 `ScheduleData{days, overrides}`（Entry 五态简化为 study/break/activity/free 四态 + preparationMinutes）；周规则 `all|odd|even|cycle(n)|list`；调休映射；`getCurrentEntry()/getNextEntry()/getStatus()`；时区安全（本地时间） | 新增 `1.2/js/schedule-engine.js`、`1.2/data/schedule-example.json`、`validate-data.mjs` 增 schedule schema 校验 | 跨午夜时段（如 23:30-24:00 后）边界：参考 CW2 `start <= t < end` 并明确不支持跨天段，文档写死；状态跃迁只在 tick 总线上判定一次 | 3 人天 | 纯计算模块先上 Node 单测（新增 `scripts/test-schedule.mjs` 覆盖周规则/调休/跨段）；默认不启用，设置页导入示例后启用 |
| T7 仪表盘组件化 | 定义/实例/预设三层模型：`window.DashboardWidgets.register({id,name,render,settingsSchema,defaultSettings})`；实例列表存 `settings.dashboard.layout`；内置 4 widget（时钟/今日任务/错题概览/番茄钟）改造自现有面板；实例级 settings 浅合并 | 新增 `1.2/js/dashboard-widgets.js`；改 `study-dashboard.js`、`main-inline.js` 仪表盘渲染段 | 现有仪表盘为一次性渲染，改造成注册表驱动需保持旧面板不回归：旧面板先原样搬进一个 widget；CSS 网格布局 token 化 | 3 人天 | 截图对比迁移前后仪表盘（默认布局应等价）；smoke 断言 4 个内置 widget 注册成功 |
| T8 备份多槽快照 | 每日首启自动快照到 `HSPCBStore('backup.0..2')` 轮转；设置页「恢复到某快照」 | `1.2/js/progress.js`（snapshot/dailyRotate ≈80 行）、设置页 | localStorage 配额（5MB）：快照仅存 progress 主档（题库不入），超限静默跳过并通知一次 | 1 人天 | 单测：连续两天模拟快照轮转顺序；恢复后校验 schemaVersion 重迁移 |
| T9 TTS 语音服务 | `window.HSPCBSpeech.speak(text, {lang, rate})` + 队列 + 停止；英语听力题/单词卡/古诗词朗读按钮接入（3 处入口） | 新增 `1.2/js/speech-service.js`；`app-exam.js` 听力题渲染、`english-vocabulary.js`、语文古诗词面板 | 浏览器音色差异大（Edge/Chrome 中文音色可用性）： absence 优雅降级隐藏按钮；`speechSynthesis` 在部分浏览器需用户手势后可用 | 1 人天 | 浏览器实测三入口朗读；无音色环境按钮不渲染（断言降级路径） |
| T10 事件总线收敛 | `HSPCBBus.on/emit` 落地；首批迁移 4 条高价值事件：`exam:answered`（对/错+考点）、`checkin:done`、`pomodoro:finished`、`exam:finished` → 游戏化积分/成就改为订阅 | 新增 `common-utils.js` 内 `HSPCBBus`；改 `gamification-system.js` 订阅端、`app-exam.js` 等发布端 | 双写期风险：旧直接调用先保留、新事件并行发，稳定一版后删旧路径；事件名集中常量表防拼写漂移 | 2 人天 | smoke 断言 emit→订阅链路；积分入账回归（做题/打卡/番茄钟三场景旧新一致） |

**M2（v1.6）结束后应具备的能力**：作息表驱动「当前该学什么」+ 到点提醒（T2+T6 联动）；仪表盘卡片可增删排序（T7）；学习记录每日自动快照可恢复（T8）；英语/语文可朗读（T9）；游戏化与核心行为解耦（T10），为 T11 插件挂点就绪。

### P2（目标版本 v1.7，合计约 12 人天）

| 任务 | 目标与改动 | 关键文件 | 难点/风险与应对 | 工作量 | 验证与回滚 |
| --- | --- | --- | --- | --- | --- |
| T11 轻插件规范 | `hspcb-plugin.json`（id/name/version/apiVersion/entry）+ `plugin-loader.js`：apiVersion 兼容检查、脚本注入、失败占位+跳过；扩展点=通知 Provider/仪表盘组件/工具页注册（复用 T2/T7/MODULE_REGISTRY）；`?safe=1` 同样跳过外部插件；README 开「二次开发-插件」章节 | 新增 `1.2/js/plugin-loader.js`、`1.2/plugins/example/`（示例插件）、README | 安全边界：插件与主程序同权（无沙箱）——文档明示「仅加载可信来源」+ apiVersion 门槛 + 失败隔离；不做动态下载（保持零网络） | 3 人天 | 示例插件端到端（注册一个仪表盘卡片+一条通知）；坏 apiVersion 拒载断言；safe-mode 跳过断言 |
| T12 周计划编辑器 | 作息表网格编辑（周 × 时段），写回 schedule JSON；模板（工作日/周末/冲刺）一键套用 | 新增编辑器模块（复用 T6 模型） | 网格拖拽交互工作量大：第一期用「行编辑表单」替代拖拽，二期再拖拽；数据校验复用 validate-data | 4 人天 | 编辑→保存→引擎读取闭环 E2E；示例模板一键生成后单测通过 |
| T13 自动化规则 | `AutomationTask` 每秒 update（挂在 tick 总线）+ 规则注册表；内置 3 条：连续 3 天未打卡提醒、错题积压 ≥50 推荐复习路径、番茄钟结束后休息提醒 | 新增 `1.2/js/automation.js` | 规则误触发骚扰：每规则独立开关+冷却期（同一规则 24h 内不重复）；全部本地判定 | 2.5 人天 | 单测模拟时间推进触发/冷却/去重；通知中心实收断言 |
| T14 生态收尾三件套 | ①主题覆盖包：`css/themes/<name>.css` 变量覆盖 + 加载失败回滚默认（借鉴 CW2 回滚）；②`?goto=` 统一深链路由表（扩展现有 `?subject=`）；③「锁定模式」：隐藏清数据入口+设置锁 PIN（机房场景，借鉴 CW2 locked keys） | `1.2/index.html`、`main-inline.js` 路由段、新增 `theme-loader.js` | 主题包即 CSS 注入面：CSP `style-src 'self'` 天然限制外部源；锁 PIN 仅本地哈希存储并明示「防误触非加密」 | 2.5 人天 | 主题损坏文件回滚演练；深链全路由表 smoke；锁定模式开关回归 |

**M3（v1.7）结束后应具备的能力**：第三方可用声明式插件扩展产品且坏插件可被隔离（T11）；用户可自助编排复习时间轴（T12+T6）；产品具备主动教练能力（T13）；主题/深链/公共设备场景闭环（T14）。

### 里程碑与节奏总览

| 里程碑 | 版本 | 内容 | 人天 | 出厂能力一句话 |
| --- | --- | --- | --- | --- |
| M1 | v1.5 | P0：tick 总线 / 通知中心 / 题库分页 / 设置中心 / 安全模式 | ≈6.5 | 会提醒、不卡顿、可恢复、坏模块不致命 |
| M2 | v1.6 | P1：时间轴引擎 / 仪表盘组件化 / 备份快照 / TTS / 事件总线 | ≈10 | 知道现在该学什么，仪表盘随心配，能开口朗读 |
| M3 | v1.7 | P2：轻插件规范 / 周计划编辑器 / 自动化规则 / 生态三件套 | ≈12 | 可插拔、可编排、会主动教的备考平台 |

每个里程碑独立发版（tag + Release + SW bump），M1 完成前不启动 M2 开发；任务间硬依赖仅有 T13→(T1,T2,T6)、T11→(T2,T7)，其余可并行。

---

## 待确认项（不影响方案成立，落地前需核实）

1. CW2 是否有多屏同时显示计划（当前代码仅单屏一排组件）——不影响本项目（网页自带响应式）。
2. ClassIsland Avalonia 版老 WPF 文字 Outline/Blur 特效的去向——本项目无对应需求，仅存档。
3. HSPCB `study-tools-enhanced.js` 中番茄钟与 `main-inline.js` 的调用关系细节（T1 迁移首批选点时核对）。
4. `global-search.js:422` 搜索索引构建的确切触发时机（T3 改造时确认是否需要顺带延迟构建）。
5. iOS Safari 对 `speechSynthesis` 的手势限制细节（T9 移动端验收时确认）。

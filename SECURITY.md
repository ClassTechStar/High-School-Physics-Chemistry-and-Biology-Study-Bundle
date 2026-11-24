# 安全说明（SECURITY）

> 版本基线 v1.9.0。威胁模型按「纯静态站点 + 原生 WebView 壳 + 无后端」的真实攻击面编写，
> 不包含服务端内容（本仓没有服务端）。

## 1. 资产与威胁模型

| 资产 | 位置 | 威胁 |
|---|---|---|
| 学习数据（进度/错题/设置） | 浏览器 localStorage | 同源 XSS 读取、共用电脑被他人查看 |
| 更新通道 | GitHub Release → APK | 通道劫持投毒、镜像整仓投毒 |
| 签名密钥 | CI Secrets / 本地 | 历史 debug key 已公开，可伪造同签名升级包 |
| 用户 WebDAV 凭据 | localStorage（明文） | 本机被他人访问、恶意插件读取 |
| 插件 | `1.2/plugins/` | 第三方脚本在页面上下文执行 |

前提假设：HTTPS 传输由 GitHub Pages / 用户的静态托管保证；不在本仓防御范围的包括
设备已被 root/越狱、浏览器本身被攻破、用户安装来源不明的「同签名」APK。

## 2. 更新链（v1.9 P0 修复）

链路：`GitHub Release API → GitHub raw 清单 → jsDelivr 清单`；Gitee 仅在用户显式开启
「允许 Gitee 回退（实验）」后追加，默认关闭。

安卓端 `android/.../UpdateManager.java` 的强制约束：

1. **期望哈希缺失即拒绝**：`downloadAndInstall(activity, apk, expectedSha)` 在
   `expectedSha` 为空/长度不为 64 时直接失败，不存在「无校验降级」分支。
2. **下载后计算 SHA-256**，与期望值做**常量时间比较**（`constantTimeEquals`），
   不一致或缺少校验值一律 `deleteQuietly` 删除临时文件并 Toast 提示，绝不调用安装器。
3. **安装只发生在校验通过之后**（`check:update-security` 用静态断言锁住该顺序，防止未来重构把 `install()` 提前）。
4. 校验值来源：Release 附件 `checksums.sha256`，与 APK 同源发布
   （CI 里 `sha256sum *.apk > checksums.sha256`，并断言每个 APK 恰好一行）。
5. Web 端 `js/update-check.js` 只负责「发现更新 + 透传 sha256」，不做安装；
   浏览器场景跳转发布页，由用户手动下载。

残余风险：哈希校验防「下载内容被替换」，不防「攻击者同时替换 checksums 与 APK」
（这等价于攻破 GitHub Release 账号）；Gitee 镜像可被整仓投毒，因此默认关闭。

## 3. 签名与分发

- 仓库历史中曾提交旧 `debug.keystore`，**git 历史不可抹除**：任何拿到该密钥的人都能签发
  同签名的「覆盖升级」APK。因此 v1.8+ 要求先卸载 v1.7.x 及更早版本。
- 现状：签名密钥不入库（`debug.keystore` gitignored），CI 通过 `APK_KEYSTORE_BASE64`
  Secrets 注入；正式分发应使用独立 release keystore（见 `android/README.md`）。
- APK 不入库，只走 GitHub Release 附件（`android/releases/` 已忽略）。
- **已知遗留**：本仓库的 GitHub App 集成令牌当前无权写入 Actions Secrets，
  `APK_KEYSTORE_BASE64` 需维护者在仓库设置页手工添加，或在授权中开放 Secrets 写权限。

## 4. 数据与隐私

- **零上传**：除「检查更新」（只发 GET 请求取清单）与用户主动配置的 WebDAV 外，
  没有任何出站请求；无统计、无远程日志。
- **WebDAV 凭据明文**：地址/账号/密码存在 localStorage（`hspcb_datasync_cfg`），
  仅适合「应用专用密码」，不建议填主账号密码；共用电脑请使用锁定模式。
- **快照文件**：导出的 JSON 含全部学习数据，分享前请自行确认内容。
- **锁定模式**是防误触 UI 遮挡，不是加密；能打开 DevTools 的人可读 localStorage。

## 5. Web 层攻击面

### CSP

```
default-src 'self'; script-src 'self'; style-src 'self';
img-src 'self' data: blob:; font-src 'self' data:;
connect-src 'self' https: https://api.github.com https://raw.githubusercontent.com
  https://cdn.jsdelivr.net https://gitee.com https://raw.giteeusercontent.com;
media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'
```

- `script-src 'self'`：禁内联脚本、禁内联事件属性。所有交互走 `data-call`/`data-action`
  事件委托（`js/csp-delegation.js`），动态脚本只允许同源。
- `style-src 'self'`：禁 `style` 属性与 `<style>` 块。模板用 `data-style`，由
  `js/cssom-style-bridge.js` 写入 CSSOM（CSP 不管辖 CSSOM 写入）。
- **`connect-src` 中的 `https:` 是有意放开**：WebDAV 同步要连用户自填的任意 https 主机，
  静态站无法枚举。代价是「若发生 XSS，可向任意 https 端点外传数据」——这是为功能
  显式接受的取舍；XSS 的第一道防线仍是 `script-src 'self'` 与下述模板化。
- **外部 importmap 的风险为零**：`<script type="importmap" src="js/importmap.json">`
  是同源数据块；浏览器不支持时直接忽略，不会执行任何内容。

### DOM 注入与模板化现状

- 题库/知识点内容来自本仓静态 JSON，不接收用户文本；**注入用户数据的路径**主要是
  错题本（用户笔记）与快照导入。
- 错题本渲染（`buildErrorCard`）已使用 `createElement + textContent`，结构上无法漏转义。
- 其余大量视图仍是「字符串模板 + `esc()` 转义」（约 465 处 innerHTML 的历史基数）。
  §3.2-C 的模板化迁移是渐进项，尚未全量完成；新增渲染代码**必须**用 `createElement`
  或先过 `esc()`，禁止拼接未经转义的 `innerHTML`。

### 插件

- 插件是**同源脚本**，拥有页面全部能力（包括读 localStorage），不是安全沙箱。
  只加载 `plugins/index.json` 显式登记且 `apiVersion` 主版本匹配的插件；
  `?safe=1` 可临时跳过全部插件。不要安装来源不明的插件。

## 6. 已知风险与不修项

| 项 | 状态 | 说明 |
|---|---|---|
| 历史 debug key | 无法修复 | 密钥已进 git 历史；只能靠「先卸载旧版 + 换新签名」缓解 |
| 同签名投毒 | 残余 | 哈希校验不解决「签名相同」；需用户只从官方 Release 下载 |
| WebDAV 明文凭据 | 接受 | 个人应用专用密码；加密需要用户口令，本期不做 |
| 其余 innerHTML 模板 | 渐进 | 见 §5，新代码强制规范；全量迁移为长期项 |
| 安卓低版本 WebView | 待补矩阵 | `minSdkVersion` 与 WebView 特性矩阵尚未落文档/CI（§6 兼容性项） |
| e2e 不覆盖原生层 | 接受 | Playwright 只测 Web；安卓侧靠 `check:asset-sync` + 真机手测 |

## 7. 报告

发现安全问题请开 GitHub Issue（不要附可直接利用的 PoC 细节）；维护者确认后再公开。

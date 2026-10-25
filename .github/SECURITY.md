# 安全策略

## 支持版本

| 版本 | 状态 |
| --- | --- |
| 1.2.x（main 分支） | ✅ 支持 |
| 1.1（归档目录） | ❌ 不再维护，仅作历史归档 |

## 报告漏洞

如果你发现安全问题（例如 XSS、CSP 绕过、数据注入），请**不要**在公开 Issue 中描述细节，而是：

1. 打开 GitHub 仓库的 **Security → Report a vulnerability**（私密报告通道）；
2. 若该通道不可用，请发邮件至仓库所有者（见仓库主页联系方式），标题注明 `[安全]`；
3. 请附上：复现步骤、影响的浏览器版本、你评估的严重级别。

我们会在 **7 天内**确认收到，30 天内给出修复计划。修复后将致谢报告者（除非你希望匿名）。

## 当前安全基线（供测试者参考，v1.4 起）

- `Content-Security-Policy`：`script-src 'self'`（无 `unsafe-inline`）、`object-src 'none'`、`base-uri 'self'`、`form-action 'self'`；
- 内联事件全部经 `js/csp-delegation.js` 声明式委托（`data-action` / `data-call` / `data-hook`）；
- 内联样式经类化 + `data-st-*` CSSOM 委托（`style-src` 无 `unsafe-inline`）；
- 学习记录仅存于浏览器 `localStorage`（`hspcb.v2.*` / `hspcb.st.*` 命名空间），无任何网络上报；
- 备份导入（`HSPCBProgress.importData`）实施 schema 白名单校验（类型/数量/长度上限），拒绝畸形载荷。

## 不视为漏洞的范围

- `file://` 协议下功能受限（README 已注明需本地服务器）；
- 用户自己在 DevTools 里改 localStorage 导致的数据异常；
- 1.1 归档目录中的历史问题（不接受修复 PR，见仓库策略）。

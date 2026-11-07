# HSPCB 安卓端（原生壳 + 内嵌 Web 应用）

把仓库根目录 `1.2/` 的纯静态应用整体打包为原生 Android APK。
**UI 与功能与 Web 端完全一致**（同一份代码），原生层提供安装包、生命周期、
返回键、外部链接移交与随系统明暗的原生主题。

## 架构

```
┌─ MainActivity (Java, 无第三方依赖) ──────────────┐
│  WebView 加载 https://appassets.local/index.html │
│  shouldInterceptRequest 把该域请求映射到          │
│  APK assets/web/**（即 1.2/ 的拷贝）              │
│  · 不创建 socket、不走网络（离线完整可用）          │
│  · https 语义 → localStorage/fetch/朗读 正常       │
│  · 外部链接自动移交系统浏览器                       │
│  · 系统返回键 → WebView 后退                       │
└──────────────────────────────────────────────────┘
```

选择「拦截式资产域」而非本地 HTTP 服务器的原因：部分 ROM（Android 16 真机实测）
对应用绑定 loopback 端口报 `EPERM`；拦截方案零 socket、零 cleartext、零依赖。

## 构建（已验证路径：一键脚本）

依赖：JDK 11+、Android SDK（`platforms;android-34` + `build-tools 36.0.0`）、Python 3。

```bash
cd android
ANDROID_HOME="<你的SDK路径>" bash build-apk.sh
# 产物: android/releases/HSPCB-v<版本>-debug.apk
```

脚本流水线：同步 `1.2/ → app/assets/web/` → aapt2 → javac → d8 →
打包 → zipalign → apksigner（项目内 `debug.keystore`，已入库，保证升级安装签名一致；
仅限测试分发，上架商店请换正式签名）。

## 用 Android Studio 打开（可选，未在本机验证）

仓库同时提供标准 Gradle 工程文件（`settings.gradle.kts` 等），Android Studio
`File → Open` 选 `android/` 即可。首次需联网下载 AGP 与平台组件；
构建前请先跑一次 `build-apk.sh` 生成 `app/assets/web/`（或 Studio 里直接
跑 `assembleDebug` 前手动执行脚本第 0 步）。

## 安装到设备

```bash
adb install -r android/releases/HSPCB-v1.6.0-debug.apk
```

已在 Redmi 23117RK66C（Android 16, arm64）真机验证：安装/启动/渲染/
随机出题/题库加载全部正常（截图见 `screenshots/`）。

## 目录

```
android/
├── build-apk.sh              一键构建脚本（免 Gradle，已验证）
├── debug.keystore            项目 debug 签名（入库，仅测试分发用）
├── releases/                 构建产物 APK（入库）
├── screenshots/              真机验证截图
├── settings.gradle.kts       ┐
├── build.gradle.kts          ├ Android Studio 工程文件
├── gradle.properties         ┘
└── app/
    ├── AndroidManifest.xml
    ├── java/com/classtechstar/hspcb/
    │   ├── MainActivity.java      原生壳（WebView + 拦截 + 生命周期）
    │   └── AssetResponder.java    资产域映射（路径规范化/MIME/404）
    ├── res/                       图标（来自 1.2/icons）+ 明暗主题
    └── assets/web/                来自仓库 1.2/（随仓库入库，Web 更新后重跑脚本同步）
```

## 版本对应

APK `versionName` 跟随根目录 `package.json`（构建脚本自动读取）。
更新 Web 端后重跑 `build-apk.sh` 即得到包含最新内容的新 APK。

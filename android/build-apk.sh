#!/usr/bin/env bash
# ============================================================
# build-apk.sh — HSPCB 安卓端一键构建（免 Gradle/AGP）
# 依赖：JDK 11+（javac/keytool）、Android SDK（platforms;android-34 +
#       build-tools 36.0.0）、python3（打包 zip）。零 Maven 依赖。
# 产物：releases/HSPCB-v<ver>-debug.apk（debug 签名，见 android/debug.keystore）
# 用法：cd android && bash build-apk.sh
# ============================================================
set -euo pipefail

cd "$(dirname "$0")"
ROOT="$(cd .. && pwd)"

# ---------- 工具链探测 ----------
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$LOCALAPPDATA/Android/Sdk}}"
if [ ! -d "$SDK" ]; then echo "❌ 未找到 Android SDK（设 ANDROID_HOME 后重试）"; exit 1; fi
BT="$SDK/build-tools/36.0.0"
[ -d "$BT" ] || BT="$SDK/build-tools/$(ls "$SDK/build-tools" | sort -V | tail -1)"
PLATFORM="$SDK/platforms/android-34/android.jar"
[ -f "$PLATFORM" ] || PLATFORM="$SDK/platforms/$(ls "$SDK/platforms" | sort -V | tail -1)/android.jar"
JAVA="${JAVA_BIN:-java}"
command -v "$JAVA" >/dev/null 2>&1 || JAVA="C:/Program Files/Android/Android Studio/jbr/bin/java.exe"
if [ ! -x "$JAVA" ] && ! command -v "$JAVA" >/dev/null 2>&1; then
  echo "❌ 未找到 java（设 JAVA_BIN 后重试）"; exit 1
fi
if [ -x "$(dirname "$JAVA")/keytool.exe" ]; then
  KEYTOOL="$(dirname "$JAVA")/keytool.exe"
else
  KEYTOOL="$(command -v keytool || echo "C:/Program Files/Android/Android Studio/jbr/bin/keytool.exe")"
fi
[ -x "$KEYTOOL" ] || { echo "❌ 未找到 keytool"; exit 1; }
JAVAC="$(dirname "$JAVA")/javac"
[ -x "$JAVAC" ] || JAVAC=javac
# python 探测：WindowsApps 的存根可能只是占位（执行失败），逐候选执行校验
PY=""
for C in $(command -v python3 2>/dev/null || true) \
         $(command -v python 2>/dev/null || true) \
         "$LOCALAPPDATA/Python"/pythoncore-*/python.exe; do
  if [ -n "$C" ] && "$C" -c "print('ok')" >/dev/null 2>&1; then
    PY="$C"; break
  fi
done
if [ -z "$PY" ]; then
  echo "❌ 未找到可用的 python3（zip 打包步骤需要）"; exit 1
fi

echo "SDK       : $SDK"
echo "build-tools: $BT"
echo "platform  : $PLATFORM"
echo "java      : $($JAVA -version 2>&1 | head -1)"
echo "python    : $PY"

APP_ID="com.classtechstar.hspcb"
VER="$(grep -o '"version": *"[^"]*"' "$ROOT/package.json" | head -1 | grep -o '[0-9][^"]*')"

# ---------- 0. 同步 Web 资产（仓库 1.2/ → assets/web/） ----------
echo "── [0/7] 同步 Web 资产"
rm -rf app/assets/web
mkdir -p app/assets/web
cp -r "$ROOT/1.2/." app/assets/web/
echo "   assets/web: $(find app/assets/web -type f | wc -l) 个文件"

# ---------- 1. debug keystore（项目内固定，保证升级安装签名一致） ----------
KEYSTORE="debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
  echo "── [1/7] 生成项目 debug keystore（入库，仅用于本应用测试签名）"
  "$KEYTOOL" -genkeypair -v \
    -keystore "$KEYSTORE" -storepass android -keypass android \
    -alias androiddebug -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=HSPCB Debug, OU=ClassTechStar, O=ClassTechStar, L=GD, C=CN" >/dev/null 2>&1
else
  echo "── [1/7] 复用已有 debug.keystore"
fi

# ---------- 2. 编译资源 ----------
echo "── [2/7] aapt2 compile/link"
rm -rf build && mkdir -p build/gen build/obj build/dex
"$BT/aapt2" compile --dir app/res -o build/res.zip
"$BT/aapt2" link \
  -o build/base.apk \
  -I "$PLATFORM" \
  --manifest app/AndroidManifest.xml \
  -R build/res.zip \
  --java build/gen \
  --auto-add-overlay

# ---------- 3. 编译 Java ----------
echo "── [3/7] javac"
find app/java -name '*.java' > build/sources.txt
find build/gen -name '*.java' >> build/sources.txt
JAVAC="$(dirname "$JAVA")/javac"
[ -x "$JAVAC" ] || JAVAC=javac
"$JAVAC" --release 11 -nowarn -cp "$PLATFORM" -d build/obj @build/sources.txt

# ---------- 4. dex ----------
echo "── [4/7] d8"
find build/obj -name '*.class' > build/classes.txt
"$JAVA" -cp "$BT/lib/d8.jar" com.android.tools.r8.D8 \
  --release --lib "$PLATFORM" --min-api 24 \
  --output build/dex @build/classes.txt

# ---------- 5. 组装 APK（assets + classes.dex） ----------
echo "── [5/7] 组装 assets 与 classes.dex"
mkdir -p build/stage
cp -r app/assets build/stage/assets
cp build/dex/classes.dex build/stage/classes.dex
"$PY" - "$PWD/build/base.apk" "$PWD/build/stage" <<'PYEOF'
import sys, zipfile, os
apk, stage = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(apk, 'a', zipfile.ZIP_DEFLATED) as z:
    for base, _, files in os.walk(stage):
        for f in files:
            full = os.path.join(base, f)
            arc = os.path.relpath(full, stage).replace(os.sep, '/')
            z.write(full, arc)
print('   zip 追加完成')
PYEOF

# ---------- 6. 对齐 ----------
echo "── [6/7] zipalign"
"$BT/zipalign" -f 4 build/base.apk build/aligned.apk

# ---------- 7. 签名 ----------
echo "── [7/7] apksigner"
mkdir -p releases
OUT="releases/HSPCB-v${VER}-debug.apk"
"$JAVA" -cp "$BT/lib/apksigner.jar" com.android.apksigner.ApkSignerTool sign \
  --ks "$KEYSTORE" --ks-pass pass:android --key-pass pass:android \
  --ks-key-alias androiddebug \
  --out "$OUT" build/aligned.apk
"$JAVA" -cp "$BT/lib/apksigner.jar" com.android.apksigner.ApkSignerTool verify "$OUT" && echo "   签名校验通过"

echo ""
echo "✅ 构建完成: android/$OUT ($(du -h "$OUT" | cut -f1))"
"$BT/aapt" dump badging "$OUT" | head -4

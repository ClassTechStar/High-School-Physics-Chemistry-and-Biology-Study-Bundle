package com.classtechstar.hspcb;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * UpdateManager — 检查更新 / 下载 / 自动更新（更新源默认 GitHub Release）。
 *
 * 检查链（与 Web 端 1.2/js/update-check.js 的源顺序一致）：
 *   1. GitHub Releases API（tag + 说明 + CI 自动构建的 APK 附件）
 *   2. GitHub raw 清单 1.2/update-manifest.json（轻量兜底）
 *   3. Gitee 镜像（仅当用户在设置里显式开启「允许 Gitee 回退」实验项）
 * 结果经 evaluateJavascript 回调 window.__hspcbUpdateResult(json)，由
 * update-check.js 统一消费（设置中心 / 通知）。
 *
 * 自动更新：MainActivity 启动时调用 autoCheck（24h 频控，SharedPreferences）；
 * 发现新版弹原生 AlertDialog，用户确认后后台下载 APK 到
 * getExternalFilesDir("updates")，完成后经 MiniFileProvider 的 content:// 唤起
 * 系统安装器。全程仅只读 GET 两个代码托管域，不上传任何数据。
 *
 * 更新链安全（v1.9 P0）：下载完成后必须校验 SHA-256 —— 期望值来自 Release 附件
 * checksums.sha256（或 raw 清单的 sha256 字段）。拿不到期望值、或哈希不匹配，
 * 一律删除已下载文件并拒绝唤起安装器（安全默认：宁可不让更新，也不装来历
 * 不明的 APK）。这是为了防「校园网/Gitee 镜像投毒 → 任意 APK 静默覆盖安装」。
 */
public final class UpdateManager {

    private static final String GH_API =
            "https://api.github.com/repos/ClassTechStar/High-School-Physics-Chemistry-and-Biology-Study-Bundle/releases/latest";
    private static final String GH_RAW_MANIFEST =
            "https://raw.githubusercontent.com/ClassTechStar/High-School-Physics-Chemistry-and-Biology-Study-Bundle/main/1.2/update-manifest.json";
    /** Gitee 镜像（实验回退）：仅在用户显式开启设置项后参与检查/下载。 */
    private static final String GITEE_API =
            "https://gitee.com/api/v5/repos/qualcommsnapdragon/High-School-Physics-Chemistry-and-Biology-Study-Bundle/releases/latest";
    private static final String GITEE_RAW_MANIFEST =
            "https://gitee.com/qualcommsnapdragon/High-School-Physics-Chemistry-and-Biology-Study-Bundle/raw/main/1.2/update-manifest.json";
    private static final String PREFS = "hspcb_update";
    private static final String KEY_LAST_CHECK = "lastCheck";
    /** 实验项：允许 Gitee 镜像回退（默认 false，只走 GitHub）。 */
    private static final String KEY_ALLOW_GITEE = "allowGitee";
    private static final long CHECK_INTERVAL = 24L * 3600 * 1000;

    private static final ExecutorService POOL = Executors.newSingleThreadExecutor();
    private static volatile String lastApkUrl = null; // 最近一次检查到的 APK 下载地址（供 JS 桥 downloadUpdate）
    private static volatile String lastExpectedSha = null; // 该 APK 的期望 SHA-256（十六进制小写）
    private static final AtomicBoolean BUSY = new AtomicBoolean(false);
    private static final Handler MAIN = new Handler(Looper.getMainLooper());

    private UpdateManager() {
    }

    /** 当前应用 versionName（供 JS 桥 getVersion）。 */
    public static String localVersion(Context ctx) {
        try {
            return ctx.getPackageManager()
                    .getPackageInfo(ctx.getPackageName(), 0).versionName;
        } catch (Exception e) {
            return "0.0.0";
        }
    }

    /** 静默检查：24h 频控；发现新版弹原生确认框（自动更新入口）。 */
    public static void autoCheck(final Activity activity) {
        SharedPreferences sp = activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        long last = sp.getLong(KEY_LAST_CHECK, 0);
        if (System.currentTimeMillis() - last < CHECK_INTERVAL) return;
        check(activity, null, true);
    }

    /**
     * 手动检查。activity 可为 null（仅纯检查不弹窗）；progressCb 用于把
     * 下载进度转告页面（可 null）。
     */
    public static void check(final Activity activity, final WebView webView, final boolean auto) {
        if (BUSY.getAndSet(true)) return;
        final Context ctx = activity != null ? activity.getApplicationContext()
                : null;
        POOL.execute(new Runnable() {
            @Override
            public void run() {
                JSONObject result = new JSONObject();
                try {
                    markChecked(ctx);
                    boolean allowGitee = isGiteeAllowed(ctx);
                    JSONObject remote = fetchLatest(allowGitee);
                    if (remote == null) remote = fetchManifest(allowGitee);
                    if (remote == null) {
                        result.put("ok", false);
                        result.put("error", "unreachable");
                        result.put("hasUpdate", false);
                    } else {
                        String local = ctx != null ? localVersion(ctx) : "0.0.0";
                        boolean newer = isNewer(remote.optString("version"), local);
                        String apkUrl = remote.optString("apkUrl");
                        // 更新链安全：解析期望 SHA-256（Release 附件 checksums.sha256 优先，
                        // 清单 sha256 字段兜底）。下载后据此校验，缺失即拒绝安装。
                        String sha = remote.optString("sha256", "");
                        if (sha.isEmpty() && !apkUrl.isEmpty()) sha = fetchChecksumsFor(apkUrl);
                        result.put("ok", true);
                        result.put("hasUpdate", newer);
                        result.put("version", remote.optString("version"));
                        result.put("notes", remote.optString("notes", ""));
                        result.put("releaseUrl", remote.optString("releaseUrl"));
                        result.put("apkUrl", apkUrl);
                        result.put("sha256", sha);
                        lastApkUrl = apkUrl;
                        lastExpectedSha = sha;
                        result.put("localVersion", local);
                        result.put("source", remote.optString("source", "github"));
                        // 自动检查 + 发现新版 + 有宿主 Activity → 原生确认框
                        if (newer && auto && activity != null && !activity.isFinishing()) {
                            showUpdateDialog(activity, remote.optString("version"),
                                    remote.optString("notes", ""), apkUrl);
                        }
                    }
                } catch (Exception e) {
                    try {
                        result.put("ok", false);
                        result.put("error", String.valueOf(e.getMessage()));
                        result.put("hasUpdate", false);
                    } catch (Exception ignored) {
                    }
                }
                BUSY.set(false);
                if (webView != null) {
                    final String json = result.toString();
                    MAIN.post(new Runnable() {
                        @Override
                        public void run() {
                            webView.evaluateJavascript(
                                    "window.__hspcbUpdateResult(" + json + ");", null);
                        }
                    });
                }
            }
        });
    }

    /** 下载 apkUrl 并校验 SHA-256，通过后才唤起系统安装器。 */
    public static void downloadAndInstall(final Activity activity, final String apkUrl) {
        downloadAndInstall(activity, apkUrl, lastExpectedSha);
    }

    /**
     * 下载 + 校验 + 安装。
     *
     * 安全默认（v1.9 P0）：expectedSha 为空 → 不下载不安装，直接报错；
     * 下载完成后哈希不匹配 → 删除文件 + Toast 报错，绝不唤起安装器。
     * 期望值来源：Release 附件 checksums.sha256（CI 与 APK 同源生成）。
     */
    public static void downloadAndInstall(final Activity activity, final String apkUrl,
                                          final String expectedSha) {
        if (apkUrl == null || apkUrl.isEmpty() || !BUSY.compareAndSet(false, true)) return;
        if (expectedSha == null || expectedSha.trim().isEmpty()) {
            BUSY.set(false);
            toast(activity, "更新校验值缺失，已取消自动安装；请到发布页手动下载");
            return;
        }
        POOL.execute(new Runnable() {
            @Override
            public void run() {
                File dir = new File(activity.getExternalFilesDir(null), "updates");
                if (!dir.exists()) dir.mkdirs();
                String name = apkUrl.substring(apkUrl.lastIndexOf('/') + 1);
                if (!name.toLowerCase().endsWith(".apk")) name = "HSPCB-update.apk";
                final File out = new File(dir, name);
                try {
                    HttpURLConnection c = (HttpURLConnection) new URL(apkUrl).openConnection();
                    c.setConnectTimeout(15000);
                    c.setReadTimeout(30000);
                    c.setInstanceFollowRedirects(true);
                    c.setRequestProperty("User-Agent", "HSPCB-Android");
                    InputStream in = c.getInputStream();
                    long total = c.getContentLengthLong();
                    java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
                    FileOutputStream fos = new FileOutputStream(out);
                    byte[] buf = new byte[16384];
                    long done = 0;
                    int lastPct = -1;
                    int n;
                    while ((n = in.read(buf)) > 0) {
                        fos.write(buf, 0, n);
                        md.update(buf, 0, n);
                        done += n;
                        if (total > 0) {
                            int pct = (int) (done * 100 / total);
                            if (pct >= lastPct + 25) {
                                lastPct = pct;
                                toast(activity, "正在下载更新… " + pct + "%");
                            }
                        }
                    }
                    fos.flush();
                    fos.close();
                    in.close();
                    c.disconnect();

                    // 校验：哈希不一致即删文件并中止（不进入安装流程）
                    String actual = toHex(md.digest());
                    String expected = expectedSha.trim().toLowerCase();
                    if (!constantTimeEquals(actual, expected)) {
                        deleteQuietly(out);
                        toast(activity, "更新包校验失败（SHA-256 不匹配），已删除下载文件");
                        return;
                    }

                    toast(activity, "校验通过，即将打开安装器");
                    MAIN.post(new Runnable() {
                        @Override
                        public void run() {
                            install(activity, out);
                        }
                    });
                } catch (final Exception e) {
                    deleteQuietly(out);
                    toast(activity, "更新下载失败：" + e.getMessage());
                } finally {
                    BUSY.set(false);
                }
            }
        });
    }

    /* ---------------- 内部 ---------------- */

    private static void showUpdateDialog(final Activity activity, String version,
                                         String notes, final String apkUrl) {
        String body = "发现新版本 " + version + "（当前 "
                + localVersion(activity) + "）。\n\n" + notes;
        if (body.length() > 600) body = body.substring(0, 600) + "…";
        final String dialogBody = body;
        MAIN.post(new Runnable() {
            @Override
            public void run() {
                if (activity.isFinishing()) return;
                new AlertDialog.Builder(activity)
                        .setTitle("发现新版本")
                        .setMessage(dialogBody)
                        .setPositiveButton("立即更新", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface d, int w) {
                                downloadAndInstall(activity, apkUrl);
                            }
                        })
                        .setNegativeButton("暂不", null)
                        .show();
            }
        });
    }

    private static void toast(final Activity activity, final String msg) {
        if (activity == null || activity.isFinishing()) return;
        MAIN.post(new Runnable() {
            @Override
            public void run() {
                try {
                    android.widget.Toast.makeText(activity, msg, android.widget.Toast.LENGTH_SHORT).show();
                } catch (Exception ignored) {
                }
            }
        });
    }

    private static void install(Activity activity, File apk) {
        Uri uri = MiniFileProvider.uriFor(activity, apk);
        Intent it = new Intent(Intent.ACTION_VIEW);
        it.setDataAndType(uri, "application/vnd.android.package-archive");
        it.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        activity.startActivity(it);
    }

    private static void markChecked(Context ctx) {
        if (ctx == null) return;
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit().putLong(KEY_LAST_CHECK, System.currentTimeMillis()).apply();
    }

    /** GitHub Releases API → {version, notes, releaseUrl, apkUrl, source}，失败返回 null。 */
    private static JSONObject fetchLatest(boolean allowGitee) {
        JSONObject out = fetchLatestFrom(GH_API, "github-release", "asset");
        if (out == null && allowGitee) {
            out = fetchLatestFrom(GITEE_API, "gitee-release", "asset");
        }
        return out;
    }

    /** 指定 Release API 的抓取与结构归一（GitHub / Gitee 共用，字段名一致）。 */
    private static JSONObject fetchLatestFrom(String apiUrl, String source, String shaMode) {
        try {
            JSONObject rel = getJSON(apiUrl, 10000);
            if (rel == null || !rel.has("tag_name")) return null;
            JSONObject out = new JSONObject();
            String tag = rel.getString("tag_name");
            out.put("version", tag);
            out.put("notes", rel.optString("body", ""));
            out.put("releaseUrl", rel.optString("html_url"));
            out.put("source", source);
            // APK 附件选择：优先「文件名含 tag 版本串且最后上传」的附件
            // ——多附件并存时（CI 构建件与人工签名件同名族），后者才可覆盖安装
            String apkUrl = "";
            String key = tag.startsWith("v") ? tag.substring(1) : tag;
            JSONArray assets = rel.optJSONArray("assets");
            if (assets != null) {
                for (int i = 0; i < assets.length(); i++) {
                    JSONObject a = assets.getJSONObject(i);
                    String name = a.optString("name", "");
                    if (!name.toLowerCase().endsWith(".apk")) continue;
                    apkUrl = a.optString("browser_download_url");
                    if (name.contains(key)) apkUrl = a.optString("browser_download_url");
                }
            }
            out.put("apkUrl", apkUrl);
            return out;
        } catch (Exception e) {
            return null;
        }
    }

    /** raw 清单兜底 → {version, notes, releaseUrl, apkUrl, sha256, source}，失败返回 null。 */
    private static JSONObject fetchManifest(boolean allowGitee) {
        JSONObject out = fetchManifestFrom(GH_RAW_MANIFEST, "github-manifest", true);
        if (out == null && allowGitee) {
            out = fetchManifestFrom(GITEE_RAW_MANIFEST, "gitee-manifest", false);
        }
        return out;
    }

    private static JSONObject fetchManifestFrom(String manifestUrl, String source, boolean github) {
        try {
            JSONObject m = getJSON(manifestUrl, 10000);
            if (m == null || !m.has("version")) return null;
            JSONObject out = new JSONObject();
            String v = m.getString("version");
            String apk = m.optString("apk", "");
            out.put("version", v);
            out.put("notes", m.optString("notes", ""));
            out.put("sha256", m.optString("sha256", ""));
            if (github) {
                out.put("releaseUrl", "https://github.com/ClassTechStar/"
                        + "High-School-Physics-Chemistry-and-Biology-Study-Bundle/releases/latest");
                out.put("apkUrl", apk.isEmpty() ? "" :
                        "https://github.com/ClassTechStar/"
                                + "High-School-Physics-Chemistry-and-Biology-Study-Bundle/releases/download/v"
                                + v + "/" + apk);
            } else {
                out.put("releaseUrl", "https://gitee.com/qualcommsnapdragon/"
                        + "High-School-Physics-Chemistry-and-Biology-Study-Bundle/releases");
                out.put("apkUrl", apk.isEmpty() ? "" :
                        "https://gitee.com/qualcommsnapdragon/"
                                + "High-School-Physics-Chemistry-and-Biology-Study-Bundle/releases/download/v"
                                + v + "/" + apk);
            }
            out.put("source", source);
            return out;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 取 apkUrl 同目录 Release 的 checksums.sha256 附件，解析出该 APK 的哈希。
     * GitHub 附件下载地址形如 .../releases/download/<tag>/<file>，同 release 的
     * 其他附件只需替换文件名；Gitee 同构。失败返回空串（客户端随后拒绝自动安装）。
     */
    private static String fetchChecksumsFor(String apkUrl) {
        try {
            int slash = apkUrl.lastIndexOf('/');
            if (slash <= 0) return "";
            String shaUrl = apkUrl.substring(0, slash + 1) + "checksums.sha256";
            String text = getText(shaUrl, 10000);
            if (text == null) return "";
            String apkName = apkUrl.substring(slash + 1);
            for (String line : text.split("\\r?\\n")) {
                String t = line.trim();
                if (t.isEmpty()) continue;
                // sha256sum 格式："<hex>  <file>"（两个空格，也可能是 *file）
                int i = t.indexOf("  ");
                if (i < 0) i = t.indexOf(" *");
                if (i < 0) continue;
                String hash = t.substring(0, i).trim().toLowerCase();
                String file = t.substring(i + 2).trim();
                if (file.equals(apkName) && hash.matches("[0-9a-f]{64}")) return hash;
            }
            return "";
        } catch (Exception e) {
            return "";
        }
    }

    private static String getText(String url, int timeout) throws IOException {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(timeout);
        c.setReadTimeout(timeout);
        c.setRequestProperty("User-Agent", "HSPCB-Android");
        int code = c.getResponseCode();
        if (code != 200) {
            c.disconnect();
            return null;
        }
        InputStream in = c.getInputStream();
        java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int n;
        while ((n = in.read(buf)) > 0) bos.write(buf, 0, n);
        in.close();
        c.disconnect();
        return new String(bos.toByteArray(), java.nio.charset.StandardCharsets.UTF_8);
    }

    /** 字节数组 → 小写十六进制。 */
    private static String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(Character.forDigit((b >> 4) & 0xF, 16));
            sb.append(Character.forDigit(b & 0xF, 16));
        }
        return sb.toString();
    }

    /** 常量时间比较，避免按字节短路带来的时序侧信道。 */
    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) return false;
        int diff = 0;
        for (int i = 0; i < a.length(); i++) diff |= a.charAt(i) ^ b.charAt(i);
        return diff == 0;
    }

    private static void deleteQuietly(File f) {
        try {
            if (f != null && f.exists()) f.delete();
        } catch (Exception ignored) {
        }
    }

    /** 实验项：是否允许 Gitee 镜像回退（默认关闭，仅 GitHub）。 */
    public static boolean isGiteeAllowed(Context ctx) {
        if (ctx == null) return false;
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .getBoolean(KEY_ALLOW_GITEE, false);
    }

    /** 供 JS 桥读写「允许 Gitee 回退」实验项。 */
    public static void setGiteeAllowed(Context ctx, boolean allow) {
        if (ctx == null) return;
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit().putBoolean(KEY_ALLOW_GITEE, allow).apply();
    }

    private static JSONObject getJSON(String url, int timeout) throws IOException, org.json.JSONException {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(timeout);
        c.setReadTimeout(timeout);
        c.setRequestProperty("User-Agent", "HSPCB-Android");
        c.setRequestProperty("Accept", "application/json");
        int code = c.getResponseCode();
        if (code != 200) {
            c.disconnect();
            return null;
        }
        InputStream in = c.getInputStream();
        java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int n;
        while ((n = in.read(buf)) > 0) bos.write(buf, 0, n);
        in.close();
        c.disconnect();
        return new JSONObject(new String(bos.toByteArray(), java.nio.charset.StandardCharsets.UTF_8));
    }

    /** 语义化版本比较：remote > local 返回 true；忽略 v 前缀与后缀。 */
    private static boolean isNewer(String remote, String local) {
        int[] r = parts(remote), l = parts(local);
        for (int i = 0; i < 3; i++) {
            if (r[i] != l[i]) return r[i] > l[i];
        }
        return false;
    }

    /** 最近一次检查到的 APK 下载地址（downloadUpdate 用）；null 表示尚未检查到。 */
    public static String lastApkUrl() {
        return lastApkUrl;
    }

    /** 最近一次检查到的 APK 期望 SHA-256；空表示该版本未提供校验清单（拒绝自动安装）。 */
    public static String lastExpectedSha() {
        return lastExpectedSha;
    }

    private static int[] parts(String v) {
        int[] out = {0, 0, 0};
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("^v?(\\d+)\\.(\\d+)\\.(\\d+)").matcher(String.valueOf(v == null ? "" : v).trim());
        if (m.find()) {
            out[0] = Integer.parseInt(m.group(1));
            out[1] = Integer.parseInt(m.group(2));
            out[2] = Integer.parseInt(m.group(3));
        }
        return out;
    }
}

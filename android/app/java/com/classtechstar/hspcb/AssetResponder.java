package com.classtechstar.hspcb;

import android.content.res.AssetManager;
import android.webkit.WebResourceResponse;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * AssetResponder — 把 https://appassets.local/ 的请求映射到 APK assets/web/ 下文件。
 *
 * 配合 WebViewClient.shouldInterceptRequest 使用（替代本地 HTTP 服务器）：
 * 不创建任何 socket（部分 ROM 对应用绑定 loopback 报 EPERM）、不依赖 cleartext、
 * 虚构域名为 secure context —— localStorage / fetch / Web Speech 均正常。
 */
public final class AssetResponder {

    public static final String HOST = "appassets.local";
    private static final String ROOT = "web/";
    private static final String INDEX_HTML = "/index.html";

    /** 页面里的视口声明（Web 版用 device-width，手机上会走 768px 移动断点）。 */
    private static final String VP_WEB =
            "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\">";
    /** 安卓端改成固定桌面宽度，页面布局与 Web 版一致；屏不够宽时靠捏合缩放查看。 */
    private static final String VP_APP = "<meta name=\"viewport\" content=\"width=1280\">";

    private static final Map<String, String> MIME = new HashMap<>();

    static {
        MIME.put("html", "text/html");
        MIME.put("htm", "text/html");
        MIME.put("js", "text/javascript");
        MIME.put("mjs", "text/javascript");
        MIME.put("css", "text/css");
        MIME.put("json", "application/json");
        MIME.put("webmanifest", "application/manifest+json");
        MIME.put("png", "image/png");
        MIME.put("jpg", "image/jpeg");
        MIME.put("jpeg", "image/jpeg");
        MIME.put("gif", "image/gif");
        MIME.put("webp", "image/webp");
        MIME.put("svg", "image/svg+xml");
        MIME.put("ico", "image/x-icon");
        MIME.put("txt", "text/plain");
        MIME.put("xml", "application/xml");
        MIME.put("woff", "font/woff");
        MIME.put("woff2", "font/woff2");
        MIME.put("ttf", "font/ttf");
        MIME.put("zip", "application/zip");
    }

    private AssetResponder() {
    }

    /**
     * 解析并打开 assets 下的资源；返回 WebResourceResponse（含 404/403 应答），
     * 调用方直接返回给 WebView。
     */
    public static WebResourceResponse respond(AssetManager assets, String rawPath) {
        String path = normalize(rawPath);
        if (path == null) {
            return text(403, "Forbidden");
        }
        InputStream is = open(assets, ROOT + path.substring(1));
        if (is == null) {
            return text(404, "Not Found");
        }
        // 安卓端按桌面视口排版，页面结构与 Web 版完全一致，不回落到 768px 的移动专属布局。
        // 只改返回给 WebView 的这份内容；磁盘上的 assets 与仓库 1.2/ 保持字节一致
        // （scripts/check-asset-sync.mjs 按哈希比对两端）。
        if (INDEX_HTML.equals(path)) {
            is = withDesktopViewport(is);
        }
        return new WebResourceResponse(mimeOf(path), encodingOf(path), is);
    }

    /** 是否属于本应用的虚构资产域（外链不拦截）。 */
    public static boolean isAssetHost(String host) {
        return HOST.equals(host);
    }

    /* ---------------- 内部 ---------------- */

    private static InputStream open(AssetManager assets, String path) {
        try {
            return assets.open(path);
        } catch (IOException e) {
            return null;
        }
    }

    private static WebResourceResponse text(int code, String message) {
        return new WebResourceResponse("text/plain", "utf-8", code, message,
                null, new ByteArrayInputStream(message.getBytes()));
    }

    /** 读完后替换视口声明，返回新的字节流。找不到原声明时原样返回。 */
    private static InputStream withDesktopViewport(InputStream is) {
        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            byte[] buf = new byte[16384];
            int n;
            while ((n = is.read(buf)) > 0) bos.write(buf, 0, n);
            is.close();
            String html = new String(bos.toByteArray(), "utf-8");
            if (html.contains(VP_WEB)) {
                html = html.replace(VP_WEB, VP_APP);
            }
            return new ByteArrayInputStream(html.getBytes("utf-8"));
        } catch (IOException e) {
            return is;
        }
    }

    /** 路径规范化：拒绝 ..、绝对路径等穿越尝试；返回以 / 开头的规范化路径。 */
    private static String normalize(String p) {
        if (p == null || p.isEmpty() || !p.startsWith("/")) return null;
        String[] segs = p.substring(1).split("/");
        java.util.ArrayDeque<String> stack = new java.util.ArrayDeque<>();
        for (String seg : segs) {
            if (seg.isEmpty() || ".".equals(seg)) continue;
            if ("..".equals(seg)) {
                if (stack.isEmpty()) return null;
                stack.pollLast();
            } else {
                stack.addLast(seg);
            }
        }
        if (stack.isEmpty()) return "/index.html";
        StringBuilder sb = new StringBuilder("/");
        for (String seg : stack) sb.append(seg).append('/');
        sb.setLength(sb.length() - 1);
        return sb.toString();
    }

    private static String mimeOf(String path) {
        int dot = path.lastIndexOf('.');
        String ext = dot >= 0 ? path.substring(dot + 1).toLowerCase() : "";
        String m = MIME.get(ext);
        return m != null ? m : "application/octet-stream";
    }

    private static String encodingOf(String path) {
        String m = mimeOf(path);
        return m.contains("text/") || m.contains("json") || m.contains("xml") || m.contains("svg")
                ? "utf-8" : null;
    }
}

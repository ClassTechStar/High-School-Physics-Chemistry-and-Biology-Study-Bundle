package com.classtechstar.hspcb;

import android.content.res.AssetManager;
import android.webkit.WebResourceResponse;

import java.io.ByteArrayInputStream;
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

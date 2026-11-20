package com.classtechstar.hspcb;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * MainActivity — HSPCB 学习大礼包安卓端原生壳。
 *
 * 架构：WebView 加载虚构域 https://appassets.local/，WebViewClient
 * shouldInterceptRequest 把全部该域请求映射到 APK assets/web/ 下的纯静态
 * 应用（与仓库 1.2/ 目录同源）。保留 Web 端全部核心功能与界面风格；
 * https 语义下 localStorage / fetch / Web Speech 均正常，全程无网络请求。
 *
 * 原生职责：生命周期、系统返回键映射 WebView 后退、外部链接移交系统浏览器、
 * 随系统明暗的主题（values-night）、检查更新与自动更新（v1.8.1：HSPCBNative JS 桥）。
 */
public class MainActivity extends Activity {

    private WebView webView;

    /** 暴露给页面的原生能力（仅本资产域页面可调）。 */
    private class NativeBridge {

        @JavascriptInterface
        public String getVersion() {
            return UpdateManager.localVersion(MainActivity.this);
        }

        /** 异步检查；结果经 window.__hspcbUpdateResult(json) 回调页面。 */
        @JavascriptInterface
        public void checkUpdate() {
            UpdateManager.check(MainActivity.this, webView, false);
        }

        /** 下载 apkUrl 并唤起系统安装器。 */
        @JavascriptInterface
        public void downloadUpdate() {
            String url = UpdateManager.lastApkUrl();
            UpdateManager.downloadAndInstall(MainActivity.this, url);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings st = webView.getSettings();
        st.setJavaScriptEnabled(true);
        st.setDomStorageEnabled(true);          // 学习记录全部存于 localStorage
        st.setDatabaseEnabled(true);
        st.setAllowFileAccess(false);           // 统一经拦截式资产域，禁 file://
        st.setAllowContentAccess(false);
        st.setMediaPlaybackRequiresUserGesture(false); // 朗读按钮（Web Speech）
        st.setUseWideViewPort(true);
        st.setLoadWithOverviewMode(true);
        // v1.8：视口跟随设备宽度，窄屏走 responsive.css 的真移动布局（与 Web 版一致）；
        // 保留捏合缩放供用户放大文字/图表
        st.setSupportZoom(true);
        st.setBuiltInZoomControls(true);
        st.setDisplayZoomControls(false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Uri u = Uri.parse(url);
                // 仅允许资产域内导航；外部链接移交系统浏览器
                if (AssetResponder.isAssetHost(u.getHost())) {
                    return false;
                }
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, u));
                } catch (Exception ignored) {
                }
                return true;
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if (AssetResponder.isAssetHost(u.getHost())) {
                    return AssetResponder.respond(getAssets(), u.getPath());
                }
                return super.shouldInterceptRequest(view, request);
            }
        });

        // v1.8.1：原生桥（检查更新/下载更新）+ 启动静默检查（24h 频控）
        webView.addJavascriptInterface(new NativeBridge(), "HSPCBNative");
        UpdateManager.autoCheck(this);

        String url = "https://" + AssetResponder.HOST + "/index.html";
        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(url);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) webView.saveState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}

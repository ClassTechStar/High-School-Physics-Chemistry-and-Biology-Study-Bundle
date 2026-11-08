package com.classtechstar.hspcb;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
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
 * 随系统明暗的主题（values-night）。
 */
public class MainActivity extends Activity {

    private WebView webView;

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
        // 页面按 1280px 桌面视口布局（见 build-apk.sh 的 viewport 改写），
        // 手机屏放不下时靠捏合/双击缩放查看，避免回落到 768px 的移动专属排版
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

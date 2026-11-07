// ============================================================
// speech-service.js — 语音朗读服务（v1.5 / T9，借鉴 ClassIsland ISpeechService
// 的 Provider 抽象，当前实现为 Web Speech API speechSynthesis）
// 用法：
//   HSPCBSpeech.speak(text, {lang:'en-US', rate:1})
//   HSPCBSpeech.canSpeak('en-US') → UI 据此渲染/隐藏朗读按钮
//   任意元素加 data-speak="文本" data-speak-lang="en-US" 即可点击朗读（本文件统一委托）。
// ============================================================
window.HSPCBSpeech = (function () {
    'use strict';

    var synth = (typeof window.speechSynthesis !== 'undefined') ? window.speechSynthesis : null;

    function voices() {
        try { return synth ? synth.getVoices() : []; } catch (e) { return []; }
    }

    /** 宽松判定：支持 API 即视为可用（音色列表异步加载，缺失时仅按主语言回退） */
    function canSpeak(lang) {
        if (!synth) return false;
        var vs = voices();
        if (!vs.length) return true;
        var prefix = String(lang || 'zh-CN').split('-')[0].toLowerCase();
        for (var i = 0; i < vs.length; i++) {
            var l = (vs[i].lang || '').toLowerCase();
            if (l.indexOf(prefix) === 0) return true;
        }
        return prefix === 'en' || prefix === 'zh'; // 有任意音色时英/中按系统回退可用
    }

    function speak(text, opts) {
        if (!synth || !text) return false;
        try {
            synth.cancel();
            var u = new SpeechSynthesisUtterance(String(text));
            u.lang = (opts && opts.lang) || 'zh-CN';
            u.rate = (opts && opts.rate) || 1;
            synth.speak(u);
            return true;
        } catch (e) { return false; }
    }

    function stop() {
        try { synth && synth.cancel(); } catch (e) { /* ignore */ }
    }

    // 统一委托：点击 [data-speak] 即朗读（CSP 友好，无内联事件）
    if (typeof document !== 'undefined' && document.addEventListener) {
        document.addEventListener('click', function (ev) {
            var el = ev.target && ev.target.closest ? ev.target.closest('[data-speak]') : null;
            if (!el) return;
            ev.preventDefault();
            var okSpeak = speak(el.getAttribute('data-speak'), {
                lang: el.getAttribute('data-speak-lang') || 'zh-CN',
                rate: parseFloat(el.getAttribute('data-speak-rate')) || 1
            });
            if (!okSpeak) {
                try {
                    window.HSPCBNotify && HSPCBNotify.notify({
                        id: 'speech.unavailable', level: 'warn',
                        title: '当前浏览器不支持朗读', message: '朗读功能需要支持 Web Speech 的浏览器（Chrome / Edge）。'
                    });
                } catch (e) { /* ignore */ }
            }
        }, false);
    }

    return {
        speak: speak,
        stop: stop,
        canSpeak: canSpeak,
        supported: !!synth
    };
})();

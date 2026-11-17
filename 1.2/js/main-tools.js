/* main-tools.js — 主逻辑·工具（v1.8 P3 自 main-inline.js 拆分）
   语文搜索/侧栏、三个计算器、对应事件委托与 window 导出。 */
(function() {
    'use strict';

    function chineseSearch() {
        var input = document.getElementById("chineseSearchInput").value.toLowerCase();
        if (input.length < 2) return;
        var container = document.querySelector('.chinese-knowledge');
        if (!container) return;
        var sections = container.querySelectorAll('.section');
        for (var i = 0; i < sections.length; i++) {
            var text = sections[i].innerText.toLowerCase();
            if (text.indexOf(input) > -1) {
                sections[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
                sections[i].style.boxShadow = "0 0 15px rgba(14, 165, 233, 0.4)";
                setTimeout(function(s) { return function() { s.style.boxShadow = ""; }; }(sections[i]), 2000);
                break;
            }
        }
    }

    // Bind sidebar navigation within Chinese section
    function initChineseSidebar() {
        var container = document.querySelector('.chinese-knowledge');
        if (!container) return;
        var navTitles = container.querySelectorAll('.nav-item-title');
        navTitles.forEach(function(title) {
            title.addEventListener('click', function() {
                var children = this.nextElementSibling;
                if (children && children.classList.contains('nav-children')) {
                    children.classList.toggle('show');
                    this.classList.toggle('active');
                }
            });
        });
        // Bind sidebar links to scroll to sections
        var navLinks = container.querySelectorAll('.nav-children a');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var targetId = this.getAttribute('href').substring(1);
                var targetEl = container.querySelector('#' + targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                navLinks.forEach(function(l) { l.style.fontWeight = ''; });
                this.style.fontWeight = '700';
            });
        });
    }

    // v1.3: 暴露到全局（chineseSearch 供 data-action 委托；initChineseSidebar
    // 供 main-nav 的 showSection 补丁在进入语文 section 时调用）
    window.chineseSearch = chineseSearch;
    window.initChineseSidebar = initChineseSidebar;

    // c / T12：内联事件属性改事件委托
    // CSP 的 script-src 一旦去掉 'unsafe-inline'，HTML 内联事件属性（onclick/onkeyup）
    // 会被浏览器直接拦截。原静态 HTML 中真实存在 2 处：主题切换按钮 + 语文搜索框，
    // 现改为 data-action 约定 + 文档级委托（与 english-tools 等既有 data-action 机制一致）。
    // 注意：委托必须挂在此处（而非 app.js 的 DOMContentLoaded），因为触发元素
    // 位于本 IIFE 所在 script 之前，若等 DOMContentLoaded 则首屏交互无响应。
    // 主题切换按钮的委托在下方「统一主题切换」IIFE 内注册（apply/current 只在该作用域可见）。
    document.addEventListener('keyup', function (e) {
        var t = e.target && e.target.closest ? e.target.closest('[data-action="chinese-search"]') : null;
        if (!t) return;
        chineseSearch();
    });

    // d：字符串模板内的内联 onclick 改委托
    // CSP script-src 去掉 'unsafe-inline' 后，innerHTML/字符串拼出的 on* 属性同样被
    // 浏览器拦截。原 3 个计算器按钮 / 17 个实验卡片标题 / 3 个快捷工具按钮分别改为：
    // 具名函数 + data-call、data-hook + HSPCBEV 委托、quickTool 包装函数。
    // 委托中枢 js/csp-delegation.js 以非 defer 方式先于本脚本加载，window.HSPCBEV 必就绪。

 /* 斜面力学计算器（原 index.html:2688 内联 onclick IIFE，逻辑原样搬移） */
    function calcMechIncline() {
        var m=parseFloat(document.getElementById('mech-mass').value)||0;var ang=parseFloat(document.getElementById('mech-angle').value)||0;var mu=parseFloat(document.getElementById('mech-mu').value)||0;var F=parseFloat(document.getElementById('mech-force').value)||0;var rad=ang*Math.PI/180;var G=m*9.8;var Fgs=G*Math.sin(rad);var Fgn=G*Math.cos(rad);var f=mu*Fgn;var a=(F-Fgs-f)/m;var res=document.getElementById('mech-result');if(res){var cls=a>0.01?'#10b981':(a<-0.01?'#ef4444':'#f59e0b');var desc=a>0.01?'\u2191\u52a0\u901f\u5ea6\u5411\u4e0a':(a<-0.01?'\u2193\u52a0\u901f\u5ea6\u5411\u4e0b':'=0\uff08\u5300\u901f\u6216\u9759\u6b62\uff09');res.innerHTML='<div class=\'result-card\'><h4>\ud83d\udcca \u8ba1\u7b97\u7ed3\u679c</h4><div class=\'key-point\'><strong>\u91cd\u529b\u5206\u91cf\uff08\u6cbf\u659c\u9762\uff09\uff1a</strong>mg\u00b7sin\u03b8 = '+Fgs.toFixed(2)+' N</div><div class=\'key-point\'><strong>\u91cd\u529b\u5206\u91cf\uff08\u5782\u76f4\u659c\u9762\uff09\uff1a</strong>mg\u00b7cos\u03b8 = '+Fgn.toFixed(2)+' N</div><div class=\'key-point\'><strong>\u6469\u64e6\u529b\uff1a</strong>f = \u03bc\u00b7N = '+f.toFixed(2)+' N</div><div class=\'key-point\'><strong>\u5408\u529b\uff08\u6cbf\u659c\u9762\u5411\u4e0a\u4e3a\u6b63\uff09\uff1a</strong>'+(F-Fgs-f).toFixed(2)+' N</div><div class=\'key-point\'>\u00b7 \u52a0\u901f\u5ea6 a = <b data-style=\'color:'+cls+'\'>'+a.toFixed(2)+' m/s\u00b2</b> '+desc+'</div></div>';}
    }
 /* 串/并联电路计算器（原 index.html:2710 内联 onclick IIFE，逻辑原样搬移） */
    function calcElecCircuit() {
        var U=parseFloat(document.getElementById('elec-volt').value)||0;var R1=parseFloat(document.getElementById('elec-r1').value)||0;var R2=parseFloat(document.getElementById('elec-r2').value)||0;var conn=document.getElementById('elec-conn').value;var res=document.getElementById('elec-result');if(!res)return;var Req,I1,I2,U1,U2,P;if(conn==='series'){Req=R1+R2;I1=I2=U/Req;U1=I1*R1;U2=I2*R2;P=U*I1;res.innerHTML='<div class=\'result-card\'><h4>\ud83d\udcca \u4e32\u8054\u7535\u8def\u8ba1\u7b97\u7ed3\u679c</h4><div class=\'key-point\'><strong>\u603b\u7535\u963b\uff1a</strong>R<sub>\u603b</sub> = R\u2081 + R\u2082 = '+Req.toFixed(1)+' \u03a9</div><div class=\'key-point\'><strong>\u7535\u6d41\uff1a</strong>I = I\u2081 = I\u2082 = U/R<sub>\u603b</sub> = '+I1.toFixed(3)+' A</div><div class=\'key-point\'><strong>\u5206\u538b\uff1a</strong>U\u2081 = '+U1.toFixed(2)+' V, U\u2082 = '+U2.toFixed(2)+' V (\u5206\u538b\u6bd4 R\u2081:R\u2082 = '+(R1/Req*100).toFixed(1)+'%:'+(R2/Req*100).toFixed(1)+'%)</div><div class=\'key-point\'><strong>\u603b\u529f\u7387\uff1a</strong>P = UI = '+P.toFixed(2)+' W</div></div>';}else{Req=(R1*R2)/(R1+R2);I1=U/R1;I2=U/R2;U1=U2=U;P=U*(I1+I2);res.innerHTML='<div class=\'result-card\'><h4>\ud83d\udcca \u5e76\u8054\u7535\u8def\u8ba1\u7b97\u7ed3\u679c</h4><div class=\'key-point\'><strong>\u603b\u7535\u963b\uff1a</strong>R<sub>\u603b</sub> = R\u2081R\u2082/(R\u2081+R\u2082) = '+Req.toFixed(1)+' \u03a9</div><div class=\'key-point\'><strong>\u5206\u6d41\uff1a</strong>I\u2081 = U/R\u2081 = '+I1.toFixed(3)+' A, I\u2082 = U/R\u2082 = '+I2.toFixed(3)+' A (I\u2081:I\u2082 = R\u2082:R\u2081 = '+I1.toFixed(3)+':'+I2.toFixed(3)+')</div><div class=\'key-point\'><strong>\u603b\u7535\u6d41\uff1a</strong>I<sub>\u603b</sub> = I\u2081 + I\u2082 = '+(I1+I2).toFixed(3)+' A</div><div class=\'key-point\'><strong>\u603b\u529f\u7387\uff1a</strong>P = '+P.toFixed(2)+' W</div></div>';}
    }
 /* 透镜成像计算器（原 index.html:2734 内联 onclick IIFE，逻辑原样搬移） */
    function calcOpticsMirror() {
        var f=parseFloat(document.getElementById('opt-f').value)||0;var u=parseFloat(document.getElementById('opt-u').value)||0;var res=document.getElementById('opt-result');if(!res||f<=0||u<=0)return;var v=1/(1/f-1/u);var m=-v/u;var vAbs=Math.abs(v);var mAbs=Math.abs(m);var imgType=v>0?'\u5b9e\u50cf':'\u865a\u50cf';var orientation=m>0?'\u6b63\u7acb':'\u5012\u7acb';var size=mAbs>1?'\u653e\u5927':(mAbs<1?'\u7f29\u5c0f':'\u7b49\u5927');res.innerHTML='<div class=\'result-card\'><h4>\ud83d\udcca \u900f\u955c\u6210\u50cf\u8ba1\u7b97\u7ed3\u679c</h4><div class=\'key-point\'><strong>\u50cf\u8ddd v =</strong> '+v.toFixed(2)+' cm \uff08'+imgType+' \uff09</div><div class=\'key-point\'><strong>\u653e\u5927\u7387 m =</strong> '+Math.abs(m).toFixed(2)+' \u00d7 \uff08'+orientation+' \uff09</div><div class=\'key-point\'><strong>\u6210\u50cf\u6027\u8d28\uff1a</strong>'+size+' \u00b7 '+orientation+' \u00b7 '+imgType+'</div></div>';
    }
    window.calcMechIncline = calcMechIncline;
    window.calcElecCircuit = calcElecCircuit;
    window.calcOpticsMirror = calcOpticsMirror;
})();

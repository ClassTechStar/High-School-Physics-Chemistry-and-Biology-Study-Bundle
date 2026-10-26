/* 首页工具区块折叠 · 外置自 index.html 内联脚本（e）；defer，置于 app.js 之前保持执行序 */
/* ---- 首页工具区块折叠功能 ---- */
(function(){
    'use strict';
    var STORAGE_KEY = 'hspcb_tool_collapse';
    var allSections = document.querySelectorAll('#home-section .tools-section, #home-section .quick-access');
    var sections = [];
    allSections.forEach(function(el){ if (el.querySelector('h3')) sections.push(el); });

    // 读取已保存的折叠状态
    function getSavedState(){
        try { return JSON.parse(HSPCBStore.get(STORAGE_KEY)) || {}; }
        catch(e){ return {}; }
    }
    function saveState(state){
        try { HSPCBStore.set(STORAGE_KEY, JSON.stringify(state)); } catch(e){}
    }

    // 根据 h3 文本生成唯一 key
    function getSectionKey(el){
        var h3 = el.querySelector('h3');
        return h3 ? h3.textContent.trim() : (el.className || 'section');
    }

    // 初始化折叠状态
    function initCollapseState(){
        var saved = getSavedState();
        sections.forEach(function(el){
            var key = getSectionKey(el);
            if (saved[key] === true) el.classList.add('collapsed');
        });
    }

    // 绑定点击事件
    function bindToggle(){
        sections.forEach(function(el){
            var h3 = el.querySelector('h3');
            if (!h3) return;
            h3.addEventListener('click', function(){
                el.classList.toggle('collapsed');
                var saved = getSavedState();
                saved[getSectionKey(el)] = el.classList.contains('collapsed');
                saveState(saved);
                updateToggleAllBtn();
            });
        });
    }

    // 全部展开/折叠按钮
    var toggleAllBtn = null;
    function createToggleAllBtn(){
        var homeSection = document.getElementById('home-section');
        if (!homeSection) return;
        var firstH3 = homeSection.querySelector('.quick-access h3, .tools-section h3');
        if (!firstH3) return;
        var firstTools = firstH3.parentElement;

        toggleAllBtn = document.createElement('button');
        toggleAllBtn.className = 'tool-collapse-toggle';
        toggleAllBtn.style.cssText = 'display:block;margin:0 0 12px auto;padding:6px 16px;border:1px solid var(--border-medium,#cbd5e1);border-radius:var(--radius-full,9999px);background:var(--bg-card,#fff);color:var(--text-secondary,#64748b);font-size:13px;cursor:pointer;transition:all .15s;';
        toggleAllBtn.textContent = '全部折叠';
        toggleAllBtn.addEventListener('click', function(){
            var allCollapsed = true;
            sections.forEach(function(el){ if(!el.classList.contains('collapsed')) allCollapsed = false; });
            if (allCollapsed) {
                sections.forEach(function(el){ el.classList.remove('collapsed'); });
            } else {
                sections.forEach(function(el){ el.classList.add('collapsed'); });
            }
            var saved = {};
            sections.forEach(function(el){
                saved[getSectionKey(el)] = el.classList.contains('collapsed');
            });
            saveState(saved);
            updateToggleAllBtn();
        });
        firstTools.parentNode.insertBefore(toggleAllBtn, firstTools);
    }

    function updateToggleAllBtn(){
        if (!toggleAllBtn) return;
        var allCollapsed = true;
        sections.forEach(function(el){ if(!el.classList.contains('collapsed')) allCollapsed = false; });
        toggleAllBtn.textContent = allCollapsed ? '全部展开' : '全部折叠';
    }

    initCollapseState();
    bindToggle();
    createToggleAllBtn();
    updateToggleAllBtn();
})();

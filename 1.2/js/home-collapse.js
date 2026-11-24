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
    // v1.9 信息架构：工具区块**默认折叠** —— 首页首屏只保留金刚区（真题练习/
    // 错题本/今日计划）与六科金刚区共 9 个入口，122 个工具收进「展开全部工具」。
    // 用户手动展开过的分组会被记住（saved[key] === false 表示已展开）。
    function initCollapseState(){
        var saved = getSavedState();
        sections.forEach(function(el){
            var key = getSectionKey(el);
            if (saved[key] !== false) el.classList.add('collapsed');
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
        toggleAllBtn.textContent = '展开全部工具';
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
        toggleAllBtn.textContent = allCollapsed ? '展开全部工具' : '收起全部工具';
        // 全部折叠时连分组标题一并隐藏，首屏只保留 9 个入口（见 css/icons.css）
        var homeSection = document.getElementById('home-section');
        if (homeSection) homeSection.classList.toggle('tools-min', allCollapsed);
    }

    initCollapseState();
    bindToggle();
    createToggleAllBtn();
    updateToggleAllBtn();
})();

// ④ 全局搜索：从界面入口（首页工具卡「全局搜索」）打开，输入「物理」，
//    结果面板渲染出条目。
// 入口链路：tool-card → navigateToolPage('global-search') → globalSearch.open()，
// 搜索框为 #gs-search-input，结果渲染在 #gs-results-container（.gs-result-item）。
import { test, expect } from '@playwright/test';

test('全局搜索「物理」渲染出结果条目', async ({ page }) => {
  await page.goto('/');
  await page.locator('#home-section .tool-card[data-tool="global-search"]').click();

  const input = page.locator('#gs-search-input');
  await expect(input).toBeVisible();
  await input.fill('物理');

  // 结果面板渲染出条目（工具/知识点/真题分组）
  await expect(page.locator('.gs-result-item').first()).toBeVisible();
  await expect(page.locator('#gs-results-container')).toContainText('物理');
  await expect(page.locator('.gs-results-footer')).toContainText('共找到');
});

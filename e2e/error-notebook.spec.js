// ③ 错题本：用 ?demo=1 演示数据后打开错题本页，能看到错题条目。
// demo 链路（js/demo-mode.js）：?demo=1 触发 HSPCBDemo.inject()，
// 向 hspcb_error_notebook 写入五科各 2 道示例错题（共 10 条）。
// 题库按科懒加载（data/exam/*.json）时 autoRun 可能在题目就绪前注入到空池，
// 这里等题库全量就绪后走同一个 HSPCBDemo.inject() 兜底，保证演示数据确定性。
import { test, expect } from '@playwright/test';
import { expandAllTools } from './helpers.js';

test('demo=1 演示数据注入后，错题本展示错题条目', async ({ page }) => {
  await page.goto('/?demo=1');

  await page.evaluate(async () => {
    const hasDemo = () => window.HSPCBDemo && HSPCBDemo.hasDemoData();
    for (let i = 0; i < 20 && !hasDemo(); i++) {
      await new Promise((r) => setTimeout(r, 500));
    }
    if (!hasDemo()) {
      await window.examPracticeSystem.ensureLoaded();
      HSPCBDemo.inject();
    }
  });

  // 从首页工具入口打开错题本
  await expandAllTools(page);
  await page.locator('#home-section .tool-card[data-tool="error-notebook"]').click();
  await expect(page.locator('#error-notebook-section')).toBeVisible();
  await expect(page.locator('#error-notebook-app')).toContainText('错题本');

  // 错题条目渲染（enb-error-card），demo 注入五科各 2 道
  const cards = page.locator('#error-notebook-app .enb-error-card');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThanOrEqual(5);

  // 统计条可见的粗粒度信号
  await expect(page.locator('#enb-stats-bar')).toContainText('总错题数');
  // v1.9 扩容：统计卡数量 + 页签结构 + 学科页签可切换
  expect(await page.locator('.enb-stat-card').count()).toBeGreaterThanOrEqual(2);
  expect(await page.locator('.enb-tabs button').count()).toBeGreaterThanOrEqual(2);
  await expect(page.locator('.enb-error-card .enb-error-question').first()).not.toBeEmpty();
  await expect(page.locator('.enb-error-card .enb-error-answer').first()).toContainText('正确答案');
});

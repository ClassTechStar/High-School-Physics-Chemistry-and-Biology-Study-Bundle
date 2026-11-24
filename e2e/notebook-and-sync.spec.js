// 错题本增删与 SM-2 复习 + 数据快照往返（v1.9 §3.3 / §7.2）
import { test, expect } from '@playwright/test';
import { expandAllTools } from './helpers.js';

test('错题本：标记已掌握 / SM-2 自评 / 删除', async ({ page }) => {
  await page.goto('/?demo=1');

  // 等演示数据落盘（题库懒加载完成后注入）
  await page.evaluate(async () => {
    for (let i = 0; i < 20; i++) {
      if (window.HSPCBDemo && HSPCBDemo.hasDemoData()) return;
      await new Promise((r) => setTimeout(r, 400));
    }
    if (window.examPracticeSystem) await window.examPracticeSystem.ensureLoaded();
    if (window.HSPCBDemo) HSPCBDemo.inject();
  });

  await expandAllTools(page);
  await page.locator('#home-section .tool-card[data-tool="error-notebook"]').click();
  await expect(page.locator('#error-notebook-section')).toBeVisible();

  const cards = page.locator('#error-notebook-app .enb-error-card');
  await expect(cards.first()).toBeVisible();
  const before = await cards.count();
  expect(before).toBeGreaterThanOrEqual(5);

  // SM-2 排期徽标存在（今天应复习 / N 天后复习）
  await expect(page.locator('.enb-badge', { hasText: /今天应复习|天后复习/ }).first()).toBeVisible();

  // 第一张卡：点「记住了」→ 复习次数 +1
  const first = cards.first();
  await expect(first.locator('.enb-error-actions')).toBeVisible();
  const reviewBtn = first.locator('button', { hasText: '记住了' });
  await expect(reviewBtn).toBeVisible();
  await reviewBtn.click();
  await expect(cards.first()).toContainText('重做正确 1 次');

  // 标记已掌握
  const masterBtn = cards.first().locator('button', { hasText: '标记已掌握' });
  if (await masterBtn.count()) {
    await masterBtn.click();
    await expect(page.locator('.enb-badge-mastered').first()).toBeVisible();
  }

  // 删除一条：数量 -1
  page.once('dialog', (d) => d.accept());
  await cards.first().locator('button', { hasText: '删除' }).click();
  await expect(cards).toHaveCount(before - 1);
});

test('数据快照导出→导入往返一致', async ({ page }) => {
  await page.goto('/');

  const result = await page.evaluate(async () => {
    // 等数据同步模块就绪
    for (let i = 0; i < 40 && !window.HSPCBDatasync; i++) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (!window.HSPCBDatasync) return { ok: false, error: 'HSPCBDatasync 未加载' };
    if (!window.HSPCBStore || !HSPCBStore.set) return { ok: false, error: 'HSPCBStore 不可用' };

    HSPCBStore.set('e2e.sync', 'value-1');
    const bundle = HSPCBDatasync.buildBundle();
    const text = JSON.stringify(bundle);

    HSPCBStore.set('e2e.sync', 'value-2');
    const written = HSPCBDatasync.applyBundle(JSON.parse(text), 'merge');

    return {
      ok: written.ok,
      written: written.written,
      restored: HSPCBStore.get('e2e.sync'),
      hasMeta: bundle.app === 'hspcb-datasync' && !!bundle.exportedAt,
      rejectsForeign: HSPCBDatasync.parseBundle(JSON.stringify({ app: 'x', version: 1, store: {} })).ok === false,
    };
  });

  expect(result.ok).toBe(true);
  expect(result.written).toBeGreaterThan(0);
  expect(result.restored).toBe('value-1'); // 往返后回到快照时的值
  expect(result.hasMeta).toBe(true);
  expect(result.rejectsForeign).toBe(true);
});

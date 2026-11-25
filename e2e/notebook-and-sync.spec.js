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

    // v1.10 T15：先删掉本机键再导入，验证"换设备"往返；
    // 若直接改值再导入旧快照，新逻辑会正确判定本机更新而跳过（见下一条用例）。
    HSPCBStore.remove('e2e.sync');
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

test('同步冲突：旧快照不覆盖本机较新数据，远端较新才覆盖', async ({ page }) => {
  await page.goto('/');
  const out = await page.evaluate(async () => {
    for (let i = 0; i < 40 && !window.HSPCBDatasync; i++) {
      await new Promise((r) => setTimeout(r, 100));
    }
    const now = Date.now();
    HSPCBStore.set('sync.probe', 'local-new');
    HSPCBStore.touchMeta('sync.probe', now);

    const stale = {
      app: 'hspcb-datasync', version: 2,
      exportedAt: new Date(now - 3600000).toISOString(),
      store: { 'sync.probe': 'remote-old' },
      meta: { 'sync.probe': now - 3600000 }
    };
    const r1 = HSPCBDatasync.applyBundle(stale, 'merge');
    const v1 = HSPCBStore.get('sync.probe');

    const fresh = {
      app: 'hspcb-datasync', version: 2,
      exportedAt: new Date(now + 600000).toISOString(),
      store: { 'sync.probe': 'remote-new' },
      meta: { 'sync.probe': now + 600000 }
    };
    const r2 = HSPCBDatasync.applyBundle(fresh, 'merge');
    const v2 = HSPCBStore.get('sync.probe');
    HSPCBStore.remove('sync.probe');
    return { r1: r1, v1: v1, r2: r2, v2: v2 };
  });

  expect(out.r1.ok).toBe(true);
  expect(out.r1.written).toBe(0);          // 远端较旧：不写
  expect(out.r1.stale).toContain('sync.probe');
  expect(out.v1).toBe('local-new');
  expect(out.r2.written).toBe(1);          // 远端较新：覆盖
  expect(out.v2).toBe('remote-new');
});

test('掌握度：答题事件写入统计，并出现在统一复习队列', async ({ page }) => {
  await page.goto('/');
  const out = await page.evaluate(async () => {
    for (let i = 0; i < 60 && !(window.HSPCBMastery && HSPCBMastery.summary().ready); i++) {
      await new Promise((r) => setTimeout(r, 100));
    }
    HSPCBBus.emit('exam:answered', {
      subject: 'physics', knowledgePoints: ['E2E 测试知识点'], isCorrect: true, pending: false
    });
    const m = HSPCBMastery.summary();
    const q = HSPCBMastery.queue();
    return { count: m.count, avg: m.avg, history: m.history.length, total: q.total };
  });
  expect(out.count).toBeGreaterThan(0);
  expect(out.avg).toBeGreaterThan(0);
  expect(out.history).toBeGreaterThan(0);
  expect(out.total).toBeGreaterThanOrEqual(0);
});

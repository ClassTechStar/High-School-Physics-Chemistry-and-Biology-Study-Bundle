// v1.10 T20：无障碍基线 —— axe-core 扫描（critical 必须为 0）+ 200% 字体缩放。
// 只锁 critical 级别：存量页面可能存在 serious/moderate 建议项，先记录不阻塞；
// 新代码不得新增 critical。
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expandAllTools } from './helpers.js';

function criticalOnly(violations) {
  return violations.filter((v) => v.impact === 'critical');
}

function format(violations) {
  return violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} 处)`).join('; ');
}

test('首页无 critical 无障碍问题', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#home-section')).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const critical = criticalOnly(results.violations);
  expect(critical, format(critical)).toEqual([]);
});

test('题库页无 critical 无障碍问题', async ({ page }) => {
  await page.goto('/');
  await page.locator('.nav-btn[data-subject="exam"]').click();
  await expect(page.locator('#exam-list .btn-start-exam').first()).toBeVisible({ timeout: 20000 });
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const critical = criticalOnly(results.violations);
  expect(critical, format(critical)).toEqual([]);
});

test('错题本无 critical 无障碍问题', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.waitForFunction(() => window.errorNotebook && window.HSPCBDemo, null, { timeout: 30000 });
  await expandAllTools(page);
  await page.locator('#home-section .tool-card[data-tool="error-notebook"]').click();
  await expect(page.locator('.enb-error-card, .enb-empty, #error-notebook-app').first()).toBeVisible({ timeout: 20000 });
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const critical = criticalOnly(results.violations);
  expect(critical, format(critical)).toEqual([]);
});

test('200% 字体缩放无横向溢出', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#home-section')).toBeVisible();
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await page.waitForTimeout(300);
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
});

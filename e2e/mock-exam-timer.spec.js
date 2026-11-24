// 模拟考试计时器与交卷边界（v1.9 §4.3）
import { test, expect } from '@playwright/test';
import { expandAllTools } from './helpers.js';

test('模拟考试：计时器运行且可交卷出分', async ({ page }) => {
  await page.goto('/');
  await expandAllTools(page);
  await page.locator('#home-section .tool-card[data-tool="mock-exam"]').click();
  await expect(page.locator('.mock-exam-subject-grid')).toBeVisible();

  await page.locator('.mock-exam-subject-card[data-mock-subject="biology"] .mock-exam-start-btn').click();

  // 计时器格式「⏱ H:MM:SS」或「⏱ MM:SS」，且会随时间变化
  const timer = page.locator('#mock-exam-timer');
  await expect(timer).toBeVisible();
  await expect(timer).toHaveText(/^(⏱\s*)?\d{1,2}:\d{2}(:\d{2})?$/);
  const t0 = await timer.textContent();
  await page.waitForTimeout(1500);
  const t1 = await timer.textContent();
  expect(t1).not.toBe(t0);

  // 试卷有题目，交卷按钮可用
  await expect(page.locator('#mock-exam-questions .mock-exam-question-card').first()).toBeVisible();
  const submit = page.locator('#mock-exam-submit');
  await expect(submit).toBeVisible();
  await expect(submit).toBeEnabled();

  // 交卷 → 出现结果页（允许确认弹窗）
  page.once('dialog', (d) => d.accept());
  await submit.click();
  await expect(page.locator('#mock-exam-app')).toContainText(/得分|总分|成绩|分/, { timeout: 15000 });
});

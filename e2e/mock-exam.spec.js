// ⑤ 模拟考试：进模拟考试选一个科目开始，试卷页面渲染出题目。
// 入口链路：tool-card → navigateToolPage('mock-exam') → mockExam.render() → 选科卡片；
// 点「开始考试」→ mockExam.startExam(subject)（题库按科懒加载，未就绪会补载后组卷）。
// v1.9 修复：选科卡原用 data-subject，会被全局导航委托当成「切学科」而把视图切走，
// 这正是旧用例需要 force 点击的根因。改为 data-mock-subject 后，点击是普通可点元素，
// 无需 force —— 断言改为「元素真的可见可点」。
import { test, expect } from '@playwright/test';
import { expandAllTools } from './helpers.js';

test('模拟考试选物理开考，试卷页渲染出题目', async ({ page }) => {
  await page.goto('/');
  await expandAllTools(page);
  await page.locator('#home-section .tool-card[data-tool="mock-exam"]').click();

  // 选科界面（五科可选）
  await expect(page.locator('.mock-exam-subject-grid')).toBeVisible();
  await expect(page.locator('.mock-exam-subject-card')).toHaveCount(5);

  // 选物理开考（普通点击：不再有全局导航委托抢事件）
  await page
    .locator('.mock-exam-subject-card[data-mock-subject="physics"] .mock-exam-start-btn')
    .click();

  // 试卷页渲染出题目（第 N 题题卡）
  const firstQuestion = page.locator('#mock-exam-questions .mock-exam-question-card').first();
  await expect(firstQuestion).toContainText('第1题');
  // v1.9 扩容：题量按卷面结构组出多题、选项成组出现
  expect(await page.locator('#mock-exam-questions .mock-exam-question-card').count()).toBeGreaterThanOrEqual(5);

  // 试卷保持可见（改造前此处会被导航切走）
  await expect(page.locator('#mock-exam-section')).toBeVisible();
  await expect(page.locator('.mock-exam-topbar')).toContainText('物理 全真模拟考试');
  await expect(page.locator('#mock-exam-timer')).toBeVisible();
  await expect(page.locator('#mock-exam-submit')).toBeVisible();
  await expect(page.locator('#mock-exam-submit')).toBeEnabled();
});

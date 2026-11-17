// ⑤ 模拟考试：进模拟考试选一个科目开始，试卷页面渲染出题目。
// 入口链路：tool-card → navigateToolPage('mock-exam') → mockExam.render() → 选科卡片；
// 点「开始考试」→ mockExam.startExam(subject)（题库按科懒加载，未就绪会补载后组卷）。
// 注意：选科卡带 data-subject 属性，点击会连带触发首页导航委托把视图切到对应学科页
//（应用既有行为），因此开考后从首页重新进入「全真模拟考试」把进行中的试卷带回视图，
// mockExam.render() 对进行中的考试会重绘试卷页，断言即可用可见文本。
import { test, expect } from '@playwright/test';

test('模拟考试选物理开考，试卷页渲染出题目', async ({ page }) => {
  await page.goto('/');
  await page.locator('#home-section .tool-card[data-tool="mock-exam"]').click();

  // 选科界面（五科可选）
  await expect(page.locator('.mock-exam-subject-grid')).toBeVisible();
  await expect(page.locator('.mock-exam-subject-card')).toHaveCount(5);

  // 选物理开考
  await page
    .locator('.mock-exam-subject-card[data-subject="physics"] .mock-exam-start-btn')
    .click({ force: true });

  // 试卷页渲染出题目（第 N 题题卡）
  const firstQuestion = page.locator('#mock-exam-questions .mock-exam-question-card').first();
  await expect(firstQuestion).toContainText('第1题');

  // 回到首页重新进入「全真模拟考试」，把进行中的试卷带回视图
  await page.locator('.nav-btn[data-subject="home"]').click();
  await page.locator('#home-section .tool-card[data-tool="mock-exam"]').click();

  await expect(page.locator('.mock-exam-topbar')).toContainText('物理 全真模拟考试');
  await expect(page.locator('#mock-exam-timer')).toBeVisible();
  await expect(firstQuestion).toBeVisible();
  await expect(page.locator('#mock-exam-submit')).toBeVisible();
});

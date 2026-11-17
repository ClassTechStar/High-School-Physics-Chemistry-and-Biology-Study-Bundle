// ② 题库筛选与判分：进「高考真题练习」，题目列表渲染出「开始答题」，
//    按学科筛选后打开一道选择题，选 A 提交答案，出现结果框（对/错均可）。
// 注：点击「开始答题」后应用会立即切换视图（列表隐藏、详情占位到同一坐标），
//    Playwright 的点击命中重检会误判为「被拦截」并重试到超时，但事件其实已派发。
//    这里用 force 跳过命中重检（事件仍为真实鼠标事件），并在其后断言详情确实渲染。
import { test, expect } from '@playwright/test';

test('题库筛选后开题作答，提交出现结果框', async ({ page }) => {
  await page.goto('/');
  await page.locator('.nav-btn[data-subject="exam"]').click();

  // 高考真题练习系统面板 + 题目列表渲染出「开始答题」
  await expect(page.locator('#exam-content')).toContainText('高考真题练习系统');
  await expect(page.locator('#exam-list .btn-start-exam').first()).toBeVisible();

  // 筛选：只看物理
  await page.locator('#exam-subject-filter').selectOption('physics');
  await expect(page.locator('#exam-list .exam-subject-tag.physics').first()).toBeVisible();

  // 从列表里找一道选择题（有 A-D 选项）打开；题库按科懒加载，必要时退回列表试下一题
  let opened = false;
  for (let i = 0; i < 3 && !opened; i++) {
    await page.locator('#exam-list .btn-start-exam').nth(i).click({ force: true });
    await expect(page.locator('#exam-detail')).toBeVisible();
    opened = (await page.locator('input[name="exam-answer"]').count()) > 0;
    if (!opened) await page.locator('.btn-back-list').click();
  }
  expect(opened, '列表前 3 题中应有选择题可作答').toBe(true);

  // 选 A 并提交，出现结果框（回答正确/错误均可）
  await page.locator('label.option-label[data-option="A"]').click();
  await expect(page.locator('input[name="exam-answer"][value="A"]')).toBeChecked();
  await page.locator('.btn-submit-answer').click();

  const resultBox = page.locator('#result-box');
  await expect(resultBox).toBeVisible();
  await expect(resultBox).toContainText(/回答正确|回答错误/);
});

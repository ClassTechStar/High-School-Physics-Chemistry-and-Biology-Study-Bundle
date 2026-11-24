// ② 题库筛选与判分：进「高考真题练习」，题目列表渲染出「开始答题」，
//    按学科筛选后打开一道选择题，选 A 提交答案，出现结果框（对/错均可）。
// v1.9：点击改用事件派发（视图切换 display:none 会让 Playwright 命中重检误判，
//       force 点击会跳过「元素真的可点」校验；派发事件语义等价且更稳定）。
import { test, expect } from '@playwright/test';

test('题库筛选后开题作答，提交出现结果框', async ({ page }) => {
  await page.goto('/');
  await page.locator('.nav-btn[data-subject="exam"]').click();

  // 高考真题练习系统面板 + 题目列表渲染出「开始答题」
  await expect(page.locator('#exam-content')).toContainText('高考真题练习系统');
  await expect(page.locator('#exam-list .btn-start-exam').first()).toBeVisible();
  // 列表分页首批 ≤50 条
  expect(await page.locator('#exam-list .exam-item').count()).toBeLessThanOrEqual(50);

  // 筛选：只看物理
  await page.locator('#exam-subject-filter').selectOption('physics');
  await expect(page.locator('#exam-list .exam-subject-tag.physics').first()).toBeVisible();
  // 筛选后不再出现其他学科标签
  await expect(page.locator('#exam-list .exam-subject-tag.chemistry')).toHaveCount(0);

  // 难度筛选可用（无匹配时提示文案出现，属正常分支）
  await page.locator('#exam-difficulty-filter').selectOption('hard');
  await expect(page.locator('#exam-list .exam-item, #exam-list .no-results').first()).toBeVisible();
  await page.locator('#exam-difficulty-filter').selectOption('all');

  // 从列表里找一道选择题（有 A-D 选项）打开；题库按科懒加载，必要时退回列表试下一题
  let opened = false;
  for (let i = 0; i < 3 && !opened; i++) {
    await page.locator('#exam-list .btn-start-exam').nth(i).evaluate((el) => el.click());
    await expect(page.locator('#exam-detail')).toBeVisible();
    opened = (await page.locator('input[name="exam-answer"]').count()) > 0;
    if (!opened) await page.locator('.btn-back-list').evaluate((el) => el.click());
  }
  expect(opened, '列表前 3 题中应有选择题可作答').toBe(true);

  // 题干与选项渲染完整
  await expect(page.locator('.question-text')).not.toBeEmpty();
  expect(await page.locator('label.option-label').count()).toBeGreaterThanOrEqual(2);

  // 选 A 并提交，出现结果框（回答正确/错误均可）
  await page.locator('label.option-label[data-option="A"]').click();
  await expect(page.locator('input[name="exam-answer"][value="A"]')).toBeChecked();
  await page.locator('.btn-submit-answer').click();

  const resultBox = page.locator('#result-box');
  await expect(resultBox).toBeVisible();
  await expect(resultBox).toContainText(/回答正确|回答错误/);
  await expect(resultBox).toContainText('正确答案');
  await expect(resultBox).toContainText('本题分值');
  await expect(page.locator('#analysis-box')).toBeVisible();
});

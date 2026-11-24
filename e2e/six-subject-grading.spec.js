// 六科判分全覆盖（v1.9 §4.3 / §7.2：e2e 从 27 断言扩到 100+）
// 对物理/化学/生物/数学/语文/英语各抽一题，按题型分流：
//   · 有选项 → 选 A 提交 → 结果框出现「正确答案」
//   · 无选项（主观题）→ 填一句作答提交 → 出现「对照参考答案后自评」
import { test, expect } from '@playwright/test';

const SUBJECTS = [
  ['physics', '物理'],
  ['chemistry', '化学'],
  ['biology', '生物'],
  ['math', '数学'],
  ['chinese', '语文'],
  ['english', '英语'],
];

for (const [key, cn] of SUBJECTS) {
  test(`题库判分链路可用：${cn}`, async ({ page }) => {
    await page.goto('/');

    // 从金刚区进真题练习（首屏高频入口）
    await page.locator('.primary-entry[data-subject="exam"]').click();
    await expect(page.locator('#exam-content')).toContainText('高考真题练习');

    // 按学科筛选（懒加载：选了哪科拉哪科）
    const filter = page.locator('#exam-subject-filter');
    await expect(filter).toBeVisible();
    await filter.selectOption(key);

    const firstItem = page.locator('#exam-list .exam-item').first();
    await expect(firstItem).toBeVisible();
    await expect(firstItem.locator('.exam-subject-tag')).toHaveText(cn);

    // 打开题目：视图切换用 display:none，物理点击会被 Playwright 的命中检测
    // 误判为「被详情层遮挡」。按审计建议改为派发事件（语义等价、无命中重检）。
    await firstItem.locator('.btn-start-exam').evaluate((el) => el.click());
    await expect(page.locator('#exam-detail')).toBeVisible();
    await expect(page.locator('.question-text')).not.toBeEmpty();

    const optionInputs = page.locator('.options-box .option-label input[type="radio"]');
    const optionCount = await optionInputs.count();

    if (optionCount > 0) {
      // 选择题：选项数量 2-8，选 A 提交
      expect(optionCount).toBeGreaterThanOrEqual(2);
      await page.locator('.option-label[data-option="A"]').click();
      // 未提交时只有 radio 选中态（.selected 类要到判分后才加）
      await expect(page.locator('.option-label[data-option="A"] input')).toBeChecked();
      await page.locator('.btn-submit-answer').click();
      await expect(page.locator('#result-box')).toBeVisible();
      await expect(page.locator('#result-box')).toContainText('正确答案');
      await expect(page.locator('#analysis-box')).toBeVisible();
    } else {
      // 主观题：填入作答 → 提交 → 自评按钮
      await page.locator('#exam-subjective-input').fill('测试作答内容');
      await page.locator('.btn-submit-answer').click();
      await expect(page.locator('.self-judge')).toBeVisible();
      await expect(page.locator('#result-box')).toContainText('参考答案');
    }

    // 返回列表可用（同样用事件派发，避开 display:none 视图切换的命中重检）
    await page.locator('.btn-back-list').evaluate((el) => el.click());
    await expect(page.locator('#exam-list')).toBeVisible();
  });
}

// ① 六科切换：首页导航在物理/化学/生物/数学/语文/英语之间切换，
//    每科对应内容区可见（粗粒度断言：区块可见 + 稳定标题文本 + 导航 active 态）
import { test, expect } from '@playwright/test';

const SUBJECTS = [
  { key: 'physics', marker: '物理专项工具' },
  { key: 'chemistry', marker: '化学专项工具' },
  { key: 'biology', marker: '生物专项工具' },
  { key: 'math', marker: '高中数学知识体系' },
  { key: 'chinese', marker: '广东新高考I卷' },
  { key: 'english', marker: '英语专项工具' },
];

test('六科导航切换，各科内容区依次可见', async ({ page }) => {
  await page.goto('/');

  for (const { key, marker } of SUBJECTS) {
    await page.locator(`.nav-btn[data-subject="${key}"]`).click();

    const section = page.locator(`#${key}-section`);
    await expect(section).toBeVisible();
    await expect(section).toContainText(marker);
    await expect(page.locator(`.nav-btn[data-subject="${key}"]`)).toHaveClass(/active/);
  }
});

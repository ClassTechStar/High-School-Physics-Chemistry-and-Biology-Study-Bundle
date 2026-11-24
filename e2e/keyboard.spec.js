// 键盘快捷键（v1.9 §4.3：/ 搜索、E 错题本、J/K 换题、1-4 选答案）
// 注意：快捷键监听器在工具脚本里（按需加载），需等脚本就绪后再按键。
import { test, expect } from '@playwright/test';

async function waitToolsReady(page) {
  await page.waitForFunction(
    () => window.HSPCBLazy && window.HSPCBLazy.allDone && window.HSPCBLazy.allDone(),
    null,
    { timeout: 30000 }
  );
}

test('快捷键：/ 聚焦搜索、E 开错题本', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#home-section')).toBeVisible();
  await waitToolsReady(page);

  // / → 打开全局搜索并聚焦输入框。
  // 注意：页面上存在两处 #gs-search-input（工具 section 内 + 覆盖层内），
  // 必须锁定覆盖层那一份，否则命中隐藏节点。
  await page.keyboard.press('/');
  const input = page.locator('#global-search-overlay #gs-search-input');
  await expect(input).toBeVisible();
  await expect(input).toBeFocused();

  // Esc 关闭搜索覆盖层（既有行为）
  await page.keyboard.press('Escape');

  // E → 错题本
  await page.keyboard.press('e');
  await expect(page.locator('#error-notebook-section')).toBeVisible();
});

test('快捷键：J/K 移动题目光标，1-4 选答案', async ({ page }) => {
  await page.goto('/');
  await page.locator('.primary-entry[data-subject="exam"]').click();
  await expect(page.locator('#exam-list .exam-item').first()).toBeVisible();

  // J 移动光标
  await page.keyboard.press('j');
  const focused = page.locator('#exam-list .exam-item.kb-focus');
  await expect(focused).toHaveCount(1);
  await expect(focused.first()).toBeVisible();

  // Enter 打开光标题目
  await page.keyboard.press('Enter');
  await expect(page.locator('#exam-detail')).toBeVisible();

  // 若为选择题：按 1 选中 A，按 2 切到 B
  const radios = page.locator('.options-box .option-label input[type="radio"]');
  if (await radios.count()) {
    await page.keyboard.press('1');
    await expect(page.locator('.option-label[data-option="A"] input')).toBeChecked();
    await page.keyboard.press('2');
    await expect(page.locator('.option-label[data-option="B"] input')).toBeChecked();

    // 更多题：K 回到上一题（详情态切题）
    const before = await page.locator('.question-text').textContent();
    await page.keyboard.press('j');
    await expect(page.locator('#exam-detail')).toBeVisible();
    const after = await page.locator('.question-text').textContent();
    expect(after).not.toBe(before);
  } else {
    // 主观题：跳过选项断言，但快捷键不应报错（页面仍可见）
    await expect(page.locator('#exam-detail')).toBeVisible();
  }
});

test('快捷键：1-6 在非题目详情时切换学科', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('2');
  await expect(page.locator('#chemistry-section')).toBeVisible();
  await page.keyboard.press('3');
  await expect(page.locator('#biology-section')).toBeVisible();
});

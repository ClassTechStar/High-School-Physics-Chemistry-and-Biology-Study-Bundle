// e2e 公共流程（v1.9）
// 首页信息架构改造后，122 个工具默认收进「展开全部工具」，首屏只留 9 个入口。
// 需要点工具卡的用例先展开（幂等：已展开时按钮文案为「收起全部工具」，直接跳过）。
import { expect } from '@playwright/test';

export async function expandAllTools(page) {
  const expand = page.locator('.tool-collapse-toggle', { hasText: '展开全部工具' });
  if (await expand.count()) {
    await expand.first().click();
    await expect(page.locator('#home-section')).not.toHaveClass(/tools-min/);
  }
}

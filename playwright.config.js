// Playwright E2E 配置（package.json 为 type=module，本文件使用 ESM 语法）
// webServer 复用 scripts/serve.mjs（零依赖 Node 静态服务），端口 4180 与开发用 8000 错开。
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  // 单机/CI 均以稳定优先：串行跑核心主路径，失败重跑 2 次吸收偶发抖动
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4180',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'node scripts/serve.mjs 4180 1.2',
    url: 'http://localhost:4180/index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});

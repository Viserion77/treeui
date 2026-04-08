import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PW_BASE_URL ?? 'http://127.0.0.1:6006';
const shouldSkipBuild = Boolean(process.env.PW_SKIP_BUILD);

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  webServer: process.env.PW_BASE_URL
    ? undefined
    : {
        command: shouldSkipBuild ? 'pnpm docs:serve:ci' : 'pnpm docs:build && pnpm docs:serve:ci',
        port: 6006,
        reuseExistingServer: !process.env.CI,
        timeout: 600_000,
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

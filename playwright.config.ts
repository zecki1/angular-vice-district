import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright — configuração de testes E2E (pt-BR)
 * Roda na CI e localmente. O app é servido via `ng serve`.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['html', { open: 'never', outputFolder: 'playwright-report' }], ['list']]
    : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'pt-BR',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm start',
        url: 'http://localhost:4200',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
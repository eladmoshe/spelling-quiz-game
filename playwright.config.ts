import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60000, // Increase overall test timeout to 60 seconds
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    navigationTimeout: 30000, // Increase navigation timeout
    actionTimeout: 15000, // Increase action timeout
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']

      },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:8080',
    timeout: 120000, // Increase web server startup timeout to 2 minutes
    reuseExistingServer: !process.env.CI,
  },
});

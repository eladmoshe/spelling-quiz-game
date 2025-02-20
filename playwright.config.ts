import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 15000, // Reduced from 60000 to 15 seconds
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    navigationTimeout: 10000, // Reduced from 30000 to 10 seconds
    actionTimeout: 5000, // Reduced from 15000 to 5 seconds
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
    timeout: 30000, // Reduced from 120000 to 30 seconds
    reuseExistingServer: !process.env.CI,
  },
});

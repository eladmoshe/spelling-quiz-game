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
    baseURL: 'http://localhost:4173',
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
  // We're not using the webServer option since we're managing the server manually in our script
  // webServer: {
  //   command: 'npm run build && npm run start',
  //   url: 'http://localhost:4173',
  //   timeout: 60000,
  //   reuseExistingServer: !process.env.CI,
  // },
});

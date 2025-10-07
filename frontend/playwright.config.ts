import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration for Choseby Customer Response Platform
 * Tests all features: auth, decision workflow, team management, analytics
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Maximum time one test can run
  timeout: 60 * 1000,

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  // Shared settings for all tests
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Maximum time for navigation
    navigationTimeout: 30 * 1000,

    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },

  // Configure projects for multiple browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});

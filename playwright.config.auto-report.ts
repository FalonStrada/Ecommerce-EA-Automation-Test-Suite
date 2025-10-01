import { defineConfig, devices } from '@playwright/test';
import { getEnvironment } from './config/environments';

const env = getEnvironment();

export default defineConfig({
  testDir: './tests',
  retries: env.retries,
  timeout: env.timeout,
  expect: {
    timeout: 5_000,
  },
  use: {
    headless: true,
    baseURL: env.baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Auto-open report configuration
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'always' // Always opens report automatically
    }],
    ['list'],
    ['./config/reporter.ts', { open: true }] // Custom reporter for auto-open
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'dom.popup_maximum': 0,
            'dom.disable_open_during_load': true,
            'privacy.popups.showBrowserMessage': false,
            'dom.popup_allowed_events': '',
            'network.cookie.cookieBehavior': 1,
            'privacy.trackingprotection.enabled': true,
            'privacy.trackingprotection.socialtracking.enabled': true,
            'dom.webnotifications.enabled': false,
            'dom.push.enabled': false,
          }
        }
      },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});

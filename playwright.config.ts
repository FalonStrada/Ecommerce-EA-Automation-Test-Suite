import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Keep runs short while debugging
  retries: 0,
  timeout: 20_000, // per-test timeout
  expect: {
    timeout: 5_000,
  },
  use: {
    headless: true, // headed runs can be enabled via CLI when needed
    baseURL: 'https://www.automationexercise.com',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
});

import { defineConfig, devices } from '@playwright/test';
import { getEnvironment } from './config/environments';

const env = getEnvironment();

export default defineConfig({
  testDir: './tests',
  retries: process.env.CI ? 1 : env.retries,
  timeout: process.env.CI ? 60_000 : env.timeout, // Aumentar timeout en CI
  expect: {
    timeout: process.env.CI ? 10_000 : 5_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  use: {
    headless: !!process.env.CI, // Headless en CI, headed localmente
    baseURL: env.baseURL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    // Capturas de pantalla y videos
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    trace: 'on-first-retry',
    // Configuración adicional para CI
    launchOptions: {
      slowMo: process.env.CI ? 100 : 0,
    },
    // Configuración específica para CI
    ...(process.env.CI ? {
      screenshot: 'on',
      video: 'on',
      trace: 'on'
    } : {}),
  // Report configuration
  reporter: [
    // Standard Playwright HTML report
    ['html', { 
      outputFolder: 'test-results/html',
      open: 'on-failure' // Solo abre si hay fallos
    }],
    // Console output
    ['list'],
    // Allure report (simplified)
    ['allure-playwright', {
      detail: true,
      outputFolder: 'test-results/allure',
      suiteTitle: false,
      environmentInfo: {
        NODE_VERSION: process.version,
        OS: process.platform,
      },
      // Configuración para limpieza y organización
      cleanResults: true,
      // Forzar a que todo vaya a la misma carpeta
      testMode: true,
      // No generar archivos adicionales
      addConsoleLogs: false,
      addAttachments: false
    }],
    // JSON report for CI/CD integration
    ['json', { 
      outputFile: 'test-results/results.json' 
    }]
  ],
  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Optimized Chromium configuration for practice projects
        launchOptions: {
          args: [
            '--block-new-web-contents',
            '--disable-popup-blocking=false',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-iframes-during-prerender',
            '--disable-background-networking',
            '--no-default-browser-check',
            '--disable-extensions-except',
            '--disable-plugins-discovery',
            '--disable-preconnect',
            '--disable-sync',
            '--no-first-run',
            '--disable-default-apps',
            '--block-new-web-contents'
          ]
        },
        // Additional Chromium security settings
        contextOptions: {
          permissions: [], // No permissions by default
        }
      },
    },
    // Firefox disabled for practice projects due to ad interference
    // Uncomment if needed for comprehensive browser testing
    // {
    //   name: 'firefox',
    //   use: { 
    //     ...devices['Desktop Firefox'],
    //     launchOptions: {
    //       firefoxUserPrefs: {
    //         'dom.popup_maximum': 0,
    //         'dom.disable_open_during_load': true,
    //         'privacy.trackingprotection.enabled': true,
    //       }
    //     }
    //   },
    // },
    // WebKit disabled due to ad interference issues
    // Uncomment if needed for specific testing scenarios
    // {
    //   name: 'webkit',
    //   use: { 
    //     ...devices['Desktop Safari'],
    //     launchOptions: {
    //       args: ['--disable-web-security']
    //     }
    //   },
    // },
  ],
});

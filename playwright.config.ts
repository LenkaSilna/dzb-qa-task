import { defineConfig, devices } from '@playwright/test';
import type { ProjectOptions } from './tests/fixtures';

export default defineConfig<ProjectOptions>({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60000,
  reporter: 'html',
  use: {
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    trace: 'on-first-retry',
    locale: 'cs-CZ',
    timezoneId: 'Europe/Prague',
  },
  projects: [
    {
      name: 'cz',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://wa-fe-dzb-cz-preprod.azurewebsites.net',
        projectVariant: 'cz',
        projectPaymentMethods: [
          'edenred-benefit-card',
          'edenred-cafeteria',
          'pluxee-benefit-card',
          'up-benefit-card',
          'payment-card',
          'bank-transfer',
        ],
      },
    },
    {
      name: 'whitelabel',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://wa-fe-dzb-pluxee-cz-preprod.azurewebsites.net',
        projectVariant: 'whitelabel',
        projectPaymentMethods: ['pluxee-benefit-card', 'payment-card', 'bank-transfer'],
      },
    },
  ],
});

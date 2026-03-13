import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
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
      },
    },
    {
      name: 'pl',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://wa-fe-dzb-pl-preprod.azurewebsites.net',
        locale: 'pl-PL',
      },
    },
    {
      name: 'whitelabel',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://wa-fe-dzb-pluxee-cz-preprod.azurewebsites.net',
      },
    },
  ],
});

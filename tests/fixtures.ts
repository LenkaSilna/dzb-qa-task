import { test as base } from '@playwright/test';
import { VoucherPage, type VoucherProjectName } from './pages/VoucherPage';
import { type PaymentMethodType, PAYMENT_METHODS } from './lib/paymentMethods';

/**
 * Project-level options passed via playwright.config.ts `use`.
 * Adding a new variant = add a project in config with its paymentMethods array.
 */
export type ProjectOptions = {
  projectVariant: VoucherProjectName;
  projectPaymentMethods: PaymentMethodType[];
};

type Fixtures = {
  voucherPage: VoucherPage;
  paymentMethods: { key: PaymentMethodType; name: string }[];
};

export const test = base.extend<Fixtures & ProjectOptions>({
  projectVariant: ['cz', { option: true }],
  projectPaymentMethods: [[], { option: true }],

  voucherPage: async ({ page, projectVariant }, use) => {
    if (!projectVariant) {
      throw new Error('projectVariant must be set in playwright.config.ts project use options');
    }
    await use(new VoucherPage(page, projectVariant));
  },

  paymentMethods: async ({ projectPaymentMethods }, use) => {
    const resolved = projectPaymentMethods.map((key) => ({
      key,
      name: PAYMENT_METHODS[key].name,
    }));
    await use(resolved);
  },
});

export { expect } from '@playwright/test';

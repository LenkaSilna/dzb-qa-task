import { test as base } from '@playwright/test';
import { VoucherPage, type VoucherProjectName } from './pages/VoucherPage';
import { OrderStatusPage } from './pages/OrderStatusPage';
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
  orderStatusPage: OrderStatusPage;
  paymentMethods: { key: PaymentMethodType; name: string }[];
};

export const test = base.extend<Fixtures & ProjectOptions>({
  // Defaults are intentionally invalid — every project must set these in playwright.config.ts.
  // Playwright requires a default value for options, so we use empty string / empty array
  // and validate in fixtures below.
  projectVariant: ['' as VoucherProjectName, { option: true }],
  projectPaymentMethods: [[] as PaymentMethodType[], { option: true }],

  voucherPage: async ({ page, projectVariant }, use) => {
    if (!projectVariant) {
      throw new Error('projectVariant must be set in playwright.config.ts project use options');
    }
    await use(new VoucherPage(page, projectVariant));
  },

  orderStatusPage: async ({ page, projectVariant }, use) => {
    if (!projectVariant) {
      throw new Error('projectVariant must be set in playwright.config.ts project use options');
    }
    await use(new OrderStatusPage(page, projectVariant));
  },

  paymentMethods: async ({ projectPaymentMethods }, use) => {
    if (!projectPaymentMethods?.length) {
      throw new Error(
        'projectPaymentMethods must be set in playwright.config.ts project use options'
      );
    }
    const resolved = projectPaymentMethods.map((key) => ({
      key,
      name: PAYMENT_METHODS[key].name,
    }));
    await use(resolved);
  },
});

export { expect } from '@playwright/test';

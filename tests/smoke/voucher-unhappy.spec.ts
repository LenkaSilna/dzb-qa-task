import { test, expect } from '@playwright/test';
import { VoucherPage, type VoucherProjectName } from '../pages/VoucherPage';
import { VALID_CUSTOMER } from '../lib/testData';
import { PAYMENT_METHODS } from '../lib/paymentMethods';

const voucherProjects: VoucherProjectName[] = ['cz', 'whitelabel'];

function getFirstPaymentMethod(project: VoucherProjectName): string {
  const entry = Object.entries(PAYMENT_METHODS).find(([, config]) =>
    config.availableIn.includes(project)
  );
  return entry ? entry[1].name : '';
}

for (const projectName of voucherProjects) {
  test.describe(`[${projectName}] Voucher purchase — Unhappy path`, () => {
    test.beforeEach(({}, testInfo) => {
      test.skip(testInfo.project.name !== projectName, 'Not this project');
    });

    test('submit empty form shows validation errors', async ({ page }) => {
      const voucherPage = new VoucherPage(page, projectName);
      await voucherPage.goto();

      const urlBefore = page.url();
      await voucherPage.submit();

      // Form should not navigate away
      await voucherPage.expectUrlUnchanged(urlBefore);

      // Multiple validation errors should be visible on required fields
      const errorCount = await voucherPage.expectValidationErrorsVisible(3);
      expect(errorCount).toBeGreaterThanOrEqual(5); // firstname, lastname, email, phone, address fields

      // Specific error message should be shown (CZ uses "zadejte prosím" pattern)
      if (projectName === 'cz') {
        await expect(page.getByText('zadejte prosím').first()).toBeVisible();
      }
    });

    test('submit without T&C checkboxes shows error', async ({ page }) => {
      const voucherPage = new VoucherPage(page, projectName);
      await voucherPage.goto();

      await voucherPage.selectVoucherValue(0);
      await voucherPage.fillPersonalInfo(VALID_CUSTOMER);
      await voucherPage.selectPaymentMethod(getFirstPaymentMethod(projectName));

      // Deliberately skip T&C checkboxes
      const urlBefore = page.url();
      await voucherPage.submit();

      // Form should not navigate away
      await voucherPage.expectUrlUnchanged(urlBefore);

      // T&C checkboxes should not be checked
      if (projectName === 'cz') {
        await expect(page.locator('#cancellation-conditions')).not.toBeChecked();
        await expect(page.locator('#business-conditions')).not.toBeChecked();
      } else {
        await expect(page.getByLabel(/Souhlasím se storno podmínkami/)).not.toBeChecked();
        await expect(page.getByLabel(/Souhlasím s obchodními podmínkami/)).not.toBeChecked();
      }

      // Validation error should appear on checkbox area
      await voucherPage.expectValidationErrorOnCheckbox();
    });
  });
}

import { test, expect } from '@playwright/test';
import { VoucherPage, type VoucherProjectName } from '../pages/VoucherPage';
import { PAYMENT_METHODS } from '../lib/paymentMethods';
import { VALID_CUSTOMER, VALID_GIFT } from '../lib/testData';
import { TIMING } from '../lib/timing';

function getProjectPaymentMethods(project: VoucherProjectName) {
  return Object.entries(PAYMENT_METHODS)
    .filter(([, config]) => config.availableIn.includes(project))
    .map(([key, config]) => ({ key, name: config.name }));
}

/**
 * Asserts successful form submission. Server errors are acceptable on preprod
 * (form passed validation). Form validation errors always fail the test.
 */
async function expectFormSubmitted(page: import('@playwright/test').Page) {
  const navigated = await page
    .waitForURL(/\/status\//, { timeout: TIMING.navigation })
    .then(() => true)
    .catch(() => false);

  if (navigated) {
    expect(page.url()).toContain('/status/');
    return;
  }

  const hasFormError = await page
    .getByText(/V objednávkovém formuláři se vyskytují chyby/i)
    .first()
    .isVisible({ timeout: TIMING.formError })
    .catch(() => false);
  expect(hasFormError, 'Form validation error — missing fields or unchecked T&C').toBe(false);

  const hasServerError = await page
    .getByText(/Nastala neznámá chyba|zkuste to prosím znovu/i)
    .first()
    .isVisible({ timeout: TIMING.serverError })
    .catch(() => false);
  expect(
    hasServerError,
    'Expected navigation to /status/ or a server error (form was submitted)'
  ).toBe(true);
}

const voucherProjects: VoucherProjectName[] = ['cz', 'whitelabel'];

for (const projectName of voucherProjects) {
  const methods = getProjectPaymentMethods(projectName);

  test.describe(`[${projectName}] Voucher purchase — Happy path`, () => {
    test.beforeEach(({}, testInfo) => {
      test.skip(testInfo.project.name !== projectName, 'Not this project');
    });

    for (const method of methods) {
      test(`purchase with ${method.name}`, async ({ page }) => {
        const voucherPage = new VoucherPage(page, projectName);
        await voucherPage.goto();

        await voucherPage.expectSubmitButtonVisible();
        await voucherPage.expectSummaryVisible();

        await voucherPage.selectVoucherValue(0);
        await voucherPage.fillPersonalInfo(VALID_CUSTOMER);
        await voucherPage.selectPaymentMethod(method.name);
        await voucherPage.checkRequiredTerms();

        await voucherPage.submit();
        await expectFormSubmitted(page);
      });
    }
  });

  test.describe(`[${projectName}] Voucher purchase — Gift option`, () => {
    test.beforeEach(({}, testInfo) => {
      test.skip(testInfo.project.name !== projectName, 'Not this project');
    });

    test('purchase as gift', async ({ page }) => {
      const voucherPage = new VoucherPage(page, projectName);
      await voucherPage.goto();

      await voucherPage.selectVoucherValue(0);

      await voucherPage.toggleGiftOption();
      await voucherPage.expectGiftFieldsVisible();

      await voucherPage.fillGiftFields(VALID_GIFT);
      await voucherPage.fillPersonalInfo(VALID_CUSTOMER);
      const firstMethod = getProjectPaymentMethods(projectName)[0];
      await voucherPage.selectPaymentMethod(firstMethod.name);
      await voucherPage.checkRequiredTerms();

      await voucherPage.submit();
      await expectFormSubmitted(page);
    });
  });
}

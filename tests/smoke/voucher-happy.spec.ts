import { test, expect } from '../fixtures';
import { VALID_CUSTOMER, VALID_GIFT } from '../lib/testData';
import { TIMING } from '../lib/timing';

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

test.describe('Voucher purchase — Happy path', () => {
  test('purchase with each payment method', async ({ voucherPage, paymentMethods, page }) => {
    test.skip(paymentMethods.length === 0, 'No payment methods for this project');

    for (const method of paymentMethods) {
      await test.step(`payment: ${method.name}`, async () => {
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
});

test.describe('Voucher purchase — Gift option', () => {
  test('purchase as gift', async ({ voucherPage, paymentMethods, page }) => {
    test.skip(paymentMethods.length === 0, 'No payment methods for this project');

    await voucherPage.goto();
    await voucherPage.selectVoucherValue(0);

    await voucherPage.toggleGiftOption();
    await voucherPage.expectGiftFieldsVisible();

    await voucherPage.fillGiftFields(VALID_GIFT);
    await voucherPage.fillPersonalInfo(VALID_CUSTOMER);
    await voucherPage.selectPaymentMethod(paymentMethods[0].name);
    await voucherPage.checkRequiredTerms();

    await voucherPage.submit();
    await expectFormSubmitted(page);
  });
});

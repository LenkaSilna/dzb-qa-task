import { test, expect } from '../fixtures';
import { VALID_CUSTOMER, VALID_GIFT } from '../lib/testData';
import { TIMING } from '../lib/timing';
import type { OrderStatusPage } from '../pages/OrderStatusPage';

/**
 * Asserts successful form submission — strict happy path.
 * Navigation to /status/ is required. Server errors and form validation errors
 * both fail the test. Happy path must succeed end-to-end.
 */
async function expectFormSubmitted(
  page: import('@playwright/test').Page,
  orderStatusPage: OrderStatusPage
) {
  // Check for form validation errors first (immediate feedback, no wait needed)
  const hasFormError = await page
    .getByText(/V objednávkovém formuláři se vyskytují chyby/i)
    .first()
    .isVisible({ timeout: TIMING.formError })
    .catch(() => false);
  expect(hasFormError, 'Form validation error — missing fields or unchecked T&C').toBe(false);

  // Navigation to /status/ is mandatory for happy path
  await page.waitForURL(/\/status\//, { timeout: TIMING.navigation });

  // Verify order status page content
  await orderStatusPage.expectOnStatusPage();
  await orderStatusPage.expectSummaryPricing();
  await orderStatusPage.expectOrderIdentifier();
}

test.describe('Voucher purchase — Happy path', () => {
  test('purchase with each payment method', async ({
    voucherPage,
    orderStatusPage,
    paymentMethods,
    page,
  }) => {
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
        await expectFormSubmitted(page, orderStatusPage);
      });
    }
  });
});

test.describe('Voucher purchase — Gift option', () => {
  test('purchase as gift', async ({ voucherPage, orderStatusPage, paymentMethods, page }) => {
    await voucherPage.goto();
    await voucherPage.selectVoucherValue(0);

    await voucherPage.toggleGiftOption();
    await voucherPage.expectGiftFieldsVisible();

    await voucherPage.fillGiftFields(VALID_GIFT);
    await voucherPage.fillPersonalInfo(VALID_CUSTOMER);
    await voucherPage.selectPaymentMethod(paymentMethods[0].name);
    await voucherPage.checkRequiredTerms();

    await voucherPage.submit();
    await expectFormSubmitted(page, orderStatusPage);
  });
});

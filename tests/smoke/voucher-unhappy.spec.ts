import { test } from '../fixtures';
import { VALID_CUSTOMER } from '../lib/testData';

test.describe('Voucher purchase — Unhappy path', () => {
  test('submit empty form shows validation errors', async ({ voucherPage, page }) => {
    await voucherPage.goto();

    const urlBefore = page.url();
    await voucherPage.submit();

    // Form should not navigate away
    await voucherPage.expectUrlUnchanged(urlBefore);

    // Expected fields: voucher value, name, email, phone, payment method
    await voucherPage.expectValidationErrorsVisible(5);

    // Specific error message should be shown
    await voucherPage.expectSpecificValidationMessage();
  });

  test('submit without T&C checkboxes shows error', async ({
    voucherPage,
    paymentMethods,
    page,
  }) => {
    await voucherPage.goto();

    await voucherPage.selectVoucherValue(0);
    await voucherPage.fillPersonalInfo(VALID_CUSTOMER);
    await voucherPage.selectPaymentMethod(paymentMethods[0].name);

    // Deliberately skip T&C checkboxes
    const urlBefore = page.url();
    await voucherPage.submit();

    // Form should not navigate away
    await voucherPage.expectUrlUnchanged(urlBefore);

    // T&C checkboxes should not be checked
    await voucherPage.expectTermsNotChecked();

    // Validation error should appear on checkbox area
    await voucherPage.expectValidationErrorOnCheckbox();
  });
});

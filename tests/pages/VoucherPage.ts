import { type Locator, type Page, expect } from '@playwright/test';
import type { PersonalInfo, GiftInfo } from '../lib/testData';
import { TIMING } from '../lib/timing';
import { ROUTES } from '../lib/routes';

export type VoucherProjectName = 'cz' | 'whitelabel';

export class VoucherPage {
  readonly page: Page;
  readonly project: VoucherProjectName;
  readonly submitButton: Locator;
  constructor(page: Page, project: VoucherProjectName) {
    this.page = page;
    this.project = project;
    this.submitButton =
      project === 'whitelabel'
        ? page.getByRole('button', { name: 'Objednat voucher' })
        : page.getByRole('button', { name: 'Objednat', exact: true });
  }

  /** CZ: Remove href from checkbox label <a> links to prevent accidental navigation. */
  private async neutralizeCheckboxLinks() {
    if (this.project === 'cz') {
      await this.page.evaluate(() => {
        document
          .querySelectorAll('.input-checkbox a[href]')
          .forEach((a) => a.removeAttribute('href'));
      });
    }
  }

  async goto() {
    // PostHog /_ph/flags/ triggers Vue re-render that resets form radio buttons
    const postHogPromise = this.page
      .waitForResponse((resp) => resp.url().includes('/_ph/flags'), { timeout: TIMING.formRender })
      .catch(() => null);

    await this.page.goto(ROUTES[this.project].voucher);
    await this.page.waitForLoadState('domcontentloaded');

    if (this.project === 'cz') {
      await this.page.locator('#voucher-form').waitFor({ timeout: TIMING.formRender });
    } else {
      await this.page.locator('.form-row').first().waitFor({ timeout: TIMING.formRender });
    }

    await postHogPromise;

    const cookieBtn = this.page.getByRole('button', { name: /Rozumím|Přijmout|Accept/i });
    if (await cookieBtn.isVisible({ timeout: TIMING.cookieBanner }).catch(() => false)) {
      await cookieBtn.click();
      await this.page.waitForTimeout(TIMING.mediumDelay);
    }

    await this.neutralizeCheckboxLinks();

    await this.page.evaluate(() => {
      const form = document.querySelector('#voucher-form') || document.querySelector('.order-form');
      form?.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await this.page.waitForTimeout(TIMING.mediumDelay);
  }

  async selectVoucherValue(index: number = 0) {
    if (this.project === 'cz') {
      const czIds = ['voucher-value-1', 'voucher-value-2', 'voucher-value-3'];
      if (index < 0 || index >= czIds.length) {
        throw new Error(`Invalid voucher index ${index}. Valid range: 0-${czIds.length - 1}`);
      }
      const radioId = czIds[index];
      const label = this.page.locator(`label[for="${radioId}"]`);
      await label.scrollIntoViewIfNeeded();
      await label.click();
      await expect(this.page.locator(`#${radioId}`)).toBeChecked();
    } else {
      const wlLabels = ['1\u00A0000\u00A0Kč', '2\u00A0000\u00A0Kč', '3\u00A0000\u00A0Kč'];
      if (index < 0 || index >= wlLabels.length) {
        throw new Error(`Invalid voucher index ${index}. Valid range: 0-${wlLabels.length - 1}`);
      }
      const radio = this.page.getByLabel(wlLabels[index]);
      await radio.scrollIntoViewIfNeeded();
      await radio.check();
      await expect(radio).toBeChecked();
    }
  }

  async fillPersonalInfo(data: PersonalInfo) {
    if (this.project === 'cz') {
      await this.page.locator('#customer-firstname').fill(data.firstname);
      await this.page.locator('#customer-lastname').fill(data.lastname);
      await this.page.locator('#customer-email').fill(data.email);
      await this.page.locator('#customer-phone').fill(data.phone);
      await this.page.getByLabel('Ulice*').fill(data.street);
      await this.page.getByLabel('Číslo popisné*').fill(data.streetNumber);
      await this.page.getByLabel('PSČ*').fill(data.postcode);
      await this.page.getByLabel('Město*').fill(data.city);
    } else {
      await this.page.getByLabel('Jméno *').fill(data.firstname);
      await this.page.getByLabel('Příjmení *').fill(data.lastname);
      await this.page.getByLabel('Emailová adresa *').fill(data.email);
      await this.page.getByLabel('Telefonní číslo *').fill(data.phone);
      await this.page.getByLabel('Ulice *').fill(data.street);
      await this.page.getByLabel('Číslo popisné *').fill(data.streetNumber);
      await this.page.getByLabel('PSČ *').fill(data.postcode);
      await this.page.getByLabel('Město *').fill(data.city);
    }
  }

  async toggleGiftOption() {
    if (this.project === 'cz') {
      await this.page.locator('label[for="buy-as-gift"]').scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(TIMING.shortDelay);
      await this.page.locator('label[for="buy-as-gift"]').click();
      await expect(this.page.locator('#buy-as-gift')).toBeChecked();
    } else {
      await this.page.getByLabel(/Kupuji jako dárek/).check();
    }
    await this.page.waitForTimeout(TIMING.mediumDelay);
  }

  async fillGiftFields(gift: GiftInfo) {
    if (this.project === 'cz') {
      await this.page.locator('#gift-recipient-name').fill(gift.recipientName);
      await this.page.locator('#gift-recipient-note').fill(gift.message);
    } else {
      await this.page.getByLabel(/Jméno příjemce|Jméno obdarovaného/).fill(gift.recipientName);
      await this.page.getByLabel(/Poznámka|Vzkaz/).fill(gift.message);
    }
  }

  async selectPaymentMethod(methodName: string) {
    if (this.project === 'cz') {
      // CZ: Custom Vue select — retry click because first attempt may not register
      const dropdownBtn = this.page.locator('.payment-form__inline-input .select__button');
      const dropdownList = this.page.locator('.payment-form__inline-input .select__list');

      await dropdownBtn.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(TIMING.mediumDelay);

      for (let attempt = 0; attempt < TIMING.dropdownMaxRetries; attempt++) {
        await dropdownBtn.click({ force: true });
        const isVisible = await dropdownList
          .waitFor({ state: 'visible', timeout: TIMING.dropdownAttempt })
          .then(() => true)
          .catch(() => false);
        if (isVisible) break;
        await this.page.waitForTimeout(TIMING.mediumDelay);
      }
      await expect(dropdownList).toBeVisible();

      const listButton = this.page
        .locator('.payment-form__inline-input .select__list-button')
        .filter({
          has: this.page.locator('.select__button-payment-title', { hasText: methodName }),
        })
        .first();
      await listButton.click({ timeout: TIMING.clickAction });
    } else {
      await this.page.getByLabel('Způsob platby *').selectOption({ label: methodName });
    }
  }

  async checkRequiredTerms() {
    await this.neutralizeCheckboxLinks();

    if (this.project === 'cz') {
      for (const id of ['#cancellation-conditions', '#business-conditions']) {
        const checkbox = this.page.locator(id);
        await checkbox.scrollIntoViewIfNeeded();
        if (!(await checkbox.isChecked())) {
          await checkbox.check({ force: true });
        }
        await expect(checkbox).toBeChecked();
      }
    } else {
      const storno = this.page.getByLabel(/Souhlasím se storno podmínkami/);
      await storno.check();
      await expect(storno).toBeChecked();

      const obchodni = this.page.getByLabel(/Souhlasím s obchodními podmínkami/);
      await obchodni.check();
      await expect(obchodni).toBeChecked();
    }
  }

  async submit() {
    await this.neutralizeCheckboxLinks();
    await this.submitButton.click();
  }

  // --- Assertions ---

  async expectValidationErrorsVisible(minCount: number = 1) {
    const invalidSelector = this.project === 'cz' ? '.is-invalid' : '[aria-invalid="true"]';
    const invalidFields = this.page.locator(invalidSelector);
    await expect(invalidFields.first()).toBeVisible({ timeout: TIMING.validationError });
    const count = await invalidFields.count();
    expect(count).toBeGreaterThanOrEqual(minCount);
    return count;
  }

  async expectValidationErrorOnCheckbox() {
    if (this.project === 'cz') {
      await expect(this.page.locator('.input-checkbox.is-invalid').first()).toBeVisible();
    } else {
      await expect(
        this.page.locator('.checkbox.is-invalid, [aria-invalid="true"]').first()
      ).toBeVisible();
    }
  }

  async expectUrlUnchanged(originalUrl: string) {
    await this.page.waitForTimeout(TIMING.urlStabilize);
    const currentPath = new URL(this.page.url()).pathname;
    const originalPath = new URL(originalUrl).pathname;
    expect(currentPath).toBe(originalPath);
  }

  async expectSummaryVisible() {
    await expect(this.page.getByRole('heading', { name: 'Rekapitulace' })).toBeVisible();
  }

  async expectSubmitButtonVisible() {
    await expect(this.submitButton).toBeVisible();
    await expect(this.submitButton).toBeEnabled();
  }

  async expectGiftFieldsVisible() {
    if (this.project === 'cz') {
      await expect(this.page.locator('#gift-recipient-name')).toBeVisible();
      await expect(this.page.locator('#gift-recipient-note')).toBeVisible();
    } else {
      await expect(this.page.getByLabel(/Jméno příjemce|Jméno obdarovaného/)).toBeVisible();
      await expect(this.page.getByLabel(/Poznámka|Vzkaz/)).toBeVisible();
    }
  }
}

/**
 * Payment method definitions.
 * Config assigns methods to projects via playwright.config.ts `use.projectPaymentMethods`.
 * Fixtures resolve keys to display names via PAYMENT_METHODS lookup.
 */

export type PaymentMethodType =
  | 'pluxee-benefit-card'
  | 'bank-transfer'
  | 'edenred-benefit-card'
  | 'edenred-cafeteria'
  | 'up-benefit-card'
  | 'payment-card';

export const PAYMENT_METHODS: Record<PaymentMethodType, { name: string }> = {
  'edenred-benefit-card': { name: 'Benefitní karta Edenred' },
  'edenred-cafeteria': { name: 'Edenred Benefity Premium (Cafeterie)' },
  'pluxee-benefit-card': { name: 'Benefitní karta Pluxee' },
  'up-benefit-card': { name: 'Benefitní karta UP' },
  'payment-card': { name: 'Platební karta' },
  'bank-transfer': { name: 'Převodem z účtu' },
};

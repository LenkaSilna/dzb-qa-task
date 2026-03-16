/**
 * Payment Methods DTO
 * Centralized definition of available payment methods used across config and tests
 */

export type ProjectType = 'cz' | 'pl' | 'whitelabel';

export type PaymentMethodType =
  | 'pluxee-benefit-card'
  | 'bank-transfer'
  | 'edenred-benefit-card'
  | 'edenred-cafeteria'
  | 'up-benefit-card'
  | 'payment-card';

// Payment methods with their availability per project
export const PAYMENT_METHODS: Record<
  PaymentMethodType,
  { name: string; availableIn: ProjectType[]; uiPattern: RegExp }
> = {
  'edenred-benefit-card': {
    name: 'Benefitní karta Edenred',
    availableIn: ['cz'],
    uiPattern: /Benefitní karta Edenred/,
  },
  'edenred-cafeteria': {
    name: 'Edenred Benefity Premium (Cafeterie)',
    availableIn: ['cz'],
    uiPattern: /Edenred Benefity Premium/,
  },
  'pluxee-benefit-card': {
    name: 'Benefitní karta Pluxee',
    availableIn: ['cz', 'whitelabel'],
    uiPattern: /Benefitní karta Pluxee/,
  },
  'up-benefit-card': {
    name: 'Benefitní karta UP',
    availableIn: ['cz'],
    uiPattern: /Benefitní karta UP/,
  },
  'payment-card': {
    name: 'Platební karta',
    availableIn: ['cz', 'whitelabel'],
    uiPattern: /Platební karta/,
  },
  'bank-transfer': {
    name: 'Převodem z účtu',
    availableIn: ['cz', 'whitelabel'],
    uiPattern: /Převodem z účtu/,
  },
};

// Helper to get payment methods for specific project
const getPaymentMethodsForProject = (project: ProjectType): PaymentMethodType[] =>
  (Object.keys(PAYMENT_METHODS) as PaymentMethodType[]).filter((method) =>
    PAYMENT_METHODS[method]?.availableIn.includes(project)
  );

export const getAllPaymentMethods = (): PaymentMethodType[] =>
  Object.keys(PAYMENT_METHODS) as PaymentMethodType[];

// Project-specific payment methods
export const PROJECT_PAYMENT_METHODS = {
  cz: getPaymentMethodsForProject('cz'),
  pl: getPaymentMethodsForProject('pl'),
  whitelabel: getPaymentMethodsForProject('whitelabel'),
} as const;

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
export const PAYMENT_METHODS: Partial<
  Record<PaymentMethodType, { name: string; availableIn: ProjectType[]; uiPattern: RegExp }>
> = {
  // TODO: Fill in availableIn and uiPattern for each payment method based on the live product
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

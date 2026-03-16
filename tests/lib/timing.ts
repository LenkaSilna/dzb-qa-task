/**
 * Centralized timing constants for all waits and timeouts.
 * Single source of truth — no hardcoded values in page objects or specs.
 */
export const TIMING = {
  /** Form render wait after page load */
  formRender: 15_000,

  /** Cookie banner visibility check */
  cookieBanner: 3_000,

  /** Short stabilization delay (after dismiss, scroll, toggle) */
  shortDelay: 300,

  /** Medium stabilization delay (after render, re-render, dropdown) */
  mediumDelay: 500,

  /** Navigation wait after submit */
  navigation: 15_000,

  /** Dropdown list visibility per attempt */
  dropdownAttempt: 2_000,

  /** Max retry attempts for flaky Vue dropdown */
  dropdownMaxRetries: 5,

  /** Click action timeout (e.g. payment list button) */
  clickAction: 10_000,

  /** Validation errors visibility after submit */
  validationError: 10_000,

  /** URL stabilization after submit */
  urlStabilize: 1_000,

  /** Server error message visibility check */
  serverError: 3_000,

  /** Form error message visibility check */
  formError: 1_000,
} as const;

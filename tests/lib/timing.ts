/**
 * Centralized timing constants for explicit timeout parameters.
 * These are NOT fixed delays (waitForTimeout) — they are upper bounds
 * for web-first assertions and waitFor calls.
 */
export const TIMING = {
  /** Form render wait after page load */
  formRender: 15_000,

  /** Cookie banner visibility check */
  cookieBanner: 3_000,

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

  /** Server error message visibility check */
  serverError: 3_000,

  /** Form error message visibility check */
  formError: 1_000,
} as const;

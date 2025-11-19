import type { TestStatus as TestStatusType } from '@kb-labs/ai-tests-contracts';

export const TestStatus = {
  PASSED: 'passed',
  FAILED: 'failed',
  FLAKY: 'flaky',
  REPAIRED: 'repaired',
  UNREPAIRABLE: 'unrepairable'
} as const satisfies Record<string, TestStatusType>;

export type TestStatusValue = TestStatusType;


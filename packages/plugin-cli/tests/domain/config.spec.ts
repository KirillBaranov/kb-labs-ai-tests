import { describe, expect, it } from 'vitest';
import { AiTestsConfigModel } from '../../src/domain/config';
import { IterationHistory, IterationRecordBuilder } from '../../src/domain/iteration';

describe('AiTestsConfigModel', () => {
  it('normalizes partial config with defaults and runner command', () => {
    const model = AiTestsConfigModel.from({ testsDir: 'custom', runner: 'pnpm vitest' });
    expect(model.testsDir).toBe('custom');
    expect(model.runner).toMatchObject({ mode: 'shell', command: 'pnpm vitest' });
    expect(model.maxAttempts).toBeGreaterThan(0);
  });

  it('throws when attempt index exceeds maxAttempts', () => {
    const model = AiTestsConfigModel.from({ maxAttempts: 1 });
    expect(() => model.ensureAttemptWithinLimit(1)).toThrow(/maxAttempts=1/);
  });
});

describe('IterationHistory & Builder', () => {
  it('increments attempt index and tracks exhaustion', () => {
    const history = IterationHistory.from([
      new IterationRecordBuilder(0).complete('needs-review')
    ]);

    expect(history.nextAttemptIndex()).toBe(1);
    expect(history.exhausted(1)).toBe(true);
  });

  it('marks iteration completed with status and notes', () => {
    const builder = new IterationRecordBuilder(0).withFailedFiles(['tests/sample.spec.ts']);
    const record = builder.complete('fixed', ['patched via mock run']);

    expect(record.status).toBe('fixed');
    expect(record.completedAt).toBeTruthy();
    expect(record.notes).toEqual(['patched via mock run']);
    expect(record.failedFiles).toEqual(['tests/sample.spec.ts']);
  });
});


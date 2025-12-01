import type { TestRunResult } from '@kb-labs/ai-tests-contracts';

export class TestRunEntity {
  constructor(private readonly payload: TestRunResult) {}

  static fromRunner(result: TestRunResult): TestRunEntity {
    return new TestRunEntity(result);
  }

  status(): TestRunResult['status'] {
    return this.payload.status;
  }

  hasFailures(): boolean {
    return this.payload.summary.failed > 0;
  }

  hasPartialSuccess(): boolean {
    return this.payload.status === 'partial';
  }

  durationMs(): number {
    return this.payload.durationMs;
  }

  failedFiles(): string[] {
    return this.payload.files.filter((file) => file.failed > 0).map((file) => file.filePath);
  }

  failedFileSummaries() {
    return this.payload.files.filter((file) => file.failed > 0);
  }

  toJSON(): TestRunResult {
    return this.payload;
  }
}


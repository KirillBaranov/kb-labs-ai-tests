import type {
  IterationRecord,
  IterationStatus,
  TestGenerationResult,
  TestRunResult
} from '@kb-labs/ai-tests-contracts';

export class IterationRecordBuilder {
  private readonly record: IterationRecord;

  constructor(attemptIndex: number) {
    this.record = {
      attemptIndex,
      startedAt: new Date().toISOString(),
      status: 'pending'
    };
  }

  withGenerated(results: TestGenerationResult[]): this {
    this.record.generated = results;
    return this;
  }

  withFailedFiles(files: string[]): this {
    if (files.length) {
      this.record.failedFiles = files;
    }
    return this;
  }

  withRun(result: TestRunResult): this {
    this.record.run = result;
    return this;
  }

  withFixes(fixes: IterationRecord['fixes']): this {
    if (fixes?.length) {
      this.record.fixes = fixes;
    }
    return this;
  }

  complete(status: IterationStatus, notes?: string[]): IterationRecord {
    this.record.status = status;
    this.record.completedAt = new Date().toISOString();
    if (notes?.length) {
      this.record.notes = notes;
    }
    return this.record;
  }
}

export class IterationHistory {
  constructor(private readonly records: IterationRecord[] = []) {}

  static from(records: IterationRecord[] = []): IterationHistory {
    return new IterationHistory(records);
  }

  get list(): IterationRecord[] {
    return this.records;
  }

  latest(): IterationRecord | undefined {
    return [...this.records].sort((a, b) => b.attemptIndex - a.attemptIndex)[0];
  }

  nextAttemptIndex(): number {
    return this.records.length;
  }

  append(record: IterationRecord): IterationHistory {
    return new IterationHistory([...this.records, record]);
  }

  exhausted(maxAttempts: number): boolean {
    return this.records.length >= maxAttempts;
  }
}


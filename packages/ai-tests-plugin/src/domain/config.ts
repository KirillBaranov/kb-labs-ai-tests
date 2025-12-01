import type {
  AiTestsConfig,
  AiTestsRunnerConfig,
  AiTestsRunnerMode,
  AiTestsRunnerSetting
} from '@kb-labs/ai-tests-contracts';
import { DEFAULT_AI_TESTS_CONFIG, DEFAULT_TEST_RUN_COMMAND } from '../shared/constants';

export type NormalizedAiTestsConfig = Omit<AiTestsConfig, 'runner'> & {
  runner: AiTestsRunnerConfig;
};

function coerceRunner(input?: AiTestsRunnerSetting): AiTestsRunnerConfig {
  if (!input) {
    return { mode: 'shell', command: DEFAULT_TEST_RUN_COMMAND };
  }

  if (typeof input === 'string') {
    if (input === 'mock') {
      return { mode: 'mock' };
    }
    if (input === 'shell') {
      return { mode: 'shell', command: DEFAULT_TEST_RUN_COMMAND };
    }
    return { mode: 'shell', command: input };
  }

  const mode: AiTestsRunnerMode = input.mode ?? 'shell';
  const command = input.command ?? (mode === 'shell' ? DEFAULT_TEST_RUN_COMMAND : undefined);

  return {
    mode,
    command,
    env: input.env,
    cwd: input.cwd
  };
}

export function normalizeConfig(input?: Partial<AiTestsConfig>): NormalizedAiTestsConfig {
  const merged: AiTestsConfig = {
    ...DEFAULT_AI_TESTS_CONFIG,
    ...input,
    sources: input?.sources ?? DEFAULT_AI_TESTS_CONFIG.sources,
    thresholds: {
      repair: DEFAULT_AI_TESTS_CONFIG.thresholds.repair,
      ...(input?.thresholds ?? {})
    }
  };

  return {
    ...merged,
    runner: coerceRunner(merged.runner)
  };
}

export function mergeConfig(
  current: AiTestsConfig | undefined,
  next: Partial<AiTestsConfig>
): NormalizedAiTestsConfig {
  return normalizeConfig({
    ...current,
    ...next,
    thresholds: {
      repair: current?.thresholds?.repair ?? DEFAULT_AI_TESTS_CONFIG.thresholds.repair,
      ...(current?.thresholds ?? {}),
      ...(next.thresholds ?? {})
    }
  });
}

export class AiTestsConfigModel {
  constructor(private readonly config: NormalizedAiTestsConfig) {}

  static from(input?: Partial<AiTestsConfig>): AiTestsConfigModel {
    return new AiTestsConfigModel(normalizeConfig(input));
  }

  static merge(current: AiTestsConfig | undefined, next: Partial<AiTestsConfig>): AiTestsConfigModel {
    return new AiTestsConfigModel(mergeConfig(current, next));
  }

  get value(): NormalizedAiTestsConfig {
    return this.config;
  }

  get maxAttempts(): number {
    return this.config.maxAttempts;
  }

  get sources(): string[] {
    return this.config.sources;
  }

  get testsDir(): string {
    return this.config.testsDir;
  }

  get runner(): AiTestsRunnerConfig {
    return this.config.runner;
  }

  shouldRetry(nextAttemptIndex: number): boolean {
    return nextAttemptIndex < this.config.maxAttempts;
  }

  ensureAttemptWithinLimit(attemptIndex: number): void {
    if (attemptIndex >= this.config.maxAttempts) {
      throw new Error(
        `Reached maxAttempts=${this.config.maxAttempts}. Further repair attempts are not allowed.`
      );
    }
  }

  toJSON(): NormalizedAiTestsConfig {
    return this.config;
  }
}


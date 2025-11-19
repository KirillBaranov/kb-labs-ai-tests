import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { NormalizedAiTestsConfig } from '../../domain/config.js';
import type { TestRunnerAdapter, TestRunnerOutput } from '../../application/types.js';

const execAsync = promisify(exec);

function buildResult(
  startedAt: Date,
  finishedAt: Date,
  status: 'success' | 'failed' | 'partial',
  commandLabel: string,
  options: { exitCode: number; stdout?: string; stderr?: string; mode: 'shell' | 'mock' }
): TestRunnerOutput {
  const durationMs = finishedAt.getTime() - startedAt.getTime();
  const failed = status === 'failed' ? 1 : 0;
  const passed = status === 'success' ? 1 : 0;
  const skipped = status === 'partial' ? 1 : 0;

  return {
    result: {
      status,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs,
      summary: {
        passed,
        failed,
        skipped
      },
      files: [
        {
          filePath: commandLabel,
          passed,
          failed,
          skipped,
          durationMs,
          errors:
            failed > 0 && options.stderr
              ? [
                  {
                    message: options.stderr.slice(0, 2000)
                  }
                ]
              : undefined
        }
      ],
      runner: {
        mode: options.mode,
        command: commandLabel,
        exitCode: options.exitCode,
        stdout: options.stdout,
        stderr: options.stderr
      }
    },
    log: [
      `command=${commandLabel}`,
      `status=${status}`,
      `exitCode=${options.exitCode}`,
      options.stdout ? `stdout:\n${options.stdout}` : '',
      options.stderr ? `stderr:\n${options.stderr}` : ''
    ]
      .filter(Boolean)
      .join('\n')
  };
}

async function runShell(command: string, config: NormalizedAiTestsConfig, dryRun?: boolean): Promise<TestRunnerOutput> {
  const startedAt = new Date();

  if (dryRun) {
    return buildResult(startedAt, new Date(), 'success', command, {
      exitCode: 0,
      stdout: '[dry-run]',
      mode: 'shell'
    });
  }

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: config.runner.cwd ?? process.cwd(),
      env: {
        ...process.env,
        ...(config.runner.env ?? {})
      },
      maxBuffer: 10 * 1024 * 1024
    });

    return buildResult(startedAt, new Date(), 'success', command, { exitCode: 0, stdout, stderr, mode: 'shell' });
  } catch (error) {
    const execError = error as NodeJS.ErrnoException & { stdout?: string; stderr?: string };
    const stdout = execError.stdout ?? '';
    const stderr = execError.stderr ?? execError.message;
    const exitCode = typeof execError.code === 'number' ? execError.code : 1;

    return buildResult(startedAt, new Date(), 'failed', command, { exitCode, stdout, stderr, mode: 'shell' });
  }
}

function runMock(config: NormalizedAiTestsConfig): TestRunnerOutput {
  const startedAt = new Date();
  const finishedAt = new Date(startedAt.getTime() + 250);
  const shouldFail = config.thresholds.allowedFailurePercentage ? config.thresholds.allowedFailurePercentage > 0 : true;

  const status = shouldFail ? 'partial' : 'success';
  const stdout = `Mock runner executed for ${config.testsDir}`;
  const stderr = status === 'partial' ? 'One or more mock tests failed.' : '';
  const exitCode = status === 'partial' ? 1 : 0;

  const finalStatus = status === 'success' ? 'success' : 'partial';
  return buildResult(startedAt, finishedAt, finalStatus, 'mock-runner', {
    exitCode,
    stdout,
    stderr,
    mode: 'mock'
  });
}

export function createTestRunnerAdapter(): TestRunnerAdapter {
  return {
    async run(config, options) {
      if (config.runner.mode === 'mock') {
        return runMock(config);
      }

      const command = config.runner.command ?? 'pnpm test';
      return runShell(command, config, options?.dryRun);
    }
  };
}


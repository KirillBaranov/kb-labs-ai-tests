import { defineCommand, type CommandResult } from '@kb-labs/cli-command-kit';
import type { RunTestsInput, RunTestsOutput } from '../../../application/index.js';
import { runTests } from '../../../application/index.js';
import { createCliServices, type AiTestsCliContext } from '../../context.js';
import { logCliInvocation } from '../../utils.js';

export interface RunCommandArgs extends RunTestsInput {
  json?: boolean;
  debug?: boolean;
  profile?: string;
}

type AiTestsRunFlags = {
  'dry-run': { type: 'boolean'; description?: string; default?: boolean };
  profile: { type: 'string'; description?: string };
  debug: { type: 'boolean'; description?: string; default?: boolean };
  json: { type: 'boolean'; description?: string; default?: boolean };
};

type AiTestsRunResult = CommandResult & {
  result?: RunTestsOutput;
};

export const run = defineCommand<AiTestsRunFlags, AiTestsRunResult>({
  name: 'ai-tests:run',
  flags: {
    'dry-run': {
      type: 'boolean',
      description: 'Skip executing runner, emit stub result.',
      default: false,
    },
    profile: {
      type: 'string',
      description: 'Label run with a logical profile.',
    },
    debug: {
      type: 'boolean',
      description: 'Enable verbose logger output.',
      default: false,
    },
    json: {
      type: 'boolean',
      description: 'Emit JSON output.',
      default: false,
    },
  },
  async handler(ctx, argv, flags) {
    const context: AiTestsCliContext = {
      stdout: ctx.output ? {
        write: (text: string) => ctx.output.write(text),
      } as NodeJS.WritableStream : process.stdout,
      services: createCliServices(),
    };
    
    const { services } = context;
    const { json, debug, profile, ...rest } = {
      dryRun: flags['dry-run'],
      json: flags.json,
      debug: flags.debug,
      profile: flags.profile,
    };

    logCliInvocation(services.logger, 'ai-tests:run', {
      debug,
      profile,
      meta: { dryRun: Boolean(rest.dryRun) }
    });

    ctx.tracker.checkpoint('run');

    const result = await runTests(rest, services);
    const profileLabel = profile ?? 'default';

    ctx.tracker.checkpoint('complete');

    if (json) {
      ctx.output?.json(result);
    } else {
      ctx.output?.write(
        [
          'AI Tests runner finished 🧪',
          `- profile: ${profileLabel}`,
          `- status: ${result.result.status}`,
          `- runPath: ${result.runPath}`,
          `- logPath: ${result.logPath}`
        ].join('\n') + '\n'
      );
    }

    return { ok: true, result };
  },
});

export async function runRunCommand(
  args: RunCommandArgs = {},
  context?: AiTestsCliContext
): Promise<RunTestsOutput> {
  const { services, stdout } = context ?? { services: createCliServices(), stdout: process.stdout };
  const { json, debug, profile, ...rest } = args;

  logCliInvocation(services.logger, 'ai-tests:run', {
    debug,
    profile,
    meta: { dryRun: Boolean(rest.dryRun) }
  });

  const result = await runTests(rest, services);
  const profileLabel = profile ?? 'default';

  if (json) {
    stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    stdout.write(
      [
        'AI Tests runner finished 🧪',
        `- profile: ${profileLabel}`,
        `- status: ${result.result.status}`,
        `- runPath: ${result.runPath}`,
        `- logPath: ${result.logPath}`
      ].join('\n') + '\n'
    );
  }

  return result;
}

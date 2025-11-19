import { defineCommand, type CommandResult } from '@kb-labs/cli-command-kit';
import type { RepairTestsInput, RepairTestsOutput } from '../../../application/index.js';
import { repairTests } from '../../../application/index.js';
import { createCliServices, type AiTestsCliContext } from '../../context.js';
import { logCliInvocation } from '../../utils.js';

export interface RepairCommandArgs extends RepairTestsInput {
  json?: boolean;
  debug?: boolean;
  profile?: string;
}

type AiTestsRepairFlags = {
  'max-attempts': { type: 'number'; description?: string };
  'dry-run': { type: 'boolean'; description?: string; default?: boolean };
  profile: { type: 'string'; description?: string };
  debug: { type: 'boolean'; description?: string; default?: boolean };
  json: { type: 'boolean'; description?: string; default?: boolean };
};

type AiTestsRepairResult = CommandResult & {
  result?: RepairTestsOutput;
};

export const run = defineCommand<AiTestsRepairFlags, AiTestsRepairResult>({
  name: 'ai-tests:repair',
  flags: {
    'max-attempts': {
      type: 'number',
      description: 'Override max repair attempts.',
    },
    'dry-run': {
      type: 'boolean',
      description: 'Skip runner re-execution.',
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
      maxAttempts: flags['max-attempts'],
      dryRun: flags['dry-run'],
      json: flags.json,
      debug: flags.debug,
      profile: flags.profile,
    };

    logCliInvocation(services.logger, 'ai-tests:repair', {
      debug,
      profile,
      meta: {
        dryRun: Boolean(rest.dryRun),
        maxAttempts: rest.maxAttempts
      }
    });

    ctx.tracker.checkpoint('repair');

    const result = await repairTests(rest, services);
    const profileLabel = profile ?? 'default';

    ctx.tracker.checkpoint('complete');

    if (json) {
      ctx.output?.json(result);
    } else {
      ctx.output?.write(
        [
          'AI Tests repair attempt logged 🔁',
          `- profile: ${profileLabel}`,
          `- iteration: ${result.iteration.attemptIndex}`,
          `- status: ${result.iteration.status}`,
          `- maxAttemptsReached: ${result.maxAttemptsReached}`
        ].join('\n') + '\n'
      );
    }

    return { ok: true, result };
  },
});

export async function runRepairCommand(
  args: RepairCommandArgs = {},
  context?: AiTestsCliContext
): Promise<RepairTestsOutput> {
  const { services, stdout } = context ?? { services: createCliServices(), stdout: process.stdout };
  const { json, debug, profile, ...rest } = args;

  logCliInvocation(services.logger, 'ai-tests:repair', {
    debug,
    profile,
    meta: {
      dryRun: Boolean(rest.dryRun),
      maxAttempts: rest.maxAttempts
    }
  });

  const result = await repairTests(rest, services);
  const profileLabel = profile ?? 'default';

  if (json) {
    stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    stdout.write(
      [
        'AI Tests repair attempt logged 🔁',
        `- profile: ${profileLabel}`,
        `- iteration: ${result.iteration.attemptIndex}`,
        `- status: ${result.iteration.status}`,
        `- maxAttemptsReached: ${result.maxAttemptsReached}`
      ].join('\n') + '\n'
    );
  }

  return result;
}

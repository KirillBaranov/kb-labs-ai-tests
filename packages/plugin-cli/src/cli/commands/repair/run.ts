import { defineCommand, type CommandResult } from '@kb-labs/shared-command-kit';
import type { RepairTestsInput, RepairTestsOutput } from '../../../application/index';
import { repairTests } from '../../../application/index';
import { createCliServices, type AiTestsCliContext } from '../../context';
import { logCliInvocation } from '../../utils';

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
      const status = result.maxAttemptsReached ? 'warning' : 'success';
      const outputText = ctx.output?.ui.sideBox({
        title: 'AI Tests Repair',
        sections: [
          {
            items: [
              `${ctx.output.ui.symbols.success} ${ctx.output.ui.colors.success('Repair attempt logged')}`,
              `Profile: ${profileLabel}`,
              `Iteration: ${result.iteration.attemptIndex}`,
              `Status: ${result.iteration.status}`,
              `Max attempts reached: ${result.maxAttemptsReached}`,
            ],
          },
        ],
        status,
        timing: ctx.tracker.total(),
      });
      ctx.output?.write(outputText);
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

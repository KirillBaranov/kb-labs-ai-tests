import { defineCommand, type CommandResult } from '@kb-labs/shared-command-kit';
import type { InitTestsInput, InitTestsOutput } from '../../../application/index';
import { initTests } from '../../../application/index';
import { createCliServices, type AiTestsCliContext } from '../../context';
import { logCliInvocation } from '../../utils';

export interface InitCommandArgs extends InitTestsInput {
  json?: boolean;
  debug?: boolean;
  profile?: string;
}

type AiTestsInitFlags = {
  'tests-dir': { type: 'string'; description?: string };
  'dry-run': { type: 'boolean'; description?: string; default?: boolean };
  profile: { type: 'string'; description?: string };
  debug: { type: 'boolean'; description?: string; default?: boolean };
  json: { type: 'boolean'; description?: string; default?: boolean };
};

type AiTestsInitResult = CommandResult & {
  result?: InitTestsOutput;
};

export const run = defineCommand<AiTestsInitFlags, AiTestsInitResult>({
  name: 'ai-tests:init',
  flags: {
    'tests-dir': {
      type: 'string',
      description: 'Custom tests directory path.',
    },
    'dry-run': {
      type: 'boolean',
      description: 'Preview actions without filesystem writes.',
      default: false,
    },
    profile: {
      type: 'string',
      description: 'Label run with a logical profile (e.g. backend).',
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
    
    const { services, stdout } = context;
    const { json, debug, profile, ...input } = {
      testsDir: flags['tests-dir'],
      dryRun: flags['dry-run'],
      json: flags.json,
      debug: flags.debug,
      profile: flags.profile,
    };

    logCliInvocation(services.logger, 'ai-tests:init', {
      debug,
      profile,
      meta: { dryRun: Boolean(input.dryRun), testsDir: input.testsDir }
    });

    ctx.tracker.checkpoint('init');

    const result = await initTests(input, services);
    const profileLabel = profile ?? 'default';

    ctx.tracker.checkpoint('complete');

    if (json) {
      ctx.output?.json(result);
    } else {
      const outputText = ctx.output?.ui.sideBox({
        title: 'AI Tests Init',
        sections: [
          {
            items: [
              `${ctx.output.ui.symbols.success} ${ctx.output.ui.colors.success('Initialization complete')}`,
              `Profile: ${profileLabel}`,
              `Tests dir: ${result.testsDir}`,
              `Config updated: ${result.configUpdated ? 'yes' : 'no'}`,
              `Created entries: ${result.created.length}`,
            ],
          },
        ],
        status: 'success',
        timing: ctx.tracker.total(),
      });
      ctx.output?.write(outputText);
    }

    return { ok: true, result };
  },
});

export async function runInitCommand(
  args: InitCommandArgs = {},
  context?: AiTestsCliContext
): Promise<InitTestsOutput> {
  const { services, stdout } = context ?? { services: createCliServices(), stdout: process.stdout };
  const { json, debug, profile, ...input } = args;

  logCliInvocation(services.logger, 'ai-tests:init', {
    debug,
    profile,
    meta: { dryRun: Boolean(input.dryRun), testsDir: input.testsDir }
  });

  const result = await initTests(input, services);
  const profileLabel = profile ?? 'default';

  if (json) {
    stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    stdout.write(
      [
        'AI Tests initialization complete ✅',
        `- profile: ${profileLabel}`,
        `- testsDir: ${result.testsDir}`,
        `- configUpdated: ${result.configUpdated ? 'yes' : 'no'}`,
        `- created entries: ${result.created.length}`
      ].join('\n') + '\n'
    );
  }

  return result;
}

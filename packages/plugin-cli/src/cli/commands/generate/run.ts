import { defineCommand, type CommandResult } from '@kb-labs/shared-command-kit';
import type { GenerateTestsInput, GenerateTestsOutput } from '../../../application/index';
import { generateTests } from '../../../application/index';
import { createCliServices, type AiTestsCliContext } from '../../context';
import { logCliInvocation } from '../../utils';

export interface GenerateCommandArgs extends Omit<GenerateTestsInput, 'targets'> {
  json?: boolean;
  targets?: string | string[];
  debug?: boolean;
  profile?: string;
}

function normalizeTargets(input?: string | string[]): string[] | undefined {
  if (!input) {
    return undefined;
  }
  if (Array.isArray(input)) {
    return input;
  }
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

type AiTestsGenerateFlags = {
  targets: { type: 'string'; description?: string };
  strategy: { type: 'string'; description?: string; choices?: readonly string[] };
  'dry-run': { type: 'boolean'; description?: string; default?: boolean };
  profile: { type: 'string'; description?: string };
  debug: { type: 'boolean'; description?: string; default?: boolean };
  json: { type: 'boolean'; description?: string; default?: boolean };
};

type AiTestsGenerateResult = CommandResult & {
  result?: GenerateTestsOutput;
};

export const run = defineCommand<AiTestsGenerateFlags, AiTestsGenerateResult>({
  name: 'ai-tests:generate',
  flags: {
    targets: {
      type: 'string',
      description: 'Comma-separated file paths to limit scope.',
    },
    strategy: {
      type: 'string',
      description: 'Override default generation strategy.',
      choices: ['suggest-only', 'write-and-run', 'repair-loop', 'llm-generate'] as const,
    },
    'dry-run': {
      type: 'boolean',
      description: 'Skip writing tests to disk.',
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
    const { json, debug, profile, targets, ...rest } = {
      targets: flags.targets,
      strategy: flags.strategy,
      dryRun: flags['dry-run'],
      json: flags.json,
      debug: flags.debug,
      profile: flags.profile,
    };
    const payload: GenerateTestsInput = {
      ...rest,
      targets: normalizeTargets(targets)
    };

    logCliInvocation(services.logger, 'ai-tests:generate', {
      debug,
      profile,
      meta: {
        dryRun: Boolean(payload.dryRun),
        strategy: payload.strategy,
        targets: payload.targets?.length ?? 0
      }
    });

    ctx.tracker.checkpoint('generate');

    const result = await generateTests(payload, services);
    const profileLabel = profile ?? 'default';

    ctx.tracker.checkpoint('complete');

    if (json) {
      ctx.output?.json(result);
    } else {
      const outputText = ctx.output?.ui.sideBox({
        title: 'AI Tests Generate',
        sections: [
          {
            items: [
              `${ctx.output.ui.symbols.success} ${ctx.output.ui.colors.success('Generation complete')}`,
              `Profile: ${profileLabel}`,
              `Generated suggestions: ${result.generated.length}`,
              `Artifacts: ${result.artifacts.length}`,
              `Summary: ${result.summary}`,
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

export async function runGenerateCommand(
  args: GenerateCommandArgs = {},
  context?: AiTestsCliContext
): Promise<GenerateTestsOutput> {
  const { services, stdout } = context ?? { services: createCliServices(), stdout: process.stdout };
  const { json, debug, profile, targets, ...rest } = args;
  const payload: GenerateTestsInput = {
    ...rest,
    targets: normalizeTargets(targets)
  };

  logCliInvocation(services.logger, 'ai-tests:generate', {
    debug,
    profile,
    meta: {
      dryRun: Boolean(payload.dryRun),
      strategy: payload.strategy,
      targets: payload.targets?.length ?? 0
    }
  });

  const result = await generateTests(payload, services);
  const profileLabel = profile ?? 'default';

  if (json) {
    stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    stdout.write(
      [
        'AI Tests generation complete ✍️',
        `- profile: ${profileLabel}`,
        `- generated suggestions: ${result.generated.length}`,
        `- artifacts: ${result.artifacts.length}`,
        `- summary: ${result.summary}`
      ].join('\n') + '\n'
    );
  }

  return result;
}

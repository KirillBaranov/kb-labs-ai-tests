import { defineCommand, type CommandResult } from '@kb-labs/cli-command-kit';
import type { PlanTestsInput, PlanTestsOutput } from '../../../application/index.js';
import { planTests } from '../../../application/index.js';
import { createCliServices, type AiTestsCliContext } from '../../context.js';
import { logCliInvocation } from '../../utils.js';

export interface PlanCommandArgs extends Omit<PlanTestsInput, 'sources'> {
  json?: boolean;
  sources?: string | string[];
  debug?: boolean;
  profile?: string;
}

function normalizeSources(input?: string | string[]): string[] | undefined {
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

type AiTestsPlanFlags = {
  sources: { type: 'string'; description?: string };
  'dry-run': { type: 'boolean'; description?: string; default?: boolean };
  profile: { type: 'string'; description?: string };
  debug: { type: 'boolean'; description?: string; default?: boolean };
  json: { type: 'boolean'; description?: string; default?: boolean };
};

type AiTestsPlanResult = CommandResult & {
  result?: PlanTestsOutput;
};

export const run = defineCommand<AiTestsPlanFlags, AiTestsPlanResult>({
  name: 'ai-tests:plan',
  flags: {
    sources: {
      type: 'string',
      description: 'Comma-separated globs overriding config.',
    },
    'dry-run': {
      type: 'boolean',
      description: 'Preview plan without writing artifact.',
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
    const { json, debug, profile, sources, ...rest } = {
      sources: flags.sources,
      dryRun: flags['dry-run'],
      json: flags.json,
      debug: flags.debug,
      profile: flags.profile,
    };
    const payload: PlanTestsInput = {
      ...rest,
      sources: normalizeSources(sources)
    };

    logCliInvocation(services.logger, 'ai-tests:plan', {
      debug,
      profile,
      meta: { dryRun: Boolean(payload.dryRun), sourceGlobs: payload.sources?.length ?? 0 }
    });

    ctx.tracker.checkpoint('plan');

    const result = await planTests(payload, services);
    const profileLabel = profile ?? 'default';

    ctx.tracker.checkpoint('complete');

    if (json) {
      ctx.output?.json(result);
    } else {
      const outputText = ctx.output?.ui.sideBox({
        title: 'AI Tests Plan',
        sections: [
          {
            items: [
              `${ctx.output.ui.symbols.success} ${ctx.output.ui.colors.success('Plan complete')}`,
              `Profile: ${profileLabel}`,
              `Plan path: ${result.planPath}`,
              `Targets: ${result.totalTargets}`,
              `Uncovered: ${result.notCovered}`,
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

export async function runPlanCommand(
  args: PlanCommandArgs = {},
  context?: AiTestsCliContext
): Promise<PlanTestsOutput> {
  const { services, stdout } = context ?? { services: createCliServices(), stdout: process.stdout };
  const { json, debug, profile, sources, ...rest } = args;
  const payload: PlanTestsInput = {
    ...rest,
    sources: normalizeSources(sources)
  };

  logCliInvocation(services.logger, 'ai-tests:plan', {
    debug,
    profile,
    meta: { dryRun: Boolean(payload.dryRun), sourceGlobs: payload.sources?.length ?? 0 }
  });

  const result = await planTests(payload, services);
  const profileLabel = profile ?? 'default';

  if (json) {
    stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    stdout.write(
      [
        'AI Tests plan complete 📋',
        `- profile: ${profileLabel}`,
        `- planPath: ${result.planPath}`,
        `- targets: ${result.totalTargets}`,
        `- uncovered: ${result.notCovered}`
      ].join('\n') + '\n'
    );
  }

  return result;
}

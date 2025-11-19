import type { PlanTestsInput, PlanTestsOutput } from '../../../application/index.js';
import { planTests } from '../../../application/index.js';
import type { AiTestsCliContext } from '../../context.js';
import { resolveContext } from '../../context.js';
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

export async function runPlanCommand(
  args: PlanCommandArgs = {},
  context?: AiTestsCliContext
): Promise<PlanTestsOutput> {
  const { services, stdout } = resolveContext(context);
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

import type { GenerateTestsInput, GenerateTestsOutput } from '../../../application/index.js';
import { generateTests } from '../../../application/index.js';
import type { AiTestsCliContext } from '../../context.js';
import { resolveContext } from '../../context.js';
import { logCliInvocation } from '../../utils.js';

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

export async function runGenerateCommand(
  args: GenerateCommandArgs = {},
  context?: AiTestsCliContext
): Promise<GenerateTestsOutput> {
  const { services, stdout } = resolveContext(context);
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

import type { InitTestsInput, InitTestsOutput } from '../../../application/index.js';
import { initTests } from '../../../application/index.js';
import type { AiTestsCliContext } from '../../context.js';
import { resolveContext } from '../../context.js';
import { logCliInvocation } from '../../utils.js';

export interface InitCommandArgs extends InitTestsInput {
  json?: boolean;
  debug?: boolean;
  profile?: string;
}

export async function runInitCommand(
  args: InitCommandArgs = {},
  context?: AiTestsCliContext
): Promise<InitTestsOutput> {
  const { services, stdout } = resolveContext(context);
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

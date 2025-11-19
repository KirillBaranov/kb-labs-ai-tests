import type { RunTestsInput, RunTestsOutput } from '../../../application/index.js';
import { runTests } from '../../../application/index.js';
import type { AiTestsCliContext } from '../../context.js';
import { resolveContext } from '../../context.js';
import { logCliInvocation } from '../../utils.js';

export interface RunCommandArgs extends RunTestsInput {
  json?: boolean;
  debug?: boolean;
  profile?: string;
}

export async function runRunCommand(
  args: RunCommandArgs = {},
  context?: AiTestsCliContext
): Promise<RunTestsOutput> {
  const { services, stdout } = resolveContext(context);
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

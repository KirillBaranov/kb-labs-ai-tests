import type { RepairTestsInput, RepairTestsOutput } from '../../../application/index.js';
import { repairTests } from '../../../application/index.js';
import type { AiTestsCliContext } from '../../context.js';
import { resolveContext } from '../../context.js';
import { logCliInvocation } from '../../utils.js';

export interface RepairCommandArgs extends RepairTestsInput {
  json?: boolean;
  debug?: boolean;
  profile?: string;
}

export async function runRepairCommand(
  args: RepairCommandArgs = {},
  context?: AiTestsCliContext
): Promise<RepairTestsOutput> {
  const { services, stdout } = resolveContext(context);
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

import type { AuditTestsInput, AuditTestsOutput } from '../../../application/index.js';
import { auditTests } from '../../../application/index.js';
import type { AiTestsCliContext } from '../../context.js';
import { resolveContext } from '../../context.js';
import { logCliInvocation } from '../../utils.js';

export interface AuditCommandArgs extends AuditTestsInput {
  json?: boolean;
  debug?: boolean;
  profile?: string;
}

export async function runAuditCommand(
  args: AuditCommandArgs = {},
  context?: AiTestsCliContext
): Promise<AuditTestsOutput> {
  const { services, stdout } = resolveContext(context);
  const { json, debug, profile, ...rest } = args;

  logCliInvocation(services.logger, 'ai-tests:audit', {
    debug,
    profile,
    meta: { dryRun: Boolean(rest.dryRun) }
  });

  const result = await auditTests(rest, services);
  const profileLabel = profile ?? 'default';

  if (json) {
    stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    stdout.write(
      [
        'AI Tests audit summary 📊',
        `- profile: ${profileLabel}`,
        `- report: ${result.reportPath}`,
        `- score: ${result.score}`,
        `- ${result.summary}`
      ].join('\n') + '\n'
    );
  }

  return result;
}

import { defineCommand, type CommandResult } from '@kb-labs/cli-command-kit';
import type { AuditTestsInput, AuditTestsOutput } from '../../../application/index.js';
import { auditTests } from '../../../application/index.js';
import { createCliServices, type AiTestsCliContext } from '../../context.js';
import { logCliInvocation } from '../../utils.js';

export interface AuditCommandArgs extends AuditTestsInput {
  json?: boolean;
  debug?: boolean;
  profile?: string;
}

type AiTestsAuditFlags = {
  'include-plan': { type: 'boolean'; description?: string; default?: boolean };
  'include-runs': { type: 'boolean'; description?: string; default?: boolean };
  'dry-run': { type: 'boolean'; description?: string; default?: boolean };
  profile: { type: 'string'; description?: string };
  debug: { type: 'boolean'; description?: string; default?: boolean };
  json: { type: 'boolean'; description?: string; default?: boolean };
};

type AiTestsAuditResult = CommandResult & {
  result?: AuditTestsOutput;
};

export const run = defineCommand<AiTestsAuditFlags, AiTestsAuditResult>({
  name: 'ai-tests:audit',
  flags: {
    'include-plan': {
      type: 'boolean',
      description: 'Include plan insights (default true).',
      default: true,
    },
    'include-runs': {
      type: 'boolean',
      description: 'Include last run summary (default true).',
      default: true,
    },
    'dry-run': {
      type: 'boolean',
      description: 'Skip writing audit artifact, print summary only.',
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
      includePlan: flags['include-plan'],
      includeRuns: flags['include-runs'],
      dryRun: flags['dry-run'],
      json: flags.json,
      debug: flags.debug,
      profile: flags.profile,
    };

    logCliInvocation(services.logger, 'ai-tests:audit', {
      debug,
      profile,
      meta: { dryRun: Boolean(rest.dryRun) }
    });

    ctx.tracker.checkpoint('audit');

    const result = await auditTests(rest, services);
    const profileLabel = profile ?? 'default';

    ctx.tracker.checkpoint('complete');

    if (json) {
      ctx.output?.json(result);
    } else {
      ctx.output?.write(
        [
          'AI Tests audit summary 📊',
          `- profile: ${profileLabel}`,
          `- report: ${result.reportPath}`,
          `- score: ${result.score}`,
          `- ${result.summary}`
        ].join('\n') + '\n'
      );
    }

    return { ok: true, result };
  },
});

export async function runAuditCommand(
  args: AuditCommandArgs = {},
  context?: AiTestsCliContext
): Promise<AuditTestsOutput> {
  const { services, stdout } = context ?? { services: createCliServices(), stdout: process.stdout };
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

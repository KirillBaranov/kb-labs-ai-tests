import type { Logger } from '../infra/adapters/logger.js';

interface LogOptions {
  debug?: boolean;
  profile?: string;
  meta?: Record<string, unknown>;
}

export function logCliInvocation(
  logger: Logger,
  commandId: string,
  { debug, profile, meta }: LogOptions
): void {
  if (!debug) {
    return;
  }

  logger.log('debug', `Invoking ${commandId}`, {
    profile: profile ?? 'default',
    ...meta
  });
}

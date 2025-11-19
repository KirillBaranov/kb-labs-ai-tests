import type { AiTestsApplicationServices } from '../application/types.js';
import { createCliServices } from '../infra/services.js';

export interface AiTestsCliContext {
  services?: AiTestsApplicationServices;
  stdout?: NodeJS.WritableStream;
}

export function resolveContext(context: AiTestsCliContext = {}): Required<AiTestsCliContext> {
  return {
    stdout: context.stdout ?? process.stdout,
    services: context.services ?? createCliServices()
  };
}


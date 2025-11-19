import type { RunTestsInput, AiTestsApplicationServices } from '../application/index.js';
import { runTests } from '../application/index.js';

export interface RunWorkflowContext {
  services: AiTestsApplicationServices;
}

export async function runRunWorkflow(input: RunTestsInput, ctx: RunWorkflowContext): Promise<void> {
  if (!ctx.services) {
    throw new Error('runRunWorkflow requires application services');
  }

  await runTests(input, ctx.services);
}


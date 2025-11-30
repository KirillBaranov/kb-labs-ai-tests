import type { GenerateTestsInput, AiTestsApplicationServices } from '../application/index';
import { generateTests } from '../application/index';

export interface GenerateWorkflowContext {
  services: AiTestsApplicationServices;
}

export async function runGenerateWorkflow(input: GenerateTestsInput, ctx: GenerateWorkflowContext): Promise<void> {
  if (!ctx.services) {
    throw new Error('runGenerateWorkflow requires application services');
  }

  await generateTests(input, ctx.services);
}


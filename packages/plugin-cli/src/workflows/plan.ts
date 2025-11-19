import type { PlanTestsInput, AiTestsApplicationServices } from '../application/index.js';
import { planTests } from '../application/index.js';

export interface PlanWorkflowContext {
  services: AiTestsApplicationServices;
}

export async function runPlanWorkflow(input: PlanTestsInput, ctx: PlanWorkflowContext): Promise<void> {
  if (!ctx.services) {
    throw new Error('runPlanWorkflow requires application services');
  }

  await planTests(input, ctx.services);
}


import type { RepairTestsInput, AiTestsApplicationServices } from '../application/index.js';
import { repairTests } from '../application/index.js';

export interface RepairWorkflowContext {
  services: AiTestsApplicationServices;
}

export async function runRepairWorkflow(input: RepairTestsInput, ctx: RepairWorkflowContext): Promise<void> {
  if (!ctx.services) {
    throw new Error('runRepairWorkflow requires application services');
  }

  await repairTests(input, ctx.services);
}


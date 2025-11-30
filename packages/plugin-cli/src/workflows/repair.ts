import type { RepairTestsInput, AiTestsApplicationServices } from '../application/index';
import { repairTests } from '../application/index';

export interface RepairWorkflowContext {
  services: AiTestsApplicationServices;
}

export async function runRepairWorkflow(input: RepairTestsInput, ctx: RepairWorkflowContext): Promise<void> {
  if (!ctx.services) {
    throw new Error('runRepairWorkflow requires application services');
  }

  await repairTests(input, ctx.services);
}


import type { AuditTestsInput, AuditTestsOutput, AiTestsApplicationServices } from '../types.js';

function computeScore(params: { planExists: boolean; runStatus?: string; iterations: number }): number {
  let score = 40;
  if (params.planExists) {
    score += 30;
  }
  if (params.runStatus === 'success') {
    score += 20;
  }
  if (params.iterations > 0) {
    score += 10;
  }
  return Math.min(score, 100);
}

export async function auditTests(
  input: AuditTestsInput,
  services: AiTestsApplicationServices
): Promise<AuditTestsOutput> {
  const plan = input.includePlan === false ? undefined : await services.workspace.readPlanArtifact();
  const run = input.includeRuns === false ? undefined : await services.workspace.readRunArtifact();
  const iterations = await services.workspace.readIterations();

  const score = computeScore({
    planExists: Boolean(plan),
    runStatus: run?.status,
    iterations: iterations.length
  });

  const markdown = [
    '# AI Tests Audit Report',
    '',
    `- Plan: ${plan ? 'available' : 'missing'}`,
    `- Last run status: ${run?.status ?? 'n/a'}`,
    `- Iterations logged: ${iterations.length}`,
    `- Score: ${score}`
  ].join('\n');

  const reportPath = input.dryRun ? 'dry-run' : await services.workspace.writeAudit(markdown);

  return {
    reportPath,
    score,
    summary: `Plan=${Boolean(plan)} · Run=${run?.status ?? 'n/a'} · Score=${score}`
  };
}

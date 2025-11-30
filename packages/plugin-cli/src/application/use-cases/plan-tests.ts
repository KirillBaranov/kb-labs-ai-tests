import type { PlanTestsInput, PlanTestsOutput, AiTestsApplicationServices } from '../types';
import { AiTestsConfigModel } from '../../domain/config';
import { TestPlan } from '../../domain/plan';
import type { TestPlanTarget, TestPriority, TestKind } from '@kb-labs/ai-tests-contracts';

function inferPriority(filePath: string): TestPriority {
  if (filePath.includes('/core/') || filePath.includes('/domain/')) {
    return 'critical';
  }
  if (filePath.includes('/infra/') || filePath.includes('/services/')) {
    return 'important';
  }
  return 'nice-to-have';
}

function inferTestKind(filePath: string): TestKind {
  return filePath.includes('/infra/') || filePath.includes('/integration/') ? 'integration' : 'unit';
}

export async function planTests(
  input: PlanTestsInput,
  services: AiTestsApplicationServices
): Promise<PlanTestsOutput> {
  const config = AiTestsConfigModel.from(await services.configStore.read());
  const sourcesGlobs = input.sources ?? config.sources;
  const sourceFiles = await services.workspace.globSources(sourcesGlobs);

  const detections = await services.workspace.detectTestsForSources(sourceFiles, config.testsDir);

  const targets: TestPlanTarget[] = sourceFiles.map((path) => {
    const detection = detections[path];
    const hasTests = detection?.hasSiblingTest || detection?.hasDedicatedTest;
    const coverageStatus = hasTests ? 'ok' : 'not_covered';
    const coverageEstimate = hasTests ? 1 : 0;

    return {
      path,
      displayName: path.split(/[\\/]/).slice(-2).join('/'),
      moduleName: path.replace(/\.[^.]+$/, ''),
      testType: inferTestKind(path),
      priority: inferPriority(path),
      coverageStatus,
      coverageEstimate,
      hasExistingTests: hasTests,
      tags: hasTests ? ['covered'] : ['needs-tests'],
      notes: hasTests ? undefined : ['Generated via heuristic plan']
    };
  });

  const plan = TestPlan.empty(sourcesGlobs).updateTargets(targets).toJSON();
  let planPath = 'stdout';

  if (!input.dryRun) {
    planPath = await services.workspace.writePlanArtifact(plan);
  }

  services.logger.log('info', `Planning complete for ${targets.length} targets`, {
    planPath,
    uncovered: plan.summary.notCovered
  });

  return {
    planPath,
    summary: plan.summary,
    totalTargets: plan.summary.totalTargets,
    notCovered: plan.summary.notCovered
  };
}


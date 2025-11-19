import type {
  AiTestsPlanArtifact,
  TestGenerationResult,
  TestPlanSummary,
  TestPlanTarget
} from '@kb-labs/ai-tests-contracts';

const EXISTING_TEST_WARNING = 'Detected existing test file. Writing will be treated as needs-review.';

export interface GenerationSafetySplit {
  safeToWrite: TestGenerationResult[];
  requiresReview: TestGenerationResult[];
}

export class TestPlan {
  constructor(private readonly payload: AiTestsPlanArtifact) {}

  static empty(sources: string[]): TestPlan {
    return new TestPlan({
      generatedAt: new Date().toISOString(),
      sources,
      targets: [],
      summary: {
        totalTargets: 0,
        notCovered: 0,
        partial: 0,
        ok: 0
      }
    });
  }

  static fromArtifact(artifact: AiTestsPlanArtifact): TestPlan {
    return new TestPlan(artifact);
  }

  get targets(): TestPlanTarget[] {
    return this.payload.targets;
  }

  summary(): TestPlanSummary {
    return this.payload.summary;
  }

  isEmpty(): boolean {
    return this.payload.summary.totalTargets === 0;
  }

  uncoveredCount(): number {
    return this.payload.summary.notCovered + this.payload.summary.partial;
  }

  needsGeneration(limit?: string[]): TestPlanTarget[] {
    const requested = limit?.length ? new Set(limit.map((item) => item.trim())) : undefined;

    return this.targets.filter((target) => {
      const status = target.coverageStatus;
      const needs =
        status === 'not_covered' || (status === 'partial' && target.priority !== 'nice-to-have');
      if (!needs) {
        return false;
      }
      if (!requested) {
        return true;
      }
      return requested.has(target.path) || (target.displayName ? requested.has(target.displayName) : false);
    });
  }

  classifyGeneration(
    results: TestGenerationResult[],
    existingFiles: Set<string>
  ): GenerationSafetySplit {
    return results.reduce<GenerationSafetySplit>(
      (acc, result) => {
        const hasWarnings = Boolean(result.warnings && result.warnings.length);
        const collides = existingFiles.has(result.outputPath);

        if (collides) {
          acc.requiresReview.push(this.flagForReview(result, EXISTING_TEST_WARNING));
          return acc;
        }

        if (hasWarnings || result.needsReview) {
          acc.requiresReview.push(this.flagForReview(result));
          return acc;
        }

        acc.safeToWrite.push(result);
        return acc;
      },
      { safeToWrite: [], requiresReview: [] }
    );
  }

  private flagForReview(
    result: TestGenerationResult,
    warning: string = 'LLM marked this suggestion as low-confidence.'
  ): TestGenerationResult {
    const warnings = Array.from(new Set([...(result.warnings ?? []), warning]));
    return {
      ...result,
      needsReview: true,
      warnings
    };
  }

  updateTargets(next: TestPlanTarget[]): TestPlan {
    const targetMap = new Map<string, TestPlanTarget>();
    this.payload.targets.forEach((target) => targetMap.set(target.path, target));
    next.forEach((target) => targetMap.set(target.path, target));

    const targets = Array.from(targetMap.values());
    const summary = summariseTargets(targets);
    return new TestPlan({
      ...this.payload,
      targets,
      summary,
      generatedAt: new Date().toISOString()
    });
  }

  toJSON(): AiTestsPlanArtifact {
    return this.payload;
  }
}

function summariseTargets(targets: TestPlanTarget[]): TestPlanSummary {
  const summary: TestPlanSummary = {
    totalTargets: targets.length,
    notCovered: 0,
    partial: 0,
    ok: 0
  };

  targets.forEach((target) => {
    switch (target.coverageStatus) {
      case 'not_covered':
        summary.notCovered += 1;
        break;
      case 'partial':
        summary.partial += 1;
        break;
      case 'ok':
        summary.ok += 1;
        break;
      default:
        break;
    }
  });

  return summary;
}


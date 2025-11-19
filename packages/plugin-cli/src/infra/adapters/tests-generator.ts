import type { TestGenerationRequest, TestGenerationResult } from '@kb-labs/ai-tests-contracts';
import type { MindTestContext, TestsGenerator } from '../../application/types.js';

function buildBlocks(
  request: TestGenerationRequest,
  context: MindTestContext,
  mode: 'generate' | 'repair'
): TestGenerationResult['blocks'] {
  const title =
    mode === 'generate'
      ? `should ${request.testType === 'integration' ? 'exercise integration scenario' : 'cover core logic'}`
      : 'should address failing assertion';

  const code = `import { describe, it, expect } from 'vitest';
import { target } from '${request.filePath.replace(/\.(ts|tsx|js|jsx)$/, '')}';

describe('${request.filePath}', () => {
  it('${title}', () => {
    // Context: ${context.summary}
    expect(target()).toBeDefined();
  });
});`;

  return [
    {
      title,
      code,
      reason: context.summary
    }
  ];
}

function buildResult(
  request: TestGenerationRequest,
  context: MindTestContext,
  outputPath: string,
  mode: 'generate' | 'repair'
): TestGenerationResult {
  return {
    request,
    outputPath,
    blocks: buildBlocks(request, context, mode),
    needsReview: mode === 'repair',
    warnings: mode === 'repair' ? ['Verify fix manually before committing.'] : undefined,
    durationMs: 50
  };
}

export function createMockTestsGenerator(): TestsGenerator {
  return {
    async generate(request) {
      return buildResult(request, request.context, request.outputPath, 'generate');
    },
    async repair(request) {
      const generationRequest: TestGenerationRequest = {
        filePath: request.filePath,
        testType: 'unit',
        priority: 'critical',
        strategy: 'repair-loop'
      };
      return buildResult(generationRequest, request.context, request.outputPath, 'repair');
    }
  };
}


import type { MindTestClient } from '../../application/types.js';

function createSummary(path: string): string {
  const segments = path.split(/[\\/]/).slice(-2).join('/');
  return `Auto-generated summary for ${segments}`;
}

export function createMockMindClient(): MindTestClient {
  return {
    async fetchContext(request) {
      return {
        summary: createSummary(request.path),
        relatedAdrs: ['ADR-001-test-strategy', 'ADR-002-quality-gates'],
        examples: ['Example: ensure function handles null inputs.', 'Example: snapshot critical errors.']
      };
    }
  };
}


import { describe, expect, it } from 'vitest';
import { handleStatus } from '../../src/rest/handlers/status-handler';

describe('handleStatus', () => {
  it('returns default artifact metadata when called without args', async () => {
    const response = await handleStatus({});
    expect(response.requestedProfile).toBe('default');
    expect(response.artifacts.plan).toContain('ai-tests.plan.json');
    expect(response.status).toBe('idle');
  });

  it('honours custom profile', async () => {
    const response = await handleStatus({ profile: 'backend' });
    expect(response.requestedProfile).toBe('backend');
  });
});


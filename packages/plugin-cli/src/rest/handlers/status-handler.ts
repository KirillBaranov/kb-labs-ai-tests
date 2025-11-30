import {
  ITERATIONS_ARTIFACT_PATH,
  PLAN_ARTIFACT_PATH,
  RUN_ARTIFACT_PATH
} from '../../shared/constants';
import {
  StatusRequestSchema,
  StatusResponseSchema,
  type StatusRequest
} from '../schemas/status-schema';

interface HandlerContext {
  requestId?: string;
  runtime?: {
    log?: (level: 'debug' | 'info' | 'warn' | 'error', message: string, meta?: Record<string, unknown>) => void;
  };
}

export async function handleStatus(input: unknown, ctx: HandlerContext = {}) {
  const parsed: StatusRequest = StatusRequestSchema.parse((input ?? {}) as Partial<StatusRequest>);
  const requestedProfile = parsed.profile ?? 'default';

  const response = {
    status: 'idle' as const,
    requestedProfile,
    summary: 'AI Tests plugin is ready to plan, generate, run, and repair test suites.',
    artifacts: {
      plan: PLAN_ARTIFACT_PATH,
      run: RUN_ARTIFACT_PATH,
      iterations: ITERATIONS_ARTIFACT_PATH
    }
  };

  ctx.runtime?.log?.('info', 'ai-tests REST status invoked', {
    requestId: ctx.requestId,
    profile: requestedProfile,
    produces: [PLAN_ARTIFACT_PATH, RUN_ARTIFACT_PATH, ITERATIONS_ARTIFACT_PATH]
  });

  return StatusResponseSchema.parse(response);
}


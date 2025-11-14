import { pluginContractsManifest } from '@kb-labs/plugin-template-contracts';
import { createGreetingUseCase } from '../../application/index.js';
import type { HelloRequest } from '../schemas/hello-schema.js';
import { HelloRequestSchema, HelloResponseSchema } from '../schemas/hello-schema.js';

const HELLO_GREETING_ARTIFACT_ID =
  pluginContractsManifest.artifacts['template.hello.greeting']?.id ?? 'template.hello.greeting';

interface HandlerContext {
  requestId?: string;
  runtime?: {
    log?: (level: 'debug' | 'info' | 'warn' | 'error', message: string, meta?: Record<string, unknown>) => void;
  };
}

export async function handleHello(input: unknown, ctx: HandlerContext = {}) {
  const parsed = HelloRequestSchema.parse((input ?? {}) as Partial<HelloRequest>);

  const greeting = createGreetingUseCase({ name: parsed.name });

  ctx.runtime?.log?.('info', 'Hello REST endpoint executed', {
    requestId: ctx.requestId,
    target: greeting.target,
    produces: [HELLO_GREETING_ARTIFACT_ID]
  });

  const response = { message: greeting.message, target: greeting.target };
  return HelloResponseSchema.parse(response);
}



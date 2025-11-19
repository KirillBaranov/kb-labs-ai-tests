import { z } from 'zod';
import { schemaReferenceSchema } from './api.schema.js';

export const workflowEventSchema = z.object({
  id: z.string().min(1),
  description: z.string().optional(),
  payload: schemaReferenceSchema.optional(),
  level: z.enum(['info', 'success', 'warning', 'error']).optional()
});

export const workflowStepSchema = z.object({
  id: z.string().min(1),
  description: z.string().optional(),
  commandId: z.string().min(1).optional(),
  consumes: z.array(z.string().min(1)).optional(),
  produces: z.array(z.string().min(1)).optional(),
  events: z.array(workflowEventSchema).optional()
});

export const workflowContractSchema = z.object({
  id: z.string().min(1),
  description: z.string().optional(),
  consumes: z.array(z.string().min(1)).optional(),
  produces: z.array(z.string().min(1)).optional(),
  steps: z.array(workflowStepSchema).optional()
});

export const workflowContractMapSchema = z.record(workflowContractSchema);


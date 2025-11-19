import { z } from 'zod';

export const StatusRequestSchema = z.object({
  profile: z.string().min(1).optional()
});

export type StatusRequest = z.infer<typeof StatusRequestSchema>;

export const StatusResponseSchema = z.object({
  status: z.enum(['idle', 'running', 'repairing']),
  requestedProfile: z.string(),
  summary: z.string(),
  artifacts: z.object({
    plan: z.string().optional(),
    run: z.string().optional(),
    iterations: z.string().optional()
  })
});

export type StatusResponse = z.infer<typeof StatusResponseSchema>;


import { z } from 'zod';
import {
  AiTestsStrategySchema,
  IterationRecordSchema,
  TestGenerationResultSchema,
  TestPlanSummarySchema,
  TestRunResultSchema
} from './artifacts.schema';
import { schemaReferenceSchema } from './api.schema';

export const InitCommandInputSchema = z.object({
  testsDir: z.string().optional(),
  dryRun: z.boolean().optional()
});

export const InitCommandOutputSchema = z.object({
  testsDir: z.string(),
  configUpdated: z.boolean(),
  created: z.array(z.string()).default([]),
  skipped: z.array(z.string()).default([]),
  summary: z.string()
});

export const PlanCommandInputSchema = z.object({
  sources: z.array(z.string()).optional(),
  dryRun: z.boolean().optional()
});

export const PlanCommandOutputSchema = z.object({
  planPath: z.string(),
  summary: TestPlanSummarySchema,
  totalTargets: z.number().int().nonnegative(),
  notCovered: z.number().int().nonnegative()
});

export const GenerateCommandInputSchema = z.object({
  targets: z.array(z.string()).optional(),
  dryRun: z.boolean().optional(),
  strategy: AiTestsStrategySchema.optional()
});

export const GenerateCommandOutputSchema = z.object({
  generated: z.array(TestGenerationResultSchema),
  artifacts: z.array(z.string()),
  summary: z.string()
});

export const RunCommandInputSchema = z.object({
  dryRun: z.boolean().optional()
});

export const RunCommandOutputSchema = z.object({
  runPath: z.string(),
  logPath: z.string(),
  result: TestRunResultSchema
});

export const RepairCommandInputSchema = z.object({
  dryRun: z.boolean().optional(),
  maxAttempts: z.number().int().positive().optional()
});

export const RepairCommandOutputSchema = z.object({
  iteration: IterationRecordSchema,
  maxAttemptsReached: z.boolean()
});

export const AuditCommandInputSchema = z.object({
  includePlan: z.boolean().optional(),
  includeRuns: z.boolean().optional(),
  dryRun: z.boolean().optional()
});

export const AuditCommandOutputSchema = z.object({
  reportPath: z.string(),
  score: z.number().min(0).max(100),
  summary: z.string()
});

export const commandContractSchema = z.object({
  id: z.string().min(1),
  description: z.string().optional(),
  input: schemaReferenceSchema.optional(),
  output: schemaReferenceSchema.optional(),
  produces: z.array(z.string().min(1)).optional(),
  consumes: z.array(z.string().min(1)).optional(),
  examples: z.array(z.string().min(1)).optional()
});

export const commandContractMapSchema = z.record(commandContractSchema);

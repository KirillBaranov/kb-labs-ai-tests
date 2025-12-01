import type { SchemaReference } from './api';

export interface WorkflowEventContract {
  id: string;
  description?: string;
  payload?: SchemaReference;
  level?: 'info' | 'success' | 'warning' | 'error';
}

export interface WorkflowStepContract {
  id: string;
  description?: string;
  commandId?: string;
  consumes?: string[];
  produces?: string[];
  events?: WorkflowEventContract[];
}

export interface WorkflowContract {
  id: string;
  description?: string;
  consumes?: string[];
  produces?: string[];
  steps?: WorkflowStepContract[];
}

export type WorkflowContractsMap = Record<string, WorkflowContract>;


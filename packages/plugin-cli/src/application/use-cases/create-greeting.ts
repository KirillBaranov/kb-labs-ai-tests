import { createGreeting } from '../../domain/index.js';
import { DEFAULT_GREETING_TARGET } from '../../shared/index.js';

export interface CreateGreetingInput {
  name?: string;
  message?: string;
}

export function createGreetingUseCase(input: CreateGreetingInput = {}) {
  const target = input.name?.trim() || DEFAULT_GREETING_TARGET;
  const message = input.message ?? `Hello, ${target}!`;

  return createGreeting(target, message);
}



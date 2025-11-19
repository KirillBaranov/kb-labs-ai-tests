import { promises as fs } from 'node:fs';
import path from 'node:path';
import { KB_CONFIG_FILE } from '../../shared/constants.js';
import type { AiTestsConfigStore } from '../../application/types.js';

interface RawKbConfig {
  aiTests?: unknown;
  [key: string]: unknown;
}

async function readJsonFile<T>(filePath: string): Promise<T | undefined> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

export function createConfigStore(rootDir = process.cwd()): AiTestsConfigStore {
  const configPath = path.resolve(rootDir, KB_CONFIG_FILE);

  async function readRaw(): Promise<RawKbConfig> {
    return (await readJsonFile<RawKbConfig>(configPath)) ?? {};
  }

  return {
    async read() {
      const raw = await readRaw();
      return raw.aiTests as Record<string, unknown> | undefined;
    }
  };
}

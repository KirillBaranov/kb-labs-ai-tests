#!/usr/bin/env node
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '../../packages/plugin-cli/dist');
const entryPath = path.join(distDir, 'cli/commands/plan/run.js');

async function ensureBundle() {
  try {
    await access(entryPath, constants.R_OK);
  } catch {
    console.error('Build artifacts missing. Run `pnpm --filter @kb-labs/ai-tests-plugin run build` first.');
    process.exit(1);
  }
}

async function main() {
  await ensureBundle();

  const [, , ...args] = process.argv;
  const json = args.includes('--json');
  const sourcesFlagIndex = args.findIndex((arg) => arg === '--sources');
  const sources = sourcesFlagIndex >= 0 ? args[sourcesFlagIndex + 1] : undefined;

  const moduleUrl = pathToFileURL(entryPath).href;
  const { runPlanCommand } = await import(moduleUrl);
  const result = await runPlanCommand({ sources: sources?.split(','), json });

  console.info('\nReturned payload:', result);
}

main().catch((err) => {
  console.error('CLI sandbox failed', err);
  process.exit(1);
});



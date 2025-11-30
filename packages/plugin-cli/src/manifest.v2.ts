import { createManifestV2 } from '@kb-labs/plugin-manifest';
import { pluginContractsManifest } from '@kb-labs/ai-tests-contracts';

/**
 * Level 2: Типизация через contracts для автодополнения и проверки ID
 */
import {
  PLAN_ARTIFACT_PATH,
  RUN_ARTIFACT_PATH,
  ITERATIONS_ARTIFACT_PATH,
  METADATA_ARTIFACT_PATH,
  AUDIT_ARTIFACT_PATH,
  LOGS_DIR,
  AI_TESTS_PLUGIN_ID
} from './shared/constants';

const schemaRef = (fragment: string) => ({
  zod: `@kb-labs/ai-tests-contracts/schema#${fragment}`
});

export const manifest = createManifestV2<typeof pluginContractsManifest>({
  schema: 'kb.plugin/2',
  id: AI_TESTS_PLUGIN_ID,
  version: '0.0.1',
  display: {
    name: 'KB Labs AI Tests',
    description: 'Plan, generate, run, repair, and audit automated tests with KB Mind context.',
    tags: ['tests', 'ai', 'workflow']
  },
  cli: {
    commands: [
      {
        id: 'init',
        group: 'ai-tests',
        describe: 'Create aiTests config section and scaffold tests directory.',
        handler: './cli/commands/init/run#runInitCommand',
        flags: [
          { name: 'tests-dir', type: 'string', description: 'Custom tests directory path.' },
          { name: 'dry-run', type: 'boolean', description: 'Preview actions without filesystem writes.' },
          { name: 'profile', type: 'string', description: 'Label run with a logical profile (e.g. backend).' },
          { name: 'debug', type: 'boolean', description: 'Enable verbose logger output.' },
          { name: 'json', type: 'boolean', description: 'Emit JSON output.' }
        ]
      },
      {
        id: 'plan',
        group: 'ai-tests',
        describe: 'Analyse source globs and emit plan artifact.',
        handler: './cli/commands/plan/run#runPlanCommand',
        flags: [
          { name: 'sources', type: 'string', description: 'Comma-separated globs overriding config.' },
          { name: 'dry-run', type: 'boolean', description: 'Preview plan without writing artifact.' },
          { name: 'profile', type: 'string', description: 'Label run with a logical profile.' },
          { name: 'debug', type: 'boolean', description: 'Enable verbose logger output.' },
          { name: 'json', type: 'boolean', description: 'Emit JSON output.' }
        ]
      },
      {
        id: 'generate',
        group: 'ai-tests',
        describe: 'Generate test suggestions for uncovered targets.',
        handler: './cli/commands/generate/run#runGenerateCommand',
        flags: [
          { name: 'targets', type: 'string', description: 'Comma-separated file paths to limit scope.' },
          {
            name: 'strategy',
            type: 'string',
            choices: ['suggest-only', 'write-and-run', 'repair-loop', 'llm-generate'],
            description: 'Override default generation strategy.'
          },
          { name: 'dry-run', type: 'boolean', description: 'Skip writing tests to disk.' },
          { name: 'profile', type: 'string', description: 'Label run with a logical profile.' },
          { name: 'debug', type: 'boolean', description: 'Enable verbose logger output.' },
          { name: 'json', type: 'boolean', description: 'Emit JSON output.' }
        ]
      },
      {
        id: 'run',
        group: 'ai-tests',
        describe: 'Execute configured test runner and capture artifacts.',
        handler: './cli/commands/run/run#runRunCommand',
        flags: [
          { name: 'dry-run', type: 'boolean', description: 'Skip executing runner, emit stub result.' },
          { name: 'profile', type: 'string', description: 'Label run with a logical profile.' },
          { name: 'debug', type: 'boolean', description: 'Enable verbose logger output.' },
          { name: 'json', type: 'boolean', description: 'Emit JSON output.' }
        ]
      },
      {
        id: 'repair',
        group: 'ai-tests',
        describe: 'Use LLM suggestions to repair failing tests.',
        handler: './cli/commands/repair/run#runRepairCommand',
        flags: [
          { name: 'max-attempts', type: 'number', description: 'Override max repair attempts.' },
          { name: 'dry-run', type: 'boolean', description: 'Skip runner re-execution.' },
          { name: 'profile', type: 'string', description: 'Label run with a logical profile.' },
          { name: 'debug', type: 'boolean', description: 'Enable verbose logger output.' },
          { name: 'json', type: 'boolean', description: 'Emit JSON output.' }
        ]
      },
      {
        id: 'audit',
        group: 'ai-tests',
        describe: 'Produce markdown summary combining plan, runs, and iterations.',
        handler: './cli/commands/audit/run#runAuditCommand',
        flags: [
          { name: 'include-plan', type: 'boolean', description: 'Include plan insights (default true).' },
          { name: 'include-runs', type: 'boolean', description: 'Include last run summary (default true).' },
          { name: 'dry-run', type: 'boolean', description: 'Skip writing audit artifact, print summary only.' },
          { name: 'profile', type: 'string', description: 'Label run with a logical profile.' },
          { name: 'debug', type: 'boolean', description: 'Enable verbose logger output.' },
          { name: 'json', type: 'boolean', description: 'Emit JSON output.' }
        ]
      }
    ]
  },
  rest: {
    basePath: '/v1/plugins/ai-tests',
    defaults: {
      timeoutMs: 120000
    },
    routes: [
      {
        method: 'GET',
        path: '/status',
        output: schemaRef('StatusResponseSchema'),
        handler: './rest/handlers/status-handler.js#handleStatus'
      }
    ]
  },
  studio: {
    widgets: [
      {
        id: 'ai-tests/status',
        kind: 'status',
        title: 'AI Tests Status',
        description: 'Plan coverage, last run, and repair attempts.',
        data: {
          source: { type: 'mock', fixtureId: 'ai-tests/status' }
        },
        component: './studio/widgets/status-widget.js#AiTestsStatusWidget'
      }
    ],
    menus: [],
    layouts: []
  },
  artifacts: [
    {
      id: 'ai-tests.plan.json',
      description: 'List of modules/files that require automated tests with coverage heuristics.',
      pathTemplate: PLAN_ARTIFACT_PATH,
      schemaRef: schemaRef('AiTestsPlanArtifactSchema')
    },
    {
      id: 'ai-tests.run.json',
      description: 'Aggregated result of the latest ai-tests:run execution.',
      pathTemplate: RUN_ARTIFACT_PATH,
      schemaRef: schemaRef('TestRunResultSchema')
    },
    {
      id: 'ai-tests.iterations.json',
      description: 'History of generate → run → repair attempts.',
      pathTemplate: ITERATIONS_ARTIFACT_PATH,
      schemaRef: schemaRef('IterationHistorySchema')
    },
    {
      id: 'ai-tests.metadata.json',
      description: 'Snapshot of configuration, runner mode, and strategy metadata.',
      pathTemplate: METADATA_ARTIFACT_PATH,
      schemaRef: schemaRef('AiTestsMetadataSchema')
    },
    {
      id: 'ai-tests.audit.md',
      description: 'Markdown summary generated by ai-tests:audit',
      pathTemplate: AUDIT_ARTIFACT_PATH
    },
    {
      id: 'ai-tests.log',
      description: 'Streaming log produced by ai-tests:run',
      pathTemplate: `${LOGS_DIR}/*.log`
    }
  ],
  permissions: {
    fs: {
      mode: 'readWrite',
      allow: ['tests/**', '.kb/artifacts/ai-tests/**', 'kb.config.json'],
      deny: ['**/*.key', '**/*.secret']
    },
    net: 'none',
    env: {
      allow: ['NODE_ENV', 'KB_AI_TESTS_VERSION']
    },
    quotas: {
      timeoutMs: 240000,
      memoryMb: 256,
      cpuMs: 10000
    },
    capabilities: []
  },
  setup: {
    handler: './setup/handler.js#run',
    describe: 'Provision AI Tests config defaults and artifact folders.',
    permissions: {
      fs: {
        mode: 'readWrite',
        allow: ['.kb/artifacts/ai-tests/**', 'tests/**', 'kb.config.json'],
        deny: ['.git/**']
      },
      net: 'none'
    }
  }
});

export default manifest;

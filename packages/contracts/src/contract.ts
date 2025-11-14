import type { PluginContracts } from './types.js';
import { contractsSchemaId, contractsVersion } from './version.js';

export const pluginContractsManifest: PluginContracts = {
  schema: contractsSchemaId,
  pluginId: '@kb-labs/plugin-template',
  contractsVersion,
  artifacts: {
    'template.hello.greeting': {
      id: 'template.hello.greeting',
      kind: 'json',
      description: 'Machine-readable greeting payload returned by the hello surfaces.',
      pathPattern: 'artifacts/template/hello/greeting.json',
      mediaType: 'application/json',
      schemaRef: '@kb-labs/plugin-template-contracts/schema#HelloGreeting',
      example: {
        summary: 'Greeting payload for anonymous user',
        payload: {
          message: 'Hello, World!',
          target: 'World'
        }
      }
    },
    'template.hello.log': {
      id: 'template.hello.log',
      kind: 'log',
      description: 'Execution log for hello command/workflow.',
      pathPattern: 'logs/template/hello/run.log',
      mediaType: 'text/plain'
    }
  },
  commands: {
    'template:hello': {
      id: 'template:hello',
      description: 'Produce a greeting message optionally targeting a provided name.',
      input: {
        ref: '@kb-labs/plugin-template-contracts/schema#HelloCommandInput',
        format: 'zod'
      },
      output: {
        ref: '@kb-labs/plugin-template-contracts/schema#HelloCommandOutput',
        format: 'zod'
      },
      produces: ['template.hello.greeting', 'template.hello.log'],
      examples: ['kb template hello', 'kb template hello --name Dev', 'kb template hello --json']
    }
  },
  workflows: {
    'template.workflow.hello': {
      id: 'template.workflow.hello',
      description: 'Single-step workflow executing the hello command and emitting greeting artifacts.',
      produces: ['template.hello.greeting', 'template.hello.log'],
      steps: [
        {
          id: 'template.workflow.hello.step.run-command',
          commandId: 'template:hello',
          produces: ['template.hello.greeting', 'template.hello.log']
        }
      ]
    }
  },
  api: {
    rest: {
      basePath: '/v1/plugins/template',
      routes: {
        'template.rest.hello': {
          id: 'template.rest.hello',
          method: 'GET',
          path: '/hello',
          description: 'Return a greeting payload from the REST surface.',
          response: {
            ref: '@kb-labs/plugin-template-contracts/schema#HelloCommandOutput',
            format: 'zod'
          },
          produces: ['template.hello.greeting']
        }
      }
    }
  }
};


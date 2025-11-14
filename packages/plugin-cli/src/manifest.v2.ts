import type { ManifestV2 } from '@kb-labs/plugin-manifest';

export const manifest: ManifestV2 = {
  schema: 'kb.plugin/2',
  id: '@kb-labs/plugin-template',
  version: '0.1.0',
  display: {
    name: 'Plugin Template',
    description: 'HelloWorld reference plugin demonstrating CLI, REST, and Studio surfaces.',
    tags: ['template', 'hello', 'sample']
  },
  cli: {
    commands: [
      {
        id: 'template:hello',
        group: 'template',
        describe: 'Print a hello message from the plugin template.',
        longDescription: 'Outputs a scoped greeting and optional target using shared formatting utilities.',
        flags: [
          {
            name: 'name',
            type: 'string',
            description: 'Name to greet.',
            alias: 'n'
          },
          {
            name: 'json',
            type: 'boolean',
            description: 'Emit JSON payload instead of formatted text.'
          }
        ],
        examples: [
          'kb template hello',
          'kb template hello --name Dev',
          'kb template hello --json'
        ],
        handler: './cli/commands/hello/run#runHelloCommand'
      }
    ]
  },
  rest: {
    basePath: '/v1/plugins/template',
    routes: [
      {
        method: 'GET',
        path: '/hello',
        input: {
          zod: './rest/schemas/hello-schema.js#HelloRequestSchema'
        },
        output: {
          zod: './rest/schemas/hello-schema.js#HelloResponseSchema'
        },
        handler: './rest/handlers/hello-handler.js#handleHello',
        permissions: {
          fs: {
            mode: 'read',
            allow: [],
            deny: ['**/*.key', '**/*.secret']
          },
          net: 'none',
          env: {
            allow: ['NODE_ENV']
          },
          quotas: {
            timeoutMs: 5000,
            memoryMb: 64,
            cpuMs: 2500
          },
          capabilities: []
        }
      }
    ]
  },
  studio: {
    widgets: [
      {
        id: 'template.hello',
        kind: 'card',
        title: 'Hello Template',
        description: 'Displays greeting output returned by the hello REST route.',
        data: {
          source: {
            type: 'rest',
            routeId: '/hello',
            method: 'GET'
          }
        },
        layoutHint: {
          w: 3,
          h: 2,
          minW: 2,
          minH: 2
        }
      }
    ],
    menus: [
      {
        id: 'template-hello',
        label: 'Template · Hello',
        target: '/plugins/template/hello',
        order: 0
      }
    ],
    layouts: [
      {
        id: 'template.dashboard',
        kind: 'grid',
        title: 'Template Dashboard',
        description: 'Starter layout that highlights the Hello widget.',
        config: {
          cols: {
            sm: 2,
            md: 4,
            lg: 6
          },
          rowHeight: 6
        }
      }
    ]
  },
  capabilities: [],
  permissions: {
    fs: {
      mode: 'read',
      allow: [],
      deny: ['**/*.key', '**/*.secret']
    },
    net: 'none',
    env: {
      allow: ['NODE_ENV']
    },
    quotas: {
      timeoutMs: 10000,
      memoryMb: 128,
      cpuMs: 5000
    },
    capabilities: []
  },
  artifacts: []
};

export default manifest;

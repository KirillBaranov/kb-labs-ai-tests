import { defineConfig } from 'tsup';
import nodePreset from '@kb-labs/devkit/tsup/node.js';

export default defineConfig({
  ...nodePreset,
  entry: [
    'src/index.ts',
    'src/manifest.v2.ts',
    'src/cli/commands/hello/run.ts',
    'src/rest/handlers/hello-handler.ts',
    'src/rest/schemas/hello-schema.ts',
    'src/studio/widgets/hello-widget.tsx'
  ],
  external: [
    '@kb-labs/plugin-manifest',
    '@kb-labs/shared-cli-ui',
    'react',
    'react-dom'
  ],
  dts: {
    resolve: true,
    skipLibCheck: true
  },
  esbuildOptions(options) {
    options.jsx = 'automatic';
    return options;
  }
});

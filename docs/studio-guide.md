# Studio Guide

Studio widgets present plugin data inside the KB Labs UI. This document explains how to add widgets, menus, and layouts.

## Directory layout

```
packages/plugin-cli/src/studio/
├── widgets/
│   ├── hello-widget.tsx
│   └── index.ts
└── index.ts
```

- **widgets/** – React components (or config objects) which render REST output.
- **index.ts** – re-exports for consumers that import widgets directly.

## Adding a widget

1. Create `src/studio/widgets/<name>-widget.tsx` exporting a React component.
2. Re-export the widget from `src/studio/widgets/index.ts` and `src/studio/index.ts` if library users should import it.
3. Add the widget file to the `entry` array in `tsup.config.ts` so it is bundled with declarations.
4. Update `src/manifest.v2.ts` `studio.widgets` with:
   - unique `id`
   - `kind`, `title`, `description`
   - `data.source` referencing the REST route (`type: 'rest', routeId, method`)
   - optional `layoutHint` and widget-specific options.
5. Add snapshot or render tests under `packages/plugin-cli/tests/studio/` if the widget contains logic.

## Menus and layouts

- Menus live under `studio.menus` in the manifest. They should point to `/plugins/<id>/<view>` routes rendered by Studio.
- Layouts define dashboard presets. Start with a `grid` layout specifying `cols` and `rowHeight`.

## Styling guidelines

- Keep styling inline or in small helper utilities to avoid large CSS dependencies.
- Prefer shared UI components from `@kb-labs/shared-cli-ui` when available.
- Widgets should remain presentational; fetch data via REST handlers and manifest wiring.

## Example widget

```tsx
export const HelloWidget: FC<HelloWidgetProps> = ({ message, target }) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
    <h2 style={{ margin: 0 }}>Hello from Plugin Template</h2>
    <p style={{ margin: 0 }}>{message}</p>
    {target ? <small style={{ color: '#666' }}>Target: {target}</small> : null}
  </section>
);
```

Tie this widget to `/v1/plugins/template/hello` via `data.source.routeId` and add it to a layout to expose it in Studio.



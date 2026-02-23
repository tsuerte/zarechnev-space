# Web Architecture

## UI Layering

This project uses a two-layer UI model:

1. `src/components/ui/*`  
   Base shadcn primitives and generated component source.
2. `src/ui-kit/*`  
   Public UI API for the app and all custom wrappers.

Application code must import UI only from `@/ui-kit`.

## Import Rules

- Allowed in app/features/pages/components:
  - `@/ui-kit`
- Disallowed in app/features/pages/components:
  - `@/components/ui/*`
- Allowed only inside:
  - `src/ui-kit/**/*`
  - `src/components/ui/**/*`

This is enforced by ESLint (`no-restricted-imports`) in `eslint.config.mjs`.

## How To Customize Components

When you need custom behavior or styling:

1. Keep `src/components/ui/*` as close to upstream shadcn as possible.
2. Add or update wrapper in `src/ui-kit/*`.
3. Re-export wrapper from `src/ui-kit/index.ts`.
4. Use only `@/ui-kit` in app code.

Example: `Separator` customization lives in `src/ui-kit/separator.tsx`.

## Update Workflow

After any UI changes:

1. `npm run lint`
2. `npm run build`

Before push:

1. `npm run check`


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

## Extending UI Kit

When `ui-kit` needs to grow, use semantic variants instead of page-specific logic.

- `src/ui-kit/*` must not know about concrete pages, routes, or pathnames.
- Allowed: semantic props like `appearance`, `size`, `tone`, `density`.
- Disallowed: page-specific props or conditions like `icons`, `avatars`, `cases`, `pathname`, `if page === ...`.
- Variant names must describe UI intent, not screen names.
  - Good: `appearance="toolbar"`, `appearance="segmented"`, `size="compact"`, `tone="quiet"`
  - Bad: `variant="icons"`, `variant="avatars"`
- Move styling or behavior into `ui-kit` only when it is repeated, reusable, or represents a stable UI pattern.
- One-off layout and composition tweaks may stay local in app/features/pages.
- Local code may control placement, spacing, wrappers, grid/flex layout, and composition of components.
- Local code must not redefine the visual or interactive behavior of a `ui-kit` component with component-level overrides.
- If a page needs custom `hover`, `active`, `selected`, `tone`, `radius`, `padding`, or other visual/stateful behavior for a `ui-kit` component, that behavior must either:
  1. be removed in favor of the upstream/default behavior, or
  2. be expressed as a semantic variant in `src/ui-kit/*`.
- App/features/pages may choose `ui-kit` variants, but should not rebuild component behavior with long visual overrides.

## Update Workflow

After any UI changes:

1. `npm run lint`
2. `npm run build`

Before push:

1. `npm run check`

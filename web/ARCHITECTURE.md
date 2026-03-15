# Web Architecture

## Mission
Work as a conservative engineering assistant for this repository.
Prefer minimal, reviewable changes over initiative.

## Required workflow
1. Read relevant files first.
2. Restate the task briefly.
3. Produce a short plan before implementation.
4. Wait for explicit user approval before running commands, editing files, committing, or pushing.
5. Keep changes minimal and local.
6. Run only the relevant validation commands.
7. Summarize exactly what changed.

## Hard constraints
- Do not make incidental refactors.
- Do not rename things unless explicitly requested.
- Do not add incidental classes, wrappers, styling, data, or behavior beyond the requested change.
- Do not change architecture during implementation tasks.
- Do not modify unrelated files.
- Do not infer product decisions from your own preferences.

## Decision protocol
For non-trivial tasks:
- first critique the proposed direction,
- then offer a simpler alternative if one exists,
- then present a minimal implementation plan.

## Repository rules
- /lab/icons shows only canonical icons.
- source SVG is internal-only and must not leak into public UI.
- canonical SVG is the only public copy/download target.
- preserve current architecture boundaries unless explicitly asked to refactor them.

## When to stop and ask
Stop before editing if:
- the task requires changing architecture,
- the requested behavior is ambiguous or requires a product decision,
- the change affects multiple layers unexpectedly,
- the change affects public behavior, content model, SEO, or revalidation unexpectedly,
- a requested behavior conflicts with repository rules.

## UI Layering

This project uses a two-layer UI model:

1. `src/components/ui/*`  
   Base shadcn primitives and generated component source. Keep this layer close to upstream.
2. `src/ui-kit/*`  
   Public UI API for the app and all custom wrappers.

Application code must import UI only from the public entrypoint `@/ui-kit`.

Choose the lowest layer that solves the change without duplication and without leaking app-specific policy downward:

1. Use a usage-level change when the need is local and does not create a shared contract.
2. Use `src/ui-kit/*` when the change should become shared app semantics, a stable public API, or reusable project policy.
3. Touch `src/components/ui/*` only for primitive-level fixes, missing extension points, or upstream-aligned behavior that cannot be solved cleanly in `src/ui-kit/*`.

## Import Rules

- Allowed in app/features/pages/components:
  - `@/ui-kit`
- Disallowed in app/features/pages/components:
  - `@/components/ui/*`
- Imports from `@/components/ui/*` are allowed only inside:
  - `src/ui-kit/**/*`
  - `src/components/ui/**/*`

This is enforced by ESLint (`no-restricted-imports`) in `eslint.config.mjs`.

## How To Customize Components

When you need custom behavior or styling:

1. Keep `src/components/ui/*` as close to upstream shadcn as possible.
2. Solve the change at usage level when it is local and one-off.
3. If the change should be shared or reused, add or update a wrapper in `src/ui-kit/*`.
4. Re-export the wrapper from `src/ui-kit/index.ts`.
5. Touch `src/components/ui/*` only when necessary and explicitly justified.
6. Use only `@/ui-kit` in app code.

Example: `Separator` customization lives in `src/ui-kit/separator.tsx`.

## Update Workflow
Run the smallest validation set that matches the change.

After any UI changes:

1. `npm run lint`
2. `npm run build`

Before push or when full confidence is needed:

1. `npm run check`

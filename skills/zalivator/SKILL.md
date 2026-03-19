---
name: zalivator
description: Use when working on the /lab/zalivator feature in zarechnev-space, including the text-output generator domain, the /api/zalivator API, or the future Figma plugin integration direction.
---

# Zalivator

## Overview

Use this skill when a task touches `/lab/zalivator`, `web/src/lib/zalivator/*`, or the API contract that the future Figma plugin will consume.

Apply repo rules first:
- Read `AGENTS.md` before acting.
- Read `web/ARCHITECTURE.md` before acting.

## Source Of Truth

Current runtime files:
- `web/src/app/lab/zalivator/page.tsx`
- `web/src/app/api/zalivator/generate/route.ts`
- `web/src/app/api/zalivator/generators/route.ts`
- `web/src/lib/zalivator/types.ts`
- `web/src/lib/zalivator/metadata.ts`
- `web/src/lib/zalivator/options.ts`
- `web/src/lib/zalivator/registry.ts`
- `web/src/lib/zalivator/executor.ts`
- `web/src/lib/zalivator/generators/text/*`
- `web/src/components/zalivator/*`

Current tests:
- `web/tests/zalivator-generators.test.ts`
- `web/tests/zalivator-executor.test.ts`
- `web/tests/zalivator-route.test.ts`

## Product Direction

`Zalivator` is a text-output service for a future Figma plugin.

Important repo boundary:
- the plugin itself is not implemented in this repository
- this repository owns the generator service and the operator-facing web client only

The primary workflow is:
1. choose a data type
2. configure basic options
3. request `N` generated values
4. use those generated text values in the plugin to fill text layers

Important boundary:
- web UI chooses `quantity` manually
- the future plugin will derive `quantity` from the number of target text layers
- `Zalivator` itself only generates text values; it does not decide how plugin selection is traversed or applied

## Current v1 Scope

Implemented generators:
- `name`
- `mobilePhone`
- `email`

The current public response is text-first:
- `kind`
- `generator`
- `quantity`
- `unique`
- `values: string[]`

Do not add object-heavy payloads back into the main public response unless the product explicitly needs them.

## Discovery Contract

`GET /api/zalivator/generators` returns:
- `generateEndpoint`
- quantity min/max/presets
- generator metadata with:
  - `id`
  - `label`
  - `description`
  - `kind`
  - `supportsUnique`
  - `optionFields`

Use discovery metadata for web and future plugin configuration UIs.

## Current Option Rules

`name`
- `format: "full" | "surname-initials" | "name-surname" | "name-only"`
- `gender: "any" | "male" | "female"`

`mobilePhone`
- `format: "pretty" | "plain"`

`email`
- `domain?: string`

Route and executor rules:
- non-object `options` must fail with `400`
- non-boolean `unique` must fail with `400`
- unknown option keys must fail fast
- bad enum/type values must fail fast
- `unique: true` means values must be unique within one batch by final text value
- if a unique batch cannot be assembled, executor must fail with a clear error

## Architecture Guardrails

- Keep generator logic in `web/src/lib/zalivator/*`, not in React.
- Keep the main API response centered on `values: string[]`.
- Keep each generator focused on one text domain.
- Do not mix plugin traversal logic into the service.
- Do not introduce `person/company` yet; keep only a clean seam for future presets.
- Prefer the simplest API that serves text insertion workflows.

## Future Direction

Later we may add presets like `Person` or `Company`.

When that happens:
- build them on top of smaller text generators
- do not let preset planning complicate the current `v1` text contract
- preserve the text-first plugin workflow

## Validation

- Add tests for every generator with non-trivial formatting.
- Keep route-level tests for request parsing and HTTP error mapping.
- Run `npm run test` and `npm run check` in `web` after meaningful changes.

## UI Guidance

- Treat `/lab/zalivator` as an operator-facing tool, not a demo page.
- Prefer a compact control panel on the left and a dedicated result workspace on the right.
- Prefer stock `ui-kit` control sizes and spacing over decorative local overrides.
- Keep generator and option selection close to standard `ToggleGroup` / `Input` / `Label` patterns unless a stronger reason exists.
- Keep result presentation centered on fast scanning and fast copying.
- Row-level copy actions are acceptable for text outputs; avoid reintroducing JSON-first result UX.

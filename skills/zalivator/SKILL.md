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
- `snils`
- `city`
- `organizationName`
- `inn`
- `kpp`
- `position`
- `uuidV7`
- `measurement`

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

`snils`
- no options in `v1`
- must return the usual formatted string with a valid control sum

`city`
- no options in `v1`
- can be generated from a fixed built-in list of Russian cities

`organizationName`
- no options in `v1`
- can return:
  - `ООО/АО/ПАО` with `«ёлочки»`
  - `ИП Фамилия Имя Отчество`
  - a short plain organization name without legal form

`inn`
- `kind: "physical" | "legal"`
- `legal` must return 10 digits with a valid control digit
- `physical` must return 12 digits with valid control digits

`kpp`
- no options in `v1`
- should be format-valid text only; do not invent a fake checksum model

`position`
- `domain: "any" | "it" | "fintech" | "construction" | "retail" | "logistics"`
- returns a job title from the selected domain

`measurement`
- `min: integer`
- `max: integer`
- `type: "length" | "weight" | "volume" | "temperature" | "speed" | "frequency" | "data" | "area" | "percent" | "custom"`
- `subtypes: string[]` for standard mode
- `customSubtypesText` is accepted at the route boundary and normalized into a cleaned deduplicated custom subtype list when `type = "custom"`
- standard mode uses built-in short RF-style unit labels
- custom type uses one subtype per line from textarea input
- empty custom subtype list falls back to a plain number without subtype
- percentages render without a space, e.g. `45%`
- all other subtypes render with a single space, e.g. `120 км/ч`

`uuidV7`
- no options in `v1`
- must return a canonical lowercase UUID v7 string compatible with RFC 9562
- uses a 48-bit Unix epoch timestamp in milliseconds in the leading bits
- must keep version bits set to `7`
- must keep RFC-compatible variant bits set to `10`
- must use `crypto.getRandomValues()`, not `Math.random()` or `crypto.randomUUID()`
- should remain lexicographically time-ordered for batch generation
- generated values must decode back to a plausible current Unix ms timestamp

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
- Prefer a three-column desktop layout:
  - left sidebar with all generator types visible at once
  - central settings panel for generator-specific and shared controls
  - right result workspace
- Keep the workspace visually plain and tool-like: avoid invented uppercase section headers, decorative shadows, and extra chrome that is not present in shadcn / Vercel / v0 patterns.
- Prefer stock shadcn control sizes and spacing over decorative local overrides.
- Keep usage-layer custom classes to page/layout composition only:
  - grid
  - gap between blocks
  - column width
  - section order
- Do not use usage-layer classes to redefine the visual model of an existing UI primitive or field pattern:
  - align-items behavior of a field row
  - internal rhythm of a control row
  - control row states
  - micro-spacing already handled by `Field`, `FieldGroup`, or `FieldContent`
- When building Zalivator settings UIs, prefer `Field`, `FieldGroup`, and `FieldContent` for control composition instead of hand-written `flex` wrappers.
- Treat `ui-kit` as the only shared project-level customization layer. If Zalivator needs shared UI behavior beyond stock shadcn, encode it there rather than in usage-layer or `components/ui`.
- Keep generator and option selection close to standard `ToggleGroup` / `Input` / `Label` patterns unless a stronger reason exists.
- Prefer `Select` over wrapped segmented controls when the choice list gets long or visually noisy.
- For generator-specific option UIs, metadata should stay expressive enough to drive `select`, `number`, `checkbox-group`, and `textarea` controls without hardcoding generator-specific React branches.
- Do not hide the generator list behind a dropdown when the desktop layout can show the full set inline.
- Prefer auto-generation in the web UI:
  - trigger immediately for discrete controls like list selections, toggles, selects, and checkboxes
  - debounce freeform text/number/textarea input
  - cancel stale in-flight requests
  - prefer no primary generate CTA when auto-run is stable
  - surface loading/error status in the result workspace instead of duplicating it in the settings column
- Keep result presentation centered on fast scanning and fast copying.
- Row-level copy actions are acceptable for text outputs; avoid reintroducing JSON-first result UX.

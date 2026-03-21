---
name: svg-optimizer
description: Use when working on the /lab/svg feature in zarechnev-space, including the SVG Optimizer UI, batch optimize API, canonical SVG pipeline, upload validation, paste flow, or SVG download/ZIP behavior.
---

# SVG Optimizer

## Overview

Use this skill when a task touches the `/lab/svg` tool, the SVG optimization flow, the batch upload API, or the canonical SVG pipeline shared by the optimizer and icons sync.

Apply the repo rules first:
- Read `AGENTS.md` before acting.
- Read `web/ARCHITECTURE.md` before acting.
- If the task touches shared UI controls or `ui-kit`, also read `skills/shadcn/SKILL.md`.

## Source Of Truth

Primary files:
- `web/src/app/lab/svg/page.tsx`
- `web/src/components/svg-optimizer.tsx`
- `web/src/components/svg-optimizer-batch.tsx`
- `web/src/app/api/svg/optimize-batch/route.ts`
- `web/src/lib/svg/client.ts`
- `web/src/lib/svg/optimize.ts`
- `web/src/lib/svg/pipeline.ts`
- `web/src/lib/svg/upload.ts`
- `web/src/lib/server/rate-limit.ts`
- `web/tests/svg-client.test.ts`
- `web/tests/svg-pipeline.test.ts`

## Current Feature Contract

- The page route is `/lab/svg`.
- User-facing naming is `SVG Optimizer`.
- The UI is a single unified flow. The old separate single-mode path is gone.
- One SVG file is treated as a special case of the batch flow.
- Paste support exists through global `Ctrl+V` handling and the in-flow paste action after files are selected.
- The public API route is `/api/svg/optimize-batch`.
- The optimizer accepts up to:
  - `10` files per request
  - `5 MB` per file
  - `20 MB` total batch size
- Batch results can partially fail. One invalid file must not fail the whole request.
- Multi-file ZIP naming must be deterministic:
  - first duplicate keeps `name.optimized.svg`
  - later duplicates become `name.optimized-2.svg`, `name.optimized-3.svg`, and so on

## Architecture And Data Flow

1. `page.tsx` renders the tool page and metadata.
2. `svg-optimizer.tsx` is a thin UI wrapper.
3. `svg-optimizer-batch.tsx` owns the client flow:
   - file selection
   - drag/drop
   - paste
   - preview state
   - copy/download actions
   - ZIP assembly for multi-file download
4. The client posts uploaded files to `/api/svg/optimize-batch`.
5. `route.ts` validates request size/count, rate-limits requests, optimizes each SVG, and returns structured JSON with per-file success/failure.
6. `optimize.ts` owns the single-document optimization contract:
   - normalize input
   - assert that input is really an SVG document
   - compute byte metrics
7. `pipeline.ts` is the canonical SVG transformation layer. Keep the canonical transform logic there.

## Guardrails

- Treat `/lab/svg` as a generic public SVG utility. Do not mix it with `/lab/icons` storage or internal icon-catalog behavior.
- The canonical pipeline is shared infrastructure. Be careful: changing `pipeline.ts` can affect both the optimizer and icons sync.
- App code must import UI only from `@/ui-kit`.
- Prefer official shadcn structure and composition patterns before inventing optimizer-specific wrappers.
- Treat `ui-kit` as the only shared project-level customization layer. Put shared optimizer UI policy there, not in usage-layer.
- Keep usage-layer classes limited to layout composition.
- Do not reintroduce separate `Single` and `Batch` product modes unless explicitly requested.
- Do not add manual optimization settings or expose raw SVGO tuning unless explicitly requested.
- Keep user-visible downloads based on optimized output. Do not leak internal source SVG from the icons pipeline into the generic optimizer UI.

## Common Tasks

### UI changes

- Most tool changes belong in `web/src/components/svg-optimizer-batch.tsx`.
- Keep the unified flow intact unless the user explicitly asks to change the product model.
- If a shared control pattern is missing, prefer adding the official shadcn component or recipe before introducing any custom wrapper.

### API changes

- Batch route work belongs in `web/src/app/api/svg/optimize-batch/route.ts`.
- Preserve partial-failure behavior unless the user explicitly wants a different contract.
- Keep request validation aligned with `web/src/lib/svg/upload.ts`.

### Pipeline changes

- `web/src/lib/svg/pipeline.ts` is the canonical transform layer.
- `web/src/lib/svg/optimize.ts` should stay a thin contract wrapper around validation, metrics, and pipeline execution.
- If a pipeline change affects icons sync behavior, stop and ask before proceeding.

### Naming and download changes

- Keep per-file optimized naming in `web/src/lib/svg/client.ts`.
- Keep duplicate-name disambiguation centralized there too.
- Do not duplicate naming logic inside the UI component.

## Known Pitfalls

- The rate limiter is in-memory and process-local. It is useful, but it is not a distributed production-grade guard.
- The batch API returns optimized SVG content inline in JSON. This is acceptable under current limits, but it is memory-heavy by design.
- The current route has no stronger timeout or total-work guard beyond request count/size limits and rate limiting.
- There is test coverage for pipeline behavior and naming helpers, but not a full integration test for the batch route.
- `pipeline.ts` is shared with icons sync. Seemingly local SVG cleanup changes may have cross-feature impact.

## Validation

- Web or UI changes: run `npm run check` in `web`.
- If you change naming helpers, keep `web/tests/svg-client.test.ts` green or replace it with equivalent coverage.
- If you change canonical transform logic, keep `web/tests/svg-pipeline.test.ts` green and review likely impact on icons sync.

## Stop And Ask

Stop and ask before proceeding if the request would:
- reintroduce separate single/batch product modes;
- expose internal icon-pipeline behavior inside the generic SVG tool;
- change the canonical pipeline in a way that may affect `/lab/icons`;
- materially raise upload limits without changing the current memory-heavy batch contract;
- turn the tool into a settings-heavy editor rather than a simple canonical optimizer.

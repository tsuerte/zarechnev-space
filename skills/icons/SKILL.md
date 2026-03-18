---
name: icons
description: Use when working on the /lab/icons feature in zarechnev-space, including the public icons catalog UI, local icon storage, Figma sync flow, or the canonical/source SVG boundary.
---

# Icons

## Overview

Use this skill when a task touches the `/lab/icons` catalog, the local icon storage/index, the Figma sync flow, or the public web contract for icon previews, detail payloads, and downloads.

Apply the repo rules first:
- Read `AGENTS.md` before acting.
- Read `web/ARCHITECTURE.md` before acting.
- If the task touches shared UI controls or `ui-kit`, also read `skills/shadcn/SKILL.md`.

## Source Of Truth

Primary files:
- `web/src/app/lab/icons/page.tsx`
- `web/src/app/lab/icons/actions.ts`
- `web/src/components/icons/icons-workspace.tsx`
- `web/src/components/icons/icons-toolbar.tsx`
- `web/src/components/icons/icons-grid.tsx`
- `web/src/components/icons/icon-card.tsx`
- `web/src/components/icons/icon-detail-panel.tsx`
- `web/src/lib/icons/config.ts`
- `web/src/lib/icons/storage.ts`
- `web/src/lib/icons/sync.ts`
- `web/src/lib/icons/types.ts`
- `web/scripts/icons-sync.ts`
- `web/src/lib/figma/client.ts`
- `web/data/icons/index.json`
- `web/data/icons/source/*`
- `web/data/icons/optimized/*`
- `web/tests/icons-types.test.ts`

## Current Feature Contract

- The page route is `/lab/icons`.
- `/lab/icons` is a public catalog of canonical icons, not a generic SVG uploader.
- Figma is the source of truth for icon source data.
- Local storage is file-based:
  - `web/data/icons/index.json`
  - `web/data/icons/source/*.svg`
  - `web/data/icons/optimized/*.svg`
- The public UI must expose canonical optimized SVG only.
- Source SVG is internal-only and must not leak into the public web contract.
- The detail panel may link back to the Figma source node, but it must not expose raw source SVG bytes.
- Manual upload is gone. Do not reintroduce it unless explicitly requested.

## Architecture And Data Flow

1. `icons-sync.ts` is the manual entrypoint for syncing the catalog from Figma.
2. `sync.ts` scans the configured Figma source, exports SVG variants, runs the canonical SVG pipeline, writes local files, and updates `index.json`.
3. `storage.ts` is the read/write boundary for local icon storage:
   - read catalog index
   - read public summaries
   - read public detail payload
   - write synced files and metadata
4. `page.tsx` loads public summaries and the first selected detail server-side.
5. `actions.ts` loads detail payloads for later selection changes.
6. `icons-workspace.tsx` is the client shell for search, selection, and detail loading.
7. `icon-detail-panel.tsx` is the public detail UI and download/copy surface.

## Guardrails

- Treat `/lab/icons` as a catalog of canonical outputs, not an editor or uploader.
- Do not leak `svgSource` into browser payloads, client props, server actions, or public DTOs.
- Keep the canonical/source separation intact:
  - source SVG stays on disk for sync internals
  - optimized SVG is the only public copy/download target
- App code must import UI only from `@/ui-kit`.
- Prefer usage-level changes for icon-catalog-specific UI.
- Use `ui-kit` only when the change is shared policy outside the icons catalog.
- Be careful with `pipeline.ts` changes: icons sync shares that canonical SVG pipeline with `/lab/svg`.

## Common Tasks

### UI changes

- Catalog UI changes usually belong in:
  - `web/src/components/icons/icons-workspace.tsx`
  - `web/src/components/icons/icons-toolbar.tsx`
  - `web/src/components/icons/icons-grid.tsx`
  - `web/src/components/icons/icon-detail-panel.tsx`
- Keep the public UI centered on canonical SVG, not source internals.

### Storage or DTO changes

- Public storage reads belong in `web/src/lib/icons/storage.ts`.
- Shared icon types and helpers belong in `web/src/lib/icons/types.ts`.
- If the web needs a new field, make sure it does not violate the source/canonical boundary.

### Sync changes

- Sync logic belongs in `web/src/lib/icons/sync.ts`.
- Figma env/config belongs in `web/src/lib/icons/config.ts`.
- Figma API access belongs in `web/src/lib/figma/client.ts`.
- Do not casually change sync semantics, orphan handling, or file naming without checking downstream impact.

### Download changes

- Keep public filename logic centralized in `web/src/lib/icons/types.ts`.
- Do not rebuild filename sanitation ad hoc inside UI components.

## Known Pitfalls

- `pipeline.ts` is shared with `/lab/svg`. A local SVG cleanup tweak may alter both features.
- The sync lock is file-based. If sync crashes mid-run, stale lock cleanup may still require manual attention.
- Sync writes files before metadata is rewritten, so storage-level changes need careful review.
- The catalog payload can get heavy because summaries load optimized preview SVG and detail views load optimized SVG per variant.
- Test coverage exists for helper logic, but not for the full sync/storage pipeline.

## Validation

- Web or UI changes: run `npm run check` in `web`.
- If you change icon helpers, keep `web/tests/icons-types.test.ts` green or replace it with equivalent coverage.
- If you change sync behavior or canonical SVG output, review likely impact on `/lab/svg` and the shared pipeline.

## Stop And Ask

Stop and ask before proceeding if the request would:
- expose raw source SVG in the public UI or client payloads;
- turn `/lab/icons` into a generic upload/optimizer tool;
- change the canonical/source download rule;
- materially change Figma sync semantics, orphan handling, or local storage layout;
- change the shared canonical SVG pipeline in a way that may affect `/lab/svg`.

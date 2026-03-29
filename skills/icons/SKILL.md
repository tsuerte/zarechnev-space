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
- `web/src/app/api/icons/[id]/route.ts`
- `web/src/components/icons/icons-workspace.tsx`
- `web/src/components/icons/icons-toolbar.tsx`
- `web/src/components/icons/icons-grid.tsx`
- `web/src/components/icons/icon-card.tsx`
- `web/src/components/icons/icon-detail-panel.tsx`
- `web/src/lib/icons/preview.ts`
- `web/src/lib/icons/config.ts`
- `web/src/lib/icons/storage.ts`
- `web/src/lib/icons/sync.ts`
- `web/src/lib/icons/types.ts`
- `web/scripts/icons-sync.ts`
- `web/src/lib/figma/client.ts`
- `web/src/ui-kit/slider.tsx`
- `web/data/icons/index.json`
- `web/data/icons/source/*`
- `web/data/icons/optimized/*`
- `web/tests/icons-types.test.ts`
- `web/tests/icons-preview.test.ts`

## Current Feature Contract

- The page route is `/lab/icons`.
- `/lab/icons` is a public catalog of canonical icons, not a generic SVG uploader.
- Figma is the source of truth for icon source data.
- Local storage is file-based:
  - `web/data/icons/index.json`
  - `web/data/icons/source/*.svg`
  - `web/data/icons/optimized/*.svg`
- The public UI defaults to canonical optimized SVG.
- Source SVG may be exposed only from the selected-icon detail surface as explicit raw copy/download/code-view actions.
- The page has preview-only controls for:
  - `size`
  - `strokeWidth`
  - `color`
- These controls change preview rendering only. They must not alter:
  - canonical stored SVG
  - raw source SVG
  - copy payloads
  - download payloads
- The detail panel may link back to the Figma source node and may expose raw source SVG bytes only for explicit raw actions.
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
5. `/api/icons/[id]` loads detail payloads for later selection changes.
6. `icons-workspace.tsx` is the client shell for search, selection, detail loading, and page-level preview state.
7. `icons-toolbar.tsx` owns the public preview controls surface for query, size, stroke width, and color.
8. `preview.ts` owns preview-only SVG transformation rules and preview control bounds.
9. `icons-grid.tsx` + `icon-card.tsx` render the catalog:
   - fixed `140x140` cards
   - inline SVG preview in the grid
10. `icon-detail-panel.tsx` is the public detail UI for:
   - canonical preview
   - canonical copy/download
   - raw source copy/download/code view

## Guardrails

- Treat `/lab/icons` as a catalog of canonical outputs, not an editor or uploader.
- Keep `svgSource` constrained to selected-icon detail payloads and explicit raw actions. Do not leak it into grid summaries, preview flows, or page-level list DTOs.
- Keep the canonical/source separation intact:
  - source SVG stays on disk for sync internals and detail-only raw actions
  - optimized SVG remains the default public preview/copy/download target
- Treat `size`, `strokeWidth`, and `color` as preview state only.
- Do not silently expand preview controls into "export customized icon" behavior unless explicitly requested.
- App code must import UI only from `@/ui-kit`.
- Prefer official shadcn composition patterns before inventing icon-catalog-specific wrappers.
- Treat `ui-kit` as the only shared project-level customization layer. Keep shared icon-catalog UI policy there, not in usage-layer or `components/ui`.
- Keep usage-layer classes limited to layout composition.
- Be careful with `pipeline.ts` changes: icons sync shares that canonical SVG pipeline with `/lab/svg`.

## Common Tasks

### UI changes

- Catalog UI changes usually belong in:
  - `web/src/components/icons/icons-workspace.tsx`
  - `web/src/components/icons/icons-toolbar.tsx`
  - `web/src/components/icons/icons-grid.tsx`
  - `web/src/components/icons/icon-detail-panel.tsx`
- Preview-only SVG transformation belongs in `web/src/lib/icons/preview.ts`.
- Keep the public UI centered on canonical SVG, not source internals.
- Grid preview currently renders inline SVG, not `<img>`. Do not regress that unless there is a clear reason.
- The catalog card model is currently:
  - fixed `140x140`
  - icon above label
  - preview size changes must not resize the card itself
- Raw source access belongs only in the selected-icon detail surface, not in the grid or toolbar.

### Storage or DTO changes

- Public storage reads belong in `web/src/lib/icons/storage.ts`.
- Shared icon types and helpers belong in `web/src/lib/icons/types.ts`.
- If the web needs a new field, keep raw source fields limited to detail-only DTOs unless the user explicitly asks to widen that boundary.

### Sync changes

- Sync logic belongs in `web/src/lib/icons/sync.ts`.
- Figma env/config belongs in `web/src/lib/icons/config.ts`.
- Figma API access belongs in `web/src/lib/figma/client.ts`.
- Do not casually change sync semantics, orphan handling, or file naming without checking downstream impact.

### Download changes

- Keep public filename logic centralized in `web/src/lib/icons/types.ts`.
- Do not rebuild filename sanitation ad hoc inside UI components.
- Preview customizations must not leak into copy/download unless the user explicitly asks for customized exports.
- If raw download/copy is exposed, keep it tied to the stored Figma source SVG, not a client-reconstructed approximation.

## Known Pitfalls

- `pipeline.ts` is shared with `/lab/svg`. A local SVG cleanup tweak may alter both features.
- The sync lock is file-based. If sync crashes mid-run, stale lock cleanup may still require manual attention.
- Sync writes files before metadata is rewritten, so storage-level changes need careful review.
- The catalog payload can get heavy because summaries load optimized preview SVG and detail views load optimized SVG per variant.
- The grid now uses inline SVG preview and the detail panel still uses image/data-url preview. Be explicit if you change that asymmetry.
- Preview controls can cause broad rerenders across the grid. Be careful with rendering strategy before adding more live controls.
- Test coverage exists for helper logic and preview helpers, but not for the full sync/storage pipeline.

## Validation

- Web or UI changes: run `npm run check` in `web`.
- If you change icon helpers, keep `web/tests/icons-types.test.ts` green or replace it with equivalent coverage.
- If you change preview helpers or preview control bounds, keep `web/tests/icons-preview.test.ts` green or replace it with equivalent coverage.
- If you change sync behavior or canonical SVG output, review likely impact on `/lab/svg` and the shared pipeline.

## Stop And Ask

Stop and ask before proceeding if the request would:
- move raw source SVG beyond the selected-icon detail surface or make it the default catalog payload;
- turn `/lab/icons` into a generic upload/optimizer tool;
- change the canonical/source download rule;
- materially change Figma sync semantics, orphan handling, or local storage layout;
- change the shared canonical SVG pipeline in a way that may affect `/lab/svg`.

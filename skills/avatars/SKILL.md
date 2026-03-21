---
name: avatars
description: Use when working on the /lab/avatars feature in zarechnev-space, including the Sanity avatar schema, avatars browser UI, full-pack ZIP download, or avatar revalidation.
---

# Avatars

## Overview

Use this skill when a task touches the `/lab/avatars` catalog, the `avatar` Sanity document type, the avatars download flow, or the web-side avatar DTO/query contract.

Apply the repo rules first:
- Read `AGENTS.md` before acting.
- Read `web/ARCHITECTURE.md` before acting.
- If the task touches shared UI controls or `ui-kit`, also read `skills/shadcn/SKILL.md`.

## Source Of Truth

Primary files:
- `web/src/app/lab/avatars/page.tsx`
- `web/src/components/avatars-browser.tsx`
- `web/src/app/api/avatars/download/route.ts`
- `web/src/lib/avatars/client.ts`
- `web/src/lib/avatars/file-name.ts`
- `web/src/lib/sanity/queries.ts`
- `web/src/lib/sanity/types.ts`
- `web/src/app/api/revalidate/route.ts`
- `studio/schemaTypes/avatarType.ts`

## Current Feature Contract

- The page route is `/lab/avatars`.
- Avatars come from published Sanity documents with `_type == "avatar"`.
- The page metadata currently describes the catalog as filtered by source and gender.
- The UI exposes exactly two filters:
  - `sourceType`: `all | freepik_ai | unsplash`
  - `gender`: `all | male | female`
- The filters affect only the visible grid.
- The download button currently downloads the full pack, not the filtered subset.
- Avatar previews in the grid are always circular.
- The old preview-shape toggle is gone and should not be reintroduced without an explicit request.
- The old `kind` / `self` model is gone and should not be reintroduced without an explicit request.

## Architecture And Data Flow

1. `page.tsx` is a server page. It fetches avatar list data from Sanity with `unstable_cache` and `revalidate = 300`.
2. `avatars-browser.tsx` is the client UI. It owns filter state and triggers ZIP download.
3. `client.ts` sends avatar ids to the same-origin route `/api/avatars/download`.
4. `route.ts` fetches the avatar records from Sanity again, downloads their image assets server-side, builds the ZIP with `JSZip`, and returns the archive.
5. `file-name.ts` owns archive naming and per-file naming. Keep naming logic there, not duplicated across client and server.
6. `/api/revalidate` must revalidate `/lab/avatars` for avatar changes.

## Guardrails

- App code must import UI only from `@/ui-kit`.
- Treat `web/src/components/ui/*` as the base shadcn layer. Do not change it for avatar work unless there is a separately justified primitive-level reason.
- Prefer official shadcn structure and composition patterns before inventing avatar-specific wrappers.
- Treat `ui-kit` as the only shared project-level customization layer. Put shared avatar-page UI policy there, not in usage-layer.
- Keep usage-layer classes limited to layout composition.
- Keep the web avatar DTO minimal. Do not pull extra Studio fields into web without a concrete UI or API need.
- Keep ZIP export server-side. Do not reintroduce browser-side direct asset fetching from `cdn.sanity.io`.
- Treat `sourceUrl` as Studio-side metadata unless the user explicitly wants it in the public web contract.

## Common Tasks

### UI changes

- Most avatar page changes belong in `web/src/components/avatars-browser.tsx`.
- If a shared control pattern is missing, prefer adding the official shadcn component or recipe before introducing any custom wrapper.

### Sanity model changes

- Schema changes belong in `studio/schemaTypes/avatarType.ts`.
- If the web needs new data, update both:
  - `web/src/lib/sanity/queries.ts`
  - `web/src/lib/sanity/types.ts`

### Download changes

- Keep the browser as a thin caller.
- Keep archive assembly in `web/src/app/api/avatars/download/route.ts`.
- Keep naming logic centralized in `web/src/lib/avatars/file-name.ts`.

### Revalidation changes

- Avatar content changes must continue to invalidate `/lab/avatars` through `web/src/app/api/revalidate/route.ts`.

## Known Pitfalls

- The download route currently limits requests to `200` avatar ids and rate-limits by client key. If the catalog grows near that size, revisit the export contract before making product promises about the full pack.
- There is test coverage for file naming, but not a full integration test for the download route. Be careful when changing API payload shape, ZIP headers, or remote fetch behavior.
- Images can render fine in `<Image>` while browser `fetch()` still fails because of CORS. That is why the export is server-side now.

## Validation

- Web or UI changes: run `npm run check` in `web`.
- Studio schema changes: run `npm run build` in `studio`.
- If you change archive naming, keep `web/src/lib/avatars/client.test.ts` green or replace it with equivalent coverage in the new helper/test location.

## Stop And Ask

Stop and ask before proceeding if the request would:
- change what the ZIP contains or whether it follows filters;
- expose `sourceUrl` or attribution in the public UI;
- reintroduce removed avatar taxonomy or filters;
- move avatar work into `components/ui`;
- change the catalog from a lightweight lab feature into a larger product surface with search, pagination, accounts, or asset management rules.

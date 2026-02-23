# zarechnev-space / web

Next.js frontend for portfolio website with Sanity as headless CMS.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run check
```

## Environment

Create `web/.env.local` with:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_REVALIDATE_SECRET=...
```

## UI Architecture

Read `web/ARCHITECTURE.md` before touching UI.

Short rule:

1. App code imports UI only from `@/ui-kit`.
2. `src/components/ui/*` is shadcn base.
3. Custom behavior goes to `src/ui-kit/*` wrappers.

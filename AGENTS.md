# Collaboration Rules

## Required Workflow (User Approval First)
For this repository, the assistant must follow this process on every task:

1. Restate understanding of the user's request.
2. Provide a concrete step-by-step plan.
3. Wait for explicit user approval.
4. Only after approval, run commands, edit files, commit, or push.

Without explicit user approval, no execution actions are allowed.

## Local Skills

- `avatars`: Use when a task touches `/lab/avatars`, the `avatar` Sanity model, avatar filters/UI, the avatar ZIP download flow, or avatar revalidation. Read `skills/avatars/SKILL.md` before planning or implementation. (file: `skills/avatars/SKILL.md`)
- `icons`: Use when a task touches `/lab/icons`, the public icons catalog UI, local icon storage, Figma sync, or the source/canonical SVG boundary. Read `skills/icons/SKILL.md` before planning or implementation. (file: `skills/icons/SKILL.md`)
- `svg-optimizer`: Use when a task touches `/lab/svg`, the SVG Optimizer UI, the batch optimize API, upload validation, paste flow, SVG ZIP/download behavior, or the canonical SVG pipeline. Read `skills/svg-optimizer/SKILL.md` before planning or implementation. (file: `skills/svg-optimizer/SKILL.md`)

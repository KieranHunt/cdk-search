# CDK Search

## Project

React + TypeScript single-page website. Built with Bun, styled with Tailwind CSS, using Radix UI primitives. Produces a standalone HTML file via `bun run build`.

## Development

- `bun run dev` — dev server with hot reload
- `bun run build` — production build (standalone HTML)
- `bun run check` — TypeScript type checking
- `bun run lint` — Biome lint + format check
- `bun run lint:fix` — auto-fix lint/format issues
- `bun run ci` — full pipeline: check + lint + build

## Git Workflow

- **Commit after each logical unit of work.** Don't batch up multiple unrelated changes. After completing a feature, fix, or meaningful step, create a commit with a concise message.
- A pre-commit hook (Lefthook) runs `biome check --write` on staged files automatically.
- Run `bun run ci` before pushing or when asked to verify everything works.

## Code Style

- Biome enforces formatting (tabs, double quotes, semicolons) and linting.
- TypeScript strict mode is enabled.
- Use `type="button"` on all `<button>` elements.
- Use `import type` for type-only imports.
- Avoid non-null assertions (`!`) — use explicit null checks instead.

# Repository Guidelines

## Project Structure & Module Organization
The Vite app lives in `src/`, organized by feature first. Place feature-specific logic under `src/modules/<feature>` (agents, campaigns, prompts). Shared UI belongs in `src/components`, while TypeScript models sit in `src/models`. Reusable helpers and hooks go to `src/utils` and `src/hooks`. Routing is centralized in `src/routes.tsx` and app shells in `src/App*.tsx`. Keep global styles in `src/styles` and static assets in `public`. Match new files to these patterns to keep discovery quick.

## Build, Test, and Development Commands
- `pnpm dev`: launch the Vite dev server with hot reloading.
- `pnpm build`: run TypeScript checks and emit the production bundle in `dist/`.
- `pnpm preview`: serve the built bundle locally via Vite’s preview server.
- `pnpm typecheck`: verify types without generating assets.
- `pnpm format` / `pnpm format:check`: apply or validate Prettier formatting.
- `pnpm lint:fix`: run the pre-commit pipeline (format + typecheck) on staged files.

## Coding Style & Naming Conventions
Formatting is enforced by Prettier (tabs, width 2, single quotes, semicolons, trailing commas where ES5 allows). Keep files ASCII unless the domain requires otherwise. Use PascalCase for React components and models (`AgentConfiguration.tsx`), camelCase for hooks/utilities (`useScrollEffect.ts`), and co-locate CSS Modules as `Component.module.css`. Export module barrels via `index.ts` to simplify imports.

## Testing Guidelines
Adopt Vitest with `@testing-library/react` for new coverage. Store tests beside the implementation (`ComponentName.test.tsx`, `utils.test.ts`). Focus on business logic and hook behavior; use snapshots sparingly. Run suites with `vitest` (or `pnpm test` once added) and include `pnpm typecheck` before submitting.

## Commit & Pull Request Guidelines
Write commits in the imperative mood (`Add scheduler preview`). Branch names follow `feature/NT-####-short-desc` or `fix/NT-####-short-desc`. Every PR needs a clear summary, linked ticket (`NT-####`), before/after UI screenshots when relevant, and notes about env or migrations. Ensure the diff passes `pnpm typecheck` and formatting hooks before requesting review.

## Security & Configuration Tips
Expose runtime configuration through `VITE_`-prefixed env variables (`VITE_APP_API_URL`). Never commit secrets or `.env*` files. When containerizing, pass envs via Docker `--build-arg` and use `docker build -t n-ai --build-arg VITE_APP_API_URL=https://api.example.com .`, then `docker run -p 8080:80 n-ai`.

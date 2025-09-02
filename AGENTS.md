 # Repository Guidelines
 
 ## Project Structure & Module Organization
 - `src/modules/*`: Feature modules (e.g., agents, campaigns, prompts).
 - `src/components/*`: Reusable UI components.
 - `src/models/*`: TypeScript models and types.
 - `src/utils/*`, `src/hooks/*`: Shared utilities and hooks.
 - `src/routes.tsx`, `src/App*.tsx`: App entry and routing.
 - `src/styles/*`, `public/`: Global styles and static assets.
 - Config: `vite.config.ts`, `tsconfig*.json`, `.prettierrc.json`.
 
 ## Build, Test, and Development Commands
 - `pnpm dev` (or `npm run dev`): Start Vite dev server.
 - `pnpm build` (or `npm run build`): Type-check and produce `dist/`.
 - `pnpm preview` (or `npm run preview`): Serve the built app locally.
 - `pnpm typecheck`: Run TypeScript without emit.
 - `pnpm format` / `pnpm format:check`: Apply or verify Prettier formatting.
 - `pnpm lint:fix`: Format and type-check staged changes.
 
 Docker
 - Build: `docker build -t n-ai --build-arg VITE_APP_API_URL=https://api.example.com .`
 - Run: `docker run -p 8080:80 n-ai` (serves SPA via Nginx).
 
 ## Coding Style & Naming Conventions
 - Formatter: Prettier (enforced via Husky + lint-staged).
 - Indentation: Tabs; width 2; LF endings; semicolons; single quotes; trailing commas (ES5).
 - React components, models: PascalCase (`AgentConfiguration.tsx`, `ContactModel.ts`).
 - Hooks/utils: camelCase (`useScrollEffect.ts`, `stringUtils.ts`).
 - Styles: CSS Modules `*.module.css`; colocate with component when practical.
 - Barrels: `index.ts` for module exports.
 
 ## Testing Guidelines
 - Currently no tests. Prefer Vitest + @testing-library/react for new code.
 - Place tests next to code: `ComponentName.test.tsx` or `utils.test.ts`.
 - Aim for meaningful coverage on business logic and hooks; snapshot UI sparingly.
 - Run with `vitest` once added; include `pnpm typecheck` in your workflow.
 
 ## Commit & Pull Request Guidelines
 - Commits: Short, imperative summaries (e.g., "Add scheduler preview").
 - Pre-commit runs `prettier` on staged files; ensure clean `pnpm typecheck`.
 - PRs must include: clear description, linked issue/ID (e.g., `NT-####`), before/after screenshots for UI, and any env or migration notes.
 - Branch names: `feature/NT-####-short-desc`, `fix/NT-####-short-desc`.
 
 ## Security & Configuration Tips
 - Env: Use `VITE_`-prefixed vars; example `VITE_APP_API_URL` (exposed at build time).
 - Never commit secrets; keep `.env*` local. When containerizing, pass via `--build-arg`.

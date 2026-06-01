# Testing

Only add tests when explicitly requested.

## Stack

- Vitest + React Testing Library
- Target one file or one test case by default — do not run the full suite while debugging.

```bash
npx vitest src/components/UserCard/UserCard.test.tsx
npx vitest -t "renders submit button"
```

## Conventions

- Use `renderWithProviders` from `src/test-utils/renderWithProviders`.
- Do not mock `react-i18next` in component tests.
- Assert translated user-visible text, not translation keys.
- If a component uses `usePermissions`, mock it consistently.

## Commands

- `npm run test` — full test run with coverage
- `npm run coverage` — coverage-focused run

# Routing Rules

`src/routes.tsx` is the source of truth.

- Do not create custom routing outside React Router v7.
- Every new route must define an explicit `id`.
- Route `id` style is hybrid current: `users`, `do-not-call`, `campaign.detail`.
- Use `ModuleGuard` for protected screens.
- Use `permission` and/or `masterOnly` in `ModuleGuard` when required by access policy.
- Keep route-level permission logic in guards, not inline in page components.
- Use lazy loading for route pages (`React.lazy`) wrapped with `Suspense` + `SuspenseFallback`.
- Use nested `children` routes and `Navigate` for default child redirects when needed.
- Use `I18nNamespaceLoader` for routes that depend on route-based namespace loading.

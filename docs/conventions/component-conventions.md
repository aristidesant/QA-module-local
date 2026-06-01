# Component Conventions

## File/Folder Pattern (required)

Each reusable component must use folder colocation and barrel export:

```
ComponentName/
  ComponentName.tsx
  ComponentName.module.css
  index.ts
```

`index.ts` must export:

```ts
export { default } from './ComponentName';
```

## Naming

- PascalCase for component files: `UserCard.tsx`
- Colocated helpers when needed:
  - `ComponentName.helpers.ts`
  - `ComponentName.types.ts`
  - `ComponentName.constants.ts`

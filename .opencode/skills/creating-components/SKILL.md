---
name: creating-components
description: Rules for creating React components using the Component Folder Pattern with Colocation and Barrel Exports, including required file naming conventions.
---

Use this skill whenever you create a new component or split an existing component.

## Required Pattern

Pattern name: **Component Folder Pattern with Colocation + Barrel Exports**

Every component must be created in its own folder, with related files colocated.

## Required File Naming Conventions

For a component named `ComponentName`, use:

- `ComponentName.tsx` for the main component
- `ComponentName.module.css` for styles (CSS Modules)
- `ComponentName.helper.ts` or `ComponentName.helpers.ts` for helpers
- `ComponentName.types.ts` for local types
- `ComponentName.constants.ts` for constants
- `index.ts` for barrel export

## Required Folder Structure

```text
ComponentName/
  ComponentName.tsx
  ComponentName.module.css
  ComponentName.helper.ts
  ComponentName.types.ts
  ComponentName.constants.ts
  index.ts
```

Only include files that are actually needed, but keep the naming convention exactly as defined.

## Required Barrel Export

Every component folder must include an `index.ts` file with:

```ts
export { default } from './ComponentName';
```

## Implementation Rules

- Keep code and comments in English.
- Prefer Mantine components and existing project conventions.
- Do not create tests unless explicitly requested.
- Keep helper/types/constants files colocated with the component when they are specific to that component.

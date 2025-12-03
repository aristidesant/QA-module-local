# Project Instructions

## ⚠️ CRITICAL: Language Rule

**ALWAYS write code and comments in English.** Even if the user writes in Spanish or another language, your code and comments MUST be in English. No exceptions.

---

## 🎨 DESIGN IS TOP PRIORITY

> **You are building a beautiful, modern web application. Every screen you create must look stunning and professional.**

### What "Beautiful Design" Means

1. **Clean and Simple**: Use flat design. NO shadows, NO gradients, NO 3D effects.
2. **Well Organized**: Good spacing between elements. Text is easy to read. Everything is aligned.
3. **Modern Look**: Like top SaaS apps (Notion, Linear, Stripe). Polished, not ugly or basic.
4. **Ready for Users**: Every screen should look like a final product, not a rough draft.

### Design Checklist (Follow This)

- ✅ Use plenty of white space (empty space between elements)
- ✅ Keep text sizes consistent (headings big, body text smaller)
- ✅ Align elements in a grid pattern
- ✅ Use subtle color accents to highlight important items
- ✅ Make buttons and links obvious and easy to click
- ✅ Show loading states and error messages clearly
- ✅ Use light mode (white/light backgrounds) by default

### Size & Spacing Rules (IMPORTANT)

- ✅ **Use small font sizes** - prefer `size="sm"` for Text components
- ✅ **Use smaller component variants** - prefer `size="sm"` for Button, Input, Select, etc.
- ✅ **Default gap is `xs`** - use `var(--mantine-spacing-xs)` or `gap="xs"` between elements
- ✅ **Compact layouts** - use `--mantine-spacing-xs` for padding/margin when possible
- ✅ For Stack/Group components, default to `gap="xs"`
- ✅ For tables, use compact row heights with small text

### What to AVOID

- ❌ Crowded layouts with too many elements
- ❌ Inconsistent spacing or random alignment
- ❌ Ugly default browser styles
- ❌ Missing hover states on clickable items
- ❌ Placeholder text like "Lorem ipsum" in final code
- ❌ Generic or boring designs

---

## Tech Stack (What Tools to Use)

| Purpose          | Tool                              |
| ---------------- | --------------------------------- |
| Routing          | React Router v7 (client-side SPA) |
| Build            | Vite with TypeScript              |
| UI Components    | Mantine v8                        |
| Data Fetching    | TanStack React Query              |
| State Management | Zustand                           |
| HTTP Requests    | Axios                             |
| Icons            | @tabler/icons-react               |
| Authentication   | JWT with secure cookies           |

---

## Project Folders

All code lives in `src/`:

```
src/
├── api/          # Functions that call the backend API
├── components/   # Reusable UI pieces (buttons, cards, etc.)
├── modules/      # Feature code (agents, campaigns, etc.)
├── queries/      # React Query hooks for data fetching
├── routes/       # Page components for each URL
├── stores/       # Zustand state stores
├── models/       # TypeScript types and interfaces
├── hooks/        # Custom React hooks
├── utils/        # Helper functions
└── styles/       # Global CSS
```

---

## How to Write Components

### File Naming

- Use **PascalCase** for component files: `UserCard.tsx`, `CampaignList.tsx`
- For each .tsx component, create a test.
- For each .ts file of API, queries or hooks, add a **tests** folder in the same location of the file to be added the test.
- File should be name as the component file .test.tsx or .test.ts

### Folder Structure

Each component gets its own folder:

```
components/
└── UserCard/
    ├── UserCard.tsx        # Main component code
    ├── UserCard.module.css # Styles for this component
    └── index.ts            # Export file
```

The `index.ts` file must contain:

```ts
export { default } from './UserCard';
```

### Creating New Components

- Put new components in `src/components/` (for reusable ones)
- Put page-specific components in the same folder as the page
- When you split a big component into smaller pieces, keep them in the same folder

---

## Styling Rules

### Use Mantine v8

- **Always use Mantine components** (Button, Card, Text, Stack, Group, etc.)
- Check the latest Mantine v8 docs if unsure about a component

### Use CSS Modules

- Put styles in `.module.css` files (example: `UserCard.module.css`)
- Use Mantine's CSS variables: `var(--mantine-color-blue-6)`, `var(--mantine-spacing-md)`
- Do NOT use inline styles unless absolutely necessary

### Icons

- Use icons from `@tabler/icons-react`
- Example: `import { IconUser } from '@tabler/icons-react';`

---

## Tables and Lists

- **Always use `BaseTable`** from `src/components/BaseTable/BaseTable`
- This is a pre-built table component using TanStack Table + Mantine
- Put column definitions in separate files with hooks like `useUsersTableColumns`

---

## Data and Forms

### Fetching Data

- Use **TanStack React Query** for all API calls
- Use React Router loaders when they fit better

### Forms

- Use **Mantine Form** for form handling
- Validate inputs and show clear error messages

### API Calls

- Use **Axios** for HTTP requests
- Put API functions in `src/api/` organized by feature

---

## State Management

- Use **Zustand** for global state
- Keep stores in `src/stores/`
- Keep feature logic in `src/modules/`

---

## TypeScript Rules

- Use **strict TypeScript** settings
- Use `~/` for imports (points to `src/`)
- Put all types in `src/models/`
- **Never use `any`** - always define proper types

---

## Routing

- Use **React Router v7** - do not create custom routing
- Use loaders and actions for data fetching when it makes sense
- Put route components in `src/routes/`

---

## Commands

| Command             | What It Does                   |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start dev server on port 8080  |
| `npm run build`     | Build for production           |
| `npm run start`     | Run production build           |
| `npm run typecheck` | Check TypeScript types         |
| `npm run test`      | Run tests                      |
| `npm run coverage`  | Run tests with coverage report |

---

## Testing

### Tools

- **Vitest** for running tests
- **React Testing Library** for component tests

### Test File Rules

- Put test files next to the component: `UserCard.test.tsx`
- **One test file per component** (not multiple test files)
- When asked to increase coverage of a test, run the coverage for that file/folder only, do not run full coverage unless user asks for it.
- IMPORTANT!!, WHEN DEBUGGING TESTS, DO NOT RUN FULL TEST OF THE PROJECT, JUST RUN WHAT YOU ARE TRYING TO DEBUG.

### How to Write Tests

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Always use renderWithProviders, not render
```

### Mocking

- Use `vi` from vitest for mocks
- Mock API calls and router hooks when needed

---

## Environment Variables

| Variable             | Purpose                |
| -------------------- | ---------------------- |
| `API_URL`            | Backend API URL        |
| `SESSION_SECRET_KEY` | Session encryption key |

---

## Quick Reference

### Do This ✅

- Write beautiful, clean UI
- Use Mantine v8 components
- Use CSS modules for styles
- Use React Query for data
- Use Zustand for state
- Write code in English
- Follow the folder structure

### Don't Do This ❌

- Create ugly or basic designs
- Use shadows or gradients
- Write inline styles
- Use `any` in TypeScript
- Write code in Spanish
- Skip loading/error states

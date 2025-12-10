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
- ✅ Keep hover states stable: change color or opacity, but never move, resize, or shift elements on hover

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
- For each .tsx or .ts component, create a test.
- File should be name as the component file .test.tsx or .test.ts

### Folder Structure

Each component gets its own folder:

```
components/
└── UserCard/
    ├── UserCard.tsx        # Main component code
    ├── UserCard.test.tsx   # Styles for this component
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
- Use `SectionCard` from `src/components/SectionCard` for any form or page sections; avoid custom card wrappers so layouts stay consistent

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
- When asked to increase coverage of a test, **only** run coverage for that specific test file (or, in rare cases, a single small folder if explicitly requested). **Do NOT** run global coverage unless the user clearly asks for a full report.
- Default behavior: **Tests must be run one file at a time.** Always target a single test file (for example, `vitest src/components/UserCard/UserCard.test.tsx`) instead of running the full suite.
- IMPORTANT: When debugging tests, ALWAYS run only the specific test file or a single test case relevant to your change. Do NOT run the entire test suite by default. Use targeted commands like `vitest path/to/testfile` or `vitest -t "test name"` to focus on a single file or test.

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

- Avoid `vi.mock` hoisting pitfalls: when using `vi.mock` with a factory, do not reference local variables declared later in the file because the factory runs during hoisting and will trigger TDZ errors. Instead, create `vi.fn()` inside the factory or mock the module and then use the imported mock to configure return values in tests.

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

---

## Permission Architecture (Front-End Usage)

- Determine the active client from `targetClient` (impersonation) or the user's own client.
- Build permission maps only from roles that belong to the active client; merge permissions per module.
- Treat `MANAGE` as elevated permission that grants full access for its module.
- Use `usePermissions` hook helpers for all UI checks:
  - `canAccessModule(module)` to decide nav visibility or route access.
  - `canPerformAction(module, permission)` for specific actions.
  - `hasAnyPermission(module, [permA, permB])` or `hasAllPermissions(module, [permA, permB])` for grouped checks.
- Never bypass these helpers; keep permission evaluation unified and deterministic.

## Hooks Discipline

- Always call React hooks unconditionally and before any early returns; do not place hooks after conditional returns or inside branches/loops.
- When adding permission checks with `usePermissions`, declare the hook alongside other hooks at the top of the component to keep call order stable.

---

## Standard Modal & Form Layouts

When building complex forms or configuration modals, follow this standard layout pattern:

### Structure (2-Column Grid)

- **Container**: Use `ModalBody` from `src/components/ModalMenu` to enforce the standard 2-column grid (`220px 1fr`).
- **Background**: Use `var(--mantine-color-gray-0)` for the main container background.
- **Panels**: Both the sidebar (menu) and content area should be white panels with:
  - `border: 1px solid var(--mantine-color-gray-2)`
  - `border-radius: var(--mantine-radius-sm)`
  - `background: var(--mantine-color-white)`

### Sidebar Menu Style

- **Component**: Use `ModalMenu` from `src/components/ModalMenu`.
- **Props**:
  - `items`: Array of `{ id, label, icon }`
  - `activeId`: Current active section ID
  - `onSelect`: Callback to change section
- **Style**: The component handles all standard styling (hover states, active states, typography).

### Content Area

- **Header**: Title (`fw={600}`, `size="sm"`) + Status Badge (if applicable).
- **Separator**: `border-bottom: 1px solid var(--mantine-color-gray-1)`.
- **Body**: Padding `sm` or `md`.

### Footer

- **Location**: Fixed at the bottom of the container.
- **Style**: `border-top: 1px solid var(--mantine-color-gray-1)`, `bg="white"`.
- **Actions**: Right-aligned primary actions (Save), Left-aligned secondary (Cancel).
